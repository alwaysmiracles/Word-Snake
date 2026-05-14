"use client";

import { useState, useCallback, useMemo, useRef } from "react";

// ─── Interfaces ──────────────────────────────────────────────────────────────

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
type WeatherType = "clear" | "gentle_rain" | "sunshine" | "snow" | "aurora" | "storm" | "fog" | "rainbow";

interface CloudInstance {
  id: string;
  name: string;
  rarity: Rarity;
  collected: boolean;
  shaped: boolean;
  shapeProgress: number;
  count: number;
  description: string;
  color: string;
  xpReward: number;
  coinReward: number;
}

interface RealmInstance {
  id: string;
  name: string;
  unlocked: boolean;
  explored: boolean;
  expansionLevel: number;
  maxExpansion: number;
  structures: Record<string, StructureInstance>;
  currentWeather: WeatherType;
  visitCount: number;
  ambientXpRate: number;
  description: string;
  theme: string;
}

interface StructureInstance {
  id: string;
  name: string;
  built: boolean;
  level: number;
  maxLevel: number;
  buildProgress: number;
  description: string;
  materialCost: Record<string, number>;
  benefit: string;
}

interface CreatureInstance {
  id: string;
  name: string;
  type: string;
  befriended: boolean;
  friendshipLevel: number;
  maxFriendship: number;
  trainProgress: number;
  description: string;
  ability: string;
  rarity: Rarity;
  color: string;
}

interface SkyAbility {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  cooldown: number;
  currentCooldown: number;
  manaCost: number;
  effectType: string;
}

interface MaterialDef {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  color: string;
  gatherTime: number;
  xpReward: number;
}

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  checkValue: number;
}

interface TitleDef {
  id: number;
  name: string;
  requirement: number;
  color: string;
}

interface RecipeDef {
  id: string;
  name: string;
  description: string;
  ingredients: Record<string, number>;
  resultId: string;
  resultName: string;
  resultRarity: Rarity;
  xpReward: number;
  coinReward: number;
}

interface StarEvent {
  id: string;
  name: string;
  description: string;
  active: boolean;
  duration: number;
  reward: Record<string, number>;
  rarity: Rarity;
}

interface DailyQuestDef {
  completed: boolean;
  progress: number;
  target: number;
  type: string;
  reward: Record<string, number>;
}

interface SkyRaceData {
  active: boolean;
  distance: number;
  speed: number;
  finishLine: number;
  rewards: Record<string, number>;
}

interface CloudSurfData {
  active: boolean;
  waveHeight: number;
  balance: number;
  score: number;
  combo: number;
}

interface CloudNineState {
  level: number;
  xp: number;
  maxXp: number;
  coins: number;
  clouds: Record<string, CloudInstance>;
  realms: Record<string, RealmInstance>;
  discoveries: string[];
  achievements: string[];
  currentTitle: number;
  inventory: Record<string, number>;
  dailyQuest: DailyQuestDef;
  dayStreak: number;
  skyCreatures: Record<string, CreatureInstance>;
  abilities: Record<string, SkyAbility>;
  starEvents: Record<string, StarEvent>;
  skyRace: SkyRaceData;
  cloudSurf: CloudSurfData;
  totalCloudsCollected: number;
  totalCloudsShaped: number;
  totalRealmsExplored: number;
  totalCreaturesBefriended: number;
  totalStructuresBuilt: number;
  totalItemsCrafted: number;
  totalRacesCompleted: number;
  totalSurfsCompleted: number;
  weatherChanges: number;
  mana: number;
  maxMana: number;
  lastPlayDate: string;
}

// ─── Color Palette ───────────────────────────────────────────────────────────

const CLN_COLORS = {
  skyBlue: "#7DD3FC",
  lavender: "#C4B5FD",
  softWhite: "#F0F9FF",
  sunsetOrange: "#FB923C",
  rainbowGold: "#FCD34D",
  rosePink: "#F472B6",
  bgSoftSky: "#EFF6FF",
  bgSoftViolet: "#F5F3FF",
  cloudWhite: "#F8FAFC",
  sunrisePeach: "#FDBA74",
  twilightPurple: "#A78BFA",
  auroraGreen: "#34D399",
  starGold: "#FBBF24",
  frostCyan: "#22D3EE",
  dreamMint: "#6EE7B7",
  heavenAmber: "#F59E0B",
  nebulaPink: "#EC4899",
  zephyrTeal: "#2DD4BF",
  etherSilver: "#CBD5E1",
  celestialIndigo: "#818CF8",
};

// ─── Cloud Definitions (35 types) ───────────────────────────────────────────

const CLN_CLOUDS: Record<string, Omit<CloudInstance, "collected" | "shaped" | "shapeProgress" | "count">> = {
  cumulus: { id: "cumulus", name: "Cumulus", rarity: "Common", description: "Fluffy white cotton balls floating gently across the sky.", color: CLN_COLORS.cloudWhite, xpReward: 10, coinReward: 5 },
  cirrus: { id: "cirrus", name: "Cirrus", rarity: "Common", description: "Wispy feather-like streaks high in the atmosphere.", color: CLN_COLORS.softWhite, xpReward: 10, coinReward: 5 },
  altocumulus: { id: "altocumulus", name: "Altocumulus", rarity: "Common", description: "Patches of cloudlets forming a mottled sky blanket.", color: CLN_COLORS.skyBlue, xpReward: 12, coinReward: 6 },
  stratocumulus: { id: "stratocumulus", name: "Stratocumulus", rarity: "Common", description: "Low-level lumpy cloud layer stretching across the horizon.", color: CLN_COLORS.etherSilver, xpReward: 12, coinReward: 6 },
  nimbostratus: { id: "nimbostratus", name: "Nimbostratus", rarity: "Common", description: "Thick dark rain clouds bringing nourishing showers.", color: "#94A3B8", xpReward: 15, coinReward: 8 },
  altostratus: { id: "altostratus", name: "Altostratus", rarity: "Common", description: "Gray-blue sheet covering the sky like a veil.", color: CLN_COLORS.bgSoftSky, xpReward: 12, coinReward: 6 },
  stratus: { id: "stratus", name: "Stratus", rarity: "Common", description: "Uniform low cloud layer resembling elevated fog.", color: "#CBD5E1", xpReward: 10, coinReward: 5 },
  cumulonimbus: { id: "cumulonimbus", name: "Cumulonimbus", rarity: "Uncommon", description: "Towering thunderstorm cloud crackling with energy.", color: "#64748B", xpReward: 25, coinReward: 15 },
  lenticular: { id: "lenticular", name: "Lenticular", rarity: "Uncommon", description: "Smooth lens-shaped clouds over mountain peaks.", color: CLN_COLORS.sunrisePeach, xpReward: 25, coinReward: 15 },
  cirrocumulus: { id: "cirrocumulus", name: "Cirrocumulus", rarity: "Uncommon", description: "Small ripples of ice crystals forming sky scales.", color: CLN_COLORS.frostCyan, xpReward: 22, coinReward: 12 },
  cirrostratus: { id: "cirrostratus", name: "Cirrostratus", rarity: "Uncommon", description: "Thin ice-crystal veil producing halos around the sun.", color: CLN_COLORS.softWhite, xpReward: 20, coinReward: 12 },
  mammatus: { id: "mammatus", name: "Mammatus", rarity: "Uncommon", description: "Pouch-like protrusions hanging beneath cloud bases.", color: CLN_COLORS.twilightPurple, xpReward: 28, coinReward: 16 },
  contrail: { id: "contrail", name: "Contrail", rarity: "Uncommon", description: "Crystal trail left by passing sky travelers.", color: CLN_COLORS.cloudWhite, xpReward: 20, coinReward: 12 },
  pileus: { id: "pileus", name: "Pileus", rarity: "Uncommon", description: "Small cap cloud crowning a growing thunderstorm.", color: CLN_COLORS.lavender, xpReward: 26, coinReward: 14 },
  asperatus: { id: "asperatus", name: "Undulatus Asperatus", rarity: "Rare", description: "Dramatic wave-like undulations resembling stormy seas.", color: CLN_COLORS.celestialIndigo, xpReward: 50, coinReward: 30 },
  noctilucent: { id: "noctilucent", name: "Noctilucent", rarity: "Rare", description: "Ethereal blue-glowing clouds at the edge of space.", color: "#7C3AED", xpReward: 55, coinReward: 35 },
  kelvin_helmholtz: { id: "kelvin_helmholtz", name: "Kelvin-Helmholtz", rarity: "Rare", description: "Spectacular breaking wave clouds from wind shear.", color: CLN_COLORS.auroraGreen, xpReward: 60, coinReward: 40 },
  morning_glory: { id: "morning_glory", name: "Morning Glory", rarity: "Rare", description: "Rare rolling tube clouds stretching for kilometers.", color: CLN_COLORS.sunrisePeach, xpReward: 55, coinReward: 35 },
  virga: { id: "virga", name: "Virga", rarity: "Rare", description: "Streaks of rain evaporating before reaching the ground.", color: CLN_COLORS.zephyrTeal, xpReward: 45, coinReward: 28 },
  arcus: { id: "arcus", name: "Arcus", rarity: "Rare", description: "Low rolling shelf cloud preceding a thunderstorm.", color: "#6366F1", xpReward: 50, coinReward: 32 },
  nacreous: { id: "nacreous", name: "Nacreous", rarity: "Epic", description: "Iridescent mother-of-pearl clouds glowing in polar stratosphere.", color: CLN_COLORS.rosePink, xpReward: 100, coinReward: 60 },
  fallstreak: { id: "fallstreak", name: "Fallstreak Hole", rarity: "Epic", description: "Circular gap in altocumulus with rainbow-edged ice crystals.", color: CLN_COLORS.rainbowGold, xpReward: 110, coinReward: 65 },
  pyrocumulus: { id: "pyrocumulus", name: "Pyrocumulus", rarity: "Epic", description: "Volcanic fire cloud blazing with internal heat.", color: CLN_COLORS.sunsetOrange, xpReward: 120, coinReward: 70 },
  iridescent: { id: "iridescent", name: "Iridescent Cloud", rarity: "Epic", description: "Rainbow-rimmed cloud diffraction painting the sky.", color: CLN_COLORS.nebulaPink, xpReward: 105, coinReward: 62 },
  diamond_dust: { id: "diamond_dust", name: "Diamond Dust", rarity: "Epic", description: "Ground-level ice crystal cloud sparkling like floating diamonds.", color: "#E2E8F0", xpReward: 115, coinReward: 68 },
  polar_stratospheric: { id: "polar_stratospheric", name: "Polar Stratospheric", rarity: "Epic", description: "Brilliant colorful clouds in extreme polar altitudes.", color: CLN_COLORS.frostCyan, xpReward: 125, coinReward: 72 },
  zodiacal: { id: "zodiacal", name: "Zodiacal Light Cloud", rarity: "Epic", description: "Triangular glow of cosmic dust along the ecliptic.", color: CLN_COLORS.starGold, xpReward: 108, coinReward: 64 },
  golden_fleece: { id: "golden_fleece", name: "Golden Fleece", rarity: "Legendary", description: "Mythical cloud woven from spun gold threads of sunset.", color: "#F59E0B", xpReward: 250, coinReward: 150 },
  celestial_pillar: { id: "celestial_pillar", name: "Celestial Pillar", rarity: "Legendary", description: "Towering vertical cloud column reaching from earth to heavens.", color: CLN_COLORS.lavender, xpReward: 300, coinReward: 180 },
  dreamweaver: { id: "dreamweaver", name: "Dreamweaver", rarity: "Legendary", description: "Shimmering cloud that captures and weaves dreams into reality.", color: CLN_COLORS.nebulaPink, xpReward: 280, coinReward: 170 },
  astral_nexus: { id: "astral_nexus", name: "Astral Nexus", rarity: "Legendary", description: "Interdimensional cloud bridge connecting parallel skies.", color: CLN_COLORS.celestialIndigo, xpReward: 320, coinReward: 200 },
  phoenix_veil: { id: "phoenix_veil", name: "Phoenix Veil", rarity: "Legendary", description: "Blazing regeneration cloud born from celestial fire.", color: CLN_COLORS.sunsetOrange, xpReward: 290, coinReward: 175 },
  eternal_serenity: { id: "eternal_serenity", name: "Eternal Serenity", rarity: "Legendary", description: "Perfectly still cloud radiating absolute tranquility.", color: CLN_COLORS.dreamMint, xpReward: 350, coinReward: 210 },
  starborn_crown: { id: "starborn_crown", name: "Starborn Crown", rarity: "Legendary", description: "Crown-shaped cloud constellation of living starlight.", color: CLN_COLORS.starGold, xpReward: 330, coinReward: 195 },
};

