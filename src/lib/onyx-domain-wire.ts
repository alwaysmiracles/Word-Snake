import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// ============================================================
// Seeded PRNG — mulberry32
// ============================================================

function odAdvanceRng(seed: number): { value: number; nextSeed: number } {
  const s = (seed + 0x6D2B79F5) >>> 0;
  let t = s;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return { value: ((t ^ t >>> 14) >>> 0) / 4294967296, nextSeed: s };
}

function odRollInRange(seed: number, min: number, max: number): { value: number; nextSeed: number } {
  const r = odAdvanceRng(seed);
  return { value: min + Math.floor(r.value * (max - min + 1)), nextSeed: r.nextSeed };
}

function odPickRandom<T>(seed: number, arr: T[]): { item: T; nextSeed: number } {
  if (arr.length === 0) return { item: arr[0] as T, nextSeed: seed };
  const r = odAdvanceRng(seed);
  return { item: arr[Math.floor(r.value * arr.length)], nextSeed: r.nextSeed };
}

// ============================================================
// Color Constants — Onyx Black / Shadow Purple / Abyss Blue / Void Red
// ============================================================

export const OD_COLOR_ONYX_BLACK = '#0A0A0A';
export const OD_COLOR_SHADOW_PURPLE = '#4B0082';
export const OD_COLOR_ABYSS_BLUE = '#00008B';
export const OD_COLOR_VOID_RED = '#8B0000';
export const OD_COLOR_OBSIDIAN_GRAY = '#1C1C1C';
export const OD_COLOR_TWILIGHT_VIOLET = '#2E0854';
export const OD_ALL_COLORS: string[] = [
  OD_COLOR_ONYX_BLACK, OD_COLOR_SHADOW_PURPLE, OD_COLOR_ABYSS_BLUE,
  OD_COLOR_VOID_RED, OD_COLOR_OBSIDIAN_GRAY, OD_COLOR_TWILIGHT_VIOLET,
];

// ============================================================
// Rarity Constants (5 tiers)
// ============================================================

export const OD_RARITY_COMMON = 'common';
export const OD_RARITY_UNCOMMON = 'uncommon';
export const OD_RARITY_RARE = 'rare';
export const OD_RARITY_EPIC = 'epic';
export const OD_RARITY_LEGENDARY = 'legendary';
export const OD_ALL_RARITIES: string[] = [
  OD_RARITY_COMMON, OD_RARITY_UNCOMMON, OD_RARITY_RARE,
  OD_RARITY_EPIC, OD_RARITY_LEGENDARY,
];
export const OD_RARITY_MULTIPLIER: Record<string, number> = {
  [OD_RARITY_COMMON]: 1.0,
  [OD_RARITY_UNCOMMON]: 1.5,
  [OD_RARITY_RARE]: 2.5,
  [OD_RARITY_EPIC]: 4.0,
  [OD_RARITY_LEGENDARY]: 7.0,
};

function odRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    [OD_RARITY_COMMON]: 'Common',
    [OD_RARITY_UNCOMMON]: 'Uncommon',
    [OD_RARITY_RARE]: 'Rare',
    [OD_RARITY_EPIC]: 'Epic',
    [OD_RARITY_LEGENDARY]: 'Legendary',
  };
  return labels[rarity] ?? rarity;
}

// ============================================================
// Shade Type Constants (7 types)
// ============================================================

export const OD_TYPE_VOID_WRAITH = 'void_wraith';
export const OD_TYPE_SHADOW_GOLEM = 'shadow_golem';
export const OD_TYPE_OBSIDIAN_KNIGHT = 'obsidian_knight';
export const OD_TYPE_DARK_SORCERER = 'dark_sorcerer';
export const OD_TYPE_NIGHTMARE_HOUND = 'nightmare_hound';
export const OD_TYPE_PHANTOM_SPY = 'phantom_spy';
export const OD_TYPE_ABYSS_TITAN = 'abyss_titan';
export const OD_ALL_SHADE_TYPES: string[] = [
  OD_TYPE_VOID_WRAITH, OD_TYPE_SHADOW_GOLEM, OD_TYPE_OBSIDIAN_KNIGHT,
  OD_TYPE_DARK_SORCERER, OD_TYPE_NIGHTMARE_HOUND, OD_TYPE_PHANTOM_SPY,
  OD_TYPE_ABYSS_TITAN,
];

// ============================================================
// Shadow Shade Constants (35 shades, 5 rarity tiers × 7 types)
// ============================================================

export const OD_SHADE_WISP_LING = 'wisp_ling';
export const OD_SHADE_DUST_IMP = 'dust_imp';
export const OD_SHADE_VOID_MOTE = 'void_mote';
export const OD_SHADE_STONE_SCRAP = 'stone_scrap';
export const OD_SHADE_SPELL_WEAKLING = 'spell_weakling';
export const OD_SHADE_HOWL_PUP = 'howl_pup';
export const OD_SHADE_GHOST_KITTEN = 'ghost_kitten';
export const OD_SHADE_TITAN_SPARK = 'titan_spark';
export const OD_SHADE_SHADOW_MIDGE = 'shadow_midge';
export const OD_SHADE_CRACK_GOLEM = 'crack_golem';
export const OD_SHADE_WRAITHLING = 'wraithling';
export const OD_SHADE_MIRROR_KNIGHT = 'mirror_knight';
export const OD_SHADE_HEXLING = 'hexling';
export const OD_SHADE_DREAD_PUP = 'dread_pup';
export const OD_SHADE_SHADE_WEAVER = 'shade_weaver';
export const OD_SHADE_GLACIER_TITAN = 'glacier_titan';
export const OD_SHADE_VOID_STALKER = 'void_stalker';
export const OD_SHADE_OBSIDIAN_GUARD = 'obsidian_guard';
export const OD_SHADE_DARK_SENTINEL = 'dark_sentinel';
export const OD_SHADE_CURSE_WEAVER = 'curse_weaver';
export const OD_SHADE_NIGHTMARE_STALKER = 'nightmare_stalker';
export const OD_SHADE_PHANTOM_INFILTRATOR = 'phantom_infiltrator';
export const OD_SHADE_ABYSS_GOLEM = 'abyss_golem';
export const OD_SHADE_VOID_REAPER = 'void_reaper';
export const OD_SHADE_SHADE_JUGGERNAUT = 'shade_juggernaut';
export const OD_SHADE_OBSIDIAN_CHAMPION = 'obsidian_champion';
export const OD_SHADE_SHADOW_ARCHMAGE = 'shadow_archmage';
export const OD_SHADE_HELLHOUND_ALPHA = 'hellhound_alpha';
export const OD_SHADE_PHANTOM_MASTER = 'phantom_master';
export const OD_SHADE_DEEP_ABYSS_TITAN = 'deep_abyss_titan';
export const OD_SHADE_ELDER_WRAITH = 'elder_wraith';
export const OD_SHADE_ONYX_COLOSSUS = 'onyx_colossus';
export const OD_SHADE_OBSIDIAN_SOVEREIGN = 'obsidian_sovereign';
export const OD_SHADE_VOID_EMPEROR = 'void_emperor';
export const OD_SHADE_FENRIR_INCARNATE = 'fenrir_incarnate';
export const OD_SHADE_OMEGA_PHANTOM = 'omega_phantom';
export const OD_SHADE_PRIMORDIAL_TITAN = 'primordial_titan';
export const OD_ALL_SHADES: string[] = [
  OD_SHADE_WISP_LING, OD_SHADE_DUST_IMP, OD_SHADE_VOID_MOTE,
  OD_SHADE_STONE_SCRAP, OD_SHADE_SPELL_WEAKLING, OD_SHADE_HOWL_PUP,
  OD_SHADE_GHOST_KITTEN, OD_SHADE_TITAN_SPARK, OD_SHADE_SHADOW_MIDGE,
  OD_SHADE_CRACK_GOLEM, OD_SHADE_WRAITHLING, OD_SHADE_MIRROR_KNIGHT,
  OD_SHADE_HEXLING, OD_SHADE_DREAD_PUP, OD_SHADE_SHADE_WEAVER,
  OD_SHADE_GLACIER_TITAN, OD_SHADE_VOID_STALKER, OD_SHADE_OBSIDIAN_GUARD,
  OD_SHADE_DARK_SENTINEL, OD_SHADE_CURSE_WEAVER, OD_SHADE_NIGHTMARE_STALKER,
  OD_SHADE_PHANTOM_INFILTRATOR, OD_SHADE_ABYSS_GOLEM, OD_SHADE_VOID_REAPER,
  OD_SHADE_SHADE_JUGGERNAUT, OD_SHADE_OBSIDIAN_CHAMPION,
  OD_SHADE_SHADOW_ARCHMAGE, OD_SHADE_HELLHOUND_ALPHA,
  OD_SHADE_PHANTOM_MASTER, OD_SHADE_DEEP_ABYSS_TITAN,
  OD_SHADE_ELDER_WRAITH, OD_SHADE_ONYX_COLOSSUS,
  OD_SHADE_OBSIDIAN_SOVEREIGN, OD_SHADE_VOID_EMPEROR,
  OD_SHADE_FENRIR_INCARNATE, OD_SHADE_OMEGA_PHANTOM,
  OD_SHADE_PRIMORDIAL_TITAN,
];

// ============================================================
// Realm Location Constants (8 realms)
// ============================================================

export const OD_REALM_VOID_GATE = 'void_gate';
export const OD_REALM_SHADOW_CITADEL = 'shadow_citadel';
export const OD_REALM_OBSIDIAN_THRONE = 'obsidian_throne';
export const OD_REALM_DARK_ARCHIVE = 'dark_archive';
export const OD_REALM_NIGHTMARE_PITS = 'nightmare_pits';
export const OD_REALM_PHANTOM_WARRENS = 'phantom_warrens';
export const OD_REALM_ABYSS_DEPTH = 'abyss_depth';
export const OD_REALM_ONYX_NEXUS = 'onyx_nexus';
export const OD_ALL_REALMS: string[] = [
  OD_REALM_VOID_GATE, OD_REALM_SHADOW_CITADEL, OD_REALM_OBSIDIAN_THRONE,
  OD_REALM_DARK_ARCHIVE, OD_REALM_NIGHTMARE_PITS, OD_REALM_PHANTOM_WARRENS,
  OD_REALM_ABYSS_DEPTH, OD_REALM_ONYX_NEXUS,
];

// ============================================================
// Material Constants (30 shadow/obsidian materials)
// ============================================================

export const OD_MAT_SHADOW_DUST = 'shadow_dust';
export const OD_MAT_VOID_ESSENCE = 'void_essence';
export const OD_MAT_OBSIDIAN_SHARD = 'obsidian_shard';
export const OD_MAT_DARK_CRYSTAL = 'dark_crystal';
export const OD_MAT_NIGHTMARE_EMBER = 'nightmare_ember';
export const OD_MAT_PHANTOM_SILK = 'phantom_silk';
export const OD_MAT_ABYSS_SALT = 'abyss_salt';
export const OD_MAT_SHADE_BONE = 'shade_bone';
export const OD_MAT_WRAITH_TEARS = 'wraith_tears';
export const OD_MAT_GOLEM_CORE = 'golem_core';
export const OD_MAT_KNIGHT_PLATING = 'knight_plating';
export const OD_MAT_SORCERER_INK = 'sorcerer_ink';
export const OD_MAT_HOUND_FANG = 'hound_fang';
export const OD_MAT_SPY_LENS = 'spy_lens';
export const OD_MAT_TITAN_MARROW = 'titan_marrow';
export const OD_MAT_VOID_HEARTSTONE = 'void_heartstone';
export const OD_MAT_ONYX_BLOOD = 'onyx_blood';
export const OD_MAT_ECLIPSE_GLASS = 'eclipse_glass';
export const OD_MAT_SHADOWROOT = 'shadowroot';
export const OD_MAT_ABYSSAL_IRON = 'abyssal_iron';
export const OD_MAT_DUSK_MOSS = 'dusk_moss';
export const OD_MAT_PHANTOM_CHAIN = 'phantom_chain_link';
export const OD_MAT_OBSIDIAN_BLADE = 'obsidian_blade';
export const OD_MAT_NIGHTFALL_NECTAR = 'nightfall_nectar';
export const OD_MAT_DARK_MATTER = 'dark_matter';
export const OD_MAT_ELDRITCH_RUNE = 'eldritch_rune';
export const OD_MAT_ABYSS_PEARL = 'abyss_pearl';
export const OD_MAT_SHADOWFIRE_COAL = 'shadowfire_coal';
export const OD_MAT_VOIDCRAFT_INGOT = 'voidcraft_ingot';
export const OD_MAT_PRIMORDIAL_ASH = 'primordial_ash';
export const OD_ALL_MATERIALS: string[] = [
  OD_MAT_SHADOW_DUST, OD_MAT_VOID_ESSENCE, OD_MAT_OBSIDIAN_SHARD,
  OD_MAT_DARK_CRYSTAL, OD_MAT_NIGHTMARE_EMBER, OD_MAT_PHANTOM_SILK,
  OD_MAT_ABYSS_SALT, OD_MAT_SHADE_BONE, OD_MAT_WRAITH_TEARS,
  OD_MAT_GOLEM_CORE, OD_MAT_KNIGHT_PLATING, OD_MAT_SORCERER_INK,
  OD_MAT_HOUND_FANG, OD_MAT_SPY_LENS, OD_MAT_TITAN_MARROW,
  OD_MAT_VOID_HEARTSTONE, OD_MAT_ONYX_BLOOD, OD_MAT_ECLIPSE_GLASS,
  OD_MAT_SHADOWROOT, OD_MAT_ABYSSAL_IRON, OD_MAT_DUSK_MOSS,
  OD_MAT_PHANTOM_CHAIN, OD_MAT_OBSIDIAN_BLADE, OD_MAT_NIGHTFALL_NECTAR,
  OD_MAT_DARK_MATTER, OD_MAT_ELDRITCH_RUNE, OD_MAT_ABYSS_PEARL,
  OD_MAT_SHADOWFIRE_COAL, OD_MAT_VOIDCRAFT_INGOT, OD_MAT_PRIMORDIAL_ASH,
];

// ============================================================
// Structure Constants (25 domain structures)
// ============================================================

