// =============================================================================
// Fishing Harbor Wire — Word Snake Game Module
// =============================================================================
// A production-quality, SSR-safe game module for managing a virtual fishing
// harbor. Uses lazy initialization (ensureInit) so no browser APIs are touched
// at module scope. Every exported function carries the `fh` prefix.
// =============================================================================

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/** Fish rarity tiers — determines catch difficulty and coin value. */
export type FHRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

/** All 8 fishing locations in the harbor system. */
export type FHLocationName =
  | 'Crystal Pier'
  | 'Coral Reef'
  | 'Deep Trench'
  | 'Stormy Bay'
  | 'Mystic Lake'
  | 'Frozen Fjord'
  | 'Volcanic Cove'
  | 'Abyssal Depths';

/** Bait identifiers used by the bait system. */
export type FHBaitId = 'worm' | 'shrimp' | 'lure' | 'golden' | 'legendary';

/** Rod identifiers — each rod type has unique bonuses. */
export type FHRodId = 'bamboo' | 'oak' | 'steel' | 'carbon' | 'titanium';

/** Weather conditions that affect catch rates. */
export type FHWeather =
  | 'Clear'
  | 'Cloudy'
  | 'Rainy'
  | 'Stormy'
  | 'Foggy'
  | 'Sunny'
  | 'Windy'
  | 'Snowy'
  | 'Full Moon'
  | 'Blood Moon';

/** Water conditions that modify fishing difficulty. */
export type FHWaterCondition =
  | 'Calm'
  | 'Choppy'
  | 'Rough'
  | 'Turbulent'
  | 'Crystal Clear'
  | 'Murky'
  | 'Tidal'
  | 'Frozen';

/** The current phase of an active fishing attempt. */
export type FHFishingPhase = 'idle' | 'casting' | 'waiting' | 'biting' | 'reeling' | 'caught' | 'escaped';

/** A single fish species in the harbor ecosystem. */
export interface FHFishSpecies {
  /** Unique identifier (e.g. 'fh_bluegill'). */
  id: string;
  /** Display name (e.g. 'Bluegill Sunfish'). */
  name: string;
  /** Emoji icon for display. */
  emoji: string;
  /** Rarity tier — affects catch probability and coin value. */
  rarity: FHRarity;
  /** Minimum weight in kilograms when caught. */
  minWeight: number;
  /** Maximum weight in kilograms when caught. */
  maxWeight: number;
  /** Difficulty 1–10 — higher means harder to reel in. */
  difficulty: number;
  /** Base coin value when sold. */
  value: number;
  /** Which location(s) this species inhabits. */
  location: FHLocationName;
  /** Flavor text describing the species. */
  description: string;
}

/** A fishing location with unlock requirements. */
export interface FHLocation {
  /** Location name used as key. */
  name: FHLocationName;
  /** Emoji icon. */
  emoji: string;
  /** Player level required to unlock this location. */
  requiredLevel: number;
  /** Brief description of the location. */
  description: string;
  /** Catch rate modifier (1.0 = neutral). */
  catchModifier: number;
  /** IDs of fish species available here. */
  fishPool: string[];
}

/** A bait type with purchase info and modifiers. */
export interface FHBait {
  /** Bait identifier. */
  id: FHBaitId;
  /** Display name. */
  name: string;
  /** Emoji icon. */
  emoji: string;
  /** Cost in coins per unit. */
  cost: number;
  /** Catch rate multiplier (e.g. 1.2 = 20% boost). */
  catchModifier: number;
  /** Rarity bonus — increases chance of rarer fish. */
  rarityBonus: number;
  /** Brief description. */
  description: string;
}

/** A rod type with level unlock and stat bonuses. */
export interface FHRod {
  /** Rod identifier. */
  id: FHRodId;
  /** Display name. */
  name: string;
  /** Emoji icon. */
  emoji: string;
  /** Player level required to equip. */
  requiredLevel: number;
  /** Catch rate bonus. */
  catchBonus: number;
  /** Reduces fish difficulty for reeling. */
  difficultyReduction: number;
  /** Bonus to coin value of caught fish. */
  valueBonus: number;
  /** Upgrade cost (coins) to unlock this rod. */
  unlockCost: number;
  /** Description. */
  description: string;
}

/** Weather condition with effect data. */
export interface FHWeatherData {
  /** Weather name. */
  name: FHWeather;
  /** Emoji icon. */
  emoji: string;
  /** Catch rate modifier. */
  catchModifier: number;
  /** Rarity modifier — can boost or reduce rare fish chance. */
  rarityModifier: number;
  /** Description. */
  description: string;
}

/** Water condition with modifier data. */
export interface FHWaterConditionData {
  /** Water condition name. */
  name: FHWaterCondition;
  /** Emoji icon. */
  emoji: string;
  /** Catch rate modifier. */
  catchModifier: number;
  /** Difficulty modifier. */
  difficultyModifier: number;
  /** Description. */
  description: string;
}

/** A single caught fish in the inventory. */
export interface FHCaughtFish {
  /** Species ID. */
  speciesId: string;
  /** Actual weight caught (kg). */
  weight: number;
  /** Timestamp when caught (tick). */
  caughtAt: number;
  /** Which location it was caught at. */
  caughtLocation: FHLocationName;
  /** Which bait was used. */
  baitUsed: FHBaitId;
  /** Which rod was used. */
  rodUsed: FHRodId;
}

/** An entry in the fish encyclopedia. */
export interface FHEncyclopediaEntry {
  /** Species ID. */
  speciesId: string;
  /** Whether the species has been discovered. */
  discovered: boolean;
  /** Total times this species has been caught. */
  catchCount: number;
  /** Best weight caught for this species. */
  bestWeight: number;
  /** Total coins earned from this species. */
  totalValue: number;
}

/** Achievement definition and state. */
export interface FHAchievement {
  /** Unique achievement ID. */
  id: string;
  /** Display name. */
  name: string;
  /** Achievement description. */
  description: string;
  /** Emoji icon. */
  icon: string;
  /** Condition expression for checking completion. */
  condition: string;
  /** Whether this achievement has been unlocked. */
  unlocked: boolean;
  /** Tick when it was unlocked (0 if not yet). */
  unlockedAt: number;
}

/** Daily challenge data. */
export interface FHDailyChallenge {
  /** Target species ID for today's challenge. */
  targetSpeciesId: string;
  /** Target weight to beat (kg). */
  targetWeight: number;
  /** Bonus coin multiplier on completion. */
  bonusMultiplier: number;
  /** Whether the challenge has been completed today. */
  completed: boolean;
  /** Date seed for the challenge (changes daily). */
  dateSeed: number;
  /** Optional bonus XP reward. */
  bonusXP: number;
}

/** A single fishing run result stored in history. */
export interface FHRunHistoryEntry {
  /** Species ID of the caught fish (null if escaped). */
  speciesId: string | null;
  /** Fish weight if caught (null if escaped). */
  weight: number | null;
  /** Coins earned from this run. */
  coinsEarned: number;
  /** XP earned from this run. */
  xpEarned: number;
  /** Location where fished. */
  location: FHLocationName;
  /** Weather during the run. */
  weather: FHWeather;
  /** Water condition during the run. */
  waterCondition: FHWaterCondition;
  /** Bait used. */
  baitUsed: FHBaitId;
  /** Rod used. */
  rodUsed: FHRodId;
  /** Tick when the run occurred. */
  timestamp: number;
  /** Whether the fish was successfully caught. */
  success: boolean;
}

/** The current fishing attempt state. */
export interface FHCurrentCast {
  /** What phase the fishing attempt is in. */
  phase: FHFishingPhase;
  /** The fish species that bit (null until biting phase). */
  targetFish: FHFishSpecies | null;
  /** Calculated weight of the target fish. */
  targetWeight: number;
  /** Wait timer ticks remaining before a bite. */
  waitTicks: number;
  /** Reel window — how many ticks the player has to reel in. */
  reelWindow: number;
  /** Reel timer ticks remaining. */
  reelTimer: number;
  /** Tick when the cast was made. */
  castTick: number;
}

/** A fish displayed in the aquarium. */
export interface FHAquariumFish {
  /** Species ID. */
  speciesId: string;
  /** Weight of the displayed fish. */
  weight: number;
  /** Position index in the aquarium (0–11). */
  slot: number;
}

/** Overall player stats snapshot. */
export interface FHStats {
  /** Total fish caught. */
  totalCatch: number;
  /** Total rare (Rare+) fish caught. */
  rareCatch: number;
  /** Current consecutive catch streak. */
  streak: number;
  /** Best consecutive catch streak. */
  bestStreak: number;
  /** Total coins earned from fishing. */
  totalCoinsEarned: number;
  /** Total XP earned from fishing. */
  totalXPEarned: number;
  /** Total number of fishing runs (including escapes). */
  totalRuns: number;
  /** Unique species discovered count. */
  speciesDiscovered: number;
  /** Heaviest fish caught (kg). */
  heaviestCatch: number;
  /** Most valuable single catch (coins). */
  mostValuableCatch: number;
}