// ─── Sky Realm Definitions (8 realms) ────────────────────────────────────────

const CLN_REALMS: Record<string, Omit<RealmInstance, "unlocked" | "explored" | "expansionLevel" | "structures" | "visitCount">> = {
  sunrise_valley: { id: "sunrise_valley", name: "Sunrise Valley", maxExpansion: 10, currentWeather: "sunshine", ambientXpRate: 5, description: "A warm valley bathed in perpetual golden dawn light.", theme: CLN_COLORS.sunrisePeach },
  twilight_peak: { id: "twilight_peak", name: "Twilight Peak", maxExpansion: 10, currentWeather: "clear", ambientXpRate: 8, description: "Majestic purple mountain where day meets night.", theme: CLN_COLORS.twilightPurple },
  starlight_meadow: { id: "starlight_meadow", name: "Starlight Meadow", maxExpansion: 10, currentWeather: "clear", ambientXpRate: 10, description: "Gentle meadow illuminated by falling starlight petals.", theme: CLN_COLORS.starGold },
  rainbow_falls: { id: "rainbow_falls", name: "Rainbow Falls", maxExpansion: 10, currentWeather: "rainbow", ambientXpRate: 12, description: "Cascading waterfalls that split light into seven colors.", theme: CLN_COLORS.rainbowGold },
  aurora_heights: { id: "aurora_heights", name: "Aurora Heights", maxExpansion: 10, currentWeather: "aurora", ambientXpRate: 15, description: "Elevated plateau alive with dancing northern lights.", theme: CLN_COLORS.auroraGreen },
  zephyr_gardens: { id: "zephyr_gardens", name: "Zephyr Gardens", maxExpansion: 10, currentWeather: "gentle_rain", ambientXpRate: 12, description: "Suspended botanical gardens tended by gentle winds.", theme: CLN_COLORS.zephyrTeal },
  celestial_harbor: { id: "celestial_harbor", name: "Celestial Harbor", maxExpansion: 10, currentWeather: "clear", ambientXpRate: 18, description: "A shimmering dock where sky ships anchor among stars.", theme: CLN_COLORS.celestialIndigo },
  ether_palace: { id: "ether_palace", name: "Ether Palace", maxExpansion: 10, currentWeather: "clear", ambientXpRate: 25, description: "The ultimate sky domain: a palace woven from pure ether.", theme: CLN_COLORS.lavender },
};

// ─── Sky Materials (30) ──────────────────────────────────────────────────────

const CLN_MATERIALS: MaterialDef[] = [
  { id: "star_dust", name: "Star Dust", rarity: "Common", description: "Fine glittering particles shed by passing stars.", color: CLN_COLORS.starGold, gatherTime: 2, xpReward: 5 },
  { id: "rainbow_essence", name: "Rainbow Essence", rarity: "Common", description: "Liquid prismatic energy distilled from rainbows.", color: CLN_COLORS.rainbowGold, gatherTime: 2, xpReward: 5 },
  { id: "wind_crystal", name: "Wind Crystal", rarity: "Common", description: "Transparent crystal humming with captured breezes.", color: CLN_COLORS.skyBlue, gatherTime: 3, xpReward: 6 },
  { id: "sun_fragment", name: "Sun Fragment", rarity: "Common", description: "Warm glowing shard from the sun's outer corona.", color: CLN_COLORS.sunsetOrange, gatherTime: 3, xpReward: 7 },
  { id: "moonbeam_silk", name: "Moonbeam Silk", rarity: "Common", description: "Luminous thread spun from solidified moonlight.", color: CLN_COLORS.softWhite, gatherTime: 2, xpReward: 5 },
  { id: "cloud_cotton", name: "Cloud Cotton", rarity: "Common", description: "Soft tuft harvested from sleeping cumulus clouds.", color: CLN_COLORS.cloudWhite, gatherTime: 1, xpReward: 4 },
  { id: "sky_pearl", name: "Sky Pearl", rarity: "Common", description: "Iridescent pearl formed in high-altitude oysters.", color: CLN_COLORS.dreamMint, gatherTime: 3, xpReward: 6 },
  { id: "thunder_pebble", name: "Thunder Pebble", rarity: "Common", description: "Small electrified stone from lightning-struck clouds.", color: CLN_COLORS.sunsetOrange, gatherTime: 2, xpReward: 5 },
  { id: "frost_dewdrop", name: "Frost Dewdrop", rarity: "Uncommon", description: "Frozen dewdrop that never melts, radiating cold.", color: CLN_COLORS.frostCyan, gatherTime: 4, xpReward: 12 },
  { id: "aurora_thread", name: "Aurora Thread", rarity: "Uncommon", description: "Luminous fiber shimmering with aurora colors.", color: CLN_COLORS.auroraGreen, gatherTime: 4, xpReward: 14 },
  { id: "zephyr_feather", name: "Zephyr Feather", rarity: "Uncommon", description: "Weightless feather from the great wind birds.", color: CLN_COLORS.zephyrTeal, gatherTime: 5, xpReward: 13 },
  { id: "halo_ring", name: "Halo Ring", rarity: "Uncommon", description: "Ring of ice crystals from a sun halo phenomenon.", color: CLN_COLORS.lavender, gatherTime: 5, xpReward: 15 },
  { id: "dawn_blossom", name: "Dawn Blossom", rarity: "Uncommon", description: "Flower that blooms only at the first light of day.", color: CLN_COLORS.rosePink, gatherTime: 4, xpReward: 12 },
  { id: "dusk_ember", name: "Dusk Ember", rarity: "Uncommon", description: "Glowing coal caught from the dying sun's edge.", color: CLN_COLORS.sunrisePeach, gatherTime: 4, xpReward: 13 },
  { id: "comet_tail", name: "Comet Tail", rarity: "Uncommon", description: "Streak of cosmic ice trailing a passing comet.", color: CLN_COLORS.celestialIndigo, gatherTime: 5, xpReward: 14 },
  { id: "rainbow_quartz", name: "Rainbow Quartz", rarity: "Rare", description: "Crystal prisms that split light into perfect spectra.", color: CLN_COLORS.nebulaPink, gatherTime: 8, xpReward: 30 },
  { id: "starlight_sap", name: "Starlight Sap", rarity: "Rare", description: "Golden syrup flowing from celestial tree trunks.", color: CLN_COLORS.starGold, gatherTime: 8, xpReward: 32 },
  { id: "ether_fabric", name: "Ether Fabric", rarity: "Rare", description: "Woven cloth from the substance between worlds.", color: CLN_COLORS.lavender, gatherTime: 9, xpReward: 35 },
  { id: "solar_flare_gem", name: "Solar Flare Gem", rarity: "Rare", description: "Incandescent gemstone forged in solar eruptions.", color: CLN_COLORS.sunsetOrange, gatherTime: 9, xpReward: 36 },
  { id: "nebula_vapor", name: "Nebula Vapor", rarity: "Rare", description: "Swirling gas captured from distant nebulae.", color: CLN_COLORS.twilightPurple, gatherTime: 8, xpReward: 34 },
  { id: "void_pearl", name: "Void Pearl", rarity: "Epic", description: "Black pearl containing captured starless sky.", color: "#1E1B4B", gatherTime: 15, xpReward: 65 },
  { id: "genesis_spark", name: "Genesis Spark", rarity: "Epic", description: "Pure creative energy from the universe's birth.", color: CLN_COLORS.heavenAmber, gatherTime: 16, xpReward: 70 },
  { id: "dream_crystal", name: "Dream Crystal", rarity: "Epic", description: "Crystal containing a sleeping world inside.", color: CLN_COLORS.nebulaPink, gatherTime: 15, xpReward: 68 },
  { id: "time_sand", name: "Time Sand", rarity: "Epic", description: "Hourglass sand that slows or speeds time locally.", color: CLN_COLORS.etherSilver, gatherTime: 16, xpReward: 72 },
  { id: "cosmic_harmony", name: "Cosmic Harmony", rarity: "Epic", description: "Resonating orb containing perfect musical frequency.", color: CLN_COLORS.dreamMint, gatherTime: 15, xpReward: 66 },
  { id: "divine_breath", name: "Divine Breath", rarity: "Legendary", description: "Exhaled essence of the sky deity themselves.", color: CLN_COLORS.softWhite, gatherTime: 30, xpReward: 160 },
  { id: "eternal_ice", name: "Eternal Ice", rarity: "Legendary", description: "Ice that never melts and glows with inner light.", color: CLN_COLORS.frostCyan, gatherTime: 30, xpReward: 165 },
  { id: "world_seed", name: "World Seed", rarity: "Legendary", description: "Seed that can grow an entire floating island.", color: CLN_COLORS.auroraGreen, gatherTime: 30, xpReward: 170 },
  { id: "infinity_weave", name: "Infinity Weave", rarity: "Legendary", description: "Thread with no beginning and no end.", color: CLN_COLORS.celestialIndigo, gatherTime: 30, xpReward: 175 },
  { id: "sky_deity_heart", name: "Sky Deity Heart", rarity: "Legendary", description: "The crystallized heart of an ancient sky god.", color: CLN_COLORS.starGold, gatherTime: 35, xpReward: 200 },
];

// ─── Cloud Structures (25) ───────────────────────────────────────────────────

