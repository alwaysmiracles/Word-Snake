'use client'

import { useState } from 'react'

// ═══════════════════════════════════════════════════════════════════
// Frost Frontier Wire (冰霜边境) — Arctic Settlement Survival
// Theme: Arctic settlement management with survival mechanics
// Color palette: Tundra white #F5F5F5, Ice blue #81D4FA, Aurora green #69F0AE,
//                Frost gray #CFD8DC, Blizzard dark #263238, Snow amber #FFB74D
// ═══════════════════════════════════════════════════════════════════

// ─── TYPE DEFINITIONS ────────────────────────────────────────────

export type FrtZoneId =
  | 'ice_harbor'
  | 'tundra_camp'
  | 'glacier_mine'
  | 'aurora_station'
  | 'frozen_forest'
  | 'polar_observatory'
  | 'snowpeak_citadel'
  | 'permafrost_lab'

export type FrtMeterId = 'warmth' | 'food' | 'water' | 'medicine' | 'morale'

export type FrtResourceId =
  | 'wood'
  | 'stone'
  | 'ice_crystal'
  | 'fur'
  | 'fish'
  | 'meat'
  | 'herb'
  | 'iron'
  | 'gold'
  | 'aurora_shard'
  | 'permafrost_core'
  | 'obsidian'

export type FrtBuildingId =
  | 'shelter'
  | 'hearth'
  | 'smokehouse'
  | 'ice_well'
  | 'herbal_hut'
  | 'trading_post'
  | 'watchtower'
  | 'aurora_array'
  | 'forge'
  | 'research_lab'

export type FrtExpeditionId =
  | 'harbor_run'
  | 'glacier_depths'
  | 'aurora_hunt'
  | 'forest_forage'
  | 'polar_trek'
  | 'citadel_climb'
  | 'lab_excavation'
  | 'tundra_patrol'

export type FrtAnimalId =
  | 'polar_bear'
  | 'arctic_fox'
  | 'snowy_owl'
  | 'caribou'
  | 'arctic_hare'
  | 'walrus'
  | 'seal'
  | 'musk_ox'
  | 'snow_leopard'
  | 'arctic_wolf'
  | 'ptarmigan'
  | 'narwhal'
  | 'beluga_whale'
  | 'ice_worm'
  | 'frost_moth'

export type FrtWeatherType =
  | 'clear'
  | 'cloudy'
  | 'light_snow'
  | 'heavy_snow'
  | 'blizzard'
  | 'aurora'
  | 'whiteout'
  | 'frost_storm'

export type FrtTraderId =
  | 'sigrid_furtrader'
  | 'ivan_blacksmith'
  | 'aya_herbwoman'
  | 'kael_aurora_merchant'
  | 'borg_ice_sculptor'
  | 'nika_permafrost_scholar'

export type FrtResearchCategoryId =
  | 'survival'
  | 'construction'
  | 'exploration'
  | 'science'
  | 'diplomacy'

export type FrtAchievementId =
  | 'frt_first_night'
  | 'frt_survivor_week'
  | 'frt_zone_unlock_four'
  | 'frt_explorer_ten'
  | 'frt_all_buildings'
  | 'frt_blizzard_endured'
  | 'frt_daily_expedition_five'
  | 'frt_animal_sanctuary'
  | 'frt_research_completed_ten'
  | 'frt_full_meters'
  | 'frt_golden_age'
  | 'frt_frontier_master'
  | 'frt_aurora_blessing'
  | 'frt_permafrost_pioneer'
  | 'frt_settlement_elder'

// ─── COLOR THEME CONSTANTS ──────────────────────────────────────

export const FRT_TUNDRA_WHITE = '#F5F5F5'
export const FRT_ICE_BLUE = '#81D4FA'
export const FRT_AURORA_GREEN = '#69F0AE'
export const FRT_FROST_GRAY = '#CFD8DC'
export const FRT_BLIZZARD_DARK = '#263238'
export const FRT_SNOW_AMBER = '#FFB74D'
export const FRT_DEEP_ICE = '#0288D1'
export const FRT_PERMAFROST = '#37474F'
export const FRT_NORTHERN_LIGHT = '#B2FF59'
export const FRT_GLACIER_CYAN = '#00E5FF'

export const FRT_ZONE_COLORS: Record<FrtZoneId, string> = {
  ice_harbor: '#0288D1',
  tundra_camp: '#8D6E63',
  glacier_mine: '#78909C',
  aurora_station: '#69F0AE',
  frozen_forest: '#2E7D32',
  polar_observatory: '#5C6BC0',
  snowpeak_citadel: '#B0BEC5',
  permafrost_lab: '#FFB74D',
}

export const FRT_METER_COLORS: Record<FrtMeterId, string> = {
  warmth: '#FF7043',
  food: '#AED581',
  water: '#4FC3F7',
  medicine: '#CE93D8',
  morale: '#FFD54F',
}

export const FRT_WEATHER_COLORS: Record<FrtWeatherType, string> = {
  clear: '#81D4FA',
  cloudy: '#B0BEC5',
  light_snow: '#E1F5FE',
  heavy_snow: '#CFD8DC',
  blizzard: '#455A64',
  aurora: '#69F0AE',
  whiteout: '#ECEFF1',
  frost_storm: '#263238',
}

export const FRT_RESOURCE_ICONS: Record<FrtResourceId, string> = {
  wood: '🪵',
  stone: '🪨',
  ice_crystal: '💎',
  fur: '🧥',
  fish: '🐟',
  meat: '🍖',
  herb: '🌿',
  iron: '⚙️',
  gold: '🪙',
  aurora_shard: '✨',
  permafrost_core: '🧊',
  obsidian: '🪨',
}

export const FRT_BUILDING_ICONS: Record<FrtBuildingId, string> = {
  shelter: '🏠',
  hearth: '🔥',
  smokehouse: '🏚️',
  ice_well: '💧',
  herbal_hut: '🌿',
  trading_post: '🏪',
  watchtower: '🗼',
  aurora_array: '🌌',
  forge: '⚒️',
  research_lab: '🔬',
}

// ─── INTERFACES ─────────────────────────────────────────────────

export interface FrtZoneDef {
  id: FrtZoneId
  name: string
  description: string
  unlockRank: number
  dangerLevel: number
  resourceYields: Partial<Record<FrtResourceId, number>>
  nativeAnimals: FrtAnimalId[]
  backgroundGradient: string
  ambientColor: string
  discoveryBonus: string
}

export interface FrtResourceDef {
  id: FrtResourceId
  name: string
  description: string
  baseValue: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  icon: string
  color: string
  stackable: boolean
  maxStack: number
}

export interface FrtBuildingDef {
  id: FrtBuildingId
  name: string
  description: string
  buildCost: Partial<Record<FrtResourceId, number>>
  buildTime: number
  warmthBonus: number
  foodBonus: number
  waterBonus: number
  medicineBonus: number
  moraleBonus: number
  maxLevel: number
  icon: string
  color: string
  requiredZone: FrtZoneId | null
}

export interface FrtExpeditionDef {
  id: FrtExpeditionId
  name: string
  description: string
  duration: number
  difficulty: number
  rewardResources: Partial<Record<FrtResourceId, number>>
  rewardXp: number
  dangerChance: number
  requiredRank: number
  requiredBuilding: FrtBuildingId | null
  icon: string
  color: string
  lootTable: string[]
}

export interface FrtAnimalDef {
  id: FrtAnimalId
  name: string
  description: string
  habitat: FrtZoneId
  encounterChance: number
  resourceDrop: FrtResourceId | null
  dropAmount: number
  xpReward: number
  danger: number
  icon: string
  color: string
  passive: boolean
  lore: string
}

export interface FrtWeatherDef {
  type: FrtWeatherType
  name: string
  description: string
  warmthModifier: number
  moraleModifier: number
  visibilityModifier: number
  dangerModifier: number
  icon: string
  color: string
  duration: [number, number]
}

export interface FrtTraderDef {
  id: FrtTraderId
  name: string
  description: string
  specialty: FrtResourceId[]
  buyMultiplier: number
  sellMultiplier: number
  stockRefreshDays: number
  icon: string
  color: string
  greeting: string
  farewell: string
}

export interface FrtResearchDef {
  id: string
  name: string
  description: string
  category: FrtResearchCategoryId
  cost: Partial<Record<FrtResourceId, number>>
  timeToComplete: number
  requiredRank: number
  prerequisiteIds: string[]
  icon: string
  color: string
  effect: string
}

export interface FrtAchievementDef {
  id: FrtAchievementId
  name: string
  description: string
  icon: string
  rewardXp: number
  hidden: boolean
}

export interface FrtDailyExpedition {
  date: string
  expeditionId: FrtExpeditionId
  bonusReward: Partial<Record<FrtResourceId, number>>
  completed: boolean
  bonusXp: number
}

export interface FrtResources {
  wood: number
  stone: number
  ice_crystal: number
  fur: number
  fish: number
  meat: number
  herb: number
  iron: number
  gold: number
  aurora_shard: number
  permafrost_core: number
  obsidian: number
}

export interface FrtMeters {
  warmth: number
  food: number
  water: number
  medicine: number
  morale: number
}

export interface FrtBuildings {
  shelter: number
  hearth: number
  smokehouse: number
  ice_well: number
  herbal_hut: number
  trading_post: number
  watchtower: number
  aurora_array: number
  forge: number
  research_lab: number
}

export interface FrtAnimalCatalog {
  discovered: string[]
  encountered: number
  catalogued: number
}

export interface FrtTraderVisit {
  traderId: FrtTraderId
  lastVisitDay: number
  reputation: number
  tradesCompleted: number
}

export interface FrtResearchProgress {
  completed: string[]
  inProgress: string | null
  progress: number
  totalSpent: number
}

export interface FrtWeatherState {
  current: FrtWeatherType
  turnsRemaining: number
  history: Array<{ type: FrtWeatherType; turns: number }>
}

export interface FrtExpeditionActive {
  expeditionId: FrtExpeditionId
  turnsRemaining: number
  teamSize: number
}

export interface FrtStats {
  totalDaysSurvived: number
  totalResourcesGathered: number
  totalBuildingsConstructed: number
  totalExpeditionsCompleted: number
  totalAnimalsEncountered: number
  totalBlizzardsSurvived: number
  totalAurorasExperienced: number
  totalTradesCompleted: number
  totalResearchCompleted: number
  highestWarmth: number
  highestMorale: number
  longestExpedition: number
  goldEarned: number
  goldSpent: number
}

export interface FrtGameState {
  explorerRank: number
  explorerXp: number
  currentZone: FrtZoneId
  meters: FrtMeters
  resources: FrtResources
  buildings: FrtBuildings
  unlockedZones: FrtZoneId[]
  weather: FrtWeatherState
  activeExpedition: FrtExpeditionActive | null
  animalCatalog: FrtAnimalCatalog
  traderVisits: FrtTraderVisit[]
  research: FrtResearchProgress
  achievements: FrtAchievementId[]
  dailyExpedition: FrtDailyExpedition | null
  stats: FrtStats
  dayCount: number
  settlementName: string
  seed: number
}

// ─── ZONE DEFINITIONS (8) ───────────────────────────────────────

