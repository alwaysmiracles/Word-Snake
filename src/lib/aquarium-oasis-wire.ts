// =============================================================================
// Aquarium Oasis Wire — Complete Aquarium Management Game Engine
// =============================================================================
// SSR-safe: no localStorage, window, document, setInterval
// All exported functions prefixed `ao`, all exported constants prefixed `AO_`
// Target: ~1800 lines
// =============================================================================

// ─── Enums & Types ───────────────────────────────────────────────────────────

export type AORarity = 1 | 2 | 3 | 4 | 5;
export type AOZoneId =
  | "tropical_reef"
  | "freshwater_river"
  | "deep_ocean"
  | "arctic_waters"
  | "coral_garden"
  | "mangrove_lagoon"
  | "jellyfish_sanctuary"
  | "koi_pond";

export type AOFoodId =
  | "flakes" | "pellets" | "frozen" | "live" | "algae"
  | "brine_shrimp" | "bloodworms" | "vegetables";

export type AODecorationId = string;

export type AOFilterId =
  | "mechanical" | "uv" | "co2" | "protein_skimmer" | "led" | "wave_maker";

export type AODiseaseId =
  | "ich" | "fin_rot" | "velvet" | "dropsy" | "columnaris"
  | "hole_in_head" | "anchor_worms" | "swim_bladder";

export type AOAchievementId =
  | "first_fish" | "zone_master" | "breeder" | "contender"
  | "collector_10" | "collector_30" | "collector_50" | "wealthy"
  | "streak_7" | "streak_30" | "healer" | "legendary_catch"
  | "zone_explorer" | "perfect_water" | "aquarist_45";

export interface AOFishSpecies {
  id: string;
  name: string;
  zone: AOZoneId;
  rarity: AORarity;
  idealTemp: [number, number];
  idealPH: [number, number];
  idealSalinity: [number, number];
  idealOxygen: [number, number];
  idealNitrate: [number, number];
  idealHardness: [number, number];
  size: "tiny" | "small" | "medium" | "large" | "huge";
  price: number;
  breedDifficulty: number;
}

export interface AOZoneDef {
  id: AOZoneId;
  name: string;
  description: string;
  unlockLevel: number;
  defaultTemp: number;
  defaultPH: number;
  defaultSalinity: number;
  defaultOxygen: number;
  defaultNitrate: number;
  defaultHardness: number;
  baseCost: number;
}

export interface AODecorationDef {
  id: string;
  name: string;
  category: "coral" | "plant" | "rock" | "castle" | "treasure" | "lighting";
  beauty: number;
  oxygenBonus: number;
  phStability: number;
  price: number;
  unlockLevel: number;
}

export interface AODiseaseDef {
  id: AODiseaseId;
  name: string;
  symptoms: string[];
  treatment: string;
  treatmentCost: number;
  mortalityRate: number;
  contagion: number;
}

export interface AOFoodDef {
  id: AOFoodId;
  name: string;
  nutrition: number;
  happinessBonus: number;
  growthBonus: number;
  price: number;
}

export interface AOFilterDef {
  id: AOFilterId;
  name: string;
  description: string;
  effect: string;
  efficiency: number;
  price: number;
  energyCost: number;
}

export interface AONPCDef {
  id: string;
  name: string;
  title: string;
  personality: string;
  tipPool: [number, number];
  judgeBonus: number;
  favoriteZone: AOZoneId;
}

export interface AOAchievementDef {
  id: AOAchievementId;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
}

export interface AOFishInstance {
  uid: string;
  speciesId: string;
  zone: AOZoneId;
  health: number;
  happiness: number;
  hunger: number;
  age: number;
  genes: AOFishGenes;
  isSick: boolean;
  diseaseId: AODiseaseId | null;
  bred: boolean;
}

export interface AOFishGenes {
  colorR: number;
  colorG: number;
  colorB: number;
  pattern: number;
  sizeMultiplier: number;
  speedMultiplier: number;
  hardiness: number;
}

export interface AOWaterParams {
  temperature: number;
  ph: number;
  salinity: number;
  oxygen: number;
  nitrate: number;
  hardness: number;
}

export interface AOZoneState {
  id: AOZoneId;
  unlocked: boolean;
  decorations: string[];
  filterStatus: Record<AOFilterId, boolean>;
  waterParams: AOWaterParams;
  lastWaterChange: number | null;
}

export interface AOBreedingPair {
  parent1Uid: string;
  parent2Uid: string;
  startTime: number;
  duration: number;
  complete: boolean;
  childSpeciesId: string | null;
  childGenes: AOFishGenes | null;
}

export interface AODailyTask {
  lastDate: number | null;
  waterChangeDone: boolean;
  feedingDone: boolean;
  diseaseCheckDone: boolean;
  decorationTended: boolean;
}

export interface AOContestEntry {
  zone: AOZoneId;
  score: number;
  judgeBonus: number;
  placement: "1st" | "2nd" | "3rd" | "participation" | null;
  coinsEarned: number;
  xpEarned: number;
}

export interface AORunHistoryEntry {
  date: number;
  level: number;
  coinsEarned: number;
  fishCount: number;
  zonesUnlocked: number;
  contestPlacements: number;
}

