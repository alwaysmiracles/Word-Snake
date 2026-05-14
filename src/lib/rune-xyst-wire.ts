import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Color Theme Constants ───────────────────────────────────────────────────

const RX_ARCANE_PURPLE = '#6A0DAD';
const RX_RUNE_GOLD = '#FFD700';
const RX_SIGIL_BLUE = '#00BFFF';
const RX_STONE_GRAY = '#808080';
const RX_DARK_OBISIDIAN = '#1A1A2E';
const RX_ETHEREAL_VIOLET = '#9B59B6';
const RX_EMBER_ORANGE = '#E67E22';
const RX_FROST_WHITE = '#ECF0F1';
const RX_VOID_BLACK = '#0D0D0D';
const RX_AZURE_SHIMMER = '#7FDBFF';
const RX_CRIMSON_RUNE = '#C0392B';

// ─── Glyph Rarity & Species Types ────────────────────────────────────────────

const RX_RARITY = {
  COMMON: 'Common',
  UNCOMMON: 'Uncommon',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
} as const;

type RxRarity = (typeof RX_RARITY)[keyof typeof RX_RARITY];

const RX_RARITY_COLORS: Record<RxRarity, string> = {
  Common: RX_STONE_GRAY,
  Uncommon: RX_SIGIL_BLUE,
  Rare: RX_ARCANE_PURPLE,
  Epic: RX_EMBER_ORANGE,
  Legendary: RX_RUNE_GOLD,
};

const RX_RARITY_MULTIPLIER: Record<RxRarity, number> = {
  Common: 1.0,
  Uncommon: 1.5,
  Rare: 2.5,
  Epic: 4.0,
  Legendary: 7.0,
};

const RX_SPECIES = [
  'fire_rune',
  'ice_glyph',
  'thunder_sigil',
  'earth_rune',
  'shadow_glyph',
  'light_sigil',
  'void_rune',
] as const;

type RxSpecies = (typeof RX_SPECIES)[number];

const RX_SPECIES_LABELS: Record<RxSpecies, string> = {
  fire_rune: 'Fire Rune',
  ice_glyph: 'Ice Glyph',
  thunder_sigil: 'Thunder Sigil',
  earth_rune: 'Earth Rune',
  shadow_glyph: 'Shadow Glyph',
  light_sigil: 'Light Sigil',
  void_rune: 'Void Rune',
};

const RX_SPECIES_COLORS: Record<RxSpecies, string> = {
  fire_rune: '#E74C3C',
  ice_glyph: '#3498DB',
  thunder_sigil: '#F1C40F',
  earth_rune: '#8B6914',
  shadow_glyph: '#2C3E50',
  light_sigil: '#F9E79F',
  void_rune: '#6C3483',
};

// ─── 35 Rune Glyphs ──────────────────────────────────────────────────────────

interface RxGlyph {
  id: string;
  name: string;
  species: RxSpecies;
  rarity: RxRarity;
  power: number;
  description: string;
  arcanaCost: number;
  unlockLevel: number;
  syllable: string;
  weight: number;
}

const RX_GLYPHS: RxGlyph[] = [
  // ── Common (7 glyphs, one per species) ──
  {
    id: 'ember_mark',
    name: 'Ember Mark',
    species: 'fire_rune',
    rarity: 'Common',
    power: 10,
    description: 'A basic fire rune that smolders with latent heat. Often found scratched into hearthstones by fledgling runecasters.',
    arcanaCost: 5,
    unlockLevel: 1,
    syllable: 'ign',
    weight: 10,
  },
  {
    id: 'frost_trace',
    name: 'Frost Trace',
    species: 'ice_glyph',
    rarity: 'Common',
    power: 10,
    description: 'A simple frost glyph that leaves a trail of cold air. Appretices use it to preserve food in the arcade larders.',
    arcanaCost: 5,
    unlockLevel: 1,
    syllable: 'gel',
    weight: 10,
  },
  {
    id: 'spark_scratch',
    name: 'Spark Scratch',
    species: 'thunder_sigil',
    rarity: 'Common',
    power: 12,
    description: 'A crude lightning sigil that crackles with minor static discharge. Found on the handles of arcane tools.',
    arcanaCost: 5,
    unlockLevel: 1,
    syllable: 'vol',
    weight: 10,
  },
  {
    id: 'pebble_seal',
    name: 'Pebble Seal',
    species: 'earth_rune',
    rarity: 'Common',
    power: 8,
    description: 'A humble earth rune carved from smooth river stone. Grants stability to nearby structures.',
    arcanaCost: 5,
    unlockLevel: 1,
    syllable: 'ter',
    weight: 10,
  },
  {
    id: 'shade_stroke',
    name: 'Shade Stroke',
    species: 'shadow_glyph',
    rarity: 'Common',
    power: 11,
    description: 'A simple shadow glyph that dims surrounding light. Used by sentries for camouflage in dark corridors.',
    arcanaCost: 5,
    unlockLevel: 1,
    syllable: 'umbr',
    weight: 10,
  },
  {
    id: 'glint_rune',
    name: 'Glint Rune',
    species: 'light_sigil',
    rarity: 'Common',
    power: 9,
    description: 'A modest light sigil that produces a soft glow. Guides travelers through the deepest arcade passages.',
    arcanaCost: 5,
    unlockLevel: 1,
    syllable: 'lux',
    weight: 10,
  },
  {
    id: 'hollow_mark',
    name: 'Hollow Mark',
    species: 'void_rune',
    rarity: 'Common',
    power: 13,
    description: 'A basic void rune that creates a tiny pocket of absence. Students often accidentally erase their own notes with it.',
    arcanaCost: 6,
    unlockLevel: 1,
    syllable: 'nih',
    weight: 10,
  },
  // ── Uncommon (7 glyphs) ──
  {
    id: 'flame_weave',
    name: 'Flame Weave',
    species: 'fire_rune',
    rarity: 'Uncommon',
    power: 22,
    description: 'Interlocking fire runes that form a burning lattice. Used to reinforce the walls of the Rune Forge Arcade.',
    arcanaCost: 15,
    unlockLevel: 3,
    syllable: 'pyra',
    weight: 8,
  },
  {
    id: 'crystal_shard_glyph',
    name: 'Crystal Shard Glyph',
    species: 'ice_glyph',
    rarity: 'Uncommon',
    power: 20,
    description: 'A multi-faceted ice glyph that refracts light into prismatic cold. Enchanters prize it for freezing enchantments.',
    arcanaCost: 14,
    unlockLevel: 3,
    syllable: 'cryo',
    weight: 8,
  },
  {
    id: 'storm_hawk_sigil',
    name: 'Storm Hawk Sigil',
    species: 'thunder_sigil',
    rarity: 'Uncommon',
    power: 24,
    description: 'A thunder sigil shaped like a diving hawk. Channelers use it to summon localized lightning strikes.',
    arcanaCost: 16,
    unlockLevel: 3,
    syllable: 'tonit',
    weight: 8,
  },
  {
    id: 'iron_root_rune',
    name: 'Iron Root Rune',
    species: 'earth_rune',
    rarity: 'Uncommon',
    power: 18,
    description: 'An earth rune that extends deep crystalline roots into the ground. Stabilizes large structures against tremors.',
    arcanaCost: 12,
    unlockLevel: 3,
    syllable: 'petra',
    weight: 8,
  },
  {
    id: 'dusk_veil_glyph',
    name: 'Dusk Veil Glyph',
    species: 'shadow_glyph',
    rarity: 'Uncommon',
    power: 21,
    description: 'A shadow glyph that expands into a concealing veil. Operatives of the arcade use it for stealth missions.',
    arcanaCost: 15,
    unlockLevel: 4,
    syllable: 'noct',
    weight: 8,
  },
  {
    id: 'dawn_burst_sigil',
    name: 'Dawn Burst Sigil',
    species: 'light_sigil',
    rarity: 'Uncommon',
    power: 19,
    description: 'A light sigil that blazes with sunrise intensity. Deployed to disorient shadow creatures in the deeper arcades.',
    arcanaCost: 14,
    unlockLevel: 3,
    syllable: 'aur',
    weight: 8,
  },
  {
    id: 'null_wisp_rune',
    name: 'Null Wisp Rune',
    species: 'void_rune',
    rarity: 'Uncommon',
    power: 25,
    description: 'A void rune that releases wisps of anti-magic. Dangerous if placed near active runic circuits.',
    arcanaCost: 18,
    unlockLevel: 4,
    syllable: 'vacu',
    weight: 8,
  },
  // ── Rare (7 glyphs) ──
  {
    id: 'inferno_spiral',
    name: 'Inferno Spiral',
    species: 'fire_rune',
    rarity: 'Rare',
    power: 45,
    description: 'A spiraling fire rune that channels infernal heat into a focused beam. Mastered only by senior runecasters of the Forge.',
    arcanaCost: 40,
    unlockLevel: 7,
    syllable: 'incend',
    weight: 5,
  },
  {
    id: 'permafrost_matrix',
    name: 'Permafrost Matrix',
    species: 'ice_glyph',
    rarity: 'Rare',
    power: 42,
    description: 'A complex lattice of ice glyphs forming an eternal frost field. Used to seal the Frozen Vault within the arcade.',
    arcanaCost: 38,
    unlockLevel: 7,
    syllable: 'glaci',
    weight: 5,
  },
  {
    id: 'thunder_nexus_sigil',
    name: 'Thunder Nexus Sigil',
    species: 'thunder_sigil',
    rarity: 'Rare',
    power: 48,
    description: 'A rare thunder sigil acting as a conduit for storm energy. Said to have been etched by the Storm Architect herself.',
    arcanaCost: 45,
    unlockLevel: 8,
    syllable: 'fulmen',
    weight: 5,
  },
  {
    id: 'basalt_monolith_rune',
    name: 'Basalt Monolith Rune',
    species: 'earth_rune',
    rarity: 'Rare',
    power: 40,
    description: 'A massive earth rune carved into living basalt. When activated, raises stone pillars from the ground.',
    arcanaCost: 35,
    unlockLevel: 7,
    syllable: 'lith',
    weight: 5,
  },
  {
    id: 'eclipse_wraith_glyph',
    name: 'Eclipse Wraith Glyph',
    species: 'shadow_glyph',
    rarity: 'Rare',
    power: 44,
    description: 'A shadow glyph that summons a wraith of living darkness. The glyph consumes light within a twenty-foot radius.',
    arcanaCost: 42,
    unlockLevel: 8,
    syllable: 'tenebr',
    weight: 5,
  },
  {
    id: 'halo_crest_sigil',
    name: 'Halo Crest Sigil',
    species: 'light_sigil',
    rarity: 'Rare',
    power: 43,
    description: 'A radiant light sigil that forms a protective halo. Heals allies within its luminous aura.',
    arcanaCost: 40,
    unlockLevel: 7,
    syllable: 'coron',
    weight: 5,
  },
  {
    id: 'entropy_well_rune',
    name: 'Entropy Well Rune',
    species: 'void_rune',
    rarity: 'Rare',
    power: 50,
    description: 'A void rune that opens a well of pure entropy. Anything falling within is slowly unmade at the molecular level.',
    arcanaCost: 48,
    unlockLevel: 9,
    syllable: 'caos',
    weight: 5,
  },
  // ── Epic (7 glyphs) ──
  {
    id: 'phoenix_crown',
    name: 'Phoenix Crown',
    species: 'fire_rune',
    rarity: 'Epic',
    power: 85,
    description: 'A legendary fire rune wreathed in phoenix flame. Upon destruction, it reignites with double intensity.',
    arcanaCost: 100,
    unlockLevel: 15,
    syllable: 'ignigen',
    weight: 3,
  },
  {
    id: 'absolute_zero_glyph',
    name: 'Absolute Zero Glyph',
    species: 'ice_glyph',
    rarity: 'Epic',
    power: 80,
    description: 'An ice glyph that achieves true absolute zero at its center. Time itself slows within its freezing domain.',
    arcanaCost: 95,
    unlockLevel: 14,
    syllable: 'hypother',
    weight: 3,
  },
  {
    id: 'kraken_storm_sigil',
    name: 'Kraken Storm Sigil',
    species: 'thunder_sigil',
    rarity: 'Epic',
    power: 90,
    description: 'A thunder sigil invoking the storm kraken of the abyss. Unleashes devastating lightning torrents.',
    arcanaCost: 110,
    unlockLevel: 16,
    syllable: 'temptest',
    weight: 3,
  },
  {
    id: 'tectonic_fang_rune',
    name: 'Tectonic Fang Rune',
    species: 'earth_rune',
    rarity: 'Epic',
    power: 78,
    description: 'An earth rune that channels the biting force of tectonic plates. Can sunder fortress walls in seconds.',
    arcanaCost: 90,
    unlockLevel: 14,
    syllable: 'seism',
    weight: 3,
  },
  {
    id: 'nightfall_throne_glyph',
    name: 'Nightfall Throne Glyph',
    species: 'shadow_glyph',
    rarity: 'Epic',
    power: 82,
    description: 'A shadow glyph that manifests a throne of living darkness. Its occupant commands all shadows in the arcade.',
    arcanaCost: 98,
    unlockLevel: 15,
    syllable: 'obscurat',
    weight: 3,
  },
  {
    id: 'solar_diadem_sigil',
    name: 'Solar Diadem Sigil',
    species: 'light_sigil',
    rarity: 'Epic',
    power: 83,
    description: 'A light sigil of blinding solar intensity. Burns away all deception and illusion within its sanctified range.',
    arcanaCost: 97,
    unlockLevel: 15,
    syllable: 'solaris',
    weight: 3,
  },
  {
    id: 'oblivion_gate_rune',
    name: 'Oblivion Gate Rune',
    species: 'void_rune',
    rarity: 'Epic',
    power: 95,
    description: 'A void rune that tears open a gate to the Plane of Oblivion. Only the most powerful runecasters dare activate it.',
    arcanaCost: 120,
    unlockLevel: 17,
    syllable: 'nihil',
    weight: 3,
  },
  // ── Legendary (7 glyphs) ──
  {
    id: 'worldfire_emblem',
    name: 'Worldfire Emblem',
    species: 'fire_rune',
    rarity: 'Legendary',
    power: 180,
    description: 'The primordial fire rune said to have kindled the first star. Its activation sets the entire arcade ablaze with creation fire.',
    arcanaCost: 300,
    unlockLevel: 25,
    syllable: 'cosmignis',
    weight: 1,
  },
  {
    id: 'eternal_glacier_glyph',
    name: 'Eternal Glacier Glyph',
    species: 'ice_glyph',
    rarity: 'Legendary',
    power: 170,
    description: 'The original ice glyph from the Age of Endless Winter. It freezes not just matter, but concepts and memories.',
    arcanaCost: 280,
    unlockLevel: 24,
    syllable: 'aeterngel',
    weight: 1,
  },
  {
    id: 'leviathan_bolt_sigil',
    name: 'Leviathan Bolt Sigil',
    species: 'thunder_sigil',
    rarity: 'Legendary',
    power: 190,
    description: 'The supreme thunder sigil forged in the heart of a dying star. Its bolt can shatter the boundaries between arcades.',
    arcanaCost: 320,
    unlockLevel: 26,
    syllable: 'deustonit',
    weight: 1,
  },
  {
    id: 'world_pillar_rune',
    name: 'World Pillar Rune',
    species: 'earth_rune',
    rarity: 'Legendary',
    power: 160,
    description: 'The foundational earth rune that supports the arcade itself. Legend says removing it would collapse all dimensions.',
    arcanaCost: 260,
    unlockLevel: 23,
    syllable: 'cosmitera',
    weight: 1,
  },
  {
    id: 'omni_shadow_glyph',
    name: 'Omni Shadow Glyph',
    species: 'shadow_glyph',
    rarity: 'Legendary',
    power: 175,
    description: 'The all-consuming shadow glyph that predates light itself. It absorbs all radiance, all hope, all knowledge.',
    arcanaCost: 290,
    unlockLevel: 25,
    syllable: 'panumbra',
    weight: 1,
  },
  {
    id: 'genesis_radiance_sigil',
    name: 'Genesis Radiance Sigil',
    species: 'light_sigil',
    rarity: 'Legendary',
    power: 165,
    description: 'The first light sigil, created at the dawn of existence. Its radiance can birth new realities from nothing.',
    arcanaCost: 270,
    unlockLevel: 24,
    syllable: 'origolux',
    weight: 1,
  },
  {
    id: 'null_abyss_rune',
    name: 'Null Abyss Rune',
    species: 'void_rune',
    rarity: 'Legendary',
    power: 200,
    description: 'The ultimate void rune representing the end of all things. It erases existence so completely that no memory remains.',
    arcanaCost: 350,
    unlockLevel: 28,
    syllable: 'terminihil',
    weight: 1,
  },
];

