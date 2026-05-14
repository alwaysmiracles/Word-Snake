// =============================================================================
// moon-pool-wire.ts — Moon Pool (月池) Game System Wire
// A moon-pool themed module for Word Snake game. Provides game data and a
// Zustand-based hook for managing pool creatures, lunar materials, structures,
// abilities, achievements, titles, legendary artifacts, and tide events.
// =============================================================================

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// Types & Interfaces
// =============================================================================

export type MPRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type MPSpeciesType =
  | 'moon_jelly'
  | 'lunar_fish'
  | 'silver_frog'
  | 'tide_serpent'
  | 'night_heron'
  | 'star_crab'
  | 'depth_nymph';

export type MPPoolBiome =
  | 'freshwater'
  | 'saltwater'
  | 'brackish'
  | 'enchanted'
  | 'subterranean'
  | 'celestial'
  | 'abyssal'
  | 'dream';

export type MPStructureCategory =
  | 'pool'
  | 'lab'
  | 'garden'
  | 'tower'
  | 'shrine'
  | 'forge'
  | 'harbor'
  | 'archive';

export type MPAbilitySchool =
  | 'lunar'
  | 'tidal'
  | 'silver'
  | 'shadow'
  | 'dream'
  | 'crystal';

export type MPEventType =
  | 'eclipse'
  | 'supermoon'
  | 'tide_surge'
  | 'meteor_shower'
  | 'aurora'
  | 'blood_moon'
  | 'harvest'
  | 'spirit_night'
  | 'crystal_bloom'
  | 'frost_tide'
  | 'revelation'
  | 'convergence';

export interface MPSpeciesDef {
  id: MPSpeciesType;
  name: string;
  nameZh: string;
  description: string;
  basePower: number;
  passiveAbility: string;
  color: string;
}

export interface MPCreatureDef {
  id: string;
  name: string;
  nameZh: string;
  species: MPSpeciesType;
  rarity: MPRarity;
  power: number;
  hp: number;
  description: string;
  abilities: string[];
  habitat: string;
  preferredPool: string;
}

export interface MPPoolDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  biome: MPPoolBiome;
  depth: number;
  unlockLevel: number;
  creatureCapacity: number;
  materials: string[];
  color: string;
}

export interface MPMaterialDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: MPRarity;
  description: string;
  source: string;
  value: number;
  stackLimit: number;
}

export interface MPStructureDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  category: MPStructureCategory;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  bonusPerLevel: string;
}

export interface MPStructureInstance {
  defId: string;
  level: number;
  builtAt: number;
  lastUpgrade: number;
}

export interface MPAbilityDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  school: MPAbilitySchool;
  cooldown: number;
  power: number;
  lunarCost: number;
  requires: string | null;
}

export interface MPAchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardEnergy: number;
  rewardExp: number;
  rewardTitle: string | null;
}

export interface MPTitleDef {
  id: string;
  name: string;
  nameZh: string;
  levelRequired: number;
  description: string;
  bonus: string;
}

export interface MPArtifactDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  rarity: MPRarity;
  power: number;
  lore: string;
  effect: string;
}

export interface MPEventDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  type: MPEventType;
  duration: number;
  energyBonus: number;
  dropBonus: number;
  requirements: { key: string; value: number }[];
  rewards: { energy: number; material: string; quantity: number }[];
}

export interface MPCapturedCreature {
  creatureId: string;
  capturedAt: number;
  nickname: string | null;
  bondLevel: number;
  poolId: string;
}

export interface MPMaterialInventory {
  materialId: string;
  quantity: number;
}

export interface MPAchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface MPEventState {
  eventId: string;
  active: boolean;
  startedAt: number | null;
  expiresAt: number | null;
}

export interface MPArtifactState {
  artifactId: string;
  discovered: boolean;
  discoveredAt: number | null;
  equipped: boolean;
}

export interface MPMoonPoolState {
  mpLevel: number;
  mpExp: number;
  mpLunarEnergy: number;
  mpTotalEnergy: number;
  mpMoonPhase: string;
  mpMoonPhaseIndex: number;
  mpCapturedCreatures: MPCapturedCreature[];
  mpMaterials: MPMaterialInventory[];
  mpStructures: MPStructureInstance[];
  mpAchievements: MPAchievementState[];
  mpCurrentTitle: string;
  mpUnlockedTitles: string[];
  mpArtifacts: MPArtifactState[];
  mpActiveEvents: MPEventState[];
  mpTotalDives: number;
  mpTotalBrews: number;
  mpTotalMoonlightDrawn: number;
  mpTotalTidesSummoned: number;
  mpTotalCreaturesCaptured: number;
  mpTotalStructuresBuilt: number;
  mpActivePoolId: string;
  mpDayCounter: number;
}

export interface MPMoonPoolActions {
  mpSetMoonPhase: (phase: string, index: number) => void;
  mpAdvanceDay: () => void;
  mpAddEnergy: (amount: number) => void;
  mpSpendEnergy: (amount: number) => boolean;
  mpAddExp: (amount: number) => void;
  mpCaptureCreature: (creatureId: string, poolId: string) => boolean;
  mpReleaseCreature: (captureIndex: number) => boolean;
  mpBondCreature: (captureIndex: number) => boolean;
  mpAddMaterial: (materialId: string, quantity: number) => void;
  mpRemoveMaterial: (materialId: string, quantity: number) => boolean;
  mpBuildStructure: (structDefId: string) => boolean;
  mpUpgradeStructure: (structDefId: string) => boolean;
  mpUnlockAchievement: (achievementId: string) => boolean;
  mpEquipTitle: (titleId: string) => boolean;
  mpDiscoverArtifact: (artifactId: string) => boolean;
  mpEquipArtifact: (artifactId: string) => boolean;
  mpUnequipArtifact: (artifactId: string) => void;
  mpStartEvent: (eventId: string) => boolean;
  mpEndEvent: (eventId: string) => void;
  mpSetActivePool: (poolId: string) => void;
  mpIncrementStat: (stat: 'mpTotalDives' | 'mpTotalBrews' | 'mpTotalMoonlightDrawn' | 'mpTotalTidesSummoned') => void;
  mpResetProgress: () => void;
}

// =============================================================================
// Color Constants
// =============================================================================

export const MP_COLOR_MOONLIGHT_SILVER = '#C0C0C0';
export const MP_COLOR_POOL_BLUE = '#4169E1';
export const MP_COLOR_LUNAR_GOLD = '#FFD700';
export const MP_COLOR_NIGHT_INDIGO = '#191970';
export const MP_COLOR_DEEP_LUNAR = '#2C1654';
export const MP_COLOR_STARLIGHT = '#FFFACD';
export const MP_COLOR_SHADOW_POOL = '#0A0A2E';
export const MP_COLOR_CRYSTAL_AZURE = '#00CED1';
export const MP_COLOR_ABYSS_BLACK = '#050510';
export const MP_COLOR_ECLIPSE_RED = '#8B0000';

// =============================================================================
// MP_SPECIES — 7 Moon Pool Species
// =============================================================================

export const MP_SPECIES: MPSpeciesDef[] = [
  {
    id: 'moon_jelly',
    name: 'Moon Jelly',
    nameZh: '月水母',
    description: 'Translucent jellyfish that pulse with captured moonlight, drifting through pool waters in hypnotic patterns. Their tentacles trail silver threads that heal and purify.',
    basePower: 8,
    passiveAbility: 'Moonlight Aura — heals nearby creatures by 2 HP per turn',
    color: '#E8E8F8',
  },
  {
    id: 'lunar_fish',
    name: 'Lunar Fish',
    nameZh: '月鱼',
    description: 'Scales that shimmer like the lunar surface, these fish swim in synchronized circles that mirror the moon phases. Their fins glow with soft blue light.',
    basePower: 10,
    passiveAbility: 'Phase Sync — power increases by 20% during full moon',
    color: '#7EC8E3',
  },
  {
    id: 'silver_frog',
    name: 'Silver Frog',
    nameZh: '银蛙',
    description: 'Amphibians with metallic silver skin that croak harmonic frequencies attuned to lunar tides. Their leap distance increases under moonlight.',
    basePower: 9,
    passiveAbility: 'Tide Leap — can escape any battle with 50% chance',
    color: '#D0D0D8',
  },
  {
    id: 'tide_serpent',
    name: 'Tide Serpent',
    nameZh: '潮蛇',
    description: 'Long sinuous water snakes that move with the rhythm of ocean tides. Their scales contain captured tidal energy that can be released in devastating bursts.',
    basePower: 14,
    passiveAbility: 'Tidal Force — attacks deal splash damage to adjacent enemies',
    color: '#4169E1',
  },
  {
    id: 'night_heron',
    name: 'Night Heron',
    nameZh: '夜鹭',
    description: 'Tall wading birds that hunt exclusively by moonlight, their eyes capable of seeing the invisible currents of lunar energy that flow through pool water.',
    basePower: 11,
    passiveAbility: 'Lunar Sight — reveals hidden items and creatures within pools',
    color: '#4B0082',
  },
  {
    id: 'star_crab',
    name: 'Star Crab',
    nameZh: '星蟹',
    description: 'Crustaceans whose shells are covered in bioluminescent patterns resembling constellations. They retreat into their shells to emit protective star barriers.',
    basePower: 12,
    passiveAbility: 'Star Shield — reduces incoming damage by 30% when defending',
    color: '#FFD700',
  },
  {
    id: 'depth_nymph',
    name: 'Depth Nymph',
    nameZh: '深水精灵',
    description: 'Ethereal water spirits dwelling in the deepest parts of moon pools. They sing songs that reshape the pool environment and enchant all creatures within.',
    basePower: 16,
    passiveAbility: 'Siren Song — charms hostile creatures for 1 turn',
    color: '#DDA0DD',
  },
];

// =============================================================================
// MP_CREATURES — 35 Moon Creatures (5 Rarity Tiers × 7 per Tier)
// =============================================================================

