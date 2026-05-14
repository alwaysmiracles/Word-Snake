import { useState, useCallback, useMemo, useEffect } from 'react';

// ============================================================
// Seeded PRNG — mulberry32
// ============================================================

function nmAdvanceRng(seed: number): { value: number; nextSeed: number } {
  const s = (seed + 0x6D2B79F5) >>> 0;
  let t = s;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return { value: ((t ^ t >>> 14) >>> 0) / 4294967296, nextSeed: s };
}

function nmRollInRange(seed: number, min: number, max: number): { value: number; nextSeed: number } {
  const r = nmAdvanceRng(seed);
  return { value: min + Math.floor(r.value * (max - min + 1)), nextSeed: r.nextSeed };
}

function nmPickRandom<T>(seed: number, arr: T[]): { item: T; nextSeed: number } {
  if (arr.length === 0) return { item: arr[0] as T, nextSeed: seed };
  const r = nmAdvanceRng(seed);
  return { item: arr[Math.floor(r.value * arr.length)], nextSeed: r.nextSeed };
}

// ============================================================
// Color Constants
// ============================================================

export const NM_COLOR_VOID_BLACK = '#0D0D0D';
export const NM_COLOR_SHADOW_PURPLE = '#4B0082';
export const NM_COLOR_BLOOD_RED = '#8B0000';
export const NM_COLOR_GHOST_WHITE = '#F0F8FF';
export const NM_COLOR_NIGHTMARE_GREEN = '#006400';
export const NM_COLOR_MOON_SILVER = '#C0C0C0';
export const NM_ALL_COLORS: string[] = [
  NM_COLOR_VOID_BLACK, NM_COLOR_SHADOW_PURPLE, NM_COLOR_BLOOD_RED,
  NM_COLOR_GHOST_WHITE, NM_COLOR_NIGHTMARE_GREEN, NM_COLOR_MOON_SILVER,
];

// ============================================================
// Rarity Constants (5 tiers)
// ============================================================

export const NM_RARITY_SHADOW_WISP = 'shadow_wisp';
export const NM_RARITY_DREAM_EATER = 'dream_eater';
export const NM_RARITY_FEAR_HOUND = 'fear_hound';
export const NM_RARITY_PHANTOM_KNIGHT = 'phantom_knight';
export const NM_RARITY_NIGHTMARE_LORD = 'nightmare_lord';
export const NM_ALL_RARITIES: string[] = [
  NM_RARITY_SHADOW_WISP, NM_RARITY_DREAM_EATER, NM_RARITY_FEAR_HOUND,
  NM_RARITY_PHANTOM_KNIGHT, NM_RARITY_NIGHTMARE_LORD,
];
export const NM_RARITY_MULTIPLIER: Record<string, number> = {
  [NM_RARITY_SHADOW_WISP]: 1.0,
  [NM_RARITY_DREAM_EATER]: 1.5,
  [NM_RARITY_FEAR_HOUND]: 2.0,
  [NM_RARITY_PHANTOM_KNIGHT]: 3.0,
  [NM_RARITY_NIGHTMARE_LORD]: 5.0,
};

// ============================================================
// Zone Constants (8 zones)
// ============================================================

export const NM_ZONE_WHISPERING_CORRIDOR = 'whispering_corridor';
export const NM_ZONE_HALL_OF_MIRRORS = 'hall_of_mirrors';
export const NM_ZONE_ABYSS_BRIDGE = 'abyss_bridge';
export const NM_ZONE_SOUL_GARDEN = 'soul_garden';
export const NM_ZONE_DREAM_LIBRARY = 'dream_library';
export const NM_ZONE_FEAR_ARENA = 'fear_arena';
export const NM_ZONE_TWILIGHT_VOID = 'twilight_void';
export const NM_ZONE_HEART_OF_DARKNESS = 'heart_of_darkness';
export const NM_ALL_ZONES: string[] = [
  NM_ZONE_WHISPERING_CORRIDOR, NM_ZONE_HALL_OF_MIRRORS, NM_ZONE_ABYSS_BRIDGE,
  NM_ZONE_SOUL_GARDEN, NM_ZONE_DREAM_LIBRARY, NM_ZONE_FEAR_ARENA,
  NM_ZONE_TWILIGHT_VOID, NM_ZONE_HEART_OF_DARKNESS,
];

// ============================================================
// Creature Constants (37 creatures, 5 rarity tiers)
// ============================================================

export const NM_CREATURE_GLOOM_WISP = 'gloom_wisp';
export const NM_CREATURE_WHISPER_SHADE = 'whisper_shade';
export const NM_CREATURE_VEIL_DRIFTER = 'veil_drifter';
export const NM_CREATURE_ASH_PHANTOM = 'ash_phantom';
export const NM_CREATURE_MIST_WRAITH = 'mist_wraith';
export const NM_CREATURE_HOLLOW_ECHO = 'hollow_echo';
export const NM_CREATURE_TWILIGHT_WISP = 'twilight_wisp';
export const NM_CREATURE_VOID_MOTE = 'void_mote';
export const NM_CREATURE_MIND_DEVOURER = 'mind_devourer';
export const NM_CREATURE_SLUMBER_LEECH = 'slumber_leech';
export const NM_CREATURE_NIGHTMARE_TICK = 'nightmare_tick';
export const NM_CREATURE_DREAM_PARASITE = 'dream_parasite';
export const NM_CREATURE_MEMORY_EATER = 'memory_eater';
export const NM_CREATURE_HOPE_DRINKER = 'hope_drinker';
export const NM_CREATURE_VISION_THIEF = 'vision_thief';
export const NM_CREATURE_THOUGHT_REAPER = 'thought_reaper';
export const NM_CREATURE_TERROR_HOUND = 'terror_hound';
export const NM_CREATURE_DREAD_WOLF = 'dread_wolf';
export const NM_CREATURE_PANIC_STALKER = 'panic_stalker';
export const NM_CREATURE_PHOBIA_BEAST = 'phobia_beast';
export const NM_CREATURE_SHADOW_MASTIFF = 'shadow_mastiff';
export const NM_CREATURE_HORROR_HOUND = 'horror_hound';
export const NM_CREATURE_DREADHOUND_ALPHA = 'dreadhound_alpha';
export const NM_CREATURE_CREEPING_DREAD = 'creeping_dread';
export const NM_CREATURE_SPECTRAL_CHAMPION = 'spectral_champion';
export const NM_CREATURE_WRAITH_KNIGHT = 'wraith_knight';
export const NM_CREATURE_DOOM_CAVALIER = 'doom_cavalier';
export const NM_CREATURE_SOUL_REAVER = 'soul_reaver';
export const NM_CREATURE_NIGHTMARE_TEMPLAR = 'nightmare_templar';
export const NM_CREATURE_VOID_SENTINEL = 'void_sentinel';
export const NM_CREATURE_PHANTOM_GUARDIAN = 'phantom_guardian';
export const NM_CREATURE_DREAM_SOVEREIGN = 'dream_sovereign';
export const NM_CREATURE_LORD_ENDLESS_NIGHT = 'lord_endless_night';
export const NM_CREATURE_ABYSSAL_HORROR = 'abyssal_horror';
export const NM_CREATURE_ZARAK_DEVOURER = 'zarak_devourer';
export const NM_CREATURE_NIGHTMARE_OVERLORD = 'nightmare_overlord';
export const NM_CREATURE_SHADOW_PHOENIX = 'shadow_phoenix';
export const NM_ALL_CREATURES: string[] = [
  NM_CREATURE_GLOOM_WISP, NM_CREATURE_WHISPER_SHADE, NM_CREATURE_VEIL_DRIFTER,
  NM_CREATURE_ASH_PHANTOM, NM_CREATURE_MIST_WRAITH, NM_CREATURE_HOLLOW_ECHO,
  NM_CREATURE_TWILIGHT_WISP, NM_CREATURE_VOID_MOTE,
  NM_CREATURE_MIND_DEVOURER, NM_CREATURE_SLUMBER_LEECH, NM_CREATURE_NIGHTMARE_TICK,
  NM_CREATURE_DREAM_PARASITE, NM_CREATURE_MEMORY_EATER, NM_CREATURE_HOPE_DRINKER,
  NM_CREATURE_VISION_THIEF, NM_CREATURE_THOUGHT_REAPER,
  NM_CREATURE_TERROR_HOUND, NM_CREATURE_DREAD_WOLF, NM_CREATURE_PANIC_STALKER,
  NM_CREATURE_PHOBIA_BEAST, NM_CREATURE_SHADOW_MASTIFF, NM_CREATURE_HORROR_HOUND,
  NM_CREATURE_DREADHOUND_ALPHA, NM_CREATURE_CREEPING_DREAD,
  NM_CREATURE_SPECTRAL_CHAMPION, NM_CREATURE_WRAITH_KNIGHT, NM_CREATURE_DOOM_CAVALIER,
  NM_CREATURE_SOUL_REAVER, NM_CREATURE_NIGHTMARE_TEMPLAR, NM_CREATURE_VOID_SENTINEL,
  NM_CREATURE_PHANTOM_GUARDIAN,
  NM_CREATURE_DREAM_SOVEREIGN, NM_CREATURE_LORD_ENDLESS_NIGHT,
  NM_CREATURE_ABYSSAL_HORROR, NM_CREATURE_ZARAK_DEVOURER,
  NM_CREATURE_NIGHTMARE_OVERLORD, NM_CREATURE_SHADOW_PHOENIX,
];

// ============================================================
// Weapon Constants (28 shadow weapons)
// ============================================================

export const NM_WEAPON_GLOOM_DAGGER = 'gloom_dagger';
export const NM_WEAPON_WHISPER_BLADE = 'whisper_blade';
export const NM_WEAPON_SHADOW_SHORTSWORD = 'shadow_shortsword';
export const NM_WEAPON_VEIL_CUTTER = 'veil_cutter';
export const NM_WEAPON_ASH_STAFF = 'ash_staff';
export const NM_WEAPON_MIST_FLAIL = 'mist_flail';
export const NM_WEAPON_HOLLOW_BOW = 'hollow_bow';
export const NM_WEAPON_TWILIGHT_SPEAR = 'twilight_spear';
export const NM_WEAPON_VOID_EDGE = 'void_edge';
export const NM_WEAPON_SOUL_HARPOON = 'soul_harpoon';
export const NM_WEAPON_DREAM_SHEARS = 'dream_shears';
export const NM_WEAPON_NIGHTMARE_SCYTHE = 'nightmare_scythe';
export const NM_WEAPON_DREAD_GREATSWORD = 'dread_greatsword';
export const NM_WEAPON_TERROR_AXE = 'terror_axe';
export const NM_WEAPON_PHOBIA_WHIP = 'phobia_whip';
export const NM_WEAPON_SHADOW_MASTIFF_FANG = 'shadow_mastiff_fang';
export const NM_WEAPON_SPECTRAL_BOW = 'spectral_bow';
export const NM_WEAPON_WRAITH_BLADE = 'wraith_blade';
export const NM_WEAPON_DOOM_HAMMER = 'doom_hammer';
export const NM_WEAPON_SOUL_REAVER_SWORD = 'soul_reaver_sword';
export const NM_WEAPON_NIGHTMARE_TEMPLAR_SHIELD = 'nightmare_templar_shield';
export const NM_WEAPON_VOID_SENTINEL_HALBERD = 'void_sentinel_halberd';
export const NM_WEAPON_PHANTOM_GUARDIAN_AEGIS = 'phantom_guardian_aegis';
export const NM_WEAPON_DREAM_SOVEREIGN_SCEPTER = 'dream_sovereign_scepter';
export const NM_WEAPON_ABYSSAL_CLEAVER = 'abyssal_cleaver';
export const NM_WEAPON_ETERNAL_DARKNESS_ORB = 'eternal_darkness_orb';
export const NM_WEAPON_SHADOW_PHOENIX_TALON = 'shadow_phoenix_talon';
export const NM_WEAPON_NIGHTMARE_OVERLORD_BLADE = 'nightmare_overlord_blade';
export const NM_ALL_WEAPONS: string[] = [
  NM_WEAPON_GLOOM_DAGGER, NM_WEAPON_WHISPER_BLADE, NM_WEAPON_SHADOW_SHORTSWORD,
  NM_WEAPON_VEIL_CUTTER, NM_WEAPON_ASH_STAFF, NM_WEAPON_MIST_FLAIL,
  NM_WEAPON_HOLLOW_BOW, NM_WEAPON_TWILIGHT_SPEAR, NM_WEAPON_VOID_EDGE,
  NM_WEAPON_SOUL_HARPOON, NM_WEAPON_DREAM_SHEARS, NM_WEAPON_NIGHTMARE_SCYTHE,
  NM_WEAPON_DREAD_GREATSWORD, NM_WEAPON_TERROR_AXE, NM_WEAPON_PHOBIA_WHIP,
  NM_WEAPON_SHADOW_MASTIFF_FANG, NM_WEAPON_SPECTRAL_BOW, NM_WEAPON_WRAITH_BLADE,
  NM_WEAPON_DOOM_HAMMER, NM_WEAPON_SOUL_REAVER_SWORD,
  NM_WEAPON_NIGHTMARE_TEMPLAR_SHIELD, NM_WEAPON_VOID_SENTINEL_HALBERD,
  NM_WEAPON_PHANTOM_GUARDIAN_AEGIS,
  NM_WEAPON_DREAM_SOVEREIGN_SCEPTER, NM_WEAPON_ABYSSAL_CLEAVER,
  NM_WEAPON_ETERNAL_DARKNESS_ORB, NM_WEAPON_SHADOW_PHOENIX_TALON,
  NM_WEAPON_NIGHTMARE_OVERLORD_BLADE,
];

// ============================================================
// Dream Power Constants (22 powers)
// ============================================================

export const NM_POWER_SHADOW_STEP = 'shadow_step';
export const NM_POWER_FEAR_WARD = 'fear_ward';
export const NM_POWER_SOUL_SIGHT = 'soul_sight';
export const NM_POWER_DREAM_SHIELD = 'dream_shield';
export const NM_POWER_NIGHTMARE_PULSE = 'nightmare_pulse';
export const NM_POWER_SHADOW_BIND = 'shadow_bind';
export const NM_POWER_FEAR_STRIKE = 'fear_strike';
export const NM_POWER_LUCID_AWAKENING = 'lucid_awakening';
export const NM_POWER_DREAM_WEAVE = 'dream_weave';
export const NM_POWER_SHADOW_CLOAK = 'shadow_cloak';
export const NM_POWER_SOUL_DRAIN = 'soul_drain';
export const NM_POWER_TERROR_ROAR = 'terror_roar';
export const NM_POWER_VOID_WALK = 'void_walk';
export const NM_POWER_MIND_BARRIER = 'mind_barrier';
export const NM_POWER_NIGHTMARE_FLASH = 'nightmare_flash';
export const NM_POWER_SHADOW_CLONE = 'shadow_clone';
export const NM_POWER_SOUL_HARVEST = 'soul_harvest';
export const NM_POWER_FEAR_IMMUNITY = 'fear_immunity';
export const NM_POWER_DREAM_MANIPULATION = 'dream_manipulation';
export const NM_POWER_SHADOW_STORM = 'shadow_storm';
export const NM_POWER_SOUL_PURIFY = 'soul_purify';
export const NM_POWER_NIGHTMARE_BANISH = 'nightmare_banish';
export const NM_ALL_POWERS: string[] = [
  NM_POWER_SHADOW_STEP, NM_POWER_FEAR_WARD, NM_POWER_SOUL_SIGHT,
  NM_POWER_DREAM_SHIELD, NM_POWER_NIGHTMARE_PULSE, NM_POWER_SHADOW_BIND,
  NM_POWER_FEAR_STRIKE, NM_POWER_LUCID_AWAKENING, NM_POWER_DREAM_WEAVE,
  NM_POWER_SHADOW_CLOAK, NM_POWER_SOUL_DRAIN, NM_POWER_TERROR_ROAR,
  NM_POWER_VOID_WALK, NM_POWER_MIND_BARRIER, NM_POWER_NIGHTMARE_FLASH,
  NM_POWER_SHADOW_CLONE, NM_POWER_SOUL_HARVEST, NM_POWER_FEAR_IMMUNITY,
  NM_POWER_DREAM_MANIPULATION, NM_POWER_SHADOW_STORM, NM_POWER_SOUL_PURIFY,
  NM_POWER_NIGHTMARE_BANISH,
];

