'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

/* ================================================================
   TYPES
   ================================================================ */

type GnRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
type GnPlantType = 'magical' | 'medicinal' | 'decorative' | 'elemental' | 'legendary'
type GnWeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'stormy' | 'magical' | 'moonlit' | 'foggy' | 'windy'
type GnDailyTaskType = 'harvest' | 'plant' | 'water' | 'explore' | 'befriend' | 'upgrade'

interface GnRarityInfo {
  id: GnRarityTier
  name: string
  color: string
  xpMultiplier: number
  seedWeight: number
}

interface GnPlant {
  id: string
  name: string
  type: GnPlantType
  rarity: GnRarityTier
  growthTime: number
  waterNeed: number
  yieldAmount: number
  xpReward: number
  naturePoints: number
  description: string
  seedCost: number
  zoneId: string
  color: string
}

interface GnZone {
  id: string
  name: string
  description: string
  unlockLevel: number
  plantIds: string[]
  creatureIds: string[]
  ambientColor: string
  weatherBonus: GnWeatherCondition
}

interface GnTool {
  id: string
  name: string
  description: string
  cost: number
  bonusType: string
  bonusValue: number
  requiredLevel: number
  category: 'digging' | 'watering' | 'fertilizing' | 'pruning' | 'protection' | 'special'
  color: string
}

interface GnStructure {
  id: string
  name: string
  description: string
  baseCost: number
  maxLevel: number
  bonusType: string
  bonusPerLevel: number
  upgradeCostMultiplier: number
  requiredLevel: number
}

interface GnAbility {
  id: string
  name: string
  description: string
  cooldown: number
  duration: number
  manaCost: number
  effectType: string
  effectValue: number
  requiredLevel: number
  rarity: GnRarityTier
  color: string
}

interface GnAchievement {
  id: string
  name: string
  description: string
  conditionKey: string
  targetValue: number
  rewardNaturePoints: number
  rewardEnergy: number
}

interface GnTitle {
  id: string
  name: string
  requiredReputation: number
  description: string
  bonusType: string
  bonusValue: number
}

interface GnCreature {
  id: string
  name: string
  zoneId: string
  description: string
  rarity: GnRarityTier
  friendshipThreshold: number
  xpReward: number
  naturePointReward: number
  itemDrop: string
}

interface GnPlantedPlot {
  plotId: string
  plantId: string | null
  plantedAt: number | null
  wateredAt: number | null
  fertilized: boolean
  growthProgress: number
}

interface GnZoneState {
  unlocked: boolean
  explorationProgress: number
  creaturesDiscovered: number
  lastExplored: number | null
}

interface GnStructureState {
  built: boolean
  level: number
  builtAt: number | null
}

interface GnAbilityState {
  unlocked: boolean
  lastUsed: number | null
  totalUses: number
}

interface GnAchievementState {
  unlocked: boolean
  unlockedAt: number | null
}

interface GnToolState {
  owned: boolean
  uses: number
}

interface GnCreatureState {
  discovered: boolean
  friendship: number
  befriended: boolean
  lastFed: number | null
  feedCount: number
}

interface GnDailyTask {
  type: GnDailyTaskType | null
  progress: number
  target: number
  completed: boolean
  lastDate: string | null
  rewardNaturePoints: number
  rewardEnergy: number
}

interface GnColorTheme {
  emerald: string
  lime: string
  earthBrown: string
  skyBlue: string
  flowerPink: string
}

interface GnGardenState {
  plants: Record<string, GnPlantedPlot>
  zones: Record<string, GnZoneState>
  tools: Record<string, GnToolState>
  structures: Record<string, GnStructureState>
  abilities: Record<string, GnAbilityState>
  achievements: Record<string, GnAchievementState>
  creatures: Record<string, GnCreatureState>
  currentZone: string
  gardenEnergy: number
  maxEnergy: number
  naturePoints: number
  harvestCount: number
  seedsCollected: number
  plantsGrown: number
  totalPlanted: number
  totalWatered: number
  totalFertilized: number
  totalComposted: number
  totalExplored: number
  totalCreaturesBefriended: number
  totalAbilitiesUsed: number
  totalStructuresBuilt: number
  titleIndex: number
  gardenReputation: number
  weatherCondition: GnWeatherCondition
  dailyTask: GnDailyTask
  activeAbility: string | null
  activeAbilityExpiry: number | null
  compostBinAmount: number
  treasureFound: number
  lastSaveTime: number
  sessionStart: number
  playTimeMinutes: number
}

/* ================================================================
   MODULE-LEVEL CONSTANTS (not exported)
   ================================================================ */

const GN_SAVE_KEY = 'gnome-garden-save'
const GN_MAX_ENERGY = 200
const GN_ENERGY_REGEN_MS = 300000
const GN_AUTO_SAVE_INTERVAL = 30000
const GN_MAX_TITLE_INDEX = 7
const GN_MAX_STRUCTURE_LEVEL = 10
const GN_PLOT_COUNT = 24
const GN_WEATHER_CHANGE_INTERVAL = 180000
const GN_DAILY_TASK_WINDOW = 86400000
const GN_COMPOST_TO_NP_RATIO = 0.5
const GN_MAX_COMPOST_BIN = 100
const GN_BASE_NATURE_POINTS = 0

const GN_COLOR_THEME: GnColorTheme = {
  emerald: '#00C853',
  lime: '#AEEA00',
  earthBrown: '#795548',
  skyBlue: '#81D4FA',
  flowerPink: '#F48FB1',
}

const GN_RARITY: Record<GnRarityTier, GnRarityInfo> = {
  common: { id: 'common', name: 'Common', color: '#AEEA00', xpMultiplier: 1, seedWeight: 45 },
  uncommon: { id: 'uncommon', name: 'Uncommon', color: '#81D4FA', xpMultiplier: 1.5, seedWeight: 30 },
  rare: { id: 'rare', name: 'Rare', color: '#00C853', xpMultiplier: 2.5, seedWeight: 16 },
  epic: { id: 'epic', name: 'Epic', color: '#F48FB1', xpMultiplier: 4, seedWeight: 7 },
  legendary: { id: 'legendary', name: 'Legendary', color: '#FFD54F', xpMultiplier: 7, seedWeight: 2 },
}

/* ================================================================
   35 MAGICAL PLANTS
   ================================================================ */

