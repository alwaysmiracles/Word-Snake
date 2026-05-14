'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// FLUX REALM — 变量领域 Wire Module for Word Snake
// Color Theme: fire #FF6347 | water #4169E1 | earth #8B4513 | lightning #FFD700
// ═══════════════════════════════════════════════════════════════════════════

// ─── Type Definitions ─────────────────────────────────────────────────────

type FxRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type FxElementType = 'fire' | 'water' | 'earth' | 'air' | 'lightning' | 'ice' | 'shadow';

interface FxElemental {
  id: string;
  name: string;
  type: FxElementType;
  rarity: FxRarity;
  power: number;
  color: string;
  description: string;
  passive: string;
  lore: string;
}

interface FxZone {
  id: string;
  name: string;
  element: FxElementType;
  description: string;
  longDescription: string;
  baseStability: number;
  maxStability: number;
  rewards: string[];
  hazardLevel: number;
}

interface FxMaterial {
  id: string;
  name: string;
  element: FxElementType;
  rarity: FxRarity;
  description: string;
  value: number;
  source: string;
  tier: number;
}

interface FxStructure {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  element: FxElementType;
  maxLevel: 10;
  baseCost: number;
  costPerLevel: number;
  effectPerLevel: string;
  category: 'synergy' | 'production' | 'defense' | 'utility';
  prerequisite: string;
}

interface FxAbility {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  element: FxElementType;
  cooldown: number;
  power: number;
  unlockCondition: string;
  manaCost: number;
  tier: number;
}

interface FxAchievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: string;
  rewardDetail: string;
  icon: string;
  category: 'collection' | 'combat' | 'exploration' | 'social' | 'mastery';
  hidden: boolean;
}

interface FxTitle {
  id: string;
  name: string;
  description: string;
  requirement: string;
  bonus: string;
  rarity: FxRarity;
  cosmetic: string;
}

interface FxArtifact {
  id: string;
  name: string;
  description: string;
  rarity: FxRarity;
  element: FxElementType;
  effect: string;
  passiveEffect: string;
  lore: string;
  awakeningCost: number;
}

interface FxEvent {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  duration: number;
  effect: string;
  element: FxElementType;
  triggerChance: number;
  severity: 'mild' | 'moderate' | 'severe' | 'catastrophic';
  mitigation: string;
}

interface FxSynergy {
  typeA: FxElementType;
  typeB: FxElementType;
  name: string;
  effect: string;
  multiplier: number;
}

interface FxRealmState {
  fxElementals: string[];
  fxZones: Record<string, number>;
  fxInventory: Record<string, number>;
  fxArtifacts: string[];
  fxAchievements: string[];
  fxTitle: string;
  fxEvents: string[];
  fxStats: {
    elementalsBound: number;
    zonesStabilized: number;
    structuresBuilt: number;
    structuresUpgraded: number;
    artifactsActivated: number;
    realmEvents: number;
    totalPower: number;
    highestStreak: number;
    wordsCollected: number;
    fluxAbsorbed: number;
    synergiesTriggered: number;
    abilitiesUsed: number;
    materialsRefined: number;
    titlesUnlocked: number;
  };
}

// ─── Color & Theme Constants ──────────────────────────────────────────────

const FX_COLORS: Record<string, string> = {
  fire: '#FF6347',
  water: '#4169E1',
  earth: '#8B4513',
  lightning: '#FFD700',
  air: '#87CEEB',
  ice: '#00CED1',
  shadow: '#6A0DAD',
  arcane: '#E040FB',
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

const FX_GRADIENTS: Record<FxElementType, string> = {
  fire: 'linear-gradient(135deg, #FF6347, #FF4500, #FF8C00)',
  water: 'linear-gradient(135deg, #4169E1, #1E90FF, #00BFFF)',
  earth: 'linear-gradient(135deg, #8B4513, #A0522D, #D2691E)',
  lightning: 'linear-gradient(135deg, #FFD700, #FFA500, #FFFF00)',
  air: 'linear-gradient(135deg, #87CEEB, #B0E0E6, #E0FFFF)',
  ice: 'linear-gradient(135deg, #00CED1, #48D1CC, #AFEEEE)',
  shadow: 'linear-gradient(135deg, #6A0DAD, #4B0082, #8B008B)',
};

const FX_RARITIES: FxRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const FX_TYPES: FxElementType[] = ['fire', 'water', 'earth', 'air', 'lightning', 'ice', 'shadow'];

const FX_TYPE_EMOJIS: Record<FxElementType, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🪨',
  air: '💨',
  lightning: '⚡',
  ice: '❄️',
  shadow: '🌑',
};

const FX_RARITY_EMOJIS: Record<FxRarity, string> = {
  common: '⬜',
  uncommon: '🟩',
  rare: '🟦',
  epic: '🟪',
  legendary: '🟧',
};

const RARITY_POWER: Record<FxRarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 200,
};

const RARITY_MULTIPLIER: Record<FxRarity, number> = {
  common: 1.0,
  uncommon: 1.5,
  rare: 2.0,
  epic: 3.0,
  legendary: 5.0,
};

// ─── Elemental Synergy Table ──────────────────────────────────────────────

const FX_SYNERGIES: FxSynergy[] = [
  { typeA: 'fire', typeB: 'water', name: 'Steam Surge', effect: 'Creates steam tiles worth bonus points', multiplier: 1.5 },
  { typeA: 'fire', typeB: 'earth', name: 'Magma Fusion', effect: 'Enhances word score by melting obstacles', multiplier: 1.8 },
  { typeA: 'fire', typeB: 'air', name: 'Wildfire', effect: 'Spreads bonus effects across nearby tiles', multiplier: 1.6 },
  { typeA: 'fire', typeB: 'lightning', name: 'Plasma Storm', effect: 'Creates electrified fire bonus zones', multiplier: 2.0 },
  { typeA: 'fire', typeB: 'ice', name: 'Thermal Shock', effect: 'Rapid temperature change shatters obstacles', multiplier: 1.7 },
  { typeA: 'fire', typeB: 'shadow', name: 'Dark Flame', effect: 'Shadow-enhanced fire burns through anything', multiplier: 2.2 },
  { typeA: 'water', typeB: 'earth', name: 'Fertile Ground', effect: 'Grows bonus word tiles from the board', multiplier: 1.4 },
  { typeA: 'water', typeB: 'air', name: 'Mist Veil', effect: 'Conceals the snake while revealing rare tiles', multiplier: 1.5 },
  { typeA: 'water', typeB: 'lightning', name: 'Electrolysis', effect: 'Splits compound tiles into high-value letters', multiplier: 1.9 },
  { typeA: 'water', typeB: 'ice', name: 'Permafrost', effect: 'Freezes water tiles into permanent bonus areas', multiplier: 1.6 },
  { typeA: 'water', typeB: 'shadow', name: 'Abyssal Tide', effect: 'Shadow currents carry bonus tiles to the snake', multiplier: 2.1 },
  { typeA: 'earth', typeB: 'air', name: 'Dust Devil', effect: 'Whirlwind of earth particles stuns obstacles', multiplier: 1.3 },
  { typeA: 'earth', typeB: 'lightning', name: 'Crystal Charge', effect: 'Earthen crystals store and release lightning', multiplier: 1.8 },
  { typeA: 'earth', typeB: 'ice', name: 'Glacial Erosion', effect: 'Slowly carves paths through frozen obstacles', multiplier: 1.5 },
  { typeA: 'earth', typeB: 'shadow', name: 'Void Quake', effect: 'Shadow energy destabilizes the board creatively', multiplier: 2.0 },
  { typeA: 'air', typeB: 'lightning', name: 'Thunderhead', effect: 'Charged clouds rain bonus letters', multiplier: 1.7 },
  { typeA: 'air', typeB: 'ice', name: 'Blizzard', effect: 'Freezing winds push obstacles off the board', multiplier: 1.6 },
  { typeA: 'air', typeB: 'shadow', name: 'Phantom Wind', effect: 'Invisible winds guide the snake optimally', multiplier: 1.9 },
  { typeA: 'lightning', typeB: 'ice', name: 'Aurora Field', effect: 'Northern lights illuminate hidden bonus tiles', multiplier: 1.8 },
  { typeA: 'lightning', typeB: 'shadow', name: 'Void Spark', effect: 'Lightning tears holes in shadow for secrets', multiplier: 2.3 },
  { typeA: 'ice', typeB: 'shadow', name: 'Frozen Void', effect: 'Shadows crystallize into collectible tiles', multiplier: 2.0 },
];

// ─── 35 Flux Elementals (5 rarity × 7 types) ─────────────────────────────

