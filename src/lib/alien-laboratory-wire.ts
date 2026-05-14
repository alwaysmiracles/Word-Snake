'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// ALIEN LABORATORY — SCI-FI ALIEN RESEARCH LAB MODULE
// ═══════════════════════════════════════════════════════════════════════════

// ─── Rarity System ─────────────────────────────────────────────────────────

export const AL_RARITY_TIERS = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
] as const;

export type ALRarity = (typeof AL_RARITY_TIERS)[number];

export const AL_RARITY_COLORS: Record<ALRarity, string> = {
  common: '#39ff14',
  uncommon: '#00e5ff',
  rare: '#bf5fff',
  epic: '#ff00ff',
  legendary: '#ffd700',
};

export const AL_RARITY_MULTIPLIER: Record<ALRarity, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2.5,
  epic: 4,
  legendary: 7,
};

export const AL_RARITY_LABELS: Record<ALRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

// ─── Progression Constants ─────────────────────────────────────────────────

export const AL_MAX_LEVEL = 50;

export const AL_XP_PER_LEVEL = 500;

export const AL_BASE_CREDITS = 100;

export const AL_CREDITS_PER_LEVEL = 50;

export const AL_MAX_LOG_ENTRIES = 200;

export const AL_SPECIMEN_INVENTORY_LIMIT = 40;

export const AL_DAILY_CREDIT_BONUS = 25;

export const AL_ANOMALY_REFRESH_HOURS = 24;

// ─── 30 Alien Species (5 Rarity Tiers) ────────────────────────────────────

export const AL_SPECIES_TYPES = [
  // Common (2)
  { id: 'grey', name: 'Grey', rarity: 'common' as ALRarity, origin: 'Zeta Reticuli', threat: 2, description: 'Small grey-skinned beings with large black eyes, known for abduction reports and hybridization programs.', baseHP: 40, baseIntelligence: 85, basePsionics: 90 },
  { id: 'zeta_reticulan', name: 'Zeta Reticulan', rarity: 'common' as ALRarity, origin: 'Zeta Reticuli', threat: 2, description: 'Classic small greys, worker class beings serving higher species hierarchies throughout the galaxy.', baseHP: 35, baseIntelligence: 80, basePsionics: 85 },
  // Uncommon (5)
  { id: 'reptilian', name: 'Reptilian', rarity: 'uncommon' as ALRarity, origin: 'Alpha Draconis', threat: 6, description: 'Tall reptilian humanoids with slit pupils and scaled skin, rumored shape-shifters infiltrating governments.', baseHP: 120, baseIntelligence: 70, basePsionics: 60 },
  { id: 'nordic', name: 'Nordics', rarity: 'uncommon' as ALRarity, origin: 'Pleiades Cluster', threat: 1, description: 'Tall, blonde, blue-eyed human-like beings who act as benevolent watchers guiding human evolution.', baseHP: 90, baseIntelligence: 95, basePsionics: 80 },
  { id: 'pleiadian', name: 'Pleiadian', rarity: 'uncommon' as ALRarity, origin: 'Pleiades', threat: 1, description: 'Compassionate human-like beings focused on spiritual evolution of the galaxy and cosmic consciousness.', baseHP: 85, baseIntelligence: 90, basePsionics: 85 },
  { id: 'sirian', name: 'Sirian', rarity: 'uncommon' as ALRarity, origin: 'Sirius B', threat: 3, description: 'Aquatic-amphibious beings who built ancient underwater civilizations on Earth in prehistoric times.', baseHP: 100, baseIntelligence: 82, basePsionics: 78 },
  { id: 'vegan', name: 'Vegan', rarity: 'uncommon' as ALRarity, origin: 'Vega System', threat: 2, description: 'Dark-skinned beings from Vega, early genetic pioneers who seeded humanoid life across the galaxy.', baseHP: 95, baseIntelligence: 86, basePsionics: 74 },
  // Rare (11)
  { id: 'tall_white', name: 'Tall Whites', rarity: 'rare' as ALRarity, origin: 'Unknown', threat: 5, description: 'Extremely tall, pale beings reported near military installations, possessing advanced propulsion technology.', baseHP: 110, baseIntelligence: 88, basePsionics: 75 },
  { id: 'mantis', name: 'Mantis', rarity: 'rare' as ALRarity, origin: 'Antares System', threat: 7, description: 'Insectoid beings with praying mantis features, often seen overseeing other species as coordinators.', baseHP: 95, baseIntelligence: 92, basePsionics: 95 },
  { id: 'arcturian', name: 'Arcturian', rarity: 'rare' as ALRarity, origin: 'Arcturus System', threat: 2, description: 'Elderly-looking blue-skinned beings renowned for their healing abilities and crystal technology.', baseHP: 70, baseIntelligence: 99, basePsionics: 92 },
  { id: 'andromedan', name: 'Andromedan', rarity: 'rare' as ALRarity, origin: 'Andromeda Galaxy', threat: 3, description: 'Tall, slender beings from the Andromeda galaxy with deep cosmic knowledge and no need for spacecraft.', baseHP: 80, baseIntelligence: 96, basePsionics: 88 },
  { id: 'lyran', name: 'Lyran', rarity: 'rare' as ALRarity, origin: 'Lyra System', threat: 4, description: 'Feline humanoid beings, ancient genetic engineers and galactic historians predating most civilizations.', baseHP: 130, baseIntelligence: 88, basePsionics: 82 },
  { id: 'centaurian', name: 'Centaurian', rarity: 'rare' as ALRarity, origin: 'Alpha Centauri', threat: 3, description: 'Beings from our nearest stellar neighbor with advanced terraforming and atmospheric engineering technology.', baseHP: 105, baseIntelligence: 91, basePsionics: 80 },
  { id: 'procyonan', name: 'Procyonan', rarity: 'rare' as ALRarity, origin: 'Procyon System', threat: 3, description: 'Crystalline beings who communicate through harmonic frequency patterns and resonate with crystal lattices.', baseHP: 60, baseIntelligence: 97, basePsionics: 94 },
  { id: 'mintakan', name: 'Mintakan', rarity: 'rare' as ALRarity, origin: 'Mintaka (Orion Belt)', threat: 3, description: 'Water-based beings who carry the genetic memory of ancient Earth and Atlantean civilization.', baseHP: 75, baseIntelligence: 93, basePsionics: 86 },
  { id: 'essassani', name: 'Essassani', rarity: 'rare' as ALRarity, origin: 'Essassani', threat: 2, description: 'Hybrid beings from a reality between dimensions, peaceful, contemplative, and telepathically gifted.', baseHP: 65, baseIntelligence: 94, basePsionics: 97 },
  { id: 'sassani', name: 'Sassani', rarity: 'rare' as ALRarity, origin: 'Sassani System', threat: 4, description: 'Future-human hybrids from 3000+ years in our future who travel back in time to assist humanity.', baseHP: 90, baseIntelligence: 95, basePsionics: 83 },
  { id: 'yahyel', name: 'Yahyel', rarity: 'rare' as ALRarity, origin: 'Unknown', threat: 1, description: 'The first species planned for open contact with humanity, gentle, musical, and deeply empathic.', baseHP: 78, baseIntelligence: 91, basePsionics: 88 },
  // Epic (5)
  { id: 'draco', name: 'Draco', rarity: 'epic' as ALRarity, origin: 'Alpha Draconis Prime', threat: 9, description: 'Reptilian royalty, winged beings with immense psionic power and ancient claims to galactic dominion.', baseHP: 200, baseIntelligence: 80, basePsionics: 98 },
  { id: 'blue_avian', name: 'Blue Avian', rarity: 'epic' as ALRarity, origin: '6th Density', threat: 5, description: 'Higher-density avian beings who act as emissaries of the Sphere Being Alliance protecting free will.', baseHP: 150, baseIntelligence: 99, basePsionics: 99 },
  { id: 'golden_being', name: 'Golden Being', rarity: 'epic' as ALRarity, origin: '7th Density', threat: 6, description: 'Luminous beings of pure golden light, ambassadors from higher densities of pure love and wisdom.', baseHP: 180, baseIntelligence: 100, basePsionics: 100 },
  { id: 'crystal_entity', name: 'Crystal Entity', rarity: 'epic' as ALRarity, origin: 'Interdimensional', threat: 7, description: 'Living crystalline structures that store eons of cosmic memory and vibrate with universal truth.', baseHP: 200, baseIntelligence: 95, basePsionics: 96 },
  { id: 'plasma_form', name: 'Plasma Form', rarity: 'epic' as ALRarity, origin: 'Solar Core', threat: 8, description: 'Beings composed of stellar plasma, capable of surviving inside stars and manipulating solar energy.', baseHP: 250, baseIntelligence: 88, basePsionics: 92 },
  // Legendary (5)
  { id: 'dark_matter_being', name: 'Dark Matter Being', rarity: 'legendary' as ALRarity, origin: 'Dark Sector', threat: 9, description: 'Entities formed from dark matter, invisible to most sensors and detection methods across all spectrums.', baseHP: 300, baseIntelligence: 90, basePsionics: 98 },
  { id: 'quantum_entity', name: 'Quantum Entity', rarity: 'legendary' as ALRarity, origin: 'Quantum Realm', threat: 10, description: 'Beings that exist in superposition, capable of being in multiple places and states simultaneously.', baseHP: 280, baseIntelligence: 99, basePsionics: 99 },
  { id: 'void_walker', name: 'Void Walker', rarity: 'legendary' as ALRarity, origin: 'The Void', threat: 10, description: 'Ancient entities that traverse the space between galaxies and dimensions beyond normal space-time.', baseHP: 350, baseIntelligence: 92, basePsionics: 100 },
  { id: 'star_seed', name: 'Star Seed', rarity: 'legendary' as ALRarity, origin: 'Galactic Core', threat: 8, description: 'Embodiments of stellar energy containing the birth-code of new stars and galactic creation.', baseHP: 220, baseIntelligence: 96, basePsionics: 97 },
  { id: 'cosmic_consciousness', name: 'Cosmic Consciousness', rarity: 'legendary' as ALRarity, origin: 'Source', threat: 10, description: 'Pure consciousness manifesting as a being, the rarest and most powerful entity in the known universe.', baseHP: 400, baseIntelligence: 100, basePsionics: 100 },
  // Additional species (Alpha Centaurian, Tau Cetian) — already listed above
  { id: 'alpha_centaurian', name: 'Alpha Centaurian', rarity: 'uncommon' as ALRarity, origin: 'Alpha Centauri A', threat: 2, description: 'Human-like settlers from Alpha Centauri with sophisticated social structures and diplomatic technology.', baseHP: 88, baseIntelligence: 84, basePsionics: 72 },
  { id: 'tau_cetian', name: 'Tau Cetian', rarity: 'uncommon' as ALRarity, origin: 'Tau Ceti', threat: 2, description: 'Beings from Tau Ceti who specialize in holographic and projection technology for communication.', baseHP: 82, baseIntelligence: 89, basePsionics: 70 },
] as const;

// ─── 8 Lab Rooms ──────────────────────────────────────────────────────────

export const AL_LAB_ROOMS = [
  {
    id: 'observation_chamber',
    name: 'Observation Chamber',
    description: 'Monitor and study alien species behavior in a controlled, transparent environment.',
    unlockLevel: 1,
    upgradeCost: 0,
    capacity: 5,
    bonuses: { researchSpeed: 1.0, containmentStrength: 1.0, anomalyChance: 0.05 },
    icon: '👁️',
  },
  {
    id: 'dissection_room',
    name: 'Dissection Room',
    description: 'Carefully examine specimens to understand biological structures, physiology, and internal organs.',
    unlockLevel: 3,
    upgradeCost: 200,
    capacity: 3,
    bonuses: { researchSpeed: 1.2, containmentStrength: 0.8, anomalyChance: 0.08 },
    icon: '🔬',
  },
  {
    id: 'dna_lab',
    name: 'DNA Lab',
    description: 'Sequence, splice, and engineer alien genetic material for groundbreaking research.',
    unlockLevel: 5,
    upgradeCost: 500,
    capacity: 4,
    bonuses: { researchSpeed: 1.5, containmentStrength: 1.0, anomalyChance: 0.1 },
    icon: '🧬',
  },
  {
    id: 'cloning_bay',
    name: 'Cloning Bay',
    description: 'Create copies of alien specimens for expanded research and specimen collection programs.',
    unlockLevel: 8,
    upgradeCost: 800,
    capacity: 6,
    bonuses: { researchSpeed: 1.1, containmentStrength: 1.1, anomalyChance: 0.12 },
    icon: '🫧',
  },
  {
    id: 'containment_zone',
    name: 'Containment Zone',
    description: 'High-security area for housing dangerous and high-threat alien specimens safely.',
    unlockLevel: 12,
    upgradeCost: 1500,
    capacity: 8,
    bonuses: { researchSpeed: 0.9, containmentStrength: 2.0, anomalyChance: 0.15 },
    icon: '🔒',
  },
  {
    id: 'teleportation_lab',
    name: 'Teleportation Lab',
    description: 'Study alien teleportation technology and develop faster-than-light travel methods.',
    unlockLevel: 18,
    upgradeCost: 3000,
    capacity: 2,
    bonuses: { researchSpeed: 1.8, containmentStrength: 0.7, anomalyChance: 0.2 },
    icon: '🌀',
  },
  {
    id: 'warp_chamber',
    name: 'Warp Chamber',
    description: 'Experimental room for studying warp drives and space-time manipulation technologies.',
    unlockLevel: 25,
    upgradeCost: 6000,
    capacity: 3,
    bonuses: { researchSpeed: 2.0, containmentStrength: 0.6, anomalyChance: 0.25 },
    icon: '🕳️',
  },
  {
    id: 'quantum_forge',
    name: 'Quantum Forge',
    description: 'The pinnacle of alien technology research, capable of quantum-level material manipulation.',
    unlockLevel: 35,
    upgradeCost: 12000,
    capacity: 4,
    bonuses: { researchSpeed: 2.5, containmentStrength: 1.5, anomalyChance: 0.3 },
    icon: '⚛️',
  },
] as const;