export const MP_CREATURES: MPCreatureDef[] = [
  // ─── Common (7) ──────────────────────────────────────────────────────────
  {
    id: 'mp_crescent_jelly',
    name: 'Crescent Jelly',
    nameZh: '新月水母',
    species: 'moon_jelly',
    rarity: 'common',
    power: 5,
    hp: 20,
    description: 'A small jellyfish with a crescent-shaped bell that glows faintly in moonlight. Often found drifting in shallow pools during the waxing phase.',
    abilities: ['gentle_pulse', 'bioluminescent_glow'],
    habitat: 'shallow_pool',
    preferredPool: 'crescent_basin',
  },
  {
    id: 'mp_minnow_glimmer',
    name: 'Glimmer Minnow',
    nameZh: '微光小鱼',
    species: 'lunar_fish',
    rarity: 'common',
    power: 6,
    hp: 15,
    description: 'Tiny silver fish that travel in large schools, creating shimmering patterns on the pool surface when they swim near the moonlit surface.',
    abilities: ['school_flash', 'quick_dart'],
    habitat: 'surface_layer',
    preferredPool: 'silver_mirror_pool',
  },
  {
    id: 'mp_pebble_frog',
    name: 'Pebble Frog',
    nameZh: '卵石蛙',
    species: 'silver_frog',
    rarity: 'common',
    power: 4,
    hp: 25,
    description: 'A small frog with mottled silver skin that perfectly blends with pool-side pebbles. Its croak produces tiny ripples that locate insects.',
    abilities: ['camouflage', 'ripple_sense'],
    habitat: 'pool_edge',
    preferredPool: 'crescent_basin',
  },
  {
    id: 'mp_ripplet_serpent',
    name: 'Ripplet Serpent',
    nameZh: '涟漪蛇',
    species: 'tide_serpent',
    rarity: 'common',
    power: 7,
    hp: 30,
    description: 'A thin water snake that creates small wave patterns as it swims. Harmless to larger creatures but territorial with its own kind.',
    abilities: ['ripple_slam', 'water_weave'],
    habitat: 'mid_depth',
    preferredPool: 'moonwell_shrine',
  },
  {
    id: 'mp_dusk_heron',
    name: 'Dusk Heron',
    nameZh: '黄昏鹭',
    species: 'night_heron',
    rarity: 'common',
    power: 8,
    hp: 22,
    description: 'A small heron with indigo-tipped feathers that stands motionless at pool edges, waiting for moonrise before beginning its nightly hunt.',
    abilities: ['still_hunt', 'moon_gaze'],
    habitat: 'pool_edge',
    preferredPool: 'moonwell_shrine',
  },
  {
    id: 'mp_moss_crab',
    name: 'Moss Crab',
    nameZh: '苔蟹',
    species: 'star_crab',
    rarity: 'common',
    power: 5,
    hp: 35,
    description: 'A crab covered in luminescent moss that provides natural camouflage. Its pincers are surprisingly strong for its modest size.',
    abilities: ['moss_armor', 'pinch'],
    habitat: 'pool_bottom',
    preferredPool: 'crescent_basin',
  },
  {
    id: 'mp_puddle_nymph',
    name: 'Puddle Nymph',
    nameZh: '水洼精灵',
    species: 'depth_nymph',
    rarity: 'common',
    power: 6,
    hp: 18,
    description: 'A minor water spirit that inhabits the smallest moon puddles. Despite their size, they possess ancient knowledge of pool magic.',
    abilities: ['puddle_hide', 'whisper_hint'],
    habitat: 'shallow_water',
    preferredPool: 'moonwell_shrine',
  },
  // ─── Uncommon (7) ────────────────────────────────────────────────────────
  {
    id: 'mp_lunar_medusa',
    name: 'Lunar Medusa',
    nameZh: '月神水母',
    species: 'moon_jelly',
    rarity: 'uncommon',
    power: 18,
    hp: 45,
    description: 'A larger jellyfish with a bell that reflects moonlight like a mirror. Its tentacles carry a mild stun toxin that slows predators.',
    abilities: ['mirror_bell', 'sting_barrage', 'lunar_drift'],
    habitat: 'mid_pool',
    preferredPool: 'silver_mirror_pool',
  },
  {
    id: 'mp_moonfin_koi',
    name: 'Moonfin Koi',
    nameZh: '月鳍锦鲤',
    species: 'lunar_fish',
    rarity: 'uncommon',
    power: 20,
    hp: 40,
    description: 'An elegant koi with fins that glow like lunar crescents. In ancient times, they were kept in imperial moon pools as symbols of good fortune.',
    abilities: ['fortune_swim', 'scale_shimmer', 'lunar_leap'],
    habitat: 'ornamental_pool',
    preferredPool: 'lotus_mirror_pool',
  },
  {
    id: 'mp_argent_toad',
    name: 'Argent Toad',
    nameZh: '银蟾蜍',
    species: 'silver_frog',
    rarity: 'uncommon',
    power: 16,
    hp: 55,
    description: 'A robust toad with a metallic silver hide that absorbs lunar radiation. Its croak can be heard across great distances on quiet moonlit nights.',
    abilities: ['silver_skin', 'thunder_croak', 'moon_absorb'],
    habitat: 'pool_surroundings',
    preferredPool: 'eclipse_depths',
  },
  {
    id: 'mp_current_python',
    name: 'Current Python',
    nameZh: '洋流蟒',
    species: 'tide_serpent',
    rarity: 'uncommon',
    power: 22,
    hp: 60,
    description: 'A thick water serpent that rides the strongest tidal currents through deep pool channels. Its coils generate powerful electric charges.',
    abilities: ['current_ride', 'constrict', 'shock_coil'],
    habitat: 'deep_channel',
    preferredPool: 'eclipse_depths',
  },
  {
    id: 'mp_midnight_egret',
    name: 'Midnight Egret',
    nameZh: '午夜白鹭',
    species: 'night_heron',
    rarity: 'uncommon',
    power: 19,
    hp: 38,
    description: 'A pure white heron that appears only during the darkest moonless nights, using echolocation to hunt in total darkness.',
    abilities: ['night_sight', 'echo_strike', 'shadow_step'],
    habitat: 'night_pool',
    preferredPool: 'eclipse_depths',
  },
  {
    id: 'mp_constellation_crab',
    name: 'Constellation Crab',
    nameZh: '星座蟹',
    species: 'star_crab',
    rarity: 'uncommon',
    power: 17,
    hp: 65,
    description: 'A crab whose shell displays shifting constellation patterns. It can project miniature star maps onto pool surfaces during full moons.',
    abilities: ['star_map', 'constellation_shell', 'astro_pinch'],
    habitat: 'stony_bottom',
    preferredPool: 'silver_mirror_pool',
  },
  {
    id: 'mp_brook_sylph',
    name: 'Brook Sylph',
    nameZh: '溪流精灵',
    species: 'depth_nymph',
    rarity: 'uncommon',
    power: 21,
    hp: 35,
    description: 'A graceful nymph who dances along the currents of moon pool tributaries, leaving trails of sparkling water in her wake.',
    abilities: ['current_dance', 'enchant_waters', 'healing_spray'],
    habitat: 'tributary',
    preferredPool: 'lotus_mirror_pool',
  },
  // ─── Rare (7) ────────────────────────────────────────────────────────────
  {
    id: 'mp_phantom_mane',
    name: 'Phantom Mane Jelly',
    nameZh: '幻鬃水母',
    species: 'moon_jelly',
    rarity: 'rare',
    power: 45,
    hp: 90,
    description: 'An enormous jellyfish with thousands of trailing tentacles that form a mane-like structure. It appears ghostly and semi-transparent under any light.',
    abilities: ['phantom_touch', 'mane_tangle', 'eclipse_aura', 'spectral_drift'],
    habitat: 'deep_pool',
    preferredPool: 'abyssal_lunar_chasm',
  },
  {
    id: 'mp_celestial_guppy',
    name: 'Celestial Guppy',
    nameZh: '天体孔雀鱼',
    species: 'lunar_fish',
    rarity: 'rare',
    power: 40,
    hp: 70,
    description: 'A seemingly ordinary guppy that, when viewed under magnification, reveals a galaxy swirling within its iridescent scales.',
    abilities: ['galaxy_scale', 'cosmic_dart', 'stellar_burst', 'nebula_shield'],
    habitat: 'cosmic_pool',
    preferredPool: 'starfall_reservoir',
  },
  {
    id: 'mp_moonstone_toad',
    name: 'Moonstone Toad',
    nameZh: '月石蟾蜍',
    species: 'silver_frog',
    rarity: 'rare',
    power: 38,
    hp: 120,
    description: 'A massive toad whose body has absorbed so much lunar energy that its skin has literally crystallized into living moonstone.',
    abilities: ['stone_hide', 'lunar_croak', 'crystal_ward', 'moonquake_stomp'],
    habitat: 'crystal_shore',
    preferredPool: 'starfall_reservoir',
  },
  {
    id: 'mp_abyssal_eel',
    name: 'Abyssal Tide Eel',
    nameZh: '深渊潮鳗',
    species: 'tide_serpent',
    rarity: 'rare',
    power: 50,
    hp: 100,
    description: 'A dark eel from the deepest pool trenches that generates its own electromagnetic field, controlling the flow of water around it.',
    abilities: ['electromagnetic_surge', 'tidal_grip', 'depth_charge', 'vortex_spin'],
    habitat: 'abyssal_trench',
    preferredPool: 'abyssal_lunar_chasm',
  },
  {
    id: 'mp_starwing_heron',
    name: 'Starwing Heron',
    nameZh: '星翼鹭',
    species: 'night_heron',
    rarity: 'rare',
    power: 42,
    hp: 80,
    description: 'A heron with wing feathers that shimmer like starlight. It can fly silently through the darkest nights, guided by invisible lunar currents.',
    abilities: ['starlight_flight', 'silent_strike', 'lunar_divination', 'feather_shield'],
    habitat: 'sky_pool',
    preferredPool: 'starfall_reservoir',
  },
  {
    id: 'mp_opal_shell_crab',
    name: 'Opal Shell Crab',
    nameZh: '蛋白石壳蟹',
    species: 'star_crab',
    rarity: 'rare',
    power: 44,
    hp: 130,
    description: 'A crab with a shell made of living opal that shifts colors with the moon phases. It can trap light within its shell and release it as a blinding flash.',
    abilities: ['opal_shift', 'light_trap', 'prism_claw', 'moonbeam_refract'],
    habitat: 'mineral_deposit',
    preferredPool: 'abyssal_lunar_chasm',
  },
  {
    id: 'mp_pearl_dryad',
    name: 'Pearl Dryad',
    nameZh: '珍珠树精',
    species: 'depth_nymph',
    rarity: 'rare',
    power: 48,
    hp: 75,
    description: 'A nymph who has merged with an ancient pearl at the bottom of a sacred pool. Her voice carries the accumulated wisdom of a thousand moon cycles.',
    abilities: ['pearl_voice', 'ancient_wisdom', 'pool_blessing', 'nymph_renewal'],
    habitat: 'sacred_depth',
    preferredPool: 'lotus_mirror_pool',
  },
  // ─── Epic (7) ────────────────────────────────────────────────────────────
  {
    id: 'mp_sovereign_moon_jelly',
    name: 'Sovereign Moon Jelly',
    nameZh: '月水母之王',
    species: 'moon_jelly',
    rarity: 'epic',
    power: 110,
    hp: 250,
    description: 'A colossal jellyfish the size of a small island, its bell containing an entire ecosystem of smaller moon creatures. It controls the tides of any pool it inhabits.',
    abilities: ['tidal_sovereignty', 'ecosystem_bell', 'lunar_rain', 'moonwell_summon', 'bioluminescent_storm'],
    habitat: 'pool_heart',
    preferredPool: 'dream_mirror_lagoon',
  },
  {
    id: 'mp_dragon_koi',
    name: 'Dragon Koi',
    nameZh: '龙鲤',
    species: 'lunar_fish',
    rarity: 'epic',
    power: 120,
    hp: 220,
    description: 'A legendary koi said to be the descendant of a true water dragon. Its scales are made of compressed moonlight and its presence transforms any pool into a sacred site.',
    abilities: ['dragon_scales', 'pool_transformation', 'lunar_breath', 'fortune_rain', 'ancient_leap'],
    habitat: 'sacred_pool',
    preferredPool: 'moonwell_shrine',
  },
  {
    id: 'mp_lunar_silverback',
    name: 'Lunar Silverback Frog',
    nameZh: '月球银背蛙',
    species: 'silver_frog',
    rarity: 'epic',
    power: 105,
    hp: 300,
    description: 'An enormous silver-backed frog that sits at the center of moon pools, its croak resonating with such power that it can summon miniature moons from the water surface.',
    abilities: ['moon_summon', 'thunder_croak_supreme', 'silver_fortress', 'tide_control', 'poolquake'],
    habitat: 'pool_center',
    preferredPool: 'dream_mirror_lagoon',
  },
  {
    id: 'mp_leviathan_coil',
    name: 'Leviathan Coil Serpent',
    nameZh: '海神蟒',
    species: 'tide_serpent',
    rarity: 'epic',
    power: 130,
    hp: 280,
    description: 'A massive serpent whose body wraps around entire pools. When it moves, the entire body of water shifts, creating waves that reshape the pool landscape permanently.',
    abilities: ['pool_reshape', 'tsunami_strike', 'leviathan_coil', 'deep_pressure', 'tidal_surge_supreme'],
    habitat: 'pool_perimeter',
    preferredPool: 'abyssal_lunar_chasm',
  },
  {
    id: 'mp_eclipse_heron_lord',
    name: 'Eclipse Heron Lord',
    nameZh: '蚀鹭领主',
    species: 'night_heron',
    rarity: 'epic',
    power: 115,
    hp: 200,
    description: 'A massive heron that only appears during lunar eclipses. Its shadow extends for miles, and any creature caught within it loses all will to fight.',
    abilities: ['eclipse_shadow', 'void_hunt', 'shadow_army', 'dark_divination', 'night_eternal'],
    habitat: 'eclipse_pool',
    preferredPool: 'eclipse_depths',
  },
  {
    id: 'mp_nebula_carapace',
    name: 'Nebula Carapace Crab',
    nameZh: '星云甲蟹',
    species: 'star_crab',
    rarity: 'epic',
    power: 125,
    hp: 350,
    description: 'A titanic crab whose shell contains a miniature nebula. Stars are born and die within the swirling gas clouds on its back, granting it cosmic power.',
    abilities: ['nebula_shell', 'starbirth_pinch', 'supernova_burst', 'cosmic_armor', 'gravity_well'],
    habitat: 'cosmic_depth',
    preferredPool: 'starfall_reservoir',
  },
  {
    id: 'mp_abyssal_siren',
    name: 'Abyssal Siren',
    nameZh: '深渊海妖',
    species: 'depth_nymph',
    rarity: 'epic',
    power: 135,
    hp: 190,
    description: 'A powerful nymph from the deepest, darkest moon pool. Her song can drag even the strongest creatures into the abyss, where they become part of her court.',
    abilities: ['siren_call_supreme', 'abyss_pull', 'dream_trap', 'depth_command', 'soul_enchantment'],
    habitat: 'deepest_depth',
    preferredPool: 'abyssal_lunar_chasm',
  },
  // ─── Legendary (7) ───────────────────────────────────────────────────────
  {
    id: 'mp_lunaria_umbra',
    name: 'Lunaria Umbra',
    nameZh: '月影母体',
    species: 'moon_jelly',
    rarity: 'legendary',
    power: 350,
    hp: 800,
    description: 'The primordial moon jelly from which all other moon jelly descend. She existed before the first moon rose, dwelling in the cosmic ocean of pre-creation. Her bell contains the memory of every moon phase ever witnessed.',
    abilities: ['primordial_glow', 'phase_weave', 'creation_jelly', 'eclipse_absorption', 'lunar_rebirth', 'cosmic_drift'],
    habitat: 'primordial_pool',
    preferredPool: 'dream_mirror_lagoon',
  },
  {
    id: 'mp_orochi_koi',
    name: 'Orochi Koi',
    nameZh: '八岐龙鲤',
    species: 'lunar_fish',
    rarity: 'legendary',
    power: 380,
    hp: 700,
    description: 'An eight-headed koi dragon of immense power, each head embodying a different moon phase. Legend says it swims through all moon pools simultaneously, existing in multiple places at once.',
    abilities: ['eight_phase_strike', 'omnipresence', 'dragon_transformation', 'moon_cycle_mastery', 'divine_fortune', 'pool_sovereignty'],
    habitat: 'all_pools',
    preferredPool: 'moonwell_shrine',
  },
  {
    id: 'mp_tsukiyomi_toad',
    name: 'Tsukiyomi Toad',
    nameZh: '月读蟾蜍',
    species: 'silver_frog',
    rarity: 'legendary',
    power: 340,
    hp: 900,
    description: 'The legendary toad companion of Tsukiyomi, the moon god. Its body is made of pure silver and it controls time itself — croaking backward to rewind moments or forward to accelerate them.',
    abilities: ['time_croak', 'silver_immortality', 'moon_god_blessing', 'temporal_leap', 'chronal_shield', 'eternal_hibernation'],
    habitat: 'moon_palace',
    preferredPool: 'dream_mirror_lagoon',
  },
  {
    id: 'mp_jormungandr_tide',
    name: 'Jormungandr Tide Serpent',
    nameZh: '耶梦加得潮蛇',
    species: 'tide_serpent',
    rarity: 'legendary',
    power: 400,
    hp: 1000,
    description: 'The world-serpent of moon pools, so vast that it encircles the deepest abyssal chasm. When it stirs, every pool on earth experiences simultaneous tidal anomalies. Its bite injects liquid moonlight.',
    abilities: ['world_encircle', 'tide_apocalypse', 'moon_venom', 'serpent_awakening', 'pool_world_controller', 'primordial_wrath'],
    habitat: 'world_circle',
    preferredPool: 'abyssal_lunar_chasm',
  },
  {
    id: 'mp_night_crown_heron',
    name: 'Night Crown Heron',
    nameZh: '夜冠鹭王',
    species: 'night_heron',
    rarity: 'legendary',
    power: 360,
    hp: 650,
    description: 'The heron king of all night birds, wearing a crown of captured starlight. It perches at the boundary between the waking world and the dream realm, judging which mortals may enter sacred pools.',
    abilities: ['starlight_crown', 'dream_gatekeeper', 'night_judgment', 'lunar_decree', 'shadow_army_supreme', 'cosmic_flight'],
    habitat: 'dream_boundary',
    preferredPool: 'eclipse_depths',
  },
  {
    id: 'mp_celestial_arachne_crab',
    name: 'Celestial Arachne Crab',
    nameZh: '天机蛛蟹',
    species: 'star_crab',
    rarity: 'legendary',
    power: 390,
    hp: 1100,
    description: 'A cosmic crab that weaves the threads of fate using starlight, its shell bearing the entire zodiac. It is said that the patterns on its claws predict every eclipse and supermoon for the next millennium.',
    abilities: ['fate_weave', 'zodiac_shell', 'celestial_precision', 'star_thread_trap', 'destiny_claw', 'cosmic_armor_supreme'],
    habitat: 'star_weave',
    preferredPool: 'starfall_reservoir',
  },
  {
    id: 'mp_tethys_nymph_queen',
    name: 'Tethys Nymph Queen',
    nameZh: '泰西斯海精女王',
    species: 'depth_nymph',
    rarity: 'legendary',
    power: 420,
    hp: 750,
    description: 'The queen of all depth nymphs and guardian of the primordial moon pool from which all water on Earth originated. She is the living memory of every drop that ever touched moonlight.',
    abilities: ['primordial_song', 'pool_omniscience', 'nymph_army_summon', 'water_creation', 'moonlight_absorption_supreme', 'eternal_guardian'],
    habitat: 'origin_pool',
    preferredPool: 'moonwell_shrine',
  },
];

// =============================================================================
// MP_POOLS — 8 Moon Pools
// =============================================================================