// ============================================================
// Achievement Constants (17 achievements)
// ============================================================

export const NM_ACHIEVEMENT_FIRST_NIGHTMARE = 'first_nightmare';
export const NM_ACHIEVEMENT_SOUL_COLLECTOR = 'soul_collector';
export const NM_ACHIEVEMENT_FEARLESS = 'fearless';
export const NM_ACHIEVEMENT_DREAM_WEAVER = 'dream_weaver_ach';
export const NM_ACHIEVEMENT_SHADOW_MASTER = 'shadow_master';
export const NM_ACHIEVEMENT_ZONE_EXPLORER = 'zone_explorer';
export const NM_ACHIEVEMENT_WEAPON_HOARDER = 'weapon_hoarder';
export const NM_ACHIEVEMENT_POWER_UNLEASHED = 'power_unleashed';
export const NM_ACHIEVEMENT_NIGHTMARE_BANISHER = 'nightmare_banisher_ach';
export const NM_ACHIEVEMENT_DAILY_DREAMWALKER = 'daily_dreamwalker';
export const NM_ACHIEVEMENT_ECLIPSE_SURVIVOR = 'eclipse_survivor';
export const NM_ACHIEVEMENT_TIDE_RIDER = 'tide_rider';
export const NM_ACHIEVEMENT_RIFT_CONQUEROR = 'rift_conqueror';
export const NM_ACHIEVEMENT_LEVEL_10 = 'level_10';
export const NM_ACHIEVEMENT_LEVEL_25 = 'level_25';
export const NM_ACHIEVEMENT_LEVEL_50 = 'level_50';
export const NM_ACHIEVEMENT_LORD_OF_NIGHTMARES = 'lord_of_nightmares_ach';
export const NM_ALL_ACHIEVEMENTS: string[] = [
  NM_ACHIEVEMENT_FIRST_NIGHTMARE, NM_ACHIEVEMENT_SOUL_COLLECTOR,
  NM_ACHIEVEMENT_FEARLESS, NM_ACHIEVEMENT_DREAM_WEAVER,
  NM_ACHIEVEMENT_SHADOW_MASTER, NM_ACHIEVEMENT_ZONE_EXPLORER,
  NM_ACHIEVEMENT_WEAPON_HOARDER, NM_ACHIEVEMENT_POWER_UNLEASHED,
  NM_ACHIEVEMENT_NIGHTMARE_BANISHER, NM_ACHIEVEMENT_DAILY_DREAMWALKER,
  NM_ACHIEVEMENT_ECLIPSE_SURVIVOR, NM_ACHIEVEMENT_TIDE_RIDER,
  NM_ACHIEVEMENT_RIFT_CONQUEROR, NM_ACHIEVEMENT_LEVEL_10,
  NM_ACHIEVEMENT_LEVEL_25, NM_ACHIEVEMENT_LEVEL_50,
  NM_ACHIEVEMENT_LORD_OF_NIGHTMARES,
];

// ============================================================
// Title Constants (8 titles: Dream Walker → Lord of Nightmares)
// ============================================================

export const NM_TITLE_DREAM_WALKER = 'Dream Walker';
export const NM_TITLE_SHADOW_INITIATE = 'Shadow Initiate';
export const NM_TITLE_SOUL_SEEKER = 'Soul Seeker';
export const NM_TITLE_FEAR_CONQUEROR = 'Fear Conqueror';
export const NM_TITLE_DREAM_WEAVER_TITLE = 'Dream Weaver';
export const NM_TITLE_PHANTOM_KNIGHT_TITLE = 'Phantom Knight';
export const NM_TITLE_NIGHTMARE_COMMANDER = 'Nightmare Commander';
export const NM_TITLE_LORD_OF_NIGHTMARES = 'Lord of Nightmares';
export const NM_ALL_TITLES: string[] = [
  NM_TITLE_DREAM_WALKER, NM_TITLE_SHADOW_INITIATE, NM_TITLE_SOUL_SEEKER,
  NM_TITLE_FEAR_CONQUEROR, NM_TITLE_DREAM_WEAVER_TITLE,
  NM_TITLE_PHANTOM_KNIGHT_TITLE, NM_TITLE_NIGHTMARE_COMMANDER,
  NM_TITLE_LORD_OF_NIGHTMARES,
];

// ============================================================
// Event Constants (Nightmare Tide, Eclipse, Shadow Rift)
// ============================================================

export const NM_EVENT_NIGHTMARE_TIDE = 'nightmare_tide';
export const NM_EVENT_ECLIPSE = 'eclipse';
export const NM_EVENT_SHADOW_RIFT = 'shadow_rift';
export const NM_ALL_EVENTS: string[] = [
  NM_EVENT_NIGHTMARE_TIDE, NM_EVENT_ECLIPSE, NM_EVENT_SHADOW_RIFT,
];

// ============================================================
// Interfaces
// ============================================================

export interface NmCreatureData {
  name: string;
  rarity: string;
  zone: string;
  baseHp: number;
  fearDamage: number;
  description: string;
  xpReward: number;
  coinReward: number;
  soulDrop: string;
  weaponDrop: string | null;
}

export interface NmZoneData {
  name: string;
  description: string;
  levelReq: number;
  creaturePool: string[];
  dangerLevel: number;
  ambientColor: string;
  bossCreature: string;
}

export interface NmWeaponData {
  name: string;
  rarity: string;
  baseDamage: number;
  fearBonus: number;
  description: string;
  cost: number;
  levelReq: number;
}

export interface NmDreamPowerData {
  name: string;
  description: string;
  powerType: string;
  basePower: number;
  cooldown: number;
  unlockLevel: number;
  cost: number;
}

export interface NmAchievementData {
  name: string;
  description: string;
  checkFn: string;
}

export interface NmEventData {
  name: string;
  description: string;
  duration: number;
  creatureBoost: number;
  coinMultiplier: number;
  xpMultiplier: number;
  rewardCoins: number;
  rewardXp: number;
}

export interface NmCombatState {
  activeCreature: string | null;
  creatureHp: number;
  creatureMaxHp: number;
  playerFear: number;
  maxFear: number;
  turnsElapsed: number;
  isBanishing: boolean;
  banishProgress: number;
  banishTarget: number;
}

export interface NmDreamWeavingState {
  activePattern: string | null;
  weaveProgress: number;
  weaveTarget: number;
  dreamThreads: number;
  nightmareTears: number;
  patternsCompleted: number;
}

export interface NmPatrolState {
  isPatrolling: boolean;
  patrolZone: string | null;
  patrolKills: number;
  patrolTarget: number;
  patrolStartTime: number | null;
  patrolCompletedToday: boolean;
  patrolRewardClaimed: boolean;
  lastPatrolDate: string | null;
}

export interface NmEventState {
  activeEvent: string | null;
  eventStartTime: number | null;
  eventProgress: number;
  eventCompleted: boolean;
  eventRewardClaimed: boolean;
}

export interface NmNightmareRealmState {
  rngSeed: number;
  level: number;
  experience: number;
  coins: number;
  title: string;
  currentZone: string;
  combat: NmCombatState;
  dreamWeaving: NmDreamWeavingState;
  patrol: NmPatrolState;
  eventState: NmEventState;
  defeatedCreatures: string[];
  encounteredCreatures: string[];
  souls: Record<string, number>;
  weaponsOwned: string[];
  equippedWeapon: string | null;
  powersUnlocked: string[];
  powerLevels: Record<string, number>;
  shadowManipulationLevel: number;
  shadowXp: number;
  dreamWeavingLevel: number;
  dreamXp: number;
  nightmareBanished: number;
  dailyPatrolsCompleted: number;
  eventsParticipated: number[];
  achievements: string[];
  totalSoulsCollected: number;
  totalCreaturesDefeated: number;
  totalCoinsEarned: number;
  totalFearEndured: number;
  totalDreamsWoven: number;
  totalNightmaresBanished: number;
  totalShadowManipulated: number;
  explorationLog: string[];
}

// ============================================================
// Creature Data (37 creatures)
// ============================================================

