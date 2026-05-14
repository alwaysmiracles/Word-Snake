// ============================================================================
// Cloud Kingdom Wire — Floating Sky Kingdom Management Mini-Game
// ============================================================================
// SSR-safe: no localStorage, no window/document, no setInterval/addEventListener.
// All exported functions use `ck` prefix, all constants use `CK_` prefix.
// Uses React hooks internally (useState, useCallback, useRef).
// ============================================================================

import { useState, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CkRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type CkBiome = "Temperate" | "Stormy" | "Luminous" | "Crystalline" | "Volcanic" | "Misty" | "Solar" | "Lunar" | "Celestial" | "Windy" | "Auroral" | "Shadowy";
export type CkWeatherSchool = "Wind" | "Rain" | "Lightning" | "Sun" | "Cloud" | "Snow" | "Aurora" | "Storm";
export type CkCreatureElement = "Wind" | "Storm" | "Lightning" | "Sun" | "Moon" | "Star" | "Cloud" | "Mist" | "Aurora" | "Fire" | "Ice" | "Crystal";

export interface CkIslandDef {
  id: string;
  name: string;
  biome: CkBiome;
  altitude: number;
  primaryResource: string;
  secondaryResource: string;
  weatherPattern: string;
  unlockLevel: number;
  unlockCost: number;
  maxBuildings: number;
  description: string;
  color: string;
}

export interface CkBuildingDef {
  id: string;
  name: string;
  category: string;
  baseCost: Record<string, number>;
  maxLevel: number;
  productionPerHour: Record<string, number>;
  description: string;
  requiredIslandBiome?: CkBiome;
  upgradeMultiplier: number;
}

export interface CkWeatherSchoolDef {
  id: CkWeatherSchool;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface CkSpellDef {
  id: string;
  name: string;
  school: CkWeatherSchool;
  manaCost: number;
  power: number;
  cooldown: number;
  description: string;
  rarity: CkRarity;
  unlockLevel: number;
  effectType: string;
}

export interface CkCreatureDef {
  id: string;
  name: string;
  element: CkCreatureElement;
  rarity: CkRarity;
  abilities: string[];
  tamingDifficulty: number;
  hp: number;
  attack: number;
  defense: number;
  description: string;
}

export interface CkResourceDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseValue: number;
}

export interface CkTempleDef {
  id: string;
  name: string;
  description: string;
  bonusType: string;
  bonusValue: number;
  requiredLevel: number;
  guardianName: string;
  guardianHP: number;
  trialReward: Record<string, number>;
  color: string;
}

export interface CkAirshipDef {
  id: string;
  name: string;
  category: string;
  capacity: number;
  speed: number;
  cost: number;
  unlockLevel: number;
  description: string;
  combatPower: number;
}

export interface CkQuestDef {
  id: string;
  name: string;
  description: string;
  objectiveType: string;
  objectiveTarget: number;
  xpReward: number;
  coinReward: number;
  resourceReward: Record<string, number>;
  requiredLevel: number;
  category: string;
}

export interface CkNpcDef {
  id: string;
  name: string;
  title: string;
  role: string;
  dialogue: string;
  bonusType: string;
  bonusValue: number;
}

export interface CkAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
  icon: string;
}

export interface CkTitleThreshold {
  minLevel: number;
  title: string;
}

// State interfaces

export interface CkIslandState {
  defId: string;
  unlocked: boolean;
  settled: boolean;
  buildings: CkBuildingInstance[];
}

export interface CkBuildingInstance {
  defId: string;
  islandId: string;
  level: number;
}

export interface CkCreatureInstance {
  defId: string;
  tamed: boolean;
  nickname: string;
  level: number;
  hp: number;
}

export interface CkSpellState {
  defId: string;
  learned: boolean;
  castCount: number;
  cooldownRemaining: number;
}

export interface CkAirshipInstance {
  defId: string;
  owned: boolean;
  deployed: boolean;
  missionEndTime: number;
  missionType: string;
  level: number;
}

export interface CkQuestState {
  defId: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
}

export interface CkDailyData {
  dateSeed: string;
  weatherCalibrated: boolean;
  calibrationTarget: number;
  calibrationProgress: number;
  rewardClaimed: boolean;
}

export interface CkStats {
  totalIslandsUnlocked: number;
  totalBuildingsBuilt: number;
  totalSpellsCast: number;
  totalCreaturesTamed: number;
  totalResourcesGathered: number;
  totalQuestsCompleted: number;
  totalAirshipsSent: number;
  totalTempleTrials: number;
  totalCoinsEarned: number;
  totalXPEarned: number;
}

export interface CkWeeklyData {
  weekSeed: string;
  raceCompleted: boolean;
  racePosition: number;
  raceReward: number;
}

export interface CkMonthlyData {
  monthSeed: string;
  challengeCompleted: boolean;
  challengeProgress: number;
  challengeReward: Record<string, number>;
}