export const OD_STRUCT_SHADOW_ALTAR = 'shadow_altar';
export const OD_STRUCT_VOID_WELL = 'void_well';
export const OD_STRUCT_OBSIDIAN_WALL = 'obsidian_wall';
export const OD_STRUCT_DARK_TOWER = 'dark_tower';
export const OD_STRUCT_NIGHTMARE_DEN = 'nightmare_den';
export const OD_STRUCT_PHANTOM_GATE = 'phantom_gate';
export const OD_STRUCT_ABYSS_FORGE = 'abyss_forge';
export const OD_STRUCT_ONYX_KEEP = 'onyx_keep';
export const OD_STRUCT_SHADE_BARRACKS = 'shade_barracks';
export const OD_STRUCT_SHADOW_LIBRARY = 'shadow_library';
export const OD_STRUCT_DARK_WORKSHOP = 'dark_workshop';
export const OD_STRUCT_OBSIDIAN_ANVIL = 'obsidian_anvil';
export const OD_STRUCT_NIGHTMARE_ARENA = 'nightmare_arena';
export const OD_STRUCT_PHANTOM_VAULT = 'phantom_vault';
export const OD_STRUCT_ABYSS_LAB = 'abyss_lab';
export const OD_STRUCT_ONYX_OBELISK = 'onyx_obelisk';
export const OD_STRUCT_WRAITH_TOWER = 'wraith_tower';
export const OD_STRUCT_GOLEM_FACTORY = 'golem_factory';
export const OD_STRUCT_KNIGHT_HALL = 'knight_hall';
export const OD_STRUCT_SORCERER_CIRCLE = 'sorcerer_circle';
export const OD_STRUCT_HOUND_KENNEL = 'hound_kennel';
export const OD_STRUCT_SPY_NETWORK = 'spy_network';
export const OD_STRUCT_TITAN_CRADLE = 'titan_cradle';
export const OD_STRUCT_SHADOW_THRONE = 'shadow_throne';
export const OD_STRUCT_DOMAIN_CORE = 'domain_core';
export const OD_ALL_STRUCTURES: string[] = [
  OD_STRUCT_SHADOW_ALTAR, OD_STRUCT_VOID_WELL, OD_STRUCT_OBSIDIAN_WALL,
  OD_STRUCT_DARK_TOWER, OD_STRUCT_NIGHTMARE_DEN, OD_STRUCT_PHANTOM_GATE,
  OD_STRUCT_ABYSS_FORGE, OD_STRUCT_ONYX_KEEP, OD_STRUCT_SHADE_BARRACKS,
  OD_STRUCT_SHADOW_LIBRARY, OD_STRUCT_DARK_WORKSHOP, OD_STRUCT_OBSIDIAN_ANVIL,
  OD_STRUCT_NIGHTMARE_ARENA, OD_STRUCT_PHANTOM_VAULT, OD_STRUCT_ABYSS_LAB,
  OD_STRUCT_ONYX_OBELISK, OD_STRUCT_WRAITH_TOWER, OD_STRUCT_GOLEM_FACTORY,
  OD_STRUCT_KNIGHT_HALL, OD_STRUCT_SORCERER_CIRCLE, OD_STRUCT_HOUND_KENNEL,
  OD_STRUCT_SPY_NETWORK, OD_STRUCT_TITAN_CRADLE, OD_STRUCT_SHADOW_THRONE,
  OD_STRUCT_DOMAIN_CORE,
];

// ============================================================
// Ability Constants (22 shadow abilities)
// ============================================================

export const OD_ABILITY_SHADOW_STRIKE = 'shadow_strike';
export const OD_ABILITY_VOID_STEP = 'void_step';
export const OD_ABILITY_OBSIDIAN_SHIELD = 'obsidian_shield';
export const OD_ABILITY_DARK_BOLT = 'dark_bolt';
export const OD_ABILITY_NIGHTMARE_HOWL = 'nightmare_howl';
export const OD_ABILITY_PHANTOM_CLOAK = 'phantom_cloak';
export const OD_ABILITY_ABYSS_CRUSH = 'abyss_crush';
export const OD_ABILITY_ONYX_SURGE = 'onyx_surge';
export const OD_ABILITY_WRAITH_SCREAM = 'wraith_scream';
export const OD_ABILITY_GOLEM_RUSH = 'golem_rush';
export const OD_ABILITY_KNIGHT_CHARGE = 'knight_charge';
export const OD_ABILITY_HEX_BLAST = 'hex_blast';
export const OD_ABILITY_HOUND_TRAIL = 'hound_trail';
export const OD_ABILITY_SPY_INFILTRATE = 'spy_infiltrate';
export const OD_ABILITY_TITAN_STOMP = 'titan_stomp';
export const OD_ABILITY_SHADOW_MEND = 'shadow_mend';
export const OD_ABILITY_VOID_LEECH = 'void_leech';
export const OD_ABILITY_OBSIDIAN_BLADE_DANCE = 'obsidian_blade_dance';
export const OD_ABILITY_DARK_RITUAL = 'dark_ritual';
export const OD_ABILITY_NIGHTMARE_FRENZY = 'nightmare_frenzy';
export const OD_ABILITY_PHANTOM_ARMY = 'phantom_army';
export const OD_ABILITY_ABYSS_DEVOUR = 'abyss_devour';
export const OD_ALL_ABILITIES: string[] = [
  OD_ABILITY_SHADOW_STRIKE, OD_ABILITY_VOID_STEP, OD_ABILITY_OBSIDIAN_SHIELD,
  OD_ABILITY_DARK_BOLT, OD_ABILITY_NIGHTMARE_HOWL, OD_ABILITY_PHANTOM_CLOAK,
  OD_ABILITY_ABYSS_CRUSH, OD_ABILITY_ONYX_SURGE, OD_ABILITY_WRAITH_SCREAM,
  OD_ABILITY_GOLEM_RUSH, OD_ABILITY_KNIGHT_CHARGE, OD_ABILITY_HEX_BLAST,
  OD_ABILITY_HOUND_TRAIL, OD_ABILITY_SPY_INFILTRATE, OD_ABILITY_TITAN_STOMP,
  OD_ABILITY_SHADOW_MEND, OD_ABILITY_VOID_LEECH, OD_ABILITY_OBSIDIAN_BLADE_DANCE,
  OD_ABILITY_DARK_RITUAL, OD_ABILITY_NIGHTMARE_FRENZY, OD_ABILITY_PHANTOM_ARMY,
  OD_ABILITY_ABYSS_DEVOUR,
];

// ============================================================
// Achievement Constants (18 achievements)
// ============================================================

export const OD_ACHIEVEMENT_FIRST_BINDING = 'first_binding';
export const OD_ACHIEVEMENT_SHADE_COLLECTOR = 'shade_collector';
export const OD_ACHIEVEMENT_REALM_CORRUPTOR = 'realm_corruptor';
export const OD_ACHIEVEMENT_MASTER_BUILDER = 'master_builder';
export const OD_ACHIEVEMENT_ARTIFACT_HUNTER = 'artifact_hunter';
export const OD_ACHIEVEMENT_MATERIAL_HOARDER = 'material_hoarder';
export const OD_ACHIEVEMENT_DARK_SCHOLAR = 'dark_scholar';
export const OD_ACHIEVEMENT_EVENT_SURVIVOR = 'event_survivor';
export const OD_ACHIEVEMENT_TITAN_TAMER = 'titan_tamer';
export const OD_ACHIEVEMENT_LEGENDARY_BINDER = 'legendary_binder';
export const OD_ACHIEVEMENT_FULL_CORRUPTION = 'full_corruption';
export const OD_ACHIEVEMENT_STRUCTURE_MOGUL = 'structure_mogul';
export const OD_ACHIEVEMENT_ABILITY_MASTER = 'ability_master';
export const OD_ACHIEVEMENT_NIGHTMARE_LORD = 'nightmare_lord_ach';
export const OD_ACHIEVEMENT_ALL_SHADES_BOUND = 'all_shades_bound';
export const OD_ACHIEVEMENT_ONYX_COMPLETE = 'onyx_complete';
export const OD_ACHIEVEMENT_DOMINION = 'dominion';
export const OD_ACHIEVEMENT_PRIMORDIAL = 'primordial_ach';
export const OD_ALL_ACHIEVEMENTS: string[] = [
  OD_ACHIEVEMENT_FIRST_BINDING, OD_ACHIEVEMENT_SHADE_COLLECTOR,
  OD_ACHIEVEMENT_REALM_CORRUPTOR, OD_ACHIEVEMENT_MASTER_BUILDER,
  OD_ACHIEVEMENT_ARTIFACT_HUNTER, OD_ACHIEVEMENT_MATERIAL_HOARDER,
  OD_ACHIEVEMENT_DARK_SCHOLAR, OD_ACHIEVEMENT_EVENT_SURVIVOR,
  OD_ACHIEVEMENT_TITAN_TAMER, OD_ACHIEVEMENT_LEGENDARY_BINDER,
  OD_ACHIEVEMENT_FULL_CORRUPTION, OD_ACHIEVEMENT_STRUCTURE_MOGUL,
  OD_ACHIEVEMENT_ABILITY_MASTER, OD_ACHIEVEMENT_NIGHTMARE_LORD,
  OD_ACHIEVEMENT_ALL_SHADES_BOUND, OD_ACHIEVEMENT_ONYX_COMPLETE,
  OD_ACHIEVEMENT_DOMINION, OD_ACHIEVEMENT_PRIMORDIAL,
];

// ============================================================
// Title Constants (8 progression titles)
// ============================================================

export const OD_TITLE_SHADOW_INITIATE = 'Shadow Initiate';
export const OD_TITLE_VOID_WALKER = 'Void Walker';
export const OD_TITLE_OBSIDIAN_KNIGHT_TITLE = 'Obsidian Knight';
export const OD_TITLE_DARK_COMMANDER = 'Dark Commander';
export const OD_TITLE_NIGHTMARE_OVERSEER = 'Nightmare Overseer';
export const OD_TITLE_PHANTOM_SOVEREIGN = 'Phantom Sovereign';
export const OD_TITLE_ABYSS_WARDEN = 'Abyss Warden';
export const OD_TITLE_ONYX_EMPEROR = 'Onyx Emperor';
export const OD_ALL_TITLES: string[] = [
  OD_TITLE_SHADOW_INITIATE, OD_TITLE_VOID_WALKER, OD_TITLE_OBSIDIAN_KNIGHT_TITLE,
  OD_TITLE_DARK_COMMANDER, OD_TITLE_NIGHTMARE_OVERSEER, OD_TITLE_PHANTOM_SOVEREIGN,
  OD_TITLE_ABYSS_WARDEN, OD_TITLE_ONYX_EMPEROR,
];

// ============================================================
// Artifact Constants (15 legendary onyx artifacts)
// ============================================================

export const OD_ARTIFACT_ONYX_CROWN = 'onyx_crown';
export const OD_ARTIFACT_VOID_AMULET = 'void_amulet';
export const OD_ARTIFACT_SHADOWBLADE = 'shadowblade';
export const OD_ARTIFACT_OBSIDIAN_ORB = 'obsidian_orb';
export const OD_ARTIFACT_NIGHTMARE_HEART = 'nightmare_heart';
export const OD_ARTIFACT_PHANTOM_CLOAK_ART = 'phantom_cloak_art';
export const OD_ARTIFACT_ABYSS_KEY = 'abyss_key';
export const OD_ARTIFACT_ONYX_SCEPTER = 'onyx_scepter';
export const OD_ARTIFACT_DARK_MIRROR = 'dark_mirror';
export const OD_ARTIFACT_WRAITH_MASK = 'wraith_mask';
export const OD_ARTIFACT_SHADE_RING = 'shade_ring';
export const OD_ARTIFACT_GOLEM_GAUNTLET = 'golem_gauntlet';
export const OD_ARTIFACT_KNIGHT_CREST = 'knight_crest';
export const OD_ARTIFACT_SORCERER_GRIMOIRE = 'sorcerer_grimoire';
export const OD_ARTIFACT_TITAN_HAMMER = 'titan_hammer';
export const OD_ALL_ARTIFACTS: string[] = [
  OD_ARTIFACT_ONYX_CROWN, OD_ARTIFACT_VOID_AMULET, OD_ARTIFACT_SHADOWBLADE,
  OD_ARTIFACT_OBSIDIAN_ORB, OD_ARTIFACT_NIGHTMARE_HEART, OD_ARTIFACT_PHANTOM_CLOAK_ART,
  OD_ARTIFACT_ABYSS_KEY, OD_ARTIFACT_ONYX_SCEPTER, OD_ARTIFACT_DARK_MIRROR,
  OD_ARTIFACT_WRAITH_MASK, OD_ARTIFACT_SHADE_RING, OD_ARTIFACT_GOLEM_GAUNTLET,
  OD_ARTIFACT_KNIGHT_CREST, OD_ARTIFACT_SORCERER_GRIMOIRE, OD_ARTIFACT_TITAN_HAMMER,
];

// ============================================================
// Event Constants (12 random domain events)
// ============================================================

export const OD_EVENT_VOID_RIFT = 'void_rift';
export const OD_EVENT_SHADOW_SURGE = 'shadow_surge';
export const OD_EVENT_NIGHTMARE_INVASION = 'nightmare_invasion';
export const OD_EVENT_PHANTOM_REBELLION = 'phantom_rebellion';
export const OD_EVENT_ABYSS_QUAKE = 'abyss_quake';
export const OD_EVENT_ONYX_ECLIPSE = 'onyx_eclipse';
export const OD_EVENT_DARK_COMET = 'dark_comet';
export const OD_EVENT_WRAITH_STORM = 'wraith_storm';
export const OD_EVENT_GOLEM_UPRISING = 'golem_uprising';
export const OD_EVENT_SORCERER_PACT = 'sorcerer_pact';
export const OD_EVENT_HOUND_MIGRATION = 'hound_migration';
export const OD_EVENT_TITAN_AWAKENING = 'titan_awakening';
export const OD_ALL_EVENTS: string[] = [
  OD_EVENT_VOID_RIFT, OD_EVENT_SHADOW_SURGE, OD_EVENT_NIGHTMARE_INVASION,
  OD_EVENT_PHANTOM_REBELLION, OD_EVENT_ABYSS_QUAKE, OD_EVENT_ONYX_ECLIPSE,
  OD_EVENT_DARK_COMET, OD_EVENT_WRAITH_STORM, OD_EVENT_GOLEM_UPRISING,
  OD_EVENT_SORCERER_PACT, OD_EVENT_HOUND_MIGRATION, OD_EVENT_TITAN_AWAKENING,
];

// ============================================================
// Interfaces
// ============================================================

export interface OdShadeData {
  name: string;
  shadeType: string;
  rarity: string;
  power: number;
  defense: number;
  speed: number;
  description: string;
  bindCost: number;
  xpReward: number;
}

export interface OdRealmData {
  name: string;
  level: number;
  description: string;
  resources: string[];
  capacity: number;
  ambientColor: string;
  shadePool: string[];
}

export interface OdMaterialData {
  name: string;
  rarity: string;
  description: string;
  stackLimit: number;
}

export interface OdStructureData {
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  powerPerLevel: number;
  abilityUnlock: string | null;
}

export interface OdAbilityData {
  name: string;
  type: string;
  power: number;
  cooldown: number;
  description: string;
}

export interface OdAchievementData {
  name: string;
  description: string;
  checkFn: string;
}

