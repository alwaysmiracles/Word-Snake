// ==========================================
// Coral Reef City Wire
// Underwater City Builder — Word Snake Feature Module
// ==========================================

import { useState } from 'react';

// ==========================================
// Storage
// ==========================================

const CRC_STORAGE_KEY = 'coral-reef-city-save';

// ==========================================
// Type Definitions
// ==========================================

export type DistrictId =
  | 'coral-palace'
  | 'kelp-gardens'
  | 'pearl-market'
  | 'seahorse-stables'
  | 'octopus-labs'
  | 'dolphin-arena'
  | 'turtle-sanctuary'
  | 'jellyfish-gardens'
  | 'shipwreck-museum'
  | 'abyss-gate';

export type CoralId =
  | 'brain-coral'
  | 'staghorn'
  | 'pillar'
  | 'table'
  | 'fire-coral'
  | 'blue-coral'
  | 'elkhorn'
  | 'mushroom'
  | 'tube'
  | 'star'
  | 'lace'
  | 'sea-fan';

export type CreatureId =
  | 'clownfish'
  | 'blue-tang'
  | 'angelfish'
  | 'pufferfish'
  | 'lionfish'
  | 'seahorse'
  | 'manta-ray'
  | 'electric-eel'
  | 'octopus'
  | 'dolphin'
  | 'sea-turtle'
  | 'jellyfish'
  | 'hammerhead-shark'
  | 'whale-shark'
  | 'moray-eel'
  | 'squid'
  | 'starfish'
  | 'hermit-crab'
  | 'lobster'
  | 'sea-urchin'
  | 'cuttlefish'
  | 'parrotfish'
  | 'grouper'
  | 'barracuda'
  | 'nurse-shark'
  | 'giant-clam'
  | 'leafy-seadragon'
  | 'mimic-octopus'
  | 'sunfish'
  | 'cleaner-wrasse';

export type ResourceId = 'pearls' | 'kelp' | 'sand' | 'coralSeeds' | 'deepGems';

export type FestivalId =
  | 'coral-bloom'
  | 'tide-festival'
  | 'moonlight-spawning'
  | 'deep-current'
  | 'bioluminescence-night'
  | 'pearl-harvest'
  | 'kelp-feast'
  | 'reef-unity';

export type TradeCityId =
  | 'sunken-atlantis'
  | 'coralith-harbor'
  | 'abyssia'
  | 'pearlvale'
  | 'tidecrest'
  | 'deeproot';

export type AchievementId =
  | 'first-coral'
  | 'ten-corals'
  | 'fifty-corals'
  | 'first-creature'
  | 'ten-creatures'
  | 'all-districts'
  | 'max-palace'
  | 'first-festival'
  | 'all-festivals'
  | 'rich-mayor'
  | 'clean-reef'
  | 'explorer'
  | 'master-trader'
  | 'legendary-mayor'
  | 'coral-master';

export type DiveDepth = 'shallow' | 'mid' | 'deep' | 'abyss';

export type CreatureRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type DiveEncounterKind = 'creature' | 'resource' | 'hazard' | 'treasure' | 'discovery';

export interface Resources {
  pearls: number;
  kelp: number;
  sand: number;
  coralSeeds: number;
  deepGems: number;
}

export interface DistrictConfig {
  id: DistrictId;
  name: string;
  description: string;
  theme: string;
  baseCoralSlots: number;
  buildCost: Resources;
  upgradeCostMultiplier: number;
  pollutionReduction: number;
  happinessBonusPerLevel: number;
  resourceBonus: Partial<Resources>;
}

export interface CoralConfig {
  id: CoralId;
  name: string;
  description: string;
  growthRate: number;
  beautyScore: number;
  cost: Resources;
  pollutionAbsorption: number;
  healthBonus: number;
  preferredDistricts: DistrictId[];
}

export interface CreatureConfig {
  id: CreatureId;
  name: string;
  description: string;
  rarity: CreatureRarity;
  habitat: DistrictId[];
  cost: Resources;
  happinessBonus: number;
  healthBonus: number;
  beautyBonus: number;
}

export interface FestivalConfig {
  id: FestivalId;
  name: string;
  description: string;
  durationHours: number;
  cost: Resources;
  happinessBonus: number;
  healthBonus: number;
  growthMultiplier: number;
  resourceMultiplier: number;
}

export interface TradeCityConfig {
  id: TradeCityId;
  name: string;
  description: string;
  specialtyResource: ResourceId;
  rates: Record<ResourceId, number>;
}

export interface AchievementConfig {
  id: AchievementId;
  name: string;
  description: string;
  pearlReward: number;
  xpReward: number;
}

export interface DiveEncounter {
  kind: DiveEncounterKind;
  description: string;
  creatureId?: CreatureId;
  resourceId?: ResourceId;
  amount?: number;
  damage?: number;
  xpReward?: number;
}

export interface DiveState {
  depth: DiveDepth;
  encounters: DiveEncounter[];
  currentIndex: number;
  rewards: Resources;
  startedAt: number;
  completed: boolean;
  totalXp: number;
}

export interface DistrictState {
  level: number;
  coralSlots: (CoralId | null)[];
  decorations: number;
}

export interface TradeRecord {
  id: string;
  tradeCityId: TradeCityId;
  given: Partial<Resources>;
  received: Partial<Resources>;
  timestamp: number;
}

export interface CoralReefCityState {
  resources: Resources;
  districts: Record<DistrictId, DistrictState>;
  attractedCreatures: CreatureId[];
  cityHealth: number;
  cityHappiness: number;
  pollution: number;
  biodiversity: number;
  decorationScore: number;
  activeFestival: FestivalId | null;
  festivalStartTime: number | null;
  completedFestivals: FestivalId[];
  mayorRank: number;
  mayorXp: number;
  achievements: Record<AchievementId, boolean>;
  achievementClaimed: Record<AchievementId, boolean>;
  tradeHistory: TradeRecord[];
  diveDate: string;
  diveAvailable: boolean;
  totalDives: number;
  currentDive: DiveState | null;
  totalCoralsPlaced: number;
  totalCollected: Resources;
  totalTrades: number;
  createdAt: number;
  updatedAt: number;
}

export interface CoralReefCityReturn {
  state: CoralReefCityState;
  persistedAt: number;
  crcUpgradeDistrict: (districtId: DistrictId) => boolean;
  crcBuildDistrict: (districtId: DistrictId) => boolean;
  crcPlaceCoral: (districtId: DistrictId, coralId: CoralId, slotIndex: number) => boolean;
  crcRemoveCoral: (districtId: DistrictId, slotIndex: number) => boolean;
  crcCollectResources: () => Resources;
  crcAttractCreature: (creatureId: CreatureId) => boolean;
  crcStartFestival: (festivalId: FestivalId) => boolean;
  crcEndFestival: () => void;
  crcExecuteTrade: (tradeCityId: TradeCityId, giveId: ResourceId, giveAmount: number, receiveId: ResourceId) => boolean;
  crcStartDive: (depth: DiveDepth) => boolean;
  crcAdvanceDive: () => DiveEncounter | null;
  crcCompleteDive: () => boolean;
  crcCleanPollution: (amount: number) => boolean;
  crcAddDecoration: (districtId: DistrictId) => boolean;
  crcClaimAchievement: (achievementId: AchievementId) => boolean;
  crcGainMayorXp: (xp: number) => void;
  crcRecalculateStats: () => void;
  crcResetGame: () => void;
}

// ==========================================
// Game Constants
// ==========================================

export const CRC_MAX_DISTRICT_LEVEL = 10;
export const CRC_MAX_HEALTH = 100;
export const CRC_MAX_HAPPINESS = 100;
export const CRC_MAX_POLLUTION = 100;
export const CRC_MAX_BIODIVERSITY = 100;
export const CRC_MAX_MAYOR_RANK = 50;

const CRC_ALL_DISTRICT_IDS: DistrictId[] = [
  'coral-palace',
  'kelp-gardens',
  'pearl-market',
  'seahorse-stables',
  'octopus-labs',
  'dolphin-arena',
  'turtle-sanctuary',
  'jellyfish-gardens',
  'shipwreck-museum',
  'abyss-gate',
];

const CRC_ALL_CORAL_IDS: CoralId[] = [
  'brain-coral',
  'staghorn',
  'pillar',
  'table',
  'fire-coral',
  'blue-coral',
  'elkhorn',
  'mushroom',
  'tube',
  'star',
  'lace',
  'sea-fan',
];

const CRC_ALL_CREATURE_IDS: CreatureId[] = [
  'clownfish',
  'blue-tang',
  'angelfish',
  'pufferfish',
  'lionfish',
  'seahorse',
  'manta-ray',
  'electric-eel',
  'octopus',
  'dolphin',
  'sea-turtle',
  'jellyfish',
  'hammerhead-shark',
  'whale-shark',
  'moray-eel',
  'squid',
  'starfish',
  'hermit-crab',
  'lobster',
  'sea-urchin',
  'cuttlefish',
  'parrotfish',
  'grouper',
  'barracuda',
  'nurse-shark',
  'giant-clam',
  'leafy-seadragon',
  'mimic-octopus',
  'sunfish',
  'cleaner-wrasse',
];

const CRC_ALL_FESTIVAL_IDS: FestivalId[] = [
  'coral-bloom',
  'tide-festival',
  'moonlight-spawning',
  'deep-current',
  'bioluminescence-night',
  'pearl-harvest',
  'kelp-feast',
  'reef-unity',
];

const CRC_ALL_TRADE_CITY_IDS: TradeCityId[] = [
  'sunken-atlantis',
  'coralith-harbor',
  'abyssia',
  'pearlvale',
  'tidecrest',
  'deeproot',
];

const CRC_ALL_ACHIEVEMENT_IDS: AchievementId[] = [
  'first-coral',
  'ten-corals',
  'fifty-corals',
  'first-creature',
  'ten-creatures',
  'all-districts',
  'max-palace',
  'first-festival',
  'all-festivals',
  'rich-mayor',
  'clean-reef',
  'explorer',
  'master-trader',
  'legendary-mayor',
  'coral-master',
];

// ==========================================
// District Configurations
// ==========================================

