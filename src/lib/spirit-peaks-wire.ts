'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// =============================================================================
// SPIRIT PEAKS — 灵峰山岳 — Sacred Mountain Range Wire Module
// Color theme: mountain gray #78909C, spirit gold #FFD54F, mist white #ECEFF1,
//              temple red #C62828, sky cyan #4DD0E1
// =============================================================================

// =============================================================================
// SECTION 1: TYPES
// =============================================================================

export type SPRarity =
  | 'mountain_spirit'
  | 'stone_guardian'
  | 'cloud_walker'
  | 'thunder_sage'
  | 'dragon_ancestor';

export type SPPeakId =
  | 'jade_brook_trail'
  | 'mist_valley_pass'
  | 'ancient_pine_summit'
  | 'thunder_cliff_path'
  | 'cloud_mist_ridge'
  | 'frozen_lotus_peak'
  | 'spirit_eagle_nest'
  | 'enlightenment_zenith';

export type SPEquipmentSlot = 'head' | 'chest' | 'hands' | 'legs' | 'feet' | 'weapon' | 'shield' | 'accessory';

export type SPElementType = 'earth' | 'wind' | 'water' | 'fire' | 'spirit' | 'thunder';

export interface SPRarityDef {
  readonly key: SPRarity;
  readonly label: string;
  readonly color: string;
  readonly xpMultiplier: number;
  readonly encounterWeight: number;
  readonly description: string;
}

export interface SPCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly rarity: SPRarity;
  readonly hp: number;
  readonly power: number;
  readonly speed: number;
  readonly xpReward: number;
  readonly chiReward: number;
  readonly description: string;
  readonly icon: string;
  readonly element: SPElementType;
  readonly canTame: boolean;
  readonly tamingDifficulty: number;
  readonly peakAffinity: SPPeakId[];
}

export interface SPPeakDef {
  readonly id: SPPeakId;
  readonly name: string;
  readonly description: string;
  readonly unlockAltitude: number;
  readonly dangerLevel: number;
  readonly baseXp: number;
  readonly baseChi: number;
  readonly icon: string;
  readonly elevation: number;
  readonly hazards: string[];
  readonly bossCreatureId: string | null;
  readonly templeId: string | null;
}

export interface SPEquipmentDef {
  readonly id: string;
  readonly name: string;
  readonly slot: SPEquipmentSlot;
  readonly rarity: SPRarity;
  readonly defense: number;
  readonly chiResist: number;
  readonly spiritPower: number;
  readonly description: string;
  readonly icon: string;
  readonly requiredLevel: number;
}

export interface SPStructureDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly maxLevel: number;
  readonly baseCost: number;
  readonly costPerLevel: number;
  readonly chiPerDay: number;
  readonly reputationPerDay: number;
  readonly tier: number;
}

export interface SPAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly cooldown: number;
  readonly power: number;
  readonly chiCost: number;
  readonly unlockCost: number;
  readonly element: SPElementType;
  readonly isPassive: boolean;
}

export interface SPAchievementDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly conditionKey: string;
  readonly targetValue: number;
  readonly xpReward: number;
  readonly chiReward: number;
  readonly icon: string;
}

export interface SPTitleDef {
  readonly id: string;
  readonly name: string;
  readonly requiredReputation: number;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
  readonly bonusMultiplier: number;
}

export interface SPCreatureState {
  readonly creatureId: string;
  readonly tamed: boolean;
  readonly tamedAt: number | null;
  readonly nickname: string;
  readonly level: number;
  readonly xp: number;
  readonly bondStrength: number;
}

export interface SPStructureState {
  readonly structureId: string;
  readonly level: number;
  readonly builtAt: number;
  readonly lastCollected: number;
}

export interface SPAchievementState {
  readonly id: string;
  readonly unlocked: boolean;
  readonly unlockedAt: number | null;
  readonly currentValue: number;
}

export interface SPEquipmentState {
  readonly equipmentId: string;
  readonly owned: boolean;
  readonly equipped: boolean;
  readonly acquiredAt: number;
  readonly upgrades: number;
}

export interface SPAbilityState {
  readonly abilityId: string;
  readonly unlocked: boolean;
  readonly unlockedAt: number | null;
  readonly lastUsedAt: number;
  readonly totalUses: number;
}

export interface SPTamingProgress {
  readonly creatureId: string;
  readonly progress: number;
  readonly maxProgress: number;
  readonly startedAt: number | null;
  readonly completed: boolean;
}

export interface SPDailyTask {
  readonly date: string;
  readonly creaturesTamed: number;
  readonly peaksClimbed: number;
  readonly meditationsCompleted: number;
  readonly structuresUpgraded: number;
  readonly abilitiesActivated: number;
  readonly martialArtsTrained: number;
  readonly templesDiscovered: number;
  readonly chiChanneled: number;
  readonly isComplete: boolean;
  readonly rewardClaimed: boolean;
}

export interface SPMeditationSession {
  readonly startedAt: number;
  readonly endedAt: number | null;
  readonly depth: number;
  readonly chiGained: number;
  readonly peakId: string;
  readonly wasEnlightened: boolean;
}

export type SPMountainEventId =
  | 'spirit_festival'
  | 'dragon_ascent'
  | 'thunder_trial'
  | 'lotus_bloom'
  | 'eagle_migration'
  | 'chi_surge'
  | 'mist_revelation'
  | 'ancestor_vigil';

export interface SPMountainEventDef {
  readonly id: SPMountainEventId;
  readonly name: string;
  readonly description: string;
  readonly durationHours: number;
  readonly chiMultiplier: number;
  readonly reputationMultiplier: number;
  readonly tamingBonus: number;
  readonly meditationBonus: number;
  readonly icon: string;
  readonly color: string;
}

export interface SPSpiritHerbDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly rarity: SPRarity;
  readonly chiRestore: number;
  readonly enlightenmentBonus: number;
  readonly tamingBoost: number;
  readonly meditationBoost: number;
  readonly martialBoost: number;
  readonly peakAffinity: SPPeakId[];
}

export interface SPSpiritHerbState {
  readonly herbId: string;
  readonly quantity: number;
  readonly firstFoundAt: number | null;
}

export interface SPEventLog {
  readonly eventId: string;
  readonly startedAt: number;
  readonly endedAt: number;
  readonly chiGained: number;
  readonly reputationGained: number;
}