// ─── 28 Technologies ──────────────────────────────────────────────────────

export const AL_TECHNOLOGIES = [
  { id: 'neural_interface', name: 'Neural Interface', description: 'Direct brain-computer link for specimen communication.', cost: 150, requiredLevel: 1, researchTime: 30, effect: { communicationBonus: 0.2 } },
  { id: 'alien_linguistics', name: 'Alien Linguistics', description: 'Decipher and translate alien languages and symbol systems.', cost: 180, requiredLevel: 2, researchTime: 40, effect: { communicationBonus: 0.15 } },
  { id: 'bio_scanner', name: 'Bio-Scanner Array', description: 'Advanced scanning suite for biological analysis.', cost: 200, requiredLevel: 2, researchTime: 45, effect: { researchSpeedBonus: 0.15 } },
  { id: 'force_fields', name: 'Force Fields', description: 'Energy barriers for specimen containment.', cost: 350, requiredLevel: 4, researchTime: 60, effect: { containmentBonus: 0.3 } },
  { id: 'gene_splicer', name: 'Gene Splicer', description: 'Precision tool for alien DNA manipulation.', cost: 500, requiredLevel: 5, researchTime: 90, effect: { researchSpeedBonus: 0.25 } },
  { id: 'psi_dampener', name: 'Psi Dampener', description: 'Device to suppress specimen psionic abilities.', cost: 400, requiredLevel: 6, researchTime: 75, effect: { containmentBonus: 0.2, psionicsReduction: 0.3 } },
  { id: 'stasis_chamber', name: 'Stasis Chamber', description: 'Suspends biological processes for safe storage.', cost: 600, requiredLevel: 7, researchTime: 120, effect: { storageCapacityBonus: 10 } },
  { id: 'anti_gravity', name: 'Anti-Gravity Engine', description: 'Nullify gravitational forces for zero-G specimen handling.', cost: 550, requiredLevel: 8, researchTime: 100, effect: { specimenComfortBonus: 0.2 } },
  { id: 'hyper_computer', name: 'Hyper Computer', description: 'Quantum-class computing for rapid data analysis.', cost: 800, requiredLevel: 9, researchTime: 150, effect: { researchSpeedBonus: 0.35 } },
  { id: 'nano_bots', name: 'Nano Bot Swarm', description: 'Microscopic robots for internal specimen repair and study.', cost: 700, requiredLevel: 10, researchTime: 100, effect: { specimenHealthBonus: 0.2 } },
  { id: 'plasma_weapons', name: 'Plasma Weapons', description: 'Defensive plasma armament for extreme containment scenarios.', cost: 650, requiredLevel: 11, researchTime: 110, effect: { containmentBonus: 0.25 } },
  { id: 'antimatter_core', name: 'Antimatter Core', description: 'Power source providing immense energy for experiments.', cost: 1200, requiredLevel: 12, researchTime: 200, effect: { experimentPowerBonus: 0.3 } },
  { id: 'dimensional_lock', name: 'Dimensional Lock', description: 'Prevents interdimensional breaches and escapes.', cost: 1000, requiredLevel: 13, researchTime: 180, effect: { containmentBonus: 0.5 } },
  { id: 'telepathy_amplifier', name: 'Telepathy Amplifier', description: 'Enhances communication with telepathic species.', cost: 900, requiredLevel: 14, researchTime: 140, effect: { communicationBonus: 0.4 } },
  { id: 'graviton_emitter', name: 'Graviton Emitter', description: 'Controls local gravity for species with different G requirements.', cost: 1100, requiredLevel: 15, researchTime: 160, effect: { specimenComfortBonus: 0.3 } },
  { id: 'chroniton_field', name: 'Chroniton Field', description: 'Slows time in localized areas for observation.', cost: 2000, requiredLevel: 18, researchTime: 250, effect: { researchSpeedBonus: 0.5 } },
  { id: 'plasma_weaver', name: 'Plasma Weaver', description: 'Creates and manipulates plasma for energy-based species.', cost: 1800, requiredLevel: 20, researchTime: 220, effect: { energySpeciesBonus: 0.4 } },
  { id: 'crystal_matrix', name: 'Crystal Matrix', description: 'Harnesses crystalline resonance for data storage.', cost: 2200, requiredLevel: 22, researchTime: 280, effect: { storageCapacityBonus: 25, researchSpeedBonus: 0.2 } },
  { id: 'wormhole_gen', name: 'Wormhole Generator', description: 'Creates stable wormholes for specimen transport.', cost: 3500, requiredLevel: 25, researchTime: 350, effect: { transportSpeedBonus: 0.6 } },
  { id: 'zero_point', name: 'Zero-Point Energy', description: 'Extracts infinite energy from quantum vacuum.', cost: 4000, requiredLevel: 27, researchTime: 400, effect: { experimentPowerBonus: 0.5 } },
  { id: 'dark_matter_scoop', name: 'Dark Matter Scoop', description: 'Collects and stores dark matter for study.', cost: 4500, requiredLevel: 29, researchTime: 420, effect: { darkMatterBonus: 1.0 } },
  { id: 'psi_crystal_lattice', name: 'Psi Crystal Lattice', description: 'Amplifies and focuses psionic energy for experiments.', cost: 3800, requiredLevel: 30, researchTime: 380, effect: { psionicsBonus: 0.5 } },
  { id: 'quantum_entangler', name: 'Quantum Entangler', description: 'Links objects across any distance instantaneously.', cost: 5000, requiredLevel: 32, researchTime: 450, effect: { researchSpeedBonus: 0.6, communicationBonus: 0.5 } },
  { id: 'tachyon_sensor', name: 'Tachyon Sensor Array', description: 'Detects events before they happen.', cost: 5500, requiredLevel: 34, researchTime: 480, effect: { anomalyPredictionBonus: 0.5 } },
  { id: 'biome_generator', name: 'Biome Generator', description: 'Creates perfect habitat simulations for any species.', cost: 6000, requiredLevel: 35, researchTime: 500, effect: { specimenComfortBonus: 0.6 } },
  { id: 'consciousness_link', name: 'Consciousness Link', description: 'Merges researcher consciousness with specimen for deep understanding.', cost: 7000, requiredLevel: 38, researchTime: 550, effect: { communicationBonus: 0.8 } },
  { id: 'omega_drive', name: 'Omega Drive', description: 'Infinite energy source from collapsing dimensions.', cost: 10000, requiredLevel: 43, researchTime: 700, effect: { experimentPowerBonus: 1.0 } },
  { id: 'omniscient_core', name: 'Omniscient Core', description: 'The ultimate AI achieving near-complete knowledge of all alien species.', cost: 20000, requiredLevel: 50, researchTime: 1200, effect: { researchSpeedBonus: 1.0, communicationBonus: 1.0, containmentBonus: 1.0 } },
] as const;

// ─── 22 Experiments ───────────────────────────────────────────────────────

export const AL_EXPERIMENTS = [
  { id: 'cell_sample', name: 'Cell Sample Analysis', description: 'Extract and analyze cellular structures from specimens.', riskLevel: 1, rewardXP: 20, rewardCredits: 30, requiredTech: null, speciesRequired: false, successChance: 0.9, failureConsequence: 'minor', outcomes: ['discovery_basic', 'discovery_none', 'specimen_stressed'] },
  { id: 'neural_mapping', name: 'Neural Pathway Mapping', description: 'Map the complete neural network of a specimen brain.', riskLevel: 2, rewardXP: 40, rewardCredits: 60, requiredTech: 'neural_interface', speciesRequired: true, successChance: 0.8, failureConsequence: 'moderate', outcomes: ['discovery_neural', 'psionic_feedback', 'neural_damage'] },
  { id: 'dna_extraction', name: 'DNA Extraction Protocol', description: 'Safely extract and preserve alien DNA for cataloging.', riskLevel: 2, rewardXP: 35, rewardCredits: 50, requiredTech: 'bio_scanner', speciesRequired: true, successChance: 0.85, failureConsequence: 'minor', outcomes: ['dna_extracted', 'dna_degraded', 'sample_contaminated'] },
  { id: 'psionic_probe', name: 'Psionic Probe', description: 'Send a psionic probe into the specimen mind.', riskLevel: 4, rewardXP: 80, rewardCredits: 120, requiredTech: 'psi_dampener', speciesRequired: true, successChance: 0.65, failureConsequence: 'major', outcomes: ['mind_link', 'psionic_backlash', 'memory_fragment', 'consciousness_ripple'] },
  { id: 'gene_splice', name: 'Gene Splicing Experiment', description: 'Attempt to combine genetic material from two species.', riskLevel: 5, rewardXP: 120, rewardCredits: 200, requiredTech: 'gene_splicer', speciesRequired: true, successChance: 0.5, failureConsequence: 'major', outcomes: ['hybrid_created', 'mutation_unstable', 'genetic_collapse'] },
  { id: 'stasis_test', name: 'Stasis Field Test', description: 'Place a specimen in temporary stasis to study preservation.', riskLevel: 3, rewardXP: 50, rewardCredits: 80, requiredTech: 'stasis_chamber', speciesRequired: true, successChance: 0.75, failureConsequence: 'moderate', outcomes: ['stasis_perfect', 'stasis_partial', 'cellular_damage'] },
  { id: 'nano_healing', name: 'Nano Bot Healing Trial', description: 'Use nano bots to heal an injured specimen.', riskLevel: 3, rewardXP: 45, rewardCredits: 70, requiredTech: 'nano_bots', speciesRequired: true, successChance: 0.8, failureConsequence: 'minor', outcomes: ['full_recovery', 'partial_heal', 'nano_rejection'] },
  { id: 'gravity_sim', name: 'Gravity Simulation', description: 'Test specimen reactions to varying gravity levels.', riskLevel: 3, rewardXP: 55, rewardCredits: 90, requiredTech: 'graviton_emitter', speciesRequired: true, successChance: 0.7, failureConsequence: 'moderate', outcomes: ['gravity_tolerance', 'gravity_stress', 'structural_failure'] },
  { id: 'teleport_test', name: 'Teleportation Test', description: 'Attempt to teleport a specimen between chambers.', riskLevel: 6, rewardXP: 150, rewardCredits: 250, requiredTech: 'wormhole_gen', speciesRequired: true, successChance: 0.45, failureConsequence: 'severe', outcomes: ['teleport_success', 'partial_teleport', 'dimensional_scatter', 'teleport_fusion'] },
  { id: 'plasma_study', name: 'Plasma Interaction Study', description: 'Observe how specimens interact with controlled plasma.', riskLevel: 4, rewardXP: 70, rewardCredits: 110, requiredTech: 'plasma_weaver', speciesRequired: true, successChance: 0.6, failureConsequence: 'major', outcomes: ['plasma_absorb', 'plasma_resist', 'plasma_instability'] },
  { id: 'crystal_resonance', name: 'Crystal Resonance Test', description: 'Expose specimens to crystalline frequency vibrations.', riskLevel: 3, rewardXP: 60, rewardCredits: 100, requiredTech: 'crystal_matrix', speciesRequired: true, successChance: 0.7, failureConsequence: 'moderate', outcomes: ['harmonic_sync', 'resonance_reject', 'crystal_fracture'] },
  { id: 'chroniton_study', name: 'Time Dilation Study', description: 'Study specimen aging under chroniton time fields.', riskLevel: 5, rewardXP: 100, rewardCredits: 180, requiredTech: 'chroniton_field', speciesRequired: true, successChance: 0.55, failureConsequence: 'major', outcomes: ['time_data', 'aging_accelerate', 'time_paradox'] },
  { id: 'consciousness_merge', name: 'Consciousness Merge Attempt', description: 'Attempt to merge researcher consciousness with specimen.', riskLevel: 8, rewardXP: 250, rewardCredits: 400, requiredTech: 'consciousness_link', speciesRequired: true, successChance: 0.3, failureConsequence: 'catastrophic', outcomes: ['merged_insight', 'identity_loss', 'shared_trauma', 'cosmic_revelation'] },
  { id: 'dark_matter_probe', name: 'Dark Matter Probe', description: 'Send a probe into dark matter surrounding specimen.', riskLevel: 7, rewardXP: 200, rewardCredits: 350, requiredTech: 'dark_matter_scoop', speciesRequired: false, successChance: 0.4, failureConsequence: 'severe', outcomes: ['dark_data', 'dark_leak', 'dimensional_tear'] },
  { id: 'multiverse_scan', name: 'Multiverse Scan', description: 'Scan parallel universes for variant species data.', riskLevel: 6, rewardXP: 130, rewardCredits: 220, requiredTech: 'tachyon_sensor', speciesRequired: false, successChance: 0.5, failureConsequence: 'severe', outcomes: ['variant_found', 'universe_echo', 'paradox_warning'] },
  { id: 'ascension_trial', name: 'Ascension Trial', description: 'Attempt to elevate a specimen to a higher state.', riskLevel: 9, rewardXP: 350, rewardCredits: 500, requiredTech: 'psi_crystal_lattice', speciesRequired: true, successChance: 0.25, failureConsequence: 'catastrophic', outcomes: ['ascension_success', 'energy_release', 'dimensional_shatter', 'transcendent_knowledge'] },
  { id: 'omega_experiment', name: 'Omega Experiment', description: 'The ultimate experiment using the Omega Drive energy.', riskLevel: 10, rewardXP: 500, rewardCredits: 800, requiredTech: 'omega_drive', speciesRequired: true, successChance: 0.15, failureConsequence: 'catastrophic', outcomes: ['omega_breakthrough', 'energy_cascade', 'reality_glitch', 'forbidden_knowledge'] },
  { id: 'cross_breed', name: 'Cross-Breed Program', description: 'Attempt controlled breeding between compatible species.', riskLevel: 6, rewardXP: 140, rewardCredits: 200, requiredTech: 'gene_splicer', speciesRequired: true, successChance: 0.4, failureConsequence: 'major', outcomes: ['hybrid_born', 'genetic_rejection', 'unexpected_traits'] },
  { id: 'memory_extract', name: 'Memory Extraction', description: 'Extract and playback specimen memories.', riskLevel: 4, rewardXP: 75, rewardCredits: 130, requiredTech: 'telepathy_amplifier', speciesRequired: true, successChance: 0.65, failureConsequence: 'moderate', outcomes: ['memories_recovered', 'traumatic_flashback', 'memory_flood'] },
  { id: 'energy_siphon', name: 'Energy Siphon', description: 'Attempt to safely siphon energy from energy-based species.', riskLevel: 5, rewardXP: 90, rewardCredits: 150, requiredTech: 'zero_point', speciesRequired: true, successChance: 0.55, failureConsequence: 'major', outcomes: ['energy_captured', 'energy_feedback', 'energy_overload'] },
  { id: 'dimensional_bridge', name: 'Dimensional Bridge', description: 'Open a stable dimensional bridge for specimen contact.', riskLevel: 8, rewardXP: 280, rewardCredits: 450, requiredTech: 'quantum_entangler', speciesRequired: false, successChance: 0.3, failureConsequence: 'catastrophic', outcomes: ['bridge_established', 'bridge_collapse', 'entity_contact', 'dimensional_invasion'] },
  { id: 'omniscient_query', name: 'Omniscient Query', description: 'Query the Omniscient Core about any species mystery.', riskLevel: 7, rewardXP: 300, rewardCredits: 600, requiredTech: 'omniscient_core', speciesRequired: false, successChance: 0.5, failureConsequence: 'severe', outcomes: ['ultimate_answer', 'partial_truth', 'knowledge_overload', 'forbidden_truth'] },
] as const;