// ─── 8 Arcades ───────────────────────────────────────────────────────────────

interface RxArcade {
  id: string;
  name: string;
  description: string;
  levelRequired: number;
  dangerRating: number;
  themeColor: string;
  ambientSound: string;
  wordBonus: number;
  glyphAffinity: RxSpecies | null;
  secretRooms: number;
}

const RX_ARCADES: RxArcade[] = [
  {
    id: 'hall_of_ancients',
    name: 'Hall of Ancients',
    description: 'The oldest section of the Rune Xyst, where the first runecasters carved their primordial glyphs into living stone. The walls whisper forgotten syllables.',
    levelRequired: 1,
    dangerRating: 1,
    themeColor: RX_STONE_GRAY,
    ambientSound: 'deep_rumble',
    wordBonus: 0,
    glyphAffinity: null,
    secretRooms: 2,
  },
  {
    id: 'sigil_corridor',
    name: 'Sigil Corridor',
    description: 'A seemingly endless passage lined with glowing sigils of every species. The corridor rearranges itself when no one is watching.',
    levelRequired: 3,
    dangerRating: 2,
    themeColor: RX_ARCANE_PURPLE,
    ambientSound: 'ethereal_hum',
    wordBonus: 5,
    glyphAffinity: 'shadow_glyph',
    secretRooms: 3,
  },
  {
    id: 'rune_forge_arcade',
    name: 'Rune Forge Arcade',
    description: 'The beating heart of runic craftsmanship. Volcanic vents power massive arcane forges where master runesmiths hammer glyphs into existence.',
    levelRequired: 5,
    dangerRating: 3,
    themeColor: RX_EMBER_ORANGE,
    ambientSound: 'hammer_and_flame',
    wordBonus: 10,
    glyphAffinity: 'fire_rune',
    secretRooms: 4,
  },
  {
    id: 'glyph_maze',
    name: 'Glyph Maze',
    description: 'A labyrinth where the walls are made of interlocking ice glyphs. Each wrong turn triggers a cascade of freezing rune traps.',
    levelRequired: 8,
    dangerRating: 4,
    themeColor: RX_SIGIL_BLUE,
    ambientSound: 'cracking_ice',
    wordBonus: 15,
    glyphAffinity: 'ice_glyph',
    secretRooms: 5,
  },
  {
    id: 'thunder_plaza',
    name: 'Thunder Plaza',
    description: 'An open arena where permanent storm clouds churn overhead. Lightning sigils embedded in the floor crackle with pent-up atmospheric energy.',
    levelRequired: 12,
    dangerRating: 5,
    themeColor: '#F1C40F',
    ambientSound: 'rolling_thunder',
    wordBonus: 20,
    glyphAffinity: 'thunder_sigil',
    secretRooms: 3,
  },
  {
    id: 'earth_basin',
    name: 'Earth Basin',
    description: 'A vast underground cavern where earth runes maintain a fragile ecosystem. Bioluminescent crystals grow from walls reinforced by ancient petroglyphs.',
    levelRequired: 16,
    dangerRating: 6,
    themeColor: '#8B6914',
    ambientSound: 'subterranean_drip',
    wordBonus: 25,
    glyphAffinity: 'earth_rune',
    secretRooms: 6,
  },
  {
    id: 'light_sanctum',
    name: 'Light Sanctum',
    description: 'A consecrated space where light sigils create an eternal sunrise. Pilgrims travel from across dimensions to bask in its healing radiance.',
    levelRequired: 20,
    dangerRating: 7,
    themeColor: '#F9E79F',
    ambientSound: 'celestial_choir',
    wordBonus: 30,
    glyphAffinity: 'light_sigil',
    secretRooms: 4,
  },
  {
    id: 'void_abyss',
    name: 'Void Abyss',
    description: 'The deepest and most dangerous arcade. Void runes here are so densely packed that reality itself becomes negotiable. Few who enter return unchanged.',
    levelRequired: 25,
    dangerRating: 10,
    themeColor: '#6C3483',
    ambientSound: 'cosmic_silence',
    wordBonus: 50,
    glyphAffinity: 'void_rune',
    secretRooms: 8,
  },
];

// ─── 30 Materials ────────────────────────────────────────────────────────────

interface RxMaterial {
  id: string;
  name: string;
  description: string;
  rarity: RxRarity;
  baseValue: number;
  stackable: boolean;
  maxStack: number;
  sourceArcade: string | null;
  craftingUse: string;
  glowColor: string;
}

const RX_MATERIALS: RxMaterial[] = [
  {
    id: 'runestone',
    name: 'Runestone',
    description: 'A porous stone infused with latent runic energy. The most fundamental crafting material in the arcade.',
    rarity: 'Common',
    baseValue: 1,
    stackable: true,
    maxStack: 999,
    sourceArcade: 'hall_of_ancients',
    craftingUse: 'Basic rune inscription and structure repair.',
    glowColor: RX_STONE_GRAY,
  },
  {
    id: 'arcane_ink',
    name: 'Arcane Ink',
    description: 'A luminescent fluid harvested from the Ink Veins beneath the Sigil Corridor. Essential for glyph drawing.',
    rarity: 'Common',
    baseValue: 2,
    stackable: true,
    maxStack: 500,
    sourceArcade: 'sigil_corridor',
    craftingUse: 'Drawing glyphs and sigils on runestone surfaces.',
    glowColor: RX_ARCANE_PURPLE,
  },
  {
    id: 'sigil_dust',
    name: 'Sigil Dust',
    description: 'Fine particles shed by active sigils. Collected with special copper scoops at dawn.',
    rarity: 'Common',
    baseValue: 1,
    stackable: true,
    maxStack: 999,
    sourceArcade: 'sigil_corridor',
    craftingUse: 'Powder-based enchantments and rune polishing.',
    glowColor: RX_SIGIL_BLUE,
  },
  {
    id: 'ember_core',
    name: 'Ember Core',
    description: 'A crystallized fragment of pure flame energy. Extracted from the Rune Forge volcanic vents.',
    rarity: 'Uncommon',
    baseValue: 8,
    stackable: true,
    maxStack: 200,
    sourceArcade: 'rune_forge_arcade',
    craftingUse: 'Fire rune enhancement and forge fuel.',
    glowColor: '#E74C3C',
  },
  {
    id: 'frost_essence',
    name: 'Frost Essence',
    description: 'Liquid cold extracted from the deepest ice glyph formations in the Glyph Maze.',
    rarity: 'Uncommon',
    baseValue: 10,
    stackable: true,
    maxStack: 200,
    sourceArcade: 'glyph_maze',
    craftingUse: 'Ice glyph fortification and cooling systems.',
    glowColor: '#3498DB',
  },
  {
    id: 'storm_shard',
    name: 'Storm Shard',
    description: 'A jagged crystal containing condensed lightning. Humming with electrical potential.',
    rarity: 'Uncommon',
    baseValue: 12,
    stackable: true,
    maxStack: 150,
    sourceArcade: 'thunder_plaza',
    craftingUse: 'Thunder sigil power sources and circuit bridging.',
    glowColor: '#F1C40F',
  },
  {
    id: 'deep_crystal',
    name: 'Deep Crystal',
    description: 'A bioluminescent crystal from the Earth Basin. Pulses with a slow, geological heartbeat.',
    rarity: 'Uncommon',
    baseValue: 9,
    stackable: true,
    maxStack: 200,
    sourceArcade: 'earth_basin',
    craftingUse: 'Earth rune amplification and structure reinforcement.',
    glowColor: '#27AE60',
  },
  {
    id: 'radiance_mote',
    name: 'Radiance Mote',
    description: 'A floating speck of pure light energy from the Light Sanctum. Warm to the touch.',
    rarity: 'Uncommon',
    baseValue: 11,
    stackable: true,
    maxStack: 200,
    sourceArcade: 'light_sanctum',
    craftingUse: 'Light sigil creation and healing glyph infusion.',
    glowColor: '#F9E79F',
  },
  {
    id: 'void_shard',
    name: 'Void Shard',
    description: 'A fragment of anti-existence from the Void Abyss. Looking at it too long causes headaches.',
    rarity: 'Uncommon',
    baseValue: 15,
    stackable: true,
    maxStack: 100,
    sourceArcade: 'void_abyss',
    craftingUse: 'Void rune crafting and dimensional anchor disruption.',
    glowColor: '#6C3483',
  },
  {
    id: 'runic_quill',
    name: 'Runic Quill',
    description: 'A feather from an arcane griffin, tipped with a permanent ink gland. Never needs refilling.',
    rarity: 'Rare',
    baseValue: 50,
    stackable: false,
    maxStack: 1,
    sourceArcade: null,
    craftingUse: 'High-tier glyph inscription and sigil signing.',
    glowColor: RX_RUNE_GOLD,
  },
  {
    id: 'enchantment_matrix',
    name: 'Enchantment Matrix',
    description: 'A pre-patterned grid that guides runic inscription. Cuts crafting time in half.',
    rarity: 'Rare',
    baseValue: 60,
    stackable: true,
    maxStack: 50,
    sourceArcade: 'rune_forge_arcade',
    craftingUse: 'Accelerated crafting of rare and epic glyphs.',
    glowColor: RX_ARCANE_PURPLE,
  },
  {
    id: 'elemental_core',
    name: 'Elemental Core',
    description: 'A sphere containing a bottled elemental spirit. The spirit within whispers secrets of its domain.',
    rarity: 'Rare',
    baseValue: 75,
    stackable: true,
    maxStack: 20,
    sourceArcade: null,
    craftingUse: 'Multi-species glyph fusion and ability unlocking.',
    glowColor: RX_EMBER_ORANGE,
  },
  {
    id: 'temporal_sand',
    name: 'Temporal Sand',
    description: 'Sand that flows backward through an hourglass. Disrupts local time flow slightly.',
    rarity: 'Rare',
    baseValue: 80,
    stackable: true,
    maxStack: 30,
    sourceArcade: 'void_abyss',
    craftingUse: 'Time-based rune effects and event prolongation.',
    glowColor: RX_AZURE_SHIMMER,
  },
  {
    id: 'glyph_fragment',
    name: 'Glyph Fragment',
    description: 'A shattered piece of an ancient glyph. Still retains a faint echo of its original power.',
    rarity: 'Rare',
    baseValue: 45,
    stackable: true,
    maxStack: 99,
    sourceArcade: 'hall_of_ancients',
    craftingUse: 'Glyph restoration and archaeological research.',
    glowColor: RX_STONE_GRAY,
  },
  {
    id: 'arcane_resonator',
    name: 'Arcane Resonator',
    description: 'A tuning fork that harmonizes with ambient magic. Singing it amplifies nearby runes.',
    rarity: 'Rare',
    baseValue: 55,
    stackable: false,
    maxStack: 1,
    sourceArcade: 'sigil_corridor',
    craftingUse: 'Rune power amplification and harmony tuning.',
    glowColor: RX_SIGIL_BLUE,
  },
  {
    id: 'shadow_essence',
    name: 'Shadow Essence',
    description: 'Condensed darkness harvested during an eclipse. Cold, heavy, and whispering.',
    rarity: 'Rare',
    baseValue: 70,
    stackable: true,
    maxStack: 30,
    sourceArcade: 'sigil_corridor',
    craftingUse: 'Shadow glyph enhancement and stealth sigil crafting.',
    glowColor: '#2C3E50',
  },
  {
    id: 'ancient_tablet',
    name: 'Ancient Tablet',
    description: 'A stone tablet inscribed with proto-runic script. Scholars debate its meaning endlessly.',
    rarity: 'Epic',
    baseValue: 200,
    stackable: false,
    maxStack: 1,
    sourceArcade: 'hall_of_ancients',
    craftingUse: 'Unlocking legendary glyph recipes and forgotten abilities.',
    glowColor: RX_RUNE_GOLD,
  },
  {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    description: 'A feather from the eternal phoenix that nests in the Rune Forge. It glows with inner fire.',
    rarity: 'Epic',
    baseValue: 250,
    stackable: true,
    maxStack: 5,
    sourceArcade: 'rune_forge_arcade',
    craftingUse: 'Fire rune ascension and revival glyph crafting.',
    glowColor: '#E74C3C',
  },
  {
    id: 'glacial_heart',
    name: 'Glacial Heart',
    description: 'The frozen core of an ancient ice elemental. Beats once every hundred years.',
    rarity: 'Epic',
    baseValue: 230,
    stackable: true,
    maxStack: 5,
    sourceArcade: 'glyph_maze',
    craftingUse: 'Supreme ice glyph creation and time-freeze enchantments.',
    glowColor: '#AED6F1',
  },
  {
    id: 'thunder_crown',
    name: 'Thunder Crown',
    description: 'A crown forged from solidified lightning. Crackles with barely contained storm energy.',
    rarity: 'Epic',
    baseValue: 280,
    stackable: false,
    maxStack: 1,
    sourceArcade: 'thunder_plaza',
    craftingUse: 'Thunder sigil mastery and storm summoning abilities.',
    glowColor: '#F7DC6F',
  },
  {
    id: 'world_tree_sap',
    name: 'World Tree Sap',
    description: 'Golden sap from the roots of the World Tree that grow through the Earth Basin. Contains primordial life force.',
    rarity: 'Epic',
    baseValue: 220,
    stackable: true,
    maxStack: 10,
    sourceArcade: 'earth_basin',
    craftingUse: 'Earth rune evolution and structure regeneration.',
    glowColor: '#F9E79F',
  },
  {
    id: 'lightweave_fabric',
    name: 'Lightweave Fabric',
    description: 'Cloth woven from solidified light. Impossibly light yet stronger than steel.',
    rarity: 'Epic',
    baseValue: 240,
    stackable: true,
    maxStack: 8,
    sourceArcade: 'light_sanctum',
    craftingUse: 'Light sigil armor and radiant barrier creation.',
    glowColor: '#FDFEFE',
  },
  {
    id: 'void_pearl',
    name: 'Void Pearl',
    description: 'A pearl formed in the absence of all things. Its surface reflects nothing.',
    rarity: 'Epic',
    baseValue: 300,
    stackable: true,
    maxStack: 3,
    sourceArcade: 'void_abyss',
    craftingUse: 'Void rune ultimate enhancement and oblivion gate keys.',
    glowColor: '#1A1A2E',
  },
  {
    id: 'dragon_rune_scale',
    name: 'Dragon Rune Scale',
    description: 'A scale from the Rune Dragon that guards the arcade nexus. Inscribed with microscopic glyphs.',
    rarity: 'Legendary',
    baseValue: 1000,
    stackable: false,
    maxStack: 1,
    sourceArcade: null,
    craftingUse: 'Legendary structure upgrades and ultimate ability crafting.',
    glowColor: RX_RUNE_GOLD,
  },
  {
    id: 'chronos_stone',
    name: 'Chronos Stone',
    description: 'A stone that exists in all moments simultaneously. Holding it grants visions of past and future.',
    rarity: 'Legendary',
    baseValue: 1200,
    stackable: false,
    maxStack: 1,
    sourceArcade: 'void_abyss',
    craftingUse: 'Temporal rune effects and event chain manipulation.',
    glowColor: RX_AZURE_SHIMMER,
  },
  {
    id: 'nullifier_crystal',
    name: 'Nullifier Crystal',
    description: 'A crystal that can negate any magic within its radius. Feared by all runecasters.',
    rarity: 'Legendary',
    baseValue: 1100,
    stackable: false,
    maxStack: 1,
    sourceArcade: 'void_abyss',
    craftingUse: 'Anti-magic field generation and rune neutralization.',
    glowColor: '#FFFFFF',
  },
  {
    id: 'starfall_ingot',
    name: 'Starfall Ingot',
    description: 'Metal forged from a meteorite that struck the Thunder Plaza. Radiates cosmic energy.',
    rarity: 'Legendary',
    baseValue: 1500,
    stackable: false,
    maxStack: 1,
    sourceArcade: 'thunder_plaza',
    craftingUse: 'Cosmic-tier glyph inscription and artifact forging.',
    glowColor: RX_RUNE_GOLD,
  },
  {
    id: 'soul_quartz',
    name: 'Soul Quartz',
    description: 'A quartz crystal containing a trapped echo of a runecaster soul. It remembers everything.',
    rarity: 'Legendary',
    baseValue: 1300,
    stackable: false,
    maxStack: 1,
    sourceArcade: 'hall_of_ancients',
    craftingUse: 'Memory glyph crafting and ancestral ability channeling.',
    glowColor: RX_ETHEREAL_VIOLET,
  },
  {
    id: 'origin_ember',
    name: 'Origin Ember',
    description: 'The last remaining spark from the first fire ever kindled by a runecaster. Impossibly hot.',
    rarity: 'Legendary',
    baseValue: 2000,
    stackable: false,
    maxStack: 1,
    sourceArcade: 'rune_forge_arcade',
    craftingUse: 'Origin-tier fire rune creation and arcade-wide ignition events.',
    glowColor: '#FF4500',
  },
  {
    id: 'arcane_binder',
    name: 'Arcane Binder',
    description: 'A versatile compound that bonds magical and mundane materials. Every runesmith keeps a pot handy.',
    rarity: 'Common',
    baseValue: 3,
    stackable: true,
    maxStack: 500,
    sourceArcade: 'rune_forge_arcade',
    craftingUse: 'Binding materials together in crafting recipes.',
    glowColor: '#D5F5E3',
  },
];