export interface CloudKingdomState {
  level: number;
  xp: number;
  coins: number;
  mana: number;
  maxMana: number;
  islands: CkIslandState[];
  buildings: CkBuildingInstance[];
  creatures: CkCreatureInstance[];
  spells: CkSpellState[];
  resources: Record<string, number>;
  airships: CkAirshipInstance[];
  quests: CkQuestState[];
  achievements: string[];
  streak: number;
  lastDaily: string | null;
  daily: CkDailyData;
  weekly: CkWeeklyData;
  monthly: CkMonthlyData;
  stats: CkStats;
  templeTrialsCompleted: string[];
  kingdomName: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CK_MAX_LEVEL = 45;

export const CK_TITLE_THRESHOLDS: CkTitleThreshold[] = [
  { minLevel: 1, title: "Cloud Watcher" },
  { minLevel: 6, title: "Sky Warden" },
  { minLevel: 12, title: "Wind Commander" },
  { minLevel: 18, title: "Storm Master" },
  { minLevel: 25, title: "Celestial Lord" },
  { minLevel: 32, title: "Sky Sovereign" },
  { minLevel: 38, title: "Cloud Emperor" },
  { minLevel: 44, title: "Eternal Sky God" },
];

export const CK_RESOURCES: CkResourceDef[] = [
  { id: "wind_essence", name: "Wind Essence", description: "Pure energy harvested from the eternal winds.", icon: "🌬️", baseValue: 1 },
  { id: "storm_crystal", name: "Storm Crystal", description: "Crystallized lightning energy from thunderstorms.", icon: "⚡", baseValue: 3 },
  { id: "cloud_silk", name: "Cloud Silk", description: "Gossamer threads spun from living clouds.", icon: "☁️", baseValue: 2 },
  { id: "sun_shard", name: "Sun Shard", description: "A fragment of pure solar energy.", icon: "☀️", baseValue: 4 },
  { id: "moon_dust", name: "Moon Dust", description: "Luminous powder from moonbeams.", icon: "🌙", baseValue: 3 },
  { id: "star_fragment", name: "Star Fragment", description: "A fallen piece of a star.", icon: "⭐", baseValue: 5 },
  { id: "rain_pearl", name: "Rain Pearl", description: "Condensed raindrop of magical purity.", icon: "💧", baseValue: 2 },
  { id: "snow_flake", name: "Snow Flake", description: "Permanently frozen enchanted ice crystal.", icon: "❄️", baseValue: 2 },
  { id: "lightning_bolt", name: "Lightning Bolt", description: "Solidified bolt of sky lightning.", icon: "🌩️", baseValue: 4 },
  { id: "aurora_gem", name: "Aurora Gem", description: "A gemstone infused with aurora light.", icon: "🌈", baseValue: 6 },
];

export const CK_ISLANDS: CkIslandDef[] = [
  {
    id: "dawn_island", name: "Dawn Island", biome: "Temperate", altitude: 1200,
    primaryResource: "wind_essence", secondaryResource: "cloud_silk",
    weatherPattern: "Clear Skies", unlockLevel: 1, unlockCost: 0,
    maxBuildings: 6, description: "The first island of every Cloud Ruler. Bathed in eternal sunrise.", color: "#FFB347",
  },
  {
    id: "storm_peak", name: "Storm Peak", biome: "Stormy", altitude: 3400,
    primaryResource: "storm_crystal", secondaryResource: "lightning_bolt",
    weatherPattern: "Perpetual Thunder", unlockLevel: 3, unlockCost: 200,
    maxBuildings: 8, description: "A jagged peak where storms never cease. Rich in lightning resources.", color: "#4A4A8A",
  },
  {
    id: "rainbow_mesa", name: "Rainbow Mesa", biome: "Luminous", altitude: 2100,
    primaryResource: "cloud_silk", secondaryResource: "sun_shard",
    weatherPattern: "Prismatic Showers", unlockLevel: 6, unlockCost: 500,
    maxBuildings: 8, description: "A flat-topped island where rainbows are born from mist.", color: "#FF6B9D",
  },
  {
    id: "crystal_cloud", name: "Crystal Cloud", biome: "Crystalline", altitude: 4500,
    primaryResource: "star_fragment", secondaryResource: "aurora_gem",
    weatherPattern: "Starlit Calm", unlockLevel: 10, unlockCost: 1200,
    maxBuildings: 10, description: "An island made entirely of floating crystals that hum with starlight.", color: "#B388FF",
  },
  {
    id: "thunder_rock", name: "Thunder Rock", biome: "Volcanic", altitude: 5200,
    primaryResource: "lightning_bolt", secondaryResource: "storm_crystal",
    weatherPattern: "Lightning Storms", unlockLevel: 14, unlockCost: 2500,
    maxBuildings: 10, description: "A massive volcanic sky-rock constantly struck by lightning.", color: "#FF5252",
  },
  {
    id: "mist_haven", name: "Mist Haven", biome: "Misty", altitude: 1800,
    primaryResource: "moon_dust", secondaryResource: "rain_pearl",
    weatherPattern: "Dense Fog", unlockLevel: 8, unlockCost: 800,
    maxBuildings: 8, description: "A serene island veiled in eternal mist. Perfect for meditation.", color: "#90CAF9",
  },
  {
    id: "sun_spire", name: "Sun Spire", biome: "Solar", altitude: 6000,
    primaryResource: "sun_shard", secondaryResource: "wind_essence",
    weatherPattern: "Blazing Light", unlockLevel: 18, unlockCost: 4000,
    maxBuildings: 10, description: "A towering spire that catches the first and last light of every day.", color: "#FFD740",
  },
  {
    id: "moon_atoll", name: "Moon Atoll", biome: "Lunar", altitude: 2800,
    primaryResource: "moon_dust", secondaryResource: "star_fragment",
    weatherPattern: "Moonlit Calm", unlockLevel: 12, unlockCost: 1800,
    maxBuildings: 10, description: "A crescent-shaped island that glows softly in moonlight.", color: "#E1BEE7",
  },
  {
    id: "starfall_isle", name: "Starfall Isle", biome: "Celestial", altitude: 7800,
    primaryResource: "star_fragment", secondaryResource: "aurora_gem",
    weatherPattern: "Meteor Rain", unlockLevel: 22, unlockCost: 6000,
    maxBuildings: 12, description: "Where stars literally fall from the sky, embedding in the floating earth.", color: "#FFF176",
  },
  {
    id: "zephyr_plateau", name: "Zephyr Plateau", biome: "Windy", altitude: 1500,
    primaryResource: "wind_essence", secondaryResource: "rain_pearl",
    weatherPattern: "Constant Breeze", unlockLevel: 5, unlockCost: 350,
    maxBuildings: 8, description: "A vast windswept plateau perfect for wind-powered structures.", color: "#80DEEA",
  },
  {
    id: "aurora_peak", name: "Aurora Peak", biome: "Auroral", altitude: 6500,
    primaryResource: "aurora_gem", secondaryResource: "snow_flake",
    weatherPattern: "Aurora Borealis", unlockLevel: 28, unlockCost: 9000,
    maxBuildings: 12, description: "The highest reachable peak, crowned with eternal aurora lights.", color: "#69F0AE",
  },
  {
    id: "eclipse_isle", name: "Eclipse Isle", biome: "Shadowy", altitude: 8800,
    primaryResource: "aurora_gem", secondaryResource: "moon_dust",
    weatherPattern: "Eternal Eclipse", unlockLevel: 35, unlockCost: 15000,
    maxBuildings: 14, description: "A mysterious dark island where light and shadow dance eternally.", color: "#311B92",
  },
];

export const CK_BUILDINGS: CkBuildingDef[] = [
  // Production Buildings (12)
  { id: "wind_mill", name: "Wind Mill", category: "production", baseCost: { coins: 50, wind_essence: 10 }, maxLevel: 20, productionPerHour: { wind_essence: 3 }, description: "Harnesses the eternal winds to generate Wind Essence.", upgradeMultiplier: 1.4 },
  { id: "cloud_forge", name: "Cloud Forge", category: "production", baseCost: { coins: 80, cloud_silk: 15 }, maxLevel: 20, productionPerHour: { cloud_silk: 2 }, description: "Smelts cloud silk from raw atmospheric moisture.", upgradeMultiplier: 1.4 },
  { id: "storm_collector", name: "Storm Collector", category: "production", baseCost: { coins: 120, storm_crystal: 5 }, maxLevel: 20, productionPerHour: { storm_crystal: 1, lightning_bolt: 1 }, description: "Captures electrical energy from passing storms.", upgradeMultiplier: 1.5 },
  { id: "solar_array", name: "Solar Array", category: "production", baseCost: { coins: 100, sun_shard: 8 }, maxLevel: 20, productionPerHour: { sun_shard: 2 }, description: "Concentrates sunlight into usable Sun Shards.", upgradeMultiplier: 1.4 },
  { id: "moon_well", name: "Moon Well", category: "production", baseCost: { coins: 150, moon_dust: 5 }, maxLevel: 20, productionPerHour: { moon_dust: 2 }, description: "Collects moonlight in a mystical well.", upgradeMultiplier: 1.4 },
  { id: "star_catcher", name: "Star Catcher", category: "production", baseCost: { coins: 200, star_fragment: 3 }, maxLevel: 20, productionPerHour: { star_fragment: 1 }, description: "A delicate net that captures falling star fragments.", upgradeMultiplier: 1.6 },
  { id: "rain_harvester", name: "Rain Harvester", category: "production", baseCost: { coins: 60, rain_pearl: 8 }, maxLevel: 20, productionPerHour: { rain_pearl: 3 }, description: "Condenses magical rain into Rain Pearls.", upgradeMultiplier: 1.4 },
  { id: "frost_condenser", name: "Frost Condenser", category: "production", baseCost: { coins: 90, snow_flake: 10 }, maxLevel: 20, productionPerHour: { snow_flake: 2 }, description: "Freezes atmospheric moisture into Snow Flakes.", upgradeMultiplier: 1.4 },
  { id: "lightning_rod", name: "Lightning Rod", category: "production", baseCost: { coins: 130, lightning_bolt: 5 }, maxLevel: 20, productionPerHour: { lightning_bolt: 2 }, description: "Attracts and grounds lightning into usable energy.", upgradeMultiplier: 1.5 },
  { id: "aurora_prism", name: "Aurora Prism", category: "production", baseCost: { coins: 250, aurora_gem: 2 }, maxLevel: 20, productionPerHour: { aurora_gem: 1 }, description: "Refracts aurora light into precious Aurora Gems.", upgradeMultiplier: 1.6 },
  // Utility Buildings (8)
  { id: "sky_garden", name: "Sky Garden", category: "utility", baseCost: { coins: 70, cloud_silk: 5, rain_pearl: 5 }, maxLevel: 15, productionPerHour: { coins: 5 }, description: "Grows enchanted sky-plants that generate bonus coins.", upgradeMultiplier: 1.3 },
  { id: "weather_station", name: "Weather Station", category: "utility", baseCost: { coins: 100, wind_essence: 10 }, maxLevel: 15, productionPerHour: {}, description: "Predicts weather patterns, boosting all production by 5% per level.", upgradeMultiplier: 1.2 },
  { id: "floating_dock", name: "Floating Dock", category: "utility", baseCost: { coins: 200, cloud_silk: 20 }, maxLevel: 10, productionPerHour: {}, description: "Docks for airships. Each level adds a docking slot.", upgradeMultiplier: 1.5 },
  { id: "cloud_library", name: "Cloud Library", category: "utility", baseCost: { coins: 150, moon_dust: 8, star_fragment: 2 }, maxLevel: 10, productionPerHour: { mana: 2 }, description: "Stores magical knowledge, passively generating mana.", upgradeMultiplier: 1.3 },
  { id: "creature_pen", name: "Creature Pen", category: "utility", baseCost: { coins: 180, rain_pearl: 15 }, maxLevel: 10, productionPerHour: {}, description: "Houses tamed sky creatures. Each level holds 2 more creatures.", upgradeMultiplier: 1.4 },
  { id: "spell_circle", name: "Spell Circle", category: "utility", baseCost: { coins: 200, storm_crystal: 10, aurora_gem: 1 }, maxLevel: 10, productionPerHour: {}, description: "An arcane circle for casting and empowering spells.", upgradeMultiplier: 1.3 },
  { id: "temple_shrine", name: "Temple Shrine", category: "utility", baseCost: { coins: 300, aurora_gem: 5, star_fragment: 5 }, maxLevel: 5, productionPerHour: { coins: 20 }, description: "A miniature temple that generates faith and coins.", upgradeMultiplier: 1.5 },
  { id: "trading_post", name: "Trading Post", category: "utility", baseCost: { coins: 250, cloud_silk: 15, wind_essence: 20 }, maxLevel: 10, productionPerHour: {}, description: "Enables resource trading at favorable rates.", upgradeMultiplier: 1.3 },
  // Military Buildings (6)
  { id: "storm_tower", name: "Storm Tower", category: "military", baseCost: { coins: 150, lightning_bolt: 8, storm_crystal: 5 }, maxLevel: 15, productionPerHour: {}, description: "Defensive tower that channels storm energy against island invaders.", upgradeMultiplier: 1.5 },
  { id: "wind_barracks", name: "Wind Barracks", category: "military", baseCost: { coins: 120, wind_essence: 15 }, maxLevel: 15, productionPerHour: {}, description: "Trains wind soldiers to defend your islands.", upgradeMultiplier: 1.4 },
  { id: "sky_bastion", name: "Sky Bastion", category: "military", baseCost: { coins: 300, storm_crystal: 15, aurora_gem: 3 }, maxLevel: 10, productionPerHour: {}, description: "Fortress that dramatically increases island defense.", upgradeMultiplier: 1.6 },
  { id: "lightning_battery", name: "Lightning Battery", category: "military", baseCost: { coins: 200, lightning_bolt: 12 }, maxLevel: 12, productionPerHour: { lightning_bolt: 1 }, description: "Stores lightning for devastating aerial attacks.", upgradeMultiplier: 1.5 },
  { id: "cloud_wall", name: "Cloud Wall", category: "military", baseCost: { coins: 100, cloud_silk: 20 }, maxLevel: 15, productionPerHour: {}, description: "A protective wall of hardened cloud.", upgradeMultiplier: 1.3 },
  { id: "rainbow_bridge", name: "Rainbow Bridge", category: "military", baseCost: { coins: 180, sun_shard: 8, rain_pearl: 12 }, maxLevel: 8, productionPerHour: {}, description: "Creates bridges between islands for rapid troop deployment.", upgradeMultiplier: 1.4 },
  // Special Buildings (6)
  { id: "weather_control", name: "Weather Control Center", category: "special", baseCost: { coins: 500, storm_crystal: 20, aurora_gem: 8, star_fragment: 5 }, maxLevel: 5, productionPerHour: {}, description: "Allows manual weather manipulation across your kingdom.", upgradeMultiplier: 2.0 },
  { id: "star_observatory", name: "Star Observatory", category: "special", baseCost: { coins: 400, star_fragment: 10, moon_dust: 15 }, maxLevel: 5, productionPerHour: { star_fragment: 1 }, description: "Observes celestial events for rare resource bonuses.", upgradeMultiplier: 1.8 },
  { id: "sun_temple", name: "Sun Temple", category: "special", baseCost: { coins: 600, sun_shard: 25, aurora_gem: 5 }, maxLevel: 5, productionPerHour: { sun_shard: 3 }, description: "A grand temple to the sun, empowering solar magic.", upgradeMultiplier: 2.0 },
  { id: "mist_generator", name: "Mist Generator", category: "special", baseCost: { coins: 350, moon_dust: 12, rain_pearl: 18 }, maxLevel: 5, productionPerHour: { moon_dust: 1 }, description: "Generates protective mist to hide islands from threats.", upgradeMultiplier: 1.7 },
  { id: "sky_palace", name: "Sky Palace", category: "special", baseCost: { coins: 1000, aurora_gem: 15, star_fragment: 10, sun_shard: 10 }, maxLevel: 3, productionPerHour: { coins: 50 }, description: "The ultimate symbol of sky power. Massively boosts everything.", upgradeMultiplier: 2.5 },
  { id: "wind_tunnel", name: "Wind Tunnel", category: "special", baseCost: { coins: 280, wind_essence: 30 }, maxLevel: 8, productionPerHour: { wind_essence: 5 }, description: "Accelerates airship travel and boosts wind-based production.", upgradeMultiplier: 1.6 },
];

export const CK_WEATHER_SCHOOLS: CkWeatherSchoolDef[] = [
  { id: "Wind", name: "Wind", description: "Master the invisible currents that shape the sky.", color: "#80DEEA", icon: "🌬️" },
  { id: "Rain", name: "Rain", description: "Command the life-giving rains and floods.", color: "#42A5F5", icon: "🌧️" },
  { id: "Lightning", name: "Lightning", description: "Wield the raw fury of the storm.", color: "#FFD740", icon: "⚡" },
  { id: "Sun", name: "Sun", description: "Channel the radiant power of sunlight.", color: "#FFB74D", icon: "☀️" },
  { id: "Cloud", name: "Cloud", description: "Shape and command the clouds themselves.", color: "#ECEFF1", icon: "☁️" },
  { id: "Snow", name: "Snow", description: "Bring the crystalline chill of the high heavens.", color: "#B3E5FC", icon: "❄️" },
  { id: "Aurora", name: "Aurora", description: "Paint the sky with ethereal lights.", color: "#69F0AE", icon: "🌈" },
  { id: "Storm", name: "Storm", description: "Unleash the combined fury of all weather.", color: "#5C6BC0", icon: "🌪️" },
];

export const CK_SPELLS: CkSpellDef[] = [
  // Wind (5)
  { id: "wind_gust", name: "Wind Gust", school: "Wind", manaCost: 5, power: 8, cooldown: 1, description: "A sudden burst of wind that pushes targets away.", rarity: "Common", unlockLevel: 1, effectType: "knockback" },
  { id: "zephyr_shield", name: "Zephyr Shield", school: "Wind", manaCost: 12, power: 15, cooldown: 3, description: "Creates a swirling wind barrier around the caster.", rarity: "Common", unlockLevel: 3, effectType: "defense" },
  { id: "gale_force", name: "Gale Force", school: "Wind", manaCost: 25, power: 30, cooldown: 5, description: "Summons a devastating gale that tears through enemies.", rarity: "Uncommon", unlockLevel: 8, effectType: "damage" },
  { id: "wind_walk", name: "Wind Walk", school: "Wind", manaCost: 18, power: 10, cooldown: 4, description: "Allows the caster to move at incredible speed on the wind.", rarity: "Uncommon", unlockLevel: 12, effectType: "movement" },
  { id: "tornado_summon", name: "Tornado Summon", school: "Wind", manaCost: 45, power: 60, cooldown: 8, description: "Calls forth a devastating tornado from the sky.", rarity: "Rare", unlockLevel: 20, effectType: "damage_aoe" },
  // Rain (5)
  { id: "light_rain", name: "Light Rain", school: "Rain", manaCost: 5, power: 6, cooldown: 1, description: "A gentle rain that heals allies and nurtures crops.", rarity: "Common", unlockLevel: 1, effectType: "heal" },
  { id: "water_jet", name: "Water Jet", school: "Rain", manaCost: 10, power: 14, cooldown: 2, description: "A high-pressure jet of rainwater.", rarity: "Common", unlockLevel: 4, effectType: "damage" },
  { id: "flash_flood", name: "Flash Flood", school: "Rain", manaCost: 30, power: 35, cooldown: 6, description: "Unleashes a wall of water that sweeps enemies away.", rarity: "Uncommon", unlockLevel: 10, effectType: "damage_aoe" },
  { id: "healing_rain", name: "Healing Rain", school: "Rain", manaCost: 20, power: 20, cooldown: 4, description: "Restorative rain that mends wounds over time.", rarity: "Uncommon", unlockLevel: 7, effectType: "heal_over_time" },
  { id: "monsoon_wrath", name: "Monsoon Wrath", school: "Rain", manaCost: 50, power: 55, cooldown: 8, description: "A catastrophic monsoon that drowns all opposition.", rarity: "Rare", unlockLevel: 22, effectType: "damage_aoe" },
  // Lightning (5)
  { id: "spark", name: "Spark", school: "Lightning", manaCost: 5, power: 10, cooldown: 1, description: "A small electrical spark that stuns briefly.", rarity: "Common", unlockLevel: 1, effectType: "stun" },
  { id: "lightning_bolt_spell", name: "Lightning Bolt", school: "Lightning", manaCost: 15, power: 22, cooldown: 2, description: "A focused bolt of lightning from the sky.", rarity: "Common", unlockLevel: 3, effectType: "damage" },
  { id: "chain_lightning", name: "Chain Lightning", school: "Lightning", manaCost: 30, power: 28, cooldown: 5, description: "Lightning that arcs between multiple targets.", rarity: "Uncommon", unlockLevel: 10, effectType: "damage_chain" },
  { id: "thunder_clap", name: "Thunder Clap", school: "Lightning", manaCost: 22, power: 18, cooldown: 3, description: "A deafening thunderclap that disorients all nearby.", rarity: "Uncommon", unlockLevel: 7, effectType: "stun_aoe" },
  { id: "divine_thunder", name: "Divine Thunder", school: "Lightning", manaCost: 55, power: 65, cooldown: 9, description: "Calls down god-like lightning that shatters the earth.", rarity: "Epic", unlockLevel: 25, effectType: "damage_aoe" },
  // Sun (5)
  { id: "sunbeam", name: "Sunbeam", school: "Sun", manaCost: 5, power: 8, cooldown: 1, description: "A focused beam of sunlight.", rarity: "Common", unlockLevel: 1, effectType: "damage" },
  { id: "solar_flare", name: "Solar Flare", school: "Sun", manaCost: 18, power: 24, cooldown: 3, description: "An explosive burst of solar energy.", rarity: "Common", unlockLevel: 5, effectType: "damage_aoe" },
  { id: "radiance", name: "Radiance", school: "Sun", manaCost: 25, power: 20, cooldown: 5, description: "An aura of blinding light that weakens enemies.", rarity: "Uncommon", unlockLevel: 11, effectType: "debuff" },
  { id: "sunrise_heal", name: "Sunrise Heal", school: "Sun", manaCost: 20, power: 25, cooldown: 4, description: "The healing warmth of the rising sun.", rarity: "Uncommon", unlockLevel: 8, effectType: "heal" },
  { id: "supernova", name: "Supernova", school: "Sun", manaCost: 60, power: 80, cooldown: 10, description: "Detonates a miniature star for cataclysmic damage.", rarity: "Epic", unlockLevel: 30, effectType: "damage_aoe" },
  // Cloud (5)
  { id: "cloud_form", name: "Cloud Form", school: "Cloud", manaCost: 8, power: 5, cooldown: 2, description: "Transform into an insubstantial cloud, avoiding attacks.", rarity: "Common", unlockLevel: 2, effectType: "defense" },
  { id: "cloud_bolt", name: "Cloud Bolt", school: "Cloud", manaCost: 10, power: 12, cooldown: 2, description: "Hurls a compressed ball of dense cloud matter.", rarity: "Common", unlockLevel: 4, effectType: "damage" },
  { id: "fog_bank", name: "Fog Bank", school: "Cloud", manaCost: 15, power: 10, cooldown: 3, description: "Creates a thick fog that blinds and confuses enemies.", rarity: "Uncommon", unlockLevel: 9, effectType: "debuff_aoe" },
  { id: "cloud_castle", name: "Cloud Castle", school: "Cloud", manaCost: 35, power: 30, cooldown: 7, description: "Constructs a fortress of hardened cloud for protection.", rarity: "Rare", unlockLevel: 16, effectType: "defense" },
  { id: "nimbus_wrath", name: "Nimbus Wrath", school: "Cloud", manaCost: 50, power: 50, cooldown: 8, description: "Commands a dark nimbus cloud to rain destruction.", rarity: "Rare", unlockLevel: 24, effectType: "damage_aoe" },
  // Snow (5)
  { id: "frost_touch", name: "Frost Touch", school: "Snow", manaCost: 5, power: 7, cooldown: 1, description: "A chilling touch that slows the target.", rarity: "Common", unlockLevel: 1, effectType: "slow" },
  { id: "ice_shard", name: "Ice Shard", school: "Snow", manaCost: 12, power: 16, cooldown: 2, description: "Launches razor-sharp ice crystals.", rarity: "Common", unlockLevel: 4, effectType: "damage" },
  { id: "blizzard", name: "Blizzard", school: "Snow", manaCost: 28, power: 32, cooldown: 5, description: "Howling blizzard that freezes everything in its path.", rarity: "Uncommon", unlockLevel: 12, effectType: "damage_aoe" },
  { id: "ice_armor", name: "Ice Armor", school: "Snow", manaCost: 20, power: 22, cooldown: 4, description: "Encases the caster in protective ice.", rarity: "Uncommon", unlockLevel: 8, effectType: "defense" },
  { id: "absolute_zero", name: "Absolute Zero", school: "Snow", manaCost: 55, power: 70, cooldown: 9, description: "Freezes the very air, stopping time itself.", rarity: "Epic", unlockLevel: 28, effectType: "stun_aoe" },
  // Aurora (5)
  { id: "aurora_glow", name: "Aurora Glow", school: "Aurora", manaCost: 6, power: 8, cooldown: 1, description: "A soft aurora light that boosts ally abilities.", rarity: "Common", unlockLevel: 2, effectType: "buff" },
  { id: "prismatic_beam", name: "Prismatic Beam", school: "Aurora", manaCost: 14, power: 20, cooldown: 3, description: "A beam of prismatic aurora light.", rarity: "Common", unlockLevel: 5, effectType: "damage" },
  { id: "aurora_curtain", name: "Aurora Curtain", school: "Aurora", manaCost: 22, power: 18, cooldown: 5, description: "A shimmering curtain of aurora that shields allies.", rarity: "Uncommon", unlockLevel: 11, effectType: "defense_aoe" },
  { id: "sky_painter", name: "Sky Painter", school: "Aurora", manaCost: 18, power: 15, cooldown: 4, description: "Paints the sky with aurora, disorienting enemies.", rarity: "Uncommon", unlockLevel: 9, effectType: "debuff_aoe" },
  { id: "cosmic_aurora", name: "Cosmic Aurora", school: "Aurora", manaCost: 50, power: 60, cooldown: 8, description: "A cosmic aurora display that warps reality itself.", rarity: "Epic", unlockLevel: 26, effectType: "damage_aoe" },
  // Storm (5)
  { id: "wind_shear", name: "Wind Shear", school: "Storm", manaCost: 8, power: 12, cooldown: 2, description: "Violent wind shear that cuts through defenses.", rarity: "Common", unlockLevel: 3, effectType: "damage" },
  { id: "storm_call", name: "Storm Call", school: "Storm", manaCost: 20, power: 25, cooldown: 4, description: "Summons a localized storm with wind, rain, and lightning.", rarity: "Uncommon", unlockLevel: 10, effectType: "damage_aoe" },
  { id: "thunderstorm", name: "Thunderstorm", school: "Storm", manaCost: 30, power: 35, cooldown: 6, description: "A massive thunderstorm that devastates an area.", rarity: "Rare", unlockLevel: 18, effectType: "damage_aoe" },
  { id: "eye_of_storm", name: "Eye of Storm", school: "Storm", manaCost: 25, power: 20, cooldown: 5, description: "Creates a calm eye within chaos, granting clarity and power.", rarity: "Uncommon", unlockLevel: 14, effectType: "buff" },
  { id: "apocalypse_storm", name: "Apocalypse Storm", school: "Storm", manaCost: 70, power: 90, cooldown: 12, description: "The ultimate storm that combines all weather schools.", rarity: "Legendary", unlockLevel: 38, effectType: "damage_aoe" },
];

export const CK_CREATURES: CkCreatureDef[] = [
  // Common (8)
  { id: "cloud_finch", name: "Cloud Finch", element: "Wind", rarity: "Common", abilities: ["Gust", "Nest Building"], tamingDifficulty: 1, hp: 20, attack: 3, defense: 2, description: "A tiny bird woven from cloud threads. Beloved by beginners." },
  { id: "wind_pup", name: "Wind Pup", element: "Wind", rarity: "Common", abilities: ["Tailwind", "Fetch"], tamingDifficulty: 1, hp: 25, attack: 4, defense: 3, description: "A playful pup made of swirling air currents." },
  { id: "mist_sprout", name: "Mist Sprout", element: "Mist", rarity: "Common", abilities: ["Mist Veil", "Photosynthesis"], tamingDifficulty: 1, hp: 15, attack: 2, defense: 4, description: "A small plant creature that thrives in mist." },
  { id: "rain_droplet", name: "Rain Droplet", element: "Cloud", rarity: "Common", abilities: ["Splash", "Refresh"], tamingDifficulty: 1, hp: 18, attack: 3, defense: 2, description: "An animated droplet of enchanted rainwater." },
  { id: "frost_fox", name: "Frost Fox", element: "Ice", rarity: "Common", abilities: ["Ice Breath", "Snow Trail"], tamingDifficulty: 2, hp: 22, attack: 5, defense: 3, description: "A sleek fox with crystalline ice fur." },
  { id: "spark_squirrel", name: "Spark Squirrel", element: "Lightning", rarity: "Common", abilities: ["Static Charge", "Quick Dash"], tamingDifficulty: 2, hp: 18, attack: 4, defense: 2, description: "An energetic squirrel crackling with static." },
  { id: "sun_moth", name: "Sun Moth", element: "Sun", rarity: "Common", abilities: ["Warm Glow", "Sunlight Shield"], tamingDifficulty: 2, hp: 16, attack: 3, defense: 3, description: "A radiant moth drawn to warmth and light." },
  { id: "glow_jellyfish", name: "Glow Jellyfish", element: "Moon", rarity: "Common", abilities: ["Moonbeam Pulse", "Float"], tamingDifficulty: 2, hp: 20, attack: 4, defense: 2, description: "A translucent jellyfish that drifts on moonbeams." },
  // Uncommon (8)
  { id: "wind_serpent", name: "Wind Serpent", element: "Wind", rarity: "Uncommon", abilities: ["Tornado Spin", "Wind Dive"], tamingDifficulty: 3, hp: 45, attack: 10, defense: 7, description: "A sinuous serpent that rides the highest winds." },
  { id: "cloud_whale", name: "Cloud Whale", element: "Cloud", rarity: "Uncommon", abilities: ["Cloud Song", "Whale Shield"], tamingDifficulty: 3, hp: 70, attack: 8, defense: 12, description: "A massive whale swimming through cloud oceans." },
  { id: "storm_eagle", name: "Storm Eagle", element: "Storm", rarity: "Uncommon", abilities: ["Storm Dive", "Thunder Screech"], tamingDifficulty: 4, hp: 50, attack: 14, defense: 8, description: "A fearsome eagle that nests in thunderheads." },
  { id: "moon_moth", name: "Moon Moth", element: "Moon", rarity: "Uncommon", abilities: ["Lunar Dust", "Dream Weave"], tamingDifficulty: 3, hp: 35, attack: 8, defense: 6, description: "A large moth whose wings hold lunar secrets." },
  { id: "rain_serpent", name: "Rain Serpent", element: "Cloud", rarity: "Uncommon", abilities: ["Water Whip", "Tidal Push"], tamingDifficulty: 3, hp: 40, attack: 11, defense: 7, description: "An aquatic serpent born from magical rainstorms." },
  { id: "snow_owl", name: "Snow Owl", element: "Ice", rarity: "Uncommon", abilities: ["Frost Gaze", "Silent Flight"], tamingDifficulty: 3, hp: 38, attack: 10, defense: 8, description: "An ancient owl that sees through blizzards." },
  { id: "sun_lizard", name: "Sun Lizard", element: "Sun", rarity: "Uncommon", abilities: ["Solar Beam", "Heat Shield"], tamingDifficulty: 4, hp: 42, attack: 12, defense: 6, description: "A golden lizard that basks in concentrated sunlight." },
  { id: "star_fox", name: "Star Fox", element: "Star", rarity: "Uncommon", abilities: ["Starlight Dash", "Constellation Map"], tamingDifficulty: 4, hp: 40, attack: 11, defense: 7, description: "A clever fox marked with constellation patterns." },
  // Rare (8)
  { id: "thunderbird", name: "Thunderbird", element: "Lightning", rarity: "Rare", abilities: ["Lightning Strike", "Storm Call"], tamingDifficulty: 5, hp: 80, attack: 22, defense: 14, description: "A legendary bird that brings thunder wherever it flies." },
  { id: "sun_phoenix", name: "Sun Phoenix", element: "Sun", rarity: "Rare", abilities: ["Phoenix Flame", "Rebirth"], tamingDifficulty: 6, hp: 90, attack: 25, defense: 16, description: "A radiant phoenix reborn in solar fire." },
  { id: "star_griffin", name: "Star Griffin", element: "Star", rarity: "Rare", abilities: ["Star Dive", "Cosmic Shield"], tamingDifficulty: 6, hp: 85, attack: 24, defense: 18, description: "A griffin whose feathers contain captured starlight." },
  { id: "mist_fairy", name: "Mist Fairy", element: "Mist", rarity: "Rare", abilities: ["Mist Illusion", "Fairy Heal"], tamingDifficulty: 5, hp: 50, attack: 15, defense: 12, description: "An elusive fairy that dwells in the thickest mists." },
  { id: "crystal_deer", name: "Crystal Deer", element: "Crystal", rarity: "Rare", abilities: ["Crystal Antlers", "Prism Walk"], tamingDifficulty: 5, hp: 65, attack: 18, defense: 20, description: "A majestic deer with antlers of living crystal." },
  { id: "aurora_wolf", name: "Aurora Wolf", element: "Aurora", rarity: "Rare", abilities: ["Aurora Howl", "Northern Lights"], tamingDifficulty: 6, hp: 70, attack: 20, defense: 15, description: "A wolf whose howl creates aurora displays." },
  { id: "frost_dragon", name: "Frost Dragon", element: "Ice", rarity: "Rare", abilities: ["Frost Breath", "Ice Fortress"], tamingDifficulty: 7, hp: 100, attack: 28, defense: 22, description: "A dragon that breathes air cold enough to freeze time." },
  { id: "fire_storm_hawk", name: "Fire Storm Hawk", element: "Fire", rarity: "Rare", abilities: ["Flame Dive", "Storm Wings"], tamingDifficulty: 6, hp: 75, attack: 26, defense: 14, description: "A hawk wreathed in storm-fueled fire." },
  // Epic (6)
  { id: "aurora_dragon", name: "Aurora Dragon", element: "Aurora", rarity: "Epic", abilities: ["Aurora Breath", "Reality Shift", "Prism Barrier"], tamingDifficulty: 8, hp: 150, attack: 40, defense: 30, description: "A dragon that commands the aurora to bend reality." },
  { id: "celestial_titan", name: "Celestial Titan", element: "Star", rarity: "Epic", abilities: ["Star Fall", "Cosmic Roar", "Gravity Well"], tamingDifficulty: 9, hp: 180, attack: 45, defense: 35, description: "A titan forged from the material of dying stars." },
  { id: "storm_sovereign", name: "Storm Sovereign", element: "Storm", rarity: "Epic", abilities: ["Perfect Storm", "Lightning Domain", "Wind Emperor"], tamingDifficulty: 8, hp: 160, attack: 42, defense: 32, description: "The undisputed ruler of all storm creatures." },
  { id: "moon_leviathan", name: "Moon Leviathan", element: "Moon", rarity: "Epic", abilities: ["Moonbeam Cannon", "Tidal Surge", "Eclipse Veil"], tamingDifficulty: 9, hp: 200, attack: 38, defense: 40, description: "A massive sea-creature that surfaces in moonlight." },
  { id: "sun_colossus", name: "Sun Colossus", element: "Sun", rarity: "Epic", abilities: ["Solar Flare", "Blinding Light", "Eternal Flame"], tamingDifficulty: 8, hp: 170, attack: 48, defense: 28, description: "A being of pure solar energy in humanoid form." },
  { id: "wind_djinn", name: "Wind Djinn", element: "Wind", rarity: "Epic", abilities: ["Desert Storm", "Cyclone Dance", "Wish Grant"], tamingDifficulty: 9, hp: 140, attack: 35, defense: 38, description: "An ancient spirit of wind that grants wishes." },
  // Legendary (4)
  { id: "sky_emperor_dragon", name: "Sky Emperor Dragon", element: "Star", rarity: "Legendary", abilities: ["Emperor's Command", "Star Annihilation", "Atmospheric Domination", "Eternal Flight"], tamingDifficulty: 10, hp: 300, attack: 60, defense: 50, description: "The mythical king of all sky creatures. Ruler of the heavens." },
  { id: "primordial_storm", name: "Primordial Storm", element: "Storm", rarity: "Legendary", abilities: ["Genesis Storm", "Weather Mastery", "Elemental Fusion", "Apocalypse"], tamingDifficulty: 10, hp: 350, attack: 55, defense: 55, description: "The original storm from which all weather was born." },
  { id: "aurora_goddess", name: "Aurora Goddess", element: "Aurora", rarity: "Legendary", abilities: ["Divine Aurora", "Reality Paint", "Color of Life", "Eternal Sky"], tamingDifficulty: 10, hp: 280, attack: 50, defense: 60, description: "A goddess who paints the sky with the colors of existence." },
  { id: "cosmic_whale", name: "Cosmic Whale", element: "Moon", rarity: "Legendary", abilities: ["Cosmic Song", "Gravity Surf", "Moon Gate", "Stellar Migration"], tamingDifficulty: 10, hp: 400, attack: 45, defense: 65, description: "A whale that swims between stars through moon gates." },
];

export const CK_TEMPLES: CkTempleDef[] = [
  { id: "temple_breeze", name: "Temple of Breeze", description: "A serene temple atop gentle winds. Grants enhanced wind magic.", bonusType: "wind_production", bonusValue: 25, requiredLevel: 5, guardianName: "Zephyr Knight", guardianHP: 100, trialReward: { wind_essence: 50, coins: 200 }, color: "#B2EBF2" },
  { id: "temple_gale", name: "Temple of Gale", description: "Temple of howling gales. Boosts airship speed significantly.", bonusType: "airship_speed", bonusValue: 30, requiredLevel: 12, guardianName: "Gale Warden", guardianHP: 250, trialReward: { storm_crystal: 30, lightning_bolt: 20, coins: 500 }, color: "#4DD0E1" },
  { id: "temple_hurricane", name: "Temple of Hurricane", description: "The eye of the eternal hurricane. Massive combat bonuses.", bonusType: "combat_power", bonusValue: 40, requiredLevel: 20, guardianName: "Hurricane Lord", guardianHP: 500, trialReward: { lightning_bolt: 50, storm_crystal: 40, aurora_gem: 10, coins: 1000 }, color: "#00ACC1" },
  { id: "temple_zephyr", name: "Temple of Zephyr", description: "Hidden temple of gentle zephyrs. Enhances creature taming.", bonusType: "taming_bonus", bonusValue: 20, requiredLevel: 8, guardianName: "Zephyr Sage", guardianHP: 180, trialReward: { cloud_silk: 40, rain_pearl: 30, moon_dust: 20, coins: 400 }, color: "#80DEEA" },
  { id: "temple_tornado", name: "Temple of Tornado", description: "A spiraling temple at the heart of a perpetual tornado.", bonusType: "resource_multiplier", bonusValue: 35, requiredLevel: 28, guardianName: "Vortex Titan", guardianHP: 800, trialReward: { aurora_gem: 20, star_fragment: 15, sun_shard: 30, coins: 2000 }, color: "#0097A7" },
  { id: "temple_monsoon", name: "Temple of Monsoon", description: "An ancient temple drenched in eternal monsoon rain.", bonusType: "mana_regen", bonusValue: 50, requiredLevel: 35, guardianName: "Monsoon Empress", guardianHP: 1200, trialReward: { aurora_gem: 30, star_fragment: 25, moon_dust: 50, coins: 3000 }, color: "#00838F" },
];

export const CK_AIRSHIPS: CkAirshipDef[] = [
  { id: "scout_balloon", name: "Scout Balloon", category: "recon", capacity: 2, speed: 3, cost: 100, unlockLevel: 1, description: "A simple hot-air balloon for scouting nearby islands.", combatPower: 0 },
  { id: "trade_skiff", name: "Trade Skiff", category: "trade", capacity: 5, speed: 4, cost: 250, unlockLevel: 3, description: "A small trading vessel for inter-island commerce.", combatPower: 2 },
  { id: "war_airship", name: "War Airship", category: "military", capacity: 3, speed: 2, cost: 500, unlockLevel: 8, description: "A heavily armored warship bristling with weapons.", combatPower: 15 },
  { id: "royal_barge", name: "Royal Barge", category: "luxury", capacity: 8, speed: 3, cost: 800, unlockLevel: 12, description: "An opulent barge for royal transport and diplomacy.", combatPower: 5 },
  { id: "exploration_vessel", name: "Exploration Vessel", category: "exploration", capacity: 6, speed: 5, cost: 600, unlockLevel: 10, description: "A swift ship designed for charting unknown skies.", combatPower: 8 },
  { id: "cargo_airship", name: "Cargo Airship", category: "logistics", capacity: 15, speed: 2, cost: 400, unlockLevel: 6, description: "A heavy transport ship for bulk resource movement.", combatPower: 1 },
  { id: "racing_skimmer", name: "Racing Skimmer", category: "speed", capacity: 1, speed: 8, cost: 700, unlockLevel: 15, description: "The fastest vessel in the sky, built for racing.", combatPower: 3 },
  { id: "legendary_flagship", name: "Legendary Flagship", category: "flagship", capacity: 20, speed: 4, cost: 5000, unlockLevel: 30, description: "The pinnacle of airship engineering. Commands the fleet.", combatPower: 50 },
];

export const CK_QUESTS: CkQuestDef[] = [
  { id: "q01", name: "First Winds", description: "Build your first Wind Mill on Dawn Island.", objectiveType: "build", objectiveTarget: 1, xpReward: 30, coinReward: 50, resourceReward: { wind_essence: 20 }, requiredLevel: 1, category: "building" },
  { id: "q02", name: "Sky Education", description: "Learn your first 3 weather spells.", objectiveType: "learn_spells", objectiveTarget: 3, xpReward: 50, coinReward: 80, resourceReward: { cloud_silk: 10 }, requiredLevel: 2, category: "magic" },
  { id: "q03", name: "Cloud Companion", description: "Tame your first sky creature.", objectiveType: "tame_creature", objectiveTarget: 1, xpReward: 60, coinReward: 60, resourceReward: { cloud_silk: 15, rain_pearl: 10 }, requiredLevel: 2, category: "creature" },
  { id: "q04", name: "Expanding Horizons", description: "Unlock Zephyr Plateau.", objectiveType: "unlock_island", objectiveTarget: 1, xpReward: 80, coinReward: 100, resourceReward: { wind_essence: 40 }, requiredLevel: 5, category: "exploration" },
  { id: "q05", name: "Storm Warning", description: "Build 3 buildings on Storm Peak.", objectiveType: "build_on_island", objectiveTarget: 3, xpReward: 100, coinReward: 150, resourceReward: { storm_crystal: 20, lightning_bolt: 15 }, requiredLevel: 5, category: "building" },
  { id: "q06", name: "Weather Mastery I", description: "Cast 10 spells total.", objectiveType: "cast_spells", objectiveTarget: 10, xpReward: 80, coinReward: 70, resourceReward: { moon_dust: 10 }, requiredLevel: 6, category: "magic" },
  { id: "q07", name: "Creature Collector", description: "Tame 3 different sky creatures.", objectiveType: "tame_creature", objectiveTarget: 3, xpReward: 120, coinReward: 120, resourceReward: { rain_pearl: 25, cloud_silk: 20 }, requiredLevel: 7, category: "creature" },
  { id: "q08", name: "Sky Fleet", description: "Purchase your first airship.", objectiveType: "buy_airship", objectiveTarget: 1, xpReward: 100, coinReward: 200, resourceReward: { wind_essence: 30 }, requiredLevel: 4, category: "fleet" },
  { id: "q09", name: "Temple Initiate", description: "Complete a trial at the Temple of Breeze.", objectiveType: "temple_trial", objectiveTarget: 1, xpReward: 150, coinReward: 200, resourceReward: { wind_essence: 50, cloud_silk: 30 }, requiredLevel: 5, category: "temple" },
  { id: "q10", name: "Mist Haven Mystery", description: "Unlock and settle Mist Haven.", objectiveType: "settle_island", objectiveTarget: 1, xpReward: 120, coinReward: 180, resourceReward: { moon_dust: 20, rain_pearl: 25 }, requiredLevel: 8, category: "exploration" },
  { id: "q11", name: "Spell Scholar", description: "Learn spells from 4 different weather schools.", objectiveType: "learn_schools", objectiveTarget: 4, xpReward: 180, coinReward: 250, resourceReward: { star_fragment: 5, storm_crystal: 15 }, requiredLevel: 10, category: "magic" },
  { id: "q12", name: "Island Architect", description: "Build 10 buildings across all your islands.", objectiveType: "build", objectiveTarget: 10, xpReward: 200, coinReward: 300, resourceReward: { aurora_gem: 3, sun_shard: 10 }, requiredLevel: 12, category: "building" },
  { id: "q13", name: "Airship Captain", description: "Send 5 airship missions.", objectiveType: "send_airship", objectiveTarget: 5, xpReward: 150, coinReward: 200, resourceReward: { wind_essence: 50, cloud_silk: 30 }, requiredLevel: 10, category: "fleet" },
  { id: "q14", name: "Resource Baron", description: "Accumulate 200 of any single resource.", objectiveType: "accumulate_resource", objectiveTarget: 200, xpReward: 160, coinReward: 180, resourceReward: { coins: 500 }, requiredLevel: 10, category: "resources" },
  { id: "q15", name: "Crystal Cloud Discovery", description: "Unlock Crystal Cloud island.", objectiveType: "unlock_island", objectiveTarget: 1, xpReward: 250, coinReward: 400, resourceReward: { star_fragment: 10, aurora_gem: 5 }, requiredLevel: 10, category: "exploration" },
  { id: "q16", name: "Thunder Rock Assault", description: "Build defenses on Thunder Rock.", objectiveType: "build_military", objectiveTarget: 2, xpReward: 200, coinReward: 300, resourceReward: { lightning_bolt: 30, storm_crystal: 25 }, requiredLevel: 14, category: "building" },
  { id: "q17", name: "Legendary Hunter", description: "Tame a Rare or higher rarity creature.", objectiveType: "tame_rare", objectiveTarget: 1, xpReward: 250, coinReward: 350, resourceReward: { aurora_gem: 8, star_fragment: 5 }, requiredLevel: 15, category: "creature" },
  { id: "q18", name: "Sun Spire Ascension", description: "Settle Sun Spire and build a Sun Temple.", objectiveType: "special_building", objectiveTarget: 1, xpReward: 300, coinReward: 500, resourceReward: { sun_shard: 30, aurora_gem: 10 }, requiredLevel: 18, category: "building" },
  { id: "q19", name: "Temple Guardian", description: "Complete trials at 3 different temples.", objectiveType: "temple_trial", objectiveTarget: 3, xpReward: 350, coinReward: 600, resourceReward: { aurora_gem: 12, star_fragment: 8 }, requiredLevel: 20, category: "temple" },
  { id: "q20", name: "Sky Emperor's Challenge", description: "Reach Cloud Emperor title (level 38).", objectiveType: "reach_title", objectiveTarget: 1, xpReward: 1000, coinReward: 2000, resourceReward: { aurora_gem: 30, star_fragment: 20, sun_shard: 20 }, requiredLevel: 38, category: "progression" },
  { id: "q21", name: "Aurora Peak Expedition", description: "Unlock Aurora Peak and build 5 structures.", objectiveType: "build_on_island", objectiveTarget: 5, xpReward: 400, coinReward: 700, resourceReward: { aurora_gem: 15, snow_flake: 40 }, requiredLevel: 28, category: "exploration" },
  { id: "q22", name: "Ultimate Fleet", description: "Own the Legendary Flagship.", objectiveType: "buy_airship", objectiveTarget: 1, xpReward: 500, coinReward: 1000, resourceReward: { star_fragment: 15, aurora_gem: 10 }, requiredLevel: 30, category: "fleet" },
];

export const CK_NPCS: CkNpcDef[] = [
  { id: "npc_sky_king", name: "Aurelius", title: "Sky King", role: "Ruler", dialogue: "Welcome, young Cloud Ruler. The sky is vast, and your destiny awaits among the clouds.", bonusType: "all_production", bonusValue: 10 },
  { id: "npc_weather_sage", name: "Nimbus", title: "Weather Sage", role: "Magic", dialogue: "The winds speak, the storms sing, and the rain weeps. Listen closely, and weather magic shall reveal itself.", bonusType: "spell_power", bonusValue: 15 },
  { id: "npc_creature_keeper", name: "Sylara", title: "Creature Keeper", role: "Creatures", dialogue: "Every sky creature has a heart as vast as the horizon. Tame them with kindness, not force.", bonusType: "taming_success", bonusValue: 12 },
  { id: "npc_wind_navigator", name: "Gale", title: "Wind Navigator", role: "Navigation", dialogue: "The winds change constantly. A true navigator reads the air like a book.", bonusType: "airship_speed", bonusValue: 20 },
  { id: "npc_temple_guardian", name: "Oracle", title: "Temple Guardian", role: "Temples", dialogue: "The temples hold ancient power. Prove your worth, and their secrets shall be yours.", bonusType: "temple_bonus", bonusValue: 15 },
  { id: "npc_merchant_captain", name: "Coinworth", title: "Merchant Captain", role: "Trade", dialogue: "Everything has a price in the sky. I deal in resources, airships, and opportunities.", bonusType: "trade_discount", bonusValue: 10 },
  { id: "npc_royal_advisor", name: "Councillor Vex", title: "Royal Advisor", role: "Strategy", dialogue: "A wise ruler plans three storms ahead. Let me guide your kingdom to greatness.", bonusType: "xp_bonus", bonusValue: 10 },
  { id: "npc_cloud_artisan", name: "Cumulus", title: "Cloud Artisan", role: "Building", dialogue: "I shape clouds into castles, silk into bridges, and dreams into reality.", bonusType: "build_discount", bonusValue: 8 },
];

export const CK_ACHIEVEMENTS: CkAchievementDef[] = [
  { id: "ach_first_island", name: "First Foothold", description: "Settle your first island.", condition: "totalIslandsUnlocked >= 1", reward: 50, icon: "🏝️" },
  { id: "ach_builder_10", name: "Sky Architect", description: "Build 10 buildings total.", condition: "totalBuildingsBuilt >= 10", reward: 100, icon: "🏗️" },
  { id: "ach_builder_25", name: "Master Builder", description: "Build 25 buildings total.", condition: "totalBuildingsBuilt >= 25", reward: 300, icon: "🏰" },
  { id: "ach_spell_10", name: "Weather Apprentice", description: "Learn 10 different spells.", condition: "spells_learned >= 10", reward: 80, icon: "📖" },
  { id: "ach_spell_30", name: "Weather Master", description: "Learn 30 different spells.", condition: "spells_learned >= 30", reward: 400, icon: "📚" },
  { id: "ach_tamer_5", name: "Creature Friend", description: "Tame 5 different creatures.", condition: "totalCreaturesTamed >= 5", reward: 100, icon: "🐾" },
  { id: "ach_tamer_15", name: "Beast Lord", description: "Tame 15 different creatures.", condition: "totalCreaturesTamed >= 15", reward: 500, icon: "🦁" },
  { id: "ach_tamer_legendary", name: "Legendary Tamer", description: "Tame a Legendary creature.", condition: "has_legendary", reward: 800, icon: "👑" },
  { id: "ach_all_islands", name: "Sky Emperor", description: "Unlock all 12 islands.", condition: "totalIslandsUnlocked >= 12", reward: 1000, icon: "🌍" },
  { id: "ach_fleet_5", name: "Air Admiral", description: "Own 5 different airships.", condition: "airships_owned >= 5", reward: 300, icon: "🚀" },
  { id: "ach_temple_3", name: "Temple Acolyte", description: "Complete 3 temple trials.", condition: "totalTempleTrials >= 3", reward: 200, icon: "⛪" },
  { id: "ach_temple_6", name: "Temple Master", description: "Complete all 6 temple trials.", condition: "totalTempleTrials >= 6", reward: 800, icon: "🏛️" },
  { id: "ach_quest_10", name: "Quest Champion", description: "Complete 10 quests.", condition: "totalQuestsCompleted >= 10", reward: 250, icon: "📜" },
  { id: "ach_coins_10k", name: "Sky Tycoon", description: "Accumulate 10,000 coins.", condition: "coins >= 10000", reward: 300, icon: "💰" },
  { id: "ach_level_45", name: "Eternal Sky God", description: "Reach the maximum level of 45.", condition: "level >= 45", reward: 2000, icon: "✨" },
];

// ---------------------------------------------------------------------------
// Seeded PRNG (SSR-safe, no Math.random)
// ---------------------------------------------------------------------------

function ckSeededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = h ^ (h << 13);
    h = h ^ (h >> 17);
    h = h ^ (h << 5);
    return (h >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function ckClamp(min: number, max: number, val: number): number {
  return Math.max(min, Math.min(max, val));
}

function ckGetTodaySeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function ckGetWeekSeed(): string {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNumber}`;
}

function ckGetMonthSeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

function ckGetXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.35, level - 1));
}

function ckCalculateLevel(xp: number): number {
  let lvl = 1;
  let xpNeeded = ckGetXpForLevel(lvl);
  while (xp >= xpNeeded && lvl < CK_MAX_LEVEL) {
    xp -= xpNeeded;
    lvl++;
    xpNeeded = ckGetXpForLevel(lvl);
  }
  return lvl;
}

function ckCalculateTitle(level: number): string {
  let title = CK_TITLE_THRESHOLDS[0].title;
  for (const t of CK_TITLE_THRESHOLDS) {
    if (level >= t.minLevel) {
      title = t.title;
    }
  }
  return title;
}

function ckGetBuildingCost(building: CkBuildingDef, currentLevel: number): Record<string, number> {
  const multiplier = Math.pow(building.upgradeMultiplier, currentLevel);
  const cost: Record<string, number> = {};
  for (const [key, val] of Object.entries(building.baseCost)) {
    cost[key] = Math.floor(val * multiplier);
  }
  return cost;
}

function ckCanAfford(resources: Record<string, number>, cost: Record<string, number>): boolean {
  for (const [key, val] of Object.entries(cost)) {
    if ((resources[key] ?? 0) < val) return false;
  }
  return true;
}

function ckSpendResources(resources: Record<string, number>, cost: Record<string, number>): Record<string, number> {
  const newResources = { ...resources };
  for (const [key, val] of Object.entries(cost)) {
    newResources[key] = (newResources[key] ?? 0) - val;
  }
  return newResources;
}

function ckGetIslandResourceProduction(state: CloudKingdomState): Record<string, number> {
  const production: Record<string, number> = {};
  for (const island of state.islands) {
    if (!island.settled) continue;
    for (const buildingInst of island.buildings) {
      const def = CK_BUILDINGS.find(b => b.id === buildingInst.defId);
      if (!def) continue;
      const multiplier = Math.pow(1.2, buildingInst.level - 1);
      for (const [key, val] of Object.entries(def.productionPerHour)) {
        production[key] = (production[key] ?? 0) + Math.floor(val * multiplier);
      }
    }
  }
  // Weather station boost
  for (const island of state.islands) {
    if (!island.settled) continue;
    for (const buildingInst of island.buildings) {
      if (buildingInst.defId === "weather_station") {
        for (const key of Object.keys(production)) {
          production[key] = Math.floor(production[key]! * (1 + 0.05 * buildingInst.level));
        }
      }
    }
  }
  return production;
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

function ckCreateInitialState(): CloudKingdomState {
  const islands: CkIslandState[] = CK_ISLANDS.map(isl => ({
    defId: isl.id,
    unlocked: isl.id === "dawn_island",
    settled: isl.id === "dawn_island",
    buildings: isl.id === "dawn_island" ? [] : [],
  }));

  const spells: CkSpellState[] = CK_SPELLS.map(sp => ({
    defId: sp.id,
    learned: false,
    castCount: 0,
    cooldownRemaining: 0,
  }));

  const airships: CkAirshipInstance[] = CK_AIRSHIPS.map(a => ({
    defId: a.id,
    owned: false,
    deployed: false,
    missionEndTime: 0,
    missionType: "idle",
    level: 1,
  }));

  const quests: CkQuestState[] = CK_QUESTS.map(q => ({
    defId: q.id,
    accepted: false,
    completed: false,
    progress: 0,
  }));

  const initialResources: Record<string, number> = {};
  for (const r of CK_RESOURCES) {
    initialResources[r.id] = 20;
  }

  return {
    level: 1,
    xp: 0,
    coins: 500,
    mana: 50,
    maxMana: 50,
    islands,
    buildings: [],
    creatures: [],
    spells,
    resources: { ...initialResources, coins: 500 },
    airships,
    quests,
    achievements: [],
    streak: 0,
    lastDaily: null,
    daily: {
      dateSeed: ckGetTodaySeed(),
      weatherCalibrated: false,
      calibrationTarget: 10,
      calibrationProgress: 0,
      rewardClaimed: false,
    },
    weekly: {
      weekSeed: ckGetWeekSeed(),
      raceCompleted: false,
      racePosition: 0,
      raceReward: 0,
    },
    monthly: {
      monthSeed: ckGetMonthSeed(),
      challengeCompleted: false,
      challengeProgress: 0,
      challengeReward: {},
    },
    stats: {
      totalIslandsUnlocked: 1,
      totalBuildingsBuilt: 0,
      totalSpellsCast: 0,
      totalCreaturesTamed: 0,
      totalResourcesGathered: 0,
      totalQuestsCompleted: 0,
      totalAirshipsSent: 0,
      totalTempleTrials: 0,
      totalCoinsEarned: 500,
      totalXPEarned: 0,
    },
    templeTrialsCompleted: [],
    kingdomName: "New Cloud Kingdom",
  };
}

// ---------------------------------------------------------------------------
// React Hook (internal state management with hooks)
// ---------------------------------------------------------------------------

export function useCloudKingdom() {
  const stateRef = useRef<CloudKingdomState | null>(null);
  const _initialState = ckCreateInitialState();
  if (stateRef.current === null) {
    stateRef.current = _initialState;
  }

  const [state, setState] = useState<CloudKingdomState>(_initialState);

  const updateState = useCallback((updater: (prev: CloudKingdomState) => CloudKingdomState) => {
    setState(prev => {
      const next = updater(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  // Action functions bound to state
  const addXP = useCallback((amount: number) => {
    updateState(prev => {
      const newState = { ...prev, xp: prev.xp + amount, stats: { ...prev.stats, totalXPEarned: prev.stats.totalXPEarned + amount } };
      const newLevel = ckCalculateLevel(newState.xp);
      if (newLevel > newState.level) {
        newState.level = newLevel;
        newState.maxMana = 50 + (newLevel - 1) * 10;
      }
      return newState;
    });
  }, [updateState]);

  const addCoins = useCallback((amount: number) => {
    updateState(prev => ({
      ...prev,
      coins: prev.coins + amount,
      resources: { ...prev.resources, coins: (prev.resources.coins ?? 0) + amount },
      stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + amount },
    }));
  }, [updateState]);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    updateState(prev => {
      if (prev.coins < amount) return prev;
      success = true;
      return {
        ...prev,
        coins: prev.coins - amount,
        resources: { ...prev.resources, coins: (prev.resources.coins ?? 0) - amount },
      };
    });
    return success;
  }, [updateState]);

  return {
    state,
    addXP,
    addCoins,
    spendCoins,
    updateState,
  };
}

// ---------------------------------------------------------------------------
// State Access & Reset (exported ck functions)
// ---------------------------------------------------------------------------

export function ckGetState(): CloudKingdomState {
  return ckCreateInitialState();
}

export function ckResetState(): CloudKingdomState {
  return ckCreateInitialState();
}

// ---------------------------------------------------------------------------
// Level & XP Functions
// ---------------------------------------------------------------------------

export function ckGetLevel(state: CloudKingdomState): number {
  return state.level;
}

export function ckGetTitle(state: CloudKingdomState): string {
  return ckCalculateTitle(state.level);
}

export function ckGetTitleForLevel(level: number): string {
  return ckCalculateTitle(level);
}

export function ckGetProgress(state: CloudKingdomState): number {
  const currentLevelXp = ckGetXpForLevel(state.level);
  const nextLevelXp = ckGetXpForLevel(state.level + 1);
  return nextLevelXp > currentLevelXp
    ? Math.floor((state.xp / nextLevelXp) * 100)
    : 100;
}

export function ckAddXP(state: CloudKingdomState, amount: number): CloudKingdomState {
  const newState = { ...state, xp: state.xp + amount, stats: { ...state.stats, totalXPEarned: state.stats.totalXPEarned + amount } };
  const newLevel = ckCalculateLevel(newState.xp);
  if (newLevel > newState.level) {
    newState.level = newLevel;
    newState.maxMana = 50 + (newLevel - 1) * 10;
  }
  return newState;
}

export function ckGetXPForLevel(level: number): number {
  return ckGetXpForLevel(level);
}

export function ckGetXPToNextLevel(state: CloudKingdomState): number {
  return ckGetXpForLevel(state.level + 1);
}

export function ckCanLevelUp(state: CloudKingdomState): boolean {
  return state.level < CK_MAX_LEVEL;
}

// ---------------------------------------------------------------------------
// Coin Functions
// ---------------------------------------------------------------------------

export function ckGetCoins(state: CloudKingdomState): number {
  return state.coins;
}

export function ckAddCoins(state: CloudKingdomState, amount: number): CloudKingdomState {
  return {
    ...state,
    coins: state.coins + amount,
    resources: { ...state.resources, coins: (state.resources.coins ?? 0) + amount },
    stats: { ...state.stats, totalCoinsEarned: state.stats.totalCoinsEarned + amount },
  };
}

export function ckSpendCoins(state: CloudKingdomState, amount: number): CloudKingdomState | null {
  if (state.coins < amount) return null;
  return {
    ...state,
    coins: state.coins - amount,
    resources: { ...state.resources, coins: (state.resources.coins ?? 0) - amount },
  };
}

// ---------------------------------------------------------------------------
// Island Functions
// ---------------------------------------------------------------------------

export function ckGetIslands(state: CloudKingdomState): CkIslandDef[] {
  return CK_ISLANDS;
}

export function ckGetIslandInfo(state: CloudKingdomState, islandId: string): CkIslandDef | null {
  return CK_ISLANDS.find(i => i.id === islandId) ?? null;
}

export function ckGetIslandState(state: CloudKingdomState, islandId: string): CkIslandState | null {
  return state.islands.find(i => i.defId === islandId) ?? null;
}

export function ckUnlockIsland(state: CloudKingdomState, islandId: string): CloudKingdomState | null {
  const def = CK_ISLANDS.find(i => i.id === islandId);
  if (!def) return null;
  const existingState = state.islands.find(i => i.defId === islandId);
  if (existingState?.unlocked) return null;
  if (state.level < def.unlockLevel) return null;
  if (state.coins < def.unlockCost) return null;

  const newIslands = state.islands.map(i =>
    i.defId === islandId ? { ...i, unlocked: true } : i,
  );

  return {
    ...state,
    islands: newIslands,
    coins: state.coins - def.unlockCost,
    resources: { ...state.resources, coins: (state.resources.coins ?? 0) - def.unlockCost },
    stats: { ...state.stats, totalIslandsUnlocked: state.stats.totalIslandsUnlocked + 1 },
  };
}

export function ckSettleIsland(state: CloudKingdomState, islandId: string): CloudKingdomState | null {
  const islandState = state.islands.find(i => i.defId === islandId);
  if (!islandState || !islandState.unlocked || islandState.settled) return null;
  const newIslands = state.islands.map(i =>
    i.defId === islandId ? { ...i, settled: true, buildings: [] } : i,
  );
  return { ...state, islands: newIslands };
}

export function ckGetIslandBuildings(state: CloudKingdomState, islandId: string): CkBuildingInstance[] {
  const islandState = state.islands.find(i => i.defId === islandId);
  return islandState?.buildings ?? [];
}

export function ckGetUnlockedIslands(state: CloudKingdomState): CkIslandState[] {
  return state.islands.filter(i => i.unlocked);
}

export function ckGetSettledIslands(state: CloudKingdomState): CkIslandState[] {
  return state.islands.filter(i => i.settled);
}

// ---------------------------------------------------------------------------
// Building Functions
// ---------------------------------------------------------------------------

export function ckGetBuildings(): CkBuildingDef[] {
  return CK_BUILDINGS;
}

export function ckGetBuildingInfo(buildingId: string): CkBuildingDef | null {
  return CK_BUILDINGS.find(b => b.id === buildingId) ?? null;
}

export function ckBuildStructure(state: CloudKingdomState, islandId: string, buildingId: string): CloudKingdomState | null {
  const buildingDef = CK_BUILDINGS.find(b => b.id === buildingId);
  const islandDef = CK_ISLANDS.find(i => i.id === islandId);
  const islandState = state.islands.find(i => i.defId === islandId);

  if (!buildingDef || !islandDef || !islandState) return null;
  if (!islandState.unlocked || !islandState.settled) return null;
  if (islandState.buildings.length >= islandDef.maxBuildings) return null;

  const cost = ckGetBuildingCost(buildingDef, 1);
  const allResources = { ...state.resources, coins: state.coins };
  if (!ckCanAfford(allResources, cost)) return null;

  const newBuildings = [...islandState.buildings, { defId: buildingId, islandId, level: 1 }];
  const newIslands = state.islands.map(i =>
    i.defId === islandId ? { ...i, buildings: newBuildings } : i,
  );

  const newResources = ckSpendResources(state.resources, cost);
  return {
    ...state,
    islands: newIslands,
    resources: newResources,
    coins: Math.max(0, state.coins - (cost.coins ?? 0)),
    stats: { ...state.stats, totalBuildingsBuilt: state.stats.totalBuildingsBuilt + 1 },
  };
}

export function ckUpgradeBuilding(state: CloudKingdomState, islandId: string, buildingIndex: number): CloudKingdomState | null {
  const islandState = state.islands.find(i => i.defId === islandId);
  if (!islandState || !islandState.settled) return null;
  if (buildingIndex < 0 || buildingIndex >= islandState.buildings.length) return null;

  const buildingInst = islandState.buildings[buildingIndex];
  const buildingDef = CK_BUILDINGS.find(b => b.id === buildingInst.defId);
  if (!buildingDef) return null;
  if (buildingInst.level >= buildingDef.maxLevel) return null;

  const cost = ckGetBuildingCost(buildingDef, buildingInst.level + 1);
  const allResources = { ...state.resources, coins: state.coins };
  if (!ckCanAfford(allResources, cost)) return null;

  const upgradedBuilding = { ...buildingInst, level: buildingInst.level + 1 };
  const newBuildings = [...islandState.buildings];
  newBuildings[buildingIndex] = upgradedBuilding;

  const newIslands = state.islands.map(i =>
    i.defId === islandId ? { ...i, buildings: newBuildings } : i,
  );

  const newResources = ckSpendResources(state.resources, cost);
  return {
    ...state,
    islands: newIslands,
    resources: newResources,
    coins: Math.max(0, state.coins - (cost.coins ?? 0)),
  };
}

export function ckDemolishBuilding(state: CloudKingdomState, islandId: string, buildingIndex: number): CloudKingdomState | null {
  const islandState = state.islands.find(i => i.defId === islandId);
  if (!islandState || !islandState.settled) return null;
  if (buildingIndex < 0 || buildingIndex >= islandState.buildings.length) return null;

  const refundRate = 0.4;
  const removed = islandState.buildings[buildingIndex];
  const def = CK_BUILDINGS.find(b => b.id === removed.defId);
  let refundCoins = 0;
  if (def) {
    const totalCost: Record<string, number> = {};
    for (let l = 1; l <= removed.level; l++) {
      const lvlCost = ckGetBuildingCost(def, l);
      for (const [key, val] of Object.entries(lvlCost)) {
        totalCost[key] = (totalCost[key] ?? 0) + val;
      }
    }
    for (const [key, val] of Object.entries(totalCost)) {
      const refund = Math.floor(val * refundRate);
      if (key === "coins") refundCoins += refund;
      else state.resources[key] = (state.resources[key] ?? 0) + refund;
    }
  }

  const newBuildings = islandState.buildings.filter((_, idx) => idx !== buildingIndex);
  const newIslands = state.islands.map(i =>
    i.defId === islandId ? { ...i, buildings: newBuildings } : i,
  );

  return { ...state, islands: newIslands, coins: state.coins + refundCoins, resources: { ...state.resources } };
}

export function ckGetTotalBuildings(state: CloudKingdomState): number {
  return state.islands.reduce((sum, isl) => sum + isl.buildings.length, 0);
}

// ---------------------------------------------------------------------------
// Spell Functions
// ---------------------------------------------------------------------------

export function ckGetSpells(): CkSpellDef[] {
  return CK_SPELLS;
}

export function ckGetSpellInfo(spellId: string): CkSpellDef | null {
  return CK_SPELLS.find(s => s.id === spellId) ?? null;
}

export function ckGetLearnedSpells(state: CloudKingdomState): CkSpellState[] {
  return state.spells.filter(s => s.learned);
}

export function ckGetSpellsBySchool(state: CloudKingdomState, school: CkWeatherSchool): CkSpellState[] {
  return state.spells.filter(s => {
    const def = CK_SPELLS.find(sp => sp.id === s.defId);
    return def?.school === school;
  });
}

export function ckLearnSpell(state: CloudKingdomState, spellId: string): CloudKingdomState | null {
  const spellDef = CK_SPELLS.find(s => s.id === spellId);
  if (!spellDef) return null;
  if (state.level < spellDef.unlockLevel) return null;

  const spellState = state.spells.find(s => s.defId === spellId);
  if (spellState?.learned) return null;

  const manaCost = spellDef.manaCost * 3;
  if (state.mana < manaCost) return null;

  const newSpells = state.spells.map(s =>
    s.defId === spellId ? { ...s, learned: true } : s,
  );

  return { ...state, spells: newSpells, mana: state.mana - manaCost };
}

export function ckCastSpell(state: CloudKingdomState, spellId: string): CloudKingdomState | null {
  const spellDef = CK_SPELLS.find(s => s.id === spellId);
  const spellState = state.spells.find(s => s.defId === spellId);
  if (!spellDef || !spellState?.learned) return null;
  if (state.mana < spellDef.manaCost) return null;
  if (spellState.cooldownRemaining > 0) return null;

  const newSpells = state.spells.map(s =>
    s.defId === spellId
      ? { ...s, castCount: s.castCount + 1, cooldownRemaining: spellDef.cooldown }
      : s,
  );

  return {
    ...state,
    spells: newSpells,
    mana: state.mana - spellDef.manaCost,
    stats: { ...state.stats, totalSpellsCast: state.stats.totalSpellsCast + 1 },
  };
}

export function ckReduceCooldowns(state: CloudKingdomState): CloudKingdomState {
  const newSpells = state.spells.map(s => ({
    ...s,
    cooldownRemaining: Math.max(0, s.cooldownRemaining - 1),
  }));
  return { ...state, spells: newSpells };
}

export function ckGetWeatherSchools(): CkWeatherSchoolDef[] {
  return CK_WEATHER_SCHOOLS;
}

// ---------------------------------------------------------------------------
// Creature Functions
// ---------------------------------------------------------------------------

export function ckGetCreatures(): CkCreatureDef[] {
  return CK_CREATURES;
}

export function ckGetCreatureInfo(creatureId: string): CkCreatureDef | null {
  return CK_CREATURES.find(c => c.id === creatureId) ?? null;
}

export function ckGetTameable(state: CloudKingdomState): CkCreatureDef[] {
  const tamedIds = new Set(state.creatures.map(c => c.defId));
  return CK_CREATURES.filter(c => !tamedIds.has(c.id) && c.tamingDifficulty <= state.level);
}

export function ckGetTamedCreatures(state: CloudKingdomState): CkCreatureInstance[] {
  return state.creatures.filter(c => c.tamed);
}

export function ckTameCreature(state: CloudKingdomState, creatureId: string): CloudKingdomState | null {
  const creatureDef = CK_CREATURES.find(c => c.id === creatureId);
  if (!creatureDef) return null;

  const alreadyTamed = state.creatures.find(c => c.defId === creatureId && c.tamed);
  if (alreadyTamed) return null;

  const rng = ckSeededRandom(`tame-${creatureId}-${Date.now()}`);
  const successChance = Math.max(0.1, 1.0 - creatureDef.tamingDifficulty * 0.08);

  if (rng() > successChance) {
    return { ...state, coins: Math.max(0, state.coins - 10) };
  }

  const tamingCost = creatureDef.tamingDifficulty * 20;
  if (state.coins < tamingCost) return null;

  const newCreature: CkCreatureInstance = {
    defId: creatureId,
    tamed: true,
    nickname: creatureDef.name,
    level: 1,
    hp: creatureDef.hp,
  };

  return {
    ...state,
    creatures: [...state.creatures, newCreature],
    coins: state.coins - tamingCost,
    stats: { ...state.stats, totalCreaturesTamed: state.stats.totalCreaturesTamed + 1 },
  };
}

export function ckReleaseCreature(state: CloudKingdomState, creatureId: string): CloudKingdomState {
  return {
    ...state,
    creatures: state.creatures.filter(c => !(c.defId === creatureId && c.tamed)),
  };
}

export function ckGetCreaturePower(state: CloudKingdomState, creatureId: string): number {
  const creatureDef = CK_CREATURES.find(c => c.id === creatureId);
  const creatureInst = state.creatures.find(c => c.defId === creatureId);
  if (!creatureDef || !creatureInst) return 0;
  return Math.floor((creatureDef.attack + creatureDef.defense) * (1 + creatureInst.level * 0.15));
}

export function ckGetCreatureCountByRarity(state: CloudKingdomState, rarity: CkRarity): number {
  return state.creatures.filter(c => {
    const def = CK_CREATURES.find(cd => cd.id === c.defId);
    return def?.rarity === rarity && c.tamed;
  }).length;
}

// ---------------------------------------------------------------------------
// Resource Functions
// ---------------------------------------------------------------------------

export function ckGetResources(): CkResourceDef[] {
  return CK_RESOURCES;
}

export function ckGetResourceInfo(resourceId: string): CkResourceDef | null {
  return CK_RESOURCES.find(r => r.id === resourceId) ?? null;
}

export function ckGetResourceCount(state: CloudKingdomState, resourceId: string): number {
  return state.resources[resourceId] ?? 0;
}

export function ckGetAllResources(state: CloudKingdomState): Record<string, number> {
  return { ...state.resources };
}

export function ckGatherResource(state: CloudKingdomState, resourceId: string, amount: number): CloudKingdomState | null {
  const def = CK_RESOURCES.find(r => r.id === resourceId);
  if (!def || amount <= 0) return null;

  const newResources = { ...state.resources };
  newResources[resourceId] = (newResources[resourceId] ?? 0) + amount;

  return {
    ...state,
    resources: newResources,
    stats: { ...state.stats, totalResourcesGathered: state.stats.totalResourcesGathered + amount },
  };
}

export function ckTradeResource(
  state: CloudKingdomState,
  giveId: string,
  giveAmount: number,
  receiveId: string,
): CloudKingdomState | null {
  if (giveId === receiveId) return null;
  if ((state.resources[giveId] ?? 0) < giveAmount) return null;

  const giveDef = CK_RESOURCES.find(r => r.id === giveId);
  const receiveDef = CK_RESOURCES.find(r => r.id === receiveId);
  if (!giveDef || !receiveDef) return null;

  const tradeRatio = receiveDef.baseValue / giveDef.baseValue;
  const received = Math.max(1, Math.floor(giveAmount * tradeRatio * 0.8));

  const newResources = { ...state.resources };
  newResources[giveId] = (newResources[giveId] ?? 0) - giveAmount;
  newResources[receiveId] = (newResources[receiveId] ?? 0) + received;

  return { ...state, resources: newResources };
}

export function ckGetResourceProduction(state: CloudKingdomState): Record<string, number> {
  return ckGetIslandResourceProduction(state);
}

export function ckSimulateHour(state: CloudKingdomState): CloudKingdomState {
  const production = ckGetIslandResourceProduction(state);
  const newResources = { ...state.resources };
  for (const [key, val] of Object.entries(production)) {
    newResources[key] = (newResources[key] ?? 0) + val;
  }
  // Passive mana regen
  const newMana = Math.min(state.maxMana, state.mana + 5 + Math.floor(state.level / 3));
  // Reduce cooldowns
  const newState = ckReduceCooldowns({ ...state, resources: newResources, mana: newMana });
  return newState;
}

// ---------------------------------------------------------------------------
// Temple Functions
// ---------------------------------------------------------------------------

export function ckGetTemples(): CkTempleDef[] {
  return CK_TEMPLES;
}

export function ckGetTempleInfo(templeId: string): CkTempleDef | null {
  return CK_TEMPLES.find(t => t.id === templeId) ?? null;
}

export function ckEnterTemple(state: CloudKingdomState, templeId: string): { canEnter: boolean; reason: string } {
  const def = CK_TEMPLES.find(t => t.id === templeId);
  if (!def) return { canEnter: false, reason: "Temple not found." };
  if (state.level < def.requiredLevel) return { canEnter: false, reason: `Requires level ${def.requiredLevel}.` };
  if (state.templeTrialsCompleted.includes(templeId)) return { canEnter: false, reason: "Trial already completed." };
  return { canEnter: true, reason: "Enter the temple." };
}

export function ckCompleteTrial(state: CloudKingdomState, templeId: string): CloudKingdomState | null {
  const def = CK_TEMPLES.find(t => t.id === templeId);
  if (!def) return null;
  if (state.level < def.requiredLevel) return null;
  if (state.templeTrialsCompleted.includes(templeId)) return null;

  const rng = ckSeededRandom(`trial-${templeId}-${state.level}`);
  const playerPower = state.level * 20 + ckGetTotalBuildings(state) * 10 + state.stats.totalCreaturesTamed * 15;
  const success = playerPower >= def.guardianHP || rng() < 0.3 + (playerPower / def.guardianHP) * 0.5;

  if (!success) return { ...state, coins: Math.max(0, state.coins - 50) };

  const newResources = { ...state.resources };
  for (const [key, val] of Object.entries(def.trialReward)) {
    newResources[key] = (newResources[key] ?? 0) + val;
  }

  return {
    ...state,
    resources: newResources,
    templeTrialsCompleted: [...state.templeTrialsCompleted, templeId],
    stats: { ...state.stats, totalTempleTrials: state.stats.totalTempleTrials + 1 },
  };
}

export function ckGetCompletedTempleCount(state: CloudKingdomState): number {
  return state.templeTrialsCompleted.length;
}

// ---------------------------------------------------------------------------
// Airship Functions
// ---------------------------------------------------------------------------

export function ckGetAirships(): CkAirshipDef[] {
  return CK_AIRSHIPS;
}

export function ckGetAirshipInfo(airshipId: string): CkAirshipDef | null {
  return CK_AIRSHIPS.find(a => a.id === airshipId) ?? null;
}

export function ckGetOwnedAirships(state: CloudKingdomState): CkAirshipInstance[] {
  return state.airships.filter(a => a.owned);
}

export function ckBuyAirship(state: CloudKingdomState, airshipId: string): CloudKingdomState | null {
  const def = CK_AIRSHIPS.find(a => a.id === airshipId);
  if (!def) return null;
  if (state.level < def.unlockLevel) return null;
  if (state.coins < def.cost) return null;

  const existing = state.airships.find(a => a.defId === airshipId);
  if (existing?.owned) return null;

  const newAirships = state.airships.map(a =>
    a.defId === airshipId ? { ...a, owned: true } : a,
  );

  return { ...state, airships: newAirships, coins: state.coins - def.cost };
}

export function ckSendAirship(state: CloudKingdomState, airshipId: string, missionType: string, durationHours: number): CloudKingdomState | null {
  const def = CK_AIRSHIPS.find(a => a.id === airshipId);
  const inst = state.airships.find(a => a.defId === airshipId);
  if (!def || !inst?.owned || inst.deployed) return null;

  const newAirships = state.airships.map(a =>
    a.defId === airshipId
      ? { ...a, deployed: true, missionType, missionEndTime: Date.now() + durationHours * 3600000 }
      : a,
  );

  return {
    ...state,
    airships: newAirships,
    stats: { ...state.stats, totalAirshipsSent: state.stats.totalAirshipsSent + 1 },
  };
}

export function ckRecallAirship(state: CloudKingdomState, airshipId: string): CloudKingdomState | null {
  const inst = state.airships.find(a => a.defId === airshipId);
  if (!inst?.owned || !inst.deployed) return null;

  const missionComplete = Date.now() >= inst.missionEndTime;
  const newAirships = state.airships.map(a =>
    a.defId === airshipId ? { ...a, deployed: false, missionType: "idle", missionEndTime: 0 } : a,
  );

  if (!missionComplete) return { ...state, airships: newAirships };

  // Calculate mission rewards
  const rng = ckSeededRandom(`mission-${airshipId}-${inst.missionEndTime}`);
  const bonusCoins = Math.floor(50 * (1 + inst.level * 0.3) * (0.8 + rng() * 0.4));
  const bonusResources: Record<string, number> = {};
  const resCount = Math.floor(rng() * 3) + 1;
  const availableResources = CK_RESOURCES.filter(() => rng() < 0.5);
  for (let i = 0; i < Math.min(resCount, availableResources.length); i++) {
    const r = availableResources[i];
    bonusResources[r.id] = Math.floor(5 + rng() * 20);
  }

  const newResources = { ...state.resources, coins: (state.resources.coins ?? 0) + bonusCoins };
  for (const [key, val] of Object.entries(bonusResources)) {
    newResources[key] = (newResources[key] ?? 0) + val;
  }

  return { ...state, airships: newAirships, resources: newResources, coins: state.coins + bonusCoins };
}

export function ckGetDeployedAirships(state: CloudKingdomState): CkAirshipInstance[] {
  return state.airships.filter(a => a.owned && a.deployed);
}

export function ckGetAirshipMissionProgress(state: CloudKingdomState, airshipId: string): number {
  const inst = state.airships.find(a => a.defId === airshipId);
  if (!inst?.deployed) return 0;
  const total = 3600000; // assume 1 hour default
  const elapsed = Date.now() - (inst.missionEndTime - total);
  return ckClamp(0, 100, Math.floor((elapsed / total) * 100));
}

// ---------------------------------------------------------------------------
// Quest Functions
// ---------------------------------------------------------------------------

export function ckGetQuests(): CkQuestDef[] {
  return CK_QUESTS;
}

export function ckGetQuestInfo(questId: string): CkQuestDef | null {
  return CK_QUESTS.find(q => q.id === questId) ?? null;
}

export function ckGetAvailableQuests(state: CloudKingdomState): CkQuestDef[] {
  const acceptedIds = new Set(state.quests.filter(q => q.accepted || q.completed).map(q => q.defId));
  return CK_QUESTS.filter(q => !acceptedIds.has(q.id) && state.level >= q.requiredLevel);
}

export function ckGetActiveQuests(state: CloudKingdomState): CkQuestState[] {
  return state.quests.filter(q => q.accepted && !q.completed);
}

export function ckGetCompletedQuests(state: CloudKingdomState): CkQuestState[] {
  return state.quests.filter(q => q.completed);
}

export function ckAcceptQuest(state: CloudKingdomState, questId: string): CloudKingdomState | null {
  const def = CK_QUESTS.find(q => q.id === questId);
  if (!def) return null;
  if (state.level < def.requiredLevel) return null;

  const existing = state.quests.find(q => q.defId === questId);
  if (existing?.accepted || existing?.completed) return null;

  const newQuests = state.quests.map(q =>
    q.defId === questId ? { ...q, accepted: true, progress: 0 } : q,
  );

  return { ...state, quests: newQuests };
}

export function ckUpdateQuestProgress(state: CloudKingdomState, objectiveType: string, amount: number): CloudKingdomState {
  const newQuests = state.quests.map(q => {
    if (!q.accepted || q.completed) return q;
    const def = CK_QUESTS.find(qd => qd.id === q.defId);
    if (!def || def.objectiveType !== objectiveType) return q;
    return { ...q, progress: Math.min(def.objectiveTarget, q.progress + amount) };
  });
  return { ...state, quests: newQuests };
}

export function ckCompleteQuest(state: CloudKingdomState, questId: string): CloudKingdomState | null {
  const questState = state.quests.find(q => q.defId === questId);
  const questDef = CK_QUESTS.find(q => q.id === questId);
  if (!questState || !questDef) return null;
  if (!questState.accepted || questState.completed) return null;
  if (questState.progress < questDef.objectiveTarget) return null;

  const newQuests = state.quests.map(q =>
    q.defId === questId ? { ...q, completed: true } : q,
  );

  const newResources = { ...state.resources };
  for (const [key, val] of Object.entries(questDef.resourceReward)) {
    newResources[key] = (newResources[key] ?? 0) + val;
  }

  const newState: CloudKingdomState = {
    ...state,
    quests: newQuests,
    resources: newResources,
    coins: state.coins + questDef.coinReward,
    stats: { ...state.stats, totalQuestsCompleted: state.stats.totalQuestsCompleted + 1 },
  };

  return ckAddXP(newState, questDef.xpReward);
}

export function ckAbandonQuest(state: CloudKingdomState, questId: string): CloudKingdomState {
  const newQuests = state.quests.map(q =>
    q.defId === questId ? { ...q, accepted: false, progress: 0 } : q,
  );
  return { ...state, quests: newQuests };
}

// ---------------------------------------------------------------------------
// Achievement Functions
// ---------------------------------------------------------------------------

export function ckGetAchievements(): CkAchievementDef[] {
  return CK_ACHIEVEMENTS;
}

export function ckGetAchievementInfo(achievementId: string): CkAchievementDef | null {
  return CK_ACHIEVEMENTS.find(a => a.id === achievementId) ?? null;
}

export function ckGetUnlockedAchievements(state: CloudKingdomState): string[] {
  return state.achievements;
}

export function ckCheckAchievements(state: CloudKingdomState): { newAchievements: string[]; newState: CloudKingdomState } {
  const newAchievements: string[] = [];
  const spellsLearned = state.spells.filter(s => s.learned).length;
  const ownedAirships = state.airships.filter(a => a.owned).length;
  const hasLegendary = state.creatures.some(c => {
    const def = CK_CREATURES.find(cd => cd.id === c.defId);
    return def?.rarity === "Legendary" && c.tamed;
  });

  const conditionMap: Record<string, boolean> = {
    "totalIslandsUnlocked >= 1": state.stats.totalIslandsUnlocked >= 1,
    "totalBuildingsBuilt >= 10": state.stats.totalBuildingsBuilt >= 10,
    "totalBuildingsBuilt >= 25": state.stats.totalBuildingsBuilt >= 25,
    "spells_learned >= 10": spellsLearned >= 10,
    "spells_learned >= 30": spellsLearned >= 30,
    "totalCreaturesTamed >= 5": state.stats.totalCreaturesTamed >= 5,
    "totalCreaturesTamed >= 15": state.stats.totalCreaturesTamed >= 15,
    "has_legendary": hasLegendary,
    "totalIslandsUnlocked >= 12": state.stats.totalIslandsUnlocked >= 12,
    "airships_owned >= 5": ownedAirships >= 5,
    "totalTempleTrials >= 3": state.stats.totalTempleTrials >= 3,
    "totalTempleTrials >= 6": state.stats.totalTempleTrials >= 6,
    "totalQuestsCompleted >= 10": state.stats.totalQuestsCompleted >= 10,
    "coins >= 10000": state.coins >= 10000,
    "level >= 45": state.level >= CK_MAX_LEVEL,
  };

  const updatedAchievements = [...state.achievements];
  for (const ach of CK_ACHIEVEMENTS) {
    if (updatedAchievements.includes(ach.id)) continue;
    if (conditionMap[ach.condition]) {
      updatedAchievements.push(ach.id);
      newAchievements.push(ach.id);
    }
  }

  const totalBonus = newAchievements.reduce((sum, id) => {
    const ach = CK_ACHIEVEMENTS.find(a => a.id === id);
    return sum + (ach?.reward ?? 0);
  }, 0);

  return {
    newAchievements,
    newState: {
      ...state,
      achievements: updatedAchievements,
      coins: state.coins + totalBonus,
    },
  };
}

// ---------------------------------------------------------------------------
// NPC Functions
// ---------------------------------------------------------------------------

export function ckGetNPCs(): CkNpcDef[] {
  return CK_NPCS;
}

export function ckGetNPCInfo(npcId: string): CkNpcDef | null {
  return CK_NPCS.find(n => n.id === npcId) ?? null;
}

export function ckInteractNPC(state: CloudKingdomState, npcId: string): { npc: CkNpcDef | null; bonusApplied: number } {
  const npc = CK_NPCS.find(n => n.id === npcId);
  if (!npc) return { npc: null, bonusApplied: 0 };

  let bonusApplied = 0;
  switch (npc.bonusType) {
    case "all_production":
      bonusApplied = Math.floor(state.level * npc.bonusValue * 0.1);
      break;
    case "spell_power":
      bonusApplied = Math.floor(state.spells.filter(s => s.learned).length * npc.bonusValue * 0.1);
      break;
    case "taming_success":
      bonusApplied = npc.bonusValue;
      break;
    case "trade_discount":
      bonusApplied = npc.bonusValue;
      break;
    case "xp_bonus":
      bonusApplied = Math.floor(state.level * npc.bonusValue * 0.05);
      break;
    default:
      bonusApplied = npc.bonusValue;
  }

  return { npc, bonusApplied };
}

// ---------------------------------------------------------------------------
// Daily System Functions
// ---------------------------------------------------------------------------

export function ckGetDailyTask(state: CloudKingdomState): CkDailyData {
  return state.daily;
}

export function ckGetDailyWeatherCalibration(state: CloudKingdomState): { target: number; progress: number; completed: boolean } {
  const rng = ckSeededRandom(`daily-cal-${state.daily.dateSeed}`);
  const target = 8 + Math.floor(rng() * 8);
  return {
    target,
    progress: state.daily.calibrationProgress,
    completed: state.daily.weatherCalibrated,
  };
}

export function ckCalibrateWeather(state: CloudKingdomState, increment: number): CloudKingdomState {
  const rng = ckSeededRandom(`daily-cal-${state.daily.dateSeed}`);
  const target = 8 + Math.floor(rng() * 8);
  const newProgress = Math.min(target, state.daily.calibrationProgress + increment);
  const calibrated = newProgress >= target;

  return {
    ...state,
    daily: {
      ...state.daily,
      calibrationProgress: newProgress,
      weatherCalibrated: calibrated,
    },
  };
}

export function ckClaimDailyReward(state: CloudKingdomState): CloudKingdomState | null {
  if (!state.daily.weatherCalibrated || state.daily.rewardClaimed) return null;

  const rng = ckSeededRandom(`daily-reward-${state.daily.dateSeed}`);
  const coinReward = 50 + state.level * 10 + Math.floor(rng() * 50);
  const manaReward = 10 + state.level * 2;
  const bonusResource = CK_RESOURCES[Math.floor(rng() * CK_RESOURCES.length)];
  const resourceAmount = 5 + Math.floor(rng() * 15) + state.level;

  const newResources = { ...state.resources };
  newResources[bonusResource.id] = (newResources[bonusResource.id] ?? 0) + resourceAmount;

  const streakBonus = state.streak >= 7 ? 2 : state.streak >= 3 ? 1.5 : 1;

  return {
    ...state,
    resources: newResources,
    coins: Math.floor(state.coins + coinReward * streakBonus),
    mana: Math.min(state.maxMana, state.mana + manaReward),
    daily: { ...state.daily, rewardClaimed: true },
  };
}

export function ckResetDaily(state: CloudKingdomState): CloudKingdomState {
  const todaySeed = ckGetTodaySeed();
  if (state.daily.dateSeed === todaySeed) return state;

  let newStreak = state.streak + 1;
  if (state.lastDaily !== null) {
    const parts = state.lastDaily.split("-").map(Number);
    const lastDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / 86400000);
    if (diffDays > 1) newStreak = 1;
  }

  return {
    ...state,
    daily: {
      dateSeed: todaySeed,
      weatherCalibrated: false,
      calibrationTarget: 10,
      calibrationProgress: 0,
      rewardClaimed: false,
    },
    streak: newStreak,
    lastDaily: todaySeed,
  };
}

// ---------------------------------------------------------------------------
// Weekly & Monthly Functions
// ---------------------------------------------------------------------------

export function ckGetWeeklyRace(state: CloudKingdomState): CkWeeklyData {
  return state.weekly;
}

export function ckStartSkyRace(state: CloudKingdomState): { result: CloudKingdomState; position: number; reward: number } {
  const rng = ckSeededRandom(`race-${state.weekly.weekSeed}-${state.level}`);
  const airshipsOwned = state.airships.filter(a => a.owned).length;
  const bestSpeed = Math.max(...state.airships.filter(a => a.owned).map(a => {
    const def = CK_AIRSHIPS.find(ad => ad.id === a.defId);
    return def?.speed ?? 0;
  }), 0);

  const raceScore = (bestSpeed * 10 + airshipsOwned * 5 + state.level * 2) * (0.8 + rng() * 0.4);
  const position = raceScore > 80 ? 1 : raceScore > 60 ? 2 : raceScore > 40 ? 3 : raceScore > 20 ? 4 : 5;
  const reward = [500, 300, 200, 100, 50][position - 1] ?? 50;

  return {
    result: {
      ...state,
      weekly: { ...state.weekly, raceCompleted: true, racePosition: position, raceReward: reward },
      coins: state.coins + reward,
    },
    position,
    reward,
  };
}

export function ckGetMonthlyChallenge(state: CloudKingdomState): CkMonthlyData {
  return state.monthly;
}

export function ckStartMonthlyChallenge(state: CloudKingdomState): CloudKingdomState | null {
  if (state.monthly.challengeCompleted) return null;

  const rng = ckSeededRandom(`monthly-${state.monthly.monthSeed}`);
  const targetProgress = 20 + Math.floor(rng() * 30);
  const rewardPool: Record<string, number> = {};
  const rewardCount = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < rewardCount; i++) {
    const res = CK_RESOURCES[Math.floor(rng() * CK_RESOURCES.length)];
    rewardPool[res.id] = (rewardPool[res.id] ?? 0) + 10 + Math.floor(rng() * 25);
  }
  rewardPool.coins = 300 + Math.floor(rng() * 500);

  return {
    ...state,
    monthly: {
      ...state.monthly,
      challengeProgress: 0,
      challengeReward: rewardPool,
    },
  };
}

export function ckProgressMonthlyChallenge(state: CloudKingdomState, amount: number): CloudKingdomState {
  const rng = ckSeededRandom(`monthly-${state.monthly.monthSeed}`);
  const targetProgress = 20 + Math.floor(rng() * 30);
  const newProgress = Math.min(targetProgress, state.monthly.challengeProgress + amount);
  const completed = newProgress >= targetProgress;

  if (!completed) {
    return { ...state, monthly: { ...state.monthly, challengeProgress: newProgress } };
  }

  const newResources = { ...state.resources };
  for (const [key, val] of Object.entries(state.monthly.challengeReward)) {
    newResources[key] = (newResources[key] ?? 0) + val;
  }

  return {
    ...state,
    resources: newResources,
    monthly: { ...state.monthly, challengeProgress: newProgress, challengeCompleted: true },
  };
}

// ---------------------------------------------------------------------------
// Weather Forecast Functions
// ---------------------------------------------------------------------------

export function ckGetWeatherForecast(state: CloudKingdomState, days: number): Array<{ day: string; weather: string; bonus: string; intensity: number }> {
  const rng = ckSeededRandom(`forecast-${ckGetTodaySeed()}-${state.level}`);
  const weathers = ["Clear Skies", "Light Breeze", "Scattered Clouds", "Gentle Rain", "Thunderstorm", "Heavy Fog", "Aurora Display", "Meteor Shower", "Heat Wave", "Blizzard", "Monsoon", "Tornado Warning"];
  const bonuses = ["wind_essence", "storm_crystal", "cloud_silk", "sun_shard", "moon_dust", "star_fragment", "rain_pearl", "snow_flake", "lightning_bolt", "aurora_gem"];

  const forecast: Array<{ day: string; weather: string; bonus: string; intensity: number }> = [];
  for (let i = 0; i < days; i++) {
    forecast.push({
      day: `Day ${i + 1}`,
      weather: weathers[Math.floor(rng() * weathers.length)],
      bonus: bonuses[Math.floor(rng() * bonuses.length)],
      intensity: 1 + Math.floor(rng() * 5),
    });
  }
  return forecast;
}

// ---------------------------------------------------------------------------
// Kingdom Stats & Power Functions
// ---------------------------------------------------------------------------

export function ckGetKingdomStats(state: CloudKingdomState): CkStats {
  return { ...state.stats };
}

export function ckGetKingdomPower(state: CloudKingdomState): number {
  const buildingPower = ckGetTotalBuildings(state) * 15;
  const creaturePower = state.creatures.reduce((sum, c) => {
    const def = CK_CREATURES.find(cd => cd.id === c.defId);
    return sum + (def ? (def.attack + def.defense) * c.level : 0);
  }, 0);
  const spellPower = state.spells.filter(s => s.learned).reduce((sum, s) => {
    const def = CK_SPELLS.find(sp => sp.id === s.defId);
    return sum + (def ? def.power * (1 + s.castCount * 0.02) : 0);
  }, 0);
  const airshipPower = state.airships.filter(a => a.owned).reduce((sum, a) => {
    const def = CK_AIRSHIPS.find(ad => ad.id === a.defId);
    return sum + (def ? def.combatPower * a.level : 0);
  }, 0);
  const templePower = state.templeTrialsCompleted.length * 100;

  return Math.floor((buildingPower + creaturePower + spellPower + airshipPower + templePower) * (1 + state.level * 0.1));
}

export function ckCollectAll(state: CloudKingdomState): CloudKingdomState {
  const production = ckGetIslandResourceProduction(state);
  const newResources = { ...state.resources };
  let totalCollected = 0;
  for (const [key, val] of Object.entries(production)) {
    const amount = val * 8; // collect 8 hours worth
    newResources[key] = (newResources[key] ?? 0) + amount;
    totalCollected += amount;
  }

  return {
    ...state,
    resources: newResources,
    stats: { ...state.stats, totalResourcesGathered: state.stats.totalResourcesGathered + totalCollected },
  };
}

export function ckGetMana(state: CloudKingdomState): number {
  return state.mana;
}

export function ckGetMaxMana(state: CloudKingdomState): number {
  return state.maxMana;
}

export function ckRegenMana(state: CloudKingdomState): CloudKingdomState {
  const regenAmount = 5 + Math.floor(state.level / 3);
  return {
    ...state,
    mana: Math.min(state.maxMana, state.mana + regenAmount),
  };
}

export function ckSpendMana(state: CloudKingdomState, amount: number): CloudKingdomState | null {
  if (state.mana < amount) return null;
  return { ...state, mana: state.mana - amount };
}

// ---------------------------------------------------------------------------
// Advanced Utility Functions
// ---------------------------------------------------------------------------

export function ckGetIslandDefense(state: CloudKingdomState, islandId: string): number {
  const islandState = state.islands.find(i => i.defId === islandId);
  if (!islandState || !islandState.settled) return 0;

  let defense = 10; // base defense
  for (const building of islandState.buildings) {
    const def = CK_BUILDINGS.find(b => b.id === building.defId);
    if (!def) continue;
    switch (def.category) {
      case "military":
        defense += 15 * building.level;
        break;
      case "special":
        defense += 10 * building.level;
        break;
      default:
        defense += 2 * building.level;
    }
  }

  // Creature defense bonus
  defense += state.creatures.filter(c => c.tamed).reduce((sum, c) => {
    const cDef = CK_CREATURES.find(cd => cd.id === c.defId);
    return sum + (cDef?.defense ?? 0) * c.level;
  }, 0);

  return defense;
}

export function ckSimulateIslandAttack(state: CloudKingdomState, islandId: string, attackPower: number): { survived: boolean; damage: number; defense: number } {
  const defense = ckGetIslandDefense(state, islandId);
  const survived = defense >= attackPower;
  const damage = survived ? Math.floor(attackPower * 0.3) : Math.floor(defense * 0.5);
  return { survived, damage, defense };
}

export function ckRenameKingdom(state: CloudKingdomState, name: string): CloudKingdomState {
  return { ...state, kingdomName: name };
}

export function ckGetNextUnlockLevel(state: CloudKingdomState): { level: number; island: CkIslandDef } | null {
  const nextIsland = CK_ISLANDS
    .filter(i => i.unlockLevel > state.level)
    .sort((a, b) => a.unlockLevel - b.unlockLevel)[0];
  if (!nextIsland) return null;
  return { level: nextIsland.unlockLevel, island: nextIsland };
}

export function ckGetOverview(state: CloudKingdomState): {
  kingdomName: string;
  level: number;
  title: string;
  coins: number;
  mana: number;
  maxMana: number;
  unlockedIslands: number;
  totalIslands: number;
  settledIslands: number;
  buildings: number;
  creatures: number;
  spells: number;
  airships: number;
  quests: number;
  achievements: number;
  power: number;
  streak: number;
} {
  return {
    kingdomName: state.kingdomName,
    level: state.level,
    title: ckCalculateTitle(state.level),
    coins: state.coins,
    mana: state.mana,
    maxMana: state.maxMana,
    unlockedIslands: state.islands.filter(i => i.unlocked).length,
    totalIslands: CK_ISLANDS.length,
    settledIslands: state.islands.filter(i => i.settled).length,
    buildings: ckGetTotalBuildings(state),
    creatures: state.creatures.filter(c => c.tamed).length,
    spells: state.spells.filter(s => s.learned).length,
    airships: state.airships.filter(a => a.owned).length,
    quests: state.quests.filter(q => q.completed).length,
    achievements: state.achievements.length,
    power: ckGetKingdomPower(state),
    streak: state.streak,
  };
}

export function ckGetResourceValue(state: CloudKingdomState): number {
  let total = 0;
  for (const [key, val] of Object.entries(state.resources)) {
    const def = CK_RESOURCES.find(r => r.id === key);
    total += (def?.baseValue ?? 0) * val;
  }
  return total;
}

export function ckGetBuildingUpgradeCost(buildingId: string, currentLevel: number): Record<string, number> | null {
  const def = CK_BUILDINGS.find(b => b.id === buildingId);
  if (!def || currentLevel >= def.maxLevel) return null;
  return ckGetBuildingCost(def, currentLevel + 1);
}

export function ckGetCreatureTamingCost(creatureId: string): number | null {
  const def = CK_CREATURES.find(c => c.id === creatureId);
  if (!def) return null;
  return def.tamingDifficulty * 20;
}

export function ckGetTamingChance(state: CloudKingdomState, creatureId: string): number {
  const def = CK_CREATURES.find(c => c.id === creatureId);
  if (!def) return 0;
  const baseChance = Math.max(0.1, 1.0 - def.tamingDifficulty * 0.08);
  const npcBonus = ckInteractNPC(state, "npc_creature_keeper").bonusApplied * 0.01;
  const templeBonus = state.templeTrialsCompleted.includes("temple_zephyr") ? 0.1 : 0;
  return Math.min(0.95, baseChance + npcBonus + templeBonus);
}

export function ckGetQuestRewardPreview(questId: string): { xp: number; coins: number; resources: Record<string, number> } | null {
  const def = CK_QUESTS.find(q => q.id === questId);
  if (!def) return null;
  return { xp: def.xpReward, coins: def.coinReward, resources: { ...def.resourceReward } };
}

export function ckSortCreaturesBy(state: CloudKingdomState, sortBy: "name" | "rarity" | "power" | "level"): CkCreatureDef[] {
  const tamed = CK_CREATURES.filter(c => state.creatures.some(ci => ci.defId === c.id && ci.tamed));
  switch (sortBy) {
    case "name":
      return [...tamed].sort((a, b) => a.name.localeCompare(b.name));
    case "rarity": {
      const rarityOrder: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4 };
      return [...tamed].sort((a, b) => (rarityOrder[a.rarity] ?? 0) - (rarityOrder[b.rarity] ?? 0));
    }
    case "power":
      return [...tamed].sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense));
    case "level":
      return [...tamed].sort((a, b) => {
        const instA = state.creatures.find(c => c.defId === a.id);
        const instB = state.creatures.find(c => c.defId === b.id);
        return (instB?.level ?? 0) - (instA?.level ?? 0);
      });
    default:
      return tamed;
  }
}

export function ckGetIslandWeatherBonus(state: CloudKingdomState, islandId: string): string {
  const def = CK_ISLANDS.find(i => i.id === islandId);
  if (!def) return "No bonus";
  const settled = state.islands.find(i => i.defId === islandId)?.settled;
  if (!settled) return "Settle this island to gain weather bonuses";
  const resDef = CK_RESOURCES.find(r => r.id === def.primaryResource);
  return `+25% ${resDef?.name ?? def.primaryResource} production from ${def.weatherPattern}`;
}

export function ckGetTotalManaCost(state: CloudKingdomState): number {
  return state.spells
    .filter(s => s.learned)
    .reduce((sum, s) => {
      const def = CK_SPELLS.find(sp => sp.id === s.defId);
      return sum + (def?.manaCost ?? 0);
    }, 0);
}
