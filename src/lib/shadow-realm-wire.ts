import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// ============================================================
// Seeded PRNG — mulberry32
// ============================================================

function srAdvanceRng(seed: number): { value: number; nextSeed: number } {
  const s = (seed + 0x6D2B79F5) >>> 0;
  let t = s;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return { value: ((t ^ t >>> 14) >>> 0) / 4294967296, nextSeed: s };
}

function srRollInRange(seed: number, min: number, max: number): { value: number; nextSeed: number } {
  const r = srAdvanceRng(seed);
  return { value: min + Math.floor(r.value * (max - min + 1)), nextSeed: r.nextSeed };
}

function srPickRandom<T>(seed: number, arr: T[]): { item: T; nextSeed: number } {
  if (arr.length === 0) return { item: arr[0] as T, nextSeed: seed };
  const r = srAdvanceRng(seed);
  return { item: arr[Math.floor(r.value * arr.length)], nextSeed: r.nextSeed };
}

// ============================================================
// Color Constants — Shadow Black / Eclipse Purple / Midnight Blue / Dark Crimson / Phantom Silver
// ============================================================

export const SR_COLOR_SHADOW_BLACK = '#0A0A0F';
export const SR_COLOR_ECLIPSE_PURPLE = '#2D1B4E';
export const SR_COLOR_MIDNIGHT_BLUE = '#0F1629';
export const SR_COLOR_DARK_CRIMSON = '#4A0E0E';
export const SR_COLOR_PHANTOM_SILVER = '#B8C0CC';
export const SR_COLOR_VOID_INDIGO = '#1A103C';
export const SR_ALL_COLORS: string[] = [
  SR_COLOR_SHADOW_BLACK, SR_COLOR_ECLIPSE_PURPLE, SR_COLOR_MIDNIGHT_BLUE,
  SR_COLOR_DARK_CRIMSON, SR_COLOR_PHANTOM_SILVER, SR_COLOR_VOID_INDIGO,
];

// ============================================================
// Rarity Constants (5 tiers: Common, Unusual, Rare, Epic, Legendary)
// ============================================================

export const SR_RARITY_COMMON = 'common';
export const SR_RARITY_UNUSUAL = 'unusual';
export const SR_RARITY_RARE = 'rare';
export const SR_RARITY_EPIC = 'epic';
export const SR_RARITY_LEGENDARY = 'legendary';
export const SR_ALL_RARITIES: string[] = [
  SR_RARITY_COMMON, SR_RARITY_UNUSUAL, SR_RARITY_RARE,
  SR_RARITY_EPIC, SR_RARITY_LEGENDARY,
];
export const SR_RARITY_MULTIPLIER: Record<string, number> = {
  [SR_RARITY_COMMON]: 1.0,
  [SR_RARITY_UNUSUAL]: 1.5,
  [SR_RARITY_RARE]: 2.5,
  [SR_RARITY_EPIC]: 4.0,
  [SR_RARITY_LEGENDARY]: 7.0,
};

// ============================================================
// Shadow Domain Constants (8 domains)
// ============================================================

export const SR_DOMAIN_ECLIPSE_CITADEL = 'eclipse_citadel';
export const SR_DOMAIN_VOID_ABYSS = 'void_abyss';
export const SR_DOMAIN_PHANTOM_MARSH = 'phantom_marsh';
export const SR_DOMAIN_TWILIGHT_MAUSOLEUM = 'twilight_mausoleum';
export const SR_DOMAIN_SHADOWFORGE = 'shadowforge';
export const SR_DOMAIN_DUSKTHRONE = 'duskthrone';
export const SR_DOMAIN_OBLIVION_PIT = 'oblivion_pit';
export const SR_DOMAIN_CORONAL_PEAK = 'coronal_peak';
export const SR_ALL_DOMAINS: string[] = [
  SR_DOMAIN_ECLIPSE_CITADEL, SR_DOMAIN_VOID_ABYSS, SR_DOMAIN_PHANTOM_MARSH,
  SR_DOMAIN_TWILIGHT_MAUSOLEUM, SR_DOMAIN_SHADOWFORGE, SR_DOMAIN_DUSKTHRONE,
  SR_DOMAIN_OBLIVION_PIT, SR_DOMAIN_CORONAL_PEAK,
];

// ============================================================
// Shadow Entity Constants (35 entities, 5 rarity tiers)
// ============================================================

export const SR_ENTITY_SHADELING = 'shadeling';
export const SR_ENTITY_DUSK_IMP = 'dusk_imp';
export const SR_ENTITY_VOID_MITE = 'void_mite';
export const SR_ENTITY_SHADOW_WISP = 'shadow_wisp';
export const SR_ENTITY_GLOOM_SPARK = 'gloom_spark';
export const SR_ENTITY_NIGHT_TWIN = 'night_twin';
export const SR_ENTITY_UMBRA_SPIDER = 'umbra_spider';
export const SR_ENTITY_ECLIPSE_MOTH = 'eclipse_moth';
export const SR_ENTITY_FOG_PHANTOM = 'fog_phantom';
export const SR_ENTITY_DARKLING = 'darkling';
export const SR_ENTITY_SHADOW_STALKER = 'shadow_stalker';
export const SR_ENTITY_VOID_HOUND = 'void_hound';
export const SR_ENTITY_TWILIGHT_SERPENT = 'twilight_serpent';
export const SR_ENTITY_UMBRAL_ARCHER = 'umbral_archer';
export const SR_ENTITY_PHANTOM_SCOUT = 'phantom_scout';
export const SR_ENTITY_MIDNIGHT_FOX = 'midnight_fox';
export const SR_ENTITY_ABYSSAL_CREEPER = 'abyssal_creeper';
export const SR_ENTITY_SHADOW_WYRM = 'shadow_wyrm';
export const SR_ENTITY_DARK_SENTINEL = 'dark_sentinel';
export const SR_ENTITY_VOID_RIPPER = 'void_ripper';
export const SR_ENTITY_CRIMSON_BANSHEE = 'crimson_banshee';
export const SR_ENTITY_TWILIGHT_GOLEM = 'twilight_golem';
export const SR_ENTITY_PHANTOM_WARRIOR = 'phantom_warrior';
export const SR_ENTITY_SHADOW_ASSASSIN = 'shadow_assassin';
export const SR_ENTITY_OBLIVION_REAPER = 'oblivion_reaper';
export const SR_ENTITY_ECLIPSE_DRAGON = 'eclipse_dragon';
export const SR_ENTITY_VOID_TITAN = 'void_titan';
export const SR_ENTITY_DUSK_LORD = 'dusk_lord';
export const SR_ENTITY_SHADOW_PHOENIX = 'shadow_phoenix';
export const SR_ENTITY_CORONAL_SERAPH = 'coronal_seraph';
export const SR_ENTITY_ABYSS_SOVEREIGN = 'abyss_sovereign';
export const SR_ENTITY_OMEGA_PHANTOM = 'omega_phantom';
export const SR_ENTITY_ECLIPSE_EMPEROR = 'eclipse_emperor';
export const SR_ENTITY_VOID_LEVIATHAN = 'void_leviathan';
export const SR_ENTITY_SHADOW_PRIMORDIAL = 'shadow_primordial';
export const SR_ALL_ENTITIES: string[] = [
  SR_ENTITY_SHADELING, SR_ENTITY_DUSK_IMP, SR_ENTITY_VOID_MITE,
  SR_ENTITY_SHADOW_WISP, SR_ENTITY_GLOOM_SPARK, SR_ENTITY_NIGHT_TWIN,
  SR_ENTITY_UMBRA_SPIDER, SR_ENTITY_ECLIPSE_MOTH,
  SR_ENTITY_FOG_PHANTOM, SR_ENTITY_DARKLING, SR_ENTITY_SHADOW_STALKER,
  SR_ENTITY_VOID_HOUND, SR_ENTITY_TWILIGHT_SERPENT, SR_ENTITY_UMBRAL_ARCHER,
  SR_ENTITY_PHANTOM_SCOUT, SR_ENTITY_MIDNIGHT_FOX, SR_ENTITY_ABYSSAL_CREEPER,
  SR_ENTITY_SHADOW_WYRM, SR_ENTITY_DARK_SENTINEL, SR_ENTITY_VOID_RIPPER,
  SR_ENTITY_CRIMSON_BANSHEE, SR_ENTITY_TWILIGHT_GOLEM,
  SR_ENTITY_PHANTOM_WARRIOR, SR_ENTITY_SHADOW_ASSASSIN,
  SR_ENTITY_OBLIVION_REAPER, SR_ENTITY_ECLIPSE_DRAGON,
  SR_ENTITY_VOID_TITAN, SR_ENTITY_DUSK_LORD, SR_ENTITY_SHADOW_PHOENIX,
  SR_ENTITY_CORONAL_SERAPH, SR_ENTITY_ABYSS_SOVEREIGN,
  SR_ENTITY_OMEGA_PHANTOM, SR_ENTITY_ECLIPSE_EMPEROR,
  SR_ENTITY_VOID_LEVIATHAN, SR_ENTITY_SHADOW_PRIMORDIAL,
];

// ============================================================
// Shadow Relic Constants (30 relics)
// ============================================================

export const SR_RELIC_SHADOW_SHARD = 'shadow_shard';
export const SR_RELIC_DUSK_CRYSTAL = 'dusk_crystal';
export const SR_RELIC_VOID_ESSENCE = 'void_essence';
export const SR_RELIC_GLOOM_TEAR = 'gloom_tear';
export const SR_RELIC_NIGHTSTONE = 'nightstone';
export const SR_RELIC_UMBRA_ORB = 'umbra_orb';
export const SR_RELIC_ECLIPSE_FANG = 'eclipse_fang';
export const SR_RELIC_PHANTOM_CHAIN = 'phantom_chain';
export const SR_RELIC_TWILIGHT_LANTERN = 'twilight_lantern';
export const SR_RELIC_SHADOWBLADE_FRAG = 'shadowblade_frag';
export const SR_RELIC_CRIMSON_SIGIL = 'crimson_sigil';
export const SR_RELIC_VOID_HEART = 'void_heart';
export const SR_RELIC_DUSKTHRONE_SHARD = 'duskthrone_shard';
export const SR_RELIC_OBLIVION_CROWN = 'oblivion_crown';
export const SR_RELIC_SHADOWFORGE_HAMMER = 'shadowforge_hammer';
export const SR_RELIC_PHANTOM_WINGS = 'phantom_wings';
export const SR_RELIC_ECLIPSE_EYE = 'eclipse_eye';
export const SR_RELIC_MIDNIGHT_HORN = 'midnight_horn';
export const SR_RELIC_DARK_COMPASS = 'dark_compass';
export const SR_RELIC_VOID_GATE_KEY = 'void_gate_key';
export const SR_RELIC_SHADOW_CLOAK = 'shadow_cloak';
export const SR_RELIC_CRIMSON_CHALICE = 'crimson_chalice';
export const SR_RELIC_DUSK_SCEPTER = 'dusk_scepter';
export const SR_RELIC_TWILIGHT_MIRROR = 'twilight_mirror';
export const SR_RELIC_OBLIVION_ORB = 'oblivion_orb';
export const SR_RELIC_PHANTOM_HELM = 'phantom_helm';
export const SR_RELIC_SHADOW_SOUL_GEM = 'shadow_soul_gem';
export const SR_RELIC_ECLIPSE_RING = 'eclipse_ring';
export const SR_RELIC_VOID_DIAMOND = 'void_diamond';
export const SR_RELIC_CORONAL_PRISM = 'coronal_prism';
export const SR_ALL_RELICS: string[] = [
  SR_RELIC_SHADOW_SHARD, SR_RELIC_DUSK_CRYSTAL, SR_RELIC_VOID_ESSENCE,
  SR_RELIC_GLOOM_TEAR, SR_RELIC_NIGHTSTONE, SR_RELIC_UMBRA_ORB,
  SR_RELIC_ECLIPSE_FANG, SR_RELIC_PHANTOM_CHAIN, SR_RELIC_TWILIGHT_LANTERN,
  SR_RELIC_SHADOWBLADE_FRAG, SR_RELIC_CRIMSON_SIGIL, SR_RELIC_VOID_HEART,
  SR_RELIC_DUSKTHRONE_SHARD, SR_RELIC_OBLIVION_CROWN, SR_RELIC_SHADOWFORGE_HAMMER,
  SR_RELIC_PHANTOM_WINGS, SR_RELIC_ECLIPSE_EYE, SR_RELIC_MIDNIGHT_HORN,
  SR_RELIC_DARK_COMPASS, SR_RELIC_VOID_GATE_KEY, SR_RELIC_SHADOW_CLOAK,
  SR_RELIC_CRIMSON_CHALICE, SR_RELIC_DUSK_SCEPTER, SR_RELIC_TWILIGHT_MIRROR,
  SR_RELIC_OBLIVION_ORB, SR_RELIC_PHANTOM_HELM, SR_RELIC_SHADOW_SOUL_GEM,
  SR_RELIC_ECLIPSE_RING, SR_RELIC_VOID_DIAMOND, SR_RELIC_CORONAL_PRISM,
];

// ============================================================
// Shadow Structure Constants (25 structures)
// ============================================================

export const SR_STRUCT_SHADOW_TOWER = 'shadow_tower';
export const SR_STRUCT_DARK_ALTAR = 'dark_altar';
export const SR_STRUCT_UMBRA_BARRACKS = 'umbra_barracks';
export const SR_STRUCT_VOID_WELL = 'void_well';
export const SR_STRUCT_GLOOM_VAULT = 'gloom_vault';
export const SR_STRUCT_ECLIPSE_BASTION = 'eclipse_bastion';
export const SR_STRUCT_PHANTOM_GUILD = 'phantom_guild';
export const SR_STRUCT_SHADOWFORGE = 'shadowforge';
export const SR_STRUCT_DUSK_OBELISK = 'dusk_obelisk';
export const SR_STRUCT_TWILIGHT_ARCHIVE = 'twilight_archive';
export const SR_STRUCT_OBLIVION_GATE = 'oblivion_gate';
export const SR_STRUCT_CRIMSON_FORTRESS = 'crimson_fortress';
export const SR_STRUCT_NIGHTMARKET = 'nightmarket';
export const SR_STRUCT_DARK_LIBRARY = 'dark_library';
export const SR_STRUCT_SHADOW_ARENA = 'shadow_arena';
export const SR_STRUCT_VOID_OBSERVATORY = 'void_observatory';
export const SR_STRUCT_UMBRA_HOSPITAL = 'umbra_hospital';
export const SR_STRUCT_ECLIPSE_SHRINE = 'eclipse_shrine';
export const SR_STRUCT_PHANTOM_STABLES = 'phantom_stables';
export const SR_STRUCT_SHADOWFORGE_ANVIL = 'shadowforge_anvil';
export const SR_STRUCT_DUSKTHRONE_HALL = 'duskthrone_hall';
export const SR_STRUCT_CORONAL_BEACON = 'coronal_beacon';
export const SR_STRUCT_VOID_NEXUS = 'void_nexus';
export const SR_STRUCT_ABYSS_PRISON = 'abyss_prison';
export const SR_STRUCT_SHADOW_PALACE = 'shadow_palace';
export const SR_ALL_STRUCTURES: string[] = [
  SR_STRUCT_SHADOW_TOWER, SR_STRUCT_DARK_ALTAR, SR_STRUCT_UMBRA_BARRACKS,
  SR_STRUCT_VOID_WELL, SR_STRUCT_GLOOM_VAULT, SR_STRUCT_ECLIPSE_BASTION,
  SR_STRUCT_PHANTOM_GUILD, SR_STRUCT_SHADOWFORGE, SR_STRUCT_DUSK_OBELISK,
  SR_STRUCT_TWILIGHT_ARCHIVE, SR_STRUCT_OBLIVION_GATE, SR_STRUCT_CRIMSON_FORTRESS,
  SR_STRUCT_NIGHTMARKET, SR_STRUCT_DARK_LIBRARY, SR_STRUCT_SHADOW_ARENA,
  SR_STRUCT_VOID_OBSERVATORY, SR_STRUCT_UMBRA_HOSPITAL, SR_STRUCT_ECLIPSE_SHRINE,
  SR_STRUCT_PHANTOM_STABLES, SR_STRUCT_SHADOWFORGE_ANVIL, SR_STRUCT_DUSKTHRONE_HALL,
  SR_STRUCT_CORONAL_BEACON, SR_STRUCT_VOID_NEXUS, SR_STRUCT_ABYSS_PRISON,
  SR_STRUCT_SHADOW_PALACE,
];

// ============================================================
// Shadow Ability Constants (22 abilities)
// ============================================================