export const CRC_DISTRICTS: Record<DistrictId, DistrictConfig> = {
  'coral-palace': {
    id: 'coral-palace',
    name: 'Coral Palace',
    description: 'The majestic heart of the reef city where the Coral Queen resides among towering spires of living coral.',
    theme: 'Royal',
    baseCoralSlots: 8,
    buildCost: { pearls: 100, kelp: 80, sand: 60, coralSeeds: 20, deepGems: 5 },
    upgradeCostMultiplier: 1.5,
    pollutionReduction: 2,
    happinessBonusPerLevel: 5,
    resourceBonus: { pearls: 5 },
  },
  'kelp-gardens': {
    id: 'kelp-gardens',
    name: 'Kelp Gardens',
    description: 'Lush underwater gardens swaying gently with golden kelp forests, home to many small fish.',
    theme: 'Nature',
    baseCoralSlots: 6,
    buildCost: { pearls: 60, kelp: 40, sand: 30, coralSeeds: 30, deepGems: 2 },
    upgradeCostMultiplier: 1.3,
    pollutionReduction: 8,
    happinessBonusPerLevel: 3,
    resourceBonus: { kelp: 8 },
  },
  'pearl-market': {
    id: 'pearl-market',
    name: 'Pearl Market',
    description: 'A bustling trading hub where merchants exchange rare ocean treasures from across the seven seas.',
    theme: 'Commerce',
    baseCoralSlots: 4,
    buildCost: { pearls: 80, kelp: 60, sand: 50, coralSeeds: 10, deepGems: 8 },
    upgradeCostMultiplier: 1.4,
    pollutionReduction: 1,
    happinessBonusPerLevel: 4,
    resourceBonus: { pearls: 10, deepGems: 3 },
  },
  'seahorse-stables': {
    id: 'seahorse-stables',
    name: 'Seahorse Stables',
    description: 'Where graceful seahorses are bred and trained for the elite reef guard patrol squadrons.',
    theme: 'Animals',
    baseCoralSlots: 5,
    buildCost: { pearls: 50, kelp: 70, sand: 40, coralSeeds: 15, deepGems: 3 },
    upgradeCostMultiplier: 1.2,
    pollutionReduction: 3,
    happinessBonusPerLevel: 6,
    resourceBonus: { kelp: 5 },
  },
  'octopus-labs': {
    id: 'octopus-labs',
    name: 'Octopus Labs',
    description: 'Advanced research facilities where brilliant octopus scientists study the deepest ocean mysteries.',
    theme: 'Science',
    baseCoralSlots: 5,
    buildCost: { pearls: 120, kelp: 50, sand: 40, coralSeeds: 25, deepGems: 15 },
    upgradeCostMultiplier: 1.6,
    pollutionReduction: -2,
    happinessBonusPerLevel: 2,
    resourceBonus: { deepGems: 5 },
  },
  'dolphin-arena': {
    id: 'dolphin-arena',
    name: 'Dolphin Arena',
    description: 'A grand amphitheater where dolphins perform magnificent aquatic shows for cheering crowds.',
    theme: 'Entertainment',
    baseCoralSlots: 4,
    buildCost: { pearls: 90, kelp: 60, sand: 70, coralSeeds: 10, deepGems: 5 },
    upgradeCostMultiplier: 1.4,
    pollutionReduction: 0,
    happinessBonusPerLevel: 8,
    resourceBonus: { pearls: 3 },
  },
  'turtle-sanctuary': {
    id: 'turtle-sanctuary',
    name: 'Turtle Sanctuary',
    description: 'A peaceful refuge where ancient sea turtles come to rest, heal, and lay their precious eggs.',
    theme: 'Nature',
    baseCoralSlots: 6,
    buildCost: { pearls: 70, kelp: 80, sand: 50, coralSeeds: 20, deepGems: 4 },
    upgradeCostMultiplier: 1.3,
    pollutionReduction: 5,
    happinessBonusPerLevel: 4,
    resourceBonus: { sand: 5, kelp: 3 },
  },
  'jellyfish-gardens': {
    id: 'jellyfish-gardens',
    name: 'Jellyfish Gardens',
    description: 'An ethereal garden of bioluminescent jellyfish that paint the waters with shifting neon colors.',
    theme: 'Mystical',
    baseCoralSlots: 5,
    buildCost: { pearls: 80, kelp: 50, sand: 30, coralSeeds: 15, deepGems: 10 },
    upgradeCostMultiplier: 1.3,
    pollutionReduction: 4,
    happinessBonusPerLevel: 7,
    resourceBonus: { deepGems: 2 },
  },
  'shipwreck-museum': {
    id: 'shipwreck-museum',
    name: 'Shipwreck Museum',
    description: 'A magnificent museum built within the hull of an ancient shipwreck preserving ocean history.',
    theme: 'History',
    baseCoralSlots: 5,
    buildCost: { pearls: 60, kelp: 30, sand: 80, coralSeeds: 5, deepGems: 12 },
    upgradeCostMultiplier: 1.4,
    pollutionReduction: 2,
    happinessBonusPerLevel: 3,
    resourceBonus: { sand: 8, deepGems: 4 },
  },
  'abyss-gate': {
    id: 'abyss-gate',
    name: 'Abyss Gate',
    description: 'The mysterious gateway to the deep abyss, guarded by ancient leviathans of untold power.',
    theme: 'Mysterious',
    baseCoralSlots: 3,
    buildCost: { pearls: 150, kelp: 40, sand: 30, coralSeeds: 10, deepGems: 25 },
    upgradeCostMultiplier: 1.8,
    pollutionReduction: -3,
    happinessBonusPerLevel: 2,
    resourceBonus: { deepGems: 10 },
  },
};

// ==========================================
// Coral Configurations
// ==========================================

export const CRC_CORALS: Record<CoralId, CoralConfig> = {
  'brain-coral': {
    id: 'brain-coral',
    name: 'Brain Coral',
    description: 'A massive spherical coral with intricate grooved patterns resembling a human brain.',
    growthRate: 0.5,
    beautyScore: 7,
    cost: { pearls: 20, kelp: 10, sand: 15, coralSeeds: 5, deepGems: 0 },
    pollutionAbsorption: 3,
    healthBonus: 5,
    preferredDistricts: ['coral-palace', 'turtle-sanctuary'],
  },
  'staghorn': {
    id: 'staghorn',
    name: 'Staghorn Coral',
    description: 'Branching coral growing in antler-like formations, vital for reef structural integrity.',
    growthRate: 1.2,
    beautyScore: 8,
    cost: { pearls: 15, kelp: 15, sand: 10, coralSeeds: 8, deepGems: 0 },
    pollutionAbsorption: 2,
    healthBonus: 3,
    preferredDistricts: ['kelp-gardens', 'seahorse-stables'],
  },
  'pillar': {
    id: 'pillar',
    name: 'Pillar Coral',
    description: 'Towering columns of coral that grow upward like underwater skyscrapers reaching for light.',
    growthRate: 0.3,
    beautyScore: 9,
    cost: { pearls: 30, kelp: 10, sand: 25, coralSeeds: 3, deepGems: 1 },
    pollutionAbsorption: 4,
    healthBonus: 4,
    preferredDistricts: ['coral-palace', 'shipwreck-museum'],
  },
  'table': {
    id: 'table',
    name: 'Table Coral',
    description: 'Flat broad coral formations providing essential shelter for countless small reef creatures.',
    growthRate: 0.8,
    beautyScore: 6,
    cost: { pearls: 12, kelp: 12, sand: 8, coralSeeds: 6, deepGems: 0 },
    pollutionAbsorption: 2,
    healthBonus: 6,
    preferredDistricts: ['pearl-market', 'turtle-sanctuary'],
  },
  'fire-coral': {
    id: 'fire-coral',
    name: 'Fire Coral',
    description: 'Vibrant orange-red coral with stinging nematocysts that glow like underwater embers at dusk.',
    growthRate: 1.0,
    beautyScore: 10,
    cost: { pearls: 25, kelp: 8, sand: 5, coralSeeds: 10, deepGems: 2 },
    pollutionAbsorption: 1,
    healthBonus: 2,
    preferredDistricts: ['abyss-gate', 'dolphin-arena'],
  },
  'blue-coral': {
    id: 'blue-coral',
    name: 'Blue Coral',
    description: 'Rare azure-colored coral that emits a calming blue luminescence visible from great distances.',
    growthRate: 0.4,
    beautyScore: 11,
    cost: { pearls: 40, kelp: 15, sand: 20, coralSeeds: 12, deepGems: 3 },
    pollutionAbsorption: 5,
    healthBonus: 7,
    preferredDistricts: ['jellyfish-gardens', 'coral-palace'],
  },
  'elkhorn': {
    id: 'elkhorn',
    name: 'Elkhorn Coral',
    description: 'Large branching coral resembling moose antlers, a critical keystone species for the reef.',
    growthRate: 1.5,
    beautyScore: 8,
    cost: { pearls: 18, kelp: 20, sand: 10, coralSeeds: 10, deepGems: 0 },
    pollutionAbsorption: 3,
    healthBonus: 4,
    preferredDistricts: ['kelp-gardens', 'seahorse-stables'],
  },
  'mushroom': {
    id: 'mushroom',
    name: 'Mushroom Coral',
    description: 'Disc-shaped corals resembling colorful underwater mushrooms dotting the reef landscape.',
    growthRate: 0.6,
    beautyScore: 7,
    cost: { pearls: 16, kelp: 8, sand: 12, coralSeeds: 4, deepGems: 1 },
    pollutionAbsorption: 2,
    healthBonus: 5,
    preferredDistricts: ['jellyfish-gardens', 'turtle-sanctuary'],
  },
  'tube': {
    id: 'tube',
    name: 'Tube Coral',
    description: 'Cylindrical coral formations creating natural chimneys and tunnels in the reef structure.',
    growthRate: 0.7,
    beautyScore: 6,
    cost: { pearls: 14, kelp: 10, sand: 15, coralSeeds: 3, deepGems: 0 },
    pollutionAbsorption: 2,
    healthBonus: 3,
    preferredDistricts: ['shipwreck-museum', 'octopus-labs'],
  },
  'star': {
    id: 'star',
    name: 'Star Coral',
    description: 'Corals forming perfect star-shaped patterns, highly prized by collectors for their symmetry.',
    growthRate: 0.5,
    beautyScore: 12,
    cost: { pearls: 35, kelp: 12, sand: 18, coralSeeds: 15, deepGems: 2 },
    pollutionAbsorption: 3,
    healthBonus: 6,
    preferredDistricts: ['coral-palace', 'dolphin-arena'],
  },
  'lace': {
    id: 'lace',
    name: 'Lace Coral',
    description: 'Delicate intricate coral with exquisite lace-like patterns, extremely fragile yet stunning.',
    growthRate: 0.2,
    beautyScore: 14,
    cost: { pearls: 50, kelp: 20, sand: 25, coralSeeds: 20, deepGems: 5 },
    pollutionAbsorption: 1,
    healthBonus: 2,
    preferredDistricts: ['coral-palace', 'jellyfish-gardens'],
  },
  'sea-fan': {
    id: 'sea-fan',
    name: 'Sea Fan',
    description: 'Flat fan-shaped coral swaying gracefully in the ocean currents like underwater silk banners.',
    growthRate: 0.9,
    beautyScore: 9,
    cost: { pearls: 22, kelp: 15, sand: 8, coralSeeds: 8, deepGems: 1 },
    pollutionAbsorption: 4,
    healthBonus: 4,
    preferredDistricts: ['kelp-gardens', 'dolphin-arena'],
  },
};

// ==========================================
// Creature Configurations
// ==========================================

