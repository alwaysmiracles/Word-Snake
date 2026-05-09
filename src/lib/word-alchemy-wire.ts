// =============================================================================
// Word Alchemy Wire — Word Snake Game Alchemy System
// =============================================================================
// SSR-safe module: no localStorage, window, document, setInterval, addEventListener.
// All public functions use the `al` prefix. No React Hook naming (`use*`).
// =============================================================================

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type ElementId = "fire" | "water" | "earth" | "air" | "lightning" | "void";
export type RoomId = "basic" | "advanced" | "master" | "legendary" | "celestial";
export type LetterTier = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type PotionCategory =
  | "speed"
  | "score"
  | "shield"
  | "magnet"
  | "xp"
  | "growth"
  | "mystery";

export interface AlchemyRoom {
  id: RoomId;
  name: string;
  description: string;
  requiredLevel: number;
  successBonus: number;
  unlockCost: number;
  icon: string;
  availableRecipes: string[];
}

export interface LetterTierInfo {
  tier: LetterTier;
  label: string;
  multiplier: number;
  successRate: number;
  cost: number;
  letters: string[];
}

export interface TransmutationRecipe {
  id: string;
  category: PotionCategory;
  name: string;
  description: string;
  ingredients: string[];
  requiredRoom: RoomId;
  resultPotion: string;
  successRate: number;
  cost: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  discoverable: boolean;
  discovered: boolean;
}

export interface Potion {
  id: string;
  name: string;
  category: PotionCategory;
  effect: string;
  strength: number;
  duration: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  icon: string;
  owned: number;
}

export interface ElementInfo {
  id: ElementId;
  name: string;
  icon: string;
  description: string;
  color: string;
  masteryLevel: number;
  xp: number;
  xpToNext: number;
}

export interface ElementCombo {
  id: string;
  elements: [ElementId, ElementId];
  name: string;
  description: string;
  effect: string;
  power: number;
}

export interface Elixir {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  effect: string;
  owned: number;
  brewable: boolean;
  brewCost: number;
  brewTime: number;
  brewStartedAt: number | null;
  brewReadyAt: number | null;
  collected: boolean;
  lastCollectedDate: string | null;
}

export interface TransmutationEntry {
  id: string;
  type: "letter" | "potion" | "elixir" | "element";
  target: string;
  success: boolean;
  timestamp: number;
  cost: number;
  result?: string;
}

