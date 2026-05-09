// =============================================================================
// Botanical Garden Wire — Word Snake Game Module
// =============================================================================
// A production-quality, SSR-safe game module for managing a virtual botanical
// garden. Uses lazy initialization (ensureInit) so no browser APIs are touched
// at module scope. Every exported function carries the `bt` prefix.
// =============================================================================

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type Biome =
  | 'Tropical Rainforest'
  | 'Desert Oasis'
  | 'Alpine Meadow'
  | 'Mangrove Swamp'
  | 'Volcanic Isle'
  | 'Arctic Tundra';

export type Rarity = 'Common' | 'Unusual' | 'Rare' | 'Endangered' | 'Legendary';

export type GrowthStage =
  | 'Seed'
  | 'Sprout'
  | 'Growing'
  | 'Mature'
  | 'Flowering'
  | 'Seed-bearing';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type Weather = 'Sunny' | 'Rainy' | 'Cloudy' | 'Windy' | 'Stormy' | 'Foggy';

export type CareAction = 'Water' | 'Fertilize' | 'Prune' | 'Pollinate' | 'Protect';

export interface PlantSpecies {
  id: string;
  name: string;
  category: 'Flower' | 'Tree' | 'Herb' | 'Fungus' | 'Aquatic' | 'Carnivorous';
  biome: Biome;
  rarity: Rarity;
  baseGrowthTime: number; // ticks to reach Seed-bearing
  sunlightNeed: number;   // 0-100 ideal
  waterNeed: number;
  temperatureNeed: number;
  humidityNeed: number;
  soilNeed: number;
  lore: string;
  pestResistance: number;  // 0-100
}

export interface PlotData {
  index: number;
  plantId: string | null;
  growthStage: GrowthStage;
  growthProgress: number;  // 0-100 within current stage
  overallProgress: number; // 0-100 overall lifecycle
  health: number;          // 0-100
  lastCaredAt: number;     // tick timestamp
  waterLevel: number;      // 0-100
  fertilizerLevel: number;
  pestLevel: number;       // 0-100 infestation
  diseaseLevel: number;
  isProtected: boolean;
}

export interface SeedData {
  speciesId: string;
  quantity: number;
  acquiredAt: number;
  source: 'harvest' | 'research' | 'trade' | 'daily';
}

export interface GrowthConditions {
  sunlight: number;
  water: number;
  temperature: number;
  humidity: number;
  soilQuality: number;
}

export interface ResearchTopic {
  id: string;
  name: string;
  description: string;
  cost: number;           // ticks of research
  progress: number;       // 0-100
  isActive: boolean;
  completed: boolean;
  unlocks: string[];      // species IDs or boosts
  xpReward: number;
}

export interface HybridRecipe {
  parentA: string;
  parentB: string;
  resultSpecies: string;
  resultName: string;
  requiredLevel: number;
}

export interface HerbRecipe {
  id: string;
  name: string;
  ingredients: string[];   // species IDs
  effect: string;
  potency: number;
  crafted: boolean;
}

export interface PestEvent {
  id: string;
  name: string;
  description: string;
  healthDamage: number;
  pestIncrease: number;
  diseaseIncrease: number;
  affectedBiomes: Biome[];
}

export interface EncyclopediaEntry {
  speciesId: string;
  discovered: boolean;
  discoveredAt: number;
  journalNote: string;
  observationsCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedAt: number;
  icon: string;
}

export interface DailyTask {
  id: string;
  description: string;
  action: CareAction;
  targetBiome: Biome | null;
  targetCategory: PlantCategory | null;
  rewardXP: number;
  rewardSeeds: string[];
  completed: boolean;
  dateSeed: number;
}

export type PlantCategory = 'Flower' | 'Tree' | 'Herb' | 'Fungus' | 'Aquatic' | 'Carnivorous';

export interface GardenStats {
  totalHarvested: number;
  totalPlanted: number;
  totalHybrids: number;
  totalResearchCompleted: number;
  totalPestEvents: number;
  totalRemediesCrafted: number;
  longestStreak: number;
  currentStreak: number;
  plantsAtMature: number;
  averageHealth: number;
  rarestSpecies: string;
  favoriteBiome: Biome;
}

export interface BotanicalGardenState {
  level: number;
  xp: number;
  plots: PlotData[];
  seedBank: SeedData[];
  researchTopics: ResearchTopic[];
  herbRemedies: string[];
  discoveredSpecies: string[];
  encyclopedia: EncyclopediaEntry[];
  dailyTask: DailyTask | null;
  season: number;        // 0-3
  weather: number;       // 0-5
  achievements: string[];
  totalHarvested: number;
  totalPlanted: number;
  totalHybrids: number;
  totalPestEvents: number;
  totalRemediesCrafted: number;
  currentStreak: number;
  longestStreak: number;
  tick: number;
  conditions: GrowthConditions;
  seedBankCapacity: number;
  journalEntries: JournalEntry[];
  activePestEvent: PestEvent | null;
  pestEventCooldown: number;
  lastSeasonAdvance: number;
  lastWeatherChange: number;
  unlockedHybrids: string[];
}

export interface JournalEntry {
  tick: number;
  plantId: string;
  stage: GrowthStage;
  note: string;
}

// ---------------------------------------------------------------------------
// Constants — Biomes, Seasons, Weather
// ---------------------------------------------------------------------------

const BIOMES: Biome[] = [
  'Tropical Rainforest',
  'Desert Oasis',
  'Alpine Meadow',
  'Mangrove Swamp',
  'Volcanic Isle',
  'Arctic Tundra',
];

const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

const WEATHERS: Weather[] = ['Sunny', 'Rainy', 'Cloudy', 'Windy', 'Stormy', 'Foggy'];

const SEASON_GROWTH_MULTIPLIER: Record<Season, number> = {
  Spring: 1.2,
  Summer: 1.1,
  Autumn: 0.9,
  Winter: 0.7,
};

const SEASON_CONDITION_BONUS: Record<Season, Partial<GrowthConditions>> = {
  Spring: { sunlight: 10, water: 5, temperature: 5, humidity: 10, soilQuality: 5 },
  Summer: { sunlight: 20, water: -10, temperature: 15, humidity: -5, soilQuality: -5 },
  Autumn: { sunlight: -5, water: 10, temperature: -5, humidity: 5, soilQuality: 10 },
  Winter: { sunlight: -20, water: -5, temperature: -20, humidity: -10, soilQuality: 0 },
};

const WEATHER_EFFECTS: Record<Weather, Partial<GrowthConditions>> = {
  Sunny:  { sunlight: 15, water: -10, temperature: 10, humidity: -5, soilQuality: 0 },
  Rainy:  { sunlight: -10, water: 20, temperature: -5, humidity: 15, soilQuality: 5 },
  Cloudy: { sunlight: -15, water: 5, temperature: -5, humidity: 10, soilQuality: 0 },
  Windy:  { sunlight: 0, water: -15, temperature: -10, humidity: -10, soilQuality: -5 },
  Stormy: { sunlight: -20, water: 10, temperature: -15, humidity: 20, soilQuality: -10 },
  Foggy:  { sunlight: -25, water: 5, temperature: 0, humidity: 25, soilQuality: 5 },
};

const RARITY_MULTIPLIER: Record<Rarity, number> = {
  Common: 1.0,
  Unusual: 1.4,
  Rare: 1.8,
  Endangered: 2.5,
  Legendary: 3.5,
};

const RARITY_XP_BONUS: Record<Rarity, number> = {
  Common: 10,
  Unusual: 25,
  Rare: 50,
  Endangered: 100,
  Legendary: 200,
};

const GROWTH_STAGES_ORDER: GrowthStage[] = [
  'Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Seed-bearing',
];

const GRID_SIZE = 5;
const TOTAL_PLOTS = GRID_SIZE * GRID_SIZE;

// ---------------------------------------------------------------------------
// Plant Species Database (50 species)
// ---------------------------------------------------------------------------