export interface AquariumOasisState {
  level: number;
  xp: number;
  coins: number;
  activeZone: AOZoneId;
  zones: Record<AOZoneId, AOZoneState>;
  fish: AOFishInstance[];
  foodInventory: Record<AOFoodId, number>;
  ownedDecorations: string[];
  breedingPairs: AOBreedingPair[];
  dailyTask: AODailyTask;
  streak: number;
  bestStreak: number;
  achievements: AOAchievementId[];
  stats: {
    totalFishBought: number;
    totalFishBred: number;
    totalFishSold: number;
    totalFishDied: number;
    totalCoinsSpent: number;
    totalCoinsEarned: number;
    totalContestsEntered: number;
    totalFirstPlace: number;
    totalDiseasesTreated: number;
    totalWaterChanges: number;
    totalFeedings: number;
    totalDecorationsBought: number;
    totalDaysPlayed: number;
    totalCrossBreeds: number;
  };
  runHistory: AORunHistoryEntry[];
  uidCounter: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const AO_ZONES: AOZoneDef[] = [
  { id: "tropical_reef", name: "Tropical Reef", description: "Warm vibrant waters teeming with colorful reef fish", unlockLevel: 1, defaultTemp: 26, defaultPH: 8.2, defaultSalinity: 35, defaultOxygen: 7, defaultNitrate: 5, defaultHardness: 8, baseCost: 0 },
  { id: "freshwater_river", name: "Freshwater River", description: "Flowing freshwater with diverse community fish", unlockLevel: 1, defaultTemp: 24, defaultPH: 7.0, defaultSalinity: 0, defaultOxygen: 8, defaultNitrate: 3, defaultHardness: 5, baseCost: 0 },
  { id: "deep_ocean", name: "Deep Ocean", description: "Dark mysterious depths with bioluminescent creatures", unlockLevel: 5, defaultTemp: 4, defaultPH: 8.0, defaultSalinity: 35, defaultOxygen: 5, defaultNitrate: 2, defaultHardness: 10, baseCost: 500 },
  { id: "arctic_waters", name: "Arctic Waters", description: "Icy cold waters with hardy polar species", unlockLevel: 10, defaultTemp: -1, defaultPH: 8.1, defaultSalinity: 34, defaultOxygen: 10, defaultNitrate: 1, defaultHardness: 12, baseCost: 1200 },
  { id: "coral_garden", name: "Coral Garden", description: "A thriving coral ecosystem with delicate marine life", unlockLevel: 15, defaultTemp: 25, defaultPH: 8.3, defaultSalinity: 34, defaultOxygen: 7, defaultNitrate: 3, defaultHardness: 9, baseCost: 2500 },
  { id: "mangrove_lagoon", name: "Mangrove Lagoon", description: "Brackish coastal waters with unique adaptors", unlockLevel: 22, defaultTemp: 28, defaultPH: 7.5, defaultSalinity: 15, defaultOxygen: 6, defaultNitrate: 8, defaultHardness: 6, baseCost: 4000 },
  { id: "jellyfish_sanctuary", name: "Jellyfish Sanctuary", description: "A tranquil sanctuary for mesmerizing jellyfish", unlockLevel: 30, defaultTemp: 18, defaultPH: 8.0, defaultSalinity: 33, defaultOxygen: 7, defaultNitrate: 2, defaultHardness: 7, baseCost: 6000 },
  { id: "koi_pond", name: "Koi Pond", description: "A serene Japanese-inspired koi pond", unlockLevel: 38, defaultTemp: 20, defaultPH: 7.5, defaultSalinity: 0, defaultOxygen: 8, defaultNitrate: 5, defaultHardness: 4, baseCost: 8000 },
];

export const AO_FISH: AOFishSpecies[] = [
  // Tropical Reef (8)
  { id: "clownfish", name: "Clownfish", zone: "tropical_reef", rarity: 1, idealTemp: [24, 28], idealPH: [8.0, 8.4], idealSalinity: [33, 37], idealOxygen: [6, 8], idealNitrate: [0, 10], idealHardness: [7, 10], size: "small", price: 25, breedDifficulty: 2 },
  { id: "blue_tang", name: "Blue Tang", zone: "tropical_reef", rarity: 2, idealTemp: [24, 28], idealPH: [8.0, 8.5], idealSalinity: [33, 37], idealOxygen: [6, 9], idealNitrate: [0, 8], idealHardness: [7, 10], size: "medium", price: 80, breedDifficulty: 4 },
  { id: "angelfish", name: "Angelfish", zone: "tropical_reef", rarity: 2, idealTemp: [25, 29], idealPH: [8.0, 8.4], idealSalinity: [32, 36], idealOxygen: [6, 8], idealNitrate: [0, 10], idealHardness: [6, 9], size: "medium", price: 65, breedDifficulty: 3 },
  { id: "butterflyfish", name: "Butterflyfish", zone: "tropical_reef", rarity: 3, idealTemp: [25, 28], idealPH: [8.1, 8.4], idealSalinity: [33, 36], idealOxygen: [7, 9], idealNitrate: [0, 5], idealHardness: [8, 11], size: "small", price: 150, breedDifficulty: 5 },
  { id: "parrotfish", name: "Parrotfish", zone: "tropical_reef", rarity: 3, idealTemp: [24, 29], idealPH: [8.0, 8.5], idealSalinity: [33, 37], idealOxygen: [6, 9], idealNitrate: [0, 8], idealHardness: [7, 10], size: "large", price: 200, breedDifficulty: 6 },
  { id: "surgeonfish", name: "Surgeonfish", zone: "tropical_reef", rarity: 4, idealTemp: [24, 28], idealPH: [8.1, 8.4], idealSalinity: [34, 37], idealOxygen: [7, 9], idealNitrate: [0, 5], idealHardness: [8, 11], size: "medium", price: 350, breedDifficulty: 7 },
  { id: "triggerfish", name: "Triggerfish", zone: "tropical_reef", rarity: 4, idealTemp: [23, 28], idealPH: [8.0, 8.4], idealSalinity: [33, 36], idealOxygen: [6, 8], idealNitrate: [0, 10], idealHardness: [7, 10], size: "medium", price: 320, breedDifficulty: 7 },
  { id: "mandarin_dragonet", name: "Mandarin Dragonet", zone: "tropical_reef", rarity: 5, idealTemp: [24, 28], idealPH: [8.1, 8.4], idealSalinity: [33, 36], idealOxygen: [7, 9], idealNitrate: [0, 3], idealHardness: [8, 11], size: "small", price: 800, breedDifficulty: 10 },
  // Freshwater River (8)
  { id: "guppy", name: "Guppy", zone: "freshwater_river", rarity: 1, idealTemp: [22, 28], idealPH: [6.8, 7.8], idealSalinity: [0, 2], idealOxygen: [5, 9], idealNitrate: [0, 20], idealHardness: [4, 8], size: "tiny", price: 10, breedDifficulty: 1 },
  { id: "neon_tetra", name: "Neon Tetra", zone: "freshwater_river", rarity: 1, idealTemp: [20, 26], idealPH: [5.5, 7.0], idealSalinity: [0, 1], idealOxygen: [5, 8], idealNitrate: [0, 15], idealHardness: [2, 6], size: "tiny", price: 12, breedDifficulty: 2 },
  { id: "betta", name: "Betta", zone: "freshwater_river", rarity: 2, idealTemp: [24, 28], idealPH: [6.5, 7.5], idealSalinity: [0, 2], idealOxygen: [4, 7], idealNitrate: [0, 15], idealHardness: [3, 7], size: "small", price: 40, breedDifficulty: 4 },
  { id: "corydoras", name: "Corydoras", zone: "freshwater_river", rarity: 2, idealTemp: [22, 26], idealPH: [6.0, 7.5], idealSalinity: [0, 1], idealOxygen: [5, 8], idealNitrate: [0, 15], idealHardness: [3, 8], size: "small", price: 35, breedDifficulty: 3 },
  { id: "platy", name: "Platy", zone: "freshwater_river", rarity: 1, idealTemp: [20, 26], idealPH: [6.8, 8.0], idealSalinity: [0, 3], idealOxygen: [5, 8], idealNitrate: [0, 20], idealHardness: [5, 10], size: "small", price: 15, breedDifficulty: 1 },
  { id: "discus", name: "Discus", zone: "freshwater_river", rarity: 4, idealTemp: [26, 30], idealPH: [5.5, 7.0], idealSalinity: [0, 1], idealOxygen: [6, 9], idealNitrate: [0, 5], idealHardness: [2, 5], size: "medium", price: 400, breedDifficulty: 8 },
  { id: "arowana", name: "Arowana", zone: "freshwater_river", rarity: 5, idealTemp: [24, 30], idealPH: [6.0, 7.5], idealSalinity: [0, 2], idealOxygen: [5, 9], idealNitrate: [0, 10], idealHardness: [3, 8], size: "large", price: 1200, breedDifficulty: 10 },
  { id: "ram_cichlid", name: "Ram Cichlid", zone: "freshwater_river", rarity: 3, idealTemp: [25, 30], idealPH: [5.5, 7.0], idealSalinity: [0, 1], idealOxygen: [6, 9], idealNitrate: [0, 8], idealHardness: [2, 6], size: "small", price: 120, breedDifficulty: 5 },
  // Deep Ocean (8)
  { id: "anglerfish", name: "Anglerfish", zone: "deep_ocean", rarity: 3, idealTemp: [2, 6], idealPH: [7.8, 8.2], idealSalinity: [34, 36], idealOxygen: [3, 6], idealNitrate: [0, 3], idealHardness: [10, 14], size: "small", price: 200, breedDifficulty: 6 },
  { id: "lanternfish", name: "Lanternfish", zone: "deep_ocean", rarity: 2, idealTemp: [2, 8], idealPH: [7.8, 8.3], idealSalinity: [33, 36], idealOxygen: [3, 7], idealNitrate: [0, 5], idealHardness: [9, 13], size: "tiny", price: 80, breedDifficulty: 4 },
  { id: "gulper_eel", name: "Gulper Eel", zone: "deep_ocean", rarity: 4, idealTemp: [1, 5], idealPH: [7.9, 8.2], idealSalinity: [34, 37], idealOxygen: [2, 5], idealNitrate: [0, 2], idealHardness: [11, 14], size: "large", price: 400, breedDifficulty: 8 },
  { id: "viperfish", name: "Viperfish", zone: "deep_ocean", rarity: 3, idealTemp: [2, 7], idealPH: [7.8, 8.3], idealSalinity: [34, 36], idealOxygen: [3, 6], idealNitrate: [0, 3], idealHardness: [10, 13], size: "small", price: 180, breedDifficulty: 6 },
  { id: "giant_squid", name: "Giant Squid", zone: "deep_ocean", rarity: 5, idealTemp: [1, 6], idealPH: [7.8, 8.2], idealSalinity: [34, 37], idealOxygen: [2, 5], idealNitrate: [0, 2], idealHardness: [11, 14], size: "huge", price: 1500, breedDifficulty: 10 },
  { id: "hatchetfish", name: "Hatchetfish", zone: "deep_ocean", rarity: 2, idealTemp: [3, 8], idealPH: [7.9, 8.3], idealSalinity: [33, 36], idealOxygen: [4, 7], idealNitrate: [0, 5], idealHardness: [9, 12], size: "tiny", price: 60, breedDifficulty: 3 },
  { id: "dragonfish", name: "Dragonfish", zone: "deep_ocean", rarity: 4, idealTemp: [1, 5], idealPH: [7.8, 8.2], idealSalinity: [34, 36], idealOxygen: [2, 5], idealNitrate: [0, 2], idealHardness: [11, 14], size: "small", price: 350, breedDifficulty: 7 },
  { id: "fangtooth", name: "Fangtooth", zone: "deep_ocean", rarity: 3, idealTemp: [2, 6], idealPH: [7.8, 8.2], idealSalinity: [34, 36], idealOxygen: [3, 6], idealNitrate: [0, 3], idealHardness: [10, 13], size: "medium", price: 220, breedDifficulty: 6 },
  // Arctic Waters (7)
  { id: "arctic_char", name: "Arctic Char", zone: "arctic_waters", rarity: 2, idealTemp: [-2, 8], idealPH: [7.5, 8.3], idealSalinity: [30, 35], idealOxygen: [8, 12], idealNitrate: [0, 3], idealHardness: [10, 14], size: "medium", price: 100, breedDifficulty: 4 },
  { id: "notothenia", name: "Notothenia", zone: "arctic_waters", rarity: 3, idealTemp: [-2, 4], idealPH: [8.0, 8.4], idealSalinity: [33, 36], idealOxygen: [9, 12], idealNitrate: [0, 2], idealHardness: [11, 15], size: "medium", price: 180, breedDifficulty: 5 },
  { id: "arctic_cod", name: "Arctic Cod", zone: "arctic_waters", rarity: 1, idealTemp: [-2, 6], idealPH: [7.8, 8.3], idealSalinity: [32, 36], idealOxygen: [8, 11], idealNitrate: [0, 5], idealHardness: [10, 14], size: "small", price: 30, breedDifficulty: 2 },
  { id: "lumpfish", name: "Lumpfish", zone: "arctic_waters", rarity: 2, idealTemp: [-1, 8], idealPH: [7.6, 8.2], idealSalinity: [30, 35], idealOxygen: [7, 11], idealNitrate: [0, 5], idealHardness: [10, 13], size: "medium", price: 90, breedDifficulty: 3 },
  { id: "sea_butterfly", name: "Sea Butterfly", zone: "arctic_waters", rarity: 3, idealTemp: [-2, 4], idealPH: [8.0, 8.4], idealSalinity: [33, 36], idealOxygen: [9, 12], idealNitrate: [0, 2], idealHardness: [11, 14], size: "tiny", price: 160, breedDifficulty: 5 },
  { id: "snailfish", name: "Snailfish", zone: "arctic_waters", rarity: 4, idealTemp: [-2, 2], idealPH: [8.0, 8.4], idealSalinity: [34, 36], idealOxygen: [9, 12], idealNitrate: [0, 1], idealHardness: [11, 15], size: "tiny", price: 350, breedDifficulty: 8 },
  { id: "greenland_halibut", name: "Greenland Halibut", zone: "arctic_waters", rarity: 4, idealTemp: [-1, 5], idealPH: [7.8, 8.3], idealSalinity: [33, 36], idealOxygen: [8, 11], idealNitrate: [0, 3], idealHardness: [10, 14], size: "large", price: 380, breedDifficulty: 7 },
  // Coral Garden (8)
  { id: "mandarin_fish", name: "Mandarin Fish", zone: "coral_garden", rarity: 3, idealTemp: [24, 28], idealPH: [8.1, 8.5], idealSalinity: [33, 36], idealOxygen: [6, 9], idealNitrate: [0, 5], idealHardness: [8, 11], size: "small", price: 180, breedDifficulty: 6 },
  { id: "seahorse", name: "Seahorse", zone: "coral_garden", rarity: 2, idealTemp: [22, 26], idealPH: [8.0, 8.4], idealSalinity: [32, 36], idealOxygen: [6, 8], idealNitrate: [0, 8], idealHardness: [7, 10], size: "small", price: 90, breedDifficulty: 4 },
  { id: "pipefish", name: "Pipefish", zone: "coral_garden", rarity: 2, idealTemp: [22, 27], idealPH: [8.0, 8.4], idealSalinity: [32, 35], idealOxygen: [6, 8], idealNitrate: [0, 8], idealHardness: [7, 10], size: "small", price: 75, breedDifficulty: 3 },
  { id: "anthias", name: "Anthias", zone: "coral_garden", rarity: 3, idealTemp: [24, 28], idealPH: [8.1, 8.4], idealSalinity: [33, 36], idealOxygen: [7, 9], idealNitrate: [0, 5], idealHardness: [8, 11], size: "small", price: 150, breedDifficulty: 5 },
  { id: "damselfish", name: "Damselfish", zone: "coral_garden", rarity: 1, idealTemp: [23, 28], idealPH: [8.0, 8.4], idealSalinity: [33, 36], idealOxygen: [6, 8], idealNitrate: [0, 10], idealHardness: [7, 10], size: "tiny", price: 20, breedDifficulty: 2 },
  { id: "blenny", name: "Blenny", zone: "coral_garden", rarity: 2, idealTemp: [23, 27], idealPH: [8.0, 8.4], idealSalinity: [33, 35], idealOxygen: [6, 8], idealNitrate: [0, 8], idealHardness: [7, 10], size: "tiny", price: 55, breedDifficulty: 3 },
  { id: "royal_gramma", name: "Royal Gramma", zone: "coral_garden", rarity: 3, idealTemp: [22, 27], idealPH: [8.1, 8.4], idealSalinity: [33, 36], idealOxygen: [7, 9], idealNitrate: [0, 5], idealHardness: [8, 11], size: "small", price: 140, breedDifficulty: 5 },
  { id: "fairy_wrasse", name: "Fairy Wrasse", zone: "coral_garden", rarity: 5, idealTemp: [24, 28], idealPH: [8.1, 8.5], idealSalinity: [33, 36], idealOxygen: [7, 9], idealNitrate: [0, 3], idealHardness: [8, 11], size: "small", price: 900, breedDifficulty: 10 },
  // Mangrove Lagoon (7)
  { id: "mudskipper", name: "Mudskipper", zone: "mangrove_lagoon", rarity: 2, idealTemp: [26, 32], idealPH: [7.2, 8.0], idealSalinity: [10, 25], idealOxygen: [4, 7], idealNitrate: [0, 15], idealHardness: [5, 9], size: "small", price: 70, breedDifficulty: 3 },
  { id: "archer_fish", name: "Archer Fish", zone: "mangrove_lagoon", rarity: 2, idealTemp: [25, 30], idealPH: [7.0, 7.8], idealSalinity: [8, 22], idealOxygen: [5, 8], idealNitrate: [0, 12], idealHardness: [4, 8], size: "medium", price: 90, breedDifficulty: 4 },
  { id: "pufferfish", name: "Pufferfish", zone: "mangrove_lagoon", rarity: 3, idealTemp: [24, 28], idealPH: [7.2, 8.0], idealSalinity: [12, 25], idealOxygen: [5, 8], idealNitrate: [0, 10], idealHardness: [5, 9], size: "small", price: 160, breedDifficulty: 6 },
  { id: "mono_argenteus", name: "Mono Argentus", zone: "mangrove_lagoon", rarity: 2, idealTemp: [24, 30], idealPH: [7.0, 8.0], idealSalinity: [10, 25], idealOxygen: [5, 8], idealNitrate: [0, 12], idealHardness: [5, 9], size: "medium", price: 85, breedDifficulty: 3 },
  { id: "scat", name: "Scat", zone: "mangrove_lagoon", rarity: 2, idealTemp: [25, 30], idealPH: [7.2, 8.0], idealSalinity: [10, 25], idealOxygen: [5, 8], idealNitrate: [0, 12], idealHardness: [5, 9], size: "medium", price: 75, breedDifficulty: 3 },
  { id: "four_eyed_fish", name: "Four-Eyed Fish", zone: "mangrove_lagoon", rarity: 3, idealTemp: [25, 30], idealPH: [7.0, 7.8], idealSalinity: [10, 25], idealOxygen: [5, 8], idealNitrate: [0, 10], idealHardness: [4, 8], size: "small", price: 130, breedDifficulty: 5 },
  { id: "barramundi", name: "Barramundi", zone: "mangrove_lagoon", rarity: 4, idealTemp: [24, 30], idealPH: [7.0, 8.0], idealSalinity: [8, 25], idealOxygen: [5, 8], idealNitrate: [0, 8], idealHardness: [5, 9], size: "large", price: 350, breedDifficulty: 7 },
  // Jellyfish Sanctuary (7)
  { id: "moon_jelly", name: "Moon Jelly", zone: "jellyfish_sanctuary", rarity: 1, idealTemp: [15, 22], idealPH: [8.0, 8.3], idealSalinity: [30, 35], idealOxygen: [6, 8], idealNitrate: [0, 5], idealHardness: [6, 9], size: "medium", price: 40, breedDifficulty: 2 },
  { id: "lions_mane", name: "Lion's Mane", zone: "jellyfish_sanctuary", rarity: 3, idealTemp: [8, 16], idealPH: [8.0, 8.4], idealSalinity: [30, 35], idealOxygen: [7, 10], idealNitrate: [0, 3], idealHardness: [7, 10], size: "large", price: 200, breedDifficulty: 5 },
  { id: "sea_wasp", name: "Sea Wasp", zone: "jellyfish_sanctuary", rarity: 4, idealTemp: [24, 30], idealPH: [8.0, 8.4], idealSalinity: [32, 36], idealOxygen: [6, 9], idealNitrate: [0, 3], idealHardness: [7, 10], size: "medium", price: 400, breedDifficulty: 8 },
  { id: "blue_blubber", name: "Blue Blubber", zone: "jellyfish_sanctuary", rarity: 2, idealTemp: [18, 26], idealPH: [8.0, 8.3], idealSalinity: [30, 34], idealOxygen: [6, 8], idealNitrate: [0, 5], idealHardness: [6, 9], size: "medium", price: 90, breedDifficulty: 3 },
  { id: "crystal_jelly", name: "Crystal Jelly", zone: "jellyfish_sanctuary", rarity: 4, idealTemp: [10, 18], idealPH: [8.0, 8.4], idealSalinity: [31, 35], idealOxygen: [7, 10], idealNitrate: [0, 2], idealHardness: [7, 10], size: "small", price: 350, breedDifficulty: 7 },
  { id: "comb_jelly", name: "Comb Jelly", zone: "jellyfish_sanctuary", rarity: 3, idealTemp: [8, 18], idealPH: [7.8, 8.3], idealSalinity: [30, 35], idealOxygen: [6, 9], idealNitrate: [0, 3], idealHardness: [6, 9], size: "medium", price: 160, breedDifficulty: 5 },
  { id: "cannonball_jelly", name: "Cannonball Jelly", zone: "jellyfish_sanctuary", rarity: 2, idealTemp: [16, 24], idealPH: [8.0, 8.3], idealSalinity: [30, 34], idealOxygen: [6, 8], idealNitrate: [0, 5], idealHardness: [6, 9], size: "medium", price: 80, breedDifficulty: 3 },
  // Koi Pond (7)
  { id: "kohaku", name: "Kohaku Koi", zone: "koi_pond", rarity: 2, idealTemp: [15, 25], idealPH: [6.8, 8.0], idealSalinity: [0, 2], idealOxygen: [6, 10], idealNitrate: [0, 10], idealHardness: [3, 7], size: "large", price: 150, breedDifficulty: 4 },
  { id: "sanke", name: "Sanke Koi", zone: "koi_pond", rarity: 3, idealTemp: [15, 25], idealPH: [6.8, 8.0], idealSalinity: [0, 2], idealOxygen: [6, 10], idealNitrate: [0, 8], idealHardness: [3, 7], size: "large", price: 250, breedDifficulty: 5 },
  { id: "showa", name: "Showa Koi", zone: "koi_pond", rarity: 3, idealTemp: [15, 25], idealPH: [6.8, 8.0], idealSalinity: [0, 2], idealOxygen: [6, 10], idealNitrate: [0, 8], idealHardness: [3, 7], size: "large", price: 280, breedDifficulty: 5 },
  { id: "tancho", name: "Tancho Koi", zone: "koi_pond", rarity: 4, idealTemp: [15, 25], idealPH: [6.8, 8.0], idealSalinity: [0, 2], idealOxygen: [6, 10], idealNitrate: [0, 5], idealHardness: [3, 7], size: "large", price: 500, breedDifficulty: 7 },
  { id: "ogon", name: "Ogon Koi", zone: "koi_pond", rarity: 2, idealTemp: [15, 25], idealPH: [6.8, 8.0], idealSalinity: [0, 2], idealOxygen: [6, 10], idealNitrate: [0, 10], idealHardness: [3, 7], size: "large", price: 130, breedDifficulty: 3 },
  { id: "bekko", name: "Bekko Koi", zone: "koi_pond", rarity: 3, idealTemp: [15, 25], idealPH: [6.8, 8.0], idealSalinity: [0, 2], idealOxygen: [6, 10], idealNitrate: [0, 8], idealHardness: [3, 7], size: "large", price: 200, breedDifficulty: 5 },
  { id: "kin_kitsune", name: "Kin Kitsune Koi", zone: "koi_pond", rarity: 5, idealTemp: [15, 25], idealPH: [6.8, 8.0], idealSalinity: [0, 2], idealOxygen: [6, 10], idealNitrate: [0, 3], idealHardness: [3, 7], size: "large", price: 1000, breedDifficulty: 10 },
];

export const AO_DECORATIONS: AODecorationDef[] = [
  // Corals (5)
  { id: "brain_coral", name: "Brain Coral", category: "coral", beauty: 8, oxygenBonus: 1, phStability: 2, price: 60, unlockLevel: 1 },
  { id: "staghorn_coral", name: "Staghorn Coral", category: "coral", beauty: 10, oxygenBonus: 2, phStability: 3, price: 100, unlockLevel: 5 },
  { id: "sun_coral", name: "Sun Coral", category: "coral", beauty: 12, oxygenBonus: 2, phStability: 4, price: 180, unlockLevel: 12 },
  { id: "torch_coral", name: "Torch Coral", category: "coral", beauty: 15, oxygenBonus: 3, phStability: 4, price: 250, unlockLevel: 20 },
  { id: "acropora", name: "Acropora Coral", category: "coral", beauty: 20, oxygenBonus: 4, phStability: 5, price: 500, unlockLevel: 30 },
  // Plants (5)
  { id: "anubias", name: "Anubias", category: "plant", beauty: 6, oxygenBonus: 3, phStability: 2, price: 25, unlockLevel: 1 },
  { id: "java_fern", name: "Java Fern", category: "plant", beauty: 5, oxygenBonus: 2, phStability: 2, price: 20, unlockLevel: 1 },
  { id: "amazon_sword", name: "Amazon Sword", category: "plant", beauty: 8, oxygenBonus: 4, phStability: 3, price: 40, unlockLevel: 3 },
  { id: "hornwort", name: "Hornwort", category: "plant", beauty: 6, oxygenBonus: 5, phStability: 1, price: 30, unlockLevel: 2 },
  { id: "water_lily", name: "Water Lily", category: "plant", beauty: 14, oxygenBonus: 3, phStability: 2, price: 120, unlockLevel: 10 },
  // Rocks (5)
  { id: "limestone_rock", name: "Limestone Rock", category: "rock", beauty: 4, oxygenBonus: 0, phStability: 5, price: 30, unlockLevel: 1 },
  { id: "volcanic_rock", name: "Volcanic Rock", category: "rock", beauty: 7, oxygenBonus: 0, phStability: 3, price: 50, unlockLevel: 5 },
  { id: "dragon_stone", name: "Dragon Stone", category: "rock", beauty: 12, oxygenBonus: 0, phStability: 4, price: 150, unlockLevel: 15 },
  { id: "seiryu_stone", name: "Seiryu Stone", category: "rock", beauty: 14, oxygenBonus: 0, phStability: 4, price: 200, unlockLevel: 20 },
  { id: "ohko_stone", name: "Ohko Stone", category: "rock", beauty: 10, oxygenBonus: 0, phStability: 3, price: 120, unlockLevel: 12 },
  // Castles (5)
  { id: "mini_castle", name: "Mini Castle", category: "castle", beauty: 8, oxygenBonus: 0, phStability: 0, price: 80, unlockLevel: 3 },
  { id: "roman_ruins", name: "Roman Ruins", category: "castle", beauty: 12, oxygenBonus: 0, phStability: 1, price: 150, unlockLevel: 10 },
  { id: "sunken_ship", name: "Sunken Ship", category: "castle", beauty: 16, oxygenBonus: 1, phStability: 0, price: 280, unlockLevel: 18 },
  { id: "pagoda", name: "Pagoda", category: "castle", beauty: 18, oxygenBonus: 0, phStability: 1, price: 350, unlockLevel: 25 },
  { id: "atlantis_gate", name: "Atlantis Gate", category: "castle", beauty: 25, oxygenBonus: 2, phStability: 2, price: 700, unlockLevel: 35 },
  // Treasures (5)
  { id: "gold_coin_pile", name: "Gold Coin Pile", category: "treasure", beauty: 6, oxygenBonus: 0, phStability: 0, price: 50, unlockLevel: 5 },
  { id: "treasure_chest", name: "Treasure Chest", category: "treasure", beauty: 10, oxygenBonus: 0, phStability: 0, price: 120, unlockLevel: 12 },
  { id: "pearl_oyster", name: "Pearl Oyster", category: "treasure", beauty: 14, oxygenBonus: 1, phStability: 1, price: 200, unlockLevel: 20 },
  { id: "mermaid_statue", name: "Mermaid Statue", category: "treasure", beauty: 20, oxygenBonus: 0, phStability: 0, price: 450, unlockLevel: 30 },
  { id: " Poseidon_trident", name: "Poseidon's Trident", category: "treasure", beauty: 28, oxygenBonus: 2, phStability: 1, price: 900, unlockLevel: 40 },
  // Lighting (5)
  { id: "blue_led_strip", name: "Blue LED Strip", category: "lighting", beauty: 10, oxygenBonus: 2, phStability: 1, price: 70, unlockLevel: 3 },
  { id: "color_wave_light", name: "Color Wave Light", category: "lighting", beauty: 15, oxygenBonus: 3, phStability: 1, price: 180, unlockLevel: 10 },
  { id: "sunrise_simulator", name: "Sunrise Simulator", category: "lighting", beauty: 18, oxygenBonus: 4, phStability: 2, price: 300, unlockLevel: 20 },
  { id: "bioluminescent_panel", name: "Bioluminescent Panel", category: "lighting", beauty: 22, oxygenBonus: 5, phStability: 2, price: 500, unlockLevel: 30 },
  { id: "aurora_ceiling", name: "Aurora Ceiling", category: "lighting", beauty: 30, oxygenBonus: 6, phStability: 3, price: 1000, unlockLevel: 42 },
];

export const AO_DISEASES: AODiseaseDef[] = [
  { id: "ich", name: "Ich (White Spot)", symptoms: ["White spots on body", "Scratching against surfaces", "Rapid gill movement"], treatment: "Raise temperature to 30°C, add aquarium salt", treatmentCost: 30, mortalityRate: 0.15, contagion: 0.7 },
  { id: "fin_rot", name: "Fin Rot", symptoms: ["Frayed or disintegrating fins", "Red edges on fins", "Lethargy"], treatment: "Clean water, antibacterial medication", treatmentCost: 25, mortalityRate: 0.1, contagion: 0.4 },
  { id: "velvet", name: "Velvet Disease", symptoms: ["Gold/dusty film on skin", "Clamped fins", "Rubbing on objects"], treatment: "Dim lights, copper treatment", treatmentCost: 40, mortalityRate: 0.25, contagion: 0.8 },
  { id: "dropsy", name: "Dropsy", symptoms: ["Swollen belly", "Raised scales", "Loss of appetite"], treatment: "Epsom salt baths, antibiotic food", treatmentCost: 50, mortalityRate: 0.4, contagion: 0.2 },
  { id: "columnaris", name: "Columnaris", symptoms: ["White/gray patches", "Saddle-like lesions", "Rapid breathing"], treatment: "Potassium permanganate, antibiotic", treatmentCost: 35, mortalityRate: 0.3, contagion: 0.6 },
  { id: "hole_in_head", name: "Hole in Head", symptoms: ["Pitting on head", "Loss of color", "Weight loss"], treatment: "Metronidazole, improve diet", treatmentCost: 45, mortalityRate: 0.2, contagion: 0.1 },
  { id: "anchor_worms", name: "Anchor Worms", symptoms: ["Visible worm-like parasites", "Red sores", "Inflammation"], treatment: "Potassium permanganate dip", treatmentCost: 55, mortalityRate: 0.15, contagion: 0.5 },
  { id: "swim_bladder", name: "Swim Bladder Disorder", symptoms: ["Floating upside down", "Sinking to bottom", "Difficulty swimming"], treatment: "Pea diet, lower water level", treatmentCost: 20, mortalityRate: 0.1, contagion: 0.0 },
];

export const AO_FOOD: AOFoodDef[] = [
  { id: "flakes", name: "Flakes", nutrition: 5, happinessBonus: 2, growthBonus: 1, price: 5 },
  { id: "pellets", name: "Pellets", nutrition: 7, happinessBonus: 3, growthBonus: 2, price: 8 },
  { id: "frozen", name: "Frozen Food", nutrition: 8, happinessBonus: 5, growthBonus: 3, price: 15 },
  { id: "live", name: "Live Food", nutrition: 10, happinessBonus: 8, growthBonus: 5, price: 30 },
  { id: "algae", name: "Algae Wafers", nutrition: 6, happinessBonus: 3, growthBonus: 2, price: 10 },
  { id: "brine_shrimp", name: "Brine Shrimp", nutrition: 9, happinessBonus: 7, growthBonus: 4, price: 25 },
  { id: "bloodworms", name: "Bloodworms", nutrition: 9, happinessBonus: 6, growthBonus: 4, price: 20 },
  { id: "vegetables", name: "Vegetable Medley", nutrition: 7, happinessBonus: 4, growthBonus: 2, price: 12 },
];

export const AO_FILTERS: AOFilterDef[] = [
  { id: "mechanical", name: "Mechanical Filter", description: "Removes debris and particles from water", effect: "Reduces nitrate buildup", efficiency: 0.3, price: 80, energyCost: 1 },
  { id: "uv", name: "UV Sterilizer", description: "Kills harmful bacteria and parasites", effect: "Disease prevention", efficiency: 0.5, price: 200, energyCost: 2 },
  { id: "co2", name: "CO2 System", description: "Supplements carbon dioxide for plant growth", effect: "Boosts plant oxygen output", efficiency: 0.2, price: 150, energyCost: 1 },
  { id: "protein_skimmer", name: "Protein Skimmer", description: "Removes organic waste before it decomposes", effect: "Reduces nitrate & phosphate", efficiency: 0.4, price: 350, energyCost: 3 },
  { id: "led", name: "LED Lighting System", description: "Full spectrum lighting for photosynthesis", effect: "Plant growth & coral health", efficiency: 0.25, price: 250, energyCost: 2 },
  { id: "wave_maker", name: "Wave Maker", description: "Simulates natural water currents", effect: "Oxygen distribution & fish exercise", efficiency: 0.35, price: 180, energyCost: 2 },
];

export const AO_NPCS: AONPCDef[] = [
  { id: "professor_marina", name: "Professor Marina", title: "Marine Biologist", personality: "Curious and methodical, always studying your fish behavior", tipPool: [20, 60], judgeBonus: 1.15, favoriteZone: "coral_garden" },
  { id: "captain_reed", name: "Captain Reed", title: "Old Salt Explorer", personality: "Weathered sailor with stories from every ocean", tipPool: [30, 80], judgeBonus: 1.1, favoriteZone: "deep_ocean" },
  { id: "kai_zenith", name: "Kai Zenith", title: "Master Aquascaper", personality: "Perfectionist who values aesthetic harmony above all", tipPool: [50, 150], judgeBonus: 1.25, favoriteZone: "koi_pond" },
  { id: "luna_wave", name: "Luna Wave", title: "Fish Breeder", personality: "Gentle soul who specializes in rare color morphs", tipPool: [40, 120], judgeBonus: 1.2, favoriteZone: "tropical_reef" },
  { id: "doc_gills", name: "Doc Gills", title: "Aquatic Veterinarian", personality: "Concerned healer who checks every fish's health", tipPool: [25, 70], judgeBonus: 1.1, favoriteZone: "freshwater_river" },
  { id: "rio_azul", name: "Rio Azul", title: "Amazon Collector", personality: "Adventurous spirit from the Amazon basin", tipPool: [35, 100], judgeBonus: 1.15, favoriteZone: "mangrove_lagoon" },
  { id: "frost_bjorn", name: "Frost Bjorn", title: "Arctic Researcher", personality: "Stoic scientist studying cold-water adaptations", tipPool: [40, 110], judgeBonus: 1.2, favoriteZone: "arctic_waters" },
  { id: "pearl_nova", name: "Pearl Nova", title: "Jellyfish Whisperer", personality: "Ethereal and mysterious, mesmerized by jellies", tipPool: [45, 130], judgeBonus: 1.2, favoriteZone: "jellyfish_sanctuary" },
  { id: "coin_master", name: "Coin Master Gold", title: "Wealthy Investor", personality: "Flamboyant entrepreneur who judges by rarity and value", tipPool: [100, 300], judgeBonus: 1.3, favoriteZone: "coral_garden" },
  { id: "kid_bubbles", name: "Kid Bubbles", title: "Enthusiastic Beginner", personality: "Wide-eyed child who finds every fish magical", tipPool: [5, 20], judgeBonus: 0.9, favoriteZone: "tropical_reef" },
];

export const AO_ACHIEVEMENTS: AOAchievementDef[] = [
  { id: "first_fish", name: "First Splash", description: "Add your first fish to any aquarium", icon: "🐟", xpReward: 50, coinReward: 25 },
  { id: "zone_master", name: "Zone Master", description: "Have 8 or more fish in a single zone", icon: "🏆", xpReward: 200, coinReward: 100 },
  { id: "breeder", name: "Proud Breeder", description: "Successfully breed your first fish", icon: "🥚", xpReward: 150, coinReward: 75 },
  { id: "contender", name: "Contest Contender", description: "Enter your first aquarium contest", icon: "🎖️", xpReward: 100, coinReward: 50 },
  { id: "collector_10", name: "Collector (10)", description: "Own 10 or more unique fish species", icon: "📚", xpReward: 200, coinReward: 100 },
  { id: "collector_30", name: "Collector (30)", description: "Own 30 or more unique fish species", icon: "📖", xpReward: 500, coinReward: 250 },
  { id: "collector_50", name: "Collector (50)", description: "Own 50 or more unique fish species", icon: "📖", xpReward: 1000, coinReward: 500 },
  { id: "wealthy", name: "Wealthy Aquarist", description: "Accumulate 10,000 coins", icon: "💰", xpReward: 300, coinReward: 0 },
  { id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day login streak", icon: "🔥", xpReward: 200, coinReward: 100 },
  { id: "streak_30", name: "Monthly Master", description: "Maintain a 30-day login streak", icon: "⚡", xpReward: 500, coinReward: 300 },
  { id: "healer", name: "Fish Doctor", description: "Successfully treat 10 diseases", icon: "💊", xpReward: 250, coinReward: 125 },
  { id: "legendary_catch", name: "Legendary Catch", description: "Own a legendary rarity fish", icon: "⭐", xpReward: 500, coinReward: 250 },
  { id: "zone_explorer", name: "Zone Explorer", description: "Unlock all 8 aquarium zones", icon: "🗺️", xpReward: 800, coinReward: 400 },
  { id: "perfect_water", name: "Perfect Water", description: "Achieve 100% water quality in any zone", icon: "💧", xpReward: 300, coinReward: 150 },
  { id: "aquarist_45", name: "Master Aquarist", description: "Reach aquarist level 45", icon: "👑", xpReward: 2000, coinReward: 1000 },
];

// ─── State Management ────────────────────────────────────────────────────────

let state: AquariumOasisState | null = null;

function ensureInit(): AquariumOasisState {
  if (!state) {
    state = createInitialState();
  }
  return state;
}

function createInitialState(): AquariumOasisState {
  const zones: Record<AOZoneId, AOZoneState> = {} as Record<AOZoneId, AOZoneState>;
  for (const zd of AO_ZONES) {
    zones[zd.id] = {
      id: zd.id,
      unlocked: zd.unlockLevel <= 1,
      decorations: [],
      filterStatus: { mechanical: false, uv: false, co2: false, protein_skimmer: false, led: false, wave_maker: false },
      waterParams: {
        temperature: zd.defaultTemp,
        ph: zd.defaultPH,
        salinity: zd.defaultSalinity,
        oxygen: zd.defaultOxygen,
        nitrate: zd.defaultNitrate,
        hardness: zd.defaultHardness,
      },
      lastWaterChange: null,
    };
  }
  return {
    level: 1,
    xp: 0,
    coins: 200,
    activeZone: "tropical_reef",
    zones,
    fish: [],
    foodInventory: { flakes: 10, pellets: 5, frozen: 2, live: 0, algae: 3, brine_shrimp: 0, bloodworms: 0, vegetables: 2 },
    ownedDecorations: [],
    breedingPairs: [],
    dailyTask: { lastDate: null, waterChangeDone: false, feedingDone: false, diseaseCheckDone: false, decorationTended: false },
    streak: 0,
    bestStreak: 0,
    achievements: [],
    stats: {
      totalFishBought: 0, totalFishBred: 0, totalFishSold: 0, totalFishDied: 0,
      totalCoinsSpent: 0, totalCoinsEarned: 0, totalContestsEntered: 0, totalFirstPlace: 0,
      totalDiseasesTreated: 0, totalWaterChanges: 0, totalFeedings: 0,
      totalDecorationsBought: 0, totalDaysPlayed: 0, totalCrossBreeds: 0,
    },
    runHistory: [],
    uidCounter: 1,
  };
}

function nextUid(s: AquariumOasisState): string {
  return `fish_${s.uidCounter++}`;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

// ─── Lookup helpers ──────────────────────────────────────────────────────────

function findSpecies(id: string): AOFishSpecies | undefined {
  return AO_FISH.find(f => f.id === id);
}

function findZoneDef(id: AOZoneId): AOZoneDef | undefined {
  return AO_ZONES.find(z => z.id === id);
}

function findDecoration(id: string): AODecorationDef | undefined {
  return AO_DECORATIONS.find(d => d.id === id);
}

function findDisease(id: AODiseaseId): AODiseaseDef | undefined {
  return AO_DISEASES.find(d => d.id === id);
}

function findFood(id: AOFoodId): AOFoodDef | undefined {
  return AO_FOOD.find(f => f.id === id);
}

function findFilter(id: AOFilterId): AOFilterDef | undefined {
  return AO_FILTERS.find(f => f.id === id);
}

// ─── 1. State Accessors ──────────────────────────────────────────────────────

export function aoGetState(): AquariumOasisState {
  return ensureInit();
}

export function aoResetState(): void {
  state = null;
}

export function aoGetLevelInfo(level?: number): { level: number; xp: number; xpToNext: number; xpForLevel: number } {
  const s = ensureInit();
  const lv = level ?? s.level;
  const xpForLevel = aoXPRequiredForLevel(lv);
  const xpToNext = lv >= 45 ? 0 : aoXPRequiredForLevel(lv + 1) - xpForLevel;
  return { level: lv, xp: s.xp - xpForLevel, xpToNext, xpForLevel };
}

function aoXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(1.18, level - 1));
}

export function aoGetActiveZone(): AOZoneId {
  return ensureInit().activeZone;
}

// ─── 2. Zone Management ─────────────────────────────────────────────────────

export function aoSetActiveZone(zoneId: AOZoneId): boolean {
  const s = ensureInit();
  if (!s.zones[zoneId]?.unlocked) return false;
  s.activeZone = zoneId;
  return true;
}

export function aoUnlockZones(): AOZoneId[] {
  const s = ensureInit();
  const newlyUnlocked: AOZoneId[] = [];
  for (const zd of AO_ZONES) {
    if (!s.zones[zd.id].unlocked && s.level >= zd.unlockLevel) {
      s.zones[zd.id].unlocked = true;
      newlyUnlocked.push(zd.id);
    }
  }
  return newlyUnlocked;
}

export function aoGetZoneInfo(zoneId: AOZoneId): AOZoneState | null {
  const s = ensureInit();
  return s.zones[zoneId] ?? null;
}

export function aoGetZoneFish(zoneId: AOZoneId): AOFishInstance[] {
  return ensureInit().fish.filter(f => f.zone === zoneId);
}

export function aoGetZoneHealth(zoneId: AOZoneId): number {
  const s = ensureInit();
  const zoneFish = s.fish.filter(f => f.zone === zoneId);
  if (zoneFish.length === 0) return 0;
  const avgHealth = zoneFish.reduce((a, f) => a + f.health, 0) / zoneFish.length;
  const avgHappiness = zoneFish.reduce((a, f) => a + f.happiness, 0) / zoneFish.length;
  const waterQuality = aoGetWaterQuality(zoneId);
  return Math.round((avgHealth * 0.3 + avgHappiness * 0.3 + waterQuality * 0.4));
}

// ─── 3. Fish Management ─────────────────────────────────────────────────────

export function aoAddFish(speciesId: string, zoneId: AOZoneId): { success: boolean; fish: AOFishInstance | null; error?: string } {
  const s = ensureInit();
  if (!s.zones[zoneId]?.unlocked) return { success: false, fish: null, error: "Zone not unlocked" };
  const species = findSpecies(speciesId);
  if (!species) return { success: false, fish: null, error: "Species not found" };
  if (species.zone !== zoneId) return { success: false, fish: null, error: "Species does not belong to this zone" };
  if (s.coins < species.price) return { success: false, fish: null, error: "Not enough coins" };

  const fish: AOFishInstance = {
    uid: nextUid(s),
    speciesId: species.id,
    zone: zoneId,
    health: 100,
    happiness: 80,
    hunger: 80,
    age: 0,
    genes: {
      colorR: randomInt(50, 255),
      colorG: randomInt(50, 255),
      colorB: randomInt(50, 255),
      pattern: randomInt(0, 5),
      sizeMultiplier: randomRange(0.8, 1.2),
      speedMultiplier: randomRange(0.7, 1.3),
      hardiness: randomRange(0.5, 1.0),
    },
    isSick: false,
    diseaseId: null,
    bred: false,
  };

  s.coins -= species.price;
  s.stats.totalCoinsSpent += species.price;
  s.stats.totalFishBought++;
  s.fish.push(fish);
  aoGainXP(15);
  aoCheckAchievements();
  return { success: true, fish };
}

export function aoRemoveFish(fishUid: string): boolean {
  const s = ensureInit();
  const idx = s.fish.findIndex(f => f.uid === fishUid);
  if (idx === -1) return false;
  s.fish.splice(idx, 1);
  return true;
}

export function aoSellFish(fishUid: string): { success: boolean; coins: number } {
  const s = ensureInit();
  const fish = s.fish.find(f => f.uid === fishUid);
  if (!fish) return { success: false, coins: 0 };
  const species = findSpecies(fish.speciesId);
  if (!species) return { success: false, coins: 0 };
  const sellPrice = Math.floor(species.price * 0.5 * (fish.health / 100));
  s.coins += sellPrice;
  s.stats.totalCoinsEarned += sellPrice;
  s.stats.totalFishSold++;
  s.fish = s.fish.filter(f => f.uid !== fishUid);
  aoGainXP(5);
  return { success: true, coins: sellPrice };
}

export function aoGetFishStats(fishUid: string): AOFishInstance | null {
  return ensureInit().fish.find(f => f.uid === fishUid) ?? null;
}

export function aoGetFishHappiness(fishUid: string): number {
  const fish = ensureInit().fish.find(f => f.uid === fishUid);
  if (!fish) return 0;
  const waterMatch = aoGetWaterParameterMatch(fish);
  const hungerPenalty = (100 - fish.hunger) * 0.2;
  const sicknessPenalty = fish.isSick ? 20 : 0;
  return clamp(Math.round(fish.happiness - hungerPenalty - sicknessPenalty + waterMatch * 0.15), 0, 100);
}

function aoGetWaterParameterMatch(fish: AOFishInstance): number {
  const species = findSpecies(fish.speciesId);
  if (!species) return 0;
  const wp = ensureInit().zones[fish.zone].waterParams;
  let matches = 0;
  const params: [number, [number, number], number][] = [
    [wp.temperature, species.idealTemp, 3],
    [wp.ph, species.idealPH, 0.5],
    [wp.salinity, species.idealSalinity, 5],
    [wp.oxygen, species.idealOxygen, 2],
    [wp.nitrate, species.idealNitrate, 5],
    [wp.hardness, species.idealHardness, 3],
  ];
  for (const [val, [lo, hi], tolerance] of params) {
    if (val >= lo - tolerance && val <= hi + tolerance) matches++;
    else if (val >= lo - tolerance * 2 && val <= hi + tolerance * 2) matches += 0.5;
  }
  return (matches / 6) * 100;
}

export function aoGetUniqueSpeciesCount(): number {
  const s = ensureInit();
  return new Set(s.fish.map(f => f.speciesId)).size;
}

// ─── 4. Feeding ──────────────────────────────────────────────────────────────

export function aoFeedZone(zoneId: AOZoneId, foodId: AOFoodId): { success: boolean; fed: number; error?: string } {
  const s = ensureInit();
  const food = findFood(foodId);
  if (!food) return { success: false, fed: 0, error: "Food type not found" };
  if ((s.foodInventory[foodId] ?? 0) < 1) return { success: false, fed: 0, error: "No food remaining" };

  const zoneFish = s.fish.filter(f => f.zone === zoneId && f.health > 0);
  if (zoneFish.length === 0) return { success: false, fed: 0, error: "No fish in zone" };

  s.foodInventory[foodId]--;
  zoneFish.forEach(f => {
    f.hunger = clamp(f.hunger + food.nutrition * 2, 0, 100);
    f.happiness = clamp(f.happiness + food.happinessBonus, 0, 100);
    f.age += food.growthBonus * 0.1;
  });

  s.stats.totalFeedings++;
  s.dailyTask.feedingDone = true;
  aoGainXP(8);
  aoCheckAchievements();
  return { success: true, fed: zoneFish.length };
}

export function aoBuyFood(foodId: AOFoodId, quantity: number): { success: boolean; error?: string } {
  const s = ensureInit();
  const food = findFood(foodId);
  if (!food) return { success: false, error: "Food type not found" };
  const totalCost = food.price * quantity;
  if (s.coins < totalCost) return { success: false, error: "Not enough coins" };
  s.coins -= totalCost;
  s.stats.totalCoinsSpent += totalCost;
  s.foodInventory[foodId] = (s.foodInventory[foodId] ?? 0) + quantity;
  return { success: true };
}

// ─── 5. Water Parameters ────────────────────────────────────────────────────

export function aoGetWaterQuality(zoneId: AOZoneId): number {
  const s = ensureInit();
  const zone = s.zones[zoneId];
  if (!zone) return 0;
  const zoneFish = s.fish.filter(f => f.zone === zoneId);
  if (zoneFish.length === 0) return 50;

  let totalMatch = 0;
  for (const fish of zoneFish) {
    totalMatch += aoGetWaterParameterMatch(fish);
  }
  const avgMatch = totalMatch / zoneFish.length;

  // Decoration bonuses
  let decoBonus = 0;
  for (const decoId of zone.decorations) {
    const deco = findDecoration(decoId);
    if (deco) {
      decoBonus += deco.phStability * 0.5;
      decoBonus += deco.oxygenBonus * 0.3;
    }
  }

  // Filter bonuses
  let filterBonus = 0;
  for (const [filterId, active] of Object.entries(zone.filterStatus)) {
    if (active) {
      const flt = findFilter(filterId as AOFilterId);
      if (flt) filterBonus += flt.efficiency * 10;
    }
  }

  // Water change recency bonus
  let changeBonus = 0;
  if (zone.lastWaterChange !== null) {
    const daysSince = (Date.now() - zone.lastWaterChange) / (1000 * 60 * 60 * 24);
    changeBonus = Math.max(0, 15 - daysSince * 3);
  }

  return clamp(Math.round(avgMatch * 0.6 + Math.min(decoBonus, 10) + Math.min(filterBonus, 10) + changeBonus), 0, 100);
}

export function aoAdjustWaterParam(zoneId: AOZoneId, param: keyof AOWaterParams, delta: number): boolean {
  const s = ensureInit();
  const zone = s.zones[zoneId];
  if (!zone || !zone.unlocked) return false;
  const wp = zone.waterParams;
  switch (param) {
    case "temperature": wp.temperature = clamp(wp.temperature + delta, -5, 40); break;
    case "ph": wp.ph = clamp(wp.ph + delta, 4.0, 10.0); break;
    case "salinity": wp.salinity = clamp(wp.salinity + delta, 0, 45); break;
    case "oxygen": wp.oxygen = clamp(wp.oxygen + delta, 0, 15); break;
    case "nitrate": wp.nitrate = clamp(wp.nitrate + delta, 0, 50); break;
    case "hardness": wp.hardness = clamp(wp.hardness + delta, 0, 20); break;
  }
  return true;
}

export function aoPerformWaterChange(zoneId: AOZoneId): { success: boolean; qualityRestored: number } {
  const s = ensureInit();
  const zone = s.zones[zoneId];
  if (!zone || !zone.unlocked) return { success: false, qualityRestored: 0 };

  const zd = findZoneDef(zoneId);
  if (!zd) return { success: false, qualityRestored: 0 };

  const wp = zone.waterParams;
  const oldQuality = aoGetWaterQuality(zoneId);

  // Move params 60% toward defaults
  wp.temperature = Math.round((wp.temperature + zd.defaultTemp * 0.6) / 1.6 * 10) / 10;
  wp.ph = Math.round((wp.ph + zd.defaultPH * 0.6) / 1.6 * 10) / 10;
  wp.salinity = Math.round((wp.salinity + zd.defaultSalinity * 0.6) / 1.6 * 10) / 10;
  wp.oxygen = Math.round((wp.oxygen + zd.defaultOxygen * 0.6) / 1.6 * 10) / 10;
  wp.nitrate = Math.round((wp.nitrate + zd.defaultNitrate * 0.6) / 1.6 * 10) / 10;
  wp.hardness = Math.round((wp.hardness + zd.defaultHardness * 0.6) / 1.6 * 10) / 10;

  // Restore fish health slightly
  s.fish.filter(f => f.zone === zoneId).forEach(f => {
    f.health = clamp(f.health + 5, 0, 100);
  });

  zone.lastWaterChange = Date.now();
  const newQuality = aoGetWaterQuality(zoneId);
  const qualityRestored = newQuality - oldQuality;

  s.stats.totalWaterChanges++;
  s.dailyTask.waterChangeDone = true;
  aoGainXP(12);
  aoCheckAchievements();
  return { success: true, qualityRestored };
}

// ─── 6. Decorations ─────────────────────────────────────────────────────────

export function aoBuyDecoration(decoId: string): { success: boolean; error?: string } {
  const s = ensureInit();
  const deco = findDecoration(decoId);
  if (!deco) return { success: false, error: "Decoration not found" };
  if (s.level < deco.unlockLevel) return { success: false, error: "Level too low" };
  if (s.coins < deco.price) return { success: false, error: "Not enough coins" };

  s.coins -= deco.price;
  s.stats.totalCoinsSpent += deco.price;
  s.stats.totalDecorationsBought++;
  s.ownedDecorations.push(decoId);
  aoGainXP(10);
  return { success: true };
}

export function aoPlaceDecoration(zoneId: AOZoneId, decoId: string): { success: boolean; error?: string } {
  const s = ensureInit();
  if (!s.zones[zoneId]?.unlocked) return { success: false, error: "Zone not unlocked" };
  const ownIdx = s.ownedDecorations.indexOf(decoId);
  if (ownIdx === -1) return { success: false, error: "You don't own this decoration" };
  if (s.zones[zoneId].decorations.length >= 10) return { success: false, error: "Zone decoration limit reached" };

  s.ownedDecorations.splice(ownIdx, 1);
  s.zones[zoneId].decorations.push(decoId);
  aoGainXP(5);
  return { success: true };
}

export function aoRemoveDecoration(zoneId: AOZoneId, decoId: string): boolean {
  const s = ensureInit();
  const zone = s.zones[zoneId];
  if (!zone) return false;
  const idx = zone.decorations.indexOf(decoId);
  if (idx === -1) return false;
  zone.decorations.splice(idx, 1);
  s.ownedDecorations.push(decoId);
  return true;
}

// ─── 7. Filters ─────────────────────────────────────────────────────────────

export function aoBuyFilter(zoneId: AOZoneId, filterId: AOFilterId): { success: boolean; error?: string } {
  const s = ensureInit();
  const flt = findFilter(filterId);
  if (!flt) return { success: false, error: "Filter not found" };
  if (!s.zones[zoneId]?.unlocked) return { success: false, error: "Zone not unlocked" };
  if (s.zones[zoneId].filterStatus[filterId]) return { success: false, error: "Filter already installed" };
  if (s.coins < flt.price) return { success: false, error: "Not enough coins" };

  s.coins -= flt.price;
  s.stats.totalCoinsSpent += flt.price;
  s.zones[zoneId].filterStatus[filterId] = true;
  aoGainXP(15);
  return { success: true };
}

export function aoToggleFilter(zoneId: AOZoneId, filterId: AOFilterId): boolean {
  const s = ensureInit();
  const zone = s.zones[zoneId];
  if (!zone || !zone.filterStatus[filterId]) return false;
  zone.filterStatus[filterId] = !zone.filterStatus[filterId];
  return true;
}

// ─── 8. Breeding ────────────────────────────────────────────────────────────

export function aoStartBreeding(parent1Uid: string, parent2Uid: string): { success: boolean; error?: string; pair?: AOBreedingPair } {
  const s = ensureInit();
  const p1 = s.fish.find(f => f.uid === parent1Uid);
  const p2 = s.fish.find(f => f.uid === parent2Uid);
  if (!p1 || !p2) return { success: false, error: "Fish not found" };
  if (p1.zone !== p2.zone) return { success: false, error: "Fish must be in the same zone" };
  if (p1.health < 70 || p2.health < 70) return { success: false, error: "Parent health too low" };
  if (p1.hunger < 50 || p2.hunger < 50) return { success: false, error: "Parent hunger too low" };

  const sp1 = findSpecies(p1.speciesId);
  const sp2 = findSpecies(p2.speciesId);
  if (!sp1 || !sp2) return { success: false, error: "Species data missing" };

  const isCrossBreed = sp1.id !== sp2.id;
  if (isCrossBreed && sp1.zone !== sp2.zone) return { success: false, error: "Cannot cross-breed fish from different zones" };

  const avgDifficulty = (sp1.breedDifficulty + sp2.breedDifficulty) / 2;
  const duration = Math.round(avgDifficulty * 120000); // minutes * 1000

  const pair: AOBreedingPair = {
    parent1Uid: parent1Uid,
    parent2Uid: parent2Uid,
    startTime: Date.now(),
    duration,
    complete: false,
    childSpeciesId: null,
    childGenes: null,
  };

  s.breedingPairs.push(pair);
  return { success: true, pair };
}

export function aoCheckBreeding(): AOBreedingPair[] {
  const s = ensureInit();
  const completed: AOBreedingPair[] = [];
  for (const pair of s.breedingPairs) {
    if (pair.complete) continue;
    const elapsed = Date.now() - pair.startTime;
    if (elapsed >= pair.duration) {
      pair.complete = true;
      // Determine child species
      const p1 = s.fish.find(f => f.uid === pair.parent1Uid);
      const p2 = s.fish.find(f => f.uid === pair.parent2Uid);
      if (p1 && p2) {
        const result = aoComputeChild(p1, p2);
        pair.childSpeciesId = result.speciesId;
        pair.childGenes = result.genes;
      }
      completed.push(pair);
    }
  }
  return completed;
}

function aoComputeChild(p1: AOFishInstance, p2: AOFishInstance): { speciesId: string; genes: AOFishGenes } {
  const sp1 = findSpecies(p1.speciesId)!;
  const sp2 = findSpecies(p2.speciesId)!;
  const isCrossBreed = sp1.id !== sp2.id;
  let childSpeciesId: string;

  if (isCrossBreed) {
    // Higher rarity parent has 70% chance of passing species, 30% chance of the other
    if (Math.random() < 0.7) {
      childSpeciesId = sp1.rarity >= sp2.rarity ? sp1.id : sp2.id;
    } else {
      childSpeciesId = sp1.rarity < sp2.rarity ? sp1.id : sp2.id;
    }
  } else {
    childSpeciesId = sp1.id;
  }

  // Blend genes with mutation chance
  const mutChance = isCrossBreed ? 0.2 : 0.05;
  const mutate = () => Math.random() < mutChance;

  const genes: AOFishGenes = {
    colorR: clamp(Math.round((p1.genes.colorR + p2.genes.colorR) / 2 + (mutate() ? randomInt(-40, 40) : 0)), 0, 255),
    colorG: clamp(Math.round((p1.genes.colorG + p2.genes.colorG) / 2 + (mutate() ? randomInt(-40, 40) : 0)), 0, 255),
    colorB: clamp(Math.round((p1.genes.colorB + p2.genes.colorB) / 2 + (mutate() ? randomInt(-40, 40) : 0)), 0, 255),
    pattern: mutate() ? randomInt(0, 5) : Math.random() < 0.5 ? p1.genes.pattern : p2.genes.pattern,
    sizeMultiplier: clamp((p1.genes.sizeMultiplier + p2.genes.sizeMultiplier) / 2 + (mutate() ? randomRange(-0.2, 0.2) : 0), 0.5, 1.5),
    speedMultiplier: clamp((p1.genes.speedMultiplier + p2.genes.speedMultiplier) / 2 + (mutate() ? randomRange(-0.2, 0.2) : 0), 0.4, 1.6),
    hardiness: clamp((p1.genes.hardiness + p2.genes.hardiness) / 2 + (mutate() ? randomRange(-0.15, 0.15) : 0), 0.1, 1.0),
  };

  return { speciesId: childSpeciesId, genes };
}

export function aoClaimBredChild(pairIndex: number): { success: boolean; fish: AOFishInstance | null; error?: string } {
  const s = ensureInit();
  if (pairIndex < 0 || pairIndex >= s.breedingPairs.length) return { success: false, fish: null, error: "Invalid pair index" };
  const pair = s.breedingPairs[pairIndex];
  if (!pair.complete || !pair.childSpeciesId || !pair.childGenes) return { success: false, fish: null, error: "Breeding not complete" };

  const species = findSpecies(pair.childSpeciesId);
  if (!species) return { success: false, fish: null, error: "Species not found" };

  const parentZone = s.fish.find(f => f.uid === pair.parent1Uid)?.zone ?? species.zone;
  const child: AOFishInstance = {
    uid: nextUid(s),
    speciesId: species.id,
    zone: parentZone,
    health: 100,
    happiness: 90,
    hunger: 90,
    age: 0,
    genes: { ...pair.childGenes },
    isSick: false,
    diseaseId: null,
    bred: true,
  };

  s.fish.push(child);
  s.stats.totalFishBred++;
  if (s.fish.find(f => f.uid === pair.parent1Uid)?.speciesId !== s.fish.find(f => f.uid === pair.parent2Uid)?.speciesId) {
    s.stats.totalCrossBreeds++;
  }
  s.breedingPairs.splice(pairIndex, 1);
  aoGainXP(25);
  aoCheckAchievements();
  return { success: true, fish: child };
}

export function aoGetBreedingCompatibility(speciesId1: string, speciesId2: string): { compatible: boolean; difficulty: string; crossBreed: boolean } {
  const sp1 = findSpecies(speciesId1);
  const sp2 = findSpecies(speciesId2);
  if (!sp1 || !sp2) return { compatible: false, difficulty: "Unknown", crossBreed: false };
  if (sp1.zone !== sp2.zone) return { compatible: false, difficulty: "Impossible", crossBreed: true };
  const avgDiff = (sp1.breedDifficulty + sp2.breedDifficulty) / 2;
  const isCross = sp1.id !== sp2.id;
  let diff: string;
  if (avgDiff <= 3) diff = "Easy";
  else if (avgDiff <= 6) diff = "Moderate";
  else if (avgDiff <= 8) diff = "Hard";
  else diff = "Expert";
  return { compatible: true, difficulty: isCross ? `${diff} (Cross-breed)` : diff, crossBreed: isCross };
}

// ─── 9. Diseases ────────────────────────────────────────────────────────────

export function aoCheckDiseases(zoneId: AOZoneId): { checked: boolean; newDiseases: { fishUid: string; diseaseId: AODiseaseId }[] } {
  const s = ensureInit();
  const zone = s.zones[zoneId];
  if (!zone) return { checked: false, newDiseases: [] };

  s.dailyTask.diseaseCheckDone = true;
  const zoneFish = s.fish.filter(f => f.zone === zoneId && !f.isSick);
  const newDiseases: { fishUid: string; diseaseId: AODiseaseId }[] = [];

  const waterQuality = aoGetWaterQuality(zoneId);
  const diseaseChance = Math.max(0, (100 - waterQuality) * 0.008);

  // Filter bonus: UV reduces disease chance
  const hasUV = zone.filterStatus.uv;
  const adjustedChance = hasUV ? diseaseChance * 0.3 : diseaseChance;

  for (const fish of zoneFish) {
    const hardinessBonus = 1 - fish.genes.hardiness * 0.5;
    const hungerPenalty = (100 - fish.hunger) * 0.003;
    if (Math.random() < adjustedChance * hardinessBonus + hungerPenalty) {
      const disease = AO_DISEASES[randomInt(0, AO_DISEASES.length - 1)];
      fish.isSick = true;
      fish.diseaseId = disease.id;
      fish.health = clamp(fish.health - 10, 0, 100);
      newDiseases.push({ fishUid: fish.uid, diseaseId: disease.id });
    }
  }

  // Contagion spread
  const sickFish = s.fish.filter(f => f.zone === zoneId && f.isSick);
  for (const sick of sickFish) {
    const disease = findDisease(sick.diseaseId!);
    if (!disease) continue;
    for (const healthy of zoneFish) {
      if (healthy.isSick) continue;
      if (Math.random() < disease.contagion * 0.05) {
        healthy.isSick = true;
        healthy.diseaseId = disease.id;
        newDiseases.push({ fishUid: healthy.uid, diseaseId: disease.id });
      }
    }
  }

  return { checked: true, newDiseases };
}

export function aoTreatDisease(fishUid: string): { success: boolean; cost: number; error?: string } {
  const s = ensureInit();
  const fish = s.fish.find(f => f.uid === fishUid);
  if (!fish) return { success: false, cost: 0, error: "Fish not found" };
  if (!fish.isSick || !fish.diseaseId) return { success: false, cost: 0, error: "Fish is not sick" };

  const disease = findDisease(fish.diseaseId);
  if (!disease) return { success: false, cost: 0, error: "Disease not found" };
  if (s.coins < disease.treatmentCost) return { success: false, cost: 0, error: "Not enough coins for treatment" };

  s.coins -= disease.treatmentCost;
  s.stats.totalCoinsSpent += disease.treatmentCost;
  s.stats.totalDiseasesTreated++;

  // Treatment success chance based on fish health and hardiness
  const successChance = 0.7 + fish.genes.hardiness * 0.25;
  if (Math.random() < successChance) {
    fish.isSick = false;
    fish.diseaseId = null;
    fish.health = clamp(fish.health + 15, 0, 100);
  }

  aoGainXP(10);
  aoCheckAchievements();
  return { success: true, cost: disease.treatmentCost };
}

export function aoGetDiseaseInfo(diseaseId: AODiseaseId): AODiseaseDef | null {
  return findDisease(diseaseId) ?? null;
}

// ─── 10. Contests ───────────────────────────────────────────────────────────

export function aoEnterContest(zoneId: AOZoneId): AOContestEntry | null {
  const s = ensureInit();
  const zone = s.zones[zoneId];
  if (!zone || !zone.unlocked) return null;

  const zoneFish = s.fish.filter(f => f.zone === zoneId);
  if (zoneFish.length < 3) return null;

  s.stats.totalContestsEntered++;

  const waterQuality = aoGetWaterQuality(zoneId);
  const zoneHealth = aoGetZoneHealth(zoneId);
  const decoBeauty = zone.decorations.reduce((a, id) => {
    const d = findDecoration(id);
    return a + (d?.beauty ?? 0);
  }, 0);
  const avgRarity = zoneFish.reduce((a, f) => {
    const sp = findSpecies(f.speciesId);
    return a + (sp?.rarity ?? 1);
  }, 0) / zoneFish.length;
  const avgHappiness = zoneFish.reduce((a, f) => a + f.happiness, 0) / zoneFish.length;

  let baseScore = waterQuality * 0.25 + zoneHealth * 0.2 + Math.min(decoBeauty * 0.5, 25) + avgRarity * 5 + avgHappiness * 0.15;
  baseScore += Math.random() * 10;

  // Random NPC judge
  const judge = AO_NPCS[randomInt(0, AO_NPCS.length - 1)];
  const judgeBonus = zoneId === judge.favoriteZone ? judge.judgeBonus : 1.0;
  baseScore *= judgeBonus;

  const score = Math.round(baseScore);
  let placement: AOContestEntry["placement"];
  let coinsEarned: number;
  let xpEarned: number;

  if (score >= 90) { placement = "1st"; coinsEarned = 500; xpEarned = 200; s.stats.totalFirstPlace++; }
  else if (score >= 75) { placement = "2nd"; coinsEarned = 250; xpEarned = 120; }
  else if (score >= 60) { placement = "3rd"; coinsEarned = 100; xpEarned = 60; }
  else { placement = "participation"; coinsEarned = 20; xpEarned = 20; }

  s.coins += coinsEarned;
  s.stats.totalCoinsEarned += coinsEarned;
  aoGainXP(xpEarned);
  aoCheckAchievements();

  return { zone: zoneId, score, judgeBonus, placement, coinsEarned, xpEarned };
}

// ─── 11. NPC Visitors ───────────────────────────────────────────────────────

export function aoGetNPCVisitor(): { npc: AONPCDef; tip: number; comment: string } | null {
  const s = ensureInit();
  const unlockedZones = AO_ZONES.filter(z => s.zones[z.id]?.unlocked);
  if (unlockedZones.length === 0) return null;

  const npc = AO_NPCS[randomInt(0, AO_NPCS.length - 1)];
  const visitedZone = unlockedZones[randomInt(0, unlockedZones.length - 1)];
  const zoneHealth = aoGetZoneHealth(visitedZone.id);
  const zoneFish = aoGetZoneFish(visitedZone.id);

  let tip = randomInt(npc.tipPool[0], npc.tipPool[1]);
  let comment: string;

  if (zoneFish.length === 0) {
    comment = `${npc.name} looks around ${visitedZone.name} and says, "This zone is empty! Fill it with life!"`;
    tip = Math.floor(tip * 0.3);
  } else if (zoneHealth >= 80) {
    comment = `${npc.name} admires your ${visitedZone.name}: "Absolutely stunning work! Your fish look magnificent."`;
    tip = Math.floor(tip * 1.5);
  } else if (zoneHealth >= 50) {
    comment = `${npc.name} visits your ${visitedZone.name}: "Good start, but there's room for improvement."`;
  } else {
    comment = `${npc.name} frowns at your ${visitedZone.name}: "These fish need better care. Check the water parameters!"`;
    tip = Math.floor(tip * 0.5);
  }

  s.coins += tip;
  s.stats.totalCoinsEarned += tip;
  return { npc, tip, comment };
}

// ─── 12. Leveling & XP ──────────────────────────────────────────────────────

export function aoGainXP(amount: number): void {
  const s = ensureInit();
  s.xp += amount;
  while (s.level < 45 && s.xp >= aoXPRequiredForLevel(s.level + 1)) {
    s.level++;
    aoGainXP(0); // recalculate
  }
  aoUnlockZones();
  aoCheckAchievements();
}

export function aoGetMaxLevel(): number {
  return 45;
}

// ─── 13. Streak & Daily ─────────────────────────────────────────────────────

export function aoUpdateStreak(today?: number): { streak: number; isConsecutive: boolean; reward: number } {
  const s = ensureInit();
  const todayMs = today ?? Date.now();
  const todayDate = Math.floor(todayMs / (1000 * 60 * 60 * 24));

  if (s.dailyTask.lastDate !== null) {
    const lastDate = Math.floor(s.dailyTask.lastDate / (1000 * 60 * 60 * 24));
    if (todayDate - lastDate === 1) {
      s.streak++;
    } else if (todayDate - lastDate > 1) {
      s.streak = 1;
    }
    // same day — no change
  } else {
    s.streak = 1;
  }

  s.dailyTask.lastDate = todayMs;
  s.stats.totalDaysPlayed++;
  if (s.streak > s.bestStreak) s.bestStreak = s.streak;

  const streakReward = Math.min(s.streak * 5, 100);
  s.coins += streakReward;
  s.stats.totalCoinsEarned += streakReward;

  // Reset daily tasks
  s.dailyTask.waterChangeDone = false;
  s.dailyTask.feedingDone = false;
  s.dailyTask.diseaseCheckDone = false;
  s.dailyTask.decorationTended = false;

  aoGainXP(s.streak * 3);
  aoCheckAchievements();

  return { streak: s.streak, isConsecutive: s.streak > 1, reward: streakReward };
}

export function aoGetStreak(): { current: number; best: number } {
  const s = ensureInit();
  return { current: s.streak, best: s.bestStreak };
}

export function aoGetDailyReward(): { allDone: boolean; coinBonus: number; xpBonus: number } {
  const s = ensureInit();
  const dt = s.dailyTask;
  const done = [dt.waterChangeDone, dt.feedingDone, dt.diseaseCheckDone, dt.decorationTended].filter(Boolean).length;
  const allDone = done === 4;
  const coinBonus = allDone ? 50 : 0;
  const xpBonus = allDone ? 30 : 0;
  return { allDone, coinBonus, xpBonus };
}

export function aoClaimDailyReward(): { success: boolean; coins: number; xp: number } {
  const dr = aoGetDailyReward();
  if (!dr.allDone) return { success: false, coins: 0, xp: 0 };
  const s = ensureInit();
  s.coins += dr.coinBonus;
  s.stats.totalCoinsEarned += dr.coinBonus;
  aoGainXP(dr.xpBonus);
  return { success: true, coins: dr.coinBonus, xp: dr.xpBonus };
}

// ─── 14. Achievements ───────────────────────────────────────────────────────

export function aoCheckAchievements(): AOAchievementId[] {
  const s = ensureInit();
  const newlyUnlocked: AOAchievementId[] = [];

  const checks: Record<AOAchievementId, () => boolean> = {
    first_fish: () => s.stats.totalFishBought >= 1,
    zone_master: () => {
      const counts: Record<string, number> = {};
      for (const f of s.fish) counts[f.zone] = (counts[f.zone] ?? 0) + 1;
      return Object.values(counts).some(c => c >= 8);
    },
    breeder: () => s.stats.totalFishBred >= 1,
    contender: () => s.stats.totalContestsEntered >= 1,
    collector_10: () => aoGetUniqueSpeciesCount() >= 10,
    collector_30: () => aoGetUniqueSpeciesCount() >= 30,
    collector_50: () => aoGetUniqueSpeciesCount() >= 50,
    wealthy: () => s.coins >= 10000,
    streak_7: () => s.bestStreak >= 7,
    streak_30: () => s.bestStreak >= 30,
    healer: () => s.stats.totalDiseasesTreated >= 10,
    legendary_catch: () => s.fish.some(f => findSpecies(f.speciesId)?.rarity === 5),
    zone_explorer: () => AO_ZONES.every(z => s.zones[z.id]?.unlocked),
    perfect_water: () => AO_ZONES.some(z => s.zones[z.id]?.unlocked && aoGetWaterQuality(z.id) >= 100),
    aquarist_45: () => s.level >= 45,
  };

  for (const [id, check] of Object.entries(checks)) {
    if (!s.achievements.includes(id as AOAchievementId) && check()) {
      s.achievements.push(id as AOAchievementId);
      newlyUnlocked.push(id as AOAchievementId);
      const ach = AO_ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        s.coins += ach.coinReward;
        s.stats.totalCoinsEarned += ach.coinReward;
      }
    }
  }

