import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// =============================================================================
// Star Forge — 星际锻造  Wire for Word Snake
// Forge star components, assemble starships, harvest nebula materials, and
// command the cosmos. All exported functions use `sx` prefix.
// All constants use `SX_` prefix.
// =============================================================================

// =============================================================================
// Color Constants
// =============================================================================

const SX_COLOR_STAR = '#FFD700';
const SX_COLOR_PLASMA = '#FF4500';
const SX_COLOR_NEBULA = '#8B5CF6';
const SX_COLOR_DARKMATTER = '#0F172A';
const SX_COLOR_STELLAR = '#38BDF8';
const SX_COLOR_FORGE = '#F97316';
const SX_COLOR_ANTIMATTER = '#06B6D4';
const SX_COLOR_COMET = '#A78BFA';

// =============================================================================
// Rarity & Type Constants
// =============================================================================

const SX_RARITY_COMMON = 0;
const SX_RARITY_UNCOMMON = 1;
const SX_RARITY_RARE = 2;
const SX_RARITY_EPIC = 3;
const SX_RARITY_LEGENDARY = 4;

const SX_RARITY_NAMES: Record<number, string> = {
  [SX_RARITY_COMMON]: 'Common',
  [SX_RARITY_UNCOMMON]: 'Uncommon',
  [SX_RARITY_RARE]: 'Rare',
  [SX_RARITY_EPIC]: 'Epic',
  [SX_RARITY_LEGENDARY]: 'Legendary',
};

const SX_RARITY_COLORS: Record<number, string> = {
  [SX_RARITY_COMMON]: '#9CA3AF',
  [SX_RARITY_UNCOMMON]: SX_COLOR_STELLAR,
  [SX_RARITY_RARE]: SX_COLOR_FORGE,
  [SX_RARITY_EPIC]: SX_COLOR_PLASMA,
  [SX_RARITY_LEGENDARY]: SX_COLOR_STAR,
};

const SX_TYPE_HULL = 'hull';
const SX_TYPE_ENGINE = 'engine';
const SX_TYPE_WEAPON = 'weapon';
const SX_TYPE_SHIELD = 'shield';
const SX_TYPE_CORE = 'core';

const SX_TYPE_INFO: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  [SX_TYPE_HULL]: { label: 'Hull', icon: '🛡️', color: SX_COLOR_FORGE, desc: 'Structural plating and frame components for starship construction.' },
  [SX_TYPE_ENGINE]: { label: 'Engine', icon: '🚀', color: SX_COLOR_STELLAR, desc: 'Propulsion systems that thrust vessels across the cosmos.' },
  [SX_TYPE_WEAPON]: { label: 'Weapon', icon: '⚔️', color: SX_COLOR_PLASMA, desc: 'Offensive armaments for ship-to-ship combat and planetary assault.' },
  [SX_TYPE_SHIELD]: { label: 'Shield', icon: '🔰', color: SX_COLOR_COMET, desc: 'Defensive energy barriers protecting against weapons and debris.' },
  [SX_TYPE_CORE]: { label: 'Core', icon: '💎', color: SX_COLOR_STAR, desc: 'Central power reactors that supply energy to all ship systems.' },
};

// =============================================================================
// Types
// =============================================================================

interface SXForgeDef {
  id: string;
  name: string;
  description: string;
  heatLevel: number;
  unlockLevel: number;
}

interface SXComponentDef {
  id: string;
  name: string;
  rarity: number;
  type: string;
  power: number;
  durability: number;
  description: string;
}

interface SXMaterialDef {
  id: string;
  name: string;
  rarity: number;
  source: string;
  description: string;
}

interface SXStructureDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
}

interface SXBlueprintDef {
  id: string;
  name: string;
  description: string;
  requiredMaterials: { materialId: string; amount: number }[];
  rarity: number;
  result: string;
}

interface SXAbilityDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  power: number;
}

interface SXAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  reward: number;
}

interface SXTitleDef {
  id: string;
  name: string;
  requirement: number;
  description: string;
}

interface SXStarshipDef {
  id: string;
  name: string;
  description: string;
  shipClass: string;
  powerRating: number;
}

interface SXConstellationDef {
  id: string;
  name: string;
  description: string;
  bonus: string;
  unlockLevel: number;
}

// Instance types

interface SXForgeInstance {
  forgeId: string;
  active: boolean;
  level: number;
  totalOutput: number;
}

interface SXComponentInstance {
  instanceId: string;
  defId: string;
  name: string;
  rarity: number;
  type: string;
  power: number;
  durability: number;
  maxDurability: number;
  forgedAt: number;
}

interface SXMaterialStack {
  materialId: string;
  count: number;
}

interface SXStructureInstance {
  structureId: string;
  level: number;
}

interface SXBlueprintProgress {
  blueprintId: string;
  learned: boolean;
  timesCrafted: number;
}

interface SXStarshipInstance {
  instanceId: string;
  defId: string;
  name: string;
  shipClass: string;
  powerRating: number;
  launched: boolean;
  builtAt: number;
}

interface SXAchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface SXConstellationState {
  constellationId: string;
  aligned: boolean;
  bonusActive: boolean;
}

interface SXEventLog {
  id: string;
  timestamp: number;
  type: 'forge' | 'assemble' | 'launch' | 'collect' | 'smelt' | 'build' | 'upgrade' | 'blueprint' | 'trade' | 'sell' | 'decommission' | 'antimatter' | 'refine' | 'heat' | 'nebula' | 'constellation' | 'title' | 'achievement' | 'ship_upgrade';
  message: string;
  metadata?: Record<string, number | string | boolean>;
}

interface SXState {
  forges: SXForgeInstance[];
  components: SXComponentInstance[];
  materials: SXMaterialStack[];
  structures: SXStructureInstance[];
  blueprints: SXBlueprintProgress[];
  starships: SXStarshipInstance[];
  achievements: SXAchievementState[];
  constellations: SXConstellationState[];
  currentTitle: string;
  forgeLevel: number;
  forgeExp: number;
  gold: number;
  starEnergy: number;
  heat: number;
  totalForged: number;
  totalAssembled: number;
  totalLaunched: number;
  activeForgeId: string;
  constellationBonus: number;
  antimatter: number;
  // Tracking
  totalMaterialsCollected: number;
  totalOresSmelted: number;
  totalStructuresBuilt: number;
  totalTradesCompleted: number;
  totalComponentsSold: number;
  totalAntimatterGenerated: number;
  totalRefined: number;
  totalDecommissioned: number;
  eventLog: SXEventLog[];
}

// =============================================================================
// 8 Star Forges
// =============================================================================

const SX_FORGES: SXForgeDef[] = [
  {
    id: 'solar_crucible',
    name: 'Solar Crucible',
    description: 'A forge harnessing the concentrated fury of a captive star, ideal for melting common alloys and shaping basic hull plates.',
    heatLevel: 2000,
    unlockLevel: 1,
  },
  {
    id: 'nebula_kiln',
    name: 'Nebula Kiln',
    description: 'Fueled by compressed nebula gas, this kiln produces components with unique iridescent properties.',
    heatLevel: 3500,
    unlockLevel: 5,
  },
  {
    id: 'pulsar_foundry',
    name: 'Pulsar Foundry',
    description: 'A rhythmic forge that strikes with the precision of pulsar timing, creating perfectly balanced engine parts.',
    heatLevel: 5000,
    unlockLevel: 10,
  },
  {
    id: 'quasar_smithy',
    name: 'Quasar Smithy',
    description: 'The blinding energy of a quasar powers this smithy, capable of forging weapons of unimaginable destructive force.',
    heatLevel: 7500,
    unlockLevel: 18,
  },
  {
    id: 'supernova_anvil',
    name: 'Supernova Anvil',
    description: 'An anvil forged from the remnants of a supernova, each strike carries the force of an exploding star.',
    heatLevel: 10000,
    unlockLevel: 28,
  },
  {
    id: 'comet_workshop',
    name: 'Comet Workshop',
    description: 'A mobile workshop riding the tail of a comet, specializing in shields that absorb cosmic radiation.',
    heatLevel: 6500,
    unlockLevel: 15,
  },
  {
    id: 'black_hole_furnace',
    name: 'Black Hole Furnace',
    description: 'The ultimate furnace, using controlled gravitational collapse to compress matter into exotic forms.',
    heatLevel: 15000,
    unlockLevel: 38,
  },
  {
    id: 'stardust_mint',
    name: 'Stardust Mint',
    description: 'A delicate mint that presses stardust into coins and cores, the most precise forge in the galaxy.',
    heatLevel: 3000,
    unlockLevel: 8,
  },
];

// =============================================================================
// 35 Star Components (5 rarity tiers, 7 per tier)
// =============================================================================