const GN_PLANTS: GnPlant[] = [
  // Common (7)
  {
    id: 'moonpetal-mushroom', name: 'Moonpetal Mushroom', type: 'magical', rarity: 'common',
    growthTime: 60000, waterNeed: 2, yieldAmount: 3, xpReward: 10, naturePoints: 2,
    description: 'A silvery mushroom whose cap opens only under moonlight, emitting a soft glow.',
    seedCost: 5, zoneId: 'mushroom-meadow', color: '#C5CAE9',
  },
  {
    id: 'glowroot-fern', name: 'Glowroot Fern', type: 'medicinal', rarity: 'common',
    growthTime: 45000, waterNeed: 1, yieldAmount: 4, xpReward: 8, naturePoints: 2,
    description: 'Ferns with luminescent roots used by gnomes as natural torches and healing poultices.',
    seedCost: 4, zoneId: 'mossy-hollow', color: '#76FF03',
  },
  {
    id: 'dewdrop-orchid', name: 'Dewdrop Orchid', type: 'decorative', rarity: 'common',
    growthTime: 50000, waterNeed: 2, yieldAmount: 3, xpReward: 9, naturePoints: 2,
    description: 'Tiny orchids that collect morning dew and release it as sweet nectar.',
    seedCost: 5, zoneId: 'sunlit-clearing', color: '#F8BBD0',
  },
  {
    id: 'bramblebloom', name: 'Bramblebloom', type: 'magical', rarity: 'common',
    growthTime: 55000, waterNeed: 2, yieldAmount: 3, xpReward: 10, naturePoints: 3,
    description: 'Tangled brambles that produce small purple flowers with restorative properties.',
    seedCost: 4, zoneId: 'root-cellar', color: '#CE93D8',
  },
  {
    id: 'sagegrass', name: 'Sagegrass', type: 'medicinal', rarity: 'common',
    growthTime: 40000, waterNeed: 1, yieldAmount: 5, xpReward: 7, naturePoints: 2,
    description: 'Fragrant grass that gnomes weave into calming wreaths and herbal teas.',
    seedCost: 3, zoneId: 'mossy-hollow', color: '#A5D6A7',
  },
  {
    id: 'honeydew-vine', name: 'Honeydew Vine', type: 'medicinal', rarity: 'common',
    growthTime: 65000, waterNeed: 3, yieldAmount: 4, xpReward: 12, naturePoints: 3,
    description: 'A climbing vine that produces golden melons filled with enchanted honeydew.',
    seedCost: 6, zoneId: 'sunlit-clearing', color: '#FFF176',
  },
  {
    id: 'copper-vein-ivy', name: 'Copper-vein Ivy', type: 'decorative', rarity: 'common',
    growthTime: 50000, waterNeed: 1, yieldAmount: 4, xpReward: 8, naturePoints: 2,
    description: 'Ivy with copper-colored veins that gnomes use to decorate mushroom houses.',
    seedCost: 4, zoneId: 'mushroom-meadow', color: '#BCAAA4',
  },
  // Uncommon (7)
  {
    id: 'crystal-bloom', name: 'Crystal Bloom', type: 'elemental', rarity: 'uncommon',
    growthTime: 90000, waterNeed: 2, yieldAmount: 3, xpReward: 22, naturePoints: 5,
    description: 'Translucent flowers that refract light into prismatic patterns. Gnome jewelers prize them.',
    seedCost: 15, zoneId: 'crystal-grotto', color: '#80DEEA',
  },
  {
    id: 'ember-moss', name: 'Ember Moss', type: 'elemental', rarity: 'uncommon',
    growthTime: 80000, waterNeed: 1, yieldAmount: 3, xpReward: 20, naturePoints: 5,
    description: 'Warm moss that smolders with gentle heat. Gnomes use it to warm underground homes.',
    seedCost: 12, zoneId: 'root-cellar', color: '#FF8A65',
  },
  {
    id: 'frostberry-bush', name: 'Frostberry Bush', type: 'medicinal', rarity: 'uncommon',
    growthTime: 100000, waterNeed: 3, yieldAmount: 4, xpReward: 25, naturePoints: 6,
    description: 'Bushes bearing icy berries that never melt, used to brew frost-resistant potions.',
    seedCost: 18, zoneId: 'crystal-pond', color: '#B3E5FC',
  },
  {
    id: 'thunderleaf-sage', name: 'Thunderleaf Sage', type: 'elemental', rarity: 'uncommon',
    growthTime: 85000, waterNeed: 2, yieldAmount: 3, xpReward: 23, naturePoints: 5,
    description: 'Sage plants whose leaves crackle with static. Shamans harvest them during storms.',
    seedCost: 14, zoneId: 'mushroom-meadow', color: '#FFF59D',
  },
  {
    id: 'sunbeam-dahlia', name: 'Sunbeam Dahlia', type: 'magical', rarity: 'uncommon',
    growthTime: 95000, waterNeed: 2, yieldAmount: 3, xpReward: 24, naturePoints: 6,
    description: 'Golden dahlias that store sunlight and release it as warm beams at night.',
    seedCost: 16, zoneId: 'sunlit-clearing', color: '#FFD54F',
  },
  {
    id: 'violet-snapdragon', name: 'Violet Snapdragon', type: 'decorative', rarity: 'uncommon',
    growthTime: 80000, waterNeed: 2, yieldAmount: 4, xpReward: 21, naturePoints: 5,
    description: 'Dragon-shaped flowers that snap playfully when gnomes walk past them.',
    seedCost: 13, zoneId: 'mossy-hollow', color: '#B39DDB',
  },
  {
    id: 'amber-honey-sage', name: 'Amber Honey Sage', type: 'medicinal', rarity: 'uncommon',
    growthTime: 90000, waterNeed: 2, yieldAmount: 3, xpReward: 22, naturePoints: 5,
    description: 'Rich amber-colored sage that produces honey-scented pollen with healing properties.',
    seedCost: 14, zoneId: 'ancient-grove', color: '#FFB74D',
  },
  // Rare (7)
  {
    id: 'starflower-vine', name: 'Starflower Vine', type: 'magical', rarity: 'rare',
    growthTime: 150000, waterNeed: 3, yieldAmount: 2, xpReward: 55, naturePoints: 12,
    description: 'A climbing vine adorned with flowers shaped like five-pointed stars that glow at night.',
    seedCost: 45, zoneId: 'ancient-grove', color: '#FFF9C4',
  },
  {
    id: 'prismatic-clover', name: 'Prismatic Clover', type: 'magical', rarity: 'rare',
    growthTime: 140000, waterNeed: 2, yieldAmount: 3, xpReward: 50, naturePoints: 11,
    description: 'Four-leaf clovers that shift through rainbow colors. Finding one grants nature luck.',
    seedCost: 40, zoneId: 'crystal-pond', color: '#E1BEE7',
  },
  {
    id: 'ancient-oak-sprout', name: 'Ancient Oak Sprout', type: 'legendary', rarity: 'rare',
    growthTime: 200000, waterNeed: 4, yieldAmount: 1, xpReward: 65, naturePoints: 15,
    description: 'A sapling descended from the first oak tree. Grows impossibly slowly but is indestructible.',
    seedCost: 60, zoneId: 'ancient-grove', color: '#8D6E63',
  },
  {
    id: 'whisper-willow-sapling', name: 'Whisper-Willow Sapling', type: 'magical', rarity: 'rare',
    growthTime: 180000, waterNeed: 3, yieldAmount: 2, xpReward: 58, naturePoints: 13,
    description: 'A willow whose leaves murmur gnomish secrets when the wind blows through them.',
    seedCost: 50, zoneId: 'crystal-pond', color: '#AED581',
  },
  {
    id: 'dragonscale-fern', name: 'Dragonscale Fern', type: 'elemental', rarity: 'rare',
    growthTime: 160000, waterNeed: 2, yieldAmount: 2, xpReward: 52, naturePoints: 12,
    description: 'Ferns with impossibly hard fronds that shimmer like dragon scales in the light.',
    seedCost: 42, zoneId: 'root-cellar', color: '#90A4AE',
  },
  {
    id: 'spiritbloom-rose', name: 'Spiritbloom Rose', type: 'magical', rarity: 'rare',
    growthTime: 170000, waterNeed: 3, yieldAmount: 2, xpReward: 55, naturePoints: 13,
    description: 'Roses that attract friendly spirits. Their petals can phase through solid matter.',
    seedCost: 48, zoneId: 'hidden-sanctum', color: '#F48FB1',
  },
  {
    id: 'chronoseed-pine', name: 'Chronoseed Pine', type: 'elemental', rarity: 'rare',
    growthTime: 190000, waterNeed: 3, yieldAmount: 1, xpReward: 60, naturePoints: 14,
    description: 'A miniature pine whose cones contain seeds that briefly slow time around them.',
    seedCost: 55, zoneId: 'ancient-grove', color: '#78909C',
  },
  // Epic (7)
  {
    id: 'phoenix-flame-lily', name: 'Phoenix Flame Lily', type: 'elemental', rarity: 'epic',
    growthTime: 300000, waterNeed: 4, yieldAmount: 1, xpReward: 120, naturePoints: 30,
    description: 'A lily wreathed in eternal flame that never burns. Reborn from its own ashes each dawn.',
    seedCost: 150, zoneId: 'hidden-sanctum', color: '#FF5722',
  },
  {
    id: 'void-lotus', name: 'Void Lotus', type: 'magical', rarity: 'epic',
    growthTime: 280000, waterNeed: 3, yieldAmount: 1, xpReward: 110, naturePoints: 28,
    description: 'A black lotus that grows in spaces between dimensions. Staring into its center reveals infinity.',
    seedCost: 140, zoneId: 'hidden-sanctum', color: '#37474F',
  },
  {
    id: 'celestial-orchid', name: 'Celestial Orchid', type: 'magical', rarity: 'epic',
    growthTime: 260000, waterNeed: 3, yieldAmount: 2, xpReward: 105, naturePoints: 25,
    description: 'Orchids that bloom only when stars align. Their fragrance grants prophetic dreams.',
    seedCost: 130, zoneId: 'crystal-grotto', color: '#E8EAF6',
  },
  {
    id: 'worldtree-seedling', name: 'Worldtree Seedling', type: 'legendary', rarity: 'epic',
    growthTime: 360000, waterNeed: 5, yieldAmount: 1, xpReward: 150, naturePoints: 35,
    description: 'A seedling from the great Worldtree that connects all underground gnome gardens.',
    seedCost: 200, zoneId: 'ancient-grove', color: '#33691E',
  },
  {
    id: 'shadow-thorn-bramble', name: 'Shadow Thorn Bramble', type: 'magical', rarity: 'epic',
    growthTime: 250000, waterNeed: 2, yieldAmount: 2, xpReward: 100, naturePoints: 24,
    description: 'Thorny brambles that grow in shadow, creating protective barriers against intruders.',
    seedCost: 120, zoneId: 'root-cellar', color: '#4A148C',
  },
  {
    id: 'aurora-crystalrose', name: 'Aurora Crystalrose', type: 'elemental', rarity: 'epic',
    growthTime: 270000, waterNeed: 3, yieldAmount: 2, xpReward: 108, naturePoints: 26,
    description: 'Crystalline roses that display aurora-like colors. They power gnome light networks.',
    seedCost: 135, zoneId: 'crystal-grotto', color: '#80CBC4',
  },
  {
    id: 'tempest-bamboo', name: 'Tempest Bamboo', type: 'elemental', rarity: 'epic',
    growthTime: 240000, waterNeed: 4, yieldAmount: 2, xpReward: 95, naturePoints: 23,
    description: 'Bamboo that channels storm energy. When struck, it releases miniature lightning bolts.',
    seedCost: 115, zoneId: 'crystal-pond', color: '#26C6DA',
  },
  // Legendary (7)
  {
    id: 'eternal-evergreen', name: 'Eternal Evergreen', type: 'legendary', rarity: 'legendary',
    growthTime: 600000, waterNeed: 5, yieldAmount: 1, xpReward: 300, naturePoints: 75,
    description: 'An evergreen that never loses its needles and radiates life energy across the entire garden.',
    seedCost: 500, zoneId: 'hidden-sanctum', color: '#1B5E20',
  },
  {
    id: 'gnome-kings-crown', name: "Gnome King's Crown", type: 'legendary', rarity: 'legendary',
    growthTime: 500000, waterNeed: 4, yieldAmount: 1, xpReward: 280, naturePoints: 70,
    description: 'A golden flower shaped like a crown. Only the most renowned gnomes can grow it.',
    seedCost: 450, zoneId: 'hidden-sanctum', color: '#FFD600',
  },
  {
    id: 'worldroot-oak', name: 'Worldroot Oak', type: 'legendary', rarity: 'legendary',
    growthTime: 700000, waterNeed: 6, yieldAmount: 1, xpReward: 350, naturePoints: 90,
    description: 'The ancestor of all underground oaks. Its roots connect every gnome garden in the world.',
    seedCost: 600, zoneId: 'ancient-grove', color: '#4E342E',
  },
  {
    id: 'starweave-blossom', name: 'Starweave Blossom', type: 'magical', rarity: 'legendary',
    growthTime: 550000, waterNeed: 5, yieldAmount: 1, xpReward: 320, naturePoints: 80,
    description: 'Blossoms woven from starlight threads. They spin tiny constellations around themselves.',
    seedCost: 550, zoneId: 'crystal-grotto', color: '#F3E5F5',
  },
  {
    id: 'timeless-sundew', name: 'Timeless Sundew', type: 'legendary', rarity: 'legendary',
    growthTime: 480000, waterNeed: 4, yieldAmount: 2, xpReward: 290, naturePoints: 72,
    description: 'A sundew that traps insects in time bubbles rather than sticky dew. Feeds across centuries.',
    seedCost: 480, zoneId: 'crystal-pond', color: '#C6FF00',
  },
  {
    id: 'dreamcatcher-vine', name: 'Dreamcatcher Vine', type: 'magical', rarity: 'legendary',
    growthTime: 520000, waterNeed: 4, yieldAmount: 1, xpReward: 310, naturePoints: 78,
    description: 'A vine whose net-like growth catches dreams and turns them into glowing berries.',
    seedCost: 520, zoneId: 'mossy-hollow', color: '#7C4DFF',
  },
  {
    id: 'genesis-seed-pod', name: 'Genesis Seed Pod', type: 'legendary', rarity: 'legendary',
    growthTime: 800000, waterNeed: 7, yieldAmount: 1, xpReward: 400, naturePoints: 100,
    description: 'The mythical first plant. Contains the seeds of all other magical plants within its pod.',
    seedCost: 800, zoneId: 'hidden-sanctum', color: '#FF6F00',
  },
]

/* ================================================================
   8 GARDEN ZONES
   ================================================================ */

const GN_ZONES: GnZone[] = [
  {
    id: 'mushroom-meadow',
    name: 'Mushroom Meadow',
    description: 'A sprawling meadow dotted with giant mushrooms and bioluminescent fungi where gnomes first learn to garden.',
    unlockLevel: 1,
    plantIds: ['moonpetal-mushroom', 'copper-vein-ivy', 'thunderleaf-sage', 'bramblebloom'],
    creatureIds: ['mushroom-beetle', 'spore-fairy', 'glow-moth', 'garden-snail'],
    ambientColor: '#00C853',
    weatherBonus: 'sunny',
  },
  {
    id: 'crystal-grotto',
    name: 'Crystal Grotto',
    description: 'A shimmering underground cavern lined with crystals that amplify plant growth through refracted light.',
    unlockLevel: 5,
    plantIds: ['crystal-bloom', 'celestial-orchid', 'aurora-crystalrose', 'starweave-blossom'],
    creatureIds: ['gem-sprite', 'crystal-spider', 'prism-worm'],
    ambientColor: '#81D4FA',
    weatherBonus: 'magical',
  },
  {
    id: 'root-cellar',
    name: 'Root Cellar',
    description: 'A deep underground chamber where ancient roots criss-cross through fertile dark soil.',
    unlockLevel: 8,
    plantIds: ['bramblebloom', 'ember-moss', 'dragonscale-fern', 'shadow-thorn-bramble'],
    creatureIds: ['root-worm', 'earth-gnome', 'stone-beetle'],
    ambientColor: '#795548',
    weatherBonus: 'foggy',
  },
  {
    id: 'sunlit-clearing',
    name: 'Sunlit Clearing',
    description: 'A rare opening in the underground where sunlight streams through cracks, warming the soil.',
    unlockLevel: 3,
    plantIds: ['dewdrop-orchid', 'honeydew-vine', 'sunbeam-dahlia', 'sagegrass'],
    creatureIds: ['sunbeam-fairy', 'golden-butterfly', 'dew-sprite'],
    ambientColor: '#FFD54F',
    weatherBonus: 'sunny',
  },
  {
    id: 'mossy-hollow',
    name: 'Mossy Hollow',
    description: 'A damp, verdant hollow carpeted in soft moss where gentle streams wind through fern groves.',
    unlockLevel: 2,
    plantIds: ['glowroot-fern', 'sagegrass', 'violet-snapdragon', 'dreamcatcher-vine'],
    creatureIds: ['moss-gnome', 'fern-owl', 'hopping-toad'],
    ambientColor: '#AEEA00',
    weatherBonus: 'rainy',
  },
  {
    id: 'crystal-pond',
    name: 'Crystal Pond',
    description: 'A still underground pond fed by mineral springs, surrounded by water-loving magical flora.',
    unlockLevel: 10,
    plantIds: ['frostberry-bush', 'prismatic-clover', 'whisper-willow-sapling', 'tempest-bamboo', 'timeless-sundew'],
    creatureIds: ['pond-spirit', 'crystal-frog', 'water-nymph'],
    ambientColor: '#4FC3F7',
    weatherBonus: 'moonlit',
  },
  {
    id: 'ancient-grove',
    name: 'Ancient Grove',
    description: 'The oldest part of the garden where ancient trees tower and the air thrums with deep magic.',
    unlockLevel: 15,
    plantIds: ['amber-honey-sage', 'starflower-vine', 'ancient-oak-sprout', 'chronoseed-pine', 'worldtree-seedling', 'worldroot-oak'],
    creatureIds: ['ancient-treant', 'forest-wisp', 'bark-fox'],
    ambientColor: '#2E7D32',
    weatherBonus: 'windy',
  },
  {
    id: 'hidden-sanctum',
    name: 'Hidden Sanctum',
    description: 'The most secret garden chamber accessible only to the most dedicated gnomes. Legendary plants grow here.',
    unlockLevel: 25,
    plantIds: ['spiritbloom-rose', 'phoenix-flame-lily', 'void-lotus', 'eternal-evergreen', 'gnome-kings-crown', 'genesis-seed-pod'],
    creatureIds: ['sanctum-guardian', 'spirit-peacock', 'time-fairy'],
    ambientColor: '#E040FB',
    weatherBonus: 'magical',
  },
]

/* ================================================================
   30 GARDENING TOOLS / SUPPLIES
   ================================================================ */