export const FRT_ZONES: readonly FrtZoneDef[] = [
  {
    id: 'ice_harbor',
    name: 'Ice Harbor',
    description: 'A frozen coastal harbor where fishing vessels anchor among drifting icebergs. The salt wind carries the scent of seal and the distant echo of cracking glaciers. This is where every frontier explorer begins their journey.',
    unlockRank: 1,
    dangerLevel: 1,
    resourceYields: { fish: 5, wood: 3, stone: 2 },
    nativeAnimals: ['seal', 'walrus', 'arctic_fox', 'beluga_whale'],
    backgroundGradient: 'linear-gradient(135deg, #01579B 0%, #0288D1 40%, #4FC3F7 80%, #B3E5FC 100%)',
    ambientColor: '#4FC3F7',
    discoveryBonus: 'Access to basic fishing and harbor trade routes.',
  },
  {
    id: 'tundra_camp',
    name: 'Tundra Camp',
    description: 'An expansive windswept plain of permafrost and lichen where nomadic herders have pitched their tents for millennia. Caribou migrate through here in vast herds during the short summer months.',
    unlockRank: 1,
    dangerLevel: 2,
    resourceYields: { fur: 4, meat: 4, herb: 2, wood: 2 },
    nativeAnimals: ['caribou', 'arctic_hare', 'arctic_fox', 'musk_ox', 'ptarmigan'],
    backgroundGradient: 'linear-gradient(135deg, #4E342E 0%, #8D6E63 30%, #D7CCC8 60%, #EFEBE9 100%)',
    ambientColor: '#D7CCC8',
    discoveryBonus: 'Hunting grounds with abundant wildlife resources.',
  },
  {
    id: 'glacier_mine',
    name: 'Glacier Mine',
    description: 'A deep blue cavern carved into the side of a massive glacier. Ancient ice crystals and precious minerals are embedded in the frozen walls. Miners must beware of sudden ice collapses and flash freezes.',
    unlockRank: 5,
    dangerLevel: 4,
    resourceYields: { ice_crystal: 6, stone: 5, iron: 3, obsidian: 2 },
    nativeAnimals: ['arctic_wolf', 'snow_leopard', 'ice_worm'],
    backgroundGradient: 'linear-gradient(135deg, #263238 0%, #546E7A 30%, #90A4AE 60%, #CFD8DC 100%)',
    ambientColor: '#90A4AE',
    discoveryBonus: 'Access to rare ice crystals and mineral deposits.',
  },
  {
    id: 'aurora_station',
    name: 'Aurora Station',
    description: 'A high-altitude research outpost where the aurora borealis is visible nearly every clear night. The magnetic energy here is so strong that aurora shards crystallize directly from the air during intense displays.',
    unlockRank: 10,
    dangerLevel: 3,
    resourceYields: { aurora_shard: 5, ice_crystal: 3, gold: 2 },
    nativeAnimals: ['snowy_owl', 'frost_moth', 'ptarmigan'],
    backgroundGradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 20%, #69F0AE 50%, #B2FF59 80%, #F1F8E9 100%)',
    ambientColor: '#69F0AE',
    discoveryBonus: 'Aurora shard harvesting and magnetic energy research.',
  },
  {
    id: 'frozen_forest',
    name: 'Frozen Forest',
    description: 'An ancient taiga forest permanently locked in ice. Towering evergreens stand as crystalline monuments, their needles encased in diamond-hard frost. Hidden beneath the snow are frozen medicinal herbs of incredible potency.',
    unlockRank: 15,
    dangerLevel: 5,
    resourceYields: { wood: 7, herb: 6, fur: 3, meat: 2 },
    nativeAnimals: ['musk_ox', 'arctic_wolf', 'snow_leopard', 'arctic_hare', 'ptarmigan'],
    backgroundGradient: 'linear-gradient(135deg, #1B5E20 0%, #33691E 25%, #558B2F 50%, #8BC34A 75%, #DCEDC8 100%)',
    ambientColor: '#8BC34A',
    discoveryBonus: 'Premium wood and rare frozen medicinal herbs.',
  },
  {
    id: 'polar_observatory',
    name: 'Polar Observatory',
    description: 'A grand domed structure perched on the polar ice cap, housing the most powerful telescope array in the Arctic. From here, one can study the stars, predict weather patterns, and detect incoming storms days in advance.',
    unlockRank: 22,
    dangerLevel: 4,
    resourceYields: { permafrost_core: 4, ice_crystal: 4, aurora_shard: 2 },
    nativeAnimals: ['polar_bear', 'narwhal', 'snowy_owl', 'seal'],
    backgroundGradient: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 25%, #42A5F5 50%, #90CAF9 75%, #E3F2FD 100%)',
    ambientColor: '#42A5F5',
    discoveryBonus: 'Weather prediction and celestial navigation bonuses.',
  },
  {
    id: 'snowpeak_citadel',
    name: 'Snowpeak Citadel',
    description: 'A legendary fortress carved into the peak of the tallest mountain in the frontier. Its walls are said to be impervious to any blizzard. Only the most hardened explorers dare to make the treacherous ascent to this ancient stronghold.',
    unlockRank: 32,
    dangerLevel: 7,
    resourceYields: { obsidian: 5, iron: 4, gold: 3, stone: 4 },
    nativeAnimals: ['polar_bear', 'snow_leopard', 'arctic_wolf', 'frost_moth'],
    backgroundGradient: 'linear-gradient(135deg, #263238 0%, #37474F 25%, #78909C 50%, #B0BEC5 75%, #ECEFF1 100%)',
    ambientColor: '#B0BEC5',
    discoveryBonus: 'Legendary obsidian deposits and fortress blueprints.',
  },
  {
    id: 'permafrost_lab',
    name: 'Permafrost Lab',
    description: 'A state-of-the-art underground research facility built into the permafrost. Scientists here study ancient organisms preserved in the ice, extract powerful compounds from permafrost cores, and develop cutting-edge survival technologies.',
    unlockRank: 40,
    dangerLevel: 6,
    resourceYields: { permafrost_core: 7, herb: 3, aurora_shard: 2, ice_crystal: 2 },
    nativeAnimals: ['ice_worm', 'frost_moth', 'arctic_hare'],
    backgroundGradient: 'linear-gradient(135deg, #E65100 0%, #F57C00 25%, #FFB74D 50%, #FFE0B2 75%, #FFF3E0 100%)',
    ambientColor: '#FFB74D',
    discoveryBonus: 'Advanced permafrost research and bio-material extraction.',
  },
]

// ─── RESOURCE DEFINITIONS (12) ──────────────────────────────────

export const FRT_RESOURCES: readonly FrtResourceDef[] = [
  {
    id: 'wood', name: 'Arctic Timber', description: 'Dense wood from frozen evergreen trees, essential for construction and warmth.',
    baseValue: 2, rarity: 'common', icon: '🪵', color: '#795548', stackable: true, maxStack: 500,
  },
  {
    id: 'stone', name: 'Glacier Stone', description: 'Smooth stones polished by ancient glaciers, used for building foundations.',
    baseValue: 3, rarity: 'common', icon: '🪨', color: '#78909C', stackable: true, maxStack: 500,
  },
  {
    id: 'ice_crystal', name: 'Ice Crystal', description: 'Crystallized ice with magical properties, used in advanced construction and research.',
    baseValue: 8, rarity: 'uncommon', icon: '💎', color: '#81D4FA', stackable: true, maxStack: 200,
  },
  {
    id: 'fur', name: 'Arctic Fur', description: 'Thick pelts from arctic animals, critical for warmth and trading.',
    baseValue: 5, rarity: 'common', icon: '🧥', color: '#8D6E63', stackable: true, maxStack: 300,
  },
  {
    id: 'fish', name: 'Arctic Fish', description: 'Fresh fish caught through ice holes, a staple food source.',
    baseValue: 3, rarity: 'common', icon: '🐟', color: '#4FC3F7', stackable: true, maxStack: 400,
  },
  {
    id: 'meat', name: 'Game Meat', description: 'Dried and smoked meat from hunted arctic animals, a high-energy food.',
    baseValue: 4, rarity: 'common', icon: '🍖', color: '#A1887F', stackable: true, maxStack: 300,
  },
  {
    id: 'herb', name: 'Frozen Herb', description: 'Medicinal plants preserved in ice with potent healing properties.',
    baseValue: 7, rarity: 'uncommon', icon: '🌿', color: '#66BB6A', stackable: true, maxStack: 200,
  },
  {
    id: 'iron', name: 'Arctic Iron', description: 'Cold-forged iron extracted from glacial deposits, used for tools and weapons.',
    baseValue: 10, rarity: 'rare', icon: '⚙️', color: '#78909C', stackable: true, maxStack: 150,
  },
  {
    id: 'gold', name: 'Permafrost Gold', description: 'Rare gold nuggets found in permafrost layers, the universal trading currency.',
    baseValue: 20, rarity: 'rare', icon: '🪙', color: '#FFD54F', stackable: true, maxStack: 100,
  },
  {
    id: 'aurora_shard', name: 'Aurora Shard', description: 'Crystallized aurora energy that glows with shifting colors. Extremely valuable for research.',
    baseValue: 25, rarity: 'epic', icon: '✨', color: '#69F0AE', stackable: true, maxStack: 50,
  },
  {
    id: 'permafrost_core', name: 'Permafrost Core', description: 'Ancient organic cores extracted from deep permafrost, containing primordial energy.',
    baseValue: 35, rarity: 'epic', icon: '🧊', color: '#FFB74D', stackable: true, maxStack: 30,
  },
  {
    id: 'obsidian', name: 'Arctic Obsidian', description: 'Volcanic glass found beneath glacial formations, the hardest material in the frontier.',
    baseValue: 40, rarity: 'legendary', icon: '🪨', color: '#37474F', stackable: true, maxStack: 20,
  },
]

// ─── BUILDING DEFINITIONS (10) ──────────────────────────────────

export const FRT_BUILDINGS: readonly FrtBuildingDef[] = [
  {
    id: 'shelter', name: 'Frozen Shelter', description: 'A sturdy shelter built from timber and stone, providing essential protection from the elements.',
    buildCost: { wood: 15, stone: 10 }, buildTime: 2,
    warmthBonus: 10, foodBonus: 0, waterBonus: 0, medicineBonus: 0, moraleBonus: 5,
    maxLevel: 5, icon: '🏠', color: '#8D6E63', requiredZone: null,
  },
  {
    id: 'hearth', name: 'Central Hearth', description: 'A massive stone hearth that warms the entire settlement and serves as a gathering point.',
    buildCost: { stone: 20, wood: 10, iron: 5 }, buildTime: 3,
    warmthBonus: 20, foodBonus: 5, waterBonus: 0, medicineBonus: 0, moraleBonus: 10,
    maxLevel: 5, icon: '🔥', color: '#FF7043', requiredZone: null,
  },
  {
    id: 'smokehouse', name: 'Smokehouse', description: 'A smokehouse for preserving fish and meat, extending food supplies through the harshest winters.',
    buildCost: { wood: 20, stone: 5, fur: 5 }, buildTime: 2,
    warmthBonus: 0, foodBonus: 15, waterBonus: 0, medicineBonus: 0, moraleBonus: 3,
    maxLevel: 4, icon: '🏚️', color: '#A1887F', requiredZone: null,
  },
  {
    id: 'ice_well', name: 'Ice Well', description: 'A deep well drilled through the permafrost to reach pure meltwater reserves below the ice layer.',
    buildCost: { stone: 15, iron: 10, ice_crystal: 5 }, buildTime: 4,
    warmthBonus: 0, foodBonus: 0, waterBonus: 20, medicineBonus: 0, moraleBonus: 2,
    maxLevel: 4, icon: '💧', color: '#4FC3F7', requiredZone: 'ice_harbor',
  },
  {
    id: 'herbal_hut', name: 'Herbalist Hut', description: 'A specialized workshop where frozen herbs are processed into medicines and remedies.',
    buildCost: { wood: 10, herb: 10, stone: 5 }, buildTime: 3,
    warmthBonus: 2, foodBonus: 0, waterBonus: 0, medicineBonus: 18, moraleBonus: 5,
    maxLevel: 5, icon: '🌿', color: '#66BB6A', requiredZone: 'frozen_forest',
  },
  {
    id: 'trading_post', name: 'Trading Post', description: 'A well-stocked trading post that attracts traveling merchants and enables resource exchange.',
    buildCost: { wood: 25, stone: 15, gold: 10 }, buildTime: 5,
    warmthBonus: 5, foodBonus: 5, waterBonus: 5, medicineBonus: 5, moraleBonus: 15,
    maxLevel: 3, icon: '🏪', color: '#FFB74D', requiredZone: null,
  },
  {
    id: 'watchtower', name: 'Watchtower', description: 'A tall observation tower that provides early warning of incoming blizzards and animal threats.',
    buildCost: { wood: 20, stone: 20, iron: 10 }, buildTime: 4,
    warmthBonus: 0, foodBonus: 0, waterBonus: 0, medicineBonus: 0, moraleBonus: 10,
    maxLevel: 3, icon: '🗼', color: '#78909C', requiredZone: null,
  },
  {
    id: 'aurora_array', name: 'Aurora Array', description: 'An array of crystal antennae that capture aurora energy, providing warmth and morale during dark periods.',
    buildCost: { ice_crystal: 15, aurora_shard: 10, iron: 15 }, buildTime: 8,
    warmthBonus: 15, foodBonus: 0, waterBonus: 0, medicineBonus: 5, moraleBonus: 25,
    maxLevel: 3, icon: '🌌', color: '#69F0AE', requiredZone: 'aurora_station',
  },
  {
    id: 'forge', name: 'Arctic Forge', description: 'A forge that burns hot enough to smelt arctic iron and work obsidian into tools and weapons.',
    buildCost: { stone: 30, iron: 20, obsidian: 5 }, buildTime: 6,
    warmthBonus: 5, foodBonus: 0, waterBonus: 0, medicineBonus: 0, moraleBonus: 5,
    maxLevel: 4, icon: '⚒️', color: '#546E7A', requiredZone: 'glacier_mine',
  },
  {
    id: 'research_lab', name: 'Research Laboratory', description: 'An advanced laboratory for studying permafrost samples, developing new technologies, and unlocking frontier secrets.',
    buildCost: { stone: 25, iron: 15, ice_crystal: 10, gold: 15 }, buildTime: 10,
    warmthBonus: 5, foodBonus: 0, waterBonus: 0, medicineBonus: 10, moraleBonus: 15,
    maxLevel: 3, icon: '🔬', color: '#FFB74D', requiredZone: 'permafrost_lab',
  },
]

// ─── EXPEDITION DEFINITIONS (8) ─────────────────────────────────

export const FRT_EXPEDITIONS: readonly FrtExpeditionDef[] = [
  {
    id: 'harbor_run', name: 'Harbor Supply Run', description: 'A routine supply run to the Ice Harbor to gather fish and trading goods from the frozen docks.',
    duration: 3, difficulty: 1, rewardResources: { fish: 10, gold: 5 }, rewardXp: 15,
    dangerChance: 0.1, requiredRank: 1, requiredBuilding: null,
    icon: '⚓', color: '#0288D1', lootTable: ['fish', 'gold', 'wood'],
  },
  {
    id: 'glacier_depths', name: 'Glacier Deep Mining', description: 'Descend into the deep crystal caves of the glacier to extract valuable ice crystals and iron ore.',
    duration: 5, difficulty: 3, rewardResources: { ice_crystal: 8, iron: 5, stone: 5 }, rewardXp: 30,
    dangerChance: 0.25, requiredRank: 5, requiredBuilding: 'forge',
    icon: '⛏️', color: '#78909C', lootTable: ['ice_crystal', 'iron', 'stone', 'obsidian'],
  },
  {
    id: 'aurora_hunt', name: 'Aurora Shard Hunt', description: 'Venture to the aurora fields during a display to capture crystallized aurora energy shards.',
    duration: 4, difficulty: 2, rewardResources: { aurora_shard: 3, ice_crystal: 5 }, rewardXp: 25,
    dangerChance: 0.15, requiredRank: 10, requiredBuilding: 'aurora_array',
    icon: '🌌', color: '#69F0AE', lootTable: ['aurora_shard', 'ice_crystal', 'permafrost_core'],
  },
  {
    id: 'forest_forage', name: 'Frozen Forest Forage', description: 'Navigate the ice-locked taiga to gather rare herbs and premium timber from ancient trees.',
    duration: 4, difficulty: 4, rewardResources: { herb: 8, wood: 10, fur: 5 }, rewardXp: 35,
    dangerChance: 0.3, requiredRank: 15, requiredBuilding: 'herbal_hut',
    icon: '🌲', color: '#2E7D32', lootTable: ['herb', 'wood', 'fur', 'meat'],
  },
  {
    id: 'polar_trek', name: 'Polar Ice Cap Trek', description: 'A grueling trek across the polar ice cap to reach the observatory and study the stars.',
    duration: 7, difficulty: 5, rewardResources: { permafrost_core: 4, aurora_shard: 2, gold: 8 }, rewardXp: 50,
    dangerChance: 0.35, requiredRank: 22, requiredBuilding: 'watchtower',
    icon: '🧭', color: '#1565C0', lootTable: ['permafrost_core', 'aurora_shard', 'gold'],
  },
  {
    id: 'citadel_climb', name: 'Citadel Ascent', description: 'Scale the treacherous slopes to the Snowpeak Citadel, braving ice storms and avalanches.',
    duration: 8, difficulty: 7, rewardResources: { obsidian: 5, iron: 8, gold: 10 }, rewardXp: 75,
    dangerChance: 0.45, requiredRank: 32, requiredBuilding: 'watchtower',
    icon: '🏔️', color: '#B0BEC5', lootTable: ['obsidian', 'iron', 'gold', 'permafrost_core'],
  },
  {
    id: 'lab_excavation', name: 'Lab Permafrost Dig', description: 'Excavate deep permafrost layers around the laboratory to extract ancient cores and biological samples.',
    duration: 6, difficulty: 6, rewardResources: { permafrost_core: 6, herb: 5, ice_crystal: 5 }, rewardXp: 60,
    dangerChance: 0.3, requiredRank: 40, requiredBuilding: 'research_lab',
    icon: '🧪', color: '#FFB74D', lootTable: ['permafrost_core', 'herb', 'ice_crystal', 'aurora_shard'],
  },
  {
    id: 'tundra_patrol', name: 'Tundra Wildlife Patrol', description: 'Patrol the vast tundra to catalog wildlife, gather furs, and ensure the safety of migration routes.',
    duration: 3, difficulty: 2, rewardResources: { fur: 8, meat: 8, herb: 3 }, rewardXp: 20,
    dangerChance: 0.2, requiredRank: 1, requiredBuilding: null,
    icon: '🐾', color: '#8D6E63', lootTable: ['fur', 'meat', 'herb'],
  },
]