export const SR_ABILITY_SHADOW_STRIKE = 'shadow_strike';
export const SR_ABILITY_DUSK_SHIELD = 'dusk_shield';
export const SR_ABILITY_VOID_STEP = 'void_step';
export const SR_ABILITY_PHANTOM_BOND = 'phantom_bond';
export const SR_ABILITY_ECLIPSE_RAY = 'eclipse_ray';
export const SR_ABILITY_SHADOW_HARVEST = 'shadow_harvest';
export const SR_ABILITY_CRIMSON_FURY = 'crimson_fury';
export const SR_ABILITY_UMBRA_CLOAK = 'umbra_cloak';
export const SR_ABILITY_TWILIGHT_HEAL = 'twilight_heal';
export const SR_ABILITY_VOID_LEECH = 'void_leech';
export const SR_ABILITY_SHADOW_LEGION = 'shadow_legion';
export const SR_ABILITY_PHANTOM_MARCH = 'phantom_march';
export const SR_ABILITY_DARK_COMPASS_READ = 'dark_compass_read';
export const SR_ABILITY_ECLIPSE_BLESSING = 'eclipse_blessing';
export const SR_ABILITY_SHADOW_FORGE_CRAFT = 'shadow_forge_craft';
export const SR_ABILITY_OBLIVION_PULSE = 'oblivion_pulse';
export const SR_ABILITY_CRIMSON_BARRIER = 'crimson_barrier';
export const SR_ABILITY_DUSK_COMMAND = 'dusk_command';
export const SR_ABILITY_VOID_TORNADO = 'void_tornado';
export const SR_ABILITY_SHADOW_ASTRAL = 'shadow_astral';
export const SR_ABILITY_CORONAL_FLARE = 'coronal_flare';
export const SR_ABILITY_ECLIPSE_SOVEREIGNTY = 'eclipse_sovereignty';
export const SR_ALL_ABILITIES: string[] = [
  SR_ABILITY_SHADOW_STRIKE, SR_ABILITY_DUSK_SHIELD, SR_ABILITY_VOID_STEP,
  SR_ABILITY_PHANTOM_BOND, SR_ABILITY_ECLIPSE_RAY, SR_ABILITY_SHADOW_HARVEST,
  SR_ABILITY_CRIMSON_FURY, SR_ABILITY_UMBRA_CLOAK, SR_ABILITY_TWILIGHT_HEAL,
  SR_ABILITY_VOID_LEECH, SR_ABILITY_SHADOW_LEGION, SR_ABILITY_PHANTOM_MARCH,
  SR_ABILITY_DARK_COMPASS_READ, SR_ABILITY_ECLIPSE_BLESSING,
  SR_ABILITY_SHADOW_FORGE_CRAFT, SR_ABILITY_OBLIVION_PULSE,
  SR_ABILITY_CRIMSON_BARRIER, SR_ABILITY_DUSK_COMMAND,
  SR_ABILITY_VOID_TORNADO, SR_ABILITY_SHADOW_ASTRAL,
  SR_ABILITY_CORONAL_FLARE, SR_ABILITY_ECLIPSE_SOVEREIGNTY,
];

// ============================================================
// Achievement Constants (18 achievements)
// ============================================================

export const SR_ACHIEVEMENT_FIRST_HARVEST = 'first_harvest';
export const SR_ACHIEVEMENT_RELIC_COLLECTOR = 'relic_collector';
export const SR_ACHIEVEMENT_LEGION_COMMANDER = 'legion_commander';
export const SR_ACHIEVEMENT_PHANTOM_MASTER = 'phantom_master';
export const SR_ACHIEVEMENT_DOMAIN_CONQUEROR = 'domain_conqueror';
export const SR_ACHIEVEMENT_FORGED_IN_DARKNESS = 'forged_in_darkness';
export const SR_ACHIEVEMENT_ECLIPSE_SURVIVOR = 'eclipse_survivor';
export const SR_ACHIEVEMENT_DAILY_SHADOW = 'daily_shadow';
export const SR_ACHIEVEMENT_STRUCTURE_MAGNATE = 'structure_magnate';
export const SR_ACHIEVEMENT_LEGENDARY_HUNTER = 'legendary_hunter';
export const SR_ACHIEVEMENT_VOID_WALKER = 'void_walker';
export const SR_ACHIEVEMENT_DUSK_LORD_SLAYER = 'dusk_lord_slayer';
export const SR_ACHIEVEMENT_ABYSS_TAMER = 'abyss_tamer';
export const SR_ACHIEVEMENT_LEVEL_10 = 'level_10';
export const SR_ACHIEVEMENT_LEVEL_25 = 'level_25';
export const SR_ACHIEVEMENT_LEVEL_50 = 'level_50';
export const SR_ACHIEVEMENT_ALL_RELICS = 'all_relics';
export const SR_ACHIEVEMENT_ECLIPSE_SOVEREIGN = 'eclipse_sovereign_ach';
export const SR_ALL_ACHIEVEMENTS: string[] = [
  SR_ACHIEVEMENT_FIRST_HARVEST, SR_ACHIEVEMENT_RELIC_COLLECTOR,
  SR_ACHIEVEMENT_LEGION_COMMANDER, SR_ACHIEVEMENT_PHANTOM_MASTER,
  SR_ACHIEVEMENT_DOMAIN_CONQUEROR, SR_ACHIEVEMENT_FORGED_IN_DARKNESS,
  SR_ACHIEVEMENT_ECLIPSE_SURVIVOR, SR_ACHIEVEMENT_DAILY_SHADOW,
  SR_ACHIEVEMENT_STRUCTURE_MAGNATE, SR_ACHIEVEMENT_LEGENDARY_HUNTER,
  SR_ACHIEVEMENT_VOID_WALKER, SR_ACHIEVEMENT_DUSK_LORD_SLAYER,
  SR_ACHIEVEMENT_ABYSS_TAMER, SR_ACHIEVEMENT_LEVEL_10,
  SR_ACHIEVEMENT_LEVEL_25, SR_ACHIEVEMENT_LEVEL_50,
  SR_ACHIEVEMENT_ALL_RELICS, SR_ACHIEVEMENT_ECLIPSE_SOVEREIGN,
];

// ============================================================
// Title Constants (8 titles: Shadow Initiate → Eclipse Sovereign)
// ============================================================

export const SR_TITLE_SHADOW_INITIATE = 'Shadow Initiate';
export const SR_TITLE_DUSK_WALKER = 'Dusk Walker';
export const SR_TITLE_VOID_EXPLORER = 'Void Explorer';
export const SR_TITLE_PHANTOM_COMMANDER = 'Phantom Commander';
export const SR_TITLE_SHADOWFORGE_MASTER = 'Shadowforge Master';
export const SR_TITLE_DUSKLORD = 'Dusklord';
export const SR_TITLE_ABYSS_WARDEN = 'Abyss Warden';
export const SR_TITLE_ECLIPSE_SOVEREIGN = 'Eclipse Sovereign';
export const SR_ALL_TITLES: string[] = [
  SR_TITLE_SHADOW_INITIATE, SR_TITLE_DUSK_WALKER, SR_TITLE_VOID_EXPLORER,
  SR_TITLE_PHANTOM_COMMANDER, SR_TITLE_SHADOWFORGE_MASTER,
  SR_TITLE_DUSKLORD, SR_TITLE_ABYSS_WARDEN, SR_TITLE_ECLIPSE_SOVEREIGN,
];

// ============================================================
// Daily Quest Constants
// ============================================================

export const SR_QUEST_HARVEST_SHADOWS = 'harvest_shadows';
export const SR_QUEST_COMMAND_LEGION = 'command_legion';
export const SR_QUEST_FORGE_RELIC = 'forge_relic';
export const SR_QUEST_CONQUER_DOMAIN = 'conquer_domain';
export const SR_QUEST_BOND_PHANTOM = 'bond_phantom';
export const SR_QUEST_MANAGE_ECLIPSE = 'manage_eclipse';
export const SR_ALL_QUESTS: string[] = [
  SR_QUEST_HARVEST_SHADOWS, SR_QUEST_COMMAND_LEGION, SR_QUEST_FORGE_RELIC,
  SR_QUEST_CONQUER_DOMAIN, SR_QUEST_BOND_PHANTOM, SR_QUEST_MANAGE_ECLIPSE,
];

// ============================================================
// Interfaces
// ============================================================

export interface SrEntityData {
  name: string;
  shadowType: string;
  domain: string;
  darkPower: number;
  speed: number;
  description: string;
  xpReward: number;
  coinReward: number;
  relicDrop: string;
  legionSlot: string;
}

export interface SrDomainData {
  name: string;
  description: string;
  levelReq: number;
  entityPool: string[];
  dangerLevel: number;
  ambientColor: string;
  bossEntity: string;
}

export interface SrRelicData {
  name: string;
  rarity: string;
  darkPowerBonus: number;
  speedBonus: number;
  description: string;
  cost: number;
  levelReq: number;
}

export interface SrStructureData {
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  darkPowerPerLevel: number;
  coinPerLevel: number;
}

export interface SrAbilityData {
  name: string;
  description: string;
  abilityType: string;
  basePower: number;
  cooldown: number;
  unlockLevel: number;
  cost: number;
}

export interface SrAchievementData {
  name: string;
  description: string;
  checkFn: string;
}

export interface SrDailyQuestData {
  name: string;
  description: string;
  questType: string;
  targetCount: number;
  rewardCoins: number;
  rewardXp: number;
}

export interface SrCombatState {
  activeEntity: string | null;
  entityHp: number;
  entityMaxHp: number;
  playerShadow: number;
  maxShadow: number;
  turnsElapsed: number;
  isConquering: boolean;
  conquerProgress: number;
  conquerTarget: number;
}

export interface SrHarvestState {
  isHarvesting: boolean;
  harvestProgress: number;
  harvestTarget: number;
  shadowEssence: number;
  harvestsCompleted: number;
}

export interface SrLegionState {
  legionSize: number;
  maxLegionSize: number;
  legionMorale: number;
  phantomBonds: Record<string, number>;
  bondedPhantoms: string[];
}

export interface SrRelicForgeState {
  isForging: boolean;
  forgingRelic: string | null;
  forgeProgress: number;
  forgeTarget: number;
  relicsForged: number;
}

export interface SrEclipseState {
  eclipsePhase: number;
  eclipseIntensity: number;
  eclipseCooldown: number;
  eclipseActive: boolean;
  lastEclipseTime: number | null;
}

export interface SrDailyQuestState {
  activeQuest: string | null;
  questProgress: number;
  questTarget: number;
  questCompleted: boolean;
  questRewardClaimed: boolean;
  lastQuestDate: string | null;
  dailyQuestsCompleted: number;
}

export interface SrShadowRealmState {
  rngSeed: number;
  level: number;
  experience: number;
  coins: number;
  title: string;
  currentDomain: string;
  combat: SrCombatState;
  harvest: SrHarvestState;
  legion: SrLegionState;
  relicForge: SrRelicForgeState;
  eclipse: SrEclipseState;
  dailyQuest: SrDailyQuestState;
  defeatedEntities: string[];
  encounteredEntities: string[];
  relicsOwned: string[];
  equippedRelic: string | null;
  abilitiesUnlocked: string[];
  abilityLevels: Record<string, number>;
  structureLevels: Record<string, number>;
  shadowHarvestLevel: number;
  shadowHarvestXp: number;
  legionCommandLevel: number;
  legionCommandXp: number;
  relicForgeLevel: number;
  relicForgeXp: number;
  eclipseManagementLevel: number;
  eclipseManagementXp: number;
  phantomBondLevel: number;
  phantomBondXp: number;
  domainsConquered: string[];
  eventsParticipated: number[];
  achievements: string[];
  totalHarvested: number;
  totalEntitiesDefeated: number;
  totalCoinsEarned: number;
  totalRelicsForged: number;
  totalLegionsCommanded: number;
  totalPhantomsBonded: number;
  totalEclipsesManaged: number;
  realmLog: string[];
}

// ============================================================
// Entity Data (35 entities)
// ============================================================