const GN_TOOLS: GnTool[] = [
  { id: 'enchanted-trowel', name: 'Enchanted Trowel', description: 'A trowel that never dulls and loosens perfect soil.', cost: 0, bonusType: 'dig_speed', bonusValue: 10, requiredLevel: 1, category: 'digging', color: '#AEEA00' },
  { id: 'gnome-watering-can', name: 'Gnome Watering Can', description: 'A miniature copper can that produces enchanted water.', cost: 0, bonusType: 'water_efficiency', bonusValue: 15, requiredLevel: 1, category: 'watering', color: '#81D4FA' },
  { id: 'fertilizer-of-growth', name: 'Fertilizer of Growth', description: 'Magical fertilizer that accelerates growth by 20%.', cost: 50, bonusType: 'growth_speed', bonusValue: 20, requiredLevel: 3, category: 'fertilizing', color: '#00C853' },
  { id: 'pruning-shears', name: 'Pruning Shears', description: 'Magical shears that encourage new growth when used.', cost: 30, bonusType: 'yield_bonus', bonusValue: 10, requiredLevel: 2, category: 'pruning', color: '#795548' },
  { id: 'seed-pouch', name: 'Seed Pouch', description: 'An expandable pouch that holds unlimited seeds.', cost: 20, bonusType: 'seed_capacity', bonusValue: 50, requiredLevel: 1, category: 'special', color: '#FFD54F' },
  { id: 'garden-gloves', name: 'Garden Gloves', description: 'Gloves woven from thorn-free vines that protect hands.', cost: 25, bonusType: 'thorn_protection', bonusValue: 100, requiredLevel: 1, category: 'protection', color: '#BCAAA4' },
  { id: 'magnifying-glass', name: 'Magnifying Glass', description: 'Reveals hidden pests and disease on plants early.', cost: 40, bonusType: 'pest_detection', bonusValue: 80, requiredLevel: 4, category: 'special', color: '#90CAF9' },
  { id: 'compost-bin', name: 'Compost Bin', description: 'Converts garden waste into nutrient-rich compost.', cost: 60, bonusType: 'compost_speed', bonusValue: 25, requiredLevel: 5, category: 'fertilizing', color: '#8D6E63' },
  { id: 'bug-repellent-spray', name: 'Bug Repellent Spray', description: 'Natural spray that keeps garden pests at bay.', cost: 35, bonusType: 'pest_resistance', bonusValue: 50, requiredLevel: 3, category: 'protection', color: '#66BB6A' },
  { id: 'sun-catching-lantern', name: 'Sun-catching Lantern', description: 'Stores sunlight for underground plants needing extra light.', cost: 80, bonusType: 'light_bonus', bonusValue: 30, requiredLevel: 6, category: 'special', color: '#FFF176' },
  { id: 'moon-shade-parasol', name: 'Moon-shade Parasol', description: 'Creates filtered moonlight perfect for nocturnal blooms.', cost: 90, bonusType: 'moonlight_bonus', bonusValue: 30, requiredLevel: 7, category: 'special', color: '#B39DDB' },
  { id: 'earth-rich-soil-bag', name: 'Earth-rich Soil Bag', description: 'A bag of enchanted soil from the deepest garden layers.', cost: 70, bonusType: 'soil_quality', bonusValue: 20, requiredLevel: 5, category: 'fertilizing', color: '#5D4037' },
  { id: 'crystal-watering-globe', name: 'Crystal Watering Globe', description: 'Slowly releases crystal-infused water over time.', cost: 100, bonusType: 'auto_water', bonusValue: 10, requiredLevel: 8, category: 'watering', color: '#80DEEA' },
  { id: 'herbal-pest-deterrent', name: 'Herbal Pest Deterrent', description: 'A ring of aromatic herbs that naturally repels pests.', cost: 55, bonusType: 'pest_resistance', bonusValue: 75, requiredLevel: 6, category: 'protection', color: '#AED581' },
  { id: 'weatherstone-charm', name: 'Weatherstone Charm', description: 'A charm that slightly influences weather to benefit plants.', cost: 120, bonusType: 'weather_luck', bonusValue: 15, requiredLevel: 10, category: 'special', color: '#78909C' },
  { id: 'growth-o-matic-sprayer', name: 'Growth-o-Matic Sprayer', description: 'Gnome-engineered sprayer that coats plants in growth solution.', cost: 150, bonusType: 'growth_speed', bonusValue: 35, requiredLevel: 12, category: 'fertilizing', color: '#FF7043' },
  { id: 'rainbow-sprinkler', name: 'Rainbow Sprinkler', description: 'A sprinkler that waters plants with rainbow-tinted dew.', cost: 130, bonusType: 'water_efficiency', bonusValue: 40, requiredLevel: 11, category: 'watering', color: '#CE93D8' },
  { id: 'frost-shield-netting', name: 'Frost Shield Netting', description: 'Protects plants from frost damage with a magical barrier.', cost: 85, bonusType: 'frost_protection', bonusValue: 90, requiredLevel: 9, category: 'protection', color: '#B3E5FC' },
  { id: 'root-bound-anchor', name: 'Root-bound Anchor', description: 'Stabilizes plants with deep roots against underground tremors.', cost: 75, bonusType: 'root_stability', bonusValue: 60, requiredLevel: 8, category: 'special', color: '#A1887F' },
  { id: 'prismatic-fertilizer', name: 'Prismatic Fertilizer', description: 'Multi-colored fertilizer that boosts all plant attributes.', cost: 200, bonusType: 'all_bonus', bonusValue: 15, requiredLevel: 14, category: 'fertilizing', color: '#F48FB1' },
  { id: 'gnome-forged-hoe', name: 'Gnome-forged Hoe', description: 'A masterwork hoe that breaks through any soil with ease.', cost: 110, bonusType: 'dig_speed', bonusValue: 35, requiredLevel: 9, category: 'digging', color: '#78909C' },
  { id: 'trellis-builder-kit', name: 'Trellis Builder Kit', description: 'Builds instant trellises for climbing plants.', cost: 65, bonusType: 'climbing_support', bonusValue: 50, requiredLevel: 6, category: 'special', color: '#6D4C41' },
  { id: 'underground-sensor', name: 'Underground Sensor', description: 'Detects soil moisture and nutrient levels at a glance.', cost: 90, bonusType: 'soil_detection', bonusValue: 70, requiredLevel: 7, category: 'special', color: '#4DB6AC' },
  { id: 'seed-sorting-hat', name: 'Seed-sorting Hat', description: 'A sentient hat that organizes and catalogs all your seeds.', cost: 140, bonusType: 'seed_sorting', bonusValue: 40, requiredLevel: 11, category: 'special', color: '#7E57C2' },
  { id: 'harvest-basket', name: 'Harvest Basket', description: 'An enchanted basket that keeps harvested items perfectly fresh.', cost: 50, bonusType: 'harvest_quality', bonusValue: 20, requiredLevel: 3, category: 'special', color: '#D7CCC8' },
  { id: 'bloom-o-meter', name: 'Bloom-o-Meter', description: 'Measures the exact bloom readiness of every plant.', cost: 95, bonusType: 'bloom_detection', bonusValue: 85, requiredLevel: 8, category: 'special', color: '#F06292' },
  { id: 'petal-collector', name: 'Petal Collector', description: 'Gently gathers fallen petals for crafting and composting.', cost: 45, bonusType: 'petal_collection', bonusValue: 30, requiredLevel: 4, category: 'special', color: '#F8BBD0' },
  { id: 'soil-testing-kit', name: 'Soil-testing Kit', description: 'Analyzes soil composition and recommends ideal plants.', cost: 70, bonusType: 'soil_analysis', bonusValue: 65, requiredLevel: 6, category: 'special', color: '#A1887F' },
  { id: 'mushroom-spore-spreader', name: 'Mushroom Spore Spreader', description: 'Evenly distributes mushroom spores for optimal growth.', cost: 80, bonusType: 'spore_spread', bonusValue: 45, requiredLevel: 7, category: 'special', color: '#81C784' },
  { id: 'ancient-garden-key', name: 'Ancient Garden Key', description: 'A mysterious key that unlocks hidden garden passages.', cost: 300, bonusType: 'exploration_bonus', bonusValue: 25, requiredLevel: 18, category: 'special', color: '#FFD700' },
]

/* ================================================================
   25 GARDEN STRUCTURES
   ================================================================ */

const GN_STRUCTURES: GnStructure[] = [
  { id: 'mushroom-house', name: 'Mushroom House', description: 'A cozy dwelling inside a giant mushroom, the heart of any gnome garden.', baseCost: 100, maxLevel: 10, bonusType: 'energy_regen', bonusPerLevel: 5, upgradeCostMultiplier: 1.8, requiredLevel: 1 },
  { id: 'greenhouse', name: 'Greenhouse', description: 'A crystal-walled structure that protects plants from weather and boosts growth.', baseCost: 150, maxLevel: 10, bonusType: 'growth_speed', bonusPerLevel: 3, upgradeCostMultiplier: 1.9, requiredLevel: 3 },
  { id: 'compost-station', name: 'Compost Station', description: 'Converts waste into valuable compost for the garden.', baseCost: 80, maxLevel: 10, bonusType: 'compost_rate', bonusPerLevel: 8, upgradeCostMultiplier: 1.6, requiredLevel: 2 },
  { id: 'gnome-workshop', name: 'Gnome Workshop', description: 'Where gnomes craft tools and garden supplies.', baseCost: 200, maxLevel: 10, bonusType: 'craft_speed', bonusPerLevel: 4, upgradeCostMultiplier: 2.0, requiredLevel: 5 },
  { id: 'tool-shed', name: 'Tool Shed', description: 'Stores and organizes all gardening tools efficiently.', baseCost: 60, maxLevel: 10, bonusType: 'tool_durability', bonusPerLevel: 5, upgradeCostMultiplier: 1.5, requiredLevel: 1 },
  { id: 'seed-vault', name: 'Seed Vault', description: 'A climate-controlled vault preserving rare and valuable seeds.', baseCost: 180, maxLevel: 10, bonusType: 'seed_quality', bonusPerLevel: 3, upgradeCostMultiplier: 1.8, requiredLevel: 4 },
  { id: 'weather-station', name: 'Weather Station', description: 'A tower with instruments that predict and influence garden weather.', baseCost: 250, maxLevel: 10, bonusType: 'weather_control', bonusPerLevel: 4, upgradeCostMultiplier: 2.1, requiredLevel: 8 },
  { id: 'crystal-fountain', name: 'Crystal Fountain', description: 'A fountain flowing with enchanted water that nourishes all nearby plants.', baseCost: 300, maxLevel: 10, bonusType: 'auto_water_radius', bonusPerLevel: 1, upgradeCostMultiplier: 2.2, requiredLevel: 10 },
  { id: 'gazebo', name: 'Gazebo', description: 'A peaceful resting spot that restores garden energy faster.', baseCost: 120, maxLevel: 10, bonusType: 'energy_restore', bonusPerLevel: 6, upgradeCostMultiplier: 1.7, requiredLevel: 4 },
  { id: 'windmill', name: 'Windmill', description: 'Harnesses underground air currents to power garden mechanisms.', baseCost: 220, maxLevel: 10, bonusType: 'passive_nature_points', bonusPerLevel: 2, upgradeCostMultiplier: 2.0, requiredLevel: 7 },
  { id: 'potting-bench', name: 'Potting Bench', description: 'A sturdy bench for repotting and propagating plants efficiently.', baseCost: 70, maxLevel: 10, bonusType: 'propagation_speed', bonusPerLevel: 4, upgradeCostMultiplier: 1.5, requiredLevel: 2 },
  { id: 'greenhouse-extension', name: 'Greenhouse Extension', description: 'Expands the greenhouse to accommodate more rare plants.', baseCost: 280, maxLevel: 10, bonusType: 'rare_growth_bonus', bonusPerLevel: 5, upgradeCostMultiplier: 2.0, requiredLevel: 9 },
  { id: 'underground-tunnel', name: 'Underground Tunnel', description: 'Connects garden zones, reducing travel time between them.', baseCost: 160, maxLevel: 10, bonusType: 'travel_speed', bonusPerLevel: 8, upgradeCostMultiplier: 1.8, requiredLevel: 6 },
  { id: 'moonlight-canopy', name: 'Moonlight Canopy', description: 'A canopy that captures and concentrates moonlight for nocturnal plants.', baseCost: 200, maxLevel: 10, bonusType: 'moonlight_bonus', bonusPerLevel: 4, upgradeCostMultiplier: 1.9, requiredLevel: 7 },
  { id: 'trellis-archway', name: 'Trellis Archway', description: 'A beautiful archway supporting climbing vines and flowering plants.', baseCost: 90, maxLevel: 10, bonusType: 'climbing_yield', bonusPerLevel: 5, upgradeCostMultiplier: 1.6, requiredLevel: 3 },
  { id: 'garden-library', name: 'Garden Library', description: 'Houses ancient botanical tomes that boost plant knowledge.', baseCost: 350, maxLevel: 10, bonusType: 'xp_bonus', bonusPerLevel: 3, upgradeCostMultiplier: 2.3, requiredLevel: 12 },
  { id: 'herb-dryer-rack', name: 'Herb Dryer Rack', description: 'Dries herbs perfectly while preserving their magical properties.', baseCost: 55, maxLevel: 10, bonusType: 'herb_quality', bonusPerLevel: 6, upgradeCostMultiplier: 1.4, requiredLevel: 2 },
  { id: 'root-cellar-structure', name: 'Root Cellar', description: 'A cool underground storage room for preserving harvested goods.', baseCost: 100, maxLevel: 10, bonusType: 'harvest_preservation', bonusPerLevel: 7, upgradeCostMultiplier: 1.6, requiredLevel: 3 },
  { id: 'observation-deck', name: 'Observation Deck', description: 'An elevated platform for surveying the entire garden at once.', baseCost: 180, maxLevel: 10, bonusType: 'detection_range', bonusPerLevel: 5, upgradeCostMultiplier: 1.9, requiredLevel: 8 },
  { id: 'pond-bridge', name: 'Pond Bridge', description: 'An elegant bridge spanning the Crystal Pond for easy access.', baseCost: 140, maxLevel: 10, bonusType: 'water_access', bonusPerLevel: 4, upgradeCostMultiplier: 1.7, requiredLevel: 6 },
  { id: 'stone-walkway', name: 'Stone Walkway', description: 'Paved paths connecting garden areas for faster navigation.', baseCost: 110, maxLevel: 10, bonusType: 'movement_speed', bonusPerLevel: 6, upgradeCostMultiplier: 1.6, requiredLevel: 4 },
  { id: 'fence-gate', name: 'Fence Gate', description: 'A protective fence that keeps out larger garden pests.', baseCost: 80, maxLevel: 10, bonusType: 'pest_defense', bonusPerLevel: 8, upgradeCostMultiplier: 1.5, requiredLevel: 3 },
  { id: 'garden-bell-tower', name: 'Garden Bell Tower', description: 'A bell tower whose chimes stimulate plant growth.', baseCost: 260, maxLevel: 10, bonusType: 'growth_aura', bonusPerLevel: 3, upgradeCostMultiplier: 2.1, requiredLevel: 10 },
  { id: 'firefly-lantern-post', name: 'Firefly Lantern Post', description: 'Posts housing friendly fireflies that illuminate garden paths.', baseCost: 45, maxLevel: 10, bonusType: 'garden_light', bonusPerLevel: 10, upgradeCostMultiplier: 1.3, requiredLevel: 1 },
  { id: 'royal-gnome-throne', name: 'Royal Gnome Throne', description: 'A magnificent throne carved from a living tree root. Symbol of ultimate garden mastery.', baseCost: 1000, maxLevel: 10, bonusType: 'all_bonus', bonusPerLevel: 2, upgradeCostMultiplier: 3.0, requiredLevel: 20 },
]