const CLN_STRUCTURES: Record<string, Omit<StructureInstance, "built" | "level" | "buildProgress">> = {
  floating_temple: { id: "floating_temple", name: "Floating Temple", maxLevel: 5, description: "Sacred temple hovering above the clouds.", materialCost: { cloud_cotton: 20, star_dust: 10, ether_fabric: 5 }, benefit: "+20% XP in realm" },
  wind_mill: { id: "wind_mill", name: "Wind Mill", maxLevel: 5, description: "Spinning windmill that generates wind energy.", materialCost: { wind_crystal: 15, cloud_cotton: 10 }, benefit: "+10 coins per visit" },
  sky_garden: { id: "sky_garden", name: "Sky Garden", maxLevel: 5, description: "Suspended botanical garden of rare sky plants.", materialCost: { cloud_cotton: 15, dawn_blossom: 8, zephyr_feather: 5 }, benefit: "+5 materials per harvest" },
  cloud_bridge: { id: "cloud_bridge", name: "Cloud Bridge", maxLevel: 3, description: "Sturdy bridge connecting two floating landmasses.", materialCost: { cloud_cotton: 25, wind_crystal: 15 }, benefit: "Unlocks new area" },
  star_observatory: { id: "star_observatory", name: "Star Observatory", maxLevel: 5, description: "Tower with a lens focused on distant stars.", materialCost: { star_dust: 20, starlight_sap: 10, void_pearl: 3 }, benefit: "+15% star event chance" },
  rainbow_forge: { id: "rainbow_forge", name: "Rainbow Forge", maxLevel: 5, description: "Magical forge that smelts rainbow metals.", materialCost: { rainbow_essence: 20, rainbow_quartz: 10, solar_flare_gem: 5 }, benefit: "+crafting quality" },
  aurora_lighthouse: { id: "aurora_lighthouse", name: "Aurora Lighthouse", maxLevel: 3, description: "Beacon emitting aurora light for sky navigation.", materialCost: { aurora_thread: 20, frost_dewdrop: 10, halo_ring: 8 }, benefit: "+exploration range" },
  zephyr_greenhouse: { id: "zephyr_greenhouse", name: "Zephyr Greenhouse", maxLevel: 5, description: "Climate-controlled greenhouse for exotic sky flora.", materialCost: { zephyr_feather: 15, dawn_blossom: 12, cloud_cotton: 10 }, benefit: "+garden yield" },
  ether_library: { id: "ether_library", name: "Ether Library", maxLevel: 5, description: "Floating archive of ancient sky knowledge.", materialCost: { ether_fabric: 15, moonbeam_silk: 10, time_sand: 5 }, benefit: "+10% all XP" },
  celestial_dock: { id: "celestial_dock", name: "Celestial Dock", maxLevel: 3, description: "Harbor where sky ships moor and resupply.", materialCost: { starlight_sap: 20, wind_crystal: 15, comet_tail: 10 }, benefit: "Unlocks sky ships" },
  cloud_condenser: { id: "cloud_condenser", name: "Cloud Condenser", maxLevel: 5, description: "Device that concentrates cloud matter for collection.", materialCost: { cloud_cotton: 20, frost_dewdrop: 10, wind_crystal: 10 }, benefit: "+cloud collection rate" },
  phoenix_nest: { id: "phoenix_nest", name: "Phoenix Nest", maxLevel: 3, description: "Sacred nesting ground for reborn fire birds.", materialCost: { dusk_ember: 15, solar_flare_gem: 10, genesis_spark: 3 }, benefit: "+creature friendship" },
  dream_sanctum: { id: "dream_sanctum", name: "Dream Sanctum", maxLevel: 5, description: "Serene chamber amplifying dream energy.", materialCost: { moonbeam_silk: 20, dream_crystal: 10, nebula_vapor: 5 }, benefit: "+mana regeneration" },
  weather_spire: { id: "weather_spire", name: "Weather Spire", maxLevel: 5, description: "Control tower for manipulating local weather.", materialCost: { thunder_pebble: 20, wind_crystal: 15, solar_flare_gem: 5 }, benefit: "+weather control" },
  dawn_altar: { id: "dawn_altar", name: "Dawn Altar", maxLevel: 3, description: "Altar channeling the first light of morning.", materialCost: { dawn_blossom: 15, sun_fragment: 10, star_dust: 10 }, benefit: "+daily quest reward" },
  twilight_shrine: { id: "twilight_shrine", name: "Twilight Shrine", maxLevel: 3, description: "Mystical shrine powered by twilight energy.", materialCost: { dusk_ember: 15, moonbeam_silk: 10, aurora_thread: 8 }, benefit: "+night bonuses" },
  star_cradle: { id: "star_cradle", name: "Star Cradle", maxLevel: 5, description: "Nursery for young celestial beings.", materialCost: { star_dust: 25, starlight_sap: 15, genesis_spark: 5 }, benefit: "+star event rewards" },
  cloud_arena: { id: "cloud_arena", name: "Cloud Arena", maxLevel: 3, description: "Circular arena floating among the clouds.", materialCost: { cloud_cotton: 30, thunder_pebble: 15, wind_crystal: 10 }, benefit: "+race/surf rewards" },
  harmony_bell: { id: "harmony_bell", name: "Harmony Bell", maxLevel: 5, description: "Giant resonating bell that calms the sky.", materialCost: { cosmic_harmony: 10, wind_crystal: 15, ether_fabric: 10 }, benefit: "+creature taming" },
  void_gateway: { id: "void_gateway", name: "Void Gateway", maxLevel: 3, description: "Portal leading to spaces between realms.", materialCost: { void_pearl: 5, time_sand: 10, ether_fabric: 15 }, benefit: "+realm connections" },
  sunbath_terrace: { id: "sunbath_terrace", name: "Sunbath Terrace", maxLevel: 5, description: "Warm terrace perfect for sun-loving creatures.", materialCost: { sun_fragment: 20, cloud_cotton: 15, dawn_blossom: 10 }, benefit: "+creature happiness" },
  moondial: { id: "moondial", name: "Moondial", maxLevel: 5, description: "Ancient device tracking lunar cycles and tides.", materialCost: { moonbeam_silk: 20, frost_dewdrop: 15, void_pearl: 3 }, benefit: "+mana max" },
  trade_pavilion: { id: "trade_pavilion", name: "Trade Pavilion", maxLevel: 5, description: "Open-air market for sky material trading.", materialCost: { cloud_cotton: 20, rainbow_essence: 10, sky_pearl: 15 }, benefit: "+trade value" },
  creation_forge: { id: "creation_forge", name: "Creation Forge", maxLevel: 5, description: "Ultimate forge that can craft divine items.", materialCost: { genesis_spark: 5, solar_flare_gem: 10, world_seed: 3 }, benefit: "+legendary crafting" },
  eternal_spring: { id: "eternal_spring", name: "Eternal Spring", maxLevel: 3, description: "Bottomless spring of pure sky water.", materialCost: { frost_dewdrop: 20, eternal_ice: 5, divine_breath: 2 }, benefit: "+resource regeneration" },
};

// ─── Sky Abilities (22) ──────────────────────────────────────────────────────

const CLN_ABILITIES: Omit<SkyAbility, "unlocked" | "currentCooldown">[] = [
  { id: "wind_ride", name: "Wind Ride", description: "Summon a friendly wind to carry you swiftly across the sky.", cooldown: 30, manaCost: 10, effectType: "movement" },
  { id: "cloud_shape", name: "Cloud Shape", description: "Mold clouds into desired forms with gentle telekinetic pressure.", cooldown: 20, manaCost: 8, effectType: "crafting" },
  { id: "rainbow_bridge", name: "Rainbow Bridge", description: "Create a solid rainbow path between two points.", cooldown: 60, manaCost: 25, effectType: "utility" },
  { id: "sun_summon", name: "Sun Summon", description: "Call forth concentrated sunlight to illuminate and warm an area.", cooldown: 45, manaCost: 20, effectType: "weather" },
  { id: "moon_shield", name: "Moon Shield", description: "Wrap yourself in protective moonlight that deflects harm.", cooldown: 50, manaCost: 22, effectType: "defense" },
  { id: "star_shower", name: "Star Shower", description: "Trigger a cascade of shooting stars that drop XP and coins.", cooldown: 90, manaCost: 35, effectType: "reward" },
  { id: "breeze_heal", name: "Breeze Heal", description: "Channel healing winds that restore energy and mana.", cooldown: 40, manaCost: 15, effectType: "heal" },
  { id: "fog_veil", name: "Fog Veil", description: "Blanket an area in obscuring mist for stealth.", cooldown: 35, manaCost: 18, effectType: "utility" },
  { id: "thunder_call", name: "Thunder Call", description: "Command thunder to strike a target with electric force.", cooldown: 55, manaCost: 30, effectType: "offense" },
  { id: "aurora_wave", name: "Aurora Wave", description: "Release a wave of aurora light that boosts all allies.", cooldown: 70, manaCost: 28, effectType: "buff" },
  { id: "cloud_walk", name: "Cloud Walk", description: "Solidify clouds beneath your feet for walking.", cooldown: 25, manaCost: 12, effectType: "movement" },
  { id: "wind_shear", name: "Wind Shear", description: "Create a cutting wind current at high speed.", cooldown: 35, manaCost: 20, effectType: "offense" },
  { id: "sky_sight", name: "Sky Sight", description: "See through clouds and perceive hidden sky objects.", cooldown: 30, manaCost: 15, effectType: "utility" },
  { id: "rain_call", name: "Rain Call", description: "Summon gentle or heavy rain over an area.", cooldown: 40, manaCost: 18, effectType: "weather" },
  { id: "snow_blessing", name: "Snow Blessing", description: "Cover the sky in beautiful, beneficial snowfall.", cooldown: 45, manaCost: 20, effectType: "weather" },
  { id: "ether_flash", name: "Ether Flash", description: "Teleport a short distance through the ether.", cooldown: 20, manaCost: 10, effectType: "movement" },
  { id: "star_map", name: "Star Map", description: "Project a celestial map revealing nearby points of interest.", cooldown: 50, manaCost: 22, effectType: "utility" },
  { id: "gale_force", name: "Gale Force", description: "Unleash a powerful gale that clears obstacles.", cooldown: 60, manaCost: 32, effectType: "offense" },
  { id: "zenith_glow", name: "Zenith Glow", description: "Radiate light from above, boosting all nearby XP gains.", cooldown: 80, manaCost: 40, effectType: "buff" },
  { id: "time_breeze", name: "Time Breeze", description: "Slow local time for careful exploration or crafting.", cooldown: 100, manaCost: 50, effectType: "utility" },
  { id: "cosmic_harmony", name: "Cosmic Harmony", description: "Align all nearby elements into perfect balance.", cooldown: 120, manaCost: 60, effectType: "buff" },
  { id: "sky_deity_blessing", name: "Sky Deity Blessing", description: "Channel the ultimate blessing of the sky deity.", cooldown: 300, manaCost: 100, effectType: "ultimate" },
];

// ─── Sky Creatures (15) ──────────────────────────────────────────────────────

const CLN_CREATURES: Record<string, Omit<CreatureInstance, "befriended" | "friendshipLevel" | "trainProgress">> = {
  wind_spirit: { id: "wind_spirit", name: "Wind Spirit", type: "Elemental", description: "Mischievous spirit that dances on breezes.", ability: "Increases cloud collection speed", rarity: "Common", color: CLN_COLORS.zephyrTeal, maxFriendship: 100 },
  sky_squirrel: { id: "sky_squirrel", name: "Sky Squirrel", type: "Animal", description: "Tiny squirrel with wings that hoards star dust.", ability: "Finds extra star dust", rarity: "Common", color: CLN_COLORS.sunrisePeach, maxFriendship: 100 },
  cloud_butterfly: { id: "cloud_butterfly", name: "Cloud Butterfly", type: "Insect", description: "Butterfly whose wings are made of tiny clouds.", ability: "Spawns bonus clouds", rarity: "Common", color: CLN_COLORS.lavender, maxFriendship: 100 },
  sun_finach: { id: "sun_finach", name: "Sun Finch", type: "Bird", description: "Small golden bird that sings at sunrise.", ability: "+sun fragment gathering", rarity: "Uncommon", color: CLN_COLORS.starGold, maxFriendship: 150 },
  frost_hawk: { id: "frost_hawk", name: "Frost Hawk", type: "Bird", description: "Majestic hawk trailing frost from its wings.", ability: "Enables cold weather travel", rarity: "Uncommon", color: CLN_COLORS.frostCyan, maxFriendship: 150 },
  rainbow_serpeant: { id: "rainbow_serpeant", name: "Rainbow Serpent", type: "Mythic", description: "Ancient serpent whose scales shimmer with colors.", ability: "+rainbow essence gathering", rarity: "Rare", color: CLN_COLORS.rainbowGold, maxFriendship: 200 },
  storm_gryphon: { id: "storm_gryphon", name: "Storm Gryphon", type: "Mythic", description: "Half-lion, half-eagle creature born in storms.", ability: "Enables storm weather travel", rarity: "Rare", color: CLN_COLORS.twilightPurple, maxFriendship: 200 },
  aurora_fox: { id: "aurora_fox", name: "Aurora Fox", type: "Spirit", description: "Ethereal fox with a tail of flowing aurora light.", ability: "+aurora event detection", rarity: "Rare", color: CLN_COLORS.auroraGreen, maxFriendship: 200 },
  moon_rabbit: { id: "moon_rabbit", name: "Moon Rabbit", type: "Spirit", description: "Gentle rabbit that lives on the moon's surface.", ability: "+moonbeam silk gathering", rarity: "Epic", color: CLN_COLORS.softWhite, maxFriendship: 250 },
  star_whale: { id: "star_whale", name: "Star Whale", type: "Celestial", description: "Massive whale that swims through the night sky.", ability: "+star event rewards", rarity: "Epic", color: CLN_COLORS.celestialIndigo, maxFriendship: 250 },
  thunder_dragon: { id: "thunder_dragon", name: "Thunder Dragon", type: "Dragon", description: "Dragon whose roar summons thunderstorms.", ability: "Weather control power", rarity: "Epic", color: CLN_COLORS.sunsetOrange, maxFriendship: 250 },
  cloud_phoenix: { id: "cloud_phoenix", name: "Cloud Phoenix", type: "Mythic", description: "Phoenix reborn from burning clouds.", ability: "+fire ability power", rarity: "Legendary", color: CLN_COLORS.heavenAmber, maxFriendship: 300 },
  ether_qilin: { id: "ether_qilin", name: "Ether Qilin", type: "Celestial", description: "Wisest of all sky creatures, guardian of balance.", ability: "+all XP gains", rarity: "Legendary", color: CLN_COLORS.dreamMint, maxFriendship: 300 },
  celestial_serpent: { id: "celestial_serpent", name: "Celestial Serpent", type: "Celestial", description: "Giant serpent that holds the sky together.", ability: "+realm stability", rarity: "Legendary", color: CLN_COLORS.nebulaPink, maxFriendship: 300 },
  sky_deity_companion: { id: "sky_deity_companion", name: "Sky Deity Companion", type: "Divine", description: "A fragment of the sky deity given physical form.", ability: "All bonuses doubled", rarity: "Legendary", color: CLN_COLORS.starGold, maxFriendship: 500 },
};

// ─── Achievements (18) ───────────────────────────────────────────────────────