const SR_ENTITY_DATA: Record<string, SrEntityData> = {
  [SR_ENTITY_SHADELING]: {
    name: 'Shadeling', shadowType: SR_RARITY_COMMON, domain: SR_DOMAIN_ECLIPSE_CITADEL,
    darkPower: 15, speed: 8,
    description: 'A tiny wisp of living shadow that skitters along walls, gathering fragments of darkness.',
    xpReward: 12, coinReward: 4, relicDrop: SR_RELIC_SHADOW_SHARD, legionSlot: 'scout',
  },
  [SR_ENTITY_DUSK_IMP]: {
    name: 'Dusk Imp', shadowType: SR_RARITY_COMMON, domain: SR_DOMAIN_ECLIPSE_CITADEL,
    darkPower: 18, speed: 10,
    description: 'A mischievous imp born from twilight, hurling curses at intruders from the shadows.',
    xpReward: 14, coinReward: 5, relicDrop: SR_RELIC_DUSK_CRYSTAL, legionSlot: 'scout',
  },
  [SR_ENTITY_VOID_MITE]: {
    name: 'Void Mite', shadowType: SR_RARITY_COMMON, domain: SR_DOMAIN_VOID_ABYSS,
    darkPower: 12, speed: 14,
    description: 'A microscopic void parasite that consumes light molecules, leaving trails of darkness.',
    xpReward: 10, coinReward: 3, relicDrop: SR_RELIC_VOID_ESSENCE, legionSlot: 'scout',
  },
  [SR_ENTITY_SHADOW_WISP]: {
    name: 'Shadow Wisp', shadowType: SR_RARITY_COMMON, domain: SR_DOMAIN_PHANTOM_MARSH,
    darkPower: 20, speed: 9,
    description: 'A flickering orb of condensed shadow that drifts through phantom marshlands at dusk.',
    xpReward: 15, coinReward: 5, relicDrop: SR_RELIC_GLOOM_TEAR, legionSlot: 'scout',
  },
  [SR_ENTITY_GLOOM_SPARK]: {
    name: 'Gloom Spark', shadowType: SR_RARITY_COMMON, domain: SR_DOMAIN_ECLIPSE_CITADEL,
    darkPower: 16, speed: 12,
    description: 'A crackling spark of gloom energy that jumps between shadow pools.',
    xpReward: 13, coinReward: 4, relicDrop: null, legionSlot: 'scout',
  },
  [SR_ENTITY_NIGHT_TWIN]: {
    name: 'Night Twin', shadowType: SR_RARITY_COMMON, domain: SR_DOMAIN_TWILIGHT_MAUSOLEUM,
    darkPower: 22, speed: 7,
    description: 'A pair of shadowy twins eternally mirror each other, confusing all who approach.',
    xpReward: 16, coinReward: 6, relicDrop: SR_RELIC_NIGHTSTONE, legionSlot: 'support',
  },
  [SR_ENTITY_UMBRA_SPIDER]: {
    name: 'Umbra Spider', shadowType: SR_RARITY_COMMON, domain: SR_DOMAIN_PHANTOM_MARSH,
    darkPower: 19, speed: 11,
    description: 'A spider that weaves webs of pure darkness across the phantom marshes.',
    xpReward: 14, coinReward: 5, relicDrop: SR_RELIC_UMBRA_ORB, legionSlot: 'scout',
  },
  [SR_ENTITY_ECLIPSE_MOTH]: {
    name: 'Eclipse Moth', shadowType: SR_RARITY_COMMON, domain: SR_DOMAIN_ECLIPSE_CITADEL,
    darkPower: 14, speed: 15,
    description: 'A moth drawn to eclipsed moonlight whose wings scatter darkness like pollen.',
    xpReward: 11, coinReward: 4, relicDrop: null, legionSlot: 'scout',
  },
  [SR_ENTITY_FOG_PHANTOM]: {
    name: 'Fog Phantom', shadowType: SR_RARITY_UNUSUAL, domain: SR_DOMAIN_PHANTOM_MARSH,
    darkPower: 40, speed: 6,
    description: 'A phantom formed from the dense fog of the marshlands, engulfing enemies in mist.',
    xpReward: 35, coinReward: 14, relicDrop: SR_RELIC_PHANTOM_CHAIN, legionSlot: 'support',
  },
  [SR_ENTITY_DARKLING]: {
    name: 'Darkling', shadowType: SR_RARITY_UNUSUAL, domain: SR_DOMAIN_VOID_ABYSS,
    darkPower: 45, speed: 9,
    description: 'A creature of solidified darkness that lurks in the deepest parts of the void.',
    xpReward: 38, coinReward: 16, relicDrop: SR_RELIC_SHADOWBLADE_FRAG, legionSlot: 'assault',
  },
  [SR_ENTITY_SHADOW_STALKER]: {
    name: 'Shadow Stalker', shadowType: SR_RARITY_UNUSUAL, domain: SR_DOMAIN_TWILIGHT_MAUSOLEUM,
    darkPower: 42, speed: 13,
    description: 'A silent predator that moves through shadows, striking from impossible angles.',
    xpReward: 36, coinReward: 15, relicDrop: SR_RELIC_SHADOW_CLOAK, legionSlot: 'assault',
  },
  [SR_ENTITY_VOID_HOUND]: {
    name: 'Void Hound', shadowType: SR_RARITY_UNUSUAL, domain: SR_DOMAIN_VOID_ABYSS,
    darkPower: 48, speed: 14,
    description: 'A spectral hound that hunts across dimensional boundaries, tracking targets by their shadow.',
    xpReward: 40, coinReward: 18, relicDrop: SR_RELIC_VOID_GATE_KEY, legionSlot: 'assault',
  },
  [SR_ENTITY_TWILIGHT_SERPENT]: {
    name: 'Twilight Serpent', shadowType: SR_RARITY_UNUSUAL, domain: SR_DOMAIN_TWILIGHT_MAUSOLEUM,
    darkPower: 38, speed: 10,
    description: 'A massive serpent that slithers between twilight dimensions, venom that dissolves light.',
    xpReward: 32, coinReward: 13, relicDrop: SR_RELIC_TWILIGHT_MIRROR, legionSlot: 'support',
  },
  [SR_ENTITY_UMBRAL_ARCHER]: {
    name: 'Umbral Archer', shadowType: SR_RARITY_UNUSUAL, domain: SR_DOMAIN_SHADOWFORGE,
    darkPower: 44, speed: 11,
    description: 'A shadow warrior whose arrows materialize from pure darkness mid-flight.',
    xpReward: 37, coinReward: 15, relicDrop: SR_RELIC_ECLIPSE_FANG, legionSlot: 'ranged',
  },
  [SR_ENTITY_PHANTOM_SCOUT]: {
    name: 'Phantom Scout', shadowType: SR_RARITY_UNUSUAL, domain: SR_DOMAIN_PHANTOM_MARSH,
    darkPower: 35, speed: 16,
    description: 'A ghostly scout that phases through walls to gather intelligence on enemy positions.',
    xpReward: 30, coinReward: 12, relicDrop: SR_RELIC_PHANTOM_WINGS, legionSlot: 'scout',
  },
  [SR_ENTITY_MIDNIGHT_FOX]: {
    name: 'Midnight Fox', shadowType: SR_RARITY_UNUSUAL, domain: SR_DOMAIN_DUSKTHRONE,
    darkPower: 41, speed: 18,
    description: 'A fox made of midnight shadows that moves faster than the eye can track.',
    xpReward: 34, coinReward: 14, relicDrop: SR_RELIC_DARK_COMPASS, legionSlot: 'scout',
  },
  [SR_ENTITY_ABYSSAL_CREEPER]: {
    name: 'Abyssal Creeper', shadowType: SR_RARITY_RARE, domain: SR_DOMAIN_OBLIVION_PIT,
    darkPower: 85, speed: 5,
    description: 'A massive entity from the deepest abyss that crawls forward relentlessly.',
    xpReward: 80, coinReward: 40, relicDrop: SR_RELIC_OBLIVION_CROWN, legionSlot: 'tank',
  },
  [SR_ENTITY_SHADOW_WYRM]: {
    name: 'Shadow Wyrm', shadowType: SR_RARITY_RARE, domain: SR_DOMAIN_SHADOWFORGE,
    darkPower: 90, speed: 7,
    description: 'A serpentine dragon of living shadow that burrows through dimensional barriers.',
    xpReward: 85, coinReward: 45, relicDrop: SR_RELIC_SHADOWFORGE_HAMMER, legionSlot: 'tank',
  },
  [SR_ENTITY_DARK_SENTINEL]: {
    name: 'Dark Sentinel', shadowType: SR_RARITY_RARE, domain: SR_DOMAIN_ECLIPSE_CITADEL,
    darkPower: 95, speed: 4,
    description: 'An ancient guardian encased in eclipse-forged armor that has stood for millennia.',
    xpReward: 90, coinReward: 48, relicDrop: SR_RELIC_DUSKTHRONE_SHARD, legionSlot: 'tank',
  },
  [SR_ENTITY_VOID_RIPPER]: {
    name: 'Void Ripper', shadowType: SR_RARITY_RARE, domain: SR_DOMAIN_VOID_ABYSS,
    darkPower: 88, speed: 12,
    description: 'A vicious void predator with claws that tear holes in the fabric of reality.',
    xpReward: 82, coinReward: 42, relicDrop: SR_RELIC_VOID_HEART, legionSlot: 'assault',
  },
  [SR_ENTITY_CRIMSON_BANSHEE]: {
    name: 'Crimson Banshee', shadowType: SR_RARITY_RARE, domain: SR_DOMAIN_DUSKTHRONE,
    darkPower: 80, speed: 10,
    description: 'A spectral wailer whose scream resonates with dark crimson frequencies.',
    xpReward: 75, coinReward: 38, relicDrop: SR_RELIC_CRIMSON_SIGIL, legionSlot: 'support',
  },
  [SR_ENTITY_TWILIGHT_GOLEM]: {
    name: 'Twilight Golem', shadowType: SR_RARITY_RARE, domain: SR_DOMAIN_TWILIGHT_MAUSOLEUM,
    darkPower: 100, speed: 3,
    description: 'A golem assembled from twilight stones, immune to most shadow attacks.',
    xpReward: 95, coinReward: 50, relicDrop: SR_RELIC_ECLIPSE_EYE, legionSlot: 'tank',
  },
  [SR_ENTITY_PHANTOM_WARRIOR]: {
    name: 'Phantom Warrior', shadowType: SR_RARITY_RARE, domain: SR_DOMAIN_PHANTOM_MARSH,
    darkPower: 82, speed: 8,
    description: 'A warrior spirit that fights with phantom steel forged in the marsh mists.',
    xpReward: 78, coinReward: 40, relicDrop: SR_RELIC_PHANTOM_HELM, legionSlot: 'assault',
  },
  [SR_ENTITY_SHADOW_ASSASSIN]: {
    name: 'Shadow Assassin', shadowType: SR_RARITY_RARE, domain: SR_DOMAIN_ECLIPSE_CITADEL,
    darkPower: 75, speed: 15,
    description: 'An elite shadow operative that strikes from darkness with lethal precision.',
    xpReward: 72, coinReward: 36, relicDrop: SR_RELIC_MIDNIGHT_HORN, legionSlot: 'assault',
  },
  [SR_ENTITY_OBLIVION_REAPER]: {
    name: 'Oblivion Reaper', shadowType: SR_RARITY_EPIC, domain: SR_DOMAIN_OBLIVION_PIT,
    darkPower: 180, speed: 8,
    description: 'A harvester of oblivion that reaps the shadows of defeated enemies to empower itself.',
    xpReward: 200, coinReward: 120, relicDrop: SR_RELIC_OBLIVION_ORB, legionSlot: 'assault',
  },
  [SR_ENTITY_ECLIPSE_DRAGON]: {
    name: 'Eclipse Dragon', shadowType: SR_RARITY_EPIC, domain: SR_DOMAIN_CORONAL_PEAK,
    darkPower: 200, speed: 6,
    description: 'A dragon that appears only during total eclipse, breathing streams of liquid shadow.',
    xpReward: 250, coinReward: 150, relicDrop: SR_RELIC_ECLIPSE_RING, legionSlot: 'tank',
  },
  [SR_ENTITY_VOID_TITAN]: {
    name: 'Void Titan', shadowType: SR_RARITY_EPIC, domain: SR_DOMAIN_VOID_ABYSS,
    darkPower: 220, speed: 3,
    description: 'A colossal being from the void that reshapes the terrain with each step.',
    xpReward: 280, coinReward: 170, relicDrop: SR_RELIC_VOID_DIAMOND, legionSlot: 'tank',
  },
  [SR_ENTITY_DUSK_LORD]: {
    name: 'Dusk Lord', shadowType: SR_RARITY_EPIC, domain: SR_DOMAIN_DUSKTHRONE,
    darkPower: 190, speed: 7,
    description: 'A noble of the dusk realm who commands lesser shadows with absolute authority.',
    xpReward: 220, coinReward: 130, relicDrop: SR_RELIC_DUSK_SCEPTER, legionSlot: 'support',
  },
  [SR_ENTITY_SHADOW_PHOENIX]: {
    name: 'Shadow Phoenix', shadowType: SR_RARITY_EPIC, domain: SR_DOMAIN_SHADOWFORGE,
    darkPower: 170, speed: 14,
    description: 'A phoenix reborn in shadow flames that resurrects stronger after each defeat.',
    xpReward: 190, coinReward: 110, relicDrop: SR_RELIC_SHADOW_SOUL_GEM, legionSlot: 'support',
  },
  [SR_ENTITY_CORONAL_SERAPH]: {
    name: 'Coronal Seraph', shadowType: SR_RARITY_EPIC, domain: SR_DOMAIN_CORONAL_PEAK,
    darkPower: 195, speed: 9,
    description: 'An angelic being corrupted by eclipse coronas, radiating dark holy energy.',
    xpReward: 230, coinReward: 140, relicDrop: SR_RELIC_CORONAL_PRISM, legionSlot: 'support',
  },
  [SR_ENTITY_ABYSS_SOVEREIGN]: {
    name: 'Abyss Sovereign', shadowType: SR_RARITY_LEGENDARY, domain: SR_DOMAIN_OBLIVION_PIT,
    darkPower: 400, speed: 5,
    description: 'The ruler of the deepest abyss who commands all void entities across dimensions.',
    xpReward: 600, coinReward: 400, relicDrop: SR_RELIC_OBLIVION_CROWN, legionSlot: 'tank',
  },
  [SR_ENTITY_OMEGA_PHANTOM]: {
    name: 'Omega Phantom', shadowType: SR_RARITY_LEGENDARY, domain: SR_DOMAIN_PHANTOM_MARSH,
    darkPower: 380, speed: 12,
    description: 'The original phantom from which all shadow spirits descend, an entity of pure will.',
    xpReward: 550, coinReward: 350, relicDrop: SR_RELIC_PHANTOM_WINGS, legionSlot: 'support',
  },
  [SR_ENTITY_ECLIPSE_EMPEROR]: {
    name: 'Eclipse Emperor', shadowType: SR_RARITY_LEGENDARY, domain: SR_DOMAIN_CORONAL_PEAK,
    darkPower: 450, speed: 7,
    description: 'The eternal ruler of eclipses whose presence blots out all celestial light.',
    xpReward: 700, coinReward: 500, relicDrop: SR_RELIC_ECLIPSE_RING, legionSlot: 'tank',
  },
  [SR_ENTITY_VOID_LEVIATHAN]: {
    name: 'Void Leviathan', shadowType: SR_RARITY_LEGENDARY, domain: SR_DOMAIN_VOID_ABYSS,
    darkPower: 500, speed: 4,
    description: 'A world-eating entity from beyond the void that devours dimensions whole.',
    xpReward: 800, coinReward: 600, relicDrop: SR_RELIC_VOID_DIAMOND, legionSlot: 'tank',
  },
  [SR_ENTITY_SHADOW_PRIMORDIAL]: {
    name: 'Shadow Primordial', shadowType: SR_RARITY_LEGENDARY, domain: SR_DOMAIN_DUSKTHRONE,
    darkPower: 550, speed: 6,
    description: 'The first shadow ever cast, the origin point of all darkness in existence.',
    xpReward: 1000, coinReward: 800, relicDrop: SR_RELIC_CORONAL_PRISM, legionSlot: 'assault',
  },
};

// ============================================================
// Domain Data (8 domains)
// ============================================================

const SR_DOMAIN_DATA: Record<string, SrDomainData> = {
  [SR_DOMAIN_ECLIPSE_CITADEL]: {
    name: 'Eclipse Citadel',
    description: 'A fortress of eclipsed stone where shadow legions train under a perpetually darkened sun. New initiates begin their journey here.',
    levelReq: 1,
    entityPool: [SR_ENTITY_SHADELING, SR_ENTITY_DUSK_IMP, SR_ENTITY_GLOOM_SPARK, SR_ENTITY_ECLIPSE_MOTH, SR_ENTITY_SHADOW_ASSASSIN],
    dangerLevel: 1, ambientColor: SR_COLOR_ECLIPSE_PURPLE, bossEntity: SR_ENTITY_DARK_SENTINEL,
  },
  [SR_DOMAIN_VOID_ABYSS]: {
    name: 'Void Abyss',
    description: 'A bottomless chasm of swirling void energy where reality dissolves into nothing. Only the bravest dare descend.',
    levelReq: 7,
    entityPool: [SR_ENTITY_VOID_MITE, SR_ENTITY_DARKLING, SR_ENTITY_VOID_HOUND, SR_ENTITY_VOID_RIPPER],
    dangerLevel: 2, ambientColor: SR_COLOR_MIDNIGHT_BLUE, bossEntity: SR_ENTITY_VOID_TITAN,
  },
  [SR_DOMAIN_PHANTOM_MARSH]: {
    name: 'Phantom Marsh',
    description: 'A spectral wetland where phantom fog clings to everything and the ground shifts beneath your feet.',
    levelReq: 14,
    entityPool: [SR_ENTITY_SHADOW_WISP, SR_ENTITY_UMBRA_SPIDER, SR_ENTITY_FOG_PHANTOM, SR_ENTITY_PHANTOM_SCOUT, SR_ENTITY_PHANTOM_WARRIOR],
    dangerLevel: 3, ambientColor: SR_COLOR_SHADOW_BLACK, bossEntity: SR_ENTITY_OMEGA_PHANTOM,
  },
  [SR_DOMAIN_TWILIGHT_MAUSOLEUM]: {
    name: 'Twilight Mausoleum',
    description: 'A vast tomb where the boundary between life and shadow blurs. Ancient warriors stir in their eternal rest.',
    levelReq: 21,
    entityPool: [SR_ENTITY_NIGHT_TWIN, SR_ENTITY_SHADOW_STALKER, SR_ENTITY_TWILIGHT_SERPENT, SR_ENTITY_TWILIGHT_GOLEM],
    dangerLevel: 4, ambientColor: SR_COLOR_VOID_INDIGO, bossEntity: SR_ENTITY_PHANTOM_WARRIOR,
  },
  [SR_DOMAIN_SHADOWFORGE]: {
    name: 'Shadowforge',
    description: 'An ancient forge where darkness itself is shaped into weapons and relics by spectral smiths of old.',
    levelReq: 28,
    entityPool: [SR_ENTITY_UMBRAL_ARCHER, SR_ENTITY_SHADOW_WYRM, SR_ENTITY_SHADOW_PHOENIX],
    dangerLevel: 5, ambientColor: SR_COLOR_DARK_CRIMSON, bossEntity: SR_ENTITY_SHADOW_WYRM,
  },
  [SR_DOMAIN_DUSKTHRONE]: {
    name: 'Duskthrone',
    description: 'The seat of the Dusk Lords, a palace carved from twilight where commands ripple across the shadow dimension.',
    levelReq: 35,
    entityPool: [SR_ENTITY_MIDNIGHT_FOX, SR_ENTITY_CRIMSON_BANSHEE, SR_ENTITY_DUSK_LORD, SR_ENTITY_SHADOW_PRIMORDIAL],
    dangerLevel: 6, ambientColor: SR_COLOR_ECLIPSE_PURPLE, bossEntity: SR_ENTITY_DUSK_LORD,
  },
  [SR_DOMAIN_OBLIVION_PIT]: {
    name: 'Oblivion Pit',
    description: 'The deepest dimension of the shadow realm where everything is consumed by eternal forgetting.',
    levelReq: 42,
    entityPool: [SR_ENTITY_ABYSSAL_CREEPER, SR_ENTITY_OBLIVION_REAPER, SR_ENTITY_ABYSS_SOVEREIGN],
    dangerLevel: 7, ambientColor: SR_COLOR_SHADOW_BLACK, bossEntity: SR_ENTITY_ABYSS_SOVEREIGN,
  },
  [SR_DOMAIN_CORONAL_PEAK]: {
    name: 'Coronal Peak',
    description: 'A mountain that pierces the eclipse, where shadow energy reaches its apex and legendary entities gather.',
    levelReq: 48,
    entityPool: [SR_ENTITY_ECLIPSE_DRAGON, SR_ENTITY_CORONAL_SERAPH, SR_ENTITY_ECLIPSE_EMPEROR],
    dangerLevel: 8, ambientColor: SR_COLOR_PHANTOM_SILVER, bossEntity: SR_ENTITY_ECLIPSE_EMPEROR,
  },
};

// ============================================================
// Relic Data (30 relics)
// ============================================================

