// ============================================================================
// Cloud Strand Wire — Ethereal Cloud Thread Weaving Mini-Game
// ============================================================================
// SSR-safe: no localStorage, no window/document, no setInterval/addEventListener.
// All exported functions use `cs` prefix, all constants use `CS_` prefix.
// Uses React hooks internally (useState, useCallback, useRef, useMemo, useEffect).
// Theme: dawn pink / sunrise gold / cloud white / sky blue / twilight lavender
// ============================================================================

import { useState, useCallback, useRef, useMemo, useEffect } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CsRarity = "Common" | "Unusual" | "Rare" | "Epic" | "Legendary";
export type CsCloudType = "Cirrus" | "Cumulus" | "Stratus" | "Nimbus" | "Auroral" | "Dawn" | "Twilight" | "Zephyr" | "Prism" | "Gossamer";
export type CsWindSchool = "Breeze" | "Gale" | "Zephyr" | "Tempest" | "Ethereal" | "Dawn";
export type CsThreadCategory = "Silk" | "Lace" | "Brocade" | "Gauze" | "Tapestry" | "Filigree";

export interface CsCreatureDef {
  id: string;
  name: string;
  cloudType: CsCloudType;
  rarity: CsRarity;
  windPower: number;
  grace: number;
  abilities: string[];
  description: string;
}

export interface CsIslandDef {
  id: string;
  name: string;
  altitude: number;
  primaryThread: string;
  secondaryThread: string;
  windPattern: string;
  unlockLevel: number;
  unlockCost: number;
  maxStructures: number;
  description: string;
  color: string;
}

export interface CsThreadDef {
  id: string;
  name: string;
  category: CsThreadCategory;
  description: string;
  icon: string;
  baseValue: number;
  spinTime: number;
}

export interface CsStructureDef {
  id: string;
  name: string;
  category: string;
  baseCost: Record<string, number>;
  maxLevel: number;
  productionPerHour: Record<string, number>;
  description: string;
  upgradeMultiplier: number;
}

export interface CsWindAbilityDef {
  id: string;
  name: string;
  school: CsWindSchool;
  windCost: number;
  power: number;
  cooldown: number;
  description: string;
  rarity: CsRarity;
  unlockLevel: number;
  effectType: string;
}

export interface CsAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
  icon: string;
}

export interface CsTitleThreshold {
  minLevel: number;
  title: string;
}

export interface CsDailyQuestDef {
  id: string;
  name: string;
  description: string;
  objectiveType: string;
  objectiveTarget: number;
  xpReward: number;
  threadReward: Record<string, number>;
  coinReward: number;
  requiredLevel: number;
  category: string;
}

// State interfaces

export interface CsIslandState {
  defId: string;
  unlocked: boolean;
  discovered: boolean;
  structures: CsStructureInstance[];
}

export interface CsStructureInstance {
  defId: string;
  islandId: string;
  level: number;
}

export interface CsCreatureInstance {
  defId: string;
  befriended: boolean;
  nickname: string;
  level: number;
}

export interface CsWindAbilityState {
  defId: string;
  learned: boolean;
  castCount: number;
  cooldownRemaining: number;
}

export interface CsDailyData {
  dateSeed: string;
  sunriseHarvested: boolean;
  harvestTarget: number;
  harvestProgress: number;
  rewardClaimed: boolean;
  questAccepted: boolean;
  questCompleted: boolean;
  questProgress: number;
}

export interface CsStats {
  totalIslandsDiscovered: number;
  totalThreadsSpun: number;
  totalStructuresBuilt: number;
  totalWindAbilitiesUsed: number;
  totalCreaturesBefriended: number;
  totalQuestsCompleted: number;
  totalCoinsEarned: number;
  totalXPEarned: number;
  totalSunrisesHarvested: number;
}

export interface CloudStrandState {
  level: number;
  xp: number;
  coins: number;
  wind: number;
  maxWind: number;
  islands: CsIslandState[];
  structures: CsStructureInstance[];
  creatures: CsCreatureInstance[];
  windAbilities: CsWindAbilityState[];
  threads: Record<string, number>;
  achievements: string[];
  streak: number;
  lastDaily: string | null;
  daily: CsDailyData;
  stats: CsStats;
}

// ---------------------------------------------------------------------------
// Constants — Color Theme
// ---------------------------------------------------------------------------

export const CS_COLORS = {
  dawnPink: "#FFB6C1",
  sunriseGold: "#FFD700",
  cloudWhite: "#F8F8FF",
  skyBlue: "#87CEEB",
  twilightLavender: "#B39DDB",
} as const;

// ---------------------------------------------------------------------------
// Constants — Game Data
// ---------------------------------------------------------------------------

export const CS_MAX_LEVEL = 50;

export const CS_TITLE_THRESHOLDS: CsTitleThreshold[] = [
  { minLevel: 1, title: "Cloud Walker" },
  { minLevel: 6, title: "Thread Spinner" },
  { minLevel: 12, title: "Wind Rider" },
  { minLevel: 18, title: "Sky Weaver" },
  { minLevel: 25, title: "Dawn Herald" },
  { minLevel: 32, title: "Sunrise Master" },
  { minLevel: 38, title: "Strand Artisan" },
  { minLevel: 44, title: "Cloud Sovereign" },
  { minLevel: 48, title: "Strand Weaver" },
];

export const CS_WIND_SCHOOLS: Array<{ id: CsWindSchool; name: string; description: string; color: string; icon: string }> = [
  { id: "Breeze", name: "Breeze", description: "Gentle morning winds that carry dawn's first light.", color: "#FFB6C1", icon: "🌸" },
  { id: "Gale", name: "Gale", description: "Powerful winds that weave threads into tapestries.", color: "#87CEEB", icon: "💨" },
  { id: "Zephyr", name: "Zephyr", description: "Whispering west winds that guide travelers.", color: "#B39DDB", icon: "🎐" },
  { id: "Tempest", name: "Tempest", description: "Fierce storms that forge unbreakable silk.", color: "#5C6BC0", icon: "⛈️" },
  { id: "Ethereal", name: "Ethereal", description: "Otherworldly winds from beyond the sky.", color: "#F8F8FF", icon: "✨" },
  { id: "Dawn", name: "Dawn", description: "Sacred winds born at the first moment of sunrise.", color: "#FFD700", icon: "🌅" },
];

export const CS_THREADS: CsThreadDef[] = [
  // Silk (5)
  { id: "morning_silk", name: "Morning Silk", category: "Silk", description: "Luminous threads harvested from sunrise-touched clouds.", icon: "🧵", baseValue: 1, spinTime: 1 },
  { id: "cirrus_silk", name: "Cirrus Silk", category: "Silk", description: "Ultra-fine threads from the highest wispy clouds.", icon: "🪶", baseValue: 2, spinTime: 2 },
  { id: "rose_silk", name: "Rose Silk", category: "Silk", description: "Pink-tinted silk spun during dawn's blush.", icon: "🌹", baseValue: 3, spinTime: 2 },
  { id: "storm_silk", name: "Storm Silk", category: "Silk", description: "Electrically charged threads from thunderheads.", icon: "⚡", baseValue: 4, spinTime: 3 },
  { id: "celestial_silk", name: "Celestial Silk", category: "Silk", description: "Threads woven from captured starlight.", icon: "🌟", baseValue: 6, spinTime: 5 },
  // Lace (5)
  { id: "frost_lace", name: "Frost Lace", category: "Lace", description: "Delicate ice crystal patterns frozen into thread.", icon: "❄️", baseValue: 2, spinTime: 2 },
  { id: "mist_lace", name: "Mist Lace", category: "Lace", description: "Gossamer lace from low-hanging cloud veils.", icon: "🌫️", baseValue: 1, spinTime: 1 },
  { id: "aurora_lace", name: "Aurora Lace", category: "Lace", description: "Shimmering lace that shifts color with the sky.", icon: "🌈", baseValue: 5, spinTime: 4 },
  { id: "twilight_lace", name: "Twilight Lace", category: "Lace", description: "Deep lavender threads from the gloaming hour.", icon: "🟣", baseValue: 3, spinTime: 3 },
  { id: "moonlace", name: "Moonlace", category: "Lace", description: "Silver-white threads illuminated by moonlight.", icon: "🌙", baseValue: 4, spinTime: 3 },
  // Brocade (5)
  { id: "gold_brocade", name: "Gold Brocade", category: "Brocade", description: "Heavy luxurious fabric woven from sunrise gold.", icon: "✨", baseValue: 5, spinTime: 4 },
  { id: "thunder_brocade", name: "Thunder Brocade", category: "Brocade", description: "Resilient fabric charged with storm energy.", icon: "🌩️", baseValue: 6, spinTime: 5 },
  { id: "sky_brocade", name: "Sky Brocade", category: "Brocade", description: "Impossibly light fabric strong enough to fly.", icon: "☁️", baseValue: 4, spinTime: 4 },
  { id: "coral_brocade", name: "Coral Brocade", category: "Brocade", description: "Warm-toned fabric from horizon cloud bands.", icon: "🪸", baseValue: 5, spinTime: 4 },
  { id: "diamond_brocade", name: "Diamond Brocade", category: "Brocade", description: "Crystalline fabric that refracts all light.", icon: "💎", baseValue: 8, spinTime: 7 },
  // Gauze (5)
  { id: "breath_gauze", name: "Breath Gauze", category: "Gauze", description: "Nearly invisible fabric lighter than air.", icon: "💨", baseValue: 2, spinTime: 2 },
  { id: "dew_gauze", name: "Dew Gauze", category: "Gauze", description: "Moisture-laden fabric from morning dew clouds.", icon: "💧", baseValue: 1, spinTime: 1 },
  { id: "dream_gauze", name: "Dream Gauze", category: "Gauze", description: "Fabric that hums with lullaby frequencies.", icon: "💤", baseValue: 4, spinTime: 3 },
  { id: "prism_gauze", name: "Prism Gauze", category: "Gauze", description: "Transparent fabric that splits light into spectra.", icon: "🔆", baseValue: 5, spinTime: 4 },
  { id: "void_gauze", name: "Void Gauze", category: "Gauze", description: "Dark fabric that absorbs light and sound.", icon: "🕳️", baseValue: 7, spinTime: 6 },
  // Tapestry (5)
  { id: "dawn_tapestry", name: "Dawn Tapestry", category: "Tapestry", description: "A woven scene of perpetual sunrise.", icon: "🌅", baseValue: 6, spinTime: 5 },
  { id: "wind_tapestry", name: "Wind Tapestry", category: "Tapestry", description: "Animated fabric that ripples without wind.", icon: "🌀", baseValue: 5, spinTime: 4 },
  { id: "island_tapestry", name: "Island Tapestry", category: "Tapestry", description: "A map of all discovered sky islands.", icon: "🗺️", baseValue: 8, spinTime: 6 },
  { id: "story_tapestry", name: "Story Tapestry", category: "Tapestry", description: "Fabric that records the weaver's adventures.", icon: "📖", baseValue: 7, spinTime: 5 },
  { id: "cosmos_tapestry", name: "Cosmos Tapestry", category: "Tapestry", description: "A fabric showing the entire sky realm.", icon: "🌌", baseValue: 10, spinTime: 8 },
  // Filigree (5)
  { id: "sun_filigree", name: "Sun Filigree", category: "Filigree", description: "Golden wirework shaped like sun rays.", icon: "☀️", baseValue: 6, spinTime: 5 },
  { id: "feather_filigree", name: "Feather Filigree", category: "Filigree", description: "Delicate wirework mimicking cloud creature plumage.", icon: "🪶", baseValue: 4, spinTime: 3 },
  { id: "crystal_filigree", name: "Crystal Filigree", category: "Filigree", description: "Geometric wirework of frozen cloud crystals.", icon: "🔷", baseValue: 5, spinTime: 4 },
  { id: "echo_filigree", name: "Echo Filigree", category: "Filigree", description: "Wirework that sings with wind vibrations.", icon: "🎵", baseValue: 7, spinTime: 6 },
  { id: "eternity_filigree", name: "Eternity Filigree", category: "Filigree", description: "Unbreakable wirework that never tarnishes.", icon: "♾️", baseValue: 9, spinTime: 7 },
];

export const CS_ISLANDS: CsIslandDef[] = [
  {
    id: "dawn_peak", name: "Dawn Peak", altitude: 1200,
    primaryThread: "morning_silk", secondaryThread: "rose_silk",
    windPattern: "First Light Breeze", unlockLevel: 1, unlockCost: 0,
    maxStructures: 6, description: "The cradle of every Strand Weaver. Perpetual sunrise bathes its peaks in pink gold.", color: "#FFB6C1",
  },
  {
    id: "twilight_grove", name: "Twilight Grove", altitude: 2400,
    primaryThread: "twilight_lace", secondaryThread: "dream_gauze",
    windPattern: "Gloaming Drift", unlockLevel: 4, unlockCost: 150,
    maxStructures: 8, description: "A grove of luminescent cloud-trees that glow lavender at dusk.", color: "#B39DDB",
  },
  {
    id: "horizon_bay", name: "Horizon Bay", altitude: 1800,
    primaryThread: "coral_brocade", secondaryThread: "dew_gauze",
    windPattern: "Tidal Winds", unlockLevel: 7, unlockCost: 400,
    maxStructures: 8, description: "A vast cloud inlet where the sea of sky meets the horizon.", color: "#FFD700",
  },
  {
    id: "zephyr_meadows", name: "Zephyr Meadows", altitude: 900,
    primaryThread: "breath_gauze", secondaryThread: "frost_lace",
    windPattern: "Whispering Zephyrs", unlockLevel: 3, unlockCost: 80,
    maxStructures: 6, description: "Rolling cloud-fields where gentle zephyrs weave wildflowers into threads.", color: "#87CEEB",
  },
  {
    id: "prism_atoll", name: "Prism Atoll", altitude: 3200,
    primaryThread: "prism_gauze", secondaryThread: "aurora_lace",
    windPattern: "Refracting Gusts", unlockLevel: 10, unlockCost: 900,
    maxStructures: 10, description: "An atoll of crystallized light that splits every breeze into color.", color: "#F8F8FF",
  },
  {
    id: "storm_needle", name: "Storm Needle", altitude: 5500,
    primaryThread: "storm_silk", secondaryThread: "thunder_brocade",
    windPattern: "Perpetual Tempest", unlockLevel: 15, unlockCost: 2000,
    maxStructures: 10, description: "A needle-thin spire that draws lightning from passing storms.", color: "#5C6BC0",
  },
  {
    id: "aurora_crest", name: "Aurora Crest", altitude: 6800,
    primaryThread: "aurora_lace", secondaryThread: "celestial_silk",
    windPattern: "Polar Light Winds", unlockLevel: 20, unlockCost: 4000,
    maxStructures: 12, description: "A crest that eternally crowns the sky with dancing aurora lights.", color: "#69F0AE",
  },
  {
    id: "sunrise_sanctum", name: "Sunrise Sanctum", altitude: 8000,
    primaryThread: "sun_filigree", secondaryThread: "gold_brocade",
    windPattern: "Radiant Updrafts", unlockLevel: 28, unlockCost: 8000,
    maxStructures: 14, description: "The legendary sanctum where the first sunrise was woven into existence.", color: "#FFD700",
  },
];

