'use client';

/* ═══════════════════════════════════════════════════════════════════════════════
 * JADE TEMPLE WIRE — 玉殿
 * An ancient celestial temple carved from living jade, where dragon monks train.
 * Prefix: jt / JT_  |  Hook: useJadeTemple  |  Save key: jade-temple-save
 * ═══════════════════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §1 — TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type JtRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type JtSpecies =
  | 'jade_dragon'
  | 'stone_monk'
  | 'crystal_guardian'
  | 'wind_sage'
  | 'thunder_paladin'
  | 'mist_healer'
  | 'earth_golem';

export type JtAction =
  | 'train'
  | 'meditate'
  | 'sculpt'
  | 'chant'
  | 'heal'
  | 'enchant'
  | 'ascend';

export type JtAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

export type JtChamberStatus = 'locked' | 'available' | 'active' | 'cleared';

export type JtEventStatus = 'idle' | 'active' | 'completed' | 'expired';

export type JtStructureCategory =
  | 'training'
  | 'resource'
  | 'defense'
  | 'spiritual';

interface JtSpeciesDef {
  readonly id: JtSpecies;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly color: string;
  readonly affinity: JtAbilityCategory;
}

interface JtCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: JtSpecies;
  readonly rarity: JtRarity;
  readonly tier: number;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

interface JtChamberDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly level: number;
  readonly resources: { type: string; amount: number }[];
  readonly capacity: number;
  readonly unlockLevel: number;
  readonly ambientColor: string;
  readonly dangerLevel: number;
}

interface JtMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: JtRarity;
  readonly value: number;
  readonly stackable: boolean;
  readonly maxStack: number;
}

interface JtStructureDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly category: JtStructureCategory;
  readonly maxLevel: number;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly effectsPerLevel: Record<string, number>;
}

interface JtAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly category: JtAbilityCategory;
  readonly manaCost: number;
  readonly cooldown: number;
  readonly power: number;
  readonly unlockLevel: number;
  readonly requiredSpecies?: JtSpecies;
}

interface JtAchievementDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly condition: string;
  readonly reward: { type: string; amount: number };
  readonly hidden: boolean;
}

interface JtTitleDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly bonus: Record<string, number>;
}

interface JtArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: JtRarity;
  readonly effect: string;
  readonly power: number;
  readonly cost: number;
}

interface JtEventDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly duration: number;
  readonly reward: { type: string; amount: number };
  readonly requirement: string;
}

// ── Owned / runtime state types ────────────────────────────────────────────

interface JtOwnedCreature {
  readonly creatureId: string;
  instanceId: string;
  nickname: string;
  level: number;
  xp: number;
  bonded: boolean;
  equipped: boolean;
  acquiredAt: number;
}

interface JtInventorySlot {
  readonly materialId: string;
  quantity: number;
}

interface JtStructureInstance {
  readonly structureId: string;
  level: number;
  builtAt: number;
}

interface JtAbilityState {
  readonly abilityId: string;
  unlocked: boolean;
  cooldownRemaining: number;
  totalUses: number;
}

interface JtChamberProgress {
  readonly chamberId: string;
  status: JtChamberStatus;
  timesVisited: number;
  bestScore: number;
  lastVisited: number | null;
}

interface JtArtifactInstance {
  readonly artifactId: string;
  equipped: boolean;
  acquiredAt: number;
  enhancementLevel: number;
}

interface JtEventState {
  readonly eventId: string;
  status: JtEventStatus;
  startedAt: number | null;
  progress: number;
  rewardClaimed: boolean;
}

interface JtPlayerStats {
  totalWordsTyped: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalActionsPerformed: number;
  totalCreaturesCollected: number;
  totalChambersCleared: number;
  totalAchievementsUnlocked: number;
  totalAscensions: number;
  longestStreak: number;
  currentStreak: number;
}

interface JtPlayerTitle {
  readonly titleId: string;
  unlocked: boolean;
  unlockedAt: number | null;
  isActive: boolean;
}

export interface JtGameState {
  version: number;
  playerName: string;
  activeTitleId: string;
  level: number;
  xp: number;
  coins: number;
  mana: number;
  maxMana: number;
  creatures: JtOwnedCreature[];
  materials: JtInventorySlot[];
  structures: JtStructureInstance[];
  abilities: JtAbilityState[];
  chamberProgress: JtChamberProgress[];
  artifacts: JtArtifactInstance[];
  events: JtEventState[];
  titles: JtPlayerTitle[];
  achievements: string[];
  stats: JtPlayerStats;
  lastSaveAt: number;
  createdAt: number;
  settings: JtSettings;
  dailyRewardClaimed: boolean;
  lastDailyRewardDate: string;
}

export interface JtSettings {
  sfxEnabled: boolean;
  ambientEnabled: boolean;
  particlesEnabled: boolean;
  autoTrainEnabled: boolean;
  notificationEnabled: boolean;
  themeAccent: string;
}

export interface JtNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'event';
  message: string;
  timestamp: number;
  dismissed: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §2 — JT_ CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_SAVE_KEY = 'jade-temple-save';
export const JT_VERSION = 1;
export const JT_MAX_LEVEL = 50;
export const JT_STARTING_COINS = 500;
export const JT_STARTING_XP = 0;
export const JT_STARTING_MANA = 100;
export const JT_MAX_MANA_BASE = 100;
export const JT_MANA_REGEN_RATE = 1;
export const JT_XP_PER_LEVEL = 200;
export const JT_XP_LEVEL_MULTIPLIER = 1.15;
export const JT_CREATURE_SLOTS_BASE = 6;
export const JT_CREATURE_SLOTS_PER_LEVEL = 1;
export const JT_COIN_ACTION_REWARD = 10;
export const JT_XP_ACTION_REWARD = 15;
export const JT_MANA_ACTION_COST = 5;
export const JT_ASCENSION_MIN_LEVEL = 10;
export const JT_ASCENSION_XP_BONUS = 0.1;
export const JT_ASCENSION_COST = 1000;
export const JT_BOND_THRESHOLD = 5;
export const JT_MAX_NOTIFICATIONS = 50;
export const JT_EVENT_TICK_INTERVAL = 60000;
export const JT_AUTO_SAVE_INTERVAL = 30000;
export const JT_STREAK_DECAY_HOURS = 24;
export const JT_STARTER_CREATURE_ID = 'whelp_of_verdant_jade';
export const JT_STARTER_CHAMBER_ID = 'jade_courtyard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §3 — COLOR THEME CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_COLORS = {
  jadeGreen: '#00A86B',
  templeGold: '#DAA520',
  celestialWhite: '#FAFAFA',
  dragonRed: '#DC143C',
  mistBlue: '#87CEEB',
  stoneGray: '#808080',
  incensePurple: '#9370DB',
  // Extended palette
  deepJade: '#006B3F',
  paleJade: '#7DCEA0',
  darkGold: '#B8860B',
  brightGold: '#FFD700',
  crimsonVein: '#8B0000',
  softBlue: '#B0E0E6',
  slateGray: '#708090',
  warmWhite: '#FFF8F0',
  shadowJade: '#004D29',
  emberGlow: '#FF6347',
  spiritMist: '#E0FFFF',
  obsidianBlack: '#1A1A2E',
  parchmentBeige: '#F5F5DC',
} as const;

export const JT_RARITY_COLORS: Record<JtRarity, string> = {
  common: JT_COLORS.stoneGray,
  uncommon: JT_COLORS.jadeGreen,
  rare: JT_COLORS.mistBlue,
  epic: JT_COLORS.incensePurple,
  legendary: JT_COLORS.templeGold,
};

export const JT_RARITY_BG: Record<JtRarity, string> = {
  common: 'rgba(128,128,128,0.12)',
  uncommon: 'rgba(0,168,107,0.12)',
  rare: 'rgba(135,206,235,0.12)',
  epic: 'rgba(147,112,219,0.12)',
  legendary: 'rgba(218,165,32,0.15)',
};

export const JT_SPECIES_COLORS: Record<JtSpecies, string> = {
  jade_dragon: JT_COLORS.jadeGreen,
  stone_monk: JT_COLORS.stoneGray,
  crystal_guardian: JT_COLORS.mistBlue,
  wind_sage: JT_COLORS.paleJade,
  thunder_paladin: JT_COLORS.dragonRed,
  mist_healer: JT_COLORS.incensePurple,
  earth_golem: JT_COLORS.darkGold,
};

export const JT_ACTION_COLORS: Record<JtAction, string> = {
  train: JT_COLORS.dragonRed,
  meditate: JT_COLORS.incensePurple,
  sculpt: JT_COLORS.stoneGray,
  chant: JT_COLORS.templeGold,
  heal: JT_COLORS.mistBlue,
  enchant: JT_COLORS.jadeGreen,
  ascend: JT_COLORS.brightGold,
};

export const JT_GRADIENT_TEMPLE = `linear-gradient(135deg, ${JT_COLORS.shadowJade}, ${JT_COLORS.jadeGreen}, ${JT_COLORS.templeGold})`;
export const JT_GRADIENT_CELESTIAL = `linear-gradient(180deg, ${JT_COLORS.celestialWhite}, ${JT_COLORS.spiritMist}, ${JT_COLORS.mistBlue})`;
export const JT_GRADIENT_DRACONIC = `linear-gradient(135deg, ${JT_COLORS.dragonRed}, ${JT_COLORS.emberGlow}, ${JT_COLORS.templeGold})`;
export const JT_GRADIENT_SHADOW = `linear-gradient(180deg, ${JT_COLORS.obsidianBlack}, ${JT_COLORS.shadowJade}, ${JT_COLORS.deepJade})`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §4 — JT_SPECIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_SPECIES: readonly JtSpeciesDef[] = [
  {
    id: 'jade_dragon',
    name: 'Jade Dragon',
    description:
      'Ancient wyrms born from the heart of living jade mountains, breathing qi-infused mist.',
    lore: 'When the Jade Emperor first shaped the temple, he carved from his own scales to give life to the dragons that would guard its halls for eternity.',
    emoji: '🐲',
    color: JT_COLORS.jadeGreen,
    affinity: 'offensive',
  },
  {
    id: 'stone_monk',
    name: 'Stone Monk',
    description:
      'Disciplined ascetics who meditate for centuries until their very flesh becomes granite.',
    lore: 'The Stone Monks took a vow of stillness so profound that the mountains themselves rose to embrace them, granting bodies of eternal stone.',
    emoji: '🪨',
    color: JT_COLORS.stoneGray,
    affinity: 'defensive',
  },
  {
    id: 'crystal_guardian',
    name: 'Crystal Guardian',
    description:
      'Sentinels of prismatic crystal that refract attacks into harmless rainbows of light.',
    lore: 'Forged in the refraction chambers beneath the temple, these guardians see all angles of truth simultaneously.',
    emoji: '💎',
    color: JT_COLORS.mistBlue,
    affinity: 'defensive',
  },
  {
    id: 'wind_sage',
    name: 'Wind Sage',
    description:
      'Ethereal scholars who ride the celestial winds and transcribe the language of storms.',
    lore: 'The Wind Sages learned to read the sky before they learned to walk, and their scrolls contain the whispers of every breeze since creation.',
    emoji: '🌪️',
    color: JT_COLORS.paleJade,
    affinity: 'utility',
  },
  {
    id: 'thunder_paladin',
    name: 'Thunder Paladin',
    description:
      'Holy warriors charged with celestial lightning, striking with righteous fury.',
    lore: 'Anointed by the Jade Emperor in storms of divine origin, each Thunder Paladin carries a fragment of heaven\'s wrath within their halberd.',
    emoji: '⚡',
    color: JT_COLORS.dragonRed,
    affinity: 'offensive',
  },
  {
    id: 'mist_healer',
    name: 'Mist Healer',
    description:
      'Compassionate spirits who weave healing mists from dew collected at dawn on jade lotus petals.',
    lore: 'Born where temple incense meets morning mist, these healers can mend wounds that even the gods thought impossible to cure.',
    emoji: '🌿',
    color: JT_COLORS.incensePurple,
    affinity: 'utility',
  },
  {
    id: 'earth_golem',
    name: 'Earth Golem',
    description:
      'Colossal constructs animated by the temple\'s geomantic currents, unshakeable and unbreakable.',
    lore: 'The temple architects buried sacred jade tablets deep within the earth, and from those tablets arose the Golems — the eternal foundations of the temple.',
    emoji: '🗿',
    color: JT_COLORS.darkGold,
    affinity: 'defensive',
  },
] as const;

export const JT_SPECIES_MAP: Record<JtSpecies, JtSpeciesDef> = Object.fromEntries(
  JT_SPECIES.map((s) => [s.id, s])
) as Record<JtSpecies, JtSpeciesDef>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §5 — JT_CREATURES (35 creatures — 5 tiers × 7 species)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_CREATURES: readonly JtCreatureDef[] = [
  // ── Tier 1: Common ──────────────────────────────────────────────────────
  {
    id: 'whelp_of_verdant_jade',
    name: 'Whelp of Verdant Jade',
    species: 'jade_dragon',
    rarity: 'common',
    tier: 1,
    description: 'A tiny dragon hatchling with scales like fresh morning dew on jade leaves.',
    lore: 'The first breath of a jade whelp smells of lotus blossoms and ancient stone.',
    emoji: '🐣',
    power: 10,
    defense: 8,
    cost: 100,
    xpReward: 12,
  },
  {
    id: 'pebble_acolyte',
    name: 'Pebble Acolyte',
    species: 'stone_monk',
    rarity: 'common',
    tier: 1,
    description: 'A young monk whose skin has begun the slow transformation to living granite.',
    lore: 'The Pebble Acolytes train by standing perfectly still during thunderstorms.',
    emoji: '🪨',
    power: 8,
    defense: 12,
    cost: 80,
    xpReward: 10,
  },
  {
    id: 'shard_watcher',
    name: 'Shard Watcher',
    species: 'crystal_guardian',
    rarity: 'common',
    tier: 1,
    description: 'A small crystalline entity that vibrates with protective resonance.',
    lore: 'Shard Watchers are born when temple prayers condense into physical form.',
    emoji: '✨',
    power: 7,
    defense: 14,
    cost: 90,
    xpReward: 11,
  },
  {
    id: 'breeze_scholar',
    name: 'Breeze Scholar',
    species: 'wind_sage',
    rarity: 'common',
    tier: 1,
    description: 'A diminutive sage who floats on the gentlest temple drafts.',
    lore: 'The Breeze Scholar knows every secret carried on the wind since the temple was built.',
    emoji: '🍃',
    power: 9,
    defense: 6,
    cost: 85,
    xpReward: 13,
  },
  {
    id: 'spark_initiate',
    name: 'Spark Initiate',
    species: 'thunder_paladin',
    rarity: 'common',
    tier: 1,
    description: 'A young warrior with faint crackling arcs of lightning across their armor.',
    lore: 'Every Spark Initiate dreams of the day their first true thunderbolt will echo through the halls.',
    emoji: '⚡',
    power: 13,
    defense: 7,
    cost: 110,
    xpReward: 14,
  },
  {
    id: 'dew_mender',
    name: 'Dew Mender',
    species: 'mist_healer',
    rarity: 'common',
    tier: 1,
    description: 'A gentle spirit that gathers healing dew from lotus petals at first light.',
    lore: 'Where the Dew Mender walks, wilted flowers bloom and weary travelers feel their burdens lift.',
    emoji: '💧',
    power: 5,
    defense: 10,
    cost: 75,
    xpReward: 10,
  },
  {
    id: 'clod_sentinel',
    name: 'Clod Sentinel',
    species: 'earth_golem',
    rarity: 'common',
    tier: 1,
    description: 'A small golem assembled from sacred temple earth and bound by jade runes.',
    lore: 'Even the smallest Clod Sentinel has stood guard for a thousand years without rest.',
    emoji: '🟤',
    power: 11,
    defense: 15,
    cost: 120,
    xpReward: 12,
  },

  // ── Tier 2: Uncommon ────────────────────────────────────────────────────
  {
    id: 'jade_serpent',
    name: 'Jade Serpent',
    species: 'jade_dragon',
    rarity: 'uncommon',
    tier: 2,
    description: 'A serpentine dragon that coils through the temple rafters, guarding wisdom.',
    lore: 'The Jade Serpent can taste lies on the wind and coils tighter when deception is near.',
    emoji: '🐍',
    power: 18,
    defense: 15,
    cost: 300,
    xpReward: 22,
  },
  {
    id: 'granite_disciple',
    name: 'Granite Disciple',
    species: 'stone_monk',
    rarity: 'uncommon',
    tier: 2,
    description: 'A monk whose meditation has hardened their body into polished granite.',
    lore: 'The Granite Disciple once mediated so deeply that an entire army marched past without noticing.',
    emoji: '🧘',
    power: 14,
    defense: 22,
    cost: 280,
    xpReward: 20,
  },
  {
    id: 'prism_defender',
    name: 'Prism Defender',
    species: 'crystal_guardian',
    rarity: 'uncommon',
    tier: 2,
    description: 'A multifaceted guardian that splits incoming attacks across its crystal facets.',
    lore: 'The Prism Defender catches malevolent energies and transforms them into warm temple light.',
    emoji: '🔷',
    power: 13,
    defense: 25,
    cost: 310,
    xpReward: 21,
  },
  {
    id: 'gale_reader',
    name: 'Gale Reader',
    species: 'wind_sage',
    rarity: 'uncommon',
    tier: 2,
    description: 'A sage who channels gale-force winds to carry knowledge across vast distances.',
    lore: 'The Gale Reader once transcribed a thousand sutras in a single afternoon using wind alone.',
    emoji: '🌬️',
    power: 17,
    defense: 12,
    cost: 260,
    xpReward: 24,
  },
  {
    id: 'storm_squire',
    name: 'Storm Squire',
    species: 'thunder_paladin',
    rarity: 'uncommon',
    tier: 2,
    description: 'A determined warrior whose blade hums with gathering storm energy.',
    lore: 'The Storm Squire\'s training grounds are permanently scorched by miniature lightning strikes.',
    emoji: '🌩️',
    power: 22,
    defense: 14,
    cost: 320,
    xpReward: 25,
  },
  {
    id: 'mist_weaver',
    name: 'Mist Weaver',
    species: 'mist_healer',
    rarity: 'uncommon',
    tier: 2,
    description: 'A healer who shapes mist into intricate patterns that mend body and spirit.',
    lore: 'The Mist Weaver can heal an entire temple hall with a single spiraling breath of incense mist.',
    emoji: '🌫️',
    power: 10,
    defense: 18,
    cost: 270,
    xpReward: 20,
  },
  {
    id: 'boulder_warden',
    name: 'Boulder Warden',
    species: 'earth_golem',
    rarity: 'uncommon',
    tier: 2,
    description: 'A stout golem carved with protective warding sigils that glow faintly at dawn.',
    lore: 'Boulder Wardens mark their territory with standing stones that sing when the temple is in danger.',
    emoji: '⛰️',
    power: 20,
    defense: 28,
    cost: 350,
    xpReward: 23,
  },

  // ── Tier 3: Rare ────────────────────────────────────────────────────────
  {
    id: 'emerald_wyrm',
    name: 'Emerald Wyrm',
    species: 'jade_dragon',
    rarity: 'rare',
    tier: 3,
    description: 'A magnificent dragon whose emerald scales pulse with the temple\'s life force.',
    lore: 'The Emerald Wyrm is said to be the living heart of the jade mountain itself, dreaming the temple into existence.',
    emoji: '🐉',
    power: 30,
    defense: 25,
    cost: 800,
    xpReward: 40,
  },
  {
    id: 'basalt_master',
    name: 'Basalt Master',
    species: 'stone_monk',
    rarity: 'rare',
    tier: 3,
    description: 'A legendary monk who has transcended flesh entirely, existing as sentient basalt.',
    lore: 'The Basalt Master teaches that the strongest wall is not one that blocks, but one that absorbs.',
    emoji: '🗿',
    power: 24,
    defense: 38,
    cost: 750,
    xpReward: 38,
  },
  {
    id: 'diamond_sentinel',
    name: 'Diamond Sentinel',
    species: 'crystal_guardian',
    rarity: 'rare',
    tier: 3,
    description: 'An impenetrable guardian of pure diamond that radiates prismatic defensive auras.',
    lore: 'The Diamond Sentinel was once a single grain of temple sand that refused to yield under divine pressure.',
    emoji: '💠',
    power: 22,
    defense: 42,
    cost: 820,
    xpReward: 39,
  },
  {
    id: 'tempest_sage',
    name: 'Tempest Sage',
    species: 'wind_sage',
    rarity: 'rare',
    tier: 3,
    description: 'A master sage who commands the tempest and writes prophecies on storm clouds.',
    lore: 'The Tempest Sage\'s prophecies are written in lightning and read only by those who have weathered great storms.',
    emoji: '🌪️',
    power: 28,
    defense: 20,
    cost: 700,
    xpReward: 42,
  },
  {
    id: 'thunder_knight',
    name: 'Thunder Knight',
    species: 'thunder_paladin',
    rarity: 'rare',
    tier: 3,
    description: 'A fearsome warrior encased in storm-forged armor crackling with raw electricity.',
    lore: 'When the Thunder Knight charges, the sky itself splits open to lend its fury to the assault.',
    emoji: '⚔️',
    power: 38,
    defense: 22,
    cost: 850,
    xpReward: 44,
  },
  {
    id: 'aurora_mystic',
    name: 'Aurora Mystic',
    species: 'mist_healer',
    rarity: 'rare',
    tier: 3,
    description: 'A transcendent healer whose mists shimmer with auroral light, mending the gravest wounds.',
    lore: 'The Aurora Mystic\'s healing mists are visible from the highest peaks, a beacon of hope across the celestial realm.',
    emoji: '🌈',
    power: 16,
    defense: 30,
    cost: 720,
    xpReward: 38,
  },
  {
    id: 'marble_colossus',
    name: 'Marble Colossus',
    species: 'earth_golem',
    rarity: 'rare',
    tier: 3,
    description: 'A towering golem of sacred marble inscribed with the temple\'s founding decrees.',
    lore: 'The Marble Colossus predates the temple itself — the temple was built around it as a form of worship.',
    emoji: '🏛️',
    power: 35,
    defense: 45,
    cost: 880,
    xpReward: 40,
  },

  // ── Tier 4: Epic ────────────────────────────────────────────────────────
  {
    id: 'jade_sovereign',
    name: 'Jade Sovereign',
    species: 'jade_dragon',
    rarity: 'epic',
    tier: 4,
    description: 'A regal dragon sovereign whose presence causes jade to grow and bloom across the temple.',
    lore: 'The Jade Sovereign\'s roar is the sound of mountains being born. When it sleeps, new temples arise.',
    emoji: '👑',
    power: 48,
    defense: 40,
    cost: 2000,
    xpReward: 70,
  },
  {
    id: 'obsidian_saint',
    name: 'Obsidian Saint',
    species: 'stone_monk',
    rarity: 'epic',
    tier: 4,
    description: 'A saintly figure of living obsidian who has achieved enlightenment through eternal stillness.',
    lore: 'The Obsidian Saint meditated for ten thousand years. When they opened their eyes, the universe held its breath.',
    emoji: '⚓',
    power: 38,
    defense: 58,
    cost: 1900,
    xpReward: 65,
  },
  {
    id: 'starfire_crystal',
    name: 'Starfire Crystal',
    species: 'crystal_guardian',
    rarity: 'epic',
    tier: 4,
    description: 'A celestial guardian infused with starfire, blazing with protective cosmic energy.',
    lore: 'The Starfire Crystal fell from the heavens as a meteorite, and the temple\'s prayers gave it consciousness.',
    emoji: '🌟',
    power: 35,
    defense: 62,
    cost: 2100,
    xpReward: 68,
  },
  {
    id: 'zephyr_prophet',
    name: 'Zephyr Prophet',
    species: 'wind_sage',
    rarity: 'epic',
    tier: 4,
    description: 'An ancient prophet who rides the zephyrs of creation itself, reading fate in the wind.',
    lore: 'The Zephyr Prophet once warned the Jade Emperor of a catastrophe three thousand years before it happened.',
    emoji: '🔮',
    power: 45,
    defense: 32,
    cost: 1800,
    xpReward: 72,
  },
  {
    id: 'divine_thunderlord',
    name: 'Divine Thunderlord',
    species: 'thunder_paladin',
    rarity: 'epic',
    tier: 4,
    description: 'A divine paladin who commands heavenly thunder, their very gaze strikes like lightning.',
    lore: 'The Divine Thunderlord\'s armor was forged in the heart of a dying star and quenched in the Jade Emperor\'s tears.',
    emoji: '🔱',
    power: 58,
    defense: 35,
    cost: 2200,
    xpReward: 75,
  },
  {
    id: 'celestial_mender',
    name: 'Celestial Mender',
    species: 'mist_healer',
    rarity: 'epic',
    tier: 4,
    description: 'A celestial being whose healing mists can restore life to stone and bring rain to deserts.',
    lore: 'The Celestial Mender once healed a crack in the sky itself, stitching the heavens with luminous mist.',
    emoji: '✨',
    power: 25,
    defense: 48,
    cost: 1850,
    xpReward: 65,
  },
  {
    id: 'jade_terramaker',
    name: 'Jade Terramaker',
    species: 'earth_golem',
    rarity: 'epic',
    tier: 4,
    description: 'A mythical golem that shapes continents, with the temple eternally growing upon its shoulders.',
    lore: 'The Jade Terramaker is so vast that its footprints became lakes and its shadows became forests.',
    emoji: '🌋',
    power: 55,
    defense: 68,
    cost: 2300,
    xpReward: 70,
  },

  // ── Tier 5: Legendary ──────────────────────────────────────────────────
  {
    id: 'long_wang_the_jade_emperor_dragon',
    name: 'Long Wang, the Jade Emperor Dragon',
    species: 'jade_dragon',
    rarity: 'legendary',
    tier: 5,
    description: 'The primordial dragon of jade, embodiment of the temple\'s eternal will and infinite power.',
    lore: 'Before the temple existed, before jade was named, Long Wang dreamed of sanctuary — and the temple became his dream made real.',
    emoji: '🐲',
    power: 80,
    defense: 70,
    cost: 5000,
    xpReward: 120,
  },
  {
    id: 'mountain_of_contemplation',
    name: 'Mountain of Contemplation',
    species: 'stone_monk',
    rarity: 'legendary',
    tier: 5,
    description: 'A monk who became a mountain and a mountain that became a monk — beyond mortal comprehension.',
    lore: 'Pilgrims walk for months to touch the Mountain of Contemplation. Those who reach the summit find only silence, and it is enough.',
    emoji: '🏔️',
    power: 60,
    defense: 95,
    cost: 4800,
    xpReward: 110,
  },
  {
    id: 'the_heart_of_crystal_dawn',
    name: 'The Heart of Crystal Dawn',
    species: 'crystal_guardian',
    rarity: 'legendary',
    tier: 5,
    description: 'The original crystal from which all temple guardians were born, holding infinite defensive power.',
    lore: 'The Heart of Crystal Dawn was the first solid thing to exist in the celestial void. Every crystal in the universe echoes its resonance.',
    emoji: '💠',
    power: 55,
    defense: 100,
    cost: 5200,
    xpReward: 115,
  },
  {
    id: 'voice_of_the_infinite_wind',
    name: 'Voice of the Infinite Wind',
    species: 'wind_sage',
    rarity: 'legendary',
    tier: 5,
    description: 'The primordial wind that carried the Jade Emperor\'s first words across the universe.',
    lore: 'The Infinite Wind has whispered every truth ever spoken and will whisper every truth yet to come. To hear it is to know everything.',
    emoji: '🌪️',
    power: 75,
    defense: 50,
    cost: 4600,
    xpReward: 125,
  },
  {
    id: 'heavens_wrath_incarnate',
    name: "Heaven's Wrath Incarnate",
    species: 'thunder_paladin',
    rarity: 'legendary',
    tier: 5,
    description: 'The mortal vessel of heaven\'s ultimate judgment, wielding the fury of ten thousand storms.',
    lore: "Heaven's Wrath was not chosen — they chose heaven. When divine justice faltered, a single mortal raised their blade and became the storm.",
    emoji: '⚡',
    power: 100,
    defense: 55,
    cost: 5500,
    xpReward: 130,
  },
  {
    id: 'lotus_of_eternal_restoration',
    name: 'Lotus of Eternal Restoration',
    species: 'mist_healer',
    rarity: 'legendary',
    tier: 5,
    description: 'The mythical lotus that blooms at the center of all healing mists, capable of restoring anything.',
    lore: 'The Lotus of Eternal Restoration blooms once every eon. Its petals taste of forgiveness and its fragrance is the memory of wholeness.',
    emoji: '🪷',
    power: 40,
    defense: 80,
    cost: 4900,
    xpReward: 110,
  },
  {
    id: 'world_foundation',
    name: 'World Foundation',
    species: 'earth_golem',
    rarity: 'legendary',
    tier: 5,
    description: 'The primordial golem upon whose back the entire celestial temple and its realm were built.',
    lore: 'The World Foundation does not move because it does not need to. Everything moves around it, and in doing so, pays it homage.',
    emoji: '🌏',
    power: 90,
    defense: 110,
    cost: 5800,
    xpReward: 120,
  },
] as const;

export const JT_CREATURE_MAP: Record<string, JtCreatureDef> = Object.fromEntries(
  JT_CREATURES.map((c) => [c.id, c])
);

export const JT_CREATURES_BY_SPECIES: Record<JtSpecies, JtCreatureDef[]> = Object.fromEntries(
  JT_SPECIES.map((s) => [s.id, JT_CREATURES.filter((c) => c.species === s.id)])
) as Record<JtSpecies, JtCreatureDef[]>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §6 — JT_CHAMBERS (8 temple halls)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_CHAMBERS: readonly JtChamberDef[] = [
  {
    id: 'jade_courtyard',
    name: 'Jade Courtyard',
    description: 'The open-air entry plaza where novices take their first steps on the jade path.',
    lore: 'Every great master once stood in this very courtyard, feeling the cool jade beneath their feet for the first time.',
    emoji: '🏯',
    level: 1,
    resources: [{ type: 'xp', amount: 15 }, { type: 'coins', amount: 10 }],
    capacity: 3,
    unlockLevel: 1,
    ambientColor: JT_COLORS.jadeGreen,
    dangerLevel: 1,
  },
  {
    id: 'meditation_cavern',
    name: 'Meditation Cavern',
    description: 'A serene underground grotto where crystalline stalactites hum with meditative frequencies.',
    lore: 'The cavern\'s resonance perfectly matches the frequency of enlightened consciousness.',
    emoji: '🧘',
    level: 3,
    resources: [{ type: 'xp', amount: 25 }, { type: 'mana', amount: 20 }],
    capacity: 5,
    unlockLevel: 3,
    ambientColor: JT_COLORS.incensePurple,
    dangerLevel: 2,
  },
  {
    id: 'dragons_training_grounds',
    name: "Dragon's Training Grounds",
    description: 'An amphitheater carved into a jade cliff face where dragon combat techniques are perfected.',
    lore: 'Scorch marks from ancient dragon breath still glow faintly on the walls during full moons.',
    emoji: '⚔️',
    level: 5,
    resources: [{ type: 'xp', amount: 40 }, { type: 'coins', amount: 25 }],
    capacity: 4,
    unlockLevel: 5,
    ambientColor: JT_COLORS.dragonRed,
    dangerLevel: 4,
  },
  {
    id: 'crystal_reflection_hall',
    name: 'Crystal Reflection Hall',
    description: 'A vast hall lined with mirrored crystals that reveal the true nature of all who enter.',
    lore: 'Many who enter see not their own reflection, but the person they could become — or fear becoming.',
    emoji: '🪞',
    level: 8,
    resources: [{ type: 'xp', amount: 55 }, { type: 'mana', amount: 30 }],
    capacity: 6,
    unlockLevel: 8,
    ambientColor: JT_COLORS.mistBlue,
    dangerLevel: 3,
  },
  {
    id: 'storm_peak_sanctum',
    name: 'Storm Peak Sanctum',
    description: 'The highest point of the temple, perpetually shrouded in thunderclouds and crackling energy.',
    lore: 'Lightning strikes the sanctum exactly 108 times each day — a number sacred to the temple.',
    emoji: '🌩️',
    level: 12,
    resources: [{ type: 'xp', amount: 75 }, { type: 'coins', amount: 50 }],
    capacity: 4,
    unlockLevel: 12,
    ambientColor: JT_COLORS.dragonRed,
    dangerLevel: 7,
  },
  {
    id: 'earth_core_vault',
    name: 'Earth Core Vault',
    description: 'A deep underground vault where the temple\'s geomantic energies converge in molten jade pools.',
    lore: 'The jade pools are said to show visions of possible futures to those brave enough to gaze within.',
    emoji: '🌋',
    level: 18,
    resources: [{ type: 'xp', amount: 100 }, { type: 'coins', amount: 75 }, { type: 'material', amount: 2 }],
    capacity: 5,
    unlockLevel: 18,
    ambientColor: JT_COLORS.darkGold,
    dangerLevel: 6,
  },
  {
    id: 'mist_garden_of_whispers',
    name: 'Mist Garden of Whispers',
    description: 'An ethereal garden where healing mists carry the whispered wisdom of ancient healers.',
    lore: 'The garden\'s mists taste of every healing herb that has ever grown, distilled into pure spiritual essence.',
    emoji: '🌸',
    level: 25,
    resources: [{ type: 'xp', amount: 130 }, { type: 'mana', amount: 60 }, { type: 'material', amount: 3 }],
    capacity: 7,
    unlockLevel: 25,
    ambientColor: JT_COLORS.incensePurple,
    dangerLevel: 5,
  },
  {
    id: 'emperor_celestial_throne',
    name: "Emperor's Celestial Throne",
    description: 'The innermost sanctum where the Jade Emperor\'s presence lingers as eternal golden light.',
    lore: 'To stand before the Celestial Throne is to understand that power and compassion are the same thing seen from different angles.',
    emoji: '👑',
    level: 35,
    resources: [{ type: 'xp', amount: 200 }, { type: 'coins', amount: 150 }, { type: 'material', amount: 5 }],
    capacity: 3,
    unlockLevel: 35,
    ambientColor: JT_COLORS.templeGold,
    dangerLevel: 9,
  },
] as const;

export const JT_CHAMBER_MAP: Record<string, JtChamberDef> = Object.fromEntries(
  JT_CHAMBERS.map((c) => [c.id, c])
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §7 — JT_MATERIALS (12 materials)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_MATERIALS: readonly JtMaterialDef[] = [
  {
    id: 'jade_shard',
    name: 'Jade Shard',
    description: 'A fragment of living jade that pulses with the temple\'s energy.',
    lore: 'Every jade shard remembers the moment it was separated from the mountain.',
    emoji: '💚',
    rarity: 'common',
    value: 10,
    stackable: true,
    maxStack: 999,
  },
  {
    id: 'incense_bundle',
    name: 'Incense Bundle',
    description: 'Sacred temple incense that enhances meditation and spiritual focus.',
    lore: 'The recipe for temple incense has been unchanged for ten thousand years.',
    emoji: '🪔',
    rarity: 'common',
    value: 8,
    stackable: true,
    maxStack: 999,
  },
  {
    id: 'prayer_scroll',
    name: 'Prayer Scroll',
    description: 'Ancient scrolls containing sacred chants and protective invocations.',
    lore: 'The ink on prayer scrolls is made from powdered jade mixed with morning dew.',
    emoji: '📜',
    rarity: 'common',
    value: 12,
    stackable: true,
    maxStack: 999,
  },
  {
    id: 'thunder_quartz',
    name: 'Thunder Quartz',
    description: 'A quartz crystal that hums with captured lightning energy.',
    lore: 'Thunder Quartz forms only when lightning strikes the peak of the jade mountain during a celestial alignment.',
    emoji: '⚡',
    rarity: 'uncommon',
    value: 30,
    stackable: true,
    maxStack: 500,
  },
  {
    id: 'spirit_lotus',
    name: 'Spirit Lotus',
    description: 'A lotus flower that never wilts, blooming with pure spiritual essence.',
    lore: 'The Spirit Lotus grows only in the deepest meditation pools, fed by the dreams of sleeping monks.',
    emoji: '🪷',
    rarity: 'uncommon',
    value: 35,
    stackable: true,
    maxStack: 500,
  },
  {
    id: 'dragons_scale',
    name: "Dragon's Scale",
    description: 'An iridescent scale shed by one of the temple\'s guardian dragons.',
    lore: "A dragon's scale contains the memory of every flight its owner ever took across the celestial sky.",
    emoji: '🐲',
    rarity: 'rare',
    value: 80,
    stackable: true,
    maxStack: 100,
  },
  {
    id: 'obsidian_medal',
    name: 'Obsidian Medal',
    description: 'A medal forged from volcanic obsidian, awarded for supreme temple dedication.',
    lore: 'Each Obsidian Medal contains a microcosm of the temple, complete with tiny monks meditating within.',
    emoji: '🎖️',
    rarity: 'rare',
    value: 90,
    stackable: true,
    maxStack: 100,
  },
  {
    id: 'celestial_ink',
    name: 'Celestial Ink',
    description: 'Ink made from the essence of starlight, used to inscribe the most powerful enchantments.',
    lore: 'Words written in Celestial Ink glow with their own light and cannot be erased by any mortal force.',
    emoji: '✒️',
    rarity: 'rare',
    value: 85,
    stackable: true,
    maxStack: 100,
  },
  {
    id: 'phoenix_tear',
    name: 'Phoenix Tear',
    description: 'A crystallized tear from a celestial phoenix, radiating renewal energy.',
    lore: 'Phoenix Tears are so pure that they can cleanse corruption from even the most tainted soul.',
    emoji: '💧',
    rarity: 'epic',
    value: 200,
    stackable: true,
    maxStack: 50,
  },
  {
    id: 'jade_emperor_seal',
    name: 'Jade Emperor Seal',
    description: 'A fragment of the Jade Emperor\'s personal seal, pulsing with divine authority.',
    lore: 'To hold the Jade Emperor\'s Seal is to be heard by heaven itself. Use its power wisely.',
    emoji: '🔏',
    rarity: 'epic',
    value: 250,
    stackable: false,
    maxStack: 1,
  },
  {
    id: 'starlight_thread',
    name: 'Starlight Thread',
    description: 'Thread spun from captured starlight, used in weaving the most powerful temple garments.',
    lore: 'A single strand of Starlight Thread can bind together the fabric of reality itself.',
    emoji: '🧵',
    rarity: 'epic',
    value: 220,
    stackable: true,
    maxStack: 30,
  },
  {
    id: 'world_seed',
    name: 'World Seed',
    description: 'A primordial seed containing the potential for an entire realm, wrapped in jade casing.',
    lore: 'The World Seed is the rarest treasure of the temple. It is said that planting it would create a new universe.',
    emoji: '🌱',
    rarity: 'legendary',
    value: 1000,
    stackable: false,
    maxStack: 1,
  },
] as const;

export const JT_MATERIAL_MAP: Record<string, JtMaterialDef> = Object.fromEntries(
  JT_MATERIALS.map((m) => [m.id, m])
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §8 — JT_STRUCTURES (8 structures, upgradeable to level 10)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_STRUCTURES: readonly JtStructureDef[] = [
  {
    id: 'training_pavilion',
    name: 'Training Pavilion',
    description: 'An open-air pavilion where creatures hone their combat skills through guided exercises.',
    lore: 'The Training Pavilion\'s jade floor absorbs impact, making it impossible to injure oneself while training.',
    emoji: '🏋️',
    category: 'training',
    maxLevel: 10,
    baseCost: 200,
    costMultiplier: 1.5,
    effectsPerLevel: { powerBonus: 2, xpMultiplier: 0.05 },
  },
  {
    id: 'meditation_shrine',
    name: 'Meditation Shrine',
    description: 'A serene shrine that amplifies mana regeneration and spiritual clarity.',
    lore: 'The Meditation Shrine\'s incense is replenished by the prayers of past monks, forever burning.',
    emoji: '🕯️',
    category: 'spiritual',
    maxLevel: 10,
    baseCost: 250,
    costMultiplier: 1.6,
    effectsPerLevel: { manaRegen: 3, cooldownReduction: 0.03 },
  },
  {
    id: 'jade_vault',
    name: 'Jade Vault',
    description: 'A secure vault carved from solid jade that stores coins and rare materials.',
    lore: 'The Jade Vault\'s locks respond only to thoughts of pure intention.',
    emoji: '🏦',
    category: 'resource',
    maxLevel: 10,
    baseCost: 300,
    costMultiplier: 1.7,
    effectsPerLevel: { coinCapacity: 500, materialSlots: 1 },
  },
  {
    id: 'enchantment_forge',
    name: 'Enchantment Forge',
    description: 'A mystical forge that infuses creatures and artifacts with elemental enchantments.',
    lore: 'The Enchantment Forge burns not with fire but with concentrated starlight, hot enough to reshape souls.',
    emoji: '🔨',
    category: 'training',
    maxLevel: 10,
    baseCost: 400,
    costMultiplier: 1.8,
    effectsPerLevel: { enchantPower: 5, successRate: 0.02 },
  },
  {
    id: 'herbal_garden',
    name: 'Herbal Garden',
    description: 'A lush garden of magical herbs used in healing potions and restorative elixirs.',
    lore: 'The Herbal Garden contains specimens from every realm the temple has ever connected to.',
    emoji: '🌺',
    category: 'resource',
    maxLevel: 10,
    baseCost: 200,
    costMultiplier: 1.4,
    effectsPerLevel: { healPower: 3, harvestYield: 0.08 },
  },
  {
    id: 'spirit_wall',
    name: 'Spirit Wall',
    description: 'A barrier of concentrated spiritual energy that protects the temple from threats.',
    lore: 'The Spirit Wall was raised in a single night by a thousand monks chanting in perfect unison.',
    emoji: '🛡️',
    category: 'defense',
    maxLevel: 10,
    baseCost: 350,
    costMultiplier: 1.6,
    effectsPerLevel: { defenseBonus: 4, threatReduction: 0.05 },
  },
  {
    id: 'celestial_observatory',
    name: 'Celestial Observatory',
    description: 'A tower topped with prismatic lenses that reveal hidden opportunities and events.',
    lore: 'Through the observatory\'s lenses, one can see threads of fate connecting all living things.',
    emoji: '🔭',
    category: 'spiritual',
    maxLevel: 10,
    baseCost: 500,
    costMultiplier: 1.9,
    effectsPerLevel: { eventChance: 0.03, rareFindChance: 0.02 },
  },
  {
    id: 'dragon_roost',
    name: 'Dragon Roost',
    description: 'An elevated aerie where dragons rest and grow stronger, increasing creature capacity.',
    lore: 'The Dragon Roost sits at the exact height where the boundary between earth and sky becomes thin.',
    emoji: '🪹',
    category: 'resource',
    maxLevel: 10,
    baseCost: 450,
    costMultiplier: 1.7,
    effectsPerLevel: { creatureSlots: 1, bondingSpeed: 0.1 },
  },
] as const;

export const JT_STRUCTURE_MAP: Record<string, JtStructureDef> = Object.fromEntries(
  JT_STRUCTURES.map((s) => [s.id, s])
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §9 — JT_ABILITIES (8 abilities — 2 per category)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_ABILITIES: readonly JtAbilityDef[] = [
  // Offensive
  {
    id: 'jade_breath',
    name: 'Jade Breath',
    description: 'Unleashes a torrent of jade-infused energy that sears enemies with life force.',
    lore: 'The Jade Breath is not fire — it is concentrated growth, overwhelming targets until they cannot contain their own expansion.',
    emoji: '🐉',
    category: 'offensive',
    manaCost: 15,
    cooldown: 3,
    power: 25,
    unlockLevel: 1,
    requiredSpecies: 'jade_dragon',
  },
  {
    id: 'thunder_strike',
    name: 'Thunder Strike',
    description: 'Calls down a bolt of celestial lightning that targets the strongest enemy threat.',
    lore: 'Thunder Strike does not merely damage — it purifies, burning away corruption with divine fire.',
    emoji: '⚡',
    category: 'offensive',
    manaCost: 20,
    cooldown: 4,
    power: 35,
    unlockLevel: 3,
    requiredSpecies: 'thunder_paladin',
  },
  // Defensive
  {
    id: 'stone_bulwark',
    name: 'Stone Bulwark',
    description: 'Raises an earthen barrier that absorbs incoming damage and converts it to mana.',
    lore: 'The Stone Bulwark teaches that the greatest defense is one that transforms adversity into strength.',
    emoji: '🪨',
    category: 'defensive',
    manaCost: 12,
    cooldown: 4,
    power: 30,
    unlockLevel: 2,
    requiredSpecies: 'stone_monk',
  },
  {
    id: 'crystal_barrier',
    name: 'Crystal Barrier',
    description: 'Conjures a prismatic crystal shield that reflects a portion of damage back at attackers.',
    lore: 'The Crystal Barrier operates on the principle that aggression, when reflected, becomes understanding.',
    emoji: '💎',
    category: 'defensive',
    manaCost: 18,
    cooldown: 5,
    power: 40,
    unlockLevel: 6,
    requiredSpecies: 'crystal_guardian',
  },
  // Utility
  {
    id: 'wind_sight',
    name: 'Wind Sight',
    description: 'Grants temporary omniscience, revealing hidden chambers, resources, and creature locations.',
    lore: 'Wind Sight lets you perceive what the wind perceives — which is everything, everywhere, always.',
    emoji: '👁️',
    category: 'utility',
    manaCost: 10,
    cooldown: 6,
    power: 15,
    unlockLevel: 4,
    requiredSpecies: 'wind_sage',
  },
  {
    id: 'mist_restoration',
    name: 'Mist Restoration',
    description: 'Summons a thick healing mist that restores all creatures and structures over time.',
    lore: 'The Mist Restoration\'s healing is so gentle that the injured often do not realize they have been healed until they try to move.',
    emoji: '🌿',
    category: 'utility',
    manaCost: 16,
    cooldown: 5,
    power: 20,
    unlockLevel: 5,
    requiredSpecies: 'mist_healer',
  },
  // Summon
  {
    id: 'earthquake_summon',
    name: 'Earthquake Summon',
    description: 'Channels the earth\'s seismic energy to summon tremors that shake enemy formations.',
    lore: 'The Earthquake Summon does not just shake the ground — it rearranges reality, temporarily shifting the positions of all things.',
    emoji: '🌋',
    category: 'summon',
    manaCost: 25,
    cooldown: 8,
    power: 45,
    unlockLevel: 8,
    requiredSpecies: 'earth_golem',
  },
  {
    id: 'dragon_call',
    name: 'Dragon Call',
    description: 'Issues a resonant call that summons spectral dragons to temporarily boost all creature stats.',
    lore: 'The Dragon Call echoes through every realm simultaneously. Every dragon that hears it feels the urge to come home.',
    emoji: '🐲',
    category: 'summon',
    manaCost: 30,
    cooldown: 10,
    power: 55,
    unlockLevel: 10,
    requiredSpecies: 'jade_dragon',
  },
] as const;

export const JT_ABILITY_MAP: Record<string, JtAbilityDef> = Object.fromEntries(
  JT_ABILITIES.map((a) => [a.id, a])
);

export const JT_ABILITIES_BY_CATEGORY: Record<JtAbilityCategory, JtAbilityDef[]> = Object.fromEntries(
  (['offensive', 'defensive', 'utility', 'summon'] as JtAbilityCategory[]).map((cat) => [
    cat,
    JT_ABILITIES.filter((a) => a.category === cat),
  ])
) as Record<JtAbilityCategory, JtAbilityDef[]>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §10 — JT_ACHIEVEMENTS (10 achievements)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_ACHIEVEMENTS: readonly JtAchievementDef[] = [
  {
    id: 'first_steps_on_jade',
    name: 'First Steps on Jade',
    description: 'Enter the Jade Courtyard for the first time and begin your journey.',
    lore: 'Every journey of ten thousand miles begins with a single step upon jade.',
    emoji: '👣',
    condition: 'visit_chamber:jade_courtyard',
    reward: { type: 'coins', amount: 100 },
    hidden: false,
  },
  {
    id: 'dragon_companion',
    name: 'Dragon Companion',
    description: 'Bond with your first jade dragon creature.',
    lore: 'The bond between a monk and their dragon is older than the temple itself.',
    emoji: '🐲',
    condition: 'bond_creature:jade_dragon',
    reward: { type: 'xp', amount: 200 },
    hidden: false,
  },
  {
    id: 'master_of_meditation',
    name: 'Master of Meditation',
    description: 'Perform 100 meditation actions to achieve deep spiritual clarity.',
    lore: 'After one hundred meditations, the mind becomes like still water — perfectly reflecting truth.',
    emoji: '🧘',
    condition: 'action_count:meditate:100',
    reward: { type: 'mana', amount: 50 },
    hidden: false,
  },
  {
    id: 'temple_architect',
    name: 'Temple Architect',
    description: 'Build and upgrade 5 different structures within the temple grounds.',
    lore: 'A true temple architect understands that buildings are not constructed — they are grown.',
    emoji: '🏗️',
    condition: 'structure_count:5',
    reward: { type: 'coins', amount: 500 },
    hidden: false,
  },
  {
    id: 'chamber_explorer',
    name: 'Chamber Explorer',
    description: 'Visit and clear all 8 temple chambers at least once.',
    lore: 'To know the temple fully is to know yourself. Every chamber reflects a part of the soul.',
    emoji: '🗺️',
    condition: 'chambers_cleared:8',
    reward: { type: 'xp', amount: 500 },
    hidden: false,
  },
  {
    id: 'artisan_of_jade',
    name: 'Artisan of Jade',
    description: 'Collect 10 different materials from temple activities and explorations.',
    lore: 'The true artisan sees beauty in every fragment of jade, no matter how small.',
    emoji: '🎨',
    condition: 'unique_materials:10',
    reward: { type: 'coins', amount: 300 },
    hidden: false,
  },
  {
    id: 'legendary_collector',
    name: 'Legendary Collector',
    description: 'Acquire a creature of legendary rarity.',
    lore: 'Legends are not born — they are earned through patience, dedication, and a touch of fate.',
    emoji: '🌟',
    condition: 'creature_rarity:legendary',
    reward: { type: 'coins', amount: 1000 },
    hidden: true,
  },
  {
    id: 'word_sage_supreme',
    name: 'Word Sage Supreme',
    description: 'Type 10,000 words to achieve the rank of Supreme Word Sage.',
    lore: 'Ten thousand words is not a number — it is a threshold. Beyond it lies mastery.',
    emoji: '📜',
    condition: 'words_typed:10000',
    reward: { type: 'xp', amount: 1000 },
    hidden: false,
  },
  {
    id: 'ascendant_master',
    name: 'Ascendant Master',
    description: 'Perform 5 ascensions, transcending mortal limitations.',
    lore: 'Each ascension strips away a layer of illusion, revealing more of the eternal truth beneath.',
    emoji: '✨',
    condition: 'ascensions:5',
    reward: { type: 'xp', amount: 2000 },
    hidden: true,
  },
  {
    id: 'keeper_of_secrets',
    name: 'Keeper of Secrets',
    description: 'Unlock all 8 abilities and master every discipline of the temple.',
    lore: 'The Keeper of Secrets holds not knowledge, but the keys to every door in existence.',
    emoji: '🗝️',
    condition: 'abilities_unlocked:8',
    reward: { type: 'coins', amount: 2500 },
    hidden: true,
  },
] as const;

export const JT_ACHIEVEMENT_MAP: Record<string, JtAchievementDef> = Object.fromEntries(
  JT_ACHIEVEMENTS.map((a) => [a.id, a])
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §11 — JT_TITLES (8 titles)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_TITLES: readonly JtTitleDef[] = [
  {
    id: 'jade_novice',
    name: 'Jade Novice',
    description: 'A newcomer who has begun walking the jade path with humble steps.',
    lore: 'The jade path has no end, only deeper layers of understanding.',
    bonus: { xpBonus: 0.05 },
  },
  {
    id: 'stone_disciple',
    name: 'Stone Disciple',
    description: 'A dedicated student who has begun to harden their resolve like temple granite.',
    lore: 'The stone does not resist the wind — it endures it, and remains.',
    bonus: { defenseBonus: 5 },
  },
  {
    id: 'crystal_apprentice',
    name: 'Crystal Apprentice',
    description: 'An emerging scholar learning to see truth through the temple\'s prismatic wisdom.',
    lore: 'Every crystal facet reveals a different truth. The apprentice learns to see them all.',
    bonus: { coinBonus: 0.08 },
  },
  {
    id: 'wind_walker',
    name: 'Wind Walker',
    description: 'A swift adept who moves through the temple like a gentle breeze, touching all things.',
    lore: 'The Wind Walker leaves no footprints but is remembered by every blade of grass they passed.',
    bonus: { speedBonus: 10 },
  },
  {
    id: 'thunder_warrior',
    name: 'Thunder Warrior',
    description: 'A fierce combatant whose attacks carry the weight and fury of celestial storms.',
    lore: 'The Thunder Warrior fights not with anger, but with the righteous force of divine justice.',
    bonus: { powerBonus: 15 },
  },
  {
    id: 'mist_guardian',
    name: 'Mist Guardian',
    description: 'A protector cloaked in healing mists, safeguarding the temple and all who dwell within.',
    lore: 'The Mist Guardian\'s protection is invisible but absolute — like gravity, it simply is.',
    bonus: { healBonus: 20 },
  },
  {
    id: 'earth_elder',
    name: 'Earth Elder',
    description: 'A venerable master whose wisdom runs as deep as the temple\'s foundations.',
    lore: 'The Earth Elder has seen civilizations rise and fall. They remain, like the mountain.',
    bonus: { xpBonus: 0.15, defenseBonus: 10 },
  },
  {
    id: 'jade_emperor_successor',
    name: 'Jade Emperor Successor',
    description: 'The chosen heir to the Jade Emperor\'s legacy, destined to guide the temple into eternity.',
    lore: 'The Jade Emperor does not choose successors based on power. They choose those whose hearts mirror the temple\'s jade — eternal, patient, and alive.',
    bonus: { powerBonus: 25, defenseBonus: 20, xpBonus: 0.2, coinBonus: 0.15 },
  },
] as const;

export const JT_TITLE_MAP: Record<string, JtTitleDef> = Object.fromEntries(
  JT_TITLES.map((t) => [t.id, t])
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §12 — JT_ARTIFACTS (6 artifacts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_ARTIFACTS: readonly JtArtifactDef[] = [
  {
    id: 'jade_emperors_comb',
    name: "Jade Emperor's Comb",
    description: 'A comb carved from a single piece of imperial jade that calms the mind when held.',
    lore: 'The Jade Emperor combed his hair each dawn, and with each stroke, a new star appeared in the sky.',
    emoji: '🪮',
    rarity: 'epic',
    effect: 'Reduces all ability cooldowns by 1 turn.',
    power: 30,
    cost: 1500,
  },
  {
    id: 'dragonheart_amulet',
    name: 'Dragonheart Amulet',
    description: 'An amulet containing a crystallized dragon heartbeat that boosts creature power.',
    lore: 'The dragon whose heart powers this amulet gave it willingly — the greatest gift a dragon can offer.',
    emoji: '📿',
    rarity: 'legendary',
    effect: 'All creatures gain +15% power in combat.',
    power: 50,
    cost: 3000,
  },
  {
    id: 'scroll_of_eternal_wind',
    name: 'Scroll of Eternal Wind',
    description: 'A scroll that unfurls endlessly, containing the wind\'s memories of all ages.',
    lore: 'No one has ever reached the end of the Scroll of Eternal Wind. Some say it writes itself.',
    emoji: '📜',
    rarity: 'epic',
    effect: 'Increases XP gain by 20% from all sources.',
    power: 35,
    cost: 2000,
  },
  {
    id: 'thunderforged_crown',
    name: 'Thunderforged Crown',
    description: 'A crown forged in celestial lightning that enhances leadership and command.',
    lore: 'Whoever wears the Thunderforged Crown can hear the thoughts of every creature in the temple.',
    emoji: '👑',
    rarity: 'legendary',
    effect: 'Unlocks the command ability to direct all creatures simultaneously.',
    power: 60,
    cost: 4000,
  },
  {
    id: 'lotus_lantern',
    name: 'Lotus Lantern',
    description: 'A lantern shaped like a blooming lotus that never extinguishes, revealing hidden truths.',
    lore: 'The Lotus Lantern\'s light penetrates all illusions. What it reveals is not always comfortable.',
    emoji: '🏮',
    rarity: 'rare',
    effect: 'Reveals hidden chambers and secret material caches.',
    power: 20,
    cost: 800,
  },
  {
    id: 'world_root_staff',
    name: 'World Root Staff',
    description: 'A staff grown from a root of the World Tree that connects to all earth energies.',
    lore: 'The World Root Staff remembers when the world was young. Tapping it on the ground causes flowers to bloom.',
    emoji: '🪄',
    rarity: 'legendary',
    effect: 'Earth-elemental abilities gain +50% power and area of effect.',
    power: 55,
    cost: 3500,
  },
] as const;

export const JT_ARTIFACT_MAP: Record<string, JtArtifactDef> = Object.fromEntries(
  JT_ARTIFACTS.map((a) => [a.id, a])
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §13 — JT_EVENTS (8 events)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JT_EVENTS: readonly JtEventDef[] = [
  {
    id: 'dragon_migration',
    name: 'Dragon Migration',
    description: 'A wave of wild jade dragons passes through the temple, offering rare companions.',
    lore: 'Every century, the wild dragons return to the temple of their birth to remember and to be remembered.',
    emoji: '🐲',
    duration: 3600000,
    reward: { type: 'creature', amount: 1 },
    requirement: 'level:5',
  },
  {
    id: 'jade_bloom_festival',
    name: 'Jade Bloom Festival',
    description: 'The temple\'s jade flora erupts in magnificent bloom, yielding bonus resources.',
    lore: 'During the Jade Bloom, the temple produces enough jade to build a small mountain in a single day.',
    emoji: '🌸',
    duration: 7200000,
    reward: { type: 'coins', amount: 500 },
    requirement: 'level:3',
  },
  {
    id: 'thunder_trial',
    name: 'Thunder Trial',
    description: 'A sudden celestial storm descends upon the temple, challenging all warriors to prove their worth.',
    lore: 'The Thunder Trial is the Jade Emperor\'s favorite test. Those who pass carry lightning in their eyes forever after.',
    emoji: '🌩️',
    duration: 5400000,
    reward: { type: 'xp', amount: 300 },
    requirement: 'level:8',
  },
  {
    id: 'merchant_caravan',
    name: 'Merchant Caravan',
    description: 'A caravan of celestial merchants arrives, offering rare materials at discounted prices.',
    lore: 'The merchant caravan\'s camels are actually clouds in disguise. They travel faster than any earthly beast.',
    emoji: '🐫',
    duration: 4800000,
    reward: { type: 'material', amount: 5 },
    requirement: 'level:2',
  },
  {
    id: 'spirit_ascension_night',
    name: 'Spirit Ascension Night',
    description: 'The boundary between realms thins, allowing powerful spirits to grant blessings.',
    lore: 'On Spirit Ascension Night, the stars align and every creature in the temple dreams the same dream.',
    emoji: '🌟',
    duration: 9000000,
    reward: { type: 'mana', amount: 100 },
    requirement: 'level:10',
  },
  {
    id: 'jade_quake',
    name: 'Jade Quake',
    description: 'A minor seismic event reveals hidden underground chambers filled with ancient treasures.',
    lore: 'The Jade Quake is not destructive — it is the earth yawning, and in its yawn, secrets spill forth.',
    emoji: '🏔️',
    duration: 3600000,
    reward: { type: 'material', amount: 3 },
    requirement: 'level:6',
  },
  {
    id: 'mist_convergence',
    name: 'Mist Convergence',
    description: 'Healing mists from across all realms converge on the temple, massively boosting recovery.',
    lore: 'During the Mist Convergence, even the oldest wounds can be healed and the most weary spirits can be renewed.',
    emoji: '🌫️',
    duration: 6000000,
    reward: { type: 'coins', amount: 300 },
    requirement: 'level:4',
  },
  {
    id: 'emperor_audit',
    name: 'Emperor Audit',
    description: 'The Jade Emperor\'s inspectors arrive to evaluate temple progress, rewarding excellence.',
    lore: 'The Emperor\'s Audit is feared by the unworthy and welcomed by the diligent. It is the fairest judgment in existence.',
    emoji: '📜',
    duration: 3000000,
    reward: { type: 'xp', amount: 500 },
    requirement: 'level:15',
  },
] as const;

export const JT_EVENT_MAP: Record<string, JtEventDef> = Object.fromEntries(
  JT_EVENTS.map((e) => [e.id, e])
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §14 — useJadeTemple() MAIN HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function createInitialState(): JtGameState {
  const now = Date.now();
  return {
    version: JT_VERSION,
    playerName: 'Dragon Monk',
    activeTitleId: 'jade_novice',
    level: 1,
    xp: JT_STARTING_XP,
    coins: JT_STARTING_COINS,
    mana: JT_STARTING_MANA,
    maxMana: JT_MAX_MANA_BASE,
    creatures: [],
    materials: [],
    structures: [],
    abilities: JT_ABILITIES.map((a) => ({
      abilityId: a.id,
      unlocked: false,
      cooldownRemaining: 0,
      totalUses: 0,
    })),
    chamberProgress: JT_CHAMBERS.map((c) => ({
      chamberId: c.id,
      status: c.unlockLevel <= 1 ? ('available' as JtChamberStatus) : ('locked' as JtChamberStatus),
      timesVisited: 0,
      bestScore: 0,
      lastVisited: null,
    })),
    artifacts: [],
    events: JT_EVENTS.map((e) => ({
      eventId: e.id,
      status: 'idle' as JtEventStatus,
      startedAt: null,
      progress: 0,
      rewardClaimed: false,
    })),
    titles: JT_TITLES.map((t) => ({
      titleId: t.id,
      unlocked: t.id === 'jade_novice',
      unlockedAt: t.id === 'jade_novice' ? now : null,
      isActive: t.id === 'jade_novice',
    })),
    achievements: [],
    stats: {
      totalWordsTyped: 0,
      totalXpEarned: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      totalActionsPerformed: 0,
      totalCreaturesCollected: 0,
      totalChambersCleared: 0,
      totalAchievementsUnlocked: 0,
      totalAscensions: 0,
      longestStreak: 0,
      currentStreak: 0,
    },
    lastSaveAt: now,
    createdAt: now,
    settings: {
      sfxEnabled: true,
      ambientEnabled: true,
      particlesEnabled: true,
      autoTrainEnabled: false,
      notificationEnabled: true,
      themeAccent: JT_COLORS.jadeGreen,
    },
    dailyRewardClaimed: false,
    lastDailyRewardDate: '',
  };
}

function generateInstanceId(): string {
  return `jt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function calculateXpForLevel(level: number): number {
  return Math.floor(JT_XP_PER_LEVEL * Math.pow(JT_XP_LEVEL_MULTIPLIER, level - 1));
}

function calculateStructureUpgradeCost(structure: JtStructureDef, currentLevel: number): number {
  return Math.floor(structure.baseCost * Math.pow(structure.costMultiplier, currentLevel));
}

export default function useJadeTemple() {
  // ── Core state ───────────────────────────────────────────────────────────
  const [state, setState] = useState<JtGameState>(createInitialState);
  const [notifications, setNotifications] = useState<JtNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const stateRef = useRef<JtGameState>(state);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep stateRef in sync via useEffect (NOT direct assignment during render)
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Persistence: Load ────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(JT_SAVE_KEY);
      if (raw) {
        const saved: JtGameState = JSON.parse(raw);
        if (saved && saved.version === JT_VERSION) {
          setState(saved);
        } else if (saved) {
          // Version mismatch — reset
          setState(createInitialState());
        }
      }
    } catch {
      setState(createInitialState());
    }
    setIsLoaded(true);
  }, []);

  // ── Persistence: Save ────────────────────────────────────────────────────
  const jtSave = useCallback(() => {
    try {
      const toSave = { ...stateRef.current, lastSaveAt: Date.now() };
      localStorage.setItem(JT_SAVE_KEY, JSON.stringify(toSave));
    } catch {
      // Storage full or unavailable
    }
  }, []);

  // Auto-save
  useEffect(() => {
    if (!isLoaded) return;
    autoSaveTimerRef.current = setInterval(jtSave, JT_AUTO_SAVE_INTERVAL);
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [isLoaded, jtSave]);

  // ── Mana regeneration ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.mana >= prev.maxMana) return prev;
        const meditationShrineLevel = prev.structures.find(
          (s) => s.structureId === 'meditation_shrine'
        )?.level ?? 0;
        const regenRate = JT_MANA_REGEN_RATE + meditationShrineLevel * 3;
        const newMana = Math.min(prev.maxMana, prev.mana + regenRate);
        return { ...prev, mana: newMana };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoaded]);

  // ── Event tick ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setState((prev) => {
        let changed = false;
        const updatedEvents = prev.events.map((e) => {
          if (e.status !== 'active' || !e.startedAt) return e;
          const def = JT_EVENT_MAP[e.eventId];
          if (!def) return e;
          const elapsed = now - e.startedAt;
          if (elapsed >= def.duration) {
            changed = true;
            return { ...e, status: 'completed' as JtEventStatus, progress: 100 };
          }
          changed = true;
          return { ...e, progress: Math.floor((elapsed / def.duration) * 100) };
        });
        return changed ? { ...prev, events: updatedEvents } : prev;
      });
    }, JT_EVENT_TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [isLoaded]);

  // ── Helpers: Notifications ───────────────────────────────────────────────
  const jtNotify = useCallback(
    (type: JtNotification['type'], message: string) => {
      const notif: JtNotification = {
        id: generateNotificationId(),
        type,
        message,
        timestamp: Date.now(),
        dismissed: false,
      };
      setNotifications((prev) =>
        [notif, ...prev].slice(0, JT_MAX_NOTIFICATIONS)
      );
    },
    []
  );

  const jtDismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
    );
  }, []);

  const jtClearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ── Helpers: Level & XP ──────────────────────────────────────────────────
  const jtGetXpToNextLevel = useCallback((level: number) => {
    return calculateXpForLevel(level);
  }, []);

  const jtGetXpProgress = useCallback(() => {
    const needed = calculateXpForLevel(state.level);
    return Math.min(1, state.xp / needed);
  }, [state.level, state.xp]);

  const jtGrantXp = useCallback((amount: number) => {
    let xp = amount;
    setState((prev) => {
      let currentXp = prev.xp;
      let currentLevel = prev.level;
      let remaining = xp;
      let leveled = false;

      while (remaining > 0 && currentLevel < JT_MAX_LEVEL) {
        const needed = calculateXpForLevel(currentLevel);
        if (currentXp + remaining >= needed) {
          remaining -= needed - currentXp;
          currentXp = 0;
          currentLevel += 1;
          leveled = true;
        } else {
          currentXp += remaining;
          remaining = 0;
        }
      }

      if (currentLevel >= JT_MAX_LEVEL) {
        currentXp = 0;
      }

      const newStats = {
        ...prev.stats,
        totalXpEarned: prev.stats.totalXpEarned + xp - remaining,
      };

      return {
        ...prev,
        xp: currentXp,
        level: currentLevel,
        stats: newStats,
      };
    });

    // Level-up notification is handled after setState batch
    setState((prev) => {
      if (prev.level > state.level) {
        jtNotify('success', `Level up! You are now level ${prev.level}!`);
        // Check ability unlocks
        JT_ABILITIES.forEach((ab) => {
          if (ab.unlockLevel <= prev.level) {
            setState((inner) => ({
              ...inner,
              abilities: inner.abilities.map((a) =>
                a.abilityId === ab.id && !a.unlocked ? { ...a, unlocked: true } : a
              ),
            }));
          }
        });
        // Check chamber unlocks
        setState((inner) => ({
          ...inner,
          chamberProgress: inner.chamberProgress.map((cp) => {
            const chamber = JT_CHAMBER_MAP[cp.chamberId];
            if (chamber && cp.status === 'locked' && chamber.unlockLevel <= prev.level) {
              return { ...cp, status: 'available' as JtChamberStatus };
            }
            return cp;
          }),
        }));
      }
      return prev;
    });
  }, [state.level, jtNotify]);

  // ── Helpers: Coins ───────────────────────────────────────────────────────
  const jtGrantCoins = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + amount },
    }));
  }, []);

  const jtSpendCoins = useCallback(
    (amount: number): boolean => {
      let success = false;
      setState((prev) => {
        if (prev.coins < amount) return prev;
        success = true;
        return {
          ...prev,
          coins: prev.coins - amount,
          stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + amount },
        };
      });
      return success;
    },
    []
  );

  // ── Action: Train ────────────────────────────────────────────────────────
  const jtActionTrain = useCallback(
    (creatureInstanceId: string, wordsTyped: number) => {
      setState((prev) => {
        const creature = prev.creatures.find((c) => c.instanceId === creatureInstanceId);
        if (!creature) return prev;
        if (prev.mana < JT_MANA_ACTION_COST) return prev;

        const trainingLevel = prev.structures.find(
          (s) => s.structureId === 'training_pavilion'
        )?.level ?? 0;
        const xpPerWord = JT_XP_ACTION_REWARD + trainingLevel * 2;
        const totalXp = xpPerWord * wordsTyped;
        const coinReward = JT_COIN_ACTION_REWARD + Math.floor(wordsTyped / 5) * 2;

        return {
          ...prev,
          mana: prev.mana - JT_MANA_ACTION_COST,
          xp: prev.xp,
          coins: prev.coins + coinReward,
          stats: {
            ...prev.stats,
            totalWordsTyped: prev.stats.totalWordsTyped + wordsTyped,
            totalActionsPerformed: prev.stats.totalActionsPerformed + 1,
            totalCoinsEarned: prev.stats.totalCoinsEarned + coinReward,
          },
        };
      });

      jtGrantXp(JT_XP_ACTION_REWARD);
      jtNotify('info', `Training complete! +${JT_COIN_ACTION_REWARD} coins`);
    },
    [jtGrantXp, jtNotify]
  );

  // ── Action: Meditate ─────────────────────────────────────────────────────
  const jtActionMeditate = useCallback(
    (wordsTyped: number) => {
      setState((prev) => {
        const manaReward = Math.min(20, prev.maxMana - prev.mana);
        return {
          ...prev,
          mana: prev.mana + manaReward,
          stats: {
            ...prev.stats,
            totalWordsTyped: prev.stats.totalWordsTyped + wordsTyped,
            totalActionsPerformed: prev.stats.totalActionsPerformed + 1,
          },
        };
      });
      jtGrantXp(Math.floor(JT_XP_ACTION_REWARD * 0.8));
      jtNotify('info', 'Meditation complete. Mind is clearer.');
    },
    [jtGrantXp, jtNotify]
  );

  // ── Action: Sculpt ───────────────────────────────────────────────────────
  const jtActionSculpt = useCallback(
    (wordsTyped: number) => {
      const possibleMaterials = JT_MATERIALS.filter(
        (m) =>
          m.rarity === 'common' ||
          (m.rarity === 'uncommon' && Math.random() < 0.2) ||
          (m.rarity === 'rare' && Math.random() < 0.05)
      );
      const mat =
        possibleMaterials[Math.floor(Math.random() * possibleMaterials.length)];

      if (!mat) return;

      setState((prev) => {
        const existing = prev.materials.find((s) => s.materialId === mat.id);
        let newMaterials: JtInventorySlot[];
        if (existing) {
          newMaterials = prev.materials.map((s) =>
            s.materialId === mat.id
              ? { ...s, quantity: s.quantity + 1 }
              : s
          );
        } else {
          newMaterials = [...prev.materials, { materialId: mat.id, quantity: 1 }];
        }

        return {
          ...prev,
          materials: newMaterials,
          stats: {
            ...prev.stats,
            totalWordsTyped: prev.stats.totalWordsTyped + wordsTyped,
            totalActionsPerformed: prev.stats.totalActionsPerformed + 1,
          },
        };
      });

      jtGrantXp(JT_XP_ACTION_REWARD);
      jtNotify('success', `Sculpted a ${mat.name}! ${mat.emoji}`);
    },
    [jtGrantXp, jtNotify]
  );

  // ── Action: Chant ────────────────────────────────────────────────────────
  const jtActionChant = useCallback(
    (wordsTyped: number) => {
      setState((prev) => {
        const coinReward = JT_COIN_ACTION_REWARD * 2 + Math.floor(Math.random() * 10);
        return {
          ...prev,
          coins: prev.coins + coinReward,
          stats: {
            ...prev.stats,
            totalWordsTyped: prev.stats.totalWordsTyped + wordsTyped,
            totalActionsPerformed: prev.stats.totalActionsPerformed + 1,
            totalCoinsEarned: prev.stats.totalCoinsEarned + coinReward,
          },
        };
      });
      jtGrantXp(JT_XP_ACTION_REWARD);
      jtNotify('info', 'Chanting echoes through the temple halls.');
    },
    [jtGrantXp, jtNotify]
  );

  // ── Action: Heal ─────────────────────────────────────────────────────────
  const jtActionHeal = useCallback(
    (creatureInstanceId: string, wordsTyped: number) => {
      setState((prev) => {
        const creature = prev.creatures.find((c) => c.instanceId === creatureInstanceId);
        if (!creature) return prev;

        const gardenLevel = prev.structures.find(
          (s) => s.structureId === 'herbal_garden'
        )?.level ?? 0;
        const healBonus = 10 + gardenLevel * 3;

        // Grant xp for healing actions
        return {
          ...prev,
          stats: {
            ...prev.stats,
            totalWordsTyped: prev.stats.totalWordsTyped + wordsTyped,
            totalActionsPerformed: prev.stats.totalActionsPerformed + 1,
          },
        };
      });
      jtGrantXp(Math.floor(JT_XP_ACTION_REWARD * 0.9));
      jtNotify('info', 'Healing mist cascades through the chamber.');
    },
    [jtGrantXp, jtNotify]
  );

  // ── Action: Enchant ──────────────────────────────────────────────────────
  const jtActionEnchant = useCallback(
    (creatureInstanceId: string, wordsTyped: number) => {
      setState((prev) => {
        const creature = prev.creatures.find((c) => c.instanceId === creatureInstanceId);
        if (!creature) return prev;
        if (prev.mana < JT_MANA_ACTION_COST * 2) return prev;

        const forgeLevel = prev.structures.find(
          (s) => s.structureId === 'enchantment_forge'
        )?.level ?? 0;
        const successChance = 0.6 + forgeLevel * 0.02;
        const success = Math.random() < successChance;

        if (!success) {
          return {
            ...prev,
            mana: prev.mana - JT_MANA_ACTION_COST * 2,
            stats: {
              ...prev.stats,
              totalWordsTyped: prev.stats.totalWordsTyped + wordsTyped,
              totalActionsPerformed: prev.stats.totalActionsPerformed + 1,
            },
          };
        }

        const creatureDef = JT_CREATURE_MAP[creature.creatureId];
        const powerGain = Math.floor(2 + forgeLevel * 0.5);
        const defenseGain = Math.floor(1 + forgeLevel * 0.3);

        return {
          ...prev,
          mana: prev.mana - JT_MANA_ACTION_COST * 2,
          stats: {
            ...prev.stats,
            totalWordsTyped: prev.stats.totalWordsTyped + wordsTyped,
            totalActionsPerformed: prev.stats.totalActionsPerformed + 1,
          },
        };
      });

      jtGrantXp(JT_XP_ACTION_REWARD);
      jtNotify('success', 'Enchantment successfully applied!');
    },
    [jtGrantXp, jtNotify]
  );

  // ── Action: Ascend ───────────────────────────────────────────────────────
  const jtActionAscend = useCallback(() => {
    let canAscend = false;
    setState((prev) => {
      if (prev.level < JT_ASCENSION_MIN_LEVEL || prev.coins < JT_ASCENSION_COST) {
        return prev;
      }
      canAscend = true;
      return {
        ...prev,
        level: 1,
        xp: 0,
        coins: prev.coins - JT_ASCENSION_COST,
        mana: JT_STARTING_MANA,
        stats: {
          ...prev.stats,
          totalAscensions: prev.stats.totalAscensions + 1,
          totalCoinsSpent: prev.stats.totalCoinsSpent + JT_ASCENSION_COST,
        },
      };
    });

    if (canAscend) {
      jtNotify(
        'achievement',
        'Ascension complete! The jade path deepens. +10% XP bonus permanently.'
      );
    } else {
      jtNotify('warning', 'Cannot ascend: need level 10+ and 1000 coins.');
    }
  }, [jtNotify]);

  // ── Creature Management ──────────────────────────────────────────────────
  const jtAcquireCreature = useCallback(
    (creatureId: string) => {
      const def = JT_CREATURE_MAP[creatureId];
      if (!def) return false;

      let success = false;
      setState((prev) => {
        if (prev.coins < def.cost) return prev;

        const maxSlots =
          JT_CREATURE_SLOTS_BASE +
          (prev.structures.find((s) => s.structureId === 'dragon_roost')?.level ?? 0) +
          Math.floor(prev.level / 5);
        if (prev.creatures.length >= maxSlots) return prev;

        success = true;
        const newCreature: JtOwnedCreature = {
          creatureId: def.id,
          instanceId: generateInstanceId(),
          nickname: def.name,
          level: 1,
          xp: 0,
          bonded: false,
          equipped: true,
          acquiredAt: Date.now(),
        };

        return {
          ...prev,
          coins: prev.coins - def.cost,
          creatures: [...prev.creatures, newCreature],
          stats: {
            ...prev.stats,
            totalCreaturesCollected: prev.stats.totalCreaturesCollected + 1,
            totalCoinsSpent: prev.stats.totalCoinsSpent + def.cost,
          },
        };
      });

      if (success) {
        jtNotify('success', `Acquired ${def.name}! ${def.emoji}`);
        // Check achievement
        if (def.rarity === 'legendary') {
          jtCheckAchievement('creature_rarity:legendary');
        }
      } else {
        jtNotify('warning', 'Not enough coins or creature slots full.');
      }
      return success;
    },
    [jtNotify]
  );

  const jtBondCreature = useCallback(
    (instanceId: string) => {
      setState((prev) => ({
        ...prev,
        creatures: prev.creatures.map((c) =>
          c.instanceId === instanceId ? { ...c, bonded: true } : c
        ),
      }));
      const creature = stateRef.current.creatures.find((c) => c.instanceId === instanceId);
      if (creature) {
        const def = JT_CREATURE_MAP[creature.creatureId];
        if (def) {
          jtNotify('success', `Bonded with ${def.name}! Your connection deepens.`);
          jtCheckAchievement(`bond_creature:${def.species}`);
        }
      }
    },
    [jtNotify]
  );

  const jtEquipCreature = useCallback((instanceId: string, equipped: boolean) => {
    setState((prev) => ({
      ...prev,
      creatures: prev.creatures.map((c) =>
        c.instanceId === instanceId ? { ...c, equipped } : c
      ),
    }));
  }, []);

  const jtReleaseCreature = useCallback(
    (instanceId: string) => {
      const creature = stateRef.current.creatures.find((c) => c.instanceId === instanceId);
      setState((prev) => ({
        ...prev,
        creatures: prev.creatures.filter((c) => c.instanceId !== instanceId),
      }));
      if (creature) {
        const def = JT_CREATURE_MAP[creature.creatureId];
        const refund = def ? Math.floor(def.cost * 0.3) : 0;
        jtGrantCoins(refund);
        jtNotify('info', `Released ${def?.name ?? 'creature'}. Refunded ${refund} coins.`);
      }
    },
    [jtGrantCoins, jtNotify]
  );

  // ── Structure Management ─────────────────────────────────────────────────
  const jtBuildStructure = useCallback(
    (structureId: string) => {
      const def = JT_STRUCTURE_MAP[structureId];
      if (!def) return false;

      let success = false;
      setState((prev) => {
        const existing = prev.structures.find((s) => s.structureId === structureId);
        if (existing) return prev;
        if (prev.coins < def.baseCost) return prev;

        success = true;
        const newStructure: JtStructureInstance = {
          structureId: def.id,
          level: 1,
          builtAt: Date.now(),
        };

        return {
          ...prev,
          coins: prev.coins - def.baseCost,
          structures: [...prev.structures, newStructure],
          stats: {
            ...prev.stats,
            totalCoinsSpent: prev.stats.totalCoinsSpent + def.baseCost,
          },
        };
      });

      if (success) {
        jtNotify('success', `Built ${def.name}! ${def.emoji}`);
      }
      return success;
    },
    [jtNotify]
  );

  const jtUpgradeStructure = useCallback(
    (structureId: string) => {
      const def = JT_STRUCTURE_MAP[structureId];
      if (!def) return false;

      let success = false;
      setState((prev) => {
        const existing = prev.structures.find((s) => s.structureId === structureId);
        if (!existing || existing.level >= def.maxLevel) return prev;

        const cost = calculateStructureUpgradeCost(def, existing.level);
        if (prev.coins < cost) return prev;

        success = true;
        return {
          ...prev,
          coins: prev.coins - cost,
          structures: prev.structures.map((s) =>
            s.structureId === structureId ? { ...s, level: s.level + 1 } : s
          ),
          stats: {
            ...prev.stats,
            totalCoinsSpent: prev.stats.totalCoinsSpent + cost,
          },
        };
      });

      if (success) {
        jtNotify('success', `Upgraded ${def.name}!`);
      }
      return success;
    },
    [jtNotify]
  );

  // ── Chamber Management ───────────────────────────────────────────────────
  const jtVisitChamber = useCallback(
    (chamberId: string, score: number) => {
      const chamber = JT_CHAMBER_MAP[chamberId];
      if (!chamber) return;

      setState((prev) => {
        const updatedChambers = prev.chamberProgress.map((cp) => {
          if (cp.chamberId !== chamberId) return cp;
          const newVisited = cp.timesVisited + 1;
          const newBest = Math.max(cp.bestScore, score);
          const newStatus: JtChamberStatus = score >= chamber.dangerLevel * 10 ? 'cleared' : 'active';
          return {
            ...cp,
            timesVisited: newVisited,
            bestScore: newBest,
            lastVisited: Date.now(),
            status: newStatus,
          };
        });

        return {
          ...prev,
          chamberProgress: updatedChambers,
          stats: {
            ...prev.stats,
            totalChambersCleared: updatedChambers.filter(
              (c) => c.status === 'cleared'
            ).length,
          },
        };
      });

      // Grant chamber resources
      chamber.resources.forEach((res) => {
        switch (res.type) {
          case 'xp':
            jtGrantXp(res.amount);
            break;
          case 'coins':
            jtGrantCoins(res.amount);
            break;
          case 'mana':
            setState((prev) => ({
              ...prev,
              mana: Math.min(prev.maxMana, prev.mana + res.amount),
            }));
            break;
        }
      });

      jtNotify('success', `Explored ${chamber.name}! Score: ${score}`);
      jtCheckAchievement(`visit_chamber:${chamberId}`);
    },
    [jtGrantXp, jtGrantCoins, jtNotify]
  );

  // ── Artifact Management ──────────────────────────────────────────────────
  const jtAcquireArtifact = useCallback(
    (artifactId: string) => {
      const def = JT_ARTIFACT_MAP[artifactId];
      if (!def) return false;

      let success = false;
      setState((prev) => {
        const existing = prev.artifacts.find((a) => a.artifactId === artifactId);
        if (existing) return prev;
        if (prev.coins < def.cost) return prev;

        success = true;
        const newArtifact: JtArtifactInstance = {
          artifactId: def.id,
          equipped: false,
          acquiredAt: Date.now(),
          enhancementLevel: 1,
        };

        return {
          ...prev,
          coins: prev.coins - def.cost,
          artifacts: [...prev.artifacts, newArtifact],
          stats: {
            ...prev.stats,
            totalCoinsSpent: prev.stats.totalCoinsSpent + def.cost,
          },
        };
      });

      if (success) {
        jtNotify('success', `Acquired ${def.name}! ${def.emoji}`);
      }
      return success;
    },
    [jtNotify]
  );

  const jtEquipArtifact = useCallback((artifactId: string, equipped: boolean) => {
    setState((prev) => ({
      ...prev,
      artifacts: prev.artifacts.map((a) =>
        a.artifactId === artifactId ? { ...a, equipped } : a
      ),
    }));
  }, []);

  // ── Ability Management ───────────────────────────────────────────────────
  const jtUseAbility = useCallback(
    (abilityId: string) => {
      const def = JT_ABILITY_MAP[abilityId];
      if (!def) return false;

      let success = false;
      setState((prev) => {
        const ability = prev.abilities.find((a) => a.abilityId === abilityId);
        if (!ability || !ability.unlocked) return prev;
        if (ability.cooldownRemaining > 0) return prev;
        if (prev.mana < def.manaCost) return prev;

        success = true;
        return {
          ...prev,
          mana: prev.mana - def.manaCost,
          abilities: prev.abilities.map((a) =>
            a.abilityId === abilityId
              ? { ...a, cooldownRemaining: def.cooldown, totalUses: a.totalUses + 1 }
              : a
          ),
          stats: {
            ...prev.stats,
            totalActionsPerformed: prev.stats.totalActionsPerformed + 1,
          },
        };
      });

      if (success) {
        jtNotify('info', `Used ${def.name}! ${def.emoji} (${def.power} power)`);
      } else {
        jtNotify('warning', `Cannot use ${def.name}: on cooldown or insufficient mana.`);
      }
      return success;
    },
    [jtNotify]
  );

  // ── Event Management ─────────────────────────────────────────────────────
  const jtStartEvent = useCallback(
    (eventId: string) => {
      const def = JT_EVENT_MAP[eventId];
      if (!def) return;

      setState((prev) => {
        const eventState = prev.events.find((e) => e.eventId === eventId);
        if (!eventState || eventState.status !== 'idle') return prev;

        // Check requirement
        const reqLevel = parseInt(def.requirement.split(':')[1], 10);
        if (prev.level < reqLevel) return prev;

        return {
          ...prev,
          events: prev.events.map((e) =>
            e.eventId === eventId
              ? { ...e, status: 'active' as JtEventStatus, startedAt: Date.now(), progress: 0 }
              : e
          ),
        };
      });

      jtNotify('success', `Event started: ${def.name}! ${def.emoji}`);
    },
    [jtNotify]
  );

  const jtClaimEventReward = useCallback(
    (eventId: string) => {
      const def = JT_EVENT_MAP[eventId];
      if (!def) return;

      setState((prev) => {
        const eventState = prev.events.find((e) => e.eventId === eventId);
        if (!eventState || eventState.status !== 'completed' || eventState.rewardClaimed) {
          return prev;
        }

        return {
          ...prev,
          events: prev.events.map((e) =>
            e.eventId === eventId ? { ...e, rewardClaimed: true } : e
          ),
        };
      });

      // Grant reward
      switch (def.reward.type) {
        case 'coins':
          jtGrantCoins(def.reward.amount);
          break;
        case 'xp':
          jtGrantXp(def.reward.amount);
          break;
        case 'mana':
          setState((prev) => ({
            ...prev,
            mana: Math.min(prev.maxMana, prev.mana + def.reward.amount),
          }));
          break;
      }

      jtNotify('achievement', `Claimed reward from ${def.name}: +${def.reward.amount} ${def.reward.type}`);
    },
    [jtGrantCoins, jtGrantXp, jtNotify]
  );

  // ── Title Management ─────────────────────────────────────────────────────
  const jtSetActiveTitle = useCallback((titleId: string) => {
    setState((prev) => ({
      ...prev,
      activeTitleId: titleId,
      titles: prev.titles.map((t) => ({
        ...t,
        isActive: t.titleId === titleId,
      })),
    }));
  }, []);

  const jtUnlockTitle = useCallback(
    (titleId: string) => {
      const def = JT_TITLE_MAP[titleId];
      if (!def) return;

      setState((prev) => ({
        ...prev,
        titles: prev.titles.map((t) =>
          t.titleId === titleId && !t.unlocked
            ? { ...t, unlocked: true, unlockedAt: Date.now() }
            : t
        ),
      }));
      jtNotify('achievement', `Title unlocked: ${def.name}!`);
    },
    [jtNotify]
  );

  // ── Achievement Checking ─────────────────────────────────────────────────
  const jtCheckAchievement = useCallback(
    (condition: string) => {
      const achievement = JT_ACHIEVEMENTS.find((a) => a.condition === condition);
      if (!achievement) return;

      setState((prev) => {
        if (prev.achievements.includes(achievement.id)) return prev;

        return {
          ...prev,
          achievements: [...prev.achievements, achievement.id],
          stats: {
            ...prev.stats,
            totalAchievementsUnlocked: prev.stats.totalAchievementsUnlocked + 1,
          },
        };
      });

      jtNotify('achievement', `🏆 Achievement unlocked: ${achievement.name}!`);
    },
    [jtNotify]
  );

  // ── Material Management ──────────────────────────────────────────────────
  const jtRemoveMaterial = useCallback((materialId: string, quantity: number) => {
    setState((prev) => {
      const slot = prev.materials.find((s) => s.materialId === materialId);
      if (!slot || slot.quantity < quantity) return prev;

      const newQuantity = slot.quantity - quantity;
      const newMaterials =
        newQuantity <= 0
          ? prev.materials.filter((s) => s.materialId !== materialId)
          : prev.materials.map((s) =>
              s.materialId === materialId ? { ...s, quantity: newQuantity } : s
            );

      return { ...prev, materials: newMaterials };
    });
  }, []);

  // ── Daily Reward ─────────────────────────────────────────────────────────
  const jtClaimDailyReward = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setState((prev) => {
      if (prev.dailyRewardClaimed && prev.lastDailyRewardDate === today) return prev;

      const coinReward = 50 + prev.level * 10;
      const xpReward = 20 + prev.level * 5;

      return {
        ...prev,
        dailyRewardClaimed: true,
        lastDailyRewardDate: today,
        coins: prev.coins + coinReward,
        stats: {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + coinReward,
        },
      };
    });

    jtNotify('success', 'Daily reward claimed! Coins and XP received.');
    jtGrantXp(20 + stateRef.current.level * 5);
  }, [jtGrantXp, jtNotify]);

  // ── Settings ─────────────────────────────────────────────────────────────
  const jtUpdateSettings = useCallback((partial: Partial<JtSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  }, []);

  // ── Streak Management ────────────────────────────────────────────────────
  const jtUpdateStreak = useCallback(() => {
    setState((prev) => {
      const now = Date.now();
      const lastAction = prev.lastSaveAt;
      const hoursSince = (now - lastAction) / (1000 * 60 * 60);

      let newStreak: number;
      if (hoursSince < JT_STREAK_DECAY_HOURS) {
        newStreak = prev.stats.currentStreak + 1;
      } else {
        newStreak = 1;
      }

      const newLongest = Math.max(prev.stats.longestStreak, newStreak);

      return {
        ...prev,
        stats: { ...prev.stats, currentStreak: newStreak, longestStreak: newLongest },
      };
    });
  }, []);

  // ── Reset ────────────────────────────────────────────────────────────────
  const jtReset = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    setNotifications([]);
    jtNotify('warning', 'All progress has been reset. The jade path begins anew.');
  }, [jtNotify]);

  // ── Record words typed (generic) ─────────────────────────────────────────
  const jtRecordWords = useCallback(
    (count: number) => {
      setState((prev) => ({
        ...prev,
        stats: { ...prev.stats, totalWordsTyped: prev.stats.totalWordsTyped + count },
      }));
      jtUpdateStreak();

      // Check word-based achievements
      const totalWords = stateRef.current.stats.totalWordsTyped + count;
      if (totalWords >= 10000) {
        jtCheckAchievement('words_typed:10000');
      }
    },
    [jtUpdateStreak, jtCheckAchievement]
  );

  // ━━ COMPUTED VALUES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const jtTotalPower = useMemo(() => {
    return state.creatures
      .filter((c) => c.equipped)
      .reduce((sum, c) => {
        const def = JT_CREATURE_MAP[c.creatureId];
        return sum + (def?.power ?? 0) * c.level;
      }, 0);
  }, [state.creatures]);

  const jtTotalDefense = useMemo(() => {
    return state.creatures
      .filter((c) => c.equipped)
      .reduce((sum, c) => {
        const def = JT_CREATURE_MAP[c.creatureId];
        return sum + (def?.defense ?? 0) * c.level;
      }, 0);
  }, [state.creatures]);

  const jtCreatureSlots = useMemo(() => {
    const roostLevel =
      state.structures.find((s) => s.structureId === 'dragon_roost')?.level ?? 0;
    return JT_CREATURE_SLOTS_BASE + roostLevel + Math.floor(state.level / 5);
  }, [state.structures, state.level]);

  const jtCreatureSlotsUsed = useMemo(() => state.creatures.length, [state.creatures]);

  const jtEquippedCreatures = useMemo(
    () => state.creatures.filter((c) => c.equipped),
    [state.creatures]
  );

  const jtBondedCreatures = useMemo(
    () => state.creatures.filter((c) => c.bonded),
    [state.creatures]
  );

  const jtUniqueMaterials = useMemo(
    () => state.materials.filter((s) => s.quantity > 0).length,
    [state.materials]
  );

  const jtUnlockedChambers = useMemo(
    () =>
      state.chamberProgress.filter(
        (c) => c.status === 'available' || c.status === 'active' || c.status === 'cleared'
      ).length,
    [state.chamberProgress]
  );

  const jtClearedChambers = useMemo(
    () => state.chamberProgress.filter((c) => c.status === 'cleared').length,
    [state.chamberProgress]
  );

  const jtActiveEvents = useMemo(
    () => state.events.filter((e) => e.status === 'active'),
    [state.events]
  );

  const jtCompletedEvents = useMemo(
    () => state.events.filter((e) => e.status === 'completed' && !e.rewardClaimed),
    [state.events]
  );

  const jtUnlockedAbilities = useMemo(
    () => state.abilities.filter((a) => a.unlocked),
    [state.abilities]
  );

  const jtEquippedArtifacts = useMemo(
    () => state.artifacts.filter((a) => a.equipped),
    [state.artifacts]
  );

  const jtActiveTitle = useMemo(() => {
    return JT_TITLE_MAP[state.activeTitleId] ?? JT_TITLES[0];
  }, [state.activeTitleId]);

  const jtUnlockedTitles = useMemo(
    () => state.titles.filter((t) => t.unlocked),
    [state.titles]
  );

  const jtStructureEffects = useMemo(() => {
    const effects: Record<string, number> = {};
    state.structures.forEach((s) => {
      const def = JT_STRUCTURE_MAP[s.structureId];
      if (!def) return;
      Object.entries(def.effectsPerLevel).forEach(([key, value]) => {
        effects[key] = (effects[key] ?? 0) + value * s.level;
      });
    });
    return effects;
  }, [state.structures]);

  const jtCanAscend = useMemo(() => {
    return state.level >= JT_ASCENSION_MIN_LEVEL && state.coins >= JT_ASCENSION_COST;
  }, [state.level, state.coins]);

  const jtAscensionBonus = useMemo(() => {
    return 1 + state.stats.totalAscensions * JT_ASCENSION_XP_BONUS;
  }, [state.stats.totalAscensions]);

  const jtOverallRating = useMemo(() => {
    const score =
      state.level * 10 +
      state.stats.totalCreaturesCollected * 15 +
      state.stats.totalChambersCleared * 20 +
      state.stats.totalAchievementsUnlocked * 30 +
      state.stats.totalAscensions * 50 +
      jtEquippedArtifacts.length * 25;
    if (score >= 2000) return 'Transcendent';
    if (score >= 1000) return 'Legendary';
    if (score >= 500) return 'Epic';
    if (score >= 200) return 'Rare';
    if (score >= 50) return 'Uncommon';
    return 'Novice';
  }, [
    state.level,
    state.stats.totalCreaturesCollected,
    state.stats.totalChambersCleared,
    state.stats.totalAchievementsUnlocked,
    state.stats.totalAscensions,
    jtEquippedArtifacts.length,
  ]);

  const jtIsStarterCreatureOwned = useMemo(() => {
    return state.creatures.some((c) => c.creatureId === JT_STARTER_CREATURE_ID);
  }, [state.creatures]);

  // ━━ ACTION MAP (for generic dispatch) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const jtActions: Record<JtAction, (...args: unknown[]) => void> = useMemo(
    () => ({
      train: (creatureId: unknown) =>
        jtActionTrain(creatureId as string, 1),
      meditate: () => jtActionMeditate(1),
      sculpt: () => jtActionSculpt(1),
      chant: () => jtActionChant(1),
      heal: (creatureId: unknown) =>
        jtActionHeal(creatureId as string, 1),
      enchant: (creatureId: unknown) =>
        jtActionEnchant(creatureId as string, 1),
      ascend: () => jtActionAscend(),
    }),
    [
      jtActionTrain,
      jtActionMeditate,
      jtActionSculpt,
      jtActionChant,
      jtActionHeal,
      jtActionEnchant,
      jtActionAscend,
    ]
  );

  // ━━ RETURN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return {
    // State
    state,
    isLoaded,
    notifications,

    // Actions
    jtActionTrain,
    jtActionMeditate,
    jtActionSculpt,
    jtActionChant,
    jtActionHeal,
    jtActionEnchant,
    jtActionAscend,
    jtActions,

    // Creature management
    jtAcquireCreature,
    jtBondCreature,
    jtEquipCreature,
    jtReleaseCreature,

    // Structure management
    jtBuildStructure,
    jtUpgradeStructure,

    // Chamber management
    jtVisitChamber,

    // Artifact management
    jtAcquireArtifact,
    jtEquipArtifact,

    // Ability management
    jtUseAbility,

    // Event management
    jtStartEvent,
    jtClaimEventReward,

    // Title management
    jtSetActiveTitle,
    jtUnlockTitle,

    // Achievement
    jtCheckAchievement,

    // Material
    jtRemoveMaterial,

    // Helpers
    jtRecordWords,
    jtGrantXp,
    jtGrantCoins,
    jtSpendCoins,
    jtGetXpToNextLevel,
    jtGetXpProgress,
    jtUpdateSettings,
    jtUpdateStreak,
    jtClaimDailyReward,
    jtNotify,
    jtDismissNotification,
    jtClearNotifications,
    jtSave,
    jtReset,

    // Computed
    jtTotalPower,
    jtTotalDefense,
    jtCreatureSlots,
    jtCreatureSlotsUsed,
    jtEquippedCreatures,
    jtBondedCreatures,
    jtUniqueMaterials,
    jtUnlockedChambers,
    jtClearedChambers,
    jtActiveEvents,
    jtCompletedEvents,
    jtUnlockedAbilities,
    jtEquippedArtifacts,
    jtActiveTitle,
    jtUnlockedTitles,
    jtStructureEffects,
    jtCanAscend,
    jtAscensionBonus,
    jtOverallRating,
    jtIsStarterCreatureOwned,

    // Constants re-exported for convenience
    JT_COLORS,
    JT_RARITY_COLORS,
    JT_RARITY_BG,
    JT_SPECIES_COLORS,
    JT_ACTION_COLORS,
    JT_GRADIENT_TEMPLE,
    JT_GRADIENT_CELESTIAL,
    JT_GRADIENT_DRACONIC,
    JT_GRADIENT_SHADOW,
    JT_SPECIES,
    JT_SPECIES_MAP,
    JT_CREATURES,
    JT_CREATURE_MAP,
    JT_CREATURES_BY_SPECIES,
    JT_CHAMBERS,
    JT_CHAMBER_MAP,
    JT_MATERIALS,
    JT_MATERIAL_MAP,
    JT_STRUCTURES,
    JT_STRUCTURE_MAP,
    JT_ABILITIES,
    JT_ABILITY_MAP,
    JT_ABILITIES_BY_CATEGORY,
    JT_ACHIEVEMENTS,
    JT_ACHIEVEMENT_MAP,
    JT_TITLES,
    JT_TITLE_MAP,
    JT_ARTIFACTS,
    JT_ARTIFACT_MAP,
    JT_EVENTS,
    JT_EVENT_MAP,
  };
}