const SX_COMPONENTS: SXComponentDef[] = [
  // Common (7)
  { id: 'comp_tin_hull_plate', name: 'Tin Hull Plate', rarity: SX_RARITY_COMMON, type: SX_TYPE_HULL, power: 8, durability: 60, description: 'A basic hull plate made from tin alloy, standard for entry-level vessels.' },
  { id: 'comp_ion_thruster', name: 'Ion Thruster', rarity: SX_RARITY_COMMON, type: SX_TYPE_ENGINE, power: 6, durability: 50, description: 'A simple ion propulsion unit providing modest thrust for short-range travel.' },
  { id: 'comp_laser_pistol', name: 'Laser Pistol Mount', rarity: SX_RARITY_COMMON, type: SX_TYPE_WEAPON, power: 10, durability: 40, description: 'A low-power laser weapon mount suitable for basic defense.' },
  { id: 'comp_magnetic_deflector', name: 'Magnetic Deflector', rarity: SX_RARITY_COMMON, type: SX_TYPE_SHIELD, power: 7, durability: 55, description: 'A magnetic shield that deflects small projectiles and space debris.' },
  { id: 'comp_solar_cell_core', name: 'Solar Cell Core', rarity: SX_RARITY_COMMON, type: SX_TYPE_CORE, power: 5, durability: 70, description: 'A basic power core converting starlight into ship energy.' },
  { id: 'comp_steel_bulkhead', name: 'Steel Bulkhead', rarity: SX_RARITY_COMMON, type: SX_TYPE_HULL, power: 9, durability: 65, description: 'Reinforced steel bulkhead for interior compartment separation.' },
  { id: 'comp_pulse_cannon', name: 'Pulse Cannon', rarity: SX_RARITY_COMMON, type: SX_TYPE_WEAPON, power: 12, durability: 35, description: 'A repeating pulse cannon that fires concentrated energy bolts.' },
  // Uncommon (7)
  { id: 'comp_titanium_armor', name: 'Titanium Armor Shell', rarity: SX_RARITY_UNCOMMON, type: SX_TYPE_HULL, power: 25, durability: 120, description: 'Lightweight titanium plating with superior resistance to micrometeorite impacts.' },
  { id: 'comp_plasma_drive', name: 'Plasma Drive Engine', rarity: SX_RARITY_UNCOMMON, type: SX_TYPE_ENGINE, power: 22, durability: 100, description: 'A plasma-based propulsion system offering significantly faster interstellar travel.' },
  { id: 'comp_disruptor_beam', name: 'Disruptor Beam Array', rarity: SX_RARITY_UNCOMMON, type: SX_TYPE_WEAPON, power: 28, durability: 85, description: 'An array of disruptor beams that weaken enemy shields on impact.' },
  { id: 'comp_energy_web', name: 'Energy Web Shield', rarity: SX_RARITY_UNCOMMON, type: SX_TYPE_SHIELD, power: 20, durability: 110, description: 'A web of interlocking energy threads that absorbs and disperses damage.' },
  { id: 'comp_fusion_reactor', name: 'Fusion Reactor Core', rarity: SX_RARITY_UNCOMMON, type: SX_TYPE_CORE, power: 18, durability: 130, description: 'A compact fusion reactor providing reliable power for medium-class ships.' },
  { id: 'comp_carbon_nano_fiber', name: 'Carbon Nano-Fiber Hull', rarity: SX_RARITY_UNCOMMON, type: SX_TYPE_HULL, power: 24, durability: 115, description: 'Advanced carbon nano-fiber plating that self-repairs minor damage.' },
  { id: 'comp_torpedo_launcher', name: 'Photon Torpedo Launcher', rarity: SX_RARITY_UNCOMMON, type: SX_TYPE_WEAPON, power: 30, durability: 75, description: 'Launches photon torpedoes that track targets across short distances.' },
  // Rare (7)
  { id: 'comp_neutronium_plate', name: 'Neutronium Hull Plate', rarity: SX_RARITY_RARE, type: SX_TYPE_HULL, power: 55, durability: 220, description: 'Plates forged from neutron-degenerate matter, nearly indestructible.' },
  { id: 'comp_warp_engine', name: 'Warp Drive Engine', rarity: SX_RARITY_RARE, type: SX_TYPE_ENGINE, power: 50, durability: 180, description: 'A warp-capable engine that bends spacetime for faster-than-light travel.' },
  { id: 'comp_quantum_lance', name: 'Quantum Lance', rarity: SX_RARITY_RARE, type: SX_TYPE_WEAPON, power: 60, durability: 150, description: 'A weapon that fires quantum-entangled particles that bypass conventional shields.' },
  { id: 'comp_phase_barrier', name: 'Phase Barrier Generator', rarity: SX_RARITY_RARE, type: SX_TYPE_SHIELD, power: 48, durability: 200, description: 'Shifts the ship partially out of phase, making it harder to hit.' },
  { id: 'comp_antimatter_core', name: 'Antimatter Core', rarity: SX_RARITY_RARE, type: SX_TYPE_CORE, power: 45, durability: 250, description: 'An antimatter reaction core producing immense energy for large vessels.' },
  { id: 'comp_adaptive_hull', name: 'Adaptive Nanite Hull', rarity: SX_RARITY_RARE, type: SX_TYPE_HULL, power: 52, durability: 210, description: 'A living hull of nanites that adapts its properties to incoming threats.' },
  { id: 'comp_plasma_storm', name: 'Plasma Storm Projector', rarity: SX_RARITY_RARE, type: SX_TYPE_WEAPON, power: 58, durability: 140, description: 'Projects a localized plasma storm that devastates nearby enemy ships.' },
  // Epic (7)
  { id: 'comp_dark_matter_shell', name: 'Dark Matter Shell', rarity: SX_RARITY_EPIC, type: SX_TYPE_HULL, power: 110, durability: 400, description: 'A shell woven from dark matter, rendering the ship nearly invisible to sensors.' },
  { id: 'comp_hyperspace_jumper', name: 'Hyperspace Jump Drive', rarity: SX_RARITY_EPIC, type: SX_TYPE_ENGINE, power: 105, durability: 350, description: 'A drive capable of instantaneous jumps across entire star systems.' },
  { id: 'comp_singularity_cannon', name: 'Singularity Cannon', rarity: SX_RARITY_EPIC, type: SX_TYPE_WEAPON, power: 120, durability: 300, description: 'Fires miniature black holes that consume everything in their path.' },
  { id: 'comp_temporal_shield', name: 'Temporal Shield Matrix', rarity: SX_RARITY_EPIC, type: SX_TYPE_SHIELD, power: 95, durability: 380, description: 'A shield that shifts damage through time, returning it to its source.' },
  { id: 'comp_zero_point_core', name: 'Zero-Point Energy Core', rarity: SX_RARITY_EPIC, type: SX_TYPE_CORE, power: 100, durability: 450, description: 'Taps into zero-point vacuum energy for theoretically unlimited power.' },
  { id: 'comp_cosmic_weave', name: 'Cosmic Weave Armor', rarity: SX_RARITY_EPIC, type: SX_TYPE_HULL, power: 108, durability: 390, description: 'Armor woven from the fabric of spacetime itself.' },
  { id: 'comp_nova_bomb_rack', name: 'Nova Bomb Rack', rarity: SX_RARITY_EPIC, type: SX_TYPE_WEAPON, power: 115, durability: 280, description: 'Carries nova bombs capable of devastating entire fleets in a single explosion.' },
  // Legendary (7)
  { id: 'comp_eternity_plate', name: 'Eternity Plate', rarity: SX_RARITY_LEGENDARY, type: SX_TYPE_HULL, power: 250, durability: 800, description: 'A hull plate that exists outside of time, immune to aging and decay.' },
  { id: 'comp_infinity_drive', name: 'Infinity Drive', rarity: SX_RARITY_LEGENDARY, type: SX_TYPE_ENGINE, power: 240, durability: 700, description: 'An engine that accesses the space between dimensions for infinite range.' },
  { id: 'comp_cosmic_scythe', name: 'Cosmic Scythe Beam', rarity: SX_RARITY_LEGENDARY, type: SX_TYPE_WEAPON, power: 260, durability: 600, description: 'A beam that cuts through matter at the subatomic level, leaving nothing behind.' },
  { id: 'comp_omni_barrier', name: 'Omni-Barrier Projector', rarity: SX_RARITY_LEGENDARY, type: SX_TYPE_SHIELD, power: 230, durability: 750, description: 'An impenetrable barrier that blocks all known forms of energy and matter.' },
  { id: 'comp_creation_core', name: 'Creation Core', rarity: SX_RARITY_LEGENDARY, type: SX_TYPE_CORE, power: 220, durability: 900, description: 'A core that generates its own matter and energy from nothing, sustaining the ship indefinitely.' },
  { id: 'comp_godship_hull', name: 'Godship Hull Fragment', rarity: SX_RARITY_LEGENDARY, type: SX_TYPE_HULL, power: 270, durability: 850, description: 'A fragment of the hull from an ancient god-ship, still radiating cosmic power.' },
  { id: 'comp_armageddon_lance', name: 'Armageddon Lance', rarity: SX_RARITY_LEGENDARY, type: SX_TYPE_WEAPON, power: 280, durability: 550, description: 'The ultimate weapon, capable of triggering localized stellar collapse.' },
];

// =============================================================================
// 30 Nebula Materials
// =============================================================================

const SX_NEBULA_MATERIALS: SXMaterialDef[] = [
  // Common (6)
  { id: 'mat_stardust', name: 'Stardust', rarity: SX_RARITY_COMMON, source: 'Nebula Harvesting', description: 'Fine particles shed by dying stars, a fundamental crafting material.' },
  { id: 'mat_plasma_ore', name: 'Plasma Ore', rarity: SX_RARITY_COMMON, source: 'Asteroid Mining', description: 'Raw ore infused with plasma energy from nearby stellar phenomena.' },
  { id: 'mat_helium_crystal', name: 'Helium-3 Crystal', rarity: SX_RARITY_COMMON, source: 'Gas Giant Skimming', description: 'Crystallized helium-3 harvested from the upper atmosphere of gas giants.' },
  { id: 'mat_solar_glass', name: 'Solar Glass', rarity: SX_RARITY_COMMON, source: 'Solar Forging', description: 'Transparent glass forged from concentrated solar radiation.' },
  { id: 'mat_iron_meteorite', name: 'Iron Meteorite Shard', rarity: SX_RARITY_COMMON, source: 'Meteorite Collection', description: 'A shard of iron-rich meteorite, abundant throughout the galaxy.' },
  { id: 'mat_cosmic_dust', name: 'Cosmic Dust', rarity: SX_RARITY_COMMON, source: 'Deep Space Scooping', description: 'Fine interstellar dust gathered from the void between stars.' },
  // Uncommon (6)
  { id: 'mat_neutron_alloy', name: 'Neutron Alloy', rarity: SX_RARITY_UNCOMMON, source: 'Pulsar Collection', description: 'An ultra-dense alloy formed in the intense magnetic fields of pulsars.' },
  { id: 'mat_dark_matter_shard', name: 'Dark Matter Shard', rarity: SX_RARITY_UNCOMMON, source: 'Void Extraction', description: 'A fragment of dark matter, detectable only by its gravitational influence.' },
  { id: 'mat_quantum_fiber', name: 'Quantum Fiber', rarity: SX_RARITY_UNCOMMON, source: 'Nebula Spinning', description: 'Fiber harvested from quantum-entangled nebula filaments.' },
  { id: 'mat_comet_ice', name: 'Comet Ice Core', rarity: SX_RARITY_UNCOMMON, source: 'Comet Intercept', description: 'Primal ice from the core of an ancient comet, containing pre-solar molecules.' },
  { id: 'mat_plasma_gel', name: 'Plasma Gel', rarity: SX_RARITY_UNCOMMON, source: 'Stellar Eruption Collecting', description: 'A viscous gel of contained plasma, useful as both fuel and armor filler.' },
  { id: 'mat_titanium_whisker', name: 'Titanium Whisker', rarity: SX_RARITY_UNCOMMON, source: 'Crystal Cave Mining', description: 'Perfectly crystalline titanium whiskers with extraordinary tensile strength.' },
  // Rare (6)
  { id: 'mat_gravity_lattice', name: 'Gravity Lattice', rarity: SX_RARITY_RARE, source: 'Black Hole Orbit', description: 'A crystalline lattice structure formed by extreme gravitational forces.' },
  { id: 'mat_nebula_essence', name: 'Nebula Essence', rarity: SX_RARITY_RARE, source: 'Nebula Core Extraction', description: 'The concentrated essence of a nebula, glowing with ethereal colors.' },
  { id: 'mat_star_core_fragment', name: 'Star Core Fragment', rarity: SX_RARITY_RARE, source: 'Supernova Remnant Scavenging', description: 'A fragment from the core of a dead star, still radiating immense energy.' },
  { id: 'mat_antimatter_vial', name: 'Antimatter Vial', rarity: SX_RARITY_RARE, source: 'Particle Accelerator Synthesis', description: 'A carefully contained vial of antimatter, the most energy-dense substance known.' },
  { id: 'mat_cosmic_string', name: 'Cosmic String Segment', rarity: SX_RARITY_RARE, source: 'Spacetime Rift Harvesting', description: 'A segment of cosmic string, a one-dimensional defect in spacetime.' },
  { id: 'mat_exotic_matter', name: 'Exotic Matter Sample', rarity: SX_RARITY_RARE, source: 'Wormhole Exploration', description: 'Matter with negative mass, essential for advanced propulsion systems.' },
  // Epic (6)
  { id: 'mat_time_crystal', name: 'Time Crystal', rarity: SX_RARITY_EPIC, source: 'Temporal Anomaly Harvesting', description: 'A crystal that oscillates in time without energy input, violating thermodynamic laws.' },
  { id: 'mat_void_pearl', name: 'Void Pearl', rarity: SX_RARITY_EPIC, source: 'Dimensional Rift Diving', description: 'A pearl formed in the void between dimensions, containing miniature realities.' },
  { id: 'mat_entropy_ingot', name: 'Entropy Ingot', rarity: SX_RARITY_EPIC, source: 'Dying Star Collection', description: 'Solidified entropy from a star in its final moments of collapse.' },
  { id: 'mat_stellar_forge_slag', name: 'Stellar Forge Slag', rarity: SX_RARITY_EPIC, source: 'Ancient Forge Ruins', description: 'Slag from the forges of a long-dead stellar civilization, still warm.' },
  { id: 'mat_dimensional_fabric', name: 'Dimensional Fabric', rarity: SX_RARITY_EPIC, source: 'Multiverse Weaving', description: 'Fabric woven from threads connecting parallel dimensions.' },
  { id: 'mat_primordial_atom', name: 'Primordial Atom', rarity: SX_RARITY_EPIC, source: 'Big Bang Residue Mining', description: 'An atom from the dawn of the universe, containing primordial energy.' },
  // Legendary (6)
  { id: 'mat_godship_fragment', name: 'Godship Fragment', rarity: SX_RARITY_LEGENDARY, source: 'Cosmic Archaeology', description: 'A fragment of a god-ship, vessels built by the beings that created the universe.' },
  { id: 'mat_infinity_stone', name: 'Infinity Stone Shard', rarity: SX_RARITY_LEGENDARY, source: 'Universal Core Extraction', description: 'A shard of an infinity stone, each one controlling a fundamental force of nature.' },
  { id: 'mat_creation_spark', name: 'Creation Spark', rarity: SX_RARITY_LEGENDARY, source: 'Genesis Event Relic', description: 'A spark from the moment of creation, containing the blueprint of reality.' },
  { id: 'mat_eternity_ingot', name: 'Eternity Ingot', rarity: SX_RARITY_LEGENDARY, source: 'End-of-Time Forging', description: 'An ingot forged at the end of time, immune to all entropy.' },
  { id: 'mat_cosmos_heart', name: 'Heart of the Cosmos', rarity: SX_RARITY_LEGENDARY, source: 'Universal Convergence', description: 'The living heart of the cosmos, beating with the rhythm of all creation.' },
  { id: 'mat_singularity_seed', name: 'Singularity Seed', rarity: SX_RARITY_LEGENDARY, source: 'Black Hole Cultivation', description: 'A seed that, when planted, grows into a controlled singularity.' },
];

