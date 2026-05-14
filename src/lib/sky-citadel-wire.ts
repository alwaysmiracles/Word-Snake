'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// =============================================================================
// Sky Citadel Wire — Floating Sky Fortress Management Mini-Game
// All constants use SK_ prefix. All hook functions use sk prefix.
// Sky-blue / white / gold color theme.
// =============================================================================

// === TYPE DEFINITIONS ===

export type SkRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type SkBuildingCategory = 'defense' | 'production' | 'utility' | 'military' | 'special'
export type SkWeatherType = 'clear' | 'cloudy' | 'rain' | 'storm' | 'wind' | 'snow' | 'aurora' | 'cosmic'
export type SkVehicleCategory = 'scout' | 'cruiser' | 'battleship' | 'transport' | 'legendary'
export type SkWeaponType = 'melee' | 'ranged' | 'magical' | 'siege' | 'bombardment'

// === RARITY CONSTANTS ===

export const SK_RARITY_COMMON: SkRarity = 'common'
export const SK_RARITY_UNCOMMON: SkRarity = 'uncommon'
export const SK_RARITY_RARE: SkRarity = 'rare'
export const SK_RARITY_EPIC: SkRarity = 'epic'
export const SK_RARITY_LEGENDARY: SkRarity = 'legendary'

export const SK_RARITY_COLORS: Record<SkRarity, string> = {
  [SK_RARITY_COMMON]: '#87CEEB',
  [SK_RARITY_UNCOMMON]: '#4682B4',
  [SK_RARITY_RARE]: '#1E90FF',
  [SK_RARITY_EPIC]: '#FFD700',
  [SK_RARITY_LEGENDARY]: '#FFF8DC',
}

export const SK_RARITY_XP_MULTIPLIER: Record<SkRarity, number> = {
  [SK_RARITY_COMMON]: 1,
  [SK_RARITY_UNCOMMON]: 1.5,
  [SK_RARITY_RARE]: 2.5,
  [SK_RARITY_EPIC]: 4,
  [SK_RARITY_LEGENDARY]: 7,
}

export const SK_RARITY_ICONS: Record<SkRarity, string> = {
  [SK_RARITY_COMMON]: '☁️',
  [SK_RARITY_UNCOMMON]: '⛅',
  [SK_RARITY_RARE]: '🌩️',
  [SK_RARITY_EPIC]: '⭐',
  [SK_RARITY_LEGENDARY]: '👑',
}

// === COLOR THEME ===

export const SK_COLOR_SKY_BLUE = '#87CEEB'
export const SK_COLOR_CERULEAN = '#1E90FF'
export const SK_COLOR_LIGHT_BLUE = '#ADD8E6'
export const SK_COLOR_PALE_WHITE = '#F0F8FF'
export const SK_COLOR_GOLD = '#FFD700'
export const SK_COLOR_DEEP_BLUE = '#0A1128'
export const SK_COLOR_CLOUD_WHITE = '#ECEFF1'
export const SK_COLOR_STEEL_BLUE = '#4682B4'
export const SK_COLOR_SUNSET = '#FF8C42'
export const SK_COLOR_AURORA = '#69F0AE'
export const SK_COLOR_TWILIGHT = '#1A1A40'
export const SK_COLOR_IVORY = '#FFFFF0'

// === INTERFACES ===

export interface SkBuildingDef {
  id: string
  name: string
  category: SkBuildingCategory
  rarity: SkRarity
  baseCost: number
  upgradeMultiplier: number
  maxLevel: number
  defense: number
  productionPerHour: Record<string, number>
  description: string
  color: string
}

export interface SkIslandDef {
  id: string
  name: string
  altitude: number
  unlockLevel: number
  unlockCost: number
  maxBuildings: number
  primaryResource: string
  secondaryResource: string
  weatherPattern: SkWeatherType
  description: string
  color: string
}

export interface SkVehicleDef {
  id: string
  name: string
  category: SkVehicleCategory
  rarity: SkRarity
  speed: number
  cargo: number
  combatPower: number
  cost: number
  unlockLevel: number
  description: string
  color: string
}

export interface SkWeaponDef {
  id: string
  name: string
  type: SkWeaponType
  rarity: SkRarity
  attack: number
  defense: number
  range: number
  cost: number
  unlockLevel: number
  description: string
  color: string
}

export interface SkTitleDef {
  level: number
  title: string
  description: string
}

export interface SkAchievementDef {
  id: string
  name: string
  description: string
  condition: string
  rewardXp: number
  hidden: boolean
  icon: string
}

export interface SkCombatEntry {
  id: string
  enemy: string
  result: 'victory' | 'defeat' | 'draw'
  reward: number
  xpGained: number
  timestamp: number
}

export interface SkWeatherEvent {
  id: string
  weather: SkWeatherType
  intensity: number
  startedAt: number
  duration: number
}

// === STATE INTERFACES ===

export interface SkBuildingInstance {
  buildingId: string
  islandId: string
  level: number
  hp: number
  maxHp: number
}

export interface SkIslandInstance {
  islandId: string
  unlocked: boolean
  expanded: boolean
  expansionLevel: number
  buildings: SkBuildingInstance[]
}

export interface SkVehicleInstance {
  vehicleId: string
  owned: boolean
  level: number
  hp: number
  maxHp: number
  assignedIsland: string | null
}

export interface SkWeaponInstance {
  weaponId: string
  owned: boolean
  equipped: boolean
  level: number
}

export interface SkAchievementState {
  achievementId: string
  unlocked: boolean
  unlockedAt: number | null
}

export interface SkyCitadelState {
  level: number
  xp: number
  totalXp: number
  gold: number
  crystals: number
  title: string
  weather: SkWeatherType
  weatherEvent: SkWeatherEvent | null
  islands: SkIslandInstance[]
  vehicles: SkVehicleInstance[]
  weapons: SkWeaponInstance[]
  achievements: SkAchievementState[]
  combatLog: SkCombatEntry[]
  equippedVehicle: string | null
  equippedWeapon: string | null
  totalBuildingsBuilt: number
  totalIslandsExpanded: number
  totalVehiclesCrafted: number
  totalWeaponsForged: number
  totalCombatsWon: number
  totalCombatsLost: number
  totalResourcesCollected: number
  totalGoldEarned: number
  totalCrystalsEarned: number
  streak: number
  bestStreak: number
  lastPlayedDate: string
  citadelName: string
  tick: number
}

// === SK_RARITY TIER DATA ===

export const SK_RARITY_TIERS: { rarity: SkRarity; label: string; color: string; icon: string; dropWeight: number }[] = [
  { rarity: SK_RARITY_COMMON, label: 'Common', color: SK_COLOR_SKY_BLUE, icon: '☁️', dropWeight: 45 },
  { rarity: SK_RARITY_UNCOMMON, label: 'Uncommon', color: SK_COLOR_STEEL_BLUE, icon: '⛅', dropWeight: 28 },
  { rarity: SK_RARITY_RARE, label: 'Rare', color: SK_COLOR_CERULEAN, icon: '🌩️', dropWeight: 15 },
  { rarity: SK_RARITY_EPIC, label: 'Epic', color: SK_COLOR_GOLD, icon: '⭐', dropWeight: 5 },
  { rarity: SK_RARITY_LEGENDARY, label: 'Legendary', color: SK_COLOR_IVORY, icon: '👑', dropWeight: 1 },
]

// === SK_ISLANDS (8 floating islands) ===

export const SK_ISLANDS: SkIslandDef[] = [
  {
    id: 'cloud_peak', name: 'Cloud Peak', altitude: 1200, unlockLevel: 1, unlockCost: 0,
    maxBuildings: 6, primaryResource: 'wind_shard', secondaryResource: 'cloud_silk',
    weatherPattern: 'clear', description: 'The first island of every Sky Lord. Bathed in eternal sunshine and gentle breezes.',
    color: '#87CEEB',
  },
  {
    id: 'thunder_mesa', name: 'Thunder Mesa', altitude: 3400, unlockLevel: 5, unlockCost: 500,
    maxBuildings: 8, primaryResource: 'lightning_essence', secondaryResource: 'storm_crystal',
    weatherPattern: 'storm', description: 'A jagged floating mesa where lightning strikes the rocks without ceasing.',
    color: '#4682B4',
  },
  {
    id: 'dawn_plateau', name: 'Dawn Plateau', altitude: 2100, unlockLevel: 10, unlockCost: 1200,
    maxBuildings: 8, primaryResource: 'sun_fragment', secondaryResource: 'dew_drop',
    weatherPattern: 'clear', description: 'A vast plateau that catches the first light of every dawn, radiating golden warmth.',
    color: '#FFD700',
  },
  {
    id: 'twilight_atoll', name: 'Twilight Atoll', altitude: 2800, unlockLevel: 15, unlockCost: 2000,
    maxBuildings: 10, primaryResource: 'moon_dust', secondaryResource: 'star_fragment',
    weatherPattern: 'cloudy', description: 'A crescent-shaped island perpetually bathed in the soft purple glow of twilight.',
    color: '#7B68EE',
  },
  {
    id: 'aurora_reach', name: 'Aurora Reach', altitude: 6500, unlockLevel: 22, unlockCost: 4000,
    maxBuildings: 10, primaryResource: 'aurora_gem', secondaryResource: 'prism_shard',
    weatherPattern: 'aurora', description: 'The highest accessible island crowned with eternal aurora lights dancing across the sky.',
    color: '#69F0AE',
  },
  {
    id: 'zephyr_haven', name: 'Zephyr Haven', altitude: 1500, unlockLevel: 8, unlockCost: 800,
    maxBuildings: 8, primaryResource: 'wind_shard', secondaryResource: 'cloud_silk',
    weatherPattern: 'wind', description: 'A serene sanctuary wrapped in perpetual gentle zephyrs. Ideal for wind-powered structures.',
    color: '#ADD8E6',
  },
  {
    id: 'nimbus_crest', name: 'Nimbus Crest', altitude: 4500, unlockLevel: 18, unlockCost: 3000,
    maxBuildings: 10, primaryResource: 'storm_crystal', secondaryResource: 'lightning_essence',
    weatherPattern: 'storm', description: 'A towering crest of storm clouds that hums with electrical energy day and night.',
    color: '#5C6BC0',
  },
  {
    id: 'starlight_isle', name: 'Starlight Isle', altitude: 8800, unlockLevel: 30, unlockCost: 8000,
    maxBuildings: 14, primaryResource: 'star_fragment', secondaryResource: 'aurora_gem',
    weatherPattern: 'cosmic', description: 'The legendary final island where stars literally fall from the sky, embedding in the earth.',
    color: '#FFF8DC',
  },
]

// === SK_BUILDINGS (32 floating structures) ===

