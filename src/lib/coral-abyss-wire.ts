// ============================================================================
// Coral Abyss Wire — 珊瑚深渊 Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// All exports use the `cx` / `CX_` prefix. Hook-based pattern.
// ============================================================================

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ─── Types & Interfaces ───────────────────────────────────────────────────────

type CxRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type CxCoralType = 'branching' | 'massive' | 'plate' | 'soft' | 'encrusting' | 'fan' | 'solitary';

type CxCreatureHabitat =
  | 'coral_terrace'
  | 'twilight_grotto'
  | 'midnight_garden'
  | 'biolum_cavern'
  | 'phantom_reef'
  | 'void_sanctum'
  | 'pressure_rift'
  | 'abyssal_trench';

type CxMaterialSource = 'harvest' | 'creature_drop' | 'structure_output' | 'leviathan_reward' | 'trade';

interface CxZoneDef {
  id: string;
  name: string;
  description: string;
  depth: number;
  dangerLevel: number;
  unlockLevel: number;
}

interface CxCoralDef {
  id: string;
  name: string;
  rarity: CxRarity;
  type: CxCoralType;
  bioluminescence: boolean;
  growthRate: number;
  description: string;
}

interface CxCreatureDef {
  id: string;
  name: string;
  rarity: CxRarity;
  habitat: CxCreatureHabitat;
  hp: number;
  attack: number;
  description: string;
  abilities: string[];
}

interface CxMaterialDef {
  id: string;
  name: string;
  rarity: CxRarity;
  source: CxMaterialSource;
  description: string;
}

interface CxStructureDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
}

interface CxAbilityDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  power: number;
}

interface CxAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
}

interface CxTitleDef {
  id: number;
  name: string;
  requiredLevel: number;
}

interface CxSubmarineDef {
  id: string;
  name: string;
  description: string;
  depthRating: number;
  capacity: number;
  unlockLevel: number;
}

interface CxLeviathanDef {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  rewards: string[];
}

interface CxBondedCreature {
  creatureId: string;
  bondedAt: number;
  hp: number;
  maxHp: number;
}

interface CxOwnedStructure {
  structureId: string;
  level: number;
  builtAt: number;
}

interface CxOwnedSubmarine {
  submarineId: string;
  condition: number;
  upgrades: number;
  launched: boolean;
  launchedAt: number | null;
  returnAt: number | null;
}

interface CxCollectedCoral {
  coralId: string;
  collectedAt: number;
  quantity: number;
}

interface CxMaterialInventory {
  materialId: string;
  quantity: number;
}

interface CxAchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface CxLeviathanState {
  leviathanId: string;
  defeated: boolean;
  defeatedAt: number | null;
  attempts: number;
}

interface CxCoralAbyssState {
  zones: Record<string, { unlocked: boolean; explored: boolean; dives: number }>;
  corals: Record<string, CxCollectedCoral>;
  creatures: Record<string, CxBondedCreature>;
  materials: Record<string, CxMaterialInventory>;
  structures: Record<string, CxOwnedStructure>;
  achievements: Record<string, CxAchievementState>;
  submarines: Record<string, CxOwnedSubmarine>;
  leviathans: Record<string, CxLeviathanState>;
  currentTitle: number;
  abyssLevel: number;
  abyssExp: number;
  gold: number;
  bioEnergy: number;
  depth: number;
  totalDived: number;
  totalCollected: number;
  totalSubmarines: number;
  activeZoneId: string;
  activeLeviathanId: string | null;
  lightLevel: number;
}

// ─── Color Constants ──────────────────────────────────────────────────────────

const CX_COLOR_CORAL = '#FF6B6B';
const CX_COLOR_DEEP = '#001B44';
const CX_COLOR_BIOLUM = '#00FF88';
const CX_COLOR_PEARL = '#F0EAD6';
const CX_COLOR_ABYSS = '#000814';
const CX_COLOR_REEF = '#00B4D8';
const CX_COLOR_TRENCH = '#003049';
const CX_COLOR_LIGHT = '#C5E063';

// ─── CX_ZONES: 8 Abyss Zones ─────────────────────────────────────────────────

const CX_ZONES: CxZoneDef[] = [
  { id: 'coral_terrace', name: 'Coral Terrace', description: 'A sun-dappled shelf of shallow coral formations where light still reaches, teeming with beginner-friendly life.', depth: 50, dangerLevel: 1, unlockLevel: 1 },
  { id: 'twilight_grotto', name: 'Twilight Grotto', description: 'The last traces of sunlight filter through narrow cracks in the rock, casting dancing shadows on the reef walls.', depth: 200, dangerLevel: 2, unlockLevel: 3 },
  { id: 'midnight_garden', name: 'Midnight Garden', description: 'A vast underwater meadow of bioluminescent flora that pulses in waves, painting the darkness in neon hues.', depth: 500, dangerLevel: 4, unlockLevel: 6 },
  { id: 'biolum_cavern', name: 'Bioluminescent Cavern', description: 'An enclosed cavern system where millions of glowing organisms create an otherworldly light show.', depth: 800, dangerLevel: 5, unlockLevel: 10 },
  { id: 'phantom_reef', name: 'Phantom Reef', description: 'A ghostly reef of translucent coral that seems to shift and reform when you look away.', depth: 1200, dangerLevel: 6, unlockLevel: 14 },
  { id: 'void_sanctum', name: 'Void Sanctum', description: 'An ancient temple structure built by unknown beings, now inhabited by the most exotic abyssal life.', depth: 1800, dangerLevel: 7, unlockLevel: 18 },
  { id: 'pressure_rift', name: 'Pressure Rift', description: 'A tectonic crack in the seabed where extreme pressure has compressed life into bizarre crystalline forms.', depth: 2500, dangerLevel: 8, unlockLevel: 22 },
  { id: 'abyssal_trench', name: 'Abyssal Trench', description: 'The deepest point of the Coral Abyss — a lightless chasm where only the most powerful creatures survive.', depth: 3500, dangerLevel: 10, unlockLevel: 28 },
];

// ─── CX_CORALS: 35 Coral Species (5 Rarity Tiers, 7 per Tier) ───────────────

const CX_CORALS: CxCoralDef[] = [
  // Common (7)
  { id: 'stony_finger', name: 'Stony Finger Coral', rarity: 'common', type: 'branching', bioluminescence: false, growthRate: 1.0, description: 'Simple branching coral forming dense thickets on shallow reef tops.' },
  { id: 'moss_pillow', name: 'Moss Pillow Coral', rarity: 'common', type: 'massive', bioluminescence: false, growthRate: 0.8, description: 'Rounded boulder-shaped coral covered in a fine green algae fuzz.' },
  { id: 'shelf_plate', name: 'Shelf Plate Coral', rarity: 'common', type: 'plate', bioluminescence: false, growthRate: 0.9, description: 'Wide flat plates stacked like shelves, providing shelter for small fish.' },
  { id: 'sea_feather', name: 'Sea Feather Coral', rarity: 'common', type: 'soft', bioluminescence: false, growthRate: 1.2, description: 'Delicate feathery fronds that sway gently in the current.' },
  { id: 'crust_pave', name: 'Crust Pavement Coral', rarity: 'common', type: 'encrusting', bioluminescence: false, growthRate: 1.1, description: 'Thin encrusting layer that spreads across rock surfaces like living pavement.' },
  { id: 'lace_fan', name: 'Lace Fan Coral', rarity: 'common', type: 'fan', bioluminescence: false, growthRate: 0.7, description: 'A small fan coral with delicate lattice patterns carved by feeding currents.' },
  { id: 'cup_solitary', name: 'Cup Solitary Coral', rarity: 'common', type: 'solitary', bioluminescence: false, growthRate: 0.6, description: 'A single large cup-shaped polyp resting on the sandy bottom.' },
  // Uncommon (7)
  { id: 'ember_branch', name: 'Ember Branch Coral', rarity: 'uncommon', type: 'branching', bioluminescence: true, growthRate: 0.9, description: 'Branches tipped with a warm orange glow, like underwater embers.' },
  { id: 'jade_boulder', name: 'Jade Boulder Coral', rarity: 'uncommon', type: 'massive', bioluminescence: false, growthRate: 0.7, description: 'A massive boulder of vivid green with deep mineral veins running through it.' },
  { id: 'sunset_table', name: 'Sunset Table Coral', rarity: 'uncommon', type: 'plate', bioluminescence: true, growthRate: 0.8, description: 'Broad plates that reflect light in gradient patterns of sunset colors.' },
  { id: 'silk_glove', name: 'Silk Glove Coral', rarity: 'uncommon', type: 'soft', bioluminescence: false, growthRate: 1.0, description: 'Extremely soft pulsating polyps resembling a glove made of liquid silk.' },
  { id: 'amber_crust', name: 'Amber Crust Coral', rarity: 'uncommon', type: 'encrusting', bioluminescence: true, growthRate: 1.1, description: 'Golden-amber encrustation that traps tiny organisms in its resin-like surface.' },
  { id: 'violet_sea_fan', name: 'Violet Sea Fan', rarity: 'uncommon', type: 'fan', bioluminescence: true, growthRate: 0.6, description: 'A deep purple sea fan that emits a soft violet glow in low light.' },
  { id: 'moonrise_solitary', name: 'Moonrise Solitary Coral', rarity: 'uncommon', type: 'solitary', bioluminescence: true, growthRate: 0.5, description: 'A large solitary polyp that opens only at night, reflecting moonlight.' },
  // Rare (7)
  { id: 'crystal_antler', name: 'Crystal Antler Coral', rarity: 'rare', type: 'branching', bioluminescence: true, growthRate: 0.5, description: 'Translucent branching coral with crystalline tips that refract bioluminescent light.' },
  { id: 'obsidian_dome', name: 'Obsidian Dome Coral', rarity: 'rare', type: 'massive', bioluminescence: true, growthRate: 0.4, description: 'A jet-black dome coral that pulses with veins of electric blue bioluminescence.' },
  { id: 'aurora_shelf', name: 'Aurora Shelf Coral', rarity: 'rare', type: 'plate', bioluminescence: true, growthRate: 0.6, description: 'Cascading plates that shimmer with shifting aurora-like color patterns.' },
  { id: 'neon_whip', name: 'Neon Whip Coral', rarity: 'rare', type: 'soft', bioluminescence: true, growthRate: 0.7, description: 'Long trailing tendrils that crackle with neon-pink bioelectric discharge.' },
  { id: 'prism_crust', name: 'Prism Crust Coral', rarity: 'rare', type: 'encrusting', bioluminescence: true, growthRate: 0.8, description: 'An iridescent crust that splits light into rainbow spectrums.' },
  { id: 'phantom_fan', name: 'Phantom Fan Coral', rarity: 'rare', type: 'fan', bioluminescence: true, growthRate: 0.4, description: 'A nearly invisible fan coral revealed only by its ghostly green luminescence.' },
  { id: 'abyssal_pearl', name: 'Abyssal Pearl Coral', rarity: 'rare', type: 'solitary', bioluminescence: true, growthRate: 0.3, description: 'A solitary polyp that grows a perfect bioluminescent pearl at its center.' },
  // Epic (7)
  { id: 'starfall_crown', name: 'Starfall Crown Coral', rarity: 'epic', type: 'branching', bioluminescence: true, growthRate: 0.3, description: 'Branches tipped with points of light resembling falling stars frozen in time.' },
  { id: 'void_mother', name: 'Void Mother Coral', rarity: 'epic', type: 'massive', bioluminescence: true, growthRate: 0.2, description: 'An enormous dark mass that births smaller glowing polyps from its surface.' },
  { id: 'cosmos_plate', name: 'Cosmos Plate Coral', rarity: 'epic', type: 'plate', bioluminescence: true, growthRate: 0.25, description: 'Plates patterned with constellations that glow in sequence through the night.' },
  { id: 'siren_hair', name: 'Siren Hair Coral', rarity: 'epic', type: 'soft', bioluminescence: true, growthRate: 0.35, description: 'Mesmerizing hair-like strands that produce harmonic light pulses.' },
  { id: 'dragon_scale', name: 'Dragon Scale Encrusting Coral', rarity: 'epic', type: 'encrusting', bioluminescence: true, growthRate: 0.3, description: 'Hard crystalline scales in patterns resembling dragon hide, glowing molten gold.' },
  { id: 'veil_of_ages', name: 'Veil of Ages Fan Coral', rarity: 'epic', type: 'fan', bioluminescence: true, growthRate: 0.2, description: 'An ancient fan coral so large it creates its own current, whispering in the flow.' },
  { id: 'timekeeper_solitary', name: 'Timekeeper Solitary Coral', rarity: 'epic', type: 'solitary', bioluminescence: true, growthRate: 0.15, description: 'Rings of bioluminescence pulse outward like a living clock counting eons.' },
  // Legendary (7)
  { id: 'world_tree_branch', name: 'World Tree Branch Coral', rarity: 'legendary', type: 'branching', bioluminescence: true, growthRate: 0.1, description: 'A branching coral of mythic proportions, its luminescence sustains entire ecosystems.' },
  { id: 'heart_of_abyss', name: 'Heart of the Abyss Coral', rarity: 'legendary', type: 'massive', bioluminescence: true, growthRate: 0.08, description: 'A colossal beating mass at the deepest point, its pulse visible from leagues away.' },
  { id: 'sky_mirror_plate', name: 'Sky Mirror Plate Coral', rarity: 'legendary', type: 'plate', bioluminescence: true, growthRate: 0.12, description: 'Perfectly reflective plates that mirror light from the surface into the darkest depths.' },
  { id: 'dreamweaver', name: 'Dreamweaver Soft Coral', rarity: 'legendary', type: 'soft', bioluminescence: true, growthRate: 0.09, description: 'Ethereal tendrils that induce vivid dreams in any creature that touches them.' },
  { id: 'genesis_crust', name: 'Genesis Crust Coral', rarity: 'legendary', type: 'encrusting', bioluminescence: true, growthRate: 0.07, description: 'The primordial coral from which all other abyssal corals are said to have evolved.' },
  { id: 'eternal_fan', name: 'Eternal Fan Coral', rarity: 'legendary', type: 'fan', bioluminescence: true, growthRate: 0.06, description: 'A fan coral that has grown for millennia, recording the history of the abyss in its growth rings.' },
  { id: 'ocean_heart_solitary', name: 'Ocean Heart Solitary Coral', rarity: 'legendary', type: 'solitary', bioluminescence: true, growthRate: 0.05, description: 'A single perfect polyp containing the concentrated essence of the entire ocean.' },
];

