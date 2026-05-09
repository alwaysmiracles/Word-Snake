// ============================================================================
// Zen Garden Wire — Building & Meditation Game System
// SSR-safe: no localStorage, window, document, setInterval, setTimeout
// All exports use `zg` prefix. No functions starting with `use`.
// ============================================================================

// ─── Types (all inline) ────────────────────────────────────────────────────

type TileType = "soil" | "water" | "rock" | "sand" | "moss" | "stone_path";

type GardenTheme = "japanese" | "english" | "desert" | "tropical" | "winter" | "fantasy";

type Season = "spring" | "summer" | "fall" | "winter";

type WeatherType = "sunny" | "rainy" | "cloudy" | "windy" | "stormy";

type GrowthStage = "seed" | "sprout" | "young" | "mature" | "blooming";

type PlantCategory = "flower" | "tree" | "bush" | "bamboo" | "water_plant" | "moss_fern";

type MeditationType = "breathing" | "focus" | "gratitude" | "body_scan" | "walking" | "mantra" | "visualization" | "journaling";

type DecoCategory = "lantern" | "bridge" | "statue" | "water_feature" | "stone" | "fence";

interface PlantDef {
  id: string;
  name: string;
  category: PlantCategory;
  emoji: string;
  growthStages: GrowthStage[];
  growthTimeTicks: number;
  waterNeed: number;
  sunNeed: number;
  seasons: Season[];
  coinsYield: number;
  zenYield: number;
  isRare: boolean;
  breedable: boolean;
  description: string;
}

interface DecorationDef {
  id: string;
  name: string;
  category: DecoCategory;
  emoji: string;
  harmonyBonus: number;
  balanceBonus: number;
  aestheticsBonus: number;
  description: string;
  unlockLevel: number;
}

interface GardenTile {
  row: number;
  col: number;
  tileType: TileType;
  plantId: string | null;
  plantGrowth: GrowthStage;
  plantGrowthTicks: number;
  decorationId: string | null;
  watered: boolean;
  sunlit: boolean;
  fertilized: boolean;
}

interface PlantedPlant {
  tileIndex: number;
  plantDefId: string;
  stage: GrowthStage;
  ticksAlive: number;
  wateredTicks: number;
  sunlitTicks: number;
  fertilized: boolean;
}

interface MeditationSession {
  type: MeditationType;
  durationTicks: number;
  completedTicks: number;
  active: boolean;
  startTime: number;
  breathPhase: number;
  breathPattern: number[];
}

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: string;
  target: number;
  progress: number;
  unlocked: boolean;
  reward: { coins: number; zenPoints: number };
}

interface DailyTask {
  id: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: { coins: number; seeds: number };
}

interface BreedingRecipe {
  plantA: string;
  plantB: string;
  result: string;
  chance: number;
}