export const SK_BUILDINGS: SkBuildingDef[] = [
  {
    id: 'cloud_tower', name: 'Cloud Tower', category: 'defense', rarity: SK_RARITY_COMMON,
    baseCost: 100, upgradeMultiplier: 1.4, maxLevel: 20, defense: 15,
    productionPerHour: { gold: 2 }, description: 'A watchtower sculpted from hardened cumulus. Provides basic aerial surveillance.',
    color: '#B0C4DE',
  },
  {
    id: 'wind_mill', name: 'Wind Mill', category: 'production', rarity: SK_RARITY_COMMON,
    baseCost: 80, upgradeMultiplier: 1.3, maxLevel: 20, defense: 5,
    productionPerHour: { wind_shard: 3 }, description: 'Harnesses the eternal winds to grind atmospheric elements into Wind Shards.',
    color: '#87CEEB',
  },
  {
    id: 'storm_spire', name: 'Storm Spire', category: 'military', rarity: SK_RARITY_RARE,
    baseCost: 300, upgradeMultiplier: 1.5, maxLevel: 15, defense: 30,
    productionPerHour: { lightning_essence: 2 }, description: 'A towering spire that attracts and channels lightning for defense.',
    color: '#4682B4',
  },
  {
    id: 'sun_observatory', name: 'Sun Observatory', category: 'utility', rarity: SK_RARITY_UNCOMMON,
    baseCost: 200, upgradeMultiplier: 1.4, maxLevel: 15, defense: 10,
    productionPerHour: { sun_fragment: 2 }, description: 'Observes celestial movements and concentrates sunlight into usable fragments.',
    color: '#FFD700',
  },
  {
    id: 'moon_dial', name: 'Moon Dial', category: 'special', rarity: SK_RARITY_EPIC,
    baseCost: 500, upgradeMultiplier: 1.6, maxLevel: 10, defense: 20,
    productionPerHour: { moon_dust: 3 }, description: 'An ancient dial that tracks moon phases and harvests moon dust from lunar rays.',
    color: '#C0C0C0',
  },
  {
    id: 'star_forge', name: 'Star Forge', category: 'special', rarity: SK_RARITY_LEGENDARY,
    baseCost: 1000, upgradeMultiplier: 2.0, maxLevel: 5, defense: 50,
    productionPerHour: { star_fragment: 2 }, description: 'A mythical forge that melts fallen stars into powerful weapons and tools.',
    color: '#FFF8DC',
  },
  {
    id: 'lightning_rod', name: 'Lightning Rod', category: 'defense', rarity: SK_RARITY_UNCOMMON,
    baseCost: 150, upgradeMultiplier: 1.4, maxLevel: 18, defense: 20,
    productionPerHour: { lightning_essence: 1 }, description: 'A massive conductor that grounds lightning strikes and converts them to energy.',
    color: '#FFD700',
  },
  {
    id: 'rainbow_bridge', name: 'Rainbow Bridge', category: 'utility', rarity: SK_RARITY_EPIC,
    baseCost: 600, upgradeMultiplier: 1.8, maxLevel: 8, defense: 15,
    productionPerHour: { gold: 5 }, description: 'A shimmering bridge of prismatic light connecting distant island structures.',
    color: '#FF69B4',
  },
  {
    id: 'aether_dock', name: 'Aether Dock', category: 'utility', rarity: SK_RARITY_UNCOMMON,
    baseCost: 250, upgradeMultiplier: 1.4, maxLevel: 15, defense: 10,
    productionPerHour: { gold: 3 }, description: 'A floating dock where sky ships anchor and resupply between voyages.',
    color: '#87CEEB',
  },
  {
    id: 'gravity_well', name: 'Gravity Well', category: 'military', rarity: SK_RARITY_LEGENDARY,
    baseCost: 1200, upgradeMultiplier: 2.0, maxLevel: 5, defense: 60,
    productionPerHour: {}, description: 'Generates localized gravity anomalies that crush incoming aerial threats.',
    color: '#1A1A40',
  },
  {
    id: 'sky_garden', name: 'Sky Garden', category: 'production', rarity: SK_RARITY_COMMON,
    baseCost: 60, upgradeMultiplier: 1.3, maxLevel: 20, defense: 3,
    productionPerHour: { dew_drop: 4 }, description: 'Enchanted gardens floating on cloud beds, producing magical morning dew.',
    color: '#98FB98',
  },
  {
    id: 'crystal_spire', name: 'Crystal Spire', category: 'defense', rarity: SK_RARITY_RARE,
    baseCost: 350, upgradeMultiplier: 1.5, maxLevel: 15, defense: 25,
    productionPerHour: { prism_shard: 2 }, description: 'A spire of living crystal that refracts light into devastating beams.',
    color: '#B388FF',
  },
  {
    id: 'wind_loom', name: 'Wind Loom', category: 'production', rarity: SK_RARITY_UNCOMMON,
    baseCost: 120, upgradeMultiplier: 1.3, maxLevel: 20, defense: 5,
    productionPerHour: { cloud_silk: 3 }, description: 'Weaves raw wind currents into bolts of enchanted Cloud Silk fabric.',
    color: '#ECEFF1',
  },
  {
    id: 'thunder_forge', name: 'Thunder Forge', category: 'military', rarity: SK_RARITY_EPIC,
    baseCost: 700, upgradeMultiplier: 1.7, maxLevel: 10, defense: 35,
    productionPerHour: { storm_crystal: 2 }, description: 'A forge powered by thunder, where legendary weapons are tempered in lightning.',
    color: '#FF8C42',
  },
  {
    id: 'aurora_beacon', name: 'Aurora Beacon', category: 'special', rarity: SK_RARITY_EPIC,
    baseCost: 800, upgradeMultiplier: 1.8, maxLevel: 8, defense: 25,
    productionPerHour: { aurora_gem: 1 }, description: 'Projects aurora light skyward, boosting all island production and defense.',
    color: '#69F0AE',
  },
  {
    id: 'cloud_workshop', name: 'Cloud Workshop', category: 'utility', rarity: SK_RARITY_COMMON,
    baseCost: 90, upgradeMultiplier: 1.3, maxLevel: 20, defense: 8,
    productionPerHour: { gold: 4 }, description: 'A workshop where artisans craft tools and trinkets from condensed cloud matter.',
    color: '#B0C4DE',
  },
  {
    id: 'starlight_archive', name: 'Starlight Archive', category: 'utility', rarity: SK_RARITY_RARE,
    baseCost: 400, upgradeMultiplier: 1.5, maxLevel: 12, defense: 15,
    productionPerHour: { star_fragment: 1 }, description: 'An ancient library that stores knowledge written in starlight on crystal pages.',
    color: '#FFFACD',
  },
  {
    id: 'zephyr_hangar', name: 'Zephyr Hangar', category: 'utility', rarity: SK_RARITY_UNCOMMON,
    baseCost: 300, upgradeMultiplier: 1.4, maxLevel: 12, defense: 12,
    productionPerHour: {}, description: 'A reinforced hangar that houses and repairs sky vehicles between missions.',
    color: '#ADD8E6',
  },
  {
    id: 'nimbus_armory', name: 'Nimbus Armory', category: 'military', rarity: SK_RARITY_RARE,
    baseCost: 450, upgradeMultiplier: 1.5, maxLevel: 12, defense: 30,
    productionPerHour: {}, description: 'Stores and maintains aerial weapons. Boosts combat effectiveness of garrisoned forces.',
    color: '#5C6BC0',
  },
  {
    id: 'celestial_observatory', name: 'Celestial Observatory', category: 'special', rarity: SK_RARITY_LEGENDARY,
    baseCost: 1500, upgradeMultiplier: 2.0, maxLevel: 3, defense: 40,
    productionPerHour: { star_fragment: 3, moon_dust: 2 }, description: 'The ultimate astronomical station that maps every star in the sky for strategic advantage.',
    color: '#E6E6FA',
  },
  {
    id: 'storm_shield_gen', name: 'Storm Shield Generator', category: 'defense', rarity: SK_RARITY_EPIC,
    baseCost: 650, upgradeMultiplier: 1.7, maxLevel: 10, defense: 45,
    productionPerHour: { storm_crystal: 1 }, description: 'Generates a protective storm barrier around the island that damages attackers.',
    color: '#4A4A8A',
  },
  {
    id: 'wind_harvester', name: 'Wind Harvester', category: 'production', rarity: SK_RARITY_COMMON,
    baseCost: 70, upgradeMultiplier: 1.3, maxLevel: 20, defense: 5,
    productionPerHour: { wind_shard: 4 }, description: 'Massive turbine blades that harvest pure wind energy from the upper atmosphere.',
    color: '#80DEEA',
  },
  {
    id: 'aether_refinery', name: 'Aether Refinery', category: 'production', rarity: SK_RARITY_RARE,
    baseCost: 350, upgradeMultiplier: 1.5, maxLevel: 15, defense: 12,
    productionPerHour: { gold: 6 }, description: 'Refines raw aether from the atmosphere into concentrated gold nuggets.',
    color: '#FFD700',
  },
  {
    id: 'gravity_elevator', name: 'Gravity Elevator', category: 'utility', rarity: SK_RARITY_EPIC,
    baseCost: 900, upgradeMultiplier: 1.8, maxLevel: 8, defense: 18,
    productionPerHour: {}, description: 'An anti-gravity lift system allowing rapid transport between island levels.',
    color: '#9E9E9E',
  },
  {
    id: 'rainbow_loom', name: 'Rainbow Loom', category: 'production', rarity: SK_RARITY_RARE,
    baseCost: 280, upgradeMultiplier: 1.5, maxLevel: 15, defense: 8,
    productionPerHour: { prism_shard: 3 }, description: 'Captures the colors of rainbows and weaves them into prismatic shards.',
    color: '#FF6B9D',
  },
  {
    id: 'sky_barn', name: 'Sky Barn', category: 'production', rarity: SK_RARITY_COMMON,
    baseCost: 50, upgradeMultiplier: 1.2, maxLevel: 20, defense: 4,
    productionPerHour: { dew_drop: 5 }, description: 'A floating barn that tends to cloud-nourished sky goats and wind-touched birds.',
    color: '#DEB887',
  },
  {
    id: 'frost_spire', name: 'Frost Spire', category: 'defense', rarity: SK_RARITY_UNCOMMON,
    baseCost: 180, upgradeMultiplier: 1.4, maxLevel: 18, defense: 22,
    productionPerHour: {}, description: 'Emanates a freezing aura that slows and damages approaching aerial enemies.',
    color: '#B3E5FC',
  },
  {
    id: 'ember_furnace', name: 'Ember Furnace', category: 'production', rarity: SK_RARITY_RARE,
    baseCost: 320, upgradeMultiplier: 1.5, maxLevel: 15, defense: 10,
    productionPerHour: { sun_fragment: 3 }, description: 'Burns captured sunlight in a magical furnace to create concentrated Sun Fragments.',
    color: '#FF6347',
  },
  {
    id: 'mist_temple', name: 'Mist Temple', category: 'special', rarity: SK_RARITY_EPIC,
    baseCost: 750, upgradeMultiplier: 1.7, maxLevel: 8, defense: 28,
    productionPerHour: { moon_dust: 2 }, description: 'An ancient temple shrouded in eternal mist that empowers defensive enchantments.',
    color: '#CFD8DC',
  },
  {
    id: 'dawn_pavilion', name: 'Dawn Pavilion', category: 'utility', rarity: SK_RARITY_RARE,
    baseCost: 380, upgradeMultiplier: 1.5, maxLevel: 12, defense: 14,
    productionPerHour: { gold: 5, sun_fragment: 1 }, description: 'An elegant pavilion that amplifies dawn light, providing restorative energy.',
    color: '#FFE4B5',
  },
  {
    id: 'twilight_spire', name: 'Twilight Spire', category: 'defense', rarity: SK_RARITY_EPIC,
    baseCost: 700, upgradeMultiplier: 1.7, maxLevel: 10, defense: 40,
    productionPerHour: { moon_dust: 1 }, description: 'A spire that harnesses the mysterious power of twilight to cloak the island.',
    color: '#7B68EE',
  },
  {
    id: 'star_chart_chamber', name: 'Star Chart Chamber', category: 'utility', rarity: SK_RARITY_LEGENDARY,
    baseCost: 1300, upgradeMultiplier: 2.0, maxLevel: 5, defense: 35,
    productionPerHour: { star_fragment: 2 }, description: 'Maps the heavens in real-time, revealing optimal strategies and resource locations.',
    color: '#FFFACD',
  },
]

