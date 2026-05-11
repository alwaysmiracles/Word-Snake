// =============================================================================
// Elemental Forge Wire — Word Snake Game Elemental Crafting System
// =============================================================================
// SSR-safe module: no localStorage, window, document, setInterval, setTimeout.
// All public functions use the `ef` prefix. No React Hook naming (`use*`).
// =============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

/** The six primal elements available for forging. */
export type EfElementId = "fire" | "water" | "earth" | "air" | "lightning" | "void";

/** Item category classification. */
export type EfItemCategory = "weapon" | "armor" | "accessory" | "tool" | "relic";

/** Rarity tiers for forgeable items. */
export type EfRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

/** Quality tiers resulting from forge precision. */
export type EfQuality = "Flawed" | "Normal" | "Fine" | "Perfect" | "Masterwork";

/** Unique identifier for each forge station. */
export type EfStationId =
  | "basic_anvil"
  | "elemental_crucible"
  | "arcane_furnace"
  | "celestial_forge"
  | "shadow_crucible"
  | "storm_forge"
  | "crystal_kiln"
  | "dragons_heart";

/** Unique identifier for each raw material. */
export type EfMaterialId =
  | "iron_ore"
  | "enchanted_wood"
  | "crystal_shard"
  | "dragon_scale"
  | "shadow_essence"
  | "storm_fragment"
  | "void_crystal"
  | "phoenix_feather";

/** Unique identifier for each achievement. */
export type EfAchievementId =
  | "first_forge"
  | "ten_forges"
  | "master_blacksmith"
  | "elemental_novice"
  | "elemental_adept"
  | "elemental_master"
  | "elemental_lord"
  | "rare_find"
  | "epic_discovery"
  | "legendary_craftsman"
  | "enhancement_pro"
  | "streak_five"
  | "streak_ten"
  | "daily_devotee"
  | "market_trader";

export interface EfElement {
  /** Unique element identifier. */
  id: EfElementId;
  /** Display name of the element. */
  name: string;
  /** Emoji icon for the element. */
  icon: string;
  /** Short lore description. */
  description: string;
  /** Hex color representing the element. */
  color: string;
}

export interface EfForgeableItem {
  /** Unique item identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Emoji icon. */
  emoji: string;
  /** Item category. */
  category: EfItemCategory;
  /** Rarity tier. */
  rarity: EfRarity;
  /** Elements required to forge this item. */
  requiredElements: EfElementId[];
  /** Required element mastery levels (parallel to requiredElements). */
  requiredMastery: number[];
  /** Base forge time in seconds. */
  forgeTime: number;
  /** Base stat values for the item. */
  stats: Record<string, number>;
  /** Base power level of the item. */
  power: number;
  /** Coin cost to attempt forging. */
  forgeCost: number;
  /** Minimum player level required. */
  requiredLevel: number;
}

export interface EfForgeStation {
  /** Unique station identifier. */
  id: EfStationId;
  /** Display name. */
  name: string;
  /** Emoji icon. */
  icon: string;
  /** Short description of the station. */
  description: string;
  /** Player level required to unlock. */
  unlockLevel: number;
  /** Coin cost to unlock. */
  unlockCost: number;
  /** Success bonus multiplier (0–0.4). */
  qualityBonus: number;
  /** XP bonus multiplier (1.0–2.0). */
  xpBonus: number;
  /** Whether the station is unlocked. */
  unlocked: boolean;
  /** Current upgrade level (1–5). */
  upgradeLevel: number;
}

export interface EfReaction {
  /** Unique reaction identifier. */
  id: string;
  /** The two elements that combine. */
  elements: [EfElementId, EfElementId];
  /** Name of the resulting material. */
  resultName: string;
  /** Emoji of the resulting material. */
  resultEmoji: string;
  /** Description of the reaction. */
  description: string;
  /** Power value of the resulting material. */
  power: number;
  /** Whether the player has discovered this reaction. */
  discovered: boolean;
}

export interface EfMaterial {
  /** Unique material identifier. */
  id: EfMaterialId;
  /** Display name. */
  name: string;
  /** Emoji icon. */
  icon: string;
  /** Short description. */
  description: string;
  /** Base market price in coins. */
  basePrice: number;
  /** Current market price (fluctuates). */
  currentPrice: number;
  /** Amount the player owns. */
  owned: number;
  /** Rarity tier for drop weighting. */
  rarity: EfRarity;
}

export interface EfAchievementDef {
  /** Unique achievement identifier. */
  id: EfAchievementId;
  /** Display name. */
  name: string;
  /** Description of what must be done. */
  description: string;
  /** Whether the player has unlocked it. */
  unlocked: boolean;
  /** Timestamp when unlocked, or null. */
  unlockedAt: number | null;
  /** XP reward for unlocking. */
  rewardXP: number;
  /** Coin reward for unlocking. */
  rewardCoins: number;
}

export interface EfInventoryItem {
  /** Unique instance identifier. */
  instanceId: string;
  /** Blueprint item id. */
  itemId: string;
  /** Display name. */
  name: string;
  /** Emoji icon. */
  emoji: string;
  /** Item rarity. */
  rarity: EfRarity;
  /** Item category. */
  category: EfItemCategory;
  /** Quality tier from the forge result. */
  quality: EfQuality;
  /** Current enhancement level (+0 to +10). */
  enhanceLevel: number;
  /** Effective power (base power scaled by quality and enhancement). */
  effectivePower: number;
  /** Effective stats scaled by quality and enhancement. */
  effectiveStats: Record<string, number>;
  /** Timestamp when the item was forged. */
  forgedAt: number;
}

export interface EfForgeResult {
  /** Whether the forge succeeded. */
  success: boolean;
  /** The resulting inventory item (if successful). */
  item: EfInventoryItem | null;
  /** Quality of the forged item. */
  quality: EfQuality | null;
  /** XP earned from this forge. */
  xpEarned: number;
  /** Coins earned from this forge. */
  coinsEarned: number;
  /** The station used. */
  stationId: EfStationId | null;
  /** Temperature used. */
  temperature: number;
  /** Reason for failure (if failed). */
  failureReason: string;
}

export interface EfDailyChallenge {
  /** Date seed string (YYYY-MM-DD). */
  dateSeed: string;
  /** The blueprint item id for today's challenge. */
  blueprintId: string;
  /** Bonus XP multiplier for completing. */
  xpMultiplier: number;
  /** Bonus coin multiplier for completing. */
  coinMultiplier: number;
  /** Whether the player completed today's challenge. */
  completed: boolean;
  /** Timestamp of completion, or null. */
  completedAt: number | null;
}

export interface EfRunHistoryEntry {
  /** Unique entry identifier. */
  id: string;
  /** Item id forged. */
  itemId: string;
  /** Quality achieved. */
  quality: EfQuality;
  /** Whether the forge was successful. */
  success: boolean;
  /** Timestamp of the run. */
  timestamp: number;
  /** XP earned. */
  xpEarned: number;
  /** Power of the resulting item. */
  power: number;
}

export interface ElementalForgeState {
  /** Current player level (1–50). */
  level: number;
  /** Current XP towards the next level. */
  xp: number;
  /** XP needed to reach the next level. */
  xpToNext: number;
  /** Total coins available. */
  coins: number;
  /** Current forge temperature (0–2000). */
  forgeTemperature: number;
  /** Total items ever forged. */
  totalForged: number;
  /** Total rare-or-better items forged. */
  rareForged: number;
  /** Current daily forge streak. */
  streak: number;
  /** Best streak ever achieved. */
  bestStreak: number;
  /** Current forge station id. */
  currentStationId: EfStationId;
  /** Unlocked station ids. */
  unlockedStations: EfStationId[];
  /** Station upgrade levels keyed by station id. */
  stationUpgrades: Record<EfStationId, number>;
  /** Element mastery levels keyed by element id (1–20). */
  elementMastery: Record<EfElementId, number>;
  /** Element XP amounts keyed by element id. */
  elementXP: Record<EfElementId, number>;
  /** Player inventory of forged items (max 60). */
  inventory: EfInventoryItem[];
  /** Achievement unlock states. */
  achievements: Record<EfAchievementId, boolean>;
  /** Achievement unlock timestamps. */
  achievementTimestamps: Record<EfAchievementId, number | null>;
  /** Daily challenge state. */
  dailyChallenge: EfDailyChallenge;
  /** Discovered elemental reactions. */
  discoveredReactions: string[];
  /** Raw material counts. */
  materials: Record<EfMaterialId, number>;
  /** Material market prices (fluctuating). */
  materialPrices: Record<EfMaterialId, number>;
  /** History of forge attempts. */
  runHistory: EfRunHistoryEntry[];
  /** Currently active forge (null if not forging). */
  activeForge: {
    /** Blueprint item id being forged. */
    itemId: string;
    /** Station id being used. */
    stationId: EfStationId;
    /** Temperature set for the forge. */
    temperature: number;
    /** Timestamp when the forge started. */
    startedAt: number;
    /** Duration in seconds. */
    duration: number;
  } | null;
  /** Module initialization timestamp. */
  initializedAt: number;
}

// ---------------------------------------------------------------------------
// Constants — 6 Elements
// ---------------------------------------------------------------------------

const EF_ELEMENTS: EfElement[] = [
  { id: "fire", name: "Fire", icon: "🔥", description: "The primal flame that burns away impurities.", color: "#FF4500" },
  { id: "water", name: "Water", icon: "💧", description: "Flowing water that shapes and cools.", color: "#1E90FF" },
  { id: "earth", name: "Earth", icon: "🌍", description: "Solid ground and unyielding stone.", color: "#32CD32" },
  { id: "air", name: "Air", icon: "💨", description: "The invisible force that carries all.", color: "#87CEEB" },
  { id: "lightning", name: "Lightning", icon: "⚡", description: "Raw power channeled from the sky.", color: "#FFD700" },
  { id: "void", name: "Void", icon: "🌑", description: "The mysterious darkness between worlds.", color: "#8A2BE2" },
];

// ---------------------------------------------------------------------------
// Constants — 35 Forgeable Items (7 per category)
// ---------------------------------------------------------------------------