  return newlyUnlocked;
}

export function aoGetUnlockedAchievements(): AOAchievementId[] {
  return ensureInit().achievements;
}

export function aoGetAchievementProgress(achievementId: AOAchievementId): { current: number; target: number; completed: boolean } {
  const s = ensureInit();
  const completed = s.achievements.includes(achievementId);
  let current = 0;
  let target = 1;

  switch (achievementId) {
    case "first_fish": current = s.stats.totalFishBought; target = 1; break;
    case "zone_master": current = Math.max(...AO_ZONES.map(z => s.fish.filter(f => f.zone === z.id).length)); target = 8; break;
    case "breeder": current = s.stats.totalFishBred; target = 1; break;
    case "contender": current = s.stats.totalContestsEntered; target = 1; break;
    case "collector_10": current = aoGetUniqueSpeciesCount(); target = 10; break;
    case "collector_30": current = aoGetUniqueSpeciesCount(); target = 30; break;
    case "collector_50": current = aoGetUniqueSpeciesCount(); target = 50; break;
    case "wealthy": current = s.coins; target = 10000; break;
    case "streak_7": current = s.bestStreak; target = 7; break;
    case "streak_30": current = s.bestStreak; target = 30; break;
    case "healer": current = s.stats.totalDiseasesTreated; target = 10; break;
    case "legendary_catch": current = s.fish.some(f => findSpecies(f.speciesId)?.rarity === 5) ? 1 : 0; target = 1; break;
    case "zone_explorer": current = AO_ZONES.filter(z => s.zones[z.id]?.unlocked).length; target = 8; break;
    case "perfect_water": current = AO_ZONES.filter(z => s.zones[z.id]?.unlocked && aoGetWaterQuality(z.id) >= 100).length; target = 1; break;
    case "aquarist_45": current = s.level; target = 45; break;
  }

  return { current, target, completed };
}

