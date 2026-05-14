'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// =============================================================================
// ZEPHYR HAVEN — 苍风圣殿 — Floating Sky Sanctuary Wire Module
// Color theme: sky blue #64B5F6, wind white #F5F5F5, storm gray #78909C,
//              golden dawn #FFB74D, sunset pink #F48FB1
// =============================================================================

// =============================================================================
// SECTION 1: TYPES
// =============================================================================

export type ZHRarity =
  | 'common'
  | 'unusual'
  | 'rare'
  | 'epic'
  | 'legendary';

export type ZHSanctuaryId =
  | 'cloud_garden'
  | 'wind_temple'
  | 'storm_nest'
  | 'dawn_pavilion'
  | 'mist_archipelago'
  | 'thunder_spire'
  | 'sunset_shrine'
  | 'zenith_sanctuary';

export type ZHWindType = 'breeze' | 'gale' | 'storm' | 'zephyr' | 'cyclone' | 'dawn_wind' | 'dusk_wind' | 'void_wind';

export interface ZHRarityDef {
  readonly key: ZHRarity;
  readonly label: string;
  readonly color: string;
  readonly wisdomMultiplier: number;
  readonly encounterWeight: number;
  readonly description: string;
}

export interface ZHWindSpiritDef {
  readonly id: string;
  readonly name: string;
  readonly rarity: ZHRarity;
  readonly windType: ZHWindType;
  readonly speed: number;
  readonly wisdom: number;
  readonly description: string;
  readonly icon: string;
  readonly canSummon: boolean;
  readonly summonDifficulty: number;
  readonly sanctuaryAffinity: ZHSanctuaryId[];
}

export interface ZHSanctuaryDef {
  readonly id: ZHSanctuaryId;
  readonly name: string;
  readonly description: string;
  readonly unlockAltitude: number;
  readonly dangerLevel: number;
  readonly baseWisdom: number;
  readonly baseFeatherChance: number;
  readonly icon: string;
  readonly elevation: number;
  readonly hazards: string[];
  readonly bossSpiritId: string | null;
}

export interface ZHFeatherDef {
  readonly id: string;
  readonly name: string;
  readonly rarity: ZHRarity;
  readonly windPower: number;
  readonly wisdomBoost: number;
  readonly description: string;
  readonly icon: string;
  readonly requiredSanctuary: ZHSanctuaryId | null;
}

export interface ZHStructureDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly maxLevel: number;
  readonly baseCost: number;
  readonly costPerLevel: number;
  readonly wisdomPerDay: number;
  readonly reputationPerDay: number;
  readonly tier: number;
}

export interface ZHAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly cooldown: number;
  readonly power: number;
  readonly wisdomCost: number;
  readonly unlockCost: number;
  readonly windType: ZHWindType;
  readonly isPassive: boolean;
}

export interface ZHAchievementDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly conditionKey: string;
  readonly targetValue: number;
  readonly wisdomReward: number;
  readonly featherReward: number;
  readonly icon: string;
}

export interface ZHTitleDef {
  readonly id: string;
  readonly name: string;
  readonly requiredReputation: number;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
  readonly bonusMultiplier: number;
}

export interface ZHSpiritState {
  readonly spiritId: string;
  readonly summoned: boolean;
  readonly summonedAt: number | null;
  readonly nickname: string;
  readonly level: number;
  readonly xp: number;
  readonly bondStrength: number;
}

export interface ZHStructureState {
  readonly structureId: string;
  readonly level: number;
  readonly builtAt: number;
  readonly lastCollected: number;
}

export interface ZHAchievementState {
  readonly id: string;
  readonly unlocked: boolean;
  readonly unlockedAt: number | null;
  readonly currentValue: number;
}

export interface ZHFeatherState {
  readonly featherId: string;
  readonly owned: boolean;
  readonly equipped: boolean;
  readonly acquiredAt: number;
  readonly upgrades: number;
}

export interface ZHAbilityState {
  readonly abilityId: string;
  readonly unlocked: boolean;
  readonly unlockedAt: number | null;
  readonly lastUsedAt: number;
  readonly totalUses: number;
}

export interface ZHSummonProgress {
  readonly spiritId: string;
  readonly progress: number;
  readonly maxProgress: number;
  readonly startedAt: number | null;
  readonly completed: boolean;
}

export interface ZHDailyTask {
  readonly date: string;
  readonly spiritsSummoned: number;
  readonly sanctuariesExplored: number;
  readonly windsChanneled: number;
  readonly structuresUpgraded: number;
  readonly abilitiesActivated: number;
  readonly feathersCollected: number;
  readonly stormsTamed: number;
  readonly cloudsSurfed: number;
  readonly isComplete: boolean;
  readonly rewardClaimed: boolean;
}

export interface ZHWindChannelSession {
  readonly startedAt: number;
  readonly endedAt: number | null;
  readonly windType: ZHWindType;
  readonly wisdomGained: number;
  readonly sanctuaryId: string;
  readonly wasBlessed: boolean;
}

export type ZHSkyEventId =
  | 'golden_dawn'
  | 'cyclone_festival'
  | 'whisper_tide'
  | 'storm_summit'
  | 'eagle_migration'
  | 'feather_rain'
  | 'dusk_aurora'
  | 'sanctuary_awakening';

export interface ZHSkyEventDef {
  readonly id: ZHSkyEventId;
  readonly name: string;
  readonly description: string;
  readonly durationHours: number;
  readonly wisdomMultiplier: number;
  readonly reputationMultiplier: number;
  readonly summonBonus: number;
  readonly channelBonus: number;
  readonly icon: string;
  readonly color: string;
}

export interface ZHEventLog {
  readonly eventId: string;
  readonly startedAt: number;
  readonly endedAt: number;
  readonly wisdomGained: number;
  readonly reputationGained: number;
}