export const CRC_CREATURES: Record<CreatureId, CreatureConfig> = {
  'clownfish': {
    id: 'clownfish',
    name: 'Clownfish',
    description: 'Bright orange fish with white stripes that live symbiotically within anemone tentacles.',
    rarity: 'common',
    habitat: ['kelp-gardens', 'seahorse-stables'],
    cost: { pearls: 5, kelp: 3, sand: 2, coralSeeds: 1, deepGems: 0 },
    happinessBonus: 2,
    healthBonus: 1,
    beautyBonus: 3,
  },
  'blue-tang': {
    id: 'blue-tang',
    name: 'Blue Tang',
    description: 'Vibrant blue surgeonfish that dart through the reef keeping algae levels perfectly balanced.',
    rarity: 'common',
    habitat: ['kelp-gardens', 'turtle-sanctuary'],
    cost: { pearls: 5, kelp: 4, sand: 2, coralSeeds: 1, deepGems: 0 },
    happinessBonus: 2,
    healthBonus: 2,
    beautyBonus: 4,
  },
  'angelfish': {
    id: 'angelfish',
    name: 'Angelfish',
    description: 'Elegant triangular-shaped fish adorned with striking patterns of gold and black.',
    rarity: 'common',
    habitat: ['coral-palace', 'pearl-market'],
    cost: { pearls: 8, kelp: 3, sand: 3, coralSeeds: 2, deepGems: 0 },
    happinessBonus: 3,
    healthBonus: 1,
    beautyBonus: 5,
  },
  'pufferfish': {
    id: 'pufferfish',
    name: 'Pufferfish',
    description: 'Adorable round fish that can inflate into a spiky ball when threatened by predators.',
    rarity: 'uncommon',
    habitat: ['pearl-market', 'seahorse-stables'],
    cost: { pearls: 12, kelp: 5, sand: 4, coralSeeds: 2, deepGems: 1 },
    happinessBonus: 4,
    healthBonus: 2,
    beautyBonus: 3,
  },
  'lionfish': {
    id: 'lionfish',
    name: 'Lionfish',
    description: 'Strikingly beautiful but venomous predator with elaborate feathery fins and bold stripes.',
    rarity: 'uncommon',
    habitat: ['abyss-gate', 'shipwreck-museum'],
    cost: { pearls: 18, kelp: 6, sand: 5, coralSeeds: 3, deepGems: 2 },
    happinessBonus: 3,
    healthBonus: 1,
    beautyBonus: 8,
  },
  'seahorse': {
    id: 'seahorse',
    name: 'Seahorse',
    description: 'Delicate upright-swimming creatures that wrap their prehensile tails around coral branches.',
    rarity: 'common',
    habitat: ['seahorse-stables', 'kelp-gardens'],
    cost: { pearls: 6, kelp: 5, sand: 2, coralSeeds: 2, deepGems: 0 },
    happinessBonus: 4,
    healthBonus: 1,
    beautyBonus: 6,
  },
  'manta-ray': {
    id: 'manta-ray',
    name: 'Manta Ray',
    description: 'Gentle giants with wingspans up to 23 feet, gliding gracefully through open waters.',
    rarity: 'rare',
    habitat: ['dolphin-arena', 'turtle-sanctuary'],
    cost: { pearls: 40, kelp: 15, sand: 10, coralSeeds: 5, deepGems: 3 },
    happinessBonus: 6,
    healthBonus: 3,
    beautyBonus: 10,
  },
  'electric-eel': {
    id: 'electric-eel',
    name: 'Electric Eel',
    description: 'Knifefish capable of generating powerful electric shocks for hunting and self-defense.',
    rarity: 'rare',
    habitat: ['octopus-labs', 'abyss-gate'],
    cost: { pearls: 35, kelp: 10, sand: 8, coralSeeds: 6, deepGems: 5 },
    happinessBonus: 2,
    healthBonus: 5,
    beautyBonus: 4,
  },
  'octopus': {
    id: 'octopus',
    name: 'Octopus',
    description: 'Highly intelligent eight-armed cephalopod known for problem-solving and camouflage.',
    rarity: 'uncommon',
    habitat: ['octopus-labs', 'shipwreck-museum'],
    cost: { pearls: 25, kelp: 10, sand: 8, coralSeeds: 5, deepGems: 3 },
    happinessBonus: 5,
    healthBonus: 3,
    beautyBonus: 7,
  },
  'dolphin': {
    id: 'dolphin',
    name: 'Dolphin',
    description: 'Playful and highly social marine mammals beloved by all reef city inhabitants.',
    rarity: 'rare',
    habitat: ['dolphin-arena', 'turtle-sanctuary'],
    cost: { pearls: 50, kelp: 20, sand: 15, coralSeeds: 8, deepGems: 4 },
    happinessBonus: 10,
    healthBonus: 4,
    beautyBonus: 8,
  },
  'sea-turtle': {
    id: 'sea-turtle',
    name: 'Sea Turtle',
    description: 'Ancient and wise ocean travelers that have navigated the seas for over 100 million years.',
    rarity: 'uncommon',
    habitat: ['turtle-sanctuary', 'kelp-gardens'],
    cost: { pearls: 20, kelp: 12, sand: 10, coralSeeds: 4, deepGems: 2 },
    happinessBonus: 5,
    healthBonus: 4,
    beautyBonus: 7,
  },
  'jellyfish': {
    id: 'jellyfish',
    name: 'Jellyfish',
    description: 'Mesmerizing translucent drifters that pulse with ethereal bioluminescent light.',
    rarity: 'common',
    habitat: ['jellyfish-gardens', 'dolphin-arena'],
    cost: { pearls: 8, kelp: 4, sand: 3, coralSeeds: 2, deepGems: 1 },
    happinessBonus: 3,
    healthBonus: 1,
    beautyBonus: 9,
  },
  'hammerhead-shark': {
    id: 'hammerhead-shark',
    name: 'Hammerhead Shark',
    description: 'Distinctive shark with a hammer-shaped head providing exceptional 360-degree vision.',
    rarity: 'epic',
    habitat: ['abyss-gate', 'dolphin-arena'],
    cost: { pearls: 80, kelp: 20, sand: 15, coralSeeds: 10, deepGems: 8 },
    happinessBonus: 4,
    healthBonus: 8,
    beautyBonus: 6,
  },
  'whale-shark': {
    id: 'whale-shark',
    name: 'Whale Shark',
    description: 'The largest fish in the ocean, a gentle filter-feeding giant covered in star patterns.',
    rarity: 'legendary',
    habitat: ['turtle-sanctuary', 'dolphin-arena'],
    cost: { pearls: 150, kelp: 40, sand: 30, coralSeeds: 20, deepGems: 15 },
    happinessBonus: 12,
    healthBonus: 10,
    beautyBonus: 15,
  },
  'moray-eel': {
    id: 'moray-eel',
    name: 'Moray Eel',
    description: 'Sinuous predatory eels lurking in coral crevices with menacing jaws full of sharp teeth.',
    rarity: 'uncommon',
    habitat: ['shipwreck-museum', 'abyss-gate'],
    cost: { pearls: 22, kelp: 8, sand: 10, coralSeeds: 4, deepGems: 3 },
    happinessBonus: 1,
    healthBonus: 4,
    beautyBonus: 5,
  },
  'squid': {
    id: 'squid',
    name: 'Squid',
    description: 'Fast-swimming cephalopods with torpedo-shaped bodies that jet through the water column.',
    rarity: 'common',
    habitat: ['octopus-labs', 'abyss-gate'],
    cost: { pearls: 10, kelp: 6, sand: 4, coralSeeds: 3, deepGems: 1 },
    happinessBonus: 2,
    healthBonus: 2,
    beautyBonus: 3,
  },
  'starfish': {
    id: 'starfish',
    name: 'Starfish',
    description: 'Five-armed echinoderms slowly crawling across the reef floor in search of tasty mussels.',
    rarity: 'common',
    habitat: ['turtle-sanctuary', 'pearl-market'],
    cost: { pearls: 4, kelp: 2, sand: 3, coralSeeds: 1, deepGems: 0 },
    happinessBonus: 2,
    healthBonus: 1,
    beautyBonus: 4,
  },
  'hermit-crab': {
    id: 'hermit-crab',
    name: 'Hermit Crab',
    description: 'Resourceful little crustaceans that adopt empty shells as mobile homes across the reef.',
    rarity: 'common',
    habitat: ['shipwreck-museum', 'pearl-market'],
    cost: { pearls: 3, kelp: 2, sand: 2, coralSeeds: 1, deepGems: 0 },
    happinessBonus: 3,
    healthBonus: 1,
    beautyBonus: 2,
  },
  'lobster': {
    id: 'lobster',
    name: 'Lobster',
    description: 'Prized crustaceans with powerful claws that serve as the reef city premier delicacy.',
    rarity: 'uncommon',
    habitat: ['shipwreck-museum', 'pearl-market'],
    cost: { pearls: 15, kelp: 8, sand: 5, coralSeeds: 3, deepGems: 2 },
    happinessBonus: 3,
    healthBonus: 2,
    beautyBonus: 3,
  },
  'sea-urchin': {
    id: 'sea-urchin',
    name: 'Sea Urchin',
    description: 'Spiny spherical creatures that graze on algae, essential for keeping the reef pristine.',
    rarity: 'common',
    habitat: ['kelp-gardens', 'turtle-sanctuary'],
    cost: { pearls: 4, kelp: 3, sand: 2, coralSeeds: 1, deepGems: 0 },
    happinessBonus: 1,
    healthBonus: 3,
    beautyBonus: 2,
  },
  'cuttlefish': {
    id: 'cuttlefish',
    name: 'Cuttlefish',
    description: 'Masters of color change with W-shaped pupils, among the most intelligent invertebrates.',
    rarity: 'uncommon',
    habitat: ['jellyfish-gardens', 'octopus-labs'],
    cost: { pearls: 20, kelp: 8, sand: 6, coralSeeds: 4, deepGems: 2 },
    happinessBonus: 4,
    healthBonus: 2,
    beautyBonus: 6,
  },
  'parrotfish': {
    id: 'parrotfish',
    name: 'Parrotfish',
    description: 'Colorful fish with beak-like mouths that bite off chunks of coral, producing sand.',
    rarity: 'common',
    habitat: ['kelp-gardens', 'pearl-market'],
    cost: { pearls: 7, kelp: 4, sand: 3, coralSeeds: 2, deepGems: 0 },
    happinessBonus: 3,
    healthBonus: 2,
    beautyBonus: 5,
  },
  'grouper': {
    id: 'grouper',
    name: 'Grouper',
    description: 'Large robust predatory fish that serve as the reef heavyweights and territory guardians.',
    rarity: 'uncommon',
    habitat: ['shipwreck-museum', 'abyss-gate'],
    cost: { pearls: 18, kelp: 7, sand: 6, coralSeeds: 3, deepGems: 2 },
    happinessBonus: 2,
    healthBonus: 5,
    beautyBonus: 3,
  },
  'barracuda': {
    id: 'barracuda',
    name: 'Barracuda',
    description: 'Sleek silver torpedoes of the reef, the fastest and most fearsome ambush predators.',
    rarity: 'rare',
    habitat: ['abyss-gate', 'dolphin-arena'],
    cost: { pearls: 30, kelp: 10, sand: 8, coralSeeds: 5, deepGems: 4 },
    happinessBonus: 1,
    healthBonus: 6,
    beautyBonus: 5,
  },
  'nurse-shark': {
    id: 'nurse-shark',
    name: 'Nurse Shark',
    description: 'Docile bottom-dwelling sharks that rest during the day and hunt crabs at night.',
    rarity: 'rare',
    habitat: ['turtle-sanctuary', 'shipwreck-museum'],
    cost: { pearls: 35, kelp: 12, sand: 10, coralSeeds: 6, deepGems: 5 },
    happinessBonus: 3,
    healthBonus: 7,
    beautyBonus: 4,
  },
  'giant-clam': {
    id: 'giant-clam',
    name: 'Giant Clam',
    description: 'Enormous bivalves weighing up to 440 pounds, their mantles shimmer with iridescent colors.',
    rarity: 'rare',
    habitat: ['pearl-market', 'coral-palace'],
    cost: { pearls: 45, kelp: 15, sand: 12, coralSeeds: 8, deepGems: 6 },
    happinessBonus: 4,
    healthBonus: 3,
    beautyBonus: 9,
  },
  'leafy-seadragon': {
    id: 'leafy-seadragon',
    name: 'Leafy Seadragon',
    description: 'Ornate cousins of seahorses covered in leaf-like appendages for perfect camouflage.',
    rarity: 'epic',
    habitat: ['kelp-gardens', 'seahorse-stables'],
    cost: { pearls: 70, kelp: 25, sand: 12, coralSeeds: 12, deepGems: 8 },
    happinessBonus: 8,
    healthBonus: 4,
    beautyBonus: 14,
  },
  'mimic-octopus': {
    id: 'mimic-octopus',
    name: 'Mimic Octopus',
    description: 'An extraordinary shape-shifter that impersonates lionfish, flatfish, and sea snakes.',
    rarity: 'epic',
    habitat: ['octopus-labs', 'abyss-gate'],
    cost: { pearls: 90, kelp: 20, sand: 15, coralSeeds: 15, deepGems: 10 },
    happinessBonus: 7,
    healthBonus: 5,
    beautyBonus: 12,
  },
  'sunfish': {
    id: 'sunfish',
    name: 'Sunfish',
    description: 'The heaviest bony fish alive, a gentle ocean giant that basks near the surface for warmth.',
    rarity: 'epic',
    habitat: ['dolphin-arena', 'turtle-sanctuary'],
    cost: { pearls: 100, kelp: 30, sand: 20, coralSeeds: 10, deepGems: 12 },
    happinessBonus: 9,
    healthBonus: 6,
    beautyBonus: 11,
  },
  'cleaner-wrasse': {
    id: 'cleaner-wrasse',
    name: 'Cleaner Wrasse',
    description: 'Tiny but vital fish that operate cleaning stations keeping all reef residents healthy.',
    rarity: 'common',
    habitat: ['pearl-market', 'seahorse-stables'],
    cost: { pearls: 5, kelp: 3, sand: 2, coralSeeds: 1, deepGems: 0 },
    happinessBonus: 3,
    healthBonus: 4,
    beautyBonus: 2,
  },
};