const EF_ITEMS: EfForgeableItem[] = [
  // ---- Weapons (7) ----
  {
    id: "wpn_iron_sword", name: "Iron Sword", emoji: "🗡️", category: "weapon", rarity: "Common",
    requiredElements: ["fire", "earth"], requiredMastery: [1, 1], forgeTime: 30,
    stats: { attack: 12, speed: 5 }, power: 15, forgeCost: 25, requiredLevel: 1,
  },
  {
    id: "wpn_flame_dagger", name: "Flame Dagger", emoji: "🔪", category: "weapon", rarity: "Common",
    requiredElements: ["fire", "fire"], requiredMastery: [2, 2], forgeTime: 35,
    stats: { attack: 10, speed: 12 }, power: 18, forgeCost: 35, requiredLevel: 1,
  },
  {
    id: "wpn_storm_lance", name: "Storm Lance", emoji: "🔱", category: "weapon", rarity: "Uncommon",
    requiredElements: ["lightning", "earth"], requiredMastery: [3, 2], forgeTime: 50,
    stats: { attack: 25, speed: 8 }, power: 32, forgeCost: 120, requiredLevel: 5,
  },
  {
    id: "wpn_tidal_trident", name: "Tidal Trident", emoji: "🔱", category: "weapon", rarity: "Uncommon",
    requiredElements: ["water", "earth"], requiredMastery: [3, 3], forgeTime: 55,
    stats: { attack: 22, speed: 10 }, power: 30, forgeCost: 110, requiredLevel: 5,
  },
  {
    id: "wpn_void_blade", name: "Void Blade", emoji: "⚔️", category: "weapon", rarity: "Rare",
    requiredElements: ["void", "fire"], requiredMastery: [5, 4], forgeTime: 80,
    stats: { attack: 45, speed: 15 }, power: 55, forgeCost: 400, requiredLevel: 15,
  },
  {
    id: "wpn_tempest_bow", name: "Tempest Bow", emoji: "🏹", category: "weapon", rarity: "Epic",
    requiredElements: ["lightning", "air"], requiredMastery: [8, 7], forgeTime: 120,
    stats: { attack: 70, speed: 25 }, power: 88, forgeCost: 1500, requiredLevel: 25,
  },
  {
    id: "wpn_dragon_fang", name: "Dragon Fang", emoji: "🐉", category: "weapon", rarity: "Legendary",
    requiredElements: ["fire", "void", "earth"], requiredMastery: [12, 10, 10], forgeTime: 200,
    stats: { attack: 120, speed: 30, crit: 25 }, power: 160, forgeCost: 5000, requiredLevel: 40,
  },

  // ---- Armor (7) ----
  {
    id: "arm_leather_vest", name: "Leather Vest", emoji: "🦺", category: "armor", rarity: "Common",
    requiredElements: ["earth"], requiredMastery: [1], forgeTime: 25,
    stats: { defense: 8, hp: 20 }, power: 12, forgeCost: 20, requiredLevel: 1,
  },
  {
    id: "arm_chainmail", name: "Chainmail", emoji: "⛓️", category: "armor", rarity: "Common",
    requiredElements: ["earth", "fire"], requiredMastery: [2, 1], forgeTime: 35,
    stats: { defense: 15, hp: 30 }, power: 20, forgeCost: 40, requiredLevel: 2,
  },
  {
    id: "arm_frost_plate", name: "Frost Plate", emoji: "🛡️", category: "armor", rarity: "Uncommon",
    requiredElements: ["water", "earth"], requiredMastery: [3, 3], forgeTime: 55,
    stats: { defense: 30, hp: 50 }, power: 38, forgeCost: 130, requiredLevel: 6,
  },
  {
    id: "arm_wind_cloak", name: "Wind Cloak", emoji: "🧥", category: "armor", rarity: "Uncommon",
    requiredElements: ["air", "water"], requiredMastery: [3, 2], forgeTime: 45,
    stats: { defense: 18, hp: 25, dodge: 15 }, power: 32, forgeCost: 100, requiredLevel: 5,
  },
  {
    id: "arm_crystal_breastplate", name: "Crystal Breastplate", emoji: "💎", category: "armor", rarity: "Rare",
    requiredElements: ["earth", "lightning"], requiredMastery: [5, 5], forgeTime: 85,
    stats: { defense: 50, hp: 80, magicResist: 20 }, power: 68, forgeCost: 450, requiredLevel: 16,
  },
  {
    id: "arm_shadow_mantle", name: "Shadow Mantle", emoji: "🦇", category: "armor", rarity: "Epic",
    requiredElements: ["void", "air"], requiredMastery: [8, 6], forgeTime: 130,
    stats: { defense: 60, hp: 100, dodge: 30 }, power: 95, forgeCost: 1800, requiredLevel: 28,
  },
  {
    id: "arm_phoenix_wings", name: "Phoenix Wings", emoji: "🪽", category: "armor", rarity: "Legendary",
    requiredElements: ["fire", "void", "air"], requiredMastery: [12, 10, 10], forgeTime: 210,
    stats: { defense: 100, hp: 200, dodge: 40, fireResist: 50 }, power: 175, forgeCost: 5500, requiredLevel: 42,
  },

  // ---- Accessories (7) ----
  {
    id: "acc_copper_ring", name: "Copper Ring", emoji: "💍", category: "accessory", rarity: "Common",
    requiredElements: ["earth"], requiredMastery: [1], forgeTime: 15,
    stats: { luck: 5 }, power: 8, forgeCost: 15, requiredLevel: 1,
  },
  {
    id: "acc_fire_amulet", name: "Fire Amulet", emoji: "📿", category: "accessory", rarity: "Common",
    requiredElements: ["fire"], requiredMastery: [2], forgeTime: 20,
    stats: { attack: 5, fireResist: 10 }, power: 12, forgeCost: 25, requiredLevel: 1,
  },
  {
    id: "acc_tidal_charm", name: "Tidal Charm", emoji: "🫧", category: "accessory", rarity: "Uncommon",
    requiredElements: ["water", "air"], requiredMastery: [3, 2], forgeTime: 35,
    stats: { hp: 30, speed: 8 }, power: 25, forgeCost: 80, requiredLevel: 4,
  },
  {
    id: "acc_stone_necklace", name: "Stone Necklace", emoji: "🪨", category: "accessory", rarity: "Uncommon",
    requiredElements: ["earth", "earth"], requiredMastery: [3, 3], forgeTime: 40,
    stats: { defense: 12, hp: 40 }, power: 28, forgeCost: 90, requiredLevel: 5,
  },
  {
    id: "acc_storm_crown", name: "Storm Crown", emoji: "👑", category: "accessory", rarity: "Rare",
    requiredElements: ["lightning", "void"], requiredMastery: [5, 4], forgeTime: 70,
    stats: { magicResist: 25, attack: 15, speed: 10 }, power: 52, forgeCost: 380, requiredLevel: 14,
  },
  {
    id: "acc_abyssal_eye", name: "Abyssal Eye", emoji: "👁️", category: "accessory", rarity: "Epic",
    requiredElements: ["void", "water"], requiredMastery: [8, 6], forgeTime: 110,
    stats: { luck: 30, crit: 20, magicResist: 20 }, power: 78, forgeCost: 1600, requiredLevel: 26,
  },
  {
    id: "acc_celestial_orb", name: "Celestial Orb", emoji: "🔮", category: "accessory", rarity: "Legendary",
    requiredElements: ["void", "lightning", "fire"], requiredMastery: [12, 10, 8], forgeTime: 190,
    stats: { luck: 50, crit: 35, magicResist: 40, allStats: 20 }, power: 150, forgeCost: 4800, requiredLevel: 38,
  },

  // ---- Tools (7) ----
  {
    id: "tool_pickaxe", name: "Mining Pickaxe", emoji: "⛏️", category: "tool", rarity: "Common",
    requiredElements: ["earth", "fire"], requiredMastery: [1, 1], forgeTime: 20,
    stats: { mining: 10 }, power: 10, forgeCost: 15, requiredLevel: 1,
  },
  {
    id: "tool_hammer", name: "Blacksmith Hammer", emoji: "🔨", category: "tool", rarity: "Common",
    requiredElements: ["fire", "earth"], requiredMastery: [1, 1], forgeTime: 20,
    stats: { forging: 10 }, power: 10, forgeCost: 15, requiredLevel: 1,
  },
  {
    id: "tool_enchanted_chisel", name: "Enchanted Chisel", emoji: "🪚", category: "tool", rarity: "Uncommon",
    requiredElements: ["earth", "water"], requiredMastery: [2, 2], forgeTime: 40,
    stats: { crafting: 18, precision: 12 }, power: 24, forgeCost: 95, requiredLevel: 5,
  },
  {
    id: "tool_wind_fan", name: "Wind Fan", emoji: "🪭", category: "tool", rarity: "Uncommon",
    requiredElements: ["air", "air"], requiredMastery: [3, 3], forgeTime: 38,
    stats: { cooling: 20, speed: 8 }, power: 22, forgeCost: 85, requiredLevel: 4,
  },
  {
    id: "tool_void_siphon", name: "Void Siphon", emoji: "🧪", category: "tool", rarity: "Rare",
    requiredElements: ["void", "water"], requiredMastery: [5, 4], forgeTime: 65,
    stats: { extraction: 25, luck: 15 }, power: 45, forgeCost: 350, requiredLevel: 14,
  },
  {
    id: "tool_thunder_anvil", name: "Thunder Anvil", emoji: "⚡", category: "tool", rarity: "Epic",
    requiredElements: ["lightning", "earth"], requiredMastery: [8, 6], forgeTime: 100,
    stats: { forging: 35, qualityBonus: 20 }, power: 70, forgeCost: 1400, requiredLevel: 24,
  },
  {
    id: "tool_worldseed", name: "Worldseed", emoji: "🌱", category: "tool", rarity: "Legendary",
    requiredElements: ["earth", "water", "void"], requiredMastery: [10, 10, 10], forgeTime: 180,
    stats: { allStats: 15, luck: 40, crafting: 40 }, power: 130, forgeCost: 4200, requiredLevel: 36,
  },

  // ---- Relics (7) ----
  {
    id: "rel_fire_heart", name: "Fire Heart", emoji: "❤️‍🔥", category: "relic", rarity: "Uncommon",
    requiredElements: ["fire", "fire"], requiredMastery: [4, 4], forgeTime: 50,
    stats: { attack: 15, fireResist: 20, hp: 25 }, power: 35, forgeCost: 150, requiredLevel: 7,
  },
  {
    id: "rel_tear_of_ocean", name: "Tear of Ocean", emoji: "💧", category: "relic", rarity: "Uncommon",
    requiredElements: ["water", "water"], requiredMastery: [4, 4], forgeTime: 50,
    stats: { hp: 50, speed: 10, waterResist: 20 }, power: 35, forgeCost: 150, requiredLevel: 7,
  },
  {
    id: "rel_ancient_core", name: "Ancient Core", emoji: "🌀", category: "relic", rarity: "Rare",
    requiredElements: ["earth", "lightning"], requiredMastery: [6, 5], forgeTime: 80,
    stats: { defense: 20, attack: 20, hp: 40 }, power: 60, forgeCost: 500, requiredLevel: 16,
  },
  {
    id: "rel_storm_shard", name: "Storm Shard", emoji: "⚡", category: "relic", rarity: "Rare",
    requiredElements: ["lightning", "air"], requiredMastery: [6, 5], forgeTime: 75,
    stats: { speed: 25, attack: 25, crit: 15 }, power: 58, forgeCost: 480, requiredLevel: 15,
  },
  {
    id: "rel_void_sigil", name: "Void Sigil", emoji: "🌑", category: "relic", rarity: "Epic",
    requiredElements: ["void", "void"], requiredMastery: [9, 9], forgeTime: 120,
    stats: { magicResist: 40, luck: 25, dodge: 20 }, power: 90, forgeCost: 2000, requiredLevel: 30,
  },
  {
    id: "rel_elemental_matrix", name: "Elemental Matrix", emoji: "💠", category: "relic", rarity: "Epic",
    requiredElements: ["fire", "water", "earth", "air"], requiredMastery: [7, 7, 7, 7], forgeTime: 150,
    stats: { allStats: 12, allResist: 15 }, power: 100, forgeCost: 2500, requiredLevel: 32,
  },
  {
    id: "rel_eternal_forge", name: "Eternal Forge", emoji: "🔥", category: "relic", rarity: "Legendary",
    requiredElements: ["fire", "void", "lightning", "earth"], requiredMastery: [12, 12, 10, 10], forgeTime: 250,
    stats: { forging: 50, qualityBonus: 35, allStats: 25, luck: 30 }, power: 200, forgeCost: 8000, requiredLevel: 45,
  },
];