// =============================================================================
// 25 Forge Structures
// =============================================================================

const SX_STRUCTURES: SXStructureDef[] = [
  { id: 'struct_ore_refinery', name: 'Ore Refinery', description: 'Processes raw ores into refined materials for component forging.', maxLevel: 10, baseCost: 100 },
  { id: 'struct_assembly_bay', name: 'Assembly Bay', description: 'A spacious bay where starship components are assembled into complete vessels.', maxLevel: 10, baseCost: 200 },
  { id: 'struct_testing_range', name: 'Testing Range', description: 'An enclosed range for testing weapon systems and shield integrity.', maxLevel: 10, baseCost: 150 },
  { id: 'struct_material_silo', name: 'Material Silo', description: 'A climate-controlled silo for storing large quantities of nebula materials.', maxLevel: 10, baseCost: 120 },
  { id: 'struct_energy_collector', name: 'Energy Collector Array', description: 'Harvests ambient stellar energy to power forge operations.', maxLevel: 10, baseCost: 180 },
  { id: 'struct_shipyard_dock', name: 'Shipyard Dock', description: 'A dry dock facility for launching and receiving starships.', maxLevel: 10, baseCost: 300 },
  { id: 'struct_research_lab', name: 'Research Laboratory', description: 'Studies exotic materials and develops new forging techniques.', maxLevel: 10, baseCost: 250 },
  { id: 'struct_shield_generator', name: 'Shield Generator', description: 'Protects the forge from cosmic radiation and micro-meteorite impacts.', maxLevel: 10, baseCost: 220 },
  { id: 'struct_antimatter_chamber', name: 'Antimatter Containment Chamber', description: 'Safely contains and processes antimatter for advanced forging.', maxLevel: 10, baseCost: 400 },
  { id: 'struct_nebula_siphon', name: 'Nebula Siphon', description: 'Siphons raw materials directly from nearby nebulae.', maxLevel: 10, baseCost: 350 },
  { id: 'struct_cooling_tower', name: 'Cooling Tower', description: 'Dissipates excess heat from high-temperature forging operations.', maxLevel: 10, baseCost: 130 },
  { id: 'struct_trade_depot', name: 'Trade Depot', description: 'A hub for trading materials and components with other star forges.', maxLevel: 10, baseCost: 280 },
  { id: 'struct_scrap_processor', name: 'Scrap Processor', description: 'Breaks down decommissioned ships into reusable materials.', maxLevel: 10, baseCost: 160 },
  { id: 'struct_refining_crucible', name: 'Refining Crucible', description: 'Purifies raw materials to higher quality grades.', maxLevel: 10, baseCost: 190 },
  { id: 'struct_constellation_observatory', name: 'Constellation Observatory', description: 'Observes and aligns constellations for passive bonuses.', maxLevel: 10, baseCost: 500 },
  { id: 'struct_power_conduit', name: 'Power Conduit Network', description: 'Distributes energy evenly across all forge structures.', maxLevel: 10, baseCost: 170 },
  { id: 'struct_cargo_bay', name: 'Cargo Bay', description: 'Stores assembled components and completed starships.', maxLevel: 10, baseCost: 140 },
  { id: 'struct_nanite_foundry', name: 'Nanite Foundry', description: 'Produces nanites used in self-repairing hull components.', maxLevel: 10, baseCost: 320 },
  { id: 'struct_gravity_forge', name: 'Gravity Forge', description: 'Uses controlled gravity to forge ultra-dense exotic materials.', maxLevel: 10, baseCost: 450 },
  { id: 'struct_stellar_lighthouse', name: 'Stellar Lighthouse', description: 'A beacon that guides starships back to the forge and attracts rare resources.', maxLevel: 10, baseCost: 200 },
  { id: 'struct_quantum_assembler', name: 'Quantum Assembler', description: 'Assembles components at the quantum level for perfect precision.', maxLevel: 10, baseCost: 380 },
  { id: 'struct_cryo_vault', name: 'Cryo Vault', description: 'Preserves rare materials at near-absolute-zero temperatures.', maxLevel: 10, baseCost: 260 },
  { id: 'struct_warp_gate', name: 'Warp Gate', description: 'Enables rapid deployment of starships across vast distances.', maxLevel: 10, baseCost: 600 },
  { id: 'struct_cosmic_anvil', name: 'Cosmic Anvil', description: 'The legendary anvil where the most powerful components are forged.', maxLevel: 10, baseCost: 700 },
  { id: 'struct_eternity_furnace', name: 'Eternity Furnace', description: 'A self-sustaining furnace that burns with the heat of dying stars forever.', maxLevel: 10, baseCost: 800 },
];

// =============================================================================
// 15 Starship Blueprints
// =============================================================================

const SX_BLUEPRINTS: SXBlueprintDef[] = [
  { id: 'bp_shuttle', name: 'Explorer Shuttle', description: 'A basic shuttle for short-range exploration and material collection.', requiredMaterials: [{ materialId: 'mat_stardust', amount: 5 }, { materialId: 'mat_plasma_ore', amount: 3 }, { materialId: 'mat_solar_glass', amount: 2 }], rarity: SX_RARITY_COMMON, result: 'shuttle' },
  { id: 'bp_corvette', name: 'Swift Corvette', description: 'A fast corvette designed for rapid response and patrol duties.', requiredMaterials: [{ materialId: 'mat_titanium_whisker', amount: 4 }, { materialId: 'mat_plasma_gel', amount: 3 }], rarity: SX_RARITY_UNCOMMON, result: 'corvette' },
  { id: 'bp_freighter', name: 'Nebula Freighter', description: 'A heavy freighter with massive cargo capacity for long-haul transport.', requiredMaterials: [{ materialId: 'mat_neutron_alloy', amount: 5 }, { materialId: 'mat_comet_ice', amount: 4 }, { materialId: 'mat_dark_matter_shard', amount: 2 }], rarity: SX_RARITY_UNCOMMON, result: 'freighter' },
  { id: 'bp_frigate', name: 'Battle Frigate', description: 'A well-armed frigate balanced for combat and defense operations.', requiredMaterials: [{ materialId: 'mat_neutron_alloy', amount: 6 }, { materialId: 'mat_quantum_fiber', amount: 4 }, { materialId: 'mat_plasma_gel', amount: 3 }], rarity: SX_RARITY_RARE, result: 'frigate' },
  { id: 'bp_destroyer', name: 'Plasma Destroyer', description: 'A devastating destroyer that rains plasma on enemy formations.', requiredMaterials: [{ materialId: 'mat_gravity_lattice', amount: 5 }, { materialId: 'mat_nebula_essence', amount: 4 }, { materialId: 'mat_star_core_fragment', amount: 2 }], rarity: SX_RARITY_RARE, result: 'destroyer' },
  { id: 'bp_cruiser', name: 'Star Cruiser', description: 'A versatile cruiser capable of independent deep-space missions.', requiredMaterials: [{ materialId: 'mat_gravity_lattice', amount: 6 }, { materialId: 'mat_cosmic_string', amount: 3 }, { materialId: 'mat_exotic_matter', amount: 2 }], rarity: SX_RARITY_RARE, result: 'cruiser' },
  { id: 'bp_battleship', name: 'Void Battleship', description: 'A massive battleship that dominates any battlefield it enters.', requiredMaterials: [{ materialId: 'mat_antimatter_vial', amount: 5 }, { materialId: 'mat_cosmic_string', amount: 4 }, { materialId: 'mat_exotic_matter', amount: 3 }], rarity: SX_RARITY_EPIC, result: 'battleship' },
  { id: 'bp_carrier', name: 'Fleet Carrier', description: 'A carrier that launches squadrons of smaller ships into battle.', requiredMaterials: [{ materialId: 'mat_time_crystal', amount: 3 }, { materialId: 'mat_dimensional_fabric', amount: 4 }, { materialId: 'mat_entropy_ingot', amount: 3 }], rarity: SX_RARITY_EPIC, result: 'carrier' },
  { id: 'bp_dreadnought', name: 'Eternity Dreadnought', description: 'An unstoppable dreadnought armed with the most powerful weapons known.', requiredMaterials: [{ materialId: 'mat_time_crystal', amount: 4 }, { materialId: 'mat_void_pearl', amount: 3 }, { materialId: 'mat_primordial_atom', amount: 2 }], rarity: SX_RARITY_EPIC, result: 'dreadnought' },
  { id: 'bp_stealth', name: 'Phantom Stealth Ship', description: 'A stealth vessel that is virtually undetectable to all sensors.', requiredMaterials: [{ materialId: 'mat_dark_matter_shard', amount: 8 }, { materialId: 'mat_dimensional_fabric', amount: 5 }, { materialId: 'mat_void_pearl', amount: 2 }], rarity: SX_RARITY_EPIC, result: 'stealth_ship' },
  { id: 'bp_explorer', name: 'Infinity Explorer', description: 'An exploration vessel designed to map the furthest reaches of space.', requiredMaterials: [{ materialId: 'mat_exotic_matter', amount: 5 }, { materialId: 'mat_cosmic_string', amount: 4 }, { materialId: 'mat_stellar_forge_slag', amount: 3 }], rarity: SX_RARITY_EPIC, result: 'explorer' },
  { id: 'bp_titan', name: 'Cosmic Titan', description: 'A titan-class ship that towers over all other vessels in the fleet.', requiredMaterials: [{ materialId: 'mat_godship_fragment', amount: 2 }, { materialId: 'mat_eternity_ingot', amount: 3 }, { materialId: 'mat_primordial_atom', amount: 2 }], rarity: SX_RARITY_LEGENDARY, result: 'titan' },
  { id: 'bp_ark', name: 'Genesis Ark', description: 'An ark ship capable of carrying civilizations across galaxies.', requiredMaterials: [{ materialId: 'mat_infinity_stone', amount: 2 }, { materialId: 'mat_creation_spark', amount: 2 }, { materialId: 'mat_cosmos_heart', amount: 1 }], rarity: SX_RARITY_LEGENDARY, result: 'ark' },
  { id: 'bp_nexus', name: 'Universal Nexus', description: 'A mobile station that connects to all known points in the universe.', requiredMaterials: [{ materialId: 'mat_cosmos_heart', amount: 2 }, { materialId: 'mat_singularity_seed', amount: 2 }, { materialId: 'mat_eternity_ingot', amount: 2 }], rarity: SX_RARITY_LEGENDARY, result: 'nexus' },
  { id: 'bp_omega', name: 'Omega-Class Warship', description: 'The ultimate warship, designed to end wars before they begin.', requiredMaterials: [{ materialId: 'mat_godship_fragment', amount: 3 }, { materialId: 'mat_infinity_stone', amount: 2 }, { materialId: 'mat_singularity_seed', amount: 1 }, { materialId: 'mat_eternity_ingot', amount: 2 }], rarity: SX_RARITY_LEGENDARY, result: 'omega' },
];

// =============================================================================
// 22 Forge / Star Abilities
// =============================================================================