// ==========================================
// Festival Configurations
// ==========================================

export const CRC_FESTIVALS: Record<FestivalId, FestivalConfig> = {
  'coral-bloom': {
    id: 'coral-bloom',
    name: 'Coral Bloom Festival',
    description: 'A celebration of new growth where all corals bloom simultaneously in brilliant colors.',
    durationHours: 4,
    cost: { pearls: 50, kelp: 30, sand: 20, coralSeeds: 15, deepGems: 3 },
    happinessBonus: 10,
    healthBonus: 5,
    growthMultiplier: 2.0,
    resourceMultiplier: 1.3,
  },
  'tide-festival': {
    id: 'tide-festival',
    name: 'Tide Festival',
    description: 'Honoring the rhythmic tides that bring nutrients and life to the coral reef city.',
    durationHours: 6,
    cost: { pearls: 40, kelp: 40, sand: 15, coralSeeds: 10, deepGems: 2 },
    happinessBonus: 8,
    healthBonus: 8,
    growthMultiplier: 1.5,
    resourceMultiplier: 1.5,
  },
  'moonlight-spawning': {
    id: 'moonlight-spawning',
    name: 'Moonlight Spawning',
    description: 'Under the full moon, creatures gather for the annual mass coral spawning event.',
    durationHours: 3,
    cost: { pearls: 60, kelp: 20, sand: 10, coralSeeds: 25, deepGems: 5 },
    happinessBonus: 15,
    healthBonus: 3,
    growthMultiplier: 3.0,
    resourceMultiplier: 1.0,
  },
  'deep-current': {
    id: 'deep-current',
    name: 'Deep Current Celebration',
    description: 'When deep ocean currents bring rare minerals and exotic creatures to the reef.',
    durationHours: 8,
    cost: { pearls: 70, kelp: 25, sand: 25, coralSeeds: 10, deepGems: 10 },
    happinessBonus: 5,
    healthBonus: 10,
    growthMultiplier: 1.0,
    resourceMultiplier: 2.0,
  },
  'bioluminescence-night': {
    id: 'bioluminescence-night',
    name: 'Bioluminescence Night',
    description: 'The entire reef glows with magical bioluminescent light in a spectacular natural show.',
    durationHours: 5,
    cost: { pearls: 55, kelp: 15, sand: 10, coralSeeds: 8, deepGems: 8 },
    happinessBonus: 20,
    healthBonus: 2,
    growthMultiplier: 1.2,
    resourceMultiplier: 1.2,
  },
  'pearl-harvest': {
    id: 'pearl-harvest',
    name: 'Pearl Harvest Festival',
    description: 'The most prosperous time when giant clams produce their finest pearls of the year.',
    durationHours: 6,
    cost: { pearls: 20, kelp: 30, sand: 30, coralSeeds: 5, deepGems: 5 },
    happinessBonus: 8,
    healthBonus: 5,
    growthMultiplier: 1.0,
    resourceMultiplier: 2.5,
  },
  'kelp-feast': {
    id: 'kelp-feast',
    name: 'Kelp Feast',
    description: 'An abundant harvest celebration where kelp gardens overflow with golden bounty.',
    durationHours: 4,
    cost: { pearls: 30, kelp: 10, sand: 20, coralSeeds: 10, deepGems: 2 },
    happinessBonus: 12,
    healthBonus: 6,
    growthMultiplier: 1.8,
    resourceMultiplier: 1.8,
  },
  'reef-unity': {
    id: 'reef-unity',
    name: 'Reef Unity Day',
    description: 'All creatures and districts come together in harmony to celebrate reef solidarity.',
    durationHours: 12,
    cost: { pearls: 100, kelp: 50, sand: 40, coralSeeds: 20, deepGems: 10 },
    happinessBonus: 25,
    healthBonus: 15,
    growthMultiplier: 1.5,
    resourceMultiplier: 1.5,
  },
};

// ==========================================
// Trade City Configurations
// ==========================================

export const CRC_TRADE_CITIES: Record<TradeCityId, TradeCityConfig> = {
  'sunken-atlantis': {
    id: 'sunken-atlantis',
    name: 'Sunken Atlantis',
    description: 'The legendary fallen empire, now a thriving underwater trade metropolis.',
    specialtyResource: 'deepGems',
    rates: {
      pearls: 1.2,
      kelp: 0.9,
      sand: 1.0,
      coralSeeds: 1.1,
      deepGems: 0.7,
    },
  },
  'coralith-harbor': {
    id: 'coralith-harbor',
    name: 'Coralith Harbor',
    description: 'A warm-water port city famous for its spectacular coral architecture.',
    specialtyResource: 'coralSeeds',
    rates: {
      pearls: 1.0,
      kelp: 1.1,
      sand: 0.8,
      coralSeeds: 0.6,
      deepGems: 1.3,
    },
  },
  'abyssia': {
    id: 'abyssia',
    name: 'Abyssia',
    description: 'A mysterious deep-sea city inhabited by beings of the lightless depths.',
    specialtyResource: 'deepGems',
    rates: {
      pearls: 1.4,
      kelp: 1.3,
      sand: 1.1,
      coralSeeds: 1.2,
      deepGems: 0.5,
    },
  },
  'pearlvale': {
    id: 'pearlvale',
    name: 'Pearlvale',
    description: 'A shimmering valley where the finest pearls in the ocean are cultivated.',
    specialtyResource: 'pearls',
    rates: {
      pearls: 0.5,
      kelp: 1.2,
      sand: 1.0,
      coralSeeds: 1.1,
      deepGems: 1.2,
    },
  },
  'tidecrest': {
    id: 'tidecrest',
    name: 'Tidecrest',
    description: 'A city perched on an underwater ridge where currents converge with great force.',
    specialtyResource: 'kelp',
    rates: {
      pearls: 1.1,
      kelp: 0.5,
      sand: 0.9,
      coralSeeds: 1.0,
      deepGems: 1.2,
    },
  },
  'deeproot': {
    id: 'deeproot',
    name: 'Deeproot',
    description: 'An ancient city grown from the roots of underwater mangrove forests.',
    specialtyResource: 'sand',
    rates: {
      pearls: 1.0,
      kelp: 1.0,
      sand: 0.6,
      coralSeeds: 0.9,
      deepGems: 1.1,
    },
  },
};

// ==========================================
// Achievement Configurations
// ==========================================

export const CRC_ACHIEVEMENTS: Record<AchievementId, AchievementConfig> = {
  'first-coral': {
    id: 'first-coral',
    name: 'First Bloom',
    description: 'Place your very first coral in the reef city.',
    pearlReward: 20,
    xpReward: 25,
  },
  'ten-corals': {
    id: 'ten-corals',
    name: 'Growing Garden',
    description: 'Place a total of 10 corals across all districts.',
    pearlReward: 50,
    xpReward: 75,
  },
  'fifty-corals': {
    id: 'fifty-corals',
    name: 'Coral Architect',
    description: 'Place a total of 50 corals to become a true coral architect.',
    pearlReward: 200,
    xpReward: 300,
  },
  'first-creature': {
    id: 'first-creature',
    name: 'Welcome Visitor',
    description: 'Attract your first underwater creature to the reef city.',
    pearlReward: 25,
    xpReward: 30,
  },
  'ten-creatures': {
    id: 'ten-creatures',
    name: 'Wildlife Haven',
    description: 'Attract 10 different species of underwater creatures.',
    pearlReward: 80,
    xpReward: 120,
  },
  'all-districts': {
    id: 'all-districts',
    name: 'City Planner',
    description: 'Build all 10 districts of the coral reef city.',
    pearlReward: 150,
    xpReward: 200,
  },
  'max-palace': {
    id: 'max-palace',
    name: 'Royal Perfection',
    description: 'Upgrade the Coral Palace to its maximum level.',
    pearlReward: 300,
    xpReward: 500,
  },
  'first-festival': {
    id: 'first-festival',
    name: 'Party Starter',
    description: 'Host your very first coral reef festival event.',
    pearlReward: 30,
    xpReward: 50,
  },
  'all-festivals': {
    id: 'all-festivals',
    name: 'Festival Master',
    description: 'Host all 8 different festival types at least once.',
    pearlReward: 250,
    xpReward: 400,
  },
  'rich-mayor': {
    id: 'rich-mayor',
    name: 'Pearl Tycoon',
    description: 'Accumulate 1,000 pearls in your city treasury.',
    pearlReward: 0,
    xpReward: 200,
  },
  'clean-reef': {
    id: 'clean-reef',
    name: 'Pristine Waters',
    description: 'Reduce pollution in your reef city to zero.',
    pearlReward: 100,
    xpReward: 150,
  },
  'explorer': {
    id: 'explorer',
    name: 'Deep Diver',
    description: 'Complete 10 reef exploration dives.',
    pearlReward: 120,
    xpReward: 200,
  },
  'master-trader': {
    id: 'master-trader',
    name: 'Trade Baron',
    description: 'Complete 20 successful trades with neighboring reef cities.',
    pearlReward: 150,
    xpReward: 250,
  },
  'legendary-mayor': {
    id: 'legendary-mayor',
    name: 'Legendary Mayor',
    description: 'Reach the maximum mayor rank of 50.',
    pearlReward: 500,
    xpReward: 1000,
  },
  'coral-master': {
    id: 'coral-master',
    name: 'Coral Master',
    description: 'Have all 12 types of coral placed in your reef city simultaneously.',
    pearlReward: 400,
    xpReward: 600,
  },
};

// ==========================================
// Mayor Rank Titles
// ==========================================

