import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Thunder Nest (风暴鹰巢) — Word Snake Wire Module
// ───────────────────────────────────────────────────────────────────────────────
// A Storm Eagle Aerie simulation where 10 majestic eagle species soar above
// mountain peaks, train through tempests, hunt prey, defend territory against
// 4 rival clans, earn achievements, and rise through 50 Eagle Master ranks.
// Daily storm patrols keep the skies alive with thunder.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Storage Key ─────────────────────────────────────────────────────────────

const TN_STORAGE_KEY = 'ws_thunder_nest';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type TNEagleElement =
  | 'thunder'
  | 'storm'
  | 'gale'
  | 'lightning'
  | 'tempest'
  | 'cyclone'
  | 'hail'
  | 'blizzard'
  | 'monsoon'
  | 'vortex';

export type TNWeatherType =
  | 'clear_sky'
  | 'light_rain'
  | 'thunderstorm'
  | 'hailstorm'
  | 'blizzard'
  | 'tornado'
  | 'monsoon'
  | 'solar_flare';

export type TNTrainingType =
  | 'wind_tunnel'
  | 'storm_dive'
  | 'prey_chase'
  | 'aerial_combat'
  | 'endurance_flight'
  | 'precision_strike';

export type TNRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type TNRankTier = 'fledgling' | 'skyrider' | 'stormlord' | 'thundergod' | 'eagle_sovereign';

export interface TNEagleSpeciesDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly element: TNEagleElement;
  readonly rarity: TNRarity;
  readonly baseSpeed: number;
  readonly baseStrength: number;
  readonly baseVision: number;
  readonly baseEndurance: number;
  readonly baseAgility: number;
  readonly description: string;
  readonly lore: string;
  readonly icon: string;
}

export interface TNNestLocationDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly mountain: string;
  readonly elevation: number;
  readonly description: string;
  readonly icon: string;
  readonly unlockRank: number;
  readonly comfortBonus: number;
  readonly capacity: number;
}

export interface TNWeatherDef {
  readonly id: TNWeatherType;
  readonly name: string;
  readonly nameZh: string;
  readonly description: string;
  readonly icon: string;
  readonly speedMod: number;
  readonly strengthMod: number;
  readonly visionMod: number;
  readonly enduranceMod: number;
  readonly agilityMod: number;
  readonly dangerLevel: number;
}

export interface TNTrainingDef {
  readonly id: TNTrainingType;
  readonly name: string;
  readonly nameZh: string;
  readonly description: string;
  readonly icon: string;
  readonly primaryStat: string;
  readonly secondaryStat: string;
  readonly baseXpGain: number;
  readonly durationMinutes: number;
  readonly energyCost: number;
}

export interface TNPreyDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly description: string;
  readonly icon: string;
  readonly difficulty: number;
  readonly rewardXp: number;
  readonly rewardGold: number;
  readonly requiredVision: number;
  readonly requiredSpeed: number;
  readonly fleeChance: number;
}

export interface TNRivalClanDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly description: string;
  readonly icon: string;
  readonly aggression: number;
  readonly territoryStrength: number;
  readonly preferredWeather: TNWeatherType;
  readonly scoutSpeed: number;
  readonly attackPower: number;
  readonly defensePower: number;
}

export interface TNAchievementDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly description: string;
  readonly icon: string;
  readonly condition: string;
  readonly rewardXp: number;
  readonly rewardGold: number;
}

export interface TNRankDef {
  readonly rank: number;
  readonly title: string;
  readonly titleZh: string;
  readonly tier: TNRankTier;
  readonly requiredXp: number;
  readonly description: string;
  readonly icon: string;
  readonly bonuses: TNRankBonuses;
}

export interface TNRankBonuses {
  readonly nestCapacity: number;
  readonly trainingEfficiency: number;
  readonly huntBonus: number;
  readonly defenseBonus: number;
  readonly goldMultiplier: number;
}

export interface TNStormPatrolDef {
  readonly id: string;
  readonly name: string;
  readonly nameZh: string;
  readonly description: string;
  readonly icon: string;
  readonly difficulty: number;
  readonly requiredRank: number;
  readonly rewardXp: number;
  readonly rewardGold: number;
  readonly encounterCount: number;
  readonly weatherPreference: TNWeatherType[];
}

export interface TNEagleInstance {
  readonly id: string;
  speciesId: string;
  nickname: string;
  level: number;
  xp: number;
  speed: number;
  strength: number;
  vision: number;
  endurance: number;
  agility: number;
  energy: number;
  maxEnergy: number;
  health: number;
  maxHealth: number;
  bondLevel: number;
  huntCount: number;
  trainingCount: number;
  battleCount: number;
  patrolCount: number;
}

export interface TNTrainingSession {
  readonly id: string;
  eagleId: string;
  trainingType: TNTrainingType;
  startTime: number;
  completed: boolean;
  xpGained: number;
}

export interface TNHuntResult {
  readonly preyId: string;
  readonly eagleId: string;
  readonly success: boolean;
  readonly xpGained: number;
  readonly goldGained: number;
  readonly timestamp: number;
}

export interface TNDefenseBattle {
  readonly id: string;
  readonly clanId: string;
  readonly eagleId: string;
  readonly timestamp: number;
  readonly victory: boolean;
  readonly xpGained: number;
  readonly goldGained: number;
  readonly territoryLost: number;
}

export interface TNStormPatrolResult {
  readonly id: string;
  readonly patrolDefId: string;
  readonly eagleId: string;
  readonly completed: boolean;
  readonly encountersWon: number;
  readonly encountersTotal: number;
  readonly xpGained: number;
  readonly goldGained: number;
  readonly timestamp: number;
}

export interface TNEventLog {
  readonly id: string;
  readonly type: string;
  readonly message: string;
  readonly messageZh: string;
  readonly timestamp: number;
}

export interface TNThunderNestState {
  eagles: TNEagleInstance[];
  activeNestId: string;
  currentWeather: TNWeatherType;
  weatherTimer: number;
  totalXp: number;
  totalGold: number;
  currentRank: number;
  achievements: string[];
  trainingSessions: TNTrainingSession[];
  huntHistory: TNHuntResult[];
  defenseHistory: TNDefenseBattle[];
  patrolHistory: TNStormPatrolResult[];
  dailyPatrolDone: boolean;
  dailyPatrolDate: string;
  territoryStrength: number;
  eventLog: TNEventLog[];
  totalPreyHunted: number;
  totalBattlesWon: number;
  totalPatrolsCompleted: number;
  totalTrainingSessions: number;
  totalEaglesOwned: number;
  highestEagleLevel: number;
  rivalDefeatCounts: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_COLOR_THUNDER = '#FFD700';
export const TN_COLOR_STORM = '#708090';
export const TN_COLOR_GALE = '#87CEEB';
export const TN_COLOR_LIGHTNING = '#FFFF00';
export const TN_COLOR_TEMPEST = '#8B0000';
export const TN_COLOR_CYCLONE = '#4169E1';
export const TN_COLOR_HAIL = '#B0E0E6';
export const TN_COLOR_BLIZZARD = '#F0F8FF';
export const TN_COLOR_MONSOON = '#2E8B57';
export const TN_COLOR_VORTEX = '#9400D3';

const TN_ELEMENT_COLORS: Record<TNEagleElement, string> = {
  thunder: TN_COLOR_THUNDER,
  storm: TN_COLOR_STORM,
  gale: TN_COLOR_GALE,
  lightning: TN_COLOR_LIGHTNING,
  tempest: TN_COLOR_TEMPEST,
  cyclone: TN_COLOR_CYCLONE,
  hail: TN_COLOR_HAIL,
  blizzard: TN_COLOR_BLIZZARD,
  monsoon: TN_COLOR_MONSOON,
  vortex: TN_COLOR_VORTEX,
};

const TN_RARITY_COLORS: Record<TNRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#4ADE80',
  rare: '#60A5FA',
  epic: '#C084FC',
  legendary: '#FFD700',
};

const TN_RARITY_LABELS: Record<TNRarity, { en: string; zh: string }> = {
  common: { en: 'Common', zh: '普通' },
  uncommon: { en: 'Uncommon', zh: '优良' },
  rare: { en: 'Rare', zh: '稀有' },
  epic: { en: 'Epic', zh: '史诗' },
  legendary: { en: 'Legendary', zh: '传说' },
};