// ─── 15. Simulation (Tick) ──────────────────────────────────────────────────

export function aoSimulateTick(zoneId: AOZoneId, hours: number): { fishDied: number; diseaseEvents: number } {
  const s = ensureInit();
  let fishDied = 0;
  let diseaseEvents = 0;

  for (const fish of s.fish.filter(f => f.zone === zoneId)) {
    // Hunger decrease
    fish.hunger = clamp(fish.hunger - hours * 1.5, 0, 100);

    // Health effects
    if (fish.hunger < 20) fish.health = clamp(fish.health - hours * 2, 0, 100);

    // Water quality effects
    const waterMatch = aoGetWaterParameterMatch(fish);
    if (waterMatch < 40) fish.health = clamp(fish.health - hours * 1.5, 0, 100);
    else if (waterMatch > 80) fish.health = clamp(fish.health + hours * 0.5, 0, 100);

    // Disease progression
    if (fish.isSick) {
      const disease = findDisease(fish.diseaseId!);
      if (disease) {
        fish.health = clamp(fish.health - hours * disease.mortalityRate * 3, 0, 100);
      }
      if (fish.health <= 0) {
        fishDied++;
      }
    }

    // Natural health recovery if conditions are good
    if (!fish.isSick && fish.hunger > 60 && waterMatch > 70) {
      fish.health = clamp(fish.health + hours * 0.5, 0, 100);
    }

    // Age
    fish.age += hours * 0.01;
  }

  // Remove dead fish
  const deadCount = s.fish.filter(f => f.zone === zoneId && f.health <= 0).length;
  s.fish = s.fish.filter(f => !(f.zone === zoneId && f.health <= 0));
  s.stats.totalFishDied += deadCount;

  // Random disease events
  const diseaseCheck = aoCheckDiseases(zoneId);
  diseaseEvents = diseaseCheck.newDiseases.length;

  // Water parameter drift
  const wp = s.zones[zoneId].waterParams;
  wp.nitrate = clamp(wp.nitrate + hours * 0.05, 0, 50);
  wp.oxygen = clamp(wp.oxygen - hours * 0.02, 0, 15);

  // Decoration oxygen bonuses
  for (const decoId of s.zones[zoneId].decorations) {
    const deco = findDecoration(decoId);
    if (deco) wp.oxygen = clamp(wp.oxygen + hours * deco.oxygenBonus * 0.005, 0, 15);
  }

  return { fishDied: deadCount, diseaseEvents };
}