// ─── CX_CREATURES: 35 Abyss Creatures (5 Rarity Tiers, 7 per Tier) ─────────

const CX_CREATURES: CxCreatureDef[] = [
  // Common (7)
  { id: 'glow_shrimp', name: 'Glow Shrimp', rarity: 'common', habitat: 'coral_terrace', hp: 15, attack: 2, description: 'Tiny translucent shrimp whose entire body pulses with soft green light.', abilities: ['bioluminescent_flash'] },
  { id: 'reef_hopper', name: 'Reef Hopper Fish', rarity: 'common', habitat: 'coral_terrace', hp: 20, attack: 3, description: 'A small nimble fish that hops between coral branches to evade predators.', abilities: ['quick_dodge'] },
  { id: 'sand_crawler', name: 'Sand Crawler Crab', rarity: 'common', habitat: 'coral_terrace', hp: 25, attack: 4, description: 'A heavily armored crab that scuttles along the sandy bottom collecting debris.', abilities: ['hard_shell'] },
  { id: 'bubble_jelly', name: 'Bubble Jellyfish', rarity: 'common', habitat: 'twilight_grotto', hp: 10, attack: 5, description: 'A harmless-looking jelly that trails bubbles filled with mild venom.', abilities: ['sting_touch'] },
  { id: 'tide_cling', name: 'Tide Clingfish', rarity: 'common', habitat: 'twilight_grotto', hp: 18, attack: 2, description: 'A flat fish that attaches to coral surfaces with a suction disc on its belly.', abilities: ['suction_grip'] },
  { id: 'flash_angelfish', name: 'Flash Angelfish', rarity: 'common', habitat: 'twilight_grotto', hp: 22, attack: 3, description: 'An angelfish that produces a brief flash when startled, stunning nearby prey.', abilities: ['startle_flash'] },
  { id: 'drift_snail', name: 'Drift Snail', rarity: 'common', habitat: 'coral_terrace', hp: 12, attack: 1, description: 'A slow-moving snail riding ocean currents on a raft of mucus bubbles.', abilities: ['bubble_raft'] },
  // Uncommon (7)
  { id: 'prism_squid', name: 'Prism Squid', rarity: 'uncommon', habitat: 'midnight_garden', hp: 40, attack: 8, description: 'A small squid whose skin acts as a prism, scattering bioluminescent light.', abilities: ['color_shift', 'ink_cloud'] },
  { id: 'coral_guardian', name: 'Coral Guardian Goby', rarity: 'uncommon', habitat: 'twilight_grotto', hp: 35, attack: 6, description: 'A territorial goby that fiercely defends its coral home from intruders.', abilities: ['territorial_roar'] },
  { id: 'deep_lantern', name: 'Deep Lantern Eel', rarity: 'uncommon', habitat: 'midnight_garden', hp: 50, attack: 10, description: 'A slender eel with a lantern-like organ at the tip of its tail.', abilities: ['lure_light', 'electric_shock'] },
  { id: 'shell_knight', name: 'Shell Knight Hermit Crab', rarity: 'uncommon', habitat: 'coral_terrace', hp: 55, attack: 7, description: 'A hermit crab inhabiting an unusually large and heavily spiked shell.', abilities: ['shield_bash', 'shell_spin'] },
  { id: 'current_ray', name: 'Current Ray', rarity: 'uncommon', habitat: 'twilight_grotto', hp: 45, attack: 5, description: 'A flat ray that rides deep ocean currents with perfect precision.', abilities: ['current_surf', 'sand_burrow'] },
  { id: 'glow_frog', name: 'Glow Frogfish', rarity: 'uncommon', habitat: 'midnight_garden', hp: 30, attack: 9, description: 'An ambush predator disguised as a glowing coral polyp.', abilities: ['ambush_strike', 'mimic_coral'] },
  { id: 'spiral_shell', name: 'Spiral Shell Nautilus', rarity: 'uncommon', habitat: 'twilight_grotto', hp: 48, attack: 4, description: 'A living fossil with a perfectly logarithmic spiral shell that adjusts buoyancy.', abilities: ['depth_control', 'ink_burst'] },
  // Rare (7)
  { id: 'phantom_octopus', name: 'Phantom Octopus', rarity: 'rare', habitat: 'biolum_cavern', hp: 80, attack: 15, description: 'A semi-transparent octopus that can make itself nearly invisible in the cavern glow.', abilities: ['invisibility', 'tangle_grasp', 'ink_nova'] },
  { id: 'crystal_crab', name: 'Crystal Crab', rarity: 'rare', habitat: 'biolum_cavern', hp: 100, attack: 12, description: 'A crab whose shell has been overgrown with crystalline coral formations.', abilities: ['crystal_armor', 'pinch_crush'] },
  { id: 'neon_leviathan_juvenile', name: 'Neon Leviathan Juvenile', rarity: 'rare', habitat: 'midnight_garden', hp: 70, attack: 18, description: 'A young member of a normally legendary species, already showing incredible power.', abilities: ['neon_pulse', 'rapid_charge'] },
  { id: 'void_moth', name: 'Void Moth Jellyfish', rarity: 'rare', habitat: 'biolum_cavern', hp: 45, attack: 20, description: 'A jellyfish with wing-like bell that releases psychoactive bioluminescent spores.', abilities: ['hypno_spores', 'wing_buffer'] },
  { id: 'trench_wyrm', name: 'Trench Wyrm', rarity: 'rare', habitat: 'phantom_reef', hp: 120, attack: 16, description: 'A segmented worm-like creature that navigates by sensing pressure differentials.', abilities: ['burrow_strike', 'pressure_sense'] },
  { id: 'echo_dolphin', name: 'Echo Dolphin', rarity: 'rare', habitat: 'midnight_garden', hp: 90, attack: 14, description: 'A deep-diving dolphin with advanced sonar that can stun prey with sound.', abilities: ['sonar_blast', 'echo_location'] },
  { id: 'frost_anemone', name: 'Frost Anemone', rarity: 'rare', habitat: 'biolum_cavern', hp: 60, attack: 22, description: 'An anemone that generates freezing temperatures, encasing prey in ice.', abilities: ['frost_tentacle', 'ice_prison'] },
  // Epic (7)
  { id: 'soul_whale', name: 'Soul Whale', rarity: 'epic', habitat: 'phantom_reef', hp: 300, attack: 25, description: 'A spectral whale whose song can heal or shatter depending on its mood.', abilities: ['healing_song', 'shatter_cry', 'depth_dive'] },
  { id: 'crystal_serpent', name: 'Crystal Serpent', rarity: 'epic', habitat: 'void_sanctum', hp: 250, attack: 35, description: 'A massive serpent covered in razor-sharp crystal scales that refract light into lasers.', abilities: ['crystal_laser', 'scale_storm', 'prism_barrier'] },
  { id: 'abyssal_phantom_shark', name: 'Abyssal Phantom Shark', rarity: 'epic', habitat: 'phantom_reef', hp: 280, attack: 40, description: 'A ghostly shark that phases between dimensions, appearing and vanishing at will.', abilities: ['phase_shift', 'void_bite', 'dimensional_rift'] },
  { id: 'coral_golem', name: 'Coral Golem', rarity: 'epic', habitat: 'void_sanctum', hp: 500, attack: 30, description: 'A massive construct of living coral animated by ancient abyssal magic.', abilities: ['coral_fortify', 'massive_slam', 'regenerate'] },
  { id: 'lightning_manta', name: 'Lightning Manta', rarity: 'epic', habitat: 'phantom_reef', hp: 200, attack: 45, description: 'An enormous manta ray that generates and discharges bioelectric lightning.', abilities: ['lightning_strike', 'thunder_wave', 'storm_glide'] },
  { id: 'void_siren', name: 'Void Siren', rarity: 'epic', habitat: 'void_sanctum', hp: 220, attack: 38, description: 'A mesmerizing humanoid figure composed entirely of living bioluminescent water.', abilities: ['siren_call', 'water_form', 'hypnotic_gaze'] },
  { id: 'pressurized_titan', name: 'Pressurized Titan Crab', rarity: 'epic', habitat: 'pressure_rift', hp: 600, attack: 28, description: 'A crab of titanic proportions whose shell has been compressed into diamond hardness.', abilities: ['diamond_shell', 'crushing_pinch', 'pressure_wave'] },
  // Legendary (7)
  { id: 'ocean_sovereign', name: 'Ocean Sovereign Whale', rarity: 'legendary', habitat: 'abyssal_trench', hp: 1000, attack: 50, description: 'The mythical ruler of all ocean life, a whale of impossible size and ancient wisdom.', abilities: ['tidal_call', 'ancient_wisdom', 'ocean_wrath', 'immortal_hull'] },
  { id: 'kraken_elder', name: 'Kraken Elder', rarity: 'legendary', habitat: 'abyssal_trench', hp: 800, attack: 65, description: 'An ancient kraken that has existed since before the continents formed.', abilities: ['tentacle_maelstrom', 'ink_apocalypse', 'crush_depth', 'regenerate_tentacle'] },
  { id: 'leviathan_of_light', name: 'Leviathan of Light', rarity: 'legendary', habitat: 'void_sanctum', hp: 700, attack: 55, description: 'A being of pure bioluminescent energy that illuminates the deepest abyss.', abilities: ['light_nova', 'prism_volley', 'dawn_break', 'radiance_shield'] },
  { id: 'trench_dragon', name: 'Trench Dragon Eel', rarity: 'legendary', habitat: 'abyssal_trench', hp: 900, attack: 70, description: 'A serpentine dragon that rules the deepest trenches, breathing pressurized water jets.', abilities: ['pressure_breath', 'seismic_tail', 'abyssal_roar', 'invulnerable_scales'] },
  { id: 'coral_world_tree', name: 'Coral World Tree Entity', rarity: 'legendary', habitat: 'abyssal_trench', hp: 1200, attack: 40, description: 'A sentient coral formation the size of a mountain, the root of all abyssal life.', abilities: ['root_network', 'bloom_explosion', 'life_surge', 'ancestral_shield'] },
  { id: 'void_emperor', name: 'Void Emperor Squid', rarity: 'legendary', habitat: 'abyssal_trench', hp: 850, attack: 60, description: 'The largest squid ever recorded, dwelling in absolute darkness at the bottom of the world.', abilities: ['void_tentacle', 'darkness_pulse', 'gravitational_pull', 'ink_hurricane'] },
  { id: 'dream_whale', name: 'Dream Whale', rarity: 'legendary', habitat: 'void_sanctum', hp: 750, attack: 35, description: 'A whale that exists partially in a dream dimension, warping reality around it.', abilities: ['dream_bubble', 'reality_shift', 'nightmare_surge', 'awaken'] },
];