export interface ZHState {
  readonly spirits: Record<string, ZHSpiritState>;
  readonly sanctuaries: Record<string, { visited: boolean; visitsCount: number; firstVisitAt: number | null; highestAltitude: number }>;
  readonly feathers: Record<string, ZHFeatherState>;
  readonly structures: Record<string, ZHStructureState>;
  readonly abilities: Record<string, ZHAbilityState>;
  readonly achievements: Record<string, ZHAchievementState>;
  readonly currentSanctuary: ZHSanctuaryId;
  readonly wisdom: number;
  readonly totalWisdomGained: number;
  readonly altitudeReached: number;
  readonly spiritsSummoned: number;
  readonly titleIndex: number;
  readonly reputation: number;
  readonly totalReputation: number;
  readonly windChanneled: number;
  readonly maxWindChannel: number;
  readonly channelCount: number;
  readonly totalWindChanneled: number;
  readonly stormTamingLevel: number;
  readonly stormTamingXp: number;
  readonly stormTamingSessions: number;
  readonly cloudsSurfed: number;
  readonly totalFeathersCollected: number;
  readonly dailyTask: ZHDailyTask;
  readonly summonProgress: Record<string, ZHSummonProgress>;
  readonly activeEvent: ZHSkyEventId | null;
  readonly eventEndTime: number | null;
  readonly eventHistory: ZHEventLog[];
  readonly lastDailyReset: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

// =============================================================================
// SECTION 2: CONSTANTS (ZH_ prefixed)
// =============================================================================

export const ZH_SKY_BLUE = '#64B5F6';
export const ZH_WIND_WHITE = '#F5F5F5';
export const ZH_STORM_GRAY = '#78909C';
export const ZH_GOLDEN_DAWN = '#FFB74D';
export const ZH_SUNSET_PINK = '#F48FB1';
export const ZH_DEEP_CLOUD = '#455A64';
export const ZH_MIST_AQUA = '#4DD0E1';
export const ZH_AURORA_VIOLET = '#CE93D8';
export const ZH_FEATHER_GOLD = '#FFD54F';
export const ZH_DUSK_ROSE = '#EF9A9A';

export const ZH_MAX_LEVEL = 50;
export const ZH_MAX_WISDOM = 999_999;
export const ZH_MAX_ALTITUDE = 12000;
export const ZH_MAX_WIND_CHANNEL = 100;
export const ZH_MAX_STORM_TAMING_LEVEL = 99;
export const ZH_MAX_TITLE_INDEX = 7;
export const ZH_MAX_STRUCTURE_LEVEL = 10;
export const ZH_MAX_BOND_STRENGTH = 100;
export const ZH_DAILY_RESET_MS = 86_400_000;
export const ZH_SUMMON_COOLDOWN_MS = 15_000;
export const ZH_CHANNEL_BASE_DURATION_MS = 30_000;
export const ZH_WIND_CHANNEL_COOLDOWN_MS = 10_000;
export const ZH_ABILITY_BASE_COOLDOWN_MS = 5_000;
export const ZH_STORM_SESSION_MS = 20_000;

export const ZH_THEME_COLORS = {
  skyBlue: ZH_SKY_BLUE,
  windWhite: ZH_WIND_WHITE,
  stormGray: ZH_STORM_GRAY,
  goldenDawn: ZH_GOLDEN_DAWN,
  sunsetPink: ZH_SUNSET_PINK,
  deepCloud: ZH_DEEP_CLOUD,
  mistAqua: ZH_MIST_AQUA,
  auroraViolet: ZH_AURORA_VIOLET,
  featherGold: ZH_FEATHER_GOLD,
  duskRose: ZH_DUSK_ROSE,
  dawnAmber: '#FFA726',
  cloudSilver: '#CFD8DC',
  breezeCyan: '#80DEEA',
  stormIndigo: '#7986CB',
  zenithWhite: '#ECEFF1',
  hawkBronze: '#A1887F',
  sanctuaryTeal: '#26A69A',
  windSage: '#8D6E63',
  cycloneEmerald: '#66BB6A',
} as const;

export const ZH_RARITY_DEFS: readonly ZHRarityDef[] = [
  { key: 'common', label: 'Common', color: ZH_THEME_COLORS.cloudSilver, wisdomMultiplier: 1.0, encounterWeight: 40, description: 'Gentle wind spirits that drift through the lower cloud layers.' },
  { key: 'unusual', label: 'Unusual', color: ZH_THEME_COLORS.windSage, wisdomMultiplier: 1.5, encounterWeight: 28, description: 'Spirits with unusual wind patterns, slightly harder to summon.' },
  { key: 'rare', label: 'Rare', color: ZH_THEME_COLORS.mistAqua, wisdomMultiplier: 2.5, encounterWeight: 18, description: 'Rare spirits that control specific wind currents with precision.' },
  { key: 'epic', label: 'Epic', color: ZH_THEME_COLORS.stormIndigo, wisdomMultiplier: 4.0, encounterWeight: 10, description: 'Powerful spirits that command storm winds and ancient breezes.' },
  { key: 'legendary', label: 'Legendary', color: ZH_THEME_COLORS.featherGold, wisdomMultiplier: 7.0, encounterWeight: 4, description: 'Mythical wind deities from the dawn of the skies.' },
] as const;

// =============================================================================
// SECTION 3: SKY SANCTUARIES (8)
// =============================================================================

export const ZH_SANCTUARIES: readonly ZHSanctuaryDef[] = [
  {
    id: 'cloud_garden', name: 'Cloud Garden', unlockAltitude: 0,
    description: 'A serene garden floating on gentle cumulus clouds where wind sprites play among flower petals that drift endlessly.',
    dangerLevel: 1, baseWisdom: 10, baseFeatherChance: 0.15, icon: '🌷', elevation: 1000,
    hazards: ['gentle_draft', 'cloud_sink', 'pollen_daze'],
    bossSpiritId: null,
  },
  {
    id: 'wind_temple', name: 'Wind Temple', unlockAltitude: 2000,
    description: 'An ancient temple built into the fabric of the wind itself, where breezes carry whispers of forgotten wisdom.',
    dangerLevel: 2, baseWisdom: 22, baseFeatherChance: 0.20, icon: '🏛️', elevation: 2500,
    hazards: ['wind_vortex', 'echoing_halls', 'invisible_bridges'],
    bossSpiritId: 'temple_guardian_breeze',
  },
  {
    id: 'storm_nest', name: 'Storm Nest', unlockAltitude: 4000,
    description: 'A massive nest woven from lightning-struck cloud where storm birds hatch and fierce winds howl constantly.',
    dangerLevel: 3, baseWisdom: 38, baseFeatherChance: 0.25, icon: '⚡', elevation: 4500,
    hazards: ['lightning_bolts', 'gale_force', 'thunder_haze'],
    bossSpiritId: 'storm_hatchling_warden',
  },
  {
    id: 'dawn_pavilion', name: 'Dawn Pavilion', unlockAltitude: 5500,
    description: 'A golden pavilion perched at the edge of the dawn line where the first light of day crystallizes into wisdom.',
    dangerLevel: 4, baseWisdom: 55, baseFeatherChance: 0.30, icon: '🌅', elevation: 6000,
    hazards: ['blinding_light', 'time_distortion', 'dawn_fire'],
    bossSpiritId: 'dawn_spirit_herald',
  },
  {
    id: 'mist_archipelago', name: 'Mist Archipelago', unlockAltitude: 7000,
    description: 'A chain of floating cloud islands connected by bridges of mist, home to the rarest wind spirits.',
    dangerLevel: 5, baseWisdom: 80, baseFeatherChance: 0.35, icon: '🌫️', elevation: 7500,
    hazards: ['island_drift', 'mist_displacement', 'spirit_currents'],
    bossSpiritId: 'mist_sovereign',
  },
  {
    id: 'thunder_spire', name: 'Thunder Spire', unlockAltitude: 8500,
    description: 'A towering spire of crystallized lightning that pierces the highest clouds, drawing raw power from the storms.',
    dangerLevel: 6, baseWisdom: 115, baseFeatherChance: 0.40, icon: '⛈️', elevation: 9000,
    hazards: ['electrical_storm', 'thunder_quake', 'static_discharge'],
    bossSpiritId: 'thunder_spire_spirit',
  },
  {
    id: 'sunset_shrine', name: 'Sunset Shrine', unlockAltitude: 10000,
    description: 'A shrine bathed in perpetual sunset where the boundary between day and night blurs and reality softens.',
    dangerLevel: 7, baseWisdom: 160, baseFeatherChance: 0.45, icon: '🌇', elevation: 10500,
    hazards: ['color_shift', 'reality_fade', 'dusk_spirits'],
    bossSpiritId: 'sunset_guardian',
  },
  {
    id: 'zenith_sanctuary', name: 'Zenith Sanctuary', unlockAltitude: 11500,
    description: 'The highest sanctuary in the sky where the wind stops and all wisdom of the world converges into pure silence.',
    dangerLevel: 8, baseWisdom: 250, baseFeatherChance: 0.55, icon: '✨', elevation: 12000,
    hazards: ['weightlessness', 'wisdom_overload', 'zenith_trance'],
    bossSpiritId: 'zephyr_deity',
  },
] as const;

// =============================================================================
// SECTION 4: WIND SPIRITS (35, 5 rarity tiers)
// =============================================================================

export const ZH_SPIRITS: readonly ZHWindSpiritDef[] = [
  // Common (7)
  {
    id: 'dust_devil', name: 'Dust Devil', rarity: 'common', windType: 'breeze', speed: 14, wisdom: 4,
    description: 'A playful little whirlwind that kicks up harmless clouds of dust.',
    icon: '🌪️', canSummon: true, summonDifficulty: 1, sanctuaryAffinity: ['cloud_garden'],
  },
  {
    id: 'morning_breeze', name: 'Morning Breeze', rarity: 'common', windType: 'breeze', speed: 18, wisdom: 3,
    description: 'A gentle breeze that carries the scent of morning dew and fresh flowers.',
    icon: '🌬️', canSummon: true, summonDifficulty: 1, sanctuaryAffinity: ['cloud_garden', 'wind_temple'],
  },
  {
    id: 'cloud_kitten', name: 'Cloud Kitten', rarity: 'common', windType: 'zephyr', speed: 20, wisdom: 5,
    description: 'A tiny spirit shaped like a kitten made of fluffy cumulus cloud.',
    icon: '🐱', canSummon: true, summonDifficulty: 1, sanctuaryAffinity: ['cloud_garden'],
  },
  {
    id: 'whisper_wisp', name: 'Whisper Wisp', rarity: 'common', windType: 'breeze', speed: 22, wisdom: 3,
    description: 'A faint wisp of wind that whispers secrets from distant lands.',
    icon: '👻', canSummon: true, summonDifficulty: 1, sanctuaryAffinity: ['cloud_garden', 'wind_temple'],
  },
  {
    id: 'dandelion_rider', name: 'Dandelion Rider', rarity: 'common', windType: 'breeze', speed: 16, wisdom: 4,
    description: 'A spirit that rides on dandelion seeds, scattering them across the sky.',
    icon: '🌼', canSummon: true, summonDifficulty: 1, sanctuaryAffinity: ['cloud_garden'],
  },
  {
    id: 'puff_sprite', name: 'Puff Sprite', rarity: 'common', windType: 'zephyr', speed: 12, wisdom: 6,
    description: 'A round sprite that inflates and deflates, creating tiny wind puffs.',
    icon: '🫧', canSummon: true, summonDifficulty: 2, sanctuaryAffinity: ['cloud_garden', 'mist_archipelago'],
  },
  {
    id: 'breeze_flutter', name: 'Breeze Flutter', rarity: 'common', windType: 'breeze', speed: 24, wisdom: 3,
    description: 'A butterfly-like spirit whose wings create gentle breezes wherever it goes.',
    icon: '🦋', canSummon: true, summonDifficulty: 1, sanctuaryAffinity: ['cloud_garden'],
  },
  // Unusual (7)
  {
    id: 'gale_hawk', name: 'Gale Hawk', rarity: 'unusual', windType: 'gale', speed: 35, wisdom: 14,
    description: 'A hawk that rides gale-force winds, spotting targets from miles above.',
    icon: '🦅', canSummon: true, summonDifficulty: 4, sanctuaryAffinity: ['wind_temple', 'storm_nest'],
  },
  {
    id: 'mist_weaver', name: 'Mist Weaver', rarity: 'unusual', windType: 'zephyr', speed: 28, wisdom: 16,
    description: 'A spider-like spirit that weaves bridges of mist between cloud islands.',
    icon: '🕷️', canSummon: true, summonDifficulty: 4, sanctuaryAffinity: ['wind_temple', 'mist_archipelago'],
  },
  {
    id: 'wind_chime', name: 'Wind Chime', rarity: 'unusual', windType: 'breeze', speed: 10, wisdom: 20,
    description: 'A crystalline spirit that produces beautiful melodies when wind passes through.',
    icon: '🎐', canSummon: true, summonDifficulty: 3, sanctuaryAffinity: ['wind_temple'],
  },
  {
    id: 'sky_jellyfish', name: 'Sky Jellyfish', rarity: 'unusual', windType: 'zephyr', speed: 15, wisdom: 18,
    description: 'A translucent jellyfish that drifts through the upper atmosphere on thermal currents.',
    icon: '🪼', canSummon: true, summonDifficulty: 4, sanctuaryAffinity: ['wind_temple', 'dawn_pavilion'],
  },
  {
    id: 'cloud_shepherd', name: 'Cloud Shepherd', rarity: 'unusual', windType: 'gale', speed: 22, wisdom: 15,
    description: 'A spirit that guides stray cloud fragments back to their proper formations.',
    icon: '🐑', canSummon: true, summonDifficulty: 3, sanctuaryAffinity: ['cloud_garden', 'wind_temple'],
  },
  {
    id: 'gust_fox', name: 'Gust Fox', rarity: 'unusual', windType: 'gale', speed: 38, wisdom: 12,
    description: 'A swift fox spirit that appears as a blur of wind and leaves.',
    icon: '🦊', canSummon: true, summonDifficulty: 5, sanctuaryAffinity: ['wind_temple', 'storm_nest'],
  },
  {
    id: 'drift_owl', name: 'Drift Owl', rarity: 'unusual', windType: 'zephyr', speed: 20, wisdom: 22,
    description: 'A wise owl that drifts silently on thermal updrafts, observing all below.',
    icon: '🦉', canSummon: true, summonDifficulty: 4, sanctuaryAffinity: ['wind_temple', 'mist_archipelago'],
  },
  // Rare (7)
  {
    id: 'temple_guardian_breeze', name: 'Temple Guardian Breeze', rarity: 'rare', windType: 'gale', speed: 30, wisdom: 30,
    description: 'The ancient breeze that has guarded the Wind Temple since its founding.',
    icon: '🏯', canSummon: false, summonDifficulty: 0, sanctuaryAffinity: ['wind_temple'],
  },
  {
    id: 'storm_hatchling_warden', name: 'Storm Hatchling Warden', rarity: 'rare', windType: 'storm', speed: 40, wisdom: 28,
    description: 'A fierce warden that protects storm bird hatchlings in the Storm Nest.',
    icon: '🦅', canSummon: false, summonDifficulty: 0, sanctuaryAffinity: ['storm_nest'],
  },
  {
    id: 'dawn_spirit_herald', name: 'Dawn Spirit Herald', rarity: 'rare', windType: 'dawn_wind', speed: 32, wisdom: 35,
    description: 'A radiant spirit that announces the coming of dawn across all skies.',
    icon: '🌅', canSummon: true, summonDifficulty: 7, sanctuaryAffinity: ['dawn_pavilion'],
  },
  {
    id: 'mist_sovereign', name: 'Mist Sovereign', rarity: 'rare', windType: 'zephyr', speed: 18, wisdom: 40,
    description: 'The ruler of the Mist Archipelago who commands all mist and fog.',
    icon: '👑', canSummon: true, summonDifficulty: 8, sanctuaryAffinity: ['mist_archipelago'],
  },
  {
    id: 'feather_collector', name: 'Feather Collector', rarity: 'rare', windType: 'zephyr', speed: 25, wisdom: 32,
    description: 'A spirit that gathers rare feathers from across the sky and hoards them in cloud nests.',
    icon: '🪶', canSummon: true, summonDifficulty: 7, sanctuaryAffinity: ['cloud_garden', 'mist_archipelago'],
  },
  {
    id: 'thermal_rider', name: 'Thermal Rider', rarity: 'rare', windType: 'gale', speed: 50, wisdom: 26,
    description: 'A spirit that surfs thermal updrafts to incredible heights, never touching clouds.',
    icon: '🏄', canSummon: true, summonDifficulty: 8, sanctuaryAffinity: ['storm_nest', 'dawn_pavilion'],
  },
  {
    id: 'rainbow_weaver', name: 'Rainbow Weaver', rarity: 'rare', windType: 'dawn_wind', speed: 28, wisdom: 36,
    description: 'A spirit that weaves rainbows from captured sunlight and wind crystals.',
    icon: '🌈', canSummon: true, summonDifficulty: 7, sanctuaryAffinity: ['dawn_pavilion', 'sunset_shrine'],
  },
  // Epic (7)
  {
    id: 'thunder_spire_spirit', name: 'Thunder Spire Spirit', rarity: 'epic', windType: 'storm', speed: 55, wisdom: 60,
    description: 'The embodiment of the Thunder Spire, a being of pure concentrated lightning.',
    icon: '⚡', canSummon: false, summonDifficulty: 0, sanctuaryAffinity: ['thunder_spire'],
  },
  {
    id: 'sunset_guardian', name: 'Sunset Guardian', rarity: 'epic', windType: 'dusk_wind', speed: 42, wisdom: 65,
    description: 'A majestic guardian that maintains the eternal sunset at the Shrine of Dusk.',
    icon: '🌇', canSummon: false, summonDifficulty: 0, sanctuaryAffinity: ['sunset_shrine'],
  },
  {
    id: 'cyclone_lord', name: 'Cyclone Lord', rarity: 'epic', windType: 'cyclone', speed: 70, wisdom: 55,
    description: 'A terrifyingly powerful spirit that commands cyclones and shapes them at will.',
    icon: '🌀', canSummon: true, summonDifficulty: 11, sanctuaryAffinity: ['storm_nest', 'thunder_spire'],
  },
  {
    id: 'dawn_phoenix', name: 'Dawn Phoenix', rarity: 'epic', windType: 'dawn_wind', speed: 60, wisdom: 62,
    description: 'A phoenix reborn each dawn from the first rays of sunlight, ablaze with wisdom.',
    icon: '🔥', canSummon: true, summonDifficulty: 12, sanctuaryAffinity: ['dawn_pavilion'],
  },
  {
    id: 'void_wanderer', name: 'Void Wanderer', rarity: 'epic', windType: 'void_wind', speed: 48, wisdom: 70,
    description: 'A mysterious spirit that wanders the void between clouds, where no wind has ever blown.',
    icon: '🌑', canSummon: true, summonDifficulty: 12, sanctuaryAffinity: ['sunset_shrine'],
  },
  {
    id: 'great_wind_serpent', name: 'Great Wind Serpent', rarity: 'epic', windType: 'gale', speed: 65, wisdom: 58,
    description: 'A massive serpent that coils through jet streams, its body miles long.',
    icon: '🐍', canSummon: true, summonDifficulty: 11, sanctuaryAffinity: ['thunder_spire', 'mist_archipelago'],
  },
  {
    id: 'crystal_bird', name: 'Crystal Bird', rarity: 'epic', windType: 'dawn_wind', speed: 58, wisdom: 64,
    description: 'A bird made entirely of wind crystals that refract light into breathtaking patterns.',
    icon: '💎', canSummon: true, summonDifficulty: 11, sanctuaryAffinity: ['dawn_pavilion', 'sunset_shrine'],
  },
  // Legendary (7)
  {
    id: 'zephyr_deity', name: 'Zephyr Deity', rarity: 'legendary', windType: 'zephyr', speed: 100, wisdom: 120,
    description: 'The supreme deity of all western winds, whose breath creates new worlds.',
    icon: '✨', canSummon: false, summonDifficulty: 0, sanctuaryAffinity: ['zenith_sanctuary'],
  },
  {
    id: 'primordial_storm', name: 'Primordial Storm', rarity: 'legendary', windType: 'cyclone', speed: 90, wisdom: 110,
    description: 'The first storm ever born, a being of pure chaos and creation.',
    icon: '⛈️', canSummon: false, summonDifficulty: 0, sanctuaryAffinity: ['thunder_spire', 'zenith_sanctuary'],
  },
  {
    id: 'sky_whale', name: 'Sky Whale', rarity: 'legendary', windType: 'gale', speed: 45, wisdom: 130,
    description: 'An impossibly large whale that swims through the atmosphere, singing songs that reshape weather.',
    icon: '🐋', canSummon: true, summonDifficulty: 15, sanctuaryAffinity: ['zenith_sanctuary'],
  },
  {
    id: 'dawn_dragon', name: 'Dawn Dragon', rarity: 'legendary', windType: 'dawn_wind', speed: 80, wisdom: 115,
    description: 'The dragon that carries the sun across the sky each morning on golden wings.',
    icon: '🐲', canSummon: false, summonDifficulty: 0, sanctuaryAffinity: ['dawn_pavilion', 'zenith_sanctuary'],
  },
  {
    id: 'twilight_queen', name: 'Twilight Queen', rarity: 'legendary', windType: 'dusk_wind', speed: 75, wisdom: 125,
    description: 'The queen of all twilight winds, who rules the boundary between day and night.',
    icon: '👸', canSummon: false, summonDifficulty: 0, sanctuaryAffinity: ['sunset_shrine', 'zenith_sanctuary'],
  },
  {
    id: 'world_wind', name: 'World Wind', rarity: 'legendary', windType: 'cyclone', speed: 120, wisdom: 140,
    description: 'The wind that circles the entire world, carrying all knowledge and all memories.',
    icon: '🌍', canSummon: false, summonDifficulty: 0, sanctuaryAffinity: ['zenith_sanctuary'],
  },
  {
    id: 'feather_emperor', name: 'Feather Emperor', rarity: 'legendary', windType: 'zephyr', speed: 65, wisdom: 135,
    description: 'The emperor of all sky feathers, whose plumage contains the wisdom of ages.',
    icon: '🪶', canSummon: true, summonDifficulty: 15, sanctuaryAffinity: ['zenith_sanctuary'],
  },
] as const;

// =============================================================================
// SECTION 5: SKY FEATHERS / ARTIFACTS (30)
// =============================================================================

export const ZH_FEATHERS: readonly ZHFeatherDef[] = [
  // Common (6)
  { id: 'cotton_feather', name: 'Cotton Feather', rarity: 'common', windPower: 2, wisdomBoost: 1, description: 'A soft feather from a common cloud bird, barely heavier than air.', icon: '🪶', requiredSanctuary: null },
  { id: 'dandelion_seed', name: 'Dandelion Seed', rarity: 'common', windPower: 1, wisdomBoost: 2, description: 'A perfect dandelion seed that glides on the slightest breeze.', icon: '🌼', requiredSanctuary: null },
  { id: 'breeze_charm', name: 'Breeze Charm', rarity: 'common', windPower: 3, wisdomBoost: 1, description: 'A simple charm carved from cloud wood that attracts gentle breezes.', icon: '🎐', requiredSanctuary: null },
  { id: 'sky_petal', name: 'Sky Petal', rarity: 'common', windPower: 2, wisdomBoost: 2, description: 'A petal from a flower that grows only in the Cloud Garden.', icon: '🌸', requiredSanctuary: 'cloud_garden' },
  { id: 'mist_droplet', name: 'Mist Droplet', rarity: 'common', windPower: 1, wisdomBoost: 3, description: 'A crystallized droplet of mist that hums with tiny wind energy.', icon: '💧', requiredSanctuary: 'cloud_garden' },
  { id: 'wind_blade_grass', name: 'Wind Blade Grass', rarity: 'common', windPower: 3, wisdomBoost: 2, description: 'A blade of grass that sharpens itself in the wind, humming with energy.', icon: '🌿', requiredSanctuary: 'cloud_garden' },
  // Unusual (6)
  { id: 'temple_wind_bell', name: 'Temple Wind Bell', rarity: 'unusual', windPower: 6, wisdomBoost: 4, description: 'A bell from the Wind Temple that chimes with ancient wisdom.', icon: '🔔', requiredSanctuary: 'wind_temple' },
  { id: 'gale_fang', name: 'Gale Fang', rarity: 'unusual', windPower: 8, wisdomBoost: 3, description: 'A fang from a Gale Hawk, containing the essence of fierce winds.', icon: '🦷', requiredSanctuary: 'wind_temple' },
  { id: 'owl_quill', name: 'Owl Quill', rarity: 'unusual', windPower: 4, wisdomBoost: 8, description: 'A quill from a Drift Owl that writes wisdom on air itself.', icon: '🪶', requiredSanctuary: 'wind_temple' },
  { id: 'cloud_crystal', name: 'Cloud Crystal', rarity: 'unusual', windPower: 7, wisdomBoost: 5, description: 'A crystal that formed naturally inside a thunderhead cloud.', icon: '💎', requiredSanctuary: 'wind_temple' },
  { id: 'whisper_shell', name: 'Whisper Shell', rarity: 'unusual', windPower: 3, wisdomBoost: 10, description: 'A shell that when held to the ear, carries the whispers of wind spirits.', icon: '🐚', requiredSanctuary: 'cloud_garden' },
  { id: 'sky_kite_fragment', name: 'Sky Kite Fragment', rarity: 'unusual', windPower: 9, wisdomBoost: 4, description: 'A fragment of an ancient kite that once flew to the edge of the sky.', icon: '🪁', requiredSanctuary: 'wind_temple' },
  // Rare (6)
  { id: 'storm_feather', name: 'Storm Feather', rarity: 'rare', windPower: 14, wisdomBoost: 10, description: 'A feather charged with static electricity from a thousand storms.', icon: '⚡', requiredSanctuary: 'storm_nest' },
  { id: 'dawn_crest', name: 'Dawn Crest', rarity: 'rare', windPower: 12, wisdomBoost: 14, description: 'The crest of a Dawn Phoenix, glowing with the light of first sunrise.', icon: '🔥', requiredSanctuary: 'dawn_pavilion' },
  { id: 'mist_crown_shard', name: 'Mist Crown Shard', rarity: 'rare', windPower: 10, wisdomBoost: 16, description: 'A shard from the Mist Sovereign\'s crown, perpetually shrouded in fog.', icon: '👑', requiredSanctuary: 'mist_archipelago' },
  { id: 'thermal_core', name: 'Thermal Core', rarity: 'rare', windPower: 16, wisdomBoost: 12, description: 'The core of a thermal updraft, solidified into a warm crystalline orb.', icon: '🔮', requiredSanctuary: 'storm_nest' },
  { id: 'rainbow_thread', name: 'Rainbow Thread', rarity: 'rare', windPower: 8, wisdomBoost: 20, description: 'A single thread from a rainbow, containing all colors of wind wisdom.', icon: '🌈', requiredSanctuary: 'dawn_pavilion' },
  { id: 'cloud_silk', name: 'Cloud Silk', rarity: 'rare', windPower: 11, wisdomBoost: 15, description: 'Silk woven by cloud spiders, lighter than air and stronger than steel.', icon: '🧵', requiredSanctuary: 'mist_archipelago' },
  // Epic (6)
  { id: 'thunder_quill', name: 'Thunder Quill', rarity: 'epic', windPower: 22, wisdomBoost: 18, description: 'A quill made from the Thunder Spire Spirit\'s own lightning bolt feather.', icon: '⚡', requiredSanctuary: 'thunder_spire' },
  { id: 'cyclone_gem', name: 'Cyclone Gem', rarity: 'epic', windPower: 28, wisdomBoost: 20, description: 'A gem that swirls internally like a miniature cyclone of pure energy.', icon: '💠', requiredSanctuary: 'storm_nest' },
  { id: 'dusk_mirror', name: 'Dusk Mirror', rarity: 'epic', windPower: 18, wisdomBoost: 28, description: 'A mirror that reflects the sunset sky, showing truths hidden in twilight.', icon: '🪞', requiredSanctuary: 'sunset_shrine' },
  { id: 'crystal_wing_fragment', name: 'Crystal Wing Fragment', rarity: 'epic', windPower: 24, wisdomBoost: 22, description: 'A fragment of the Crystal Bird\'s wing, refracting wind into visible light.', icon: '💎', requiredSanctuary: 'dawn_pavilion' },
  { id: 'void_pearl', name: 'Void Pearl', rarity: 'epic', windPower: 20, wisdomBoost: 30, description: 'A pearl from the void between clouds, containing infinite stillness.', icon: '⚫', requiredSanctuary: 'sunset_shrine' },
  { id: 'serpent_scale', name: 'Serpent Scale', rarity: 'epic', windPower: 26, wisdomBoost: 24, description: 'A scale from the Great Wind Serpent, humming with jet stream power.', icon: '🐍', requiredSanctuary: 'thunder_spire' },
  // Legendary (6)
  { id: 'zephyr_crown', name: 'Zephyr Crown', rarity: 'legendary', windPower: 40, wisdomBoost: 45, description: 'The crown of the Zephyr Deity, granting mastery over all gentle winds.', icon: '👑', requiredSanctuary: 'zenith_sanctuary' },
  { id: 'world_wind_sash', name: 'World Wind Sash', rarity: 'legendary', windPower: 45, wisdomBoost: 40, description: 'A sash woven from the World Wind itself, wrapping its wearer in global currents.', icon: '🎗️', requiredSanctuary: 'zenith_sanctuary' },
  { id: 'dawn_dragon_plume', name: 'Dawn Dragon Plume', rarity: 'legendary', windPower: 42, wisdomBoost: 42, description: 'A plume from the Dawn Dragon, radiating golden light and infinite warmth.', icon: '🐲', requiredSanctuary: 'zenith_sanctuary' },
  { id: 'sky_whale_song_orb', name: 'Sky Whale Song Orb', rarity: 'legendary', windPower: 35, wisdomBoost: 55, description: 'An orb containing the song of the Sky Whale, granting deep wisdom.', icon: '🎵', requiredSanctuary: 'zenith_sanctuary' },
  { id: 'twilight_queens_veil', name: 'Twilight Queen\'s Veil', rarity: 'legendary', windPower: 38, wisdomBoost: 50, description: 'The veil of the Twilight Queen, blurring the line between reality and dream.', icon: '🎭', requiredSanctuary: 'zenith_sanctuary' },
  { id: 'feather_emperor_plume', name: 'Feather Emperor Plume', rarity: 'legendary', windPower: 48, wisdomBoost: 48, description: 'The ultimate feather from the Feather Emperor, containing all sky wisdom.', icon: '🪶', requiredSanctuary: 'zenith_sanctuary' },
] as const;

// =============================================================================
// SECTION 6: HAVEN STRUCTURES (25, upgradeable to Lv10)
// =============================================================================

export const ZH_STRUCTURES: readonly ZHStructureDef[] = [
  { id: 'wind_shrine', name: 'Wind Shrine', description: 'A humble shrine where travelers can rest and listen to the wind.', icon: '⛩️', maxLevel: 10, baseCost: 0, costPerLevel: 10, wisdomPerDay: 2, reputationPerDay: 1, tier: 1 },
  { id: 'cloud_nest', name: 'Cloud Nest', description: 'A cozy nest built from soft clouds for recovering after long flights.', icon: '🪺', maxLevel: 10, baseCost: 50, costPerLevel: 15, wisdomPerDay: 3, reputationPerDay: 1, tier: 1 },
  { id: 'feather_repository', name: 'Feather Repository', description: 'A storage vault for collected sky feathers and wind artifacts.', icon: '🏛️', maxLevel: 10, baseCost: 80, costPerLevel: 18, wisdomPerDay: 5, reputationPerDay: 2, tier: 1 },
  { id: 'wind_channel_circle', name: 'Wind Channel Circle', description: 'A circle inscribed in cloud stone for focused wind channeling.', icon: '⭕', maxLevel: 10, baseCost: 100, costPerLevel: 20, wisdomPerDay: 4, reputationPerDay: 2, tier: 1 },
  { id: 'sky_herb_garden', name: 'Sky Herb Garden', description: 'A garden of rare herbs that grow only in high-altitude winds.', icon: '🌿', maxLevel: 10, baseCost: 60, costPerLevel: 12, wisdomPerDay: 3, reputationPerDay: 1, tier: 1 },
  { id: 'breeze_tea_house', name: 'Breeze Tea House', description: 'A tea house where sacred wind teas restore wisdom and calm the spirit.', icon: '🍵', maxLevel: 10, baseCost: 120, costPerLevel: 22, wisdomPerDay: 6, reputationPerDay: 3, tier: 2 },
  { id: 'wisdom_library', name: 'Wisdom Library', description: 'A library of ancient wind scrolls and sky-wisdom manuscripts.', icon: '📚', maxLevel: 10, baseCost: 150, costPerLevel: 25, wisdomPerDay: 5, reputationPerDay: 4, tier: 2 },
  { id: 'wind_chime_tower', name: 'Wind Chime Tower', description: 'A tower hung with thousands of wind chimes that purify the air.', icon: '🗼', maxLevel: 10, baseCost: 180, costPerLevel: 28, wisdomPerDay: 7, reputationPerDay: 3, tier: 2 },
  { id: 'cloud_forge', name: 'Cloud Forge', description: 'A forge that shapes weapons and tools from solidified cloud and wind.', icon: '⚒️', maxLevel: 10, baseCost: 130, costPerLevel: 24, wisdomPerDay: 6, reputationPerDay: 3, tier: 2 },
  { id: 'hot_wind_spring', name: 'Hot Wind Spring', description: 'A spring heated by underground thermal vents and cooled by mountain breezes.', icon: '♨️', maxLevel: 10, baseCost: 200, costPerLevel: 30, wisdomPerDay: 8, reputationPerDay: 4, tier: 2 },
  { id: 'storm_training_ground', name: 'Storm Training Ground', description: 'A training arena where warriors practice fighting in simulated storms.', icon: '🏟️', maxLevel: 10, baseCost: 300, costPerLevel: 40, wisdomPerDay: 10, reputationPerDay: 5, tier: 3 },
  { id: 'spirit_gate', name: 'Spirit Gate', description: 'A gate that attracts benevolent wind spirits and eases summoning.', icon: '⛩️', maxLevel: 10, baseCost: 350, costPerLevel: 45, wisdomPerDay: 12, reputationPerDay: 6, tier: 3 },
  { id: 'sky_observatory', name: 'Sky Observatory', description: 'An observatory for studying wind patterns and predicting storms.', icon: '🔭', maxLevel: 10, baseCost: 400, costPerLevel: 50, wisdomPerDay: 14, reputationPerDay: 7, tier: 3 },
  { id: 'zenith_garden', name: 'Zenith Garden', description: 'A garden at the highest point, where the most exotic sky plants grow.', icon: '🌺', maxLevel: 10, baseCost: 280, costPerLevel: 38, wisdomPerDay: 9, reputationPerDay: 5, tier: 3 },
  { id: 'mythical_bird_perch', name: 'Mythical Bird Perch', description: 'A towering perch that attracts mythical birds who grant blessings.', icon: '🦅', maxLevel: 10, baseCost: 450, costPerLevel: 55, wisdomPerDay: 15, reputationPerDay: 8, tier: 3 },
  { id: 'cloud_bridge_workshop', name: 'Cloud Bridge Workshop', description: 'A workshop for crafting bridges between sanctuaries from mist and wind.', icon: '🌉', maxLevel: 10, baseCost: 500, costPerLevel: 60, wisdomPerDay: 16, reputationPerDay: 9, tier: 4 },
  { id: 'thunder_smithy', name: 'Thunder Smithy', description: 'A smithy powered by captured lightning for forging powerful wind relics.', icon: '🔨', maxLevel: 10, baseCost: 550, costPerLevel: 65, wisdomPerDay: 18, reputationPerDay: 10, tier: 4 },
  { id: 'dawn_cathedral', name: 'Dawn Cathedral', description: 'A cathedral of stained glass and wind that amplifies dawn wisdom.', icon: '⛪', maxLevel: 10, baseCost: 600, costPerLevel: 70, wisdomPerDay: 20, reputationPerDay: 10, tier: 4 },
  { id: 'ancestor_memorial', name: 'Ancestor Memorial', description: 'A memorial where the spirits of past wind riders gather to share wisdom.', icon: '🕯️', maxLevel: 10, baseCost: 650, costPerLevel: 75, wisdomPerDay: 22, reputationPerDay: 11, tier: 4 },
  { id: 'sky_harbor', name: 'Sky Harbor', description: 'A harbor for mythical bird mounts and wind-powered skyships.', icon: '⚓', maxLevel: 10, baseCost: 700, costPerLevel: 80, wisdomPerDay: 24, reputationPerDay: 12, tier: 4 },
  { id: 'feather_sanctum', name: 'Feather Sanctum', description: 'A sanctum where the rarest feathers are preserved and studied.', icon: '🪶', maxLevel: 10, baseCost: 800, costPerLevel: 90, wisdomPerDay: 26, reputationPerDay: 14, tier: 5 },
  { id: 'zenith_temple', name: 'Zenith Temple', description: 'The grand temple at the highest sanctuary, seat of all sky wisdom.', icon: '⛩️', maxLevel: 10, baseCost: 1000, costPerLevel: 100, wisdomPerDay: 30, reputationPerDay: 16, tier: 5 },
  { id: 'wisdom_reservoir', name: 'Wisdom Reservoir', description: 'A vast reservoir that stores wind wisdom for times of great need.', icon: '💧', maxLevel: 10, baseCost: 900, costPerLevel: 95, wisdomPerDay: 28, reputationPerDay: 15, tier: 5 },
  { id: 'storm_taming_arena', name: 'Storm Taming Arena', description: 'The ultimate arena where only the bravest dare to tame living storms.', icon: '⛈️', maxLevel: 10, baseCost: 1200, costPerLevel: 120, wisdomPerDay: 35, reputationPerDay: 18, tier: 5 },
  { id: 'zephyr_throne', name: 'Zephyr Throne', description: 'The ancient throne of the wind deities, granting dominion over all skies.', icon: '👑', maxLevel: 10, baseCost: 1500, costPerLevel: 150, wisdomPerDay: 40, reputationPerDay: 20, tier: 5 },
] as const;

// =============================================================================
// SECTION 7: WIND ABILITIES (22)
// =============================================================================

export const ZH_ABILITIES: readonly ZHAbilityDef[] = [
  { id: 'wind_bolt', name: 'Wind Bolt', description: 'Fire a concentrated bolt of wind energy at a target.', icon: '💨', cooldown: 3, power: 12, wisdomCost: 5, unlockCost: 0, windType: 'breeze', isPassive: false },
  { id: 'cloud_shield', name: 'Cloud Shield', description: 'Condense cloud moisture into a protective shield around yourself.', icon: '☁️', cooldown: 8, power: 15, wisdomCost: 8, unlockCost: 0, windType: 'zephyr', isPassive: false },
  { id: 'gale_dash', name: 'Gale Dash', description: 'Dash forward on a gale of wind, moving at incredible speed.', icon: '💨', cooldown: 6, power: 10, wisdomCost: 6, unlockCost: 30, windType: 'gale', isPassive: false },
  { id: 'healing_breeze', name: 'Healing Breeze', description: 'Summon a warm breeze that slowly restores health and clears ailments.', icon: '🌬️', cooldown: 15, power: 25, wisdomCost: 15, unlockCost: 50, windType: 'breeze', isPassive: false },
  { id: 'eagle_sight', name: 'Eagle Sight', description: 'Gain the vision of a wind eagle, seeing far and revealing hidden things.', icon: '🦅', cooldown: 20, power: 8, wisdomCost: 10, unlockCost: 40, windType: 'gale', isPassive: false },
  { id: 'wind_wall', name: 'Wind Wall', description: 'Create a wall of compressed wind that blocks projectiles and enemies.', icon: '🧱', cooldown: 10, power: 18, wisdomCost: 10, unlockCost: 60, windType: 'gale', isPassive: false },
  { id: 'mist_cloak', name: 'Mist Cloak', description: 'Wrap yourself in a cloak of mist, becoming invisible for a short time.', icon: '🌫️', cooldown: 12, power: 5, wisdomCost: 12, unlockCost: 80, windType: 'zephyr', isPassive: false },
  { id: 'thunder_strike', name: 'Thunder Strike', description: 'Call down a bolt of lightning from the storm clouds above.', icon: '⚡', cooldown: 8, power: 30, wisdomCost: 18, unlockCost: 100, windType: 'storm', isPassive: false },
  { id: 'wind_meditation', name: 'Wind Meditation', description: 'Enter deep meditation, listening to the wind for guidance and wisdom.', icon: '🧘', cooldown: 30, power: 20, wisdomCost: 0, unlockCost: 0, windType: 'zephyr', isPassive: false },
  { id: 'cyclone_punch', name: 'Cyclone Punch', description: 'Empower your fist with a miniature cyclone for devastating blows.', icon: '✊', cooldown: 5, power: 22, wisdomCost: 12, unlockCost: 120, windType: 'cyclone', isPassive: false },
  { id: 'cloud_surf', name: 'Cloud Surf', description: 'Surf across cloud surfaces at high speed, ignoring terrain.', icon: '🏄', cooldown: 20, power: 15, wisdomCost: 20, unlockCost: 150, windType: 'zephyr', isPassive: false },
  { id: 'frost_gale', name: 'Frost Gale', description: 'Exhale a freezing gale that slows and damages enemies.', icon: '❄️', cooldown: 10, power: 28, wisdomCost: 16, unlockCost: 180, windType: 'storm', isPassive: false },
  { id: 'spirit_shout', name: 'Spirit Shout', description: 'Unleash a shout infused with wind spirit energy that stuns.', icon: '🗣️', cooldown: 15, power: 35, wisdomCost: 22, unlockCost: 200, windType: 'cyclone', isPassive: false },
  { id: 'storm_call', name: 'Storm Call', description: 'Summon a localized storm around yourself, buffing allies and harming foes.', icon: '⛈️', cooldown: 25, power: 40, wisdomCost: 30, unlockCost: 250, windType: 'storm', isPassive: false },
  { id: 'wind_stance', name: 'Wind Stance', description: 'Take a stance that makes you immune to being knocked back by wind.', icon: '🧍', cooldown: 18, power: 12, wisdomCost: 14, unlockCost: 130, windType: 'gale', isPassive: false },
  { id: 'zephyr_barrier', name: 'Zephyr Barrier', description: 'Create a rotating barrier of zephyr wind that deflects all projectiles.', icon: '🌀', cooldown: 14, power: 20, wisdomCost: 18, unlockCost: 160, windType: 'zephyr', isPassive: false },
  { id: 'lightning_step', name: 'Lightning Step', description: 'Teleport short distances in a flash of lightning.', icon: '⚡', cooldown: 6, power: 16, wisdomCost: 10, unlockCost: 110, windType: 'storm', isPassive: false },
  { id: 'dawn_heal', name: 'Dawn Heal', description: 'Channel the healing light of dawn to restore all allies.', icon: '🌅', cooldown: 22, power: 30, wisdomCost: 25, unlockCost: 220, windType: 'dawn_wind', isPassive: false },
  { id: 'wind_body', name: 'Wind Body', description: 'Passively increase speed by partially transforming your body into wind.', icon: '💨', cooldown: 0, power: 10, wisdomCost: 0, unlockCost: 300, windType: 'gale', isPassive: true },
  { id: 'sky_perception', name: 'Sky Perception', description: 'Passively sense wind currents and the presence of nearby spirits.', icon: '👁️', cooldown: 0, power: 8, wisdomCost: 0, unlockCost: 280, windType: 'zephyr', isPassive: true },
  { id: 'storm_flight', name: 'Storm Flight', description: 'Temporarily gain the ability to fly through the fiercest storms.', icon: '🦅', cooldown: 40, power: 25, wisdomCost: 35, unlockCost: 350, windType: 'cyclone', isPassive: false },
  { id: 'zephyr_zenith', name: 'Zephyr Zenith', description: 'Release a pulse of pure zenith energy that empowers all allies dramatically.', icon: '✨', cooldown: 60, power: 50, wisdomCost: 50, unlockCost: 500, windType: 'zephyr', isPassive: false },
] as const;

// =============================================================================
// SECTION 8: ACHIEVEMENTS (18)
// =============================================================================

export const ZH_ACHIEVEMENTS: readonly ZHAchievementDef[] = [
  { id: 'first_flight', name: 'First Flight', description: 'Take your first step into the Cloud Garden.', conditionKey: 'sanctuaries_visited', targetValue: 1, wisdomReward: 20, featherReward: 1, icon: '👣' },
  { id: 'wind_explorer', name: 'Wind Explorer', description: 'Discover the Wind Temple for the first time.', conditionKey: 'sanctuaries_visited', targetValue: 2, wisdomReward: 40, featherReward: 2, icon: '🌬️' },
  { id: 'sky_cartographer', name: 'Sky Cartographer', description: 'Visit all 8 sky sanctuaries.', conditionKey: 'sanctuaries_visited', targetValue: 8, wisdomReward: 300, featherReward: 10, icon: '🗺️' },
  { id: 'first_summon', name: 'First Summon', description: 'Summon your first wind spirit.', conditionKey: 'spirits_summoned', targetValue: 1, wisdomReward: 30, featherReward: 2, icon: '🦊' },
  { id: 'spirit_herd', name: 'Spirit Herd', description: 'Summon 10 wind spirits.', conditionKey: 'spirits_summoned', targetValue: 10, wisdomReward: 200, featherReward: 8, icon: '🐾' },
  { id: 'spirit_master', name: 'Spirit Master', description: 'Summon 20 wind spirits.', conditionKey: 'spirits_summoned', targetValue: 20, wisdomReward: 500, featherReward: 15, icon: '👑' },
  { id: 'haven_builder', name: 'Haven Builder', description: 'Build your first haven structure.', conditionKey: 'structures_built', targetValue: 1, wisdomReward: 25, featherReward: 2, icon: '🏗️' },
  { id: 'grand_architect', name: 'Grand Architect', description: 'Build 10 haven structures.', conditionKey: 'structures_built', targetValue: 10, wisdomReward: 300, featherReward: 10, icon: '🏛️' },
  { id: 'max_enhancement', name: 'Max Enhancement', description: 'Upgrade any structure to maximum level 10.', conditionKey: 'max_structure_level', targetValue: 1, wisdomReward: 400, featherReward: 12, icon: '⬆️' },
  { id: 'wisdom_seeker', name: 'Wisdom Seeker', description: 'Accumulate 1,000 total wisdom.', conditionKey: 'total_wisdom_gained', targetValue: 1000, wisdomReward: 100, featherReward: 3, icon: '💫' },
  { id: 'wisdom_sage', name: 'Wisdom Sage', description: 'Accumulate 50,000 total wisdom.', conditionKey: 'total_wisdom_gained', targetValue: 50000, wisdomReward: 500, featherReward: 15, icon: '✨' },
  { id: 'deep_channel', name: 'Deep Channel', description: 'Reach wind channel depth of 50 or deeper.', conditionKey: 'max_wind_channel', targetValue: 50, wisdomReward: 250, featherReward: 8, icon: '🧘' },
  { id: 'zenith_channeler', name: 'Zenith Channeler', description: 'Reach wind channel depth of 100 (maximum).', conditionKey: 'max_wind_channel', targetValue: 100, wisdomReward: 600, featherReward: 20, icon: '✨' },
  { id: 'storm_tamer', name: 'Storm Tamer', description: 'Complete 10 storm taming sessions.', conditionKey: 'storm_taming_sessions', targetValue: 10, wisdomReward: 150, featherReward: 5, icon: '⛈️' },
  { id: 'storm_master', name: 'Storm Master', description: 'Reach storm taming level 50.', conditionKey: 'storm_taming_level', targetValue: 50, wisdomReward: 800, featherReward: 20, icon: '🏆' },
  { id: 'high_flyer', name: 'High Flyer', description: 'Reach altitude 7,000 meters.', conditionKey: 'altitude_reached', targetValue: 7000, wisdomReward: 200, featherReward: 8, icon: '🏔️' },
  { id: 'zenith_conqueror', name: 'Zenith Conqueror', description: 'Reach the Zenith Sanctuary (12,000m).', conditionKey: 'altitude_reached', targetValue: 12000, wisdomReward: 1000, featherReward: 25, icon: '⛰️' },
  { id: 'zephyr_deity_title', name: 'Zephyr Deity', description: 'Achieve the title of Zephyr Deity.', conditionKey: 'title_index', targetValue: 7, wisdomReward: 1500, featherReward: 30, icon: '🌟' },
] as const;

// =============================================================================
// SECTION 9: TITLES (8: Breeze Listener → Zephyr Deity)
// =============================================================================

export const ZH_TITLES: readonly ZHTitleDef[] = [
  { id: 'breeze_listener', name: 'Breeze Listener', requiredReputation: 0, description: 'One who has learned to hear the whisper of the gentlest breeze.', icon: '🌬️', color: ZH_THEME_COLORS.windWhite, bonusMultiplier: 1.0 },
  { id: 'cloud_walker', name: 'Cloud Walker', requiredReputation: 100, description: 'One who walks upon clouds as naturally as upon solid ground.', icon: '☁️', color: ZH_THEME_COLORS.cloudSilver, bonusMultiplier: 1.1 },
  { id: 'wind_channeler', name: 'Wind Channeler', requiredReputation: 300, description: 'One who can channel the raw power of wind through their body.', icon: '💨', color: ZH_THEME_COLORS.skyBlue, bonusMultiplier: 1.2 },
  { id: 'storm_rider', name: 'Storm Rider', requiredReputation: 700, description: 'One who rides the fiercest storms without fear or hesitation.', icon: '⛈️', color: ZH_THEME_COLORS.stormGray, bonusMultiplier: 1.35 },
  { id: 'dawn_herald', name: 'Dawn Herald', requiredReputation: 1500, description: 'One who announces the dawn and carries the first light across the sky.', icon: '🌅', color: ZH_THEME_COLORS.goldenDawn, bonusMultiplier: 1.5 },
  { id: 'sky_guardian', name: 'Sky Guardian', requiredReputation: 3000, description: 'One chosen by the wind spirits to guard the upper sanctuaries.', icon: '🦅', color: ZH_THEME_COLORS.mistAqua, bonusMultiplier: 1.75 },
  { id: 'sanctuary_lord', name: 'Sanctuary Lord', requiredReputation: 6000, description: 'One who rules over all sky sanctuaries from the Zenith.', icon: '🏞️', color: ZH_THEME_COLORS.sunsetPink, bonusMultiplier: 2.0 },
  { id: 'zephyr_deity', name: 'Zephyr Deity', requiredReputation: 10000, description: 'The supreme wind deity who commands all winds across all skies.', icon: '🌟', color: ZH_THEME_COLORS.featherGold, bonusMultiplier: 2.5 },
] as const;

// =============================================================================
// SECTION 10: SKY EVENTS (8)
// =============================================================================

export const ZH_SKY_EVENTS: readonly ZHSkyEventDef[] = [
  {
    id: 'golden_dawn', name: 'Golden Dawn',
    description: 'The dawn lasts twice as long, filling the sky with golden wisdom light.',
    durationHours: 24, wisdomMultiplier: 2.0, reputationMultiplier: 1.5, summonBonus: 1.5, channelBonus: 1.3,
    icon: '🌅', color: ZH_GOLDEN_DAWN,
  },
  {
    id: 'cyclone_festival', name: 'Cyclone Festival',
    description: 'Cyclones from across the world converge, bringing rare wind spirits.',
    durationHours: 12, wisdomMultiplier: 1.5, reputationMultiplier: 2.0, summonBonus: 2.0, channelBonus: 1.5,
    icon: '🌀', color: ZH_SKY_BLUE,
  },
  {
    id: 'whisper_tide', name: 'Whisper Tide',
    description: 'A tide of whispered wisdom flows through all sanctuaries.',
    durationHours: 8, wisdomMultiplier: 1.3, reputationMultiplier: 1.8, summonBonus: 1.0, channelBonus: 2.0,
    icon: '🌬️', color: ZH_WIND_WHITE,
  },
  {
    id: 'storm_summit', name: 'Storm Summit',
    description: 'All storms converge at the Zenith, making storm taming extremely rewarding.',
    durationHours: 16, wisdomMultiplier: 1.8, reputationMultiplier: 1.5, summonBonus: 1.2, channelBonus: 1.0,
    icon: '⛈️', color: ZH_STORM_GRAY,
  },
  {
    id: 'eagle_migration', name: 'Eagle Migration',
    description: 'Mythical eagles migrate through the sanctuary skies, carrying rare feathers.',
    durationHours: 10, wisdomMultiplier: 1.5, reputationMultiplier: 2.0, summonBonus: 1.3, channelBonus: 1.2,
    icon: '🦅', color: ZH_MIST_AQUA,
  },
  {
    id: 'feather_rain', name: 'Feather Rain',
    description: 'A rain of enchanted feathers falls from the sky, boosting all feather collection.',
    durationHours: 6, wisdomMultiplier: 2.5, reputationMultiplier: 1.0, summonBonus: 1.0, channelBonus: 1.5,
    icon: '🪶', color: ZH_FEATHER_GOLD,
  },
  {
    id: 'dusk_aurora', name: 'Dusk Aurora',
    description: 'The sky fills with aurora at dusk, revealing hidden sanctuaries and secrets.',
    durationHours: 14, wisdomMultiplier: 1.2, reputationMultiplier: 1.5, summonBonus: 1.8, channelBonus: 2.5,
    icon: '🌈', color: ZH_SUNSET_PINK,
  },
  {
    id: 'sanctuary_awakening', name: 'Sanctuary Awakening',
    description: 'All sanctuaries awaken simultaneously, doubling all reputation gains.',
    durationHours: 20, wisdomMultiplier: 1.3, reputationMultiplier: 3.0, summonBonus: 1.2, channelBonus: 1.8,
    icon: '✨', color: ZH_DUSK_ROSE,
  },
] as const;

// =============================================================================
// SECTION 11: WIND TYPE DESCRIPTIONS
// =============================================================================

export const ZH_WIND_TYPE_DEFS: readonly { type: ZHWindType; label: string; icon: string; color: string; description: string }[] = [
  { type: 'breeze', label: 'Breeze', icon: '🌬️', color: ZH_THEME_COLORS.windWhite, description: 'A gentle, constant wind that carries whispers and petals across the sky.' },
  { type: 'gale', label: 'Gale', icon: '💨', color: ZH_THEME_COLORS.skyBlue, description: 'A powerful, sustained wind that can push clouds and shape weather patterns.' },
  { type: 'storm', label: 'Storm', icon: '⛈️', color: ZH_THEME_COLORS.stormGray, description: 'A violent, electrically charged wind that brings thunder and lightning.' },
  { type: 'zephyr', label: 'Zephyr', icon: '🍃', color: ZH_THEME_COLORS.mistAqua, description: 'A light, pleasant western wind associated with spring and new beginnings.' },
  { type: 'cyclone', label: 'Cyclone', icon: '🌀', color: ZH_THEME_COLORS.cycloneEmerald, description: 'A massive rotating wind system of immense destructive and creative power.' },
  { type: 'dawn_wind', label: 'Dawn Wind', icon: '🌅', color: ZH_THEME_COLORS.goldenDawn, description: 'The sacred wind that blows at the first light of dawn, carrying renewal.' },
  { type: 'dusk_wind', label: 'Dusk Wind', icon: '🌇', color: ZH_THEME_COLORS.sunsetPink, description: 'A melancholic wind that blows at dusk, carrying memories and fading light.' },
  { type: 'void_wind', label: 'Void Wind', icon: '🌑', color: ZH_THEME_COLORS.deepCloud, description: 'A mysterious wind from the void between worlds, carrying silence and secrets.' },
] as const;

// =============================================================================
// SECTION 12: SANCTUARY HIDDEN TEMPLES
// =============================================================================

export const ZH_HIDDEN_TEMPLES = [
  { id: 'whisper_chamber', name: 'Whisper Chamber', sanctuaryId: 'wind_temple' as ZHSanctuaryId, description: 'A hidden chamber within the Wind Temple where all whispers of the world converge.', icon: '📯' },
  { id: 'thunder_forge_inner', name: 'Inner Thunder Forge', sanctuaryId: 'storm_nest' as ZHSanctuaryId, description: 'The deepest forge within the Storm Nest where lightning is shaped into artifacts.', icon: '⚒️' },
  { id: 'dawn_cradle', name: 'Dawn Cradle', sanctuaryId: 'dawn_pavilion' as ZHSanctuaryId, description: 'A hidden cradle where the first light of each day is born and nurtured.', icon: '🌅' },
  { id: 'mist_heart', name: 'Heart of Mist', sanctuaryId: 'mist_archipelago' as ZHSanctuaryId, description: 'The center of all mist in the world, where the Mist Sovereign dwells in peace.', icon: '🌫️' },
  { id: 'lightning_seed_vault', name: 'Lightning Seed Vault', sanctuaryId: 'thunder_spire' as ZHSanctuaryId, description: 'A vault containing seeds of pure lightning that can grow into new thunder spires.', icon: '⚡' },
  { id: 'dusk_melody_hall', name: 'Dusk Melody Hall', sanctuaryId: 'sunset_shrine' as ZHSanctuaryId, description: 'A hall where the last songs of each day are preserved in crystallized wind.', icon: '🎵' },
  { id: 'zenith_silence_chamber', name: 'Zenith Silence Chamber', sanctuaryId: 'zenith_sanctuary' as ZHSanctuaryId, description: 'A chamber of absolute silence where the wisdom of the universe can be heard.', icon: '🤫' },
] as const;

// =============================================================================
// SECTION 13: MYTHICAL BIRD MOUNTS
// =============================================================================

export const ZH_BIRD_MOUNTS = [
  { id: 'cloud_finch', name: 'Cloud Finch', speed: 25, endurance: 30, altitude: 2000, description: 'A small finch that rides thermal currents with effortless grace.', icon: '🐦', sanctuaryRequired: 'cloud_garden' as ZHSanctuaryId },
  { id: 'wind_falcon', name: 'Wind Falcon', speed: 50, endurance: 45, altitude: 4500, description: 'A falcon that dives through wind currents at breathtaking speed.', icon: '🦅', sanctuaryRequired: 'wind_temple' as ZHSanctuaryId },
  { id: 'storm_eagle', name: 'Storm Eagle', speed: 70, endurance: 60, altitude: 6000, description: 'A massive eagle that thrives in the heart of thunderstorms.', icon: '🦅', sanctuaryRequired: 'storm_nest' as ZHSanctuaryId },
  { id: 'dawn_crane', name: 'Dawn Crane', speed: 40, endurance: 80, altitude: 7500, description: 'A graceful crane that flies at the edge of the dawn light.', icon: '🦩', sanctuaryRequired: 'dawn_pavilion' as ZHSanctuaryId },
  { id: 'mist_heron', name: 'Mist Heron', speed: 35, endurance: 90, altitude: 9000, description: 'A heron that walks on mist as if it were solid ground.', icon: '🪶', sanctuaryRequired: 'mist_archipelago' as ZHSanctuaryId },
  { id: 'thunder_roc', name: 'Thunder Roc', speed: 90, endurance: 70, altitude: 10500, description: 'A legendary roc that carries riders through the fiercest storms.', icon: '🦅', sanctuaryRequired: 'thunder_spire' as ZHSanctuaryId },
  { id: 'sunset_phoenix', name: 'Sunset Phoenix', speed: 80, endurance: 100, altitude: 12000, description: 'A phoenix reborn each sunset, capable of flying to the zenith.', icon: '🔥', sanctuaryRequired: 'sunset_shrine' as ZHSanctuaryId },
  { id: 'zephyr_griffin', name: 'Zephyr Griffin', speed: 100, endurance: 120, altitude: 15000, description: 'The ultimate mythical mount, half eagle and half lion, lord of all winds.', icon: '🦁', sanctuaryRequired: 'zenith_sanctuary' as ZHSanctuaryId },
] as const;

// =============================================================================
// SECTION 14: CLOUD SURFING ROUTES
// =============================================================================

export const ZH_CLOUD_ROUTES = [
  { id: 'petal_path', name: 'Petal Path', fromSanctuary: 'cloud_garden' as ZHSanctuaryId, toSanctuary: 'wind_temple' as ZHSanctuaryId, distance: 5, difficulty: 1, wisdomReward: 25, description: 'A gentle path through drifting flower petals carried on warm updrafts.' },
  { id: 'gale_corridor', name: 'Gale Corridor', fromSanctuary: 'wind_temple' as ZHSanctuaryId, toSanctuary: 'storm_nest' as ZHSanctuaryId, distance: 8, difficulty: 2, wisdomReward: 50, description: 'A high-speed corridor where gale-force winds propel surfers forward.' },
  { id: 'lightning_alley', name: 'Lightning Alley', fromSanctuary: 'storm_nest' as ZHSanctuaryId, toSanctuary: 'dawn_pavilion' as ZHSanctuaryId, distance: 6, difficulty: 3, wisdomReward: 65, description: 'A dangerous alley between storm clouds where lightning flashes illuminate the path.' },
  { id: 'rainbow_bridge', name: 'Rainbow Bridge', fromSanctuary: 'dawn_pavilion' as ZHSanctuaryId, toSanctuary: 'mist_archipelago' as ZHSanctuaryId, distance: 10, difficulty: 3, wisdomReward: 80, description: 'A bridge of solidified rainbow light connecting dawn to the mist islands.' },
  { id: 'void_crossing', name: 'Void Crossing', fromSanctuary: 'mist_archipelago' as ZHSanctuaryId, toSanctuary: 'thunder_spire' as ZHSanctuaryId, distance: 7, difficulty: 4, wisdomReward: 100, description: 'A crossing through a pocket of void wind where gravity shifts unpredictably.' },
  { id: 'dusk_highway', name: 'Dusk Highway', fromSanctuary: 'thunder_spire' as ZHSanctuaryId, toSanctuary: 'sunset_shrine' as ZHSanctuaryId, distance: 12, difficulty: 4, wisdomReward: 130, description: 'A highway of sunset-colored clouds that flows toward the eternal dusk.' },
  { id: 'zenith_ascent', name: 'Zenith Ascent', fromSanctuary: 'sunset_shrine' as ZHSanctuaryId, toSanctuary: 'zenith_sanctuary' as ZHSanctuaryId, distance: 15, difficulty: 5, wisdomReward: 200, description: 'The ultimate ascent through thinning atmosphere to the highest point in the sky.' },
] as const;

// =============================================================================
// SECTION 15: DEFAULT STATE FACTORY
// =============================================================================

function createDefaultState(): ZHState {
  const today = new Date().toISOString().slice(0, 10);
  const spirits: Record<string, ZHSpiritState> = {};
  for (const s of ZH_SPIRITS) {
    spirits[s.id] = {
      spiritId: s.id, summoned: false, summonedAt: null, nickname: '', level: 1, xp: 0, bondStrength: 0,
    };
  }
  const sanctuaries: Record<string, { visited: boolean; visitsCount: number; firstVisitAt: number | null; highestAltitude: number }> = {};
  for (const s of ZH_SANCTUARIES) {
    sanctuaries[s.id] = { visited: false, visitsCount: 0, firstVisitAt: null, highestAltitude: 0 };
  }
  const abilities: Record<string, ZHAbilityState> = {};
  for (const a of ZH_ABILITIES) {
    abilities[a.id] = {
      abilityId: a.id, unlocked: a.unlockCost === 0, unlockedAt: a.unlockCost === 0 ? Date.now() : null,
      lastUsedAt: 0, totalUses: 0,
    };
  }
  const achievements: Record<string, ZHAchievementState> = {};
  for (const ach of ZH_ACHIEVEMENTS) {
    achievements[ach.id] = { id: ach.id, unlocked: false, unlockedAt: null, currentValue: 0 };
  }
  return {
    spirits,
    sanctuaries,
    feathers: {},
    structures: { wind_shrine: { structureId: 'wind_shrine', level: 1, builtAt: Date.now(), lastCollected: Date.now() } },
    abilities,
    achievements,
    currentSanctuary: 'cloud_garden',
    wisdom: 50,
    totalWisdomGained: 50,
    altitudeReached: 1000,
    spiritsSummoned: 0,
    titleIndex: 0,
    reputation: 0,
    totalReputation: 0,
    windChanneled: 0,
    maxWindChannel: 0,
    channelCount: 0,
    totalWindChanneled: 0,
    stormTamingLevel: 1,
    stormTamingXp: 0,
    stormTamingSessions: 0,
    cloudsSurfed: 0,
    totalFeathersCollected: 0,
    dailyTask: {
      date: today, spiritsSummoned: 0, sanctuariesExplored: 0, windsChanneled: 0,
      structuresUpgraded: 0, abilitiesActivated: 0, feathersCollected: 0,
      stormsTamed: 0, cloudsSurfed: 0, isComplete: false, rewardClaimed: false,
    },
    summonProgress: {},
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

export default function useZephyrHaven(initialState?: ZHState) {
  const [state, setState] = useState<ZHState>(initialState ?? createDefaultState());
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const getToday = useCallback((): string => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const checkDailyReset = useCallback(() => {
    const current = stateRef.current;
    const today = getToday();
    if (current.dailyTask.date !== today) {
      setState(prev => ({
        ...prev,
        dailyTask: {
          date: today,
          spiritsSummoned: 0,
          sanctuariesExplored: 0,
          windsChanneled: 0,
          structuresUpgraded: 0,
          abilitiesActivated: 0,
          feathersCollected: 0,
          stormsTamed: 0,
          cloudsSurfed: 0,
          isComplete: false,
          rewardClaimed: false,
        },
        lastDailyReset: Date.now(),
        updatedAt: Date.now(),
      }));
    }
  }, [getToday]);

  const updateAchievementTracking = useCallback((key: string, value: number) => {
    setState(prev => {
      const updatedAchievements = { ...prev.achievements };
      let reputationGain = 0;
      for (const ach of ZH_ACHIEVEMENTS) {
        if (ach.conditionKey === key) {
          const cur = updatedAchievements[ach.id];
          if (!cur) continue;
          if (!cur.unlocked && value >= ach.targetValue) {
            updatedAchievements[ach.id] = { ...cur, unlocked: true, unlockedAt: Date.now(), currentValue: value };
            reputationGain += ach.wisdomReward;
          } else if (!cur.unlocked) {
            updatedAchievements[ach.id] = { ...cur, currentValue: value };
          }
        }
      }
      return {
        ...prev,
        achievements: updatedAchievements,
        reputation: prev.reputation + reputationGain,
        totalReputation: prev.totalReputation + reputationGain,
        updatedAt: Date.now(),
      };
    });
  }, []);

  const getUpgradeCost = useCallback((structureId: string, targetLevel: number): number => {
    const def = ZH_STRUCTURES.find(s => s.id === structureId);
    if (!def) return 0;
    return def.baseCost + def.costPerLevel * (targetLevel - 1);
  }, []);

  const grantWisdom = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      wisdom: Math.min(ZH_MAX_WISDOM, prev.wisdom + amount),
      totalWisdomGained: prev.totalWisdomGained + amount,
      updatedAt: Date.now(),
    }));
    updateAchievementTracking('total_wisdom_gained', stateRef.current.totalWisdomGained + amount);
  }, [updateAchievementTracking]);

  const grantReputation = useCallback((amount: number) => {
    setState(prev => {
      const newRep = prev.reputation + amount;
      const newTotalRep = prev.totalReputation + amount;
      let newTitleIndex = prev.titleIndex;
      for (let i = ZH_TITLES.length - 1; i >= 0; i--) {
        if (newRep >= ZH_TITLES[i].requiredReputation) {
          if (i > newTitleIndex) {
            newTitleIndex = i;
          }
          break;
        }
      }
      return {
        ...prev,
        reputation: newRep,
        totalReputation: newTotalRep,
        titleIndex: newTitleIndex,
        updatedAt: Date.now(),
      };
    });
    updateAchievementTracking('title_index', stateRef.current.titleIndex);
  }, [updateAchievementTracking]);

  const titleMultiplier = useMemo(() => {
    return ZH_TITLES[state.titleIndex]?.bonusMultiplier ?? 1.0;
  }, [state]);

  const updateDailyTask = useCallback((field: keyof ZHDailyTask, increment: number = 1) => {
    setState(prev => {
      const task = { ...prev.dailyTask, [field]: (prev.dailyTask as Record<string, number>)[field] + increment } as ZHDailyTask;
      const isComplete =
        task.spiritsSummoned >= 3 &&
        task.sanctuariesExplored >= 2 &&
        task.windsChanneled >= 1 &&
        task.structuresUpgraded >= 1 &&
        task.abilitiesActivated >= 1 &&
        task.feathersCollected >= 2 &&
        task.stormsTamed >= 1 &&
        task.cloudsSurfed >= 1;
      return { ...prev, dailyTask: { ...task, isComplete }, updatedAt: Date.now() };
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Core Actions
  // ---------------------------------------------------------------------------

  const summonSpirit = useCallback((spiritId: string): { success: boolean; message: string } => {
    checkDailyReset();
    const def = ZH_SPIRITS.find(s => s.id === spiritId);
    if (!def) return { success: false, message: 'Unknown wind spirit.' };
    if (!def.canSummon) return { success: false, message: `${def.name} cannot be summoned.` };
    const current = stateRef.current;
    const spiritState = current.spirits[spiritId];
    if (!spiritState) return { success: false, message: 'Spirit data not found.' };
    if (spiritState.summoned) return { success: false, message: `${def.name} is already your companion!` };
    const progress = current.summonProgress[spiritId];
    if (progress && progress.completed) return { success: false, message: 'Summoning already completed.' };
    const wisdomCost = def.summonDifficulty * 10;
    if (current.wisdom < wisdomCost) return { success: false, message: `Not enough wisdom. Need ${wisdomCost}, have ${current.wisdom}.` };
    setState(prev => {
      const newSpirits = { ...prev.spirits };
      newSpirits[spiritId] = { ...newSpirits[spiritId], summoned: true, summonedAt: Date.now() };
      const newSummonProgress = { ...prev.summonProgress };
      newSummonProgress[spiritId] = { spiritId, progress: 100, maxProgress: 100, startedAt: prev.summonProgress[spiritId]?.startedAt ?? Date.now(), completed: true };
      return {
        ...prev,
        spirits: newSpirits,
        summonProgress: newSummonProgress,
        wisdom: prev.wisdom - wisdomCost,
        spiritsSummoned: prev.spiritsSummoned + 1,
        updatedAt: Date.now(),
      };
    });
    updateDailyTask('spiritsSummoned');
    const newCount = stateRef.current.spiritsSummoned + 1;
    updateAchievementTracking('spirits_summoned', newCount);
    return { success: true, message: `${def.name} has been summoned! Your new wind spirit companion.` };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking]);

  const exploreSanctuary = useCallback((sanctuaryId: ZHSanctuaryId): { success: boolean; message: string; newWisdom?: number } => {
    checkDailyReset();
    const def = ZH_SANCTUARIES.find(s => s.id === sanctuaryId);
    if (!def) return { success: false, message: 'Unknown sanctuary.' };
    const current = stateRef.current;
    if (current.altitudeReached < def.unlockAltitude) {
      return { success: false, message: `Need altitude ${def.unlockAltitude}m to unlock ${def.name}. Current: ${current.altitudeReached}m.` };
    }
    if (current.currentSanctuary === sanctuaryId) {
      return { success: true, message: `You are already at ${def.name}.` };
    }
    const wisdomGain = Math.floor(def.baseWisdom * titleMultiplier);
    setState(prev => {
      const newSanctuaries = { ...prev.sanctuaries };
      const existing = newSanctuaries[sanctuaryId];
      if (existing) {
        newSanctuaries[sanctuaryId] = { ...existing, visited: true, visitsCount: existing.visitsCount + 1, firstVisitAt: existing.firstVisitAt ?? Date.now(), highestAltitude: Math.max(existing.highestAltitude, def.elevation) };
      } else {
        newSanctuaries[sanctuaryId] = { visited: true, visitsCount: 1, firstVisitAt: Date.now(), highestAltitude: def.elevation };
      }
      return {
        ...prev,
        sanctuaries: newSanctuaries,
        currentSanctuary: sanctuaryId,
        wisdom: Math.min(ZH_MAX_WISDOM, prev.wisdom + wisdomGain),
        totalWisdomGained: prev.totalWisdomGained + wisdomGain,
        updatedAt: Date.now(),
      };
    });
    updateDailyTask('sanctuariesExplored');
    const visitedCount = Object.values(stateRef.current.sanctuaries).filter(p => p.visited).length + 1;
    updateAchievementTracking('sanctuaries_visited', visitedCount);
    updateAchievementTracking('altitude_reached', Math.max(stateRef.current.altitudeReached, def.elevation));
    return { success: true, message: `You arrived at ${def.name}! Gained ${wisdomGain} wisdom.`, newWisdom: wisdomGain };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, titleMultiplier]);

  const upgradeStructure = useCallback((structureId: string): { success: boolean; message: string } => {
    checkDailyReset();
    const def = ZH_STRUCTURES.find(s => s.id === structureId);
    if (!def) return { success: false, message: 'Unknown structure.' };
    const current = stateRef.current;
    const existing = current.structures[structureId];
    if (!existing) {
      const buildCost = getUpgradeCost(structureId, 1);
      if (current.wisdom < buildCost) {
        return { success: false, message: `Not enough wisdom to build ${def.name}. Need ${buildCost}.` };
      }
      setState(prev => ({
        ...prev,
        structures: { ...prev.structures, [structureId]: { structureId, level: 1, builtAt: Date.now(), lastCollected: Date.now() } },
        wisdom: prev.wisdom - buildCost,
        updatedAt: Date.now(),
      }));
      updateDailyTask('structuresUpgraded');
      return { success: true, message: `${def.name} has been built! Level 1.` };
    }
    if (existing.level >= def.maxLevel) {
      return { success: false, message: `${def.name} is already at maximum level ${def.maxLevel}.` };
    }
    const targetLevel = existing.level + 1;
    const cost = getUpgradeCost(structureId, targetLevel);
    if (current.wisdom < cost) {
      return { success: false, message: `Not enough wisdom to upgrade to Lv${targetLevel}. Need ${cost}, have ${current.wisdom}.` };
    }
    setState(prev => ({
      ...prev,
      structures: { ...prev.structures, [structureId]: { ...prev.structures[structureId], level: targetLevel } },
      wisdom: prev.wisdom - cost,
      updatedAt: Date.now(),
    }));
    updateDailyTask('structuresUpgraded');
    const builtCount = Object.keys(stateRef.current.structures).length;
    updateAchievementTracking('structures_built', builtCount);
    if (targetLevel >= ZH_MAX_STRUCTURE_LEVEL) {
      updateAchievementTracking('max_structure_level', 1);
    }
    return { success: true, message: `${def.name} upgraded to Level ${targetLevel}!` };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, getUpgradeCost]);

  const activateAbility = useCallback((abilityId: string): { success: boolean; message: string; power?: number } => {
    checkDailyReset();
    const def = ZH_ABILITIES.find(a => a.id === abilityId);
    if (!def) return { success: false, message: 'Unknown ability.' };
    const current = stateRef.current;
    const abilityState = current.abilities[abilityId];
    if (!abilityState) return { success: false, message: 'Ability data not found.' };
    if (!abilityState.unlocked) return { success: false, message: `${def.name} is not unlocked yet.` };
    const now = Date.now();
    if (now - abilityState.lastUsedAt < def.cooldown * 1000) return { success: false, message: `${def.name} is on cooldown.` };
    if (current.wisdom < def.wisdomCost) return { success: false, message: `Not enough wisdom. Need ${def.wisdomCost}, have ${current.wisdom}.` };
    const finalPower = Math.floor(def.power * titleMultiplier);
    setState(prev => ({
      ...prev,
      wisdom: prev.wisdom - def.wisdomCost,
      abilities: { ...prev.abilities, [abilityId]: { ...prev.abilities[abilityId], lastUsedAt: now, totalUses: prev.abilities[abilityId].totalUses + 1 } },
      updatedAt: Date.now(),
    }));
    updateDailyTask('abilitiesActivated');
    return { success: true, message: `${def.name} activated! Power: ${finalPower}`, power: finalPower };
  }, [checkDailyReset, updateDailyTask, titleMultiplier]);

  const channelWind = useCallback((durationMs: number = ZH_CHANNEL_BASE_DURATION_MS): { success: boolean; message: string; wisdomGained: number; depth: number; wasBlessed: boolean } => {
    checkDailyReset();
    const current = stateRef.current;
    const sanctuary = ZH_SANCTUARIES.find(s => s.id === current.currentSanctuary);
    const depth = Math.floor(Math.random() * 10) + Math.floor(durationMs / 10000);
    const baseGain = sanctuary ? sanctuary.baseWisdom : 10;
    const wisdomGained = Math.floor(baseGain * (depth / 10) * titleMultiplier);
    const wasBlessed = Math.random() < 0.08;
    const finalGain = wasBlessed ? wisdomGained * 3 : wisdomGained;
    setState(prev => ({
      ...prev,
      wisdom: Math.min(ZH_MAX_WISDOM, prev.wisdom + finalGain),
      totalWisdomGained: prev.totalWisdomGained + finalGain,
      windChanneled: depth,
      maxWindChannel: Math.max(prev.maxWindChannel, depth),
      channelCount: prev.channelCount + 1,
      totalWindChanneled: prev.totalWindChanneled + finalGain,
      updatedAt: Date.now(),
    }));
    updateDailyTask('windsChanneled');
    updateAchievementTracking('max_wind_channel', Math.max(stateRef.current.maxWindChannel, depth));
    updateAchievementTracking('total_wisdom_gained', stateRef.current.totalWisdomGained + finalGain);
    const msg = wasBlessed
      ? `A sacred breeze blesses your channeling! +${finalGain} wisdom!`
      : `Channeled wind for ${Math.floor(durationMs / 1000)}s. Depth: ${depth}. +${finalGain} wisdom.`;
    return { success: true, message: msg, wisdomGained: finalGain, depth, wasBlessed };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, titleMultiplier]);

  const trainStormTaming = useCallback((): { success: boolean; message: string; xpGained: number; leveledUp: boolean; newLevel: number } => {
    checkDailyReset();
    const current = stateRef.current;
    if (current.stormTamingLevel >= ZH_MAX_STORM_TAMING_LEVEL) {
      return { success: false, message: 'Storm taming is already at maximum level.', xpGained: 0, leveledUp: false, newLevel: current.stormTamingLevel };
    }
    const xpGained = Math.floor((20 + Math.random() * 30) * titleMultiplier);
    let newXp = current.stormTamingXp + xpGained;
    let shouldLevel = false;
    let newLevel = current.stormTamingLevel;
    const xpNeeded = newLevel * 100;
    if (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel += 1;
      shouldLevel = true;
    }
    setState(prev => ({
      ...prev,
      stormTamingLevel: newLevel,
      stormTamingXp: newXp,
      stormTamingSessions: prev.stormTamingSessions + 1,
      updatedAt: Date.now(),
    }));
    updateDailyTask('stormsTamed');
    updateAchievementTracking('storm_taming_sessions', stateRef.current.stormTamingSessions + 1);
    if (shouldLevel) {
      updateAchievementTracking('storm_taming_level', newLevel);
    }
    const msg = shouldLevel
      ? `Storm taming leveled up to ${newLevel}! +${xpGained} XP.`
      : `Trained storm taming. +${xpGained} XP. (Lv${newLevel})`;
    return { success: true, message: msg, xpGained, leveledUp: shouldLevel, newLevel };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking, titleMultiplier]);

  const surfClouds = useCallback((distance: number = 1): { success: boolean; message: string; distanceTraveled: number } => {
    checkDailyReset();
    const current = stateRef.current;
    const wisdomGain = Math.floor(distance * 5 * titleMultiplier);
    setState(prev => ({
      ...prev,
      wisdom: Math.min(ZH_MAX_WISDOM, prev.wisdom + wisdomGain),
      totalWisdomGained: prev.totalWisdomGained + wisdomGain,
      cloudsSurfed: prev.cloudsSurfed + distance,
      altitudeReached: Math.max(prev.altitudeReached, prev.altitudeReached + distance * 100),
      updatedAt: Date.now(),
    }));
    updateDailyTask('cloudsSurfed');
    return { success: true, message: `Surfed ${distance} cloud${distance > 1 ? 's' : ''}! +${wisdomGain} wisdom.`, distanceTraveled: distance };
  }, [checkDailyReset, updateDailyTask, titleMultiplier]);

  const collectFeather = useCallback((featherId: string): { success: boolean; message: string } => {
    checkDailyReset();
    const def = ZH_FEATHERS.find(f => f.id === featherId);
    if (!def) return { success: false, message: 'Unknown feather.' };
    const current = stateRef.current;
    const existing = current.feathers[featherId];
    if (existing) return { success: false, message: `${def.name} is already in your collection.` };
    setState(prev => ({
      ...prev,
      feathers: { ...prev.feathers, [featherId]: { featherId, owned: true, equipped: false, acquiredAt: Date.now(), upgrades: 0 } },
      totalFeathersCollected: prev.totalFeathersCollected + 1,
      updatedAt: Date.now(),
    }));
    updateDailyTask('feathersCollected');
    const newTotal = stateRef.current.totalFeathersCollected + 1;
    updateAchievementTracking('total_feathers_collected', newTotal);
    return { success: true, message: `${def.name} collected! (${def.rarity})` };
  }, [checkDailyReset, updateDailyTask, updateAchievementTracking]);

  const equipFeather = useCallback((featherId: string): { success: boolean; message: string } => {
    const def = ZH_FEATHERS.find(f => f.id === featherId);
    if (!def) return { success: false, message: 'Unknown feather.' };
    const current = stateRef.current;
    const feather = current.feathers[featherId];
    if (!feather || !feather.owned) return { success: false, message: `You don't own ${def.name}.` };
    if (feather.equipped) return { success: false, message: `${def.name} is already equipped.` };
    setState(prev => {
      const newFeathers = { ...prev.feathers };
      for (const key of Object.keys(newFeathers)) {
        if (newFeathers[key].equipped) {
          newFeathers[key] = { ...newFeathers[key], equipped: false };
        }
      }
      newFeathers[featherId] = { ...newFeathers[featherId], equipped: true };
      return { ...prev, feathers: newFeathers, updatedAt: Date.now() };
    });
    return { success: true, message: `${def.name} equipped!` };
  }, []);

  const feedSpirit = useCallback((spiritId: string): { success: boolean; message: string; bondGained: number } => {
    const def = ZH_SPIRITS.find(s => s.id === spiritId);
    if (!def) return { success: false, message: 'Unknown spirit.', bondGained: 0 };
    const current = stateRef.current;
    const spiritState = current.spirits[spiritId];
    if (!spiritState) return { success: false, message: 'Spirit data not found.', bondGained: 0 };
    if (!spiritState.summoned) return { success: false, message: `${def.name} is not your companion.`, bondGained: 0 };
    if (spiritState.bondStrength >= ZH_MAX_BOND_STRENGTH) return { success: false, message: `${def.name} already has maximum bond strength.`, bondGained: 0 };
    const wisdomCost = Math.floor(def.summonDifficulty * 5);
    if (current.wisdom < wisdomCost) return { success: false, message: `Not enough wisdom to feed ${def.name}. Need ${wisdomCost}.`, bondGained: 0 };
    const bondGain = Math.floor(5 + Math.random() * 10);
    const totalBond = Math.min(ZH_MAX_BOND_STRENGTH, spiritState.bondStrength + bondGain);
    setState(prev => ({
      ...prev,
      spirits: { ...prev.spirits, [spiritId]: { ...prev.spirits[spiritId], bondStrength: totalBond } },
      wisdom: prev.wisdom - wisdomCost,
      updatedAt: Date.now(),
    }));
    return { success: true, message: `Fed ${def.name}. Bond +${totalBond - spiritState.bondStrength}.`, bondGained: totalBond - spiritState.bondStrength };
  }, []);

  const collectStructureIncome = useCallback((): { success: boolean; message: string; wisdomCollected: number; reputationCollected: number } => {
    const current = stateRef.current;
    const structureIds = Object.keys(current.structures);
    if (structureIds.length === 0) return { success: false, message: 'No structures built yet.', wisdomCollected: 0, reputationCollected: 0 };
    let totalWisdom = 0;
    let totalReputation = 0;
    for (const sid of structureIds) {
      const def = ZH_STRUCTURES.find(s => s.id === sid);
      const sState = current.structures[sid];
      if (!def || !sState) continue;
      totalWisdom += def.wisdomPerDay * sState.level;
      totalReputation += def.reputationPerDay * sState.level;
    }
    if (totalWisdom === 0 && totalReputation === 0) {
      return { success: false, message: 'Nothing to collect yet. Wait for structures to generate income.', wisdomCollected: 0, reputationCollected: 0 };
    }
    const finalWisdom = Math.floor(totalWisdom * titleMultiplier);
    const finalReputation = Math.floor(totalReputation * titleMultiplier);
    setState(prev => {
      const newStructures = { ...prev.structures };
      for (const sid of Object.keys(newStructures)) {
        newStructures[sid] = { ...newStructures[sid], lastCollected: Date.now() };
      }
      return {
        ...prev,
        structures: newStructures,
        wisdom: Math.min(ZH_MAX_WISDOM, prev.wisdom + finalWisdom),
        totalWisdomGained: prev.totalWisdomGained + finalWisdom,
        reputation: prev.reputation + finalReputation,
        totalReputation: prev.totalReputation + finalReputation,
        updatedAt: Date.now(),
      };
    });
    grantReputation(finalReputation);
    return { success: true, message: `Collected income from ${structureIds.length} structures!`, wisdomCollected: finalWisdom, reputationCollected: finalReputation };
  }, [titleMultiplier, grantReputation]);

  const unlockAbility = useCallback((abilityId: string): { success: boolean; message: string } => {
    const def = ZH_ABILITIES.find(a => a.id === abilityId);
    if (!def) return { success: false, message: 'Unknown ability.' };
    const current = stateRef.current;
    const abilityState = current.abilities[abilityId];
    if (!abilityState) return { success: false, message: 'Ability data not found.' };
    if (abilityState.unlocked) return { success: false, message: `${def.name} is already unlocked.` };
    if (current.wisdom < def.unlockCost) return { success: false, message: `Not enough wisdom to unlock ${def.name}. Need ${def.unlockCost}.` };
    setState(prev => ({
      ...prev,
      wisdom: prev.wisdom - def.unlockCost,
      abilities: { ...prev.abilities, [abilityId]: { ...prev.abilities[abilityId], unlocked: true, unlockedAt: Date.now() } },
      updatedAt: Date.now(),
    }));
    return { success: true, message: `${def.name} unlocked! Use it to channel ${def.windType} energy.` };
  }, []);

  const startSkyEvent = useCallback((eventId: ZHSkyEventId): { success: boolean; message: string } => {
    const current = stateRef.current;
    if (current.activeEvent) return { success: false, message: `An event (${current.activeEvent}) is already active.` };
    const def = ZH_SKY_EVENTS.find(e => e.id === eventId);
    if (!def) return { success: false, message: 'Unknown event.' };
    const endTime = Date.now() + def.durationHours * 3600_000;
    setState(prev => ({
      ...prev,
      activeEvent: eventId,
      eventEndTime: endTime,
      updatedAt: Date.now(),
    }));
    return { success: true, message: `${def.name} has begun! Duration: ${def.durationHours} hours.` };
  }, []);

  const checkEventExpiry = useCallback(() => {
    const current = stateRef.current;
    if (!current.activeEvent || !current.eventEndTime) return;
    if (Date.now() < current.eventEndTime) return;
    setState(prev => ({
      ...prev,
      eventHistory: [...prev.eventHistory, { eventId: prev.activeEvent ?? '', startedAt: prev.eventHistory.length > 0 ? prev.eventHistory[prev.eventHistory.length - 1].startedAt : Date.now(), endedAt: Date.now(), wisdomGained: 0, reputationGained: 0 }],
      activeEvent: null,
      eventEndTime: null,
      updatedAt: Date.now(),
    }));
  }, []);

  const getEventMultiplier = useCallback((field: 'wisdom' | 'reputation' | 'summon' | 'channel'): number => {
    const current = stateRef.current;
    if (!current.activeEvent) return 1.0;
    const def = ZH_SKY_EVENTS.find(e => e.id === current.activeEvent);
    if (!def) return 1.0;
    if (field === 'wisdom') return def.wisdomMultiplier;
    if (field === 'reputation') return def.reputationMultiplier;
    if (field === 'summon') return def.summonBonus;
    return def.channelBonus;
  }, []);

  const claimDailyReward = useCallback((): { success: boolean; message: string; wisdomReward: number; reputationReward: number } => {
    checkDailyReset();
    const current = stateRef.current;
    const today = getToday();
    const task = current.dailyTask;
    if (task.date !== today) return { success: false, message: 'Daily task has reset. Complete today\'s tasks first.', wisdomReward: 0, reputationReward: 0 };
    if (task.rewardClaimed) return { success: false, message: 'Daily reward already claimed today.', wisdomReward: 0, reputationReward: 0 };
    if (!task.isComplete) return { success: false, message: 'Daily task not yet complete.', wisdomReward: 0, reputationReward: 0 };
    const wisdomReward = 100;
    const reputationReward = 50;
    setState(prev => ({
      ...prev,
      wisdom: Math.min(ZH_MAX_WISDOM, prev.wisdom + wisdomReward),
      totalWisdomGained: prev.totalWisdomGained + wisdomReward,
      reputation: prev.reputation + reputationReward,
      totalReputation: prev.totalReputation + reputationReward,
      dailyTask: { ...prev.dailyTask, rewardClaimed: true },
      updatedAt: Date.now(),
    }));
    return { success: true, message: `Daily reward claimed! +${wisdomReward} wisdom, +${reputationReward} reputation.`, wisdomReward, reputationReward };
  }, [checkDailyReset, getToday]);

  const nicknameSpirit = useCallback((spiritId: string, nickname: string): { success: boolean; message: string } => {
    const current = stateRef.current;
    const spiritState = current.spirits[spiritId];
    if (!spiritState) return { success: false, message: 'Unknown spirit.' };
    if (!spiritState.summoned) return { success: false, message: 'This spirit is not your companion.' };
    if (nickname.length < 1 || nickname.length > 20) return { success: false, message: 'Nickname must be 1-20 characters.' };
    const def = ZH_SPIRITS.find(s => s.id === spiritId);
    setState(prev => ({
      ...prev,
      spirits: { ...prev.spirits, [spiritId]: { ...prev.spirits[spiritId], nickname } },
      updatedAt: Date.now(),
    }));
    return { success: true, message: `${def?.name ?? spiritId} is now known as "${nickname}".` };
  }, []);

  const checkAchievements = useCallback((): { newlyUnlocked: string[] } => {
    const current = stateRef.current;
    const newlyUnlocked: string[] = [];
    const conditionValues: Record<string, number> = {
      sanctuaries_visited: Object.values(current.sanctuaries).filter(s => s.visited).length,
      spirits_summoned: current.spiritsSummoned,
      structures_built: Object.keys(current.structures).length,
      max_structure_level: Math.max(...Object.values(current.structures).map(s => s.level), 0),
      total_wisdom_gained: current.totalWisdomGained,
      max_wind_channel: current.maxWindChannel,
      storm_taming_sessions: current.stormTamingSessions,
      storm_taming_level: current.stormTamingLevel,
      altitude_reached: current.altitudeReached,
      title_index: current.titleIndex,
      total_feathers_collected: current.totalFeathersCollected,
    };
    for (const ach of ZH_ACHIEVEMENTS) {
      const achState = current.achievements[ach.id];
      if (achState && !achState.unlocked) {
        const val = conditionValues[ach.conditionKey] ?? 0;
        if (val >= ach.targetValue) {
          newlyUnlocked.push(ach.id);
        }
      }
    }
    for (const achId of newlyUnlocked) {
      updateAchievementTracking(
        ZH_ACHIEVEMENTS.find(a => a.id === achId)?.conditionKey ?? '',
        conditionValues[ZH_ACHIEVEMENTS.find(a => a.id === achId)?.conditionKey ?? ''] ?? 0,
      );
    }
    return { newlyUnlocked };
  }, [updateAchievementTracking]);

  const getTitle = useCallback((): ZHTitleDef => {
    return ZH_TITLES[stateRef.current.titleIndex] ?? ZH_TITLES[0];
  }, []);

  const getProgress = useCallback(() => {
    const s = stateRef.current;
    return {
      wisdomPercent: Math.floor((s.totalWisdomGained / ZH_MAX_WISDOM) * 100),
      altitudePercent: Math.floor((s.altitudeReached / ZH_MAX_ALTITUDE) * 100),
      spiritPercent: Math.floor((s.spiritsSummoned / ZH_SPIRITS.length) * 100),
      structurePercent: Math.floor((Object.keys(s.structures).length / ZH_STRUCTURES.length) * 100),
      featherPercent: Math.floor((s.totalFeathersCollected / ZH_FEATHERS.length) * 100),
      titlePercent: Math.floor((s.titleIndex / ZH_MAX_TITLE_INDEX) * 100),
    };
  }, []);

  const getStats = useCallback(() => {
    const s = stateRef.current;
    return {
      totalSpirits: ZH_SPIRITS.length,
      tamedSpirits: Object.values(s.spirits).filter(sp => sp.summoned).length,
      totalFeathers: ZH_FEATHERS.length,
      collectedFeathers: s.totalFeathersCollected,
      totalStructures: ZH_STRUCTURES.length,
      builtStructures: Object.keys(s.structures).length,
      totalAbilities: ZH_ABILITIES.length,
      unlockedAbilities: Object.values(s.abilities).filter(a => a.unlocked).length,
      totalSanctuaries: ZH_SANCTUARIES.length,
      visitedSanctuaries: Object.values(s.sanctuaries).filter(san => san.visited).length,
      totalAchievements: ZH_ACHIEVEMENTS.length,
      unlockedAchievements: Object.values(s.achievements).filter(a => a.unlocked).length,
      channelCount: s.channelCount,
      maxChannel: s.maxWindChannel,
      stormTamingLevel: s.stormTamingLevel,
      stormTamingSessions: s.stormTamingSessions,
      cloudsSurfed: s.cloudsSurfed,
      daysActive: Math.max(1, Math.floor((Date.now() - s.createdAt) / ZH_DAILY_RESET_MS)),
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Computed Data (useMemo with [state] dependency)
  // ---------------------------------------------------------------------------

  const sanctuarySpirits = useMemo(() => {
    return ZH_SPIRITS.filter(spirit => {
      if (state.currentSanctuary === 'cloud_garden') return true;
      return spirit.sanctuaryAffinity.includes(state.currentSanctuary);
    }).map(spirit => {
      const cs = state.spirits[spirit.id];
      return { ...cs, def: spirit };
    });
  }, [state]);

  const availableSanctuaries = useMemo(() => {
    return ZH_SANCTUARIES.filter(s => s.unlockAltitude <= state.altitudeReached);
  }, [state]);

  const structureSummary = useMemo(() => {
    return ZH_STRUCTURES.map(def => {
      const sState = state.structures[def.id];
      if (sState) {
        return { ...sState, def };
      }
      return { structureId: def.id, level: 0, builtAt: 0, lastCollected: 0, def };
    });
  }, [state]);

  const abilitySummary = useMemo(() => {
    return ZH_ABILITIES.map(def => {
      const aState = state.abilities[def.id];
      if (aState) {
        return { ...aState, def };
      }
      return { abilityId: def.id, unlocked: false, unlockedAt: null, lastUsedAt: 0, totalUses: 0, def };
    });
  }, [state]);

  const achievementSummary = useMemo(() => {
    return ZH_ACHIEVEMENTS.map(def => {
      const aState = state.achievements[def.id];
      if (aState) {
        return { ...aState, def };
      }
      return { id: def.id, unlocked: false, unlockedAt: null, currentValue: 0, def };
    });
  }, [state]);

  const dailyWisdomIncome = useMemo(() => {
    let total = 0;
    for (const sid of Object.keys(state.structures)) {
      const def = ZH_STRUCTURES.find(s => s.id === sid);
      const sState = state.structures[sid];
      if (def && sState) {
        total += def.wisdomPerDay * sState.level;
      }
    }
    return Math.floor(total * titleMultiplier);
  }, [state, titleMultiplier]);

  const dailyReputationIncome = useMemo(() => {
    let total = 0;
    for (const sid of Object.keys(state.structures)) {
      const def = ZH_STRUCTURES.find(s => s.id === sid);
      const sState = state.structures[sid];
      if (def && sState) {
        total += def.reputationPerDay * sState.level;
      }
    }
    return Math.floor(total * titleMultiplier);
  }, [state, titleMultiplier]);

  const summonedSpiritsList = useMemo(() => {
    return Object.values(state.spirits)
      .filter(sp => sp.summoned)
      .map(sp => {
        const def = ZH_SPIRITS.find(s => s.id === sp.spiritId);
        if (def) {
          return { ...sp, def };
        }
        return { ...sp, def: null };
      });
  }, [state]);

  const activeSummonList = useMemo(() => {
    return Object.entries(state.summonProgress)
      .filter(([, prog]) => prog.startedAt !== null && !prog.completed)
      .map(([id, prog]) => {
        const def = ZH_SPIRITS.find(s => s.id === id);
        return { ...prog, def };
      });
  }, [state]);

  const nextTitle = useMemo(() => {
    const currentIndex = state.titleIndex;
    if (currentIndex >= ZH_MAX_TITLE_INDEX) return null;
    const next = ZH_TITLES[currentIndex + 1];
    if (!next) return null;
    return { ...next, reputationNeeded: next.requiredReputation - state.reputation };
  }, [state]);

  const isDailyTaskComplete = useMemo(() => {
    return state.dailyTask.isComplete;
  }, [state]);

  const unlockedSanctuariesCount = useMemo(() => {
    return Object.values(state.sanctuaries).filter(s => s.visited).length;
  }, [state]);

  const stormTamingXpToNext = useMemo(() => {
    return state.stormTamingLevel * 100;
  }, [state]);

  const stormTamingXpProgress = useMemo(() => {
    const needed = state.stormTamingLevel * 100;
    if (needed === 0) return 100;
    return Math.floor((state.stormTamingXp / needed) * 100);
  }, [state]);

  const activeEventDef = useMemo(() => {
    if (!state.activeEvent) return null;
    const def = ZH_SKY_EVENTS.find(e => e.id === state.activeEvent);
    return def ?? null;
  }, [state]);

  const feathersAtCurrentSanctuary = useMemo(() => {
    return ZH_FEATHERS.filter(f => f.requiredSanctuary === null || f.requiredSanctuary === state.currentSanctuary);
  }, [state]);

  const featherInventoryList = useMemo(() => {
    return Object.values(state.feathers)
      .filter(f => f.owned)
      .map(f => {
        const def = ZH_FEATHERS.find(fe => fe.id === f.featherId);
        return { ...f, def };
      });
  }, [state]);

  const spiritsByRarity = useMemo(() => {
    const result: Record<string, typeof ZH_SPIRITS[number][]> = {};
    for (const r of ZH_RARITY_DEFS) {
      result[r.key] = ZH_SPIRITS.filter(s => s.rarity === r.key);
    }
    return result;
  }, []);

  const feathersByRarity = useMemo(() => {
    const result: Record<string, typeof ZH_FEATHERS[number][]> = {};
    for (const r of ZH_RARITY_DEFS) {
      result[r.key] = ZH_FEATHERS.filter(f => f.rarity === r.key);
    }
    return result;
  }, []);

  const sanctuaryProgression = useMemo(() => {
    return ZH_SANCTUARIES.map(def => {
      const visitState = state.sanctuaries[def.id];
      return {
        id: def.id,
        name: def.name,
        icon: def.icon,
        elevation: def.elevation,
        visited: visitState?.visited ?? false,
        visitsCount: visitState?.visitsCount ?? 0,
        isCurrent: state.currentSanctuary === def.id,
        unlocked: state.altitudeReached >= def.unlockAltitude,
      };
    });
  }, [state]);

  const altitudeProgress = useMemo(() => {
    return {
      current: state.altitudeReached,
      max: ZH_MAX_ALTITUDE,
      percent: Math.floor((state.altitudeReached / ZH_MAX_ALTITUDE) * 100),
      nextSanctuary: ZH_SANCTUARIES.find(s => s.unlockAltitude > state.altitudeReached),
    };
  }, [state]);

  const totalWindPowerRating = useMemo(() => {
    let total = 0;
    for (const f of Object.values(state.feathers)) {
      if (f.owned) {
        const def = ZH_FEATHERS.find(fe => fe.id === f.featherId);
        if (def) {
          total += def.windPower + f.upgrades * 2;
        }
      }
    }
    return total;
  }, [state]);

  const totalWisdomBoostRating = useMemo(() => {
    let total = 0;
    for (const f of Object.values(state.feathers)) {
      if (f.owned) {
        const def = ZH_FEATHERS.find(fe => fe.id === f.featherId);
        if (def) {
          total += def.wisdomBoost + f.upgrades;
        }
      }
    }
    return total;
  }, [state]);

  const availableBirdMounts = useMemo(() => {
    return ZH_BIRD_MOUNTS.filter(m => state.altitudeReached >= m.altitude);
  }, [state]);

  const availableCloudRoutes = useMemo(() => {
    return ZH_CLOUD_ROUTES.filter(r => {
      const fromSanctuary = ZH_SANCTUARIES.find(s => s.id === r.fromSanctuary);
      if (!fromSanctuary) return false;
      if (state.altitudeReached < fromSanctuary.unlockAltitude) return false;
      return true;
    });
  }, [state]);

  const spiritsByWindType = useMemo(() => {
    const result: Record<string, typeof ZH_SPIRITS[number][]> = {};
    for (const wt of ZH_WIND_TYPE_DEFS) {
      result[wt.type] = ZH_SPIRITS.filter(s => s.windType === wt.type);
    }
    return result;
  }, []);

  const activeSummoningProgress = useMemo(() => {
    const entries = Object.entries(state.summonProgress).filter(([, p]) => p.startedAt !== null && !p.completed);
    if (entries.length === 0) return null;
    const [id, prog] = entries[0];
    const def = ZH_SPIRITS.find(s => s.id === id);
    return { spiritId: id, progress: prog.progress, maxProgress: prog.maxProgress, def };
  }, [state]);

  const equippedFeather = useMemo(() => {
    for (const f of Object.values(state.feathers)) {
      if (f.equipped) {
        const def = ZH_FEATHERS.find(fe => fe.id === f.featherId);
        if (def) return { ...f, def };
      }
    }
    return null;
  }, [state]);

  const totalBondStrength = useMemo(() => {
    let total = 0;
    for (const sp of Object.values(state.spirits)) {
      if (sp.summoned) {
        total += sp.bondStrength;
      }
    }
    return total;
  }, [state]);

  const currentSanctuaryDef = useMemo(() => {
    return ZH_SANCTUARIES.find(s => s.id === state.currentSanctuary) ?? ZH_SANCTUARIES[0];
  }, [state]);

  const dailyTaskProgress = useMemo(() => {
    const task = state.dailyTask;
    return {
      spiritsSummoned: { current: task.spiritsSummoned, target: 3 },
      sanctuariesExplored: { current: task.sanctuariesExplored, target: 2 },
      windsChanneled: { current: task.windsChanneled, target: 1 },
      structuresUpgraded: { current: task.structuresUpgraded, target: 1 },
      abilitiesActivated: { current: task.abilitiesActivated, target: 1 },
      feathersCollected: { current: task.feathersCollected, target: 2 },
      stormsTamed: { current: task.stormsTamed, target: 1 },
      cloudsSurfed: { current: task.cloudsSurfed, target: 1 },
      overallComplete: task.isComplete,
      rewardClaimed: task.rewardClaimed,
    };
  }, [state]);

  const windChannelRank = useMemo(() => {
    const depth = state.maxWindChannel;
    if (depth >= 100) return { rank: 'Wind Deity', icon: '🌟', color: ZH_THEME_COLORS.featherGold };
    if (depth >= 80) return { rank: 'Sky Sage', icon: '🧘', color: ZH_THEME_COLORS.sunsetPink };
    if (depth >= 60) return { rank: 'Storm Listener', icon: '⛈️', color: ZH_THEME_COLORS.stormGray };
    if (depth >= 40) return { rank: 'Gale Master', icon: '💨', color: ZH_THEME_COLORS.skyBlue };
    if (depth >= 20) return { rank: 'Breeze Apprentice', icon: '🌬️', color: ZH_THEME_COLORS.mistAqua };
    if (depth >= 10) return { rank: 'Wind Student', icon: '🍃', color: ZH_THEME_COLORS.cloudSilver };
    return { rank: 'Silent Listener', icon: '🤫', color: ZH_THEME_COLORS.windWhite };
  }, [state]);

  const structuresByTier = useMemo(() => {
    const tiers: Record<number, typeof ZH_STRUCTURES[number][]> = {};
    for (const s of ZH_STRUCTURES) {
      if (!tiers[s.tier]) tiers[s.tier] = [];
      tiers[s.tier].push(s);
    }
    return tiers;
  }, []);

  const eventTimeRemaining = useMemo(() => {
    if (!state.eventEndTime) return null;
    const remaining = state.eventEndTime - Date.now();
    if (remaining <= 0) return null;
    const hours = Math.floor(remaining / 3600_000);
    const minutes = Math.floor((remaining % 3600_000) / 60_000);
    return { totalMs: remaining, hours, minutes, display: `${hours}h ${minutes}m` };
  }, [state]);

  const recentEventHistory = useMemo(() => {
    return [...state.eventHistory].reverse().slice(0, 5);
  }, [state]);

  const spiritCollectionCompletion = useMemo(() => {
    const total = ZH_SPIRITS.length;
    const summonable = ZH_SPIRITS.filter(s => s.canSummon).length;
    const summoned = Object.values(state.spirits).filter(s => s.summoned).length;
    return {
      total,
      summonable,
      nonSummonable: total - summonable,
      summoned,
      percent: Math.floor((summoned / total) * 100),
    };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    state,
    // Actions
    summonSpirit,
    exploreSanctuary,
    upgradeStructure,
    activateAbility,
    channelWind,
    trainStormTaming,
    surfClouds,
    collectFeather,
    equipFeather,
    feedSpirit,
    collectStructureIncome,
    unlockAbility,
    startSkyEvent,
    checkEventExpiry,
    getEventMultiplier,
    claimDailyReward,
    nicknameSpirit,
    checkAchievements,
    grantWisdom,
    grantReputation,
    // Queries
    getTitle,
    getProgress,
    getStats,
    getUpgradeCost,
    // Computed
    titleMultiplier,
    sanctuarySpirits,
    availableSanctuaries,
    structureSummary,
    abilitySummary,
    achievementSummary,
    dailyWisdomIncome,
    dailyReputationIncome,
    summonedSpiritsList,
    activeSummonList,
    nextTitle,
    isDailyTaskComplete,
    unlockedSanctuariesCount,
    stormTamingXpToNext,
    stormTamingXpProgress,
    activeEventDef,
    feathersAtCurrentSanctuary,
    featherInventoryList,
    spiritsByRarity,
    feathersByRarity,
    sanctuaryProgression,
    altitudeProgress,
    totalWindPowerRating,
    totalWisdomBoostRating,
    availableBirdMounts,
    availableCloudRoutes,
    spiritsByWindType,
    activeSummoningProgress,
    equippedFeather,
    totalBondStrength,
    currentSanctuaryDef,
    dailyTaskProgress,
    windChannelRank,
    structuresByTier,
    eventTimeRemaining,
    recentEventHistory,
    spiritCollectionCompletion,
  };
}