// ─── 16. Shop ───────────────────────────────────────────────────────────────

export function aoGetShopItems(category?: "fish" | "food" | "decoration" | "filter"): { id: string; name: string; price: number; type: string; locked: boolean }[] {
  const s = ensureInit();
  const items: { id: string; name: string; price: number; type: string; locked: boolean }[] = [];

  if (!category || category === "fish") {
    for (const sp of AO_FISH) {
      items.push({ id: sp.id, name: sp.name, price: sp.price, type: "fish", locked: !s.zones[sp.zone]?.unlocked });
    }
  }
  if (!category || category === "food") {
    for (const food of AO_FOOD) {
      items.push({ id: food.id, name: food.name, price: food.price, type: "food", locked: false });
    }
  }
  if (!category || category === "decoration") {
    for (const deco of AO_DECORATIONS) {
      items.push({ id: deco.id, name: deco.name, price: deco.price, type: "decoration", locked: s.level < deco.unlockLevel });
    }
  }
  if (!category || category === "filter") {
    for (const flt of AO_FILTERS) {
      items.push({ id: flt.id, name: flt.name, price: flt.price, type: "filter", locked: false });
    }
  }

  return items;
}

// ─── 17. Stats & History ────────────────────────────────────────────────────

export function aoGetStats(): AquariumOasisState["stats"] {
  return ensureInit().stats;
}