/** Hint data for the current fishing context. */
export interface FHHint {
  /** Hint text. */
  message: string;
  /** Hint type (tip/warning/encouragement). */
  type: 'tip' | 'warning' | 'encouragement';
  /** Emoji icon. */
  icon: string;
}

/** Main state interface for the Fishing Harbor module. */
export interface FishingHarborState {
  /** Current player level (1–40). */
  level: number;
  /** Current XP accumulated within this level. */
  xp: number;
  /** Current coin balance. */
  coins: number;
  /** Total number of fish caught. */
  totalCatch: number;
  /** Total rare (Rare+) catches. */
  rareCatch: number;
  /** Current consecutive catch streak. */
  streak: number;
  /** Best consecutive catch streak achieved. */
  bestStreak: number;
  /** Currently equipped bait. */
  currentBait: FHBaitId;
  /** Currently equipped rod. */
  currentRod: FHRodId;
  /** Currently selected fishing location. */
  currentLocation: FHLocationName;
  /** Fish inventory (max 50). */
  inventory: FHCaughtFish[];
  /** Achievement states (15). */
  achievements: FHAchievement[];
  /** Daily challenge data. */
  dailyChallenge: FHDailyChallenge | null;
  /** Fishing run history (last 100). */
  runHistory: FHRunHistoryEntry[];
  /** Current active cast state. */
  currentCast: FHCurrentCast;
  /** Encyclopedia entries for all species. */
  encyclopedia: FHEncyclopediaEntry[];
  /** Aquarium display (up to 12 fish). */
  aquarium: FHAquariumFish[];
  /** Owned bait quantities. */
  baitStock: Record<FHBaitId, number>;
  /** Unlocked rod IDs. */
  unlockedRods: FHRodId[];
  /** Current weather index into FH_WEATHERS array. */
  weatherIndex: number;
  /** Current water condition index into FH_WATER_CONDITIONS array. */
  waterConditionIndex: number;
  /** Tick counter for time-based mechanics. */
  tick: number;
  /** Last weather change tick. */
  lastWeatherChangeTick: number;
  /** Last daily challenge date seed. */
  lastDailyDateSeed: number;
  /** Total coins earned (lifetime). */
  totalCoinsEarned: number;
  /** Total XP earned (lifetime). */
  totalXPEarned: number;
  /** Total fishing runs count. */
  totalRuns: number;
}

// ---------------------------------------------------------------------------
// Constants — Rarity modifiers, level XP table
// ---------------------------------------------------------------------------

const RARITY_CATCH_WEIGHT: Record<FHRarity, number> = {
  Common: 50,
  Uncommon: 25,
  Rare: 14,
  Epic: 8,
  Legendary: 3,
};

const RARITY_XP_BONUS: Record<FHRarity, number> = {
  Common: 5,
  Uncommon: 15,
  Rare: 35,
  Epic: 80,
  Legendary: 200,
};

const RARITY_COIN_MULTIPLIER: Record<FHRarity, number> = {
  Common: 1.0,
  Uncommon: 1.5,
  Rare: 2.5,
  Epic: 5.0,
  Legendary: 12.0,
};

const RARITY_ORDER: FHRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

const RARITY_GLOW_COLORS: Record<FHRarity, string> = {
  Common: '#9CA3AF',
  Uncommon: '#22C55E',
  Rare: '#3B82F6',
  Epic: '#A855F7',
  Legendary: '#F97316',
};

const MAX_LEVEL = 40;
const MAX_INVENTORY = 50;
const MAX_AQUARIUM = 12;
const MAX_RUN_HISTORY = 100;

/** XP required to advance from one level to the next. */
function xpForLevel(level: number): number {
  return Math.floor(80 * Math.pow(1.12, level - 1));
}

/** Total XP needed to reach a given level from level 1. */
function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

// ---------------------------------------------------------------------------
// Fish Species Database (35)
// ---------------------------------------------------------------------------

