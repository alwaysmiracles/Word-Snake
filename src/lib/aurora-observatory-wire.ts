// =============================================================================
// Aurora Observatory Wire — Astronomy Module for Word Snake
// =============================================================================
// SSR-safe: no localStorage, window, document, setInterval, addEventListener
// All exported functions use `au` prefix, all exported constants use `AU_` prefix
// Hook-based: useState + useCallback only, deps = [state]
// Target: ~1900 lines
// =============================================================================

import { useState, useCallback } from 'react';

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Types & Interfaces ──────────────────────────────────────────────────────

export type AUZoneId =
  | 'northern_lights_peak'
  | 'starlit_mesa'
  | 'polar_ice_cap'
  | 'equatorial_observatory'
  | 'mountain_summit'
  | 'desert_canyon'
  | 'coastal_cliff'
  | 'floating_island';

export type AURarity = 1 | 2 | 3 | 4 | 5;

export type AUAuroraId =
  | 'green_curtain'
  | 'red_arc'
  | 'purple_ribbon'
  | 'blue_veil'
  | 'yellow_band'
  | 'pink_corona'
  | 'white_flash'
  | 'multi_color_display'
  | 'scarlet_dance'
  | 'emerald_swirl'
  | 'indigo_wave'
  | 'golden_halo';

export type AUWeatherId =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'light_rain'
  | 'stormy'
  | 'foggy'
  | 'snowy'
  | 'windy'
  | 'overcast'
  | 'perfect';

export type AUTimeOfDay =
  | 'dawn'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'midnight';

export type AUStationId =
  | 'main_dome'
  | 'radio_tower'
  | 'spectroscopy_lab'
  | 'planetarium'
  | 'dark_room'
  | 'library'
  | 'control_center'
  | 'outdoor_pad';

export type AUObjectCategory =
  | 'star'
  | 'planet'
  | 'nebula'
  | 'galaxy'
  | 'comet'
  | 'asteroid'
  | 'constellation'
  | 'moon'
  | 'black_hole'
  | 'supernova'
  | 'pulsar'
  | 'cluster';

export interface AUZoneDef {
  readonly id: AUZoneId;
  readonly name: string;
  readonly nameCn: string;
  readonly description: string;
  readonly unlockLevel: number;
  readonly baseVisibility: number;
  readonly auroraChance: number;
  readonly latitude: number;
  readonly elevation: number;
  readonly specialties: AUObjectCategory[];
}

export interface AUCelestialObjectDef {
  readonly id: string;
  readonly name: string;
  readonly nameCn: string;
  readonly category: AUObjectCategory;
  readonly rarity: AURarity;
  readonly zone: AUZoneId | 'any';
  readonly magnitude: number;
  readonly description: string;
  readonly xpReward: number;
  readonly discoveryBonus: number;
}

export interface AUAuroraTypeDef {
  readonly id: AUAuroraId;
  readonly name: string;
  readonly nameCn: string;
  readonly colors: string[];
  readonly intensity: number;
  readonly rarity: number;
  readonly description: string;
  readonly bestZone: AUZoneId;
  readonly photoBonus: number;
}

export interface AUEquipmentDef {
  readonly id: string;
  readonly name: string;
  readonly nameCn: string;
  readonly category: 'telescope' | 'camera' | 'filter' | 'chart' | 'tool' | 'accessory';
  readonly effect: string;
  readonly visibilityBonus: number;
  readonly photoBonus: number;
  readonly discoveryBonus: number;
  readonly price: number;
  readonly unlockLevel: number;
  readonly rarity: AURarity;
}

export interface AUStationDef {
  readonly id: AUStationId;
  readonly name: string;
  readonly nameCn: string;
  readonly description: string;
  readonly unlockLevel: number;
  readonly upgradeCost: number;
  readonly maxLevel: number;
  readonly benefits: string[];
}

export interface AUNPCDef {
  readonly id: string;
  readonly name: string;
  readonly nameCn: string;
  readonly title: string;
  readonly titleCn: string;
  readonly personality: string;
  readonly personalityCn: string;
  readonly favoriteZone: AUZoneId;
  readonly tips: string[];
  readonly tipsCn: string[];
}

export interface AUQuestDef {
  readonly id: string;
  readonly name: string;
  readonly nameCn: string;
  readonly description: string;
  readonly descriptionCn: string;
  readonly requiredLevel: number;
  readonly steps: number;
  readonly rewardXP: number;
  readonly rewardCoins: number;
  readonly type: 'observation' | 'discovery' | 'photography' | 'research' | 'exploration' | 'social';
}

export interface AUAchievementDef {
  readonly id: string;
  readonly name: string;
  readonly nameCn: string;
  readonly description: string;
  readonly descriptionCn: string;
  readonly condition: string;
  readonly rewardXP: number;
  readonly rewardCoins: number;
  readonly icon: string;
}

export interface AUConstellationDef {
  readonly id: string;
  readonly name: string;
  readonly nameCn: string;
  readonly starIds: string[];
  readonly description: string;
  readonly season: 'spring' | 'summer' | 'autumn' | 'winter' | 'year_round';
  readonly xpReward: number;
  readonly coinReward: number;
}

export interface AUTitleDef {
  readonly level: number;
  readonly title: string;
  readonly titleCn: string;
}

export interface AUWeatherDef {
  readonly id: AUWeatherId;
  readonly name: string;
  readonly nameCn: string;
  readonly visibilityMod: number;
  readonly auroraMod: number;
  readonly description: string;
}

