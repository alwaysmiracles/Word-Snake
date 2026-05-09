// ============================================================================
// Island Builder Wire — SSR-safe island building & resource management system
// All exports prefixed with `ib`. No `use`-prefixed functions. No top-level
// browser APIs (localStorage, window, document, setInterval, setTimeout).
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TerrainType =
  | "grass"
  | "water"
  | "sand"
  | "stone"
  | "forest"
  | "mountain"
  | "volcanic"
  | "crystal";

type BuildingCategory =
  | "resource"
  | "production"
  | "residential"
  | "commercial"
  | "military"
  | "culture"
  | "utility"
  | "special";

type ResourceType =
  | "wood"
  | "stone"
  | "gold"
  | "food"
  | "iron"
  | "crystal"
  | "herbs"
  | "gems";

type WeatherType = "sunny" | "rainy" | "stormy" | "foggy" | "snowy";

type SeasonType = "spring" | "summer" | "fall" | "winter";

type TileImprovement = "none" | "cleared" | "leveled" | "irrigated" | "enriched";

interface BuildingDef {
  id: string;
  name: string;
  category: BuildingCategory;
  cost: Partial<Record<ResourceType, number>>;
  production: Partial<Record<ResourceType, number>>;
  icon: string;
  unlockLevel: number;
  populationProvided: number;
  happinessBonus: number;
  militaryPower: number;
  description: string;
}

interface PlacedBuilding {
  buildingId: string;
  tileIndex: number;
  level: number;
  workers: number;
}

interface Tile {
  index: number;
  terrain: TerrainType;
  improvement: TileImprovement;
  building: PlacedBuilding | null;
}

interface Resources {
  wood: number;
  stone: number;
  gold: number;
  food: number;
  iron: number;
  crystal: number;
  herbs: number;
  gems: number;
}

interface StorageCap {
  wood: number;
  stone: number;
  gold: number;
  food: number;
  iron: number;
  crystal: number;
  herbs: number;
  gems: number;
}

interface VisitorDef {
  name: string;
  icon: string;
  frequency: number;
  preferredCategory: BuildingCategory | "any";
  tipRange: [number, number];
  giftResources: Partial<Record<ResourceType, number>>;
}

interface ActiveVisitor {
  name: string;
  icon: string;
  arrivalTick: number;
  satisfaction: number;
  tipAmount: number;
}

interface IslandEvent {
  id: string;
  name: string;
  icon: string;
  description: string;
  effectType: "resource" | "damage" | "bonus" | "special";
  effectValue: Partial<Record<ResourceType, number>>;
  durationTicks: number;
  startTick: number;
}

interface DailyTask {
  id: string;
  description: string;
  targetType: "build" | "resource" | "population" | "improve" | "upgrade";
  targetId: string;
  required: number;
  progress: number;
  reward: Partial<Record<ResourceType, number>>;
  xpReward: number;
  completed: boolean;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
  progress: number;
  target: number;
  unlocked: boolean;
  reward: Partial<Record<ResourceType, number>>;
  xpReward: number;
}

interface WeeklyCompetition {
  weekId: string;
  category: "buildings" | "resources" | "population" | "rating";
  playerScore: number;
  aiScores: Array<{ name: string; score: number }>;
  reward: Partial<Record<ResourceType, number>>;
  resolved: boolean;
}