export function crcGetRankTitle(rank: number): string {
  if (rank <= 0) return 'Novice Wader';
  if (rank <= 5) return 'Tide Pool Scout';
  if (rank <= 10) return 'Coral Tender';
  if (rank <= 15) return 'Reef Guardian';
  if (rank <= 20) return 'Ocean Steward';
  if (rank <= 25) return 'Deep Explorer';
  if (rank <= 30) return 'Pearl Councilor';
  if (rank <= 35) return 'Kelp Baron';
  if (rank <= 40) return 'Abyss Walker';
  if (rank <= 45) return 'Sea Monarch';
  if (rank <= 49) return 'Ocean Emperor';
  return 'Legendary Reef Lord';
}

// ==========================================
// Pure Utility Functions (crc prefix)
// ==========================================

export function crcEmptyResources(): Resources {
  return { pearls: 0, kelp: 0, sand: 0, coralSeeds: 0, deepGems: 0 };
}

export function crcResourcesEqual(a: Resources, b: Resources): boolean {
  return (
    a.pearls === b.pearls &&
    a.kelp === b.kelp &&
    a.sand === b.sand &&
    a.coralSeeds === b.coralSeeds &&
    a.deepGems === b.deepGems
  );
}

export function crcHasResources(state: CoralReefCityState, cost: Resources): boolean {
  return (
    state.resources.pearls >= cost.pearls &&
    state.resources.kelp >= cost.kelp &&
    state.resources.sand >= cost.sand &&
    state.resources.coralSeeds >= cost.coralSeeds &&
    state.resources.deepGems >= cost.deepGems
  );
}

export function crcSubtractResources(current: Resources, cost: Resources): Resources {
  return {
    pearls: Math.max(0, current.pearls - cost.pearls),
    kelp: Math.max(0, current.kelp - cost.kelp),
    sand: Math.max(0, current.sand - cost.sand),
    coralSeeds: Math.max(0, current.coralSeeds - cost.coralSeeds),
    deepGems: Math.max(0, current.deepGems - cost.deepGems),
  };
}

export function crcAddResources(current: Resources, income: Partial<Resources>): Resources {
  return {
    pearls: current.pearls + (income.pearls ?? 0),
    kelp: current.kelp + (income.kelp ?? 0),
    sand: current.sand + (income.sand ?? 0),
    coralSeeds: current.coralSeeds + (income.coralSeeds ?? 0),
    deepGems: current.deepGems + (income.deepGems ?? 0),
  };
}

export function crcGetDistrictSlots(districtId: DistrictId, level: number): number {
  const config = CRC_DISTRICTS[districtId];
  if (level <= 0) return 0;
  return config.baseCoralSlots + (level - 1);
}

export function crcGetBuildCost(districtId: DistrictId): Resources {
  return { ...CRC_DISTRICTS[districtId].buildCost };
}

export function crcGetUpgradeCost(districtId: DistrictId, currentLevel: number): Resources {
  if (currentLevel <= 0) return crcGetBuildCost(districtId);
  if (currentLevel >= CRC_MAX_DISTRICT_LEVEL) return crcEmptyResources();
  const config = CRC_DISTRICTS[districtId];
  const base = config.buildCost;
  const mult = Math.pow(config.upgradeCostMultiplier, currentLevel);
  return {
    pearls: Math.ceil(base.pearls * mult),
    kelp: Math.ceil(base.kelp * mult),
    sand: Math.ceil(base.sand * mult),
    coralSeeds: Math.ceil(base.coralSeeds * mult),
    deepGems: Math.ceil(base.deepGems * mult),
  };
}

export function crcGetCoralCost(coralId: CoralId): Resources {
  return { ...CRC_CORALS[coralId].cost };
}

export function crcGetCreatureCost(creatureId: CreatureId): Resources {
  return { ...CRC_CREATURES[creatureId].cost };
}

export function crcGetFestivalCost(festivalId: FestivalId): Resources {
  return { ...CRC_FESTIVALS[festivalId].cost };
}

export function crcGetCoralGrowthRate(coralId: CoralId, districtId: DistrictId): number {
  const coral = CRC_CORALS[coralId];
  const isPreferred = coral.preferredDistricts.includes(districtId);
  return isPreferred ? coral.growthRate * 1.5 : coral.growthRate;
}

export function crcGetCoralBeauty(coralId: CoralId, districtId: DistrictId): number {
  const coral = CRC_CORALS[coralId];
  const isPreferred = coral.preferredDistricts.includes(districtId);
  return isPreferred ? Math.ceil(coral.beautyScore * 1.5) : coral.beautyScore;
}

export function crcGetCreatureRarity(creatureId: CreatureId): CreatureRarity {
  return CRC_CREATURES[creatureId].rarity;
}

export function crcGetFestivalDuration(festivalId: FestivalId): number {
  return CRC_FESTIVALS[festivalId].durationHours;
}

export function crcGetFestivalHappinessBonus(festivalId: FestivalId): number {
  return CRC_FESTIVALS[festivalId].happinessBonus;
}

export function crcGetFestivalGrowthMultiplier(festivalId: FestivalId): number {
  return CRC_FESTIVALS[festivalId].growthMultiplier;
}

export function crcGetFestivalResourceMultiplier(festivalId: FestivalId): number {
  return CRC_FESTIVALS[festivalId].resourceMultiplier;
}

export function crcGetTradeRate(tradeCityId: TradeCityId, resourceId: ResourceId): number {
  return CRC_TRADE_CITIES[tradeCityId].rates[resourceId];
}

export function crcCalculateTradeAmount(
  tradeCityId: TradeCityId,
  giveId: ResourceId,
  giveAmount: number,
  receiveId: ResourceId
): number {
  const rates = CRC_TRADE_CITIES[tradeCityId].rates;
  const giveRate = rates[giveId];
  const receiveRate = rates[receiveId];
  const raw = (giveAmount * giveRate) / receiveRate;
  return Math.floor(raw * 0.9);
}

export function crcGetPlacedCoralsCount(state: CoralReefCityState): number {
  let count = 0;
  const districtIds: DistrictId[] = [
    'coral-palace', 'kelp-gardens', 'pearl-market', 'seahorse-stables',
    'octopus-labs', 'dolphin-arena', 'turtle-sanctuary', 'jellyfish-gardens',
    'shipwreck-museum', 'abyss-gate',
  ];
  for (const dId of districtIds) {
    const district = state.districts[dId];
    for (const slot of district.coralSlots) {
      if (slot !== null) count++;
    }
  }
  return count;
}

export function crcGetUniqueCoralsCount(state: CoralReefCityState): number {
  const placed = new Set<CoralId>();
  const districtIds: DistrictId[] = [
    'coral-palace', 'kelp-gardens', 'pearl-market', 'seahorse-stables',
    'octopus-labs', 'dolphin-arena', 'turtle-sanctuary', 'jellyfish-gardens',
    'shipwreck-museum', 'abyss-gate',
  ];
  for (const dId of districtIds) {
    const district = state.districts[dId];
    for (const slot of district.coralSlots) {
      if (slot !== null) placed.add(slot);
    }
  }
  return placed.size;
}

export function crcGetBuiltDistrictsCount(state: CoralReefCityState): number {
  let count = 0;
  for (const dId of CRC_ALL_DISTRICT_IDS) {
    if (state.districts[dId].level > 0) count++;
  }
  return count;
}

export function crcGetMaxDistrictLevel(state: CoralReefCityState): number {
  let max = 0;
  for (const dId of CRC_ALL_DISTRICT_IDS) {
    if (state.districts[dId].level > max) max = state.districts[dId].level;
  }
  return max;
}

export function crcGetCompletedFestivalsCount(state: CoralReefCityState): number {
  return state.completedFestivals.length;
}

export function crcIsCreatureAttracted(state: CoralReefCityState, creatureId: CreatureId): boolean {
  return state.attractedCreatures.includes(creatureId);
}

export function crcGetAttractedCreaturesCount(state: CoralReefCityState): number {
  return state.attractedCreatures.length;
}

export function crcGetTotalBeautyScore(state: CoralReefCityState): number {
  let total = 0;
  for (const dId of CRC_ALL_DISTRICT_IDS) {
    const district = state.districts[dId];
    for (const slot of district.coralSlots) {
      if (slot !== null) {
        total += crcGetCoralBeauty(slot, dId);
      }
    }
  }
  for (const cId of state.attractedCreatures) {
    total += CRC_CREATURES[cId].beautyBonus;
  }
  return total;
}

export function crcGetPollutionAbsorptionTotal(state: CoralReefCityState): number {
  let total = 0;
  for (const dId of CRC_ALL_DISTRICT_IDS) {
    const district = state.districts[dId];
    if (district.level <= 0) continue;
    const config = CRC_DISTRICTS[dId];
    total += config.pollutionReduction * district.level;
    for (const slot of district.coralSlots) {
      if (slot !== null) {
        total += CRC_CORALS[slot].pollutionAbsorption;
      }
    }
  }
  return total;
}

export function crcGetTotalHealthBonus(state: CoralReefCityState): number {
  let total = 0;
  for (const dId of CRC_ALL_DISTRICT_IDS) {
    const district = state.districts[dId];
    for (const slot of district.coralSlots) {
      if (slot !== null) {
        total += CRC_CORALS[slot].healthBonus;
      }
    }
  }
  for (const cId of state.attractedCreatures) {
    total += CRC_CREATURES[cId].healthBonus;
  }
  return total;
}

export function crcGetTotalHappinessBonus(state: CoralReefCityState): number {
  let total = 0;
  for (const dId of CRC_ALL_DISTRICT_IDS) {
    const district = state.districts[dId];
    if (district.level <= 0) continue;
    const config = CRC_DISTRICTS[dId];
    total += config.happinessBonusPerLevel * district.level;
    total += district.decorations * 2;
  }
  for (const cId of state.attractedCreatures) {
    total += CRC_CREATURES[cId].happinessBonus;
  }
  if (state.activeFestival !== null) {
    total += CRC_FESTIVALS[state.activeFestival].happinessBonus;
  }
  return total;
}

export function crcCalculateCityHealth(state: CoralReefCityState): number {
  const healthBonus = Math.min(crcGetTotalHealthBonus(state), 60);
  const pollPenalty = state.pollution * 0.5;
  const biodBonus = state.biodiversity * 0.3;
  const raw = 20 + healthBonus + biodBonus - pollPenalty;
  return Math.max(0, Math.min(CRC_MAX_HEALTH, Math.round(raw)));
}

export function crcCalculateCityHappiness(state: CoralReefCityState): number {
  const health = crcCalculateCityHealth(state);
  const hapBonus = Math.min(crcGetTotalHappinessBonus(state), 80);
  const beautyBonus = Math.min(crcGetTotalBeautyScore(state) * 0.1, 20);
  const pollPenalty = state.pollution * 0.3;
  const raw = health * 0.4 + hapBonus * 0.5 + beautyBonus - pollPenalty;
  return Math.max(0, Math.min(CRC_MAX_HAPPINESS, Math.round(raw)));
}

export function crcCalculateBiodiversity(state: CoralReefCityState): number {
  const uniqueCorals = crcGetUniqueCoralsCount(state);
  const creatures = state.attractedCreatures.length;
  const builtDistricts = crcGetBuiltDistrictsCount(state);
  const coralContrib = Math.min(uniqueCorals * 4, 40);
  const creatureContrib = Math.min(creatures * 2.5, 30);
  const districtContrib = builtDistricts * 3;
  const raw = coralContrib + creatureContrib + districtContrib;
  return Math.max(0, Math.min(CRC_MAX_BIODIVERSITY, Math.round(raw)));
}