export const MP_POOLS: MPPoolDef[] = [
  {
    id: 'crescent_basin',
    name: 'Crescent Basin',
    nameZh: '新月盆地',
    description: 'A shallow, crescent-shaped pool fed by moonlight rain. Ideal for beginners, its gentle waters nurture common moon creatures and yield basic lunar materials.',
    biome: 'freshwater',
    depth: 10,
    unlockLevel: 1,
    creatureCapacity: 5,
    materials: ['mat_moonstone_shard', 'mat_silver_scale', 'mat_lunar_dust', 'mat_pool_water'],
    color: '#87CEEB',
  },
  {
    id: 'silver_mirror_pool',
    name: 'Silver Mirror Pool',
    nameZh: '银镜池',
    description: 'A perfectly still pool whose surface acts like a mirror, reflecting the moon with such clarity that it appears there are two moons. Creatures here develop reflective scales.',
    biome: 'enchanted',
    depth: 25,
    unlockLevel: 3,
    creatureCapacity: 8,
    materials: ['mat_reflective_scale', 'mat_mirror_shard', 'mat_moonstone_shard', 'mat_lunar_dust', 'mat_silver_petal'],
    color: '#C0C0C0',
  },
  {
    id: 'eclipse_depths',
    name: 'Eclipse Depths',
    nameZh: '蚀影深渊',
    description: 'A dark, mysterious pool that only reveals its depths during eclipses. Powerful shadow creatures dwell in its murky waters, guarding treasures of eclipse-touched materials.',
    biome: 'abyssal',
    depth: 100,
    unlockLevel: 7,
    creatureCapacity: 10,
    materials: ['mat_eclipse_shard', 'mat_shadow_silk', 'mat_void_crystal', 'mat_dark_pearl', 'mat_obscidian_scale'],
    color: '#191970',
  },
  {
    id: 'moonwell_shrine',
    name: 'Moonwell Shrine',
    nameZh: '月井神殿',
    description: 'An ancient shrine built around a natural spring blessed by moonlight. Pilgrims travel from far lands to drink its waters, said to grant prophetic dreams and extend lifespan.',
    biome: 'celestial',
    depth: 40,
    unlockLevel: 5,
    creatureCapacity: 12,
    materials: ['mat_blessed_water', 'mat_shrine_stone', 'mat_prayer_bead', 'mat_moonstone', 'mat_celestial_incense'],
    color: '#FFD700',
  },
  {
    id: 'lotus_mirror_pool',
    name: 'Lotus Mirror Pool',
    nameZh: '莲花镜池',
    description: 'A serene pool covered in glowing lunar lotus flowers that bloom only at night. The lotus petals contain concentrated moonlight and are prized in alchemy across all realms.',
    biome: 'enchanted',
    depth: 30,
    unlockLevel: 4,
    creatureCapacity: 9,
    materials: ['mat_lunar_lotus', 'mat_lotus_stem', 'mat_petal_dust', 'mat_reflective_scale', 'mat_nectar_dew'],
    color: '#FFB6C1',
  },
  {
    id: 'starfall_reservoir',
    name: 'Starfall Reservoir',
    nameZh: '星落水库',
    description: 'A vast reservoir where falling stars are captured in the water, creating a celestial aquarium. Each captured star becomes a tiny sun that nurtures unique stellar creatures.',
    biome: 'celestial',
    depth: 80,
    unlockLevel: 10,
    creatureCapacity: 14,
    materials: ['mat_star_fragment', 'mat_star_dust', 'mat_celestial_core', 'mat_nebula_vapor', 'mat_comet_tail'],
    color: '#9370DB',
  },
  {
    id: 'abyssal_lunar_chasm',
    name: 'Abyssal Lunar Chasm',
    nameZh: '深渊月裂',
    description: 'The deepest known moon pool, plunging into the earth like a wound that never heals. Lunar energy leaks from the chasm walls, creating an ecosystem of impossible creatures adapted to total darkness and extreme pressure.',
    biome: 'subterranean',
    depth: 500,
    unlockLevel: 15,
    creatureCapacity: 16,
    materials: ['mat_abyssal_pearl', 'mat_pressure_crystal', 'mat_depth_metal', 'mat_void_essence', 'mat_chasm_stone', 'mat_dark_moonstone'],
    color: '#0A0A2E',
  },
  {
    id: 'dream_mirror_lagoon',
    name: 'Dream Mirror Lagoon',
    nameZh: '梦镜泻湖',
    description: 'A lagoon that exists simultaneously in the physical world and the dream realm. Its waters reflect not reality but the dreams of those who gaze into them, and its creatures can walk between both worlds.',
    biome: 'dream',
    depth: 60,
    unlockLevel: 20,
    creatureCapacity: 18,
    materials: ['mat_dream_essence', 'mat_reverie_pearl', 'mat_sleep_dust', 'mat_mirage_glass', 'dat_soul_thread', 'mat_memory_crystal'],
    color: '#DDA0DD',
  },
];

// =============================================================================
// MP_MATERIALS — 30 Moon Pool Materials
// =============================================================================

export const MP_MATERIALS: MPMaterialDef[] = [
  // Common (10)
  { id: 'mat_moonstone_shard', name: 'Moonstone Shard', nameZh: '月长石碎片', rarity: 'common', description: 'A small fragment of moonstone that glows with a soft, milky luminescence under any light.', source: 'pool_harvest', value: 5, stackLimit: 99 },
  { id: 'mat_silver_scale', name: 'Silver Scale', nameZh: '银鳞', rarity: 'common', description: 'A shimmering scale shed by lunar fish during their monthly molting cycle.', source: 'creature_drop', value: 4, stackLimit: 99 },
  { id: 'mat_lunar_dust', name: 'Lunar Dust', nameZh: '月尘', rarity: 'common', description: 'Fine silvery powder collected from moonlit pool surfaces at dawn.', source: 'pool_harvest', value: 3, stackLimit: 99 },
  { id: 'mat_pool_water', name: 'Enchanted Pool Water', nameZh: '魔力池水', rarity: 'common', description: 'Water drawn from a moon pool, still carrying traces of lunar energy.', source: 'pool_harvest', value: 2, stackLimit: 50 },
  { id: 'mat_silver_petal', name: 'Silver Petal', nameZh: '银花瓣', rarity: 'common', description: 'A petal from a silver-leafed plant growing near moon pools, storing faint moonlight.', source: 'pool_harvest', value: 4, stackLimit: 99 },
  { id: 'mat_moss_sample', name: 'Luminous Moss', nameZh: '发光苔藓', rarity: 'common', description: 'Bioluminescent moss that grows only on rocks submerged in moonlit water.', source: 'pool_harvest', value: 3, stackLimit: 99 },
  { id: 'mat_tide_resin', name: 'Tide Resin', nameZh: '潮汐树脂', rarity: 'common', description: 'Sticky resin secreted by pool-side trees during high tide, rich in lunar minerals.', source: 'pool_harvest', value: 5, stackLimit: 99 },
  { id: 'mat_pebble_glass', name: 'Pebble Glass', nameZh: '卵石玻璃', rarity: 'common', description: 'Smooth, translucent stones found at the bottom of shallow moon pools.', source: 'pool_harvest', value: 3, stackLimit: 99 },
  { id: 'mat_frog_bile', name: 'Lunar Frog Bile', nameZh: '月蛙胆汁', rarity: 'common', description: 'A glowing substance harvested from silver frogs, useful in basic alchemy.', source: 'creature_drop', value: 6, stackLimit: 50 },
  { id: 'mat_jelly_extract', name: 'Jelly Extract', nameZh: '水母精华', rarity: 'common', description: 'A thick, luminescent gel extracted from common moon jellies with healing properties.', source: 'creature_drop', value: 5, stackLimit: 50 },
  // Uncommon (8)
  { id: 'mat_moonstone', name: 'Moonstone', nameZh: '月长石', rarity: 'uncommon', description: 'A fully formed moonstone that shifts between blue and white as moon phases change.', source: 'deep_dive', value: 25, stackLimit: 20 },
  { id: 'mat_reflective_scale', name: 'Reflective Scale', nameZh: '镜面鳞', rarity: 'uncommon', description: 'A perfect mirror-like scale from rare lunar fish that reflects moonlight with extraordinary clarity.', source: 'creature_drop', value: 22, stackLimit: 30 },
  { id: 'mat_mirror_shard', name: 'Mirror Shard', nameZh: '镜碎片', rarity: 'uncommon', description: 'A fragment of the Silver Mirror Pool surface itself, capturing and holding lunar reflections.', source: 'pool_event', value: 28, stackLimit: 15 },
  { id: 'mat_lunar_lotus', name: 'Lunar Lotus', nameZh: '月莲花', rarity: 'uncommon', description: 'A complete lotus flower harvested from the Lotus Mirror Pool at the peak of full moon bloom.', source: 'pool_harvest', value: 20, stackLimit: 20 },
  { id: 'mat_lotus_stem', name: 'Lotus Stem', nameZh: '莲茎', rarity: 'uncommon', description: 'A flexible, moon-infused stem from the lunar lotus, used in crafting potions and wands.', source: 'pool_harvest', value: 18, stackLimit: 30 },
  { id: 'mat_petal_dust', name: 'Petal Dust', nameZh: '花尘', rarity: 'uncommon', description: 'Crushed lunar lotus petals that retain their glowing properties as a fine powder.', source: 'crafting', value: 15, stackLimit: 50 },
  { id: 'mat_nectar_dew', name: 'Nectar Dew', nameZh: '花露', rarity: 'uncommon', description: 'Sweet, luminescent dew collected from lunar lotus blossoms before sunrise.', source: 'pool_harvest', value: 24, stackLimit: 25 },
  { id: 'mat_shadow_silk', name: 'Shadow Silk', nameZh: '影丝', rarity: 'uncommon', description: 'Silk-like threads harvested from shadow creatures in the Eclipse Depths, nearly invisible.', source: 'creature_drop', value: 30, stackLimit: 20 },
  // Rare (6)
  { id: 'mat_eclipse_shard', name: 'Eclipse Shard', nameZh: '蚀碎片', rarity: 'rare', description: 'A crystallized fragment of shadow formed during a lunar eclipse, cold and humming with dark energy.', source: 'event_reward', value: 80, stackLimit: 10 },
  { id: 'mat_void_crystal', name: 'Void Crystal', nameZh: '虚空水晶', rarity: 'rare', description: 'A crystal formed in absolute darkness at the bottom of the Eclipse Depths, absorbing all surrounding light.', source: 'deep_dive', value: 100, stackLimit: 8 },
  { id: 'mat_dark_pearl', name: 'Dark Pearl', nameZh: '暗珍珠', rarity: 'rare', description: 'A perfectly spherical pearl that absorbs light, found only in the deepest eclipse-touched waters.', source: 'creature_drop', value: 90, stackLimit: 10 },
  { id: 'mat_blessed_water', name: 'Blessed Water', nameZh: '圣水', rarity: 'rare', description: 'Water from the Moonwell Shrine that has been prayed over for a full lunar cycle.', source: 'structure_output', value: 75, stackLimit: 15 },
  { id: 'mat_prayer_bead', name: 'Prayer Bead', nameZh: '念珠', rarity: 'rare', description: 'A small luminous bead formed from concentrated prayers at the Moonwell Shrine.', source: 'structure_output', value: 70, stackLimit: 12 },
  { id: 'mat_celestial_incense', name: 'Celestial Incense', nameZh: '天界香', rarity: 'rare', description: 'Rare incense made from moon pool flowers that opens the third eye to celestial visions.', source: 'crafting', value: 85, stackLimit: 10 },
  // Epic (4)
  { id: 'mat_celestial_core', name: 'Celestial Core', nameZh: '天体核心', rarity: 'epic', description: 'The concentrated heart of a fallen star captured in the Starfall Reservoir, radiating immense stellar energy.', source: 'event_reward', value: 300, stackLimit: 3 },
  { id: 'mat_nebula_vapor', name: 'Nebula Vapor', nameZh: '星云蒸汽', rarity: 'epic', description: 'Gaseous matter collected from stellar nurseries visible only through enchanted pool surfaces.', source: 'deep_dive', value: 350, stackLimit: 3 },
  { id: 'mat_abyssal_pearl', name: 'Abyssal Pearl', nameZh: '深渊珍珠', rarity: 'epic', description: 'A pearl of impossible size and beauty from the Abyssal Lunar Chasm, containing the compressed wisdom of ages.', source: 'deep_dive', value: 280, stackLimit: 5 },
  { id: 'mat_void_essence', name: 'Void Essence', nameZh: '虚空精华', rarity: 'epic', description: 'The concentrated essence of nothingness extracted from the deepest chasm, paradoxically powerful.', source: 'event_reward', value: 320, stackLimit: 3 },
  // Legendary (2)
  { id: 'mat_memory_crystal', name: 'Memory Crystal', nameZh: '记忆水晶', rarity: 'legendary', description: 'A crystal from the Dream Mirror Lagoon that stores the memories of everyone who has ever gazed into its waters.', source: 'legendary_dive', value: 1000, stackLimit: 1 },
  { id: 'mat_primordial_drop', name: 'Primordial Drop', nameZh: '太初之滴', rarity: 'legendary', description: 'A single drop of the original water from which all moon pools were created, containing the power of creation itself.', source: 'legendary_dive', value: 1500, stackLimit: 1 },
];

// =============================================================================
// MP_STRUCTURES — 25 Pool Structures (upgradeable to Level 10)
// =============================================================================

