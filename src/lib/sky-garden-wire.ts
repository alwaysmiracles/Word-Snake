// ============================================================================
// Sky Garden Wire — Celestial Paradise Floating Among the Clouds
// ============================================================================
// SSR-safe: no localStorage, no window/document, no setInterval/addEventListener.
// All exported functions use `sg` prefix, all constants use `SG_` prefix.
// Uses React hooks internally (useState, useCallback, useRef).
// ============================================================================

import { useState, useCallback, useRef, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SgRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type SgTerraceBiome = "Golden" | "Starlit" | "Dawn" | "Moonlit" | "Nebula" | "Crystal" | "Twilight" | "Prism";
export type SgAbilitySchool = "Bloom" | "Radiance" | "Gravity" | "Harmony" | "Twilight" | "Genesis" | "Astral" | "Nebula";
export type SgCreatureElement = "Starlight" | "Cosmic" | "Astral" | "Nebula" | "Solar" | "Lunar" | "Dawn" | "Crystal" | "Stellar" | "Void";

export interface SgTerraceDef {
  id: string;
  name: string;
  biome: SgTerraceBiome;
  altitude: number;
  primaryResource: string;
  secondaryResource: string;
  celestialPattern: string;
  unlockLevel: number;
  unlockCost: number;
  maxStructures: number;
  description: string;
  color: string;
}

export interface SgStructureDef {
  id: string;
  name: string;
  category: string;
  baseCost: Record<string, number>;
  maxLevel: number;
  productionPerHour: Record<string, number>;
  description: string;
  requiredTerraceBiome?: SgTerraceBiome;
  upgradeMultiplier: number;
}

export interface SgAbilitySchoolDef {
  id: SgAbilitySchool;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface SgAbilityDef {
  id: string;
  name: string;
  school: SgAbilitySchool;
  cosmicCost: number;
  power: number;
  cooldown: number;
  description: string;
  rarity: SgRarity;
  unlockLevel: number;
  effectType: string;
}

export interface SgCreatureDef {
  id: string;
  name: string;
  element: SgCreatureElement;
  rarity: SgRarity;
  abilities: string[];
  breedingDifficulty: number;
  hp: number;
  attack: number;
  defense: number;
  description: string;
}

export interface SgResourceDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseValue: number;
}

export interface SgSeedDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: SgRarity;
  growTimeHours: number;
  stardustYield: number;
  cosmicEnergyYield: number;
  requiredLevel: number;
  color: string;
}

export interface SgQuestDef {
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

export interface SgNpcDef {
  id: string;
  name: string;
  title: string;
  role: string;
  dialogue: string;
  bonusType: string;
  bonusValue: number;
}

export interface SgAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
  icon: string;
}

export interface SgTitleThreshold {
  minLevel: number;
  title: string;
}

// State interfaces

export interface SgTerraceState {
  defId: string;
  unlocked: boolean;
  cultivated: boolean;
  structures: SgStructureInstance[];
  plantedSeeds: SgPlantedSeed[];
}

export interface SgStructureInstance {
  defId: string;
  terraceId: string;
  level: number;
}

export interface SgPlantedSeed {
  seedId: string;
  terraceId: string;
  plantTime: number;
  growthProgress: number;
  fullyGrown: boolean;
}

export interface SgCreatureInstance {
  defId: string;
  bred: boolean;
  nickname: string;
  level: number;
  hp: number;
}

export interface SgAbilityState {
  defId: string;
  learned: boolean;
  castCount: number;
  cooldownRemaining: number;
}

export interface SgQuestState {
  defId: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
}

export interface SgDailyData {
  dateSeed: string;
  stardustHarvested: boolean;
  harvestTarget: number;
  harvestProgress: number;
  rewardClaimed: boolean;
}

export interface SgStats {
  totalTerracesUnlocked: number;
  totalStructuresBuilt: number;
  totalAbilitiesCast: number;
  totalCreaturesBred: number;
  totalResourcesGathered: number;
  totalQuestsCompleted: number;
  totalFlowersCultivated: number;
  totalStardustHarvested: number;
  totalCoinsEarned: number;
  totalXPEarned: number;
}

export interface SgWeeklyData {
  weekSeed: string;
  cometRaceCompleted: boolean;
  cometRacePosition: number;
  cometRaceReward: number;
}

export interface SgMonthlyData {
  monthSeed: string;
  nebulaChallengeCompleted: boolean;
  nebulaChallengeProgress: number;
  nebulaChallengeReward: Record<string, number>;
}