const NM_CREATURE_DATA: Record<string, NmCreatureData> = {
  [NM_CREATURE_GLOOM_WISP]: {
    name: 'Gloom Wisp', rarity: NM_RARITY_SHADOW_WISP, zone: NM_ZONE_WHISPERING_CORRIDOR,
    baseHp: 20, fearDamage: 5,
    description: 'A flickering orb of despair that drifts through darkened hallways.',
    xpReward: 15, coinReward: 5, soulDrop: 'wisp_essence', weaponDrop: NM_WEAPON_GLOOM_DAGGER,
  },
  [NM_CREATURE_WHISPER_SHADE]: {
    name: 'Whisper Shade', rarity: NM_RARITY_SHADOW_WISP, zone: NM_ZONE_WHISPERING_CORRIDOR,
    baseHp: 25, fearDamage: 6,
    description: 'A translucent figure that murmurs your deepest insecurities endlessly.',
    xpReward: 18, coinReward: 7, soulDrop: 'shade_fragment', weaponDrop: NM_WEAPON_WHISPER_BLADE,
  },
  [NM_CREATURE_VEIL_DRIFTER]: {
    name: 'Veil Drifter', rarity: NM_RARITY_SHADOW_WISP, zone: NM_ZONE_WHISPERING_CORRIDOR,
    baseHp: 22, fearDamage: 4,
    description: 'Slips between the fabric of reality, a shimmer in the corner of your eye.',
    xpReward: 16, coinReward: 6, soulDrop: 'veil_scrap', weaponDrop: NM_WEAPON_VEIL_CUTTER,
  },
  [NM_CREATURE_ASH_PHANTOM]: {
    name: 'Ash Phantom', rarity: NM_RARITY_SHADOW_WISP, zone: NM_ZONE_HALL_OF_MIRRORS,
    baseHp: 28, fearDamage: 7,
    description: 'Formed from the cinders of burned memories, rises with trailing gray smoke.',
    xpReward: 20, coinReward: 8, soulDrop: 'ash_remnant', weaponDrop: NM_WEAPON_ASH_STAFF,
  },
  [NM_CREATURE_MIST_WRAITH]: {
    name: 'Mist Wraith', rarity: NM_RARITY_SHADOW_WISP, zone: NM_ZONE_WHISPERING_CORRIDOR,
    baseHp: 18, fearDamage: 5,
    description: 'A sinuous tendril of living fog that suffocates hope wherever it passes.',
    xpReward: 14, coinReward: 5, soulDrop: 'mist_droplet', weaponDrop: null,
  },
  [NM_CREATURE_HOLLOW_ECHO]: {
    name: 'Hollow Echo', rarity: NM_RARITY_SHADOW_WISP, zone: NM_ZONE_HALL_OF_MIRRORS,
    baseHp: 24, fearDamage: 6,
    description: 'Repeats the last words of those who perished, distorting them into curses.',
    xpReward: 17, coinReward: 6, soulDrop: 'echo_shell', weaponDrop: null,
  },
  [NM_CREATURE_TWILIGHT_WISP]: {
    name: 'Twilight Wisp', rarity: NM_RARITY_SHADOW_WISP, zone: NM_ZONE_WHISPERING_CORRIDOR,
    baseHp: 21, fearDamage: 5,
    description: 'A delicate spark trapped between dusk and dawn, pulsing with twilight energy.',
    xpReward: 16, coinReward: 7, soulDrop: 'twilight_spark', weaponDrop: null,
  },
  [NM_CREATURE_VOID_MOTE]: {
    name: 'Void Mote', rarity: NM_RARITY_SHADOW_WISP, zone: NM_ZONE_ABYSS_BRIDGE,
    baseHp: 30, fearDamage: 8,
    description: 'A pinprick of absolute nothingness that erases everything it touches.',
    xpReward: 22, coinReward: 9, soulDrop: 'void_grain', weaponDrop: NM_WEAPON_SHADOW_SHORTSWORD,
  },
  [NM_CREATURE_MIND_DEVOURER]: {
    name: 'Mind Devourer', rarity: NM_RARITY_DREAM_EATER, zone: NM_ZONE_HALL_OF_MIRRORS,
    baseHp: 50, fearDamage: 12,
    description: 'A gaping maw of psychic energy that consumes thoughts, leaving only emptiness.',
    xpReward: 40, coinReward: 15, soulDrop: 'mind_shard', weaponDrop: NM_WEAPON_DREAM_SHEARS,
  },
  [NM_CREATURE_SLUMBER_LEECH]: {
    name: 'Slumber Leech', rarity: NM_RARITY_DREAM_EATER, zone: NM_ZONE_HALL_OF_MIRRORS,
    baseHp: 45, fearDamage: 10,
    description: 'Attaches to sleeping minds and drains the will to wake, causing endless torpor.',
    xpReward: 35, coinReward: 12, soulDrop: 'slumber_extract', weaponDrop: null,
  },
  [NM_CREATURE_NIGHTMARE_TICK]: {
    name: 'Nightmare Tick', rarity: NM_RARITY_DREAM_EATER, zone: NM_ZONE_ABYSS_BRIDGE,
    baseHp: 40, fearDamage: 14,
    description: 'Burrows into dreams and injects paralyzing terror that amplifies every fear.',
    xpReward: 38, coinReward: 14, soulDrop: 'terror_venom', weaponDrop: null,
  },
  [NM_CREATURE_DREAM_PARASITE]: {
    name: 'Dream Parasite', rarity: NM_RARITY_DREAM_EATER, zone: NM_ZONE_SOUL_GARDEN,
    baseHp: 55, fearDamage: 11,
    description: 'Weaves into neural tapestry of dreams, replacing happy memories with dread.',
    xpReward: 42, coinReward: 16, soulDrop: 'parasite_thread', weaponDrop: NM_WEAPON_HOLLOW_BOW,
  },
  [NM_CREATURE_MEMORY_EATER]: {
    name: 'Memory Eater', rarity: NM_RARITY_DREAM_EATER, zone: NM_ZONE_DREAM_LIBRARY,
    baseHp: 48, fearDamage: 13,
    description: 'Devours cherished memories one by one, leaving a hollow void where love lived.',
    xpReward: 44, coinReward: 18, soulDrop: 'memory_echo', weaponDrop: NM_WEAPON_TWILIGHT_SPEAR,
  },
  [NM_CREATURE_HOPE_DRINKER]: {
    name: 'Hope Drinker', rarity: NM_RARITY_DREAM_EATER, zone: NM_ZONE_SOUL_GARDEN,
    baseHp: 52, fearDamage: 15,
    description: 'A slender shadow that sips optimism from the soul, leaving cynical despair.',
    xpReward: 46, coinReward: 17, soulDrop: 'hope_dregs', weaponDrop: null,
  },
  [NM_CREATURE_VISION_THIEF]: {
    name: 'Vision Thief', rarity: NM_RARITY_DREAM_EATER, zone: NM_ZONE_DREAM_LIBRARY,
    baseHp: 46, fearDamage: 12,
    description: 'Steals the ability to see the future, trapping victims in eternal dread.',
    xpReward: 40, coinReward: 15, soulDrop: 'stolen_glimpse', weaponDrop: NM_WEAPON_VOID_EDGE,
  },
  [NM_CREATURE_THOUGHT_REAPER]: {
    name: 'Thought Reaper', rarity: NM_RARITY_DREAM_EATER, zone: NM_ZONE_ABYSS_BRIDGE,
    baseHp: 58, fearDamage: 16,
    description: 'Swings a scythe of pure cognition, severing thoughts mid-stream before they form.',
    xpReward: 50, coinReward: 20, soulDrop: 'reaped_thought', weaponDrop: NM_WEAPON_NIGHTMARE_SCYTHE,
  },
  [NM_CREATURE_TERROR_HOUND]: {
    name: 'Terror Hound', rarity: NM_RARITY_FEAR_HOUND, zone: NM_ZONE_FEAR_ARENA,
    baseHp: 90, fearDamage: 22,
    description: 'A massive canine beast with eyes like dying embers that hunts by scent of fear.',
    xpReward: 80, coinReward: 35, soulDrop: 'terror_fang', weaponDrop: NM_WEAPON_TERROR_AXE,
  },
  [NM_CREATURE_DREAD_WOLF]: {
    name: 'Dread Wolf', rarity: NM_RARITY_FEAR_HOUND, zone: NM_ZONE_FEAR_ARENA,
    baseHp: 85, fearDamage: 20,
    description: 'A spectral wolf pack leader whose howl induces paralyzing dread in all who hear.',
    xpReward: 75, coinReward: 30, soulDrop: 'dread_howl', weaponDrop: NM_WEAPON_SHADOW_MASTIFF_FANG,
  },
  [NM_CREATURE_PANIC_STALKER]: {
    name: 'Panic Stalker', rarity: NM_RARITY_FEAR_HOUND, zone: NM_ZONE_TWILIGHT_VOID,
    baseHp: 95, fearDamage: 25,
    description: 'A four-legged terror that moves between shadows, always in peripheral vision.',
    xpReward: 85, coinReward: 38, soulDrop: 'panic_claw', weaponDrop: null,
  },
  [NM_CREATURE_PHOBIA_BEAST]: {
    name: 'Phobia Beast', rarity: NM_RARITY_FEAR_HOUND, zone: NM_ZONE_FEAR_ARENA,
    baseHp: 100, fearDamage: 28,
    description: 'Shapeshifts into whatever the viewer fears most, feeding on the resulting panic.',
    xpReward: 90, coinReward: 40, soulDrop: 'phobia_core', weaponDrop: NM_WEAPON_PHOBIA_WHIP,
  },
  [NM_CREATURE_SHADOW_MASTIFF]: {
    name: 'Shadow Mastiff', rarity: NM_RARITY_FEAR_HOUND, zone: NM_ZONE_TWILIGHT_VOID,
    baseHp: 88, fearDamage: 24,
    description: 'A hound forged from solid shadow that obeys only the Nightmare Lords.',
    xpReward: 82, coinReward: 36, soulDrop: 'shadow_pelt', weaponDrop: null,
  },
  [NM_CREATURE_HORROR_HOUND]: {
    name: 'Horror Hound', rarity: NM_RARITY_FEAR_HOUND, zone: NM_ZONE_FEAR_ARENA,
    baseHp: 92, fearDamage: 26,
    description: 'Its presence warps reality, turning ordinary objects into instruments of horror.',
    xpReward: 88, coinReward: 37, soulDrop: 'horror_bile', weaponDrop: NM_WEAPON_DREAD_GREATSWORD,
  },
  [NM_CREATURE_DREADHOUND_ALPHA]: {
    name: 'Dreadhound Alpha', rarity: NM_RARITY_FEAR_HOUND, zone: NM_ZONE_TWILIGHT_VOID,
    baseHp: 110, fearDamage: 30,
    description: 'The alpha of all fear hounds, commanding a spectral pack across the twilight.',
    xpReward: 100, coinReward: 45, soulDrop: 'alpha_essence', weaponDrop: NM_WEAPON_SPECTRAL_BOW,
  },
  [NM_CREATURE_CREEPING_DREAD]: {
    name: 'Creeping Dread', rarity: NM_RARITY_FEAR_HOUND, zone: NM_ZONE_SOUL_GARDEN,
    baseHp: 80, fearDamage: 18,
    description: 'An amorphous entity that fills rooms with an oppressive sense of impending doom.',
    xpReward: 70, coinReward: 32, soulDrop: 'dread_slime', weaponDrop: null,
  },
  [NM_CREATURE_SPECTRAL_CHAMPION]: {
    name: 'Spectral Champion', rarity: NM_RARITY_PHANTOM_KNIGHT, zone: NM_ZONE_DREAM_LIBRARY,
    baseHp: 180, fearDamage: 35,
    description: 'An ethereal warrior encased in phantom armor, reliving its final battle.',
    xpReward: 180, coinReward: 80, soulDrop: 'champion_shard', weaponDrop: NM_WEAPON_WRAITH_BLADE,
  },
  [NM_CREATURE_WRAITH_KNIGHT]: {
    name: 'Wraith Knight', rarity: NM_RARITY_PHANTOM_KNIGHT, zone: NM_ZONE_TWILIGHT_VOID,
    baseHp: 200, fearDamage: 40,
    description: 'A skeletal knight mounted on a nightmare steed, wielding a blade of anguish.',
    xpReward: 200, coinReward: 90, soulDrop: 'wraith_bone', weaponDrop: NM_WEAPON_DOOM_HAMMER,
  },
  [NM_CREATURE_DOOM_CAVALIER]: {
    name: 'Doom Cavalier', rarity: NM_RARITY_PHANTOM_KNIGHT, zone: NM_ZONE_TWILIGHT_VOID,
    baseHp: 210, fearDamage: 42,
    description: 'Rides through dreams at midnight, heralding catastrophe with each hoofbeat.',
    xpReward: 210, coinReward: 95, soulDrop: 'doom_helmet', weaponDrop: NM_WEAPON_SOUL_REAVER_SWORD,
  },
  [NM_CREATURE_SOUL_REAVER]: {
    name: 'Soul Reaver', rarity: NM_RARITY_PHANTOM_KNIGHT, zone: NM_ZONE_HEART_OF_DARKNESS,
    baseHp: 220, fearDamage: 45,
    description: 'Harvests souls with precision, storing them in a lantern of crystallized despair.',
    xpReward: 230, coinReward: 100, soulDrop: 'reaver_lantern', weaponDrop: NM_WEAPON_NIGHTMARE_TEMPLAR_SHIELD,
  },
  [NM_CREATURE_NIGHTMARE_TEMPLAR]: {
    name: 'Nightmare Templar', rarity: NM_RARITY_PHANTOM_KNIGHT, zone: NM_ZONE_HEART_OF_DARKNESS,
    baseHp: 240, fearDamage: 48,
    description: 'A holy knight corrupted by the nightmare realm, wielding dark faith as a weapon.',
    xpReward: 250, coinReward: 110, soulDrop: 'corrupted_holy_water', weaponDrop: NM_WEAPON_VOID_SENTINEL_HALBERD,
  },
  [NM_CREATURE_VOID_SENTINEL]: {
    name: 'Void Sentinel', rarity: NM_RARITY_PHANTOM_KNIGHT, zone: NM_ZONE_HEART_OF_DARKNESS,
    baseHp: 250, fearDamage: 50,
    description: 'Guards the boundary between reality and the void, attacking all who approach.',
    xpReward: 260, coinReward: 115, soulDrop: 'sentinel_core', weaponDrop: NM_WEAPON_PHANTOM_GUARDIAN_AEGIS,
  },
  [NM_CREATURE_PHANTOM_GUARDIAN]: {
    name: 'Phantom Guardian', rarity: NM_RARITY_PHANTOM_KNIGHT, zone: NM_ZONE_DREAM_LIBRARY,
    baseHp: 190, fearDamage: 38,
    description: 'An ancient protector turned tormentor, guarding forbidden knowledge with ghostly steel.',
    xpReward: 190, coinReward: 85, soulDrop: 'guardian_crest', weaponDrop: null,
  },
  [NM_CREATURE_DREAM_SOVEREIGN]: {
    name: 'The Dream Sovereign', rarity: NM_RARITY_NIGHTMARE_LORD, zone: NM_ZONE_HEART_OF_DARKNESS,
    baseHp: 500, fearDamage: 70,
    description: 'The self-proclaimed ruler of all dreams who reshapes reality to twisted visions.',
    xpReward: 600, coinReward: 300, soulDrop: 'sovereign_crown', weaponDrop: NM_WEAPON_DREAM_SOVEREIGN_SCEPTER,
  },
  [NM_CREATURE_LORD_ENDLESS_NIGHT]: {
    name: 'Lord of Endless Night', rarity: NM_RARITY_NIGHTMARE_LORD, zone: NM_ZONE_HEART_OF_DARKNESS,
    baseHp: 550, fearDamage: 75,
    description: 'An entity of pure darkness that seeks to extinguish every light in the dreamscape.',
    xpReward: 650, coinReward: 320, soulDrop: 'endless_night_shard', weaponDrop: NM_WEAPON_ABYSSAL_CLEAVER,
  },
  [NM_CREATURE_ABYSSAL_HORROR]: {
    name: 'The Abyssal Horror', rarity: NM_RARITY_NIGHTMARE_LORD, zone: NM_ZONE_HEART_OF_DARKNESS,
    baseHp: 600, fearDamage: 80,
    description: 'An indescribable entity from the deepest abyss whose presence shatters sanity.',
    xpReward: 700, coinReward: 350, soulDrop: 'abyssal_eye', weaponDrop: NM_WEAPON_ETERNAL_DARKNESS_ORB,
  },
  [NM_CREATURE_ZARAK_DEVOURER]: {
    name: 'Zarak, Devourer of Worlds', rarity: NM_RARITY_NIGHTMARE_LORD, zone: NM_ZONE_HEART_OF_DARKNESS,
    baseHp: 700, fearDamage: 90,
    description: 'An ancient being that has consumed countless dream worlds, now hungering for reality.',
    xpReward: 800, coinReward: 400, soulDrop: 'zarak_fang', weaponDrop: NM_WEAPON_SHADOW_PHOENIX_TALON,
  },
  [NM_CREATURE_NIGHTMARE_OVERLORD]: {
    name: 'Nightmare Overlord', rarity: NM_RARITY_NIGHTMARE_LORD, zone: NM_ZONE_HEART_OF_DARKNESS,
    baseHp: 800, fearDamage: 100,
    description: 'The supreme ruler of the nightmare realm who commands all shadow creatures absolutely.',
    xpReward: 1000, coinReward: 500, soulDrop: 'overlord_heart', weaponDrop: NM_WEAPON_NIGHTMARE_OVERLORD_BLADE,
  },
  [NM_CREATURE_SHADOW_PHOENIX]: {
    name: 'Shadow Phoenix', rarity: NM_RARITY_NIGHTMARE_LORD, zone: NM_ZONE_TWILIGHT_VOID,
    baseHp: 450, fearDamage: 65,
    description: 'A majestic bird of living shadow that rises from ashes of defeated nightmares.',
    xpReward: 550, coinReward: 280, soulDrop: 'phoenix_shadow_feather', weaponDrop: null,
  },
};

// ============================================================
// Zone Data (8 zones)
// ============================================================

const NM_ZONE_DATA: Record<string, NmZoneData> = {
  [NM_ZONE_WHISPERING_CORRIDOR]: {
    name: 'Whispering Corridor',
    description: 'A seemingly infinite hallway where shadows murmur secrets and walls bleed darkness. New dream walkers begin here.',
    levelReq: 1,
    creaturePool: [NM_CREATURE_GLOOM_WISP, NM_CREATURE_WHISPER_SHADE, NM_CREATURE_VEIL_DRIFTER, NM_CREATURE_MIST_WRAITH, NM_CREATURE_TWILIGHT_WISP],
    dangerLevel: 1, ambientColor: NM_COLOR_SHADOW_PURPLE, bossCreature: NM_CREATURE_MIND_DEVOURER,
  },
  [NM_ZONE_HALL_OF_MIRRORS]: {
    name: 'Hall of Mirrors',
    description: 'A vast chamber of twisted mirrors reflecting terrifying alternate versions of yourself that sometimes step out.',
    levelReq: 6,
    creaturePool: [NM_CREATURE_ASH_PHANTOM, NM_CREATURE_HOLLOW_ECHO, NM_CREATURE_MIND_DEVOURER, NM_CREATURE_SLUMBER_LEECH, NM_CREATURE_NIGHTMARE_TICK],
    dangerLevel: 2, ambientColor: NM_COLOR_GHOST_WHITE, bossCreature: NM_CREATURE_THOUGHT_REAPER,
  },
  [NM_ZONE_ABYSS_BRIDGE]: {
    name: 'Abyss Bridge',
    description: 'A crumbling stone bridge spanning a bottomless chasm of swirling nightmares. The void below hungers for any who falter.',
    levelReq: 13,
    creaturePool: [NM_CREATURE_VOID_MOTE, NM_CREATURE_NIGHTMARE_TICK, NM_CREATURE_THOUGHT_REAPER, NM_CREATURE_CREEPING_DREAD],
    dangerLevel: 3, ambientColor: NM_COLOR_VOID_BLACK, bossCreature: NM_CREATURE_DREAD_WOLF,
  },
  [NM_ZONE_SOUL_GARDEN]: {
    name: 'Soul Garden',
    description: 'A perverse garden where flowers bloom from trapped souls and trees bear fruit of crystallized fear.',
    levelReq: 21,
    creaturePool: [NM_CREATURE_DREAM_PARASITE, NM_CREATURE_HOPE_DRINKER, NM_CREATURE_CREEPING_DREAD],
    dangerLevel: 4, ambientColor: NM_COLOR_NIGHTMARE_GREEN, bossCreature: NM_CREATURE_SPECTRAL_CHAMPION,
  },
  [NM_ZONE_DREAM_LIBRARY]: {
    name: 'Dream Library',
    description: 'An infinite library containing the recorded dreams of every sleeping soul. Knowledge here has a terrible price.',
    levelReq: 29,
    creaturePool: [NM_CREATURE_MEMORY_EATER, NM_CREATURE_VISION_THIEF, NM_CREATURE_SPECTRAL_CHAMPION, NM_CREATURE_PHANTOM_GUARDIAN],
    dangerLevel: 5, ambientColor: NM_COLOR_MOON_SILVER, bossCreature: NM_CREATURE_WRAITH_KNIGHT,
  },
  [NM_ZONE_FEAR_ARENA]: {
    name: 'Fear Arena',
    description: 'A colossal arena where nightmare creatures battle for dominance. Face waves of fear hounds to prove your worth.',
    levelReq: 37,
    creaturePool: [NM_CREATURE_TERROR_HOUND, NM_CREATURE_DREAD_WOLF, NM_CREATURE_PHOBIA_BEAST, NM_CREATURE_HORROR_HOUND, NM_CREATURE_SHADOW_MASTIFF],
    dangerLevel: 6, ambientColor: NM_COLOR_BLOOD_RED, bossCreature: NM_CREATURE_DREADHOUND_ALPHA,
  },
  [NM_ZONE_TWILIGHT_VOID]: {
    name: 'Twilight Void',
    description: 'The liminal space between dreams and nightmares where reality is unstable. Phantom knights patrol shifting borders.',
    levelReq: 43,
    creaturePool: [NM_CREATURE_PANIC_STALKER, NM_CREATURE_SHADOW_MASTIFF, NM_CREATURE_DREADHOUND_ALPHA, NM_CREATURE_WRAITH_KNIGHT, NM_CREATURE_DOOM_CAVALIER, NM_CREATURE_SHADOW_PHOENIX],
    dangerLevel: 7, ambientColor: NM_COLOR_SHADOW_PURPLE, bossCreature: NM_CREATURE_SOUL_REAVER,
  },
  [NM_ZONE_HEART_OF_DARKNESS]: {
    name: 'Heart of Darkness',
    description: 'The innermost sanctum of the nightmare realm where Nightmare Lords hold court. Few dare enter; fewer return.',
    levelReq: 48,
    creaturePool: [NM_CREATURE_SOUL_REAVER, NM_CREATURE_NIGHTMARE_TEMPLAR, NM_CREATURE_VOID_SENTINEL, NM_CREATURE_DREAM_SOVEREIGN, NM_CREATURE_LORD_ENDLESS_NIGHT, NM_CREATURE_ABYSSAL_HORROR, NM_CREATURE_ZARAK_DEVOURER, NM_CREATURE_NIGHTMARE_OVERLORD],
    dangerLevel: 8, ambientColor: NM_COLOR_VOID_BLACK, bossCreature: NM_CREATURE_NIGHTMARE_OVERLORD,
  },
};