export interface AUPhotoCapture {
  readonly id: string;
  readonly auroraType: AUAuroraId;
  readonly zone: AUZoneId;
  readonly score: number;
  readonly timestamp: number;
  readonly equipment: string[];
  readonly rating: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AUNpcRelation {
  affinity: number;
  questsGiven: number;
  giftsReceived: number;
  lastInteraction: number;
}

export interface AuObservatoryState {
  level: number;
  xp: number;
  coins: number;
  seed: number;
  activeZone: AUZoneId;
  unlockedZones: AUZoneId[];
  discoveredObjects: string[];
  mappedConstellations: string[];
  constellationStarProgress: Record<string, string[]>;
  activeAurora: AUAuroraId | null;
  auroraStrength: number;
  auroraColors: string[];
  auroraHistory: AUPhotoCapture[];
  ownedEquipment: string[];
  equippedTelescope: string | null;
  equippedCamera: string | null;
  equippedFilter: string | null;
  unlockedStations: AUStationId[];
  currentStation: AUStationId;
  stationLevels: Record<string, number>;
  timeOfDay: AUTimeOfDay;
  weather: AUWeatherId;
  visibility: number;
  temperature: number;
  npcRelations: Record<string, AUNpcRelation>;
  activeQuests: string[];
  completedQuests: string[];
  questProgress: Record<string, number>;
  achievements: string[];
  dailySeed: number;
  dailyAurora: AUAuroraId | null;
  dailyConstellation: string | null;
  dailyCompleted: boolean;
  telescopeZoom: number;
  telescopeDirection: number;
  bestPhotoScore: number;
  title: string;
  titleCn: string;
  stats: {
    totalObservations: number;
    totalAuroras: number;
    totalPhotographs: number;
    totalConstellations: number;
    totalDiscoveries: number;
    totalQuests: number;
    totalNightsObserved: number;
    totalEquipmentBought: number;
    totalStationsVisited: number;
    totalStarsCharted: number;
    totalCoinsSpent: number;
    totalCoinsEarned: number;
  };
  uidCounter: number;
  observationLog: Array<{ objectId: string; timestamp: number; zone: AUZoneId }>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const AU_MAX_LEVEL = 50;

export const AU_RARITY_NAMES: Record<AURarity, string> = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Epic',
  5: 'Legendary',
};

export const AU_RARITY_NAMES_CN: Record<AURarity, string> = {
  1: '普通',
  2: '稀有',
  3: '珍贵',
  4: '史诗',
  5: '传说',
};

export const AU_ZONES: readonly AUZoneDef[] = [
  {
    id: 'northern_lights_peak', name: 'Northern Lights Peak', nameCn: '极光之巅',
    description: 'The premier aurora viewing site with 360° horizon views',
    unlockLevel: 1, baseVisibility: 95, auroraChance: 0.45, latitude: 69, elevation: 2800,
    specialties: ['constellation', 'nebula', 'pulsar'],
  },
  {
    id: 'starlit_mesa', name: 'Starlit Mesa', nameCn: '星光台地',
    description: 'A flat elevated plateau perfect for deep-sky observation',
    unlockLevel: 1, baseVisibility: 90, auroraChance: 0.10, latitude: 35, elevation: 1800,
    specialties: ['star', 'galaxy', 'cluster'],
  },
  {
    id: 'polar_ice_cap', name: 'Polar Ice Cap', nameCn: '极地冰盖',
    description: 'Frozen wasteland with pristine dark skies and frequent auroras',
    unlockLevel: 8, baseVisibility: 92, auroraChance: 0.50, latitude: 85, elevation: 100,
    specialties: ['comet', 'asteroid', 'supernova'],
  },
  {
    id: 'equatorial_observatory', name: 'Equatorial Observatory', nameCn: '赤道天文台',
    description: 'A professional-grade facility near the equator for planetary study',
    unlockLevel: 5, baseVisibility: 75, auroraChance: 0.02, latitude: 2, elevation: 4200,
    specialties: ['planet', 'moon', 'black_hole'],
  },
  {
    id: 'mountain_summit', name: 'Mountain Summit', nameCn: '高山之巅',
    description: 'Above the clouds with thin atmosphere for crisp observations',
    unlockLevel: 12, baseVisibility: 88, auroraChance: 0.15, latitude: 45, elevation: 3500,
    specialties: ['star', 'constellation', 'nebula'],
  },
  {
    id: 'desert_canyon', name: 'Desert Canyon', nameCn: '沙漠峡谷',
    description: 'Dry air and minimal light pollution in the remote desert',
    unlockLevel: 15, baseVisibility: 93, auroraChance: 0.05, latitude: 30, elevation: 800,
    specialties: ['galaxy', 'cluster', 'pulsar'],
  },
  {
    id: 'coastal_cliff', name: 'Coastal Cliff', nameCn: '海岸悬崖',
    description: 'Dramatic ocean horizon with reflection photography opportunities',
    unlockLevel: 20, baseVisibility: 82, auroraChance: 0.20, latitude: 55, elevation: 400,
    specialties: ['constellation', 'comet', 'nebula'],
  },
  {
    id: 'floating_island', name: 'Floating Island', nameCn: '浮空岛',
    description: 'A mystical elevated island above the clouds with unmatched views',
    unlockLevel: 30, baseVisibility: 98, auroraChance: 0.35, latitude: 60, elevation: 5000,
    specialties: ['black_hole', 'supernova', 'galaxy', 'pulsar'],
  },
];

export const AU_CELESTIAL_OBJECTS: readonly AUCelestialObjectDef[] = [
  // Stars (8)
  { id: 'sirius', name: 'Sirius', nameCn: '天狼星', category: 'star', rarity: 1, zone: 'any', magnitude: -1.46, description: 'The brightest star in the night sky', xpReward: 10, discoveryBonus: 5 },
  { id: 'polaris', name: 'Polaris', nameCn: '北极星', category: 'star', rarity: 1, zone: 'northern_lights_peak', magnitude: 1.98, description: 'The North Star, guide for navigators', xpReward: 15, discoveryBonus: 8 },
  { id: 'vega', name: 'Vega', nameCn: '织女星', category: 'star', rarity: 2, zone: 'starlit_mesa', magnitude: 0.03, description: 'A brilliant blue-white star in Lyra', xpReward: 20, discoveryBonus: 10 },
  { id: 'betelgeuse', name: 'Betelgeuse', nameCn: '参宿四', category: 'star', rarity: 2, zone: 'desert_canyon', magnitude: 0.42, description: 'A red supergiant on the brink of supernova', xpReward: 25, discoveryBonus: 12 },
  { id: 'rigel', name: 'Rigel', nameCn: '参宿七', category: 'star', rarity: 2, zone: 'mountain_summit', magnitude: 0.13, description: 'A blue supergiant in the Orion constellation', xpReward: 22, discoveryBonus: 11 },
  { id: 'aldebaran', name: 'Aldebaran', nameCn: '毕宿五', category: 'star', rarity: 3, zone: 'starlit_mesa', magnitude: 0.85, description: 'The fiery eye of Taurus the Bull', xpReward: 30, discoveryBonus: 15 },
  { id: 'antares', name: 'Antares', nameCn: '心宿二', category: 'star', rarity: 3, zone: 'equatorial_observatory', magnitude: 1.06, description: 'A red supergiant rivaling Mars in color', xpReward: 32, discoveryBonus: 16 },
  { id: 'deneb', name: 'Deneb', nameCn: '天津四', category: 'star', rarity: 3, zone: 'northern_lights_peak', magnitude: 1.25, description: 'Tail of the Swan, one of the Summer Triangle', xpReward: 28, discoveryBonus: 14 },
  // Planets (6)
  { id: 'mars', name: 'Mars', nameCn: '火星', category: 'planet', rarity: 1, zone: 'equatorial_observatory', magnitude: -2.9, description: 'The Red Planet, next frontier for exploration', xpReward: 25, discoveryBonus: 15 },
  { id: 'jupiter', name: 'Jupiter', nameCn: '木星', category: 'planet', rarity: 1, zone: 'equatorial_observatory', magnitude: -2.7, description: 'King of the planets with its Great Red Spot', xpReward: 30, discoveryBonus: 18 },
  { id: 'saturn', name: 'Saturn', nameCn: '土星', category: 'planet', rarity: 2, zone: 'equatorial_observatory', magnitude: 0.5, description: 'The ringed wonder of the solar system', xpReward: 35, discoveryBonus: 20 },
  { id: 'venus', name: 'Venus', nameCn: '金星', category: 'planet', rarity: 1, zone: 'coastal_cliff', magnitude: -4.6, description: 'The Evening Star, brightest natural object after the Moon', xpReward: 15, discoveryBonus: 10 },
  { id: 'neptune', name: 'Neptune', nameCn: '海王星', category: 'planet', rarity: 4, zone: 'equatorial_observatory', magnitude: 7.8, description: 'The distant ice giant with supersonic winds', xpReward: 60, discoveryBonus: 30 },
  { id: 'mercury', name: 'Mercury', nameCn: '水星', category: 'planet', rarity: 3, zone: 'desert_canyon', magnitude: -0.4, description: 'The swift planet closest to the Sun', xpReward: 40, discoveryBonus: 22 },
  // Nebulae (5)
  { id: 'orion_nebula', name: 'Orion Nebula', nameCn: '猎户座星云', category: 'nebula', rarity: 2, zone: 'starlit_mesa', magnitude: 4.0, description: 'A stellar nursery where new stars are born', xpReward: 45, discoveryBonus: 25 },
  { id: 'crab_nebula', name: 'Crab Nebula', nameCn: '蟹状星云', category: 'nebula', rarity: 3, zone: 'mountain_summit', magnitude: 8.4, description: 'Remnant of a supernova observed in 1054 AD', xpReward: 55, discoveryBonus: 28 },
  { id: 'eagle_nebula', name: 'Eagle Nebula', nameCn: '鹰状星云', category: 'nebula', rarity: 3, zone: 'desert_canyon', magnitude: 6.0, description: 'Home to the iconic Pillars of Creation', xpReward: 58, discoveryBonus: 30 },
  { id: 'ring_nebula', name: 'Ring Nebula', nameCn: '环状星云', category: 'nebula', rarity: 4, zone: 'floating_island', magnitude: 8.8, description: 'A perfect cosmic smoke ring in Lyra', xpReward: 70, discoveryBonus: 35 },
  { id: 'helix_nebula', name: 'Helix Nebula', nameCn: '螺旋星云', category: 'nebula', rarity: 4, zone: 'coastal_cliff', magnitude: 7.6, description: 'The Eye of God, a dying star planetary nebula', xpReward: 75, discoveryBonus: 38 },
  // Galaxies (5)
  { id: 'andromeda', name: 'Andromeda Galaxy', nameCn: '仙女座星系', category: 'galaxy', rarity: 2, zone: 'starlit_mesa', magnitude: 3.4, description: 'Our nearest major galaxy, on a collision course with the Milky Way', xpReward: 50, discoveryBonus: 28 },
  { id: 'whirlpool_galaxy', name: 'Whirlpool Galaxy', nameCn: '涡状星系', category: 'galaxy', rarity: 3, zone: 'desert_canyon', magnitude: 8.4, description: 'A grand-design spiral galaxy interacting with NGC 5195', xpReward: 65, discoveryBonus: 32 },
  { id: 'sombrero_galaxy', name: 'Sombrero Galaxy', nameCn: '草帽星系', category: 'galaxy', rarity: 3, zone: 'mountain_summit', magnitude: 8.0, description: 'A distinctive galaxy with a bright nucleus and dark dust lane', xpReward: 62, discoveryBonus: 30 },
  { id: 'triangulum_galaxy', name: 'Triangulum Galaxy', nameCn: '三角座星系', category: 'galaxy', rarity: 3, zone: 'northern_lights_peak', magnitude: 5.7, description: 'The third-largest member of our Local Group', xpReward: 58, discoveryBonus: 28 },
  { id: 'centaurus_a', name: 'Centaurus A', nameCn: '半人马座A', category: 'galaxy', rarity: 4, zone: 'equatorial_observatory', magnitude: 6.8, description: 'A powerful radio galaxy with a supermassive black hole', xpReward: 80, discoveryBonus: 40 },
  // Comets (3)
  { id: 'halley', name: "Halley's Comet", nameCn: '哈雷彗星', category: 'comet', rarity: 4, zone: 'polar_ice_cap', magnitude: 1.0, description: 'Returns every 76 years, the most famous periodic comet', xpReward: 85, discoveryBonus: 42 },
  { id: 'hale_bopp', name: 'Hale-Bopp', nameCn: '海尔-波普彗星', category: 'comet', rarity: 4, zone: 'starlit_mesa', magnitude: -1.0, description: 'The Great Comet of 1997, visible for 18 months', xpReward: 80, discoveryBonus: 40 },
  { id: 'neowise', name: 'NEOWISE', nameCn: '新智彗星', category: 'comet', rarity: 3, zone: 'mountain_summit', magnitude: 1.0, description: 'The bright comet of 2020, a once-in-a-lifetime sight', xpReward: 65, discoveryBonus: 32 },
  // Asteroids (2)
  { id: 'ceres', name: 'Ceres', nameCn: '谷神星', category: 'asteroid', rarity: 3, zone: 'equatorial_observatory', magnitude: 6.7, description: 'The largest object in the asteroid belt, a dwarf planet', xpReward: 40, discoveryBonus: 20 },
  { id: 'vesta', name: 'Vesta', nameCn: '灶神星', category: 'asteroid', rarity: 2, zone: 'equatorial_observatory', magnitude: 5.4, description: 'The brightest asteroid visible from Earth', xpReward: 35, discoveryBonus: 18 },
  // Black Holes (2)
  { id: 'sagittarius_a', name: 'Sagittarius A*', nameCn: '人马座A*', category: 'black_hole', rarity: 5, zone: 'floating_island', magnitude: 0, description: 'The supermassive black hole at the center of our galaxy', xpReward: 150, discoveryBonus: 75 },
  { id: 'cygnus_x1', name: 'Cygnus X-1', nameCn: '天鹅座X-1', category: 'black_hole', rarity: 5, zone: 'floating_island', magnitude: 8.9, description: 'The first widely accepted black hole candidate', xpReward: 140, discoveryBonus: 70 },
  // Supernovae (1)
  { id: 'sn1987a', name: 'SN 1987A', nameCn: 'SN 1987A超新星', category: 'supernova', rarity: 5, zone: 'floating_island', magnitude: 3.0, description: 'The nearest supernova observed in modern times', xpReward: 130, discoveryBonus: 65 },
  // Pulsars (2)
  { id: 'crab_pulsar', name: 'Crab Pulsar', nameCn: '蟹状脉冲星', category: 'pulsar', rarity: 4, zone: 'northern_lights_peak', magnitude: 16.5, description: 'A rapidly rotating neutron star at the heart of the Crab Nebula', xpReward: 90, discoveryBonus: 45 },
  { id: 'vrpulsar', name: 'Vela Pulsar', nameCn: '船帆座脉冲星', category: 'pulsar', rarity: 4, zone: 'desert_canyon', magnitude: 23.6, description: 'One of the nearest pulsars, a cosmic lighthouse', xpReward: 88, discoveryBonus: 44 },
  // Clusters (2)
  { id: 'pleiades', name: 'Pleiades', nameCn: '昴宿星团', category: 'cluster', rarity: 1, zone: 'starlit_mesa', magnitude: 1.6, description: 'The Seven Sisters, a stunning open star cluster', xpReward: 20, discoveryBonus: 12 },
  { id: 'hercules_cluster', name: 'Hercules Cluster', nameCn: '武仙座星团', category: 'cluster', rarity: 3, zone: 'mountain_summit', magnitude: 5.8, description: 'A great globular cluster of ancient stars', xpReward: 55, discoveryBonus: 28 },
  // Moon (1)
  { id: 'luna', name: 'The Moon', nameCn: '月球', category: 'moon', rarity: 1, zone: 'any', magnitude: -12.7, description: 'Our closest celestial companion, craters and maria', xpReward: 8, discoveryBonus: 4 },
];

export const AU_AURORA_TYPES: readonly AUAuroraTypeDef[] = [
  { id: 'green_curtain', name: 'Green Curtain', nameCn: '绿色帷幕', colors: ['#00ff88', '#44ffaa', '#22cc66'], intensity: 60, rarity: 0.30, description: 'The most common aurora, a sweeping green curtain of light', bestZone: 'northern_lights_peak', photoBonus: 10 },
  { id: 'red_arc', name: 'Red Arc', nameCn: '红色弧光', colors: ['#ff3333', '#cc2222', '#ff5544'], intensity: 70, rarity: 0.20, description: 'High-altitude red arcs caused by oxygen emissions', bestZone: 'polar_ice_cap', photoBonus: 20 },
  { id: 'purple_ribbon', name: 'Purple Ribbon', nameCn: '紫色丝带', colors: ['#9933ff', '#cc66ff', '#7722dd'], intensity: 75, rarity: 0.15, description: 'Elegant purple ribbons dancing across the sky', bestZone: 'coastal_cliff', photoBonus: 30 },
  { id: 'blue_veil', name: 'Blue Veil', nameCn: '蓝色面纱', colors: ['#3366ff', '#5588ff', '#2244dd'], intensity: 65, rarity: 0.10, description: 'A translucent blue veil shimmering overhead', bestZone: 'mountain_summit', photoBonus: 35 },
  { id: 'yellow_band', name: 'Yellow Band', nameCn: '黄色光带', colors: ['#ffcc00', '#ffdd44', '#ddaa00'], intensity: 55, rarity: 0.08, description: 'A rare yellow band of aurora at mid-latitudes', bestZone: 'starlit_mesa', photoBonus: 40 },
  { id: 'pink_corona', name: 'Pink Corona', nameCn: '粉红日冕', colors: ['#ff66aa', '#ff88cc', '#dd4488'], intensity: 80, rarity: 0.06, description: 'Brilliant pink corona crowning the aurora display', bestZone: 'northern_lights_peak', photoBonus: 50 },
  { id: 'white_flash', name: 'White Flash', nameCn: '白色闪光', colors: ['#ffffff', '#eeeeff', '#ddddee'], intensity: 90, rarity: 0.04, description: 'A rare flash of white light illuminating the entire sky', bestZone: 'polar_ice_cap', photoBonus: 60 },
  { id: 'multi_color_display', name: 'Multi-color Display', nameCn: '多彩展演', colors: ['#00ff88', '#ff3366', '#9933ff', '#ffcc00', '#3366ff'], intensity: 95, rarity: 0.03, description: 'An extraordinary multi-colored aurora filling the sky', bestZone: 'floating_island', photoBonus: 80 },
  { id: 'scarlet_dance', name: 'Scarlet Dance', nameCn: '猩红之舞', colors: ['#ff2244', '#ff4466', '#cc1133'], intensity: 85, rarity: 0.02, description: 'Dramatic crimson aurora waves pulsing and dancing', bestZone: 'polar_ice_cap', photoBonus: 70 },
  { id: 'emerald_swirl', name: 'Emerald Swirl', nameCn: '翡翠旋涡', colors: ['#00dd66', '#33ff88', '#00aa44'], intensity: 70, rarity: 0.01, description: 'A mesmerizing emerald spiral formation overhead', bestZone: 'northern_lights_peak', photoBonus: 75 },
  { id: 'indigo_wave', name: 'Indigo Wave', nameCn: '靛蓝波浪', colors: ['#4422ff', '#6644ff', '#3311cc'], intensity: 78, rarity: 0.008, description: 'Deep indigo waves rolling across the heavens', bestZone: 'coastal_cliff', photoBonus: 85 },
  { id: 'golden_halo', name: 'Golden Halo', nameCn: '金色光环', colors: ['#ffaa00', '#ffcc33', '#dd8800'], intensity: 88, rarity: 0.002, description: 'A legendary golden halo surrounding the zenith', bestZone: 'floating_island', photoBonus: 100 },
];

export const AU_EQUIPMENT: readonly AUEquipmentDef[] = [
  { id: 'basic_refractor', name: 'Basic Refractor', nameCn: '基础折射镜', category: 'telescope', effect: 'visibility+10', visibilityBonus: 10, photoBonus: 0, discoveryBonus: 0, price: 50, unlockLevel: 1, rarity: 1 },
  { id: 'advanced_reflector', name: 'Advanced Reflector', nameCn: '高级反射镜', category: 'telescope', effect: 'visibility+20', visibilityBonus: 20, photoBonus: 0, discoveryBonus: 5, price: 200, unlockLevel: 5, rarity: 2 },
  { id: 'schmidt_cassegrain', name: 'Schmidt-Cassegrain', nameCn: '施密特-卡塞格林', category: 'telescope', effect: 'visibility+35', visibilityBonus: 35, photoBonus: 5, discoveryBonus: 10, price: 600, unlockLevel: 12, rarity: 3 },
  { id: 'radio_telescope', name: 'Radio Telescope', nameCn: '射电望远镜', category: 'telescope', effect: 'pulsar+blackhole', visibilityBonus: 15, photoBonus: 0, discoveryBonus: 20, price: 800, unlockLevel: 18, rarity: 4 },
  { id: 'hubble_replica', name: 'Hubble Replica', nameCn: '哈勃复制品', category: 'telescope', effect: 'visibility+50', visibilityBonus: 50, photoBonus: 10, discoveryBonus: 25, price: 2000, unlockLevel: 30, rarity: 5 },
  { id: 'spectroscope', name: 'Spectroscope', nameCn: '光谱仪', category: 'tool', effect: 'star_analysis', visibilityBonus: 5, photoBonus: 0, discoveryBonus: 15, price: 150, unlockLevel: 8, rarity: 2 },
  { id: 'star_chart_basic', name: 'Basic Star Chart', nameCn: '基础星图', category: 'chart', effect: 'constellation+5', visibilityBonus: 0, photoBonus: 0, discoveryBonus: 10, price: 30, unlockLevel: 1, rarity: 1 },
  { id: 'star_chart_advanced', name: 'Advanced Star Chart', nameCn: '高级星图', category: 'chart', effect: 'constellation+15', visibilityBonus: 0, photoBonus: 0, discoveryBonus: 20, price: 200, unlockLevel: 15, rarity: 3 },
  { id: 'dslr_camera', name: 'DSLR Camera', nameCn: '单反相机', category: 'camera', effect: 'photo+20', visibilityBonus: 0, photoBonus: 20, discoveryBonus: 0, price: 100, unlockLevel: 3, rarity: 1 },
  { id: 'astro_camera', name: 'Astrophotography Camera', nameCn: '天文摄影相机', category: 'camera', effect: 'photo+40', visibilityBonus: 0, photoBonus: 40, discoveryBonus: 5, price: 500, unlockLevel: 12, rarity: 3 },
  { id: 'deep_sky_camera', name: 'Deep Sky Camera', nameCn: '深空相机', category: 'camera', effect: 'photo+60', visibilityBonus: 0, photoBonus: 60, discoveryBonus: 10, price: 1500, unlockLevel: 25, rarity: 4 },
  { id: 'h_alpha_filter', name: 'H-alpha Filter', nameCn: 'H-alpha滤光片', category: 'filter', effect: 'nebula+30', visibilityBonus: 10, photoBonus: 15, discoveryBonus: 8, price: 80, unlockLevel: 6, rarity: 2 },
  { id: 'uv_filter', name: 'UV Filter', nameCn: '紫外滤光片', category: 'filter', effect: 'protection', visibilityBonus: 3, photoBonus: 5, discoveryBonus: 3, price: 40, unlockLevel: 2, rarity: 1 },
  { id: 'polarizing_filter', name: 'Polarizing Filter', nameCn: '偏振滤光片', category: 'filter', effect: 'contrast+25', visibilityBonus: 8, photoBonus: 25, discoveryBonus: 5, price: 120, unlockLevel: 10, rarity: 2 },
  { id: 'nebula_filter', name: 'Nebula Filter', nameCn: '星云滤光片', category: 'filter', effect: 'nebula+50', visibilityBonus: 15, photoBonus: 35, discoveryBonus: 12, price: 350, unlockLevel: 18, rarity: 3 },
  { id: 'binoculars', name: 'Binoculars', nameCn: '双筒望远镜', category: 'telescope', effect: 'visibility+5', visibilityBonus: 5, photoBonus: 0, discoveryBonus: 3, price: 25, unlockLevel: 1, rarity: 1 },
  { id: 'mount_tracker', name: 'Equatorial Mount Tracker', nameCn: '赤道仪追踪器', category: 'accessory', effect: 'tracking', visibilityBonus: 8, photoBonus: 15, discoveryBonus: 8, price: 250, unlockLevel: 8, rarity: 2 },
  { id: 'laser_pointer', name: 'Green Laser Pointer', nameCn: '绿色激光笔', category: 'accessory', effect: 'pointing', visibilityBonus: 2, photoBonus: 0, discoveryBonus: 5, price: 20, unlockLevel: 1, rarity: 1 },
  { id: 'light_meter', name: 'Light Meter', nameCn: '测光表', category: 'tool', effect: 'measurement', visibilityBonus: 5, photoBonus: 10, discoveryBonus: 5, price: 70, unlockLevel: 4, rarity: 1 },
  { id: 'planisphere', name: 'Planisphere', nameCn: '活动星图', category: 'chart', effect: 'season_map', visibilityBonus: 3, photoBonus: 0, discoveryBonus: 12, price: 45, unlockLevel: 3, rarity: 1 },
  { id: 'ccd_sensor', name: 'CCD Sensor', nameCn: 'CCD传感器', category: 'camera', effect: 'digital_capture', visibilityBonus: 0, photoBonus: 50, discoveryBonus: 15, price: 1200, unlockLevel: 22, rarity: 4 },
  { id: 'solar_filter', name: 'Solar Filter', nameCn: '太阳滤光片', category: 'filter', effect: 'safe_solar', visibilityBonus: 5, photoBonus: 10, discoveryBonus: 3, price: 60, unlockLevel: 5, rarity: 1 },
];

export const AU_STATIONS: readonly AUStationDef[] = [
  { id: 'main_dome', name: 'Main Dome', nameCn: '主穹顶', description: 'The central observation dome with the primary telescope', unlockLevel: 1, upgradeCost: 100, maxLevel: 5, benefits: ['visibility_boost', 'aurora_detection'] },
  { id: 'radio_tower', name: 'Radio Tower', nameCn: '射电塔', description: 'A tower for detecting cosmic radio signals', unlockLevel: 8, upgradeCost: 200, maxLevel: 5, benefits: ['radio_detection', 'pulsar_bonus'] },
  { id: 'spectroscopy_lab', name: 'Spectroscopy Lab', nameCn: '光谱实验室', description: 'Analyze light spectra from distant objects', unlockLevel: 12, upgradeCost: 300, maxLevel: 5, benefits: ['star_analysis', 'composition_data'] },
  { id: 'planetarium', name: 'Planetarium', nameCn: '天文馆', description: 'Indoor sky projection for teaching and shows', unlockLevel: 5, upgradeCost: 150, maxLevel: 5, benefits: ['constellation_learning', 'xp_bonus'] },
  { id: 'dark_room', name: 'Dark Room', nameCn: '暗室', description: 'Process and develop astrophotography', unlockLevel: 10, upgradeCost: 250, maxLevel: 5, benefits: ['photo_quality', 'photo_xp_bonus'] },
  { id: 'library', name: 'Library', nameCn: '图书馆', description: 'Contains astronomical records and research papers', unlockLevel: 3, upgradeCost: 80, maxLevel: 5, benefits: ['discovery_hint', 'quest_rewards'] },
  { id: 'control_center', name: 'Control Center', nameCn: '控制中心', description: 'Central hub monitoring all systems and weather', unlockLevel: 15, upgradeCost: 400, maxLevel: 5, benefits: ['weather_forecast', 'auto_track'] },
  { id: 'outdoor_pad', name: 'Outdoor Pad', nameCn: '室外观测台', description: 'Open-air observation area for naked-eye viewing', unlockLevel: 1, upgradeCost: 60, maxLevel: 5, benefits: ['wide_view', 'aurora_ready'] },
];

export const AU_NPCS: readonly AUNPCDef[] = [
  {
    id: 'chief_astronomer', name: 'Dr. Aurora Chen', nameCn: '首席天文学家',
    title: 'Chief Astronomer', titleCn: '首席天文学家',
    personality: 'Brilliant but eccentric, lives for the night sky', personalityCn: '才华横溢但有些古怪，为星空而活',
    favoriteZone: 'northern_lights_peak',
    tips: ['Try observing during new moon for the darkest skies', 'The green aurora is caused by oxygen at 100km altitude'],
    tipsCn: ['新月期间观测能获得最暗的天空', '绿色极光是由100公里高空的氧原子产生的'],
  },
  {
    id: 'photographer', name: 'Kai Nakamura', nameCn: '摄影师',
    title: 'Aurora Photographer', titleCn: '极光摄影师',
    personality: 'Patient artist who waits hours for the perfect shot', personalityCn: '耐心的艺术家，为完美的照片可以等待数小时',
    favoriteZone: 'coastal_cliff',
    tips: ['Use a tripod and long exposure for aurora photography', 'The blue hour after sunset is magical'],
    tipsCn: ['使用三脚架和长曝光拍摄极光', '日落后的蓝色时刻非常迷人'],
  },
  {
    id: 'meteorologist', name: 'Dr. Sven Bjornsson', nameCn: '气象学家',
    title: 'Space Weather Expert', titleCn: '空间气象专家',
    personality: 'Analytical and precise, always studying atmospheric patterns', personalityCn: '分析能力强且精确，始终在研究大气模式',
    favoriteZone: 'polar_ice_cap',
    tips: ['Clear skies after a storm often bring the best aurora', 'Solar wind speed affects aurora intensity'],
    tipsCn: ['暴风雨后的晴空通常带来最好的极光', '太阳风速影响极光强度'],
  },
  {
    id: 'historian', name: 'Prof. Maria Santos', nameCn: '历史学家',
    title: 'History of Astronomy', titleCn: '天文史学家',
    personality: 'Warm storyteller who connects ancient myths to modern science', personalityCn: '温暖的故事讲述者，将古代神话与现代科学联系在一起',
    favoriteZone: 'starlit_mesa',
    tips: ['Ancient Egyptians aligned pyramids to Orion', 'The Greeks named planets after their gods'],
    tipsCn: ['古埃及人将金字塔与猎户座对齐', '希腊人以神的名字命名行星'],
  },
  {
    id: 'engineer', name: 'Raj Patel', nameCn: '工程师',
    title: 'Chief Engineer', titleCn: '总工程师',
    personality: 'Practical problem-solver who keeps all equipment running', personalityCn: '务实的解决问题者，保持所有设备运转',
    favoriteZone: 'equatorial_observatory',
    tips: ['Keep your lenses clean for sharper images', 'Calibrate your mount for better tracking'],
    tipsCn: ['保持镜头清洁以获得更清晰的图像', '校准赤道仪以获得更好的追踪'],
  },
  {
    id: 'guide', name: 'Astrid Larsen', nameCn: '向导',
    title: 'Night Sky Guide', titleCn: '夜空向导',
    personality: 'Enthusiastic and welcoming, makes astronomy accessible to all', personalityCn: '热情好客，让每个人都能接触天文学',
    favoriteZone: 'mountain_summit',
    tips: ['Start with the Big Dipper to find Polaris', 'Your eyes need 20 minutes to fully adapt to darkness'],
    tipsCn: ['从北斗七星开始寻找北极星', '你的眼睛需要20分钟才能完全适应黑暗'],
  },
];

export const AU_QUESTS: readonly AUQuestDef[] = [
  { id: 'q_first_light', name: 'First Light', nameCn: '初光', description: 'Discover your first celestial object', descriptionCn: '发现你的第一个天体', requiredLevel: 1, steps: 1, rewardXP: 50, rewardCoins: 50, type: 'observation' },
  { id: 'q_aurora_hunter', name: 'Aurora Hunter', nameCn: '极光猎手', description: 'Observe 5 different aurora types', descriptionCn: '观察5种不同的极光类型', requiredLevel: 3, steps: 5, rewardXP: 200, rewardCoins: 150, type: 'observation' },
  { id: 'q_constellation_mapper', name: 'Constellation Mapper', nameCn: '星座测绘师', description: 'Map 3 complete constellations', descriptionCn: '测绘3个完整的星座', requiredLevel: 5, steps: 3, rewardXP: 300, rewardCoins: 200, type: 'discovery' },
  { id: 'q_deep_sky_explorer', name: 'Deep Sky Explorer', nameCn: '深空探索者', description: 'Discover 3 nebulae or galaxies', descriptionCn: '发现3个星云或星系', requiredLevel: 8, steps: 3, rewardXP: 400, rewardCoins: 300, type: 'exploration' },
  { id: 'q_photo_mastery', name: 'Photo Mastery', nameCn: '摄影大师', description: 'Take 10 aurora photographs with rare or higher quality', descriptionCn: '拍摄10张稀有或更高质量的照片', requiredLevel: 12, steps: 10, rewardXP: 500, rewardCoins: 400, type: 'photography' },
  { id: 'q_research_pioneer', name: 'Research Pioneer', nameCn: '研究先驱', description: 'Visit all 8 research stations', descriptionCn: '访问所有8个研究站', requiredLevel: 15, steps: 8, rewardXP: 600, rewardCoins: 500, type: 'research' },
  { id: 'q_social_astronomer', name: 'Social Astronomer', nameCn: '社交天文学家', description: 'Talk to all 6 NPCs and reach affinity 50 with each', descriptionCn: '与所有6个NPC交谈并达到50好感度', requiredLevel: 10, steps: 6, rewardXP: 350, rewardCoins: 250, type: 'social' },
  { id: 'q_legendary_discovery', name: 'Legendary Discovery', nameCn: '传说发现', description: 'Discover a legendary-rarity celestial object', descriptionCn: '发现一个传说级天体', requiredLevel: 20, steps: 1, rewardXP: 1000, rewardCoins: 800, type: 'discovery' },
  { id: 'q_equipment_collector', name: 'Equipment Collector', nameCn: '装备收藏家', description: 'Own 10 different pieces of equipment', descriptionCn: '拥有10件不同的装备', requiredLevel: 18, steps: 10, rewardXP: 450, rewardCoins: 350, type: 'research' },
  { id: 'q_cosmic_oracle', name: 'Cosmic Oracle', nameCn: '宇宙神谕', description: 'Reach level 50 and observe every aurora type', descriptionCn: '达到50级并观察所有极光类型', requiredLevel: 50, steps: 12, rewardXP: 5000, rewardCoins: 5000, type: 'observation' },
];

export const AU_ACHIEVEMENTS: readonly AUAchievementDef[] = [
  { id: 'ach_first_star', name: 'First Star', nameCn: '第一颗星', description: 'Discover your first celestial object', descriptionCn: '发现你的第一个天体', condition: 'discoveredObjects.length >= 1', rewardXP: 25, rewardCoins: 10, icon: '⭐' },
  { id: 'ach_ten_objects', name: 'Sky Surveyor', nameCn: '天空勘测员', description: 'Discover 10 celestial objects', descriptionCn: '发现10个天体', condition: 'discoveredObjects.length >= 10', rewardXP: 100, rewardCoins: 50, icon: '🔭' },
  { id: 'ach_all_objects', name: 'Master Cataloger', nameCn: '大师编目者', description: 'Discover all 37 celestial objects', descriptionCn: '发现全部37个天体', condition: 'discoveredObjects.length >= 37', rewardXP: 2000, rewardCoins: 1000, icon: '🌌' },
  { id: 'ach_first_aurora', name: 'Aurora Borealis!', nameCn: '北极光！', description: 'Observe your first aurora', descriptionCn: '观察你的第一次极光', condition: 'stats.totalAuroras >= 1', rewardXP: 50, rewardCoins: 25, icon: '💚' },
  { id: 'ach_all_auroras', name: 'Aurora Master', nameCn: '极光大师', description: 'Observe all 12 aurora types', descriptionCn: '观察全部12种极光类型', condition: 'stats.totalAuroras >= 12', rewardXP: 1500, rewardCoins: 750, icon: '🌈' },
  { id: 'ach_first_photo', name: 'Snapshot!', nameCn: '快照！', description: 'Take your first aurora photograph', descriptionCn: '拍摄你的第一张极光照片', condition: 'stats.totalPhotographs >= 1', rewardXP: 30, rewardCoins: 15, icon: '📸' },
  { id: 'ach_epic_photo', name: 'Epic Capture', nameCn: '史诗级拍摄', description: 'Take an epic-rated photograph', descriptionCn: '拍摄一张史诗级照片', condition: 'bestPhotoScore >= 85', rewardXP: 300, rewardCoins: 150, icon: '🏆' },
  { id: 'ach_legendary_photo', name: 'Legendary Shot', nameCn: '传说级拍摄', description: 'Take a legendary-rated photograph', descriptionCn: '拍摄一张传说级照片', condition: 'bestPhotoScore >= 95', rewardXP: 500, rewardCoins: 250, icon: '👑' },
  { id: 'ach_constellation_1', name: 'Star Pattern', nameCn: '星形图案', description: 'Map your first constellation', descriptionCn: '测绘你的第一个星座', condition: 'mappedConstellations.length >= 1', rewardXP: 75, rewardCoins: 40, icon: '✨' },
  { id: 'ach_constellation_5', name: 'Constellation Cartographer', nameCn: '星座制图师', description: 'Map 5 constellations', descriptionCn: '测绘5个星座', condition: 'mappedConstellations.length >= 5', rewardXP: 500, rewardCoins: 250, icon: '🗺️' },
  { id: 'ach_zone_explorer', name: 'World Traveler', nameCn: '环球旅行者', description: 'Visit all 8 sky zones', descriptionCn: '访问所有8个天空区域', condition: 'unlockedZones.length >= 8', rewardXP: 600, rewardCoins: 300, icon: '🌍' },
  { id: 'ach_quest_5', name: 'Quest Hunter', nameCn: '任务猎人', description: 'Complete 5 quests', descriptionCn: '完成5个任务', condition: 'completedQuests.length >= 5', rewardXP: 250, rewardCoins: 125, icon: '📜' },
  { id: 'ach_quest_10', name: 'Expedition Master', nameCn: '远征大师', description: 'Complete all 10 quests', descriptionCn: '完成全部10个任务', condition: 'completedQuests.length >= 10', rewardXP: 2000, rewardCoins: 1000, icon: '🎖️' },
  { id: 'ach_night_owl', name: 'Night Owl', nameCn: '夜猫子', description: 'Observe during 50 different nights', descriptionCn: '在50个不同的夜晚进行观测', condition: 'stats.totalNightsObserved >= 50', rewardXP: 400, rewardCoins: 200, icon: '🦉' },
  { id: 'ach_level_50', name: 'Cosmic Oracle', nameCn: '宇宙神谕', description: 'Reach the maximum level of 50', descriptionCn: '达到最高等级50', condition: 'level >= 50', rewardXP: 3000, rewardCoins: 1500, icon: '🌟' },
];

export const AU_CONSTELLATIONS: readonly AUConstellationDef[] = [
  { id: 'ursa_major', name: 'Ursa Major', nameCn: '大熊座', starIds: ['dubhe', 'merak', 'phecda', 'megrez', 'alioth', 'mizar', 'alkaid'], description: 'The Great Bear, home to the Big Dipper asterism', season: 'spring', xpReward: 80, coinReward: 40 },
  { id: 'orion', name: 'Orion', nameCn: '猎户座', starIds: ['betelgeuse_obj', 'rigel_obj', 'bellatrix', 'mintaka', 'alnilam', 'alnitak', 'saiph'], description: 'The Hunter, one of the most recognizable constellations', season: 'winter', xpReward: 100, coinReward: 50 },
  { id: 'cygnus', name: 'Cygnus', nameCn: '天鹅座', starIds: ['deneb_obj', 'sadr', 'gienah', 'albireo', 'epsilon_cygni'], description: 'The Swan flying along the Milky Way', season: 'summer', xpReward: 90, coinReward: 45 },
  { id: 'cassiopeia', name: 'Cassiopeia', nameCn: '仙后座', starIds: ['schedar', 'caph', 'gamma_cas', 'ruchbah', 'segin'], description: 'The Queen on her throne, W-shaped pattern', season: 'autumn', xpReward: 85, coinReward: 42 },
  { id: 'scorpius', name: 'Scorpius', nameCn: '天蝎座', starIds: ['antares_obj', 'shaula', 'sargas', 'dschubba', 'graffias', 'acrab'], description: 'The Scorpion with its red heart Antares', season: 'summer', xpReward: 95, coinReward: 48 },
  { id: 'leo', name: 'Leo', nameCn: '狮子座', starIds: ['regulus', 'denebola', 'algieba', 'zosma', 'chertan'], description: 'The Lion, a zodiac constellation', season: 'spring', xpReward: 88, coinReward: 44 },
  { id: 'lyra', name: 'Lyra', nameCn: '天琴座', starIds: ['vega_obj', 'sheliak', 'sulafat', 'delta2_lyrae'], description: 'The Lyre, with brilliant Vega as its brightest star', season: 'summer', xpReward: 75, coinReward: 38 },
  { id: 'gemini', name: 'Gemini', nameCn: '双子座', starIds: ['castor', 'pollux', 'alhena', 'tejat', 'mebsuta', 'wasat'], description: 'The Twins, featuring Castor and Pollux', season: 'winter', xpReward: 82, coinReward: 41 },
  { id: 'taurus', name: 'Taurus', nameCn: '金牛座', starIds: ['aldebaran_obj', 'elnath', 'alcyone', 'celestia'], description: 'The Bull, with the Pleiades star cluster', season: 'winter', xpReward: 92, coinReward: 46 },
  { id: 'aquila', name: 'Aquila', nameCn: '天鹰座', starIds: ['altair', 'tarazed', 'alshain', 'deneb_el_okab'], description: 'The Eagle, part of the Summer Triangle', season: 'summer', xpReward: 78, coinReward: 39 },
];

export const AU_TITLES: readonly AUTitleDef[] = [
  { level: 1, title: 'Stargazer', titleCn: '观星者' },
  { level: 8, title: 'Sky Watcher', titleCn: '天空守望者' },
  { level: 15, title: 'Aurora Seeker', titleCn: '极光追寻者' },
  { level: 22, title: 'Star Navigator', titleCn: '星辰领航员' },
  { level: 30, title: 'Cosmic Explorer', titleCn: '宇宙探索者' },
  { level: 37, title: 'Nebula Sage', titleCn: '星云贤者' },
  { level: 44, title: 'Galaxy Keeper', titleCn: '星系守护者' },
  { level: 50, title: 'Cosmic Oracle', titleCn: '宇宙神谕' },
];

export const AU_WEATHER: readonly AUWeatherDef[] = [
  { id: 'clear', name: 'Clear', nameCn: '晴朗', visibilityMod: 1.0, auroraMod: 1.0, description: 'Perfectly clear skies' },
  { id: 'partly_cloudy', name: 'Partly Cloudy', nameCn: '局部多云', visibilityMod: 0.8, auroraMod: 0.7, description: 'Some clouds but still good viewing' },
  { id: 'cloudy', name: 'Cloudy', nameCn: '多云', visibilityMod: 0.4, auroraMod: 0.3, description: 'Mostly overcast, limited viewing' },
  { id: 'light_rain', name: 'Light Rain', nameCn: '小雨', visibilityMod: 0.2, auroraMod: 0.1, description: 'Rainy with brief clear patches' },
  { id: 'stormy', name: 'Stormy', nameCn: '暴风雨', visibilityMod: 0.1, auroraMod: 0.0, description: 'Severe weather, no observation possible' },
  { id: 'foggy', name: 'Foggy', nameCn: '有雾', visibilityMod: 0.3, auroraMod: 0.2, description: 'Dense fog obscuring the sky' },
  { id: 'snowy', name: 'Snowy', nameCn: '下雪', visibilityMod: 0.5, auroraMod: 0.6, description: 'Snowfall but auroras may still be visible' },
  { id: 'windy', name: 'Windy', nameCn: '大风', visibilityMod: 0.7, auroraMod: 0.8, description: 'Strong winds, telescope tracking affected' },
  { id: 'overcast', name: 'Overcast', nameCn: '阴天', visibilityMod: 0.15, auroraMod: 0.1, description: 'Complete cloud cover' },
  { id: 'perfect', name: 'Perfect', nameCn: '完美', visibilityMod: 1.2, auroraMod: 1.5, description: 'Exceptionally clear and stable atmosphere' },
];

export const AU_TIME_PERIODS: readonly { id: AUTimeOfDay; name: string; nameCn: string; visibilityMod: number; auroraMod: number }[] = [
  { id: 'dawn', name: 'Dawn', nameCn: '黎明', visibilityMod: 0.3, auroraMod: 0.0 },
  { id: 'morning', name: 'Morning', nameCn: '上午', visibilityMod: 0.0, auroraMod: 0.0 },
  { id: 'afternoon', name: 'Afternoon', nameCn: '下午', visibilityMod: 0.0, auroraMod: 0.0 },
  { id: 'evening', name: 'Evening', nameCn: '傍晚', visibilityMod: 0.5, auroraMod: 0.2 },
  { id: 'night', name: 'Night', nameCn: '夜晚', visibilityMod: 1.0, auroraMod: 1.0 },
  { id: 'midnight', name: 'Midnight', nameCn: '午夜', visibilityMod: 1.1, auroraMod: 1.3 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function auXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getEffectiveVisibility(state: AuObservatoryState): number {
  const zone = AU_ZONES.find((z) => z.id === state.activeZone);
  const weather = AU_WEATHER.find((w) => w.id === state.weather);
  const time = AU_TIME_PERIODS.find((t) => t.id === state.timeOfDay);
  const baseVis = zone?.baseVisibility ?? 80;
  const weatherMod = weather?.visibilityMod ?? 1;
  const timeMod = time?.visibilityMod ?? 0;
  let equipBonus = 0;
  const equipIds = [state.equippedTelescope, state.equippedCamera, state.equippedFilter].filter(Boolean) as string[];
  for (const eid of equipIds) {
    const eq = AU_EQUIPMENT.find((e) => e.id === eid);
    if (eq) equipBonus += eq.visibilityBonus;
  }
  const stationLevel = state.stationLevels['main_dome'] ?? 0;
  const stationBonus = stationLevel * 3;
  return clamp(Math.floor(baseVis * weatherMod * timeMod + equipBonus + stationBonus), 0, 100);
}

function getCurrentTitle(level: number): AUTitleDef {
  let title = AU_TITLES[0];
  for (const t of AU_TITLES) {
    if (level >= t.level) title = t;
  }
  return title;
}

function evaluatePhotoScore(
  auroraType: AUAuroraId,
  equipment: string[],
  visibility: number,
  auroraStrength: number,
  zone: AUZoneId
): number {
  const aurora = AU_AURORA_TYPES.find((a) => a.id === auroraType);
  let score = Math.floor(visibility * 0.3 + auroraStrength * 0.4);
  if (aurora) score += Math.floor(aurora.photoBonus * 0.3);
  const auroraDef = AU_ZONES.find((z) => z.id === zone);
  if (aurora && auroraDef && aurora.bestZone === zone) score += 10;
  let photoBonus = 0;
  for (const eid of equipment) {
    const eq = AU_EQUIPMENT.find((e) => e.id === eid);
    if (eq) photoBonus += eq.photoBonus;
  }
  score += Math.floor(photoBonus * 0.2);
  return clamp(score, 0, 100);
}

function ratePhoto(score: number): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  if (score >= 95) return 'legendary';
  if (score >= 80) return 'epic';
  if (score >= 60) return 'rare';
  if (score >= 35) return 'uncommon';
  return 'common';
}

// ─── Initial State ───────────────────────────────────────────────────────────

function createInitialState(seed?: number): AuObservatoryState {
  const baseSeed = seed ?? 42;
  const rng = mulberry32(baseSeed);
  const allAuroras = AU_AURORA_TYPES.map((a) => a.id);
  const allConstellations = AU_CONSTELLATIONS.map((c) => c.id);

  const initialNpcRelations: Record<string, AUNpcRelation> = {};
  for (const npc of AU_NPCS) {
    initialNpcRelations[npc.id] = { affinity: 0, questsGiven: 0, giftsReceived: 0, lastInteraction: 0 };
  }

  const initialStationLevels: Record<string, number> = {};
  for (const st of AU_STATIONS) {
    initialStationLevels[st.id] = 0;
  }

  const title = getCurrentTitle(1);

  return {
    level: 1,
    xp: 0,
    coins: 100,
    seed: baseSeed,
    activeZone: 'northern_lights_peak',
    unlockedZones: ['northern_lights_peak', 'starlit_mesa'],
    discoveredObjects: [],
    mappedConstellations: [],
    constellationStarProgress: {},
    activeAurora: null,
    auroraStrength: 0,
    auroraColors: [],
    auroraHistory: [],
    ownedEquipment: ['basic_refractor', 'binoculars'],
    equippedTelescope: 'basic_refractor',
    equippedCamera: null,
    equippedFilter: null,
    unlockedStations: ['main_dome', 'outdoor_pad'],
    currentStation: 'main_dome',
    stationLevels: initialStationLevels,
    timeOfDay: 'night',
    weather: 'clear',
    visibility: 95,
    temperature: -5,
    npcRelations: initialNpcRelations,
    activeQuests: [],
    completedQuests: [],
    questProgress: {},
    achievements: [],
    dailySeed: Math.floor(rng() * 100000),
    dailyAurora: allAuroras[Math.floor(rng() * allAuroras.length)],
    dailyConstellation: allConstellations[Math.floor(rng() * allConstellations.length)],
    dailyCompleted: false,
    telescopeZoom: 1,
    telescopeDirection: 0,
    bestPhotoScore: 0,
    title: title.title,
    titleCn: title.titleCn,
    stats: {
      totalObservations: 0,
      totalAuroras: 0,
      totalPhotographs: 0,
      totalConstellations: 0,
      totalDiscoveries: 0,
      totalQuests: 0,
      totalNightsObserved: 0,
      totalEquipmentBought: 0,
      totalStationsVisited: 0,
      totalStarsCharted: 0,
      totalCoinsSpent: 0,
      totalCoinsEarned: 0,
    },
    uidCounter: 1,
    observationLog: [],
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export default function useAuroraObservatory(initialSeed?: number) {
  const [state, setState] = useState<AuObservatoryState>(() => createInitialState(initialSeed));

  // ── Core State ───────────────────────────────────────────────────────────

  const auGetState = useCallback((): Readonly<AuObservatoryState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const auResetState = useCallback((newSeed?: number) => {
    setState(createInitialState(newSeed));
  }, []);

  // ── Level & XP ──────────────────────────────────────────────────────────

  const auGetLevel = useCallback((): number => {
    return state.level;
  }, [state]);

  const auGetXp = useCallback((): number => {
    return state.xp;
  }, [state]);

  const auGetXpToNext = useCallback((): number => {
    if (state.level >= AU_MAX_LEVEL) return 0;
    return auXPRequiredForLevel(state.level + 1);
  }, [state]);

  const auAddXp = useCallback((amount: number): void => {
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < AU_MAX_LEVEL && xp >= auXPRequiredForLevel(level)) {
        xp -= auXPRequiredForLevel(level);
        level += 1;
      }
      if (level >= AU_MAX_LEVEL) { level = AU_MAX_LEVEL; xp = 0; }
      const t = getCurrentTitle(level);
      return { ...prev, level, xp, title: t.title, titleCn: t.titleCn };
    });
  }, []);

  const auGetTitle = useCallback((): { title: string; titleCn: string } => {
    return { title: state.title, titleCn: state.titleCn };
  }, [state]);

  const auGetCoins = useCallback((): number => {
    return state.coins;
  }, [state]);

  const auSpendCoins = useCallback((amount: number): boolean => {
    if (state.coins < amount) return false;
    setState((prev) => ({
      ...prev,
      coins: prev.coins - amount,
      stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + amount },
    }));
    return true;
  }, [state]);

  const auAddCoins = useCallback((amount: number): void => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + amount },
    }));
  }, []);

  // ── Zone Management ─────────────────────────────────────────────────────

  const auGetActiveZone = useCallback((): AUZoneId => {
    return state.activeZone;
  }, [state]);

  const auSetActiveZone = useCallback((zoneId: AUZoneId): boolean => {
    if (!state.unlockedZones.includes(zoneId)) return false;
    setState((prev) => ({ ...prev, activeZone: zoneId }));
    return true;
  }, [state]);

  const auGetUnlockedZones = useCallback((): AUZoneId[] => {
    return [...state.unlockedZones];
  }, [state]);

  const auGetAllZones = useCallback((): readonly AUZoneDef[] => {
    return AU_ZONES;
  }, []);

  const auGetZoneInfo = useCallback((zoneId: AUZoneId): AUZoneDef | undefined => {
    return AU_ZONES.find((z) => z.id === zoneId);
  }, []);

  const auUnlockZone = useCallback((zoneId: AUZoneId): boolean => {
    const zoneDef = AU_ZONES.find((z) => z.id === zoneId);
    if (!zoneDef || state.level < zoneDef.unlockLevel) return false;
    if (state.unlockedZones.includes(zoneId)) return false;
    setState((prev) => ({
      ...prev,
      unlockedZones: [...prev.unlockedZones, zoneId],
    }));
    return true;
  }, [state]);

  const auGetUnlockedZonesCount = useCallback((): number => {
    return state.unlockedZones.length;
  }, [state]);

  // ── Celestial Objects ───────────────────────────────────────────────────

  const auGetDiscoveredObjects = useCallback((): string[] => {
    return [...state.discoveredObjects];
  }, [state]);

  const auGetAllCelestialObjects = useCallback((): readonly AUCelestialObjectDef[] => {
    return AU_CELESTIAL_OBJECTS;
  }, []);

  const auDiscoverObject = useCallback((objectId: string): boolean => {
    const objDef = AU_CELESTIAL_OBJECTS.find((o) => o.id === objectId);
    if (!objDef) return false;
    if (state.discoveredObjects.includes(objectId)) return false;
    setState((prev) => ({
      ...prev,
      discoveredObjects: [...prev.discoveredObjects, objectId],
      stats: {
        ...prev.stats,
        totalDiscoveries: prev.stats.totalDiscoveries + 1,
        totalObservations: prev.stats.totalObservations + 1,
      },
      observationLog: [
        ...prev.observationLog,
        { objectId, timestamp: prev.uidCounter, zone: prev.activeZone },
      ],
    }));
    auAddXp(objDef.xpReward);
    auAddCoins(Math.floor(objDef.discoveryBonus * 0.5));
    return true;
  }, [state]);

  const auGetObjectsByRarity = useCallback((rarity: AURarity): AUCelestialObjectDef[] => {
    return AU_CELESTIAL_OBJECTS.filter((o) => o.rarity === rarity);
  }, []);

  const auGetObjectsByCategory = useCallback((category: AUObjectCategory): AUCelestialObjectDef[] => {
    return AU_CELESTIAL_OBJECTS.filter((o) => o.category === category);
  }, []);

  const auGetObjectsByZone = useCallback((zoneId: AUZoneId): AUCelestialObjectDef[] => {
    return AU_CELESTIAL_OBJECTS.filter((o) => o.zone === zoneId || o.zone === 'any');
  }, []);

  const auGetUndiscoveredObjects = useCallback((): AUCelestialObjectDef[] => {
    return AU_CELESTIAL_OBJECTS.filter((o) => !state.discoveredObjects.includes(o.id));
  }, [state]);

  const auGetDiscoveredCount = useCallback((): number => {
    return state.discoveredObjects.length;
  }, [state]);

  const auScanSky = useCallback((): { found: AUCelestialObjectDef | null; newXp: number } => {
    const vis = getEffectiveVisibility(state);
    if (vis < 20) return { found: null, newXp: 0 };
    const zoneObjs = AU_CELESTIAL_OBJECTS.filter(
      (o) => (o.zone === state.activeZone || o.zone === 'any') && !state.discoveredObjects.includes(o.id)
    );
    if (zoneObjs.length === 0) return { found: null, newXp: 2 };
    const rng = mulberry32(state.seed + state.stats.totalObservations + 1);
    const luckRoll = rng();
    const rarityWeights: Record<AURarity, number> = { 1: 0.50, 2: 0.25, 3: 0.15, 4: 0.07, 5: 0.03 };
    let selectedRarity: AURarity = 1;
    let cumulative = 0;
    for (let r = 1; r <= 5; r++) {
      cumulative += rarityWeights[r as AURarity];
      if (luckRoll <= cumulative) { selectedRarity = r as AURarity; break; }
    }
    const candidates = zoneObjs.filter((o) => o.rarity === selectedRarity);
    const found = candidates.length > 0 ? candidates[Math.floor(rng() * candidates.length)] : zoneObjs[Math.floor(rng() * zoneObjs.length)];
    auDiscoverObject(found.id);
    setState((prev) => ({ ...prev, seed: prev.seed + 1 }));
    return { found, newXp: found.xpReward };
  }, [state]);

  // ── Aurora System ───────────────────────────────────────────────────────

  const auGetActiveAurora = useCallback((): AUAuroraId | null => {
    return state.activeAurora;
  }, [state]);

  const auGetAuroraStrength = useCallback((): number => {
    return state.auroraStrength;
  }, [state]);

  const auGetAuroraTypes = useCallback((): readonly AUAuroraTypeDef[] => {
    return AU_AURORA_TYPES;
  }, []);

  const auGetAuroraHistory = useCallback((): readonly AUPhotoCapture[] => {
    return state.auroraHistory;
  }, [state]);

  const auGetAuroraColors = useCallback((): string[] => {
    return [...state.auroraColors];
  }, [state]);

  const auObserveAurora = useCallback((): AUAuroraId | null => {
    const time = AU_TIME_PERIODS.find((t) => t.id === state.timeOfDay);
    const weather = AU_WEATHER.find((w) => w.id === state.weather);
    if (!time || time.auroraMod <= 0) return null;
    if (!weather || weather.auroraMod <= 0) return null;
    const zone = AU_ZONES.find((z) => z.id === state.activeZone);
    const zoneChance = zone?.auroraChance ?? 0.1;
    const rng = mulberry32(state.seed + state.stats.totalAuroras * 7 + 13);
    const roll = rng();
    const threshold = zoneChance * time.auroraMod * weather.auroraMod;
    if (roll > threshold) return null;
    const weightedAuroras: { aurora: AUAuroraTypeDef; weight: number }[] = AU_AURORA_TYPES.map((a) => ({
      aurora: a,
      weight: a.rarity * (zone && a.bestZone === zone.id ? 3 : 1),
    }));
    const totalWeight = weightedAuroras.reduce((sum, w) => sum + w.weight, 0);
    let pick = rng() * totalWeight;
    let selected = AU_AURORA_TYPES[0];
    for (const wa of weightedAuroras) {
      pick -= wa.weight;
      if (pick <= 0) { selected = wa.aurora; break; }
    }
    const strength = Math.floor(40 + rng() * 60);
    setState((prev) => ({
      ...prev,
      activeAurora: selected.id,
      auroraStrength: strength,
      auroraColors: [...selected.colors],
      stats: { ...prev.stats, totalAuroras: prev.stats.totalAuroras + 1 },
      seed: prev.seed + 2,
    }));
    auAddXp(15 + Math.floor(selected.intensity * 0.3));
    return selected.id;
  }, [state]);

  const auTriggerAuroraEvent = useCallback((): AUAuroraId | null => {
    const rng = mulberry32(state.seed + 999);
    const idx = Math.floor(rng() * AU_AURORA_TYPES.length);
    const selected = AU_AURORA_TYPES[idx];
    const strength = Math.floor(60 + rng() * 40);
    setState((prev) => ({
      ...prev,
      activeAurora: selected.id,
      auroraStrength: strength,
      auroraColors: [...selected.colors],
      seed: prev.seed + 3,
    }));
    return selected.id;
  }, [state]);

  const auGetAuroraForecast = useCallback((): { probability: number; bestTime: string; bestZone: string } => {
    const zone = AU_ZONES.find((z) => z.id === state.activeZone);
    const weather = AU_WEATHER.find((w) => w.id === state.weather);
    const baseChance = zone?.auroraChance ?? 0.1;
    const weatherMod = weather?.auroraMod ?? 1;
    return {
      probability: Math.min(1, baseChance * weatherMod),
      bestTime: 'midnight',
      bestZone: 'northern_lights_peak',
    };
  }, [state]);

  const auDismissAurora = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      activeAurora: null,
      auroraStrength: 0,
      auroraColors: [],
    }));
  }, []);

  // ── Photography ─────────────────────────────────────────────────────────

  const auCaptureAurora = useCallback((): AUPhotoCapture | null => {
    if (!state.activeAurora) return null;
    const vis = getEffectiveVisibility(state);
    const equipment = [state.equippedTelescope, state.equippedCamera, state.equippedFilter].filter(Boolean) as string[];
    const score = evaluatePhotoScore(
      state.activeAurora,
      equipment,
      vis,
      state.auroraStrength,
      state.activeZone,
    );
    const rating = ratePhoto(score);
    const capture: AUPhotoCapture = {
      id: `photo_${state.uidCounter}`,
      auroraType: state.activeAurora,
      zone: state.activeZone,
      score,
      timestamp: state.uidCounter,
      equipment: [...equipment],
      rating,
    };
    setState((prev) => ({
      ...prev,
      auroraHistory: [...prev.auroraHistory, capture],
      bestPhotoScore: Math.max(prev.bestPhotoScore, score),
      stats: { ...prev.stats, totalPhotographs: prev.stats.totalPhotographs + 1 },
      uidCounter: prev.uidCounter + 1,
    }));
    const xpRewards: Record<string, number> = { common: 20, uncommon: 40, rare: 70, epic: 120, legendary: 200 };
    const coinRewards: Record<string, number> = { common: 5, uncommon: 15, rare: 30, epic: 60, legendary: 100 };
    auAddXp(xpRewards[rating]);
    auAddCoins(coinRewards[rating]);
    return capture;
  }, [state]);

  const auGetPhotoAlbum = useCallback((): readonly AUPhotoCapture[] => {
    return state.auroraHistory;
  }, [state]);

  const auGetBestPhotoScore = useCallback((): number => {
    return state.bestPhotoScore;
  }, [state]);

  const auGetPhotoStats = useCallback((): { total: number; byRating: Record<string, number>; avgScore: number } => {
    const total = state.auroraHistory.length;
    const byRating: Record<string, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    let sumScore = 0;
    for (const p of state.auroraHistory) {
      byRating[p.rating] = (byRating[p.rating] ?? 0) + 1;
      sumScore += p.score;
    }
    return { total, byRating, avgScore: total > 0 ? Math.floor(sumScore / total) : 0 };
  }, [state]);

  const auDeletePhoto = useCallback((photoId: string): boolean => {
    const idx = state.auroraHistory.findIndex((p) => p.id === photoId);
    if (idx === -1) return false;
    setState((prev) => ({
      ...prev,
      auroraHistory: prev.auroraHistory.filter((p) => p.id !== photoId),
    }));
    return true;
  }, [state]);

  // ── Constellations ──────────────────────────────────────────────────────

  const auGetMappedConstellations = useCallback((): string[] => {
    return [...state.mappedConstellations];
  }, [state]);

  const auGetAllConstellations = useCallback((): readonly AUConstellationDef[] => {
    return AU_CONSTELLATIONS;
  }, []);

  const auGetConstellationProgress = useCallback((constellationId: string): number => {
    const constDef = AU_CONSTELLATIONS.find((c) => c.id === constellationId);
    if (!constDef) return 0;
    const discovered = state.constellationStarProgress[constellationId] ?? [];
    return discovered.length / constDef.starIds.length;
  }, [state]);

  const auDiscoverConstellationStar = useCallback((constellationId: string, starId: string): boolean => {
    const constDef = AU_CONSTELLATIONS.find((c) => c.id === constellationId);
    if (!constDef) return false;
    if (!constDef.starIds.includes(starId)) return false;
    const existing = state.constellationStarProgress[constellationId] ?? [];
    if (existing.includes(starId)) return false;
    const updated = [...existing, starId];
    const isComplete = updated.length >= constDef.starIds.length;
    setState((prev) => ({
      ...prev,
      constellationStarProgress: { ...prev.constellationStarProgress, [constellationId]: updated },
      mappedConstellations: isComplete
        ? [...prev.mappedConstellations, constellationId]
        : prev.mappedConstellations,
      stats: {
        ...prev.stats,
        totalStarsCharted: prev.stats.totalStarsCharted + 1,
        totalConstellations: isComplete
          ? prev.stats.totalConstellations + 1
          : prev.stats.totalConstellations,
      },
    }));
    if (isComplete) {
      auAddXp(constDef.xpReward);
      auAddCoins(constDef.coinReward);
    }
    return true;
  }, [state]);

  const auMapConstellation = useCallback((constellationId: string): boolean => {
    const constDef = AU_CONSTELLATIONS.find((c) => c.id === constellationId);
    if (!constDef) return false;
    if (state.mappedConstellations.includes(constellationId)) return false;
    const allStars = [...constDef.starIds];
    setState((prev) => ({
      ...prev,
      constellationStarProgress: { ...prev.constellationStarProgress, [constellationId]: allStars },
      mappedConstellations: [...prev.mappedConstellations, constellationId],
      stats: {
        ...prev.stats,
        totalStarsCharted: prev.stats.totalStarsCharted + allStars.length,
        totalConstellations: prev.stats.totalConstellations + 1,
      },
    }));
    auAddXp(constDef.xpReward);
    auAddCoins(constDef.coinReward);
    return true;
  }, [state]);

  const auGetConstellationStarCount = useCallback((): { mapped: number; totalStars: number } => {
    let mapped = 0;
    let totalStars = 0;
    for (const c of AU_CONSTELLATIONS) {
      totalStars += c.starIds.length;
      if (state.mappedConstellations.includes(c.id)) {
        mapped += c.starIds.length;
      } else {
        const partial = state.constellationStarProgress[c.id] ?? [];
        mapped += partial.length;
      }
    }
    return { mapped, totalStars };
  }, [state]);

  // ── Equipment ───────────────────────────────────────────────────────────

  const auGetOwnedEquipment = useCallback((): string[] => {
    return [...state.ownedEquipment];
  }, [state]);

  const auGetEquippedItems = useCallback((): { telescope: string | null; camera: string | null; filter: string | null } => {
    return {
      telescope: state.equippedTelescope,
      camera: state.equippedCamera,
      filter: state.equippedFilter,
    };
  }, [state]);

  const auGetAllEquipment = useCallback((): readonly AUEquipmentDef[] => {
    return AU_EQUIPMENT;
  }, []);

  const auBuyEquipment = useCallback((equipmentId: string): boolean => {
    const eqDef = AU_EQUIPMENT.find((e) => e.id === equipmentId);
    if (!eqDef) return false;
    if (state.level < eqDef.unlockLevel) return false;
    if (state.ownedEquipment.includes(equipmentId)) return false;
    if (state.coins < eqDef.price) return false;
    setState((prev) => ({
      ...prev,
      ownedEquipment: [...prev.ownedEquipment, equipmentId],
      coins: prev.coins - eqDef.price,
      stats: {
        ...prev.stats,
        totalEquipmentBought: prev.stats.totalEquipmentBought + 1,
        totalCoinsSpent: prev.stats.totalCoinsSpent + eqDef.price,
      },
    }));
    return true;
  }, [state]);

  const auEquipItem = useCallback((equipmentId: string): boolean => {
    const eqDef = AU_EQUIPMENT.find((e) => e.id === equipmentId);
    if (!eqDef) return false;
    if (!state.ownedEquipment.includes(equipmentId)) return false;
    setState((prev) => {
      const update: Partial<AuObservatoryState> = {};
      if (eqDef.category === 'telescope') update.equippedTelescope = equipmentId;
      else if (eqDef.category === 'camera') update.equippedCamera = equipmentId;
      else if (eqDef.category === 'filter') update.equippedFilter = equipmentId;
      return { ...prev, ...update };
    });
    return true;
  }, [state]);

  const auUnequipItem = useCallback((slot: 'telescope' | 'camera' | 'filter'): void => {
    setState((prev) => {
      if (slot === 'telescope') return { ...prev, equippedTelescope: null };
      if (slot === 'camera') return { ...prev, equippedCamera: null };
      return { ...prev, equippedFilter: null };
    });
  }, []);

  // ── Telescope ───────────────────────────────────────────────────────────

  const auGetTelescopeZoom = useCallback((): number => {
    return state.telescopeZoom;
  }, [state]);

  const auSetTelescopeZoom = useCallback((zoom: number): void => {
    setState((prev) => ({ ...prev, telescopeZoom: clamp(zoom, 1, 100) }));
  }, []);

  const auGetTelescopeDirection = useCallback((): number => {
    return state.telescopeDirection;
  }, [state]);

  const auSetTelescopeDirection = useCallback((direction: number): void => {
    setState((prev) => ({ ...prev, telescopeDirection: ((direction % 360) + 360) % 360 }));
  }, []);

  // ── Research Stations ───────────────────────────────────────────────────

  const auGetUnlockedStations = useCallback((): AUStationId[] => {
    return [...state.unlockedStations];
  }, [state]);

  const auVisitStation = useCallback((stationId: AUStationId): boolean => {
    if (!state.unlockedStations.includes(stationId)) return false;
    setState((prev) => ({
      ...prev,
      currentStation: stationId,
      stats: { ...prev.stats, totalStationsVisited: prev.stats.totalStationsVisited + 1 },
    }));
    return true;
  }, [state]);

  const auGetStationInfo = useCallback((stationId: AUStationId): AUStationDef | undefined => {
    return AU_STATIONS.find((s) => s.id === stationId);
  }, []);

  const auGetAllStations = useCallback((): readonly AUStationDef[] => {
    return AU_STATIONS;
  }, []);

  const auGetCurrentStation = useCallback((): AUStationId => {
    return state.currentStation;
  }, [state]);

  const auUpgradeStation = useCallback((stationId: AUStationId): boolean => {
    const stDef = AU_STATIONS.find((s) => s.id === stationId);
    if (!stDef) return false;
    const currentLevel = state.stationLevels[stationId] ?? 0;
    if (currentLevel >= stDef.maxLevel) return false;
    if (state.coins < stDef.upgradeCost * (currentLevel + 1)) return false;
    const cost = stDef.upgradeCost * (currentLevel + 1);
    setState((prev) => ({
      ...prev,
      stationLevels: { ...prev.stationLevels, [stationId]: currentLevel + 1 },
      coins: prev.coins - cost,
      stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + cost },
    }));
    return true;
  }, [state]);

  const auGetStationLevel = useCallback((stationId: AUStationId): number => {
    return state.stationLevels[stationId] ?? 0;
  }, [state]);

  const auGetStationUpgradeCost = useCallback((stationId: AUStationId): number => {
    const stDef = AU_STATIONS.find((s) => s.id === stationId);
    if (!stDef) return 0;
    const currentLevel = state.stationLevels[stationId] ?? 0;
    return stDef.upgradeCost * (currentLevel + 1);
  }, [state]);

  // ── Time & Weather ──────────────────────────────────────────────────────

  const auGetTimeOfDay = useCallback((): AUTimeOfDay => {
    return state.timeOfDay;
  }, [state]);

  const auAdvanceTime = useCallback((): AUTimeOfDay => {
    const order: AUTimeOfDay[] = ['dawn', 'morning', 'afternoon', 'evening', 'night', 'midnight'];
    const idx = order.indexOf(state.timeOfDay);
    const next = order[(idx + 1) % order.length];
    setState((prev) => ({
      ...prev,
      timeOfDay: next,
      ...(next === 'night' || next === 'midnight'
        ? { stats: { ...prev.stats, totalNightsObserved: prev.stats.totalNightsObserved + 1 } }
        : {}),
    }));
    return next;
  }, [state]);

  const auSetTimeOfDay = useCallback((time: AUTimeOfDay): void => {
    setState((prev) => ({ ...prev, timeOfDay: time }));
  }, []);

  const auGetWeather = useCallback((): AUWeatherId => {
    return state.weather;
  }, [state]);

  const auGetAllWeather = useCallback((): readonly AUWeatherDef[] => {
    return AU_WEATHER;
  }, []);

  const auSetWeather = useCallback((weatherId: AUWeatherId): void => {
    const weatherDef = AU_WEATHER.find((w) => w.id === weatherId);
    if (!weatherDef) return;
    setState((prev) => ({ ...prev, weather: weatherId }));
  }, []);

  const auGetVisibility = useCallback((): number => {
    return getEffectiveVisibility(state);
  }, [state]);

  const auGetTemperature = useCallback((): number => {
    return state.temperature;
  }, [state]);

  const auSetTemperature = useCallback((temp: number): void => {
    setState((prev) => ({ ...prev, temperature: temp }));
  }, []);

  const auGetWeatherForecast = useCallback((): AUWeatherId[] => {
    const rng = mulberry32(state.seed + 777);
    const shuffled = [...AU_WEATHER].sort(() => rng() - 0.5);
    return shuffled.slice(0, 3).map((w) => w.id);
  }, [state]);

  const auGetSkyConditions = useCallback((): { visibility: number; canObserve: boolean; auroraChance: number; bestObject: AUCelestialObjectDef | null } => {
    const vis = getEffectiveVisibility(state);
    const time = AU_TIME_PERIODS.find((t) => t.id === state.timeOfDay);
    const weather = AU_WEATHER.find((w) => w.id === state.weather);
    const zone = AU_ZONES.find((z) => z.id === state.activeZone);
    const canObserve = vis >= 20 && (time?.visibilityMod ?? 0) > 0;
    const auroraChance = (zone?.auroraChance ?? 0.1) * (time?.auroraMod ?? 0) * (weather?.auroraMod ?? 0);
    const undiscovered = AU_CELESTIAL_OBJECTS.filter(
      (o) => (o.zone === state.activeZone || o.zone === 'any') && !state.discoveredObjects.includes(o.id)
    );
    const bestObject = undiscovered.length > 0 ? undiscovered[0] : null;
    return { visibility: vis, canObserve, auroraChance: Math.min(auroraChance, 1), bestObject };
  }, [state]);

  // ── NPCs ────────────────────────────────────────────────────────────────

  const auGetNpcRelations = useCallback((): Record<string, AUNpcRelation> => {
    return JSON.parse(JSON.stringify(state.npcRelations));
  }, [state]);

  const auGetAllNpcs = useCallback((): readonly AUNPCDef[] => {
    return AU_NPCS;
  }, []);

  const auGetNpcInfo = useCallback((npcId: string): AUNPCDef | undefined => {
    return AU_NPCS.find((n) => n.id === npcId);
  }, []);

  const auTalkToNpc = useCallback((npcId: string): { affinity: number; tip: string; tipCn: string } | null => {
    const npc = AU_NPCS.find((n) => n.id === npcId);
    if (!npc) return null;
    const relation = state.npcRelations[npcId];
    if (!relation) return null;
    const rng = mulberry32(state.seed + npcId.length * 17);
    const tipIdx = Math.floor(rng() * npc.tips.length);
    const affinityGain = 3 + Math.floor(rng() * 5);
    setState((prev) => ({
      ...prev,
      npcRelations: {
        ...prev.npcRelations,
        [npcId]: {
          ...prev.npcRelations[npcId],
          affinity: clamp(prev.npcRelations[npcId].affinity + affinityGain, 0, 100),
          lastInteraction: prev.uidCounter,
        },
      },
      seed: prev.seed + 1,
    }));
    return { affinity: relation.affinity + affinityGain, tip: npc.tips[tipIdx], tipCn: npc.tipsCn[tipIdx] };
  }, [state]);

  const auGiftNpc = useCallback((npcId: string, coinAmount: number): boolean => {
    const npc = AU_NPCS.find((n) => n.id === npcId);
    if (!npc) return false;
    if (state.coins < coinAmount) return false;
    const relation = state.npcRelations[npcId];
    if (!relation) return false;
    const affinityGain = Math.floor(coinAmount * 0.1) + 5;
    setState((prev) => ({
      ...prev,
      coins: prev.coins - coinAmount,
      npcRelations: {
        ...prev.npcRelations,
        [npcId]: {
          ...prev.npcRelations[npcId],
          affinity: clamp(prev.npcRelations[npcId].affinity + affinityGain, 0, 100),
          giftsReceived: prev.npcRelations[npcId].giftsReceived + 1,
          lastInteraction: prev.uidCounter,
        },
      },
      stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + coinAmount },
    }));
    return true;
  }, [state]);

  const auGetNpcAffinity = useCallback((npcId: string): number => {
    return state.npcRelations[npcId]?.affinity ?? 0;
  }, [state]);

  // ── Quests ──────────────────────────────────────────────────────────────

  const auGetActiveQuests = useCallback((): string[] => {
    return [...state.activeQuests];
  }, [state]);

  const auGetCompletedQuests = useCallback((): string[] => {
    return [...state.completedQuests];
  }, [state]);

  const auGetAllQuests = useCallback((): readonly AUQuestDef[] => {
    return AU_QUESTS;
  }, []);

  const auGetQuestInfo = useCallback((questId: string): AUQuestDef | undefined => {
    return AU_QUESTS.find((q) => q.id === questId);
  }, []);

  const auAcceptQuest = useCallback((questId: string): boolean => {
    const questDef = AU_QUESTS.find((q) => q.id === questId);
    if (!questDef) return false;
    if (state.level < questDef.requiredLevel) return false;
    if (state.activeQuests.includes(questId)) return false;
    if (state.completedQuests.includes(questId)) return false;
    setState((prev) => ({
      ...prev,
      activeQuests: [...prev.activeQuests, questId],
      questProgress: { ...prev.questProgress, [questId]: 0 },
    }));
    return true;
  }, [state]);

  const auProgressQuest = useCallback((questId: string, amount?: number): boolean => {
    if (!state.activeQuests.includes(questId)) return false;
    const questDef = AU_QUESTS.find((q) => q.id === questId);
    if (!questDef) return false;
    const currentProgress = state.questProgress[questId] ?? 0;
    const newProgress = Math.min(currentProgress + (amount ?? 1), questDef.steps);
    const isComplete = newProgress >= questDef.steps;
    setState((prev) => ({
      ...prev,
      questProgress: { ...prev.questProgress, [questId]: newProgress },
      activeQuests: isComplete
        ? prev.activeQuests.filter((q) => q !== questId)
        : prev.activeQuests,
      ...(isComplete
        ? {
            completedQuests: [...prev.completedQuests, questId],
            stats: { ...prev.stats, totalQuests: prev.stats.totalQuests + 1 },
          }
        : {}),
    }));
    if (isComplete) {
      auAddXp(questDef.rewardXP);
      auAddCoins(questDef.rewardCoins);
    }
    return true;
  }, [state]);

  const auGetQuestProgress = useCallback((questId: string): number => {
    return state.questProgress[questId] ?? 0;
  }, [state]);

  const auGetQuestProgressDetail = useCallback((questId: string): { current: number; required: number; pct: number } | null => {
    const questDef = AU_QUESTS.find((q) => q.id === questId);
    if (!questDef) return null;
    const current = state.questProgress[questId] ?? 0;
    return { current, required: questDef.steps, pct: Math.floor((current / questDef.steps) * 100) };
  }, [state]);

  // ── Achievements ────────────────────────────────────────────────────────

  const auGetAchievements = useCallback((): string[] => {
    return [...state.achievements];
  }, [state]);

  const auGetAllAchievements = useCallback((): readonly AUAchievementDef[] => {
    return AU_ACHIEVEMENTS;
  }, []);

  const auGetAchievementInfo = useCallback((achId: string): AUAchievementDef | undefined => {
    return AU_ACHIEVEMENTS.find((a) => a.id === achId);
  }, []);

  const auCheckAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    const conditions: Record<string, () => boolean> = {
      ach_first_star: () => state.discoveredObjects.length >= 1,
      ach_ten_objects: () => state.discoveredObjects.length >= 10,
      ach_all_objects: () => state.discoveredObjects.length >= 37,
      ach_first_aurora: () => state.stats.totalAuroras >= 1,
      ach_all_auroras: () => state.stats.totalAuroras >= 12,
      ach_first_photo: () => state.stats.totalPhotographs >= 1,
      ach_epic_photo: () => state.bestPhotoScore >= 85,
      ach_legendary_photo: () => state.bestPhotoScore >= 95,
      ach_constellation_1: () => state.mappedConstellations.length >= 1,
      ach_constellation_5: () => state.mappedConstellations.length >= 5,
      ach_zone_explorer: () => state.unlockedZones.length >= 8,
      ach_quest_5: () => state.completedQuests.length >= 5,
      ach_quest_10: () => state.completedQuests.length >= 10,
      ach_night_owl: () => state.stats.totalNightsObserved >= 50,
      ach_level_50: () => state.level >= 50,
    };
    for (const [achId, check] of Object.entries(conditions)) {
      if (!state.achievements.includes(achId) && check()) {
        newlyUnlocked.push(achId);
      }
    }
    if (newlyUnlocked.length > 0) {
      let totalXp = 0;
      let totalCoins = 0;
      for (const achId of newlyUnlocked) {
        const achDef = AU_ACHIEVEMENTS.find((a) => a.id === achId);
        if (achDef) {
          totalXp += achDef.rewardXP;
          totalCoins += achDef.rewardCoins;
        }
      }
      setState((prev) => ({
        ...prev,
        achievements: [...prev.achievements, ...newlyUnlocked],
      }));
      auAddXp(totalXp);
      auAddCoins(totalCoins);
    }
    return newlyUnlocked;
  }, [state]);

  const auGetAchievementCount = useCallback((): number => {
    return state.achievements.length;
  }, [state]);

  // ── Daily System ────────────────────────────────────────────────────────

  const auGetDailyAurora = useCallback((): AUAuroraId | null => {
    return state.dailyAurora;
  }, [state]);

  const auGetDailyConstellation = useCallback((): string | null => {
    return state.dailyConstellation;
  }, [state]);

  const auGetDailyCompleted = useCallback((): boolean => {
    return state.dailyCompleted;
  }, [state]);

  const auCompleteDaily = useCallback((): void => {
    if (state.dailyCompleted) return;
    setState((prev) => ({
      ...prev,
      dailyCompleted: true,
      coins: prev.coins + 50,
      stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + 50 },
    }));
    auAddXp(100);
  }, [state]);

  const auRefreshDaily = useCallback((newSeed?: number): void => {
    const rng = mulberry32(newSeed ?? state.seed + 100);
    const allAuroras = AU_AURORA_TYPES.map((a) => a.id);
    const allConstellations = AU_CONSTELLATIONS.map((c) => c.id);
    setState((prev) => ({
      ...prev,
      dailySeed: Math.floor(rng() * 100000),
      dailyAurora: allAuroras[Math.floor(rng() * allAuroras.length)],
      dailyConstellation: allConstellations[Math.floor(rng() * allConstellations.length)],
      dailyCompleted: false,
      seed: prev.seed + 100,
    }));
  }, [state]);

  // ── Stats ───────────────────────────────────────────────────────────────

  const auGetStats = useCallback((): Readonly<AuObservatoryState['stats']> => {
    return Object.freeze({ ...state.stats });
  }, [state]);

  const auGetObservationCount = useCallback((): number => {
    return state.stats.totalObservations;
  }, [state]);

  const auGetDiscoveryRate = useCallback((): number => {
    const total = AU_CELESTIAL_OBJECTS.length;
    return total > 0 ? Math.floor((state.discoveredObjects.length / total) * 100) : 0;
  }, [state]);

  const auGetObservatoryRank = useCallback((): string => {
    const score = state.stats.totalDiscoveries * 10
      + state.mappedConstellations.length * 25
      + state.stats.totalAuroras * 15
      + state.stats.totalPhotographs * 8
      + state.level * 5;
    if (score >= 2000) return 'S';
    if (score >= 1500) return 'A';
    if (score >= 1000) return 'B';
    if (score >= 500) return 'C';
    return 'D';
  }, [state]);

  const auGetTotalScore = useCallback((): number => {
    return state.stats.totalDiscoveries * 10
      + state.mappedConstellations.length * 25
      + state.stats.totalAuroras * 15
      + state.stats.totalPhotographs * 8
      + state.level * 5;
  }, [state]);

  const auGetObservationLog = useCallback((): readonly AuObservatoryState['observationLog'] => {
    return state.observationLog;
  }, [state]);

  // ── Composite Actions ───────────────────────────────────────────────────

  const auPerformNightObservation = useCallback((): {
    aurora: AUAuroraId | null;
    objectsFound: string[];
    xpEarned: number;
    coinsEarned: number;
  } => {
    setState((prev) => ({
      ...prev,
      timeOfDay: 'night',
      stats: { ...prev.stats, totalNightsObserved: prev.stats.totalNightsObserved + 1 },
    }));
    const auroraId = auObserveAurora();
    const found: string[] = [];
    const rng = mulberry32(state.seed + Date.now());
    const scanCount = 1 + Math.floor(rng() * 3);
    for (let i = 0; i < scanCount; i++) {
      const result = auScanSky();
      if (result.found) found.push(result.found.id);
    }
    const auroraXp = auroraId ? 20 : 0;
    const scanXp = found.length * 15;
    const nightXp = 10;
    const totalXp = auroraXp + scanXp + nightXp;
    const totalCoins = found.length * 5 + (auroraId ? 10 : 0);
    auAddXp(totalXp);
    auAddCoins(totalCoins);
    auCheckAchievements();
    return { aurora: auroraId, objectsFound: found, xpEarned: totalXp, coinsEarned: totalCoins };
  }, [state]);

  const auAutoObserve = useCallback((): void => {
    auSetTimeOfDay('night');
    auSetWeather('clear');
    const aurora = auObserveAurora();
    if (aurora) {
      auCaptureAurora();
    }
    auScanSky();
    auCheckAchievements();
    const vis = getEffectiveVisibility(state);
    if (vis >= 30) {
      const rng = mulberry32(state.seed + 42);
      const quests = AU_QUESTS.filter((q) => q.requiredLevel <= state.level && !state.completedQuests.includes(q.id));
      if (quests.length > 0 && rng() > 0.5) {
        const quest = quests[Math.floor(rng() * quests.length)];
        if (!state.activeQuests.includes(quest.id)) {
          auAcceptQuest(quest.id);
        }
      }
    }
  }, [state]);

  const auGetSummary = useCallback((): {
    level: number;
    title: string;
    titleCn: string;
    objectsDiscovered: number;
    constellationsMapped: number;
    aurorasObserved: number;
    photosTaken: number;
    rank: string;
  } => {
    return {
      level: state.level,
      title: state.title,
      titleCn: state.titleCn,
      objectsDiscovered: state.discoveredObjects.length,
      constellationsMapped: state.mappedConstellations.length,
      aurorasObserved: state.stats.totalAuroras,
      photosTaken: state.stats.totalPhotographs,
      rank: auGetObservatoryRank(),
    };
  }, [state]);

  return {
    auGetState,
    auResetState,
    auGetLevel,
    auGetXp,
    auGetXpToNext,
    auAddXp,
    auGetTitle,
    auGetCoins,
    auSpendCoins,
    auAddCoins,
    auGetActiveZone,
    auSetActiveZone,
    auGetUnlockedZones,
    auGetAllZones,
    auGetZoneInfo,
    auUnlockZone,
    auGetUnlockedZonesCount,
    auGetDiscoveredObjects,
    auGetAllCelestialObjects,
    auDiscoverObject,
    auGetObjectsByRarity,
    auGetObjectsByCategory,
    auGetObjectsByZone,
    auGetUndiscoveredObjects,
    auGetDiscoveredCount,
    auScanSky,
    auGetActiveAurora,
    auGetAuroraStrength,
    auGetAuroraTypes,
    auGetAuroraHistory,
    auGetAuroraColors,
    auObserveAurora,
    auTriggerAuroraEvent,
    auGetAuroraForecast,
    auDismissAurora,
    auCaptureAurora,
    auGetPhotoAlbum,
    auGetBestPhotoScore,
    auGetPhotoStats,
    auDeletePhoto,
    auGetMappedConstellations,
    auGetAllConstellations,
    auGetConstellationProgress,
    auDiscoverConstellationStar,
    auMapConstellation,
    auGetConstellationStarCount,
    auGetOwnedEquipment,
    auGetEquippedItems,
    auGetAllEquipment,
    auBuyEquipment,
    auEquipItem,
    auUnequipItem,
    auGetTelescopeZoom,
    auSetTelescopeZoom,
    auGetTelescopeDirection,
    auSetTelescopeDirection,
    auGetUnlockedStations,
    auVisitStation,
    auGetStationInfo,
    auGetAllStations,
    auGetCurrentStation,
    auUpgradeStation,
    auGetStationLevel,
    auGetStationUpgradeCost,
    auGetTimeOfDay,
    auAdvanceTime,
    auSetTimeOfDay,
    auGetWeather,
    auGetAllWeather,
    auSetWeather,
    auGetVisibility,
    auGetTemperature,
    auSetTemperature,
    auGetWeatherForecast,
    auGetSkyConditions,
    auGetNpcRelations,
    auGetAllNpcs,
    auGetNpcInfo,
    auTalkToNpc,
    auGiftNpc,
    auGetNpcAffinity,
    auGetActiveQuests,
    auGetCompletedQuests,
    auGetAllQuests,
    auGetQuestInfo,
    auAcceptQuest,
    auProgressQuest,
    auGetQuestProgress,
    auGetQuestProgressDetail,
    auGetAchievements,
    auGetAllAchievements,
    auGetAchievementInfo,
    auCheckAchievements,
    auGetAchievementCount,
    auGetDailyAurora,
    auGetDailyConstellation,
    auGetDailyCompleted,
    auCompleteDaily,
    auRefreshDaily,
    auGetStats,
    auGetObservationCount,
    auGetDiscoveryRate,
    auGetObservatoryRank,
    auGetTotalScore,
    auGetObservationLog,
    auPerformNightObservation,
    auAutoObserve,
    auGetSummary,
  };
}