const PLANT_SPECIES: PlantSpecies[] = [
  // ---- Flowers (10) ----
  { id: 'fl_orchid', name: 'Phantom Orchid', category: 'Flower', biome: 'Tropical Rainforest', rarity: 'Endangered', baseGrowthTime: 48, sunlightNeed: 40, waterNeed: 60, temperatureNeed: 75, humidityNeed: 85, soilNeed: 50, lore: 'A ghostly white orchid that feeds on fungal networks. Said to appear only on moonless nights.', pestResistance: 20 },
  { id: 'fl_sunrose', name: 'Sun-Kissed Rose', category: 'Flower', biome: 'Desert Oasis', rarity: 'Common', baseGrowthTime: 12, sunlightNeed: 90, waterNeed: 25, temperatureNeed: 85, humidityNeed: 20, soilNeed: 35, lore: 'A resilient desert rose whose petals turn gold at high noon.', pestResistance: 60 },
  { id: 'fl_alpinebell', name: 'Alpine Bluebell', category: 'Flower', biome: 'Alpine Meadow', rarity: 'Common', baseGrowthTime: 14, sunlightNeed: 50, waterNeed: 40, temperatureNeed: 35, humidityNeed: 55, soilNeed: 60, lore: 'Tiny blue bells that chime softly in alpine breezes. Local legends say they ring before storms.', pestResistance: 50 },
  { id: 'fl_manglily', name: 'Mangrove Water Lily', category: 'Flower', biome: 'Mangrove Swamp', rarity: 'Unusual', baseGrowthTime: 18, sunlightNeed: 55, waterNeed: 90, temperatureNeed: 70, humidityNeed: 95, soilNeed: 45, lore: 'A bioluminescent lily that glows teal at dusk, guiding travelers through swamp paths.', pestResistance: 35 },
  { id: 'fl_firebloom', name: 'Volcanic Firebloom', category: 'Flower', biome: 'Volcanic Isle', rarity: 'Rare', baseGrowthTime: 30, sunlightNeed: 70, waterNeed: 15, temperatureNeed: 95, humidityNeed: 10, soilNeed: 30, lore: 'A crimson flower that thrives near lava flows. Its nectar is said to grant fire resistance.', pestResistance: 70 },
  { id: 'fl_frostlotus', name: 'Arctic Frost Lotus', category: 'Flower', biome: 'Arctic Tundra', rarity: 'Rare', baseGrowthTime: 32, sunlightNeed: 30, waterNeed: 20, temperatureNeed: 10, humidityNeed: 15, soilNeed: 25, lore: 'A crystalline lotus encased in eternal ice. Its petals shatter like glass when touched.', pestResistance: 55 },
  { id: 'fl_starpetal', name: 'Starlight Petunia', category: 'Flower', biome: 'Tropical Rainforest', rarity: 'Legendary', baseGrowthTime: 64, sunlightNeed: 60, waterNeed: 70, temperatureNeed: 65, humidityNeed: 75, soilNeed: 70, lore: 'Opens only at night, its petals mirror constellations. Ancient astronomers used them as star maps.', pestResistance: 30 },
  { id: 'fl_dustdahlia', name: 'Golden Dust Dahlia', category: 'Flower', biome: 'Desert Oasis', rarity: 'Unusual', baseGrowthTime: 20, sunlightNeed: 85, waterNeed: 30, temperatureNeed: 80, humidityNeed: 25, soilNeed: 40, lore: 'Sheds golden pollen that fertilizes surrounding soil. Nomads plant them to create oases.', pestResistance: 45 },
  { id: 'fl_edelweiss', name: 'Iron Edelweiss', category: 'Flower', biome: 'Alpine Meadow', rarity: 'Rare', baseGrowthTime: 28, sunlightNeed: 45, waterNeed: 35, temperatureNeed: 25, humidityNeed: 45, soilNeed: 65, lore: 'Petal fibers are stronger than steel thread. Mountain smiths weave them into armor.', pestResistance: 65 },
  { id: 'fl_nightjade', name: 'Night Jade Blossom', category: 'Flower', biome: 'Mangrove Swamp', rarity: 'Endangered', baseGrowthTime: 44, sunlightNeed: 20, waterNeed: 85, temperatureNeed: 75, humidityNeed: 90, soilNeed: 55, lore: 'Emits a fragrance that induces prophetic dreams. Swamp shamans harvest it for vision quests.', pestResistance: 25 },

  // ---- Trees (10) ----
  { id: 'tr_ironwood', name: 'Ironwood Sentinel', category: 'Tree', biome: 'Tropical Rainforest', rarity: 'Unusual', baseGrowthTime: 60, sunlightNeed: 55, waterNeed: 65, temperatureNeed: 70, humidityNeed: 80, soilNeed: 60, lore: 'Its trunk is harder than iron. Weapons forged from Ironwood never dull.', pestResistance: 75 },
  { id: 'tr_baobab', name: 'Whispering Baobab', category: 'Tree', biome: 'Desert Oasis', rarity: 'Common', baseGrowthTime: 50, sunlightNeed: 80, waterNeed: 35, temperatureNeed: 85, humidityNeed: 15, soilNeed: 30, lore: 'Stores water in its massive trunk. Travelers tap it for fresh water in emergencies.', pestResistance: 55 },
  { id: 'tr_bristlecone', name: 'Ancient Bristlecone', category: 'Tree', biome: 'Alpine Meadow', rarity: 'Rare', baseGrowthTime: 72, sunlightNeed: 40, waterNeed: 25, temperatureNeed: 15, humidityNeed: 30, soilNeed: 55, lore: 'Some specimens are over 5,000 years old. Their rings encode weather patterns of millennia.', pestResistance: 80 },
  { id: 'tr_mangrove_king', name: 'Red Mangrove Monarch', category: 'Tree', biome: 'Mangrove Swamp', rarity: 'Common', baseGrowthTime: 45, sunlightNeed: 60, waterNeed: 95, temperatureNeed: 75, humidityNeed: 90, soilNeed: 50, lore: 'Prop roots create entire island ecosystems. Schools of fish live among its submerged roots.', pestResistance: 60 },
  { id: 'tr_obsidian', name: 'Obsidian Ash', category: 'Tree', biome: 'Volcanic Isle', rarity: 'Rare', baseGrowthTime: 55, sunlightNeed: 65, waterNeed: 20, temperatureNeed: 90, humidityNeed: 15, soilNeed: 25, lore: 'Absorbs volcanic minerals into its bark, creating a naturally armored trunk.', pestResistance: 85 },
  { id: 'tr_frostpine', name: 'Frostpine Evergreen', category: 'Tree', biome: 'Arctic Tundra', rarity: 'Unusual', baseGrowthTime: 52, sunlightNeed: 35, waterNeed: 15, temperatureNeed: 5, humidityNeed: 10, soilNeed: 20, lore: 'Sap freezes into crystalline resin used in cold-resistant alchemy.', pestResistance: 70 },
  { id: 'tr_worldtree', name: 'Yggdrasil Sapling', category: 'Tree', biome: 'Tropical Rainforest', rarity: 'Legendary', baseGrowthTime: 100, sunlightNeed: 50, waterNeed: 70, temperatureNeed: 60, humidityNeed: 70, soilNeed: 80, lore: 'A cosmic sapling connected to the World Tree. Those who care for it gain wisdom beyond mortal comprehension.', pestResistance: 40 },
  { id: 'tr_joshua', name: 'Joshua Thunder Palm', category: 'Tree', biome: 'Desert Oasis', rarity: 'Unusual', baseGrowthTime: 40, sunlightNeed: 85, waterNeed: 20, temperatureNeed: 80, humidityNeed: 10, soilNeed: 35, lore: 'Stores lightning in its fibrous trunk. During storms it crackles with captured electrical energy.', pestResistance: 50 },
  { id: 'tr_bonsai', name: 'Eternity Bonsai', category: 'Tree', biome: 'Alpine Meadow', rarity: 'Endangered', baseGrowthTime: 80, sunlightNeed: 45, waterNeed: 45, temperatureNeed: 30, humidityNeed: 50, soilNeed: 75, lore: 'Never exceeds 30cm but contains the genetic memory of an ancient forest.', pestResistance: 30 },
  { id: 'tr_cypress', name: 'Weeping Shadow Cypress', category: 'Tree', biome: 'Mangrove Swamp', rarity: 'Rare', baseGrowthTime: 50, sunlightNeed: 40, waterNeed: 80, temperatureNeed: 65, humidityNeed: 85, soilNeed: 60, lore: 'Its shadow moves independently of light. Said to be the physical form of forgotten sorrow.', pestResistance: 45 },

  // ---- Herbs (8) ----
  { id: 'hr_sage', name: 'Moonshadow Sage', category: 'Herb', biome: 'Tropical Rainforest', rarity: 'Common', baseGrowthTime: 10, sunlightNeed: 50, waterNeed: 55, temperatureNeed: 65, humidityNeed: 70, soilNeed: 55, lore: 'Enhances mental clarity when brewed as tea. Monks use it during meditation.', pestResistance: 40 },
  { id: 'hr_aloe', name: 'Crimson Aloe', category: 'Herb', biome: 'Desert Oasis', rarity: 'Common', baseGrowthTime: 8, sunlightNeed: 75, waterNeed: 25, temperatureNeed: 80, humidityNeed: 15, soilNeed: 30, lore: 'Its gel glows faintly red and accelerates wound healing threefold.', pestResistance: 55 },
  { id: 'hr_thyme', name: 'Glacier Thyme', category: 'Herb', biome: 'Alpine Meadow', rarity: 'Unusual', baseGrowthTime: 16, sunlightNeed: 45, waterNeed: 30, temperatureNeed: 20, humidityNeed: 35, soilNeed: 55, lore: 'Preserves food indefinitely. Food stored with Glacier Thyme stays fresh for decades.', pestResistance: 50 },
  { id: 'hr_mint', name: 'Bog Spirit Mint', category: 'Herb', biome: 'Mangrove Swamp', rarity: 'Common', baseGrowthTime: 10, sunlightNeed: 45, waterNeed: 75, temperatureNeed: 65, humidityNeed: 80, soilNeed: 45, lore: 'Creates a cooling mist when crushed. Swamp dwellers use it to combat miasma.', pestResistance: 35 },
  { id: 'hr_basil', name: 'Ember Basil', category: 'Herb', biome: 'Volcanic Isle', rarity: 'Unusual', baseGrowthTime: 14, sunlightNeed: 70, waterNeed: 30, temperatureNeed: 85, humidityNeed: 20, soilNeed: 40, lore: 'Leaves are warm to the touch. Cooking with it adds a subtle fiery kick to any dish.', pestResistance: 45 },
  { id: 'hr_willowherb', name: 'Permafrost Willowherb', category: 'Herb', biome: 'Arctic Tundra', rarity: 'Rare', baseGrowthTime: 24, sunlightNeed: 30, waterNeed: 20, temperatureNeed: 8, humidityNeed: 15, soilNeed: 25, lore: 'Roots tap into deep geothermal warmth. Used in Arctic survival kits worldwide.', pestResistance: 60 },
  { id: 'hr_lavender', name: 'Void Lavender', category: 'Herb', biome: 'Tropical Rainforest', rarity: 'Rare', baseGrowthTime: 22, sunlightNeed: 35, waterNeed: 60, temperatureNeed: 60, humidityNeed: 75, soilNeed: 50, lore: 'Its scent opens portals to dreamscapes. Overuse can cause permanent dissociation.', pestResistance: 25 },
  { id: 'hr_rue', name: 'Dragon Rue', category: 'Herb', biome: 'Volcanic Isle', rarity: 'Endangered', baseGrowthTime: 36, sunlightNeed: 75, waterNeed: 15, temperatureNeed: 95, humidityNeed: 10, soilNeed: 20, lore: 'The only herb that can neutralize dragon venom. Nearly extinct due to overharvesting.', pestResistance: 20 },

  // ---- Fungi (8) ----
  { id: 'fu_lumcap', name: 'Luminous Cap', category: 'Fungus', biome: 'Tropical Rainforest', rarity: 'Unusual', baseGrowthTime: 16, sunlightNeed: 15, waterNeed: 70, temperatureNeed: 65, humidityNeed: 90, soilNeed: 65, lore: 'Emits steady blue bioluminescence. Used as a natural light source in deep caverns.', pestResistance: 30 },
  { id: 'fu_deserttruff', name: 'Sand Truffle', category: 'Fungus', biome: 'Desert Oasis', rarity: 'Rare', baseGrowthTime: 28, sunlightNeed: 30, waterNeed: 20, temperatureNeed: 80, humidityNeed: 10, soilNeed: 55, lore: 'Grows beneath dunes. Its flavor is said to combine chocolate and starlight.', pestResistance: 40 },
  { id: 'fu_mountainmorel', name: 'Cloud Morel', category: 'Fungus', biome: 'Alpine Meadow', rarity: 'Common', baseGrowthTime: 14, sunlightNeed: 30, waterNeed: 50, temperatureNeed: 30, humidityNeed: 60, soilNeed: 60, lore: 'Absorbs atmospheric moisture from clouds. Peaks above the treeline after fog.', pestResistance: 35 },
  { id: 'fu_swampshroom', name: 'Phantom Stinkhorn', category: 'Fungus', biome: 'Mangrove Swamp', rarity: 'Unusual', baseGrowthTime: 18, sunlightNeed: 10, waterNeed: 85, temperatureNeed: 70, humidityNeed: 95, soilNeed: 70, lore: 'Its spore cloud induces temporary invisibility. Hunters use it for camouflage.', pestResistance: 20 },
  { id: 'fu_ashcap', name: 'Ember Cap', category: 'Fungus', biome: 'Volcanic Isle', rarity: 'Common', baseGrowthTime: 12, sunlightNeed: 25, waterNeed: 15, temperatureNeed: 90, humidityNeed: 15, soilNeed: 35, lore: 'Spicy flavor with a smoky finish. Edible only when cooled below 200 degrees.', pestResistance: 55 },
  { id: 'fu_iciclefungus', name: 'Crystal Icicle Fungus', category: 'Fungus', biome: 'Arctic Tundra', rarity: 'Rare', baseGrowthTime: 26, sunlightNeed: 20, waterNeed: 25, temperatureNeed: 5, humidityNeed: 20, soilNeed: 30, lore: 'Forms hanging ice-like structures. Dissolves in warm water to create a sweet syrup.', pestResistance: 45 },
  { id: 'fu_braintree', name: 'Brain Coral Fungus', category: 'Fungus', biome: 'Mangrove Swamp', rarity: 'Endangered', baseGrowthTime: 40, sunlightNeed: 20, waterNeed: 80, temperatureNeed: 72, humidityNeed: 88, soilNeed: 60, lore: 'Neural-like networks allow it to learn and remember. Classified as borderline sentient.', pestResistance: 15 },
  { id: 'fu_mythcap', name: 'Mythril Cap', category: 'Fungus', biome: 'Volcanic Isle', rarity: 'Legendary', baseGrowthTime: 56, sunlightNeed: 35, waterNeed: 25, temperatureNeed: 88, humidityNeed: 30, soilNeed: 45, lore: 'Its mycelium network processes mythril ore into pure metal. Dwarven mycologists prize it above all.', pestResistance: 35 },

  // ---- Aquatic (7) ----
  { id: 'aq_lilypad', name: 'Giant Imperial Lily Pad', category: 'Aquatic', biome: 'Tropical Rainforest', rarity: 'Common', baseGrowthTime: 14, sunlightNeed: 65, waterNeed: 95, temperatureNeed: 70, humidityNeed: 85, soilNeed: 40, lore: 'Can support the weight of a grown person. Used as natural boats in rainforest rivers.', pestResistance: 40 },
  { id: 'aq_oasisflower', name: 'Oasis Mirage Flower', category: 'Aquatic', biome: 'Desert Oasis', rarity: 'Unusual', baseGrowthTime: 20, sunlightNeed: 80, waterNeed: 90, temperatureNeed: 85, humidityNeed: 30, soilNeed: 35, lore: 'Creates a localized freshwater spring wherever its roots touch sand.', pestResistance: 35 },
  { id: 'aq_iceshelf', name: 'Frost Shelf Kelp', category: 'Aquatic', biome: 'Arctic Tundra', rarity: 'Rare', baseGrowthTime: 30, sunlightNeed: 25, waterNeed: 70, temperatureNeed: 5, humidityNeed: 15, soilNeed: 20, lore: 'Grows on the underside of ice shelves. Its strands are spun into indestructible rope.', pestResistance: 55 },
  { id: 'aq_tidecoral', name: 'Living Tide Coral', category: 'Aquatic', biome: 'Mangrove Swamp', rarity: 'Rare', baseGrowthTime: 28, sunlightNeed: 50, waterNeed: 95, temperatureNeed: 72, humidityNeed: 90, soilNeed: 50, lore: 'Builds living reef structures that protect coastlines. Each generation builds upon the last.', pestResistance: 50 },
  { id: 'aq_hotspring', name: 'Thermal Vent Bloom', category: 'Aquatic', biome: 'Volcanic Isle', rarity: 'Endangered', baseGrowthTime: 38, sunlightNeed: 15, waterNeed: 85, temperatureNeed: 95, humidityNeed: 40, soilNeed: 30, lore: 'Thrives in boiling water near hydrothermal vents. Its enzymes power ancient machinery.', pestResistance: 25 },
  { id: 'aq_alpinecress', name: 'Crystal Water Cress', category: 'Aquatic', biome: 'Alpine Meadow', rarity: 'Unusual', baseGrowthTime: 18, sunlightNeed: 55, waterNeed: 80, temperatureNeed: 25, humidityNeed: 60, soilNeed: 65, lore: 'Purifies any water it touches. Mountain villages plant it upstream for clean drinking water.', pestResistance: 45 },
  { id: 'aq_abyssflower', name: 'Abyssal Deep Flower', category: 'Aquatic', biome: 'Tropical Rainforest', rarity: 'Legendary', baseGrowthTime: 60, sunlightNeed: 5, waterNeed: 100, temperatureNeed: 50, humidityNeed: 95, soilNeed: 70, lore: 'Blooms in complete darkness at extreme depths. Its petals contain compressed bioluminescent energy.', pestResistance: 20 },

  // ---- Carnivorous (7) ----
  { id: 'cv_sundew', name: 'Ember Sundew', category: 'Carnivorous', biome: 'Desert Oasis', rarity: 'Common', baseGrowthTime: 14, sunlightNeed: 80, waterNeed: 35, temperatureNeed: 85, humidityNeed: 25, soilNeed: 20, lore: 'Its dew drops are molten-hot adhesive. Attracts and traps desert insects for nitrogen.', pestResistance: 70 },
  { id: 'cv_pitcher', name: 'Jungle Death Pitcher', category: 'Carnivorous', biome: 'Tropical Rainforest', rarity: 'Unusual', baseGrowthTime: 22, sunlightNeed: 40, waterNeed: 75, temperatureNeed: 70, humidityNeed: 85, soilNeed: 30, lore: 'Its digestive fluid can dissolve bone. Some pitchers grow large enough to trap small mammals.', pestResistance: 60 },
  { id: 'cv_venusfly', name: 'Alpine Venus Trap', category: 'Carnivorous', biome: 'Alpine Meadow', rarity: 'Rare', baseGrowthTime: 24, sunlightNeed: 60, waterNeed: 40, temperatureNeed: 25, humidityNeed: 50, soilNeed: 25, lore: 'Snaps shut at 200mph — the fastest plant movement recorded. Produces a sound like a thunderclap.', pestResistance: 65 },
  { id: 'cv_butterwort', name: 'Shadow Butterwort', category: 'Carnivorous', biome: 'Mangrove Swamp', rarity: 'Unusual', baseGrowthTime: 18, sunlightNeed: 25, waterNeed: 80, temperatureNeed: 65, humidityNeed: 90, soilNeed: 35, lore: 'Its leaves excrete a paralytic oil. Swamp predators roll in it to weaken prey.', pestResistance: 40 },
  { id: 'cv_bladderwort', name: 'Magma Bladderwort', category: 'Carnivorous', biome: 'Volcanic Isle', rarity: 'Rare', baseGrowthTime: 26, sunlightNeed: 45, waterNeed: 60, temperatureNeed: 90, humidityNeed: 25, soilNeed: 15, lore: 'Vacuum traps underwater filled with superheated water. Absorbs minerals from dissolved prey.', pestResistance: 55 },
  { id: 'cv_cobra', name: 'Frost Cobra Lily', category: 'Carnivorous', biome: 'Arctic Tundra', rarity: 'Endangered', baseGrowthTime: 42, sunlightNeed: 35, waterNeed: 30, temperatureNeed: 5, humidityNeed: 20, soilNeed: 20, lore: 'Mimics a cobra with frost-venom fangs. Only three colonies remain in the wild.', pestResistance: 30 },
  { id: 'cv_worldtrap', name: 'World-Eater Snap Plant', category: 'Carnivorous', biome: 'Tropical Rainforest', rarity: 'Legendary', baseGrowthTime: 72, sunlightNeed: 50, waterNeed: 80, temperatureNeed: 75, humidityNeed: 90, soilNeed: 40, lore: 'An apex predator plant with intelligence rivaling small animals. Feared and revered by rainforest tribes.', pestResistance: 50 },
];