export function crcCalculateDecorationScore(state: CoralReefCityState): number {
  let total = 0;
  for (const dId of CRC_ALL_DISTRICT_IDS) {
    const district = state.districts[dId];
    if (district.level <= 0) continue;
    total += district.decorations * 3;
    for (const slot of district.coralSlots) {
      if (slot !== null) {
        total += Math.floor(CRC_CORALS[slot].beautyScore * 0.5);
      }
    }
  }
  return Math.min(total, 999);
}

export function crcCalculatePollutionReduction(state: CoralReefCityState): number {
  return crcGetPollutionAbsorptionTotal(state);
}

export function crcCalculateResourceIncome(state: CoralReefCityState): Resources {
  const base: Resources = { pearls: 10, kelp: 15, sand: 12, coralSeeds: 5, deepGems: 2 };
  const districtBonus: Resources = { pearls: 0, kelp: 0, sand: 0, coralSeeds: 0, deepGems: 0 };
  for (const dId of CRC_ALL_DISTRICT_IDS) {
    const district = state.districts[dId];
    if (district.level <= 0) continue;
    const config = CRC_DISTRICTS[dId];
    const bonus = config.resourceBonus;
    if (bonus.pearls) districtBonus.pearls += bonus.pearls * district.level;
    if (bonus.kelp) districtBonus.kelp += bonus.kelp * district.level;
    if (bonus.sand) districtBonus.sand += bonus.sand * district.level;
    if (bonus.coralSeeds) districtBonus.coralSeeds += bonus.coralSeeds * district.level;
    if (bonus.deepGems) districtBonus.deepGems += bonus.deepGems * district.level;
  }
  let multiplier = 1.0;
  if (state.activeFestival !== null) {
    multiplier *= CRC_FESTIVALS[state.activeFestival].resourceMultiplier;
  }
  const happinessBonus = state.cityHappiness / 100;
  const totalMultiplier = multiplier * (0.5 + happinessBonus * 0.5);
  return {
    pearls: Math.floor((base.pearls + districtBonus.pearls) * totalMultiplier),
    kelp: Math.floor((base.kelp + districtBonus.kelp) * totalMultiplier),
    sand: Math.floor((base.sand + districtBonus.sand) * totalMultiplier),
    coralSeeds: Math.floor((base.coralSeeds + districtBonus.coralSeeds) * totalMultiplier),
    deepGems: Math.floor((base.deepGems + districtBonus.deepGems) * totalMultiplier),
  };
}

export function crcCalculateMayorXpThreshold(rank: number): number {
  if (rank <= 0) return 0;
  if (rank > CRC_MAX_MAYOR_RANK) return Infinity;
  return Math.floor(100 * rank * (rank + 1) / 2);
}

export function crcCalculateMayorProgress(state: CoralReefCityState): number {
  const currentThreshold = crcCalculateMayorXpThreshold(state.mayorRank);
  const nextThreshold = crcCalculateMayorXpThreshold(state.mayorRank + 1);
  if (nextThreshold === Infinity) return 1;
  const progress = (state.mayorXp - currentThreshold) / (nextThreshold - currentThreshold);
  return Math.max(0, Math.min(1, progress));
}

export function crcGetDiveEncounterCount(depth: DiveDepth): number {
  switch (depth) {
    case 'shallow': return 3;
    case 'mid': return 4;
    case 'deep': return 5;
    case 'abyss': return 6;
  }
}

export function crcGetDiveBaseXp(depth: DiveDepth): number {
  switch (depth) {
    case 'shallow': return 10;
    case 'mid': return 25;
    case 'deep': return 50;
    case 'abyss': return 100;
  }
}

export function crcGetDivePollutionRisk(depth: DiveDepth): number {
  switch (depth) {
    case 'shallow': return 0;
    case 'mid': return 2;
    case 'deep': return 5;
    case 'abyss': return 10;
  }
}

export function crcIsDiveAvailable(state: CoralReefCityState): boolean {
  const today = crcGetTodayString();
  return state.diveDate !== today;
}

export function crcCheckAchievement(state: CoralReefCityState, id: AchievementId): boolean {
  switch (id) {
    case 'first-coral':
      return state.totalCoralsPlaced >= 1;
    case 'ten-corals':
      return state.totalCoralsPlaced >= 10;
    case 'fifty-corals':
      return state.totalCoralsPlaced >= 50;
    case 'first-creature':
      return state.attractedCreatures.length >= 1;
    case 'ten-creatures':
      return state.attractedCreatures.length >= 10;
    case 'all-districts':
      return CRC_ALL_DISTRICT_IDS.every(d => state.districts[d].level > 0);
    case 'max-palace':
      return state.districts['coral-palace'].level >= CRC_MAX_DISTRICT_LEVEL;
    case 'first-festival':
      return state.completedFestivals.length >= 1;
    case 'all-festivals':
      return state.completedFestivals.length >= 8;
    case 'rich-mayor':
      return state.resources.pearls >= 1000;
    case 'clean-reef':
      return state.pollution <= 0;
    case 'explorer':
      return state.totalDives >= 10;
    case 'master-trader':
      return state.totalTrades >= 20;
    case 'legendary-mayor':
      return state.mayorRank >= CRC_MAX_MAYOR_RANK;
    case 'coral-master':
      return CRC_ALL_CORAL_IDS.every(cid =>
        Object.values(state.districts).some(d => d.coralSlots.includes(cid))
      );
  }
}

export function crcGetEarnedAchievements(state: CoralReefCityState): AchievementId[] {
  return CRC_ALL_ACHIEVEMENT_IDS.filter(id => crcCheckAchievement(state, id));
}

export function crcGetUnclaimedAchievements(state: CoralReefCityState): AchievementId[] {
  return CRC_ALL_ACHIEVEMENT_IDS.filter(
    id => crcCheckAchievement(state, id) && !state.achievementClaimed[id]
  );
}

export function crcGetNextAchievement(state: CoralReefCityState): AchievementId | null {
  const unclaimed = crcGetUnclaimedAchievements(state);
  return unclaimed.length > 0 ? unclaimed[0] : null;
}

export function crcGetAvailableUpgrades(state: CoralReefCityState): DistrictId[] {
  return CRC_ALL_DISTRICT_IDS.filter(dId => {
    const district = state.districts[dId];
    if (district.level >= CRC_MAX_DISTRICT_LEVEL) return false;
    const cost = crcGetUpgradeCost(dId, district.level);
    return crcHasResources(state, cost);
  });
}

export function crcGetPlaceableCorals(state: CoralReefCityState, districtId: DistrictId): CoralId[] {
  if (state.districts[districtId].level <= 0) return [];
  const hasSlot = state.districts[districtId].coralSlots.some(s => s === null);
  if (!hasSlot) return [];
  return CRC_ALL_CORAL_IDS.filter(cid => crcHasResources(state, CRC_CORALS[cid].cost));
}

export function crcGetAttractableCreatures(state: CoralReefCityState): CreatureId[] {
  return CRC_ALL_CREATURE_IDS.filter(cid => {
    if (state.attractedCreatures.includes(cid)) return false;
    return crcHasResources(state, CRC_CREATURES[cid].cost);
  });
}

export function crcGetAvailableFestivals(state: CoralReefCityState): FestivalId[] {
  if (state.activeFestival !== null) return [];
  return CRC_ALL_FESTIVAL_IDS.filter(fid => {
    if (state.completedFestivals.includes(fid)) return true;
    return crcHasResources(state, CRC_FESTIVALS[fid].cost);
  });
}

export function crcGetActiveTradeCities(state: CoralReefCityState): TradeCityId[] {
  return CRC_ALL_TRADE_CITY_IDS;
}

export function crcGetDistrictDescription(districtId: DistrictId): string {
  return CRC_DISTRICTS[districtId].description;
}

export function crcGetCoralDescription(coralId: CoralId): string {
  return CRC_CORALS[coralId].description;
}

export function crcGetCreatureDescription(creatureId: CreatureId): string {
  return CRC_CREATURES[creatureId].description;
}

export function crcGetFestivalDescription(festivalId: FestivalId): string {
  return CRC_FESTIVALS[festivalId].description;
}

export function crcGetTradeCityDescription(cityId: TradeCityId): string {
  return CRC_TRADE_CITIES[cityId].description;
}

export function crcGetAchievementDescription(achievementId: AchievementId): string {
  return CRC_ACHIEVEMENTS[achievementId].description;
}

export function crcGetAchievementName(achievementId: AchievementId): string {
  return CRC_ACHIEVEMENTS[achievementId].name;
}

export function crcGetAchievementReward(achievementId: AchievementId): { pearls: number; xp: number } {
  const cfg = CRC_ACHIEVEMENTS[achievementId];
  return { pearls: cfg.pearlReward, xp: cfg.xpReward };
}

export function crcGetCreatureHappinessBonus(creatureId: CreatureId): number {
  return CRC_CREATURES[creatureId].happinessBonus;
}

export function crcGetCreatureHealthBonus(creatureId: CreatureId): number {
  return CRC_CREATURES[creatureId].healthBonus;
}

export function crcGetCreatureBeautyBonus(creatureId: CreatureId): number {
  return CRC_CREATURES[creatureId].beautyBonus;
}

export function crcGetCreatureHabitat(creatureId: CreatureId): DistrictId[] {
  return CRC_CREATURES[creatureId].habitat;
}

export function crcGetCoralPreferredDistricts(coralId: CoralId): DistrictId[] {
  return CRC_CORALS[coralId].preferredDistricts;
}

export function crcGetDistrictTheme(districtId: DistrictId): string {
  return CRC_DISTRICTS[districtId].theme;
}

export function crcGetDistrictPollutionReduction(districtId: DistrictId): number {
  return CRC_DISTRICTS[districtId].pollutionReduction;
}

export function crcGetCoralPollutionAbsorption(coralId: CoralId): number {
  return CRC_CORALS[coralId].pollutionAbsorption;
}

export function crcGetTradeCitySpecialty(tradeCityId: TradeCityId): ResourceId {
  return CRC_TRADE_CITIES[tradeCityId].specialtyResource;
}

export function crcGetRarityLevel(rarity: CreatureRarity): number {
  switch (rarity) {
    case 'common': return 1;
    case 'uncommon': return 2;
    case 'rare': return 3;
    case 'epic': return 4;
    case 'legendary': return 5;
  }
}

export function crcGetDistrictLevel(state: CoralReefCityState, districtId: DistrictId): number {
  return state.districts[districtId].level;
}

export function crcIsDistrictBuilt(state: CoralReefCityState, districtId: DistrictId): boolean {
  return state.districts[districtId].level > 0;
}

export function crcGetDistrictDecorationCount(state: CoralReefCityState, districtId: DistrictId): number {
  return state.districts[districtId].decorations;
}

export function crcGetFestivalHealthBonus(festivalId: FestivalId): number {
  return CRC_FESTIVALS[festivalId].healthBonus;
}

export function crcGetPollutionCleanCost(amount: number): Resources {
  return {
    pearls: Math.ceil(amount * 2),
    kelp: Math.ceil(amount * 1.5),
    sand: 0,
    coralSeeds: Math.ceil(amount * 0.5),
    deepGems: 0,
  };
}