interface IslandBuilderState {
  islandName: string;
  grid: Tile[];
  buildings: PlacedBuilding[];
  resources: Resources;
  storage: StorageCap;
  population: number;
  maxPopulation: number;
  happiness: number;
  islandLevel: number;
  islandXP: number;
  xpToNextLevel: number;
  workers: Record<string, number>;
  visitors: ActiveVisitor[];
  activeEvent: IslandEvent | null;
  weather: WeatherType;
  season: SeasonType;
  seasonTick: number;
  dailyTask: DailyTask | null;
  dailyBonusResource: ResourceType | null;
  weeklyCompetition: WeeklyCompetition | null;
  achievements: Achievement[];
  completedAchievementIds: string[];
  streak: number;
  lastTickDate: string;
  totalBuildingsBuilt: number;
  totalResourcesProduced: number;
  totalVisitors: number;
  islandRating: number;
  ticksSinceStart: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_SIZE = 8;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

const TERRAIN_TYPES: TerrainType[] = [
  "grass", "water", "sand", "stone", "forest", "mountain", "volcanic", "crystal",
];

const TERRAIN_ICONS: Record<TerrainType, string> = {
  grass: "🌿",
  water: "🌊",
  sand: "🏖️",
  stone: "🪨",
  forest: "🌲",
  mountain: "⛰️",
  volcanic: "🌋",
  crystal: "💎",
};

const TERRAIN_BUILDING_COMPATIBILITY: Record<TerrainType, BuildingCategory[]> = {
  grass: ["resource", "residential", "commercial", "culture", "utility", "production", "military", "special"],
  water: ["resource", "utility", "special"],
  sand: ["resource", "commercial", "utility", "military", "special"],
  stone: ["resource", "production", "military", "utility", "special"],
  forest: ["resource", "residential", "culture", "military", "special"],
  mountain: ["resource", "production", "military", "special"],
  volcanic: ["resource", "production", "military", "special"],
  crystal: ["resource", "production", "special"],
};

const RESOURCE_ICONS: Record<ResourceType, string> = {
  wood: "🪵",
  stone: "🪨",
  gold: "💰",
  food: "🌾",
  iron: "⚙️",
  crystal: "🔮",
  herbs: "🌿",
  gems: "💠",
};

const TERRAIN_RESOURCE_BONUS: Record<TerrainType, Partial<Record<ResourceType, number>>> = {
  grass: { food: 0.2, herbs: 0.15 },
  water: { food: 0.3 },
  sand: { gold: 0.15, gems: 0.1 },
  stone: { stone: 0.25, iron: 0.1 },
  forest: { wood: 0.3, herbs: 0.25 },
  mountain: { stone: 0.2, iron: 0.2, gems: 0.15 },
  volcanic: { iron: 0.3, crystal: 0.2 },
  crystal: { crystal: 0.4, gems: 0.25 },
};

const WEATHER_PRODUCTION_MODIFIER: Record<WeatherType, Record<string, number>> = {
  sunny: { food: 1.2, herbs: 1.1 },
  rainy: { food: 1.3, wood: 0.9 },
  stormy: { gold: 0.7, iron: 0.8 },
  foggy: { gold: 0.9, gems: 1.15 },
  snowy: { wood: 0.8, food: 0.7, crystal: 1.2 },
};

const SEASON_MODIFIER: Record<SeasonType, Record<string, number>> = {
  spring: { food: 1.3, herbs: 1.2, wood: 1.1 },
  summer: { gold: 1.2, gems: 1.15, food: 1.0 },
  fall: { wood: 1.25, food: 1.1, herbs: 1.1 },
  winter: { stone: 1.2, iron: 1.2, crystal: 1.3, food: 0.6 },
};

const TRADE_RATES: Record<string, Partial<Record<ResourceType, number>>> = {
  wood: { gold: 1, stone: 2, food: 3 },
  stone: { wood: 0.5, gold: 2, iron: 1 },
  gold: { wood: 1, stone: 0.5, gems: 0.1 },
  food: { wood: 0.33, gold: 0.5, herbs: 0.5 },
  iron: { gold: 3, stone: 1, crystal: 0.5 },
  crystal: { gold: 5, iron: 2, gems: 1 },
  herbs: { food: 2, gold: 1, crystal: 0.3 },
  gems: { gold: 10, crystal: 1, iron: 5 },
};

const BUILDINGS: BuildingDef[] = [
  // ── Resource (8) ──────────────────────────────────────────────────────
  { id: "lumber_mill", name: "Lumber Mill", category: "resource", cost: { wood: 10, gold: 5 }, production: { wood: 4 }, icon: "🪓", unlockLevel: 1, populationProvided: 0, happinessBonus: 0, militaryPower: 0, description: "Harvests wood from nearby forests." },
  { id: "quarry", name: "Quarry", category: "resource", cost: { wood: 15, gold: 10 }, production: { stone: 3 }, icon: "⛏️", unlockLevel: 1, populationProvided: 0, happinessBonus: 0, militaryPower: 0, description: "Extracts stone from the earth." },
  { id: "farm", name: "Farm", category: "resource", cost: { wood: 10, stone: 5 }, production: { food: 5 }, icon: "🌾", unlockLevel: 1, populationProvided: 0, happinessBonus: 0, militaryPower: 0, description: "Grows crops to feed your people." },
  { id: "mine", name: "Mine", category: "resource", cost: { wood: 20, stone: 15, gold: 10 }, production: { iron: 2, stone: 1 }, icon: "⛏️", unlockLevel: 3, populationProvided: 0, happinessBonus: 0, militaryPower: 0, description: "Digs deep for iron and stone." },
  { id: "fishing_pier", name: "Fishing Pier", category: "resource", cost: { wood: 15, gold: 8 }, production: { food: 4, gold: 1 }, icon: "🎣", unlockLevel: 2, populationProvided: 0, happinessBonus: 1, militaryPower: 0, description: "Catches fish from the sea." },
  { id: "apiary", name: "Apiary", category: "resource", cost: { wood: 8, gold: 5 }, production: { food: 2, herbs: 1 }, icon: "🐝", unlockLevel: 2, populationProvided: 0, happinessBonus: 1, militaryPower: 0, description: "Keeps bees for honey and pollination." },
  { id: "herbal_garden", name: "Herbal Garden", category: "resource", cost: { wood: 5, gold: 10 }, production: { herbs: 3 }, icon: "🌱", unlockLevel: 4, populationProvided: 0, happinessBonus: 2, militaryPower: 0, description: "Grows medicinal and magical herbs." },
  { id: "crystal_mine", name: "Crystal Mine", category: "resource", cost: { stone: 30, iron: 10, gold: 20 }, production: { crystal: 2, gems: 1 }, icon: "💎", unlockLevel: 6, populationProvided: 0, happinessBonus: 0, militaryPower: 0, description: "Mines precious crystals from veins." },

  // ── Production (5) ────────────────────────────────────────────────────
  { id: "workshop", name: "Workshop", category: "production", cost: { wood: 20, stone: 10, gold: 15 }, production: { wood: 2, stone: 1, iron: 1 }, icon: "🔧", unlockLevel: 3, populationProvided: 0, happinessBonus: 1, militaryPower: 0, description: "Crafts basic goods from raw materials." },
  { id: "forge", name: "Forge", category: "production", cost: { stone: 25, iron: 15, gold: 20 }, production: { iron: 3, gold: 1 }, icon: "🔥", unlockLevel: 5, populationProvided: 0, happinessBonus: 0, militaryPower: 0, description: "Smelts iron into tools and weapons." },
  { id: "alchemist_lab", name: "Alchemist Lab", category: "production", cost: { gold: 30, crystal: 5, herbs: 10 }, production: { crystal: 2, herbs: 1, gold: 2 }, icon: "🧪", unlockLevel: 7, populationProvided: 0, happinessBonus: 2, militaryPower: 0, description: "Transmutes materials into rare substances." },
  { id: "kitchen", name: "Kitchen", category: "production", cost: { wood: 15, stone: 10, gold: 10 }, production: { food: 3, gold: 2 }, icon: "🍳", unlockLevel: 4, populationProvided: 0, happinessBonus: 3, militaryPower: 0, description: "Prepares meals that boost morale." },
  { id: "textile_mill", name: "Textile Mill", category: "production", cost: { wood: 20, gold: 15, iron: 5 }, production: { gold: 3, herbs: 1 }, icon: "🧵", unlockLevel: 6, populationProvided: 0, happinessBonus: 2, militaryPower: 0, description: "Weaves fine fabrics for trade." },

  // ── Residential (5) ───────────────────────────────────────────────────
  { id: "hut", name: "Hut", category: "residential", cost: { wood: 15, stone: 5 }, production: {}, icon: "🏚️", unlockLevel: 1, populationProvided: 5, happinessBonus: 0, militaryPower: 0, description: "A simple shelter for islanders." },
  { id: "house", name: "House", category: "residential", cost: { wood: 25, stone: 15, gold: 10 }, production: {}, icon: "🏠", unlockLevel: 3, populationProvided: 10, happinessBonus: 2, militaryPower: 0, description: "A sturdy home for a small family." },
  { id: "manor", name: "Manor", category: "residential", cost: { wood: 40, stone: 30, gold: 25 }, production: { gold: 2 }, icon: "🏰", unlockLevel: 8, populationProvided: 20, happinessBonus: 5, militaryPower: 0, description: "An elegant estate for the wealthy." },
  { id: "villa", name: "Villa", category: "residential", cost: { stone: 50, gold: 40, gems: 5 }, production: { gold: 5 }, icon: "🏡", unlockLevel: 12, populationProvided: 30, happinessBonus: 8, militaryPower: 0, description: "A luxurious coastal retreat." },
  { id: "castle", name: "Castle", category: "residential", cost: { stone: 100, iron: 50, gold: 80, gems: 10 }, production: { gold: 10 }, icon: "🏯", unlockLevel: 20, populationProvided: 50, happinessBonus: 15, militaryPower: 10, description: "A grand fortress befitting royalty." },

  // ── Commercial (5) ────────────────────────────────────────────────────
  { id: "market", name: "Market", category: "commercial", cost: { wood: 20, stone: 10, gold: 15 }, production: { gold: 4 }, icon: "🏪", unlockLevel: 2, populationProvided: 0, happinessBonus: 3, militaryPower: 0, description: "A bustling marketplace for trade." },
  { id: "bank", name: "Bank", category: "commercial", cost: { stone: 40, gold: 30, gems: 5 }, production: { gold: 8 }, icon: "🏦", unlockLevel: 6, populationProvided: 0, happinessBonus: 1, militaryPower: 0, description: "Generates interest on stored gold." },
  { id: "trading_post", name: "Trading Post", category: "commercial", cost: { wood: 30, gold: 20 }, production: { gold: 5, gems: 1 }, icon: "📦", unlockLevel: 4, populationProvided: 0, happinessBonus: 2, militaryPower: 0, description: "Facilitates trade with passing ships." },
  { id: "auction_house", name: "Auction House", category: "commercial", cost: { stone: 50, gold: 50, gems: 10 }, production: { gold: 12 }, icon: "🔍", unlockLevel: 10, populationProvided: 0, happinessBonus: 2, militaryPower: 0, description: "Rare goods fetch premium prices here." },
  { id: "emporium", name: "Emporium", category: "commercial", cost: { stone: 80, gold: 70, gems: 15, crystal: 5 }, production: { gold: 20, gems: 3 }, icon: "🏬", unlockLevel: 15, populationProvided: 0, happinessBonus: 5, militaryPower: 0, description: "The ultimate trading destination." },

  // ── Military (5) ──────────────────────────────────────────────────────
  { id: "barracks", name: "Barracks", category: "military", cost: { wood: 30, stone: 20, iron: 10 }, production: { iron: 1 }, icon: "⚔️", unlockLevel: 3, populationProvided: 0, happinessBonus: -1, militaryPower: 10, description: "Trains soldiers to defend the island." },
  { id: "archer_tower", name: "Archer Tower", category: "military", cost: { wood: 25, stone: 25, iron: 5 }, production: {}, icon: "🏹", unlockLevel: 5, populationProvided: 0, happinessBonus: 1, militaryPower: 15, description: "Provides ranged defense against threats." },
  { id: "wall", name: "Wall", category: "military", cost: { stone: 40, iron: 10 }, production: {}, icon: "🧱", unlockLevel: 4, populationProvided: 0, happinessBonus: 2, militaryPower: 20, description: "A sturdy wall to protect your island." },
  { id: "cannon", name: "Cannon", category: "military", cost: { iron: 30, stone: 15, gold: 20 }, production: {}, icon: "💥", unlockLevel: 8, populationProvided: 0, happinessBonus: 0, militaryPower: 30, description: "Powerful artillery for island defense." },
  { id: "war_room", name: "War Room", category: "military", cost: { stone: 60, iron: 40, gold: 50, gems: 5 }, production: { gold: 3 }, icon: "🗺️", unlockLevel: 12, populationProvided: 0, happinessBonus: -2, militaryPower: 50, description: "Commands the entire military strategy." },

  // ── Culture (5) ───────────────────────────────────────────────────────
  { id: "library", name: "Library", category: "culture", cost: { wood: 20, stone: 15, gold: 10 }, production: { gold: 1 }, icon: "📚", unlockLevel: 2, populationProvided: 0, happinessBonus: 5, militaryPower: 0, description: "A repository of knowledge and wisdom." },
  { id: "theater", name: "Theater", category: "culture", cost: { wood: 30, stone: 20, gold: 20 }, production: { gold: 2 }, icon: "🎭", unlockLevel: 4, populationProvided: 0, happinessBonus: 8, militaryPower: 0, description: "Entertains and delights the populace." },
  { id: "museum", name: "Museum", category: "culture", cost: { stone: 40, gold: 30, gems: 5 }, production: { gold: 4 }, icon: "🏛️", unlockLevel: 7, populationProvided: 0, happinessBonus: 10, militaryPower: 0, description: "Showcases the island's rich history." },
  { id: "garden", name: "Garden", category: "culture", cost: { wood: 15, gold: 10, herbs: 5 }, production: { herbs: 2 }, icon: "🌸", unlockLevel: 3, populationProvided: 0, happinessBonus: 6, militaryPower: 0, description: "A beautiful garden of rare flowers." },
  { id: "monument", name: "Monument", category: "culture", cost: { stone: 80, gold: 60, gems: 10 }, production: { gold: 6 }, icon: "🗽", unlockLevel: 12, populationProvided: 0, happinessBonus: 15, militaryPower: 0, description: "A towering monument to island greatness." },

  // ── Utility (5) ───────────────────────────────────────────────────────
  { id: "well", name: "Well", category: "utility", cost: { stone: 10, gold: 5 }, production: { food: 1 }, icon: "🪣", unlockLevel: 1, populationProvided: 0, happinessBonus: 2, militaryPower: 0, description: "Provides fresh water for all." },
  { id: "warehouse", name: "Warehouse", category: "utility", cost: { wood: 25, stone: 20 }, production: {}, icon: "🏭", unlockLevel: 2, populationProvided: 0, happinessBonus: 0, militaryPower: 0, description: "Increases resource storage capacity." },
  { id: "road", name: "Road", category: "utility", cost: { stone: 8, gold: 3 }, production: { gold: 1 }, icon: "🛤️", unlockLevel: 1, populationProvided: 0, happinessBonus: 1, militaryPower: 0, description: "Connects buildings for efficiency." },
  { id: "bridge", name: "Bridge", category: "utility", cost: { wood: 30, stone: 20, iron: 10 }, production: { gold: 2 }, icon: "🌉", unlockLevel: 5, populationProvided: 0, happinessBonus: 3, militaryPower: 0, description: "Spans rivers and connects districts." },
  { id: "lighthouse", name: "Lighthouse", category: "utility", cost: { stone: 35, iron: 15, gold: 20 }, production: { gold: 3 }, icon: "🗼", unlockLevel: 6, populationProvided: 0, happinessBonus: 5, militaryPower: 0, description: "Guides ships and boosts tourism." },

  // ── Special (5) ───────────────────────────────────────────────────────
  { id: "portal", name: "Portal", category: "special", cost: { crystal: 20, gems: 10, gold: 50 }, production: { crystal: 5, gems: 3 }, icon: "🌀", unlockLevel: 15, populationProvided: 0, happinessBonus: 10, militaryPower: 5, description: "A gateway to other dimensions." },
  { id: "observatory", name: "Observatory", category: "special", cost: { stone: 60, crystal: 15, gold: 40 }, production: { crystal: 3, gems: 2, gold: 5 }, icon: "🔭", unlockLevel: 10, populationProvided: 0, happinessBonus: 12, militaryPower: 0, description: "Studies the stars for cosmic knowledge." },
  { id: "dragon_nest", name: "Dragon Nest", category: "special", cost: { iron: 40, crystal: 20, gems: 15, gold: 60 }, production: { gold: 10, gems: 5 }, icon: "🐉", unlockLevel: 18, populationProvided: 0, happinessBonus: 8, militaryPower: 40, description: "Home to a majestic island dragon." },
  { id: "rainbow_bridge", name: "Rainbow Bridge", category: "special", cost: { crystal: 30, gems: 20, gold: 80 }, production: { gold: 15, gems: 8 }, icon: "🌈", unlockLevel: 22, populationProvided: 0, happinessBonus: 20, militaryPower: 0, description: "A magical bridge of light and color." },
  { id: "ancient_ruins", name: "Ancient Ruins", category: "special", cost: { stone: 70, crystal: 10, herbs: 20, gold: 45 }, production: { crystal: 4, herbs: 5, gold: 3 }, icon: "🏛️", unlockLevel: 14, populationProvided: 0, happinessBonus: 15, militaryPower: 5, description: "Mystical ruins pulsing with ancient power." },
];

const VISITORS: VisitorDef[] = [
  { name: "Captain Redbeard", icon: "🏴‍☠️", frequency: 3, preferredCategory: "commercial", tipRange: [10, 30], giftResources: { gold: 20, gems: 2 } },
  { name: "Professor Oakwood", icon: "🧑‍🔬", frequency: 5, preferredCategory: "culture", tipRange: [5, 15], giftResources: { herbs: 10, crystal: 3 } },
  { name: "Merchant Ali", icon: "🧔", frequency: 4, preferredCategory: "commercial", tipRange: [15, 40], giftResources: { gold: 30 } },
  { name: "Princess Elara", icon: "👸", frequency: 7, preferredCategory: "culture", tipRange: [20, 50], giftResources: { gems: 5, gold: 25 } },
  { name: "Blacksmith Grimm", icon: "👨‍🔧", frequency: 4, preferredCategory: "production", tipRange: [8, 20], giftResources: { iron: 15, stone: 10 } },
  { name: "Fisher Finn", icon: "🧑‍🌾", frequency: 6, preferredCategory: "resource", tipRange: [5, 12], giftResources: { food: 20 } },
  { name: "Wizard Merlok", icon: "🧙", frequency: 8, preferredCategory: "special", tipRange: [25, 60], giftResources: { crystal: 8, gems: 4 } },
  { name: "Scout Lily", icon: "🧝", frequency: 5, preferredCategory: "military", tipRange: [5, 18], giftResources: { wood: 15, herbs: 5 } },
  { name: "Chef Gusteau", icon: "👨‍🍳", frequency: 6, preferredCategory: "production", tipRange: [8, 22], giftResources: { food: 30, gold: 10 } },
  { name: "Admiral Storm", icon: "⚓", frequency: 3, preferredCategory: "military", tipRange: [15, 35], giftResources: { iron: 20, gold: 15 } },
  { name: "Artist Frida", icon: "👩‍🎨", frequency: 7, preferredCategory: "culture", tipRange: [10, 25], giftResources: { gems: 3, gold: 15 } },
  { name: "Miner Digby", icon: "⛏️", frequency: 4, preferredCategory: "resource", tipRange: [8, 20], giftResources: { stone: 25, iron: 10 } },
  { name: "Healer Sage", icon: "💆", frequency: 6, preferredCategory: "culture", tipRange: [10, 30], giftResources: { herbs: 20, food: 10 } },
  { name: "Pirate Jack", icon: "🏴‍☠️", frequency: 2, preferredCategory: "any", tipRange: [5, 50], giftResources: { gold: 40, gems: 3 } },
  { name: "Botanist Ivy", icon: "🧑‍🔬", frequency: 5, preferredCategory: "resource", tipRange: [6, 15], giftResources: { herbs: 15, food: 15 } },
  { name: "Architect Stone", icon: "👷", frequency: 4, preferredCategory: "utility", tipRange: [10, 25], giftResources: { stone: 30, wood: 10 } },
  { name: "Bard Melody", icon: "🎵", frequency: 8, preferredCategory: "culture", tipRange: [12, 28], giftResources: { gold: 20, gems: 2 } },
  { name: "Explorer Nova", icon: "🧭", frequency: 3, preferredCategory: "special", tipRange: [20, 45], giftResources: { crystal: 10, gems: 5 } },
  { name: "Farmer Oak", icon: "👨‍🌾", frequency: 6, preferredCategory: "resource", tipRange: [4, 12], giftResources: { food: 25, wood: 10 } },
  { name: "Duchess Marina", icon: "👑", frequency: 9, preferredCategory: "residential", tipRange: [30, 70], giftResources: { gold: 50, gems: 8 } },
];

const EVENTS: Array<Omit<IslandEvent, "startTick">> = [
  { id: "storm", name: "Storm", icon: "⛈️", description: "A fierce storm batters the island!", effectType: "damage", effectValue: { wood: -20, food: -10 }, durationTicks: 3 },
  { id: "treasure", name: "Treasure Wash Ashore", icon: "💰", description: "A chest of treasure washed up on the beach!", effectType: "resource", effectValue: { gold: 50, gems: 5 }, durationTicks: 1 },
  { id: "pirate_raid", name: "Pirate Raid", icon: "🏴‍☠️", description: "Pirates are attacking! Defend the island!", effectType: "damage", effectValue: { gold: -30, food: -15 }, durationTicks: 2 },
  { id: "merchant", name: "Merchant Visit", icon: "🚢", description: "A merchant ship has arrived with exotic goods!", effectType: "bonus", effectValue: { gold: 40, crystal: 5, herbs: 10 }, durationTicks: 1 },
  { id: "festival", name: "Island Festival", icon: "🎉", description: "The island celebrates with a grand festival!", effectType: "special", effectValue: { gold: 10 }, durationTicks: 5 },
  { id: "earthquake", name: "Earthquake", icon: "🌋", description: "The ground shakes violently!", effectType: "damage", effectValue: { stone: -25, wood: -15 }, durationTicks: 2 },
  { id: "rainbow", name: "Rainbow", icon: "🌈", description: "A beautiful rainbow appears over the island!", effectType: "special", effectValue: { gems: 3, crystal: 2 }, durationTicks: 1 },
  { id: "whale", name: "Whale Sighting", icon: "🐋", description: "A magnificent whale passes by the island!", effectType: "bonus", effectValue: { food: 20, gold: 15 }, durationTicks: 1 },
  { id: "meteor", name: "Meteor Shower", icon: "☄️", description: "Brilliant meteors rain from the sky!", effectType: "resource", effectValue: { crystal: 10, gems: 5, iron: 5 }, durationTicks: 1 },
  { id: "discovery", name: "Ancient Discovery", icon: "📜", description: "Explorers found ancient artifacts underground!", effectType: "bonus", effectValue: { crystal: 15, gold: 30, herbs: 10 }, durationTicks: 1 },
];

const RESOURCE_TYPES: ResourceType[] = [
  "wood", "stone", "gold", "food", "iron", "crystal", "herbs", "gems",
];

const STORAGE_BASE: StorageCap = {
  wood: 200, stone: 200, gold: 200, food: 200, iron: 200, crystal: 100, herbs: 100, gems: 50,
};

const STORAGE_PER_WAREHOUSE: StorageCap = {
  wood: 100, stone: 100, gold: 100, food: 100, iron: 100, crystal: 50, herbs: 50, gems: 25,
};

const DAILY_TASK_TEMPLATES: Array<Omit<DailyTask, "id" | "progress" | "completed">> = [
  { description: "Build 2 new structures", targetType: "build", targetId: "any", required: 2, reward: { gold: 25 }, xpReward: 30 },
  { description: "Produce 50 wood", targetType: "resource", targetId: "wood", required: 50, reward: { wood: 20 }, xpReward: 20 },
  { description: "Produce 30 stone", targetType: "resource", targetId: "stone", required: 30, reward: { stone: 15 }, xpReward: 20 },
  { description: "Reach population 20", targetType: "population", targetId: "population", required: 20, reward: { food: 30, gold: 15 }, xpReward: 40 },
  { description: "Improve 3 tiles", targetType: "improve", targetId: "any", required: 3, reward: { gold: 20, herbs: 10 }, xpReward: 25 },
  { description: "Upgrade 1 building", targetType: "upgrade", targetId: "any", required: 1, reward: { iron: 15, gold: 20 }, xpReward: 35 },
  { description: "Build a culture building", targetType: "build", targetId: "culture", required: 1, reward: { gems: 3, gold: 30 }, xpReward: 30 },
  { description: "Produce 40 food", targetType: "resource", targetId: "food", required: 40, reward: { food: 20, gold: 10 }, xpReward: 20 },
  { description: "Accumulate 100 gold", targetType: "resource", targetId: "gold", required: 100, reward: { gems: 2 }, xpReward: 25 },
  { description: "Build a military structure", targetType: "build", targetId: "military", required: 1, reward: { iron: 20, gold: 15 }, xpReward: 30 },
];

const AI_ISLAND_NAMES = [
  "Emerald Isle", "Coral Atoll", "Shadow Reef", "Dragon's Peak",
  "Crystal Cove", "Misty Harbor", "Sunstone Shores", "Frostbite Bay",
];

const ACHIEVEMENT_DEFS: Array<Omit<Achievement, "progress" | "unlocked">> = [
  { id: "first_build", name: "First Steps", icon: "🏗️", description: "Build your first structure", condition: "build", target: 1, reward: { gold: 10 }, xpReward: 20 },
  { id: "builder_5", name: "Novice Builder", icon: "🔨", description: "Build 5 structures", condition: "build", target: 5, reward: { wood: 20 }, xpReward: 30 },
  { id: "builder_15", name: "Master Builder", icon: "🏛️", description: "Build 15 structures", condition: "build", target: 15, reward: { gold: 50, gems: 5 }, xpReward: 80 },
  { id: "builder_30", name: "Legendary Builder", icon: "👑", description: "Build 30 structures", condition: "build", target: 30, reward: { gems: 15, crystal: 10 }, xpReward: 150 },
  { id: "pop_20", name: "Growing Village", icon: "👥", description: "Reach 20 population", condition: "population", target: 20, reward: { food: 30 }, xpReward: 30 },
  { id: "pop_50", name: "Thriving Town", icon: "🏘️", description: "Reach 50 population", condition: "population", target: 50, reward: { gold: 40, food: 50 }, xpReward: 60 },
  { id: "pop_100", name: "Bustling City", icon: "🏙️", description: "Reach 100 population", condition: "population", target: 100, reward: { gems: 10, gold: 100 }, xpReward: 120 },
  { id: "all_resources", name: "Resource Baron", icon: "💎", description: "Have 50+ of every resource", condition: "all_resources", target: 50, reward: { gems: 5 }, xpReward: 50 },
  { id: "gold_500", name: "Golden Hoard", icon: "💰", description: "Accumulate 500 gold", condition: "resource_gold", target: 500, reward: { gems: 8 }, xpReward: 60 },
  { id: "level_10", name: "Island Elder", icon: "⭐", description: "Reach island level 10", condition: "level", target: 10, reward: { gold: 50 }, xpReward: 0 },
  { id: "level_25", name: "Island Lord", icon: "🌟", description: "Reach island level 25", condition: "level", target: 25, reward: { gems: 15, crystal: 10 }, xpReward: 0 },
  { id: "level_50", name: "Island God", icon: "✨", description: "Reach island level 50", condition: "level", target: 50, reward: { gems: 50, crystal: 30 }, xpReward: 0 },
  { id: "happy_80", name: "Happy Islanders", icon: "😊", description: "Reach 80% happiness", condition: "happiness", target: 80, reward: { food: 40, herbs: 20 }, xpReward: 40 },
  { id: "happy_100", name: "Utopia", icon: "🥳", description: "Reach 100% happiness", condition: "happiness", target: 100, reward: { gems: 10, gold: 50 }, xpReward: 100 },
  { id: "rating_4", name: "Popular Destination", icon: "⭐", description: "Reach 4-star island rating", condition: "rating", target: 4, reward: { gold: 40 }, xpReward: 50 },
  { id: "rating_5", name: "Five-Star Paradise", icon: "🌟", description: "Reach 5-star island rating", condition: "rating", target: 5, reward: { gems: 20, crystal: 15 }, xpReward: 200 },
  { id: "visitors_10", name: "Welcoming Host", icon: "👋", description: "Host 10 visitors total", condition: "visitors", target: 10, reward: { gold: 30 }, xpReward: 30 },
  { id: "visitors_50", name: "Tourism Hub", icon: "🏖️", description: "Host 50 visitors total", condition: "visitors", target: 50, reward: { gems: 8, gold: 60 }, xpReward: 80 },
  { id: "upgrade_5", name: "Upgrader", icon: "⬆️", description: "Upgrade buildings 5 times", condition: "upgrade", target: 5, reward: { iron: 20, gold: 20 }, xpReward: 40 },
  { id: "upgrade_15", name: "Master Upgrader", icon: "📈", description: "Upgrade buildings 15 times", condition: "upgrade", target: 15, reward: { gems: 8, crystal: 5 }, xpReward: 100 },
  { id: "category_all", name: "Diverse Builder", icon: "🎨", description: "Build in all 8 categories", condition: "categories", target: 8, reward: { gems: 12 }, xpReward: 80 },
  { id: "streak_7", name: "Dedicated Mayor", icon: "🔥", description: "Maintain a 7-day streak", condition: "streak", target: 7, reward: { gold: 50, gems: 5 }, xpReward: 50 },
  { id: "streak_30", name: "Eternal Mayor", icon: "🏆", description: "Maintain a 30-day streak", condition: "streak", target: 30, reward: { gems: 25, crystal: 20 }, xpReward: 200 },
  { id: "event_10", name: "Event Veteran", icon: "🎪", description: "Experience 10 events", condition: "events", target: 10, reward: { gold: 40 }, xpReward: 40 },
  { id: "improve_10", name: "Landscaper", icon: "🌱", description: "Improve 10 tiles", condition: "improve", target: 10, reward: { herbs: 30, wood: 20 }, xpReward: 35 },
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let state: IslandBuilderState | null = null;

function createDefaultGrid(): Tile[] {
  const grid: Tile[] = [];
  for (let i = 0; i < TOTAL_TILES; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    let terrain: TerrainType = "grass";
    if (row <= 1 && col <= 1) terrain = "water";
    else if (row >= 6 && col >= 6) terrain = "mountain";
    else if (row === 0 && col >= 5) terrain = "sand";
    else if (row >= 5 && col <= 2) terrain = "forest";
    else if (row === 3 && col === 7) terrain = "volcanic";
    else if (row === 7 && col === 3) terrain = "crystal";
    else if (row <= 1) terrain = "water";
    grid.push({ index: i, terrain, improvement: "none", building: null });
  }
  return grid;
}

function createInitialState(): IslandBuilderState {
  const achievements: Achievement[] = ACHIEVEMENT_DEFS.map((a) => ({
    ...a,
    progress: 0,
    unlocked: false,
  }));
  return {
    islandName: "My Island",
    grid: createDefaultGrid(),
    buildings: [],
    resources: { wood: 50, stone: 30, gold: 20, food: 40, iron: 10, crystal: 5, herbs: 15, gems: 2 },
    storage: { ...STORAGE_BASE },
    population: 5,
    maxPopulation: 10,
    happiness: 50,
    islandLevel: 1,
    islandXP: 0,
    xpToNextLevel: 100,
    workers: {},
    visitors: [],
    activeEvent: null,
    weather: "sunny",
    season: "spring",
    seasonTick: 0,
    dailyTask: null,
    dailyBonusResource: null,
    weeklyCompetition: null,
    achievements,
    completedAchievementIds: [],
    streak: 0,
    lastTickDate: "",
    totalBuildingsBuilt: 0,
    totalResourcesProduced: 0,
    totalVisitors: 0,
    islandRating: 1,
    ticksSinceStart: 0,
  };
}

function ensureInit(): IslandBuilderState {
  if (!state) {
    state = createInitialState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function getBuildingDef(id: string): BuildingDef | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getResourceType(name: string): ResourceType | undefined {
  return RESOURCE_TYPES.find((r) => r === name) as ResourceType | undefined;
}

// ---------------------------------------------------------------------------
// XP & Level
// ---------------------------------------------------------------------------

function recalcStorage(s: IslandBuilderState): StorageCap {
  const warehouseCount = s.buildings.filter((b) => b.buildingId === "warehouse").length;
  const cap: StorageCap = { ...STORAGE_BASE };
  for (const res of RESOURCE_TYPES) {
    cap[res] = STORAGE_BASE[res] + warehouseCount * STORAGE_PER_WAREHOUSE[res];
  }
  return cap;
}

function recalcPopulation(s: IslandBuilderState): void {
  let maxPop = 10;
  let happiness = 50;
  let cultureBonus = 0;
  let militaryMalus = 0;
  const categories = new Set<BuildingCategory>();

  for (const placed of s.buildings) {
    const def = getBuildingDef(placed.buildingId);
    if (!def) continue;
    maxPop += def.populationProvided;
    happiness += def.happinessBonus;
    if (def.category === "culture") cultureBonus += 2;
    if (def.category === "military" && def.happinessBonus < 0) militaryMalus += Math.abs(def.happinessBonus);
    categories.add(def.category);
  }

  const foodSurplus = s.resources.food - s.population * 0.5;
  if (foodSurplus > 0) happiness += Math.min(10, Math.floor(foodSurplus / 10));
  else happiness -= Math.min(15, Math.floor(Math.abs(foodSurplus) / 5));

  happiness += Math.min(20, cultureBonus);
  happiness -= Math.min(10, militaryMalus);

  s.maxPopulation = maxPop;
  s.happiness = clamp(happiness, 0, 100);
}

function recalcRating(s: IslandBuilderState): void {
  const buildingCount = s.buildings.length;
  const categorySet = new Set<string>();
  for (const b of s.buildings) {
    const def = getBuildingDef(b.buildingId);
    if (def) categorySet.add(def.category);
  }
  const variety = categorySet.size / 8;
  const improvedTiles = s.grid.filter((t) => t.improvement !== "none").length / TOTAL_TILES;
  const cleanliness = improvedTiles;
  const buildingScore = Math.min(buildingCount / 30, 1);
  const score = (buildingScore * 0.3 + variety * 0.3 + cleanliness * 0.2 + (s.happiness / 100) * 0.2) * 5;
  s.islandRating = clamp(Math.round(score * 10) / 10, 1, 5);
}

function addXP(s: IslandBuilderState, amount: number): void {
  s.islandXP += amount;
  while (s.islandXP >= s.xpToNextLevel && s.islandLevel < 50) {
    s.islandXP -= s.xpToNextLevel;
    s.islandLevel += 1;
    s.xpToNextLevel = Math.floor(100 * Math.pow(1.15, s.islandLevel - 1));
  }
}

function checkAllAchievements(s: IslandBuilderState): void {
  for (const ach of s.achievements) {
    if (ach.unlocked) continue;
    let progress = 0;
    switch (ach.condition) {
      case "build":
        progress = s.totalBuildingsBuilt;
        break;
      case "population":
        progress = s.maxPopulation;
        break;
      case "all_resources":
        progress = RESOURCE_TYPES.filter((r) => s.resources[r] >= ach.target).length === 8 ? ach.target : 0;
        break;
      case "resource_gold":
        progress = s.resources.gold;
        break;
      case "level":
        progress = s.islandLevel;
        break;
      case "happiness":
        progress = s.happiness;
        break;
      case "rating":
        progress = Math.floor(s.islandRating);
        break;
      case "visitors":
        progress = s.totalVisitors;
        break;
      case "upgrade":
        progress = s.buildings.reduce((sum, b) => sum + (b.level - 1), 0);
        break;
      case "categories": {
        const cats = new Set<BuildingCategory>();
        for (const b of s.buildings) {
          const def = getBuildingDef(b.buildingId);
          if (def) cats.add(def.category);
        }
        progress = cats.size;
        break;
      }
      case "streak":
        progress = s.streak;
        break;
      case "events":
        progress = s.ticksSinceStart > 0 ? Math.floor(s.ticksSinceStart / 10) : 0;
        break;
      case "improve":
        progress = s.grid.filter((t) => t.improvement !== "none").length;
        break;
    }
    ach.progress = Math.min(progress, ach.target);
    if (ach.progress >= ach.target) {
      ach.unlocked = true;
      if (!s.completedAchievementIds.includes(ach.id)) {
        s.completedAchievementIds.push(ach.id);
        for (const [res, amt] of Object.entries(ach.reward)) {
          const rt = getResourceType(res);
          if (rt) s.resources[rt] += amt;
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// State exports
// ---------------------------------------------------------------------------

export function ibGetState(): IslandBuilderState {
  return ensureInit();
}

export function ibResetState(): void {
  state = null;
}

// ---------------------------------------------------------------------------
// Island
// ---------------------------------------------------------------------------

export function ibGetIsland(): { name: string; level: number; rating: number; population: number; happiness: number } {
  const s = ensureInit();
  return { name: s.islandName, level: s.islandLevel, rating: s.islandRating, population: s.population, happiness: s.happiness };
}

export function ibGetName(): string {
  return ensureInit().islandName;
}

export function ibSetName(name: string): void {
  ensureInit().islandName = name.slice(0, 30);
}

export function ibGetGrid(): Tile[] {
  return ensureInit().grid;
}

export function ibGetTile(index: number): Tile | null {
  const s = ensureInit();
  if (index < 0 || index >= TOTAL_TILES) return null;
  return s.grid[index];
}

export function ibSetTerrain(index: number, terrain: TerrainType): boolean {
  const s = ensureInit();
  if (index < 0 || index >= TOTAL_TILES) return false;
  if (s.grid[index].building !== null) return false;
  s.grid[index].terrain = terrain;
  return true;
}

export function ibImproveTile(index: number, improvement: TileImprovement): boolean {
  const s = ensureInit();
  if (index < 0 || index >= TOTAL_TILES) return false;
  const tile = s.grid[index];
  const improvementOrder: TileImprovement[] = ["none", "cleared", "leveled", "irrigated", "enriched"];
  const currentIdx = improvementOrder.indexOf(tile.improvement);
  const newIdx = improvementOrder.indexOf(improvement);
  if (newIdx <= currentIdx && tile.improvement !== "none") return false;
  tile.improvement = improvement;
  recalcRating(s);
  checkAllAchievements(s);
  return true;
}

export function ibGetIslandLevel(): number {
  return ensureInit().islandLevel;
}

export function ibAddIslandXP(amount: number): number {
  const s = ensureInit();
  addXP(s, amount);
  checkAllAchievements(s);
  return s.islandLevel;
}

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

export function ibGetBuildings(): BuildingDef[] {
  return BUILDINGS;
}

export function ibGetBuilding(id: string): BuildingDef | undefined {
  return getBuildingDef(id);
}

export function ibBuildStructure(buildingId: string, tileIndex: number): boolean {
  const s = ensureInit();
  if (tileIndex < 0 || tileIndex >= TOTAL_TILES) return false;
  const def = getBuildingDef(buildingId);
  if (!def) return false;
  if (def.unlockLevel > s.islandLevel) return false;
  const tile = s.grid[tileIndex];
  if (tile.building !== null) return false;
  const compatibleCategories = TERRAIN_BUILDING_COMPATIBILITY[tile.terrain];
  if (!compatibleCategories.includes(def.category)) return false;
  if (!ibCanAfford(def.cost)) return false;
  for (const [res, amt] of Object.entries(def.cost)) {
    const rt = getResourceType(res);
    if (rt) s.resources[rt] -= amt;
  }
  const placed: PlacedBuilding = { buildingId, tileIndex, level: 1, workers: 0 };
  tile.building = placed;
  s.buildings.push(placed);
  s.totalBuildingsBuilt += 1;
  addXP(s, 15 + def.unlockLevel * 2);
  recalcStorage(s);
  recalcPopulation(s);
  recalcRating(s);
  checkAllAchievements(s);
  return true;
}

export function ibDemolishStructure(tileIndex: number): { refunded: Partial<Record<ResourceType, number>> } | null {
  const s = ensureInit();
  if (tileIndex < 0 || tileIndex >= TOTAL_TILES) return null;
  const tile = s.grid[tileIndex];
  if (!tile.building) return null;
  const def = getBuildingDef(tile.building.buildingId);
  if (!def) return null;
  const refunded: Partial<Record<ResourceType, number>> = {};
  for (const [res, amt] of Object.entries(def.cost)) {
    const rt = getResourceType(res);
    if (rt) {
      const refund = Math.floor(amt * 0.5);
      s.resources[rt] += refund;
      refunded[rt] = refund;
    }
  }
  s.buildings = s.buildings.filter((b) => b.tileIndex !== tileIndex);
  tile.building = null;
  recalcStorage(s);
  recalcPopulation(s);
  recalcRating(s);
  return { refunded };
}

export function ibUpgradeBuilding(tileIndex: number): boolean {
  const s = ensureInit();
  if (tileIndex < 0 || tileIndex >= TOTAL_TILES) return false;
  const tile = s.grid[tileIndex];
  if (!tile.building) return false;
  if (tile.building.level >= 5) return false;
  const def = getBuildingDef(tile.building.buildingId);
  if (!def) return false;
  const multiplier = tile.building.level;
  const upgradeCost: Partial<Record<ResourceType, number>> = {};
  for (const [res, amt] of Object.entries(def.cost)) {
    const rt = getResourceType(res);
    if (rt) upgradeCost[rt] = Math.floor(amt * multiplier * 0.6);
  }
  if (!ibCanAfford(upgradeCost)) return false;
  for (const [res, amt] of Object.entries(upgradeCost)) {
    const rt = getResourceType(res);
    if (rt) s.resources[rt] -= amt;
  }
  tile.building.level += 1;
  addXP(s, 10 + tile.building.level * 5);
  recalcRating(s);
  checkAllAchievements(s);
  return true;
}

export function ibGetBuildableBuildings(): BuildingDef[] {
  const s = ensureInit();
  return BUILDINGS.filter((b) => b.unlockLevel <= s.islandLevel);
}

export function ibGetBuildingCost(buildingId: string, level?: number): Partial<Record<ResourceType, number>> {
  const def = getBuildingDef(buildingId);
  if (!def) return {};
  if (!level || level <= 1) return { ...def.cost };
  const multiplier = level - 1;
  const cost: Partial<Record<ResourceType, number>> = {};
  for (const [res, amt] of Object.entries(def.cost)) {
    const rt = getResourceType(res);
    if (rt) cost[rt] = Math.floor(amt * multiplier * 0.6);
  }
  return cost;
}

export function ibCanAfford(cost: Partial<Record<ResourceType, number>>): boolean {
  const s = ensureInit();
  for (const [res, amt] of Object.entries(cost)) {
    const rt = getResourceType(res);
    if (rt && s.resources[rt] < amt) return false;
  }
  return true;
}

export function ibGetBuildingsOnIsland(): PlacedBuilding[] {
  return ensureInit().buildings;
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export function ibGetResources(): Resources {
  return { ...ensureInit().resources };
}

export function ibGetResource(type: ResourceType): number {
  return ensureInit().resources[type];
}

export function ibAddResource(type: ResourceType, amount: number): number {
  const s = ensureInit();
  s.resources[type] = clamp(s.resources[type] + amount, 0, s.storage[type]);
  return s.resources[type];
}

export function ibSpendResource(type: ResourceType, amount: number): boolean {
  const s = ensureInit();
  if (s.resources[type] < amount) return false;
  s.resources[type] -= amount;
  return true;
}

export function ibGetProduction(): Partial<Record<ResourceType, number>> {
  const s = ensureInit();
  const prod: Partial<Record<ResourceType, number>> = {};
  for (const placed of s.buildings) {
    const def = getBuildingDef(placed.buildingId);
    if (!def) continue;
    const efficiency = 0.5 + (placed.workers / Math.max(1, placed.level + 1)) * 0.5;
    const levelMultiplier = 1 + (placed.level - 1) * 0.25;
    for (const [res, amt] of Object.entries(def.production)) {
      const rt = getResourceType(res);
      if (rt) {
        const base = amt * efficiency * levelMultiplier;
        const terrainBonus = TERRAIN_RESOURCE_BONUS[s.grid[placed.tileIndex].terrain];
        const bonus = terrainBonus?.[rt] ?? 0;
        const weatherMod = WEATHER_PRODUCTION_MODIFIER[s.weather]?.[rt] ?? 1;
        const seasonMod = SEASON_MODIFIER[s.season]?.[rt] ?? 1;
        const final = base * (1 + bonus) * weatherMod * seasonMod;
        prod[rt] = (prod[rt] ?? 0) + final;
      }
    }
  }
  if (s.dailyBonusResource) {
    const dr = s.dailyBonusResource;
    prod[dr] = (prod[dr] ?? 0) * 2;
  }
  if (s.happiness >= 80) {
    for (const rt of RESOURCE_TYPES) {
      prod[rt] = (prod[rt] ?? 0) * 1.1;
    }
  }
  return prod;
}

export function ibGetStorage(): StorageCap {
  return { ...ensureInit().storage };
}

export function ibTradeResources(from: ResourceType, to: ResourceType, fromAmount: number): number | null {
  const s = ensureInit();
  if (from === to) return null;
  if (s.resources[from] < fromAmount) return null;
  const rate = TRADE_RATES[from]?.[to];
  if (rate === undefined) return null;
  const received = Math.floor(fromAmount * rate);
  if (received <= 0) return null;
  s.resources[from] -= fromAmount;
  s.resources[to] = clamp(s.resources[to] + received, 0, s.storage[to]);
  return received;
}

export function ibGetTradeRate(from: ResourceType, to: ResourceType): number | null {
  if (from === to) return null;
  return TRADE_RATES[from]?.[to] ?? null;
}

export function ibGetResourceBonus(terrain: TerrainType): Partial<Record<ResourceType, number>> {
  return TERRAIN_RESOURCE_BONUS[terrain] ?? {};
}

// ---------------------------------------------------------------------------
// Population
// ---------------------------------------------------------------------------

export function ibGetPopulation(): number {
  return ensureInit().population;
}

export function ibGetHappiness(): number {
  return ensureInit().happiness;
}

export function ibAssignWorker(tileIndex: number, count: number): boolean {
  const s = ensureInit();
  if (tileIndex < 0 || tileIndex >= TOTAL_TILES) return false;
  const tile = s.grid[tileIndex];
  if (!tile.building) return false;
  const totalWorkers = Object.values(s.workers).reduce((a, b) => a + b, 0);
  const available = s.population - totalWorkers;
  const maxForBuilding = tile.building.level + 1;
  const currentForTile = s.workers[tileIndex] ?? 0;
  const requested = count < 0 ? currentForTile + count : count;
  if (requested < 0) return false;
  if (requested > maxForBuilding) return false;
  const diff = requested - currentForTile;
  if (diff > available) return false;
  if (requested === 0) {
    delete s.workers[tileIndex];
  } else {
    s.workers[tileIndex] = requested;
  }
  return true;
}

export function ibGetWorkerAssignment(tileIndex: number): number {
  return ensureInit().workers[tileIndex] ?? 0;
}

export function ibGetPopulationCapacity(): number {
  return ensureInit().maxPopulation;
}

// ---------------------------------------------------------------------------
// Visitors
// ---------------------------------------------------------------------------

export function ibGetVisitors(): VisitorDef[] {
  return VISITORS;
}

export function ibGetActiveVisitors(): ActiveVisitor[] {
  return ensureInit().visitors;
}

export function ibGetVisitorSatisfaction(): number {
  const s = ensureInit();
  if (s.visitors.length === 0) return 0;
  const total = s.visitors.reduce((sum, v) => sum + v.satisfaction, 0);
  return Math.round(total / s.visitors.length);
}

export function ibGetIslandRating(): number {
  return ensureInit().islandRating;
}

export function ibGetVisitorGifts(): Partial<Record<ResourceType, number>> {
  const s = ensureInit();
  const gifts: Partial<Record<ResourceType, number>> = {};
  for (const v of s.visitors) {
    const def = VISITORS.find((vd) => vd.name === v.name);
    if (!def) continue;
    for (const [res, amt] of Object.entries(def.giftResources)) {
      const rt = getResourceType(res);
      if (rt) gifts[rt] = (gifts[rt] ?? 0) + amt;
    }
  }
  return gifts;
}

function generateVisitors(s: IslandBuilderState): void {
  if (s.visitors.length >= 3) return;
  const categorySet = new Set<BuildingCategory>();
  for (const b of s.buildings) {
    const def = getBuildingDef(b.buildingId);
    if (def) categorySet.add(def.category);
  }
  const eligible = VISITORS.filter((v) => v.preferredCategory === "any" || categorySet.has(v.preferredCategory));
  if (eligible.length === 0) return;
  const rng = seededRandom(s.ticksSinceStart * 7 + 42);
  const pick = eligible[Math.floor(rng() * eligible.length)];
  const satisfaction = clamp(
    Math.round(s.islandRating * 1.5 + s.happiness / 20 - (s.activeEvent?.effectType === "damage" ? 1 : 0)),
    1, 5
  );
  const tipMult = satisfaction / 3;
  const tip = Math.round((pick.tipRange[0] + rng() * (pick.tipRange[1] - pick.tipRange[0])) * tipMult);
  s.visitors.push({
    name: pick.name,
    icon: pick.icon,
    arrivalTick: s.ticksSinceStart,
    satisfaction,
    tipAmount: tip,
  });
  s.totalVisitors += 1;
  s.resources.gold = clamp(s.resources.gold + tip, 0, s.storage.gold);
}

function processVisitors(s: IslandBuilderState): void {
  const maxStay = 5;
  s.visitors = s.visitors.filter((v) => s.ticksSinceStart - v.arrivalTick < maxStay);
  if (Math.random() < 0.3 || s.ticksSinceStart % 3 === 0) {
    generateVisitors(s);
  }
}

// ---------------------------------------------------------------------------
// Events & Weather
// ---------------------------------------------------------------------------

export function ibGetActiveEvent(): IslandEvent | null {
  return ensureInit().activeEvent;
}

export function ibProcessEvent(): { event: IslandEvent | null; resourcesChanged: Partial<Record<ResourceType, number>> } {
  const s = ensureInit();
  const result: Partial<Record<ResourceType, number>> = {};

  if (s.activeEvent) {
    if (s.ticksSinceStart - s.activeEvent.startTick >= s.activeEvent.durationTicks) {
      for (const [res, amt] of Object.entries(s.activeEvent.effectValue)) {
        const rt = getResourceType(res);
        if (rt) {
          s.resources[rt] = clamp(s.resources[rt] + amt, 0, s.storage[rt]);
          result[rt] = amt;
        }
      }
      s.activeEvent = null;
    }
    return { event: null, resourcesChanged: result };
  }

  if (s.ticksSinceStart > 0 && s.ticksSinceStart % 8 === 0) {
    const rng = seededRandom(s.ticksSinceStart * 13 + 99);
    const evt = EVENTS[Math.floor(rng() * EVENTS.length)];
    s.activeEvent = { ...evt, startTick: s.ticksSinceStart };
    if (evt.durationTicks === 1) {
      for (const [res, amt] of Object.entries(evt.effectValue)) {
        const rt = getResourceType(res);
        if (rt) {
          s.resources[rt] = clamp(s.resources[rt] + amt, 0, s.storage[rt]);
          result[rt] = amt;
        }
      }
      s.activeEvent = null;
      const completedEvt: IslandEvent = { ...evt, startTick: s.ticksSinceStart };
      return { event: completedEvt, resourcesChanged: result };
    }
    return { event: { ...evt, startTick: s.ticksSinceStart } as IslandEvent, resourcesChanged: result };
  }
  return { event: null, resourcesChanged: result };
}

export function ibGetWeather(): WeatherType {
  return ensureInit().weather;
}

export function ibGetSeason(): SeasonType {
  return ensureInit().season;
}

export function ibGetSeasonModifier(): Record<string, number> {
  return SEASON_MODIFIER[ensureInit().season];
}

function updateSeason(s: IslandBuilderState): void {
  s.seasonTick += 1;
  if (s.seasonTick >= 10) {
    s.seasonTick = 0;
    const seasons: SeasonType[] = ["spring", "summer", "fall", "winter"];
    const idx = seasons.indexOf(s.season);
    s.season = seasons[(idx + 1) % 4];
  }
}

function updateWeather(s: IslandBuilderState): void {
  if (s.ticksSinceStart % 5 === 0) {
    const seasonWeights: Record<SeasonType, WeatherType[]> = {
      spring: ["sunny", "rainy", "sunny", "rainy", "foggy"],
      summer: ["sunny", "sunny", "sunny", "stormy", "sunny"],
      fall: ["sunny", "rainy", "foggy", "sunny", "rainy"],
      winter: ["snowy", "snowy", "foggy", "snowy", "sunny"],
    };
    const options = seasonWeights[s.season];
    s.weather = options[Math.floor(Math.random() * options.length)];
  }
}

// ---------------------------------------------------------------------------
// Daily & Achievement Systems
// ---------------------------------------------------------------------------

export function ibGetDailyTask(): DailyTask | null {
  return ensureInit().dailyTask;
}

export function ibCompleteDailyTask(): { completed: boolean; reward: Partial<Record<ResourceType, number>>; xpGained: number } {
  const s = ensureInit();
  const task = s.dailyTask;
  if (!task || task.completed) return { completed: false, reward: {}, xpGained: 0 };
  if (task.progress < task.required) return { completed: false, reward: {}, xpGained: 0 };
  task.completed = true;
  const reward = { ...task.reward };
  for (const [res, amt] of Object.entries(reward)) {
    const rt = getResourceType(res);
    if (rt) s.resources[rt] = clamp(s.resources[rt] + amt, 0, s.storage[rt]);
  }
  addXP(s, task.xpReward);
  return { completed: true, reward, xpGained: task.xpReward };
}

export function ibGetDailyBonus(): ResourceType | null {
  return ensureInit().dailyBonusResource;
}

export function ibGetWeeklyCompetition(): WeeklyCompetition | null {
  return ensureInit().weeklyCompetition;
}

export function ibGetStreak(): number {
  return ensureInit().streak;
}

function generateDailyTask(s: IslandBuilderState, daySeed: number): DailyTask {
  const rng = seededRandom(daySeed);
  const template = DAILY_TASK_TEMPLATES[Math.floor(rng() * DAILY_TASK_TEMPLATES.length)];
  return {
    ...template,
    id: `daily_${daySeed}`,
    progress: 0,
    completed: false,
  };
}

function generateDailyBonus(daySeed: number): ResourceType {
  const rng = seededRandom(daySeed + 777);
  return RESOURCE_TYPES[Math.floor(rng() * RESOURCE_TYPES.length)];
}

function generateWeeklyCompetition(s: IslandBuilderState, weekSeed: number): WeeklyCompetition {
  const rng = seededRandom(weekSeed);
  const categories: WeeklyCompetition["category"][] = ["buildings", "resources", "population", "rating"];
  const category = categories[Math.floor(rng() * categories.length)];
  let playerScore = 0;
  switch (category) {
    case "buildings": playerScore = s.buildings.length; break;
    case "resources": playerScore = RESOURCE_TYPES.reduce((sum, r) => sum + s.resources[r], 0); break;
    case "population": playerScore = s.population; break;
    case "rating": playerScore = Math.round(s.islandRating * 20); break;
  }
  const shuffled = [...AI_ISLAND_NAMES].sort(() => rng() - 0.5).slice(0, 4);
  const aiScores = shuffled.map((name) => ({
    name,
    score: Math.floor(playerScore * (0.5 + rng() * 1.2)),
  }));
  return {
    weekId: `week_${weekSeed}`,
    category,
    playerScore,
    aiScores,
    reward: { gold: 30, gems: 3 },
    resolved: false,
  };
}

function advanceDay(s: IslandBuilderState): void {
  const today = new Date().toISOString().slice(0, 10);
  if (s.lastTickDate === today) return;

  if (s.lastTickDate !== "") {
    const lastDate = new Date(s.lastTickDate);
    const nowDate = new Date(today);
    const diffDays = Math.floor((nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      s.streak += 1;
    } else if (diffDays > 1) {
      s.streak = 0;
    }
  } else {
    s.streak = 1;
  }

  const daySeed = simpleHash(today);
  s.dailyTask = generateDailyTask(s, daySeed);
  s.dailyBonusResource = generateDailyBonus(daySeed);
  s.lastTickDate = today;

  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  s.weeklyCompetition = generateWeeklyCompetition(s, weekNum);

  recalcPopulation(s);
  if (s.population < s.maxPopulation) {
    const growth = Math.max(1, Math.floor((s.maxPopulation - s.population) * 0.1 * (s.happiness / 100)));
    s.population = Math.min(s.maxPopulation, s.population + growth);
  }
}

// ---------------------------------------------------------------------------
// Simulation tick
// ---------------------------------------------------------------------------

export function ibTick(): {
  production: Partial<Record<ResourceType, number>>;
  event: IslandEvent | null;
  visitorsArrived: number;
  dayAdvanced: boolean;
} {
  const s = ensureInit();
  const today = new Date().toISOString().slice(0, 10);
  const dayAdvanced = s.lastTickDate !== today;
  advanceDay(s);
  s.ticksSinceStart += 1;

  updateWeather(s);
  updateSeason(s);

  const production = ibGetProduction();
  for (const [res, amt] of Object.entries(production)) {
    const rt = getResourceType(res);
    if (rt) {
      const gained = Math.round(amt * 10) / 10;
      s.resources[rt] = clamp(s.resources[rt] + gained, 0, s.storage[rt]);
      s.totalResourcesProduced += gained;
    }
  }

  const prevVisitorCount = s.visitors.length;
  processVisitors(s);
  const visitorsArrived = s.visitors.length - prevVisitorCount;

  const { event } = ibProcessEvent();

  if (s.dailyTask && !s.dailyTask.completed) {
    const task = s.dailyTask;
    if (task.targetType === "resource" && task.targetId) {
      const rt = getResourceType(task.targetId);
      if (rt) task.progress = s.resources[rt];
    } else if (task.targetType === "population") {
      task.progress = s.population;
    }
  }

  if (s.weeklyCompetition && !s.weeklyCompetition.resolved) {
    const wc = s.weeklyCompetition;
    switch (wc.category) {
      case "buildings": wc.playerScore = s.buildings.length; break;
      case "resources": wc.playerScore = RESOURCE_TYPES.reduce((sum, r) => sum + s.resources[r], 0); break;
      case "population": wc.playerScore = s.population; break;
      case "rating": wc.playerScore = Math.round(s.islandRating * 20); break;
    }
  }

  recalcRating(s);
  checkAllAchievements(s);

  return { production, event, visitorsArrived, dayAdvanced };
}

// ---------------------------------------------------------------------------
// UI Helpers
// ---------------------------------------------------------------------------

export function ibGetIslandOverview(): {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  rating: number;
  ratingStars: string;
  population: number;
  maxPopulation: number;
  happiness: number;
  weather: WeatherType;
  weatherIcon: string;
  season: SeasonType;
  seasonIcon: string;
  ticksSinceStart: number;
  streak: number;
} {
  const s = ensureInit();
  const weatherIcons: Record<WeatherType, string> = {
    sunny: "☀️", rainy: "🌧️", stormy: "⛈️", foggy: "🌫️", snowy: "❄️",
  };
  const seasonIcons: Record<SeasonType, string> = {
    spring: "🌸", summer: "☀️", fall: "🍂", winter: "❄️",
  };
  const starCount = Math.round(s.islandRating);
  const ratingStars = "⭐".repeat(starCount) + "☆".repeat(5 - starCount);
  return {
    name: s.islandName,
    level: s.islandLevel,
    xp: s.islandXP,
    xpToNext: s.xpToNextLevel,
    rating: Math.round(s.islandRating * 10) / 10,
    ratingStars,
    population: s.population,
    maxPopulation: s.maxPopulation,
    happiness: s.happiness,
    weather: s.weather,
    weatherIcon: weatherIcons[s.weather],
    season: s.season,
    seasonIcon: seasonIcons[s.season],
    ticksSinceStart: s.ticksSinceStart,
    streak: s.streak,
  };
}

export function ibGetIslandDashboard(): {
  overview: ReturnType<typeof ibGetIslandOverview>;
  resources: ReturnType<typeof ibGetResources>;
  production: Partial<Record<ResourceType, number>>;
  activeVisitors: ActiveVisitor[];
  activeEvent: IslandEvent | null;
  dailyTask: DailyTask | null;
  buildingCount: number;
  unlockedAchievements: number;
  totalAchievements: number;
} {
  const s = ensureInit();
  return {
    overview: ibGetIslandOverview(),
    resources: ibGetResources(),
    production: ibGetProduction(),
    activeVisitors: s.visitors,
    activeEvent: s.activeEvent,
    dailyTask: s.dailyTask,
    buildingCount: s.buildings.length,
    unlockedAchievements: s.completedAchievementIds.length,
    totalAchievements: ACHIEVEMENT_DEFS.length,
  };
}

export function ibGetStatsGrid(): Array<{
  label: string;
  value: string;
  icon: string;
  subtext: string;
}> {
  const s = ensureInit();
  return [
    {
      label: "Level",
      value: `${s.islandLevel}`,
      icon: "⭐",
      subtext: `${s.islandXP}/${s.xpToNextLevel} XP`,
    },
    {
      label: "Population",
      value: `${s.population}/${s.maxPopulation}`,
      icon: "👥",
      subtext: `${s.happiness}% happiness`,
    },
    {
      label: "Rating",
      value: `${Math.round(s.islandRating * 10) / 10} ⭐`,
      icon: "🏝️",
      subtext: `${"⭐".repeat(Math.round(s.islandRating))}${"☆".repeat(5 - Math.round(s.islandRating))}`,
    },
    {
      label: "Buildings",
      value: `${s.buildings.length}`,
      icon: "🏗️",
      subtext: `${s.totalBuildingsBuilt} total built`,
    },
  ];
}

export function ibGetBuildingCard(buildingId: string): {
  name: string;
  category: string;
  categoryIcon: string;
  icon: string;
  description: string;
  level: number;
  production: Partial<Record<ResourceType, number>>;
  cost: Partial<Record<ResourceType, number>>;
  unlockLevel: number;
  populationProvided: number;
  happinessBonus: number;
  militaryPower: number;
  canBuild: boolean;
} | null {
  const s = ensureInit();
  const def = getBuildingDef(buildingId);
  if (!def) return null;
  const placed = s.buildings.find((b) => b.buildingId === buildingId);
  const categoryIcons: Record<BuildingCategory, string> = {
    resource: "🪓", production: "🔧", residential: "🏠", commercial: "💰",
    military: "⚔️", culture: "🎭", utility: "🛠️", special: "✨",
  };
  const levelMultiplier = placed ? 1 + (placed.level - 1) * 0.25 : 1;
  const production: Partial<Record<ResourceType, number>> = {};
  for (const [res, amt] of Object.entries(def.production)) {
    const rt = getResourceType(res);
    if (rt) production[rt] = Math.round(amt * levelMultiplier * 10) / 10;
  }
  return {
    name: def.name,
    category: def.category,
    categoryIcon: categoryIcons[def.category],
    icon: def.icon,
    description: def.description,
    level: placed?.level ?? 0,
    production,
    cost: placed ? ibGetBuildingCost(buildingId, placed.level + 1) : def.cost,
    unlockLevel: def.unlockLevel,
    populationProvided: def.populationProvided,
    happinessBonus: def.happinessBonus,
    militaryPower: def.militaryPower,
    canBuild: def.unlockLevel <= s.islandLevel,
  };
}

export function ibGetResourceCard(type: ResourceType): {
  name: string;
  icon: string;
  amount: number;
  production: number;
  storage: number;
  storagePercent: number;
  barColor: string;
} {
  const s = ensureInit();
  const prod = ibGetProduction();
  const barColors: Record<ResourceType, string> = {
    wood: "#8B4513", stone: "#808080", gold: "#FFD700", food: "#32CD32",
    iron: "#708090", crystal: "#9966FF", herbs: "#228B22", gems: "#FF69B4",
  };
  const nameMap: Record<ResourceType, string> = {
    wood: "Wood", stone: "Stone", gold: "Gold", food: "Food",
    iron: "Iron", crystal: "Crystal", herbs: "Herbs", gems: "Gems",
  };
  return {
    name: nameMap[type],
    icon: RESOURCE_ICONS[type],
    amount: s.resources[type],
    production: Math.round((prod[type] ?? 0) * 10) / 10,
    storage: s.storage[type],
    storagePercent: Math.round((s.resources[type] / s.storage[type]) * 100),
    barColor: barColors[type],
  };
}

export function ibGetTileCard(index: number): {
  index: number;
  terrain: TerrainType;
  terrainIcon: string;
  improvement: TileImprovement;
  improvementIcon: string;
  building: PlacedBuilding | null;
  buildingDef: BuildingDef | null;
  coordinates: { row: number; col: number };
  canBuildHere: boolean;
  resourceBonus: Partial<Record<ResourceType, number>>;
} | null {
  const s = ensureInit();
  if (index < 0 || index >= TOTAL_TILES) return null;
  const tile = s.grid[index];
  const improvementIcons: Record<TileImprovement, string> = {
    none: "❌", cleared: "🧹", leveled: "📏", irrigated: "💧", enriched: "✨",
  };
  const buildingDef = tile.building ? getBuildingDef(tile.building.buildingId) ?? null : null;
  const compatibleCategories = TERRAIN_BUILDING_COMPATIBILITY[tile.terrain];
  return {
    index: tile.index,
    terrain: tile.terrain,
    terrainIcon: TERRAIN_ICONS[tile.terrain],
    improvement: tile.improvement,
    improvementIcon: improvementIcons[tile.improvement],
    building: tile.building,
    buildingDef,
    coordinates: { row: Math.floor(index / GRID_SIZE), col: index % GRID_SIZE },
    canBuildHere: tile.building === null,
    resourceBonus: TERRAIN_RESOURCE_BONUS[tile.terrain],
  };
}

export function ibGetVisitorCard(name: string): {
  name: string;
  icon: string;
  frequency: number;
  preferredCategory: string;
  tipRange: [number, number];
  giftResources: Partial<Record<ResourceType, number>>;
  isCurrentlyVisiting: boolean;
  currentSatisfaction: number | null;
  currentTip: number | null;
} | null {
  const s = ensureInit();
  const def = VISITORS.find((v) => v.name === name);
  if (!def) return null;
  const active = s.visitors.find((v) => v.name === name);
  return {
    name: def.name,
    icon: def.icon,
    frequency: def.frequency,
    preferredCategory: def.preferredCategory,
    tipRange: def.tipRange,
    giftResources: def.giftResources,
    isCurrentlyVisiting: !!active,
    currentSatisfaction: active?.satisfaction ?? null,
    currentTip: active?.tipAmount ?? null,
  };
}

export function ibGetEventCard(): {
  hasEvent: boolean;
  id: string;
  name: string;
  icon: string;
  description: string;
  effectType: string;
  effectValue: Partial<Record<ResourceType, number>>;
  remainingTicks: number;
} | null {
  const s = ensureInit();
  const evt = s.activeEvent;
  if (!evt) return null;
  return {
    hasEvent: true,
    id: evt.id,
    name: evt.name,
    icon: evt.icon,
    description: evt.description,
    effectType: evt.effectType,
    effectValue: evt.effectValue,
    remainingTicks: evt.durationTicks - (s.ticksSinceStart - evt.startTick),
  };
}

export function ibGetDailyCard(): {
  hasTask: boolean;
  taskDescription: string;
  taskProgress: number;
  taskRequired: number;
  taskCompleted: boolean;
  taskReward: Partial<Record<ResourceType, number>>;
  taskXpReward: number;
  bonusResource: ResourceType | null;
  bonusIcon: string | null;
  streak: number;
  streakIcon: string;
  competition: {
    active: boolean;
    category: string;
    playerRank: number;
    totalParticipants: number;
    playerScore: number;
    topScore: number;
  } | null;
} {
  const s = ensureInit();
  const task = s.dailyTask;
  const streakIcon = s.streak >= 30 ? "🏆" : s.streak >= 7 ? "🔥" : s.streak >= 3 ? "✨" : "📅";
  let competition: {
    active: boolean;
    category: string;
    playerRank: number;
    totalParticipants: number;
    playerScore: number;
    topScore: number;
  } | null = null;
  if (s.weeklyCompetition) {
    const wc = s.weeklyCompetition;
    const allScores = [...wc.aiScores.map((a) => a.score), wc.playerScore].sort((a, b) => b - a);
    const rank = allScores.indexOf(wc.playerScore) + 1;
    competition = {
      active: true,
      category: wc.category,
      playerRank: rank,
      totalParticipants: allScores.length,
      playerScore: wc.playerScore,
      topScore: allScores[0],
    };
  }
  return {
    hasTask: !!task,
    taskDescription: task?.description ?? "No task today",
    taskProgress: task?.progress ?? 0,
    taskRequired: task?.required ?? 0,
    taskCompleted: task?.completed ?? false,
    taskReward: task?.reward ?? {},
    taskXpReward: task?.xpReward ?? 0,
    bonusResource: s.dailyBonusResource,
    bonusIcon: s.dailyBonusResource ? RESOURCE_ICONS[s.dailyBonusResource] : null,
    streak: s.streak,
    streakIcon,
    competition,
  };
}

export function ibGetAchievements(): Achievement[] {
  return ensureInit().achievements;
}

export function ibCheckAchievements(): Achievement[] {
  const s = ensureInit();
  checkAllAchievements(s);
  return s.achievements;
}

export function ibGetProductionChart(): Array<{
  resource: ResourceType;
  icon: string;
  name: string;
  productionPerTick: number;
  amount: number;
  storage: number;
  percentOfStorage: number;
}> {
  const s = ensureInit();
  const prod = ibGetProduction();
  const nameMap: Record<ResourceType, string> = {
    wood: "Wood", stone: "Stone", gold: "Gold", food: "Food",
    iron: "Iron", crystal: "Crystal", herbs: "Herbs", gems: "Gems",
  };
  return RESOURCE_TYPES.map((rt) => ({
    resource: rt,
    icon: RESOURCE_ICONS[rt],
    name: nameMap[rt],
    productionPerTick: Math.round((prod[rt] ?? 0) * 100) / 100,
    amount: s.resources[rt],
    storage: s.storage[rt],
    percentOfStorage: Math.round((s.resources[rt] / s.storage[rt]) * 100),
  }));
}

export function ibGetGridOverview(): Array<{
  index: number;
  row: number;
  col: number;
  terrain: TerrainType;
  terrainIcon: string;
  improvement: TileImprovement;
  buildingId: string | null;
  buildingIcon: string | null;
  buildingName: string | null;
  buildingLevel: number | null;
  hasBuilding: boolean;
}> {
  const s = ensureInit();
  return s.grid.map((tile) => {
    const def = tile.building ? getBuildingDef(tile.building.buildingId) : null;
    return {
      index: tile.index,
      row: Math.floor(tile.index / GRID_SIZE),
      col: tile.index % GRID_SIZE,
      terrain: tile.terrain,
      terrainIcon: TERRAIN_ICONS[tile.terrain],
      improvement: tile.improvement,
      buildingId: tile.building?.buildingId ?? null,
      buildingIcon: def?.icon ?? null,
      buildingName: def?.name ?? null,
      buildingLevel: tile.building?.level ?? null,
      hasBuilding: tile.building !== null,
    };
  });
}

// ---------------------------------------------------------------------------
// Additional utility exports
// ---------------------------------------------------------------------------

export function ibGetTerrainTypes(): TerrainType[] {
  return TERRAIN_TYPES;
}

export function ibGetTerrainIcon(terrain: TerrainType): string {
  return TERRAIN_ICONS[terrain];
}

export function ibGetResourceTypes(): ResourceType[] {
  return RESOURCE_TYPES;
}

export function ibGetResourceIcon(type: ResourceType): string {
  return RESOURCE_ICONS[type];
}

export function ibGetBuildingCategories(): BuildingCategory[] {
  return ["resource", "production", "residential", "commercial", "military", "culture", "utility", "special"];
}

export function ibGetBuildingsByCategory(category: BuildingCategory): BuildingDef[] {
  return BUILDINGS.filter((b) => b.category === category);
}

export function ibGetCompatibleBuildings(terrain: TerrainType): BuildingDef[] {
  const s = ensureInit();
  const compatible = TERRAIN_BUILDING_COMPATIBILITY[terrain];
  return BUILDINGS.filter(
    (b) => compatible.includes(b.category) && b.unlockLevel <= s.islandLevel
  );
}

export function ibGetWeatherTypes(): WeatherType[] {
  return ["sunny", "rainy", "stormy", "foggy", "snowy"];
}

export function ibGetSeasons(): SeasonType[] {
  return ["spring", "summer", "fall", "winter"];
}

export function ibGetEventsList(): Array<{ id: string; name: string; icon: string; description: string }> {
  return EVENTS.map((e) => ({ id: e.id, name: e.name, icon: e.icon, description: e.description }));
}

export function ibGetImprovementCost(improvement: TileImprovement): Partial<Record<ResourceType, number>> {
  const costs: Record<TileImprovement, Partial<Record<ResourceType, number>>> = {
    none: {},
    cleared: { wood: 5 },
    leveled: { stone: 8, gold: 3 },
    irrigated: { stone: 5, wood: 5 },
    enriched: { gold: 10, herbs: 5 },
  };
  return costs[improvement] ?? {};
}

export function ibCanImproveTile(index: number): { canImprove: boolean; nextImprovement: TileImprovement; cost: Partial<Record<ResourceType, number>> } {
  const s = ensureInit();
  if (index < 0 || index >= TOTAL_TILES) return { canImprove: false, nextImprovement: "none", cost: {} };
  const tile = s.grid[index];
  const order: TileImprovement[] = ["none", "cleared", "leveled", "irrigated", "enriched"];
  const currentIdx = order.indexOf(tile.improvement);
  if (currentIdx >= order.length - 1) return { canImprove: false, nextImprovement: "none", cost: {} };
  const next = order[currentIdx + 1];
  return { canImprove: true, nextImprovement: next, cost: ibGetImprovementCost(next) };
}

export function ibGetTotalWorkers(): number {
  const s = ensureInit();
  return Object.values(s.workers).reduce((sum, w) => sum + w, 0);
}

export function ibGetAvailableWorkers(): number {
  const s = ensureInit();
  const total = Object.values(s.workers).reduce((sum, w) => sum + w, 0);
  return s.population - total;
}

export function ibGetTotalMilitaryPower(): number {
  const s = ensureInit();
  return s.buildings.reduce((sum, b) => {
    const def = getBuildingDef(b.buildingId);
    return sum + (def?.militaryPower ?? 0) * b.level;
  }, 0);
}

export function ibGetBuildingsCount(): number {
  return ensureInit().buildings.length;
}

export function ibGetTotalBuildingsEverBuilt(): number {
  return ensureInit().totalBuildingsBuilt;
}

export function ibGetTotalVisitorsEver(): number {
  return ensureInit().totalVisitors;
}

export function ibGetCategoryIcon(category: BuildingCategory): string {
  const icons: Record<BuildingCategory, string> = {
    resource: "🪓", production: "🔧", residential: "🏠", commercial: "💰",
    military: "⚔️", culture: "🎭", utility: "🛠️", special: "✨",
  };
  return icons[category];
}