export const MP_STRUCTURES: MPStructureDef[] = [
  // Pool (4)
  { id: 'struct_lunar_basin', name: 'Lunar Basin', nameZh: '月池盆', description: 'An ornamental basin carved from moonstone that collects and purifies rainwater under moonlight, providing a steady supply of enchanted water.', category: 'pool', maxLevel: 10, baseCost: 50, costMultiplier: 1.5, bonusPerLevel: '+10 enchanted water per day' },
  { id: 'struct_tide_gate', name: 'Tide Gate', nameZh: '潮汐闸', description: 'A mechanical gate infused with lunar magic that controls the flow of water between connected moon pools, enabling creature migration.', category: 'pool', maxLevel: 10, baseCost: 80, costMultiplier: 1.6, bonusPerLevel: '+5% creature transfer speed' },
  { id: 'struct_pool_lining', name: 'Enchanted Pool Lining', nameZh: '魔法池衬', description: 'A lining of lunar crystals that reinforces the pool walls, preventing contamination and increasing the concentration of moon energy.', category: 'pool', maxLevel: 10, baseCost: 100, costMultiplier: 1.7, bonusPerLevel: '+8% lunar energy retention' },
  { id: 'struct_aeration_stone', name: 'Moonstone Aerator', nameZh: '月石曝气石', description: 'A porous moonstone that releases tiny bubbles of lunar-charged oxygen, keeping pool water fresh and creatures healthy.', category: 'pool', maxLevel: 10, baseCost: 40, costMultiplier: 1.4, bonusPerLevel: '+3 creature happiness' },
  // Lab (4)
  { id: 'struct_alchemy_lab', name: 'Lunar Alchemy Lab', nameZh: '月炼金室', description: 'A laboratory where moon pool materials can be combined into powerful elixirs, catalysts, and transmutation agents.', category: 'lab', maxLevel: 10, baseCost: 120, costMultiplier: 1.8, bonusPerLevel: '+10% brewing success rate' },
  { id: 'struct_analysis_scope', name: 'Moonlight Analysis Scope', nameZh: '月光分析镜', description: 'A magnifying instrument that reveals the hidden properties and potential of pool materials when viewed through moonlight.', category: 'lab', maxLevel: 10, baseCost: 90, costMultiplier: 1.5, bonusPerLevel: '+5% material quality detection' },
  { id: 'struct_brewing_cauldron', name: 'Silver Brewing Cauldron', nameZh: '银酿金锅', description: 'A cauldron forged from pure silver that amplifies the potency of any elixir brewed within it under moonlight.', category: 'lab', maxLevel: 10, baseCost: 150, costMultiplier: 1.7, bonusPerLevel: '+15% elixir potency' },
  { id: 'struct_specimen_jar', name: 'Specimen Preservation Jar', nameZh: '标本保存罐', description: 'Enchanted jars that keep harvested materials in perfect stasis, preventing any degradation over time.', category: 'lab', maxLevel: 10, baseCost: 60, costMultiplier: 1.3, bonusPerLevel: '+10% material shelf life' },
  // Garden (4)
  { id: 'struct_lunar_greenhouse', name: 'Lunar Greenhouse', nameZh: '月光温室', description: 'A glass structure that concentrates moonlight to grow moon pool flora out of season, ensuring a constant supply of botanical materials.', category: 'garden', maxLevel: 10, baseCost: 110, costMultiplier: 1.6, bonusPerLevel: '+2 harvest cycles per day' },
  { id: 'struct_lotus_bed', name: 'Lotus Cultivation Bed', nameZh: '莲花培育床', description: 'A specialized garden bed for cultivating lunar lotus, the most prized flower in moon pool alchemy.', category: 'garden', maxLevel: 10, baseCost: 130, costMultiplier: 1.7, bonusPerLevel: '+1 lotus per harvest' },
  { id: 'struct_moss_garden', name: 'Bioluminescent Moss Garden', nameZh: '发光苔园', description: 'A garden of luminescent mosses that serves dual purposes: illuminating pathways and producing alchemical reagents.', category: 'garden', maxLevel: 10, baseCost: 70, costMultiplier: 1.5, bonusPerLevel: '+5% illumination radius' },
  { id: 'struct_herb_rack', name: 'Moon Herb Drying Rack', nameZh: '月草药架', description: 'A rack that dries harvested pool-side herbs under concentrated moonlight, preserving their magical properties.', category: 'garden', maxLevel: 10, baseCost: 55, costMultiplier: 1.4, bonusPerLevel: '+3 herb slots' },
  // Tower (4)
  { id: 'struct_moonlight_tower', name: 'Moonlight Collection Tower', nameZh: '月光收集塔', description: 'A tall tower capped with a lunar prism that collects and focuses moonlight into usable energy for the entire pool complex.', category: 'tower', maxLevel: 10, baseCost: 200, costMultiplier: 2.0, bonusPerLevel: '+20 lunar energy per night' },
  { id: 'struct_observation_deck', name: 'Celestial Observation Deck', nameZh: '天象观测台', description: 'An elevated platform with enchanted lenses for tracking moon phases, eclipses, and stellar events that affect pool activity.', category: 'tower', maxLevel: 10, baseCost: 160, costMultiplier: 1.8, bonusPerLevel: '+5% event prediction accuracy' },
  { id: 'struct_beacon_spire', name: 'Silver Beacon Spire', nameZh: '银光信标尖塔', description: 'A spire that emits a beam of focused moonlight, attracting rare moon creatures from distant pools.', category: 'tower', maxLevel: 10, baseCost: 180, costMultiplier: 1.9, bonusPerLevel: '+8% rare creature spawn rate' },
  { id: 'struct_weather_vane', name: 'Lunar Weather Vane', nameZh: '月相风向标', description: 'A vane enchanted to read lunar weather patterns, predicting the best times for diving and harvesting.', category: 'tower', maxLevel: 10, baseCost: 90, costMultiplier: 1.5, bonusPerLevel: '+3 hour prediction window' },
  // Shrine (3)
  { id: 'struct_pool_shrine', name: 'Moon Pool Shrine', nameZh: '月池神龛', description: 'A sacred shrine dedicated to the pool spirits, where offerings can be made to increase creature happiness and pool yield.', category: 'shrine', maxLevel: 10, baseCost: 140, costMultiplier: 1.7, bonusPerLevel: '+10% offering effectiveness' },
  { id: 'struct_prayer_altar', name: 'Tidal Prayer Altar', nameZh: '潮汐祭坛', description: 'An altar where prayers to the moon are amplified by the pool tides, granting temporary blessings to nearby creatures.', category: 'shrine', maxLevel: 10, baseCost: 170, costMultiplier: 1.8, bonusPerLevel: '+12% blessing duration' },
  { id: 'struct_spirit_statue', name: 'Spirit Guardian Statue', nameZh: '精灵守护像', description: 'A statue that houses a minor pool spirit, providing passive protection against pool contamination and hostile creatures.', category: 'shrine', maxLevel: 10, baseCost: 120, costMultiplier: 1.6, bonusPerLevel: '+5% pool defense' },
  // Forge (2)
  { id: 'struct_silver_forge', name: 'Moon Silver Forge', nameZh: '月银锻造炉', description: 'A forge heated by concentrated moonbeams, capable of crafting equipment from lunar metals and moon pool materials.', category: 'forge', maxLevel: 10, baseCost: 220, costMultiplier: 2.0, bonusPerLevel: '+10% crafting quality' },
  { id: 'struct_crystal_anvil', name: 'Crystal Anvil', nameZh: '水晶铁砧', description: 'An anvil made from a single enormous moon crystal, essential for working with the hardest lunar materials.', category: 'forge', maxLevel: 10, baseCost: 250, costMultiplier: 2.1, bonusPerLevel: '+8% forging success rate' },
  // Harbor (2)
  { id: 'struct_boat_dock', name: 'Moonlit Boat Dock', nameZh: '月光船坞', description: 'A dock for small moon-pool boats used for deep dives and material transportation between connected pools.', category: 'harbor', maxLevel: 10, baseCost: 130, costMultiplier: 1.6, bonusPerLevel: '+1 boat capacity' },
  { id: 'struct_dive_platform', name: 'Deep Dive Platform', nameZh: '深潜平台', description: 'A reinforced platform extending over the deepest parts of the pool, enabling safe access to abyssal zones.', category: 'harbor', maxLevel: 10, baseCost: 190, costMultiplier: 1.8, bonusPerLevel: '+10m maximum dive depth' },
  // Archive (2)
  { id: 'struct_pool_library', name: 'Moon Pool Library', nameZh: '月池图书馆', description: 'A repository of ancient scrolls and tablets documenting moon pool lore, creature behaviors, and forgotten recipes.', category: 'archive', maxLevel: 10, baseCost: 150, costMultiplier: 1.7, bonusPerLevel: '+1 recipe unlock chance' },
  { id: 'struct_record_hall', name: 'Tidal Record Hall', nameZh: '潮汐记录厅', description: 'A hall that automatically records and displays data about pool activity, creature migrations, and material yields.', category: 'archive', maxLevel: 10, baseCost: 170, costMultiplier: 1.8, bonusPerLevel: '+5% data accuracy' },
];

// =============================================================================
// MP_ABILITIES — 22 Moon Pool Abilities
// =============================================================================

export const MP_ABILITIES: MPAbilityDef[] = [
  { id: 'ability_moonbeam_focus', name: 'Moonbeam Focus', nameZh: '月光聚焦', description: 'Concentrates ambient moonlight into a single piercing beam that illuminates pool depths and reveals hidden materials.', school: 'lunar', cooldown: 5, power: 15, lunarCost: 10, requires: null },
  { id: 'ability_tide_call', name: 'Tide Call', nameZh: '潮汐呼唤', description: 'Sings a note attuned to lunar tides, summoning a gentle current that pushes floating materials to the pool surface for easy collection.', school: 'tidal', cooldown: 8, power: 20, lunarCost: 15, requires: null },
  { id: 'ability_silver_touch', name: 'Silver Touch', nameZh: '银触', description: 'Coats the hand in liquid silver that can soothe agitated moon creatures, making them easier to capture and bond with.', school: 'silver', cooldown: 10, power: 25, lunarCost: 20, requires: null },
  { id: 'ability_shadow_dive', name: 'Shadow Dive', nameZh: '影潜', description: 'Merges with the shadows at the pool bottom, becoming invisible to creatures and gaining access to hidden underwater caves.', school: 'shadow', cooldown: 15, power: 30, lunarCost: 25, requires: null },
  { id: 'ability_dream_breath', name: 'Dream Breath', nameZh: '梦境吐息', description: 'Exhales a mist of dream essence that puts creatures to sleep and reveals their subconscious memories.', school: 'dream', cooldown: 12, power: 20, lunarCost: 18, requires: null },
  { id: 'ability_crystal_resonance', name: 'Crystal Resonance', nameZh: '水晶共振', description: 'Strikes a moon crystal to create a resonant frequency that shatters barriers and opens sealed pool chambers.', school: 'crystal', cooldown: 20, power: 35, lunarCost: 30, requires: null },
  { id: 'ability_pool_purification', name: 'Pool Purification', nameZh: '池水净化', description: 'Channels lunar energy through the pool water, removing all toxins, corruption, and hostile influences.', school: 'lunar', cooldown: 25, power: 40, lunarCost: 35, requires: 'struct_pool_lining' },
  { id: 'ability_tidal_barrage', name: 'Tidal Barrage', nameZh: '潮汐壁垒', description: 'Summons a wall of pressurized tidal water that blocks attacks and traps creatures in a swirling vortex.', school: 'tidal', cooldown: 18, power: 45, lunarCost: 40, requires: 'struct_tide_gate' },
  { id: 'ability_silver_reflection', name: 'Silver Reflection', nameZh: '银光反射', description: 'Creates a perfect mirror of moonlight that reflects incoming attacks back at their source with doubled power.', school: 'silver', cooldown: 22, power: 50, lunarCost: 45, requires: null },
  { id: 'ability_shadow_step', name: 'Shadow Step', nameZh: '影步', description: 'Steps through the shadow realm to teleport between any two connected moon pools instantaneously.', school: 'shadow', cooldown: 30, power: 35, lunarCost: 50, requires: 'ability_shadow_dive' },
  { id: 'ability_dream_weave', name: 'Dream Weave', nameZh: '梦织', description: 'Manipulates the dream fabric of the Dream Mirror Lagoon to create illusions that charm or confuse creatures.', school: 'dream', cooldown: 20, power: 40, lunarCost: 38, requires: 'ability_dream_breath' },
  { id: 'ability_crystal_garden', name: 'Crystal Garden', nameZh: '水晶花园', description: 'Plants crystal seeds in the pool bed that rapidly grow into a defensive garden of sharp, luminous crystal formations.', school: 'crystal', cooldown: 28, power: 55, lunarCost: 48, requires: 'ability_crystal_resonance' },
  { id: 'ability_full_moon_radiance', name: 'Full Moon Radiance', nameZh: '满月光辉', description: 'During the full moon, releases a blinding pulse of concentrated lunar energy that boosts all creatures and structures.', school: 'lunar', cooldown: 60, power: 80, lunarCost: 70, requires: 'struct_moonlight_tower' },
  { id: 'ability_maelstrom_summon', name: 'Maelstrom Summon', nameZh: '漩涡召唤', description: 'Summons a massive whirlpool in the pool that draws in materials, creatures, and hidden treasures from the surrounding area.', school: 'tidal', cooldown: 45, power: 70, lunarCost: 65, requires: 'struct_dive_platform' },
  { id: 'ability_silver_sanctuary', name: 'Silver Sanctuary', nameZh: '银光圣域', description: 'Creates a dome of solidified silver light that protects everything within from harm for a limited duration.', school: 'silver', cooldown: 50, power: 75, lunarCost: 68, requires: 'struct_pool_shrine' },
  { id: 'ability_eclipse_shroud', name: 'Eclipse Shroud', nameZh: '蚀影帷幕', description: 'Wraps the entire pool in supernatural darkness, enhancing shadow creatures and disabling light-based abilities of enemies.', school: 'shadow', cooldown: 40, power: 65, lunarCost: 60, requires: null },
  { id: 'ability_lucid_dream', name: 'Lucid Dream', nameZh: '清明梦', description: 'Enters the dream realm fully conscious, allowing direct interaction with dream creatures and manipulation of the dream pool environment.', school: 'dream', cooldown: 35, power: 60, lunarCost: 55, requires: null },
  { id: 'ability_crystal_storm', name: 'Crystal Storm', nameZh: '水晶风暴', description: 'Detonates all crystal formations in the pool simultaneously, creating a devastating storm of razor-sharp lunar crystals.', school: 'crystal', cooldown: 55, power: 90, lunarCost: 80, requires: 'struct_crystal_anvil' },
  { id: 'ability_lunar_transmutation', name: 'Lunar Transmutation', nameZh: '月光转化', description: 'Transforms common materials into rarer versions by bathing them in concentrated lunar energy during the correct moon phase.', school: 'lunar', cooldown: 90, power: 100, lunarCost: 100, requires: 'struct_alchemy_lab' },
  { id: 'ability_tsunami_fury', name: 'Tsunami Fury', nameZh: '海啸狂怒', description: 'Unleashes a tidal wave of biblical proportions that sweeps through the entire pool system, reshaping the landscape.', school: 'tidal', cooldown: 120, power: 150, lunarCost: 130, requires: 'ability_maelstrom_summon' },
  { id: 'ability_silver_legion', name: 'Silver Legion', nameZh: '银色军团', description: 'Summons an army of silver constructs that autonomously defend the pool and harvest materials for a limited time.', school: 'silver', cooldown: 100, power: 120, lunarCost: 110, requires: 'struct_silver_forge' },
  { id: 'ability_nightmare_abyss', name: 'Nightmare Abyss', nameZh: '梦魇深渊', description: 'Opens a portal to the nightmare dimension, transforming the pool into a nightmarish version of itself with enhanced rewards and extreme danger.', school: 'dream', cooldown: 150, power: 200, lunarCost: 150, requires: 'ability_lucid_dream' },
];

// =============================================================================
// MP_ACHIEVEMENTS — 18 Achievements
// =============================================================================