export interface SPState {
  readonly creatures: Record<string, SPCreatureState>;
  readonly peaks: Record<string, { visited: boolean; visitsCount: number; firstVisitAt: number | null; highestAltitude: number }>;
  readonly equipment: Record<string, SPEquipmentState>;
  readonly structures: Record<string, SPStructureState>;
  readonly abilities: Record<string, SPAbilityState>;
  readonly achievements: Record<string, SPAchievementState>;
  readonly currentPeak: SPPeakId;
  readonly chiEnergy: number;
  readonly totalChiGained: number;
  readonly enlightenment: number;
  readonly altitudeReached: number;
  readonly creaturesBefriended: number;
  readonly titleIndex: number;
  readonly templeReputation: number;
  readonly totalReputation: number;
  readonly meditationDepth: number;
  readonly maxMeditationDepth: number;
  readonly meditationCount: number;
  readonly totalMeditationTime: number;
  readonly martialArtsLevel: number;
  readonly martialArtsXp: number;
  readonly martialArtsSessionsCompleted: number;
  readonly templesDiscovered: number;
  readonly totalChiChanneled: number;
  readonly dailyTrainingTask: SPDailyTask;
  readonly tamingProgress: Record<string, SPTamingProgress>;
  readonly spiritHerbs: Record<string, SPSpiritHerbState>;
  readonly activeEvent: SPMountainEventId | null;
  readonly eventEndTime: number | null;
  readonly eventHistory: SPEventLog[];
  readonly lastDailyReset: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

// =============================================================================
// SECTION 2: CONSTANTS (SP_ prefixed)
// =============================================================================

export const SP_MOUNTAIN_GRAY = '#78909C';
export const SP_SPIRIT_GOLD = '#FFD54F';
export const SP_MIST_WHITE = '#ECEFF1';
export const SP_TEMPLE_RED = '#C62828';
export const SP_SKY_CYAN = '#4DD0E1';
export const SP_DEEP_STONE = '#37474F';
export const SP_JADE_GREEN = '#4DB6AC';
export const SP_AURORA_VIOLET = '#AB47BC';
export const SP_SNOW_PEAK = '#CFD8DC';
export const SP_BAMBOO_SAGE = '#8D6E63';

export const SP_MAX_LEVEL = 50;
export const SP_MAX_CHI = 999_999;
export const SP_MAX_ENLIGHTENMENT = 1000;
export const SP_MAX_ALTITUDE = 8848;
export const SP_MAX_MEDITATION_DEPTH = 100;
export const SP_MAX_MARTIAL_ARTS_LEVEL = 99;
export const SP_MAX_TITLE_INDEX = 7;
export const SP_MAX_STRUCTURE_LEVEL = 10;
export const SP_MAX_BOND_STRENGTH = 100;
export const SP_DAILY_RESET_MS = 86_400_000;
export const SP_TAMING_COOLDOWN_MS = 15_000;
export const SP_MEDITATION_BASE_DURATION_MS = 30_000;
export const SP_CHI_CHANNEL_COOLDOWN_MS = 10_000;
export const SP_ABILITY_BASE_COOLDOWN_MS = 5_000;
export const SP_TRAINING_SESSION_MS = 20_000;

export const SP_THEME_COLORS = {
  mountainGray: SP_MOUNTAIN_GRAY,
  spiritGold: SP_SPIRIT_GOLD,
  mistWhite: SP_MIST_WHITE,
  templeRed: SP_TEMPLE_RED,
  skyCyan: SP_SKY_CYAN,
  deepStone: SP_DEEP_STONE,
  jadeGreen: SP_JADE_GREEN,
  auroraViolet: SP_AURORA_VIOLET,
  snowPeak: SP_SNOW_PEAK,
  bambooSage: SP_BAMBOO_SAGE,
  dawnAmber: '#FF8F00',
  moonlightSilver: '#B0BEC5',
  thunderBlue: '#42A5F5',
  earthBrown: '#6D4C41',
  cloudLavender: '#CE93D8',
  frostIce: '#80DEEA',
  ancientBronze: '#A1887F',
  spiritFlame: '#FF7043',
} as const;

export const SP_RARITY_DEFS: readonly SPRarityDef[] = [
  { key: 'mountain_spirit', label: 'Mountain Spirit', color: SP_THEME_COLORS.moonlightSilver, xpMultiplier: 1.0, encounterWeight: 40, description: 'Common spirits that inhabit the lower mountain paths.' },
  { key: 'stone_guardian', label: 'Stone Guardian', color: SP_THEME_COLORS.earthBrown, xpMultiplier: 1.5, encounterWeight: 28, description: 'Stubborn guardians carved from living mountain stone.' },
  { key: 'cloud_walker', label: 'Cloud Walker', color: SP_THEME_COLORS.cloudLavender, xpMultiplier: 2.5, encounterWeight: 18, description: 'Ethereal beings that drift among the mountain clouds.' },
  { key: 'thunder_sage', label: 'Thunder Sage', color: SP_THEME_COLORS.thunderBlue, xpMultiplier: 4.0, encounterWeight: 10, description: 'Wise ancients who command the thunder of the peaks.' },
  { key: 'dragon_ancestor', label: 'Dragon Ancestor', color: SP_THEME_COLORS.spiritGold, xpMultiplier: 7.0, encounterWeight: 4, description: 'Legendary dragon spirits from the dawn of the mountains.' },
] as const;

// =============================================================================
// SECTION 3: MOUNTAIN PEAKS (8)
// =============================================================================

export const SP_PEAKS: readonly SPPeakDef[] = [
  {
    id: 'jade_brook_trail', name: 'Jade Brook Trail', unlockAltitude: 0,
    description: 'A gentle path alongside a crystal-clear brook where young monks begin their journey among bamboo groves and morning mist.',
    dangerLevel: 1, baseXp: 10, baseChi: 5, icon: '🏞️', elevation: 800,
    hazards: ['slippery_rocks', 'bamboo_tangle', 'morning_mist'],
    bossCreatureId: null, templeId: null,
  },
  {
    id: 'mist_valley_pass', name: 'Mist Valley Pass', unlockAltitude: 1500,
    description: 'A winding pass through a valley perpetually shrouded in mystical mist where fox spirits play tricks on travelers.',
    dangerLevel: 2, baseXp: 20, baseChi: 12, icon: '🌫️', elevation: 1800,
    hazards: ['thick_mist', 'fox_illusion', 'cold_dew'],
    bossCreatureId: 'mist_fox_sage', templeId: 'hidden_mist_temple',
  },
  {
    id: 'ancient_pine_summit', name: 'Ancient Pine Summit', unlockAltitude: 3000,
    description: 'A summit ringed with thousand-year-old pines where wood spirits meditate and ancient monks carved scripture into bark.',
    dangerLevel: 3, baseXp: 35, baseChi: 22, icon: '🌲', elevation: 3200,
    hazards: ['falling_cones', 'root_trap', 'spirit_wind'],
    bossCreatureId: 'pine_elder', templeId: 'pine_hermitage',
  },
  {
    id: 'thunder_cliff_path', name: 'Thunder Cliff Path', unlockAltitude: 4500,
    description: 'A perilous path along sheer cliffs where thunder spirits test the resolve of those who dare climb higher.',
    dangerLevel: 4, baseXp: 55, baseChi: 35, icon: '⚡', elevation: 4800,
    hazards: ['lightning_strike', 'loose_gravel', 'thunder_echo'],
    bossCreatureId: 'thunder_cliff_guardian', templeId: 'thunder_shrine',
  },
  {
    id: 'cloud_mist_ridge', name: 'Cloud Mist Ridge', unlockAltitude: 5500,
    description: 'A ridge above the cloud line where cloud walkers drift in eternal twilight and reality bends at the edges.',
    dangerLevel: 5, baseXp: 80, baseChi: 50, icon: '☁️', elevation: 5800,
    hazards: ['vertigo', 'cloud_displacement', 'spirit_vortex'],
    bossCreatureId: 'ridge_sovereign', templeId: 'cloud_sanctuary',
  },
  {
    id: 'frozen_lotus_peak', name: 'Frozen Lotus Peak', unlockAltitude: 6500,
    description: 'An eternally frozen peak where mystical lotus flowers bloom in ice and frost spirits guard ancient secrets.',
    dangerLevel: 6, baseXp: 110, baseChi: 70, icon: '🪷', elevation: 6800,
    hazards: ['blizzard', 'ice_mirror', 'frostbite'],
    bossCreatureId: 'frost_lotus_dragon', templeId: 'ice_lotus_temple',
  },
  {
    id: 'spirit_eagle_nest', name: 'Spirit Eagle Nest', unlockAltitude: 7500,
    description: 'The highest accessible roost where spirit eagles nest and the wind carries whispers of the mountain ancestors.',
    dangerLevel: 7, baseXp: 150, baseChi: 100, icon: '🦅', elevation: 7800,
    hazards: ['eagle_dive', 'gale_force', 'ancestor_whisper'],
    bossCreatureId: 'great_spirit_eagle', templeId: 'eagle_shrine',
  },
  {
    id: 'enlightenment_zenith', name: 'Enlightenment Zenith', unlockAltitude: 8500,
    description: 'The sacred summit where all spiritual energy converges. Those who reach here may achieve true enlightenment.',
    dangerLevel: 8, baseXp: 250, baseChi: 200, icon: '☸️', elevation: 8848,
    hazards: ['reality_shift', 'chi_overload', 'enlightenment_trance'],
    bossCreatureId: 'zenith_dragon_ancestor', templeId: 'zenith_temple',
  },
] as const;

// =============================================================================
// SECTION 4: SPIRIT CREATURES (35, 5 rarity tiers)
// =============================================================================

export const SP_CREATURES: readonly SPCreatureDef[] = [
  // Mountain Spirit (7) — Common
  {
    id: 'stone_fox', name: 'Stone Fox', rarity: 'mountain_spirit', hp: 18, power: 4, speed: 16,
    xpReward: 8, chiReward: 3, description: 'A small fox with a coat of smooth river stones that gleam in moonlight.',
    icon: '🦊', element: 'earth', canTame: true, tamingDifficulty: 1, peakAffinity: ['jade_brook_trail', 'mist_valley_pass'],
  },
  {
    id: 'bamboo_spirit', name: 'Bamboo Spirit', rarity: 'mountain_spirit', hp: 14, power: 3, speed: 20,
    xpReward: 6, chiReward: 2, description: 'A gentle spirit that sways between bamboo stalks, playing soft melodies.',
    icon: '🎋', element: 'wind', canTame: true, tamingDifficulty: 1, peakAffinity: ['jade_brook_trail'],
  },
  {
    id: 'brook_turtle', name: 'Brook Turtle', rarity: 'mountain_spirit', hp: 25, power: 2, speed: 6,
    xpReward: 7, chiReward: 4, description: 'An ancient turtle that carries a miniature mountain on its shell.',
    icon: '🐢', element: 'water', canTame: true, tamingDifficulty: 1, peakAffinity: ['jade_brook_trail', 'mist_valley_pass'],
  },
  {
    id: 'mist_hare', name: 'Mist Hare', rarity: 'mountain_spirit', hp: 12, power: 3, speed: 22,
    xpReward: 7, chiReward: 3, description: 'A hare that can dissolve into mist and reform anywhere nearby.',
    icon: '🐰', element: 'spirit', canTame: true, tamingDifficulty: 2, peakAffinity: ['mist_valley_pass'],
  },
  {
    id: 'pine_squirrel', name: 'Pine Squirrel', rarity: 'mountain_spirit', hp: 10, power: 2, speed: 25,
    xpReward: 5, chiReward: 2, description: 'A nimble squirrel that hoards spiritual acorns with restorative properties.',
    icon: '🐿️', element: 'earth', canTame: true, tamingDifficulty: 1, peakAffinity: ['ancient_pine_summit'],
  },
  {
    id: 'dew_fairy', name: 'Dew Fairy', rarity: 'mountain_spirit', hp: 8, power: 5, speed: 18,
    xpReward: 8, chiReward: 3, description: 'A tiny fairy that rides on morning dewdrops, casting minor illusions.',
    icon: '🧚', element: 'water', canTame: true, tamingDifficulty: 2, peakAffinity: ['jade_brook_trail', 'mist_valley_pass'],
  },
  {
    id: 'stone_cricket', name: 'Stone Cricket', rarity: 'mountain_spirit', hp: 10, power: 3, speed: 20,
    xpReward: 6, chiReward: 2, description: 'A cricket made of pebbles whose song strengthens the resolve of nearby monks.',
    icon: '🦗', element: 'earth', canTame: true, tamingDifficulty: 1, peakAffinity: ['jade_brook_trail', 'ancient_pine_summit'],
  },
  // Stone Guardian (7) — Uncommon
  {
    id: 'granite_golem', name: 'Granite Golem', rarity: 'stone_guardian', hp: 90, power: 14, speed: 4,
    xpReward: 22, chiReward: 10, description: 'A massive golem of interlocking granite slabs that guards mountain passes.',
    icon: '🗿', element: 'earth', canTame: false, tamingDifficulty: 0, peakAffinity: ['mist_valley_pass'],
  },
  {
    id: 'iron_rhinoceros', name: 'Iron Rhinoceros', rarity: 'stone_guardian', hp: 110, power: 18, speed: 6,
    xpReward: 25, chiReward: 12, description: 'A rhino with a hide of living iron ore that charges without hesitation.',
    icon: '🦏', element: 'earth', canTame: true, tamingDifficulty: 5, peakAffinity: ['ancient_pine_summit'],
  },
  {
    id: 'jade_serpent', name: 'Jade Serpent', rarity: 'stone_guardian', hp: 70, power: 16, speed: 10,
    xpReward: 20, chiReward: 11, description: 'A serpent of pure jade that slides silently through mountain crevices.',
    icon: '🐍', element: 'earth', canTame: true, tamingDifficulty: 4, peakAffinity: ['jade_brook_trail', 'mist_valley_pass'],
  },
  {
    id: 'boulder_boar', name: 'Boulder Boar', rarity: 'stone_guardian', hp: 85, power: 20, speed: 8,
    xpReward: 23, chiReward: 10, description: 'A wild boar with a body encrusted in boulders that it uses as armor.',
    icon: '🐗', element: 'earth', canTame: true, tamingDifficulty: 5, peakAffinity: ['ancient_pine_summit'],
  },
  {
    id: 'crystal_stag', name: 'Crystal Stag', rarity: 'stone_guardian', hp: 75, power: 12, speed: 14,
    xpReward: 24, chiReward: 13, description: 'A majestic stag whose antlers grow natural mountain crystals.',
    icon: '🦌', element: 'spirit', canTame: true, tamingDifficulty: 4, peakAffinity: ['thunder_cliff_path'],
  },
  {
    id: 'basalt_tortoise', name: 'Basalt Tortoise', rarity: 'stone_guardian', hp: 130, power: 10, speed: 3,
    xpReward: 26, chiReward: 14, description: 'An enormous tortoise of basalt that moves once per generation.',
    icon: '🐢', element: 'earth', canTame: false, tamingDifficulty: 0, peakAffinity: ['ancient_pine_summit'],
  },
  {
    id: 'slate_wolf', name: 'Slate Wolf', rarity: 'stone_guardian', hp: 65, power: 17, speed: 12,
    xpReward: 21, chiReward: 11, description: 'A wolf pack leader with a pelt of overlapping slate scales.',
    icon: '🐺', element: 'earth', canTame: true, tamingDifficulty: 5, peakAffinity: ['mist_valley_pass', 'ancient_pine_summit'],
  },
  // Cloud Walker (7) — Rare
  {
    id: 'mist_fox_sage', name: 'Mist Fox Sage', rarity: 'cloud_walker', hp: 180, power: 28, speed: 14,
    xpReward: 50, chiReward: 28, description: 'An ancient fox sage that commands legions of lesser mist creatures.',
    icon: '🦊', element: 'spirit', canTame: true, tamingDifficulty: 7, peakAffinity: ['mist_valley_pass'],
  },
  {
    id: 'wind_phoenix', name: 'Wind Phoenix', rarity: 'cloud_walker', hp: 150, power: 35, speed: 18,
    xpReward: 55, chiReward: 30, description: 'A phoenix born from mountain wind currents, reborn in every storm.',
    icon: '🦅', element: 'wind', canTame: true, tamingDifficulty: 8, peakAffinity: ['thunder_cliff_path', 'cloud_mist_ridge'],
  },
  {
    id: 'cloud_dragon', name: 'Cloud Dragon', rarity: 'cloud_walker', hp: 220, power: 32, speed: 12,
    xpReward: 58, chiReward: 32, description: 'A serpentine dragon that weaves through cloud banks like water.',
    icon: '🐲', element: 'spirit', canTame: true, tamingDifficulty: 8, peakAffinity: ['cloud_mist_ridge'],
  },
  {
    id: 'frost_swan', name: 'Frost Swan', rarity: 'cloud_walker', hp: 140, power: 26, speed: 16,
    xpReward: 48, chiReward: 26, description: 'A swan whose feathers freeze the air and create ice pathways.',
    icon: '🦢', element: 'water', canTame: true, tamingDifficulty: 7, peakAffinity: ['frozen_lotus_peak'],
  },
  {
    id: 'storm_sparrow', name: 'Storm Sparrow', rarity: 'cloud_walker', hp: 100, power: 40, speed: 24,
    xpReward: 46, chiReward: 25, description: 'A tiny sparrow that rides lightning bolts and carries thunder in its song.',
    icon: '🐦', element: 'thunder', canTame: true, tamingDifficulty: 7, peakAffinity: ['thunder_cliff_path'],
  },
  {
    id: 'pine_elder', name: 'Pine Elder', rarity: 'cloud_walker', hp: 200, power: 30, speed: 6,
    xpReward: 52, chiReward: 30, description: 'The consciousness of a thousand-year-old pine tree given form.',
    icon: '🌲', element: 'earth', canTame: false, tamingDifficulty: 0, peakAffinity: ['ancient_pine_summit'],
  },
  {
    id: 'ridge_sovereign', name: 'Ridge Sovereign', rarity: 'cloud_walker', hp: 250, power: 34, speed: 10,
    xpReward: 60, chiReward: 35, description: 'The self-appointed king of the cloud ridge, draped in living mist.',
    icon: '👑', element: 'spirit', canTame: true, tamingDifficulty: 9, peakAffinity: ['cloud_mist_ridge'],
  },
  // Thunder Sage (7) — Epic
  {
    id: 'thunder_cliff_guardian', name: 'Thunder Cliff Guardian', rarity: 'thunder_sage', hp: 400, power: 55, speed: 8,
    xpReward: 100, chiReward: 60, description: 'A towering humanoid of condensed thunder that patrols the cliff path eternally.',
    icon: '⚡', element: 'thunder', canTame: false, tamingDifficulty: 0, peakAffinity: ['thunder_cliff_path'],
  },
  {
    id: 'frost_lotus_dragon', name: 'Frost Lotus Dragon', rarity: 'thunder_sage', hp: 450, power: 50, speed: 10,
    xpReward: 110, chiReward: 65, description: 'A dragon of pure ice that breathes frozen lotus petals as weapons.',
    icon: '🐉', element: 'water', canTame: false, tamingDifficulty: 0, peakAffinity: ['frozen_lotus_peak'],
  },
  {
    id: 'great_spirit_eagle', name: 'Great Spirit Eagle', rarity: 'thunder_sage', hp: 350, power: 60, speed: 16,
    xpReward: 105, chiReward: 62, description: 'The king of all spirit eagles, whose wingspan blots out the mountain sun.',
    icon: '🦅', element: 'wind', canTame: true, tamingDifficulty: 12, peakAffinity: ['spirit_eagle_nest'],
  },
  {
    id: 'chi_elemental', name: 'Chi Elemental', rarity: 'thunder_sage', hp: 300, power: 70, speed: 12,
    xpReward: 115, chiReward: 70, description: 'A being of pure chi energy that shifts between forms unpredictably.',
    icon: '✨', element: 'spirit', canTame: false, tamingDifficulty: 0, peakAffinity: ['cloud_mist_ridge', 'enlightenment_zenith'],
  },
  {
    id: 'stone_monk_giant', name: 'Stone Monk Giant', rarity: 'thunder_sage', hp: 550, power: 48, speed: 5,
    xpReward: 108, chiReward: 58, description: 'A giant statue of a meditating monk that came alive centuries ago.',
    icon: '🗿', element: 'earth', canTame: false, tamingDifficulty: 0, peakAffinity: ['ancient_pine_summit', 'thunder_cliff_path'],
  },
  {
    id: 'avalanche_spirit', name: 'Avalanche Spirit', rarity: 'thunder_sage', hp: 380, power: 65, speed: 14,
    xpReward: 112, chiReward: 64, description: 'A vengeful spirit that takes the form of a living avalanche.',
    icon: '🏔️', element: 'earth', canTame: false, tamingDifficulty: 0, peakAffinity: ['thunder_cliff_path', 'frozen_lotus_peak'],
  },
  {
    id: 'moonlight_tiger', name: 'Moonlight Tiger', rarity: 'thunder_sage', hp: 320, power: 58, speed: 18,
    xpReward: 106, chiReward: 63, description: 'A spectral tiger that appears only under full moonlight on the peaks.',
    icon: '🐯', element: 'spirit', canTame: true, tamingDifficulty: 11, peakAffinity: ['cloud_mist_ridge', 'spirit_eagle_nest'],
  },
  // Dragon Ancestor (7) — Legendary
  {
    id: 'zenith_dragon_ancestor', name: 'Zenith Dragon Ancestor', rarity: 'dragon_ancestor', hp: 1200, power: 120, speed: 10,
    xpReward: 300, chiReward: 200, description: 'The primordial dragon that formed the mountain range with its body.',
    icon: '🐉', element: 'spirit', canTame: false, tamingDifficulty: 0, peakAffinity: ['enlightenment_zenith'],
  },
  {
    id: 'celestial_phoenix', name: 'Celestial Phoenix', rarity: 'dragon_ancestor', hp: 800, power: 100, speed: 20,
    xpReward: 250, chiReward: 160, description: 'The original phoenix whose tears created the Jade Brook at the mountain base.',
    icon: '🔥', element: 'fire', canTame: false, tamingDifficulty: 0, peakAffinity: ['spirit_eagle_nest', 'enlightenment_zenith'],
  },
  {
    id: 'earthquake_wyrm', name: 'Earthquake Wyrm', rarity: 'dragon_ancestor', hp: 1000, power: 110, speed: 6,
    xpReward: 270, chiReward: 180, description: 'A massive wyrm whose tunnels run through the entire mountain range.',
    icon: '🐛', element: 'earth', canTame: false, tamingDifficulty: 0, peakAffinity: ['ancient_pine_summit', 'thunder_cliff_path'],
  },
  {
    id: 'storm_emperor', name: 'Storm Emperor', rarity: 'dragon_ancestor', hp: 900, power: 130, speed: 14,
    xpReward: 280, chiReward: 190, description: 'The emperor of all mountain storms who judges the worthy at the highest peaks.',
    icon: '⛈️', element: 'thunder', canTame: false, tamingDifficulty: 0, peakAffinity: ['thunder_cliff_path', 'spirit_eagle_nest'],
  },
  {
    id: 'ancestral_crane', name: 'Ancestral Crane', rarity: 'dragon_ancestor', hp: 700, power: 90, speed: 22,
    xpReward: 240, chiReward: 150, description: 'A crane that has lived for ten thousand years, carrying wisdom of the ancients.',
    icon: '🦢', element: 'spirit', canTame: true, tamingDifficulty: 15, peakAffinity: ['enlightenment_zenith'],
  },
  {
    id: 'void_titan', name: 'Void Titan', rarity: 'dragon_ancestor', hp: 1400, power: 115, speed: 4,
    xpReward: 310, chiReward: 210, description: 'A being from the space between peaks where reality frays at the edges.',
    icon: '🌑', element: 'spirit', canTame: false, tamingDifficulty: 0, peakAffinity: ['enlightenment_zenith'],
  },
  {
    id: 'golden_mountain_spirit', name: 'Golden Mountain Spirit', rarity: 'dragon_ancestor', hp: 1100, power: 105, speed: 8,
    xpReward: 290, chiReward: 195, description: 'The collective spirit of all mountains in the range, manifesting as golden light.',
    icon: '✨', element: 'spirit', canTame: false, tamingDifficulty: 0, peakAffinity: ['enlightenment_zenith', 'cloud_mist_ridge'],
  },
] as const;

// =============================================================================
// SECTION 5: TRAINING EQUIPMENT (30)
// =============================================================================

export const SP_EQUIPMENT: readonly SPEquipmentDef[] = [
  // Mountain Spirit tier — Common (6)
  { id: 'bamboo_staff', name: 'Bamboo Staff', slot: 'weapon', rarity: 'mountain_spirit', defense: 0, chiResist: 3, spiritPower: 2, description: 'A simple staff of mountain bamboo, light yet surprisingly strong.', icon: '🎋', requiredLevel: 1 },
  { id: 'monk_robe', name: 'Monk Robe', slot: 'chest', rarity: 'mountain_spirit', defense: 5, chiResist: 4, spiritPower: 1, description: 'A humble robe woven from mountain hemp that offers basic protection.', icon: '👘', requiredLevel: 1 },
  { id: 'straw_hat', name: 'Straw Hat', slot: 'head', rarity: 'mountain_spirit', defense: 2, chiResist: 3, spiritPower: 1, description: 'A wide-brimmed hat that shields against mountain sun and rain.', icon: '👒', requiredLevel: 1 },
  { id: 'sandals_path', name: 'Path Sandals', slot: 'feet', rarity: 'mountain_spirit', defense: 2, chiResist: 5, spiritPower: 1, description: 'Sandals blessed by the path spirits for sure footing.', icon: '🩴', requiredLevel: 1 },
  { id: 'prayer_beads', name: 'Prayer Beads', slot: 'accessory', rarity: 'mountain_spirit', defense: 0, chiResist: 6, spiritPower: 3, description: 'Simple wooden beads that help focus chi during meditation.', icon: '📿', requiredLevel: 2 },
  { id: 'cloth_wraps', name: 'Cloth Hand Wraps', slot: 'hands', rarity: 'mountain_spirit', defense: 3, chiResist: 2, spiritPower: 2, description: 'Cloth wraps that support the hands during martial training.', icon: '🥊', requiredLevel: 2 },
  // Stone Guardian tier — Uncommon (6)
  { id: 'stone_fist_gauntlets', name: 'Stone Fist Gauntlets', slot: 'hands', rarity: 'stone_guardian', defense: 6, chiResist: 5, spiritPower: 4, description: 'Gauntlets of reinforced stone that amplify striking power.', icon: '🧤', requiredLevel: 6 },
  { id: 'granite_vest', name: 'Granite Vest', slot: 'chest', rarity: 'stone_guardian', defense: 12, chiResist: 8, spiritPower: 3, description: 'A vest of interlocking granite plates over leather.', icon: '🦺', requiredLevel: 7 },
  { id: 'jade_amulet', name: 'Jade Amulet', slot: 'accessory', rarity: 'stone_guardian', defense: 1, chiResist: 10, spiritPower: 6, description: 'An amulet of polished jade that pulses with earth energy.', icon: '📿', requiredLevel: 8 },
  { id: 'iron_sandals', name: 'Iron Sandals', slot: 'feet', rarity: 'stone_guardian', defense: 7, chiResist: 6, spiritPower: 3, description: 'Heavy sandals with iron soles for stable mountain footing.', icon: '👢', requiredLevel: 9 },
  { id: 'stone_warhammer', name: 'Stone Warhammer', slot: 'weapon', rarity: 'stone_guardian', defense: 0, chiResist: 4, spiritPower: 8, description: 'A hammer of dense mountain stone that can shatter boulders.', icon: '🔨', requiredLevel: 10 },
  { id: 'boulder_helm', name: 'Boulder Helm', slot: 'head', rarity: 'stone_guardian', defense: 8, chiResist: 7, spiritPower: 2, description: 'A helmet carved from a single boulder, unyielding as the mountain.', icon: '⛑️', requiredLevel: 11 },
  // Cloud Walker tier — Rare (6)
  { id: 'cloud_silk_robe', name: 'Cloud Silk Robe', slot: 'chest', rarity: 'cloud_walker', defense: 18, chiResist: 14, spiritPower: 10, description: 'A robe woven from clouds themselves, nearly weightless.', icon: '👘', requiredLevel: 14 },
  { id: 'mist_blade', name: 'Mist Blade', slot: 'weapon', rarity: 'cloud_walker', defense: 0, chiResist: 8, spiritPower: 15, description: 'A sword forged from solidified mist that cuts through illusions.', icon: '⚔️', requiredLevel: 16 },
  { id: 'wind_crown', name: 'Wind Crown', slot: 'head', rarity: 'cloud_walker', defense: 12, chiResist: 12, spiritPower: 12, description: 'A crown that channels wind spirits for heightened awareness.', icon: '👑', requiredLevel: 18 },
  { id: 'cloud_walker_boots', name: 'Cloud Walker Boots', slot: 'feet', rarity: 'cloud_walker', defense: 10, chiResist: 15, spiritPower: 10, description: 'Boots that allow brief walking on cloud surfaces.', icon: '👢', requiredLevel: 20 },
  { id: 'spirit_shield', name: 'Spirit Shield', slot: 'shield', rarity: 'cloud_walker', defense: 20, chiResist: 16, spiritPower: 8, description: 'A shield that deflects spiritual attacks with ease.', icon: '🛡️', requiredLevel: 22 },
  { id: 'chi_ring', name: 'Chi Focus Ring', slot: 'accessory', rarity: 'cloud_walker', defense: 2, chiResist: 18, spiritPower: 14, description: 'A ring that concentrates chi into a single point of power.', icon: '💍', requiredLevel: 24 },
  // Thunder Sage tier — Epic (6)
  { id: 'thunder_gauntlets', name: 'Thunder Gauntlets', slot: 'hands', rarity: 'thunder_sage', defense: 22, chiResist: 20, spiritPower: 18, description: 'Gauntlets crackling with captured lightning that energize every strike.', icon: '🧤', requiredLevel: 28 },
  { id: 'storm_plate', name: 'Storm Plate Armor', slot: 'chest', rarity: 'thunder_sage', defense: 35, chiResist: 25, spiritPower: 15, description: 'Armor forged in the heart of a thunderstorm, impervious to most damage.', icon: '🛡️', requiredLevel: 30 },
  { id: 'lightning_halberd', name: 'Lightning Halberd', slot: 'weapon', rarity: 'thunder_sage', defense: 0, chiResist: 15, spiritPower: 25, description: 'A halberd that arcs lightning between its blade and the ground.', icon: '⚔️', requiredLevel: 32 },
  { id: 'sage_diadem', name: 'Sage Diadem', slot: 'head', rarity: 'thunder_sage', defense: 25, chiResist: 22, spiritPower: 20, description: 'A circlet worn by the ancient thunder sages of the mountain.', icon: '👑', requiredLevel: 34 },
  { id: 'dragon_scale_greaves', name: 'Dragon Scale Greaves', slot: 'legs', rarity: 'thunder_sage', defense: 28, chiResist: 18, spiritPower: 16, description: 'Greaves of rare dragon scale that absorb and redirect impact.', icon: '🦿', requiredLevel: 36 },
  { id: 'zenith_pendant', name: 'Zenith Pendant', slot: 'accessory', rarity: 'thunder_sage', defense: 5, chiResist: 28, spiritPower: 24, description: 'A pendant containing a fragment of the summit itself.', icon: '📿', requiredLevel: 38 },
  // Dragon Ancestor tier — Legendary (6)
  { id: 'ancestor_war_blade', name: 'Ancestor War Blade', slot: 'weapon', rarity: 'dragon_ancestor', defense: 0, chiResist: 30, spiritPower: 40, description: 'The blade of the first dragon ancestor, capable of cutting reality itself.', icon: '⚔️', requiredLevel: 40 },
  { id: 'dragon_emperor_armor', name: 'Dragon Emperor Armor', slot: 'chest', rarity: 'dragon_ancestor', defense: 55, chiResist: 40, spiritPower: 30, description: 'Armor forged from the scales of the Dragon Emperor, unbreakable.', icon: '🛡️', requiredLevel: 43 },
  { id: 'enlightenment_crown', name: 'Enlightenment Crown', slot: 'head', rarity: 'dragon_ancestor', defense: 40, chiResist: 35, spiritPower: 38, description: 'A crown that grants visions of enlightenment to its wearer.', icon: '👑', requiredLevel: 46 },
  { id: 'spirit_eagle_wings', name: 'Spirit Eagle Wings', slot: 'accessory', rarity: 'dragon_ancestor', defense: 15, chiResist: 45, spiritPower: 42, description: 'Wings of the Great Spirit Eagle that grant brief flight.', icon: '🦅', requiredLevel: 48 },
  { id: 'zenith_guardian_shield', name: 'Zenith Guardian Shield', slot: 'shield', rarity: 'dragon_ancestor', defense: 50, chiResist: 38, spiritPower: 35, description: 'The shield that guards the path to the summit from all threats.', icon: '🔰', requiredLevel: 49 },
  { id: 'primordial_gauntlets', name: 'Primordial Gauntlets', slot: 'hands', rarity: 'dragon_ancestor', defense: 30, chiResist: 42, spiritPower: 45, description: 'Gauntlets from the primordial age, containing the power of creation.', icon: '🧤', requiredLevel: 50 },
] as const;

// =============================================================================
// SECTION 6: TEMPLE STRUCTURES (25, upgradeable to Lv10)
// =============================================================================

export const SP_STRUCTURES: readonly SPStructureDef[] = [
  { id: 'stone_shrine', name: 'Stone Shrine', description: 'A humble shrine where travelers can rest and pray.', icon: '⛩️', maxLevel: 10, baseCost: 0, costPerLevel: 10, chiPerDay: 2, reputationPerDay: 1, tier: 1 },
  { id: 'meditation_hut', name: 'Meditation Hut', description: 'A small wooden hut designed for focused meditation.', icon: '🏠', maxLevel: 10, baseCost: 50, costPerLevel: 15, chiPerDay: 3, reputationPerDay: 1, tier: 1 },
  { id: 'bamboo_grove', name: 'Bamboo Grove', description: 'A grove of sacred bamboo that generates peaceful chi energy.', icon: '🎋', maxLevel: 10, baseCost: 80, costPerLevel: 18, chiPerDay: 5, reputationPerDay: 2, tier: 1 },
  { id: 'training_grounds', name: 'Training Grounds', description: 'An open area for martial arts practice and chi cultivation.', icon: '🏟️', maxLevel: 10, baseCost: 100, costPerLevel: 20, chiPerDay: 4, reputationPerDay: 2, tier: 1 },
  { id: 'herb_garden', name: 'Herb Garden', description: 'A garden of mountain herbs used in spiritual healing.', icon: '🌿', maxLevel: 10, baseCost: 60, costPerLevel: 12, chiPerDay: 3, reputationPerDay: 1, tier: 1 },
  { id: 'tea_pavilion', name: 'Tea Pavilion', description: 'A pavilion where sacred tea ceremonies restore chi.', icon: '🍵', maxLevel: 10, baseCost: 120, costPerLevel: 22, chiPerDay: 6, reputationPerDay: 3, tier: 2 },
  { id: 'scripture_library', name: 'Scripture Library', description: 'A library of ancient mountain scrolls and martial manuals.', icon: '📚', maxLevel: 10, baseCost: 150, costPerLevel: 25, chiPerDay: 5, reputationPerDay: 4, tier: 2 },
  { id: 'bell_tower', name: 'Bell Tower', description: 'A tower housing the great purification bell.', icon: '🔔', maxLevel: 10, baseCost: 180, costPerLevel: 28, chiPerDay: 7, reputationPerDay: 3, tier: 2 },
  { id: 'incense_workshop', name: 'Incense Workshop', description: 'Where spiritual incense is crafted for meditation.', icon: '🪔', maxLevel: 10, baseCost: 130, costPerLevel: 24, chiPerDay: 6, reputationPerDay: 3, tier: 2 },
  { id: 'hot_spring', name: 'Hot Spring', description: 'A natural hot spring infused with mountain chi.', icon: '♨️', maxLevel: 10, baseCost: 200, costPerLevel: 30, chiPerDay: 8, reputationPerDay: 4, tier: 2 },
  { id: 'dojo', name: 'Mountain Dojo', description: 'A grand dojo for advanced martial arts training.', icon: '🏛️', maxLevel: 10, baseCost: 300, costPerLevel: 40, chiPerDay: 10, reputationPerDay: 5, tier: 3 },
  { id: 'spirit_gate', name: 'Spirit Gate', description: 'A gate that attracts benevolent mountain spirits.', icon: '⛩️', maxLevel: 10, baseCost: 350, costPerLevel: 45, chiPerDay: 12, reputationPerDay: 6, tier: 3 },
  { id: 'pagoda_tower', name: 'Pagoda Tower', description: 'A multi-tiered pagoda that stores concentrated chi.', icon: '🗼', maxLevel: 10, baseCost: 400, costPerLevel: 50, chiPerDay: 14, reputationPerDay: 7, tier: 3 },
  { id: 'zen_garden', name: 'Zen Garden', description: 'A meticulously arranged garden for deep contemplation.', icon: '⛩️', maxLevel: 10, baseCost: 280, costPerLevel: 38, chiPerDay: 9, reputationPerDay: 5, tier: 3 },
  { id: 'dragon_shrine', name: 'Dragon Shrine', description: 'A shrine honoring the dragon ancestors of the mountain.', icon: '🐲', maxLevel: 10, baseCost: 450, costPerLevel: 55, chiPerDay: 15, reputationPerDay: 8, tier: 3 },
  { id: 'eagle_aerie', name: 'Eagle Aerie', description: 'An eyrie where spirit eagles nest and grant blessings.', icon: '🦅', maxLevel: 10, baseCost: 500, costPerLevel: 60, chiPerDay: 16, reputationPerDay: 9, tier: 4 },
  { id: 'cloud_bridge', name: 'Cloud Bridge', description: 'A bridge that connects to the spirit realm above the clouds.', icon: '🌉', maxLevel: 10, baseCost: 550, costPerLevel: 65, chiPerDay: 18, reputationPerDay: 10, tier: 4 },
  { id: 'thunder_forge', name: 'Thunder Forge', description: 'A forge powered by mountain lightning for crafting relics.', icon: '⚒️', maxLevel: 10, baseCost: 600, costPerLevel: 70, chiPerDay: 20, reputationPerDay: 10, tier: 4 },
  { id: 'ice_cathedral', name: 'Ice Cathedral', description: 'A cathedral of eternal ice that amplifies meditation.', icon: '❄️', maxLevel: 10, baseCost: 650, costPerLevel: 75, chiPerDay: 22, reputationPerDay: 11, tier: 4 },
  { id: 'ancestral_hall', name: 'Ancestral Hall', description: 'A hall where the spirits of past monks gather.', icon: '🏮', maxLevel: 10, baseCost: 700, costPerLevel: 80, chiPerDay: 24, reputationPerDay: 12, tier: 4 },
  { id: 'lotus_sanctuary', name: 'Lotus Sanctuary', description: 'A sanctuary of floating lotuses that purify all chi.', icon: '🪷', maxLevel: 10, baseCost: 800, costPerLevel: 90, chiPerDay: 26, reputationPerDay: 14, tier: 5 },
  { id: 'zenith_temple', name: 'Zenith Temple', description: 'The grand temple at the peak, seat of all mountain wisdom.', icon: '⛩️', maxLevel: 10, baseCost: 1000, costPerLevel: 100, chiPerDay: 30, reputationPerDay: 16, tier: 5 },
  { id: 'chi_reservoir', name: 'Chi Reservoir', description: 'A vast reservoir that stores chi for times of need.', icon: '💧', maxLevel: 10, baseCost: 900, costPerLevel: 95, chiPerDay: 28, reputationPerDay: 15, tier: 5 },
  { id: 'enlightenment_chamber', name: 'Enlightenment Chamber', description: 'The innermost chamber where enlightenment can be achieved.', icon: '☸️', maxLevel: 10, baseCost: 1200, costPerLevel: 120, chiPerDay: 35, reputationPerDay: 18, tier: 5 },
  { id: 'dragon_throne', name: 'Dragon Throne', description: 'The ancient throne of the dragon ancestor rulers.', icon: '👑', maxLevel: 10, baseCost: 1500, costPerLevel: 150, chiPerDay: 40, reputationPerDay: 20, tier: 5 },
] as const;

// =============================================================================
// SECTION 7: SPIRITUAL ABILITIES (22)
// =============================================================================

export const SP_ABILITIES: readonly SPAbilityDef[] = [
  { id: 'chi_bolt', name: 'Chi Bolt', description: 'Fire a bolt of concentrated chi energy at a target.', icon: '💫', cooldown: 3, power: 12, chiCost: 5, unlockCost: 0, element: 'spirit', isPassive: false },
  { id: 'stone_skin', name: 'Stone Skin', description: 'Harden your skin to stone, reducing damage taken.', icon: '🪨', cooldown: 8, power: 15, chiCost: 8, unlockCost: 0, element: 'earth', isPassive: false },
  { id: 'wind_step', name: 'Wind Step', description: 'Move with the speed of mountain wind for a brief time.', icon: '💨', cooldown: 6, power: 10, chiCost: 6, unlockCost: 30, element: 'wind', isPassive: false },
  { id: 'healing_spring', name: 'Healing Spring', description: 'Summon a spring of restorative mountain water.', icon: '💧', cooldown: 15, power: 25, chiCost: 15, unlockCost: 50, element: 'water', isPassive: false },
  { id: 'eagle_eye', name: 'Eagle Eye', description: 'See through illusions and reveal hidden paths.', icon: '🦅', cooldown: 20, power: 8, chiCost: 10, unlockCost: 40, element: 'wind', isPassive: false },
  { id: 'bamboo_shield', name: 'Bamboo Shield', description: 'Create a shield of bamboo that absorbs attacks.', icon: '🎋', cooldown: 10, power: 18, chiCost: 10, unlockCost: 60, element: 'earth', isPassive: false },
  { id: 'mist_veil', name: 'Mist Veil', description: 'Shroud yourself in mist, becoming invisible briefly.', icon: '🌫️', cooldown: 12, power: 5, chiCost: 12, unlockCost: 80, element: 'water', isPassive: false },
  { id: 'thunder_palm', name: 'Thunder Palm', description: 'Strike with the force of mountain thunder.', icon: '⚡', cooldown: 8, power: 30, chiCost: 18, unlockCost: 100, element: 'thunder', isPassive: false },
  { id: 'chi_meditation', name: 'Chi Meditation', description: 'Enter deep meditation, slowly restoring chi over time.', icon: '🧘', cooldown: 30, power: 20, chiCost: 0, unlockCost: 0, element: 'spirit', isPassive: false },
  { id: 'stone_fist', name: 'Stone Fist', description: 'Empower your fists with earth chi for devastating blows.', icon: '✊', cooldown: 5, power: 22, chiCost: 12, unlockCost: 120, element: 'earth', isPassive: false },
  { id: 'cloud_walk', name: 'Cloud Walk', description: 'Walk on clouds for a short duration, ignoring terrain.', icon: '☁️', cooldown: 20, power: 15, chiCost: 20, unlockCost: 150, element: 'wind', isPassive: false },
  { id: 'frost_breath', name: 'Frost Breath', description: 'Exhale freezing air that slows and damages enemies.', icon: '❄️', cooldown: 10, power: 28, chiCost: 16, unlockCost: 180, element: 'water', isPassive: false },
  { id: 'spirit_shout', name: 'Spirit Shout', description: 'Unleash a shout infused with spirit energy that stuns.', icon: '🗣️', cooldown: 15, power: 35, chiCost: 22, unlockCost: 200, element: 'spirit', isPassive: false },
  { id: 'dragon_roar', name: 'Dragon Roar', description: 'Channel the roar of an ancient dragon, terrifying foes.', icon: '🐲', cooldown: 25, power: 40, chiCost: 30, unlockCost: 250, element: 'spirit', isPassive: false },
  { id: 'mountain_stance', name: 'Mountain Stance', description: 'Take an immovable stance, becoming immune to knockback.', icon: '🏔️', cooldown: 18, power: 12, chiCost: 14, unlockCost: 130, element: 'earth', isPassive: false },
  { id: 'chi_barrier', name: 'Chi Barrier', description: 'Create a rotating barrier of chi that deflects projectiles.', icon: '🌀', cooldown: 14, power: 20, chiCost: 18, unlockCost: 160, element: 'spirit', isPassive: false },
  { id: 'lightning_dash', name: 'Lightning Dash', description: 'Dash at lightning speed, leaving a trail of sparks.', icon: '⚡', cooldown: 6, power: 16, chiCost: 10, unlockCost: 110, element: 'thunder', isPassive: false },
  { id: 'lotus_bloom', name: 'Lotus Bloom', description: 'Cause a lotus to bloom, releasing healing chi to allies.', icon: '🪷', cooldown: 22, power: 30, chiCost: 25, unlockCost: 220, element: 'water', isPassive: false },
  { id: 'iron_body', name: 'Iron Body', description: 'Passively increase defense by hardening your body with chi.', icon: '🛡️', cooldown: 0, power: 10, chiCost: 0, unlockCost: 300, element: 'earth', isPassive: true },
  { id: 'spirit_perception', name: 'Spirit Perception', description: 'Passively sense the presence and intent of nearby creatures.', icon: '👁️', cooldown: 0, power: 8, chiCost: 0, unlockCost: 280, element: 'spirit', isPassive: true },
  { id: 'eagle_flight', name: 'Eagle Flight', description: 'Temporarily gain the ability to fly like a spirit eagle.', icon: '🦅', cooldown: 40, power: 25, chiCost: 35, unlockCost: 350, element: 'wind', isPassive: false },
  { id: 'enlightenment_pulse', name: 'Enlightenment Pulse', description: 'Release a pulse of pure enlightenment energy that empowers allies.', icon: '☸️', cooldown: 60, power: 50, chiCost: 50, unlockCost: 500, element: 'spirit', isPassive: false },
] as const;

// =============================================================================
// SECTION 8: ACHIEVEMENTS (18)
// =============================================================================

export const SP_ACHIEVEMENTS: readonly SPAchievementDef[] = [
  { id: 'first_steps', name: 'First Steps', description: 'Begin your journey on the Jade Brook Trail.', conditionKey: 'peaks_visited', targetValue: 1, xpReward: 20, chiReward: 10, icon: '👣' },
  { id: 'mist_walker', name: 'Mist Walker', description: 'Cross the Mist Valley Pass for the first time.', conditionKey: 'peaks_visited', targetValue: 2, xpReward: 40, chiReward: 20, icon: '🌫️' },
  { id: 'peak_explorer', name: 'Peak Explorer', description: 'Visit all 8 sacred mountain peaks.', conditionKey: 'peaks_visited', targetValue: 8, xpReward: 300, chiReward: 150, icon: '🗺️' },
  { id: 'first_friend', name: 'First Friend', description: 'Tame your first spirit creature.', conditionKey: 'creatures_tamed', targetValue: 1, xpReward: 30, chiReward: 15, icon: '🦊' },
  { id: 'spirit_herd', name: 'Spirit Herd', description: 'Befriend 10 spirit creatures.', conditionKey: 'creatures_tamed', targetValue: 10, xpReward: 200, chiReward: 100, icon: '🐾' },
  { id: 'creature_master', name: 'Creature Master', description: 'Befriend 20 spirit creatures.', conditionKey: 'creatures_tamed', targetValue: 20, xpReward: 500, chiReward: 250, icon: '👑' },
  { id: 'temple_builder', name: 'Temple Builder', description: 'Build your first temple structure.', conditionKey: 'structures_built', targetValue: 1, xpReward: 25, chiReward: 15, icon: '🏗️' },
  { id: 'grand_architect', name: 'Grand Architect', description: 'Build 10 temple structures.', conditionKey: 'structures_built', targetValue: 10, xpReward: 300, chiReward: 150, icon: '🏛️' },
  { id: 'max_enhancement', name: 'Max Enhancement', description: 'Upgrade any structure to maximum level 10.', conditionKey: 'max_structure_level', targetValue: 1, xpReward: 400, chiReward: 200, icon: '⬆️' },
  { id: 'chi_cultivator', name: 'Chi Cultivator', description: 'Accumulate 1,000 total chi energy.', conditionKey: 'total_chi_gained', targetValue: 1000, xpReward: 100, chiReward: 50, icon: '💫' },
  { id: 'chi_master', name: 'Chi Master', description: 'Accumulate 50,000 total chi energy.', conditionKey: 'total_chi_gained', targetValue: 50000, xpReward: 500, chiReward: 300, icon: '✨' },
  { id: 'deep_meditation', name: 'Deep Meditation', description: 'Reach meditation depth of 50 or deeper.', conditionKey: 'max_meditation_depth', targetValue: 50, xpReward: 250, chiReward: 150, icon: '🧘' },
  { id: 'enlightenment seeker', name: 'Enlightenment Seeker', description: 'Reach meditation depth of 100 (maximum).', conditionKey: 'max_meditation_depth', targetValue: 100, xpReward: 600, chiReward: 400, icon: '☸️' },
  { id: 'martial_artist', name: 'Martial Artist', description: 'Complete 10 martial arts training sessions.', conditionKey: 'martial_arts_sessions', targetValue: 10, xpReward: 150, chiReward: 75, icon: '🥋' },
  { id: 'grandmaster', name: 'Grandmaster', description: 'Reach martial arts level 50.', conditionKey: 'martial_arts_level', targetValue: 50, xpReward: 800, chiReward: 500, icon: '🏆' },
  { id: 'high_climber', name: 'High Climber', description: 'Reach altitude 5,000 meters.', conditionKey: 'altitude_reached', targetValue: 5000, xpReward: 200, chiReward: 100, icon: '🏔️' },
  { id: 'summit_conqueror', name: 'Summit Conqueror', description: 'Reach the Enlightenment Zenith (8,848m).', conditionKey: 'altitude_reached', targetValue: 8848, xpReward: 1000, chiReward: 500, icon: '⛰️' },
  { id: 'spirit_sage', name: 'Spirit Sage', description: 'Achieve the title of Spirit Sage.', conditionKey: 'title_index', targetValue: 7, xpReward: 1500, chiReward: 800, icon: '🌟' },
] as const;

// =============================================================================
// SECTION 9: TITLES (8: Mountain Initiate → Spirit Sage)
// =============================================================================

export const SP_TITLES: readonly SPTitleDef[] = [
  { id: 'mountain_initiate', name: 'Mountain Initiate', requiredReputation: 0, description: 'A newcomer to the sacred peaks, eager to learn the mountain ways.', icon: '🌱', color: SP_THEME_COLORS.moonlightSilver, bonusMultiplier: 1.0 },
  { id: 'path_walker', name: 'Path Walker', requiredReputation: 100, description: 'One who has walked the mountain paths and earned the spirits\' trust.', icon: '🚶', color: SP_THEME_COLORS.bambooSage, bonusMultiplier: 1.1 },
  { id: 'stone_disciple', name: 'Stone Disciple', requiredReputation: 300, description: 'A dedicated student who has begun to harness earth chi.', icon: '🪨', color: SP_THEME_COLORS.earthBrown, bonusMultiplier: 1.2 },
  { id: 'cloud_apprentice', name: 'Cloud Apprentice', requiredReputation: 700, description: 'An apprentice who can walk among clouds and speak with wind spirits.', icon: '☁️', color: SP_THEME_COLORS.cloudLavender, bonusMultiplier: 1.35 },
  { id: 'thunder_monk', name: 'Thunder Monk', requiredReputation: 1500, description: 'A monk who commands the thunder of the peaks through disciplined training.', icon: '⚡', color: SP_THEME_COLORS.thunderBlue, bonusMultiplier: 1.5 },
  { id: 'dragon_student', name: 'Dragon Student', requiredReputation: 3000, description: 'A student chosen by the dragon ancestors to receive their wisdom.', icon: '🐲', color: SP_THEME_COLORS.spiritGold, bonusMultiplier: 1.75 },
  { id: 'zenith_master', name: 'Zenith Master', requiredReputation: 6000, description: 'A master who has reached the summit and glimpsed true enlightenment.', icon: '⛰️', color: SP_THEME_COLORS.templeRed, bonusMultiplier: 2.0 },
  { id: 'spirit_sage', name: 'Spirit Sage', requiredReputation: 10000, description: 'A sage who has achieved perfect harmony with all mountain spirits.', icon: '🌟', color: SP_THEME_COLORS.spiritGold, bonusMultiplier: 2.5 },
] as const;

// =============================================================================
// SECTION 10: MOUNTAIN EVENTS (8)
// =============================================================================

export const SP_MOUNTAIN_EVENTS: readonly SPMountainEventDef[] = [
  {
    id: 'spirit_festival', name: 'Spirit Festival',
    description: 'The spirits of the mountain gather for a grand festival. All chi gains are doubled and taming is easier.',
    durationHours: 24, chiMultiplier: 2.0, reputationMultiplier: 1.5, tamingBonus: 1.5, meditationBonus: 1.3,
    icon: '🏮', color: SP_TEMPLE_RED,
  },
  {
    id: 'dragon_ascent', name: 'Dragon Ascent',
    description: 'The Dragon Ancestors stir from their slumber. Rare creatures appear more frequently.',
    durationHours: 12, chiMultiplier: 1.5, reputationMultiplier: 2.0, tamingBonus: 2.0, meditationBonus: 1.5,
    icon: '🐲', color: SP_SPIRIT_GOLD,
  },
  {
    id: 'thunder_trial', name: 'Thunder Trial',
    description: 'A trial of thunder challenges monks. Martial arts training yields triple rewards.',
    durationHours: 8, chiMultiplier: 1.3, reputationMultiplier: 1.8, tamingBonus: 1.0, meditationBonus: 1.0,
    icon: '⛈️', color: '#42A5F5',
  },
  {
    id: 'lotus_bloom', name: 'Lotus Bloom',
    description: 'The frozen lotuses bloom simultaneously across all peaks. Enlightenment is easier to achieve.',
    durationHours: 16, chiMultiplier: 1.8, reputationMultiplier: 1.5, tamingBonus: 1.2, meditationBonus: 2.0,
    icon: '🪷', color: '#F48FB1',
  },
  {
    id: 'eagle_migration', name: 'Eagle Migration',
    description: 'Spirit eagles migrate through the peaks, carrying messages and blessings from the ancestors.',
    durationHours: 10, chiMultiplier: 1.5, reputationMultiplier: 2.0, tamingBonus: 1.3, meditationBonus: 1.2,
    icon: '🦅', color: SP_SKY_CYAN,
  },
  {
    id: 'chi_surge', name: 'Chi Surge',
    description: 'A massive surge of spiritual energy flows through the mountain. All chi costs are halved.',
    durationHours: 6, chiMultiplier: 2.5, reputationMultiplier: 1.0, tamingBonus: 1.0, meditationBonus: 1.5,
    icon: '💫', color: SP_JADE_GREEN,
  },
  {
    id: 'mist_revelation', name: 'Mist Revelation',
    description: 'The eternal mist parts to reveal hidden paths and secrets across the mountain.',
    durationHours: 14, chiMultiplier: 1.2, reputationMultiplier: 1.5, tamingBonus: 1.8, meditationBonus: 2.5,
    icon: '🌫️', color: SP_MIST_WHITE,
  },
  {
    id: 'ancestor_vigil', name: 'Ancestor Vigil',
    description: 'The spirits of ancient monks hold a vigil. All reputation gains are tripled.',
    durationHours: 20, chiMultiplier: 1.3, reputationMultiplier: 3.0, tamingBonus: 1.2, meditationBonus: 1.8,
    icon: '🕯️', color: '#FFB74D',
  },
] as const;

// =============================================================================
// SECTION 11: SPIRIT HERBS (20)
// =============================================================================

export const SP_SPIRIT_HERBS: readonly SPSpiritHerbDef[] = [
  // Mountain Spirit herbs (4)
  { id: 'jade_moss', name: 'Jade Moss', description: 'A moss growing on sacred jade stones that restores minor chi.', icon: '🌿', rarity: 'mountain_spirit', chiRestore: 10, enlightenmentBonus: 0, tamingBoost: 0, meditationBoost: 1, martialBoost: 0, peakAffinity: ['jade_brook_trail'] },
  { id: 'brook_mint', name: 'Brook Mint', description: 'Fresh mint from the mountain brook that clears the mind.', icon: '🌿', rarity: 'mountain_spirit', chiRestore: 5, enlightenmentBonus: 1, tamingBoost: 0, meditationBoost: 3, martialBoost: 0, peakAffinity: ['jade_brook_trail', 'mist_valley_pass'] },
  { id: 'bamboo_leaf', name: 'Bamboo Leaf', description: 'A single bamboo leaf that strengthens the body when consumed.', icon: '🍃', rarity: 'mountain_spirit', chiRestore: 3, enlightenmentBonus: 0, tamingBoost: 1, meditationBoost: 0, martialBoost: 2, peakAffinity: ['jade_brook_trail'] },
  { id: 'dewdrop_fern', name: 'Dewdrop Fern', description: 'A fern that collects morning dew infused with chi.', icon: '🌱', rarity: 'mountain_spirit', chiRestore: 8, enlightenmentBonus: 0, tamingBoost: 0, meditationBoost: 2, martialBoost: 1, peakAffinity: ['mist_valley_pass'] },
  // Stone Guardian herbs (4)
  { id: 'iron_root', name: 'Iron Root', description: 'A root as hard as iron that greatly fortifies the body.', icon: '🥬', rarity: 'stone_guardian', chiRestore: 15, enlightenmentBonus: 0, tamingBoost: 2, meditationBoost: 0, martialBoost: 5, peakAffinity: ['ancient_pine_summit'] },
  { id: 'granite_lichen', name: 'Granite Lichen', description: 'Lichen growing on granite that bonds creatures more easily.', icon: '🪨', rarity: 'stone_guardian', chiRestore: 5, enlightenmentBonus: 0, tamingBoost: 5, meditationBoost: 0, martialBoost: 2, peakAffinity: ['ancient_pine_summit', 'thunder_cliff_path'] },
  { id: 'earth_crystal_shard', name: 'Earth Crystal Shard', description: 'A small crystal shard pulsing with earth chi energy.', icon: '💎', rarity: 'stone_guardian', chiRestore: 25, enlightenmentBonus: 2, tamingBoost: 0, meditationBoost: 2, martialBoost: 3, peakAffinity: ['thunder_cliff_path'] },
  { id: 'pine_needle_tea_base', name: 'Pine Needle Bundle', description: 'Dried pine needles for brewing restorative tea.', icon: '🌲', rarity: 'stone_guardian', chiRestore: 12, enlightenmentBonus: 1, tamingBoost: 1, meditationBoost: 3, martialBoost: 2, peakAffinity: ['ancient_pine_summit'] },
  // Cloud Walker herbs (4)
  { id: 'cloud_blossom', name: 'Cloud Blossom', description: 'A flower that grows only on cloud surfaces, rare and precious.', icon: '🌸', rarity: 'cloud_walker', chiRestore: 30, enlightenmentBonus: 3, tamingBoost: 3, meditationBoost: 5, martialBoost: 2, peakAffinity: ['cloud_mist_ridge'] },
  { id: 'wind_vine', name: 'Wind Vine', description: 'A vine that sways even in still air, boosting meditation depth.', icon: '🌿', rarity: 'cloud_walker', chiRestore: 15, enlightenmentBonus: 2, tamingBoost: 2, meditationBoost: 8, martialBoost: 1, peakAffinity: ['cloud_mist_ridge', 'thunder_cliff_path'] },
  { id: 'mist_orchid', name: 'Mist Orchid', description: 'An orchid that only blooms in thick mist, granting spiritual clarity.', icon: '🪻', rarity: 'cloud_walker', chiRestore: 20, enlightenmentBonus: 5, tamingBoost: 4, meditationBoost: 4, martialBoost: 0, peakAffinity: ['mist_valley_pass', 'cloud_mist_ridge'] },
  { id: 'spirit_berry', name: 'Spirit Berry', description: 'A glowing berry that enhances all training activities.', icon: '🫐', rarity: 'cloud_walker', chiRestore: 25, enlightenmentBonus: 2, tamingBoost: 3, meditationBoost: 3, martialBoost: 4, peakAffinity: ['cloud_mist_ridge', 'frozen_lotus_peak'] },
  // Thunder Sage herbs (4)
  { id: 'thunder_bloom', name: 'Thunder Bloom', description: 'A flower struck by lightning that crackles with residual energy.', icon: '⚡', rarity: 'thunder_sage', chiRestore: 50, enlightenmentBonus: 5, tamingBoost: 5, meditationBoost: 5, martialBoost: 8, peakAffinity: ['thunder_cliff_path'] },
  { id: 'frost_lotus_petal', name: 'Frost Lotus Petal', description: 'A petal from the legendary frozen lotus, extremely rare.', icon: '🪷', rarity: 'thunder_sage', chiRestore: 40, enlightenmentBonus: 8, tamingBoost: 6, meditationBoost: 10, martialBoost: 3, peakAffinity: ['frozen_lotus_peak'] },
  { id: 'eagle_feather_herb', name: 'Eagle Feather Herb', description: 'A herb that resembles a spirit eagle feather, granting wind affinity.', icon: '🦅', rarity: 'thunder_sage', chiRestore: 35, enlightenmentBonus: 4, tamingBoost: 8, meditationBoost: 6, martialBoost: 6, peakAffinity: ['spirit_eagle_nest'] },
  { id: 'storm_jasmine', name: 'Storm Jasmine', description: 'A jasmine that blooms during thunderstorms, filling the air with power.', icon: '🌺', rarity: 'thunder_sage', chiRestore: 45, enlightenmentBonus: 3, tamingBoost: 4, meditationBoost: 8, martialBoost: 10, peakAffinity: ['thunder_cliff_path', 'spirit_eagle_nest'] },
  // Dragon Ancestor herbs (4)
  { id: 'dragon_blood_resin', name: 'Dragon Blood Resin', description: 'Resin from trees watered by dragon blood, the rarest herb.', icon: '🩸', rarity: 'dragon_ancestor', chiRestore: 100, enlightenmentBonus: 15, tamingBoost: 15, meditationBoost: 10, martialBoost: 15, peakAffinity: ['enlightenment_zenith'] },
  { id: 'zenith_starflower', name: 'Zenith Starflower', description: 'A flower that blooms only at the summit under starlight.', icon: '🌟', rarity: 'dragon_ancestor', chiRestore: 80, enlightenmentBonus: 20, tamingBoost: 10, meditationBoost: 20, martialBoost: 10, peakAffinity: ['enlightenment_zenith'] },
  { id: 'immortal_peach', name: 'Immortal Peach', description: 'A peach from the orchard of immortals, granting vitality.', icon: '🍑', rarity: 'dragon_ancestor', chiRestore: 120, enlightenmentBonus: 10, tamingBoost: 12, meditationBoost: 8, martialBoost: 12, peakAffinity: ['enlightenment_zenith', 'spirit_eagle_nest'] },
  { id: 'primordial_jade_seed', name: 'Primordial Jade Seed', description: 'A seed from the world-tree that grew the first mountains.', icon: '🌱', rarity: 'dragon_ancestor', chiRestore: 150, enlightenmentBonus: 25, tamingBoost: 20, meditationBoost: 15, martialBoost: 20, peakAffinity: ['enlightenment_zenith'] },
] as const;

// =============================================================================
// SECTION 12: TEMPLE IDS (hidden temples at peaks)
// =============================================================================

export const SP_TEMPLES = [
  { id: 'hidden_mist_temple', name: 'Hidden Mist Temple', peakId: 'mist_valley_pass' as SPPeakId, description: 'A temple concealed within the eternal mist, guarded by fox spirits.', icon: '🏯' },
  { id: 'pine_hermitage', name: 'Pine Hermitage', peakId: 'ancient_pine_summit' as SPPeakId, description: 'A hermitage carved into the heart of a giant ancient pine.', icon: '🌲' },
  { id: 'thunder_shrine', name: 'Thunder Shrine', peakId: 'thunder_cliff_path' as SPPeakId, description: 'A shrine where lightning strikes the altar every evening at dusk.', icon: '⚡' },
  { id: 'cloud_sanctuary', name: 'Cloud Sanctuary', peakId: 'cloud_mist_ridge' as SPPeakId, description: 'A floating sanctuary that drifts among the clouds, never touching ground.', icon: '☁️' },
  { id: 'ice_lotus_temple', name: 'Ice Lotus Temple', peakId: 'frozen_lotus_peak' as SPPeakId, description: 'A temple of ice where frozen lotuses bloom in eternal winter.', icon: '❄️' },
  { id: 'eagle_shrine', name: 'Eagle Shrine', peakId: 'spirit_eagle_nest' as SPPeakId, description: 'A shrine tended by spirit eagles who carry prayers to the heavens.', icon: '🦅' },
  { id: 'zenith_temple', name: 'Zenith Grand Temple', peakId: 'enlightenment_zenith' as SPPeakId, description: 'The ultimate temple at the peak where enlightenment awaits the worthy.', icon: '⛩️' },
] as const;

// =============================================================================
// SECTION 11: DEFAULT STATE FACTORY
// =============================================================================

function createDefaultState(): SPState {
  const today = new Date().toISOString().slice(0, 10);
  const creatures: Record<string, SPCreatureState> = {};
  for (const c of SP_CREATURES) {
    creatures[c.id] = {
      creatureId: c.id, tamed: false, tamedAt: null, nickname: '', level: 1, xp: 0, bondStrength: 0,
    };
  }
  const peaks: Record<string, { visited: boolean; visitsCount: number; firstVisitAt: number | null; highestAltitude: number }> = {};
  for (const p of SP_PEAKS) {
    peaks[p.id] = { visited: false, visitsCount: 0, firstVisitAt: null, highestAltitude: 0 };
  }
  const abilities: Record<string, SPAbilityState> = {};
  for (const a of SP_ABILITIES) {
    abilities[a.id] = {
      abilityId: a.id, unlocked: a.unlockCost === 0, unlockedAt: a.unlockCost === 0 ? Date.now() : null,
      lastUsedAt: 0, totalUses: 0,
    };
  }
  const achievements: Record<string, SPAchievementState> = {};
  for (const ach of SP_ACHIEVEMENTS) {
    achievements[ach.id] = { id: ach.id, unlocked: false, unlockedAt: null, currentValue: 0 };
  }
  return {
    creatures,
    peaks,
    equipment: {},
    structures: { stone_shrine: { structureId: 'stone_shrine', level: 1, builtAt: Date.now(), lastCollected: Date.now() } },
    abilities,
    achievements,
    currentPeak: 'jade_brook_trail',
    chiEnergy: 50,
    totalChiGained: 50,
    enlightenment: 0,
    altitudeReached: 800,
    creaturesBefriended: 0,
    titleIndex: 0,
    templeReputation: 0,
    totalReputation: 0,
    meditationDepth: 0,
    maxMeditationDepth: 0,
    meditationCount: 0,
    totalMeditationTime: 0,
    martialArtsLevel: 1,
    martialArtsXp: 0,
    martialArtsSessionsCompleted: 0,
    templesDiscovered: 0,
    totalChiChanneled: 0,
    dailyTrainingTask: {
      date: today, creaturesTamed: 0, peaksClimbed: 0, meditationsCompleted: 0,
      structuresUpgraded: 0, abilitiesActivated: 0, martialArtsTrained: 0,
      templesDiscovered: 0, chiChanneled: 0, isComplete: false, rewardClaimed: false,
    },
    tamingProgress: {},
    spiritHerbs: {
      jade_moss: { herbId: 'jade_moss', quantity: 3, firstFoundAt: Date.now() },
      brook_mint: { herbId: 'brook_mint', quantity: 2, firstFoundAt: Date.now() },
      bamboo_leaf: { herbId: 'bamboo_leaf', quantity: 2, firstFoundAt: Date.now() },
    },
    activeEvent: null,
    eventEndTime: null,
    eventHistory: [],
    lastDailyReset: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// =============================================================================
// SECTION 12: MAIN HOOK
// =============================================================================

export default function useSpiritPeaks(initialState?: SPState) {
  const [state, setState] = useState<SPState>(initialState ?? createDefaultState());
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  // ===========================================================================
  // INTERNAL: Get current date string
  // ===========================================================================

  const getToday = useCallback((): string => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  // ===========================================================================
  // INTERNAL: Check and reset daily task
  // ===========================================================================

  const checkDailyReset = useCallback(() => {
    const today = getToday();
    const current = stateRef.current;
    if (current.dailyTrainingTask.date !== today) {
      setState(prev => ({
        ...prev,
        dailyTrainingTask: {
          date: today, creaturesTamed: 0, peaksClimbed: 0, meditationsCompleted: 0,
          structuresUpgraded: 0, abilitiesActivated: 0, martialArtsTrained: 0,
          templesDiscovered: 0, chiChanneled: 0, isComplete: false, rewardClaimed: false,
        },
        lastDailyReset: Date.now(),
      }));
    }
  }, [getToday]);

  // ===========================================================================
  // INTERNAL: Update achievement tracking values
  // ===========================================================================

  const updateAchievementTracking = useCallback((key: string, value: number) => {
    setState(prev => {
      const updatedAchievements: Record<string, SPAchievementState> = {};
      let changed = false;
      for (const ach of SP_ACHIEVEMENTS) {
        const current = prev.achievements[ach.id];
        if (ach.conditionKey === key) {
          const newValue = Math.max(current.currentValue, value);
          const shouldUnlock = !current.unlocked && newValue >= ach.targetValue;
          updatedAchievements[ach.id] = {
            ...current,
            currentValue: newValue,
            unlocked: shouldUnlock ? true : current.unlocked,
            unlockedAt: shouldUnlock ? Date.now() : current.unlockedAt,
          };
          if (shouldUnlock) changed = true;
        } else {
          updatedAchievements[ach.id] = current;
        }
      }
      if (!changed && Object.keys(updatedAchievements).length === Object.keys(prev.achievements).length) {
        return prev;
      }
      return { ...prev, achievements: updatedAchievements };
    });
  }, []);

  // ===========================================================================
  // INTERNAL: Calculate structure upgrade cost
  // ===========================================================================

  const getUpgradeCost = useCallback((structureId: string, targetLevel: number): number => {
    const def = SP_STRUCTURES.find(s => s.id === structureId);
    if (!def) return Infinity;
    return def.baseCost + def.costPerLevel * (targetLevel - 1);
  }, []);

  // ===========================================================================
  // INTERNAL: Grant chi energy
  // ===========================================================================

  const grantChi = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      chiEnergy: Math.min(prev.chiEnergy + amount, SP_MAX_CHI),
      totalChiGained: prev.totalChiGained + amount,
    }));
    updateAchievementTracking('total_chi_gained', stateRef.current.totalChiGained + amount);
  }, [updateAchievementTracking]);

  // ===========================================================================
  // INTERNAL: Grant reputation
  // ===========================================================================

  const grantReputation = useCallback((amount: number) => {
    setState(prev => {
      const newRep = prev.templeReputation + amount;
      const newTotal = prev.totalReputation + amount;
      let newTitleIndex = prev.titleIndex;
      for (let i = SP_TITLES.length - 1; i >= 0; i--) {
        if (newRep >= SP_TITLES[i].requiredReputation) {
          newTitleIndex = i;
          break;
        }
      }
      return {
        ...prev,
        templeReputation: newRep,
        totalReputation: newTotal,
        titleIndex: newTitleIndex,
      };
    });
    updateAchievementTracking('title_index', stateRef.current.titleIndex);
  }, [updateAchievementTracking]);

  // ===========================================================================
  // INTERNAL: Get title multiplier
  // ===========================================================================

  const titleMultiplier = useMemo(() => {
    return SP_TITLES[state.titleIndex]?.bonusMultiplier ?? 1.0;
  }, [state.titleIndex]);

  // ===========================================================================
  // INTERNAL: Update daily task fields
  // ===========================================================================

  const updateDailyTask = useCallback((field: keyof SPDailyTask, increment: number = 1) => {
    setState(prev => {
      const currentTask = prev.dailyTrainingTask;
      const today = new Date().toISOString().slice(0, 10);
      if (currentTask.date !== today) return prev;
      const newValue = (currentTask[field] as number) + increment;
      const isComplete =
        currentTask.creaturesTamed + (field === 'creaturesTamed' ? increment : 0) >= 3 &&
        currentTask.peaksClimbed + (field === 'peaksClimbed' ? increment : 0) >= 2 &&
        currentTask.meditationsCompleted + (field === 'meditationsCompleted' ? increment : 0) >= 1 &&
        currentTask.martialArtsTrained + (field === 'martialArtsTrained' ? increment : 0) >= 1;
      return {
        ...prev,
        dailyTrainingTask: { ...currentTask, [field]: newValue, isComplete },
      };
    });
  }, []);

  // ===========================================================================
  // PUBLIC: tameCreature — Attempt to tame a spirit creature
  // ===========================================================================

  const tameCreature = useCallback((creatureId: string): { success: boolean; message: string } => {
    checkDailyReset();
    const def = SP_CREATURES.find(c => c.id === creatureId);
    if (!def) return { success: false, message: 'Unknown creature.' };
    if (!def.canTame) return { success: false, message: `${def.name} cannot be tamed.` };

    const current = stateRef.current;
    const creatureState = current.creatures[creatureId];
    if (!creatureState) return { success: false, message: 'Creature data not found.' };
    if (creatureState.tamed) return { success: false, message: `${def.name} is already your friend!` };

    const existingProgress = current.tamingProgress[creatureId];
    if (existingProgress && existingProgress.completed) {
      return { success: false, message: 'Taming already completed.' };
    }

    const maxProgress = def.tamingDifficulty * 10;
    const chiCost = Math.ceil(def.tamingDifficulty * 3);
    if (current.chiEnergy < chiCost) {
      return { success: false, message: `Not enough chi. Need ${chiCost}, have ${current.chiEnergy}.` };
    }

    const currentProgress = existingProgress?.progress ?? 0;
    const increment = Math.floor(Math.random() * 15) + 5 + Math.floor(current.martialArtsLevel / 5);
    const newProgress = Math.min(currentProgress + increment, maxProgress);
    const isComplete = newProgress >= maxProgress;

    setState(prev => {
      const updatedCreatures = { ...prev.creatures };
      const updatedTaming = { ...prev.tamingProgress };
      let newBefriended = prev.creaturesBefriended;
      let newChi = prev.chiEnergy - chiCost;

      updatedTaming[creatureId] = {
        creatureId,
        progress: newProgress,
        maxProgress,
        startedAt: existingProgress?.startedAt ?? Date.now(),
        completed: isComplete,
      };

      if (isComplete) {
        const nickname = def.name;
        updatedCreatures[creatureId] = {
          ...prev.creatures[creatureId],
          tamed: true,
          tamedAt: Date.now(),
          nickname,
          bondStrength: 10,
        };
        newBefriended = prev.creaturesBefriended + 1;
        newChi += Math.floor(def.xpReward * titleMultiplier);
      }

      return {
        ...prev,
        creatures: updatedCreatures,
        tamingProgress: updatedTaming,
        creaturesBefriended: newBefriended,
        chiEnergy: newChi,
        updatedAt: Date.now(),
      };
    });

    if (isComplete) {
      updateDailyTask('creaturesTamed');
      const newCount = stateRef.current.creaturesBefriended + 1;
      updateAchievementTracking('creatures_tamed', newCount);
      grantChi(Math.floor(def.chiReward * titleMultiplier));
      grantReputation(Math.ceil(def.tamingDifficulty * 2));
      return { success: true, message: `${def.name} has been tamed! Your new friend joins your spirit herd.` };
    }

    return {
      success: false,
      message: `Taming progress: ${newProgress}/${maxProgress}. Keep trying!`,
    };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, grantChi, grantReputation, titleMultiplier]);

  // ===========================================================================
  // PUBLIC: climbPeak — Travel to a different mountain peak
  // ===========================================================================

  const climbPeak = useCallback((peakId: SPPeakId): { success: boolean; message: string; newXp?: number; newChi?: number } => {
    checkDailyReset();
    const def = SP_PEAKS.find(p => p.id === peakId);
    if (!def) return { success: false, message: 'Unknown peak.' };

    const current = stateRef.current;
    if (current.altitudeReached < def.unlockAltitude) {
      return { success: false, message: `Need altitude ${def.unlockAltitude}m to unlock ${def.name}. Current: ${current.altitudeReached}m.` };
    }

    const isReturning = current.currentPeak === peakId;
    const xpGain = isReturning ? 0 : Math.floor(def.baseXp * titleMultiplier);
    const chiGain = isReturning ? 0 : Math.floor(def.baseChi * titleMultiplier);

    setState(prev => {
      const peakState = prev.peaks[peakId];
      const wasVisited = peakState?.visited ?? false;
      const newAltitude = Math.max(prev.altitudeReached, def.elevation);
      const updatedPeaks = {
        ...prev.peaks,
        [peakId]: {
          visited: true,
          visitsCount: (peakState?.visitsCount ?? 0) + 1,
          firstVisitAt: peakState?.firstVisitAt ?? Date.now(),
          highestAltitude: Math.max(peakState?.highestAltitude ?? 0, def.elevation),
        },
      };
      return {
        ...prev,
        currentPeak: peakId,
        peaks: updatedPeaks,
        altitudeReached: newAltitude,
        chiEnergy: Math.min(prev.chiEnergy + chiGain, SP_MAX_CHI),
        totalChiGained: prev.totalChiGained + chiGain,
        updatedAt: Date.now(),
      };
    });

    if (!isReturning) {
      updateDailyTask('peaksClimbed');
      const visitedCount = Object.values(stateRef.current.peaks).filter(p => p.visited).length;
      updateAchievementTracking('peaks_visited', visitedCount + 1);
      updateAchievementTracking('altitude_reached', Math.max(stateRef.current.altitudeReached, def.elevation));
      grantReputation(def.dangerLevel * 3);
      return { success: true, message: `You arrived at ${def.name}! Gained ${xpGain} XP and ${chiGain} chi.`, newXp: xpGain, newChi: chiGain };
    }

    return { success: true, message: `You are already at ${def.name}.` };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, grantReputation, titleMultiplier]);

  // ===========================================================================
  // PUBLIC: upgradeStructure — Upgrade a temple structure
  // ===========================================================================

  const upgradeStructure = useCallback((structureId: string): { success: boolean; message: string } => {
    checkDailyReset();
    const def = SP_STRUCTURES.find(s => s.id === structureId);
    if (!def) return { success: false, message: 'Unknown structure.' };

    const current = stateRef.current;
    const structureState = current.structures[structureId];

    if (!structureState) {
      const buildCost = def.baseCost;
      if (current.chiEnergy < buildCost) {
        return { success: false, message: `Not enough chi to build ${def.name}. Need ${buildCost}.` };
      }
      setState(prev => ({
        ...prev,
        structures: {
          ...prev.structures,
          [structureId]: { structureId, level: 1, builtAt: Date.now(), lastCollected: Date.now() },
        },
        chiEnergy: prev.chiEnergy - buildCost,
        updatedAt: Date.now(),
      }));
      updateDailyTask('structuresUpgraded');
      const builtCount = Object.keys(stateRef.current.structures).length + 1;
      updateAchievementTracking('structures_built', builtCount);
      grantReputation(def.tier * 5);
      return { success: true, message: `${def.name} has been built! Level 1.` };
    }

    if (structureState.level >= def.maxLevel) {
      return { success: false, message: `${def.name} is already at maximum level ${def.maxLevel}.` };
    }

    const targetLevel = structureState.level + 1;
    const cost = getUpgradeCost(structureId, targetLevel);
    if (current.chiEnergy < cost) {
      return { success: false, message: `Not enough chi to upgrade to Lv${targetLevel}. Need ${cost}, have ${current.chiEnergy}.` };
    }

    setState(prev => ({
      ...prev,
      structures: {
        ...prev.structures,
        [structureId]: { ...prev.structures[structureId], level: targetLevel },
      },
      chiEnergy: prev.chiEnergy - cost,
      updatedAt: Date.now(),
    }));
    updateDailyTask('structuresUpgraded');

    if (targetLevel === def.maxLevel) {
      updateAchievementTracking('max_structure_level', 1);
    }
    grantReputation(def.tier * 3);

    return { success: true, message: `${def.name} upgraded to Level ${targetLevel}!` };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, grantReputation, getUpgradeCost]);

  // ===========================================================================
  // PUBLIC: activateAbility — Use a spiritual ability
  // ===========================================================================

  const activateAbility = useCallback((abilityId: string): { success: boolean; message: string; power?: number } => {
    checkDailyReset();
    const def = SP_ABILITIES.find(a => a.id === abilityId);
    if (!def) return { success: false, message: 'Unknown ability.' };

    const current = stateRef.current;
    const abilityState = current.abilities[abilityId];
    if (!abilityState || !abilityState.unlocked) {
      return { success: false, message: `${def.name} is not unlocked yet.` };
    }

    if (current.chiEnergy < def.chiCost) {
      return { success: false, message: `Not enough chi. Need ${def.chiCost}, have ${current.chiEnergy}.` };
    }

    const finalPower = Math.floor(def.power * titleMultiplier * (1 + current.martialArtsLevel * 0.02));

    setState(prev => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [abilityId]: { ...prev.abilities[abilityId], lastUsedAt: Date.now(), totalUses: prev.abilities[abilityId].totalUses + 1 },
      },
      chiEnergy: prev.chiEnergy - def.chiCost,
      updatedAt: Date.now(),
    }));

    updateDailyTask('abilitiesActivated');
    grantReputation(1);
    return { success: true, message: `${def.name} activated! Power: ${finalPower}`, power: finalPower };
  }, [checkDailyReset, updateDailyTask, grantReputation, titleMultiplier]);

  // ===========================================================================
  // PUBLIC: meditate — Enter meditation to gain chi and enlightenment
  // ===========================================================================

  const meditate = useCallback((durationMs: number = SP_MEDITATION_BASE_DURATION_MS): { success: boolean; message: string; chiGained: number; depth: number; wasEnlightened: boolean } => {
    checkDailyReset();
    const current = stateRef.current;

    const peakDef = SP_PEAKS.find(p => p.id === current.currentPeak);
    const elevationBonus = peakDef ? Math.floor(peakDef.elevation / 1000) : 0;
    const structureBonus = Object.values(current.structures).reduce((sum, s) => {
      const sDef = SP_STRUCTURES.find(d => d.id === s.structureId);
      return sum + (sDef?.chiPerDay ?? 0) * s.level * 0.1;
    }, 0);

    const depthBase = Math.min(100, Math.floor(durationMs / 1000) + elevationBonus + Math.floor(current.martialArtsLevel / 3));
    const depthRoll = Math.floor(Math.random() * 10);
    const depth = Math.min(SP_MAX_MEDITATION_DEPTH, depthBase + depthRoll);
    const chiGained = Math.floor((depth * 2 + structureBonus) * titleMultiplier);
    const enlightenmentGained = Math.random() < 0.1 + (depth / 200) ? Math.floor(depth / 5) : 0;
    const wasEnlightened = enlightenmentGained > 0 && depth >= 80;

    setState(prev => ({
      ...prev,
      chiEnergy: Math.min(prev.chiEnergy + chiGained, SP_MAX_CHI),
      totalChiGained: prev.totalChiGained + chiGained,
      enlightenment: Math.min(prev.enlightenment + enlightenmentGained, SP_MAX_ENLIGHTENMENT),
      meditationDepth: depth,
      maxMeditationDepth: Math.max(prev.maxMeditationDepth, depth),
      meditationCount: prev.meditationCount + 1,
      totalMeditationTime: prev.totalMeditationTime + durationMs,
      updatedAt: Date.now(),
    }));

    updateDailyTask('meditationsCompleted');
    updateAchievementTracking('max_meditation_depth', Math.max(stateRef.current.maxMeditationDepth, depth));
    updateAchievementTracking('total_chi_gained', stateRef.current.totalChiGained + chiGained);
    grantReputation(Math.floor(depth / 5));

    let message = `Meditation complete. Depth: ${depth}, Chi gained: ${chiGained}.`;
    if (enlightenmentGained > 0) message += ` Enlightenment +${enlightenmentGained}!`;
    if (wasEnlightened) message += ' A flash of true enlightenment!';

    return { success: true, message, chiGained, depth, wasEnlightened };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, grantReputation, titleMultiplier]);

  // ===========================================================================
  // PUBLIC: trainMartialArt — Perform a martial arts training session
  // ===========================================================================

  const trainMartialArt = useCallback((): { success: boolean; message: string; xpGained: number; leveledUp: boolean; newLevel: number } => {
    checkDailyReset();
    const current = stateRef.current;

    if (current.martialArtsLevel >= SP_MAX_MARTIAL_ARTS_LEVEL) {
      return { success: false, message: 'Martial arts is already at maximum level.', xpGained: 0, leveledUp: false, newLevel: current.martialArtsLevel };
    }

    const xpNeeded = current.martialArtsLevel * 100;
    const xpGained = Math.floor((50 + Math.random() * 30) * titleMultiplier);
    const newXp = current.martialArtsXp + xpGained;
    const shouldLevel = newXp >= xpNeeded;
    const newLevel = shouldLevel ? Math.min(current.martialArtsLevel + 1, SP_MAX_MARTIAL_ARTS_LEVEL) : current.martialArtsLevel;
    const remainingXp = shouldLevel ? newXp - xpNeeded : newXp;

    setState(prev => ({
      ...prev,
      martialArtsXp: remainingXp,
      martialArtsLevel: newLevel,
      martialArtsSessionsCompleted: prev.martialArtsSessionsCompleted + 1,
      updatedAt: Date.now(),
    }));

    updateDailyTask('martialArtsTrained');
    updateAchievementTracking('martial_arts_sessions', stateRef.current.martialArtsSessionsCompleted + 1);
    if (shouldLevel) {
      updateAchievementTracking('martial_arts_level', newLevel);
      grantReputation(newLevel * 5);
    }

    const message = shouldLevel
      ? `Martial arts leveled up to ${newLevel}! Gained ${xpGained} XP.`
      : `Training complete. +${xpGained} XP. Need ${xpNeeded - current.martialArtsXp} more for level ${current.martialArtsLevel + 1}.`;

    return { success: true, message, xpGained, leveledUp: shouldLevel, newLevel };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, grantReputation, titleMultiplier]);

  // ===========================================================================
  // PUBLIC: discoverTemple — Discover a hidden temple at a peak
  // ===========================================================================

  const discoverTemple = useCallback((templeId: string): { success: boolean; message: string; templeName?: string } => {
    checkDailyReset();
    const templeDef = SP_TEMPLES.find(t => t.id === templeId);
    if (!templeDef) return { success: false, message: 'Unknown temple.' };

    const current = stateRef.current;
    const peakDef = SP_PEAKS.find(p => p.id === current.currentPeak);
    if (!peakDef || peakDef.id !== templeDef.peakId) {
      return { success: false, message: `You must be at ${peakDef?.name ?? 'the correct peak'} to discover this temple.` };
    }

    if (current.altitudeReached < peakDef.unlockAltitude) {
      return { success: false, message: 'Not high enough altitude to discover this temple.' };
    }

    setState(prev => ({
      ...prev,
      templesDiscovered: prev.templesDiscovered + 1,
      chiEnergy: Math.min(prev.chiEnergy + 50, SP_MAX_CHI),
      totalChiGained: prev.totalChiGained + 50,
      templeReputation: prev.templeReputation + 25,
      updatedAt: Date.now(),
    }));

    updateDailyTask('templesDiscovered');
    grantChi(50);
    grantReputation(25);

    return {
      success: true,
      message: `You discovered ${templeDef.name}! +50 chi, +25 reputation.`,
      templeName: templeDef.name,
    };
  }, [checkDailyReset, updateDailyTask, grantChi, grantReputation]);

  // ===========================================================================
  // PUBLIC: channelChi — Channel chi energy to restore and amplify
  // ===========================================================================

  const channelChi = useCallback((amount: number): { success: boolean; message: string; chiGained: number } => {
    checkDailyReset();
    const current = stateRef.current;

    if (amount <= 0 || amount > 100) {
      return { success: false, message: 'Channel amount must be between 1 and 100.', chiGained: 0 };
    }

    const structureMultiplier = 1 + Object.values(current.structures).reduce((sum, s) => {
      const sDef = SP_STRUCTURES.find(d => d.id === s.structureId);
      return sum + (sDef?.chiPerDay ?? 0) * s.level * 0.01;
    }, 0);

    const chiGained = Math.floor(amount * structureMultiplier * titleMultiplier);
    const reputationGain = Math.floor(chiGained / 10);

    setState(prev => ({
      ...prev,
      chiEnergy: Math.min(prev.chiEnergy + chiGained, SP_MAX_CHI),
      totalChiGained: prev.totalChiGained + chiGained,
      totalChiChanneled: prev.totalChiChanneled + chiGained,
      updatedAt: Date.now(),
    }));

    updateDailyTask('chiChanneled', chiGained);
    updateAchievementTracking('total_chi_gained', stateRef.current.totalChiGained + chiGained);
    grantReputation(reputationGain);

    return { success: true, message: `Channeled ${chiGained} chi! (+${reputationGain} reputation)`, chiGained };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, grantReputation, titleMultiplier]);

  // ===========================================================================
  // PUBLIC: achieveEnlightenment — Attempt a special enlightenment ritual
  // ===========================================================================

  const achieveEnlightenment = useCallback((): { success: boolean; message: string; enlightenmentGained: number } => {
    checkDailyReset();
    const current = stateRef.current;

    if (current.currentPeak !== 'enlightenment_zenith') {
      return { success: false, message: 'You must be at the Enlightenment Zenith to attempt enlightenment.', enlightenmentGained: 0 };
    }

    const chiCost = 100;
    if (current.chiEnergy < chiCost) {
      return { success: false, message: `Need ${chiCost} chi for the enlightenment ritual. Have ${current.chiEnergy}.`, enlightenmentGained: 0 };
    }

    const meditationBonus = Math.floor(current.maxMeditationDepth / 10);
    const creatureBonus = Math.floor(current.creaturesBefriended * 2);
    const baseChance = 0.15;
    const totalChance = Math.min(0.9, baseChance + meditationBonus * 0.02 + creatureBonus * 0.01);
    const roll = Math.random();
    const succeeded = roll < totalChance;
    const enlightenmentGained = succeeded ? Math.floor(20 + meditationBonus + creatureBonus * 0.5) : Math.floor(5 + Math.random() * 5);

    setState(prev => ({
      ...prev,
      chiEnergy: prev.chiEnergy - chiCost,
      enlightenment: Math.min(prev.enlightenment + enlightenmentGained, SP_MAX_ENLIGHTENMENT),
      updatedAt: Date.now(),
    }));

    if (succeeded) {
      grantReputation(50);
      return { success: true, message: `🎉 A wave of enlightenment washes over you! +${enlightenmentGained} enlightenment!`, enlightenmentGained };
    }

    return { success: false, message: `The ritual fades... +${enlightenmentGained} partial enlightenment. Try again.`, enlightenmentGained };
  }, [checkDailyReset, grantReputation]);

  // ===========================================================================
  // INTERNAL: Get active event multiplier
  // ===========================================================================

  const getEventMultiplier = useCallback((field: 'chi' | 'reputation' | 'taming' | 'meditation'): number => {
    const current = stateRef.current;
    if (!current.activeEvent || !current.eventEndTime) return 1.0;
    if (Date.now() > current.eventEndTime) return 1.0;
    const eventDef = SP_MOUNTAIN_EVENTS.find(e => e.id === current.activeEvent);
    if (!eventDef) return 1.0;
    switch (field) {
      case 'chi': return eventDef.chiMultiplier;
      case 'reputation': return eventDef.reputationMultiplier;
      case 'taming': return eventDef.tamingBonus;
      case 'meditation': return eventDef.meditationBonus;
      default: return 1.0;
    }
  }, []);

  // ===========================================================================
  // INTERNAL: Check and expire active event
  // ===========================================================================

  const checkEventExpiry = useCallback(() => {
    const current = stateRef.current;
    if (current.activeEvent && current.eventEndTime && Date.now() > current.eventEndTime) {
      setState(prev => ({
        ...prev,
        activeEvent: null,
        eventEndTime: null,
      }));
    }
  }, []);

  // ===========================================================================
  // PUBLIC: feedCreature — Feed a tamed creature to increase bond strength
  // ===========================================================================

  const feedCreature = useCallback((creatureId: string): { success: boolean; message: string; bondGained: number } => {
    const def = SP_CREATURES.find(c => c.id === creatureId);
    if (!def) return { success: false, message: 'Unknown creature.', bondGained: 0 };

    const current = stateRef.current;
    const creatureState = current.creatures[creatureId];
    if (!creatureState || !creatureState.tamed) {
      return { success: false, message: `${def.name} is not your companion.`, bondGained: 0 };
    }
    if (creatureState.bondStrength >= SP_MAX_BOND_STRENGTH) {
      return { success: false, message: `${def.name} already has maximum bond strength.`, bondGained: 0 };
    }

    const chiCost = 5;
    if (current.chiEnergy < chiCost) {
      return { success: false, message: `Not enough chi to feed ${def.name}. Need ${chiCost}.`, bondGained: 0 };
    }

    const bondGained = Math.floor(Math.random() * 5) + 2;
    const herbBonus = Object.entries(current.spiritHerbs).reduce((sum, [herbId, herbState]) => {
      if (herbState.quantity <= 0) return sum;
      const herbDef = SP_SPIRIT_HERBS.find(h => h.id === herbId);
      if (!herbDef) return sum;
      return sum + herbDef.tamingBoost * 0.1;
    }, 0);
    const totalBond = Math.min(SP_MAX_BOND_STRENGTH, creatureState.bondStrength + Math.floor(bondGained + herbBonus));

    setState(prev => ({
      ...prev,
      creatures: {
        ...prev.creatures,
        [creatureId]: { ...prev.creatures[creatureId], bondStrength: totalBond },
      },
      chiEnergy: prev.chiEnergy - chiCost,
      updatedAt: Date.now(),
    }));

    return { success: true, message: `Fed ${def.name}. Bond +${totalBond - creatureState.bondStrength}.`, bondGained: totalBond - creatureState.bondStrength };
  }, []);

  // ===========================================================================
  // PUBLIC: consumeHerb — Consume a spirit herb for its effects
  // ===========================================================================

  const consumeHerb = useCallback((herbId: string): { success: boolean; message: string; effects: { chiRestored: number; enlightenmentGained: number; meditationBoostDuration: number } } => {
    const def = SP_SPIRIT_HERBS.find(h => h.id === herbId);
    if (!def) return { success: false, message: 'Unknown herb.', effects: { chiRestored: 0, enlightenmentGained: 0, meditationBoostDuration: 0 } };

    const current = stateRef.current;
    const herbState = current.spiritHerbs[herbId];
    if (!herbState || herbState.quantity <= 0) {
      return { success: false, message: `No ${def.name} remaining.`, effects: { chiRestored: 0, enlightenmentGained: 0, meditationBoostDuration: 0 } };
    }

    const chiRestored = Math.floor(def.chiRestore * titleMultiplier);
    const enlightenmentGained = def.enlightenmentBonus;

    setState(prev => ({
      ...prev,
      spiritHerbs: {
        ...prev.spiritHerbs,
        [herbId]: { ...prev.spiritHerbs[herbId], quantity: prev.spiritHerbs[herbId].quantity - 1 },
      },
      chiEnergy: Math.min(prev.chiEnergy + chiRestored, SP_MAX_CHI),
      totalChiGained: prev.totalChiGained + chiRestored,
      enlightenment: Math.min(prev.enlightenment + enlightenmentGained, SP_MAX_ENLIGHTENMENT),
      updatedAt: Date.now(),
    }));

    updateAchievementTracking('total_chi_gained', stateRef.current.totalChiGained + chiRestored);

    return {
      success: true,
      message: `Used ${def.name}. Restored ${chiRestored} chi${enlightenmentGained > 0 ? `, +${enlightenmentGained} enlightenment` : ''}.`,
      effects: { chiRestored, enlightenmentGained, meditationBoostDuration: def.meditationBoost * 1000 },
    };
  }, [titleMultiplier, updateAchievementTracking]);

  // ===========================================================================
  // PUBLIC: collectStructureIncome — Collect accumulated chi and reputation
  // ===========================================================================

  const collectStructureIncome = useCallback((): { success: boolean; message: string; chiCollected: number; reputationCollected: number } => {
    const current = stateRef.current;
    let totalChi = 0;
    let totalRep = 0;

    const updatedStructures: Record<string, SPStructureState> = {};
    for (const [id, st] of Object.entries(current.structures)) {
      const def = SP_STRUCTURES.find(d => d.id === id);
      if (!def) continue;
      const now = Date.now();
      const elapsedHours = Math.max(0, (now - st.lastCollected) / (1000 * 60 * 60));
      const maxHours = 24;
      const activeHours = Math.min(elapsedHours, maxHours);
      const chiIncome = Math.floor(def.chiPerDay * st.level * (activeHours / 24));
      const repIncome = Math.floor(def.reputationPerDay * st.level * (activeHours / 24));
      totalChi += chiIncome;
      totalRep += repIncome;
      updatedStructures[id] = { ...st, lastCollected: now };
    }

    if (totalChi === 0 && totalRep === 0) {
      return { success: false, message: 'Nothing to collect yet. Wait for structures to generate income.', chiCollected: 0, reputationCollected: 0 };
    }

    setState(prev => ({
      ...prev,
      structures: { ...prev.structures, ...updatedStructures },
      chiEnergy: Math.min(prev.chiEnergy + totalChi, SP_MAX_CHI),
      totalChiGained: prev.totalChiGained + totalChi,
      templeReputation: prev.templeReputation + totalRep,
      totalReputation: prev.totalReputation + totalRep,
      updatedAt: Date.now(),
    }));

    grantReputation(totalRep);
    return {
      success: true,
      message: `Collected ${totalChi} chi and ${totalRep} reputation from temple structures.`,
      chiCollected: totalChi,
      reputationCollected: totalRep,
    };
  }, [grantReputation]);

  // ===========================================================================
  // PUBLIC: unlockAbility — Unlock a locked ability using chi
  // ===========================================================================

  const unlockAbility = useCallback((abilityId: string): { success: boolean; message: string } => {
    const def = SP_ABILITIES.find(a => a.id === abilityId);
    if (!def) return { success: false, message: 'Unknown ability.' };

    const current = stateRef.current;
    const abilityState = current.abilities[abilityId];
    if (!abilityState) return { success: false, message: 'Ability data not found.' };
    if (abilityState.unlocked) return { success: false, message: `${def.name} is already unlocked.` };

    if (current.chiEnergy < def.unlockCost) {
      return { success: false, message: `Not enough chi to unlock ${def.name}. Need ${def.unlockCost}.` };
    }

    setState(prev => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [abilityId]: { ...prev.abilities[abilityId], unlocked: true, unlockedAt: Date.now() },
      },
      chiEnergy: prev.chiEnergy - def.unlockCost,
      updatedAt: Date.now(),
    }));

    grantReputation(Math.floor(def.unlockCost / 10));
    return { success: true, message: `${def.name} unlocked! Use it to channel ${def.element} energy.` };
  }, [grantReputation]);

  // ===========================================================================
  // PUBLIC: startMountainEvent — Manually trigger a mountain event
  // ===========================================================================

  const startMountainEvent = useCallback((eventId: SPMountainEventId): { success: boolean; message: string } => {
    const current = stateRef.current;
    if (current.activeEvent) {
      return { success: false, message: `An event (${current.activeEvent}) is already active. Wait for it to end.` };
    }

    const def = SP_MOUNTAIN_EVENTS.find(e => e.id === eventId);
    if (!def) return { success: false, message: 'Unknown event.' };

    const endTime = Date.now() + def.durationHours * 60 * 60 * 1000;

    setState(prev => ({
      ...prev,
      activeEvent: eventId,
      eventEndTime: endTime,
      eventHistory: [
        ...prev.eventHistory,
        { eventId, startedAt: Date.now(), endedAt: endTime, chiGained: 0, reputationGained: 0 },
      ],
      updatedAt: Date.now(),
    }));

    return { success: true, message: `${def.name} has begun! Duration: ${def.durationHours} hours. All bonuses are now active.` };
  }, []);

  // ===========================================================================
  // PUBLIC: claimDailyReward — Claim the daily training task reward
  // ===========================================================================

  const claimDailyReward = useCallback((): { success: boolean; message: string; chiReward: number; reputationReward: number } => {
    checkDailyReset();
    const current = stateRef.current;
    const task = current.dailyTrainingTask;
    const today = new Date().toISOString().slice(0, 10);

    if (task.date !== today) return { success: false, message: 'Daily task has reset. Complete today\'s tasks first.', chiReward: 0, reputationReward: 0 };
    if (task.rewardClaimed) return { success: false, message: 'Daily reward already claimed today.', chiReward: 0, reputationReward: 0 };

    const isComplete = task.creaturesTamed >= 3 && task.peaksClimbed >= 2 && task.meditationsCompleted >= 1 && task.martialArtsTrained >= 1;
    if (!isComplete) return { success: false, message: 'Daily task not yet complete. Tame 3 creatures, climb 2 peaks, meditate, and train.', chiReward: 0, reputationReward: 0 };

    const chiReward = Math.floor(100 * titleMultiplier);
    const reputationReward = Math.floor(50 * titleMultiplier);

    setState(prev => ({
      ...prev,
      chiEnergy: Math.min(prev.chiEnergy + chiReward, SP_MAX_CHI),
      totalChiGained: prev.totalChiGained + chiReward,
      templeReputation: prev.templeReputation + reputationReward,
      totalReputation: prev.totalReputation + reputationReward,
      dailyTrainingTask: { ...prev.dailyTrainingTask, rewardClaimed: true },
      updatedAt: Date.now(),
    }));

    return { success: true, message: `Daily training reward claimed! +${chiReward} chi, +${reputationReward} reputation.`, chiReward, reputationReward };
  }, [checkDailyReset, titleMultiplier]);

  // ===========================================================================
  // PUBLIC: nicknameCreature — Give a tamed creature a nickname
  // ===========================================================================

  const nicknameCreature = useCallback((creatureId: string, nickname: string): { success: boolean; message: string } => {
    const current = stateRef.current;
    const creatureState = current.creatures[creatureId];
    if (!creatureState || !creatureState.tamed) {
      return { success: false, message: 'This creature is not your companion.' };
    }
    if (nickname.length < 1 || nickname.length > 20) {
      return { success: false, message: 'Nickname must be 1-20 characters.' };
    }

    setState(prev => ({
      ...prev,
      creatures: {
        ...prev.creatures,
        [creatureId]: { ...prev.creatures[creatureId], nickname },
      },
      updatedAt: Date.now(),
    }));

    const def = SP_CREATURES.find(c => c.id === creatureId);
    return { success: true, message: `${def?.name ?? creatureId} is now known as "${nickname}".` };
  }, []);

  // ===========================================================================
  // PUBLIC: checkAchievements — Explicitly re-evaluate all achievements
  // ===========================================================================

  const checkAchievements = useCallback((): { newlyUnlocked: string[] } => {
    const current = stateRef.current;
    const newlyUnlocked: string[] = [];

    setState(prev => {
      const updated: Record<string, SPAchievementState> = { ...prev.achievements };
      let values: Record<string, number> = {
        peaks_visited: Object.values(prev.peaks).filter(p => p.visited).length,
        creatures_tamed: prev.creaturesBefriended,
        structures_built: Object.keys(prev.structures).length,
        max_structure_level: Object.values(prev.structures).some(s => {
          const d = SP_STRUCTURES.find(def => def.id === s.structureId);
          return d && s.level >= d.maxLevel;
        }) ? 1 : 0,
        total_chi_gained: prev.totalChiGained,
        max_meditation_depth: prev.maxMeditationDepth,
        martial_arts_sessions: prev.martialArtsSessionsCompleted,
        martial_arts_level: prev.martialArtsLevel,
        altitude_reached: prev.altitudeReached,
        title_index: prev.titleIndex,
      };

      for (const ach of SP_ACHIEVEMENTS) {
        const currentAch = updated[ach.id];
        const val = values[ach.conditionKey] ?? currentAch.currentValue;
        if (!currentAch.unlocked && val >= ach.targetValue) {
          updated[ach.id] = { ...currentAch, unlocked: true, unlockedAt: Date.now(), currentValue: val };
          newlyUnlocked.push(ach.id);
        } else if (val > currentAch.currentValue) {
          updated[ach.id] = { ...currentAch, currentValue: val };
        }
      }

      return { ...prev, achievements: updated };
    });

    return { newlyUnlocked };
  }, []);

  // ===========================================================================
  // PUBLIC: getTitle — Get the current title definition
  // ===========================================================================

  const getTitle = useCallback((): SPTitleDef => {
    return SP_TITLES[stateRef.current.titleIndex] ?? SP_TITLES[0];
  }, []);

  // ===========================================================================
  // PUBLIC: getProgress — Get overall progress metrics
  // ===========================================================================

  const getProgress = useCallback(() => {
    const s = stateRef.current;
    const totalCreatures = SP_CREATURES.length;
    const tamedCreatures = s.creaturesBefriended;
    const totalPeaks = SP_PEAKS.length;
    const visitedPeaks = Object.values(s.peaks).filter(p => p.visited).length;
    const totalStructures = SP_STRUCTURES.length;
    const builtStructures = Object.keys(s.structures).length;
    const totalAbilities = SP_ABILITIES.length;
    const unlockedAbilities = Object.values(s.abilities).filter(a => a.unlocked).length;
    const totalAchievements = SP_ACHIEVEMENTS.length;
    const unlockedAchievements = Object.values(s.achievements).filter(a => a.unlocked).length;
    const totalTemples = SP_TEMPLES.length;
    const discoveredTemples = s.templesDiscovered;
    const altitudePercent = (s.altitudeReached / SP_MAX_ALTITUDE) * 100;
    const enlightenmentPercent = (s.enlightenment / SP_MAX_ENLIGHTENMENT) * 100;
    const overallProgress = (
      (tamedCreatures / totalCreatures) * 20 +
      (visitedPeaks / totalPeaks) * 15 +
      (builtStructures / totalStructures) * 10 +
      (unlockedAbilities / totalAbilities) * 10 +
      (unlockedAchievements / totalAchievements) * 20 +
      (altitudePercent / 100) * 10 +
      (enlightenmentPercent / 100) * 15
    );
    return {
      tamedCreatures, totalCreatures, tamedPercent: (tamedCreatures / totalCreatures) * 100,
      visitedPeaks, totalPeaks, peaksPercent: (visitedPeaks / totalPeaks) * 100,
      builtStructures, totalStructures, structuresPercent: (builtStructures / totalStructures) * 100,
      unlockedAbilities, totalAbilities, abilitiesPercent: (unlockedAbilities / totalAbilities) * 100,
      unlockedAchievements, totalAchievements, achievementsPercent: (unlockedAchievements / totalAchievements) * 100,
      discoveredTemples, totalTemples, templesPercent: (discoveredTemples / totalTemples) * 100,
      altitudePercent, enlightenmentPercent, overallProgress: Math.min(100, overallProgress),
      martialArtsLevel: s.martialArtsLevel, martialArtsPercent: (s.martialArtsLevel / SP_MAX_MARTIAL_ARTS_LEVEL) * 100,
    };
  }, []);

  // ===========================================================================
  // PUBLIC: getStats — Get detailed statistics
  // ===========================================================================

  const getStats = useCallback(() => {
    const s = stateRef.current;
    const unlockedAbilityCount = Object.values(s.abilities).filter(a => a.unlocked).length;
    const maxLevelStructures = Object.values(s.structures).filter(st => {
      const d = SP_STRUCTURES.find(def => def.id === st.structureId);
      return d && st.level >= d.maxLevel;
    }).length;
    const averageBond = Object.values(s.creatures).filter(c => c.tamed).length > 0
      ? Object.values(s.creatures).filter(c => c.tamed).reduce((sum, c) => sum + c.bondStrength, 0) / Object.values(s.creatures).filter(c => c.tamed).length
      : 0;
    const totalAbilityUses = Object.values(s.abilities).reduce((sum, a) => sum + a.totalUses, 0);
    return {
      chiEnergy: s.chiEnergy,
      totalChiGained: s.totalChiGained,
      totalChiChanneled: s.totalChiChanneled,
      enlightenment: s.enlightenment,
      altitudeReached: s.altitudeReached,
      creaturesBefriended: s.creaturesBefriended,
      templesDiscovered: s.templesDiscovered,
      templeReputation: s.templeReputation,
      totalReputation: s.totalReputation,
      martialArtsLevel: s.martialArtsLevel,
      martialArtsSessionsCompleted: s.martialArtsSessionsCompleted,
      meditationCount: s.meditationCount,
      maxMeditationDepth: s.maxMeditationDepth,
      totalMeditationTime: s.totalMeditationTime,
      structuresBuilt: Object.keys(s.structures).length,
      maxLevelStructures,
      abilitiesUnlocked: unlockedAbilityCount,
      totalAbilityUses,
      achievementsUnlocked: Object.values(s.achievements).filter(a => a.unlocked).length,
      averageCreatureBond: Math.round(averageBond * 10) / 10,
      tamingInProgress: Object.values(s.tamingProgress).filter(t => !t.completed).length,
      daysSinceCreation: Math.max(1, Math.floor((Date.now() - s.createdAt) / SP_DAILY_RESET_MS)),
    };
  }, []);

  // ===========================================================================
  // MEMO: Derived computed values
  // ===========================================================================

  const peakCreatures = useMemo(() => {
    return SP_CREATURES.filter(c => c.peakAffinity.includes(state.currentPeak));
  }, [state.currentPeak]);

  const availablePeaks = useMemo(() => {
    return SP_PEAKS.filter(p => state.altitudeReached >= p.unlockAltitude);
  }, [state.altitudeReached]);

  const structureSummary = useMemo(() => {
    return SP_STRUCTURES.map(def => {
      const st = state.structures[def.id];
      return {
        ...def,
        currentLevel: st?.level ?? 0,
        isBuilt: !!st,
        upgradeCost: st ? getUpgradeCost(def.id, st.level + 1) : def.baseCost,
        canUpgrade: st ? st.level < def.maxLevel : true,
        dailyChi: st ? def.chiPerDay * st.level : 0,
        dailyRep: st ? def.reputationPerDay * st.level : 0,
      };
    });
  }, [state.structures, getUpgradeCost]);

  const abilitySummary = useMemo(() => {
    return SP_ABILITIES.map(def => {
      const ab = state.abilities[def.id];
      return {
        ...def,
        isUnlocked: ab?.unlocked ?? false,
        totalUses: ab?.totalUses ?? 0,
        lastUsedAt: ab?.lastUsedAt ?? 0,
      };
    });
  }, [state.abilities]);

  const achievementSummary = useMemo(() => {
    return SP_ACHIEVEMENTS.map(def => {
      const ach = state.achievements[def.id];
      return {
        ...def,
        isUnlocked: ach?.unlocked ?? false,
        unlockedAt: ach?.unlockedAt ?? null,
        currentValue: ach?.currentValue ?? 0,
        progressPercent: ach ? Math.min(100, (ach.currentValue / def.targetValue) * 100) : 0,
      };
    });
  }, [state.achievements]);

  const dailyChiIncome = useMemo(() => {
    let total = 0;
    for (const [id, st] of Object.entries(state.structures)) {
      const def = SP_STRUCTURES.find(d => d.id === id);
      if (def) total += def.chiPerDay * st.level;
    }
    return total;
  }, [state.structures]);

  const dailyReputationIncome = useMemo(() => {
    let total = 0;
    for (const [id, st] of Object.entries(state.structures)) {
      const def = SP_STRUCTURES.find(d => d.id === id);
      if (def) total += def.reputationPerDay * st.level;
    }
    return total;
  }, [state.structures]);

  const tamedCreaturesList = useMemo(() => {
    return Object.values(state.creatures).filter(c => c.tamed).map(cs => {
      const def = SP_CREATURES.find(d => d.id === cs.creatureId);
      return { ...cs, def: def ?? null };
    }).filter(c => c.def !== null);
  }, [state.creatures]);

  const activeTamingList = useMemo(() => {
    return Object.values(state.tamingProgress).filter(t => !t.completed).map(tp => {
      const def = SP_CREATURES.find(d => d.id === tp.creatureId);
      return { ...tp, def: def ?? null };
    }).filter(t => t.def !== null);
  }, [state.tamingProgress]);

  const nextTitle = useMemo(() => {
    const next = SP_TITLES[state.titleIndex + 1];
    if (!next) return null;
    return { ...next, reputationNeeded: next.requiredReputation - state.templeReputation };
  }, [state.titleIndex, state.templeReputation]);

  const isDailyTaskComplete = useMemo(() => {
    const t = state.dailyTrainingTask;
    const today = new Date().toISOString().slice(0, 10);
    if (t.date !== today) return false;
    return t.creaturesTamed >= 3 && t.peaksClimbed >= 2 && t.meditationsCompleted >= 1 && t.martialArtsTrained >= 1;
  }, [state.dailyTrainingTask]);

  const unlockedPeaksCount = useMemo(() => {
    return SP_PEAKS.filter(p => state.altitudeReached >= p.unlockAltitude).length;
  }, [state.altitudeReached]);

  const martialArtsXpToNext = useMemo(() => {
    return state.martialArtsLevel * 100;
  }, [state.martialArtsLevel]);

  const martialArtsXpProgress = useMemo(() => {
    const needed = state.martialArtsLevel * 100;
    return Math.min(100, (state.martialArtsXp / needed) * 100);
  }, [state.martialArtsLevel, state.martialArtsXp]);

  const activeEventDef = useMemo(() => {
    if (!state.activeEvent) return null;
    if (state.eventEndTime && Date.now() > state.eventEndTime) return null;
    return SP_MOUNTAIN_EVENTS.find(e => e.id === state.activeEvent) ?? null;
  }, [state.activeEvent, state.eventEndTime]);

  const herbsAtCurrentPeak = useMemo(() => {
    return SP_SPIRIT_HERBS.filter(h => h.peakAffinity.includes(state.currentPeak));
  }, [state.currentPeak]);

  const herbInventoryList = useMemo(() => {
    return Object.values(state.spiritHerbs)
      .filter(hs => hs.quantity > 0)
      .map(hs => {
        const def = SP_SPIRIT_HERBS.find(h => h.id === hs.herbId);
        return def ? { ...def, quantity: hs.quantity } : null;
      })
      .filter((h): h is NonNullable<typeof h> => h !== null);
  }, [state.spiritHerbs]);

  const creaturesByRarity = useMemo(() => {
    const groups: Record<string, SPCreatureDef[]> = {};
    for (const c of SP_CREATURES) {
      if (!groups[c.rarity]) groups[c.rarity] = [];
      groups[c.rarity].push(c);
    }
    return groups;
  }, []);

  const equipmentBySlot = useMemo(() => {
    const groups: Record<string, SPEquipmentDef[]> = {};
    for (const eq of SP_EQUIPMENT) {
      if (!groups[eq.slot]) groups[eq.slot] = [];
      groups[eq.slot].push(eq);
    }
    return groups;
  }, []);

  const peakProgression = useMemo(() => {
    return SP_PEAKS.map(p => ({
      ...p,
      isUnlocked: state.altitudeReached >= p.unlockAltitude,
      isCurrent: state.currentPeak === p.id,
      isVisited: state.peaks[p.id]?.visited ?? false,
      visitsCount: state.peaks[p.id]?.visitsCount ?? 0,
      altitudeProgress: Math.min(100, (state.altitudeReached / p.elevation) * 100),
    }));
  }, [state.altitudeReached, state.currentPeak, state.peaks]);

  const enlightenmentProgress = useMemo(() => {
    return {
      current: state.enlightenment,
      max: SP_MAX_ENLIGHTENMENT,
      percent: (state.enlightenment / SP_MAX_ENLIGHTENMENT) * 100,
      tier: state.enlightenment >= 800 ? 'Transcendent' : state.enlightenment >= 500 ? 'Awakened' : state.enlightenment >= 200 ? 'Aware' : state.enlightenment >= 50 ? 'Seeking' : 'Beginner',
      tierColor: state.enlightenment >= 800 ? SP_SPIRIT_GOLD : state.enlightenment >= 500 ? SP_SKY_CYAN : state.enlightenment >= 200 ? SP_JADE_GREEN : state.enlightenment >= 50 ? SP_MOUNTAIN_GRAY : SP_THEME_COLORS.moonlightSilver,
    };
  }, [state.enlightenment]);

  const totalDefenseRating = useMemo(() => {
    return Object.values(state.equipment)
      .filter(e => e.equipped)
      .reduce((sum, e) => {
        const def = SP_EQUIPMENT.find(d => d.id === e.equipmentId);
        return sum + (def?.defense ?? 0);
      }, 0);
  }, [state.equipment]);

  const totalSpiritPowerRating = useMemo(() => {
    return Object.values(state.equipment)
      .filter(e => e.equipped)
      .reduce((sum, e) => {
        const def = SP_EQUIPMENT.find(d => d.id === e.equipmentId);
        return sum + (def?.spiritPower ?? 0);
      }, 0);
  }, [state.equipment]);

  // ===========================================================================
  // RETURN: Full API
  // ===========================================================================

  return {
    // State
    state,
    currentPeak: state.currentPeak,
    chiEnergy: state.chiEnergy,
    enlightenment: state.enlightenment,
    altitudeReached: state.altitudeReached,
    creaturesBefriended: state.creaturesBefriended,
    titleIndex: state.titleIndex,
    templeReputation: state.templeReputation,
    meditationDepth: state.meditationDepth,
    martialArtsLevel: state.martialArtsLevel,
    martialArtsXp: state.martialArtsXp,

    // Derived
    titleMultiplier,
    peakCreatures,
    availablePeaks,
    structureSummary,
    abilitySummary,
    achievementSummary,
    dailyChiIncome,
    dailyReputationIncome,
    tamedCreaturesList,
    activeTamingList,
    nextTitle,
    isDailyTaskComplete,
    unlockedPeaksCount,
    martialArtsXpToNext,
    martialArtsXpProgress,
    activeEventDef,
    herbsAtCurrentPeak,
    herbInventoryList,
    creaturesByRarity,
    equipmentBySlot,
    peakProgression,
    enlightenmentProgress,
    totalDefenseRating,
    totalSpiritPowerRating,

    // Actions (Required API)
    tameCreature,
    climbPeak,
    upgradeStructure,
    activateAbility,
    meditate,
    trainMartialArt,
    discoverTemple,
    channelChi,
    achieveEnlightenment,
    checkAchievements,
    getTitle,
    getProgress,
    getStats,

    // Actions (Extended API)
    feedCreature,
    useHerb: consumeHerb,
    collectStructureIncome,
    unlockAbility,
    startMountainEvent,
    claimDailyReward,
    nicknameCreature,
    getEventMultiplier,
  };
}