const FH_FISH: FHFishSpecies[] = [
  // ---- Crystal Pier (5) ----
  { id: 'fh_bluegill', name: 'Bluegill Sunfish', emoji: '🐟', rarity: 'Common', minWeight: 0.2, maxWeight: 1.5, difficulty: 1, value: 5, location: 'Crystal Pier', description: 'A small but feisty freshwater staple. Perfect for beginners.' },
  { id: 'fh_perch', name: 'Yellow Perch', emoji: '🐠', rarity: 'Common', minWeight: 0.3, maxWeight: 2.0, difficulty: 2, value: 8, location: 'Crystal Pier', description: 'Striped and golden, a favorite of casual anglers.' },
  { id: 'fh_trout', name: 'Rainbow Trout', emoji: '🐟', rarity: 'Uncommon', minWeight: 1.0, maxWeight: 5.0, difficulty: 3, value: 20, location: 'Crystal Pier', description: 'Iridescent scales shimmer like a prism in sunlight.' },
  { id: 'fh_catfish', name: 'Whiskered Catfish', emoji: '🐡', rarity: 'Uncommon', minWeight: 2.0, maxWeight: 12.0, difficulty: 4, value: 30, location: 'Crystal Pier', description: 'A bottom-dweller with impressive whiskers and a powerful fight.' },
  { id: 'fh_pike', name: 'Crystal Pike', emoji: '🦈', rarity: 'Rare', minWeight: 3.0, maxWeight: 18.0, difficulty: 6, value: 60, location: 'Crystal Pier', description: 'An apex predator of the pier waters. Aggressive and cunning.' },

  // ---- Coral Reef (5) ----
  { id: 'fh_clownfish', name: 'Coral Clownfish', emoji: '🐠', rarity: 'Common', minWeight: 0.1, maxWeight: 0.5, difficulty: 1, value: 6, location: 'Coral Reef', description: 'Bright orange with white stripes. Lives among anemone tentacles.' },
  { id: 'fh_angelfish', name: 'Regal Angelfish', emoji: '🐟', rarity: 'Uncommon', minWeight: 0.5, maxWeight: 3.0, difficulty: 3, value: 25, location: 'Coral Reef', description: 'Graceful fins and vivid colors make it a reef jewel.' },
  { id: 'fh_parrotfish', name: 'Giant Parrotfish', emoji: '🐠', rarity: 'Rare', minWeight: 2.0, maxWeight: 15.0, difficulty: 5, value: 55, location: 'Coral Reef', description: 'Chews coral into sand. Its beak can crush stone.' },
  { id: 'fh_moray', name: 'Reef Moray Eel', emoji: '🐍', rarity: 'Rare', minWeight: 5.0, maxWeight: 25.0, difficulty: 7, value: 75, location: 'Coral Reef', description: 'Lurks in coral crevices with jaws full of needle teeth.' },
  { id: 'fh_manta', name: 'Golden Manta Ray', emoji: '🦈', rarity: 'Epic', minWeight: 30.0, maxWeight: 120.0, difficulty: 8, value: 200, location: 'Coral Reef', description: 'A massive golden ray that patrols reef currents at dusk.' },

  // ---- Deep Trench (5) ----
  { id: 'fh_lanternfish', name: 'Abyss Lanternfish', emoji: '🐟', rarity: 'Uncommon', minWeight: 0.05, maxWeight: 0.5, difficulty: 2, value: 18, location: 'Deep Trench', description: 'Bioluminescent lure dangles from its forehead like a lantern.' },
  { id: 'fh_gulper', name: 'Gulper Eel', emoji: '🐍', rarity: 'Rare', minWeight: 1.0, maxWeight: 8.0, difficulty: 5, value: 50, location: 'Deep Trench', description: 'Enormous expandable jaws can swallow prey larger than itself.' },
  { id: 'fh_hatchet', name: 'Iron Hatchetfish', emoji: '🐟', rarity: 'Rare', minWeight: 0.1, maxWeight: 1.0, difficulty: 6, value: 65, location: 'Deep Trench', description: 'Scales of living metal reflect light in shimmering patterns.' },
  { id: 'fh_viperfish', name: 'Fang Viperfish', emoji: '🦷', rarity: 'Epic', minWeight: 0.5, maxWeight: 4.0, difficulty: 8, value: 150, location: 'Deep Trench', description: 'Teeth so long they cannot close their mouth. Nightmarish hunter.' },
  { id: 'fh_leviathan', name: 'Trench Leviathan', emoji: '🐉', rarity: 'Legendary', minWeight: 50.0, maxWeight: 500.0, difficulty: 10, value: 800, location: 'Deep Trench', description: 'An ancient deep-sea behemoth whispered about in maritime legends.' },

  // ---- Stormy Bay (4) ----
  { id: 'fh_bass', name: 'Storm Striped Bass', emoji: '🐟', rarity: 'Common', minWeight: 1.0, maxWeight: 8.0, difficulty: 3, value: 12, location: 'Stormy Bay', description: 'Thrives in rough surf. Feeds during lightning storms.' },
  { id: 'fh_barracuda', name: 'Silver Barracuda', emoji: '🐠', rarity: 'Uncommon', minWeight: 3.0, maxWeight: 15.0, difficulty: 5, value: 35, location: 'Stormy Bay', description: 'Lightning-fast ambush predator with razor-sharp teeth.' },
  { id: 'fh_marlin', name: 'Tempest Blue Marlin', emoji: '🗡️', rarity: 'Epic', minWeight: 40.0, maxWeight: 200.0, difficulty: 9, value: 250, location: 'Stormy Bay', description: 'The undisputed king of game fish. Fights like a hurricane.' },
  { id: 'fh_kraken_spawn', name: 'Kraken Spawn', emoji: '🐙', rarity: 'Legendary', minWeight: 20.0, maxWeight: 300.0, difficulty: 10, value: 900, location: 'Stormy Bay', description: 'A juvenile sea monster. Its parent is best left undisturbed.' },

  // ---- Mystic Lake (4) ----
  { id: 'fh_koi', name: 'Spirit Koi', emoji: '🐠', rarity: 'Common', minWeight: 0.5, maxWeight: 3.0, difficulty: 2, value: 10, location: 'Mystic Lake', description: 'Translucent scales glow with ethereal moonlight patterns.' },
  { id: 'fh_sturgeon', name: 'Ancient Sturgeon', emoji: '🐟', rarity: 'Rare', minWeight: 10.0, maxWeight: 80.0, difficulty: 6, value: 70, location: 'Mystic Lake', description: 'A living fossil unchanged for 200 million years.' },
  { id: 'fh_ghost_fish', name: 'Phantom Ghost Fish', emoji: '👻', rarity: 'Epic', minWeight: 1.0, maxWeight: 5.0, difficulty: 7, value: 180, location: 'Mystic Lake', description: 'Nearly invisible. Only seen on moonless nights in the deepest waters.' },
  { id: 'fh_dragon_koi', name: 'Celestial Dragon Koi', emoji: '🐉', rarity: 'Legendary', minWeight: 5.0, maxWeight: 30.0, difficulty: 9, value: 750, location: 'Mystic Lake', description: 'Said to grant wishes to those who catch it. Glides through dimensions.' },

  // ---- Frozen Fjord (4) ----
  { id: 'fh_arctic_char', name: 'Arctic Char', emoji: '🐟', rarity: 'Common', minWeight: 0.5, maxWeight: 5.0, difficulty: 3, value: 10, location: 'Frozen Fjord', description: 'Ruby-red flesh adapted to frigid waters. Hardy and delicious.' },
  { id: 'fh_ice_cod', name: 'Frostbite Cod', emoji: '🐠', rarity: 'Uncommon', minWeight: 1.0, maxWeight: 10.0, difficulty: 4, value: 28, location: 'Frozen Fjord', description: 'Covered in anti-freeze proteins. Thrives under ice sheets.' },
  { id: 'fh_narwhal_fish', name: 'Fjord Narwhal Bass', emoji: '🦄', rarity: 'Epic', minWeight: 15.0, maxWeight: 60.0, difficulty: 8, value: 220, location: 'Frozen Fjord', description: 'A horned fish of impossible biology. Scientists remain baffled.' },
  { id: 'fh_glacial_whale', name: 'Glacial Minke Spirit', emoji: '🐋', rarity: 'Legendary', minWeight: 100.0, maxWeight: 800.0, difficulty: 10, value: 950, location: 'Frozen Fjord', description: 'A spectral whale that surfaces only during the deepest freezes.' },

  // ---- Volcanic Cove (4) ----
  { id: 'fh_lava_eel', name: 'Lava Eel', emoji: '🐍', rarity: 'Uncommon', minWeight: 0.5, maxWeight: 4.0, difficulty: 5, value: 32, location: 'Volcanic Cove', description: 'Thrives near hydrothermal vents. Body radiates intense heat.' },
  { id: 'fh_magma_perch', name: 'Magma Perch', emoji: '🐟', rarity: 'Rare', minWeight: 2.0, maxWeight: 12.0, difficulty: 6, value: 58, location: 'Volcanic Cove', description: 'Scales are hardened volcanic glass. Nearly indestructible.' },
  { id: 'fh_fire_koi', name: 'Inferno Koi', emoji: '🔥', rarity: 'Epic', minWeight: 3.0, maxWeight: 15.0, difficulty: 8, value: 190, location: 'Volcanic Cove', description: 'Swims through molten rock. Flames trail in its wake.' },
  { id: 'fh_volcano_dragon', name: 'Volcanic Dragon Fish', emoji: '🐉', rarity: 'Legendary', minWeight: 30.0, maxWeight: 200.0, difficulty: 10, value: 850, location: 'Volcanic Cove', description: 'An ancient fire serpent that guards the heart of the volcano.' },

  // ---- Abyssal Depths (4) ----
  { id: 'fh_abyssal_shrimp', name: 'Giant Abyssal Shrimp', emoji: '🦐', rarity: 'Uncommon', minWeight: 0.2, maxWeight: 2.0, difficulty: 3, value: 22, location: 'Abyssal Depths', description: 'Translucent crimson giants from the deepest trenches.' },
  { id: 'fh_pressure_fish', name: 'Pressure Demon Fish', emoji: '😈', rarity: 'Rare', minWeight: 5.0, maxWeight: 30.0, difficulty: 7, value: 72, location: 'Abyssal Depths', description: 'Withstands crushing pressure. Body is harder than diamond.' },
  { id: 'fh_biolume_shark', name: 'Bioluminescent Shark', emoji: '🦈', rarity: 'Epic', minWeight: 20.0, maxWeight: 150.0, difficulty: 9, value: 280, location: 'Abyssal Depths', description: 'Entire body glows with cold blue light in the eternal darkness.' },
  { id: 'fh_old_one', name: 'The Old One', emoji: '👾', rarity: 'Legendary', minWeight: 200.0, maxWeight: 2000.0, difficulty: 10, value: 1500, location: 'Abyssal Depths', description: 'An unknowable entity from beyond time. Reality warps near it.' },
];

// ---------------------------------------------------------------------------
// Locations (8)
// ---------------------------------------------------------------------------

const FH_LOCATIONS: FHLocation[] = [
  { name: 'Crystal Pier', emoji: '🏗️', requiredLevel: 1, description: 'A sun-drenched wooden pier in calm waters. Ideal for beginners.', catchModifier: 1.0, fishPool: ['fh_bluegill', 'fh_perch', 'fh_trout', 'fh_catfish', 'fh_pike'] },
  { name: 'Coral Reef', emoji: '🪸', requiredLevel: 3, description: 'A vibrant underwater reef teeming with colorful marine life.', catchModifier: 0.95, fishPool: ['fh_clownfish', 'fh_angelfish', 'fh_parrotfish', 'fh_moray', 'fh_manta'] },
  { name: 'Deep Trench', emoji: '🕳️', requiredLevel: 8, description: 'A plunging abyss where sunlight never reaches. Home to horrors.', catchModifier: 0.85, fishPool: ['fh_lanternfish', 'fh_gulper', 'fh_hatchet', 'fh_viperfish', 'fh_leviathan'] },
  { name: 'Stormy Bay', emoji: '⛈️', requiredLevel: 12, description: 'Waves crash against jagged rocks. Only the brave fish here.', catchModifier: 0.9, fishPool: ['fh_bass', 'fh_barracuda', 'fh_marlin', 'fh_kraken_spawn'] },
  { name: 'Mystic Lake', emoji: '🌙', requiredLevel: 16, description: 'A still, mirror-like lake shrouded in perpetual twilight.', catchModifier: 0.88, fishPool: ['fh_koi', 'fh_sturgeon', 'fh_ghost_fish', 'fh_dragon_koi'] },
  { name: 'Frozen Fjord', emoji: '🧊', requiredLevel: 22, description: 'Ice-choked waters beneath towering glaciers.', catchModifier: 0.82, fishPool: ['fh_arctic_char', 'fh_ice_cod', 'fh_narwhal_fish', 'fh_glacial_whale'] },
  { name: 'Volcanic Cove', emoji: '🌋', requiredLevel: 28, description: 'Boiling waters surround an active volcanic island.', catchModifier: 0.78, fishPool: ['fh_lava_eel', 'fh_magma_perch', 'fh_fire_koi', 'fh_volcano_dragon'] },
  { name: 'Abyssal Depths', emoji: '🌊', requiredLevel: 34, description: 'The ultimate fishing frontier. Pressure, darkness, and legends.', catchModifier: 0.7, fishPool: ['fh_abyssal_shrimp', 'fh_pressure_fish', 'fh_biolume_shark', 'fh_old_one'] },
];

// ---------------------------------------------------------------------------
// Baits (5)
// ---------------------------------------------------------------------------

const FH_BAITS: FHBait[] = [
  { id: 'worm', name: 'Earthworm', emoji: '🪱', cost: 2, catchModifier: 1.0, rarityBonus: 0, description: 'Basic bait. Reliable and cheap.' },
  { id: 'shrimp', name: 'Fresh Shrimp', emoji: '🦐', cost: 8, catchModifier: 1.15, rarityBonus: 0.05, description: 'Attracts more fish. Slight rare fish bonus.' },
  { id: 'lure', name: 'Spinner Lure', emoji: '🪝', cost: 25, catchModifier: 1.3, rarityBonus: 0.1, description: 'Flashy lure that tempts even cautious fish.' },
  { id: 'golden', name: 'Golden Bait', emoji: '✨', cost: 80, catchModifier: 1.5, rarityBonus: 0.2, description: 'Rare and precious.大幅 increases bite rate.' },
  { id: 'legendary', name: 'Legendary Bait', emoji: '🌟', cost: 250, catchModifier: 1.8, rarityBonus: 0.35, description: 'Mythical bait said to attract creatures of legend.' },
];