export function crcGetDecorationCost(): Resources {
  return { pearls: 15, kelp: 10, sand: 10, coralSeeds: 3, deepGems: 1 };
}

export function crcGetLevel(rank: number): number {
  if (rank <= 5) return 1;
  if (rank <= 10) return 2;
  if (rank <= 20) return 3;
  if (rank <= 30) return 4;
  if (rank <= 40) return 5;
  return 6;
}

// ==========================================
// Internal Helpers
// ==========================================

function crcGetTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function crcCreateEmptyDistrictState(): DistrictState {
  return {
    level: 0,
    coralSlots: [],
    decorations: 0,
  };
}

function crcCreateDefaultState(): CoralReefCityState {
  const districts: Record<DistrictId, DistrictState> = {} as Record<DistrictId, DistrictState>;
  for (const dId of CRC_ALL_DISTRICT_IDS) {
    districts[dId] = crcCreateEmptyDistrictState();
  }
  const achievements: Record<AchievementId, boolean> = {} as Record<AchievementId, boolean>;
  const achievementClaimed: Record<AchievementId, boolean> = {} as Record<AchievementId, boolean>;
  for (const aId of CRC_ALL_ACHIEVEMENT_IDS) {
    achievements[aId] = false;
    achievementClaimed[aId] = false;
  }
  return {
    resources: { pearls: 100, kelp: 80, sand: 60, coralSeeds: 20, deepGems: 5 },
    districts,
    attractedCreatures: [],
    cityHealth: 20,
    cityHappiness: 15,
    pollution: 5,
    biodiversity: 0,
    decorationScore: 0,
    activeFestival: null,
    festivalStartTime: null,
    completedFestivals: [],
    mayorRank: 1,
    mayorXp: 0,
    achievements,
    achievementClaimed,
    tradeHistory: [],
    diveDate: null,
    diveAvailable: true,
    totalDives: 0,
    currentDive: null,
    totalCoralsPlaced: 0,
    totalCollected: { pearls: 0, kelp: 0, sand: 0, coralSeeds: 0, deepGems: 0 },
    totalTrades: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function crcLoadState(): CoralReefCityState {
  if (typeof window === 'undefined') return crcCreateDefaultState();
  try {
    const saved = localStorage.getItem(CRC_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as CoralReefCityState;
      if (parsed && parsed.resources && parsed.districts) {
        return parsed;
      }
    }
  } catch {
    return crcCreateDefaultState();
  }
  return crcCreateDefaultState();
}

function crcSaveState(state: CoralReefCityState): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CRC_STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Silently fail if storage is full or unavailable
  }
}