export interface OdArtifactData {
  name: string;
  description: string;
  power: number;
  rarity: string;
}

export interface OdEventData {
  name: string;
  description: string;
  duration: number;
  shadeBoost: number;
  rewardMultiplier: number;
}

export interface ShadeState {
  bound: boolean;
  level: number;
  xp: number;
  bondStrength: number;
}

export interface RealmState {
  corrupted: boolean;
  corruptionLevel: number;
  maxCorruption: number;
  structures: Record<string, number>;
}

export interface InventoryItem {
  materialId: string;
  quantity: number;
}

export interface OnyxDomainState {
  rngSeed: number;
  level: number;
  experience: number;
  odTitle: string;
  odShades: Record<string, ShadeState>;
  odRealms: Record<string, RealmState>;
  odInventory: InventoryItem[];
  odArtifacts: string[];
  odAchievements: string[];
  odTitle: string;
  odEvents: string[];
  odStats: {
    totalBound: number;
    totalCorrupted: number;
    totalBuilt: number;
    totalActivated: number;
    totalEventsTriggered: number;
    totalMaterialsCollected: number;
    totalXpGained: number;
  };
  structureLevels: Record<string, number>;
  activeEventId: string | null;
  eventEndTime: number | null;
  realmLog: string[];
}

// ============================================================
// Shade Data (35 shades)
// ============================================================

const OD_SHADE_DATA: Record<string, OdShadeData> = {
  [OD_SHADE_WISP_LING]: { name: 'Wisp-Ling', shadeType: OD_TYPE_VOID_WRAITH, rarity: OD_RARITY_COMMON, power: 8, defense: 3, speed: 12, description: 'A fragile wisp of void energy that flickers at the edges of darkness.', bindCost: 15, xpReward: 10 },
  [OD_SHADE_DUST_IMP]: { name: 'Dust Imp', shadeType: OD_TYPE_SHADOW_GOLEM, rarity: OD_RARITY_COMMON, power: 10, defense: 8, speed: 5, description: 'A tiny golem formed from compressed shadow dust, surprisingly sturdy.', bindCost: 18, xpReward: 12 },
  [OD_SHADE_VOID_MOTE]: { name: 'Void Mote', shadeType: OD_TYPE_OBSIDIAN_KNIGHT, rarity: OD_RARITY_COMMON, power: 12, defense: 6, speed: 7, description: 'A speck of obsidian-hardened void that orbits its master protectively.', bindCost: 20, xpReward: 13 },
  [OD_SHADE_SPELL_WEAKLING]: { name: 'Spell Weakling', shadeType: OD_TYPE_DARK_SORCERER, rarity: OD_RARITY_COMMON, power: 14, defense: 2, speed: 10, description: 'An apprentice sorcerer of darkness, barely able to conjure a spark.', bindCost: 16, xpReward: 11 },
  [OD_SHADE_HOWL_PUP]: { name: 'Howl Pup', shadeType: OD_TYPE_NIGHTMARE_HOUND, rarity: OD_RARITY_COMMON, power: 9, defense: 5, speed: 14, description: 'A nightmare pup whose yips echo with dread across the void.', bindCost: 17, xpReward: 11 },
  [OD_SHADE_GHOST_KITTEN]: { name: 'Ghost Kitten', shadeType: OD_TYPE_PHANTOM_SPY, rarity: OD_RARITY_COMMON, power: 5, defense: 4, speed: 16, description: 'A translucent kitten that phases through walls to steal secrets.', bindCost: 14, xpReward: 9 },
  [OD_SHADE_TITAN_SPARK]: { name: 'Titan Spark', shadeType: OD_TYPE_ABYSS_TITAN, rarity: OD_RARITY_COMMON, power: 15, defense: 10, speed: 2, description: 'A tiny fragment of abyssal titan essence, heavy and immovable.', bindCost: 22, xpReward: 14 },
  [OD_SHADE_SHADOW_MIDGE]: { name: 'Shadow Midge', shadeType: OD_TYPE_VOID_WRAITH, rarity: OD_RARITY_COMMON, power: 7, defense: 4, speed: 15, description: 'A swarm-like wraith that disperses and reforms endlessly.', bindCost: 13, xpReward: 9 },
  [OD_SHADE_CRACK_GOLEM]: { name: 'Crack Golem', shadeType: OD_TYPE_SHADOW_GOLEM, rarity: OD_RARITY_COMMON, power: 11, defense: 9, speed: 4, description: 'A crude automaton of cracked stone and shadow mortar.', bindCost: 19, xpReward: 12 },
  [OD_SHADE_WRAITHLING]: { name: 'Wraithling', shadeType: OD_TYPE_VOID_WRAITH, rarity: OD_RARITY_UNCOMMON, power: 28, defense: 10, speed: 18, description: 'A restless wraith that drifts between the void and reality, sapping willpower.', bindCost: 80, xpReward: 35 },
  [OD_SHADE_MIRROR_KNIGHT]: { name: 'Mirror Knight', shadeType: OD_TYPE_OBSIDIAN_KNIGHT, rarity: OD_RARITY_UNCOMMON, power: 35, defense: 28, speed: 8, description: 'An armored specter whose shield reflects dark magic back at attackers.', bindCost: 100, xpReward: 42 },
  [OD_SHADE_HEXLING]: { name: 'Hexling', shadeType: OD_TYPE_DARK_SORCERER, rarity: OD_RARITY_UNCOMMON, power: 32, defense: 8, speed: 14, description: 'A mischievous sorcerer that inflicts hexes with a flick of its wand.', bindCost: 90, xpReward: 38 },
  [OD_SHADE_DREAD_PUP]: { name: 'Dread Pup', shadeType: OD_TYPE_NIGHTMARE_HOUND, rarity: OD_RARITY_UNCOMMON, power: 26, defense: 15, speed: 22, description: 'A larger nightmare hound whose howl induces paralysis in prey.', bindCost: 85, xpReward: 36 },
  [OD_SHADE_SHADE_WEAVER]: { name: 'Shade Weaver', shadeType: OD_TYPE_PHANTOM_SPY, rarity: OD_RARITY_UNCOMMON, power: 20, defense: 12, speed: 24, description: 'A phantom artisan that weaves cloaks of invisibility from pure shadow.', bindCost: 75, xpReward: 32 },
  [OD_SHADE_GLACIER_TITAN]: { name: 'Glacier Titan', shadeType: OD_TYPE_ABYSS_TITAN, rarity: OD_RARITY_UNCOMMON, power: 40, defense: 35, speed: 3, description: 'A slow-moving titan of frozen abyssal energy that freezes all in its path.', bindCost: 120, xpReward: 50 },
  [OD_SHADE_VOID_STALKER]: { name: 'Void Stalker', shadeType: OD_TYPE_VOID_WRAITH, rarity: OD_RARITY_RARE, power: 65, defense: 25, speed: 28, description: 'A silent predator that exists partially in the void, striking from nowhere.', bindCost: 350, xpReward: 90 },
  [OD_SHADE_OBSIDIAN_GUARD]: { name: 'Obsidian Guard', shadeType: OD_TYPE_OBSIDIAN_KNIGHT, rarity: OD_RARITY_RARE, power: 72, defense: 65, speed: 10, description: 'An elite knight encased in volcanic obsidian, nearly impervious to damage.', bindCost: 400, xpReward: 100 },
  [OD_SHADE_DARK_SENTINEL]: { name: 'Dark Sentinel', shadeType: OD_TYPE_DARK_SORCERER, rarity: OD_RARITY_RARE, power: 68, defense: 30, speed: 15, description: 'A sorcerer-warrior who channels dark magic through a crystalline staff.', bindCost: 380, xpReward: 95 },
  [OD_SHADE_NIGHTMARE_STALKER]: { name: 'Nightmare Stalker', shadeType: OD_TYPE_NIGHTMARE_HOUND, rarity: OD_RARITY_RARE, power: 60, defense: 35, speed: 35, description: 'A massive hound that hunts in nightmares, leaving trails of dread.', bindCost: 360, xpReward: 88 },
  [OD_SHADE_PHANTOM_INFILTRATOR]: { name: 'Phantom Infiltrator', shadeType: OD_TYPE_PHANTOM_SPY, rarity: OD_RARITY_RARE, power: 45, defense: 20, speed: 40, description: 'A master spy that can assume any form and walk through any barrier.', bindCost: 320, xpReward: 82 },
  [OD_SHADE_ABYSS_GOLEM]: { name: 'Abyss Golem', shadeType: OD_TYPE_SHADOW_GOLEM, rarity: OD_RARITY_RARE, power: 70, defense: 70, speed: 5, description: 'A towering golem constructed from abyssal iron and shadow stone.', bindCost: 420, xpReward: 105 },
  [OD_SHADE_VOID_REAPER]: { name: 'Void Reaper', shadeType: OD_TYPE_VOID_WRAITH, rarity: OD_RARITY_EPIC, power: 140, defense: 55, speed: 30, description: 'An ancient wraith that harvests souls from the void, growing stronger with each.', bindCost: 1200, xpReward: 250 },
  [OD_SHADE_SHADE_JUGGERNAUT]: { name: 'Shade Juggernaut', shadeType: OD_TYPE_SHADOW_GOLEM, rarity: OD_RARITY_EPIC, power: 160, defense: 130, speed: 8, description: 'An unstoppable golem of pure compressed shadow that flattens all opposition.', bindCost: 1400, xpReward: 280 },
  [OD_SHADE_OBSIDIAN_CHAMPION]: { name: 'Obsidian Champion', shadeType: OD_TYPE_OBSIDIAN_KNIGHT, rarity: OD_RARITY_EPIC, power: 150, defense: 120, speed: 15, description: 'The greatest obsidian knight, wielding a blade sharper than diamond.', bindCost: 1350, xpReward: 270 },
  [OD_SHADE_SHADOW_ARCHMAGE]: { name: 'Shadow Archmage', shadeType: OD_TYPE_DARK_SORCERER, rarity: OD_RARITY_EPIC, power: 145, defense: 50, speed: 20, description: 'A sorcerer of immense power who commands shadow magic like a symphony.', bindCost: 1300, xpReward: 260 },
  [OD_SHADE_HELLHOUND_ALPHA]: { name: 'Hellhound Alpha', shadeType: OD_TYPE_NIGHTMARE_HOUND, rarity: OD_RARITY_EPIC, power: 135, defense: 60, speed: 42, description: 'The alpha of all nightmare hounds, whose flames burn the very fabric of dreams.', bindCost: 1250, xpReward: 245 },
  [OD_SHADE_PHANTOM_MASTER]: { name: 'Phantom Master', shadeType: OD_TYPE_PHANTOM_SPY, rarity: OD_RARITY_EPIC, power: 120, defense: 45, speed: 50, description: 'The ultimate phantom spy, invisible even to other shades and wraiths.', bindCost: 1100, xpReward: 230 },
  [OD_SHADE_DEEP_ABYSS_TITAN]: { name: 'Deep Abyss Titan', shadeType: OD_TYPE_ABYSS_TITAN, rarity: OD_RARITY_EPIC, power: 170, defense: 150, speed: 4, description: 'A titan pulled from the deepest abyss, a walking cataclysm of darkness.', bindCost: 1500, xpReward: 300 },
  [OD_SHADE_ELDER_WRAITH]: { name: 'Elder Wraith', shadeType: OD_TYPE_VOID_WRAITH, rarity: OD_RARITY_LEGENDARY, power: 300, defense: 100, speed: 35, description: 'An ancient wraith that has existed since the first shadow was cast.', bindCost: 5000, xpReward: 700 },
  [OD_SHADE_ONYX_COLOSSUS]: { name: 'Onyx Colossus', shadeType: OD_TYPE_SHADOW_GOLEM, rarity: OD_RARITY_LEGENDARY, power: 350, defense: 300, speed: 5, description: 'A colossus of pure onyx that towers over battlefields, an unbreakable fortress.', bindCost: 6000, xpReward: 800 },
  [OD_SHADE_OBSIDIAN_SOVEREIGN]: { name: 'Obsidian Sovereign', shadeType: OD_TYPE_OBSIDIAN_KNIGHT, rarity: OD_RARITY_LEGENDARY, power: 320, defense: 250, speed: 18, description: 'The king of all obsidian knights, their blades forged in the heart of a dying star.', bindCost: 5500, xpReward: 750 },
  [OD_SHADE_VOID_EMPEROR]: { name: 'Void Emperor', shadeType: OD_TYPE_DARK_SORCERER, rarity: OD_RARITY_LEGENDARY, power: 340, defense: 120, speed: 25, description: 'A sorcerer who has mastered the void itself, bending reality to their will.', bindCost: 5800, xpReward: 780 },
  [OD_SHADE_FENRIR_INCARNATE]: { name: 'Fenrir Incarnate', shadeType: OD_TYPE_NIGHTMARE_HOUND, rarity: OD_RARITY_LEGENDARY, power: 310, defense: 140, speed: 55, description: 'The legendary hound of nightmares, destined to devour the cosmos.', bindCost: 5200, xpReward: 720 },
  [OD_SHADE_OMEGA_PHANTOM]: { name: 'Omega Phantom', shadeType: OD_TYPE_PHANTOM_SPY, rarity: OD_RARITY_LEGENDARY, power: 280, defense: 80, speed: 60, description: 'The original phantom, a being of pure deception that exists everywhere at once.', bindCost: 4800, xpReward: 680 },
  [OD_SHADE_PRIMORDIAL_TITAN]: { name: 'Primordial Titan', shadeType: OD_TYPE_ABYSS_TITAN, rarity: OD_RARITY_LEGENDARY, power: 400, defense: 350, speed: 3, description: 'The first titan, born from the abyss before time itself, carrying the weight of epochs.', bindCost: 7000, xpReward: 1000 },
};

// ============================================================
// Realm Data (8 realms)
// ============================================================