// ─── 25 Structures ───────────────────────────────────────────────────────────

interface RxStructure {
  id: string;
  name: string;
  description: string;
  category: 'production' | 'defense' | 'research' | 'storage' | 'special';
  baseCost: Record<string, number>;
  upgradeCostMultiplier: number;
  maxLevel: 10;
  effectPerLevel: string;
  placementArcade: string | null;
  iconGlyph: string;
}

const RX_STRUCTURES: RxStructure[] = [
  {
    id: 'runic_workbench',
    name: 'Runic Workbench',
    description: 'A sturdy stone workbench inscribed with measurement glyphs. Essential for all basic runic crafting.',
    category: 'production',
    baseCost: { runestone: 10, arcane_binder: 3 },
    upgradeCostMultiplier: 1.5,
    maxLevel: 10,
    effectPerLevel: 'Increases glyph inscription speed by 5% per level.',
    placementArcade: 'hall_of_ancients',
    iconGlyph: '⚒',
  },
  {
    id: 'sigil_library',
    name: 'Sigil Library',
    description: 'A vast repository of sigil knowledge. Floating glyphs orbit the central reading dais.',
    category: 'research',
    baseCost: { runestone: 15, arcane_ink: 10, sigil_dust: 5 },
    upgradeCostMultiplier: 1.6,
    maxLevel: 10,
    effectPerLevel: 'Unlocks 1 additional glyph recipe per level.',
    placementArcade: 'sigil_corridor',
    iconGlyph: '📚',
  },
  {
    id: 'ember_furnace',
    name: 'Ember Furnace',
    description: 'A forge furnace fueled by ember cores. Burns hot enough to liquefy runestone.',
    category: 'production',
    baseCost: { runestone: 20, ember_core: 5 },
    upgradeCostMultiplier: 1.7,
    maxLevel: 10,
    effectPerLevel: 'Increases fire rune power output by 8% per level.',
    placementArcade: 'rune_forge_arcade',
    iconGlyph: '🔥',
  },
  {
    id: 'frost_vault',
    name: 'Frost Vault',
    description: 'A cryogenic storage chamber maintained by ice glyphs. Preserves materials indefinitely.',
    category: 'storage',
    baseCost: { runestone: 12, frost_essence: 8 },
    upgradeCostMultiplier: 1.4,
    maxLevel: 10,
    effectPerLevel: 'Increases material storage capacity by 50 per level.',
    placementArcade: 'glyph_maze',
    iconGlyph: '❄',
  },
  {
    id: 'storm_cage',
    name: 'Storm Cage',
    description: 'A containment unit built from storm shards. Captures and stores lightning for later use.',
    category: 'production',
    baseCost: { runestone: 25, storm_shard: 10 },
    upgradeCostMultiplier: 1.8,
    maxLevel: 10,
    effectPerLevel: 'Generates 1 free storm shard per hour per level.',
    placementArcade: 'thunder_plaza',
    iconGlyph: '⚡',
  },
  {
    id: 'earth_bastion',
    name: 'Earth Bastion',
    description: 'A defensive tower of living stone. Earth runes embedded in its walls resist all damage.',
    category: 'defense',
    baseCost: { runestone: 30, deep_crystal: 10 },
    upgradeCostMultiplier: 1.7,
    maxLevel: 10,
    effectPerLevel: 'Reduces arcade event damage by 6% per level.',
    placementArcade: 'earth_basin',
    iconGlyph: '🏰',
  },
  {
    id: 'radiance_beacon',
    name: 'Radiance Beacon',
    description: 'A towering light sigil that illuminates hidden passages. Also serves as a communication relay.',
    category: 'special',
    baseCost: { runestone: 20, radiance_mote: 12 },
    upgradeCostMultiplier: 1.6,
    maxLevel: 10,
    effectPerLevel: 'Increases word bonus by 3% per level across all arcades.',
    placementArcade: 'light_sanctum',
    iconGlyph: '🏛',
  },
  {
    id: 'void_anchor',
    name: 'Void Anchor',
    description: 'A heavy device that pins reality in place. Prevents void incursions in nearby arcades.',
    category: 'defense',
    baseCost: { runestone: 40, void_shard: 15 },
    upgradeCostMultiplier: 2.0,
    maxLevel: 10,
    effectPerLevel: 'Reduces void event frequency by 5% per level.',
    placementArcade: 'void_abyss',
    iconGlyph: '⚓',
  },
  {
    id: 'glyph_press',
    name: 'Glyph Press',
    description: 'A mechanical press that stamps glyph patterns onto runestone with perfect precision.',
    category: 'production',
    baseCost: { runestone: 15, arcane_binder: 5, enchantment_matrix: 1 },
    upgradeCostMultiplier: 1.5,
    maxLevel: 10,
    effectPerLevel: 'Doubles glyph production efficiency every 2 levels.',
    placementArcade: 'hall_of_ancients',
    iconGlyph: '🖨',
  },
  {
    id: 'shadow_sanctum',
    name: 'Shadow Sanctum',
    description: 'A dimly lit chamber where shadow glyphs are studied without interference from ambient light.',
    category: 'research',
    baseCost: { runestone: 18, shadow_essence: 8 },
    upgradeCostMultiplier: 1.6,
    maxLevel: 10,
    effectPerLevel: 'Increases shadow glyph discovery chance by 4% per level.',
    placementArcade: 'sigil_corridor',
    iconGlyph: '🌑',
  },
  {
    id: 'elemental_forge',
    name: 'Elemental Forge',
    description: 'A forge capable of fusing multiple elemental essences into a single rune matrix.',
    category: 'production',
    baseCost: { runestone: 35, elemental_core: 3 },
    upgradeCostMultiplier: 1.9,
    maxLevel: 10,
    effectPerLevel: 'Reduces multi-element crafting cost by 5% per level.',
    placementArcade: 'rune_forge_arcade',
    iconGlyph: '🌋',
  },
  {
    id: 'archive_vault',
    name: 'Archive Vault',
    description: 'A heavily guarded vault storing the most valuable glyphs and artifacts of the arcade.',
    category: 'storage',
    baseCost: { runestone: 50, ancient_tablet: 1 },
    upgradeCostMultiplier: 2.0,
    maxLevel: 10,
    effectPerLevel: 'Stores 5 additional legendary items per level.',
    placementArcade: 'hall_of_ancients',
    iconGlyph: '🗄',
  },
  {
    id: 'ward_obelisk',
    name: 'Ward Obelisk',
    description: 'A tall stone obelisk inscribed with protective wards. Projects a defensive aura across the arcade.',
    category: 'defense',
    baseCost: { runestone: 28, elemental_core: 2 },
    upgradeCostMultiplier: 1.7,
    maxLevel: 10,
    effectPerLevel: 'Extends ward range by 10% per level.',
    placementArcade: 'earth_basin',
    iconGlyph: '📍',
  },
  {
    id: 'resonance_chamber',
    name: 'Resonance Chamber',
    description: 'A spherical room where sound glyphs amplify into harmonic frequencies that boost all nearby runes.',
    category: 'special',
    baseCost: { runestone: 22, arcane_resonator: 1 },
    upgradeCostMultiplier: 1.8,
    maxLevel: 10,
    effectPerLevel: 'Boosts all rune power by 3% per level within the arcade.',
    placementArcade: 'sigil_corridor',
    iconGlyph: '🔊',
  },
  {
    id: 'temporal_lab',
    name: 'Temporal Lab',
    description: 'A laboratory where temporal sand is processed into time-manipulating rune matrices.',
    category: 'research',
    baseCost: { runestone: 45, temporal_sand: 5 },
    upgradeCostMultiplier: 2.1,
    maxLevel: 10,
    effectPerLevel: 'Extends event duration by 1 turn per level.',
    placementArcade: 'void_abyss',
    iconGlyph: '⏳',
  },
  {
    id: 'phoenix_nest',
    name: 'Phoenix Nest',
    description: 'A consecrated nesting site for the arcade phoenix. Its presence grants passive fire protection.',
    category: 'special',
    baseCost: { runestone: 60, phoenix_feather: 2 },
    upgradeCostMultiplier: 2.2,
    maxLevel: 10,
    effectPerLevel: 'Grants 1 free revival per arcade run per level.',
    placementArcade: 'rune_forge_arcade',
    iconGlyph: '🪶',
  },
  {
    id: 'crystal_garden',
    name: 'Crystal Garden',
    description: 'A cultivated garden of arcane crystals that naturally produce crafting materials over time.',
    category: 'production',
    baseCost: { runestone: 20, deep_crystal: 8, world_tree_sap: 2 },
    upgradeCostMultiplier: 1.6,
    maxLevel: 10,
    effectPerLevel: 'Produces 1 random material every 30 minutes per level.',
    placementArcade: 'earth_basin',
    iconGlyph: '💎',
  },
  {
    id: 'light_barracks',
    name: 'Light Barracks',
    description: 'A training facility where light sigil adepts hone their abilities under simulated combat conditions.',
    category: 'defense',
    baseCost: { runestone: 32, radiance_mote: 15, lightweave_fabric: 3 },
    upgradeCostMultiplier: 1.8,
    maxLevel: 10,
    effectPerLevel: 'Reduces enemy word difficulty by 5% per level.',
    placementArcade: 'light_sanctum',
    iconGlyph: '⚔',
  },
  {
    id: 'abyssal_shrine',
    name: 'Abyssal Shrine',
    description: 'A shrine dedicated to the study of void runes. Controversial, but yields unparalleled dark knowledge.',
    category: 'research',
    baseCost: { runestone: 55, void_shard: 20, void_pearl: 1 },
    upgradeCostMultiplier: 2.3,
    maxLevel: 10,
    effectPerLevel: 'Unlocks 1 void-specific ability per 2 levels.',
    placementArcade: 'void_abyss',
    iconGlyph: '🌀',
  },
  {
    id: 'merchant_stall',
    name: 'Merchant Stall',
    description: 'A trading post where materials and glyphs can be exchanged with visiting arcade merchants.',
    category: 'special',
    baseCost: { runestone: 12, arcane_ink: 5 },
    upgradeCostMultiplier: 1.4,
    maxLevel: 10,
    effectPerLevel: 'Improves trade ratios by 3% per level.',
    placementArcade: 'hall_of_ancients',
    iconGlyph: '🏪',
  },
  {
    id: 'observation_tower',
    name: 'Observation Tower',
    description: 'A tall tower equipped with far-seeing glyphs. Allows monitoring of all arcade sections simultaneously.',
    category: 'research',
    baseCost: { runestone: 35, arcane_ink: 20, glyph_fragment: 5 },
    upgradeCostMultiplier: 1.7,
    maxLevel: 10,
    effectPerLevel: 'Increases event warning time by 1 turn per level.',
    placementArcade: 'sigil_corridor',
    iconGlyph: '🔭',
  },
  {
    id: 'artifact_pedestal',
    name: 'Artifact Pedestal',
    description: 'An enchanted pedestal that amplifies the power of any artifact placed upon it.',
    category: 'special',
    baseCost: { runestone: 40, starfall_ingot: 1, dragon_rune_scale: 1 },
    upgradeCostMultiplier: 2.5,
    maxLevel: 10,
    effectPerLevel: 'Increases equipped artifact power by 10% per level.',
    placementArcade: null,
    iconGlyph: '⚱',
  },
  {
    id: 'runic_golem_factory',
    name: 'Runic Golem Factory',
    description: 'A factory that assembles runic golems from inscribed stone. Golems assist in arcade maintenance.',
    category: 'production',
    baseCost: { runestone: 50, elemental_core: 5, arcane_binder: 20 },
    upgradeCostMultiplier: 2.0,
    maxLevel: 10,
    effectPerLevel: 'Produces 1 golem worker per level (max 10).',
    placementArcade: 'rune_forge_arcade',
    iconGlyph: '🤖',
  },
  {
    id: 'origin_cenotaph',
    name: 'Origin Cenotaph',
    description: 'A memorial to the first runecaster. Meditating here grants visions of the original rune language.',
    category: 'special',
    baseCost: { runestone: 100, soul_quartz: 1, origin_ember: 1, chronos_stone: 1 },
    upgradeCostMultiplier: 3.0,
    maxLevel: 10,
    effectPerLevel: 'Grants 1 permanent skill point per level.',
    placementArcade: 'hall_of_ancients',
    iconGlyph: '⛩',
  },
];

// ─── 22 Abilities ────────────────────────────────────────────────────────────

interface RxAbility {
  id: string;
  name: string;
  description: string;
  species: RxSpecies | 'universal';
  tier: 1 | 2 | 3;
  cooldown: number;
  manaCost: number;
  unlockLevel: number;
  effectType: 'offensive' | 'defensive' | 'utility' | 'passive';
  effectValue: number;
}