// === SK_VEHICLES (17 sky ships/vehicles) ===

export const SK_VEHICLES: SkVehicleDef[] = [
  {
    id: 'air_skiff', name: 'Air Skiff', category: 'scout', rarity: SK_RARITY_COMMON,
    speed: 8, cargo: 10, combatPower: 5, cost: 100, unlockLevel: 1,
    description: 'A small nimble skiff for quick reconnaissance of surrounding airspace.',
    color: '#87CEEB',
  },
  {
    id: 'storm_glider', name: 'Storm Glider', category: 'scout', rarity: SK_RARITY_UNCOMMON,
    speed: 12, cargo: 8, combatPower: 15, cost: 250, unlockLevel: 5,
    description: 'Rides storm currents with incredible speed. Ideal for lightning-fast missions.',
    color: '#4682B4',
  },
  {
    id: 'cloud_cruiser', name: 'Cloud Cruiser', category: 'cruiser', rarity: SK_RARITY_UNCOMMON,
    speed: 6, cargo: 30, combatPower: 20, cost: 400, unlockLevel: 8,
    description: 'A mid-size cruiser that cuts through cloud banks with grace and firepower.',
    color: '#B0C4DE',
  },
  {
    id: 'wind_rider', name: 'Wind Rider', category: 'scout', rarity: SK_RARITY_COMMON,
    speed: 10, cargo: 12, combatPower: 8, cost: 150, unlockLevel: 3,
    description: 'A personal wind-powered craft favored by solo sky scouts and messengers.',
    color: '#ADD8E6',
  },
  {
    id: 'thunder_hawk', name: 'Thunder Hawk', category: 'battleship', rarity: SK_RARITY_RARE,
    speed: 7, cargo: 25, combatPower: 50, cost: 800, unlockLevel: 12,
    description: 'A formidable battleship that strikes enemies with the fury of a thunderhawk.',
    color: '#FFD700',
  },
  {
    id: 'sky_galleon', name: 'Sky Galleon', category: 'transport', rarity: SK_RARITY_RARE,
    speed: 4, cargo: 80, combatPower: 35, cost: 700, unlockLevel: 14,
    description: 'A massive floating galleon that serves as a mobile fortress and transport hub.',
    color: '#DEB887',
  },
  {
    id: 'zephyr_sloop', name: 'Zephyr Sloop', category: 'scout', rarity: SK_RARITY_COMMON,
    speed: 9, cargo: 15, combatPower: 10, cost: 120, unlockLevel: 2,
    description: 'A sleek sloop that catches the gentlest breezes for near-silent approach.',
    color: '#E0F7FA',
  },
  {
    id: 'nimbus_yacht', name: 'Nimbus Yacht', category: 'cruiser', rarity: SK_RARITY_EPIC,
    speed: 5, cargo: 40, combatPower: 40, cost: 1200, unlockLevel: 20,
    description: 'A luxurious yacht built atop a nimbus cloud. Combines comfort with power.',
    color: '#ECEFF1',
  },
  {
    id: 'aurora_vessel', name: 'Aurora Vessel', category: 'cruiser', rarity: SK_RARITY_EPIC,
    speed: 8, cargo: 35, combatPower: 55, cost: 1500, unlockLevel: 22,
    description: 'A ship wrapped in aurora light that confuses enemies and shields allies.',
    color: '#69F0AE',
  },
  {
    id: 'star_chariot', name: 'Star Chariot', category: 'legendary', rarity: SK_RARITY_LEGENDARY,
    speed: 15, cargo: 20, combatPower: 80, cost: 3000, unlockLevel: 35,
    description: 'A chariot pulled by starlight horses that can traverse the highest skies.',
    color: '#FFF8DC',
  },
  {
    id: 'dawn_brigantine', name: 'Dawn Brigantine', category: 'cruiser', rarity: SK_RARITY_RARE,
    speed: 7, cargo: 28, combatPower: 30, cost: 600, unlockLevel: 10,
    description: 'A swift brigantine that blazes with the golden light of the rising sun.',
    color: '#FFD700',
  },
  {
    id: 'twilight_cutter', name: 'Twilight Cutter', category: 'battleship', rarity: SK_RARITY_EPIC,
    speed: 9, cargo: 22, combatPower: 60, cost: 1400, unlockLevel: 25,
    description: 'A stealthy warship cloaked in twilight that strikes from the shadows.',
    color: '#7B68EE',
  },
  {
    id: 'cloud_runner', name: 'Cloud Runner', category: 'scout', rarity: SK_RARITY_UNCOMMON,
    speed: 14, cargo: 6, combatPower: 12, cost: 200, unlockLevel: 6,
    description: 'The fastest personal craft in the fleet, capable of outrunning most threats.',
    color: '#B3E5FC',
  },
  {
    id: 'storm_wing', name: 'Storm Wing', category: 'battleship', rarity: SK_RARITY_RARE,
    speed: 6, cargo: 20, combatPower: 45, cost: 900, unlockLevel: 16,
    description: 'A wing-shaped warship that rides inside storm systems as an offensive platform.',
    color: '#5C6BC0',
  },
  {
    id: 'aether_frigate', name: 'Aether Frigate', category: 'battleship', rarity: SK_RARITY_EPIC,
    speed: 7, cargo: 30, combatPower: 65, cost: 1800, unlockLevel: 28,
    description: 'A powerful frigate powered by refined aether, the backbone of any sky armada.',
    color: '#80DEEA',
  },
  {
    id: 'gravity_skiff', name: 'Gravity Skiff', category: 'legendary', rarity: SK_RARITY_LEGENDARY,
    speed: 20, cargo: 15, combatPower: 90, cost: 3500, unlockLevel: 40,
    description: 'Defies gravity itself. The pinnacle of sky engineering with unmatched speed.',
    color: '#E6E6FA',
  },
  {
    id: 'rainbow_schooner', name: 'Rainbow Schooner', category: 'transport', rarity: SK_RARITY_EPIC,
    speed: 5, cargo: 60, combatPower: 25, cost: 1000, unlockLevel: 18,
    description: 'A vibrant schooner that sails on rainbow bridges between distant islands.',
    color: '#FF69B4',
  },
]

// === SK_WEAPONS (22 aerial weapons) ===

export const SK_WEAPONS: SkWeaponDef[] = [
  {
    id: 'wind_lance', name: 'Wind Lance', type: 'ranged', rarity: SK_RARITY_COMMON,
    attack: 8, defense: 2, range: 5, cost: 50, unlockLevel: 1,
    description: 'A lance that fires concentrated bolts of wind with surprising force.',
    color: '#87CEEB',
  },
  {
    id: 'thunder_cannon', name: 'Thunder Cannon', type: 'bombardment', rarity: SK_RARITY_RARE,
    attack: 35, defense: 5, range: 8, cost: 400, unlockLevel: 12,
    description: 'A devastating cannon that fires bolts of concentrated thunder and lightning.',
    color: '#FFD700',
  },
  {
    id: 'lightning_bolt', name: 'Lightning Bolt', type: 'magical', rarity: SK_RARITY_COMMON,
    attack: 12, defense: 0, range: 6, cost: 80, unlockLevel: 2,
    description: 'A bolt of pure lightning that arcs between multiple aerial targets.',
    color: '#FFD700',
  },
  {
    id: 'cloud_net', name: 'Cloud Net', type: 'ranged', rarity: SK_RARITY_UNCOMMON,
    attack: 5, defense: 15, range: 4, cost: 120, unlockLevel: 4,
    description: 'A net woven from hardened cloud fibers that entangles enemy fliers.',
    color: '#ECEFF1',
  },
  {
    id: 'star_beam', name: 'Star Beam', type: 'magical', rarity: SK_RARITY_EPIC,
    attack: 50, defense: 10, range: 10, cost: 800, unlockLevel: 22,
    description: 'Channels concentrated starlight into a devastating beam of energy.',
    color: '#FFF8DC',
  },
  {
    id: 'aether_missile', name: 'Aether Missile', type: 'bombardment', rarity: SK_RARITY_RARE,
    attack: 30, defense: 0, range: 12, cost: 500, unlockLevel: 15,
    description: 'Missiles powered by raw aether that track targets across great distances.',
    color: '#B388FF',
  },
  {
    id: 'gravity_bomb', name: 'Gravity Bomb', type: 'bombardment', rarity: SK_RARITY_LEGENDARY,
    attack: 70, defense: 0, range: 8, cost: 1500, unlockLevel: 35,
    description: 'Creates a localized gravity well that crushes everything in its blast radius.',
    color: '#1A1A40',
  },
  {
    id: 'sun_flare', name: 'Sun Flare', type: 'magical', rarity: SK_RARITY_UNCOMMON,
    attack: 18, defense: 5, range: 6, cost: 150, unlockLevel: 6,
    description: 'Releases a blinding burst of concentrated sunlight that sears enemies.',
    color: '#FF8C42',
  },
  {
    id: 'moon_ray', name: 'Moon Ray', type: 'magical', rarity: SK_RARITY_RARE,
    attack: 28, defense: 12, range: 7, cost: 350, unlockLevel: 10,
    description: 'A beam of focused moonlight that can heal allies or freeze enemies.',
    color: '#C0C0C0',
  },
  {
    id: 'frost_shard', name: 'Frost Shard', type: 'ranged', rarity: SK_RARITY_UNCOMMON,
    attack: 15, defense: 3, range: 5, cost: 100, unlockLevel: 5,
    description: 'Launches razor-sharp shards of frozen cloud that slow and damage.',
    color: '#B3E5FC',
  },
  {
    id: 'storm_harpoon', name: 'Storm Harpoon', type: 'melee', rarity: SK_RARITY_RARE,
    attack: 32, defense: 8, range: 3, cost: 300, unlockLevel: 14,
    description: 'A massive harpoon charged with storm energy that pins enemies in place.',
    color: '#4682B4',
  },
  {
    id: 'zephyr_dart', name: 'Zephyr Dart', type: 'ranged', rarity: SK_RARITY_COMMON,
    attack: 6, defense: 1, range: 7, cost: 40, unlockLevel: 1,
    description: 'Tiny poisoned darts carried on the wind. Fast but low damage.',
    color: '#ADD8E6',
  },
  {
    id: 'nimbus_spear', name: 'Nimbus Spear', type: 'melee', rarity: SK_RARITY_EPIC,
    attack: 45, defense: 15, range: 2, cost: 700, unlockLevel: 20,
    description: 'A spear forged from hardened nimbus clouds that strikes with the weight of storms.',
    color: '#5C6BC0',
  },
  {
    id: 'aurora_pulse', name: 'Aurora Pulse', type: 'magical', rarity: SK_RARITY_EPIC,
    attack: 40, defense: 20, range: 6, cost: 900, unlockLevel: 25,
    description: 'Emits a wave of aurora energy that damages enemies and shields allies.',
    color: '#69F0AE',
  },
  {
    id: 'crystal_arrow', name: 'Crystal Arrow', type: 'ranged', rarity: SK_RARITY_RARE,
    attack: 25, defense: 2, range: 9, cost: 280, unlockLevel: 11,
    description: 'Arrows made from sky crystal that pierce through multiple targets.',
    color: '#B388FF',
  },
  {
    id: 'rainbow_blast', name: 'Rainbow Blast', type: 'bombardment', rarity: SK_RARITY_LEGENDARY,
    attack: 65, defense: 15, range: 10, cost: 2000, unlockLevel: 40,
    description: 'The full spectrum of light concentrated into a single devastating blast.',
    color: '#FF69B4',
  },
  {
    id: 'dawn_blade', name: 'Dawn Blade', type: 'melee', rarity: SK_RARITY_RARE,
    attack: 30, defense: 10, range: 1, cost: 350, unlockLevel: 13,
    description: 'A sword of hardened dawn light that cuts through clouds and armor alike.',
    color: '#FFD700',
  },
  {
    id: 'twilight_orb', name: 'Twilight Orb', type: 'magical', rarity: SK_RARITY_EPIC,
    attack: 42, defense: 18, range: 8, cost: 850, unlockLevel: 24,
    description: 'An orb of swirling twilight energy that can attack or defend depending on need.',
    color: '#7B68EE',
  },
  {
    id: 'star_nova', name: 'Star Nova', type: 'bombardment', rarity: SK_RARITY_LEGENDARY,
    attack: 80, defense: 5, range: 15, cost: 2500, unlockLevel: 45,
    description: 'Creates a miniature supernova that devastates everything within range.',
    color: '#FFFACD',
  },
  {
    id: 'sky_hammer', name: 'Sky Hammer', type: 'melee', rarity: SK_RARITY_UNCOMMON,
    attack: 20, defense: 12, range: 1, cost: 180, unlockLevel: 7,
    description: 'A massive hammer that creates shockwaves of compressed air on impact.',
    color: '#78909C',
  },
  {
    id: 'wind_slash', name: 'Wind Slash', type: 'melee', rarity: SK_RARITY_COMMON,
    attack: 10, defense: 4, range: 2, cost: 60, unlockLevel: 3,
    description: 'A curved blade that creates cutting wind edges extending its reach.',
    color: '#80DEEA',
  },
  {
    id: 'thunder_strike', name: 'Thunder Strike', type: 'magical', rarity: SK_RARITY_EPIC,
    attack: 55, defense: 8, range: 7, cost: 1100, unlockLevel: 28,
    description: 'Calls down a focused thunderstrike from the heavens onto a single target.',
    color: '#FFD740',
  },
]