const OD_REALM_DATA: Record<string, OdRealmData> = {
  [OD_REALM_VOID_GATE]: {
    name: 'Void Gate',
    level: 1,
    description: 'The threshold between the mortal world and the Onyx Domain. A swirling vortex of shadows serves as the entry point for all who seek power.',
    resources: [OD_MAT_SHADOW_DUST, OD_MAT_VOID_ESSENCE, OD_MAT_SHADE_BONE],
    capacity: 10,
    ambientColor: OD_COLOR_SHADOW_PURPLE,
    shadePool: [OD_SHADE_WISP_LING, OD_SHADE_DUST_IMP, OD_SHADE_VOID_MOTE, OD_SHADE_SPELL_WEAKLING, OD_SHADE_HOWL_PUP, OD_SHADE_GHOST_KITTEN, OD_SHADE_TITAN_SPARK, OD_SHADE_SHADOW_MIDGE, OD_SHADE_CRACK_GOLEM],
  },
  [OD_REALM_SHADOW_CITADEL]: {
    name: 'Shadow Citadel',
    level: 5,
    description: 'A fortress woven from living shadow where lesser shades congregate. Its walls shift and reshape constantly, disorienting intruders.',
    resources: [OD_MAT_DARK_CRYSTAL, OD_MAT_PHANTOM_SILK, OD_MAT_WRAITH_TEARS],
    capacity: 15,
    ambientColor: OD_COLOR_OBSIDIAN_GRAY,
    shadePool: [OD_SHADE_WRAITHLING, OD_SHADE_MIRROR_KNIGHT, OD_SHADE_HEXLING, OD_SHADE_DREAD_PUP, OD_SHADE_SHADE_WEAVER, OD_SHADE_GLACIER_TITAN],
  },
  [OD_REALM_OBSIDIAN_THRONE]: {
    name: 'Obsidian Throne',
    level: 12,
    description: 'A grand hall carved from a single massive obsidian formation. The seat of knightly power within the Onyx Domain.',
    resources: [OD_MAT_OBSIDIAN_SHARD, OD_MAT_KNIGHT_PLATING, OD_MAT_OBSIDIAN_BLADE],
    capacity: 18,
    ambientColor: OD_COLOR_ONYX_BLACK,
    shadePool: [OD_SHADE_VOID_STALKER, OD_SHADE_OBSIDIAN_GUARD, OD_SHADE_DARK_SENTINEL, OD_SHADE_ABYSS_GOLEM],
  },
  [OD_REALM_DARK_ARCHIVE]: {
    name: 'Dark Archive',
    level: 20,
    description: 'An infinite library containing forbidden knowledge written in shadow ink. Sorcerers come here to study the darkest arts.',
    resources: [OD_MAT_SORCERER_INK, OD_MAT_ELDRITCH_RUNE, OD_MAT_DARK_MATTER],
    capacity: 20,
    ambientColor: OD_COLOR_TWILIGHT_VIOLET,
    shadePool: [OD_SHADE_VOID_STALKER, OD_SHADE_DARK_SENTINEL, OD_SHADE_PHANTOM_INFILTRATOR],
  },
  [OD_REALM_NIGHTMARE_PITS]: {
    name: 'Nightmare Pits',
    level: 28,
    description: 'A labyrinth of subterranean caverns where nightmares breed and multiply. The howls echo endlessly through twisting tunnels.',
    resources: [OD_MAT_NIGHTMARE_EMBER, OD_MAT_HOUND_FANG, OD_MAT_NIGHTFALL_NECTAR],
    capacity: 22,
    ambientColor: OD_COLOR_VOID_RED,
    shadePool: [OD_SHADE_NIGHTMARE_STALKER, OD_SHADE_HELLHOUND_ALPHA, OD_SHADE_FENRIR_INCARNATE],
  },
  [OD_REALM_PHANTOM_WARRENS]: {
    name: 'Phantom Warrens',
    level: 36,
    description: 'A maze of invisible corridors patrolled by phantom spies. Only those who can see the unseen may navigate its depths.',
    resources: [OD_MAT_SPY_LENS, OD_MAT_PHANTOM_CHAIN, OD_MAT_ECLIPSE_GLASS],
    capacity: 24,
    ambientColor: OD_COLOR_SHADOW_PURPLE,
    shadePool: [OD_SHADE_PHANTOM_INFILTRATOR, OD_SHADE_PHANTOM_MASTER, OD_SHADE_OMEGA_PHANTOM],
  },
  [OD_REALM_ABYSS_DEPTH]: {
    name: 'Abyss Depth',
    level: 44,
    description: 'The deepest reachable layer of the Onyx Domain. Titanic forces stir in the darkness below, their footsteps causing earthquakes.',
    resources: [OD_MAT_ABYSS_SALT, OD_MAT_TITAN_MARROW, OD_MAT_ABYSSAL_IRON, OD_MAT_ABYSS_PEARL],
    capacity: 26,
    ambientColor: OD_COLOR_ABYSS_BLUE,
    shadePool: [OD_SHADE_ABYSS_GOLEM, OD_SHADE_DEEP_ABYSS_TITAN, OD_SHADE_PRIMORDIAL_TITAN],
  },
  [OD_REALM_ONYX_NEXUS]: {
    name: 'Onyx Nexus',
    level: 50,
    description: 'The heart of the Onyx Domain where all shadow energies converge. Only the most powerful can stand here without being consumed.',
    resources: [OD_MAT_VOID_HEARTSTONE, OD_MAT_ONYX_BLOOD, OD_MAT_SHADOWFIRE_COAL, OD_MAT_VOIDCRAFT_INGOT, OD_MAT_PRIMORDIAL_ASH],
    capacity: 30,
    ambientColor: OD_COLOR_ONYX_BLACK,
    shadePool: [OD_SHADE_ELDER_WRAITH, OD_SHADE_ONYX_COLOSSUS, OD_SHADE_OBSIDIAN_SOVEREIGN, OD_SHADE_VOID_EMPEROR, OD_SHADE_PRIMORDIAL_TITAN],
  },
};

// ============================================================
// Material Data (30 materials)
// ============================================================

const OD_MATERIAL_DATA: Record<string, OdMaterialData> = {
  [OD_MAT_SHADOW_DUST]: { name: 'Shadow Dust', rarity: OD_RARITY_COMMON, description: 'Fine black powder that gathers in shadowy corners.', stackLimit: 999 },
  [OD_MAT_VOID_ESSENCE]: { name: 'Void Essence', rarity: OD_RARITY_COMMON, description: 'Drops of liquid nothingness extracted from the void boundary.', stackLimit: 500 },
  [OD_MAT_OBSIDIAN_SHARD]: { name: 'Obsidian Shard', rarity: OD_RARITY_COMMON, description: 'A sharp fragment of volcanic glass infused with dark energy.', stackLimit: 500 },
  [OD_MAT_DARK_CRYSTAL]: { name: 'Dark Crystal', rarity: OD_RARITY_COMMON, description: 'A crystal that absorbs light and radiates shadow.', stackLimit: 300 },
  [OD_MAT_NIGHTMARE_EMBER]: { name: 'Nightmare Ember', rarity: OD_RARITY_COMMON, description: 'A smoldering coal from the Nightmare Pits that never extinguishes.', stackLimit: 300 },
  [OD_MAT_PHANTOM_SILK]: { name: 'Phantom Silk', rarity: OD_RARITY_COMMON, description: 'Thread spun from phantom essence, lighter than air.', stackLimit: 200 },
  [OD_MAT_ABYSS_SALT]: { name: 'Abyss Salt', rarity: OD_RARITY_UNCOMMON, description: 'Crystallized salt from the Abyss Depth with corrosive properties.', stackLimit: 200 },
  [OD_MAT_SHADE_BONE]: { name: 'Shade Bone', rarity: OD_RARITY_COMMON, description: 'The petrified remains of a lesser shade creature.', stackLimit: 500 },
  [OD_MAT_WRAITH_TEARS]: { name: 'Wraith Tears', rarity: OD_RARITY_UNCOMMON, description: 'Crystallized sorrow from a weeping wraith, powerful in rituals.', stackLimit: 150 },
  [OD_MAT_GOLEM_CORE]: { name: 'Golem Core', rarity: OD_RARITY_UNCOMMON, description: 'The power source of a defeated shadow golem, still pulsing.', stackLimit: 100 },
  [OD_MAT_KNIGHT_PLATING]: { name: 'Knight Plating', rarity: OD_RARITY_UNCOMMON, description: 'A piece of obsidian armor from a fallen shadow knight.', stackLimit: 100 },
  [OD_MAT_SORCERER_INK]: { name: 'Sorcerer Ink', rarity: OD_RARITY_UNCOMMON, description: 'Ink made from condensed dark magic, glows faintly purple.', stackLimit: 150 },
  [OD_MAT_HOUND_FANG]: { name: 'Hound Fang', rarity: OD_RARITY_UNCOMMON, description: 'A razor-sharp fang from a nightmare hound, venom still drips.', stackLimit: 100 },
  [OD_MAT_SPY_LENS]: { name: 'Spy Lens', rarity: OD_RARITY_UNCOMMON, description: 'A tiny lens that allows the user to see through any disguise.', stackLimit: 50 },
  [OD_MAT_TITAN_MARROW]: { name: 'Titan Marrow', rarity: OD_RARITY_RARE, description: 'The dense marrow from an abyss titan bone, extremely heavy.', stackLimit: 50 },
  [OD_MAT_VOID_HEARTSTONE]: { name: 'Void Heartstone', rarity: OD_RARITY_RARE, description: 'A gemstone that contains a pocket of compressed void space.', stackLimit: 30 },
  [OD_MAT_ONYX_BLOOD]: { name: 'Onyx Blood', rarity: OD_RARITY_RARE, description: 'Liquid onyx that flows like blood from the heart of the domain.', stackLimit: 30 },
  [OD_MAT_ECLIPSE_GLASS]: { name: 'Eclipse Glass', rarity: OD_RARITY_UNCOMMON, description: 'Glass formed during an onyx eclipse, imbued with starless light.', stackLimit: 80 },
  [OD_MAT_SHADOWROOT]: { name: 'Shadowroot', rarity: OD_RARITY_COMMON, description: 'A gnarled root that grows only in complete darkness.', stackLimit: 500 },
  [OD_MAT_ABYSSAL_IRON]: { name: 'Abyssal Iron', rarity: OD_RARITY_RARE, description: 'Metal forged in the abyss depths, darker than normal iron.', stackLimit: 50 },
  [OD_MAT_DUSK_MOSS]: { name: 'Dusk Moss', rarity: OD_RARITY_COMMON, description: 'Moss that grows at twilight, used in healing poultices.', stackLimit: 999 },
  [OD_MAT_PHANTOM_CHAIN]: { name: 'Phantom Chain Link', rarity: OD_RARITY_RARE, description: 'A single link from an ethereal chain that binds phantoms.', stackLimit: 30 },
  [OD_MAT_OBSIDIAN_BLADE]: { name: 'Obsidian Blade', rarity: OD_RARITY_EPIC, description: 'A blade of perfect obsidian that can cut through shadow itself.', stackLimit: 10 },
  [OD_MAT_NIGHTFALL_NECTAR]: { name: 'Nightfall Nectar', rarity: OD_RARITY_UNCOMMON, description: 'A sweet liquid harvested from nightmare flowers at dusk.', stackLimit: 100 },
  [OD_MAT_DARK_MATTER]: { name: 'Dark Matter', rarity: OD_RARITY_EPIC, description: 'A substance heavier than lead that devours surrounding light.', stackLimit: 10 },
  [OD_MAT_ELDRITCH_RUNE]: { name: 'Eldritch Rune', rarity: OD_RARITY_RARE, description: 'A carved stone tablet inscribed with an ancient dark rune.', stackLimit: 20 },
  [OD_MAT_ABYSS_PEARL]: { name: 'Abyss Pearl', rarity: OD_RARITY_EPIC, description: 'A pearl from the deepest abyssal oyster, swirls with void energy.', stackLimit: 10 },
  [OD_MAT_SHADOWFIRE_COAL]: { name: 'Shadowfire Coal', rarity: OD_RARITY_EPIC, description: 'Coal that burns with black flames, consuming light instead of fuel.', stackLimit: 10 },
  [OD_MAT_VOIDCRAFT_INGOT]: { name: 'Voidcraft Ingot', rarity: OD_RARITY_LEGENDARY, description: 'An ingot forged in the void itself, impossibly light and unbreakable.', stackLimit: 5 },
  [OD_MAT_PRIMORDIAL_ASH]: { name: 'Primordial Ash', rarity: OD_RARITY_LEGENDARY, description: 'Ash from the first shadow ever extinguished, contains creation energy.', stackLimit: 5 },
};

// ============================================================
// Structure Data (25 structures)
// ============================================================