// ---------------------------------------------------------------------------
// Constants — 8 Forge Stations
// ---------------------------------------------------------------------------

const EF_STATIONS: Omit<EfForgeStation, "unlocked" | "upgradeLevel">[] = [
  {
    id: "basic_anvil", name: "Basic Anvil", icon: "🔨",
    description: "A simple iron anvil for beginner forgers.",
    unlockLevel: 1, unlockCost: 0, qualityBonus: 0, xpBonus: 1.0,
  },
  {
    id: "elemental_crucible", name: "Elemental Crucible", icon: "⚗️",
    description: "Channels raw elemental energy into your forges.",
    unlockLevel: 5, unlockCost: 300, qualityBonus: 0.05, xpBonus: 1.15,
  },
  {
    id: "arcane_furnace", name: "Arcane Furnace", icon: "🏭",
    description: "Magically enhanced furnace with stable heat output.",
    unlockLevel: 10, unlockCost: 1000, qualityBonus: 0.1, xpBonus: 1.3,
  },
  {
    id: "celestial_forge", name: "Celestial Forge", icon: "✨",
    description: "Forged under starlight for enhanced quality.",
    unlockLevel: 18, unlockCost: 3000, qualityBonus: 0.15, xpBonus: 1.5,
  },
  {
    id: "shadow_crucible", name: "Shadow Crucible", icon: "🌑",
    description: "Harnesses void energy to temper weapons.",
    unlockLevel: 25, unlockCost: 7000, qualityBonus: 0.2, xpBonus: 1.65,
  },
  {
    id: "storm_forge", name: "Storm Forge", icon: "⛈️",
    description: "Lightning-powered forge for rapid, powerful crafting.",
    unlockLevel: 32, unlockCost: 15000, qualityBonus: 0.25, xpBonus: 1.8,
  },
  {
    id: "crystal_kiln", name: "Crystal Kiln", icon: "💎",
    description: "Crystalline structure that amplifies elemental resonance.",
    unlockLevel: 38, unlockCost: 25000, qualityBonus: 0.3, xpBonus: 1.9,
  },
  {
    id: "dragons_heart", name: "Dragon's Heart", icon: "🐉",
    description: "Ancient draconic furnace of unmatched power.",
    unlockLevel: 45, unlockCost: 50000, qualityBonus: 0.4, xpBonus: 2.0,
  },
];

// ---------------------------------------------------------------------------
// Constants — 15 Elemental Reactions
// ---------------------------------------------------------------------------

const EF_REACTIONS: Omit<EfReaction, "discovered">[] = [
  { id: "rxn_steam", elements: ["fire", "water"], resultName: "Steam Essence", resultEmoji: "♨️", description: "Fire meets water to create pressurized steam.", power: 3 },
  { id: "rxn_magma", elements: ["fire", "earth"], resultName: "Magma Core", resultEmoji: "🌋", description: "Earth melts under intense flame into magma.", power: 4 },
  { id: "rxn_plant", elements: ["water", "earth"], resultName: "Living Seed", resultEmoji: "🌱", description: "Water nourishes earth into sprouting life.", power: 3 },
  { id: "rxn_smoke", elements: ["fire", "air"], resultName: "Obsidian Smoke", resultEmoji: "💨", description: "Air feeds fire into billowing dark smoke.", power: 3 },
  { id: "rxn_plasma", elements: ["fire", "lightning"], resultName: "Plasma Shard", resultEmoji: "⚡", description: "Lightning ignites fire into pure plasma.", power: 5 },
  { id: "rxn_dark_flame", elements: ["fire", "void"], resultName: "Dark Flame Essence", resultEmoji: "🖤", description: "Void corrupts fire into an inextinguishable blaze.", power: 5 },
  { id: "rxn_mist", elements: ["water", "air"], resultName: "Ethereal Mist", resultEmoji: "🌫️", description: "Water disperses through air into thick mist.", power: 3 },
  { id: "rxn_thunderstorm", elements: ["water", "lightning"], resultName: "Thundercloud Shard", resultEmoji: "🌩️", description: "Lightning charges water into a storm.", power: 5 },
  { id: "rxn_abyssal_tide", elements: ["water", "void"], resultName: "Abyssal Pearl", resultEmoji: "🫧", description: "Void taints water into a deep-sea abyss.", power: 5 },
  { id: "rxn_sandstorm", elements: ["earth", "air"], resultName: "Desert Glass", resultEmoji: "🏜️", description: "Wind scours earth into razor-sharp glass.", power: 4 },
  { id: "rxn_crystal_shock", elements: ["earth", "lightning"], resultName: "Charged Crystal", resultEmoji: "💎", description: "Lightning crystallizes within earth.", power: 5 },
  { id: "rxn_gravity_well", elements: ["earth", "void"], resultName: "Gravity Stone", resultEmoji: "🕳️", description: "Void warps the fabric of earth.", power: 6 },
  { id: "rxn_tempest", elements: ["air", "lightning"], resultName: "Tempest Core", resultEmoji: "🌪️", description: "Wind and lightning combine into a cyclone.", power: 6 },
  { id: "rxn_vacuum", elements: ["air", "void"], resultName: "Vacuum Fragment", resultEmoji: "🌀", description: "Void consumes air into absolute nothingness.", power: 6 },
  { id: "rxn_void_spark", elements: ["lightning", "void"], resultName: "Void Spark", resultEmoji: "💫", description: "Lightning pierces the void between dimensions.", power: 7 },
];

// ---------------------------------------------------------------------------
// Constants — 8 Raw Materials
// ---------------------------------------------------------------------------

const EF_MATERIALS: Omit<EfMaterial, "owned" | "currentPrice">[] = [
  { id: "iron_ore", name: "Iron Ore", icon: "🪨", description: "Common ore found in mountain deposits.", basePrice: 10, rarity: "Common" },
  { id: "enchanted_wood", name: "Enchanted Wood", icon: "🪵", description: "Wood imbued with faint magical energy.", basePrice: 15, rarity: "Common" },
  { id: "crystal_shard", name: "Crystal Shard", icon: "💎", description: "A fragment of crystallized elemental power.", basePrice: 50, rarity: "Uncommon" },
  { id: "dragon_scale", name: "Dragon Scale", icon: "🐉", description: "A shimmering scale from a young dragon.", basePrice: 200, rarity: "Rare" },
  { id: "shadow_essence", name: "Shadow Essence", icon: "🌑", description: "Condensed energy from the void plane.", basePrice: 350, rarity: "Rare" },
  { id: "storm_fragment", name: "Storm Fragment", icon: "⛈️", description: "A piece of a captured lightning bolt.", basePrice: 500, rarity: "Epic" },
  { id: "void_crystal", name: "Void Crystal", icon: "🔮", description: "A crystal grown in the space between worlds.", basePrice: 800, rarity: "Epic" },
  { id: "phoenix_feather", name: "Phoenix Feather", icon: "🪶", description: "A feather from a reborn phoenix, radiant with heat.", basePrice: 2000, rarity: "Legendary" },
];

// ---------------------------------------------------------------------------
// Constants — 15 Achievements
// ---------------------------------------------------------------------------