interface ZenGardenState {
  initialized: boolean;
  gardenGrid: GardenTile[];
  plantedPlants: PlantedPlant[];
  gardenTheme: GardenTheme;
  gardenLevel: number;
  gardenXp: number;
  harmonyScore: number;
  balanceScore: number;
  aestheticsScore: number;
  overallHarmony: number;
  resources: {
    seeds: number;
    water: number;
    fertilizer: number;
    coins: number;
    zenPoints: number;
  };
  season: Season;
  weather: WeatherType;
  weatherTicksRemaining: number;
  dayTick: number;
  serenityLevel: number;
  meditationTotalTicks: number;
  meditationSessionCount: number;
  currentMeditation: MeditationSession | null;
  achievements: AchievementDef[];
  dailyTask: DailyTask | null;
  dailyTaskDateSeed: number;
  unlockedPlantIds: string[];
  unlockedDecoIds: string[];
  breedingRecipes: BreedingRecipe[];
  zenLog: string[];
  lastQuoteIndex: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const GRID_ROWS = 6;
const GRID_COLS = 6;
const GRID_SIZE = GRID_ROWS * GRID_COLS;
const MAX_SERENITY = 20;
const MAX_GARDEN_LEVEL = 30;
const WEATHER_CHANGE_TICKS = 24;
const MEDITATION_BREATH_PATTERN = [4, 7, 8];

const TILE_TYPES: TileType[] = ["soil", "water", "rock", "sand", "moss", "stone_path"];

const SEASONS: Season[] = ["spring", "summer", "fall", "winter"];

const WEATHER_TYPES: WeatherType[] = ["sunny", "rainy", "cloudy", "windy", "stormy"];

const GARDEN_THEMES: GardenTheme[] = ["japanese", "english", "desert", "tropical", "winter", "fantasy"];

const THEME_INFO: Record<GardenTheme, { label: string; emoji: string; bonusDesc: string }> = {
  japanese: { label: "Japanese Zen", emoji: "⛩️", bonusDesc: "+10% Zen Points from meditation" },
  english: { label: "English Cottage", emoji: "🏡", bonusDesc: "+15% Flower growth speed" },
  desert: { label: "Desert Oasis", emoji: "🏜️", bonusDesc: "-20% Water consumption" },
  tropical: { label: "Tropical Paradise", emoji: "🌴", bonusDesc: "+10% Coins from plants" },
  winter: { label: "Winter Wonderland", emoji: "❄️", bonusDesc: "Snow plants bloom all year" },
  fantasy: { label: "Fantasy Garden", emoji: "🧚", bonusDesc: "Rare breeding +5% chance" },
};

const GROWTH_STAGE_ORDER: GrowthStage[] = ["seed", "sprout", "young", "mature", "blooming"];

const PLANT_DEFS: PlantDef[] = [
  // ── Flowers (8) ──
  { id: "cherry_blossom", name: "Cherry Blossom", category: "flower", emoji: "🌸", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 48, waterNeed: 3, sunNeed: 4, seasons: ["spring"], coinsYield: 12, zenYield: 8, isRare: false, breedable: true, description: "Delicate pink petals falling like snow" },
  { id: "lotus", name: "Lotus", category: "flower", emoji: "🪷", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 60, waterNeed: 5, sunNeed: 5, seasons: ["summer"], coinsYield: 18, zenYield: 12, isRare: false, breedable: true, description: "Sacred flower rising from murky waters" },
  { id: "sunflower", name: "Sunflower", category: "flower", emoji: "🌻", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 36, waterNeed: 3, sunNeed: 5, seasons: ["summer"], coinsYield: 14, zenYield: 5, isRare: false, breedable: true, description: "Always faces the sun with radiant joy" },
  { id: "rose", name: "Rose", category: "flower", emoji: "🌹", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 44, waterNeed: 4, sunNeed: 4, seasons: ["spring", "summer"], coinsYield: 16, zenYield: 7, isRare: false, breedable: true, description: "Classic beauty with thorns of wisdom" },
  { id: "orchid", name: "Orchid", category: "flower", emoji: "🪻", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 72, waterNeed: 4, sunNeed: 3, seasons: ["spring", "fall"], coinsYield: 22, zenYield: 10, isRare: true, breedable: true, description: "Exotic elegance requiring patient care" },
  { id: "lavender", name: "Lavender", category: "flower", emoji: "💜", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 40, waterNeed: 2, sunNeed: 4, seasons: ["summer"], coinsYield: 10, zenYield: 14, isRare: false, breedable: true, description: "Calming fragrance that soothes the soul" },
  { id: "chrysanthemum", name: "Chrysanthemum", category: "flower", emoji: "🌼", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 50, waterNeed: 3, sunNeed: 4, seasons: ["fall"], coinsYield: 15, zenYield: 9, isRare: false, breedable: true, description: "Autumn's golden crown of resilience" },
  { id: "moonflower", name: "Moonflower", category: "flower", emoji: "🌙", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 56, waterNeed: 3, sunNeed: 2, seasons: ["summer", "fall"], coinsYield: 20, zenYield: 11, isRare: true, breedable: true, description: "Blooms only under the silver moonlight" },
  // ── Trees (6) ──
  { id: "bonsai_pine", name: "Bonsai Pine", category: "tree", emoji: "🌲", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 120, waterNeed: 2, sunNeed: 3, seasons: ["spring", "summer", "fall", "winter"], coinsYield: 25, zenYield: 15, isRare: false, breedable: true, description: "Centuries of wisdom in miniature form" },
  { id: "cherry_tree", name: "Cherry Tree", category: "tree", emoji: "🌳", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 96, waterNeed: 3, sunNeed: 4, seasons: ["spring"], coinsYield: 20, zenYield: 12, isRare: false, breedable: true, description: "A cloud of pink that defines spring" },
  { id: "willow", name: "Weeping Willow", category: "tree", emoji: "🍃", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 84, waterNeed: 5, sunNeed: 3, seasons: ["spring", "summer"], coinsYield: 18, zenYield: 10, isRare: false, breedable: true, description: "Graceful branches dancing in the breeze" },
  { id: "maple", name: "Maple Tree", category: "tree", emoji: "🍁", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 90, waterNeed: 3, sunNeed: 4, seasons: ["fall"], coinsYield: 22, zenYield: 11, isRare: false, breedable: true, description: "Fiery leaves painting autumn landscapes" },
  { id: "ancient_oak", name: "Ancient Oak", category: "tree", emoji: "🪵", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 150, waterNeed: 3, sunNeed: 3, seasons: ["spring", "summer", "fall"], coinsYield: 30, zenYield: 18, isRare: true, breedable: false, description: "A guardian that has witnessed ages pass" },
  { id: "sakura", name: "Sakura Tree", category: "tree", emoji: "🌸", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 110, waterNeed: 4, sunNeed: 5, seasons: ["spring"], coinsYield: 28, zenYield: 20, isRare: true, breedable: true, description: "The ultimate symbol of ephemeral beauty" },
  // ── Bushes (6) ──
  { id: "boxwood", name: "Boxwood", category: "bush", emoji: "🌿", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 60, waterNeed: 2, sunNeed: 3, seasons: ["spring", "summer", "fall"], coinsYield: 10, zenYield: 6, isRare: false, breedable: true, description: "Neatly trimmed foundation of zen gardens" },
  { id: "azalea", name: "Azalea", category: "bush", emoji: "🌺", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 54, waterNeed: 3, sunNeed: 4, seasons: ["spring"], coinsYield: 14, zenYield: 8, isRare: false, breedable: true, description: "Bursts of vibrant color in spring" },
  { id: "hydrangea", name: "Hydrangea", category: "bush", emoji: "💮", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 66, waterNeed: 4, sunNeed: 3, seasons: ["summer"], coinsYield: 16, zenYield: 9, isRare: false, breedable: true, description: "Color-shifting spheres of soft beauty" },
  { id: "holly", name: "Holly Bush", category: "bush", emoji: "🎄", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 70, waterNeed: 2, sunNeed: 2, seasons: ["winter"], coinsYield: 12, zenYield: 7, isRare: false, breedable: true, description: "Evergreen guardian of winter gardens" },
  { id: "juniper", name: "Juniper", category: "bush", emoji: "🌲", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 64, waterNeed: 1, sunNeed: 4, seasons: ["spring", "summer", "fall", "winter"], coinsYield: 11, zenYield: 7, isRare: false, breedable: true, description: "Hardy and aromatic through all seasons" },
  { id: "spirit_bush", name: "Spirit Bush", category: "bush", emoji: "✨", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 100, waterNeed: 3, sunNeed: 3, seasons: ["spring", "fall"], coinsYield: 24, zenYield: 16, isRare: true, breedable: true, description: "Glows faintly at twilight" },
  // ── Bamboo (4) ──
  { id: "green_bamboo", name: "Green Bamboo", category: "bamboo", emoji: "🎋", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 40, waterNeed: 4, sunNeed: 3, seasons: ["spring", "summer"], coinsYield: 12, zenYield: 10, isRare: false, breedable: true, description: "Hollow yet strong, bending without breaking" },
  { id: "black_bamboo", name: "Black Bamboo", category: "bamboo", emoji: "🎍", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 50, waterNeed: 3, sunNeed: 2, seasons: ["spring", "fall"], coinsYield: 18, zenYield: 12, isRare: true, breedable: true, description: "Dark and mysterious stalks of resilience" },
  { id: "golden_bamboo", name: "Golden Bamboo", category: "bamboo", emoji: "🌟", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 55, waterNeed: 3, sunNeed: 4, seasons: ["summer", "fall"], coinsYield: 20, zenYield: 14, isRare: true, breedable: true, description: "Glistens like gold in the afternoon light" },
  { id: "dwarf_bamboo", name: "Dwarf Bamboo", category: "bamboo", emoji: "🌱", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 32, waterNeed: 3, sunNeed: 3, seasons: ["spring", "summer", "fall"], coinsYield: 8, zenYield: 6, isRare: false, breedable: true, description: "Perfect ground cover for zen spaces" },
  // ── Water Plants (6) ──
  { id: "water_lily", name: "Water Lily", category: "water_plant", emoji: "🪷", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 44, waterNeed: 5, sunNeed: 4, seasons: ["summer"], coinsYield: 14, zenYield: 9, isRare: false, breedable: true, description: "Floats peacefully on still waters" },
  { id: "cattail", name: "Cattail", category: "water_plant", emoji: "🌾", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 38, waterNeed: 5, sunNeed: 3, seasons: ["summer", "fall"], coinsYield: 8, zenYield: 5, isRare: false, breedable: true, description: "Tall marsh sentinel standing proud" },
  { id: "sacred_lotus", name: "Sacred Lotus", category: "water_plant", emoji: "🪷", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 80, waterNeed: 5, sunNeed: 5, seasons: ["summer"], coinsYield: 30, zenYield: 25, isRare: true, breedable: false, description: "Symbol of purity and enlightenment" },
  { id: "duckweed", name: "Duckweed", category: "water_plant", emoji: "🟢", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 20, waterNeed: 5, sunNeed: 2, seasons: ["spring", "summer"], coinsYield: 4, zenYield: 3, isRare: false, breedable: true, description: "Tiny green carpets on pond surfaces" },
  { id: "water_hyacinth", name: "Water Hyacinth", category: "water_plant", emoji: "💜", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 34, waterNeed: 5, sunNeed: 4, seasons: ["spring", "summer"], coinsYield: 10, zenYield: 7, isRare: false, breedable: true, description: "Purple blooms that float and spread" },
  { id: "phantom_lily", name: "Phantom Lily", category: "water_plant", emoji: "👻", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 90, waterNeed: 5, sunNeed: 1, seasons: ["fall", "winter"], coinsYield: 26, zenYield: 18, isRare: true, breedable: true, description: "Glows ethereally on moonlit winter ponds" },
  // ── Moss & Ferns (6) ──
  { id: "kyoto_moss", name: "Kyoto Moss", category: "moss_fern", emoji: "🟩", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 28, waterNeed: 4, sunNeed: 1, seasons: ["spring", "fall"], coinsYield: 6, zenYield: 10, isRare: false, breedable: true, description: "Velvet carpet of ancient temple gardens" },
  { id: "maidenhair_fern", name: "Maidenhair Fern", category: "moss_fern", emoji: "🌿", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 42, waterNeed: 4, sunNeed: 2, seasons: ["spring", "summer"], coinsYield: 10, zenYield: 8, isRare: false, breedable: true, description: "Delicate fronds of emerald lace" },
  { id: "sphagnum_moss", name: "Sphagnum Moss", category: "moss_fern", emoji: "🟢", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 30, waterNeed: 5, sunNeed: 1, seasons: ["spring", "summer", "fall"], coinsYield: 5, zenYield: 6, isRare: false, breedable: true, description: "Spongy moss that retains water and life" },
  { id: "foxtail_fern", name: "Foxtail Fern", category: "moss_fern", emoji: "🦊", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 46, waterNeed: 3, sunNeed: 3, seasons: ["spring", "summer", "fall"], coinsYield: 12, zenYield: 9, isRare: false, breedable: true, description: "Fluffy plumes like a fox's tail" },
  { id: "star_moss", name: "Star Moss", category: "moss_fern", emoji: "⭐", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 70, waterNeed: 3, sunNeed: 2, seasons: ["winter"], coinsYield: 16, zenYield: 12, isRare: true, breedable: true, description: "Forms tiny star patterns in frost" },
  { id: "ancient_fern", name: "Ancient Fern", category: "moss_fern", emoji: "🦕", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 100, waterNeed: 4, sunNeed: 2, seasons: ["spring", "fall"], coinsYield: 22, zenYield: 15, isRare: true, breedable: true, description: "A living fossil from primordial times" },
  // ── Cross-breed results (4 extra rare plants = 40 total) ──
  { id: "zen_blossom", name: "Zen Blossom", category: "flower", emoji: "☸️", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 100, waterNeed: 3, sunNeed: 3, seasons: ["spring", "summer", "fall", "winter"], coinsYield: 40, zenYield: 30, isRare: true, breedable: false, description: "The ultimate cross-breed flower of pure enlightenment" },
  { id: "dragon_willow", name: "Dragon Willow", category: "tree", emoji: "🐉", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 130, waterNeed: 4, sunNeed: 4, seasons: ["spring", "summer", "fall"], coinsYield: 35, zenYield: 22, isRare: true, breedable: false, description: "A mythical tree with shimmering dragon-scaled bark" },
  { id: "crystal_bamboo", name: "Crystal Bamboo", category: "bamboo", emoji: "💎", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 90, waterNeed: 2, sunNeed: 5, seasons: ["summer", "winter"], coinsYield: 32, zenYield: 20, isRare: true, breedable: false, description: "Translucent stalks that refract rainbow light" },
  { id: "phantom_lotus", name: "Phantom Lotus", category: "water_plant", emoji: "🔮", growthStages: ["seed", "sprout", "young", "mature", "blooming"], growthTimeTicks: 120, waterNeed: 5, sunNeed: 1, seasons: ["fall", "winter"], coinsYield: 38, zenYield: 28, isRare: true, breedable: false, description: "Translucent lotus that exists between worlds" },
];

const DECO_DEFS: DecorationDef[] = [
  // Lanterns (6)
  { id: "stone_lantern", name: "Stone Lantern", category: "lantern", emoji: "🏮", harmonyBonus: 3, balanceBonus: 2, aestheticsBonus: 4, description: "Traditional Japanese garden lantern", unlockLevel: 1 },
  { id: "paper_lantern", name: "Paper Lantern", category: "lantern", emoji: "🏮", harmonyBonus: 2, balanceBonus: 1, aestheticsBonus: 5, description: "Soft glowing paper lantern", unlockLevel: 3 },
  { id: "lotus_lantern", name: "Lotus Lantern", category: "lantern", emoji: "🪷", harmonyBonus: 5, balanceBonus: 3, aestheticsBonus: 4, description: "Lantern shaped like a lotus flower", unlockLevel: 8 },
  { id: "moon_lantern", name: "Moon Lantern", category: "lantern", emoji: "🌙", harmonyBonus: 4, balanceBonus: 4, aestheticsBonus: 5, description: "Projects moonlight patterns", unlockLevel: 14 },
  { id: "crystal_lantern", name: "Crystal Lantern", category: "lantern", emoji: "💎", harmonyBonus: 6, balanceBonus: 5, aestheticsBonus: 6, description: "Prismatic crystal that splits light", unlockLevel: 20 },
  { id: "spirit_lantern", name: "Spirit Lantern", category: "lantern", emoji: "👻", harmonyBonus: 7, balanceBonus: 6, aestheticsBonus: 7, description: "Flickers with otherworldly flame", unlockLevel: 26 },
  // Bridges (4)
  { id: "arch_bridge", name: "Arched Bridge", category: "bridge", emoji: "🌉", harmonyBonus: 5, balanceBonus: 6, aestheticsBonus: 5, description: "Classic arched bridge over water", unlockLevel: 2 },
  { id: "flat_bridge", name: "Flat Bridge", category: "bridge", emoji: "🪵", harmonyBonus: 3, balanceBonus: 4, aestheticsBonus: 3, description: "Simple wooden plank bridge", unlockLevel: 5 },
  { id: "stone_bridge", name: "Stone Bridge", category: "bridge", emoji: "🗿", harmonyBonus: 4, balanceBonus: 5, aestheticsBonus: 4, description: "Heavy stone bridge of permanence", unlockLevel: 12 },
  { id: "rainbow_bridge", name: "Rainbow Bridge", category: "bridge", emoji: "🌈", harmonyBonus: 8, balanceBonus: 7, aestheticsBonus: 8, description: "Mythical bridge to higher realms", unlockLevel: 24 },
  // Statues (6)
  { id: "buddha_statue", name: "Buddha Statue", category: "statue", emoji: "🙏", harmonyBonus: 8, balanceBonus: 7, aestheticsBonus: 6, description: "Serene meditation figure", unlockLevel: 4 },
  { id: "crane_statue", name: "Crane Statue", category: "statue", emoji: "🦢", harmonyBonus: 5, balanceBonus: 4, aestheticsBonus: 5, description: "Elegant crane symbolizing longevity", unlockLevel: 7 },
  { id: "dragon_statue", name: "Dragon Statue", category: "statue", emoji: "🐉", harmonyBonus: 6, balanceBonus: 5, aestheticsBonus: 7, description: "Guardian dragon of the garden", unlockLevel: 10 },
  { id: "koi_statue", name: "Koi Statue", category: "statue", emoji: "🐟", harmonyBonus: 4, balanceBonus: 6, aestheticsBonus: 5, description: "Koi fish symbolizing perseverance", unlockLevel: 15 },
  { id: "fox_statue", name: "Fox Statue", category: "statue", emoji: "🦊", harmonyBonus: 5, balanceBonus: 5, aestheticsBonus: 6, description: "Mysterious fox guardian spirit", unlockLevel: 19 },
  { id: "phoenix_statue", name: "Phoenix Statue", category: "statue", emoji: "🔥", harmonyBonus: 9, balanceBonus: 8, aestheticsBonus: 9, description: "Rebirth and transformation incarnate", unlockLevel: 28 },
  // Water Features (4)
  { id: "small_pond", name: "Small Pond", category: "water_feature", emoji: "💧", harmonyBonus: 4, balanceBonus: 5, aestheticsBonus: 4, description: "Tranquil still water reflection", unlockLevel: 1 },
  { id: "bamboo_fountain", name: "Bamboo Fountain", category: "water_feature", emoji: "⛲", harmonyBonus: 6, balanceBonus: 5, aestheticsBonus: 7, description: "Shishi-odoshi water feature", unlockLevel: 6 },
  { id: "waterfall", name: "Waterfall", category: "water_feature", emoji: "🌊", harmonyBonus: 7, balanceBonus: 6, aestheticsBonus: 8, description: "Cascading water of renewal", unlockLevel: 16 },
  { id: "infinity_pool", name: "Infinity Pool", category: "water_feature", emoji: "🌊", harmonyBonus: 9, balanceBonus: 8, aestheticsBonus: 9, description: "Vanishing edge of endless contemplation", unlockLevel: 25 },
  // Stones (6)
  { id: "zen_stone", name: "Zen Stone", category: "stone", emoji: "🪨", harmonyBonus: 3, balanceBonus: 4, aestheticsBonus: 3, description: "Perfectly balanced meditation stone", unlockLevel: 1 },
  { id: "stacked_stones", name: "Stacked Stones", category: "stone", emoji: "🏔️", harmonyBonus: 5, balanceBonus: 6, aestheticsBonus: 4, description: "Cairn of balanced stones", unlockLevel: 3 },
  { id: "raked_sand", name: "Raked Sand Circle", category: "stone", emoji: "⭕", harmonyBonus: 4, balanceBonus: 5, aestheticsBonus: 6, description: "Patterns of meditative raking", unlockLevel: 9 },
  { id: "crystal_formation", name: "Crystal Formation", category: "stone", emoji: "💠", harmonyBonus: 6, balanceBonus: 4, aestheticsBonus: 7, description: "Natural crystal cluster", unlockLevel: 13 },
  { id: "obsidian_monolith", name: "Obsidian Monolith", category: "stone", emoji: "🖤", harmonyBonus: 7, balanceBonus: 7, aestheticsBonus: 6, description: "Dark volcanic glass pillar", unlockLevel: 21 },
  { id: "moonstone", name: "Moonstone", category: "stone", emoji: "🌙", harmonyBonus: 8, balanceBonus: 6, aestheticsBonus: 8, description: "Glows with captured moonlight", unlockLevel: 27 },
  // Fences (4)
  { id: "bamboo_fence", name: "Bamboo Fence", category: "fence", emoji: "🎋", harmonyBonus: 2, balanceBonus: 3, aestheticsBonus: 3, description: "Simple bamboo boundary", unlockLevel: 2 },
  { id: "wattle_fence", name: "Wattle Fence", category: "fence", emoji: "🧱", harmonyBonus: 2, balanceBonus: 2, aestheticsBonus: 2, description: "Traditional woven fence", unlockLevel: 5 },
  { id: "torii_gate", name: "Torii Gate", category: "fence", emoji: "⛩️", harmonyBonus: 6, balanceBonus: 5, aestheticsBonus: 7, description: "Sacred entrance to zen space", unlockLevel: 11 },
  { id: "living_hedge", name: "Living Hedge", category: "fence", emoji: "🌳", harmonyBonus: 4, balanceBonus: 4, aestheticsBonus: 5, description: "A wall of living green", unlockLevel: 18 },
];

const ZEN_QUOTES: string[] = [
  "The garden is a mirror of the mind.",
  "In the silence between thoughts, the garden speaks.",
  "Water reflects the sky; the heart reflects the garden.",
  "A single blossom holds the beauty of a thousand gardens.",
  "Tend the garden within, and the garden without flourishes.",
  "The stone does not move, yet the garden changes around it.",
  "Patience is the gardener's greatest tool.",
  "Every weed pulled is a worry released.",
  "The path through the garden is the path to oneself.",
  "Breathe with the rhythm of the falling water.",
  "Moss grows where time moves slowly.",
  "The wind through bamboo teaches flexibility.",
  "A lantern's light is small but reaches far in darkness.",
  "Sand raked in circles mirrors the cycles of life.",
  "The lotus blooms from mud — transformation is always possible.",
  "Sit with the garden; it has much to teach.",
  "Autumn leaves fall not in sadness but in gratitude.",
  "Winter's stillness holds the promise of spring.",
  "The koi swims upstream — effort in the flow.",
  "A garden is never finished; it is always becoming.",
  "Roots grow deepest in rocky soil.",
  "The frog in the pond — plop! — and all is zen.",
  "Arrange not just stones, but your thoughts.",
  "Rain nourishes what sun alone cannot reach.",
  "Cherry blossoms remind us: beauty is fleeting, precious.",
  "The bridge connects two shores, like breath connects moments.",
  "In the smallest garden, the universe can be found.",
  "Let the garden grow at its own pace.",
  "A single candle in a lantern illuminates the whole path.",
  "The scent of lavender heals what words cannot.",
  "Dew on morning petals — each drop a tiny world.",
  "The crane stands still because it knows the fish will come.",
  "Ferns unfurl slowly, trusting the light.",
  "A garden without imperfection is not alive.",
  "Stone steps: each one a deliberate act of presence.",
  "The bamboo bends but never breaks — find your bamboo nature.",
  "Moonlight on raked sand: perfection in simplicity.",
  "When you stop trying to control the garden, it becomes beautiful.",
  "A meditation bench is just wood until someone sits mindfully.",
  "The seasons change; the gardener's awareness remains.",
  "Footprints in the garden fade — let your worries do the same.",
];

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first_seed", name: "First Seed", description: "Plant your first seed", emoji: "🌱", condition: "plants_planted", target: 1, progress: 0, unlocked: false, reward: { coins: 10, zenPoints: 5 } },
  { id: "green_thumb", name: "Green Thumb", description: "Plant 10 seeds", emoji: "🌿", condition: "plants_planted", target: 10, progress: 0, unlocked: false, reward: { coins: 50, zenPoints: 20 } },
  { id: "master_gardener", name: "Master Gardener", description: "Plant 50 seeds", emoji: "🌳", condition: "plants_planted", target: 50, progress: 0, unlocked: false, reward: { coins: 200, zenPoints: 100 } },
  { id: "first_bloom", name: "First Bloom", description: "Grow a plant to blooming stage", emoji: "🌸", condition: "plants_bloomed", target: 1, progress: 0, unlocked: false, reward: { coins: 15, zenPoints: 10 } },
  { id: "garden_of_bloom", name: "Garden of Bloom", description: "Have 5 plants blooming at once", emoji: "💐", condition: "simultaneous_blooms", target: 5, progress: 0, unlocked: false, reward: { coins: 100, zenPoints: 50 } },
  { id: "first_meditation", name: "First Breath", description: "Complete your first meditation", emoji: "🧘", condition: "meditations_completed", target: 1, progress: 0, unlocked: false, reward: { coins: 10, zenPoints: 15 } },
  { id: "zen_master", name: "Zen Master", description: "Complete 20 meditations", emoji: "☸️", condition: "meditations_completed", target: 20, progress: 0, unlocked: false, reward: { coins: 150, zenPoints: 80 } },
  { id: "zen_sage", name: "Zen Sage", description: "Complete 100 meditations", emoji: "🧘‍♂️", condition: "meditations_completed", target: 100, progress: 0, unlocked: false, reward: { coins: 500, zenPoints: 250 } },
  { id: "high_harmony", name: "Harmonious", description: "Reach a harmony score of 80+", emoji: "⚖️", condition: "harmony_score", target: 80, progress: 0, unlocked: false, reward: { coins: 80, zenPoints: 40 } },
  { id: "perfect_harmony", name: "Perfect Harmony", description: "Reach harmony score of 95+", emoji: "✨", condition: "harmony_score", target: 95, progress: 0, unlocked: false, reward: { coins: 300, zenPoints: 150 } },
  { id: "decorator", name: "Decorator", description: "Place 10 decorations", emoji: "🏮", condition: "decorations_placed", target: 10, progress: 0, unlocked: false, reward: { coins: 60, zenPoints: 30 } },
  { id: "rare_collector", name: "Rare Collector", description: "Grow 5 rare plants", emoji: "💎", condition: "rare_plants_grown", target: 5, progress: 0, unlocked: false, reward: { coins: 100, zenPoints: 60 } },
  { id: "breeder", name: "Plant Breeder", description: "Successfully cross-breed 3 plants", emoji: "🧬", condition: "cross_breeds", target: 3, progress: 0, unlocked: false, reward: { coins: 120, zenPoints: 70 } },
  { id: "all_seasons", name: "All Seasons", description: "Grow plants in all 4 seasons", emoji: "🍂", condition: "seasons_planted", target: 4, progress: 0, unlocked: false, reward: { coins: 80, zenPoints: 40 } },
  { id: "serenity_5", name: "Inner Peace", description: "Reach serenity level 5", emoji: "☮️", condition: "serenity_level", target: 5, progress: 0, unlocked: false, reward: { coins: 50, zenPoints: 30 } },
  { id: "serenity_15", name: "Transcendent", description: "Reach serenity level 15", emoji: "🌟", condition: "serenity_level", target: 15, progress: 0, unlocked: false, reward: { coins: 250, zenPoints: 120 } },
  { id: "serenity_20", name: "Enlightened One", description: "Reach max serenity level 20", emoji: " Enlightenment", condition: "serenity_level", target: 20, progress: 0, unlocked: false, reward: { coins: 500, zenPoints: 300 } },
  { id: "level_10", name: "Gardener Level 10", description: "Reach garden level 10", emoji: "🏅", condition: "garden_level", target: 10, progress: 0, unlocked: false, reward: { coins: 100, zenPoints: 50 } },
  { id: "level_20", name: "Gardener Level 20", description: "Reach garden level 20", emoji: "🏆", condition: "garden_level", target: 20, progress: 0, unlocked: false, reward: { coins: 300, zenPoints: 150 } },
  { id: "level_30", name: "Garden Grandmaster", description: "Reach max garden level 30", emoji: "👑", condition: "garden_level", target: 30, progress: 0, unlocked: false, reward: { coins: 1000, zenPoints: 500 } },
];