const OD_STRUCTURE_DATA: Record<string, OdStructureData> = {
  [OD_STRUCT_SHADOW_ALTAR]: { name: 'Shadow Altar', description: 'An altar for binding new shades to your will.', maxLevel: 10, baseCost: 50, costMultiplier: 1.8, powerPerLevel: 5, abilityUnlock: OD_ABILITY_SHADOW_STRIKE },
  [OD_STRUCT_VOID_WELL]: { name: 'Void Well', description: 'A well that draws void essence from the boundary between worlds.', maxLevel: 10, baseCost: 60, costMultiplier: 1.9, powerPerLevel: 4, abilityUnlock: OD_ABILITY_VOID_STEP },
  [OD_STRUCT_OBSIDIAN_WALL]: { name: 'Obsidian Wall', description: 'Defensive walls of volcanic obsidian that protect your domain.', maxLevel: 10, baseCost: 80, costMultiplier: 2.0, powerPerLevel: 8, abilityUnlock: OD_ABILITY_OBSIDIAN_SHIELD },
  [OD_STRUCT_DARK_TOWER]: { name: 'Dark Tower', description: 'A tower of darkness that serves as your command center.', maxLevel: 10, baseCost: 100, costMultiplier: 2.0, powerPerLevel: 6, abilityUnlock: OD_ABILITY_DARK_BOLT },
  [OD_STRUCT_NIGHTMARE_DEN]: { name: 'Nightmare Den', description: 'A den where nightmare hounds rest and breed between hunts.', maxLevel: 10, baseCost: 70, costMultiplier: 1.8, powerPerLevel: 5, abilityUnlock: OD_ABILITY_NIGHTMARE_HOWL },
  [OD_STRUCT_PHANTOM_GATE]: { name: 'Phantom Gate', description: 'A gate that allows phantoms to travel between realms instantly.', maxLevel: 10, baseCost: 90, costMultiplier: 1.9, powerPerLevel: 7, abilityUnlock: OD_ABILITY_PHANTOM_CLOAK },
  [OD_STRUCT_ABYSS_FORGE]: { name: 'Abyss Forge', description: 'A forge burning with abyssal fire for crafting legendary items.', maxLevel: 10, baseCost: 120, costMultiplier: 2.1, powerPerLevel: 10, abilityUnlock: OD_ABILITY_ABYSS_CRUSH },
  [OD_STRUCT_ONYX_KEEP]: { name: 'Onyx Keep', description: 'Your personal stronghold carved from pure onyx stone.', maxLevel: 10, baseCost: 150, costMultiplier: 2.2, powerPerLevel: 12, abilityUnlock: OD_ABILITY_ONYX_SURGE },
  [OD_STRUCT_SHADE_BARRACKS]: { name: 'Shade Barracks', description: 'Housing for your bound shades, increasing their morale.', maxLevel: 10, baseCost: 55, costMultiplier: 1.7, powerPerLevel: 4, abilityUnlock: OD_ABILITY_WRAITH_SCREAM },
  [OD_STRUCT_SHADOW_LIBRARY]: { name: 'Shadow Library', description: 'A library of dark tomes that enhances sorcery abilities.', maxLevel: 10, baseCost: 75, costMultiplier: 1.8, powerPerLevel: 6, abilityUnlock: OD_ABILITY_HEX_BLAST },
  [OD_STRUCT_DARK_WORKSHOP]: { name: 'Dark Workshop', description: 'A workshop for crafting shadow-infused equipment.', maxLevel: 10, baseCost: 85, costMultiplier: 1.9, powerPerLevel: 7, abilityUnlock: OD_ABILITY_GOLEM_RUSH },
  [OD_STRUCT_OBSIDIAN_ANVIL]: { name: 'Obsidian Anvil', description: 'An anvil for forging obsidian weapons and armor.', maxLevel: 10, baseCost: 95, costMultiplier: 2.0, powerPerLevel: 8, abilityUnlock: OD_ABILITY_KNIGHT_CHARGE },
  [OD_STRUCT_NIGHTMARE_ARENA]: { name: 'Nightmare Arena', description: 'An arena where shades battle for dominance and experience.', maxLevel: 10, baseCost: 110, costMultiplier: 2.0, powerPerLevel: 9, abilityUnlock: OD_ABILITY_NIGHTMARE_FRENZY },
  [OD_STRUCT_PHANTOM_VAULT]: { name: 'Phantom Vault', description: 'A secure vault for storing artifacts and rare materials.', maxLevel: 10, baseCost: 130, costMultiplier: 2.1, powerPerLevel: 5, abilityUnlock: OD_ABILITY_SPY_INFILTRATE },
  [OD_STRUCT_ABYSS_LAB]: { name: 'Abyss Lab', description: 'A laboratory for experimenting with abyssal materials.', maxLevel: 10, baseCost: 140, costMultiplier: 2.1, powerPerLevel: 10, abilityUnlock: OD_ABILITY_SHADOW_MEND },
  [OD_STRUCT_ONYX_OBELISK]: { name: 'Onyx Obelisk', description: 'An obelisk that channels domain power into all structures.', maxLevel: 10, baseCost: 160, costMultiplier: 2.2, powerPerLevel: 11, abilityUnlock: OD_ABILITY_VOID_LEECH },
  [OD_STRUCT_WRAITH_TOWER]: { name: 'Wraith Tower', description: 'A tower that summons wraith sentinels to patrol the domain.', maxLevel: 10, baseCost: 65, costMultiplier: 1.8, powerPerLevel: 6, abilityUnlock: OD_ABILITY_OBSIDIAN_BLADE_DANCE },
  [OD_STRUCT_GOLEM_FACTORY]: { name: 'Golem Factory', description: 'Automates the creation of shadow golems for defense.', maxLevel: 10, baseCost: 105, costMultiplier: 2.0, powerPerLevel: 9, abilityUnlock: OD_ABILITY_DARK_RITUAL },
  [OD_STRUCT_KNIGHT_HALL]: { name: 'Knight Hall', description: 'A hall where obsidian knights train and sharpen their skills.', maxLevel: 10, baseCost: 115, costMultiplier: 2.0, powerPerLevel: 10, abilityUnlock: OD_ABILITY_PHANTOM_ARMY },
  [OD_STRUCT_SORCERER_CIRCLE]: { name: 'Sorcerer Circle', description: 'A circle of dark stones where sorcerers channel immense power.', maxLevel: 10, baseCost: 125, costMultiplier: 2.1, powerPerLevel: 11, abilityUnlock: OD_ABILITY_HOUND_TRAIL },
  [OD_STRUCT_HOUND_KENNEL]: { name: 'Hound Kennel', description: 'Kennels that breed and train nightmare hounds.', maxLevel: 10, baseCost: 70, costMultiplier: 1.8, powerPerLevel: 6, abilityUnlock: OD_ABILITY_TITAN_STOMP },
  [OD_STRUCT_SPY_NETWORK]: { name: 'Spy Network', description: 'A network of phantom operatives that gather intelligence.', maxLevel: 10, baseCost: 100, costMultiplier: 2.0, powerPerLevel: 8, abilityUnlock: null },
  [OD_STRUCT_TITAN_CRADLE]: { name: 'Titan Cradle', description: 'A cradle that nurtures and empowers abyss titans.', maxLevel: 10, baseCost: 145, costMultiplier: 2.2, powerPerLevel: 13, abilityUnlock: OD_ABILITY_ABYSS_DEVOUR },
  [OD_STRUCT_SHADOW_THRONE]: { name: 'Shadow Throne', description: 'The seat of power that amplifies your command over all shades.', maxLevel: 10, baseCost: 200, costMultiplier: 2.5, powerPerLevel: 15, abilityUnlock: null },
  [OD_STRUCT_DOMAIN_CORE]: { name: 'Domain Core', description: 'The core of your domain, powering all other structures.', maxLevel: 10, baseCost: 250, costMultiplier: 2.5, powerPerLevel: 20, abilityUnlock: null },
};

// ============================================================
// Ability Data (22 abilities)
// ============================================================

const OD_ABILITY_DATA: Record<string, OdAbilityData> = {
  [OD_ABILITY_SHADOW_STRIKE]: { name: 'Shadow Strike', type: 'attack', power: 25, cooldown: 3, description: 'A quick strike imbued with shadow energy that deals bonus damage to bound shades.' },
  [OD_ABILITY_VOID_STEP]: { name: 'Void Step', type: 'utility', power: 0, cooldown: 8, description: 'Phase through the void to teleport a short distance, evading attacks.' },
  [OD_ABILITY_OBSIDIAN_SHIELD]: { name: 'Obsidian Shield', type: 'defense', power: 40, cooldown: 10, description: 'Raise a shield of obsidian that absorbs incoming damage.' },
  [OD_ABILITY_DARK_BOLT]: { name: 'Dark Bolt', type: 'attack', power: 35, cooldown: 5, description: 'Fire a concentrated bolt of dark energy at a target.' },
  [OD_ABILITY_NIGHTMARE_HOWL]: { name: 'Nightmare Howl', type: 'debuff', power: 20, cooldown: 12, description: 'Release a howl that reduces enemy defense for a duration.' },
  [OD_ABILITY_PHANTOM_CLOAK]: { name: 'Phantom Cloak', type: 'utility', power: 0, cooldown: 15, description: 'Shroud yourself in phantom essence, becoming invisible to enemies.' },
  [OD_ABILITY_ABYSS_CRUSH]: { name: 'Abyss Crush', type: 'attack', power: 55, cooldown: 8, description: 'Summon abyssal forces to crush a target with gravitational pressure.' },
  [OD_ABILITY_ONYX_SURGE]: { name: 'Onyx Surge', type: 'buff', power: 30, cooldown: 20, description: 'Surge with onyx energy, boosting all shade power temporarily.' },
  [OD_ABILITY_WRAITH_SCREAM]: { name: 'Wraith Scream', type: 'attack', power: 30, cooldown: 7, description: 'A piercing scream that damages and disorients all nearby enemies.' },
  [OD_ABILITY_GOLEM_RUSH]: { name: 'Golem Rush', type: 'attack', power: 45, cooldown: 10, description: 'Command your golems to charge forward, trampling enemies.' },
  [OD_ABILITY_KNIGHT_CHARGE]: { name: 'Knight Charge', type: 'attack', power: 50, cooldown: 9, description: 'Lead an obsidian knight charge that pierces enemy lines.' },
  [OD_ABILITY_HEX_BLAST]: { name: 'Hex Blast', type: 'attack', power: 40, cooldown: 6, description: 'Unleash a blast of dark hex energy that weakens the target.' },
  [OD_ABILITY_HOUND_TRAIL]: { name: 'Hound Trail', type: 'utility', power: 0, cooldown: 12, description: 'Send nightmare hounds to track a target, revealing their position.' },
  [OD_ABILITY_SPY_INFILTRATE]: { name: 'Spy Infiltrate', type: 'utility', power: 0, cooldown: 18, description: 'Deploy phantom spies to infiltrate enemy defenses and gather intel.' },
  [OD_ABILITY_TITAN_STOMP]: { name: 'Titan Stomp', type: 'attack', power: 60, cooldown: 14, description: 'Command a titan to stomp the ground, creating a shockwave.' },
  [OD_ABILITY_SHADOW_MEND]: { name: 'Shadow Mend', type: 'heal', power: 35, cooldown: 12, description: 'Use shadow energy to mend wounds and restore health.' },
  [OD_ABILITY_VOID_LEECH]: { name: 'Void Leech', type: 'drain', power: 25, cooldown: 8, description: 'Drain life force from enemies through the void, healing yourself.' },
  [OD_ABILITY_OBSIDIAN_BLADE_DANCE]: { name: 'Obsidian Blade Dance', type: 'attack', power: 70, cooldown: 15, description: 'A devastating multi-hit attack with obsidian blades.' },
  [OD_ABILITY_DARK_RITUAL]: { name: 'Dark Ritual', type: 'buff', power: 50, cooldown: 25, description: 'Perform a dark ritual that greatly empowers all shades temporarily.' },
  [OD_ABILITY_NIGHTMARE_FRENZY]: { name: 'Nightmare Frenzy', type: 'buff', power: 40, cooldown: 20, description: 'Enter a frenzy that dramatically increases attack speed and power.' },
  [OD_ABILITY_PHANTOM_ARMY]: { name: 'Phantom Army', type: 'summon', power: 45, cooldown: 30, description: 'Summon an army of phantom soldiers to fight alongside your shades.' },
  [OD_ABILITY_ABYSS_DEVOUR]: { name: 'Abyss Devour', type: 'attack', power: 100, cooldown: 40, description: 'Open an abyssal maw that devours everything in its path.' },
};

// ============================================================
// Achievement Data (18 achievements)
// ============================================================

const OD_ACHIEVEMENT_DATA: Record<string, OdAchievementData> = {
  [OD_ACHIEVEMENT_FIRST_BINDING]: { name: 'First Binding', description: 'Bind your first shadow shade to your domain.', checkFn: 'totalBound >= 1' },
  [OD_ACHIEVEMENT_SHADE_COLLECTOR]: { name: 'Shade Collector', description: 'Bind 10 different shades to your domain.', checkFn: 'totalBound >= 10' },
  [OD_ACHIEVEMENT_REALM_CORRUPTOR]: { name: 'Realm Corruptor', description: 'Corrupt 3 realm locations with your influence.', checkFn: 'totalCorrupted >= 3' },
  [OD_ACHIEVEMENT_MASTER_BUILDER]: { name: 'Master Builder', description: 'Build or upgrade 10 domain structures.', checkFn: 'totalBuilt >= 10' },
  [OD_ACHIEVEMENT_ARTIFACT_HUNTER]: { name: 'Artifact Hunter', description: 'Activate 3 legendary onyx artifacts.', checkFn: 'artifacts.length >= 3' },
  [OD_ACHIEVEMENT_MATERIAL_HOARDER]: { name: 'Material Hoarder', description: 'Collect 500 total materials.', checkFn: 'totalMaterialsCollected >= 500' },
  [OD_ACHIEVEMENT_DARK_SCHOLAR]: { name: 'Dark Scholar', description: 'Reach domain level 15.', checkFn: 'level >= 15' },
  [OD_ACHIEVEMENT_EVENT_SURVIVOR]: { name: 'Event Survivor', description: 'Survive 5 domain events.', checkFn: 'totalEventsTriggered >= 5' },
  [OD_ACHIEVEMENT_TITAN_TAMER]: { name: 'Titan Tamer', description: 'Bind an abyss titan shade.', checkFn: 'shadeType === abyss_titan' },
  [OD_ACHIEVEMENT_LEGENDARY_BINDER]: { name: 'Legendary Binder', description: 'Bind 3 legendary shades.', checkFn: 'legendaryBound >= 3' },
  [OD_ACHIEVEMENT_FULL_CORRUPTION]: { name: 'Full Corruption', description: 'Corrupt all 8 realm locations.', checkFn: 'totalCorrupted >= 8' },
  [OD_ACHIEVEMENT_STRUCTURE_MOGUL]: { name: 'Structure Mogul', description: 'Build all 25 domain structures.', checkFn: 'builtStructures >= 25' },
  [OD_ACHIEVEMENT_ABILITY_MASTER]: { name: 'Ability Master', description: 'Unlock 15 shadow abilities.', checkFn: 'unlockedAbilities >= 15' },
  [OD_ACHIEVEMENT_NIGHTMARE_LORD]: { name: 'Nightmare Lord', description: 'Bind all nightmare hound shades.', checkFn: 'houndBound >= 5' },
  [OD_ACHIEVEMENT_ALL_SHADES_BOUND]: { name: 'All Shades Bound', description: 'Bind all 35 shadow shades.', checkFn: 'totalBound >= 35' },
  [OD_ACHIEVEMENT_ONYX_COMPLETE]: { name: 'Onyx Complete', description: 'Reach domain level 40.', checkFn: 'level >= 40' },
  [OD_ACHIEVEMENT_DOMINION]: { name: 'Dominion', description: 'Activate all 15 legendary artifacts.', checkFn: 'artifacts.length >= 15' },
  [OD_ACHIEVEMENT_PRIMORDIAL]: { name: 'Primordial', description: 'Bind the Primordial Titan.', checkFn: 'primordialBound' },
};

// ============================================================
// Artifact Data (15 legendary onyx artifacts)
// ============================================================

const OD_ARTIFACT_DATA: Record<string, OdArtifactData> = {
  [OD_ARTIFACT_ONYX_CROWN]: { name: 'Onyx Crown', description: 'The crown of the Onyx Emperor, granting dominion over all shadow shades.', power: 50, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_VOID_AMULET]: { name: 'Void Amulet', description: 'An amulet containing a fragment of the void, enhancing void-type shades.', power: 35, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_SHADOWBLADE]: { name: 'Shadowblade', description: 'A sword forged from solidified shadow that cuts through any defense.', power: 45, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_OBSIDIAN_ORB]: { name: 'Obsidian Orb', description: 'An orb of perfect obsidian that reveals hidden realms and secrets.', power: 40, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_NIGHTMARE_HEART]: { name: 'Nightmare Heart', description: 'The still-beating heart of a primordial nightmare, radiating dread.', power: 42, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_PHANTOM_CLOAK_ART]: { name: 'Phantom Cloak', description: 'A cloak woven from phantom essence that grants true invisibility.', power: 38, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_ABYSS_KEY]: { name: 'Abyss Key', description: 'A key that unlocks the deepest chambers of the Abyss Depth.', power: 44, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_ONYX_SCEPTER]: { name: 'Onyx Scepter', description: 'A scepter that commands all bound shades with absolute authority.', power: 48, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_DARK_MIRROR]: { name: 'Dark Mirror', description: 'A mirror that reflects the true form of any shade or phantom.', power: 36, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_WRAITH_MASK]: { name: 'Wraith Mask', description: 'A mask that allows the wearer to assume the form of any wraith.', power: 37, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_SHADE_RING]: { name: 'Shade Ring', description: 'A ring that binds shades more tightly, increasing bond strength.', power: 30, rarity: OD_RARITY_EPIC },
  [OD_ARTIFACT_GOLEM_GAUNTLET]: { name: 'Golem Gauntlet', description: 'A gauntlet that channels golem strength directly to the wearer.', power: 33, rarity: OD_RARITY_EPIC },
  [OD_ARTIFACT_KNIGHT_CREST]: { name: 'Knight Crest', description: 'The crest of the Obsidian Sovereign, empowering all knight-type shades.', power: 39, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_SORCERER_GRIMOIRE]: { name: 'Sorcerer Grimoire', description: 'A book of dark spells that enhances all sorcerer-type shades.', power: 41, rarity: OD_RARITY_LEGENDARY },
  [OD_ARTIFACT_TITAN_HAMMER]: { name: 'Titan Hammer', description: 'A hammer that was wielded by the Primordial Titan in the age of creation.', power: 55, rarity: OD_RARITY_LEGENDARY },
};

