import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ─── Color Theme Constants ────────────────────────────────────────────────────
const CK_BRASS = '#FF8F00';
const CK_COPPER = '#E65100';
const CK_STEEL = '#607D8B';
const CK_STEAM_WHITE = '#ECEFF1';
const CK_AMBER = '#FFB300';
const CK_DARK_IRON = '#263238';
const CK_PATINA = '#4DB6AC';
const CK_RUST = '#BF360C';
const CK_GOLD_GEAR = '#FFD54F';
const CK_SILVER_BOLT = '#B0BEC5';
const CK_BRONZE_PLATE = '#8D6E63';
const CK_DARK_BRASS = '#F57F17';
const CK_LIGHT_STEAM = '#F5F5F5';
const CK_SHADOW_GEAR = '#37474F';
const CK_EMERALD_SPRING = '#00C853';
const CK_RUBY_GEM = '#D50000';
const CK_SAPPHIRE_BEARING = '#2962FF';
const CK_CLOCKFACE = '#FFF8E1';

// ─── Rarity Tiers ─────────────────────────────────────────────────────────────
const CK_RARITY_COMMON = 0;
const CK_RARITY_UNCOMMON = 1;
const CK_RARITY_RARE = 2;
const CK_RARITY_EPIC = 3;
const CK_RARITY_LEGENDARY = 4;

const CK_RARITY_NAMES: Record<number, string> = {
  [CK_RARITY_COMMON]: 'Common',
  [CK_RARITY_UNCOMMON]: 'Uncommon',
  [CK_RARITY_RARE]: 'Rare',
  [CK_RARITY_EPIC]: 'Epic',
  [CK_RARITY_LEGENDARY]: 'Legendary',
};

const CK_RARITY_COLORS: Record<number, string> = {
  [CK_RARITY_COMMON]: CK_SILVER_BOLT,
  [CK_RARITY_UNCOMMON]: CK_EMERALD_SPRING,
  [CK_RARITY_RARE]: CK_SAPPHIRE_BEARING,
  [CK_RARITY_EPIC]: CK_AMBER,
  [CK_RARITY_LEGENDARY]: CK_RUBY_GEM,
};

// ─── Automaton Types ──────────────────────────────────────────────────────────
const CK_TYPE_SENTINEL = 'sentinel';
const CK_TYPE_CRAFTSMAN = 'craftsman';
const CK_TYPE_SCOUT = 'scout';
const CK_TYPE_DEFENDER = 'defender';
const CK_TYPE_INVENTOR = 'inventor';
const CK_TYPE_HEALER = 'healer';
const CK_TYPE_COMMANDER = 'commander';
const CK_TYPE_COLLECTOR = 'collector';

// ─── Automaton Type Display Info ─────────────────────────────────────────────
const CK_TYPE_INFO: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  [CK_TYPE_SENTINEL]: { label: 'Sentinel', icon: '👁️', color: CK_STEEL, desc: 'Automatons tasked with vigilance, perimeter patrol, and threat detection.' },
  [CK_TYPE_CRAFTSMAN]: { label: 'Craftsman', icon: '🔧', color: CK_BRASS, desc: 'Makers and builders that fabricate, assemble, and maintain mechanical components.' },
  [CK_TYPE_SCOUT]: { label: 'Scout', icon: '🔍', color: CK_AMBER, desc: 'Swift reconnaissance units that explore, map, and gather intelligence.' },
  [CK_TYPE_DEFENDER]: { label: 'Defender', icon: '🛡️', color: CK_COPPER, desc: 'Heavy-duty combat automatons that protect the kingdom from external threats.' },
  [CK_TYPE_INVENTOR]: { label: 'Inventor', icon: '💡', color: CK_GOLD_GEAR, desc: 'Brilliant analytical automatons that design new blueprints and solve complex problems.' },
  [CK_TYPE_HEALER]: { label: 'Healer', icon: '💚', color: CK_PATINA, desc: 'Restorative automatons that apply lubricants, mend gears, and repair allies.' },
  [CK_TYPE_COMMANDER]: { label: 'Commander', icon: '👑', color: CK_RUBY_GEM, desc: 'Supreme tactical units that coordinate all other automatons in strategic operations.' },
  [CK_TYPE_COLLECTOR]: { label: 'Collector', icon: '📦', color: CK_BRONZE_PLATE, desc: 'Gatherer units that scavenge parts, monitor resources, and maintain inventory.' },
};

// ─── Part Rarity Forge Thresholds ───────────────────────────────────────────
const CK_FORGE_RARITY_THRESHOLD: Record<number, number> = {
  [CK_RARITY_COMMON]: 0,
  [CK_RARITY_UNCOMMON]: 3,
  [CK_RARITY_RARE]: 5,
  [CK_RARITY_EPIC]: 7,
  [CK_RARITY_LEGENDARY]: 9,
};

// ─── Structure Synergy Bonuses ───────────────────────────────────────────────
const CK_SYNERGY_PAIRS: Array<{ a: string; b: string; bonus: string; value: number }> = [
  { a: 'struct_gear_mill', b: 'struct_assembly_line', bonus: 'gear_throughput', value: 0.15 },
  { a: 'struct_steam_boiler', b: 'struct_steam_engine', bonus: 'steam_generation', value: 0.2 },
  { a: 'struct_research_bench', b: 'struct_invention_lab', bonus: 'research_speed', value: 0.25 },
  { a: 'struct_turret_battery', b: 'struct_shield_generator', bonus: 'defense_rating', value: 0.3 },
  { a: 'struct_alloy_furnace', b: 'struct_bolt_forge', bonus: 'forging_quality', value: 0.15 },
  { a: 'struct_aether_tower', b: 'struct_celestial_observatory', bonus: 'aether_yield', value: 0.2 },
  { a: 'struct_repair_bay', b: 'struct_oil_press', bonus: 'repair_speed', value: 0.2 },
  { a: 'struct_mining_drill', b: 'struct_copper_smelter', bonus: 'ore_processing', value: 0.15 },
  { a: 'struct_clocktower', b: 'struct_pressure_vault', bonus: 'temporal_stability', value: 0.18 },
  { a: 'struct_wind_tunnel', b: 'struct_training_ground', bonus: 'training_efficiency', value: 0.12 },
];

// ─── Daily Task Templates ───────────────────────────────────────────────────
const CK_DAILY_TASK_TEMPLATES: Array<{ description: string; type: CKMaintenanceTask['type']; reward: number; energyBonus: number }> = [
  { description: 'Inspect the main gear assembly for wear and micro-fractures.', type: 'inspect', reward: 15, energyBonus: 5 },
  { description: 'Collect 3 loose brass gears from the corridors of Gearheart Plaza.', type: 'collect', reward: 20, energyBonus: 8 },
  { description: 'Repair a damaged steam valve in the foundry pressure chamber.', type: 'repair', reward: 25, energyBonus: 10 },
  { description: 'Purge rust accumulations from the eastern perimeter wall mechanisms.', type: 'purge', reward: 30, energyBonus: 12 },
  { description: 'Build a replacement secondary cog for the clocktower escapement.', type: 'build', reward: 35, energyBonus: 15 },
  { description: 'Lubricate the main steam engine bearings with high-grade oil.', type: 'repair', reward: 18, energyBonus: 7 },
  { description: 'Clear debris and rust flakes from the vapor canal intake grates.', type: 'collect', reward: 22, energyBonus: 9 },
  { description: 'Reinforce the iron vault entrance gears against corrosion.', type: 'build', reward: 28, energyBonus: 11 },
  { description: 'Inspect all pressure gauges across the lower district networks.', type: 'inspect', reward: 20, energyBonus: 8 },
  { description: 'Eliminate deep rust deposits in the cog crypt access tunnels.', type: 'purge', reward: 40, energyBonus: 16 },
  { description: 'Recalibrate the celestial observatory main tracking lens.', type: 'inspect', reward: 32, energyBonus: 13 },
  { description: 'Replace worn tension springs in the training ground automata.', type: 'repair', reward: 26, energyBonus: 10 },
  { description: 'Forge a set of reinforcing brackets for the clocktower facade.', type: 'build', reward: 38, energyBonus: 14 },
  { description: 'Deep-clean the aether tower condenser coils of crystalline residue.', type: 'inspect', reward: 24, energyBonus: 10 },
  { description: 'Salvage usable components from decommissioned automatons in the vault.', type: 'collect', reward: 30, energyBonus: 12 },
];

// ─── Rust Event Definitions ─────────────────────────────────────────────────
const CK_RUST_EVENTS: Array<{ name: string; severity: number; desc: string; damage: number }> = [
  { name: 'Light Corrosion', severity: 1, desc: 'A thin layer of rust forms on exposed metal surfaces.', damage: 2 },
  { name: 'Gear Binding', severity: 2, desc: 'Rust particles jam between gear teeth, slowing rotation.', damage: 5 },
  { name: 'Pipe Erosion', severity: 2, desc: 'Steam pipes develop rust-induced micro-leaks.', damage: 4 },
  { name: 'Spring Fatigue', severity: 3, desc: 'Tension springs weaken as rust attacks their coils.', damage: 8 },
  { name: 'Circuit Corrosion', severity: 3, desc: 'Oxidation degrades copper circuits in automaton brains.', damage: 7 },
  { name: 'Rust Storm', severity: 4, desc: 'A violent storm of rust particles engulfs a district.', damage: 15 },
  { name: 'Catastrophic Failure', severity: 5, desc: 'Critical mechanism fails due to extreme rust penetration.', damage: 25 },
  { name: 'The Great Decay', severity: 5, desc: 'An ancient rust entity awakens in the deep foundations.', damage: 30 },
];

// ─── Kingdom Lore Entries ────────────────────────────────────────────────────
const CK_LORE_ENTRIES: Array<{ id: string; title: string; text: string; district: string }> = [
  { id: 'lore_001', title: 'The First Gear', text: 'Before the kingdom, there was a single gear, turning endlessly in the void. From its motion, all else was born — steam, brass, and the endless pursuit of mechanical perfection.', district: 'district_gearheart' },
  { id: 'lore_002', title: 'The Watchmaker\'s Covenant', text: 'The Eternal Watchmaker inscribed the First Law upon the Celestial Escapement: "Every gear that turns must be maintained, every spring that winds must be respected, for entropy is the only true enemy."', district: 'district_celestialgears' },
  { id: 'lore_003', title: 'The Rust Wars', text: 'For a thousand years, the kingdom fought the creeping rust. Entire districts fell silent as corrosion consumed their mechanisms. Only the Shield Generator held the final line.', district: 'district_ironvault' },
  { id: 'lore_004', title: 'Song of the Mainspring', text: 'Deep in the Spring Garden, ancient mainsprings hum a harmonic resonance. Those who listen carefully can hear the heartbeat of the kingdom itself.', district: 'district_springgarden' },
  { id: 'lore_005', title: 'The Aether Discovery', text: 'Professor Cogsworth accidentally captured aetheric energy in a copper coil during a thunderstorm. The Aether Laboratory was built within the year.', district: 'district_aetherlab' },
  { id: 'lore_006', title: 'Vapor Canal Chronicles', text: 'The canals were not built — they were carved by the first Steam Leviathan, whose passage through solid rock left perfectly cylindrical tunnels.', district: 'district_vaporcanal' },
  { id: 'lore_007', title: 'Secrets of the Crypt', text: 'Below the Cog Crypt lie blueprints for automata that should not exist — designs for self-replicating machines and sentient gears.', district: 'district_cogcrypt' },
  { id: 'lore_008', title: 'The Foundry\'s Flame', text: 'The Steamworks Foundry burns with a fire that has never been extinguished. Its fuel is the compressed entropy of all rust ever purged.', district: 'district_steamworks' },
];