/* ================================================================
   22 GARDEN ABILITIES
   ================================================================ */

const GN_ABILITIES: GnAbility[] = [
  { id: 'natures-touch', name: "Nature's Touch", description: 'Gently encourage a plant to grow instantly by a small amount.', cooldown: 30000, duration: 0, manaCost: 10, effectType: 'instant_growth', effectValue: 10, requiredLevel: 1, rarity: 'common', color: '#AEEA00' },
  { id: 'growth-surge', name: 'Growth Surge', description: 'Surround all plants in the current zone with a growth aura for a short time.', cooldown: 120000, duration: 30000, manaCost: 25, effectType: 'growth_aura', effectValue: 20, requiredLevel: 3, rarity: 'common', color: '#00C853' },
  { id: 'root-network', name: 'Root Network', description: 'Connect all planted crops to share nutrients, boosting all yields.', cooldown: 180000, duration: 60000, manaCost: 30, effectType: 'yield_boost', effectValue: 25, requiredLevel: 5, rarity: 'uncommon', color: '#795548' },
  { id: 'fungal-bloom', name: 'Fungal Bloom', description: 'Cause mushrooms in the meadow to bloom, spreading beneficial spores.', cooldown: 150000, duration: 45000, manaCost: 20, effectType: 'spore_spread', effectValue: 15, requiredLevel: 4, rarity: 'uncommon', color: '#81D4FA' },
  { id: 'sunbeam-focus', name: 'Sunbeam Focus', description: 'Focus a beam of sunlight onto a single plant, massively accelerating its growth.', cooldown: 60000, duration: 0, manaCost: 15, effectType: 'single_growth', effectValue: 30, requiredLevel: 2, rarity: 'common', color: '#FFD54F' },
  { id: 'moonlight-blessing', name: 'Moonlight Blessing', description: 'Bathe the garden in blessed moonlight, improving nocturnal plant quality.', cooldown: 240000, duration: 60000, manaCost: 35, effectType: 'quality_boost', effectValue: 20, requiredLevel: 8, rarity: 'uncommon', color: '#B39DDB' },
  { id: 'rain-dance', name: 'Rain Dance', description: 'Perform an ancient gnome rain dance to water all plants at once.', cooldown: 120000, duration: 0, manaCost: 20, effectType: 'mass_water', effectValue: 100, requiredLevel: 3, rarity: 'common', color: '#4FC3F7' },
  { id: 'earth-whisper', name: 'Earth Whisper', description: 'Listen to the soil to learn exactly what each plant needs.', cooldown: 60000, duration: 15000, manaCost: 10, effectType: 'plant_insight', effectValue: 50, requiredLevel: 2, rarity: 'common', color: '#8D6E63' },
  { id: 'crystal-resonance', name: 'Crystal Resonance', description: 'Make garden crystals resonate, amplifying the power of all active effects.', cooldown: 300000, duration: 30000, manaCost: 50, effectType: 'effect_amplify', effectValue: 50, requiredLevel: 15, rarity: 'rare', color: '#80DEEA' },
  { id: 'petal-storm', name: 'Petal Storm', description: 'Summon a storm of enchanted petals that fertilize all garden plots.', cooldown: 180000, duration: 0, manaCost: 30, effectType: 'mass_fertilize', effectValue: 40, requiredLevel: 7, rarity: 'uncommon', color: '#F48FB1' },
  { id: 'thorn-shield', name: 'Thorn Shield', description: 'Create a barrier of magical thorns that protects plants from pests.', cooldown: 200000, duration: 90000, manaCost: 35, effectType: 'pest_shield', effectValue: 80, requiredLevel: 9, rarity: 'uncommon', color: '#66BB6A' },
  { id: 'vine-grasp', name: 'Vine Grasp', description: 'Animated vines gently harvest all ripe crops automatically.', cooldown: 240000, duration: 0, manaCost: 40, effectType: 'auto_harvest', effectValue: 100, requiredLevel: 12, rarity: 'rare', color: '#2E7D32' },
  { id: 'bloom-burst', name: 'Bloom Burst', description: 'Cause all plants to burst into simultaneous bloom for bonus rewards.', cooldown: 300000, duration: 0, manaCost: 55, effectType: 'mass_bloom', effectValue: 60, requiredLevel: 14, rarity: 'rare', color: '#FF80AB' },
  { id: 'seed-scatter', name: 'Seed Scatter', description: 'Magically scatter seeds across empty plots, planting random species.', cooldown: 180000, duration: 0, manaCost: 25, effectType: 'auto_plant', effectValue: 30, requiredLevel: 6, rarity: 'uncommon', color: '#C5E1A5' },
  { id: 'compost-alchemy', name: 'Compost Alchemy', description: 'Transform compost bin contents into premium-grade fertilizer instantly.', cooldown: 120000, duration: 0, manaCost: 15, effectType: 'compost_transform', effectValue: 70, requiredLevel: 5, rarity: 'uncommon', color: '#A1887F' },
  { id: 'frost-ward', name: 'Frost Ward', description: 'Erect a magical barrier that prevents frost damage to all plants.', cooldown: 240000, duration: 120000, manaCost: 45, effectType: 'frost_protection', effectValue: 100, requiredLevel: 11, rarity: 'rare', color: '#B3E5FC' },
  { id: 'fire-bloom', name: 'Fire Bloom', description: 'Ignite dormant fire magic in plants, granting temporary resistance to blight.', cooldown: 200000, duration: 60000, manaCost: 40, effectType: 'blight_resistance', effectValue: 75, requiredLevel: 10, rarity: 'rare', color: '#FF5722' },
  { id: 'shadow-veil', name: 'Shadow Veil', description: 'Cloak the garden in protective shadows, hiding rare plants from scavengers.', cooldown: 300000, duration: 120000, manaCost: 50, effectType: 'rarity_protection', effectValue: 90, requiredLevel: 13, rarity: 'rare', color: '#4527A0' },
  { id: 'starlight-harvest', name: 'Starlight Harvest', description: 'Channel starlight to double the yield of the next harvest.', cooldown: 360000, duration: 0, manaCost: 60, effectType: 'yield_double', effectValue: 100, requiredLevel: 16, rarity: 'epic', color: '#FFF9C4' },
  { id: 'natures-wrath', name: 'Nature\'s Wrath', description: 'Unleash the garden\'s full power, instantly growing all plants by a massive amount.', cooldown: 600000, duration: 0, manaCost: 80, effectType: 'massive_growth', effectValue: 50, requiredLevel: 18, rarity: 'epic', color: '#1B5E20' },
  { id: 'garden-of-eden', name: 'Garden of Eden', description: 'Transform the garden into a paradise temporarily, maximizing all bonuses.', cooldown: 900000, duration: 120000, manaCost: 100, effectType: 'paradise_mode', effectValue: 100, requiredLevel: 22, rarity: 'epic', color: '#FFD600' },
  { id: 'gnomes-gift', name: 'Gnome\'s Gift', description: 'The ultimate gnomish ability. Summons nature spirits to bless the entire garden.', cooldown: 1200000, duration: 180000, manaCost: 150, effectType: 'spirit_blessing', effectValue: 200, requiredLevel: 30, rarity: 'legendary', color: '#FF6F00' },
]

/* ================================================================
   18 CREATURES
   ================================================================ */