export const CS_STRUCTURES: CsStructureDef[] = [
  // Spinning Structures (7)
  { id: "silk_spinner", name: "Silk Spinner", category: "spinning", baseCost: { coins: 40, morning_silk: 5 }, maxLevel: 10, productionPerHour: { morning_silk: 3 }, description: "A delicate wheel that spins raw clouds into silk threads.", upgradeMultiplier: 1.35 },
  { id: "lace_loom", name: "Lace Loom", category: "spinning", baseCost: { coins: 80, frost_lace: 5 }, maxLevel: 10, productionPerHour: { frost_lace: 2 }, description: "An intricate loom that weaves frost into delicate lace.", upgradeMultiplier: 1.35 },
  { id: "brocade_forge", name: "Brocade Forge", category: "spinning", baseCost: { coins: 120, gold_brocade: 3 }, maxLevel: 10, productionPerHour: { gold_brocade: 1 }, description: "A forge that presses golden cloud matter into rich brocade.", upgradeMultiplier: 1.4 },
  { id: "gauze_weaver", name: "Gauze Weaver", category: "spinning", baseCost: { coins: 60, breath_gauze: 8 }, maxLevel: 10, productionPerHour: { breath_gauze: 4 }, description: "Spreads clouds impossibly thin to create ethereal gauze.", upgradeMultiplier: 1.3 },
  { id: "tapestry_frame", name: "Tapestry Frame", category: "spinning", baseCost: { coins: 200, dawn_tapestry: 2 }, maxLevel: 10, productionPerHour: { dawn_tapestry: 1 }, description: "A massive frame where all thread types are woven into tapestries.", upgradeMultiplier: 1.45 },
  { id: "filigree_workshop", name: "Filigree Workshop", category: "spinning", baseCost: { coins: 150, sun_filigree: 3 }, maxLevel: 10, productionPerHour: { sun_filigree: 1 }, description: "Shapes thin metal-like threads into ornate filigree patterns.", upgradeMultiplier: 1.4 },
  { id: "thread_distillery", name: "Thread Distillery", category: "spinning", baseCost: { coins: 100, cirrus_silk: 5 }, maxLevel: 10, productionPerHour: { cirrus_silk: 2, rose_silk: 1 }, description: "Distills raw atmospheric moisture into high-grade threads.", upgradeMultiplier: 1.35 },
  // Wind Structures (6)
  { id: "wind_catcher", name: "Wind Catcher", category: "wind", baseCost: { coins: 50, morning_silk: 10 }, maxLevel: 10, productionPerHour: { wind: 2 }, description: "A windmill-like structure that captures wind energy.", upgradeMultiplier: 1.3 },
  { id: "breeze_bell", name: "Breeze Bell", category: "wind", baseCost: { coins: 90, breath_gauze: 10 }, maxLevel: 10, productionPerHour: { wind: 3 }, description: "A resonant bell rung by every passing breeze.", upgradeMultiplier: 1.3 },
  { id: "zephyr_tower", name: "Zephyr Tower", category: "wind", baseCost: { coins: 140, twilight_lace: 8 }, maxLevel: 10, productionPerHour: { wind: 4 }, description: "A tall tower that channels zephyr winds to ground level.", upgradeMultiplier: 1.35 },
  { id: "tempest_vane", name: "Tempest Vane", category: "wind", baseCost: { coins: 200, storm_silk: 5 }, maxLevel: 10, productionPerHour: { wind: 5 }, description: "A weather vane that attracts storm winds for harvest.", upgradeMultiplier: 1.4 },
  { id: "dawn_chime", name: "Dawn Chime", category: "wind", baseCost: { coins: 300, sun_filigree: 3, dawn_tapestry: 2 }, maxLevel: 10, productionPerHour: { wind: 6 }, description: "Sacred chimes that only sound at sunrise, generating massive wind.", upgradeMultiplier: 1.45 },
  { id: "ethereal_condenser", name: "Ethereal Condenser", category: "wind", baseCost: { coins: 250, aurora_lace: 4 }, maxLevel: 10, productionPerHour: { wind: 5 }, description: "Condenses otherworldly wind energy from thin air.", upgradeMultiplier: 1.4 },
  // Utility Structures (6)
  { id: "cloud_garden", name: "Cloud Garden", category: "utility", baseCost: { coins: 60, dew_gauze: 8 }, maxLevel: 10, productionPerHour: { coins: 5 }, description: "Grows enchanted sky-flowers that yield bonus coins.", upgradeMultiplier: 1.25 },
  { id: "wind_library", name: "Wind Library", category: "utility", baseCost: { coins: 100, moonlace: 5 }, maxLevel: 10, productionPerHour: { wind: 2 }, description: "Stores wind knowledge, passively generating wind energy.", upgradeMultiplier: 1.3 },
  { id: "thread_vault", name: "Thread Vault", category: "utility", baseCost: { coins: 150, sky_brocade: 5 }, maxLevel: 10, productionPerHour: {}, description: "Protects valuable threads. Increases storage capacity per level.", upgradeMultiplier: 1.4 },
  { id: "sunrise_shrine", name: "Sunrise Shrine", category: "utility", baseCost: { coins: 200, gold_brocade: 8, sun_filigree: 3 }, maxLevel: 10, productionPerHour: { coins: 15 }, description: "A shrine to the eternal sunrise, granting blessings.", upgradeMultiplier: 1.35 },
  { id: "creature_nest", name: "Creature Nest", category: "utility", baseCost: { coins: 120, feather_filigree: 6 }, maxLevel: 10, productionPerHour: {}, description: "Houses befriended cloud creatures. Each level shelters 2 more.", upgradeMultiplier: 1.3 },
  { id: "sky_anchor", name: "Sky Anchor", category: "utility", baseCost: { coins: 300, diamond_brocade: 3 }, maxLevel: 10, productionPerHour: {}, description: "Anchors your islands in place during severe storms.", upgradeMultiplier: 1.5 },
  // Special Structures (6)
  { id: "weaver_sanctum", name: "Weaver's Sanctum", category: "special", baseCost: { coins: 500, dawn_tapestry: 5, cosmos_tapestry: 2, sun_filigree: 5 }, maxLevel: 10, productionPerHour: { coins: 30 }, description: "The heart of every weaver's domain. Boosts all production.", upgradeMultiplier: 1.6 },
  { id: "wind_bridge", name: "Wind Bridge", category: "special", baseCost: { coins: 400, storm_silk: 15, sky_brocade: 10 }, maxLevel: 10, productionPerHour: {}, description: "Connects islands with bridges of solidified wind.", upgradeMultiplier: 1.5 },
  { id: "dawn_beacon", name: "Dawn Beacon", category: "special", baseCost: { coins: 350, gold_brocade: 10, rose_silk: 20 }, maxLevel: 10, productionPerHour: { morning_silk: 5 }, description: "Emits a beam of dawn light that accelerates thread growth.", upgradeMultiplier: 1.45 },
  { id: "aurora_mirror", name: "Aurora Mirror", category: "special", baseCost: { coins: 600, aurora_lace: 10, celestial_silk: 5 }, maxLevel: 10, productionPerHour: { aurora_lace: 3 }, description: "Reflects aurora light to create rare threads.", upgradeMultiplier: 1.55 },
  { id: "cloud_distillery", name: "Cloud Distillery", category: "special", baseCost: { coins: 450, breath_gauze: 20, mist_lace: 15 }, maxLevel: 10, productionPerHour: { breath_gauze: 8 }, description: "Distills clouds into purest thread materials.", upgradeMultiplier: 1.4 },
  { id: "strands_of_fate", name: "Strands of Fate", category: "special", baseCost: { coins: 800, eternity_filigree: 5, cosmos_tapestry: 3, celestial_silk: 5 }, maxLevel: 10, productionPerHour: { coins: 50 }, description: "The ultimate structure. Weaves destiny itself into thread.", upgradeMultiplier: 2.0 },
];