// ─── CX_MATERIALS: 30 Abyss Materials ────────────────────────────────────────

const CX_MATERIALS: CxMaterialDef[] = [
  // Common (6)
  { id: 'reef_fragment', name: 'Reef Fragment', rarity: 'common', source: 'harvest', description: 'A broken piece of common coral, useful for basic construction.' },
  { id: 'sea_salt_crystal', name: 'Sea Salt Crystal', rarity: 'common', source: 'harvest', description: 'Natural salt crystals harvested from evaporating pools on the reef.' },
  { id: 'algae_extract', name: 'Algae Extract', rarity: 'common', source: 'harvest', description: 'A concentrated paste of abyssal algae with mild healing properties.' },
  { id: 'shrimp_shell', name: 'Glow Shrimp Shell', rarity: 'common', source: 'creature_drop', description: 'The translucent shell of a glow shrimp, still faintly luminous.' },
  { id: 'sand_pearl', name: 'Sand Pearl', rarity: 'common', source: 'harvest', description: 'A small imperfect pearl found buried in the sandy seabed.' },
  { id: 'tide_resin', name: 'Tide Resin', rarity: 'common', source: 'harvest', description: 'Sticky resin secreted by certain corals to seal micro-fissures.' },
  // Uncommon (6)
  { id: 'bioluminescent_essence', name: 'Bioluminescent Essence', rarity: 'uncommon', source: 'creature_drop', description: 'Concentrated bioluminescent fluid harvested from deep-sea organisms.' },
  { id: 'coral_shard', name: 'Coral Shard', rarity: 'uncommon', source: 'harvest', description: 'A sharp fragment of hardened coral, prized for its structural integrity.' },
  { id: 'pearl_dust', name: 'Pearl Dust', rarity: 'uncommon', source: 'harvest', description: 'Fine luminous powder ground from cultivated abyssal pearls.' },
  { id: 'jellyfish_extract', name: 'Jellyfish Biotoxin', rarity: 'uncommon', source: 'creature_drop', description: 'A carefully extracted venom from bubble jellyfish, useful in alchemy.' },
  { id: 'prism_scale', name: 'Prism Scale', rarity: 'uncommon', source: 'creature_drop', description: 'An iridescent scale from a prism squid, refracting light in all colors.' },
  { id: 'kelp_fiber', name: 'Deep Kelp Fiber', rarity: 'uncommon', source: 'harvest', description: 'Extremely strong fiber harvested from deep-water kelp stalks.' },
  // Rare (6)
  { id: 'void_crystal', name: 'Void Crystal', rarity: 'rare', source: 'structure_output', description: 'A crystal formed in the absence of all light, humming with stored energy.' },
  { id: 'soul_pearl', name: 'Soul Pearl', rarity: 'rare', source: 'creature_drop', description: 'A pearl that forms inside the body of soul whales over centuries.' },
  { id: 'abyssal_iron', name: 'Abyssal Iron Ore', rarity: 'rare', source: 'harvest', description: 'Iron deposits compressed under extreme deep-sea pressure into ultra-dense ore.' },
  { id: 'frost_venom', name: 'Frost Anemone Venom', rarity: 'rare', source: 'creature_drop', description: 'Cold-running venom from frost anemones, never warming above freezing.' },
  { id: 'echo_stone', name: 'Echo Stone', rarity: 'rare', source: 'structure_output', description: 'A resonant mineral that records and replays sound waves from the deep.' },
  { id: 'phantom_silk', name: 'Phantom Octopus Silk', rarity: 'rare', source: 'creature_drop', description: 'Invisible thread harvested from phantom octopus tentacles, nearly unbreakable.' },
  // Epic (6)
  { id: 'leviathan_scale', name: 'Leviathan Scale', rarity: 'epic', source: 'leviathan_reward', description: 'A massive scale shed by a defeated leviathan, harder than diamond.' },
  { id: 'world_tree_sap', name: 'World Tree Coral Sap', rarity: 'epic', source: 'structure_output', description: 'Golden sap flowing from the World Tree Branch Coral, containing primordial life energy.' },
  { id: 'void_heart_core', name: 'Void Heart Core', rarity: 'epic', source: 'leviathan_reward', description: 'The crystallized heart of the Heart of the Abyss coral, pulsing with dark energy.' },
  { id: 'dream_essence', name: 'Dream Essence', rarity: 'epic', source: 'creature_drop', description: 'Liquefied dream-stuff harvested from the Dream Whale\'s wake.' },
  { id: 'ocean_sovereign_tear', name: 'Ocean Sovereign Tear', rarity: 'epic', source: 'leviathan_reward', description: 'A single tear from the Ocean Sovereign, containing the power of all oceans.' },
  { id: 'abyssal_diamond', name: 'Abyssal Diamond', rarity: 'epic', source: 'harvest', description: 'A diamond formed under the pressure of the abyssal trench, flawlessly perfect.' },
  // Legendary (6)
  { id: 'genesis_seed', name: 'Genesis Seed', rarity: 'legendary', source: 'leviathan_reward', description: 'A seed from the Genesis Crust Coral, said to be able to birth new oceans.' },
  { id: 'ocean_heart', name: 'Ocean Heart Gem', rarity: 'legendary', source: 'leviathan_reward', description: 'The crystallized essence of the Ocean Heart Solitary Coral, the ocean\'s soul.' },
  { id: 'kraken_ink', name: 'Kraken Elder Eternal Ink', rarity: 'legendary', source: 'leviathan_reward', description: 'Ink from the Kraken Elder that never fades, said to contain the history of the deep.' },
  { id: 'trench_dragon_breath', name: 'Trench Dragon Breath Crystal', rarity: 'legendary', source: 'leviathan_reward', description: 'Crystallized breath of the Trench Dragon, radiating extreme pressure energy.' },
  { id: 'void_emperor_gem', name: 'Void Emperor Gem', rarity: 'legendary', source: 'leviathan_reward', description: 'The central eye-gem of the Void Emperor, containing a pocket dimension of darkness.' },
  { id: 'dream_whale_bone', name: 'Dream Whale Song Bone', rarity: 'legendary', source: 'leviathan_reward', description: 'A bone from the Dream Whale that vibrates with its eternal song.' },
];

// ─── CX_STRUCTURES: 25 Upgradeable Structures (Level 1-10) ──────────────────

const CX_STRUCTURES: CxStructureDef[] = [
  // Production (5)
  { id: 'reef_sanctuary', name: 'Reef Sanctuary', description: 'A protected nursery that accelerates coral growth and boosts bio-energy regeneration.', maxLevel: 10, baseCost: 100 },
  { id: 'light_tower', name: 'Light Tower', description: 'A tall beacon that increases the light level across nearby zones, revealing hidden creatures.', maxLevel: 10, baseCost: 120 },
  { id: 'pearl_lab', name: 'Pearl Cultivation Lab', description: 'Facility for growing and harvesting abyssal pearls of increasing quality.', maxLevel: 10, baseCost: 150 },
  { id: 'bio_reactor', name: 'Bio-Energy Reactor', description: 'Converts bioluminescent materials into usable bio-energy for the abyss base.', maxLevel: 10, baseCost: 200 },
  { id: 'material_refinery', name: 'Material Refinery', description: 'Processes raw harvested materials into refined crafting components.', maxLevel: 10, baseCost: 180 },
  // Defense (5)
  { id: 'coral_barrier', name: 'Living Coral Barrier', description: 'A wall of rapidly growing defensive coral that regenerates after damage.', maxLevel: 10, baseCost: 130 },
  { id: 'sonar_net', name: 'Sonar Defense Net', description: 'An array of sonic emitters that detects and deters hostile creatures.', maxLevel: 10, baseCost: 160 },
  { id: 'pressure_dome', name: 'Pressure Shield Dome', description: 'Generates a localized pressure field that repels deep-sea predators.', maxLevel: 10, baseCost: 220 },
  { id: 'bioelectric_fence', name: 'Bioelectric Fence', description: 'A fence of electrically charged kelp that stuns approaching threats.', maxLevel: 10, baseCost: 170 },
  { id: 'abyss_bunker', name: 'Abyss Bunker', description: 'A reinforced shelter that provides complete protection during leviathan attacks.', maxLevel: 10, baseCost: 250 },
  // Exploration (5)
  { id: 'depth_elevator', name: 'Depth Elevator', description: 'A pressurized lift system enabling rapid transit between depth zones.', maxLevel: 10, baseCost: 140 },
  { id: 'sonar_mapping_station', name: 'Sonar Mapping Station', description: 'Maps unexplored regions of the abyss, revealing new dive sites and resources.', maxLevel: 10, baseCost: 190 },
  { id: 'expedition_dock', name: 'Expedition Dock', description: 'A submarine docking bay for launching and recovering exploration missions.', maxLevel: 10, baseCost: 210 },
  { id: 'beacon_array', name: 'Beacon Array', description: 'A chain of light beacons marking safe paths through dangerous zones.', maxLevel: 10, baseCost: 160 },
  { id: 'comms_relay', name: 'Deep Comms Relay', description: 'Maintains communication links between the surface and abyssal operations.', maxLevel: 10, baseCost: 175 },
  // Research (5)
  { id: 'xenobiology_lab', name: 'Xenobiology Research Lab', description: 'Studies alien-like abyssal creatures to unlock new bonding abilities.', maxLevel: 10, baseCost: 240 },
  { id: 'crystal_growth_chamber', name: 'Crystal Growth Chamber', description: 'Cultivates rare abyssal crystals under controlled pressure and light conditions.', maxLevel: 10, baseCost: 200 },
  { id: 'ancient_archive', name: 'Ancient Abyssal Archive', description: 'Stores and decodes ancient inscriptions found on deep-sea ruins.', maxLevel: 10, baseCost: 230 },
  { id: 'genetics_lab', name: 'Coral Genetics Laboratory', description: 'Researches coral DNA to breed new species with enhanced properties.', maxLevel: 10, baseCost: 260 },
  { id: 'pressure_forge', name: 'Pressure Forge', description: 'Uses extreme pressure to craft equipment and tools from abyssal materials.', maxLevel: 10, baseCost: 280 },
  // Utility (5)
  { id: 'bio_energy_storage', name: 'Bio-Energy Storage Tank', description: 'Stores excess bio-energy for later use during deep expeditions.', maxLevel: 10, baseCost: 110 },
  { id: 'oxygen_garden', name: 'Oxygen Garden', description: 'Hydroponic garden of deep algae that produces breathable oxygen and food.', maxLevel: 10, baseCost: 130 },
  { id: 'repair_bay', name: 'Submarine Repair Bay', description: 'Equipped workshop for repairing and maintaining exploration submarines.', maxLevel: 10, baseCost: 150 },
  { id: 'trading_post', name: 'Abyss Trading Post', description: 'A neutral trading hub where rare materials can be exchanged with deep-sea merchants.', maxLevel: 10, baseCost: 190 },
  { id: 'trophy_hall', name: 'Leviathan Trophy Hall', description: 'Displays trophies from defeated leviathans, boosting morale and providing bonuses.', maxLevel: 10, baseCost: 300 },
];

// ─── CX_ABILITIES: 22 Water/Light Abilities ──────────────────────────────────