// === SK_TITLES (8 rank titles) ===

export const SK_TITLES: SkTitleDef[] = [
  { level: 1, title: 'Sky Cadet', description: 'A new recruit to the Sky Citadel, learning the basics of aerial command.' },
  { level: 6, title: 'Cloud Walker', description: 'Has mastered walking on clouds and navigating the lower skies.' },
  { level: 12, title: 'Wind Commander', description: 'Commands wind currents and leads small squadrons of sky ships.' },
  { level: 18, title: 'Storm Warden', description: 'A guardian of the storms, able to weather any aerial assault.' },
  { level: 25, title: 'Thunder Lord', description: 'A master of thunder who commands respect across all floating islands.' },
  { level: 32, title: 'Sky Sovereign', description: 'Rules over a vast domain of floating islands with supreme authority.' },
  { level: 40, title: 'Celestial Guardian', description: 'Protector of the celestial realm, wielding power from the stars themselves.' },
  { level: 50, title: 'Celestial Emperor', description: 'The supreme ruler of all skies, commanding the heavens themselves.' },
]

// === SK_ACHIEVEMENTS (18 achievements) ===

export const SK_ACHIEVEMENTS: SkAchievementDef[] = [
  {
    id: 'first_tower', name: 'First Tower', description: 'Build your first structure on any island.',
    condition: 'totalBuildingsBuilt >= 1', rewardXp: 50, hidden: false, icon: '🏰',
  },
  {
    id: 'island_hopper', name: 'Island Hopper', description: 'Unlock 3 different floating islands.',
    condition: 'islandsUnlocked >= 3', rewardXp: 150, hidden: false, icon: '🏝️',
  },
  {
    id: 'master_builder', name: 'Master Builder', description: 'Build a total of 20 structures across all islands.',
    condition: 'totalBuildingsBuilt >= 20', rewardXp: 300, hidden: false, icon: '🏗️',
  },
  {
    id: 'fleet_commander', name: 'Fleet Commander', description: 'Own 5 different sky vehicles.',
    condition: 'totalVehiclesCrafted >= 5', rewardXp: 200, hidden: false, icon: '🚢',
  },
  {
    id: 'arsenal_master', name: 'Arsenal Master', description: 'Forge 10 different aerial weapons.',
    condition: 'totalWeaponsForged >= 10', rewardXp: 250, hidden: false, icon: '⚔️',
  },
  {
    id: 'weather_maker', name: 'Weather Maker', description: 'Change the weather 10 times.',
    condition: 'weatherChanges >= 10', rewardXp: 100, hidden: false, icon: '🌦️',
  },
  {
    id: 'combat_veteran', name: 'Combat Veteran', description: 'Win 15 aerial combat encounters.',
    condition: 'totalCombatsWon >= 15', rewardXp: 300, hidden: false, icon: '🗡️',
  },
  {
    id: 'untouchable', name: 'Untouchable', description: 'Win 5 combats without taking any losses.',
    condition: 'perfectCombats >= 5', rewardXp: 400, hidden: false, icon: '🛡️',
  },
  {
    id: 'sky_wealthy', name: 'Sky Wealthy', description: 'Accumulate 10,000 gold.',
    condition: 'gold >= 10000', rewardXp: 200, hidden: false, icon: '💰',
  },
  {
    id: 'crystal_hoarder', name: 'Crystal Hoarder', description: 'Accumulate 1,000 crystals.',
    condition: 'crystals >= 1000', rewardXp: 350, hidden: false, icon: '💎',
  },
  {
    id: 'full_expansion', name: 'Full Expansion', description: 'Fully expand all unlocked islands to max level.',
    condition: 'islandsExpanded >= 5', rewardXp: 500, hidden: false, icon: '📈',
  },
  {
    id: 'all_islands', name: 'Sky Dominator', description: 'Unlock all 8 floating islands.',
    condition: 'islandsUnlocked >= 8', rewardXp: 800, hidden: false, icon: '🌍',
  },
  {
    id: 'legendary_fleet', name: 'Legendary Fleet', description: 'Own a legendary-class vehicle.',
    condition: 'legendaryVehicles >= 1', rewardXp: 600, hidden: true, icon: '🚀',
  },
  {
    id: 'ultimate_weapon', name: 'Ultimate Weapon', description: 'Forge a legendary weapon.',
    condition: 'legendaryWeapons >= 1', rewardXp: 600, hidden: true, icon: '🏆',
  },
  {
    id: 'weather_master', name: 'Weather Master', description: 'Experience all 8 weather types.',
    condition: 'weatherTypesExperienced >= 8', rewardXp: 400, hidden: false, icon: '🌤️',
  },
  {
    id: 'streak_7', name: 'Week of Skies', description: 'Maintain a 7-day login streak.',
    condition: 'streak >= 7', rewardXp: 200, hidden: false, icon: '📅',
  },
  {
    id: 'streak_30', name: 'Month Above the Clouds', description: 'Maintain a 30-day login streak.',
    condition: 'streak >= 30', rewardXp: 1000, hidden: true, icon: '🌟',
  },
  {
    id: 'max_level', name: 'Celestial Ascension', description: 'Reach the maximum level of 50.',
    condition: 'level >= 50', rewardXp: 3000, hidden: true, icon: '👑',
  },
]

// === SK_MAX_LEVEL & SK_XP_TABLE ===

export const SK_MAX_LEVEL = 50

export const SK_XP_TABLE: number[] = Array.from({ length: SK_MAX_LEVEL }, (_, i) => {
  const level = i + 1
  return Math.floor(100 * Math.pow(level, 1.55) + level * 50)
})

// === SK_ENEMIES (15 aerial adversaries) ===

export interface SkEnemyDef {
  id: string
  name: string
  type: string
  power: number
  hp: number
  attack: number
  defense: number
  rewardGold: number
  rewardXp: number
  rewardCrystals: number
  minLevel: number
  description: string
  color: string
}