const EF_ACHIEVEMENT_DEFS: Omit<EfAchievementDef, "unlocked" | "unlockedAt">[] = [
  { id: "first_forge", name: "First Forge", description: "Complete your first successful forge.", rewardXP: 50, rewardCoins: 50 },
  { id: "ten_forges", name: "Apprentice Smith", description: "Successfully forge 10 items.", rewardXP: 200, rewardCoins: 200 },
  { id: "master_blacksmith", name: "Master Blacksmith", description: "Successfully forge 50 items.", rewardXP: 1000, rewardCoins: 1000 },
  { id: "elemental_novice", name: "Elemental Novice", description: "Reach mastery level 5 with any element.", rewardXP: 150, rewardCoins: 150 },
  { id: "elemental_adept", name: "Elemental Adept", description: "Reach mastery level 10 with any element.", rewardXP: 500, rewardCoins: 500 },
  { id: "elemental_master", name: "Elemental Master", description: "Reach mastery level 15 with any element.", rewardXP: 1200, rewardCoins: 1200 },
  { id: "elemental_lord", name: "Elemental Lord", description: "Reach mastery level 20 with any element.", rewardXP: 3000, rewardCoins: 3000 },
  { id: "rare_find", name: "Rare Find", description: "Forge a Rare-quality item or better.", rewardXP: 300, rewardCoins: 300 },
  { id: "epic_discovery", name: "Epic Discovery", description: "Forge an Epic-quality item or better.", rewardXP: 800, rewardCoins: 800 },
  { id: "legendary_craftsman", name: "Legendary Craftsman", description: "Forge a Legendary-rarity item.", rewardXP: 2000, rewardCoins: 2000 },
  { id: "enhancement_pro", name: "Enhancement Pro", description: "Enhance any item to +5 or higher.", rewardXP: 600, rewardCoins: 600 },
  { id: "streak_five", name: "On a Roll", description: "Achieve a daily forge streak of 5.", rewardXP: 400, rewardCoins: 400 },
  { id: "streak_ten", name: "Unstoppable", description: "Achieve a daily forge streak of 10.", rewardXP: 1000, rewardCoins: 1000 },
  { id: "daily_devotee", name: "Daily Devotee", description: "Complete 7 daily challenges.", rewardXP: 700, rewardCoins: 700 },
  { id: "market_trader", name: "Market Trader", description: "Buy and sell 20 materials total.", rewardXP: 500, rewardCoins: 500 },
];

// ---------------------------------------------------------------------------
// Quality Tiers — mapping from precision score
// ---------------------------------------------------------------------------

const QUALITY_THRESHOLDS: Array<{ min: number; max: number; quality: EfQuality; multiplier: number }> = [
  { min: 0, max: 30, quality: "Flawed", multiplier: 0.5 },
  { min: 30, max: 60, quality: "Normal", multiplier: 0.75 },
  { min: 60, max: 80, quality: "Fine", multiplier: 1.0 },
  { min: 80, max: 95, quality: "Perfect", multiplier: 1.3 },
  { min: 95, max: 100, quality: "Masterwork", multiplier: 1.6 },
];

const RARITY_ORDER: EfRarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

// ---------------------------------------------------------------------------
// Helpers
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
  return Math.floor(100 * Math.pow(1.4, level - 1));
}

function xpForMastery(mastery: number): number {
  return Math.floor(50 * Math.pow(1.3, mastery - 1));
}

function qualityFromPrecision(precision: number): { quality: EfQuality; multiplier: number } {
  const clamped = Math.max(0, Math.min(100, precision));
  for (const t of QUALITY_THRESHOLDS) {
    if (clamped >= t.min && clamped < t.max) {
      return { quality: t.quality, multiplier: t.multiplier };
    }
  }
  return { quality: "Masterwork", multiplier: 1.6 };
}

function rarityIndex(rarity: EfRarity): number {
  return RARITY_ORDER.indexOf(rarity);
}

function generateInstanceId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `ef_${ts}_${rand}`;
}

function clampLevel(level: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, level));
}

function sortElementsForPair(a: EfElementId, b: EfElementId): [EfElementId, EfElementId] {
  if (RARITY_ORDER.indexOf(a as EfRarity) < RARITY_ORDER.indexOf(b as EfRarity)) return [a, b] as [EfElementId, EfElementId];
  return a < b ? [a, b] as [EfElementId, EfElementId] : [b, a] as [EfElementId, EfElementId];
}

// ---------------------------------------------------------------------------
// State — SSR-safe lazy init
// ---------------------------------------------------------------------------

let state: ElementalForgeState | null = null;

function createInitialState(): ElementalForgeState {
  const now = Date.now();
  const elementIds: EfElementId[] = ["fire", "water", "earth", "air", "lightning", "void"];
  const materialIds: EfMaterialId[] = [
    "iron_ore", "enchanted_wood", "crystal_shard", "dragon_scale",
    "shadow_essence", "storm_fragment", "void_crystal", "phoenix_feather",
  ];
  const stationIds: EfStationId[] = [
    "basic_anvil", "elemental_crucible", "arcane_furnace", "celestial_forge",
    "shadow_crucible", "storm_forge", "crystal_kiln", "dragons_heart",
  ];
  const achievementIds: EfAchievementId[] = [
    "first_forge", "ten_forges", "master_blacksmith", "elemental_novice",
    "elemental_adept", "elemental_master", "elemental_lord", "rare_find",
    "epic_discovery", "legendary_craftsman", "enhancement_pro", "streak_five",
    "streak_ten", "daily_devotee", "market_trader",
  ];

  const elementMastery: Record<EfElementId, number> = {} as Record<EfElementId, number>;
  const elementXP: Record<EfElementId, number> = {} as Record<EfElementId, number>;
  for (const eid of elementIds) {
    elementMastery[eid] = 1;
    elementXP[eid] = 0;
  }

  const materials: Record<EfMaterialId, number> = {} as Record<EfMaterialId, number>;
  const materialPrices: Record<EfMaterialId, number> = {} as Record<EfMaterialId, number>;
  for (const mid of materialIds) {
    materials[mid] = 0;
    const def = EF_MATERIALS.find((m) => m.id === mid);
    materialPrices[mid] = def ? def.basePrice : 10;
  }

  const stationUpgrades: Record<EfStationId, number> = {} as Record<EfStationId, number>;
  for (const sid of stationIds) {
    stationUpgrades[sid] = 1;
  }

  const achievements: Record<EfAchievementId, boolean> = {} as Record<EfAchievementId, boolean>;
  const achievementTimestamps: Record<EfAchievementId, number | null> = {} as Record<EfAchievementId, number | null>;
  for (const aid of achievementIds) {
    achievements[aid] = false;
    achievementTimestamps[aid] = null;
  }

  return {
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    coins: 100,
    forgeTemperature: 800,
    totalForged: 0,
    rareForged: 0,
    streak: 0,
    bestStreak: 0,
    currentStationId: "basic_anvil",
    unlockedStations: ["basic_anvil"],
    stationUpgrades,
    elementMastery,
    elementXP,
    inventory: [],
    achievements,
    achievementTimestamps,
    dailyChallenge: {
      dateSeed: "",
      blueprintId: "",
      xpMultiplier: 1.5,
      coinMultiplier: 1.5,
      completed: false,
      completedAt: null,
    },
    discoveredReactions: [],
    materials,
    materialPrices,
    runHistory: [],
    activeForge: null,
    initializedAt: now,
  };
}