// ─── 35 Clockwork Automatons (5 Rarity Tiers) ─────────────────────────────────
const CK_AUTOMATON_DEFS = [
  // Common (7)
  { id: 'auto_cogspinner', name: 'Cogspinner', rarity: CK_RARITY_COMMON, type: CK_TYPE_CRAFTSMAN, power: 10, desc: 'A basic gear-turning automaton that keeps small mechanisms running.' },
  { id: 'auto_springmouse', name: 'Spring Mouse', rarity: CK_RARITY_COMMON, type: CK_TYPE_SCOUT, power: 8, desc: 'A tiny mouse-shaped scout that scurries through pipes and vents.' },
  { id: 'auto_brassbeetle', name: 'Brass Beetle', rarity: CK_RARITY_COMMON, type: CK_TYPE_COLLECTOR, power: 9, desc: 'Collects loose gears and springs scattered across the workshop floor.' },
  { id: 'auto_tinwatchman', name: 'Tin Watchman', rarity: CK_RARITY_COMMON, type: CK_TYPE_SENTINEL, power: 12, desc: 'A simple tin-plated guard that patrols narrow corridors.' },
  { id: 'auto_steamspider', name: 'Steam Spider', rarity: CK_RARITY_COMMON, type: CK_TYPE_SCOUT, power: 11, desc: 'An eight-legged crawler that scales walls to inspect the kingdom infrastructure.' },
  { id: 'auto_coppertick', name: 'Copper Tick', rarity: CK_RARITY_COMMON, type: CK_TYPE_COLLECTOR, power: 7, desc: 'Attaches to larger machines to monitor pressure readings.' },
  { id: 'auto_irondove', name: 'Iron Dove', rarity: CK_RARITY_COMMON, type: CK_TYPE_SCOUT, power: 10, desc: 'A mechanical messenger dove that delivers encoded scrolls.' },
  // Uncommon (7)
  { id: 'auto_gearwolf', name: 'Gear Wolf', rarity: CK_RARITY_UNCOMMON, type: CK_TYPE_DEFENDER, power: 25, desc: 'A ferocious wolf-shaped automaton that hunts rust vermin in the lower districts.' },
  { id: 'auto_steamowl', name: 'Steam Owl', rarity: CK_RARITY_UNCOMMON, type: CK_TYPE_SCOUT, power: 22, desc: 'Possesses thermal vision lenses to detect overheating machinery at night.' },
  { id: 'auto_forgearm', name: 'Forge Arm', rarity: CK_RARITY_UNCOMMON, type: CK_TYPE_CRAFTSMAN, power: 28, desc: 'A multi-jointed arm that assists in heavy forging and metalwork.' },
  { id: 'auto_turretcrab', name: 'Turret Crab', rarity: CK_RARITY_UNCOMMON, type: CK_TYPE_DEFENDER, power: 24, desc: 'A crustacean automaton with a rotating brass cannon on its back.' },
  { id: 'auto_windmoth', name: 'Wind Moth', rarity: CK_RARITY_UNCOMMON, type: CK_TYPE_SCOUT, power: 20, desc: 'Delicate wings of thin brass foil allow it to glide on thermal updrafts.' },
  { id: 'auto_boildog', name: 'Boil Dog', rarity: CK_RARITY_UNCOMMON, type: CK_TYPE_DEFENDER, power: 26, desc: 'Powered by a miniature boiler, it emits bursts of scalding steam.' },
  { id: 'auto_aqualobster', name: 'Aqua Lobster', rarity: CK_RARITY_UNCOMMON, type: CK_TYPE_COLLECTOR, power: 21, desc: 'Operates in flooded sections of the kingdom to retrieve sunken parts.' },
  // Rare (7)
  { id: 'auto_chronoknight', name: 'Chrono Knight', rarity: CK_RARITY_RARE, type: CK_TYPE_DEFENDER, power: 55, desc: 'Armored in layered clockwork plates, it can briefly slow local time to dodge attacks.' },
  { id: 'auto_alchemistfrog', name: 'Alchemist Frog', rarity: CK_RARITY_RARE, type: CK_TYPE_HEALER, power: 50, desc: 'Brews restorative lubricants inside its belly and applies them to damaged gears.' },
  { id: 'auto_teslabird', name: 'Tesla Bird', rarity: CK_RARITY_RARE, type: CK_TYPE_INVENTOR, power: 52, desc: 'Generates static electricity to jump-start stalled power conduits.' },
  { id: 'auto_oraclecrab', name: 'Oracle Crab', rarity: CK_RARITY_RARE, type: CK_TYPE_INVENTOR, power: 48, desc: 'Predicts mechanical failures by analyzing vibration patterns through its shell.' },
  { id: 'auto_vaporphantom', name: 'Vapor Phantom', rarity: CK_RARITY_RARE, type: CK_TYPE_SCOUT, power: 45, desc: 'Transforms into a cloud of steam to infiltrate sealed chambers.' },
  { id: 'auto_magneturchin', name: 'Magnet Urchin', rarity: CK_RARITY_RARE, type: CK_TYPE_COLLECTOR, power: 47, desc: 'Attracts and collects ferrous debris with powerful internal magnets.' },
  { id: 'auto_pistonram', name: 'Piston Ram', rarity: CK_RARITY_RARE, type: CK_TYPE_DEFENDER, power: 58, desc: 'A battering ram automaton that smashes through rust-encrusted barriers.' },
  // Epic (7)
  { id: 'auto_springtitan', name: 'Spring Titan', rarity: CK_RARITY_EPIC, type: CK_TYPE_DEFENDER, power: 110, desc: 'A colossal humanoid powered by massive mainsprings, guarding the inner sanctum.' },
  { id: 'auto_vaporsphinx', name: 'Vapor Sphinx', rarity: CK_RARITY_EPIC, type: CK_TYPE_COMMANDER, power: 105, desc: 'Poses mechanical riddles; incorrect answers trigger steam-powered traps.' },
  { id: 'auto_gearsnake', name: 'Gear Serpent', rarity: CK_RARITY_EPIC, type: CK_TYPE_DEFENDER, power: 115, desc: 'A segmented serpent that coils around structures, shielding them from rust storms.' },
  { id: 'auto_clockphoenix', name: 'Clock Phoenix', rarity: CK_RARITY_EPIC, type: CK_TYPE_HEALER, power: 100, desc: 'Periodically immolates in cleansing flames that restore all nearby automatons.' },
  { id: 'auto_aetherwyrm', name: 'Aether Wyrm', rarity: CK_RARITY_EPIC, type: CK_TYPE_DEFENDER, power: 112, desc: 'Tunnels through the kingdom foundations, reinforcing structural integrity.' },
  { id: 'auto_grandarchitect', name: 'Grand Architect', rarity: CK_RARITY_EPIC, type: CK_TYPE_INVENTOR, power: 108, desc: 'Blueprints new structures autonomously and guides construction automatons.' },
  { id: 'auto_steamleviathan', name: 'Steam Leviathan', rarity: CK_RARITY_EPIC, type: CK_TYPE_DEFENDER, power: 120, desc: 'An enormous aquatic automaton patrolling the moat and underwater gates.' },
  // Legendary (7)
  { id: 'auto_primordial_engine', name: 'Primordial Engine', rarity: CK_RARITY_LEGENDARY, type: CK_TYPE_COMMANDER, power: 250, desc: 'The original heart of the kingdom, an ancient self-evolving mechanism of immense power.' },
  { id: 'auto_eternal_watchmaker', name: 'Eternal Watchmaker', rarity: CK_RARITY_LEGENDARY, type: CK_TYPE_INVENTOR, power: 240, desc: 'A sage-like automaton said to have designed the kingdom itself. Can create new automatons.' },
  { id: 'auto_sovereign_golem', name: 'Sovereign Golem', rarity: CK_RARITY_LEGENDARY, type: CK_TYPE_DEFENDER, power: 260, desc: 'A towering war machine clad in indestructible orichalcum plating.' },
  { id: 'auto_chronodragon', name: 'Chrono Dragon', rarity: CK_RARITY_LEGENDARY, type: CK_TYPE_DEFENDER, power: 270, desc: 'Wings of interlocking gears, breathes temporal distortion that freezes rust in place.' },
  { id: 'auto_godmaker', name: 'Godmaker', rarity: CK_RARITY_LEGENDARY, type: CK_TYPE_INVENTOR, power: 280, desc: 'A reality-sculpting automaton that can rewrite the fundamental laws of the kingdom.' },
  { id: 'auto_starforge_titan', name: 'Starforge Titan', rarity: CK_RARITY_LEGENDARY, type: CK_TYPE_CRAFTSMAN, power: 255, desc: 'Harvests stellar energy to forge parts of impossible durability.' },
  { id: 'auto_ouroboros_prime', name: 'Ouroboros Prime', rarity: CK_RARITY_LEGENDARY, type: CK_TYPE_COMMANDER, power: 290, desc: 'A self-consuming and self-rebuilding serpent, symbol of the infinite clockwork cycle.' },
];

// ─── 8 Kingdom Districts ──────────────────────────────────────────────────────
const CK_DISTRICT_DEFS = [
  { id: 'district_gearheart', name: 'Gearheart Plaza', desc: 'Central hub where all major gear assemblies converge.', icon: '⚙️', energyCost: 0, unlockPower: 0 },
  { id: 'district_steamworks', name: 'Steamworks Foundry', desc: 'Industrial district where raw materials are smelted and forged.', icon: '🔨', energyCost: 5, unlockPower: 50 },
  { id: 'district_springgarden', name: 'Spring Garden', desc: 'A serene sanctuary of winding springs and harmonic oscillators.', icon: '🌿', energyCost: 10, unlockPower: 150 },
  { id: 'district_aetherlab', name: 'Aether Laboratory', desc: 'Advanced research facility studying temporal and elemental mechanics.', icon: '🔬', energyCost: 15, unlockPower: 300 },
  { id: 'district_ironvault', name: 'Iron Vault', desc: 'An impregnable underground armory storing legendary clockwork relics.', icon: '🛡️', energyCost: 20, unlockPower: 500 },
  { id: 'district_vaporcanal', name: 'Vapor Canal', desc: 'A network of steam-powered waterways for transporting parts and automatons.', icon: '🌊', energyCost: 25, unlockPower: 750 },
  { id: 'district_cogcrypt', name: 'Cog Crypt', desc: 'The deep catacombs where ancient and forbidden automaton blueprints rest.', icon: '💀', energyCost: 30, unlockPower: 1000 },
  { id: 'district_celestialgears', name: 'Celestial Gears', desc: 'The uppermost spire connecting the kingdom to the cosmic clockwork.', icon: '✨', energyCost: 50, unlockPower: 2000 },
];

// ─── 30 Mechanical Parts ──────────────────────────────────────────────────────
const CK_PART_DEFS = [
  { id: 'part_brass_gear_s', name: 'Small Brass Gear', rarity: CK_RARITY_COMMON, value: 5, desc: 'A basic 12-tooth brass gear.' },
  { id: 'part_copper_spring', name: 'Copper Spring', rarity: CK_RARITY_COMMON, value: 4, desc: 'A coiled tension spring for storing energy.' },
  { id: 'part_steel_bolt', name: 'Steel Bolt', rarity: CK_RARITY_COMMON, value: 3, desc: 'A hex-head bolt for securing panels.' },
  { id: 'part_tin_plate', name: 'Tin Plate', rarity: CK_RARITY_COMMON, value: 3, desc: 'A thin sheet of tin for covering frames.' },
  { id: 'part_charcoal_piston', name: 'Charcoal Piston', rarity: CK_RARITY_COMMON, value: 6, desc: 'A piston powered by compressed charcoal gas.' },
  { id: 'part_brass_gear_l', name: 'Large Brass Gear', rarity: CK_RARITY_UNCOMMON, value: 15, desc: 'A 48-tooth precision-milled brass gear.' },
  { id: 'part_silver_bearing', name: 'Silver Bearing', rarity: CK_RARITY_UNCOMMON, value: 12, desc: 'A friction-reducing bearing coated in silver.' },
  { id: 'part_steam_valve', name: 'Steam Valve', rarity: CK_RARITY_UNCOMMON, value: 14, desc: 'A pressure-regulating valve for steam conduits.' },
  { id: 'part_copper_coil', name: 'Copper Coil', rarity: CK_RARITY_UNCOMMON, value: 11, desc: 'An electromagnetic coil wound from pure copper wire.' },
  { id: 'part_crankshaft', name: 'Crankshaft', rarity: CK_RARITY_UNCOMMON, value: 16, desc: 'A multi-jointed shaft converting linear to rotary motion.' },
  { id: 'part_quartz_oscillator', name: 'Quartz Oscillator', rarity: CK_RARITY_UNCOMMON, value: 13, desc: 'A timekeeping crystal that maintains precise frequency.' },
  { id: 'part_brass_gear_xl', name: 'Grand Brass Gear', rarity: CK_RARITY_RARE, value: 45, desc: 'A 120-tooth master gear for the central mechanism.' },
  { id: 'part_titanium_frame', name: 'Titanium Frame', rarity: CK_RARITY_RARE, value: 50, desc: 'An ultra-lightweight yet incredibly strong structural frame.' },
  { id: 'part_philosopher_circuit', name: 'Philosopher Circuit', rarity: CK_RARITY_RARE, value: 55, desc: 'A logic circuit that mimics rudimentary decision-making.' },
  { id: 'part_vapor_crystal', name: 'Vapor Crystal', rarity: CK_RARITY_RARE, value: 48, desc: 'A crystallized condensate of pure steam essence.' },
  { id: 'part_diamond_bearing', name: 'Diamond Bearing', rarity: CK_RARITY_RARE, value: 60, desc: 'A near-frictionless bearing with a diamond core.' },
  { id: 'part_clockwork_brain', name: 'Clockwork Brain', rarity: CK_RARITY_RARE, value: 52, desc: 'A miniature differential engine serving as a processing unit.' },
  { id: 'part_mainspring_prime', name: 'Mainspring Prime', rarity: CK_RARITY_EPIC, value: 150, desc: 'A massive mainspring capable of powering entire districts.' },
  { id: 'part_aether_condenser', name: 'Aether Condenser', rarity: CK_RARITY_EPIC, value: 160, desc: 'Condenses raw aetheric energy into usable mechanical force.' },
  { id: 'part_orichalcum_plating', name: 'Orichalcum Plating', rarity: CK_RARITY_EPIC, value: 170, desc: 'Legendary alloy plating impervious to rust and corrosion.' },
  { id: 'part_temporal_gear', name: 'Temporal Gear', rarity: CK_RARITY_EPIC, value: 180, desc: 'A gear that rotates in four-dimensional spacetime.' },
  { id: 'part_stellar_furnace', name: 'Stellar Furnace', rarity: CK_RARITY_EPIC, value: 155, desc: 'A miniature furnace burning with captured stellar plasma.' },
  { id: 'part_entropy_resistor', name: 'Entropy Resistor', rarity: CK_RARITY_EPIC, value: 165, desc: 'Resists the universal decay of all mechanical systems.' },
  { id: 'part_cosmic_cog', name: 'Cosmic Cog', rarity: CK_RARITY_LEGENDARY, value: 500, desc: 'A gear carved from a fallen star, pulsing with cosmic energy.' },
  { id: 'part_infinity_spring', name: 'Infinity Spring', rarity: CK_RARITY_LEGENDARY, value: 550, desc: 'A self-winding spring that generates more energy than it consumes.' },
  { id: 'part_singularity_core', name: 'Singularity Core', rarity: CK_RARITY_LEGENDARY, value: 600, desc: 'A contained singularity serving as an infinite power source.' },
  { id: 'part_godhand_actuator', name: 'Godhand Actuator', rarity: CK_RARITY_LEGENDARY, value: 520, desc: 'An actuator so precise it can manipulate individual atoms.' },
  { id: 'part_eternity_oil', name: 'Eternity Oil', rarity: CK_RARITY_LEGENDARY, value: 480, desc: 'A single drop lubricates an entire machine for eternity.' },
  { id: 'part_celestial_escapement', name: 'Celestial Escapement', rarity: CK_RARITY_LEGENDARY, value: 570, desc: 'The ultimate timekeeping mechanism, synchronized with the stars.' },
  { id: 'part_worldheart_valve', name: 'Worldheart Valve', rarity: CK_RARITY_LEGENDARY, value: 650, desc: 'Controls the flow of energy from the very heart of the world.' },
];