// ---------------------------------------------------------------------------
// Rods (5)
// ---------------------------------------------------------------------------

const FH_RODS: FHRod[] = [
  { id: 'bamboo', name: 'Bamboo Rod', emoji: '🎋', requiredLevel: 1, catchBonus: 0, difficultyReduction: 0, valueBonus: 0, unlockCost: 0, description: 'A simple bamboo rod. Gets the job done.' },
  { id: 'oak', name: 'Sturdy Oak Rod', emoji: '🪵', requiredLevel: 5, catchBonus: 0.1, difficultyReduction: 1, valueBonus: 0.1, unlockCost: 100, description: 'Solid oak construction with better sensitivity.' },
  { id: 'steel', name: 'Steel Rod', emoji: '⚙️', requiredLevel: 12, catchBonus: 0.2, difficultyReduction: 2, valueBonus: 0.2, unlockCost: 500, description: 'Industrial-grade strength. Serious fishing begins here.' },
  { id: 'carbon', name: 'Carbon Fiber Rod', emoji: '🚀', requiredLevel: 22, catchBonus: 0.35, difficultyReduction: 3, valueBonus: 0.35, unlockCost: 2000, description: 'Ultra-light and incredibly powerful. For expert anglers.' },
  { id: 'titanium', name: 'Titanium Master Rod', emoji: '💎', requiredLevel: 32, catchBonus: 0.5, difficultyReduction: 4, valueBonus: 0.5, unlockCost: 8000, description: 'The pinnacle of fishing technology. Catches the uncatchable.' },
];

// ---------------------------------------------------------------------------
// Weather Conditions (10)
// ---------------------------------------------------------------------------

const FH_WEATHERS: FHWeatherData[] = [
  { name: 'Clear', emoji: '☀️', catchModifier: 1.0, rarityModifier: 0, description: 'Perfect conditions. Fish are active and visible.' },
  { name: 'Cloudy', emoji: '☁️', catchModifier: 1.05, rarityModifier: 0.02, description: 'Overcast skies embolden shy fish to venture out.' },
  { name: 'Rainy', emoji: '🌧️', catchModifier: 1.15, rarityModifier: 0.05, description: 'Rain stirs the water and brings fish to the surface.' },
  { name: 'Stormy', emoji: '⛈️', catchModifier: 0.8, rarityModifier: 0.08, description: 'Dangerous conditions reduce bites but increase rare encounters.' },
  { name: 'Foggy', emoji: '🌫️', catchModifier: 1.1, rarityModifier: 0.06, description: 'Low visibility levels the playing field for all species.' },
  { name: 'Sunny', emoji: '🌤️', catchModifier: 0.95, rarityModifier: 0, description: 'Bright sun drives fish deeper. Slightly fewer bites.' },
  { name: 'Windy', emoji: '💨', catchModifier: 0.9, rarityModifier: 0.03, description: 'Choppy waters make fishing harder but can surprise.' },
  { name: 'Snowy', emoji: '🌨️', catchModifier: 1.0, rarityModifier: 0.04, description: 'Snow insulates the water. Unique cold-water species appear.' },
  { name: 'Full Moon', emoji: '🌕', catchModifier: 1.2, rarityModifier: 0.12, description: 'Lunar energy draws legendary creatures near the surface.' },
  { name: 'Blood Moon', emoji: '🌑', catchModifier: 0.7, rarityModifier: 0.25, description: 'An ominous omen. Rare bites, but unprecedented rare fish chance.' },
];

// ---------------------------------------------------------------------------
// Water Conditions (8)
// ---------------------------------------------------------------------------

const FH_WATER_CONDITIONS: FHWaterConditionData[] = [
  { name: 'Calm', emoji: '🌊', catchModifier: 1.1, difficultyModifier: -0.5, description: 'Smooth sailing. Easy fishing with gentle currents.' },
  { name: 'Choppy', emoji: '🌊', catchModifier: 1.0, difficultyModifier: 0, description: 'Moderate waves. Normal conditions for most fish.' },
  { name: 'Rough', emoji: '🌊', catchModifier: 0.9, difficultyModifier: 1, description: 'Strong waves make casting and reeling a challenge.' },
  { name: 'Turbulent', emoji: '🌊', catchModifier: 0.75, difficultyModifier: 2, description: 'Violent waters. Only the strongest fish bite.' },
  { name: 'Crystal Clear', emoji: '💎', catchModifier: 1.2, difficultyModifier: -1, description: 'Perfect visibility. Fish are easier to spot and hook.' },
  { name: 'Murky', emoji: '🌫️', catchModifier: 0.85, difficultyModifier: 1.5, description: 'Poor visibility. Hard to see fish, hard for fish to see bait.' },
  { name: 'Tidal', emoji: '🔄', catchModifier: 1.05, difficultyModifier: 0.5, description: 'Shifting tides bring in migratory species.' },
  { name: 'Frozen', emoji: '🧊', catchModifier: 0.7, difficultyModifier: 2, description: 'Ice fishing conditions. Fewer bites but unique catches.' },
];

// ---------------------------------------------------------------------------
// Achievement Definitions (15)
// ---------------------------------------------------------------------------

const FH_ACHIEVEMENT_DEFS: Omit<FHAchievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'fh_ach_first_catch', name: 'First Catch', description: 'Catch your very first fish.', icon: '🐟', condition: 'totalCatch >= 1' },
  { id: 'fh_ach_big_one', name: 'The Big One', description: 'Catch a fish weighing over 50 kg.', icon: '🐋', condition: 'heaviestCatch >= 50' },
  { id: 'fh_ach_legendary_angler', name: 'Legendary Angler', description: 'Catch a Legendary rarity fish.', icon: '🌟', condition: 'legendaryCatch >= 1' },
  { id: 'fh_ach_master_fisher', name: 'Master Fisher', description: 'Reach level 30.', icon: '🏅', condition: 'level >= 30' },
  { id: 'fh_ach_hundred', name: 'Century Catch', description: 'Catch 100 fish total.', icon: '💯', condition: 'totalCatch >= 100' },
  { id: 'fh_ach_collector', name: 'Species Collector', description: 'Discover 20 unique species.', icon: '📖', condition: 'speciesDiscovered >= 20' },
  { id: 'fh_ach_full_encyclopedia', name: 'Complete Encyclopedia', description: 'Discover all 35 species.', icon: '📚', condition: 'speciesDiscovered >= 35' },
  { id: 'fh_ach_streak_5', name: 'Hot Streak', description: 'Achieve a 5-fish catch streak.', icon: '🔥', condition: 'streak >= 5' },
  { id: 'fh_ach_streak_10', name: 'Unstoppable', description: 'Achieve a 10-fish catch streak.', icon: '⚡', condition: 'streak >= 10' },
  { id: 'fh_ach_rich_1000', name: 'Wealthy Angler', description: 'Earn 1,000 coins from fishing.', icon: '💰', condition: 'totalCoinsEarned >= 1000' },
  { id: 'fh_ach_explorer', name: 'World Traveler', description: 'Fish at all 8 locations.', icon: '🌍', condition: 'locationsVisited >= 8' },
  { id: 'fh_ach_epic_5', name: 'Epic Hunter', description: 'Catch 5 Epic rarity fish.', icon: '💜', condition: 'epicCatch >= 5' },
  { id: 'fh_ach_daily_3', name: 'Dedicated', description: 'Complete 3 daily challenges.', icon: '📅', condition: 'dailiesCompleted >= 3' },
  { id: 'fh_ach_aquarium', name: 'Aquarium Master', description: 'Fill your aquarium with 12 fish.', icon: '🏛️', condition: 'aquariumFull' },
  { id: 'fh_ach_max_level', name: 'Harbor Legend', description: 'Reach the maximum level of 40.', icon: '👑', condition: 'level >= 40' },
];

// ---------------------------------------------------------------------------
// State — lazy initialized, no browser API at module level
// ---------------------------------------------------------------------------

let state: FishingHarborState | null = null;