const RX_ABILITIES: RxAbility[] = [
  {
    id: 'ignition_burst',
    name: 'Ignition Burst',
    description: 'Releases a concentrated burst of flame that incinerates a row of word tiles.',
    species: 'fire_rune',
    tier: 1,
    cooldown: 3,
    manaCost: 10,
    unlockLevel: 2,
    effectType: 'offensive',
    effectValue: 15,
  },
  {
    id: 'frost_nova',
    name: 'Frost Nova',
    description: 'Creates a wave of freezing energy that slows all word generation for 2 turns.',
    species: 'ice_glyph',
    tier: 1,
    cooldown: 4,
    manaCost: 12,
    unlockLevel: 2,
    effectType: 'defensive',
    effectValue: 10,
  },
  {
    id: 'static_discharge',
    name: 'Static Discharge',
    description: 'Charges the next word with electrical energy, doubling its point value.',
    species: 'thunder_sigil',
    tier: 1,
    cooldown: 3,
    manaCost: 8,
    unlockLevel: 2,
    effectType: 'utility',
    effectValue: 20,
  },
  {
    id: 'stone_shield',
    name: 'Stone Shield',
    description: 'Raises a protective barrier of stone that absorbs the next penalty.',
    species: 'earth_rune',
    tier: 1,
    cooldown: 5,
    manaCost: 15,
    unlockLevel: 2,
    effectType: 'defensive',
    effectValue: 25,
  },
  {
    id: 'shadow_step',
    name: 'Shadow Step',
    description: 'Teleports through shadows to skip one hazardous word tile.',
    species: 'shadow_glyph',
    tier: 1,
    cooldown: 3,
    manaCost: 10,
    unlockLevel: 3,
    effectType: 'utility',
    effectValue: 1,
  },
  {
    id: 'divine_light',
    name: 'Divine Light',
    description: 'Illuminates all hidden words on the board for one turn.',
    species: 'light_sigil',
    tier: 1,
    cooldown: 5,
    manaCost: 14,
    unlockLevel: 3,
    effectType: 'utility',
    effectValue: 3,
  },
  {
    id: 'void_drain',
    name: 'Void Drain',
    description: 'Siphons arcana from a random glyph, restoring mana equal to the drain value.',
    species: 'void_rune',
    tier: 1,
    cooldown: 4,
    manaCost: 5,
    unlockLevel: 4,
    effectType: 'utility',
    effectValue: 18,
  },
  {
    id: 'inferno_wave',
    name: 'Inferno Wave',
    description: 'A wall of fire sweeps across the board, converting gray tiles into bonus tiles.',
    species: 'fire_rune',
    tier: 2,
    cooldown: 6,
    manaCost: 25,
    unlockLevel: 7,
    effectType: 'offensive',
    effectValue: 35,
  },
  {
    id: 'absolute_freeze',
    name: 'Absolute Freeze',
    description: 'Freezes all penalties in place for 3 turns. No new hazards can spawn.',
    species: 'ice_glyph',
    tier: 2,
    cooldown: 7,
    manaCost: 28,
    unlockLevel: 7,
    effectType: 'defensive',
    effectValue: 40,
  },
  {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    description: 'Lightning arcs between completed words, granting bonus points for each link.',
    species: 'thunder_sigil',
    tier: 2,
    cooldown: 5,
    manaCost: 22,
    unlockLevel: 8,
    effectType: 'offensive',
    effectValue: 30,
  },
  {
    id: 'earthquake_slam',
    name: 'Earthquake Slam',
    description: 'Shakes the board, rearranging all tiles into a more favorable configuration.',
    species: 'earth_rune',
    tier: 2,
    cooldown: 8,
    manaCost: 30,
    unlockLevel: 8,
    effectType: 'utility',
    effectValue: 1,
  },
  {
    id: 'shadow_domination',
    name: 'Shadow Domination',
    description: 'Takes control of an enemy word tile, converting it to a friendly tile.',
    species: 'shadow_glyph',
    tier: 2,
    cooldown: 6,
    manaCost: 26,
    unlockLevel: 9,
    effectType: 'offensive',
    effectValue: 1,
  },
  {
    id: 'radiant_purge',
    name: 'Radiant Purge',
    description: 'A beam of pure light that purges all debuffs and negative effects from the board.',
    species: 'light_sigil',
    tier: 2,
    cooldown: 7,
    manaCost: 24,
    unlockLevel: 9,
    effectType: 'defensive',
    effectValue: 50,
  },
  {
    id: 'entropy_explosion',
    name: 'Entropy Explosion',
    description: 'Destroys a 3x3 area of tiles, replacing them with random high-value tiles.',
    species: 'void_rune',
    tier: 2,
    cooldown: 8,
    manaCost: 35,
    unlockLevel: 10,
    effectType: 'offensive',
    effectValue: 45,
  },
  {
    id: 'runic_mastery',
    name: 'Runic Mastery',
    description: 'Passively increases all glyph power by 15%. The fundamental skill of a true runecaster.',
    species: 'universal',
    tier: 1,
    cooldown: 0,
    manaCost: 0,
    unlockLevel: 5,
    effectType: 'passive',
    effectValue: 15,
  },
  {
    id: 'arcane_recovery',
    name: 'Arcane Recovery',
    description: 'Passively regenerates 2 mana per turn. Essential for sustained arcade exploration.',
    species: 'universal',
    tier: 1,
    cooldown: 0,
    manaCost: 0,
    unlockLevel: 3,
    effectType: 'passive',
    effectValue: 2,
  },
  {
    id: 'glyph_synergy',
    name: 'Glyph Synergy',
    description: 'Passively boosts word score by 5% for each unique species glyph equipped.',
    species: 'universal',
    tier: 2,
    cooldown: 0,
    manaCost: 0,
    unlockLevel: 10,
    effectType: 'passive',
    effectValue: 5,
  },
  {
    id: 'worldfire_cataclysm',
    name: 'Worldfire Cataclysm',
    description: 'The ultimate fire ability. Engulfs the entire board in creation fire, multiplying all scores by 3 for one turn.',
    species: 'fire_rune',
    tier: 3,
    cooldown: 12,
    manaCost: 60,
    unlockLevel: 18,
    effectType: 'offensive',
    effectValue: 100,
  },
  {
    id: 'glacial_epoch',
    name: 'Glacial Epoch',
    description: 'The ultimate ice ability. Freezes the entire game state for 5 turns, allowing unlimited moves.',
    species: 'ice_glyph',
    tier: 3,
    cooldown: 14,
    manaCost: 65,
    unlockLevel: 18,
    effectType: 'defensive',
    effectValue: 120,
  },
  {
    id: 'thunder_apocalypse',
    name: 'Thunder Apocalypse',
    description: 'The ultimate thunder ability. Summons a devastating storm that auto-completes all available words.',
    species: 'thunder_sigil',
    tier: 3,
    cooldown: 12,
    manaCost: 55,
    unlockLevel: 18,
    effectType: 'offensive',
    effectValue: 110,
  },
  {
    id: 'worldbreaker',
    name: 'Worldbreaker',
    description: 'The ultimate earth ability. Reshapes the entire board to the optimal configuration.',
    species: 'earth_rune',
    tier: 3,
    cooldown: 15,
    manaCost: 70,
    unlockLevel: 20,
    effectType: 'utility',
    effectValue: 1,
  },
  {
    id: 'omniscient_sigil',
    name: 'Omniscient Sigil',
    description: 'The ultimate universal ability. Reveals the optimal move path for the next 3 turns.',
    species: 'universal',
    tier: 3,
    cooldown: 10,
    manaCost: 50,
    unlockLevel: 22,
    effectType: 'utility',
    effectValue: 3,
  },
];

// ─── 18 Achievements ─────────────────────────────────────────────────────────

interface RxAchievement {
  id: string;
  name: string;
  description: string;
  category: 'exploration' | 'crafting' | 'combat' | 'collection' | 'mastery' | 'research';
  requirement: string;
  reward: string;
  rewardValue: number;
  hidden: boolean;
  iconGlyph: string;
}

const RX_ACHIEVEMENTS: RxAchievement[] = [
  {
    id: 'first_inscription',
    name: 'First Inscription',
    description: 'Inscribe your very first rune glyph onto a runestone.',
    category: 'crafting',
    requirement: 'Inscribe 1 glyph.',
    reward: 'Arcana +50',
    rewardValue: 50,
    hidden: false,
    iconGlyph: '✒',
  },
  {
    id: 'arcade_explorer',
    name: 'Arcade Explorer',
    description: 'Visit every arcade section in the Rune Xyst at least once.',
    category: 'exploration',
    requirement: 'Visit all 8 arcades.',
    reward: 'Title: Arcade Wanderer',
    rewardValue: 100,
    hidden: false,
    iconGlyph: '🗺',
  },
  {
    id: 'glyph_hoarder',
    name: 'Glyph Hoarder',
    description: 'Collect glyphs of every species type.',
    category: 'collection',
    requirement: 'Collect at least 1 glyph from each of 7 species.',
    reward: 'Arcana +200',
    rewardValue: 200,
    hidden: false,
    iconGlyph: '📦',
  },
  {
    id: 'forgemaster',
    name: 'Forgemaster',
    description: 'Upgrade any structure to its maximum level of 10.',
    category: 'crafting',
    requirement: 'Max out 1 structure.',
    reward: 'Runic Power +500',
    rewardValue: 500,
    hidden: false,
    iconGlyph: '🔨',
  },
  {
    id: 'legendary_runecaster',
    name: 'Legendary Runecaster',
    description: 'Craft or obtain a legendary-tier rune glyph.',
    category: 'collection',
    requirement: 'Own 1 legendary glyph.',
    reward: 'Title: Legendary Runecaster',
    rewardValue: 300,
    hidden: false,
    iconGlyph: '🌟',
  },
  {
    id: 'void_survivor',
    name: 'Void Survivor',
    description: 'Survive 10 consecutive turns in the Void Abyss without dying.',
    category: 'combat',
    requirement: 'Survive 10 turns in Void Abyss.',
    reward: 'Arcane Depth +50',
    rewardValue: 50,
    hidden: false,
    iconGlyph: '🕳',
  },
  {
    id: 'word_architect',
    name: 'Word Architect',
    description: 'Complete 100 words using rune-enhanced tiles in a single session.',
    category: 'mastery',
    requirement: 'Complete 100 rune words in one session.',
    reward: 'Runic Power +300',
    rewardValue: 300,
    hidden: false,
    iconGlyph: '🏗',
  },
  {
    id: 'sigil_scholar',
    name: 'Sigil Scholar',
    description: 'Research and unlock 10 different glyph recipes through the Sigil Library.',
    category: 'research',
    requirement: 'Unlock 10 glyph recipes.',
    reward: 'Arcana +150',
    rewardValue: 150,
    hidden: false,
    iconGlyph: '📖',
  },
  {
    id: 'thunder_collector',
    name: 'Thunder Collector',
    description: 'Accumulate 500 storm shards in your inventory at one time.',
    category: 'collection',
    requirement: 'Hold 500 storm shards simultaneously.',
    reward: 'Runic Power +200',
    rewardValue: 200,
    hidden: false,
    iconGlyph: '⚡',
  },
  {
    id: 'arcane_engineer',
    name: 'Arcane Engineer',
    description: 'Build at least 15 different structures across all arcades.',
    category: 'crafting',
    requirement: 'Build 15 unique structures.',
    reward: 'Title: Arcane Engineer',
    rewardValue: 250,
    hidden: false,
    iconGlyph: '⚙',
  },
  {
    id: 'elemental_harmony',
    name: 'Elemental Harmony',
    description: 'Have one active glyph of each species equipped simultaneously.',
    category: 'mastery',
    requirement: 'Equip 7 species glyphs at once.',
    reward: 'All glyph power +25%',
    rewardValue: 400,
    hidden: false,
    iconGlyph: '☯',
  },
  {
    id: 'deep_delver',
    name: 'Deep Delver',
    description: 'Reach arcade depth level 50, the deepest point ever recorded.',
    category: 'exploration',
    requirement: 'Reach depth level 50.',
    reward: 'Arcane Depth +100',
    rewardValue: 100,
    hidden: false,
    iconGlyph: '⬇',
  },
  {
    id: 'material_baron',
    name: 'Material Baron',
    description: 'Accumulate a total material value of 10,000 across all resources.',
    category: 'collection',
    requirement: 'Total material value reaches 10,000.',
    reward: 'Title: Material Baron',
    rewardValue: 350,
    hidden: false,
    iconGlyph: '💰',
  },
  {
    id: 'runic_savant',
    name: 'Runic Savant',
    description: 'Use every single ability at least once during your runecaster career.',
    category: 'mastery',
    requirement: 'Use all 22 abilities.',
    reward: 'Arcana +500',
    rewardValue: 500,
    hidden: false,
    iconGlyph: '🧠',
  },
  {
    id: 'arcade_conqueror',
    name: 'Arcade Conqueror',
    description: 'Complete every arcade challenge and claim all arcade mastery tokens.',
    category: 'exploration',
    requirement: 'Complete all arcade challenges.',
    reward: 'Title: Arcade Conqueror',
    rewardValue: 600,
    hidden: false,
    iconGlyph: '👑',
  },
  {
    id: 'secret_of_the_ancients',
    name: 'Secret of the Ancients',
    description: 'Discover the hidden message inscribed in the Hall of Ancients by translating all proto-runic script.',
    category: 'exploration',
    requirement: 'Translate all proto-runic tablets.',
    reward: 'Unlock Origin Cenotaph blueprint.',
    rewardValue: 1000,
    hidden: true,
    iconGlyph: '🗝',
  },
  {
    id: 'apex_runic_power',
    name: 'Apex Runic Power',
    description: 'Accumulate 10,000 Runic Power through gameplay.',
    category: 'mastery',
    requirement: 'Reach 10,000 Runic Power.',
    reward: 'Title: Apex Runecaster',
    rewardValue: 500,
    hidden: false,
    iconGlyph: '📈',
  },
  {
    id: 'void_transcendence',
    name: 'Void Transcendence',
    description: 'Achieve maximum Arcane Depth and glimpse the truth beyond the void.',
    category: 'mastery',
    requirement: 'Max out Arcane Depth to 999.',
    reward: 'Title: Void Transcendent',
    rewardValue: 2000,
    hidden: true,
    iconGlyph: '🔮',
  },
];

// ─── 8 Titles ────────────────────────────────────────────────────────────────

interface RxTitle {
  id: string;
  name: string;
  description: string;
  requirement: string;
  bonuses: Record<string, number>;
  colorTheme: string;
  rarity: RxRarity;
}