const FX_ELEMENTALS: FxElemental[] = [
  // ── Fire Elementals ──
  {
    id: 'fx_fire_common', name: 'Ember Sprite', type: 'fire', rarity: 'common',
    power: 10, color: '#FF6347',
    description: 'A tiny flickering flame sprite born from dying campfires.',
    passive: '+2% fire tile frequency on the board.',
    lore: 'The last spark of a million forgotten fires, ember sprites drift through the Flux Realm seeking warmth.',
  },
  {
    id: 'fx_fire_uncommon', name: 'Blaze Hound', type: 'fire', rarity: 'uncommon',
    power: 25, color: '#FF6347',
    description: 'A loyal hound wreathed in protective flames.',
    passive: 'Extends word streak timer by 1 second per word.',
    lore: 'Domesticated from wild fire wolves, blaze hounds have served realm guardians for millennia.',
  },
  {
    id: 'fx_fire_rare', name: 'Inferno Drake', type: 'fire', rarity: 'rare',
    power: 50, color: '#FF6347',
    description: 'A drake whose breath melts through enchanted steel.',
    passive: '+5% score multiplier on fire-element words.',
    lore: 'Inferno drakes nest in the Magma Core, their scales harder than dragonsteel.',
  },
  {
    id: 'fx_fire_epic', name: 'Solar Phoenix', type: 'fire', rarity: 'epic',
    power: 100, color: '#FF6347',
    description: 'Reborn eternally from its own blazing ashes.',
    passive: 'Grants one free death save every 3 rounds.',
    lore: 'The Solar Phoenix is the heartbeat of the Magma Core, its tears can heal any wound.',
  },
  {
    id: 'fx_fire_legendary', name: 'Primordial Ignis', type: 'fire', rarity: 'legendary',
    power: 200, color: '#FF6347',
    description: 'The first flame that sparked the universe into being.',
    passive: 'All fire abilities deal double damage and cost zero cooldown.',
    lore: 'Before time, before space, there was Ignis. Its light was the first thing the void ever knew.',
  },

  // ── Water Elementals ──
  {
    id: 'fx_water_common', name: 'Dew Drop', type: 'water', rarity: 'common',
    power: 10, color: '#4169E1',
    description: 'A sentient droplet that skitters across surfaces.',
    passive: '+2% water tile frequency on the board.',
    lore: 'Dew drops form every dawn from the breath of sleeping water spirits.',
  },
  {
    id: 'fx_water_uncommon', name: 'Tide Serpent', type: 'water', rarity: 'uncommon',
    power: 25, color: '#4169E1',
    description: 'A sinuous serpent riding coastal currents.',
    passive: 'Reveals one hidden letter tile every 10 seconds.',
    lore: "Tide serpents are the ocean's messengers, carrying secrets between the deep trenches.",
  },
  {
    id: 'fx_water_rare', name: 'Frostfall Leviathan', type: 'water', rarity: 'rare',
    power: 50, color: '#4169E1',
    description: 'A massive leviathan dwelling in the deepest trenches.',
    passive: '+5% score multiplier on water-element words.',
    lore: 'So vast it creates its own tides, the Frostfall Leviathan is worshipped by coastal tribes.',
  },
  {
    id: 'fx_water_epic', name: 'Storm Hydra', type: 'water', rarity: 'epic',
    power: 100, color: '#4169E1',
    description: 'A seven-headed hydra summoning oceanic tempests.',
    passive: 'Each word collected has a 10% chance to spawn a bonus tile.',
    lore: 'Each head of the Storm Hydra controls a different ocean current across all realms.',
  },
  {
    id: 'fx_water_legendary', name: 'Abyssal Sovereign', type: 'water', rarity: 'legendary',
    power: 200, color: '#4169E1',
    description: 'Ruler of all waters, from rain to the abyssal void.',
    passive: 'All water abilities gain area-of-effect and chain to 3 targets.',
    lore: 'The Abyssal Sovereign claims dominion over every drop of water in every world simultaneously.',
  },

  // ── Earth Elementals ──
  {
    id: 'fx_earth_common', name: 'Pebble Golem', type: 'earth', rarity: 'common',
    power: 10, color: '#8B4513',
    description: 'A miniature golem assembled from river stones.',
    passive: '+2% earth tile frequency on the board.',
    lore: 'Children of the riverbeds, pebble golems assemble themselves from smooth stones.',
  },
  {
    id: 'fx_earth_uncommon', name: 'Root Guardian', type: 'earth', rarity: 'uncommon',
    power: 25, color: '#8B4513',
    description: 'An ancient tree spirit protecting the forest floor.',
    passive: 'Reduces obstacle damage by 5%.',
    lore: 'Root Guardians have existed since the first seed sprouted in fertile soil.',
  },
  {
    id: 'fx_earth_rare', name: 'Mountain Titan', type: 'earth', rarity: 'rare',
    power: 50, color: '#8B4513',
    description: 'A titan carved from living granite and magma veins.',
    passive: '+5% score multiplier on earth-element words.',
    lore: 'When Mountain Titans walk, new mountains form from their footprints.',
  },
  {
    id: 'fx_earth_epic', name: 'Continental Behemoth', type: 'earth', rarity: 'epic',
    power: 100, color: '#8B4513',
    description: 'So vast its steps reshape the land itself.',
    passive: 'Grants +1 snake length every 5 words collected.',
    lore: 'The Continental Behemoth IS the land itself, dreaming beneath the foundations.',
  },
  {
    id: 'fx_earth_legendary', name: 'Worldseed Golem', type: 'earth', rarity: 'legendary',
    power: 200, color: '#8B4513',
    description: 'Crafted from the seed that grew the first world.',
    passive: 'All earth structures produce triple resources.',
    lore: 'From a single seed, worlds are born. The Worldseed Golem carries a billion unborn universes.',
  },

  // ── Air Elementals ──
  {
    id: 'fx_air_common', name: 'Breeze Wisp', type: 'air', rarity: 'common',
    power: 10, color: '#87CEEB',
    description: 'A playful wisp that whispers through open windows.',
    passive: '+2% air tile frequency on the board.',
    lore: 'Breeze wisps are the laughter of the atmosphere given form.',
  },
  {
    id: 'fx_air_uncommon', name: 'Gale Hawk', type: 'air', rarity: 'uncommon',
    power: 25, color: '#87CEEB',
    description: 'A hawk that rides thermal columns at impossible speeds.',
    passive: 'Increases snake speed by 3%.',
    lore: 'Gale hawks can circle the world in a single day, riding the eternal jet streams.',
  },
  {
    id: 'fx_air_rare', name: 'Cyclone Djinn', type: 'air', rarity: 'rare',
    power: 50, color: '#87CEEB',
    description: 'A djinn spinning tornadoes at its command.',
    passive: '+5% score multiplier on air-element words.',
    lore: 'Bound to an ancient lamp lost in the Sky Archipelago, the Cyclone Djinn grants wishes.',
  },
  {
    id: 'fx_air_epic', name: 'Tempest Archon', type: 'air', rarity: 'epic',
    power: 100, color: '#87CEEB',
    description: 'An archon that commands the upper atmosphere.',
    passive: 'Obstacles are pushed 1 tile away every 8 seconds.',
    lore: 'The Tempest Archon sits at the edge of space, sculpting weather patterns below.',
  },
  {
    id: 'fx_air_legendary', name: 'Zephyr Anemoi', type: 'air', rarity: 'legendary',
    power: 200, color: '#87CEEB',
    description: 'One of the four divine wind lords of the cosmos.',
    passive: 'Snake gains permanent phase-through ability for 2s per minute.',
    lore: 'The Zephyr Anemoi has blown since before the first breath was drawn.',
  },

  // ── Lightning Elementals ──
  {
    id: 'fx_lightning_common', name: 'Spark Mouse', type: 'lightning', rarity: 'common',
    power: 10, color: '#FFD700',
    description: 'A tiny rodent crackling with static electricity.',
    passive: '+2% lightning tile frequency on the board.',
    lore: 'Spark mice nest inside thunderclouds, weaving their dens from lightning threads.',
  },
  {
    id: 'fx_lightning_uncommon', name: 'Volt Wolf', type: 'lightning', rarity: 'uncommon',
    power: 25, color: '#FFD700',
    description: 'A wolf that channels thunder through its fangs.',
    passive: 'Every 10th word triggers a small lightning bonus.',
    lore: 'Volt wolves hunt in packs during electrical storms, their howls summoning lightning.',
  },
  {
    id: 'fx_lightning_rare', name: 'Thunder Roc', type: 'lightning', rarity: 'rare',
    power: 50, color: '#FFD700',
    description: 'A raptor whose wingspan summons lightning storms.',
    passive: '+5% score multiplier on lightning-element words.',
    lore: 'When the Thunder Roc beats its wings, the sky turns white with electric fury.',
  },
  {
    id: 'fx_lightning_epic', name: 'Plasma Hydra', type: 'lightning', rarity: 'epic',
    power: 100, color: '#FFD700',
    description: 'A hydra whose heads strike with chain lightning.',
    passive: 'Abilities chain to 2 additional targets.',
    lore: 'Each head of the Plasma Hydra controls a different frequency of electromagnetic energy.',
  },
  {
    id: 'fx_lightning_legendary', name: 'Stormbreaker', type: 'lightning', rarity: 'legendary',
    power: 200, color: '#FFD700',
    description: 'The original thunderbolt that split the primordial sky.',
    passive: 'All lightning abilities deal triple damage and stun all obstacles for 3s.',
    lore: 'Stormbreaker was the first act of creation — a bolt that divided the void into sky and earth.',
  },

  // ── Ice Elementals ──
  {
    id: 'fx_ice_common', name: 'Frost Shard', type: 'ice', rarity: 'common',
    power: 10, color: '#00CED1',
    description: 'A sentient crystal that slowly crawls across frozen ground.',
    passive: '+2% ice tile frequency on the board.',
    lore: 'Frost shards are fragments of ancient glaciers that gained consciousness over millennia.',
  },
  {
    id: 'fx_ice_uncommon', name: 'Glacial Stag', type: 'ice', rarity: 'uncommon',
    power: 25, color: '#00CED1',
    description: 'A stag with antlers of eternal permafrost.',
    passive: 'Freezes one random obstacle every 15 seconds.',
    lore: 'The Glacial Stag appears only during the coldest nights, leaving trails of perfect frost.',
  },
  {
    id: 'fx_ice_rare', name: 'Permafrost Wyrm', type: 'ice', rarity: 'rare',
    power: 50, color: '#00CED1',
    description: 'A wyrm that burrows through glaciers for millennia.',
    passive: '+5% score multiplier on ice-element words.',
    lore: 'Permafrost wyrms create the ice caves of the Glacial Maw through patient excavation.',
  },
  {
    id: 'fx_ice_epic', name: 'Aurora Frostlord', type: 'ice', rarity: 'epic',
    power: 100, color: '#00CED1',
    description: 'A lord whose mere presence paints the sky with auroras.',
    passive: 'Aurora effect reveals all tiles within 2-tile radius every 12s.',
    lore: 'The Aurora Frostlord was once a mortal who froze at the moment of enlightenment.',
  },
  {
    id: 'fx_ice_legendary', name: 'Absolute Zero', type: 'ice', rarity: 'legendary',
    power: 200, color: '#00CED1',
    description: 'The embodiment of entropy reversed — perfect stillness.',
    passive: 'All ice effects last permanently until manually cleared.',
    lore: 'At Absolute Zero, molecular motion ceases. Time itself grows brittle and cracks.',
  },

  // ── Shadow Elementals ──
  {
    id: 'fx_shadow_common', name: 'Shade Wispling', type: 'shadow', rarity: 'common',
    power: 10, color: '#6A0DAD',
    description: 'A mischievous shadow that detaches at twilight.',
    passive: '+2% shadow tile frequency on the board.',
    lore: 'Shade wisplings are the discarded shadows of those who walked too close to the Void Fen.',
  },
  {
    id: 'fx_shadow_uncommon', name: 'Dusk Panther', type: 'shadow', rarity: 'uncommon',
    power: 25, color: '#6A0DAD',
    description: 'A panther that fades between dimensions at will.',
    passive: 'Grants brief invulnerability during transitions between zones.',
    lore: 'The Dusk Panther exists in two worlds simultaneously, visible only at the boundary.',
  },
  {
    id: 'fx_shadow_rare', name: 'Void Reaper', type: 'shadow', rarity: 'rare',
    power: 50, color: '#6A0DAD',
    description: 'A reaper that harvests the echoes of forgotten words.',
    passive: '+5% score multiplier on shadow-element words.',
    lore: 'The Void Reaper collects the last syllables of dying languages across all realms.',
  },
  {
    id: 'fx_shadow_epic', name: 'Eclipse Wraith', type: 'shadow', rarity: 'epic',
    power: 100, color: '#6A0DAD',
    description: 'A wraith that devours light within a hundred leagues.',
    passive: 'Creates a 3-tile darkness zone that obscures enemies every 20s.',
    lore: 'Born from the last eclipse before the world shattered, the Eclipse Wraith seeks to restore the darkness.',
  },
  {
    id: 'fx_shadow_legendary', name: 'Oblivion Seraph', type: 'shadow', rarity: 'legendary',
    power: 200, color: '#6A0DAD',
    description: 'A fallen angel wielding the power to unmake reality.',
    passive: 'All shadow abilities gain a 50% chance to instantly eliminate an obstacle.',
    lore: 'The Oblivion Seraph was once the brightest angel. Now it carries the void itself as its weapon.',
  },
];

// ─── 8 Realm Zones ─────────────────────────────────────────────────────────

const FX_ZONES: FxZone[] = [
  {
    id: 'fx_zone_magma_core', name: 'Magma Core', element: 'fire',
    description: 'The molten heart of the Flux Realm.',
    longDescription: 'The Magma Core pulses with raw fire energy, a churning ocean of lava that feeds every flame in the realm. Ancient fire elementals nest in its deepest chambers, guarding secrets forged in primordial heat.',
    baseStability: 30, maxStability: 100,
    rewards: ['fx_mat_fire_ember', 'fx_mat_magma_shard', 'fx_title_inferno_walker'],
    hazardLevel: 4,
  },
  {
    id: 'fx_zone_abyssal_trench', name: 'Abyssal Trench', element: 'water',
    description: 'An impossibly deep oceanic rift.',
    longDescription: 'The Abyssal Trench plunges into darkness beyond measurement, where pressure would crush any ordinary being. Bioluminescent creatures light the descent, and ancient leviathans sleep in its deepest reaches.',
    baseStability: 25, maxStability: 100,
    rewards: ['fx_mat_pearl_drop', 'fx_mat_tidal_crystal', 'fx_title_depth_diver'],
    hazardLevel: 3,
  },
  {
    id: 'fx_zone_root_maze', name: 'Root Maze', element: 'earth',
    description: 'An underground labyrinth of living roots.',
    longDescription: 'Beneath the surface, the world tree roots intertwine into an ever-shifting maze. Each passage is alive, growing and contracting with the seasons, making navigation a test of patience and intuition.',
    baseStability: 35, maxStability: 100,
    rewards: ['fx_mat_root_sap', 'fx_mat_stone_heart', 'fx_title_tunneler'],
    hazardLevel: 2,
  },
  {
    id: 'fx_zone_sky_archipelago', name: 'Sky Archipelago', element: 'air',
    description: 'Floating islands suspended by perpetual updrafts.',
    longDescription: 'Hundreds of islands drift through the eternal sky, connected by bridges of solidified wind. Each island holds a different micro-climate, from gentle breezes to violent downdrafts.',
    baseStability: 20, maxStability: 100,
    rewards: ['fx_mat_wind_silk', 'fx_mat_cloud_crystal', 'fx_title_sky_nomad'],
    hazardLevel: 5,
  },
  {
    id: 'fx_zone_thunder_spire', name: 'Thunder Spire', element: 'lightning',
    description: 'A towering crystalline spire attracting lightning.',
    longDescription: 'The Thunder Spire rises ten thousand feet into the sky, its crystal surface crackling with captured electricity. At its peak, a perpetual lightning storm rages, feeding energy into the realm.',
    baseStability: 15, maxStability: 100,
    rewards: ['fx_mat_spark_gem', 'fx_mat_storm_vial', 'fx_title_storm_catcher'],
    hazardLevel: 5,
  },
  {
    id: 'fx_zone_glacial_maw', name: 'Glacial Maw', element: 'ice',
    description: 'A colossal glacier with a cave system like a frozen mouth.',
    longDescription: 'The Glacial Maw is a glacier so massive it has its own weather system. Its cave network stretches for hundreds of miles, each tunnel lined with eternal ice that whispers forgotten memories.',
    baseStability: 28, maxStability: 100,
    rewards: ['fx_mat_frost_bloom', 'fx_mat_ice_fang', 'fx_title_permafrost'],
    hazardLevel: 3,
  },
  {
    id: 'fx_zone_void_fen', name: 'Void Fen', element: 'shadow',
    description: 'A murky swamp where shadows detach and roam.',
    longDescription: 'In the Void Fen, darkness is not merely the absence of light — it is a living substance. Shadows here have weight and texture, and they consume careless travelers whole.',
    baseStability: 18, maxStability: 100,
    rewards: ['fx_mat_shadow_moss', 'fx_mat_eclipse_orb', 'fx_title_shadow_seer'],
    hazardLevel: 4,
  },
  {
    id: 'fx_zone_flux_nexus', name: 'Flux Nexus', element: 'lightning',
    description: 'The central convergence point of all elemental fluxes.',
    longDescription: 'At the exact center of the Flux Realm, all seven elemental streams collide in a breathtaking display of raw power. The Flux Nexus is simultaneously the most dangerous and most rewarding location in the realm.',
    baseStability: 10, maxStability: 150,
    rewards: ['fx_mat_nexus_core', 'fx_mat_flux_resonance', 'fx_title_nexus_guardian'],
    hazardLevel: 5,
  },
];

// ─── 30 Flux Materials ─────────────────────────────────────────────────────