export const CS_CREATURES: CsCreatureDef[] = [
  // Common (7)
  { id: "puff_lamb", name: "Puff Lamb", cloudType: "Cumulus", rarity: "Common", windPower: 3, grace: 5, abilities: ["Fluffy Shield", "Gentle Bounce"], description: "A lamb made of cotton-candy cumulus clouds. Adores sunrise naps." },
  { id: "thread_sparrow", name: "Thread Sparrow", cloudType: "Cirrus", rarity: "Common", windPower: 5, grace: 4, abilities: ["Thread Nest", "Swift Dart"], description: "A tiny bird that lines its nest with stolen cloud threads." },
  { id: "mist_kitten", name: "Mist Kitten", cloudType: "Stratus", rarity: "Common", windPower: 2, grace: 7, abilities: ["Mist Purr", "Invisible Pounce"], description: "A playful kitten that fades into mist when startled." },
  { id: "dew_beetle", name: "Dew Beetle", cloudType: "Zephyr", rarity: "Common", windPower: 4, grace: 3, abilities: ["Dew Shell", "Rolling Wind"], description: "A shiny beetle that collects morning dew in its shell." },
  { id: "breeze_fox", name: "Breeze Fox", cloudType: "Zephyr", rarity: "Common", windPower: 6, grace: 5, abilities: ["Tailwind Dash", "Cloud Fluff"], description: "A swift fox that rides breeze currents between islands." },
  { id: "glow_moth", name: "Glow Moth", cloudType: "Auroral", rarity: "Common", windPower: 3, grace: 6, abilities: ["Luminescent Dust", "Dawn Dance"], description: "A moth whose wings hold the colors of approaching sunrise." },
  { id: "cloud_frog", name: "Cloud Frog", cloudType: "Cumulus", rarity: "Common", windPower: 2, grace: 4, abilities: ["Rain Croak", "Cloud Hop"], description: "A amphibian that swims through fluffy cumulus banks." },
  // Unusual (7)
  { id: "silkworm_sky", name: "Sky Silkworm", cloudType: "Gossamer", rarity: "Unusual", windPower: 4, grace: 8, abilities: ["Thread Spin", "Cocoon Shield"], description: "A giant silkworm that produces the finest cloud silk." },
  { id: "gale_hawk", name: "Gale Hawk", cloudType: "Nimbus", rarity: "Unusual", windPower: 12, grace: 7, abilities: ["Gale Dive", "Storm Screech"], description: "A hawk that rides gale-force winds between sky islands." },
  { id: "prism_deer", name: "Prism Deer", cloudType: "Prism", rarity: "Unusual", windPower: 6, grace: 12, abilities: ["Prism Antlers", "Light Step"], description: "A deer whose crystalline antlers refract dawn light." },
  { id: "twilight_owl", name: "Twilight Owl", cloudType: "Twilight", rarity: "Unusual", windPower: 8, grace: 10, abilities: ["Night Vision", "Silent Glide"], description: "A wise owl that sees through the darkest twilight clouds." },
  { id: "dawn_serpent", name: "Dawn Serpent", cloudType: "Dawn", rarity: "Unusual", windPower: 10, grace: 9, abilities: ["Sunrise Coil", "Radiant Scales"], description: "A serpent that awakens only during the first light of dawn." },
  { id: "breeze_dolphin", name: "Breeze Dolphin", cloudType: "Zephyr", rarity: "Unusual", windPower: 9, grace: 11, abilities: ["Wind Surf", "Cloud Song"], description: "A dolphin that leaps between cloud waves on wind currents." },
  { id: "aurora_fox", name: "Aurora Fox", cloudType: "Auroral", rarity: "Unusual", windPower: 7, grace: 13, abilities: ["Color Shift", "Aurora Trail"], description: "A fox whose fur shifts through aurora colors as it runs." },
  // Rare (7)
  { id: "thunder_manta", name: "Thunder Manta", cloudType: "Nimbus", rarity: "Rare", windPower: 18, grace: 14, abilities: ["Thunder Glide", "Storm Wing", "Electric Touch"], description: "A massive ray that swims through thunderstorms with effortless grace." },
  { id: "sunrise_phoenix", name: "Sunrise Phoenix", cloudType: "Dawn", rarity: "Rare", windPower: 22, grace: 18, abilities: ["Phoenix Flame", "Rebirth", "Dawn Cry"], description: "A phoenix reborn each morning from the first rays of sunlight." },
  { id: "crystal_horse", name: "Crystal Horse", cloudType: "Prism", rarity: "Rare", windPower: 16, grace: 20, abilities: ["Prism Gallop", "Diamond Hooves", "Light Charge"], description: "A horse made of living crystal that runs on beams of light." },
  { id: "stratus_dragon", name: "Stratus Dragon", cloudType: "Stratus", rarity: "Rare", windPower: 24, grace: 15, abilities: ["Cloud Breath", "Fog Veil", "Mist Command"], description: "A dragon that commands the thickest stratus cloud layers." },
  { id: "zephyr_griffin", name: "Zephyr Griffin", cloudType: "Zephyr", rarity: "Rare", windPower: 20, grace: 19, abilities: ["Zephyr Dive", "Wind Shield", "Sky Hunt"], description: "A noble griffin that rules the highest zephyr currents." },
  { id: "gossamer_spider", name: "Gossamer Spider", cloudType: "Gossamer", rarity: "Rare", windPower: 8, grace: 25, abilities: ["Silk Web", "Thread Bind", "Weaver's Blessing"], description: "A spider that spins threads of unmatched delicacy and strength." },
  { id: "dawn_lion", name: "Dawn Lion", cloudType: "Dawn", rarity: "Rare", windPower: 26, grace: 16, abilities: ["Solar Roar", "Golden Mane", "First Light"], description: "A lion whose mane blazes with the colors of dawn." },
  // Epic (7)
  { id: "tempest_whale", name: "Tempest Whale", cloudType: "Nimbus", rarity: "Epic", windPower: 35, grace: 28, abilities: ["Tempest Song", "Hurricane Tail", "Cloud Ocean", "Storm Heart"], description: "A leviathan that creates storms with its haunting song." },
  { id: "aurora_swan", name: "Aurora Swan", cloudType: "Auroral", rarity: "Epic", windPower: 30, grace: 38, abilities: ["Aurora Dance", "Prism Wings", "Elegant Glide", "Sky Crown"], description: "A swan whose dance paints aurora across the entire sky." },
  { id: "dawn_unicorn", name: "Dawn Unicorn", cloudType: "Dawn", rarity: "Epic", windPower: 32, grace: 35, abilities: ["Sunrise Horn", "Thread Weave", "Healing Light", "Ethereal Gallop"], description: "A unicorn woven from the first light of the world's dawn." },
  { id: "twilight_sphinx", name: "Twilight Sphinx", cloudType: "Twilight", rarity: "Epic", windPower: 28, grace: 40, abilities: ["Riddle Wind", "Dusk Riddle", "Shadow Thread", "Eternal Gaze"], description: "A sphinx that poses riddles woven from twilight threads." },
  { id: "prism_kirin", name: "Prism Kirin", cloudType: "Prism", rarity: "Epic", windPower: 34, grace: 33, abilities: ["Prism Charge", "Light Storm", "Crystal Scales", "Spectrum Burst"], description: "A kirin whose crystalline body refracts all light into power." },
  { id: "gossamer_queen", name: "Gossamer Queen", cloudType: "Gossamer", rarity: "Epic", windPower: 20, grace: 45, abilities: ["Perfect Silk", "Thread Dominion", "Weaver's Crown", "Fabric Reality"], description: "The queen of all silk-spinning creatures, master of every thread." },
  { id: "sky_leviathan", name: "Sky Leviathan", cloudType: "Stratus", rarity: "Epic", windPower: 40, grace: 25, abilities: ["Cloud Devour", "Mist Form", "Atmosphere", "Skyquake"], description: "A creature so vast it is mistaken for stratus cloud banks." },
  // Legendary (7)
  { id: "first_dawn", name: "The First Dawn", cloudType: "Dawn", rarity: "Legendary", windPower: 55, grace: 60, abilities: ["Genesis Light", "Eternal Sunrise", "Time Weave", "Dawn's Authority"], description: "The primordial entity that wove the first sunrise from nothingness." },
  { id: "weaver_god", name: "Weaver God Arachne", cloudType: "Gossamer", rarity: "Legendary", windPower: 50, grace: 70, abilities: ["Fate Thread", "Reality Loom", "Infinity Silk", "Creator's Hands"], description: "The divine spider who wove the sky from a single eternal thread." },
  { id: "storm_sovereign", name: "Storm Sovereign", cloudType: "Nimbus", rarity: "Legendary", windPower: 65, grace: 45, abilities: ["Absolute Storm", "Wind Emperor", "Sky Breaker", "Tempest Domain"], description: "The ruler of all storms, whose breath creates hurricanes." },
  { id: "prism_origin", name: "Prism Origin", cloudType: "Prism", rarity: "Legendary", windPower: 48, grace: 65, abilities: ["White Light", "Color Genesis", "Prism World", "Spectrum Lord"], description: "The source of all color in the sky, a living prism of pure creation." },
  { id: "aurora_mother", name: "Aurora Mother", cloudType: "Auroral", rarity: "Legendary", windPower: 42, grace: 72, abilities: ["Sky Paint", "Northern Light", "Color of Souls", "Eternal Dance"], description: "The mother of all aurora, whose dance creates the northern lights." },
  { id: "twilight_eternal", name: "Twilight Eternal", cloudType: "Twilight", rarity: "Legendary", windPower: 58, grace: 55, abilities: ["Endless Dusk", "Dream Thread", "Shadow Aurora", "Lavender Kingdom"], description: "A creature that exists in the eternal moment between day and night." },
  { id: "zephyr_lord", name: "Zephyr Lord", cloudType: "Zephyr", rarity: "Legendary", windPower: 70, grace: 50, abilities: ["Breath of World", "Wind Sovereign", "Sky Wanderer", "Cloud Shepherd"], description: "The master of all winds, who shepherds clouds across infinity." },
];

export const CS_WIND_ABILITIES: CsWindAbilityDef[] = [
  // Breeze (4)
  { id: "gentle_breeze", name: "Gentle Breeze", school: "Breeze", windCost: 3, power: 6, cooldown: 1, description: "A soft breeze that nudges clouds into spinning position.", rarity: "Common", unlockLevel: 1, effectType: "spin_boost" },
  { id: "morning_gust", name: "Morning Gust", school: "Breeze", windCost: 6, power: 10, cooldown: 2, description: "A warm gust carrying the scent of dawn flowers.", rarity: "Common", unlockLevel: 2, effectType: "thread_collect" },
  { id: "petal_wind", name: "Petal Wind", school: "Breeze", windCost: 12, power: 16, cooldown: 3, description: "Scatters rose-silk petals that enchant nearby creatures.", rarity: "Unusual", unlockLevel: 6, effectType: "charm" },
  { id: "dawn_zephyr", name: "Dawn Zephyr", school: "Breeze", windCost: 22, power: 25, cooldown: 5, description: "A blessed zephyr that accelerates thread spinning for all structures.", rarity: "Rare", unlockLevel: 14, effectType: "production_boost" },
  // Gale (4)
  { id: "thread_gale", name: "Thread Gale", school: "Gale", windCost: 5, power: 12, cooldown: 1, description: "A focused gale that sweeps threads from passing clouds.", rarity: "Common", unlockLevel: 1, effectType: "thread_collect" },
  { id: "weaving_wind", name: "Weaving Wind", school: "Gale", windCost: 10, power: 18, cooldown: 2, description: "Wind that automatically weaves collected threads into fabric.", rarity: "Common", unlockLevel: 3, effectType: "auto_weave" },
  { id: "tapestry_tempest", name: "Tapestry Tempest", school: "Gale", windCost: 18, power: 30, cooldown: 4, description: "A tempest that creates a large tapestry from surrounding clouds.", rarity: "Unusual", unlockLevel: 9, effectType: "tapestry_create" },
  { id: "gale_force_weave", name: "Gale Force Weave", school: "Gale", windCost: 35, power: 50, cooldown: 7, description: "Devastating gale that forces clouds into maximum thread production.", rarity: "Rare", unlockLevel: 18, effectType: "max_production" },
  // Zephyr (4)
  { id: "whisper_wind", name: "Whisper Wind", school: "Zephyr", windCost: 4, power: 8, cooldown: 1, description: "A whisper that calms clouds, increasing spin quality.", rarity: "Common", unlockLevel: 1, effectType: "quality_boost" },
  { id: "sky_carrier", name: "Sky Carrier", school: "Zephyr", windCost: 8, power: 14, cooldown: 2, description: "A zephyr that transports resources between islands instantly.", rarity: "Common", unlockLevel: 4, effectType: "transport" },
  { id: "lavender_drift", name: "Lavender Drift", school: "Zephyr", windCost: 15, power: 22, cooldown: 3, description: "A soothing drift that puts creatures at ease for befriending.", rarity: "Unusual", unlockLevel: 8, effectType: "befriend_boost" },
  { id: "zephyr_sanctuary", name: "Zephyr Sanctuary", school: "Zephyr", windCost: 28, power: 40, cooldown: 6, description: "Creates a protective zephyr dome around your islands.", rarity: "Rare", unlockLevel: 16, effectType: "shield" },
  // Tempest (3)
  { id: "wind_shear", name: "Wind Shear", school: "Tempest", windCost: 8, power: 20, cooldown: 2, description: "Violent wind shear that strips rare threads from storm clouds.", rarity: "Common", unlockLevel: 5, effectType: "rare_collect" },
  { id: "storm_weave", name: "Storm Weave", school: "Tempest", windCost: 20, power: 35, cooldown: 4, description: "Channels storm energy into powerful thread-weaving magic.", rarity: "Unusual", unlockLevel: 11, effectType: "power_weave" },
  { id: "tempest_fury", name: "Tempest Fury", school: "Tempest", windCost: 45, power: 65, cooldown: 8, description: "Unleashes the full fury of a tempest to reshape the sky.", rarity: "Epic", unlockLevel: 25, effectType: "sky_reshape" },
  // Ethereal (4)
  { id: "ethereal_touch", name: "Ethereal Touch", school: "Ethereal", windCost: 6, power: 10, cooldown: 2, description: "A touch from beyond that transforms threads into higher grades.", rarity: "Common", unlockLevel: 3, effectType: "thread_upgrade" },
  { id: "void_thread", name: "Void Thread", school: "Ethereal", windCost: 15, power: 24, cooldown: 3, description: "Weaves threads from the void between clouds.", rarity: "Unusual", unlockLevel: 10, effectType: "void_create" },
  { id: "cosmic_weave", name: "Cosmic Weave", school: "Ethereal", windCost: 30, power: 42, cooldown: 6, description: "Draws on cosmic energy to create otherworldly fabrics.", rarity: "Rare", unlockLevel: 20, effectType: "cosmic_fabric" },
  { id: "reality_stitch", name: "Reality Stitch", school: "Ethereal", windCost: 50, power: 70, cooldown: 9, description: "Stitches the fabric of reality itself, gaining ultimate power.", rarity: "Epic", unlockLevel: 32, effectType: "reality_warp" },
  // Dawn (3)
  { id: "sunrise_gleam", name: "Sunrise Gleam", school: "Dawn", windCost: 5, power: 12, cooldown: 1, description: "The first gleam of sunrise, energizing all spinning wheels.", rarity: "Common", unlockLevel: 2, effectType: "spin_boost" },
  { id: "golden_hour", name: "Golden Hour", school: "Dawn", windCost: 16, power: 28, cooldown: 3, description: "The golden hour bathes everything in productive warmth.", rarity: "Unusual", unlockLevel: 12, effectType: "golden_production" },
  { id: "first_light", name: "First Light", school: "Dawn", windCost: 55, power: 80, cooldown: 10, description: "The primordial first light that created the sky. Ultimate dawn ability.", rarity: "Legendary", unlockLevel: 40, effectType: "dawn_ultimate" },
];

export const CS_ACHIEVEMENTS: CsAchievementDef[] = [
  { id: "ach_first_spin", name: "First Thread", description: "Spin your first cloud thread.", condition: "totalThreadsSpun >= 1", reward: 25, icon: "🧵" },
  { id: "ach_windswept", name: "Windswept", description: "Ride the wind between 3 islands.", condition: "totalIslandsDiscovered >= 3", reward: 80, icon: "💨" },
  { id: "ach_weaver_novice", name: "Novice Weaver", description: "Build 5 structures across all islands.", condition: "totalStructuresBuilt >= 5", reward: 60, icon: "🪡" },
  { id: "ach_weaver_master", name: "Master Weaver", description: "Build 25 structures across all islands.", condition: "totalStructuresBuilt >= 25", reward: 300, icon: "🏗️" },
  { id: "ach_creature_friend", name: "Creature Friend", description: "Befriend 5 cloud creatures.", condition: "totalCreaturesBefriended >= 5", reward: 100, icon: "🐾" },
  { id: "ach_creature_lord", name: "Cloud Shepherd", description: "Befriend 15 cloud creatures.", condition: "totalCreaturesBefriended >= 15", reward: 400, icon: "🦁" },
  { id: "ach_legendary_tamer", name: "Legendary Bond", description: "Befriend a Legendary cloud creature.", condition: "has_legendary", reward: 800, icon: "👑" },
  { id: "ach_wind_master", name: "Wind Master", description: "Use 50 wind abilities total.", condition: "totalWindAbilitiesUsed >= 50", reward: 150, icon: "🌬️" },
  { id: "ach_sunrise_10", name: "Dawn Devotee", description: "Harvest 10 sunrises.", condition: "totalSunrisesHarvested >= 10", reward: 120, icon: "🌅" },
  { id: "ach_sunrise_50", name: "Eternal Dawn", description: "Harvest 50 sunrises.", condition: "totalSunrisesHarvested >= 50", reward: 500, icon: "☀️" },
  { id: "ach_all_islands", name: "Sky Cartographer", description: "Discover all 8 sky islands.", condition: "totalIslandsDiscovered >= 8", reward: 1000, icon: "🗺️" },
  { id: "ach_thread_hoarder", name: "Thread Hoarder", description: "Accumulate 500 of any thread type.", condition: "thread_accumulated >= 500", reward: 250, icon: "🧶" },
  { id: "ach_level_25", name: "Dawn Herald", description: "Reach level 25.", condition: "level >= 25", reward: 400, icon: "🌸" },
  { id: "ach_level_50", name: "Strand Weaver", description: "Reach the maximum level of 50.", condition: "level >= 50", reward: 2000, icon: "✨" },
  { id: "ach_quest_10", name: "Quest Scholar", description: "Complete 10 daily quests.", condition: "totalQuestsCompleted >= 10", reward: 200, icon: "📜" },
  { id: "ach_wind_schools", name: "School of Wind", description: "Learn abilities from all 6 wind schools.", condition: "wind_schools_learned >= 6", reward: 600, icon: "🎓" },
  { id: "ach_coins_10k", name: "Sky Tycoon", description: "Accumulate 10,000 coins.", condition: "coins >= 10000", reward: 300, icon: "💰" },
  { id: "ach_structure_10", name: "Architect of Clouds", description: "Upgrade any structure to level 10.", condition: "max_structure_level >= 10", reward: 350, icon: "🏰" },
];