export interface Material {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export interface ActiveBuff {
  id: string;
  name: string;
  effect: string;
  strength: number;
  appliedAt: number;
  expiresAt: number;
}

export interface DailyChallenge {
  dateSeed: string;
  clue: string;
  requiredIngredients: string[];
  rewardXP: number;
  rewardMaterial: string;
  rewardMaterialAmount: number;
  completed: boolean;
  completedAt: number | null;
}

export interface AlchemyState {
  labLevel: number;
  labXP: number;
  labXPToNext: number;
  coins: number;
  unlockedRooms: RoomId[];
  discoveredRecipes: string[];
  potions: Record<string, number>;
  activeBuffs: ActiveBuff[];
  elements: Record<ElementId, { masteryLevel: number; xp: number }>;
  elixirs: Record<string, number>;
  elixirBrewStarted: Record<string, number | null>;
  elixirBrewReady: Record<string, number | null>;
  elixirLastCollected: Record<string, string | null>;
  transmutationHistory: TransmutationEntry[];
  materials: Record<string, number>;
  dailyChallengeDate: string;
  dailyChallengeCompleted: boolean;
  totalTransmutations: number;
  totalSuccesses: number;
  alchemyScore: number;
  initializedAt: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROOMS: AlchemyRoom[] = [
  {
    id: "basic",
    name: "Basic Workshop",
    description: "A humble workspace for beginner alchemists. Simple transmutations only.",
    requiredLevel: 1,
    successBonus: 0,
    unlockCost: 0,
    icon: "⚗️",
    availableRecipes: [
      "rec_speed_basic",
      "rec_score_basic",
      "rec_shield_basic",
      "rec_magnet_basic",
      "rec_xp_basic",
      "rec_growth_basic",
    ],
  },
  {
    id: "advanced",
    name: "Advanced Laboratory",
    description: "Better equipment yields higher success rates and rarer recipes.",
    requiredLevel: 5,
    successBonus: 0.05,
    unlockCost: 500,
    icon: "🔬",
    availableRecipes: [
      "rec_speed_adv",
      "rec_score_adv",
      "rec_shield_adv",
      "rec_magnet_adv",
      "rec_xp_adv",
      "rec_growth_adv",
    ],
  },
  {
    id: "master",
    name: "Master Alchemy Hall",
    description: "Rare transmutations become possible in this well-stocked hall.",
    requiredLevel: 15,
    successBonus: 0.1,
    unlockCost: 2000,
    icon: "🏛️",
    availableRecipes: [
      "rec_speed_master",
      "rec_score_master",
      "rec_shield_master",
      "rec_magnet_master",
      "rec_xp_master",
      "rec_growth_master",
    ],
  },
  {
    id: "legendary",
    name: "Legendary Forge",
    description: "Epic-level alchemy with boosted success from the ancient forge.",
    requiredLevel: 30,
    successBonus: 0.15,
    unlockCost: 8000,
    icon: "⚒️",
    availableRecipes: [
      "rec_speed_legend",
      "rec_score_legend",
      "rec_shield_legend",
      "rec_magnet_legend",
      "rec_xp_legend",
      "rec_growth_legend",
    ],
  },
  {
    id: "celestial",
    name: "Celestial Observatory",
    description: "Transmute under the stars for the rarest results imaginable.",
    requiredLevel: 45,
    successBonus: 0.2,
    unlockCost: 25000,
    icon: "🌌",
    availableRecipes: [
      "rec_mystery_1",
      "rec_mystery_2",
      "rec_mystery_3",
      "rec_mystery_4",
      "rec_mystery_5",
      "rec_mystery_6",
    ],
  },
];

const LETTER_TIERS: LetterTierInfo[] = [
  {
    tier: "common",
    label: "Common",
    multiplier: 1,
    successRate: 0.8,
    cost: 10,
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  },
  {
    tier: "uncommon",
    label: "Uncommon",
    multiplier: 2,
    successRate: 0.65,
    cost: 50,
    letters: ["À", "É", "Ê", "Ë", "Î", "Ô", "Ù", "Ü"],
  },
  {
    tier: "rare",
    label: "Rare",
    multiplier: 3,
    successRate: 0.5,
    cost: 200,
    letters: ["Ä", "Ö", "ß", "Ñ", "Ç", "Ð"],
  },
  {
    tier: "epic",
    label: "Epic",
    multiplier: 4,
    successRate: 0.35,
    cost: 800,
    letters: ["Þ", "Æ", "Œ", "Ł", "Ħ"],
  },
  {
    tier: "legendary",
    label: "Legendary",
    multiplier: 5,
    successRate: 0.2,
    cost: 3000,
    letters: ["Ω", "Ψ", "Σ", "Δ", "Φ"],
  },
];

const RECIPES: Omit<TransmutationRecipe, "discovered">[] = [
  // --- Basic (Room: basic) ---
  { id: "rec_speed_basic", category: "speed", name: "Quick Sip", description: "A light speed boost for a few seconds.", ingredients: ["FAST", "GO"], requiredRoom: "basic", resultPotion: "pot_speed_minor", successRate: 0.85, cost: 20, rarity: "common", discoverable: false },
  { id: "rec_score_basic", category: "score", name: "Score Nudge", description: "Adds a small bonus to the next word scored.", ingredients: ["ADD", "TEN"], requiredRoom: "basic", resultPotion: "pot_score_minor", successRate: 0.85, cost: 20, rarity: "common", discoverable: false },
  { id: "rec_shield_basic", category: "shield", name: "Paper Shield", description: "A fragile shield that blocks one small hit.", ingredients: ["GUARD", "SAFE"], requiredRoom: "basic", resultPotion: "pot_shield_minor", successRate: 0.85, cost: 25, rarity: "common", discoverable: false },
  { id: "rec_magnet_basic", category: "magnet", name: "Tiny Magnet", description: "Attracts nearby letters for a short time.", ingredients: ["PULL", "NEAR"], requiredRoom: "basic", resultPotion: "pot_magnet_minor", successRate: 0.85, cost: 20, rarity: "common", discoverable: false },
  { id: "rec_xp_basic", category: "xp", name: "Spark of Wisdom", description: "Gain a small XP bonus.", ingredients: ["LEARN", "MORE"], requiredRoom: "basic", resultPotion: "pot_xp_minor", successRate: 0.85, cost: 15, rarity: "common", discoverable: false },
  { id: "rec_growth_basic", category: "growth", name: "Sprout Drop", description: "Snake grows by one segment.", ingredients: ["GROW", "PLUS"], requiredRoom: "basic", resultPotion: "pot_growth_minor", successRate: 0.85, cost: 20, rarity: "common", discoverable: false },

  // --- Advanced (Room: advanced) ---
  { id: "rec_speed_adv", category: "speed", name: "Swift Elixir", description: "Significant speed increase lasting 10 seconds.", ingredients: ["SWIFT", "WIND"], requiredRoom: "advanced", resultPotion: "pot_speed_moderate", successRate: 0.7, cost: 80, rarity: "uncommon", discoverable: false },
  { id: "rec_score_adv", category: "score", name: "Golden Ink", description: "Doubles score for the next word.", ingredients: ["GOLD", "INK"], requiredRoom: "advanced", resultPotion: "pot_score_moderate", successRate: 0.7, cost: 100, rarity: "uncommon", discoverable: false },
  { id: "rec_shield_adv", category: "shield", name: "Iron Guard", description: "A sturdy shield that absorbs two hits.", ingredients: ["IRON", "WALL"], requiredRoom: "advanced", resultPotion: "pot_shield_moderate", successRate: 0.7, cost: 90, rarity: "uncommon", discoverable: false },
  { id: "rec_magnet_adv", category: "magnet", name: "Gravity Well", description: "Pulls letters from a large radius.", ingredients: ["GRAVITY", "PULL"], requiredRoom: "advanced", resultPotion: "pot_magnet_moderate", successRate: 0.7, cost: 80, rarity: "uncommon", discoverable: false },
  { id: "rec_xp_adv", category: "xp", name: "Tome of Insight", description: "Grants a major XP boost.", ingredients: ["BOOK", "SMART"], requiredRoom: "advanced", resultPotion: "pot_xp_moderate", successRate: 0.7, cost: 70, rarity: "uncommon", discoverable: false },
  { id: "rec_growth_adv", category: "growth", name: "Vine Tonic", description: "Snake grows by three segments.", ingredients: ["VINE", "LUSH"], requiredRoom: "advanced", resultPotion: "pot_growth_moderate", successRate: 0.7, cost: 80, rarity: "uncommon", discoverable: false },

  // --- Master (Room: master) ---
  { id: "rec_speed_master", category: "speed", name: "Chrono Surge", description: "Near-max speed for 15 seconds with dash ability.", ingredients: ["TIME", "BLAZE"], requiredRoom: "master", resultPotion: "pot_speed_major", successRate: 0.55, cost: 350, rarity: "rare", discoverable: false },
  { id: "rec_score_master", category: "score", name: "Philosopher's Quill", description: "Triple score for 20 seconds.", ingredients: ["GEM", "WRITE"], requiredRoom: "master", resultPotion: "pot_score_major", successRate: 0.55, cost: 400, rarity: "rare", discoverable: false },
  { id: "rec_shield_master", category: "shield", name: "Diamond Aegis", description: "Impenetrable shield lasting 25 seconds.", ingredients: ["DIAMOND", "AEGIS"], requiredRoom: "master", resultPotion: "pot_shield_major", successRate: 0.55, cost: 380, rarity: "rare", discoverable: false },
  { id: "rec_magnet_master", category: "magnet", name: "Void Lure", description: "Attracts every letter on the board.", ingredients: ["VOID", "DRAW"], requiredRoom: "master", resultPotion: "pot_magnet_major", successRate: 0.55, cost: 350, rarity: "rare", discoverable: false },
  { id: "rec_xp_master", category: "xp", name: "Scroll of Ages", description: "Massive XP windfall.", ingredients: ["SCROLL", "AGE"], requiredRoom: "master", resultPotion: "pot_xp_major", successRate: 0.55, cost: 320, rarity: "rare", discoverable: false },
  { id: "rec_growth_master", category: "growth", name: "Ancient Bark", description: "Snake grows by five segments with armor.", ingredients: ["TREE", "ROOT"], requiredRoom: "master", resultPotion: "pot_growth_major", successRate: 0.55, cost: 360, rarity: "rare", discoverable: false },

  // --- Legendary (Room: legendary) ---
  { id: "rec_speed_legend", category: "speed", name: "Singularity Dash", description: "Phase through obstacles at maximum speed.", ingredients: ["STAR", "WARP"], requiredRoom: "legendary", resultPotion: "pot_speed_legendary", successRate: 0.4, cost: 1500, rarity: "epic", discoverable: true },
  { id: "rec_score_legend", category: "score", name: "Elysian Crown", description: "Quintuple score for the entire level.", ingredients: ["CROWN", "GLORY"], requiredRoom: "legendary", resultPotion: "pot_score_legendary", successRate: 0.4, cost: 1800, rarity: "epic", discoverable: true },
  { id: "rec_shield_legend", category: "shield", name: "Astral Barrier", description: "Complete invincibility for 30 seconds.", ingredients: ["Astral", "WARD"], requiredRoom: "legendary", resultPotion: "pot_shield_legendary", successRate: 0.4, cost: 1600, rarity: "epic", discoverable: true },
  { id: "rec_magnet_legend", category: "magnet", name: "Nebula Pull", description: "Creates a black hole that collects everything.", ingredients: ["NEBULA", "GRAV"], requiredRoom: "legendary", resultPotion: "pot_magnet_legendary", successRate: 0.4, cost: 1500, rarity: "epic", discoverable: true },
  { id: "rec_xp_legend", category: "xp", name: "Cosmic Codex", description: "Permanently increases XP gain by 50%.", ingredients: ["COSMOS", "CODE"], requiredRoom: "legendary", resultPotion: "pot_xp_legendary", successRate: 0.4, cost: 1400, rarity: "epic", discoverable: true },
  { id: "rec_growth_legend", category: "growth", name: "World Tree Sap", description: "Doubles snake length with regen.", ingredients: ["WORLD", "TREE"], requiredRoom: "legendary", resultPotion: "pot_growth_legendary", successRate: 0.4, cost: 1700, rarity: "epic", discoverable: true },

  // --- Celestial (Room: celestial) ---
  { id: "rec_mystery_1", category: "mystery", name: "Arcane Concoction Alpha", description: "Random powerful effect from the stars.", ingredients: ["ARCANE", "STAR"], requiredRoom: "celestial", resultPotion: "pot_mystery_alpha", successRate: 0.25, cost: 5000, rarity: "legendary", discoverable: true },
  { id: "rec_mystery_2", category: "mystery", name: "Eldritch Brew Beta", description: "A chaotic elixir of unimaginable power.", ingredients: ["ELDR", "BREW"], requiredRoom: "celestial", resultPotion: "pot_mystery_beta", successRate: 0.25, cost: 5000, rarity: "legendary", discoverable: true },
  { id: "rec_mystery_3", category: "mystery", name: "Aether Distillate Gamma", description: "Refined aether for transcendence.", ingredients: ["AETHER", "PURE"], requiredRoom: "celestial", resultPotion: "pot_mystery_gamma", successRate: 0.25, cost: 6000, rarity: "legendary", discoverable: true },
  { id: "rec_mystery_4", category: "mystery", name: "Null Essence Delta", description: "Harnessed from the void between worlds.", ingredients: ["NULL", "ESSENCE"], requiredRoom: "celestial", resultPotion: "pot_mystery_delta", successRate: 0.25, cost: 6000, rarity: "legendary", discoverable: true },
  { id: "rec_mystery_5", category: "mystery", name: "Infinity Flask Epsilon", description: "Contains a fraction of infinite energy.", ingredients: ["INFINITY", "FLASK"], requiredRoom: "celestial", resultPotion: "pot_mystery_epsilon", successRate: 0.25, cost: 8000, rarity: "legendary", discoverable: true },
  { id: "rec_mystery_6", category: "mystery", name: "Primordial Ooze Zeta", description: "The original substance of creation.", ingredients: ["PRIME", "OOZE"], requiredRoom: "celestial", resultPotion: "pot_mystery_zeta", successRate: 0.25, cost: 8000, rarity: "legendary", discoverable: true },
];

const POTIONS: Omit<Potion, "owned">[] = [
  { id: "pot_speed_minor", name: "Quick Sip", category: "speed", effect: "speed_boost", strength: 1.3, duration: 5, rarity: "common", icon: "💨" },
  { id: "pot_speed_moderate", name: "Swift Elixir", category: "speed", effect: "speed_boost", strength: 1.6, duration: 10, rarity: "uncommon", icon: "💨" },
  { id: "pot_speed_major", name: "Chrono Surge", category: "speed", effect: "speed_boost", strength: 2.0, duration: 15, rarity: "rare", icon: "💨" },
  { id: "pot_speed_legendary", name: "Singularity Dash", category: "speed", effect: "phase_through", strength: 3.0, duration: 20, rarity: "epic", icon: "💨" },
  { id: "pot_score_minor", name: "Score Nudge", category: "score", effect: "score_bonus", strength: 1.2, duration: 8, rarity: "common", icon: "⭐" },
  { id: "pot_score_moderate", name: "Golden Ink", category: "score", effect: "score_multiplier", strength: 2.0, duration: 12, rarity: "uncommon", icon: "⭐" },
  { id: "pot_score_major", name: "Philosopher's Quill", category: "score", effect: "score_multiplier", strength: 3.0, duration: 20, rarity: "rare", icon: "⭐" },
  { id: "pot_score_legendary", name: "Elysian Crown", category: "score", effect: "score_multiplier", strength: 5.0, duration: 60, rarity: "epic", icon: "⭐" },
  { id: "pot_shield_minor", name: "Paper Shield", category: "shield", effect: "shield_hits", strength: 1, duration: 10, rarity: "common", icon: "🛡️" },
  { id: "pot_shield_moderate", name: "Iron Guard", category: "shield", effect: "shield_hits", strength: 2, duration: 15, rarity: "uncommon", icon: "🛡️" },
  { id: "pot_shield_major", name: "Diamond Aegis", category: "shield", effect: "shield_invincible", strength: 1, duration: 25, rarity: "rare", icon: "🛡️" },
  { id: "pot_shield_legendary", name: "Astral Barrier", category: "shield", effect: "shield_invincible", strength: 1, duration: 30, rarity: "epic", icon: "🛡️" },
  { id: "pot_magnet_minor", name: "Tiny Magnet", category: "magnet", effect: "attract_radius", strength: 80, duration: 5, rarity: "common", icon: "🧲" },
  { id: "pot_magnet_moderate", name: "Gravity Well", category: "magnet", effect: "attract_radius", strength: 200, duration: 8, rarity: "uncommon", icon: "🧲" },
  { id: "pot_magnet_major", name: "Void Lure", category: "magnet", effect: "attract_all", strength: 1, duration: 6, rarity: "rare", icon: "🧲" },
  { id: "pot_magnet_legendary", name: "Nebula Pull", category: "magnet", effect: "attract_black_hole", strength: 1, duration: 10, rarity: "epic", icon: "🧲" },
  { id: "pot_xp_minor", name: "Spark of Wisdom", category: "xp", effect: "xp_bonus", strength: 50, duration: 0, rarity: "common", icon: "📖" },
  { id: "pot_xp_moderate", name: "Tome of Insight", category: "xp", effect: "xp_bonus", strength: 200, duration: 0, rarity: "uncommon", icon: "📖" },
  { id: "pot_xp_major", name: "Scroll of Ages", category: "xp", effect: "xp_bonus", strength: 800, duration: 0, rarity: "rare", icon: "📖" },
  { id: "pot_xp_legendary", name: "Cosmic Codex", category: "xp", effect: "xp_permanent", strength: 1.5, duration: 0, rarity: "epic", icon: "📖" },
  { id: "pot_growth_minor", name: "Sprout Drop", category: "growth", effect: "grow_segments", strength: 1, duration: 0, rarity: "common", icon: "🌱" },
  { id: "pot_growth_moderate", name: "Vine Tonic", category: "growth", effect: "grow_segments", strength: 3, duration: 0, rarity: "uncommon", icon: "🌱" },
  { id: "pot_growth_major", name: "Ancient Bark", category: "growth", effect: "grow_segments_armored", strength: 5, duration: 0, rarity: "rare", icon: "🌱" },
  { id: "pot_growth_legendary", name: "World Tree Sap", category: "growth", effect: "double_length_regen", strength: 1, duration: 15, rarity: "epic", icon: "🌱" },
  { id: "pot_mystery_alpha", name: "Arcane Concoction", category: "mystery", effect: "random_powerful", strength: 3, duration: 15, rarity: "legendary", icon: "🔮" },
  { id: "pot_mystery_beta", name: "Eldritch Brew", category: "mystery", effect: "random_chaotic", strength: 5, duration: 20, rarity: "legendary", icon: "🔮" },
  { id: "pot_mystery_gamma", name: "Aether Distillate", category: "mystery", effect: "transcendence", strength: 4, duration: 25, rarity: "legendary", icon: "🔮" },
  { id: "pot_mystery_delta", name: "Null Essence", category: "mystery", effect: "void_drain", strength: 6, duration: 15, rarity: "legendary", icon: "🔮" },
  { id: "pot_mystery_epsilon", name: "Infinity Flask", category: "mystery", effect: "infinite_energy", strength: 10, duration: 10, rarity: "legendary", icon: "🔮" },
  { id: "pot_mystery_zeta", name: "Primordial Ooze", category: "mystery", effect: "creation_burst", strength: 7, duration: 20, rarity: "legendary", icon: "🔮" },
];

const ELEMENT_DEFS: Omit<ElementInfo, "masteryLevel" | "xp" | "xpToNext">[] = [
  { id: "fire", name: "Fire", icon: "🔥", description: "Burns obstacles, adds score on kills.", color: "#FF4500" },
  { id: "water", name: "Water", icon: "💧", description: "Slows time, provides shields.", color: "#1E90FF" },
  { id: "earth", name: "Earth", icon: "🌿", description: "Extra length, growth effects.", color: "#32CD32" },
  { id: "air", name: "Air", icon: "💨", description: "Speed boosts and dash ability.", color: "#87CEEB" },
  { id: "lightning", name: "Lightning", icon: "⚡", description: "Chain reactions and combo bonuses.", color: "#FFD700" },
  { id: "void", name: "Void", icon: "🌀", description: "Mystery effects and random buffs.", color: "#8A2BE2" },
];

const ELEMENT_COMBOS: ElementCombo[] = [
  { id: "combo_fire_water", elements: ["fire", "water"], name: "Steam Surge", description: "Creates a steam cloud that obscures and damages.", effect: "steam_cloud", power: 3 },
  { id: "combo_fire_earth", elements: ["fire", "earth"], name: "Magma Flow", description: "Lava trail behind the snake.", effect: "lava_trail", power: 4 },
  { id: "combo_fire_air", elements: ["fire", "air"], name: "Firestorm", description: "Raining fire across the board.", effect: "fire_rain", power: 5 },
  { id: "combo_fire_lightning", elements: ["fire", "lightning"], name: "Plasma Bolt", description: "Devastating plasma projectile.", effect: "plasma_bolt", power: 6 },
  { id: "combo_fire_void", elements: ["fire", "void"], name: "Dark Flame", description: "Unextinguishable dark fire.", effect: "dark_flame", power: 7 },
  { id: "combo_water_earth", elements: ["water", "earth"], name: "Fertile Flood", description: "Floods area causing growth.", effect: "fertile_flood", power: 3 },
  { id: "combo_water_air", elements: ["water", "air"], name: "Mist Veil", description: "Thick mist providing invisibility.", effect: "mist_veil", power: 3 },
  { id: "combo_water_lightning", elements: ["water", "lightning"], name: "Thunderstorm", description: "Chain lightning in wet area.", effect: "thunderstorm", power: 5 },
  { id: "combo_water_void", elements: ["water", "void"], name: "Abyssal Tide", description: "Void-tainted water with random effects.", effect: "abyssal_tide", power: 6 },
  { id: "combo_earth_air", elements: ["earth", "air"], name: "Sandstorm", description: "Blinding sand reducing visibility.", effect: "sandstorm", power: 4 },
  { id: "combo_earth_lightning", elements: ["earth", "lightning"], name: "Crystal Shock", description: "Crystallized lightning explosions.", effect: "crystal_shock", power: 5 },
  { id: "combo_earth_void", elements: ["earth", "void"], name: "Gravity Well", description: "Earth-crushing gravity anomaly.", effect: "gravity_well", power: 7 },
  { id: "combo_air_lightning", elements: ["air", "lightning"], name: "Tempest", description: "Violent storm with lightning strikes.", effect: "tempest", power: 6 },
  { id: "combo_air_void", elements: ["air", "void"], name: "Vacuum Rift", description: "Tear in space pulling everything in.", effect: "vacuum_rift", power: 7 },
  { id: "combo_lightning_void", elements: ["lightning", "void"], name: "Void Spark", description: "Lightning from another dimension.", effect: "void_spark", power: 8 },
];

const ELIXIR_DEFS: Omit<Elixir, "owned" | "brewStartedAt" | "brewReadyAt" | "collected" | "lastCollectedDate">[] = [
  { id: "elix_vitality", name: "Vitality Draught", description: "Restores health and grants temporary regeneration.", icon: "❤️", rarity: "common", effect: "heal_regen", brewable: true, brewCost: 30, brewTime: 60 },
  { id: "elix_clarity", name: "Clarity Essence", description: "Reveals hidden letters on the board.", icon: "👁️", rarity: "common", effect: "reveal_letters", brewable: true, brewCost: 25, brewTime: 45 },
  { id: "elix_fortune", name: "Fortune Tonic", description: "Increases drop rates for rare letters.", icon: "🍀", rarity: "common", effect: "luck_boost", brewable: true, brewCost: 40, brewTime: 90 },
  { id: "elix_resilience", name: "Resilience Brew", description: "Reduces damage taken for a period.", icon: "💪", rarity: "uncommon", effect: "damage_reduction", brewable: true, brewCost: 120, brewTime: 180 },
  { id: "elix_bounty", name: "Bounty Serum", description: "Doubles coin rewards for 60 seconds.", icon: "💰", rarity: "uncommon", effect: "double_coins", brewable: true, brewCost: 150, brewTime: 240 },
  { id: "elix_agility", name: "Agility Tincture", description: "Improves snake maneuverability.", icon: "🦅", rarity: "uncommon", effect: "agility_boost", brewable: true, brewCost: 130, brewTime: 200 },
  { id: "elix_magnetism", name: "Magnetism Nectar", description: "Stronger letter attraction.", icon: "🧲", rarity: "uncommon", effect: "magnet_boost", brewable: true, brewCost: 140, brewTime: 220 },
  { id: "elix_elements", name: "Elemental Fusion", description: "Boosts all element mastery XP gains.", icon: "🌈", rarity: "rare", effect: "element_xp_boost", brewable: true, brewCost: 400, brewTime: 600 },
  { id: "elix_transmute", name: "Transmuter's Pride", description: "Guarantees next transmutation succeeds.", icon: "✨", rarity: "rare", effect: "guaranteed_success", brewable: true, brewCost: 500, brewTime: 720 },
  { id: "elix_ward", name: "Warden's Shield", description: "Auto-regenerating barrier.", icon: "🔰", rarity: "rare", effect: "auto_barrier", brewable: true, brewCost: 450, brewTime: 660 },
  { id: "elix_chronos", name: "Chrono Flask", description: "Slows game clock while keeping speed.", icon: "⏳", rarity: "rare", effect: "time_slow", brewable: true, brewCost: 480, brewTime: 700 },
  { id: "elix_dragon", name: "Dragon Breath", description: "Adds fire damage to all actions.", icon: "🐲", rarity: "epic", effect: "fire_aura", brewable: true, brewCost: 1500, brewTime: 1200 },
  { id: "elix_void_tap", name: "Void Tap", description: "Channels void energy for random power.", icon: "🕳️", rarity: "epic", effect: "void_channel", brewable: true, brewCost: 1800, brewTime: 1500 },
  { id: "elix_immortal", name: "Immortal Tears", description: "Prevents one death entirely.", icon: "🛡️", rarity: "epic", effect: "death_prevent", brewable: true, brewCost: 2000, brewTime: 1800 },
  { id: "elix_cosmos", name: "Cosmic Ambrosia", description: "Ultimate elixir: all stats boosted.", icon: "🌌", rarity: "legendary", effect: "all_stats_boost", brewable: true, brewCost: 5000, brewTime: 3600 },
];

const MATERIALS_DEFS: Omit<Material, "count">[] = [
  { id: "mat_herb", name: "Common Herb", icon: "🌿", description: "A basic alchemical herb found everywhere.", rarity: "common" },
  { id: "mat_crystal_shard", name: "Crystal Shard", icon: "💎", description: "A small piece of crystallized mana.", rarity: "uncommon" },
  { id: "mat_dragon_scale", name: "Dragon Scale", icon: "🐉", description: "A shimmering scale from a young dragon.", rarity: "rare" },
  { id: "mat_phoenix_feather", name: "Phoenix Feather", icon: "🪶", description: "A feather from a reborn phoenix.", rarity: "epic" },
  { id: "mat_void_essence", name: "Void Essence", icon: "🌀", description: "Condensed energy from the void.", rarity: "legendary" },
  { id: "mat_stardust", name: "Stardust", icon: "✨", description: "Cosmic dust gathered from meteorites.", rarity: "uncommon" },
  { id: "mat_moonstone", name: "Moonstone", icon: "🌙", description: "A luminous stone imbued with lunar energy.", rarity: "rare" },
  { id: "mat_ancient_bark", name: "Ancient Bark", icon: "🌳", description: "Bark from the oldest tree in the forest.", rarity: "common" },
  { id: "mat_fire_ruby", name: "Fire Ruby", icon: "🔴", description: "A ruby burning with eternal flame.", rarity: "rare" },
  { id: "mat_ocean_pearl", name: "Ocean Pearl", icon: "🔵", description: "A pearl formed in magical tides.", rarity: "uncommon" },
];

// ---------------------------------------------------------------------------
// Deterministic pseudo-random (date-seeded)
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.35, level));
}