// ─── ANIMAL DEFINITIONS (15) ────────────────────────────────────

export const FRT_ANIMALS: readonly FrtAnimalDef[] = [
  {
    id: 'polar_bear', name: 'Polar Bear', description: 'The undisputed king of the Arctic, a massive white predator that commands respect across the frozen wastes.',
    habitat: 'polar_observatory', encounterChance: 0.15, resourceDrop: 'fur', dropAmount: 8,
    xpReward: 40, danger: 9, icon: '🐻‍❄️', color: '#F5F5F5', passive: false,
    lore: 'Polar bears have roamed the Arctic ice for over 200,000 years. They can smell a seal from twenty miles away.',
  },
  {
    id: 'arctic_fox', name: 'Arctic Fox', description: 'A cunning white fox that changes its coat with the seasons. Known for its intelligence and adaptability.',
    habitat: 'ice_harbor', encounterChance: 0.25, resourceDrop: 'fur', dropAmount: 3,
    xpReward: 10, danger: 1, icon: '🦊', color: '#F5F5F5', passive: true,
    lore: 'Arctic foxes can survive temperatures as low as -70°C. Their fur is the warmest of any mammal.',
  },
  {
    id: 'snowy_owl', name: 'Snowy Owl', description: 'A magnificent white owl with piercing yellow eyes. It hunts silently across the tundra by day and night.',
    habitat: 'aurora_station', encounterChance: 0.2, resourceDrop: 'fur', dropAmount: 2,
    xpReward: 12, danger: 1, icon: '🦉', color: '#F5F5F5', passive: true,
    lore: 'Unlike most owls, the snowy owl hunts during the day. Males become whiter with age.',
  },
  {
    id: 'caribou', name: 'Caribou', description: 'Large herds of caribou migrate across the tundra, providing essential food and materials for survival.',
    habitat: 'tundra_camp', encounterChance: 0.3, resourceDrop: 'meat', dropAmount: 6,
    xpReward: 15, danger: 2, icon: '🦌', color: '#8D6E63', passive: true,
    lore: 'Caribou are the only deer species where both males and females grow antlers. They migrate up to 3,000 miles annually.',
  },
  {
    id: 'arctic_hare', name: 'Arctic Hare', description: 'A small white hare with powerful hind legs that can leap incredible distances across the snow.',
    habitat: 'tundra_camp', encounterChance: 0.35, resourceDrop: 'meat', dropAmount: 2,
    xpReward: 5, danger: 0, icon: '🐰', color: '#F5F5F5', passive: true,
    lore: 'Arctic hares can run at speeds up to 40 mph. In winter, their fur turns pure white for camouflage.',
  },
  {
    id: 'walrus', name: 'Walrus', description: 'A massive tusked marine mammal that hauls out onto ice floes. Valued for ivory, blubber, and thick hide.',
    habitat: 'ice_harbor', encounterChance: 0.15, resourceDrop: 'fur', dropAmount: 6,
    xpReward: 25, danger: 5, icon: '🦭', color: '#A1887F', passive: false,
    lore: 'Walrus tusks can grow up to three feet long. They use them to haul themselves out of the water onto ice.',
  },
  {
    id: 'seal', name: 'Ringed Seal', description: 'The most common seal in the Arctic, identified by the ring-like patterns on its fur. A crucial food source.',
    habitat: 'ice_harbor', encounterChance: 0.3, resourceDrop: 'fish', dropAmount: 5,
    xpReward: 10, danger: 2, icon: '🦭', color: '#78909C', passive: true,
    lore: 'Ringed seals can stay underwater for up to 45 minutes. They create breathing holes in the ice with their claws.',
  },
  {
    id: 'musk_ox', name: 'Musk Ox', description: 'A prehistoric-looking bovine with a thick shaggy coat and curved horns. Charges when threatened.',
    habitat: 'frozen_forest', encounterChance: 0.2, resourceDrop: 'fur', dropAmount: 7,
    xpReward: 20, danger: 4, icon: '🐂', color: '#5D4037', passive: false,
    lore: 'Musk oxen have survived multiple ice ages. Their wool, qiviut, is eight times warmer than sheep wool.',
  },
  {
    id: 'snow_leopard', name: 'Snow Leopard', description: 'A rare and elusive predator that haunts the highest frozen peaks. Known as the ghost of the mountains.',
    habitat: 'snowpeak_citadel', encounterChance: 0.1, resourceDrop: 'fur', dropAmount: 10,
    xpReward: 50, danger: 8, icon: '🐆', color: '#B0BEC5', passive: false,
    lore: 'Snow leopards can leap up to 50 feet in a single bound. Their tails are nearly as long as their bodies.',
  },
  {
    id: 'arctic_wolf', name: 'Arctic Wolf', description: 'A white-furred wolf that hunts in coordinated packs across the frozen landscape. Intelligent and relentless.',
    habitat: 'glacier_mine', encounterChance: 0.2, resourceDrop: 'fur', dropAmount: 5,
    xpReward: 25, danger: 6, icon: '🐺', color: '#F5F5F5', passive: false,
    lore: 'Arctic wolves can withstand sub-zero temperatures for months. A pack can bring down a musk ox ten times their size.',
  },
  {
    id: 'ptarmigan', name: 'Rock Ptarmigan', description: 'A small bird that molts from brown to white with the seasons. Feathers provide excellent insulation.',
    habitat: 'tundra_camp', encounterChance: 0.3, resourceDrop: 'meat', dropAmount: 1,
    xpReward: 3, danger: 0, icon: '🐦', color: '#F5F5F5', passive: true,
    lore: 'Ptarmigan feathers are so insulating that birds can burrow into snow and survive temperatures of -40°C.',
  },
  {
    id: 'narwhal', name: 'Narwhal', description: 'The legendary unicorn of the sea, identified by its long spiral tusk. Found in deep Arctic waters.',
    habitat: 'polar_observatory', encounterChance: 0.08, resourceDrop: 'gold', dropAmount: 5,
    xpReward: 60, danger: 3, icon: '🐋', color: '#78909C', passive: true,
    lore: 'The narwhal tusk is actually an elongated tooth with millions of nerve endings, used to sense environmental changes.',
  },
  {
    id: 'beluga_whale', name: 'Beluga Whale', description: 'The white whale of the Arctic, known for its complex vocalizations and friendly disposition.',
    habitat: 'ice_harbor', encounterChance: 0.1, resourceDrop: 'fish', dropAmount: 10,
    xpReward: 20, danger: 2, icon: '🐳', color: '#F5F5F5', passive: true,
    lore: 'Beluga whales are called the canaries of the sea due to their extensive repertoire of clicks and whistles.',
  },
  {
    id: 'ice_worm', name: 'Ice Worm', description: 'A bizarre translucent worm that thrives in glacial ice, discovered only by the most dedicated researchers.',
    habitat: 'permafrost_lab', encounterChance: 0.15, resourceDrop: 'herb', dropAmount: 4,
    xpReward: 15, danger: 0, icon: '🪱', color: '#B3E5FC', passive: true,
    lore: 'Ice worms were thought to be a myth until 1887. They secrete antifreeze proteins that prevent their cells from freezing.',
  },
  {
    id: 'frost_moth', name: 'Frost Moth', description: 'A large moth with crystalline wings that refract aurora light into dazzling patterns. Found near aurora displays.',
    habitat: 'aurora_station', encounterChance: 0.12, resourceDrop: 'aurora_shard', dropAmount: 2,
    xpReward: 20, danger: 0, icon: '🦋', color: '#B2FF59', passive: true,
    lore: 'Frost moths are drawn to aurora displays and absorb their energy. Their wings are made of living ice crystals.',
  },
]

// ─── WEATHER DEFINITIONS (8) ────────────────────────────────────

export const FRT_WEATHER_TYPES: readonly FrtWeatherDef[] = [
  {
    type: 'clear', name: 'Clear Arctic Sky', description: 'The sky is a brilliant dome of stars with a crisp, cold clarity. Perfect conditions for expeditions.',
    warmthModifier: 0, moraleModifier: 5, visibilityModifier: 10, dangerModifier: 0,
    icon: '☀️', color: '#81D4FA', duration: [3, 6],
  },
  {
    type: 'cloudy', name: 'Overcast Cloud Cover', description: 'A thick layer of clouds blankets the sky, trapping a thin layer of warmth but blocking the stars.',
    warmthModifier: 2, moraleModifier: 0, visibilityModifier: -3, dangerModifier: 0,
    icon: '☁️', color: '#B0BEC5', duration: [2, 5],
  },
  {
    type: 'light_snow', name: 'Light Snowfall', description: 'Gentle snowflakes drift down from the clouds, covering the landscape in a fresh white blanket.',
    warmthModifier: -1, moraleModifier: 2, visibilityModifier: -2, dangerModifier: 1,
    icon: '🌨️', color: '#E1F5FE', duration: [2, 4],
  },
  {
    type: 'heavy_snow', name: 'Heavy Snowfall', description: 'Thick snow falls rapidly, accumulating quickly and making travel increasingly difficult.',
    warmthModifier: -3, moraleModifier: -3, visibilityModifier: -6, dangerModifier: 3,
    icon: '❄️', color: '#CFD8DC', duration: [2, 5],
  },
  {
    type: 'blizzard', name: 'Blizzard', description: 'A violent blizzard with howling winds and blinding snow. Extremely dangerous conditions that drain warmth rapidly.',
    warmthModifier: -10, moraleModifier: -8, visibilityModifier: -10, dangerModifier: 8,
    icon: '🌬️', color: '#455A64', duration: [2, 4],
  },
  {
    type: 'aurora', name: 'Aurora Borealis', description: 'The sky comes alive with dancing curtains of green, purple, and blue light. A breathtaking and morale-boosting spectacle.',
    warmthModifier: 3, moraleModifier: 15, visibilityModifier: 5, dangerModifier: 0,
    icon: '🌌', color: '#69F0AE', duration: [2, 4],
  },
  {
    type: 'whiteout', name: 'Whiteout Conditions', description: 'Complete whiteout with zero visibility. The ground and sky merge into an indistinguishable white void.',
    warmthModifier: -5, moraleModifier: -5, visibilityModifier: -10, dangerModifier: 5,
    icon: '⬜', color: '#ECEFF1', duration: [1, 3],
  },
  {
    type: 'frost_storm', name: 'Frost Storm', description: 'A rare and catastrophic storm of ice crystals and freezing rain that damages everything it touches.',
    warmthModifier: -15, moraleModifier: -12, visibilityModifier: -8, dangerModifier: 12,
    icon: '🌀', color: '#263238', duration: [1, 3],
  },
]

// ─── TRADER DEFINITIONS (6) ─────────────────────────────────────

export const FRT_TRADERS: readonly FrtTraderDef[] = [
  {
    id: 'sigrid_furtrader', name: 'Sigrid the Fur Trader', description: 'A seasoned Sami trader who travels the frontier exchanging quality furs and leathers.',
    specialty: ['fur', 'meat', 'herb'], buyMultiplier: 1.2, sellMultiplier: 0.8,
    stockRefreshDays: 5, icon: '🧥', color: '#8D6E63',
    greeting: 'Welcome, traveler! I have the finest furs in all the frontier. Warmth is life here.',
    farewell: 'Stay warm out there. The tundra shows no mercy to the unprepared.',
  },
  {
    id: 'ivan_blacksmith', name: 'Ivan the Blacksmith', description: 'A grizzled blacksmith from the northern mountains who works iron and obsidian into tools and weapons.',
    specialty: ['iron', 'stone', 'obsidian'], buyMultiplier: 1.3, sellMultiplier: 0.7,
    stockRefreshDays: 7, icon: '⚒️', color: '#546E7A',
    greeting: 'Need something forged? My fires burn hotter than any blizzard. What can I make for you?',
    farewell: 'May your steel stay sharp and your fire never die, friend.',
  },
  {
    id: 'aya_herbwoman', name: 'Aya the Herb Woman', description: 'An indigenous elder with deep knowledge of Arctic medicinal plants and natural remedies.',
    specialty: ['herb', 'fish', 'meat'], buyMultiplier: 1.1, sellMultiplier: 0.85,
    stockRefreshDays: 4, icon: '🌿', color: '#66BB6A',
    greeting: 'The land provides everything we need if we know where to look. Come, let me share its gifts.',
    farewell: 'Listen to the wind. It carries wisdom if you are patient enough to hear it.',
  },
  {
    id: 'kael_aurora_merchant', name: 'Kael the Aurora Merchant', description: 'A mysterious merchant who appears during aurora displays, selling rare crystalline goods.',
    specialty: ['aurora_shard', 'ice_crystal', 'gold'], buyMultiplier: 1.5, sellMultiplier: 0.6,
    stockRefreshDays: 10, icon: '✨', color: '#69F0AE',
    greeting: 'Ah, the lights brought you to me. I deal in things that most consider impossible.',
    farewell: 'Until the next aurora, my friend. The lights always return.',
  },
  {
    id: 'borg_ice_sculptor', name: 'Borg the Ice Sculptor', description: 'A master artisan who transforms ice crystals and stone into beautiful sculptures and functional items.',
    specialty: ['ice_crystal', 'stone', 'wood'], buyMultiplier: 1.15, sellMultiplier: 0.75,
    stockRefreshDays: 6, icon: '🎨', color: '#81D4FA',
    greeting: 'Beauty persists even in the harshest cold. Let me show you what ice can become.',
    farewell: 'Carve your own path through the ice. That is the truest art.',
  },
  {
    id: 'nika_permafrost_scholar', name: 'Nika the Permafrost Scholar', description: 'A brilliant scientist studying ancient organisms preserved in permafrost layers.',
    specialty: ['permafrost_core', 'aurora_shard', 'ice_crystal'], buyMultiplier: 1.4, sellMultiplier: 0.65,
    stockRefreshDays: 8, icon: '📚', color: '#FFB74D',
    greeting: 'The permafrost holds secrets from before the ice age. Each core is a window into deep time.',
    farewell: 'Knowledge is the warmest fire. Keep seeking the truth buried in the ice.',
  },
]