// ---------------------------------------------------------------------------
// Cross-Pollination Hybrids (15)
// ---------------------------------------------------------------------------

const HYBRID_RECIPES: HybridRecipe[] = [
  { parentA: 'fl_orchid', parentB: 'fl_sunrose', resultSpecies: 'hy_rose_orchid', resultName: 'Aurora Rose Orchid', requiredLevel: 5 },
  { parentA: 'tr_ironwood', parentB: 'tr_obsidian', resultSpecies: 'hy_volcanic_iron', resultName: 'Volcanic Ironwood', requiredLevel: 10 },
  { parentA: 'fl_firebloom', parentB: 'fl_frostlotus', resultSpecies: 'hy_steam_bloom', resultName: 'Steam Phoenix Bloom', requiredLevel: 15 },
  { parentA: 'fu_lumcap', parentB: 'fu_ashcap', resultSpecies: 'hy_ember_glow', resultName: 'Emberglow Mushroom', requiredLevel: 8 },
  { parentA: 'hr_sage', parentB: 'hr_lavender', resultSpecies: 'hy_dream_weed', resultName: 'Prophetic Dreamweed', requiredLevel: 12 },
  { parentA: 'aq_lilypad', parentB: 'fl_manglily', resultSpecies: 'hy_mega_lily', resultName: 'Leviathan Lily Pad', requiredLevel: 7 },
  { parentA: 'cv_sundew', parentB: 'cv_pitcher', resultSpecies: 'hy_death_trap', resultName: 'Chalice of Doom', requiredLevel: 18 },
  { parentA: 'tr_worldtree', parentB: 'fl_starpetal', resultSpecies: 'hy_cosmic_tree', resultName: 'Cosmic Worldbloom', requiredLevel: 25 },
  { parentA: 'hr_basil', parentB: 'hr_rue', resultSpecies: 'hy_dragon_herb', resultName: 'Dragon Fire Basil', requiredLevel: 20 },
  { parentA: 'aq_iceshelf', parentB: 'fl_frostlotus', resultSpecies: 'hy_ice_crown', resultName: 'Ice Crown Formation', requiredLevel: 14 },
  { parentA: 'fu_braintree', parentB: 'fu_mythcap', resultSpecies: 'hy_thinking_cap', resultName: 'Sentient Thinking Cap', requiredLevel: 30 },
  { parentA: 'cv_worldtrap', parentB: 'cv_cobra', resultSpecies: 'hy_apex_plant', resultName: 'Apex Monstera', requiredLevel: 35 },
  { parentA: 'tr_bonsai', parentB: 'hr_thyme', resultSpecies: 'hy_time_tree', resultName: 'Eternal Thyme Tree', requiredLevel: 22 },
  { parentA: 'aq_hotspring', parentB: 'fl_firebloom', resultSpecies: 'hy_thermal_bloom', resultName: 'Thermal Geysir Flower', requiredLevel: 16 },
  { parentA: 'fl_nightjade', parentB: 'aq_abyssflower', resultSpecies: 'hy_abyssal_jade', resultName: 'Abyssal Dream Jade', requiredLevel: 28 },
];

// ---------------------------------------------------------------------------
// Herb Recipes (15)
// ---------------------------------------------------------------------------