function ensureInit(): ElementalForgeState {
  if (!state) {
    state = createInitialState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// Internal: Achievement checking
// ---------------------------------------------------------------------------

let marketTradeCount = 0;

function internalCheckAchievements(): EfAchievementId[] {
  const s = ensureInit();
  const newlyUnlocked: EfAchievementId[] = [];

  const tryUnlock = (id: EfAchievementId): void => {
    if (s.achievements[id]) return;
    const def = EF_ACHIEVEMENT_DEFS.find((a) => a.id === id);
    if (!def) return;

    let shouldUnlock = false;

    switch (id) {
      case "first_forge":
        shouldUnlock = s.totalForged >= 1;
        break;
      case "ten_forges":
        shouldUnlock = s.totalForged >= 10;
        break;
      case "master_blacksmith":
        shouldUnlock = s.totalForged >= 50;
        break;
      case "elemental_novice": {
        const elementIds: EfElementId[] = ["fire", "water", "earth", "air", "lightning", "void"];
        shouldUnlock = elementIds.some((e) => s.elementMastery[e] >= 5);
        break;
      }
      case "elemental_adept": {
        const elementIds: EfElementId[] = ["fire", "water", "earth", "air", "lightning", "void"];
        shouldUnlock = elementIds.some((e) => s.elementMastery[e] >= 10);
        break;
      }
      case "elemental_master": {
        const elementIds: EfElementId[] = ["fire", "water", "earth", "air", "lightning", "void"];
        shouldUnlock = elementIds.some((e) => s.elementMastery[e] >= 15);
        break;
      }
      case "elemental_lord": {
        const elementIds: EfElementId[] = ["fire", "water", "earth", "air", "lightning", "void"];
        shouldUnlock = elementIds.some((e) => s.elementMastery[e] >= 20);
        break;
      }
      case "rare_find":
        shouldUnlock = s.inventory.some(
          (inv) => inv.quality === "Perfect" || inv.quality === "Masterwork",
        );
        break;
      case "epic_discovery":
        shouldUnlock = s.inventory.some((inv) => inv.quality === "Masterwork");
        break;
      case "legendary_craftsman":
        shouldUnlock = s.inventory.some((inv) => inv.rarity === "Legendary");
        break;
      case "enhancement_pro":
        shouldUnlock = s.inventory.some((inv) => inv.enhanceLevel >= 5);
        break;
      case "streak_five":
        shouldUnlock = s.bestStreak >= 5;
        break;
      case "streak_ten":
        shouldUnlock = s.bestStreak >= 10;
        break;
      case "daily_devotee":
        shouldUnlock = s.runHistory.filter((h) => h.success).length >= 7;
        break;
      case "market_trader":
        shouldUnlock = marketTradeCount >= 20;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      s.achievements[id] = true;
      s.achievementTimestamps[id] = Date.now();
      newlyUnlocked.push(id);
      // Apply rewards
      efAddXP(def.rewardXP);
      s.coins += def.rewardCoins;
    }
  };

  const allIds: EfAchievementId[] = [
    "first_forge", "ten_forges", "master_blacksmith", "elemental_novice",
    "elemental_adept", "elemental_master", "elemental_lord", "rare_find",
    "epic_discovery", "legendary_craftsman", "enhancement_pro", "streak_five",
    "streak_ten", "daily_devotee", "market_trader",
  ];

  for (const id of allIds) {
    tryUnlock(id);
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Internal: Refresh daily challenge
// ---------------------------------------------------------------------------

function ensureDailyChallenge(): void {
  const s = ensureInit();
  const today = todayDateString();
  if (s.dailyChallenge.dateSeed === today) return;

  const seed = dateSeed(today);
  const rng = seededRandom(seed);
  // Pick a random item from the blueprint list
  const idx = Math.floor(rng() * EF_ITEMS.length);
  const blueprint = EF_ITEMS[idx];

  s.dailyChallenge = {
    dateSeed: today,
    blueprintId: blueprint.id,
    xpMultiplier: 1.5 + Math.floor(rng() * 10) / 10, // 1.5–2.4
    coinMultiplier: 1.5 + Math.floor(rng() * 10) / 10,
    completed: false,
    completedAt: null,
  };

  // Check if streak should be reset (missed a day)
  void 0; // intentional no-op placeholder
}

// ---------------------------------------------------------------------------
// Internal: Fluctuate market prices
// ---------------------------------------------------------------------------

function fluctuateMarketPrices(): void {
  const s = ensureInit();
  const materialIds: EfMaterialId[] = [
    "iron_ore", "enchanted_wood", "crystal_shard", "dragon_scale",
    "shadow_essence", "storm_fragment", "void_crystal", "phoenix_feather",
  ];
  for (const mid of materialIds) {
    const def = EF_MATERIALS.find((m) => m.id === mid);
    if (!def) continue;
    // Random walk: ±20% of base price
    const volatility = 0.2;
    const change = (Math.random() - 0.5) * 2 * volatility * def.basePrice;
    const newPrice = Math.max(
      Math.floor(def.basePrice * 0.3),
      Math.floor(s.materialPrices[mid] + change),
    );
    s.materialPrices[mid] = Math.min(
      Math.floor(def.basePrice * 3),
      newPrice,
    );
  }
}

// ---------------------------------------------------------------------------
// 1. State Management
// ---------------------------------------------------------------------------

/** Returns the full current state object. Initializes on first call. */
export function efGetState(): ElementalForgeState {
  return ensureInit();
}

/** Resets all state to initial values. */
export function efResetState(): void {
  state = createInitialState();
  marketTradeCount = 0;
}

// ---------------------------------------------------------------------------
// 2. Level & XP
// ---------------------------------------------------------------------------

/** Returns the current player level (1–50). */
export function efGetLevel(): number {
  return ensureInit().level;
}

/** Adds XP and handles level-ups. Returns { leveledUp, newLevel }. */
export function efAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  s.xp += amount;
  let leveledUp = false;

  while (s.xp >= s.xpToNext && s.level < 50) {
    s.xp -= s.xpToNext;
    s.level = clampLevel(s.level + 1, 1, 50);
    s.xpToNext = xpForLevel(s.level);
    leveledUp = true;

    // Unlock stations based on level
    for (const station of EF_STATIONS) {
      if (
        s.level >= station.unlockLevel &&
        !s.unlockedStations.includes(station.id)
      ) {
        // Auto-unlock when level is reached (but cost not waived)
        // Station must still be explicitly purchased via efSetStation
      }
    }
  }

  // Clamp XP at level 50
  if (s.level >= 50) {
    s.xp = Math.min(s.xp, s.xpToNext);
  }

  return { leveledUp, newLevel: s.level };
}

/** Returns XP progress: { current, needed, percentage }. */
export function efGetXpProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  return {
    current: s.xp,
    needed: s.xpToNext,
    percentage: s.xpToNext > 0 ? Math.floor((s.xp / s.xpToNext) * 100) : 0,
  };
}

// ---------------------------------------------------------------------------
// 3. Coins
// ---------------------------------------------------------------------------

/** Returns current coin balance. */
export function efGetCoins(): number {
  return ensureInit().coins;
}

/** Adds coins to the player's balance. */
export function efAddCoins(amount: number): number {
  const s = ensureInit();
  s.coins += amount;
  return s.coins;
}

/** Attempts to spend coins. Returns { success, remaining }. */
export function efSpendCoins(amount: number): { success: boolean; remaining: number } {
  const s = ensureInit();
  if (s.coins < amount) {
    return { success: false, remaining: s.coins };
  }
  s.coins -= amount;
  return { success: true, remaining: s.coins };
}

// ---------------------------------------------------------------------------
// 4. Elements & Mastery
// ---------------------------------------------------------------------------

/** Returns all 6 element definitions. */
export function efGetElements(): EfElement[] {
  return EF_ELEMENTS;
}

/** Returns mastery info for a specific element. */
export function efGetElementMastery(elementId: EfElementId): {
  level: number;
  xp: number;
  xpToNext: number;
} {
  const s = ensureInit();
  const level = s.elementMastery[elementId] ?? 1;
  return {
    level,
    xp: s.elementXP[elementId] ?? 0,
    xpToNext: xpForMastery(level),
  };
}

/** Adds XP to an element's mastery. Handles mastery level-ups. */
export function efAddElementXP(
  elementId: EfElementId,
  amount: number,
): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  let current = s.elementMastery[elementId] ?? 1;
  let xp = (s.elementXP[elementId] ?? 0) + amount;
  let leveledUp = false;

  while (xp >= xpForMastery(current) && current < 20) {
    xp -= xpForMastery(current);
    current = clampLevel(current + 1, 1, 20);
    leveledUp = true;
  }

  if (current >= 20) {
    xp = Math.min(xp, xpForMastery(20));
  }

  s.elementMastery[elementId] = current;
  s.elementXP[elementId] = xp;

  if (leveledUp) {
    void internalCheckAchievements();
  }

  return { leveledUp, newLevel: current };
}

// ---------------------------------------------------------------------------
// 5. Forgeable Items
// ---------------------------------------------------------------------------

/** Returns all 35 forgeable item blueprints. */
export function efGetForgableItems(): EfForgeableItem[] {
  return EF_ITEMS;
}

/** Returns items filtered by category. */
export function efGetItemsByCategory(category: EfItemCategory): EfForgeableItem[] {
  return EF_ITEMS.filter((item) => item.category === category);
}

/** Returns items filtered by rarity tier. */
export function efGetItemsByRarity(rarity: EfRarity): EfForgeableItem[] {
  return EF_ITEMS.filter((item) => item.rarity === rarity);
}

// ---------------------------------------------------------------------------
// 6. Forge Mechanics
// ---------------------------------------------------------------------------

/**
 * Forges an item by blueprint id using current station and temperature.
 * Computes quality based on temperature accuracy, element mastery, and station bonuses.
 */
export function efForgeItem(itemId: string): EfForgeResult {
  const s = ensureInit();

  const blueprint = EF_ITEMS.find((item) => item.id === itemId);
  if (!blueprint) {
    return {
      success: false, item: null, quality: null,
      xpEarned: 0, coinsEarned: 0,
      stationId: null, temperature: s.forgeTemperature,
      failureReason: "Blueprint not found.",
    };
  }

  // Check player level
  if (s.level < blueprint.requiredLevel) {
    return {
      success: false, item: null, quality: null,
      xpEarned: 0, coinsEarned: 0,
      stationId: s.currentStationId, temperature: s.forgeTemperature,
      failureReason: `Requires level ${blueprint.requiredLevel}.`,
    };
  }

  // Check element mastery requirements
  for (let i = 0; i < blueprint.requiredElements.length; i++) {
    const eid = blueprint.requiredElements[i];
    const required = blueprint.requiredMastery[i];
    if ((s.elementMastery[eid] ?? 1) < required) {
      return {
        success: false, item: null, quality: null,
        xpEarned: 0, coinsEarned: 0,
        stationId: s.currentStationId, temperature: s.forgeTemperature,
        failureReason: `Requires ${eid} mastery ${required}.`,
      };
    }
  }

  // Check cost
  if (s.coins < blueprint.forgeCost) {
    return {
      success: false, item: null, quality: null,
      xpEarned: 0, coinsEarned: 0,
      stationId: s.currentStationId, temperature: s.forgeTemperature,
      failureReason: `Insufficient coins (need ${blueprint.forgeCost}).`,
    };
  }

  // Check inventory space
  if (s.inventory.length >= 60) {
    return {
      success: false, item: null, quality: null,
      xpEarned: 0, coinsEarned: 0,
      stationId: s.currentStationId, temperature: s.forgeTemperature,
      failureReason: "Inventory full (max 60 items).",
    };
  }

  // Check station is unlocked
  if (!s.unlockedStations.includes(s.currentStationId)) {
    return {
      success: false, item: null, quality: null,
      xpEarned: 0, coinsEarned: 0,
      stationId: s.currentStationId, temperature: s.forgeTemperature,
      failureReason: "Current forge station is not unlocked.",
    };
  }

  // Deduct cost
  s.coins -= blueprint.forgeCost;

  // Calculate precision (0–100)
  // Optimal temperature is 1000; deviation reduces precision
  const tempDeviation = Math.abs(s.forgeTemperature - 1000);
  const tempPrecision = Math.max(0, 100 - tempDeviation / 15);

  // Mastery bonus: average mastery of required elements contributes
  let avgMastery = 0;
  for (let i = 0; i < blueprint.requiredElements.length; i++) {
    avgMastery += s.elementMastery[blueprint.requiredElements[i]] ?? 1;
  }
  avgMastery = avgMastery / blueprint.requiredElements.length;
  const masteryBonus = Math.min(20, avgMastery * 1.5);

  // Station quality bonus
  const stationDef = EF_STATIONS.find((st) => st.id === s.currentStationId);
  const stationUpgrade = s.stationUpgrades[s.currentStationId] ?? 1;
  const stationBonus = stationDef
    ? (stationDef.qualityBonus + (stationUpgrade - 1) * 0.02) * 100
    : 0;

  // Final precision
  const totalPrecision = Math.min(100, tempPrecision + masteryBonus + stationBonus);
  const { quality, multiplier } = qualityFromPrecision(totalPrecision);

  // Create inventory item
  const effectivePower = Math.floor(blueprint.power * multiplier);
  const effectiveStats: Record<string, number> = {};
  for (const statKey of Object.keys(blueprint.stats)) {
    effectiveStats[statKey] = Math.floor(blueprint.stats[statKey] * multiplier);
  }

  const invItem: EfInventoryItem = {
    instanceId: generateInstanceId(),
    itemId: blueprint.id,
    name: blueprint.name,
    emoji: blueprint.emoji,
    rarity: blueprint.rarity,
    category: blueprint.category,
    quality,
    enhanceLevel: 0,
    effectivePower,
    effectiveStats,
    forgedAt: Date.now(),
  };

  // Add to inventory
  s.inventory.push(invItem);

  // Update stats
  s.totalForged += 1;
  if (rarityIndex(blueprint.rarity) >= rarityIndex("Rare")) {
    s.rareForged += 1;
  }

  // XP from forging
  const baseXP = Math.floor(blueprint.power * 0.5);
  const stationXPBonus = stationDef ? stationDef.xpBonus + (stationUpgrade - 1) * 0.1 : 1.0;
  const xpEarned = Math.floor(baseXP * stationXPBonus * (multiplier + 0.2));

  // Coin reward
  const coinsEarned = Math.floor(blueprint.forgeCost * multiplier * 0.5);

  // Grant XP and coins
  efAddXP(xpEarned);
  s.coins += coinsEarned;

  // Element mastery XP
  const masteryXPPerElement = Math.floor(xpEarned / blueprint.requiredElements.length);
  for (const eid of blueprint.requiredElements) {
    efAddElementXP(eid, masteryXPPerElement);
  }

  // Update streak
  s.streak += 1;
  if (s.streak > s.bestStreak) {
    s.bestStreak = s.streak;
  }

  // Add to run history
  s.runHistory.push({
    id: generateInstanceId(),
    itemId: blueprint.id,
    quality,
    success: true,
    timestamp: Date.now(),
    xpEarned,
    power: effectivePower,
  });

  // Keep history at 100 entries max
  if (s.runHistory.length > 100) {
    s.runHistory = s.runHistory.slice(-100);
  }

  // Check daily challenge
  ensureDailyChallenge();
  if (
    s.dailyChallenge.blueprintId === blueprint.id &&
    !s.dailyChallenge.completed
  ) {
    s.dailyChallenge.completed = true;
    s.dailyChallenge.completedAt = Date.now();
    const bonusXP = Math.floor(xpEarned * (s.dailyChallenge.xpMultiplier - 1));
    const bonusCoins = Math.floor(coinsEarned * (s.dailyChallenge.coinMultiplier - 1));
    efAddXP(bonusXP);
    s.coins += bonusCoins;
  }

  // Check achievements
  void internalCheckAchievements();

  // Fluctuate market
  void fluctuateMarketPrices();

  return {
    success: true,
    item: invItem,
    quality,
    xpEarned,
    coinsEarned,
    stationId: s.currentStationId,
    temperature: s.forgeTemperature,
    failureReason: "",
  };
}

/** Returns a simulated forge result preview (does not actually forge). */
export function efGetForgeResult(itemId: string): {
  canForge: boolean;
  reason: string;
  estimatedQuality: EfQuality;
  estimatedPower: number;
} {
  const s = ensureInit();
  const blueprint = EF_ITEMS.find((item) => item.id === itemId);

  if (!blueprint) {
    return { canForge: false, reason: "Blueprint not found.", estimatedQuality: "Flawed", estimatedPower: 0 };
  }

  if (s.level < blueprint.requiredLevel) {
    return { canForge: false, reason: `Requires level ${blueprint.requiredLevel}.`, estimatedQuality: "Flawed", estimatedPower: 0 };
  }

  for (let i = 0; i < blueprint.requiredElements.length; i++) {
    const eid = blueprint.requiredElements[i];
    const required = blueprint.requiredMastery[i];
    if ((s.elementMastery[eid] ?? 1) < required) {
      return { canForge: false, reason: `Requires ${eid} mastery ${required}.`, estimatedQuality: "Flawed", estimatedPower: 0 };
    }
  }

  if (s.coins < blueprint.forgeCost) {
    return { canForge: false, reason: `Insufficient coins (need ${blueprint.forgeCost}).`, estimatedQuality: "Flawed", estimatedPower: 0 };
  }

  if (s.inventory.length >= 60) {
    return { canForge: false, reason: "Inventory full.", estimatedQuality: "Flawed", estimatedPower: 0 };
  }

  // Estimate quality at current settings
  const tempDeviation = Math.abs(s.forgeTemperature - 1000);
  const tempPrecision = Math.max(0, 100 - tempDeviation / 15);
  let avgMastery = 0;
  for (let i = 0; i < blueprint.requiredElements.length; i++) {
    avgMastery += s.elementMastery[blueprint.requiredElements[i]] ?? 1;
  }
  avgMastery = avgMastery / blueprint.requiredElements.length;
  const masteryBonus = Math.min(20, avgMastery * 1.5);
  const stationDef = EF_STATIONS.find((st) => st.id === s.currentStationId);
  const stationUpgrade = s.stationUpgrades[s.currentStationId] ?? 1;
  const stationBonus = stationDef
    ? (stationDef.qualityBonus + (stationUpgrade - 1) * 0.02) * 100
    : 0;
  const totalPrecision = Math.min(100, tempPrecision + masteryBonus + stationBonus);
  const { quality, multiplier } = qualityFromPrecision(totalPrecision);
  const estimatedPower = Math.floor(blueprint.power * multiplier);

  return { canForge: true, reason: "", estimatedQuality: quality, estimatedPower };
}

// ---------------------------------------------------------------------------
// 7. Forge Stations
// ---------------------------------------------------------------------------

/** Returns all 8 forge station definitions with current unlock/upgrade state. */
export function efGetForgeStations(): EfForgeStation[] {
  const s = ensureInit();
  return EF_STATIONS.map((st) => ({
    ...st,
    unlocked: s.unlockedStations.includes(st.id),
    upgradeLevel: s.stationUpgrades[st.id] ?? 1,
  }));
}

/** Returns the current active forge station. */
export function efGetCurrentStation(): EfForgeStation | null {
  const s = ensureInit();
  const def = EF_STATIONS.find((st) => st.id === s.currentStationId);
  if (!def) return null;
  return {
    ...def,
    unlocked: s.unlockedStations.includes(s.currentStationId),
    upgradeLevel: s.stationUpgrades[s.currentStationId] ?? 1,
  };
}

/**
 * Sets the active forge station. Unlocks it if the player meets requirements.
 * Returns { success, reason? }.
 */
export function efSetStation(stationId: EfStationId): { success: boolean; reason?: string } {
  const s = ensureInit();
  const station = EF_STATIONS.find((st) => st.id === stationId);
  if (!station) return { success: false, reason: "Station not found." };

  if (s.level < station.unlockLevel) {
    return { success: false, reason: `Requires level ${station.unlockLevel}.` };
  }

  if (!s.unlockedStations.includes(stationId)) {
    if (s.coins < station.unlockCost) {
      return { success: false, reason: `Unlock costs ${station.unlockCost} coins.` };
    }
    s.coins -= station.unlockCost;
    s.unlockedStations.push(stationId);
  }

  s.currentStationId = stationId;
  return { success: true };
}

/**
 * Upgrades a station (level 1–5). Cost increases per level.
 * Returns { success, newLevel, reason? }.
 */
export function efUpgradeStation(stationId: EfStationId): {
  success: boolean;
  newLevel: number;
  reason?: string;
} {
  const s = ensureInit();
  const station = EF_STATIONS.find((st) => st.id === stationId);
  if (!station) return { success: false, newLevel: 0, reason: "Station not found." };

  if (!s.unlockedStations.includes(stationId)) {
    return { success: false, newLevel: 0, reason: "Station not unlocked." };
  }

  const currentLevel = s.stationUpgrades[stationId] ?? 1;
  if (currentLevel >= 5) {
    return { success: false, newLevel: currentLevel, reason: "Already at max level." };
  }

  const upgradeCost = Math.floor(station.unlockCost * 0.5 * currentLevel);
  if (s.coins < upgradeCost) {
    return { success: false, newLevel: currentLevel, reason: `Upgrade costs ${upgradeCost} coins.` };
  }

  s.coins -= upgradeCost;
  const newLevel = clampLevel(currentLevel + 1, 1, 5);
  s.stationUpgrades[stationId] = newLevel;

  return { success: true, newLevel };
}

// ---------------------------------------------------------------------------
// 8. Temperature
// ---------------------------------------------------------------------------

/** Sets the forge temperature (0–2000). */
export function efSetTemperature(temp: number): number {
  const s = ensureInit();
  s.forgeTemperature = clampLevel(temp, 0, 2000);
  return s.forgeTemperature;
}

/** Returns the current forge temperature. */
export function efGetTemperature(): number {
  return ensureInit().forgeTemperature;
}

/** Returns the optimal temperature for forging (always 1000). */
export function efGetOptimalTemperature(): number {
  return 1000;
}

// ---------------------------------------------------------------------------
// 9. Forge Start / Cancel (for timed forging flow)
// ---------------------------------------------------------------------------

/**
 * Starts a timed forge. Sets activeForge with the blueprint, station, and duration.
 * Returns { success, reason? }.
 */
export function efStartForge(itemId: string): { success: boolean; reason?: string } {
  const s = ensureInit();

  const blueprint = EF_ITEMS.find((item) => item.id === itemId);
  if (!blueprint) return { success: false, reason: "Blueprint not found." };

  if (s.activeForge) {
    return { success: false, reason: "A forge is already in progress." };
  }

  if (s.level < blueprint.requiredLevel) {
    return { success: false, reason: `Requires level ${blueprint.requiredLevel}.` };
  }

  if (s.coins < blueprint.forgeCost) {
    return { success: false, reason: `Insufficient coins (need ${blueprint.forgeCost}).` };
  }

  if (s.inventory.length >= 60) {
    return { success: false, reason: "Inventory full." };
  }

  s.activeForge = {
    itemId: blueprint.id,
    stationId: s.currentStationId,
    temperature: s.forgeTemperature,
    startedAt: Date.now(),
    duration: blueprint.forgeTime,
  };

  return { success: true };
}

/** Cancels an active forge. Returns a refund percentage. */
export function efCancelForge(): { cancelled: boolean; refundPercent: number } {
  const s = ensureInit();
  if (!s.activeForge) {
    return { cancelled: false, refundPercent: 0 };
  }

  const blueprint = EF_ITEMS.find((item) => item.id === s.activeForge.itemId);
  if (!blueprint) {
    s.activeForge = null;
    return { cancelled: true, refundPercent: 0 };
  }

  // Refund 50% of cost
  const refund = Math.floor(blueprint.forgeCost * 0.5);
  s.coins += refund;
  s.activeForge = null;

  return { cancelled: true, refundPercent: 50 };
}

/** Returns the active forge state or null. */
export function efGetActiveForge(): ElementalForgeState["activeForge"] {
  return ensureInit().activeForge;
}

// ---------------------------------------------------------------------------
// 10. Quality System
// ---------------------------------------------------------------------------

/** Returns the 5 quality tier definitions. */
export function efGetQuality(): Array<{
  quality: EfQuality;
  minPrecision: number;
  maxPrecision: number;
  multiplier: number;
}> {
  return QUALITY_THRESHOLDS.map((t) => ({
    quality: t.quality,
    minPrecision: t.min,
    maxPrecision: t.max,
    multiplier: t.multiplier,
  }));
}

// ---------------------------------------------------------------------------
// 11. Enhancement System
// ---------------------------------------------------------------------------

/** Returns all items in inventory that can be enhanced. */
export function efGetEnhancements(): EfInventoryItem[] {
  const s = ensureInit();
  return s.inventory.filter((inv) => inv.enhanceLevel < 10);
}

/**
 * Enhances an inventory item by +1. Cost and success rate depend on current level.
 * Returns { success, reason?, newLevel, cost }.
 */
export function efEnhanceItem(instanceId: string): {
  success: boolean;
  reason?: string;
  newLevel: number;
  cost: number;
} {
  const s = ensureInit();
  const invItem = s.inventory.find((inv) => inv.instanceId === instanceId);
  if (!invItem) {
    return { success: false, reason: "Item not found.", newLevel: 0, cost: 0 };
  }

  if (invItem.enhanceLevel >= 10) {
    return { success: false, reason: "Already at max enhancement (+10).", newLevel: invItem.enhanceLevel, cost: 0 };
  }

  const cost = efGetEnhanceCost(invItem.enhanceLevel, invItem.rarity);
  if (s.coins < cost) {
    return { success: false, reason: `Enhancement costs ${cost} coins.`, newLevel: invItem.enhanceLevel, cost };
  }

  s.coins -= cost;

  // Success rate decreases with enhancement level
  const baseRate = 1.0 - invItem.enhanceLevel * 0.08;
  const success = Math.random() < baseRate;

  if (success) {
    invItem.enhanceLevel += 1;
    // Recalculate effective power and stats
    const blueprint = EF_ITEMS.find((item) => item.id === invItem.itemId);
    if (blueprint) {
      const qualityInfo = QUALITY_THRESHOLDS.find((t) => t.quality === invItem.quality);
      const qMult = qualityInfo ? qualityInfo.multiplier : 1.0;
      const enhanceMult = 1 + invItem.enhanceLevel * 0.1;
      const totalMult = qMult * enhanceMult;
      invItem.effectivePower = Math.floor(blueprint.power * totalMult);
      invItem.effectiveStats = {};
      for (const statKey of Object.keys(blueprint.stats)) {
        invItem.effectiveStats[statKey] = Math.floor(blueprint.stats[statKey] * totalMult);
      }
    }

    void internalCheckAchievements();
    return { success: true, newLevel: invItem.enhanceLevel, cost };
  }

  // Failure: small chance to downgrade by 1
  if (invItem.enhanceLevel > 0 && Math.random() < 0.3) {
    invItem.enhanceLevel = Math.max(0, invItem.enhanceLevel - 1);
  }

  return { success: false, reason: "Enhancement failed.", newLevel: invItem.enhanceLevel, cost };
}

/** Calculates the cost to enhance from a given level for a given rarity. */
export function efGetEnhanceCost(currentLevel: number, rarity: EfRarity): number {
  const rarityMult: Record<string, number> = {
    Common: 1,
    Uncommon: 1.5,
    Rare: 2.5,
    Epic: 4,
    Legendary: 7,
  };
  const base = 50 * (currentLevel + 1);
  return Math.floor(base * (rarityMult[rarity] ?? 1));
}

// ---------------------------------------------------------------------------
// 12. Materials & Inventory
// ---------------------------------------------------------------------------

/** Returns all 8 raw material definitions with owned counts and current prices. */
export function efGetMaterials(): EfMaterial[] {
  const s = ensureInit();
  return EF_MATERIALS.map((m) => ({
    ...m,
    owned: s.materials[m.id] ?? 0,
    currentPrice: s.materialPrices[m.id] ?? m.basePrice,
  }));
}

/** Returns the player's inventory of forged items. */
export function efGetInventory(): EfInventoryItem[] {
  return ensureInit().inventory;
}

/** Removes an item from inventory by instance id. */
export function efDiscardItem(instanceId: string): boolean {
  const s = ensureInit();
  const idx = s.inventory.findIndex((inv) => inv.instanceId === instanceId);
  if (idx === -1) return false;
  s.inventory.splice(idx, 1);
  return true;
}

/** Buys a material from the market. Returns { success, reason?, newCount }. */
export function efBuyMaterial(materialId: EfMaterialId, amount: number): {
  success: boolean;
  reason?: string;
  newCount: number;
} {
  const s = ensureInit();
  const def = EF_MATERIALS.find((m) => m.id === materialId);
  if (!def) return { success: false, reason: "Material not found.", newCount: 0 };

  if (amount <= 0) return { success: false, reason: "Amount must be positive.", newCount: s.materials[materialId] ?? 0 };

  const totalCost = (s.materialPrices[materialId] ?? def.basePrice) * amount;
  if (s.coins < totalCost) {
    return { success: false, reason: `Costs ${totalCost} coins.`, newCount: s.materials[materialId] ?? 0 };
  }

  s.coins -= totalCost;
  s.materials[materialId] = (s.materials[materialId] ?? 0) + amount;
  marketTradeCount += 1;

  void internalCheckAchievements();
  return { success: true, newCount: s.materials[materialId] };
}

/** Sells a material to the market. Returns { success, reason?, coinsReceived }. */
export function efSellMaterial(materialId: EfMaterialId, amount: number): {
  success: boolean;
  reason?: string;
  coinsReceived: number;
} {
  const s = ensureInit();
  const def = EF_MATERIALS.find((m) => m.id === materialId);
  if (!def) return { success: false, reason: "Material not found.", coinsReceived: 0 };

  if (amount <= 0) return { success: false, reason: "Amount must be positive.", coinsReceived: 0 };

  const owned = s.materials[materialId] ?? 0;
  if (amount > owned) {
    return { success: false, reason: `Only have ${owned}.`, coinsReceived: 0 };
  }

  // Sell at 70% of current price
  const pricePerUnit = Math.floor((s.materialPrices[materialId] ?? def.basePrice) * 0.7);
  const coinsReceived = pricePerUnit * amount;

  s.materials[materialId] = owned - amount;
  s.coins += coinsReceived;
  marketTradeCount += 1;

  void internalCheckAchievements();
  return { success: true, coinsReceived };
}

// ---------------------------------------------------------------------------
// 13. Elemental Reactions
// ---------------------------------------------------------------------------

/** Returns all 15 elemental reactions with discovery status. */
export function efGetReactions(): EfReaction[] {
  const s = ensureInit();
  return EF_REACTIONS.map((r) => ({
    ...r,
    discovered: s.discoveredReactions.includes(r.id),
  }));
}

/**
 * Attempts to trigger an elemental reaction between two elements.
 * Has a base 40% discovery chance (increased by mastery).
 */
export function efTriggerReaction(
  elementA: EfElementId,
  elementB: EfElementId,
): {
  success: boolean;
  reason?: string;
  reaction: EfReaction | null;
} {
  const s = ensureInit();

  if (elementA === elementB) {
    return { success: false, reason: "Cannot react an element with itself.", reaction: null };
  }

  // Find matching reaction
  const reaction = EF_REACTIONS.find(
    (r) =>
      (r.elements[0] === elementA && r.elements[1] === elementB) ||
      (r.elements[0] === elementB && r.elements[1] === elementA),
  );

  if (!reaction) {
    return { success: false, reason: "No reaction exists between these elements.", reaction: null };
  }

  if (s.discoveredReactions.includes(reaction.id)) {
    return { success: false, reason: "Reaction already discovered.", reaction: { ...reaction, discovered: true } };
  }

  // Discovery chance based on mastery of both elements
  const masteryA = s.elementMastery[elementA] ?? 1;
  const masteryB = s.elementMastery[elementB] ?? 1;
  const discoveryChance = 0.4 + (masteryA + masteryB) * 0.015;

  if (Math.random() < discoveryChance) {
    s.discoveredReactions.push(reaction.id);
    // Award XP for both elements
    efAddElementXP(elementA, Math.floor(reaction.power * 10));
    efAddElementXP(elementB, Math.floor(reaction.power * 10));
    efAddXP(Math.floor(reaction.power * 5));
    return { success: true, reaction: { ...reaction, discovered: true } };
  }

  return { success: false, reason: "Reaction attempt failed. Try again!", reaction: { ...reaction, discovered: false } };
}

/** Returns a specific reaction result by id. */
export function efGetReactionResult(reactionId: string): EfReaction | null {
  const s = ensureInit();
  const reaction = EF_REACTIONS.find((r) => r.id === reactionId);
  if (!reaction) return null;
  return {
    ...reaction,
    discovered: s.discoveredReactions.includes(reaction.id),
  };
}

// ---------------------------------------------------------------------------
// 14. Best Items
// ---------------------------------------------------------------------------

/** Returns the top N items in inventory sorted by effective power. */
export function efGetBestItems(count?: number): EfInventoryItem[] {
  const s = ensureInit();
  const n = count ?? 10;
  const sorted = [...s.inventory].sort((a, b) => b.effectivePower - a.effectivePower);
  return sorted.slice(0, n);
}

/** Returns the best item in a specific category. */
export function efGetBestItemByCategory(category: EfItemCategory): EfInventoryItem | null {
  const s = ensureInit();
  const filtered = s.inventory.filter((inv) => inv.category === category);
  if (filtered.length === 0) return null;
  return filtered.sort((a, b) => b.effectivePower - a.effectivePower)[0];
}

// ---------------------------------------------------------------------------
// 15. Daily Challenge
// ---------------------------------------------------------------------------

/** Returns today's daily forge challenge. */
export function efGetDailyChallenge(): EfDailyChallenge {
  ensureDailyChallenge();
  return ensureInit().dailyChallenge;
}

/** Marks today's daily challenge as completed (if the conditions are met). */
export function efCompleteDaily(): {
  completed: boolean;
  bonusXP: number;
  bonusCoins: number;
} {
  const s = ensureInit();
  ensureDailyChallenge();

  if (s.dailyChallenge.completed) {
    return { completed: false, bonusXP: 0, bonusCoins: 0 };
  }

  // The daily is auto-completed when forging the challenge blueprint.
  // This function allows manual completion with a smaller bonus.
  s.dailyChallenge.completed = true;
  s.dailyChallenge.completedAt = Date.now();
  const baseBonus = 50 * s.level;
  const bonusXP = Math.floor(baseBonus * s.dailyChallenge.xpMultiplier);
  const bonusCoins = Math.floor(baseBonus * s.dailyChallenge.coinMultiplier);
  efAddXP(bonusXP);
  s.coins += bonusCoins;

  void internalCheckAchievements();
  return { completed: true, bonusXP, bonusCoins };
}

// ---------------------------------------------------------------------------
// 16. Streak
// ---------------------------------------------------------------------------

/** Returns the current forge streak. */
export function efGetStreak(): number {
  return ensureInit().streak;
}

/** Returns the best streak ever achieved. */
export function efGetBestStreak(): number {
  return ensureInit().bestStreak;
}

/** Resets the current streak (e.g., on a failed forge). */
export function efResetStreak(): void {
  ensureInit().streak = 0;
}

// ---------------------------------------------------------------------------
// 17. Stats
// ---------------------------------------------------------------------------

/** Returns a summary of forge statistics. */
export function efGetStats(): {
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  totalForged: number;
  rareForged: number;
  streak: number;
  bestStreak: number;
  inventoryCount: number;
  inventoryMax: number;
  discoveredReactions: number;
  totalReactions: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  materialsOwned: number;
  currentStation: string;
} {
  const s = ensureInit();
  const station = EF_STATIONS.find((st) => st.id === s.currentStationId);
  return {
    level: s.level,
    xp: s.xp,
    xpToNext: s.xpToNext,
    coins: s.coins,
    totalForged: s.totalForged,
    rareForged: s.rareForged,
    streak: s.streak,
    bestStreak: s.bestStreak,
    inventoryCount: s.inventory.length,
    inventoryMax: 60,
    discoveredReactions: s.discoveredReactions.length,
    totalReactions: EF_REACTIONS.length,
    achievementsUnlocked: Object.values(s.achievements).filter(Boolean).length,
    totalAchievements: EF_ACHIEVEMENT_DEFS.length,
    materialsOwned: Object.values(s.materials).reduce((sum, v) => sum + v, 0),
    currentStation: station ? station.name : "Unknown",
  };
}

// ---------------------------------------------------------------------------
// 18. Achievements
// ---------------------------------------------------------------------------

/** Returns all 15 achievement definitions with unlock status. */
export function efGetAchievements(): EfAchievementDef[] {
  const s = ensureInit();
  return EF_ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    unlocked: s.achievements[def.id] ?? false,
    unlockedAt: s.achievementTimestamps[def.id] ?? null,
  }));
}