const RX_TITLES: RxTitle[] = [
  {
    id: 'rune_apprentice',
    name: 'Rune Apprentice',
    description: 'The starting title for all who enter the Rune Xyst. Every master was once a beginner.',
    requirement: 'Default title upon entering the arcade.',
    bonuses: { arcana: 10, runicPower: 10 },
    colorTheme: RX_STONE_GRAY,
    rarity: 'Common',
  },
  {
    id: 'glyph_scribe',
    name: 'Glyph Scribe',
    description: 'A skilled inscriber of glyphs, capable of producing reliable work on commission.',
    requirement: 'Inscribe 25 glyphs total.',
    bonuses: { arcana: 25, runicPower: 25, arcaneDepth: 5 },
    colorTheme: RX_SIGIL_BLUE,
    rarity: 'Uncommon',
  },
  {
    id: 'sigil_adept',
    name: 'Sigil Adept',
    description: 'An adept of sigil work who can draw complex patterns from memory.',
    requirement: 'Unlock 15 glyph recipes and reach level 10.',
    bonuses: { arcana: 50, runicPower: 50, arcaneDepth: 15 },
    colorTheme: RX_ARCANE_PURPLE,
    rarity: 'Rare',
  },
  {
    id: 'arcane_artificer',
    name: 'Arcane Artificer',
    description: 'A master artificer who creates powerful enchanted items and rune machines.',
    requirement: 'Build 10 structures and craft 5 rare glyphs.',
    bonuses: { arcana: 80, runicPower: 80, arcaneDepth: 25 },
    colorTheme: RX_EMBER_ORANGE,
    rarity: 'Rare',
  },
  {
    id: 'rune_knight',
    name: 'Rune Knight',
    description: 'A warrior who wields runic power in combat. Glyphs serve as both sword and shield.',
    requirement: 'Defeat 50 arcade challenges and equip 5 epic glyphs.',
    bonuses: { arcana: 120, runicPower: 120, arcaneDepth: 40 },
    colorTheme: RX_CRIMSON_RUNE,
    rarity: 'Epic',
  },
  {
    id: 'arcane_scholar',
    name: 'Arcane Scholar',
    description: 'A scholar who has unlocked the deeper mysteries of runic language and arcane theory.',
    requirement: 'Complete all Sigil Library research and reach level 20.',
    bonuses: { arcana: 200, runicPower: 150, arcaneDepth: 60 },
    colorTheme: RX_ETHEREAL_VIOLET,
    rarity: 'Epic',
  },
  {
    id: 'grand_forger',
    name: 'Grand Forger',
    description: 'The supreme runesmith of the arcade. Their forge produces wonders that reshape reality.',
    requirement: 'Max out 5 structures and own 3 legendary glyphs.',
    bonuses: { arcana: 350, runicPower: 300, arcaneDepth: 80 },
    colorTheme: RX_RUNE_GOLD,
    rarity: 'Legendary',
  },
  {
    id: 'arcane_sovereign',
    name: 'Arcane Sovereign',
    description: 'The ultimate title. Ruler of the Rune Xyst, master of all species, sovereign of the arcane.',
    requirement: 'Complete all achievements, own all legendary artifacts, and max all structures.',
    bonuses: { arcana: 1000, runicPower: 1000, arcaneDepth: 200 },
    colorTheme: RX_RUNE_GOLD,
    rarity: 'Legendary',
  },
];

// ─── 15 Legendary Artifacts ──────────────────────────────────────────────────

interface RxArtifact {
  id: string;
  name: string;
  description: string;
  lore: string;
  rarity: 'Legendary' | 'Mythic';
  power: number;
  ability: string;
  unlockCondition: string;
  slot: 'weapon' | 'armor' | 'accessory' | 'tome';
  glowColor: string;
  series: string;
}

const RX_ARTIFACTS: RxArtifact[] = [
  {
    id: 'primordial_quill',
    name: 'Primordial Quill',
    description: 'The quill used by the First Scribe to write the original rune language into existence.',
    lore: 'Legend holds that this quill was carved from the feather of a creature that existed before time. Every word written with it becomes reality.',
    rarity: 'Mythic',
    power: 500,
    ability: 'All glyph inscription costs reduced by 50%. Inscribed glyphs gain +20% power.',
    unlockCondition: 'Complete the Secret of the Ancients achievement.',
    slot: 'weapon',
    glowColor: RX_RUNE_GOLD,
    series: 'Origin',
  },
  {
    id: 'nexus_core',
    name: 'Nexus Core',
    description: 'The crystalline heart of the Rune Xyst itself. It beats with the rhythm of all active runes.',
    lore: 'Removed from the arcade nexus during the Great Calibration. Reuniting it with the arcade would grant unparalleled power.',
    rarity: 'Mythic',
    power: 600,
    ability: 'Passively generates 5 arcana per turn. All arcade bonuses doubled.',
    unlockCondition: 'Complete all arcade mastery challenges.',
    slot: 'accessory',
    glowColor: RX_ARCANE_PURPLE,
    series: 'Nexus',
  },
  {
    id: 'stormforged_crown',
    name: 'Stormforged Crown',
    description: 'A crown forged in the eternal storm above the Thunder Plaza. Lightning arcs between its points.',
    lore: 'Worn by the Storm Architect who designed the Thunder Plaza. Her final act was to infuse the crown with her consciousness.',
    rarity: 'Legendary',
    power: 350,
    ability: 'All thunder sigil abilities have their cooldowns halved. +30% thunder damage.',
    unlockCondition: 'Defeat the Storm Architect echo in Thunder Plaza.',
    slot: 'armor',
    glowColor: '#F1C40F',
    series: 'Elemental',
  },
  {
    id: 'glacial_throne_shard',
    name: 'Glacial Throne Shard',
    description: 'A fragment of the Glacial Throne from the Age of Endless Winter. Freezes the air around it.',
    lore: 'The Glacial Throne once ruled the Glyph Maze. When it shattered, the pieces scattered across all arcades.',
    rarity: 'Legendary',
    power: 320,
    ability: 'Ice glyph abilities gain an additional freeze turn. -20% ice glyph mana costs.',
    unlockCondition: 'Find all 7 Glacial Throne fragments in the Glyph Maze.',
    slot: 'accessory',
    glowColor: '#3498DB',
    series: 'Elemental',
  },
  {
    id: 'ember_gauntlet',
    name: 'Ember Gauntlet',
    description: 'A gauntlet perpetually wreathed in crimson flame. The fire does not burn its wearer.',
    lore: 'Forged in the original Rune Forge by the First Blacksmith. It was lost when the forge was abandoned for a millennium.',
    rarity: 'Legendary',
    power: 330,
    ability: 'Fire rune abilities deal 25% more damage. Gain a fire shield that damages attackers.',
    unlockCondition: 'Complete the Rune Forge Arcade timed challenge.',
    slot: 'weapon',
    glowColor: '#E74C3C',
    series: 'Elemental',
  },
  {
    id: 'worldstone_amulet',
    name: 'Worldstone Amulet',
    description: 'An amulet containing a shard of the World Pillar Rune. Impossibly heavy but grants immense resilience.',
    lore: 'The World Pillar supports all arcades. This fragment was chiseled away during a dimensional earthquake.',
    rarity: 'Legendary',
    power: 400,
    ability: 'Maximum health increased by 50%. Earth rune defensive abilities doubled.',
    unlockCondition: 'Survive 20 consecutive turns in the Earth Basin.',
    slot: 'armor',
    glowColor: '#8B6914',
    series: 'Elemental',
  },
  {
    id: 'shadowblade_dance',
    name: 'Shadowblade Dance',
    description: 'A pair of ethereal daggers made from solidified shadow. They leave trails of darkness.',
    lore: 'The personal weapons of the Shadow Dancer, an assassin who moved between arcade dimensions unseen.',
    rarity: 'Legendary',
    power: 340,
    ability: 'Shadow glyph abilities gain stealth bonus. Critical hit chance increased by 20%.',
    unlockCondition: 'Complete the Sigil Corridor stealth challenge without detection.',
    slot: 'weapon',
    glowColor: '#2C3E50',
    series: 'Elemental',
  },
  {
    id: 'solar_diadem',
    name: 'Solar Diadem',
    description: 'A circlet of pure light that floats above the head of its wearer. Blinds all enemies.',
    lore: 'Created by the Lightbringer, the first being to carve a light sigil. It has never been dimmed.',
    rarity: 'Legendary',
    power: 350,
    ability: 'Light sigil healing doubled. All enemies within range are debuffed.',
    unlockCondition: 'Purify the Corrupted Sanctum in the Light Sanctum.',
    slot: 'armor',
    glowColor: '#F9E79F',
    series: 'Elemental',
  },
  {
    id: 'void_key',
    name: 'Void Key',
    description: 'A key that exists in a state of quantum uncertainty. It simultaneously locks and unlocks all doors.',
    lore: 'The only object known to have been created by the void itself, rather than erased by it.',
    rarity: 'Mythic',
    power: 550,
    ability: 'Access to all secret rooms in every arcade. Void rune abilities cost no mana.',
    unlockCondition: 'Reach the bottom of the Void Abyss and survive.',
    slot: 'accessory',
    glowColor: '#6C3483',
    series: 'Void',
  },
  {
    id: 'tome_of_lost_syllables',
    name: 'Tome of Lost Syllables',
    description: 'An ancient tome containing runic syllables that have been stricken from all other records.',
    lore: 'The Tome contains the true names of things that were erased from existence. Reading it aloud is extremely dangerous.',
    rarity: 'Mythic',
    power: 450,
    ability: 'Learn 5 exclusive glyph syllables. +15% to all word scores.',
    unlockCondition: 'Translate all proto-runic tablets and find the hidden library.',
    slot: 'tome',
    glowColor: RX_ETHEREAL_VIOLET,
    series: 'Knowledge',
  },
  {
    id: 'chronos_compass',
    name: 'Chronos Compass',
    description: 'A compass whose needle points to moments in time rather than locations in space.',
    lore: 'The Chronos Compass was crafted by the Time Monks of the temporal arcade. It was lost when their monastery was consumed by a void rift.',
    rarity: 'Legendary',
    power: 300,
    ability: 'Can rewind 1 turn per arcade run. Event timers paused for 2 turns.',
    unlockCondition: 'Collect 100 temporal sand and complete the temporal quest chain.',
    slot: 'accessory',
    glowColor: RX_AZURE_SHIMMER,
    series: 'Time',
  },
  {
    id: 'dragon_rune_armor',
    name: 'Dragon Rune Armor',
    description: 'A full suit of armor forged from dragon rune scales. Each scale is a miniature glyph matrix.',
    lore: 'The Rune Dragon shed these scales willingly to arm the arcade defenders against the coming void incursion.',
    rarity: 'Mythic',
    power: 700,
    ability: 'Immune to void damage. All defensive abilities enhanced by 40%.',
    unlockCondition: 'Befriend the Rune Dragon through the alliance quest line.',
    slot: 'armor',
    glowColor: RX_RUNE_GOLD,
    series: 'Dragon',
  },
  {
    id: 'soulwell_chalice',
    name: 'Soulwell Chalice',
    description: 'A chalice that collects the echoes of defeated foes. Each echo strengthens the next ability used.',
    lore: 'The Soulwell Chalice was used in the ancient practice of echo harvesting, now forbidden by the Arcade Council.',
    rarity: 'Legendary',
    power: 280,
    ability: 'Each defeated enemy provides a stacking 2% power bonus (max 50 stacks).',
    unlockCondition: 'Complete 30 arcade combat encounters.',
    slot: 'accessory',
    glowColor: '#A569BD',
    series: 'Soul',
  },
  {
    id: 'origin_embroidered_map',
    name: 'Origin Embroidered Map',
    description: 'A map of the entire Rune Xyst embroidered in arcane thread. Paths shift and update in real time.',
    lore: 'The map was woven by the Fates themselves. It shows not just where things are, but where they will be.',
    rarity: 'Legendary',
    power: 250,
    ability: 'All arcades revealed on the map. Secret room locations shown automatically.',
    unlockCondition: 'Visit every arcade and complete every map exploration task.',
    slot: 'tome',
    glowColor: '#F5B7B1',
    series: 'Knowledge',
  },
  {
    id: 'nullifier_orb',
    name: 'Nullifier Orb',
    description: 'A perfect sphere of absolute nothing. It negates all magic within its sphere of influence.',
    lore: 'The Nullifier Orb is the most feared artifact in the arcade. Even runecasters refuse to handle it without gloves of pure lead.',
    rarity: 'Mythic',
    power: 650,
    ability: 'Nullify one enemy ability per turn. All enemy glyphs lose 50% power in your presence.',
    unlockCondition: 'Craft from Nullifier Crystal + Void Pearl + Chronos Stone.',
    slot: 'weapon',
    glowColor: '#FFFFFF',
    series: 'Void',
  },
];

// ─── 12 Events ───────────────────────────────────────────────────────────────

interface RxEvent {
  id: string;
  name: string;
  description: string;
  duration: number;
  rarity: RxRarity;
  effectType: 'positive' | 'negative' | 'mixed';
  triggerCondition: string;
  effects: string[];
  resolution: string;
  narrativeText: string;
}