const CX_ABILITIES: CxAbilityDef[] = [
  { id: 'tidal_surge', name: 'Tidal Surge', description: 'Summons a powerful current that pushes creatures away and reveals hidden items.', cooldown: 30, power: 20 },
  { id: 'bio_flash', name: 'Bioluminescent Flash', description: 'Emits a blinding pulse of bio-light that stuns enemies for several seconds.', cooldown: 15, power: 15 },
  { id: 'coral_shield', name: 'Coral Shield', description: 'Encases the diver in a protective shell of hardened coral fragments.', cooldown: 45, power: 30 },
  { id: 'pressure_wave', name: 'Pressure Wave', description: 'Releases a shockwave of compressed water that damages all nearby foes.', cooldown: 25, power: 25 },
  { id: 'sonar_ping', name: 'Sonar Ping', description: 'Sends out a sonar pulse that maps the surrounding area and reveals resources.', cooldown: 10, power: 10 },
  { id: 'light_beam', name: 'Focused Light Beam', description: 'Concentrates bioluminescent energy into a piercing beam of light.', cooldown: 20, power: 35 },
  { id: 'whirlpool', name: 'Whirlpool', description: 'Creates a spinning vortex that traps creatures and draws in loose items.', cooldown: 40, power: 30 },
  { id: 'healing_rain', name: 'Healing Rain', description: 'Summons a gentle downpour of bio-energy-infused water that heals allies.', cooldown: 60, power: 40 },
  { id: 'ink_cloud', name: 'Defensive Ink Cloud', description: 'Releases a massive cloud of dark ink for escape and disorientation.', cooldown: 20, power: 15 },
  { id: 'frost_burst', name: 'Frost Burst', description: 'Rapidly freezes surrounding water, encasing enemies in ice crystals.', cooldown: 35, power: 45 },
  { id: 'electric_discharge', name: 'Electric Discharge', description: 'Channels bio-electricity through the water, chaining between targets.', cooldown: 30, power: 50 },
  { id: 'prism_shatter', name: 'Prism Shatter', description: 'Fires a beam that refracts through crystal formations into multiple damage rays.', cooldown: 50, power: 55 },
  { id: 'tidal_wall', name: 'Tidal Wall', description: 'Raises a wall of pressurized water that blocks attacks and traps creatures.', cooldown: 55, power: 35 },
  { id: 'ocean_call', name: 'Ocean Call', description: 'A resonant song that calms hostile creatures and attracts friendly ones.', cooldown: 70, power: 20 },
  { id: 'void_step', name: 'Void Step', description: 'Phases through the water in a blur of dark energy, reappearing behind enemies.', cooldown: 25, power: 30 },
  { id: 'bio_regen', name: 'Bio-Regeneration Pulse', description: 'Accelerates natural healing using concentrated bioluminescent energy.', cooldown: 90, power: 60 },
  { id: 'depth_charge', name: 'Depth Charge', description: 'Drops a pressurized explosive that detonates at a target depth.', cooldown: 45, power: 70 },
  { id: 'light_bomb', name: 'Light Bomb', description: 'Detonates a concentrated sphere of pure light energy, illuminating a massive area.', cooldown: 60, power: 40 },
  { id: 'kraken_grasp', name: 'Kraken Grasp', description: 'Manifests spectral tentacles that crush and restrain a target.', cooldown: 80, power: 80 },
  { id: 'whale_song', name: 'Whale Song Amplifier', description: 'Amplifies whale song into a devastating sonic attack that echoes through the deep.', cooldown: 100, power: 90 },
  { id: 'genesis_wave', name: 'Genesis Wave', description: 'Unleashes a wave of primordial life energy that transforms the battlefield.', cooldown: 120, power: 100 },
  { id: 'ocean_wrath', name: 'Ocean Wrath', description: 'Channels the fury of the entire ocean into a cataclysmic final attack.', cooldown: 180, power: 150 },
];

// ─── CX_ACHIEVEMENTS: 18 Achievements ───────────────────────────────────────

const CX_ACHIEVEMENTS: CxAchievementDef[] = [
  { id: 'first_dive', name: 'First Descent', description: 'Complete your first dive into the Coral Abyss.', condition: 'totalDived >= 1', reward: 50 },
  { id: 'ten_dives', name: 'Seasoned Diver', description: 'Complete 10 abyssal dives.', condition: 'totalDived >= 10', reward: 200 },
  { id: 'fifty_dives', name: 'Abyss Veteran', description: 'Complete 50 abyssal dives.', condition: 'totalDived >= 50', reward: 800 },
  { id: 'hundred_dives', name: 'Abyss Legend', description: 'Complete 100 abyssal dives.', condition: 'totalDived >= 100', reward: 2000 },
  { id: 'coral_collector_5', name: 'Coral Apprentice', description: 'Collect 5 different coral species.', condition: 'uniqueCorals >= 5', reward: 100 },
  { id: 'coral_collector_15', name: 'Coral Expert', description: 'Collect 15 different coral species.', condition: 'uniqueCorals >= 15', reward: 400 },
  { id: 'coral_collector_35', name: 'Coral Master', description: 'Collect all 35 coral species.', condition: 'uniqueCorals >= 35', reward: 3000 },
  { id: 'creature_bonder_10', name: 'Creature Friend', description: 'Bond with 10 different abyss creatures.', condition: 'uniqueCreatures >= 10', reward: 150 },
  { id: 'creature_bonder_25', name: 'Creature Whisperer', description: 'Bond with 25 different abyss creatures.', condition: 'uniqueCreatures >= 25', reward: 600 },
  { id: 'first_leviathan', name: 'Leviathan Slayer', description: 'Defeat your first abyss leviathan.', condition: 'leviathansDefeated >= 1', reward: 500 },
  { id: 'all_leviathans', name: 'Abyss Conqueror', description: 'Defeat all 12 abyss leviathans.', condition: 'leviathansDefeated >= 12', reward: 5000 },
  { id: 'depth_500', name: 'Deep Explorer', description: 'Reach a depth of 500 meters.', condition: 'depth >= 500', reward: 300 },
  { id: 'depth_2000', name: 'Abyss Pioneer', description: 'Reach a depth of 2000 meters.', condition: 'depth >= 2000', reward: 1000 },
  { id: 'depth_3500', name: 'Bottom of the World', description: 'Reach the maximum depth of 3500 meters.', condition: 'depth >= 3500', reward: 2500 },
  { id: 'structure_builder_10', name: 'Abyss Architect', description: 'Build 10 different structures.', condition: 'uniqueStructures >= 10', reward: 400 },
  { id: 'material_hoarder', name: 'Material Hoarder', description: 'Accumulate 500 total materials.', condition: 'totalMaterials >= 500', reward: 600 },
  { id: 'all_zones', name: 'Zone Cartographer', description: 'Explore and complete dives in all 8 abyss zones.', condition: 'zonesExplored >= 8', reward: 800 },
  { id: 'level_30', name: 'Abyss Apex', description: 'Reach abyss level 30.', condition: 'abyssLevel >= 30', reward: 5000 },
];

// ─── CX_TITLES: 8 Titles ─────────────────────────────────────────────────────

const CX_TITLES: CxTitleDef[] = [
  { id: 0, name: 'Coral Diver', requiredLevel: 1 },
  { id: 1, name: 'Twilight Explorer', requiredLevel: 5 },
  { id: 2, name: 'Midnight Wanderer', requiredLevel: 10 },
  { id: 3, name: 'Bioluminescent Seeker', requiredLevel: 15 },
  { id: 4, name: 'Phantom Navigator', requiredLevel: 20 },
  { id: 5, name: 'Void Walker', requiredLevel: 25 },
  { id: 6, name: 'Leviathan Hunter', requiredLevel: 30 },
  { id: 7, name: 'Abyss Guardian', requiredLevel: 35 },
];

// ─── CX_SUBMARINES: 10 Exploration Submarines ───────────────────────────────

const CX_SUBMARINES: CxSubmarineDef[] = [
  { id: 'bubbles_mk1', name: 'Bubbles Mk.I', description: 'A basic two-person submersible with minimal depth capability. Perfect for beginners.', depthRating: 100, capacity: 5, unlockLevel: 1 },
  { id: 'nautilus_explorer', name: 'Nautilus Explorer', description: 'An upgraded sub with improved pressure hull and a small cargo hold.', depthRating: 300, capacity: 10, unlockLevel: 3 },
  { id: 'abyss_skimmer', name: 'Abyss Skimmer', description: 'A sleek sub designed for speed, skimming along the midnight zone with agility.', depthRating: 600, capacity: 8, unlockLevel: 6 },
  { id: 'deep_current', name: 'Deep Current', description: 'A heavy-duty research sub equipped with external lights and sampling arms.', depthRating: 1000, capacity: 15, unlockLevel: 10 },
  { id: 'phantom_dive', name: 'Phantom Diver', description: 'A stealth submarine coated in light-absorbing material, nearly invisible in the deep.', depthRating: 1500, capacity: 12, unlockLevel: 14 },
  { id: 'crystal_vanguard', name: 'Crystal Vanguard', description: 'Armored with crystalline plating harvested from the bioluminescent cavern.', depthRating: 2000, capacity: 20, unlockLevel: 18 },
  { id: 'void_penetrator', name: 'Void Penetrator', description: 'Equipped with a void crystal drill capable of boring through abyss rock.', depthRating: 2500, capacity: 18, unlockLevel: 22 },
  { id: 'leviathan_chaser', name: 'Leviathan Chaser', description: 'A military-grade combat submarine designed specifically for leviathan encounters.', depthRating: 3000, capacity: 25, unlockLevel: 26 },
  { id: 'genesis_seeker', name: 'Genesis Seeker', description: 'The ultimate exploration vessel, built from components of every previous model.', depthRating: 3500, capacity: 30, unlockLevel: 30 },
  { id: 'ocean_heart', name: 'Ocean Heart', description: 'A legendary submarine powered by the Ocean Heart gem, capable of any depth.', depthRating: 4000, capacity: 50, unlockLevel: 35 },
];

// ─── CX_LEVIATHANS: 12 Abyss Leviathans (Boss Creatures) ────────────────────

const CX_LEVIATHANS: CxLeviathanDef[] = [
  { id: 'watcher_depth', name: 'Watcher of the Depths', description: 'A colossal eye-like creature that sits motionless at the edge of the twilight zone, observing all who pass.', difficulty: 1, rewards: ['bioluminescent_essence', 'coral_shard', 'pearl_dust'] },
  { id: 'tidal_serpent', name: 'Tidal Serpent', description: 'A massive sea serpent that generates and controls localized tsunamis within the midnight garden.', difficulty: 2, rewards: ['reef_sanctuary', 'void_crystal', 'prism_scale'] },
  { id: 'crystal_mantis', name: 'Crystal Mantis Shrimp', description: 'A giant mantis shrimp whose club arms strike with the force of a bullet, shattering abyss crystals.', difficulty: 3, rewards: ['coral_shard', 'echo_stone', 'frost_venom'] },
  { id: 'garden_leviathan', name: 'Garden Leviathan', description: 'A mobile reef — a leviathan that carries an entire living ecosystem on its back.', difficulty: 4, rewards: ['world_tree_sap', 'algae_extract', 'kelp_fiber'] },
  { id: 'echo_whale', name: 'Echo Whale', description: 'A whale whose songs create permanent sonic structures in the water, reshaping the cavern.', difficulty: 5, rewards: ['echo_stone', 'soul_pearl', 'phantom_silk'] },
  { id: 'phantom_kraken', name: 'Phantom Kraken', description: 'A smaller but no less dangerous cousin of the Kraken Elder, haunting the phantom reef.', difficulty: 6, rewards: ['phantom_silk', 'void_crystal', 'leviathan_scale'] },
  { id: 'frost_colossus', name: 'Frost Colossus', description: 'An enormous crab-like creature encased in permanent ice, radiating a freezing aura.', difficulty: 7, rewards: ['frost_venom', 'abyssal_iron', 'abyssal_diamond'] },
  { id: 'void_sentinel', name: 'Void Sentinel', description: 'A construct of ancient origin standing guard at the entrance to the void sanctum.', difficulty: 8, rewards: ['void_heart_core', 'leviathan_scale', 'dream_essence'] },
  { id: 'pressure_titan', name: 'Pressure Titan', description: 'A being of living pressure that exists as a hyper-compressed sphere of water.', difficulty: 9, rewards: ['leviathan_scale', 'ocean_sovereign_tear', 'abyssal_diamond'] },
  { id: 'ancient_siren', name: 'Ancient Siren', description: 'The oldest void siren, her song has driven countless divers mad with its beauty.', difficulty: 10, rewards: ['dream_essence', 'ocean_sovereign_tear', 'world_tree_sap'] },
  { id: 'trench_wyrm_king', name: 'Trench Wyrm King', description: 'The king of all trench wyrms, burrowing through the earth\'s crust itself.', difficulty: 11, rewards: ['trench_dragon_breath', 'void_emperor_gem', 'genesis_seed'] },
  { id: 'abyssal_watcher', name: 'Abyssal Watcher', description: 'The final guardian of the deepest trench — a being that has witnessed the birth of oceans.', difficulty: 12, rewards: ['ocean_heart', 'kraken_ink', 'dream_whale_bone'] },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

const CX_MAX_LEVEL = 50;

function cxXpForLevel(level: number): number {
  if (level <= 0) {
    return 0;
  }
  if (level >= CX_MAX_LEVEL) {
    return Infinity;
  }
  return Math.floor(120 * level * (1 + level * 0.15));
}

function cxRarityMultiplier(rarity: CxRarity): number {
  const map: Record<CxRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  };
  return map[rarity] ?? 1;
}