export const SK_ENEMIES: SkEnemyDef[] = [
  { id: 'wind_goblin', name: 'Wind Goblin', type: 'Humanoid', power: 10, hp: 40, attack: 8, defense: 5, rewardGold: 25, rewardXp: 15, rewardCrystals: 0, minLevel: 1, description: 'Small mischievous creatures that ride gusts of wind to raid sky farms.', color: '#80DEEA' },
  { id: 'storm_bat', name: 'Storm Bat', type: 'Beast', power: 15, hp: 35, attack: 12, defense: 3, rewardGold: 30, rewardXp: 20, rewardCrystals: 1, minLevel: 2, description: 'Bat-like creatures that dwell inside thunderclouds and attack at random.', color: '#5C6BC0' },
  { id: 'cloud_pirate', name: 'Cloud Pirate', type: 'Humanoid', power: 25, hp: 80, attack: 18, defense: 12, rewardGold: 60, rewardXp: 35, rewardCrystals: 2, minLevel: 4, description: 'Airborne marauders who plunder unprotected sky ships and islands.', color: '#78909C' },
  { id: 'thunder_drake', name: 'Thunder Drake', type: 'Dragon', power: 40, hp: 150, attack: 30, defense: 20, rewardGold: 120, rewardXp: 60, rewardCrystals: 5, minLevel: 8, description: 'Young drakes that nest in permanent thunderstorms, shooting lightning from their jaws.', color: '#FFD740' },
  { id: 'frost_eagle', name: 'Frost Eagle', type: 'Beast', power: 30, hp: 90, attack: 25, defense: 15, rewardGold: 80, rewardXp: 45, rewardCrystals: 3, minLevel: 6, description: 'Massive eagles from the frozen upper atmosphere whose talons freeze on contact.', color: '#B3E5FC' },
  { id: 'void_phantom', name: 'Void Phantom', type: 'Spectral', power: 50, hp: 120, attack: 40, defense: 10, rewardGold: 150, rewardXp: 80, rewardCrystals: 8, minLevel: 10, description: 'Ghostly entities from the void between islands that phase through physical barriers.', color: '#7B68EE' },
  { id: 'storm_giant', name: 'Storm Giant', type: 'Giant', power: 65, hp: 250, attack: 45, defense: 35, rewardGold: 200, rewardXp: 100, rewardCrystals: 10, minLevel: 14, description: 'Colossal beings formed from living storms that can level entire islands.', color: '#4682B4' },
  { id: 'sky_serpent', name: 'Sky Serpent', type: 'Dragon', power: 55, hp: 180, attack: 42, defense: 28, rewardGold: 180, rewardXp: 90, rewardCrystals: 8, minLevel: 12, description: 'Winged serpents that patrol the airspace between islands, guarding ancient sky relics.', color: '#69F0AE' },
  { id: 'aether_wraith', name: 'Aether Wraith', type: 'Spectral', power: 70, hp: 200, attack: 55, defense: 25, rewardGold: 250, rewardXp: 120, rewardCrystals: 15, minLevel: 18, description: 'Remnants of ancient aether engineers corrupted by raw magical energy.', color: '#B388FF' },
  { id: 'star_hawk', name: 'Star Hawk', type: 'Beast', power: 45, hp: 130, attack: 38, defense: 20, rewardGold: 140, rewardXp: 70, rewardCrystals: 6, minLevel: 10, description: 'Predatory birds that hunt at extreme altitudes, diving with the speed of falling stars.', color: '#FFF8DC' },
  { id: 'rainbow_leviathan', name: 'Rainbow Leviathan', type: 'Mythical', power: 85, hp: 400, attack: 60, defense: 40, rewardGold: 350, rewardXp: 180, rewardCrystals: 20, minLevel: 22, description: 'A colossal creature that swims through rainbow bridges between islands.', color: '#FF69B4' },
  { id: 'dark_nimbus', name: 'Dark Nimbus', type: 'Elemental', power: 60, hp: 160, attack: 48, defense: 30, rewardGold: 200, rewardXp: 100, rewardCrystals: 12, minLevel: 16, description: 'Sentient storm clouds of pure darkness that consume all light around them.', color: '#1A1A40' },
  { id: 'aurora_dragon', name: 'Aurora Dragon', type: 'Dragon', power: 95, hp: 500, attack: 70, defense: 50, rewardGold: 500, rewardXp: 250, rewardCrystals: 30, minLevel: 28, description: 'An ancient dragon whose scales shimmer with the full spectrum of aurora light.', color: '#69F0AE' },
  { id: 'gravity_beast', name: 'Gravity Beast', type: 'Mythical', power: 100, hp: 600, attack: 75, defense: 55, rewardGold: 600, rewardXp: 300, rewardCrystals: 35, minLevel: 35, description: 'A terrifying creature from the gravity void that warps space around itself.', color: '#0A1128' },
  { id: 'celestial_hydra', name: 'Celestial Hydra', type: 'Dragon', power: 120, hp: 800, attack: 90, defense: 65, rewardGold: 1000, rewardXp: 500, rewardCrystals: 50, minLevel: 42, description: 'The ultimate aerial predator. Each severed head regrows stronger, bathed in starlight.', color: '#FFD700' },
]

// === SK_RESOURCES ===

export interface SkResourceDef {
  id: string
  name: string
  description: string
  icon: string
  baseValue: number
  color: string
}

export const SK_RESOURCES: SkResourceDef[] = [
  { id: 'wind_shard', name: 'Wind Shard', description: 'Concentrated essence of the eternal winds.', icon: '🌬️', baseValue: 1, color: '#80DEEA' },
  { id: 'cloud_silk', name: 'Cloud Silk', description: 'Gossamer threads spun from living clouds.', icon: '☁️', baseValue: 2, color: '#ECEFF1' },
  { id: 'lightning_essence', name: 'Lightning Essence', description: 'Bottled energy from a thunderstrike.', icon: '⚡', baseValue: 3, color: '#FFD740' },
  { id: 'storm_crystal', name: 'Storm Crystal', description: 'Crystallized energy from a storm front.', icon: '🔱', baseValue: 4, color: '#5C6BC0' },
  { id: 'sun_fragment', name: 'Sun Fragment', description: 'A shard of concentrated sunlight.', icon: '☀️', baseValue: 3, color: '#FF8C42' },
  { id: 'dew_drop', name: 'Dew Drop', description: 'Magical morning dew from cloud gardens.', icon: '💧', baseValue: 1, color: '#87CEEB' },
  { id: 'moon_dust', name: 'Moon Dust', description: 'Luminous powder harvested from moonbeams.', icon: '🌙', baseValue: 3, color: '#C0C0C0' },
  { id: 'star_fragment', name: 'Star Fragment', description: 'A fallen piece of a star.', icon: '⭐', baseValue: 5, color: '#FFF8DC' },
  { id: 'aurora_gem', name: 'Aurora Gem', description: 'A gemstone infused with aurora light.', icon: '🌈', baseValue: 6, color: '#69F0AE' },
  { id: 'prism_shard', name: 'Prism Shard', description: 'A shard that splits light into all colors.', icon: '💎', baseValue: 4, color: '#B388FF' },
]

// === SK_WEATHER_TYPES ===

export const SK_WEATHER_TYPES: { type: SkWeatherType; label: string; color: string; icon: string; description: string; productionBonus: number }[] = [
  { type: 'clear', label: 'Clear Sky', color: '#87CEEB', icon: '☀️', description: 'Perfect weather with unlimited visibility and calm winds.', productionBonus: 1.0 },
  { type: 'cloudy', label: 'Cloudy', color: '#B0C4DE', icon: '☁️', description: 'Overcast skies with thick cloud cover reducing visibility.', productionBonus: 0.95 },
  { type: 'rain', label: 'Rain', color: '#4682B4', icon: '🌧️', description: 'Steady rainfall that boosts cloud silk production but slows ships.', productionBonus: 1.1 },
  { type: 'storm', label: 'Storm', color: '#4A4A8A', icon: '⛈️', description: 'A full thunderstorm with lightning and high winds. Dangerous but rewarding.', productionBonus: 1.3 },
  { type: 'wind', label: 'High Wind', color: '#80DEEA', icon: '💨', description: 'Strong winds that boost wind production and ship speed significantly.', productionBonus: 1.2 },
  { type: 'snow', label: 'Snowfall', color: '#E0F7FA', icon: '🌨️', description: 'Gentle snowfall from above that produces rare frost crystals.', productionBonus: 1.05 },
  { type: 'aurora', label: 'Aurora', color: '#69F0AE', icon: '🌈', description: 'The aurora borealis blankets the sky, boosting all production by 20%.', productionBonus: 1.2 },
  { type: 'cosmic', label: 'Cosmic Event', color: '#E6E6FA', icon: '✨', description: 'A rare cosmic event where stars fall, granting massive bonuses.', productionBonus: 1.5 },
]

// === HELPER FUNCTIONS (module-level) ===