const FX_MATERIALS: FxMaterial[] = [
  // Fire materials (4)
  { id: 'fx_mat_fire_ember', name: 'Living Ember', element: 'fire', rarity: 'common', description: 'An ember that never extinguishes, radiating gentle warmth.', value: 5, source: 'Magma Core zone', tier: 1 },
  { id: 'fx_mat_magma_shard', name: 'Magma Shard', element: 'fire', rarity: 'rare', description: 'A crystallized fragment of pure molten rock.', value: 30, source: 'Deep Magma Core excavation', tier: 2 },
  { id: 'fx_mat_fire_quartz', name: 'Fire Quartz', element: 'fire', rarity: 'epic', description: 'A ruby-like gem pulsing with inner flame.', value: 80, source: 'Legendary fire elemental drops', tier: 3 },
  { id: 'fx_mat_inferno_heart', name: 'Inferno Heart', element: 'fire', rarity: 'legendary', description: 'The core organ of an ancient fire elemental, still beating.', value: 200, source: 'Defeat Primordial Ignis', tier: 4 },

  // Water materials (4)
  { id: 'fx_mat_pearl_drop', name: 'Pearl Drop', element: 'water', rarity: 'common', description: 'A luminescent droplet condensed from enchanted mist.', value: 5, source: 'Abyssal Trench surface', tier: 1 },
  { id: 'fx_mat_tidal_crystal', name: 'Tidal Crystal', element: 'water', rarity: 'rare', description: 'A crystal that stores the rhythm of ocean tides.', value: 30, source: 'Deep trench exploration', tier: 2 },
  { id: 'fx_mat_abyssal_sapphire', name: 'Abyssal Sapphire', element: 'water', rarity: 'epic', description: 'A deep blue gem from the lightless ocean floor.', value: 80, source: 'Epic water elemental drops', tier: 3 },
  { id: 'fx_mat_kraken_eye', name: 'Kraken Eye', element: 'water', rarity: 'legendary', description: 'A perfectly preserved eye from an elder kraken.', value: 200, source: 'Defeat Abyssal Sovereign', tier: 4 },

  // Earth materials (4)
  { id: 'fx_mat_root_sap', name: 'Ancient Root Sap', element: 'earth', rarity: 'common', description: 'Thick golden sap from millennium-old root systems.', value: 5, source: 'Root Maze harvesting', tier: 1 },
  { id: 'fx_mat_stone_heart', name: 'Stone Heart', element: 'earth', rarity: 'rare', description: 'A perfectly spherical stone that resonates with seismic energy.', value: 30, source: 'Deep earth excavation', tier: 2 },
  { id: 'fx_mat_mountain_topaz', name: 'Mountain Topaz', element: 'earth', rarity: 'epic', description: 'A topaz infused with the patience of mountains.', value: 80, source: 'Epic earth elemental drops', tier: 3 },
  { id: 'fx_mat_worldbone', name: 'Worldbone Fragment', element: 'earth', rarity: 'legendary', description: 'A shard from the skeletal structure of the world itself.', value: 200, source: 'Defeat Worldseed Golem', tier: 4 },

  // Air materials (4)
  { id: 'fx_mat_wind_silk', name: 'Wind Silk', element: 'air', rarity: 'common', description: 'Gossamer threads spun from captured breezes.', value: 5, source: 'Sky Archipelago collection', tier: 1 },
  { id: 'fx_mat_cloud_crystal', name: 'Cloud Crystal', element: 'air', rarity: 'rare', description: 'A solidified fragment of a cumulonimbus cloud.', value: 30, source: 'High-altitude cloud harvesting', tier: 2 },
  { id: 'fx_mat_zephyr_emerald', name: 'Zephyr Emerald', element: 'air', rarity: 'epic', description: 'An emerald so light it levitates on its own.', value: 80, source: 'Epic air elemental drops', tier: 3 },
  { id: 'fx_mat_breath_of_creation', name: 'Breath of Creation', element: 'air', rarity: 'legendary', description: 'The first exhaled breath of the world-builder.', value: 200, source: 'Defeat Zephyr Anemoi', tier: 4 },

  // Lightning materials (5)
  { id: 'fx_mat_spark_gem', name: 'Spark Gem', element: 'lightning', rarity: 'common', description: 'A small gem that crackles with tiny lightning arcs.', value: 5, source: 'Thunder Spire collection', tier: 1 },
  { id: 'fx_mat_storm_vial', name: 'Storm Vial', element: 'lightning', rarity: 'rare', description: 'A sealed vial containing a miniature thunderstorm.', value: 30, source: 'Thunderstorm event capture', tier: 2 },
  { id: 'fx_mat_thunder_diamond', name: 'Thunder Diamond', element: 'lightning', rarity: 'epic', description: 'A diamond that glows during electrical storms.', value: 80, source: 'Epic lightning elemental drops', tier: 3 },
  { id: 'fx_mat_skyfire_essence', name: 'Skyfire Essence', element: 'lightning', rarity: 'legendary', description: 'Pure condensed lightning essence from the ionosphere.', value: 200, source: 'Defeat Stormbreaker', tier: 4 },
  { id: 'fx_mat_nexus_core', name: 'Nexus Core', element: 'lightning', rarity: 'epic', description: 'A crystallized fragment of flux convergence energy.', value: 90, source: 'Flux Nexus stabilization', tier: 3 },

  // Ice materials (4)
  { id: 'fx_mat_frost_bloom', name: 'Frost Bloom', element: 'ice', rarity: 'common', description: 'A flower that blooms only at sub-zero temperatures.', value: 5, source: 'Glacial Maw surface', tier: 1 },
  { id: 'fx_mat_ice_fang', name: 'Ice Fang', element: 'ice', rarity: 'rare', description: 'A fang from a frost wyrm, cold to the touch.', value: 30, source: 'Deep glacial excavation', tier: 2 },
  { id: 'fx_mat_aurora_opal', name: 'Aurora Opal', element: 'ice', rarity: 'epic', description: 'An opal that displays aurora patterns in darkness.', value: 80, source: 'Epic ice elemental drops', tier: 3 },
  { id: 'fx_mat_eternal_frost', name: 'Eternal Frost', element: 'ice', rarity: 'legendary', description: 'Frost that never melts, radiating absolute cold.', value: 200, source: 'Defeat Absolute Zero', tier: 4 },

  // Shadow materials (3)
  { id: 'fx_mat_shadow_moss', name: 'Shadow Moss', element: 'shadow', rarity: 'common', description: 'Dark moss that grows only in the absence of all light.', value: 5, source: 'Void Fen harvesting', tier: 1 },
  { id: 'fx_mat_eclipse_orb', name: 'Eclipse Orb', element: 'shadow', rarity: 'rare', description: 'An orb that dims all surrounding light when held.', value: 30, source: 'Eclipse event capture', tier: 2 },
  { id: 'fx_mat_void_pearl', name: 'Void Pearl', element: 'shadow', rarity: 'legendary', description: 'A pearl formed in the nothingness between dimensions.', value: 200, source: 'Defeat Oblivion Seraph', tier: 4 },

  // Cross-element materials (2)
  { id: 'fx_mat_flux_resonance', name: 'Flux Resonance Shard', element: 'fire', rarity: 'legendary', description: 'Contains the harmonic frequency of all elements combined.', value: 250, source: 'Flux Nexus mastery', tier: 5 },
  { id: 'fx_mat_chaos_dust', name: 'Chaos Dust', element: 'shadow', rarity: 'epic', description: 'Fine powder left behind when two elements annihilate.', value: 70, source: 'Synergy activation byproduct', tier: 3 },
];

// ─── 25 Structures (upgradable to lv10) ────────────────────────────────────

const FX_STRUCTURES: FxStructure[] = [
  { id: 'fx_str_flame_beacon', name: 'Flame Beacon', description: 'Illuminates the realm with fire energy.', longDescription: 'A towering beacon of enchanted flame that radiates warmth and clarity across the surrounding area, boosting fire elemental synergy for all nearby operations.', element: 'fire', maxLevel: 10, baseCost: 50, costPerLevel: 25, effectPerLevel: '+5% fire elemental synergy', category: 'synergy', prerequisite: '' },
  { id: 'fx_str_tidal_pump', name: 'Tidal Pump Station', description: 'Harnesses water flux for knowledge streams.', longDescription: 'An intricate system of pumps and channels that draws water flux from the Abyssal Trench, irrigating the realm with streams of liquid knowledge.', element: 'water', maxLevel: 10, baseCost: 50, costPerLevel: 25, effectPerLevel: '+5% water elemental synergy', category: 'synergy', prerequisite: '' },
  { id: 'fx_str_quarry_drill', name: 'Quarry Drill', description: 'Extracts earth flux to fortify foundations.', longDescription: 'A massive drill that penetrates deep into the Root Maze, extracting concentrated earth flux to reinforce the structural integrity of the entire realm.', element: 'earth', maxLevel: 10, baseCost: 50, costPerLevel: 25, effectPerLevel: '+5% earth elemental synergy', category: 'synergy', prerequisite: '' },
  { id: 'fx_str_wind_turbine', name: 'Wind Turbine Spire', description: 'Converts air currents into ambient flux energy.', longDescription: 'Spires topped with enchanted turbines that harvest the perpetual winds of the Sky Archipelago, converting raw air flux into usable realm energy.', element: 'air', maxLevel: 10, baseCost: 50, costPerLevel: 25, effectPerLevel: '+5% air elemental synergy', category: 'synergy', prerequisite: '' },
  { id: 'fx_str_lightning_rod', name: 'Lightning Rod Array', description: 'Captures and stores lightning flux.', longDescription: 'An interconnected array of lightning rods that capture every electrical discharge from the Thunder Spire, storing immense charges in capacitor banks.', element: 'lightning', maxLevel: 10, baseCost: 60, costPerLevel: 30, effectPerLevel: '+5% lightning elemental synergy', category: 'synergy', prerequisite: '' },
  { id: 'fx_str_cryo_vault', name: 'Cryogenic Vault', description: 'Preserves rare ice flux.', longDescription: 'A sub-zero containment facility that preserves the delicate structures of ice flux, preventing degradation and maintaining peak potency.', element: 'ice', maxLevel: 10, baseCost: 50, costPerLevel: 25, effectPerLevel: '+5% ice elemental synergy', category: 'synergy', prerequisite: '' },
  { id: 'fx_str_shadow_sanctum', name: 'Shadow Sanctum', description: 'Amplifies shadow flux meditation.', longDescription: 'A chamber of absolute darkness where shadow flux practitioners can meditate undisturbed, amplifying their connection to the void.', element: 'shadow', maxLevel: 10, baseCost: 60, costPerLevel: 30, effectPerLevel: '+5% shadow elemental synergy', category: 'synergy', prerequisite: '' },
  { id: 'fx_str_flux_generator', name: 'Flux Generator', description: 'Converts elemental power into realm stability.', longDescription: 'The core engine of the realm, this massive generator transforms bound elemental power into the stability that holds the Flux Realm together.', element: 'lightning', maxLevel: 10, baseCost: 100, costPerLevel: 50, effectPerLevel: '+3% realm-wide stability', category: 'production', prerequisite: 'fx_str_lightning_rod' },
  { id: 'fx_str_word_forge', name: 'Word Forge', description: 'Smelts letters into powerful words.', longDescription: 'A mystical forge where individual letters are heated, hammered, and combined into words of immense power. Each word forged here carries elemental weight.', element: 'fire', maxLevel: 10, baseCost: 80, costPerLevel: 40, effectPerLevel: '+8% word score bonus', category: 'production', prerequisite: 'fx_str_flame_beacon' },
  { id: 'fx_str_lexicon_vault', name: 'Lexicon Vault', description: 'Stores discovered words.', longDescription: 'An expanding enchanted library where every discovered word is catalogued, preserved, and made available for future reference and power.', element: 'earth', maxLevel: 10, baseCost: 70, costPerLevel: 35, effectPerLevel: '+10 word storage capacity', category: 'utility', prerequisite: 'fx_str_quarry_drill' },
  { id: 'fx_str_resonance_chamber', name: 'Resonance Chamber', description: 'Amplifies harmonic frequency.', longDescription: 'A specially tuned chamber where elemental harmonics are amplified, increasing the potency of combo effects and chain reactions.', element: 'lightning', maxLevel: 10, baseCost: 90, costPerLevel: 45, effectPerLevel: '+4% combo multiplier', category: 'synergy', prerequisite: 'fx_str_flux_generator' },
  { id: 'fx_str_mnemonic_garden', name: 'Mnemonic Garden', description: 'Words grow into memory flowers.', longDescription: 'A living garden where each collected word sprouts as a flower. The garden remembers everything, boosting word retention over time.', element: 'water', maxLevel: 10, baseCost: 65, costPerLevel: 32, effectPerLevel: '+6% word retention bonus', category: 'production', prerequisite: 'fx_str_tidal_pump' },
  { id: 'fx_str_elemental_shrine', name: 'Elemental Shrine', description: 'Honors bound elementals.', longDescription: 'A sacred shrine dedicated to all bound elementals. Each offering increases the bond between the realm keeper and their elemental companions.', element: 'fire', maxLevel: 10, baseCost: 120, costPerLevel: 60, effectPerLevel: '+2% per bound elemental', category: 'synergy', prerequisite: 'fx_str_word_forge' },
  { id: 'fx_str_rune_obelisk', name: 'Rune Obelisk', description: 'Etched with elemental runes.', longDescription: 'A towering obelisk carved with ancient elemental runes that pulse with power, increasing the chance of discovering rare artifacts.', element: 'shadow', maxLevel: 10, baseCost: 110, costPerLevel: 55, effectPerLevel: '+5% artifact activation chance', category: 'utility', prerequisite: 'fx_str_shadow_sanctum' },
  { id: 'fx_str_starlight_observatory', name: 'Starlight Observatory', description: 'Channels stellar energy.', longDescription: 'Perched at the highest point of the Sky Archipelago, this observatory focuses starlight into concentrated beams of discovery energy.', element: 'air', maxLevel: 10, baseCost: 95, costPerLevel: 48, effectPerLevel: '+3% discovery rate', category: 'utility', prerequisite: 'fx_str_wind_turbine' },
  { id: 'fx_str_frost_laboratory', name: 'Frost Laboratory', description: 'Studies ice flux applications.', longDescription: 'A state-of-the-art research facility where the properties of ice flux are studied and applied to enhance word collection capabilities.', element: 'ice', maxLevel: 10, baseCost: 85, costPerLevel: 42, effectPerLevel: '+4% rare word chance', category: 'production', prerequisite: 'fx_str_cryo_vault' },
  { id: 'fx_str_magma_crucible', name: 'Magma Crucible', description: 'Smelts materials into flux alloys.', longDescription: 'A crucible fed by Magma Core heat that refines raw materials into purified flux alloys essential for high-tier upgrades.', element: 'fire', maxLevel: 10, baseCost: 75, costPerLevel: 38, effectPerLevel: '+6% material refinement yield', category: 'production', prerequisite: 'fx_str_flame_beacon' },
  { id: 'fx_str_void_gateway', name: 'Void Gateway', description: 'Links realm to shadow dimensions.', longDescription: 'A stabilized portal that allows safe trade with shadow dimension merchants, dramatically increasing material acquisition rates.', element: 'shadow', maxLevel: 10, baseCost: 150, costPerLevel: 75, effectPerLevel: '+5% material drop rate', category: 'production', prerequisite: 'fx_str_rune_obelisk' },
  { id: 'fx_str_aqua_filter', name: 'Aqua Filter', description: 'Purifies water flux.', longDescription: 'An advanced filtration system that removes impurities from water flux, concentrating its healing and restorative properties.', element: 'water', maxLevel: 10, baseCost: 70, costPerLevel: 35, effectPerLevel: '+7% potion effectiveness', category: 'utility', prerequisite: 'fx_str_tidal_pump' },
  { id: 'fx_str_storm_collider', name: 'Storm Collider', description: 'Creates flux-enhancing reactions.', longDescription: 'A particle accelerator that smashes lightning particles together at incredible speeds, creating new flux-enhancing particle reactions.', element: 'lightning', maxLevel: 10, baseCost: 130, costPerLevel: 65, effectPerLevel: '+5% power generation rate', category: 'production', prerequisite: 'fx_str_flux_generator' },
  { id: 'fx_str_mycelium_network', name: 'Mycelium Network', description: 'Connects zones telepathically.', longDescription: 'A vast underground fungal network that links all realm zones, sharing information and resources through biological telepathy.', element: 'earth', maxLevel: 10, baseCost: 60, costPerLevel: 30, effectPerLevel: '+8% zone stability regen', category: 'defense', prerequisite: 'fx_str_quarry_drill' },
  { id: 'fx_str_zephyr_bell', name: 'Zephyr Bell', description: 'Bell tolls summon air currents.', longDescription: 'A massive bell forged from wind-silk and cloud crystal. Each toll summons a helpful air current that accelerates progress.', element: 'air', maxLevel: 10, baseCost: 55, costPerLevel: 28, effectPerLevel: '+3% speed bonus', category: 'utility', prerequisite: 'fx_str_wind_turbine' },
  { id: 'fx_str_permafrost_anchor', name: 'Permafrost Anchor', description: 'Stabilizes foundations against flux turbulence.', longDescription: 'An ice-embedded anchor that grips deep into the realm foundations, preventing destabilization during turbulent flux events.', element: 'ice', maxLevel: 10, baseCost: 100, costPerLevel: 50, effectPerLevel: '+5% defense against events', category: 'defense', prerequisite: 'fx_str_cryo_vault' },
  { id: 'fx_str_inferno_engine', name: 'Inferno Engine', description: 'Converts fire flux into mechanical power.', longDescription: 'A magnificent heat engine that channels raw fire flux into mechanical rotation, passively generating resources for the realm.', element: 'fire', maxLevel: 10, baseCost: 140, costPerLevel: 70, effectPerLevel: '+6% passive resource generation', category: 'production', prerequisite: 'fx_str_magma_crucible' },
  { id: 'fx_str_nexus_bridge', name: 'Nexus Bridge', description: 'Connects all elemental zones.', longDescription: 'The crowning achievement of Flux engineering — a bridge that physically connects all elemental zones through a unified flux conduit.', element: 'lightning', maxLevel: 10, baseCost: 200, costPerLevel: 100, effectPerLevel: '+2% to all zone stabilities', category: 'synergy', prerequisite: 'fx_str_flux_generator' },
];