// ============================================================
// Weapon Data (28 shadow weapons)
// ============================================================

const NM_WEAPON_DATA: Record<string, NmWeaponData> = {
  [NM_WEAPON_GLOOM_DAGGER]: { name: 'Gloom Dagger', rarity: NM_RARITY_SHADOW_WISP, baseDamage: 8, fearBonus: 0, description: 'A crude blade forged from solidified gloom.', cost: 25, levelReq: 1 },
  [NM_WEAPON_WHISPER_BLADE]: { name: 'Whisper Blade', rarity: NM_RARITY_SHADOW_WISP, baseDamage: 10, fearBonus: 1, description: 'Each strike emits a whisper that weakens resolve.', cost: 35, levelReq: 1 },
  [NM_WEAPON_SHADOW_SHORTSWORD]: { name: 'Shadow Shortsword', rarity: NM_RARITY_SHADOW_WISP, baseDamage: 12, fearBonus: 1, description: 'A reliable blade that cuts through shadow flesh.', cost: 50, levelReq: 2 },
  [NM_WEAPON_VEIL_CUTTER]: { name: 'Veil Cutter', rarity: NM_RARITY_SHADOW_WISP, baseDamage: 7, fearBonus: 2, description: 'Slices the barrier between dream and nightmare.', cost: 30, levelReq: 1 },
  [NM_WEAPON_ASH_STAFF]: { name: 'Ash Staff', rarity: NM_RARITY_SHADOW_WISP, baseDamage: 6, fearBonus: 3, description: 'Channels residual power of burned memories.', cost: 40, levelReq: 2 },
  [NM_WEAPON_MIST_FLAIL]: { name: 'Mist Flail', rarity: NM_RARITY_SHADOW_WISP, baseDamage: 9, fearBonus: 1, description: 'A flail wreathed in living mist that obscures vision.', cost: 45, levelReq: 2 },
  [NM_WEAPON_HOLLOW_BOW]: { name: 'Hollow Bow', rarity: NM_RARITY_DREAM_EATER, baseDamage: 18, fearBonus: 2, description: 'Fires arrows of compressed despair across distances.', cost: 120, levelReq: 6 },
  [NM_WEAPON_TWILIGHT_SPEAR]: { name: 'Twilight Spear', rarity: NM_RARITY_DREAM_EATER, baseDamage: 22, fearBonus: 3, description: 'A spear that pierces body and dream simultaneously.', cost: 150, levelReq: 8 },
  [NM_WEAPON_VOID_EDGE]: { name: 'Void Edge', rarity: NM_RARITY_DREAM_EATER, baseDamage: 20, fearBonus: 5, description: 'A sword whose edge borders on absolute nothingness.', cost: 180, levelReq: 10 },
  [NM_WEAPON_SOUL_HARPOON]: { name: 'Soul Harpoon', rarity: NM_RARITY_DREAM_EATER, baseDamage: 16, fearBonus: 6, description: 'Barbed hook designed to drag souls from nightmare creatures.', cost: 140, levelReq: 7 },
  [NM_WEAPON_DREAM_SHEARS]: { name: 'Dream Shears', rarity: NM_RARITY_DREAM_EATER, baseDamage: 15, fearBonus: 8, description: 'Severs the threads binding creatures to the nightmare.', cost: 160, levelReq: 9 },
  [NM_WEAPON_NIGHTMARE_SCYTHE]: { name: 'Nightmare Scythe', rarity: NM_RARITY_DREAM_EATER, baseDamage: 25, fearBonus: 4, description: 'Reaps nightmares like wheat, leaving peaceful dreams behind.', cost: 200, levelReq: 11 },
  [NM_WEAPON_DREAD_GREATSWORD]: { name: 'Dread Greatsword', rarity: NM_RARITY_FEAR_HOUND, baseDamage: 40, fearBonus: 5, description: 'A massive blade that radiates palpable dread to all nearby.', cost: 500, levelReq: 18 },
  [NM_WEAPON_TERROR_AXE]: { name: 'Terror Axe', rarity: NM_RARITY_FEAR_HOUND, baseDamage: 38, fearBonus: 8, description: 'Each swing triggers a localized wave of terror.', cost: 480, levelReq: 17 },
  [NM_WEAPON_PHOBIA_WHIP]: { name: 'Phobia Whip', rarity: NM_RARITY_FEAR_HOUND, baseDamage: 30, fearBonus: 15, description: 'Lashes inject the victim\'s deepest phobia directly into mind.', cost: 520, levelReq: 19 },
  [NM_WEAPON_SHADOW_MASTIFF_FANG]: { name: 'Shadow Mastiff Fang', rarity: NM_RARITY_FEAR_HOUND, baseDamage: 35, fearBonus: 10, description: 'Torn from the jaw of an alpha shadow mastiff, it still hungers.', cost: 550, levelReq: 20 },
  [NM_WEAPON_SPECTRAL_BOW]: { name: 'Spectral Bow', rarity: NM_RARITY_FEAR_HOUND, baseDamage: 42, fearBonus: 6, description: 'Arrows become spectral wolves that chase their target relentlessly.', cost: 600, levelReq: 22 },
  [NM_WEAPON_WRAITH_BLADE]: { name: 'Wraith Blade', rarity: NM_RARITY_FEAR_HOUND, baseDamage: 45, fearBonus: 7, description: 'A blade that passes through armor to strike the spirit directly.', cost: 650, levelReq: 24 },
  [NM_WEAPON_DOOM_HAMMER]: { name: 'Doom Hammer', rarity: NM_RARITY_PHANTOM_KNIGHT, baseDamage: 70, fearBonus: 10, description: 'Each impact sends shockwaves of doom through the dreamscape.', cost: 1500, levelReq: 30 },
  [NM_WEAPON_SOUL_REAVER_SWORD]: { name: 'Soul Reaver Sword', rarity: NM_RARITY_PHANTOM_KNIGHT, baseDamage: 75, fearBonus: 12, description: 'Steals a fragment of the creature\'s soul with every strike.', cost: 1800, levelReq: 33 },
  [NM_WEAPON_NIGHTMARE_TEMPLAR_SHIELD]: { name: 'Nightmare Templar Shield', rarity: NM_RARITY_PHANTOM_KNIGHT, baseDamage: 20, fearBonus: 25, description: 'Absorbs fear and reflects it back as devastating energy.', cost: 1600, levelReq: 32 },
  [NM_WEAPON_VOID_SENTINEL_HALBERD]: { name: 'Void Sentinel Halberd', rarity: NM_RARITY_PHANTOM_KNIGHT, baseDamage: 80, fearBonus: 8, description: 'Exists partially in the void, making it unblockable.', cost: 2000, levelReq: 36 },
  [NM_WEAPON_PHANTOM_GUARDIAN_AEGIS]: { name: 'Phantom Guardian Aegis', rarity: NM_RARITY_PHANTOM_KNIGHT, baseDamage: 15, fearBonus: 30, description: 'Projects a phantom guardian to fight alongside you.', cost: 2200, levelReq: 38 },
  [NM_WEAPON_DREAM_SOVEREIGN_SCEPTER]: { name: 'Dream Sovereign Scepter', rarity: NM_RARITY_NIGHTMARE_LORD, baseDamage: 100, fearBonus: 15, description: 'Commands the fabric of dreams, reshaping reality to your will.', cost: 5000, levelReq: 43 },
  [NM_WEAPON_ABYSSAL_CLEAVER]: { name: 'Abyssal Cleaver', rarity: NM_RARITY_NIGHTMARE_LORD, baseDamage: 120, fearBonus: 20, description: 'Cleaves through dimensions, creating rifts in the nightmare fabric.', cost: 6000, levelReq: 45 },
  [NM_WEAPON_ETERNAL_DARKNESS_ORB]: { name: 'Eternal Darkness Orb', rarity: NM_RARITY_NIGHTMARE_LORD, baseDamage: 50, fearBonus: 50, description: 'Channels the absolute darkness of the void, crushing all hope.', cost: 7000, levelReq: 47 },
  [NM_WEAPON_SHADOW_PHOENIX_TALON]: { name: 'Shadow Phoenix Talon', rarity: NM_RARITY_NIGHTMARE_LORD, baseDamage: 110, fearBonus: 25, description: 'Grants the power of rebirth — revive once per battle from defeat.', cost: 8000, levelReq: 49 },
  [NM_WEAPON_NIGHTMARE_OVERLORD_BLADE]: { name: 'Nightmare Overlord Blade', rarity: NM_RARITY_NIGHTMARE_LORD, baseDamage: 150, fearBonus: 30, description: 'The ultimate weapon of the nightmare realm, wielded by the Overlord.', cost: 10000, levelReq: 50 },
};

// ============================================================
// Dream Power Data (22 powers)
// ============================================================

const NM_POWER_DATA: Record<string, NmDreamPowerData> = {
  [NM_POWER_SHADOW_STEP]: { name: 'Shadow Step', description: 'Teleport behind a creature, dealing double damage on the next attack.', powerType: 'offense', basePower: 15, cooldown: 2, unlockLevel: 1, cost: 0 },
  [NM_POWER_FEAR_WARD]: { name: 'Fear Ward', description: 'Create a protective ward reducing incoming fear damage by 30% for 3 turns.', powerType: 'defense', basePower: 30, cooldown: 4, unlockLevel: 1, cost: 0 },
  [NM_POWER_SOUL_SIGHT]: { name: 'Soul Sight', description: 'Reveal a creature\'s weaknesses, increasing damage by 20% for the battle.', powerType: 'utility', basePower: 20, cooldown: 5, unlockLevel: 2, cost: 50 },
  [NM_POWER_DREAM_SHIELD]: { name: 'Dream Shield', description: 'Conjure a shield from dream energy that absorbs the next fear attack.', powerType: 'defense', basePower: 40, cooldown: 3, unlockLevel: 3, cost: 80 },
  [NM_POWER_NIGHTMARE_PULSE]: { name: 'Nightmare Pulse', description: 'Release a wave of nightmare energy that damages all nearby creatures.', powerType: 'offense', basePower: 25, cooldown: 3, unlockLevel: 4, cost: 100 },
  [NM_POWER_SHADOW_BIND]: { name: 'Shadow Bind', description: 'Bind a creature in chains of shadow, preventing its next attack.', powerType: 'control', basePower: 35, cooldown: 4, unlockLevel: 5, cost: 130 },
  [NM_POWER_FEAR_STRIKE]: { name: 'Fear Strike', description: 'Channel your own fear into a devastating blow dealing bonus damage.', powerType: 'offense', basePower: 30, cooldown: 2, unlockLevel: 7, cost: 160 },
  [NM_POWER_LUCID_AWAKENING]: { name: 'Lucid Awakening', description: 'Enter a lucid state, reducing all cooldowns by 1 and boosting damage for 2 turns.', powerType: 'utility', basePower: 20, cooldown: 6, unlockLevel: 9, cost: 200 },
  [NM_POWER_DREAM_WEAVE]: { name: 'Dream Weave', description: 'Manipulate the dream fabric to heal courage and reduce fear.', powerType: 'healing', basePower: 25, cooldown: 4, unlockLevel: 10, cost: 240 },
  [NM_POWER_SHADOW_CLOAK]: { name: 'Shadow Cloak', description: 'Wrap yourself in shadow, becoming invisible to creatures for 2 turns.', powerType: 'defense', basePower: 50, cooldown: 5, unlockLevel: 12, cost: 300 },
  [NM_POWER_SOUL_DRAIN]: { name: 'Soul Drain', description: 'Drain soul energy from a creature, healing yourself and dealing damage.', powerType: 'offense', basePower: 35, cooldown: 3, unlockLevel: 14, cost: 350 },
  [NM_POWER_TERROR_ROAR]: { name: 'Terror Roar', description: 'Unleash a terrifying roar that stuns the creature for 1 turn and reduces attack.', powerType: 'control', basePower: 45, cooldown: 5, unlockLevel: 16, cost: 420 },
  [NM_POWER_VOID_WALK]: { name: 'Void Walk', description: 'Step partially into the void, becoming immune to fear for 2 turns.', powerType: 'defense', basePower: 60, cooldown: 6, unlockLevel: 18, cost: 500 },
  [NM_POWER_MIND_BARRIER]: { name: 'Mind Barrier', description: 'Fortify your mind against psychic attacks, halving fear damage for 3 turns.', powerType: 'defense', basePower: 40, cooldown: 5, unlockLevel: 20, cost: 580 },
  [NM_POWER_NIGHTMARE_FLASH]: { name: 'Nightmare Flash', description: 'Flash a burst of nightmare imagery, dealing massive damage and blinding.', powerType: 'offense', basePower: 55, cooldown: 4, unlockLevel: 22, cost: 660 },
  [NM_POWER_SHADOW_CLONE]: { name: 'Shadow Clone', description: 'Create a shadow duplicate that fights alongside you for 3 turns.', powerType: 'utility', basePower: 40, cooldown: 6, unlockLevel: 25, cost: 750 },
  [NM_POWER_SOUL_HARVEST]: { name: 'Soul Harvest', description: 'Harvest all loose soul fragments in the area, gaining bonus coins and XP.', powerType: 'utility', basePower: 50, cooldown: 8, unlockLevel: 28, cost: 850 },
  [NM_POWER_FEAR_IMMUNITY]: { name: 'Fear Immunity', description: 'Become completely immune to fear for 1 turn. The ultimate defense.', powerType: 'defense', basePower: 100, cooldown: 8, unlockLevel: 32, cost: 1000 },
  [NM_POWER_DREAM_MANIPULATION]: { name: 'Dream Manipulation', description: 'Rewrite the dream to your advantage, weakening the creature significantly.', powerType: 'control', basePower: 60, cooldown: 7, unlockLevel: 36, cost: 1200 },
  [NM_POWER_SHADOW_STORM]: { name: 'Shadow Storm', description: 'Summon a storm of shadow blades that shred everything in range.', powerType: 'offense', basePower: 80, cooldown: 6, unlockLevel: 40, cost: 1500 },
  [NM_POWER_SOUL_PURIFY]: { name: 'Soul Purify', description: 'Purify collected souls, converting them into a massive permanent stat boost.', powerType: 'utility', basePower: 70, cooldown: 10, unlockLevel: 44, cost: 2000 },
  [NM_POWER_NIGHTMARE_BANISH]: { name: 'Nightmare Banish', description: 'Attempt to permanently banish a nightmare creature from the realm.', powerType: 'special', basePower: 90, cooldown: 10, unlockLevel: 48, cost: 2500 },
};

// ============================================================
// Achievement Data (17 achievements)
// ============================================================