const BREEDING_RECIPES: BreedingRecipe[] = [
  { plantA: "cherry_blossom", plantB: "lotus", result: "zen_blossom", chance: 0.08 },
  { plantA: "willow", plantB: "dragon_statue", result: "dragon_willow", chance: 0.06 },
  { plantA: "black_bamboo", plantB: "golden_bamboo", result: "crystal_bamboo", chance: 0.07 },
  { plantA: "phantom_lily", plantB: "sacred_lotus", result: "phantom_lotus", chance: 0.05 },
  { plantA: "orchid", plantB: "moonflower", result: "zen_blossom", chance: 0.04 },
  { plantA: "sakura", plantB: "ancient_oak", result: "dragon_willow", chance: 0.05 },
];

const MEDITATION_TYPES: { type: MeditationType; name: string; emoji: string; description: string; baseZenYield: number }[] = [
  { type: "breathing", name: "4-7-8 Breathing", emoji: "🌬️", description: "Inhale 4, hold 7, exhale 8 — deep calming breathwork", baseZenYield: 5 },
  { type: "focus", name: "Focused Attention", emoji: "🎯", description: "Concentrate on a single point with unwavering awareness", baseZenYield: 6 },
  { type: "gratitude", name: "Gratitude Practice", emoji: "🙏", description: "Cultivate thankfulness for the present moment", baseZenYield: 7 },
  { type: "body_scan", name: "Body Scan", emoji: "🧍", description: "Systematically relax each part of your body", baseZenYield: 6 },
  { type: "walking", name: "Walking Meditation", emoji: "🚶", description: "Mindful steps connecting body and earth", baseZenYield: 5 },
  { type: "mantra", name: "Mantra Chanting", emoji: "📿", description: "Repetitive sacred sounds to still the mind", baseZenYield: 8 },
  { type: "visualization", name: "Visualization", emoji: "🌌", description: "Create inner landscapes of peace and beauty", baseZenYield: 7 },
  { type: "journaling", name: "Zen Journaling", emoji: "📓", description: "Write reflections on your inner garden", baseZenYield: 6 },
];