// ─── 22 Abilities ──────────────────────────────────────────────────────────

const FX_ABILITIES: FxAbility[] = [
  { id: 'fx_abil_fireball', name: 'Flux Fireball', description: 'Launches concentrated fire flux.', longDescription: 'Channels raw fire flux into a devastating projectile that ignites bonus tiles in its path, leaving a trail of burning opportunities.', element: 'fire', cooldown: 3, power: 40, unlockCondition: 'Bind 2 fire elementals', manaCost: 20, tier: 1 },
  { id: 'fx_abil_tidal_surge', name: 'Tidal Surge', description: 'Summons a wave revealing hidden letters.', longDescription: 'Calls upon the power of the Abyssal Trench, sending a massive wave that washes away obstacles and exposes hidden letter tiles.', element: 'water', cooldown: 4, power: 35, unlockCondition: 'Bind 2 water elementals', manaCost: 25, tier: 1 },
  { id: 'fx_abil_earthen_wall', name: 'Earthen Wall', description: 'Raises a protective stone wall.', longDescription: 'Summons a wall of enchanted stone from the Root Maze that absorbs one hit and crumbles into collectible earth material.', element: 'earth', cooldown: 5, power: 30, unlockCondition: 'Bind 2 earth elementals', manaCost: 30, tier: 1 },
  { id: 'fx_abil_gale_dash', name: 'Gale Dash', description: 'Wind burst propels snake forward.', longDescription: 'A concentrated burst of air flux launches the snake forward three tiles at incredible speed, bypassing obstacles.', element: 'air', cooldown: 3, power: 25, unlockCondition: 'Bind 2 air elementals', manaCost: 15, tier: 1 },
  { id: 'fx_abil_chain_lightning', name: 'Chain Lightning', description: 'Lightning arcs between word tiles.', longDescription: 'Directs a bolt of chain lightning that leaps between word tiles, automatically collecting each tile in its path.', element: 'lightning', cooldown: 4, power: 45, unlockCondition: 'Bind 2 lightning elementals', manaCost: 30, tier: 1 },
  { id: 'fx_abil_frost_nova', name: 'Frost Nova', description: 'Freezes obstacles in radius.', longDescription: 'Releases a shockwave of absolute cold that freezes all obstacles within range, rendering them harmless for a brief period.', element: 'ice', cooldown: 5, power: 35, unlockCondition: 'Bind 2 ice elementals', manaCost: 30, tier: 1 },
  { id: 'fx_abil_shadow_step', name: 'Shadow Step', description: 'Teleports through shadow dimension.', longDescription: 'Dissolves into shadow and reforms at a target location, passing through any obstacles in between.', element: 'shadow', cooldown: 6, power: 50, unlockCondition: 'Bind 2 shadow elementals', manaCost: 35, tier: 1 },
  { id: 'fx_abil_inferno_rain', name: 'Inferno Rain', description: 'Doubles score for 10 seconds.', longDescription: 'Calls down a rain of fire from the sky that ignites every tile on the board, doubling score for the duration.', element: 'fire', cooldown: 8, power: 60, unlockCondition: 'Bind a legendary fire elemental', manaCost: 50, tier: 3 },
  { id: 'fx_abil_whirlpool', name: 'Maelstrom', description: 'Pulls bonus tiles toward snake.', longDescription: 'Creates a powerful whirlpool centered on the snake that attracts all nearby bonus word tiles like a gravitational force.', element: 'water', cooldown: 7, power: 55, unlockCondition: 'Bind a rare water elemental', manaCost: 45, tier: 2 },
  { id: 'fx_abil_earthquake', name: 'Flux Earthquake', description: 'Rearranges tiles into favorable positions.', longDescription: 'Triggers a controlled seismic event that shakes the board, rearranging tiles into more favorable patterns for word collection.', element: 'earth', cooldown: 8, power: 40, unlockCondition: 'Stabilize 3 earth zones', manaCost: 40, tier: 2 },
  { id: 'fx_abil_vacuum_slash', name: 'Vacuum Slash', description: 'Compressed air cuts through obstacles.', longDescription: 'Compresses air into an impossibly thin blade that slices through obstacles in a straight line across the board.', element: 'air', cooldown: 4, power: 30, unlockCondition: 'Build wind turbine to lv5', manaCost: 25, tier: 2 },
  { id: 'fx_abil_thunderstrike', name: 'Thunderstrike', description: 'Devastating bolt on highest-value tile.', longDescription: 'Calls down a single precision thunderbolt that strikes the highest-value tile on the board, guaranteeing its collection.', element: 'lightning', cooldown: 5, power: 70, unlockCondition: 'Build lightning rod to lv5', manaCost: 40, tier: 2 },
  { id: 'fx_abil_glacial_prison', name: 'Glacial Prison', description: 'Preserves bonus tiles in ice.', longDescription: 'Encases a designated area in magical ice, preserving bonus tiles in pristine condition until the snake can collect them.', element: 'ice', cooldown: 6, power: 35, unlockCondition: 'Activate an ice artifact', manaCost: 35, tier: 2 },
  { id: 'fx_abil_void_drain', name: 'Void Drain', description: 'Converts obstacles into score.', longDescription: 'Opens a connection to the void that siphons energy from obstacles, dissolving them and converting their mass into score points.', element: 'shadow', cooldown: 7, power: 55, unlockCondition: 'Explore the void fen zone', manaCost: 45, tier: 2 },
  { id: 'fx_abil_flux_overload', name: 'Flux Overload', description: 'Massive burst of all elemental power.', longDescription: 'Overloads every bound elemental simultaneously, creating a cascade of combined elemental effects across the entire board.', element: 'lightning', cooldown: 10, power: 100, unlockCondition: 'Bind at least 7 elementals', manaCost: 80, tier: 3 },
  { id: 'fx_abil_phoenix_rebirth', name: 'Phoenix Rebirth', description: 'Resurrects snake after death.', longDescription: 'Binds a phoenix flame to the snake soul. If the snake dies, the phoenix immediately resurrects it with half-length restored.', element: 'fire', cooldown: 12, power: 90, unlockCondition: 'Bind Solar Phoenix', manaCost: 60, tier: 3 },
  { id: 'fx_abil_healing_rain', name: 'Healing Rain', description: 'Extends snake by 2 segments.', longDescription: 'Summons a gentle, warm rain from the heavens that nurtures the snake, gradually extending it by 2 segments over 15 seconds.', element: 'water', cooldown: 6, power: 25, unlockCondition: 'Stabilize the abyssal trench', manaCost: 20, tier: 2 },
  { id: 'fx_abil_natures_grasp', name: "Nature's Grasp", description: 'Vines guide toward word clusters.', longDescription: 'Summons sentient vines from the Root Maze that wrap around the snake and gently guide it toward the nearest word cluster.', element: 'earth', cooldown: 5, power: 20, unlockCondition: 'Build mnemonic garden to lv3', manaCost: 25, tier: 2 },
  { id: 'fx_abil_zephyr_shield', name: 'Zephyr Shield', description: 'Wind barrier deflects collision.', longDescription: 'Creates an invisible barrier of compressed wind that deflects one obstacle collision, dissipating harmlessly on impact.', element: 'air', cooldown: 5, power: 30, unlockCondition: 'Build starlight observatory to lv4', manaCost: 30, tier: 2 },
  { id: 'fx_abil_static_field', name: 'Static Field', description: 'Electrifies tiles for double value.', longDescription: 'Generates a field of static electricity that charges all word tiles within range, doubling their collection value.', element: 'lightning', cooldown: 6, power: 45, unlockCondition: 'Build storm collider to lv3', manaCost: 35, tier: 2 },
  { id: 'fx_abil_absolute_freeze', name: 'Absolute Freeze', description: 'Freezes time for 5 seconds.', longDescription: 'Channels the power of Absolute Zero itself, temporarily halting time for everything except the snake for 5 seconds.', element: 'ice', cooldown: 15, power: 120, unlockCondition: 'Bind Absolute Zero', manaCost: 100, tier: 4 },
  { id: 'fx_abil_eclipse', name: 'Total Eclipse', description: 'Reveals hidden rare tiles only.', longDescription: 'Plunges the entire realm into supernatural darkness where only hidden rare tiles glow, making them trivial to find and collect.', element: 'shadow', cooldown: 10, power: 80, unlockCondition: 'Bind Eclipse Wraith', manaCost: 65, tier: 3 },
];

// ─── 18 Achievements ───────────────────────────────────────────────────────

const FX_ACHIEVEMENTS: FxAchievement[] = [
  { id: 'fx_ach_first_bind', name: 'First Binding', description: 'Bind your very first flux elemental.', condition: 'Bind 1 elemental', reward: '50 flux energy', rewardDetail: 'A welcome gift of raw flux energy to fuel your journey.', icon: '🔗', category: 'collection', hidden: false },
  { id: 'fx_ach_elemental_collector', name: 'Elemental Collector', description: 'Assemble a team of 5 bound elementals.', condition: 'Bind 5 elementals', reward: 'Unlock Gale Dash ability', rewardDetail: 'The Gale Dash ability becomes available in your ability roster.', icon: '🔮', category: 'collection', hidden: false },
  { id: 'fx_ach_full_spectrum', name: 'Full Spectrum', description: 'Bind one elemental of each of the 7 types.', condition: 'Bind 1 of each type', reward: 'Flux Overload ability', rewardDetail: 'The ultimate Flux Overload ability is unlocked.', icon: '🌈', category: 'collection', hidden: false },
  { id: 'fx_ach_legendary_bind', name: 'Mythic Binding', description: 'Successfully bind a legendary-class elemental.', condition: 'Bind 1 legendary elemental', reward: 'Legendary title slot', rewardDetail: 'A new title slot is unlocked for legendary-class titles.', icon: '⭐', category: 'collection', hidden: false },
  { id: 'fx_ach_zone_explorer', name: 'Zone Explorer', description: 'Stabilize at least 3 different realm zones.', condition: 'Stabilize 3 zones', reward: '200 flux energy', rewardDetail: 'A substantial flux energy reward for exploration.', icon: '🗺️', category: 'exploration', hidden: false },
  { id: 'fx_ach_zone_master', name: 'Zone Master', description: 'Stabilize all 8 zones to maximum stability.', condition: 'Max stabilize all zones', reward: 'Nexus Guardian title', rewardDetail: 'The prestigious Nexus Guardian title is bestowed.', icon: '🏆', category: 'exploration', hidden: false },
  { id: 'fx_ach_architect', name: 'Flux Architect', description: 'Build your first realm structure.', condition: 'Build 1 structure', reward: '75 flux energy', rewardDetail: 'A reward for beginning your architectural ambitions.', icon: '🏗️', category: 'exploration', hidden: false },
  { id: 'fx_ach_master_builder', name: 'Master Builder', description: 'Build all 25 realm structures.', condition: 'Build all structures', reward: 'Title: Realm Architect', rewardDetail: 'The Realm Architect title signifies complete mastery of construction.', icon: '🏰', category: 'exploration', hidden: false },
  { id: 'fx_ach_max_upgrade', name: 'Maximization', description: 'Upgrade any structure to max level 10.', condition: 'Upgrade structure to lv10', reward: '300 flux energy', rewardDetail: 'Maximum upgrade achievement rewarded with rich flux energy.', icon: '📈', category: 'mastery', hidden: false },
  { id: 'fx_ach_artifact_hunter', name: 'Artifact Hunter', description: 'Activate your first ancient artifact.', condition: 'Activate 1 artifact', reward: '100 flux energy', rewardDetail: 'First artifact activation is rewarded with flux energy.', icon: '🏺', category: 'collection', hidden: false },
  { id: 'fx_ach_artifact_lord', name: 'Artifact Lord', description: 'Activate 10 or more artifacts simultaneously.', condition: 'Activate 10 artifacts', reward: 'Title: Curator of Ages', rewardDetail: 'The Curator of Ages title for dedicated artifact collectors.', icon: '👑', category: 'collection', hidden: false },
  { id: 'fx_ach_event_survivor', name: 'Event Survivor', description: 'Survive 5 realm events in a single session.', condition: 'Survive 5 events', reward: '150 flux energy', rewardDetail: 'Endurance in the face of chaos is rewarded.', icon: '🌊', category: 'combat', hidden: false },
  { id: 'fx_ach_power_1000', name: 'Power Surge', description: 'Accumulate 1000 total elemental power.', condition: 'Reach 1000 total power', reward: 'Title: Flux Conductor', rewardDetail: 'The Flux Conductor title for reaching 1000 total power.', icon: '⚡', category: 'mastery', hidden: false },
  { id: 'fx_ach_words_500', name: 'Word Sage', description: 'Collect 500 words across all sessions.', condition: 'Collect 500 words', reward: '200 flux energy', rewardDetail: 'A generous reward for word collection dedication.', icon: '📚', category: 'mastery', hidden: false },
  { id: 'fx_ach_material_hoarder', name: 'Material Hoarder', description: 'Accumulate 500 total material units.', condition: 'Own 500 materials', reward: 'Void Gateway blueprint', rewardDetail: 'Blueprint for constructing the Void Gateway structure.', icon: '💎', category: 'collection', hidden: false },
  { id: 'fx_ach_streak_50', name: 'Flux Streak', description: 'Achieve a 50-word collection streak.', condition: '50-word streak', reward: 'Title: Untouchable', rewardDetail: 'The Untouchable title for unbroken streaks.', icon: '🔥', category: 'mastery', hidden: false },
  { id: 'fx_ach_all_abilities', name: 'Abilities Unlocked', description: 'Unlock all 22 realm abilities.', condition: 'Unlock all abilities', reward: 'Title: Omniscient', rewardDetail: 'The Omniscient title for achieving complete ability mastery.', icon: '🌟', category: 'mastery', hidden: true },
  { id: 'fx_ach_nexus_conqueror', name: 'Nexus Conqueror', description: 'Fully stabilize the Flux Nexus to 150.', condition: 'Max Flux Nexus zone', reward: 'Title: Nexus Sovereign', rewardDetail: 'The ultimate Nexus Sovereign title for conquering the center.', icon: '💫', category: 'exploration', hidden: false },
];