/** Manually checks and unlocks any pending achievements. Returns newly unlocked ids. */
export function efCheckAchievements(): EfAchievementId[] {
  return internalCheckAchievements();
}

// ---------------------------------------------------------------------------
// 19. Run History
// ---------------------------------------------------------------------------

/** Returns the forge run history, most recent first. */
export function efGetRunHistory(limit?: number): EfRunHistoryEntry[] {
  const s = ensureInit();
  const history = [...s.runHistory].reverse();
  if (limit !== undefined) {
    return history.slice(0, limit);
  }
  return history;
}

// ---------------------------------------------------------------------------
// 20. Hints
// ---------------------------------------------------------------------------

/**
 * Returns a contextual hint based on the current state.
 * Useful for UI tutorials and guidance.
 */
export function efGetHint(): string {
  const s = ensureInit();

  if (s.totalForged === 0) {
    return "Forge your first item! Select a blueprint, set your temperature near 1000, and hit forge.";
  }

  if (s.level < 5) {
    return "Keep forging to level up! At level 5 you can unlock the Elemental Crucible for better quality.";
  }

  if (s.discoveredReactions.length === 0) {
    return "Try combining elements! Use efTriggerReaction to discover powerful elemental reactions.";
  }

  if (s.inventory.length === 0) {
    return "Your inventory is empty. Forge some items to fill it up!";
  }

  if (Object.values(s.materials).reduce((sum, v) => sum + v, 0) === 0) {
    return "Visit the Material Market to buy raw materials for reactions.";
  }

  if (s.unlockedStations.length <= 2) {
    return "Save up coins to unlock more forge stations for better quality bonuses.";
  }

  const avgMastery =
    Object.values(s.elementMastery).reduce((sum, v) => sum + v, 0) /
    Object.keys(s.elementMastery).length;

  if (avgMastery < 5) {
    return "Focus on one or two elements to raise their mastery for higher-quality forges.";
  }

  if (s.level >= 15 && !s.achievements["rare_find"]) {
    return "Try to forge Fine quality or higher items. Set temperature exactly to 1000 for best precision.";
  }

  if (s.streak >= 3) {
    return `Great streak of ${s.streak}! Keep forging daily to build your best streak record.`;
  }

  return "Experiment with different station and temperature combinations for varied results.";
}