const SR_RELIC_DATA: Record<string, SrRelicData> = {
  [SR_RELIC_SHADOW_SHARD]: { name: 'Shadow Shard', rarity: SR_RARITY_COMMON, darkPowerBonus: 3, speedBonus: 0, description: 'A fragment of solidified shadow.', cost: 20, levelReq: 1 },
  [SR_RELIC_DUSK_CRYSTAL]: { name: 'Dusk Crystal', rarity: SR_RARITY_COMMON, darkPowerBonus: 4, speedBonus: 1, description: 'A crystal that glows with fading twilight energy.', cost: 25, levelReq: 1 },
  [SR_RELIC_VOID_ESSENCE]: { name: 'Void Essence', rarity: SR_RARITY_COMMON, darkPowerBonus: 5, speedBonus: 0, description: 'Drops of liquid void condensed into a fragile container.', cost: 30, levelReq: 2 },
  [SR_RELIC_GLOOM_TEAR]: { name: 'Gloom Tear', rarity: SR_RARITY_COMMON, darkPowerBonus: 3, speedBonus: 2, description: 'A tear from a gloom entity that hardens into a gemstone.', cost: 22, levelReq: 1 },
  [SR_RELIC_NIGHTSTONE]: { name: 'Nightstone', rarity: SR_RARITY_COMMON, darkPowerBonus: 6, speedBonus: 0, description: 'A stone that absorbs ambient darkness during the night.', cost: 35, levelReq: 2 },
  [SR_RELIC_UMBRA_ORB]: { name: 'Umbra Orb', rarity: SR_RARITY_COMMON, darkPowerBonus: 4, speedBonus: 1, description: 'An orb that pulses with umbral energy, enhancing reflexes.', cost: 28, levelReq: 1 },
  [SR_RELIC_ECLIPSE_FANG]: { name: 'Eclipse Fang', rarity: SR_RARITY_UNUSUAL, darkPowerBonus: 12, speedBonus: 2, description: 'A fang from an eclipse beast, still dripping shadow venom.', cost: 100, levelReq: 6 },
  [SR_RELIC_PHANTOM_CHAIN]: { name: 'Phantom Chain', rarity: SR_RARITY_UNUSUAL, darkPowerBonus: 8, speedBonus: 5, description: 'A chain forged from phantom essence that binds shadows.', cost: 120, levelReq: 7 },
  [SR_RELIC_TWILIGHT_LANTERN]: { name: 'Twilight Lantern', rarity: SR_RARITY_UNUSUAL, darkPowerBonus: 10, speedBonus: 3, description: 'A lantern that reveals hidden paths in the twilight.', cost: 110, levelReq: 8 },
  [SR_RELIC_SHADOWBLADE_FRAG]: { name: 'Shadowblade Fragment', rarity: SR_RARITY_UNUSUAL, darkPowerBonus: 15, speedBonus: 1, description: 'A shard of the legendary Shadowblade, pulsing with dark energy.', cost: 150, levelReq: 10 },
  [SR_RELIC_CRIMSON_SIGIL]: { name: 'Crimson Sigil', rarity: SR_RARITY_UNUSUAL, darkPowerBonus: 11, speedBonus: 4, description: 'A sigil drawn in dark crimson that enhances combat prowess.', cost: 130, levelReq: 9 },
  [SR_RELIC_VOID_HEART]: { name: 'Void Heart', rarity: SR_RARITY_RARE, darkPowerBonus: 28, speedBonus: 3, description: 'The crystallized heart of a void creature, beating with darkness.', cost: 400, levelReq: 18 },
  [SR_RELIC_DUSKTHRONE_SHARD]: { name: 'Duskthrone Shard', rarity: SR_RARITY_RARE, darkPowerBonus: 25, speedBonus: 5, description: 'A piece of the Duskthrone itself, radiating twilight authority.', cost: 450, levelReq: 20 },
  [SR_RELIC_OBLIVION_CROWN]: { name: 'Oblivion Crown', rarity: SR_RARITY_RARE, darkPowerBonus: 30, speedBonus: 2, description: 'A crown from the Oblivion Pit that erases the wearer from memory.', cost: 500, levelReq: 22 },
  [SR_RELIC_SHADOWFORGE_HAMMER]: { name: 'Shadowforge Hammer', rarity: SR_RARITY_RARE, darkPowerBonus: 35, speedBonus: 0, description: 'A hammer used by the spectral smiths to forge darkness into weapons.', cost: 550, levelReq: 24 },
  [SR_RELIC_PHANTOM_WINGS]: { name: 'Phantom Wings', rarity: SR_RARITY_RARE, darkPowerBonus: 20, speedBonus: 12, description: 'Ethereal wings that allow limited flight through shadow dimensions.', cost: 480, levelReq: 21 },
  [SR_RELIC_ECLIPSE_EYE]: { name: 'Eclipse Eye', rarity: SR_RARITY_RARE, darkPowerBonus: 22, speedBonus: 8, description: 'An eye from an eclipse dragon that sees through all illusions.', cost: 420, levelReq: 19 },
  [SR_RELIC_MIDNIGHT_HORN]: { name: 'Midnight Horn', rarity: SR_RARITY_EPIC, darkPowerBonus: 50, speedBonus: 5, description: 'A horn that when sounded at midnight, summons shadow reinforcements.', cost: 1500, levelReq: 30 },
  [SR_RELIC_DARK_COMPASS]: { name: 'Dark Compass', rarity: SR_RARITY_EPIC, darkPowerBonus: 35, speedBonus: 15, description: 'A compass that points toward the nearest source of dark power.', cost: 1800, levelReq: 33 },
  [SR_RELIC_VOID_GATE_KEY]: { name: 'Void Gate Key', rarity: SR_RARITY_EPIC, darkPowerBonus: 45, speedBonus: 8, description: 'A key that opens gates between shadow dimensions at will.', cost: 2000, levelReq: 36 },
  [SR_RELIC_SHADOW_CLOAK]: { name: 'Shadow Cloak', rarity: SR_RARITY_EPIC, darkPowerBonus: 40, speedBonus: 20, description: 'A cloak woven from living shadow that renders the wearer invisible.', cost: 2200, levelReq: 38 },
  [SR_RELIC_CRIMSON_CHALICE]: { name: 'Crimson Chalice', rarity: SR_RARITY_EPIC, darkPowerBonus: 55, speedBonus: 3, description: 'A chalice that transforms shadow essence into dark crimson elixirs.', cost: 1600, levelReq: 32 },
  [SR_RELIC_DUSK_SCEPTER]: { name: 'Dusk Scepter', rarity: SR_RARITY_EPIC, darkPowerBonus: 48, speedBonus: 10, description: 'The scepter of the Dusk Lords, commanding lesser shadows to obey.', cost: 2500, levelReq: 40 },
  [SR_RELIC_TWILIGHT_MIRROR]: { name: 'Twilight Mirror', rarity: SR_RARITY_EPIC, darkPowerBonus: 38, speedBonus: 12, description: 'A mirror that shows alternate shadow realities and possible futures.', cost: 1900, levelReq: 35 },
  [SR_RELIC_OBLIVION_ORB]: { name: 'Oblivion Orb', rarity: SR_RARITY_LEGENDARY, darkPowerBonus: 100, speedBonus: 5, description: 'An orb containing a pocket dimension of pure oblivion.', cost: 6000, levelReq: 45 },
  [SR_RELIC_PHANTOM_HELM]: { name: 'Phantom Helm', rarity: SR_RARITY_LEGENDARY, darkPowerBonus: 85, speedBonus: 15, description: 'A helmet forged by the Omega Phantom that grants omniscient awareness.', cost: 7000, levelReq: 47 },
  [SR_RELIC_SHADOW_SOUL_GEM]: { name: 'Shadow Soul Gem', rarity: SR_RARITY_LEGENDARY, darkPowerBonus: 110, speedBonus: 8, description: 'Contains the soul of a shadow primordial, granting immense power.', cost: 8000, levelReq: 49 },
  [SR_RELIC_ECLIPSE_RING]: { name: 'Eclipse Ring', rarity: SR_RARITY_LEGENDARY, darkPowerBonus: 95, speedBonus: 18, description: 'A ring that allows the wearer to trigger partial eclipses.', cost: 9000, levelReq: 50 },
  [SR_RELIC_VOID_DIAMOND]: { name: 'Void Diamond', rarity: SR_RARITY_LEGENDARY, darkPowerBonus: 120, speedBonus: 10, description: 'The hardest substance in the void dimension, cuts through anything.', cost: 10000, levelReq: 50 },
  [SR_RELIC_CORONAL_PRISM]: { name: 'Coronal Prism', rarity: SR_RARITY_LEGENDARY, darkPowerBonus: 130, speedBonus: 12, description: 'A prism that splits shadow light into devastating beams of darkness.', cost: 12000, levelReq: 50 },
};

// ============================================================
// Structure Data (25 structures, upgradeable to level 10)
// ============================================================

const SR_STRUCTURE_DATA: Record<string, SrStructureData> = {
  [SR_STRUCT_SHADOW_TOWER]: { name: 'Shadow Tower', description: 'A watchtower of living shadow that extends your vision across domains.', maxLevel: 10, baseCost: 50, costMultiplier: 1.8, darkPowerPerLevel: 2, coinPerLevel: 3 },
  [SR_STRUCT_DARK_ALTAR]: { name: 'Dark Altar', description: 'An altar for dark rituals that amplify shadow harvesting efficiency.', maxLevel: 10, baseCost: 80, costMultiplier: 1.9, darkPowerPerLevel: 3, coinPerLevel: 5 },
  [SR_STRUCT_UMBRA_BARRACKS]: { name: 'Umbra Barracks', description: 'Housing for shadow soldiers that increases maximum legion size.', maxLevel: 10, baseCost: 100, costMultiplier: 2.0, darkPowerPerLevel: 1, coinPerLevel: 2 },
  [SR_STRUCT_VOID_WELL]: { name: 'Void Well', description: 'Draws shadow essence from the void to replenish your reserves.', maxLevel: 10, baseCost: 120, costMultiplier: 1.7, darkPowerPerLevel: 4, coinPerLevel: 6 },
  [SR_STRUCT_GLOOM_VAULT]: { name: 'Gloom Vault', description: 'A secure vault for storing harvested shadow essence and relics.', maxLevel: 10, baseCost: 150, costMultiplier: 1.8, darkPowerPerLevel: 2, coinPerLevel: 8 },
  [SR_STRUCT_ECLIPSE_BASTION]: { name: 'Eclipse Bastion', description: 'A fortress that activates during eclipses, providing defensive bonuses.', maxLevel: 10, baseCost: 200, costMultiplier: 2.1, darkPowerPerLevel: 5, coinPerLevel: 4 },
  [SR_STRUCT_PHANTOM_GUILD]: { name: 'Phantom Guild', description: 'A guild hall where phantoms gather, improving bonding speed.', maxLevel: 10, baseCost: 180, costMultiplier: 1.9, darkPowerPerLevel: 3, coinPerLevel: 7 },
  [SR_STRUCT_SHADOWFORGE]: { name: 'Shadowforge', description: 'A forge powered by shadow flames for crafting powerful relics.', maxLevel: 10, baseCost: 250, costMultiplier: 2.2, darkPowerPerLevel: 4, coinPerLevel: 10 },
  [SR_STRUCT_DUSK_OBELISK]: { name: 'Dusk Obelisk', description: 'An obelisk that marks conquered territory and generates twilight energy.', maxLevel: 10, baseCost: 300, costMultiplier: 2.0, darkPowerPerLevel: 6, coinPerLevel: 12 },
  [SR_STRUCT_TWILIGHT_ARCHIVE]: { name: 'Twilight Archive', description: 'A library of forbidden shadow knowledge that boosts XP gains.', maxLevel: 10, baseCost: 220, costMultiplier: 1.8, darkPowerPerLevel: 3, coinPerLevel: 9 },
  [SR_STRUCT_OBLIVION_GATE]: { name: 'Oblivion Gate', description: 'A gateway to the oblivion dimension for advanced shadow extraction.', maxLevel: 10, baseCost: 400, costMultiplier: 2.3, darkPowerPerLevel: 7, coinPerLevel: 5 },
  [SR_STRUCT_CRIMSON_FORTRESS]: { name: 'Crimson Fortress', description: 'A fortress bathed in dark crimson energy that repels invaders.', maxLevel: 10, baseCost: 350, costMultiplier: 2.1, darkPowerPerLevel: 5, coinPerLevel: 11 },
  [SR_STRUCT_NIGHTMARKET]: { name: 'Nightmarket', description: 'A shadow bazaar where relics and resources can be traded.', maxLevel: 10, baseCost: 160, costMultiplier: 1.7, darkPowerPerLevel: 1, coinPerLevel: 15 },
  [SR_STRUCT_DARK_LIBRARY]: { name: 'Dark Library', description: 'Contains tomes of dark knowledge that unlock hidden abilities.', maxLevel: 10, baseCost: 280, costMultiplier: 1.9, darkPowerPerLevel: 4, coinPerLevel: 8 },
  [SR_STRUCT_SHADOW_ARENA]: { name: 'Shadow Arena', description: 'A combat arena where entities fight for training and rewards.', maxLevel: 10, baseCost: 320, costMultiplier: 2.0, darkPowerPerLevel: 6, coinPerLevel: 14 },
  [SR_STRUCT_VOID_OBSERVATORY]: { name: 'Void Observatory', description: 'Observes void phenomena to predict entity movements.', maxLevel: 10, baseCost: 260, costMultiplier: 1.8, darkPowerPerLevel: 3, coinPerLevel: 10 },
  [SR_STRUCT_UMBRA_HOSPITAL]: { name: 'Umbra Hospital', description: 'Heals wounded shadow soldiers and restores phantom bonds.', maxLevel: 10, baseCost: 200, costMultiplier: 1.9, darkPowerPerLevel: 2, coinPerLevel: 7 },
  [SR_STRUCT_ECLIPSE_SHRINE]: { name: 'Eclipse Shrine', description: 'A shrine that amplifies eclipse events for greater rewards.', maxLevel: 10, baseCost: 380, costMultiplier: 2.2, darkPowerPerLevel: 5, coinPerLevel: 13 },
  [SR_STRUCT_PHANTOM_STABLES]: { name: 'Phantom Stables', description: 'Houses bonded phantoms and improves their combat performance.', maxLevel: 10, baseCost: 240, costMultiplier: 1.8, darkPowerPerLevel: 4, coinPerLevel: 6 },
  [SR_STRUCT_SHADOWFORGE_ANVIL]: { name: 'Shadowforge Anvil', description: 'An anvil that enhances relic forging quality and speed.', maxLevel: 10, baseCost: 350, costMultiplier: 2.1, darkPowerPerLevel: 3, coinPerLevel: 16 },
  [SR_STRUCT_DUSKTHRONE_HALL]: { name: 'Duskthrone Hall', description: 'The seat of power for commanding shadow legions.', maxLevel: 10, baseCost: 500, costMultiplier: 2.5, darkPowerPerLevel: 8, coinPerLevel: 20 },
  [SR_STRUCT_CORONAL_BEACON]: { name: 'Coronal Beacon', description: 'A beacon that guides shadow entities to your domain.', maxLevel: 10, baseCost: 420, costMultiplier: 2.3, darkPowerPerLevel: 6, coinPerLevel: 18 },
  [SR_STRUCT_VOID_NEXUS]: { name: 'Void Nexus', description: 'A nexus connecting multiple void gates for rapid traversal.', maxLevel: 10, baseCost: 600, costMultiplier: 2.6, darkPowerPerLevel: 7, coinPerLevel: 15 },
  [SR_STRUCT_ABYSS_PRISON]: { name: 'Abyss Prison', description: 'Imprisons defeated shadow entities for study and extraction.', maxLevel: 10, baseCost: 450, costMultiplier: 2.2, darkPowerPerLevel: 5, coinPerLevel: 12 },
  [SR_STRUCT_SHADOW_PALACE]: { name: 'Shadow Palace', description: 'The ultimate seat of power for the Eclipse Sovereign.', maxLevel: 10, baseCost: 1000, costMultiplier: 3.0, darkPowerPerLevel: 10, coinPerLevel: 25 },
};

// ============================================================
// Ability Data (22 abilities)
// ============================================================