// ─── RESEARCH DEFINITIONS (20) ──────────────────────────────────

export const FRT_RESEARCH_ITEMS: readonly FrtResearchDef[] = [
  {
    id: 'frt_res_basic_survival', name: 'Basic Arctic Survival', description: 'Learn the fundamentals of surviving in extreme cold conditions.',
    category: 'survival', cost: { wood: 5, herb: 3 }, timeToComplete: 3, requiredRank: 1,
    prerequisiteIds: [], icon: '📖', color: '#81D4FA', effect: 'Reduces warmth drain by 10%.',
  },
  {
    id: 'frt_res_advanced_shelter', name: 'Advanced Shelter Design', description: 'Improved insulation techniques using layered fur and ice crystal mortar.',
    category: 'construction', cost: { wood: 10, fur: 8, stone: 5 }, timeToComplete: 5, requiredRank: 3,
    prerequisiteIds: ['frt_res_basic_survival'], icon: '🏠', color: '#8D6E63', effect: 'Shelter warmth bonus increased by 25%.',
  },
  {
    id: 'frt_res_permafrost_agriculture', name: 'Permafrost Agriculture', description: 'Grow nutrient-rich mosses and lichens in heated permafrost soil beds.',
    category: 'survival', cost: { herb: 10, wood: 8, stone: 5 }, timeToComplete: 6, requiredRank: 5,
    prerequisiteIds: ['frt_res_basic_survival'], icon: '🌱', color: '#66BB6A', effect: 'Food generation increased by 15%.',
  },
  {
    id: 'frt_res_ice_fishing_tech', name: 'Ice Fishing Technology', description: 'Advanced ice fishing methods with heated lines and sonar fish detection.',
    category: 'exploration', cost: { wood: 8, iron: 5, fish: 10 }, timeToComplete: 4, requiredRank: 3,
    prerequisiteIds: [], icon: '🎣', color: '#4FC3F7', effect: 'Fish yield from expeditions increased by 30%.',
  },
  {
    id: 'frt_res_crystal_resonance', name: 'Crystal Resonance', description: 'Harness the resonant frequencies of ice crystals to generate gentle warmth.',
    category: 'science', cost: { ice_crystal: 10, iron: 5 }, timeToComplete: 8, requiredRank: 8,
    prerequisiteIds: [], icon: '💎', color: '#81D4FA', effect: 'Ice crystals now provide +2 warmth per 10 in storage.',
  },
  {
    id: 'frt_res_tundra_navigation', name: 'Tundra Navigation', description: 'Master the art of navigating featureless tundra using wind patterns and star positions.',
    category: 'exploration', cost: { wood: 5, stone: 3 }, timeToComplete: 4, requiredRank: 2,
    prerequisiteIds: [], icon: '🧭', color: '#FFB74D', effect: 'Expedition duration reduced by 10%.',
  },
  {
    id: 'frt_res_animal_husbandry', name: 'Arctic Animal Husbandry', description: 'Techniques for domesticating and breeding arctic animals for sustainable resources.',
    category: 'survival', cost: { fur: 15, meat: 10, herb: 8 }, timeToComplete: 7, requiredRank: 6,
    prerequisiteIds: ['frt_res_basic_survival'], icon: '🐾', color: '#A1887F', effect: 'Animal encounter rewards increased by 20%.',
  },
  {
    id: 'frt_res_obsidian_tools', name: 'Obsidian Tool Crafting', description: 'Learn to work the legendary arctic obsidian into tools of unmatched sharpness and durability.',
    category: 'construction', cost: { obsidian: 8, iron: 10, stone: 10 }, timeToComplete: 8, requiredRank: 12,
    prerequisiteIds: ['frt_res_advanced_shelter'], icon: '🔧', color: '#37474F', effect: 'Building cost reduced by 15%.',
  },
  {
    id: 'frt_res_weather_prediction', name: 'Weather Prediction', description: 'Read subtle atmospheric signs to predict weather changes 24 hours in advance.',
    category: 'science', cost: { aurora_shard: 3, ice_crystal: 5 }, timeToComplete: 10, requiredRank: 10,
    prerequisiteIds: [], icon: '🌡️', color: '#78909C', effect: 'Blizzard damage reduced by 30%.',
  },
  {
    id: 'frt_res_aurora_energy', name: 'Aurora Energy Harvesting', description: 'Capture and store aurora energy for use in heating and power generation.',
    category: 'science', cost: { aurora_shard: 15, ice_crystal: 10, iron: 10 }, timeToComplete: 12, requiredRank: 15,
    prerequisiteIds: ['frt_res_crystal_resonance'], icon: '⚡', color: '#69F0AE', effect: 'Aurora weather gives double morale bonus.',
  },
  {
    id: 'frt_res_diplomatic_relations', name: 'Frontier Diplomacy', description: 'Establish formal relations with the NPC traders, improving trade conditions.',
    category: 'diplomacy', cost: { gold: 15, fur: 10 }, timeToComplete: 6, requiredRank: 4,
    prerequisiteIds: [], icon: '🤝', color: '#FFB74D', effect: 'Trader prices improved by 15%.',
  },
  {
    id: 'frt_res_herbal_medicine', name: 'Advanced Herbal Medicine', description: 'Develop potent medicines from rare frozen herbs that boost survival meters.',
    category: 'survival', cost: { herb: 20, ice_crystal: 8, permafrost_core: 2 }, timeToComplete: 10, requiredRank: 14,
    prerequisiteIds: ['frt_res_basic_survival'], icon: '💊', color: '#CE93D8', effect: 'Medicine meter regenerates 2 per day.',
  },
  {
    id: 'frt_res_deep_ice_mining', name: 'Deep Ice Mining', description: 'Advanced mining techniques for extracting resources from deep glacial formations.',
    category: 'exploration', cost: { iron: 15, stone: 20, obsidian: 5 }, timeToComplete: 9, requiredRank: 10,
    prerequisiteIds: ['frt_res_tundra_navigation'], icon: '⛏️', color: '#546E7A', effect: 'Mining expedition yields increased by 25%.',
  },
  {
    id: 'frt_res_frontier_defense', name: 'Frontier Defense Systems', description: 'Build defensive structures and warning systems to protect against Arctic threats.',
    category: 'construction', cost: { iron: 20, stone: 20, obsidian: 8 }, timeToComplete: 10, requiredRank: 18,
    prerequisiteIds: ['frt_res_obsidian_tools'], icon: '🛡️', color: '#F44336', effect: 'Danger from weather reduced by 40%.',
  },
  {
    id: 'frt_res_permafrost_extraction', name: 'Permafrost Core Extraction', description: 'Develop efficient methods for extracting and preserving permafrost cores.',
    category: 'science', cost: { permafrost_core: 5, iron: 15, ice_crystal: 10 }, timeToComplete: 12, requiredRank: 20,
    prerequisiteIds: ['frt_res_weather_prediction'], icon: '🧪', color: '#FFB74D', effect: 'Permafrost core expedition yields doubled.',
  },
  {
    id: 'frt_res_expedition_logistics', name: 'Expedition Logistics', description: 'Optimize supply chains and planning for long-range expeditions.',
    category: 'exploration', cost: { wood: 15, gold: 10, fur: 10 }, timeToComplete: 7, requiredRank: 8,
    prerequisiteIds: ['frt_res_tundra_navigation'], icon: '🗺️', color: '#0288D1', effect: 'All expedition rewards increased by 15%.',
  },
  {
    id: 'frt_res_thermal_engineering', name: 'Thermal Engineering', description: 'Master the manipulation of heat in extreme cold to create sustainable warmth systems.',
    category: 'science', cost: { iron: 20, aurora_shard: 8, obsidian: 5 }, timeToComplete: 14, requiredRank: 25,
    prerequisiteIds: ['frt_res_aurora_energy', 'frt_res_crystal_resonance'], icon: '🔥', color: '#FF7043', effect: 'All buildings warmth bonus increased by 50%.',
  },
  {
    id: 'frt_res_spiritual_wisdom', name: 'Arctic Spiritual Wisdom', description: 'Learn the ancient spiritual traditions of the Arctic peoples for inner resilience.',
    category: 'diplomacy', cost: { aurora_shard: 10, herb: 15, gold: 10 }, timeToComplete: 8, requiredRank: 16,
    prerequisiteIds: ['frt_res_diplomatic_relations'], icon: '🕯️', color: '#FFD54F', effect: 'Morale meter regenerates 3 per day.',
  },
  {
    id: 'frt_res_frontier_unification', name: 'Frontier Unification', description: 'Unite all frontier settlements under a cooperative alliance for mutual benefit.',
    category: 'diplomacy', cost: { gold: 30, aurora_shard: 15, permafrost_core: 5 }, timeToComplete: 15, requiredRank: 30,
    prerequisiteIds: ['frt_res_diplomatic_relations', 'frt_res_spiritual_wisdom'], icon: '🏰', color: '#7C4DFF', effect: 'All resource generation increased by 25%.',
  },
  {
    id: 'frt_res_eternal_frontier', name: 'Eternal Frontier Mastery', description: 'The pinnacle of Arctic knowledge — master all aspects of frontier survival and settlement.',
    category: 'science', cost: { permafrost_core: 10, aurora_shard: 15, obsidian: 10, gold: 30 }, timeToComplete: 20, requiredRank: 45,
    prerequisiteIds: ['frt_res_thermal_engineering', 'frt_res_frontier_unification'], icon: '🏆', color: '#FFD740', effect: 'All meters drain 50% slower. Ultimate frontier mastery achieved.',
  },
]

// ─── ACHIEVEMENT DEFINITIONS (15) ───────────────────────────────

export const FRT_ACHIEVEMENTS: readonly FrtAchievementDef[] = [
  { id: 'frt_first_night', name: 'First Night Survived', description: 'Survive your first night in the Arctic frontier.', icon: '🌙', rewardXp: 25, hidden: false },
  { id: 'frt_survivor_week', name: 'Week-Long Survivor', description: 'Survive for 7 consecutive days in the frontier.', icon: '📅', rewardXp: 100, hidden: false },
  { id: 'frt_zone_unlock_four', name: 'Zone Pioneer', description: 'Unlock at least 4 different zones in the frontier.', icon: '🗺️', rewardXp: 150, hidden: false },
  { id: 'frt_explorer_ten', name: 'Seasoned Explorer', description: 'Reach explorer rank 10.', icon: '⭐', rewardXp: 200, hidden: false },
  { id: 'frt_all_buildings', name: 'Master Builder', description: 'Construct at least one of every building type.', icon: '🏗️', rewardXp: 300, hidden: false },
  { id: 'frt_blizzard_endured', name: 'Blizzard Survivor', description: 'Endure 5 blizzards without any meter reaching zero.', icon: '🌬️', rewardXp: 200, hidden: false },
  { id: 'frt_daily_expedition_five', name: 'Expedition Veteran', description: 'Complete 5 daily expeditions successfully.', icon: '🎒', rewardXp: 150, hidden: false },
  { id: 'frt_animal_sanctuary', name: 'Animal Sanctuary', description: 'Discover all 15 arctic animal species.', icon: '🐾', rewardXp: 350, hidden: true },
  { id: 'frt_research_completed_ten', name: 'Frontier Scholar', description: 'Complete 10 research projects.', icon: '📚', rewardXp: 400, hidden: false },
  { id: 'frt_full_meters', name: 'Living Comfortably', description: 'Have all 5 survival meters at 80 or above simultaneously.', icon: '💯', rewardXp: 250, hidden: false },
  { id: 'frt_golden_age', name: 'Golden Age', description: 'Accumulate 500 gold in your treasury at once.', icon: '🪙', rewardXp: 300, hidden: false },
  { id: 'frt_frontier_master', name: 'Frontier Master', description: 'Reach the maximum explorer rank of 50.', icon: '🏆', rewardXp: 1000, hidden: true },
  { id: 'frt_aurora_blessing', name: 'Aurora Blessed', description: 'Experience 10 aurora borealis events.', icon: '🌌', rewardXp: 200, hidden: false },
  { id: 'frt_permafrost_pioneer', name: 'Permafrost Pioneer', description: 'Unlock and visit the Permafrost Lab zone.', icon: '🧊', rewardXp: 250, hidden: false },
  { id: 'frt_settlement_elder', name: 'Settlement Elder', description: 'Survive for 30 total days in the frontier.', icon: '👴', rewardXp: 500, hidden: false },
]

// ─── EXPLORER RANK TITLES ───────────────────────────────────────