// ─── 8 Titles ──────────────────────────────────────────────────────────────

const FX_TITLES: FxTitle[] = [
  { id: 'fx_title_inferno_walker', name: 'Inferno Walker', description: 'Treads barefoot through the Magma Core unscathed.', requirement: 'Stabilize Magma Core to 80+', bonus: '+10% fire elemental power', rarity: 'rare', cosmetic: 'Fire particle aura around the snake' },
  { id: 'fx_title_depth_diver', name: 'Depth Diver', description: 'A fearless explorer of the darkest trenches.', requirement: 'Stabilize Abyssal Trench to 80+', bonus: '+10% water elemental power', rarity: 'rare', cosmetic: 'Bubble trail behind the snake' },
  { id: 'fx_title_tunneler', name: 'Root Tunneler', description: 'Master navigator of the underground root labyrinth.', requirement: 'Stabilize Root Maze to 80+', bonus: '+10% earth elemental power', rarity: 'rare', cosmetic: 'Root-like patterns on the board' },
  { id: 'fx_title_sky_nomad', name: 'Sky Nomad', description: 'A wanderer who calls floating islands home.', requirement: 'Stabilize Sky Archipelago to 80+', bonus: '+10% air elemental power', rarity: 'rare', cosmetic: 'Wind trail and cloud particles' },
  { id: 'fx_title_storm_catcher', name: 'Storm Catcher', description: 'The one who bottles lightning and sells it.', requirement: 'Stabilize Thunder Spire to 80+', bonus: '+10% lightning elemental power', rarity: 'rare', cosmetic: 'Electric sparks along the snake body' },
  { id: 'fx_title_permafrost', name: 'Lord Permafrost', description: 'A ruler of the eternal frozen wastes.', requirement: 'Stabilize Glacial Maw to 80+', bonus: '+10% ice elemental power', rarity: 'rare', cosmetic: 'Frost crystals forming on the board' },
  { id: 'fx_title_shadow_seer', name: 'Shadow Seer', description: 'Perceives truths hidden in absolute darkness.', requirement: 'Stabilize Void Fen to 80+', bonus: '+10% shadow elemental power', rarity: 'rare', cosmetic: 'Shadow tendrils extending from the snake' },
  { id: 'fx_title_nexus_guardian', name: 'Nexus Guardian', description: 'The sworn protector of the Flux Nexus.', requirement: 'Stabilize Flux Nexus to 100+', bonus: '+5% to all elemental power', rarity: 'epic', cosmetic: 'Seven-colored aura combining all elements' },
];

// ─── 15 Artifacts ──────────────────────────────────────────────────────────

const FX_ARTIFACTS: FxArtifact[] = [
  { id: 'fx_art_everburn_torch', name: 'Everburn Torch', description: 'Casts flames in seven colors simultaneously.', rarity: 'common', element: 'fire', effect: 'Reveals nearby fire-element tiles', passiveEffect: '+1 fire tile generation per round', lore: 'Forged in the first campfire lit by mortal hands, its flame has never wavered.', awakeningCost: 0 },
  { id: 'fx_art_tidal_compass', name: 'Tidal Compass', description: 'Always points toward the nearest water zone.', rarity: 'common', element: 'water', effect: '+15% water zone navigation speed', passiveEffect: '+2% water material discovery rate', lore: 'Calibrated to the rhythm of the eternal tide, it never points wrong.', awakeningCost: 0 },
  { id: 'fx_art_petra_crown', name: 'Petra Crown', description: 'A crown of living stone that grows heavier.', rarity: 'uncommon', element: 'earth', effect: '+20% word retention', passiveEffect: '+3% earth structure efficiency', lore: 'Once worn by the ancient kings of the Root Maze deep underground.', awakeningCost: 50 },
  { id: 'fx_art_zephyr_cloak', name: 'Zephyr Cloak', description: 'A cloak of woven wind, makes wearer weightless.', rarity: 'uncommon', element: 'air', effect: 'Snake moves 10% faster', passiveEffect: '+3% evasion chance', lore: 'Stitched from the dying breath of a storm god of the Sky Archipelago.', awakeningCost: 50 },
  { id: 'fx_art_thunder_gauntlet', name: 'Thunder Gauntlet', description: 'Crackles with chain lightning on impact.', rarity: 'rare', element: 'lightning', effect: '+25% score from lightning tiles', passiveEffect: 'Abilities deal 5% more damage', lore: 'Built from the finger bones of a lesser thunder deity.', awakeningCost: 100 },
  { id: 'fx_art_frost_mirror', name: 'Frost Mirror', description: 'Shows reflections from parallel ice realms.', rarity: 'rare', element: 'ice', effect: 'Freezes obstacles on contact', passiveEffect: '+5% ice material yield', lore: 'Its surface has never known warmth since it was forged in the deep Glacial Maw.', awakeningCost: 100 },
  { id: 'fx_art_shadow_mask', name: 'Shadow Mask', description: 'Merges the wearer with ambient shadows.', rarity: 'rare', element: 'shadow', effect: 'Temporary invulnerability for 3s', passiveEffect: '+5% shadow synergy', lore: 'Whoever wears it loses their face forever to the shadow dimension.', awakeningCost: 100 },
  { id: 'fx_art_infernal_forge_hammer', name: 'Infernal Forge Hammer', description: 'Hot enough to reshape reality itself.', rarity: 'epic', element: 'fire', effect: 'Double material yield for 30s', passiveEffect: '+8% structure upgrade speed', lore: 'The very tool used by the world-builder to forge the mortal plane.', awakeningCost: 200 },
  { id: 'fx_art_oceanic_chalice', name: 'Oceanic Chalice', description: 'Contains water from every ocean in existence.', rarity: 'epic', element: 'water', effect: 'Full heal once per session', passiveEffect: '+5% healing effectiveness', lore: 'Drinking from it grants visions of cities drowned long ago.', awakeningCost: 200 },
  { id: 'fx_art_worldroot_staff', name: 'Worldroot Staff', description: 'Grown from a cutting of the world tree root.', rarity: 'epic', element: 'earth', effect: '+30% structure upgrade efficiency', passiveEffect: '+10% zone stability regen', lore: 'Its rings count epochs, not years. It has watched worlds be born and die.', awakeningCost: 200 },
  { id: 'fx_art_atmosphere_lute', name: 'Atmosphere Lute', description: 'Music controls the weather itself.', rarity: 'legendary', element: 'air', effect: 'Clears all obstacles on the board', passiveEffect: '+10% all air ability power', lore: 'Only seven songs are known to exist; the eighth song was lost with its composer.', awakeningCost: 500 },
  { id: 'fx_art_stormbreaker_shard', name: 'Stormbreaker Shard', description: 'Fragment of the legendary Stormbreaker.', rarity: 'legendary', element: 'lightning', effect: '+50% lightning ability power', passiveEffect: '+15% lightning synergy', lore: 'It hums with barely contained power when thunder approaches.', awakeningCost: 500 },
  { id: 'fx_art_eternal_crystal', name: 'Eternal Crystal', description: 'Contains a pocket of frozen time.', rarity: 'legendary', element: 'ice', effect: 'Slows game by 30% for 20s', passiveEffect: '+10% ice ability duration', lore: 'Inside it, a single snowflake has been falling for ten thousand years.', awakeningCost: 500 },
  { id: 'fx_art_void_amulet', name: 'Void Amulet', description: 'Opens a window into the space between worlds.', rarity: 'legendary', element: 'shadow', effect: 'Phase through walls for 10s', passiveEffect: '+15% shadow ability power', lore: 'Staring into it reveals your own death — but also your own rebirth.', awakeningCost: 500 },
  { id: 'fx_art_flux_orb', name: 'Primordial Flux Orb', description: 'The original droplet of raw flux energy.', rarity: 'legendary', element: 'lightning', effect: '+10% all elemental synergy', passiveEffect: '+5% all elemental power', lore: 'Before the elements separated, there was only flux. This orb contains the memory of unity.', awakeningCost: 750 },
];

// ─── 12 Events ─────────────────────────────────────────────────────────────

const FX_EVENTS: FxEvent[] = [
  { id: 'fx_evt_solar_flare', name: 'Solar Flare Surge', description: 'Fire flux engulfs the realm.', longDescription: 'A massive eruption of fire flux from the Magma Core sweeps across the realm, empowering all fire elementals and igniting the ground itself.', duration: 60, effect: 'Fire elemental power doubled', element: 'fire', triggerChance: 0.12, severity: 'moderate', mitigation: 'Water elemental shields reduce duration by 50%' },
  { id: 'fx_evt_tidal_flood', name: 'Tidal Flood', description: 'Rising waters flood lower zones.', longDescription: 'The Abyssal Trench overflows, sending massive waves through every low-lying zone. While destructive, the floodwaters carry rare water materials.', duration: 45, effect: 'Water zones grant triple rewards', element: 'water', triggerChance: 0.10, severity: 'moderate', mitigation: 'Earth structures reduce flood damage by 30%' },
  { id: 'fx_evt_earthquake', name: 'Flux Earthquake', description: 'Seismic event destabilizes zone foundations.', longDescription: 'Deep tremors shake the realm to its foundations, randomly reducing zone stability and revealing buried materials in the chaos.', duration: 30, effect: 'Random zones lose 10 stability', element: 'earth', triggerChance: 0.15, severity: 'severe', mitigation: 'Permafrost Anchor reduces stability loss by 40%' },
  { id: 'fx_evt_hurricane', name: 'Hurricane Passage', description: 'Great hurricane sweeps through.', longDescription: 'A category-five hurricane born from colliding air currents tears through the realm, scattering materials in its wake but also clearing obstacles.', duration: 40, effect: 'Double material drops for duration', element: 'air', triggerChance: 0.10, severity: 'severe', mitigation: 'Wind Turbine structures harvest hurricane energy' },
  { id: 'fx_evt_thunderstorm', name: 'Thunderstorm Blitz', description: 'Continuous lightning strikes energize grid.', longDescription: 'An unending barrage of lightning from the Thunder Spire electrifies the entire realm grid, supercharging lightning abilities.', duration: 50, effect: 'Lightning abilities cost no cooldown', element: 'lightning', triggerChance: 0.13, severity: 'moderate', mitigation: 'Lightning Rod structures absorb excess charge safely' },
  { id: 'fx_evt_ice_age', name: 'Mini Ice Age', description: 'Temperatures plummet, freezing zones.', longDescription: 'A sudden and severe cold snap descends from the Glacial Maw, freezing zone mechanics and slowing all progress.', duration: 35, effect: 'Snake speed reduced by 20%, ice power up', element: 'ice', triggerChance: 0.11, severity: 'moderate', mitigation: 'Fire structures counteract freezing effects' },
  { id: 'fx_evt_shadow_eclipse', name: 'Shadow Eclipse', description: 'Shadow flux plunges half realm into darkness.', longDescription: 'An eclipse of pure shadow energy blots out the light in half the realm, revealing hidden treasures but also dangerous shadow entities.', duration: 55, effect: 'Shadow tiles revealed, others dimmed', element: 'shadow', triggerChance: 0.09, severity: 'severe', mitigation: 'Light structures push back shadow boundaries' },
  { id: 'fx_evt_flux_surge', name: 'Flux Convergence', description: 'All elemental fluxes temporarily align.', longDescription: 'A rare cosmic event where all seven elemental fluxes briefly resonate at the same frequency, creating a window of immense power.', duration: 30, effect: 'All synergies boosted by 25%', element: 'lightning', triggerChance: 0.08, severity: 'mild', mitigation: 'No mitigation needed — pure benefit' },
  { id: 'fx_evt_wildfire', name: 'Elemental Wildfire', description: 'Fire and lightning combine devastatingly.', longDescription: 'When fire and lightning fluxes merge uncontrollably, the resulting wildfire burns across the realm, destroying obstacles but also bonus tiles.', duration: 25, effect: 'Obstacles burn away, score x1.5', element: 'fire', triggerChance: 0.07, severity: 'catastrophic', mitigation: 'Water structures can contain the fire spread' },
  { id: 'fx_evt_fog_of_ages', name: 'Fog of Ages', description: 'Ancient fog obscures the board.', longDescription: 'A sentient fog from the dawn of time rolls in, severely reducing visibility but hiding extremely rare tiles within its misty depths.', duration: 40, effect: 'Reduced visibility, rare tiles hidden', element: 'water', triggerChance: 0.10, severity: 'moderate', mitigation: 'Fire and light abilities dissipate fog locally' },
  { id: 'fx_evt_resonance_cascade', name: 'Resonance Cascade', description: 'Harmonics create chain reactions.', longDescription: 'When elemental harmonics reach critical mass, they trigger a cascade of chain reactions that amplify every fifth word collected.', duration: 20, effect: 'Every 5th word triggers combo explosion', element: 'lightning', triggerChance: 0.06, severity: 'mild', mitigation: 'No mitigation needed — pure benefit' },
  { id: 'fx_evt_void_breach', name: 'Void Breach', description: 'Tear in reality spills shadow energy.', longDescription: 'A rift between dimensions opens in the Void Fen, spilling concentrated shadow energy that empowers shadow elementals but spawns dangerous entities.', duration: 45, effect: 'Shadow elementals gain 50% power', element: 'shadow', triggerChance: 0.08, severity: 'severe', mitigation: 'Lightning abilities seal void breaches faster' },
];

// ─── Initial State ─────────────────────────────────────────────────────────