const SX_ABILITIES: SXAbilityDef[] = [
  { id: 'ability_starfire_burst', name: 'Starfire Burst', description: 'Unleash a burst of concentrated stellar energy across the forge.', cooldown: 30, power: 25 },
  { id: 'ability_nebula_veil', name: 'Nebula Veil', description: 'Shroud the forge in a protective nebula mist for 15 seconds.', cooldown: 60, power: 15 },
  { id: 'ability_plasma_hammer', name: 'Plasma Hammer', description: 'Strike with a plasma-infused hammer, doubling forging output momentarily.', cooldown: 45, power: 30 },
  { id: 'ability_comet_dash', name: 'Comet Dash', description: 'Boost ship speed by 300% for 5 seconds using comet energy.', cooldown: 20, power: 20 },
  { id: 'ability_gravity_well', name: 'Gravity Well', description: 'Create a gravity well that pulls in nearby resources and materials.', cooldown: 90, power: 35 },
  { id: 'ability_solar_flare', name: 'Solar Flare', description: 'Trigger a solar flare that superheats all active forges.', cooldown: 120, power: 50 },
  { id: 'ability_quantum_lock', name: 'Quantum Lock', description: 'Freeze time around a targeted component for perfect forging precision.', cooldown: 75, power: 40 },
  { id: 'ability_dark_matter_shield', name: 'Dark Matter Shield', description: 'Generate an impenetrable dark matter barrier for 20 seconds.', cooldown: 100, power: 45 },
  { id: 'ability_antimatter_blast', name: 'Antimatter Blast', description: 'Release a controlled antimatter explosion for massive damage output.', cooldown: 150, power: 80 },
  { id: 'ability_stardust_rain', name: 'Stardust Rain', description: 'Cause a rain of stardust that boosts material collection for 30 seconds.', cooldown: 60, power: 30 },
  { id: 'ability_warp_strike', name: 'Warp Strike', description: 'Teleport a ship through warp space for a surprise attack.', cooldown: 45, power: 55 },
  { id: 'ability_pulsar_rhythm', name: 'Pulsar Rhythm', description: 'Synchronize forging with pulsar timing for perfectly timed strikes.', cooldown: 55, power: 35 },
  { id: 'ability_neutron_pulse', name: 'Neutron Pulse', description: 'Emit a devastating neutron radiation pulse that damages all nearby enemies.', cooldown: 180, power: 70 },
  { id: 'ability_cosmic_heal', name: 'Cosmic Heal', description: 'Channel cosmic energy to repair all ships and structures for 10 seconds.', cooldown: 120, power: 40 },
  { id: 'ability_void_step', name: 'Void Step', description: 'Step through the void to instantly relocate any ship or component.', cooldown: 80, power: 50 },
  { id: 'ability_starlight_beam', name: 'Starlight Beam', description: 'Focus concentrated starlight into a devastating beam attack.', cooldown: 90, power: 65 },
  { id: 'ability_entropy_wave', name: 'Entropy Wave', description: 'Release a wave of entropy that accelerates decay in enemy systems.', cooldown: 200, power: 85 },
  { id: 'ability_forge_overclock', name: 'Forge Overclock', description: 'Overclock all forge operations, tripling output for 10 seconds.', cooldown: 300, power: 60 },
  { id: 'ability_singularity_drop', name: 'Singularity Drop', description: 'Drop a controlled singularity at a target location for area devastation.', cooldown: 240, power: 100 },
  { id: 'ability_cosmic_convergence', name: 'Cosmic Convergence', description: 'Align all constellation bonuses simultaneously for 30 seconds.', cooldown: 600, power: 120 },
  { id: 'ability_eternity_forge', name: 'Eternity Forge', description: 'Channel the power of eternity to instantly forge a legendary component.', cooldown: 900, power: 150 },
  { id: 'ability_creation_surge', name: 'Creation Surge', description: 'Surge of creative energy that boosts all production by 500% for 15 seconds.', cooldown: 1200, power: 200 },
];

// =============================================================================
// 18 Achievements
// =============================================================================

const SX_ACHIEVEMENTS: SXAchievementDef[] = [
  { id: 'ach_first_spark', name: 'First Spark', description: 'Activate your first star forge.', conditionKey: 'totalForged', reward: 50 },
  { id: 'ach_component_smith', name: 'Component Smith', description: 'Forge 10 star components.', conditionKey: 'totalForged', reward: 150 },
  { id: 'ach_shipwright', name: 'Shipwright', description: 'Assemble your first starship.', conditionKey: 'totalAssembled', reward: 100 },
  { id: 'ach_fleet_commander', name: 'Fleet Commander', description: 'Launch 5 starships into the cosmos.', conditionKey: 'totalLaunched', reward: 300 },
  { id: 'ach_material_hoarder', name: 'Material Hoarder', description: 'Collect 500 total materials.', conditionKey: 'totalMaterialsCollected', reward: 200 },
  { id: 'ach_structure_architect', name: 'Structure Architect', description: 'Build 10 forge structures.', conditionKey: 'totalStructuresBuilt', reward: 250 },
  { id: 'ach_heat_master', name: 'Heat Master', description: 'Reach forge heat level 100.', conditionKey: 'heat', reward: 300 },
  { id: 'ach_antimatter_pioneer', name: 'Antimatter Pioneer', description: 'Generate 100 antimatter.', conditionKey: 'totalAntimatterGenerated', reward: 500 },
  { id: 'ach_blue_scholar', name: 'Blueprint Scholar', description: 'Learn 10 blueprints.', conditionKey: 'blueprints_learned', reward: 400 },
  { id: 'ach_trade_baron', name: 'Trade Baron', description: 'Complete 20 trades.', conditionKey: 'totalTradesCompleted', reward: 350 },
  { id: 'ach_constellation_aligner', name: 'Constellation Aligner', description: 'Align 5 constellations.', conditionKey: 'constellations_aligned', reward: 600 },
  { id: 'ach_legendary_forger', name: 'Legendary Forger', description: 'Forge a legendary component.', conditionKey: 'legendary_forged', reward: 800 },
  { id: 'ach_titan_builder', name: 'Titan Builder', description: 'Build a titan-class starship.', conditionKey: 'titan_built', reward: 1000 },
  { id: 'ach_max_forge', name: 'Max Forge', description: 'Upgrade any structure to level 10.', conditionKey: 'max_structure', reward: 700 },
  { id: 'ach_refining_master', name: 'Refining Master', description: 'Refine 100 materials.', conditionKey: 'totalRefined', reward: 450 },
  { id: 'ach_decommissioner', name: 'Decommissioner', description: 'Decommission 10 starships.', conditionKey: 'totalDecommissioned', reward: 300 },
  { id: 'ach_sell_master', name: 'Component Dealer', description: 'Sell 50 components.', conditionKey: 'totalComponentsSold', reward: 400 },
  { id: 'ach_stellar_architect', name: 'Stellar Architect', description: 'Earn the Stellar Architect title.', conditionKey: 'title_earned', reward: 2000 },
];

// =============================================================================
// 8 Titles
// =============================================================================

const SX_TITLES: SXTitleDef[] = [
  { id: 'title_star_apprentice', name: 'Star Apprentice', requirement: 0, description: 'A beginner who has just begun exploring the star forges.' },
  { id: 'title_nova_smith', name: 'Nova Smith', requirement: 500, description: 'A skilled smith capable of forging uncommon components.' },
  { id: 'title_cosmic_engineer', name: 'Cosmic Engineer', requirement: 2000, description: 'An engineer who understands the mechanics of the cosmos.' },
  { id: 'title_nebula_forger', name: 'Nebula Forger', requirement: 5000, description: 'A forger who shapes nebula matter into useful forms.' },
  { id: 'title_quantum_artificer', name: 'Quantum Artificer', requirement: 12000, description: 'An artificer who works at the quantum level of matter.' },
  { id: 'title_pulsar_lord', name: 'Pulsar Lord', requirement: 25000, description: 'A ruler who commands the rhythmic power of pulsars.' },
  { id: 'title_void_sovereign', name: 'Void Sovereign', requirement: 50000, description: 'A sovereign who has mastered the mysteries of the void.' },
  { id: 'title_stellar_architect', name: 'Stellar Architect', requirement: 100000, description: 'The supreme builder of the cosmos, architect of galaxies.' },
];

// =============================================================================
// 12 Starship Definitions
// =============================================================================

const SX_STARSHIPS: SXStarshipDef[] = [
  { id: 'ship_shuttle', name: 'Explorer Shuttle', description: 'A nimble shuttle for initial cosmic exploration and resource gathering.', shipClass: 'Scout', powerRating: 50 },
  { id: 'ship_corvette', name: 'Swift Corvette', description: 'A fast attack corvette with impressive speed and light armament.', shipClass: 'Escort', powerRating: 120 },
  { id: 'ship_freighter', name: 'Nebula Freighter', description: 'A heavy freighter designed to transport massive quantities of materials.', shipClass: 'Transport', powerRating: 80 },
  { id: 'ship_frigate', name: 'Battle Frigate', description: 'A balanced frigate suitable for escort and patrol missions.', shipClass: 'Warship', powerRating: 200 },
  { id: 'ship_destroyer', name: 'Plasma Destroyer', description: 'A heavy destroyer bristling with plasma weaponry.', shipClass: 'Warship', powerRating: 350 },
  { id: 'ship_cruiser', name: 'Star Cruiser', description: 'A versatile cruiser capable of long-range independent missions.', shipClass: 'Cruiser', powerRating: 300 },
  { id: 'ship_battleship', name: 'Void Battleship', description: 'A capital battleship that dominates any engagement.', shipClass: 'Capital', powerRating: 550 },
  { id: 'ship_carrier', name: 'Fleet Carrier', description: 'A massive carrier that launches waves of fighter squadrons.', shipClass: 'Capital', powerRating: 500 },
  { id: 'ship_dreadnought', name: 'Eternity Dreadnought', description: 'An awe-inspiring dreadnought, the pinnacle of military engineering.', shipClass: 'Super Capital', powerRating: 800 },
  { id: 'ship_stealth', name: 'Phantom Stealth Ship', description: 'A nearly invisible stealth vessel for covert operations.', shipClass: 'Special', powerRating: 250 },
  { id: 'ship_explorer', name: 'Infinity Explorer', description: 'An exploration vessel built to chart the unknown reaches of space.', shipClass: 'Explorer', powerRating: 280 },
  { id: 'ship_titan', name: 'Cosmic Titan', description: 'A titan-class vessel that dwarfs all other ships in the fleet.', shipClass: 'Titan', powerRating: 1200 },
];

// =============================================================================
// 10 Forge Constellations
// =============================================================================

const SX_CONSTELLATIONS: SXConstellationDef[] = [
  { id: 'const_forge_hand', name: "Forger's Hand", description: 'An ancient constellation depicting a hand reaching into a forge fire.', bonus: '+10% forging speed', unlockLevel: 1 },
  { id: 'const_nebula_eye', name: 'Nebula Eye', description: 'A swirling constellation that resembles a cosmic eye in the nebula.', bonus: '+15% material yield', unlockLevel: 5 },
  { id: 'const_star_crown', name: 'Star Crown', description: 'A crown of seven bright stars, symbol of stellar authority.', bonus: '+20% ship power', unlockLevel: 10 },
  { id: 'const_dark_void', name: 'Dark Void', description: 'A patch of darkness in the sky where no stars shine, the entrance to the void.', bonus: '+10% antimatter generation', unlockLevel: 15 },
  { id: 'const_comet_tail', name: 'Comet Tail', description: 'The long tail of a celestial comet, stretching across half the sky.', bonus: '+25% ship speed', unlockLevel: 20 },
  { id: 'const_pulsar_ring', name: 'Pulsar Ring', description: 'A ring of pulsars flashing in perfect synchronization.', bonus: '+15% heat efficiency', unlockLevel: 28 },
  { id: 'const_black_hole_maw', name: 'Black Hole Maw', description: 'The terrifying silhouette of a black hole consuming light.', bonus: '+20% dark matter drops', unlockLevel: 35 },
  { id: 'const_infinity_spiral', name: 'Infinity Spiral', description: 'A spiral of stars that loops back on itself infinitely.', bonus: '+10% gold from trades', unlockLevel: 42 },
  { id: 'const_cosmos_tree', name: 'Cosmos Tree', description: 'A constellation shaped like a great tree with galaxies for leaves.', bonus: '+15% structure efficiency', unlockLevel: 50 },
  { id: 'const_creation_circle', name: 'Creation Circle', description: 'The circle of twelve stars present at the moment of creation.', bonus: '+30% all production', unlockLevel: 60 },
];

// =============================================================================
// Forge Synergy Bonuses
// =============================================================================