export const FRT_RANK_TITLES: readonly { rank: number; title: string; description: string }[] = [
  { rank: 1, title: 'Fresh Arrival', description: 'A new arrival to the frozen frontier with nothing but determination.' },
  { rank: 3, title: 'Cold Footed', description: 'Getting used to the cold. Still shivering but no longer panicking.' },
  { rank: 5, title: 'Tundra Novice', description: 'Has learned to navigate the tundra and set up basic camps.' },
  { rank: 8, title: 'Ice Walker', description: 'Walks confidently across frozen lakes and knows the signs of breaking ice.' },
  { rank: 10, title: 'Frost Scout', description: 'An experienced scout who ventures beyond established routes.' },
  { rank: 13, title: 'Glacier Trekker', description: 'Has climbed glacier faces and descended into crystal caves.' },
  { rank: 16, title: 'Arctic Ranger', description: 'A trusted ranger who protects settlers and patrols the frontier.' },
  { rank: 20, title: 'Blizzard Born', description: 'Born anew in the blizzard. The cold is now an ally, not an enemy.' },
  { rank: 24, title: 'Aurora Seeker', description: 'Chases the northern lights across the sky, guided by their shimmer.' },
  { rank: 28, title: 'Permafrost Scholar', description: 'Studies the ancient secrets locked in the frozen earth below.' },
  { rank: 32, title: 'Summit Strider', description: 'Has stood on the highest peaks where the air is thin and the stars are close.' },
  { rank: 36, title: 'Frontier Warden', description: 'A warden of the frontier who commands respect from all who dwell here.' },
  { rank: 40, title: 'Ice Sovereign', description: 'Rules over a vast expanse of the frozen frontier with wisdom and strength.' },
  { rank: 45, title: 'Eternal Frost', description: 'Has become one with the eternal frost. The land itself bends to their will.' },
  { rank: 50, title: 'Arctic Legend', description: 'A living legend whose name is whispered by the wind across the frozen wastes.' },
]

// ─── INTERNAL HELPERS ───────────────────────────────────────────

const FRT_MAX_RANK = 50
const FRT_MAX_METER = 100
const FRT_MIN_METER = 0
const FRT_STORAGE_KEY = 'frost-frontier-state-v1'

function frtXpForRank(rank: number): number {
  if (rank <= 0) return 0
  if (rank >= FRT_MAX_RANK) return Infinity
  return Math.floor(40 * Math.pow(1.1, rank) + rank * 12)
}

function frtRankFromXp(totalXp: number): number {
  let rank = 1
  let remaining = totalXp
  while (rank < FRT_MAX_RANK) {
    const needed = frtXpForRank(rank)
    if (remaining < needed) break
    remaining -= needed
    rank++
  }
  return rank
}

function frtClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function frtSeedRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function frtRandomInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function frtPickRandom<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

function frtTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function frtCreateEmptyResources(): FrtResources {
  return {
    wood: 0, stone: 0, ice_crystal: 0, fur: 0, fish: 0, meat: 0,
    herb: 0, iron: 0, gold: 0, aurora_shard: 0, permafrost_core: 0, obsidian: 0,
  }
}

function frtCreateEmptyBuildings(): FrtBuildings {
  return {
    shelter: 0, hearth: 0, smokehouse: 0, ice_well: 0, herbal_hut: 0,
    trading_post: 0, watchtower: 0, aurora_array: 0, forge: 0, research_lab: 0,
  }
}

function frtCreateFullMeters(): FrtMeters {
  return { warmth: 80, food: 70, water: 75, medicine: 60, morale: 70 }
}

function frtCreateEmptyStats(): FrtStats {
  return {
    totalDaysSurvived: 0, totalResourcesGathered: 0, totalBuildingsConstructed: 0,
    totalExpeditionsCompleted: 0, totalAnimalsEncountered: 0, totalBlizzardsSurvived: 0,
    totalAurorasExperienced: 0, totalTradesCompleted: 0, totalResearchCompleted: 0,
    highestWarmth: 0, highestMorale: 0, longestExpedition: 0,
    goldEarned: 0, goldSpent: 0,
  }
}

function frtCreateInitialTraderVisits(): FrtTraderVisit[] {
  return FRT_TRADERS.map(t => ({
    traderId: t.id,
    lastVisitDay: 0,
    reputation: 0,
    tradesCompleted: 0,
  }))
}

function frtGetWeatherDef(type: FrtWeatherType): FrtWeatherDef {
  const def = FRT_WEATHER_TYPES.find(w => w.type === type)
  return def ?? FRT_WEATHER_TYPES[0]
}

function frtGetZoneDef(zoneId: FrtZoneId): FrtZoneDef {
  const def = FRT_ZONES.find(z => z.id === zoneId)
  return def ?? FRT_ZONES[0]
}

function frtGetBuildingDef(buildingId: FrtBuildingId): FrtBuildingDef {
  const def = FRT_BUILDINGS.find(b => b.id === buildingId)
  return def ?? FRT_BUILDINGS[0]
}

function frtGetExpeditionDef(expeditionId: FrtExpeditionId): FrtExpeditionDef {
  const def = FRT_EXPEDITIONS.find(e => e.id === expeditionId)
  return def ?? FRT_EXPEDITIONS[0]
}

function frtGetTraderDef(traderId: FrtTraderId): FrtTraderDef {
  const def = FRT_TRADERS.find(t => t.id === traderId)
  return def ?? FRT_TRADERS[0]
}

function frtGetAnimalDef(animalId: FrtAnimalId): FrtAnimalDef {
  const def = FRT_ANIMALS.find(a => a.id === animalId)
  return def ?? FRT_ANIMALS[0]
}

function frtAddResources(resources: FrtResources, additions: Partial<Record<FrtResourceId, number>>): FrtResources {
  const updated = { ...resources }
  const keys = Object.keys(additions) as FrtResourceId[]
  for (const key of keys) {
    const amount = additions[key] ?? 0
    updated[key] = frtClamp(updated[key] + amount, 0, FRT_RESOURCES.find(r => r.id === key)?.maxStack ?? 999)
  }
  return updated
}

function frtRemoveResources(resources: FrtResources, costs: Partial<Record<FrtResourceId, number>>): FrtResources {
  const updated = { ...resources }
  const keys = Object.keys(costs) as FrtResourceId[]
  for (const key of keys) {
    const amount = costs[key] ?? 0
    updated[key] = Math.max(0, updated[key] - amount)
  }
  return updated
}

function frtCanAfford(resources: FrtResources, costs: Partial<Record<FrtResourceId, number>>): boolean {
  const keys = Object.keys(costs) as FrtResourceId[]
  for (const key of keys) {
    if ((resources[key] ?? 0) < (costs[key] ?? 0)) return false
  }
  return true
}

function frtCountResources(additions: Partial<Record<FrtResourceId, number>>): number {
  let total = 0
  const keys = Object.keys(additions) as FrtResourceId[]
  for (const key of keys) {
    total += additions[key] ?? 0
  }
  return total
}

function frtGetBuildingBonus(state: FrtGameState, meterId: FrtMeterId): number {
  let bonus = 0
  const buildingEntries = Object.entries(state.buildings) as [FrtBuildingId, number][]
  for (const [buildingId, level] of buildingEntries) {
    if (level <= 0) continue
    const def = frtGetBuildingDef(buildingId)
    const meterMap: Record<FrtMeterId, number> = {
      warmth: def.warmthBonus,
      food: def.foodBonus,
      water: def.waterBonus,
      medicine: def.medicineBonus,
      morale: def.moraleBonus,
    }
    bonus += meterMap[meterId] * level
  }
  return bonus
}

function frtProcessWeatherEffects(state: FrtGameState): FrtGameState {
  const weatherDef = frtGetWeatherDef(state.weather.current)
  const meterMap: Record<FrtMeterId, number> = {
    warmth: weatherDef.warmthModifier,
    food: 0,
    water: 0,
    medicine: 0,
    morale: weatherDef.moraleModifier,
  }
  const updatedMeters = { ...state.meters }
  const meterKeys: FrtMeterId[] = ['warmth', 'food', 'water', 'medicine', 'morale']
  for (const key of meterKeys) {
    const modifier = meterMap[key] ?? 0
    const buildingBonus = frtGetBuildingBonus(state, key)
    const adjusted = modifier + Math.floor(buildingBonus * 0.3)
    updatedMeters[key] = frtClamp(updatedMeters[key] + adjusted, FRT_MIN_METER, FRT_MAX_METER)
  }
  const updatedStats = { ...state.stats }
  if (weatherDef.type === 'blizzard') {
    updatedStats.totalBlizzardsSurvived += 1
  }
  if (weatherDef.type === 'aurora') {
    updatedStats.totalAurorasExperienced += 1
  }
  return {
    ...state,
    meters: updatedMeters,
    stats: updatedStats,
  }
}

function frtAdvanceWeather(state: FrtGameState): FrtGameState {
  const remaining = state.weather.turnsRemaining - 1
  if (remaining > 0) {
    return { ...state, weather: { ...state.weather, turnsRemaining: remaining } }
  }
  const rng = frtSeedRandom(state.seed + state.dayCount * 7)
  const roll = rng()
  let weatherType: FrtWeatherType = 'clear'
  if (roll < 0.05) weatherType = 'frost_storm'
  else if (roll < 0.12) weatherType = 'blizzard'
  else if (roll < 0.18) weatherType = 'whiteout'
  else if (roll < 0.25) weatherType = 'heavy_snow'
  else if (roll < 0.35) weatherType = 'aurora'
  else if (roll < 0.50) weatherType = 'light_snow'
  else if (roll < 0.65) weatherType = 'cloudy'
  const weatherDef = frtGetWeatherDef(weatherType)
  const duration = frtRandomInt(weatherDef.duration[0], weatherDef.duration[1], rng)
  const newHistory = [...state.weather.history, { type: state.weather.current, turns: state.weather.turnsRemaining }].slice(-10)
  return {
    ...state,
    weather: {
      current: weatherType,
      turnsRemaining: duration,
      history: newHistory,
    },
  }
}

function frtCheckAchievements(state: FrtGameState): FrtGameState {
  const newAchievements = [...state.achievements]
  const checks: Array<{ id: FrtAchievementId; condition: boolean }> = [
    { id: 'frt_first_night', condition: state.stats.totalDaysSurvived >= 1 },
    { id: 'frt_survivor_week', condition: state.stats.totalDaysSurvived >= 7 },
    { id: 'frt_zone_unlock_four', condition: state.unlockedZones.length >= 4 },
    { id: 'frt_explorer_ten', condition: state.explorerRank >= 10 },
    { id: 'frt_all_buildings', condition: (Object.values(state.buildings) as number[]).some(v => v > 0) },
    { id: 'frt_blizzard_endured', condition: state.stats.totalBlizzardsSurvived >= 5 },
    { id: 'frt_daily_expedition_five', condition: state.stats.totalExpeditionsCompleted >= 5 },
    { id: 'frt_animal_sanctuary', condition: state.animalCatalog.discovered.length >= 15 },
    { id: 'frt_research_completed_ten', condition: state.research.completed.length >= 10 },
    { id: 'frt_full_meters', condition: state.meters.warmth >= 80 && state.meters.food >= 80 && state.meters.water >= 80 && state.meters.medicine >= 80 && state.meters.morale >= 80 },
    { id: 'frt_golden_age', condition: state.resources.gold >= 500 },
    { id: 'frt_frontier_master', condition: state.explorerRank >= FRT_MAX_RANK },
    { id: 'frt_aurora_blessing', condition: state.stats.totalAurorasExperienced >= 10 },
    { id: 'frt_permafrost_pioneer', condition: state.unlockedZones.includes('permafrost_lab') },
    { id: 'frt_settlement_elder', condition: state.stats.totalDaysSurvived >= 30 },
  ]
  for (const check of checks) {
    if (!newAchievements.includes(check.id) && check.condition) {
      newAchievements.push(check.id)
    }
  }
  return { ...state, achievements: newAchievements }
}

function frtProcessActiveExpedition(state: FrtGameState): FrtGameState {
  if (!state.activeExpedition) return state
  const remaining = state.activeExpedition.turnsRemaining - 1
  if (remaining > 0) {
    return {
      ...state,
      activeExpedition: { ...state.activeExpedition, turnsRemaining: remaining },
    }
  }
  const expDef = frtGetExpeditionDef(state.activeExpedition.expeditionId)
  const rng = frtSeedRandom(state.seed + state.dayCount * 13 + state.activeExpedition.turnsRemaining)
  const success = rng() > expDef.dangerChance
  const updatedResources = { ...state.resources }
  if (success) {
    for (const [key, amount] of Object.entries(expDef.rewardResources)) {
      const resKey = key as FrtResourceId
      updatedResources[resKey] = frtClamp(
        updatedResources[resKey] + amount,
        0,
        FRT_RESOURCES.find(r => r.id === resKey)?.maxStack ?? 999
      )
    }
  }
  const totalGathered = frtCountResources(expDef.rewardResources)
  const dailyBonus = frtCheckDailyExpeditionMatch(state, state.activeExpedition.expeditionId)
  let bonusXp = 0
  if (dailyBonus && success) {
    for (const [key, amount] of Object.entries(dailyBonus.bonusReward)) {
      const resKey = key as FrtResourceId
      updatedResources[resKey] = frtClamp(
        updatedResources[resKey] + amount,
        0,
        FRT_RESOURCES.find(r => r.id === resKey)?.maxStack ?? 999
      )
    }
    bonusXp = dailyBonus.bonusXp
  }
  const xpGain = success ? expDef.rewardXp + bonusXp : Math.floor(expDef.rewardXp * 0.3)
  const updatedStats = { ...state.stats }
  updatedStats.totalExpeditionsCompleted += 1
  updatedStats.longestExpedition = Math.max(updatedStats.longestExpedition, expDef.duration)
  return frtAddXp(
    {
      ...state,
      resources: updatedResources,
      activeExpedition: null,
      stats: updatedStats,
    },
    xpGain
  )
}

function frtCheckDailyExpeditionMatch(state: FrtGameState, expeditionId: FrtExpeditionId): FrtDailyExpedition | null {
  if (!state.dailyExpedition) return null
  if (state.dailyExpedition.completed) return null
  if (state.dailyExpedition.expeditionId !== expeditionId) return null
  return state.dailyExpedition
}