export const MP_ACHIEVEMENTS: MPAchievementDef[] = [
  { id: 'ach_first_wade', name: 'First Wade', nameZh: '初次涉水', description: 'Step into your first moon pool and feel the lunar waters.', conditionKey: 'mpTotalDives', targetValue: 1, rewardEnergy: 20, rewardExp: 15, rewardTitle: null },
  { id: 'ach_pool_explorer', name: 'Pool Explorer', nameZh: '月池探索者', description: 'Complete 10 dives across different moon pools.', conditionKey: 'mpTotalDives', targetValue: 10, rewardEnergy: 100, rewardExp: 50, rewardTitle: 'title_pool_explorer' },
  { id: 'ach_abyss_diver', name: 'Abyss Diver', nameZh: '深渊潜水者', description: 'Complete 50 moon pool dives, braving the deepest waters.', conditionKey: 'mpTotalDives', targetValue: 50, rewardEnergy: 500, rewardExp: 200, rewardTitle: 'title_abyss_diver' },
  { id: 'ach_first_capture', name: 'First Capture', nameZh: '首次捕获', description: 'Capture your first moon creature for your pool collection.', conditionKey: 'mpTotalCreaturesCaptured', targetValue: 1, rewardEnergy: 30, rewardExp: 20, rewardTitle: null },
  { id: 'ach_creature_collector', name: 'Creature Collector', nameZh: '生物收藏家', description: 'Capture 15 different moon creatures across all species.', conditionKey: 'mpTotalCreaturesCaptured', targetValue: 15, rewardEnergy: 200, rewardExp: 100, rewardTitle: 'title_creature_collector' },
  { id: 'ach_full_bestiary', name: 'Full Bestiary', nameZh: '完整图鉴', description: 'Capture all 35 moon creatures, completing your bestiary.', conditionKey: 'mpTotalCreaturesCaptured', targetValue: 35, rewardEnergy: 2000, rewardExp: 1000, rewardTitle: 'title_bestiary_master' },
  { id: 'ach_first_brew', name: 'First Brew', nameZh: '首次酿造', description: 'Brew your first lunar elixir in the alchemy lab.', conditionKey: 'mpTotalBrews', targetValue: 1, rewardEnergy: 25, rewardExp: 15, rewardTitle: null },
  { id: 'ach_master_brewer', name: 'Master Brewer', nameZh: '大师酿造师', description: 'Brew 30 elixirs, mastering the art of lunar alchemy.', conditionKey: 'mpTotalBrews', targetValue: 30, rewardEnergy: 400, rewardExp: 180, rewardTitle: 'title_elixir_master' },
  { id: 'ach_moonlight_harvester', name: 'Moonlight Harvester', nameZh: '月光收割者', description: 'Draw moonlight 25 times from various moon pools.', conditionKey: 'mpTotalMoonlightDrawn', targetValue: 25, rewardEnergy: 300, rewardExp: 150, rewardTitle: null },
  { id: 'ach_tide_master', name: 'Tide Master', nameZh: '潮汐大师', description: 'Successfully summon tides 20 times to manipulate pool waters.', conditionKey: 'mpTotalTidesSummoned', targetValue: 20, rewardEnergy: 350, rewardExp: 160, rewardTitle: 'title_tide_master' },
  { id: 'ach_structure_architect', name: 'Structure Architect', nameZh: '建筑大师', description: 'Build 15 different pool structures across all categories.', conditionKey: 'mpTotalStructuresBuilt', targetValue: 15, rewardEnergy: 500, rewardExp: 250, rewardTitle: 'title_pool_architect' },
  { id: 'ach_max_upgrade', name: 'Max Upgrade', nameZh: '满级强化', description: 'Upgrade any structure to its maximum level of 10.', conditionKey: 'mpTotalStructuresBuilt', targetValue: 10, rewardEnergy: 600, rewardExp: 300, rewardTitle: null },
  { id: 'ach_material_hoarder', name: 'Material Hoarder', nameZh: '材料囤积者', description: 'Accumulate 500 total material units in your inventory.', conditionKey: 'mpTotalEnergy', targetValue: 500, rewardEnergy: 250, rewardExp: 120, rewardTitle: null },
  { id: 'ach_artifact_hunter', name: 'Artifact Hunter', nameZh: '神器猎人', description: 'Discover 5 legendary moon pool artifacts.', conditionKey: 'mpTotalEnergy', targetValue: 1000, rewardEnergy: 800, rewardExp: 400, rewardTitle: 'title_artifact_hunter' },
  { id: 'ach_event_participant', name: 'Event Participant', nameZh: '活动参与者', description: 'Participate in 5 different moon pool events.', conditionKey: 'mpTotalDives', targetValue: 30, rewardEnergy: 150, rewardExp: 80, rewardTitle: null },
  { id: 'ach_all_pools_unlocked', name: 'All Pools Unlocked', nameZh: '全池解锁', description: 'Unlock access to all 8 moon pool locations.', conditionKey: 'mpLevel', targetValue: 20, rewardEnergy: 1000, rewardExp: 500, rewardTitle: 'title_pool_sovereign' },
  { id: 'ach_lunar_level_30', name: 'Lunar Level 30', nameZh: '月池30级', description: 'Reach lunar pool level 30, mastering all basic pool arts.', conditionKey: 'mpLevel', targetValue: 30, rewardEnergy: 1500, rewardExp: 800, rewardTitle: null },
  { id: 'ach_lunar_level_50', name: 'Lunar Level 50', nameZh: '月池50级', description: 'Reach the maximum lunar pool level of 50, becoming a true Lunar Sovereign.', conditionKey: 'mpLevel', targetValue: 50, rewardEnergy: 5000, rewardExp: 2500, rewardTitle: 'title_lunar_sovereign' },
];

// =============================================================================
// MP_TITLES — 8 Titles
// =============================================================================

export const MP_TITLES: MPTitleDef[] = [
  { id: 'title_moonlit_wader', name: 'Moonlit Wader', nameZh: '月光涉水者', levelRequired: 1, description: 'One who has taken their first steps into the sacred moon pools.', bonus: '+5% moonlight harvest speed' },
  { id: 'title_pool_explorer', name: 'Pool Explorer', nameZh: '月池探索者', levelRequired: 5, description: 'A curious adventurer who has explored multiple moon pools and documented their wonders.', bonus: '+10% creature encounter rate' },
  { id: 'title_abyss_diver', name: 'Abyss Diver', nameZh: '深渊潜水者', levelRequired: 10, description: 'A fearless diver who has plumbed the darkest depths of the eclipse pools and returned with treasures.', bonus: '+15% deep dive rewards' },
  { id: 'title_creature_collector', name: 'Creature Collector', nameZh: '生物收藏家', levelRequired: 15, description: 'A dedicated collector whose pools teem with a diverse array of magnificent moon creatures.', bonus: '+10% creature capture rate' },
  { id: 'title_elixir_master', name: 'Elixir Master', nameZh: '灵药大师', levelRequired: 20, description: 'A master alchemist whose lunar elixirs are sought after across all realms.', bonus: '+20% brewing potency' },
  { id: 'title_tide_master', name: 'Tide Master', nameZh: '潮汐大师', levelRequired: 30, description: 'One who has learned to command the tides themselves, shaping pool waters at will.', bonus: '+15% tide summoning power' },
  { id: 'title_pool_sovereign', name: 'Pool Sovereign', nameZh: '月池领主', levelRequired: 40, description: 'The undisputed ruler of all moon pools, commanding creatures, tides, and lunar energy with equal mastery.', bonus: '+25% all pool bonuses' },
  { id: 'title_lunar_sovereign', name: 'Lunar Sovereign', nameZh: '月神之主', levelRequired: 50, description: 'The ultimate master of all moon pool arts, equal in power to the moon god Tsukiyomi himself.', bonus: '+50% all pool bonuses, +10% creature bond growth' },
];

// =============================================================================
// MP_ARTIFACTS — 15 Legendary Artifacts
// =============================================================================

export const MP_ARTIFACTS: MPArtifactDef[] = [
  {
    id: 'art_moonstone_amulet',
    name: 'Amulet of the First Moon',
    nameZh: '初月护身符',
    description: 'An ancient amulet containing a fragment of the first moonbeam to ever touch water. It pulses with primordial lunar energy.',
    rarity: 'rare',
    power: 30,
    lore: 'Forged by the first depth nymph at the moment the moon first reflected upon the primordial ocean.',
    effect: 'Increases lunar energy regeneration by 20%',
  },
  {
    id: 'art_tidal_crown',
    name: 'Tidal Crown',
    nameZh: '潮汐王冠',
    description: 'A crown made from compressed tidal crystals that hums with the rhythm of the ocean.',
    rarity: 'epic',
    power: 60,
    lore: 'Worn by the ancient Tide Kings who ruled the seven seas before the moon pools existed.',
    effect: '+25% tide summoning power and duration',
  },
  {
    id: 'art_silver_trident',
    name: 'Silver Trident of Poseidon',
    nameZh: '波塞冬银三叉戟',
    description: 'A trident forged from pure lunar silver that can command any body of water it touches.',
    rarity: 'legendary',
    power: 100,
    lore: 'Gifted to the first pool guardian by Poseidon himself, it has been passed down through generations of protectors.',
    effect: 'All tidal abilities gain +30% power and -20% cooldown',
  },
  {
    id: 'art_pearl_of_depths',
    name: 'Pearl of Infinite Depths',
    nameZh: '无尽深渊之珠',
    description: 'A pearl of impossible size that seems to contain an entire ocean within its iridescent surface.',
    rarity: 'epic',
    power: 55,
    lore: 'Found at the very bottom of the Abyssal Lunar Chasm by a diver who never returned.',
    effect: '+15% deep dive rewards and material discovery rate',
  },
  {
    id: 'art_dreamcatcher_net',
    name: 'Dreamcatcher Pool Net',
    nameZh: '捕梦池网',
    description: 'A net woven from dream threads that can capture creatures from the dream realm.',
    rarity: 'rare',
    power: 35,
    lore: 'Created by the Tethys Nymph Queen to catch wayward dream creatures that wandered into physical pools.',
    effect: '+20% chance to capture dream-type creatures',
  },
  {
    id: 'art_lunar_compass',
    name: 'Lunar Compass',
    nameZh: '月相罗盘',
    description: 'A compass that points not north, but toward the nearest source of concentrated lunar energy.',
    rarity: 'uncommon',
    power: 20,
    lore: 'Invented by an eccentric moon pool explorer who got lost one too many times during new moon nights.',
    effect: 'Reveals hidden material locations in explored pools',
  },
  {
    id: 'art_eclipse_orb',
    name: 'Orb of the Eclipse',
    nameZh: '蚀影宝珠',
    description: 'A dark orb that absorbs light and radiates cold, formed during a rare total lunar eclipse.',
    rarity: 'epic',
    power: 70,
    lore: 'Contains the captured darkness of a hundred eclipses. Staring into it reveals secrets best left hidden.',
    effect: 'Shadow abilities gain +35% power during eclipses',
  },
  {
    id: 'art_lotus_tiara',
    name: 'Tiara of Eternal Lotus',
    nameZh: '永恒莲花冠',
    description: 'A living tiara made from a lunar lotus that never wilts, constantly producing healing nectar.',
    rarity: 'rare',
    power: 40,
    lore: 'Crown of the lotus dryad queen, who sacrificed her physical form to become one with her beloved flowers.',
    effect: 'Passive healing of +5 HP per turn for all creatures in active pool',
  },
  {
    id: 'art_chasm_crystal_heart',
    name: 'Heart of the Chasm',
    nameZh: '裂隙之心',
    description: 'A massive crystal formation that beats like a heart, pumping lunar energy through the pool system.',
    rarity: 'legendary',
    power: 120,
    lore: 'The crystallized core of the Abyssal Lunar Chasm itself, removed during an ancient cataclysm.',
    effect: '+30% all structure bonuses and lunar energy capacity',
  },
  {
    id: 'art_starfall_vial',
    name: 'Vial of Captured Starfall',
    nameZh: '星落瓶',
    description: 'A sealed vial containing a miniature captured star that drifts within, still burning after millennia.',
    rarity: 'rare',
    power: 45,
    lore: 'Caught during the Great Starfall by a depth nymph who was then transformed into a constellation.',
    effect: 'Stellar materials appear 25% more frequently during meteor events',
  },
  {
    id: 'art_moonwell_chalice',
    name: 'Chalice of the Moonwell',
    nameZh: '月井圣杯',
    description: 'A sacred chalice from the Moonwell Shrine that transforms any water poured into it into blessed water.',
    rarity: 'epic',
    power: 65,
    lore: 'Used in the coronation ceremonies of ancient pool priestesses, it has never been emptied.',
    effect: 'Automatically converts 10% of harvested pool water into blessed water',
  },
  {
    id: 'art_phantom_scale_mail',
    name: 'Phantom Scale Mail',
    nameZh: '幻影鳞甲',
    description: 'Armor crafted from the shed scales of the Phantom Mane Jelly, nearly weightless and invisible when worn.',
    rarity: 'rare',
    power: 38,
    lore: 'Only visible under full moonlight, it renders the wearer practically ghost-like in dark pools.',
    effect: '-30% damage taken from shadow and depth creatures',
  },
  {
    id: 'art_celestial_sheet_music',
    name: 'Celestial Sheet Music',
    nameZh: '天界乐谱',
    description: 'Musical notation written in starlight on water-proof lunar parchment. When played, pools resonate with cosmic harmony.',
    rarity: 'legendary',
    power: 110,
    lore: 'Composed by the Tethys Nymph Queen over ten thousand years, each note corresponds to a different star.',
    effect: 'All creatures gain +20% bond growth when music is played',
  },
  {
    id: 'art_tide_collar',
    name: 'Tide Caller Collar',
    nameZh: '唤潮项圈',
    description: 'A collar inscribed with tidal runes that allows communication with tide serpents across vast distances.',
    rarity: 'uncommon',
    power: 22,
    lore: 'Used by ancient serpent tamers to coordinate massive tide serpent migrations.',
    effect: '+15% tide serpent capture and bonding success rate',
  },
  {
    id: 'art_primordial_pool_water',
    name: 'Vial of Primordial Pool Water',
    nameZh: '太初池水瓶',
    description: 'A single drop of water from the original moon pool, containing the essence of creation. It glows with an inner light that never fades.',
    rarity: 'legendary',
    power: 150,
    lore: 'Before the world was formed, there was only the Moon and the Pool. This water is from that first Pool.',
    effect: '+50% lunar energy regeneration, all creature abilities enhanced',
  },
];

// =============================================================================
// MP_EVENTS — 12 Pool Events
// =============================================================================