const CLN_ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_cloud", name: "First Cloud", description: "Collect your very first cloud.", icon: "☁️", requirement: "totalCloudsCollected", checkValue: 1 },
  { id: "cloud_collector_10", name: "Cloud Collector", description: "Collect 10 clouds.", icon: "🌤️", requirement: "totalCloudsCollected", checkValue: 10 },
  { id: "cloud_master_25", name: "Cloud Master", description: "Collect 25 clouds.", icon: "⛅", requirement: "totalCloudsCollected", checkValue: 25 },
  { id: "cloud_lord_all", name: "Cloud Lord", description: "Collect all 35 cloud types.", icon: "🌪️", requirement: "totalCloudsCollected", checkValue: 35 },
  { id: "first_shape", name: "First Shape", description: "Shape your first cloud.", icon: "🎨", requirement: "totalCloudsShaped", checkValue: 1 },
  { id: "shaper_10", name: "Cloud Shaper", description: "Shape 10 clouds.", icon: "✨", requirement: "totalCloudsShaped", checkValue: 10 },
  { id: "realm_explorer", name: "Realm Explorer", description: "Explore 3 different realms.", icon: "🏔️", requirement: "totalRealmsExplored", checkValue: 3 },
  { id: "realm_master", name: "Realm Master", description: "Explore all 8 realms.", icon: "🌍", requirement: "totalRealmsExplored", checkValue: 8 },
  { id: "creature_friend", name: "Creature Friend", description: "Befriend 3 sky creatures.", icon: "🦅", requirement: "totalCreaturesBefriended", checkValue: 3 },
  { id: "creature_whisperer", name: "Creature Whisperer", description: "Befriend 8 sky creatures.", icon: "🐉", requirement: "totalCreaturesBefriended", checkValue: 8 },
  { id: "architect", name: "Sky Architect", description: "Build 10 structures across all realms.", icon: "🏛️", requirement: "totalStructuresBuilt", checkValue: 10 },
  { id: "master_crafter", name: "Master Crafter", description: "Craft 15 sky items.", icon: "🔨", requirement: "totalItemsCrafted", checkValue: 15 },
  { id: "racer", name: "Sky Racer", description: "Complete 5 sky races.", icon: "🏎️", requirement: "totalRacesCompleted", checkValue: 5 },
  { id: "surfer", name: "Cloud Surfer", description: "Complete 5 cloud surfs.", icon: "🏄", requirement: "totalSurfsCompleted", checkValue: 5 },
  { id: "weather_master", name: "Weather Master", description: "Change weather 10 times.", icon: "🌦️", requirement: "weatherChanges", checkValue: 10 },
  { id: "streak_7", name: "Week Streak", description: "Maintain a 7-day login streak.", icon: "🔥", requirement: "dayStreak", checkValue: 7 },
  { id: "streak_30", name: "Month Streak", description: "Maintain a 30-day login streak.", icon: "🌟", requirement: "dayStreak", checkValue: 30 },
  { id: "level_50", name: "Ascendant", description: "Reach level 50.", icon: "👑", requirement: "level", checkValue: 50 },
];

// ─── Titles (8) ──────────────────────────────────────────────────────────────

const CLN_TITLES: TitleDef[] = [
  { id: 0, name: "Cloud Watcher", requirement: 1, color: CLN_COLORS.skyBlue },
  { id: 1, name: "Wind Rider", requirement: 5, color: CLN_COLORS.zephyrTeal },
  { id: 2, name: "Sky Wanderer", requirement: 10, color: CLN_COLORS.lavender },
  { id: 3, name: "Cloud Sculptor", requirement: 20, color: CLN_COLORS.rainbowGold },
  { id: 4, name: "Realm Guardian", requirement: 30, color: CLN_COLORS.auroraGreen },
  { id: 5, name: "Sky Architect", requirement: 40, color: CLN_COLORS.sunsetOrange },
  { id: 6, name: "Celestial Sage", requirement: 50, color: CLN_COLORS.nebulaPink },
  { id: 7, name: "Supreme Sky Deity", requirement: 75, color: CLN_COLORS.starGold },
];

// ─── Recipes (20) ────────────────────────────────────────────────────────────

const CLN_RECIPES: RecipeDef[] = [
  { id: "cloud_fluff", name: "Cloud Fluff", description: "Extra-soft cloud material for crafting.", ingredients: { cloud_cotton: 5, wind_crystal: 2 }, resultId: "cloud_fluff", resultName: "Cloud Fluff", resultRarity: "Common", xpReward: 15, coinReward: 10 },
  { id: "star_pendant", name: "Star Pendant", description: "Glowing necklace of crystallized starlight.", ingredients: { star_dust: 8, sky_pearl: 3 }, resultId: "star_pendant", resultName: "Star Pendant", resultRarity: "Common", xpReward: 20, coinReward: 12 },
  { id: "rainbow_thread", name: "Rainbow Thread", description: "Prismatic thread that shifts colors endlessly.", ingredients: { rainbow_essence: 5, moonbeam_silk: 3 }, resultId: "rainbow_thread", resultName: "Rainbow Thread", resultRarity: "Uncommon", xpReward: 30, coinReward: 20 },
  { id: "wind_charm", name: "Wind Charm", description: "Amulet that grants minor wind control.", ingredients: { wind_crystal: 8, zephyr_feather: 4 }, resultId: "wind_charm", resultName: "Wind Charm", resultRarity: "Uncommon", xpReward: 35, coinReward: 22 },
  { id: "dawn_elixir", name: "Dawn Elixir", description: "Potion that restores mana at sunrise.", ingredients: { dawn_blossom: 5, sun_fragment: 3, frost_dewdrop: 2 }, resultId: "dawn_elixir", resultName: "Dawn Elixir", resultRarity: "Uncommon", xpReward: 40, coinReward: 25 },
  { id: "aurora_cloak", name: "Aurora Cloak", description: "Cloak woven from aurora threads.", ingredients: { aurora_thread: 8, ether_fabric: 4, sky_pearl: 3 }, resultId: "aurora_cloak", resultName: "Aurora Cloak", resultRarity: "Rare", xpReward: 60, coinReward: 40 },
  { id: "starlight_lens", name: "Starlight Lens", description: "Lens that reveals hidden celestial objects.", ingredients: { starlight_sap: 8, void_pearl: 2, halo_ring: 5 }, resultId: "starlight_lens", resultName: "Starlight Lens", resultRarity: "Rare", xpReward: 70, coinReward: 45 },
  { id: "frost_blade", name: "Frost Blade", description: "Sword of eternal ice that never thaws.", ingredients: { eternal_ice: 3, frost_dewdrop: 10, wind_crystal: 5 }, resultId: "frost_blade", resultName: "Frost Blade", resultRarity: "Rare", xpReward: 65, coinReward: 42 },
  { id: "rainbow_crown", name: "Rainbow Crown", description: "Crown that refracts light into all colors.", ingredients: { rainbow_quartz: 5, solar_flare_gem: 3, sky_pearl: 8 }, resultId: "rainbow_crown", resultName: "Rainbow Crown", resultRarity: "Epic", xpReward: 120, coinReward: 80 },
  { id: "dream_orb", name: "Dream Orb", description: "Glass sphere containing a miniature dreamscape.", ingredients: { dream_crystal: 3, moonbeam_silk: 8, nebula_vapor: 5 }, resultId: "dream_orb", resultName: "Dream Orb", resultRarity: "Epic", xpReward: 130, coinReward: 85 },
  { id: "time_hourglass", name: "Time Hourglass", description: "Hourglass that can slow or accelerate local time.", ingredients: { time_sand: 8, void_pearl: 3, ether_fabric: 5 }, resultId: "time_hourglass", resultName: "Time Hourglass", resultRarity: "Epic", xpReward: 140, coinReward: 90 },
  { id: "genesis_seed", name: "Genesis Seed", description: "Primordial seed containing the blueprint of a sky world.", ingredients: { genesis_spark: 3, world_seed: 2, divine_breath: 1 }, resultId: "genesis_seed", resultName: "Genesis Seed", resultRarity: "Legendary", xpReward: 250, coinReward: 160 },
  { id: "sky_deity_robe", name: "Sky Deity Robe", description: "Robe woven from the fabric of the heavens.", ingredients: { infinity_weave: 3, ether_fabric: 10, cosmic_harmony: 2 }, resultId: "sky_deity_robe", resultName: "Sky Deity Robe", resultRarity: "Legendary", xpReward: 280, coinReward: 180 },
  { id: "thunder_ring", name: "Thunder Ring", description: "Ring that crackles with captured lightning.", ingredients: { thunder_pebble: 10, solar_flare_gem: 2, wind_crystal: 8 }, resultId: "thunder_ring", resultName: "Thunder Ring", resultRarity: "Rare", xpReward: 68, coinReward: 45 },
  { id: "moon_droplet", name: "Moon Droplet", description: "Concentrated moonlight in liquid form.", ingredients: { moonbeam_silk: 6, frost_dewdrop: 5, sky_pearl: 4 }, resultId: "moon_droplet", resultName: "Moon Droplet", resultRarity: "Uncommon", xpReward: 38, coinReward: 24 },
  { id: "sun_shield", name: "Sun Shield", description: "Shield that blazes with solar energy.", ingredients: { sun_fragment: 10, solar_flare_gem: 2, genesis_spark: 1 }, resultId: "sun_shield", resultName: "Sun Shield", resultRarity: "Epic", xpReward: 135, coinReward: 88 },
  { id: "ether_boots", name: "Ether Boots", description: "Boots that let you walk on clouds.", ingredients: { ether_fabric: 8, cloud_cotton: 10, zephyr_feather: 5 }, resultId: "ether_boots", resultName: "Ether Boots", resultRarity: "Rare", xpReward: 55, coinReward: 35 },
  { id: "cosmic_lyre", name: "Cosmic Lyre", description: "Musical instrument tuned to the frequency of stars.", ingredients: { cosmic_harmony: 3, starlight_sap: 8, time_sand: 3 }, resultId: "cosmic_lyre", resultName: "Cosmic Lyre", resultRarity: "Legendary", xpReward: 260, coinReward: 170 },
  { id: "nebula_staff", name: "Nebula Staff", description: "Staff swirling with captured nebula gases.", ingredients: { nebula_vapor: 5, void_pearl: 2, star_dust: 15 }, resultId: "nebula_staff", resultName: "Nebula Staff", resultRarity: "Epic", xpReward: 125, coinReward: 82 },
  { id: "world_tree_sapling", name: "World Tree Sapling", description: "Sapling of the great sky world tree.", ingredients: { world_seed: 2, dawn_blossom: 10, starlight_sap: 10, divine_breath: 1 }, resultId: "world_tree_sapling", resultName: "World Tree Sapling", resultRarity: "Legendary", xpReward: 300, coinReward: 200 },
];

// ─── Star Events (8) ─────────────────────────────────────────────────────────