const AMBIENT_DESCRIPTIONS: Record<MeditationType, string[]> = {
  breathing: ["Breathe in the scent of cherry blossoms...", "Feel the cool stone beneath you...", "Air flows through bamboo like whispered secrets...", "Your breath becomes the wind through the garden..."],
  focus: ["A single water droplet falls into the pond...", "The candle flame steadies, unwavering...", "Gaze upon the raked sand patterns...", "A crane stands motionless in the mist..."],
  gratitude: ["The sun warms the soil that feeds the roots...", "Rain came at just the right moment...", "A butterfly pauses on an open palm...", "Every seed holds infinite possibility..."],
  body_scan: ["Relax your shoulders like willow branches...", "Your spine straightens like bamboo...", "Tension flows out like water over stones...", "Your feet root into the earth like ancient trees..."],
  walking: ["Each step on the stone path is a step inward...", "Moss cushions your feet with softness...", "The bridge carries you from one state of mind to another...", "Walk so slowly that you become indistinguishable from the garden..."],
  mantra: ["Om... the sound of the garden bell...", "So hum... I am that, the garden is me...", "Peace... flowing like water...", "The mantra echoes through the bamboo grove..."],
  visualization: ["See your garden in perfect bloom...", "A golden light filters through maple leaves...", "The koi pond becomes a mirror of stars...", "Your inner garden merges with the outer one..."],
  journaling: ["Write as the ink flows like a stream...", "Words arrange themselves like raked sand...", "Capture the fleeting beauty of this moment...", "Your journal pages become the garden's history..."],
};

// ─── State ─────────────────────────────────────────────────────────────────

let state: ZenGardenState | null = null;