export const MP_EVENTS: MPEventDef[] = [
  {
    id: 'event_supermoon_rise',
    name: 'Supermoon Rise',
    nameZh: '超级月亮',
    description: 'The moon appears 14% larger and 30% brighter than usual, flooding all moon pools with overwhelming lunar energy. Creatures become highly active.',
    type: 'supermoon',
    duration: 3600,
    energyBonus: 50,
    dropBonus: 30,
    requirements: [{ key: 'mpLevel', value: 3 }],
    rewards: [{ energy: 200, material: 'mat_moonstone', quantity: 3 }],
  },
  {
    id: 'event_lunar_eclipse',
    name: 'Lunar Eclipse',
    nameZh: '月食',
    description: 'The shadow of the earth consumes the moon, plunging pools into supernatural darkness. Shadow creatures emerge in unprecedented numbers while light creatures hide.',
    type: 'eclipse',
    duration: 2400,
    energyBonus: 80,
    dropBonus: 50,
    requirements: [{ key: 'mpLevel', value: 7 }],
    rewards: [{ energy: 400, material: 'mat_eclipse_shard', quantity: 5 }],
  },
  {
    id: 'event_spring_tide',
    name: 'King Tide Surge',
    nameZh: '大潮涌动',
    description: 'Sun and moon align to create the most powerful tide of the year, causing all pools to overflow with rare materials washed in from distant waters.',
    type: 'tide_surge',
    duration: 1800,
    energyBonus: 30,
    dropBonus: 40,
    requirements: [{ key: 'mpLevel', value: 5 }],
    rewards: [{ energy: 150, material: 'mat_dark_pearl', quantity: 2 }],
  },
  {
    id: 'event_meteor_shower',
    name: 'Perseid Meteor Pool',
    nameZh: '英仙座流星池',
    description: 'Meteors streak across the sky and those that fall into pools dissolve into star fragments, dramatically boosting stellar material yields.',
    type: 'meteor_shower',
    duration: 2700,
    energyBonus: 40,
    dropBonus: 60,
    requirements: [{ key: 'mpLevel', value: 10 }],
    rewards: [{ energy: 300, material: 'mat_star_fragment', quantity: 4 }],
  },
  {
    id: 'event_northern_aurora',
    name: 'Aurora Over the Pools',
    nameZh: '池上极光',
    description: 'Dancing aurora borealis reflects off pool surfaces, creating prismatic light shows that boost bioluminescent creature activity.',
    type: 'aurora',
    duration: 3000,
    energyBonus: 35,
    dropBonus: 35,
    requirements: [{ key: 'mpLevel', value: 8 }],
    rewards: [{ energy: 250, material: 'mat_nebula_vapor', quantity: 2 }],
  },
  {
    id: 'event_blood_moon',
    name: 'Blood Moon Night',
    nameZh: '血月之夜',
    description: 'The moon turns a deep crimson red, infusing pool waters with raw primal energy. All creatures become more aggressive but yield rarer drops.',
    type: 'blood_moon',
    duration: 2100,
    energyBonus: 60,
    dropBonus: 70,
    requirements: [{ key: 'mpLevel', value: 12 }],
    rewards: [{ energy: 500, material: 'mat_void_essence', quantity: 3 }],
  },
  {
    id: 'event_harvest_moon',
    name: 'Harvest Moon Festival',
    nameZh: '丰收月节',
    description: 'The harvest moon illuminates all pools with warm golden light, doubling all material yields and making lotus flowers bloom out of season.',
    type: 'harvest',
    duration: 3600,
    energyBonus: 25,
    dropBonus: 100,
    requirements: [{ key: 'mpLevel', value: 4 }],
    rewards: [{ energy: 180, material: 'mat_lunar_lotus', quantity: 10 }],
  },
  {
    id: 'event_spirit_night',
    name: 'Night of the Pool Spirits',
    nameZh: '池灵之夜',
    description: 'On this spectral night, the barrier between the physical and spirit realms dissolves within moon pools. Ghost creatures appear and drop unique materials.',
    type: 'spirit_night',
    duration: 2400,
    energyBonus: 45,
    dropBonus: 45,
    requirements: [{ key: 'mpLevel', value: 15 }],
    rewards: [{ energy: 350, material: 'mat_dream_essence', quantity: 3 }],
  },
  {
    id: 'event_crystal_bloom',
    name: 'Crystal Bloom Event',
    nameZh: '水晶绽放',
    description: 'Moon crystals in and around pools undergo a rare synchronized bloom, producing an abundance of crystal materials and revealing hidden crystal caves.',
    type: 'crystal_bloom',
    duration: 3000,
    energyBonus: 30,
    dropBonus: 55,
    requirements: [{ key: 'mpLevel', value: 9 }],
    rewards: [{ energy: 280, material: 'mat_void_crystal', quantity: 4 }],
  },
  {
    id: 'event_frost_tide',
    name: 'Frost Tide',
    nameZh: '冰潮',
    description: 'An unnatural cold sweeps across all moon pools, freezing surface layers and pushing creatures into deeper, warmer waters where rare species lurk.',
    type: 'frost_tide',
    duration: 1800,
    energyBonus: 20,
    dropBonus: 40,
    requirements: [{ key: 'mpLevel', value: 6 }],
    rewards: [{ energy: 200, material: 'mat_pressure_crystal', quantity: 3 }],
  },
  {
    id: 'event_lunar_revelation',
    name: 'Lunar Revelation',
    nameZh: '月光启示',
    description: 'The moonlight achieves perfect clarity, revealing hidden secrets within every pool. Previously invisible areas, creatures, and materials become temporarily visible.',
    type: 'revelation',
    duration: 1200,
    energyBonus: 15,
    dropBonus: 25,
    requirements: [{ key: 'mpLevel', value: 2 }],
    rewards: [{ energy: 100, material: 'mat_mirror_shard', quantity: 5 }],
  },
  {
    id: 'event_convergence',
    name: 'Great Pool Convergence',
    nameZh: '大汇流',
    description: 'Once per year, all moon pools on Earth connect through underground channels, allowing creatures to migrate freely. The rarest of rare creatures may appear in any pool.',
    type: 'convergence',
    duration: 4800,
    energyBonus: 100,
    dropBonus: 80,
    requirements: [{ key: 'mpLevel', value: 18 }],
    rewards: [{ energy: 1000, material: 'mat_primordial_drop', quantity: 1 }],
  },
];

// =============================================================================
// MP_MAX_LEVEL — Maximum Level
// =============================================================================

export const MP_MAX_LEVEL = 50;

// =============================================================================
// MP_MOON_PHASES — Moon Phase Names
// =============================================================================

export const MP_MOON_PHASES = [
  'new_moon',
  'waxing_crescent',
  'first_quarter',
  'waxing_gibbous',
  'full_moon',
  'waning_gibbous',
  'last_quarter',
  'waning_crescent',
] as const;

// =============================================================================
// XP helper
// =============================================================================

function mpXpForLevel(level: number): number {
  if (level >= MP_MAX_LEVEL) return Infinity;
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

// =============================================================================
// Zustand Store
// =============================================================================

const initialMPState: MPMoonPoolState = {
  mpLevel: 1,
  mpExp: 0,
  mpLunarEnergy: 100,
  mpTotalEnergy: 100,
  mpMoonPhase: 'full_moon',
  mpMoonPhaseIndex: 4,
  mpCapturedCreatures: [],
  mpMaterials: [],
  mpStructures: [],
  mpAchievements: [],
  mpCurrentTitle: 'title_moonlit_wader',
  mpUnlockedTitles: ['title_moonlit_wader'],
  mpArtifacts: [],
  mpActiveEvents: [],
  mpTotalDives: 0,
  mpTotalBrews: 0,
  mpTotalMoonlightDrawn: 0,
  mpTotalTidesSummoned: 0,
  mpTotalCreaturesCaptured: 0,
  mpTotalStructuresBuilt: 0,
  mpActivePoolId: 'crescent_basin',
  mpDayCounter: 1,
};

interface MPStore extends MPMoonPoolState, MPMoonPoolActions {}

const useMPStore = create<MPStore>()(
  persist(
    (set, get) => ({
      ...initialMPState,

      mpSetMoonPhase: (phase: string, index: number) => {
        set({ mpMoonPhase: phase, mpMoonPhaseIndex: index });
      },

      mpAdvanceDay: () => {
        const state = get();
        const nextPhaseIndex = (state.mpMoonPhaseIndex + 1) % MP_MOON_PHASES.length;
        set({
          mpDayCounter: state.mpDayCounter + 1,
          mpMoonPhaseIndex: nextPhaseIndex,
          mpMoonPhase: MP_MOON_PHASES[nextPhaseIndex],
        });
      },

      mpAddEnergy: (amount: number) => {
        set((prev) => ({
          mpLunarEnergy: prev.mpLunarEnergy + amount,
          mpTotalEnergy: prev.mpTotalEnergy + amount,
        }));
      },

      mpSpendEnergy: (amount: number) => {
        const state = get();
        if (state.mpLunarEnergy < amount) return false;
        set({ mpLunarEnergy: state.mpLunarEnergy - amount });
        return true;
      },

      mpAddExp: (amount: number) => {
        set((prev) => {
          let level = prev.mpLevel;
          let exp = prev.mpExp + amount;
          while (level < MP_MAX_LEVEL && exp >= mpXpForLevel(level)) {
            const needed = mpXpForLevel(level);
            if (needed === Infinity) break;
            exp -= needed;
            level += 1;
          }
          return { mpLevel: level, mpExp: exp };
        });
      },

      mpCaptureCreature: (creatureId: string, poolId: string) => {
        const state = get();
        const existing = state.mpCapturedCreatures.find(
          (c) => c.creatureId === creatureId && c.poolId === poolId
        );
        if (existing) return false;
        const newCapture: MPCapturedCreature = {
          creatureId,
          capturedAt: Date.now(),
          nickname: null,
          bondLevel: 1,
          poolId,
        };
        set({
          mpCapturedCreatures: [...state.mpCapturedCreatures, newCapture],
          mpTotalCreaturesCaptured: state.mpTotalCreaturesCaptured + 1,
        });
        return true;
      },

      mpReleaseCreature: (captureIndex: number) => {
        const state = get();
        if (captureIndex < 0 || captureIndex >= state.mpCapturedCreatures.length) return false;
        const updated = state.mpCapturedCreatures.filter((_, i) => i !== captureIndex);
        set({ mpCapturedCreatures: updated });
        return true;
      },

      mpBondCreature: (captureIndex: number) => {
        const state = get();
        if (captureIndex < 0 || captureIndex >= state.mpCapturedCreatures.length) return false;
        const creature = state.mpCapturedCreatures[captureIndex];
        if (creature.bondLevel >= 10) return false;
        const updated = [...state.mpCapturedCreatures];
        updated[captureIndex] = { ...creature, bondLevel: creature.bondLevel + 1 };
        set({ mpCapturedCreatures: updated });
        return true;
      },

      mpAddMaterial: (materialId: string, quantity: number) => {
        set((prev) => {
          const existing = prev.mpMaterials.find((m) => m.materialId === materialId);
          if (existing) {
            return {
              mpMaterials: prev.mpMaterials.map((m) =>
                m.materialId === materialId
                  ? { ...m, quantity: m.quantity + quantity }
                  : m
              ),
            };
          }
          return {
            mpMaterials: [...prev.mpMaterials, { materialId, quantity }],
          };
        });
      },

      mpRemoveMaterial: (materialId: string, quantity: number) => {
        const state = get();
        const existing = state.mpMaterials.find((m) => m.materialId === materialId);
        if (!existing || existing.quantity < quantity) return false;
        const updated = state.mpMaterials
          .map((m) =>
            m.materialId === materialId
              ? { ...m, quantity: m.quantity - quantity }
              : m
          )
          .filter((m) => m.quantity > 0);
        set({ mpMaterials: updated });
        return true;
      },

      mpBuildStructure: (structDefId: string) => {
        const state = get();
        const existing = state.mpStructures.find((s) => s.defId === structDefId);
        if (existing) return false;
        const def = MP_STRUCTURES.find((s) => s.id === structDefId);
        if (!def) return false;
        if (state.mpLunarEnergy < def.baseCost) return false;
        const newInstance: MPStructureInstance = {
          defId: structDefId,
          level: 1,
          builtAt: Date.now(),
          lastUpgrade: Date.now(),
        };
        set({
          mpStructures: [...state.mpStructures, newInstance],
          mpLunarEnergy: state.mpLunarEnergy - def.baseCost,
          mpTotalStructuresBuilt: state.mpTotalStructuresBuilt + 1,
        });
        return true;
      },

      mpUpgradeStructure: (structDefId: string) => {
        const state = get();
        const instance = state.mpStructures.find((s) => s.defId === structDefId);
        if (!instance) return false;
        const def = MP_STRUCTURES.find((s) => s.id === structDefId);
        if (!def) return false;
        if (instance.level >= def.maxLevel) return false;
        const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, instance.level));
        if (state.mpLunarEnergy < cost) return false;
        const updated = state.mpStructures.map((s) =>
          s.defId === structDefId
            ? { ...s, level: s.level + 1, lastUpgrade: Date.now() }
            : s
        );
        set({
          mpStructures: updated,
          mpLunarEnergy: state.mpLunarEnergy - cost,
        });
        return true;
      },

      mpUnlockAchievement: (achievementId: string) => {
        const state = get();
        const existing = state.mpAchievements.find(
          (a) => a.achievementId === achievementId
        );
        if (existing && existing.unlocked) return false;
        const def = MP_ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!def) return false;
        const newAchievement: MPAchievementState = {
          achievementId,
          unlocked: true,
          unlockedAt: Date.now(),
        };
        let updatedTitles = state.mpUnlockedTitles;
        if (def.rewardTitle && !updatedTitles.includes(def.rewardTitle)) {
          updatedTitles = [...updatedTitles, def.rewardTitle];
        }
        set({
          mpAchievements: [...state.mpAchievements.filter((a) => a.achievementId !== achievementId), newAchievement],
          mpUnlockedTitles: updatedTitles,
          mpLunarEnergy: state.mpLunarEnergy + def.rewardEnergy,
        });
        get().mpAddExp(def.rewardExp);
        return true;
      },

      mpEquipTitle: (titleId: string) => {
        const state = get();
        if (!state.mpUnlockedTitles.includes(titleId)) return false;
        set({ mpCurrentTitle: titleId });
        return true;
      },

      mpDiscoverArtifact: (artifactId: string) => {
        const state = get();
        const existing = state.mpArtifacts.find((a) => a.artifactId === artifactId);
        if (existing && existing.discovered) return false;
        const newState: MPArtifactState = {
          artifactId,
          discovered: true,
          discoveredAt: Date.now(),
          equipped: false,
        };
        set({
          mpArtifacts: [
            ...state.mpArtifacts.filter((a) => a.artifactId !== artifactId),
            newState,
          ],
        });
        return true;
      },

      mpEquipArtifact: (artifactId: string) => {
        const state = get();
        const artifact = state.mpArtifacts.find((a) => a.artifactId === artifactId);
        if (!artifact || !artifact.discovered) return false;
        const updated = state.mpArtifacts.map((a) =>
          a.artifactId === artifactId ? { ...a, equipped: true } : a
        );
        set({ mpArtifacts: updated });
        return true;
      },

      mpUnequipArtifact: (artifactId: string) => {
        set((prev) => ({
          mpArtifacts: prev.mpArtifacts.map((a) =>
            a.artifactId === artifactId ? { ...a, equipped: false } : a
          ),
        }));
      },

      mpStartEvent: (eventId: string) => {
        const state = get();
        const def = MP_EVENTS.find((e) => e.id === eventId);
        if (!def) return false;
        const now = Date.now();
        const newEventState: MPEventState = {
          eventId,
          active: true,
          startedAt: now,
          expiresAt: now + def.duration * 1000,
        };
        set({
          mpActiveEvents: [
            ...state.mpActiveEvents.filter((e) => e.eventId !== eventId),
            newEventState,
          ],
        });
        return true;
      },

      mpEndEvent: (eventId: string) => {
        set((prev) => ({
          mpActiveEvents: prev.mpActiveEvents.map((e) =>
            e.eventId === eventId
              ? { ...e, active: false, expiresAt: Date.now() }
              : e
          ),
        }));
      },

      mpSetActivePool: (poolId: string) => {
        set({ mpActivePoolId: poolId });
      },

      mpIncrementStat: (stat) => {
        set((prev) => ({ [stat]: prev[stat] + 1 }));
      },

      mpResetProgress: () => {
        set(initialMPState);
      },
    }),
    {
      name: 'moon-pool-storage',
      partialize: (state) => ({
        mpLevel: state.mpLevel,
        mpExp: state.mpExp,
        mpLunarEnergy: state.mpLunarEnergy,
        mpTotalEnergy: state.mpTotalEnergy,
        mpMoonPhase: state.mpMoonPhase,
        mpMoonPhaseIndex: state.mpMoonPhaseIndex,
        mpCapturedCreatures: state.mpCapturedCreatures,
        mpMaterials: state.mpMaterials,
        mpStructures: state.mpStructures,
        mpAchievements: state.mpAchievements,
        mpCurrentTitle: state.mpCurrentTitle,
        mpUnlockedTitles: state.mpUnlockedTitles,
        mpArtifacts: state.mpArtifacts,
        mpActiveEvents: state.mpActiveEvents,
        mpTotalDives: state.mpTotalDives,
        mpTotalBrews: state.mpTotalBrews,
        mpTotalMoonlightDrawn: state.mpTotalMoonlightDrawn,
        mpTotalTidesSummoned: state.mpTotalTidesSummoned,
        mpTotalCreaturesCaptured: state.mpTotalCreaturesCaptured,
        mpTotalStructuresBuilt: state.mpTotalStructuresBuilt,
        mpActivePoolId: state.mpActivePoolId,
        mpDayCounter: state.mpDayCounter,
      }),
    }
  )
);