// ---------------------------------------------------------------------------
// 21. Utility: Get item by id
// ---------------------------------------------------------------------------

/** Returns a forgeable item blueprint by id, or null. */
export function efGetItemById(itemId: string): EfForgeableItem | null {
  return EF_ITEMS.find((item) => item.id === itemId) ?? null;
}

/** Returns an inventory item by instance id, or null. */
export function efGetInventoryItem(instanceId: string): EfInventoryItem | null {
  return ensureInit().inventory.find((inv) => inv.instanceId === instanceId) ?? null;
}

// ---------------------------------------------------------------------------
// 22. Bulk operations
// ---------------------------------------------------------------------------

/** Returns all inventory items sorted by a given key. */
export function efGetInventorySorted(
  sortBy: "power" | "quality" | "rarity" | "forgedAt" | "name",
  ascending?: boolean,
): EfInventoryItem[] {
  const s = ensureInit();
  const asc = ascending ?? false;
  const sorted = [...s.inventory];

  switch (sortBy) {
    case "power":
      sorted.sort((a, b) => asc ? a.effectivePower - b.effectivePower : b.effectivePower - a.effectivePower);
      break;
    case "quality": {
      const qualityOrder: Record<EfQuality, number> = {
        Flawed: 0, Normal: 1, Fine: 2, Perfect: 3, Masterwork: 4,
      };
      sorted.sort((a, b) => asc
        ? (qualityOrder[a.quality] ?? 0) - (qualityOrder[b.quality] ?? 0)
        : (qualityOrder[b.quality] ?? 0) - (qualityOrder[a.quality] ?? 0),
      );
      break;
    }
    case "rarity":
      sorted.sort((a, b) => asc
        ? rarityIndex(a.rarity) - rarityIndex(b.rarity)
        : rarityIndex(b.rarity) - rarityIndex(a.rarity),
      );
      break;
    case "forgedAt":
      sorted.sort((a, b) => asc ? a.forgedAt - b.forgedAt : b.forgedAt - a.forgedAt);
      break;
    case "name":
      sorted.sort((a, b) => asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      break;
    default:
      break;
  }

  return sorted;
}

/** Returns the count of items in inventory by category. */
export function efGetInventoryCounts(): Record<EfItemCategory, number> {
  const s = ensureInit();
  const counts: Record<string, number> = {
    weapon: 0, armor: 0, accessory: 0, tool: 0, relic: 0,
  };
  for (const inv of s.inventory) {
    counts[inv.category] = (counts[inv.category] ?? 0) + 1;
  }
  return counts as Record<EfItemCategory, number>;
}

/** Returns forge success rate from run history. */
export function efGetSuccessRate(): number {
  const s = ensureInit();
  if (s.runHistory.length === 0) return 0;
  const successes = s.runHistory.filter((h) => h.success).length;
  return successes / s.runHistory.length;
}

/** Returns total forge power (sum of all inventory items' effective power). */
export function efGetTotalPower(): number {
  const s = ensureInit();
  return s.inventory.reduce((sum, inv) => sum + inv.effectivePower, 0);
}

/** Returns the optimal temperature hint for a specific item. */
export function efGetOptimalTempHint(itemId: string): {
  optimalTemp: number;
  currentTemp: number;
  deviation: number;
} {
  const s = ensureInit();
  const optimal = efGetOptimalTemperature();
  return {
    optimalTemp: optimal,
    currentTemp: s.forgeTemperature,
    deviation: Math.abs(s.forgeTemperature - optimal),
  };
}