// ─── 25 Workshop Structures (Upgradeable to Lv10) ────────────────────────────
const CK_STRUCTURE_DEFS = [
  { id: 'struct_gear_mill', name: 'Gear Mill', desc: 'Produces brass gears from raw copper ingots.', maxLevel: 10, baseCost: 10 },
  { id: 'struct_steam_boiler', name: 'Steam Boiler', desc: 'Generates steam pressure to power district machinery.', maxLevel: 10, baseCost: 15 },
  { id: 'struct_spring_winder', name: 'Spring Winder', desc: 'Winds tension springs of various calibers.', maxLevel: 10, baseCost: 12 },
  { id: 'struct_bolt_forge', name: 'Bolt Forge', desc: 'Forges steel bolts and nuts for construction.', maxLevel: 10, baseCost: 8 },
  { id: 'struct_assembly_line', name: 'Assembly Line', desc: 'Automates the construction of common automatons.', maxLevel: 10, baseCost: 25 },
  { id: 'struct_oil_press', name: 'Oil Press', desc: 'Extracts lubrication oil from mechanical seeds.', maxLevel: 10, baseCost: 10 },
  { id: 'struct_copper_smelter', name: 'Copper Smelter', desc: 'Smelts raw copper ore into workable ingots.', maxLevel: 10, baseCost: 18 },
  { id: 'struct_quartz_cutter', name: 'Quartz Cutter', desc: 'Precisely cuts quartz crystals for oscillators.', maxLevel: 10, baseCost: 20 },
  { id: 'struct_turret_battery', name: 'Turret Battery', desc: 'Defensive battery of steam-powered turrets.', maxLevel: 10, baseCost: 30 },
  { id: 'struct_repair_bay', name: 'Repair Bay', desc: 'Restores damaged automatons to full operational capacity.', maxLevel: 10, baseCost: 22 },
  { id: 'struct_research_bench', name: 'Research Bench', desc: 'Unlocks new blueprints through experimentation.', maxLevel: 10, baseCost: 35 },
  { id: 'struct_steam_engine', name: 'Steam Engine', desc: 'A large-scale engine driving multiple district systems.', maxLevel: 10, baseCost: 40 },
  { id: 'struct_wind_tunnel', name: 'Wind Tunnel', desc: 'Tests automaton aerodynamics and calibrates flight systems.', maxLevel: 10, baseCost: 28 },
  { id: 'struct_pressure_vault', name: 'Pressure Vault', desc: 'Stores compressed steam for emergency power bursts.', maxLevel: 10, baseCost: 32 },
  { id: 'struct_magnet_forge', name: 'Magnet Forge', desc: 'Creates powerful electromagnets for advanced automatons.', maxLevel: 10, baseCost: 38 },
  { id: 'struct_aether_tower', name: 'Aether Tower', desc: 'Harvests ambient aetheric energy from the atmosphere.', maxLevel: 10, baseCost: 50 },
  { id: 'struct_training_ground', name: 'Training Ground', desc: 'Trains automatons in combat and defense protocols.', maxLevel: 10, baseCost: 35 },
  { id: 'struct_alloy_furnace', name: 'Alloy Furnace', desc: 'Creates exotic alloys like orichalcum and starsteel.', maxLevel: 10, baseCost: 55 },
  { id: 'struct_crane_system', name: 'Crane System', desc: 'Heavy-lifting cranes for moving large components.', maxLevel: 10, baseCost: 25 },
  { id: 'struct_safety_valve', name: 'Safety Valve Station', desc: 'Prevents catastrophic overpressure in steam networks.', maxLevel: 10, baseCost: 15 },
  { id: 'struct_clocktower', name: 'Clocktower', desc: 'The grand timekeeping tower that synchronizes the entire kingdom.', maxLevel: 10, baseCost: 60 },
  { id: 'struct_mining_drill', name: 'Mining Drill', desc: 'Excavates deep tunnels for rare ores and ancient artifacts.', maxLevel: 10, baseCost: 45 },
  { id: 'struct_invention_lab', name: 'Invention Lab', desc: 'Where mad engineers create their wildest clockwork dreams.', maxLevel: 10, baseCost: 70 },
  { id: 'struct_shield_generator', name: 'Shield Generator', desc: 'Projects a protective energy field against rust storms.', maxLevel: 10, baseCost: 65 },
  { id: 'struct_celestial_observatory', name: 'Celestial Observatory', desc: 'Observes the cosmic clockwork to predict kingdom cycles.', maxLevel: 10, baseCost: 80 },
];

// ─── 22 Engineering Abilities ─────────────────────────────────────────────────
const CK_ABILITY_DEFS = [
  { id: 'ability_overdrive', name: 'Overdrive', desc: 'Doubles all automaton output for 30 seconds.', cooldown: 120, energyCost: 20, type: 'buff' },
  { id: 'ability_rustshield', name: 'Rust Shield', desc: 'Grants immunity to rust corruption for 1 minute.', cooldown: 180, energyCost: 25, type: 'defense' },
  { id: 'ability_gearsurge', name: 'Gear Surge', desc: 'Increases gear rotation speed by 300% briefly.', cooldown: 90, energyCost: 15, type: 'buff' },
  { id: 'ability_steamblast', name: 'Steam Blast', desc: 'Deals heavy damage to rust-corrupted enemies.', cooldown: 60, energyCost: 10, type: 'attack' },
  { id: 'ability_temporal_freeze', name: 'Temporal Freeze', desc: 'Freezes all rust in a district for 20 seconds.', cooldown: 300, energyCost: 40, type: 'defense' },
  { id: 'ability_auto_assembly', name: 'Auto Assembly', desc: 'Instantly builds one automaton from available parts.', cooldown: 240, energyCost: 30, type: 'production' },
  { id: 'ability_pressure_wave', name: 'Pressure Wave', desc: 'Releases a shockwave that knocks back threats.', cooldown: 75, energyCost: 12, type: 'attack' },
  { id: 'ability_lubricate_all', name: 'Lubricate All', desc: 'Applies supreme lubricant to every machine in range.', cooldown: 200, energyCost: 20, type: 'buff' },
  { id: 'ability_reverse_gears', name: 'Reverse Gears', desc: 'Reverses the direction of all gears, confusing enemies.', cooldown: 150, energyCost: 18, type: 'debuff' },
  { id: 'ability_magnetize', name: 'Magnetize', desc: 'Attracts all loose parts within a large radius.', cooldown: 100, energyCost: 14, type: 'collection' },
  { id: 'ability_aether_burst', name: 'Aether Burst', desc: 'Channels raw aetheric energy into a devastating beam.', cooldown: 360, energyCost: 50, type: 'attack' },
  { id: 'ability_fortify', name: 'Fortify', desc: 'Doubles structure defense ratings for 45 seconds.', cooldown: 180, energyCost: 22, type: 'defense' },
  { id: 'ability_decompose_rust', name: 'Decompose Rust', desc: 'Converts rust particles into usable iron filings.', cooldown: 120, energyCost: 16, type: 'resource' },
  { id: 'ability_clockwork_rally', name: 'Clockwork Rally', desc: 'All automatons gain a morale boost, increasing power by 20%.', cooldown: 200, energyCost: 28, type: 'buff' },
  { id: 'ability_spring_trap', name: 'Spring Trap', desc: 'Deploys hidden spring-loaded traps that snare intruders.', cooldown: 90, energyCost: 10, type: 'defense' },
  { id: 'ability_weld', name: 'Emergency Weld', desc: 'Instantly repairs one structure to full health.', cooldown: 150, energyCost: 20, type: 'repair' },
  { id: 'ability_scout_drone', name: 'Scout Drone', desc: 'Launches a reconnaissance drone to map a district.', cooldown: 120, energyCost: 12, type: 'scout' },
  { id: 'ability_entropic_bolt', name: 'Entropic Bolt', desc: 'Fires a bolt of concentrated entropy that accelerates decay in targets.', cooldown: 180, energyCost: 30, type: 'attack' },
  { id: 'ability_resonance_sync', name: 'Resonance Sync', desc: 'Synchronizes all automatons to operate in perfect harmony.', cooldown: 240, energyCost: 35, type: 'buff' },
  { id: 'ability_void_vent', name: 'Void Vent', desc: 'Opens a vent to the void, sucking in rust and debris.', cooldown: 300, energyCost: 45, type: 'attack' },
  { id: 'ability_godmaker_blessing', name: 'Godmaker Blessing', desc: 'Temporarily imbues one automaton with legendary-tier power.', cooldown: 600, energyCost: 80, type: 'ultimate' },
  { id: 'ability_cosmic_winding', name: 'Cosmic Winding', desc: 'Winds the cosmic mainspring, restoring all energy and pressure.', cooldown: 900, energyCost: 100, type: 'ultimate' },
];

// ─── 18 Achievements ──────────────────────────────────────────────────────────
const CK_ACHIEVEMENT_DEFS = [
  { id: 'ach_first_gear', name: 'First Gear Turns', desc: 'Build your first automaton.', condition: (s: CKState) => s.automatons.length >= 1 },
  { id: 'ach_steam_rising', name: 'Steam Rising', desc: 'Reach 50 gear energy.', condition: (s: CKState) => s.gearEnergy >= 50 },
  { id: 'ach_spring_collector', name: 'Spring Collector', desc: 'Collect 10 different mechanical parts.', condition: (s: CKState) => s.parts.filter(p => p.count > 0).length >= 10 },
  { id: 'ach_district_explorer', name: 'District Explorer', desc: 'Visit 3 different districts.', condition: (s: CKState) => s.districtsVisited >= 3 },
  { id: 'ach_structure_builder', name: 'Structure Builder', desc: 'Build 5 workshop structures.', condition: (s: CKState) => s.structures.filter(st => st.level > 0).length >= 5 },
  { id: 'ach_rust_fighter', name: 'Rust Fighter', desc: 'Purge rust 10 times.', condition: (s: CKState) => s.totalRustPurged >= 10 },
  { id: 'ach_inventor_novice', name: 'Inventor Novice', desc: 'Build 10 automatons total.', condition: (s: CKState) => s.inventionsBuilt >= 10 },
  { id: 'ach_pressure_master', name: 'Pressure Master', desc: 'Reach 200 steam pressure.', condition: (s: CKState) => s.steamPressure >= 200 },
  { id: 'ach_rare_creation', name: 'Rare Creation', desc: 'Build a Rare or higher tier automaton.', condition: (s: CKState) => s.automatons.some(a => a.rarity >= CK_RARITY_RARE) },
  { id: 'ach_full_maintenance', name: 'Full Maintenance', desc: 'Complete 5 daily maintenance tasks.', condition: (s: CKState) => s.dailyTasksCompleted >= 5 },
  { id: 'ach_epic_workshop', name: 'Epic Workshop', desc: 'Upgrade any structure to level 7.', condition: (s: CKState) => s.structures.some(st => st.level >= 7) },
  { id: 'ach_ability_master', name: 'Ability Master', desc: 'Activate 50 abilities total.', condition: (s: CKState) => s.totalAbilitiesUsed >= 50 },
  { id: 'ach_kingdom_power_500', name: 'Rising Power', desc: 'Reach 500 kingdom power.', condition: (s: CKState) => s.kingdomPower >= 500 },
  { id: 'ach_all_districts', name: 'Cartographer', desc: 'Unlock all 8 districts.', condition: (s: CKState) => s.districtsUnlocked >= 8 },
  { id: 'ach_legendary_built', name: 'Legendary Built', desc: 'Build a Legendary automaton.', condition: (s: CKState) => s.automatons.some(a => a.rarity === CK_RARITY_LEGENDARY) },
  { id: 'ach_max_structure', name: 'Maxed Out', desc: 'Upgrade any structure to level 10.', condition: (s: CKState) => s.structures.some(st => st.level >= 10) },
  { id: 'ach_efficient_kingdom', name: 'Efficient Kingdom', desc: 'Reach 95% machine efficiency.', condition: (s: CKState) => s.machineEfficiency >= 95 },
  { id: 'ach_clockwork_god', name: 'Clockwork God', desc: 'Earn the Clockwork God title.', condition: (s: CKState) => s.titleIndex >= 7 },
];