function ensureInit(): ZenGardenState {
  if (state !== null && state.initialized) return state;

  const grid: GardenTile[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      grid.push({
        row: r,
        col: c,
        tileType: "soil",
        plantId: null,
        plantGrowth: "seed",
        plantGrowthTicks: 0,
        decorationId: null,
        watered: false,
        sunlit: false,
        fertilized: false,
      });
    }
  }

  state = {
    initialized: true,
    gardenGrid: grid,
    plantedPlants: [],
    gardenTheme: "japanese",
    gardenLevel: 1,
    gardenXp: 0,
    harmonyScore: 0,
    balanceScore: 0,
    aestheticsScore: 0,
    overallHarmony: 0,
    resources: {
      seeds: 15,
      water: 20,
      fertilizer: 5,
      coins: 50,
      zenPoints: 0,
    },
    season: "spring",
    weather: "sunny",
    weatherTicksRemaining: WEATHER_CHANGE_TICKS,
    dayTick: 0,
    serenityLevel: 1,
    meditationTotalTicks: 0,
    meditationSessionCount: 0,
    currentMeditation: null,
    achievements: ACHIEVEMENT_DEFS.map(a => ({ ...a })),
    dailyTask: null,
    dailyTaskDateSeed: 0,
    unlockedPlantIds: PLANT_DEFS.filter(p => !p.isRare && p.id !== "zen_blossom" && p.id !== "dragon_willow" && p.id !== "crystal_bamboo" && p.id !== "phantom_lotus").map(p => p.id),
    unlockedDecoIds: DECO_DEFS.filter(d => d.unlockLevel <= 1).map(d => d.id),
    breedingRecipes: [...BREEDING_RECIPES],
    zenLog: [],
    lastQuoteIndex: 0,
  };

  return state;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function tileIndex(row: number, col: number): number {
  return row * GRID_COLS + col;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getPlantDef(id: string): PlantDef | undefined {
  return PLANT_DEFS.find(p => p.id === id);
}

function getDecoDef(id: string): DecorationDef | undefined {
  return DECO_DEFS.find(d => d.id === id);
}

function advancementChance(weather: WeatherType, sunNeed: number): number {
  const sunMap: Record<WeatherType, number> = { sunny: 1.0, cloudy: 0.7, rainy: 0.4, windy: 0.6, stormy: 0.2 };
  return clamp(sunMap[weather], 0.1, 1.0);
}

function waterBonusMultiplier(weather: WeatherType): number {
  if (weather === "rainy") return 2.0;
  if (weather === "stormy") return 1.5;
  return 1.0;
}

function isPlantInSeason(plant: PlantDef, season: Season): boolean {
  if (plant.id === "zen_blossom") return true;
  if (season === "winter" && state?.gardenTheme === "winter") return true;
  return plant.seasons.includes(season);
}

function simpleHashSeed(input: number): number {
  let h = input | 0;
  h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
  h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
  h = (h >> 16) ^ h;
  return Math.abs(h);
}

function nextGrowthStage(current: GrowthStage): GrowthStage | null {
  const idx = GROWTH_STAGE_ORDER.indexOf(current);
  if (idx < 0 || idx >= GROWTH_STAGE_ORDER.length - 1) return null;
  return GROWTH_STAGE_ORDER[idx + 1];
}

function xpForLevel(level: number): number {
  return Math.floor(20 * Math.pow(level, 1.5));
}

function seasonIndex(season: Season): number {
  return SEASONS.indexOf(season);
}

// ─── Garden Grid Functions ─────────────────────────────────────────────────

export function zgGetState(): ZenGardenState {
  return ensureInit();
}

export function zgSetTileType(row: number, col: number, tileType: TileType): boolean {
  const s = ensureInit();
  const idx = tileIndex(row, col);
  if (idx < 0 || idx >= GRID_SIZE) return false;
  if (!TILE_TYPES.includes(tileType)) return false;
  s.gardenGrid[idx].tileType = tileType;
  return true;
}

export function zgGetTileAt(row: number, col: number): GardenTile | null {
  const s = ensureInit();
  const idx = tileIndex(row, col);
  if (idx < 0 || idx >= GRID_SIZE) return null;
  return s.gardenGrid[idx];
}

export function zgGetGridSize(): { rows: number; cols: number; total: number } {
  return { rows: GRID_ROWS, cols: GRID_COLS, total: GRID_SIZE };
}

export function zgSetTheme(theme: GardenTheme): boolean {
  const s = ensureInit();
  if (!GARDEN_THEMES.includes(theme)) return false;
  s.gardenTheme = theme;
  return true;
}

export function zgGetTheme(): GardenTheme {
  return ensureInit().gardenTheme;
}

export function zgGetThemeInfo(theme: GardenTheme): { label: string; emoji: string; bonusDesc: string } | null {
  return THEME_INFO[theme] ?? null;
}

export function zgGetAllThemes(): { id: GardenTheme; label: string; emoji: string; bonusDesc: string }[] {
  return GARDEN_THEMES.map(t => ({ id: t, ...THEME_INFO[t] }));
}

// ─── Planting System ───────────────────────────────────────────────────────

export function zgPlantSeed(row: number, col: number, plantId: string): boolean {
  const s = ensureInit();
  const idx = tileIndex(row, col);
  if (idx < 0 || idx >= GRID_SIZE) return false;
  const tile = s.gardenGrid[idx];
  if (tile.plantId !== null) return false;
  if (tile.tileType === "rock" || tile.tileType === "water") return false;
  const plantDef = getPlantDef(plantId);
  if (!plantDef) return false;
  if (!s.unlockedPlantIds.includes(plantId)) return false;
  if (s.resources.seeds < 1) return false;

  s.resources.seeds -= 1;
  tile.plantId = plantId;
  tile.plantGrowth = "seed";
  tile.plantGrowthTicks = 0;
  tile.watered = false;
  tile.sunlit = false;
  tile.fertilized = false;

  s.plantedPlants.push({
    tileIndex: idx,
    plantDefId: plantId,
    stage: "seed",
    ticksAlive: 0,
    wateredTicks: 0,
    sunlitTicks: 0,
    fertilized: false,
  });

  s.zenLog.push(`Planted ${plantDef.name} at (${row}, ${col})`);
  zgCheckAchievement("plants_planted", s.plantedPlants.length);
  return true;
}

export function zgRemovePlant(row: number, col: number): boolean {
  const s = ensureInit();
  const idx = tileIndex(row, col);
  if (idx < 0 || idx >= GRID_SIZE) return false;
  const tile = s.gardenGrid[idx];
  if (tile.plantId === null) return false;
  const plantDef = getPlantDef(tile.plantId);
  if (plantDef && tile.plantGrowth === "blooming") {
    const themeBonus = s.gardenTheme === "tropical" ? 1.1 : 1.0;
    s.resources.coins += Math.floor(plantDef.coinsYield * themeBonus);
    s.resources.zenPoints += plantDef.zenYield;
    s.gardenXp += plantDef.zenYield;
  }
  tile.plantId = null;
  tile.plantGrowth = "seed";
  tile.plantGrowthTicks = 0;
  s.plantedPlants = s.plantedPlants.filter(p => p.tileIndex !== idx);
  return true;
}

export function zgWaterPlant(row: number, col: number): boolean {
  const s = ensureInit();
  const idx = tileIndex(row, col);
  if (idx < 0 || idx >= GRID_SIZE) return false;
  const tile = s.gardenGrid[idx];
  if (tile.plantId === null) return false;
  if (s.resources.water < 1) return false;
  s.resources.water -= 1;
  tile.watered = true;
  const planted = s.plantedPlants.find(p => p.tileIndex === idx);
  if (planted) planted.wateredTicks += 1;
  return true;
}

export function zgFertilizePlant(row: number, col: number): boolean {
  const s = ensureInit();
  const idx = tileIndex(row, col);
  if (idx < 0 || idx >= GRID_SIZE) return false;
  const tile = s.gardenGrid[idx];
  if (tile.plantId === null) return false;
  if (s.resources.fertilizer < 1) return false;
  s.resources.fertilizer -= 1;
  tile.fertilized = true;
  const planted = s.plantedPlants.find(p => p.tileIndex === idx);
  if (planted) planted.fertilized = true;
  return true;
}

export function zgWaterAll(): number {
  const s = ensureInit();
  let count = 0;
  for (let i = 0; i < GRID_SIZE; i++) {
    const tile = s.gardenGrid[i];
    if (tile.plantId !== null && s.resources.water >= 1) {
      s.resources.water -= 1;
      tile.watered = true;
      const planted = s.plantedPlants.find(p => p.tileIndex === i);
      if (planted) planted.wateredTicks += 1;
      count++;
    }
  }
  return count;
}

export function zgSunlightAll(): number {
  const s = ensureInit();
  let count = 0;
  for (let i = 0; i < GRID_SIZE; i++) {
    const tile = s.gardenGrid[i];
    if (tile.plantId !== null) {
      tile.sunlit = true;
      const planted = s.plantedPlants.find(p => p.tileIndex === i);
      if (planted) planted.sunlitTicks += 1;
      count++;
    }
  }
  return count;
}

export function zgAdvanceGrowth(): number {
  const s = ensureInit();
  let bloomed = 0;

  for (const planted of s.plantedPlants) {
    const plantDef = getPlantDef(planted.plantDefId);
    if (!plantDef) continue;
    const tile = s.gardenGrid[planted.tileIndex];
    if (!tile || !isPlantInSeason(plantDef, s.season)) continue;

    let speed = 1.0;
    if (tile.watered) speed += 0.5;
    if (tile.sunlit) speed += 0.3 * advancementChance(s.weather, plantDef.sunNeed);
    if (planted.fertilized) speed += 0.8;
    if (s.weather === "rainy") speed += 0.2 * waterBonusMultiplier(s.weather) * 0.15;
    speed *= advancementChance(s.weather, plantDef.sunNeed);

    const seasonSpeed: Record<Season, number> = { spring: 1.0, summer: 1.2, fall: 0.8, winter: 0.5 };
    speed *= seasonSpeed[s.season];

    planted.ticksAlive += speed;
    tile.plantGrowthTicks = Math.floor(planted.ticksAlive);

    if (planted.stage !== "blooming") {
      const nextStage = nextGrowthStage(planted.stage);
      if (nextStage && planted.ticksAlive >= plantDef.growthTimeTicks * (GROWTH_STAGE_ORDER.indexOf(nextStage) / (GROWTH_STAGE_ORDER.length - 1))) {
        planted.stage = nextStage;
        tile.plantGrowth = nextStage;
        if (nextStage === "blooming") {
          bloomed++;
          s.zenLog.push(`${plantDef.name} at (${tile.row}, ${tile.col}) is blooming!`);
          if (plantDef.isRare) zgCheckAchievement("rare_plants_grown", undefined);
        }
      }
    }

    tile.watered = false;
    tile.sunlit = false;
  }

  if (bloomed > 0) {
    zgCheckAchievement("plants_bloomed", undefined);
    const currentBlooms = s.plantedPlants.filter(p => p.stage === "blooming").length;
    zgCheckAchievement("simultaneous_blooms", currentBlooms);
  }

  return bloomed;
}

export function zgHarvestAll(): { coins: number; zenPoints: number; count: number } {
  const s = ensureInit();
  let totalCoins = 0;
  let totalZen = 0;
  let count = 0;

  for (let i = 0; i < GRID_SIZE; i++) {
    const tile = s.gardenGrid[i];
    if (tile.plantId && tile.plantGrowth === "blooming") {
      const plantDef = getPlantDef(tile.plantId);
      if (plantDef) {
        const themeBonus = s.gardenTheme === "tropical" ? 1.1 : 1.0;
        totalCoins += Math.floor(plantDef.coinsYield * themeBonus);
        totalZen += plantDef.zenYield;
        count++;
      }
      tile.plantId = null;
      tile.plantGrowth = "seed";
      tile.plantGrowthTicks = 0;
    }
  }

  s.plantedPlants = s.plantedPlants.filter(p => s.gardenGrid[p.tileIndex].plantId !== null);
  s.resources.coins += totalCoins;
  s.resources.zenPoints += totalZen;
  s.gardenXp += totalZen;
  return { coins: totalCoins, zenPoints: totalZen, count };
}

export function zgGetPlantDef(plantId: string): PlantDef | null {
  return getPlantDef(plantId) ?? null;
}

export function zgGetAllPlants(): PlantDef[] {
  return [...PLANT_DEFS];
}

export function zgGetPlantsByCategory(category: PlantCategory): PlantDef[] {
  return PLANT_DEFS.filter(p => p.category === category);
}

export function zgGetPlantsBySeason(season: Season): PlantDef[] {
  return PLANT_DEFS.filter(p => p.seasons.includes(season));
}

export function zgGetAvailablePlants(): PlantDef[] {
  const s = ensureInit();
  return PLANT_DEFS.filter(p => s.unlockedPlantIds.includes(p.id));
}

export function zgGetLockedPlants(): PlantDef[] {
  const s = ensureInit();
  return PLANT_DEFS.filter(p => !s.unlockedPlantIds.includes(p.id));
}

export function zgGetPlantedPlants(): { row: number; col: number; plant: PlantDef; stage: GrowthStage; ticks: number }[] {
  const s = ensureInit();
  return s.plantedPlants.map(p => {
    const tile = s.gardenGrid[p.tileIndex];
    const def = getPlantDef(p.plantDefId)!;
    return { row: tile.row, col: tile.col, plant: def, stage: p.stage, ticks: Math.floor(p.ticksAlive) };
  });
}

// ─── Cross-Breeding ────────────────────────────────────────────────────────

export function zgGetBreedingRecipes(): BreedingRecipe[] {
  return [...ensureInit().breedingRecipes];
}

export function zgAttemptBreed(plantAId: string, plantBId: string): { success: boolean; resultId: string | null; message: string } {
  const s = ensureInit();
  if (plantAId === plantBId) return { success: false, resultId: null, message: "Cannot breed a plant with itself" };

  const recipe = s.breedingRecipes.find(r =>
    (r.plantA === plantAId && r.plantB === plantBId) ||
    (r.plantA === plantBId && r.plantB === plantAId)
  );

  if (!recipe) return { success: false, resultId: null, message: "No breeding recipe found for this combination" };

  const defA = getPlantDef(plantAId);
  const defB = getPlantDef(plantBId);
  if (!defA?.breedable || !defB?.breedable) return { success: false, resultId: null, message: "One or both plants are not breedable" };

  let chance = recipe.chance;
  if (s.gardenTheme === "fantasy") chance += 0.05;
  if (s.weather === "stormy") chance += 0.02;

  const roll = Math.random();
  if (roll > chance) {
    return { success: false, resultId: null, message: "Breeding attempt failed. Try again!" };
  }

  if (!s.unlockedPlantIds.includes(recipe.result)) {
    s.unlockedPlantIds.push(recipe.result);
  }

  const resultDef = getPlantDef(recipe.result);
  s.zenLog.push(`Bred ${defA.name} + ${defB.name} → ${resultDef?.name ?? recipe.result}!`);
  zgCheckAchievement("cross_breeds", undefined);

  return { success: true, resultId: recipe.result, message: `Successfully bred ${resultDef?.name ?? recipe.result}!` };
}

// ─── Decorations ───────────────────────────────────────────────────────────

export function zgPlaceDecoration(row: number, col: number, decoId: string): boolean {
  const s = ensureInit();
  const idx = tileIndex(row, col);
  if (idx < 0 || idx >= GRID_SIZE) return false;
  const tile = s.gardenGrid[idx];
  if (tile.decorationId !== null) return false;
  const decoDef = getDecoDef(decoId);
  if (!decoDef) return false;
  if (!s.unlockedDecoIds.includes(decoId)) return false;
  tile.decorationId = decoId;
  s.zenLog.push(`Placed ${decoDef.name} at (${row}, ${col})`);
  zgRecalcHarmony();
  const totalDecos = s.gardenGrid.filter(t => t.decorationId !== null).length;
  zgCheckAchievement("decorations_placed", totalDecos);
  return true;
}

export function zgRemoveDecoration(row: number, col: number): boolean {
  const s = ensureInit();
  const idx = tileIndex(row, col);
  if (idx < 0 || idx >= GRID_SIZE) return false;
  if (s.gardenGrid[idx].decorationId === null) return false;
  s.gardenGrid[idx].decorationId = null;
  zgRecalcHarmony();
  return true;
}

export function zgGetAllDecorations(): DecorationDef[] {
  return [...DECO_DEFS];
}

export function zgGetDecorationsByCategory(category: DecoCategory): DecorationDef[] {
  return DECO_DEFS.filter(d => d.category === category);
}

export function zgGetAvailableDecorations(): DecorationDef[] {
  const s = ensureInit();
  return DECO_DEFS.filter(d => s.unlockedDecoIds.includes(d.id));
}

export function zgGetDecoDef(decoId: string): DecorationDef | null {
  return getDecoDef(decoId) ?? null;
}

// ─── Harmony & Scoring ─────────────────────────────────────────────────────

export function zgRecalcHarmony(): { harmony: number; balance: number; aesthetics: number; overall: number } {
  const s = ensureInit();
  let harmony = 0;
  let balance = 0;
  let aesthetics = 0;

  for (const tile of s.gardenGrid) {
    if (tile.decorationId) {
      const def = getDecoDef(tile.decorationId);
      if (def) {
        harmony += def.harmonyBonus;
        balance += def.balanceBonus;
        aesthetics += def.aestheticsBonus;
      }
    }
    if (tile.plantId) {
      const def = getPlantDef(tile.plantId);
      if (def) {
        harmony += 1;
        balance += 1;
        aesthetics += def.isRare ? 3 : 1;
        if (tile.plantGrowth === "blooming") {
          harmony += 2;
          aesthetics += 2;
        }
      }
    }
    if (tile.tileType === "water") harmony += 2;
    if (tile.tileType === "stone_path") balance += 2;
    if (tile.tileType === "moss") aesthetics += 1;
  }

  const adjWaterTiles = countAdjacentMatches(s.gardenGrid, "water", "water");
  const adjPathTiles = countAdjacentMatches(s.gardenGrid, "stone_path", "stone_path");
  balance += Math.floor(adjWaterTiles * 0.5) + Math.floor(adjPathTiles * 0.5);

  const plantedCount = s.gardenGrid.filter(t => t.plantId !== null).length;
  const decoCount = s.gardenGrid.filter(t => t.decorationId !== null).length;
  const emptyCount = s.gardenGrid.filter(t => t.plantId === null && t.decorationId === null && t.tileType === "soil").length;
  const emptyRatio = emptyCount / GRID_SIZE;
  if (emptyRatio > 0.3) harmony -= Math.floor(emptyRatio * 5);
  if (plantedCount > 0 && decoCount > 0) harmony += 5;
  if (plantedCount >= 10) aesthetics += 5;

  harmony = clamp(Math.floor(harmony), 0, 100);
  balance = clamp(Math.floor(balance), 0, 100);
  aesthetics = clamp(Math.floor(aesthetics), 0, 100);
  const overall = clamp(Math.floor((harmony + balance + aesthetics) / 3), 0, 100);

  s.harmonyScore = harmony;
  s.balanceScore = balance;
  s.aestheticsScore = aesthetics;
  s.overallHarmony = overall;

  zgCheckAchievement("harmony_score", overall);
  return { harmony, balance, aesthetics, overall };
}

function countAdjacentMatches(grid: GardenTile[], targetType: TileType, matchType: TileType): number {
  let count = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].tileType !== targetType) continue;
    const r = grid[i].row;
    const c = grid[i].col;
    const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
    for (const [nr, nc] of neighbors) {
      if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) continue;
      if (grid[tileIndex(nr, nc)].tileType === matchType) count++;
    }
  }
  return count;
}

// ─── Meditation System ─────────────────────────────────────────────────────

export function zgGetMeditationTypes(): { type: MeditationType; name: string; emoji: string; description: string; baseZenYield: number }[] {
  return [...MEDITATION_TYPES];
}

export function zgStartMeditation(type: MeditationType, durationTicks: number): boolean {
  const s = ensureInit();
  if (s.currentMeditation !== null && s.currentMeditation.active) return false;
  if (!MEDITATION_TYPES.find(m => m.type === type)) return false;
  if (durationTicks < 1) return false;

  s.currentMeditation = {
    type,
    durationTicks,
    completedTicks: 0,
    active: true,
    startTime: s.dayTick,
    breathPhase: 0,
    breathPattern: type === "breathing" ? MEDITATION_BREATH_PATTERN : [4, 4, 4],
  };

  s.zenLog.push(`Started ${type} meditation`);
  return true;
}