const SR_ABILITY_DATA: Record<string, SrAbilityData> = {
  [SR_ABILITY_SHADOW_STRIKE]: { name: 'Shadow Strike', description: 'Strike with concentrated shadow energy dealing bonus dark damage.', abilityType: 'offense', basePower: 15, cooldown: 2, unlockLevel: 1, cost: 0 },
  [SR_ABILITY_DUSK_SHIELD]: { name: 'Dusk Shield', description: 'Conjure a shield of dusk energy that absorbs incoming damage.', abilityType: 'defense', basePower: 20, cooldown: 3, unlockLevel: 1, cost: 0 },
  [SR_ABILITY_VOID_STEP]: { name: 'Void Step', description: 'Step into the void for a moment, becoming intangible and repositioning.', abilityType: 'utility', basePower: 10, cooldown: 4, unlockLevel: 2, cost: 50 },
  [SR_ABILITY_PHANTOM_BOND]: { name: 'Phantom Bond', description: 'Create a spiritual bond with a phantom, gaining its combat bonuses.', abilityType: 'bonding', basePower: 25, cooldown: 5, unlockLevel: 3, cost: 80 },
  [SR_ABILITY_ECLIPSE_RAY]: { name: 'Eclipse Ray', description: 'Fire a beam of eclipsed light that damages all entities in a line.', abilityType: 'offense', basePower: 30, cooldown: 3, unlockLevel: 5, cost: 120 },
  [SR_ABILITY_SHADOW_HARVEST]: { name: 'Shadow Harvest', description: 'Harvest shadow essence from the surrounding area for coins and XP.', abilityType: 'harvest', basePower: 20, cooldown: 2, unlockLevel: 4, cost: 100 },
  [SR_ABILITY_CRIMSON_FURY]: { name: 'Crimson Fury', description: 'Enter a berserk state with crimson energy, doubling attack speed.', abilityType: 'offense', basePower: 35, cooldown: 6, unlockLevel: 7, cost: 160 },
  [SR_ABILITY_UMBRA_CLOAK]: { name: 'Umbra Cloak', description: 'Wrap yourself in umbral energy, becoming invisible to shadow entities.', abilityType: 'defense', basePower: 40, cooldown: 5, unlockLevel: 9, cost: 200 },
  [SR_ABILITY_TWILIGHT_HEAL]: { name: 'Twilight Heal', description: 'Channel twilight energy to restore your shadow essence pool.', abilityType: 'healing', basePower: 25, cooldown: 4, unlockLevel: 10, cost: 240 },
  [SR_ABILITY_VOID_LEECH]: { name: 'Void Leech', description: 'Drain shadow energy from an entity, healing yourself and dealing damage.', abilityType: 'offense', basePower: 30, cooldown: 3, unlockLevel: 12, cost: 300 },
  [SR_ABILITY_SHADOW_LEGION]: { name: 'Shadow Legion', description: 'Summon your entire shadow legion to fight alongside you for 3 turns.', abilityType: 'command', basePower: 50, cooldown: 8, unlockLevel: 15, cost: 400 },
  [SR_ABILITY_PHANTOM_MARCH]: { name: 'Phantom March', description: 'Command bonded phantoms to advance in formation, overwhelming the enemy.', abilityType: 'command', basePower: 45, cooldown: 6, unlockLevel: 18, cost: 500 },
  [SR_ABILITY_DARK_COMPASS_READ]: { name: 'Dark Compass Read', description: 'Consult the dark compass to reveal entity weaknesses and domain secrets.', abilityType: 'utility', basePower: 15, cooldown: 10, unlockLevel: 20, cost: 350 },
  [SR_ABILITY_ECLIPSE_BLESSING]: { name: 'Eclipse Blessing', description: 'Receive the blessing of the eclipse, boosting all stats for 2 turns.', abilityType: 'utility', basePower: 60, cooldown: 8, unlockLevel: 22, cost: 600 },
  [SR_ABILITY_SHADOW_FORGE_CRAFT]: { name: 'Shadowforge Craft', description: 'Use the Shadowforge to immediately complete a relic forging project.', abilityType: 'crafting', basePower: 70, cooldown: 10, unlockLevel: 25, cost: 800 },
  [SR_ABILITY_OBLIVION_PULSE]: { name: 'Oblivion Pulse', description: 'Release a pulse of oblivion energy that resets entity cooldowns.', abilityType: 'control', basePower: 55, cooldown: 7, unlockLevel: 28, cost: 700 },
  [SR_ABILITY_CRIMSON_BARRIER]: { name: 'Crimson Barrier', description: 'Erect a crimson barrier that blocks all damage for 1 turn.', abilityType: 'defense', basePower: 80, cooldown: 8, unlockLevel: 30, cost: 850 },
  [SR_ABILITY_DUSK_COMMAND]: { name: 'Dusk Command', description: 'Issue a dusk command that forces entities to flee for 2 turns.', abilityType: 'control', basePower: 65, cooldown: 7, unlockLevel: 33, cost: 1000 },
  [SR_ABILITY_VOID_TORNADO]: { name: 'Void Tornado', description: 'Summon a tornado of void energy that shreds everything in its path.', abilityType: 'offense', basePower: 90, cooldown: 6, unlockLevel: 36, cost: 1200 },
  [SR_ABILITY_SHADOW_ASTRAL]: { name: 'Shadow Astral', description: 'Project your consciousness into the shadow plane, gaining omniscience.', abilityType: 'utility', basePower: 75, cooldown: 10, unlockLevel: 40, cost: 1500 },
  [SR_ABILITY_CORONAL_FLARE]: { name: 'Coronal Flare', description: 'Trigger a coronal mass ejection of shadow energy, devastating all enemies.', abilityType: 'offense', basePower: 100, cooldown: 8, unlockLevel: 45, cost: 2000 },
  [SR_ABILITY_ECLIPSE_SOVEREIGNTY]: { name: 'Eclipse Sovereignty', description: 'The ultimate ability — assert dominion over shadows, controlling the battlefield.', abilityType: 'special', basePower: 150, cooldown: 15, unlockLevel: 50, cost: 5000 },
};

// ============================================================
// Achievement Data (18 achievements)
// ============================================================

const SR_ACHIEVEMENT_DATA: Record<string, SrAchievementData> = {
  [SR_ACHIEVEMENT_FIRST_HARVEST]: { name: 'First Harvest', description: 'Complete your first shadow harvest.', checkFn: 'totalHarvested >= 1' },
  [SR_ACHIEVEMENT_RELIC_COLLECTOR]: { name: 'Relic Collector', description: 'Collect 15 different shadow relics.', checkFn: 'relicsOwnedCount >= 15' },
  [SR_ACHIEVEMENT_LEGION_COMMANDER]: { name: 'Legion Commander', description: 'Command a legion of 20 or more shadow soldiers.', checkFn: 'legionSize >= 20' },
  [SR_ACHIEVEMENT_PHANTOM_MASTER]: { name: 'Phantom Master', description: 'Bond with 10 different phantoms.', checkFn: 'totalPhantomsBonded >= 10' },
  [SR_ACHIEVEMENT_DOMAIN_CONQUEROR]: { name: 'Domain Conqueror', description: 'Conquer all 8 shadow domains.', checkFn: 'domainsConquered >= 8' },
  [SR_ACHIEVEMENT_FORGED_IN_DARKNESS]: { name: 'Forged in Darkness', description: 'Forge 10 relics at the Shadowforge.', checkFn: 'totalRelicsForged >= 10' },
  [SR_ACHIEVEMENT_ECLIPSE_SURVIVOR]: { name: 'Eclipse Survivor', description: 'Survive a full eclipse event.', checkFn: 'eclipseSurvived' },
  [SR_ACHIEVEMENT_DAILY_SHADOW]: { name: 'Daily Shadow', description: 'Complete 7 daily shadow quests.', checkFn: 'dailyQuestsCompleted >= 7' },
  [SR_ACHIEVEMENT_STRUCTURE_MAGNATE]: { name: 'Structure Magnate', description: 'Upgrade 5 structures to maximum level.', checkFn: 'maxedStructures >= 5' },
  [SR_ACHIEVEMENT_LEGENDARY_HUNTER]: { name: 'Legendary Hunter', description: 'Defeat 5 legendary shadow entities.', checkFn: 'legendaryDefeated >= 5' },
  [SR_ACHIEVEMENT_VOID_WALKER]: { name: 'Void Walker', description: 'Accumulate 1000 total harvested shadow essence.', checkFn: 'totalHarvested >= 1000' },
  [SR_ACHIEVEMENT_DUSK_LORD_SLAYER]: { name: 'Dusk Lord Slayer', description: 'Defeat the Dusk Lord entity.', checkFn: 'defeatedDuskLord' },
  [SR_ACHIEVEMENT_ABYSS_TAMER]: { name: 'Abyss Tamer', description: 'Tame a creature from the Oblivion Pit.', checkFn: 'tamedAbyssEntity' },
  [SR_ACHIEVEMENT_LEVEL_10]: { name: 'Shadow Ascendant', description: 'Reach level 10.', checkFn: 'level >= 10' },
  [SR_ACHIEVEMENT_LEVEL_25]: { name: 'Void Master', description: 'Reach level 25.', checkFn: 'level >= 25' },
  [SR_ACHIEVEMENT_LEVEL_50]: { name: 'Shadow Apex', description: 'Reach the maximum level of 50.', checkFn: 'level >= 50' },
  [SR_ACHIEVEMENT_ALL_RELICS]: { name: 'Relic Hoarder', description: 'Own all 30 shadow relics.', checkFn: 'relicsOwnedCount >= 30' },
  [SR_ACHIEVEMENT_ECLIPSE_SOVEREIGN]: { name: 'Eclipse Sovereign', description: 'Defeat the Eclipse Emperor.', checkFn: 'defeatedEclipseEmperor' },
};

// ============================================================
// Daily Quest Data (6 quest types)
// ============================================================

const SR_QUEST_DATA: Record<string, SrDailyQuestData> = {
  [SR_QUEST_HARVEST_SHADOWS]: { name: 'Shadow Harvest', description: 'Harvest shadow essence from the current domain.', questType: 'harvest', targetCount: 10, rewardCoins: 100, rewardXp: 80 },
  [SR_QUEST_COMMAND_LEGION]: { name: 'Command Legion', description: 'Lead your legion to defeat shadow entities.', questType: 'command', targetCount: 5, rewardCoins: 150, rewardXp: 120 },
  [SR_QUEST_FORGE_RELIC]: { name: 'Forge Relic', description: 'Forge a relic at the Shadowforge.', questType: 'forge', targetCount: 1, rewardCoins: 200, rewardXp: 150 },
  [SR_QUEST_CONQUER_DOMAIN]: { name: 'Conquer Domain', description: 'Conquer an enemy in a shadow domain battle.', questType: 'conquer', targetCount: 3, rewardCoins: 120, rewardXp: 100 },
  [SR_QUEST_BOND_PHANTOM]: { name: 'Bond Phantom', description: 'Bond with a phantom from the marsh.', questType: 'bond', targetCount: 2, rewardCoins: 180, rewardXp: 130 },
  [SR_QUEST_MANAGE_ECLIPSE]: { name: 'Manage Eclipse', description: 'Successfully manage an eclipse phase.', questType: 'eclipse', targetCount: 1, rewardCoins: 250, rewardXp: 200 },
};

// ============================================================
// XP / Level / Title Helpers
// ============================================================

function srXpForLevel(level: number): number {
  return Math.floor(120 * Math.pow(level, 1.35));
}

function srCalculateLevel(totalXp: number): number {
  let level = 1;
  let accum = 0;
  while (level < 50 && accum + srXpForLevel(level) <= totalXp) {
    accum += srXpForLevel(level);
    level++;
  }
  return level;
}

function srTitleForLevel(level: number): string {
  if (level >= 50) return SR_TITLE_ECLIPSE_SOVEREIGN;
  if (level >= 42) return SR_TITLE_ABYSS_WARDEN;
  if (level >= 33) return SR_TITLE_DUSKLORD;
  if (level >= 25) return SR_TITLE_SHADOWFORGE_MASTER;
  if (level >= 18) return SR_TITLE_PHANTOM_COMMANDER;
  if (level >= 10) return SR_TITLE_VOID_EXPLORER;
  if (level >= 5) return SR_TITLE_DUSK_WALKER;
  return SR_TITLE_SHADOW_INITIATE;
}

function srRarityLabel(rarity: string): string {
  const map: Record<string, string> = {
    [SR_RARITY_COMMON]: 'Common',
    [SR_RARITY_UNUSUAL]: 'Unusual',
    [SR_RARITY_RARE]: 'Rare',
    [SR_RARITY_EPIC]: 'Epic',
    [SR_RARITY_LEGENDARY]: 'Legendary',
  };
  return map[rarity] || rarity;
}

// ============================================================
// Achievement Checker
// ============================================================

interface SrAchievementCtx {
  totalHarvested: number;
  relicsOwnedCount: number;
  legionSize: number;
  totalPhantomsBonded: number;
  domainsConquered: number;
  totalRelicsForged: number;
  eclipseSurvived: boolean;
  dailyQuestsCompleted: number;
  maxedStructures: number;
  legendaryDefeated: number;
  defeatedDuskLord: boolean;
  tamedAbyssEntity: boolean;
  level: number;
  defeatedEclipseEmperor: boolean;
}

function srCheckAchievements(ctx: SrAchievementCtx): string[] {
  const met: string[] = [];
  if (ctx.totalHarvested >= 1) met.push(SR_ACHIEVEMENT_FIRST_HARVEST);
  if (ctx.relicsOwnedCount >= 15) met.push(SR_ACHIEVEMENT_RELIC_COLLECTOR);
  if (ctx.legionSize >= 20) met.push(SR_ACHIEVEMENT_LEGION_COMMANDER);
  if (ctx.totalPhantomsBonded >= 10) met.push(SR_ACHIEVEMENT_PHANTOM_MASTER);
  if (ctx.domainsConquered >= 8) met.push(SR_ACHIEVEMENT_DOMAIN_CONQUEROR);
  if (ctx.totalRelicsForged >= 10) met.push(SR_ACHIEVEMENT_FORGED_IN_DARKNESS);
  if (ctx.eclipseSurvived) met.push(SR_ACHIEVEMENT_ECLIPSE_SURVIVOR);
  if (ctx.dailyQuestsCompleted >= 7) met.push(SR_ACHIEVEMENT_DAILY_SHADOW);
  if (ctx.maxedStructures >= 5) met.push(SR_ACHIEVEMENT_STRUCTURE_MAGNATE);
  if (ctx.legendaryDefeated >= 5) met.push(SR_ACHIEVEMENT_LEGENDARY_HUNTER);
  if (ctx.totalHarvested >= 1000) met.push(SR_ACHIEVEMENT_VOID_WALKER);
  if (ctx.defeatedDuskLord) met.push(SR_ACHIEVEMENT_DUSK_LORD_SLAYER);
  if (ctx.tamedAbyssEntity) met.push(SR_ACHIEVEMENT_ABYSS_TAMER);
  if (ctx.level >= 10) met.push(SR_ACHIEVEMENT_LEVEL_10);
  if (ctx.level >= 25) met.push(SR_ACHIEVEMENT_LEVEL_25);
  if (ctx.level >= 50) met.push(SR_ACHIEVEMENT_LEVEL_50);
  if (ctx.relicsOwnedCount >= 30) met.push(SR_ACHIEVEMENT_ALL_RELICS);
  if (ctx.defeatedEclipseEmperor) met.push(SR_ACHIEVEMENT_ECLIPSE_SOVEREIGN);
  return met;
}

// ============================================================
// Initial State Factory
// ============================================================

function srCreateInitialState(seed?: number): SrShadowRealmState {
  return {
    rngSeed: seed ?? Date.now(),
    level: 1, experience: 0, coins: 50,
    title: SR_TITLE_SHADOW_INITIATE,
    currentDomain: SR_DOMAIN_ECLIPSE_CITADEL,
    combat: { activeEntity: null, entityHp: 0, entityMaxHp: 0, playerShadow: 0, maxShadow: 100, turnsElapsed: 0, isConquering: false, conquerProgress: 0, conquerTarget: 0 },
    harvest: { isHarvesting: false, harvestProgress: 0, harvestTarget: 5, shadowEssence: 0, harvestsCompleted: 0 },
    legion: { legionSize: 1, maxLegionSize: 5, legionMorale: 100, phantomBonds: {}, bondedPhantoms: [] },
    relicForge: { isForging: false, forgingRelic: null, forgeProgress: 0, forgeTarget: 10, relicsForged: 0 },
    eclipse: { eclipsePhase: 0, eclipseIntensity: 0, eclipseCooldown: 0, eclipseActive: false, lastEclipseTime: null },
    dailyQuest: { activeQuest: null, questProgress: 0, questTarget: 0, questCompleted: false, questRewardClaimed: false, lastQuestDate: null, dailyQuestsCompleted: 0 },
    defeatedEntities: [], encounteredEntities: [],
    relicsOwned: [SR_RELIC_SHADOW_SHARD], equippedRelic: SR_RELIC_SHADOW_SHARD,
    abilitiesUnlocked: [SR_ABILITY_SHADOW_STRIKE, SR_ABILITY_DUSK_SHIELD],
    abilityLevels: { [SR_ABILITY_SHADOW_STRIKE]: 1, [SR_ABILITY_DUSK_SHIELD]: 1 },
    structureLevels: { [SR_STRUCT_SHADOW_TOWER]: 1, [SR_STRUCT_DARK_ALTAR]: 1 },
    shadowHarvestLevel: 1, shadowHarvestXp: 0,
    legionCommandLevel: 1, legionCommandXp: 0,
    relicForgeLevel: 1, relicForgeXp: 0,
    eclipseManagementLevel: 1, eclipseManagementXp: 0,
    phantomBondLevel: 1, phantomBondXp: 0,
    domainsConquered: [],
    eventsParticipated: [],
    achievements: [],
    totalHarvested: 0, totalEntitiesDefeated: 0, totalCoinsEarned: 0,
    totalRelicsForged: 0, totalLegionsCommanded: 0, totalPhantomsBonded: 0, totalEclipsesManaged: 0,
    realmLog: ['You enter the Eclipse Citadel. Shadows coalesce around you as the eclipsed sun casts its baleful glow...'],
  };
}

// ============================================================
// The Hook — useShadowRealm
// ============================================================