// ─── 20 Artifacts ─────────────────────────────────────────────────────────

export const AL_ARTIFACTS = [
  { id: 'grey_skull', name: 'Grey Skull Fragment', description: 'A crystalline fragment from a Grey skull containing residual psionic energy.', rarity: 'common' as ALRarity, value: 50, bonus: { psionicsBonus: 5 } },
  { id: 'reptilian_scale', name: 'Reptilian Scale', description: 'A luminous iridescent scale from a Reptilian, nearly indestructible.', rarity: 'uncommon' as ALRarity, value: 100, bonus: { containmentBonus: 10 } },
  { id: 'pleiadian_crystal', name: 'Pleiadian Crystal', description: 'A naturally formed healing crystal from the Pleiades star cluster.', rarity: 'uncommon' as ALRarity, value: 120, bonus: { healingBonus: 15 } },
  { id: 'sirian_pearl', name: 'Sirian Pearl', description: 'A bioluminescent pearl from the ocean floors of Sirius B.', rarity: 'uncommon' as ALRarity, value: 130, bonus: { communicationBonus: 10 } },
  { id: 'mantis_claw', name: 'Mantis Claw', description: 'A perfectly preserved claw from a Mantis being, still humming with energy.', rarity: 'rare' as ALRarity, value: 250, bonus: { researchSpeedBonus: 15 } },
  { id: 'arcturian_helm', name: 'Arcturian Helm', description: 'A helmet that enhances the wearers healing and empathic abilities.', rarity: 'rare' as ALRarity, value: 300, bonus: { healingBonus: 25 } },
  { id: 'andromedan_lens', name: 'Andromedan Lens', description: 'A lens that reveals hidden dimensions when looked through.', rarity: 'rare' as ALRarity, value: 350, bonus: { discoveryBonus: 20 } },
  { id: 'lyran_fang', name: 'Lyran Fang', description: 'A fang from a Lyran with encoded genetic memories of ancient wars.', rarity: 'rare' as ALRarity, value: 280, bonus: { researchSpeedBonus: 18 } },
  { id: 'procyonan_shard', name: 'Procyonan Shard', description: 'A crystal shard that vibrates with harmonic frequencies.', rarity: 'rare' as ALRarity, value: 320, bonus: { communicationBonus: 20 } },
  { id: 'essassani_orb', name: 'Essassani Orb', description: 'A floating orb that responds to consciousness and emotion.', rarity: 'rare' as ALRarity, value: 400, bonus: { psionicsBonus: 25 } },
  { id: 'draco_heart', name: 'Draco Heart Stone', description: 'The calcified heart of an ancient Draco, pulsing with dark energy.', rarity: 'epic' as ALRarity, value: 600, bonus: { powerBonus: 30 } },
  { id: 'blue_avian_feather', name: 'Blue Avian Feather', description: 'A feather from a 6th density Blue Avian, radiating pure love.', rarity: 'epic' as ALRarity, value: 700, bonus: { psionicsBonus: 35, healingBonus: 20 } },
  { id: 'golden_being_shard', name: 'Golden Being Shard', description: 'A fragment of pure golden light from a 7th density being.', rarity: 'epic' as ALRarity, value: 800, bonus: { powerBonus: 40, psionicsBonus: 20 } },
  { id: 'crystal_entity_core', name: 'Crystal Entity Core', description: 'The central processing core of a living crystal entity.', rarity: 'epic' as ALRarity, value: 900, bonus: { researchSpeedBonus: 35, storageBonus: 20 } },
  { id: 'plasma_vial', name: 'Plasma Vial', description: 'A vial containing stellar plasma from a Plasma Form being.', rarity: 'epic' as ALRarity, value: 850, bonus: { powerBonus: 45 } },
  { id: 'dark_matter_shard', name: 'Dark Matter Shard', description: 'A shard of condensed dark matter that warps light around it.', rarity: 'legendary' as ALRarity, value: 2000, bonus: { powerBonus: 60, discoveryBonus: 30 } },
  { id: 'quantum_cube', name: 'Quantum Cube', description: 'A cube that exists in multiple states simultaneously.', rarity: 'legendary' as ALRarity, value: 2500, bonus: { researchSpeedBonus: 50, psionicsBonus: 30 } },
  { id: 'void_key', name: 'Void Key', description: 'A key that can unlock passages to the space between dimensions.', rarity: 'legendary' as ALRarity, value: 3000, bonus: { discoveryBonus: 50, powerBonus: 40 } },
  { id: 'star_seed_essence', name: 'Star Seed Essence', description: 'Pure stellar energy in liquid form, containing birth-codes of stars.', rarity: 'legendary' as ALRarity, value: 3500, bonus: { healingBonus: 60, powerBonus: 35 } },
  { id: 'cosmic_egg', name: 'Cosmic Egg', description: 'An egg containing the potential for an entire universe.', rarity: 'legendary' as ALRarity, value: 5000, bonus: { powerBonus: 80, psionicsBonus: 50, healingBonus: 50 } },
] as const;

// ─── 15 Achievements ──────────────────────────────────────────────────────

export const AL_ACHIEVEMENTS = [
  { id: 'first_contact', name: 'First Contact', description: 'Research your first alien species.', icon: '🛸', condition: 'researchedSpecies >= 1', rewardXP: 50, rewardCredits: 100 },
  { id: 'xenobiologist_initiate', name: 'Xenobiologist Initiate', description: 'Research 5 different species.', icon: '🎓', condition: 'researchedSpecies >= 5', rewardXP: 150, rewardCredits: 300 },
  { id: 'species_collector', name: 'Species Collector', description: 'Research 10 different species.', icon: '📚', condition: 'researchedSpecies >= 10', rewardXP: 300, rewardCredits: 500 },
  { id: 'galactic_cataloger', name: 'Galactic Cataloger', description: 'Research 20 different species.', icon: '🌌', condition: 'researchedSpecies >= 20', rewardXP: 600, rewardCredits: 1000 },
  { id: 'complete_index', name: 'Complete Xenobiological Index', description: 'Research all 30 species.', icon: '📖', condition: 'researchedSpecies >= 30', rewardXP: 2000, rewardCredits: 5000 },
  { id: 'mad_scientist', name: 'Mad Scientist', description: 'Conduct 50 experiments.', icon: '🧪', condition: 'totalExperiments >= 50', rewardXP: 400, rewardCredits: 800 },
  { id: 'cloning_master', name: 'Cloning Master', description: 'Successfully clone 20 specimens.', icon: '🫧', condition: 'successfulClones >= 20', rewardXP: 500, rewardCredits: 1000 },
  { id: 'tech_pioneer', name: 'Tech Pioneer', description: 'Research 10 technologies.', icon: '⚙️', condition: 'researchedTechs >= 10', rewardXP: 350, rewardCredits: 700 },
  { id: 'full_tech_tree', name: 'Full Tech Tree', description: 'Research all 28 technologies.', icon: '🌳', condition: 'researchedTechs >= 28', rewardXP: 3000, rewardCredits: 8000 },
  { id: 'artifact_hunter', name: 'Artifact Hunter', description: 'Collect 10 artifacts.', icon: '🏺', condition: 'artifactsCollected >= 10', rewardXP: 500, rewardCredits: 1200 },
  { id: 'curator_supreme', name: 'Curator Supreme', description: 'Collect all 20 artifacts.', icon: '👑', condition: 'artifactsCollected >= 20', rewardXP: 2500, rewardCredits: 6000 },
  { id: 'survivor', name: 'Survivor', description: 'Survive 5 containment breaches.', icon: '🛡️', condition: 'breachesSurvived >= 5', rewardXP: 300, rewardCredits: 600 },
  { id: 'legendary_catch', name: 'Legendary Catch', description: 'Research a legendary-rarity species.', icon: '⭐', condition: 'legendaryResearched >= 1', rewardXP: 800, rewardCredits: 1500 },
  { id: 'lab_ace', name: 'Lab Ace', description: 'Reach laboratory level 50.', icon: '🏆', condition: 'level >= 50', rewardXP: 5000, rewardCredits: 10000 },
  { id: 'risk_taker', name: 'Risk Taker', description: 'Successfully complete 10 risk level 7+ experiments.', icon: '🎲', condition: 'highRiskSuccess >= 10', rewardXP: 1000, rewardCredits: 2000 },
] as const;

// ─── 8 Titles (Lab Intern → Universal Architect) ───────────────────────────

export const AL_TITLES = [
  { id: 'intern', name: 'Lab Intern', requiredLevel: 1, description: 'Just starting out in the alien laboratory.' },
  { id: 'assistant', name: 'Research Assistant', requiredLevel: 5, description: 'Learning the ropes of xenobiological research.' },
  { id: 'xenobiologist', name: 'Xenobiologist', requiredLevel: 10, description: 'A certified expert in alien biology.' },
  { id: 'chief_scientist', name: 'Chief Scientist', requiredLevel: 18, description: 'Leading the laboratory research efforts.' },
  { id: 'lab_director', name: 'Lab Director', requiredLevel: 25, description: 'Managing the entire alien research facility.' },
  { id: 'galactic_researcher', name: 'Galactic Researcher', requiredLevel: 35, description: 'Known across multiple star systems.' },
  { id: 'cosmic_scholar', name: 'Cosmic Scholar', requiredLevel: 43, description: 'A sage of cosmic knowledge and alien lore.' },
  { id: 'universal_architect', name: 'Universal Architect', requiredLevel: 50, description: 'Master of all alien science and technology.' },
] as const;

// ─── Containment Breach Types ──────────────────────────────────────────────