function xpForMastery(level: number): number {
  return Math.floor(50 * Math.pow(1.25, level));
}

// ---------------------------------------------------------------------------
// State — SSR-safe lazy init
// ---------------------------------------------------------------------------

let state: AlchemyState | null = null;

function createInitialState(): AlchemyState {
  const now = Date.now();
  const elementState: Record<ElementId, { masteryLevel: number; xp: number }> = {
    fire: { masteryLevel: 1, xp: 0 },
    water: { masteryLevel: 1, xp: 0 },
    earth: { masteryLevel: 1, xp: 0 },
    air: { masteryLevel: 1, xp: 0 },
    lightning: { masteryLevel: 1, xp: 0 },
    void: { masteryLevel: 1, xp: 0 },
  };

  const potionsInit: Record<string, number> = {};
  for (const p of POTIONS) potionsInit[p.id] = 0;

  const elixirsInit: Record<string, number> = {};
  const elixirBrewStart: Record<string, number | null> = {};
  const elixirBrewReady: Record<string, number | null> = {};
  const elixirLastCollect: Record<string, string | null> = {};
  for (const e of ELIXIR_DEFS) {
    elixirsInit[e.id] = 0;
    elixirBrewStart[e.id] = null;
    elixirBrewReady[e.id] = null;
    elixirLastCollect[e.id] = null;
  }

  const materialsInit: Record<string, number> = {};
  for (const m of MATERIALS_DEFS) materialsInit[m.id] = 0;

  return {
    labLevel: 1,
    labXP: 0,
    labXPToNext: xpForLevel(1),
    coins: 100,
    unlockedRooms: ["basic" as RoomId],
    discoveredRecipes: [],
    potions: potionsInit,
    activeBuffs: [],
    elements: elementState,
    elixirs: elixirsInit,
    elixirBrewStarted: elixirBrewStart,
    elixirBrewReady: elixirBrewReady,
    elixirLastCollected: elixirLastCollect,
    transmutationHistory: [],
    materials: materialsInit,
    dailyChallengeDate: "",
    dailyChallengeCompleted: false,
    totalTransmutations: 0,
    totalSuccesses: 0,
    alchemyScore: 0,
    initializedAt: now,
  };
}