export const CS_DAILY_QUESTS: CsDailyQuestDef[] = [
  { id: "dq01", name: "Morning Spin", description: "Spin 10 threads today.", objectiveType: "spin_threads", objectiveTarget: 10, xpReward: 20, threadReward: { morning_silk: 15 }, coinReward: 30, requiredLevel: 1, category: "spinning" },
  { id: "dq02", name: "Weave the Dawn", description: "Collect 5 rose silk threads.", objectiveType: "collect_thread", objectiveTarget: 5, xpReward: 30, threadReward: { rose_silk: 10 }, coinReward: 50, requiredLevel: 2, category: "collection" },
  { id: "dq03", name: "Wind Rider", description: "Use 5 wind abilities.", objectiveType: "use_abilities", objectiveTarget: 5, xpReward: 25, threadReward: { breath_gauze: 12 }, coinReward: 40, requiredLevel: 3, category: "wind" },
  { id: "dq04", name: "Island Explorer", description: "Visit 2 different islands.", objectiveType: "visit_islands", objectiveTarget: 2, xpReward: 35, threadReward: { cirrus_silk: 10 }, coinReward: 60, requiredLevel: 4, category: "exploration" },
  { id: "dq05", name: "Creature Whisperer", description: "Befriend 1 cloud creature.", objectiveType: "befriend_creature", objectiveTarget: 1, xpReward: 40, threadReward: { feather_filigree: 8 }, coinReward: 70, requiredLevel: 5, category: "creatures" },
  { id: "dq06", name: "Structure Builder", description: "Build or upgrade 3 structures.", objectiveType: "build_structures", objectiveTarget: 3, xpReward: 50, threadReward: { gold_brocade: 5 }, coinReward: 100, requiredLevel: 7, category: "building" },
  { id: "dq07", name: "Thread Master", description: "Spin 25 threads in one day.", objectiveType: "spin_threads", objectiveTarget: 25, xpReward: 60, threadReward: { celestial_silk: 3 }, coinReward: 120, requiredLevel: 10, category: "spinning" },
  { id: "dq08", name: "Sunrise Harvest", description: "Harvest 3 sunrises.", objectiveType: "harvest_sunrise", objectiveTarget: 3, xpReward: 45, threadReward: { sun_filigree: 5 }, coinReward: 80, requiredLevel: 8, category: "sunrise" },
  { id: "dq09", name: "Aurora Collector", description: "Collect 3 aurora lace threads.", objectiveType: "collect_thread", objectiveTarget: 3, xpReward: 55, threadReward: { aurora_lace: 5 }, coinReward: 90, requiredLevel: 12, category: "collection" },
  { id: "dq10", name: "Tempest Rider", description: "Use 3 Tempest school abilities.", objectiveType: "use_school_ability", objectiveTarget: 3, xpReward: 70, threadReward: { storm_silk: 8 }, coinReward: 150, requiredLevel: 15, category: "wind" },
];

// ---------------------------------------------------------------------------
// Seeded PRNG (SSR-safe, no Math.random)
// ---------------------------------------------------------------------------

function csSeededRandom(seed: string): () => number {
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

function csClamp(min: number, max: number, val: number): number {
  return Math.max(min, Math.min(max, val));
}

function csGetTodaySeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function csGetXpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(level, 1.6));
}

function csCalculateLevel(xp: number): number {
  for (let lvl = 1; lvl <= CS_MAX_LEVEL; lvl++) {
    if (xp < csGetXpForLevel(lvl)) return lvl - 1;
  }
  return CS_MAX_LEVEL;
}

function csCalculateTitle(level: number): string {
  let title = CS_TITLE_THRESHOLDS[0].title;
  for (const t of CS_TITLE_THRESHOLDS) {
    if (level >= t.minLevel) {
      title = t.title;
    }
  }
  return title;
}

function csGetStructureCost(structure: CsStructureDef, currentLevel: number): Record<string, number> {
  const multiplier = Math.pow(structure.upgradeMultiplier, currentLevel);
  const cost: Record<string, number> = {};
  for (const [key, val] of Object.entries(structure.baseCost)) {
    cost[key] = Math.ceil(val * multiplier);
  }
  return cost;
}

function csCanAfford(resources: Record<string, number>, coins: number, cost: Record<string, number>): boolean {
  for (const [key, val] of Object.entries(cost)) {
    if (key === "coins") {
      if (coins < val) return false;
    } else {
      if ((resources[key] ?? 0) < val) return false;
    }
  }
  return true;
}

function csSpendResources(resources: Record<string, number>, coins: number, cost: Record<string, number>): { resources: Record<string, number>; coins: number } {
  const newResources = { ...resources };
  let newCoins = coins;
  for (const [key, val] of Object.entries(cost)) {
    if (key === "coins") {
      newCoins -= val;
    } else {
      newResources[key] = (newResources[key] ?? 0) - val;
    }
  }
  return { resources: newResources, coins: newCoins };
}

function csGetIslandThreadProduction(state: CloudStrandState): Record<string, number> {
  const production: Record<string, number> = {};
  for (const island of state.islands) {
    if (!island.discovered) continue;
    for (const structInst of island.structures) {
      const def = CS_STRUCTURES.find(s => s.id === structInst.defId);
      if (!def) continue;
      for (const [res, amount] of Object.entries(def.productionPerHour)) {
        const scaled = Math.ceil(amount * Math.pow(1.12, structInst.level - 1));
        production[res] = (production[res] ?? 0) + scaled;
      }
    }
  }
  return production;
}

function csCreateInitialState(): CloudStrandState {
  const islands: CsIslandState[] = CS_ISLANDS.map(isl => ({
    defId: isl.id,
    unlocked: isl.unlockLevel === 1 && isl.unlockCost === 0,
    discovered: isl.unlockLevel === 1 && isl.unlockCost === 0,
    structures: [],
  }));

  const windAbilities: CsWindAbilityState[] = CS_WIND_ABILITIES.map(abi => ({
    defId: abi.id,
    learned: abi.unlockLevel <= 1,
    castCount: 0,
    cooldownRemaining: 0,
  }));

  const initialThreads: Record<string, number> = {};
  for (const t of CS_THREADS) {
    initialThreads[t.id] = 0;
  }

  return {
    level: 1,
    xp: 0,
    coins: 100,
    wind: 50,
    maxWind: 50,
    islands,
    structures: islands.flatMap(i => i.structures),
    creatures: CS_CREATURES.map(c => ({
      defId: c.id,
      befriended: false,
      nickname: "",
      level: 1,
    })),
    windAbilities,
    threads: initialThreads,
    achievements: [],
    streak: 0,
    lastDaily: null,
    daily: {
      dateSeed: csGetTodaySeed(),
      sunriseHarvested: false,
      harvestTarget: 5,
      harvestProgress: 0,
      rewardClaimed: false,
      questAccepted: false,
      questCompleted: false,
      questProgress: 0,
    },
    stats: {
      totalIslandsDiscovered: 1,
      totalThreadsSpun: 0,
      totalStructuresBuilt: 0,
      totalWindAbilitiesUsed: 0,
      totalCreaturesBefriended: 0,
      totalQuestsCompleted: 0,
      totalCoinsEarned: 100,
      totalXPEarned: 0,
      totalSunrisesHarvested: 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Main Hook
// ---------------------------------------------------------------------------

export default function useCloudStrand() {
  const stateRef = useRef<CloudStrandState | null>(null);
  const _initialState = csCreateInitialState();

  const [state, setState] = useState<CloudStrandState>(_initialState);

  // Keep stateRef synced inside useEffect only
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const updateState = useCallback((updater: (prev: CloudStrandState) => CloudStrandState) => {
    setState(prev => updater(prev));
  }, []);

  // --- Action callbacks ---

  const addXP = useCallback((amount: number) => {
    updateState(prev => {
      const newState = { ...prev, xp: prev.xp + amount, stats: { ...prev.stats, totalXPEarned: prev.stats.totalXPEarned + amount } };
      const newLevel = csCalculateLevel(newState.xp);
      if (newLevel > newState.level) {
        newState.level = newLevel;
        newState.maxWind = 50 + (newLevel - 1) * 12;
      }
      return newState;
    });
  }, [updateState]);

  const addCoins = useCallback((amount: number) => {
    updateState(prev => ({
      ...prev,
      coins: prev.coins + amount,
      stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + amount },
    }));
  }, [updateState]);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    updateState(prev => {
      if (prev.coins < amount) return prev;
      success = true;
      return { ...prev, coins: prev.coins - amount };
    });
    return success;
  }, [updateState]);

  const addWind = useCallback((amount: number) => {
    updateState(prev => ({
      ...prev,
      wind: Math.min(prev.maxWind, prev.wind + amount),
    }));
  }, [updateState]);

  const spendWind = useCallback((amount: number): boolean => {
    let success = false;
    updateState(prev => {
      if (prev.wind < amount) return prev;
      success = true;
      return { ...prev, wind: prev.wind - amount };
    });
    return success;
  }, [updateState]);

  const spinCloud = useCallback((threadId: string, amount: number = 1) => {
    updateState(prev => {
      const def = CS_THREADS.find(t => t.id === threadId);
      if (!def) return prev;
      const newThreads = { ...prev.threads, [threadId]: (prev.threads[threadId] ?? 0) + amount };
      return {
        ...prev,
        threads: newThreads,
        stats: { ...prev.stats, totalThreadsSpun: prev.stats.totalThreadsSpun + amount },
      };
    });
  }, [updateState]);

  const weaveThread = useCallback((inputThreadIds: string[], outputThreadId: string) => {
    updateState(prev => {
      const outputDef = CS_THREADS.find(t => t.id === outputThreadId);
      if (!outputDef) return prev;
      // Check we have enough of each input thread
      const newThreads = { ...prev.threads };
      for (const tid of inputThreadIds) {
        if ((newThreads[tid] ?? 0) < 2) return prev;
      }
      for (const tid of inputThreadIds) {
        newThreads[tid] = (newThreads[tid] ?? 0) - 2;
      }
      newThreads[outputThreadId] = (newThreads[outputThreadId] ?? 0) + 1;
      return { ...prev, threads: newThreads, stats: { ...prev.stats, totalThreadsSpun: prev.stats.totalThreadsSpun + 1 } };
    });
  }, [updateState]);

  const discoverIsland = useCallback((islandId: string) => {
    updateState(prev => {
      const def = CS_ISLANDS.find(i => i.id === islandId);
      if (!def) return prev;
      const existing = prev.islands.find(i => i.defId === islandId);
      if (!existing || existing.discovered) return prev;
      if (prev.level < def.unlockLevel) return prev;
      if (prev.coins < def.unlockCost) return prev;
      const newIslands = prev.islands.map(i =>
        i.defId === islandId ? { ...i, unlocked: true, discovered: true } : i
      );
      return {
        ...prev,
        islands: newIslands,
        coins: prev.coins - def.unlockCost,
        stats: { ...prev.stats, totalIslandsDiscovered: prev.stats.totalIslandsDiscovered + 1 },
      };
    });
  }, [updateState]);

  const buildStructure = useCallback((islandId: string, structureId: string) => {
    updateState(prev => {
      const structDef = CS_STRUCTURES.find(s => s.id === structureId);
      const islandDef = CS_ISLANDS.find(i => i.id === islandId);
      const islandState = prev.islands.find(i => i.defId === islandId);
      if (!structDef || !islandState || !islandDef) return prev;
      if (!islandState.discovered) return prev;
      if (islandState.structures.length >= islandDef.maxStructures) return prev;
      const cost = csGetStructureCost(structDef, 1);
      if (!csCanAfford(prev.threads, prev.coins, cost)) return prev;
      const newStructure: CsStructureInstance = { defId: structureId, islandId, level: 1 };
      const newIslands = prev.islands.map(i =>
        i.defId === islandId ? { ...i, structures: [...i.structures, newStructure] } : i
      );
      const spent = csSpendResources(prev.threads, prev.coins, cost);
      return {
        ...prev,
        islands: newIslands,
        threads: spent.resources,
        coins: spent.coins,
        stats: { ...prev.stats, totalStructuresBuilt: prev.stats.totalStructuresBuilt + 1 },
      };
    });
  }, [updateState]);

  const upgradeStructure = useCallback((islandId: string, structureIndex: number) => {
    updateState(prev => {
      const islandState = prev.islands.find(i => i.defId === islandId);
      if (!islandState) return prev;
      if (structureIndex < 0 || structureIndex >= islandState.structures.length) return prev;
      const structInst = islandState.structures[structureIndex];
      const structDef = CS_STRUCTURES.find(s => s.id === structInst.defId);
      if (!structDef) return prev;
      if (structInst.level >= structDef.maxLevel) return prev;
      const cost = csGetStructureCost(structDef, structInst.level + 1);
      if (!csCanAfford(prev.threads, prev.coins, cost)) return prev;
      const upgraded = { ...structInst, level: structInst.level + 1 };
      const newStructures = [...islandState.structures];
      newStructures[structureIndex] = upgraded;
      const newIslands = prev.islands.map(i =>
        i.defId === islandId ? { ...i, structures: newStructures } : i
      );
      const spent = csSpendResources(prev.threads, prev.coins, cost);
      return { ...prev, islands: newIslands, threads: spent.resources, coins: spent.coins };
    });
  }, [updateState]);

  const befriendCreature = useCallback((creatureId: string) => {
    updateState(prev => {
      const def = CS_CREATURES.find(c => c.id === creatureId);
      if (!def) return prev;
      const existing = prev.creatures.find(c => c.defId === creatureId);
      if (existing && existing.befriended) return prev;
      const rng = csSeededRandom(`befriend-${creatureId}-${Date.now()}`);
      const graceBonus = prev.level * 0.02;
      const successChance = Math.min(0.95, 0.3 + graceBonus + (def.grace * 0.015));
      if (rng() > successChance) return prev;
      const cost = def.windPower * 15;
      if (prev.wind < cost) return prev;
      const newCreatures = prev.creatures.map(c =>
        c.defId === creatureId ? { ...c, befriended: true, level: 1 } : c
      );
      return {
        ...prev,
        creatures: newCreatures,
        wind: prev.wind - cost,
        stats: { ...prev.stats, totalCreaturesBefriended: prev.stats.totalCreaturesBefriended + 1 },
      };
    });
  }, [updateState]);

  const learnWindAbility = useCallback((abilityId: string) => {
    updateState(prev => {
      const def = CS_WIND_ABILITIES.find(a => a.id === abilityId);
      if (!def) return prev;
      if (prev.level < def.unlockLevel) return prev;
      const existing = prev.windAbilities.find(a => a.defId === abilityId);
      if (existing && existing.learned) return prev;
      const cost = def.windCost * 3;
      if (prev.wind < cost) return prev;
      const newAbilities = prev.windAbilities.map(a =>
        a.defId === abilityId ? { ...a, learned: true } : a
      );
      return { ...prev, windAbilities: newAbilities, wind: prev.wind - cost };
    });
  }, [updateState]);

  const useWindAbility = useCallback((abilityId: string) => {
    updateState(prev => {
      const def = CS_WIND_ABILITIES.find(a => a.id === abilityId);
      const abilityState = prev.windAbilities.find(a => a.defId === abilityId);
      if (!def || !abilityState || !abilityState.learned) return prev;
      if (abilityState.cooldownRemaining > 0) return prev;
      if (prev.wind < def.windCost) return prev;
      const newAbilities = prev.windAbilities.map(a =>
        a.defId === abilityId ? { ...a, castCount: a.castCount + 1, cooldownRemaining: def.cooldown } : a
      );
      const xpGain = def.power;
      const coinGain = Math.floor(def.power * 0.5);
      return {
        ...prev,
        windAbilities: newAbilities,
        wind: prev.wind - def.windCost,
        xp: prev.xp + xpGain,
        coins: prev.coins + coinGain,
        stats: {
          ...prev.stats,
          totalWindAbilitiesUsed: prev.stats.totalWindAbilitiesUsed + 1,
          totalXPEarned: prev.stats.totalXPEarned + xpGain,
          totalCoinsEarned: prev.stats.totalCoinsEarned + coinGain,
        },
      };
    });
  }, [updateState]);

  const harvestSunrise = useCallback((increment: number = 1) => {
    updateState(prev => {
      const newDaily = { ...prev.daily, harvestProgress: prev.daily.harvestProgress + increment };
      if (newDaily.harvestProgress >= newDaily.harvestTarget) {
        newDaily.sunriseHarvested = true;
        newDaily.harvestProgress = newDaily.harvestTarget;
      }
      return {
        ...prev,
        daily: newDaily,
        threads: { ...prev.threads, morning_silk: (prev.threads.morning_silk ?? 0) + increment },
        stats: { ...prev.stats, totalSunrisesHarvested: prev.stats.totalSunrisesHarvested + increment },
      };
    });
  }, [updateState]);

  const claimDailyReward = useCallback(() => {
    updateState(prev => {
      if (prev.daily.rewardClaimed) return prev;
      if (!prev.daily.sunriseHarvested) return prev;
      return {
        ...prev,
        daily: { ...prev.daily, rewardClaimed: true },
        coins: prev.coins + 100 + prev.level * 10,
        xp: prev.xp + 50 + prev.level * 5,
        threads: {
          ...prev.threads,
          morning_silk: (prev.threads.morning_silk ?? 0) + 20,
          rose_silk: (prev.threads.rose_silk ?? 0) + 10,
        },
      };
    });
  }, [updateState]);

  const resetDaily = useCallback(() => {
    updateState(prev => {
      const today = csGetTodaySeed();
      if (prev.daily.dateSeed === today && prev.lastDaily === today) return prev;
      const rng = csSeededRandom(`daily-${today}`);
      const questIdx = Math.floor(rng() * CS_DAILY_QUESTS.length);
      const quest = CS_DAILY_QUESTS[questIdx];
      const streak = prev.lastDaily
        ? (function () {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const ySeed = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
            return prev.lastDaily === ySeed ? prev.streak + 1 : 1;
          })()
        : 1;
      return {
        ...prev,
        daily: {
          dateSeed: today,
          sunriseHarvested: false,
          harvestTarget: 5 + Math.floor(prev.level / 5),
          harvestProgress: 0,
          rewardClaimed: false,
          questAccepted: false,
          questCompleted: false,
          questProgress: 0,
        },
        streak,
        lastDaily: today,
      };
    });
  }, [updateState]);

  // --- Computed values via useMemo ---

  const currentTitle = useMemo(() => {
    return csCalculateTitle(state.level);
  }, [state]);

  const currentProgress = useMemo(() => {
    const curXp = csGetXpForLevel(state.level);
    const nextXp = csGetXpForLevel(state.level + 1);
    if (nextXp <= curXp) return 100;
    return Math.floor((state.xp / nextXp) * 100);
  }, [state]);

  const unlockedIslands = useMemo(() => {
    return state.islands.filter(i => i.discovered);
  }, [state]);

  const discoveredIslandDefs = useMemo(() => {
    return CS_ISLANDS.filter(def => {
      const ist = state.islands.find(i => i.defId === def.id);
      return ist && ist.discovered;
    });
  }, [state]);

  const befriendedCreatures = useMemo(() => {
    return state.creatures.filter(c => c.befriended);
  }, [state]);

  const learnedAbilities = useMemo(() => {
    return state.windAbilities.filter(a => a.learned);
  }, [state]);

  const productionRates = useMemo(() => {
    return csGetIslandThreadProduction(state);
  }, [state]);

  const kingdomPower = useMemo(() => {
    const structurePower = state.islands.reduce((sum, isl) => {
      return sum + isl.structures.reduce((s, struct) => {
        return s + struct.level * 5;
      }, 0);
    }, 0);
    const creaturePower = befriendedCreatures.reduce((sum, c) => {
      const def = CS_CREATURES.find(d => d.id === c.defId);
      if (!def) return sum;
      return sum + def.windPower + def.grace;
    }, 0);
    const abilityPower = learnedAbilities.length * 8;
    return structurePower + creaturePower + abilityPower + state.level * 10;
  }, [state, befriendedCreatures, learnedAbilities]);

  const unreadAchievements = useMemo(() => {
    return CS_ACHIEVEMENTS.filter(a => !state.achievements.includes(a.id));
  }, [state]);

  const todayQuest = useMemo(() => {
    const rng = csSeededRandom(`daily-quest-${state.daily.dateSeed}`);
    const idx = Math.floor(rng() * CS_DAILY_QUESTS.length);
    return CS_DAILY_QUESTS[idx];
  }, [state]);

  return {
    state,
    addXP,
    addCoins,
    spendCoins,
    addWind,
    spendWind,
    spinCloud,
    weaveThread,
    discoverIsland,
    buildStructure,
    upgradeStructure,
    befriendCreature,
    learnWindAbility,
    useWindAbility,
    harvestSunrise,
    claimDailyReward,
    resetDaily,
    currentTitle,
    currentProgress,
    unlockedIslands,
    discoveredIslandDefs,
    befriendedCreatures,
    learnedAbilities,
    productionRates,
    kingdomPower,
    unreadAchievements,
    todayQuest,
  };
}