const HERB_RECIPES: HerbRecipe[] = [
  { id: 'hr_health_potion', name: 'Vitality Draught', ingredients: ['hr_sage', 'hr_aloe', 'aq_lilypad'], effect: 'Restores 50 health to all plants', potency: 50, crafted: false },
  { id: 'hr_growth_elixir', name: 'Green Thumb Elixir', ingredients: ['hr_mint', 'fu_lumcap', 'aq_oasisflower'], effect: 'Doubles growth speed for 10 ticks', potency: 80, crafted: false },
  { id: 'hr_pest_repel', name: 'Pest Bane Tonic', ingredients: ['hr_basil', 'cv_sundew', 'hr_rue'], effect: 'Eliminates all pests from 3 plots', potency: 70, crafted: false },
  { id: 'hr_frost_shield', name: 'Winter Ward Balm', ingredients: ['hr_willowherb', 'fl_frostlotus', 'aq_iceshelf'], effect: 'Immunity to cold damage for 20 ticks', potency: 60, crafted: false },
  { id: 'hr_fire_elixir', name: 'Ember Heart Brew', ingredients: ['hr_basil', 'fl_firebloom', 'fu_ashcap'], effect: 'Boosts temperature tolerance by 30', potency: 65, crafted: false },
  { id: 'hr_dream_potion', name: 'Somnus Draught', ingredients: ['hr_lavender', 'fl_nightjade', 'fu_braintree'], effect: 'Auto-generates journal entries', potency: 40, crafted: false },
  { id: 'hr_mega_fert', name: 'Verdant Fertilizer', ingredients: ['hr_sage', 'aq_alpinecress', 'fu_mountainmorel'], effect: 'Soil quality +40 for all plots', potency: 75, crafted: false },
  { id: 'hr_cure_all', name: 'Panacea', ingredients: ['hr_rue', 'aq_tidecoral', 'fl_edelweiss'], effect: 'Cures all diseases and pests', potency: 100, crafted: false },
  { id: 'hr_xp_boost', name: 'Botanist Wisdom Tea', ingredients: ['hr_thyme', 'fl_alpinebell', 'tr_bonsai'], effect: 'Double XP for 15 ticks', potency: 55, crafted: false },
  { id: 'hr_hybrid_boost', name: 'Genesis Catalyst', ingredients: ['fu_mythcap', 'fl_starpetal', 'tr_worldtree'], effect: 'Guarantees hybrid success', potency: 90, crafted: false },
  { id: 'hr_water_purify', name: 'Crystal Spring Filter', ingredients: ['aq_alpinecress', 'aq_lilypad', 'hr_mint'], effect: 'Water condition +50 for 12 ticks', potency: 70, crafted: false },
  { id: 'hr_rain_call', name: 'Cloud Summoner Incense', ingredients: ['fu_lumcap', 'aq_oasisflower', 'fl_dustdahlia'], effect: 'Forces Rainy weather', potency: 45, crafted: false },
  { id: 'hr_regen_soil', name: 'Terra Renewal Compost', ingredients: ['fu_swampshroom', 'hr_sage', 'aq_tidecoral'], effect: 'Fully restores soil quality', potency: 85, crafted: false },
  { id: 'hr_sun_call', name: 'Solar Beacon Oil', ingredients: ['fl_sunrose', 'hr_aloe', 'fl_dustdahlia'], effect: 'Forces Sunny weather', potency: 45, crafted: false },
  { id: 'hr_legend_seed', name: 'Genesis Seed Pod', ingredients: ['fl_starpetal', 'fu_mythcap', 'aq_abyssflower'], effect: 'Creates one random legendary seed', potency: 95, crafted: false },
];

// ---------------------------------------------------------------------------
// Research Topics (10)
// ---------------------------------------------------------------------------

const RESEARCH_TOPICS_DEF: Omit<ResearchTopic, 'progress' | 'isActive' | 'completed'>[] = [
  { id: 'res_germination', name: 'Advanced Germination', description: 'Study seed viability to improve sprouting rates.', cost: 20, unlocks: ['fl_edelweiss'], xpReward: 100 },
  { id: 'res_myco_networks', name: 'Mycorrhizal Networks', description: 'Understand fungal communication for better soil health.', cost: 30, unlocks: ['fu_braintree'], xpReward: 150 },
  { id: 'res_hybrid_genetics', name: 'Hybrid Genetics', description: 'Decode plant DNA to enable cross-pollination.', cost: 40, unlocks: ['hybrid_boost'], xpReward: 200 },
  { id: 'res_thermal_biology', name: 'Thermal Plant Biology', description: 'Research volcanic flora adaptations.', cost: 35, unlocks: ['fl_firebloom', 'fu_ashcap'], xpReward: 180 },
  { id: 'res_arctic_flora', name: 'Cryoflora Studies', description: 'Investigate freeze-resistant plant mechanisms.', cost: 35, unlocks: ['fl_frostlotus', 'aq_iceshelf'], xpReward: 180 },
  { id: 'res_carnivore_evo', name: 'Carnivorous Evolution', description: 'Trace the evolution of predatory plants.', cost: 45, unlocks: ['cv_worldtrap'], xpReward: 250 },
  { id: 'res_aqua_ecology', name: 'Deep Aquatic Ecology', description: 'Explore underwater plant ecosystems.', cost: 50, unlocks: ['aq_abyssflower'], xpReward: 300 },
  { id: 'res_herbology', name: 'Advanced Herbology', description: 'Master the properties of medicinal plants.', cost: 40, unlocks: ['hr_rue', 'hr_lavender'], xpReward: 220 },
  { id: 'res_cosmic_flora', name: 'Cosmic Botany', description: 'Study plants connected to celestial phenomena.', cost: 60, unlocks: ['tr_worldtree', 'fl_starpetal'], xpReward: 500 },
  { id: 'res_resilience', name: 'Pest & Disease Resistance', description: 'Develop natural plant defense mechanisms.', cost: 45, unlocks: ['resilience_boost'], xpReward: 200 },
];

// ---------------------------------------------------------------------------
// Pest & Disease Events (8)
// ---------------------------------------------------------------------------

const PEST_EVENTS: PestEvent[] = [
  { id: 'pest_aphid', name: 'Aphid Swarm', description: 'A swarm of aphids descends on moisture-loving plants.', healthDamage: 15, pestIncrease: 30, diseaseIncrease: 5, affectedBiomes: ['Tropical Rainforest', 'Mangrove Swamp'] },
  { id: 'pest_beetle', name: 'Bark Beetle Infestation', description: 'Bark beetles bore into tree trunks, weakening them from within.', healthDamage: 25, pestIncrease: 40, diseaseIncrease: 10, affectedBiomes: ['Alpine Meadow', 'Tropical Rainforest'] },
  { id: 'pest_fungus', name: 'Black Mold Blight', description: 'A fast-spreading black mold attacks in humid conditions.', healthDamage: 20, pestIncrease: 10, diseaseIncrease: 45, affectedBiomes: ['Mangrove Swamp', 'Tropical Rainforest', 'Arctic Tundra'] },
  { id: 'pest_locust', name: 'Desert Locust Plague', description: 'Locusts strip plants bare in minutes.', healthDamage: 35, pestIncrease: 50, diseaseIncrease: 5, affectedBiomes: ['Desert Oasis', 'Volcanic Isle'] },
  { id: 'pest_moth', name: 'Luna Moth Caterpillar', description: 'Giant caterpillars voraciously consume leaves.', healthDamage: 20, pestIncrease: 35, diseaseIncrease: 0, affectedBiomes: ['Alpine Meadow', 'Mangrove Swamp'] },
  { id: 'pest_scale', name: 'Volcanic Scale Insect', description: 'Heat-resistant scale insects drain plant sap near volcanic vents.', healthDamage: 18, pestIncrease: 25, diseaseIncrease: 15, affectedBiomes: ['Volcanic Isle', 'Desert Oasis'] },
  { id: 'pest_frostbite', name: 'Permafrost Rot', description: 'Ice-borne rot spreads through plant root systems.', healthDamage: 30, pestIncrease: 5, diseaseIncrease: 40, affectedBiomes: ['Arctic Tundra', 'Alpine Meadow'] },
  { id: 'pest_vine', name: 'Strangler Vine Outbreak', description: 'Parasitic vines attack neighboring plants.', healthDamage: 28, pestIncrease: 20, diseaseIncrease: 20, affectedBiomes: ['Tropical Rainforest', 'Mangrove Swamp', 'Desert Oasis'] },
];

// ---------------------------------------------------------------------------
// Achievements (15)
// ---------------------------------------------------------------------------

const ACHIEVEMENTS_DEF: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'ach_green_thumb', name: 'Green Thumb', description: 'Successfully harvest your first plant.', condition: 'totalHarvested >= 1', icon: '🌱' },
  { id: 'ach_master_botanist', name: 'Master Botanist', description: 'Reach botanist level 50.', condition: 'level >= 50', icon: '🏆' },
  { id: 'ach_rare_collector', name: 'Rare Collector', description: 'Discover 10 rare or endangered species.', condition: 'discoveredRare >= 10', icon: '💎' },
  { id: 'ach_hybrid_creator', name: 'Hybrid Creator', description: 'Create your first hybrid species.', condition: 'totalHybrids >= 1', icon: '🧬' },
  { id: 'ach_full_greenhouse', name: 'Full Greenhouse', description: 'Plant something in all 25 plots.', condition: 'plantedPlots >= 25', icon: '🏡' },
  { id: 'ach_researcher', name: 'Dedicated Researcher', description: 'Complete 5 research topics.', condition: 'completedResearch >= 5', icon: '🔬' },
  { id: 'ach_encyclopedia', name: 'Living Encyclopedia', description: 'Discover all 50 species.', condition: 'totalDiscovered >= 50', icon: '📖' },
  { id: 'ach_herb_master', name: 'Herbalism Master', description: 'Craft all 15 herbal remedies.', condition: 'craftedRemedies >= 15', icon: '🧪' },
  { id: 'ach_pest_free', name: 'Pest-Free Garden', description: 'Go 30 ticks without any pest event.', condition: 'pestFreeTicks >= 30', icon: '🛡️' },
  { id: 'ach_legendary_grow', name: 'Legendary Harvest', description: 'Harvest a legendary species.', condition: 'legendaryHarvest >= 1', icon: '⭐' },
  { id: 'ach_daily_streak', name: 'Consistent Gardener', description: 'Complete 7 daily tasks in a row.', condition: 'currentStreak >= 7', icon: '📅' },
  { id: 'ach_all_biomes', name: 'World Traveler', description: 'Grow plants from all 6 biomes.', condition: 'biomesCovered >= 6', icon: '🌍' },
  { id: 'ach_seed_hoarder', name: 'Seed Hoarder', description: 'Fill your seed bank to capacity.', condition: 'seedBankFull', icon: '🌰' },
  { id: 'ach_journal_100', name: 'Dedicated Journaler', description: 'Write 100 journal entries.', condition: 'journalEntries >= 100', icon: '📓' },
  { id: 'ach_perfect_health', name: 'Perfect Health', description: 'Have all plots at 100% health simultaneously.', condition: 'allPerfectHealth', icon: '💯' },
];

// ---------------------------------------------------------------------------
// State — lazy initialized, no browser API at module level
// ---------------------------------------------------------------------------

let state: BotanicalGardenState | null = null;