const GN_CREATURES: GnCreature[] = [
  { id: 'mushroom-beetle', name: 'Mushroom Beetle', zoneId: 'mushroom-meadow', description: 'A friendly beetle that lives on giant mushrooms and helps spread spores.', rarity: 'common', friendshipThreshold: 5, xpReward: 10, naturePointReward: 2, itemDrop: 'mushroom-spore-spreader' },
  { id: 'spore-fairy', name: 'Spore Fairy', zoneId: 'mushroom-meadow', description: 'A tiny fairy born from mushroom spores who tends to young plants.', rarity: 'uncommon', friendshipThreshold: 10, xpReward: 25, naturePointReward: 5, itemDrop: 'fertilizer-of-growth' },
  { id: 'glow-moth', name: 'Glow Moth', zoneId: 'mushroom-meadow', description: 'A luminous moth that pollinates nocturnal flowers with glowing dust.', rarity: 'uncommon', friendshipThreshold: 8, xpReward: 20, naturePointReward: 4, itemDrop: 'moon-shade-parasol' },
  { id: 'garden-snail', name: 'Garden Snail', zoneId: 'mushroom-meadow', description: 'A surprisingly helpful snail whose slime trail enriches the soil.', rarity: 'common', friendshipThreshold: 3, xpReward: 8, naturePointReward: 1, itemDrop: 'earth-rich-soil-bag' },
  { id: 'gem-sprite', name: 'Gem Sprite', zoneId: 'crystal-grotto', description: 'A sprite made of living crystal fragments that guards the grotto.', rarity: 'rare', friendshipThreshold: 15, xpReward: 50, naturePointReward: 10, itemDrop: 'crystal-watering-globe' },
  { id: 'crystal-spider', name: 'Crystal Spider', zoneId: 'crystal-grotto', description: 'A spider that spins webs of pure crystal to catch magical insects.', rarity: 'uncommon', friendshipThreshold: 12, xpReward: 30, naturePointReward: 6, itemDrop: 'magnifying-glass' },
  { id: 'prism-worm', name: 'Prism Worm', zoneId: 'crystal-grotto', description: 'A worm whose body refracts light into rainbows as it burrows through soil.', rarity: 'rare', friendshipThreshold: 14, xpReward: 45, naturePointReward: 9, itemDrop: 'prismatic-fertilizer' },
  { id: 'root-worm', name: 'Root Worm', zoneId: 'root-cellar', description: 'A massive worm that aerates the deepest soil layers, improving drainage.', rarity: 'uncommon', friendshipThreshold: 10, xpReward: 28, naturePointReward: 5, itemDrop: 'root-bound-anchor' },
  { id: 'earth-gnome', name: 'Earth Gnome', zoneId: 'root-cellar', description: 'A reclusive gnome who tends the underground roots and shares ancient wisdom.', rarity: 'epic', friendshipThreshold: 20, xpReward: 80, naturePointReward: 16, itemDrop: 'weatherstone-charm' },
  { id: 'stone-beetle', name: 'Stone Beetle', zoneId: 'root-cellar', description: 'An indestructible beetle that grinds rocks into mineral-rich dust.', rarity: 'common', friendshipThreshold: 4, xpReward: 12, naturePointReward: 2, itemDrop: 'soil-testing-kit' },
  { id: 'sunbeam-fairy', name: 'Sunbeam Fairy', zoneId: 'sunlit-clearing', description: 'A fairy that rides sunbeams and brings light to dark garden corners.', rarity: 'uncommon', friendshipThreshold: 9, xpReward: 22, naturePointReward: 4, itemDrop: 'sun-catching-lantern' },
  { id: 'golden-butterfly', name: 'Golden Butterfly', zoneId: 'sunlit-clearing', description: 'A butterfly with wings of pure gold that pollinates the rarest flowers.', rarity: 'rare', friendshipThreshold: 13, xpReward: 42, naturePointReward: 8, itemDrop: 'seed-sorting-hat' },
  { id: 'dew-sprite', name: 'Dew Sprite', zoneId: 'sunlit-clearing', description: 'A sprite that collects morning dew and waters plants while gardeners sleep.', rarity: 'common', friendshipThreshold: 6, xpReward: 15, naturePointReward: 3, itemDrop: 'gnome-watering-can' },
  { id: 'moss-gnome', name: 'Moss Gnome', zoneId: 'mossy-hollow', description: 'A gentle gnome covered in soft moss who teaches patience in gardening.', rarity: 'uncommon', friendshipThreshold: 11, xpReward: 26, naturePointReward: 5, itemDrop: 'herbal-pest-deterrent' },
  { id: 'fern-owl', name: 'Fern Owl', zoneId: 'mossy-hollow', description: 'An owl camouflaged as a fern that hunts garden pests at night.', rarity: 'rare', friendshipThreshold: 14, xpReward: 48, naturePointReward: 9, itemDrop: 'bug-repellent-spray' },
  { id: 'hopping-toad', name: 'Hopping Toad', zoneId: 'mossy-hollow', description: 'A toad that eats harmful insects and its croaks stimulate root growth.', rarity: 'common', friendshipThreshold: 5, xpReward: 10, naturePointReward: 2, itemDrop: 'frost-shield-netting' },
  { id: 'pond-spirit', name: 'Pond Spirit', zoneId: 'crystal-pond', description: 'An ancient spirit dwelling in the Crystal Pond who purifies water.', rarity: 'epic', friendshipThreshold: 22, xpReward: 100, naturePointReward: 20, itemDrop: 'ancient-garden-key' },
  { id: 'crystal-frog', name: 'Crystal Frog', zoneId: 'crystal-pond', description: 'A translucent frog whose croaks create ripples of growth energy in the water.', rarity: 'uncommon', friendshipThreshold: 10, xpReward: 24, naturePointReward: 5, itemDrop: 'rainbow-sprinkler' },
  { id: 'water-nymph', name: 'Water Nymph', zoneId: 'crystal-pond', description: 'A nymph who nurtures water plants and predicts weather changes.', rarity: 'rare', friendshipThreshold: 16, xpReward: 55, naturePointReward: 11, itemDrop: 'moonlight-canopy' },
  { id: 'ancient-treant', name: 'Ancient Treant', zoneId: 'ancient-grove', description: 'A sentient tree of immense age who guards the grove and shares botanical secrets.', rarity: 'legendary', friendshipThreshold: 30, xpReward: 200, naturePointReward: 40, itemDrop: 'ancient-garden-key' },
  { id: 'forest-wisp', name: 'Forest Wisp', zoneId: 'ancient-grove', description: 'An ethereal ball of light that guides lost gardeners and nurtures saplings.', rarity: 'epic', friendshipThreshold: 18, xpReward: 90, naturePointReward: 18, itemDrop: 'weatherstone-charm' },
  { id: 'bark-fox', name: 'Bark Fox', zoneId: 'ancient-grove', description: 'A fox with bark-like fur that buries enchanted seeds and protects saplings.', rarity: 'rare', friendshipThreshold: 13, xpReward: 44, naturePointReward: 9, itemDrop: 'gnome-forged-hoe' },
  { id: 'sanctum-guardian', name: 'Sanctum Guardian', zoneId: 'hidden-sanctum', description: 'A powerful elemental being that protects the most sacred garden chamber.', rarity: 'legendary', friendshipThreshold: 35, xpReward: 250, naturePointReward: 50, itemDrop: 'ancient-garden-key' },
  { id: 'spirit-peacock', name: 'Spirit Peacock', zoneId: 'hidden-sanctum', description: 'A peacock whose tail feathers display the colors of every plant in existence.', rarity: 'epic', friendshipThreshold: 20, xpReward: 110, naturePointReward: 22, itemDrop: 'prismatic-fertilizer' },
  { id: 'time-fairy', name: 'Time Fairy', zoneId: 'hidden-sanctum', description: 'A fairy who can briefly accelerate or reverse plant growth time.', rarity: 'legendary', friendshipThreshold: 28, xpReward: 180, naturePointReward: 35, itemDrop: 'ancient-garden-key' },
]

/* ================================================================
   18 ACHIEVEMENTS
   ================================================================ */

const GN_ACHIEVEMENTS: GnAchievement[] = [
  { id: 'first-sprout', name: 'First Sprout', description: 'Plant your very first seed in the gnome garden.', conditionKey: 'totalPlanted', targetValue: 1, rewardNaturePoints: 10, rewardEnergy: 20 },
  { id: 'green-thumb', name: 'Green Thumb', description: 'Plant 50 seeds and prove your gardening dedication.', conditionKey: 'totalPlanted', targetValue: 50, rewardNaturePoints: 100, rewardEnergy: 50 },
  { id: 'master-gardener', name: 'Master Gardener', description: 'Plant 500 seeds to earn the title of master gardener.', conditionKey: 'totalPlanted', targetValue: 500, rewardNaturePoints: 500, rewardEnergy: 100 },
  { id: 'harvest-moon', name: 'Harvest Moon', description: 'Harvest 100 crops under any celestial condition.', conditionKey: 'harvestCount', targetValue: 100, rewardNaturePoints: 150, rewardEnergy: 60 },
  { id: 'bounty-collector', name: 'Bounty Collector', description: 'Harvest 1000 crops and fill the root cellar to overflowing.', conditionKey: 'harvestCount', targetValue: 1000, rewardNaturePoints: 800, rewardEnergy: 120 },
  { id: 'zone-explorer', name: 'Zone Explorer', description: 'Visit and discover all 8 garden zones.', conditionKey: 'zonesExplored', targetValue: 8, rewardNaturePoints: 200, rewardEnergy: 80 },
  { id: 'zone-master', name: 'Zone Master', description: 'Fully explore every zone to 100% completion.', conditionKey: 'zonesComplete', targetValue: 8, rewardNaturePoints: 1000, rewardEnergy: 200 },
  { id: 'structure-builder', name: 'Structure Builder', description: 'Build your first garden structure.', conditionKey: 'totalStructuresBuilt', targetValue: 1, rewardNaturePoints: 50, rewardEnergy: 30 },
  { id: 'gnome-architect', name: 'Gnome Architect', description: 'Build all 25 garden structures.', conditionKey: 'totalStructuresBuilt', targetValue: 25, rewardNaturePoints: 2000, rewardEnergy: 300 },
  { id: 'tool-collector', name: 'Tool Collector', description: 'Acquire all 30 gardening tools and supplies.', conditionKey: 'toolsOwned', targetValue: 30, rewardNaturePoints: 1500, rewardEnergy: 250 },
  { id: 'creature-friend', name: 'Creature Friend', description: 'Befriend 5 different garden creatures.', conditionKey: 'totalCreaturesBefriended', targetValue: 5, rewardNaturePoints: 200, rewardEnergy: 60 },
  { id: 'gnome-whisperer', name: 'Gnome Whisperer', description: 'Befriend all garden creatures across every zone.', conditionKey: 'totalCreaturesBefriended', targetValue: 25, rewardNaturePoints: 3000, rewardEnergy: 400 },
  { id: 'nature-mage', name: 'Nature Mage', description: 'Activate garden abilities 100 times total.', conditionKey: 'totalAbilitiesUsed', targetValue: 100, rewardNaturePoints: 300, rewardEnergy: 80 },
  { id: 'garden-sage', name: 'Garden Sage', description: 'Reach the Garden Sage title by accumulating reputation.', conditionKey: 'titleIndex', targetValue: 5, rewardNaturePoints: 500, rewardEnergy: 150 },
  { id: 'compost-king', name: 'Compost King', description: 'Compost 500 items and turn waste into garden gold.', conditionKey: 'totalComposted', targetValue: 500, rewardNaturePoints: 400, rewardEnergy: 100 },
  { id: 'fertilizer-master', name: 'Fertilizer Master', description: 'Fertilize plants 200 times for maximum growth.', conditionKey: 'totalFertilized', targetValue: 200, rewardNaturePoints: 350, rewardEnergy: 90 },
  { id: 'treasure-hunter', name: 'Treasure Hunter', description: 'Find 50 hidden treasures while exploring garden zones.', conditionKey: 'treasureFound', targetValue: 50, rewardNaturePoints: 600, rewardEnergy: 120 },
  { id: 'gnome-king', name: 'Gnome King/Queen', description: 'Reach the ultimate title and rule over the garden realm.', conditionKey: 'titleIndex', targetValue: 7, rewardNaturePoints: 5000, rewardEnergy: 500 },
]

/* ================================================================
   8 TITLES
   ================================================================ */

const GN_TITLES: GnTitle[] = [
  { id: 'garden-sprout', name: 'Garden Sprout', requiredReputation: 0, description: 'A new gnome just beginning their gardening journey.', bonusType: 'none', bonusValue: 0 },
  { id: 'seedling-tender', name: 'Seedling Tender', requiredReputation: 100, description: 'You have learned to care for young plants with patience.', bonusType: 'growth_speed', bonusValue: 2 },
  { id: 'garden-apprentice', name: 'Garden Apprentice', requiredReputation: 300, description: 'An apprentice studying the ancient arts of gnome gardening.', bonusType: 'energy_regen', bonusValue: 3 },
  { id: 'herbalist', name: 'Herbalist', requiredReputation: 600, description: 'A skilled herbalist who knows every medicinal plant by heart.', bonusType: 'yield_bonus', bonusValue: 5 },
  { id: 'grove-keeper', name: 'Grove Keeper', requiredReputation: 1000, description: 'Guardian of the grove — plants flourish under your care.', bonusType: 'all_bonus', bonusValue: 3 },
  { id: 'garden-sage', name: 'Garden Sage', requiredReputation: 1600, description: 'Your wisdom rivals the oldest trees in the garden.', bonusType: 'xp_bonus', bonusValue: 8 },
  { id: 'gnome-lord', name: 'Gnome Lord/Lady', requiredReputation: 2500, description: 'A noble gnome of great renown, respected by all garden dwellers.', bonusType: 'nature_points', bonusValue: 10 },
  { id: 'gnome-king', name: 'Gnome King/Queen', requiredReputation: 4000, description: 'The supreme ruler of the Gnome Garden, master of all underground flora.', bonusType: 'all_bonus', bonusValue: 15 },
]

/* ================================================================
   WEATHER TABLE
   ================================================================ */

const GN_WEATHER_CONDITIONS: GnWeatherCondition[] = [
  'sunny', 'rainy', 'cloudy', 'stormy', 'magical', 'moonlit', 'foggy', 'windy',
]

const GN_WEATHER_GROWTH_BONUS: Record<GnWeatherCondition, number> = {
  sunny: 1.2,
  rainy: 1.4,
  cloudy: 1.0,
  stormy: 0.7,
  magical: 2.0,
  moonlit: 1.3,
  foggy: 0.9,
  windy: 0.8,
}

/* ================================================================
   HELPERS (not exported)
   ================================================================ */

function gnGenerateDayKey(now: number): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function gnCreateInitialState(): GnGardenState {
  const plants: Record<string, GnPlantedPlot> = {}
  for (let i = 0; i < GN_PLOT_COUNT; i++) {
    plants[`plot-${i}`] = {
      plotId: `plot-${i}`,
      plantId: null,
      plantedAt: null,
      wateredAt: null,
      fertilized: false,
      growthProgress: 0,
    }
  }

  const zones: Record<string, GnZoneState> = {}
  for (const z of GN_ZONES) {
    zones[z.id] = { unlocked: z.unlockLevel <= 1, explorationProgress: 0, creaturesDiscovered: 0, lastExplored: null }
  }

  const tools: Record<string, GnToolState> = {}
  for (const t of GN_TOOLS) {
    tools[t.id] = { owned: t.cost === 0, uses: t.cost === 0 ? 1 : 0 }
  }

  const structures: Record<string, GnStructureState> = {}
  for (const s of GN_STRUCTURES) {
    structures[s.id] = { built: false, level: 0, builtAt: null }
  }

  const abilities: Record<string, GnAbilityState> = {}
  for (const a of GN_ABILITIES) {
    abilities[a.id] = { unlocked: a.requiredLevel <= 1, lastUsed: null, totalUses: 0 }
  }

  const achievements: Record<string, GnAchievementState> = {}
  for (const ach of GN_ACHIEVEMENTS) {
    achievements[ach.id] = { unlocked: false, unlockedAt: null }
  }

  const creatures: Record<string, GnCreatureState> = {}
  for (const c of GN_CREATURES) {
    creatures[c.id] = { discovered: false, friendship: 0, befriended: false, lastFed: null, feedCount: 0 }
  }

  return {
    plants,
    zones,
    tools,
    structures,
    abilities,
    achievements,
    creatures,
    currentZone: 'mushroom-meadow',
    gardenEnergy: GN_MAX_ENERGY,
    maxEnergy: GN_MAX_ENERGY,
    naturePoints: GN_BASE_NATURE_POINTS,
    harvestCount: 0,
    seedsCollected: 0,
    plantsGrown: 0,
    totalPlanted: 0,
    totalWatered: 0,
    totalFertilized: 0,
    totalComposted: 0,
    totalExplored: 0,
    totalCreaturesBefriended: 0,
    totalAbilitiesUsed: 0,
    totalStructuresBuilt: 0,
    titleIndex: 0,
    gardenReputation: 0,
    weatherCondition: 'sunny',
    dailyTask: { type: null, progress: 0, target: 0, completed: false, lastDate: null, rewardNaturePoints: 0, rewardEnergy: 0 },
    activeAbility: null,
    activeAbilityExpiry: null,
    compostBinAmount: 0,
    treasureFound: 0,
    lastSaveTime: Date.now(),
    sessionStart: Date.now(),
    playTimeMinutes: 0,
  }
}