function ensureInit(): AlchemyState {
  if (!state) {
    state = createInitialState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// 1. State Management
// ---------------------------------------------------------------------------

export function alGetState(): AlchemyState {
  return ensureInit();
}

export function alResetState(): void {
  state = createInitialState();
}

// ---------------------------------------------------------------------------
// 2. Lab Progression
// ---------------------------------------------------------------------------

export function alGetLabLevel(): number {
  return ensureInit().labLevel;
}

export function alGetLab(): { level: number; xp: number; xpToNext: number } {
  const s = ensureInit();
  return { level: s.labLevel, xp: s.labXP, xpToNext: s.labXPToNext };
}

export function alAddLabXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  s.labXP += amount;
  let leveledUp = false;
  while (s.labXP >= s.labXPToNext) {
    s.labXP -= s.labXPToNext;
    s.labLevel += 1;
    s.labXPToNext = xpForLevel(s.labLevel);
    leveledUp = true;
    // Unlock rooms on level-up
    for (const room of ROOMS) {
      if (s.labLevel >= room.requiredLevel && !s.unlockedRooms.includes(room.id)) {
        s.unlockedRooms.push(room.id);
      }
    }
  }
  s.alchemyScore += amount;
  return { leveledUp, newLevel: s.labLevel };
}

// ---------------------------------------------------------------------------
// 3. Lab Rooms
// ---------------------------------------------------------------------------

export function alGetRooms(): AlchemyRoom[] {
  return ROOMS;
}

export function alUnlockRoom(roomId: RoomId): { success: boolean; reason?: string } {
  const s = ensureInit();
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) return { success: false, reason: "Room not found" };
  if (s.unlockedRooms.includes(roomId)) return { success: false, reason: "Already unlocked" };
  if (s.labLevel < room.requiredLevel) return { success: false, reason: `Requires lab level ${room.requiredLevel}` };
  if (s.coins < room.unlockCost) return { success: false, reason: `Costs ${room.unlockCost} coins` };

  s.coins -= room.unlockCost;
  s.unlockedRooms.push(roomId);
  s.alchemyScore += 50;
  return { success: true };
}