export function zgTickMeditation(): { stillActive: boolean; completed: boolean; currentPhase: string; progress: number; ambient: string } | null {
  const s = ensureInit();
  const med = s.currentMeditation;
  if (!med || !med.active) return null;

  med.completedTicks++;
  med.breathPhase = (med.breathPhase + 1) % (med.breathPattern[0] + med.breathPattern[1] + med.breathPattern[2]);

  const progress = clamp(med.completedTicks / med.durationTicks, 0, 1);

  if (med.completedTicks >= med.durationTicks) {
    med.active = false;
    const medDef = MEDITATION_TYPES.find(m => m.type === med.type);
    const baseZen = medDef?.baseZenYield ?? 5;
    const serenityBonus = 1 + (s.serenityLevel - 1) * 0.1;
    const themeBonus = s.gardenTheme === "japanese" ? 1.1 : 1.0;
    const harmonyBonus = 1 + (s.overallHarmony / 200);
    const earnedZen = Math.floor(baseZen * serenityBonus * themeBonus * harmonyBonus * (med.durationTicks / 10));

    s.resources.zenPoints += earnedZen;
    s.meditationTotalTicks += med.durationTicks;
    s.meditationSessionCount++;
    s.gardenXp += Math.floor(earnedZen * 0.5);
    s.zenLog.push(`Completed ${med.type} meditation: +${earnedZen} Zen Points`);

    const newSerenity = calcSerenityLevel(s.meditationTotalTicks);
    if (newSerenity > s.serenityLevel) {
      s.serenityLevel = newSerenity;
      s.zenLog.push(`Serenity level increased to ${newSerenity}!`);
    }

    zgCheckAchievement("meditations_completed", s.meditationSessionCount);
    zgCheckAchievement("serenity_level", s.serenityLevel);

    const phaseName = med.completedTicks % 3 === 0 ? "exhale" : med.completedTicks % 2 === 0 ? "hold" : "inhale";
    const ambients = AMBIENT_DESCRIPTIONS[med.type];
    const ambient = ambients[Math.floor(med.completedTicks / 10) % ambients.length];

    return { stillActive: false, completed: true, currentPhase: phaseName, progress: 1, ambient };
  }

  let phaseName: string;
  if (med.breathPhase < med.breathPattern[0]) phaseName = "inhale";
  else if (med.breathPhase < med.breathPattern[0] + med.breathPattern[1]) phaseName = "hold";
  else phaseName = "exhale";

  const ambients = AMBIENT_DESCRIPTIONS[med.type];
  const ambient = ambients[Math.floor(med.completedTicks / 8) % ambients.length];

  return { stillActive: true, completed: false, currentPhase: phaseName, progress, ambient };
}

export function zgStopMeditation(): { partialTicks: number; partialZen: number } | null {
  const s = ensureInit();
  if (!s.currentMeditation || !s.currentMeditation.active) return null;
  const med = s.currentMeditation;
  med.active = false;
  const partialZen = Math.floor((med.completedTicks / med.durationTicks) * 3);
  s.resources.zenPoints += partialZen;
  s.meditationTotalTicks += med.completedTicks;
  s.currentMeditation = null;
  return { partialTicks: med.completedTicks, partialZen };
}

export function zgGetMeditationStatus(): MeditationSession | null {
  return ensureInit().currentMeditation;
}

export function zgGetSerenityLevel(): number {
  return ensureInit().serenityLevel;
}

function calcSerenityLevel(totalTicks: number): number {
  if (totalTicks < 10) return 1;
  if (totalTicks < 30) return 2;
  if (totalTicks < 60) return 3;
  if (totalTicks < 100) return 4;
  if (totalTicks < 150) return 5;
  if (totalTicks < 220) return 6;
  if (totalTicks < 300) return 7;
  if (totalTicks < 400) return 8;
  if (totalTicks < 520) return 9;
  if (totalTicks < 660) return 10;
  if (totalTicks < 820) return 11;
  if (totalTicks < 1000) return 12;
  if (totalTicks < 1200) return 13;
  if (totalTicks < 1420) return 14;
  if (totalTicks < 1660) return 15;
  if (totalTicks < 1920) return 16;
  if (totalTicks < 2200) return 17;
  if (totalTicks < 2500) return 18;
  if (totalTicks < 2850) return 19;
  return MAX_SERENITY;
}

export function zgGetZenQuote(index?: number): { quote: string; index: number } {
  const s = ensureInit();
  const i = index ?? ((s.lastQuoteIndex + 1) % ZEN_QUOTES.length);
  s.lastQuoteIndex = i;
  return { quote: ZEN_QUOTES[i], index: i };
}

export function zgGetRandomQuote(): string {
  return ZEN_QUOTES[Math.floor(Math.random() * ZEN_QUOTES.length)];
}

// ─── Resources & Progression ───────────────────────────────────────────────

export function zgGetResources(): { seeds: number; water: number; fertilizer: number; coins: number; zenPoints: number } {
  return { ...ensureInit().resources };
}

export function zgSpendResources(cost: { seeds?: number; water?: number; fertilizer?: number; coins?: number; zenPoints?: number }): boolean {
  const s = ensureInit();
  const r = s.resources;
  if ((cost.seeds ?? 0) > r.seeds) return false;
  if ((cost.water ?? 0) > r.water) return false;
  if ((cost.fertilizer ?? 0) > r.fertilizer) return false;
  if ((cost.coins ?? 0) > r.coins) return false;
  if ((cost.zenPoints ?? 0) > r.zenPoints) return false;
  r.seeds -= cost.seeds ?? 0;
  r.water -= cost.water ?? 0;
  r.fertilizer -= cost.fertilizer ?? 0;
  r.coins -= cost.coins ?? 0;
  r.zenPoints -= cost.zenPoints ?? 0;
  return true;
}

export function zgAddResources(amount: { seeds?: number; water?: number; fertilizer?: number; coins?: number; zenPoints?: number }): void {
  const s = ensureInit();
  s.resources.seeds += amount.seeds ?? 0;
  s.resources.water += amount.water ?? 0;
  s.resources.fertilizer += amount.fertilizer ?? 0;
  s.resources.coins += amount.coins ?? 0;
  s.resources.zenPoints += amount.zenPoints ?? 0;
}

export function zgBuySeeds(count: number): boolean {
  const s = ensureInit();
  const cost = count * 3;
  if (s.resources.coins < cost) return false;
  s.resources.coins -= cost;
  s.resources.seeds += count;
  return true;
}

export function zgBuyWater(count: number): boolean {
  const s = ensureInit();
  const cost = count * 1;
  if (s.resources.coins < cost) return false;
  s.resources.coins -= cost;
  s.resources.water += count;
  return true;
}

export function zgBuyFertilizer(count: number): boolean {
  const s = ensureInit();
  const cost = count * 5;
  if (s.resources.coins < cost) return false;
  s.resources.coins -= cost;
  s.resources.fertilizer += count;
  return true;
}

export function zgGetGardenLevel(): number {
  return ensureInit().gardenLevel;
}

export function zgGetGardenXp(): number {
  return ensureInit().gardenXp;
}

export function zgAddXp(amount: number): void {
  const s = ensureInit();
  s.gardenXp += amount;
  checkLevelUp();
}

function checkLevelUp(): void {
  const s = ensureInit();
  while (s.gardenLevel < MAX_GARDEN_LEVEL && s.gardenXp >= xpForLevel(s.gardenLevel + 1)) {
    s.gardenLevel++;
    s.zenLog.push(`Garden leveled up to ${s.gardenLevel}!`);

    for (const deco of DECO_DEFS) {
      if (deco.unlockLevel === s.gardenLevel && !s.unlockedDecoIds.includes(deco.id)) {
        s.unlockedDecoIds.push(deco.id);
        s.zenLog.push(`Unlocked decoration: ${deco.name}`);
      }
    }

    for (const plant of PLANT_DEFS) {
      const unlockLv = plant.isRare ? Math.floor(plant.growthTimeTicks / 20) : 0;
      if (unlockLv === s.gardenLevel && !s.unlockedPlantIds.includes(plant.id)) {
        s.unlockedPlantIds.push(plant.id);
        s.zenLog.push(`Unlocked plant: ${plant.name}`);
      }
    }

    zgCheckAchievement("garden_level", s.gardenLevel);

    const bonusSeeds = Math.floor(s.gardenLevel * 2);
    const bonusCoins = Math.floor(s.gardenLevel * 5);
    s.resources.seeds += bonusSeeds;
    s.resources.coins += bonusCoins;
  }
}

// ─── Season & Weather ──────────────────────────────────────────────────────

export function zgGetSeason(): Season {
  return ensureInit().season;
}

export function zgGetWeather(): WeatherType {
  return ensureInit().weather;
}

export function zgAdvanceDay(): void {
  const s = ensureInit();
  s.dayTick++;

  s.weatherTicksRemaining--;
  if (s.weatherTicksRemaining <= 0) {
    s.weather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
    s.weatherTicksRemaining = WEATHER_CHANGE_TICKS;
    s.zenLog.push(`Weather changed to ${s.weather}`);
  }

  const seasonLength = 90;
  if (s.dayTick > 0 && s.dayTick % seasonLength === 0) {
    const nextIdx = (seasonIndex(s.season) + 1) % 4;
    s.season = SEASONS[nextIdx];
    s.zenLog.push(`Season changed to ${s.season}`);

    const seasonsPlanted = new Set<string>();
    for (const p of s.plantedPlants) {
      const def = getPlantDef(p.plantDefId);
      if (def) def.seasons.forEach(se => seasonsPlanted.add(se));
    }
    zgCheckAchievement("seasons_planted", seasonsPlanted.size);
  }

  zgAdvanceGrowth();
  zgCheckDailyTask();

  if (s.weather === "rainy") s.resources.water = Math.min(s.resources.water + 3, 99);
  if (s.weather === "stormy") s.resources.water = Math.min(s.resources.water + 5, 99);

  checkLevelUp();
}

export function zgForceSeason(season: Season): void {
  const s = ensureInit();
  s.season = season;
}

export function zgForceWeather(weather: WeatherType): void {
  const s = ensureInit();
  s.weather = weather;
  s.weatherTicksRemaining = WEATHER_CHANGE_TICKS;
}

// ─── Achievements ──────────────────────────────────────────────────────────

function zgCheckAchievement(condition: string, value: number | undefined): void {
  const s = ensureInit();
  for (const ach of s.achievements) {
    if (ach.unlocked || ach.condition !== condition) continue;
    let current = ach.progress;
    if (value !== undefined) current = value;
    else {
      switch (condition) {
        case "plants_planted": current = s.plantedPlants.length; break;
        case "plants_bloomed": current = s.plantedPlants.filter(p => p.stage === "blooming").length; break;
        case "simultaneous_blooms": current = s.plantedPlants.filter(p => p.stage === "blooming").length; break;
        case "meditations_completed": current = s.meditationSessionCount; break;
        case "harmony_score": current = s.overallHarmony; break;
        case "decorations_placed": current = s.gardenGrid.filter(t => t.decorationId !== null).length; break;
        case "rare_plants_grown": current = s.plantedPlants.filter(p => { const d = getPlantDef(p.plantDefId); return d?.isRare && p.stage === "blooming"; }).length; break;
        case "cross_breeds": current = s.unlockedPlantIds.filter(id => ["zen_blossom", "dragon_willow", "crystal_bamboo", "phantom_lotus"].includes(id)).length; break;
        case "seasons_planted": {
          const seasonsSet = new Set<string>();
          for (const p of s.plantedPlants) { const d = getPlantDef(p.plantDefId); if (d) d.seasons.forEach(se => seasonsSet.add(se)); }
          current = seasonsSet.size;
          break;
        }
        case "serenity_level": current = s.serenityLevel; break;
        case "garden_level": current = s.gardenLevel; break;
      }
    }
    ach.progress = current;
    if (current >= ach.target) {
      ach.unlocked = true;
      s.resources.coins += ach.reward.coins;
      s.resources.zenPoints += ach.reward.zenPoints;
      s.zenLog.push(`Achievement unlocked: ${ach.name}!`);
    }
  }
}