// ─── 8 Titles ─────────────────────────────────────────────────────────────────
const CK_TITLE_DEFS = [
  { name: 'Gear Apprentice', requirement: 0, desc: 'A beginner who has just begun turning gears.' },
  { name: 'Spring Mechanic', requirement: 100, desc: 'Can wind and repair basic springs.' },
  { name: 'Steam Engineer', requirement: 300, desc: 'Masters the art of steam power.' },
  { name: 'Brass Artificer', requirement: 600, desc: 'Crafts fine brass automatons with skill.' },
  { name: 'Iron Warden', requirement: 1000, desc: 'Defends the kingdom against rust corruption.' },
  { name: 'Aether Scholar', requirement: 1800, desc: 'Understands the mysteries of aetheric energy.' },
  { name: 'Clockwork Sovereign', requirement: 3000, desc: 'Rules over the mechanical kingdom with precision.' },
  { name: 'Clockwork God', requirement: 5000, desc: 'The supreme being of all clockwork creation.' },
];

// ─── Internal Types ───────────────────────────────────────────────────────────
interface CKAutomaton {
  instanceId: string;
  defId: string;
  name: string;
  rarity: number;
  type: string;
  power: number;
  level: number;
  health: number;
  maxHealth: number;
  builtAt: number;
}

interface CKStructure {
  defId: string;
  level: number;
  health: number;
  maxHealth: number;
}

interface CKPart {
  defId: string;
  count: number;
}

interface CKAbility {
  defId: string;
  lastUsed: number;
  timesUsed: number;
  unlocked: boolean;
}