export function aoGetRunHistory(): AORunHistoryEntry[] {
  return ensureInit().runHistory;
}

export function aoSaveRun(): void {
  const s = ensureInit();
  s.runHistory.push({
    date: Date.now(),
    level: s.level,
    coinsEarned: s.stats.totalCoinsEarned - s.stats.totalCoinsSpent,
    fishCount: s.fish.length,
    zonesUnlocked: AO_ZONES.filter(z => s.zones[z.id]?.unlocked).length,
    contestPlacements: s.stats.totalFirstPlace,
  });
  // Keep last 50 entries
  if (s.runHistory.length > 50) s.runHistory.shift();
}

export function aoGetInventory(): { ownedDecorations: string[]; foodInventory: Record<AOFoodId, number> } {
  const s = ensureInit();
  return { ownedDecorations: [...s.ownedDecorations], foodInventory: { ...s.foodInventory } };
}

export function aoGetAllBreedingPairs(): AOBreedingPair[] {
  return [...ensureInit().breedingPairs];
}

export function aoGetCoins(): number {
  return ensureInit().coins;
}

export function aoSpendCoins(amount: number): boolean {
  const s = ensureInit();
  if (s.coins < amount) return false;
  s.coins -= amount;
  s.stats.totalCoinsSpent += amount;
  return true;
}