export function zgGetAchievements(): { id: string; name: string; description: string; emoji: string; progress: number; target: number; unlocked: boolean; reward: { coins: number; zenPoints: number } }[] {
  return ensureInit().achievements.map(a => ({
    id: a.id, name: a.name, description: a.description, emoji: a.emoji,
    progress: a.progress, target: a.target, unlocked: a.unlocked, reward: { ...a.reward },
  }));
}

export function zgGetUnlockedAchievementCount(): number {
  return ensureInit().achievements.filter(a => a.unlocked).length;
}

// ─── Daily Task ────────────────────────────────────────────────────────────

function generateDailyTask(seed: number): DailyTask {
  const tasks = [
    { id: "water_5", description: "Water 5 plants", target: 5, reward: { coins: 20, seeds: 3 } },
    { id: "meditate_1", description: "Complete 1 meditation", target: 1, reward: { coins: 15, seeds: 2 } },
    { id: "plant_3", description: "Plant 3 seeds", target: 3, reward: { coins: 25, seeds: 5 } },
    { id: "harvest_3", description: "Harvest 3 blooming plants", target: 3, reward: { coins: 30, seeds: 4 } },
    { id: "decorate_1", description: "Place 1 decoration", target: 1, reward: { coins: 10, seeds: 2 } },
    { id: "advance_10", description: "Advance garden 10 times", target: 10, reward: { coins: 20, seeds: 3 } },
    { id: "fertilize_2", description: "Fertilize 2 plants", target: 2, reward: { coins: 15, seeds: 3 } },
  ];
  const idx = seed % tasks.length;
  return { ...tasks[idx], progress: 0, completed: false };
}

function zgCheckDailyTask(): void {
  const s = ensureInit();
  if (!s.dailyTask || s.dailyTask.completed) return;
  const task = s.dailyTask;
  switch (task.id) {
    case "water_5": task.progress = s.plantedPlants.filter(p => p.wateredTicks > 0).length; break;
    case "meditate_1": task.progress = s.meditationSessionCount > 0 ? 1 : 0; break;
    case "plant_3": task.progress = s.plantedPlants.length; break;
    case "harvest_3": task.progress = s.gardenGrid.filter(t => t.plantId && t.plantGrowth === "blooming").length; break;
    case "decorate_1": task.progress = s.gardenGrid.filter(t => t.decorationId !== null).length; break;
    case "advance_10": task.progress = Math.min(s.dayTick, task.target); break;
    case "fertilize_2": task.progress = s.plantedPlants.filter(p => p.fertilized).length; break;
  }
  if (task.progress >= task.target && !task.completed) {
    task.completed = true;
    s.resources.coins += task.reward.coins;
    s.resources.seeds += task.reward.seeds;
    s.zenLog.push(`Daily task completed: ${task.description}!`);
  }
}

export function zgGetDailyTask(dateSeed?: number): { id: string; description: string; target: number; progress: number; completed: boolean; reward: { coins: number; seeds: number } } | null {
  const s = ensureInit();
  const seed = dateSeed ?? s.dailyTaskDateSeed;
  if (s.dailyTask && s.dailyTaskDateSeed === seed) {
    return { ...s.dailyTask };
  }
  s.dailyTaskDateSeed = seed;
  s.dailyTask = generateDailyTask(simpleHashSeed(seed));
  return { ...s.dailyTask };
}

export function zgSetDailyDateSeed(seed: number): void {
  const s = ensureInit();
  s.dailyTaskDateSeed = seed;
  s.dailyTask = generateDailyTask(simpleHashSeed(seed));
}

// ─── Weekly Garden Contest ─────────────────────────────────────────────────

export function zgGetWeeklyContestScore(): { harmonyScore: number; plantDiversity: number; decoCount: number; bloomCount: number; totalScore: number } {
  const s = ensureInit();
  const planted = s.plantedPlants;
  const uniquePlants = new Set(planted.map(p => p.plantDefId)).size;
  const decoCount = s.gardenGrid.filter(t => t.decorationId !== null).length;
  const bloomCount = planted.filter(p => p.stage === "blooming").length;
  const diversityScore = Math.min(uniquePlants * 3, 30);
  const totalScore = s.overallHarmony + diversityScore + decoCount * 2 + bloomCount * 4;
  return { harmonyScore: s.overallHarmony, plantDiversity: uniquePlants, decoCount, bloomCount, totalScore: Math.min(totalScore, 300) };
}

export function zgGetContestRank(score: number): { rank: string; title: string; emoji: string } {
  if (score >= 250) return { rank: "S", title: "Grandmaster Gardener", emoji: "👑" };
  if (score >= 200) return { rank: "A", title: "Master Gardener", emoji: "🏆" };
  if (score >= 150) return { rank: "B", title: "Expert Gardener", emoji: "⭐" };
  if (score >= 100) return { rank: "C", title: "Skilled Gardener", emoji: "🌿" };
  if (score >= 50) return { rank: "D", title: "Apprentice Gardener", emoji: "🌱" };
  return { rank: "F", title: "Beginner", emoji: "🪨" };
}

// ─── Zen Log ───────────────────────────────────────────────────────────────

export function zgGetZenLog(): string[] {
  return [...ensureInit().zenLog];
}

export function zgGetZenLogLast(count: number): string[] {
  const log = ensureInit().zenLog;
  return log.slice(-count);
}

export function zgClearZenLog(): void {
  ensureInit().zenLog = [];
}

// ─── Daily Zen Moment ──────────────────────────────────────────────────────

const DAILY_ZEN_TOPICS: string[] = [
  "Contemplate the sound of one hand clapping in your garden.",
  "Spend a moment watching the wind move through the bamboo.",
  "Reflect on the patience of a seed becoming a tree.",
  "Notice three shades of green in your garden today.",
  "Practice gratitude for the water that sustains life.",
  "Sit by your pond and observe the stillness within movement.",
  "Trace the path of a single falling leaf.",
  "Listen to the silence between the garden sounds.",
  "Feel the texture of stone and remember permanence.",
  "Watch the sky reflected in still water.",
  "Breathe with the rhythm of rain on leaves.",
  "Find the beauty in an empty corner of your garden.",
  "Consider the roots you cannot see that support all growth.",
  "Appreciate the imperfect — wabi-sabi in every petal.",
  "Let go of one expectation for your garden today.",
];

export function zgGetDailyZenMoment(daySeed?: number): { topic: string; seed: number } {
  const seed = daySeed ?? ensureInit().dayTick;
  const idx = simpleHashSeed(seed) % DAILY_ZEN_TOPICS.length;
  return { topic: DAILY_ZEN_TOPICS[idx], seed };
}

// ─── State Management ──────────────────────────────────────────────────────

export function zgResetState(): void {
  state = null;
  ensureInit();
}

export function zgExportState(): ZenGardenState {
  return JSON.parse(JSON.stringify(ensureInit()));
}

export function zgImportState(data: ZenGardenState): boolean {
  if (!data || !data.initialized || !data.gardenGrid || data.gardenGrid.length !== GRID_SIZE) return false;
  state = JSON.parse(JSON.stringify(data));
  return true;
}

// ─── UI Helpers ────────────────────────────────────────────────────────────

export function zgGetGardenGrid(): { row: number; col: number; tileType: TileType; plantEmoji: string | null; plantName: string | null; plantStage: GrowthStage | null; decoEmoji: string | null; decoName: string | null; watered: boolean; fertilized: boolean }[][] {
  const s = ensureInit();
  const rows: ReturnType<typeof zgGetGardenGrid> = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row: typeof rows[number] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const tile = s.gardenGrid[tileIndex(r, c)];
      const plantDef = tile.plantId ? getPlantDef(tile.plantId) : null;
      const decoDef = tile.decorationId ? getDecoDef(tile.decorationId) : null;
      row.push({
        row: r,
        col: c,
        tileType: tile.tileType,
        plantEmoji: plantDef?.emoji ?? null,
        plantName: plantDef?.name ?? null,
        plantStage: tile.plantId ? tile.plantGrowth : null,
        decoEmoji: decoDef?.emoji ?? null,
        decoName: decoDef?.name ?? null,
        watered: tile.watered,
        fertilized: tile.fertilized,
      });
    }
    rows.push(row);
  }
  return rows;
}

export function zgGetPlantCard(plantId: string): { id: string; name: string; emoji: string; category: PlantCategory; growthTimeTicks: number; waterNeed: number; sunNeed: number; seasons: Season[]; coinsYield: number; zenYield: number; isRare: boolean; breedable: boolean; description: string; unlocked: boolean } | null {
  const s = ensureInit();
  const def = getPlantDef(plantId);
  if (!def) return null;
  return { ...def, unlocked: s.unlockedPlantIds.includes(def.id) };
}

export function zgGetDecorationCard(decoId: string): { id: string; name: string; emoji: string; category: DecoCategory; harmonyBonus: number; balanceBonus: number; aestheticsBonus: number; description: string; unlockLevel: number; unlocked: boolean } | null {
  const s = ensureInit();
  const def = getDecoDef(decoId);
  if (!def) return null;
  return { ...def, unlocked: s.unlockedDecoIds.includes(def.id) };
}

export function zgGetMeditationCard(type: MeditationType): { type: MeditationType; name: string; emoji: string; description: string; baseZenYield: number; isActive: boolean; progress: number } | null {
  const s = ensureInit();
  const def = MEDITATION_TYPES.find(m => m.type === type);
  if (!def) return null;
  const isActive = !!(s.currentMeditation?.active && s.currentMeditation?.type === type);
  const progress = isActive ? clamp(s.currentMeditation!.completedTicks / s.currentMeditation!.durationTicks, 0, 1) : 0;
  return { ...def, isActive, progress };
}

export function zgGetDailyCard(): { dailyTask: { description: string; progress: number; target: number; completed: boolean } | null; zenMoment: string; season: Season; weather: WeatherType; dayTick: number } {
  const s = ensureInit();
  const task = s.dailyTask ? { description: s.dailyTask.description, progress: s.dailyTask.progress, target: s.dailyTask.target, completed: s.dailyTask.completed } : null;
  const zenMoment = zgGetDailyZenMoment().topic;
  return { dailyTask: task, zenMoment, season: s.season, weather: s.weather, dayTick: s.dayTick };
}