// ---------------------------------------------------------------------------
// State Access & Reset (exported cs functions)
// ---------------------------------------------------------------------------

export function csGetState(): CloudStrandState {
  return csCreateInitialState();
}

export function csResetState(): CloudStrandState {
  return csCreateInitialState();
}

// ---------------------------------------------------------------------------
// Level & XP Functions
// ---------------------------------------------------------------------------

export function csGetLevel(state: CloudStrandState): number {
  return state.level;
}

export function csGetTitle(state: CloudStrandState): string {
  return csCalculateTitle(state.level);
}

export function csGetTitleForLevel(level: number): string {
  return csCalculateTitle(level);
}

export function csGetProgress(state: CloudStrandState): number {
  const curXp = csGetXpForLevel(state.level);
  const nextXp = csGetXpForLevel(state.level + 1);
  if (nextXp <= curXp) return 100;
  return Math.floor((state.xp / nextXp) * 100);
}

export function csAddXP(state: CloudStrandState, amount: number): CloudStrandState {
  const newState = { ...state, xp: state.xp + amount, stats: { ...state.stats, totalXPEarned: state.stats.totalXPEarned + amount } };
  const newLevel = csCalculateLevel(newState.xp);
  if (newLevel > newState.level) {
    newState.level = newLevel;
    newState.maxWind = 50 + (newLevel - 1) * 12;
  }
  return newState;
}

export function csGetXPForLevel(level: number): number {
  return csGetXpForLevel(level);
}

export function csGetXPToNextLevel(state: CloudStrandState): number {
  return csGetXpForLevel(state.level + 1);
}

export function csCanLevelUp(state: CloudStrandState): boolean {
  return state.level < CS_MAX_LEVEL;
}

// ---------------------------------------------------------------------------
// Coin Functions
// ---------------------------------------------------------------------------

export function csGetCoins(state: CloudStrandState): number {
  return state.coins;
}

export function csAddCoins(state: CloudStrandState, amount: number): CloudStrandState {
  return { ...state, coins: state.coins + amount, stats: { ...state.stats, totalCoinsEarned: state.stats.totalCoinsEarned + amount } };
}

export function csSpendCoins(state: CloudStrandState, amount: number): CloudStrandState | null {
  if (state.coins < amount) return null;
  return { ...state, coins: state.coins - amount };
}

// ---------------------------------------------------------------------------
// Wind Functions
// ---------------------------------------------------------------------------

export function csGetWind(state: CloudStrandState): number {
  return state.wind;
}

export function csGetMaxWind(state: CloudStrandState): number {
  return state.maxWind;
}

export function csAddWind(state: CloudStrandState, amount: number): CloudStrandState {
  return { ...state, wind: Math.min(state.maxWind, state.wind + amount) };
}

export function csSpendWind(state: CloudStrandState, amount: number): CloudStrandState | null {
  if (state.wind < amount) return null;
  return { ...state, wind: state.wind - amount };
}

export function csRegenWind(state: CloudStrandState): CloudStrandState {
  return { ...state, wind: Math.min(state.maxWind, state.wind + 3 + Math.floor(state.level / 4)) };
}

// ---------------------------------------------------------------------------
// Island Functions
// ---------------------------------------------------------------------------

export function csGetIslands(): CsIslandDef[] {
  return CS_ISLANDS;
}

export function csGetIslandInfo(islandId: string): CsIslandDef | null {
  return CS_ISLANDS.find(i => i.id === islandId) ?? null;
}

export function csGetIslandState(state: CloudStrandState, islandId: string): CsIslandState | null {
  return state.islands.find(i => i.defId === islandId) ?? null;
}

export function csGetDiscoveredIslands(state: CloudStrandState): CsIslandState[] {
  return state.islands.filter(i => i.discovered);
}

export function csDiscoverIsland(state: CloudStrandState, islandId: string): CloudStrandState | null {
  const def = CS_ISLANDS.find(i => i.id === islandId);
  if (!def) return null;
  const existing = state.islands.find(i => i.defId === islandId);
  if (!existing || existing.discovered) return null;
  if (state.level < def.unlockLevel) return null;
  if (state.coins < def.unlockCost) return null;
  const newIslands = state.islands.map(i =>
    i.defId === islandId ? { ...i, unlocked: true, discovered: true } : i
  );
  return {
    ...state,
    islands: newIslands,
    coins: state.coins - def.unlockCost,
    stats: { ...state.stats, totalIslandsDiscovered: state.stats.totalIslandsDiscovered + 1 },
  };
}

export function csGetIslandStructures(state: CloudStrandState, islandId: string): CsStructureInstance[] {
  const island = state.islands.find(i => i.defId === islandId);
  if (!island) return [];
  return island.structures;
}