const SX_SYNERGY_PAIRS: Array<{ a: string; b: string; bonus: string; value: number }> = [
  { a: 'struct_ore_refinery', b: 'struct_refining_crucible', bonus: 'smelting_yield', value: 0.15 },
  { a: 'struct_assembly_bay', b: 'struct_shipyard_dock', bonus: 'assembly_speed', value: 0.2 },
  { a: 'struct_energy_collector', b: 'struct_power_conduit', bonus: 'energy_efficiency', value: 0.18 },
  { a: 'struct_antimatter_chamber', b: 'struct_cooling_tower', bonus: 'antimatter_safety', value: 0.25 },
  { a: 'struct_nebula_siphon', b: 'struct_material_silo', bonus: 'nebula_yield', value: 0.12 },
  { a: 'struct_shield_generator', b: 'struct_cosmic_anvil', bonus: 'forge_protection', value: 0.15 },
  { a: 'struct_research_lab', b: 'struct_quantum_assembler', bonus: 'research_speed', value: 0.22 },
  { a: 'struct_cargo_bay', b: 'struct_trade_depot', bonus: 'trade_capacity', value: 0.18 },
  { a: 'struct_nanite_foundry', b: 'struct_gravity_forge', bonus: 'nanite_quality', value: 0.2 },
  { a: 'struct_warp_gate', b: 'struct_shipyard_dock', bonus: 'deployment_speed', value: 0.2 },
  { a: 'struct_cosmic_anvil', b: 'struct_eternity_furnace', bonus: 'legendary_forge', value: 0.3 },
  { a: 'struct_constellation_observatory', b: 'struct_stellar_lighthouse', bonus: 'constellation_power', value: 0.25 },
];

// =============================================================================
// Forge Lore Entries
// =============================================================================

const SX_LORE_ENTRIES: Array<{ id: string; title: string; text: string; forgeId: string }> = [
  { id: 'sx_lore_001', title: 'The First Light', text: 'Before there were stars, there was a single point of light. The first forge master reached into that light and pulled out the first component — a simple solar cell that still powers the oldest shuttle in the fleet.', forgeId: 'solar_crucible' },
  { id: 'sx_lore_002', title: 'Nebula Songs', text: 'The nebulae sing in frequencies that only the forges can hear. Those who listen carefully discover that each nebula has a unique melody, and forging within its glow produces components attuned to that frequency.', forgeId: 'nebula_kiln' },
  { id: 'sx_lore_003', title: 'Pulsar Precision', text: 'The Pulsar Foundry was built by a blind smith who could feel the rhythm of the nearest pulsar. She forged components so precisely balanced that ships built with them never needed course corrections.', forgeId: 'pulsar_foundry' },
  { id: 'sx_lore_004', title: 'The Quasar Paradox', text: 'Quasars are the brightest objects in the universe, yet their light comes from the darkest process — matter falling into a supermassive black hole. The Quasar Smithy harnesses this paradox to forge weapons of light from darkness.', forgeId: 'quasar_smithy' },
  { id: 'sx_lore_005', title: 'Supernova Seeds', text: 'Every supernova scatters seeds of new stars across the cosmos. The Supernova Anvil collects these seeds and compresses them into cores of immense power, each one containing the potential for a new stellar nursery.', forgeId: 'supernova_anvil' },
  { id: 'sx_lore_006', title: 'Comet Riders', text: 'The first Comet Workshop was built on the back of a comet. Its smiths learned to ride the cosmic winds, forging shields that carried the protective essence of the comet\'s tail — an aura that still guards the workshop today.', forgeId: 'comet_workshop' },
  { id: 'sx_lore_007', title: 'The Black Hole Secret', text: 'What the Black Hole Furnace consumes, it does not destroy. Matter compressed within its event horizon is refined to a purity impossible anywhere else. The furnace\'s masters learned to retrieve this matter, creating materials that exist in a state between existence and non-existence.', forgeId: 'black_hole_furnace' },
  { id: 'sx_lore_008', title: 'Stardust Coinage', text: 'The Stardust Mint does not merely press coins — it imbues each one with a memory. Ancient stardust remembers the star that birthed it, and coins minted here carry that star\'s last wish. Spending such a coin grants a fraction of that star\'s power.', forgeId: 'stardust_mint' },
];

// =============================================================================
// Helper Functions
// =============================================================================

let sxInstanceCounter = 0;

function sxGenerateId(prefix: string): string {
  sxInstanceCounter++;
  return `${prefix}_${Date.now()}_${sxInstanceCounter}`;
}

function sxGetRarityLabel(rarity: number): string {
  return SX_RARITY_NAMES[rarity] ?? 'Unknown';
}

function sxGetRarityColor(rarity: number): string {
  return SX_RARITY_COLORS[rarity] ?? '#9CA3AF';
}

function sxGetTypeInfo(type: string) {
  return SX_TYPE_INFO[type] ?? { label: 'Unknown', icon: '❓', color: '#9CA3AF', desc: 'No type information.' };
}

function sxComputeUpgradeCost(baseCost: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(1.6, currentLevel));
}

function sxCalculateSynergyBonus(state: SXState): Record<string, number> {
  const bonuses: Record<string, number> = {};
  for (const pair of SX_SYNERGY_PAIRS) {
    const a = state.structures.find(s => s.structureId === pair.a);
    const b = state.structures.find(s => s.structureId === pair.b);
    if (a && b && a.level > 0 && b.level > 0) {
      bonuses[pair.bonus] = (bonuses[pair.bonus] ?? 0) + pair.value * Math.min(a.level, b.level);
    }
  }
  return bonuses;
}

function sxComputePassiveIncome(state: SXState): { goldPerTick: number; energyPerTick: number; heatPerTick: number } {
  let goldPerTick = 0;
  let energyPerTick = 0;
  let heatPerTick = -1;

  const energyLevel = state.structures.find(s => s.structureId === 'struct_energy_collector')?.level ?? 0;
  energyPerTick += energyLevel * 2;

  const lighthouseLevel = state.structures.find(s => s.structureId === 'struct_stellar_lighthouse')?.level ?? 0;
  energyPerTick += lighthouseLevel * 1;

  const powerConduitLevel = state.structures.find(s => s.structureId === 'struct_power_conduit')?.level ?? 0;
  energyPerTick = Math.floor(energyPerTick * (1 + powerConduitLevel * 0.1));

  const dockLevel = state.structures.find(s => s.structureId === 'struct_shipyard_dock')?.level ?? 0;
  const launchedShips = state.starships.filter(s => s.launched).length;
  goldPerTick += launchedShips * (2 + dockLevel);

  const tradeLevel = state.structures.find(s => s.structureId === 'struct_trade_depot')?.level ?? 0;
  goldPerTick += tradeLevel;

  const furnaceLevel = state.structures.find(s => s.structureId === 'struct_eternity_furnace')?.level ?? 0;
  if (furnaceLevel > 0) {
    heatPerTick += furnaceLevel * 2;
  }

  const activeForge = state.forges.find(f => f.forgeId === state.activeForgeId);
  if (activeForge && activeForge.level > 0) {
    const forgeDef = SX_FORGES.find(f => f.id === activeForge.forgeId);
    if (forgeDef) {
      heatPerTick += Math.floor(forgeDef.heatLevel * 0.001 * activeForge.level);
    }
  }

  const coolingLevel = state.structures.find(s => s.structureId === 'struct_cooling_tower')?.level ?? 0;
  heatPerTick -= coolingLevel * 2;

  if (state.heat >= 190) {
    heatPerTick -= 3;
  }

  const synergies = sxCalculateSynergyBonus(state);
  goldPerTick = Math.floor(goldPerTick * (1 + (synergies['trade_capacity'] ?? 0)));
  energyPerTick = Math.floor(energyPerTick * (1 + (synergies['energy_efficiency'] ?? 0)));

  return {
    goldPerTick: Math.max(0, goldPerTick),
    energyPerTick: Math.max(0, energyPerTick),
    heatPerTick,
  };
}

function sxComputeForgeExpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= 100) return Infinity;
  return Math.floor(80 * level * (1 + level * 0.15));
}

function sxComputeForgeCost(componentDefId: string): number {
  const def = SX_COMPONENTS.find(c => c.id === componentDefId);
  if (!def) return 999999;
  const rarityMultiplier = [1, 2.5, 6, 15, 40][def.rarity] ?? 1;
  return Math.floor(def.power * rarityMultiplier * 0.4);
}

function sxComputeBlueprintCost(blueprintDefId: string): number {
  const def = SX_BLUEPRINTS.find(b => b.id === blueprintDefId);
  if (!def) return 999999;
  const rarityMultiplier = [1, 3, 8, 20, 50][def.rarity] ?? 1;
  return Math.floor(200 * rarityMultiplier);
}

function sxComputeHeatEfficiency(heat: number, structureLevel: number): number {
  const baseEff = Math.min(100, heat / 2);
  const coolingBonus = structureLevel * 3;
  return Math.max(0, Math.min(100, Math.floor(baseEff + coolingBonus)));
}

function sxComputeTotalPower(state: SXState): number {
  let power = 0;
  for (const comp of state.components) {
    const def = SX_COMPONENTS.find(c => c.id === comp.defId);
    if (def) {
      const durabilityRatio = comp.durability / comp.maxDurability;
      power += Math.floor(def.power * (0.5 + durabilityRatio * 0.5));
    }
  }
  for (const ship of state.starships) {
    if (ship.launched) {
      power += ship.powerRating;
    }
  }
  for (const struct of state.structures) {
    if (struct.level > 0) {
      power += struct.level * 8;
    }
  }
  power += state.constellationBonus;
  return power;
}

function sxComputeConstellationBonus(constellations: SXConstellationState[]): number {
  let bonus = 0;
  const aligned = constellations.filter(c => c.aligned && c.bonusActive);
  bonus += aligned.length * 15;
  return bonus;
}

function sxComputeTitle(power: number): string {
  for (let i = SX_TITLES.length - 1; i >= 0; i--) {
    if (power >= SX_TITLES[i].requirement) {
      return SX_TITLES[i].name;
    }
  }
  return SX_TITLES[0].name;
}

function sxComputeNebulaYield(baseYield: number, constellationBonus: number, nebulaSiphonLevel: number): number {
  const mult = 1 + constellationBonus * 0.01 + nebulaSiphonLevel * 0.1;
  return Math.floor(baseYield * mult);
}

function sxComputeAntimatterLevel(totalGenerated: number): number {
  if (totalGenerated < 100) return 1;
  if (totalGenerated < 500) return 2;
  if (totalGenerated < 2000) return 3;
  if (totalGenerated < 8000) return 4;
  if (totalGenerated < 20000) return 5;
  return 6;
}

function sxCreateInitialForges(): SXForgeInstance[] {
  return SX_FORGES.map((f, i) => ({
    forgeId: f.id,
    active: i === 0,
    level: i === 0 ? 1 : 0,
    totalOutput: 0,
  }));
}

function sxCreateInitialMaterials(): SXMaterialStack[] {
  return SX_NEBULA_MATERIALS.map(m => ({
    materialId: m.id,
    count: 0,
  }));
}

function sxCreateInitialStructures(): SXStructureInstance[] {
  return SX_STRUCTURES.map(s => ({
    structureId: s.id,
    level: 0,
  }));
}

function sxCreateInitialBlueprints(): SXBlueprintProgress[] {
  return SX_BLUEPRINTS.map(b => ({
    blueprintId: b.id,
    learned: false,
    timesCrafted: 0,
  }));
}

function sxCreateInitialAchievements(): SXAchievementState[] {
  return SX_ACHIEVEMENTS.map(a => ({
    achievementId: a.id,
    unlocked: false,
    unlockedAt: 0,
  }));
}

function sxCreateInitialConstellations(): SXConstellationState[] {
  return SX_CONSTELLATIONS.map(c => ({
    constellationId: c.id,
    aligned: false,
    bonusActive: false,
  }));
}

function sxCreateInitialState(): SXState {
  return {
    forges: sxCreateInitialForges(),
    components: [],
    materials: sxCreateInitialMaterials(),
    structures: sxCreateInitialStructures(),
    blueprints: sxCreateInitialBlueprints(),
    starships: [],
    achievements: sxCreateInitialAchievements(),
    constellations: sxCreateInitialConstellations(),
    currentTitle: SX_TITLES[0].name,
    forgeLevel: 1,
    forgeExp: 0,
    gold: 500,
    starEnergy: 100,
    heat: 30,
    totalForged: 0,
    totalAssembled: 0,
    totalLaunched: 0,
    activeForgeId: 'solar_crucible',
    constellationBonus: 0,
    antimatter: 0,
    totalMaterialsCollected: 0,
    totalOresSmelted: 0,
    totalStructuresBuilt: 0,
    totalTradesCompleted: 0,
    totalComponentsSold: 0,
    totalAntimatterGenerated: 0,
    totalRefined: 0,
    totalDecommissioned: 0,
    eventLog: [],
  };
}