export interface SkyGardenState {
  level: number;
  xp: number;
  coins: number;
  cosmicEnergy: number;
  maxCosmicEnergy: number;
  terraces: SgTerraceState[];
  structures: SgStructureInstance[];
  creatures: SgCreatureInstance[];
  abilities: SgAbilityState[];
  resources: Record<string, number>;
  quests: SgQuestState[];
  achievements: string[];
  streak: number;
  lastDaily: string | null;
  daily: SgDailyData;
  weekly: SgWeeklyData;
  monthly: SgMonthlyData;
  stats: SgStats;
  gardenName: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SG_MAX_LEVEL = 45;

export const SG_TITLE_THRESHOLDS: SgTitleThreshold[] = [
  { minLevel: 1, title: "Seedling Tender" },
  { minLevel: 6, title: "Blossom Warden" },
  { minLevel: 12, title: "Star Gardener" },
  { minLevel: 18, title: "Celestial Cultivator" },
  { minLevel: 25, title: "Cosmic Horticulturist" },
  { minLevel: 32, title: "Nebula Bloom Master" },
  { minLevel: 38, title: "Astral Sovereign" },
  { minLevel: 44, title: "Eternal Sky Gardener" },
];

export const SG_RESOURCES: SgResourceDef[] = [
  { id: "stardust", name: "Stardust", description: "Shimmering dust harvested from falling stars.", icon: "✨", baseValue: 3 },
  { id: "moonlight_silver", name: "Moonlight Silver", description: "Liquid silver condensed from moonbeams.", icon: "🌙", baseValue: 2 },
  { id: "celestial_gold", name: "Celestial Gold", description: "Gold mined from asteroids in the celestial belt.", icon: "🌟", baseValue: 4 },
  { id: "dawn_rose_petal", name: "Dawn Rose Petal", description: "Petals from roses that bloom only at dawn.", icon: "🌹", baseValue: 2 },
  { id: "nebula_mist", name: "Nebula Mist", description: "Ethereal mist drifting from distant nebulae.", icon: "🌌", baseValue: 3 },
  { id: "starlight_crystal", name: "Starlight Crystal", description: "Crystals that store concentrated starlight.", icon: "💎", baseValue: 5 },
  { id: "cosmic_nectar", name: "Cosmic Nectar", description: "Sweet nectar from cosmic flowers.", icon: "🍯", baseValue: 2 },
  { id: "aurora_blossom", name: "Aurora Blossom", description: "Flowers that glow with aurora light.", icon: "🌸", baseValue: 4 },
  { id: "void_pearl", name: "Void Pearl", description: "Pearls formed in the vacuum of space.", icon: "🫧", baseValue: 6 },
  { id: "prism_dew", name: "Prism Dew", description: "Morning dew that refracts into rainbow colors.", icon: "💧", baseValue: 2 },
  { id: "solar_ember", name: "Solar Ember", description: "Glowing embers from the solar corona.", icon: "🔥", baseValue: 4 },
  { id: "astral_silk", name: "Astral Silk", description: "Silk woven from astral energy threads.", icon: "🧵", baseValue: 3 },
  { id: "comet_ice", name: "Comet Ice", description: "Ice harvested from passing comets.", icon: "🧊", baseValue: 3 },
  { id: "galaxy_leaf", name: "Galaxy Leaf", description: "Leaves that contain miniature galaxy swirls.", icon: "🍃", baseValue: 2 },
  { id: "eclipse_shard", name: "Eclipse Shard", description: "Fragments of solidified eclipse energy.", icon: "🌑", baseValue: 5 },
  { id: "zenith_powder", name: "Zenith Powder", description: "Fine powder from the zenith of the celestial dome.", icon: "🌠", baseValue: 4 },
  { id: "nova_pollen", name: "Nova Pollen", description: "Pollen released when stars go nova.", icon: "🌼", baseValue: 5 },
  { id: "ether_bloom", name: "Ether Bloom", description: "Flowers that exist partially in the ether plane.", icon: "🌺", baseValue: 6 },
  { id: "quasar_resin", name: "Quasar Resin", description: "Sticky resin from quasar-touched trees.", icon: "🫗", baseValue: 7 },
  { id: "halo_moss", name: "Halo Moss", description: "Moss growing in celestial halos around planets.", icon: "🌱", baseValue: 2 },
  { id: "shooting_star_fiber", name: "Shooting Star Fiber", description: "Fibers pulled from shooting star trails.", icon: "☄️", baseValue: 4 },
  { id: "constellation_vine", name: "Constellation Vine", description: "Vines that grow between connected stars.", icon: "🍇", baseValue: 3 },
  { id: "celestial_honeydew", name: "Celestial Honeydew", description: "Sweet dew from celestial hives.", icon: "🥭", baseValue: 2 },
  { id: "plasma_petal", name: "Plasma Petal", description: "Petals charged with stellar plasma.", icon: "🪷", baseValue: 5 },
  { id: "horizon_thread", name: "Horizon Thread", description: "Threads spun where the sky meets the cosmos.", icon: "🧶", baseValue: 3 },
  { id: "starfall_nectar", name: "Starfall Nectar", description: "Nectar from flowers that bloom during meteor showers.", icon: "🍯", baseValue: 4 },
  { id: "cosmic_seed_pod", name: "Cosmic Seed Pod", description: "Pods containing seeds of cosmic origin.", icon: "🫘", baseValue: 2 },
  { id: "twilight_amber", name: "Twilight Amber", description: "Amber that captures the essence of twilight.", icon: "🟠", baseValue: 4 },
  { id: "zen_blossom_dust", name: "Zen Blossom Dust", description: "Dust from flowers in the garden of Zen.", icon: "🏵️", baseValue: 5 },
  { id: "infinity_weave", name: "Infinity Weave", description: "Fabric woven from infinite cosmic threads.", icon: "🪢", baseValue: 8 },
];

export const SG_TERRACES: SgTerraceDef[] = [
  {
    id: "golden_meadow", name: "Golden Meadow", biome: "Golden", altitude: 1000,
    primaryResource: "celestial_gold", secondaryResource: "dawn_rose_petal",
    celestialPattern: "Golden Sunrise", unlockLevel: 1, unlockCost: 0,
    maxStructures: 6, description: "The first terrace of every Sky Gardener. Bathed in eternal golden light.", color: "#FFD700",
  },
  {
    id: "starlit_grove", name: "Starlit Grove", biome: "Starlit", altitude: 2500,
    primaryResource: "stardust", secondaryResource: "starlight_crystal",
    celestialPattern: "Perpetual Starlight", unlockLevel: 3, unlockCost: 200,
    maxStructures: 8, description: "A grove where trees of crystallized starlight grow in eternal night.", color: "#87CEEB",
  },
  {
    id: "dawn_blossom_field", name: "Dawn Blossom Field", biome: "Dawn", altitude: 1800,
    primaryResource: "dawn_rose_petal", secondaryResource: "cosmic_nectar",
    celestialPattern: "Eternal Dawn", unlockLevel: 6, unlockCost: 500,
    maxStructures: 8, description: "A vast field of roses that bloom perpetually in the light of dawn.", color: "#FFB6C1",
  },
  {
    id: "moonlit_sanctuary", name: "Moonlit Sanctuary", biome: "Moonlit", altitude: 2200,
    primaryResource: "moonlight_silver", secondaryResource: "prism_dew",
    celestialPattern: "Moonlit Serenity", unlockLevel: 8, unlockCost: 800,
    maxStructures: 8, description: "A peaceful sanctuary where moonbeams solidify into silver pools.", color: "#C0C0C0",
  },
  {
    id: "nebula_canopy", name: "Nebula Canopy", biome: "Nebula", altitude: 4000,
    primaryResource: "nebula_mist", secondaryResource: "eclipse_shard",
    celestialPattern: "Nebula Drift", unlockLevel: 12, unlockCost: 1500,
    maxStructures: 10, description: "A terrace shrouded in drifting nebula mist, rich in cosmic energy.", color: "#9370DB",
  },
  {
    id: "crystal_greenhouse", name: "Crystal Greenhouse", biome: "Crystal", altitude: 3500,
    primaryResource: "starlight_crystal", secondaryResource: "aurora_blossom",
    celestialPattern: "Prismatic Light", unlockLevel: 16, unlockCost: 3000,
    maxStructures: 10, description: "A greenhouse made of living crystal that amplifies plant growth.", color: "#E0E0FF",
  },
  {
    id: "twilight_veranda", name: "Twilight Veranda", biome: "Twilight", altitude: 5000,
    primaryResource: "twilight_amber", secondaryResource: "solar_ember",
    celestialPattern: "Eternal Twilight", unlockLevel: 22, unlockCost: 5500,
    maxStructures: 12, description: "A terrace forever suspended between day and night.", color: "#DDA0DD",
  },
  {
    id: "prism_pavilion", name: "Prism Pavilion", biome: "Prism", altitude: 7500,
    primaryResource: "void_pearl", secondaryResource: "infinity_weave",
    celestialPattern: "Infinite Prism", unlockLevel: 30, unlockCost: 12000,
    maxStructures: 14, description: "The highest terrace, refracting all celestial light into infinite colors.", color: "#FF69B4",
  },
];

export const SG_SEEDS: SgSeedDef[] = [
  // Common (10)
  { id: "daisy_of_dawn", name: "Daisy of Dawn", description: "A simple daisy that opens only at sunrise.", icon: "🌼", rarity: "Common", growTimeHours: 1, stardustYield: 5, cosmicEnergyYield: 2, requiredLevel: 1, color: "#FFD700" },
  { id: "moon_seedling", name: "Moon Seedling", description: "A small sprout that glows softly in moonlight.", icon: "🌱", rarity: "Common", growTimeHours: 1, stardustYield: 4, cosmicEnergyYield: 3, requiredLevel: 1, color: "#C0C0C0" },
  { id: "cloud_grass", name: "Cloud Grass", description: "Soft grass that grows on cloud banks.", icon: "🌿", rarity: "Common", growTimeHours: 1, stardustYield: 3, cosmicEnergyYield: 2, requiredLevel: 1, color: "#87CEEB" },
  { id: "star_moss", name: "Star Moss", description: "Moss that sparkles like tiny stars.", icon: "🪸", rarity: "Common", growTimeHours: 2, stardustYield: 6, cosmicEnergyYield: 2, requiredLevel: 2, color: "#FFFACD" },
  { id: "nebula_fern", name: "Nebula Fern", description: "A fern with fronds in nebula colors.", icon: "☘️", rarity: "Common", growTimeHours: 2, stardustYield: 5, cosmicEnergyYield: 3, requiredLevel: 2, color: "#9370DB" },
  { id: "aurora_vine", name: "Aurora Vine", description: "A climbing vine that shimmers with aurora light.", icon: "🍃", rarity: "Common", growTimeHours: 2, stardustYield: 6, cosmicEnergyYield: 3, requiredLevel: 3, color: "#00FA9A" },
  { id: "honey_dewdrop", name: "Honey Dewdrop", description: "A flower that produces sweet cosmic honeydew.", icon: "🍯", rarity: "Common", growTimeHours: 1, stardustYield: 3, cosmicEnergyYield: 4, requiredLevel: 1, color: "#FFD700" },
  { id: "prism_shrub", name: "Prism Shrub", description: "A shrub whose leaves refract light into rainbows.", icon: "🌳", rarity: "Common", growTimeHours: 2, stardustYield: 5, cosmicEnergyYield: 4, requiredLevel: 3, color: "#FF69B4" },
  { id: "void_clover", name: "Void Clover", description: "A four-leaf clover from the edge of the void.", icon: "🍀", rarity: "Common", growTimeHours: 1, stardustYield: 4, cosmicEnergyYield: 2, requiredLevel: 1, color: "#2F4F4F" },
  { id: "solar_tulip", name: "Solar Tulip", description: "A tulip that absorbs and stores solar energy.", icon: "🌷", rarity: "Common", growTimeHours: 2, stardustYield: 6, cosmicEnergyYield: 3, requiredLevel: 2, color: "#FF6347" },
  // Uncommon (8)
  { id: "starlight_lily", name: "Starlight Lily", description: "A lily that blooms only under starlight.", icon: "🪷", rarity: "Uncommon", growTimeHours: 4, stardustYield: 12, cosmicEnergyYield: 6, requiredLevel: 5, color: "#E6E6FA" },
  { id: "comet_rose", name: "Comet Rose", description: "A rose with petals that trail like comet tails.", icon: "🌹", rarity: "Uncommon", growTimeHours: 4, stardustYield: 10, cosmicEnergyYield: 8, requiredLevel: 6, color: "#FF4500" },
  { id: "eclipse_orchid", name: "Eclipse Orchid", description: "An orchid that opens only during eclipses.", icon: "🪻", rarity: "Uncommon", growTimeHours: 5, stardustYield: 15, cosmicEnergyYield: 7, requiredLevel: 7, color: "#2F2F4F" },
  { id: "nova_sunflower", name: "Nova Sunflower", description: "A massive sunflower that radiates nova energy.", icon: "🌻", rarity: "Uncommon", growTimeHours: 4, stardustYield: 11, cosmicEnergyYield: 9, requiredLevel: 8, color: "#FFA500" },
  { id: "quasar_bonsai", name: "Quasar Bonsai", description: "A miniature tree containing a quasar core.", icon: "🎋", rarity: "Uncommon", growTimeHours: 5, stardustYield: 14, cosmicEnergyYield: 8, requiredLevel: 9, color: "#00CED1" },
  { id: "halo_gardenia", name: "Halo Gardenia", description: "A gardenia surrounded by a celestial halo.", icon: "💐", rarity: "Uncommon", growTimeHours: 4, stardustYield: 10, cosmicEnergyYield: 10, requiredLevel: 6, color: "#FFF0F5" },
  { id: "constellation_ivy", name: "Constellation Ivy", description: "Ivy that grows in patterns of constellations.", icon: "🌿", rarity: "Uncommon", growTimeHours: 5, stardustYield: 13, cosmicEnergyYield: 7, requiredLevel: 8, color: "#191970" },
  { id: "ether_pansy", name: "Ether Pansy", description: "A pansy that exists partially in the ether.", icon: "🪻", rarity: "Uncommon", growTimeHours: 4, stardustYield: 11, cosmicEnergyYield: 8, requiredLevel: 7, color: "#DA70D6" },
  // Rare (7)
  { id: "galaxy_lotus", name: "Galaxy Lotus", description: "A lotus containing a swirling galaxy in its center.", icon: "🪷", rarity: "Rare", growTimeHours: 8, stardustYield: 25, cosmicEnergyYield: 15, requiredLevel: 14, color: "#4169E1" },
  { id: "zenith_magnolia", name: "Zenith Magnolia", description: "A magnolia that blooms at the zenith of cosmic energy.", icon: "🌸", rarity: "Rare", growTimeHours: 8, stardustYield: 22, cosmicEnergyYield: 18, requiredLevel: 16, color: "#FFB6C1" },
  { id: "infinity_bamboo", name: "Infinity Bamboo", description: "Bamboo that grows endlessly in recursive loops.", icon: "🎋", rarity: "Rare", growTimeHours: 10, stardustYield: 28, cosmicEnergyYield: 14, requiredLevel: 18, color: "#228B22" },
  { id: "nova_jasmine", name: "Nova Jasmine", description: "Jasmine that releases nova-scented perfume.", icon: "🌺", rarity: "Rare", growTimeHours: 8, stardustYield: 24, cosmicEnergyYield: 16, requiredLevel: 15, color: "#FFFACD" },
  { id: "stellar_peony", name: "Stellar Peony", description: "A peony whose petals contain miniature stars.", icon: "🏵️", rarity: "Rare", growTimeHours: 10, stardustYield: 30, cosmicEnergyYield: 17, requiredLevel: 20, color: "#FF1493" },
  { id: "twilight_wisteria", name: "Twilight Wisteria", description: "Wisteria that drapes in twilight colors.", icon: "💜", rarity: "Rare", growTimeHours: 9, stardustYield: 26, cosmicEnergyYield: 18, requiredLevel: 17, color: "#8A2BE2" },
  { id: "cosmic_cactus", name: "Cosmic Cactus", description: "A cactus that stores cosmic radiation in its spines.", icon: "🌵", rarity: "Rare", growTimeHours: 8, stardustYield: 20, cosmicEnergyYield: 22, requiredLevel: 14, color: "#32CD32" },
  // Epic (3)
  { id: "eternal_celestial_tree", name: "Eternal Celestial Tree", description: "A tree whose roots reach across dimensions.", icon: "🌳", rarity: "Epic", growTimeHours: 16, stardustYield: 50, cosmicEnergyYield: 35, requiredLevel: 28, color: "#FFD700" },
  { id: "phenix_flower", name: "Phoenix Flower", description: "A flower that dies and is reborn in cosmic fire.", icon: "🔥", rarity: "Epic", growTimeHours: 20, stardustYield: 60, cosmicEnergyYield: 40, requiredLevel: 34, color: "#FF4500" },
  { id: "dimensional_rose", name: "Dimensional Rose", description: "A rose that exists in all dimensions simultaneously.", icon: "🌹", rarity: "Epic", growTimeHours: 18, stardustYield: 55, cosmicEnergyYield: 45, requiredLevel: 38, color: "#9400D3" },
  // Legendary (2)
  { id: "garden_of_creation", name: "Garden of Creation", description: "The mythical flower from which all cosmic gardens originate.", icon: "🌺", rarity: "Legendary", growTimeHours: 24, stardustYield: 100, cosmicEnergyYield: 80, requiredLevel: 42, color: "#FFD700" },
  { id: "cosmos_bloom", name: "Cosmos Bloom", description: "A flower that blooms once every cosmic cycle, containing the power of creation.", icon: "✨", rarity: "Legendary", growTimeHours: 24, stardustYield: 120, cosmicEnergyYield: 90, requiredLevel: 44, color: "#00BFFF" },
];

export const SG_STRUCTURES: SgStructureDef[] = [
  // Production Structures (10)
  { id: "stardust_collector", name: "Stardust Collector", category: "production", baseCost: { coins: 50, stardust: 10 }, maxLevel: 10, productionPerHour: { stardust: 3 }, description: "Captures falling stardust from passing stars.", upgradeMultiplier: 1.4 },
  { id: "gold_vein_mine", name: "Gold Vein Mine", category: "production", baseCost: { coins: 80, celestial_gold: 5 }, maxLevel: 10, productionPerHour: { celestial_gold: 2 }, description: "Mines celestial gold from asteroid veins.", upgradeMultiplier: 1.4 },
  { id: "moonlight_condenser", name: "Moonlight Condenser", category: "production", baseCost: { coins: 100, moonlight_silver: 8 }, maxLevel: 10, productionPerHour: { moonlight_silver: 2 }, description: "Condenses moonbeams into liquid moonlight silver.", upgradeMultiplier: 1.4 },
  { id: "nebula_distillery", name: "Nebula Distillery", category: "production", baseCost: { coins: 120, nebula_mist: 5 }, maxLevel: 10, productionPerHour: { nebula_mist: 2 }, description: "Distills nebula mist into concentrated cosmic essence.", upgradeMultiplier: 1.5 },
  { id: "crystal_forge", name: "Crystal Forge", category: "production", baseCost: { coins: 150, starlight_crystal: 3 }, maxLevel: 10, productionPerHour: { starlight_crystal: 1 }, description: "Forges raw starlight into stable crystals.", upgradeMultiplier: 1.5 },
  { id: "nectary", name: "Nectary", category: "production", baseCost: { coins: 60, cosmic_nectar: 8 }, maxLevel: 10, productionPerHour: { cosmic_nectar: 3 }, description: "Extracts nectar from blooming cosmic flowers.", upgradeMultiplier: 1.3 },
  { id: "aurora_loom", name: "Aurora Loom", category: "production", baseCost: { coins: 200, aurora_blossom: 3 }, maxLevel: 10, productionPerHour: { aurora_blossom: 1 }, description: "Weaves aurora blossoms into celestial fabric.", upgradeMultiplier: 1.6 },
  { id: "void_pearl_bed", name: "Void Pearl Bed", category: "production", baseCost: { coins: 250, void_pearl: 2 }, maxLevel: 10, productionPerHour: { void_pearl: 1 }, description: "Cultivates void pearls in the vacuum between terraces.", upgradeMultiplier: 1.6 },
  { id: "prism_refinery", name: "Prism Refinery", category: "production", baseCost: { coins: 180, prism_dew: 5 }, maxLevel: 10, productionPerHour: { prism_dew: 2 }, description: "Refines prism dew into concentrated rainbow essence.", upgradeMultiplier: 1.4 },
  { id: "ether_extractor", name: "Ether Extractor", category: "production", baseCost: { coins: 200, astral_silk: 4 }, maxLevel: 10, productionPerHour: { astral_silk: 2 }, description: "Extracts astral silk from the ether between dimensions.", upgradeMultiplier: 1.5 },
  // Cultivation Structures (7)
  { id: "flower_bed", name: "Cosmic Flower Bed", category: "cultivation", baseCost: { coins: 40, cosmic_nectar: 5 }, maxLevel: 10, productionPerHour: { coins: 3 }, description: "A bed for growing common cosmic flowers.", upgradeMultiplier: 1.3 },
  { id: "enchanted_greenhouse", name: "Enchanted Greenhouse", category: "cultivation", baseCost: { coins: 100, stardust: 8, starlight_crystal: 3 }, maxLevel: 10, productionPerHour: { stardust: 1 }, description: "Accelerates flower growth by 10% per level.", upgradeMultiplier: 1.4 },
  { id: "cosmic_compost_bin", name: "Cosmic Compost Bin", category: "cultivation", baseCost: { coins: 60, galaxy_leaf: 5 }, maxLevel: 10, productionPerHour: {}, description: "Boosts flower stardust yield by 5% per level.", upgradeMultiplier: 1.3 },
  { id: "starlight_sprinkler", name: "Starlight Sprinkler", category: "cultivation", baseCost: { coins: 80, prism_dew: 8 }, maxLevel: 10, productionPerHour: {}, description: "Reduces flower grow time by 5% per level.", upgradeMultiplier: 1.3 },
  { id: "ether_fertilizer_vat", name: "Ether Fertilizer Vat", category: "cultivation", baseCost: { coins: 120, nebula_mist: 10 }, maxLevel: 10, productionPerHour: { cosmic_nectar: 1 }, description: "Increases all resource production by 3% per level.", upgradeMultiplier: 1.2 },
  { id: "bloom_amplifier", name: "Bloom Amplifier", category: "cultivation", baseCost: { coins: 200, aurora_blossom: 5, stardust: 10 }, maxLevel: 10, productionPerHour: { coins: 8 }, description: "Amplifies bloom effects, granting bonus cosmic energy per harvest.", upgradeMultiplier: 1.5 },
  { id: "seed_vault", name: "Cosmic Seed Vault", category: "cultivation", baseCost: { coins: 300, cosmic_seed_pod: 10, infinity_weave: 2 }, maxLevel: 10, productionPerHour: { cosmic_seed_pod: 1 }, description: "Stores seeds and passively generates rare cosmic seed pods.", upgradeMultiplier: 1.4 },
  // Star Bird Structures (5)
  { id: "star_bird_nest", name: "Star Bird Nest", category: "creature", baseCost: { coins: 150, astral_silk: 10, moonlight_silver: 8 }, maxLevel: 10, productionPerHour: {}, description: "A nest for breeding star birds. Each level holds 2 more creatures.", upgradeMultiplier: 1.4 },
  { id: "avian_incubator", name: "Avian Incubator", category: "creature", baseCost: { coins: 200, solar_ember: 10, dawn_rose_petal: 8 }, maxLevel: 10, productionPerHour: {}, description: "Incubates star bird eggs, reducing breeding time by 5% per level.", upgradeMultiplier: 1.3 },
  { id: "feather_forge", name: "Feather Forge", category: "creature", baseCost: { coins: 180, stardust: 15 }, maxLevel: 10, productionPerHour: { stardust: 2 }, description: "Processes molted feathers into usable stardust.", upgradeMultiplier: 1.4 },
  { id: "song_crystal", name: "Song Crystal", category: "creature", baseCost: { coins: 250, starlight_crystal: 8, aurora_blossom: 5 }, maxLevel: 10, productionPerHour: { cosmic_energy: 2 }, description: "Amplifies star bird songs into cosmic energy.", upgradeMultiplier: 1.5 },
  { id: "migration_beacon", name: "Migration Beacon", category: "creature", baseCost: { coins: 300, comet_ice: 10, void_pearl: 5 }, maxLevel: 10, productionPerHour: {}, description: "Attracts rare star birds during cosmic migration seasons.", upgradeMultiplier: 1.6 },
  // Utility Structures (3)
  { id: "celestial_workshop", name: "Celestial Workshop", category: "utility", baseCost: { coins: 100, celestial_gold: 10, astral_silk: 5 }, maxLevel: 10, productionPerHour: { coins: 5 }, description: "Workshop for crafting celestial items and tools.", upgradeMultiplier: 1.3 },
  { id: "cosmic_energy_well", name: "Cosmic Energy Well", category: "utility", baseCost: { coins: 200, nebula_mist: 15, void_pearl: 3 }, maxLevel: 10, productionPerHour: { cosmic_energy: 2 }, description: "Draws cosmic energy from deep within the cosmos.", upgradeMultiplier: 1.4 },
  { id: "trading_canopy", name: "Trading Canopy", category: "utility", baseCost: { coins: 250, celestial_gold: 15, moonlight_silver: 20 }, maxLevel: 10, productionPerHour: {}, description: "A celestial marketplace for trading resources with passing travelers.", upgradeMultiplier: 1.3 },
];

export const SG_ABILITY_SCHOOLS: SgAbilitySchoolDef[] = [
  { id: "Bloom", name: "Bloom", description: "Accelerate growth and nurture cosmic flowers.", color: "#90EE90", icon: "🌼" },
  { id: "Radiance", name: "Radiance", description: "Channel celestial light to empower all garden operations.", color: "#FFD700", icon: "☀️" },
  { id: "Gravity", name: "Gravity", description: "Manipulate cosmic gravity to shape terraces and resources.", color: "#C0C0C0", icon: "🌀" },
  { id: "Harmony", name: "Harmony", description: "Create balance between celestial forces for stable growth.", color: "#FFB6C1", icon: "🎵" },
  { id: "Twilight", name: "Twilight", description: "Wield the magic between day and night, dusk and dawn.", color: "#DDA0DD", icon: "🌅" },
  { id: "Genesis", name: "Genesis", description: "The power to create new life and cosmic structures.", color: "#FF6347", icon: "🌱" },
  { id: "Astral", name: "Astral", description: "Navigate and command the astral plane for cosmic travel.", color: "#87CEEB", icon: "✨" },
  { id: "Nebula", name: "Nebula", description: "Command the raw power of nebulae for devastating effects.", color: "#9370DB", icon: "🌌" },
];

export const SG_ABILITIES: SgAbilityDef[] = [
  // Bloom (4)
  { id: "petal_push", name: "Petal Push", school: "Bloom", cosmicCost: 5, power: 8, cooldown: 1, description: "A gentle push of flower petals that distracts pests.", rarity: "Common", unlockLevel: 1, effectType: "crowd_control" },
  { id: "rapid_bloom", name: "Rapid Bloom", school: "Bloom", cosmicCost: 12, power: 15, cooldown: 3, description: "Accelerates the growth of one flower significantly.", rarity: "Common", unlockLevel: 3, effectType: "growth_boost" },
  { id: "bloom_barrage", name: "Bloom Barrage", school: "Bloom", cosmicCost: 25, power: 30, cooldown: 5, description: "An explosion of cosmic petals damages and disorients.", rarity: "Uncommon", unlockLevel: 10, effectType: "damage_aoe" },
  { id: "garden_of_eden", name: "Garden of Eden", school: "Bloom", cosmicCost: 50, power: 60, cooldown: 8, description: "Transforms the battlefield into a cosmic garden.", rarity: "Rare", unlockLevel: 22, effectType: "terrain" },
  // Radiance (4)
  { id: "starlight_beam", name: "Starlight Beam", school: "Radiance", cosmicCost: 5, power: 10, cooldown: 1, description: "A focused beam of concentrated starlight.", rarity: "Common", unlockLevel: 1, effectType: "damage" },
  { id: "golden_aura", name: "Golden Aura", school: "Radiance", cosmicCost: 15, power: 12, cooldown: 3, description: "Surrounds allies in protective golden light.", rarity: "Common", unlockLevel: 4, effectType: "defense" },
  { id: "solar_radiance", name: "Solar Radiance", school: "Radiance", cosmicCost: 28, power: 32, cooldown: 5, description: "Blinding radiance that burns and weakens enemies.", rarity: "Uncommon", unlockLevel: 12, effectType: "debuff_aoe" },
  { id: "nova_radiance", name: "Nova Radiance", school: "Radiance", cosmicCost: 55, power: 65, cooldown: 9, description: "Channels the radiance of a dying star.", rarity: "Epic", unlockLevel: 28, effectType: "damage_aoe" },
  // Gravity (4)
  { id: "gravity_well", name: "Gravity Well", school: "Gravity", cosmicCost: 8, power: 10, cooldown: 2, description: "Creates a localized gravity well that pulls enemies.", rarity: "Common", unlockLevel: 2, effectType: "crowd_control" },
  { id: "anti_gravity", name: "Anti-Gravity", school: "Gravity", cosmicCost: 14, power: 8, cooldown: 3, description: "Negates gravity, allowing allies to float and dodge.", rarity: "Common", unlockLevel: 5, effectType: "movement" },
  { id: "gravity_crush", name: "Gravity Crush", school: "Gravity", cosmicCost: 30, power: 35, cooldown: 6, description: "Crushes enemies under intensified cosmic gravity.", rarity: "Uncommon", unlockLevel: 14, effectType: "damage" },
  { id: "cosmic_implosion", name: "Cosmic Implosion", school: "Gravity", cosmicCost: 60, power: 70, cooldown: 10, description: "Creates a miniature black hole that implodes.", rarity: "Epic", unlockLevel: 30, effectType: "damage_aoe" },
  // Harmony (3)
  { id: "soothing_melody", name: "Soothing Melody", school: "Harmony", cosmicCost: 5, power: 6, cooldown: 1, description: "A calming melody that heals allies and flowers.", rarity: "Common", unlockLevel: 1, effectType: "heal" },
  { id: "resonance_shield", name: "Resonance Shield", school: "Harmony", cosmicCost: 18, power: 20, cooldown: 4, description: "A shield of harmonic frequencies.", rarity: "Uncommon", unlockLevel: 8, effectType: "defense" },
  { id: "cosmic_symphony", name: "Cosmic Symphony", school: "Harmony", cosmicCost: 45, power: 55, cooldown: 8, description: "A symphony that buffs all allies and terraces.", rarity: "Rare", unlockLevel: 20, effectType: "buff_aoe" },
  // Twilight (3)
  { id: "dusk_veil", name: "Dusk Veil", school: "Twilight", cosmicCost: 6, power: 8, cooldown: 2, description: "A veil of twilight that obscures vision.", rarity: "Common", unlockLevel: 2, effectType: "stealth" },
  { id: "shadow_bloom", name: "Shadow Bloom", school: "Twilight", cosmicCost: 20, power: 24, cooldown: 4, description: "Flowers that bloom in shadow, draining enemy energy.", rarity: "Uncommon", unlockLevel: 11, effectType: "drain" },
  { id: "eclipse_eclipse", name: "Total Eclipse", school: "Twilight", cosmicCost: 48, power: 58, cooldown: 8, description: "Plunges the area into total celestial eclipse.", rarity: "Rare", unlockLevel: 24, effectType: "debuff_aoe" },
  // Genesis (2)
  { id: "seed_sprout", name: "Seed Sprout", school: "Genesis", cosmicCost: 10, power: 12, cooldown: 2, description: "Instantly sprouts a defensive wall of cosmic plants.", rarity: "Common", unlockLevel: 3, effectType: "defense" },
  { id: "genesis_bloom", name: "Genesis Bloom", school: "Genesis", cosmicCost: 52, power: 62, cooldown: 9, description: "Creates new cosmic life from raw starlight.", rarity: "Rare", unlockLevel: 26, effectType: "summon" },
  // Astral (2)
  { id: "astral_step", name: "Astral Step", school: "Astral", cosmicCost: 8, power: 5, cooldown: 2, description: "Step partially into the astral plane to evade attacks.", rarity: "Common", unlockLevel: 2, effectType: "defense" },
  { id: "astral_projection", name: "Astral Projection", school: "Astral", cosmicCost: 35, power: 40, cooldown: 7, description: "Project an astral copy that fights alongside you.", rarity: "Uncommon", unlockLevel: 16, effectType: "summon" },
];

export const SG_CREATURES: SgCreatureDef[] = [
  // Common (8)
  { id: "glow_finch", name: "Glow Finch", element: "Starlight", rarity: "Common", abilities: ["Sparkle", "Nest Sing"], breedingDifficulty: 1, hp: 20, attack: 3, defense: 2, description: "A tiny finch that glows softly with captured starlight." },
  { id: "dawn_sparrow", name: "Dawn Sparrow", element: "Dawn", rarity: "Common", abilities: ["Dawn Chirp", "Warm Feathers"], breedingDifficulty: 1, hp: 22, attack: 4, defense: 2, description: "A sparrow that arrives with every dawn." },
  { id: "cloud_hummingbird", name: "Cloud Hummingbird", element: "Stellar", rarity: "Common", abilities: ["Hover", "Nectar Feed"], breedingDifficulty: 1, hp: 15, attack: 3, defense: 3, description: "A hummingbird that sips nectar from cloud flowers." },
  { id: "moon_pipit", name: "Moon Pipit", element: "Lunar", rarity: "Common", abilities: ["Moonbeam Glide", "Soft Landing"], breedingDifficulty: 1, hp: 18, attack: 2, defense: 3, description: "A small bird that rides moonbeams between terraces." },
  { id: "stardust_wren", name: "Stardust Wren", element: "Cosmic", rarity: "Common", abilities: ["Dust Scatter", "Hide"], breedingDifficulty: 2, hp: 16, attack: 3, defense: 2, description: "A wren that camouflages itself in stardust clouds." },
  { id: "nebula_swallow", name: "Nebula Swallow", element: "Nebula", rarity: "Common", abilities: ["Nebula Trail", "Swift Dive"], breedingDifficulty: 2, hp: 20, attack: 4, defense: 2, description: "A swallow leaving trails of nebula mist." },
  { id: "prism_dove", name: "Prism Dove", element: "Crystal", rarity: "Common", abilities: ["Prism Coos", "Light Bounce"], breedingDifficulty: 2, hp: 18, attack: 3, defense: 3, description: "A dove whose feathers refract light into colors." },
  { id: "comet_swift", name: "Comet Swift", element: "Stellar", rarity: "Common", abilities: ["Comet Trail", "Speed Dive"], breedingDifficulty: 2, hp: 17, attack: 5, defense: 1, description: "The fastest of the common star birds, trailing comet tails." },
  // Uncommon (8)
  { id: "solar_phoenix_chick", name: "Solar Phoenix Chick", element: "Solar", rarity: "Uncommon", abilities: ["Warmth Aura", "Ember Peck"], breedingDifficulty: 3, hp: 40, attack: 10, defense: 7, description: "A young phoenix chick radiating gentle solar warmth." },
  { id: "lunar_owl", name: "Lunar Owl", element: "Lunar", rarity: "Uncommon", abilities: ["Moonlight Gaze", "Silent Wing"], breedingDifficulty: 3, hp: 45, attack: 9, defense: 8, description: "An owl that sees through the darkest lunar nights." },
  { id: "starlight_falcon", name: "Starlight Falcon", element: "Starlight", rarity: "Uncommon", abilities: ["Star Dive", "Light Speed"], breedingDifficulty: 4, hp: 38, attack: 14, defense: 6, description: "A falcon that dives at the speed of concentrated starlight." },
  { id: "nebula_heron", name: "Nebula Heron", element: "Nebula", rarity: "Uncommon", abilities: ["Mist Wading", "Cosmic Strike"], breedingDifficulty: 3, hp: 50, attack: 11, defense: 9, description: "A heron that wades through nebula mists fishing for cosmic prey." },
  { id: "dawn_eagle", name: "Dawn Eagle", element: "Dawn", rarity: "Uncommon", abilities: ["Dawn Screech", "Golden Talons"], breedingDifficulty: 4, hp: 48, attack: 13, defense: 7, description: "An eagle whose feathers turn gold at dawn." },
  { id: "crystal_peacock", name: "Crystal Peacock", element: "Crystal", rarity: "Uncommon", abilities: ["Prism Display", "Crystal Shield"], breedingDifficulty: 3, hp: 42, attack: 8, defense: 12, description: "A peacock with a tail of living crystal feathers." },
  { id: "void_raven", name: "Void Raven", element: "Void", rarity: "Uncommon", abilities: ["Void Shift", "Shadow Speak"], breedingDifficulty: 4, hp: 35, attack: 12, defense: 8, description: "A raven that phases between the void and reality." },
  { id: "astral_crane", name: "Astral Crane", element: "Astral", rarity: "Uncommon", abilities: ["Astral Dance", "Long Flight"], breedingDifficulty: 3, hp: 55, attack: 10, defense: 10, description: "A crane that dances across the astral plane." },
  // Rare (8)
  { id: "solar_phoenix", name: "Solar Phoenix", element: "Solar", rarity: "Rare", abilities: ["Phoenix Flame", "Rebirth"], breedingDifficulty: 6, hp: 90, attack: 25, defense: 16, description: "A magnificent phoenix reborn in solar fire." },
  { id: "lunar_swan", name: "Lunar Swan", element: "Lunar", rarity: "Rare", abilities: ["Moonbeam Song", "Ice Aura"], breedingDifficulty: 5, hp: 85, attack: 20, defense: 22, description: "A swan of pure moonlight that freezes all who approach." },
  { id: "starlight_griffin", name: "Starlight Griffin", element: "Starlight", rarity: "Rare", abilities: ["Star Dive", "Cosmic Shield"], breedingDifficulty: 6, hp: 95, attack: 28, defense: 18, description: "A griffin whose feathers contain captured starlight." },
  { id: "nebula_condor", name: "Nebula Condor", element: "Nebula", rarity: "Rare", abilities: ["Nebula Storm", "Dimensional Sight"], breedingDifficulty: 6, hp: 80, attack: 24, defense: 20, description: "A massive condor riding the winds of distant nebulae." },
  { id: "cosmic_roc", name: "Cosmic Roc", element: "Cosmic", rarity: "Rare", abilities: ["Cosmic Carry", "Planet Drop"], breedingDifficulty: 7, hp: 100, attack: 30, defense: 14, description: "A roc so large it carries small asteroids in its talons." },
  { id: "crystal_serpent_bird", name: "Crystal Serpent-Bird", element: "Crystal", rarity: "Rare", abilities: ["Crystal Beak", "Prism Wings"], breedingDifficulty: 5, hp: 70, attack: 22, defense: 25, description: "A serpentine bird with scales of living crystal." },
  { id: "dawn_pheasant", name: "Dawn Pheasant", element: "Dawn", rarity: "Rare", abilities: ["Dawn Crown", "Light Arrow"], breedingDifficulty: 6, hp: 75, attack: 26, defense: 15, description: "A pheasant with a crown of golden dawn light." },
  { id: "void_hawk", name: "Void Hawk", element: "Void", rarity: "Rare", abilities: ["Void Strike", "Dimension Rend"], breedingDifficulty: 6, hp: 82, attack: 28, defense: 16, description: "A hawk that strikes from tears in the void." },
  // Epic (7)
  { id: "astral_phoenix", name: "Astral Phoenix", element: "Astral", rarity: "Epic", abilities: ["Astral Rebirth", "Dimension Flame", "Eternal Flight"], breedingDifficulty: 8, hp: 160, attack: 42, defense: 32, description: "A phoenix reborn across all dimensions simultaneously." },
  { id: "nebula_dragon_bird", name: "Nebula Dragon-Bird", element: "Nebula", rarity: "Epic", abilities: ["Nebula Breath", "Cosmic Storm", "Gravity Wings"], breedingDifficulty: 9, hp: 180, attack: 48, defense: 35, description: "A dragon-bird hybrid born from the heart of a nebula." },
  { id: "solar_titan_bird", name: "Solar Titan Bird", element: "Solar", rarity: "Epic", abilities: ["Solar Flare", "Blinding Screech", "Eternal Fire"], breedingDifficulty: 8, hp: 170, attack: 52, defense: 28, description: "A massive bird made entirely of living solar plasma." },
  { id: "lunar_leviathan_bird", name: "Lunar Leviathan Bird", element: "Lunar", rarity: "Epic", abilities: ["Tidal Moon", "Eclipse Veil", "Tide Song"], breedingDifficulty: 9, hp: 200, attack: 40, defense: 42, description: "A colossal bird that controls lunar tides." },
  { id: "starlight_sovereign", name: "Starlight Sovereign", element: "Starlight", rarity: "Epic", abilities: ["Star Command", "Light Dominion", "Constellation Army"], breedingDifficulty: 9, hp: 175, attack: 45, defense: 38, description: "The ruler of all starlight birds, commanding star armies." },
  { id: "void_emperor_bird", name: "Void Emperor Bird", element: "Void", rarity: "Epic", abilities: ["Void Devour", "Reality Tear", "Entropy Aura"], breedingDifficulty: 9, hp: 190, attack: 50, defense: 35, description: "An emperor bird that dwells at the edge of the void." },
  { id: "cosmic_simurgh", name: "Cosmic Simurgh", element: "Cosmic", rarity: "Epic", abilities: ["Cosmic Healing", "Ancient Wisdom", "Star Nest"], breedingDifficulty: 8, hp: 165, attack: 38, defense: 40, description: "The ancient cosmic bird of wisdom and healing." },
  // Legendary (4)
  { id: "garden_of_eden_bird", name: "Garden of Eden Bird", element: "Dawn", rarity: "Legendary", abilities: ["Eden's Blessing", "Genesis Song", "Paradise Shield", "Eternal Garden"], breedingDifficulty: 10, hp: 300, attack: 60, defense: 50, description: "The mythical bird that tends the Garden of Creation itself." },
  { id: "celestial_roc_of_rocs", name: "Celestial Roc of Rocs", element: "Cosmic", rarity: "Legendary", abilities: ["Cosmic Lift", "Asteroid Throw", "Gravity Master", "Planet Forge"], breedingDifficulty: 10, hp: 350, attack: 55, defense: 55, description: "The largest star bird in existence, capable of carrying worlds." },
  { id: "phoenix_of_infinity", name: "Phoenix of Infinity", element: "Solar", rarity: "Legendary", abilities: ["Infinite Flame", "Timeless Rebirth", "Nova Core", "Stellar Evolution"], breedingDifficulty: 10, hp: 280, attack: 65, defense: 45, description: "A phoenix that has died and been reborn infinite times." },
  { id: "astral_god_bird", name: "Astral God Bird", element: "Astral", rarity: "Legendary", abilities: ["Dimensional Rule", "Astral Army", "Reality Warp", "Celestial Ascension"], breedingDifficulty: 10, hp: 320, attack: 58, defense: 58, description: "The supreme astral being, ruler of all star birds across dimensions." },
];

export const SG_QUESTS: SgQuestDef[] = [
  { id: "sq01", name: "First Bloom", description: "Build your first Stardust Collector on Golden Meadow.", objectiveType: "build", objectiveTarget: 1, xpReward: 30, coinReward: 50, resourceReward: { stardust: 20 }, requiredLevel: 1, category: "building" },
  { id: "sq02", name: "Celestial Education", description: "Learn your first 3 celestial abilities.", objectiveType: "learn_abilities", objectiveTarget: 3, xpReward: 50, coinReward: 80, resourceReward: { cosmic_nectar: 10 }, requiredLevel: 2, category: "magic" },
  { id: "sq03", name: "First Feather", description: "Breed your first star bird.", objectiveType: "breed_creature", objectiveTarget: 1, xpReward: 60, coinReward: 60, resourceReward: { astral_silk: 15 }, requiredLevel: 2, category: "creature" },
  { id: "sq04", name: "Expanding Horizons", description: "Unlock Starlit Grove terrace.", objectiveType: "unlock_terrace", objectiveTarget: 1, xpReward: 80, coinReward: 100, resourceReward: { stardust: 40 }, requiredLevel: 3, category: "exploration" },
  { id: "sq05", name: "Stardust Harvest", description: "Harvest 50 stardust total.", objectiveType: "harvest_resource", objectiveTarget: 50, xpReward: 100, coinReward: 150, resourceReward: { celestial_gold: 20 }, requiredLevel: 5, category: "resources" },
  { id: "sq06", name: "Ability Training", description: "Cast 10 abilities total.", objectiveType: "cast_abilities", objectiveTarget: 10, xpReward: 80, coinReward: 70, resourceReward: { moonlight_silver: 10 }, requiredLevel: 6, category: "magic" },
  { id: "sq07", name: "Bird Collector", description: "Breed 3 different star birds.", objectiveType: "breed_creature", objectiveTarget: 3, xpReward: 120, coinReward: 120, resourceReward: { astral_silk: 25 }, requiredLevel: 7, category: "creature" },
  { id: "sq08", name: "Flower Power", description: "Plant and harvest 5 cosmic flowers.", objectiveType: "cultivate_flower", objectiveTarget: 5, xpReward: 100, coinReward: 100, resourceReward: { dawn_rose_petal: 20 }, requiredLevel: 4, category: "cultivation" },
  { id: "sq09", name: "Terrace Cultivator", description: "Cultivate 3 different terraces.", objectiveType: "cultivate_terrace", objectiveTarget: 3, xpReward: 150, coinReward: 200, resourceReward: { stardust: 50 }, requiredLevel: 8, category: "exploration" },
  { id: "sq10", name: "Moonlit Mystery", description: "Unlock and cultivate Moonlit Sanctuary.", objectiveType: "cultivate_terrace", objectiveTarget: 1, xpReward: 120, coinReward: 180, resourceReward: { moonlight_silver: 20 }, requiredLevel: 8, category: "exploration" },
  { id: "sq11", name: "School Scholar", description: "Learn abilities from 4 different schools.", objectiveType: "learn_schools", objectiveTarget: 4, xpReward: 180, coinReward: 250, resourceReward: { starlight_crystal: 5 }, requiredLevel: 10, category: "magic" },
  { id: "sq12", name: "Structure Architect", description: "Build 10 structures across all terraces.", objectiveType: "build", objectiveTarget: 10, xpReward: 200, coinReward: 300, resourceReward: { void_pearl: 3 }, requiredLevel: 12, category: "building" },
  { id: "sq13", name: "Seed Specialist", description: "Plant 15 different types of seeds.", objectiveType: "cultivate_flower", objectiveTarget: 15, xpReward: 150, coinReward: 200, resourceReward: { cosmic_seed_pod: 10 }, requiredLevel: 10, category: "cultivation" },
  { id: "sq14", name: "Resource Baron", description: "Accumulate 200 of any single resource.", objectiveType: "accumulate_resource", objectiveTarget: 200, xpReward: 160, coinReward: 180, resourceReward: { coins: 500 }, requiredLevel: 10, category: "resources" },
  { id: "sq15", name: "Nebula Discovery", description: "Unlock Nebula Canopy terrace.", objectiveType: "unlock_terrace", objectiveTarget: 1, xpReward: 250, coinReward: 400, resourceReward: { nebula_mist: 10 }, requiredLevel: 12, category: "exploration" },
  { id: "sq16", name: "Crystal Cultivator", description: "Build 5 structures on Crystal Greenhouse.", objectiveType: "build_on_terrace", objectiveTarget: 5, xpReward: 200, coinReward: 300, resourceReward: { starlight_crystal: 30 }, requiredLevel: 16, category: "building" },
  { id: "sq17", name: "Legendary Breeder", description: "Breed a Rare or higher rarity star bird.", objectiveType: "breed_rare", objectiveTarget: 1, xpReward: 250, coinReward: 350, resourceReward: { void_pearl: 8 }, requiredLevel: 15, category: "creature" },
  { id: "sq18", name: "Twilight Ascension", description: "Cultivate Twilight Veranda and plant an Epic seed.", objectiveType: "special_plant", objectiveTarget: 1, xpReward: 300, coinReward: 500, resourceReward: { twilight_amber: 30 }, requiredLevel: 22, category: "cultivation" },
  { id: "sq19", name: "Daily Devotion", description: "Complete daily stardust harvest 7 days in a row.", objectiveType: "daily_streak", objectiveTarget: 7, xpReward: 350, coinReward: 600, resourceReward: { stardust: 100 }, requiredLevel: 8, category: "daily" },
  { id: "sq20", name: "Garden Master", description: "Reach the Astral Sovereign title (level 32).", objectiveType: "reach_title", objectiveTarget: 1, xpReward: 1000, coinReward: 2000, resourceReward: { infinity_weave: 5, void_pearl: 20 }, requiredLevel: 32, category: "progression" },
  { id: "sq21", name: "Prism Pavilion Expedition", description: "Unlock Prism Pavilion and build 5 structures.", objectiveType: "build_on_terrace", objectiveTarget: 5, xpReward: 400, coinReward: 700, resourceReward: { void_pearl: 15 }, requiredLevel: 30, category: "exploration" },
  { id: "sq22", name: "Ultimate Collection", description: "Breed 20 different star birds.", objectiveType: "breed_creature", objectiveTarget: 20, xpReward: 500, coinReward: 1000, resourceReward: { starlight_crystal: 15, infinity_weave: 3 }, requiredLevel: 30, category: "creature" },
];

export const SG_NPCS: SgNpcDef[] = [
  { id: "npc_garden_keeper", name: "Celestia", title: "Garden Keeper", role: "Management", dialogue: "Welcome to the Sky Garden, dear cultivator. Every flower here holds a piece of the cosmos.", bonusType: "all_production", bonusValue: 10 },
  { id: "npc_bloom_sage", name: "Floris", title: "Bloom Sage", role: "Cultivation", dialogue: "The secret to growing cosmic flowers is patience and starlight. Rush not the bloom.", bonusType: "growth_boost", bonusValue: 15 },
  { id: "npc_bird_whisperer", name: "Avisara", title: "Bird Whisperer", role: "Creatures", dialogue: "Star birds sing the songs of creation. Listen closely, and they will trust you.", bonusType: "breeding_bonus", bonusValue: 12 },
  { id: "npc_stardust_miner", name: "Geminus", title: "Stardust Miner", role: "Resources", dialogue: "Stardust is the currency of the cosmos. Mine it wisely, spend it well.", bonusType: "stardust_bonus", bonusValue: 15 },
  { id: "npc_cosmic_merchant", name: "Orbital", title: "Cosmic Merchant", role: "Trade", dialogue: "I trade in the rarest celestial goods. Everything has its price among the stars.", bonusType: "trade_discount", bonusValue: 10 },
  { id: "npc_zen_master", name: "Luminara", title: "Zen Master", role: "Energy", dialogue: "Cosmic energy flows through all things. Master your energy, master your garden.", bonusType: "energy_regen", bonusValue: 20 },
  { id: "npc_constellation_seer", name: "Orion", title: "Constellation Seer", role: "Guidance", dialogue: "The stars reveal all to those who look with patience. Let me guide your path.", bonusType: "xp_bonus", bonusValue: 10 },
  { id: "npc_nebula_artist", name: "Prismara", title: "Nebula Artist", role: "Building", dialogue: "Every structure in the sky garden is a work of celestial art. Build with vision.", bonusType: "build_discount", bonusValue: 8 },
];

export const SG_ACHIEVEMENTS: SgAchievementDef[] = [
  { id: "sg_ach_first_terrace", name: "First Foothold", description: "Cultivate your first terrace.", condition: "totalTerracesUnlocked >= 1", reward: 50, icon: "🪴" },
  { id: "sg_ach_builder_10", name: "Sky Architect", description: "Build 10 structures total.", condition: "totalStructuresBuilt >= 10", reward: 100, icon: "🏗️" },
  { id: "sg_ach_builder_25", name: "Celestial Builder", description: "Build 25 structures total.", condition: "totalStructuresBuilt >= 25", reward: 300, icon: "🏰" },
  { id: "sg_ach_ability_5", name: "Cosmic Apprentice", description: "Learn 5 different abilities.", condition: "abilities_learned >= 5", reward: 60, icon: "📖" },
  { id: "sg_ach_ability_15", name: "Celestial Mage", description: "Learn 15 different abilities.", condition: "abilities_learned >= 15", reward: 350, icon: "📚" },
  { id: "sg_ach_ability_22", name: "Cosmic Archmage", description: "Learn all 22 abilities.", condition: "abilities_learned >= 22", reward: 800, icon: "🌟" },
  { id: "sg_ach_breeder_5", name: "Bird Friend", description: "Breed 5 different star birds.", condition: "totalCreaturesBred >= 5", reward: 100, icon: "🐦" },
  { id: "sg_ach_breeder_15", name: "Flock Master", description: "Breed 15 different star birds.", condition: "totalCreaturesBred >= 15", reward: 500, icon: "🦅" },
  { id: "sg_ach_breeder_35", name: "Supreme Flock Lord", description: "Breed all 35 star birds.", condition: "totalCreaturesBred >= 35", reward: 1500, icon: "🦚" },
  { id: "sg_ach_breeder_legendary", name: "Legendary Breeder", description: "Breed a Legendary star bird.", condition: "has_legendary", reward: 800, icon: "👑" },
  { id: "sg_ach_all_terrace", name: "Sky Garden Master", description: "Unlock all 8 terraces.", condition: "totalTerracesUnlocked >= 8", reward: 1000, icon: "🌍" },
  { id: "sg_ach_quest_10", name: "Quest Champion", description: "Complete 10 quests.", condition: "totalQuestsCompleted >= 10", reward: 250, icon: "📜" },
  { id: "sg_ach_quest_22", name: "Quest Completionist", description: "Complete all 22 quests.", condition: "totalQuestsCompleted >= 22", reward: 2000, icon: "🏅" },
  { id: "sg_ach_flower_10", name: "Budding Horticulturist", description: "Cultivate 10 different flowers.", condition: "totalFlowersCultivated >= 10", reward: 150, icon: "🌷" },
  { id: "sg_ach_flower_30", name: "Cosmic Botanist", description: "Cultivate all 30 cosmic seeds.", condition: "totalFlowersCultivated >= 30", reward: 1000, icon: "🌺" },
  { id: "sg_ach_stardust_1000", name: "Stardust Baron", description: "Harvest 1,000 stardust total.", condition: "totalStardustHarvested >= 1000", reward: 300, icon: "✨" },
  { id: "sg_ach_coins_10k", name: "Sky Tycoon", description: "Accumulate 10,000 coins.", condition: "coins >= 10000", reward: 300, icon: "💰" },
  { id: "sg_ach_streak_7", name: "Dedicated Gardener", description: "Maintain a 7-day daily streak.", condition: "streak >= 7", reward: 200, icon: "🔥" },
];

// ---------------------------------------------------------------------------
// Seeded PRNG (SSR-safe, no Math.random)
// ---------------------------------------------------------------------------

function sgSeededRandom(seed: string): () => number {
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

function sgClamp(min: number, max: number, val: number): number {
  return Math.max(min, Math.min(max, val));
}

function sgGetTodaySeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function sgGetWeekSeed(): string {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNumber}`;
}

function sgGetMonthSeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

function sgGetXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.35, level - 1));
}

function sgCalculateLevel(xp: number): number {
  let lvl = 1;
  let xpNeeded = sgGetXpForLevel(lvl);
  while (xp >= xpNeeded && lvl < SG_MAX_LEVEL) {
    xp -= xpNeeded;
    lvl++;
    xpNeeded = sgGetXpForLevel(lvl);
  }
  return lvl;
}

function sgCalculateTitle(level: number): string {
  let title = SG_TITLE_THRESHOLDS[0].title;
  for (const t of SG_TITLE_THRESHOLDS) {
    if (level >= t.minLevel) {
      title = t.title;
    }
  }
  return title;
}

function sgGetStructureCost(structure: SgStructureDef, currentLevel: number): Record<string, number> {
  const multiplier = Math.pow(structure.upgradeMultiplier, currentLevel);
  const cost: Record<string, number> = {};
  for (const [key, val] of Object.entries(structure.baseCost)) {
    cost[key] = Math.floor(val * multiplier);
  }
  return cost;
}

function sgCanAfford(resources: Record<string, number>, cost: Record<string, number>): boolean {
  for (const [key, val] of Object.entries(cost)) {
    if ((resources[key] ?? 0) < val) return false;
  }
  return true;
}

function sgSpendResources(resources: Record<string, number>, cost: Record<string, number>): Record<string, number> {
  const newResources = { ...resources };
  for (const [key, val] of Object.entries(cost)) {
    newResources[key] = (newResources[key] ?? 0) - val;
  }
  return newResources;
}

function sgGetTerraceResourceProduction(state: SkyGardenState): Record<string, number> {
  const production: Record<string, number> = {};
  for (const terrace of state.terraces) {
    if (!terrace.cultivated) continue;
    for (const structInst of terrace.structures) {
      const def = SG_STRUCTURES.find(s => s.id === structInst.defId);
      if (!def) continue;
      const multiplier = Math.pow(1.2, structInst.level - 1);
      for (const [key, val] of Object.entries(def.productionPerHour)) {
        production[key] = (production[key] ?? 0) + Math.floor(val * multiplier);
      }
    }
  }
  // Greenhouse boost
  for (const terrace of state.terraces) {
    if (!terrace.cultivated) continue;
    for (const structInst of terrace.structures) {
      if (structInst.defId === "enchanted_greenhouse") {
        for (const key of Object.keys(production)) {
          production[key] = Math.floor(production[key]! * (1 + 0.05 * structInst.level));
        }
      }
    }
  }
  return production;
}

function sgGetFlowerGrowthMultiplier(state: SkyGardenState): number {
  let multiplier = 1.0;
  for (const terrace of state.terraces) {
    if (!terrace.cultivated) continue;
    for (const structInst of terrace.structures) {
      if (structInst.defId === "starlight_sprinkler") {
        multiplier -= 0.05 * structInst.level;
      }
    }
  }
  return Math.max(0.3, multiplier);
}

function sgGetStardustYieldMultiplier(state: SkyGardenState): number {
  let multiplier = 1.0;
  for (const terrace of state.terraces) {
    if (!terrace.cultivated) continue;
    for (const structInst of terrace.structures) {
      if (structInst.defId === "cosmic_compost_bin") {
        multiplier += 0.05 * structInst.level;
      }
      if (structInst.defId === "bloom_amplifier") {
        multiplier += 0.03 * structInst.level;
      }
    }
  }
  return multiplier;
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

function sgCreateInitialState(): SkyGardenState {
  const terraces: SgTerraceState[] = SG_TERRACES.map(t => ({
    defId: t.id,
    unlocked: t.id === "golden_meadow",
    cultivated: t.id === "golden_meadow",
    structures: [],
    plantedSeeds: [],
  }));

  const abilities: SgAbilityState[] = SG_ABILITIES.map(a => ({
    defId: a.id,
    learned: false,
    castCount: 0,
    cooldownRemaining: 0,
  }));

  const quests: SgQuestState[] = SG_QUESTS.map(q => ({
    defId: q.id,
    accepted: false,
    completed: false,
    progress: 0,
  }));

  const initialResources: Record<string, number> = {};
  for (const r of SG_RESOURCES) {
    initialResources[r.id] = 20;
  }

  return {
    level: 1,
    xp: 0,
    coins: 500,
    cosmicEnergy: 50,
    maxCosmicEnergy: 50,
    terraces,
    structures: [],
    creatures: [],
    abilities,
    resources: { ...initialResources, coins: 500 },
    quests,
    achievements: [],
    streak: 0,
    lastDaily: null,
    daily: {
      dateSeed: sgGetTodaySeed(),
      stardustHarvested: false,
      harvestTarget: 10,
      harvestProgress: 0,
      rewardClaimed: false,
    },
    weekly: {
      weekSeed: sgGetWeekSeed(),
      cometRaceCompleted: false,
      cometRacePosition: 0,
      cometRaceReward: 0,
    },
    monthly: {
      monthSeed: sgGetMonthSeed(),
      nebulaChallengeCompleted: false,
      nebulaChallengeProgress: 0,
      nebulaChallengeReward: {},
    },
    stats: {
      totalTerracesUnlocked: 1,
      totalStructuresBuilt: 0,
      totalAbilitiesCast: 0,
      totalCreaturesBred: 0,
      totalResourcesGathered: 0,
      totalQuestsCompleted: 0,
      totalFlowersCultivated: 0,
      totalStardustHarvested: 0,
      totalCoinsEarned: 500,
      totalXPEarned: 0,
    },
    gardenName: "New Sky Garden",
  };
}

// ---------------------------------------------------------------------------
// React Hook (internal state management with hooks)
// ---------------------------------------------------------------------------

export default function useSkyGarden() {
  const stateRef = useRef<SkyGardenState | null>(null);
  const _initialState = sgCreateInitialState();
  if (stateRef.current === null) {
    stateRef.current = _initialState;
  }

  const [state, setState] = useState<SkyGardenState>(_initialState);

  const updateState = useCallback((updater: (prev: SkyGardenState) => SkyGardenState) => {
    setState(prev => {
      const next = updater(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  // Memoized computed values
  const computedProduction = useMemo(() => {
    return sgGetTerraceResourceProduction(state);
  }, [state]);

  const computedTitle = useMemo(() => {
    return sgCalculateTitle(state.level);
  }, [state]);

  const computedProgress = useMemo(() => {
    const currentLevelXp = sgGetXpForLevel(state.level);
    const nextLevelXp = sgGetXpForLevel(state.level + 1);
    if (nextLevelXp <= currentLevelXp) return 100;
    return Math.floor((state.xp / nextLevelXp) * 100);
  }, [state]);

  const computedGardenPower = useMemo(() => {
    return sgGetGardenPower(state);
  }, [state]);

  const computedFlowerGrowthMultiplier = useMemo(() => {
    return sgGetFlowerGrowthMultiplier(state);
  }, [state]);

  const computedStardustYieldMultiplier = useMemo(() => {
    return sgGetStardustYieldMultiplier(state);
  }, [state]);

  const computedOverview = useMemo(() => {
    return sgGetOverview(state);
  }, [state]);

  // Action functions bound to state
  const addXP = useCallback((amount: number) => {
    updateState(prev => {
      const newState = { ...prev, xp: prev.xp + amount, stats: { ...prev.stats, totalXPEarned: prev.stats.totalXPEarned + amount } };
      const newLevel = sgCalculateLevel(newState.xp);
      if (newLevel > newState.level) {
        newState.level = newLevel;
        newState.maxCosmicEnergy = 50 + (newLevel - 1) * 10;
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

  const sgAPI = useMemo(() => ({
    state,
    addXP,
    addCoins,
    spendCoins,
    updateState,
    production: computedProduction,
    title: computedTitle,
    progress: computedProgress,
    gardenPower: computedGardenPower,
    flowerGrowthMultiplier: computedFlowerGrowthMultiplier,
    stardustYieldMultiplier: computedStardustYieldMultiplier,
    overview: computedOverview,
  }), [state, addXP, addCoins, spendCoins, updateState, computedProduction, computedTitle, computedProgress, computedGardenPower, computedFlowerGrowthMultiplier, computedStardustYieldMultiplier, computedOverview]);

  return sgAPI;
}

// ---------------------------------------------------------------------------
// State Access & Reset (exported sg functions)
// ---------------------------------------------------------------------------

export function sgGetState(): SkyGardenState {
  return sgCreateInitialState();
}

export function sgResetState(): SkyGardenState {
  return sgCreateInitialState();
}

// ---------------------------------------------------------------------------
// Level & XP Functions
// ---------------------------------------------------------------------------

export function sgGetLevel(state: SkyGardenState): number {
  return state.level;
}

export function sgGetTitle(state: SkyGardenState): string {
  return sgCalculateTitle(state.level);
}

export function sgGetTitleForLevel(level: number): string {
  return sgCalculateTitle(level);
}

export function sgGetProgress(state: SkyGardenState): number {
  const currentLevelXp = sgGetXpForLevel(state.level);
  const nextLevelXp = sgGetXpForLevel(state.level + 1);
  if (nextLevelXp <= currentLevelXp) return 100;
  return Math.floor((state.xp / nextLevelXp) * 100);
}

export function sgAddXP(state: SkyGardenState, amount: number): SkyGardenState {
  const newState = { ...state, xp: state.xp + amount, stats: { ...state.stats, totalXPEarned: state.stats.totalXPEarned + amount } };
  const newLevel = sgCalculateLevel(newState.xp);
  if (newLevel > newState.level) {
    newState.level = newLevel;
    newState.maxCosmicEnergy = 50 + (newLevel - 1) * 10;
  }
  return newState;
}

export function sgGetXPForLevel(level: number): number {
  return sgGetXpForLevel(level);
}

export function sgGetXPToNextLevel(state: SkyGardenState): number {
  return sgGetXpForLevel(state.level + 1);
}

export function sgCanLevelUp(state: SkyGardenState): boolean {
  return state.level < SG_MAX_LEVEL;
}

// ---------------------------------------------------------------------------
// Coin Functions
// ---------------------------------------------------------------------------

export function sgGetCoins(state: SkyGardenState): number {
  return state.coins;
}

export function sgAddCoins(state: SkyGardenState, amount: number): SkyGardenState {
  return {
    ...state,
    coins: state.coins + amount,
    resources: { ...state.resources, coins: (state.resources.coins ?? 0) + amount },
    stats: { ...state.stats, totalCoinsEarned: state.stats.totalCoinsEarned + amount },
  };
}

export function sgSpendCoins(state: SkyGardenState, amount: number): SkyGardenState | null {
  if (state.coins < amount) return null;
  return {
    ...state,
    coins: state.coins - amount,
    resources: { ...state.resources, coins: (state.resources.coins ?? 0) - amount },
  };
}

// ---------------------------------------------------------------------------
// Terrace Functions
// ---------------------------------------------------------------------------

export function sgGetTerraces(): SgTerraceDef[] {
  return SG_TERRACES;
}

export function sgGetTerraceInfo(terraceId: string): SgTerraceDef | null {
  return SG_TERRACES.find(t => t.id === terraceId) ?? null;
}

export function sgGetTerraceState(state: SkyGardenState, terraceId: string): SgTerraceState | null {
  return state.terraces.find(t => t.defId === terraceId) ?? null;
}

export function sgUnlockTerrace(state: SkyGardenState, terraceId: string): SkyGardenState | null {
  const def = SG_TERRACES.find(t => t.id === terraceId);
  if (!def) return null;
  const existingState = state.terraces.find(t => t.defId === terraceId);
  if (existingState?.unlocked) return null;
  if (state.level < def.unlockLevel) return null;
  if (state.coins < def.unlockCost) return null;

  const newTerraces = state.terraces.map(t =>
    t.defId === terraceId ? { ...t, unlocked: true } : t,
  );

  return {
    ...state,
    terraces: newTerraces,
    coins: state.coins - def.unlockCost,
    resources: { ...state.resources, coins: (state.resources.coins ?? 0) - def.unlockCost },
    stats: { ...state.stats, totalTerracesUnlocked: state.stats.totalTerracesUnlocked + 1 },
  };
}

export function sgCultivateTerrace(state: SkyGardenState, terraceId: string): SkyGardenState | null {
  const terraceState = state.terraces.find(t => t.defId === terraceId);
  if (!terraceState || !terraceState.unlocked || terraceState.cultivated) return null;
  const newTerraces = state.terraces.map(t =>
    t.defId === terraceId ? { ...t, cultivated: true, structures: [], plantedSeeds: [] } : t,
  );
  return { ...state, terraces: newTerraces };
}

export function sgGetTerraceStructures(state: SkyGardenState, terraceId: string): SgStructureInstance[] {
  const terraceState = state.terraces.find(t => t.defId === terraceId);
  return terraceState?.structures ?? [];
}

export function sgGetUnlockedTerraces(state: SkyGardenState): SgTerraceState[] {
  return state.terraces.filter(t => t.unlocked);
}

export function sgGetCultivatedTerraces(state: SkyGardenState): SgTerraceState[] {
  return state.terraces.filter(t => t.cultivated);
}

// ---------------------------------------------------------------------------
// Structure Functions
// ---------------------------------------------------------------------------

export function sgGetStructures(): SgStructureDef[] {
  return SG_STRUCTURES;
}

export function sgGetStructureInfo(structureId: string): SgStructureDef | null {
  return SG_STRUCTURES.find(s => s.id === structureId) ?? null;
}

export function sgBuildStructure(state: SkyGardenState, terraceId: string, structureId: string): SkyGardenState | null {
  const structureDef = SG_STRUCTURES.find(s => s.id === structureId);
  const terraceDef = SG_TERRACES.find(t => t.id === terraceId);
  const terraceState = state.terraces.find(t => t.defId === terraceId);

  if (!structureDef || !terraceDef || !terraceState) return null;
  if (!terraceState.unlocked || !terraceState.cultivated) return null;
  if (terraceState.structures.length >= terraceDef.maxStructures) return null;

  const cost = sgGetStructureCost(structureDef, 1);
  const allResources = { ...state.resources, coins: state.coins };
  if (!sgCanAfford(allResources, cost)) return null;

  const newStructures = [...terraceState.structures, { defId: structureId, terraceId, level: 1 }];
  const newTerraces = state.terraces.map(t =>
    t.defId === terraceId ? { ...t, structures: newStructures } : t,
  );

  const newResources = sgSpendResources(state.resources, cost);
  return {
    ...state,
    terraces: newTerraces,
    resources: newResources,
    coins: Math.max(0, state.coins - (cost.coins ?? 0)),
    stats: { ...state.stats, totalStructuresBuilt: state.stats.totalStructuresBuilt + 1 },
  };
}

export function sgUpgradeStructure(state: SkyGardenState, terraceId: string, structureIndex: number): SkyGardenState | null {
  const terraceState = state.terraces.find(t => t.defId === terraceId);
  if (!terraceState || !terraceState.cultivated) return null;
  if (structureIndex < 0 || structureIndex >= terraceState.structures.length) return null;

  const structInst = terraceState.structures[structureIndex];
  const structDef = SG_STRUCTURES.find(s => s.id === structInst.defId);
  if (!structDef) return null;
  if (structInst.level >= structDef.maxLevel) return null;

  const cost = sgGetStructureCost(structDef, structInst.level + 1);
  const allResources = { ...state.resources, coins: state.coins };
  if (!sgCanAfford(allResources, cost)) return null;

  const upgradedStruct = { ...structInst, level: structInst.level + 1 };
  const newStructures = [...terraceState.structures];
  newStructures[structureIndex] = upgradedStruct;

  const newTerraces = state.terraces.map(t =>
    t.defId === terraceId ? { ...t, structures: newStructures } : t,
  );

  const newResources = sgSpendResources(state.resources, cost);
  return {
    ...state,
    terraces: newTerraces,
    resources: newResources,
    coins: Math.max(0, state.coins - (cost.coins ?? 0)),
  };
}

export function sgDemolishStructure(state: SkyGardenState, terraceId: string, structureIndex: number): SkyGardenState | null {
  const terraceState = state.terraces.find(t => t.defId === terraceId);
  if (!terraceState || !terraceState.cultivated) return null;
  if (structureIndex < 0 || structureIndex >= terraceState.structures.length) return null;

  const refundRate = 0.4;
  const removed = terraceState.structures[structureIndex];
  const def = SG_STRUCTURES.find(s => s.id === removed.defId);
  let refundCoins = 0;
  if (def) {
    const totalCost: Record<string, number> = {};
    for (let l = 1; l <= removed.level; l++) {
      const lvlCost = sgGetStructureCost(def, l);
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

  const newStructures = terraceState.structures.filter((_, idx) => idx !== structureIndex);
  const newTerraces = state.terraces.map(t =>
    t.defId === terraceId ? { ...t, structures: newStructures } : t,
  );

  return { ...state, terraces: newTerraces, coins: state.coins + refundCoins, resources: { ...state.resources } };
}

export function sgGetTotalStructures(state: SkyGardenState): number {
  return state.terraces.reduce((sum, t) => sum + t.structures.length, 0);
}

// ---------------------------------------------------------------------------
// Ability Functions
// ---------------------------------------------------------------------------

export function sgGetAbilities(): SgAbilityDef[] {
  return SG_ABILITIES;
}

export function sgGetAbilityInfo(abilityId: string): SgAbilityDef | null {
  return SG_ABILITIES.find(a => a.id === abilityId) ?? null;
}

export function sgGetLearnedAbilities(state: SkyGardenState): SgAbilityState[] {
  return state.abilities.filter(a => a.learned);
}

export function sgGetAbilitiesBySchool(state: SkyGardenState, school: SgAbilitySchool): SgAbilityState[] {
  return state.abilities.filter(a => {
    const def = SG_ABILITIES.find(ab => ab.id === a.defId);
    return def?.school === school;
  });
}

export function sgLearnAbility(state: SkyGardenState, abilityId: string): SkyGardenState | null {
  const abilityDef = SG_ABILITIES.find(a => a.id === abilityId);
  if (!abilityDef) return null;
  if (state.level < abilityDef.unlockLevel) return null;

  const abilityState = state.abilities.find(a => a.defId === abilityId);
  if (abilityState?.learned) return null;

  const cosmicCost = abilityDef.cosmicCost * 3;
  if (state.cosmicEnergy < cosmicCost) return null;

  const newAbilities = state.abilities.map(a =>
    a.defId === abilityId ? { ...a, learned: true } : a,
  );

  return { ...state, abilities: newAbilities, cosmicEnergy: state.cosmicEnergy - cosmicCost };
}

export function sgCastAbility(state: SkyGardenState, abilityId: string): SkyGardenState | null {
  const abilityDef = SG_ABILITIES.find(a => a.id === abilityId);
  const abilityState = state.abilities.find(a => a.defId === abilityId);
  if (!abilityDef || !abilityState?.learned) return null;
  if (state.cosmicEnergy < abilityDef.cosmicCost) return null;
  if (abilityState.cooldownRemaining > 0) return null;

  const newAbilities = state.abilities.map(a =>
    a.defId === abilityId
      ? { ...a, castCount: a.castCount + 1, cooldownRemaining: abilityDef.cooldown }
      : a,
  );

  return {
    ...state,
    abilities: newAbilities,
    cosmicEnergy: state.cosmicEnergy - abilityDef.cosmicCost,
    stats: { ...state.stats, totalAbilitiesCast: state.stats.totalAbilitiesCast + 1 },
  };
}

export function sgReduceCooldowns(state: SkyGardenState): SkyGardenState {
  const newAbilities = state.abilities.map(a => ({
    ...a,
    cooldownRemaining: Math.max(0, a.cooldownRemaining - 1),
  }));
  return { ...state, abilities: newAbilities };
}

export function sgGetAbilitySchools(): SgAbilitySchoolDef[] {
  return SG_ABILITY_SCHOOLS;
}

// ---------------------------------------------------------------------------
// Creature Functions (Star Birds)
// ---------------------------------------------------------------------------

export function sgGetCreatures(): SgCreatureDef[] {
  return SG_CREATURES;
}

export function sgGetCreatureInfo(creatureId: string): SgCreatureDef | null {
  return SG_CREATURES.find(c => c.id === creatureId) ?? null;
}

export function sgGetBreedable(state: SkyGardenState): SgCreatureDef[] {
  const bredIds = new Set(state.creatures.map(c => c.defId));
  return SG_CREATURES.filter(c => !bredIds.has(c.id) && c.breedingDifficulty <= state.level);
}

export function sgGetBredCreatures(state: SkyGardenState): SgCreatureInstance[] {
  return state.creatures.filter(c => c.bred);
}

export function sgBreedCreature(state: SkyGardenState, creatureId: string): SkyGardenState | null {
  const creatureDef = SG_CREATURES.find(c => c.id === creatureId);
  if (!creatureDef) return null;

  const alreadyBred = state.creatures.find(c => c.defId === creatureId && c.bred);
  if (alreadyBred) return null;

  const rng = sgSeededRandom(`breed-${creatureId}-${Date.now()}`);
  const successChance = Math.max(0.1, 1.0 - creatureDef.breedingDifficulty * 0.08);

  if (rng() > successChance) {
    return { ...state, coins: Math.max(0, state.coins - 10) };
  }

  const breedingCost = creatureDef.breedingDifficulty * 20;
  if (state.coins < breedingCost) return null;

  const newCreature: SgCreatureInstance = {
    defId: creatureId,
    bred: true,
    nickname: creatureDef.name,
    level: 1,
    hp: creatureDef.hp,
  };

  return {
    ...state,
    creatures: [...state.creatures, newCreature],
    coins: state.coins - breedingCost,
    stats: { ...state.stats, totalCreaturesBred: state.stats.totalCreaturesBred + 1 },
  };
}

export function sgReleaseCreature(state: SkyGardenState, creatureId: string): SkyGardenState {
  return {
    ...state,
    creatures: state.creatures.filter(c => !(c.defId === creatureId && c.bred)),
  };
}

export function sgGetCreaturePower(state: SkyGardenState, creatureId: string): number {
  const creatureDef = SG_CREATURES.find(c => c.id === creatureId);
  const creatureInst = state.creatures.find(c => c.defId === creatureId);
  if (!creatureDef || !creatureInst) return 0;
  return Math.floor((creatureDef.attack + creatureDef.defense) * (1 + creatureInst.level * 0.15));
}

export function sgGetCreatureCountByRarity(state: SkyGardenState, rarity: SgRarity): number {
  return state.creatures.filter(c => {
    const def = SG_CREATURES.find(cd => cd.id === c.defId);
    return def?.rarity === rarity && c.bred;
  }).length;
}

// ---------------------------------------------------------------------------
// Seed & Flower Functions
// ---------------------------------------------------------------------------

export function sgGetSeeds(): SgSeedDef[] {
  return SG_SEEDS;
}

export function sgGetSeedInfo(seedId: string): SgSeedDef | null {
  return SG_SEEDS.find(s => s.id === seedId) ?? null;
}

export function sgPlantSeed(state: SkyGardenState, terraceId: string, seedId: string): SkyGardenState | null {
  const seedDef = SG_SEEDS.find(s => s.id === seedId);
  const terraceState = state.terraces.find(t => t.defId === terraceId);
  if (!seedDef || !terraceState) return null;
  if (!terraceState.cultivated) return null;
  if (state.level < seedDef.requiredLevel) return null;

  const maxFlowers = 6;
  const currentFlowers = terraceState.plantedSeeds.filter(ps => !ps.fullyGrown).length;
  if (currentFlowers >= maxFlowers) return null;

  const newPlantedSeed: SgPlantedSeed = {
    seedId,
    terraceId,
    plantTime: Date.now(),
    growthProgress: 0,
    fullyGrown: false,
  };

  const newTerraces = state.terraces.map(t =>
    t.defId === terraceId ? { ...t, plantedSeeds: [...t.plantedSeeds, newPlantedSeed] } : t,
  );

  return { ...state, terraces: newTerraces };
}

export function sgGetPlantedSeeds(state: SkyGardenState, terraceId: string): SgPlantedSeed[] {
  const terraceState = state.terraces.find(t => t.defId === terraceId);
  return terraceState?.plantedSeeds ?? [];
}

export function sgWaterSeeds(state: SkyGardenState, terraceId: string): SkyGardenState {
  const growthMult = sgGetFlowerGrowthMultiplier(state);
  const newTerraces = state.terraces.map(t => {
    if (t.defId !== terraceId || !t.cultivated) return t;
    const updatedSeeds = t.plantedSeeds.map(ps => {
      if (ps.fullyGrown) return ps;
      const seedDef = SG_SEEDS.find(s => s.id === ps.seedId);
      if (!seedDef) return ps;
      const growthIncrement = 25 * growthMult;
      const newProgress = Math.min(100, ps.growthProgress + growthIncrement);
      return { ...ps, growthProgress: newProgress, fullyGrown: newProgress >= 100 };
    });
    return { ...t, plantedSeeds: updatedSeeds };
  });
  return { ...state, terraces: newTerraces };
}

export function sgWaterAllSeeds(state: SkyGardenState): SkyGardenState {
  const growthMult = sgGetFlowerGrowthMultiplier(state);
  const newTerraces = state.terraces.map(t => {
    if (!t.cultivated) return t;
    const updatedSeeds = t.plantedSeeds.map(ps => {
      if (ps.fullyGrown) return ps;
      const growthIncrement = 25 * growthMult;
      const newProgress = Math.min(100, ps.growthProgress + growthIncrement);
      return { ...ps, growthProgress: newProgress, fullyGrown: newProgress >= 100 };
    });
    return { ...t, plantedSeeds: updatedSeeds };
  });
  return { ...state, terraces: newTerraces };
}

export function sgHarvestFlower(state: SkyGardenState, terraceId: string, seedIndex: number): SkyGardenState | null {
  const terraceState = state.terraces.find(t => t.defId === terraceId);
  if (!terraceState || !terraceState.cultivated) return null;
  if (seedIndex < 0 || seedIndex >= terraceState.plantedSeeds.length) return null;

  const plantedSeed = terraceState.plantedSeeds[seedIndex];
  if (!plantedSeed.fullyGrown) return null;

  const seedDef = SG_SEEDS.find(s => s.id === plantedSeed.seedId);
  if (!seedDef) return null;

  const stardustMult = sgGetStardustYieldMultiplier(state);
  const stardustGain = Math.floor(seedDef.stardustYield * stardustMult);
  const cosmicEnergyGain = seedDef.cosmicEnergyYield;

  const newPlantedSeeds = terraceState.plantedSeeds.filter((_, idx) => idx !== seedIndex);
  const newTerraces = state.terraces.map(t =>
    t.defId === terraceId ? { ...t, plantedSeeds: newPlantedSeeds } : t,
  );

  const newResources = { ...state.resources };
  newResources["stardust"] = (newResources["stardust"] ?? 0) + stardustGain;

  return {
    ...state,
    terraces: newTerraces,
    resources: newResources,
    cosmicEnergy: Math.min(state.maxCosmicEnergy, state.cosmicEnergy + cosmicEnergyGain),
    stats: {
      ...state.stats,
      totalStardustHarvested: state.stats.totalStardustHarvested + stardustGain,
      totalFlowersCultivated: state.stats.totalFlowersCultivated + 1,
      totalResourcesGathered: state.stats.totalResourcesGathered + stardustGain,
    },
  };
}

export function sgHarvestAllFlowers(state: SkyGardenState): SkyGardenState {
  const stardustMult = sgGetStardustYieldMultiplier(state);
  let totalStardust = 0;
  let totalCosmic = 0;
  let totalFlowers = 0;

  const newTerraces = state.terraces.map(t => {
    if (!t.cultivated) return t;
    const harvested: SgPlantedSeed[] = [];
    const remaining: SgPlantedSeed[] = [];

    for (const ps of t.plantedSeeds) {
      if (ps.fullyGrown) {
        harvested.push(ps);
        const seedDef = SG_SEEDS.find(s => s.id === ps.seedId);
        if (seedDef) {
          totalStardust += Math.floor(seedDef.stardustYield * stardustMult);
          totalCosmic += seedDef.cosmicEnergyYield;
          totalFlowers++;
        }
      } else {
        remaining.push(ps);
      }
    }

    return { ...t, plantedSeeds: remaining };
  });

  const newResources = { ...state.resources };
  newResources["stardust"] = (newResources["stardust"] ?? 0) + totalStardust;

  return {
    ...state,
    terraces: newTerraces,
    resources: newResources,
    cosmicEnergy: Math.min(state.maxCosmicEnergy, state.cosmicEnergy + totalCosmic),
    stats: {
      ...state.stats,
      totalStardustHarvested: state.stats.totalStardustHarvested + totalStardust,
      totalFlowersCultivated: state.stats.totalFlowersCultivated + totalFlowers,
      totalResourcesGathered: state.stats.totalResourcesGathered + totalStardust,
    },
  };
}

// ---------------------------------------------------------------------------
// Resource Functions
// ---------------------------------------------------------------------------

export function sgGetResources(): SgResourceDef[] {
  return SG_RESOURCES;
}

export function sgGetResourceInfo(resourceId: string): SgResourceDef | null {
  return SG_RESOURCES.find(r => r.id === resourceId) ?? null;
}

export function sgGetResourceCount(state: SkyGardenState, resourceId: string): number {
  return state.resources[resourceId] ?? 0;
}

export function sgGetAllResources(state: SkyGardenState): Record<string, number> {
  return { ...state.resources };
}

export function sgGatherResource(state: SkyGardenState, resourceId: string, amount: number): SkyGardenState | null {
  const def = SG_RESOURCES.find(r => r.id === resourceId);
  if (!def || amount <= 0) return null;

  const newResources = { ...state.resources };
  newResources[resourceId] = (newResources[resourceId] ?? 0) + amount;

  return {
    ...state,
    resources: newResources,
    stats: { ...state.stats, totalResourcesGathered: state.stats.totalResourcesGathered + amount },
  };
}

export function sgTradeResource(
  state: SkyGardenState,
  giveId: string,
  giveAmount: number,
  receiveId: string,
): SkyGardenState | null {
  if (giveId === receiveId) return null;
  if ((state.resources[giveId] ?? 0) < giveAmount) return null;

  const giveDef = SG_RESOURCES.find(r => r.id === giveId);
  const receiveDef = SG_RESOURCES.find(r => r.id === receiveId);
  if (!giveDef || !receiveDef) return null;

  const tradeRatio = receiveDef.baseValue / giveDef.baseValue;
  const received = Math.max(1, Math.floor(giveAmount * tradeRatio * 0.8));

  const newResources = { ...state.resources };
  newResources[giveId] = (newResources[giveId] ?? 0) - giveAmount;
  newResources[receiveId] = (newResources[receiveId] ?? 0) + received;

  return { ...state, resources: newResources };
}

export function sgGetResourceProduction(state: SkyGardenState): Record<string, number> {
  return sgGetTerraceResourceProduction(state);
}

export function sgSimulateHour(state: SkyGardenState): SkyGardenState {
  const production = sgGetTerraceResourceProduction(state);
  const newResources = { ...state.resources };
  for (const [key, val] of Object.entries(production)) {
    newResources[key] = (newResources[key] ?? 0) + val;
  }
  const newCosmicEnergy = Math.min(state.maxCosmicEnergy, state.cosmicEnergy + 5 + Math.floor(state.level / 3));
  const newState = sgReduceCooldowns({ ...state, resources: newResources, cosmicEnergy: newCosmicEnergy });
  return newState;
}

// ---------------------------------------------------------------------------
// Quest Functions
// ---------------------------------------------------------------------------

export function sgGetQuests(): SgQuestDef[] {
  return SG_QUESTS;
}

export function sgGetQuestInfo(questId: string): SgQuestDef | null {
  return SG_QUESTS.find(q => q.id === questId) ?? null;
}

export function sgGetAvailableQuests(state: SkyGardenState): SgQuestDef[] {
  const acceptedIds = new Set(state.quests.filter(q => q.accepted || q.completed).map(q => q.defId));
  return SG_QUESTS.filter(q => !acceptedIds.has(q.id) && state.level >= q.requiredLevel);
}

export function sgGetActiveQuests(state: SkyGardenState): SgQuestState[] {
  return state.quests.filter(q => q.accepted && !q.completed);
}

export function sgGetCompletedQuests(state: SkyGardenState): SgQuestState[] {
  return state.quests.filter(q => q.completed);
}

export function sgAcceptQuest(state: SkyGardenState, questId: string): SkyGardenState | null {
  const def = SG_QUESTS.find(q => q.id === questId);
  if (!def) return null;
  if (state.level < def.requiredLevel) return null;

  const existing = state.quests.find(q => q.defId === questId);
  if (existing?.accepted || existing?.completed) return null;

  const newQuests = state.quests.map(q =>
    q.defId === questId ? { ...q, accepted: true, progress: 0 } : q,
  );

  return { ...state, quests: newQuests };
}

export function sgUpdateQuestProgress(state: SkyGardenState, objectiveType: string, amount: number): SkyGardenState {
  const newQuests = state.quests.map(q => {
    if (!q.accepted || q.completed) return q;
    const def = SG_QUESTS.find(qd => qd.id === q.defId);
    if (!def || def.objectiveType !== objectiveType) return q;
    return { ...q, progress: Math.min(def.objectiveTarget, q.progress + amount) };
  });
  return { ...state, quests: newQuests };
}

export function sgCompleteQuest(state: SkyGardenState, questId: string): SkyGardenState | null {
  const questState = state.quests.find(q => q.defId === questId);
  const questDef = SG_QUESTS.find(q => q.id === questId);
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

  const newState: SkyGardenState = {
    ...state,
    quests: newQuests,
    resources: newResources,
    coins: state.coins + questDef.coinReward,
    stats: { ...state.stats, totalQuestsCompleted: state.stats.totalQuestsCompleted + 1 },
  };

  return sgAddXP(newState, questDef.xpReward);
}

export function sgAbandonQuest(state: SkyGardenState, questId: string): SkyGardenState {
  const newQuests = state.quests.map(q =>
    q.defId === questId ? { ...q, accepted: false, progress: 0 } : q,
  );
  return { ...state, quests: newQuests };
}

// ---------------------------------------------------------------------------
// Achievement Functions
// ---------------------------------------------------------------------------

export function sgGetAchievements(): SgAchievementDef[] {
  return SG_ACHIEVEMENTS;
}

export function sgGetAchievementInfo(achievementId: string): SgAchievementDef | null {
  return SG_ACHIEVEMENTS.find(a => a.id === achievementId) ?? null;
}

export function sgGetUnlockedAchievements(state: SkyGardenState): string[] {
  return state.achievements;
}

export function sgCheckAchievements(state: SkyGardenState): { newAchievements: string[]; newState: SkyGardenState } {
  const newAchievements: string[] = [];
  const abilitiesLearned = state.abilities.filter(a => a.learned).length;
  const hasLegendary = state.creatures.some(c => {
    const def = SG_CREATURES.find(cd => cd.id === c.defId);
    return def?.rarity === "Legendary" && c.bred;
  });

  const conditionMap: Record<string, boolean> = {
    "totalTerracesUnlocked >= 1": state.stats.totalTerracesUnlocked >= 1,
    "totalStructuresBuilt >= 10": state.stats.totalStructuresBuilt >= 10,
    "totalStructuresBuilt >= 25": state.stats.totalStructuresBuilt >= 25,
    "abilities_learned >= 5": abilitiesLearned >= 5,
    "abilities_learned >= 15": abilitiesLearned >= 15,
    "abilities_learned >= 22": abilitiesLearned >= 22,
    "totalCreaturesBred >= 5": state.stats.totalCreaturesBred >= 5,
    "totalCreaturesBred >= 15": state.stats.totalCreaturesBred >= 15,
    "totalCreaturesBred >= 35": state.stats.totalCreaturesBred >= 35,
    "has_legendary": hasLegendary,
    "totalTerracesUnlocked >= 8": state.stats.totalTerracesUnlocked >= 8,
    "totalQuestsCompleted >= 10": state.stats.totalQuestsCompleted >= 10,
    "totalQuestsCompleted >= 22": state.stats.totalQuestsCompleted >= 22,
    "totalFlowersCultivated >= 10": state.stats.totalFlowersCultivated >= 10,
    "totalFlowersCultivated >= 30": state.stats.totalFlowersCultivated >= 30,
    "totalStardustHarvested >= 1000": state.stats.totalStardustHarvested >= 1000,
    "coins >= 10000": state.coins >= 10000,
    "streak >= 7": state.streak >= 7,
  };

  const updatedAchievements = [...state.achievements];
  for (const ach of SG_ACHIEVEMENTS) {
    if (updatedAchievements.includes(ach.id)) continue;
    if (conditionMap[ach.condition]) {
      updatedAchievements.push(ach.id);
      newAchievements.push(ach.id);
    }
  }

  const totalBonus = newAchievements.reduce((sum, id) => {
    const ach = SG_ACHIEVEMENTS.find(a => a.id === id);
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

export function sgGetNPCs(): SgNpcDef[] {
  return SG_NPCS;
}

export function sgGetNPCInfo(npcId: string): SgNpcDef | null {
  return SG_NPCS.find(n => n.id === npcId) ?? null;
}

export function sgInteractNPC(state: SkyGardenState, npcId: string): { npc: SgNpcDef | null; bonusApplied: number } {
  const npc = SG_NPCS.find(n => n.id === npcId);
  if (!npc) return { npc: null, bonusApplied: 0 };

  let bonusApplied = 0;
  switch (npc.bonusType) {
    case "all_production":
      bonusApplied = Math.floor(state.level * npc.bonusValue * 0.1);
      break;
    case "growth_boost":
      bonusApplied = npc.bonusValue;
      break;
    case "breeding_bonus":
      bonusApplied = npc.bonusValue;
      break;
    case "stardust_bonus":
      bonusApplied = Math.floor(state.level * npc.bonusValue * 0.1);
      break;
    case "trade_discount":
      bonusApplied = npc.bonusValue;
      break;
    case "energy_regen":
      bonusApplied = npc.bonusValue;
      break;
    case "xp_bonus":
      bonusApplied = Math.floor(state.level * npc.bonusValue * 0.05);
      break;
    case "build_discount":
      bonusApplied = npc.bonusValue;
      break;
    default:
      bonusApplied = npc.bonusValue;
  }

  return { npc, bonusApplied };
}

// ---------------------------------------------------------------------------
// Daily System Functions (Stardust Harvest)
// ---------------------------------------------------------------------------

export function sgGetDailyTask(state: SkyGardenState): SgDailyData {
  return state.daily;
}

export function sgGetDailyHarvestTarget(state: SkyGardenState): { target: number; progress: number; completed: boolean } {
  const rng = sgSeededRandom(`daily-harvest-${state.daily.dateSeed}`);
  const target = 8 + Math.floor(rng() * 8);
  return {
    target,
    progress: state.daily.harvestProgress,
    completed: state.daily.stardustHarvested,
  };
}

export function sgHarvestStardust(state: SkyGardenState, increment: number): SkyGardenState {
  const rng = sgSeededRandom(`daily-harvest-${state.daily.dateSeed}`);
  const target = 8 + Math.floor(rng() * 8);
  const newProgress = Math.min(target, state.daily.harvestProgress + increment);
  const harvested = newProgress >= target;

  const stardustGain = increment * 2;
  const newResources = { ...state.resources };
  newResources["stardust"] = (newResources["stardust"] ?? 0) + stardustGain;

  return {
    ...state,
    resources: newResources,
    daily: {
      ...state.daily,
      harvestProgress: newProgress,
      stardustHarvested: harvested,
    },
    stats: {
      ...state.stats,
      totalStardustHarvested: state.stats.totalStardustHarvested + stardustGain,
      totalResourcesGathered: state.stats.totalResourcesGathered + stardustGain,
    },
  };
}

export function sgClaimDailyReward(state: SkyGardenState): SkyGardenState | null {
  if (!state.daily.stardustHarvested || state.daily.rewardClaimed) return null;

  const rng = sgSeededRandom(`daily-reward-${state.daily.dateSeed}`);
  const coinReward = 50 + state.level * 10 + Math.floor(rng() * 50);
  const cosmicReward = 10 + state.level * 2;
  const bonusResource = SG_RESOURCES[Math.floor(rng() * SG_RESOURCES.length)];
  const resourceAmount = 5 + Math.floor(rng() * 15) + state.level;

  const newResources = { ...state.resources };
  newResources[bonusResource.id] = (newResources[bonusResource.id] ?? 0) + resourceAmount;

  const streakBonus = state.streak >= 7 ? 2 : state.streak >= 3 ? 1.5 : 1;

  return {
    ...state,
    resources: newResources,
    coins: Math.floor(state.coins + coinReward * streakBonus),
    cosmicEnergy: Math.min(state.maxCosmicEnergy, state.cosmicEnergy + cosmicReward),
    daily: { ...state.daily, rewardClaimed: true },
  };
}

export function sgResetDaily(state: SkyGardenState): SkyGardenState {
  const todaySeed = sgGetTodaySeed();
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
      stardustHarvested: false,
      harvestTarget: 10,
      harvestProgress: 0,
      rewardClaimed: false,
    },
    streak: newStreak,
    lastDaily: todaySeed,
  };
}

// ---------------------------------------------------------------------------
// Weekly & Monthly Functions
// ---------------------------------------------------------------------------

export function sgGetWeeklyCometRace(state: SkyGardenState): SgWeeklyData {
  return state.weekly;
}

export function sgStartCometRace(state: SkyGardenState): { result: SkyGardenState; position: number; reward: number } {
  const rng = sgSeededRandom(`comet-race-${state.weekly.weekSeed}-${state.level}`);
  const birdsBred = state.creatures.filter(c => c.bred).length;
  const bestSpeed = Math.max(...state.creatures.filter(c => c.bred).map(c => {
    const def = SG_CREATURES.find(cd => cd.id === c.defId);
    return def ? (def.attack + def.defense) * c.level : 0;
  }), 0);

  const raceScore = (bestSpeed * 0.1 + birdsBred * 5 + state.level * 2) * (0.8 + rng() * 0.4);
  const position = raceScore > 80 ? 1 : raceScore > 60 ? 2 : raceScore > 40 ? 3 : raceScore > 20 ? 4 : 5;
  const reward = [500, 300, 200, 100, 50][position - 1] ?? 50;

  return {
    result: {
      ...state,
      weekly: { ...state.weekly, cometRaceCompleted: true, cometRacePosition: position, cometRaceReward: reward },
      coins: state.coins + reward,
    },
    position,
    reward,
  };
}

export function sgGetMonthlyNebulaChallenge(state: SkyGardenState): SgMonthlyData {
  return state.monthly;
}

export function sgStartNebulaChallenge(state: SkyGardenState): SkyGardenState | null {
  if (state.monthly.nebulaChallengeCompleted) return null;

  const rng = sgSeededRandom(`nebula-monthly-${state.monthly.monthSeed}`);
  const targetProgress = 20 + Math.floor(rng() * 30);
  const rewardPool: Record<string, number> = {};
  const rewardCount = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < rewardCount; i++) {
    const res = SG_RESOURCES[Math.floor(rng() * SG_RESOURCES.length)];
    rewardPool[res.id] = (rewardPool[res.id] ?? 0) + 10 + Math.floor(rng() * 25);
  }
  rewardPool.coins = 300 + Math.floor(rng() * 500);

  return {
    ...state,
    monthly: {
      ...state.monthly,
      nebulaChallengeProgress: 0,
      nebulaChallengeReward: rewardPool,
    },
  };
}

export function sgProgressNebulaChallenge(state: SkyGardenState, amount: number): SkyGardenState {
  const rng = sgSeededRandom(`nebula-monthly-${state.monthly.monthSeed}`);
  const targetProgress = 20 + Math.floor(rng() * 30);
  const newProgress = Math.min(targetProgress, state.monthly.nebulaChallengeProgress + amount);
  const completed = newProgress >= targetProgress;

  if (!completed) {
    return { ...state, monthly: { ...state.monthly, nebulaChallengeProgress: newProgress } };
  }

  const newResources = { ...state.resources };
  for (const [key, val] of Object.entries(state.monthly.nebulaChallengeReward)) {
    newResources[key] = (newResources[key] ?? 0) + val;
  }

  return {
    ...state,
    resources: newResources,
    monthly: { ...state.monthly, nebulaChallengeProgress: newProgress, nebulaChallengeCompleted: true },
  };
}

// ---------------------------------------------------------------------------
// Celestial Forecast Functions
// ---------------------------------------------------------------------------

export function sgGetCelestialForecast(state: SkyGardenState, days: number): Array<{ day: string; weather: string; bonus: string; intensity: number }> {
  const rng = sgSeededRandom(`forecast-${sgGetTodaySeed()}-${state.level}`);
  const weathers = ["Starlit Calm", "Nebula Drift", "Golden Sunrise", "Moonlit Mist", "Dawn Burst", "Prismatic Shower", "Comet Shower", "Solar Flare", "Twilight Calm", "Aurora Display", "Void Rift", "Cosmic Bloom"];
  const bonuses = ["stardust", "celestial_gold", "moonlight_silver", "dawn_rose_petal", "nebula_mist", "starlight_crystal", "aurora_blossom", "void_pearl"];

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
// Garden Stats & Power Functions
// ---------------------------------------------------------------------------

export function sgGetGardenStats(state: SkyGardenState): SgStats {
  return { ...state.stats };
}

export function sgGetGardenPower(state: SkyGardenState): number {
  const structurePower = sgGetTotalStructures(state) * 15;
  const creaturePower = state.creatures.reduce((sum, c) => {
    const def = SG_CREATURES.find(cd => cd.id === c.defId);
    return sum + (def ? (def.attack + def.defense) * c.level : 0);
  }, 0);
  const abilityPower = state.abilities.filter(a => a.learned).reduce((sum, a) => {
    const def = SG_ABILITIES.find(ab => ab.id === a.defId);
    return sum + (def ? def.power * (1 + a.castCount * 0.02) : 0);
  }, 0);
  const flowerPower = state.stats.totalFlowersCultivated * 5;
  const stardustPower = Math.floor(state.stats.totalStardustHarvested * 0.01);

  return Math.floor((structurePower + creaturePower + abilityPower + flowerPower + stardustPower) * (1 + state.level * 0.1));
}

export function sgCollectAll(state: SkyGardenState): SkyGardenState {
  const production = sgGetTerraceResourceProduction(state);
  const newResources = { ...state.resources };
  let totalCollected = 0;
  for (const [key, val] of Object.entries(production)) {
    const amount = val * 8;
    newResources[key] = (newResources[key] ?? 0) + amount;
    totalCollected += amount;
  }

  return {
    ...state,
    resources: newResources,
    stats: { ...state.stats, totalResourcesGathered: state.stats.totalResourcesGathered + totalCollected },
  };
}

export function sgGetCosmicEnergy(state: SkyGardenState): number {
  return state.cosmicEnergy;
}

export function sgGetMaxCosmicEnergy(state: SkyGardenState): number {
  return state.maxCosmicEnergy;
}

export function sgRegenCosmicEnergy(state: SkyGardenState): SkyGardenState {
  const regenAmount = 5 + Math.floor(state.level / 3);
  return {
    ...state,
    cosmicEnergy: Math.min(state.maxCosmicEnergy, state.cosmicEnergy + regenAmount),
  };
}

export function sgSpendCosmicEnergy(state: SkyGardenState, amount: number): SkyGardenState | null {
  if (state.cosmicEnergy < amount) return null;
  return { ...state, cosmicEnergy: state.cosmicEnergy - amount };
}

// ---------------------------------------------------------------------------
// Advanced Utility Functions
// ---------------------------------------------------------------------------

export function sgGetTerraceDefense(state: SkyGardenState, terraceId: string): number {
  const terraceState = state.terraces.find(t => t.defId === terraceId);
  if (!terraceState || !terraceState.cultivated) return 0;

  let defense = 10;
  for (const structure of terraceState.structures) {
    const def = SG_STRUCTURES.find(s => s.id === structure.defId);
    if (!def) continue;
    switch (def.category) {
      case "creature":
        defense += 15 * structure.level;
        break;
      case "utility":
        defense += 10 * structure.level;
        break;
      default:
        defense += 2 * structure.level;
    }
  }

  defense += state.creatures.filter(c => c.bred).reduce((sum, c) => {
    const cDef = SG_CREATURES.find(cd => cd.id === c.defId);
    return sum + (cDef?.defense ?? 0) * c.level;
  }, 0);

  return defense;
}

export function sgRenameGarden(state: SkyGardenState, name: string): SkyGardenState {
  return { ...state, gardenName: name };
}

export function sgGetNextUnlockLevel(state: SkyGardenState): { level: number; terrace: SgTerraceDef } | null {
  const nextTerrace = SG_TERRACES
    .filter(t => t.unlockLevel > state.level)
    .sort((a, b) => a.unlockLevel - b.unlockLevel)[0];
  if (!nextTerrace) return null;
  return { level: nextTerrace.unlockLevel, terrace: nextTerrace };
}

export function sgGetOverview(state: SkyGardenState): {
  gardenName: string;
  level: number;
  title: string;
  coins: number;
  cosmicEnergy: number;
  maxCosmicEnergy: number;
  unlockedTerraces: number;
  totalTerraces: number;
  cultivatedTerraces: number;
  structures: number;
  creatures: number;
  abilities: number;
  quests: number;
  achievements: number;
  power: number;
  streak: number;
} {
  return {
    gardenName: state.gardenName,
    level: state.level,
    title: sgCalculateTitle(state.level),
    coins: state.coins,
    cosmicEnergy: state.cosmicEnergy,
    maxCosmicEnergy: state.maxCosmicEnergy,
    unlockedTerraces: state.terraces.filter(t => t.unlocked).length,
    totalTerraces: SG_TERRACES.length,
    cultivatedTerraces: state.terraces.filter(t => t.cultivated).length,
    structures: sgGetTotalStructures(state),
    creatures: state.creatures.filter(c => c.bred).length,
    abilities: state.abilities.filter(a => a.learned).length,
    quests: state.quests.filter(q => q.completed).length,
    achievements: state.achievements.length,
    power: sgGetGardenPower(state),
    streak: state.streak,
  };
}

export function sgGetResourceValue(state: SkyGardenState): number {
  let total = 0;
  for (const [key, val] of Object.entries(state.resources)) {
    const def = SG_RESOURCES.find(r => r.id === key);
    total += (def?.baseValue ?? 0) * val;
  }
  return total;
}

export function sgGetStructureUpgradeCost(structureId: string, currentLevel: number): Record<string, number> | null {
  const def = SG_STRUCTURES.find(s => s.id === structureId);
  if (!def || currentLevel >= def.maxLevel) return null;
  return sgGetStructureCost(def, currentLevel + 1);
}

export function sgGetBreedingCost(creatureId: string): number | null {
  const def = SG_CREATURES.find(c => c.id === creatureId);
  if (!def) return null;
  return def.breedingDifficulty * 20;
}

export function sgGetBreedingChance(state: SkyGardenState, creatureId: string): number {
  const def = SG_CREATURES.find(c => c.id === creatureId);
  if (!def) return 0;
  const baseChance = Math.max(0.1, 1.0 - def.breedingDifficulty * 0.08);
  const npcBonus = sgInteractNPC(state, "npc_bird_whisperer").bonusApplied * 0.01;
  return Math.min(0.95, baseChance + npcBonus);
}

export function sgGetQuestRewardPreview(questId: string): { xp: number; coins: number; resources: Record<string, number> } | null {
  const def = SG_QUESTS.find(q => q.id === questId);
  if (!def) return null;
  return { xp: def.xpReward, coins: def.coinReward, resources: { ...def.resourceReward } };
}

export function sgSortCreaturesBy(state: SkyGardenState, sortBy: "name" | "rarity" | "power" | "level"): SgCreatureDef[] {
  const bred = SG_CREATURES.filter(c => state.creatures.some(ci => ci.defId === c.id && ci.bred));
  switch (sortBy) {
    case "name":
      return [...bred].sort((a, b) => a.name.localeCompare(b.name));
    case "rarity": {
      const rarityOrder: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4 };
      return [...bred].sort((a, b) => (rarityOrder[a.rarity] ?? 0) - (rarityOrder[b.rarity] ?? 0));
    }
    case "power":
      return [...bred].sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense));
    case "level":
      return [...bred].sort((a, b) => {
        const instA = state.creatures.find(c => c.defId === a.id);
        const instB = state.creatures.find(c => c.defId === b.id);
        return (instB?.level ?? 0) - (instA?.level ?? 0);
      });
    default:
      return bred;
  }
}

export function sgGetTerraceCelestialBonus(state: SkyGardenState, terraceId: string): string {
  const def = SG_TERRACES.find(t => t.id === terraceId);
  if (!def) return "No bonus";
  const cultivated = state.terraces.find(t => t.defId === terraceId)?.cultivated;
  if (!cultivated) return "Cultivate this terrace to gain celestial bonuses";
  const resDef = SG_RESOURCES.find(r => r.id === def.primaryResource);
  return `+25% ${resDef?.name ?? def.primaryResource} production from ${def.celestialPattern}`;
}

export function sgGetTotalCosmicCost(state: SkyGardenState): number {
  return state.abilities
    .filter(a => a.learned)
    .reduce((sum, a) => {
      const def = SG_ABILITIES.find(ab => ab.id === a.defId);
      return sum + (def?.cosmicCost ?? 0);
    }, 0);
}

export function sgGetSeedGrowTime(state: SkyGardenState, seedId: string): number {
  const seedDef = SG_SEEDS.find(s => s.id === seedId);
  if (!seedDef) return 0;
  const growthMult = sgGetFlowerGrowthMultiplier(state);
  return Math.floor(seedDef.growTimeHours * growthMult);
}

export function sgGetHarvestPreview(seedId: string, state: SkyGardenState): { stardust: number; cosmicEnergy: number } | null {
  const seedDef = SG_SEEDS.find(s => s.id === seedId);
  if (!seedDef) return null;
  const stardustMult = sgGetStardustYieldMultiplier(state);
  return {
    stardust: Math.floor(seedDef.stardustYield * stardustMult),
    cosmicEnergy: seedDef.cosmicEnergyYield,
  };
}

export function sgGetAvailableSeeds(state: SkyGardenState): SgSeedDef[] {
  return SG_SEEDS.filter(s => state.level >= s.requiredLevel);
}

export function sgGetPlantedSeedCount(state: SkyGardenState, terraceId: string): number {
  const terraceState = state.terraces.find(t => t.defId === terraceId);
  if (!terraceState) return 0;
  return terraceState.plantedSeeds.filter(ps => !ps.fullyGrown).length;
}

export function sgGetTotalPlantedCount(state: SkyGardenState): number {
  let count = 0;
  for (const terrace of state.terraces) {
    count += terrace.plantedSeeds.filter(ps => !ps.fullyGrown).length;
  }
  return count;
}

export function sgGetTotalHarvestableCount(state: SkyGardenState): number {
  let count = 0;
  for (const terrace of state.terraces) {
    count += terrace.plantedSeeds.filter(ps => ps.fullyGrown).length;
  }
  return count;
}


export function sgSortSeedsBy(state: SkyGardenState, sortBy: "name" | "rarity" | "stardustYield" | "growTime"): SgSeedDef[] {
  const available = sgGetAvailableSeeds(state);
  switch (sortBy) {
    case "name":
      return [...available].sort((a, b) => a.name.localeCompare(b.name));
    case "rarity": {
      const rarityOrder: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4 };
      return [...available].sort((a, b) => (rarityOrder[a.rarity] ?? 0) - (rarityOrder[b.rarity] ?? 0));
    }
    case "stardustYield":
      return [...available].sort((a, b) => b.stardustYield - a.stardustYield);
    case "growTime":
      return [...available].sort((a, b) => a.growTimeHours - b.growTimeHours);
    default:
      return available;
  }
}