// ---------------------------------------------------------------------------
// 4. Letter Tiers & Transmutation
// ---------------------------------------------------------------------------

export function alGetLetterTiers(): LetterTierInfo[] {
  return LETTER_TIERS;
}

export function alGetSuccessRate(tier: LetterTier): number {
  const info = LETTER_TIERS.find((t) => t.tier === tier);
  if (!info) return 0;
  const s = ensureInit();
  const roomBonus = getHighestRoomBonus(s);
  return Math.min(1, info.successRate + roomBonus);
}

function getHighestRoomBonus(s: AlchemyState): number {
  let best = 0;
  for (const roomId of s.unlockedRooms) {
    const room = ROOMS.find((r) => r.id === roomId);
    if (room && room.successBonus > best) best = room.successBonus;
  }
  return best;
}

export function alGetTransmutationCost(tier: LetterTier): number {
  const info = LETTER_TIERS.find((t) => t.tier === tier);
  return info ? info.cost : 0;
}

export function alTransmuteLetters(letters: string[]): {
  success: boolean;
  result?: { tier: LetterTier; letter: string };
  cost: number;
  newCoins: number;
} {
  const s = ensureInit();
  if (letters.length < 2 || letters.length > 3) {
    return { success: false, cost: 0, newCoins: s.coins };
  }

  // Determine the target tier based on input
  const inputTier = determineLetterTier(letters);
  const targetTierIndex = Math.min(
    LETTER_TIERS.findIndex((t) => t.tier === inputTier) + 1,
    LETTER_TIERS.length - 1,
  );
  const targetTierInfo = LETTER_TIERS[targetTierIndex];
  const cost = targetTierInfo.cost;

  if (s.coins < cost) {
    return { success: false, cost, newCoins: s.coins };
  }

  const rate = alGetSuccessRate(targetTierInfo.tier);
  const roll = Math.random();
  const success = roll < rate;

  s.coins -= cost;
  s.totalTransmutations += 1;

  if (success) {
    const randomIndex = Math.floor(Math.random() * targetTierInfo.letters.length);
    const resultLetter = targetTierInfo.letters[randomIndex];
    s.totalSuccesses += 1;
    s.alchemyScore += targetTierInfo.multiplier * 10;

    s.transmutationHistory.push({
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: "letter",
      target: resultLetter,
      success: true,
      timestamp: Date.now(),
      cost,
      result: `${targetTierInfo.tier}:${resultLetter}`,
    });

    // Award some XP
    alAddLabXP(Math.floor(cost / 4));

    return { success: true, result: { tier: targetTierInfo.tier, letter: resultLetter }, cost, newCoins: s.coins };
  } else {
    s.transmutationHistory.push({
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: "letter",
      target: letters.join("+"),
      success: false,
      timestamp: Date.now(),
      cost,
    });

    alAddLabXP(Math.floor(cost / 10));

    return { success: false, cost, newCoins: s.coins };
  }
}