function skCreateDefaultState(): SkyCitadelState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    gold: 500,
    crystals: 10,
    title: 'Sky Cadet',
    weather: 'clear',
    weatherEvent: null,
    islands: [
      { islandId: 'cloud_peak', unlocked: true, expanded: false, expansionLevel: 0, buildings: [] },
      { islandId: 'thunder_mesa', unlocked: false, expanded: false, expansionLevel: 0, buildings: [] },
      { islandId: 'dawn_plateau', unlocked: false, expanded: false, expansionLevel: 0, buildings: [] },
      { islandId: 'twilight_atoll', unlocked: false, expanded: false, expansionLevel: 0, buildings: [] },
      { islandId: 'aurora_reach', unlocked: false, expanded: false, expansionLevel: 0, buildings: [] },
      { islandId: 'zephyr_haven', unlocked: false, expanded: false, expansionLevel: 0, buildings: [] },
      { islandId: 'nimbus_crest', unlocked: false, expanded: false, expansionLevel: 0, buildings: [] },
      { islandId: 'starlight_isle', unlocked: false, expanded: false, expansionLevel: 0, buildings: [] },
    ],
    vehicles: SK_VEHICLES.map((v) => ({
      vehicleId: v.id,
      owned: false,
      level: 1,
      hp: v.combatPower * 10,
      maxHp: v.combatPower * 10,
      assignedIsland: null,
    })),
    weapons: SK_WEAPONS.map((w) => ({
      weaponId: w.id,
      owned: false,
      equipped: false,
      level: 1,
    })),
    achievements: SK_ACHIEVEMENTS.map((a) => ({
      achievementId: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    combatLog: [],
    equippedVehicle: null,
    equippedWeapon: null,
    totalBuildingsBuilt: 0,
    totalIslandsExpanded: 0,
    totalVehiclesCrafted: 0,
    totalWeaponsForged: 0,
    totalCombatsWon: 0,
    totalCombatsLost: 0,
    totalResourcesCollected: 0,
    totalGoldEarned: 0,
    totalCrystalsEarned: 0,
    streak: 0,
    bestStreak: 0,
    lastPlayedDate: '',
    citadelName: 'Sky Citadel',
    tick: 0,
  }
}

function skGetXpRequiredForLevel(level: number): number {
  if (level < 1 || level >= SK_MAX_LEVEL) return Infinity
  return SK_XP_TABLE[level - 1] || 100
}

function skGetTitleForLevel(level: number): string {
  let result = SK_TITLES[0].title
  for (const t of SK_TITLES) {
    if (level >= t.level) result = t.title
  }
  return result
}

// =============================================================================
// HOOK
// =============================================================================

export default function useSkyCitadel() {
  const stateRef = useRef<SkyCitadelState>(skCreateDefaultState())
  const [state, setState] = useState<SkyCitadelState>(() => {
    if (typeof window === 'undefined') return skCreateDefaultState()
    try {
      const saved = localStorage.getItem('sky-citadel-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...skCreateDefaultState(), ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return skCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('sky-citadel-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // === SIMPLE GETTERS (plain arrows) ===

  const skGetLevel = (): number => state.level
  const skGetXp = (): number => state.xp
  const skGetTotalXp = (): number => state.totalXp
  const skGetTitle = (): string => state.title
  const skGetGold = (): number => state.gold
  const skGetCrystals = (): number => state.crystals
  const skGetWeather = (): SkWeatherType => state.weather
  const skGetWeatherEvent = (): SkWeatherEvent | null => state.weatherEvent
  const skGetIslands = (): SkIslandInstance[] => state.islands
  const skGetVehicles = (): SkVehicleInstance[] => state.vehicles
  const skGetWeapons = (): SkWeaponInstance[] => state.weapons
  const skGetAchievements = (): SkAchievementState[] => state.achievements
  const skGetCombatLog = (): SkCombatEntry[] => state.combatLog
  const skGetEquippedVehicle = (): string | null => state.equippedVehicle
  const skGetEquippedWeapon = (): string | null => state.equippedWeapon
  const skGetStreak = (): number => state.streak
  const skGetBestStreak = (): number => state.bestStreak
  const skGetCitadelName = (): string => state.citadelName
  const skGetTick = (): number => state.tick

  const skGetXpRequired = (): number => skGetXpRequiredForLevel(state.level)
  const skGetXpProgress = (): number => {
    const needed = skGetXpRequiredForLevel(state.level)
    if (needed === Infinity || needed <= 0) return 1
    return Math.min(1, state.xp / needed)
  }
  const skGetOverallProgress = (): number => state.level / SK_MAX_LEVEL

  const skGetUnlockedIslandCount = (): number => state.islands.filter((i) => i.unlocked).length
  const skGetTotalBuildingCount = (): number => {
    return state.islands.reduce((sum, isl) => sum + isl.buildings.length, 0)
  }
  const skGetOwnedVehicleCount = (): number => state.vehicles.filter((v) => v.owned).length
  const skGetOwnedWeaponCount = (): number => state.weapons.filter((w) => w.owned).length
  const skGetUnlockedAchievementCount = (): number => state.achievements.filter((a) => a.unlocked).length

  const skGetIslandBuildings = (islandId: string): SkBuildingInstance[] => {
    const island = state.islands.find((i) => i.islandId === islandId)
    return island ? island.buildings : []
  }

  const skGetRarityColor = (rarity: SkRarity): string => SK_RARITY_COLORS[rarity]
  const skGetRarityIcon = (rarity: SkRarity): string => SK_RARITY_ICONS[rarity]

  const skGetBuildingInfo = (id: string): SkBuildingDef | undefined => SK_BUILDINGS.find((b) => b.id === id)
  const skGetIslandInfo = (id: string): SkIslandDef | undefined => SK_ISLANDS.find((i) => i.id === id)
  const skGetVehicleInfo = (id: string): SkVehicleDef | undefined => SK_VEHICLES.find((v) => v.id === id)
  const skGetWeaponInfo = (id: string): SkWeaponDef | undefined => SK_WEAPONS.find((w) => w.id === id)
  const skGetTitleInfo = (level: number): SkTitleDef | undefined => {
    let result: SkTitleDef | undefined
    for (const t of SK_TITLES) {
      if (level >= t.level) result = t
    }
    return result
  }
  const skGetAchievementInfo = (id: string): SkAchievementDef | undefined => SK_ACHIEVEMENTS.find((a) => a.id === id)

  const skGetCombatStats = (): { won: number; lost: number; winRate: number } => {
    const total = state.totalCombatsWon + state.totalCombatsLost
    return {
      won: state.totalCombatsWon,
      lost: state.totalCombatsLost,
      winRate: total > 0 ? state.totalCombatsWon / total : 0,
    }
  }

  const skGetTotalDefense = (): number => {
    let total = 0
    for (const island of state.islands) {
      if (!island.unlocked) continue
      for (const b of island.buildings) {
        const def = SK_BUILDINGS.find((bd) => bd.id === b.buildingId)
        if (def) total += def.defense * b.level
      }
    }
    return total
  }

  const skGetResourceRate = (): Record<string, number> => {
    const rates: Record<string, number> = {}
    for (const island of state.islands) {
      if (!island.unlocked) continue
      for (const b of island.buildings) {
        const def = SK_BUILDINGS.find((bd) => bd.id === b.buildingId)
        if (!def) continue
        for (const [res, amount] of Object.entries(def.productionPerHour)) {
          rates[res] = (rates[res] || 0) + amount * b.level
        }
      }
    }
    return rates
  }

  const skGetLevelProgress = (forLevel: number): number => {
    const needed = skGetXpRequiredForLevel(forLevel)
    if (needed === Infinity || needed <= 0) return 1
    return state.xp / needed
  }

  // === STATE MODIFIERS (useCallback) ===

  const skAddXp = useCallback((amount: number) => {
    setState((prev) => {
      let { level, xp, totalXp } = prev
      const gained = Math.floor(amount)
      xp += gained
      totalXp += gained
      while (level < SK_MAX_LEVEL && xp >= skGetXpRequiredForLevel(level)) {
        xp -= skGetXpRequiredForLevel(level)
        level += 1
      }
      if (level >= SK_MAX_LEVEL) xp = 0
      const title = skGetTitleForLevel(level)
      return { ...prev, level: Math.min(level, SK_MAX_LEVEL), xp, totalXp, title }
    })
  }, [])

  const skSpendGold = useCallback((amount: number): boolean => {
    let success = false
    setState((prev) => {
      if (prev.gold < amount) return prev
      success = true
      return { ...prev, gold: prev.gold - amount }
    })
    return success
  }, [])

  const skSpendCrystals = useCallback((amount: number): boolean => {
    let success = false
    setState((prev) => {
      if (prev.crystals < amount) return prev
      success = true
      return { ...prev, crystals: prev.crystals - amount }
    })
    return success
  }, [])

  const skAddGold = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      gold: prev.gold + Math.floor(amount),
      totalGoldEarned: prev.totalGoldEarned + Math.floor(amount),
    }))
  }, [])

  const skAddCrystals = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      crystals: prev.crystals + Math.floor(amount),
      totalCrystalsEarned: prev.totalCrystalsEarned + Math.floor(amount),
    }))
  }, [])

  const skBuildTower = useCallback((buildingId: string, islandId: string): boolean => {
    let success = false
    setState((prev) => {
      const buildingDef = SK_BUILDINGS.find((b) => b.id === buildingId)
      if (!buildingDef) return prev
      const islandIdx = prev.islands.findIndex((i) => i.islandId === islandId)
      if (islandIdx === -1) return prev
      const island = prev.islands[islandIdx]
      if (!island.unlocked) return prev
      const islandDef = SK_ISLANDS.find((d) => d.id === islandId)
      if (!islandDef) return prev
      if (island.buildings.length >= islandDef.maxBuildings + island.expansionLevel * 2) return prev
      const cost = Math.floor(buildingDef.baseCost)
      if (prev.gold < cost) return prev
      success = true
      const newBuildings = [...island.buildings, {
        buildingId,
        islandId,
        level: 1,
        hp: buildingDef.defense * 10,
        maxHp: buildingDef.defense * 10,
      }]
      const newIslands = [...prev.islands]
      newIslands[islandIdx] = { ...island, buildings: newBuildings }
      return { ...prev, islands: newIslands, gold: prev.gold - cost, totalBuildingsBuilt: prev.totalBuildingsBuilt + 1 }
    })
    return success
  }, [])

  const skUpgradeBuilding = useCallback((buildingId: string, islandId: string): boolean => {
    let success = false
    setState((prev) => {
      const buildingDef = SK_BUILDINGS.find((b) => b.id === buildingId)
      if (!buildingDef) return prev
      const islandIdx = prev.islands.findIndex((i) => i.islandId === islandId)
      if (islandIdx === -1) return prev
      const island = prev.islands[islandIdx]
      const buildingIdx = island.buildings.findIndex((b) => b.buildingId === buildingId)
      if (buildingIdx === -1) return prev
      const building = island.buildings[buildingIdx]
      if (building.level >= buildingDef.maxLevel) return prev
      const cost = Math.floor(buildingDef.baseCost * Math.pow(buildingDef.upgradeMultiplier, building.level))
      if (prev.gold < cost) return prev
      success = true
      const newLevel = building.level + 1
      const newBuildings = [...island.buildings]
      newBuildings[buildingIdx] = {
        ...building,
        level: newLevel,
        hp: buildingDef.defense * 10 * newLevel,
        maxHp: buildingDef.defense * 10 * newLevel,
      }
      const newIslands = [...prev.islands]
      newIslands[islandIdx] = { ...island, buildings: newBuildings }
      return { ...prev, islands: newIslands, gold: prev.gold - cost }
    })
    return success
  }, [])

  const skDemolishBuilding = useCallback((buildingId: string, islandId: string): boolean => {
    let success = false
    setState((prev) => {
      const islandIdx = prev.islands.findIndex((i) => i.islandId === islandId)
      if (islandIdx === -1) return prev
      const island = prev.islands[islandIdx]
      const buildingIdx = island.buildings.findIndex((b) => b.buildingId === buildingId)
      if (buildingIdx === -1) return prev
      success = true
      const newBuildings = [...island.buildings]
      newBuildings.splice(buildingIdx, 1)
      const newIslands = [...prev.islands]
      newIslands[islandIdx] = { ...island, buildings: newBuildings }
      return { ...prev, islands: newIslands }
    })
    return success
  }, [])

  const skUnlockIsland = useCallback((islandId: string): boolean => {
    let success = false
    setState((prev) => {
      const islandDef = SK_ISLANDS.find((i) => i.id === islandId)
      if (!islandDef) return prev
      if (prev.level < islandDef.unlockLevel) return prev
      const islandIdx = prev.islands.findIndex((i) => i.islandId === islandId)
      if (islandIdx === -1) return prev
      if (prev.islands[islandIdx].unlocked) return prev
      const cost = islandDef.unlockCost
      if (prev.gold < cost) return prev
      success = true
      const newIslands = [...prev.islands]
      newIslands[islandIdx] = { ...prev.islands[islandIdx], unlocked: true }
      return { ...prev, islands: newIslands, gold: prev.gold - cost }
    })
    return success
  }, [])

  const skExpandIsland = useCallback((islandId: string): boolean => {
    let success = false
    setState((prev) => {
      const islandIdx = prev.islands.findIndex((i) => i.islandId === islandId)
      if (islandIdx === -1) return prev
      const island = prev.islands[islandIdx]
      if (!island.unlocked) return prev
      if (island.expansionLevel >= 5) return prev
      const cost = Math.floor(300 * Math.pow(2, island.expansionLevel))
      if (prev.gold < cost) return prev
      success = true
      const newIslands = [...prev.islands]
      newIslands[islandIdx] = {
        ...island,
        expanded: true,
        expansionLevel: island.expansionLevel + 1,
      }
      return {
        ...prev,
        islands: newIslands,
        gold: prev.gold - cost,
        totalIslandsExpanded: prev.totalIslandsExpanded + 1,
      }
    })
    return success
  }, [])

  const skCraftVehicle = useCallback((vehicleId: string): boolean => {
    let success = false
    setState((prev) => {
      const vehicleDef = SK_VEHICLES.find((v) => v.id === vehicleId)
      if (!vehicleDef) return prev
      if (prev.level < vehicleDef.unlockLevel) return prev
      const vehicleIdx = prev.vehicles.findIndex((v) => v.vehicleId === vehicleId)
      if (vehicleIdx === -1) return prev
      if (prev.vehicles[vehicleIdx].owned) return prev
      const cost = vehicleDef.cost
      if (prev.gold < cost) return prev
      success = true
      const newVehicles = [...prev.vehicles]
      newVehicles[vehicleIdx] = { ...prev.vehicles[vehicleIdx], owned: true, hp: vehicleDef.combatPower * 10, maxHp: vehicleDef.combatPower * 10 }
      return { ...prev, vehicles: newVehicles, gold: prev.gold - cost, totalVehiclesCrafted: prev.totalVehiclesCrafted + 1 }
    })
    return success
  }, [])

  const skUpgradeVehicle = useCallback((vehicleId: string): boolean => {
    let success = false
    setState((prev) => {
      const vehicleDef = SK_VEHICLES.find((v) => v.id === vehicleId)
      if (!vehicleDef) return prev
      const vehicleIdx = prev.vehicles.findIndex((v) => v.vehicleId === vehicleId)
      if (vehicleIdx === -1) return prev
      const vehicle = prev.vehicles[vehicleIdx]
      if (!vehicle.owned) return prev
      if (vehicle.level >= 10) return prev
      const cost = Math.floor(vehicleDef.cost * 0.5 * vehicle.level)
      if (prev.gold < cost) return prev
      success = true
      const newLevel = vehicle.level + 1
      const newMaxHp = vehicleDef.combatPower * 10 * (1 + newLevel * 0.2)
      const newVehicles = [...prev.vehicles]
      newVehicles[vehicleIdx] = { ...vehicle, level: newLevel, maxHp: newMaxHp, hp: newMaxHp }
      return { ...prev, vehicles: newVehicles, gold: prev.gold - cost }
    })
    return success
  }, [])

  const skEquipVehicle = useCallback((vehicleId: string | null) => {
    setState((prev) => {
      if (vehicleId !== null) {
        const vehicle = prev.vehicles.find((v) => v.vehicleId === vehicleId)
        if (!vehicle || !vehicle.owned) return prev
      }
      return { ...prev, equippedVehicle: vehicleId }
    })
  }, [])

  const skAssignVehicle = useCallback((vehicleId: string, islandId: string | null): boolean => {
    let success = false
    setState((prev) => {
      const vehicleIdx = prev.vehicles.findIndex((v) => v.vehicleId === vehicleId)
      if (vehicleIdx === -1) return prev
      if (!prev.vehicles[vehicleIdx].owned) return prev
      success = true
      const newVehicles = [...prev.vehicles]
      newVehicles[vehicleIdx] = { ...prev.vehicles[vehicleIdx], assignedIsland: islandId }
      return { ...prev, vehicles: newVehicles }
    })
    return success
  }, [])

  const skForgeWeapon = useCallback((weaponId: string): boolean => {
    let success = false
    setState((prev) => {
      const weaponDef = SK_WEAPONS.find((w) => w.id === weaponId)
      if (!weaponDef) return prev
      if (prev.level < weaponDef.unlockLevel) return prev
      const weaponIdx = prev.weapons.findIndex((w) => w.weaponId === weaponId)
      if (weaponIdx === -1) return prev
      if (prev.weapons[weaponIdx].owned) return prev
      const cost = weaponDef.cost
      if (prev.gold < cost) return prev
      success = true
      const newWeapons = [...prev.weapons]
      newWeapons[weaponIdx] = { ...prev.weapons[weaponIdx], owned: true }
      return { ...prev, weapons: newWeapons, gold: prev.gold - cost, totalWeaponsForged: prev.totalWeaponsForged + 1 }
    })
    return success
  }, [])

  const skUpgradeWeapon = useCallback((weaponId: string): boolean => {
    let success = false
    setState((prev) => {
      const weaponDef = SK_WEAPONS.find((w) => w.id === weaponId)
      if (!weaponDef) return prev
      const weaponIdx = prev.weapons.findIndex((w) => w.weaponId === weaponId)
      if (weaponIdx === -1) return prev
      const weapon = prev.weapons[weaponIdx]
      if (!weapon.owned) return prev
      if (weapon.level >= 10) return prev
      const cost = Math.floor(weaponDef.cost * 0.4 * weapon.level)
      if (prev.gold < cost) return prev
      success = true
      const newWeapons = [...prev.weapons]
      newWeapons[weaponIdx] = { ...weapon, level: weapon.level + 1 }
      return { ...prev, weapons: newWeapons, gold: prev.gold - cost }
    })
    return success
  }, [])

  const skEquipWeapon = useCallback((weaponId: string | null) => {
    setState((prev) => {
      if (weaponId !== null) {
        const weapon = prev.weapons.find((w) => w.weaponId === weaponId)
        if (!weapon || !weapon.owned) return prev
      }
      const newWeapons = prev.weapons.map((w) => ({ ...w, equipped: w.weaponId === weaponId }))
      return { ...prev, weapons: newWeapons, equippedWeapon: weaponId }
    })
  }, [])

  const skSetWeather = useCallback((weather: SkWeatherType) => {
    setState((prev) => ({ ...prev, weather }))
  }, [])

  const skCollectResources = useCallback(() => {
    setState((prev) => {
      const rates = (() => {
        const r: Record<string, number> = {}
        for (const island of prev.islands) {
          if (!island.unlocked) continue
          for (const b of island.buildings) {
            const def = SK_BUILDINGS.find((bd) => bd.id === b.buildingId)
            if (!def) continue
            for (const [res, amount] of Object.entries(def.productionPerHour)) {
              r[res] = (r[res] || 0) + amount * b.level
            }
          }
        }
        return r
      })()
      const goldGain = Math.floor((rates.gold || 0) + 5)
      const crystalGain = Math.floor(prev.level * 0.5)
      const totalCollected = goldGain + crystalGain + Object.values(rates).reduce((s, v) => s + v, 0)
      return {
        ...prev,
        gold: prev.gold + goldGain,
        crystals: prev.crystals + crystalGain,
        totalResourcesCollected: prev.totalResourcesCollected + totalCollected,
        totalGoldEarned: prev.totalGoldEarned + goldGain,
        totalCrystalsEarned: prev.totalCrystalsEarned + crystalGain,
      }
    })
  }, [])

  const skStartCombat = useCallback((enemyName: string, enemyPower: number): SkCombatEntry | null => {
    let result: SkCombatEntry | null = null
    setState((prev) => {
      let myPower = 0
      if (prev.equippedWeapon) {
        const wDef = SK_WEAPONS.find((w) => w.id === prev.equippedWeapon)
        const wInst = prev.weapons.find((w) => w.weaponId === prev.equippedWeapon)
        if (wDef && wInst) myPower += wDef.attack * wInst.level
      }
      if (prev.equippedVehicle) {
        const vDef = SK_VEHICLES.find((v) => v.id === prev.equippedVehicle)
        const vInst = prev.vehicles.find((v) => v.vehicleId === prev.equippedVehicle)
        if (vDef && vInst) myPower += vDef.combatPower * vInst.level
      }
      myPower += prev.level * 5 + skGetTotalDefenseStatic(prev)
      const roll = Math.random() * (myPower + enemyPower)
      const victory = roll < myPower
      const reward = victory ? Math.floor(enemyPower * 2 + 10) : 0
      const xpGained = victory ? Math.floor(enemyPower * 1.5 + 5) : Math.floor(enemyPower * 0.3 + 2)
      const entry: SkCombatEntry = {
        id: `combat_${Date.now()}`,
        enemy: enemyName,
        result: victory ? 'victory' : 'defeat',
        reward,
        xpGained,
        timestamp: Date.now(),
      }
      result = entry
      const newLog = [entry, ...prev.combatLog].slice(0, 100)
      return {
        ...prev,
        combatLog: newLog,
        gold: prev.gold + reward,
        xp: prev.xp + xpGained,
        totalXp: prev.totalXp + xpGained,
        totalGoldEarned: prev.totalGoldEarned + reward,
        totalCombatsWon: victory ? prev.totalCombatsWon + 1 : prev.totalCombatsWon,
        totalCombatsLost: victory ? prev.totalCombatsLost : prev.totalCombatsLost + 1,
      }
    })
    return result
  }, [])

  const skEndCombat = useCallback(() => {
    setState((prev) => ({ ...prev }))
  }, [])

  const skRenameCitadel = useCallback((name: string) => {
    setState((prev) => ({ ...prev, citadelName: name.slice(0, 30) }))
  }, [])

  const skRenameIsland = useCallback((islandId: string, _name: string) => {
    setState((prev) => {
      const islandIdx = prev.islands.findIndex((i) => i.islandId === islandId)
      if (islandIdx === -1) return prev
      return prev
    })
  }, [])

  const skUnlockAchievement = useCallback((achievementId: string): boolean => {
    let success = false
    setState((prev) => {
      const achIdx = prev.achievements.findIndex((a) => a.achievementId === achievementId)
      if (achIdx === -1) return prev
      if (prev.achievements[achIdx].unlocked) return prev
      const achDef = SK_ACHIEVEMENTS.find((a) => a.id === achievementId)
      if (!achDef) return prev
      success = true
      const newAchievements = [...prev.achievements]
      newAchievements[achIdx] = { ...prev.achievements[achIdx], unlocked: true, unlockedAt: Date.now() }
      return { ...prev, achievements: newAchievements }
    })
    if (success) {
      const achDef = SK_ACHIEVEMENTS.find((a) => a.id === achievementId)
      if (achDef) skAddXp(achDef.rewardXp)
    }
    return success
  }, [skAddXp])

  const skIncrementStreak = useCallback(() => {
    setState((prev) => {
      const today = new Date().toISOString().slice(0, 10)
      if (prev.lastPlayedDate === today) return prev
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const newStreak = prev.lastPlayedDate === yesterday ? prev.streak + 1 : 1
      const newBestStreak = Math.max(prev.bestStreak, newStreak)
      return { ...prev, streak: newStreak, bestStreak: newBestStreak, lastPlayedDate: today }
    })
  }, [])

  const skIncrementTick = useCallback(() => {
    setState((prev) => ({ ...prev, tick: prev.tick + 1 }))
  }, [])

  const skCheckAchievements = useCallback(() => {
    const s = stateRef.current
    const checks: Record<string, boolean> = {
      first_tower: s.totalBuildingsBuilt >= 1,
      island_hopper: s.islands.filter((i) => i.unlocked).length >= 3,
      master_builder: s.totalBuildingsBuilt >= 20,
      fleet_commander: s.totalVehiclesCrafted >= 5,
      arsenal_master: s.totalWeaponsForged >= 10,
      combat_veteran: s.totalCombatsWon >= 15,
      sky_wealthy: s.gold >= 10000,
      crystal_hoarder: s.crystals >= 1000,
      all_islands: s.islands.filter((i) => i.unlocked).length >= 8,
      full_expansion: s.totalIslandsExpanded >= 5,
      legendary_fleet: s.vehicles.some((v) => {
        const def = SK_VEHICLES.find((d) => d.id === v.vehicleId)
        return v.owned && def && def.category === 'legendary'
      }),
      ultimate_weapon: s.weapons.some((w) => {
        const def = SK_WEAPONS.find((d) => d.id === w.weaponId)
        return w.owned && def && def.rarity === SK_RARITY_LEGENDARY
      }),
      streak_7: s.streak >= 7,
      streak_30: s.streak >= 30,
      max_level: s.level >= SK_MAX_LEVEL,
    }
    for (const [id, met] of Object.entries(checks)) {
      if (met) {
        const ach = s.achievements.find((a) => a.achievementId === id)
        if (ach && !ach.unlocked) {
          skUnlockAchievement(id)
        }
      }
    }
  }, [skUnlockAchievement])

  const skTriggerWeatherEvent = useCallback((weather: SkWeatherType, intensity: number, duration: number) => {
    const event: SkWeatherEvent = {
      id: `weather_${Date.now()}`,
      weather,
      intensity: Math.max(1, Math.min(10, intensity)),
      startedAt: Date.now(),
      duration: Math.max(1, duration),
    }
    setState((prev) => ({ ...prev, weatherEvent: event, weather }))
  }, [])

  const skClearWeatherEvent = useCallback(() => {
    setState((prev) => ({ ...prev, weatherEvent: null }))
  }, [])

  const skRepairBuilding = useCallback((buildingId: string, islandId: string): boolean => {
    let success = false
    setState((prev) => {
      const islandIdx = prev.islands.findIndex((i) => i.islandId === islandId)
      if (islandIdx === -1) return prev
      const island = prev.islands[islandIdx]
      const buildingIdx = island.buildings.findIndex((b) => b.buildingId === buildingId)
      if (buildingIdx === -1) return prev
      const building = island.buildings[buildingIdx]
      if (building.hp >= building.maxHp) return prev
      const repairCost = Math.floor((building.maxHp - building.hp) * 0.5)
      if (prev.gold < repairCost) return prev
      success = true
      const newBuildings = [...island.buildings]
      newBuildings[buildingIdx] = { ...building, hp: building.maxHp }
      const newIslands = [...prev.islands]
      newIslands[islandIdx] = { ...island, buildings: newBuildings }
      return { ...prev, islands: newIslands, gold: prev.gold - repairCost }
    })
    return success
  }, [])

  const skSellVehicle = useCallback((vehicleId: string): boolean => {
    let success = false
    setState((prev) => {
      const vehicleIdx = prev.vehicles.findIndex((v) => v.vehicleId === vehicleId)
      if (vehicleIdx === -1) return prev
      const vehicle = prev.vehicles[vehicleIdx]
      if (!vehicle.owned) return prev
      const vehicleDef = SK_VEHICLES.find((v) => v.id === vehicleId)
      if (!vehicleDef) return prev
      const sellPrice = Math.floor(vehicleDef.cost * 0.4 * vehicle.level * 0.5)
      success = true
      const newVehicles = [...prev.vehicles]
      newVehicles[vehicleIdx] = { ...vehicle, owned: false, level: 1, hp: vehicleDef.combatPower * 10, maxHp: vehicleDef.combatPower * 10, assignedIsland: null }
      const newEquippedVehicle = prev.equippedVehicle === vehicleId ? null : prev.equippedVehicle
      return { ...prev, vehicles: newVehicles, gold: prev.gold + sellPrice, equippedVehicle: newEquippedVehicle }
    })
    return success
  }, [])

  const skSellWeapon = useCallback((weaponId: string): boolean => {
    let success = false
    setState((prev) => {
      const weaponIdx = prev.weapons.findIndex((w) => w.weaponId === weaponId)
      if (weaponIdx === -1) return prev
      const weapon = prev.weapons[weaponIdx]
      if (!weapon.owned) return prev
      const weaponDef = SK_WEAPONS.find((w) => w.id === weaponId)
      if (!weaponDef) return prev
      const sellPrice = Math.floor(weaponDef.cost * 0.3 * weapon.level * 0.5)
      success = true
      const newWeapons = [...prev.weapons]
      newWeapons[weaponIdx] = { ...weapon, owned: false, equipped: false, level: 1 }
      const newEquippedWeapon = prev.equippedWeapon === weaponId ? null : prev.equippedWeapon
      return { ...prev, weapons: newWeapons, gold: prev.gold + sellPrice, equippedWeapon: newEquippedWeapon }
    })
    return success
  }, [])

  const skTrainCrew = useCallback((vehicleId: string, goldAmount: number): boolean => {
    let success = false
    setState((prev) => {
      const vehicleIdx = prev.vehicles.findIndex((v) => v.vehicleId === vehicleId)
      if (vehicleIdx === -1) return prev
      const vehicle = prev.vehicles[vehicleIdx]
      if (!vehicle.owned) return prev
      if (prev.gold < goldAmount) return prev
      success = true
      const xpGained = Math.floor(goldAmount * 0.1)
      const newVehicles = [...prev.vehicles]
      const vehicleDef = SK_VEHICLES.find((v) => v.id === vehicleId)
      const newMaxHp = vehicleDef ? vehicleDef.combatPower * 10 * (1 + (vehicle.level + 0.1) * 0.2) : vehicle.maxHp
      newVehicles[vehicleIdx] = { ...vehicle, hp: Math.min(vehicle.hp + xpGained, newMaxHp) }
      return { ...prev, vehicles: newVehicles, gold: prev.gold - goldAmount, xp: prev.xp + xpGained }
    })
    return success
  }, [])

  // === ADDITIONAL FILTERED GETTERS ===

  const skGetBuildingsByCategory = (category: SkBuildingCategory): SkBuildingDef[] =>
    SK_BUILDINGS.filter((b) => b.category === category)

  const skGetBuildingsByRarity = (rarity: SkRarity): SkBuildingDef[] =>
    SK_BUILDINGS.filter((b) => b.rarity === rarity)

  const skGetVehiclesByCategory = (category: SkVehicleCategory): SkVehicleDef[] =>
    SK_VEHICLES.filter((v) => v.category === category)

  const skGetVehiclesByRarity = (rarity: SkRarity): SkVehicleDef[] =>
    SK_VEHICLES.filter((v) => v.rarity === rarity)

  const skGetWeaponsByType = (type: SkWeaponType): SkWeaponDef[] =>
    SK_WEAPONS.filter((w) => w.type === type)

  const skGetWeaponsByRarity = (rarity: SkRarity): SkWeaponDef[] =>
    SK_WEAPONS.filter((w) => w.rarity === rarity)

  const skGetOwnedVehicles = (): SkVehicleInstance[] =>
    state.vehicles.filter((v) => v.owned)

  const skGetUnownedVehicles = (): SkVehicleInstance[] =>
    state.vehicles.filter((v) => !v.owned)

  const skGetOwnedWeapons = (): SkWeaponInstance[] =>
    state.weapons.filter((w) => w.owned)

  const skGetEquippedWeapons = (): SkWeaponInstance[] =>
    state.weapons.filter((w) => w.equipped)

  const skGetAvailableIslands = (): SkIslandDef[] =>
    SK_ISLANDS.filter((i) => i.unlockLevel <= state.level)

  const skGetLockedIslands = (): SkIslandDef[] =>
    SK_ISLANDS.filter((i) => i.unlockLevel > state.level)

  const skGetEnemyInfo = (id: string): SkEnemyDef | undefined =>
    SK_ENEMIES.find((e) => e.id === id)

  const skGetEnemiesByMinLevel = (maxPower: number): SkEnemyDef[] =>
    SK_ENEMIES.filter((e) => e.minLevel <= state.level && e.power <= maxPower)

  const skGetWeatherTypeInfo = (weather: SkWeatherType) =>
    SK_WEATHER_TYPES.find((w) => w.type === weather)

  const skGetIslandExpansionCost = (islandId: string): number => {
    const island = state.islands.find((i) => i.islandId === islandId)
    if (!island) return 0
    return Math.floor(300 * Math.pow(2, island.expansionLevel))
  }

  const skGetBuildingUpgradeCost = (buildingId: string, islandId: string): number => {
    const buildingDef = SK_BUILDINGS.find((b) => b.id === buildingId)
    if (!buildingDef) return 0
    const island = state.islands.find((i) => i.islandId === islandId)
    if (!island) return 0
    const building = island.buildings.find((b) => b.buildingId === buildingId)
    if (!building) return buildingDef.baseCost
    return Math.floor(buildingDef.baseCost * Math.pow(buildingDef.upgradeMultiplier, building.level))
  }

  const skGetTotalCombatPower = (): number => {
    let power = state.level * 5
    if (state.equippedWeapon) {
      const wDef = SK_WEAPONS.find((w) => w.id === state.equippedWeapon)
      const wInst = state.weapons.find((w) => w.weaponId === state.equippedWeapon)
      if (wDef && wInst) power += wDef.attack * wInst.level + wDef.defense * wInst.level
    }
    if (state.equippedVehicle) {
      const vDef = SK_VEHICLES.find((v) => v.id === state.equippedVehicle)
      const vInst = state.vehicles.find((v) => v.vehicleId === state.equippedVehicle)
      if (vDef && vInst) power += vDef.combatPower * vInst.level
    }
    power += skGetTotalDefense()
    return power
  }

  const skGetWeatherBonus = (): number => {
    const weatherInfo = SK_WEATHER_TYPES.find((w) => w.type === state.weather)
    return weatherInfo ? weatherInfo.productionBonus : 1
  }

  // === RESET (NOT wrapped in useCallback) ===

  function skResetProgress() {
    const fresh = skCreateDefaultState()
    setState(fresh)
    stateRef.current = fresh
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('sky-citadel-save')
      } catch {
        // ignore
      }
    }
  }

  return {
    // Core getters
    skGetLevel,
    skGetXp,
    skGetTotalXp,
    skGetTitle,
    skGetGold,
    skGetCrystals,
    skGetWeather,
    skGetWeatherEvent,
    skGetStreak,
    skGetBestStreak,
    skGetCitadelName,
    skGetTick,
    // Progress getters
    skGetXpRequired,
    skGetXpProgress,
    skGetOverallProgress,
    skGetLevelProgress,
    // Collection getters
    skGetIslands,
    skGetVehicles,
    skGetWeapons,
    skGetAchievements,
    skGetCombatLog,
    skGetEquippedVehicle,
    skGetEquippedWeapon,
    skGetUnlockedIslandCount,
    skGetTotalBuildingCount,
    skGetOwnedVehicleCount,
    skGetOwnedWeaponCount,
    skGetUnlockedAchievementCount,
    skGetIslandBuildings,
    // Computed getters
    skGetCombatStats,
    skGetTotalDefense,
    skGetResourceRate,
    // Definition getters
    skGetRarityColor,
    skGetRarityIcon,
    skGetBuildingInfo,
    skGetIslandInfo,
    skGetVehicleInfo,
    skGetWeaponInfo,
    skGetTitleInfo,
    skGetAchievementInfo,
    // State modifiers
    skAddXp,
    skSpendGold,
    skSpendCrystals,
    skAddGold,
    skAddCrystals,
    skBuildTower,
    skUpgradeBuilding,
    skDemolishBuilding,
    skUnlockIsland,
    skExpandIsland,
    skCraftVehicle,
    skUpgradeVehicle,
    skEquipVehicle,
    skAssignVehicle,
    skForgeWeapon,
    skUpgradeWeapon,
    skEquipWeapon,
    skSetWeather,
    skCollectResources,
    skStartCombat,
    skEndCombat,
    skRenameCitadel,
    skRenameIsland,
    skUnlockAchievement,
    skIncrementStreak,
    skIncrementTick,
    skCheckAchievements,
    // Weather control
    skTriggerWeatherEvent,
    skClearWeatherEvent,
    // Advanced modifiers
    skRepairBuilding,
    skSellVehicle,
    skSellWeapon,
    skTrainCrew,
    // Filtered getters
    skGetBuildingsByCategory,
    skGetBuildingsByRarity,
    skGetVehiclesByCategory,
    skGetVehiclesByRarity,
    skGetWeaponsByType,
    skGetWeaponsByRarity,
    skGetOwnedVehicles,
    skGetUnownedVehicles,
    skGetOwnedWeapons,
    skGetEquippedWeapons,
    skGetAvailableIslands,
    skGetLockedIslands,
    skGetEnemyInfo,
    skGetEnemiesByMinLevel,
    skGetWeatherTypeInfo,
    skGetIslandExpansionCost,
    skGetBuildingUpgradeCost,
    skGetTotalCombatPower,
    skGetWeatherBonus,
    // Reset (plain function)
    skResetProgress,
  }
}

// === STATIC HELPER (module-level, used inside useCallback) ===

function skGetTotalDefenseStatic(state: SkyCitadelState): number {
  let total = 0
  for (const island of state.islands) {
    if (!island.unlocked) continue
    for (const b of island.buildings) {
      const def = SK_BUILDINGS.find((bd) => bd.id === b.buildingId)
      if (def) total += def.defense * b.level
    }
  }
  return total
}