// ============================================================
// Event Data (12 random domain events)
// ============================================================

const OD_EVENT_DATA: Record<string, OdEventData> = {
  [OD_EVENT_VOID_RIFT]: { name: 'Void Rift', description: 'A rift in the void opens, flooding the domain with wild energy that strengthens wraiths.', duration: 60, shadeBoost: 20, rewardMultiplier: 1.5 },
  [OD_EVENT_SHADOW_SURGE]: { name: 'Shadow Surge', description: 'A massive surge of shadow energy sweeps through the domain, empowering all shades.', duration: 45, shadeBoost: 15, rewardMultiplier: 1.3 },
  [OD_EVENT_NIGHTMARE_INVASION]: { name: 'Nightmare Invasion', description: 'An army of nightmares breaches the domain walls, testing your defenses.', duration: 90, shadeBoost: 30, rewardMultiplier: 2.0 },
  [OD_EVENT_PHANTOM_REBELLION]: { name: 'Phantom Rebellion', description: 'Phantom spies revolt, requiring you to quell the uprising.', duration: 50, shadeBoost: 10, rewardMultiplier: 1.4 },
  [OD_EVENT_ABYSS_QUAKE]: { name: 'Abyss Quake', description: 'The abyss trembles, reshaping the domain and revealing hidden resources.', duration: 30, shadeBoost: 5, rewardMultiplier: 1.8 },
  [OD_EVENT_ONYX_ECLIPSE]: { name: 'Onyx Eclipse', description: 'An eclipse of pure onyx darkens the domain, greatly enhancing dark power.', duration: 120, shadeBoost: 40, rewardMultiplier: 2.5 },
  [OD_EVENT_DARK_COMET]: { name: 'Dark Comet', description: 'A comet of dark matter streaks across the sky, raining shadow crystals.', duration: 40, shadeBoost: 12, rewardMultiplier: 1.6 },
  [OD_EVENT_WRAITH_STORM]: { name: 'Wraith Storm', description: 'A storm of wraiths descends upon the domain, bringing chaos and opportunity.', duration: 70, shadeBoost: 25, rewardMultiplier: 1.7 },
  [OD_EVENT_GOLEM_UPRISING]: { name: 'Golem Uprising', description: 'Shadow golems gain sentience and demand freedom, a test of leadership.', duration: 55, shadeBoost: 18, rewardMultiplier: 1.5 },
  [OD_EVENT_SORCERER_PACT]: { name: 'Sorcerer Pact', description: 'Dark sorcerers offer a pact that grants temporary immense magical power.', duration: 80, shadeBoost: 35, rewardMultiplier: 2.2 },
  [OD_EVENT_HOUND_MIGRATION]: { name: 'Hound Migration', description: 'A massive pack of nightmare hounds migrates through the domain.', duration: 35, shadeBoost: 8, rewardMultiplier: 1.3 },
  [OD_EVENT_TITAN_AWAKENING]: { name: 'Titan Awakening', description: 'An ancient titan stirs in the abyss depths, reshaping the landscape.', duration: 100, shadeBoost: 50, rewardMultiplier: 3.0 },
};

// ============================================================
// Helper Functions
// ============================================================

function odXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.4, level - 1));
}

function odCalculateLevel(xp: number): number {
  let lvl = 1;
  let remaining = xp;
  while (remaining >= odXpForLevel(lvl + 1)) {
    remaining -= odXpForLevel(lvl + 1);
    lvl += 1;
    if (lvl >= 50) break;
  }
  return lvl;
}

function odTitleForLevel(level: number): string {
  if (level >= 45) return OD_TITLE_ONYX_EMPEROR;
  if (level >= 38) return OD_TITLE_ABYSS_WARDEN;
  if (level >= 30) return OD_TITLE_PHANTOM_SOVEREIGN;
  if (level >= 23) return OD_TITLE_NIGHTMARE_OVERSEER;
  if (level >= 16) return OD_TITLE_DARK_COMMANDER;
  if (level >= 10) return OD_TITLE_OBSIDIAN_KNIGHT_TITLE;
  if (level >= 5) return OD_TITLE_VOID_WALKER;
  return OD_TITLE_SHADOW_INITIATE;
}

// ============================================================
// Initial State Factory
// ============================================================

function odCreateInitialState(seed?: number): OnyxDomainState {
  const initialShades: Record<string, ShadeState> = {};
  for (const shadeId of OD_ALL_SHADES) {
    initialShades[shadeId] = { bound: false, level: 1, xp: 0, bondStrength: 0 };
  }

  const initialRealms: Record<string, RealmState> = {};
  for (const realmId of OD_ALL_REALMS) {
    const rd = OD_REALM_DATA[realmId];
    initialRealms[realmId] = {
      corrupted: false,
      corruptionLevel: 0,
      maxCorruption: rd ? rd.capacity * 10 : 100,
      structures: {},
    };
  }

  return {
    rngSeed: seed ?? Date.now(),
    level: 1,
    experience: 0,
    odTitle: OD_TITLE_SHADOW_INITIATE,
    odShades: initialShades,
    odRealms: initialRealms,
    odInventory: [],
    odArtifacts: [],
    odAchievements: [],
    odTitle: OD_TITLE_SHADOW_INITIATE,
    odEvents: [],
    odStats: {
      totalBound: 0,
      totalCorrupted: 0,
      totalBuilt: 0,
      totalActivated: 0,
      totalEventsTriggered: 0,
      totalMaterialsCollected: 0,
      totalXpGained: 0,
    },
    structureLevels: { [OD_STRUCT_SHADOW_ALTAR]: 1 },
    activeEventId: null,
    eventEndTime: null,
    realmLog: ['You stand at the Void Gate. Shadows coalesce around you as the Onyx Domain beckons...'],
  };
}

// ============================================================
// The Hook — useOnyxDomain
// ============================================================