function crcGenerateTradeId(): string {
  return `trade-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function crcGenerateDiveEncounters(depth: DiveDepth): DiveEncounter[] {
  const count = crcGetDiveEncounterCount(depth);
  const encounters: DiveEncounter[] = [];
  const resourceIds: ResourceId[] = ['pearls', 'kelp', 'sand', 'coralSeeds', 'deepGems'];
  const shallowCreatures: CreatureId[] = ['clownfish', 'blue-tang', 'seahorse', 'starfish', 'hermit-crab'];
  const midCreatures: CreatureId[] = ['pufferfish', 'cuttlefish', 'lobster', 'parrotfish', 'grouper'];
  const deepCreatures: CreatureId[] = ['lionfish', 'electric-eel', 'moray-eel', 'barracuda', 'nurse-shark'];
  const abyssCreatures: CreatureId[] = ['hammerhead-shark', 'whale-shark', 'manta-ray', 'leafy-seadragon', 'mimic-octopus'];
  const hazardDescriptions = [
    'A sudden strong current pushes you against sharp rocks!',
    'You encounter a school of territorial jellyfish with stinging tentacles!',
    'An underwater avalanche buries your path in heavy sediment!',
    'A aggressive predator patrols the area, forcing a detour!',
    'Volcanic vents erupt nearby, scalding the surrounding water!',
    'Your oxygen supply runs dangerously low in the murky depths!',
  ];
  const treasureDescriptions = [
    'You discover a hidden chest from a sunken pirate ship!',
    'A rare luminous pearl glows within an ancient clam shell!',
    'You find a vein of deep gems embedded in the canyon wall!',
    'An abandoned diver stash contains valuable supplies!',
    'A golden coral formation yields precious mineral deposits!',
  ];
  const discoveryDescriptions = [
    'You discover a previously unknown species of micro-coral!',
    'Ancient underwater ruins reveal lost reef civilization secrets!',
    'A hidden grotto contains perfectly preserved fossil specimens!',
    'You find a rare bioluminescent algae with unique properties!',
    'An unusual rock formation turns out to be a petrified leviathan skeleton!',
    'You uncover a map fragment pointing to another undiscovered reef zone!',
  ];
  let creaturePool: CreatureId[];
  let baseAmount: number;
  let hazardWeight: number;
  let treasureWeight: number;
  switch (depth) {
    case 'shallow':
      creaturePool = shallowCreatures;
      baseAmount = 3;
      hazardWeight = 0.05;
      treasureWeight = 0.05;
      break;
    case 'mid':
      creaturePool = [...shallowCreatures, ...midCreatures];
      baseAmount = 5;
      hazardWeight = 0.1;
      treasureWeight = 0.1;
      break;
    case 'deep':
      creaturePool = [...midCreatures, ...deepCreatures];
      baseAmount = 8;
      hazardWeight = 0.15;
      treasureWeight = 0.15;
      break;
    case 'abyss':
      creaturePool = [...deepCreatures, ...abyssCreatures];
      baseAmount = 12;
      hazardWeight = 0.2;
      treasureWeight = 0.2;
      break;
  }
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let encounter: DiveEncounter;
    if (roll < hazardWeight) {
      const desc = hazardDescriptions[Math.floor(Math.random() * hazardDescriptions.length)];
      const damage = Math.floor(Math.random() * 5) + 1 + (depth === 'abyss' ? 3 : 0);
      encounter = {
        kind: 'hazard',
        description: desc,
        damage,
      };
    } else if (roll < hazardWeight + treasureWeight) {
      const desc = treasureDescriptions[Math.floor(Math.random() * treasureDescriptions.length)];
      const resId = resourceIds[Math.floor(Math.random() * resourceIds.length)];
      const amount = baseAmount + Math.floor(Math.random() * baseAmount * 2);
      encounter = {
        kind: 'treasure',
        description: desc,
        resourceId: resId,
        amount,
      };
    } else if (roll < hazardWeight + treasureWeight + 0.15) {
      const desc = discoveryDescriptions[Math.floor(Math.random() * discoveryDescriptions.length)];
      encounter = {
        kind: 'discovery',
        description: desc,
        xpReward: baseAmount * 2,
      };
    } else if (roll < hazardWeight + treasureWeight + 0.35) {
      const creature = creaturePool[Math.floor(Math.random() * creaturePool.length)];
      encounter = {
        kind: 'creature',
        description: `You spot a magnificent ${CRC_CREATURES[creature].name} in its natural habitat!`,
        creatureId: creature,
      };
    } else {
      const resId = resourceIds[Math.floor(Math.random() * resourceIds.length)];
      const amount = Math.floor(baseAmount * 0.5) + Math.floor(Math.random() * baseAmount);
      const descMap: Record<ResourceId, string> = {
        pearls: `You find a cluster of shimmering pearls nestled in a coral crevice.`,
        kelp: `A dense patch of golden kelp sways invitingly nearby.`,
        sand: `Fine white sand deposits here could be useful for construction.`,
        coralSeeds: `You discover several viable coral seed pods waiting to be planted.`,
        deepGems: `A faint glow reveals deep gems embedded in the ocean floor.`,
      };
      encounter = {
        kind: 'resource',
        description: descMap[resId],
        resourceId: resId,
        amount,
      };
    }
    encounters.push(encounter);
  }
  return encounters;
}

function crcRecalculateAllStats(state: CoralReefCityState): Partial<CoralReefCityState> {
  const biodiversity = crcCalculateBiodiversity(state);
  const cityHealth = crcCalculateCityHealth({ ...state, biodiversity });
  const cityHappiness = crcCalculateCityHappiness({ ...state, cityHealth, biodiversity });
  const decorationScore = crcCalculateDecorationScore(state);
  return {
    biodiversity,
    cityHealth,
    cityHappiness,
    decorationScore,
  };
}

// ==========================================
// Main Hook
// ==========================================

export function useCoralReefCity(): CoralReefCityReturn {
  const [state, setState] = useState<CoralReefCityState>(crcLoadState);
  const [persistedAt, setPersistedAt] = useState<number>(0);

  const persist = (updater: (prev: CoralReefCityState) => CoralReefCityState): void => {
    setState(prev => {
      const next = updater(prev);
      const recalculated = crcRecalculateAllStats(next);
      const final = { ...next, ...recalculated, updatedAt: Date.now() };
      crcSaveState(final);
      return final;
    });
    setPersistedAt(Date.now());
  };

  const crcUpgradeDistrict = (districtId: DistrictId): boolean => {
    let success = false;
    persist(prev => {
      const district = prev.districts[districtId];
      if (district.level >= CRC_MAX_DISTRICT_LEVEL) return prev;
      const cost = crcGetUpgradeCost(districtId, district.level);
      if (!crcHasResources(prev, cost)) return prev;
      const newLevel = district.level + 1;
      const newSlotCount = crcGetDistrictSlots(districtId, newLevel);
      const currentSlots = [...district.coralSlots];
      while (currentSlots.length < newSlotCount) {
        currentSlots.push(null);
      }
      const newDistrict = { ...district, level: newLevel, coralSlots: currentSlots };
      const newResources = crcSubtractResources(prev.resources, cost);
      success = true;
      return {
        ...prev,
        resources: newResources,
        districts: { ...prev.districts, [districtId]: newDistrict },
      };
    });
    return success;
  };

  const crcBuildDistrict = (districtId: DistrictId): boolean => {
    let success = false;
    persist(prev => {
      const district = prev.districts[districtId];
      if (district.level > 0) return prev;
      const cost = crcGetBuildCost(districtId);
      if (!crcHasResources(prev, cost)) return prev;
      const newLevel = 1;
      const slotCount = crcGetDistrictSlots(districtId, newLevel);
      const slots: (CoralId | null)[] = [];
      for (let i = 0; i < slotCount; i++) {
        slots.push(null);
      }
      const newDistrict: DistrictState = { level: newLevel, coralSlots: slots, decorations: 0 };
      const newResources = crcSubtractResources(prev.resources, cost);
      success = true;
      return {
        ...prev,
        resources: newResources,
        districts: { ...prev.districts, [districtId]: newDistrict },
      };
    });
    return success;
  };

  const crcPlaceCoral = (districtId: DistrictId, coralId: CoralId, slotIndex: number): boolean => {
    let success = false;
    persist(prev => {
      const district = prev.districts[districtId];
      if (district.level <= 0) return prev;
      if (slotIndex < 0 || slotIndex >= district.coralSlots.length) return prev;
      if (district.coralSlots[slotIndex] !== null) return prev;
      const cost = crcGetCoralCost(coralId);
      if (!crcHasResources(prev, cost)) return prev;
      const newSlots = [...district.coralSlots];
      newSlots[slotIndex] = coralId;
      const newDistrict = { ...district, coralSlots: newSlots };
      const newResources = crcSubtractResources(prev.resources, cost);
      success = true;
      return {
        ...prev,
        resources: newResources,
        districts: { ...prev.districts, [districtId]: newDistrict },
        totalCoralsPlaced: prev.totalCoralsPlaced + 1,
      };
    });
    return success;
  };

  const crcRemoveCoral = (districtId: DistrictId, slotIndex: number): boolean => {
    let success = false;
    persist(prev => {
      const district = prev.districts[districtId];
      if (slotIndex < 0 || slotIndex >= district.coralSlots.length) return prev;
      if (district.coralSlots[slotIndex] === null) return prev;
      const newSlots = [...district.coralSlots];
      const removedCoral = newSlots[slotIndex];
      newSlots[slotIndex] = null;
      const newDistrict = { ...district, coralSlots: newSlots };
      const coralConfig = CRC_CORALS[removedCoral!];
      const refundAmount = 0.3;
      const refund: Partial<Resources> = {
        pearls: Math.floor(coralConfig.cost.pearls * refundAmount),
        kelp: Math.floor(coralConfig.cost.kelp * refundAmount),
        sand: Math.floor(coralConfig.cost.sand * refundAmount),
        coralSeeds: Math.floor(coralConfig.cost.coralSeeds * refundAmount),
        deepGems: Math.floor(coralConfig.cost.deepGems * refundAmount),
      };
      const newResources = crcAddResources(prev.resources, refund);
      success = true;
      return {
        ...prev,
        resources: newResources,
        districts: { ...prev.districts, [districtId]: newDistrict },
        totalCoralsPlaced: Math.max(0, prev.totalCoralsPlaced - 1),
      };
    });
    return success;
  };

  const crcCollectResources = (): Resources => {
    let collected = crcEmptyResources();
    persist(prev => {
      const income = crcCalculateResourceIncome(prev);
      collected = income;
      const newResources = crcAddResources(prev.resources, income);
      const newTotalCollected = crcAddResources(prev.totalCollected, income);
      return {
        ...prev,
        resources: newResources,
        totalCollected: newTotalCollected,
      };
    });
    return collected;
  };

  const crcAttractCreature = (creatureId: CreatureId): boolean => {
    let success = false;
    persist(prev => {
      if (prev.attractedCreatures.includes(creatureId)) return prev;
      const cost = crcGetCreatureCost(creatureId);
      if (!crcHasResources(prev, cost)) return prev;
      const newResources = crcSubtractResources(prev.resources, cost);
      success = true;
      return {
        ...prev,
        resources: newResources,
        attractedCreatures: [...prev.attractedCreatures, creatureId],
      };
    });
    return success;
  };

  const crcStartFestival = (festivalId: FestivalId): boolean => {
    let success = false;
    persist(prev => {
      if (prev.activeFestival !== null) return prev;
      const cost = crcGetFestivalCost(festivalId);
      if (!crcHasResources(prev, cost)) return prev;
      const newResources = crcSubtractResources(prev.resources, cost);
      success = true;
      return {
        ...prev,
        resources: newResources,
        activeFestival: festivalId,
        festivalStartTime: Date.now(),
        completedFestivals: prev.completedFestivals.includes(festivalId)
          ? prev.completedFestivals
          : [...prev.completedFestivals, festivalId],
      };
    });
    return success;
  };

  const crcEndFestival = (): void => {
    persist(prev => {
      if (prev.activeFestival === null) return prev;
      return {
        ...prev,
        activeFestival: null,
        festivalStartTime: null,
      };
    });
  };

  const crcExecuteTrade = (
    tradeCityId: TradeCityId,
    giveId: ResourceId,
    giveAmount: number,
    receiveId: ResourceId
  ): boolean => {
    let success = false;
    persist(prev => {
      if (giveId === receiveId) return prev;
      const giveCost: Resources = { ...crcEmptyResources(), [giveId]: giveAmount };
      if (!crcHasResources(prev, giveCost)) return prev;
      const receivedAmount = crcCalculateTradeAmount(tradeCityId, giveId, giveAmount, receiveId);
      if (receivedAmount <= 0) return prev;
      const newResources = crcSubtractResources(prev.resources, giveCost);
      const finalResources = crcAddResources(newResources, { [receiveId]: receivedAmount } as Partial<Resources>);
      const record: TradeRecord = {
        id: crcGenerateTradeId(),
        tradeCityId,
        given: { [giveId]: giveAmount } as Partial<Resources>,
        received: { [receiveId]: receivedAmount } as Partial<Resources>,
        timestamp: Date.now(),
      };
      success = true;
      return {
        ...prev,
        resources: finalResources,
        tradeHistory: [...prev.tradeHistory, record],
        totalTrades: prev.totalTrades + 1,
      };
    });
    return success;
  };

  const crcStartDive = (depth: DiveDepth): boolean => {
    let success = false;
    persist(prev => {
      if (!crcIsDiveAvailable(prev)) return prev;
      if (prev.currentDive !== null && !prev.currentDive.completed) return prev;
      const encounters = crcGenerateDiveEncounters(depth);
      const dive: DiveState = {
        depth,
        encounters,
        currentIndex: 0,
        rewards: crcEmptyResources(),
        startedAt: Date.now(),
        completed: false,
        totalXp: 0,
      };
      success = true;
      return {
        ...prev,
        currentDive: dive,
        diveDate: crcGetTodayString(),
        diveAvailable: false,
        pollution: Math.min(CRC_MAX_POLLUTION, prev.pollution + crcGetDivePollutionRisk(depth)),
      };
    });
    return success;
  };

  const crcAdvanceDive = (): DiveEncounter | null => {
    let encounter: DiveEncounter | null = null;
    persist(prev => {
      if (prev.currentDive === null || prev.currentDive.completed) return prev;
      const dive = prev.currentDive;
      if (dive.currentIndex >= dive.encounters.length) return prev;
      const currentEncounter = dive.encounters[dive.currentIndex];
      encounter = currentEncounter;
      let newRewards = { ...dive.rewards };
      let newXp = dive.totalXp;
      if (currentEncounter.kind === 'resource' && currentEncounter.resourceId && currentEncounter.amount) {
        newRewards = crcAddResources(newRewards, { [currentEncounter.resourceId]: currentEncounter.amount } as Partial<Resources>);
      }
      if (currentEncounter.kind === 'treasure' && currentEncounter.resourceId && currentEncounter.amount) {
        newRewards = crcAddResources(newRewards, { [currentEncounter.resourceId]: currentEncounter.amount } as Partial<Resources>);
      }
      if (currentEncounter.kind === 'discovery' && currentEncounter.xpReward) {
        newXp += currentEncounter.xpReward;
      }
      if (currentEncounter.kind === 'creature' && currentEncounter.creatureId) {
        newXp += 5;
      }
      newXp += crcGetDiveBaseXp(dive.depth);
      const newDive = {
        ...dive,
        currentIndex: dive.currentIndex + 1,
        rewards: newRewards,
        totalXp: newXp,
        completed: dive.currentIndex + 1 >= dive.encounters.length,
      };
      return { ...prev, currentDive: newDive };
    });
    return encounter;
  };

  const crcCompleteDive = (): boolean => {
    let success = false;
    persist(prev => {
      if (prev.currentDive === null) return prev;
      if (!prev.currentDive.completed) return prev;
      const dive = prev.currentDive;
      const newResources = crcAddResources(prev.resources, dive.rewards as Partial<Resources>);
      const newTotalCollected = crcAddResources(prev.totalCollected, dive.rewards as Partial<Resources>);
      const newXp = prev.mayorXp + dive.totalXp;
      const threshold = crcCalculateMayorXpThreshold(prev.mayorRank + 1);
      let newRank = prev.mayorRank;
      if (newXp >= threshold && prev.mayorRank < CRC_MAX_MAYOR_RANK) {
        newRank = prev.mayorRank + 1;
      }
      success = true;
      return {
        ...prev,
        resources: newResources,
        totalCollected: newTotalCollected,
        mayorXp: newXp,
        mayorRank: newRank,
        currentDive: null,
        totalDives: prev.totalDives + 1,
      };
    });
    return success;
  };

  const crcCleanPollution = (amount: number): boolean => {
    let success = false;
    persist(prev => {
      const cleanAmount = Math.min(amount, prev.pollution);
      if (cleanAmount <= 0) return prev;
      const cost = crcGetPollutionCleanCost(cleanAmount);
      if (!crcHasResources(prev, cost)) return prev;
      const newResources = crcSubtractResources(prev.resources, cost);
      success = true;
      return {
        ...prev,
        resources: newResources,
        pollution: Math.max(0, prev.pollution - cleanAmount),
      };
    });
    return success;
  };

  const crcAddDecoration = (districtId: DistrictId): boolean => {
    let success = false;
    persist(prev => {
      const district = prev.districts[districtId];
      if (district.level <= 0) return prev;
      const cost = crcGetDecorationCost();
      if (!crcHasResources(prev, cost)) return prev;
      const newResources = crcSubtractResources(prev.resources, cost);
      const newDistrict = { ...district, decorations: district.decorations + 1 };
      success = true;
      return {
        ...prev,
        resources: newResources,
        districts: { ...prev.districts, [districtId]: newDistrict },
      };
    });
    return success;
  };

  const crcClaimAchievement = (achievementId: AchievementId): boolean => {
    let success = false;
    persist(prev => {
      if (!crcCheckAchievement(prev, achievementId)) return prev;
      if (prev.achievementClaimed[achievementId]) return prev;
      const reward = crcGetAchievementReward(achievementId);
      const newResources = crcAddResources(prev.resources, {
        pearls: reward.pearls,
      } as Partial<Resources>);
      const newXp = prev.mayorXp + reward.xp;
      const threshold = crcCalculateMayorXpThreshold(prev.mayorRank + 1);
      let newRank = prev.mayorRank;
      if (newXp >= threshold && prev.mayorRank < CRC_MAX_MAYOR_RANK) {
        newRank = prev.mayorRank + 1;
      }
      success = true;
      return {
        ...prev,
        resources: newResources,
        mayorXp: newXp,
        mayorRank: newRank,
        achievementClaimed: { ...prev.achievementClaimed, [achievementId]: true },
      };
    });
    return success;
  };

  const crcGainMayorXp = (xp: number): void => {
    persist(prev => {
      const newXp = prev.mayorXp + xp;
      let newRank = prev.mayorRank;
      let carryXp = newXp;
      while (
        newRank < CRC_MAX_MAYOR_RANK &&
        carryXp >= crcCalculateMayorXpThreshold(newRank + 1)
      ) {
        newRank++;
      }
      return {
        ...prev,
        mayorXp: carryXp,
        mayorRank: newRank,
      };
    });
  };

  const crcRecalculateStats = (): void => {
    persist(prev => {
      const recalculated = crcRecalculateAllStats(prev);
      return { ...prev, ...recalculated };
    });
  };

  const crcResetGame = (): void => {
    const fresh = crcCreateDefaultState();
    setState(fresh);
    setPersistedAt(Date.now());
    crcSaveState(fresh);
  };

  return {
    state,
    persistedAt,
    crcUpgradeDistrict,
    crcBuildDistrict,
    crcPlaceCoral,
    crcRemoveCoral,
    crcCollectResources,
    crcAttractCreature,
    crcStartFestival,
    crcEndFestival,
    crcExecuteTrade,
    crcStartDive,
    crcAdvanceDive,
    crcCompleteDive,
    crcCleanPollution,
    crcAddDecoration,
    crcClaimAchievement,
    crcGainMayorXp,
    crcRecalculateStats,
    crcResetGame,
  };
}

export default useCoralReefCity;