const CLN_STAR_EVENTS: Record<string, Omit<StarEvent, "active">> = {
  meteor_shower: { id: "meteor_shower", name: "Meteor Shower", description: "Shooting stars rain across the sky, dropping rare materials.", duration: 300, reward: { star_dust: 20, starlight_sap: 5, xp: 100 }, rarity: "Common" },
  solar_halo: { id: "solar_halo", name: "Solar Halo", description: "A magnificent halo encircles the sun, boosting sun-related activities.", duration: 240, reward: { sun_fragment: 15, halo_ring: 3, xp: 80 }, rarity: "Common" },
  moonbow: { id: "moonbow", name: "Moonbow", description: "A rare moonbow forms, doubling rainbow essence drops.", duration: 200, reward: { rainbow_essence: 20, moonbeam_silk: 10, xp: 120 }, rarity: "Uncommon" },
  aurora_storm: { id: "aurora_storm", name: "Aurora Storm", description: "The most intense aurora display illuminates the entire sky.", duration: 360, reward: { aurora_thread: 15, genesis_spark: 2, xp: 150 }, rarity: "Rare" },
  comet_passage: { id: "comet_passage", name: "Comet Passage", description: "A brilliant comet streaks past, leaving cosmic treasures.", duration: 180, reward: { comet_tail: 10, star_dust: 30, xp: 200 }, rarity: "Rare" },
  stellar_convergence: { id: "stellar_convergence", name: "Stellar Convergence", description: "Stars align in perfect formation, granting divine blessings.", duration: 120, reward: { divine_breath: 1, star_dust: 50, xp: 300 }, rarity: "Epic" },
  cosmic_bloom: { id: "cosmic_bloom", name: "Cosmic Bloom", description: "Space flowers bloom across the sky realm, producing rare seeds.", duration: 300, reward: { world_seed: 1, dawn_blossom: 20, xp: 250 }, rarity: "Epic" },
  eclipse_of_ages: { id: "eclipse_of_ages", name: "Eclipse of Ages", description: "A celestial eclipse that unlocks hidden sky secrets.", duration: 180, reward: { sky_deity_heart: 1, void_pearl: 5, xp: 500 }, rarity: "Legendary" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createInitialClouds(): Record<string, CloudInstance> {
  const result: Record<string, CloudInstance> = {};
  for (const [key, def] of Object.entries(CLN_CLOUDS)) {
    result[key] = { ...def, collected: false, shaped: false, shapeProgress: 0, count: 0 };
  }
  return result;
}

function createInitialRealms(): Record<string, RealmInstance> {
  const result: Record<string, RealmInstance> = {};
  for (const [key, def] of Object.entries(CLN_REALMS)) {
    const structures: Record<string, StructureInstance> = {};
    for (const [sKey, sDef] of Object.entries(CLN_STRUCTURES)) {
      structures[sKey] = { ...sDef, built: false, level: 0, buildProgress: 0 };
    }
    result[key] = {
      ...def,
      unlocked: key === "sunrise_valley",
      explored: false,
      expansionLevel: 0,
      structures,
      visitCount: 0,
    };
  }
  return result;
}

function createInitialCreatures(): Record<string, CreatureInstance> {
  const result: Record<string, CreatureInstance> = {};
  for (const [key, def] of Object.entries(CLN_CREATURES)) {
    result[key] = { ...def, befriended: false, friendshipLevel: 0, trainProgress: 0 };
  }
  return result;
}

function createInitialAbilities(): Record<string, SkyAbility> {
  const result: Record<string, SkyAbility> = {};
  for (const ab of CLN_ABILITIES) {
    result[ab.id] = { ...ab, unlocked: false, currentCooldown: 0 };
  }
  return result;
}

function createInitialStarEvents(): Record<string, StarEvent> {
  const result: Record<string, StarEvent> = {};
  for (const [key, def] of Object.entries(CLN_STAR_EVENTS)) {
    result[key] = { ...def, active: false };
  }
  return result;
}

function getDefaultState(): CloudNineState {
  return {
    level: 1,
    xp: 0,
    maxXp: 100,
    coins: 50,
    clouds: createInitialClouds(),
    realms: createInitialRealms(),
    discoveries: [],
    achievements: [],
    currentTitle: 0,
    inventory: {},
    dailyQuest: { completed: false, progress: 0, target: 5, type: "collect_clouds", reward: { coins: 30, xp: 50 } },
    dayStreak: 0,
    skyCreatures: createInitialCreatures(),
    abilities: createInitialAbilities(),
    starEvents: createInitialStarEvents(),
    skyRace: { active: false, distance: 0, speed: 0, finishLine: 1000, rewards: {} },
    cloudSurf: { active: false, waveHeight: 0, balance: 50, score: 0, combo: 0 },
    totalCloudsCollected: 0,
    totalCloudsShaped: 0,
    totalRealmsExplored: 0,
    totalCreaturesBefriended: 0,
    totalStructuresBuilt: 0,
    totalItemsCrafted: 0,
    totalRacesCompleted: 0,
    totalSurfsCompleted: 0,
    weatherChanges: 0,
    mana: 50,
    maxMana: 100,
    lastPlayDate: "",
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export default function useCloudNine(initialState?: CloudNineState) {
  const [state, setState] = useState<CloudNineState>(initialState ?? getDefaultState());
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Core Getters ─────────────────────────────────────────────────────────

  const getLevel = useCallback(() => {
    return stateRef.current.level;
  }, []);

  const getXp = useCallback(() => {
    return stateRef.current.xp;
  }, []);

  const getMaxXp = useCallback(() => {
    return stateRef.current.maxXp;
  }, []);

  const getCoins = useCallback(() => {
    return stateRef.current.coins;
  }, []);

  const getMana = useCallback(() => {
    return stateRef.current.mana;
  }, []);

  const getMaxMana = useCallback(() => {
    return stateRef.current.maxMana;
  }, []);

  const getDayStreak = useCallback(() => {
    return stateRef.current.dayStreak;
  }, []);

  const getTitle = useCallback((): TitleDef => {
    let best = CLN_TITLES[0];
    for (const title of CLN_TITLES) {
      if (stateRef.current.level >= title.requirement) {
        best = title;
      }
    }
    return best;
  }, []);

  const getCurrentTitle = useCallback((): TitleDef => {
    return CLN_TITLES[stateRef.current.currentTitle] || CLN_TITLES[0];
  }, []);

  const getXpProgress = useCallback(() => {
    const s = stateRef.current;
    return s.maxXp > 0 ? (s.xp / s.maxXp) * 100 : 0;
  }, []);

  // ── XP / Level ───────────────────────────────────────────────────────────

  const addXp = useCallback((amount: number) => {
    setState((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(100 * Math.pow(1.15, newLevel - 1));
      }
      return { ...prev, xp: newXp, level: newLevel, maxXp: newMaxXp };
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: Math.max(0, prev.coins + amount) }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.coins >= amount) {
        success = true;
        return { ...prev, coins: prev.coins - amount };
      }
      return prev;
    });
    return success;
  }, []);

  const addMana = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      mana: Math.min(prev.maxMana, prev.mana + amount),
    }));
  }, []);

  const spendMana = useCallback((amount: number): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.mana >= amount) {
        success = true;
        return { ...prev, mana: prev.mana - amount };
      }
      return prev;
    });
    return success;
  }, []);

  const regenerateMana = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      mana: Math.min(prev.maxMana, prev.mana + amount),
    }));
  }, []);

  // ── Cloud Getters ────────────────────────────────────────────────────────

  const getCloud = useCallback((id: string): CloudInstance | null => {
    return stateRef.current.clouds[id] || null;
  }, []);

  const getAllClouds = useCallback((): Record<string, CloudInstance> => {
    return stateRef.current.clouds;
  }, []);

  const getCloudsByRarity = useCallback((rarity: Rarity): CloudInstance[] => {
    return Object.values(stateRef.current.clouds).filter((c) => c.rarity === rarity);
  }, []);

  const getCollectedClouds = useCallback((): CloudInstance[] => {
    return Object.values(stateRef.current.clouds).filter((c) => c.collected);
  }, []);

  const getShapedClouds = useCallback((): CloudInstance[] => {
    return Object.values(stateRef.current.clouds).filter((c) => c.shaped);
  }, []);

  const getUncollectedClouds = useCallback((): CloudInstance[] => {
    return Object.values(stateRef.current.clouds).filter((c) => !c.collected);
  }, []);

  const getCloudCount = useCallback((): number => {
    return Object.values(stateRef.current.clouds).filter((c) => c.collected).length;
  }, []);

  const getTotalCloudCount = useCallback((): number => {
    return Object.keys(stateRef.current.clouds).length;
  }, []);

  // ── Cloud Actions ────────────────────────────────────────────────────────

  const collectCloud = useCallback((cloudId: string): boolean => {
    let collected = false;
    let xpReward = 0;
    let coinReward = 0;
    setState((prev) => {
      const cloud = prev.clouds[cloudId];
      if (!cloud || cloud.collected) return prev;
      collected = true;
      xpReward = cloud.xpReward;
      coinReward = cloud.coinReward;
      const newClouds = { ...prev.clouds };
      newClouds[cloudId] = {
        ...cloud,
        collected: true,
        count: cloud.count + 1,
      };
      return {
        ...prev,
        clouds: newClouds,
        totalCloudsCollected: prev.totalCloudsCollected + 1,
        discoveries: prev.discoveries.includes(cloudId) ? prev.discoveries : [...prev.discoveries, cloudId],
      };
    });
    if (collected) {
      addXp(xpReward);
      addCoins(coinReward);
      incrementQuestProgress("collect_clouds");
    }
    return collected;
  }, [addXp, addCoins]);

  const collectCloudMultiple = useCallback((cloudId: string, count: number): number => {
    let totalCollected = 0;
    let totalXp = 0;
    let totalCoins = 0;
    for (let i = 0; i < count; i++) {
      const cloud = stateRef.current.clouds[cloudId];
      if (!cloud) break;
      setState((prev) => {
        const c = prev.clouds[cloudId];
        if (!c) return prev;
        const newClouds = { ...prev.clouds };
        if (!c.collected) {
          newClouds[cloudId] = { ...c, collected: true, count: c.count + 1 };
          totalXp += c.xpReward;
          totalCoins += c.coinReward;
          totalCollected++;
          return {
            ...prev,
            clouds: newClouds,
            totalCloudsCollected: prev.totalCloudsCollected + 1,
            discoveries: prev.discoveries.includes(cloudId) ? prev.discoveries : [...prev.discoveries, cloudId],
          };
        } else {
          newClouds[cloudId] = { ...c, count: c.count + 1 };
          totalXp += Math.floor(c.xpReward / 2);
          totalCoins += Math.floor(c.coinReward / 2);
          totalCollected++;
          return { ...prev, clouds: newClouds };
        }
      });
    }
    if (totalCollected > 0) {
      addXp(totalXp);
      addCoins(totalCoins);
      incrementQuestProgress("collect_clouds", totalCollected);
    }
    return totalCollected;
  }, [addXp, addCoins]);

  const shapeCloud = useCallback((cloudId: string): boolean => {
    let shaped = false;
    let xpReward = 0;
    setState((prev) => {
      const cloud = prev.clouds[cloudId];
      if (!cloud || !cloud.collected || cloud.shaped) return prev;
      const progress = cloud.shapeProgress + 25;
      if (progress >= 100) {
        shaped = true;
        xpReward = cloud.xpReward * 3;
        const newClouds = { ...prev.clouds };
        newClouds[cloudId] = { ...cloud, shaped: true, shapeProgress: 100 };
        return { ...prev, clouds: newClouds, totalCloudsShaped: prev.totalCloudsShaped + 1 };
      }
      const newClouds = { ...prev.clouds };
      newClouds[cloudId] = { ...cloud, shapeProgress: progress };
      return { ...prev, clouds: newClouds };
    });
    if (shaped) {
      addXp(xpReward);
      addCoins(20);
      incrementQuestProgress("shape_clouds");
    }
    return shaped;
  }, [addXp, addCoins]);

  const advanceCloudShaping = useCallback((cloudId: string, amount: number): number => {
    let newProgress = 0;
    setState((prev) => {
      const cloud = prev.clouds[cloudId];
      if (!cloud || !cloud.collected || cloud.shaped) { newProgress = cloud?.shapeProgress ?? 0; return prev; }
      const progress = Math.min(100, cloud.shapeProgress + amount);
      newProgress = progress;
      const newClouds = { ...prev.clouds };
      newClouds[cloudId] = { ...cloud, shapeProgress: progress };
      return { ...prev, clouds: newClouds };
    });
    return newProgress;
  }, []);

  // ── Realm Getters ────────────────────────────────────────────────────────

  const getRealm = useCallback((id: string): RealmInstance | null => {
    return stateRef.current.realms[id] || null;
  }, []);

  const getAllRealms = useCallback((): Record<string, RealmInstance> => {
    return stateRef.current.realms;
  }, []);

  const getUnlockedRealms = useCallback((): RealmInstance[] => {
    return Object.values(stateRef.current.realms).filter((r) => r.unlocked);
  }, []);

  const getLockedRealms = useCallback((): RealmInstance[] => {
    return Object.values(stateRef.current.realms).filter((r) => !r.unlocked);
  }, []);

  const getExploredRealms = useCallback((): RealmInstance[] => {
    return Object.values(stateRef.current.realms).filter((r) => r.explored);
  }, []);

  const getRealmWeather = useCallback((realmId: string): WeatherType => {
    return stateRef.current.realms[realmId]?.currentWeather ?? "clear";
  }, []);

  // ── Realm Actions ────────────────────────────────────────────────────────

  const unlockRealm = useCallback((realmId: string): boolean => {
    let unlocked = false;
    setState((prev) => {
      const realm = prev.realms[realmId];
      if (!realm || realm.unlocked) return prev;
      if (prev.level < 3 + Object.values(prev.realms).filter((r) => r.unlocked).length * 4) return prev;
      unlocked = true;
      const newRealms = { ...prev.realms };
      newRealms[realmId] = { ...realm, unlocked: true };
      return { ...prev, realms: newRealms };
    });
    if (unlocked) {
      addXp(50);
      addCoins(25);
    }
    return unlocked;
  }, [addXp, addCoins]);

  const exploreRealm = useCallback((realmId: string): boolean => {
    let explored = false;
    let xpGain = 0;
    setState((prev) => {
      const realm = prev.realms[realmId];
      if (!realm || !realm.unlocked) return prev;
      const wasExplored = realm.explored;
      explored = true;
      xpGain = realm.ambientXpRate * (wasExplored ? 1 : 5);
      const newRealms = { ...prev.realms };
      newRealms[realmId] = { ...realm, explored: true, visitCount: realm.visitCount + 1 };
      return {
        ...prev,
        realms: newRealms,
        totalRealmsExplored: wasExplored ? prev.totalRealmsExplored : prev.totalRealmsExplored + 1,
      };
    });
    if (explored) {
      addXp(xpGain);
      incrementQuestProgress("explore_realms");
    }
    return explored;
  }, [addXp]);

  const expandRealm = useCallback((realmId: string): boolean => {
    let expanded = false;
    setState((prev) => {
      const realm = prev.realms[realmId];
      if (!realm || !realm.unlocked || realm.expansionLevel >= realm.maxExpansion) return prev;
      if (prev.coins < 100 * (realm.expansionLevel + 1)) return prev;
      expanded = true;
      const newRealms = { ...prev.realms };
      newRealms[realmId] = { ...realm, expansionLevel: realm.expansionLevel + 1 };
      return { ...prev, realms: newRealms, coins: prev.coins - 100 * (realm.expansionLevel + 1) };
    });
    if (expanded) {
      addXp(30);
    }
    return expanded;
  }, [addXp]);

  const buildInRealm = useCallback((realmId: string, structureId: string): boolean => {
    let built = false;
    setState((prev) => {
      const realm = prev.realms[realmId];
      if (!realm || !realm.unlocked) return prev;
      const structure = realm.structures[structureId];
      if (!structure || structure.built) return prev;
      const cost = structure.materialCost;
      for (const [mat, qty] of Object.entries(cost)) {
        if ((prev.inventory[mat] ?? 0) < qty) return prev;
      }
      const newInventory = { ...prev.inventory };
      for (const [mat, qty] of Object.entries(cost)) {
        newInventory[mat] = (newInventory[mat] ?? 0) - qty;
      }
      const newStructures = { ...realm.structures };
      newStructures[structureId] = { ...structure, built: true, level: 1 };
      const newRealms = { ...prev.realms };
      newRealms[realmId] = { ...realm, structures: newStructures };
      built = true;
      return { ...prev, realms: newRealms, inventory: newInventory, totalStructuresBuilt: prev.totalStructuresBuilt + 1 };
    });
    if (built) {
      addXp(40);
      addCoins(15);
      incrementQuestProgress("build_structures");
    }
    return built;
  }, [addXp, addCoins]);

  const upgradeStructure = useCallback((realmId: string, structureId: string): boolean => {
    let upgraded = false;
    setState((prev) => {
      const realm = prev.realms[realmId];
      if (!realm) return prev;
      const structure = realm.structures[structureId];
      if (!structure || !structure.built || structure.level >= structure.maxLevel) return prev;
      const cost = structure.materialCost;
      const scaledCost: Record<string, number> = {};
      for (const [mat, qty] of Object.entries(cost)) {
        scaledCost[mat] = Math.ceil(qty * (structure.level + 1) * 0.8);
      }
      for (const [mat, qty] of Object.entries(scaledCost)) {
        if ((prev.inventory[mat] ?? 0) < qty) return prev;
      }
      const newInventory = { ...prev.inventory };
      for (const [mat, qty] of Object.entries(scaledCost)) {
        newInventory[mat] = (newInventory[mat] ?? 0) - qty;
      }
      const newStructures = { ...realm.structures };
      newStructures[structureId] = { ...structure, level: structure.level + 1 };
      const newRealms = { ...prev.realms };
      newRealms[realmId] = { ...realm, structures: newStructures };
      upgraded = true;
      return { ...prev, realms: newRealms, inventory: newInventory };
    });
    if (upgraded) {
      addXp(25);
    }
    return upgraded;
  }, [addXp]);

  const controlWeather = useCallback((weatherType: WeatherType): boolean => {
    let changed = false;
    setState((prev) => {
      const realmId = Object.keys(prev.realms).find((id) => prev.realms[id].unlocked && prev.realms[id].explored);
      if (!realmId) return prev;
      if (prev.mana < 10) return prev;
      changed = true;
      const newRealms = { ...prev.realms };
      newRealms[realmId] = { ...prev.realms[realmId], currentWeather: weatherType };
      return { ...prev, realms: newRealms, mana: prev.mana - 10, weatherChanges: prev.weatherChanges + 1 };
    });
    if (changed) {
      addXp(8);
      incrementQuestProgress("change_weather");
    }
    return changed;
  }, [addXp]);

  const controlRealmWeather = useCallback((realmId: string, weatherType: WeatherType): boolean => {
    let changed = false;
    setState((prev) => {
      const realm = prev.realms[realmId];
      if (!realm || !realm.unlocked || prev.mana < 15) return prev;
      changed = true;
      const newRealms = { ...prev.realms };
      newRealms[realmId] = { ...realm, currentWeather: weatherType };
      return { ...prev, realms: newRealms, mana: prev.mana - 15, weatherChanges: prev.weatherChanges + 1 };
    });
    if (changed) {
      addXp(12);
    }
    return changed;
  }, [addXp]);

  // ── Creature Getters ─────────────────────────────────────────────────────

  const getCreature = useCallback((id: string): CreatureInstance | null => {
    return stateRef.current.skyCreatures[id] || null;
  }, []);

  const getAllCreatures = useCallback((): Record<string, CreatureInstance> => {
    return stateRef.current.skyCreatures;
  }, []);

  const getBefriendedCreatures = useCallback((): CreatureInstance[] => {
    return Object.values(stateRef.current.skyCreatures).filter((c) => c.befriended);
  }, []);

  const getCreaturesByRarity = useCallback((rarity: Rarity): CreatureInstance[] => {
    return Object.values(stateRef.current.skyCreatures).filter((c) => c.rarity === rarity);
  }, []);

  // ── Creature Actions ─────────────────────────────────────────────────────

  const befriendCreature = useCallback((creatureId: string): boolean => {
    let befriended = false;
    setState((prev) => {
      const creature = prev.skyCreatures[creatureId];
      if (!creature || creature.befriended) return prev;
      befriended = true;
      const newCreatures = { ...prev.skyCreatures };
      newCreatures[creatureId] = { ...creature, befriended: true, friendshipLevel: 10 };
      return { ...prev, skyCreatures: newCreatures, totalCreaturesBefriended: prev.totalCreaturesBefriended + 1 };
    });
    if (befriended) {
      addXp(35);
      addCoins(20);
      incrementQuestProgress("befriend_creatures");
    }
    return befriended;
  }, [addXp, addCoins]);

  const trainCreature = useCallback((creatureId: string): number => {
    let newLevel = 0;
    setState((prev) => {
      const creature = prev.skyCreatures[creatureId];
      if (!creature || !creature.befriended) { newLevel = creature?.friendshipLevel ?? 0; return prev; }
      if (creature.friendshipLevel >= creature.maxFriendship) { newLevel = creature.maxFriendship; return prev; }
      const gain = 5 + Math.floor(Math.random() * 10);
      const level = Math.min(creature.maxFriendship, creature.friendshipLevel + gain);
      newLevel = level;
      const newCreatures = { ...prev.skyCreatures };
      newCreatures[creatureId] = { ...creature, friendshipLevel: level };
      return { ...prev, skyCreatures: newCreatures };
    });
    if (newLevel > 0) {
      addXp(5);
    }
    return newLevel;
  }, [addXp]);

  const bondWithCreature = useCallback((creatureId: string, amount: number): number => {
    let newLevel = 0;
    setState((prev) => {
      const creature = prev.skyCreatures[creatureId];
      if (!creature || !creature.befriended) { newLevel = creature?.friendshipLevel ?? 0; return prev; }
      const level = Math.min(creature.maxFriendship, creature.friendshipLevel + amount);
      newLevel = level;
      const newCreatures = { ...prev.skyCreatures };
      newCreatures[creatureId] = { ...creature, friendshipLevel: level };
      return { ...prev, skyCreatures: newCreatures };
    });
    return newLevel;
  }, []);

  const getCreatureBondPercent = useCallback((creatureId: string): number => {
    const creature = stateRef.current.skyCreatures[creatureId];
    if (!creature) return 0;
    return creature.maxFriendship > 0 ? (creature.friendshipLevel / creature.maxFriendship) * 100 : 0;
  }, []);

  // ── Material / Inventory ─────────────────────────────────────────────────

  const getMaterialDef = useCallback((id: string): MaterialDef | undefined => {
    return CLN_MATERIALS.find((m) => m.id === id);
  }, []);

  const getAllMaterials = useCallback((): MaterialDef[] => {
    return CLN_MATERIALS;
  }, []);

  const getInventory = useCallback((): Record<string, number> => {
    return stateRef.current.inventory;
  }, []);

  const getInventoryCount = useCallback((materialId: string): number => {
    return stateRef.current.inventory[materialId] ?? 0;
  }, []);

  const gatherMaterial = useCallback((materialId: string): boolean => {
    let gathered = false;
    let xpReward = 0;
    setState((prev) => {
      const def = CLN_MATERIALS.find((m) => m.id === materialId);
      if (!def) return prev;
      gathered = true;
      xpReward = def.xpReward;
      const amount = 1 + Math.floor(Math.random() * 3);
      const newInventory = { ...prev.inventory };
      newInventory[materialId] = (newInventory[materialId] ?? 0) + amount;
      return { ...prev, inventory: newInventory };
    });
    if (gathered) {
      addXp(xpReward);
    }
    return gathered;
  }, [addXp]);

  const gatherMaterialMultiple = useCallback((materialId: string, count: number): number => {
    let totalGathered = 0;
    let totalXp = 0;
    for (let i = 0; i < count; i++) {
      const def = CLN_MATERIALS.find((m) => m.id === materialId);
      if (!def) break;
      totalGathered++;
      totalXp += def.xpReward;
    }
    if (totalGathered > 0) {
      setState((prev) => {
        const newInventory = { ...prev.inventory };
        newInventory[materialId] = (newInventory[materialId] ?? 0) + totalGathered;
        return { ...prev, inventory: newInventory };
      });
      addXp(totalXp);
    }
    return totalGathered;
  }, [addXp]);

  const spendMaterial = useCallback((materialId: string, amount: number): boolean => {
    let spent = false;
    setState((prev) => {
      if ((prev.inventory[materialId] ?? 0) < amount) return prev;
      spent = true;
      const newInventory = { ...prev.inventory };
      newInventory[materialId] = (newInventory[materialId] ?? 0) - amount;
      return { ...prev, inventory: newInventory };
    });
    return spent;
  }, []);

  const hasMaterial = useCallback((materialId: string, amount: number): boolean => {
    return (stateRef.current.inventory[materialId] ?? 0) >= amount;
  }, []);

  const getInventoryTotal = useCallback((): number => {
    return Object.values(stateRef.current.inventory).reduce((sum, v) => sum + v, 0);
  }, []);

  // ── Crafting ─────────────────────────────────────────────────────────────

  const getRecipe = useCallback((id: string): RecipeDef | undefined => {
    return CLN_RECIPES.find((r) => r.id === id);
  }, []);

  const getAllRecipes = useCallback((): RecipeDef[] => {
    return CLN_RECIPES;
  }, []);

  const getCraftableRecipes = useCallback((): RecipeDef[] => {
    const inv = stateRef.current.inventory;
    return CLN_RECIPES.filter((r) =>
      Object.entries(r.ingredients).every(([mat, qty]) => (inv[mat] ?? 0) >= qty)
    );
  }, []);

  const canCraft = useCallback((recipeId: string): boolean => {
    const recipe = CLN_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;
    const inv = stateRef.current.inventory;
    return Object.entries(recipe.ingredients).every(([mat, qty]) => (inv[mat] ?? 0) >= qty);
  }, []);

  const craftSkyItem = useCallback((recipeId: string): boolean => {
    let crafted = false;
    let xpReward = 0;
    let coinReward = 0;
    setState((prev) => {
      const recipe = CLN_RECIPES.find((r) => r.id === recipeId);
      if (!recipe) return prev;
      for (const [mat, qty] of Object.entries(recipe.ingredients)) {
        if ((prev.inventory[mat] ?? 0) < qty) return prev;
      }
      crafted = true;
      xpReward = recipe.xpReward;
      coinReward = recipe.coinReward;
      const newInventory = { ...prev.inventory };
      for (const [mat, qty] of Object.entries(recipe.ingredients)) {
        newInventory[mat] = (newInventory[mat] ?? 0) - qty;
      }
      newInventory[recipe.resultId] = (newInventory[recipe.resultId] ?? 0) + 1;
      return { ...prev, inventory: newInventory, totalItemsCrafted: prev.totalItemsCrafted + 1 };
    });
    if (crafted) {
      addXp(xpReward);
      addCoins(coinReward);
      incrementQuestProgress("craft_items");
    }
    return crafted;
  }, [addXp, addCoins]);

  const getCraftingCost = useCallback((recipeId: string): Record<string, number> => {
    const recipe = CLN_RECIPES.find((r) => r.id === recipeId);
    return recipe?.ingredients ?? {};
  }, []);

  // ── Abilities ────────────────────────────────────────────────────────────

  const getAbility = useCallback((id: string): SkyAbility | null => {
    return stateRef.current.abilities[id] || null;
  }, []);

  const getAllAbilities = useCallback((): Record<string, SkyAbility> => {
    return stateRef.current.abilities;
  }, []);

  const getUnlockedAbilities = useCallback((): SkyAbility[] => {
    return Object.values(stateRef.current.abilities).filter((a) => a.unlocked);
  }, []);

  const unlockAbility = useCallback((abilityId: string): boolean => {
    let unlocked = false;
    setState((prev) => {
      const ability = prev.abilities[abilityId];
      if (!ability || ability.unlocked) return prev;
      if (prev.level < 5 + Object.values(prev.abilities).filter((a) => a.unlocked).length * 3) return prev;
      unlocked = true;
      const newAbilities = { ...prev.abilities };
      newAbilities[abilityId] = { ...ability, unlocked: true };
      return { ...prev, abilities: newAbilities };
    });
    if (unlocked) {
      addXp(40);
    }
    return unlocked;
  }, [addXp]);

  const castSkyAbility = useCallback((abilityId: string): boolean => {
    let cast = false;
    setState((prev) => {
      const ability = prev.abilities[abilityId];
      if (!ability || !ability.unlocked || ability.currentCooldown > 0) return prev;
      if (prev.mana < ability.manaCost) return prev;
      cast = true;
      const newAbilities = { ...prev.abilities };
      newAbilities[abilityId] = { ...ability, currentCooldown: ability.cooldown };
      let newXp = prev.xp;
      let newCoins = prev.coins;
      switch (ability.effectType) {
        case "reward":
          newXp += 30;
          newCoins += 15;
          break;
        case "heal":
          break;
        case "buff":
          newXp += 15;
          break;
        case "movement":
          newXp += 5;
          break;
        default:
          newXp += 10;
          break;
      }
      return {
        ...prev,
        abilities: newAbilities,
        mana: prev.mana - ability.manaCost,
        xp: newXp,
        coins: newCoins,
      };
    });
    if (cast) {
      checkAchievements();
    }
    return cast;
  }, []);

  const tickAbilityCooldowns = useCallback(() => {
    setState((prev) => {
      const newAbilities = { ...prev.abilities };
      let changed = false;
      for (const [key, ability] of Object.entries(newAbilities)) {
        if (ability.currentCooldown > 0) {
          newAbilities[key] = { ...ability, currentCooldown: ability.currentCooldown - 1 };
          changed = true;
        }
      }
      return changed ? { ...prev, abilities: newAbilities } : prev;
    });
  }, []);

  const getAbilityCooldownPercent = useCallback((abilityId: string): number => {
    const ability = stateRef.current.abilities[abilityId];
    if (!ability || ability.cooldown === 0) return 0;
    return (ability.currentCooldown / ability.cooldown) * 100;
  }, []);

  // ── Sky Race ─────────────────────────────────────────────────────────────

  const startSkyRace = useCallback((): boolean => {
    let started = false;
    setState((prev) => {
      if (prev.skyRace.active) return prev;
      if (prev.mana < 20) return prev;
      started = true;
      return {
        ...prev,
        skyRace: { active: true, distance: 0, speed: 10 + prev.level * 2, finishLine: 1000, rewards: {} },
        mana: prev.mana - 20,
      };
    });
    return started;
  }, []);

  const advanceSkyRace = useCallback((boost: number): number => {
    let newDistance = 0;
    let finished = false;
    setState((prev) => {
      if (!prev.skyRace.active) { newDistance = prev.skyRace.distance; return prev; }
      const distance = prev.skyRace.distance + prev.skyRace.speed + boost;
      newDistance = distance;
      if (distance >= prev.skyRace.finishLine) {
        finished = true;
        const coinReward = 50 + prev.level * 5;
        return {
          ...prev,
          skyRace: { ...prev.skyRace, distance: prev.skyRace.finishLine, active: false, rewards: { coins: coinReward, xp: 80 + prev.level * 3 } },
          coins: prev.coins + coinReward,
          totalRacesCompleted: prev.totalRacesCompleted + 1,
        };
      }
      return { ...prev, skyRace: { ...prev.skyRace, distance } };
    });
    if (finished) {
      addXp(80 + stateRef.current.level * 3);
      incrementQuestProgress("complete_races");
    }
    return newDistance;
  }, [addXp]);

  const getRaceProgress = useCallback((): number => {
    const race = stateRef.current.skyRace;
    return race.finishLine > 0 ? (race.distance / race.finishLine) * 100 : 0;
  }, []);

  const isRacing = useCallback((): boolean => {
    return stateRef.current.skyRace.active;
  }, []);

  // ── Cloud Surf ───────────────────────────────────────────────────────────

  const startCloudSurf = useCallback((): boolean => {
    let started = false;
    setState((prev) => {
      if (prev.cloudSurf.active) return prev;
      if (prev.mana < 15) return prev;
      started = true;
      return {
        ...prev,
        cloudSurf: { active: true, waveHeight: 50, balance: 50, score: 0, combo: 0 },
        mana: prev.mana - 15,
      };
    });
    return started;
  }, []);

  const surfTrick = useCallback((difficulty: number): { success: boolean; score: number } => {
    let success = false;
    let gained = 0;
    setState((prev) => {
      if (!prev.cloudSurf.active) { success = false; gained = 0; return prev; }
      const roll = Math.random() * 100;
      const chance = Math.max(10, 80 - difficulty * 10 + prev.cloudSurf.balance);
      const didSucceed = roll < chance;
      if (didSucceed) {
        const points = difficulty * 10 * (1 + prev.cloudSurf.combo * 0.2);
        success = true;
        gained = Math.floor(points);
        return {
          ...prev,
          cloudSurf: {
            ...prev.cloudSurf,
            score: prev.cloudSurf.score + gained,
            combo: prev.cloudSurf.combo + 1,
            waveHeight: Math.min(100, prev.cloudSurf.waveHeight + difficulty * 5),
          },
        };
      }
      return {
        ...prev,
        cloudSurf: {
          ...prev.cloudSurf,
          combo: 0,
          balance: Math.max(0, prev.cloudSurf.balance - difficulty * 5),
          waveHeight: Math.max(10, prev.cloudSurf.waveHeight - difficulty * 8),
        },
      };
    });
    return { success, score: gained };
  }, []);

  const endCloudSurf = useCallback((): number => {
    let finalScore = 0;
    setState((prev) => {
      if (!prev.cloudSurf.active) { finalScore = 0; return prev; }
      finalScore = prev.cloudSurf.score;
      const coinReward = Math.floor(prev.cloudSurf.score / 10);
      return {
        ...prev,
        cloudSurf: { active: false, waveHeight: 0, balance: 50, score: 0, combo: 0 },
        coins: prev.coins + coinReward,
        totalSurfsCompleted: prev.totalSurfsCompleted + 1,
      };
    });
    if (finalScore > 0) {
      addXp(Math.floor(finalScore / 5));
      incrementQuestProgress("complete_surfs");
    }
    return finalScore;
  }, [addXp]);

  const getSurfScore = useCallback((): number => {
    return stateRef.current.cloudSurf.score;
  }, []);

  const getSurfCombo = useCallback((): number => {
    return stateRef.current.cloudSurf.combo;
  }, []);

  const isSurfing = useCallback((): boolean => {
    return stateRef.current.cloudSurf.active;
  }, []);

  // ── Star Events ──────────────────────────────────────────────────────────

  const getStarEvent = useCallback((id: string): StarEvent | null => {
    return stateRef.current.starEvents[id] || null;
  }, []);

  const getAllStarEvents = useCallback((): Record<string, StarEvent> => {
    return stateRef.current.starEvents;
  }, []);

  const getActiveStarEvents = useCallback((): StarEvent[] => {
    return Object.values(stateRef.current.starEvents).filter((e) => e.active);
  }, []);

  const activateStarEvent = useCallback((eventId: string): boolean => {
    let activated = false;
    setState((prev) => {
      const event = prev.starEvents[eventId];
      if (!event || event.active) return prev;
      activated = true;
      const newEvents = { ...prev.starEvents };
      newEvents[eventId] = { ...event, active: true };
      return { ...prev, starEvents: newEvents };
    });
    if (activated) {
      addXp(20);
    }
    return activated;
  }, [addXp]);

  const claimStarEventReward = useCallback((eventId: string): Record<string, number> => {
    let reward: Record<string, number> = {};
    setState((prev) => {
      const event = prev.starEvents[eventId];
      if (!event || !event.active) { reward = {}; return prev; }
      reward = event.reward;
      const newEvents = { ...prev.starEvents };
      newEvents[eventId] = { ...event, active: false };
      const newInventory = { ...prev.inventory };
      for (const [mat, qty] of Object.entries(reward)) {
        if (mat === "xp" || mat === "coins") continue;
        newInventory[mat] = (newInventory[mat] ?? 0) + qty;
      }
      return {
        ...prev,
        starEvents: newEvents,
        inventory: newInventory,
        coins: prev.coins + (reward.coins ?? 0),
      };
    });
    if (reward.xp) {
      addXp(reward.xp);
    }
    return reward;
  }, [addXp]);

  const triggerRandomStarEvent = useCallback((): StarEvent | null => {
    const inactiveEvents = CLN_RECIPES.length > 0;
    const allEventIds = Object.keys(CLN_STAR_EVENTS);
    const inactive = allEventIds.filter((id) => !stateRef.current.starEvents[id]?.active);
    if (inactive.length === 0) return null;
    const randomId = inactive[Math.floor(Math.random() * inactive.length)];
    activateStarEvent(randomId);
    return stateRef.current.starEvents[randomId] || null;
  }, [activateStarEvent]);

  // ── Daily Quest ──────────────────────────────────────────────────────────

  const getDailyQuest = useCallback((): DailyQuestDef => {
    return stateRef.current.dailyQuest;
  }, []);

  const getQuestProgress = useCallback((): number => {
    const q = stateRef.current.dailyQuest;
    return q.target > 0 ? (q.progress / q.target) * 100 : 0;
  }, []);

  const incrementQuestProgress = useCallback((type: string, amount?: number) => {
    setState((prev) => {
      if (prev.dailyQuest.completed || prev.dailyQuest.type !== type) return prev;
      const newProgress = Math.min(prev.dailyQuest.target, prev.dailyQuest.progress + (amount ?? 1));
      return {
        ...prev,
        dailyQuest: { ...prev.dailyQuest, progress: newProgress },
      };
    });
  }, []);

  const completeDailyQuest = useCallback((): boolean => {
    let completed = false;
    setState((prev) => {
      if (prev.dailyQuest.completed || prev.dailyQuest.progress < prev.dailyQuest.target) return prev;
      completed = true;
      return {
        ...prev,
        dailyQuest: { ...prev.dailyQuest, completed: true },
        coins: prev.coins + (prev.dailyQuest.reward.coins ?? 0),
      };
    });
    if (completed) {
      const reward = stateRef.current.dailyQuest.reward;
      if (reward.xp) addXp(reward.xp);
    }
    return completed;
  }, [addXp]);

  const generateNewDailyQuest = useCallback(() => {
    const questTypes = [
      { type: "collect_clouds", target: 5, reward: { coins: 30, xp: 50 } },
      { type: "shape_clouds", target: 3, reward: { coins: 40, xp: 60 } },
      { type: "explore_realms", target: 2, reward: { coins: 50, xp: 70 } },
      { type: "befriend_creatures", target: 1, reward: { coins: 60, xp: 80 } },
      { type: "build_structures", target: 2, reward: { coins: 45, xp: 65 } },
      { type: "craft_items", target: 3, reward: { coins: 35, xp: 55 } },
      { type: "complete_races", target: 1, reward: { coins: 40, xp: 60 } },
      { type: "complete_surfs", target: 1, reward: { coins: 40, xp: 60 } },
      { type: "change_weather", target: 3, reward: { coins: 25, xp: 45 } },
    ];
    const scaledLevel = stateRef.current.level;
    const selected = questTypes[Math.floor(Math.random() * questTypes.length)];
    const scaledTarget = Math.ceil(selected.target * (1 + scaledLevel * 0.05));
    const scaledReward = {
      coins: Math.floor((selected.reward.coins ?? 0) * (1 + scaledLevel * 0.1)),
      xp: Math.floor((selected.reward.xp ?? 0) * (1 + scaledLevel * 0.1)),
    };
    setState((prev) => ({
      ...prev,
      dailyQuest: { completed: false, progress: 0, target: scaledTarget, type: selected.type, reward: scaledReward },
    }));
  }, []);

  // ── Achievements ─────────────────────────────────────────────────────────

  const getAchievements = useCallback((): AchievementDef[] => {
    return CLN_ACHIEVEMENTS;
  }, []);

  const getUnlockedAchievements = useCallback((): string[] => {
    return stateRef.current.achievements;
  }, []);

  const getLockedAchievements = useCallback((): AchievementDef[] => {
    return CLN_ACHIEVEMENTS.filter((a) => !stateRef.current.achievements.includes(a.id));
  }, []);

  const checkAchievements = useCallback((): string[] => {
    const newAchievements: string[] = [];
    const s = stateRef.current;
    for (const ach of CLN_ACHIEVEMENTS) {
      if (s.achievements.includes(ach.id)) continue;
      let value = 0;
      switch (ach.requirement) {
        case "totalCloudsCollected": value = s.totalCloudsCollected; break;
        case "totalCloudsShaped": value = s.totalCloudsShaped; break;
        case "totalRealmsExplored": value = s.totalRealmsExplored; break;
        case "totalCreaturesBefriended": value = s.totalCreaturesBefriended; break;
        case "totalStructuresBuilt": value = s.totalStructuresBuilt; break;
        case "totalItemsCrafted": value = s.totalItemsCrafted; break;
        case "totalRacesCompleted": value = s.totalRacesCompleted; break;
        case "totalSurfsCompleted": value = s.totalSurfsCompleted; break;
        case "weatherChanges": value = s.weatherChanges; break;
        case "dayStreak": value = s.dayStreak; break;
        case "level": value = s.level; break;
      }
      if (value >= ach.checkValue) {
        newAchievements.push(ach.id);
      }
    }
    if (newAchievements.length > 0) {
      setState((prev) => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements],
        coins: prev.coins + newAchievements.length * 25,
      }));
      addXp(newAchievements.length * 50);
    }
    return newAchievements;
  }, [addXp]);

  const hasAchievement = useCallback((achievementId: string): boolean => {
    return stateRef.current.achievements.includes(achievementId);
  }, []);

  // ── Titles ───────────────────────────────────────────────────────────────

  const getAllTitles = useCallback((): TitleDef[] => {
    return CLN_TITLES;
  }, []);

  const getAvailableTitles = useCallback((): TitleDef[] => {
    return CLN_TITLES.filter((t) => stateRef.current.level >= t.requirement);
  }, []);

  const setTitle = useCallback((titleId: number): boolean => {
    let set = false;
    setState((prev) => {
      const title = CLN_TITLES.find((t) => t.id === titleId);
      if (!title || prev.level < title.requirement) return prev;
      set = true;
      return { ...prev, currentTitle: titleId };
    });
    return set;
  }, []);

  // ── Discoveries ──────────────────────────────────────────────────────────

  const getDiscoveries = useCallback((): string[] => {
    return stateRef.current.discoveries;
  }, []);

  const addDiscovery = useCallback((discoveryId: string): boolean => {
    let added = false;
    setState((prev) => {
      if (prev.discoveries.includes(discoveryId)) return prev;
      added = true;
      return { ...prev, discoveries: [...prev.discoveries, discoveryId] };
    });
    if (added) {
      addXp(15);
    }
    return added;
  }, [addXp]);

  const getDiscoveryCount = useCallback((): number => {
    return stateRef.current.discoveries.length;
  }, []);

  // ── Day Streak ───────────────────────────────────────────────────────────

  const incrementDayStreak = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dayStreak: prev.dayStreak + 1,
      coins: prev.coins + 10 + prev.dayStreak * 2,
    }));
    addXp(20);
  }, [addXp]);

  const resetDayStreak = useCallback(() => {
    setState((prev) => ({ ...prev, dayStreak: 0 }));
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────

  const getStats = useCallback(() => {
    const s = stateRef.current;
    return {
      level: s.level,
      xp: s.xp,
      maxXp: s.maxXp,
      coins: s.coins,
      mana: s.mana,
      maxMana: s.maxMana,
      totalCloudsCollected: s.totalCloudsCollected,
      totalCloudsShaped: s.totalCloudsShaped,
      totalRealmsExplored: s.totalRealmsExplored,
      totalCreaturesBefriended: s.totalCreaturesBefriended,
      totalStructuresBuilt: s.totalStructuresBuilt,
      totalItemsCrafted: s.totalItemsCrafted,
      totalRacesCompleted: s.totalRacesCompleted,
      totalSurfsCompleted: s.totalSurfsCompleted,
      weatherChanges: s.weatherChanges,
      dayStreak: s.dayStreak,
      achievementCount: s.achievements.length,
      discoveryCount: s.discoveries.length,
      inventoryTotal: Object.values(s.inventory).reduce((sum, v) => sum + v, 0),
    };
  }, []);

  const getCompletionPercent = useCallback((): number => {
    const s = stateRef.current;
    const totalItems =
      Object.keys(CLN_CLOUDS).length +
      Object.keys(CLN_REALMS).length +
      Object.keys(CLN_CREATURES).length +
      CLN_ACHIEVEMENTS.length +
      CLN_RECIPES.length;
    const completedItems =
      s.totalCloudsCollected +
      s.totalRealmsExplored +
      s.totalCreaturesBefriended +
      s.achievements.length +
      s.totalItemsCrafted;
    return totalItems > 0 ? Math.min(100, (completedItems / totalItems) * 100) : 0;
  }, []);

  // ── Season / Color helpers ───────────────────────────────────────────────

  const getColors = useCallback(() => CLN_COLORS, []);

  const getCloudColor = useCallback((cloudId: string): string => {
    return CLN_CLOUDS[cloudId]?.color ?? CLN_COLORS.cloudWhite;
  }, []);

  const getRealmTheme = useCallback((realmId: string): string => {
    return CLN_REALMS[realmId]?.theme ?? CLN_COLORS.skyBlue;
  }, []);

  const getRarityColor = useCallback((rarity: Rarity): string => {
    switch (rarity) {
      case "Common": return "#94A3B8";
      case "Uncommon": return CLN_COLORS.auroraGreen;
      case "Rare": return CLN_COLORS.skyBlue;
      case "Epic": return CLN_COLORS.nebulaPink;
      case "Legendary": return CLN_COLORS.starGold;
      default: return "#94A3B8";
    }
  }, []);

  // ── Reset ────────────────────────────────────────────────────────────────

  const resetState = useCallback(() => {
    setState(getDefaultState());
  }, []);

  // ── Memos ────────────────────────────────────────────────────────────────

  const levelInfo = useMemo(() => {
    const s = state;
    return {
      level: s.level,
      xp: s.xp,
      maxXp: s.maxXp,
      percent: s.maxXp > 0 ? (s.xp / s.maxXp) * 100 : 0,
    };
  }, [state]);

  const titleInfo = useMemo(() => {
    const s = state;
    return CLN_TITLES[s.currentTitle] || CLN_TITLES[0];
  }, [state]);

  const cloudSummary = useMemo(() => {
    const s = state;
    const all = Object.values(s.clouds);
    return {
      total: all.length,
      collected: all.filter((c) => c.collected).length,
      shaped: all.filter((c) => c.shaped).length,
      byRarity: {
        Common: all.filter((c) => c.rarity === "Common" && c.collected).length,
        Uncommon: all.filter((c) => c.rarity === "Uncommon" && c.collected).length,
        Rare: all.filter((c) => c.rarity === "Rare" && c.collected).length,
        Epic: all.filter((c) => c.rarity === "Epic" && c.collected).length,
        Legendary: all.filter((c) => c.rarity === "Legendary" && c.collected).length,
      },
    };
  }, [state]);

  const realmSummary = useMemo(() => {
    const s = state;
    const all = Object.values(s.realms);
    return {
      total: all.length,
      unlocked: all.filter((r) => r.unlocked).length,
      explored: all.filter((r) => r.explored).length,
    };
  }, [state]);

  const questInfo = useMemo(() => {
    const s = state;
    return {
      ...s.dailyQuest,
      percent: s.dailyQuest.target > 0 ? (s.dailyQuest.progress / s.dailyQuest.target) * 100 : 0,
    };
  }, [state]);

  const creatureSummary = useMemo(() => {
    const s = state;
    const all = Object.values(s.skyCreatures);
    return {
      total: all.length,
      befriended: all.filter((c) => c.befriended).length,
      byRarity: {
        Common: all.filter((c) => c.rarity === "Common" && c.befriended).length,
        Uncommon: all.filter((c) => c.rarity === "Uncommon" && c.befriended).length,
        Rare: all.filter((c) => c.rarity === "Rare" && c.befriended).length,
        Epic: all.filter((c) => c.rarity === "Epic" && c.befriended).length,
        Legendary: all.filter((c) => c.rarity === "Legendary" && c.befriended).length,
      },
    };
  }, [state]);

  const statsOverview = useMemo(() => {
    const s = state;
    return {
      level: s.level,
      coins: s.coins,
      mana: s.mana,
      maxMana: s.maxMana,
      dayStreak: s.dayStreak,
      achievements: s.achievements.length,
      discoveries: s.discoveries.length,
    };
  }, [state]);

  // ── Return ───────────────────────────────────────────────────────────────

  return {
    state,
    // Core getters
    getLevel,
    getXp,
    getMaxXp,
    getCoins,
    getMana,
    getMaxMana,
    getDayStreak,
    getTitle,
    getCurrentTitle,
    getXpProgress,
    // XP / coins / mana
    addXp,
    addCoins,
    spendCoins,
    addMana,
    spendMana,
    regenerateMana,
    // Clouds
    getCloud,
    getAllClouds,
    getCloudsByRarity,
    getCollectedClouds,
    getShapedClouds,
    getUncollectedClouds,
    getCloudCount,
    getTotalCloudCount,
    collectCloud,
    collectCloudMultiple,
    shapeCloud,
    advanceCloudShaping,
    // Realms
    getRealm,
    getAllRealms,
    getUnlockedRealms,
    getLockedRealms,
    getExploredRealms,
    getRealmWeather,
    unlockRealm,
    exploreRealm,
    expandRealm,
    buildInRealm,
    upgradeStructure,
    controlWeather,
    controlRealmWeather,
    // Creatures
    getCreature,
    getAllCreatures,
    getBefriendedCreatures,
    getCreaturesByRarity,
    befriendCreature,
    trainCreature,
    bondWithCreature,
    getCreatureBondPercent,
    // Materials / inventory
    getMaterialDef,
    getAllMaterials,
    getInventory,
    getInventoryCount,
    gatherMaterial,
    gatherMaterialMultiple,
    spendMaterial,
    hasMaterial,
    getInventoryTotal,
    // Crafting
    getRecipe,
    getAllRecipes,
    getCraftableRecipes,
    canCraft,
    craftSkyItem,
    getCraftingCost,
    // Abilities
    getAbility,
    getAllAbilities,
    getUnlockedAbilities,
    unlockAbility,
    castSkyAbility,
    tickAbilityCooldowns,
    getAbilityCooldownPercent,
    // Sky race
    startSkyRace,
    advanceSkyRace,
    getRaceProgress,
    isRacing,
    // Cloud surf
    startCloudSurf,
    surfTrick,
    endCloudSurf,
    getSurfScore,
    getSurfCombo,
    isSurfing,
    // Star events
    getStarEvent,
    getAllStarEvents,
    getActiveStarEvents,
    activateStarEvent,
    claimStarEventReward,
    triggerRandomStarEvent,
    // Daily quest
    getDailyQuest,
    getQuestProgress,
    incrementQuestProgress,
    completeDailyQuest,
    generateNewDailyQuest,
    // Achievements
    getAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    checkAchievements,
    hasAchievement,
    // Titles
    getAllTitles,
    getAvailableTitles,
    setTitle,
    // Discoveries
    getDiscoveries,
    addDiscovery,
    getDiscoveryCount,
    // Day streak
    incrementDayStreak,
    resetDayStreak,
    // Stats
    getStats,
    getCompletionPercent,
    // Colors
    getColors,
    getCloudColor,
    getRealmTheme,
    getRarityColor,
    // Reset
    resetState,
    // Memos
    levelInfo,
    titleInfo,
    cloudSummary,
    realmSummary,
    questInfo,
    creatureSummary,
    statsOverview,
  };
}