export function aoEarnCoins(amount: number): void {
  const s = ensureInit();
  s.coins += amount;
  s.stats.totalCoinsEarned += amount;
}

// ─── 18. Quick Actions ──────────────────────────────────────────────────────

export function aoQuickSetup(zoneId: AOZoneId, fishCount: number): { added: number; totalCost: number } {
  const s = ensureInit();
  if (!s.zones[zoneId]?.unlocked) return { added: 0, totalCost: 0 };

  const availableSpecies = AO_FISH.filter(sp => sp.zone === zoneId && sp.rarity <= 2);
  if (availableSpecies.length === 0) return { added: 0, totalCost: 0 };

  let added = 0;
  let totalCost = 0;

  for (let i = 0; i < fishCount; i++) {
    const sp = availableSpecies[randomInt(0, availableSpecies.length - 1)];
    if (s.coins < sp.price) break;
    const result = aoAddFish(sp.id, zoneId);
    if (result.success) {
      added++;
      totalCost += sp.price;
    }
  }

  return { added, totalCost };
}

export function aoGetZoneSummary(zoneId: AOZoneId): {
  name: string;
  unlocked: boolean;
  fishCount: number;
  beautyScore: number;
  waterQuality: number;
  activeFilters: string[];
  hasBreeding: boolean;
} | null {
  const s = ensureInit();
  const zone = s.zones[zoneId];
  if (!zone) return null;
  const zd = findZoneDef(zoneId);
  if (!zd) return null;

  const fishCount = s.fish.filter(f => f.zone === zoneId).length;
  const beautyScore = zone.decorations.reduce((a, id) => a + (findDecoration(id)?.beauty ?? 0), 0);
  const activeFilters = Object.entries(zone.filterStatus).filter(([, v]) => v).map(([k]) => findFilter(k as AOFilterId)?.name ?? k);
  const hasBreeding = s.breedingPairs.some(p => {
    const parentZone = s.fish.find(f => f.uid === p.parent1Uid)?.zone;
    return parentZone === zoneId;
  });

  return {
    name: zd.name,
    unlocked: zone.unlocked,
    fishCount,
    beautyScore,
    waterQuality: zone.unlocked ? aoGetWaterQuality(zoneId) : 0,
    activeFilters,
    hasBreeding,
  };
}