function frtAddXp(state: FrtGameState, amount: number): FrtGameState {
  const newTotal = state.explorerXp + amount
  const newRank = frtRankFromXp(newTotal)
  const newUnlockedZones = [...state.unlockedZones]
  for (const zone of FRT_ZONES) {
    if (zone.unlockRank <= newRank && !newUnlockedZones.includes(zone.id)) {
      newUnlockedZones.push(zone.id)
    }
  }
  return {
    ...state,
    explorerRank: newRank,
    explorerXp: newTotal,
    unlockedZones: newUnlockedZones,
  }
}

function frtGenerateDailyExpedition(day: number): FrtDailyExpedition {
  const rng = frtSeedRandom(day * 31 + 7)
  const validExpeditions = FRT_EXPEDITIONS.filter(() => true)
  const expedition = frtPickRandom(validExpeditions, rng)
  const bonusResource: FrtResourceId = frtPickRandom(
    expedition.lootTable as FrtResourceId[],
    rng
  )
  const bonusAmount = frtRandomInt(3, 8, rng)
  return {
    date: frtTodayString(),
    expeditionId: expedition.id,
    bonusReward: { [bonusResource]: bonusAmount },
    completed: false,
    bonusXp: frtRandomInt(10, 30, rng),
  }
}

function frtSimulateAnimalEncounters(state: FrtGameState): FrtGameState {
  const zoneDef = frtGetZoneDef(state.currentZone)
  const rng = frtSeedRandom(state.seed + state.dayCount * 11)
  let updatedState = { ...state }
  let updatedStats = { ...updatedState.stats }
  const discovered = [...updatedState.animalCatalog.discovered]
  let encountered = updatedState.animalCatalog.encountered
  for (const animalId of zoneDef.nativeAnimals) {
    const animalDef = frtGetAnimalDef(animalId)
    if (rng() < animalDef.encounterChance) {
      encountered += 1
      updatedStats.totalAnimalsEncountered += 1
      if (!discovered.includes(animalId)) {
        discovered.push(animalId)
      }
      if (animalDef.resourceDrop && rng() < 0.4) {
        const updatedResources = { ...updatedState.resources }
        const dropKey = animalDef.resourceDrop
        updatedResources[dropKey] = frtClamp(
          updatedResources[dropKey] + animalDef.dropAmount,
          0,
          FRT_RESOURCES.find(r => r.id === dropKey)?.maxStack ?? 999
        )
        updatedState = { ...updatedState, resources: updatedResources }
      }
      updatedState = frtAddXp(updatedState, animalDef.xpReward)
    }
  }
  return {
    ...updatedState,
    animalCatalog: {
      discovered,
      encountered,
      catalogued: discovered.length,
    },
    stats: updatedStats,
  }
}

// ═══════════════════════════════════════════════════════════════════
// NAMED EXPORTS — All pure functions with frt prefix
// ═══════════════════════════════════════════════════════════════════

// ─── State Management (8) ───────────────────────────────────────

export function frtInitialState(): FrtGameState {
  return {
    explorerRank: 1,
    explorerXp: 0,
    currentZone: 'ice_harbor',
    meters: frtCreateFullMeters(),
    resources: { ...frtCreateEmptyResources(), wood: 20, stone: 10, fish: 10 },
    buildings: frtCreateEmptyBuildings(),
    unlockedZones: ['ice_harbor', 'tundra_camp'],
    weather: { current: 'clear', turnsRemaining: 3, history: [] },
    activeExpedition: null,
    animalCatalog: { discovered: [], encountered: 0, catalogued: 0 },
    traderVisits: frtCreateInitialTraderVisits(),
    research: { completed: [], inProgress: null, progress: 0, totalSpent: 0 },
    achievements: [],
    dailyExpedition: frtGenerateDailyExpedition(1),
    stats: frtCreateEmptyStats(),
    dayCount: 1,
    settlementName: 'Frozen Hope',
    seed: 42,
  }
}

export function frtResetState(): FrtGameState {
  return frtInitialState()
}

export function frtGetState(state: FrtGameState): FrtGameState {
  return state
}

export function frtCloneState(state: FrtGameState): FrtGameState {
  return JSON.parse(JSON.stringify(state)) as FrtGameState
}

export function frtMergeState(base: FrtGameState, patch: Partial<FrtGameState>): FrtGameState {
  return { ...base, ...patch }
}

export function frtIsStateLoaded(state: FrtGameState | null): boolean {
  return state !== null
}

export function frtValidateState(data: unknown): FrtGameState {
  if (data && typeof data === 'object' && 'explorerRank' in data && 'meters' in data) {
    return data as FrtGameState
  }
  return frtInitialState()
}

// ─── Explorer Functions (10) ────────────────────────────────────

export function frtGetRank(state: FrtGameState): number {
  return state.explorerRank
}

export function frtGetXp(state: FrtGameState): number {
  return state.explorerXp
}

export function frtGetXpForRank(rank: number): number {
  return frtXpForRank(rank)
}

export function frtGetRankFromXp(totalXp: number): number {
  return frtRankFromXp(totalXp)
}

export function frtGetXpToNextRank(state: FrtGameState): number {
  if (state.explorerRank >= FRT_MAX_RANK) return 0
  return frtXpForRank(state.explorerRank)
}

export function frtGetXpProgress(state: FrtGameState): number {
  if (state.explorerRank >= FRT_MAX_RANK) return 1
  const needed = frtXpForRank(state.explorerRank)
  if (needed <= 0) return 0
  const spent = Array.from({ length: state.explorerRank - 1 }, (_, i) => frtXpForRank(i + 1)).reduce((a, b) => a + b, 0)
  const current = state.explorerXp - spent
  return Math.min(1, current / needed)
}

export function frtGetRankTitle(state: FrtGameState): string {
  let title = FRT_RANK_TITLES[0].title
  for (const t of FRT_RANK_TITLES) {
    if (state.explorerRank >= t.rank) title = t.title
  }
  return title
}

export function frtGetRankTitleForRank(rank: number): string {
  let title = FRT_RANK_TITLES[0].title
  for (const t of FRT_RANK_TITLES) {
    if (rank >= t.rank) title = t.title
  }
  return title
}

export function frtGetMaxRank(): number {
  return FRT_MAX_RANK
}

// ─── Zone Functions (8) ─────────────────────────────────────────

export function frtGetCurrentZone(state: FrtGameState): FrtZoneId {
  return state.currentZone
}

export function frtSetCurrentZone(state: FrtGameState, zoneId: FrtZoneId): FrtGameState {
  if (!state.unlockedZones.includes(zoneId)) return state
  return { ...state, currentZone: zoneId }
}

export function frtGetUnlockedZones(state: FrtGameState): FrtZoneId[] {
  return state.unlockedZones
}

export function frtGetZoneInfo(zoneId: FrtZoneId): FrtZoneDef {
  return frtGetZoneDef(zoneId)
}

export function frtGetAllZones(): readonly FrtZoneDef[] {
  return FRT_ZONES
}

export function frtIsZoneUnlocked(state: FrtGameState, zoneId: FrtZoneId): boolean {
  return state.unlockedZones.includes(zoneId)
}

export function frtGetZoneColor(zoneId: FrtZoneId): string {
  return FRT_ZONE_COLORS[zoneId]
}

// ─── Meter Functions (10) ───────────────────────────────────────

export function frtGetMeters(state: FrtGameState): FrtMeters {
  return state.meters
}

export function frtGetMeter(state: FrtGameState, meterId: FrtMeterId): number {
  return state.meters[meterId]
}

export function frtGetMeterColor(meterId: FrtMeterId): string {
  return FRT_METER_COLORS[meterId]
}

export function frtGetMeterMax(): number {
  return FRT_MAX_METER
}

export function frtGetMeterMin(): number {
  return FRT_MIN_METER
}

export function frtGetMeterProgress(state: FrtGameState, meterId: FrtMeterId): number {
  return state.meters[meterId] / FRT_MAX_METER
}

export function frtGetMeterLabel(meterId: FrtMeterId): string {
  const labels: Record<FrtMeterId, string> = {
    warmth: 'Warmth',
    food: 'Food',
    water: 'Water',
    medicine: 'Medicine',
    morale: 'Morale',
  }
  return labels[meterId]
}

export function frtGetMeterIcon(meterId: FrtMeterId): string {
  const icons: Record<FrtMeterId, string> = {
    warmth: '🔥',
    food: '🍖',
    water: '💧',
    medicine: '💊',
    morale: '😊',
  }
  return icons[meterId]
}

export function frtIsMeterCritical(state: FrtGameState, meterId: FrtMeterId): boolean {
  return state.meters[meterId] <= 20
}

export function frtGetLowestMeter(state: FrtGameState): FrtMeterId {
  let lowest: FrtMeterId = 'warmth'
  let minVal = state.meters.warmth
  const keys: FrtMeterId[] = ['food', 'water', 'medicine', 'morale']
  for (const key of keys) {
    if (state.meters[key] < minVal) {
      minVal = state.meters[key]
      lowest = key
    }
  }
  return lowest
}

// ─── Resource Functions (12) ────────────────────────────────────

export function frtGetResources(state: FrtGameState): FrtResources {
  return state.resources
}

export function frtGetResource(state: FrtGameState, resourceId: FrtResourceId): number {
  return state.resources[resourceId]
}

export function frtGetResourceInfo(resourceId: FrtResourceId): FrtResourceDef {
  const def = FRT_RESOURCES.find(r => r.id === resourceId)
  return def ?? FRT_RESOURCES[0]
}

export function frtGetAllResources(): readonly FrtResourceDef[] {
  return FRT_RESOURCES
}

export function frtGetResourceIcon(resourceId: FrtResourceId): string {
  return FRT_RESOURCE_ICONS[resourceId]
}

export function frtGetResourceValue(resourceId: FrtResourceId): number {
  const def = FRT_RESOURCES.find(r => r.id === resourceId)
  return def?.baseValue ?? 1
}

export function frtCanAffordResources(state: FrtGameState, costs: Partial<Record<FrtResourceId, number>>): boolean {
  return frtCanAfford(state.resources, costs)
}

export function frtGetTotalResourceValue(state: FrtGameState): number {
  let total = 0
  const keys = Object.keys(state.resources) as FrtResourceId[]
  for (const key of keys) {
    total += state.resources[key] * (FRT_RESOURCES.find(r => r.id === key)?.baseValue ?? 0)
  }
  return total
}

export function frtGetResourceCount(state: FrtGameState, resourceId: FrtResourceId): number {
  return state.resources[resourceId]
}

export function frtHasResources(state: FrtGameState, minimums: Partial<Record<FrtResourceId, number>>): boolean {
  const keys = Object.keys(minimums) as FrtResourceId[]
  for (const key of keys) {
    if (state.resources[key] < (minimums[key] ?? 0)) return false
  }
  return true
}

export function frtGetRichestResource(state: FrtGameState): FrtResourceId {
  let richest: FrtResourceId = 'wood'
  let maxVal = 0
  const keys = Object.keys(state.resources) as FrtResourceId[]
  for (const key of keys) {
    const value = state.resources[key] * (FRT_RESOURCES.find(r => r.id === key)?.baseValue ?? 0)
    if (value > maxVal) {
      maxVal = value
      richest = key
    }
  }
  return richest
}

// ─── Building Functions (10) ────────────────────────────────────

export function frtGetBuildings(state: FrtGameState): FrtBuildings {
  return state.buildings
}

export function frtGetBuildingLevel(state: FrtGameState, buildingId: FrtBuildingId): number {
  return state.buildings[buildingId]
}

export function frtGetBuildingInfo(buildingId: FrtBuildingId): FrtBuildingDef {
  return frtGetBuildingDef(buildingId)
}

export function frtGetAllBuildings(): readonly FrtBuildingDef[] {
  return FRT_BUILDINGS
}

export function frtGetBuildingIcon(buildingId: FrtBuildingId): string {
  return FRT_BUILDING_ICONS[buildingId]
}

export function frtCanBuild(state: FrtGameState, buildingId: FrtBuildingId): boolean {
  const def = frtGetBuildingDef(buildingId)
  if (state.buildings[buildingId] >= def.maxLevel) return false
  if (def.requiredZone && !state.unlockedZones.includes(def.requiredZone)) return false
  return frtCanAfford(state.resources, def.buildCost)
}

export function frtGetBuildingCostForLevel(buildingId: FrtBuildingId, level: number): Partial<Record<FrtResourceId, number>> {
  const baseCost = frtGetBuildingDef(buildingId).buildCost
  const scaled: Partial<Record<FrtResourceId, number>> = {}
  const keys = Object.keys(baseCost) as FrtResourceId[]
  for (const key of keys) {
    scaled[key] = Math.ceil((baseCost[key] ?? 0) * (1 + (level - 1) * 0.5))
  }
  return scaled
}

export function frtGetTotalBuildingBonus(state: FrtGameState, meterId: FrtMeterId): number {
  return frtGetBuildingBonus(state, meterId)
}

export function frtGetTotalBuildingCount(state: FrtGameState): number {
  return (Object.values(state.buildings) as number[]).reduce((sum, level) => sum + level, 0)
}

// ─── Expedition Functions (10) ──────────────────────────────────

export function frtGetAllExpeditions(): readonly FrtExpeditionDef[] {
  return FRT_EXPEDITIONS
}

export function frtGetExpeditionInfo(expeditionId: FrtExpeditionId): FrtExpeditionDef {
  return frtGetExpeditionDef(expeditionId)
}

export function frtGetActiveExpedition(state: FrtGameState): FrtExpeditionActive | null {
  return state.activeExpedition
}

export function frtIsExpeditionActive(state: FrtGameState): boolean {
  return state.activeExpedition !== null
}

export function frtCanLaunchExpedition(state: FrtGameState, expeditionId: FrtExpeditionId): boolean {
  if (state.activeExpedition !== null) return false
  const def = frtGetExpeditionDef(expeditionId)
  if (state.explorerRank < def.requiredRank) return false
  if (def.requiredBuilding && state.buildings[def.requiredBuilding] < 1) return false
  return true
}