const NM_ACHIEVEMENT_DATA: Record<string, NmAchievementData> = {
  [NM_ACHIEVEMENT_FIRST_NIGHTMARE]: { name: 'First Nightmare', description: 'Defeat your first nightmare creature.', checkFn: 'totalCreaturesDefeated >= 1' },
  [NM_ACHIEVEMENT_SOUL_COLLECTOR]: { name: 'Soul Collector', description: 'Collect 100 soul fragments in total.', checkFn: 'totalSoulsCollected >= 100' },
  [NM_ACHIEVEMENT_FEARLESS]: { name: 'Fearless', description: 'Endure 500 total fear damage without retreating.', checkFn: 'totalFearEndured >= 500' },
  [NM_ACHIEVEMENT_DREAM_WEAVER]: { name: 'Dream Weaver', description: 'Complete 10 dream weaving patterns.', checkFn: 'totalDreamsWoven >= 10' },
  [NM_ACHIEVEMENT_SHADOW_MASTER]: { name: 'Shadow Master', description: 'Reach shadow manipulation level 10.', checkFn: 'shadowManipulationLevel >= 10' },
  [NM_ACHIEVEMENT_ZONE_EXPLORER]: { name: 'Zone Explorer', description: 'Visit all 8 nightmare zones.', checkFn: 'zonesVisited >= 8' },
  [NM_ACHIEVEMENT_WEAPON_HOARDER]: { name: 'Weapon Hoarder', description: 'Own 10 different shadow weapons.', checkFn: 'weaponsOwnedCount >= 10' },
  [NM_ACHIEVEMENT_POWER_UNLEASHED]: { name: 'Power Unleashed', description: 'Unlock all 22 dream powers.', checkFn: 'powersUnlockedCount >= 22' },
  [NM_ACHIEVEMENT_NIGHTMARE_BANISHER]: { name: 'Nightmare Banisher', description: 'Permanently banish 5 nightmare creatures.', checkFn: 'totalNightmaresBanished >= 5' },
  [NM_ACHIEVEMENT_DAILY_DREAMWALKER]: { name: 'Daily Dreamwalker', description: 'Complete 7 daily dream patrols.', checkFn: 'dailyPatrolsCompleted >= 7' },
  [NM_ACHIEVEMENT_ECLIPSE_SURVIVOR]: { name: 'Eclipse Survivor', description: 'Survive a full Eclipse event.', checkFn: 'eclipseSurvived' },
  [NM_ACHIEVEMENT_TIDE_RIDER]: { name: 'Tide Rider', description: 'Complete a Nightmare Tide event.', checkFn: 'tideCompleted' },
  [NM_ACHIEVEMENT_RIFT_CONQUEROR]: { name: 'Rift Conqueror', description: 'Conquer a Shadow Rift event.', checkFn: 'riftConquered' },
  [NM_ACHIEVEMENT_LEVEL_10]: { name: 'Rising Dream Walker', description: 'Reach level 10.', checkFn: 'level >= 10' },
  [NM_ACHIEVEMENT_LEVEL_25]: { name: 'Veteran Shadow', description: 'Reach level 25.', checkFn: 'level >= 25' },
  [NM_ACHIEVEMENT_LEVEL_50]: { name: 'Apex Nightmare Lord', description: 'Reach the maximum level of 50.', checkFn: 'level >= 50' },
  [NM_ACHIEVEMENT_LORD_OF_NIGHTMARES]: { name: 'Lord of Nightmares', description: 'Defeat the Nightmare Overlord.', checkFn: 'defeatedOverlord' },
};

// ============================================================
// Event Data (3 events)
// ============================================================

const NM_EVENT_DATA: Record<string, NmEventData> = {
  [NM_EVENT_NIGHTMARE_TIDE]: {
    name: 'Nightmare Tide', description: 'A tidal wave of nightmares sweeps through the realm with stronger creatures and doubled soul drops.',
    duration: 3600000, creatureBoost: 1.5, coinMultiplier: 1.5, xpMultiplier: 2.0, rewardCoins: 500, rewardXp: 500,
  },
  [NM_EVENT_ECLIPSE]: {
    name: 'Eclipse', description: 'The dream sun is devoured by shadow. All fear damage doubled, soul drops tripled.',
    duration: 2400000, creatureBoost: 2.0, coinMultiplier: 2.0, xpMultiplier: 1.5, rewardCoins: 800, rewardXp: 800,
  },
  [NM_EVENT_SHADOW_RIFT]: {
    name: 'Shadow Rift', description: 'A rift between dimensions tears open, spawning Nightmare Lords in every zone.',
    duration: 4800000, creatureBoost: 2.5, coinMultiplier: 2.5, xpMultiplier: 3.0, rewardCoins: 1500, rewardXp: 1500,
  },
};

// ============================================================
// XP / Level / Title Helpers
// ============================================================

function nmXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.4));
}

function nmCalculateLevel(totalXp: number): number {
  let level = 1;
  let accum = 0;
  while (level < 50 && accum + nmXpForLevel(level) <= totalXp) {
    accum += nmXpForLevel(level);
    level++;
  }
  return level;
}

function nmTitleForLevel(level: number): string {
  if (level >= 50) return NM_TITLE_LORD_OF_NIGHTMARES;
  if (level >= 42) return NM_TITLE_NIGHTMARE_COMMANDER;
  if (level >= 33) return NM_TITLE_PHANTOM_KNIGHT_TITLE;
  if (level >= 25) return NM_TITLE_DREAM_WEAVER_TITLE;
  if (level >= 18) return NM_TITLE_FEAR_CONQUEROR;
  if (level >= 10) return NM_TITLE_SOUL_SEEKER;
  if (level >= 5) return NM_TITLE_SHADOW_INITIATE;
  return NM_TITLE_DREAM_WALKER;
}

function nmRarityLabel(rarity: string): string {
  const map: Record<string, string> = {
    [NM_RARITY_SHADOW_WISP]: 'Shadow Wisp',
    [NM_RARITY_DREAM_EATER]: 'Dream Eater',
    [NM_RARITY_FEAR_HOUND]: 'Fear Hound',
    [NM_RARITY_PHANTOM_KNIGHT]: 'Phantom Knight',
    [NM_RARITY_NIGHTMARE_LORD]: 'Nightmare Lord',
  };
  return map[rarity] || rarity;
}

// ============================================================
// Achievement Checker
// ============================================================

interface NmAchievementCtx {
  totalCreaturesDefeated: number;
  totalSoulsCollected: number;
  totalFearEndured: number;
  totalDreamsWoven: number;
  shadowManipulationLevel: number;
  zonesVisited: number;
  weaponsOwnedCount: number;
  powersUnlockedCount: number;
  totalNightmaresBanished: number;
  dailyPatrolsCompleted: number;
  eclipseSurvived: boolean;
  tideCompleted: boolean;
  riftConquered: boolean;
  level: number;
  defeatedOverlord: boolean;
}

function nmCheckAchievements(ctx: NmAchievementCtx): string[] {
  const met: string[] = [];
  if (ctx.totalCreaturesDefeated >= 1) met.push(NM_ACHIEVEMENT_FIRST_NIGHTMARE);
  if (ctx.totalSoulsCollected >= 100) met.push(NM_ACHIEVEMENT_SOUL_COLLECTOR);
  if (ctx.totalFearEndured >= 500) met.push(NM_ACHIEVEMENT_FEARLESS);
  if (ctx.totalDreamsWoven >= 10) met.push(NM_ACHIEVEMENT_DREAM_WEAVER);
  if (ctx.shadowManipulationLevel >= 10) met.push(NM_ACHIEVEMENT_SHADOW_MASTER);
  if (ctx.zonesVisited >= 8) met.push(NM_ACHIEVEMENT_ZONE_EXPLORER);
  if (ctx.weaponsOwnedCount >= 10) met.push(NM_ACHIEVEMENT_WEAPON_HOARDER);
  if (ctx.powersUnlockedCount >= 22) met.push(NM_ACHIEVEMENT_POWER_UNLEASHED);
  if (ctx.totalNightmaresBanished >= 5) met.push(NM_ACHIEVEMENT_NIGHTMARE_BANISHER);
  if (ctx.dailyPatrolsCompleted >= 7) met.push(NM_ACHIEVEMENT_DAILY_DREAMWALKER);
  if (ctx.eclipseSurvived) met.push(NM_ACHIEVEMENT_ECLIPSE_SURVIVOR);
  if (ctx.tideCompleted) met.push(NM_ACHIEVEMENT_TIDE_RIDER);
  if (ctx.riftConquered) met.push(NM_ACHIEVEMENT_RIFT_CONQUEROR);
  if (ctx.level >= 10) met.push(NM_ACHIEVEMENT_LEVEL_10);
  if (ctx.level >= 25) met.push(NM_ACHIEVEMENT_LEVEL_25);
  if (ctx.level >= 50) met.push(NM_ACHIEVEMENT_LEVEL_50);
  if (ctx.defeatedOverlord) met.push(NM_ACHIEVEMENT_LORD_OF_NIGHTMARES);
  return met;
}

// ============================================================
// Initial State Factory
// ============================================================

function nmCreateInitialState(seed?: number): NmNightmareRealmState {
  return {
    rngSeed: seed ?? Date.now(),
    level: 1, experience: 0, coins: 50,
    title: NM_TITLE_DREAM_WALKER,
    currentZone: NM_ZONE_WHISPERING_CORRIDOR,
    combat: { activeCreature: null, creatureHp: 0, creatureMaxHp: 0, playerFear: 0, maxFear: 100, turnsElapsed: 0, isBanishing: false, banishProgress: 0, banishTarget: 0 },
    dreamWeaving: { activePattern: null, weaveProgress: 0, weaveTarget: 5, dreamThreads: 0, nightmareTears: 0, patternsCompleted: 0 },
    patrol: { isPatrolling: false, patrolZone: null, patrolKills: 0, patrolTarget: 5, patrolStartTime: null, patrolCompletedToday: false, patrolRewardClaimed: false, lastPatrolDate: null },
    eventState: { activeEvent: null, eventStartTime: null, eventProgress: 0, eventCompleted: false, eventRewardClaimed: false },
    defeatedCreatures: [], encounteredCreatures: [], souls: {},
    weaponsOwned: [NM_WEAPON_GLOOM_DAGGER], equippedWeapon: NM_WEAPON_GLOOM_DAGGER,
    powersUnlocked: [NM_POWER_SHADOW_STEP, NM_POWER_FEAR_WARD],
    powerLevels: { [NM_POWER_SHADOW_STEP]: 1, [NM_POWER_FEAR_WARD]: 1 },
    shadowManipulationLevel: 1, shadowXp: 0,
    dreamWeavingLevel: 1, dreamXp: 0,
    nightmareBanished: 0, dailyPatrolsCompleted: 0, eventsParticipated: [],
    achievements: [],
    totalSoulsCollected: 0, totalCreaturesDefeated: 0, totalCoinsEarned: 0,
    totalFearEndured: 0, totalDreamsWoven: 0, totalNightmaresBanished: 0, totalShadowManipulated: 0,
    explorationLog: ['You step into the Whispering Corridor. Shadows cling to the walls like living things...'],
  };
}

// ============================================================
// The Hook — useNightmareRealm
// ============================================================