export function aoGetRarityLabel(rarity: AORarity): string {
  switch (rarity) {
    case 1: return "Common";
    case 2: return "Uncommon";
    case 3: return "Rare";
    case 4: return "Epic";
    case 5: return "Legendary";
  }
}

export function aoGetSizeLabel(size: AOFishSpecies["size"]): string {
  switch (size) {
    case "tiny": return "Tiny";
    case "small": return "Small";
    case "medium": return "Medium";
    case "large": return "Large";
    case "huge": return "Huge";
  }
}

export function aoGetFishInZoneByRarity(zoneId: AOZoneId, rarity: AORarity): AOFishInstance[] {
  return ensureInit().fish.filter(f => {
    if (f.zone !== zoneId) return false;
    const sp = findSpecies(f.speciesId);
    return sp?.rarity === rarity;
  });
}

export function aoGetOptimalWaterParams(zoneId: AOZoneId): AOWaterParams | null {
  const s = ensureInit();
  const zoneFish = s.fish.filter(f => f.zone === zoneId);
  if (zoneFish.length === 0) return null;

  const avg: AOWaterParams = { temperature: 0, ph: 0, salinity: 0, oxygen: 0, nitrate: 0, hardness: 0 };
  for (const fish of zoneFish) {
    const sp = findSpecies(fish.speciesId);
    if (!sp) continue;
    avg.temperature += (sp.idealTemp[0] + sp.idealTemp[1]) / 2;
    avg.ph += (sp.idealPH[0] + sp.idealPH[1]) / 2;
    avg.salinity += (sp.idealSalinity[0] + sp.idealSalinity[1]) / 2;
    avg.oxygen += (sp.idealOxygen[0] + sp.idealOxygen[1]) / 2;
    avg.nitrate += (sp.idealNitrate[0] + sp.idealNitrate[1]) / 2;
    avg.hardness += (sp.idealHardness[0] + sp.idealHardness[1]) / 2;
  }

  const n = zoneFish.length;
  return {
    temperature: Math.round(avg.temperature / n * 10) / 10,
    ph: Math.round(avg.ph / n * 10) / 10,
    salinity: Math.round(avg.salinity / n * 10) / 10,
    oxygen: Math.round(avg.oxygen / n * 10) / 10,
    nitrate: Math.round(avg.nitrate / n * 10) / 10,
    hardness: Math.round(avg.hardness / n * 10) / 10,
  };
}

export function aoGetDailyTaskStatus(): { waterChange: boolean; feeding: boolean; diseaseCheck: boolean; decorationTended: boolean } {
  const s = ensureInit();
  return {
    waterChange: s.dailyTask.waterChangeDone,
    feeding: s.dailyTask.feedingDone,
    diseaseCheck: s.dailyTask.diseaseCheckDone,
    decorationTended: s.dailyTask.decorationTended,
  };
}

export function aoMarkDecorationTended(): void {
  const s = ensureInit();
  s.dailyTask.decorationTended = true;
  aoGainXP(5);
}

export function aoGetFishCount(): number {
  return ensureInit().fish.length;
}

export function aoGetUnlockedZones(): AOZoneId[] {
  const s = ensureInit();
  return AO_ZONES.filter(z => s.zones[z.id]?.unlocked).map(z => z.id);
}

export function aoGetSpeciesByZone(zoneId: AOZoneId): AOFishSpecies[] {
  return AO_FISH.filter(sp => sp.zone === zoneId);
}

export function aoSetCoins(amount: number): void {
  ensureInit().coins = amount;
}

export function aoSetLevel(level: number): void {
  const s = ensureInit();
  s.level = clamp(level, 1, 45);
  aoUnlockZones();
}