function gnLoadState(): GnGardenState {
  if (typeof window === 'undefined') return gnCreateInitialState()
  try {
    const raw = localStorage.getItem(GN_SAVE_KEY)
    if (!raw) return gnCreateInitialState()
    const parsed = JSON.parse(raw) as GnGardenState
    const initial = gnCreateInitialState()
    return { ...initial, ...parsed, sessionStart: Date.now() }
  } catch {
    return gnCreateInitialState()
  }
}

function gnSaveState(s: GnGardenState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(GN_SAVE_KEY, JSON.stringify({ ...s, lastSaveTime: Date.now() }))
  } catch {
    /* ignore quota errors */
  }
}

function gnRarityMultiplier(r: GnRarityTier): number {
  return GN_RARITY[r]?.xpMultiplier ?? 1
}

function gnGetPlantDef(id: string): GnPlant | undefined {
  return GN_PLANTS.find((p) => p.id === id)
}

function gnGetZoneDef(id: string): GnZone | undefined {
  return GN_ZONES.find((z) => z.id === id)
}

function gnGetToolDef(id: string): GnTool | undefined {
  return GN_TOOLS.find((t) => t.id === id)
}

function gnGetStructureDef(id: string): GnStructure | undefined {
  return GN_STRUCTURES.find((s) => s.id === id)
}

function gnGetAbilityDef(id: string): GnAbility | undefined {
  return GN_ABILITIES.find((a) => a.id === id)
}

function gnGetCreatureDef(id: string): GnCreature | undefined {
  return GN_CREATURES.find((c) => c.id === id)
}

/* ================================================================
   MAIN HOOK
   ================================================================ */