// =============================================================================
// Hook: useMoonPool
// =============================================================================

export default function useMoonPool() {
  const state = useMPStore();
  const stateRef = useRef<MPStore>(state);

  // ---- stateRef sync: ONLY inside useEffect ----
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Helper: XP for next level ----
  const mpXpForNextLevel = useMemo(() => {
    return mpXpForLevel(state.mpLevel);
  }, [state]);

  // ---- Helper: Level progress percentage ----
  const mpLevelProgress = useMemo(() => {
    const needed = mpXpForLevel(state.mpLevel);
    if (needed === Infinity) return 100;
    return Math.min(100, Math.round((state.mpExp / needed) * 100));
  }, [state]);

  // ---- Helper: Creatures by rarity ----
  const mpCreaturesByRarity = useMemo(() => {
    const result: Record<MPRarity, MPCreatureDef[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    };
    for (const creature of MP_CREATURES) {
      result[creature.rarity].push(creature);
    }
    return result;
  }, [state]);

  // ---- Helper: Creatures by species ----
  const mpCreaturesBySpecies = useMemo(() => {
    const result: Record<MPSpeciesType, MPCreatureDef[]> = {
      moon_jelly: [],
      lunar_fish: [],
      silver_frog: [],
      tide_serpent: [],
      night_heron: [],
      star_crab: [],
      depth_nymph: [],
    };
    for (const creature of MP_CREATURES) {
      result[creature.species].push(creature);
    }
    return result;
  }, [state]);

  // ---- Helper: Pools by biome ----
  const mpPoolsByBiome = useMemo(() => {
    const result: Record<MPPoolBiome, MPPoolDef[]> = {
      freshwater: [],
      saltwater: [],
      brackish: [],
      enchanted: [],
      subterranean: [],
      celestial: [],
      abyssal: [],
      dream: [],
    };
    for (const pool of MP_POOLS) {
      result[pool.biome].push(pool);
    }
    return result;
  }, [state]);

  // ---- Helper: Active pool definition ----
  const mpActivePoolDef = useMemo(() => {
    return MP_POOLS.find((p) => p.id === state.mpActivePoolId) ?? null;
  }, [state]);

  // ---- Helper: Total captured count ----
  const mpCapturedCount = useMemo(() => {
    return state.mpCapturedCreatures.length;
  }, [state]);

  // ---- Helper: Unique captured species count ----
  const mpUniqueSpeciesCaptured = useMemo(() => {
    const speciesSet = new Set(state.mpCapturedCreatures.map((c) => c.creatureId));
    return speciesSet.size;
  }, [state]);

  // ---- Helper: Unlocked achievements count ----
  const mpUnlockedAchievementCount = useMemo(() => {
    return state.mpAchievements.filter((a) => a.unlocked).length;
  }, [state]);

  // ---- Helper: Achievable achievements ----
  const mpAchievableAchievements = useMemo(() => {
    return MP_ACHIEVEMENTS.filter((def) => {
      const alreadyUnlocked = state.mpAchievements.some(
        (a) => a.achievementId === def.id && a.unlocked
      );
      if (alreadyUnlocked) return false;
      const statValue = (state as unknown as Record<string, number>)[def.conditionKey];
      return typeof statValue === 'number' && statValue >= def.targetValue;
    });
  }, [state]);

  // ---- Helper: Total structure levels ----
  const mpTotalStructureLevels = useMemo(() => {
    return state.mpStructures.reduce((sum, s) => sum + s.level, 0);
  }, [state]);

  // ---- Helper: Discovered artifacts count ----
  const mpDiscoveredArtifactCount = useMemo(() => {
    return state.mpArtifacts.filter((a) => a.discovered).length;
  }, [state]);

  // ---- Helper: Equipped artifacts ----
  const mpEquippedArtifacts = useMemo(() => {
    return state.mpArtifacts.filter((a) => a.equipped);
  }, [state]);

  // ---- Helper: Equipped artifacts total power ----
  const mpEquippedArtifactPower = useMemo(() => {
    const equippedIds = state.mpArtifacts.filter((a) => a.equipped).map((a) => a.artifactId);
    return equippedIds.reduce((sum, id) => {
      const def = MP_ARTIFACTS.find((a) => a.id === id);
      return sum + (def?.power ?? 0);
    }, 0);
  }, [state]);

  // ---- Helper: Materials by rarity ----
  const mpMaterialsByRarity = useMemo(() => {
    const result: Record<MPRarity, MPMaterialDef[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    };
    for (const mat of MP_MATERIALS) {
      result[mat.rarity].push(mat);
    }
    return result;
  }, [state]);

  // ---- Helper: Structures by category ----
  const mpStructuresByCategory = useMemo(() => {
    const result: Record<MPStructureCategory, MPStructureDef[]> = {
      pool: [],
      lab: [],
      garden: [],
      tower: [],
      shrine: [],
      forge: [],
      harbor: [],
      archive: [],
    };
    for (const struct of MP_STRUCTURES) {
      result[struct.category].push(struct);
    }
    return result;
  }, [state]);

  // ---- Helper: Abilities by school ----
  const mpAbilitiesBySchool = useMemo(() => {
    const result: Record<MPAbilitySchool, MPAbilityDef[]> = {
      lunar: [],
      tidal: [],
      silver: [],
      shadow: [],
      dream: [],
      crystal: [],
    };
    for (const ability of MP_ABILITIES) {
      result[ability.school].push(ability);
    }
    return result;
  }, [state]);

  // ---- Helper: Events by type ----
  const mpEventsByType = useMemo(() => {
    const result: Record<MPEventType, MPEventDef[]> = {
      eclipse: [],
      supermoon: [],
      tide_surge: [],
      meteor_shower: [],
      aurora: [],
      blood_moon: [],
      harvest: [],
      spirit_night: [],
      crystal_bloom: [],
      frost_tide: [],
      revelation: [],
      convergence: [],
    };
    for (const event of MP_EVENTS) {
      result[event.type].push(event);
    }
    return result;
  }, [state]);

  // ---- Helper: Currently active events ----
  const mpCurrentlyActiveEvents = useMemo(() => {
    const now = Date.now();
    return state.mpActiveEvents.filter((e) => e.active && e.expiresAt !== null && e.expiresAt > now);
  }, [state]);

  // ---- Helper: Can build structure check ----
  const mpCanBuildStructure = useMemo(() => {
    const builtIds = new Set(state.mpStructures.map((s) => s.defId));
    return (structDefId: string): boolean => {
      if (builtIds.has(structDefId)) return false;
      const def = MP_STRUCTURES.find((s) => s.id === structDefId);
      if (!def) return false;
      return state.mpLunarEnergy >= def.baseCost;
    };
  }, [state]);

  // ---- Helper: Upgrade cost for structure ----
  const mpGetUpgradeCost = useMemo(() => {
    return (structDefId: string): number => {
      const instance = state.mpStructures.find((s) => s.defId === structDefId);
      const def = MP_STRUCTURES.find((s) => s.id === structDefId);
      if (!instance || !def || instance.level >= def.maxLevel) return 0;
      return Math.floor(def.baseCost * Math.pow(def.costMultiplier, instance.level));
    };
  }, [state]);

  // ---- Helper: Get creature def by id ----
  const mpGetCreatureDef = useMemo(() => {
    return (creatureId: string): MPCreatureDef | null => {
      return MP_CREATURES.find((c) => c.id === creatureId) ?? null;
    };
  }, [state]);

  // ---- Helper: Get species def ----
  const mpGetSpeciesDef = useMemo(() => {
    return (speciesId: MPSpeciesType): MPSpeciesDef | null => {
      return MP_SPECIES.find((s) => s.id === speciesId) ?? null;
    };
  }, [state]);

  // ---- Helper: Current title def ----
  const mpCurrentTitleDef = useMemo(() => {
    return MP_TITLES.find((t) => t.id === state.mpCurrentTitle) ?? null;
  }, [state]);

  // ---- Helper: Next title ----
  const mpNextTitle = useMemo(() => {
    const availableTitles = MP_TITLES.filter(
      (t) => !state.mpUnlockedTitles.includes(t.id)
    );
    if (availableTitles.length === 0) return null;
    availableTitles.sort((a, b) => a.levelRequired - b.levelRequired);
    return availableTitles[0];
  }, [state]);

  // ---- Helper: Title progress toward next ----
  const mpTitleProgress = useMemo(() => {
    if (!mpNextTitle) return 100;
    const prevTitles = MP_TITLES.filter(
      (t) => state.mpUnlockedTitles.includes(t.id) && t.levelRequired < mpNextTitle.levelRequired
    );
    const currentLevelReq = prevTitles.length > 0
      ? Math.max(...prevTitles.map((t) => t.levelRequired))
      : 1;
    const range = mpNextTitle.levelRequired - currentLevelReq;
    if (range <= 0) return 100;
    const progress = state.mpLevel - currentLevelReq;
    return Math.min(100, Math.round((progress / range) * 100));
  }, [state, mpNextTitle]);

  // ---- Action wrappers that also do effects inside useEffect ----

  // Effect-driven achievement check
  useEffect(() => {
    const checkAchievements = (): void => {
      const stateVal = stateRef.current;
      for (const def of MP_ACHIEVEMENTS) {
        const alreadyUnlocked = stateVal.mpAchievements.some(
          (a) => a.achievementId === def.id && a.unlocked
        );
        if (alreadyUnlocked) continue;
        const statValue = (stateVal as unknown as Record<string, number>)[def.conditionKey];
        if (typeof statValue === 'number' && statValue >= def.targetValue) {
          stateVal.mpUnlockAchievement(def.id);
        }
      }
    };
    checkAchievements();
  }, [state.mpTotalDives, state.mpTotalBrews, state.mpTotalMoonlightDrawn, state.mpTotalTidesSummoned, state.mpTotalCreaturesCaptured, state.mpTotalStructuresBuilt, state.mpLevel]);

  // ---- Action: Draw Moonlight ----
  const mpDrawMoonlight = useCallback((): number => {
    const phaseMultiplier = state.mpMoonPhase === 'full_moon' ? 3.0
      : state.mpMoonPhase === 'new_moon' ? 0.5
      : state.mpMoonPhaseIndex >= 3 && state.mpMoonPhaseIndex <= 5 ? 1.5
      : 1.0;
    const poolBonus = state.mpStructures.filter((s) => s.defId === 'struct_moonlight_tower')
      .reduce((sum, s) => sum + s.level * 5, 0);
    const base = 10;
    const amount = Math.floor((base + poolBonus) * phaseMultiplier);
    useMPStore.getState().mpAddEnergy(amount);
    useMPStore.getState().mpIncrementStat('mpTotalMoonlightDrawn');
    return amount;
  }, [state.mpMoonPhase, state.mpMoonPhaseIndex, state.mpStructures]);

  // ---- Action: Brew Elixir ----
  const mpBrewElixir = useCallback((): boolean => {
    const hasLab = state.mpStructures.some((s) => s.defId === 'struct_alchemy_lab');
    if (!hasLab) return false;
    const labLevel = state.mpStructures
      .filter((s) => s.defId === 'struct_alchemy_lab')
      .reduce((max, s) => Math.max(max, s.level), 0);
    const cost = Math.max(10, 30 - labLevel * 2);
    const spent = useMPStore.getState().mpSpendEnergy(cost);
    if (!spent) return false;
    useMPStore.getState().mpAddExp(labLevel * 5 + 5);
    useMPStore.getState().mpIncrementStat('mpTotalBrews');
    return true;
  }, [state.mpStructures]);

  // ---- Action: Dive Pool ----
  const mpDivePool = useCallback((): { success: boolean; materialsFound: number; creaturesFound: number } => {
    const poolDef = MP_POOLS.find((p) => p.id === state.mpActivePoolId);
    if (!poolDef) return { success: false, materialsFound: 0, creaturesFound: 0 };
    const diveCost = Math.floor(poolDef.depth * 0.5);
    const canAfford = state.mpLunarEnergy >= diveCost;
    if (!canAfford) return { success: false, materialsFound: 0, creaturesFound: 0 };
    useMPStore.getState().mpSpendEnergy(diveCost);
    useMPStore.getState().mpIncrementStat('mpTotalDives');
    const materialsFound = Math.floor(poolDef.depth / 20) + 1;
    const creaturesFound = poolDef.creatureCapacity > 10 ? 2 : 1;
    if (materialsFound > 0 && poolDef.materials.length > 0) {
      const matId = poolDef.materials[0];
      useMPStore.getState().mpAddMaterial(matId, materialsFound);
    }
    return { success: true, materialsFound, creaturesFound };
  }, [state.mpActivePoolId, state.mpLunarEnergy]);

  // ---- Action: Summon Tide ----
  const mpSummonTide = useCallback((): { success: boolean; power: number } => {
    const hasTideGate = state.mpStructures.some((s) => s.defId === 'struct_tide_gate');
    const gateLevel = state.mpStructures
      .filter((s) => s.defId === 'struct_tide_gate')
      .reduce((sum, s) => sum + s.level, 0);
    const basePower = 20;
    const power = basePower + gateLevel * 10 + (hasTideGate ? 15 : 0);
    const cost = Math.max(15, power / 2);
    const spent = useMPStore.getState().mpSpendEnergy(cost);
    if (!spent) return { success: false, power: 0 };
    useMPStore.getState().mpIncrementStat('mpTotalTidesSummoned');
    return { success: true, power };
  }, [state.mpStructures]);

  // ---- Action: Name creature ----
  const mpNameCreature = useCallback((captureIndex: number, nickname: string): boolean => {
    const s = useMPStore.getState();
    if (captureIndex < 0 || captureIndex >= s.mpCapturedCreatures.length) return false;
    const updated = [...s.mpCapturedCreatures];
    updated[captureIndex] = { ...updated[captureIndex], nickname };
    useMPStore.setState({ mpCapturedCreatures: updated });
    return true;
  }, []);

  // ---- Action: Get pool creatures ----
  const mpGetPoolCreatures = useCallback((poolId: string): MPCapturedCreature[] => {
    return useMPStore.getState().mpCapturedCreatures.filter((c) => c.poolId === poolId);
  }, []);

  // ---- Action: Get material quantity ----
  const mpGetMaterialQuantity = useCallback((materialId: string): number => {
    const mat = useMPStore.getState().mpMaterials.find((m) => m.materialId === materialId);
    return mat?.quantity ?? 0;
  }, []);

  // ---- Action: Check if creature is captured ----
  const mpIsCreatureCaptured = useCallback((creatureId: string): boolean => {
    return useMPStore.getState().mpCapturedCreatures.some((c) => c.creatureId === creatureId);
  }, []);

  // ---- Action: Get structure level ----
  const mpGetStructureLevel = useCallback((structDefId: string): number => {
    const inst = useMPStore.getState().mpStructures.find((s) => s.defId === structDefId);
    return inst?.level ?? 0;
  }, []);

  // ---- Action: Check if achievement is unlocked ----
  const mpIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return useMPStore.getState().mpAchievements.some(
      (a) => a.achievementId === achievementId && a.unlocked
    );
  }, []);

  // ---- Action: Check if artifact is discovered ----
  const mpIsArtifactDiscovered = useCallback((artifactId: string): boolean => {
    return useMPStore.getState().mpArtifacts.some(
      (a) => a.artifactId === artifactId && a.discovered
    );
  }, []);

  // ---- Action: Check if event is active ----
  const mpIsEventActive = useCallback((eventId: string): boolean => {
    const now = Date.now();
    return useMPStore.getState().mpActiveEvents.some(
      (e) => e.eventId === eventId && e.active && e.expiresAt !== null && e.expiresAt > now
    );
  }, []);

  // ---- Computed: Overall progress ----
  const mpOverallProgress = useMemo(() => {
    return Math.round((state.mpLevel / MP_MAX_LEVEL) * 100);
  }, [state]);

  // ---- Computed: Creature collection completion ----
  const mpCollectionCompletion = useMemo(() => {
    const captured = new Set(state.mpCapturedCreatures.map((c) => c.creatureId)).size;
    return {
      captured,
      total: MP_CREATURES.length,
      percent: Math.round((captured / MP_CREATURES.length) * 100),
    };
  }, [state]);

  // ---- Computed: Artifact collection completion ----
  const mpArtifactCompletion = useMemo(() => {
    const discovered = state.mpArtifacts.filter((a) => a.discovered).length;
    return {
      discovered,
      total: MP_ARTIFACTS.length,
      percent: Math.round((discovered / MP_ARTIFACTS.length) * 100),
    };
  }, [state]);

  // ---- Computed: Achievement completion ----
  const mpAchievementCompletion = useMemo(() => {
    const unlocked = state.mpAchievements.filter((a) => a.unlocked).length;
    return {
      unlocked,
      total: MP_ACHIEVEMENTS.length,
      percent: Math.round((unlocked / MP_ACHIEVEMENTS.length) * 100),
    };
  }, [state]);

  // ---- Computed: Pool unlock completion ----
  const mpPoolCompletion = useMemo(() => {
    const unlocked = MP_POOLS.filter((p) => p.unlockLevel <= state.mpLevel).length;
    return {
      unlocked,
      total: MP_POOLS.length,
      percent: Math.round((unlocked / MP_POOLS.length) * 100),
    };
  }, [state]);

  // ---- Computed: Total material count ----
  const mpTotalMaterialCount = useMemo(() => {
    return state.mpMaterials.reduce((sum, m) => sum + m.quantity, 0);
  }, [state]);

  // ---- Computed: Current moon phase display info ----
  const mpMoonPhaseDisplay = useMemo(() => {
    const phaseName = state.mpMoonPhase.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      id: state.mpMoonPhase,
      name: phaseName,
      index: state.mpMoonPhaseIndex,
      isFullMoon: state.mpMoonPhase === 'full_moon',
      isNewMoon: state.mpMoonPhase === 'new_moon',
      daysInCycle: MP_MOON_PHASES.length,
    };
  }, [state]);

  // ---- Computed: Moon phase multiplier ----
  const mpPhaseMultiplier = useMemo(() => {
    if (state.mpMoonPhase === 'full_moon') return 3.0;
    if (state.mpMoonPhase === 'new_moon') return 0.5;
    if (state.mpMoonPhaseIndex >= 3 && state.mpMoonPhaseIndex <= 5) return 1.5;
    return 1.0;
  }, [state]);

  // ---- Computed: Species summary ----
  const mpSpeciesSummary = useMemo(() => {
    return MP_SPECIES.map((sp) => {
      const creatureCount = MP_CREATURES.filter((c) => c.species === sp.id).length;
      const capturedCount = state.mpCapturedCreatures.filter((c) => {
        const def = MP_CREATURES.find((cr) => cr.id === c.creatureId);
        return def?.species === sp.id;
      }).length;
      return {
        species: sp,
        totalCreatures: creatureCount,
        capturedCount,
        completionPercent: creatureCount > 0 ? Math.round((capturedCount / creatureCount) * 100) : 0,
      };
    });
  }, [state]);

  // ---- Computed: Pool summary with creature counts ----
  const mpPoolSummary = useMemo(() => {
    return MP_POOLS.map((pool) => {
      const creatureCount = state.mpCapturedCreatures.filter((c) => c.poolId === pool.id).length;
      const poolCreatures = MP_CREATURES.filter((c) => c.preferredPool === pool.id);
      const isUnlocked = state.mpLevel >= pool.unlockLevel;
      const isActive = state.mpActivePoolId === pool.id;
      return {
        pool,
        capturedCreatures: creatureCount,
        availableCreatures: poolCreatures,
        isUnlocked,
        isActive,
      };
    });
  }, [state]);

  // ---- Computed: Structure summary with upgrade info ----
  const mpStructureSummary = useMemo(() => {
    return MP_STRUCTURES.map((def) => {
      const instance = state.mpStructures.find((s) => s.defId === def.id);
      const isBuilt = !!instance;
      const level = instance?.level ?? 0;
      const isMaxLevel = level >= def.maxLevel;
      const upgradeCost = isBuilt && !isMaxLevel
        ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, level))
        : 0;
      const canUpgrade = isBuilt && !isMaxLevel && state.mpLunarEnergy >= upgradeCost;
      const canBuild = !isBuilt && state.mpLunarEnergy >= def.baseCost;
      return {
        def,
        instance: instance ?? null,
        isBuilt,
        level,
        isMaxLevel,
        upgradeCost,
        canUpgrade,
        canBuild,
      };
    });
  }, [state]);

  // ---- Computed: Rarity distribution of captured creatures ----
  const mpCapturedRarityDistribution = useMemo(() => {
    const dist: Record<MPRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };
    for (const cap of state.mpCapturedCreatures) {
      const def = MP_CREATURES.find((c) => c.id === cap.creatureId);
      if (def) {
        dist[def.rarity]++;
      }
    }
    return dist;
  }, [state]);

  // ---- Computed: Active event bonuses combined ----
  const mpActiveEventBonuses = useMemo(() => {
    const now = Date.now();
    const active = state.mpActiveEvents.filter(
      (e) => e.active && e.expiresAt !== null && e.expiresAt > now
    );
    const totalEnergyBonus = active.reduce((sum, e) => {
      const def = MP_EVENTS.find((ev) => ev.id === e.eventId);
      return sum + (def?.energyBonus ?? 0);
    }, 0);
    const totalDropBonus = active.reduce((sum, e) => {
      const def = MP_EVENTS.find((ev) => ev.id === e.eventId);
      return sum + (def?.dropBonus ?? 0);
    }, 0);
    return {
      activeEventCount: active.length,
      totalEnergyBonus,
      totalDropBonus,
      activeEventIds: active.map((e) => e.eventId),
    };
  }, [state]);

  // ---- Computed: Available abilities ----
  const mpAvailableAbilities = useMemo(() => {
    const builtStructureIds = new Set(state.mpStructures.map((s) => s.defId));
    return MP_ABILITIES.filter((ability) => {
      if (!ability.requires) return true;
      return builtStructureIds.has(ability.requires);
    });
  }, [state]);

  // ---- Computed: Power ranking of captured creatures ----
  const mpCapturedPowerRanking = useMemo(() => {
    const ranked = state.mpCapturedCreatures
      .map((cap) => {
        const def = MP_CREATURES.find((c) => c.id === cap.creatureId);
        if (!def) return null;
        return {
          capture: cap,
          def,
          effectivePower: def.power + cap.bondLevel * 5,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.effectivePower - a.effectivePower);
    return ranked;
  }, [state]);

  // ---- Computed: Pool creature capacity usage ----
  const mpPoolCapacityUsage = useMemo(() => {
    return MP_POOLS.map((pool) => {
      const used = state.mpCapturedCreatures.filter((c) => c.poolId === pool.id).length;
      return {
        poolId: pool.id,
        poolName: pool.name,
        used,
        capacity: pool.creatureCapacity,
        isFull: used >= pool.creatureCapacity,
        percent: Math.round((used / pool.creatureCapacity) * 100),
      };
    });
  }, [state]);

  // ---- Computed: Events that can be started ----
  const mpStartableEvents = useMemo(() => {
    return MP_EVENTS.filter((def) => {
      for (const req of def.requirements) {
        const val = (state as unknown as Record<string, number>)[req.key];
        if (typeof val !== 'number' || val < req.value) return false;
      }
      const alreadyActive = state.mpActiveEvents.some(
        (e) => e.eventId === def.id && e.active
      );
      if (alreadyActive) return false;
      return true;
    });
  }, [state]);

  // ---- Computed: Material inventory summary ----
  const mpMaterialInventory = useMemo(() => {
    return state.mpMaterials.map((inv) => {
      const def = MP_MATERIALS.find((m) => m.id === inv.materialId);
      return {
        materialId: inv.materialId,
        quantity: inv.quantity,
        def: def ?? null,
        name: def?.name ?? inv.materialId,
        rarity: def?.rarity ?? 'common',
        valuePerUnit: def?.value ?? 0,
        totalValue: (def?.value ?? 0) * inv.quantity,
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
  }, [state]);

  // ---- Computed: Next milestone for achievements ----
  const mpNextAchievementMilestone = useMemo(() => {
    const locked = MP_ACHIEVEMENTS.filter((def) => {
      return !state.mpAchievements.some(
        (a) => a.achievementId === def.id && a.unlocked
      );
    });
    if (locked.length === 0) return null;
    return locked[0];
  }, [state]);

  // ---- Computed: Stats summary object ----
  const mpStatsSummary = useMemo(() => {
    return {
      totalDives: state.mpTotalDives,
      totalBrews: state.mpTotalBrews,
      totalMoonlightDrawn: state.mpTotalMoonlightDrawn,
      totalTidesSummoned: state.mpTotalTidesSummoned,
      totalCreaturesCaptured: state.mpTotalCreaturesCaptured,
      totalStructuresBuilt: state.mpTotalStructuresBuilt,
      totalEnergyGenerated: state.mpTotalEnergy,
      currentEnergy: state.mpLunarEnergy,
      dayCounter: state.mpDayCounter,
    };
  }, [state]);

  // ---- Return the complete API ----
  return {
    // --- Constants ---
    MP_SPECIES,
    MP_CREATURES,
    MP_POOLS,
    MP_MATERIALS,
    MP_STRUCTURES,
    MP_ABILITIES,
    MP_ACHIEVEMENTS,
    MP_TITLES,
    MP_ARTIFACTS,
    MP_EVENTS,
    MP_MOON_PHASES,
    MP_MAX_LEVEL,
    MP_COLOR_MOONLIGHT_SILVER,
    MP_COLOR_POOL_BLUE,
    MP_COLOR_LUNAR_GOLD,
    MP_COLOR_NIGHT_INDIGO,
    MP_COLOR_DEEP_LUNAR,
    MP_COLOR_STARLIGHT,
    MP_COLOR_SHADOW_POOL,
    MP_COLOR_CRYSTAL_AZURE,
    MP_COLOR_ABYSS_BLACK,
    MP_COLOR_ECLIPSE_RED,

    // --- State ---
    mpLevel: state.mpLevel,
    mpExp: state.mpExp,
    mpLunarEnergy: state.mpLunarEnergy,
    mpMoonPhase: state.mpMoonPhase,
    mpMoonPhaseIndex: state.mpMoonPhaseIndex,
    mpCapturedCreatures: state.mpCapturedCreatures,
    mpMaterials: state.mpMaterials,
    mpStructures: state.mpStructures,
    mpAchievements: state.mpAchievements,
    mpCurrentTitle: state.mpCurrentTitle,
    mpUnlockedTitles: state.mpUnlockedTitles,
    mpArtifacts: state.mpArtifacts,
    mpActiveEvents: state.mpActiveEvents,
    mpTotalDives: state.mpTotalDives,
    mpTotalBrews: state.mpTotalBrews,
    mpTotalMoonlightDrawn: state.mpTotalMoonlightDrawn,
    mpTotalTidesSummoned: state.mpTotalTidesSummoned,
    mpTotalCreaturesCaptured: state.mpTotalCreaturesCaptured,
    mpTotalStructuresBuilt: state.mpTotalStructuresBuilt,
    mpActivePoolId: state.mpActivePoolId,
    mpDayCounter: state.mpDayCounter,

    // --- Actions ---
    mpSetMoonPhase: state.mpSetMoonPhase,
    mpAdvanceDay: state.mpAdvanceDay,
    mpAddEnergy: state.mpAddEnergy,
    mpSpendEnergy: state.mpSpendEnergy,
    mpAddExp: state.mpAddExp,
    mpCaptureCreature: state.mpCaptureCreature,
    mpReleaseCreature: state.mpReleaseCreature,
    mpBondCreature: state.mpBondCreature,
    mpAddMaterial: state.mpAddMaterial,
    mpRemoveMaterial: state.mpRemoveMaterial,
    mpBuildStructure: state.mpBuildStructure,
    mpUpgradeStructure: state.mpUpgradeStructure,
    mpUnlockAchievement: state.mpUnlockAchievement,
    mpEquipTitle: state.mpEquipTitle,
    mpDiscoverArtifact: state.mpDiscoverArtifact,
    mpEquipArtifact: state.mpEquipArtifact,
    mpUnequipArtifact: state.mpUnequipArtifact,
    mpStartEvent: state.mpStartEvent,
    mpEndEvent: state.mpEndEvent,
    mpSetActivePool: state.mpSetActivePool,
    mpIncrementStat: state.mpIncrementStat,
    mpResetProgress: state.mpResetProgress,

    // --- Action Wrappers ---
    mpDrawMoonlight,
    mpBrewElixir,
    mpDivePool,
    mpSummonTide,
    mpNameCreature,
    mpGetPoolCreatures,
    mpGetMaterialQuantity,
    mpIsCreatureCaptured,
    mpGetStructureLevel,
    mpIsAchievementUnlocked,
    mpIsArtifactDiscovered,
    mpIsEventActive,

    // --- Computed / Helpers ---
    mpXpForNextLevel,
    mpLevelProgress,
    mpCreaturesByRarity,
    mpCreaturesBySpecies,
    mpPoolsByBiome,
    mpActivePoolDef,
    mpCapturedCount,
    mpUniqueSpeciesCaptured,
    mpUnlockedAchievementCount,
    mpAchievableAchievements,
    mpTotalStructureLevels,
    mpDiscoveredArtifactCount,
    mpEquippedArtifacts,
    mpEquippedArtifactPower,
    mpMaterialsByRarity,
    mpStructuresByCategory,
    mpAbilitiesBySchool,
    mpEventsByType,
    mpCurrentlyActiveEvents,
    mpCanBuildStructure,
    mpGetUpgradeCost,
    mpGetCreatureDef,
    mpGetSpeciesDef,
    mpCurrentTitleDef,
    mpNextTitle,
    mpTitleProgress,
    mpOverallProgress,
    mpCollectionCompletion,
    mpArtifactCompletion,
    mpAchievementCompletion,
    mpPoolCompletion,
    mpTotalMaterialCount,
    mpMoonPhaseDisplay,
    mpPhaseMultiplier,
    mpSpeciesSummary,
    mpPoolSummary,
    mpStructureSummary,
    mpCapturedRarityDistribution,
    mpActiveEventBonuses,
    mpAvailableAbilities,
    mpCapturedPowerRanking,
    mpPoolCapacityUsage,
    mpStartableEvents,
    mpMaterialInventory,
    mpNextAchievementMilestone,
    mpStatsSummary,
  };
}