// =============================================================================
// Main Hook: useStarForge
// =============================================================================

export default function useStarForge() {
  const stateRef = useRef<SXState | null>(null);

  const [state, setState] = useState<SXState>(sxCreateInitialState);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Compute derived title
  const computedTitle = useMemo(() => {
    const power = sxComputeTotalPower(state);
    return sxComputeTitle(power);
  }, [state]);

  // Compute derived constellation bonus
  const computedConstellationBonus = useMemo(() => {
    return sxComputeConstellationBonus(state.constellations);
  }, [state]);

  // Sync computed values into state
  useEffect(() => {
    setState(prev => {
      const title = sxComputeTitle(sxComputeTotalPower(prev));
      const bonus = sxComputeConstellationBonus(prev.constellations);
      if (title === prev.currentTitle && bonus === prev.constellationBonus) {
        return prev;
      }
      return {
        ...prev,
        currentTitle: title,
        constellationBonus: bonus,
      };
    });
  }, [state.totalLaunched, state.totalForged, state.constellations, state.structures]);

  // Passive income tick
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const income = sxComputePassiveIncome(prev);
        const newGold = prev.gold + income.goldPerTick;
        const newEnergy = Math.min(500, prev.starEnergy + income.energyPerTick);
        const newHeat = Math.max(0, Math.min(200, prev.heat + income.heatPerTick));
        if (newGold === prev.gold && newEnergy === prev.starEnergy && newHeat === prev.heat) {
          return prev;
        }
        return {
          ...prev,
          gold: newGold,
          starEnergy: newEnergy,
          heat: newHeat,
        };
      });
    }, 5000);
    return () => { clearInterval(interval); };
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const sxActivateForge = useCallback((forgeId: string) => {
    setState(prev => {
      const forge = SX_FORGES.find(f => f.id === forgeId);
      if (!forge) return prev;
      const existing = prev.forges.find(f => f.forgeId === forgeId);
      if (!existing) return prev;
      if (existing.level < 1) return prev;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'forge',
        message: `Activated forge: ${forge.name}`,
        metadata: { forgeId },
      };
      return {
        ...prev,
        activeForgeId: forgeId,
        forges: prev.forges.map(f =>
          f.forgeId === forgeId ? { ...f, active: true } : { ...f, active: false }
        ),
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxForgeComponent = useCallback((componentDefId: string) => {
    setState(prev => {
      const def = SX_COMPONENTS.find(c => c.id === componentDefId);
      if (!def) return prev;
      const cost = sxComputeForgeCost(componentDefId);
      if (prev.gold < cost) return prev;
      if (prev.starEnergy < 10) return prev;
      const forge = prev.forges.find(f => f.forgeId === prev.activeForgeId);
      if (!forge || forge.level < 1) return prev;
      const newInstance: SXComponentInstance = {
        instanceId: sxGenerateId('comp'),
        defId: def.id,
        name: def.name,
        rarity: def.rarity,
        type: def.type,
        power: def.power,
        durability: def.durability,
        maxDurability: def.durability,
        forgedAt: Date.now(),
      };
      const expGain = Math.floor(def.power * 0.5);
      let newLevel = prev.forgeLevel;
      let newExp = prev.forgeExp + expGain;
      const expRequired = sxComputeForgeExpRequired(newLevel);
      if (newExp >= expRequired) {
        newExp -= expRequired;
        newLevel += 1;
      }
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'forge',
        message: `Forged ${def.name} (${sxGetRarityLabel(def.rarity)}, Power: ${def.power})`,
        metadata: { componentId: newInstance.instanceId, rarity: def.rarity, cost },
      };
      return {
        ...prev,
        components: [...prev.components, newInstance],
        gold: prev.gold - cost,
        starEnergy: prev.starEnergy - 10,
        totalForged: prev.totalForged + 1,
        forgeLevel: newLevel,
        forgeExp: newExp,
        forges: prev.forges.map(f =>
          f.forgeId === prev.activeForgeId
            ? { ...f, totalOutput: f.totalOutput + 1 }
            : f
        ),
        heat: Math.max(0, prev.heat - 5),
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxAssembleShip = useCallback((blueprintId: string) => {
    setState(prev => {
      const bp = SX_BLUEPRINTS.find(b => b.id === blueprintId);
      if (!bp) return prev;
      const progress = prev.blueprints.find(b => b.blueprintId === blueprintId);
      if (!progress || !progress.learned) return prev;
      const shipDef = SX_STARSHIPS.find(s => s.id === `ship_${bp.result}`);
      if (!shipDef) return prev;
      for (const req of bp.requiredMaterials) {
        const stack = prev.materials.find(m => m.materialId === req.materialId);
        if (!stack || stack.count < req.amount) return prev;
      }
      const newMaterials = prev.materials.map(m => {
        const req = bp.requiredMaterials.find(r => r.materialId === m.materialId);
        if (req) {
          return { ...m, count: m.count - req.amount };
        }
        return m;
      });
      const newInstance: SXStarshipInstance = {
        instanceId: sxGenerateId('ship'),
        defId: shipDef.id,
        name: shipDef.name,
        shipClass: shipDef.shipClass,
        powerRating: shipDef.powerRating,
        launched: false,
        builtAt: Date.now(),
      };
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'assemble',
        message: `Assembled ${shipDef.name} (${shipDef.shipClass}, Power: ${shipDef.powerRating})`,
        metadata: { shipId: newInstance.instanceId, blueprintId },
      };
      return {
        ...prev,
        starships: [...prev.starships, newInstance],
        materials: newMaterials,
        totalAssembled: prev.totalAssembled + 1,
        blueprints: prev.blueprints.map(b =>
          b.blueprintId === blueprintId
            ? { ...b, timesCrafted: b.timesCrafted + 1 }
            : b
        ),
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxCollectMaterial = useCallback((materialId: string, amount: number) => {
    setState(prev => {
      const def = SX_NEBULA_MATERIALS.find(m => m.id === materialId);
      if (!def) return prev;
      if (amount <= 0) return prev;
      const nebulaSiphonLevel = prev.structures.find(s => s.structureId === 'struct_nebula_siphon')?.level ?? 0;
      const actualAmount = sxComputeNebulaYield(amount, prev.constellationBonus, nebulaSiphonLevel);
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'collect',
        message: `Collected ${actualAmount}x ${def.name}`,
        metadata: { materialId, baseAmount: amount, actualAmount },
      };
      return {
        ...prev,
        materials: prev.materials.map(m =>
          m.materialId === materialId
            ? { ...m, count: m.count + actualAmount }
            : m
        ),
        totalMaterialsCollected: prev.totalMaterialsCollected + actualAmount,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxSmeltOre = useCallback((materialId: string, amount: number) => {
    setState(prev => {
      if (amount <= 0) return prev;
      const stack = prev.materials.find(m => m.materialId === materialId);
      if (!stack || stack.count < amount) return prev;
      const refiningLevel = prev.structures.find(s => s.structureId === 'struct_refining_crucible')?.level ?? 0;
      const bonusMult = 1 + refiningLevel * 0.1;
      const bonusAmount = Math.floor(amount * bonusMult) - amount;
      const goldEarned = amount * 2;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'smelt',
        message: `Smelted ${amount}x material (+${bonusAmount} bonus), earned ${goldEarned} gold`,
        metadata: { materialId, amount, bonusAmount, goldEarned },
      };
      return {
        ...prev,
        materials: prev.materials.map(m =>
          m.materialId === materialId
            ? { ...m, count: m.count - amount + bonusAmount }
            : m
        ),
        gold: prev.gold + goldEarned,
        totalOresSmelted: prev.totalOresSmelted + amount,
        heat: Math.min(200, prev.heat + amount),
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxBuildStructure = useCallback((structureId: string) => {
    setState(prev => {
      const def = SX_STRUCTURES.find(s => s.id === structureId);
      if (!def) return prev;
      const existing = prev.structures.find(s => s.structureId === structureId);
      if (!existing || existing.level > 0) return prev;
      if (prev.gold < def.baseCost) return prev;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'build',
        message: `Built ${def.name} (Level 1)`,
        metadata: { structureId, cost: def.baseCost },
      };
      return {
        ...prev,
        structures: prev.structures.map(s =>
          s.structureId === structureId
            ? { ...s, level: 1 }
            : s
        ),
        gold: prev.gold - def.baseCost,
        totalStructuresBuilt: prev.totalStructuresBuilt + 1,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxUpgradeStructure = useCallback((structureId: string) => {
    setState(prev => {
      const def = SX_STRUCTURES.find(s => s.id === structureId);
      if (!def) return prev;
      const existing = prev.structures.find(s => s.structureId === structureId);
      if (!existing || existing.level < 1) return prev;
      if (existing.level >= def.maxLevel) return prev;
      const cost = sxComputeUpgradeCost(def.baseCost, existing.level);
      if (prev.gold < cost) return prev;
      const newLevel = existing.level + 1;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'upgrade',
        message: `Upgraded ${def.name} to Level ${newLevel}`,
        metadata: { structureId, newLevel, cost },
      };
      return {
        ...prev,
        structures: prev.structures.map(s =>
          s.structureId === structureId
            ? { ...s, level: newLevel }
            : s
        ),
        gold: prev.gold - cost,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxLearnBlueprint = useCallback((blueprintId: string) => {
    setState(prev => {
      const def = SX_BLUEPRINTS.find(b => b.id === blueprintId);
      if (!def) return prev;
      const existing = prev.blueprints.find(b => b.blueprintId === blueprintId);
      if (!existing || existing.learned) return prev;
      const cost = sxComputeBlueprintCost(blueprintId);
      if (prev.gold < cost) return prev;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'blueprint',
        message: `Learned blueprint: ${def.name} (${sxGetRarityLabel(def.rarity)})`,
        metadata: { blueprintId, cost, rarity: def.rarity },
      };
      return {
        ...prev,
        blueprints: prev.blueprints.map(b =>
          b.blueprintId === blueprintId
            ? { ...b, learned: true }
            : b
        ),
        gold: prev.gold - cost,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxLaunchShip = useCallback((shipInstanceId: string) => {
    setState(prev => {
      const ship = prev.starships.find(s => s.instanceId === shipInstanceId);
      if (!ship) return prev;
      if (ship.launched) return prev;
      if (prev.starEnergy < 20) return prev;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'launch',
        message: `Launched ${ship.name} into the cosmos`,
        metadata: { shipInstanceId, shipClass: ship.shipClass, powerRating: ship.powerRating },
      };
      return {
        ...prev,
        starships: prev.starships.map(s =>
          s.instanceId === shipInstanceId
            ? { ...s, launched: true }
            : s
        ),
        starEnergy: prev.starEnergy - 20,
        totalLaunched: prev.totalLaunched + 1,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxRecallShip = useCallback((shipInstanceId: string) => {
    setState(prev => {
      const ship = prev.starships.find(s => s.instanceId === shipInstanceId);
      if (!ship) return prev;
      if (!ship.launched) return prev;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'launch',
        message: `Recalled ${ship.name} from the cosmos`,
        metadata: { shipInstanceId },
      };
      return {
        ...prev,
        starships: prev.starships.map(s =>
          s.instanceId === shipInstanceId
            ? { ...s, launched: false }
            : s
        ),
        starEnergy: prev.starEnergy + 10,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxAdjustHeat = useCallback((amount: number) => {
    setState(prev => {
      const newHeat = Math.max(0, Math.min(200, prev.heat + amount));
      if (newHeat === prev.heat) return prev;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'heat',
        message: amount > 0 ? `Increased forge heat by ${amount}` : `Reduced forge heat by ${Math.abs(amount)}`,
        metadata: { amount, newHeat },
      };
      return {
        ...prev,
        heat: newHeat,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxHarvestNebula = useCallback(() => {
    setState(prev => {
      const roll = Math.random() * 100;
      let rarityTarget = SX_RARITY_COMMON;
      if (roll > 85) rarityTarget = SX_RARITY_LEGENDARY;
      else if (roll > 70) rarityTarget = SX_RARITY_EPIC;
      else if (roll > 50) rarityTarget = SX_RARITY_RARE;
      else if (roll > 25) rarityTarget = SX_RARITY_UNCOMMON;
      const candidates = SX_NEBULA_MATERIALS.filter(m => m.rarity === rarityTarget);
      if (candidates.length === 0) return prev;
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      const nebulaSiphonLevel = prev.structures.find(s => s.structureId === 'struct_nebula_siphon')?.level ?? 0;
      const yieldAmount = sxComputeNebulaYield(1, prev.constellationBonus, nebulaSiphonLevel);
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'nebula',
        message: `Harvested ${yieldAmount}x ${chosen.name} (${sxGetRarityLabel(chosen.rarity)})`,
        metadata: { materialId: chosen.id, rarity: chosen.rarity, yieldAmount },
      };
      return {
        ...prev,
        materials: prev.materials.map(m =>
          m.materialId === chosen.id
            ? { ...m, count: m.count + yieldAmount }
            : m
        ),
        totalMaterialsCollected: prev.totalMaterialsCollected + yieldAmount,
        starEnergy: Math.max(0, prev.starEnergy - 5),
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxAlignConstellation = useCallback((constellationId: string) => {
    setState(prev => {
      const def = SX_CONSTELLATIONS.find(c => c.id === constellationId);
      if (!def) return prev;
      if (prev.forgeLevel < def.unlockLevel) return prev;
      const existing = prev.constellations.find(c => c.constellationId === constellationId);
      if (!existing || existing.aligned) return prev;
      if (prev.starEnergy < 30) return prev;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'constellation',
        message: `Aligned constellation: ${def.name} — ${def.bonus}`,
        metadata: { constellationId, bonus: def.bonus },
      };
      return {
        ...prev,
        constellations: prev.constellations.map(c =>
          c.constellationId === constellationId
            ? { ...c, aligned: true, bonusActive: true }
            : c
        ),
        starEnergy: prev.starEnergy - 30,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxUnlockTitle = useCallback((titleId: string) => {
    setState(prev => {
      const def = SX_TITLES.find(t => t.id === titleId);
      if (!def) return prev;
      const power = sxComputeTotalPower(prev);
      if (power < def.requirement) return prev;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'title',
        message: `Unlocked title: ${def.name}`,
        metadata: { titleId },
      };
      return {
        ...prev,
        currentTitle: def.name,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxClaimAchievement = useCallback((achievementId: string) => {
    setState(prev => {
      const def = SX_ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!def) return prev;
      const existing = prev.achievements.find(a => a.achievementId === achievementId);
      if (!existing || existing.unlocked) return prev;
      const met = sxCheckAchievementCondition(def.conditionKey, prev);
      if (!met) return prev;
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'achievement',
        message: `Achievement unlocked: ${def.name} — ${def.description} (+${def.reward} gold)`,
        metadata: { achievementId, reward: def.reward },
      };
      return {
        ...prev,
        achievements: prev.achievements.map(a =>
          a.achievementId === achievementId
            ? { ...a, unlocked: true, unlockedAt: Date.now() }
            : a
        ),
        gold: prev.gold + def.reward,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxTradeMaterial = useCallback((giveMaterialId: string, giveAmount: number, receiveMaterialId: string, receiveAmount: number) => {
    setState(prev => {
      if (giveAmount <= 0 || receiveAmount <= 0) return prev;
      const giveStack = prev.materials.find(m => m.materialId === giveMaterialId);
      if (!giveStack || giveStack.count < giveAmount) return prev;
      const receiveDef = SX_NEBULA_MATERIALS.find(m => m.id === receiveMaterialId);
      if (!receiveDef) return prev;
      const tradeDepotLevel = prev.structures.find(s => s.structureId === 'struct_trade_depot')?.level ?? 0;
      const bonusReceive = Math.floor(receiveAmount * (1 + tradeDepotLevel * 0.05));
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'trade',
        message: `Traded ${giveAmount}x for ${bonusReceive}x ${receiveDef.name}`,
        metadata: { giveMaterialId, giveAmount, receiveMaterialId, receiveAmount: bonusReceive },
      };
      return {
        ...prev,
        materials: prev.materials.map(m => {
          if (m.materialId === giveMaterialId) return { ...m, count: m.count - giveAmount };
          if (m.materialId === receiveMaterialId) return { ...m, count: m.count + bonusReceive };
          return m;
        }),
        totalTradesCompleted: prev.totalTradesCompleted + 1,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxSellComponent = useCallback((componentInstanceId: string) => {
    setState(prev => {
      const comp = prev.components.find(c => c.instanceId === componentInstanceId);
      if (!comp) return prev;
      const def = SX_COMPONENTS.find(c => c.id === comp.defId);
      if (!def) return prev;
      const rarityMultiplier = [1, 2, 5, 12, 30][def.rarity] ?? 1;
      const sellPrice = Math.floor(def.power * rarityMultiplier * 0.3);
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'sell',
        message: `Sold ${def.name} for ${sellPrice} gold`,
        metadata: { componentInstanceId, sellPrice, rarity: def.rarity },
      };
      return {
        ...prev,
        components: prev.components.filter(c => c.instanceId !== componentInstanceId),
        gold: prev.gold + sellPrice,
        totalComponentsSold: prev.totalComponentsSold + 1,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxUpgradeShip = useCallback((shipInstanceId: string) => {
    setState(prev => {
      const ship = prev.starships.find(s => s.instanceId === shipInstanceId);
      if (!ship) return prev;
      const upgradeCost = Math.floor(ship.powerRating * 0.5);
      if (prev.gold < upgradeCost) return prev;
      const powerIncrease = Math.floor(ship.powerRating * 0.15);
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'ship_upgrade',
        message: `Upgraded ${ship.name}: +${powerIncrease} power`,
        metadata: { shipInstanceId, cost: upgradeCost, powerIncrease },
      };
      return {
        ...prev,
        starships: prev.starships.map(s =>
          s.instanceId === shipInstanceId
            ? { ...s, powerRating: s.powerRating + powerIncrease }
            : s
        ),
        gold: prev.gold - upgradeCost,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxDecommissionShip = useCallback((shipInstanceId: string) => {
    setState(prev => {
      const ship = prev.starships.find(s => s.instanceId === shipInstanceId);
      if (!ship) return prev;
      const scrapProcessorLevel = prev.structures.find(s => s.structureId === 'struct_scrap_processor')?.level ?? 0;
      const refundMult = 0.3 + scrapProcessorLevel * 0.05;
      const refund = Math.floor(ship.powerRating * refundMult);
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'decommission',
        message: `Decommissioned ${ship.name}, recovered ${refund} gold worth of materials`,
        metadata: { shipInstanceId, refund, shipClass: ship.shipClass },
      };
      return {
        ...prev,
        starships: prev.starships.filter(s => s.instanceId !== shipInstanceId),
        gold: prev.gold + refund,
        totalDecommissioned: prev.totalDecommissioned + 1,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxGenerateAntimatter = useCallback((amount: number) => {
    setState(prev => {
      if (amount <= 0) return prev;
      const chamberLevel = prev.structures.find(s => s.structureId === 'struct_antimatter_chamber')?.level ?? 0;
      if (chamberLevel < 1) return prev;
      if (prev.starEnergy < amount * 5) return prev;
      const bonusMult = 1 + chamberLevel * 0.15;
      const actualAmount = Math.floor(amount * bonusMult);
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'antimatter',
        message: `Generated ${actualAmount} antimatter`,
        metadata: { amount, actualAmount, energyCost: amount * 5 },
      };
      return {
        ...prev,
        antimatter: prev.antimatter + actualAmount,
        starEnergy: prev.starEnergy - amount * 5,
        totalAntimatterGenerated: prev.totalAntimatterGenerated + actualAmount,
        heat: Math.min(200, prev.heat + amount * 2),
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  const sxRefineMaterial = useCallback((materialId: string, amount: number) => {
    setState(prev => {
      if (amount <= 0) return prev;
      const stack = prev.materials.find(m => m.materialId === materialId);
      if (!stack || stack.count < amount) return prev;
      const def = SX_NEBULA_MATERIALS.find(m => m.id === materialId);
      if (!def) return prev;
      const crucibleLevel = prev.structures.find(s => s.structureId === 'struct_ore_refinery')?.level ?? 0;
      const qualityBonus = 1 + crucibleLevel * 0.12;
      const goldValue = Math.floor(amount * (def.rarity + 1) * 5 * qualityBonus);
      const log: SXEventLog = {
        id: sxGenerateId('evt'),
        timestamp: Date.now(),
        type: 'refine',
        message: `Refined ${amount}x ${def.name} into ${goldValue} gold`,
        metadata: { materialId, amount, goldValue },
      };
      return {
        ...prev,
        materials: prev.materials.map(m =>
          m.materialId === materialId
            ? { ...m, count: m.count - amount }
            : m
        ),
        gold: prev.gold + goldValue,
        totalRefined: prev.totalRefined + amount,
        eventLog: [log, ...prev.eventLog].slice(0, 100),
      };
    });
  }, []);

  // ─── Achievement Condition Checker ─────────────────────────────────────────

  function sxCheckAchievementCondition(key: string, s: SXState): boolean {
    switch (key) {
      case 'totalForged':
        return s.totalForged >= 10;
      case 'totalAssembled':
        return s.totalAssembled >= 1;
      case 'totalLaunched':
        return s.totalLaunched >= 5;
      case 'totalMaterialsCollected':
        return s.totalMaterialsCollected >= 500;
      case 'totalStructuresBuilt':
        return s.structures.filter(st => st.level > 0).length >= 10;
      case 'heat':
        return s.heat >= 100;
      case 'totalAntimatterGenerated':
        return s.totalAntimatterGenerated >= 100;
      case 'blueprints_learned':
        return s.blueprints.filter(b => b.learned).length >= 10;
      case 'totalTradesCompleted':
        return s.totalTradesCompleted >= 20;
      case 'constellations_aligned':
        return s.constellations.filter(c => c.aligned).length >= 5;
      case 'legendary_forged':
        return s.components.some(c => c.rarity === SX_RARITY_LEGENDARY);
      case 'titan_built':
        return s.starships.some(sh => sh.shipClass === 'Titan');
      case 'max_structure':
        return s.structures.some(st => st.level >= 10);
      case 'totalRefined':
        return s.totalRefined >= 100;
      case 'totalDecommissioned':
        return s.totalDecommissioned >= 10;
      case 'totalComponentsSold':
        return s.totalComponentsSold >= 50;
      case 'title_earned':
        return s.currentTitle === 'Stellar Architect';
      default:
        return false;
    }
  }

  // ─── Getters (useMemo [state]) ────────────────────────────────────────────

  const sxGetForgeList = useMemo(() => {
    return state.forges.map(f => {
      const def = SX_FORGES.find(fd => fd.id === f.forgeId);
      if (!def) return null;
      return {
        ...def,
        active: f.active,
        level: f.level,
        totalOutput: f.totalOutput,
      };
    }).filter((f): f is NonNullable<typeof f> => f !== null);
  }, [state]);

  const sxGetComponentList = useMemo(() => {
    return state.components.map(c => {
      const def = SX_COMPONENTS.find(cd => cd.id === c.defId);
      return {
        ...c,
        typeInfo: def ? sxGetTypeInfo(def.type) : sxGetTypeInfo('unknown'),
        rarityLabel: sxGetRarityLabel(c.rarity),
        rarityColor: sxGetRarityColor(c.rarity),
      };
    });
  }, [state]);

  const sxGetMaterialInventory = useMemo(() => {
    return state.materials
      .filter(m => m.count > 0)
      .map(m => {
        const def = SX_NEBULA_MATERIALS.find(d => d.id === m.materialId);
        if (!def) return null;
        return {
          ...def,
          count: m.count,
          rarityLabel: sxGetRarityLabel(def.rarity),
          rarityColor: sxGetRarityColor(def.rarity),
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => b.rarity - a.rarity);
  }, [state]);

  const sxGetStructureList = useMemo(() => {
    return state.structures.map(s => {
      const def = SX_STRUCTURES.find(d => d.id === s.structureId);
      if (!def) return null;
      const upgradeCost = s.level > 0
        ? sxComputeUpgradeCost(def.baseCost, s.level)
        : def.baseCost;
      return {
        ...def,
        level: s.level,
        built: s.level > 0,
        upgradeCost,
        maxLevel: def.maxLevel,
      };
    }).filter((s): s is NonNullable<typeof s> => s !== null);
  }, [state]);

  const sxGetShipFleet = useMemo(() => {
    return state.starships.map(s => ({
      ...s,
      rarityLabel: 'N/A',
      status: s.launched ? 'Launched' : 'Docked',
    }));
  }, [state]);

  const sxGetTotalPower = useMemo(() => {
    return sxComputeTotalPower(state);
  }, [state]);

  const sxGetHeatEfficiency = useMemo(() => {
    const coolingLevel = state.structures.find(s => s.structureId === 'struct_cooling_tower')?.level ?? 0;
    return sxComputeHeatEfficiency(state.heat, coolingLevel);
  }, [state]);

  const sxGetConstellationBonus = useMemo(() => {
    return sxComputeConstellationBonus(state.constellations);
  }, [state]);

  const sxGetNextTitle = useMemo(() => {
    const power = sxComputeTotalPower(state);
    for (const title of SX_TITLES) {
      if (power < title.requirement) {
        const currentPower = power;
        const nextPower = title.requirement;
        return {
          ...title,
          progress: Math.min(100, Math.floor((currentPower / nextPower) * 100)),
          currentPower,
          nextPower,
        };
      }
    }
    return {
      ...SX_TITLES[SX_TITLES.length - 1],
      progress: 100,
      currentPower: power,
      nextPower: SX_TITLES[SX_TITLES.length - 1].requirement,
    };
  }, [state]);

  const sxGetRaritySummary = useMemo(() => {
    const summary: Record<number, number> = {
      [SX_RARITY_COMMON]: 0,
      [SX_RARITY_UNCOMMON]: 0,
      [SX_RARITY_RARE]: 0,
      [SX_RARITY_EPIC]: 0,
      [SX_RARITY_LEGENDARY]: 0,
    };
    for (const comp of state.components) {
      summary[comp.rarity] = (summary[comp.rarity] ?? 0) + 1;
    }
    return Object.entries(summary).map(([rarity, count]) => ({
      rarity: Number(rarity),
      label: sxGetRarityLabel(Number(rarity)),
      color: sxGetRarityColor(Number(rarity)),
      count,
    }));
  }, [state]);

  const sxGetUnlockedAchievements = useMemo(() => {
    return state.achievements
      .filter(a => a.unlocked)
      .map(a => {
        const def = SX_ACHIEVEMENTS.find(d => d.id === a.achievementId);
        if (!def) return null;
        return {
          ...def,
          unlockedAt: a.unlockedAt,
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);
  }, [state]);

  const sxGetTitleProgress = useMemo(() => {
    const power = sxComputeTotalPower(state);
    return SX_TITLES.map(t => ({
      ...t,
      earned: power >= t.requirement,
      progress: Math.min(100, Math.floor((power / t.requirement) * 100)),
      current: t.name === state.currentTitle,
    }));
  }, [state]);

  const sxGetCraftableBlueprints = useMemo(() => {
    return state.blueprints
      .filter(bp => bp.learned)
      .map(bp => {
        const def = SX_BLUEPRINTS.find(d => d.id === bp.blueprintId);
        if (!def) return null;
        const canCraft = def.requiredMaterials.every(req => {
          const stack = state.materials.find(m => m.materialId === req.materialId);
          return stack !== undefined && stack.count >= req.amount;
        });
        return {
          ...def,
          timesCrafted: bp.timesCrafted,
          canCraft,
          rarityLabel: sxGetRarityLabel(def.rarity),
          rarityColor: sxGetRarityColor(def.rarity),
        };
      })
      .filter((bp): bp is NonNullable<typeof bp> => bp !== null);
  }, [state]);

  const sxGetAntimatterLevel = useMemo(() => {
    return sxComputeAntimatterLevel(state.totalAntimatterGenerated);
  }, [state]);

  const sxGetNebulaYield = useMemo(() => {
    const nebulaSiphonLevel = state.structures.find(s => s.structureId === 'struct_nebula_siphon')?.level ?? 0;
    return {
      baseMultiplier: 1 + state.constellationBonus * 0.01,
      siphonBonus: nebulaSiphonLevel * 0.1,
      totalMultiplier: 1 + state.constellationBonus * 0.01 + nebulaSiphonLevel * 0.1,
    };
  }, [state]);

  // ─── Reference Data Maps ──────────────────────────────────────────────────

  const forgeDefMap = useMemo(() => {
    const map: Record<string, SXForgeDef> = {};
    for (const f of SX_FORGES) {
      map[f.id] = f;
    }
    return map;
  }, []);

  const componentDefMap = useMemo(() => {
    const map: Record<string, SXComponentDef> = {};
    for (const c of SX_COMPONENTS) {
      map[c.id] = c;
    }
    return map;
  }, []);

  const materialDefMap = useMemo(() => {
    const map: Record<string, SXMaterialDef> = {};
    for (const m of SX_NEBULA_MATERIALS) {
      map[m.id] = m;
    }
    return map;
  }, []);

  const structureDefMap = useMemo(() => {
    const map: Record<string, SXStructureDef> = {};
    for (const s of SX_STRUCTURES) {
      map[s.id] = s;
    }
    return map;
  }, []);

  const blueprintDefMap = useMemo(() => {
    const map: Record<string, SXBlueprintDef> = {};
    for (const b of SX_BLUEPRINTS) {
      map[b.id] = b;
    }
    return map;
  }, []);

  const shipDefMap = useMemo(() => {
    const map: Record<string, SXStarshipDef> = {};
    for (const s of SX_STARSHIPS) {
      map[s.id] = s;
    }
    return map;
  }, []);

  // ─── Additional Lookup Helpers ────────────────────────────────────────────

  const sxGetForge = useCallback((forgeId: string) => {
    const current = stateRef.current;
    if (!current) return null;
    const instance = current.forges.find(f => f.forgeId === forgeId);
    if (!instance) return null;
    const def = SX_FORGES.find(d => d.id === forgeId);
    if (!def) return null;
    return { ...def, ...instance };
  }, []);

  const sxGetComponent = useCallback((instanceId: string) => {
    const current = stateRef.current;
    if (!current) return null;
    return current.components.find(c => c.instanceId === instanceId) ?? null;
  }, []);

  const sxGetShip = useCallback((instanceId: string) => {
    const current = stateRef.current;
    if (!current) return null;
    return current.starships.find(s => s.instanceId === instanceId) ?? null;
  }, []);

  const sxGetMaterial = useCallback((materialId: string) => {
    const current = stateRef.current;
    if (!current) return null;
    const stack = current.materials.find(m => m.materialId === materialId);
    if (!stack) return null;
    const def = SX_NEBULA_MATERIALS.find(d => d.id === materialId);
    if (!def) return null;
    return { ...def, count: stack.count };
  }, []);

  const sxGetStructure = useCallback((structureId: string) => {
    const current = stateRef.current;
    if (!current) return null;
    const instance = current.structures.find(s => s.structureId === structureId);
    if (!instance) return null;
    const def = SX_STRUCTURES.find(d => d.id === structureId);
    if (!def) return null;
    return { ...def, level: instance.level };
  }, []);

  const sxCanForgeComponent = useCallback((componentDefId: string): boolean => {
    const current = stateRef.current;
    if (!current) return false;
    const def = SX_COMPONENTS.find(c => c.id === componentDefId);
    if (!def) return false;
    const cost = sxComputeForgeCost(componentDefId);
    if (current.gold < cost) return false;
    if (current.starEnergy < 10) return false;
    const forge = current.forges.find(f => f.forgeId === current.activeForgeId);
    if (!forge || forge.level < 1) return false;
    return true;
  }, []);

  const sxCanBuildStructure = useCallback((structureId: string): boolean => {
    const current = stateRef.current;
    if (!current) return false;
    const def = SX_STRUCTURES.find(s => s.id === structureId);
    if (!def) return false;
    const existing = current.structures.find(s => s.structureId === structureId);
    if (!existing || existing.level > 0) return false;
    if (current.gold < def.baseCost) return false;
    return true;
  }, []);

  const sxCanUpgradeStructure = useCallback((structureId: string): boolean => {
    const current = stateRef.current;
    if (!current) return false;
    const def = SX_STRUCTURES.find(s => s.id === structureId);
    if (!def) return false;
    const existing = current.structures.find(s => s.structureId === structureId);
    if (!existing || existing.level < 1) return false;
    if (existing.level >= def.maxLevel) return false;
    const cost = sxComputeUpgradeCost(def.baseCost, existing.level);
    if (current.gold < cost) return false;
    return true;
  }, []);

  const sxGetEventLog = useCallback(() => {
    const current = stateRef.current;
    if (!current) return [];
    return current.eventLog;
  }, []);

  const sxClearEventLog = useCallback(() => {
    setState(prev => ({ ...prev, eventLog: [] }));
  }, []);

  const sxAddGold = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState(prev => ({ ...prev, gold: prev.gold + amount }));
  }, []);

  const sxSpendGold = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState(prev => {
      if (prev.gold < amount) return prev;
      return { ...prev, gold: prev.gold - amount };
    });
  }, []);

  const sxAddStarEnergy = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState(prev => ({ ...prev, starEnergy: prev.starEnergy + amount }));
  }, []);

  // ─── Return API ───────────────────────────────────────────────────────────

  return {
    // State
    ...state,

    // Computed
    computedTitle,
    computedConstellationBonus,

    // Getters
    sxGetForgeList,
    sxGetComponentList,
    sxGetMaterialInventory,
    sxGetStructureList,
    sxGetShipFleet,
    sxGetTotalPower,
    sxGetHeatEfficiency,
    sxGetConstellationBonus,
    sxGetNextTitle,
    sxGetRaritySummary,
    sxGetUnlockedAchievements,
    sxGetTitleProgress,
    sxGetCraftableBlueprints,
    sxGetAntimatterLevel,
    sxGetNebulaYield,

    // Core Actions
    sxActivateForge,
    sxForgeComponent,
    sxAssembleShip,
    sxCollectMaterial,
    sxSmeltOre,
    sxBuildStructure,
    sxUpgradeStructure,
    sxLearnBlueprint,
    sxLaunchShip,
    sxRecallShip,
    sxAdjustHeat,
    sxHarvestNebula,
    sxAlignConstellation,
    sxUnlockTitle,
    sxClaimAchievement,
    sxTradeMaterial,
    sxSellComponent,
    sxUpgradeShip,
    sxDecommissionShip,
    sxGenerateAntimatter,
    sxRefineMaterial,

    // Lookup Helpers
    sxGetForge,
    sxGetComponent,
    sxGetShip,
    sxGetMaterial,
    sxGetStructure,
    sxCanForgeComponent,
    sxCanBuildStructure,
    sxCanUpgradeStructure,
    sxGetEventLog,
    sxClearEventLog,
    sxAddGold,
    sxSpendGold,
    sxAddStarEnergy,

    // Lookup Maps
    forgeDefMap,
    componentDefMap,
    materialDefMap,
    structureDefMap,
    blueprintDefMap,
    shipDefMap,

    // Reference Data
    forgeDefs: SX_FORGES,
    componentDefs: SX_COMPONENTS,
    materialDefs: SX_NEBULA_MATERIALS,
    structureDefs: SX_STRUCTURES,
    blueprintDefs: SX_BLUEPRINTS,
    abilityDefs: SX_ABILITIES,
    achievementDefs: SX_ACHIEVEMENTS,
    titleDefs: SX_TITLES,
    starshipDefs: SX_STARSHIPS,
    constellationDefs: SX_CONSTELLATIONS,
    synergyPairs: SX_SYNERGY_PAIRS,
    loreEntries: SX_LORE_ENTRIES,

    // Type & Rarity Info
    rarityNames: SX_RARITY_NAMES,
    rarityColors: SX_RARITY_COLORS,
    typeInfo: SX_TYPE_INFO,
    getTypeInfo: sxGetTypeInfo,
    getRarityLabel: sxGetRarityLabel,
    getRarityColor: sxGetRarityColor,

    // Color Constants
    colors: {
      star: SX_COLOR_STAR,
      plasma: SX_COLOR_PLASMA,
      nebula: SX_COLOR_NEBULA,
      darkMatter: SX_COLOR_DARKMATTER,
      stellar: SX_COLOR_STELLAR,
      forge: SX_COLOR_FORGE,
      antimatter: SX_COLOR_ANTIMATTER,
      comet: SX_COLOR_COMET,
    },
  };
}