function determineLetterTier(letters: string[]): LetterTier {
  let highestIdx = 0;
  for (const letter of letters) {
    for (let i = 0; i < LETTER_TIERS.length; i++) {
      if (LETTER_TIERS[i].letters.includes(letter) && i > highestIdx) {
        highestIdx = i;
      }
    }
  }
  return LETTER_TIERS[highestIdx].tier;
}

// ---------------------------------------------------------------------------
// 5. Recipes
// ---------------------------------------------------------------------------

export function alGetRecipes(): TransmutationRecipe[] {
  const s = ensureInit();
  return RECIPES.map((r) => ({
    ...r,
    discovered: s.discoveredRecipes.includes(r.id) || !r.discoverable,
  }));
}

export function alGetDiscoveredRecipes(): TransmutationRecipe[] {
  const s = ensureInit();
  return RECIPES.filter(
    (r) => s.discoveredRecipes.includes(r.id) || !r.discoverable,
  ).map((r) => ({ ...r, discovered: true }));
}

export function alDiscoverRecipe(recipeId: string): { discovered: boolean; reason?: string } {
  const s = ensureInit();
  const recipe = RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { discovered: false, reason: "Recipe not found" };
  if (!recipe.discoverable) return { discovered: false, reason: "Not discoverable" };
  if (s.discoveredRecipes.includes(recipeId)) return { discovered: false, reason: "Already discovered" };
  s.discoveredRecipes.push(recipeId);
  s.alchemyScore += 100;
  return { discovered: true };
}

// ---------------------------------------------------------------------------
// 6. Potions
// ---------------------------------------------------------------------------

export function alGetPotions(): (Potion & { owned: number })[] {
  const s = ensureInit();
  return POTIONS.map((p) => ({ ...p, owned: s.potions[p.id] ?? 0 }));
}

export function alBrewPotion(recipeId: string): {
  success: boolean;
  reason?: string;
  potion?: { id: string; name: string; icon: string };
} {
  const s = ensureInit();
  const recipe = RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { success: false, reason: "Recipe not found" };

  // Check if recipe is discovered
  if (recipe.discoverable && !s.discoveredRecipes.includes(recipeId)) {
    return { success: false, reason: "Recipe not yet discovered" };
  }

  // Check room
  if (!s.unlockedRooms.includes(recipe.requiredRoom)) {
    return { success: false, reason: "Required room not unlocked" };
  }

  // Check cost
  if (s.coins < recipe.cost) {
    return { success: false, reason: `Insufficient coins (need ${recipe.cost})` };
  }

  s.coins -= recipe.cost;
  s.totalTransmutations += 1;

  // Calculate success
  const roomBonus = getHighestRoomBonus(s);
  const rate = Math.min(1, recipe.successRate + roomBonus);
  const success = Math.random() < rate;

  if (success) {
    s.potions[recipe.resultPotion] = (s.potions[recipe.resultPotion] ?? 0) + 1;
    s.totalSuccesses += 1;
    s.alchemyScore += 25;

    const potion = POTIONS.find((p) => p.id === recipe.resultPotion);

    s.transmutationHistory.push({
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: "potion",
      target: recipeId,
      success: true,
      timestamp: Date.now(),
      cost: recipe.cost,
      result: recipe.resultPotion,
    });

    alAddLabXP(Math.floor(recipe.cost / 3));

    return {
      success: true,
      potion: potion ? { id: potion.id, name: potion.name, icon: potion.icon } : undefined,
    };
  } else {
    s.transmutationHistory.push({
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: "potion",
      target: recipeId,
      success: false,
      timestamp: Date.now(),
      cost: recipe.cost,
    });

    alAddLabXP(Math.floor(recipe.cost / 8));

    return { success: false, reason: "Transmutation failed" };
  }
}