export default function useOnyxDomain(initialSeed?: number) {
  const [odAPIState, odAPISetState] = useState<OnyxDomainState>(
    () => odCreateInitialState(initialSeed),
  );

  const odAPIStateRef = useRef(odAPIState);

  useEffect(() => {
    odAPIStateRef.current = odAPIState;
  }, [odAPIState]);

  // ----------------------------------------------------------
  // Data lookup helpers (no state dependency)
  // ----------------------------------------------------------

  const odAPIGetShadeData = useCallback((shadeId: string): OdShadeData | null => {
    return OD_SHADE_DATA[shadeId] ?? null;
  }, []);

  const odAPIGetRealmData = useCallback((realmId: string): OdRealmData | null => {
    return OD_REALM_DATA[realmId] ?? null;
  }, []);

  const odAPIGetMaterialData = useCallback((materialId: string): OdMaterialData | null => {
    return OD_MATERIAL_DATA[materialId] ?? null;
  }, []);

  const odAPIGetStructureData = useCallback((structureId: string): OdStructureData | null => {
    return OD_STRUCTURE_DATA[structureId] ?? null;
  }, []);

  const odAPIGetAbilityData = useCallback((abilityId: string): OdAbilityData | null => {
    return OD_ABILITY_DATA[abilityId] ?? null;
  }, []);

  const odAPIGetAchievementData = useCallback((achId: string): OdAchievementData | null => {
    return OD_ACHIEVEMENT_DATA[achId] ?? null;
  }, []);

  const odAPIGetArtifactData = useCallback((artifactId: string): OdArtifactData | null => {
    return OD_ARTIFACT_DATA[artifactId] ?? null;
  }, []);

  const odAPIGetEventData = useCallback((eventId: string): OdEventData | null => {
    return OD_EVENT_DATA[eventId] ?? null;
  }, []);

  const odAPIGetRarityMultiplier = useCallback((rarity: string): number => {
    return OD_RARITY_MULTIPLIER[rarity] ?? 1.0;
  }, []);

  const odAPIRarityLabel = useCallback((rarity: string): string => {
    return odRarityLabel(rarity);
  }, []);

  const odAPIXpForNextLevel = useCallback((level: number): number => {
    return odXpForLevel(level);
  }, []);

  // ----------------------------------------------------------
  // Computed values (useMemo with [state] dependency)
  // ----------------------------------------------------------

  const odAPIBoundShadeCount = useMemo((): number => {
    return Object.values(odAPIState.odShades).filter((s) => s.bound).length;
  }, [odAPIState]);

  const odAPICorruptedRealmCount = useMemo((): number => {
    return Object.values(odAPIState.odRealms).filter((r) => r.corrupted).length;
  }, [odAPIState]);

  const odAPIBoundShadeIds = useMemo((): string[] => {
    return OD_ALL_SHADES.filter((id) => odAPIState.odShades[id]?.bound === true);
  }, [odAPIState]);

  const odAPICorruptedRealmIds = useMemo((): string[] => {
    return OD_ALL_REALMS.filter((id) => odAPIState.odRealms[id]?.corrupted === true);
  }, [odAPIState]);

  const odAPIInventoryCount = useMemo((): number => {
    return odAPIState.odInventory.length;
  }, [odAPIState]);

  const odAPITotalMaterials = useMemo((): number => {
    return odAPIState.odInventory.reduce((sum, item) => sum + item.quantity, 0);
  }, [odAPIState]);

  const odAPIActiveEventData = useMemo((): OdEventData | null => {
    if (!odAPIState.activeEventId) return null;
    if (!odAPIState.eventEndTime || odAPIState.eventEndTime < Date.now()) return null;
    return OD_EVENT_DATA[odAPIState.activeEventId] ?? null;
  }, [odAPIState]);

  const odAPIBuildStructureCount = useMemo((): number => {
    return Object.keys(odAPIState.structureLevels).length;
  }, [odAPIState]);

  const odAPIUnlockedAbilities = useMemo((): string[] => {
    const abilities: string[] = [];
    for (const structId of OD_ALL_STRUCTURES) {
      const level = odAPIState.structureLevels[structId];
      const sd = OD_STRUCTURE_DATA[structId];
      if (level && level >= 1 && sd && sd.abilityUnlock) {
        if (!abilities.includes(sd.abilityUnlock)) {
          abilities.push(sd.abilityUnlock);
        }
      }
    }
    return abilities;
  }, [odAPIState]);

  const odAPIDomainPower = useMemo((): number => {
    let power = 0;
    for (const shadeId of OD_ALL_SHADES) {
      const ss = odAPIState.odShades[shadeId];
      const sd = OD_SHADE_DATA[shadeId];
      if (ss && ss.bound && sd) {
        power += sd.power * ss.level;
      }
    }
    for (const structId of OD_ALL_STRUCTURES) {
      const level = odAPIState.structureLevels[structId];
      const sd = OD_STRUCTURE_DATA[structId];
      if (level && sd) {
        power += sd.powerPerLevel * level;
      }
    }
    for (const artId of odAPIState.odArtifacts) {
      const ad = OD_ARTIFACT_DATA[artId];
      if (ad) {
        power += ad.power;
      }
    }
    return power;
  }, [odAPIState]);

  const odAPIShadeProgress = useMemo((): { bound: number; total: number } => {
    return { bound: odAPIBoundShadeCount, total: OD_ALL_SHADES.length };
  }, [odAPIBoundShadeCount]);

  const odAPIRealmProgress = useMemo((): { corrupted: number; total: number } => {
    return { corrupted: odAPICorruptedRealmCount, total: OD_ALL_REALMS.length };
  }, [odAPICorruptedRealmCount]);

  const odAPIArtifactProgress = useMemo((): { activated: number; total: number } => {
    return { activated: odAPIState.odArtifacts.length, total: 14 };
  }, [odAPIState]);

  const odAPIAvailableTitles = useMemo((): string[] => {
    const level = odAPIState.level;
    const titles: string[] = [OD_TITLE_SHADOW_INITIATE];
    if (level >= 5) titles.push(OD_TITLE_VOID_WALKER);
    if (level >= 10) titles.push(OD_TITLE_OBSIDIAN_KNIGHT_TITLE);
    if (level >= 16) titles.push(OD_TITLE_DARK_COMMANDER);
    if (level >= 23) titles.push(OD_TITLE_NIGHTMARE_OVERSEER);
    if (level >= 30) titles.push(OD_TITLE_PHANTOM_SOVEREIGN);
    if (level >= 38) titles.push(OD_TITLE_ABYSS_WARDEN);
    if (level >= 45) titles.push(OD_TITLE_ONYX_EMPEROR);
    return titles;
  }, [odAPIState]);

  // ----------------------------------------------------------
  // Action: bindShade
  // ----------------------------------------------------------

  const odAPIBindShade = useCallback((shadeId: string): boolean => {
    let success = false;
    odAPISetState((prev) => {
      const sd = OD_SHADE_DATA[shadeId];
      if (!sd) return prev;
      const shadeState = prev.odShades[shadeId];
      if (!shadeState || shadeState.bound) return prev;
      if (prev.level < 1) return prev;

      const eventMult = (prev.activeEventId && OD_EVENT_DATA[prev.activeEventId])
        ? OD_EVENT_DATA[prev.activeEventId].rewardMultiplier
        : 1.0;
      const xpGain = Math.floor(sd.xpReward * OD_RARITY_MULTIPLIER[sd.rarity] * eventMult);
      const newLevel = odCalculateLevel(prev.experience + xpGain);

      success = true;
      return {
        ...prev,
        level: newLevel,
        experience: prev.experience + xpGain,
        odTitle: odTitleForLevel(newLevel),
        odShades: {
          ...prev.odShades,
          [shadeId]: { bound: true, level: 1, xp: 0, bondStrength: 10 },
        },
        odStats: {
          ...prev.odStats,
          totalBound: prev.odStats.totalBound + 1,
          totalXpGained: prev.odStats.totalXpGained + xpGain,
        },
        realmLog: [...prev.realmLog, `Bound shade: ${sd.name} (${odRarityLabel(sd.rarity)} ${sd.shadeType}). +${xpGain} XP.`],
      };
    });
    return success;
  }, []);

  // ----------------------------------------------------------
  // Action: corruptRealm
  // ----------------------------------------------------------

  const odAPICorruptRealm = useCallback((realmId: string): boolean => {
    let success = false;
    odAPISetState((prev) => {
      const rd = OD_REALM_DATA[realmId];
      if (!rd) return prev;
      const realmState = prev.odRealms[realmId];
      if (!realmState) return prev;
      if (prev.level < rd.level) return prev;
      if (realmState.corrupted) return prev;

      const corruptAmount = Math.floor(prev.level * 2 + odAPIBoundShadeCount * 5);
      const newCorruption = Math.min(realmState.corruptionLevel + corruptAmount, realmState.maxCorruption);
      const isCorrupted = newCorruption >= realmState.maxCorruption;

      const xpGain = isCorrupted ? Math.floor(200 * OD_RARITY_MULTIPLIER[OD_RARITY_EPIC]) : Math.floor(30 * OD_RARITY_MULTIPLIER[OD_RARITY_COMMON]);
      const newLevel = odCalculateLevel(prev.experience + xpGain);

      success = true;
      return {
        ...prev,
        level: newLevel,
        experience: prev.experience + xpGain,
        odTitle: odTitleForLevel(newLevel),
        odRealms: {
          ...prev.odRealms,
          [realmId]: {
            ...realmState,
            corruptionLevel: newCorruption,
            corrupted: isCorrupted,
          },
        },
        odStats: {
          ...prev.odStats,
          totalCorrupted: isCorrupted ? prev.odStats.totalCorrupted + 1 : prev.odStats.totalCorrupted,
          totalXpGained: prev.odStats.totalXpGained + xpGain,
        },
        realmLog: [
          ...prev.realmLog,
          isCorrupted
            ? `Realm "${rd.name}" fully corrupted! +${xpGain} XP.`
            : `Corrupted "${rd.name}": ${newCorruption}/${realmState.maxCorruption}. +${xpGain} XP.`,
        ],
      };
    });
    return success;
  }, [odAPIBoundShadeCount]);

  // ----------------------------------------------------------
  // Action: buildStructure
  // ----------------------------------------------------------

  const odAPIBuildStructure = useCallback((structureId: string): boolean => {
    let success = false;
    odAPISetState((prev) => {
      const sd = OD_STRUCTURE_DATA[structureId];
      if (!sd) return prev;
      const currentLevel = prev.structureLevels[structureId] ?? 0;
      if (currentLevel >= sd.maxLevel) return prev;

      const cost = currentLevel < 1
        ? sd.baseCost
        : Math.floor(sd.baseCost * Math.pow(sd.costMultiplier, currentLevel));

      const newXp = Math.floor(cost * 0.5 * OD_RARITY_MULTIPLIER[OD_RARITY_RARE]);
      const newLevel = odCalculateLevel(prev.experience + newXp);

      success = true;
      return {
        ...prev,
        level: newLevel,
        experience: prev.experience + newXp,
        odTitle: odTitleForLevel(newLevel),
        structureLevels: {
          ...prev.structureLevels,
          [structureId]: currentLevel + 1,
        },
        odStats: {
          ...prev.odStats,
          totalBuilt: currentLevel < 1 ? prev.odStats.totalBuilt + 1 : prev.odStats.totalBuilt,
          totalXpGained: prev.odStats.totalXpGained + newXp,
        },
        realmLog: [
          ...prev.realmLog,
          currentLevel < 1
            ? `Built ${sd.name} (Lv.${currentLevel + 1}). +${newXp} XP.`
            : `Upgraded ${sd.name} to Lv.${currentLevel + 1}. +${newXp} XP.`,
        ],
      };
    });
    return success;
  }, []);

  // ----------------------------------------------------------
  // Action: activateArtifact
  // ----------------------------------------------------------

  const odAPIActivateArtifact = useCallback((artifactId: string): boolean => {
    let success = false;
    odAPISetState((prev) => {
      const ad = OD_ARTIFACT_DATA[artifactId];
      if (!ad) return prev;
      if (prev.odArtifacts.includes(artifactId)) return prev;

      const xpGain = Math.floor(ad.power * 10);
      const newLevel = odCalculateLevel(prev.experience + xpGain);

      success = true;
      return {
        ...prev,
        level: newLevel,
        experience: prev.experience + xpGain,
        odTitle: odTitleForLevel(newLevel),
        odArtifacts: [...prev.odArtifacts, artifactId],
        odStats: {
          ...prev.odStats,
          totalActivated: prev.odStats.totalActivated + 1,
          totalXpGained: prev.odStats.totalXpGained + xpGain,
        },
        realmLog: [...prev.realmLog, `Activated legendary artifact: ${ad.name} (+${ad.power} power). +${xpGain} XP.`],
      };
    });
    return success;
  }, []);

  // ----------------------------------------------------------
  // Action: triggerDomainEvent
  // ----------------------------------------------------------

  const odAPITriggerDomainEvent = useCallback((): string | null => {
    let eventId: string | null = null;
    odAPISetState((prev) => {
      const available = OD_ALL_EVENTS.filter((id) => !prev.odEvents.includes(id));
      if (available.length === 0) {
        return {
          ...prev,
          odEvents: [],
          realmLog: [...prev.realmLog, 'Domain events have been reset. A new cycle begins.'],
        };
      }

      const rng = odRollInRange(prev.rngSeed, 0, available.length - 1);
      const chosen = available[rng.value];
      const ed = OD_EVENT_DATA[chosen];
      if (!ed) return prev;

      const eventEndTime = Date.now() + ed.duration * 1000;
      const matCount = odRollInRange(rng.nextSeed, 1, 5);
      const matRng = odRollInRange(matCount.nextSeed, 0, OD_ALL_MATERIALS.length - 1);
      const gainedMat = OD_ALL_MATERIALS[matRng.value];

      const newInventory = [...prev.odInventory];
      const existingIdx = newInventory.findIndex((i) => i.materialId === gainedMat);
      if (existingIdx >= 0) {
        newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: newInventory[existingIdx].quantity + matCount.value };
      } else {
        newInventory.push({ materialId: gainedMat, quantity: matCount.value });
      }

      eventId = chosen;
      return {
        ...prev,
        rngSeed: matRng.nextSeed,
        activeEventId: chosen,
        eventEndTime: eventEndTime,
        odEvents: [...prev.odEvents, chosen],
        odInventory: newInventory,
        odStats: {
          ...prev.odStats,
          totalEventsTriggered: prev.odStats.totalEventsTriggered + 1,
          totalMaterialsCollected: prev.odStats.totalMaterialsCollected + matCount.value,
        },
        realmLog: [...prev.realmLog, `Event triggered: ${ed.name} — ${ed.description}. Gained ${matCount.value}x ${gainedMat}.`],
      };
    });
    return eventId;
  }, []);

  // ----------------------------------------------------------
  // Action: resetOnyxDomain
  // ----------------------------------------------------------

  const odAPIResetOnyxDomain = useCallback((): void => {
    odAPISetState(odCreateInitialState());
  }, []);

  // ----------------------------------------------------------
  // Additional Actions
  // ----------------------------------------------------------

  const odAPIAddMaterial = useCallback((materialId: string, quantity: number): boolean => {
    let success = false;
    odAPISetState((prev) => {
      const md = OD_MATERIAL_DATA[materialId];
      if (!md) return prev;
      if (quantity <= 0) return prev;

      success = true;
      const newInventory = [...prev.odInventory];
      const existingIdx = newInventory.findIndex((i) => i.materialId === materialId);
      if (existingIdx >= 0) {
        newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: newInventory[existingIdx].quantity + quantity };
      } else {
        newInventory.push({ materialId, quantity });
      }

      return {
        ...prev,
        odInventory: newInventory,
        odStats: {
          ...prev.odStats,
          totalMaterialsCollected: prev.odStats.totalMaterialsCollected + quantity,
        },
      };
    });
    return success;
  }, []);

  const odAPIRemoveMaterial = useCallback((materialId: string, quantity: number): boolean => {
    let success = false;
    odAPISetState((prev) => {
      if (quantity <= 0) return prev;
      const existingIdx = prev.odInventory.findIndex((i) => i.materialId === materialId);
      if (existingIdx < 0) return prev;
      if (prev.odInventory[existingIdx].quantity < quantity) return prev;

      success = true;
      const newInventory = [...prev.odInventory];
      const newQty = newInventory[existingIdx].quantity - quantity;
      if (newQty <= 0) {
        newInventory.splice(existingIdx, 1);
      } else {
        newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: newQty };
      }

      return { ...prev, odInventory: newInventory };
    });
    return success;
  }, []);

  const odAPIUpgradeShade = useCallback((shadeId: string): boolean => {
    let success = false;
    odAPISetState((prev) => {
      const ss = prev.odShades[shadeId];
      const sd = OD_SHADE_DATA[shadeId];
      if (!ss || !sd) return prev;
      if (!ss.bound) return prev;
      if (ss.level >= 10) return prev;

      const xpNeeded = odXpForLevel(ss.level + 1);
      success = true;
      return {
        ...prev,
        odShades: {
          ...prev.odShades,
          [shadeId]: { ...ss, level: ss.level + 1, xp: ss.xp + xpNeeded, bondStrength: ss.bondStrength + 5 },
        },
        realmLog: [...prev.realmLog, `${sd.name} upgraded to level ${ss.level + 1}. Bond strength increased.`],
      };
    });
    return success;
  }, []);

  const odAPISelectTitle = useCallback((title: string): boolean => {
    let success = false;
    odAPISetState((prev) => {
      if (!OD_ALL_TITLES.includes(title)) return prev;
      success = true;
      return {
        ...prev,
        odTitle: title,
        odTitle: title,
        realmLog: [...prev.realmLog, `Title changed to: ${title}.`],
      };
    });
    return success;
  }, []);

  const odAPICheckAchievements = useCallback((): string[] => {
    const newAch: string[] = [];
    odAPISetState((prev) => {
      const checks: Array<{ id: string; unlocked: boolean }> = [];

      if (prev.odStats.totalBound >= 1 && !prev.odAchievements.includes(OD_ACHIEVEMENT_FIRST_BINDING)) {
        checks.push({ id: OD_ACHIEVEMENT_FIRST_BINDING, unlocked: true });
      }
      if (prev.odStats.totalBound >= 10 && !prev.odAchievements.includes(OD_ACHIEVEMENT_SHADE_COLLECTOR)) {
        checks.push({ id: OD_ACHIEVEMENT_SHADE_COLLECTOR, unlocked: true });
      }
      if (prev.odStats.totalCorrupted >= 3 && !prev.odAchievements.includes(OD_ACHIEVEMENT_REALM_CORRUPTOR)) {
        checks.push({ id: OD_ACHIEVEMENT_REALM_CORRUPTOR, unlocked: true });
      }
      if (prev.odStats.totalBuilt >= 10 && !prev.odAchievements.includes(OD_ACHIEVEMENT_MASTER_BUILDER)) {
        checks.push({ id: OD_ACHIEVEMENT_MASTER_BUILDER, unlocked: true });
      }
      if (prev.odArtifacts.length >= 3 && !prev.odAchievements.includes(OD_ACHIEVEMENT_ARTIFACT_HUNTER)) {
        checks.push({ id: OD_ACHIEVEMENT_ARTIFACT_HUNTER, unlocked: true });
      }
      if (prev.odStats.totalMaterialsCollected >= 500 && !prev.odAchievements.includes(OD_ACHIEVEMENT_MATERIAL_HOARDER)) {
        checks.push({ id: OD_ACHIEVEMENT_MATERIAL_HOARDER, unlocked: true });
      }
      if (prev.level >= 15 && !prev.odAchievements.includes(OD_ACHIEVEMENT_DARK_SCHOLAR)) {
        checks.push({ id: OD_ACHIEVEMENT_DARK_SCHOLAR, unlocked: true });
      }
      if (prev.odStats.totalEventsTriggered >= 5 && !prev.odAchievements.includes(OD_ACHIEVEMENT_EVENT_SURVIVOR)) {
        checks.push({ id: OD_ACHIEVEMENT_EVENT_SURVIVOR, unlocked: true });
      }
      if (prev.odStats.totalCorrupted >= 8 && !prev.odAchievements.includes(OD_ACHIEVEMENT_FULL_CORRUPTION)) {
        checks.push({ id: OD_ACHIEVEMENT_FULL_CORRUPTION, unlocked: true });
      }
      if (prev.level >= 40 && !prev.odAchievements.includes(OD_ACHIEVEMENT_ONYX_COMPLETE)) {
        checks.push({ id: OD_ACHIEVEMENT_ONYX_COMPLETE, unlocked: true });
      }
      if (prev.odArtifacts.length >= 14 && !prev.odAchievements.includes(OD_ACHIEVEMENT_DOMINION)) {
        checks.push({ id: OD_ACHIEVEMENT_DOMINION, unlocked: true });
      }

      const boundShades = OD_ALL_SHADES.filter((id) => prev.odShades[id]?.bound === true);
      const legendaryCount = boundShades.filter((id) => OD_SHADE_DATA[id]?.rarity === OD_RARITY_LEGENDARY).length;
      if (legendaryCount >= 3 && !prev.odAchievements.includes(OD_ACHIEVEMENT_LEGENDARY_BINDER)) {
        checks.push({ id: OD_ACHIEVEMENT_LEGENDARY_BINDER, unlocked: true });
      }
      if (boundShades.some((id) => OD_SHADE_DATA[id]?.shadeType === OD_TYPE_ABYSS_TITAN) && !prev.odAchievements.includes(OD_ACHIEVEMENT_TITAN_TAMER)) {
        checks.push({ id: OD_ACHIEVEMENT_TITAN_TAMER, unlocked: true });
      }
      if (prev.odShades[OD_SHADE_PRIMORDIAL_TITAN]?.bound && !prev.odAchievements.includes(OD_ACHIEVEMENT_PRIMORDIAL)) {
        checks.push({ id: OD_ACHIEVEMENT_PRIMORDIAL, unlocked: true });
      }

      const houndBound = boundShades.filter((id) => OD_SHADE_DATA[id]?.shadeType === OD_TYPE_NIGHTMARE_HOUND).length;
      if (houndBound >= 5 && !prev.odAchievements.includes(OD_ACHIEVEMENT_NIGHTMARE_LORD)) {
        checks.push({ id: OD_ACHIEVEMENT_NIGHTMARE_LORD, unlocked: true });
      }

      const builtStructs = Object.keys(prev.structureLevels).length;
      if (builtStructs >= 25 && !prev.odAchievements.includes(OD_ACHIEVEMENT_STRUCTURE_MOGUL)) {
        checks.push({ id: OD_ACHIEVEMENT_STRUCTURE_MOGUL, unlocked: true });
      }

      if (boundShades.length >= 35 && !prev.odAchievements.includes(OD_ACHIEVEMENT_ALL_SHADES_BOUND)) {
        checks.push({ id: OD_ACHIEVEMENT_ALL_SHADES_BOUND, unlocked: true });
      }

      const abilityCount = OD_ALL_STRUCTURES.filter((sid) => {
        const lv = prev.structureLevels[sid];
        const sData = OD_STRUCTURE_DATA[sid];
        return lv && lv >= 1 && sData && sData.abilityUnlock;
      }).length;
      if (abilityCount >= 15 && !prev.odAchievements.includes(OD_ACHIEVEMENT_ABILITY_MASTER)) {
        checks.push({ id: OD_ACHIEVEMENT_ABILITY_MASTER, unlocked: true });
      }

      for (const check of checks) {
        newAch.push(check.id);
      }

      if (checks.length === 0) return prev;

      const logEntries = checks.map((c) => {
        const ad = OD_ACHIEVEMENT_DATA[c.id];
        return ad ? `Achievement unlocked: ${ad.name} — ${ad.description}` : '';
      }).filter(Boolean);

      return {
        ...prev,
        odAchievements: [...prev.odAchievements, ...checks.map((c) => c.id)],
        realmLog: [...prev.realmLog, ...logEntries],
      };
    });
    return newAch;
  }, []);

  const odAPIGetShadeListByType = useCallback((shadeType: string): string[] => {
    return OD_ALL_SHADES.filter((id) => OD_SHADE_DATA[id]?.shadeType === shadeType);
  }, []);

  const odAPIGetShadeListByRarity = useCallback((rarity: string): string[] => {
    return OD_ALL_SHADES.filter((id) => OD_SHADE_DATA[id]?.rarity === rarity);
  }, []);

  const odAPIGetStructureUpgradeCost = useCallback((structureId: string): number => {
    const sd = OD_STRUCTURE_DATA[structureId];
    if (!sd) return 0;
    const currentLevel = odAPIStateRef.current.structureLevels[structureId] ?? 0;
    if (currentLevel < 1) return sd.baseCost;
    return Math.floor(sd.baseCost * Math.pow(sd.costMultiplier, currentLevel));
  }, []);

  const odAPIGetShadeBindCost = useCallback((shadeId: string): number => {
    const sd = OD_SHADE_DATA[shadeId];
    if (!sd) return 0;
    return sd.bindCost;
  }, []);

  const odAPIGetRealmCorruptProgress = useCallback((realmId: string): { current: number; max: number; corrupted: boolean } => {
    const rs = odAPIStateRef.current.odRealms[realmId];
    if (!rs) return { current: 0, max: 100, corrupted: false };
    return { current: rs.corruptionLevel, max: rs.maxCorruption, corrupted: rs.corrupted };
  }, []);

  const odAPIGetPlayerStats = useCallback((): {
    level: number; xp: number; xpToNext: number; title: string;
    totalBound: number; totalCorrupted: number; totalBuilt: number;
    totalActivated: number; totalEventsTriggered: number;
    totalMaterialsCollected: number; totalXpGained: number;
  } => {
    const s = odAPIStateRef.current;
    return {
      level: s.level,
      xp: s.experience,
      xpToNext: odXpForLevel(s.level),
      title: s.odTitle,
      totalBound: s.odStats.totalBound,
      totalCorrupted: s.odStats.totalCorrupted,
      totalBuilt: s.odStats.totalBuilt,
      totalActivated: s.odStats.totalActivated,
      totalEventsTriggered: s.odStats.totalEventsTriggered,
      totalMaterialsCollected: s.odStats.totalMaterialsCollected,
      totalXpGained: s.odStats.totalXpGained,
    };
  }, []);

  const odAPIGetRealmMaterials = useCallback((realmId: string): string[] => {
    const rd = OD_REALM_DATA[realmId];
    return rd ? [...rd.resources] : [];
  }, []);

  const odAPIGetRealmShadePool = useCallback((realmId: string): string[] => {
    const rd = OD_REALM_DATA[realmId];
    return rd ? [...rd.shadePool] : [];
  }, []);

  const odAPIGetSnapshot = useCallback((): OnyxDomainState => {
    return { ...odAPIStateRef.current };
  }, []);

  const odAPILoadState = useCallback((saved: OnyxDomainState): void => {
    odAPISetState(saved);
  }, []);

  // ----------------------------------------------------------
  // Additional Actions
  // ----------------------------------------------------------

  const odAPICollectFromRealm = useCallback((realmId: string): { materialId: string; quantity: number } | null => {
    let result: { materialId: string; quantity: number } | null = null;
    odAPISetState((prev) => {
      const rd = OD_REALM_DATA[realmId];
      if (!rd) return prev;
      const rs = prev.odRealms[realmId];
      if (!rs || !rs.corrupted) return prev;

      const rng = odRollInRange(prev.rngSeed, 0, rd.resources.length - 1);
      const matRng = odRollInRange(rng.nextSeed, 1, 3);
      const chosenMat = rd.resources[rng.value];
      const eventMult = (prev.activeEventId && OD_EVENT_DATA[prev.activeEventId])
        ? OD_EVENT_DATA[prev.activeEventId].rewardMultiplier
        : 1.0;
      const qty = Math.floor(matRng.value * eventMult);

      const newInventory = [...prev.odInventory];
      const existingIdx = newInventory.findIndex((i) => i.materialId === chosenMat);
      if (existingIdx >= 0) {
        newInventory[existingIdx] = { ...newInventory[existingIdx], quantity: newInventory[existingIdx].quantity + qty };
      } else {
        newInventory.push({ materialId: chosenMat, quantity: qty });
      }

      result = { materialId: chosenMat, quantity: qty };
      return {
        ...prev,
        rngSeed: matRng.nextSeed,
        odInventory: newInventory,
        odStats: {
          ...prev.odStats,
          totalMaterialsCollected: prev.odStats.totalMaterialsCollected + qty,
        },
        realmLog: [...prev.realmLog, `Collected ${qty}x ${chosenMat} from ${rd.name}.`],
      };
    });
    return result;
  }, []);

  const odAPITrainShade = useCallback((shadeId: string): boolean => {
    let success = false;
    odAPISetState((prev) => {
      const ss = prev.odShades[shadeId];
      const sd = OD_SHADE_DATA[shadeId];
      if (!ss || !sd) return prev;
      if (!ss.bound) return prev;
      if (ss.bondStrength < 10) return prev;

      const cost = Math.floor(sd.bindCost * 0.5);
      const bondCost = 10;
      const newBond = ss.bondStrength - bondCost;
      const xpGain = Math.floor(sd.xpReward * 2);

      success = true;
      return {
        ...prev,
        experience: prev.experience + xpGain,
        odShades: {
          ...prev.odShades,
          [shadeId]: { ...ss, xp: ss.xp + xpGain, bondStrength: newBond },
        },
        odStats: {
          ...prev.odStats,
          totalXpGained: prev.odStats.totalXpGained + xpGain,
        },
        realmLog: [...prev.realmLog, `Trained ${sd.name}: +${xpGain} XP. Bond strength: ${newBond}.`],
      };
    });
    return success;
  }, []);

  const odAPIDeactivateEvent = useCallback((): void => {
    odAPISetState((prev) => {
      if (!prev.activeEventId) return prev;
      return {
        ...prev,
        activeEventId: null,
        eventEndTime: null,
        realmLog: [...prev.realmLog, `Manually ended event "${prev.activeEventId}".`],
      };
    });
  }, []);

  const odAPIGetShadeTypeBreakdown = useCallback((): Record<string, number> => {
    const breakdown: Record<string, number> = {};
    for (const typeId of OD_ALL_SHADE_TYPES) {
      breakdown[typeId] = 0;
    }
    for (const shadeId of OD_ALL_SHADES) {
      const ss = odAPIStateRef.current.odShades[shadeId];
      const sd = OD_SHADE_DATA[shadeId];
      if (ss && ss.bound && sd) {
        breakdown[sd.shadeType] = (breakdown[sd.shadeType] ?? 0) + 1;
      }
    }
    return breakdown;
  }, []);

  const odAPIGetRarityBreakdown = useCallback((): Record<string, number> => {
    const breakdown: Record<string, number> = {};
    for (const rarity of OD_ALL_RARITIES) {
      breakdown[rarity] = 0;
    }
    for (const shadeId of OD_ALL_SHADES) {
      const ss = odAPIStateRef.current.odShades[shadeId];
      const sd = OD_SHADE_DATA[shadeId];
      if (ss && ss.bound && sd) {
        breakdown[sd.rarity] = (breakdown[sd.rarity] ?? 0) + 1;
      }
    }
    return breakdown;
  }, []);

  const odAPIGetMaterialCount = useCallback((materialId: string): number => {
    const item = odAPIStateRef.current.odInventory.find((i) => i.materialId === materialId);
    return item ? item.quantity : 0;
  }, []);

  const odAPIGetStructureLevel = useCallback((structureId: string): number => {
    return odAPIStateRef.current.structureLevels[structureId] ?? 0;
  }, []);

  const odAPIIsEventActive = useCallback((): boolean => {
    const s = odAPIStateRef.current;
    if (!s.activeEventId || !s.eventEndTime) return false;
    return s.eventEndTime > Date.now();
  }, []);

  const odAPIGetEventTimeRemaining = useCallback((): number => {
    const s = odAPIStateRef.current;
    if (!s.activeEventId || !s.eventEndTime) return 0;
    const remaining = s.eventEndTime - Date.now();
    return remaining > 0 ? remaining : 0;
  }, []);

  const odAPIGetShadeBondStrength = useCallback((shadeId: string): number => {
    const ss = odAPIStateRef.current.odShades[shadeId];
    return ss ? ss.bondStrength : 0;
  }, []);

  const odAPIGetTotalInventoryValue = useCallback((): number => {
    let total = 0;
    for (const item of odAPIStateRef.current.odInventory) {
      const md = OD_MATERIAL_DATA[item.materialId];
      if (md) {
        const rarityMult = OD_RARITY_MULTIPLIER[md.rarity] ?? 1.0;
        total += item.quantity * rarityMult;
      }
    }
    return total;
  }, []);

  const odAPIGetRealmCapacityInfo = useCallback((realmId: string): { used: number; max: number } => {
    const rd = OD_REALM_DATA[realmId];
    if (!rd) return { used: 0, max: 0 };
    const shadesInRealm = OD_ALL_SHADES.filter((id) => {
      const sd = OD_SHADE_DATA[id];
      return sd && rd.shadePool.includes(id) && odAPIStateRef.current.odShades[id]?.bound;
    }).length;
    return { used: shadesInRealm, max: rd.capacity };
  }, []);

  // ----------------------------------------------------------
  // Effect — check event expiry
  // ----------------------------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      const state = odAPIStateRef.current;
      if (state.activeEventId && state.eventEndTime && state.eventEndTime < Date.now()) {
        odAPISetState((prev) => ({
          ...prev,
          activeEventId: null,
          eventEndTime: null,
          realmLog: [...prev.realmLog, `Event "${prev.activeEventId}" has ended.`],
        }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------------
  // Return object — odAPI
  // ----------------------------------------------------------

  return {
    // Constants
    OD_COLOR_ONYX_BLACK,
    OD_COLOR_SHADOW_PURPLE,
    OD_COLOR_ABYSS_BLUE,
    OD_COLOR_VOID_RED,
    OD_COLOR_OBSIDIAN_GRAY,
    OD_COLOR_TWILIGHT_VIOLET,
    OD_ALL_COLORS,
    OD_RARITY_COMMON,
    OD_RARITY_UNCOMMON,
    OD_RARITY_RARE,
    OD_RARITY_EPIC,
    OD_RARITY_LEGENDARY,
    OD_ALL_RARITIES,
    OD_RARITY_MULTIPLIER,
    OD_TYPE_VOID_WRAITH,
    OD_TYPE_SHADOW_GOLEM,
    OD_TYPE_OBSIDIAN_KNIGHT,
    OD_TYPE_DARK_SORCERER,
    OD_TYPE_NIGHTMARE_HOUND,
    OD_TYPE_PHANTOM_SPY,
    OD_TYPE_ABYSS_TITAN,
    OD_ALL_SHADE_TYPES,
    OD_ALL_SHADES,
    OD_ALL_REALMS,
    OD_ALL_MATERIALS,
    OD_ALL_STRUCTURES,
    OD_ALL_ABILITIES,
    OD_ALL_ACHIEVEMENTS,
    OD_ALL_TITLES,
    OD_ALL_ARTIFACTS,
    OD_ALL_EVENTS,

    // State accessor
    odAPIState,

    // Computed values
    odAPIBoundShadeCount,
    odAPICorruptedRealmCount,
    odAPIBoundShadeIds,
    odAPICorruptedRealmIds,
    odAPIInventoryCount,
    odAPITotalMaterials,
    odAPIActiveEventData,
    odAPIBuildStructureCount,
    odAPIUnlockedAbilities,
    odAPIDomainPower,
    odAPIShadeProgress,
    odAPIRealmProgress,
    odAPIArtifactProgress,
    odAPIAvailableTitles,

    // Data lookups
    odAPIGetShadeData,
    odAPIGetRealmData,
    odAPIGetMaterialData,
    odAPIGetStructureData,
    odAPIGetAbilityData,
    odAPIGetAchievementData,
    odAPIGetArtifactData,
    odAPIGetEventData,
    odAPIGetRarityMultiplier,
    odAPIRarityLabel,
    odAPIXpForNextLevel,

    // Status helpers
    odAPIGetStructureUpgradeCost,
    odAPIGetShadeBindCost,
    odAPIGetRealmCorruptProgress,
    odAPIGetPlayerStats,
    odAPIGetRealmMaterials,
    odAPIGetRealmShadePool,
    odAPIGetShadeListByType,
    odAPIGetShadeListByRarity,

    // Actions
    odAPIBindShade,
    odAPICorruptRealm,
    odAPIBuildStructure,
    odAPIActivateArtifact,
    odAPITriggerDomainEvent,
    odAPIResetOnyxDomain,
    odAPIAddMaterial,
    odAPIRemoveMaterial,
    odAPIUpgradeShade,
    odAPISelectTitle,
    odAPICheckAchievements,
    odAPICollectFromRealm,
    odAPITrainShade,
    odAPIDeactivateEvent,
    odAPILoadState,
    odAPIGetSnapshot,

    // Extended helpers
    odAPIGetShadeTypeBreakdown,
    odAPIGetRarityBreakdown,
    odAPIGetMaterialCount,
    odAPIGetStructureLevel,
    odAPIIsEventActive,
    odAPIGetEventTimeRemaining,
    odAPIGetShadeBondStrength,
    odAPIGetTotalInventoryValue,
    odAPIGetRealmCapacityInfo,
  };
}