const TN_TIER_COLORS: Record<TNRankTier, string> = {
  fledgling: '#9CA3AF',
  skyrider: '#60A5FA',
  stormlord: '#C084FC',
  thundergod: '#FFD700',
  eagle_sovereign: '#FF4500',
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: EAGLE SPECIES (10 with 5 stats each)
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_EAGLE_SPECIES: readonly TNEagleSpeciesDef[] = [
  {
    id: 'eagle_thunder_crest',
    name: 'Thunder Crest Eagle',
    nameZh: '雷冠鹰',
    element: 'thunder',
    rarity: 'common',
    baseSpeed: 65,
    baseStrength: 55,
    baseVision: 70,
    baseEndurance: 50,
    baseAgility: 60,
    description: 'A majestic eagle whose crest glows with captured thunder, warning all prey of its arrival',
    lore: 'The Thunder Crest is born during the first thunderstorm of spring. Mountain villagers believe its cry summons rain.',
    icon: '🦅',
  },
  {
    id: 'eagle_storm_wing',
    name: 'Storm Wing Eagle',
    nameZh: '风暴翼鹰',
    element: 'storm',
    rarity: 'common',
    baseSpeed: 70,
    baseStrength: 50,
    baseVision: 65,
    baseEndurance: 55,
    baseAgility: 65,
    description: 'A swift eagle that rides storm fronts, gliding effortlessly through turbulence',
    lore: 'Storm Wings are the messengers of the sky. They never land during rain, preferring to dance among the clouds.',
    icon: '🦅',
  },
  {
    id: 'eagle_gale_talon',
    name: 'Gale Talon Eagle',
    nameZh: '烈风爪鹰',
    element: 'gale',
    rarity: 'uncommon',
    baseSpeed: 80,
    baseStrength: 60,
    baseVision: 60,
    baseEndurance: 55,
    baseAgility: 75,
    description: 'An exceptionally fast eagle whose talons cut through air like blades, creating micro-gales',
    lore: 'The Gale Talon can accelerate from perch to hunting speed in under a second. Its dive creates a sonic boom.',
    icon: '🦅',
  },
  {
    id: 'eagle_lightning_strike',
    name: 'Lightning Strike Eagle',
    nameZh: '闪电击鹰',
    element: 'lightning',
    rarity: 'uncommon',
    baseSpeed: 75,
    baseStrength: 70,
    baseVision: 75,
    baseEndurance: 45,
    baseAgility: 70,
    description: 'A brilliant eagle crackling with static electricity that arcs between its feather tips',
    lore: 'When a Lightning Strike dives, it becomes a living bolt of electricity. Prey is stunned before impact.',
    icon: '🦅',
  },
  {
    id: 'eagle_tempest_lord',
    name: 'Tempest Lord Eagle',
    nameZh: '暴风君主鹰',
    element: 'tempest',
    rarity: 'rare',
    baseSpeed: 60,
    baseStrength: 85,
    baseVision: 70,
    baseEndurance: 80,
    baseAgility: 55,
    description: 'A massive war-eagle that commands entire tempests, bending weather to its will',
    lore: 'The Tempest Lord is said to be the avatar of an ancient sky god. Whole armies have retreated at its shadow.',
    icon: '🦅',
  },
  {
    id: 'eagle_cyclone_dancer',
    name: 'Cyclone Dancer Eagle',
    nameZh: '旋风舞者鹰',
    element: 'cyclone',
    rarity: 'rare',
    baseSpeed: 90,
    baseStrength: 55,
    baseVision: 65,
    baseEndurance: 50,
    baseAgility: 90,
    description: 'A mesmerizing eagle that spins through cyclones with impossible grace and precision',
    lore: 'The Cyclone Dancer nests inside active tornadoes. It is the only creature that can navigate a funnel cloud.',
    icon: '🦅',
  },
  {
    id: 'eagle_hail_fortress',
    name: 'Hail Fortress Eagle',
    nameZh: '冰雹堡垒鹰',
    element: 'hail',
    rarity: 'rare',
    baseSpeed: 50,
    baseStrength: 90,
    baseVision: 55,
    baseEndurance: 95,
    baseAgility: 40,
    description: 'A heavily armored eagle with scales that deflect hailstones, built like a flying fortress',
    lore: 'The Hail Fortress is the only eagle that can fly through the most violent hailstorms unscathed.',
    icon: '🦅',
  },
  {
    id: 'eagle_blizzard_sovereign',
    name: 'Blizzard Sovereign Eagle',
    nameZh: '暴雪至尊鹰',
    element: 'blizzard',
    rarity: 'epic',
    baseSpeed: 55,
    baseStrength: 80,
    baseVision: 90,
    baseEndurance: 85,
    baseAgility: 50,
    description: 'A supreme eagle that rules over eternal blizzards, seeing through whiteout conditions',
    lore: 'The Blizzard Sovereign never loses its prey. Its vision pierces through the thickest snowstorm.',
    icon: '🦅',
  },
  {
    id: 'eagle_monsoon_emperor',
    name: 'Monsoon Emperor Eagle',
    nameZh: '季风帝鹰',
    element: 'monsoon',
    rarity: 'epic',
    baseSpeed: 70,
    baseStrength: 85,
    baseVision: 75,
    baseEndurance: 90,
    baseAgility: 70,
    description: 'An imperial eagle that commands the seasonal monsoons, ruling vast territories',
    lore: 'The Monsoon Emperor marks its territory with perpetual rain. Where it nests, rice grows without irrigation.',
    icon: '🦅',
  },
  {
    id: 'eagle_vortex_origin',
    name: 'Vortex Origin Eagle',
    nameZh: '涡流起源鹰',
    element: 'vortex',
    rarity: 'legendary',
    baseSpeed: 95,
    baseStrength: 95,
    baseVision: 95,
    baseEndurance: 90,
    baseAgility: 95,
    description: 'The mythical first eagle, born from the primordial vortex that created the atmosphere itself',
    lore: 'The Vortex Origin predates all weather. Every storm, every breeze, every gust of wind is but a whisper of its wings.',
    icon: '🦅',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: NEST LOCATIONS (8 mountain peaks)
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_NEST_LOCATIONS: readonly TNNestLocationDef[] = [
  {
    id: 'nest_thunder_peak',
    name: 'Thunder Peak Aerie',
    nameZh: '雷峰鹰巢',
    mountain: 'Mount Kaelen',
    elevation: 4200,
    description: 'A craggy peak perpetually struck by lightning, forming a natural electrified nest',
    icon: '⛰️',
    unlockRank: 1,
    comfortBonus: 10,
    capacity: 3,
  },
  {
    id: 'nest_storm_crag',
    name: 'Storm Crag Roost',
    nameZh: '风暴崖栖所',
    mountain: 'Stormcrag Range',
    elevation: 3800,
    description: 'Wind-carved crags offering natural shelter from the fiercest gales',
    icon: '🏔️',
    unlockRank: 3,
    comfortBonus: 12,
    capacity: 4,
  },
  {
    id: 'nest_gale_pass',
    name: 'Gale Pass Eyrie',
    nameZh: '烈风口鹰巢',
    mountain: 'Windshear Pass',
    elevation: 4500,
    description: 'A high-altitude pass where constant gales create natural updrafts for easy takeoff',
    icon: '💨',
    unlockRank: 6,
    comfortBonus: 15,
    capacity: 4,
  },
  {
    id: 'nest_lightning_spire',
    name: 'Lightning Spire Nest',
    nameZh: '闪电尖塔巢',
    mountain: 'Voltspire Pinnacle',
    elevation: 5100,
    description: 'A metallic mineral spire that attracts and channels lightning safely into nesting chambers',
    icon: '🗼',
    unlockRank: 10,
    comfortBonus: 18,
    capacity: 5,
  },
  {
    id: 'nest_tempest_bowl',
    name: 'Tempest Bowl Sanctuary',
    nameZh: '暴风碗圣所',
    mountain: 'Cyclone Caldera',
    elevation: 3600,
    description: 'A volcanic caldera where trapped warm air creates a permanent micro-climate perfect for eagles',
    icon: '🌋',
    unlockRank: 15,
    comfortBonus: 20,
    capacity: 5,
  },
  {
    id: 'nest_cyclone_summit',
    name: 'Cyclone Summit Perch',
    nameZh: '旋风峰顶栖息地',
    mountain: 'Vortex Crown',
    elevation: 5800,
    description: 'The highest known eagle nest, positioned in the calm eye of a permanent cyclone',
    icon: '🌀',
    unlockRank: 20,
    comfortBonus: 25,
    capacity: 6,
  },
  {
    id: 'nest_hail_fortress',
    name: 'Hailstone Fortress Roost',
    nameZh: '冰雹堡垒栖息地',
    mountain: 'Granite Bastion',
    elevation: 4700,
    description: 'A fortress-like formation of granite pillars that shield eagles from the harshest hail',
    icon: '🏰',
    unlockRank: 28,
    comfortBonus: 28,
    capacity: 6,
  },
  {
    id: 'nest_monsoon_throne',
    name: 'Monsoon Throne Eyrie',
    nameZh: '季风王座鹰巢',
    mountain: 'Cloudrest Summit',
    elevation: 6200,
    description: 'The legendary highest nest of all, above the clouds, where only the greatest eagles reside',
    icon: '👑',
    unlockRank: 35,
    comfortBonus: 35,
    capacity: 8,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: WEATHER TYPES (8 affecting eagle performance)
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_WEATHER_TYPES: readonly TNWeatherDef[] = [
  {
    id: 'clear_sky',
    name: 'Clear Sky',
    nameZh: '晴空',
    description: 'Perfect flying conditions with unlimited visibility and gentle winds',
    icon: '☀️',
    speedMod: 1.0,
    strengthMod: 1.0,
    visionMod: 1.2,
    enduranceMod: 1.1,
    agilityMod: 1.0,
    dangerLevel: 1,
  },
  {
    id: 'light_rain',
    name: 'Light Rain',
    nameZh: '小雨',
    description: 'Gentle rain that slightly hinders vision but cools eagles for longer flights',
    icon: '🌦️',
    speedMod: 0.95,
    strengthMod: 1.0,
    visionMod: 0.9,
    enduranceMod: 1.15,
    agilityMod: 0.95,
    dangerLevel: 2,
  },
  {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    nameZh: '雷暴',
    description: 'A fierce electrical storm that empowers thunder eagles but threatens others',
    icon: '⛈️',
    speedMod: 0.85,
    strengthMod: 1.2,
    visionMod: 0.7,
    enduranceMod: 0.9,
    agilityMod: 0.8,
    dangerLevel: 5,
  },
  {
    id: 'hailstorm',
    name: 'Hailstorm',
    nameZh: '冰雹暴',
    description: 'Battering hailstones test the endurance and armor of every eagle in flight',
    icon: '🌨️',
    speedMod: 0.7,
    strengthMod: 1.1,
    visionMod: 0.6,
    enduranceMod: 0.7,
    agilityMod: 0.75,
    dangerLevel: 7,
  },
  {
    id: 'blizzard',
    name: 'Blizzard',
    nameZh: '暴风雪',
    description: 'Near-zero visibility and freezing winds that only the hardiest eagles can withstand',
    icon: '❄️',
    speedMod: 0.6,
    strengthMod: 0.9,
    visionMod: 0.3,
    enduranceMod: 0.6,
    agilityMod: 0.65,
    dangerLevel: 8,
  },
  {
    id: 'tornado',
    name: 'Tornado',
    nameZh: '龙卷风',
    description: 'A devastating funnel of wind that is extremely dangerous but offers massive power to cyclone eagles',
    icon: '🌪️',
    speedMod: 0.5,
    strengthMod: 1.4,
    visionMod: 0.4,
    enduranceMod: 0.5,
    agilityMod: 1.3,
    dangerLevel: 9,
  },
  {
    id: 'monsoon',
    name: 'Monsoon',
    nameZh: '季风',
    description: 'Heavy seasonal rains and powerful winds that monsoon eagles thrive in',
    icon: '🌧️',
    speedMod: 0.8,
    strengthMod: 1.15,
    visionMod: 0.65,
    enduranceMod: 1.2,
    agilityMod: 0.85,
    dangerLevel: 6,
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    nameZh: '太阳耀斑',
    description: 'Intense solar radiation that blinds and exhausts but empowers the most ancient eagles',
    icon: '🌞',
    speedMod: 0.9,
    strengthMod: 1.3,
    visionMod: 0.2,
    enduranceMod: 0.8,
    agilityMod: 0.9,
    dangerLevel: 10,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: TRAINING TYPES (6)
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_TRAINING_TYPES: readonly TNTrainingDef[] = [
  {
    id: 'wind_tunnel',
    name: 'Wind Tunnel Training',
    nameZh: '风洞训练',
    description: 'Eagles fly through artificial wind tunnels of increasing intensity to build raw speed',
    icon: '💨',
    primaryStat: 'speed',
    secondaryStat: 'agility',
    baseXpGain: 25,
    durationMinutes: 15,
    energyCost: 20,
  },
  {
    id: 'storm_dive',
    name: 'Storm Dive Practice',
    nameZh: '暴风俯冲练习',
    description: 'Eagles dive through real storms to build courage and raw striking power',
    icon: '⚡',
    primaryStat: 'strength',
    secondaryStat: 'speed',
    baseXpGain: 30,
    durationMinutes: 20,
    energyCost: 25,
  },
  {
    id: 'prey_chase',
    name: 'Prey Chase Drill',
    nameZh: '追猎训练',
    description: 'Eagles practice pursuit of mechanized prey dummies across mountain terrain',
    icon: '🎯',
    primaryStat: 'vision',
    secondaryStat: 'speed',
    baseXpGain: 20,
    durationMinutes: 10,
    energyCost: 15,
  },
  {
    id: 'aerial_combat',
    name: 'Aerial Combat Sparring',
    nameZh: '空中格斗训练',
    description: 'Controlled aerial combat between paired eagles to sharpen reflexes and attack power',
    icon: '⚔️',
    primaryStat: 'agility',
    secondaryStat: 'strength',
    baseXpGain: 35,
    durationMinutes: 25,
    energyCost: 30,
  },
  {
    id: 'endurance_flight',
    name: 'Endurance Marathon Flight',
    nameZh: '耐力马拉松飞行',
    description: 'Long-distance flights across mountain ranges to build stamina and resilience',
    icon: '🏔️',
    primaryStat: 'endurance',
    secondaryStat: 'vision',
    baseXpGain: 28,
    durationMinutes: 30,
    energyCost: 35,
  },
  {
    id: 'precision_strike',
    name: 'Precision Strike Training',
    nameZh: '精准打击训练',
    description: 'Targeted strikes on moving objects to perfect accuracy and timing',
    icon: '🎯',
    primaryStat: 'vision',
    secondaryStat: 'agility',
    baseXpGain: 22,
    durationMinutes: 12,
    energyCost: 18,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: PREY TYPES (12)
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_PREY_TYPES: readonly TNPreyDef[] = [
  {
    id: 'prey_mountain_hare',
    name: 'Mountain Hare',
    nameZh: '高山野兔',
    description: 'A swift snow-white hare that zigzags down rocky slopes at incredible speed',
    icon: '🐇',
    difficulty: 1,
    rewardXp: 15,
    rewardGold: 10,
    requiredVision: 20,
    requiredSpeed: 25,
    fleeChance: 0.3,
  },
  {
    id: 'prey_pine_marten',
    name: 'Pine Marten',
    nameZh: '松貂',
    description: 'An agile tree-climber that leaps between branches to evade aerial predators',
    icon: '🐿️',
    difficulty: 2,
    rewardXp: 22,
    rewardGold: 18,
    requiredVision: 30,
    requiredSpeed: 35,
    fleeChance: 0.35,
  },
  {
    id: 'prey_alpine_marmot',
    name: 'Alpine Marmot',
    nameZh: '阿尔卑斯旱獭',
    description: 'A chubby rodent that dives into burrows at the first sign of shadow overhead',
    icon: '🐹',
    difficulty: 2,
    rewardXp: 20,
    rewardGold: 15,
    requiredVision: 25,
    requiredSpeed: 20,
    fleeChance: 0.5,
  },
  {
    id: 'prey_snow_grouse',
    name: 'Snow Grouse',
    nameZh: '雪松鸡',
    description: 'A camouflaged bird that explodes into flight when startled, confusing predators',
    icon: '🐦',
    difficulty: 3,
    rewardXp: 28,
    rewardGold: 22,
    requiredVision: 45,
    requiredSpeed: 40,
    fleeChance: 0.4,
  },
  {
    id: 'prey_mountain_goat',
    name: 'Mountain Goat Kid',
    nameZh: '高山山羊幼崽',
    description: 'A young goat on impossibly narrow cliff ledges, difficult to approach without being seen',
    icon: '🐐',
    difficulty: 3,
    rewardXp: 32,
    rewardGold: 25,
    requiredVision: 40,
    requiredSpeed: 45,
    fleeChance: 0.25,
  },
  {
    id: 'prey_storm_hawk',
    name: 'Storm Hawk',
    nameZh: '暴风鹰',
    description: 'A rival raptor that fights back fiercely when challenged in the air',
    icon: '🦅',
    difficulty: 4,
    rewardXp: 45,
    rewardGold: 35,
    requiredVision: 50,
    requiredSpeed: 55,
    fleeChance: 0.1,
  },
  {
    id: 'prey_cloud_fox',
    name: 'Cloud Fox',
    nameZh: '云狐',
    description: 'A mystical fox that can become partially invisible in mist and fog',
    icon: '🦊',
    difficulty: 4,
    rewardXp: 50,
    rewardGold: 40,
    requiredVision: 60,
    requiredSpeed: 50,
    fleeChance: 0.45,
  },
  {
    id: 'prey_thunder_wolf',
    name: 'Thunder Wolf',
    nameZh: '雷狼',
    description: 'A massive wolf that hunts in packs and can summon minor electrical discharges',
    icon: '🐺',
    difficulty: 5,
    rewardXp: 65,
    rewardGold: 55,
    requiredVision: 55,
    requiredSpeed: 60,
    fleeChance: 0.15,
  },
  {
    id: 'prey_ice_dragonet',
    name: 'Ice Dragonet',
    nameZh: '冰幼龙',
    description: 'A juvenile ice dragon, dangerous prey that freezes anything that approaches',
    icon: '🐉',
    difficulty: 6,
    rewardXp: 85,
    rewardGold: 70,
    requiredVision: 65,
    requiredSpeed: 65,
    fleeChance: 0.05,
  },
  {
    id: 'prey_wind_serpent',
    name: 'Wind Serpent',
    nameZh: '风蛇',
    description: 'A flying serpent that rides wind currents faster than any eagle can dive',
    icon: '🐍',
    difficulty: 7,
    rewardXp: 100,
    rewardGold: 85,
    requiredVision: 70,
    requiredSpeed: 80,
    fleeChance: 0.5,
  },
  {
    id: 'prey_storm_giant',
    name: 'Storm Giant',
    nameZh: '风暴巨人',
    description: 'A colossal giant made of living storm clouds, the ultimate aerial challenge',
    icon: '👹',
    difficulty: 8,
    rewardXp: 150,
    rewardGold: 130,
    requiredVision: 80,
    requiredSpeed: 70,
    fleeChance: 0.0,
  },
  {
    id: 'prey_sky_leviathan',
    name: 'Sky Leviathan',
    nameZh: '天空利维坦',
    description: 'A legendary beast of the upper atmosphere, rarely seen and nearly impossible to defeat',
    icon: '🌌',
    difficulty: 10,
    rewardXp: 300,
    rewardGold: 250,
    requiredVision: 90,
    requiredSpeed: 90,
    fleeChance: 0.0,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: RIVAL CLANS (4)
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_RIVAL_CLANS: readonly TNRivalClanDef[] = [
  {
    id: 'clan_iron_talon',
    name: 'Iron Talon Clan',
    nameZh: '铁爪氏族',
    description: 'A brutal clan of war eagles that value strength above all else',
    icon: '🦴',
    aggression: 7,
    territoryStrength: 60,
    preferredWeather: 'thunderstorm',
    scoutSpeed: 50,
    attackPower: 75,
    defensePower: 65,
  },
  {
    id: 'clan_shadow_wing',
    name: 'Shadow Wing Syndicate',
    nameZh: '暗翼辛迪加',
    description: 'A stealthy clan that strikes from darkness and steals territories silently',
    icon: '🌑',
    aggression: 5,
    territoryStrength: 50,
    preferredWeather: 'blizzard',
    scoutSpeed: 80,
    attackPower: 60,
    defensePower: 50,
  },
  {
    id: 'clan_fire_storm',
    name: 'Fire Storm Brotherhood',
    nameZh: '烈焰风暴兄弟会',
    description: 'A fanatical brotherhood that harnesses electrical storms for devastating attacks',
    icon: '🔥',
    aggression: 9,
    territoryStrength: 70,
    preferredWeather: 'tornado',
    scoutSpeed: 65,
    attackPower: 85,
    defensePower: 55,
  },
  {
    id: 'clan_ice_crown',
    name: 'Ice Crown Empire',
    nameZh: '冰冠帝国',
    description: 'An ancient empire of eagles that rules the frozen peaks with absolute authority',
    icon: '👑',
    aggression: 4,
    territoryStrength: 80,
    preferredWeather: 'blizzard',
    scoutSpeed: 45,
    attackPower: 70,
    defensePower: 90,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: EAGLE MASTER RANKS (1-50, 5 tiers)
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_RANKS: readonly TNRankDef[] = [
  { rank: 1, title: 'Fledgling Watcher', titleZh: '雏鹰守望者', tier: 'fledgling', requiredXp: 0, description: 'You have taken your first steps on the path of the Eagle Master', icon: '🐣', bonuses: { nestCapacity: 3, trainingEfficiency: 1.0, huntBonus: 1.0, defenseBonus: 1.0, goldMultiplier: 1.0 } },
  { rank: 2, title: 'Nest Attendant', titleZh: '鹰巢助手', tier: 'fledgling', requiredXp: 50, description: 'You help tend the nest and care for young eagles', icon: '🪺', bonuses: { nestCapacity: 3, trainingEfficiency: 1.02, huntBonus: 1.0, defenseBonus: 1.0, goldMultiplier: 1.0 } },
  { rank: 3, title: 'Wind Listener', titleZh: '听风者', tier: 'fledgling', requiredXp: 120, description: 'You can read the wind and predict weather changes', icon: '🌬️', bonuses: { nestCapacity: 3, trainingEfficiency: 1.05, huntBonus: 1.0, defenseBonus: 1.0, goldMultiplier: 1.0 } },
  { rank: 4, title: 'Feather Collector', titleZh: '羽毛收集者', tier: 'fledgling', requiredXp: 200, description: 'Your knowledge of eagle feathers has grown considerably', icon: '🪶', bonuses: { nestCapacity: 4, trainingEfficiency: 1.08, huntBonus: 1.02, defenseBonus: 1.0, goldMultiplier: 1.05 } },
  { rank: 5, title: 'Cliff Climber', titleZh: '攀崖者', tier: 'fledgling', requiredXp: 300, description: 'You scale the highest cliffs to reach remote eyries', icon: '🧗', bonuses: { nestCapacity: 4, trainingEfficiency: 1.1, huntBonus: 1.02, defenseBonus: 1.0, goldMultiplier: 1.05 } },
  { rank: 6, title: 'Cloud Reader', titleZh: '观云者', tier: 'fledgling', requiredXp: 420, description: 'You can forecast storms by watching cloud formations', icon: '☁️', bonuses: { nestCapacity: 4, trainingEfficiency: 1.12, huntBonus: 1.05, defenseBonus: 1.02, goldMultiplier: 1.08 } },
  { rank: 7, title: 'Storm Spotter', titleZh: '风暴观察员', tier: 'fledgling', requiredXp: 560, description: 'You are the first to spot incoming storms on the horizon', icon: '👁️', bonuses: { nestCapacity: 4, trainingEfficiency: 1.15, huntBonus: 1.05, defenseBonus: 1.02, goldMultiplier: 1.08 } },
  { rank: 8, title: 'Ridge Guardian', titleZh: '山脊守护者', tier: 'fledgling', requiredXp: 720, description: 'You guard the mountain ridges against intruders', icon: '🛡️', bonuses: { nestCapacity: 5, trainingEfficiency: 1.18, huntBonus: 1.08, defenseBonus: 1.05, goldMultiplier: 1.1 } },
  { rank: 9, title: 'Gale Rider', titleZh: '烈风骑手', tier: 'fledgling', requiredXp: 900, description: 'You can ride gale-force winds without losing balance', icon: '💨', bonuses: { nestCapacity: 5, trainingEfficiency: 1.2, huntBonus: 1.08, defenseBonus: 1.05, goldMultiplier: 1.1 } },
  { rank: 10, title: 'Fledgling Master', titleZh: '雏鹰大师', tier: 'fledgling', requiredXp: 1100, description: 'You have mastered the basics of eagle husbandry', icon: '🎓', bonuses: { nestCapacity: 5, trainingEfficiency: 1.25, huntBonus: 1.1, defenseBonus: 1.08, goldMultiplier: 1.15 } },
  { rank: 11, title: 'Skyrider Initiate', titleZh: '天空骑手见习', tier: 'skyrider', requiredXp: 1400, description: 'You take your first solo flights alongside your eagles', icon: '✈️', bonuses: { nestCapacity: 5, trainingEfficiency: 1.28, huntBonus: 1.12, defenseBonus: 1.1, goldMultiplier: 1.18 } },
  { rank: 12, title: 'Updraft Surfer', titleZh: '上升气流冲浪者', tier: 'skyrider', requiredXp: 1750, description: 'You master the art of riding thermal updrafts', icon: '🏄', bonuses: { nestCapacity: 5, trainingEfficiency: 1.3, huntBonus: 1.12, defenseBonus: 1.1, goldMultiplier: 1.18 } },
  { rank: 13, title: 'Thunder Scout', titleZh: '雷暴侦察兵', tier: 'skyrider', requiredXp: 2150, description: 'You scout ahead through thunderstorms to find safe paths', icon: '🦅', bonuses: { nestCapacity: 6, trainingEfficiency: 1.33, huntBonus: 1.15, defenseBonus: 1.12, goldMultiplier: 1.2 } },
  { rank: 14, title: 'Storm Herald', titleZh: '风暴先锋', tier: 'skyrider', requiredXp: 2600, description: 'You herald the coming of storms and prepare the nest', icon: '📯', bonuses: { nestCapacity: 6, trainingEfficiency: 1.35, huntBonus: 1.15, defenseBonus: 1.12, goldMultiplier: 1.2 } },
  { rank: 15, title: 'Tempest Navigator', titleZh: '暴风领航员', tier: 'skyrider', requiredXp: 3100, description: 'You navigate through the most violent tempests with ease', icon: '🧭', bonuses: { nestCapacity: 6, trainingEfficiency: 1.38, huntBonus: 1.18, defenseBonus: 1.15, goldMultiplier: 1.22 } },
  { rank: 16, title: 'Wind Commander', titleZh: '风之指挥官', tier: 'skyrider', requiredXp: 3650, description: 'You command small formations of eagles through the skies', icon: '🎖️', bonuses: { nestCapacity: 6, trainingEfficiency: 1.4, huntBonus: 1.18, defenseBonus: 1.15, goldMultiplier: 1.25 } },
  { rank: 17, title: 'Mountain Sentinel', titleZh: '山脉哨兵', tier: 'skyrider', requiredXp: 4250, description: 'You stand watch over the entire mountain range', icon: '🗼', bonuses: { nestCapacity: 7, trainingEfficiency: 1.42, huntBonus: 1.2, defenseBonus: 1.18, goldMultiplier: 1.25 } },
  { rank: 18, title: 'Eagle Whisperer', titleZh: '鹰语者', tier: 'skyrider', requiredXp: 4900, description: 'You understand the language of eagles on a deep level', icon: '🗣️', bonuses: { nestCapacity: 7, trainingEfficiency: 1.45, huntBonus: 1.2, defenseBonus: 1.18, goldMultiplier: 1.28 } },
  { rank: 19, title: 'Aerial Strategist', titleZh: '空中战略家', tier: 'skyrider', requiredXp: 5600, description: 'You develop brilliant strategies for aerial combat and hunting', icon: '♟️', bonuses: { nestCapacity: 7, trainingEfficiency: 1.48, huntBonus: 1.22, defenseBonus: 1.2, goldMultiplier: 1.3 } },
  { rank: 20, title: 'Skyrider Champion', titleZh: '天空骑手冠军', tier: 'skyrider', requiredXp: 6400, description: 'You are the finest skyrider in the mountain region', icon: '🏆', bonuses: { nestCapacity: 7, trainingEfficiency: 1.5, huntBonus: 1.25, defenseBonus: 1.22, goldMultiplier: 1.32 } },
  { rank: 21, title: 'Storm Caller', titleZh: '唤风者', tier: 'stormlord', requiredXp: 7500, description: 'You learn to call storms to aid your eagles in battle', icon: '🌩️', bonuses: { nestCapacity: 7, trainingEfficiency: 1.53, huntBonus: 1.28, defenseBonus: 1.25, goldMultiplier: 1.35 } },
  { rank: 22, title: 'Lightning Tamer', titleZh: '驯雷者', tier: 'stormlord', requiredXp: 8700, description: 'You can tame and redirect lightning strikes', icon: '⚡', bonuses: { nestCapacity: 8, trainingEfficiency: 1.55, huntBonus: 1.28, defenseBonus: 1.25, goldMultiplier: 1.35 } },
  { rank: 23, title: 'Cyclone Dancer', titleZh: '旋风舞者', tier: 'stormlord', requiredXp: 10000, description: 'You dance inside cyclones alongside your eagles', icon: '🌀', bonuses: { nestCapacity: 8, trainingEfficiency: 1.58, huntBonus: 1.3, defenseBonus: 1.28, goldMultiplier: 1.38 } },
  { rank: 24, title: 'Monsoon Commander', titleZh: '季风指挥官', tier: 'stormlord', requiredXp: 11500, description: 'You command the monsoon rains to shape the land', icon: '🌧️', bonuses: { nestCapacity: 8, trainingEfficiency: 1.6, huntBonus: 1.3, defenseBonus: 1.28, goldMultiplier: 1.4 } },
  { rank: 25, title: 'Tempest Sovereign', titleZh: '暴风领主', tier: 'stormlord', requiredXp: 13200, description: 'You are the sovereign of all tempests in the mountain domain', icon: '👑', bonuses: { nestCapacity: 8, trainingEfficiency: 1.63, huntBonus: 1.33, defenseBonus: 1.3, goldMultiplier: 1.42 } },
  { rank: 26, title: 'Hail Breaker', titleZh: '破冰者', tier: 'stormlord', requiredXp: 15000, description: 'You break through hailstorms that would ground any other eagle master', icon: '🧊', bonuses: { nestCapacity: 8, trainingEfficiency: 1.65, huntBonus: 1.33, defenseBonus: 1.3, goldMultiplier: 1.45 } },
  { rank: 27, title: 'Frost Wing Lord', titleZh: '霜翼领主', tier: 'stormlord', requiredXp: 17000, description: 'Your eagles fly through blizzards as if they were clear skies', icon: '❄️', bonuses: { nestCapacity: 9, trainingEfficiency: 1.68, huntBonus: 1.35, defenseBonus: 1.33, goldMultiplier: 1.48 } },
  { rank: 28, title: 'Rival Vanquisher', titleZh: '宿敌征服者', tier: 'stormlord', requiredXp: 19200, description: 'You have defeated multiple rival clans in territorial battles', icon: '⚔️', bonuses: { nestCapacity: 9, trainingEfficiency: 1.7, huntBonus: 1.35, defenseBonus: 1.33, goldMultiplier: 1.48 } },
  { rank: 29, title: 'Sky Dominator', titleZh: '天空统治者', tier: 'stormlord', requiredXp: 21600, description: 'You dominate all aerial territories within your domain', icon: '🌍', bonuses: { nestCapacity: 9, trainingEfficiency: 1.73, huntBonus: 1.38, defenseBonus: 1.35, goldMultiplier: 1.5 } },
  { rank: 30, title: 'Stormlord Ascendant', titleZh: '风暴领主晋升者', tier: 'stormlord', requiredXp: 24200, description: 'You ascend beyond the title of Stormlord to something greater', icon: '🌟', bonuses: { nestCapacity: 9, trainingEfficiency: 1.75, huntBonus: 1.4, defenseBonus: 1.38, goldMultiplier: 1.52 } },
  { rank: 31, title: 'Thunder Prophet', titleZh: '雷霆先知', tier: 'thundergod', requiredXp: 28000, description: 'You can predict and shape thunderstorms days before they form', icon: '🔮', bonuses: { nestCapacity: 9, trainingEfficiency: 1.78, huntBonus: 1.42, defenseBonus: 1.4, goldMultiplier: 1.55 } },
  { rank: 32, title: 'Voltage Emperor', titleZh: '电压帝皇', tier: 'thundergod', requiredXp: 32000, description: 'You command raw electrical voltage to empower your eagles', icon: '🔋', bonuses: { nestCapacity: 10, trainingEfficiency: 1.8, huntBonus: 1.42, defenseBonus: 1.4, goldMultiplier: 1.55 } },
  { rank: 33, title: 'Wind Shaper', titleZh: '塑风者', tier: 'thundergod', requiredXp: 36500, description: 'You can sculpt the wind itself into any shape you desire', icon: '🌪️', bonuses: { nestCapacity: 10, trainingEfficiency: 1.83, huntBonus: 1.45, defenseBonus: 1.42, goldMultiplier: 1.58 } },
  { rank: 34, title: 'Stormforged Master', titleZh: '风暴锻造大师', tier: 'thundergod', requiredXp: 41500, description: 'You have been forged by storms into something unbreakable', icon: '🔨', bonuses: { nestCapacity: 10, trainingEfficiency: 1.85, huntBonus: 1.45, defenseBonus: 1.42, goldMultiplier: 1.6 } },
  { rank: 35, title: 'Sky Titan', titleZh: '天空泰坦', tier: 'thundergod', requiredXp: 47000, description: 'You stand as a titan among the clouds, unmatched in power', icon: '🗿', bonuses: { nestCapacity: 10, trainingEfficiency: 1.88, huntBonus: 1.48, defenseBonus: 1.45, goldMultiplier: 1.62 } },
  { rank: 36, title: 'Elemental Conductor', titleZh: '元素指挥家', tier: 'thundergod', requiredXp: 53000, description: 'You conduct the elements like an orchestra of destruction', icon: '🎼', bonuses: { nestCapacity: 10, trainingEfficiency: 1.9, huntBonus: 1.48, defenseBonus: 1.45, goldMultiplier: 1.65 } },
  { rank: 37, title: 'Apex Predator Lord', titleZh: '顶级捕食者领主', tier: 'thundergod', requiredXp: 59500, description: 'Your eagles are the apex predators of the entire mountain range', icon: '🦅', bonuses: { nestCapacity: 11, trainingEfficiency: 1.93, huntBonus: 1.5, defenseBonus: 1.48, goldMultiplier: 1.68 } },
  { rank: 38, title: 'Atmospheric Sage', titleZh: '大气圣贤', tier: 'thundergod', requiredXp: 66500, description: 'Your understanding of the atmosphere borders on the divine', icon: '📚', bonuses: { nestCapacity: 11, trainingEfficiency: 1.95, huntBonus: 1.5, defenseBonus: 1.48, goldMultiplier: 1.7 } },
  { rank: 39, title: 'Thunder Architect', titleZh: '雷霆建筑师', tier: 'thundergod', requiredXp: 74000, description: 'You design elaborate aerial formations and storm-based strategies', icon: '🏗️', bonuses: { nestCapacity: 11, trainingEfficiency: 1.98, huntBonus: 1.52, defenseBonus: 1.5, goldMultiplier: 1.72 } },
  { rank: 40, title: 'Thundergod Ascendant', titleZh: '雷神晋升者', tier: 'thundergod', requiredXp: 82000, description: 'You transcend mortal limits and approach the power of the thunder god', icon: '⚡', bonuses: { nestCapacity: 11, trainingEfficiency: 2.0, huntBonus: 1.55, defenseBonus: 1.52, goldMultiplier: 1.75 } },
  { rank: 41, title: 'Eternal Flock Warden', titleZh: '永恒鹰群守护者', tier: 'eagle_sovereign', requiredXp: 95000, description: 'You guard an eternal flock that spans across mountain ranges', icon: '🛡️', bonuses: { nestCapacity: 12, trainingEfficiency: 2.03, huntBonus: 1.58, defenseBonus: 1.55, goldMultiplier: 1.78 } },
  { rank: 42, title: 'Primordial Storm Elder', titleZh: '太初风暴长老', tier: 'eagle_sovereign', requiredXp: 110000, description: 'You channel the power of primordial storms from the dawn of time', icon: '🌋', bonuses: { nestCapacity: 12, trainingEfficiency: 2.05, huntBonus: 1.58, defenseBonus: 1.55, goldMultiplier: 1.8 } },
  { rank: 43, title: 'Celestial Navigator', titleZh: '天界导航员', tier: 'eagle_sovereign', requiredXp: 128000, description: 'You navigate by the stars through the thickest atmospheric conditions', icon: '🔭', bonuses: { nestCapacity: 12, trainingEfficiency: 2.08, huntBonus: 1.6, defenseBonus: 1.58, goldMultiplier: 1.82 } },
  { rank: 44, title: 'World Storm King', titleZh: '世界风暴之王', tier: 'eagle_sovereign', requiredXp: 148000, description: 'You are the king of all storms across the entire world', icon: '🌍', bonuses: { nestCapacity: 12, trainingEfficiency: 2.1, huntBonus: 1.62, defenseBonus: 1.6, goldMultiplier: 1.85 } },
  { rank: 45, title: 'Infinity Wing Lord', titleZh: '无尽翼主', tier: 'eagle_sovereign', requiredXp: 170000, description: 'Your eagles have infinite potential, growing without bound', icon: '♾️', bonuses: { nestCapacity: 13, trainingEfficiency: 2.13, huntBonus: 1.65, defenseBonus: 1.62, goldMultiplier: 1.88 } },
  { rank: 46, title: 'Cosmic Tempest Herald', titleZh: '宇宙暴风先锋', tier: 'eagle_sovereign', requiredXp: 195000, description: 'You herald cosmic storms that reshape the very atmosphere of the planet', icon: '🌌', bonuses: { nestCapacity: 13, trainingEfficiency: 2.15, huntBonus: 1.65, defenseBonus: 1.62, goldMultiplier: 1.9 } },
  { rank: 47, title: 'Mythic Sky Monarch', titleZh: '神话天空君主', tier: 'eagle_sovereign', requiredXp: 225000, description: 'You reign as monarch over the mythical skies above all mortal comprehension', icon: '👑', bonuses: { nestCapacity: 13, trainingEfficiency: 2.18, huntBonus: 1.68, defenseBonus: 1.65, goldMultiplier: 1.92 } },
  { rank: 48, title: 'Eagle Ancestor Spirit', titleZh: '鹰祖之灵', tier: 'eagle_sovereign', requiredXp: 260000, description: 'You become one with the ancestral spirits of all eagles past', icon: '👻', bonuses: { nestCapacity: 14, trainingEfficiency: 2.2, huntBonus: 1.7, defenseBonus: 1.68, goldMultiplier: 1.95 } },
  { rank: 49, title: 'Storm of Eternity', titleZh: '永恒风暴', tier: 'eagle_sovereign', requiredXp: 300000, description: 'You are the storm itself — eternal, unstoppable, all-encompassing', icon: '🌀', bonuses: { nestCapacity: 14, trainingEfficiency: 2.23, huntBonus: 1.72, defenseBonus: 1.7, goldMultiplier: 1.98 } },
  { rank: 50, title: 'Eagle Sovereign Supreme', titleZh: '至高鹰皇', tier: 'eagle_sovereign', requiredXp: 350000, description: 'The ultimate Eagle Master — supreme sovereign over all eagles, all skies, all storms', icon: '🏆', bonuses: { nestCapacity: 15, trainingEfficiency: 2.5, huntBonus: 2.0, defenseBonus: 2.0, goldMultiplier: 2.5 } },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: ACHIEVEMENTS (15)
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_ACHIEVEMENTS: readonly TNAchievementDef[] = [
  {
    id: 'ach_first_eagle',
    name: 'First Flight',
    nameZh: '初次飞翔',
    description: 'Acquire your very first eagle companion',
    icon: '🐣',
    condition: 'eagles >= 1',
    rewardXp: 50,
    rewardGold: 30,
  },
  {
    id: 'ach_five_eagles',
    name: 'Growing Flock',
    nameZh: '日益壮大的鹰群',
    description: 'Have 5 eagles in your care simultaneously',
    icon: '🦅',
    condition: 'eagles >= 5',
    rewardXp: 200,
    rewardGold: 100,
  },
  {
    id: 'ach_ten_eagles',
    name: 'Grand Eyrie',
    nameZh: '宏伟鹰巢',
    description: 'Have 10 eagles in your care simultaneously',
    icon: '🏔️',
    condition: 'eagles >= 10',
    rewardXp: 500,
    rewardGold: 250,
  },
  {
    id: 'ach_first_hunt',
    name: 'First Catch',
    nameZh: '首次捕获',
    description: 'Complete your first successful prey hunt',
    icon: '🎯',
    condition: 'totalHunts >= 1',
    rewardXp: 75,
    rewardGold: 50,
  },
  {
    id: 'ach_hunter_50',
    name: 'Seasoned Hunter',
    nameZh: '资深猎手',
    description: 'Hunt 50 prey successfully across all types',
    icon: '🏹',
    condition: 'totalHunts >= 50',
    rewardXp: 400,
    rewardGold: 200,
  },
  {
    id: 'ach_leviathan',
    name: 'Leviathan Slayer',
    nameZh: '利维坦屠戮者',
    description: 'Successfully hunt the legendary Sky Leviathan',
    icon: '🌌',
    condition: 'prey_sky_leviathan',
    rewardXp: 1000,
    rewardGold: 500,
  },
  {
    id: 'ach_first_training',
    name: 'Training Begins',
    nameZh: '训练开始',
    description: 'Complete your first training session with any eagle',
    icon: '💪',
    condition: 'totalTraining >= 1',
    rewardXp: 60,
    rewardGold: 30,
  },
  {
    id: 'ach_max_level_eagle',
    name: 'Peak Performance',
    nameZh: '巅峰表现',
    description: 'Raise an eagle to level 50',
    icon: '🌟',
    condition: 'eagleLevel >= 50',
    rewardXp: 800,
    rewardGold: 400,
  },
  {
    id: 'ach_first_defense',
    name: 'Territory Held',
    nameZh: '领土保全',
    description: 'Win your first territory defense battle',
    icon: '🛡️',
    condition: 'totalDefenseWins >= 1',
    rewardXp: 100,
    rewardGold: 75,
  },
  {
    id: 'ach_clan_crusher',
    name: 'Clan Crusher',
    nameZh: '氏族粉碎者',
    description: 'Defeat all 4 rival clans at least once',
    icon: '⚔️',
    condition: 'allClansDefeated',
    rewardXp: 600,
    rewardGold: 350,
  },
  {
    id: 'ach_first_patrol',
    name: 'Patrol Initiate',
    nameZh: '巡逻见习',
    description: 'Complete your first daily storm patrol',
    icon: '⚡',
    condition: 'totalPatrols >= 1',
    rewardXp: 80,
    rewardGold: 50,
  },
  {
    id: 'ach_patrol_30',
    name: 'Storm Veteran',
    nameZh: '风暴老兵',
    description: 'Complete 30 daily storm patrols',
    icon: '🎖️',
    condition: 'totalPatrols >= 30',
    rewardXp: 500,
    rewardGold: 300,
  },
  {
    id: 'ach_rank_25',
    name: 'Tempest Lord',
    nameZh: '暴风领主',
    description: 'Reach Eagle Master rank 25',
    icon: '👑',
    condition: 'rank >= 25',
    rewardXp: 750,
    rewardGold: 500,
  },
  {
    id: 'ach_all_weather',
    name: 'Weather Master',
    nameZh: '天气大师',
    description: 'Complete a successful hunt in every weather type',
    icon: '🌦️',
    condition: 'allWeatherHunts',
    rewardXp: 400,
    rewardGold: 250,
  },
  {
    id: 'ach_rank_50',
    name: 'Eagle Sovereign Supreme',
    nameZh: '至高鹰皇',
    description: 'Reach the ultimate rank of Eagle Master 50',
    icon: '🏆',
    condition: 'rank >= 50',
    rewardXp: 5000,
    rewardGold: 3000,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: DAILY STORM PATROLS
// ═══════════════════════════════════════════════════════════════════════════════

export const TN_STORM_PATROLS: readonly TNStormPatrolDef[] = [
  {
    id: 'patrol_dawn_sweep',
    name: 'Dawn Sweep',
    nameZh: '黎明巡逻',
    description: 'A morning patrol sweeping the eastern valleys for threats and stray prey',
    icon: '🌅',
    difficulty: 1,
    requiredRank: 1,
    rewardXp: 40,
    rewardGold: 30,
    encounterCount: 3,
    weatherPreference: ['clear_sky', 'light_rain'],
  },
  {
    id: 'patrol_storm_ridge',
    name: 'Storm Ridge Patrol',
    nameZh: '暴风山脊巡逻',
    description: 'Patrol the dangerous storm ridges where rival clans often infiltrate',
    icon: '⛈️',
    difficulty: 3,
    requiredRank: 5,
    rewardXp: 80,
    rewardGold: 60,
    encounterCount: 4,
    weatherPreference: ['thunderstorm', 'light_rain'],
  },
  {
    id: 'patrol_glacier_watch',
    name: 'Glacier Watch',
    nameZh: '冰川守望',
    description: 'Watch over the frozen glaciers for ice dragons and blizzard-born threats',
    icon: '❄️',
    difficulty: 4,
    requiredRank: 10,
    rewardXp: 120,
    rewardGold: 90,
    encounterCount: 5,
    weatherPreference: ['blizzard', 'hailstorm'],
  },
  {
    id: 'patrol_cyclone_run',
    name: 'Cyclone Run',
    nameZh: '旋风穿越',
    description: 'Navigate through a cyclone zone to deliver supplies to remote eyries',
    icon: '🌪️',
    difficulty: 5,
    requiredRank: 15,
    rewardXp: 160,
    rewardGold: 120,
    encounterCount: 5,
    weatherPreference: ['tornado', 'thunderstorm'],
  },
  {
    id: 'patrol_monsoon_defense',
    name: 'Monsoon Defense Line',
    nameZh: '季风防线',
    description: 'Defend the southern border during monsoon season when invasions are most likely',
    icon: '🌧️',
    difficulty: 6,
    requiredRank: 20,
    rewardXp: 220,
    rewardGold: 170,
    encounterCount: 6,
    weatherPreference: ['monsoon', 'thunderstorm'],
  },
  {
    id: 'patrol_solar_frontier',
    name: 'Solar Frontier',
    nameZh: '太阳边境',
    description: 'Patrol the upper atmosphere during a solar flare event — the most dangerous mission',
    icon: '🌞',
    difficulty: 8,
    requiredRank: 30,
    rewardXp: 350,
    rewardGold: 280,
    encounterCount: 7,
    weatherPreference: ['solar_flare', 'clear_sky'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: UTILITY / HELPER FUNCTIONS (all tn-prefixed)
// ═══════════════════════════════════════════════════════════════════════════════

export function tnGetSpeciesById(speciesId: string): TNEagleSpeciesDef | undefined {
  return TN_EAGLE_SPECIES.find((s) => s.id === speciesId);
}

export function tnGetNestById(nestId: string): TNNestLocationDef | undefined {
  return TN_NEST_LOCATIONS.find((n) => n.id === nestId);
}

export function tnGetWeatherById(weatherId: string): TNWeatherDef | undefined {
  return TN_WEATHER_TYPES.find((w) => w.id === weatherId);
}

export function tnGetTrainingById(trainingId: string): TNTrainingDef | undefined {
  return TN_TRAINING_TYPES.find((t) => t.id === trainingId);
}

export function tnGetPreyById(preyId: string): TNPreyDef | undefined {
  return TN_PREY_TYPES.find((p) => p.id === preyId);
}

export function tnGetClanById(clanId: string): TNRivalClanDef | undefined {
  return TN_RIVAL_CLANS.find((c) => c.id === clanId);
}

export function tnGetAchievementById(achievementId: string): TNAchievementDef | undefined {
  return TN_ACHIEVEMENTS.find((a) => a.id === achievementId);
}

export function tnGetPatrolById(patrolId: string): TNStormPatrolDef | undefined {
  return TN_STORM_PATROLS.find((p) => p.id === patrolId);
}

export function tnGetRankByNumber(rankNumber: number): TNRankDef | undefined {
  return TN_RANKS.find((r) => r.rank === rankNumber);
}

export function tnGetRankTitle(rankNumber: number): string {
  const rank = tnGetRankByNumber(rankNumber);
  return rank ? rank.title : 'Unknown';
}

export function tnGetRankTitleZh(rankNumber: number): string {
  const rank = tnGetRankByNumber(rankNumber);
  return rank ? rank.titleZh : '未知';
}

export function tnGetRankTier(rankNumber: number): TNRankTier {
  const rank = tnGetRankByNumber(rankNumber);
  return rank ? rank.tier : 'fledgling';
}

export function tnGetRankTierColor(rankNumber: number): string {
  const tier = tnGetRankTier(rankNumber);
  return TN_TIER_COLORS[tier];
}

export function tnGetRankBonuses(rankNumber: number): TNRankBonuses {
  const rank = tnGetRankByNumber(rankNumber);
  return rank ? rank.bonuses : { nestCapacity: 3, trainingEfficiency: 1.0, huntBonus: 1.0, defenseBonus: 1.0, goldMultiplier: 1.0 };
}

export function tnGetRarityColor(rarity: TNRarity): string {
  return TN_RARITY_COLORS[rarity];
}

export function tnGetRarityLabel(rarity: TNRarity, locale: 'en' | 'zh' = 'en'): string {
  return TN_RARITY_LABELS[rarity][locale];
}

export function tnGetElementColor(element: TNEagleElement): string {
  return TN_ELEMENT_COLORS[element];
}

export function tnGetNextRankXp(currentRank: number): number {
  const nextRank = currentRank + 1;
  if (nextRank > 50) return 350000;
  const rank = tnGetRankByNumber(nextRank);
  return rank ? rank.requiredXp : 350000;
}

export function tnGetXpProgress(currentXp: number, currentRank: number): number {
  const currentRankDef = tnGetRankByNumber(currentRank);
  const nextRankXp = tnGetNextRankXp(currentRank);
  const currentRankXp = currentRankDef ? currentRankDef.requiredXp : 0;
  if (currentRank >= 50) return 100;
  const range = nextRankXp - currentRankXp;
  if (range <= 0) return 100;
  const progress = ((currentXp - currentRankXp) / range) * 100;
  return Math.max(0, Math.min(100, progress));
}

export function tnGetEffectiveStat(baseStat: number, weather: TNWeatherDef, statName: string): number {
  let modifier = 1.0;
  switch (statName) {
    case 'speed':
      modifier = weather.speedMod;
      break;
    case 'strength':
      modifier = weather.strengthMod;
      break;
    case 'vision':
      modifier = weather.visionMod;
      break;
    case 'endurance':
      modifier = weather.enduranceMod;
      break;
    case 'agility':
      modifier = weather.agilityMod;
      break;
    default:
      modifier = 1.0;
  }
  return Math.round(baseStat * modifier);
}

export function tnCalculateHuntSuccess(eagle: TNEagleInstance, prey: TNPreyDef, weather: TNWeatherDef): number {
  const effectiveSpeed = tnGetEffectiveStat(eagle.speed, weather, 'speed');
  const effectiveVision = tnGetEffectiveStat(eagle.vision, weather, 'vision');
  const speedFactor = Math.min(1.0, effectiveSpeed / (prey.requiredSpeed + 10));
  const visionFactor = Math.min(1.0, effectiveVision / (prey.requiredVision + 10));
  const levelBonus = eagle.level * 0.005;
  const baseChance = 0.4 + (speedFactor * 0.3) + (visionFactor * 0.2) + levelBonus;
  const fleePenalty = prey.fleeChance * (1 - speedFactor);
  const weatherPenalty = (weather.dangerLevel - 3) * 0.02;
  const finalChance = baseChance - fleePenalty - Math.max(0, weatherPenalty);
  return Math.max(0.05, Math.min(0.95, finalChance));
}

export function tnCalculateTrainingXp(training: TNTrainingDef, eagleLevel: number, weather: TNWeatherDef): number {
  const levelFactor = 1 + (eagleLevel * 0.02);
  const weatherBonus = 1 + ((weather.dangerLevel - 5) * 0.01);
  return Math.round(training.baseXpGain * levelFactor * Math.max(0.8, weatherBonus));
}

export function tnCalculateDefenseSuccess(eagle: TNEagleInstance, clan: TNRivalClanDef, weather: TNWeatherDef): number {
  const eaglePower = eagle.speed + eagle.strength + eagle.agility;
  const clanPower = clan.attackPower + clan.defensePower;
  const weatherAdvantage = weather.id === clan.preferredWeather ? -0.15 : 0.1;
  const levelFactor = eagle.level * 0.008;
  const baseChance = 0.5 + ((eaglePower - clanPower) * 0.003) + levelFactor + weatherAdvantage;
  return Math.max(0.1, Math.min(0.9, baseChance));
}

export function tnCalculatePatrolSuccess(eagle: TNEagleInstance, patrol: TNStormPatrolDef, weather: TNWeatherDef): number {
  const avgStat = (eagle.speed + eagle.strength + eagle.vision + eagle.endurance + eagle.agility) / 5;
  const difficultyFactor = Math.min(1.0, avgStat / (patrol.difficulty * 20));
  const weatherMatch = patrol.weatherPreference.includes(weather.id) ? 0.1 : -0.05;
  const baseChance = 0.5 + (difficultyFactor * 0.3) + weatherMatch;
  return Math.max(0.15, Math.min(0.85, baseChance));
}

export function tnCalculateEagleXpForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}

export function tnCalculateEagleLevel(xp: number): number {
  let level = 1;
  while (tnCalculateEagleXpForLevel(level + 1) <= xp && level < 99) {
    level += 1;
  }
  return level;
}

export function tnGenerateEagleId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `eagle_${timestamp}_${random}`;
}

export function tnGenerateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `session_${timestamp}_${random}`;
}

export function tnGenerateEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `event_${timestamp}_${random}`;
}

export function tnCreateEagleInstance(speciesId: string): TNEagleInstance | null {
  const species = tnGetSpeciesById(speciesId);
  if (!species) return null;
  return {
    id: tnGenerateEagleId(),
    speciesId: species.id,
    nickname: species.name,
    level: 1,
    xp: 0,
    speed: species.baseSpeed,
    strength: species.baseStrength,
    vision: species.baseVision,
    endurance: species.baseEndurance,
    agility: species.baseAgility,
    energy: 100,
    maxEnergy: 100,
    health: 100,
    maxHealth: 100,
    bondLevel: 1,
    huntCount: 0,
    trainingCount: 0,
    battleCount: 0,
    patrolCount: 0,
  };
}

export function tnAddXpToEagle(eagle: TNEagleInstance, xpAmount: number): TNEagleInstance {
  const newXp = eagle.xp + xpAmount;
  const newLevel = tnCalculateEagleLevel(newXp);
  const xpForNextLevel = tnCalculateEagleXpForLevel(newLevel);
  const xpForCurrentLevel = tnCalculateEagleXpForLevel(newLevel - 1 > 0 ? newLevel - 1 : 1);
  const levelUpCount = newLevel - eagle.level;
  const speedIncrease = levelUpCount * 2;
  const strengthIncrease = levelUpCount * 2;
  const visionIncrease = levelUpCount * 2;
  const enduranceIncrease = levelUpCount * 1;
  const agilityIncrease = levelUpCount * 2;
  const species = tnGetSpeciesById(eagle.speciesId);
  let speed = eagle.speed + speedIncrease;
  let strength = eagle.strength + strengthIncrease;
  let vision = eagle.vision + visionIncrease;
  let endurance = eagle.endurance + enduranceIncrease;
  let agility = eagle.agility + agilityIncrease;
  if (species) {
    const maxSpeed = species.baseSpeed + (newLevel * 3);
    const maxStrength = species.baseStrength + (newLevel * 3);
    const maxVision = species.baseVision + (newLevel * 3);
    const maxEndurance = species.baseEndurance + (newLevel * 2);
    const maxAgility = species.baseAgility + (newLevel * 3);
    speed = Math.min(speed, maxSpeed);
    strength = Math.min(strength, maxStrength);
    vision = Math.min(vision, maxVision);
    endurance = Math.min(endurance, maxEndurance);
    agility = Math.min(agility, maxAgility);
  }
  return {
    ...eagle,
    xp: newXp,
    level: newLevel,
    speed,
    strength,
    vision,
    endurance,
    agility,
    maxEnergy: 100 + (newLevel * 5),
    maxHealth: 100 + (newLevel * 8),
  };
}

export function tnGetEaglesByElement(eagles: TNEagleInstance[], element: TNEagleElement): TNEagleInstance[] {
  return eagles.filter((eagle) => {
    const species = tnGetSpeciesById(eagle.speciesId);
    return species && species.element === element;
  });
}

export function tnGetEaglesByRarity(eagles: TNEagleInstance[], rarity: TNRarity): TNEagleInstance[] {
  return eagles.filter((eagle) => {
    const species = tnGetSpeciesById(eagle.speciesId);
    return species && species.rarity === rarity;
  });
}

export function tnGetStrongestEagle(eagles: TNEagleInstance[]): TNEagleInstance | null {
  if (eagles.length === 0) return null;
  return eagles.reduce((strongest, eagle) => {
    const eaglePower = eagle.speed + eagle.strength + eagle.vision + eagle.endurance + eagle.agility;
    const strongestPower = strongest.speed + strongest.strength + strongest.vision + strongest.endurance + strongest.agility;
    return eaglePower > strongestPower ? eagle : strongest;
  });
}

export function tnGetFastestEagle(eagles: TNEagleInstance[]): TNEagleInstance | null {
  if (eagles.length === 0) return null;
  return eagles.reduce((fastest, eagle) => (eagle.speed > fastest.speed ? eagle : fastest));
}

export function tnGetBestHunter(eagles: TNEagleInstance[]): TNEagleInstance | null {
  if (eagles.length === 0) return null;
  return eagles.reduce((best, eagle) => (eagle.huntCount > best.huntCount ? eagle : best));
}

export function tnGetBestFighter(eagles: TNEagleInstance[]): TNEagleInstance | null {
  if (eagles.length === 0) return null;
  return eagles.reduce((best, eagle) => (eagle.battleCount > best.battleCount ? eagle : best));
}

export function tnSortEaglesByPower(eagles: TNEagleInstance[]): TNEagleInstance[] {
  return [...eagles].sort((a, b) => {
    const powerA = a.speed + a.strength + a.vision + a.endurance + a.agility;
    const powerB = b.speed + b.strength + b.vision + b.endurance + b.agility;
    return powerB - powerA;
  });
}

export function tnSortEaglesByLevel(eagles: TNEagleInstance[]): TNEagleInstance[] {
  return [...eagles].sort((a, b) => b.level - a.level);
}

export function tnSortEaglesByBond(eagles: TNEagleInstance[]): TNEagleInstance[] {
  return [...eagles].sort((a, b) => b.bondLevel - a.bondLevel);
}

export function tnGetTotalEaglePower(eagle: TNEagleInstance): number {
  return eagle.speed + eagle.strength + eagle.vision + eagle.endurance + eagle.agility;
}

export function tnGetAverageEaglePower(eagles: TNEagleInstance[]): number {
  if (eagles.length === 0) return 0;
  const totalPower = eagles.reduce((sum, eagle) => sum + tnGetTotalEaglePower(eagle), 0);
  return Math.round(totalPower / eagles.length);
}

export function tnGetAvailableNests(currentRank: number): TNNestLocationDef[] {
  return TN_NEST_LOCATIONS.filter((nest) => nest.unlockRank <= currentRank);
}

export function tnGetAvailablePatrols(currentRank: number): TNStormPatrolDef[] {
  return TN_STORM_PATROLS.filter((patrol) => patrol.requiredRank <= currentRank);
}

export function tnGetAvailablePrey(eagle: TNEagleInstance): TNPreyDef[] {
  return TN_PREY_TYPES.filter((prey) => eagle.vision >= prey.requiredVision * 0.7);
}

export function tnGetClanDefeatCount(rivalDefeatCounts: Record<string, number>, clanId: string): number {
  return rivalDefeatCounts[clanId] || 0;
}

export function tnIsAllClansDefeated(rivalDefeatCounts: Record<string, number>): boolean {
  return TN_RIVAL_CLANS.every((clan) => (rivalDefeatCounts[clan.id] || 0) > 0);
}

export function tnGetTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function tnCalculateTerritoryStrength(baseStrength: number, rankBonuses: TNRankBonuses, eagleCount: number): number {
  const rankBonus = baseStrength * ((rankBonuses.defenseBonus - 1) * 0.5);
  const eagleBonus = eagleCount * 5;
  return Math.round(baseStrength + rankBonus + eagleBonus);
}

export function tnGetWeatherDangerLabel(dangerLevel: number, locale: 'en' | 'zh' = 'en'): string {
  if (locale === 'zh') {
    const labels: Record<number, string> = { 1: '安全', 2: '低风险', 5: '危险', 6: '高风险', 7: '极危险', 8: '致命', 9: '毁灭性', 10: '末日级' };
    return labels[dangerLevel] || '未知';
  }
  const labels: Record<number, string> = { 1: 'Safe', 2: 'Low Risk', 5: 'Dangerous', 6: 'High Risk', 7: 'Very Dangerous', 8: 'Lethal', 9: 'Devastating', 10: 'Apocalyptic' };
  return labels[dangerLevel] || 'Unknown';
}

export function tnGetStatLabel(statName: string, locale: 'en' | 'zh' = 'en'): string {
  if (locale === 'zh') {
    const labels: Record<string, string> = {
      speed: '速度',
      strength: '力量',
      vision: '视力',
      endurance: '耐力',
      agility: '敏捷',
    };
    return labels[statName] || statName;
  }
  return statName.charAt(0).toUpperCase() + statName.slice(1);
}

export function tnGetElementLabel(element: TNEagleElement, locale: 'en' | 'zh' = 'en'): string {
  if (locale === 'zh') {
    const labels: Record<TNEagleElement, string> = {
      thunder: '雷',
      storm: '风暴',
      gale: '烈风',
      lightning: '闪电',
      tempest: '暴风',
      cyclone: '旋风',
      hail: '冰雹',
      blizzard: '暴雪',
      monsoon: '季风',
      vortex: '涡流',
    };
    return labels[element];
  }
  return element.charAt(0).toUpperCase() + element.slice(1);
}

export function tnGetTrainingLabel(trainingId: TNTrainingType, locale: 'en' | 'zh' = 'en'): string {
  const training = tnGetTrainingById(trainingId);
  if (!training) return 'Unknown';
  return locale === 'zh' ? training.nameZh : training.name;
}

export function tnGetWeatherLabel(weatherId: TNWeatherType, locale: 'en' | 'zh' = 'en'): string {
  const weather = tnGetWeatherById(weatherId);
  if (!weather) return 'Unknown';
  return locale === 'zh' ? weather.nameZh : weather.name;
}

export function tnFormatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return String(num);
}

export function tnGetSpeciesCount(): number {
  return TN_EAGLE_SPECIES.length;
}

export function tnGetNestCount(): number {
  return TN_NEST_LOCATIONS.length;
}

export function tnGetWeatherCount(): number {
  return TN_WEATHER_TYPES.length;
}

export function tnGetTrainingCount(): number {
  return TN_TRAINING_TYPES.length;
}

export function tnGetPreyCount(): number {
  return TN_PREY_TYPES.length;
}

export function tnGetClanCount(): number {
  return TN_RIVAL_CLANS.length;
}

export function tnGetAchievementCount(): number {
  return TN_ACHIEVEMENTS.length;
}

export function tnGetMaxRank(): number {
  return 50;
}

export function tnGetPatrolCount(): number {
  return TN_STORM_PATROLS.length;
}

export function tnGetRankTierProgress(rankNumber: number): number {
  const tier = tnGetRankTier(rankNumber);
  const tierRanks: Record<TNRankTier, [number, number]> = {
    fledgling: [1, 10],
    skyrider: [11, 20],
    stormlord: [21, 30],
    thundergod: [31, 40],
    eagle_sovereign: [41, 50],
  };
  const [tierStart, tierEnd] = tierRanks[tier];
  const tierRange = tierEnd - tierStart + 1;
  const rankInRange = rankNumber - tierStart + 1;
  return Math.round((rankInRange / tierRange) * 100);
}

export function tnGetAchievementProgress(achievementId: string, state: TNThunderNestState): number {
  switch (achievementId) {
    case 'ach_first_eagle':
      return state.eagles.length >= 1 ? 100 : 0;
    case 'ach_five_eagles':
      return Math.min(100, Math.round((state.eagles.length / 5) * 100));
    case 'ach_ten_eagles':
      return Math.min(100, Math.round((state.eagles.length / 10) * 100));
    case 'ach_first_hunt':
      return state.totalPreyHunted >= 1 ? 100 : 0;
    case 'ach_hunter_50':
      return Math.min(100, Math.round((state.totalPreyHunted / 50) * 100));
    case 'ach_leviathan':
      return state.huntHistory.some((h) => h.preyId === 'prey_sky_leviathan' && h.success) ? 100 : 0;
    case 'ach_first_training':
      return state.totalTrainingSessions >= 1 ? 100 : 0;
    case 'ach_max_level_eagle':
      return state.highestEagleLevel >= 50 ? 100 : Math.round((state.highestEagleLevel / 50) * 100);
    case 'ach_first_defense':
      return state.totalBattlesWon >= 1 ? 100 : 0;
    case 'ach_clan_crusher':
      return tnIsAllClansDefeated(state.rivalDefeatCounts) ? 100 : Math.round((Object.values(state.rivalDefeatCounts).filter((c) => c > 0).length / 4) * 100);
    case 'ach_first_patrol':
      return state.totalPatrolsCompleted >= 1 ? 100 : 0;
    case 'ach_patrol_30':
      return Math.min(100, Math.round((state.totalPatrolsCompleted / 30) * 100));
    case 'ach_rank_25':
      return state.currentRank >= 25 ? 100 : Math.round((state.currentRank / 25) * 100);
    case 'ach_rank_50':
      return state.currentRank >= 50 ? 100 : Math.round((state.currentRank / 50) * 100);
    case 'ach_all_weather':
      return 0;
    default:
      return 0;
  }
}

export function tnIsAchievementUnlocked(achievementId: string, state: TNThunderNestState): boolean {
  return state.achievements.includes(achievementId);
}

export function tnGetLockedAchievements(state: TNThunderNestState): TNAchievementDef[] {
  return TN_ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id));
}

export function tnGetUnlockedAchievements(state: TNThunderNestState): TNAchievementDef[] {
  return TN_ACHIEVEMENTS.filter((a) => state.achievements.includes(a.id));
}

export function tnGetRecentEvents(eventLog: TNEventLog[], count: number): TNEventLog[] {
  return eventLog.slice(-count).reverse();
}

export function tnCreateEventLog(type: string, message: string, messageZh: string): TNEventLog {
  return {
    id: tnGenerateEventId(),
    type,
    message,
    messageZh,
    timestamp: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: DEFAULT STATE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

function tnCreateDefaultState(): TNThunderNestState {
  return {
    eagles: [],
    activeNestId: 'nest_thunder_peak',
    currentWeather: 'clear_sky',
    weatherTimer: 0,
    totalXp: 0,
    totalGold: 100,
    currentRank: 1,
    achievements: [],
    trainingSessions: [],
    huntHistory: [],
    defenseHistory: [],
    patrolHistory: [],
    dailyPatrolDone: false,
    dailyPatrolDate: '',
    territoryStrength: 50,
    eventLog: [],
    totalPreyHunted: 0,
    totalBattlesWon: 0,
    totalPatrolsCompleted: 0,
    totalTrainingSessions: 0,
    totalEaglesOwned: 0,
    highestEagleLevel: 1,
    rivalDefeatCounts: {
      clan_iron_talon: 0,
      clan_shadow_wing: 0,
      clan_fire_storm: 0,
      clan_ice_crown: 0,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14: PERSISTENCE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function tnLoadState(): TNThunderNestState {
  if (typeof window === 'undefined') {
    return tnCreateDefaultState();
  }
  try {
    const raw = localStorage.getItem(TN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TNThunderNestState;
      const defaults = tnCreateDefaultState();
      return {
        eagles: Array.isArray(parsed.eagles) ? parsed.eagles : defaults.eagles,
        activeNestId: typeof parsed.activeNestId === 'string' ? parsed.activeNestId : defaults.activeNestId,
        currentWeather: typeof parsed.currentWeather === 'string' ? parsed.currentWeather : defaults.currentWeather,
        weatherTimer: typeof parsed.weatherTimer === 'number' ? parsed.weatherTimer : defaults.weatherTimer,
        totalXp: typeof parsed.totalXp === 'number' ? parsed.totalXp : defaults.totalXp,
        totalGold: typeof parsed.totalGold === 'number' ? parsed.totalGold : defaults.totalGold,
        currentRank: typeof parsed.currentRank === 'number' ? parsed.currentRank : defaults.currentRank,
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : defaults.achievements,
        trainingSessions: Array.isArray(parsed.trainingSessions) ? parsed.trainingSessions : defaults.trainingSessions,
        huntHistory: Array.isArray(parsed.huntHistory) ? parsed.huntHistory : defaults.huntHistory,
        defenseHistory: Array.isArray(parsed.defenseHistory) ? parsed.defenseHistory : defaults.defenseHistory,
        patrolHistory: Array.isArray(parsed.patrolHistory) ? parsed.patrolHistory : defaults.patrolHistory,
        dailyPatrolDone: typeof parsed.dailyPatrolDone === 'boolean' ? parsed.dailyPatrolDone : defaults.dailyPatrolDone,
        dailyPatrolDate: typeof parsed.dailyPatrolDate === 'string' ? parsed.dailyPatrolDate : defaults.dailyPatrolDate,
        territoryStrength: typeof parsed.territoryStrength === 'number' ? parsed.territoryStrength : defaults.territoryStrength,
        eventLog: Array.isArray(parsed.eventLog) ? parsed.eventLog : defaults.eventLog,
        totalPreyHunted: typeof parsed.totalPreyHunted === 'number' ? parsed.totalPreyHunted : defaults.totalPreyHunted,
        totalBattlesWon: typeof parsed.totalBattlesWon === 'number' ? parsed.totalBattlesWon : defaults.totalBattlesWon,
        totalPatrolsCompleted: typeof parsed.totalPatrolsCompleted === 'number' ? parsed.totalPatrolsCompleted : defaults.totalPatrolsCompleted,
        totalTrainingSessions: typeof parsed.totalTrainingSessions === 'number' ? parsed.totalTrainingSessions : defaults.totalTrainingSessions,
        totalEaglesOwned: typeof parsed.totalEaglesOwned === 'number' ? parsed.totalEaglesOwned : defaults.totalEaglesOwned,
        highestEagleLevel: typeof parsed.highestEagleLevel === 'number' ? parsed.highestEagleLevel : defaults.highestEagleLevel,
        rivalDefeatCounts: typeof parsed.rivalDefeatCounts === 'object' && parsed.rivalDefeatCounts !== null ? parsed.rivalDefeatCounts : defaults.rivalDefeatCounts,
      };
    }
  } catch {
    return tnCreateDefaultState();
  }
  return tnCreateDefaultState();
}

function tnSaveState(state: TNThunderNestState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TN_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15: RECALCULATE RANK HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function tnRecalculateRank(totalXp: number): number {
  let rank = 1;
  for (const rankDef of TN_RANKS) {
    if (totalXp >= rankDef.requiredXp) {
      rank = rankDef.rank;
    } else {
      break;
    }
  }
  return rank;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 16: CHECK ACHIEVEMENTS HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function tnCheckNewAchievements(state: TNThunderNestState): string[] {
  const newlyUnlocked: string[] = [];
  for (const achievement of TN_ACHIEVEMENTS) {
    if (state.achievements.includes(achievement.id)) continue;
    let unlocked = false;
    switch (achievement.id) {
      case 'ach_first_eagle':
        unlocked = state.eagles.length >= 1;
        break;
      case 'ach_five_eagles':
        unlocked = state.eagles.length >= 5;
        break;
      case 'ach_ten_eagles':
        unlocked = state.eagles.length >= 10;
        break;
      case 'ach_first_hunt':
        unlocked = state.totalPreyHunted >= 1;
        break;
      case 'ach_hunter_50':
        unlocked = state.totalPreyHunted >= 50;
        break;
      case 'ach_leviathan':
        unlocked = state.huntHistory.some((h) => h.preyId === 'prey_sky_leviathan' && h.success);
        break;
      case 'ach_first_training':
        unlocked = state.totalTrainingSessions >= 1;
        break;
      case 'ach_max_level_eagle':
        unlocked = state.highestEagleLevel >= 50;
        break;
      case 'ach_first_defense':
        unlocked = state.totalBattlesWon >= 1;
        break;
      case 'ach_clan_crusher':
        unlocked = tnIsAllClansDefeated(state.rivalDefeatCounts);
        break;
      case 'ach_first_patrol':
        unlocked = state.totalPatrolsCompleted >= 1;
        break;
      case 'ach_patrol_30':
        unlocked = state.totalPatrolsCompleted >= 30;
        break;
      case 'ach_rank_25':
        unlocked = state.currentRank >= 25;
        break;
      case 'ach_rank_50':
        unlocked = state.currentRank >= 50;
        break;
      default:
        unlocked = false;
    }
    if (unlocked) {
      newlyUnlocked.push(achievement.id);
    }
  }
  return newlyUnlocked;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 17: UPDATE HIGHEST EAGLE LEVEL HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function tnUpdateHighestLevel(eagles: TNEagleInstance[], currentHighest: number): number {
  if (eagles.length === 0) return currentHighest;
  const maxLevel = eagles.reduce((max, eagle) => Math.max(max, eagle.level), 0);
  return Math.max(currentHighest, maxLevel);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 18: RESET DAILY PATROL HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function tnCheckDailyPatrolReset(dailyPatrolDate: string): { done: boolean; date: string } {
  const today = tnGetTodayString();
  return {
    done: dailyPatrolDate === today,
    date: dailyPatrolDate === today ? dailyPatrolDate : today,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 19: MAIN HOOK — useThunderNest
// ═══════════════════════════════════════════════════════════════════════════════

export default function useThunderNest() {
  // ─── Primary state via lazy initializer (localStorage) ─────────────────
  const [state, setState] = useState<TNThunderNestState>(() => tnLoadState());

  // ─── Secondary state for persistence sync ──────────────────────────────
  const [persistedAt, setPersistedAt] = useState<number>(0);

  // ─── Internal persistence trigger ──────────────────────────────────────
  function tnPersist(newState: TNThunderNestState): void {
    tnSaveState(newState);
    setPersistedAt(Date.now());
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Acquire Eagle
  // ═══════════════════════════════════════════════════════════════════════
  function tnAcquireEagle(speciesId: string): TNEagleInstance | null {
    const eagle = tnCreateEagleInstance(speciesId);
    if (!eagle) return null;
    const rankBonuses = tnGetRankBonuses(state.currentRank);
    const activeNest = tnGetNestById(state.activeNestId);
    const maxCapacity = rankBonuses.nestCapacity + (activeNest ? activeNest.capacity : 0);
    if (state.eagles.length >= maxCapacity) return null;
    const newState = { ...state };
    newState.eagles = [...newState.eagles, eagle];
    newState.totalEaglesOwned = newState.totalEaglesOwned + 1;
    newState.highestEagleLevel = tnUpdateHighestLevel(newState.eagles, newState.highestEagleLevel);
    newState.eventLog = [
      ...newState.eventLog,
      tnCreateEventLog('acquire', `Acquired a new ${eagle.nickname}!`, `获得了一只新的${eagle.nickname}！`),
    ];
    const newAchievements = tnCheckNewAchievements(newState);
    if (newAchievements.length > 0) {
      newState.achievements = [...newState.achievements, ...newAchievements];
      for (const achId of newAchievements) {
        const ach = tnGetAchievementById(achId);
        if (ach) {
          newState.totalXp = newState.totalXp + ach.rewardXp;
          newState.totalGold = newState.totalGold + ach.rewardGold;
          newState.currentRank = tnRecalculateRank(newState.totalXp);
          newState.eventLog = [
            ...newState.eventLog,
            tnCreateEventLog('achievement', `Achievement unlocked: ${ach.name}!`, `成就解锁：${ach.nameZh}！`),
          ];
        }
      }
    }
    setState(newState);
    tnPersist(newState);
    return eagle;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Release Eagle
  // ═══════════════════════════════════════════════════════════════════════
  function tnReleaseEagle(eagleId: string): boolean {
    const eagleIndex = state.eagles.findIndex((e) => e.id === eagleId);
    if (eagleIndex === -1) return false;
    const eagle = state.eagles[eagleIndex];
    const species = tnGetSpeciesById(eagle.speciesId);
    const name = species ? species.name : 'Eagle';
    const newState = { ...state };
    newState.eagles = state.eagles.filter((e) => e.id !== eagleId);
    newState.trainingSessions = newState.trainingSessions.filter((t) => t.eagleId !== eagleId);
    newState.eventLog = [
      ...newState.eventLog,
      tnCreateEventLog('release', `Released ${name} back to the wild.`, `将${name}放归野外。`),
    ];
    setState(newState);
    tnPersist(newState);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Rename Eagle
  // ═══════════════════════════════════════════════════════════════════════
  function tnRenameEagle(eagleId: string, newName: string): boolean {
    if (!newName || newName.trim().length === 0) return false;
    const eagle = state.eagles.find((e) => e.id === eagleId);
    if (!eagle) return false;
    const newState = { ...state };
    newState.eagles = newState.eagles.map((e) =>
      e.id === eagleId ? { ...e, nickname: newName.trim() } : e,
    );
    setState(newState);
    tnPersist(newState);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Start Training
  // ═══════════════════════════════════════════════════════════════════════
  function tnStartTraining(eagleId: string, trainingType: TNTrainingType): boolean {
    const eagle = state.eagles.find((e) => e.id === eagleId);
    if (!eagle) return false;
    const training = tnGetTrainingById(trainingType);
    if (!training) return false;
    if (eagle.energy < training.energyCost) return false;
    const weather = tnGetWeatherById(state.currentWeather);
    if (!weather) return false;
    const xpGain = tnCalculateTrainingXp(training, eagle.level, weather);
    const rankBonuses = tnGetRankBonuses(state.currentRank);
    const finalXp = Math.round(xpGain * rankBonuses.trainingEfficiency);
    const session: TNTrainingSession = {
      id: tnGenerateSessionId(),
      eagleId,
      trainingType,
      startTime: Date.now(),
      completed: true,
      xpGained: finalXp,
    };
    const updatedEagle = tnAddXpToEagle({ ...eagle, energy: eagle.energy - training.energyCost, trainingCount: eagle.trainingCount + 1 }, finalXp);
    const newState = { ...state };
    newState.eagles = newState.eagles.map((e) => (e.id === eagleId ? updatedEagle : e));
    newState.trainingSessions = [...newState.trainingSessions, session];
    newState.totalXp = newState.totalXp + Math.round(finalXp * 0.5);
    newState.totalTrainingSessions = newState.totalTrainingSessions + 1;
    newState.highestEagleLevel = tnUpdateHighestLevel(newState.eagles, newState.highestEagleLevel);
    newState.currentRank = tnRecalculateRank(newState.totalXp);
    newState.eventLog = [
      ...newState.eventLog,
      tnCreateEventLog('training', `${updatedEagle.nickname} completed ${training.name} and gained ${finalXp} XP!`, `${updatedEagle.nickname}完成了${training.nameZh}，获得${finalXp}经验！`),
    ];
    const newAchievements = tnCheckNewAchievements(newState);
    if (newAchievements.length > 0) {
      newState.achievements = [...newState.achievements, ...newAchievements];
      for (const achId of newAchievements) {
        const ach = tnGetAchievementById(achId);
        if (ach) {
          newState.totalXp = newState.totalXp + ach.rewardXp;
          newState.totalGold = newState.totalGold + ach.rewardGold;
          newState.eventLog = [
            ...newState.eventLog,
            tnCreateEventLog('achievement', `Achievement unlocked: ${ach.name}!`, `成就解锁：${ach.nameZh}！`),
          ];
        }
      }
    }
    newState.currentRank = tnRecalculateRank(newState.totalXp);
    setState(newState);
    tnPersist(newState);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Hunt Prey
  // ═══════════════════════════════════════════════════════════════════════
  function tnHuntPrey(eagleId: string, preyId: string): TNHuntResult | null {
    const eagle = state.eagles.find((e) => e.id === eagleId);
    if (!eagle) return null;
    const prey = tnGetPreyById(preyId);
    if (!prey) return null;
    const weather = tnGetWeatherById(state.currentWeather);
    if (!weather) return null;
    if (eagle.energy < 10) return null;
    const successChance = tnCalculateHuntSuccess(eagle, prey, weather);
    const roll = Math.random();
    const success = roll < successChance;
    let xpGained = 0;
    let goldGained = 0;
    if (success) {
      const rankBonuses = tnGetRankBonuses(state.currentRank);
      xpGained = Math.round(prey.rewardXp * rankBonuses.huntBonus);
      goldGained = Math.round(prey.rewardGold * rankBonuses.goldMultiplier);
    } else {
      xpGained = Math.round(prey.rewardXp * 0.2);
      goldGained = 0;
    }
    const huntResult: TNHuntResult = {
      preyId,
      eagleId,
      success,
      xpGained,
      goldGained,
      timestamp: Date.now(),
    };
    const updatedEagle = tnAddXpToEagle(
      { ...eagle, energy: Math.max(0, eagle.energy - 10), huntCount: eagle.huntCount + 1, bondLevel: success ? eagle.bondLevel + 1 : eagle.bondLevel },
      xpGained,
    );
    const newState = { ...state };
    newState.eagles = newState.eagles.map((e) => (e.id === eagleId ? updatedEagle : e));
    newState.huntHistory = [...newState.huntHistory, huntResult];
    newState.totalPreyHunted = newState.totalPreyHunted + (success ? 1 : 0);
    newState.totalXp = newState.totalXp + Math.round(xpGained * 0.3);
    newState.totalGold = newState.totalGold + goldGained;
    newState.highestEagleLevel = tnUpdateHighestLevel(newState.eagles, newState.highestEagleLevel);
    newState.currentRank = tnRecalculateRank(newState.totalXp);
    const preyName = prey.name;
    if (success) {
      newState.eventLog = [
        ...newState.eventLog,
        tnCreateEventLog('hunt', `${updatedEagle.nickname} successfully hunted a ${preyName}! +${xpGained} XP, +${goldGained} Gold`, `${updatedEagle.nickname}成功捕获了${prey.nameZh}！+${xpGained}经验，+${goldGained}金币`),
      ];
    } else {
      newState.eventLog = [
        ...newState.eventLog,
        tnCreateEventLog('hunt', `${updatedEagle.nickname} failed to catch the ${preyName}. The prey escaped!`, `${updatedEagle.nickname}未能捕获${prey.nameZh}。猎物逃脱了！`),
      ];
    }
    const newAchievements = tnCheckNewAchievements(newState);
    if (newAchievements.length > 0) {
      newState.achievements = [...newState.achievements, ...newAchievements];
      for (const achId of newAchievements) {
        const ach = tnGetAchievementById(achId);
        if (ach) {
          newState.totalXp = newState.totalXp + ach.rewardXp;
          newState.totalGold = newState.totalGold + ach.rewardGold;
          newState.eventLog = [
            ...newState.eventLog,
            tnCreateEventLog('achievement', `Achievement unlocked: ${ach.name}!`, `成就解锁：${ach.nameZh}！`),
          ];
        }
      }
    }
    newState.currentRank = tnRecalculateRank(newState.totalXp);
    setState(newState);
    tnPersist(newState);
    return huntResult;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Defend Territory
  // ═══════════════════════════════════════════════════════════════════════
  function tnDefendTerritory(eagleId: string, clanId: string): TNDefenseBattle | null {
    const eagle = state.eagles.find((e) => e.id === eagleId);
    if (!eagle) return null;
    const clan = tnGetClanById(clanId);
    if (!clan) return null;
    const weather = tnGetWeatherById(state.currentWeather);
    if (!weather) return null;
    if (eagle.energy < 15) return null;
    const successChance = tnCalculateDefenseSuccess(eagle, clan, weather);
    const roll = Math.random();
    const victory = roll < successChance;
    const rankBonuses = tnGetRankBonuses(state.currentRank);
    const xpGained = victory
      ? Math.round(clan.territoryStrength * 0.5 * rankBonuses.huntBonus)
      : Math.round(clan.territoryStrength * 0.1);
    const goldGained = victory
      ? Math.round(clan.territoryStrength * 0.3 * rankBonuses.goldMultiplier)
      : 0;
    const territoryLost = victory ? 0 : Math.round(clan.aggression * 2);
    const battle: TNDefenseBattle = {
      id: tnGenerateSessionId(),
      clanId,
      eagleId,
      timestamp: Date.now(),
      victory,
      xpGained,
      goldGained,
      territoryLost,
    };
    const updatedEagle = tnAddXpToEagle(
      { ...eagle, energy: Math.max(0, eagle.energy - 15), battleCount: eagle.battleCount + 1, bondLevel: victory ? eagle.bondLevel + 1 : eagle.bondLevel },
      xpGained,
    );
    const newState = { ...state };
    newState.eagles = newState.eagles.map((e) => (e.id === eagleId ? updatedEagle : e));
    newState.defenseHistory = [...newState.defenseHistory, battle];
    if (victory) {
      newState.totalBattlesWon = newState.totalBattlesWon + 1;
      const defeatCounts = { ...newState.rivalDefeatCounts };
      defeatCounts[clanId] = (defeatCounts[clanId] || 0) + 1;
      newState.rivalDefeatCounts = defeatCounts;
    }
    newState.totalXp = newState.totalXp + Math.round(xpGained * 0.4);
    newState.totalGold = newState.totalGold + goldGained;
    newState.territoryStrength = Math.max(0, newState.territoryStrength - territoryLost + (victory ? Math.round(clan.aggression * 3) : 0));
    newState.highestEagleLevel = tnUpdateHighestLevel(newState.eagles, newState.highestEagleLevel);
    newState.currentRank = tnRecalculateRank(newState.totalXp);
    if (victory) {
      newState.eventLog = [
        ...newState.eventLog,
        tnCreateEventLog('defense', `${updatedEagle.nickname} defeated the ${clan.name}! Territory held strong.`, `${updatedEagle.nickname}击败了${clan.nameZh}！领土安然无恙。`),
      ];
    } else {
      newState.eventLog = [
        ...newState.eventLog,
        tnCreateEventLog('defense', `${updatedEagle.nickname} lost to the ${clan.name}. Lost ${territoryLost} territory strength.`, `${updatedEagle.nickname}败给了${clan.nameZh}。失去了${territoryLost}点领土强度。`),
      ];
    }
    const newAchievements = tnCheckNewAchievements(newState);
    if (newAchievements.length > 0) {
      newState.achievements = [...newState.achievements, ...newAchievements];
      for (const achId of newAchievements) {
        const ach = tnGetAchievementById(achId);
        if (ach) {
          newState.totalXp = newState.totalXp + ach.rewardXp;
          newState.totalGold = newState.totalGold + ach.rewardGold;
          newState.eventLog = [
            ...newState.eventLog,
            tnCreateEventLog('achievement', `Achievement unlocked: ${ach.name}!`, `成就解锁：${ach.nameZh}！`),
          ];
        }
      }
    }
    newState.currentRank = tnRecalculateRank(newState.totalXp);
    setState(newState);
    tnPersist(newState);
    return battle;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Start Storm Patrol
  // ═══════════════════════════════════════════════════════════════════════
  function tnStartStormPatrol(eagleId: string, patrolDefId: string): TNStormPatrolResult | null {
    const { done, date } = tnCheckDailyPatrolReset(state.dailyPatrolDate);
    if (done) return null;
    const eagle = state.eagles.find((e) => e.id === eagleId);
    if (!eagle) return null;
    const patrolDef = tnGetPatrolById(patrolDefId);
    if (!patrolDef) return null;
    if (state.currentRank < patrolDef.requiredRank) return null;
    if (eagle.energy < 20) return null;
    const weather = tnGetWeatherById(state.currentWeather);
    if (!weather) return null;
    const baseChance = tnCalculatePatrolSuccess(eagle, patrolDef, weather);
    let encountersWon = 0;
    const encountersTotal = patrolDef.encounterCount;
    for (let i = 0; i < encountersTotal; i++) {
      if (Math.random() < baseChance) {
        encountersWon += 1;
      }
    }
    const completed = encountersWon >= Math.ceil(encountersTotal / 2);
    const rankBonuses = tnGetRankBonuses(state.currentRank);
    const completionRatio = encountersWon / encountersTotal;
    const rawXp = Math.round(patrolDef.rewardXp * completionRatio * rankBonuses.huntBonus);
    const rawGold = Math.round(patrolDef.rewardGold * completionRatio * rankBonuses.goldMultiplier);
    const xpGained = completed ? rawXp * 2 : rawXp;
    const goldGained = completed ? rawGold * 2 : rawGold;
    const result: TNStormPatrolResult = {
      id: tnGenerateSessionId(),
      patrolDefId,
      eagleId,
      completed,
      encountersWon,
      encountersTotal,
      xpGained,
      goldGained,
      timestamp: Date.now(),
    };
    const updatedEagle = tnAddXpToEagle(
      { ...eagle, energy: Math.max(0, eagle.energy - 20), patrolCount: eagle.patrolCount + 1, bondLevel: completed ? eagle.bondLevel + 2 : eagle.bondLevel + 1 },
      xpGained,
    );
    const newState = { ...state };
    newState.eagles = newState.eagles.map((e) => (e.id === eagleId ? updatedEagle : e));
    newState.patrolHistory = [...newState.patrolHistory, result];
    newState.totalPatrolsCompleted = newState.totalPatrolsCompleted + (completed ? 1 : 0);
    newState.dailyPatrolDone = true;
    newState.dailyPatrolDate = date;
    newState.totalXp = newState.totalXp + Math.round(xpGained * 0.4);
    newState.totalGold = newState.totalGold + goldGained;
    newState.highestEagleLevel = tnUpdateHighestLevel(newState.eagles, newState.highestEagleLevel);
    newState.currentRank = tnRecalculateRank(newState.totalXp);
    if (completed) {
      newState.eventLog = [
        ...newState.eventLog,
        tnCreateEventLog('patrol', `${updatedEagle.nickname} completed the ${patrolDef.name}! Won ${encountersWon}/${encountersTotal} encounters.`, `${updatedEagle.nickname}完成了${patrolDef.nameZh}！赢得了${encountersWon}/${encountersTotal}次遭遇。`),
      ];
    } else {
      newState.eventLog = [
        ...newState.eventLog,
        tnCreateEventLog('patrol', `${updatedEagle.nickname} failed the ${patrolDef.name}. Won ${encountersWon}/${encountersTotal} encounters.`, `${updatedEagle.nickname}未通过${patrolDef.nameZh}。赢得了${encountersWon}/${encountersTotal}次遭遇。`),
      ];
    }
    const newAchievements = tnCheckNewAchievements(newState);
    if (newAchievements.length > 0) {
      newState.achievements = [...newState.achievements, ...newAchievements];
      for (const achId of newAchievements) {
        const ach = tnGetAchievementById(achId);
        if (ach) {
          newState.totalXp = newState.totalXp + ach.rewardXp;
          newState.totalGold = newState.totalGold + ach.rewardGold;
          newState.eventLog = [
            ...newState.eventLog,
            tnCreateEventLog('achievement', `Achievement unlocked: ${ach.name}!`, `成就解锁：${ach.nameZh}！`),
          ];
        }
      }
    }
    newState.currentRank = tnRecalculateRank(newState.totalXp);
    setState(newState);
    tnPersist(newState);
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Set Active Nest
  // ═══════════════════════════════════════════════════════════════════════
  function tnSetActiveNest(nestId: string): boolean {
    const nest = tnGetNestById(nestId);
    if (!nest) return false;
    if (nest.unlockRank > state.currentRank) return false;
    const newState = { ...state, activeNestId: nestId };
    const nestDef = tnGetNestById(nestId);
    if (nestDef) {
      newState.eventLog = [
        ...newState.eventLog,
        tnCreateEventLog('nest', `Moved to ${nestDef.name}.`, `搬移至${nestDef.nameZh}。`),
      ];
    }
    setState(newState);
    tnPersist(newState);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Change Weather
  // ═══════════════════════════════════════════════════════════════════════
  function tnChangeWeather(weatherType: TNWeatherType): boolean {
    const weather = tnGetWeatherById(weatherType);
    if (!weather) return false;
    const newState = { ...state, currentWeather: weatherType, weatherTimer: Date.now() };
    newState.eventLog = [
      ...newState.eventLog,
      tnCreateEventLog('weather', `Weather changed to ${weather.name}.`, `天气变为${weather.nameZh}。`),
    ];
    setState(newState);
    tnPersist(newState);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Rest Eagle
  // ═══════════════════════════════════════════════════════════════════════
  function tnRestEagle(eagleId: string): boolean {
    const eagle = state.eagles.find((e) => e.id === eagleId);
    if (!eagle) return false;
    if (eagle.energy >= eagle.maxEnergy) return false;
    const restored = Math.min(eagle.maxEnergy, eagle.energy + 30);
    const healthRestored = Math.min(eagle.maxHealth, eagle.health + 20);
    const newState = { ...state };
    newState.eagles = newState.eagles.map((e) =>
      e.id === eagleId ? { ...e, energy: restored, health: healthRestored } : e,
    );
    setState(newState);
    tnPersist(newState);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Full Rest All Eagles
  // ═══════════════════════════════════════════════════════════════════════
  function tnRestAllEagles(): boolean {
    if (state.eagles.length === 0) return false;
    const newState = { ...state };
    newState.eagles = newState.eagles.map((e) => ({
      ...e,
      energy: e.maxEnergy,
      health: e.maxHealth,
    }));
    newState.eventLog = [
      ...newState.eventLog,
      tnCreateEventLog('rest', 'All eagles are fully rested and healed!', '所有老鹰已完全休息并恢复！'),
    ];
    setState(newState);
    tnPersist(newState);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Spend Gold
  // ═══════════════════════════════════════════════════════════════════════
  function tnSpendGold(amount: number): boolean {
    if (amount <= 0) return false;
    if (state.totalGold < amount) return false;
    const newState = { ...state, totalGold: state.totalGold - amount };
    setState(newState);
    tnPersist(newState);
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Reset All Data
  // ═══════════════════════════════════════════════════════════════════════
  function tnResetAll(): void {
    const newState = tnCreateDefaultState();
    setState(newState);
    tnPersist(newState);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTION: Manual Save
  // ═══════════════════════════════════════════════════════════════════════
  function tnManualSave(): void {
    tnPersist(state);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COMPUTED / DERIVED VALUES
  // ═══════════════════════════════════════════════════════════════════════

  const currentWeatherDef = tnGetWeatherById(state.currentWeather);
  const currentRankDef = tnGetRankByNumber(state.currentRank);
  const currentRankBonuses = tnGetRankBonuses(state.currentRank);
  const activeNestDef = tnGetNestById(state.activeNestId);
  const dailyPatrolStatus = tnCheckDailyPatrolReset(state.dailyPatrolDate);
  const averageEaglePower = tnGetAverageEaglePower(state.eagles);
  const strongestEagle = tnGetStrongestEagle(state.eagles);
  const fastestEagle = tnGetFastestEagle(state.eagles);
  const bestHunter = tnGetBestHunter(state.eagles);
  const bestFighter = tnGetBestFighter(state.eagles);
  const availableNests = tnGetAvailableNests(state.currentRank);
  const availablePatrols = tnGetAvailablePatrols(state.currentRank);
  const unlockedAchievements = tnGetUnlockedAchievements(state);
  const lockedAchievements = tnGetLockedAchievements(state);
  const xpProgress = tnGetXpProgress(state.totalXp, state.currentRank);
  const nextRankXp = tnGetNextRankXp(state.currentRank);
  const rankTierProgress = tnGetRankTierProgress(state.currentRank);
  const allClansDefeated = tnIsAllClansDefeated(state.rivalDefeatCounts);
  const recentEvents = tnGetRecentEvents(state.eventLog, 20);
  const eaglesByPower = tnSortEaglesByPower(state.eagles);
  const eaglesByLevel = tnSortEaglesByLevel(state.eagles);
  const eaglesByBond = tnSortEaglesByBond(state.eagles);

  // ═══════════════════════════════════════════════════════════════════════
  // RETURN HOOK VALUE
  // ═══════════════════════════════════════════════════════════════════════

  return {
    // ─── State ────────────────────────────────────────────────────────
    state,
    persistedAt,

    // ─── Actions ──────────────────────────────────────────────────────
    tnAcquireEagle,
    tnReleaseEagle,
    tnRenameEagle,
    tnStartTraining,
    tnHuntPrey,
    tnDefendTerritory,
    tnStartStormPatrol,
    tnSetActiveNest,
    tnChangeWeather,
    tnRestEagle,
    tnRestAllEagles,
    tnSpendGold,
    tnResetAll,
    tnManualSave,

    // ─── Computed Values ─────────────────────────────────────────────
    currentWeatherDef,
    currentRankDef,
    currentRankBonuses,
    activeNestDef,
    dailyPatrolStatus,
    averageEaglePower,
    strongestEagle,
    fastestEagle,
    bestHunter,
    bestFighter,
    availableNests,
    availablePatrols,
    unlockedAchievements,
    lockedAchievements,
    xpProgress,
    nextRankXp,
    rankTierProgress,
    allClansDefeated,
    recentEvents,
    eaglesByPower,
    eaglesByLevel,
    eaglesByBond,
  };
}