export default function useNightmareRealm(initialSeed?: number) {
  const [nmAPIState, nmAPISetState] = useState<NmNightmareRealmState>(
    () => nmCreateInitialState(initialSeed),
  );

  // ----------------------------------------------------------
  // Data lookup helpers (no state dependency)
  // ----------------------------------------------------------

  const nmAPIGetZoneData = useCallback((zoneId: string): NmZoneData | null => {
    return NM_ZONE_DATA[zoneId] ?? null;
  }, []);

  const nmAPIGetCreatureData = useCallback((creatureId: string): NmCreatureData | null => {
    return NM_CREATURE_DATA[creatureId] ?? null;
  }, []);

  const nmAPIGetWeaponData = useCallback((weaponId: string): NmWeaponData | null => {
    return NM_WEAPON_DATA[weaponId] ?? null;
  }, []);

  const nmAPIGetPowerData = useCallback((powerId: string): NmDreamPowerData | null => {
    return NM_POWER_DATA[powerId] ?? null;
  }, []);

  const nmAPIGetEventData = useCallback((eventId: string): NmEventData | null => {
    return NM_EVENT_DATA[eventId] ?? null;
  }, []);

  const nmAPIGetAchievementData = useCallback((achId: string): NmAchievementData | null => {
    return NM_ACHIEVEMENT_DATA[achId] ?? null;
  }, []);

  const nmAPIGetRarityMultiplier = useCallback((rarity: string): number => {
    return NM_RARITY_MULTIPLIER[rarity] ?? 1.0;
  }, []);

  const nmAPIRarityLabel = useCallback((rarity: string): string => {
    return nmRarityLabel(rarity);
  }, []);

  const nmAPIXpForNextLevel = useCallback((level: number): number => {
    return level >= 50 ? 0 : nmXpForLevel(level + 1);
  }, []);

  // ----------------------------------------------------------
  // Computed values (useMemo)
  // ----------------------------------------------------------

  const nmAPIEquippedWeaponData = useMemo((): NmWeaponData | null => {
    if (!nmAPIState.equippedWeapon) return null;
    return NM_WEAPON_DATA[nmAPIState.equippedWeapon] ?? null;
  }, [nmAPIState.equippedWeapon]);

  const nmAPIEquippedDamage = useMemo((): number => {
    if (!nmAPIState.equippedWeapon) return 5;
    const wd = NM_WEAPON_DATA[nmAPIState.equippedWeapon];
    if (!wd) return 5;
    return wd.baseDamage + (nmAPIState.level * 2) + (nmAPIState.shadowManipulationLevel * 3);
  }, [nmAPIState.equippedWeapon, nmAPIState.level, nmAPIState.shadowManipulationLevel]);

  const nmAPIActiveCreatureData = useMemo((): NmCreatureData | null => {
    if (!nmAPIState.combat.activeCreature) return null;
    return NM_CREATURE_DATA[nmAPIState.combat.activeCreature] ?? null;
  }, [nmAPIState.combat.activeCreature]);

  const nmAPIZoneProgress = useMemo((): { visited: number; total: number } => {
    let visited = 0;
    for (const zId of NM_ALL_ZONES) {
      if (nmAPIState.level >= NM_ZONE_DATA[zId].levelReq) visited++;
    }
    return { visited, total: NM_ALL_ZONES.length };
  }, [nmAPIState.level]);

  const nmAPIBestiaryProgress = useMemo((): { discovered: number; total: number } => {
    return { discovered: nmAPIState.encounteredCreatures.length, total: NM_ALL_CREATURES.length };
  }, [nmAPIState.encounteredCreatures.length]);

  const nmAPIWeaponCollectionProgress = useMemo((): { owned: number; total: number } => {
    return { owned: nmAPIState.weaponsOwned.length, total: NM_ALL_WEAPONS.length };
  }, [nmAPIState.weaponsOwned.length]);

  const nmAPIPowerCollectionProgress = useMemo((): { unlocked: number; total: number } => {
    return { unlocked: nmAPIState.powersUnlocked.length, total: NM_ALL_POWERS.length };
  }, [nmAPIState.powersUnlocked.length]);

  const nmAPIAchievementProgress = useMemo((): { earned: number; total: number } => {
    return { earned: nmAPIState.achievements.length, total: NM_ALL_ACHIEVEMENTS.length };
  }, [nmAPIState.achievements.length]);

  const nmAPIAvailableCreatures = useMemo((): string[] => {
    const zoneData = NM_ZONE_DATA[nmAPIState.currentZone];
    if (!zoneData) return [];
    return zoneData.creaturePool.filter((c) => !nmAPIState.defeatedCreatures.includes(c));
  }, [nmAPIState.currentZone, nmAPIState.defeatedCreatures]);

  // ----------------------------------------------------------
  // Status check helpers (read from nmAPIState)
  // ----------------------------------------------------------

  const nmAPIIsInCombat = useCallback((): boolean => {
    return nmAPIState.combat.activeCreature !== null;
  }, [nmAPIState.combat.activeCreature]);

  const nmAPICanEnterZone = useCallback((zoneId: string): boolean => {
    const zd = NM_ZONE_DATA[zoneId];
    if (!zd) return false;
    return nmAPIState.level >= zd.levelReq;
  }, [nmAPIState.level]);

  const nmAPICanPurchaseWeapon = useCallback((weaponId: string): boolean => {
    const wd = NM_WEAPON_DATA[weaponId];
    if (!wd) return false;
    return nmAPIState.coins >= wd.cost && nmAPIState.level >= wd.levelReq && !nmAPIState.weaponsOwned.includes(weaponId);
  }, [nmAPIState.coins, nmAPIState.level, nmAPIState.weaponsOwned]);

  const nmAPICanUnlockPower = useCallback((powerId: string): boolean => {
    const pd = NM_POWER_DATA[powerId];
    if (!pd) return false;
    return nmAPIState.coins >= pd.cost && nmAPIState.level >= pd.unlockLevel && !nmAPIState.powersUnlocked.includes(powerId);
  }, [nmAPIState.coins, nmAPIState.level, nmAPIState.powersUnlocked]);

  const nmAPIGetZoneCreatures = useCallback((zoneId: string): string[] => {
    const zoneData = NM_ZONE_DATA[zoneId];
    if (!zoneData) return [];
    return [...zoneData.creaturePool];
  }, []);

  // ----------------------------------------------------------
  // Actions — Zone & Exploration
  // ----------------------------------------------------------

  const nmAPIChangeZone = useCallback((zoneId: string): void => {
    nmAPISetState((prev) => {
      const zd = NM_ZONE_DATA[zoneId];
      if (!zd || prev.level < zd.levelReq || prev.combat.activeCreature !== null) return prev;
      return {
        ...prev,
        currentZone: zoneId,
        explorationLog: [...prev.explorationLog, `You enter the ${zd.name}. ${zd.description}`],
      };
    });
  }, []);

  const nmAPIExploreZone = useCallback((): void => {
    nmAPISetState((prev) => {
      if (prev.combat.activeCreature !== null) return prev;
      let seed = prev.rngSeed;
      const r1 = nmAdvanceRng(seed); seed = r1.nextSeed;
      const r2 = nmAdvanceRng(seed); seed = r2.nextSeed;
      const zoneData = NM_ZONE_DATA[prev.currentZone];
      if (!zoneData) return prev;
      const available = zoneData.creaturePool.filter(
        (c) => !prev.encounteredCreatures.includes(c) || !prev.defeatedCreatures.includes(c),
      );
      if (available.length === 0) return prev;
      let xpGain = 10 + prev.level * 2;
      let coinGain = 5 + Math.floor(prev.level * 1.5);
      let soulGain = 0;
      const logs: string[] = [`You explore the ${zoneData.name}...`];
      if (r1.value < 0.3) {
        const sr = nmRollInRange(seed, 1, 3 + prev.level);
        soulGain = sr.value; seed = sr.nextSeed;
        logs.push(`Found ${soulGain} soul fragments drifting in the darkness.`);
      }
      if (r2.value < 0.15) {
        const cr = nmRollInRange(seed, 10, 30 + prev.level * 2);
        coinGain += cr.value; seed = cr.nextSeed;
        logs.push('Discovered a cache of nightmare coins hidden in the shadows.');
      }
      const newXp = prev.experience + xpGain;
      const newLevel = nmCalculateLevel(newXp);
      const newSouls = { ...prev.souls };
      if (soulGain > 0) newSouls['generic_soul'] = (newSouls['generic_soul'] || 0) + soulGain;
      return {
        ...prev, rngSeed: seed, level: newLevel, experience: newXp, title: nmTitleForLevel(newLevel),
        coins: prev.coins + coinGain, souls: newSouls,
        totalSoulsCollected: prev.totalSoulsCollected + soulGain,
        totalCoinsEarned: prev.totalCoinsEarned + coinGain,
        explorationLog: [...prev.explorationLog, ...logs],
      };
    });
  }, []);

  // ----------------------------------------------------------
  // Actions — Combat
  // ----------------------------------------------------------

  const nmAPIEncounterCreature = useCallback((creatureId?: string): void => {
    nmAPISetState((prev) => {
      if (prev.combat.activeCreature !== null) return prev;
      let seed = prev.rngSeed;
      const zoneData = NM_ZONE_DATA[prev.currentZone];
      if (!zoneData) return prev;
      let target = creatureId;
      if (!target || !zoneData.creaturePool.includes(target)) {
        const pick = nmPickRandom(seed, zoneData.creaturePool);
        target = pick.item; seed = pick.nextSeed;
      }
      const cd = NM_CREATURE_DATA[target];
      if (!cd) return prev;
      const eventMult = prev.eventState.activeEvent ? (NM_EVENT_DATA[prev.eventState.activeEvent]?.creatureBoost ?? 1) : 1;
      const scaledHp = Math.floor(cd.baseHp * (1 + (prev.level - 1) * 0.1) * eventMult);
      const newEnc = prev.encounteredCreatures.includes(target) ? prev.encounteredCreatures : [...prev.encounteredCreatures, target];
      return {
        ...prev, rngSeed: seed, encounteredCreatures: newEnc,
        combat: { activeCreature: target, creatureHp: scaledHp, creatureMaxHp: scaledHp, playerFear: 0, maxFear: 100, turnsElapsed: 0, isBanishing: false, banishProgress: 0, banishTarget: scaledHp },
        explorationLog: [...prev.explorationLog, `A ${cd.name} (${nmRarityLabel(cd.rarity)}) emerges from the shadows! HP: ${scaledHp} | Fear DMG: ${Math.floor(cd.fearDamage * eventMult)}`],
      };
    });
  }, []);

  const nmAPIAttackCreature = useCallback((): void => {
    nmAPISetState((prev) => {
      if (!prev.combat.activeCreature) return prev;
      const cd = NM_CREATURE_DATA[prev.combat.activeCreature];
      if (!cd) return prev;
      const wd = prev.equippedWeapon ? NM_WEAPON_DATA[prev.equippedWeapon] : null;
      const baseDmg = wd ? wd.baseDamage : 5;
      const fearBonus = wd ? wd.fearBonus : 0;
      let seed = prev.rngSeed;
      const r1 = nmAdvanceRng(seed); seed = r1.nextSeed;
      const r2 = nmAdvanceRng(seed); seed = r2.nextSeed;
      const playerDmg = Math.floor(baseDmg * (1 + prev.level * 0.08 + prev.shadowManipulationLevel * 0.05) + r1.value * baseDmg * 0.3);
      const eventMult = prev.eventState.activeEvent ? (NM_EVENT_DATA[prev.eventState.activeEvent]?.creatureBoost ?? 1) : 1;
      const creatureFearDmg = Math.floor(cd.fearDamage * (1 + r2.value * 0.2) * eventMult);
      const fearRed = Math.max(0, fearBonus - Math.floor(prev.dreamWeavingLevel * 2));
      const newHp = Math.max(0, prev.combat.creatureHp - playerDmg);
      const newFear = Math.min(prev.combat.maxFear, prev.combat.playerFear + Math.max(0, creatureFearDmg - fearRed));
      const newTurns = prev.combat.turnsElapsed + 1;
      const logs: string[] = [`You strike the ${cd.name} for ${playerDmg} damage!`];
      let defeated = false;
      let coinsGot = 0;
      let xpGot = 0;
      let soulsGot = 0;
      const newDef = [...prev.defeatedCreatures];
      const newSouls = { ...prev.souls };
      const evCoin = prev.eventState.activeEvent ? (NM_EVENT_DATA[prev.eventState.activeEvent]?.coinMultiplier ?? 1) : 1;
      const evXp = prev.eventState.activeEvent ? (NM_EVENT_DATA[prev.eventState.activeEvent]?.xpMultiplier ?? 1) : 1;
      const rMult = NM_RARITY_MULTIPLIER[cd.rarity] ?? 1;
      if (newHp <= 0) {
        defeated = true;
        coinsGot = Math.floor(cd.coinReward * rMult * evCoin);
        xpGot = Math.floor(cd.xpReward * rMult * evXp);
        soulsGot = Math.floor(1 + rMult * 2);
        logs.push(`The ${cd.name} is defeated! +${xpGot} XP, +${coinsGot} coins, +${soulsGot} souls.`);
        if (!newDef.includes(prev.combat.activeCreature)) newDef.push(prev.combat.activeCreature);
        newSouls[cd.soulDrop] = (newSouls[cd.soulDrop] || 0) + soulsGot;
      } else {
        logs.push(fearRed > 0 ? `The ${cd.name} attacks for ${creatureFearDmg} fear! (${fearRed} reduced)` : `The ${cd.name} attacks for ${creatureFearDmg} fear damage!`);
      }
      const playerOut = newFear >= prev.combat.maxFear && !defeated;
      if (playerOut) logs.push('Your fear overwhelms you! You flee in terror...');
      const finalXp = prev.experience + xpGot;
      const finalLevel = nmCalculateLevel(finalXp);
      const patKills = defeated && prev.patrol.isPatrolling ? prev.patrol.patrolKills + 1 : prev.patrol.patrolKills;
      const patDone = prev.patrol.isPatrolling && patKills >= prev.patrol.patrolTarget;
      let patCoins = 0;
      let patXp = 0;
      if (patDone) { patCoins = 100 + prev.level * 20; patXp = 50 + prev.level * 10; logs.push(`Dream patrol complete! +${patCoins} coins, +${patXp} XP.`); }
      const totXp = finalXp + patXp;
      const totLevel = nmCalculateLevel(totXp);
      const newShadowXp = prev.shadowXp + (defeated ? Math.floor(rMult * 5) : 0);
      const newShadowLv = Math.min(25, Math.floor(Math.sqrt(newShadowXp / 10)) + 1);
      const newDreamXp = prev.dreamXp + (defeated ? Math.floor(rMult * 3) : 0);
      const newDreamLv = Math.min(25, Math.floor(Math.sqrt(newDreamXp / 8)) + 1);
      const newAch = nmCheckAchievements({
        totalCreaturesDefeated: prev.totalCreaturesDefeated + (defeated ? 1 : 0),
        totalSoulsCollected: prev.totalSoulsCollected + soulsGot,
        totalFearEndured: prev.totalFearEndured + Math.max(0, creatureFearDmg - fearRed),
        totalDreamsWoven: prev.totalDreamsWoven,
        shadowManipulationLevel: newShadowLv,
        zonesVisited: NM_ALL_ZONES.filter((z) => prev.level >= NM_ZONE_DATA[z].levelReq).length,
        weaponsOwnedCount: prev.weaponsOwned.length,
        powersUnlockedCount: prev.powersUnlocked.length,
        totalNightmaresBanished: prev.totalNightmaresBanished,
        dailyPatrolsCompleted: prev.dailyPatrolsCompleted + (patDone ? 1 : 0),
        eclipseSurvived: prev.achievements.includes(NM_ACHIEVEMENT_ECLIPSE_SURVIVOR),
        tideCompleted: prev.achievements.includes(NM_ACHIEVEMENT_TIDE_RIDER),
        riftConquered: prev.achievements.includes(NM_ACHIEVEMENT_RIFT_CONQUEROR),
        level: totLevel,
        defeatedOverlord: prev.combat.activeCreature === NM_CREATURE_NIGHTMARE_OVERLORD || prev.defeatedCreatures.includes(NM_CREATURE_NIGHTMARE_OVERLORD),
      });
      const clearCombat = { activeCreature: null, creatureHp: 0, creatureMaxHp: 0, playerFear: 0, maxFear: 100, turnsElapsed: 0, isBanishing: false, banishProgress: 0, banishTarget: 0 };
      return {
        ...prev, rngSeed: seed, level: totLevel, experience: totXp, title: nmTitleForLevel(totLevel),
        coins: prev.coins + coinsGot + patCoins, souls: newSouls, defeatedCreatures: newDef,
        shadowManipulationLevel: newShadowLv, shadowXp: newShadowXp,
        dreamWeavingLevel: newDreamLv, dreamXp: newDreamXp,
        totalSoulsCollected: prev.totalSoulsCollected + soulsGot,
        totalCreaturesDefeated: prev.totalCreaturesDefeated + (defeated ? 1 : 0),
        totalCoinsEarned: prev.totalCoinsEarned + coinsGot + patCoins,
        totalFearEndured: prev.totalFearEndured + Math.max(0, creatureFearDmg - fearRed),
        totalShadowManipulated: prev.totalShadowManipulated + (defeated ? Math.floor(rMult * 5) : 0),
        combat: defeated || playerOut ? clearCombat : { ...prev.combat, creatureHp: newHp, playerFear: newFear, turnsElapsed: newTurns },
        patrol: { ...prev.patrol, patrolKills: patKills, isPatrolling: patDone ? false : prev.patrol.isPatrolling, patrolCompletedToday: patDone ? true : prev.patrol.patrolCompletedToday },
        achievements: Array.from(new Set([...prev.achievements, ...newAch])),
        explorationLog: [...prev.explorationLog, ...logs],
      };
    });
  }, []);

  const nmAPIFleeCombat = useCallback((): void => {
    nmAPISetState((prev) => {
      if (!prev.combat.activeCreature) return prev;
      const cd = NM_CREATURE_DATA[prev.combat.activeCreature];
      return {
        ...prev,
        combat: { activeCreature: null, creatureHp: 0, creatureMaxHp: 0, playerFear: 0, maxFear: 100, turnsElapsed: 0, isBanishing: false, banishProgress: 0, banishTarget: 0 },
        explorationLog: [...prev.explorationLog, `You flee from the ${cd?.name || 'creature'}! Residual fear pounds in your chest...`],
      };
    });
  }, []);

  const nmAPIUseDreamPower = useCallback((powerId: string): { damage: number; fearReduced: number; log: string } => {
    let result = { damage: 0, fearReduced: 0, log: '' };
    nmAPISetState((prev) => {
      if (!prev.combat.activeCreature || !prev.powersUnlocked.includes(powerId)) return prev;
      const pd = NM_POWER_DATA[powerId];
      if (!pd) return prev;
      const pwrLv = prev.powerLevels[powerId] || 1;
      const pwrVal = Math.floor(pd.basePower * (1 + (pwrLv - 1) * 0.15));
      let dmg = 0;
      let fearRed = 0;
      const logs: string[] = [];
      if (pd.powerType === 'offense') {
        dmg = pwrVal + Math.floor(prev.level * 2);
        logs.push(`You unleash ${pd.name}! ${dmg} damage to the creature!`);
      } else if (pd.powerType === 'defense') {
        fearRed = Math.min(prev.combat.playerFear, pwrVal);
        logs.push(`You activate ${pd.name}! Fear reduced by ${fearRed}.`);
      } else if (pd.powerType === 'healing') {
        fearRed = Math.min(prev.combat.playerFear, Math.floor(pwrVal * 0.8));
        dmg = Math.floor(pwrVal * 0.3);
        logs.push(`You use ${pd.name}! Courage +${fearRed}, damage ${dmg}.`);
      } else if (pd.powerType === 'control') {
        dmg = Math.floor(pwrVal * 0.5);
        logs.push(`You invoke ${pd.name}! Creature weakened. ${dmg} control damage.`);
      } else if (pd.powerType === 'utility') {
        const cBonus = Math.floor(pwrVal * 0.5);
        const xBonus = Math.floor(pwrVal * 0.3);
        const nXp = prev.experience + xBonus;
        result = { damage: 0, fearReduced: 0, log: `${pd.name}: +${cBonus} coins, +${xBonus} XP.` };
        return { ...prev, experience: nXp, level: nmCalculateLevel(nXp), title: nmTitleForLevel(nmCalculateLevel(nXp)), coins: prev.coins + cBonus, explorationLog: [...prev.explorationLog, `You channel ${pd.name}! +${cBonus} coins, +${xBonus} XP.`] };
      } else if (pd.powerType === 'special') {
        dmg = Math.floor(pwrVal * 0.6);
        fearRed = Math.floor(pwrVal * 0.2);
        logs.push(`You use ${pd.name}! ${dmg} damage, ${fearRed} fear reduction.`);
      }
      const newCHp = Math.max(0, prev.combat.creatureHp - dmg);
      const newPFear = Math.max(0, prev.combat.playerFear - fearRed);
      const cd = NM_CREATURE_DATA[prev.combat.activeCreature];
      let cDef = false;
      let sGot = 0;
      let cGot = 0;
      let xGot = 0;
      const nSouls = { ...prev.souls };
      const nDef = [...prev.defeatedCreatures];
      if (newCHp <= 0 && cd) {
        cDef = true;
        const rm = NM_RARITY_MULTIPLIER[cd.rarity] ?? 1;
        cGot = Math.floor(cd.coinReward * rm); xGot = Math.floor(cd.xpReward * rm);
        sGot = Math.floor(1 + rm * 2);
        logs.push(`${cd.name} vanquished! +${xGot} XP, +${cGot} coins.`);
        if (!nDef.includes(prev.combat.activeCreature)) nDef.push(prev.combat.activeCreature);
        nSouls[cd.soulDrop] = (nSouls[cd.soulDrop] || 0) + sGot;
      }
      result = { damage: dmg, fearReduced: fearRed, log: logs.join('\n') };
      const clearC = { activeCreature: null, creatureHp: 0, creatureMaxHp: 0, playerFear: 0, maxFear: 100, turnsElapsed: 0, isBanishing: false, banishProgress: 0, banishTarget: 0 };
      return {
        ...prev, coins: prev.coins + cGot, experience: prev.experience + xGot,
        level: nmCalculateLevel(prev.experience + xGot), title: nmTitleForLevel(nmCalculateLevel(prev.experience + xGot)),
        souls: nSouls, defeatedCreatures: nDef,
        totalSoulsCollected: prev.totalSoulsCollected + sGot,
        totalCreaturesDefeated: prev.totalCreaturesDefeated + (cDef ? 1 : 0),
        totalCoinsEarned: prev.totalCoinsEarned + cGot,
        combat: cDef ? clearC : { ...prev.combat, creatureHp: newCHp, playerFear: newPFear, turnsElapsed: prev.combat.turnsElapsed + 1 },
        explorationLog: [...prev.explorationLog, ...logs],
      };
    });
    return result;
  }, []);

  const nmAPIReduceFear = useCallback((amount: number): void => {
    nmAPISetState((prev) => {
      if (!prev.combat.activeCreature) return prev;
      const nf = Math.max(0, prev.combat.playerFear - amount);
      return { ...prev, combat: { ...prev.combat, playerFear: nf }, explorationLog: [...prev.explorationLog, `You steel your nerves. Fear -${amount}. (Current: ${nf}/${prev.combat.maxFear})`] };
    });
  }, []);

  // ----------------------------------------------------------
  // Actions — Weapons & Powers
  // ----------------------------------------------------------

  const nmAPIPurchaseWeapon = useCallback((weaponId: string): boolean => {
    let ok = false;
    nmAPISetState((prev) => {
      const wd = NM_WEAPON_DATA[weaponId];
      if (!wd || prev.coins < wd.cost || prev.level < wd.levelReq || prev.weaponsOwned.includes(weaponId)) return prev;
      ok = true;
      return { ...prev, coins: prev.coins - wd.cost, weaponsOwned: [...prev.weaponsOwned, weaponId], explorationLog: [...prev.explorationLog, `Purchased ${wd.name} for ${wd.cost} coins!`] };
    });
    return ok;
  }, []);

  const nmAPIEquipWeapon = useCallback((weaponId: string): void => {
    nmAPISetState((prev) => {
      if (!prev.weaponsOwned.includes(weaponId) || prev.combat.activeCreature !== null) return prev;
      const wd = NM_WEAPON_DATA[weaponId];
      return { ...prev, equippedWeapon: weaponId, explorationLog: [...prev.explorationLog, `Equipped ${wd?.name ?? weaponId}. DMG: ${wd?.baseDamage ?? 0}, Fear +${wd?.fearBonus ?? 0}.`] };
    });
  }, []);

  const nmAPIUnlockPower = useCallback((powerId: string): boolean => {
    let ok = false;
    nmAPISetState((prev) => {
      const pd = NM_POWER_DATA[powerId];
      if (!pd || prev.coins < pd.cost || prev.level < pd.unlockLevel || prev.powersUnlocked.includes(powerId)) return prev;
      ok = true;
      return { ...prev, coins: prev.coins - pd.cost, powersUnlocked: [...prev.powersUnlocked, powerId], powerLevels: { ...prev.powerLevels, [powerId]: 1 }, explorationLog: [...prev.explorationLog, `Unlocked ${pd.name}! ${pd.description}`] };
    });
    return ok;
  }, []);

  const nmAPIUpgradePower = useCallback((powerId: string): boolean => {
    let ok = false;
    nmAPISetState((prev) => {
      if (!prev.powersUnlocked.includes(powerId)) return prev;
      const cur = prev.powerLevels[powerId] || 1;
      if (cur >= 10) return prev;
      const cost = Math.floor(50 * Math.pow(cur, 1.5));
      if (prev.coins < cost) return prev;
      ok = true;
      const pd = NM_POWER_DATA[powerId];
      return { ...prev, coins: prev.coins - cost, powerLevels: { ...prev.powerLevels, [powerId]: cur + 1 }, explorationLog: [...prev.explorationLog, `Upgraded ${pd?.name ?? powerId} to level ${cur + 1}!`] };
    });
    return ok;
  }, []);

  // ----------------------------------------------------------
  // Actions — Dream Weaving
  // ----------------------------------------------------------

  const nmAPIStartDreamWeaving = useCallback((patternName: string): void => {
    nmAPISetState((prev) => {
      if (prev.combat.activeCreature !== null) return prev;
      const target = 5 + prev.dreamWeavingLevel * 2;
      return { ...prev, dreamWeaving: { ...prev.dreamWeaving, activePattern: patternName, weaveProgress: 0, weaveTarget: target }, explorationLog: [...prev.explorationLog, `You begin weaving "${patternName}". Target: ${target} threads.`] };
    });
  }, []);

  const nmAPIAdvanceWeaving = useCallback((): void => {
    nmAPISetState((prev) => {
      if (!prev.dreamWeaving.activePattern) return prev;
      let seed = prev.rngSeed;
      const r1 = nmAdvanceRng(seed); seed = r1.nextSeed;
      const threads = 1 + Math.floor(r1.value * (1 + prev.dreamWeavingLevel * 0.3));
      const np = prev.dreamWeaving.weaveProgress + threads;
      const logs: string[] = [`Wove ${threads} threads. Progress: ${Math.min(np, prev.dreamWeaving.weaveTarget)}/${prev.dreamWeaving.weaveTarget}`];
      let done = false;
      let cRew = 0;
      let xRew = 0;
      let sRew = 0;
      if (np >= prev.dreamWeaving.weaveTarget) {
        done = true;
        cRew = 20 + prev.dreamWeavingLevel * 10;
        xRew = 15 + prev.dreamWeavingLevel * 8;
        sRew = prev.dreamWeavingLevel + 2;
        logs.push(`Pattern "${prev.dreamWeaving.activePattern}" completed! +${cRew} coins, +${xRew} XP, +${sRew} threads.`);
      }
      const nDreamXp = prev.dreamXp + threads;
      const nDreamLv = Math.min(25, Math.floor(Math.sqrt(nDreamXp / 8)) + 1);
      const nSouls = { ...prev.souls };
      if (sRew > 0) nSouls['dream_thread'] = (nSouls['dream_thread'] || 0) + sRew;
      const nXp = prev.experience + xRew;
      return {
        ...prev, rngSeed: seed, level: nmCalculateLevel(nXp), experience: nXp, title: nmTitleForLevel(nmCalculateLevel(nXp)),
        coins: prev.coins + cRew, souls: nSouls, dreamWeavingLevel: nDreamLv, dreamXp: nDreamXp,
        totalDreamsWoven: prev.totalDreamsWoven + (done ? 1 : 0), totalSoulsCollected: prev.totalSoulsCollected + sRew,
        totalCoinsEarned: prev.totalCoinsEarned + cRew,
        dreamWeaving: { ...prev.dreamWeaving, weaveProgress: done ? 0 : np, activePattern: done ? null : prev.dreamWeaving.activePattern, dreamThreads: prev.dreamWeaving.dreamThreads + threads, patternsCompleted: prev.dreamWeaving.patternsCompleted + (done ? 1 : 0), weaveTarget: done ? 0 : prev.dreamWeaving.weaveTarget },
        explorationLog: [...prev.explorationLog, ...logs],
      };
    });
  }, []);

  const nmAPICancelWeaving = useCallback((): void => {
    nmAPISetState((prev) => {
      return { ...prev, dreamWeaving: { ...prev.dreamWeaving, activePattern: null, weaveProgress: 0 }, explorationLog: [...prev.explorationLog, 'You abandon the dream pattern. Threads dissolve into mist.'] };
    });
  }, []);

  // ----------------------------------------------------------
  // Actions — Shadow Manipulation
  // ----------------------------------------------------------

  const nmAPIManipulateShadow = useCallback((creatureId: string): boolean => {
    let ok = false;
    nmAPISetState((prev) => {
      const cd = NM_CREATURE_DATA[creatureId];
      if (!cd) return prev;
      if (prev.combat.activeCreature !== null) return prev;
      const cost = 10 + Math.floor((NM_RARITY_MULTIPLIER[cd.rarity] ?? 1) * 15);
      const totalSouls = Object.values(prev.souls).reduce((a, b) => a + b, 0);
      if (totalSouls < cost) return prev;
      let seed = prev.rngSeed;
      const r1 = nmAdvanceRng(seed); seed = r1.nextSeed;
      const success = r1.value < 0.4 + prev.shadowManipulationLevel * 0.02;
      const logs: string[] = [];
      if (success) {
        ok = true;
        const shadowXp = prev.shadowXp + Math.floor((NM_RARITY_MULTIPLIER[cd.rarity] ?? 1) * 10);
        const newLv = Math.min(25, Math.floor(Math.sqrt(shadowXp / 10)) + 1);
        const xRew = Math.floor((NM_RARITY_MULTIPLIER[cd.rarity] ?? 1) * 30);
        logs.push(`You manipulate the shadows around ${cd.name}! It trembles and submits. +${xRew} XP, +${Math.floor((NM_RARITY_MULTIPLIER[cd.rarity] ?? 1) * 10)} shadow XP.`);
        return {
          ...prev, rngSeed: seed, shadowManipulationLevel: newLv, shadowXp,
          experience: prev.experience + xRew, level: nmCalculateLevel(prev.experience + xRew),
          title: nmTitleForLevel(nmCalculateLevel(prev.experience + xRew)),
          totalShadowManipulated: prev.totalShadowManipulated + 1,
          explorationLog: [...prev.explorationLog, ...logs],
        };
      }
      logs.push(`Your shadow manipulation of ${cd.name} fails! The creature resists.`);
      return { ...prev, rngSeed: seed, explorationLog: [...prev.explorationLog, ...logs] };
    });
    return ok;
  }, []);

  // ----------------------------------------------------------
  // Actions — Soul Collection
  // ----------------------------------------------------------

  const nmAPISpendSouls = useCallback((soulType: string, amount: number): boolean => {
    let ok = false;
    nmAPISetState((prev) => {
      const cur = prev.souls[soulType] || 0;
      if (cur < amount) return prev;
      ok = true;
      const nSouls = { ...prev.souls };
      nSouls[soulType] = cur - amount;
      if (nSouls[soulType] <= 0) delete nSouls[soulType];
      return { ...prev, souls: nSouls };
    });
    return ok;
  }, []);

  const nmAPITradeSoulsForCoins = useCallback((soulType: string, amount: number): number => {
    let earned = 0;
    nmAPISetState((prev) => {
      const cur = prev.souls[soulType] || 0;
      const trade = Math.min(cur, amount);
      if (trade <= 0) return prev;
      const value = trade * 5;
      earned = value;
      const nSouls = { ...prev.souls };
      nSouls[soulType] = cur - trade;
      if (nSouls[soulType] <= 0) delete nSouls[soulType];
      return { ...prev, souls: nSouls, coins: prev.coins + value, totalCoinsEarned: prev.totalCoinsEarned + value, explorationLog: [...prev.explorationLog, `Traded ${trade} ${soulType} souls for ${value} coins.`] };
    });
    return earned;
  }, []);

  // ----------------------------------------------------------
  // Actions — Nightmare Banishing
  // ----------------------------------------------------------

  const nmAPIStartBanishing = useCallback((): void => {
    nmAPISetState((prev) => {
      if (!prev.combat.activeCreature) return prev;
      const cd = NM_CREATURE_DATA[prev.combat.activeCreature];
      if (!cd || prev.combat.creatureHp > prev.combat.creatureMaxHp * 0.3) return prev;
      return {
        ...prev, combat: { ...prev.combat, isBanishing: true, banishProgress: 0, banishTarget: Math.floor(prev.combat.creatureMaxHp * 0.5) },
        explorationLog: [...prev.explorationLog, `You begin the banishing ritual on the weakened ${cd.name}... The shadows tremble!`],
      };
    });
  }, []);

  const nmAPIAdvanceBanish = useCallback((): boolean => {
    let banished = false;
    nmAPISetState((prev) => {
      if (!prev.combat.isBanishing) return prev;
      let seed = prev.rngSeed;
      const r1 = nmAdvanceRng(seed); seed = r1.nextSeed;
      const bp = 10 + prev.shadowManipulationLevel * 5 + prev.dreamWeavingLevel * 3;
      const pg = Math.floor(bp * (0.5 + r1.value * 0.5));
      const np = prev.combat.banishProgress + pg;
      const logs: string[] = [`Banish progress: +${pg} (${Math.min(np, prev.combat.banishTarget)}/${prev.combat.banishTarget})`];
      if (np >= prev.combat.banishTarget) {
        banished = true;
        const cd = NM_CREATURE_DATA[prev.combat.activeCreature];
        const rm = NM_RARITY_MULTIPLIER[cd?.rarity ?? ''] ?? 1;
        const bCoins = Math.floor(200 * rm);
        const bXp = Math.floor(300 * rm);
        logs.push(`${cd?.name ?? 'creature'} BANISHED! +${bCoins} coins, +${bXp} XP.`);
        const nDef = [...prev.defeatedCreatures];
        if (prev.combat.activeCreature && !nDef.includes(prev.combat.activeCreature)) nDef.push(prev.combat.activeCreature);
        const nSouls = { ...prev.souls };
        if (cd) nSouls[cd.soulDrop] = (nSouls[cd.soulDrop] || 0) + Math.floor(5 * rm);
        return {
          ...prev, rngSeed: seed, level: nmCalculateLevel(prev.experience + bXp), experience: prev.experience + bXp, title: nmTitleForLevel(nmCalculateLevel(prev.experience + bXp)),
          coins: prev.coins + bCoins, souls: nSouls, defeatedCreatures: nDef,
          nightmareBanished: prev.nightmareBanished + 1, totalNightmaresBanished: prev.totalNightmaresBanished + 1,
          totalCoinsEarned: prev.totalCoinsEarned + bCoins, totalSoulsCollected: prev.totalSoulsCollected + Math.floor(5 * rm),
          combat: { activeCreature: null, creatureHp: 0, creatureMaxHp: 0, playerFear: 0, maxFear: 100, turnsElapsed: 0, isBanishing: false, banishProgress: 0, banishTarget: 0 },
          explorationLog: [...prev.explorationLog, ...logs],
        };
      }
      return { ...prev, rngSeed: seed, combat: { ...prev.combat, banishProgress: np }, explorationLog: [...prev.explorationLog, ...logs] };
    });
    return banished;
  }, []);

  // ----------------------------------------------------------
  // Actions — Daily Dream Patrol
  // ----------------------------------------------------------

  const nmAPIStartPatrol = useCallback((): void => {
    nmAPISetState((prev) => {
      if (prev.combat.activeCreature !== null || prev.patrol.isPatrolling || prev.patrol.patrolCompletedToday) return prev;
      const target = 5 + prev.level;
      return { ...prev, patrol: { ...prev.patrol, isPatrolling: true, patrolZone: prev.currentZone, patrolKills: 0, patrolTarget: target, patrolStartTime: Date.now() }, explorationLog: [...prev.explorationLog, `Daily dream patrol begun in ${NM_ZONE_DATA[prev.currentZone]?.name ?? prev.currentZone}! Target: ${target}.`] };
    });
  }, []);

  const nmAPICancelPatrol = useCallback((): void => {
    nmAPISetState((prev) => {
      if (!prev.patrol.isPatrolling) return prev;
      return { ...prev, patrol: { ...prev.patrol, isPatrolling: false, patrolZone: null, patrolKills: 0, patrolStartTime: null }, explorationLog: [...prev.explorationLog, 'Dream patrol cancelled. The nightmares grow restless...'] };
    });
  }, []);

  const nmAPIClaimPatrolReward = useCallback((): number => {
    let reward = 0;
    nmAPISetState((prev) => {
      if (!prev.patrol.patrolCompletedToday || prev.patrol.patrolRewardClaimed) return prev;
      reward = 100 + prev.level * 20;
      return { ...prev, coins: prev.coins + reward, patrol: { ...prev.patrol, patrolRewardClaimed: true }, dailyPatrolsCompleted: prev.dailyPatrolsCompleted + 1, totalCoinsEarned: prev.totalCoinsEarned + reward, explorationLog: [...prev.explorationLog, `Patrol reward claimed: +${reward} coins! Daily patrols: ${prev.dailyPatrolsCompleted + 1}.`] };
    });
    return reward;
  }, []);

  const nmAPIResetDailyPatrol = useCallback((): void => {
    nmAPISetState((prev) => {
      const today = new Date().toISOString().slice(0, 10);
      if (prev.patrol.lastPatrolDate === today) return prev;
      return { ...prev, patrol: { isPatrolling: false, patrolZone: null, patrolKills: 0, patrolTarget: 5 + prev.level, patrolStartTime: null, patrolCompletedToday: false, patrolRewardClaimed: false, lastPatrolDate: today }, explorationLog: [...prev.explorationLog, 'A new day dawns in the nightmare realm. Daily patrol reset.'] };
    });
  }, []);

  // ----------------------------------------------------------
  // Actions — Events (Nightmare Tide, Eclipse, Shadow Rift)
  // ----------------------------------------------------------

  const nmAPIStartEvent = useCallback((eventId: string): void => {
    nmAPISetState((prev) => {
      const ed = NM_EVENT_DATA[eventId];
      if (!ed || prev.eventState.activeEvent !== null) return prev;
      return { ...prev, eventState: { activeEvent: eventId, eventStartTime: Date.now(), eventProgress: 0, eventCompleted: false, eventRewardClaimed: false }, eventsParticipated: [...prev.eventsParticipated, Date.now()], explorationLog: [...prev.explorationLog, `EVENT: ${ed.name} has begun! ${ed.description}`] };
    });
  }, []);

  const nmAPIAdvanceEvent = useCallback((): void => {
    nmAPISetState((prev) => {
      if (!prev.eventState.activeEvent) return prev;
      let seed = prev.rngSeed;
      const r1 = nmAdvanceRng(seed); seed = r1.nextSeed;
      const pg = Math.floor(r1.value * 15) + 5;
      const np = Math.min(100, prev.eventState.eventProgress + pg);
      return { ...prev, rngSeed: seed, eventState: { ...prev.eventState, eventProgress: np }, explorationLog: [...prev.explorationLog, `Event progress: +${pg} (Total: ${np}%)`] };
    });
  }, []);

  const nmAPICompleteEvent = useCallback((): { coins: number; xp: number } | null => {
    let res: { coins: number; xp: number } | null = null;
    nmAPISetState((prev) => {
      if (!prev.eventState.activeEvent || prev.eventState.eventProgress < 100 || prev.eventState.eventCompleted) return prev;
      const ed = NM_EVENT_DATA[prev.eventState.activeEvent];
      if (!ed) return prev;
      res = { coins: ed.rewardCoins, xp: ed.rewardXp };
      const nXp = prev.experience + ed.rewardXp;
      return { ...prev, level: nmCalculateLevel(nXp), experience: nXp, title: nmTitleForLevel(nmCalculateLevel(nXp)), coins: prev.coins + ed.rewardCoins, totalCoinsEarned: prev.totalCoinsEarned + ed.rewardCoins, eventState: { ...prev.eventState, eventCompleted: true }, explorationLog: [...prev.explorationLog, `EVENT COMPLETE: ${ed.name}! +${ed.rewardCoins} coins, +${ed.rewardXp} XP.`] };
    });
    return res;
  }, []);

  const nmAPIClaimEventReward = useCallback((): { coins: number; xp: number } | null => {
    let res: { coins: number; xp: number } | null = null;
    nmAPISetState((prev) => {
      if (!prev.eventState.activeEvent || !prev.eventState.eventCompleted || prev.eventState.eventRewardClaimed) return prev;
      const ed = NM_EVENT_DATA[prev.eventState.activeEvent];
      if (!ed) return prev;
      res = { coins: ed.rewardCoins, xp: ed.rewardXp };
      const ach = nmCheckAchievements({
        totalCreaturesDefeated: prev.totalCreaturesDefeated, totalSoulsCollected: prev.totalSoulsCollected,
        totalFearEndured: prev.totalFearEndured, totalDreamsWoven: prev.totalDreamsWoven,
        shadowManipulationLevel: prev.shadowManipulationLevel,
        zonesVisited: NM_ALL_ZONES.filter((z) => prev.level >= NM_ZONE_DATA[z].levelReq).length,
        weaponsOwnedCount: prev.weaponsOwned.length, powersUnlockedCount: prev.powersUnlocked.length,
        totalNightmaresBanished: prev.totalNightmaresBanished, dailyPatrolsCompleted: prev.dailyPatrolsCompleted,
        eclipseSurvived: prev.eventState.activeEvent === NM_EVENT_ECLIPSE || prev.achievements.includes(NM_ACHIEVEMENT_ECLIPSE_SURVIVOR),
        tideCompleted: prev.eventState.activeEvent === NM_EVENT_NIGHTMARE_TIDE || prev.achievements.includes(NM_ACHIEVEMENT_TIDE_RIDER),
        riftConquered: prev.eventState.activeEvent === NM_EVENT_SHADOW_RIFT || prev.achievements.includes(NM_ACHIEVEMENT_RIFT_CONQUEROR),
        level: prev.level, defeatedOverlord: prev.defeatedCreatures.includes(NM_CREATURE_NIGHTMARE_OVERLORD),
      });
      return { ...prev, eventState: { activeEvent: null, eventStartTime: null, eventProgress: 0, eventCompleted: false, eventRewardClaimed: false }, achievements: Array.from(new Set([...prev.achievements, ...ach])), explorationLog: [...prev.explorationLog, `Event rewards claimed! +${ed.rewardCoins} coins, +${ed.rewardXp} XP.`] };
    });
    return res;
  }, []);

  // ----------------------------------------------------------
  // Actions — Save / Load / Reset
  // ----------------------------------------------------------

  const nmAPIResetState = useCallback((): void => {
    nmAPISetState(nmCreateInitialState());
  }, []);

  const nmAPILoadState = useCallback((saved: NmNightmareRealmState): void => {
    nmAPISetState(saved);
  }, []);

  const nmAPIGetSnapshot = useCallback((): NmNightmareRealmState => {
    return { ...nmAPIState };
  }, [nmAPIState]);

  // ----------------------------------------------------------
  // Actions — Additional utility actions
  // ----------------------------------------------------------

  const nmAPISelectTitle = useCallback((titleName: string): boolean => {
    let ok = false;
    nmAPISetState((prev) => {
      if (!NM_ALL_TITLES.includes(titleName)) return prev;
      ok = true;
      return { ...prev, title: titleName, explorationLog: [...prev.explorationLog, `You now bear the title: ${titleName}.`] };
    });
    return ok;
  }, []);

  const nmAPIGetAvailableTitles = useCallback((): string[] => {
    const titles: string[] = [];
    if (nmAPIState.level >= 1) titles.push(NM_TITLE_DREAM_WALKER);
    if (nmAPIState.level >= 5) titles.push(NM_TITLE_SHADOW_INITIATE);
    if (nmAPIState.level >= 10) titles.push(NM_TITLE_SOUL_SEEKER);
    if (nmAPIState.level >= 18) titles.push(NM_TITLE_FEAR_CONQUEROR);
    if (nmAPIState.level >= 25) titles.push(NM_TITLE_DREAM_WEAVER_TITLE);
    if (nmAPIState.level >= 33) titles.push(NM_TITLE_PHANTOM_KNIGHT_TITLE);
    if (nmAPIState.level >= 42) titles.push(NM_TITLE_NIGHTMARE_COMMANDER);
    if (nmAPIState.level >= 50) titles.push(NM_TITLE_LORD_OF_NIGHTMARES);
    return titles;
  }, [nmAPIState.level]);

  const nmAPIGetPlayerStats = useCallback((): {
    level: number; experience: number; coins: number; title: string;
    shadowLevel: number; dreamLevel: number; creaturesDefeated: number;
    soulsCollected: number; nightmaresBanished: number; dreamsWoven: number;
    totalFearEndured: number; weaponsOwned: number; powersUnlocked: number;
    achievements: number; dailyPatrols: number;
  } => {
    return {
      level: nmAPIState.level,
      experience: nmAPIState.experience,
      coins: nmAPIState.coins,
      title: nmAPIState.title,
      shadowLevel: nmAPIState.shadowManipulationLevel,
      dreamLevel: nmAPIState.dreamWeavingLevel,
      creaturesDefeated: nmAPIState.totalCreaturesDefeated,
      soulsCollected: nmAPIState.totalSoulsCollected,
      nightmaresBanished: nmAPIState.totalNightmaresBanished,
      dreamsWoven: nmAPIState.totalDreamsWoven,
      totalFearEndured: nmAPIState.totalFearEndured,
      weaponsOwned: nmAPIState.weaponsOwned.length,
      powersUnlocked: nmAPIState.powersUnlocked.length,
      achievements: nmAPIState.achievements.length,
      dailyPatrols: nmAPIState.dailyPatrolsCompleted,
    };
  }, [nmAPIState]);

  const nmAPIGetCombatStatus = useCallback((): {
    inCombat: boolean; creatureName: string | null; creatureHpPercent: number;
    playerFearPercent: number; turnsElapsed: number; isBanishing: boolean;
    banishPercent: number;
  } => {
    const c = nmAPIState.combat;
    return {
      inCombat: c.activeCreature !== null,
      creatureName: c.activeCreature ? (NM_CREATURE_DATA[c.activeCreature]?.name ?? c.activeCreature) : null,
      creatureHpPercent: c.creatureMaxHp > 0 ? Math.floor((c.creatureHp / c.creatureMaxHp) * 100) : 0,
      playerFearPercent: c.maxFear > 0 ? Math.floor((c.playerFear / c.maxFear) * 100) : 0,
      turnsElapsed: c.turnsElapsed,
      isBanishing: c.isBanishing,
      banishPercent: c.banishTarget > 0 ? Math.floor((c.banishProgress / c.banishTarget) * 100) : 0,
    };
  }, [nmAPIState.combat]);

  const nmAPIGetTotalSoulCount = useCallback((): number => {
    return Object.values(nmAPIState.souls).reduce((sum, count) => sum + count, 0);
  }, [nmAPIState.souls]);

  const nmAPICalculateDamage = useCallback((baseDamage: number): number => {
    const wd = nmAPIState.equippedWeapon ? NM_WEAPON_DATA[nmAPIState.equippedWeapon] : null;
    const weaponDmg = wd ? wd.baseDamage : 5;
    const total = weaponDmg + baseDamage + (nmAPIState.level * 2) + (nmAPIState.shadowManipulationLevel * 3);
    const eventMult = nmAPIState.eventState.activeEvent ? (NM_EVENT_DATA[nmAPIState.eventState.activeEvent]?.creatureBoost ?? 1) : 1;
    return Math.floor(total * eventMult);
  }, [nmAPIState.equippedWeapon, nmAPIState.level, nmAPIState.shadowManipulationLevel, nmAPIState.eventState.activeEvent]);

  const nmAPIGetActiveEventBonuses = useCallback((): {
    creatureBoost: number; coinMultiplier: number; xpMultiplier: number;
  } => {
    if (!nmAPIState.eventState.activeEvent) {
      return { creatureBoost: 1, coinMultiplier: 1, xpMultiplier: 1 };
    }
    const ed = NM_EVENT_DATA[nmAPIState.eventState.activeEvent];
    if (!ed) return { creatureBoost: 1, coinMultiplier: 1, xpMultiplier: 1 };
    return { creatureBoost: ed.creatureBoost, coinMultiplier: ed.coinMultiplier, xpMultiplier: ed.xpMultiplier };
  }, [nmAPIState.eventState.activeEvent]);

  const nmAPILogSeeds = useCallback((): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const creatureId of nmAPIState.encounteredCreatures) {
      const cd = NM_CREATURE_DATA[creatureId];
      if (cd) map[creatureId] = cd.soulDrop;
    }
    return map;
  }, [nmAPIState.encounteredCreatures]);

  // ----------------------------------------------------------
  // Effect — daily patrol auto-reset on mount
  // ----------------------------------------------------------

  useEffect(() => {
    nmAPIResetDailyPatrol();
  }, [nmAPIResetDailyPatrol]);

  // ----------------------------------------------------------
  // Return object — all functions exposed as nmAPI
  // ----------------------------------------------------------

  return {
    // State accessors
    nmAPIState,
    nmAPIEquippedWeaponData,
    nmAPIEquippedDamage,
    nmAPIActiveCreatureData,
    nmAPIZoneProgress,
    nmAPIBestiaryProgress,
    nmAPIWeaponCollectionProgress,
    nmAPIPowerCollectionProgress,
    nmAPIAchievementProgress,
    nmAPIAvailableCreatures,

    // Data lookups
    nmAPIGetZoneData,
    nmAPIGetCreatureData,
    nmAPIGetWeaponData,
    nmAPIGetPowerData,
    nmAPIGetEventData,
    nmAPIGetAchievementData,
    nmAPIGetRarityMultiplier,
    nmAPIRarityLabel,
    nmAPIXpForNextLevel,
    nmAPIGetZoneCreatures,

    // Status checks
    nmAPIIsInCombat,
    nmAPICanEnterZone,
    nmAPICanPurchaseWeapon,
    nmAPICanUnlockPower,
    nmAPIGetPlayerStats,
    nmAPIGetCombatStatus,
    nmAPIGetTotalSoulCount,
    nmAPIGetAvailableTitles,
    nmAPICalculateDamage,
    nmAPIGetActiveEventBonuses,
    nmAPILogSeeds,

    // Zone & Exploration
    nmAPIChangeZone,
    nmAPIExploreZone,
    nmAPIEncounterCreature,

    // Combat
    nmAPIAttackCreature,
    nmAPIFleeCombat,
    nmAPIUseDreamPower,
    nmAPIReduceFear,

    // Weapons & Powers
    nmAPIPurchaseWeapon,
    nmAPIEquipWeapon,
    nmAPIUnlockPower,
    nmAPIUpgradePower,

    // Dream Weaving
    nmAPIStartDreamWeaving,
    nmAPIAdvanceWeaving,
    nmAPICancelWeaving,

    // Shadow Manipulation
    nmAPIManipulateShadow,

    // Soul Collection
    nmAPISpendSouls,
    nmAPITradeSoulsForCoins,

    // Nightmare Banishing
    nmAPIStartBanishing,
    nmAPIAdvanceBanish,

    // Daily Dream Patrol
    nmAPIStartPatrol,
    nmAPICancelPatrol,
    nmAPIClaimPatrolReward,
    nmAPIResetDailyPatrol,

    // Events
    nmAPIStartEvent,
    nmAPIAdvanceEvent,
    nmAPICompleteEvent,
    nmAPIClaimEventReward,

    // Titles & Utility
    nmAPISelectTitle,

    // Save / Load / Reset
    nmAPIResetState,
    nmAPILoadState,
    nmAPIGetSnapshot,
  };
}