const INITIAL_FX_STATE: FxRealmState = {
  fxElementals: [],
  fxZones: {},
  fxInventory: {},
  fxArtifacts: [],
  fxAchievements: [],
  fxTitle: '',
  fxEvents: [],
  fxStats: {
    elementalsBound: 0,
    zonesStabilized: 0,
    structuresBuilt: 0,
    structuresUpgraded: 0,
    artifactsActivated: 0,
    realmEvents: 0,
    totalPower: 0,
    highestStreak: 0,
    wordsCollected: 0,
    fluxAbsorbed: 0,
    synergiesTriggered: 0,
    abilitiesUsed: 0,
    materialsRefined: 0,
    titlesUnlocked: 0,
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function getStructureLevel(state: FxRealmState, structureId: string): number {
  return (state.fxZones[structureId] as number) ?? 0;
}

function calculateStructureCost(structure: FxStructure, currentLevel: number): number {
  return structure.baseCost + structure.costPerLevel * currentLevel;
}

function getElementalById(id: string): FxElemental | undefined {
  return FX_ELEMENTALS.find(e => e.id === id);
}

function getMaterialById(id: string): FxMaterial | undefined {
  return FX_MATERIALS.find(m => m.id === id);
}

function getArtifactById(id: string): FxArtifact | undefined {
  return FX_ARTIFACTS.find(a => a.id === id);
}

function getZoneById(id: string): FxZone | undefined {
  return FX_ZONES.find(z => z.id === id);
}

function getStructureById(id: string): FxStructure | undefined {
  return FX_STRUCTURES.find(s => s.id === id);
}

function getSynergy(typeA: FxElementType, typeB: FxElementType): FxSynergy | undefined {
  return FX_SYNERGIES.find(s =>
    (s.typeA === typeA && s.typeB === typeB) ||
    (s.typeA === typeB && s.typeB === typeA)
  );
}

function randomEventId(): string {
  const roll = Math.random();
  let cumulative = 0;
  for (const evt of FX_EVENTS) {
    cumulative += evt.triggerChance;
    if (roll < cumulative) return evt.id;
  }
  return FX_EVENTS[0].id;
}

function checkAchievements(state: FxRealmState): string[] {
  const newlyUnlocked: string[] = [];
  const existing = new Set(state.fxAchievements);

  // First Binding
  if (state.fxElementals.length >= 1 && !existing.has('fx_ach_first_bind')) {
    newlyUnlocked.push('fx_ach_first_bind');
  }
  // Elemental Collector
  if (state.fxElementals.length >= 5 && !existing.has('fx_ach_elemental_collector')) {
    newlyUnlocked.push('fx_ach_elemental_collector');
  }
  // Full Spectrum
  if (state.fxElementals.length >= 7 && !existing.has('fx_ach_full_spectrum')) {
    const types = new Set(
      state.fxElementals.map(id => getElementalById(id)?.type).filter(Boolean)
    );
    if (types.size >= 7) newlyUnlocked.push('fx_ach_full_spectrum');
  }
  // Legendary Bind
  if (!existing.has('fx_ach_legendary_bind')) {
    const hasLegendary = state.fxElementals.some(id => getElementalById(id)?.rarity === 'legendary');
    if (hasLegendary) newlyUnlocked.push('fx_ach_legendary_bind');
  }
  // Zone Explorer
  const stabilizedZones = Object.values(state.fxZones).filter(v => (v as number) > 0).length;
  if (stabilizedZones >= 3 && !existing.has('fx_ach_zone_explorer')) {
    newlyUnlocked.push('fx_ach_zone_explorer');
  }
  // Zone Master
  if (stabilizedZones >= 8 && !existing.has('fx_ach_zone_master')) {
    const allMax = FX_ZONES.every(z => (state.fxZones[z.id] ?? 0) >= z.maxStability);
    if (allMax) newlyUnlocked.push('fx_ach_zone_master');
  }
  // Architect
  if (state.fxStats.structuresBuilt >= 1 && !existing.has('fx_ach_architect')) {
    newlyUnlocked.push('fx_ach_architect');
  }
  // Master Builder
  if (state.fxStats.structuresBuilt >= 25 && !existing.has('fx_ach_master_builder')) {
    newlyUnlocked.push('fx_ach_master_builder');
  }
  // Max Upgrade
  if (state.fxStats.structuresUpgraded >= 10 && !existing.has('fx_ach_max_upgrade')) {
    newlyUnlocked.push('fx_ach_max_upgrade');
  }
  // Artifact Hunter
  if (state.fxArtifacts.length >= 1 && !existing.has('fx_ach_artifact_hunter')) {
    newlyUnlocked.push('fx_ach_artifact_hunter');
  }
  // Artifact Lord
  if (state.fxArtifacts.length >= 10 && !existing.has('fx_ach_artifact_lord')) {
    newlyUnlocked.push('fx_ach_artifact_lord');
  }
  // Power Surge
  if (state.fxStats.totalPower >= 1000 && !existing.has('fx_ach_power_1000')) {
    newlyUnlocked.push('fx_ach_power_1000');
  }
  // Word Sage
  if (state.fxStats.wordsCollected >= 500 && !existing.has('fx_ach_words_500')) {
    newlyUnlocked.push('fx_ach_words_500');
  }
  // Material Hoarder
  const totalMats = Object.values(state.fxInventory).reduce((s, v) => s + (v as number), 0);
  if (totalMats >= 500 && !existing.has('fx_ach_material_hoarder')) {
    newlyUnlocked.push('fx_ach_material_hoarder');
  }
  // Streak 50
  if (state.fxStats.highestStreak >= 50 && !existing.has('fx_ach_streak_50')) {
    newlyUnlocked.push('fx_ach_streak_50');
  }
  // Event Survivor
  if (state.fxStats.realmEvents >= 5 && !existing.has('fx_ach_event_survivor')) {
    newlyUnlocked.push('fx_ach_event_survivor');
  }
  // Nexus Conqueror
  if ((state.fxZones['fx_zone_flux_nexus'] ?? 0) >= 150 && !existing.has('fx_ach_nexus_conqueror')) {
    newlyUnlocked.push('fx_ach_nexus_conqueror');
  }
  // All Abilities
  if (state.fxStats.abilitiesUsed >= 22 && !existing.has('fx_ach_all_abilities')) {
    newlyUnlocked.push('fx_ach_all_abilities');
  }

  return newlyUnlocked;
}

// ═══════════════════════════════════════════════════════════════════════════
// FLUX REALM HOOK
// ═══════════════════════════════════════════════════════════════════════════

export default function useFluxRealm() {
  const [state, setState] = useState<FxRealmState>({ ...INITIAL_FX_STATE });
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // ─── Computed: Bound Elemental Power (uses state param) ─────────────────
  const boundPower = useMemo(() => {
    let total = 0;
    for (const eid of state.fxElementals) {
      const el = getElementalById(eid);
      if (el) total += el.power;
    }
    return total;
  }, [state.fxElementals]);

  // ─── Computed: Zone Stability Map (uses state) ─────────────────────────
  const zoneStabilities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const zone of FX_ZONES) {
      map[zone.id] = state.fxZones[zone.id] ?? 0;
    }
    return map;
  }, [state.fxZones]);

  // ─── Computed: Total Inventory Value (uses state) ──────────────────────
  const totalInventoryValue = useMemo(() => {
    let val = 0;
    for (const [matId, qty] of Object.entries(state.fxInventory)) {
      const mat = getMaterialById(matId);
      if (mat) val += mat.value * (qty as number);
    }
    return val;
  }, [state.fxInventory]);

  // ─── Computed: Elemental Count by Type (uses state) ────────────────────
  const elementalCounts = useMemo(() => {
    const counts: Record<string, number> = {
      fire: 0, water: 0, earth: 0, air: 0, lightning: 0, ice: 0, shadow: 0,
    };
    for (const eid of state.fxElementals) {
      const el = getElementalById(eid);
      if (el && el.type in counts) {
        counts[el.type] += 1;
      }
    }
    return counts;
  }, [state.fxElementals]);

  // ─── Computed: Active Synergies (uses state) ───────────────────────────
  const activeSynergies = useMemo(() => {
    const types = new Set<string>();
    for (const eid of state.fxElementals) {
      const el = getElementalById(eid);
      if (el) types.add(el.type);
    }
    const typeArr = Array.from(types) as FxElementType[];
    const synergies: FxSynergy[] = [];
    for (let i = 0; i < typeArr.length; i++) {
      for (let j = i + 1; j < typeArr.length; j++) {
        const syn = getSynergy(typeArr[i], typeArr[j]);
        if (syn) synergies.push(syn);
      }
    }
    return synergies;
  }, [state.fxElementals]);

  // ─── Computed: Unlockable Abilities (uses state) ──────────────────────
  const unlockableAbilities = useMemo(() => {
    return FX_ABILITIES.filter(ability => {
      const cond = ability.unlockCondition;
      const c = elementalCounts;
      if (cond.includes('Bind 2 fire') && c.fire >= 2) return true;
      if (cond.includes('Bind 2 water') && c.water >= 2) return true;
      if (cond.includes('Bind 2 earth') && c.earth >= 2) return true;
      if (cond.includes('Bind 2 air') && c.air >= 2) return true;
      if (cond.includes('Bind 2 lightning') && c.lightning >= 2) return true;
      if (cond.includes('Bind 2 ice') && c.ice >= 2) return true;
      if (cond.includes('Bind 2 shadow') && c.shadow >= 2) return true;
      if (cond.includes('legendary fire') && state.fxElementals.includes('fx_fire_legendary')) return true;
      if (cond.includes('rare water') && state.fxElementals.some(id => {
        const el = getElementalById(id);
        return el?.type === 'water' && el?.rarity === 'rare';
      })) return true;
      if (cond.includes('3 earth zones')) {
        const earthZones = FX_ZONES.filter(z => z.element === 'earth');
        if (earthZones.every(z => (state.fxZones[z.id] ?? 0) > 0)) return true;
      }
      if (cond.includes('wind turbine to lv5') && (state.fxZones['fx_str_wind_turbine'] ?? 0) >= 5) return true;
      if (cond.includes('lightning rod to lv5') && (state.fxZones['fx_str_lightning_rod'] ?? 0) >= 5) return true;
      if (cond.includes('ice artifact') && state.fxArtifacts.some(id => getArtifactById(id)?.element === 'ice')) return true;
      if (cond.includes('void fen') && (state.fxZones['fx_zone_void_fen'] ?? 0) > 0) return true;
      if (cond.includes('7 elementals') && state.fxElementals.length >= 7) return true;
      if (cond.includes('Solar Phoenix') && state.fxElementals.includes('fx_fire_epic')) return true;
      if (cond.includes('abyssal trench') && (state.fxZones['fx_zone_abyssal_trench'] ?? 0) > 0) return true;
      if (cond.includes('mnemonic garden to lv3') && (state.fxZones['fx_str_mnemonic_garden'] ?? 0) >= 3) return true;
      if (cond.includes('starlight observatory to lv4') && (state.fxZones['fx_str_starlight_observatory'] ?? 0) >= 4) return true;
      if (cond.includes('storm collider to lv3') && (state.fxZones['fx_str_storm_collider'] ?? 0) >= 3) return true;
      if (cond.includes('Absolute Zero') && state.fxElementals.includes('fx_ice_legendary')) return true;
      if (cond.includes('Eclipse Wraith') && state.fxElementals.includes('fx_shadow_epic')) return true;
      return false;
    });
  }, [state.fxElementals, state.fxZones, state.fxArtifacts, elementalCounts]);

  // ─── Computed: Available Titles (uses state) ───────────────────────────
  const availableTitles = useMemo(() => {
    return FX_TITLES.filter(title => {
      const req = title.requirement;
      if (req.includes('Magma Core') && (state.fxZones['fx_zone_magma_core'] ?? 0) >= 80) return true;
      if (req.includes('Abyssal Trench') && (state.fxZones['fx_zone_abyssal_trench'] ?? 0) >= 80) return true;
      if (req.includes('Root Maze') && (state.fxZones['fx_zone_root_maze'] ?? 0) >= 80) return true;
      if (req.includes('Sky Archipelago') && (state.fxZones['fx_zone_sky_archipelago'] ?? 0) >= 80) return true;
      if (req.includes('Thunder Spire') && (state.fxZones['fx_zone_thunder_spire'] ?? 0) >= 80) return true;
      if (req.includes('Glacial Maw') && (state.fxZones['fx_zone_glacial_maw'] ?? 0) >= 80) return true;
      if (req.includes('Void Fen') && (state.fxZones['fx_zone_void_fen'] ?? 0) >= 80) return true;
      if (req.includes('Flux Nexus') && (state.fxZones['fx_zone_flux_nexus'] ?? 0) >= 100) return true;
      return false;
    });
  }, [state.fxZones]);

  // ─── Computed: Achievement Progress (uses state) ──────────────────────
  const achievementProgress = useMemo(() => {
    const progress: Record<string, number> = {};
    const total = state.fxElementals.length;
    const stabZones = Object.values(state.fxZones).filter(v => (v as number) > 0).length;
    const totalMats = Object.values(state.fxInventory).reduce((s, v) => s + (v as number), 0);

    progress['fx_ach_first_bind'] = Math.min(1, total);
    progress['fx_ach_elemental_collector'] = Math.min(1, total / 5);
    progress['fx_ach_full_spectrum'] = Math.min(1, new Set(state.fxElementals.map(id => getElementalById(id)?.type).filter(Boolean)).size / 7);
    progress['fx_ach_legendary_bind'] = state.fxElementals.some(id => getElementalById(id)?.rarity === 'legendary') ? 1 : 0;
    progress['fx_ach_zone_explorer'] = Math.min(1, stabZones / 3);
    progress['fx_ach_zone_master'] = Math.min(1, stabZones / 8);
    progress['fx_ach_architect'] = Math.min(1, state.fxStats.structuresBuilt);
    progress['fx_ach_master_builder'] = Math.min(1, state.fxStats.structuresBuilt / 25);
    progress['fx_ach_max_upgrade'] = Math.min(1, state.fxStats.structuresUpgraded / 10);
    progress['fx_ach_artifact_hunter'] = Math.min(1, state.fxArtifacts.length);
    progress['fx_ach_artifact_lord'] = Math.min(1, state.fxArtifacts.length / 10);
    progress['fx_ach_power_1000'] = Math.min(1, boundPower / 1000);
    progress['fx_ach_words_500'] = Math.min(1, state.fxStats.wordsCollected / 500);
    progress['fx_ach_streak_50'] = Math.min(1, state.fxStats.highestStreak / 50);
    progress['fx_ach_material_hoarder'] = Math.min(1, totalMats / 500);
    progress['fx_ach_event_survivor'] = Math.min(1, state.fxStats.realmEvents / 5);
    progress['fx_ach_nexus_conqueror'] = Math.min(1, (state.fxZones['fx_zone_flux_nexus'] ?? 0) / 150);
    progress['fx_ach_all_abilities'] = Math.min(1, unlockableAbilities.length / FX_ABILITIES.length);

    return progress;
  }, [state, boundPower, unlockableAbilities]);

  // ─── Computed: Active Events with Details (uses state) ────────────────
  const activeEventDetails = useMemo(() => {
    return state.fxEvents.map(eid => FX_EVENTS.find(e => e.id === eid)).filter((e): e is FxEvent => !!e);
  }, [state.fxEvents]);

  // ─── Computed: Rarity Distribution (uses state) ───────────────────────
  const rarityDistribution = useMemo(() => {
    const dist: Record<FxRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    for (const eid of state.fxElementals) {
      const el = getElementalById(eid);
      if (el) dist[el.rarity] += 1;
    }
    return dist;
  }, [state.fxElementals]);

  // ─── Computed: Realm Stability Percentage (uses state) ────────────────
  const realmStability = useMemo(() => {
    let totalCurrent = 0;
    let totalMax = 0;
    for (const zone of FX_ZONES) {
      totalCurrent += state.fxZones[zone.id] ?? 0;
      totalMax += zone.maxStability;
    }
    return totalMax === 0 ? 0 : Math.round((totalCurrent / totalMax) * 100);
  }, [state.fxZones]);

  // ─── Computed: Power Ranking Tier (uses boundPower) ───────────────────
  const powerTier = useMemo(() => {
    if (boundPower >= 800) return 'S';
    if (boundPower >= 500) return 'A';
    if (boundPower >= 300) return 'B';
    if (boundPower >= 150) return 'C';
    if (boundPower >= 50) return 'D';
    return 'E';
  }, [boundPower]);

  // ─── Computed: Structure Levels Map (uses state) ──────────────────────
  const structureLevels = useMemo(() => {
    const levels: Record<string, number> = {};
    for (const str of FX_STRUCTURES) {
      levels[str.id] = state.fxZones[str.id] ?? 0;
    }
    return levels;
  }, [state.fxZones]);

  // ─── Computed: Total Material Count (uses state) ──────────────────────
  const totalMaterialCount = useMemo(() => {
    return Object.values(state.fxInventory).reduce((s, v) => s + (v as number), 0);
  }, [state.fxInventory]);

  // ─── Computed: Synergy Multiplier (uses state) ────────────────────────
  const synergyMultiplier = useMemo(() => {
    if (activeSynergies.length === 0) return 1.0;
    const base = activeSynergies.reduce((sum, syn) => sum + syn.multiplier, 0);
    return 1.0 + (base / activeSynergies.length) * 0.1;
  }, [activeSynergies]);

  // ─── Computed: Elemental Completeness (uses state) ────────────────────
  const elementalCompleteness = useMemo(() => {
    const uniqueTypes = new Set(state.fxElementals.map(id => getElementalById(id)?.type).filter(Boolean));
    return {
      types: uniqueTypes.size,
      total: 7,
      percentage: Math.round((uniqueTypes.size / 7) * 100),
      missing: FX_TYPES.filter(t => !uniqueTypes.has(t)),
    };
  }, [state.fxElementals]);

  // ─── Computed: Zone Danger Assessment (uses state) ────────────────────
  const zoneDangerMap = useMemo(() => {
    const danger: Record<string, number> = {};
    for (const zone of FX_ZONES) {
      const stability = state.fxZones[zone.id] ?? 0;
      const dangerLevel = Math.max(0, 1 - stability / zone.maxStability) * zone.hazardLevel;
      danger[zone.id] = Math.round(dangerLevel * 100) / 100;
    }
    return danger;
  }, [state.fxZones]);

  // ─── Computed: Inventory by Element (uses state) ──────────────────────
  const inventoryByElement = useMemo(() => {
    const grouped: Record<string, number> = {
      fire: 0, water: 0, earth: 0, air: 0, lightning: 0, ice: 0, shadow: 0,
    };
    for (const [matId, qty] of Object.entries(state.fxInventory)) {
      const mat = getMaterialById(matId);
      if (mat && mat.element in grouped) {
        grouped[mat.element] += (qty as number);
      }
    }
    return grouped;
  }, [state.fxInventory]);

  // ─── Computed: Dominant Element (uses state) ────────────────────────
  const dominantElement = useMemo(() => {
    let maxType: FxElementType = 'fire';
    let maxCount = 0;
    for (const entry of Object.entries(elementalCounts)) {
      if ((entry[1] as number) > maxCount) {
        maxCount = entry[1] as number;
        maxType = entry[0] as FxElementType;
      }
    }
    return maxType;
  }, [elementalCounts]);

  // ─── Computed: Average Elemental Power (uses state) ────────────────────
  const averageElementalPower = useMemo(() => {
    if (state.fxElementals.length === 0) return 0;
    return Math.round(boundPower / state.fxElementals.length);
  }, [boundPower, state.fxElementals.length]);

  // ─── Computed: Structures by Category (uses state) ────────────────────
  const structuresByCategory = useMemo(() => {
    const grouped: Record<string, { id: string; name: string; level: number; maxLevel: number; element: FxElementType }[]> = {
      synergy: [], production: [], defense: [], utility: [],
    };
    for (const str of FX_STRUCTURES) {
      const level = state.fxZones[str.id] ?? 0;
      if (level > 0) {
        grouped[str.category].push({
          id: str.id,
          name: str.name,
          level,
          maxLevel: str.maxLevel,
          element: str.element,
        });
      }
    }
    return grouped;
  }, [state.fxZones]);

  // ─── Computed: Realm Readiness Score (uses state) ──────────────────────
  const realmReadinessScore = useMemo(() => {
    let score = 0;
    score += state.fxElementals.length * 15;
    score += Object.values(state.fxZones).filter(v => (v as number) > 0).length * 20;
    score += state.fxArtifacts.length * 10;
    score += state.fxAchievements.length * 8;
    score += state.fxStats.structuresBuilt * 6;
    score += Math.min(realmStability, 100) * 2;
    score += Math.min(state.fxStats.highestStreak, 50);
    score += activeSynergies.length * 25;
    return Math.min(score, 999);
  }, [state, realmStability, activeSynergies.length]);

  // ─── Computed: Materials by Rarity (uses state) ───────────────────────
  const materialsByRarity = useMemo(() => {
    const grouped: Record<FxRarity, { id: string; name: string; quantity: number; value: number }[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    };
    for (const [matId, qty] of Object.entries(state.fxInventory)) {
      const mat = getMaterialById(matId);
      if (mat && (qty as number) > 0) {
        grouped[mat.rarity].push({
          id: matId,
          name: mat.name,
          quantity: qty as number,
          value: mat.value,
        });
      }
    }
    return grouped;
  }, [state.fxInventory]);

  // ─── Computed: Bound Elemental Details (uses state) ────────────────────
  const boundElementalDetails = useMemo(() => {
    return state.fxElementals.map(id => getElementalById(id)).filter((e): e is FxElemental => !!e);
  }, [state.fxElementals]);

  // ─── Computed: Achievements by Category (uses state) ───────────────────
  const achievementsByCategory = useMemo(() => {
    const unlocked = new Set(state.fxAchievements);
    const grouped: Record<string, { achievement: FxAchievement; unlocked: boolean }[]> = {
      collection: [], combat: [], exploration: [], social: [], mastery: [],
    };
    for (const ach of FX_ACHIEVEMENTS) {
      if (ach.category in grouped) {
        grouped[ach.category].push({ achievement: ach, unlocked: unlocked.has(ach.id) });
      }
    }
    return grouped;
  }, [state.fxAchievements]);

  // ─── Computed: Next Event Probability (uses state) ─────────────────────
  const nextEventProbability = useMemo(() => {
    const baseChance = 0.05;
    const activeCount = state.fxEvents.length;
    const reduction = activeCount * 0.02;
    return Math.max(0.01, baseChance - reduction);
  }, [state.fxEvents.length]);

  // ─── Computed: Total Passive Effects (uses state) ─────────────────────
  const totalPassiveEffects = useMemo(() => {
    const passives: string[] = [];
    for (const eid of state.fxElementals) {
      const el = getElementalById(eid);
      if (el) passives.push(`[${el.type}] ${el.passive}`);
    }
    for (const aid of state.fxArtifacts) {
      const art = getArtifactById(aid);
      if (art && art.passiveEffect) passives.push(`[artifact] ${art.passiveEffect}`);
    }
    return passives;
  }, [state.fxElementals, state.fxArtifacts]);

  // ─── Computed: Structure Upgrade Cost Preview (uses state) ────────────
  const structureCosts = useMemo(() => {
    const costs: Record<string, { currentLevel: number; nextCost: number; maxed: boolean }> = {};
    for (const str of FX_STRUCTURES) {
      const currentLevel = state.fxZones[str.id] ?? 0;
      const maxed = currentLevel >= str.maxLevel;
      costs[str.id] = {
        currentLevel,
        nextCost: maxed ? 0 : calculateStructureCost(str, currentLevel),
        maxed,
      };
    }
    return costs;
  }, [state.fxZones]);

  // ─── Computed: Title Bonus Active (uses state) ─────────────────────────
  const activeTitleBonus = useMemo(() => {
    if (!state.fxTitle) return null;
    return FX_TITLES.find(t => t.id === state.fxTitle) ?? null;
  }, [state.fxTitle]);

  // ─── Computed: Artifact Effects Summary (uses state) ──────────────────
  const artifactEffectsSummary = useMemo(() => {
    return state.fxArtifacts.map(id => {
      const art = getArtifactById(id);
      return {
        id,
        name: art?.name ?? 'Unknown',
        effect: art?.effect ?? '',
        element: art?.element ?? 'fire',
        rarity: art?.rarity ?? 'common',
      };
    });
  }, [state.fxArtifacts]);

  // ─── Computed: Overall Completion Percentage (uses state) ─────────────
  const completionPercentage = useMemo(() => {
    const elementalPct = state.fxElementals.length / FX_ELEMENTALS.length;
    const zonePct = Object.values(state.fxZones).filter(v => (v as number) > 0).length / FX_ZONES.length;
    const achievementPct = state.fxAchievements.length / FX_ACHIEVEMENTS.length;
    const titlePct = availableTitles.length / FX_TITLES.length;
    const artifactPct = state.fxArtifacts.length / FX_ARTIFACTS.length;
    const overall = (
      elementalPct * 25 +
      zonePct * 25 +
      achievementPct * 20 +
      titlePct * 15 +
      artifactPct * 15
    );
    return Math.round(overall * 100);
  }, [state.fxElementals, state.fxZones, state.fxAchievements, availableTitles.length, state.fxArtifacts]);

  // ─── Side Effects (if blocks) ──────────────────────────────────────────
  if (state.fxElementals.length > 0) {
    const expectedPower = state.fxElementals.reduce((sum, id) => {
      const el = getElementalById(id);
      return sum + (el?.power ?? 0);
    }, 0);
    if (state.fxStats.totalPower !== expectedPower) {
      setState(prev => ({
        ...prev,
        fxStats: { ...prev.fxStats, totalPower: expectedPower },
      }));
    }
  }

  if (state.fxTitle !== '' && !availableTitles.find(t => t.id === state.fxTitle)) {
    // Clear invalid title if requirements no longer met
    if (state.fxAchievements.length > 0) {
      setState(prev => ({ ...prev, fxTitle: '' }));
    }
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  const bindElemental = useCallback((id: string) => {
    setState(prev => {
      if (prev.fxElementals.includes(id)) return prev;
      const el = getElementalById(id);
      if (!el) return prev;
      const newElementals = [...prev.fxElementals, id];
      const newPower = newElementals.reduce((sum, eid) => {
        const found = getElementalById(eid);
        return sum + (found?.power ?? 0);
      }, 0);
      const newState: FxRealmState = {
        ...prev,
        fxElementals: newElementals,
        fxStats: {
          ...prev.fxStats,
          elementalsBound: prev.fxStats.elementalsBound + 1,
          totalPower: newPower,
        },
      };
      const newAchievements = checkAchievements(newState);
      if (newAchievements.length > 0) {
        newState.fxAchievements = Array.from(new Set([...prev.fxAchievements, ...newAchievements]));
      }
      return newState;
    });
  }, []);

  const stabilizeZone = useCallback((id: string) => {
    setState(prev => {
      const zone = getZoneById(id);
      if (!zone) return prev;
      const current = prev.fxZones[id] ?? 0;
      if (current >= zone.maxStability) return prev;
      const increment = Math.ceil(zone.maxStability * 0.1);
      const newLevel = Math.min(current + increment, zone.maxStability);
      const newZones = { ...prev.fxZones, [id]: newLevel };
      const isFullyStabilized = newLevel >= zone.maxStability && current < zone.maxStability;
      const newState: FxRealmState = {
        ...prev,
        fxZones: newZones,
        fxStats: {
          ...prev.fxStats,
          zonesStabilized: isFullyStabilized
            ? prev.fxStats.zonesStabilized + 1
            : prev.fxStats.zonesStabilized,
        },
      };
      const newAchievements = checkAchievements(newState);
      if (newAchievements.length > 0) {
        newState.fxAchievements = Array.from(new Set([...prev.fxAchievements, ...newAchievements]));
      }
      return newState;
    });
  }, []);

  const buildStructure = useCallback((id: string) => {
    setState(prev => {
      const structure = getStructureById(id);
      if (!structure) return prev;
      const currentLevel = prev.fxZones[id] ?? 0;
      if (currentLevel >= structure.maxLevel) return prev;
      const newZones = { ...prev.fxZones, [id]: currentLevel + 1 };
      const isNew = currentLevel === 0;
      const newState: FxRealmState = {
        ...prev,
        fxZones: newZones,
        fxStats: {
          ...prev.fxStats,
          structuresBuilt: isNew ? prev.fxStats.structuresBuilt + 1 : prev.fxStats.structuresBuilt,
          structuresUpgraded: prev.fxStats.structuresUpgraded + 1,
        },
      };
      const newAchievements = checkAchievements(newState);
      if (newAchievements.length > 0) {
        newState.fxAchievements = Array.from(new Set([...prev.fxAchievements, ...newAchievements]));
      }
      return newState;
    });
  }, []);

  const activateArtifact = useCallback((id: string) => {
    setState(prev => {
      if (prev.fxArtifacts.includes(id)) return prev;
      const artifact = getArtifactById(id);
      if (!artifact) return prev;
      const newArtifacts = [...prev.fxArtifacts, id];
      const newState: FxRealmState = {
        ...prev,
        fxArtifacts: newArtifacts,
        fxStats: {
          ...prev.fxStats,
          artifactsActivated: prev.fxStats.artifactsActivated + 1,
        },
      };
      const newAchievements = checkAchievements(newState);
      if (newAchievements.length > 0) {
        newState.fxAchievements = Array.from(new Set([...prev.fxAchievements, ...newAchievements]));
      }
      return newState;
    });
  }, []);

  const triggerRealmEvent = useCallback(() => {
    const eventId = randomEventId();
    setState(prev => {
      const newEvents = [...prev.fxEvents, eventId];
      const newState: FxRealmState = {
        ...prev,
        fxEvents: newEvents,
        fxStats: {
          ...prev.fxStats,
          realmEvents: prev.fxStats.realmEvents + 1,
        },
      };
      const newAchievements = checkAchievements(newState);
      if (newAchievements.length > 0) {
        newState.fxAchievements = Array.from(new Set([...prev.fxAchievements, ...newAchievements]));
      }
      return newState;
    });
    const evt = FX_EVENTS.find(e => e.id === eventId);
    if (evt) {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          fxEvents: prev.fxEvents.filter(eid => eid !== eventId),
        }));
      }, evt.duration * 1000);
    }
  }, []);

  const resetFluxRealm = useCallback(() => {
    setState({ ...INITIAL_FX_STATE });
  }, []);

  const addMaterial = useCallback((materialId: string, quantity: number) => {
    setState(prev => ({
      ...prev,
      fxInventory: {
        ...prev.fxInventory,
        [materialId]: (prev.fxInventory[materialId] ?? 0) + quantity,
      },
    }));
  }, []);

  const removeMaterial = useCallback((materialId: string, quantity: number) => {
    setState(prev => {
      const current = prev.fxInventory[materialId] ?? 0;
      if (current < quantity) return prev;
      const newQty = current - quantity;
      const newInventory = { ...prev.fxInventory };
      if (newQty <= 0) {
        delete newInventory[materialId];
      } else {
        newInventory[materialId] = newQty;
      }
      return { ...prev, fxInventory: newInventory };
    });
  }, []);

  const setFxTitle = useCallback((titleId: string) => {
    setState(prev => {
      const title = FX_TITLES.find(t => t.id === titleId);
      if (!title) return prev;
      return { ...prev, fxTitle: titleId };
    });
  }, []);

  const expireEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      fxEvents: prev.fxEvents.filter(eid => eid !== eventId),
    }));
  }, []);

  const incrementWordsCollected = useCallback((count: number) => {
    setState(prev => ({
      ...prev,
      fxStats: {
        ...prev.fxStats,
        wordsCollected: prev.fxStats.wordsCollected + count,
      },
    }));
  }, []);

  const updateHighestStreak = useCallback((streak: number) => {
    setState(prev => ({
      ...prev,
      fxStats: {
        ...prev.fxStats,
        highestStreak: Math.max(prev.fxStats.highestStreak, streak),
      },
    }));
  }, []);

  const addFluxAbsorbed = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      fxStats: {
        ...prev.fxStats,
        fluxAbsorbed: prev.fxStats.fluxAbsorbed + amount,
      },
    }));
  }, []);

  const incrementSynergiesTriggered = useCallback(() => {
    setState(prev => ({
      ...prev,
      fxStats: {
        ...prev.fxStats,
        synergiesTriggered: prev.fxStats.synergiesTriggered + 1,
      },
    }));
  }, []);

  const incrementAbilitiesUsed = useCallback(() => {
    setState(prev => ({
      ...prev,
      fxStats: {
        ...prev.fxStats,
        abilitiesUsed: prev.fxStats.abilitiesUsed + 1,
      },
    }));
  }, []);

  const incrementMaterialsRefined = useCallback((count: number) => {
    setState(prev => ({
      ...prev,
      fxStats: {
        ...prev.fxStats,
        materialsRefined: prev.fxStats.materialsRefined + count,
      },
    }));
  }, []);

  const decrementZoneStability = useCallback((zoneId: string, amount: number) => {
    setState(prev => {
      const zone = getZoneById(zoneId);
      if (!zone) return prev;
      const current = prev.fxZones[zoneId] ?? 0;
      const newLevel = Math.max(0, current - amount);
      return { ...prev, fxZones: { ...prev.fxZones, [zoneId]: newLevel } };
    });
  }, []);

  const unbindElemental = useCallback((id: string) => {
    setState(prev => {
      if (!prev.fxElementals.includes(id)) return prev;
      const newElementals = prev.fxElementals.filter(eid => eid !== id);
      const newPower = newElementals.reduce((sum, eid) => {
        const el = getElementalById(eid);
        return sum + (el?.power ?? 0);
      }, 0);
      return {
        ...prev,
        fxElementals: newElementals,
        fxStats: {
          ...prev.fxStats,
          elementalsBound: Math.max(0, prev.fxStats.elementalsBound - 1),
          totalPower: newPower,
        },
      };
    });
  }, []);

  const deactivateArtifact = useCallback((id: string) => {
    setState(prev => {
      if (!prev.fxArtifacts.includes(id)) return prev;
      return {
        ...prev,
        fxArtifacts: prev.fxArtifacts.filter(aid => aid !== id),
      };
    });
  }, []);

  const batchBindElementals = useCallback((ids: string[]) => {
    setState(prev => {
      const newIds = ids.filter(id => !prev.fxElementals.includes(id));
      if (newIds.length === 0) return prev;
      const mergedElementals = [...prev.fxElementals, ...newIds];
      const newPower = mergedElementals.reduce((sum, eid) => {
        const el = getElementalById(eid);
        return sum + (el?.power ?? 0);
      }, 0);
      const newState: FxRealmState = {
        ...prev,
        fxElementals: mergedElementals,
        fxStats: {
          ...prev.fxStats,
          elementalsBound: prev.fxStats.elementalsBound + newIds.length,
          totalPower: newPower,
        },
      };
      const newAchievements = checkAchievements(newState);
      if (newAchievements.length > 0) {
        newState.fxAchievements = Array.from(new Set([...prev.fxAchievements, ...newAchievements]));
      }
      return newState;
    });
  }, []);

  const applyEarthquakeDamage = useCallback(() => {
    setState(prev => {
      const zoneIds = FX_ZONES.map(z => z.id);
      const affectedZone = zoneIds[Math.floor(Math.random() * zoneIds.length)];
      const zone = getZoneById(affectedZone);
      if (!zone) return prev;
      const current = prev.fxZones[affectedZone] ?? 0;
      const damage = Math.ceil(zone.maxStability * 0.1);
      const newLevel = Math.max(0, current - damage);
      return {
        ...prev,
        fxZones: { ...prev.fxZones, [affectedZone]: newLevel },
      };
    });
  }, []);

  const canBindElemental = useCallback((id: string): boolean => {
    if (stateRef.current.fxElementals.includes(id)) return false;
    const el = getElementalById(id);
    if (!el) return false;
    return true;
  }, []);

  const canStabilizeZone = useCallback((id: string): boolean => {
    const zone = getZoneById(id);
    if (!zone) return false;
    const current = stateRef.current.fxZones[id] ?? 0;
    return current < zone.maxStability;
  }, []);

  const canBuildStructure = useCallback((id: string): boolean => {
    const structure = getStructureById(id);
    if (!structure) return false;
    const currentLevel = stateRef.current.fxZones[id] ?? 0;
    return currentLevel < structure.maxLevel;
  }, []);

  const canActivateArtifact = useCallback((id: string): boolean => {
    if (stateRef.current.fxArtifacts.includes(id)) return false;
    const art = getArtifactById(id);
    if (!art) return false;
    return true;
  }, []);

  const getPassiveBonusByElement = useCallback((elementType: FxElementType): number => {
    let bonus = 0;
    const activeTitle = FX_TITLES.find(t => t.id === stateRef.current.fxTitle);
    if (activeTitle && activeTitle.bonus.includes(elementType)) {
      bonus += 10;
    }
    if (activeTitle && activeTitle.id === 'fx_title_nexus_guardian') {
      bonus += 5;
    }
    const activeFireCount = stateRef.current.fxElementals.filter(id => getElementalById(id)?.type === elementType).length;
    bonus += activeFireCount * 2;
    return bonus;
  }, []);

  const getZoneRewards = useCallback((zoneId: string): FxMaterial[] => {
    const zone = getZoneById(zoneId);
    if (!zone) return [];
    return zone.rewards
      .map(rid => getMaterialById(rid))
      .filter((m): m is FxMaterial => !!m);
  }, []);

  const getAbilityTierList = useCallback((tier: number): FxAbility[] => {
    return FX_ABILITIES.filter(a => a.tier <= tier);
  }, []);

  const getStructuresByElement = useCallback((elementType: FxElementType): FxStructure[] => {
    return FX_STRUCTURES.filter(s => s.element === elementType);
  }, []);

  const getElementalsByRarity = useCallback((rarity: FxRarity): FxElemental[] => {
    return FX_ELEMENTALS.filter(e => e.rarity === rarity);
  }, []);

  const getArtifactsByRarity = useCallback((rarity: FxRarity): FxArtifact[] => {
    return FX_ARTIFACTS.filter(a => a.rarity === rarity);
  }, []);

  const getEventsBySeverity = useCallback((severity: FxEvent['severity']): FxEvent[] => {
    return FX_EVENTS.filter(e => e.severity === severity);
  }, []);

  const getSynergyBetween = useCallback((typeA: FxElementType, typeB: FxElementType): FxSynergy | null => {
    return getSynergy(typeA, typeB) ?? null;
  }, []);

  const exportRealmState = useCallback((): string => {
    return JSON.stringify(stateRef.current, null, 2);
  }, []);

  const importRealmState = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as FxRealmState;
      if (parsed && parsed.fxElementals && parsed.fxStats) {
        setState(parsed);
      }
    } catch {
      // Invalid JSON — ignore
    }
  }, []);

  const batchStabilizeZones = useCallback((zoneIds: string[]) => {
    setState(prev => {
      const newZones = { ...prev.fxZones };
      let newStabilized = 0;
      for (const zid of zoneIds) {
        const zone = getZoneById(zid);
        if (!zone) continue;
        const current = newZones[zid] ?? 0;
        if (current >= zone.maxStability) continue;
        const increment = Math.ceil(zone.maxStability * 0.1);
        const newLevel = Math.min(current + increment, zone.maxStability);
        newZones[zid] = newLevel;
        if (newLevel >= zone.maxStability && current < zone.maxStability) {
          newStabilized += 1;
        }
      }
      if (newStabilized === 0) return prev;
      const newState: FxRealmState = {
        ...prev,
        fxZones: newZones,
        fxStats: {
          ...prev.fxStats,
          zonesStabilized: prev.fxStats.zonesStabilized + newStabilized,
        },
      };
      const newAchievements = checkAchievements(newState);
      if (newAchievements.length > 0) {
        newState.fxAchievements = Array.from(new Set([...prev.fxAchievements, ...newAchievements]));
      }
      return newState;
    });
  }, []);

  const setFluxAbsorbed = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      fxStats: { ...prev.fxStats, fluxAbsorbed: amount },
    }));
  }, []);

  // ─── fxAPI Return Object (Pattern A: constants on API) ─────────────────

  const fxAPI = {
    // ── FX_ Constants ──
    FX_ELEMENTALS,
    FX_ZONES,
    FX_MATERIALS,
    FX_STRUCTURES,
    FX_ABILITIES,
    FX_ACHIEVEMENTS,
    FX_TITLES,
    FX_ARTIFACTS,
    FX_EVENTS,
    FX_SYNERGIES,
    FX_COLORS,
    FX_GRADIENTS,
    FX_RARITIES,
    FX_TYPES,
    FX_TYPE_EMOJIS,
    FX_RARITY_EMOJIS,
    FX_INITIAL_STATE: INITIAL_FX_STATE,

    // ── State ──
    fxElementals: state.fxElementals,
    fxZones: state.fxZones,
    fxInventory: state.fxInventory,
    fxArtifacts: state.fxArtifacts,
    fxAchievements: state.fxAchievements,
    fxTitle: state.fxTitle,
    fxEvents: state.fxEvents,
    fxStats: state.fxStats,

    // ── Computed Values ──
    boundPower,
    zoneStabilities,
    totalInventoryValue,
    elementalCounts,
    activeSynergies,
    unlockableAbilities,
    availableTitles,
    achievementProgress,
    activeEventDetails,
    rarityDistribution,
    realmStability,
    powerTier,
    structureLevels,
    totalMaterialCount,
    synergyMultiplier,
    elementalCompleteness,
    zoneDangerMap,
    inventoryByElement,
    dominantElement,
    averageElementalPower,
    structuresByCategory,
    realmReadinessScore,
    materialsByRarity,
    boundElementalDetails,
    achievementsByCategory,
    nextEventProbability,
    totalPassiveEffects,
    structureCosts,
    activeTitleBonus,
    artifactEffectsSummary,
    completionPercentage,

    // ── Primary Actions ──
    bindElemental,
    stabilizeZone,
    buildStructure,
    activateArtifact,
    triggerRealmEvent,
    resetFluxRealm,

    // ── Inventory Actions ──
    addMaterial,
    removeMaterial,

    // ── Title Actions ──
    setFxTitle,

    // ── Event Actions ──
    expireEvent,

    // ── Stats Actions ──
    incrementWordsCollected,
    updateHighestStreak,
    addFluxAbsorbed,
    incrementSynergiesTriggered,
    incrementAbilitiesUsed,
    incrementMaterialsRefined,

    // ── Zone Actions ──
    decrementZoneStability,

    // ── Reverse Actions ──
    unbindElemental,
    deactivateArtifact,

    // ── Batch Actions ──
    batchBindElementals,
    batchStabilizeZones,

    // ── Event Actions ──
    applyEarthquakeDamage,

    // ── Validation Actions ──
    canBindElemental,
    canStabilizeZone,
    canBuildStructure,
    canActivateArtifact,

    // ── Query Actions ──
    getPassiveBonusByElement,
    getZoneRewards,
    getAbilityTierList,
    getStructuresByElement,
    getElementalsByRarity,
    getArtifactsByRarity,
    getEventsBySeverity,
    getSynergyBetween,

    // ── Persistence Actions ──
    exportRealmState,
    importRealmState,
    setFluxAbsorbed,
  };

  return fxAPI;
}