export const AL_CONTAINMENT_BREACH_TYPES = [
  { id: 'escape', name: 'Specimen Escape', description: 'A specimen has broken containment!', severity: 'high', threatReduction: 10, creditLoss: 100, xpLoss: 25 },
  { id: 'psionic_storm', name: 'Psionic Storm', description: 'A psionic specimen is creating a telepathic disturbance!', severity: 'medium', threatReduction: 5, creditLoss: 50, xpLoss: 15 },
  { id: 'dimensional_ripple', name: 'Dimensional Ripple', description: 'Space-time is warping near the Warp Chamber!', severity: 'high', threatReduction: 8, creditLoss: 80, xpLoss: 20 },
  { id: 'power_failure', name: 'Power Failure', description: 'The antimatter core is unstable! Containment systems failing!', severity: 'critical', threatReduction: 15, creditLoss: 200, xpLoss: 50 },
  { id: 'anomaly_surge', name: 'Anomaly Surge', description: 'Multiple anomalies detected simultaneously across the lab!', severity: 'critical', threatReduction: 20, creditLoss: 300, xpLoss: 75 },
  { id: 'parasite_infestation', name: 'Parasite Infestation', description: 'Unknown alien parasites spreading through the ventilation!', severity: 'medium', threatReduction: 5, creditLoss: 60, xpLoss: 10 },
  { id: 'temporal_loop', name: 'Temporal Loop', description: 'The Chroniton Field is malfunctioning, trapping the lab in a time loop!', severity: 'high', threatReduction: 12, creditLoss: 150, xpLoss: 35 },
  { id: 'hive_mind_awakening', name: 'Hive Mind Awakening', description: 'Multiple specimens are linking into a hive consciousness!', severity: 'critical', threatReduction: 25, creditLoss: 500, xpLoss: 100 },
] as const;

// ─── Daily Anomaly Types ──────────────────────────────────────────────────

export const AL_ANOMALY_TYPES = [
  { id: 'strange_signal', name: 'Strange Signal', description: 'An unknown alien signal detected. Investigating may yield discoveries.', rewardXP: 30, rewardCredits: 50, artifactChance: 0.05, speciesChance: 0.02 },
  { id: 'crashed_ship', name: 'Crashed Ship Debris', description: 'Debris from an alien ship detected nearby. Contains useful materials.', rewardXP: 50, rewardCredits: 100, artifactChance: 0.1, speciesChance: 0.0 },
  { id: 'wanderer', name: 'Wandering Entity', description: 'A lone alien entity has wandered near the lab perimeter.', rewardXP: 80, rewardCredits: 150, artifactChance: 0.15, speciesChance: 0.2 },
  { id: 'energy_surge', name: 'Cosmic Energy Surge', description: 'A surge of cosmic energy is empowering the lab systems.', rewardXP: 60, rewardCredits: 120, artifactChance: 0.0, speciesChance: 0.0 },
  { id: 'dimensional_echo', name: 'Dimensional Echo', description: 'An echo from a parallel dimension brings strange data.', rewardXP: 100, rewardCredits: 200, artifactChance: 0.2, speciesChance: 0.05 },
  { id: 'ancient_beacon', name: 'Ancient Beacon Activation', description: 'An ancient alien beacon has activated, broadcasting coordinates.', rewardXP: 150, rewardCredits: 300, artifactChance: 0.25, speciesChance: 0.15 },
  { id: 'meteor_shower', name: 'Alien Meteor Shower', description: 'Meteors containing alien biological material are raining down.', rewardXP: 40, rewardCredits: 80, artifactChance: 0.08, speciesChance: 0.03 },
  { id: 'time_distortion', name: 'Time Distortion Field', description: 'A localized time distortion is causing temporal anomalies.', rewardXP: 120, rewardCredits: 250, artifactChance: 0.18, speciesChance: 0.08 },
] as const;

// ─── Color Theme ───────────────────────────────────────────────────────────

export const AL_COLOR_THEME = {
  neonGreen: '#39ff14',
  violet: '#bf5fff',
  electricBlue: '#00e5ff',
  darkBg: '#0a0a1a',
  panelBg: '#0d0d2b',
  panelBorder: '#1a1a4e',
  accentGlow: '#7b2ff7',
  textPrimary: '#e0e0ff',
  textSecondary: '#8888aa',
  dangerRed: '#ff3366',
  successGreen: '#00ff88',
  warningYellow: '#ffcc00',
  goldReward: '#ffd700',
};

// ─── Status Tuples ────────────────────────────────────────────────────────

export const AL_SPECIMEN_STATUS = ['healthy', 'stressed', 'injured', 'critical', 'deceased', 'stasis', 'evolving'] as const;
export const AL_EXPERIMENT_STATUS = ['available', 'in_progress', 'completed', 'failed', 'locked'] as const;
export const AL_RESEARCH_STATUS = ['locked', 'available', 'researching', 'completed'] as const;

// ═══════════════════════════════════════════════════════════════════════════
// ALIEN LABORATORY — TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ALSpecimenStatus = (typeof AL_SPECIMEN_STATUS)[number];
export type ALExperimentStatus = (typeof AL_EXPERIMENT_STATUS)[number];
export type ALResearchStatus = (typeof AL_RESEARCH_STATUS)[number];

export interface ALSpecimen {
  id: string;
  speciesId: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  status: ALSpecimenStatus;
  researchProgress: number;
  isResearched: boolean;
  roomAssigned: string | null;
  clonedFrom: string | null;
  daysInLab: number;
  psionicLevel: number;
  intelligence: number;
  threatLevel: number;
  acquiredAt: number;
}

export interface ALTechnologyState {
  techId: string;
  status: ALResearchStatus;
  progress: number;
  completedAt: number | null;
}

export interface ALExperimentState {
  experimentId: string;
  status: ALExperimentStatus;
  timesRun: number;
  timesSucceeded: number;
  timesFailed: number;
  lastRunAt: number | null;
  currentProgress: number;
  specimenAssigned: string | null;
}

export interface ALArtifactState {
  artifactId: string;
  isOwned: boolean;
  acquiredAt: number | null;
  isEquipped: boolean;
  studyProgress: number;
  isStudied: boolean;
}

export interface ALAchievementState {
  achievementId: string;
  isUnlocked: boolean;
  unlockedAt: number | null;
  progress: number;
  target: number;
}

export interface ALRoomState {
  roomId: string;
  level: number;
  isUnlocked: boolean;
  specimensInRoom: number;
}

export interface ALContainmentBreach {
  id: string;
  breachType: string;
  isActive: boolean;
  startedAt: number;
  resolvedAt: number | null;
  severity: string;
  creditsLost: number;
  xpLost: number;
}

export interface ALDailyAnomaly {
  id: string;
  anomalyType: string;
  hasBeenInvestigated: boolean;
  investigatedAt: number | null;
  rewardXP: number;
  rewardCredits: number;
  artifactFound: string | null;
  speciesFound: string | null;
}

export type ALLogType = 'research' | 'experiment' | 'clone' | 'breach' | 'anomaly' | 'levelup' | 'achievement' | 'tech' | 'artifact' | 'upgrade' | 'credits' | 'system';

export interface ALLogEntry {
  id: string;
  timestamp: number;
  type: ALLogType;
  message: string;
  details: string;
}