function ensureInit(): BotanicalGardenState {
  if (state) return state;

  const emptyPlots: PlotData[] = [];
  for (let i = 0; i < TOTAL_PLOTS; i++) {
    emptyPlots.push({
      index: i,
      plantId: null,
      growthStage: 'Seed',
      growthProgress: 0,
      overallProgress: 0,
      health: 100,
      lastCaredAt: 0,
      waterLevel: 50,
      fertilizerLevel: 0,
      pestLevel: 0,
      diseaseLevel: 0,
      isProtected: false,
    });
  }

  const researchTopics: ResearchTopic[] = RESEARCH_TOPICS_DEF.map((t) => ({
    ...t,
    progress: 0,
    isActive: false,
    completed: false,
  }));

  const encyclopedia: EncyclopediaEntry[] = PLANT_SPECIES.map((s) => ({
    speciesId: s.id,
    discovered: false,
    discoveredAt: 0,
    journalNote: '',
    observationsCount: 0,
  }));

  state = {
    level: 1,
    xp: 0,
    plots: emptyPlots,
    seedBank: [],
    researchTopics,
    herbRemedies: [],
    discoveredSpecies: [],
    encyclopedia,
    dailyTask: null,
    season: 0,
    weather: 0,
    achievements: [],
    totalHarvested: 0,
    totalPlanted: 0,
    totalHybrids: 0,
    totalPestEvents: 0,
    totalRemediesCrafted: 0,
    currentStreak: 0,
    longestStreak: 0,
    tick: 0,
    conditions: { sunlight: 50, water: 50, temperature: 50, humidity: 50, soilQuality: 50 },
    seedBankCapacity: 50,
    journalEntries: [],
    activePestEvent: null,
    pestEventCooldown: 0,
    lastSeasonAdvance: 0,
    lastWeatherChange: 0,
    unlockedHybrids: [],
  };

  return state;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function speciesById(id: string): PlantSpecies | undefined {
  return PLANT_SPECIES.find((s) => s.id === id);
}

function nextStage(current: GrowthStage): GrowthStage | null {
  const idx = GROWTH_STAGES_ORDER.indexOf(current);
  if (idx < 0 || idx >= GROWTH_STAGES_ORDER.length - 1) return null;
  return GROWTH_STAGES_ORDER[idx + 1];
}

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function simpleDateSeed(tick: number): number {
  // Deterministic daily seed: treat every 240 ticks as a "day"
  return Math.floor(tick / 240);
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function applySeasonalConditions(base: GrowthConditions, seasonIdx: number): GrowthConditions {
  const s = SEASONS[seasonIdx];
  const bonus = SEASON_CONDITION_BONUS[s];
  return {
    sunlight: clamp(base.sunlight + (bonus.sunlight ?? 0), 0, 100),
    water: clamp(base.water + (bonus.water ?? 0), 0, 100),
    temperature: clamp(base.temperature + (bonus.temperature ?? 0), 0, 100),
    humidity: clamp(base.humidity + (bonus.humidity ?? 0), 0, 100),
    soilQuality: clamp(base.soilQuality + (bonus.soilQuality ?? 0), 0, 100),
  };
}

function applyWeatherToConditions(base: GrowthConditions, weatherIdx: number): GrowthConditions {
  const w = WEATHERS[weatherIdx];
  const fx = WEATHER_EFFECTS[w];
  return {
    sunlight: clamp(base.sunlight + (fx.sunlight ?? 0), 0, 100),
    water: clamp(base.water + (fx.water ?? 0), 0, 100),
    temperature: clamp(base.temperature + (fx.temperature ?? 0), 0, 100),
    humidity: clamp(base.humidity + (fx.humidity ?? 0), 0, 100),
    soilQuality: clamp(base.soilQuality + (fx.soilQuality ?? 0), 0, 100),
  };
}

function conditionMatch(conditions: GrowthConditions, species: PlantSpecies): number {
  // Returns 0-100 match score (100 = perfect conditions)
  const deltas = [
    Math.abs(conditions.sunlight - species.sunlightNeed),
    Math.abs(conditions.water - species.waterNeed),
    Math.abs(conditions.temperature - species.temperatureNeed),
    Math.abs(conditions.humidity - species.humidityNeed),
    Math.abs(conditions.soilQuality - species.soilNeed),
  ];
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  return clamp(Math.round(100 - avgDelta * 1.5), 0, 100);
}

function addSeedToBank(s: BotanicalGardenState, speciesId: string, source: SeedData['source']): void {
  const existing = s.seedBank.find((sd) => sd.speciesId === speciesId);
  if (existing) {
    existing.quantity += 1;
    existing.acquiredAt = s.tick;
  } else {
    s.seedBank.push({ speciesId, quantity: 1, acquiredAt: s.tick, source });
  }
}

function generateJournalNote(species: PlantSpecies, stage: GrowthStage, tick: number): string {
  const snippets: Record<GrowthStage, string[]> = {
    Seed: [`A ${species.name} seed has been planted in plot at tick ${tick}.`, `${species.name} seed nestled into the soil. Fingers crossed.`],
    Sprout: [`Tiny green shoots emerge from the ${species.name} seed.`, `First signs of life — ${species.name} is sprouting!`],
    Growing: [`The ${species.name} stretches toward the light.`, `${species.name} is growing steadily. Leaves unfurling.`],
    Mature: [`${species.name} has reached maturity. A fine specimen.`, `Fully grown ${species.name}. Its ${species.category.toLowerCase()} features are on full display.`],
    Flowering: [`${species.name} blooms with magnificent color.`, `The flowers of ${species.name} are breathtaking this season.`],
    'Seed-bearing': [`${species.name} produces viable seeds. Ready for harvest!`, `${species.name} enters the seed-bearing stage. A full lifecycle complete.`],
  };
  const arr = snippets[stage] || [''];
  return arr[tick % arr.length];
}

// ---------------------------------------------------------------------------
// 1. State Management
// ---------------------------------------------------------------------------

export function btGetState(): BotanicalGardenState {
  return ensureInit();
}

export function btResetState(): void {
  state = null;
  ensureInit();
}

export function btAdvanceTick(count?: number): void {
  const s = ensureInit();
  const steps = count ?? 1;
  for (let i = 0; i < steps; i++) {
    s.tick += 1;

    // Weather changes roughly every 60 ticks
    if (s.tick - s.lastWeatherChange >= 60) {
      s.weather = Math.floor(seededRandom(s.tick * 7 + 3) * WEATHERS.length);
      s.lastWeatherChange = s.tick;
    }

    // Season changes every 500 ticks
    if (s.tick - s.lastSeasonAdvance >= 500) {
      s.season = (s.season + 1) % 4;
      s.lastSeasonAdvance = s.tick;
    }

    // Pest event chance
    if (s.pestEventCooldown > 0) {
      s.pestEventCooldown -= 1;
    } else if (s.activePestEvent === null && seededRandom(s.tick * 13 + 7) < 0.04) {
      const evt = PEST_EVENTS[Math.floor(seededRandom(s.tick * 17) * PEST_EVENTS.length)];
      s.activePestEvent = { ...evt };
      s.totalPestEvents += 1;
      s.pestEventCooldown = 30;
    }

    // Grow plants
    for (const plot of s.plots) {
      if (!plot.plantId) continue;
      const species = speciesById(plot.plantId);
      if (!species) continue;

      const effective = applyWeatherToConditions(applySeasonalConditions(s.conditions, s.season), s.weather);
      const match = conditionMatch(effective, species);
      const seasonMult = SEASON_GROWTH_MULTIPLIER[SEASONS[s.season]];
      const rarityMult = RARITY_MULTIPLIER[species.rarity];
      const growthRate = (match / 100) * seasonMult / rarityMult * (1 + plot.fertilizerLevel / 100);

      plot.growthProgress = clamp(plot.growthProgress + growthRate * 2, 0, 100);
      plot.overallProgress = clamp(plot.overallProgress + growthRate * 0.8, 0, 100);

      if (plot.growthProgress >= 100) {
        const next = nextStage(plot.growthStage);
        if (next) {
          plot.growthStage = next;
          plot.growthProgress = 0;
          // Auto journal
          s.journalEntries.push({
            tick: s.tick,
            plantId: plot.plantId,
            stage: plot.growthStage,
            note: generateJournalNote(species, plot.growthStage, s.tick),
          });
          // Discover
          if (!s.discoveredSpecies.includes(plot.plantId)) {
            s.discoveredSpecies.push(plot.plantId);
            const entry = s.encyclopedia.find((e) => e.speciesId === plot.plantId);
            if (entry) {
              entry.discovered = true;
              entry.discoveredAt = s.tick;
            }
          }
        }
      }

      // Passive decay
      plot.waterLevel = clamp(plot.waterLevel - 1.5, 0, 100);
      plot.fertilizerLevel = clamp(plot.fertilizerLevel - 0.5, 0, 100);

      // Apply pest event damage
      if (s.activePestEvent) {
        if (s.activePestEvent.affectedBiomes.includes(species.biome)) {
          if (!plot.isProtected) {
            plot.pestLevel = clamp(plot.pestLevel + 2, 0, 100);
            plot.diseaseLevel = clamp(plot.diseaseLevel + 1, 0, 100);
            const dmgFactor = (100 - species.pestResistance) / 100;
            plot.health = clamp(plot.health - s.activePestEvent.healthDamage * dmgFactor * 0.05, 0, 100);
          }
        }
      }

      // Health recovery when well cared
      if (plot.waterLevel > 30 && plot.pestLevel < 20 && plot.diseaseLevel < 20) {
        plot.health = clamp(plot.health + 0.5, 0, 100);
      }

      // Water deficiency damage
      if (plot.waterLevel < 10) {
        plot.health = clamp(plot.health - 1, 0, 100);
      }
    }

    // Resolve pest event after 15 ticks
    if (s.activePestEvent && s.totalPestEvents > 0) {
      // Check if all plots have recovered
      const maxPest = Math.max(...s.plots.filter((p) => p.plantId).map((p) => p.pestLevel));
      if (maxPest < 10 || (s.tick % 15 === 0 && s.tick > 0)) {
        // Clear event on low pest levels or every 15 ticks
        if (maxPest < 10) {
          s.activePestEvent = null;
        }
      }
    }

    // Active research
    for (const topic of s.researchTopics) {
      if (topic.isActive && !topic.completed) {
        topic.progress = clamp(topic.progress + 2, 0, 100);
        if (topic.progress >= 100) {
          topic.completed = true;
          topic.isActive = false;
          btAddXP(topic.xpReward);
          for (const unlock of topic.unlocks) {
            if (unlock === 'hybrid_boost' || unlock === 'resilience_boost') continue;
            // Grant seed for unlocked species
            if (speciesById(unlock) && !s.seedBank.find((sd) => sd.speciesId === unlock)) {
              addSeedToBank(s, unlock, 'research');
            }
          }
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Plot Management
// ---------------------------------------------------------------------------

export function btGetPlots(): PlotData[] {
  return ensureInit().plots;
}

export function btGetPlotInfo(index: number): PlotData | null {
  const s = ensureInit();
  if (index < 0 || index >= TOTAL_PLOTS) return null;
  return s.plots[index];
}

export function btPlantSeed(plotIndex: number, speciesId: string): boolean {
  const s = ensureInit();
  if (plotIndex < 0 || plotIndex >= TOTAL_PLOTS) return false;
  const plot = s.plots[plotIndex];
  if (plot.plantId) return false;

  const seed = s.seedBank.find((sd) => sd.speciesId === speciesId && sd.quantity > 0);
  if (!seed) return false;

  const species = speciesById(speciesId);
  if (!species) return false;

  seed.quantity -= 1;
  if (seed.quantity <= 0) {
    s.seedBank = s.seedBank.filter((sd) => sd.speciesId !== speciesId);
  }

  plot.plantId = speciesId;
  plot.growthStage = 'Seed';
  plot.growthProgress = 0;
  plot.overallProgress = 0;
  plot.health = 100;
  plot.waterLevel = 60;
  plot.fertilizerLevel = 0;
  plot.pestLevel = 0;
  plot.diseaseLevel = 0;
  plot.isProtected = false;
  plot.lastCaredAt = s.tick;

  s.totalPlanted += 1;

  // Journal entry
  s.journalEntries.push({
    tick: s.tick,
    plantId: speciesId,
    stage: 'Seed',
    note: generateJournalNote(species, 'Seed', s.tick),
  });

  // Discover
  if (!s.discoveredSpecies.includes(speciesId)) {
    s.discoveredSpecies.push(speciesId);
    const entry = s.encyclopedia.find((e) => e.speciesId === speciesId);
    if (entry) {
      entry.discovered = true;
      entry.discoveredAt = s.tick;
    }
  }

  btCheckAchievements();
  return true;
}

export function btRemovePlant(plotIndex: number): boolean {
  const s = ensureInit();
  if (plotIndex < 0 || plotIndex >= TOTAL_PLOTS) return false;
  const plot = s.plots[plotIndex];
  if (!plot.plantId) return false;

  plot.plantId = null;
  plot.growthStage = 'Seed';
  plot.growthProgress = 0;
  plot.overallProgress = 0;
  plot.health = 100;
  plot.waterLevel = 50;
  plot.fertilizerLevel = 0;
  plot.pestLevel = 0;
  plot.diseaseLevel = 0;
  plot.isProtected = false;

  return true;
}

// ---------------------------------------------------------------------------
// 3. Plant Lifecycle
// ---------------------------------------------------------------------------

export function btGetGrowthStage(plotIndex: number): GrowthStage | null {
  const plot = btGetPlotInfo(plotIndex);
  return plot?.growthStage ?? null;
}

export function btAdvanceGrowth(plotIndex: number): boolean {
  const s = ensureInit();
  const plot = btGetPlotInfo(plotIndex);
  if (!plot || !plot.plantId) return false;

  const n = nextStage(plot.growthStage);
  if (!n) return false;

  plot.growthStage = n;
  plot.growthProgress = 0;

  const species = speciesById(plot.plantId);
  if (species) {
    s.journalEntries.push({
      tick: s.tick,
      plantId: plot.plantId,
      stage: n,
      note: generateJournalNote(species, n, s.tick),
    });
    if (!s.discoveredSpecies.includes(plot.plantId)) {
      s.discoveredSpecies.push(plot.plantId);
    }
  }

  btCheckAchievements();
  return true;
}

export function btCheckGrowthConditions(plotIndex: number): number {
  const s = ensureInit();
  const plot = btGetPlotInfo(plotIndex);
  if (!plot || !plot.plantId) return 0;
  const species = speciesById(plot.plantId);
  if (!species) return 0;
  const effective = applyWeatherToConditions(applySeasonalConditions(s.conditions, s.season), s.weather);
  return conditionMatch(effective, species);
}

// ---------------------------------------------------------------------------
// 4. Care Actions
// ---------------------------------------------------------------------------

export function btWaterPlant(plotIndex: number): boolean {
  const s = ensureInit();
  const plot = btGetPlotInfo(plotIndex);
  if (!plot || !plot.plantId) return false;
  plot.waterLevel = clamp(plot.waterLevel + 25, 0, 100);
  plot.lastCaredAt = s.tick;
  btAddXP(3);
  return true;
}

export function btFertilizePlant(plotIndex: number): boolean {
  const s = ensureInit();
  const plot = btGetPlotInfo(plotIndex);
  if (!plot || !plot.plantId) return false;
  plot.fertilizerLevel = clamp(plot.fertilizerLevel + 30, 0, 100);
  plot.lastCaredAt = s.tick;
  btAddXP(4);
  return true;
}

export function btPrunePlant(plotIndex: number): boolean {
  const s = ensureInit();
  const plot = btGetPlotInfo(plotIndex);
  if (!plot || !plot.plantId) return false;
  plot.diseaseLevel = clamp(plot.diseaseLevel - 20, 0, 100);
  plot.health = clamp(plot.health + 5, 0, 100);
  plot.lastCaredAt = s.tick;
  btAddXP(3);
  return true;
}

export function btPollinate(plotIndex: number): boolean {
  const s = ensureInit();
  const plot = btGetPlotInfo(plotIndex);
  if (!plot || !plot.plantId) return false;
  if (plot.growthStage !== 'Flowering') return false;
  plot.growthProgress = clamp(plot.growthProgress + 15, 0, 100);
  plot.lastCaredAt = s.tick;
  btAddXP(5);
  return true;
}

export function btProtectPlant(plotIndex: number): boolean {
  const s = ensureInit();
  const plot = btGetPlotInfo(plotIndex);
  if (!plot || !plot.plantId) return false;
  plot.isProtected = true;
  plot.pestLevel = clamp(plot.pestLevel - 10, 0, 100);
  plot.lastCaredAt = s.tick;
  btAddXP(3);
  return true;
}

// ---------------------------------------------------------------------------
// 5. Conditions
// ---------------------------------------------------------------------------

export function btGetConditions(): GrowthConditions {
  const s = ensureInit();
  return applyWeatherToConditions(applySeasonalConditions(s.conditions, s.season), s.weather);
}

export function btGetBaseConditions(): GrowthConditions {
  return { ...ensureInit().conditions };
}

export function btUpdateConditions(delta: Partial<GrowthConditions>): void {
  const s = ensureInit();
  if (delta.sunlight !== undefined) s.conditions.sunlight = clamp(s.conditions.sunlight + delta.sunlight, 0, 100);
  if (delta.water !== undefined) s.conditions.water = clamp(s.conditions.water + delta.water, 0, 100);
  if (delta.temperature !== undefined) s.conditions.temperature = clamp(s.conditions.temperature + delta.temperature, 0, 100);
  if (delta.humidity !== undefined) s.conditions.humidity = clamp(s.conditions.humidity + delta.humidity, 0, 100);
  if (delta.soilQuality !== undefined) s.conditions.soilQuality = clamp(s.conditions.soilQuality + delta.soilQuality, 0, 100);
}

export function btApplyWeatherEffect(weatherIdx?: number): GrowthConditions {
  const s = ensureInit();
  if (weatherIdx !== undefined) s.weather = clamp(weatherIdx, 0, WEATHERS.length - 1);
  return btGetConditions();
}

// ---------------------------------------------------------------------------
// 6. Harvesting
// ---------------------------------------------------------------------------

export function btCanHarvest(plotIndex: number): boolean {
  const plot = btGetPlotInfo(plotIndex);
  if (!plot || !plot.plantId) return false;
  return plot.growthStage === 'Seed-bearing' && plot.health > 20;
}

export function btHarvestPlant(plotIndex: number): { speciesId: string; seedCount: number; xpGained: number } | null {
  const s = ensureInit();
  if (!btCanHarvest(plotIndex)) return null;
  const plot = s.plots[plotIndex];
  const species = speciesById(plot.plantId!);
  if (!species) return null;

  const seedCount = Math.ceil(Math.random() * 3) + 1;
  for (let i = 0; i < seedCount; i++) {
    addSeedToBank(s, species.id, 'harvest');
  }

  const xpGained = 20 + RARITY_XP_BONUS[species.rarity];
  btAddXP(xpGained);
  s.totalHarvested += 1;

  // Reset plot
  plot.plantId = null;
  plot.growthStage = 'Seed';
  plot.growthProgress = 0;
  plot.overallProgress = 0;
  plot.health = 100;
  plot.waterLevel = 50;
  plot.fertilizerLevel = 0;
  plot.pestLevel = 0;
  plot.diseaseLevel = 0;
  plot.isProtected = false;

  btCheckAchievements();
  return { speciesId: species.id, seedCount, xpGained };
}

export function btGetHarvestYield(plotIndex: number): { minSeeds: number; maxSeeds: number; estimatedXP: number } | null {
  const plot = btGetPlotInfo(plotIndex);
  if (!plot || !plot.plantId) return null;
  const species = speciesById(plot.plantId);
  if (!species) return null;
  return { minSeeds: 1, maxSeeds: 4, estimatedXP: 20 + RARITY_XP_BONUS[species.rarity] };
}

// ---------------------------------------------------------------------------
// 7. Research
// ---------------------------------------------------------------------------

export function btGetResearchTopics(): ResearchTopic[] {
  return ensureInit().researchTopics;
}

export function btStartResearch(topicId: string): boolean {
  const s = ensureInit();
  const topic = s.researchTopics.find((t) => t.id === topicId);
  if (!topic || topic.completed || topic.isActive) return false;
  topic.isActive = true;
  topic.progress = 0;
  return true;
}

export function btCompleteResearch(topicId: string): boolean {
  const s = ensureInit();
  const topic = s.researchTopics.find((t) => t.id === topicId);
  if (!topic) return false;
  topic.completed = true;
  topic.isActive = false;
  topic.progress = 100;
  btAddXP(topic.xpReward);
  for (const unlock of topic.unlocks) {
    if (speciesById(unlock) && !s.seedBank.find((sd) => sd.speciesId === unlock)) {
      addSeedToBank(s, unlock, 'research');
    }
  }
  btCheckAchievements();
  return true;
}

export function btGetResearchProgress(topicId: string): number {
  const s = ensureInit();
  const topic = s.researchTopics.find((t) => t.id === topicId);
  return topic?.progress ?? 0;
}

// ---------------------------------------------------------------------------
// 8. Cross-Pollination
// ---------------------------------------------------------------------------

export function btCanCrossPollinate(plotA: number, plotB: number): { can: boolean; reason: string } {
  const s = ensureInit();
  const pA = btGetPlotInfo(plotA);
  const pB = btGetPlotInfo(plotB);
  if (!pA || !pA.plantId) return { can: false, reason: 'Plot A is empty.' };
  if (!pB || !pB.plantId) return { can: false, reason: 'Plot B is empty.' };
  if (plotA === plotB) return { can: false, reason: 'Cannot pollinate a plant with itself.' };
  if (pA.growthStage !== 'Flowering' && pA.growthStage !== 'Mature')
    return { can: false, reason: 'Plant A must be Mature or Flowering.' };
  if (pB.growthStage !== 'Flowering' && pB.growthStage !== 'Mature')
    return { can: false, reason: 'Plant B must be Mature or Flowering.' };

  const recipe = HYBRID_RECIPES.find(
    (r) =>
      (r.parentA === pA.plantId && r.parentB === pB.plantId) ||
      (r.parentA === pB.plantId && r.parentB === pA.plantId),
  );
  if (!recipe) return { can: false, reason: 'No known hybrid combination for these species.' };
  if (s.level < recipe.requiredLevel) return { can: false, reason: `Requires botanist level ${recipe.requiredLevel}.` };
  return { can: true, reason: 'Ready to cross-pollinate!' };
}

export function btCrossPollinate(plotA: number, plotB: number): { success: boolean; hybridSpeciesId: string; hybridName: string } | null {
  const check = btCanCrossPollinate(plotA, plotB);
  if (!check.can) return null;

  const s = ensureInit();
  const pA = s.plots[plotA];
  const pB = s.plots[plotB];

  const recipe = HYBRID_RECIPES.find(
    (r) =>
      (r.parentA === pA.plantId && r.parentB === pB.plantId) ||
      (r.parentA === pB.plantId && r.parentB === pA.plantId),
  );
  if (!recipe) return null;

  // 60% base success, boosted by health and level
  const healthBonus = ((pA.health + pB.health) / 2 - 50) / 100;
  const successChance = 0.6 + healthBonus * 0.3 + (s.level / 50) * 0.1;
  const success = Math.random() < successChance;

  if (success) {
    addSeedToBank(s, recipe.resultSpecies, 'harvest');
    s.totalHybrids += 1;
    if (!s.unlockedHybrids.includes(recipe.resultSpecies)) {
      s.unlockedHybrids.push(recipe.resultSpecies);
    }
    if (!s.discoveredSpecies.includes(recipe.resultSpecies)) {
      s.discoveredSpecies.push(recipe.resultSpecies);
    }
    btAddXP(50 + RARITY_XP_BONUS.Rare);
    btCheckAchievements();
    return { success: true, hybridSpeciesId: recipe.resultSpecies, hybridName: recipe.resultName };
  }

  return { success: false, hybridSpeciesId: recipe.resultSpecies, hybridName: recipe.resultName };
}

export function btGetHybridResult(parentA: string, parentB: string): HybridRecipe | null {
  return (
    HYBRID_RECIPES.find(
      (r) =>
        (r.parentA === parentA && r.parentB === parentB) ||
        (r.parentA === parentB && r.parentB === parentA),
    ) ?? null
  );
}

export function btGetAllHybrids(): HybridRecipe[] {
  return [...HYBRID_RECIPES];
}

// ---------------------------------------------------------------------------
// 9. Herbalism
// ---------------------------------------------------------------------------

export function btGetRecipes(): HerbRecipe[] {
  return [...HERB_RECIPES];
}

export function btGetAvailableRemedies(): string[] {
  return ensureInit().herbRemedies;
}

export function btCraftRemedy(recipeId: string): { success: boolean; remedy: string | null } {
  const s = ensureInit();
  const recipe = HERB_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { success: false, remedy: null };

  // Check if player has the required plants in the greenhouse (harvest-ready or flowering)
  const availableIds = s.plots
    .filter((p) => p.plantId && (p.growthStage === 'Flowering' || p.growthStage === 'Mature' || p.growthStage === 'Seed-bearing'))
    .map((p) => p.plantId!);

  const canCraft = recipe.ingredients.every((ing) => availableIds.includes(ing));
  if (!canCraft) return { success: false, remedy: null };

  // Consume the plants (remove one of each ingredient)
  for (const ing of recipe.ingredients) {
    const plot = s.plots.find((p) => p.plantId === ing && (p.growthStage === 'Flowering' || p.growthStage === 'Mature' || p.growthStage === 'Seed-bearing'));
    if (plot) {
      plot.plantId = null;
      plot.growthStage = 'Seed';
      plot.growthProgress = 0;
      plot.overallProgress = 0;
      plot.health = 100;
    }
  }

  recipe.crafted = true;
  s.herbRemedies.push(recipe.id);
  s.totalRemediesCrafted += 1;
  btAddXP(30);
  btCheckAchievements();
  return { success: true, remedy: recipe.name };
}

export function btUseRemedy(recipeId: string): boolean {
  const s = ensureInit();
  const idx = s.herbRemedies.indexOf(recipeId);
  if (idx === -1) return false;

  const recipe = HERB_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return false;

  // Apply effect
  switch (recipeId) {
    case 'hr_health_potion':
      s.plots.forEach((p) => { if (p.plantId) p.health = clamp(p.health + 50, 0, 100); });
      break;
    case 'hr_pest_repel':
      s.plots.forEach((p) => { if (p.plantId) p.pestLevel = 0; });
      s.activePestEvent = null;
      break;
    case 'hr_cure_all':
      s.plots.forEach((p) => { if (p.plantId) { p.pestLevel = 0; p.diseaseLevel = 0; p.health = 100; } });
      s.activePestEvent = null;
      break;
    case 'hr_mega_fert':
      s.plots.forEach((p) => { if (p.plantId) p.fertilizerLevel = clamp(p.fertilizerLevel + 40, 0, 100); });
      break;
    case 'hr_regen_soil':
      s.conditions.soilQuality = 100;
      break;
    case 'hr_water_purify':
      s.conditions.water = 100;
      break;
    case 'hr_rain_call':
      s.weather = 1; // Rainy
      s.lastWeatherChange = s.tick;
      break;
    case 'hr_sun_call':
      s.weather = 0; // Sunny
      s.lastWeatherChange = s.tick;
      break;
    case 'hr_legend_seed': {
      const legendaries = PLANT_SPECIES.filter((sp) => sp.rarity === 'Legendary');
      const pick = legendaries[Math.floor(Math.random() * legendaries.length)];
      addSeedToBank(s, pick.id, 'daily');
      break;
    }
    default:
      break;
  }

  s.herbRemedies.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// 10. Encyclopedia
// ---------------------------------------------------------------------------

export function btGetEncyclopedia(): EncyclopediaEntry[] {
  return ensureInit().encyclopedia;
}

export function btDiscoverSpecies(speciesId: string): boolean {
  const s = ensureInit();
  if (s.discoveredSpecies.includes(speciesId)) return false;
  s.discoveredSpecies.push(speciesId);
  const entry = s.encyclopedia.find((e) => e.speciesId === speciesId);
  if (entry) {
    entry.discovered = true;
    entry.discoveredAt = s.tick;
    entry.observationsCount += 1;
  }
  btCheckAchievements();
  return true;
}

export function btGetSpeciesInfo(speciesId: string): PlantSpecies | null {
  return speciesById(speciesId) ?? null;
}

export function btGetAllSpecies(): PlantSpecies[] {
  return [...PLANT_SPECIES];
}

// ---------------------------------------------------------------------------
// 11. Daily Task
// ---------------------------------------------------------------------------

export function btGetDailyTask(): DailyTask {
  const s = ensureInit();
  const dateSeed = simpleDateSeed(s.tick);
  if (s.dailyTask && s.dailyTask.dateSeed === dateSeed) return s.dailyTask;

  const actions: CareAction[] = ['Water', 'Fertilize', 'Prune', 'Pollinate', 'Protect'];
  const categories: PlantCategory[] = ['Flower', 'Tree', 'Herb', 'Fungus', 'Aquatic', 'Carnivorous'];

  const actionIdx = dateSeed % actions.length;
  const biomeIdx = (dateSeed * 3) % BIOMES.length;
  const catIdx = (dateSeed * 7) % categories.length;

  const task: DailyTask = {
    id: `daily_${dateSeed}`,
    description: `${actions[actionIdx]} a ${categories[catIdx]} in ${BIOMES[biomeIdx]}`,
    action: actions[actionIdx],
    targetBiome: BIOMES[biomeIdx],
    targetCategory: categories[catIdx],
    rewardXP: 50 + (dateSeed % 5) * 10,
    rewardSeeds: [],
    completed: false,
    dateSeed,
  };

  // Reward seed from target category
  const catSpecies = PLANT_SPECIES.filter((sp) => sp.category === task.targetCategory);
  if (catSpecies.length > 0) {
    task.rewardSeeds = [catSpecies[dateSeed % catSpecies.length].id];
  }

  s.dailyTask = task;
  return task;
}

export function btCompleteDailyTask(): { completed: boolean; xp: number; seedsAwarded: string[] } {
  const s = ensureInit();
  const task = btGetDailyTask();
  if (task.completed) return { completed: false, xp: 0, seedsAwarded: [] };

  // Verify task was actually performed (check recent care on matching plots)
  const matchingPlots = s.plots.filter((p) => {
    if (!p.plantId) return false;
    const sp = speciesById(p.plantId);
    if (!sp) return false;
    if (task.targetBiome && sp.biome !== task.targetBiome) return false;
    if (task.targetCategory && sp.category !== task.targetCategory) return false;
    return p.lastCaredAt > s.tick - 10;
  });

  if (matchingPlots.length === 0) return { completed: false, xp: 0, seedsAwarded: [] };

  task.completed = true;
  s.currentStreak += 1;
  s.longestStreak = Math.max(s.longestStreak, s.currentStreak);

  btAddXP(task.rewardXP);
  for (const seedId of task.rewardSeeds) {
    addSeedToBank(s, seedId, 'daily');
  }

  btCheckAchievements();
  return { completed: true, xp: task.rewardXP, seedsAwarded: task.rewardSeeds };
}

export function btCheckDailyReset(): boolean {
  const s = ensureInit();
  const dateSeed = simpleDateSeed(s.tick);
  if (s.dailyTask && s.dailyTask.dateSeed !== dateSeed) {
    if (!s.dailyTask.completed) {
      s.currentStreak = 0;
    }
    s.dailyTask = null;
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// 12. Level / XP
// ---------------------------------------------------------------------------

export function btGetLevel(): number {
  return ensureInit().level;
}

export function btAddXP(amount: number): void {
  const s = ensureInit();
  s.xp += amount;
  const needed = xpForLevel(s.level);
  while (s.xp >= needed && s.level < 50) {
    s.xp -= xpForLevel(s.level);
    s.level += 1;
    // Level-up bonus: expand seed bank every 5 levels
    if (s.level % 5 === 0) {
      s.seedBankCapacity = Math.min(s.seedBankCapacity + 10, 200);
    }
  }
  if (s.level >= 50) s.xp = Math.min(s.xp, xpForLevel(50));
}

export function btGetXPProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  const needed = xpForLevel(s.level);
  return { current: s.xp, needed, percentage: Math.floor((s.xp / needed) * 100) };
}

export function btGetNextLevel(): number {
  return Math.min(ensureInit().level + 1, 50);
}

// ---------------------------------------------------------------------------
// 13. Weather / Season
// ---------------------------------------------------------------------------

export function btGetWeather(): { name: Weather; index: number } {
  const s = ensureInit();
  return { name: WEATHERS[s.weather], index: s.weather };
}

export function btGetSeason(): { name: Season; index: number; growthMultiplier: number } {
  const s = ensureInit();
  const name = SEASONS[s.season];
  return { name, index: s.season, growthMultiplier: SEASON_GROWTH_MULTIPLIER[name] };
}

export function btAdvanceSeason(): Season {
  const s = ensureInit();
  s.season = (s.season + 1) % 4;
  s.lastSeasonAdvance = s.tick;
  btCheckAchievements();
  return SEASONS[s.season];
}

export function btSetWeather(weatherIdx: number): Weather {
  const s = ensureInit();
  s.weather = clamp(weatherIdx, 0, WEATHERS.length - 1);
  s.lastWeatherChange = s.tick;
  return WEATHERS[s.weather];
}

// ---------------------------------------------------------------------------
// 14. Achievements
// ---------------------------------------------------------------------------

export function btGetAchievements(): Achievement[] {
  const s = ensureInit();
  return ACHIEVEMENTS_DEF.map((a) => {
    const unlocked = s.achievements.includes(a.id);
    return { ...a, unlocked, unlockedAt: unlocked ? s.tick : 0 };
  });
}

export function btGetUnlockedAchievements(): Achievement[] {
  return btGetAchievements().filter((a) => a.unlocked);
}

export function btCheckAchievements(): string[] {
  const s = ensureInit();
  const newUnlocks: string[] = [];

  const plantedPlots = s.plots.filter((p) => p.plantId).length;
  const completedResearch = s.researchTopics.filter((t) => t.completed).length;
  const discoveredRare = s.discoveredSpecies.filter((id) => {
    const sp = speciesById(id);
    return sp && (sp.rarity === 'Rare' || sp.rarity === 'Endangered' || sp.rarity === 'Legendary');
  }).length;
  const craftedCount = s.herbRemedies.length;
  const coveredBiomes = new Set(
    s.plots.filter((p) => p.plantId).map((p) => speciesById(p.plantId!)?.biome).filter(Boolean),
  ).size;
  const seedCount = s.seedBank.reduce((a, b) => a + b.quantity, 0);
  const allPerfect = s.plots.filter((p) => p.plantId).every((p) => p.health >= 100);
  const legendaryHarvested = s.totalHarvested > 0; // Simplified; real check would track species

  const checks: Record<string, boolean> = {
    ach_green_thumb: s.totalHarvested >= 1,
    ach_master_botanist: s.level >= 50,
    ach_rare_collector: discoveredRare >= 10,
    ach_hybrid_creator: s.totalHybrids >= 1,
    ach_full_greenhouse: plantedPlots >= 25,
    ach_researcher: completedResearch >= 5,
    ach_encyclopedia: s.discoveredSpecies.length >= 50,
    ach_herb_master: craftedCount >= 15,
    ach_pest_free: s.activePestEvent === null && s.pestEventCooldown > 20,
    ach_legendary_grow: legendaryHarvested,
    ach_daily_streak: s.currentStreak >= 7,
    ach_all_biomes: coveredBiomes >= 6,
    ach_seed_hoarder: seedCount >= s.seedBankCapacity,
    ach_journal_100: s.journalEntries.length >= 100,
    ach_perfect_health: allPerfect && plantedPlots > 0,
  };

  for (const [id, met] of Object.entries(checks)) {
    if (met && !s.achievements.includes(id)) {
      s.achievements.push(id);
      newUnlocks.push(id);
    }
  }

  return newUnlocks;
}

// ---------------------------------------------------------------------------
// 15. Seed Bank
// ---------------------------------------------------------------------------

export function btGetSeedBank(): SeedData[] {
  return ensureInit().seedBank;
}

export function btGetSeedBankCapacity(): { current: number; max: number } {
  const s = ensureInit();
  const current = s.seedBank.reduce((a, b) => a + b.quantity, 0);
  return { current, max: s.seedBankCapacity };
}

export function btAddSeed(speciesId: string): boolean {
  const s = ensureInit();
  const current = s.seedBank.reduce((a, b) => a + b.quantity, 0);
  if (current >= s.seedBankCapacity) return false;
  addSeedToBank(s, speciesId, 'daily');
  return true;
}

// ---------------------------------------------------------------------------
// 16. Stats
// ---------------------------------------------------------------------------

export function btGetGardenStats(): GardenStats {
  const s = ensureInit();
  const planted = s.plots.filter((p) => p.plantId);
  const avgHealth = planted.length > 0 ? planted.reduce((a, p) => a + p.health, 0) / planted.length : 0;
  const matureCount = planted.filter((p) => p.growthStage === 'Mature' || p.growthStage === 'Flowering' || p.growthStage === 'Seed-bearing').length;

  // Determine rarest species
  let rarestSpecies = 'None';
  const rarityOrder: Rarity[] = ['Legendary', 'Endangered', 'Rare', 'Unusual', 'Common'];
  for (const r of rarityOrder) {
    const found = s.discoveredSpecies.find((id) => speciesById(id)?.rarity === r);
    if (found) {
      rarestSpecies = speciesById(found)?.name ?? 'None';
      break;
    }
  }

  // Favorite biome
  const biomeCounts: Record<string, number> = {};
  for (const p of planted) {
    const sp = speciesById(p.plantId!);
    if (sp) biomeCounts[sp.biome] = (biomeCounts[sp.biome] ?? 0) + 1;
  }
  let favoriteBiome: Biome = 'Tropical Rainforest';
  let maxCount = 0;
  for (const [biome, count] of Object.entries(biomeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteBiome = biome as Biome;
    }
  }

  return {
    totalHarvested: s.totalHarvested,
    totalPlanted: s.totalPlanted,
    totalHybrids: s.totalHybrids,
    totalResearchCompleted: s.researchTopics.filter((t) => t.completed).length,
    totalPestEvents: s.totalPestEvents,
    totalRemediesCrafted: s.totalRemediesCrafted,
    longestStreak: s.longestStreak,
    currentStreak: s.currentStreak,
    plantsAtMature: matureCount,
    averageHealth: Math.round(avgHealth),
    rarestSpecies,
    favoriteBiome,
  };
}

export function btGetTotalSpecies(): number {
  return ensureInit().discoveredSpecies.length;
}

export function btGetHarvestCount(): number {
  return ensureInit().totalHarvested;
}

export function btGetTick(): number {
  return ensureInit().tick;
}

// ---------------------------------------------------------------------------
// 17. Journal
// ---------------------------------------------------------------------------

export function btGetJournal(): JournalEntry[] {
  return ensureInit().journalEntries;
}

export function btGetJournalForPlant(plantId: string): JournalEntry[] {
  return ensureInit().journalEntries.filter((j) => j.plantId === plantId);
}

export function btAddJournalEntry(plantId: string, note: string): boolean {
  const s = ensureInit();
  if (!speciesById(plantId)) return false;
  s.journalEntries.push({ tick: s.tick, plantId, stage: 'Seed', note });
  const entry = s.encyclopedia.find((e) => e.speciesId === plantId);
  if (entry) entry.observationsCount += 1;
  btCheckAchievements();
  return true;
}

// ---------------------------------------------------------------------------
// 18. Pest Events
// ---------------------------------------------------------------------------

export function btGetActivePestEvent(): PestEvent | null {
  return ensureInit().activePestEvent;
}

export function btResolvePestEvent(): boolean {
  const s = ensureInit();
  if (!s.activePestEvent) return false;
  s.activePestEvent = null;
  s.plots.forEach((p) => {
    if (p.plantId) {
      p.pestLevel = clamp(p.pestLevel - 20, 0, 100);
    }
  });
  return true;
}

export function btGetPestEventCooldown(): number {
  return ensureInit().pestEventCooldown;
}

// ---------------------------------------------------------------------------
// 19. Grid Helpers
// ---------------------------------------------------------------------------

export function btGetGridSize(): number {
  return GRID_SIZE;
}

export function btGetTotalPlots(): number {
  return TOTAL_PLOTS;
}

export function btGetEmptyPlots(): number[] {
  const s = ensureInit();
  return s.plots.filter((p) => !p.plantId).map((p) => p.index);
}

// ---------------------------------------------------------------------------
// 20. Species Filter Helpers
// ---------------------------------------------------------------------------

export function btGetSpeciesByBiome(biome: Biome): PlantSpecies[] {
  return PLANT_SPECIES.filter((s) => s.biome === biome);
}

export function btGetSpeciesByCategory(category: PlantCategory): PlantSpecies[] {
  return PLANT_SPECIES.filter((s) => s.category === category);
}

export function btGetSpeciesByRarity(rarity: Rarity): PlantSpecies[] {
  return PLANT_SPECIES.filter((s) => s.rarity === rarity);
}

export function btGetSpeciesName(speciesId: string): string {
  return speciesById(speciesId)?.name ?? 'Unknown';
}

// ---------------------------------------------------------------------------
// 21. Streak & Daily Tracking
// ---------------------------------------------------------------------------

export function btGetCurrentStreak(): number {
  return ensureInit().currentStreak;
}

export function btGetLongestStreak(): number {
  return ensureInit().longestStreak;
}

export function btResetStreak(): void {
  const s = ensureInit();
  s.currentStreak = 0;
}

// ---------------------------------------------------------------------------
// 22. RNG / Utility
// ---------------------------------------------------------------------------

export function btSeededRandom(seed: number): number {
  return seededRandom(seed);
}

export function btHashString(input: string): number {
  return hashCode(input);
}

export function btClamp(value: number, min: number, max: number): number {
  return clamp(value, min, max);
}

// ---------------------------------------------------------------------------
// 23. Initial Seeds (starter pack)
// ---------------------------------------------------------------------------

export function btGrantStarterSeeds(): string[] {
  const s = ensureInit();
  const starters = ['fl_sunrose', 'hr_sage', 'fu_lumcap', 'aq_lilypad', 'cv_sundew'];
  for (const id of starters) {
    if (!s.seedBank.find((sd) => sd.speciesId === id)) {
      addSeedToBank(s, id, 'daily');
    }
  }
  return starters;
}

// ---------------------------------------------------------------------------
// 24. Hint System
// ---------------------------------------------------------------------------

export function btGetHint(): string {
  const s = ensureInit();
  const hints: string[] = [];

  const emptyPlots = s.plots.filter((p) => !p.plantId);
  if (emptyPlots.length > 0 && s.seedBank.length > 0) {
    hints.push('You have empty plots and seeds available. Try planting something!');
  }

  const lowWater = s.plots.filter((p) => p.plantId && p.waterLevel < 20);
  if (lowWater.length > 0) {
    hints.push(`${lowWater.length} plant(s) need watering urgently.`);
  }

  if (s.activePestEvent) {
    hints.push(`Pest alert: ${s.activePestEvent.name}! Protect your plants or use a remedy.`);
  }

  const readyToHarvest = s.plots.filter((p) => p.plantId && p.growthStage === 'Seed-bearing');
  if (readyToHarvest.length > 0) {
    hints.push(`${readyToHarvest.length} plant(s) are ready to harvest.`);
  }

  if (!s.dailyTask?.completed && s.dailyTask) {
    hints.push(`Don't forget your daily task: ${s.dailyTask.description}`);
  }

  const activeResearch = s.researchTopics.find((t) => t.isActive && !t.completed);
  if (activeResearch) {
    hints.push(`Research "${activeResearch.name}" is ${activeResearch.progress}% complete.`);
  }

  const flowering = s.plots.filter((p) => p.plantId && p.growthStage === 'Flowering');
  if (flowering.length >= 2) {
    hints.push('You have flowering plants — try cross-pollination for hybrids!');
  }

  if (hints.length === 0) {
    hints.push('Everything looks good! Keep tending your garden.');
  }

  return hints[Math.floor(seededRandom(s.tick + 42) * hints.length)];
}

// ---------------------------------------------------------------------------
// 25. Export all data constants for UI rendering
// ---------------------------------------------------------------------------

export function btGetBiomes(): Biome[] {
  return [...BIOMES];
}

export function btGetSeasons(): Season[] {
  return [...SEASONS];
}

export function btGetWeathers(): Weather[] {
  return [...WEATHERS];
}

export function btGetGrowthStages(): GrowthStage[] {
  return [...GROWTH_STAGES_ORDER];
}

export function btGetRarities(): Rarity[] {
  return ['Common', 'Unusual', 'Rare', 'Endangered', 'Legendary'];
}

export function btGetSeasonGrowthMultiplier(season: Season): number {
  return SEASON_GROWTH_MULTIPLIER[season];
}

export function btGetWeatherEffects(): Record<Weather, Partial<GrowthConditions>> {
  return { ...WEATHER_EFFECTS };
}

export function btGetSeasonBonuses(): Record<Season, Partial<GrowthConditions>> {
  return { ...SEASON_CONDITION_BONUS };
}

export function btGetPestEvents(): PestEvent[] {
  return [...PEST_EVENTS];
}

export function btGetRarityMultiplier(rarity: Rarity): number {
  return RARITY_MULTIPLIER[rarity];
}