export function zgGetStatsGrid(): { label: string; value: string | number; emoji: string }[][] {
  const s = ensureInit();
  const planted = s.plantedPlants.length;
  const blooming = s.plantedPlants.filter(p => p.stage === "blooming").length;
  const uniquePlants = new Set(s.plantedPlants.map(p => p.plantDefId)).size;
  const decoCount = s.gardenGrid.filter(t => t.decorationId !== null).length;
  const totalPlants = PLANT_DEFS.length;
  const unlockedCount = s.unlockedPlantIds.length;

  return [
    [
      { label: "Garden Level", value: s.gardenLevel, emoji: "🌱" },
      { label: "Garden XP", value: s.gardenXp, emoji: "✨" },
      { label: "Theme", value: THEME_INFO[s.gardenTheme].label, emoji: THEME_INFO[s.gardenTheme].emoji },
    ],
    [
      { label: "Season", value: s.season, emoji: s.season === "spring" ? "🌸" : s.season === "summer" ? "☀️" : s.season === "fall" ? "🍂" : "❄️" },
      { label: "Weather", value: s.weather, emoji: s.weather === "sunny" ? "☀️" : s.weather === "rainy" ? "🌧️" : s.weather === "cloudy" ? "☁️" : s.weather === "windy" ? "💨" : "⛈️" },
      { label: "Day", value: s.dayTick, emoji: "📅" },
    ],
    [
      { label: "Seeds", value: s.resources.seeds, emoji: "🌱" },
      { label: "Water", value: s.resources.water, emoji: "💧" },
      { label: "Fertilizer", value: s.resources.fertilizer, emoji: "🧪" },
    ],
    [
      { label: "Coins", value: s.resources.coins, emoji: "🪙" },
      { label: "Zen Points", value: s.resources.zenPoints, emoji: "🧘" },
      { label: "Serenity", value: `${s.serenityLevel}/${MAX_SERENITY}`, emoji: "☯️" },
    ],
    [
      { label: "Plants", value: `${planted}/${GRID_SIZE}`, emoji: "🌿" },
      { label: "Blooming", value: blooming, emoji: "🌸" },
      { label: "Unique Species", value: `${uniquePlants}/${totalPlants}`, emoji: "📖" },
    ],
    [
      { label: "Decorations", value: decoCount, emoji: "🏮" },
      { label: "Meditations", value: s.meditationSessionCount, emoji: "🧘‍♂️" },
      { label: "Achievements", value: `${s.achievements.filter(a => a.unlocked).length}/${s.achievements.length}`, emoji: "🏆" },
    ],
    [
      { label: "Harmony", value: s.overallHarmony, emoji: "⚖️" },
      { label: "Plants Unlocked", value: `${unlockedCount}/${totalPlants}`, emoji: "🔓" },
      { label: "Decos Unlocked", value: `${s.unlockedDecoIds.length}/${DECO_DEFS.length}`, emoji: "🔓" },
    ],
  ];
}

export function zgGetGardenOverview(): { level: number; xp: number; xpToNext: number; harmony: number; balance: number; aesthetics: number; overall: number; theme: GardenTheme; season: Season; weather: WeatherType; serenityLevel: number; plantCount: number; bloomCount: number; decoCount: number; meditationCount: number; achievementCount: number; dayTick: number; resources: { seeds: number; water: number; fertilizer: number; coins: number; zenPoints: number } } {
  const s = ensureInit();
  return {
    level: s.gardenLevel,
    xp: s.gardenXp,
    xpToNext: xpForLevel(Math.min(s.gardenLevel + 1, MAX_GARDEN_LEVEL)),
    harmony: s.harmonyScore,
    balance: s.balanceScore,
    aesthetics: s.aestheticsScore,
    overall: s.overallHarmony,
    theme: s.gardenTheme,
    season: s.season,
    weather: s.weather,
    serenityLevel: s.serenityLevel,
    plantCount: s.plantedPlants.length,
    bloomCount: s.plantedPlants.filter(p => p.stage === "blooming").length,
    decoCount: s.gardenGrid.filter(t => t.decorationId !== null).length,
    meditationCount: s.meditationSessionCount,
    achievementCount: s.achievements.filter(a => a.unlocked).length,
    dayTick: s.dayTick,
    resources: { ...s.resources },
  };
}

export function zgGetTileTypeInfo(tileType: TileType): { type: TileType; label: string; emoji: string; description: string; plantable: boolean; waterBonus: boolean } {
  const info: Record<TileType, { label: string; emoji: string; description: string; plantable: boolean; waterBonus: boolean }> = {
    soil: { label: "Soil", emoji: "🟫", description: "Rich earth for planting", plantable: true, waterBonus: false },
    water: { label: "Water", emoji: "💧", description: "Pond or stream tile", plantable: false, waterBonus: true },
    rock: { label: "Rock", emoji: "🪨", description: "Decorative rock formation", plantable: false, waterBonus: false },
    sand: { label: "Sand", emoji: "🏜️", description: "Raked zen sand garden", plantable: true, waterBonus: false },
    moss: { label: "Moss", emoji: "🟩", description: "Soft moss ground cover", plantable: true, waterBonus: false },
    stone_path: { label: "Stone Path", emoji: "🪨", description: "Stepping stone pathway", plantable: false, waterBonus: false },
  };
  return { type: tileType, ...info[tileType] };
}

export function zgGetSeasonInfo(season: Season): { season: Season; emoji: string; growthMultiplier: number; label: string } {
  const info: Record<Season, { emoji: string; growthMultiplier: number; label: string }> = {
    spring: { emoji: "🌸", growthMultiplier: 1.0, label: "Spring" },
    summer: { emoji: "☀️", growthMultiplier: 1.2, label: "Summer" },
    fall: { emoji: "🍂", growthMultiplier: 0.8, label: "Fall" },
    winter: { emoji: "❄️", growthMultiplier: 0.5, label: "Winter" },
  };
  return { season, ...info[season] };
}

export function zgGetWeatherInfo(weather: WeatherType): { weather: WeatherType; emoji: string; sunMultiplier: number; waterGain: number; growthNote: string } {
  const info: Record<WeatherType, { emoji: string; sunMultiplier: number; waterGain: number; growthNote: string }> = {
    sunny: { emoji: "☀️", sunMultiplier: 1.0, waterGain: 0, growthNote: "Perfect for sun-loving plants" },
    cloudy: { emoji: "☁️", sunMultiplier: 0.7, waterGain: 0, growthNote: "Mild conditions, moderate growth" },
    rainy: { emoji: "🌧️", sunMultiplier: 0.4, waterGain: 3, growthNote: "Great for thirsty plants, free water!" },
    windy: { emoji: "💨", sunMultiplier: 0.6, waterGain: 0, growthNote: "Slightly challenging, bamboo thrives" },
    stormy: { emoji: "⛈️", sunMultiplier: 0.2, waterGain: 5, growthNote: "Harsh but abundant water, +breed chance" },
  };
  return { weather, ...info[weather] };
}

export function zgGetSerenityInfo(level: number): { level: number; title: string; emoji: string; meditationBonus: string; ticksRequired: number } {
  const titles = ["Beginner", "Seeker", "Observer", "Calm Mind", "Centered", "Inner Peace", "Mindful", "Tranquil", "Serene", "Peaceful", "Balanced", "Harmonious", "Awakened", "Illuminated", "Enlightened", "Transcendent", "Ascended", "One with Nature", "Cosmic Awareness", "Fully Enlightened"];
  const emojis = ["🌱", "🌿", "🍃", "🧘", "☯️", "🕊️", "🌸", "🏔️", "🌊", "🌙", "⭐", "✨", "💫", "🔮", "🧘‍♂️", "🌟", "💎", "🐉", "🌊", " Enlightenment"];
  const l = clamp(level, 1, MAX_SERENITY);
  const bonus = `${Math.floor((l - 1) * 10)}% more Zen Points from meditation`;
  const tickThresholds = [0, 10, 30, 60, 100, 150, 220, 300, 400, 520, 660, 820, 1000, 1200, 1420, 1660, 1920, 2200, 2500, 2850, 999999];
  return { level: l, title: titles[l - 1], emoji: emojis[l - 1], meditationBonus: bonus, ticksRequired: tickThresholds[l - 1] };
}

export function zgGetLevelMilestones(): { level: number; xpRequired: number; unlocks: string }[] {
  const milestones: { level: number; xpRequired: number; unlocks: string }[] = [];
  for (let lv = 1; lv <= MAX_GARDEN_LEVEL; lv++) {
    const decos = DECO_DEFS.filter(d => d.unlockLevel === lv).map(d => d.name);
    const plants = PLANT_DEFS.filter(p => p.isRare && Math.floor(p.growthTimeTicks / 20) === lv).map(p => p.name);
    const unlockStr = [...decos, ...plants].join(", ");
    milestones.push({ level: lv, xpRequired: xpForLevel(lv), unlocks: unlockStr || "Resources bonus" });
  }
  return milestones;
}

export function zgGetGrowthStageInfo(stage: GrowthStage): { stage: GrowthStage; emoji: string; label: string; progressPercent: number } {
  const info: Record<GrowthStage, { emoji: string; label: string }> = {
    seed: { emoji: "🫘", label: "Seed" },
    sprout: { emoji: "🌱", label: "Sprout" },
    young: { emoji: "🌿", label: "Young" },
    mature: { emoji: "🪴", label: "Mature" },
    blooming: { emoji: "🌸", label: "Blooming" },
  };
  const idx = GROWTH_STAGE_ORDER.indexOf(stage);
  return { stage, ...info[stage], progressPercent: Math.round(((idx + 1) / GROWTH_STAGE_ORDER.length) * 100) };
}

export function zgGetTileCounts(): Record<TileType, number> {
  const s = ensureInit();
  const counts: Record<TileType, number> = { soil: 0, water: 0, rock: 0, sand: 0, moss: 0, stone_path: 0 };
  for (const tile of s.gardenGrid) counts[tile.tileType]++;
  return counts;
}

export function zgGetEmptyTiles(): { row: number; col: number; tileType: TileType }[] {
  const s = ensureInit();
  return s.gardenGrid
    .filter(t => t.plantId === null && t.decorationId === null)
    .map(t => ({ row: t.row, col: t.col, tileType: t.tileType }));
}

export function zgGetPlantableTiles(): { row: number; col: number; tileType: TileType }[] {
  const s = ensureInit();
  return s.gardenGrid
    .filter(t => t.plantId === null && (t.tileType === "soil" || t.tileType === "sand" || t.tileType === "moss"))
    .map(t => ({ row: t.row, col: t.col, tileType: t.tileType }));
}

export function zgGetCategoryLabel(category: PlantCategory): string {
  const labels: Record<PlantCategory, string> = {
    flower: "Flowers", tree: "Trees", bush: "Bushes", bamboo: "Bamboo",
    water_plant: "Water Plants", moss_fern: "Moss & Ferns",
  };
  return labels[category];
}

export function zgGetDecoCategoryLabel(category: DecoCategory): string {
  const labels: Record<DecoCategory, string> = {
    lantern: "Lanterns", bridge: "Bridges", statue: "Statues",
    water_feature: "Water Features", stone: "Stones", fence: "Fences",
  };
  return labels[category];
}

export function zgSimulateTick(): { plantsAdvanced: number; weather: WeatherType; season: Season; waterGained: number; harvestReady: number; harmony: number } {
  const s = ensureInit();
  const prevWater = s.resources.water;
  zgAdvanceDay();
  const waterGained = Math.max(0, s.resources.water - prevWater);
  return {
    plantsAdvanced: s.plantedPlants.filter(p => p.ticksAlive > 0).length,
    weather: s.weather,
    season: s.season,
    waterGained,
    harvestReady: s.plantedPlants.filter(p => p.stage === "blooming").length,
    harmony: s.overallHarmony,
  };
}

export function zgGetFullState(): ZenGardenState {
  return ensureInit();
}