interface CKAchievement {
  defId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface CKMaintenanceTask {
  id: string;
  description: string;
  completed: boolean;
  reward: number;
  type: 'repair' | 'collect' | 'build' | 'inspect' | 'purge';
}

interface CKDistrict {
  defId: string;
  unlocked: boolean;
  rustLevel: number;
  efficiency: number;
}

interface CKEventLog {
  id: string;
  timestamp: number;
  type: 'build' | 'upgrade' | 'ability' | 'repair' | 'purge' | 'forge' | 'district' | 'achievement' | 'rust_event' | 'title' | 'daily' | 'overclock' | 'disassemble' | 'feed';
  message: string;
  district?: string;
  metadata?: Record<string, number | string | boolean>;
}

interface CKState {
  automatons: CKAutomaton[];
  districts: CKDistrict[];
  parts: CKPart[];
  structures: CKStructure[];
  abilities: CKAbility[];
  achievements: CKAchievement[];
  currentDistrict: string;
  gearEnergy: number;
  steamPressure: number;
  inventionsBuilt: number;
  rustLevel: number;
  titleIndex: number;
  kingdomPower: number;
  machineEfficiency: number;
  dailyMaintenanceTask: CKMaintenanceTask | null;
  // Tracking counters
  districtsVisited: number;
  totalRustPurged: number;
  totalAbilitiesUsed: number;
  dailyTasksCompleted: number;
  totalPartsForged: number;
  totalRepairs: number;
  totalSpringsWound: number;
  // Cooldowns
  activeBuffs: { abilityId: string; expiresAt: number }[];
  lastDailyReset: number;
  // Event log
  eventLog: CKEventLog[];
  // Advanced metrics
  defenseRating: number;
  productionRate: number;
  researchProgress: number;
  districtsUnlocked: number;
  totalDisassembled: number;
  totalFed: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
let instanceCounter = 0;
function generateInstanceId(prefix: string): string {
  instanceCounter++;
  return `${prefix}_${Date.now()}_${instanceCounter}`;
}

function formatCooldown(seconds: number): string {
  if (seconds <= 0) return 'Ready';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function getRarityLabel(rarity: number): string {
  return CK_RARITY_NAMES[rarity] ?? 'Unknown';
}

function getRarityColor(rarity: number): string {
  return CK_RARITY_COLORS[rarity] ?? CK_SILVER_BOLT;
}

function getTypeInfo(type: string) {
  return CK_TYPE_INFO[type] ?? { label: 'Unknown', icon: '❓', color: CK_STEEL, desc: 'No type information available.' };
}

function calculateSynergyBonus(state: CKState): Record<string, number> {
  const bonuses: Record<string, number> = {};
  for (const pair of CK_SYNERGY_PAIRS) {
    const a = state.structures.find(s => s.defId === pair.a);
    const b = state.structures.find(s => s.defId === pair.b);
    if (a && b && a.level > 0 && b.level > 0) {
      bonuses[pair.bonus] = (bonuses[pair.bonus] ?? 0) + pair.value * Math.min(a.level, b.level);
    }
  }
  return bonuses;
}

function rollRustEvent(): typeof CK_RUST_EVENTS[0] | null {
  const roll = Math.random() * 100;
  if (roll > 15) return null; // 15% chance of rust event
  const severityRoll = Math.random() * 100;
  if (severityRoll < 40) return CK_RUST_EVENTS[0]; // 40% of events are light
  if (severityRoll < 70) return CK_RUST_EVENTS[Math.floor(Math.random() * 3) + 1]; // 30% moderate
  if (severityRoll < 90) return CK_RUST_EVENTS[Math.floor(Math.random() * 2) + 4]; // 20% severe
  return CK_RUST_EVENTS[Math.floor(Math.random() * 2) + 6]; // 10% catastrophic
}

function computeDefenseRating(state: CKState): number {
  let defense = 10;
  const turretLevel = state.structures.find(s => s.defId === 'struct_turret_battery')?.level || 0;
  const shieldLevel = state.structures.find(s => s.defId === 'struct_shield_generator')?.level || 0;
  const trainLevel = state.structures.find(s => s.defId === 'struct_training_ground')?.level || 0;
  defense += turretLevel * 8;
  defense += shieldLevel * 12;
  defense += trainLevel * 5;
  // Automaton defenders contribute
  for (const auto of state.automatons) {
    if (auto.type === CK_TYPE_DEFENDER) {
      defense += Math.floor(auto.power * 0.1 * (auto.health / auto.maxHealth));
    }
  }
  // Synergy bonus
  const synergies = calculateSynergyBonus(state);
 defense *= (1 + (synergies['defense_rating'] ?? 0));
  return Math.floor(defense);
}

function computeProductionRate(state: CKState): number {
  let production = 1;
  const millLevel = state.structures.find(s => s.defId === 'struct_gear_mill')?.level || 0;
  const assemblyLevel = state.structures.find(s => s.defId === 'struct_assembly_line')?.level || 0;
  const forgeLevel = state.structures.find(s => s.defId === 'struct_bolt_forge')?.level || 0;
  production += millLevel * 0.8;
  production += assemblyLevel * 1.2;
  production += forgeLevel * 0.5;
  // Craftsman automatons contribute
  for (const auto of state.automatons) {
    if (auto.type === CK_TYPE_CRAFTSMAN) {
      production += Math.floor(auto.power * 0.05);
    }
  }
  // Efficiency modifier
  production *= (state.machineEfficiency / 100);
  return Math.floor(production * 10) / 10;
}

function computeResearchProgress(state: CKState): number {
  const researchLevel = state.structures.find(s => s.defId === 'struct_research_bench')?.level || 0;
  const labLevel = state.structures.find(s => s.defId === 'struct_invention_lab')?.level || 0;
  let progress = researchLevel * 10 + labLevel * 15;
  for (const auto of state.automatons) {
    if (auto.type === CK_TYPE_INVENTOR) {
      progress += Math.floor(auto.power * 0.08);
    }
  }
  // Synergy bonus
  const synergies = calculateSynergyBonus(state);
  progress *= (1 + (synergies['research_speed'] ?? 0));
  return Math.floor(progress);
}

function createInitialParts(): CKPart[] {
  return CK_PART_DEFS.map(p => ({ defId: p.id, count: 0 }));
}

function createInitialStructures(): CKStructure[] {
  return CK_STRUCTURE_DEFS.map(s => ({
    defId: s.id,
    level: 0,
    health: 0,
    maxHealth: 100,
  }));
}

function createInitialAbilities(): CKAbility[] {
  return CK_ABILITY_DEFS.slice(0, 8).map(a => ({
    defId: a.id,
    lastUsed: 0,
    timesUsed: 0,
    unlocked: true,
  })).concat(
    CK_ABILITY_DEFS.slice(8).map(a => ({
      defId: a.id,
      lastUsed: 0,
      timesUsed: 0,
      unlocked: false,
    }))
  );
}

function createInitialAchievements(): CKAchievement[] {
  return CK_ACHIEVEMENT_DEFS.map(a => ({
    defId: a.id,
    unlocked: false,
    unlockedAt: 0,
  }));
}

function createInitialDistricts(): CKDistrict[] {
  return CK_DISTRICT_DEFS.map((d, i) => ({
    defId: d.id,
    unlocked: i === 0,
    rustLevel: i === 0 ? 0 : 100,
    efficiency: i === 0 ? 100 : 0,
  }));
}

function generateMaintenanceTask(): CKMaintenanceTask {
  const taskTemplates: Array<{ description: string; type: CKMaintenanceTask['type']; reward: number }> = [
    { description: 'Inspect the main gear assembly for wear.', type: 'inspect', reward: 15 },
    { description: 'Collect 3 loose brass gears from the corridors.', type: 'collect', reward: 20 },
    { description: 'Repair a damaged steam valve in the foundry.', type: 'repair', reward: 25 },
    { description: 'Purge rust from the eastern wall mechanisms.', type: 'purge', reward: 30 },
    { description: 'Build a replacement cog for the clocktower.', type: 'build', reward: 35 },
    { description: 'Lubricate the main steam engine bearings.', type: 'repair', reward: 18 },
    { description: 'Clear debris from the vapor canal intake.', type: 'collect', reward: 22 },
    { description: 'Reinforce the iron vault entrance gears.', type: 'build', reward: 28 },
    { description: 'Inspect pressure gauges across all districts.', type: 'inspect', reward: 20 },
    { description: 'Eliminate rust deposits in the cog crypt.', type: 'purge', reward: 40 },
    { description: 'Recalibrate the celestial observatory lens.', type: 'inspect', reward: 32 },
    { description: 'Replace worn springs in the training ground.', type: 'repair', reward: 26 },
  ];
  const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
  return {
    id: generateInstanceId('task'),
    description: template.description,
    completed: false,
    reward: template.reward,
    type: template.type,
  };
}

function computeUpgradeCost(baseCost: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

function computeBuildCost(automatonDefId: string, state: CKState): number {
  const def = CK_AUTOMATON_DEFS.find(a => a.id === automatonDefId);
  if (!def) return 999999;
  const rarityMultiplier = [1, 2, 5, 12, 30][def.rarity] || 1;
  return Math.floor(def.power * rarityMultiplier * 0.5);
}

function computeKingdomPower(state: CKState): number {
  let power = 0;
  // Automaton power
  for (const auto of state.automatons) {
    power += auto.power * (1 + auto.level * 0.15);
  }
  // Structure bonus
  for (const struct of state.structures) {
    power += struct.level * 5;
  }
  // District efficiency bonus
  for (const dist of state.districts) {
    if (dist.unlocked) {
      power += Math.floor(dist.efficiency * 0.5);
    }
  }
  // Part collection bonus
  const partsCollected = state.parts.filter(p => p.count > 0).length;
  power += partsCollected * 3;
  // Achievement bonus
  const achievementsUnlocked = state.achievements.filter(a => a.unlocked).length;
  power += achievementsUnlocked * 10;
  // Efficiency multiplier
  power = Math.floor(power * (state.machineEfficiency / 100));
  return power;
}

function computeMachineEfficiency(state: CKState): number {
  let eff = 100;
  // Rust penalty
  eff -= Math.floor(state.rustLevel * 0.3);
  // Structure health bonus
  const structuresBuilt = state.structures.filter(s => s.level > 0);
  for (const struct of structuresBuilt) {
    const def = CK_STRUCTURE_DEFS.find(d => d.id === struct.defId);
    if (def && def.name === 'Repair Bay') {
      eff += struct.level * 0.5;
    }
    if (def && def.name === 'Safety Valve Station') {
      eff += struct.level * 0.3;
    }
  }
  // Automaton health factor
  if (state.automatons.length > 0) {
    const avgHealth = state.automatons.reduce((sum, a) => sum + a.health / a.maxHealth, 0) / state.automatons.length;
    eff *= (0.5 + avgHealth * 0.5);
  }
  // Active buff bonus
  for (const buff of state.activeBuffs) {
    if (buff.abilityId === 'ability_lubricate_all') {
      eff += 10;
    }
  }
  return Math.max(0, Math.min(100, Math.floor(eff)));
}

function computeRustLevel(state: CKState): number {
  let baseRust = 0;
  for (const dist of state.districts) {
    if (dist.unlocked) {
      baseRust += dist.rustLevel * 0.3;
    }
  }
  // Automaton average health inversely affects rust
  if (state.automatons.length > 0) {
    const avgHealth = state.automatons.reduce((sum, a) => sum + a.health / a.maxHealth, 0) / state.automatons.length;
    baseRust *= (1.1 - avgHealth * 0.2);
  }
  // Shield generator reduces rust
  const shieldLevel = state.structures.find(s => s.defId === 'struct_shield_generator')?.level || 0;
  baseRust *= Math.max(0.2, 1 - shieldLevel * 0.05);
  return Math.max(0, Math.min(100, Math.floor(baseRust)));
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
export default function useClockworkKingdom() {
  const stateRef = useRef<CKState | null>(null);

  const [state, setState] = useState<CKState>(() => ({
    automatons: [],
    districts: createInitialDistricts(),
    parts: createInitialParts(),
    structures: createInitialStructures(),
    abilities: createInitialAbilities(),
    achievements: createInitialAchievements(),
    currentDistrict: 'district_gearheart',
    gearEnergy: 50,
    steamPressure: 30,
    inventionsBuilt: 0,
    rustLevel: 0,
    titleIndex: 0,
    kingdomPower: 0,
    machineEfficiency: 100,
    dailyMaintenanceTask: generateMaintenanceTask(),
    districtsVisited: 1,
    totalRustPurged: 0,
    totalAbilitiesUsed: 0,
    dailyTasksCompleted: 0,
    totalPartsForged: 0,
    totalRepairs: 0,
    totalSpringsWound: 0,
    activeBuffs: [],
    lastDailyReset: Date.now(),
    eventLog: [],
    defenseRating: 10,
    productionRate: 1,
    researchProgress: 0,
    districtsUnlocked: 1,
    totalDisassembled: 0,
    totalFed: 0,
  }));

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Daily reset logic
  useEffect(() => {
    const checkDailyReset = () => {
      setState(prev => {
        const now = Date.now();
        const lastReset = prev.lastDailyReset;
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - lastReset >= oneDay) {
          return {
            ...prev,
            dailyMaintenanceTask: generateMaintenanceTask(),
            dailyTasksCompleted: 0,
            lastDailyReset: now,
            gearEnergy: Math.min(prev.gearEnergy + 25, 200),
            steamPressure: Math.min(prev.steamPressure + 15, 150),
          };
        }
        return prev;
      });
    };
    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(interval);
  }, []);

  // Natural rust accumulation and rust events
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const newRust = computeRustLevel(prev);
        const newEff = computeMachineEfficiency(prev);
        const newPower = computeKingdomPower(prev);
        const newDefense = computeDefenseRating(prev);
        const newProduction = computeProductionRate(prev);
        const newResearch = computeResearchProgress(prev);
        // Slight natural rust growth
        const updatedDistricts = prev.districts.map(d => {
          if (!d.unlocked) return d;
          const rustGrowth = 0.05 * (1 - d.efficiency / 100);
          return {
            ...d,
            rustLevel: Math.min(100, d.rustLevel + rustGrowth),
          };
        });
        // Roll for random rust events
        const rustEvent = rollRustEvent();
        let finalDistricts = updatedDistricts;
        let eventLog = [...prev.eventLog];
        let gearEnergy = prev.gearEnergy;
        if (rustEvent) {
          const targetDist = finalDistricts.find(d => d.unlocked && d.rustLevel < 90);
          if (targetDist) {
            const actualDamage = Math.max(1, rustEvent.damage - Math.floor(newDefense * 0.1));
            finalDistricts = finalDistricts.map(d =>
              d.defId === targetDist.defId
                ? { ...d, rustLevel: Math.min(100, d.rustLevel + actualDamage) }
                : d
            );
            // Slight energy drain from damage
            gearEnergy = Math.max(0, gearEnergy - Math.floor(actualDamage * 0.2));
            eventLog.unshift({
              id: generateInstanceId('event'),
              timestamp: Date.now(),
              type: 'rust_event',
              message: `${rustEvent.name}: ${rustEvent.desc} (${actualDamage} damage)`,
              district: targetDist.defId,
              metadata: { severity: rustEvent.severity, damage: actualDamage },
            });
          }
        }
        // Keep event log to max 100 entries
        if (eventLog.length > 100) eventLog = eventLog.slice(0, 100);
        return {
          ...prev,
          rustLevel: newRust,
          machineEfficiency: newEff,
          kingdomPower: newPower,
          districts: finalDistricts,
          eventLog,
          gearEnergy,
          defenseRating: newDefense,
          productionRate: newProduction,
          researchProgress: newResearch,
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Buff expiration
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const activeBuffs = prev.activeBuffs.filter(b => b.expiresAt > now);
        if (activeBuffs.length === prev.activeBuffs.length) return prev;
        return { ...prev, activeBuffs };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Title computation
  const computedTitleIndex = useMemo(() => {
    for (let i = CK_TITLE_DEFS.length - 1; i >= 0; i--) {
      if (state.kingdomPower >= CK_TITLE_DEFS[i].requirement) {
        return i;
      }
    }
    return 0;
  }, [state.kingdomPower]);

  // ─── Recompute derived values ───────────────────────────────────────────────
  const derivedState = useMemo(() => {
    const rustLevel = computeRustLevel(state);
    const machineEfficiency = computeMachineEfficiency(state);
    const kingdomPower = computeKingdomPower(state);
    const titleIndex = computedTitleIndex;
    return { rustLevel, machineEfficiency, kingdomPower, titleIndex };
  }, [state, computedTitleIndex]);

  // Update derived values when they change
  useEffect(() => {
    setState(prev => {
      const r = computeRustLevel(prev);
      const e = computeMachineEfficiency(prev);
      const p = computeKingdomPower(prev);
      if (r === prev.rustLevel && e === prev.machineEfficiency && p === prev.kingdomPower) {
        return prev;
      }
      return {
        ...prev,
        rustLevel: r,
        machineEfficiency: e,
        kingdomPower: p,
        titleIndex: computedTitleIndex,
      };
    });
  }, [derivedState.rustLevel, derivedState.machineEfficiency, derivedState.kingdomPower, computedTitleIndex]);

  // ─── Build Automaton ────────────────────────────────────────────────────────
  const buildAutomaton = useCallback((automatonDefId: string) => {
    setState(prev => {
      const def = CK_AUTOMATON_DEFS.find(a => a.id === automatonDefId);
      if (!def) return prev;
      const cost = computeBuildCost(automatonDefId, prev);
      if (prev.gearEnergy < cost) return prev;
      const newAutomaton: CKAutomaton = {
        instanceId: generateInstanceId('auto'),
        defId: def.id,
        name: def.name,
        rarity: def.rarity,
        type: def.type,
        power: def.power,
        level: 1,
        health: 100,
        maxHealth: 100,
        builtAt: Date.now(),
      };
      const newStructures = prev.structures.map(s => {
        const sDef = CK_STRUCTURE_DEFS.find(d => d.id === s.defId);
        if (sDef?.name === 'Assembly Line' && s.level > 0) {
          return { ...s, health: Math.max(0, s.health - 2) };
        }
        return s;
      });
      const eventLog: CKEventLog[] = [
        {
          id: generateInstanceId('event'),
          timestamp: Date.now(),
          type: 'build' as const,
          message: `Built ${def.name} (Power: ${def.power}, Rarity: ${CK_RARITY_NAMES[def.rarity]})`,
          district: prev.currentDistrict,
          metadata: { automatonId: newAutomaton.instanceId, rarity: def.rarity, cost },
        },
        ...prev.eventLog,
      ].slice(0, 100);
      return {
        ...prev,
        automatons: [...prev.automatons, newAutomaton],
        gearEnergy: prev.gearEnergy - cost,
        inventionsBuilt: prev.inventionsBuilt + 1,
        structures: newStructures,
        eventLog,
      };
    });
  }, []);

  // ─── Upgrade Structure ─────────────────────────────────────────────────────
  const upgradeStructure = useCallback((structureDefId: string) => {
    setState(prev => {
      const def = CK_STRUCTURE_DEFS.find(s => s.id === structureDefId);
      if (!def) return prev;
      const structIndex = prev.structures.findIndex(s => s.defId === structureDefId);
      if (structIndex === -1) return prev;
      const current = prev.structures[structIndex];
      if (current.level >= def.maxLevel) return prev;
      const cost = computeUpgradeCost(def.baseCost, current.level);
      if (prev.gearEnergy < cost) return prev;
      const newLevel = current.level + 1;
      const newMaxHealth = 100 + newLevel * 20;
      const newHealth = Math.min(newMaxHealth, current.health + 50);
      const newStructures = [...prev.structures];
      newStructures[structIndex] = { ...current, level: newLevel, health: newHealth, maxHealth: newMaxHealth };
      // Unlock abilities at certain structure levels
      const researchLevel = newStructures.find(s => s.defId === 'struct_research_bench')?.level || 0;
      const newAbilities = [...prev.abilities];
      if (researchLevel >= 3) {
        const abilityToUnlock = CK_ABILITY_DEFS.find(a => !newAbilities.find(ab => ab.defId === a.id && ab.unlocked));
        if (abilityToUnlock) {
          const abIndex = newAbilities.findIndex(ab => ab.defId === abilityToUnlock.id);
          if (abIndex !== -1) {
            newAbilities[abIndex] = { ...newAbilities[abIndex], unlocked: true };
          }
        }
      }
      return {
        ...prev,
        structures: newStructures,
        gearEnergy: prev.gearEnergy - cost,
        abilities: newAbilities,
      };
    });
  }, []);

  // ─── Activate Ability ──────────────────────────────────────────────────────
  const activateAbility = useCallback((abilityDefId: string) => {
    setState(prev => {
      const def = CK_ABILITY_DEFS.find(a => a.id === abilityDefId);
      if (!def) return prev;
      const abilityIndex = prev.abilities.findIndex(a => a.defId === abilityDefId);
      if (abilityIndex === -1) return prev;
      const ability = prev.abilities[abilityIndex];
      if (!ability.unlocked) return prev;
      if (prev.gearEnergy < def.energyCost) return prev;
      const now = Date.now();
      if (now - ability.lastUsed < def.cooldown * 1000) return prev;
      const newAbilities = [...prev.abilities];
      newAbilities[abilityIndex] = {
        ...ability,
        lastUsed: now,
        timesUsed: ability.timesUsed + 1,
      };
      let updatedDistricts = prev.districts;
      let updatedAutomatons = prev.automatons;
      let updatedRustLevel = prev.rustLevel;
      let activeBuffs = [...prev.activeBuffs];
      // Apply ability effects
      switch (abilityDefId) {
        case 'ability_steamblast':
        case 'ability_aether_burst':
        case 'ability_void_vent':
        case 'ability_entropic_bolt': {
          // Attack abilities reduce rust in current district
          updatedDistricts = prev.districts.map(d =>
            d.defId === prev.currentDistrict
              ? { ...d, rustLevel: Math.max(0, d.rustLevel - 15) }
              : d
          );
          break;
        }
        case 'ability_temporal_freeze': {
          activeBuffs.push({ abilityId: 'ability_temporal_freeze', expiresAt: now + 20000 });
          break;
        }
        case 'ability_overdrive':
        case 'ability_gearsurge':
        case 'ability_lubricate_all':
        case 'ability_clockwork_rally':
        case 'ability_resonance_sync': {
          activeBuffs.push({ abilityId: abilityDefId, expiresAt: now + 30000 });
          break;
        }
        case 'ability_rustshield': {
          activeBuffs.push({ abilityId: 'ability_rustshield', expiresAt: now + 60000 });
          break;
        }
        case 'ability_fortify': {
          activeBuffs.push({ abilityId: 'ability_fortify', expiresAt: now + 45000 });
          break;
        }
        case 'ability_emergency_weld': {
          const lowestStruct = [...prev.structures]
            .filter(s => s.level > 0 && s.health < s.maxHealth)
            .sort((a, b) => a.health / a.maxHealth - b.health / b.maxHealth)[0];
          if (lowestStruct) {
            const si = prev.structures.findIndex(s => s.defId === lowestStruct.defId);
            const newStructures = [...prev.structures];
            newStructures[si] = { ...lowestStruct, health: lowestStruct.maxHealth };
            return {
              ...prev,
              abilities: newAbilities,
              gearEnergy: prev.gearEnergy - def.energyCost,
              totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
              structures: newStructures,
            };
          }
          break;
        }
        case 'ability_decompose_rust': {
          updatedDistricts = prev.districts.map(d => {
            if (!d.unlocked) return d;
            return { ...d, rustLevel: Math.max(0, d.rustLevel - 8) };
          });
          // Add some parts as reward
          const partIndex = prev.parts.findIndex(p => p.defId === 'part_steel_bolt');
          if (partIndex !== -1) {
            const newParts = [...prev.parts];
            newParts[partIndex] = { ...newParts[partIndex], count: newParts[partIndex].count + 5 };
            return {
              ...prev,
              abilities: newAbilities,
              gearEnergy: prev.gearEnergy - def.energyCost,
              totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
              parts: newParts,
            };
          }
          break;
        }
        case 'ability_magnetize': {
          const newParts = [...prev.parts];
          // Give random common parts
          const commonPartIndices = prev.parts.reduce<number[]>((acc, p, i) => {
            const partDef = CK_PART_DEFS.find(d => d.id === p.defId);
            if (partDef && partDef.rarity <= CK_RARITY_UNCOMMON) acc.push(i);
            return acc;
          }, []);
          if (commonPartIndices.length > 0) {
            for (let i = 0; i < 3; i++) {
              const ri = commonPartIndices[Math.floor(Math.random() * commonPartIndices.length)];
              newParts[ri] = { ...newParts[ri], count: newParts[ri].count + 1 };
            }
          }
          return {
            ...prev,
            abilities: newAbilities,
            gearEnergy: prev.gearEnergy - def.energyCost,
            totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
            parts: newParts,
          };
        }
        case 'ability_godmaker_blessing': {
          // Buff strongest automaton
          if (prev.automatons.length > 0) {
            const strongestIdx = prev.automatons.reduce((bestIdx, a, idx) =>
              a.power > prev.automatons[bestIdx].power ? idx : bestIdx, 0);
            updatedAutomatons = [...prev.automatons];
            updatedAutomatons[strongestIdx] = {
              ...updatedAutomatons[strongestIdx],
              power: updatedAutomatons[strongestIdx].power * 2,
            };
          }
          break;
        }
        case 'ability_cosmic_winding': {
          return {
            ...prev,
            abilities: newAbilities,
            gearEnergy: 200,
            steamPressure: 150,
            totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
          };
        }
        default:
          break;
      }
      return {
        ...prev,
        abilities: newAbilities,
        gearEnergy: prev.gearEnergy - def.energyCost,
        totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
        districts: updatedDistricts,
        automatons: updatedAutomatons,
        activeBuffs,
      };
    });
  }, []);

  // ─── Repair Gear ───────────────────────────────────────────────────────────
  const repairGear = useCallback((automatonInstanceId: string) => {
    setState(prev => {
      const autoIndex = prev.automatons.findIndex(a => a.instanceId === automatonInstanceId);
      if (autoIndex === -1) return prev;
      const automaton = prev.automatons[autoIndex];
      if (automaton.health >= automaton.maxHealth) return prev;
      if (prev.steamPressure < 10) return prev;
      const repairAmount = 30;
      const newAutomatons = [...prev.automatons];
      newAutomatons[autoIndex] = {
        ...automaton,
        health: Math.min(automaton.maxHealth, automaton.health + repairAmount),
      };
      return {
        ...prev,
        automatons: newAutomatons,
        steamPressure: prev.steamPressure - 10,
        totalRepairs: prev.totalRepairs + 1,
      };
    });
  }, []);

  // ─── Wind Spring ───────────────────────────────────────────────────────────
  const windSpring = useCallback(() => {
    setState(prev => {
      if (prev.gearEnergy >= 200) return prev;
      const windAmount = 20;
      // Winding costs time and generates a small amount of steam
      return {
        ...prev,
        gearEnergy: Math.min(200, prev.gearEnergy + windAmount),
        steamPressure: Math.min(150, prev.steamPressure + 5),
        totalSpringsWound: prev.totalSpringsWound + 1,
      };
    });
  }, []);

  // ─── Forge Part ────────────────────────────────────────────────────────────
  const forgePart = useCallback((partDefId: string) => {
    setState(prev => {
      const partDef = CK_PART_DEFS.find(p => p.id === partDefId);
      if (!partDef) return prev;
      const forgeCost = Math.ceil(partDef.value * 0.4);
      if (prev.steamPressure < forgeCost) return prev;
      const partIndex = prev.parts.findIndex(p => p.defId === partDefId);
      if (partIndex === -1) return prev;
      const newParts = [...prev.parts];
      newParts[partIndex] = { ...newParts[partIndex], count: newParts[partIndex].count + 1 };
      // Structure bonuses
      const alloyLevel = prev.structures.find(s => s.defId === 'struct_alloy_furnace')?.level || 0;
      let bonusCount = 0;
      if (alloyLevel >= 3 && Math.random() < alloyLevel * 0.05) {
        bonusCount = 1;
      }
      newParts[partIndex] = { ...newParts[partIndex], count: newParts[partIndex].count + bonusCount };
      return {
        ...prev,
        parts: newParts,
        steamPressure: prev.steamPressure - forgeCost,
        totalPartsForged: prev.totalPartsForged + 1 + bonusCount,
      };
    });
  }, []);

  // ─── Activate Machine ──────────────────────────────────────────────────────
  const activateMachine = useCallback((machineDefId: string) => {
    setState(prev => {
      const structureDef = CK_STRUCTURE_DEFS.find(s => s.id === machineDefId);
      if (!structureDef) return prev;
      const structIndex = prev.structures.findIndex(s => s.defId === machineDefId);
      if (structIndex === -1 || prev.structures[structIndex].level === 0) return prev;
      if (prev.steamPressure < 20) return prev;
      const struct = prev.structures[structIndex];
      // Activating a machine consumes steam and produces gear energy
      const energyGain = 5 + struct.level * 3;
      const newStructures = [...prev.structures];
      newStructures[structIndex] = { ...struct, health: Math.max(0, struct.health - 3) };
      return {
        ...prev,
        structures: newStructures,
        gearEnergy: Math.min(200, prev.gearEnergy + energyGain),
        steamPressure: prev.steamPressure - 20,
      };
    });
  }, []);

  // ─── Purge Rust ────────────────────────────────────────────────────────────
  const purgeRust = useCallback((districtDefId?: string) => {
    setState(prev => {
      const targetDistrict = districtDefId || prev.currentDistrict;
      const distIndex = prev.districts.findIndex(d => d.defId === targetDistrict);
      if (distIndex === -1) return prev;
      const dist = prev.districts[distIndex];
      if (dist.rustLevel <= 0) return prev;
      if (prev.steamPressure < 15) return prev;
      const purgeAmount = 20;
      const newDistricts = [...prev.districts];
      newDistricts[distIndex] = {
        ...dist,
        rustLevel: Math.max(0, dist.rustLevel - purgeAmount),
        efficiency: Math.min(100, dist.efficiency + 5),
      };
      // Repair Bay bonus
      const repairBayLevel = prev.structures.find(s => s.defId === 'struct_repair_bay')?.level || 0;
      const extraPurge = repairBayLevel * 2;
      newDistricts[distIndex] = {
        ...newDistricts[distIndex],
        rustLevel: Math.max(0, newDistricts[distIndex].rustLevel - extraPurge),
      };
      return {
        ...prev,
        districts: newDistricts,
        steamPressure: prev.steamPressure - 15,
        totalRustPurged: prev.totalRustPurged + 1,
      };
    });
  }, []);

  // ─── Overclock Engine ──────────────────────────────────────────────────────
  const overclockEngine = useCallback(() => {
    setState(prev => {
      if (prev.steamPressure < 50 || prev.gearEnergy < 30) return prev;
      // Overclocking temporarily boosts everything but damages structures
      const newAutomatons = prev.automatons.map(a => ({
        ...a,
        power: Math.floor(a.power * 1.25),
        health: Math.max(1, a.health - 10),
      }));
      const newStructures = prev.structures.map(s => {
        if (s.level > 0) {
          return { ...s, health: Math.max(1, s.health - 15) };
        }
        return s;
      });
      const activeBuffs = [...prev.activeBuffs, { abilityId: 'overclock', expiresAt: Date.now() + 15000 } as { abilityId: string; expiresAt: number }];
      return {
        ...prev,
        automatons: newAutomatons,
        structures: newStructures,
        steamPressure: prev.steamPressure - 50,
        gearEnergy: prev.gearEnergy - 30,
        activeBuffs,
      };
    });
  }, []);

  // ─── Check Achievements ────────────────────────────────────────────────────
  const checkAchievements = useCallback(() => {
    setState(prev => {
      let changed = false;
      const newAchievements = prev.achievements.map(ach => {
        if (ach.unlocked) return ach;
        const def = CK_ACHIEVEMENT_DEFS.find(d => d.id === ach.defId);
        if (!def) return ach;
        if (def.condition(prev)) {
          changed = true;
          return { ...ach, unlocked: true, unlockedAt: Date.now() };
        }
        return ach;
      });
      if (!changed) return prev;
      // Grant rewards for newly unlocked achievements
      const newlyUnlocked = newAchievements.filter((a, i) => !prev.achievements[i].unlocked && a.unlocked);
      const bonusEnergy = newlyUnlocked.length * 25;
      return {
        ...prev,
        achievements: newAchievements,
        gearEnergy: Math.min(200, prev.gearEnergy + bonusEnergy),
      };
    });
  }, []);

  // ─── Get Title ─────────────────────────────────────────────────────────────
  const getTitle = useCallback((): string => {
    return CK_TITLE_DEFS[computedTitleIndex].name;
  }, [computedTitleIndex]);

  // ─── Get Progress ──────────────────────────────────────────────────────────
  const getProgress = useCallback(() => {
    const totalAutomatons = CK_AUTOMATON_DEFS.length;
    const builtAutomatons = new Set(state.automatons.map(a => a.defId)).size;
    const totalStructures = CK_STRUCTURE_DEFS.length;
    const builtStructures = state.structures.filter(s => s.level > 0).length;
    const totalParts = CK_PART_DEFS.length;
    const collectedParts = state.parts.filter(p => p.count > 0).length;
    const totalAchievements = CK_ACHIEVEMENT_DEFS.length;
    const unlockedAchievements = state.achievements.filter(a => a.unlocked).length;
    const totalAbilities = CK_ABILITY_DEFS.length;
    const unlockedAbilities = state.abilities.filter(a => a.unlocked).length;
    const totalDistricts = CK_DISTRICT_DEFS.length;
    const unlockedDistricts = state.districts.filter(d => d.unlocked).length;
    const nextTitle = computedTitleIndex < CK_TITLE_DEFS.length - 1
      ? CK_TITLE_DEFS[computedTitleIndex + 1]
      : null;
    const titleProgress = nextTitle
      ? (state.kingdomPower / nextTitle.requirement) * 100
      : 100;
    const maxStructureLevel = Math.max(...state.structures.map(s => s.level));
    const totalStructureLevels = state.structures.reduce((sum, s) => sum + s.level, 0);
    return {
      automatons: { built: builtAutomatons, total: totalAutomatons, percentage: (builtAutomatons / totalAutomatons) * 100 },
      structures: { built: builtStructures, total: totalStructures, percentage: (builtStructures / totalStructures) * 100, maxLevel: maxStructureLevel, totalLevels: totalStructureLevels },
      parts: { collected: collectedParts, total: totalParts, percentage: (collectedParts / totalParts) * 100 },
      achievements: { unlocked: unlockedAchievements, total: totalAchievements, percentage: (unlockedAchievements / totalAchievements) * 100 },
      abilities: { unlocked: unlockedAbilities, total: totalAbilities, percentage: (unlockedAbilities / totalAbilities) * 100 },
      districts: { unlocked: unlockedDistricts, total: totalDistricts, percentage: (unlockedDistricts / totalDistricts) * 100 },
      title: { current: CK_TITLE_DEFS[computedTitleIndex].name, next: nextTitle?.name ?? null, progress: Math.min(100, titleProgress) },
      inventionsBuilt: state.inventionsBuilt,
      totalRustPurged: state.totalRustPurged,
      totalPartsForged: state.totalPartsForged,
      totalRepairs: state.totalRepairs,
      totalSpringsWound: state.totalSpringsWound,
      totalAbilitiesUsed: state.totalAbilitiesUsed,
    };
  }, [state, computedTitleIndex]);

  // ─── Get Stats ─────────────────────────────────────────────────────────────
  const getStats = useCallback(() => {
    const totalAutoPower = state.automatons.reduce((sum, a) => sum + a.power, 0);
    const avgAutoHealth = state.automatons.length > 0
      ? state.automatons.reduce((sum, a) => sum + a.health, 0) / state.automatons.length
      : 0;
    const highestAutoPower = state.automatons.length > 0
      ? Math.max(...state.automatons.map(a => a.power))
      : 0;
    const rarityBreakdown = [0, 0, 0, 0, 0];
    for (const a of state.automatons) {
      rarityBreakdown[a.rarity]++;
    }
    const typeBreakdown: Record<string, number> = {};
    for (const a of state.automatons) {
      typeBreakdown[a.type] = (typeBreakdown[a.type] || 0) + 1;
    }
    const mostCommonType = Object.entries(typeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';
    const districtStats = state.districts.map(d => {
      const def = CK_DISTRICT_DEFS.find(dd => dd.id === d.defId);
      return {
        name: def?.name ?? d.defId,
        unlocked: d.unlocked,
        rustLevel: Math.floor(d.rustLevel),
        efficiency: Math.floor(d.efficiency),
      };
    });
    const activeBuffCount = state.activeBuffs.length;
    const activeBuffNames = state.activeBuffs.map(b => {
      const def = CK_ABILITY_DEFS.find(a => a.id === b.abilityId);
      return def?.name ?? b.abilityId;
    });
    const topStructures = state.structures
      .filter(s => s.level > 0)
      .sort((a, b) => b.level - a.level)
      .slice(0, 5)
      .map(s => {
        const def = CK_STRUCTURE_DEFS.find(d => d.id === s.defId);
        return {
          name: def?.name ?? s.defId,
          level: s.level,
          healthPercent: Math.floor((s.health / s.maxHealth) * 100),
        };
      });
    return {
      kingdomPower: state.kingdomPower,
      gearEnergy: state.gearEnergy,
      maxGearEnergy: 200,
      steamPressure: state.steamPressure,
      maxSteamPressure: 150,
      rustLevel: state.rustLevel,
      machineEfficiency: state.machineEfficiency,
      title: CK_TITLE_DEFS[computedTitleIndex].name,
      titleIndex: computedTitleIndex,
      automatons: {
        count: state.automatons.length,
        totalPower: totalAutoPower,
        avgHealth: Math.floor(avgAutoHealth),
        highestPower: highestAutoPower,
        rarityBreakdown: {
          common: rarityBreakdown[0],
          uncommon: rarityBreakdown[1],
          rare: rarityBreakdown[2],
          epic: rarityBreakdown[3],
          legendary: rarityBreakdown[4],
        },
        mostCommonType,
      },
      structures: {
        totalBuilt: state.structures.filter(s => s.level > 0).length,
        topStructures,
      },
      districts: districtStats,
      parts: {
        totalCollected: state.parts.reduce((sum, p) => sum + p.count, 0),
        uniqueTypes: state.parts.filter(p => p.count > 0).length,
      },
      abilities: {
        unlocked: state.abilities.filter(a => a.unlocked).length,
        total: CK_ABILITY_DEFS.length,
        totalUses: state.totalAbilitiesUsed,
      },
      achievements: {
        unlocked: state.achievements.filter(a => a.unlocked).length,
        total: CK_ACHIEVEMENT_DEFS.length,
      },
      activeBuffs: {
        count: activeBuffCount,
        names: activeBuffNames,
      },
      lifetime: {
        inventionsBuilt: state.inventionsBuilt,
        rustPurged: state.totalRustPurged,
        partsForged: state.totalPartsForged,
        repairs: state.totalRepairs,
        springsWound: state.totalSpringsWound,
        abilitiesUsed: state.totalAbilitiesUsed,
        districtsVisited: state.districtsVisited,
        dailyTasksCompleted: state.dailyTasksCompleted,
      },
    };
  }, [state, computedTitleIndex]);

  // ─── Additional Utility: Change District ───────────────────────────────────
  const changeDistrict = useCallback((districtDefId: string) => {
    setState(prev => {
      const distIndex = prev.districts.findIndex(d => d.defId === districtDefId);
      if (distIndex === -1) return prev;
      const dist = prev.districts[distIndex];
      const def = CK_DISTRICT_DEFS.find(d => d.id === districtDefId);
      if (!def) return prev;
      if (!dist.unlocked && prev.kingdomPower < def.unlockPower) return prev;
      const newDistricts = [...prev.districts];
      let districtsVisited = prev.districtsVisited;
      let districtsUnlocked = prev.districts.filter(d => d.unlocked).length;
      if (!dist.unlocked) {
        newDistricts[distIndex] = { ...dist, unlocked: true, rustLevel: 50, efficiency: 50 };
        districtsUnlocked += 1;
      }
      if (prev.currentDistrict !== districtDefId) {
        districtsVisited += 1;
      }
      const energyCost = def.energyCost;
      if (prev.gearEnergy < energyCost) return prev;
      return {
        ...prev,
        districts: newDistricts,
        currentDistrict: districtDefId,
        gearEnergy: prev.gearEnergy - energyCost,
        districtsVisited,
        districtsUnlocked,
      };
    });
  }, []);

  // ─── Additional Utility: Complete Daily Task ───────────────────────────────
  const completeDailyTask = useCallback(() => {
    setState(prev => {
      if (!prev.dailyMaintenanceTask || prev.dailyMaintenanceTask.completed) return prev;
      return {
        ...prev,
        dailyMaintenanceTask: { ...prev.dailyMaintenanceTask, completed: true },
        gearEnergy: Math.min(200, prev.gearEnergy + prev.dailyMaintenanceTask.reward),
        dailyTasksCompleted: prev.dailyTasksCompleted + 1,
      };
    });
  }, []);

  // ─── Additional Utility: Repair Structure ──────────────────────────────────
  const repairStructure = useCallback((structureDefId: string) => {
    setState(prev => {
      const structIndex = prev.structures.findIndex(s => s.defId === structureDefId);
      if (structIndex === -1) return prev;
      const struct = prev.structures[structIndex];
      if (struct.level === 0 || struct.health >= struct.maxHealth) return prev;
      if (prev.steamPressure < 8) return prev;
      const newStructures = [...prev.structures];
      newStructures[structIndex] = {
        ...struct,
        health: Math.min(struct.maxHealth, struct.health + 25),
      };
      return {
        ...prev,
        structures: newStructures,
        steamPressure: prev.steamPressure - 8,
        totalRepairs: prev.totalRepairs + 1,
      };
    });
  }, []);

  // ─── Additional Utility: Disassemble Automaton ─────────────────────────────
  const disassembleAutomaton = useCallback((instanceId: string) => {
    setState(prev => {
      const autoIndex = prev.automatons.findIndex(a => a.instanceId === instanceId);
      if (autoIndex === -1) return prev;
      const auto = prev.automatons[autoIndex];
      // Refund some parts based on rarity
      const refundAmount = [1, 2, 4, 8, 15][auto.rarity] || 1;
      const gearRefund = Math.floor(auto.power * 0.3);
      const newAutomatons = prev.automatons.filter((_, i) => i !== autoIndex);
      // Add steel bolts as salvage
      const partIndex = prev.parts.findIndex(p => p.defId === 'part_steel_bolt');
      const newParts = [...prev.parts];
      if (partIndex !== -1) {
        newParts[partIndex] = { ...newParts[partIndex], count: newParts[partIndex].count + refundAmount };
      }
      const eventLog: CKEventLog[] = [
        {
          id: generateInstanceId('event'),
          timestamp: Date.now(),
          type: 'disassemble' as const,
          message: `Disassembled ${auto.name} (Refunded ${refundAmount} bolts, ${gearRefund} energy)`,
          metadata: { automatonId: instanceId, rarity: auto.rarity, refundAmount, gearRefund },
        },
        ...prev.eventLog,
      ].slice(0, 100);
      return {
        ...prev,
        automatons: newAutomatons,
        gearEnergy: Math.min(200, prev.gearEnergy + gearRefund),
        parts: newParts,
        totalDisassembled: prev.totalDisassembled + 1,
        eventLog,
      };
    });
  }, []);

  // ─── Additional Utility: Feed Automaton (increase level) ───────────────────
  const feedAutomaton = useCallback((instanceId: string) => {
    setState(prev => {
      const autoIndex = prev.automatons.findIndex(a => a.instanceId === instanceId);
      if (autoIndex === -1) return prev;
      const auto = prev.automatons[autoIndex];
      if (auto.level >= 10) return prev;
      const levelCost = Math.floor(auto.power * (auto.level + 1) * 0.5);
      if (prev.gearEnergy < levelCost) return prev;
      const newLevel = auto.level + 1;
      const newPower = Math.floor(auto.power * 1.2);
      const newMaxHealth = 100 + newLevel * 15;
      const newAutomatons = [...prev.automatons];
      newAutomatons[autoIndex] = {
        ...auto,
        level: newLevel,
        power: newPower,
        maxHealth: newMaxHealth,
        health: newMaxHealth,
      };
      const eventLog: CKEventLog[] = [
        {
          id: generateInstanceId('event'),
          timestamp: Date.now(),
          type: 'feed' as const,
          message: `Upgraded ${auto.name} to Lv${newLevel} (Power: ${newPower})`,
          metadata: { automatonId: instanceId, newLevel, newPower, cost: levelCost },
        },
        ...prev.eventLog,
      ].slice(0, 100);
      return {
        ...prev,
        automatons: newAutomatons,
        gearEnergy: prev.gearEnergy - levelCost,
        totalFed: prev.totalFed + 1,
        eventLog,
      };
    });
  }, []);

  // ─── Additional Utility: Get Event Log ────────────────────────────────────
  const getEventLog = useCallback((limit?: number, filterType?: CKEventLog['type']) => {
    let log = state.eventLog;
    if (filterType) {
      log = log.filter(e => e.type === filterType);
    }
    if (limit && limit > 0) {
      log = log.slice(0, limit);
    }
    return log;
  }, [state.eventLog]);

  // ─── Additional Utility: Clear Event Log ──────────────────────────────────
  const clearEventLog = useCallback(() => {
    setState(prev => ({ ...prev, eventLog: [] }));
  }, []);

  // ─── Additional Utility: Get Synergy Bonuses ──────────────────────────────
  const getSynergyBonuses = useCallback(() => {
    return calculateSynergyBonus(state);
  }, [state]);

  // ─── Additional Utility: Get Defense Rating ───────────────────────────────
  const getDefenseRating = useCallback(() => {
    return computeDefenseRating(state);
  }, [state]);

  // ─── Additional Utility: Get Production Rate ──────────────────────────────
  const getProductionRate = useCallback(() => {
    return computeProductionRate(state);
  }, [state]);

  // ─── Additional Utility: Get Research Progress ────────────────────────────
  const getResearchProgress = useCallback(() => {
    return computeResearchProgress(state);
  }, [state]);

  // ─── Additional Utility: Get Lore ─────────────────────────────────────────
  const getLore = useCallback((districtId?: string) => {
    if (districtId) {
      return CK_LORE_ENTRIES.filter(l => l.district === districtId);
    }
    return CK_LORE_ENTRIES;
  }, []);

  // ─── Additional Utility: Get Lore by ID ───────────────────────────────────
  const getLoreById = useCallback((loreId: string) => {
    return CK_LORE_ENTRIES.find(l => l.id === loreId) ?? null;
  }, []);

  // ─── Additional Utility: Get Rust Event Info ──────────────────────────────
  const getRustEventInfo = useCallback(() => {
    return CK_RUST_EVENTS;
  }, []);

  // ─── Additional Utility: Can Build Automaton Check ────────────────────────
  const canBuildAutomaton = useCallback((automatonDefId: string): boolean => {
    const def = CK_AUTOMATON_DEFS.find(a => a.id === automatonDefId);
    if (!def) return false;
    const cost = computeBuildCost(automatonDefId, state);
    return state.gearEnergy >= cost;
  }, [state.gearEnergy]);

  // ─── Additional Utility: Can Upgrade Structure Check ──────────────────────
  const canUpgradeStructure = useCallback((structureDefId: string): boolean => {
    const def = CK_STRUCTURE_DEFS.find(s => s.id === structureDefId);
    if (!def) return false;
    const struct = state.structures.find(s => s.defId === structureDefId);
    if (!struct || struct.level >= def.maxLevel) return false;
    const cost = computeUpgradeCost(def.baseCost, struct.level);
    return state.gearEnergy >= cost;
  }, [state.gearEnergy, state.structures]);

  // ─── Memoized lookup maps ──────────────────────────────────────────────────
  const automatonDefMap = useMemo(() => {
    const map = new Map<string, typeof CK_AUTOMATON_DEFS[0]>();
    for (const def of CK_AUTOMATON_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  const districtDefMap = useMemo(() => {
    const map = new Map<string, typeof CK_DISTRICT_DEFS[0]>();
    for (const def of CK_DISTRICT_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  const partDefMap = useMemo(() => {
    const map = new Map<string, typeof CK_PART_DEFS[0]>();
    for (const def of CK_PART_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  const structureDefMap = useMemo(() => {
    const map = new Map<string, typeof CK_STRUCTURE_DEFS[0]>();
    for (const def of CK_STRUCTURE_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  const abilityDefMap = useMemo(() => {
    const map = new Map<string, typeof CK_ABILITY_DEFS[0]>();
    for (const def of CK_ABILITY_DEFS) {
      map.set(def.id, def);
    }
    return map;
  }, []);

  // ─── Current district info ─────────────────────────────────────────────────
  const currentDistrictInfo = useMemo(() => {
    const def = CK_DISTRICT_DEFS.find(d => d.id === state.currentDistrict);
    const districtState = state.districts.find(d => d.defId === state.currentDistrict);
    if (!def || !districtState) return null;
    return {
      ...def,
      rustLevel: Math.floor(districtState.rustLevel),
      efficiency: Math.floor(districtState.efficiency),
    };
  }, [state.currentDistrict, state.districts]);

  // ─── Available automatons to build (sorted by rarity) ──────────────────────
  const availableAutomatons = useMemo(() => {
    return CK_AUTOMATON_DEFS.map(def => ({
      ...def,
      buildCost: computeBuildCost(def.id, state),
      canAfford: state.gearEnergy >= computeBuildCost(def.id, state),
      alreadyBuilt: state.automatons.some(a => a.defId === def.id),
      rarityName: CK_RARITY_NAMES[def.rarity],
      rarityColor: CK_RARITY_COLORS[def.rarity],
    }));
  }, [state.gearEnergy, state.automatons]);

  // ─── Enriched structures ───────────────────────────────────────────────────
  const enrichedStructures = useMemo(() => {
    return state.structures.map(s => {
      const def = CK_STRUCTURE_DEFS.find(d => d.id === s.defId);
      if (!def) return null;
      return {
        ...s,
        ...def,
        upgradeCost: computeUpgradeCost(def.baseCost, s.level),
        canUpgrade: state.gearEnergy >= computeUpgradeCost(def.baseCost, s.level) && s.level < def.maxLevel,
        isMaxLevel: s.level >= def.maxLevel,
        healthPercent: s.level > 0 ? Math.floor((s.health / s.maxHealth) * 100) : 0,
      };
    }).filter(Boolean);
  }, [state.structures, state.gearEnergy]);

  // ─── Enriched parts ────────────────────────────────────────────────────────
  const enrichedParts = useMemo(() => {
    return state.parts.map(p => {
      const def = CK_PART_DEFS.find(d => d.id === p.defId);
      if (!def) return null;
      return {
        ...p,
        ...def,
        forgeCost: Math.ceil(def.value * 0.4),
        canForge: state.steamPressure >= Math.ceil(def.value * 0.4),
        rarityName: CK_RARITY_NAMES[def.rarity],
        rarityColor: CK_RARITY_COLORS[def.rarity],
      };
    }).filter(Boolean);
  }, [state.parts, state.steamPressure]);

  // ─── Enriched abilities with cooldown state ────────────────────────────────
  const enrichedAbilities = useMemo(() => {
    const now = Date.now();
    return state.abilities.map(a => {
      const def = CK_ABILITY_DEFS.find(d => d.id === a.defId);
      if (!def) return null;
      const elapsed = (now - a.lastUsed) / 1000;
      const cooldownRemaining = Math.max(0, def.cooldown - elapsed);
      const isOnCooldown = cooldownRemaining > 0;
      const isActiveBuff = state.activeBuffs.some(b => b.abilityId === a.defId);
      return {
        ...a,
        ...def,
        cooldownRemaining: Math.floor(cooldownRemaining),
        cooldownPercent: def.cooldown > 0 ? (elapsed / def.cooldown) * 100 : 100,
        isOnCooldown,
        isActiveBuff,
        canActivate: a.unlocked && !isOnCooldown && state.gearEnergy >= def.energyCost,
      };
    }).filter(Boolean);
  }, [state.abilities, state.activeBuffs, state.gearEnergy]);

  // ─── Enriched achievements ─────────────────────────────────────────────────
  const enrichedAchievements = useMemo(() => {
    return state.achievements.map(a => {
      const def = CK_ACHIEVEMENT_DEFS.find(d => d.id === a.defId);
      if (!def) return null;
      return {
        ...a,
        name: def.name,
        description: def.desc,
      };
    }).filter(Boolean);
  }, [state.achievements]);

  // ─── Automaton type distribution ───────────────────────────────────────────
  const automatonTypeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const auto of state.automatons) {
      dist[auto.type] = (dist[auto.type] || 0) + 1;
    }
    return dist;
  }, [state.automatons]);

  // ─── Total parts count ─────────────────────────────────────────────────────
  const totalPartsCount = useMemo(() => {
    return state.parts.reduce((sum, p) => sum + p.count, 0);
  }, [state.parts]);

  // ─── Energy regeneration rate ──────────────────────────────────────────────
  const energyRegenRate = useMemo(() => {
    const boilerLevel = state.structures.find(s => s.defId === 'struct_steam_boiler')?.level || 0;
    const engineLevel = state.structures.find(s => s.defId === 'struct_steam_engine')?.level || 0;
    const clocktowerLevel = state.structures.find(s => s.defId === 'struct_clocktower')?.level || 0;
    return 1 + boilerLevel * 0.5 + engineLevel * 0.8 + clocktowerLevel * 1.2;
  }, [state.structures]);

  // ─── Steam generation rate ─────────────────────────────────────────────────
  const steamGenRate = useMemo(() => {
    const boilerLevel = state.structures.find(s => s.defId === 'struct_steam_boiler')?.level || 0;
    const smelterLevel = state.structures.find(s => s.defId === 'struct_copper_smelter')?.level || 0;
    return 0.5 + boilerLevel * 0.3 + smelterLevel * 0.2;
  }, [state.structures]);

  // ─── Check if buff is active ───────────────────────────────────────────────
  const isBuffActive = useCallback((abilityDefId: string): boolean => {
    return state.activeBuffs.some(b => b.abilityId === abilityDefId);
  }, [state.activeBuffs]);

  // ─── Get ability cooldown remaining ────────────────────────────────────────
  const getAbilityCooldown = useCallback((abilityDefId: string): number => {
    const ability = state.abilities.find(a => a.defId === abilityDefId);
    if (!ability) return 0;
    const def = CK_ABILITY_DEFS.find(d => d.id === abilityDefId);
    if (!def) return 0;
    const now = Date.now();
    const elapsed = (now - ability.lastUsed) / 1000;
    return Math.max(0, Math.floor(def.cooldown - elapsed));
  }, [state.abilities]);

  // ─── Get automaton by instance ID ──────────────────────────────────────────
  const getAutomaton = useCallback((instanceId: string) => {
    return state.automatons.find(a => a.instanceId === instanceId) ?? null;
  }, [state.automatons]);

  // ─── Filter automatons by type ─────────────────────────────────────────────
  const getAutomatonsByType = useCallback((type: string) => {
    return state.automatons.filter(a => a.type === type);
  }, [state.automatons]);

  // ─── Filter automatons by rarity ───────────────────────────────────────────
  const getAutomatonsByRarity = useCallback((rarity: number) => {
    return state.automatons.filter(a => a.rarity === rarity);
  }, [state.automatons]);

  // ─── Get district by ID ────────────────────────────────────────────────────
  const getDistrict = useCallback((districtDefId: string) => {
    const distState = state.districts.find(d => d.defId === districtDefId);
    const distDef = CK_DISTRICT_DEFS.find(d => d.id === districtDefId);
    if (!distState || !distDef) return null;
    return {
      ...distDef,
      rustLevel: Math.floor(distState.rustLevel),
      efficiency: Math.floor(distState.efficiency),
      unlocked: distState.unlocked,
    };
  }, [state.districts]);

  // ─── Get random buildable automaton ────────────────────────────────────────
  const getRandomBuildableAutomaton = useCallback(() => {
    const affordable = CK_AUTOMATON_DEFS.filter(def => {
      const cost = computeBuildCost(def.id, state);
      return state.gearEnergy >= cost;
    });
    if (affordable.length === 0) return null;
    return affordable[Math.floor(Math.random() * affordable.length)];
  }, [state.gearEnergy]);

  // ─── Get structure by ID ───────────────────────────────────────────────────
  const getStructure = useCallback((structureDefId: string) => {
    const structState = state.structures.find(s => s.defId === structureDefId);
    const structDef = CK_STRUCTURE_DEFS.find(d => d.id === structureDefId);
    if (!structState || !structDef) return null;
    return {
      ...structDef,
      ...structState,
      upgradeCost: computeUpgradeCost(structDef.baseCost, structState.level),
      canUpgrade: state.gearEnergy >= computeUpgradeCost(structDef.baseCost, structState.level) && structState.level < structDef.maxLevel,
      isMaxLevel: structState.level >= structDef.maxLevel,
      healthPercent: structState.level > 0 ? Math.floor((structState.health / structState.maxHealth) * 100) : 0,
    };
  }, [state.structures, state.gearEnergy]);

  // ─── Get part by ID ────────────────────────────────────────────────────────
  const getPart = useCallback((partDefId: string) => {
    const partState = state.parts.find(p => p.defId === partDefId);
    const partDef = CK_PART_DEFS.find(d => d.id === partDefId);
    if (!partState || !partDef) return null;
    return {
      ...partDef,
      count: partState.count,
      forgeCost: Math.ceil(partDef.value * 0.4),
      canForge: state.steamPressure >= Math.ceil(partDef.value * 0.4),
      rarityName: CK_RARITY_NAMES[partDef.rarity],
      rarityColor: CK_RARITY_COLORS[partDef.rarity],
    };
  }, [state.parts, state.steamPressure]);

  // ─── Get ability by ID ─────────────────────────────────────────────────────
  const getAbility = useCallback((abilityDefId: string) => {
    const abilityState = state.abilities.find(a => a.defId === abilityDefId);
    const abilityDef = CK_ABILITY_DEFS.find(d => d.id === abilityDefId);
    if (!abilityState || !abilityDef) return null;
    const now = Date.now();
    const elapsed = (now - abilityState.lastUsed) / 1000;
    const cooldownRemaining = Math.max(0, abilityDef.cooldown - elapsed);
    return {
      ...abilityDef,
      ...abilityState,
      cooldownRemaining: Math.floor(cooldownRemaining),
      cooldownPercent: abilityDef.cooldown > 0 ? (elapsed / abilityDef.cooldown) * 100 : 100,
      isOnCooldown: cooldownRemaining > 0,
      isActiveBuff: state.activeBuffs.some(b => b.abilityId === abilityDefId),
      canActivate: abilityState.unlocked && cooldownRemaining <= 0 && state.gearEnergy >= abilityDef.energyCost,
    };
  }, [state.abilities, state.activeBuffs, state.gearEnergy]);

  // ─── Color palette ─────────────────────────────────────────────────────────
  const colors = useMemo(() => ({
    brass: CK_BRASS,
    copper: CK_COPPER,
    steel: CK_STEEL,
    steamWhite: CK_STEAM_WHITE,
    amber: CK_AMBER,
    darkIron: CK_DARK_IRON,
    patina: CK_PATINA,
    rust: CK_RUST,
    goldGear: CK_GOLD_GEAR,
    silverBolt: CK_SILVER_BOLT,
    bronzePlate: CK_BRONZE_PLATE,
    darkBrass: CK_DARK_BRASS,
    lightSteam: CK_LIGHT_STEAM,
    shadowGear: CK_SHADOW_GEAR,
    emeraldSpring: CK_EMERALD_SPRING,
    rubyGem: CK_RUBY_GEM,
    sapphireBearing: CK_SAPPHIRE_BEARING,
    clockface: CK_CLOCKFACE,
    rarityColors: CK_RARITY_COLORS,
  }), []);

  // ─── Static reference data ─────────────────────────────────────────────────
  const automatonDefs = useMemo(() => CK_AUTOMATON_DEFS, []);
  const districtDefs = useMemo(() => CK_DISTRICT_DEFS, []);
  const partDefs = useMemo(() => CK_PART_DEFS, []);
  const structureDefs = useMemo(() => CK_STRUCTURE_DEFS, []);
  const abilityDefs = useMemo(() => CK_ABILITY_DEFS, []);
  const achievementDefs = useMemo(() => CK_ACHIEVEMENT_DEFS.map(d => ({ id: d.id, name: d.name, desc: d.desc })), []);
  const titleDefs = useMemo(() => CK_TITLE_DEFS, []);

  // ─── Return the full API ───────────────────────────────────────────────────
  return {
    // State
    automatons: state.automatons,
    districts: state.districts,
    parts: state.parts,
    structures: state.structures,
    abilities: state.abilities,
    achievements: state.achievements,
    currentDistrict: state.currentDistrict,
    gearEnergy: state.gearEnergy,
    steamPressure: state.steamPressure,
    inventionsBuilt: state.inventionsBuilt,
    rustLevel: state.rustLevel,
    titleIndex: computedTitleIndex,
    kingdomPower: state.kingdomPower,
    machineEfficiency: state.machineEfficiency,
    dailyMaintenanceTask: state.dailyMaintenanceTask,
    activeBuffs: state.activeBuffs,
    eventLog: state.eventLog,
    defenseRating: state.defenseRating,
    productionRate: state.productionRate,
    researchProgress: state.researchProgress,
    districtsUnlocked: state.districtsUnlocked,
    totalDisassembled: state.totalDisassembled,
    totalFed: state.totalFed,

    // Derived
    currentDistrictInfo,
    availableAutomatons,
    enrichedStructures,
    enrichedParts,
    enrichedAbilities,
    enrichedAchievements,
    automatonTypeDistribution,
    totalPartsCount,
    energyRegenRate,
    steamGenRate,

    // Reference data
    automatonDefs,
    districtDefs,
    partDefs,
    structureDefs,
    abilityDefs,
    achievementDefs,
    titleDefs,
    colors,
    typeInfo: CK_TYPE_INFO,
    synergyPairs: CK_SYNERGY_PAIRS,
    rustEvents: CK_RUST_EVENTS,
    rarityNames: CK_RARITY_NAMES,
    rarityColors: CK_RARITY_COLORS,
    forgeRarityThreshold: CK_FORGE_RARITY_THRESHOLD,
    dailyTaskTemplates: CK_DAILY_TASK_TEMPLATES,

    // Lookup maps
    automatonDefMap,
    districtDefMap,
    partDefMap,
    structureDefMap,
    abilityDefMap,

    // Core API
    buildAutomaton,
    upgradeStructure,
    activateAbility,
    repairGear,
    windSpring,
    forgePart,
    activateMachine,
    purgeRust,
    overclockEngine,
    checkAchievements,

    // Info API
    getTitle,
    getProgress,
    getStats,

    // Utility API
    changeDistrict,
    completeDailyTask,
    repairStructure,
    disassembleAutomaton,
    feedAutomaton,
    isBuffActive,
    getAbilityCooldown,
    getAutomaton,
    getAutomatonsByType,
    getAutomatonsByRarity,
    getDistrict,
    getRandomBuildableAutomaton,
    getStructure,
    getPart,
    getAbility,
    canBuildAutomaton,
    canUpgradeStructure,
    getEventLog,
    clearEventLog,
    getSynergyBonuses,
    getDefenseRating,
    getProductionRate,
    getResearchProgress,
    getLore,
    getLoreById,
    getRustEventInfo,
  };
}