function ensureInit(): FishingHarborState {
  if (state) return state;

  const encyclopedia: FHEncyclopediaEntry[] = FH_FISH.map((f) => ({
    speciesId: f.id,
    discovered: false,
    catchCount: 0,
    bestWeight: 0,
    totalValue: 0,
  }));

  const achievements: FHAchievement[] = FH_ACHIEVEMENT_DEFS.map((a) => ({
    ...a,
    unlocked: false,
    unlockedAt: 0,
  }));

  state = {
    level: 1,
    xp: 0,
    coins: 50,
    totalCatch: 0,
    rareCatch: 0,
    streak: 0,
    bestStreak: 0,
    currentBait: 'worm',
    currentRod: 'bamboo',
    currentLocation: 'Crystal Pier',
    inventory: [],
    achievements,
    dailyChallenge: null,
    runHistory: [],
    currentCast: {
      phase: 'idle',
      targetFish: null,
      targetWeight: 0,
      waitTicks: 0,
      reelWindow: 0,
      reelTimer: 0,
      castTick: 0,
    },
    encyclopedia,
    aquarium: [],
    baitStock: {
      worm: 10,
      shrimp: 0,
      lure: 0,
      golden: 0,
      legendary: 0,
    },
    unlockedRods: ['bamboo'],
    weatherIndex: 0,
    waterConditionIndex: 0,
    tick: 0,
    lastWeatherChangeTick: 0,
    lastDailyDateSeed: 0,
    totalCoinsEarned: 0,
    totalXPEarned: 0,
    totalRuns: 0,
  };

  return state;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function fishById(id: string): FHFishSpecies | undefined {
  return FH_FISH.find((f) => f.id === id);
}

function locationByName(name: FHLocationName): FHLocation | undefined {
  return FH_LOCATIONS.find((l) => l.name === name);
}

function baitById(id: FHBaitId): FHBait | undefined {
  return FH_BAITS.find((b) => b.id === id);
}

function rodById(id: FHRodId): FHRod | undefined {
  return FH_RODS.find((r) => r.id === id);
}

/** Deterministic seeded PRNG (Mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function rarityIndex(rarity: FHRarity): number {
  return RARITY_ORDER.indexOf(rarity);
}

/** Weighted random fish selection from a pool, considering bait rarity bonus. */
function selectFish(fishPool: string[], baitRarityBonus: number, weatherRarityMod: number, rng: () => number): FHFishSpecies | null {
  // Build weighted list
  const candidates: Array<{ fish: FHFishSpecies; weight: number }> = [];
  for (const id of fishPool) {
    const fish = fishById(id);
    if (!fish) continue;
    let w = RARITY_CATCH_WEIGHT[fish.rarity];
    // Bait bonus shifts weight toward rarer fish
    const ri = rarityIndex(fish.rarity);
    w += ri * baitRarityBonus * 30;
    // Weather rarity modifier
    w += ri * weatherRarityMod * 20;
    candidates.push({ fish, weight: Math.max(1, w) });
  }

  if (candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  let roll = rng() * totalWeight;

  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate.fish;
  }

  return candidates[candidates.length - 1].fish;
}

/** Calculate catch probability based on all modifiers. */
function calculateCatchProbability(
  fish: FHFishSpecies,
  bait: FHBait,
  rod: FHRod,
  location: FHLocation,
  weather: FHWeatherData,
  water: FHWaterConditionData,
): number {
  // Base probability inversely related to difficulty
  let prob = Math.max(0.15, 1.0 - fish.difficulty * 0.08);

  // Apply modifiers
  prob *= bait.catchModifier;
  prob *= (1 + rod.catchBonus);
  prob *= location.catchModifier;
  prob *= weather.catchModifier;
  prob *= water.catchModifier;

  // Clamp between 5% and 95%
  return clamp(prob, 0.05, 0.95);
}

/** Generate a random weight within the fish's range, slightly bell-curved. */
function generateWeight(fish: FHFishSpecies, rng: () => number): number {
  const range = fish.maxWeight - fish.minWeight;
  // Use two random rolls for a rough bell curve
  const r1 = rng();
  const r2 = rng();
  const bellR = (r1 + r2) / 2;
  const weight = fish.minWeight + bellR * range;
  return Math.round(weight * 100) / 100;
}

/** Calculate coin value for a caught fish. */
function calculateFishValue(fish: FHFishSpecies, weight: number, rod: FHRod): number {
  const sizeBonus = 1 + (weight / fish.maxWeight) * 0.5;
  const rodBonus = 1 + rod.valueBonus;
  return Math.floor(fish.value * RARITY_COIN_MULTIPLIER[fish.rarity] * sizeBonus * rodBonus);
}

/** Calculate XP for a caught fish. */
function calculateFishXP(fish: FHFishSpecies): number {
  const base = 10 + fish.difficulty * 5;
  return base + RARITY_XP_BONUS[fish.rarity];
}

/** Get the number of unique locations visited from run history. */
function countLocationsVisited(history: FHRunHistoryEntry[]): number {
  const visited = new Set(history.map((h) => h.location));
  return visited.size;
}

/** Count catches by rarity tier. */
function countCatchesByRarity(history: FHRunHistoryEntry[], targetRarity: FHRarity): number {
  let count = 0;
  for (const entry of history) {
    if (entry.speciesId) {
      const fish = fishById(entry.speciesId);
      if (fish && fish.rarity === targetRarity) {
        count++;
      }
    }
  }
  return count;
}

/** Count completed daily challenges from run history context. */
function countDailiesCompleted(state: FishingHarborState): number {
  // We track dailies via a simple heuristic: check if daily challenge was completed
  // This is tracked in state — we use a field approach. For now return 0 if no
  // dedicated tracker; the actual count comes from achievements.
  let count = 0;
  for (const ach of state.achievements) {
    if (ach.id === 'fh_ach_daily_3' && ach.unlocked) {
      count = 3;
    }
  }
  return count;
}

/** Refresh daily challenge if the date seed has changed. */
function refreshDailyChallenge(s: FishingHarborState): void {
  const seed = dateSeed();
  if (s.lastDailyDateSeed === seed) return;

  const rng = mulberry32(seed);
  // Pick a random fish as the target
  const targetFish = FH_FISH[Math.floor(rng() * FH_FISH.length)];
  // Target weight is 70-90% of max
  const weightPct = 0.7 + rng() * 0.2;
  const targetWeight = Math.round(targetFish.maxWeight * weightPct * 100) / 100;
  // Bonus multiplier based on fish rarity
  const rarityMult = RARITY_COIN_MULTIPLIER[targetFish.rarity];
  const bonusMultiplier = 1 + rarityMult * 0.5;

  s.dailyChallenge = {
    targetSpeciesId: targetFish.id,
    targetWeight,
    bonusMultiplier: Math.round(bonusMultiplier * 100) / 100,
    completed: false,
    dateSeed: seed,
    bonusXP: RARITY_XP_BONUS[targetFish.rarity] * 2,
  };

  s.lastDailyDateSeed = seed;
}

/** Advance weather every ~20 ticks. */
function maybeAdvanceWeather(s: FishingHarborState): void {
  if (s.tick - s.lastWeatherChangeTick >= 20) {
    s.weatherIndex = (s.weatherIndex + 1) % FH_WEATHERS.length;
    s.waterConditionIndex = (s.waterConditionIndex + 1) % FH_WATER_CONDITIONS.length;
    s.lastWeatherChangeTick = s.tick;
  }
}

// ---------------------------------------------------------------------------
// Exported Functions — State & Leveling
// ---------------------------------------------------------------------------

/** Returns a shallow copy of the current state for safe reads. */
export function fhGetState(): FishingHarborState {
  const s = ensureInit();
  return { ...s };
}

/** Fully resets the state to initial values. */
export function fhResetState(): void {
  state = null;
  void ensureInit();
}

/** Returns the current player level (1–40). */
export function fhGetLevel(): number {
  return ensureInit().level;
}

/** Adds XP and handles level-ups. Returns the new level. */
export function fhAddXP(amount: number): number {
  const s = ensureInit();
  s.xp += amount;
  s.totalXPEarned += amount;

  while (s.level < MAX_LEVEL) {
    const needed = xpForLevel(s.level);
    if (s.xp >= needed) {
      s.xp -= needed;
      s.level++;
    } else {
      break;
    }
  }

  // Cap XP at max level
  if (s.level >= MAX_LEVEL) {
    s.xp = 0;
  }

  // Auto-unlock rods when reaching required levels
  for (const rod of FH_RODS) {
    if (s.level >= rod.requiredLevel && !s.unlockedRods.includes(rod.id)) {
      s.unlockedRods.push(rod.id);
    }
  }

  return s.level;
}

/** Returns the XP progress for the current level as { current, needed, fraction }. */
export function fhGetXpProgress(): { current: number; needed: number; fraction: number } {
  const s = ensureInit();
  const needed = s.level >= MAX_LEVEL ? 1 : xpForLevel(s.level);
  return {
    current: s.xp,
    needed,
    fraction: s.level >= MAX_LEVEL ? 1 : s.xp / needed,
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Coins
// ---------------------------------------------------------------------------

/** Returns current coin balance. */
export function fhGetCoins(): number {
  return ensureInit().coins;
}

/** Adds coins (can be negative for purchases). Returns new balance. */
export function fhAddCoins(amount: number): number {
  const s = ensureInit();
  s.coins = Math.max(0, s.coins + amount);
  if (amount > 0) {
    s.totalCoinsEarned += amount;
  }
  return s.coins;
}

// ---------------------------------------------------------------------------
// Exported Functions — Locations
// ---------------------------------------------------------------------------

/** Returns all 8 locations with metadata. */
export function fhGetLocations(): FHLocation[] {
  return FH_LOCATIONS.map((l) => ({ ...l }));
}

/** Returns fish species available at a given location. */
export function fhGetFishByLocation(locationName: FHLocationName): FHFishSpecies[] {
  const loc = locationByName(locationName);
  if (!loc) return [];
  return loc.fishPool.map((id) => fishById(id)).filter((f): f is FHFishSpecies => f !== undefined);
}

/** Returns the current active location name. */
export function fhGetCurrentLocation(): FHLocationName {
  return ensureInit().currentLocation;
}

/** Switch to a different fishing location. Returns true if successful. */
export function fhSetLocation(locationName: FHLocationName): boolean {
  const s = ensureInit();
  const loc = locationByName(locationName);
  if (!loc) return false;
  if (s.level < loc.requiredLevel) return false;
  s.currentLocation = locationName;
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Fishing Mechanics
// ---------------------------------------------------------------------------

/** Cast the fishing rod. Starts the fishing sequence. Returns the cast state. */
export function fhCastRod(): FHCurrentCast {
  const s = ensureInit();
  if (s.currentCast.phase !== 'idle') return { ...s.currentCast };

  // Consume one bait
  if (s.baitStock[s.currentBait] <= 0) return { ...s.currentCast };

  s.baitStock[s.currentBait]--;
  s.tick++;

  const loc = locationByName(s.currentLocation);
  if (!loc) return { ...s.currentCast };

  // Wait time based on water conditions and weather
  const weather = FH_WEATHERS[s.weatherIndex];
  const water = FH_WATER_CONDITIONS[s.waterConditionIndex];
  const bait = baitById(s.currentBait);

  const baseWait = 3;
  const weatherWaitMod = weather.catchModifier > 1 ? -1 : weather.catchModifier < 0.9 ? 2 : 0;
  const waterWaitMod = water.catchModifier > 1 ? -1 : water.catchModifier < 0.85 ? 2 : 0;
  const baitWaitMod = bait ? (bait.catchModifier > 1.3 ? -1 : 0) : 0;
  const waitTicks = Math.max(1, baseWait + weatherWaitMod + waterWaitMod + baitWaitMod);

  s.currentCast = {
    phase: 'waiting',
    targetFish: null,
    targetWeight: 0,
    waitTicks,
    reelWindow: 0,
    reelTimer: 0,
    castTick: s.tick,
  };

  maybeAdvanceWeather(s);
  refreshDailyChallenge(s);

  return { ...s.currentCast };
}

/** Process a tick during waiting phase. Returns the updated cast state. */
export function fhWaitTick(): FHCurrentCast {
  const s = ensureInit();
  if (s.currentCast.phase !== 'waiting') return { ...s.currentCast };

  s.tick++;
  s.currentCast.waitTicks--;

  if (s.currentCast.waitTicks <= 0) {
    // A fish bites!
    const loc = locationByName(s.currentLocation);
    if (!loc) return { ...s.currentCast };

    const bait = baitById(s.currentBait);
    const weather = FH_WEATHERS[s.weatherIndex];
    const rng = mulberry32(s.tick * 7919 + 13);

    const fish = selectFish(
      loc.fishPool,
      bait ? bait.rarityBonus : 0,
      weather.rarityModifier,
      rng,
    );

    if (fish) {
      const weight = generateWeight(fish, rng);
      s.currentCast.phase = 'biting';
      s.currentCast.targetFish = fish;
      s.currentCast.targetWeight = weight;
      // Reel window based on fish difficulty and rod
      const rod = rodById(s.currentRod);
      const diffReduction = rod ? rod.difficultyReduction : 0;
      const effectiveDifficulty = Math.max(1, fish.difficulty - diffReduction);
      s.currentCast.reelWindow = Math.max(1, 6 - effectiveDifficulty);
      s.currentCast.reelTimer = s.currentCast.reelWindow;
    } else {
      // No fish bit — return to idle
      s.currentCast.phase = 'idle';
    }
  }

  maybeAdvanceWeather(s);
  return { ...s.currentCast };
}

/** Attempt to reel in the fish. Returns true if caught. */
export function fhReelIn(): boolean {
  const s = ensureInit();
  if (s.currentCast.phase !== 'biting') return false;

  s.tick++;
  s.currentCast.reelTimer--;

  if (s.currentCast.reelTimer <= 0) {
    // Calculate catch probability
    const fish = s.currentCast.targetFish;
    if (!fish) {
      s.currentCast.phase = 'idle';
      return false;
    }

    const bait = baitById(s.currentBait);
    const rod = rodById(s.currentRod);
    const loc = locationByName(s.currentLocation);
    const weather = FH_WEATHERS[s.weatherIndex];
    const water = FH_WATER_CONDITIONS[s.waterConditionIndex];

    if (!bait || !rod || !loc) {
      s.currentCast.phase = 'idle';
      return false;
    }

    const catchProb = calculateCatchProbability(fish, bait, rod, loc, weather, water);
    const rng = mulberry32(s.tick * 4217 + 9973);
    const roll = rng();

    s.totalRuns++;

    if (roll <= catchProb) {
      // CAUGHT!
      s.currentCast.phase = 'caught';
      const weight = s.currentCast.targetWeight;
      const coinValue = calculateFishValue(fish, weight, rod);
      const xpValue = calculateFishXP(fish);

      s.coins += coinValue;
      s.totalCoinsEarned += coinValue;
      s.totalCatch++;
      s.streak++;
      if (s.streak > s.bestStreak) {
        s.bestStreak = s.streak;
      }

      if (fish.rarity === 'Rare' || fish.rarity === 'Epic' || fish.rarity === 'Legendary') {
        s.rareCatch++;
      }

      // Add to inventory
      const caughtFish: FHCaughtFish = {
        speciesId: fish.id,
        weight,
        caughtAt: s.tick,
        caughtLocation: s.currentLocation,
        baitUsed: s.currentBait,
        rodUsed: s.currentRod,
      };
      if (s.inventory.length < MAX_INVENTORY) {
        s.inventory.push(caughtFish);
      }

      // Update encyclopedia
      const encEntry = s.encyclopedia.find((e) => e.speciesId === fish.id);
      if (encEntry) {
        encEntry.discovered = true;
        encEntry.catchCount++;
        if (weight > encEntry.bestWeight) {
          encEntry.bestWeight = weight;
        }
        encEntry.totalValue += coinValue;
      }

      // XP
      void fhAddXP(xpValue);

      // Run history
      const historyEntry: FHRunHistoryEntry = {
        speciesId: fish.id,
        weight,
        coinsEarned: coinValue,
        xpEarned: xpValue,
        location: s.currentLocation,
        weather: weather.name,
        waterCondition: water.name,
        baitUsed: s.currentBait,
        rodUsed: s.currentRod,
        timestamp: s.tick,
        success: true,
      };
      s.runHistory.unshift(historyEntry);
      if (s.runHistory.length > MAX_RUN_HISTORY) {
        s.runHistory.length = MAX_RUN_HISTORY;
      }

      // Check daily challenge
      void fhCheckDailyChallenge(fish, weight, coinValue);

      // Check achievements
      void fhCheckAchievements();

      return true;
    } else {
      // ESCAPED
      s.currentCast.phase = 'escaped';
      s.streak = 0;

      const historyEntry: FHRunHistoryEntry = {
        speciesId: fish.id,
        weight: null,
        coinsEarned: 0,
        xpEarned: 0,
        location: s.currentLocation,
        weather: weather.name,
        waterCondition: water.name,
        baitUsed: s.currentBait,
        rodUsed: s.currentRod,
        timestamp: s.tick,
        success: false,
      };
      s.runHistory.unshift(historyEntry);
      if (s.runHistory.length > MAX_RUN_HISTORY) {
        s.runHistory.length = MAX_RUN_HISTORY;
      }

      void fhCheckAchievements();
      return false;
    }
  }

  // Still in biting phase — reel timer counting down
  return false;
}

/** Returns the current cast state. */
export function fhGetCatchResult(): FHCurrentCast {
  return { ...ensureInit().currentCast };
}

/** Clears the current cast and returns to idle state. */
export function fhClearCast(): void {
  const s = ensureInit();
  s.currentCast = {
    phase: 'idle',
    targetFish: null,
    targetWeight: 0,
    waitTicks: 0,
    reelWindow: 0,
    reelTimer: 0,
    castTick: 0,
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Bait
// ---------------------------------------------------------------------------

/** Returns all bait types with metadata. */
export function fhGetBaits(): FHBait[] {
  return FH_BAITS.map((b) => ({ ...b }));
}

/** Returns the currently equipped bait. */
export function fhGetCurrentBait(): FHBaitId {
  return ensureInit().currentBait;
}

/** Switch to a different bait type. Returns true if the player has stock. */
export function fhSetBait(baitId: FHBaitId): boolean {
  const s = ensureInit();
  if (s.currentCast.phase !== 'idle') return false;
  if (s.baitStock[baitId] <= 0) return false;
  s.currentBait = baitId;
  return true;
}

/** Buy bait with coins. Returns true if purchase succeeded. */
export function fhBuyBait(baitId: FHBaitId, quantity: number): boolean {
  const s = ensureInit();
  const bait = baitById(baitId);
  if (!bait) return false;
  const totalCost = bait.cost * quantity;
  if (s.coins < totalCost) return false;
  s.coins -= totalCost;
  s.baitStock[baitId] += quantity;
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Rods
// ---------------------------------------------------------------------------

/** Returns all rod types with metadata. */
export function fhGetRods(): FHRod[] {
  return FH_RODS.map((r) => ({ ...r }));
}

/** Returns the currently equipped rod ID. */
export function fhGetCurrentRod(): FHRodId {
  return ensureInit().currentRod;
}

/** Equip a rod. Returns true if the rod is unlocked. */
export function fhEquipRod(rodId: FHRodId): boolean {
  const s = ensureInit();
  if (!s.unlockedRods.includes(rodId)) return false;
  s.currentRod = rodId;
  return true;
}

/** Unlock a rod by paying its cost. Returns true if successful. */
export function fhUpgradeRod(rodId: FHRodId): boolean {
  const s = ensureInit();
  const rod = rodById(rodId);
  if (!rod) return false;
  if (s.unlockedRods.includes(rodId)) return false;
  if (s.level < rod.requiredLevel) return false;
  if (s.coins < rod.unlockCost) return false;
  s.coins -= rod.unlockCost;
  s.unlockedRods.push(rodId);
  s.currentRod = rodId;
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Weather & Water
// ---------------------------------------------------------------------------

/** Returns the current weather data. */
export function fhGetWeather(): FHWeatherData {
  return { ...FH_WEATHERS[ensureInit().weatherIndex] };
}

/** Returns the current water condition data. */
export function fhGetWaterCondition(): FHWaterConditionData {
  return { ...FH_WATER_CONDITIONS[ensureInit().waterConditionIndex] };
}

/** Manually advance weather and water condition. Returns new weather. */
export function fhAdvanceWeather(): FHWeatherData {
  const s = ensureInit();
  s.weatherIndex = (s.weatherIndex + 1) % FH_WEATHERS.length;
  s.waterConditionIndex = (s.waterConditionIndex + 1) % FH_WATER_CONDITIONS.length;
  s.lastWeatherChangeTick = s.tick;
  return { ...FH_WEATHERS[s.weatherIndex] };
}

// ---------------------------------------------------------------------------
// Exported Functions — Inventory
// ---------------------------------------------------------------------------

/** Returns a copy of the fish inventory. */
export function fhGetInventory(): FHCaughtFish[] {
  return ensureInit().inventory.map((f) => ({ ...f }));
}

/** Manually add a caught fish to inventory. Returns true if added. */
export function fhAddToInventory(fish: FHCaughtFish): boolean {
  const s = ensureInit();
  if (s.inventory.length >= MAX_INVENTORY) return false;
  s.inventory.push({ ...fish });
  return true;
}

/** Returns the rarest fish in inventory (highest rarity tier). */
export function fhGetRarestCatch(): FHCaughtFish | null {
  const s = ensureInit();
  if (s.inventory.length === 0) return null;

  let rarest: FHCaughtFish | null = null;
  let bestRarityIdx = -1;

  for (const fish of s.inventory) {
    const species = fishById(fish.speciesId);
    if (species) {
      const idx = rarityIndex(species.rarity);
      if (idx > bestRarityIdx) {
        bestRarityIdx = idx;
        rarest = fish;
      }
    }
  }

  return rarest;
}

// ---------------------------------------------------------------------------
// Exported Functions — Aquarium
// ---------------------------------------------------------------------------

/** Returns the current aquarium display (up to 12 fish). */
export function fhGetAquarium(): FHAquariumFish[] {
  return ensureInit().aquarium.map((f) => ({ ...f }));
}

/** Add a fish from inventory to the aquarium. Returns true if added. */
export function fhAddToAquarium(speciesId: string, weight: number): boolean {
  const s = ensureInit();
  if (s.aquarium.length >= MAX_AQUARIUM) return false;

  // Check if this species is already in the aquarium
  const existing = s.aquarium.find((f) => f.speciesId === speciesId);
  if (existing) return false;

  const slot = s.aquarium.length;
  s.aquarium.push({ speciesId, weight, slot });
  return true;
}

/** Remove a fish from the aquarium by slot index. Returns true if removed. */
export function fhRemoveFromAquarium(slot: number): boolean {
  const s = ensureInit();
  const idx = s.aquarium.findIndex((f) => f.slot === slot);
  if (idx < 0) return false;
  s.aquarium.splice(idx, 1);
  // Re-index remaining slots
  for (let i = 0; i < s.aquarium.length; i++) {
    s.aquarium[i].slot = i;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Encyclopedia
// ---------------------------------------------------------------------------

/** Returns the full encyclopedia data. */
export function fhGetEncyclopedia(): FHEncyclopediaEntry[] {
  return ensureInit().encyclopedia.map((e) => ({ ...e }));
}

/** Returns the count of discovered species. */
export function fhDiscoveries(): number {
  const s = ensureInit();
  return s.encyclopedia.filter((e) => e.discovered).length;
}

/** Returns data for a specific species including encyclopedia info. */
export function fhGetSpeciesData(speciesId: string): FHFishSpecies & { encyclopedia: FHEncyclopediaEntry } | null {
  const s = ensureInit();
  const fish = fishById(speciesId);
  if (!fish) return null;
  const encEntry = s.encyclopedia.find((e) => e.speciesId === speciesId);
  const encyclopedia = encEntry
    ? { ...encEntry }
    : { speciesId, discovered: false, catchCount: 0, bestWeight: 0, totalValue: 0 };
  return { ...fish, encyclopedia };
}

// ---------------------------------------------------------------------------
// Exported Functions — Daily Challenge
// ---------------------------------------------------------------------------

/** Returns the current daily challenge or null if not available. */
export function fhGetDailyChallenge(): FHDailyChallenge | null {
  const s = ensureInit();
  refreshDailyChallenge(s);
  return s.dailyChallenge ? { ...s.dailyChallenge } : null;
}

/** Complete the daily challenge (called internally when conditions are met). */
function fhCheckDailyChallenge(fish: FHFishSpecies, weight: number, coinValue: number): boolean {
  const s = ensureInit();
  refreshDailyChallenge(s);
  if (!s.dailyChallenge || s.dailyChallenge.completed) return false;

  if (
    fish.id === s.dailyChallenge.targetSpeciesId &&
    weight >= s.dailyChallenge.targetWeight
  ) {
    s.dailyChallenge.completed = true;
    // Apply bonus
    const bonusCoins = Math.floor(coinValue * (s.dailyChallenge.bonusMultiplier - 1));
    s.coins += bonusCoins;
    s.totalCoinsEarned += bonusCoins;
    void fhAddXP(s.dailyChallenge.bonusXP);
    return true;
  }

  return false;
}

/** Returns whether the daily challenge has been completed today. */
export function fhCompleteDaily(): boolean {
  const s = ensureInit();
  refreshDailyChallenge(s);
  return s.dailyChallenge ? s.dailyChallenge.completed : false;
}

// ---------------------------------------------------------------------------
// Exported Functions — Streaks
// ---------------------------------------------------------------------------

/** Returns the current catch streak. */
export function fhGetStreak(): number {
  return ensureInit().streak;
}

/** Returns the best catch streak ever achieved. */
export function fhGetBestStreak(): number {
  return ensureInit().bestStreak;
}

// ---------------------------------------------------------------------------
// Exported Functions — Stats
// ---------------------------------------------------------------------------

/** Returns a comprehensive stats snapshot. */
export function fhGetStats(): FHStats {
  const s = ensureInit();
  const weights = s.runHistory
    .filter((h) => h.weight !== null)
    .map((h) => h.weight as number);
  const heaviestCatch = weights.length > 0 ? Math.max(...weights) : 0;
  const mostValuable = s.runHistory.length > 0 ? Math.max(...s.runHistory.map((h) => h.coinsEarned)) : 0;

  return {
    totalCatch: s.totalCatch,
    rareCatch: s.rareCatch,
    streak: s.streak,
    bestStreak: s.bestStreak,
    totalCoinsEarned: s.totalCoinsEarned,
    totalXPEarned: s.totalXPEarned,
    totalRuns: s.totalRuns,
    speciesDiscovered: s.encyclopedia.filter((e) => e.discovered).length,
    heaviestCatch,
    mostValuableCatch: mostValuable,
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Achievements
// ---------------------------------------------------------------------------

/** Returns all achievement definitions and states. */
export function fhGetAchievements(): FHAchievement[] {
  return ensureInit().achievements.map((a) => ({ ...a }));
}

/** Checks all achievement conditions and unlocks any that are met. Returns newly unlocked IDs. */
export function fhCheckAchievements(): string[] {
  const s = ensureInit();
  const stats = fhGetStats();
  const newlyUnlocked: string[] = [];

  for (const ach of s.achievements) {
    if (ach.unlocked) continue;

    let met = false;

    switch (ach.condition) {
      case 'totalCatch >= 1':
        met = stats.totalCatch >= 1;
        break;
      case 'heaviestCatch >= 50':
        met = stats.heaviestCatch >= 50;
        break;
      case 'legendaryCatch >= 1':
        met = countCatchesByRarity(s.runHistory, 'Legendary') >= 1;
        break;
      case 'level >= 30':
        met = s.level >= 30;
        break;
      case 'totalCatch >= 100':
        met = stats.totalCatch >= 100;
        break;
      case 'speciesDiscovered >= 20':
        met = stats.speciesDiscovered >= 20;
        break;
      case 'speciesDiscovered >= 35':
        met = stats.speciesDiscovered >= 35;
        break;
      case 'streak >= 5':
        met = stats.streak >= 5;
        break;
      case 'streak >= 10':
        met = stats.streak >= 10;
        break;
      case 'totalCoinsEarned >= 1000':
        met = stats.totalCoinsEarned >= 1000;
        break;
      case 'locationsVisited >= 8':
        met = countLocationsVisited(s.runHistory) >= 8;
        break;
      case 'epicCatch >= 5':
        met = countCatchesByRarity(s.runHistory, 'Epic') >= 5;
        break;
      case 'dailiesCompleted >= 3':
        met = countDailiesCompleted(s) >= 3;
        break;
      case 'aquariumFull':
        met = s.aquarium.length >= MAX_AQUARIUM;
        break;
      case 'level >= 40':
        met = s.level >= MAX_LEVEL;
        break;
      default:
        break;
    }

    if (met) {
      ach.unlocked = true;
      ach.unlockedAt = s.tick;
      newlyUnlocked.push(ach.id);
    }
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Exported Functions — Run History
// ---------------------------------------------------------------------------

/** Returns the fishing run history (most recent first). */
export function fhGetRunHistory(): FHRunHistoryEntry[] {
  return ensureInit().runHistory.map((h) => ({ ...h }));
}

// ---------------------------------------------------------------------------
// Exported Functions — Best Catch
// ---------------------------------------------------------------------------

/** Returns the heaviest catch in the run history with full details. */
export function fhGetBestCatch(): FHRunHistoryEntry | null {
  const s = ensureInit();
  let best: FHRunHistoryEntry | null = null;
  let bestWeight = 0;

  for (const entry of s.runHistory) {
    if (entry.weight !== null && entry.weight > bestWeight) {
      bestWeight = entry.weight;
      best = entry;
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Exported Functions — Hints
// ---------------------------------------------------------------------------

/** Returns a contextual hint based on current game state. */
export function fhGetHint(): FHHint {
  const s = ensureInit();
  const weather = FH_WEATHERS[s.weatherIndex];
  const water = FH_WATER_CONDITIONS[s.waterConditionIndex];
  const loc = locationByName(s.currentLocation);
  const bait = baitById(s.currentBait);
  const rod = rodById(s.currentRod);

  // Hint priorities: warnings first, then tips
  if (s.baitStock[s.currentBait] <= 0) {
    return { message: `You're out of ${bait ? bait.name : s.currentBait}! Buy more bait or switch types.`, type: 'warning', icon: '⚠️' };
  }

  if (weather.name === 'Stormy') {
    return { message: 'Stormy weather reduces catch rate significantly, but boosts rare fish chance!', type: 'warning', icon: '⛈️' };
  }

  if (weather.name === 'Blood Moon') {
    return { message: 'Blood Moon! Rare catches are dramatically more likely — use your best bait!', type: 'encouragement', icon: '🌑' };
  }

  if (weather.name === 'Full Moon') {
    return { message: 'The Full Moon illuminates the waters. Great fishing conditions!', type: 'encouragement', icon: '🌕' };
  }

  if (water.name === 'Crystal Clear') {
    return { message: 'Crystal clear waters make it easier to spot and hook fish.', type: 'tip', icon: '💎' };
  }

  if (water.name === 'Frozen') {
    return { message: 'Ice fishing! Fewer bites, but you might find unique cold-water species.', type: 'tip', icon: '🧊' };
  }

  if (loc && s.level < loc.requiredLevel + 3) {
    return { message: `This location is near your level limit. Consider leveling up for better rods and bait.`, type: 'tip', icon: '💡' };
  }

  if (rod && rod.id === 'bamboo' && s.level >= 5) {
    return { message: 'You can upgrade to a Sturdy Oak Rod for better catch bonuses!', type: 'tip', icon: '🪵' };
  }

  if (bait && bait.id === 'worm' && s.coins >= 50) {
    return { message: 'Upgrade from worms to Fresh Shrimp for a 15% catch rate boost!', type: 'tip', icon: '🦐' };
  }

  if (s.streak >= 5) {
    return { message: `Amazing ${s.streak}-fish streak! Keep going!`, type: 'encouragement', icon: '🔥' };
  }

  if (s.dailyChallenge && !s.dailyChallenge.completed) {
    const target = fishById(s.dailyChallenge.targetSpeciesId);
    if (target) {
      return { message: `Daily: Catch a ${target.name} weighing ${s.dailyChallenge.targetWeight}kg+ for bonus rewards!`, type: 'tip', icon: '📅' };
    }
  }

  const undiscovered = s.encyclopedia.filter((e) => !e.discovered).length;
  if (undiscovered > 0 && undiscovered <= 5) {
    return { message: `Only ${undiscovered} species left to discover! Try fishing in different locations.`, type: 'encouragement', icon: '📖' };
  }

  return { message: 'Patience is the angler\'s greatest virtue. Cast your line and wait for the perfect moment.', type: 'tip', icon: '🎣' };
}

// ---------------------------------------------------------------------------
// Exported Functions — Utility & Info
// ---------------------------------------------------------------------------

/** Returns the rarity glow color for a given rarity tier. */
export function fhGetRarityColor(rarity: FHRarity): string {
  return RARITY_GLOW_COLORS[rarity] || '#9CA3AF';
}

/** Returns all rarity tiers in ascending order. */
export function fhGetRarityOrder(): FHRarity[] {
  return [...RARITY_ORDER];
}

/** Returns all fish species in the database (read-only reference). */
export function fhGetAllFishSpecies(): FHFishSpecies[] {
  return FH_FISH.map((f) => ({ ...f }));
}

/** Returns the total number of species in the database. */
export function fhGetTotalSpeciesCount(): number {
  return FH_FISH.length;
}

/** Returns the total number of locations. */
export function fhGetTotalLocationCount(): number {
  return FH_LOCATIONS.length;
}

/** Returns bait stock counts. */
export function fhGetBaitStock(): Record<FHBaitId, number> {
  const s = ensureInit();
  return { ...s.baitStock };
}

/** Returns unlocked rod IDs. */
export function fhGetUnlockedRods(): FHRodId[] {
  return [...ensureInit().unlockedRods];
}

/** Sell a fish from inventory by index. Returns the coin value earned. */
export function fhSellFish(inventoryIndex: number): number {
  const s = ensureInit();
  if (inventoryIndex < 0 || inventoryIndex >= s.inventory.length) return 0;

  const fish = s.inventory[inventoryIndex];
  const species = fishById(fish.speciesId);
  const rod = rodById(fish.rodUsed);

  if (!species || !rod) return 0;

  const value = calculateFishValue(species, fish.weight, rod);
  s.coins += value;
  s.totalCoinsEarned += value;
  s.inventory.splice(inventoryIndex, 1);
  return value;
}

/** Returns the catch probability breakdown for current setup (informational). */
export function fhGetCatchProbabilityBreakdown(): {
  fishName: string;
  probability: number;
  rarity: FHRarity;
}[] {
  const s = ensureInit();
  const loc = locationByName(s.currentLocation);
  if (!loc) return [];

  const bait = baitById(s.currentBait);
  const rod = rodById(s.currentRod);
  const weather = FH_WEATHERS[s.weatherIndex];
  const water = FH_WATER_CONDITIONS[s.waterConditionIndex];

  if (!bait || !rod) return [];

  return loc.fishPool
    .map((id) => {
      const fish = fishById(id);
      if (!fish) return null;
      const prob = calculateCatchProbability(fish, bait, rod, loc, weather, water);
      return { fishName: fish.name, probability: Math.round(prob * 1000) / 1000, rarity: fish.rarity };
    })
    .filter((e): e is { fishName: string; probability: number; rarity: FHRarity } => e !== null);
}

/** Returns a summary of the current fishing session context. */
export function fhGetContextSummary(): {
  level: number;
  coins: number;
  location: FHLocationName;
  bait: FHBaitId;
  rod: FHRodId;
  weather: FHWeather;
  waterCondition: FHWaterCondition;
  baitStock: number;
  phase: FHFishingPhase;
} {
  const s = ensureInit();
  return {
    level: s.level,
    coins: s.coins,
    location: s.currentLocation,
    bait: s.currentBait,
    rod: s.currentRod,
    weather: FH_WEATHERS[s.weatherIndex].name,
    waterCondition: FH_WATER_CONDITIONS[s.waterConditionIndex].name,
    baitStock: s.baitStock[s.currentBait],
    phase: s.currentCast.phase,
  };
}