export default function useShadowRealm(initialSeed?: number) {
  const [srAPIState, srAPISetState] = useState<SrShadowRealmState>(
    () => srCreateInitialState(initialSeed),
  );

  const srAPIStateRef = useRef(srAPIState);

  // ----------------------------------------------------------
  // Effect — sync stateRef
  // ----------------------------------------------------------

  useEffect(() => {
    srAPIStateRef.current = srAPIState;
  }, [srAPIState]);

  // ----------------------------------------------------------
  // Data lookup helpers (no state dependency)
  // ----------------------------------------------------------

  const srAPIGetDomainData = useCallback((domainId: string): SrDomainData | null => {
    return SR_DOMAIN_DATA[domainId] ?? null;
  }, []);

  const srAPIGetEntityData = useCallback((entityId: string): SrEntityData | null => {
    return SR_ENTITY_DATA[entityId] ?? null;
  }, []);

  const srAPIGetRelicData = useCallback((relicId: string): SrRelicData | null => {
    return SR_RELIC_DATA[relicId] ?? null;
  }, []);

  const srAPIGetStructureData = useCallback((structureId: string): SrStructureData | null => {
    return SR_STRUCTURE_DATA[structureId] ?? null;
  }, []);

  const srAPIGetAbilityData = useCallback((abilityId: string): SrAbilityData | null => {
    return SR_ABILITY_DATA[abilityId] ?? null;
  }, []);

  const srAPIGetAchievementData = useCallback((achId: string): SrAchievementData | null => {
    return SR_ACHIEVEMENT_DATA[achId] ?? null;
  }, []);

  const srAPIGetQuestData = useCallback((questId: string): SrDailyQuestData | null => {
    return SR_QUEST_DATA[questId] ?? null;
  }, []);

  const srAPIGetRarityMultiplier = useCallback((rarity: string): number => {
    return SR_RARITY_MULTIPLIER[rarity] ?? 1.0;
  }, []);

  const srAPIRarityLabel = useCallback((rarity: string): string => {
    return srRarityLabel(rarity);
  }, []);

  const srAPIXpForNextLevel = useCallback((level: number): number => {
    return srXpForLevel(level);
  }, []);

  // ----------------------------------------------------------
  // Computed values (useMemo with [state] dependency)
  // ----------------------------------------------------------

  const srAPIEquippedRelicData = useMemo((): SrRelicData | null => {
    if (!srAPIState.equippedRelic) return null;
    return SR_RELIC_DATA[srAPIState.equippedRelic] ?? null;
  }, [srAPIState]);

  const srAPIEquippedDarkPower = useMemo((): number => {
    if (!srAPIState.equippedRelic) return 0;
    const rd = SR_RELIC_DATA[srAPIState.equippedRelic];
    if (!rd) return 0;
    return rd.darkPowerBonus;
  }, [srAPIState]);

  const srAPIActiveEntityData = useMemo((): SrEntityData | null => {
    if (!srAPIState.combat.activeEntity) return null;
    return SR_ENTITY_DATA[srAPIState.combat.activeEntity] ?? null;
  }, [srAPIState]);

  const srAPIDomainProgress = useMemo((): { conquered: number; total: number } => {
    return { conquered: srAPIState.domainsConquered.length, total: SR_ALL_DOMAINS.length };
  }, [srAPIState]);

  const srAPIBestiaryProgress = useMemo((): { discovered: number; total: number } => {
    return { discovered: srAPIState.encounteredEntities.length, total: SR_ALL_ENTITIES.length };
  }, [srAPIState]);

  const srAPIRelicCollectionProgress = useMemo((): { owned: number; total: number } => {
    return { owned: srAPIState.relicsOwned.length, total: SR_ALL_RELICS.length };
  }, [srAPIState]);

  const srAPIAbilityCollectionProgress = useMemo((): { unlocked: number; total: number } => {
    return { unlocked: srAPIState.abilitiesUnlocked.length, total: SR_ALL_ABILITIES.length };
  }, [srAPIState]);

  const srAPIAchievementProgress = useMemo((): { earned: number; total: number } => {
    return { earned: srAPIState.achievements.length, total: SR_ALL_ACHIEVEMENTS.length };
  }, [srAPIState]);

  const srAPIAvailableEntities = useMemo((): string[] => {
    const domain = SR_DOMAIN_DATA[srAPIState.currentDomain];
    if (!domain) return [];
    return domain.entityPool.filter((e) => srAPIState.level >= (SR_ENTITY_DATA[e]?.darkPower ? 0 : 999));
  }, [srAPIState]);

  const srAPILegionPower = useMemo((): number => {
    let totalPower = srAPIState.legion.legionSize * 5;
    for (const phantomId of srAPIState.legion.bondedPhantoms) {
      const bond = srAPIState.legion.phantomBonds[phantomId] ?? 0;
      totalPower += bond * 10;
    }
    return totalPower;
  }, [srAPIState]);

  const srAPIStructureBonus = useMemo((): { totalDarkPower: number; totalCoinPerTick: number } => {
    let dp = 0;
    let coin = 0;
    for (const structId of Object.keys(srAPIState.structureLevels)) {
      const sData = SR_STRUCTURE_DATA[structId];
      const sLevel = srAPIState.structureLevels[structId];
      if (sData && sLevel) {
        dp += sData.darkPowerPerLevel * sLevel;
        coin += sData.coinPerLevel * sLevel;
      }
    }
    return { totalDarkPower: dp, totalCoinPerTick: coin };
  }, [srAPIState]);

  // ----------------------------------------------------------
  // Status check functions
  // ----------------------------------------------------------

  const srAPIIsInCombat = useCallback((): boolean => {
    return srAPIStateRef.current.combat.activeEntity !== null;
  }, []);

  const srAPICanEnterDomain = useCallback((domainId: string): boolean => {
    const dd = SR_DOMAIN_DATA[domainId];
    if (!dd) return false;
    return srAPIStateRef.current.level >= dd.levelReq;
  }, []);

  const srAPICanPurchaseRelic = useCallback((relicId: string): boolean => {
    const rd = SR_RELIC_DATA[relicId];
    if (!rd) return false;
    const state = srAPIStateRef.current;
    return state.coins >= rd.cost && state.level >= rd.levelReq && !state.relicsOwned.includes(relicId);
  }, []);

  const srAPICanUnlockAbility = useCallback((abilityId: string): boolean => {
    const ad = SR_ABILITY_DATA[abilityId];
    if (!ad) return false;
    const state = srAPIStateRef.current;
    return state.coins >= ad.cost && state.level >= ad.unlockLevel && !state.abilitiesUnlocked.includes(abilityId);
  }, []);

  const srAPIGetDomainEntities = useCallback((domainId: string): string[] => {
    const dd = SR_DOMAIN_DATA[domainId];
    if (!dd) return [];
    return dd.entityPool;
  }, []);

  // ----------------------------------------------------------
  // Domain & Exploration
  // ----------------------------------------------------------

  const srAPIChangeDomain = useCallback((domainId: string): void => {
    srAPISetState((prev) => {
      const dd = SR_DOMAIN_DATA[domainId];
      if (!dd || prev.level < dd.levelReq) return prev;
      return {
        ...prev,
        currentDomain: domainId,
        realmLog: [...prev.realmLog, `You travel to ${dd.name}. ${dd.description}`],
      };
    });
  }, []);

  const srAPIExploreDomain = useCallback((): void => {
    srAPISetState((prev) => {
      const dd = SR_DOMAIN_DATA[prev.currentDomain];
      if (!dd) return prev;
      const pool = dd.entityPool;
      if (pool.length === 0) return prev;
      const r1 = srAdvanceRng(prev.rngSeed);
      const idx = Math.floor(r1.value * pool.length);
      const entityId = pool[idx];
      const entity = SR_ENTITY_DATA[entityId];
      if (!entity) return prev;
      const newEncountered = prev.encounteredEntities.includes(entityId)
        ? prev.encounteredEntities
        : [...prev.encounteredEntities, entityId];
      return {
        ...prev,
        rngSeed: r1.nextSeed,
        encounteredEntities: newEncountered,
        realmLog: [
          ...prev.realmLog,
          `Exploring ${dd.name}... You encounter a ${entity.name}! (${srRarityLabel(entity.shadowType)}, Power: ${entity.darkPower})`,
        ],
      };
    });
  }, []);

  // ----------------------------------------------------------
  // Combat
  // ----------------------------------------------------------

  const srAPIEncounterEntity = useCallback((entityId?: string): void => {
    srAPISetState((prev) => {
      if (prev.combat.activeEntity) return prev;
      const dd = SR_DOMAIN_DATA[prev.currentDomain];
      if (!dd) return prev;
      let target = entityId;
      if (!target) {
        const pool = dd.entityPool;
        if (pool.length === 0) return prev;
        const r1 = srAdvanceRng(prev.rngSeed);
        target = pool[Math.floor(r1.value * pool.length)];
      }
      const entity = SR_ENTITY_DATA[target];
      if (!entity) return prev;
      const hpMult = SR_RARITY_MULTIPLIER[entity.shadowType] ?? 1.0;
      const maxHp = Math.floor(entity.darkPower * hpMult * 3);
      const newEncountered = prev.encounteredEntities.includes(target)
        ? prev.encounteredEntities
        : [...prev.encounteredEntities, target];
      return {
        ...prev,
        rngSeed: prev.rngSeed + 1,
        combat: {
          activeEntity: target,
          entityHp: maxHp,
          entityMaxHp: maxHp,
          playerShadow: 0,
          maxShadow: 100,
          turnsElapsed: 0,
          isConquering: false,
          conquerProgress: 0,
          conquerTarget: 3,
        },
        encounteredEntities: newEncountered,
        realmLog: [...prev.realmLog, `A ${entity.name} emerges from the shadows! HP: ${maxHp}`],
      };
    });
  }, []);

  const srAPIAttackEntity = useCallback((): void => {
    srAPISetState((prev) => {
      if (!prev.combat.activeEntity) return prev;
      const entity = SR_ENTITY_DATA[prev.combat.activeEntity];
      if (!entity) return prev;
      const relicBonus = prev.equippedRelic ? (SR_RELIC_DATA[prev.equippedRelic]?.darkPowerBonus ?? 0) : 0;
      const baseDmg = 10 + prev.level * 2 + relicBonus;
      const r1 = srRollInRange(prev.rngSeed, 80, 120);
      const dmg = Math.floor(baseDmg * (r1.value / 100));
      const newHp = Math.max(0, prev.combat.entityHp - dmg);
      const entityDmg = Math.floor(entity.darkPower * 0.3);
      const newPlayerShadow = Math.min(prev.combat.maxShadow, prev.combat.playerShadow + entityDmg);
      const newTurns = prev.combat.turnsElapsed + 1;

      if (newHp <= 0) {
        const rarityMult = SR_RARITY_MULTIPLIER[entity.shadowType] ?? 1.0;
        const xBonus = Math.floor(entity.xpReward * rarityMult);
        const cBonus = Math.floor(entity.coinReward * rarityMult);
        const newLevel = srCalculateLevel(prev.experience + xBonus);
        const newTitle = srTitleForLevel(newLevel);
        const newDefeated = prev.defeatedEntities.includes(prev.combat.activeEntity)
          ? prev.defeatedEntities
          : [...prev.defeatedEntities, prev.combat.activeEntity];
        const logs = [
          `You strike the ${entity.name} for ${dmg} shadow damage!`,
          `The ${entity.name} is defeated! +${xBonus} XP, +${cBonus} coins.`,
          `Level: ${newLevel} | Title: ${newTitle}`,
        ];
        const achCtx: SrAchievementCtx = {
          totalHarvested: prev.totalHarvested,
          relicsOwnedCount: prev.relicsOwned.length,
          legionSize: prev.legion.legionSize,
          totalPhantomsBonded: prev.totalPhantomsBonded,
          domainsConquered: prev.domainsConquered.length,
          totalRelicsForged: prev.totalRelicsForged,
          eclipseSurvived: false,
          dailyQuestsCompleted: prev.dailyQuest.dailyQuestsCompleted,
          maxedStructures: 0,
          legendaryDefeated: prev.defeatedEntities.filter((e) => {
            const ed = SR_ENTITY_DATA[e];
            return ed && ed.shadowType === SR_RARITY_LEGENDARY;
          }).length,
          defeatedDuskLord: prev.defeatedEntities.includes(SR_ENTITY_DUSK_LORD),
          tamedAbyssEntity: false,
          level: newLevel,
          defeatedEclipseEmperor: prev.defeatedEntities.includes(SR_ENTITY_ECLIPSE_EMPEROR),
        };
        const newAch = srCheckAchievements(achCtx);
        return {
          ...prev,
          rngSeed: r1.nextSeed,
          level: newLevel,
          experience: prev.experience + xBonus,
          coins: prev.coins + cBonus,
          totalCoinsEarned: prev.totalCoinsEarned + cBonus,
          totalEntitiesDefeated: prev.totalEntitiesDefeated + 1,
          title: newTitle,
          defeatedEntities: newDefeated,
          combat: { activeEntity: null, entityHp: 0, entityMaxHp: 0, playerShadow: 0, maxShadow: 100, turnsElapsed: 0, isConquering: false, conquerProgress: 0, conquerTarget: 0 },
          achievements: Array.from(new Set([...prev.achievements, ...newAch])),
          realmLog: [...prev.realmLog, ...logs],
        };
      }

      if (newPlayerShadow >= prev.combat.maxShadow) {
        return {
          ...prev,
          rngSeed: r1.nextSeed,
          combat: { ...prev.combat, entityHp: newHp, playerShadow: newPlayerShadow, turnsElapsed: newTurns },
          realmLog: [
            ...prev.realmLog,
            `You strike for ${dmg} damage. Shadow overload! You are forced to retreat.`,
          ],
        };
      }

      return {
        ...prev,
        rngSeed: r1.nextSeed,
        combat: { ...prev.combat, entityHp: newHp, playerShadow: newPlayerShadow, turnsElapsed: newTurns },
        realmLog: [
          ...prev.realmLog,
          `You strike for ${dmg} shadow damage. ${entity.name} HP: ${newHp}/${prev.combat.entityMaxHp}. Shadow taken: ${newPlayerShadow}/${prev.combat.maxShadow}`,
        ],
      };
    });
  }, []);

  const srAPIFleeCombat = useCallback((): void => {
    srAPISetState((prev) => {
      if (!prev.combat.activeEntity) return prev;
      return {
        ...prev,
        combat: { activeEntity: null, entityHp: 0, entityMaxHp: 0, playerShadow: 0, maxShadow: 100, turnsElapsed: 0, isConquering: false, conquerProgress: 0, conquerTarget: 0 },
        realmLog: [...prev.realmLog, 'You dissolve into shadow and flee the combat.'],
      };
    });
  }, []);

  const srAPIUseAbility = useCallback((abilityId: string): { damage: number; shadowReduced: number; log: string } => {
    let result = { damage: 0, shadowReduced: 0, log: '' };
    srAPISetState((prev) => {
      if (!prev.combat.activeEntity) return prev;
      const ad = SR_ABILITY_DATA[abilityId];
      if (!ad) return prev;
      if (!prev.abilitiesUnlocked.includes(abilityId)) return prev;
      const abilityLevel = prev.abilityLevels[abilityId] ?? 1;
      const power = ad.basePower * abilityLevel;
      let dmg = 0;
      let shadowRed = 0;
      const logs: string[] = [];

      if (ad.abilityType === 'offense' || ad.abilityType === 'command') {
        dmg = Math.floor(power * 1.5);
        const newHp = Math.max(0, prev.combat.entityHp - dmg);
        logs.push(`You channel ${ad.name}! ${dmg} shadow damage!`);
        const entity = SR_ENTITY_DATA[prev.combat.activeEntity];
        if (entity && newHp <= 0) {
          const rarityMult = SR_RARITY_MULTIPLIER[entity.shadowType] ?? 1.0;
          const xBonus = Math.floor(entity.xpReward * rarityMult);
          const cBonus = Math.floor(entity.coinReward * rarityMult);
          logs.push(`${entity.name} defeated! +${xBonus} XP, +${cBonus} coins.`);
          const newLevel = srCalculateLevel(prev.experience + xBonus);
          const newTitle = srTitleForLevel(newLevel);
          const newDefeated = prev.defeatedEntities.includes(prev.combat.activeEntity)
            ? prev.defeatedEntities
            : [...prev.defeatedEntities, prev.combat.activeEntity];
          result = { damage: dmg, shadowReduced: 0, log: logs.join(' ') };
          return {
            ...prev,
            level: newLevel, experience: prev.experience + xBonus,
            coins: prev.coins + cBonus, totalCoinsEarned: prev.totalCoinsEarned + cBonus,
            totalEntitiesDefeated: prev.totalEntitiesDefeated + 1,
            title: newTitle, defeatedEntities: newDefeated,
            combat: { activeEntity: null, entityHp: 0, entityMaxHp: 0, playerShadow: 0, maxShadow: 100, turnsElapsed: 0, isConquering: false, conquerProgress: 0, conquerTarget: 0 },
            realmLog: [...prev.realmLog, ...logs],
          };
        }
        result = { damage: dmg, shadowReduced: 0, log: logs.join(' ') };
        return {
          ...prev,
          combat: { ...prev.combat, entityHp: newHp },
          realmLog: [...prev.realmLog, ...logs],
        };
      }

      if (ad.abilityType === 'defense' || ad.abilityType === 'healing') {
        shadowRed = Math.floor(power * 0.8);
        logs.push(`You activate ${ad.name}! Shadow reduced by ${shadowRed}.`);
        result = { damage: 0, shadowReduced: shadowRed, log: logs.join(' ') };
        return {
          ...prev,
          combat: { ...prev.combat, playerShadow: Math.max(0, prev.combat.playerShadow - shadowRed) },
          realmLog: [...prev.realmLog, ...logs],
        };
      }

      logs.push(`You use ${ad.name}! ${ad.description}`);
      result = { damage: 0, shadowReduced: 0, log: logs.join(' ') };
      return {
        ...prev,
        realmLog: [...prev.realmLog, ...logs],
      };
    });
    return result;
  }, []);

  const srAPIReduceShadow = useCallback((amount: number): void => {
    srAPISetState((prev) => {
      const ns = Math.max(0, prev.combat.playerShadow - amount);
      return {
        ...prev,
        combat: { ...prev.combat, playerShadow: ns },
        realmLog: [...prev.realmLog, `You dissipate shadow energy. Shadow -${amount}. (Current: ${ns}/${prev.combat.maxShadow})`],
      };
    });
  }, []);

  // ----------------------------------------------------------
  // Shadow Harvesting
  // ----------------------------------------------------------

  const srAPIStartHarvest = useCallback((): void => {
    srAPISetState((prev) => {
      if (prev.harvest.isHarvesting) return prev;
      const dd = SR_DOMAIN_DATA[prev.currentDomain];
      if (!dd) return prev;
      const target = 5 + prev.shadowHarvestLevel * 2;
      return {
        ...prev,
        harvest: { ...prev.harvest, isHarvesting: true, harvestProgress: 0, harvestTarget: target },
        realmLog: [...prev.realmLog, `You begin harvesting shadows in ${dd.name}. Target: ${target} essence.`],
      };
    });
  }, []);

  const srAPIAdvanceHarvest = useCallback((): { gained: number; log: string } | null => {
    let result: { gained: number; log: string } | null = null;
    srAPISetState((prev) => {
      if (!prev.harvest.isHarvesting) return prev;
      const r1 = srRollInRange(prev.rngSeed, 1, 3 + prev.shadowHarvestLevel);
      let structDp = 0;
      for (const sid of Object.keys(prev.structureLevels)) {
        const sData = SR_STRUCTURE_DATA[sid];
        const sLevel = prev.structureLevels[sid];
        if (sData && sLevel) {
          structDp += sData.darkPowerPerLevel * sLevel;
        }
      }
      const gained = r1.value + Math.floor(structDp * 0.5);
      const newProgress = prev.harvest.harvestProgress + gained;
      const logs: string[] = [`Harvested ${gained} shadow essence. (${newProgress}/${prev.harvest.harvestTarget})`];

      if (newProgress >= prev.harvest.harvestTarget) {
        const xpGain = 20 + prev.shadowHarvestLevel * 10;
        const coinGain = 10 + prev.shadowHarvestLevel * 5;
        logs.push(`Harvest complete! +${xpGain} Shadow Harvest XP, +${coinGain} coins.`);
        const newXp = prev.shadowHarvestXp + xpGain;
        let newLevel = prev.shadowHarvestLevel;
        let xpNeeded = 50 * newLevel;
        let remainingXp = newXp;
        while (remainingXp >= xpNeeded && newLevel < 50) {
          remainingXp -= xpNeeded;
          newLevel++;
          xpNeeded = 50 * newLevel;
          logs.push(`Shadow Harvest level up! Now level ${newLevel}.`);
        }
        result = { gained, log: logs.join(' ') };
        return {
          ...prev,
          rngSeed: r1.nextSeed,
          harvest: { ...prev.harvest, isHarvesting: false, harvestProgress: 0, harvestsCompleted: prev.harvest.harvestsCompleted + 1 },
          coins: prev.coins + coinGain, totalCoinsEarned: prev.totalCoinsEarned + coinGain,
          shadowHarvestLevel: newLevel, shadowHarvestXp: remainingXp,
          totalHarvested: prev.totalHarvested + newProgress,
          realmLog: [...prev.realmLog, ...logs],
        };
      }

      result = { gained, log: logs.join(' ') };
      return {
        ...prev,
        rngSeed: r1.nextSeed,
        harvest: { ...prev.harvest, harvestProgress: newProgress },
        realmLog: [...prev.realmLog, ...logs],
      };
    });
    return result;
  }, []);

  const srAPICancelHarvest = useCallback((): void => {
    srAPISetState((prev) => {
      return {
        ...prev,
        harvest: { ...prev.harvest, isHarvesting: false, harvestProgress: 0 },
        realmLog: [...prev.realmLog, 'Shadow harvest abandoned. The darkness fades...'],
      };
    });
  }, []);

  // ----------------------------------------------------------
  // Legion Commanding
  // ----------------------------------------------------------

  const srAPICommandLegion = useCallback((): { kills: number; log: string } => {
    let result = { kills: 0, log: '' };
    srAPISetState((prev) => {
      if (prev.legion.legionSize < 1) return prev;
      const r1 = srRollInRange(prev.rngSeed, 1, prev.legion.legionSize);
      const kills = r1.value;
      const xpGain = kills * 15 + prev.legionCommandLevel * 5;
      const coinGain = kills * 8;
      const logs = [`Your legion of ${prev.legion.legionSize} shadows conquers ${kills} entities! +${xpGain} XP, +${coinGain} coins.`];
      const newXp = prev.legionCommandXp + xpGain;
      let newLevel = prev.legionCommandLevel;
      let xpNeeded = 60 * newLevel;
      let remainingXp = newXp;
      while (remainingXp >= xpNeeded && newLevel < 50) {
        remainingXp -= xpNeeded;
        newLevel++;
        xpNeeded = 60 * newLevel;
        logs.push(`Legion Command level up! Now level ${newLevel}.`);
      }
      const newMaxLegion = 5 + newLevel * 2;
      result = { kills, log: logs.join(' ') };
      return {
        ...prev,
        rngSeed: r1.nextSeed,
        legion: { ...prev.legion, maxLegionSize: newMaxLegion, legionMorale: Math.min(100, prev.legion.legionMorale + 5) },
        legionCommandLevel: newLevel, legionCommandXp: remainingXp,
        coins: prev.coins + coinGain, totalCoinsEarned: prev.totalCoinsEarned + coinGain,
        totalEntitiesDefeated: prev.totalEntitiesDefeated + kills,
        totalLegionsCommanded: prev.totalLegionsCommanded + 1,
        realmLog: [...prev.realmLog, ...logs],
      };
    });
    return result;
  }, []);

  const srAPIRecruitSoldier = useCallback((): boolean => {
    let success = false;
    srAPISetState((prev) => {
      if (prev.legion.legionSize >= prev.legion.maxLegionSize) return prev;
      if (prev.coins < 20) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - 20,
        legion: { ...prev.legion, legionSize: prev.legion.legionSize + 1 },
        realmLog: [...prev.realmLog, `Recruited a shadow soldier! Legion size: ${prev.legion.legionSize + 1}/${prev.legion.maxLegionSize}.`],
      };
    });
    return success;
  }, []);

  // ----------------------------------------------------------
  // Relic Forge
  // ----------------------------------------------------------

  const srAPIStartForge = useCallback((relicId: string): void => {
    srAPISetState((prev) => {
      if (prev.relicForge.isForging) return prev;
      const rd = SR_RELIC_DATA[relicId];
      if (!rd) return prev;
      const target = 8 + prev.relicForgeLevel * 2;
      return {
        ...prev,
        relicForge: { ...prev.relicForge, isForging: true, forgingRelic: relicId, forgeProgress: 0, forgeTarget: target },
        realmLog: [...prev.realmLog, `Forging ${rd.name} at the Shadowforge. Target: ${target} progress.`],
      };
    });
  }, []);

  const srAPIAdvanceForge = useCallback((): { progress: number; log: string } | null => {
    let result: { progress: number; log: string } | null = null;
    srAPISetState((prev) => {
      if (!prev.relicForge.isForging || !prev.relicForge.forgingRelic) return prev;
      const r1 = srRollInRange(prev.rngSeed, 1, 2 + prev.relicForgeLevel);
      const pg = r1.value;
      const np = prev.relicForge.forgeProgress + pg;
      const logs: string[] = [`Forging progress: +${pg} (Total: ${np}/${prev.relicForge.forgeTarget})`];

      if (np >= prev.relicForge.forgeTarget) {
        const relicId = prev.relicForge.forgingRelic;
        const rd = SR_RELIC_DATA[relicId];
        const xpGain = 30 + prev.relicForgeLevel * 12;
        logs.push(`Relic ${rd?.name ?? relicId} forged successfully! +${xpGain} Forge XP.`);
        const newXp = prev.relicForgeXp + xpGain;
        let newLevel = prev.relicForgeLevel;
        let xpNeeded = 70 * newLevel;
        let remainingXp = newXp;
        while (remainingXp >= xpNeeded && newLevel < 50) {
          remainingXp -= xpNeeded;
          newLevel++;
          xpNeeded = 70 * newLevel;
          logs.push(`Relic Forge level up! Now level ${newLevel}.`);
        }
        const newRelics = prev.relicsOwned.includes(relicId) ? prev.relicsOwned : [...prev.relicsOwned, relicId];
        result = { progress: np, log: logs.join(' ') };
        return {
          ...prev,
          rngSeed: r1.nextSeed,
          relicForge: { isForging: false, forgingRelic: null, forgeProgress: 0, forgeTarget: 10, relicsForged: prev.relicForge.relicsForged + 1 },
          relicsOwned: newRelics,
          relicForgeLevel: newLevel, relicForgeXp: remainingXp,
          totalRelicsForged: prev.totalRelicsForged + 1,
          realmLog: [...prev.realmLog, ...logs],
        };
      }

      result = { progress: np, log: logs.join(' ') };
      return {
        ...prev,
        rngSeed: r1.nextSeed,
        relicForge: { ...prev.relicForge, forgeProgress: np },
        realmLog: [...prev.realmLog, ...logs],
      };
    });
    return result;
  }, []);

  const srAPICancelForge = useCallback((): void => {
    srAPISetState((prev) => {
      return {
        ...prev,
        relicForge: { isForging: false, forgingRelic: null, forgeProgress: 0, forgeTarget: 10, relicsForged: prev.relicForge.relicsForged },
        realmLog: [...prev.realmLog, 'Forging cancelled. The shadow flames die down.'],
      };
    });
  }, []);

  // ----------------------------------------------------------
  // Eclipse Management
  // ----------------------------------------------------------

  const srAPITriggerEclipse = useCallback((): void => {
    srAPISetState((prev) => {
      if (prev.eclipse.eclipseActive) return prev;
      if (prev.eclipse.eclipseCooldown > 0) return prev;
      const intensity = 10 + prev.eclipseManagementLevel * 5;
      return {
        ...prev,
        eclipse: { eclipsePhase: 1, eclipseIntensity: intensity, eclipseCooldown: 0, eclipseActive: true, lastEclipseTime: Date.now() },
        realmLog: [...prev.realmLog, `An eclipse begins! Intensity: ${intensity}. All shadow power doubled!`],
      };
    });
  }, []);

  const srAPIAdvanceEclipse = useCallback((): { phase: number; reward: number } | null => {
    let result: { phase: number; reward: number } | null = null;
    srAPISetState((prev) => {
      if (!prev.eclipse.eclipseActive) return prev;
      const newPhase = prev.eclipse.eclipsePhase + 1;
      const maxPhase = 3 + Math.floor(prev.eclipseManagementLevel / 10);
      const coinReward = Math.floor(prev.eclipse.eclipseIntensity * 2 * newPhase);
      const logs: string[] = [`Eclipse phase ${newPhase}/${maxPhase}. +${coinReward} coins.`];

      if (newPhase > maxPhase) {
        const xpGain = 50 * prev.eclipseManagementLevel;
        logs.push(`Eclipse complete! +${xpGain} Eclipse Management XP.`);
        const newXp = prev.eclipseManagementXp + xpGain;
        let newLevel = prev.eclipseManagementLevel;
        let xpNeeded = 80 * newLevel;
        let remainingXp = newXp;
        while (remainingXp >= xpNeeded && newLevel < 50) {
          remainingXp -= xpNeeded;
          newLevel++;
          xpNeeded = 80 * newLevel;
          logs.push(`Eclipse Management level up! Now level ${newLevel}.`);
        }
        const achCtx: SrAchievementCtx = {
          totalHarvested: prev.totalHarvested,
          relicsOwnedCount: prev.relicsOwned.length,
          legionSize: prev.legion.legionSize,
          totalPhantomsBonded: prev.totalPhantomsBonded,
          domainsConquered: prev.domainsConquered.length,
          totalRelicsForged: prev.totalRelicsForged,
          eclipseSurvived: true,
          dailyQuestsCompleted: prev.dailyQuest.dailyQuestsCompleted,
          maxedStructures: 0,
          legendaryDefeated: 0,
          defeatedDuskLord: false,
          tamedAbyssEntity: false,
          level: prev.level,
          defeatedEclipseEmperor: false,
        };
        const newAch = srCheckAchievements(achCtx);
        result = { phase: maxPhase, reward: coinReward };
        return {
          ...prev,
          eclipse: { eclipsePhase: 0, eclipseIntensity: 0, eclipseCooldown: 5, eclipseActive: false, lastEclipseTime: Date.now() },
          eclipseManagementLevel: newLevel, eclipseManagementXp: remainingXp,
          coins: prev.coins + coinReward, totalCoinsEarned: prev.totalCoinsEarned + coinReward,
          totalEclipsesManaged: prev.totalEclipsesManaged + 1,
          achievements: Array.from(new Set([...prev.achievements, ...newAch])),
          realmLog: [...prev.realmLog, ...logs],
        };
      }

      result = { phase: newPhase, reward: coinReward };
      return {
        ...prev,
        eclipse: { ...prev.eclipse, eclipsePhase: newPhase },
        coins: prev.coins + coinReward, totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        realmLog: [...prev.realmLog, ...logs],
      };
    });
    return result;
  }, []);

  // ----------------------------------------------------------
  // Phantom Bonding
  // ----------------------------------------------------------

  const srAPIBondPhantom = useCallback((phantomId: string): boolean => {
    let success = false;
    srAPISetState((prev) => {
      const entity = SR_ENTITY_DATA[phantomId];
      if (!entity) return prev;
      if (prev.legion.bondedPhantoms.length >= 3 + prev.phantomBondLevel) return prev;
      if (prev.coins < 30 * (entity.shadowType === SR_RARITY_LEGENDARY ? 10 : 1)) return prev;
      const cost = 30 * (entity.shadowType === SR_RARITY_LEGENDARY ? 10 : 1);
      const bondStrength = 10 + prev.phantomBondLevel * 5;
      const xpGain = 25 + (SR_RARITY_MULTIPLIER[entity.shadowType] ?? 1) * 20;
      const logs = [`You form a phantom bond with ${entity.name}! Bond strength: ${bondStrength}. Cost: ${cost} coins.`];
      const newXp = prev.phantomBondXp + xpGain;
      let newLevel = prev.phantomBondLevel;
      let xpNeeded = 55 * newLevel;
      let remainingXp = newXp;
      while (remainingXp >= xpNeeded && newLevel < 50) {
        remainingXp -= xpNeeded;
        newLevel++;
        xpNeeded = 55 * newLevel;
        logs.push(`Phantom Bond level up! Now level ${newLevel}.`);
      }
      success = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        legion: {
          ...prev.legion,
          bondedPhantoms: [...prev.legion.bondedPhantoms, phantomId],
          phantomBonds: { ...prev.legion.phantomBonds, [phantomId]: bondStrength },
        },
        phantomBondLevel: newLevel, phantomBondXp: remainingXp,
        totalPhantomsBonded: prev.totalPhantomsBonded + 1,
        realmLog: [...prev.realmLog, ...logs],
      };
    });
    return success;
  }, []);

  // ----------------------------------------------------------
  // Relic Purchase & Equip
  // ----------------------------------------------------------

  const srAPIPurchaseRelic = useCallback((relicId: string): boolean => {
    let success = false;
    srAPISetState((prev) => {
      const rd = SR_RELIC_DATA[relicId];
      if (!rd) return prev;
      if (prev.coins < rd.cost || prev.level < rd.levelReq) return prev;
      if (prev.relicsOwned.includes(relicId)) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - rd.cost,
        relicsOwned: [...prev.relicsOwned, relicId],
        realmLog: [...prev.realmLog, `Purchased ${rd.name} for ${rd.cost} coins!`],
      };
    });
    return success;
  }, []);

  const srAPIEquipRelic = useCallback((relicId: string): void => {
    srAPISetState((prev) => {
      const rd = SR_RELIC_DATA[relicId];
      return {
        ...prev,
        equippedRelic: relicId,
        realmLog: [...prev.realmLog, `Equipped ${rd?.name ?? relicId}. Power +${rd?.darkPowerBonus ?? 0}, Speed +${rd?.speedBonus ?? 0}.`],
      };
    });
  }, []);

  // ----------------------------------------------------------
  // Ability Unlock & Upgrade
  // ----------------------------------------------------------

  const srAPIUnlockAbility = useCallback((abilityId: string): boolean => {
    let success = false;
    srAPISetState((prev) => {
      const ad = SR_ABILITY_DATA[abilityId];
      if (!ad) return prev;
      if (prev.coins < ad.cost || prev.level < ad.unlockLevel) return prev;
      if (prev.abilitiesUnlocked.includes(abilityId)) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - ad.cost,
        abilitiesUnlocked: [...prev.abilitiesUnlocked, abilityId],
        abilityLevels: { ...prev.abilityLevels, [abilityId]: 1 },
        realmLog: [...prev.realmLog, `Unlocked ${ad.name}! ${ad.description}`],
      };
    });
    return success;
  }, []);

  const srAPIUpgradeAbility = useCallback((abilityId: string): boolean => {
    let success = false;
    srAPISetState((prev) => {
      const ad = SR_ABILITY_DATA[abilityId];
      if (!ad) return prev;
      const cur = prev.abilityLevels[abilityId] ?? 0;
      if (cur < 1) return prev;
      if (cur >= 10) return prev;
      const cost = Math.floor(ad.cost * 0.5 * cur);
      if (prev.coins < cost) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        abilityLevels: { ...prev.abilityLevels, [abilityId]: cur + 1 },
        realmLog: [...prev.realmLog, `Upgraded ${ad.name} to level ${cur + 1}!`],
      };
    });
    return success;
  }, []);

  // ----------------------------------------------------------
  // Structure Upgrade
  // ----------------------------------------------------------

  const srAPIUpgradeStructure = useCallback((structureId: string): boolean => {
    let success = false;
    srAPISetState((prev) => {
      const sd = SR_STRUCTURE_DATA[structureId];
      if (!sd) return prev;
      const currentLevel = prev.structureLevels[structureId] ?? 0;
      if (currentLevel >= sd.maxLevel) return prev;
      if (currentLevel < 1) return prev;
      const cost = Math.floor(sd.baseCost * Math.pow(sd.costMultiplier, currentLevel - 1));
      if (prev.coins < cost) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        structureLevels: { ...prev.structureLevels, [structureId]: currentLevel + 1 },
        realmLog: [...prev.realmLog, `Upgraded ${sd.name} to level ${currentLevel + 1}/${sd.maxLevel} for ${cost} coins.`],
      };
    });
    return success;
  }, []);

  const srAPIBuildStructure = useCallback((structureId: string): boolean => {
    let success = false;
    srAPISetState((prev) => {
      const sd = SR_STRUCTURE_DATA[structureId];
      if (!sd) return prev;
      if (prev.structureLevels[structureId]) return prev;
      if (prev.coins < sd.baseCost) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - sd.baseCost,
        structureLevels: { ...prev.structureLevels, [structureId]: 1 },
        realmLog: [...prev.realmLog, `Built ${sd.name} for ${sd.baseCost} coins!`],
      };
    });
    return success;
  }, []);

  // ----------------------------------------------------------
  // Domain Conquering
  // ----------------------------------------------------------

  const srAPIStartConquer = useCallback((): void => {
    srAPISetState((prev) => {
      if (!prev.combat.activeEntity) return prev;
      return {
        ...prev,
        combat: { ...prev.combat, isConquering: true, conquerProgress: 0, conquerTarget: 3 },
        realmLog: [...prev.realmLog, 'You begin the conquering ritual to claim this domain!'],
      };
    });
  }, []);

  const srAPIAdvanceConquer = useCallback((): boolean => {
    let success = false;
    srAPISetState((prev) => {
      if (!prev.combat.isConquering) return prev;
      const r1 = srAdvanceRng(prev.rngSeed);
      const pg = Math.floor(r1.value * 2) + 1;
      const np = prev.combat.conquerProgress + pg;
      const logs: string[] = [`Conquer progress: +${pg} (Total: ${np}/${prev.combat.conquerTarget})`];

      if (np >= prev.combat.conquerTarget) {
        const domainId = prev.currentDomain;
        const dd = SR_DOMAIN_DATA[domainId];
        const alreadyConquered = prev.domainsConquered.includes(domainId);
        if (!alreadyConquered) {
          logs.push(`Domain ${dd?.name ?? domainId} conquered! The shadows bow to your power.`);
          const achCtx: SrAchievementCtx = {
            totalHarvested: prev.totalHarvested,
            relicsOwnedCount: prev.relicsOwned.length,
            legionSize: prev.legion.legionSize,
            totalPhantomsBonded: prev.totalPhantomsBonded,
            domainsConquered: prev.domainsConquered.length + 1,
            totalRelicsForged: prev.totalRelicsForged,
            eclipseSurvived: false,
            dailyQuestsCompleted: prev.dailyQuest.dailyQuestsCompleted,
            maxedStructures: 0,
            legendaryDefeated: 0,
            defeatedDuskLord: false,
            tamedAbyssEntity: false,
            level: prev.level,
            defeatedEclipseEmperor: false,
          };
          const newAch = srCheckAchievements(achCtx);
          success = true;
          return {
            ...prev,
            rngSeed: r1.nextSeed,
            combat: { ...prev.combat, isConquering: false, conquerProgress: 0 },
            domainsConquered: [...prev.domainsConquered, domainId],
            achievements: Array.from(new Set([...prev.achievements, ...newAch])),
            realmLog: [...prev.realmLog, ...logs],
          };
        }
        success = true;
        return {
          ...prev,
          rngSeed: r1.nextSeed,
          combat: { ...prev.combat, isConquering: false, conquerProgress: 0 },
          realmLog: [...prev.realmLog, ...logs],
        };
      }

      return {
        ...prev,
        rngSeed: r1.nextSeed,
        combat: { ...prev.combat, conquerProgress: np },
        realmLog: [...prev.realmLog, ...logs],
      };
    });
    return success;
  }, []);

  // ----------------------------------------------------------
  // Daily Quest System
  // ----------------------------------------------------------

  const srAPIAcceptDailyQuest = useCallback((questId: string): boolean => {
    let success = false;
    srAPISetState((prev) => {
      const qd = SR_QUEST_DATA[questId];
      if (!qd) return prev;
      if (prev.dailyQuest.activeQuest) return prev;
      const today = new Date().toISOString().split('T')[0];
      if (prev.dailyQuest.lastQuestDate === today && prev.dailyQuest.questRewardClaimed) return prev;
      success = true;
      return {
        ...prev,
        dailyQuest: { activeQuest: questId, questProgress: 0, questTarget: qd.targetCount, questCompleted: false, questRewardClaimed: false, lastQuestDate: today, dailyQuestsCompleted: prev.dailyQuest.dailyQuestsCompleted },
        realmLog: [...prev.realmLog, `Daily quest accepted: ${qd.name} — ${qd.description}`],
      };
    });
    return success;
  }, []);

  const srAPIAdvanceDailyQuest = useCallback((amount: number): void => {
    srAPISetState((prev) => {
      if (!prev.dailyQuest.activeQuest) return prev;
      const np = prev.dailyQuest.questProgress + amount;
      const logs: string[] = [];
      if (np >= prev.dailyQuest.questTarget) {
        logs.push(`Daily quest "${prev.dailyQuest.activeQuest}" completed! Claim your reward.`);
        return {
          ...prev,
          dailyQuest: { ...prev.dailyQuest, questProgress: prev.dailyQuest.questTarget, questCompleted: true },
          realmLog: [...prev.realmLog, ...logs],
        };
      }
      return {
        ...prev,
        dailyQuest: { ...prev.dailyQuest, questProgress: np },
        realmLog: [...prev.realmLog, `Quest progress: ${np}/${prev.dailyQuest.questTarget}`],
      };
    });
  }, []);

  const srAPIClaimQuestReward = useCallback((): { coins: number; xp: number } | null => {
    let result: { coins: number; xp: number } | null = null;
    srAPISetState((prev) => {
      if (!prev.dailyQuest.activeQuest || !prev.dailyQuest.questCompleted || prev.dailyQuest.questRewardClaimed) return prev;
      const qd = SR_QUEST_DATA[prev.dailyQuest.activeQuest];
      if (!qd) return prev;
      const newLevel = srCalculateLevel(prev.experience + qd.rewardXp);
      const newTitle = srTitleForLevel(newLevel);
      result = { coins: qd.rewardCoins, xp: qd.rewardXp };
      return {
        ...prev,
        level: newLevel, experience: prev.experience + qd.rewardXp, title: newTitle,
        coins: prev.coins + qd.rewardCoins, totalCoinsEarned: prev.totalCoinsEarned + qd.rewardCoins,
        dailyQuest: { activeQuest: null, questProgress: 0, questTarget: 0, questCompleted: false, questRewardClaimed: true, lastQuestDate: prev.dailyQuest.lastQuestDate, dailyQuestsCompleted: prev.dailyQuest.dailyQuestsCompleted + 1 },
        realmLog: [...prev.realmLog, `Quest reward claimed! +${qd.rewardCoins} coins, +${qd.rewardXp} XP. Daily quests: ${prev.dailyQuest.dailyQuestsCompleted + 1}.`],
      };
    });
    return result;
  }, []);

  const srAPIResetDailyQuest = useCallback((): void => {
    srAPISetState((prev) => {
      const today = new Date().toISOString().split('T')[0];
      if (prev.dailyQuest.lastQuestDate === today) return prev;
      return {
        ...prev,
        dailyQuest: { activeQuest: null, questProgress: 0, questTarget: 0, questCompleted: false, questRewardClaimed: false, lastQuestDate: today, dailyQuestsCompleted: prev.dailyQuest.dailyQuestsCompleted },
        realmLog: [...prev.realmLog, 'A new day dawns in the Shadow Realm. Daily quest reset.'],
      };
    });
  }, []);

  // ----------------------------------------------------------
  // State Management
  // ----------------------------------------------------------

  const srAPIResetState = useCallback((): void => {
    srAPISetState(srCreateInitialState());
  }, []);

  const srAPILoadState = useCallback((saved: SrShadowRealmState): void => {
    srAPISetState(saved);
  }, []);

  const srAPIGetSnapshot = useCallback((): SrShadowRealmState => {
    return { ...srAPIStateRef.current };
  }, []);

  const srAPISelectTitle = useCallback((titleName: string): boolean => {
    let success = false;
    srAPISetState((prev) => {
      if (!SR_ALL_TITLES.includes(titleName)) return prev;
      success = true;
      return {
        ...prev,
        title: titleName,
        realmLog: [...prev.realmLog, `You now bear the title: ${titleName}.`],
      };
    });
    return success;
  }, []);

  const srAPIGetAvailableTitles = useCallback((): string[] => {
    const level = srAPIStateRef.current.level;
    const titles: string[] = [SR_TITLE_SHADOW_INITIATE];
    if (level >= 5) titles.push(SR_TITLE_DUSK_WALKER);
    if (level >= 10) titles.push(SR_TITLE_VOID_EXPLORER);
    if (level >= 18) titles.push(SR_TITLE_PHANTOM_COMMANDER);
    if (level >= 25) titles.push(SR_TITLE_SHADOWFORGE_MASTER);
    if (level >= 33) titles.push(SR_TITLE_DUSKLORD);
    if (level >= 42) titles.push(SR_TITLE_ABYSS_WARDEN);
    if (level >= 50) titles.push(SR_TITLE_ECLIPSE_SOVEREIGN);
    return titles;
  }, []);

  // ----------------------------------------------------------
  // Stats & Info
  // ----------------------------------------------------------

  const srAPIGetPlayerStats = useCallback((): {
    level: number; xp: number; xpToNext: number; coins: number;
    title: string; domain: string; legionSize: number;
    harvestLevel: number; forgeLevel: number; eclipseLevel: number;
    bondLevel: number;
  } => {
    const s = srAPIStateRef.current;
    return {
      level: s.level, xp: s.experience, xpToNext: srXpForLevel(s.level),
      coins: s.coins, title: s.title, domain: s.currentDomain,
      legionSize: s.legion.legionSize,
      harvestLevel: s.shadowHarvestLevel, forgeLevel: s.relicForgeLevel,
      eclipseLevel: s.eclipseManagementLevel, bondLevel: s.phantomBondLevel,
    };
  }, []);

  const srAPIGetCombatStatus = useCallback((): {
    activeEntity: string | null; entityHp: number; entityMaxHp: number;
    playerShadow: number; maxShadow: number; turnsElapsed: number;
    isConquering: boolean; conquerProgress: number;
  } => {
    const c = srAPIStateRef.current.combat;
    return {
      activeEntity: c.activeEntity, entityHp: c.entityHp, entityMaxHp: c.entityMaxHp,
      playerShadow: c.playerShadow, maxShadow: c.maxShadow,
      turnsElapsed: c.turnsElapsed, isConquering: c.isConquering,
      conquerProgress: c.conquerProgress,
    };
  }, []);

  const srAPIGetEclipseStatus = useCallback((): {
    active: boolean; phase: number; intensity: number; cooldown: number;
  } => {
    const e = srAPIStateRef.current.eclipse;
    return { active: e.eclipseActive, phase: e.eclipsePhase, intensity: e.eclipseIntensity, cooldown: e.eclipseCooldown };
  }, []);

  const srAPICalculateDamage = useCallback((baseDamage: number): number => {
    const s = srAPIStateRef.current;
    const relicBonus = s.equippedRelic ? (SR_RELIC_DATA[s.equippedRelic]?.darkPowerBonus ?? 0) : 0;
    return baseDamage + s.level * 2 + relicBonus;
  }, []);

  const srAPIGetStructureUpgradeCost = useCallback((structureId: string): number => {
    const sd = SR_STRUCTURE_DATA[structureId];
    if (!sd) return 0;
    const currentLevel = srAPIStateRef.current.structureLevels[structureId] ?? 0;
    if (currentLevel < 1) return sd.baseCost;
    return Math.floor(sd.baseCost * Math.pow(sd.costMultiplier, currentLevel - 1));
  }, []);

  // ----------------------------------------------------------
  // Effect — daily quest auto-reset on mount
  // ----------------------------------------------------------

  useEffect(() => {
    srAPIResetDailyQuest();
  }, [srAPIResetDailyQuest]);

  // ----------------------------------------------------------
  // Return object — all functions exposed as srAPI
  // ----------------------------------------------------------

  return {
    // State accessors
    srAPIState,
    srAPIEquippedRelicData,
    srAPIEquippedDarkPower,
    srAPIActiveEntityData,
    srAPIDomainProgress,
    srAPIBestiaryProgress,
    srAPIRelicCollectionProgress,
    srAPIAbilityCollectionProgress,
    srAPIAchievementProgress,
    srAPIAvailableEntities,
    srAPILegionPower,
    srAPIStructureBonus,

    // Data lookups
    srAPIGetDomainData,
    srAPIGetEntityData,
    srAPIGetRelicData,
    srAPIGetStructureData,
    srAPIGetAbilityData,
    srAPIGetAchievementData,
    srAPIGetQuestData,
    srAPIGetRarityMultiplier,
    srAPIRarityLabel,
    srAPIXpForNextLevel,
    srAPIGetDomainEntities,

    // Status checks
    srAPIIsInCombat,
    srAPICanEnterDomain,
    srAPICanPurchaseRelic,
    srAPICanUnlockAbility,
    srAPIGetPlayerStats,
    srAPIGetCombatStatus,
    srAPIGetEclipseStatus,
    srAPIGetAvailableTitles,
    srAPICalculateDamage,
    srAPIGetStructureUpgradeCost,

    // Domain & Exploration
    srAPIChangeDomain,
    srAPIExploreDomain,
    srAPIEncounterEntity,

    // Combat
    srAPIAttackEntity,
    srAPIFleeCombat,
    srAPIUseAbility,
    srAPIReduceShadow,

    // Shadow Harvesting
    srAPIStartHarvest,
    srAPIAdvanceHarvest,
    srAPICancelHarvest,

    // Legion Commanding
    srAPICommandLegion,
    srAPIRecruitSoldier,

    // Relic Forge
    srAPIStartForge,
    srAPIAdvanceForge,
    srAPICancelForge,

    // Eclipse Management
    srAPITriggerEclipse,
    srAPIAdvanceEclipse,

    // Phantom Bonding
    srAPIBondPhantom,

    // Relic Purchase & Equip
    srAPIPurchaseRelic,
    srAPIEquipRelic,

    // Ability Unlock & Upgrade
    srAPIUnlockAbility,
    srAPIUpgradeAbility,

    // Structure Management
    srAPIBuildStructure,
    srAPIUpgradeStructure,

    // Domain Conquering
    srAPIStartConquer,
    srAPIAdvanceConquer,

    // Daily Quest System
    srAPIAcceptDailyQuest,
    srAPIAdvanceDailyQuest,
    srAPIClaimQuestReward,
    srAPIResetDailyQuest,

    // State Management
    srAPIResetState,
    srAPILoadState,
    srAPIGetSnapshot,
    srAPISelectTitle,
  };
}