const RX_EVENTS: RxEvent[] = [
  {
    id: 'runic_surge',
    name: 'Runic Surge',
    description: 'A wave of arcane energy pulses through the arcade, empowering all glyphs temporarily.',
    duration: 5,
    rarity: 'Common',
    effectType: 'positive',
    triggerCondition: 'Random chance at start of any arcade run (10%).',
    effects: [
      'All glyph power increased by 25% for duration.',
      'Mana regeneration doubled.',
      'Common materials drop 50% more frequently.',
    ],
    resolution: 'The surge fades as the arcane energy dissipates back into the arcade walls.',
    narrativeText: 'The runes on the walls begin to glow with renewed intensity. A deep hum resonates through the corridors as arcane energy surges like a tide. Your glyphs respond eagerly, their power amplified beyond normal limits. This is the Runic Surge — a gift from the arcade itself.',
  },
  {
    id: 'void_incursion',
    name: 'Void Incursion',
    description: 'A rift in reality opens, releasing void energy that destabilizes the arcade.',
    duration: 8,
    rarity: 'Rare',
    effectType: 'negative',
    triggerCondition: 'Random when in deep arcades (15% chance).',
    effects: [
      'Void rune traps spawn on 30% of tiles.',
      'Non-void glyph power reduced by 15%.',
      'Word completion timer shortened by 20%.',
    ],
    resolution: 'The void rift slowly closes as the Void Anchors reassert reality.',
    narrativeText: 'A tear in the fabric of existence rips open before you. Beyond it lies the Plane of Oblivion, a realm of perfect nothingness. Void energy seeps through the gap, corroding the arcade walls and weakening your glyphs. You must survive until the Void Anchors can seal the breach.',
  },
  {
    id: 'glyph_migration',
    name: 'Glyph Migration',
    description: 'Glyphs spontaneously rearrange across the arcade, revealing new patterns and hidden words.',
    duration: 3,
    rarity: 'Uncommon',
    effectType: 'positive',
    triggerCondition: 'After completing a word chain of 5 or more.',
    effects: [
      'All tiles reshuffled into favorable positions.',
      'Hidden words revealed for 2 turns.',
      'Bonus material drop guaranteed at end.',
    ],
    resolution: 'The glyphs settle into their new positions, revealing configurations never seen before.',
    narrativeText: 'The glyphs begin to move. Not randomly, but with purpose — like a flock of luminous birds migrating across the arcade walls. They rearrange themselves into patterns you have never seen, and in the new configurations, words that were previously impossible become clear as day.',
  },
  {
    id: 'elemental_storm',
    name: 'Elemental Storm',
    description: 'A catastrophic collision of elemental energies creates a multi-element storm throughout the arcade.',
    duration: 6,
    rarity: 'Rare',
    effectType: 'mixed',
    triggerCondition: 'Random when multiple species glyphs are equipped (20% chance).',
    effects: [
      'Random elemental effects trigger each turn.',
      'All element-specific abilities cost 30% less mana.',
      'Structures take 10% damage per turn.',
    ],
    resolution: 'The elemental energies exhaust themselves and the storm dissipates.',
    narrativeText: 'Fire meets ice. Lightning strikes stone. Shadow clashes with light. The arcade becomes a battlefield of raw elemental force as every species of glyph resonates simultaneously. It is beautiful and terrifying in equal measure.',
  },
  {
    id: 'ancient_awakening',
    name: 'Ancient Awakening',
    description: 'The dormant runes of the Hall of Ancients stir, releasing echoes of forgotten knowledge.',
    duration: 4,
    rarity: 'Epic',
    effectType: 'positive',
    triggerCondition: 'When entering Hall of Ancients with 500+ arcana (5% chance).',
    effects: [
      'Unlock 1 random glyph recipe.',
      'Gain temporary access to a locked arcade.',
      'All research progress doubled for duration.',
    ],
    resolution: 'The ancient runes fall dormant again, but their knowledge remains.',
    narrativeText: 'The walls of the Hall of Ancients begin to vibrate. Proto-runic script that has been dark for millennia suddenly blazes with golden light. The voices of the First Scribes echo through time, whispering secrets of glyphs that were thought lost forever.',
  },
  {
    id: 'shadow_invasion',
    name: 'Shadow Invasion',
    description: 'Shadow creatures pour from the Sigil Corridor, overwhelming the arcade with darkness.',
    duration: 10,
    rarity: 'Epic',
    effectType: 'negative',
    triggerCondition: 'Random deep arcade event (8% chance).',
    effects: [
      'Vision range reduced to adjacent tiles only.',
      'Shadow glyph enemies spawn each turn.',
      'Light sigil abilities gain double effectiveness.',
    ],
    resolution: 'The shadow creatures retreat when the light sigils are fully activated.',
    narrativeText: 'From the depths of the Sigil Corridor, a tide of living darkness flows. Shadow creatures — manifestations of forgotten fears — pour into the arcade, extinguishing lights and obscuring paths. Only the light sigils stand between you and total darkness.',
  },
  {
    id: 'merchant_caravan',
    name: 'Merchant Caravan',
    description: 'A traveling caravan of inter-dimensional merchants arrives at the arcade, offering rare wares.',
    duration: 5,
    rarity: 'Common',
    effectType: 'positive',
    triggerCondition: 'Random at arcade entrance (20% chance).',
    effects: [
      'Access to special merchant shop with rare items.',
      'All purchase prices reduced by 25%.',
      'Can trade 3 common materials for 1 uncommon material.',
    ],
    resolution: 'The merchants pack their wares and depart for another dimension.',
    narrativeText: 'The familiar jingling of arcane bells announces the arrival of the Merchant Caravan. These inter-dimensional traders carry wares from arcades you have never heard of. Their packs bulge with rare materials, unique glyphs, and the occasional legendary artifact.',
  },
  {
    id: 'runic_corruption',
    name: 'Runic Corruption',
    description: 'A malevolent force corrupts random glyphs, causing them to malfunction or turn hostile.',
    duration: 7,
    rarity: 'Rare',
    effectType: 'negative',
    triggerCondition: 'Random during extended arcade sessions (12% chance).',
    effects: [
      '20% of equipped glyphs lose 50% power.',
      'Corrupted glyph tiles deal damage when touched.',
      'Purify ability (if available) removes corruption instantly.',
    ],
    resolution: 'The corruption fades as the glyphs are purified or the event timer expires.',
    narrativeText: 'Something is wrong. Your glyphs flicker and hiss, their once-steady glow now erratic and angry. A dark corruption has seeped into the runic circuits, turning the tools of creation into instruments of chaos. You must purify them before the corruption spreads.',
  },
  {
    id: 'forgemaster_trial',
    name: 'Forgemaster Trial',
    description: 'The spirit of the ancient Forgemaster appears and challenges you to a crafting trial.',
    duration: 0,
    rarity: 'Epic',
    effectType: 'mixed',
    triggerCondition: 'When visiting Rune Forge Arcade with max-level structures (10% chance).',
    effects: [
      'Special crafting challenge: forge a specific glyph within a time limit.',
      'Success: receive a free rare or epic glyph plus materials.',
      'Failure: lose 200 arcana and some materials.',
    ],
    resolution: 'The Forgemaster spirit judges your work and vanishes.',
    narrativeText: 'The temperature in the Rune Forge Arcade drops. The flames turn from orange to spectral blue. Before you materializes the towering spirit of the ancient Forgemaster, hammer in hand, eyes blazing with eternal fire. "Prove your worth, young runecaster," the spirit commands. "Forge me the Glyph of Eternal Flame, or face my judgment."',
  },
  {
    id: 'dimensional_earthquake',
    name: 'Dimensional Earthquake',
    description: 'The arcade dimensions shift, causing tiles to swap, merge, or disappear temporarily.',
    duration: 4,
    rarity: 'Uncommon',
    effectType: 'mixed',
    triggerCondition: 'Random during any arcade run (8% chance).',
    effects: [
      'Tiles randomly swap positions each turn.',
      'Merged tiles have double letter value.',
      'Missing tiles regenerate after the event ends.',
    ],
    resolution: 'Dimensions stabilize and tiles return to their proper configuration.',
    narrativeText: 'The ground lurches. Not just beneath your feet, but in every direction simultaneously. The arcade dimensions are shifting — walls ripple, floors tilt, and the very tiles you stand on transpose with their neighbors. The dimensional earthquake has begun, and nothing is certain until it passes.',
  },
  {
    id: 'phoenix_rebirth',
    name: 'Phoenix Rebirth',
    description: 'The arcade phoenix performs its cycle of death and rebirth, empowering all fire runes.',
    duration: 5,
    rarity: 'Legendary',
    effectType: 'positive',
    triggerCondition: 'Extremely rare random event (2% chance) or after dying in the Rune Forge Arcade.',
    effects: [
      'All fire rune abilities become free to use.',
      'Fire glyph power tripled.',
      'Gain temporary invulnerability for 1 turn.',
      'Death counter reset to zero.',
    ],
    resolution: 'The phoenix completes its rebirth and returns to its nest.',
    narrativeText: 'A scream of fire echoes through the arcade. The great phoenix — guardian of the Rune Forge — ignites in a supernova of flame, burning itself to ash. But from the ashes, a new phoenix rises, more brilliant than before. Its rebirth sends a wave of primordial fire through every runic circuit in the arcade.',
  },
  {
    id: 'abyssal_whisper',
    name: 'Abyssal Whisper',
    description: 'The Void Abyss speaks directly to you, offering forbidden knowledge at a terrible price.',
    duration: 0,
    rarity: 'Legendary',
    effectType: 'mixed',
    triggerCondition: 'When at maximum Arcane Depth in the Void Abyss (5% chance).',
    effects: [
      'Choose: gain 1000 arcana OR learn a void-only glyph recipe.',
      'Either choice reduces maximum health by 10% permanently.',
      'Shadow glyph affinity increased by 50% permanently.',
    ],
    resolution: 'The whisper fades, leaving you forever changed.',
    narrativeText: 'The silence of the Void Abyss is not empty. It is full. Full of whispers. Full of secrets. Full of promises. A voice — if voice it can be called — speaks directly into your mind. It offers knowledge beyond mortal comprehension. The price? A piece of your very existence. Do you accept?',
  },
];

// ─── Helper Types ────────────────────────────────────────────────────────────

interface RxInventoryItem {
  materialId: string;
  quantity: number;
}

interface RxStructureInstance {
  structureId: string;
  level: number;
  placementArcade: string;
}

interface RxEquippedGlyphs {
  slots: (string | null)[];
  maxSlots: number;
}

// ─── Zustand Store ───────────────────────────────────────────────────────────

interface RxState {
  rxLevel: number;
  rxRunicPower: number;
  rxArcaneDepth: number;
  rxArcana: number;
  rxMana: number;
  rxMaxMana: number;
  rxCurrenArcadeId: string | null;
  rxDiscoveredGlyphs: string[];
  rxEquippedGlyphs: RxEquippedGlyphs;
  rxInventory: RxInventoryItem[];
  rxStructures: RxStructureInstance[];
  rxUnlockedAbilities: string[];
  rxCompletedAchievements: string[];
  rxActiveTitleId: string | null;
  rxOwnedArtifacts: string[];
  rxEquippedArtifacts: Record<string, string | null>;
  rxVisitedArcades: string[];
  rxTotalWordsCompleted: number;
  rxTotalGlyphsInscribed: number;
  rxEventHistory: string[];
  rxDeathCount: number;
  rxPlayTimeMinutes: number;

  setRxLevel: (level: number) => void;
  addRunicPower: (amount: number) => void;
  addArcaneDepth: (amount: number) => void;
  addArcana: (amount: number) => void;
  spendArcana: (amount: number) => boolean;
  spendMana: (amount: number) => boolean;
  regenerateMana: (amount: number) => void;
  setCurrentArcade: (arcadeId: string | null) => void;
  discoverGlyph: (glyphId: string) => void;
  equipGlyph: (glyphId: string, slotIndex: number) => void;
  unequipGlyph: (slotIndex: number) => void;
  addInventoryItem: (materialId: string, quantity: number) => void;
  removeInventoryItem: (materialId: string, quantity: number) => boolean;
  buildStructure: (structureId: string, arcadeId: string) => void;
  upgradeStructure: (instanceId: string) => void;
  unlockAbility: (abilityId: string) => void;
  completeAchievement: (achievementId: string) => void;
  setActiveTitle: (titleId: string | null) => void;
  acquireArtifact: (artifactId: string) => void;
  equipArtifact: (artifactId: string, slot: string) => void;
  unequipArtifact: (slot: string) => void;
  visitArcade: (arcadeId: string) => void;
  incrementWordsCompleted: (count: number) => void;
  incrementGlyphsInscribed: (count: number) => void;
  addEventToHistory: (eventId: string) => void;
  incrementDeathCount: () => void;
  addPlayTime: (minutes: number) => void;
  rxResetProgress: () => void;
}

const RX_INITIAL_STATE = {
  rxLevel: 1,
  rxRunicPower: 0,
  rxArcaneDepth: 0,
  rxArcana: 100,
  rxMana: 50,
  rxMaxMana: 50,
  rxCurrenArcadeId: null as string | null,
  rxDiscoveredGlyphs: [] as string[],
  rxEquippedGlyphs: { slots: [null, null, null] as (string | null)[], maxSlots: 3 } as RxEquippedGlyphs,
  rxInventory: [] as RxInventoryItem[],
  rxStructures: [] as RxStructureInstance[],
  rxUnlockedAbilities: [] as string[],
  rxCompletedAchievements: [] as string[],
  rxActiveTitleId: null as string | null,
  rxOwnedArtifacts: [] as string[],
  rxEquippedArtifacts: { weapon: null, armor: null, accessory: null, tome: null } as Record<string, string | null>,
  rxVisitedArcades: [] as string[],
  rxTotalWordsCompleted: 0,
  rxTotalGlyphsInscribed: 0,
  rxEventHistory: [] as string[],
  rxDeathCount: 0,
  rxPlayTimeMinutes: 0,
};

const useRxStore = create<RxState>()(
  persist(
    (set, get) => ({
      ...RX_INITIAL_STATE,

      setRxLevel: (level: number) => {
        set({ rxLevel: Math.max(1, level) });
      },

      addRunicPower: (amount: number) => {
        set((prev) => ({ rxRunicPower: Math.max(0, prev.rxRunicPower + amount) }));
      },

      addArcaneDepth: (amount: number) => {
        set((prev) => ({ rxArcaneDepth: Math.min(999, Math.max(0, prev.rxArcaneDepth + amount)) }));
      },

      addArcana: (amount: number) => {
        set((prev) => ({ rxArcana: Math.max(0, prev.rxArcana + amount) }));
      },

      spendArcana: (amount: number) => {
        const state = get();
        if (state.rxArcana < amount) {
          return false;
        }
        set((prev) => ({ rxArcana: prev.rxArcana - amount }));
        return true;
      },

      spendMana: (amount: number) => {
        const state = get();
        if (state.rxMana < amount) {
          return false;
        }
        set((prev) => ({ rxMana: prev.rxMana - amount }));
        return true;
      },

      regenerateMana: (amount: number) => {
        set((prev) => ({ rxMana: Math.min(prev.rxMaxMana, prev.rxMana + amount) }));
      },

      setCurrentArcade: (arcadeId: string | null) => {
        set({ rxCurrenArcadeId: arcadeId });
      },

      discoverGlyph: (glyphId: string) => {
        set((prev) => {
          if (prev.rxDiscoveredGlyphs.includes(glyphId)) {
            return prev;
          }
          return { rxDiscoveredGlyphs: [...prev.rxDiscoveredGlyphs, glyphId] };
        });
      },

      equipGlyph: (glyphId: string, slotIndex: number) => {
        set((prev) => {
          const newSlots = [...prev.rxEquippedGlyphs.slots];
          if (slotIndex < 0 || slotIndex >= newSlots.length) {
            return prev;
          }
          newSlots[slotIndex] = glyphId;
          return { rxEquippedGlyphs: { ...prev.rxEquippedGlyphs, slots: newSlots } };
        });
      },

      unequipGlyph: (slotIndex: number) => {
        set((prev) => {
          const newSlots = [...prev.rxEquippedGlyphs.slots];
          if (slotIndex < 0 || slotIndex >= newSlots.length) {
            return prev;
          }
          newSlots[slotIndex] = null;
          return { rxEquippedGlyphs: { ...prev.rxEquippedGlyphs, slots: newSlots } };
        });
      },

      addInventoryItem: (materialId: string, quantity: number) => {
        set((prev) => {
          const existing = prev.rxInventory.find((item) => item.materialId === materialId);
          if (existing) {
            const newInventory = prev.rxInventory.map((item) => {
              if (item.materialId === materialId) {
                return { materialId, quantity: item.quantity + quantity };
              }
              return item;
            });
            return { rxInventory: newInventory };
          }
          return { rxInventory: [...prev.rxInventory, { materialId, quantity }] };
        });
      },

      removeInventoryItem: (materialId: string, quantity: number) => {
        const state = get();
        const existing = state.rxInventory.find((item) => item.materialId === materialId);
        if (!existing || existing.quantity < quantity) {
          return false;
        }
        set((prev) => {
          const newQuantity = existing.quantity - quantity;
          if (newQuantity <= 0) {
            return { rxInventory: prev.rxInventory.filter((item) => item.materialId !== materialId) };
          }
          return {
            rxInventory: prev.rxInventory.map((item) => {
              if (item.materialId === materialId) {
                return { materialId, quantity: newQuantity };
              }
              return item;
            }),
          };
        });
        return true;
      },

      buildStructure: (structureId: string, arcadeId: string) => {
        set((prev) => ({
          rxStructures: [
            ...prev.rxStructures,
            { structureId, level: 1, placementArcade: arcadeId },
          ],
        }));
      },

      upgradeStructure: (instanceId: string) => {
        set((prev) => ({
          rxStructures: prev.rxStructures.map((s, i) => {
            if (i.toString() === instanceId) {
              return { ...s, level: s.level + 1 };
            }
            return s;
          }),
        }));
      },

      unlockAbility: (abilityId: string) => {
        set((prev) => {
          if (prev.rxUnlockedAbilities.includes(abilityId)) {
            return prev;
          }
          return { rxUnlockedAbilities: [...prev.rxUnlockedAbilities, abilityId] };
        });
      },

      completeAchievement: (achievementId: string) => {
        set((prev) => {
          if (prev.rxCompletedAchievements.includes(achievementId)) {
            return prev;
          }
          return { rxCompletedAchievements: [...prev.rxCompletedAchievements, achievementId] };
        });
      },

      setActiveTitle: (titleId: string | null) => {
        set({ rxActiveTitleId: titleId });
      },

      acquireArtifact: (artifactId: string) => {
        set((prev) => {
          if (prev.rxOwnedArtifacts.includes(artifactId)) {
            return prev;
          }
          return { rxOwnedArtifacts: [...prev.rxOwnedArtifacts, artifactId] };
        });
      },

      equipArtifact: (artifactId: string, slot: string) => {
        set((prev) => ({
          rxEquippedArtifacts: { ...prev.rxEquippedArtifacts, [slot]: artifactId },
        }));
      },

      unequipArtifact: (slot: string) => {
        set((prev) => ({
          rxEquippedArtifacts: { ...prev.rxEquippedArtifacts, [slot]: null },
        }));
      },

      visitArcade: (arcadeId: string) => {
        set((prev) => {
          if (prev.rxVisitedArcades.includes(arcadeId)) {
            return prev;
          }
          return { rxVisitedArcades: [...prev.rxVisitedArcades, arcadeId] };
        });
      },

      incrementWordsCompleted: (count: number) => {
        set((prev) => ({ rxTotalWordsCompleted: prev.rxTotalWordsCompleted + count }));
      },

      incrementGlyphsInscribed: (count: number) => {
        set((prev) => ({ rxTotalGlyphsInscribed: prev.rxTotalGlyphsInscribed + count }));
      },

      addEventToHistory: (eventId: string) => {
        set((prev) => ({ rxEventHistory: [...prev.rxEventHistory, eventId] }));
      },

      incrementDeathCount: () => {
        set((prev) => ({ rxDeathCount: prev.rxDeathCount + 1 }));
      },

      addPlayTime: (minutes: number) => {
        set((prev) => ({ rxPlayTimeMinutes: prev.rxPlayTimeMinutes + minutes }));
      },

      rxResetProgress: () => {
        set({ ...RX_INITIAL_STATE });
      },
    }),
    {
      name: 'rune-xyst-storage',
      version: 1,
    }
  )
);