export function alUsePotion(potionId: string): {
  used: boolean;
  reason?: string;
  buff?: ActiveBuff;
} {
  const s = ensureInit();
  const owned = s.potions[potionId] ?? 0;
  if (owned <= 0) return { used: false, reason: "No potions owned" };

  const potion = POTIONS.find((p) => p.id === potionId);
  if (!potion) return { used: false, reason: "Potion not found" };

  s.potions[potionId] -= 1;

  const buff: ActiveBuff = {
    id: `buff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: potion.name,
    effect: potion.effect,
    strength: potion.strength,
    appliedAt: Date.now(),
    expiresAt: Date.now() + potion.duration * 1000,
  };
  s.activeBuffs.push(buff);

  return { used: true, buff };
}

// ---------------------------------------------------------------------------
// 7. Elements
// ---------------------------------------------------------------------------

export function alGetElements(): ElementInfo[] {
  const s = ensureInit();
  return ELEMENT_DEFS.map((def) => {
    const el = s.elements[def.id];
    return {
      ...def,
      masteryLevel: el.masteryLevel,
      xp: el.xp,
      xpToNext: xpForMastery(el.masteryLevel),
    };
  });
}

export function alGetElementMastery(element: ElementId): { level: number; xp: number; xpToNext: number } {
  const s = ensureInit();
  const el = s.elements[element];
  if (!el) return { level: 0, xp: 0, xpToNext: 0 };
  return { level: el.masteryLevel, xp: el.xp, xpToNext: xpForMastery(el.masteryLevel) };
}

export function alAddElementXP(element: ElementId, amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  const el = s.elements[element];
  if (!el) return { leveledUp: false, newLevel: 0 };

  el.xp += amount;
  let leveledUp = false;
  while (el.xp >= xpForMastery(el.masteryLevel) && el.masteryLevel < 5) {
    el.xp -= xpForMastery(el.masteryLevel);
    el.masteryLevel += 1;
    leveledUp = true;
  }
  s.alchemyScore += amount;
  return { leveledUp, newLevel: el.masteryLevel };
}

export function alGetElementCombos(): ElementCombo[] {
  return ELEMENT_COMBOS;
}

export function alCombineElements(el1: ElementId, el2: ElementId): {
  combo: ElementCombo | null;
  unlocked: boolean;
} {
  const s = ensureInit();
  // Ensure alphabetical order for lookup
  const sorted: [ElementId, ElementId] = el1 < el2 ? [el1, el2] : [el2, el1];
  const combo = ELEMENT_COMBOS.find(
    (c) => c.elements[0] === sorted[0] && c.elements[1] === sorted[1],
  );
  if (!combo) return { combo: null, unlocked: false };

  // Both elements must be at least level 2
  const e1 = s.elements[sorted[0]];
  const e2 = s.elements[sorted[1]];
  const unlocked = e1.masteryLevel >= 2 && e2.masteryLevel >= 2;

  if (unlocked) {
    s.alchemyScore += 30;
  }

  return { combo, unlocked };
}

// ---------------------------------------------------------------------------
// 8. Elixirs
// ---------------------------------------------------------------------------

export function alGetElixirs(): Elixir[] {
  const s = ensureInit();
  return ELIXIR_DEFS.map((def) => ({
    ...def,
    owned: s.elixirs[def.id] ?? 0,
    brewStartedAt: s.elixirBrewStarted[def.id] ?? null,
    brewReadyAt: s.elixirBrewReady[def.id] ?? null,
    collected: false,
    lastCollectedDate: s.elixirLastCollected[def.id] ?? null,
  }));
}

export function alBrewElixir(elixirId: string): { started: boolean; reason?: string; readyAt: number } {
  const s = ensureInit();
  const def = ELIXIR_DEFS.find((e) => e.id === elixirId);
  if (!def) return { started: false, reason: "Elixir not found", readyAt: 0 };

  // Check if already brewing
  if (s.elixirBrewStarted[elixirId] !== null) {
    const readyAt = s.elixirBrewReady[elixirId] ?? 0;
    if (Date.now() < readyAt) {
      return { started: false, reason: "Already brewing", readyAt };
    }
    // Brew finished, auto-collect
    s.elixirs[elixirId] = (s.elixirs[elixirId] ?? 0) + 1;
    s.elixirBrewStarted[elixirId] = null;
    s.elixirBrewReady[elixirId] = null;
  }

  if (s.coins < def.brewCost) {
    return { started: false, reason: `Costs ${def.brewCost} coins`, readyAt: 0 };
  }

  s.coins -= def.brewCost;
  const now = Date.now();
  const readyAt = now + def.brewTime * 1000;
  s.elixirBrewStarted[elixirId] = now;
  s.elixirBrewReady[elixirId] = readyAt;
  s.totalTransmutations += 1;

  s.transmutationHistory.push({
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: "elixir",
    target: elixirId,
    success: true,
    timestamp: now,
    cost: def.brewCost,
  });

  alAddLabXP(Math.floor(def.brewCost / 5));

  return { started: true, readyAt };
}

export function alCollectElixir(elixirId: string): { collected: boolean; reason?: string } {
  const s = ensureInit();
  const def = ELIXIR_DEFS.find((e) => e.id === elixirId);
  if (!def) return { collected: false, reason: "Elixir not found" };

  if (s.elixirBrewStarted[elixirId] === null) {
    return { collected: false, reason: "Nothing to collect" };
  }

  const readyAt = s.elixirBrewReady[elixirId] ?? 0;
  if (Date.now() < readyAt) {
    return { collected: false, reason: "Still brewing" };
  }

  s.elixirs[elixirId] = (s.elixirs[elixirId] ?? 0) + 1;
  s.elixirBrewStarted[elixirId] = null;
  s.elixirBrewReady[elixirId] = null;
  const today = todayDateString();
  s.elixirLastCollected[elixirId] = today;

  return { collected: true };
}

// ---------------------------------------------------------------------------
// 9. Daily Challenge
// ---------------------------------------------------------------------------

export function alGetDailyChallenge(): DailyChallenge {
  const s = ensureInit();
  const today = todayDateString();

  // Reset daily challenge if date changed
  if (s.dailyChallengeDate !== today) {
    s.dailyChallengeDate = today;
    s.dailyChallengeCompleted = false;

    // Generate challenge from date seed
    const rng = seededRandom(dateSeed(today));
    const recipeIndex = Math.floor(rng() * RECIPES.length);
    const recipe = RECIPES[recipeIndex];

    // Store the recipe id in materials as a marker
    s.materials["daily_recipe"] = recipeIndex;

    return {
      dateSeed: today,
      clue: `Brew a potion using: ${recipe.ingredients.join(" + ")}`,
      requiredIngredients: recipe.ingredients,
      rewardXP: 200 + Math.floor(rng() * 300),
      rewardMaterial: MATERIALS_DEFS[Math.floor(rng() * MATERIALS_DEFS.length)].id,
      rewardMaterialAmount: 1 + Math.floor(rng() * 3),
      completed: false,
      completedAt: null,
    };
  }

  // Return existing challenge
  const rng = seededRandom(dateSeed(today));
  const recipeIndex = Math.floor(rng() * RECIPES.length);
  const recipe = RECIPES[recipeIndex];

  return {
    dateSeed: today,
    clue: `Brew a potion using: ${recipe.ingredients.join(" + ")}`,
    requiredIngredients: recipe.ingredients,
    rewardXP: 200 + Math.floor(rng() * 300),
    rewardMaterial: MATERIALS_DEFS[Math.floor(rng() * MATERIALS_DEFS.length)].id,
    rewardMaterialAmount: 1 + Math.floor(rng() * MATERIALS_DEFS.length),
    completed: s.dailyChallengeCompleted,
    completedAt: null,
  };
}

export function alCompleteDailyChallenge(): { completed: boolean; reward: { xp: number; material: string; amount: number } } {
  const s = ensureInit();
  const challenge = alGetDailyChallenge();

  if (s.dailyChallengeCompleted) {
    return { completed: false, reward: { xp: 0, material: "", amount: 0 } };
  }

  s.dailyChallengeCompleted = true;
  s.materials[challenge.rewardMaterial] =
    (s.materials[challenge.rewardMaterial] ?? 0) + challenge.rewardMaterialAmount;
  alAddLabXP(challenge.rewardXP);
  s.alchemyScore += challenge.rewardXP;

  return {
    completed: true,
    reward: {
      xp: challenge.rewardXP,
      material: challenge.rewardMaterial,
      amount: challenge.rewardMaterialAmount,
    },
  };
}

// ---------------------------------------------------------------------------
// 10. UI Helpers — Overview, Dashboard, Cards
// ---------------------------------------------------------------------------

export function alGetAlchemyOverview(): {
  labLevel: number;
  coins: number;
  unlockedRooms: number;
  totalRooms: number;
  discoveredRecipes: number;
  totalRecipes: number;
  elementsMastered: number;
  elixirsCollected: number;
  totalTransmutations: number;
  successRate: number;
  alchemyScore: number;
} {
  const s = ensureInit();
  return {
    labLevel: s.labLevel,
    coins: s.coins,
    unlockedRooms: s.unlockedRooms.length,
    totalRooms: ROOMS.length,
    discoveredRecipes: s.discoveredRecipes.length + RECIPES.filter((r) => !r.discoverable).length,
    totalRecipes: RECIPES.length,
    elementsMastered: Object.values(s.elements).filter((e) => e.masteryLevel >= 5).length,
    elixirsCollected: Object.values(s.elixirs).reduce((a, b) => a + b, 0),
    totalTransmutations: s.totalTransmutations,
    successRate: s.totalTransmutations > 0 ? s.totalSuccesses / s.totalTransmutations : 0,
    alchemyScore: s.alchemyScore,
  };
}

export function alGetLabDashboard(): {
  lab: { level: number; xp: number; xpToNext: number; xpPercent: number };
  rooms: Array<{ id: RoomId; name: string; icon: string; unlocked: boolean; requiredLevel: number }>;
  recentActivity: TransmutationEntry[];
  coins: number;
} {
  const s = ensureInit();
  const recent = [...s.transmutationHistory].reverse().slice(0, 10);
  return {
    lab: {
      level: s.labLevel,
      xp: s.labXP,
      xpToNext: s.labXPToNext,
      xpPercent: s.labXPToNext > 0 ? Math.round((s.labXP / s.labXPToNext) * 100) : 0,
    },
    rooms: ROOMS.map((r) => ({
      id: r.id,
      name: r.name,
      icon: r.icon,
      unlocked: s.unlockedRooms.includes(r.id),
      requiredLevel: r.requiredLevel,
    })),
    recentActivity: recent,
    coins: s.coins,
  };
}

export function alGetRecipeCard(recipeId: string): {
  exists: boolean;
  card?: {
    id: string;
    name: string;
    description: string;
    category: PotionCategory;
    ingredients: string[];
    resultPotion: string;
    rarity: string;
    successRate: number;
    cost: number;
    discovered: boolean;
    requiredRoom: string;
  };
} {
  const s = ensureInit();
  const recipe = RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { exists: false };

  return {
    exists: true,
    card: {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      ingredients: recipe.ingredients,
      resultPotion: recipe.resultPotion,
      rarity: recipe.rarity,
      successRate: recipe.successRate,
      cost: recipe.cost,
      discovered: s.discoveredRecipes.includes(recipe.id) || !recipe.discoverable,
      requiredRoom: recipe.requiredRoom,
    },
  };
}

export function alGetElementCard(element: ElementId): {
  exists: boolean;
  card?: {
    id: ElementId;
    name: string;
    icon: string;
    description: string;
    color: string;
    masteryLevel: number;
    xp: number;
    xpToNext: number;
    combosAvailable: number;
    combosTotal: number;
  };
} {
  const s = ensureInit();
  const def = ELEMENT_DEFS.find((e) => e.id === element);
  if (!def) return { exists: false };

  const el = s.elements[element];
  const combosTotal = ELEMENT_COMBOS.filter(
    (c) => c.elements[0] === element || c.elements[1] === element,
  ).length;

  return {
    exists: true,
    card: {
      id: def.id,
      name: def.name,
      icon: def.icon,
      description: def.description,
      color: def.color,
      masteryLevel: el.masteryLevel,
      xp: el.xp,
      xpToNext: xpForMastery(el.masteryLevel),
      combosAvailable: el.masteryLevel >= 2 ? combosTotal : 0,
      combosTotal,
    },
  };
}

export function alGetElixirCard(elixirId: string): {
  exists: boolean;
  card?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    effect: string;
    owned: number;
    brewCost: number;
    brewTime: number;
    isBrewing: boolean;
    isReady: boolean;
    readyAt: number | null;
  };
} {
  const s = ensureInit();
  const def = ELIXIR_DEFS.find((e) => e.id === elixirId);
  if (!def) return { exists: false };

  const isBrewing = s.elixirBrewStarted[elixirId] !== null;
  const readyAt = s.elixirBrewReady[elixirId] ?? null;
  const isReady = readyAt !== null && Date.now() >= readyAt;

  return {
    exists: true,
    card: {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      rarity: def.rarity,
      effect: def.effect,
      owned: s.elixirs[elixirId] ?? 0,
      brewCost: def.brewCost,
      brewTime: def.brewTime,
      isBrewing,
      isReady,
      readyAt,
    },
  };
}

// ---------------------------------------------------------------------------
// 11. History & Materials
// ---------------------------------------------------------------------------

export function alGetTransmutationHistory(limit?: number): TransmutationEntry[] {
  const s = ensureInit();
  const history = [...s.transmutationHistory].reverse();
  return limit ? history.slice(0, limit) : history;
}

export function alGetMaterials(): Material[] {
  const s = ensureInit();
  return MATERIALS_DEFS.map((def) => ({
    ...def,
    count: s.materials[def.id] ?? 0,
  }));
}

export function alGetMaterialsCount(materialId: string): number {
  const s = ensureInit();
  return s.materials[materialId] ?? 0;
}

export function alSpendMaterial(materialId: string, amount: number): { success: boolean; reason?: string; remaining: number } {
  const s = ensureInit();
  const current = s.materials[materialId] ?? 0;
  if (current < amount) {
    return { success: false, reason: `Not enough material (have ${current}, need ${amount})`, remaining: current };
  }
  s.materials[materialId] = current - amount;
  return { success: true, remaining: s.materials[materialId] };
}

// ---------------------------------------------------------------------------
// 12. Active Buffs & Effects
// ---------------------------------------------------------------------------

export function alGetPotionEffects(): Array<{
  id: string;
  name: string;
  category: PotionCategory;
  effect: string;
  strength: number;
  duration: number;
  rarity: string;
  icon: string;
}> {
  return POTIONS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    effect: p.effect,
    strength: p.strength,
    duration: p.duration,
    rarity: p.rarity,
    icon: p.icon,
  }));
}

export function alGetActiveBuffs(): ActiveBuff[] {
  const s = ensureInit();
  const now = Date.now();
  // Purge expired buffs
  s.activeBuffs = s.activeBuffs.filter((b) => b.expiresAt > now);
  return [...s.activeBuffs];
}

// ---------------------------------------------------------------------------
// 13. Alchemy Score
// ---------------------------------------------------------------------------

export function alGetAlchemyScore(): number {
  return ensureInit().alchemyScore;
}

// ---------------------------------------------------------------------------
// 14. Element Combo Results
// ---------------------------------------------------------------------------

export function alGetElementComboResults(): Array<{
  id: string;
  name: string;
  elements: [ElementId, ElementId];
  description: string;
  effect: string;
  power: number;
  unlocked: boolean;
}> {
  const s = ensureInit();
  return ELEMENT_COMBOS.map((c) => {
    const e1 = s.elements[c.elements[0]];
    const e2 = s.elements[c.elements[1]];
    return {
      ...c,
      unlocked: e1.masteryLevel >= 2 && e2.masteryLevel >= 2,
    };
  });
}