export function csGetNextIslandToDiscover(state: CloudStrandState): CsIslandDef | null {
  for (const def of CS_ISLANDS) {
    const ist = state.islands.find(i => i.defId === def.id);
    if (!ist || !ist.discovered) {
      if (state.level >= def.unlockLevel) return def;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Structure Functions
// ---------------------------------------------------------------------------

export function csGetStructures(): CsStructureDef[] {
  return CS_STRUCTURES;
}

export function csGetStructureInfo(structureId: string): CsStructureDef | null {
  return CS_STRUCTURES.find(s => s.id === structureId) ?? null;
}

export function csBuildStructure(state: CloudStrandState, islandId: string, structureId: string): CloudStrandState | null {
  const structDef = CS_STRUCTURES.find(s => s.id === structureId);
  const islandDef = CS_ISLANDS.find(i => i.id === islandId);
  const islandState = state.islands.find(i => i.defId === islandId);
  if (!structDef || !islandState || !islandDef) return null;
  if (!islandState.discovered) return null;
  if (islandState.structures.length >= islandDef.maxStructures) return null;
  const cost = csGetStructureCost(structDef, 1);
  if (!csCanAfford(state.threads, state.coins, cost)) return null;
  const newStructure: CsStructureInstance = { defId: structureId, islandId, level: 1 };
  const newIslands = state.islands.map(i =>
    i.defId === islandId ? { ...i, structures: [...i.structures, newStructure] } : i
  );
  const spent = csSpendResources(state.threads, state.coins, cost);
  return {
    ...state,
    islands: newIslands,
    threads: spent.resources,
    coins: spent.coins,
    stats: { ...state.stats, totalStructuresBuilt: state.stats.totalStructuresBuilt + 1 },
  };
}

export function csUpgradeStructure(state: CloudStrandState, islandId: string, structureIndex: number): CloudStrandState | null {
  const islandState = state.islands.find(i => i.defId === islandId);
  if (!islandState) return null;
  if (structureIndex < 0 || structureIndex >= islandState.structures.length) return null;
  const structInst = islandState.structures[structureIndex];
  const structDef = CS_STRUCTURES.find(s => s.id === structInst.defId);
  if (!structDef) return null;
  if (structInst.level >= structDef.maxLevel) return null;
  const cost = csGetStructureCost(structDef, structInst.level + 1);
  if (!csCanAfford(state.threads, state.coins, cost)) return null;
  const upgraded = { ...structInst, level: structInst.level + 1 };
  const newStructures = [...islandState.structures];
  newStructures[structureIndex] = upgraded;
  const newIslands = state.islands.map(i =>
    i.defId === islandId ? { ...i, structures: newStructures } : i
  );
  const spent = csSpendResources(state.threads, state.coins, cost);
  return { ...state, islands: newIslands, threads: spent.resources, coins: spent.coins };
}

export function csGetTotalStructures(state: CloudStrandState): number {
  return state.islands.reduce((sum, isl) => sum + isl.structures.length, 0);
}

export function csGetStructureUpgradeCost(structureId: string, currentLevel: number): Record<string, number> | null {
  const def = CS_STRUCTURES.find(s => s.id === structureId);
  if (!def) return null;
  return csGetStructureCost(def, currentLevel + 1);
}

// ---------------------------------------------------------------------------
// Thread Functions
// ---------------------------------------------------------------------------

export function csGetThreads(): CsThreadDef[] {
  return CS_THREADS;
}

export function csGetThreadInfo(threadId: string): CsThreadDef | null {
  return CS_THREADS.find(t => t.id === threadId) ?? null;
}

export function csGetThreadCount(state: CloudStrandState, threadId: string): number {
  return state.threads[threadId] ?? 0;
}

export function csGetAllThreads(state: CloudStrandState): Record<string, number> {
  return { ...state.threads };
}

export function csSpinCloud(state: CloudStrandState, threadId: string, amount: number = 1): CloudStrandState {
  const newThreads = { ...state.threads, [threadId]: (state.threads[threadId] ?? 0) + amount };
  return {
    ...state,
    threads: newThreads,
    stats: { ...state.stats, totalThreadsSpun: state.stats.totalThreadsSpun + amount },
  };
}

export function csWeaveThread(state: CloudStrandState, inputThreadIds: string[], outputThreadId: string): CloudStrandState | null {
  const outputDef = CS_THREADS.find(t => t.id === outputThreadId);
  if (!outputDef) return null;
  const newThreads = { ...state.threads };
  for (const tid of inputThreadIds) {
    if ((newThreads[tid] ?? 0) < 2) return null;
  }
  for (const tid of inputThreadIds) {
    newThreads[tid] = (newThreads[tid] ?? 0) - 2;
  }
  newThreads[outputThreadId] = (newThreads[outputThreadId] ?? 0) + 1;
  return { ...state, threads: newThreads, stats: { ...state.stats, totalThreadsSpun: state.stats.totalThreadsSpun + 1 } };
}

export function csGetThreadProduction(state: CloudStrandState): Record<string, number> {
  return csGetIslandThreadProduction(state);
}

export function csSimulateHour(state: CloudStrandState): CloudStrandState {
  const production = csGetIslandThreadProduction(state);
  const newThreads = { ...state.threads };
  for (const [res, amount] of Object.entries(production)) {
    newThreads[res] = (newThreads[res] ?? 0) + amount;
  }
  const newWind = Math.min(state.maxWind, state.wind + 3 + Math.floor(state.level / 4));
  return { ...state, threads: newThreads, wind: newWind };
}

export function csGetThreadValue(state: CloudStrandState): number {
  let total = 0;
  for (const [id, count] of Object.entries(state.threads)) {
    const def = CS_THREADS.find(t => t.id === id);
    if (def) total += def.baseValue * count;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Creature Functions
// ---------------------------------------------------------------------------

export function csGetCreatures(): CsCreatureDef[] {
  return CS_CREATURES;
}

export function csGetCreatureInfo(creatureId: string): CsCreatureDef | null {
  return CS_CREATURES.find(c => c.id === creatureId) ?? null;
}

export function csGetBefriendable(state: CloudStrandState): CsCreatureDef[] {
  return CS_CREATURES.filter(c => {
    const inst = state.creatures.find(i => i.defId === c.id);
    return inst && !inst.befriended;
  });
}

export function csGetBefriendedCreatures(state: CloudStrandState): CsCreatureInstance[] {
  return state.creatures.filter(c => c.befriended);
}

export function csBefriendCreature(state: CloudStrandState, creatureId: string): CloudStrandState | null {
  const def = CS_CREATURES.find(c => c.id === creatureId);
  if (!def) return null;
  const existing = state.creatures.find(c => c.defId === creatureId);
  if (existing && existing.befriended) return null;
  const rng = csSeededRandom(`befriend-${creatureId}-${Date.now()}`);
  const graceBonus = state.level * 0.02;
  const successChance = Math.min(0.95, 0.3 + graceBonus + (def.grace * 0.015));
  if (rng() > successChance) return null;
  const cost = def.windPower * 15;
  if (state.wind < cost) return null;
  const newCreatures = state.creatures.map(c =>
    c.defId === creatureId ? { ...c, befriended: true, level: 1 } : c
  );
  return {
    ...state,
    creatures: newCreatures,
    wind: state.wind - cost,
    stats: { ...state.stats, totalCreaturesBefriended: state.stats.totalCreaturesBefriended + 1 },
  };
}

export function csGetCreatureCountByRarity(state: CloudStrandState, rarity: CsRarity): number {
  return state.creatures.filter(c => {
    if (!c.befriended) return false;
    const def = CS_CREATURES.find(d => d.id === c.defId);
    return def && def.rarity === rarity;
  }).length;
}

export function csGetCreaturePower(state: CloudStrandState, creatureId: string): number {
  const def = CS_CREATURES.find(c => c.id === creatureId);
  if (!def) return 0;
  const inst = state.creatures.find(c => c.defId === creatureId);
  if (!inst || !inst.befriended) return 0;
  return (def.windPower + def.grace) * inst.level;
}

export function csSortCreaturesBy(state: CloudStrandState, sortBy: "name" | "rarity" | "windPower" | "grace"): CsCreatureDef[] {
  const befriendedIds = new Set(state.creatures.filter(c => c.befriended).map(c => c.defId));
  const befriended = CS_CREATURES.filter(c => befriendedIds.has(c.id));
  const sorted = [...befriended];
  if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "rarity") {
    const order: Record<CsRarity, number> = { Common: 0, Unusual: 1, Rare: 2, Epic: 3, Legendary: 4 };
    sorted.sort((a, b) => order[a.rarity] - order[b.rarity]);
  } else if (sortBy === "windPower") sorted.sort((a, b) => b.windPower - a.windPower);
  else if (sortBy === "grace") sorted.sort((a, b) => b.grace - a.grace);
  return sorted;
}

// ---------------------------------------------------------------------------
// Wind Ability Functions
// ---------------------------------------------------------------------------

export function csGetWindAbilities(): CsWindAbilityDef[] {
  return CS_WIND_ABILITIES;
}

export function csGetWindAbilityInfo(abilityId: string): CsWindAbilityDef | null {
  return CS_WIND_ABILITIES.find(a => a.id === abilityId) ?? null;
}

export function csGetLearnedAbilities(state: CloudStrandState): CsWindAbilityState[] {
  return state.windAbilities.filter(a => a.learned);
}

export function csGetAbilitiesBySchool(state: CloudStrandState, school: CsWindSchool): CsWindAbilityState[] {
  return state.windAbilities.filter(a => {
    const def = CS_WIND_ABILITIES.find(d => d.id === a.defId);
    return def && def.school === school && a.learned;
  });
}

export function csLearnWindAbility(state: CloudStrandState, abilityId: string): CloudStrandState | null {
  const def = CS_WIND_ABILITIES.find(a => a.id === abilityId);
  if (!def) return null;
  if (state.level < def.unlockLevel) return null;
  const existing = state.windAbilities.find(a => a.defId === abilityId);
  if (existing && existing.learned) return null;
  const cost = def.windCost * 3;
  if (state.wind < cost) return null;
  const newAbilities = state.windAbilities.map(a =>
    a.defId === abilityId ? { ...a, learned: true } : a
  );
  return { ...state, windAbilities: newAbilities, wind: state.wind - cost };
}

export function csUseWindAbility(state: CloudStrandState, abilityId: string): CloudStrandState | null {
  const def = CS_WIND_ABILITIES.find(a => a.id === abilityId);
  const abilityState = state.windAbilities.find(a => a.defId === abilityId);
  if (!def || !abilityState || !abilityState.learned) return null;
  if (abilityState.cooldownRemaining > 0) return null;
  if (state.wind < def.windCost) return null;
  const newAbilities = state.windAbilities.map(a =>
    a.defId === abilityId ? { ...a, castCount: a.castCount + 1, cooldownRemaining: def.cooldown } : a
  );
  const xpGain = def.power;
  const coinGain = Math.floor(def.power * 0.5);
  return {
    ...state,
    windAbilities: newAbilities,
    wind: state.wind - def.windCost,
    xp: state.xp + xpGain,
    coins: state.coins + coinGain,
    stats: {
      ...state.stats,
      totalWindAbilitiesUsed: state.stats.totalWindAbilitiesUsed + 1,
      totalXPEarned: state.stats.totalXPEarned + xpGain,
      totalCoinsEarned: state.stats.totalCoinsEarned + coinGain,
    },
  };
}

export function csReduceCooldowns(state: CloudStrandState): CloudStrandState {
  const newAbilities = state.windAbilities.map(a => ({
    ...a,
    cooldownRemaining: Math.max(0, a.cooldownRemaining - 1),
  }));
  return { ...state, windAbilities: newAbilities };
}

// ---------------------------------------------------------------------------
// Achievement Functions
// ---------------------------------------------------------------------------

export function csGetAchievements(): CsAchievementDef[] {
  return CS_ACHIEVEMENTS;
}

export function csGetAchievementInfo(achievementId: string): CsAchievementDef | null {
  return CS_ACHIEVEMENTS.find(a => a.id === achievementId) ?? null;
}

export function csGetUnlockedAchievements(state: CloudStrandState): string[] {
  return state.achievements;
}

export function csCheckAchievements(state: CloudStrandState): { newAchievements: string[]; newState: CloudStrandState } {
  const newIds: string[] = [];
  let newState = { ...state };
  for (const ach of CS_ACHIEVEMENTS) {
    if (state.achievements.includes(ach.id)) continue;
    let conditionMet = false;
    if (ach.condition === "totalThreadsSpun >= 1" && state.stats.totalThreadsSpun >= 1) conditionMet = true;
    else if (ach.condition === "totalIslandsDiscovered >= 3" && state.stats.totalIslandsDiscovered >= 3) conditionMet = true;
    else if (ach.condition === "totalStructuresBuilt >= 5" && state.stats.totalStructuresBuilt >= 5) conditionMet = true;
    else if (ach.condition === "totalStructuresBuilt >= 25" && state.stats.totalStructuresBuilt >= 25) conditionMet = true;
    else if (ach.condition === "totalCreaturesBefriended >= 5" && state.stats.totalCreaturesBefriended >= 5) conditionMet = true;
    else if (ach.condition === "totalCreaturesBefriended >= 15" && state.stats.totalCreaturesBefriended >= 15) conditionMet = true;
    else if (ach.condition === "has_legendary") {
      const hasLeg = state.creatures.some(c => {
        if (!c.befriended) return false;
        const def = CS_CREATURES.find(d => d.id === c.defId);
        return def && def.rarity === "Legendary";
      });
      if (hasLeg) conditionMet = true;
    }
    else if (ach.condition === "totalWindAbilitiesUsed >= 50" && state.stats.totalWindAbilitiesUsed >= 50) conditionMet = true;
    else if (ach.condition === "totalSunrisesHarvested >= 10" && state.stats.totalSunrisesHarvested >= 10) conditionMet = true;
    else if (ach.condition === "totalSunrisesHarvested >= 50" && state.stats.totalSunrisesHarvested >= 50) conditionMet = true;
    else if (ach.condition === "totalIslandsDiscovered >= 8" && state.stats.totalIslandsDiscovered >= 8) conditionMet = true;
    else if (ach.condition === "thread_accumulated >= 500") {
      const has500 = Object.values(state.threads).some(v => v >= 500);
      if (has500) conditionMet = true;
    }
    else if (ach.condition === "level >= 25" && state.level >= 25) conditionMet = true;
    else if (ach.condition === "level >= 50" && state.level >= 50) conditionMet = true;
    else if (ach.condition === "totalQuestsCompleted >= 10" && state.stats.totalQuestsCompleted >= 10) conditionMet = true;
    else if (ach.condition === "wind_schools_learned >= 6") {
      const schools = new Set<string>();
      for (const a of state.windAbilities) {
        if (a.learned) {
          const def = CS_WIND_ABILITIES.find(d => d.id === a.defId);
          if (def) schools.add(def.school);
        }
      }
      if (schools.size >= 6) conditionMet = true;
    }
    else if (ach.condition === "coins >= 10000" && state.coins >= 10000) conditionMet = true;
    else if (ach.condition === "max_structure_level >= 10") {
      const hasMax = state.islands.some(isl => isl.structures.some(s => s.level >= 10));
      if (hasMax) conditionMet = true;
    }
    if (conditionMet) {
      newIds.push(ach.id);
      newState = {
        ...newState,
        achievements: [...newState.achievements, ach.id],
        coins: newState.coins + ach.reward,
      };
    }
  }
  return { newAchievements: newIds, newState };
}

// ---------------------------------------------------------------------------
// Daily Quest Functions
// ---------------------------------------------------------------------------

export function csGetDailyQuests(): CsDailyQuestDef[] {
  return CS_DAILY_QUESTS;
}

export function csGetDailyQuest(state: CloudStrandState): CsDailyQuestDef {
  const rng = csSeededRandom(`daily-quest-${state.daily.dateSeed}`);
  const idx = Math.floor(rng() * CS_DAILY_QUESTS.length);
  return CS_DAILY_QUESTS[idx];
}

export function csAcceptDailyQuest(state: CloudStrandState): CloudStrandState {
  if (state.daily.questAccepted) return state;
  return { ...state, daily: { ...state.daily, questAccepted: true, questProgress: 0, questCompleted: false } };
}

export function csUpdateDailyQuestProgress(state: CloudStrandState, objectiveType: string, amount: number): CloudStrandState {
  if (!state.daily.questAccepted || state.daily.questCompleted) return state;
  const quest = csGetDailyQuest(state);
  if (quest.objectiveType !== objectiveType) return state;
  const newProgress = Math.min(quest.objectiveTarget, state.daily.questProgress + amount);
  const completed = newProgress >= quest.objectiveTarget;
  return {
    ...state,
    daily: { ...state.daily, questProgress: newProgress, questCompleted: completed },
  };
}

export function csCompleteDailyQuest(state: CloudStrandState): CloudStrandState | null {
  if (!state.daily.questAccepted || !state.daily.questCompleted) return null;
  const quest = csGetDailyQuest(state);
  const newThreads = { ...state.threads };
  for (const [tid, amt] of Object.entries(quest.threadReward)) {
    newThreads[tid] = (newThreads[tid] ?? 0) + amt;
  }
  return {
    ...state,
    threads: newThreads,
    coins: state.coins + quest.coinReward,
    xp: state.xp + quest.xpReward,
    daily: { ...state.daily, questCompleted: true },
    stats: {
      ...state.stats,
      totalQuestsCompleted: state.stats.totalQuestsCompleted + 1,
      totalXPEarned: state.stats.totalXPEarned + quest.xpReward,
      totalCoinsEarned: state.stats.totalCoinsEarned + quest.coinReward,
    },
  };
}

// ---------------------------------------------------------------------------
// Sunrise Harvest Functions
// ---------------------------------------------------------------------------

export function csGetDailySunrise(state: CloudStrandState): { target: number; progress: number; completed: boolean } {
  return {
    target: state.daily.harvestTarget,
    progress: state.daily.harvestProgress,
    completed: state.daily.sunriseHarvested,
  };
}

export function csHarvestSunrise(state: CloudStrandState, increment: number = 1): CloudStrandState {
  const newDaily = { ...state.daily, harvestProgress: state.daily.harvestProgress + increment };
  if (newDaily.harvestProgress >= newDaily.harvestTarget) {
    newDaily.sunriseHarvested = true;
    newDaily.harvestProgress = newDaily.harvestTarget;
  }
  return {
    ...state,
    daily: newDaily,
    threads: { ...state.threads, morning_silk: (state.threads.morning_silk ?? 0) + increment },
    stats: { ...state.stats, totalSunrisesHarvested: state.stats.totalSunrisesHarvested + increment },
  };
}

export function csClaimDailyReward(state: CloudStrandState): CloudStrandState | null {
  if (state.daily.rewardClaimed) return null;
  if (!state.daily.sunriseHarvested) return null;
  return {
    ...state,
    daily: { ...state.daily, rewardClaimed: true },
    coins: state.coins + 100 + state.level * 10,
    xp: state.xp + 50 + state.level * 5,
    threads: {
      ...state.threads,
      morning_silk: (state.threads.morning_silk ?? 0) + 20,
      rose_silk: (state.threads.rose_silk ?? 0) + 10,
    },
  };
}

export function csResetDaily(state: CloudStrandState): CloudStrandState {
  const today = csGetTodaySeed();
  if (state.daily.dateSeed === today && state.lastDaily === today) return state;
  let streak = 1;
  if (state.lastDaily) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const ySeed = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
    if (state.lastDaily === ySeed) streak = state.streak + 1;
  }
  return {
    ...state,
    daily: {
      dateSeed: today,
      sunriseHarvested: false,
      harvestTarget: 5 + Math.floor(state.level / 5),
      harvestProgress: 0,
      rewardClaimed: false,
      questAccepted: false,
      questCompleted: false,
      questProgress: 0,
    },
    streak,
    lastDaily: today,
  };
}

// ---------------------------------------------------------------------------
// Overview & Stats
// ---------------------------------------------------------------------------

export function csGetKingdomStats(state: CloudStrandState): CsStats {
  return { ...state.stats };
}

export function csGetKingdomPower(state: CloudStrandState): number {
  const structurePower = state.islands.reduce((sum, isl) => {
    return sum + isl.structures.reduce((s, struct) => {
      return s + struct.level * 5;
    }, 0);
  }, 0);
  const befriended = state.creatures.filter(c => c.befriended);
  const creaturePower = befriended.reduce((sum, c) => {
    const def = CS_CREATURES.find(d => d.id === c.defId);
    if (!def) return sum;
    return sum + def.windPower + def.grace;
  }, 0);
  const abilityPower = state.windAbilities.filter(a => a.learned).length * 8;
  return structurePower + creaturePower + abilityPower + state.level * 10;
}

export function csGetOverview(state: CloudStrandState): {
  level: number;
  title: string;
  coins: number;
  wind: number;
  maxWind: number;
  power: number;
  islands: number;
  structures: number;
  creatures: number;
  abilities: number;
  achievements: number;
  streak: number;
} {
  return {
    level: state.level,
    title: csCalculateTitle(state.level),
    coins: state.coins,
    wind: state.wind,
    maxWind: state.maxWind,
    power: csGetKingdomPower(state),
    islands: state.stats.totalIslandsDiscovered,
    structures: state.stats.totalStructuresBuilt,
    creatures: state.stats.totalCreaturesBefriended,
    abilities: state.windAbilities.filter(a => a.learned).length,
    achievements: state.achievements.length,
    streak: state.streak,
  };
}

export function csGetWindSchools(): Array<{ id: CsWindSchool; name: string; description: string; color: string; icon: string }> {
  return CS_WIND_SCHOOLS;
}

export function csGetColors(): typeof CS_COLORS {
  return CS_COLORS;
}

export function csCollectAll(state: CloudStrandState): CloudStrandState {
  const production = csGetIslandThreadProduction(state);
  const newThreads = { ...state.threads };
  for (const [res, amount] of Object.entries(production)) {
    newThreads[res] = (newThreads[res] ?? 0) + amount;
  }
  const newWind = Math.min(state.maxWind, state.wind + 3 + Math.floor(state.level / 4));
  const newState = csReduceCooldowns({ ...state, threads: newThreads, wind: newWind });
  return newState;
}

export function csGetTamingChance(state: CloudStrandState, creatureId: string): number {
  const def = CS_CREATURES.find(c => c.id === creatureId);
  if (!def) return 0;
  const graceBonus = state.level * 0.02;
  return Math.min(0.95, 0.3 + graceBonus + (def.grace * 0.015));
}

export function csGetBefriendCost(creatureId: string): number | null {
  const def = CS_CREATURES.find(c => c.id === creatureId);
  if (!def) return null;
  return def.windPower * 15;
}

export function csGetMaxStructureLevel(state: CloudStrandState): number {
  let max = 0;
  for (const isl of state.islands) {
    for (const struct of isl.structures) {
      if (struct.level > max) max = struct.level;
    }
  }
  return max;
}

export function csGetIslandWindBonus(state: CloudStrandState, islandId: string): string {
  const def = CS_ISLANDS.find(i => i.id === islandId);
  if (!def) return "";
  const ist = state.islands.find(i => i.defId === islandId);
  if (!ist || !ist.discovered) return "Discover this island to gain wind bonuses";
  const threadDef = CS_THREADS.find(t => t.id === def.primaryThread);
  return `+25% ${threadDef?.name ?? def.primaryThread} from ${def.windPattern}`;
}

export function csGetTotalWindCost(state: CloudStrandState): number {
  return state.windAbilities
    .filter(a => a.learned)
    .reduce((sum, a) => {
      const def = CS_WIND_ABILITIES.find(d => d.id === a.defId);
      if (!def) return sum;
      return sum + def.windCost;
    }, 0);
}

export function csGetHint(state: CloudStrandState): string {
  if (state.level < 3) return "Spin morning silk and harvest sunrises to grow!";
  if (state.stats.totalCreaturesBefriended === 0) return "Try befriending a Puff Lamb — they love gentle zephyrs!";
  if (state.stats.totalIslandsDiscovered <= 2) return "Discover more islands to find rare threads!";
  if (state.stats.totalStructuresBuilt < 5) return "Build spinning structures on your islands for passive thread income.";
  if (state.windAbilities.filter(a => a.learned).length < 3) return "Learn wind abilities to boost your weaving power!";
  if (state.stats.totalQuestsCompleted < 5) return "Complete daily quests for bonus rewards!";
  return "You are weaving the sky beautifully, Strand Weaver!";
}

// ---------------------------------------------------------------------------
// Advanced Query Functions
// ---------------------------------------------------------------------------

export function csGetThreadsByCategory(state: CloudStrandState, category: CsThreadCategory): CsThreadDef[] {
  return CS_THREADS.filter(t => t.category === category);
}

export function csGetTotalThreadCount(state: CloudStrandState): number {
  let total = 0;
  for (const count of Object.values(state.threads)) {
    total += count;
  }
  return total;
}

export function csGetRichestThread(state: CloudStrandState): { threadId: string; count: number } | null {
  let maxId = "";
  let maxCount = 0;
  for (const [id, count] of Object.entries(state.threads)) {
    if (count > maxCount) {
      maxCount = count;
      maxId = id;
    }
  }
  if (maxId === "") return null;
  return { threadId: maxId, count: maxCount };
}

export function csGetCreaturesByCloudType(cloudType: CsCloudType): CsCreatureDef[] {
  return CS_CREATURES.filter(c => c.cloudType === cloudType);
}

export function csGetCreaturesByRarity(rarity: CsRarity): CsCreatureDef[] {
  return CS_CREATURES.filter(c => c.rarity === rarity);
}

export function csGetAbilitiesByRarity(rarity: CsRarity): CsWindAbilityDef[] {
  return CS_WIND_ABILITIES.filter(a => a.rarity === rarity);
}

export function csGetStructuresByCategory(category: string): CsStructureDef[] {
  return CS_STRUCTURES.filter(s => s.category === category);
}

export function csGetWindPowerSummary(state: CloudStrandState): number {
  return state.creatures
    .filter(c => c.befriended)
    .reduce((sum, c) => {
      const def = CS_CREATURES.find(d => d.id === c.defId);
      if (!def) return sum;
      return sum + def.windPower;
    }, 0);
}

export function csGetGraceSummary(state: CloudStrandState): number {
  return state.creatures
    .filter(c => c.befriended)
    .reduce((sum, c) => {
      const def = CS_CREATURES.find(d => d.id === c.defId);
      if (!def) return sum;
      return sum + def.grace;
    }, 0);
}

export function csGetBefriendSuccessRate(state: CloudStrandState): number {
  const totalAttempts = CS_CREATURES.length;
  const successes = state.stats.totalCreaturesBefriended;
  if (totalAttempts === 0) return 0;
  return Math.round((successes / totalAttempts) * 100);
}

export function csGetIslandWithMostStructures(state: CloudStrandState): CsIslandDef | null {
  let maxStructs = 0;
  let maxIslandId = "";
  for (const isl of state.islands) {
    if (isl.discovered && isl.structures.length > maxStructs) {
      maxStructs = isl.structures.length;
      maxIslandId = isl.defId;
    }
  }
  if (maxIslandId === "") return null;
  return CS_ISLANDS.find(i => i.id === maxIslandId) ?? null;
}

export function csGetUnlearnedAbilities(state: CloudStrandState): CsWindAbilityDef[] {
  const learnedIds = new Set(state.windAbilities.filter(a => a.learned).map(a => a.defId));
  return CS_WIND_ABILITIES.filter(a => !learnedIds.has(a.id) && a.unlockLevel <= state.level);
}

export function csGetNextUnlockAbility(state: CloudStrandState): CsWindAbilityDef | null {
  const nextLevelAbilities = CS_WIND_ABILITIES
    .filter(a => a.unlockLevel > state.level)
    .sort((a, b) => a.unlockLevel - b.unlockLevel);
  return nextLevelAbilities[0] ?? null;
}

export function csGetNextUnlockIsland(state: CloudStrandState): { level: number; island: CsIslandDef } | null {
  for (const def of CS_ISLANDS) {
    const ist = state.islands.find(i => i.defId === def.id);
    if (!ist || !ist.discovered) {
      if (state.level < def.unlockLevel) {
        return { level: def.unlockLevel, island: def };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Extended Game Mechanics — Weaving Patterns
// ---------------------------------------------------------------------------

export function csGetWeavingRecipes(): Array<{
  inputs: string[];
  output: string;
  name: string;
  description: string;
}> {
  return [
    { inputs: ["morning_silk", "morning_silk"], output: "cirrus_silk", name: "Wind Spin", description: "Spin two morning silk into fine cirrus silk." },
    { inputs: ["frost_lace", "mist_lace"], output: "aurora_lace", name: "Light Merge", description: "Merge frost and mist lace into shimmering aurora lace." },
    { inputs: ["breath_gauze", "dew_gauze"], output: "dream_gauze", name: "Dream Weave", description: "Weave breath and dew gauze into dream fabric." },
    { inputs: ["morning_silk", "rose_silk"], output: "gold_brocade", name: "Dawn Press", description: "Press morning and rose silk into golden brocade." },
    { inputs: ["storm_silk", "breath_gauze"], output: "thunder_brocade", name: "Storm Forge", description: "Forge storm silk with gauze into thunder brocade." },
    { inputs: ["cirrus_silk", "breath_gauze"], output: "sky_brocade", name: "Sky Fabric", description: "Weave cirrus silk and gauze into sky brocade." },
    { inputs: ["frost_lace", "prism_gauze"], output: "diamond_brocade", name: "Crystal Fusion", description: "Fuse frost lace and prism gauze into diamond brocade." },
    { inputs: ["twilight_lace", "dream_gauze"], output: "moonlace", name: "Moonlight Weave", description: "Weave twilight and dream threads into silver moonlace." },
    { inputs: ["gold_brocade", "sun_filigree"], output: "dawn_tapestry", name: "Sunrise Tapestry", description: "Weave gold brocade and sun filigree into a dawn tapestry." },
    { inputs: ["breath_gauze", "breath_gauze"], output: "wind_tapestry", name: "Wind Portrait", description: "Weave breath gauze into an animated wind tapestry." },
    { inputs: ["prism_gauze", "aurora_lace"], output: "island_tapestry", name: "Sky Map", description: "Map the islands by weaving prism and aurora threads." },
    { inputs: ["dawn_tapestry", "wind_tapestry"], output: "story_tapestry", name: "Adventure Scroll", description: "Combine tapestries to record your adventures." },
    { inputs: ["island_tapestry", "story_tapestry"], output: "cosmos_tapestry", name: "Cosmic Loom", description: "The ultimate weaving: a tapestry of the entire cosmos." },
    { inputs: ["morning_silk", "frost_lace"], output: "feather_filigree", name: "Plume Craft", description: "Craft delicate feather filigree from silk and lace." },
    { inputs: ["frost_lace", "prism_gauze"], output: "crystal_filigree", name: "Gem Setting", description: "Set frozen lace into crystalline filigree wirework." },
    { inputs: ["twilight_lace", "breath_gauze"], output: "echo_filigree", name: "Sound Weave", description: "Weave twilight and wind into singing filigree." },
    { inputs: ["diamond_brocade", "cosmos_tapestry"], output: "eternity_filigree", name: "Eternal Craft", description: "The finest craft: eternal filigree from diamond and cosmos." },
    { inputs: ["storm_silk", "storm_silk"], output: "thunder_brocade", name: "Storm Binding", description: "Bind storm silk into resilient thunder brocade." },
    { inputs: ["coral_brocade", "dew_gauze"], output: "sky_brocade", name: "Horizon Weave", description: "Weave coral warmth and dew into lightweight sky brocade." },
    { inputs: ["sun_filigree", "gold_brocade"], output: "sun_filigree", name: "Golden Reinforce", description: "Reinforce sun filigree with golden brocade for extra shine." },
  ];
}

export function csCanWeaveRecipe(state: CloudStrandState, inputThreadIds: string[]): boolean {
  for (const tid of inputThreadIds) {
    if ((state.threads[tid] ?? 0) < 2) return false;
  }
  return true;
}

export function csGetAvailableRecipes(state: CloudStrandState): Array<{
  inputs: string[];
  output: string;
  name: string;
  description: string;
  canAfford: boolean;
}> {
  return csGetWeavingRecipes().map(recipe => ({
    ...recipe,
    canAfford: csCanWeaveRecipe(state, recipe.inputs),
  }));
}

// ---------------------------------------------------------------------------
// Wind Forecast
// ---------------------------------------------------------------------------

export function csGetWindForecast(state: CloudStrandState, days: number): Array<{
  day: string;
  wind: string;
  bonus: string;
  intensity: number;
}> {
  const forecasts: Array<{ day: string; wind: string; bonus: string; intensity: number }> = [];
  const windTypes = ["Calm Breeze", "Gentle Zephyr", "Strong Gale", "Rising Tempest", "Dawn Current", "Aurora Drift", "Ethereal Whisper"];
  const bonusTypes = ["+10% Thread Spin", "+5% Wind Regen", "+15% Creature Grace", "+20% Structure Output", "Double Sunrise", "+25% Rare Drops"];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const seed = `forecast-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${state.level}`;
    const rng = csSeededRandom(seed);
    forecasts.push({
      day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : `Day ${i + 1}`,
      wind: windTypes[Math.floor(rng() * windTypes.length)],
      bonus: bonusTypes[Math.floor(rng() * bonusTypes.length)],
      intensity: Math.floor(rng() * 100),
    });
  }
  return forecasts;
}

// ---------------------------------------------------------------------------
// Extended Creature Interactions
// ---------------------------------------------------------------------------

export function csGetCreatureAbilities(creatureId: string): string[] {
  const def = CS_CREATURES.find(c => c.id === creatureId);
  if (!def) return [];
  return [...def.abilities];
}

export function csGetCreatureRarityDistribution(state: CloudStrandState): Record<CsRarity, number> {
  const dist: Record<CsRarity, number> = { Common: 0, Unusual: 0, Rare: 0, Epic: 0, Legendary: 0 };
  for (const c of state.creatures) {
    if (!c.befriended) continue;
    const def = CS_CREATURES.find(d => d.id === c.defId);
    if (def) dist[def.rarity]++;
  }
  return dist;
}

export function csGetTopCreature(state: CloudStrandState): CsCreatureDef | null {
  let maxPower = 0;
  let topDef: CsCreatureDef | null = null;
  for (const c of state.creatures) {
    if (!c.befriended) continue;
    const def = CS_CREATURES.find(d => d.id === c.defId);
    if (!def) continue;
    const power = def.windPower + def.grace;
    if (power > maxPower) {
      maxPower = power;
      topDef = def;
    }
  }
  return topDef;
}

export function csGetAbilityCooldownStatus(state: CloudStrandState): Array<{
  id: string;
  name: string;
  cooldownRemaining: number;
  maxCooldown: number;
  ready: boolean;
}> {
  return state.windAbilities
    .filter(a => a.learned)
    .map(a => {
      const def = CS_WIND_ABILITIES.find(d => d.id === a.defId);
      if (!def) return null;
      return {
        id: a.defId,
        name: def.name,
        cooldownRemaining: a.cooldownRemaining,
        maxCooldown: def.cooldown,
        ready: a.cooldownRemaining <= 0,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

// ---------------------------------------------------------------------------
// Streak & Bonus Functions
// ---------------------------------------------------------------------------

export function csGetStreakBonus(state: CloudStrandState): number {
  return Math.min(50, state.streak * 5);
}

export function csGetStreakMultiplier(state: CloudStrandState): number {
  return 1 + Math.min(0.5, state.streak * 0.05);
}

export function csGetDailyProgress(state: CloudStrandState): { sunrisePercent: number; questPercent: number } {
  const sunrisePercent = state.daily.harvestTarget > 0
    ? Math.min(100, Math.floor((state.daily.harvestProgress / state.daily.harvestTarget) * 100))
    : 0;
  const quest = csGetDailyQuest(state);
  const questPercent = quest.objectiveTarget > 0
    ? Math.min(100, Math.floor((state.daily.questProgress / quest.objectiveTarget) * 100))
    : 0;
  return { sunrisePercent, questPercent };
}

// ---------------------------------------------------------------------------
// Comparison & Leaderboard Helpers
// ---------------------------------------------------------------------------

export function csComparePower(a: CloudStrandState, b: CloudStrandState): number {
  return csGetKingdomPower(a) - csGetKingdomPower(b);
}

export function csGetPowerRank(state: CloudStrandState, benchmarks: number[]): number {
  const myPower = csGetKingdomPower(state);
  let rank = 1;
  for (const bp of benchmarks) {
    if (bp > myPower) rank++;
  }
  return rank;
}

export function csGetThreadCategorySummary(state: CloudStrandState): Record<CsThreadCategory, number> {
  const summary: Record<string, number> = { Silk: 0, Lace: 0, Brocade: 0, Gauze: 0, Tapestry: 0, Filigree: 0 };
  for (const [id, count] of Object.entries(state.threads)) {
    const def = CS_THREADS.find(t => t.id === id);
    if (def) summary[def.category] += count;
  }
  return summary as Record<CsThreadCategory, number>;
}

export function csGetStructureCategorySummary(state: CloudStrandState): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const isl of state.islands) {
    for (const struct of isl.structures) {
      const def = CS_STRUCTURES.find(s => s.id === struct.defId);
      if (def) {
        summary[def.category] = (summary[def.category] ?? 0) + 1;
      }
    }
  }
  return summary;
}

export function csGetIslandEfficiency(state: CloudStrandState, islandId: string): number {
  const island = state.islands.find(i => i.defId === islandId);
  if (!island || !island.discovered) return 0;
  const def = CS_ISLANDS.find(i => i.id === islandId);
  if (!def) return 0;
  const structureCount = island.structures.length;
  if (structureCount === 0) return 0;
  const totalLevels = island.structures.reduce((s, st) => s + st.level, 0);
  return Math.floor((totalLevels / (def.maxStructures * 10)) * 100);
}

export function csGetMostEfficientIsland(state: CloudStrandState): CsIslandDef | null {
  let bestEfficiency = 0;
  let bestIsland: CsIslandDef | null = null;
  for (const isl of state.islands) {
    if (!isl.discovered) continue;
    const eff = csGetIslandEfficiency(state, isl.defId);
    if (eff > bestEfficiency) {
      bestEfficiency = eff;
      bestIsland = CS_ISLANDS.find(d => d.id === isl.defId) ?? null;
    }
  }
  return bestIsland;
}

// ---------------------------------------------------------------------------
// Bonus Calculation Helpers
// ---------------------------------------------------------------------------

export function csGetProductionBonus(state: CloudStrandState): number {
  let bonus = 0;
  for (const isl of state.islands) {
    if (!isl.discovered) continue;
    for (const struct of isl.structures) {
      if (struct.defId === "weaver_sanctum") {
        bonus += struct.level * 3;
      }
      if (struct.defId === "dawn_beacon") {
        bonus += struct.level * 2;
      }
    }
  }
  return Math.min(100, bonus);
}

export function csGetWindRegenBonus(state: CloudStrandState): number {
  let bonus = 0;
  for (const isl of state.islands) {
    if (!isl.discovered) continue;
    for (const struct of isl.structures) {
      if (struct.defId === "wind_catcher" || struct.defId === "breeze_bell" || struct.defId === "zephyr_tower") {
        bonus += struct.level;
      }
      if (struct.defId === "wind_library") {
        bonus += Math.floor(struct.level * 0.5);
      }
    }
  }
  return bonus;
}

export function csGetBefriendBonus(state: CloudStrandState): number {
  let bonus = 0;
  const learnedIds = state.windAbilities.filter(a => a.learned).map(a => a.defId);
  for (const id of learnedIds) {
    const def = CS_WIND_ABILITIES.find(d => d.id === id);
    if (def && def.effectType === "befriend_boost") {
      bonus += def.power;
    }
  }
  return bonus;
}

// ---------------------------------------------------------------------------
// Full Game Summary
// ---------------------------------------------------------------------------

export function csGetFullSummary(state: CloudStrandState): {
  player: { level: number; title: string; xp: number; coins: number; wind: number; maxWind: number };
  progress: { levelProgress: number; xpToNext: number; islandsPercent: number; creaturesPercent: number; abilitiesPercent: number };
  resources: Record<string, number>;
  islands: Array<{ name: string; discovered: boolean; structureCount: number; efficiency: number }>;
  creatures: Array<{ name: string; rarity: CsRarity; befriended: boolean; power: number }>;
  achievements: { unlocked: number; total: number; completionPercent: number };
  daily: { streak: number; sunriseDone: boolean; questDone: boolean };
  power: { total: number; structurePower: number; creaturePower: number; abilityPower: number };
} {
  const structurePower = state.islands.reduce((sum, isl) =>
    sum + isl.structures.reduce((s, st) => s + st.level * 5, 0), 0);
  const befriendedList = state.creatures.filter(c => c.befriended);
  const creaturePower = befriendedList.reduce((sum, c) => {
    const def = CS_CREATURES.find(d => d.id === c.defId);
    return sum + (def ? def.windPower + def.grace : 0);
  }, 0);
  const abilityPower = state.windAbilities.filter(a => a.learned).length * 8;

  return {
    player: {
      level: state.level,
      title: csCalculateTitle(state.level),
      xp: state.xp,
      coins: state.coins,
      wind: state.wind,
      maxWind: state.maxWind,
    },
    progress: {
      levelProgress: csGetProgress(state),
      xpToNext: csGetXPToNextLevel(state),
      islandsPercent: Math.floor((state.stats.totalIslandsDiscovered / CS_ISLANDS.length) * 100),
      creaturesPercent: Math.floor((state.stats.totalCreaturesBefriended / CS_CREATURES.length) * 100),
      abilitiesPercent: Math.floor((state.windAbilities.filter(a => a.learned).length / CS_WIND_ABILITIES.length) * 100),
    },
    resources: { ...state.threads },
    islands: CS_ISLANDS.map(def => {
      const ist = state.islands.find(i => i.defId === def.id);
      return {
        name: def.name,
        discovered: ist?.discovered ?? false,
        structureCount: ist?.structures.length ?? 0,
        efficiency: ist?.discovered ? csGetIslandEfficiency(state, def.id) : 0,
      };
    }),
    creatures: CS_CREATURES.map(def => {
      const inst = state.creatures.find(c => c.defId === def.id);
      return {
        name: def.name,
        rarity: def.rarity,
        befriended: inst?.befriended ?? false,
        power: inst?.befriended ? def.windPower + def.grace : 0,
      };
    }),
    achievements: {
      unlocked: state.achievements.length,
      total: CS_ACHIEVEMENTS.length,
      completionPercent: Math.floor((state.achievements.length / CS_ACHIEVEMENTS.length) * 100),
    },
    daily: {
      streak: state.streak,
      sunriseDone: state.daily.sunriseHarvested,
      questDone: state.daily.questCompleted,
    },
    power: {
      total: structurePower + creaturePower + abilityPower + state.level * 10,
      structurePower,
      creaturePower,
      abilityPower,
    },
  };
}