// ─── React Hook ──────────────────────────────────────────────────────────────

function useRuneXyst() {
  const state = useRxStore();
  const storeActions = useRxStore((s) => ({
    setRxLevel: s.setRxLevel,
    addRunicPower: s.addRunicPower,
    addArcaneDepth: s.addArcaneDepth,
    addArcana: s.addArcana,
    spendArcana: s.spendArcana,
    spendMana: s.spendMana,
    regenerateMana: s.regenerateMana,
    setCurrentArcade: s.setCurrentArcade,
    discoverGlyph: s.discoverGlyph,
    equipGlyph: s.equipGlyph,
    unequipGlyph: s.unequipGlyph,
    addInventoryItem: s.addInventoryItem,
    removeInventoryItem: s.removeInventoryItem,
    buildStructure: s.buildStructure,
    upgradeStructure: s.upgradeStructure,
    unlockAbility: s.unlockAbility,
    completeAchievement: s.completeAchievement,
    setActiveTitle: s.setActiveTitle,
    acquireArtifact: s.acquireArtifact,
    equipArtifact: s.equipArtifact,
    unequipArtifact: s.unequipArtifact,
    visitArcade: s.visitArcade,
    incrementWordsCompleted: s.incrementWordsCompleted,
    incrementGlyphsInscribed: s.incrementGlyphsInscribed,
    addEventToHistory: s.addEventToHistory,
    incrementDeathCount: s.incrementDeathCount,
    addPlayTime: s.addPlayTime,
    rxResetProgress: s.rxResetProgress,
  }));

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const [localManaRegenTimer, setLocalManaRegenTimer] = useState(0);

  // Passive mana regeneration effect
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = stateRef.current;
      const arcaneRecoveryActive = currentState.rxUnlockedAbilities.includes('arcane_recovery');
      const regenAmount = arcaneRecoveryActive ? 4 : 2;
      if (currentState.rxMana < currentState.rxMaxMana) {
        storeActions.regenerateMana(regenAmount);
      }
      setLocalManaRegenTimer((prev) => prev + 1);
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [storeActions]);

  // Derived data: glyphs by rarity
  const glyphsByRarity = useMemo(() => {
    const grouped: Record<RxRarity, RxGlyph[]> = {
      Common: [],
      Uncommon: [],
      Rare: [],
      Epic: [],
      Legendary: [],
    };
    for (const glyph of RX_GLYPHS) {
      grouped[glyph.rarity].push(glyph);
    }
    return grouped;
  }, [state]);

  // Derived data: glyphs by species
  const glyphsBySpecies = useMemo(() => {
    const grouped: Record<RxSpecies, RxGlyph[]> = {
      fire_rune: [],
      ice_glyph: [],
      thunder_sigil: [],
      earth_rune: [],
      shadow_glyph: [],
      light_sigil: [],
      void_rune: [],
    };
    for (const glyph of RX_GLYPHS) {
      grouped[glyph.species].push(glyph);
    }
    return grouped;
  }, [state]);

  // Derived data: accessible arcades based on level
  const accessibleArcades = useMemo(() => {
    return RX_ARCADES.filter((arcade) => arcade.levelRequired <= state.rxLevel);
  }, [state]);

  // Derived data: unlockable abilities based on level
  const availableAbilities = useMemo(() => {
    return RX_ABILITIES.filter((ability) => ability.unlockLevel <= state.rxLevel);
  }, [state]);

  // Derived data: materials by rarity
  const materialsByRarity = useMemo(() => {
    const grouped: Record<RxRarity, RxMaterial[]> = {
      Common: [],
      Uncommon: [],
      Rare: [],
      Epic: [],
      Legendary: [],
    };
    for (const mat of RX_MATERIALS) {
      grouped[mat.rarity].push(mat);
    }
    return grouped;
  }, [state]);

  // Derived data: structures by category
  const structuresByCategory = useMemo(() => {
    const grouped: Record<string, RxStructure[]> = {
      production: [],
      defense: [],
      research: [],
      storage: [],
      special: [],
    };
    for (const structure of RX_STRUCTURES) {
      grouped[structure.category].push(structure);
    }
    return grouped;
  }, [state]);

  // Derived data: achievements by category
  const achievementsByCategory = useMemo(() => {
    const grouped: Record<string, RxAchievement[]> = {
      exploration: [],
      crafting: [],
      combat: [],
      collection: [],
      mastery: [],
      research: [],
    };
    for (const achievement of RX_ACHIEVEMENTS) {
      if (grouped[achievement.category]) {
        grouped[achievement.category].push(achievement);
      }
    }
    return grouped;
  }, [state]);

  // Derived data: events by type
  const eventsByType = useMemo(() => {
    const grouped: Record<string, RxEvent[]> = {
      positive: [],
      negative: [],
      mixed: [],
    };
    for (const event of RX_EVENTS) {
      grouped[event.effectType].push(event);
    }
    return grouped;
  }, [state]);

  // Derived data: total equipped glyph power
  const totalEquippedGlyphPower = useMemo(() => {
    let total = 0;
    for (const glyphId of state.rxEquippedGlyphs.slots) {
      if (glyphId) {
        const glyph = RX_GLYPHS.find((g) => g.id === glyphId);
        if (glyph) {
          total += glyph.power;
        }
      }
    }
    return total;
  }, [state]);

  // Derived data: unique species equipped
  const uniqueSpeciesEquipped = useMemo(() => {
    const species = new Set<RxSpecies>();
    for (const glyphId of state.rxEquippedGlyphs.slots) {
      if (glyphId) {
        const glyph = RX_GLYPHS.find((g) => g.id === glyphId);
        if (glyph) {
          species.add(glyph.species);
        }
      }
    }
    return species.size;
  }, [state]);

  // Derived data: active title data
  const activeTitleData = useMemo(() => {
    if (!state.rxActiveTitleId) {
      return null;
    }
    return RX_TITLES.find((t) => t.id === state.rxActiveTitleId) ?? null;
  }, [state]);

  // Derived data: total structure levels
  const totalStructureLevels = useMemo(() => {
    let total = 0;
    for (const s of state.rxStructures) {
      total += s.level;
    }
    return total;
  }, [state]);

  // Derived data: total artifact power
  const totalArtifactPower = useMemo(() => {
    let total = 0;
    for (const slot of Object.keys(state.rxEquippedArtifacts)) {
      const artifactId = state.rxEquippedArtifacts[slot];
      if (artifactId) {
        const artifact = RX_ARTIFACTS.find((a) => a.id === artifactId);
        if (artifact) {
          total += artifact.power;
        }
      }
    }
    return total;
  }, [state]);

  // Helper: get glyph details
  const getGlyphDetails = useCallback((glyphId: string): RxGlyph | undefined => {
    return RX_GLYPHS.find((g) => g.id === glyphId);
  }, []);

  // Helper: get arcade details
  const getArcadeDetails = useCallback((arcadeId: string): RxArcade | undefined => {
    return RX_ARCADES.find((a) => a.id === arcadeId);
  }, []);

  // Helper: get material details
  const getMaterialDetails = useCallback((materialId: string): RxMaterial | undefined => {
    return RX_MATERIALS.find((m) => m.id === materialId);
  }, []);

  // Helper: get structure details
  const getStructureDetails = useCallback((structureId: string): RxStructure | undefined => {
    return RX_STRUCTURES.find((s) => s.id === structureId);
  }, []);

  // Helper: get ability details
  const getAbilityDetails = useCallback((abilityId: string): RxAbility | undefined => {
    return RX_ABILITIES.find((a) => a.id === abilityId);
  }, []);

  // Helper: get achievement details
  const getAchievementDetails = useCallback((achievementId: string): RxAchievement | undefined => {
    return RX_ACHIEVEMENTS.find((a) => a.id === achievementId);
  }, []);

  // Helper: get artifact details
  const getArtifactDetails = useCallback((artifactId: string): RxArtifact | undefined => {
    return RX_ARTIFACTS.find((a) => a.id === artifactId);
  }, []);

  // Helper: get event details
  const getEventDetails = useCallback((eventId: string): RxEvent | undefined => {
    return RX_EVENTS.find((e) => e.id === eventId);
  }, []);

  // Helper: calculate upgrade cost for a structure
  const calculateUpgradeCost = useCallback((structureId: string, currentLevel: number): Record<string, number> => {
    const structure = RX_STRUCTURES.find((s) => s.id === structureId);
    if (!structure) {
      return {};
    }
    const costs: Record<string, number> = {};
    for (const [materialId, baseCost] of Object.entries(structure.baseCost)) {
      costs[materialId] = Math.ceil(baseCost * Math.pow(structure.upgradeCostMultiplier, currentLevel));
    }
    return costs;
  }, []);

  // Helper: calculate glyph inscription cost
  const calculateInscriptionCost = useCallback((glyph: RxGlyph): number => {
    const hasRunicMastery = state.rxUnlockedAbilities.includes('runic_mastery');
    const baseCost = glyph.arcanaCost;
    if (hasRunicMastery) {
      return Math.ceil(baseCost * 0.85);
    }
    return baseCost;
  }, [state]);

  // Helper: get current arcade bonus
  const currentArcadeBonus = useMemo(() => {
    if (!state.rxCurrenArcadeId) {
      return 0;
    }
    const arcade = RX_ARCADES.find((a) => a.id === state.rxCurrenArcadeId);
    if (!arcade) {
      return 0;
    }
    return arcade.wordBonus;
  }, [state]);

  // ── Complex Helper Functions ──

  // rxInscribeGlyph: Inscribes a new glyph
  const rxInscribeGlyph = useCallback(
    (glyphId: string) => {
      const glyph = RX_GLYPHS.find((g) => g.id === glyphId);
      if (!glyph) {
        return { success: false, message: 'Glyph not found.' };
      }
      if (state.rxLevel < glyph.unlockLevel) {
        return { success: false, message: `Requires level ${glyph.unlockLevel}.` };
      }
      if (state.rxDiscoveredGlyphs.includes(glyphId)) {
        return { success: false, message: 'Glyph already discovered.' };
      }
      const cost = calculateInscriptionCost(glyph);
      if (!storeActions.spendArcana(cost)) {
        return { success: false, message: `Insufficient arcana. Need ${cost}.` };
      }
      storeActions.discoverGlyph(glyphId);
      storeActions.incrementGlyphsInscribed(1);
      return { success: true, message: `Inscribed ${glyph.name}!` };
    },
    [state, calculateInscriptionCost, storeActions]
  );

  // rxChargeRune: Charges a rune with energy
  const rxChargeRune = useCallback(
    (glyphId: string) => {
      const glyph = RX_GLYPHS.find((g) => g.id === glyphId);
      if (!glyph) {
        return { success: false, message: 'Glyph not found.' };
      }
      if (!state.rxDiscoveredGlyphs.includes(glyphId)) {
        return { success: false, message: 'Glyph not yet discovered.' };
      }
      const manaCost = Math.ceil(glyph.power * 0.3);
      if (!storeActions.spendMana(manaCost)) {
        return { success: false, message: `Insufficient mana. Need ${manaCost}.` };
      }
      const powerGained = Math.ceil(glyph.power * 0.15);
      storeActions.addRunicPower(powerGained);
      storeActions.addArcaneDepth(Math.ceil(powerGained * 0.1));
      return {
        success: true,
        message: `Charged ${glyph.name}! +${powerGained} Runic Power.`,
        powerGained,
      };
    },
    [state, storeActions]
  );

  // rxWalkArcade: Walk to an arcade
  const rxWalkArcade = useCallback(
    (arcadeId: string) => {
      const arcade = RX_ARCADES.find((a) => a.id === arcadeId);
      if (!arcade) {
        return { success: false, message: 'Arcade not found.' };
      }
      if (state.rxLevel < arcade.levelRequired) {
        return { success: false, message: `Requires level ${arcade.levelRequired}.` };
      }
      storeActions.setCurrentArcade(arcadeId);
      storeActions.visitArcade(arcadeId);
      return {
        success: true,
        message: `Entered ${arcade.name}.`,
        arcade,
      };
    },
    [state, storeActions]
  );

  // rxCraftSigil: Craft a sigil using materials
  const rxCraftSigil = useCallback(
    (targetMaterialId: string, requiredMaterials: Array<{ materialId: string; quantity: number }>) => {
      const target = RX_MATERIALS.find((m) => m.id === targetMaterialId);
      if (!target) {
        return { success: false, message: 'Target material not found.' };
      }
      // Check all required materials
      for (const req of requiredMaterials) {
        const currentQty =
          state.rxInventory.find((item) => item.materialId === req.materialId)?.quantity ?? 0;
        if (currentQty < req.quantity) {
          return {
            success: false,
            message: `Insufficient ${req.materialId}. Need ${req.quantity}, have ${currentQty}.`,
          };
        }
      }
      // Deduct all materials
      for (const req of requiredMaterials) {
        storeActions.removeInventoryItem(req.materialId, req.quantity);
      }
      // Add crafted material
      storeActions.addInventoryItem(targetMaterialId, 1);
      storeActions.addRunicPower(Math.ceil(target.baseValue * 0.5));
      return {
        success: true,
        message: `Crafted ${target.name}!`,
        craftedItem: target,
      };
    },
    [state, storeActions]
  );

  // rxUseAbility: Use an ability
  const rxUseAbility = useCallback(
    (abilityId: string) => {
      const ability = RX_ABILITIES.find((a) => a.id === abilityId);
      if (!ability) {
        return { success: false, message: 'Ability not found.' };
      }
      if (!state.rxUnlockedAbilities.includes(abilityId)) {
        return { success: false, message: 'Ability not unlocked.' };
      }
      if (ability.manaCost > 0) {
        if (!storeActions.spendMana(ability.manaCost)) {
          return { success: false, message: `Insufficient mana. Need ${ability.manaCost}.` };
        }
      }
      return {
        success: true,
        message: `Used ${ability.name}!`,
        ability,
      };
    },
    [state, storeActions]
  );

  // rxBuildStructure: Build a new structure
  const rxBuildStructure = useCallback(
    (structureId: string, arcadeId: string) => {
      const structure = RX_STRUCTURES.find((s) => s.id === structureId);
      if (!structure) {
        return { success: false, message: 'Structure not found.' };
      }
      const costs = calculateUpgradeCost(structureId, 0);
      for (const [materialId, qty] of Object.entries(costs)) {
        const currentQty =
          state.rxInventory.find((item) => item.materialId === materialId)?.quantity ?? 0;
        if (currentQty < qty) {
          return {
            success: false,
            message: `Insufficient ${materialId}. Need ${qty}, have ${currentQty}.`,
          };
        }
      }
      for (const [materialId, qty] of Object.entries(costs)) {
        storeActions.removeInventoryItem(materialId, qty);
      }
      storeActions.buildStructure(structureId, arcadeId);
      return { success: true, message: `Built ${structure.name}!` };
    },
    [state, calculateUpgradeCost, storeActions]
  );

  // rxUpgradeStructure: Upgrade an existing structure
  const rxUpgradeStructure = useCallback(
    (instanceIndex: number) => {
      const instance = state.rxStructures[instanceIndex];
      if (!instance) {
        return { success: false, message: 'Structure instance not found.' };
      }
      const structure = RX_STRUCTURES.find((s) => s.id === instance.structureId);
      if (!structure) {
        return { success: false, message: 'Structure definition not found.' };
      }
      if (instance.level >= structure.maxLevel) {
        return { success: false, message: 'Structure already at max level.' };
      }
      const costs = calculateUpgradeCost(instance.structureId, instance.level);
      for (const [materialId, qty] of Object.entries(costs)) {
        const currentQty =
          state.rxInventory.find((item) => item.materialId === materialId)?.quantity ?? 0;
        if (currentQty < qty) {
          return {
            success: false,
            message: `Insufficient ${materialId}. Need ${qty}, have ${currentQty}.`,
          };
        }
      }
      for (const [materialId, qty] of Object.entries(costs)) {
        storeActions.removeInventoryItem(materialId, qty);
      }
      storeActions.upgradeStructure(instanceIndex.toString());
      return {
        success: true,
        message: `Upgraded ${structure.name} to level ${instance.level + 1}!`,
      };
    },
    [state, calculateUpgradeCost, storeActions]
  );

  // rxCheckAchievement: Check and complete an achievement
  const rxCheckAchievement = useCallback(
    (achievementId: string, conditionMet: boolean) => {
      if (!conditionMet) {
        return { success: false, message: 'Condition not met.', completed: false };
      }
      if (state.rxCompletedAchievements.includes(achievementId)) {
        return { success: true, message: 'Already completed.', completed: true };
      }
      const achievement = RX_ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement) {
        return { success: false, message: 'Achievement not found.', completed: false };
      }
      storeActions.completeAchievement(achievementId);
      storeActions.addArcana(achievement.rewardValue);
      storeActions.addRunicPower(achievement.rewardValue);
      return {
        success: true,
        message: `Achievement unlocked: ${achievement.name}! +${achievement.rewardValue} Arcana`,
        completed: true,
        achievement,
      };
    },
    [state, storeActions]
  );

  // rxAcquireTitle: Check and set a new title
  const rxAcquireTitle = useCallback(
    (titleId: string) => {
      const title = RX_TITLES.find((t) => t.id === titleId);
      if (!title) {
        return { success: false, message: 'Title not found.' };
      }
      storeActions.setActiveTitle(titleId);
      return {
        success: true,
        message: `Title equipped: ${title.name}`,
        title,
      };
    },
    [storeActions]
  );

  // rxAcquireArtifact: Pick up a new artifact
  const rxAcquireArtifact = useCallback(
    (artifactId: string) => {
      const artifact = RX_ARTIFACTS.find((a) => a.id === artifactId);
      if (!artifact) {
        return { success: false, message: 'Artifact not found.' };
      }
      if (state.rxOwnedArtifacts.includes(artifactId)) {
        return { success: false, message: 'Artifact already owned.' };
      }
      storeActions.acquireArtifact(artifactId);
      storeActions.addRunicPower(artifact.power);
      return {
        success: true,
        message: `Artifact acquired: ${artifact.name}! +${artifact.power} Runic Power`,
        artifact,
      };
    },
    [state, storeActions]
  );

  // rxEquipArtifact: Equip an owned artifact
  const rxEquipArtifact = useCallback(
    (artifactId: string, slot: string) => {
      const artifact = RX_ARTIFACTS.find((a) => a.id === artifactId);
      if (!artifact) {
        return { success: false, message: 'Artifact not found.' };
      }
      if (!state.rxOwnedArtifacts.includes(artifactId)) {
        return { success: false, message: 'Artifact not owned.' };
      }
      if (artifact.slot !== slot) {
        return { success: false, message: `Invalid slot. ${artifact.name} requires slot: ${artifact.slot}.` };
      }
      storeActions.equipArtifact(artifactId, slot);
      return {
        success: true,
        message: `Equipped ${artifact.name} in ${slot} slot.`,
      };
    },
    [state, storeActions]
  );

  // rxProcessEvent: Process an event effect
  const rxProcessEvent = useCallback(
    (eventId: string) => {
      const event = RX_EVENTS.find((e) => e.id === eventId);
      if (!event) {
        return { success: false, message: 'Event not found.' };
      }
      storeActions.addEventToHistory(eventId);

      // Apply event-specific effects
      switch (eventId) {
        case 'runic_surge':
          storeActions.addRunicPower(50);
          storeActions.regenerateMana(20);
          break;
        case 'void_incursion':
          storeActions.regenerateMana(-10);
          break;
        case 'glyph_migration':
          storeActions.addArcana(30);
          break;
        case 'ancient_awakening':
          storeActions.addArcaneDepth(25);
          storeActions.addArcana(100);
          break;
        case 'phoenix_rebirth':
          storeActions.addRunicPower(200);
          storeActions.regenerateMana(state.rxMaxMana);
          break;
        case 'merchant_caravan':
          storeActions.addArcana(50);
          break;
        default:
          storeActions.addArcana(20);
          break;
      }

      return {
        success: true,
        message: `Event processed: ${event.name}`,
        event,
      };
    },
    [state, storeActions]
  );

  // ── Computed Stats ──

  const effectiveGlyphPower = useMemo(() => {
    const base = totalEquippedGlyphPower;
    const artifactBonus = totalArtifactPower;
    const titleBonus = activeTitleData?.bonuses.runicPower ?? 0;
    const hasRunicMastery = state.rxUnlockedAbilities.includes('runic_mastery');
    const masteryMultiplier = hasRunicMastery ? 1.15 : 1.0;
    const hasGlyphSynergy = state.rxUnlockedAbilities.includes('glyph_synergy');
    const synergyBonus = hasGlyphSynergy ? uniqueSpeciesEquipped * 0.05 : 0;
    return Math.ceil((base + artifactBonus + titleBonus) * masteryMultiplier * (1 + synergyBonus));
  }, [state, totalEquippedGlyphPower, totalArtifactPower, activeTitleData, uniqueSpeciesEquipped]);

  const maxAchievableLevel = useMemo(() => {
    const titleBonus = activeTitleData?.bonuses.arcana ?? 0;
    return state.rxLevel + Math.floor(titleBonus / 100);
  }, [state, activeTitleData]);

  const discoveryProgress = useMemo(() => {
    return {
      total: RX_GLYPHS.length,
      discovered: state.rxDiscoveredGlyphs.length,
      percentage: Math.round((state.rxDiscoveredGlyphs.length / RX_GLYPHS.length) * 100),
    };
  }, [state]);

  const achievementProgress = useMemo(() => {
    return {
      total: RX_ACHIEVEMENTS.length,
      completed: state.rxCompletedAchievements.length,
      percentage: Math.round((state.rxCompletedAchievements.length / RX_ACHIEVEMENTS.length) * 100),
    };
  }, [state]);

  const arcadeExplorationProgress = useMemo(() => {
    return {
      total: RX_ARCADES.length,
      visited: state.rxVisitedArcades.length,
      percentage: Math.round((state.rxVisitedArcades.length / RX_ARCADES.length) * 100),
    };
  }, [state]);

  const artifactCollectionProgress = useMemo(() => {
    return {
      total: RX_ARTIFACTS.length,
      owned: state.rxOwnedArtifacts.length,
      percentage: Math.round((state.rxOwnedArtifacts.length / RX_ARTIFACTS.length) * 100),
    };
  }, [state]);

  const inventorySummary = useMemo(() => {
    const summary: Record<string, { material: RxMaterial; quantity: number; totalValue: number }[]> = {};
    for (const item of state.rxInventory) {
      const mat = RX_MATERIALS.find((m) => m.id === item.materialId);
      if (!mat) {
        continue;
      }
      const rarity = mat.rarity;
      if (!summary[rarity]) {
        summary[rarity] = [];
      }
      summary[rarity].push({
        material: mat,
        quantity: item.quantity,
        totalValue: mat.baseValue * item.quantity,
      });
    }
    return summary;
  }, [state]);

  const wordScoreMultiplier = useMemo(() => {
    let multiplier = 1.0;
    // Arcade bonus
    multiplier += currentArcadeBonus / 100;
    // Title bonus
    multiplier += (activeTitleData?.bonuses.runicPower ?? 0) / 500;
    // Glyph synergy
    if (state.rxUnlockedAbilities.includes('glyph_synergy')) {
      multiplier += uniqueSpeciesEquipped * 0.05;
    }
    // Structure: radiance beacon bonus
    for (const s of state.rxStructures) {
      if (s.structureId === 'radiance_beacon') {
        multiplier += s.level * 0.03;
      }
    }
    return Math.round(multiplier * 100) / 100;
  }, [state, currentArcadeBonus, activeTitleData, uniqueSpeciesEquipped]);

  const dangerLevel = useMemo(() => {
    if (!state.rxCurrenArcadeId) {
      return 0;
    }
    const arcade = RX_ARCADES.find((a) => a.id === state.rxCurrenArcadeId);
    if (!arcade) {
      return 0;
    }
    let danger = arcade.dangerRating;
    // Void anchor reduction
    for (const s of state.rxStructures) {
      if (s.structureId === 'void_anchor') {
        danger = Math.max(1, danger - s.level * 0.5);
      }
      if (s.structureId === 'earth_bastion') {
        danger = Math.max(1, danger - s.level * 0.3);
      }
    }
    return Math.round(danger * 10) / 10;
  }, [state]);

  // ── Render-ready theme object ──

  const theme = useMemo(() => ({
    arcanePurple: RX_ARCANE_PURPLE,
    runeGold: RX_RUNE_GOLD,
    sigilBlue: RX_SIGIL_BLUE,
    stoneGray: RX_STONE_GRAY,
    darkObsidian: RX_DARK_OBISIDIAN,
    etherealViolet: RX_ETHEREAL_VIOLET,
    emberOrange: RX_EMBER_ORANGE,
    frostWhite: RX_FROST_WHITE,
    voidBlack: RX_VOID_BLACK,
    azureShimmer: RX_AZURE_SHIMMER,
    crimsonRune: RX_CRIMSON_RUNE,
    rarityColors: RX_RARITY_COLORS,
    speciesColors: RX_SPECIES_COLORS,
  }), [state]);

  return {
    // ── Constants ──
    RX_SPECIES,
    RX_SPECIES_LABELS,
    RX_SPECIES_COLORS,
    RX_RARITY,
    RX_RARITY_COLORS,
    RX_RARITY_MULTIPLIER,
    RX_GLYPHS,
    RX_ARCADES,
    RX_MATERIALS,
    RX_STRUCTURES,
    RX_ABILITIES,
    RX_ACHIEVEMENTS,
    RX_TITLES,
    RX_ARTIFACTS,
    RX_EVENTS,

    // ── Theme Colors ──
    RX_ARCANE_PURPLE,
    RX_RUNE_GOLD,
    RX_SIGIL_BLUE,
    RX_STONE_GRAY,
    RX_DARK_OBISIDIAN,
    RX_ETHEREAL_VIOLET,
    RX_EMBER_ORANGE,
    RX_FROST_WHITE,
    RX_VOID_BLACK,
    RX_AZURE_SHIMMER,
    RX_CRIMSON_RUNE,

    // ── State ──
    rxLevel: state.rxLevel,
    rxRunicPower: state.rxRunicPower,
    rxArcaneDepth: state.rxArcaneDepth,
    rxArcana: state.rxArcana,
    rxMana: state.rxMana,
    rxMaxMana: state.rxMaxMana,
    rxCurrenArcadeId: state.rxCurrenArcadeId,
    rxDiscoveredGlyphs: state.rxDiscoveredGlyphs,
    rxEquippedGlyphs: state.rxEquippedGlyphs,
    rxInventory: state.rxInventory,
    rxStructures: state.rxStructures,
    rxUnlockedAbilities: state.rxUnlockedAbilities,
    rxCompletedAchievements: state.rxCompletedAchievements,
    rxActiveTitleId: state.rxActiveTitleId,
    rxOwnedArtifacts: state.rxOwnedArtifacts,
    rxEquippedArtifacts: state.rxEquippedArtifacts,
    rxVisitedArcades: state.rxVisitedArcades,
    rxTotalWordsCompleted: state.rxTotalWordsCompleted,
    rxTotalGlyphsInscribed: state.rxTotalGlyphsInscribed,
    rxEventHistory: state.rxEventHistory,
    rxDeathCount: state.rxDeathCount,
    rxPlayTimeMinutes: state.rxPlayTimeMinutes,

    // ── Derived Data ──
    glyphsByRarity,
    glyphsBySpecies,
    accessibleArcades,
    availableAbilities,
    materialsByRarity,
    structuresByCategory,
    achievementsByCategory,
    eventsByType,
    totalEquippedGlyphPower,
    uniqueSpeciesEquipped,
    activeTitleData,
    totalStructureLevels,
    totalArtifactPower,
    currentArcadeBonus,
    effectiveGlyphPower,
    maxAchievableLevel,
    discoveryProgress,
    achievementProgress,
    arcadeExplorationProgress,
    artifactCollectionProgress,
    inventorySummary,
    wordScoreMultiplier,
    dangerLevel,
    theme,

    // ── Lookup Helpers ──
    getGlyphDetails,
    getArcadeDetails,
    getMaterialDetails,
    getStructureDetails,
    getAbilityDetails,
    getAchievementDetails,
    getArtifactDetails,
    getEventDetails,
    calculateUpgradeCost,
    calculateInscriptionCost,

    // ── Complex Helper Functions ──
    rxInscribeGlyph,
    rxChargeRune,
    rxWalkArcade,
    rxCraftSigil,
    rxUseAbility,
    rxBuildStructure,
    rxUpgradeStructure,
    rxCheckAchievement,
    rxAcquireTitle,
    rxAcquireArtifact,
    rxEquipArtifact,
    rxProcessEvent,

    // ── Store Actions (direct) ──
    setRxLevel: storeActions.setRxLevel,
    addRunicPower: storeActions.addRunicPower,
    addArcaneDepth: storeActions.addArcaneDepth,
    addArcana: storeActions.addArcana,
    spendArcana: storeActions.spendArcana,
    spendMana: storeActions.spendMana,
    regenerateMana: storeActions.regenerateMana,
    setCurrentArcade: storeActions.setCurrentArcade,
    discoverGlyph: storeActions.discoverGlyph,
    equipGlyph: storeActions.equipGlyph,
    unequipGlyph: storeActions.unequipGlyph,
    addInventoryItem: storeActions.addInventoryItem,
    removeInventoryItem: storeActions.removeInventoryItem,
    unlockAbility: storeActions.unlockAbility,
    setActiveTitle: storeActions.setActiveTitle,
    visitArcade: storeActions.visitArcade,
    incrementWordsCompleted: storeActions.incrementWordsCompleted,
    incrementGlyphsInscribed: storeActions.incrementGlyphsInscribed,
    incrementDeathCount: storeActions.incrementDeathCount,
    addPlayTime: storeActions.addPlayTime,
    rxResetProgress: storeActions.rxResetProgress,
  };
}

export default useRuneXyst;