export default function useGnomeGarden() {
  const [state, setState] = useState<GnGardenState>(gnLoadState)
  const stateRef = useRef(state)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const weatherTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const energyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Auto-save
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      gnSaveState(stateRef.current)
    }, GN_AUTO_SAVE_INTERVAL)
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current) }
  }, [])

  // Weather changes
  useEffect(() => {
    weatherTimerRef.current = setInterval(() => {
      const cond = GN_WEATHER_CONDITIONS[Math.floor(Math.random() * GN_WEATHER_CONDITIONS.length)]
      setState((prev) => ({ ...prev, weatherCondition: cond }))
    }, GN_WEATHER_CHANGE_INTERVAL)
    return () => { if (weatherTimerRef.current) clearInterval(weatherTimerRef.current) }
  }, [])

  // Energy regeneration
  useEffect(() => {
    energyTimerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.gardenEnergy >= prev.maxEnergy) return prev
        const regenAmount = 5
        return { ...prev, gardenEnergy: Math.min(prev.maxEnergy, prev.gardenEnergy + regenAmount) }
      })
    }, GN_ENERGY_REGEN_MS)
    return () => { if (energyTimerRef.current) clearInterval(energyTimerRef.current) }
  }, [])

  // Play time tracker
  useEffect(() => {
    playTimerRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, playTimeMinutes: prev.playTimeMinutes + 1 }))
    }, 60000)
    return () => { if (playTimerRef.current) clearInterval(playTimerRef.current) }
  }, [])

  // Cleanup expired active abilities
  useEffect(() => {
    const checkInterval = setInterval(() => {
      setState((prev) => {
        if (prev.activeAbility && prev.activeAbilityExpiry && prev.activeAbilityExpiry <= Date.now()) {
          return { ...prev, activeAbility: null, activeAbilityExpiry: null }
        }
        return prev
      })
    }, 5000)
    return () => clearInterval(checkInterval)
  }, [])

  /* ==============================================================
     CONSTANTS (returned from hook)
     ============================================================== */

  const GN_MAX_ENERGY_CONST = GN_MAX_ENERGY
  const GN_PLANT_COUNT = GN_PLANTS.length
  const GN_ZONE_COUNT = GN_ZONES.length
  const GN_TOOL_COUNT = GN_TOOLS.length
  const GN_STRUCTURE_COUNT = GN_STRUCTURES.length
  const GN_ABILITY_COUNT = GN_ABILITIES.length
  const GN_CREATURE_COUNT = GN_CREATURES.length
  const GN_ACHIEVEMENT_COUNT = GN_ACHIEVEMENTS.length
  const GN_TITLE_COUNT = GN_TITLES.length
  const GN_PLOT_TOTAL = GN_PLOT_COUNT
  const GN_COLOR = GN_COLOR_THEME
  const GN_WEATHER_BONUS = GN_WEATHER_GROWTH_BONUS
  const GN_ALL_RARITIES = GN_RARITY

  /* ==============================================================
     MEMOIZED DERIVED DATA
     ============================================================== */

  const plantDefs = useMemo(() => GN_PLANTS, [])
  const zoneDefs = useMemo(() => GN_ZONES, [])
  const toolDefs = useMemo(() => GN_TOOLS, [])
  const structureDefs = useMemo(() => GN_STRUCTURES, [])
  const abilityDefs = useMemo(() => GN_ABILITIES, [])
  const achievementDefs = useMemo(() => GN_ACHIEVEMENTS, [])
  const titleDefs = useMemo(() => GN_TITLES, [])
  const creatureDefs = useMemo(() => GN_CREATURES, [])

  const currentZoneDef = useMemo(
    () => gnGetZoneDef(state.currentZone),
    [state.currentZone],
  )

  const currentWeather = useMemo(
    () => state.weatherCondition,
    [state.weatherCondition],
  )

  const weatherGrowthMultiplier = useMemo(
    () => GN_WEATHER_GROWTH_BONUS[state.weatherCondition],
    [state.weatherCondition],
  )

  const unlockedZones = useMemo(
    () => GN_ZONES.filter((z) => state.zones[z.id]?.unlocked),
    [state.zones],
  )

  const ownedTools = useMemo(
    () => GN_TOOLS.filter((t) => state.tools[t.id]?.owned),
    [state.tools],
  )

  const builtStructures = useMemo(
    () => GN_STRUCTURES.filter((s) => state.structures[s.id]?.built),
    [state.structures],
  )

  const unlockedAbilities = useMemo(
    () => GN_ABILITIES.filter((a) => state.abilities[a.id]?.unlocked),
    [state.abilities],
  )

  const unlockedAchievements = useMemo(
    () => GN_ACHIEVEMENTS.filter((a) => state.achievements[a.id]?.unlocked),
    [state.achievements],
  )

  const discoveredCreatures = useMemo(
    () => GN_CREATURES.filter((c) => state.creatures[c.id]?.discovered),
    [state.creatures],
  )

  const befriendedCreatures = useMemo(
    () => GN_CREATURES.filter((c) => state.creatures[c.id]?.befriended),
    [state.creatures],
  )

  const availablePlots = useMemo(
    () => Object.values(state.plants).filter((p) => p.plantId === null),
    [state.plants],
  )

  const activePlots = useMemo(
    () => Object.values(state.plants).filter((p) => p.plantId !== null),
    [state.plants],
  )

  const ripePlots = useMemo(() => {
    const now = Date.now()
    return Object.values(state.plants).filter((p) => {
      if (!p.plantId || !p.plantedAt) return false
      const def = gnGetPlantDef(p.plantId)
      if (!def) return false
      const elapsed = now - p.plantedAt
      return elapsed >= def.growthTime
    })
  }, [state.plants])

  const plantsByZone = useMemo(
    () => {
      const map: Record<string, GnPlant[]> = {}
      for (const p of GN_PLANTS) {
        if (!map[p.zoneId]) map[p.zoneId] = []
        map[p.zoneId].push(p)
      }
      return map
    },
    [],
  )

  const creaturesByZone = useMemo(
    () => {
      const map: Record<string, GnCreature[]> = {}
      for (const c of GN_CREATURES) {
        if (!map[c.zoneId]) map[c.zoneId] = []
        map[c.zoneId].push(c)
      }
      return map
    },
    [],
  )

  const titleInfo = useMemo(
    () => GN_TITLES[state.titleIndex] ?? GN_TITLES[0],
    [state.titleIndex],
  )

  const nextTitleInfo = useMemo(
    () => GN_TITLES[state.titleIndex + 1] ?? null,
    [state.titleIndex],
  )

  const titleProgress = useMemo(() => {
    const current = GN_TITLES[state.titleIndex]
    const next = GN_TITLES[state.titleIndex + 1]
    if (!next) return 100
    const range = next.requiredReputation - current.requiredReputation
    const progress = state.gardenReputation - current.requiredReputation
    return Math.min(100, Math.max(0, (progress / range) * 100))
  }, [state.titleIndex, state.gardenReputation])

  const activeAbilityInfo = useMemo(() => {
    if (!state.activeAbility) return null
    const def = gnGetAbilityDef(state.activeAbility)
    if (!def) return null
    const now = Date.now()
    const remaining = state.activeAbilityExpiry ? Math.max(0, state.activeAbilityExpiry - now) : 0
    return { ...def, remainingMs: remaining }
  }, [state.activeAbility, state.activeAbilityExpiry])

  const dailyTaskInfo = useMemo(() => {
    const today = gnGenerateDayKey(Date.now())
    if (state.dailyTask.lastDate !== today) return null
    return { ...state.dailyTask, isExpired: false }
  }, [state.dailyTask])

  const overallProgress = useMemo(() => {
    const achievementProgress = (unlockedAchievements.length / GN_ACHIEVEMENTS.length) * 25
    const structureProgress = (builtStructures.length / GN_STRUCTURES.length) * 20
    const toolProgress = (ownedTools.length / GN_TOOLS.length) * 15
    const zoneProgress = (unlockedZones.length / GN_ZONES.length) * 15
    const creatureProgress = (befriendedCreatures.length / GN_CREATURES.length) * 15
    const titleProgressVal = ((state.titleIndex + 1) / GN_TITLES.length) * 10
    return Math.min(100, Math.floor(
      achievementProgress + structureProgress + toolProgress + zoneProgress + creatureProgress + titleProgressVal,
    ))
  }, [unlockedAchievements.length, builtStructures.length, ownedTools.length, unlockedZones.length, befriendedCreatures.length, state.titleIndex])

  const plantsByRarity = useMemo(
    () => {
      const map: Record<GnRarityTier, GnPlant[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] }
      for (const p of GN_PLANTS) {
        map[p.rarity].push(p)
      }
      return map
    },
    [],
  )

  const toolsByCategory = useMemo(
    () => {
      const map: Record<string, GnTool[]> = {}
      for (const t of GN_TOOLS) {
        if (!map[t.category]) map[t.category] = []
        map[t.category].push(t)
      }
      return map
    },
    [],
  )

  const abilitiesByRarity = useMemo(
    () => {
      const map: Record<GnRarityTier, GnAbility[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] }
      for (const a of GN_ABILITIES) {
        map[a.rarity].push(a)
      }
      return map
    },
    [],
  )

  const structuresByLevel = useMemo(
    () => {
      const built = GN_STRUCTURES.filter((s) => state.structures[s.id]?.built)
      const unbuilt = GN_STRUCTURES.filter((s) => !state.structures[s.id]?.built)
      return { built, unbuilt }
    },
    [state.structures],
  )

  const zoneCreaturesState = useMemo(
    () => {
      const zone = gnGetZoneDef(state.currentZone)
      if (!zone) return []
      return zone.creatureIds
        .map((id) => {
          const def = gnGetCreatureDef(id)
          const cState = state.creatures[id]
          if (!def || !cState) return null
          return { def, state: cState }
        })
        .filter(Boolean) as { def: GnCreature; state: GnCreatureState }[]
    },
    [state.currentZone, state.creatures],
  )

  const zonePlantDefs = useMemo(
    () => {
      const zone = gnGetZoneDef(state.currentZone)
      if (!zone) return []
      return zone.plantIds.map((id) => gnGetPlantDef(id)).filter(Boolean) as GnPlant[]
    },
    [state.currentZone],
  )

  const totalStructureBonus = useMemo(
    () => {
      let total: Record<string, number> = {}
      for (const s of GN_STRUCTURES) {
        const sState = state.structures[s.id]
        if (!sState?.built) continue
        total[s.bonusType] = (total[s.bonusType] ?? 0) + sState.level * s.bonusPerLevel
      }
      return total
    },
    [state.structures],
  )

  const energyPercent = useMemo(
    () => {
      if (state.maxEnergy <= 0) return 0
      return Math.floor((state.gardenEnergy / state.maxEnergy) * 100)
    },
    [state.gardenEnergy, state.maxEnergy],
  )

  const compostPercent = useMemo(
    () => Math.floor((state.compostBinAmount / GN_MAX_COMPOST_BIN) * 100),
    [state.compostBinAmount],
  )

  const gardenSummary = useMemo(
    () => ({
      plantsPlanted: Object.values(state.plants).filter((p) => p.plantId !== null).length,
      plantsAvailable: GN_PLOT_COUNT,
      zonesUnlocked: unlockedZones.length,
      zonesTotal: GN_ZONES.length,
      creaturesBefriended: befriendedCreatures.length,
      creaturesTotal: GN_CREATURES.length,
      achievementsUnlocked: unlockedAchievements.length,
      achievementsTotal: GN_ACHIEVEMENTS.length,
      title: titleInfo.name,
      reputation: state.gardenReputation,
    }),
    [state.plants, unlockedZones.length, befriendedCreatures.length, unlockedAchievements.length, titleInfo.name, state.gardenReputation],
  )

  /* ==============================================================
     ACTIONS
     ============================================================== */

  const plantSeed = useCallback((plotId: string, plantId: string) => {
    setState((prev) => {
      const plot = prev.plants[plotId]
      if (!plot || plot.plantId !== null) return prev
      const plantDef = gnGetPlantDef(plantId)
      if (!plantDef) return prev
      if (prev.naturePoints < plantDef.seedCost) return prev
      return {
        ...prev,
        plants: {
          ...prev.plants,
          [plotId]: {
            ...plot,
            plantId,
            plantedAt: Date.now(),
            wateredAt: null,
            fertilized: false,
            growthProgress: 0,
          },
        },
        naturePoints: prev.naturePoints - plantDef.seedCost,
        seedsCollected: prev.seedsCollected + 1,
        totalPlanted: prev.totalPlanted + 1,
        gardenReputation: prev.gardenReputation + 1,
      }
    })
  }, [])

  const waterPlant = useCallback((plotId: string) => {
    setState((prev) => {
      const plot = prev.plants[plotId]
      if (!plot || plot.plantId === null || prev.gardenEnergy < 5) return prev
      const now = Date.now()
      const wasRecentlyWatered = plot.wateredAt && (now - plot.wateredAt) < 30000
      if (wasRecentlyWatered) return prev
      const repGain = 1
      return {
        ...prev,
        plants: {
          ...prev.plants,
          [plotId]: { ...plot, wateredAt: now },
        },
        gardenEnergy: prev.gardenEnergy - 5,
        totalWatered: prev.totalWatered + 1,
        gardenReputation: prev.gardenReputation + repGain,
      }
    })
  }, [])

  const harvestCrop = useCallback((plotId: string) => {
    setState((prev) => {
      const plot = prev.plants[plotId]
      if (!plot || !plot.plantId || !plot.plantedAt) return prev
      const plantDef = gnGetPlantDef(plot.plantId)
      if (!plantDef) return prev
      const now = Date.now()
      const elapsed = now - plot.plantedAt
      const weatherBonus = GN_WEATHER_GROWTH_BONUS[prev.weatherCondition]
      const growthMultiplier = plot.fertilized ? 1.3 : 1.0
      const effectiveGrowth = elapsed * weatherBonus * growthMultiplier
      if (effectiveGrowth < plantDef.growthTime) return prev

      const isDoubleYield = prev.activeAbility === 'starlight-harvest'
      const yieldMultiplier = isDoubleYield ? 2 : 1
      const yieldAmount = Math.floor(plantDef.yieldAmount * yieldMultiplier)
      const rarityMult = gnRarityMultiplier(plantDef.rarity)
      const xpGain = Math.floor(plantDef.xpReward * rarityMult)
      const npGain = Math.floor(plantDef.naturePoints * rarityMult) * yieldAmount
      const compostGain = Math.floor(yieldAmount * 0.3)

      return {
        ...prev,
        plants: {
          ...prev.plants,
          [plotId]: {
            ...plot,
            plantId: null,
            plantedAt: null,
            wateredAt: null,
            fertilized: false,
            growthProgress: 0,
          },
        },
        naturePoints: prev.naturePoints + npGain,
        harvestCount: prev.harvestCount + yieldAmount,
        plantsGrown: prev.plantsGrown + 1,
        gardenReputation: prev.gardenReputation + Math.floor(rarityMult * 2),
        compostBinAmount: Math.min(GN_MAX_COMPOST_BIN, prev.compostBinAmount + compostGain),
        activeAbility: isDoubleYield ? null : prev.activeAbility,
        activeAbilityExpiry: isDoubleYield ? null : prev.activeAbilityExpiry,
      }
    })
  }, [])

  const upgradeStructure = useCallback((structureId: string) => {
    setState((prev) => {
      const def = gnGetStructureDef(structureId)
      if (!def) return prev
      const structState = prev.structures[structureId]
      if (!structState) return prev

      if (!structState.built) {
        if (prev.naturePoints < def.baseCost) return prev
        return {
          ...prev,
          structures: {
            ...prev.structures,
            [structureId]: { ...structState, built: true, level: 1, builtAt: Date.now() },
          },
          naturePoints: prev.naturePoints - def.baseCost,
          totalStructuresBuilt: prev.totalStructuresBuilt + 1,
          gardenReputation: prev.gardenReputation + 10,
        }
      }

      if (structState.level >= def.maxLevel) return prev
      const upgradeCost = Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, structState.level))
      if (prev.naturePoints < upgradeCost) return prev

      return {
        ...prev,
        structures: {
          ...prev.structures,
          [structureId]: { ...structState, level: structState.level + 1 },
        },
        naturePoints: prev.naturePoints - upgradeCost,
        gardenReputation: prev.gardenReputation + 5,
      }
    })
  }, [])

  const activateAbility = useCallback((abilityId: string) => {
    setState((prev) => {
      const def = gnGetAbilityDef(abilityId)
      if (!def) return prev
      const abilityState = prev.abilities[abilityId]
      if (!abilityState || !abilityState.unlocked) return prev
      if (prev.gardenEnergy < def.manaCost) return prev
      if (abilityState.lastUsed && (Date.now() - abilityState.lastUsed) < def.cooldown) return prev

      const now = Date.now()
      const expiry = def.duration > 0 ? now + def.duration : null

      let updatedPlants = prev.plants
      if (def.effectType === 'instant_growth' || def.effectType === 'single_growth') {
        updatedPlants = { ...prev.plants }
        const plots = Object.values(prev.plants).filter((p) => p.plantId !== null && p.plantedAt)
        if (plots.length > 0) {
          const target = plots[Math.floor(Math.random() * plots.length)]
          const plantDef = gnGetPlantDef(target.plantId!)
          if (plantDef) {
            const boost = def.effectValue / 100
            const timeReduction = Math.floor(plantDef.growthTime * boost)
            updatedPlants[target.plotId] = {
              ...target,
              plantedAt: (target.plantedAt ?? now) - timeReduction,
            }
          }
        }
      }

      if (def.effectType === 'mass_growth' || def.effectType === 'massive_growth') {
        updatedPlants = { ...prev.plants }
        for (const p of Object.values(prev.plants)) {
          if (p.plantId && p.plantedAt) {
            const plantDef = gnGetPlantDef(p.plantId)
            if (plantDef) {
              const boost = def.effectValue / 100
              const timeReduction = Math.floor(plantDef.growthTime * boost)
              updatedPlants[p.plotId] = {
                ...p,
                plantedAt: p.plantedAt - timeReduction,
              }
            }
          }
        }
      }

      return {
        ...prev,
        plants: updatedPlants,
        abilities: {
          ...prev.abilities,
          [abilityId]: { ...abilityState, lastUsed: now, totalUses: abilityState.totalUses + 1 },
        },
        gardenEnergy: prev.gardenEnergy - def.manaCost,
        activeAbility: def.duration > 0 ? abilityId : prev.activeAbility,
        activeAbilityExpiry: def.duration > 0 ? expiry : prev.activeAbilityExpiry,
        totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
        gardenReputation: prev.gardenReputation + 2,
      }
    })
  }, [])

  const befriendCreature = useCallback((creatureId: string) => {
    setState((prev) => {
      const def = gnGetCreatureDef(creatureId)
      if (!def) return prev
      const cState = prev.creatures[creatureId]
      if (!cState) return prev
      if (prev.gardenEnergy < 10) return prev

      const now = Date.now()
      const isFedRecently = cState.lastFed && (now - cState.lastFed) < 60000
      if (isFedRecently) return prev

      const newFriendship = Math.min(def.friendshipThreshold, cState.friendship + 1)
      const newlyBefriended = !cState.befriended && newFriendship >= def.friendshipThreshold
      const newlyDiscovered = !cState.discovered

      return {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: {
            ...cState,
            discovered: true,
            friendship: newFriendship,
            befriended: cState.befriended || newlyBefriended,
            lastFed: now,
            feedCount: cState.feedCount + 1,
          },
        },
        gardenEnergy: prev.gardenEnergy - 10,
        naturePoints: prev.naturePoints + (newlyDiscovered ? def.naturePointReward : 0),
        gardenReputation: prev.gardenReputation + (newlyDiscovered ? 5 : 1),
        totalCreaturesBefriended: prev.totalCreaturesBefriended + (newlyBefriended ? 1 : 0),
      }
    })
  }, [])

  const exploreZone = useCallback((zoneId: string) => {
    setState((prev) => {
      const def = gnGetZoneDef(zoneId)
      if (!def) return prev
      const zState = prev.zones[zoneId]
      if (!zState || !zState.unlocked) return prev
      if (prev.gardenEnergy < 15) return prev

      const explorationGain = Math.floor(Math.random() * 15) + 5
      const newProgress = Math.min(100, zState.explorationProgress + explorationGain)
      const treasureChance = Math.random() < 0.15
      const newTreasureCount = prev.treasureFound + (treasureChance ? 1 : 0)
      const isFullyExplored = newProgress >= 100 && zState.explorationProgress < 100
      const repGain = isFullyExplored ? 25 : 3

      const newCreatures = { ...prev.creatures }
      const zoneCreatures = GN_CREATURES.filter((c) => c.zoneId === zoneId)
      for (const creature of zoneCreatures) {
        if (!newCreatures[creature.id].discovered && Math.random() < 0.3) {
          newCreatures[creature.id] = { ...newCreatures[creature.id], discovered: true }
        }
      }

      return {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: {
            ...zState,
            explorationProgress: newProgress,
            lastExplored: Date.now(),
            creaturesDiscovered: zoneCreatures.filter((c) => newCreatures[c.id].discovered).length,
          },
        },
        creatures: newCreatures,
        gardenEnergy: prev.gardenEnergy - 15,
        naturePoints: prev.naturePoints + explorationGain,
        treasureFound: newTreasureCount,
        totalExplored: prev.totalExplored + 1,
        gardenReputation: prev.gardenReputation + repGain,
      }
    })
  }, [])

  const compostWaste = useCallback((amount: number) => {
    setState((prev) => {
      const actual = Math.min(amount, prev.compostBinAmount)
      if (actual <= 0) return prev
      const npGained = Math.floor(actual * GN_COMPOST_TO_NP_RATIO)
      return {
        ...prev,
        compostBinAmount: prev.compostBinAmount - actual,
        naturePoints: prev.naturePoints + npGained,
        totalComposted: prev.totalComposted + actual,
        gardenReputation: prev.gardenReputation + 1,
      }
    })
  }, [])

  const fertilizeGarden = useCallback((plotId: string) => {
    setState((prev) => {
      const plot = prev.plants[plotId]
      if (!plot || plot.plantId === null || plot.fertilized) return prev
      if (prev.compostBinAmount < 5) return prev
      return {
        ...prev,
        plants: {
          ...prev.plants,
          [plotId]: { ...plot, fertilized: true },
        },
        compostBinAmount: prev.compostBinAmount - 5,
        totalFertilized: prev.totalFertilized + 1,
        gardenReputation: prev.gardenReputation + 1,
      }
    })
  }, [])

  const acquireTool = useCallback((toolId: string) => {
    setState((prev) => {
      const def = gnGetToolDef(toolId)
      if (!def) return prev
      const toolState = prev.tools[toolId]
      if (!toolState || toolState.owned) return prev
      if (prev.naturePoints < def.cost) return prev
      return {
        ...prev,
        tools: {
          ...prev.tools,
          [toolId]: { ...toolState, owned: true, uses: 1 },
        },
        naturePoints: prev.naturePoints - def.cost,
        gardenReputation: prev.gardenReputation + 3,
      }
    })
  }, [])

  const moveToZone = useCallback((zoneId: string) => {
    setState((prev) => {
      const def = gnGetZoneDef(zoneId)
      if (!def) return prev
      if (!prev.zones[zoneId]?.unlocked) return prev
      return { ...prev, currentZone: zoneId }
    })
  }, [])

  const unlockZone = useCallback((zoneId: string) => {
    setState((prev) => {
      const def = gnGetZoneDef(zoneId)
      if (!def) return prev
      const zState = prev.zones[zoneId]
      if (!zState || zState.unlocked) return prev
      const unlockCost = def.unlockLevel * 50
      if (prev.naturePoints < unlockCost) return prev
      return {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zState, unlocked: true },
        },
        naturePoints: prev.naturePoints - unlockCost,
        gardenReputation: prev.gardenReputation + 15,
      }
    })
  }, [])

  const forceWeather = useCallback((weather: GnWeatherCondition) => {
    setState((prev) => ({ ...prev, weatherCondition: weather }))
  }, [])

  const refreshDailyTask = useCallback(() => {
    setState((prev) => {
      const today = gnGenerateDayKey(Date.now())
      if (prev.dailyTask.lastDate === today) return prev
      const taskTypes: GnDailyTaskType[] = ['harvest', 'plant', 'water', 'explore', 'befriend', 'upgrade']
      const type = taskTypes[Math.floor(Math.random() * taskTypes.length)]
      const target = Math.floor(Math.random() * 10) + 3
      return {
        ...prev,
        dailyTask: {
          type,
          progress: 0,
          target,
          completed: false,
          lastDate: today,
          rewardNaturePoints: target * 5,
          rewardEnergy: target * 2,
        },
      }
    })
  }, [])

  const completeDailyTask = useCallback(() => {
    setState((prev) => {
      if (prev.dailyTask.completed) return prev
      return {
        ...prev,
        dailyTask: { ...prev.dailyTask, completed: true },
        naturePoints: prev.naturePoints + prev.dailyTask.rewardNaturePoints,
        gardenEnergy: Math.min(prev.maxEnergy, prev.gardenEnergy + prev.dailyTask.rewardEnergy),
        gardenReputation: prev.gardenReputation + 5,
      }
    })
  }, [])

  const checkAchievements = useCallback(() => {
    setState((prev) => {
      const zonesExplored = Object.values(prev.zones).filter((z) => z.unlocked).length
      const zonesComplete = Object.values(prev.zones).filter((z) => z.explorationProgress >= 100).length
      const toolsOwned = Object.values(prev.tools).filter((t) => t.owned).length
      const updatedAchievements = { ...prev.achievements }
      let npGained = 0
      let energyGained = 0
      let repGained = 0

      for (const ach of GN_ACHIEVEMENTS) {
        const aState = updatedAchievements[ach.id]
        if (!aState || aState.unlocked) continue

        let value = 0
        switch (ach.conditionKey) {
          case 'totalPlanted': value = prev.totalPlanted; break
          case 'harvestCount': value = prev.harvestCount; break
          case 'zonesExplored': value = zonesExplored; break
          case 'zonesComplete': value = zonesComplete; break
          case 'totalStructuresBuilt': value = prev.totalStructuresBuilt; break
          case 'toolsOwned': value = toolsOwned; break
          case 'totalCreaturesBefriended': value = prev.totalCreaturesBefriended; break
          case 'totalAbilitiesUsed': value = prev.totalAbilitiesUsed; break
          case 'titleIndex': value = prev.titleIndex; break
          case 'totalComposted': value = prev.totalComposted; break
          case 'totalFertilized': value = prev.totalFertilized; break
          case 'treasureFound': value = prev.treasureFound; break
          default: value = 0; break
        }

        if (value >= ach.targetValue) {
          updatedAchievements[ach.id] = { unlocked: true, unlockedAt: Date.now() }
          npGained += ach.rewardNaturePoints
          energyGained += ach.rewardEnergy
          repGained += 10
        }
      }

      const hasNew = GN_ACHIEVEMENTS.some(
        (a) => prev.achievements[a.id].unlocked !== updatedAchievements[a.id].unlocked,
      )
      if (!hasNew) return prev

      return {
        ...prev,
        achievements: updatedAchievements,
        naturePoints: prev.naturePoints + npGained,
        gardenEnergy: Math.min(prev.maxEnergy, prev.gardenEnergy + energyGained),
        gardenReputation: prev.gardenReputation + repGained,
      }
    })
  }, [])

  const getTitle = useCallback(() => {
    return GN_TITLES[state.titleIndex] ?? GN_TITLES[0]
  }, [state.titleIndex])

  const getProgress = useCallback(() => {
    return {
      overallProgress,
      achievementProgress: (unlockedAchievements.length / GN_ACHIEVEMENTS.length) * 100,
      structureProgress: (builtStructures.length / GN_STRUCTURES.length) * 100,
      toolProgress: (ownedTools.length / GN_TOOLS.length) * 100,
      zoneProgress: (unlockedZones.length / GN_ZONES.length) * 100,
      creatureProgress: (befriendedCreatures.length / GN_CREATURES.length) * 100,
      titleProgress,
    }
  }, [overallProgress, unlockedAchievements.length, builtStructures.length, ownedTools.length, unlockedZones.length, befriendedCreatures.length, titleProgress])

  const getStats = useCallback(() => {
    return {
      totalPlanted: state.totalPlanted,
      totalWatered: state.totalWatered,
      totalFertilized: state.totalFertilized,
      totalComposted: state.totalComposted,
      totalExplored: state.totalExplored,
      totalCreaturesBefriended: state.totalCreaturesBefriended,
      totalAbilitiesUsed: state.totalAbilitiesUsed,
      totalStructuresBuilt: state.totalStructuresBuilt,
      harvestCount: state.harvestCount,
      seedsCollected: state.seedsCollected,
      plantsGrown: state.plantsGrown,
      treasureFound: state.treasureFound,
      gardenReputation: state.gardenReputation,
      naturePoints: state.naturePoints,
      gardenEnergy: state.gardenEnergy,
      playTimeMinutes: state.playTimeMinutes,
    }
  }, [state])

  const getStructureUpgradeCost = useCallback((structureId: string): number => {
    const def = gnGetStructureDef(structureId)
    if (!def) return 0
    const structState = state.structures[structureId]
    if (!structState || !structState.built) return def.baseCost
    if (structState.level >= def.maxLevel) return 0
    return Math.floor(def.baseCost * Math.pow(def.upgradeCostMultiplier, structState.level))
  }, [state.structures])

  const getStructureBonus = useCallback((structureId: string): number => {
    const def = gnGetStructureDef(structureId)
    const structState = state.structures[structureId]
    if (!def || !structState || !structState.built) return 0
    return structState.level * def.bonusPerLevel
  }, [state.structures])

  const getZoneUnlockCost = useCallback((zoneId: string): number => {
    const def = gnGetZoneDef(zoneId)
    if (!def) return 0
    return def.unlockLevel * 50
  }, [])

  const getPlantGrowthPercent = useCallback((plotId: string): number => {
    const plot = state.plants[plotId]
    if (!plot || !plot.plantId || !plot.plantedAt) return 0
    const def = gnGetPlantDef(plot.plantId)
    if (!def) return 0
    const elapsed = Date.now() - plot.plantedAt
    const weatherBonus = GN_WEATHER_GROWTH_BONUS[state.weatherCondition]
    const fertBonus = plot.fertilized ? 1.3 : 1.0
    const effectiveGrowth = elapsed * weatherBonus * fertBonus
    return Math.min(100, Math.floor((effectiveGrowth / def.growthTime) * 100))
  }, [state.plants, state.weatherCondition])

  const getAbilityCooldownRemaining = useCallback((abilityId: string): number => {
    const abilityState = state.abilities[abilityId]
    if (!abilityState || !abilityState.lastUsed) return 0
    const def = gnGetAbilityDef(abilityId)
    if (!def) return 0
    const elapsed = Date.now() - abilityState.lastUsed
    return Math.max(0, def.cooldown - elapsed)
  }, [state.abilities])

  const resetGarden = useCallback(() => {
    const fresh = gnCreateInitialState()
    setState(fresh)
    gnSaveState(fresh)
  }, [])

  const saveGarden = useCallback(() => {
    gnSaveState(stateRef.current)
  }, [])

  const addNaturePoints = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      naturePoints: Math.max(0, prev.naturePoints + amount),
    }))
  }, [])

  const spendEnergy = useCallback((amount: number): boolean => {
    let success = false
    setState((prev) => {
      if (prev.gardenEnergy < amount) return prev
      success = true
      return { ...prev, gardenEnergy: prev.gardenEnergy - amount }
    })
    return success
  }, [])

  const clearActiveAbility = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeAbility: null,
      activeAbilityExpiry: null,
    }))
  }, [])

  /* ==============================================================
     TITLE UPDATE EFFECT
     ============================================================== */

  useEffect(() => {
    setState((prev) => {
      let newTitleIndex = prev.titleIndex
      for (let i = GN_TITLES.length - 1; i >= 0; i--) {
        if (prev.gardenReputation >= GN_TITLES[i].requiredReputation) {
          newTitleIndex = i
          break
        }
      }
      if (newTitleIndex === prev.titleIndex) return prev
      return { ...prev, titleIndex: newTitleIndex }
    })
  }, [state.gardenReputation])

  /* ==============================================================
     ABILITY UNLOCK EFFECT
     ============================================================== */

  useEffect(() => {
    setState((prev) => {
      let changed = false
      const updatedAbilities = { ...prev.abilities }
      for (const ability of GN_ABILITIES) {
        const aState = updatedAbilities[ability.id]
        if (aState && !aState.unlocked) {
          const levelReq = ability.requiredLevel
          const effectiveLevel = prev.titleIndex + 1
          if (effectiveLevel >= levelReq) {
            updatedAbilities[ability.id] = { ...aState, unlocked: true }
            changed = true
          }
        }
      }
      if (!changed) return prev
      return { ...prev, abilities: updatedAbilities }
    })
  }, [state.titleIndex])

  /* ==============================================================
     ZONE UNLOCK EFFECT
     ============================================================== */

  useEffect(() => {
    setState((prev) => {
      let changed = false
      const updatedZones = { ...prev.zones }
      for (const zone of GN_ZONES) {
        const zState = updatedZones[zone.id]
        if (zState && !zState.unlocked) {
          const effectiveLevel = prev.titleIndex + 1
          if (effectiveLevel >= zone.unlockLevel) {
            updatedZones[zone.id] = { ...zState, unlocked: true }
            changed = true
          }
        }
      }
      if (!changed) return prev
      return { ...prev, zones: updatedZones }
    })
  }, [state.titleIndex])

  /* ==============================================================
     RETURN API
     ============================================================== */

  return {
    // State
    plants: state.plants,
    zones: state.zones,
    tools: state.tools,
    structures: state.structures,
    abilities: state.abilities,
    achievements: state.achievements,
    creatures: state.creatures,
    currentZone: state.currentZone,
    gardenEnergy: state.gardenEnergy,
    maxEnergy: state.maxEnergy,
    naturePoints: state.naturePoints,
    harvestCount: state.harvestCount,
    seedsCollected: state.seedsCollected,
    titleIndex: state.titleIndex,
    gardenReputation: state.gardenReputation,
    weatherCondition: state.weatherCondition,
    dailyTask: state.dailyTask,
    activeAbility: state.activeAbility,
    compostBinAmount: state.compostBinAmount,
    treasureFound: state.treasureFound,
    playTimeMinutes: state.playTimeMinutes,

    // Constants
    GN_MAX_ENERGY: GN_MAX_ENERGY_CONST,
    GN_PLANT_COUNT,
    GN_ZONE_COUNT,
    GN_TOOL_COUNT,
    GN_STRUCTURE_COUNT,
    GN_ABILITY_COUNT,
    GN_CREATURE_COUNT,
    GN_ACHIEVEMENT_COUNT,
    GN_TITLE_COUNT,
    GN_PLOT_TOTAL,
    GN_COLOR,
    GN_WEATHER_BONUS,
    GN_ALL_RARITIES,

    // Data definitions
    plantDefs,
    zoneDefs,
    toolDefs,
    structureDefs,
    abilityDefs,
    achievementDefs,
    titleDefs,
    creatureDefs,

    // Memoized derived
    currentZoneDef,
    currentWeather,
    weatherGrowthMultiplier,
    unlockedZones,
    ownedTools,
    builtStructures,
    unlockedAbilities,
    unlockedAchievements,
    discoveredCreatures,
    befriendedCreatures,
    availablePlots,
    activePlots,
    ripePlots,
    plantsByZone,
    plantsByRarity,
    creaturesByZone,
    toolsByCategory,
    abilitiesByRarity,
    structuresByLevel,
    zoneCreaturesState,
    zonePlantDefs,
    totalStructureBonus,
    energyPercent,
    compostPercent,
    gardenSummary,
    titleInfo,
    nextTitleInfo,
    titleProgress,
    activeAbilityInfo,
    dailyTaskInfo,
    overallProgress,

    // Actions
    plantSeed,
    waterPlant,
    harvestCrop,
    upgradeStructure,
    activateAbility,
    befriendCreature,
    exploreZone,
    compostWaste,
    fertilizeGarden,
    acquireTool,
    moveToZone,
    unlockZone,
    forceWeather,
    refreshDailyTask,
    completeDailyTask,
    checkAchievements,
    resetGarden,
    saveGarden,
    addNaturePoints,
    spendEnergy,
    clearActiveAbility,

    // Getters
    getTitle,
    getProgress,
    getStats,
    getStructureUpgradeCost,
    getStructureBonus,
    getZoneUnlockCost,
    getPlantGrowthPercent,
    getAbilityCooldownRemaining,
  }
}