export function frtGetAvailableExpeditions(state: FrtGameState): readonly FrtExpeditionDef[] {
  return FRT_EXPEDITIONS.filter(exp => {
    if (state.explorerRank < exp.requiredRank) return false
    if (exp.requiredBuilding && state.buildings[exp.requiredBuilding] < 1) return false
    return true
  })
}

export function frtGetExpeditionIcon(expeditionId: FrtExpeditionId): string {
  return frtGetExpeditionDef(expeditionId).icon
}

export function frtGetExpeditionDuration(expeditionId: FrtExpeditionId): number {
  return frtGetExpeditionDef(expeditionId).duration
}

export function frtGetExpeditionReward(expeditionId: FrtExpeditionId): Partial<Record<FrtResourceId, number>> {
  return frtGetExpeditionDef(expeditionId).rewardResources
}

// ─── Animal Functions (8) ───────────────────────────────────────

export function frtGetAllAnimals(): readonly FrtAnimalDef[] {
  return FRT_ANIMALS
}

export function frtGetAnimalInfo(animalId: FrtAnimalId): FrtAnimalDef {
  return frtGetAnimalDef(animalId)
}

export function frtGetDiscoveredAnimals(state: FrtGameState): string[] {
  return state.animalCatalog.discovered
}

export function frtGetAnimalCatalog(state: FrtGameState): FrtAnimalCatalog {
  return state.animalCatalog
}

export function frtGetDiscoveryProgress(state: FrtGameState): number {
  return state.animalCatalog.discovered.length / FRT_ANIMALS.length
}

export function frtIsAnimalDiscovered(state: FrtGameState, animalId: FrtAnimalId): boolean {
  return state.animalCatalog.discovered.includes(animalId)
}

export function frtGetAnimalsInZone(zoneId: FrtZoneId): readonly FrtAnimalDef[] {
  return FRT_ANIMALS.filter(a => a.habitat === zoneId)
}

export function frtGetTotalAnimalsDiscovered(state: FrtGameState): number {
  return state.animalCatalog.discovered.length
}

// ─── Weather Functions (10) ─────────────────────────────────────

export function frtGetCurrentWeather(state: FrtGameState): FrtWeatherType {
  return state.weather.current
}

export function frtGetWeatherInfo(weatherType: FrtWeatherType): FrtWeatherDef {
  return frtGetWeatherDef(weatherType)
}

export function frtGetAllWeatherTypes(): readonly FrtWeatherDef[] {
  return FRT_WEATHER_TYPES
}

export function frtGetWeatherColor(weatherType: FrtWeatherType): string {
  return FRT_WEATHER_COLORS[weatherType]
}

export function frtGetWeatherTurnsRemaining(state: FrtGameState): number {
  return state.weather.turnsRemaining
}

export function frtGetWeatherHistory(state: FrtGameState): Array<{ type: FrtWeatherType; turns: number }> {
  return state.weather.history
}

export function frtIsDangerousWeather(state: FrtGameState): boolean {
  const def = frtGetWeatherDef(state.weather.current)
  return def.dangerModifier >= 5
}

export function frtIsAuroraActive(state: FrtGameState): boolean {
  return state.weather.current === 'aurora'
}

export function frtIsBlizzardActive(state: FrtGameState): boolean {
  return state.weather.current === 'blizzard'
}

export function frtGetWeatherIcon(state: FrtGameState): string {
  return frtGetWeatherDef(state.weather.current).icon
}

// ─── Trader Functions (10) ──────────────────────────────────────

export function frtGetAllTraders(): readonly FrtTraderDef[] {
  return FRT_TRADERS
}

export function frtGetTraderInfo(traderId: FrtTraderId): FrtTraderDef {
  return frtGetTraderDef(traderId)
}

export function frtGetTraderVisit(state: FrtGameState, traderId: FrtTraderId): FrtTraderVisit | null {
  return state.traderVisits.find(v => v.traderId === traderId) ?? null
}

export function frtGetTraderReputation(state: FrtGameState, traderId: FrtTraderId): number {
  const visit = state.traderVisits.find(v => v.traderId === traderId)
  return visit?.reputation ?? 0
}

export function frtGetTraderGreeting(traderId: FrtTraderId): string {
  return frtGetTraderDef(traderId).greeting
}

export function frtGetTraderFarewell(traderId: FrtTraderId): string {
  return frtGetTraderDef(traderId).farewell
}

export function frtGetBuyPrice(basePrice: number, traderId: FrtTraderId, reputation: number): number {
  const def = frtGetTraderDef(traderId)
  const repDiscount = Math.max(0.7, 1 - reputation * 0.02)
  return Math.ceil(basePrice * def.buyMultiplier * repDiscount)
}

export function frtGetSellPrice(basePrice: number, traderId: FrtTraderId, reputation: number): number {
  const def = frtGetTraderDef(traderId)
  const repBonus = Math.min(1.3, 1 + reputation * 0.015)
  return Math.floor(basePrice * def.sellMultiplier * repBonus)
}

export function frtIsTraderAvailable(state: FrtGameState, traderId: FrtTraderId): boolean {
  const visit = state.traderVisits.find(v => v.traderId === traderId)
  if (!visit) return true
  const def = frtGetTraderDef(traderId)
  return state.dayCount - visit.lastVisitDay >= def.stockRefreshDays
}

export function frtGetTraderSpecialty(traderId: FrtTraderId): FrtResourceId[] {
  return frtGetTraderDef(traderId).specialty
}

// ─── Research Functions (10) ────────────────────────────────────

export function frtGetAllResearch(): readonly FrtResearchDef[] {
  return FRT_RESEARCH_ITEMS
}

export function frtGetResearchInfo(researchId: string): FrtResearchDef {
  const def = FRT_RESEARCH_ITEMS.find(r => r.id === researchId)
  return def ?? FRT_RESEARCH_ITEMS[0]
}

export function frtGetCompletedResearch(state: FrtGameState): string[] {
  return state.research.completed
}

export function frtGetInProgressResearch(state: FrtGameState): string | null {
  return state.research.inProgress
}

export function frtGetResearchProgress(state: FrtGameState): number {
  return state.research.progress
}

export function frtIsResearchCompleted(state: FrtGameState, researchId: string): boolean {
  return state.research.completed.includes(researchId)
}

export function frtCanStartResearch(state: FrtGameState, researchId: string): boolean {
  if (state.research.inProgress !== null) return false
  if (state.research.completed.includes(researchId)) return false
  const def = FRT_RESEARCH_ITEMS.find(r => r.id === researchId)
  if (!def) return false
  if (state.explorerRank < def.requiredRank) return false
  for (const prereq of def.prerequisiteIds) {
    if (!state.research.completed.includes(prereq)) return false
  }
  return frtCanAfford(state.resources, def.cost)
}

export function frtGetAvailableResearch(state: FrtGameState): readonly FrtResearchDef[] {
  return FRT_RESEARCH_ITEMS.filter(r => frtCanStartResearch(state, r.id))
}

export function frtGetResearchCount(state: FrtGameState): number {
  return state.research.completed.length
}

// ─── Achievement Functions (8) ──────────────────────────────────

export function frtGetAllAchievements(): readonly FrtAchievementDef[] {
  return FRT_ACHIEVEMENTS
}

export function frtGetAchievementInfo(achievementId: FrtAchievementId): FrtAchievementDef {
  const def = FRT_ACHIEVEMENTS.find(a => a.id === achievementId)
  return def ?? FRT_ACHIEVEMENTS[0]
}

export function frtGetUnlockedAchievements(state: FrtGameState): FrtAchievementId[] {
  return state.achievements
}

export function frtIsAchievementUnlocked(state: FrtGameState, achievementId: FrtAchievementId): boolean {
  return state.achievements.includes(achievementId)
}

export function frtGetAchievementProgress(state: FrtGameState): number {
  return state.achievements.length / FRT_ACHIEVEMENTS.length
}

export function frtGetAchievementCount(state: FrtGameState): number {
  return state.achievements.length
}

export function frtGetVisibleAchievements(state: FrtGameState): readonly FrtAchievementDef[] {
  return FRT_ACHIEVEMENTS.filter(a => !a.hidden || state.achievements.includes(a.id))
}

export function frtGetHiddenAchievementCount(state: FrtGameState): number {
  return FRT_ACHIEVEMENTS.filter(a => a.hidden && !state.achievements.includes(a.id)).length
}

// ─── Daily Expedition Functions (6) ─────────────────────────────

export function frtGetDailyExpedition(state: FrtGameState): FrtDailyExpedition | null {
  return state.dailyExpedition
}

export function frtIsDailyCompleted(state: FrtGameState): boolean {
  return state.dailyExpedition?.completed ?? true
}

export function frtGetDailyBonusReward(state: FrtGameState): Partial<Record<FrtResourceId, number>> | null {
  if (!state.dailyExpedition || state.dailyExpedition.completed) return null
  return state.dailyExpedition.bonusReward
}

export function frtGetDailyExpeditionInfo(state: FrtGameState): FrtExpeditionDef | null {
  if (!state.dailyExpedition) return null
  return frtGetExpeditionDef(state.dailyExpedition.expeditionId)
}

export function frtGetDailyBonusXp(state: FrtGameState): number {
  if (!state.dailyExpedition || state.dailyExpedition.completed) return 0
  return state.dailyExpedition.bonusXp
}

export function frtIsDailyMatch(state: FrtGameState, expeditionId: FrtExpeditionId): boolean {
  return state.dailyExpedition?.expeditionId === expeditionId && !state.dailyExpedition.completed
}

// ─── Stats Functions (10) ───────────────────────────────────────

export function frtGetStats(state: FrtGameState): FrtStats {
  return state.stats
}

export function frtGetDaysSurvived(state: FrtGameState): number {
  return state.stats.totalDaysSurvived
}

export function frtGetDayCount(state: FrtGameState): number {
  return state.dayCount
}

export function frtGetTotalResourcesGathered(state: FrtGameState): number {
  return state.stats.totalResourcesGathered
}

export function frtGetTotalBuildingsConstructed(state: FrtGameState): number {
  return state.stats.totalBuildingsConstructed
}

export function frtGetTotalExpeditionsCompleted(state: FrtGameState): number {
  return state.stats.totalExpeditionsCompleted
}

export function frtGetTotalBlizzardsSurvived(state: FrtGameState): number {
  return state.stats.totalBlizzardsSurvived
}

export function frtGetTotalAurorasExperienced(state: FrtGameState): number {
  return state.stats.totalAurorasExperienced
}

export function frtGetTotalTradesCompleted(state: FrtGameState): number {
  return state.stats.totalTradesCompleted
}

export function frtGetSettlementName(state: FrtGameState): string {
  return state.settlementName
}

// ─── Utility Functions (6) ──────────────────────────────────────

export function frtGetMaxMeter(): number {
  return FRT_MAX_METER
}

export function frtGetMinMeter(): number {
  return FRT_MIN_METER
}

export function frtClampValue(value: number, min: number, max: number): number {
  return frtClamp(value, min, max)
}

export function frtGetTotalZones(): number {
  return FRT_ZONES.length
}

export function frtGetTotalAnimals(): number {
  return FRT_ANIMALS.length
}

export function frtGetTotalAchievements(): number {
  return FRT_ACHIEVEMENTS.length
}

// ─── Level / Rank Info (6) ──────────────────────────────────────

export function frtGetLevel(state: FrtGameState): number {
  return state.explorerRank
}

export function frtGetBase(): number {
  return 100
}

export function frtGetMaxLevel(): number {
  return FRT_MAX_RANK
}

export function frtGetRankDescription(state: FrtGameState): string {
  let desc = FRT_RANK_TITLES[0].description
  for (const t of FRT_RANK_TITLES) {
    if (state.explorerRank >= t.rank) desc = t.description
  }
  return desc
}

export function frtGetNextRankTitle(state: FrtGameState): string | null {
  for (const t of FRT_RANK_TITLES) {
    if (t.rank > state.explorerRank) return t.title
  }
  return null
}

export function frtGetNextRankAt(state: FrtGameState): number | null {
  for (const t of FRT_RANK_TITLES) {
    if (t.rank > state.explorerRank) return t.rank
  }
  return null
}

// ─── Color Theme Exports (6) ────────────────────────────────────

export function frtGetThemeColor(name: string): string {
  const colors: Record<string, string> = {
    tundraWhite: FRT_TUNDRA_WHITE,
    iceBlue: FRT_ICE_BLUE,
    auroraGreen: FRT_AURORA_GREEN,
    frostGray: FRT_FROST_GRAY,
    blizzardDark: FRT_BLIZZARD_DARK,
    snowAmber: FRT_SNOW_AMBER,
    deepIce: FRT_DEEP_ICE,
    permafrost: FRT_PERMAFROST,
    northernLight: FRT_NORTHERN_LIGHT,
    glacierCyan: FRT_GLACIER_CYAN,
  }
  return colors[name] ?? FRT_ICE_BLUE
}

export function frtGetAllThemeColors(): Record<string, string> {
  return {
    tundraWhite: FRT_TUNDRA_WHITE,
    iceBlue: FRT_ICE_BLUE,
    auroraGreen: FRT_AURORA_GREEN,
    frostGray: FRT_FROST_GRAY,
    blizzardDark: FRT_BLIZZARD_DARK,
    snowAmber: FRT_SNOW_AMBER,
    deepIce: FRT_DEEP_ICE,
    permafrost: FRT_PERMAFROST,
    northernLight: FRT_NORTHERN_LIGHT,
    glacierCyan: FRT_GLACIER_CYAN,
  }
}

export function frtGetZoneGradient(zoneId: FrtZoneId): string {
  return frtGetZoneDef(zoneId).backgroundGradient
}

export function frtGetZoneAmbient(zoneId: FrtZoneId): string {
  return frtGetZoneDef(zoneId).ambientColor
}

export function frtGetWeatherGradient(state: FrtGameState): string {
  return frtGetZoneDef(state.currentZone).backgroundGradient
}