function cxStructureUpgradeCost(baseCost: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(1.6, currentLevel));
}

function cxSubmarineCost(depthRating: number): number {
  return Math.floor(depthRating * 2.5);
}

function cxRepairCost(condition: number): number {
  return Math.floor((100 - condition) * 5);
}

function cxUpgradeSubCost(currentUpgrades: number): number {
  return Math.floor(200 * Math.pow(1.5, currentUpgrades));
}

function cxBiolumBonus(lightLevel: number): number {
  return Math.floor(lightLevel * 0.5);
}

function cxAddGoldForExp(exp: number): number {
  return Math.floor(exp * 0.3);
}

// ─── Default State Factory ────────────────────────────────────────────────────

function cxCreateDefaultState(): CxCoralAbyssState {
  const zones: Record<string, { unlocked: boolean; explored: boolean; dives: number }> = {};
  for (const zone of CX_ZONES) {
    zones[zone.id] = {
      unlocked: zone.unlockLevel === 1,
      explored: false,
      dives: 0,
    };
  }

  const achievements: Record<string, CxAchievementState> = {};
  for (const ach of CX_ACHIEVEMENTS) {
    achievements[ach.id] = {
      achievementId: ach.id,
      unlocked: false,
      unlockedAt: null,
    };
  }

  const leviathans: Record<string, CxLeviathanState> = {};
  for (const lev of CX_LEVIATHANS) {
    leviathans[lev.id] = {
      leviathanId: lev.id,
      defeated: false,
      defeatedAt: null,
      attempts: 0,
    };
  }

  return {
    zones,
    corals: {},
    creatures: {},
    materials: {
      reef_fragment: { materialId: 'reef_fragment', quantity: 5 },
      algae_extract: { materialId: 'algae_extract', quantity: 3 },
      sea_salt_crystal: { materialId: 'sea_salt_crystal', quantity: 2 },
    },
    structures: {},
    achievements,
    submarines: {},
    leviathans,
    currentTitle: 0,
    abyssLevel: 1,
    abyssExp: 0,
    gold: 200,
    bioEnergy: 100,
    depth: 0,
    totalDived: 0,
    totalCollected: 0,
    totalSubmarines: 0,
    activeZoneId: 'coral_terrace',
    activeLeviathanId: null,
    lightLevel: 1,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useCoralAbyss(initialState?: CxCoralAbyssState) {
  const [state, setState] = useState<CxCoralAbyssState>(initialState ?? cxCreateDefaultState());
  const stateRef = useRef(state);

  // stateRef sync via useEffect — NOT during render
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const cxAddExp = useCallback((amount: number) => {
    setState(prev => {
      let newLevel = prev.abyssLevel;
      let newExp = prev.abyssExp + amount;
      let maxXp = cxXpForLevel(prev.abyssLevel);
      let newTitle = prev.currentTitle;

      while (newExp >= maxXp && newLevel < CX_MAX_LEVEL) {
        newExp -= maxXp;
        newLevel += 1;
        maxXp = cxXpForLevel(newLevel);
      }

      if (newExp >= maxXp) {
        newExp = maxXp;
      }

      for (let i = CX_TITLES.length - 1; i >= 0; i--) {
        if (newLevel >= CX_TITLES[i].requiredLevel && i > newTitle) {
          newTitle = i;
          break;
        }
      }

      return {
        ...prev,
        abyssLevel: newLevel,
        abyssExp: newExp,
        currentTitle: newTitle,
        gold: prev.gold + cxAddGoldForExp(amount),
      };
    });
  }, []);

  const cxDiveZone = useCallback((zoneId: string): boolean => {
    let success = false;
    setState(prev => {
      const zone = prev.zones[zoneId];
      const zoneDef = CX_ZONES.find(z => z.id === zoneId);
      if (!zone || !zoneDef) return prev;
      if (!zone.unlocked) return prev;
      if (prev.bioEnergy < 10) return prev;

      success = true;
      return {
        ...prev,
        activeZoneId: zoneId,
        depth: Math.max(prev.depth, zoneDef.depth),
        bioEnergy: Math.max(0, prev.bioEnergy - 10),
        totalDived: prev.totalDived + 1,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zone, explored: true, dives: zone.dives + 1 },
        },
      };
    });
    if (success) {
      cxAddExp(15);
    }
    return success;
  }, [cxAddExp]);

  const cxCollectCoral = useCallback((coralId: string): boolean => {
    let success = false;
    setState(prev => {
      const coralDef = CX_CORALS.find(c => c.id === coralId);
      if (!coralDef) return prev;

      const existing = prev.corals[coralId];
      success = true;
      return {
        ...prev,
        corals: {
          ...prev.corals,
          [coralId]: {
            coralId,
            collectedAt: existing ? existing.collectedAt : Date.now(),
            quantity: (existing ? existing.quantity : 0) + 1,
          },
        },
        totalCollected: prev.totalCollected + 1,
      };
    });
    if (success) {
      cxAddExp(10);
    }
    return success;
  }, [cxAddExp]);

  const cxHarvestMaterial = useCallback((materialId: string): boolean => {
    let success = false;
    setState(prev => {
      const matDef = CX_MATERIALS.find(m => m.id === materialId);
      if (!matDef) return prev;

      const existing = prev.materials[materialId];
      success = true;
      return {
        ...prev,
        materials: {
          ...prev.materials,
          [materialId]: {
            materialId,
            quantity: (existing ? existing.quantity : 0) + 1,
          },
        },
        totalCollected: prev.totalCollected + 1,
      };
    });
    if (success) {
      cxAddExp(5);
    }
    return success;
  }, [cxAddExp]);

  const cxBuildStructure = useCallback((structureId: string): boolean => {
    let success = false;
    setState(prev => {
      const structDef = CX_STRUCTURES.find(s => s.id === structureId);
      if (!structDef) return prev;
      if (prev.structures[structureId]) return prev;
      if (prev.gold < structDef.baseCost) return prev;

      success = true;
      return {
        ...prev,
        gold: prev.gold - structDef.baseCost,
        structures: {
          ...prev.structures,
          [structureId]: {
            structureId,
            level: 1,
            builtAt: Date.now(),
          },
        },
      };
    });
    if (success) {
      cxAddExp(20);
    }
    return success;
  }, [cxAddExp]);

  const cxUpgradeStructure = useCallback((structureId: string): boolean => {
    let success = false;
    setState(prev => {
      const structDef = CX_STRUCTURES.find(s => s.id === structureId);
      const owned = prev.structures[structureId];
      if (!structDef || !owned) return prev;
      if (owned.level >= structDef.maxLevel) return prev;

      const cost = cxStructureUpgradeCost(structDef.baseCost, owned.level);
      if (prev.gold < cost) return prev;

      success = true;
      return {
        ...prev,
        gold: prev.gold - cost,
        structures: {
          ...prev.structures,
          [structureId]: { ...owned, level: owned.level + 1 },
        },
      };
    });
    if (success) {
      cxAddExp(25);
    }
    return success;
  }, [cxAddExp]);

  const cxBondCreature = useCallback((creatureId: string): boolean => {
    let success = false;
    setState(prev => {
      const creatureDef = CX_CREATURES.find(c => c.id === creatureId);
      if (!creatureDef) return prev;
      if (prev.creatures[creatureId]) return prev;
      if (prev.gold < Math.floor(50 * cxRarityMultiplier(creatureDef.rarity))) return prev;

      success = true;
      return {
        ...prev,
        gold: prev.gold - Math.floor(50 * cxRarityMultiplier(creatureDef.rarity)),
        creatures: {
          ...prev.creatures,
          [creatureId]: {
            creatureId,
            bondedAt: Date.now(),
            hp: creatureDef.hp,
            maxHp: creatureDef.hp,
          },
        },
      };
    });
    if (success) {
      cxAddExp(15);
    }
    return success;
  }, [cxAddExp]);

  const cxReleaseCreature = useCallback((creatureId: string): boolean => {
    let success = false;
    setState(prev => {
      if (!prev.creatures[creatureId]) return prev;
      success = true;
      const next = { ...prev.creatures };
      delete next[creatureId];
      return { ...prev, creatures: next };
    });
    return success;
  }, []);

  const cxLaunchSubmarine = useCallback((submarineId: string): boolean => {
    let success = false;
    setState(prev => {
      const sub = prev.submarines[submarineId];
      if (!sub) return prev;
      if (sub.launched) return prev;
      if (sub.condition < 50) return prev;

      success = true;
      return {
        ...prev,
        submarines: {
          ...prev.submarines,
          [submarineId]: {
            ...sub,
            launched: true,
            launchedAt: Date.now(),
            returnAt: Date.now() + 60000,
          },
        },
      };
    });
    return success;
  }, []);

  const cxReturnSubmarine = useCallback((submarineId: string): boolean => {
    let success = false;
    setState(prev => {
      const sub = prev.submarines[submarineId];
      if (!sub) return prev;
      if (!sub.launched) return prev;

      success = true;
      return {
        ...prev,
        submarines: {
          ...prev.submarines,
          [submarineId]: {
            ...sub,
            launched: false,
            launchedAt: null,
            returnAt: null,
            condition: Math.max(10, sub.condition - 15),
          },
        },
      };
    });
    if (success) {
      cxAddExp(30);
    }
    return success;
  }, [cxAddExp]);

  const cxFightLeviathan = useCallback((leviathanId: string): boolean => {
    let success = false;
    setState(prev => {
      const levState = prev.leviathans[leviathanId];
      const levDef = CX_LEVIATHANS.find(l => l.id === leviathanId);
      if (!levState || !levDef) return prev;
      if (levState.defeated) return prev;
      if (prev.bioEnergy < 30) return prev;

      success = true;
      const bondedCount = Object.keys(prev.creatures).length;
      const structureCount = Object.keys(prev.structures).length;
      const powerThreshold = levDef.difficulty * 5;
      const playerPower = bondedCount + structureCount + prev.abyssLevel;
      const defeated = playerPower >= powerThreshold;

      const updatedLeviathans = { ...prev.leviathans };
      updatedLeviathans[leviathanId] = {
        ...levState,
        defeated,
        defeatedAt: defeated ? Date.now() : null,
        attempts: levState.attempts + 1,
      };

      return {
        ...prev,
        bioEnergy: prev.bioEnergy - 30,
        activeLeviathanId: leviathanId,
        leviathans: updatedLeviathans,
      };
    });
    if (success) {
      cxAddExp(50);
    }
    return success;
  }, [cxAddExp]);

  const cxFleeLeviathan = useCallback((leviathanId: string): boolean => {
    let success = false;
    setState(prev => {
      const levState = prev.leviathans[leviathanId];
      if (!levState) return prev;
      if (prev.bioEnergy < 10) return prev;

      success = true;
      return {
        ...prev,
        bioEnergy: prev.bioEnergy - 10,
        activeLeviathanId: null,
      };
    });
    return success;
  }, []);

  const cxAdjustLight = useCallback((delta: number): void => {
    setState(prev => {
      const newLevel = Math.max(0, Math.min(10, prev.lightLevel + delta));
      return { ...prev, lightLevel: newLevel };
    });
  }, []);

  const cxPhotograph = useCallback((subjectId: string): boolean => {
    let success = false;
    setState(prev => {
      const coralExists = !!CX_CORALS.find(c => c.id === subjectId);
      const creatureExists = !!CX_CREATURES.find(c => c.id === subjectId);
      if (!coralExists && !creatureExists) return prev;

      success = true;
      return {
        ...prev,
        gold: prev.gold + 5,
      };
    });
    return success;
  }, []);

  const cxRestoreBioEnergy = useCallback((amount: number): void => {
    setState(prev => {
      return { ...prev, bioEnergy: Math.min(200, prev.bioEnergy + amount) };
    });
  }, []);

  const cxUnlockTitle = useCallback((titleId: number): boolean => {
    let success = false;
    setState(prev => {
      const title = CX_TITLES.find(t => t.id === titleId);
      if (!title) return prev;
      if (prev.abyssLevel < title.requiredLevel) return prev;

      success = true;
      return { ...prev, currentTitle: titleId };
    });
    return success;
  }, []);

  const cxClaimAchievement = useCallback((achievementId: string): boolean => {
    let success = false;
    let rewardAmount = 0;
    setState(prev => {
      const achState = prev.achievements[achievementId];
      const achDef = CX_ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achState || !achDef) return prev;
      if (achState.unlocked) return prev;

      success = true;
      rewardAmount = achDef.reward;
      return {
        ...prev,
        achievements: {
          ...prev.achievements,
          [achievementId]: {
            ...achState,
            unlocked: true,
            unlockedAt: Date.now(),
          },
        },
        gold: prev.gold + achDef.reward,
      };
    });
    if (success) {
      cxAddExp(rewardAmount);
    }
    return success;
  }, [cxAddExp]);

  const cxTradeMaterial = useCallback((giveId: string, giveQty: number, receiveId: string, receiveQty: number): boolean => {
    let success = false;
    setState(prev => {
      const giveMat = prev.materials[giveId];
      const recDef = CX_MATERIALS.find(m => m.id === receiveId);
      if (!giveMat) return prev;
      if (giveMat.quantity < giveQty) return prev;
      if (!recDef) return prev;

      success = true;
      const newGiveQty = giveMat.quantity - giveQty;
      const newMaterials = { ...prev.materials };
      if (newGiveQty <= 0) {
        delete newMaterials[giveId];
      } else {
        newMaterials[giveId] = { ...giveMat, quantity: newGiveQty };
      }

      const existingReceive = newMaterials[receiveId];
      if (existingReceive) {
        newMaterials[receiveId] = {
          ...existingReceive,
          quantity: existingReceive.quantity + receiveQty,
        };
      } else {
        newMaterials[receiveId] = { materialId: receiveId, quantity: receiveQty };
      }

      return { ...prev, materials: newMaterials };
    });
    return success;
  }, []);

  const cxRepairSubmarine = useCallback((submarineId: string): boolean => {
    let success = false;
    setState(prev => {
      const sub = prev.submarines[submarineId];
      if (!sub) return prev;
      if (sub.condition >= 100) return prev;

      const cost = cxRepairCost(sub.condition);
      if (prev.gold < cost) return prev;

      success = true;
      return {
        ...prev,
        gold: prev.gold - cost,
        submarines: {
          ...prev.submarines,
          [submarineId]: { ...sub, condition: 100 },
        },
      };
    });
    return success;
  }, []);

  const cxUpgradeSubmarine = useCallback((submarineId: string): boolean => {
    let success = false;
    setState(prev => {
      const sub = prev.submarines[submarineId];
      if (!sub) return prev;
      if (sub.upgrades >= 10) return prev;

      const cost = cxUpgradeSubCost(sub.upgrades);
      if (prev.gold < cost) return prev;

      success = true;
      return {
        ...prev,
        gold: prev.gold - cost,
        submarines: {
          ...prev.submarines,
          [submarineId]: { ...sub, upgrades: sub.upgrades + 1 },
        },
      };
    });
    return success;
  }, []);

  const cxBuySubmarine = useCallback((submarineId: string): boolean => {
    let success = false;
    setState(prev => {
      const subDef = CX_SUBMARINES.find(s => s.id === submarineId);
      if (!subDef) return prev;
      if (prev.submarines[submarineId]) return prev;
      if (prev.abyssLevel < subDef.unlockLevel) return prev;

      const cost = cxSubmarineCost(subDef.depthRating);
      if (prev.gold < cost) return prev;

      success = true;
      return {
        ...prev,
        gold: prev.gold - cost,
        totalSubmarines: prev.totalSubmarines + 1,
        submarines: {
          ...prev.submarines,
          [submarineId]: {
            submarineId,
            condition: 100,
            upgrades: 0,
            launched: false,
            launchedAt: null,
            returnAt: null,
          },
        },
      };
    });
    if (success) {
      cxAddExp(30);
    }
    return success;
  }, [cxAddExp]);

  const cxExploreDepth = useCallback((targetDepth: number): boolean => {
    let success = false;
    setState(prev => {
      if (targetDepth <= prev.depth) return prev;
      if (prev.bioEnergy < 5) return prev;

      success = true;
      return {
        ...prev,
        depth: targetDepth,
        bioEnergy: Math.max(0, prev.bioEnergy - 5),
      };
    });
    if (success) {
      cxAddExp(Math.floor(targetDepth / 50));
    }
    return success;
  }, [cxAddExp]);

  const cxSpendGold = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.gold < amount) return prev;
      success = true;
      return { ...prev, gold: prev.gold - amount };
    });
    return success;
  }, []);

  const cxSetDepth = useCallback((depth: number): void => {
    setState(prev => ({ ...prev, depth: Math.max(0, depth) }));
  }, []);

  const cxSetActiveZone = useCallback((zoneId: string): void => {
    setState(prev => ({ ...prev, activeZoneId: zoneId }));
  }, []);

  // ── Getters (useMemo [state]) ─────────────────────────────────────────────

  const cxGetZoneDetails = useMemo(() => {
    return CX_ZONES.map(zone => {
      const zoneState = state.zones[zone.id];
      return {
        ...zone,
        unlocked: zoneState?.unlocked ?? false,
        explored: zoneState?.explored ?? false,
        dives: zoneState?.dives ?? 0,
      };
    });
  }, [state]);

  const cxGetCoralCollection = useMemo(() => {
    const collection: Array<{
      def: CxCoralDef;
      collected: boolean;
      quantity: number;
    }> = [];
    for (const coralDef of CX_CORALS) {
      const owned = state.corals[coralDef.id];
      collection.push({
        def: coralDef,
        collected: !!owned,
        quantity: owned?.quantity ?? 0,
      });
    }
    return collection;
  }, [state]);

  const cxGetCreatureList = useMemo(() => {
    const list: Array<{
      def: CxCreatureDef;
      bonded: boolean;
      bondedAt: number | null;
      hp: number;
      maxHp: number;
    }> = [];
    for (const creatureDef of CX_CREATURES) {
      const bonded = state.creatures[creatureDef.id];
      list.push({
        def: creatureDef,
        bonded: !!bonded,
        bondedAt: bonded?.bondedAt ?? null,
        hp: bonded?.hp ?? 0,
        maxHp: bonded?.maxHp ?? creatureDef.hp,
      });
    }
    return list;
  }, [state]);

  const cxGetMaterialInventory = useMemo(() => {
    const inventory: Array<{
      def: CxMaterialDef;
      quantity: number;
    }> = [];
    for (const matDef of CX_MATERIALS) {
      const owned = state.materials[matDef.id];
      inventory.push({
        def: matDef,
        quantity: owned?.quantity ?? 0,
      });
    }
    return inventory;
  }, [state]);

  const cxGetStructureList = useMemo(() => {
    const list: Array<{
      def: CxStructureDef;
      owned: boolean;
      level: number;
      builtAt: number | null;
      upgradeCost: number;
    }> = [];
    for (const structDef of CX_STRUCTURES) {
      const owned = state.structures[structDef.id];
      list.push({
        def: structDef,
        owned: !!owned,
        level: owned?.level ?? 0,
        builtAt: owned?.builtAt ?? null,
        upgradeCost: owned
          ? cxStructureUpgradeCost(structDef.baseCost, owned.level)
          : structDef.baseCost,
      });
    }
    return list;
  }, [state]);

  const cxGetSubmarineFleet = useMemo(() => {
    const fleet: Array<{
      def: CxSubmarineDef;
      owned: boolean;
      condition: number;
      upgrades: number;
      launched: boolean;
      launchedAt: number | null;
      returnAt: number | null;
    }> = [];
    for (const subDef of CX_SUBMARINES) {
      const owned = state.submarines[subDef.id];
      fleet.push({
        def: subDef,
        owned: !!owned,
        condition: owned?.condition ?? 0,
        upgrades: owned?.upgrades ?? 0,
        launched: owned?.launched ?? false,
        launchedAt: owned?.launchedAt ?? null,
        returnAt: owned?.returnAt ?? null,
      });
    }
    return fleet;
  }, [state]);

  const cxGetTotalPower = useMemo(() => {
    const bondedCount = Object.keys(state.creatures).length;
    const structureLevels = Object.values(state.structures).reduce(
      (sum, s) => sum + s.level,
      0,
    );
    const creaturePower = Object.values(state.creatures).reduce(
      (sum, c) => sum + c.hp,
      0,
    );
    return bondedCount + structureLevels * 2 + Math.floor(creaturePower / 10) + state.abyssLevel;
  }, [state]);

  const cxGetDepthProgress = useMemo(() => {
    const maxDepth = 3500;
    const progress = maxDepth > 0 ? state.depth / maxDepth : 0;
    return {
      current: state.depth,
      max: maxDepth,
      progress: Math.min(1, progress),
      percentage: Math.min(100, Math.floor(progress * 100)),
    };
  }, [state]);

  const cxGetLeviathanStatus = useMemo(() => {
    const list: Array<{
      def: CxLeviathanDef;
      state: CxLeviathanState;
      canDefeat: boolean;
    }> = [];
    const playerPower = cxGetTotalPower;
    for (const levDef of CX_LEVIATHANS) {
      const levState = state.leviathans[levDef.id];
      const powerThreshold = levDef.difficulty * 5;
      list.push({
        def: levDef,
        state: levState ?? {
          leviathanId: levDef.id,
          defeated: false,
          defeatedAt: null,
          attempts: 0,
        },
        canDefeat: playerPower >= powerThreshold,
      });
    }
    return list;
  }, [state, cxGetTotalPower]);

  const { cxGetRaritySummary, cxGetNextTitle } = useMemo(() => {
    const coralsByRarity: Record<CxRarity, { total: number; collected: number }> = {
      common: { total: 0, collected: 0 },
      uncommon: { total: 0, collected: 0 },
      rare: { total: 0, collected: 0 },
      epic: { total: 0, collected: 0 },
      legendary: { total: 0, collected: 0 },
    };
    for (const coral of CX_CORALS) {
      coralsByRarity[coral.rarity].total += 1;
      if (state.corals[coral.id]) {
        coralsByRarity[coral.rarity].collected += 1;
      }
    }
    let nextTitle: { title: (typeof CX_TITLES)[number]; currentLevel: number; neededLevel: number; levelsAway: number };
    for (let i = 0; i < CX_TITLES.length; i++) {
      if (state.abyssLevel < CX_TITLES[i].requiredLevel) {
        nextTitle = {
          title: CX_TITLES[i],
          currentLevel: state.abyssLevel,
          neededLevel: CX_TITLES[i].requiredLevel,
          levelsAway: CX_TITLES[i].requiredLevel - state.abyssLevel,
        };
        break;
      }
    }
    if (!nextTitle) {
      nextTitle = {
        title: CX_TITLES[CX_TITLES.length - 1],
        currentLevel: state.abyssLevel,
        neededLevel: CX_TITLES[CX_TITLES.length - 1].requiredLevel,
        levelsAway: 0,
      };
    }
    return { cxGetRaritySummary: coralsByRarity, cxGetNextTitle: nextTitle };
  }, [state]);

  const cxGetUnlockedAchievements = useMemo(() => {
    const unlocked: Array<{
      def: CxAchievementDef;
      state: CxAchievementState;
    }> = [];
    for (const achDef of CX_ACHIEVEMENTS) {
      const achState = state.achievements[achDef.id];
      if (achState && achState.unlocked) {
        unlocked.push({ def: achDef, state: achState });
      }
    }
    return unlocked;
  }, [state]);

  const cxGetTitleProgress = useMemo(() => {
    return CX_TITLES.map(title => ({
      ...title,
      unlocked: state.abyssLevel >= title.requiredLevel,
      active: state.currentTitle === title.id,
    }));
  }, [state]);

  const cxGetActiveZone = useMemo(() => {
    const zoneDef = CX_ZONES.find(z => z.id === state.activeZoneId);
    const zoneState = state.zones[state.activeZoneId];
    return {
      def: zoneDef ?? CX_ZONES[0],
      state: zoneState ?? { unlocked: false, explored: false, dives: 0 },
    };
  }, [state]);

  const cxGetBioEnergyRate = useMemo(() => {
    const lightBonus = cxBiolumBonus(state.lightLevel);
    const structureBonus = Object.values(state.structures).reduce((sum, s) => {
      if (s.structureId === 'reef_sanctuary') {
        return sum + s.level * 2;
      }
      if (s.structureId === 'bio_reactor') {
        return sum + s.level * 3;
      }
      return sum;
    }, 0);
    return {
      base: 1,
      lightBonus,
      structureBonus,
      total: 1 + lightBonus + structureBonus,
      max: 200,
      current: state.bioEnergy,
      percentage: Math.floor((state.bioEnergy / 200) * 100),
    };
  }, [state]);

  // ── Extra Getters ──────────────────────────────────────────────────────────

  const cxGetCurrentTitle = useMemo(() => {
    return CX_TITLES.find(t => t.id === state.currentTitle) ?? CX_TITLES[0];
  }, [state]);

  const cxGetExpProgress = useMemo(() => {
    const maxXp = cxXpForLevel(state.abyssLevel);
    return {
      current: state.abyssExp,
      max: maxXp,
      progress: maxXp > 0 ? Math.min(1, state.abyssExp / maxXp) : 1,
      percentage: maxXp > 0 ? Math.min(100, Math.floor((state.abyssExp / maxXp) * 100)) : 100,
    };
  }, [state]);

  const cxGetActiveLeviathan = useMemo(() => {
    if (!state.activeLeviathanId) return null;
    const levDef = CX_LEVIATHANS.find(l => l.id === state.activeLeviathanId);
    const levState = state.leviathans[state.activeLeviathanId];
    if (!levDef || !levState) return null;
    return { def: levDef, state: levState };
  }, [state]);

  const cxGetLaunchedSubmarines = useMemo(() => {
    const launched: Array<{
      def: CxSubmarineDef;
      condition: number;
      launchedAt: number;
      returnAt: number;
    }> = [];
    for (const [subId, subState] of Object.entries(state.submarines)) {
      if (subState.launched && subState.launchedAt && subState.returnAt) {
        const subDef = CX_SUBMARINES.find(s => s.id === subId);
        if (subDef) {
          launched.push({
            def: subDef,
            condition: subState.condition,
            launchedAt: subState.launchedAt,
            returnAt: subState.returnAt,
          });
        }
      }
    }
    return launched;
  }, [state]);

  const cxGetSummary = useMemo(() => {
    const uniqueCorals = Object.keys(state.corals).length;
    const uniqueCreatures = Object.keys(state.creatures).length;
    const uniqueStructures = Object.keys(state.structures).length;
    const leviathansDefeated = Object.values(state.leviathans).filter(
      l => l.defeated,
    ).length;
    const zonesExplored = Object.values(state.zones).filter(
      z => z.explored,
    ).length;
    const totalMaterials = Object.values(state.materials).reduce(
      (sum, m) => sum + m.quantity,
      0,
    );

    return {
      abyssLevel: state.abyssLevel,
      currentTitle: cxGetCurrentTitle,
      gold: state.gold,
      bioEnergy: state.bioEnergy,
      depth: state.depth,
      lightLevel: state.lightLevel,
      totalPower: cxGetTotalPower,
      uniqueCorals,
      uniqueCreatures,
      uniqueStructures,
      totalSubmarines: state.totalSubmarines,
      leviathansDefeated,
      zonesExplored,
      totalDived: state.totalDived,
      totalCollected: state.totalCollected,
      totalMaterials,
      expProgress: cxGetExpProgress,
      depthProgress: cxGetDepthProgress,
      bioEnergyRate: cxGetBioEnergyRate,
      activeZone: cxGetActiveZone,
      activeLeviathan: cxGetActiveLeviathan,
    };
  }, [state, cxGetCurrentTitle, cxGetTotalPower, cxGetExpProgress, cxGetDepthProgress, cxGetBioEnergyRate, cxGetActiveZone, cxGetActiveLeviathan]);

  // ── Accessors (useCallback) ────────────────────────────────────────────────

  const cxGetState = useCallback((): Readonly<CxCoralAbyssState> => {
    return stateRef.current;
  }, []);

  const cxGetLevel = useCallback((): number => {
    return stateRef.current.abyssLevel;
  }, []);

  const cxGetExp = useCallback((): number => {
    return stateRef.current.abyssExp;
  }, []);

  const cxGetGold = useCallback((): number => {
    return stateRef.current.gold;
  }, []);

  const cxGetBioEnergy = useCallback((): number => {
    return stateRef.current.bioEnergy;
  }, []);

  const cxGetDepth = useCallback((): number => {
    return stateRef.current.depth;
  }, []);

  const cxGetLightLevel = useCallback((): number => {
    return stateRef.current.lightLevel;
  }, []);

  const cxGetTotalDived = useCallback((): number => {
    return stateRef.current.totalDived;
  }, []);

  const cxGetTotalCollected = useCallback((): number => {
    return stateRef.current.totalCollected;
  }, []);

  // ── Raw Data Accessors ─────────────────────────────────────────────────────

  const cxGetAllZones = useCallback((): CxZoneDef[] => {
    return [...CX_ZONES];
  }, []);

  const cxGetAllCorals = useCallback((): CxCoralDef[] => {
    return [...CX_CORALS];
  }, []);

  const cxGetAllCreatures = useCallback((): CxCreatureDef[] => {
    return [...CX_CREATURES];
  }, []);

  const cxGetAllMaterials = useCallback((): CxMaterialDef[] => {
    return [...CX_MATERIALS];
  }, []);

  const cxGetAllStructures = useCallback((): CxStructureDef[] => {
    return [...CX_STRUCTURES];
  }, []);

  const cxGetAllAbilities = useCallback((): CxAbilityDef[] => {
    return [...CX_ABILITIES];
  }, []);

  const cxGetAllAchievements = useCallback((): CxAchievementDef[] => {
    return [...CX_ACHIEVEMENTS];
  }, []);

  const cxGetAllTitles = useCallback((): CxTitleDef[] => {
    return [...CX_TITLES];
  }, []);

  const cxGetAllSubmarines = useCallback((): CxSubmarineDef[] => {
    return [...CX_SUBMARINES];
  }, []);

  const cxGetAllLeviathans = useCallback((): CxLeviathanDef[] => {
    return [...CX_LEVIATHANS];
  }, []);

  const cxGetZoneById = useCallback((id: string): CxZoneDef | undefined => {
    return CX_ZONES.find(z => z.id === id);
  }, []);

  const cxGetCoralById = useCallback((id: string): CxCoralDef | undefined => {
    return CX_CORALS.find(c => c.id === id);
  }, []);

  const cxGetCreatureById = useCallback((id: string): CxCreatureDef | undefined => {
    return CX_CREATURES.find(c => c.id === id);
  }, []);

  const cxGetMaterialById = useCallback((id: string): CxMaterialDef | undefined => {
    return CX_MATERIALS.find(m => m.id === id);
  }, []);

  const cxGetStructureById = useCallback((id: string): CxStructureDef | undefined => {
    return CX_STRUCTURES.find(s => s.id === id);
  }, []);

  const cxGetAbilityById = useCallback((id: string): CxAbilityDef | undefined => {
    return CX_ABILITIES.find(a => a.id === id);
  }, []);

  const cxGetSubmarineById = useCallback((id: string): CxSubmarineDef | undefined => {
    return CX_SUBMARINES.find(s => s.id === id);
  }, []);

  const cxGetLeviathanById = useCallback((id: string): CxLeviathanDef | undefined => {
    return CX_LEVIATHANS.find(l => l.id === id);
  }, []);

  const cxGetCoralsByRarity = useCallback((rarity: CxRarity): CxCoralDef[] => {
    return CX_CORALS.filter(c => c.rarity === rarity);
  }, []);

  const cxGetCreaturesByRarity = useCallback((rarity: CxRarity): CxCreatureDef[] => {
    return CX_CREATURES.filter(c => c.rarity === rarity);
  }, []);

  const cxGetCreaturesByHabitat = useCallback((habitat: CxCreatureHabitat): CxCreatureDef[] => {
    return CX_CREATURES.filter(c => c.habitat === habitat);
  }, []);

  const cxGetBioluminescentCorals = useCallback((): CxCoralDef[] => {
    return CX_CORALS.filter(c => c.bioluminescence);
  }, []);

  const cxGetBioluminescentCreatures = useCallback((): CxCreatureDef[] => {
    return CX_CREATURES.filter(c => {
      const hasBioAbility = c.abilities.some(a => a.toLowerCase().includes('bio') || a.toLowerCase().includes('lum'));
      return hasBioAbility;
    });
  }, []);

  const cxGetMaterialsByRarity = useCallback((rarity: CxRarity): CxMaterialDef[] => {
    return CX_MATERIALS.filter(m => m.rarity === rarity);
  }, []);

  const cxGetMaterialsBySource = useCallback((source: CxMaterialSource): CxMaterialDef[] => {
    return CX_MATERIALS.filter(m => m.source === source);
  }, []);

  const cxGetUnlockedZones = useCallback((): CxZoneDef[] => {
    const s = stateRef.current;
    return CX_ZONES.filter(z => s.zones[z.id]?.unlocked ?? false);
  }, []);

  const cxGetLockedZones = useCallback((): CxZoneDef[] => {
    const s = stateRef.current;
    return CX_ZONES.filter(z => !(s.zones[z.id]?.unlocked ?? false));
  }, []);

  const cxIsZoneUnlocked = useCallback((zoneId: string): boolean => {
    const s = stateRef.current;
    return s.zones[zoneId]?.unlocked ?? false;
  }, []);

  const cxIsCoralCollected = useCallback((coralId: string): boolean => {
    const s = stateRef.current;
    return !!s.corals[coralId];
  }, []);

  const cxIsCreatureBonded = useCallback((creatureId: string): boolean => {
    const s = stateRef.current;
    return !!s.creatures[creatureId];
  }, []);

  const cxIsStructureBuilt = useCallback((structureId: string): boolean => {
    const s = stateRef.current;
    return !!s.structures[structureId];
  }, []);

  const cxIsSubmarineOwned = useCallback((submarineId: string): boolean => {
    const s = stateRef.current;
    return !!s.submarines[submarineId];
  }, []);

  const cxIsLeviathanDefeated = useCallback((leviathanId: string): boolean => {
    const s = stateRef.current;
    return s.leviathans[leviathanId]?.defeated ?? false;
  }, []);

  const cxIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const s = stateRef.current;
    return s.achievements[achievementId]?.unlocked ?? false;
  }, []);

  const cxGetMaterialCount = useCallback((materialId: string): number => {
    const s = stateRef.current;
    return s.materials[materialId]?.quantity ?? 0;
  }, []);

  const cxGetStructureLevel = useCallback((structureId: string): number => {
    const s = stateRef.current;
    return s.structures[structureId]?.level ?? 0;
  }, []);

  const cxGetCoralQuantity = useCallback((coralId: string): number => {
    const s = stateRef.current;
    return s.corals[coralId]?.quantity ?? 0;
  }, []);

  const cxGetCreatureHp = useCallback((creatureId: string): { hp: number; maxHp: number } => {
    const s = stateRef.current;
    const bonded = s.creatures[creatureId];
    if (!bonded) return { hp: 0, maxHp: 0 };
    return { hp: bonded.hp, maxHp: bonded.maxHp };
  }, []);

  // ── Creature Abilities Lookup ───────────────────────────────────────────────

  const cxGetCreatureAbilities = useCallback((creatureId: string): string[] => {
    const def = CX_CREATURES.find(c => c.id === creatureId);
    if (!def) return [];
    return [...def.abilities];
  }, []);

  const cxGetAbilityPower = useCallback((abilityId: string): number => {
    const def = CX_ABILITIES.find(a => a.id === abilityId);
    if (!def) return 0;
    return def.power;
  }, []);

  const cxGetAbilityCooldown = useCallback((abilityId: string): number => {
    const def = CX_ABILITIES.find(a => a.id === abilityId);
    if (!def) return 0;
    return def.cooldown;
  }, []);

  const cxGetCreaturePower = useCallback((creatureId: string): number => {
    const def = CX_CREATURES.find(c => c.id === creatureId);
    if (!def) return 0;
    const rarityBonus = cxRarityMultiplier(def.rarity);
    return Math.floor((def.hp + def.attack * 2) * rarityBonus);
  }, []);

  const cxGetLeviathanRewards = useCallback((leviathanId: string): CxMaterialDef[] => {
    const levDef = CX_LEVIATHANS.find(l => l.id === leviathanId);
    if (!levDef) return [];
    const rewards: CxMaterialDef[] = [];
    for (const rewardId of levDef.rewards) {
      const matDef = CX_MATERIALS.find(m => m.id === rewardId);
      if (matDef) {
        rewards.push(matDef);
      }
    }
    return rewards;
  }, []);

  // ── Creature Type Filters ──────────────────────────────────────────────────

  const cxGetCoralsByType = useCallback((type: CxCoralType): CxCoralDef[] => {
    return CX_CORALS.filter(c => c.type === type);
  }, []);

  const cxGetHostileCreatures = useCallback((): CxCreatureDef[] => {
    return CX_CREATURES.filter(c => c.attack > c.hp);
  }, []);

  const cxGetTankyCreatures = useCallback((): CxCreatureDef[] => {
    return CX_CREATURES.filter(c => c.hp >= 100);
  }, []);

  const cxGetGlassCannons = useCallback((): CxCreatureDef[] => {
    return CX_CREATURES.filter(c => c.attack > 20 && c.hp < 100);
  }, []);

  const cxGetCollectibleMaterials = useCallback((): CxMaterialDef[] => {
    return CX_MATERIALS.filter(m => m.source === 'harvest');
  }, []);

  const cxGetCreatureDropMaterials = useCallback((): CxMaterialDef[] => {
    return CX_MATERIALS.filter(m => m.source === 'creature_drop');
  }, []);

  const cxGetLeviathanRewardMaterials = useCallback((): CxMaterialDef[] => {
    return CX_MATERIALS.filter(m => m.source === 'leviathan_reward');
  }, []);

  const cxGetStructureOutputMaterials = useCallback((): CxMaterialDef[] => {
    return CX_MATERIALS.filter(m => m.source === 'structure_output');
  }, []);

  // ── Additional useMemo Getters ─────────────────────────────────────────────

  const cxGetCompletionStats = useMemo(() => {
    const totalCoralTypes = CX_CORALS.length;
    const collectedCoralTypes = Object.keys(state.corals).length;
    const totalCreatureTypes = CX_CREATURES.length;
    const bondedCreatureTypes = Object.keys(state.creatures).length;
    const totalStructureTypes = CX_STRUCTURES.length;
    const builtStructureTypes = Object.keys(state.structures).length;
    const totalSubmarineTypes = CX_SUBMARINES.length;
    const ownedSubmarineTypes = Object.keys(state.submarines).length;
    const totalLeviathanTypes = CX_LEVIATHANS.length;
    const defeatedLeviathanTypes = Object.values(state.leviathans).filter(l => l.defeated).length;
    const totalAchievementTypes = CX_ACHIEVEMENTS.length;
    const unlockedAchievementTypes = Object.values(state.achievements).filter(a => a.unlocked).length;
    const totalZoneTypes = CX_ZONES.length;
    const exploredZoneTypes = Object.values(state.zones).filter(z => z.explored).length;

    return {
      corals: { total: totalCoralTypes, completed: collectedCoralTypes, percentage: Math.floor((collectedCoralTypes / totalCoralTypes) * 100) },
      creatures: { total: totalCreatureTypes, completed: bondedCreatureTypes, percentage: Math.floor((bondedCreatureTypes / totalCreatureTypes) * 100) },
      structures: { total: totalStructureTypes, completed: builtStructureTypes, percentage: Math.floor((builtStructureTypes / totalStructureTypes) * 100) },
      submarines: { total: totalSubmarineTypes, completed: ownedSubmarineTypes, percentage: Math.floor((ownedSubmarineTypes / totalSubmarineTypes) * 100) },
      leviathans: { total: totalLeviathanTypes, completed: defeatedLeviathanTypes, percentage: Math.floor((defeatedLeviathanTypes / totalLeviathanTypes) * 100) },
      achievements: { total: totalAchievementTypes, completed: unlockedAchievementTypes, percentage: Math.floor((unlockedAchievementTypes / totalAchievementTypes) * 100) },
      zones: { total: totalZoneTypes, completed: exploredZoneTypes, percentage: Math.floor((exploredZoneTypes / totalZoneTypes) * 100) },
      overall: {
        total: totalCoralTypes + totalCreatureTypes + totalStructureTypes + totalLeviathanTypes + totalAchievementTypes + totalZoneTypes,
        completed: collectedCoralTypes + bondedCreatureTypes + builtStructureTypes + defeatedLeviathanTypes + unlockedAchievementTypes + exploredZoneTypes,
      },
    };
  }, [state]);

  const cxGetTopCreatures = useMemo(() => {
    const bondedEntries = Object.entries(state.creatures).map(([id, bonded]) => {
      const def = CX_CREATURES.find(c => c.id === id);
      if (!def) return null;
      const power = cxGetCreaturePower(id);
      return { def, bonded, power };
    }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    bondedEntries.sort((a, b) => b.power - a.power);
    return bondedEntries.slice(0, 5);
  }, [state]);

  const cxGetWealthSummary = useMemo(() => {
    const totalMaterialValue = Object.entries(state.materials).reduce((sum, [matId, inv]) => {
      const def = CX_MATERIALS.find(m => m.id === matId);
      if (!def) return sum;
      const rarityMult = cxRarityMultiplier(def.rarity);
      return sum + inv.quantity * rarityMult * 10;
    }, 0);
    const structureValue = Object.entries(state.structures).reduce((sum, [structId, owned]) => {
      const def = CX_STRUCTURES.find(s => s.id === structId);
      if (!def) return sum;
      return sum + def.baseCost * owned.level;
    }, 0);
    const submarineValue = Object.entries(state.submarines).reduce((sum, [subId, owned]) => {
      const def = CX_SUBMARINES.find(s => s.id === subId);
      if (!def) return sum;
      return sum + cxSubmarineCost(def.depthRating) + owned.upgrades * 100;
    }, 0);
    return {
      gold: state.gold,
      totalMaterialValue,
      structureValue,
      submarineValue,
      estimatedNetWorth: state.gold + totalMaterialValue + structureValue + submarineValue,
    };
  }, [state]);

  const cxGetCoralTypeBreakdown = useMemo(() => {
    const types: Record<CxCoralType, { total: number; collected: number; names: string[] }> = {
      branching: { total: 0, collected: 0, names: [] },
      massive: { total: 0, collected: 0, names: [] },
      plate: { total: 0, collected: 0, names: [] },
      soft: { total: 0, collected: 0, names: [] },
      encrusting: { total: 0, collected: 0, names: [] },
      fan: { total: 0, collected: 0, names: [] },
      solitary: { total: 0, collected: 0, names: [] },
    };
    for (const coral of CX_CORALS) {
      types[coral.type].total += 1;
      types[coral.type].names.push(coral.name);
      if (state.corals[coral.id]) {
        types[coral.type].collected += 1;
      }
    }
    return types;
  }, [state]);

  const cxGetHabitatBreakdown = useMemo(() => {
    const habitats: Record<CxCreatureHabitat, { total: number; bonded: number; names: string[] }> = {
      coral_terrace: { total: 0, bonded: 0, names: [] },
      twilight_grotto: { total: 0, bonded: 0, names: [] },
      midnight_garden: { total: 0, bonded: 0, names: [] },
      biolum_cavern: { total: 0, bonded: 0, names: [] },
      phantom_reef: { total: 0, bonded: 0, names: [] },
      void_sanctum: { total: 0, bonded: 0, names: [] },
      pressure_rift: { total: 0, bonded: 0, names: [] },
      abyssal_trench: { total: 0, bonded: 0, names: [] },
    };
    for (const creature of CX_CREATURES) {
      habitats[creature.habitat].total += 1;
      habitats[creature.habitat].names.push(creature.name);
      if (state.creatures[creature.id]) {
        habitats[creature.habitat].bonded += 1;
      }
    }
    return habitats;
  }, [state]);

  // ── Computed Utilities ─────────────────────────────────────────────────────

  const cxCanAfford = useCallback((cost: number): boolean => {
    return stateRef.current.gold >= cost;
  }, []);

  const cxCanDive = useCallback((zoneId: string): boolean => {
    const s = stateRef.current;
    const zone = s.zones[zoneId];
    if (!zone || !zone.unlocked) return false;
    if (s.bioEnergy < 10) return false;
    return true;
  }, []);

  const cxCanFightLeviathan = useCallback((leviathanId: string): boolean => {
    const s = stateRef.current;
    const levDef = CX_LEVIATHANS.find(l => l.id === leviathanId);
    if (!levDef) return false;
    if (s.leviathans[leviathanId]?.defeated) return false;
    if (s.bioEnergy < 30) return false;
    return true;
  }, []);

  const cxCanLaunchSubmarine = useCallback((submarineId: string): boolean => {
    const s = stateRef.current;
    const sub = s.submarines[submarineId];
    if (!sub) return false;
    if (sub.launched) return false;
    if (sub.condition < 50) return false;
    return true;
  }, []);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const cxReset = useCallback((): void => {
    setState(cxCreateDefaultState());
  }, []);

  // ── Return API ─────────────────────────────────────────────────────────────

  const cxAPI = {
    // State accessors
    cxGetState,
    cxGetLevel,
    cxGetExp,
    cxGetGold,
    cxGetBioEnergy,
    cxGetDepth,
    cxGetLightLevel,
    cxGetTotalDived,
    cxGetTotalCollected,

    // Actions
    cxDiveZone,
    cxCollectCoral,
    cxHarvestMaterial,
    cxBuildStructure,
    cxUpgradeStructure,
    cxBondCreature,
    cxReleaseCreature,
    cxLaunchSubmarine,
    cxReturnSubmarine,
    cxFightLeviathan,
    cxFleeLeviathan,
    cxAdjustLight,
    cxPhotograph,
    cxRestoreBioEnergy,
    cxUnlockTitle,
    cxClaimAchievement,
    cxTradeMaterial,
    cxRepairSubmarine,
    cxUpgradeSubmarine,
    cxBuySubmarine,
    cxExploreDepth,
    cxSpendGold,
    cxSetDepth,
    cxSetActiveZone,
    cxReset,

    // Getters (useMemo)
    cxGetZoneDetails,
    cxGetCoralCollection,
    cxGetCreatureList,
    cxGetMaterialInventory,
    cxGetStructureList,
    cxGetSubmarineFleet,
    cxGetTotalPower,
    cxGetDepthProgress,
    cxGetLeviathanStatus,
    cxGetNextTitle,
    cxGetRaritySummary,
    cxGetUnlockedAchievements,
    cxGetTitleProgress,
    cxGetActiveZone,
    cxGetBioEnergyRate,
    cxGetCurrentTitle,
    cxGetExpProgress,
    cxGetActiveLeviathan,
    cxGetLaunchedSubmarines,
    cxGetSummary,

    // Raw data accessors
    cxGetAllZones,
    cxGetAllCorals,
    cxGetAllCreatures,
    cxGetAllMaterials,
    cxGetAllStructures,
    cxGetAllAbilities,
    cxGetAllAchievements,
    cxGetAllTitles,
    cxGetAllSubmarines,
    cxGetAllLeviathans,

    // Lookup accessors
    cxGetZoneById,
    cxGetCoralById,
    cxGetCreatureById,
    cxGetMaterialById,
    cxGetStructureById,
    cxGetAbilityById,
    cxGetSubmarineById,
    cxGetLeviathanById,

    // Filtered accessors
    cxGetCoralsByRarity,
    cxGetCreaturesByRarity,
    cxGetCreaturesByHabitat,
    cxGetBioluminescentCorals,
    cxGetBioluminescentCreatures,
    cxGetMaterialsByRarity,
    cxGetMaterialsBySource,
    cxGetUnlockedZones,
    cxGetLockedZones,

    // Boolean checks
    cxIsZoneUnlocked,
    cxIsCoralCollected,
    cxIsCreatureBonded,
    cxIsStructureBuilt,
    cxIsSubmarineOwned,
    cxIsLeviathanDefeated,
    cxIsAchievementUnlocked,
    cxCanAfford,
    cxCanDive,
    cxCanFightLeviathan,
    cxCanLaunchSubmarine,

    // Quantity accessors
    cxGetMaterialCount,
    cxGetStructureLevel,
    cxGetCoralQuantity,
    cxGetCreatureHp,

    // Creature ability accessors
    cxGetCreatureAbilities,
    cxGetAbilityPower,
    cxGetAbilityCooldown,
    cxGetCreaturePower,
    cxGetLeviathanRewards,

    // Extended filtered accessors
    cxGetCoralsByType,
    cxGetHostileCreatures,
    cxGetTankyCreatures,
    cxGetGlassCannons,
    cxGetCollectibleMaterials,
    cxGetCreatureDropMaterials,
    cxGetLeviathanRewardMaterials,
    cxGetStructureOutputMaterials,

    // Extended useMemo getters
    cxGetCompletionStats,
    cxGetTopCreatures,
    cxGetWealthSummary,
    cxGetCoralTypeBreakdown,
    cxGetHabitatBreakdown,
  };

  return cxAPI;
}