export interface ALGameState {
  level: number;
  xp: number;
  totalXP: number;
  credits: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
  currentTitle: string;
  specimens: ALSpecimen[];
  technologies: ALTechnologyState[];
  experiments: ALExperimentState[];
  artifacts: ALArtifactState[];
  achievements: ALAchievementState[];
  rooms: ALRoomState[];
  activeBreaches: ALContainmentBreach[];
  dailyAnomaly: ALDailyAnomaly | null;
  dailyAnomalyDate: string | null;
  log: ALLogEntry[];
  totalExperiments: number;
  successfulClones: number;
  breachesSurvived: number;
  highRiskSuccess: number;
  legendaryResearched: number;
  researchedSpeciesCount: number;
  researchedTechCount: number;
  artifactsCollected: number;
  totalDaysActive: number;
  lastLoginDate: string | null;
  settings: {
    autoResearch: boolean;
    breachAlerts: boolean;
    anomalyNotifications: boolean;
    soundEnabled: boolean;
    darkMode: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALIEN LABORATORY — HELPER FUNCTIONS (pure, no hooks)
// ═══════════════════════════════════════════════════════════════════════════

function AL_generateId(): string {
  return `al_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function AL_getSpeciesById(speciesId: string) {
  return AL_SPECIES_TYPES.find(s => s.id === speciesId);
}

function AL_getRoomById(roomId: string) {
  return AL_LAB_ROOMS.find(r => r.id === roomId);
}

function AL_getTechById(techId: string) {
  return AL_TECHNOLOGIES.find(t => t.id === techId);
}

function AL_getExperimentById(experimentId: string) {
  return AL_EXPERIMENTS.find(e => e.id === experimentId);
}

function AL_getArtifactById(artifactId: string) {
  return AL_ARTIFACTS.find(a => a.id === artifactId);
}

function AL_getAchievementById(achievementId: string) {
  return AL_ACHIEVEMENTS.find(a => a.id === achievementId);
}

function AL_getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function AL_getAchievementTarget(condition: string): number {
  const match = condition.match(/>=\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function AL_xpForLevel(level: number): number {
  return Math.floor(AL_XP_PER_LEVEL * Math.pow(1.15, level - 1));
}

function AL_titleForLevel(level: number): string {
  let currentTitle = 'intern';
  for (const title of AL_TITLES) {
    if (level >= title.requiredLevel) {
      currentTitle = title.id;
    }
  }
  return currentTitle;
}

function AL_randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function AL_chance(probability: number): boolean {
  return Math.random() < probability;
}

function AL_clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function AL_calculateHealCost(specimen: ALSpecimen): number {
  const missing = specimen.maxHealth - specimen.health;
  return Math.floor(missing * 0.5);
}

function AL_calculateCloneCost(rarity: ALRarity): number {
  return Math.floor(100 * AL_RARITY_MULTIPLIER[rarity]);
}

function AL_calculateUpgradeCost(roomDef: typeof AL_LAB_ROOMS[number], currentLevel: number): number {
  return Math.floor(roomDef.upgradeCost * Math.pow(2, currentLevel - 1));
}

function AL_determineSpecimenStatus(health: number, maxHealth: number): ALSpecimenStatus {
  if (health <= 0) return 'deceased';
  if (health < maxHealth * 0.25) return 'critical';
  if (health < maxHealth * 0.5) return 'injured';
  if (health < maxHealth * 0.75) return 'stressed';
  return 'healthy';
}

function AL_createInitialGameState(): ALGameState {
  return {
    level: 1,
    xp: 0,
    totalXP: 0,
    credits: AL_BASE_CREDITS,
    totalCreditsEarned: AL_BASE_CREDITS,
    totalCreditsSpent: 0,
    currentTitle: 'intern',
    specimens: [],
    technologies: AL_TECHNOLOGIES.map(t => ({
      techId: t.id,
      status: t.requiredLevel <= 1 ? 'available' as ALResearchStatus : 'locked' as ALResearchStatus,
      progress: 0,
      completedAt: null,
    })),
    experiments: AL_EXPERIMENTS.map(e => ({
      experimentId: e.id,
      status: (e.requiredTech === null && e.riskLevel <= 2 ? 'available' : 'locked') as ALExperimentStatus,
      timesRun: 0,
      timesSucceeded: 0,
      timesFailed: 0,
      lastRunAt: null,
      currentProgress: 0,
      specimenAssigned: null,
    })),
    artifacts: AL_ARTIFACTS.map(a => ({
      artifactId: a.id,
      isOwned: false,
      acquiredAt: null,
      isEquipped: false,
      studyProgress: 0,
      isStudied: false,
    })),
    achievements: AL_ACHIEVEMENTS.map(ach => ({
      achievementId: ach.id,
      isUnlocked: false,
      unlockedAt: null,
      progress: 0,
      target: AL_getAchievementTarget(ach.condition),
    })),
    rooms: AL_LAB_ROOMS.map(r => ({
      roomId: r.id,
      level: 1,
      isUnlocked: r.unlockLevel <= 1,
      specimensInRoom: 0,
    })),
    activeBreaches: [],
    dailyAnomaly: null,
    dailyAnomalyDate: null,
    log: [
      {
        id: AL_generateId(),
        timestamp: Date.now(),
        type: 'system',
        message: 'Welcome to the Alien Laboratory',
        details: 'Your research into extraterrestrial life begins now. Study species, conduct experiments, and push the boundaries of xenobiology.',
      },
    ],
    totalExperiments: 0,
    successfulClones: 0,
    breachesSurvived: 0,
    highRiskSuccess: 0,
    legendaryResearched: 0,
    researchedSpeciesCount: 0,
    researchedTechCount: 0,
    artifactsCollected: 0,
    totalDaysActive: 1,
    lastLoginDate: AL_getTodayString(),
    settings: {
      autoResearch: false,
      breachAlerts: true,
      anomalyNotifications: true,
      soundEnabled: true,
      darkMode: true,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ALIEN LABORATORY — MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════

export default function useAlienLaboratory() {
  const [state, setState] = useState<ALGameState>(AL_createInitialGameState);

  // ── Log Helper ─────────────────────────────────────────────────

  const addLog = useCallback((type: ALLogType, message: string, details: string) => {
    const entry: ALLogEntry = {
      id: AL_generateId(),
      timestamp: Date.now(),
      type,
      message,
      details,
    };
    setState(prev => ({
      ...prev,
      log: [entry, ...prev.log].slice(0, AL_MAX_LOG_ENTRIES),
    }));
  }, []);

  // ── XP & Leveling ──────────────────────────────────────────────

  const addXP = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      const bonusCreditsList: number[] = [];

      while (newXp >= AL_xpForLevel(newLevel) && newLevel < AL_MAX_LEVEL) {
        newXp -= AL_xpForLevel(newLevel);
        newLevel += 1;
        bonusCreditsList.push(AL_CREDITS_PER_LEVEL * newLevel);
      }

      if (newLevel >= AL_MAX_LEVEL) {
        newXp = 0;
        newLevel = AL_MAX_LEVEL;
      }

      const totalBonusCredits = bonusCreditsList.reduce((sum, c) => sum + c, 0);
      const newTitle = AL_titleForLevel(newLevel);

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        totalXP: prev.totalXP + amount,
        credits: prev.credits + totalBonusCredits,
        totalCreditsEarned: prev.totalCreditsEarned + totalBonusCredits,
        currentTitle: newTitle,
      };
    });
  }, []);

  // ── Credits ────────────────────────────────────────────────────

  const spendCredits = useCallback((amount: number): boolean => {
    let didSpend = false;
    setState(prev => {
      if (prev.credits < amount) {
        return prev;
      }
      didSpend = true;
      return {
        ...prev,
        credits: prev.credits - amount,
        totalCreditsSpent: prev.totalCreditsSpent + amount,
      };
    });
    return didSpend;
  }, []);

  const earnCredits = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState(prev => ({
      ...prev,
      credits: prev.credits + amount,
      totalCreditsEarned: prev.totalCreditsEarned + amount,
    }));
  }, []);

  // ── Research Species ───────────────────────────────────────────

  const researchSpecies = useCallback((speciesId: string) => {
    const species = AL_getSpeciesById(speciesId);
    if (!species) {
      return { success: false, message: 'Unknown species.', xpGained: 0, creditsGained: 0 };
    }

    let result: { success: boolean; message: string; xpGained: number; creditsGained: number } = {
      success: false,
      message: '',
      xpGained: 0,
      creditsGained: 0,
    };

    setState(prev => {
      const existing = prev.specimens.find(s => s.speciesId === speciesId && s.isResearched);
      if (existing) {
        result = { success: false, message: `${species.name} has already been researched.`, xpGained: 0, creditsGained: 0 };
        return prev;
      }

      if (prev.specimens.length >= AL_SPECIMEN_INVENTORY_LIMIT) {
        result = { success: false, message: 'Specimen inventory is full. Release or clone out specimens first.', xpGained: 0, creditsGained: 0 };
        return prev;
      }

      const xpGain = Math.floor(50 * AL_RARITY_MULTIPLIER[species.rarity]);
      const creditGain = Math.floor(80 * AL_RARITY_MULTIPLIER[species.rarity]);

      const newSpecimen: ALSpecimen = {
        id: AL_generateId(),
        speciesId: species.id,
        name: `${species.name} #${prev.specimens.length + 1}`,
        level: 1,
        health: species.baseHP,
        maxHealth: species.baseHP,
        status: 'healthy',
        researchProgress: 100,
        isResearched: true,
        roomAssigned: 'observation_chamber',
        clonedFrom: null,
        daysInLab: 0,
        psionicLevel: species.basePsionics,
        intelligence: species.baseIntelligence,
        threatLevel: species.threat,
        acquiredAt: Date.now(),
      };

      const isLegendary = species.rarity === 'legendary';

      result = {
        success: true,
        message: `Successfully researched ${species.name}!`,
        xpGained: xpGain,
        creditsGained: creditGain,
      };

      return {
        ...prev,
        specimens: [...prev.specimens, newSpecimen],
        researchedSpeciesCount: prev.researchedSpeciesCount + 1,
        legendaryResearched: isLegendary ? prev.legendaryResearched + 1 : prev.legendaryResearched,
        xp: prev.xp + xpGain,
        credits: prev.credits + creditGain,
        totalXP: prev.totalXP + xpGain,
        totalCreditsEarned: prev.totalCreditsEarned + creditGain,
      };
    });

    if (result.success) {
      addXP(result.xpGained);
      earnCredits(result.creditsGained);
      addLog('research', result.message, `Species: ${species.name}, Rarity: ${species.rarity}`);
    }

    return result;
  }, [addXP, earnCredits, addLog]);

  // ── Conduct Experiment ─────────────────────────────────────────

  const conductExperiment = useCallback((experimentId: string, specimenId: string | null) => {
    const experimentDef = AL_getExperimentById(experimentId);
    if (!experimentDef) {
      return null;
    }

    let result: {
      success: boolean;
      message: string;
      outcome: string;
      xpGained: number;
      creditsGained: number;
      damage: number;
    } | null = null;

    setState(prev => {
      const expState = prev.experiments.find(e => e.experimentId === experimentId);
      if (!expState || expState.status === 'locked' || expState.status === 'in_progress') {
        return prev;
      }

      if (experimentDef.requiredTech) {
        const techState = prev.technologies.find(t => t.techId === experimentDef.requiredTech);
        if (!techState || techState.status !== 'completed') {
          return prev;
        }
      }

      if (experimentDef.speciesRequired && !specimenId) {
        return prev;
      }

      const specimen = specimenId ? prev.specimens.find(s => s.id === specimenId) : null;
      if (experimentDef.speciesRequired && (!specimen || specimen.status === 'deceased')) {
        return prev;
      }

      const roomBonus = specimen && specimen.roomAssigned
        ? (AL_getRoomById(specimen.roomAssigned)?.bonuses.researchSpeed ?? 1)
        : 1;

      const adjustedChance = Math.min(experimentDef.successChance * roomBonus, 0.95);
      const isSuccess = AL_chance(adjustedChance);
      const outcome = isSuccess
        ? experimentDef.outcomes[0]
        : AL_randomPick(experimentDef.outcomes.slice(1));

      const xpGained = isSuccess ? experimentDef.rewardXP : Math.floor(experimentDef.rewardXP * 0.2);
      const creditsGained = isSuccess ? experimentDef.rewardCredits : Math.floor(experimentDef.rewardCredits * 0.1);
      const damage = !isSuccess ? Math.floor(10 + experimentDef.riskLevel * 5) : 0;

      const breachChance = !isSuccess ? 0.1 + experimentDef.riskLevel * 0.05 : 0;
      const shouldBreach = AL_chance(breachChance);

      const updatedSpecimens = specimenId
        ? prev.specimens.map(s => {
            if (s.id === specimenId && damage > 0) {
              const newHealth = Math.max(0, s.health - damage);
              const newStatus = AL_determineSpecimenStatus(newHealth, s.maxHealth);
              return { ...s, health: newHealth, status: newStatus };
            }
            return s;
          })
        : prev.specimens;

      const updatedExperiments = prev.experiments.map(e => {
        if (e.experimentId === experimentId) {
          return {
            ...e,
            timesRun: e.timesRun + 1,
            timesSucceeded: isSuccess ? e.timesSucceeded + 1 : e.timesSucceeded,
            timesFailed: !isSuccess ? e.timesFailed + 1 : e.timesFailed,
            lastRunAt: Date.now(),
            specimenAssigned: specimenId,
          };
        }
        return e;
      });

      const newBreaches = shouldBreach
        ? [
            ...prev.activeBreaches,
            {
              id: AL_generateId(),
              breachType: AL_randomPick(AL_CONTAINMENT_BREACH_TYPES).id,
              isActive: true,
              startedAt: Date.now(),
              resolvedAt: null,
              severity: experimentDef.riskLevel >= 7 ? 'critical' : 'high',
              creditsLost: Math.floor(experimentDef.riskLevel * 20),
              xpLost: Math.floor(experimentDef.riskLevel * 10),
            },
          ]
        : prev.activeBreaches;

      const isHighRisk = experimentDef.riskLevel >= 7;

      result = {
        success: isSuccess,
        message: isSuccess
          ? `Experiment "${experimentDef.name}" succeeded! Outcome: ${outcome}`
          : `Experiment "${experimentDef.name}" failed! Outcome: ${outcome}`,
        outcome,
        xpGained,
        creditsGained,
        damage,
      };

      return {
        ...prev,
        specimens: updatedSpecimens,
        experiments: updatedExperiments,
        activeBreaches: newBreaches,
        totalExperiments: prev.totalExperiments + 1,
        highRiskSuccess: isSuccess && isHighRisk ? prev.highRiskSuccess + 1 : prev.highRiskSuccess,
      };
    });

    if (result) {
      addXP(result.xpGained);
      earnCredits(result.creditsGained);
      addLog(
        'experiment',
        result.message,
        `Outcome: ${result.outcome}, Damage: ${result.damage}`
      );
    }

    return result;
  }, [addXP, earnCredits, addLog]);

  // ── Clone Specimen ─────────────────────────────────────────────

  const cloneSpecimen = useCallback((specimenId: string) => {
    let result: { success: boolean; message: string; clone: ALSpecimen | null } = {
      success: false,
      message: '',
      clone: null,
    };

    setState(prev => {
      const original = prev.specimens.find(s => s.id === specimenId);
      if (!original || original.status === 'deceased') {
        result = { success: false, message: 'Invalid specimen for cloning.', clone: null };
        return prev;
      }

      const cloningBay = prev.rooms.find(r => r.roomId === 'cloning_bay' && r.isUnlocked);
      if (!cloningBay) {
        result = { success: false, message: 'Cloning Bay is not unlocked yet (requires level 8).', clone: null };
        return prev;
      }

      if (prev.specimens.length >= AL_SPECIMEN_INVENTORY_LIMIT) {
        result = { success: false, message: 'Specimen inventory is full.', clone: null };
        return prev;
      }

      const species = AL_getSpeciesById(original.speciesId);
      const cloneCost = AL_calculateCloneCost(species?.rarity ?? 'common');

      if (prev.credits < cloneCost) {
        result = { success: false, message: `Insufficient credits. Need ${cloneCost} credits.`, clone: null };
        return prev;
      }

      const cloneSuccess = AL_chance(0.7 + cloningBay.level * 0.05);

      if (!cloneSuccess) {
        result = { success: false, message: 'Cloning failed! The specimen did not survive the process.', clone: null };
        return {
          ...prev,
          credits: prev.credits - Math.floor(cloneCost * 0.3),
          totalCreditsSpent: prev.totalCreditsSpent + Math.floor(cloneCost * 0.3),
        };
      }

      const clone: ALSpecimen = {
        id: AL_generateId(),
        speciesId: original.speciesId,
        name: `${species?.name ?? 'Unknown'} Clone #${prev.specimens.length + 1}`,
        level: Math.max(1, original.level - 2),
        health: Math.floor(original.maxHealth * 0.8),
        maxHealth: original.maxHealth,
        status: 'stasis',
        researchProgress: 50,
        isResearched: false,
        roomAssigned: 'cloning_bay',
        clonedFrom: specimenId,
        daysInLab: 0,
        psionicLevel: Math.floor(original.psionicLevel * 0.85),
        intelligence: Math.floor(original.intelligence * 0.85),
        threatLevel: Math.max(1, original.threatLevel - 1),
        acquiredAt: Date.now(),
      };

      result = { success: true, message: `Successfully cloned ${species?.name ?? 'specimen'}!`, clone };

      return {
        ...prev,
        specimens: [...prev.specimens, clone],
        credits: prev.credits - cloneCost,
        totalCreditsSpent: prev.totalCreditsSpent + cloneCost,
        successfulClones: prev.successfulClones + 1,
      };
    });

    if (result.clone || !result.success) {
      addLog('clone', result.message, result.clone ? `Cloned from: ${specimenId}` : 'Cloning failed.');
    }

    return result;
  }, [addLog]);

  // ── Upgrade Lab Room ───────────────────────────────────────────

  const upgradeRoom = useCallback((roomId: string) => {
    const roomDef = AL_getRoomById(roomId);
    if (!roomDef) return null;

    let result: { success: boolean; message: string } | null = null;

    setState(prev => {
      const roomState = prev.rooms.find(r => r.roomId === roomId);
      if (!roomState || !roomState.isUnlocked) {
        result = { success: false, message: 'Room is not unlocked.' };
        return prev;
      }

      const upgradeCost = AL_calculateUpgradeCost(roomDef, roomState.level);
      if (prev.credits < upgradeCost) {
        result = { success: false, message: `Insufficient credits. Need ${upgradeCost}.` };
        return prev;
      }

      result = { success: true, message: `${roomDef.name} upgraded to level ${roomState.level + 1}!` };

      return {
        ...prev,
        rooms: prev.rooms.map(r =>
          r.roomId === roomId ? { ...r, level: r.level + 1 } : r
        ),
        credits: prev.credits - upgradeCost,
        totalCreditsSpent: prev.totalCreditsSpent + upgradeCost,
      };
    });

    if (result && result.success) {
      addLog('upgrade', result.message, `Room: ${roomId}`);
    }

    return result;
  }, [addLog]);

  // ── Research Technology ────────────────────────────────────────

  const researchTechnology = useCallback((techId: string) => {
    const techDef = AL_getTechById(techId);
    if (!techDef) return null;

    let result: { success: boolean; message: string; xpGained: number } | null = null;

    setState(prev => {
      const techState = prev.technologies.find(t => t.techId === techId);
      if (!techState || techState.status === 'completed' || techState.status === 'researching') {
        result = { success: false, message: 'Technology is not available for research.', xpGained: 0 };
        return prev;
      }

      if (prev.level < techDef.requiredLevel) {
        result = { success: false, message: `Requires laboratory level ${techDef.requiredLevel}.`, xpGained: 0 };
        return prev;
      }

      if (prev.credits < techDef.cost) {
        result = { success: false, message: `Insufficient credits. Need ${techDef.cost}.`, xpGained: 0 };
        return prev;
      }

      const xpGain = Math.floor(techDef.researchTime * 2);

      result = { success: true, message: `Researched ${techDef.name}! ${techDef.description}`, xpGained: xpGain };

      const updatedTechs = prev.technologies.map(t => {
        if (t.techId === techId) {
          return { ...t, status: 'completed' as ALResearchStatus, progress: 100, completedAt: Date.now() };
        }
        if (t.status === 'locked') {
          const def = AL_getTechById(t.techId);
          if (def && def.requiredLevel <= prev.level) {
            return { ...t, status: 'available' as ALResearchStatus };
          }
        }
        return t;
      });

      const updatedExperiments = prev.experiments.map(e => {
        if (e.status === 'locked') {
          const expDef = AL_getExperimentById(e.experimentId);
          if (expDef && expDef.requiredTech) {
            const reqTech = updatedTechs.find(t => t.techId === expDef.requiredTech);
            if (reqTech && reqTech.status === 'completed') {
              return { ...e, status: 'available' as ALExperimentStatus };
            }
          }
        }
        return e;
      });

      const updatedRooms = prev.rooms.map(r => {
        if (!r.isUnlocked) {
          const roomDef = AL_getRoomById(r.roomId);
          if (roomDef && roomDef.unlockLevel <= prev.level) {
            return { ...r, isUnlocked: true };
          }
        }
        return r;
      });

      return {
        ...prev,
        technologies: updatedTechs,
        experiments: updatedExperiments,
        rooms: updatedRooms,
        credits: prev.credits - techDef.cost,
        totalCreditsSpent: prev.totalCreditsSpent + techDef.cost,
        researchedTechCount: prev.researchedTechCount + 1,
      };
    });

    if (result && result.success) {
      addXP(result.xpGained);
      addLog('tech', result.message, `Technology: ${techId}`);
    }

    return result;
  }, [addXP, addLog]);

  // ── Study Artifact ─────────────────────────────────────────────

  const studyArtifact = useCallback((artifactId: string) => {
    const artifactDef = AL_getArtifactById(artifactId);
    if (!artifactDef) return null;

    let result: { success: boolean; message: string; xpGained: number } | null = null;

    setState(prev => {
      const artifactState = prev.artifacts.find(a => a.artifactId === artifactId);
      if (!artifactState || !artifactState.isOwned) {
        result = { success: false, message: 'Artifact not owned.', xpGained: 0 };
        return prev;
      }

      if (artifactState.isStudied) {
        result = { success: false, message: 'Artifact has already been fully studied.', xpGained: 0 };
        return prev;
      }

      const studyIncrement = 25;
      const newProgress = Math.min(100, artifactState.studyProgress + studyIncrement);
      const isComplete = newProgress >= 100;
      const xpGain = Math.floor(artifactDef.value * 0.5);

      result = {
        success: true,
        message: isComplete
          ? `Fully studied ${artifactDef.name}! Gained deep knowledge.`
          : `Studying ${artifactDef.name}... Progress: ${newProgress}%`,
        xpGained: xpGain,
      };

      return {
        ...prev,
        artifacts: prev.artifacts.map(a =>
          a.artifactId === artifactId
            ? { ...a, studyProgress: newProgress, isStudied: isComplete }
            : a
        ),
      };
    });

    if (result && result.success) {
      addXP(result.xpGained);
      addLog('artifact', result.message, `Artifact: ${artifactId}`);
    }

    return result;
  }, [addXP, addLog]);

  // ── Daily Anomaly ──────────────────────────────────────────────

  const generateDailyAnomaly = useCallback(() => {
    setState(prev => {
      const today = AL_getTodayString();
      if (prev.dailyAnomalyDate === today && prev.dailyAnomaly) {
        return prev;
      }

      const anomalyDef = AL_randomPick(AL_ANOMALY_TYPES);
      const newAnomaly: ALDailyAnomaly = {
        id: AL_generateId(),
        anomalyType: anomalyDef.id,
        hasBeenInvestigated: false,
        investigatedAt: null,
        rewardXP: anomalyDef.rewardXP,
        rewardCredits: anomalyDef.rewardCredits,
        artifactFound: AL_chance(anomalyDef.artifactChance) ? AL_randomPick(AL_ARTIFACTS).id : null,
        speciesFound: AL_chance(anomalyDef.speciesChance) ? AL_randomPick(AL_SPECIES_TYPES).id : null,
      };

      return {
        ...prev,
        dailyAnomaly: newAnomaly,
        dailyAnomalyDate: today,
      };
    });
  }, []);

  const investigateAnomaly = useCallback(() => {
    let result: {
      success: boolean;
      message: string;
      xpGained: number;
      creditsGained: number;
      artifactFound: string | null;
      speciesFound: string | null;
    } | null = null;

    setState(prev => {
      if (!prev.dailyAnomaly || prev.dailyAnomaly.hasBeenInvestigated) {
        result = {
          success: false,
          message: 'No anomaly to investigate today.',
          xpGained: 0,
          creditsGained: 0,
          artifactFound: null,
          speciesFound: null,
        };
        return prev;
      }

      const anomaly = prev.dailyAnomaly;
      const anomalyDef = AL_ANOMALY_TYPES.find(a => a.id === anomaly.anomalyType);

      const artifactId: string | null = anomaly.artifactFound;
      const speciesId: string | null = anomaly.speciesFound;

      const updatedArtifacts = prev.artifacts.map(a => {
        if (artifactId && a.artifactId === artifactId && !a.isOwned) {
          return { ...a, isOwned: true, acquiredAt: Date.now() };
        }
        return a;
      });

      const artifactCountAfter = updatedArtifacts.filter(a => a.isOwned).length;

      result = {
        success: true,
        message: anomalyDef ? `Investigated: ${anomalyDef.name}` : 'Anomaly investigated!',
        xpGained: anomaly.rewardXP,
        creditsGained: anomaly.rewardCredits,
        artifactFound: artifactId,
        speciesFound: speciesId,
      };

      return {
        ...prev,
        dailyAnomaly: { ...anomaly, hasBeenInvestigated: true, investigatedAt: Date.now() },
        artifacts: updatedArtifacts,
        artifactsCollected: artifactCountAfter,
      };
    });

    if (result && result.success) {
      addXP(result.xpGained);
      earnCredits(result.creditsGained);
      addLog(
        'anomaly',
        result.message,
        `XP: ${result.xpGained}, Credits: ${result.creditsGained}, Artifact: ${result.artifactFound ?? 'none'}, Species: ${result.speciesFound ?? 'none'}`
      );
    }

    return result;
  }, [addXP, earnCredits, addLog]);

  // ── Containment Breach Events ──────────────────────────────────

  const triggerBreach = useCallback((breachTypeId?: string) => {
    let breachResult: ALContainmentBreach | null = null;

    setState(prev => {
      const breachType = breachTypeId
        ? AL_CONTAINMENT_BREACH_TYPES.find(b => b.id === breachTypeId) ?? AL_randomPick(AL_CONTAINMENT_BREACH_TYPES)
        : AL_randomPick(AL_CONTAINMENT_BREACH_TYPES);

      const breach: ALContainmentBreach = {
        id: AL_generateId(),
        breachType: breachType.id,
        isActive: true,
        startedAt: Date.now(),
        resolvedAt: null,
        severity: breachType.severity,
        creditsLost: breachType.creditLoss,
        xpLost: breachType.xpLoss,
      };

      breachResult = breach;

      return {
        ...prev,
        activeBreaches: [...prev.activeBreaches, breach],
        credits: Math.max(0, prev.credits - breachType.creditLoss),
        totalCreditsSpent: prev.totalCreditsSpent + breachType.creditLoss,
      };
    });

    if (breachResult) {
      const breachDef = AL_CONTAINMENT_BREACH_TYPES.find(b => b.id === breachResult!.breachType);
      addLog(
        'breach',
        `CONTAINMENT BREACH: ${breachDef?.name ?? 'Unknown'}!`,
        `Severity: ${breachDef?.severity ?? 'unknown'}, Credits lost: ${breachResult.creditsLost}`
      );
    }

    return breachResult;
  }, [addLog]);

  const resolveBreach = useCallback((breachId: string) => {
    let result: { success: boolean; message: string; xpGained: number } | null = null;

    setState(prev => {
      const breach = prev.activeBreaches.find(b => b.id === breachId);
      if (!breach || !breach.isActive) {
        result = { success: false, message: 'Breach not found or already resolved.', xpGained: 0 };
        return prev;
      }

      const breachDef = AL_CONTAINMENT_BREACH_TYPES.find(b => b.id === breach.breachType);
      const xpGain = breachDef ? breachDef.threatReduction * 10 : 50;

      result = { success: true, message: `Breach resolved! Earned ${xpGain} XP.`, xpGained: xpGain };

      return {
        ...prev,
        activeBreaches: prev.activeBreaches.map(b =>
          b.id === breachId ? { ...b, isActive: false, resolvedAt: Date.now() } : b
        ),
        breachesSurvived: prev.breachesSurvived + 1,
      };
    });

    if (result && result.success) {
      addXP(result.xpGained);
      addLog('breach', result.message, `Breach ID: ${breachId}`);
    }

    return result;
  }, [addXP, addLog]);

  // ── Healing ────────────────────────────────────────────────────

  const healSpecimen = useCallback((specimenId: string) => {
    let result: { success: boolean; message: string } | null = null;

    setState(prev => {
      const specimen = prev.specimens.find(s => s.id === specimenId);
      if (!specimen || specimen.status === 'deceased') {
        result = { success: false, message: 'Cannot heal this specimen.' };
        return prev;
      }

      if (specimen.health >= specimen.maxHealth) {
        result = { success: false, message: 'Specimen is already at full health.' };
        return prev;
      }

      const healCost = AL_calculateHealCost(specimen);
      if (prev.credits < healCost) {
        result = { success: false, message: `Insufficient credits. Need ${healCost} credits.` };
        return prev;
      }

      result = { success: true, message: `Healed ${specimen.name} to full health.` };

      return {
        ...prev,
        specimens: prev.specimens.map(s =>
          s.id === specimenId
            ? { ...s, health: s.maxHealth, status: 'healthy' as ALSpecimenStatus }
            : s
        ),
        credits: prev.credits - healCost,
        totalCreditsSpent: prev.totalCreditsSpent + healCost,
      };
    });

    if (result && result.success) {
      addLog('credits', result.message, `Specimen: ${specimenId}`);
    }

    return result;
  }, [addLog]);

  // ── Assign to Room ─────────────────────────────────────────────

  const assignSpecimenToRoom = useCallback((specimenId: string, roomId: string) => {
    let result: { success: boolean; message: string } | null = null;

    setState(prev => {
      const specimen = prev.specimens.find(s => s.id === specimenId);
      const room = prev.rooms.find(r => r.roomId === roomId);

      if (!specimen || !room) {
        result = { success: false, message: 'Invalid specimen or room.' };
        return prev;
      }

      if (!room.isUnlocked) {
        result = { success: false, message: 'Room is not unlocked.' };
        return prev;
      }

      const roomDef = AL_getRoomById(roomId);
      const effectiveCapacity = roomDef ? roomDef.capacity + room.level * 2 : 0;
      if (room.specimensInRoom >= effectiveCapacity) {
        result = { success: false, message: 'Room is at capacity.' };
        return prev;
      }

      const oldRoomId = specimen.roomAssigned;
      const updatedRooms = prev.rooms.map(r => {
        if (r.roomId === roomId) {
          return { ...r, specimensInRoom: r.specimensInRoom + 1 };
        }
        if (oldRoomId && r.roomId === oldRoomId) {
          return { ...r, specimensInRoom: Math.max(0, r.specimensInRoom - 1) };
        }
        return r;
      });

      result = { success: true, message: `${specimen.name} assigned to ${roomDef?.name ?? roomId}.` };

      return {
        ...prev,
        specimens: prev.specimens.map(s =>
          s.id === specimenId ? { ...s, roomAssigned: roomId } : s
        ),
        rooms: updatedRooms,
      };
    });

    return result;
  }, []);

  // ── Equip Artifact ─────────────────────────────────────────────

  const equipArtifact = useCallback((artifactId: string) => {
    setState(prev => ({
      ...prev,
      artifacts: prev.artifacts.map(a => ({
        ...a,
        isEquipped: a.artifactId === artifactId && a.isOwned ? true : false,
      })),
    }));
  }, []);

  // ── Release Specimen ───────────────────────────────────────────

  const releaseSpecimen = useCallback((specimenId: string) => {
    let result: { success: boolean; message: string; creditsGained: number } | null = null;

    setState(prev => {
      const specimen = prev.specimens.find(s => s.id === specimenId);
      if (!specimen) {
        result = { success: false, message: 'Specimen not found.', creditsGained: 0 };
        return prev;
      }

      const species = AL_getSpeciesById(specimen.speciesId);
      const refund = Math.floor(30 * AL_RARITY_MULTIPLIER[species?.rarity ?? 'common']);

      result = { success: true, message: `Released ${specimen.name}. Gained ${refund} credits.`, creditsGained: refund };

      const oldRoomId = specimen.roomAssigned;
      const updatedRooms = prev.rooms.map(r => {
        if (oldRoomId && r.roomId === oldRoomId) {
          return { ...r, specimensInRoom: Math.max(0, r.specimensInRoom - 1) };
        }
        return r;
      });

      return {
        ...prev,
        specimens: prev.specimens.filter(s => s.id !== specimenId),
        credits: prev.credits + refund,
        totalCreditsEarned: prev.totalCreditsEarned + refund,
        rooms: updatedRooms,
      };
    });

    if (result && result.success) {
      earnCredits(result.creditsGained);
      addLog('credits', result.message, `Released specimen: ${specimenId}`);
    }

    return result;
  }, [earnCredits, addLog]);

  // ── Unlock Room ────────────────────────────────────────────────

  const unlockRoom = useCallback((roomId: string) => {
    const roomDef = AL_getRoomById(roomId);
    if (!roomDef) return null;

    let result: { success: boolean; message: string } | null = null;

    setState(prev => {
      const roomState = prev.rooms.find(r => r.roomId === roomId);
      if (!roomState) {
        return prev;
      }

      if (roomState.isUnlocked) {
        result = { success: false, message: 'Room is already unlocked.' };
        return prev;
      }

      if (prev.level < roomDef.unlockLevel) {
        result = { success: false, message: `Requires laboratory level ${roomDef.unlockLevel}.` };
        return prev;
      }

      const unlockCost = roomDef.upgradeCost;
      if (prev.credits < unlockCost) {
        result = { success: false, message: `Insufficient credits. Need ${unlockCost}.` };
        return prev;
      }

      result = { success: true, message: `Unlocked ${roomDef.name}!` };

      return {
        ...prev,
        rooms: prev.rooms.map(r =>
          r.roomId === roomId ? { ...r, isUnlocked: true } : r
        ),
        credits: prev.credits - unlockCost,
        totalCreditsSpent: prev.totalCreditsSpent + unlockCost,
      };
    });

    if (result && result.success) {
      addLog('upgrade', result.message, `Room: ${roomId}`);
    }

    return result;
  }, [addLog]);

  // ── Update Settings ────────────────────────────────────────────

  const updateSettings = useCallback((newSettings: Partial<ALGameState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  // ── Reset Game ─────────────────────────────────────────────────

  const resetGame = useCallback(() => {
    setState(AL_createInitialGameState());
  }, []);

  // ── Check Achievements ─────────────────────────────────────────

  const checkAchievements = useCallback(() => {
    setState(prev => {
      const counts = {
        researchedSpecies: prev.researchedSpeciesCount,
        totalExperiments: prev.totalExperiments,
        successfulClones: prev.successfulClones,
        researchedTechs: prev.researchedTechCount,
        artifactsCollected: prev.artifactsCollected,
        breachesSurvived: prev.breachesSurvived,
        highRiskSuccess: prev.highRiskSuccess,
        legendaryResearched: prev.legendaryResearched,
        level: prev.level,
      };

      let changed = false;
      const updatedAchievements = prev.achievements.map(ach => {
        if (ach.isUnlocked) return ach;

        const achDef = AL_getAchievementById(ach.achievementId);
      if (!achDef) return ach;
      const match = achDef.condition.match(/(\w+)\s*>=\s*(\d+)/);
        if (!match) return ach;

        const key = match[1] as keyof typeof counts;
        const target = parseInt(match[2], 10);
        const current = counts[key] ?? 0;

        const newProgress = Math.min(current, ach.target);

        if (current >= target) {
          changed = true;
          return { ...ach, isUnlocked: true, unlockedAt: Date.now(), progress: newProgress };
        }

        if (newProgress !== ach.progress) {
          changed = true;
        }
        return { ...ach, progress: newProgress };
      });

      if (!changed) return prev;
      return { ...prev, achievements: updatedAchievements };
    });
  }, []);

  // ── Collect Achievement Rewards (called after checkAchievements) ─

  const collectAchievementRewards = useCallback((state: ALGameState) => {
    const newlyUnlocked = state.achievements.filter(ach => {
      return ach.isUnlocked && ach.unlockedAt !== null && ach.unlockedAt > Date.now() - 2000;
    });

    for (const ach of newlyUnlocked) {
      const achDef = AL_getAchievementById(ach.achievementId);
      if (achDef) {
        addXP(achDef.rewardXP);
        earnCredits(achDef.rewardCredits);
        addLog('achievement', `Achievement Unlocked: ${achDef.name}!`, achDef.description);
      }
    }
  }, [addXP, earnCredits, addLog]);

  // ── Get Available Species to Research ──────────────────────────

  const getAvailableSpeciesToResearch = useCallback((currentState: ALGameState) => {
    const researchedIds = new Set(
      currentState.specimens
        .filter(sp => sp.isResearched)
        .map(sp => sp.speciesId)
    );
    return AL_SPECIES_TYPES.filter(sp => !researchedIds.has(sp.id));
  }, []);

  // ── Get Experiment Outcomes ────────────────────────────────────

  const getExperimentOutcomes = useCallback((experimentId: string) => {
    const exp = AL_getExperimentById(experimentId);
    return exp ? [...exp.outcomes] : [];
  }, []);

  // ── Get Species Info ───────────────────────────────────────────

  const getSpeciesInfo = useCallback((speciesId: string) => {
    return AL_getSpeciesById(speciesId) ?? null;
  }, []);

  // ── Get Room Info ──────────────────────────────────────────────

  const getRoomInfo = useCallback((roomId: string) => {
    return AL_getRoomById(roomId) ?? null;
  }, []);

  // ── Get Tech Info ──────────────────────────────────────────────

  const getTechInfo = useCallback((techId: string) => {
    return AL_getTechById(techId) ?? null;
  }, []);

  // ── Get Artifact Info ──────────────────────────────────────────

  const getArtifactInfo = useCallback((artifactId: string) => {
    return AL_getArtifactById(artifactId) ?? null;
  }, []);

  // ── Calculate Room Upgrade Cost ────────────────────────────────

  const getRoomUpgradeCost = useCallback((roomId: string) => {
    const roomDef = AL_getRoomById(roomId);
    if (!roomDef) return 0;
    const roomState = state.rooms.find(r => r.roomId === roomId);
    if (!roomState) return roomDef.upgradeCost;
    return AL_calculateUpgradeCost(roomDef, roomState.level);
  }, [state.rooms]);

  // ── Calculate Clone Cost ───────────────────────────────────────

  const getCloneCost = useCallback((specimenId: string) => {
    const specimen = state.specimens.find(s => s.id === specimenId);
    if (!specimen) return 0;
    const species = AL_getSpeciesById(specimen.speciesId);
    if (!species) return 100;
    return AL_calculateCloneCost(species.rarity);
  }, [state.specimens]);

  // ── Calculate Heal Cost ────────────────────────────────────────

  const getHealCost = useCallback((specimenId: string) => {
    const specimen = state.specimens.find(s => s.id === specimenId);
    if (!specimen) return 0;
    return AL_calculateHealCost(specimen);
  }, [state.specimens]);

  // ── Get Experiment Success Chance ──────────────────────────────

  const getExperimentSuccessChance = useCallback((experimentId: string, specimenId: string | null) => {
    const experimentDef = AL_getExperimentById(experimentId);
    if (!experimentDef) return 0;

    let roomBonus = 1;
    if (specimenId) {
      const specimen = state.specimens.find(s => s.id === specimenId);
      if (specimen && specimen.roomAssigned) {
        roomBonus = AL_getRoomById(specimen.roomAssigned)?.bonuses.researchSpeed ?? 1;
      }
    }

    return Math.min(experimentDef.successChance * roomBonus, 0.95);
  }, [state.specimens]);

  // ═══════════════════════════════════════════════════════════════
  // COMPUTED VALUES (useMemo)
  // ═══════════════════════════════════════════════════════════════

  const currentTitleData = useMemo(() => {
    return AL_TITLES.find(t => t.id === state.currentTitle) ?? AL_TITLES[0];
  }, [state.currentTitle]);

  const nextTitle = useMemo(() => {
    const currentIdx = AL_TITLES.findIndex(t => t.id === state.currentTitle);
    return currentIdx < AL_TITLES.length - 1 ? AL_TITLES[currentIdx + 1] : null;
  }, [state.currentTitle]);

  const xpToNextLevel = useMemo(() => {
    if (state.level >= AL_MAX_LEVEL) return 0;
    return AL_xpForLevel(state.level);
  }, [state.level]);

  const xpProgress = useMemo(() => {
    if (state.level >= AL_MAX_LEVEL) return 100;
    const needed = AL_xpForLevel(state.level);
    return needed > 0 ? Math.floor((state.xp / needed) * 100) : 0;
  }, [state.xp, state.level]);

  const levelProgress = useMemo(() => {
    return (state.level / AL_MAX_LEVEL) * 100;
  }, [state.level]);

  const specimensByRarity = useMemo(() => {
    const map: Record<string, number> = {};
    for (const rarity of AL_RARITY_TIERS) {
      map[rarity] = state.specimens.filter(s => {
        const species = AL_getSpeciesById(s.speciesId);
        return species && species.rarity === rarity;
      }).length;
    }
    return map;
  }, [state.specimens]);

  const speciesCompletionPercent = useMemo(() => {
    return Math.floor((state.researchedSpeciesCount / AL_SPECIES_TYPES.length) * 100);
  }, [state.researchedSpeciesCount]);

  const techCompletionPercent = useMemo(() => {
    return Math.floor((state.researchedTechCount / AL_TECHNOLOGIES.length) * 100);
  }, [state.researchedTechCount]);

  const artifactCompletionPercent = useMemo(() => {
    return Math.floor((state.artifactsCollected / AL_ARTIFACTS.length) * 100);
  }, [state.artifactsCollected]);

  const achievementCompletionPercent = useMemo(() => {
    const unlocked = state.achievements.filter(a => a.isUnlocked).length;
    return Math.floor((unlocked / AL_ACHIEVEMENTS.length) * 100);
  }, [state.achievements]);

  const unlockedAchievements = useMemo(() => {
    return state.achievements.filter(a => a.isUnlocked);
  }, [state.achievements]);

  const lockedAchievements = useMemo(() => {
    return state.achievements.filter(a => !a.isUnlocked);
  }, [state.achievements]);

  const activeBreaches = useMemo(() => {
    return state.activeBreaches.filter(b => b.isActive);
  }, [state.activeBreaches]);

  const breachHistory = useMemo(() => {
    return state.activeBreaches.filter(b => !b.isActive);
  }, [state.activeBreaches]);

  const healthySpecimens = useMemo(() => {
    return state.specimens.filter(s => s.status === 'healthy');
  }, [state.specimens]);

  const criticalSpecimens = useMemo(() => {
    return state.specimens.filter(s => s.status === 'critical' || s.status === 'injured');
  }, [state.specimens]);

  const availableExperiments = useMemo(() => {
    return state.experiments.filter(e => e.status === 'available');
  }, [state.experiments]);

  const availableTechnologies = useMemo(() => {
    return state.technologies.filter(t => t.status === 'available');
  }, [state.technologies]);

  const completedTechnologies = useMemo(() => {
    return state.technologies.filter(t => t.status === 'completed');
  }, [state.technologies]);

  const ownedArtifacts = useMemo(() => {
    return state.artifacts.filter(a => a.isOwned);
  }, [state.artifacts]);

  const equippedArtifacts = useMemo(() => {
    return state.artifacts.filter(a => a.isEquipped);
  }, [state.artifacts]);

  const unownedArtifacts = useMemo(() => {
    return state.artifacts.filter(a => !a.isOwned);
  }, [state.artifacts]);

  const unstudiedArtifacts = useMemo(() => {
    return state.artifacts.filter(a => a.isOwned && !a.isStudied);
  }, [state.artifacts]);

  const studiedArtifacts = useMemo(() => {
    return state.artifacts.filter(a => a.isStudied);
  }, [state.artifacts]);

  const unlockedRooms = useMemo(() => {
    return state.rooms.filter(r => r.isUnlocked);
  }, [state.rooms]);

  const lockedRooms = useMemo(() => {
    return state.rooms.filter(r => !r.isUnlocked);
  }, [state.rooms]);

  const specimenCount = useMemo(() => {
    return state.specimens.length;
  }, [state.specimens]);

  const totalSpecimenValue = useMemo(() => {
    return state.specimens.reduce((sum, s) => {
      const species = AL_getSpeciesById(s.speciesId);
      return sum + (species ? Math.floor(50 * AL_RARITY_MULTIPLIER[species.rarity]) * s.level : 0);
    }, 0);
  }, [state.specimens]);

  const labPower = useMemo(() => {
    const techBonus = completedTechnologies.length * 5;
    const roomBonus = unlockedRooms.reduce((sum, r) => sum + r.level * 3, 0);
    const artifactBonus = equippedArtifacts.reduce((sum, a) => {
      const def = AL_getArtifactById(a.artifactId);
      const bonus = def?.bonus as Record<string, number> | undefined;
      return sum + (bonus?.powerBonus ?? 0);
    }, 0);
    return state.level * 10 + techBonus + roomBonus + artifactBonus;
  }, [state.level, completedTechnologies, unlockedRooms, equippedArtifacts]);

  const containmentRating = useMemo(() => {
    const baseRating = 50;
    const roomBonus = unlockedRooms.reduce((sum, r) => {
      const roomDef = AL_getRoomById(r.roomId);
      return sum + (roomDef?.bonuses.containmentStrength ?? 0) * r.level * 10;
    }, 0);
    const techBonus = completedTechnologies.filter(t => {
      const techDef = AL_getTechById(t.techId);
      return techDef !== undefined && Object.prototype.hasOwnProperty.call(techDef.effect, 'containmentBonus');
    }).length * 8;
    return Math.min(100, Math.floor(baseRating + roomBonus + techBonus - activeBreaches.length * 15));
  }, [unlockedRooms, completedTechnologies, activeBreaches]);

  const researchEfficiency = useMemo(() => {
    const base = 100;
    const roomBonus = unlockedRooms.reduce((sum, r) => {
      const roomDef = AL_getRoomById(r.roomId);
      return sum + (roomDef?.bonuses.researchSpeed ?? 0) * r.level * 5;
    }, 0);
    const techBonus = completedTechnologies.length * 3;
    const artifactBonus = equippedArtifacts.reduce((sum, a) => {
      const def = AL_getArtifactById(a.artifactId);
      const bonus = def?.bonus as Record<string, number> | undefined;
      return sum + (bonus?.researchSpeedBonus ?? 0);
    }, 0);
    return Math.min(300, Math.floor(base + roomBonus + techBonus + artifactBonus));
  }, [unlockedRooms, completedTechnologies, equippedArtifacts]);

  const anomalyAvailable = useMemo(() => {
    if (!state.dailyAnomaly) return false;
    return !state.dailyAnomaly.hasBeenInvestigated;
  }, [state.dailyAnomaly]);

  const dailyAnomalyData = useMemo(() => {
    if (!state.dailyAnomaly) return null;
    const anomalyDef = AL_ANOMALY_TYPES.find(a => a.id === state.dailyAnomaly.anomalyType);
    return anomalyDef ?? null;
  }, [state.dailyAnomaly]);

  const recentLog = useMemo(() => {
    return state.log.slice(0, 50);
  }, [state.log]);

  const experimentSuccessRate = useMemo(() => {
    const total = state.experiments.reduce((sum, e) => sum + e.timesRun, 0);
    if (total === 0) return 0;
    const successes = state.experiments.reduce((sum, e) => sum + e.timesSucceeded, 0);
    return Math.floor((successes / total) * 100);
  }, [state.experiments]);

  const topSpecies = useMemo(() => {
    return [...state.specimens]
      .sort((a, b) => b.threatLevel - a.threatLevel)
      .slice(0, 5)
      .map(s => {
        const species = AL_getSpeciesById(s.speciesId);
        return { ...s, speciesData: species };
      });
  }, [state.specimens]);

  const rarityDistribution = useMemo(() => {
    const dist: Record<string, { count: number; color: string }> = {};
    for (const rarity of AL_RARITY_TIERS) {
      const count = state.specimens.filter(s => {
        const species = AL_getSpeciesById(s.speciesId);
        return species && species.rarity === rarity;
      }).length;
      dist[rarity] = { count, color: AL_RARITY_COLORS[rarity] };
    }
    return dist;
  }, [state.specimens]);

  const totalBonusStats = useMemo(() => {
    const bonuses = {
      psionicsBonus: 0,
      containmentBonus: 0,
      healingBonus: 0,
      communicationBonus: 0,
      researchSpeedBonus: 0,
      powerBonus: 0,
      discoveryBonus: 0,
      storageBonus: 0,
    };

    for (const a of equippedArtifacts) {
      const def = AL_getArtifactById(a.artifactId);
      if (def) {
        const b = def.bonus as Record<string, number>;
        bonuses.psionicsBonus += b.psionicsBonus ?? 0;
        bonuses.containmentBonus += b.containmentBonus ?? 0;
        bonuses.healingBonus += b.healingBonus ?? 0;
        bonuses.communicationBonus += b.communicationBonus ?? 0;
        bonuses.researchSpeedBonus += b.researchSpeedBonus ?? 0;
        bonuses.powerBonus += b.powerBonus ?? 0;
        bonuses.discoveryBonus += b.discoveryBonus ?? 0;
        bonuses.storageBonus += b.storageBonus ?? 0;
      }
    }

    return bonuses;
  }, [equippedArtifacts]);

  const weeklySummary = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weekLogs = state.log.filter(l => l.timestamp >= weekAgo);
    const experimentsThisWeek = weekLogs.filter(l => l.type === 'experiment').length;
    const speciesThisWeek = weekLogs.filter(l => l.type === 'research').length;
    const breachesThisWeek = weekLogs.filter(l => l.type === 'breach').length;
    const anomaliesThisWeek = weekLogs.filter(l => l.type === 'anomaly').length;
    return {
      experimentsThisWeek,
      speciesThisWeek,
      breachesThisWeek,
      anomaliesThisWeek,
      totalActivity: weekLogs.length,
    };
  }, [state.log]);

  // ── Dashboard Stats (single computed object) ────────────────────

  const dashboardStats = useMemo(() => {
    return {
      level: state.level,
      maxLevel: AL_MAX_LEVEL,
      xp: state.xp,
      xpToNext: xpToNextLevel,
      xpProgress,
      credits: state.credits,
      totalCreditsEarned: state.totalCreditsEarned,
      totalCreditsSpent: state.totalCreditsSpent,
      title: currentTitleData,
      nextTitle,
      specimensCount: specimenCount,
      researchedSpecies: state.researchedSpeciesCount,
      totalSpecies: AL_SPECIES_TYPES.length,
      speciesCompletion: speciesCompletionPercent,
      researchedTechs: state.researchedTechCount,
      totalTechs: AL_TECHNOLOGIES.length,
      techCompletion: techCompletionPercent,
      artifactsCollected: state.artifactsCollected,
      totalArtifacts: AL_ARTIFACTS.length,
      artifactCompletion: artifactCompletionPercent,
      achievementsUnlocked: unlockedAchievements.length,
      totalAchievements: AL_ACHIEVEMENTS.length,
      achievementCompletion: achievementCompletionPercent,
      totalExperiments: state.totalExperiments,
      experimentSuccessRate,
      successfulClones: state.successfulClones,
      breachesSurvived: state.breachesSurvived,
      highRiskSuccess: state.highRiskSuccess,
      legendaryResearched: state.legendaryResearched,
      labPower,
      containmentRating,
      researchEfficiency,
      activeBreaches: activeBreaches.length,
      anomalyAvailable,
      roomsUnlocked: unlockedRooms.length,
      totalRooms: AL_LAB_ROOMS.length,
      healthySpecimens: healthySpecimens.length,
      criticalSpecimens: criticalSpecimens.length,
      totalSpecimenValue,
      weeklySummary,
    };
  }, [
    state.level, state.xp, xpToNextLevel, xpProgress,
    state.credits, state.totalCreditsEarned, state.totalCreditsSpent,
    currentTitleData, nextTitle,
    specimenCount, state.researchedSpeciesCount, speciesCompletionPercent,
    state.researchedTechCount, techCompletionPercent,
    state.artifactsCollected, artifactCompletionPercent,
    unlockedAchievements.length, achievementCompletionPercent,
    state.totalExperiments, experimentSuccessRate,
    state.successfulClones, state.breachesSurvived,
    state.highRiskSuccess, state.legendaryResearched,
    labPower, containmentRating, researchEfficiency,
    activeBreaches.length, anomalyAvailable,
    unlockedRooms.length,
    healthySpecimens.length, criticalSpecimens.length,
    totalSpecimenValue, weeklySummary,
  ]);

  // ── Effect: Generate daily anomaly on mount ────────────────────

  useEffect(() => {
    generateDailyAnomaly();
  }, [generateDailyAnomaly]);

  // ── Effect: Check achievements on state changes ────────────────

  useEffect(() => {
    checkAchievements();
  }, [
    state.researchedSpeciesCount,
    state.totalExperiments,
    state.successfulClones,
    state.researchedTechCount,
    state.artifactsCollected,
    state.breachesSurvived,
    state.highRiskSuccess,
    state.legendaryResearched,
    state.level,
    checkAchievements,
  ]);

  // ── Effect: Collect achievement rewards after check ───────────

  useEffect(() => {
    collectAchievementRewards(state);
  }, [state.achievements, collectAchievementRewards, state]);

  // ── Effect: Update room/tech availability on level up ─────────

  useEffect(() => {
    setState(prev => {
      let changed = false;

      const updatedRooms = prev.rooms.map(r => {
        if (!r.isUnlocked) {
          const roomDef = AL_getRoomById(r.roomId);
          if (roomDef && roomDef.unlockLevel <= prev.level) {
            changed = true;
            return { ...r, isUnlocked: true };
          }
        }
        return r;
      });

      const updatedTechs = prev.technologies.map(t => {
        if (t.status === 'locked') {
          const techDef = AL_getTechById(t.techId);
          if (techDef && techDef.requiredLevel <= prev.level) {
            changed = true;
            return { ...t, status: 'available' as ALResearchStatus };
          }
        }
        return t;
      });

      const newTitle = AL_titleForLevel(prev.level);
      if (newTitle !== prev.currentTitle) {
        changed = true;
      }

      if (!changed) return prev;

      return {
        ...prev,
        rooms: updatedRooms,
        technologies: updatedTechs,
        currentTitle: newTitle,
      };
    });
  }, [state.level]);

  // ═══════════════════════════════════════════════════════════════
  // RETURN API
  // ═══════════════════════════════════════════════════════════════

  return {
    // ── State ───────────────────────────────────────────────────
    state,

    // ── Dashboard Stats ─────────────────────────────────────────
    dashboardStats,

    // ── Computed Values ─────────────────────────────────────────
    currentTitleData,
    nextTitle,
    xpToNextLevel,
    xpProgress,
    levelProgress,
    specimensByRarity,
    speciesCompletionPercent,
    techCompletionPercent,
    artifactCompletionPercent,
    achievementCompletionPercent,
    unlockedAchievements,
    lockedAchievements,
    activeBreaches,
    breachHistory,
    healthySpecimens,
    criticalSpecimens,
    availableExperiments,
    availableTechnologies,
    completedTechnologies,
    ownedArtifacts,
    equippedArtifacts,
    unownedArtifacts,
    unstudiedArtifacts,
    studiedArtifacts,
    unlockedRooms,
    lockedRooms,
    specimenCount,
    totalSpecimenValue,
    labPower,
    containmentRating,
    researchEfficiency,
    anomalyAvailable,
    dailyAnomalyData,
    recentLog,
    experimentSuccessRate,
    topSpecies,
    rarityDistribution,
    totalBonusStats,
    weeklySummary,

    // ── Actions ─────────────────────────────────────────────────
    researchSpecies,
    conductExperiment,
    cloneSpecimen,
    upgradeRoom,
    unlockRoom,
    researchTechnology,
    studyArtifact,
    investigateAnomaly,
    triggerBreach,
    resolveBreach,
    healSpecimen,
    assignSpecimenToRoom,
    releaseSpecimen,
    equipArtifact,
    generateDailyAnomaly,
    updateSettings,
    checkAchievements,
    collectAchievementRewards,
    resetGame,
    addXP,
    earnCredits,
    spendCredits,
    getAvailableSpeciesToResearch,
    getExperimentOutcomes,
    getSpeciesInfo,
    getRoomInfo,
    getTechInfo,
    getArtifactInfo,
    getRoomUpgradeCost,
    getCloneCost,
    getHealCost,
    getExperimentSuccessChance,

    // ── Constants (re-exported for convenience) ──────────────────
    SPECIES_TYPES: AL_SPECIES_TYPES,
    LAB_ROOMS: AL_LAB_ROOMS,
    TECHNOLOGIES: AL_TECHNOLOGIES,
    EXPERIMENTS: AL_EXPERIMENTS,
    ARTIFACTS: AL_ARTIFACTS,
    ACHIEVEMENTS: AL_ACHIEVEMENTS,
    TITLES: AL_TITLES,
    CONTAINMENT_BREACH_TYPES: AL_CONTAINMENT_BREACH_TYPES,
    ANOMALY_TYPES: AL_ANOMALY_TYPES,
    RARITY_TIERS: AL_RARITY_TIERS,
    RARITY_COLORS: AL_RARITY_COLORS,
    RARITY_MULTIPLIER: AL_RARITY_MULTIPLIER,
    RARITY_LABELS: AL_RARITY_LABELS,
    MAX_LEVEL: AL_MAX_LEVEL,
    XP_PER_LEVEL: AL_XP_PER_LEVEL,
    BASE_CREDITS: AL_BASE_CREDITS,
    COLOR_THEME: AL_COLOR_THEME,
    SPECIMEN_STATUS: AL_SPECIMEN_STATUS,
    EXPERIMENT_STATUS: AL_EXPERIMENT_STATUS,
    RESEARCH_STATUS: AL_RESEARCH_STATUS,
  };
}