export function frtGetDangerLevel(state: FrtGameState): number {
  return frtGetZoneDef(state.currentZone).dangerLevel + frtGetWeatherDef(state.weather.current).dangerModifier
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HOOK — useFrostFrontier
// Only useState is used — no useCallback, useRef, useMemo, or useEffect
// ═══════════════════════════════════════════════════════════════════

function frtLoadFromStorage(): FrtGameState {
  try {
    if (typeof window === 'undefined') return frtInitialState()
    const raw = localStorage.getItem(FRT_STORAGE_KEY)
    if (!raw) return frtInitialState()
    const parsed = JSON.parse(raw) as unknown
    return frtValidateState(parsed)
  } catch {
    return frtInitialState()
  }
}

function frtSaveToStorage(state: FrtGameState): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(FRT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export default function useFrostFrontier() {
  const [state, setState] = useState<FrtGameState>(() => frtLoadFromStorage())
  const [persistTick, setPersistTick] = useState<number>(0)

  const persist = (next: FrtGameState): void => {
    setState(next)
    frtSaveToStorage(next)
    setPersistTick(t => t + 1)
  }

  // ─── Day Advance ────────────────────────────────────────────

  const frtAdvanceDay = (): void => {
    let current = frtCloneState(state)
    const dailyDrain: Partial<FrtMeters> = { warmth: -5, food: -8, water: -10, medicine: -4, morale: -3 }
    const meterKeys: FrtMeterId[] = ['warmth', 'food', 'water', 'medicine', 'morale']
    for (const key of meterKeys) {
      current.meters[key] = frtClamp(current.meters[key] + (dailyDrain[key] ?? 0), FRT_MIN_METER, FRT_MAX_METER)
    }
    current = frtProcessWeatherEffects(current)
    current = frtAdvanceWeather(current)
    current = frtProcessActiveExpedition(current)
    current = frtSimulateAnimalEncounters(current)
    current.dayCount += 1
    current.stats.totalDaysSurvived += 1
    current.stats.highestWarmth = Math.max(current.stats.highestWarmth, current.meters.warmth)
    current.stats.highestMorale = Math.max(current.stats.highestMorale, current.meters.morale)
    if (!current.dailyExpedition || current.dailyExpedition.date !== frtTodayString()) {
      current.dailyExpedition = frtGenerateDailyExpedition(current.dayCount)
    }
    if (current.research.inProgress) {
      const researchDef = FRT_RESEARCH_ITEMS.find(r => r.id === current.research!.inProgress)
      if (researchDef) {
        current.research.progress += 1
        if (current.research.progress >= researchDef.timeToComplete) {
          current.research.completed.push(current.research.inProgress)
          current.research.totalSpent += frtCountResources(researchDef.cost)
          current.research.inProgress = null
          current.research.progress = 0
          current.stats.totalResearchCompleted += 1
          current = frtAddXp(current, researchDef.cost.gold ? 20 : 10)
        }
      }
    }
    current = frtCheckAchievements(current)
    persist(current)
  }

  // ─── Build Action ──────────────────────────────────────────

  const frtBuild = (buildingId: FrtBuildingId): boolean => {
    if (!frtCanBuild(state, buildingId)) return false
    const def = frtGetBuildingDef(buildingId)
    const currentLevel = state.buildings[buildingId]
    const cost = frtGetBuildingCostForLevel(buildingId, currentLevel + 1)
    if (!frtCanAfford(state.resources, cost)) return false
    let current = { ...state }
    current.resources = frtRemoveResources(current.resources, cost)
    current.buildings = { ...current.buildings, [buildingId]: currentLevel + 1 }
    current.stats.totalBuildingsConstructed += 1
    current = frtAddXp(current, 15 + currentLevel * 5)
    current = frtCheckAchievements(current)
    persist(current)
    return true
  }

  // ─── Expedition Actions ────────────────────────────────────

  const frtLaunchExpedition = (expeditionId: FrtExpeditionId): boolean => {
    if (!frtCanLaunchExpedition(state, expeditionId)) return false
    const def = frtGetExpeditionDef(expeditionId)
    const current: FrtGameState = {
      ...state,
      activeExpedition: {
        expeditionId,
        turnsRemaining: def.duration,
        teamSize: Math.min(5, Math.max(1, state.explorerRank)),
      },
    }
    persist(current)
    return true
  }

  const frtCancelExpedition = (): void => {
    if (!state.activeExpedition) return
    persist({ ...state, activeExpedition: null })
  }

  // ─── Zone Travel ───────────────────────────────────────────

  const frtTravel = (zoneId: FrtZoneId): boolean => {
    if (!state.unlockedZones.includes(zoneId)) return false
    if (zoneId === state.currentZone) return false
    const current: FrtGameState = { ...state, currentZone: zoneId }
    persist(current)
    return true
  }

  // ─── Meter Management ──────────────────────────────────────

  const frtConsumeResource = (meterId: FrtMeterId, amount: number): boolean => {
    let current: FrtGameState = { ...state }
    current.meters = { ...current.meters, [meterId]: frtClamp(current.meters[meterId] + amount, FRT_MIN_METER, FRT_MAX_METER) }
    current = frtCheckAchievements(current)
    persist(current)
    return true
  }

  // ─── Trading Actions ───────────────────────────────────────

  const frtTrade = (
    traderId: FrtTraderId,
    sellResourceId: FrtResourceId,
    sellAmount: number,
    buyResourceId: FrtResourceId,
  ): boolean => {
    if (state.resources[sellResourceId] < sellAmount) return false
    const visit = state.traderVisits.find(v => v.traderId === traderId)
    if (!visit) return false
    const def = frtGetTraderDef(traderId)
    const sellValue = frtGetSellPrice(
      FRT_RESOURCES.find(r => r.id === sellResourceId)?.baseValue ?? 1,
      traderId,
      visit.reputation
    )
    const buyValue = frtGetBuyPrice(
      FRT_RESOURCES.find(r => r.id === buyResourceId)?.baseValue ?? 1,
      traderId,
      visit.reputation
    )
    const totalSellValue = sellValue * sellAmount
    const buyAmount = Math.floor(totalSellValue / buyValue)
    if (buyAmount <= 0) return false
    let current = { ...state }
    current.resources = { ...current.resources }
    current.resources[sellResourceId] = Math.max(0, current.resources[sellResourceId] - sellAmount)
    current.resources[buyResourceId] = frtClamp(
      current.resources[buyResourceId] + buyAmount,
      0,
      FRT_RESOURCES.find(r => r.id === buyResourceId)?.maxStack ?? 999
    )
    current.traderVisits = current.traderVisits.map(v => {
      if (v.traderId !== traderId) return v
      return {
        ...v,
        lastVisitDay: current.dayCount,
        tradesCompleted: v.tradesCompleted + 1,
        reputation: v.reputation + 1,
      }
    })
    current.stats.totalTradesCompleted += 1
    current = frtCheckAchievements(current)
    persist(current)
    return true
  }

  const frtVisitTrader = (traderId: FrtTraderId): void => {
    let current = { ...state }
    current.traderVisits = current.traderVisits.map(v => {
      if (v.traderId !== traderId) return v
      return { ...v, lastVisitDay: current.dayCount }
    })
    persist(current)
  }

  // ─── Research Actions ──────────────────────────────────────

  const frtStartResearch = (researchId: string): boolean => {
    if (!frtCanStartResearch(state, researchId)) return false
    const def = FRT_RESEARCH_ITEMS.find(r => r.id === researchId)
    if (!def) return false
    let current = { ...state }
    current.resources = frtRemoveResources(current.resources, def.cost)
    current.research = {
      ...current.research,
      inProgress: researchId,
      progress: 0,
    }
    current = frtAddXp(current, 10)
    persist(current)
    return true
  }

  const frtCancelResearch = (): void => {
    if (!state.research.inProgress) return
    const def = FRT_RESEARCH_ITEMS.find(r => r.id === state.research.inProgress)
    if (!def) return
    let current = { ...state }
    current.resources = frtAddResources(current.resources, def.cost)
    current.research = {
      ...current.research,
      inProgress: null,
      progress: 0,
    }
    persist(current)
  }

  // ─── Settlement Actions ────────────────────────────────────

  const frtRenameSettlement = (name: string): void => {
    if (!name.trim()) return
    persist({ ...state, settlementName: name.trim() })
  }

  // ─── Reset Actions ─────────────────────────────────────────

  const frtReset = (): void => {
    const fresh = frtInitialState()
    persist(fresh)
  }

  const frtClearStorage = (): void => {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(FRT_STORAGE_KEY)
    } catch {
      // Silently fail
    }
    const fresh = frtInitialState()
    persist(fresh)
  }

  // ─── Gather Resources (manual) ────────────────────────────

  const frtGatherResources = (): Partial<Record<FrtResourceId, number>> => {
    const zoneDef = frtGetZoneDef(state.currentZone)
    const rng = frtSeedRandom(state.seed + state.dayCount * 17 + 3)
    const gathered: Partial<Record<FrtResourceId, number>> = {}
    for (const [resourceId, baseYield] of Object.entries(zoneDef.resourceYields)) {
      const key = resourceId as FrtResourceId
      const amount = Math.max(1, Math.floor((baseYield ?? 0) * (0.6 + rng() * 0.8)))
      gathered[key] = amount
    }
    let current = { ...state }
    current.resources = frtAddResources(current.resources, gathered)
    const totalGathered = frtCountResources(gathered)
    current.stats.totalResourcesGathered += totalGathered
    current = frtAddXp(current, Math.ceil(totalGathered * 0.5))
    persist(current)
    return gathered
  }

  // ─── Feed Settlement ──────────────────────────────────────

  const frtFeedSettlement = (): boolean => {
    if (state.resources.fish < 3 && state.resources.meat < 2) return false
    let current = { ...state }
    if (current.resources.fish >= 3) {
      current.resources.fish -= 3
    } else {
      current.resources.meat -= 2
    }
    current.meters = {
      ...current.meters,
      food: frtClamp(current.meters.food + 15, FRT_MIN_METER, FRT_MAX_METER),
      morale: frtClamp(current.meters.morale + 3, FRT_MIN_METER, FRT_MAX_METER),
    }
    persist(current)
    return true
  }

  // ─── Fetch Water ───────────────────────────────────────────

  const frtFetchWater = (): boolean => {
    let current = { ...state }
    const amount = 5 + current.buildings.ice_well * 3
    current.meters = {
      ...current.meters,
      water: frtClamp(current.meters.water + amount, FRT_MIN_METER, FRT_MAX_METER),
    }
    persist(current)
    return true
  }

  // ─── Use Medicine ──────────────────────────────────────────

  const frtUseMedicine = (): boolean => {
    if (state.resources.herb < 2) return false
    let current = { ...state }
    current.resources.herb -= 2
    current.meters = {
      ...current.meters,
      medicine: frtClamp(current.meters.medicine + 20, FRT_MIN_METER, FRT_MAX_METER),
      warmth: frtClamp(current.meters.warmth + 5, FRT_MIN_METER, FRT_MAX_METER),
    }
    current = frtCheckAchievements(current)
    persist(current)
    return true
  }

  // ─── Stoke Fire ────────────────────────────────────────────

  const frtStokeFire = (): boolean => {
    if (state.resources.wood < 5) return false
    let current = { ...state }
    current.resources.wood -= 5
    const warmthGain = 15 + current.buildings.hearth * 8
    current.meters = {
      ...current.meters,
      warmth: frtClamp(current.meters.warmth + warmthGain, FRT_MIN_METER, FRT_MAX_METER),
      morale: frtClamp(current.meters.morale + 5, FRT_MIN_METER, FRT_MAX_METER),
    }
    persist(current)
    return true
  }

  // ─── Boost Morale ──────────────────────────────────────────

  const frtBoostMorale = (): boolean => {
    if (state.resources.gold < 2) return false
    let current = { ...state }
    current.resources.gold -= 2
    current.meters = {
      ...current.meters,
      morale: frtClamp(current.meters.morale + 12, FRT_MIN_METER, FRT_MAX_METER),
    }
    persist(current)
    return true
  }

  // ─── Rest Action ───────────────────────────────────────────

  const frtRest = (): void => {
    let current = { ...state }
    const buildingBonus = frtGetBuildingBonus(current, 'warmth')
    const warmthRecovery = Math.floor(buildingBonus * 0.2) + 3
    current.meters = {
      ...current.meters,
      warmth: frtClamp(current.meters.warmth + warmthRecovery, FRT_MIN_METER, FRT_MAX_METER),
      morale: frtClamp(current.meters.morale + 2, FRT_MIN_METER, FRT_MAX_METER),
    }
    persist(current)
  }

  // ─── Scout Area ────────────────────────────────────────────

  const frtScoutArea = (): FrtAnimalId[] => {
    const zoneDef = frtGetZoneDef(state.currentZone)
    const rng = frtSeedRandom(state.seed + state.dayCount * 23 + 7)
    const spotted: FrtAnimalId[] = []
    for (const animalId of zoneDef.nativeAnimals) {
      const animalDef = frtGetAnimalDef(animalId)
      if (rng() < animalDef.encounterChance * 1.5) {
        spotted.push(animalId)
      }
    }
    let current = { ...state }
    for (const animalId of spotted) {
      if (!current.animalCatalog.discovered.includes(animalId)) {
        current.animalCatalog.discovered.push(animalId)
      }
    }
    current = frtAddXp(current, spotted.length * 5)
    current = frtCheckAchievements(current)
    persist(current)
    return spotted
  }

  // ─── Complete Daily Expedition Tracking ────────────────────

  const frtMarkDailyCompleted = (): void => {
    if (!state.dailyExpedition || state.dailyExpedition.completed) return
    const current: FrtGameState = {
      ...state,
      dailyExpedition: { ...state.dailyExpedition, completed: true },
    }
    persist(current)
  }

  return {
    state,
    persistTick,
    frtAdvanceDay,
    frtBuild,
    frtLaunchExpedition,
    frtCancelExpedition,
    frtTravel,
    frtConsumeResource,
    frtTrade,
    frtVisitTrader,
    frtStartResearch,
    frtCancelResearch,
    frtRenameSettlement,
    frtReset,
    frtClearStorage,
    frtGatherResources,
    frtFeedSettlement,
    frtFetchWater,
    frtUseMedicine,
    frtStokeFire,
    frtBoostMorale,
    frtRest,
    frtScoutArea,
    frtMarkDailyCompleted,
  }
}
