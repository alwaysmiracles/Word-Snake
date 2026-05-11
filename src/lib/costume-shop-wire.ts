// =============================================================================
// Costume Shop Wire — Character Customization & Fashion Game System
// SSR-safe: uses ensureInit() pattern, no localStorage/window/document
// All exports use "co" prefix, no hooks
// =============================================================================

// ---- Inline Types ----

type CostumeCategory = "headwear" | "tops" | "bottoms" | "footwear" | "accessories" | "capes" | "wings" | "full_suits";
type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
type Currency = "coins" | "gems" | "tickets";
type MaterialId = "silk" | "leather" | "crystal" | "feather" | "dragon_scale" | "moonstone" | "star_thread" | "enchanted_wood";
type ThemedSet = "royal" | "ninja" | "wizard" | "pirate" | "astronaut" | "dragon" | "forest" | "ocean";

type CostumeItem = {
  id: string;
  name: string;
  category: CostumeCategory;
  rarity: Rarity;
  styleBonus: number;
  emoji: string;
  description: string;
  price: number;
  currency: Currency;
  setId: ThemedSet | null;
  dyeable: boolean;
  enhancementLevel: number;
  appliedColor: string | null;
};

type CostumeSet = {
  id: ThemedSet;
  name: string;
  pieceIds: string[];
  bonus: string;
  bonusStyle: number;
  requiredPieces: number;
};

type MaterialEntry = {
  id: MaterialId;
  name: string;
  emoji: string;
  description: string;
  quantity: number;
};

type OutfitSlot = {
  headwear: string | null;
  tops: string | null;
  bottoms: string | null;
  footwear: string | null;
  accessories: string | null;
  capes: string | null;
  wings: string | null;
  full_suits: string | null;
};

type OutfitPreset = {
  id: string;
  name: string;
  slots: OutfitSlot;
  styleScore: number;
  createdAt: number;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (s: CostumeShopState) => boolean;
  reward: { currency: Currency; amount: number };
  unlocked: boolean;
  unlockedAt: number | null;
};

type FashionCritic = {
  id: string;
  name: string;
  personality: string;
  favoriteSet: ThemedSet;
  strictness: number;
  emoji: string;
};

type FashionContestEntry = {
  outfitId: string;
  npcName: string;
  npcEmoji: string;
  styleScore: number;
};

type ShopDailyItem = {
  costumeId: string;
  discountPercent: number;
  originalPrice: number;
  salePrice: number;
};

type CostumeShopState = {
  costumes: CostumeItem[];
  ownedCostumeIds: string[];
  coins: number;
  gems: number;
  tickets: number;
  activeOutfit: OutfitSlot;
  outfitPresets: OutfitPreset[];
  materials: MaterialEntry[];
  level: number;
  xp: number;
  xpToNext: number;
  dailyChallenge: { type: string; progress: number; target: number; reward: { currency: Currency; amount: number }; completed: boolean } | null;
  lastDate: string;
  achievements: Achievement[];
  contestHistory: FashionContestEntry[];
  workshopQueue: { costumeId: string; progress: number; required: number; material: MaterialId }[];
  dyeColors: string[];
  favoriteCostumeIds: string[];
};

// ---- Rarity Config ----

const RARITY_CONFIG: Record<Rarity, { color: string; label: string; priceMultiplier: number; xpReward: number }> = {
  common:    { color: "#d1d5db", label: "Common",    priceMultiplier: 1,   xpReward: 10 },
  uncommon:  { color: "#4ade80", label: "Uncommon",  priceMultiplier: 2.5, xpReward: 25 },
  rare:      { color: "#60a5fa", label: "Rare",      priceMultiplier: 5,   xpReward: 50 },
  epic:      { color: "#c084fc", label: "Epic",      priceMultiplier: 10,  xpReward: 100 },
  legendary: { color: "#fbbf24", label: "Legendary", priceMultiplier: 25,  xpReward: 250 },
};

// ---- Material Definitions ----

const MATERIAL_DEFS: Array<{ id: MaterialId; name: string; emoji: string; description: string }> = [
  { id: "silk",           name: "Silk",           emoji: "🧵", description: "Smooth fabric for elegant garments" },
  { id: "leather",        name: "Leather",        emoji: "🪶", description: "Tough hide for durable armor" },
  { id: "crystal",        name: "Crystal",        emoji: "💎", description: "Shards that refract light beautifully" },
  { id: "feather",        name: "Feather",        emoji: "🪽", description: "Lightweight plumage for flying gear" },
  { id: "dragon_scale",   name: "Dragon Scale",   emoji: "🐉", description: "Rare scales from ancient dragons" },
  { id: "moonstone",      name: "Moonstone",      emoji: "🌙", description: "Glowing stones that pulse with lunar energy" },
  { id: "star_thread",    name: "Star Thread",    emoji: "✨", description: "Luminous threads woven from starlight" },
  { id: "enchanted_wood", name: "Enchanted Wood",  emoji: "🌿", description: "Living wood imbued with nature magic" },
];

// ---- Full Costume Catalog (52 costumes) ----

function buildCostumeCatalog(): CostumeItem[] {
  const c: CostumeItem[] = [];

  // --- Headwear (8) ---
  c.push({ id: "hw_crown_gold",      name: "Golden Crown",          category: "headwear", rarity: "legendary", styleBonus: 30, emoji: "👑", description: "A crown forged from pure gold", price: 500, currency: "tickets", setId: "royal", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "hw_ninja_mask",      name: "Shadow Mask",           category: "headwear", rarity: "epic",      styleBonus: 22, emoji: "🎭", description: "A mask that conceals identity", price: 200, currency: "gems",    setId: "ninja", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "hw_wizard_hat",      name: "Archmage Hat",          category: "headwear", rarity: "rare",      styleBonus: 15, emoji: "🧙", description: "Pointed hat of arcane power", price: 100, currency: "gems",    setId: "wizard", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "hw_pirate_tricorn",  name: "Pirate Tricorn",        category: "headwear", rarity: "uncommon",  styleBonus: 10, emoji: "🏴‍☠️", description: "Weathered hat of a sea rogue", price: 250, currency: "coins", setId: "pirate", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "hw_astronaut_helm",  name: "Space Helmet",          category: "headwear", rarity: "epic",      styleBonus: 20, emoji: "🪖", description: "Transparent dome for space walks", price: 180, currency: "gems", setId: "astronaut", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "hw_dragon_horns",    name: "Dragon Horns",          category: "headwear", rarity: "legendary", styleBonus: 28, emoji: "🐲", description: "Horns harvested from dragon lords", price: 450, currency: "tickets", setId: "dragon", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "hw_leaf_wreath",     name: "Leaf Wreath",           category: "headwear", rarity: "uncommon",  styleBonus: 8,  emoji: "🍃", description: "Circlet of enchanted forest leaves", price: 200, currency: "coins", setId: "forest", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "hw_coral_tiara",     name: "Coral Tiara",           category: "headwear", rarity: "rare",      styleBonus: 14, emoji: "🐚", description: "Tiara made from living coral", price: 90, currency: "gems", setId: "ocean", dyeable: true, enhancementLevel: 0, appliedColor: null });

  // --- Tops (8) ---
  c.push({ id: "tp_royal_robe",      name: "Royal Robe",            category: "tops", rarity: "legendary", styleBonus: 28, emoji: "👘", description: "Velvet robe with gold embroidery", price: 480, currency: "tickets", setId: "royal", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "tp_ninja_gi",        name: "Shadow Gi",             category: "tops", rarity: "epic",      styleBonus: 20, emoji: "🥋", description: "Lightweight gi for stealth", price: 190, currency: "gems",    setId: "ninja", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "tp_wizard_robe",     name: "Mystic Robe",           category: "tops", rarity: "rare",      styleBonus: 16, emoji: "🧥", description: "Robe woven with arcane symbols", price: 110, currency: "gems",    setId: "wizard", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "tp_pirate_vest",     name: "Sea Dog Vest",          category: "tops", rarity: "uncommon",  styleBonus: 9,  emoji: "🦺", description: "Tattered vest with cutlass loops", price: 230, currency: "coins", setId: "pirate", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "tp_space_suit",      name: "Astronaut Suit",        category: "tops", rarity: "epic",      styleBonus: 22, emoji: "🧑‍🚀", description: "EVA-rated pressure suit", price: 200, currency: "gems",    setId: "astronaut", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "tp_dragon_chest",    name: "Dragon Scale Armor",    category: "tops", rarity: "legendary", styleBonus: 30, emoji: "🛡️", description: "Armor of impenetrable dragon scales", price: 520, currency: "tickets", setId: "dragon", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "tp_bark_armor",      name: "Bark Armor",            category: "tops", rarity: "uncommon",  styleBonus: 8,  emoji: "🌲", description: "Living armor that grows with you", price: 180, currency: "coins", setId: "forest", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "tp_pearl_shirt",     name: "Pearl Shell Top",       category: "tops", rarity: "rare",      styleBonus: 13, emoji: "🦪", description: "Lustrous shirt from deep sea pearls", price: 95, currency: "gems",    setId: "ocean", dyeable: true, enhancementLevel: 0, appliedColor: null });

  // --- Bottoms (6) ---
  c.push({ id: "bt_royal_pants",     name: "Royal Trousers",        category: "bottoms", rarity: "legendary", styleBonus: 25, emoji: "👖", description: "Silk trousers fit for a monarch", price: 400, currency: "tickets", setId: "royal", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "bt_ninja_pants",     name: "Shadow Leggings",       category: "bottoms", rarity: "epic",      styleBonus: 18, emoji: "🩳", description: "Silent leggings for quick movement", price: 170, currency: "gems",    setId: "ninja", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "bt_wizard_pants",    name: "Arcane Trousers",       category: "bottoms", rarity: "rare",      styleBonus: 12, emoji: "👖", description: "Trousers with floating rune hems", price: 80, currency: "gems",    setId: "wizard", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "bt_pirate_pants",    name: "Peg Leg Britches",      category: "bottoms", rarity: "uncommon",  styleBonus: 7,  emoji: "🩳", description: "Rugged britches with patched knees", price: 200, currency: "coins", setId: "pirate", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "bt_space_pants",     name: "Zero-G Pants",          category: "bottoms", rarity: "epic",      styleBonus: 18, emoji: "👖", description: "Pants for zero-gravity environments", price: 160, currency: "gems",    setId: "astronaut", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "bt_dragon_pants",    name: "Dragon Hide Leggings",  category: "bottoms", rarity: "legendary", styleBonus: 24, emoji: "🦵", description: "Leggings from fire-resistant dragon hide", price: 420, currency: "tickets", setId: "dragon", dyeable: true, enhancementLevel: 0, appliedColor: null });

  // --- Footwear (6) ---
  c.push({ id: "ft_royal_boots",     name: "Golden Boots",          category: "footwear", rarity: "legendary", styleBonus: 22, emoji: "👢", description: "Boots encrusted with rubies", price: 350, currency: "tickets", setId: "royal", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ft_ninja_tabi",      name: "Silent Tabi",           category: "footwear", rarity: "epic",      styleBonus: 16, emoji: "🥿", description: "Soft soled ninja footwear", price: 150, currency: "gems",    setId: "ninja", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ft_wizard_boots",    name: "Mystic Boots",          category: "footwear", rarity: "rare",      styleBonus: 10, emoji: "👢", description: "Boots that hover above ground", price: 70, currency: "gems",    setId: "wizard", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ft_pirate_boots",    name: "Sea-Weathered Boots",   category: "footwear", rarity: "uncommon",  styleBonus: 6,  emoji: "👢", description: "Salt-stained leather boots", price: 180, currency: "coins", setId: "pirate", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ft_space_boots",     name: "Mag-Boots",             category: "footwear", rarity: "epic",      styleBonus: 15, emoji: "🥾", description: "Magnetic boots for hull walking", price: 140, currency: "gems",    setId: "astronaut", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ft_dragon_claws",    name: "Dragon Claw Boots",     category: "footwear", rarity: "legendary", styleBonus: 20, emoji: "🦶", description: "Boots tipped with dragon talons", price: 380, currency: "tickets", setId: "dragon", dyeable: true, enhancementLevel: 0, appliedColor: null });

  // --- Accessories (8) ---
  c.push({ id: "ac_royal_scepter",   name: "Royal Scepter",         category: "accessories", rarity: "legendary", styleBonus: 25, emoji: "🏆", description: "Scepter of sovereign power", price: 460, currency: "tickets", setId: "royal", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ac_ninja_kunai",     name: "Shadow Kunai",          category: "accessories", rarity: "epic",      styleBonus: 18, emoji: "🔪", description: "Balanced throwing blades", price: 160, currency: "gems",    setId: "ninja", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ac_wizard_staff",    name: "Crystal Staff",         category: "accessories", rarity: "rare",      styleBonus: 14, emoji: "🪄", description: "Staff topped with a focus crystal", price: 90, currency: "gems",    setId: "wizard", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ac_pirate_hook",     name: "Captain's Hook",        category: "accessories", rarity: "uncommon",  styleBonus: 7,  emoji: "🪝", description: "A polished steel hook hand", price: 220, currency: "coins", setId: "pirate", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ac_space_tool",      name: "Multitool",             category: "accessories", rarity: "epic",      styleBonus: 15, emoji: "🔧", description: "All-in-one astronaut tool", price: 150, currency: "gems",    setId: "astronaut", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ac_dragon_amulet",   name: "Dragon Amulet",         category: "accessories", rarity: "legendary", styleBonus: 26, emoji: "🔮", description: "Amulet containing dragon fire", price: 470, currency: "tickets", setId: "dragon", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ac_forest_amulet",   name: "Nature Amulet",         category: "accessories", rarity: "uncommon",  styleBonus: 8,  emoji: "📿", description: "Amulet that hums with forest magic", price: 200, currency: "coins", setId: "forest", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "ac_ocean_trident",   name: "Trident of Tides",      category: "accessories", rarity: "rare",      styleBonus: 15, emoji: "🔱", description: "Three-pronged weapon of ocean lords", price: 100, currency: "gems",    setId: "ocean", dyeable: false, enhancementLevel: 0, appliedColor: null });

  // --- Capes (6) ---
  c.push({ id: "cp_royal_cape",      name: "Royal Mantle",          category: "capes", rarity: "legendary", styleBonus: 26, emoji: "🧣", description: "Velvet cape with ermine trim", price: 440, currency: "tickets", setId: "royal", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "cp_ninja_cape",      name: "Smoke Cape",            category: "capes", rarity: "epic",      styleBonus: 17, emoji: "🌪️", description: "Cape that dissipates into smoke", price: 170, currency: "gems",    setId: "ninja", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "cp_wizard_cape",     name: "Star Mantle",           category: "capes", rarity: "rare",      styleBonus: 12, emoji: "🌟", description: "Cape embroidered with constellations", price: 85, currency: "gems",    setId: "wizard", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "cp_pirate_flag",     name: "Jolly Roger Cape",      category: "capes", rarity: "uncommon",  styleBonus: 8,  emoji: "🏴", description: "Cape styled after a pirate flag", price: 240, currency: "coins", setId: "pirate", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "cp_space_jetpack",   name: "Quantum Jetpack",       category: "capes", rarity: "epic",      styleBonus: 19, emoji: "🚀", description: "Jetpack with quantum thrusters", price: 190, currency: "gems",    setId: "astronaut", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "cp_dragon_wings_cape", name: "Dragon Wing Cape",    category: "capes", rarity: "legendary", styleBonus: 24, emoji: "🦇", description: "Cape that mimics dragon wings", price: 410, currency: "tickets", setId: "dragon", dyeable: true, enhancementLevel: 0, appliedColor: null });

  // --- Wings (4) ---
  c.push({ id: "wg_fairy_wings",     name: "Fairy Wings",           category: "wings", rarity: "epic",      styleBonus: 18, emoji: "🧚", description: "Gossamer wings that shimmer", price: 160, currency: "gems",    setId: null, dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "wg_angel_wings",     name: "Seraph Wings",          category: "wings", rarity: "legendary", styleBonus: 28, emoji: "👼", description: "Radiant wings of pure light", price: 500, currency: "tickets", setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "wg_mech_wings",      name: "Mech Wings",            category: "wings", rarity: "rare",      styleBonus: 14, emoji: "⚡", description: "Cybernetic flight wings", price: 110, currency: "gems",    setId: null, dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "wg_shadow_wings",    name: "Shadow Wings",          category: "wings", rarity: "epic",      styleBonus: 20, emoji: "🦇", description: "Wings woven from living shadow", price: 180, currency: "gems",    setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null });

  // --- Full Suits (6) ---
  c.push({ id: "fs_knight_armor",    name: "Knight's Full Plate",   category: "full_suits", rarity: "rare",      styleBonus: 20, emoji: "⚔️", description: "Shining plate armor set", price: 300, currency: "gems",    setId: null, dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "fs_phoenix_suit",    name: "Phoenix Regalia",       category: "full_suits", rarity: "legendary", styleBonus: 35, emoji: "🔥", description: "Burning suit that never fades", price: 600, currency: "tickets", setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "fs_frost_suit",      name: "Frost Warden Suit",     category: "full_suits", rarity: "epic",      styleBonus: 22, emoji: "❄️", description: "Suit that radiates cold energy", price: 220, currency: "gems",    setId: null, dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "fs_nature_suit",     name: "Druidic Full Suit",     category: "full_suits", rarity: "rare",      styleBonus: 18, emoji: "🌳", description: "Living suit of bark and vine", price: 130, currency: "gems",    setId: "forest", dyeable: true, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "fs_abyss_suit",      name: "Abyss Diver Suit",      category: "full_suits", rarity: "epic",      styleBonus: 24, emoji: "🌊", description: "Pressure suit for the deep abyss", price: 200, currency: "gems",    setId: "ocean", dyeable: false, enhancementLevel: 0, appliedColor: null });
  c.push({ id: "fs_cosmic_suit",     name: "Cosmic Wanderer Suit",  category: "full_suits", rarity: "legendary", styleBonus: 32, emoji: "🌌", description: "Suit woven from the fabric of space", price: 550, currency: "tickets", setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null });

  return c;
}

// ---- Themed Set Definitions ----

const COSTUME_SETS: CostumeSet[] = [
  { id: "royal",     name: "Royal Court",         pieceIds: ["hw_crown_gold", "tp_royal_robe", "bt_royal_pants", "ft_royal_boots", "ac_royal_scepter", "cp_royal_cape"],     bonus: "Majestic Aura: +50% style in contests", bonusStyle: 50, requiredPieces: 4 },
  { id: "ninja",     name: "Shadow Clan",         pieceIds: ["hw_ninja_mask", "tp_ninja_gi", "bt_ninja_pants", "ft_ninja_tabi", "ac_ninja_kunai", "cp_ninja_cape"],     bonus: "Silent Strike: +40% style bonus",       bonusStyle: 40, requiredPieces: 4 },
  { id: "wizard",    name: "Arcane Order",        pieceIds: ["hw_wizard_hat", "tp_wizard_robe", "bt_wizard_pants", "ft_wizard_boots", "ac_wizard_staff", "cp_wizard_cape"],   bonus: "Arcane Wisdom: +45% style bonus",       bonusStyle: 45, requiredPieces: 4 },
  { id: "pirate",    name: "Sea Raiders",         pieceIds: ["hw_pirate_tricorn", "tp_pirate_vest", "bt_pirate_pants", "ft_pirate_boots", "ac_pirate_hook", "cp_pirate_flag"], bonus: "Dread Pirate: +35% style bonus",      bonusStyle: 35, requiredPieces: 4 },
  { id: "astronaut", name: "Space Explorers",     pieceIds: ["hw_astronaut_helm", "tp_space_suit", "bt_space_pants", "ft_space_boots", "ac_space_tool", "cp_space_jetpack"], bonus: "Zero Gravity: +42% style bonus",       bonusStyle: 42, requiredPieces: 4 },
  { id: "dragon",    name: "Dragon Riders",       pieceIds: ["hw_dragon_horns", "tp_dragon_chest", "bt_dragon_pants", "ft_dragon_claws", "ac_dragon_amulet", "cp_dragon_wings_cape"], bonus: "Dragon Fire: +55% style bonus", bonusStyle: 55, requiredPieces: 4 },
  { id: "forest",    name: "Forest Guardians",    pieceIds: ["hw_leaf_wreath", "tp_bark_armor", "ac_forest_amulet", "fs_nature_suit"],                   bonus: "Nature's Blessing: +38% style",          bonusStyle: 38, requiredPieces: 3 },
  { id: "ocean",     name: "Ocean Depths",        pieceIds: ["hw_coral_tiara", "tp_pearl_shirt", "ac_ocean_trident", "fs_abyss_suit"],                  bonus: "Tidal Power: +40% style bonus",          bonusStyle: 40, requiredPieces: 3 },
];

// ---- NPC Fashion Critics ----

const FASHION_CRITICS: FashionCritic[] = [
  { id: "critic_01", name: "Lady Elegance",    personality: "Refined and sophisticated, prizes classic style",         favoriteSet: "royal",     strictness: 9,  emoji: "👸" },
  { id: "critic_02", name: "Shadow critique",  personality: "Mysterious judge who values stealth aesthetics",         favoriteSet: "ninja",     strictness: 8,  emoji: "🥷" },
  { id: "critic_03", name: "Archmage Styx",    personality: "Eccentric wizard who loves magical fashion",            favoriteSet: "wizard",    strictness: 7,  emoji: "🧙" },
  { id: "critic_04", name: "Captain Redbeard", personality: "Rough-around-the-edges pirate with taste for grit",      favoriteSet: "pirate",    strictness: 6,  emoji: "🏴‍☠️" },
  { id: "critic_05", name: "Commander Nova",   personality: "Futuristic fashionista from the cosmos",                 favoriteSet: "astronaut", strictness: 7,  emoji: "🧑‍🚀" },
  { id: "critic_06", name: "Drakarion",         personality: "Ancient dragon who appreciates fiery outfits",          favoriteSet: "dragon",    strictness: 9,  emoji: "🐲" },
  { id: "critic_07", name: "Thornweave",        personality: "Druid of the ancient forest, loves earthy tones",      favoriteSet: "forest",    strictness: 6,  emoji: "🌿" },
  { id: "critic_08", name: "Tidalis",           personality: "Ocean spirit who values fluid, flowing fashion",        favoriteSet: "ocean",    strictness: 7,  emoji: "🌊" },
  { id: "critic_09", name: "Trendy Max",        personality: "Pop-culture obsessed influencer, loves unique combos",  favoriteSet: "pirate",   strictness: 5,  emoji: "📸" },
  { id: "critic_10", name: "Baron von Haute",   personality: "Self-proclaimed greatest fashion mind alive",          favoriteSet: "royal",     strictness: 10, emoji: "🎩" },
];

// ---- Seasonal costumes (limited-time) ----

const SEASONAL_COSTUMES: CostumeItem[] = [
  { id: "se_winter_crown",    name: "Frost Crown",         category: "headwear", rarity: "legendary", styleBonus: 27, emoji: "❄️", description: "Icy crown from the winter realm",         price: 480, currency: "tickets", setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null },
  { id: "se_spring_blossom",  name: "Blossom Dress",       category: "tops",    rarity: "epic",      styleBonus: 18, emoji: "🌸", description: "Dress woven from cherry blossoms",         price: 180, currency: "gems",    setId: null, dyeable: true,  enhancementLevel: 0, appliedColor: null },
  { id: "se_summer_ray",      name: "Sun Ray Sandals",     category: "footwear", rarity: "rare",      styleBonus: 11, emoji: "☀️", description: "Sandals that glow with sunlight",          price: 75,  currency: "gems",    setId: null, dyeable: true,  enhancementLevel: 0, appliedColor: null },
  { id: "se_autumn_cloak",    name: "Harvest Cloak",       category: "capes",   rarity: "epic",      styleBonus: 17, emoji: "🍂", description: "Cloak of falling autumn leaves",           price: 170, currency: "gems",    setId: null, dyeable: true,  enhancementLevel: 0, appliedColor: null },
  { id: "se_halloween_wings", name: "Bat Wings",           category: "wings",   rarity: "rare",      styleBonus: 15, emoji: "🦇", description: "Spooky bat wings for Halloween",           price: 100, currency: "gems",    setId: null, dyeable: true,  enhancementLevel: 0, appliedColor: null },
  { id: "se_festive_hat",     name: "Festive Party Hat",   category: "headwear", rarity: "uncommon",  styleBonus: 10, emoji: "🎉", description: "Colorful hat for celebrations",            price: 250, currency: "coins",   setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null },
];

// ---- Weekly Exclusive Costumes ----

const WEEKLY_EXCLUSIVES: CostumeItem[] = [
  { id: "wk_celestial_crown", name: "Celestial Crown",    category: "headwear",    rarity: "legendary", styleBonus: 32, emoji: "💫", description: "Crown that orbits with starlight",     price: 520, currency: "tickets", setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null },
  { id: "wk_void_cloak",      name: "Void Cloak",         category: "capes",       rarity: "legendary", styleBonus: 30, emoji: "🕳️", description: "Cloak from the space between spaces",  price: 500, currency: "tickets", setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null },
  { id: "wk_time_boots",      name: "Chrono Boots",       category: "footwear",    rarity: "epic",      styleBonus: 20, emoji: "⏳", description: "Boots that let you walk through time",  price: 190, currency: "gems",    setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null },
  { id: "wk_prism_gloves",    name: "Prism Gauntlets",    category: "accessories", rarity: "epic",      styleBonus: 19, emoji: "🌈", description: "Gauntlets that refract all colors",       price: 175, currency: "gems",    setId: null, dyeable: false, enhancementLevel: 0, appliedColor: null },
];

// ---- Crafting Recipes ----

type CraftingRecipe = { costumeId: string; materials: Array<{ id: MaterialId; qty: number }>; requiredLevel: number };

const CRAFTING_RECIPES: CraftingRecipe[] = [
  { costumeId: "wg_fairy_wings",  materials: [{ id: "feather", qty: 5 },  { id: "star_thread", qty: 3 },   { id: "moonstone", qty: 1 }],  requiredLevel: 5 },
  { costumeId: "wg_mech_wings",   materials: [{ id: "crystal", qty: 4 },   { id: "leather", qty: 6 },      { id: "silk", qty: 2 }],        requiredLevel: 8 },
  { costumeId: "fs_knight_armor", materials: [{ id: "leather", qty: 8 },   { id: "crystal", qty: 3 },      { id: "enchanted_wood", qty: 2 }], requiredLevel: 3 },
  { costumeId: "fs_frost_suit",   materials: [{ id: "moonstone", qty: 4 }, { id: "crystal", qty: 5 },      { id: "feather", qty: 2 }],    requiredLevel: 12 },
  { costumeId: "fs_cosmic_suit",  materials: [{ id: "star_thread", qty: 6 },{ id: "dragon_scale", qty: 3 }, { id: "moonstone", qty: 3 }],  requiredLevel: 20 },
  { costumeId: "fs_phoenix_suit", materials: [{ id: "dragon_scale", qty: 5 },{ id: "star_thread", qty: 4 }, { id: "feather", qty: 4 }],    requiredLevel: 16 },
  { costumeId: "wg_angel_wings",  materials: [{ id: "star_thread", qty: 8 }, { id: "feather", qty: 6 },     { id: "moonstone", qty: 4 }],  requiredLevel: 18 },
  { costumeId: "wg_shadow_wings", materials: [{ id: "dragon_scale", qty: 3 }, { id: "enchanted_wood", qty: 5 }, { id: "moonstone", qty: 2 }], requiredLevel: 10 },
  { costumeId: "fs_abyss_suit",   materials: [{ id: "moonstone", qty: 5 }, { id: "crystal", qty: 4 },       { id: "enchanted_wood", qty: 3 }], requiredLevel: 14 },
  { costumeId: "fs_nature_suit",  materials: [{ id: "enchanted_wood", qty: 6 }, { id: "feather", qty: 4 },   { id: "silk", qty: 3 }],       requiredLevel: 6 },
];

// ---- Achievement Definitions ----

function buildAchievements(): Achievement[] {
  return [
    { id: "ach_first_buy",       name: "First Purchase",        description: "Buy your first costume",               emoji: "🛍️", condition: (s) => s.ownedCostumeIds.length >= 1,                       reward: { currency: "coins", amount: 100 },   unlocked: false, unlockedAt: null },
    { id: "ach_collector_10",    name: "Novice Collector",      description: "Own 10 costumes",                       emoji: "📦", condition: (s) => s.ownedCostumeIds.length >= 10,                      reward: { currency: "gems", amount: 20 },    unlocked: false, unlockedAt: null },
    { id: "ach_collector_25",    name: "Avid Collector",        description: "Own 25 costumes",                       emoji: "📋", condition: (s) => s.ownedCostumeIds.length >= 25,                      reward: { currency: "gems", amount: 50 },    unlocked: false, unlockedAt: null },
    { id: "ach_collector_50",    name: "Master Collector",      description: "Own 50 costumes",                       emoji: "📚", condition: (s) => s.ownedCostumeIds.length >= 50,                      reward: { currency: "tickets", amount: 5 },   unlocked: false, unlockedAt: null },
    { id: "ach_full_royal",      name: "Royal Wardrobe",        description: "Complete the Royal Court set",          emoji: "👑", condition: (s) => coCountSetPieces(s, "royal") >= COSTUME_SETS.find(cs => cs.id === "royal")!.requiredPieces, reward: { currency: "gems", amount: 100 },  unlocked: false, unlockedAt: null },
    { id: "ach_full_ninja",      name: "Shadow Complete",       description: "Complete the Shadow Clan set",          emoji: "🥷", condition: (s) => coCountSetPieces(s, "ninja") >= COSTUME_SETS.find(cs => cs.id === "ninja")!.requiredPieces, reward: { currency: "gems", amount: 80 },   unlocked: false, unlockedAt: null },
    { id: "ach_full_dragon",     name: "Dragon Rider",          description: "Complete the Dragon Riders set",        emoji: "🐲", condition: (s) => coCountSetPieces(s, "dragon") >= COSTUME_SETS.find(cs => cs.id === "dragon")!.requiredPieces, reward: { currency: "tickets", amount: 3 },   unlocked: false, unlockedAt: null },
    { id: "ach_level_10",        name: "Rising Designer",       description: "Reach Fashion Designer level 10",       emoji: "⬆️", condition: (s) => s.level >= 10,                                    reward: { currency: "gems", amount: 60 },    unlocked: false, unlockedAt: null },
    { id: "ach_level_25",        name: "Master Designer",       description: "Reach Fashion Designer level 25",       emoji: "🏆", condition: (s) => s.level >= 25,                                    reward: { currency: "tickets", amount: 10 },  unlocked: false, unlockedAt: null },
    { id: "ach_style_80",        name: "Style Icon",            description: "Achieve a style score of 80+",           emoji: "💎", condition: (s) => coCalcStyleScore(s) >= 80,                          reward: { currency: "gems", amount: 75 },    unlocked: false, unlockedAt: null },
    { id: "ach_style_100",       name: "Perfectionist",         description: "Achieve a perfect style score of 100",   emoji: "💯", condition: (s) => coCalcStyleScore(s) >= 100,                         reward: { currency: "tickets", amount: 8 },   unlocked: false, unlockedAt: null },
    { id: "ach_craft_5",         name: "Tailor Apprentice",     description: "Craft 5 costumes in the workshop",      emoji: "🧵", condition: (s) => s.workshopQueue.filter(w => w.progress >= w.required).length >= 5, reward: { currency: "coins", amount: 500 }, unlocked: false, unlockedAt: null },
    { id: "ach_dye_10",          name: "Color Artist",          description: "Dye 10 costumes",                       emoji: "🎨", condition: (s) => getAllCostumes(s).filter(c => c.appliedColor !== null).length >= 10, reward: { currency: "gems", amount: 40 }, unlocked: false, unlockedAt: null },
    { id: "ach_contest_win",     name: "Fashion Champion",      description: "Win a fashion contest",                 emoji: "🏅", condition: (s) => s.contestHistory.some(e => e.npcName && true),       reward: { currency: "tickets", amount: 5 },   unlocked: false, unlockedAt: null },
    { id: "ach_preset_master",   name: "Outfit Architect",      description: "Save outfits in all 8 preset slots",    emoji: "🏛️", condition: (s) => s.outfitPresets.length >= 8,                       reward: { currency: "gems", amount: 100 },   unlocked: false, unlockedAt: null },
  ];
}

// ---- Dye Colors ----

const DYE_PALETTE: string[] = [
  "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c",
  "#3498db", "#9b59b6", "#e84393", "#fd79a8", "#00cec9",
  "#6c5ce7", "#a29bfe", "#ffeaa7", "#fab1a0", "#dfe6e9",
  "#2d3436", "#636e72", "#b2bec3", "#74b9ff", "#55efc4",
];

// ---- State Management ----

let state: CostumeShopState | null = null;

function ensureInit(): CostumeShopState {
  if (state) return state;
  state = {
    costumes: buildCostumeCatalog(),
    ownedCostumeIds: [],
    coins: 1000,
    gems: 50,
    tickets: 5,
    activeOutfit: { headwear: null, tops: null, bottoms: null, footwear: null, accessories: null, capes: null, wings: null, full_suits: null },
    outfitPresets: [],
    materials: MATERIAL_DEFS.map(m => ({ ...m, quantity: 0 })),
    level: 1,
    xp: 0,
    xpToNext: 100,
    dailyChallenge: null,
    lastDate: "",
    achievements: buildAchievements(),
    contestHistory: [],
    workshopQueue: [],
    dyeColors: [...DYE_PALETTE],
    favoriteCostumeIds: [],
  };
  return state;
}

// ---- Utility Functions ----

function getAllCostumes(s: CostumeShopState): CostumeItem[] {
  return s.costumes;
}

function findCostume(s: CostumeShopState, id: string): CostumeItem | undefined {
  return s.costumes.find(c => c.id === id);
}

function isOwned(s: CostumeShopState, id: string): boolean {
  return s.ownedCostumeIds.includes(id);
}

function dateSeed(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297 + 233280) * 49297;
  return x - Math.floor(x);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function b64Encode(str: string): string {
  if (typeof Buffer !== "undefined") return Buffer.from(str).toString("base64");
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return str;
  }
}

function b64Decode(str: string): string {
  if (typeof Buffer !== "undefined") return Buffer.from(str, "base64").toString();
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return str;
  }
}

// ---- Core Style Score Calculation ----

function coCountSetPieces(s: CostumeShopState, setId: ThemedSet): number {
  const setDef = COSTUME_SETS.find(cs => cs.id === setId);
  if (!setDef) return 0;
  return setDef.pieceIds.filter(pid => s.ownedCostumeIds.includes(pid) && s.activeOutfit[findCostume(s, pid)?.category ?? "headwear"] === pid).length;
}

function coCalcStyleScore(s: CostumeShopState): number {
  const out = s.activeOutfit;
  let score = 0;
  let wornCount = 0;

  const categories: CostumeCategory[] = ["headwear", "tops", "bottoms", "footwear", "accessories", "capes", "wings", "full_suits"];
  for (const cat of categories) {
    const cid = out[cat];
    if (cid) {
      const costume = findCostume(s, cid);
      if (costume) {
        score += costume.styleBonus + (costume.enhancementLevel * 5);
        wornCount++;
      }
    }
  }

  // Set bonus check
  for (const setDef of COSTUME_SETS) {
    const matching = setDef.pieceIds.filter(pid => {
      const costume = findCostume(s, pid);
      return costume && out[costume.category] === pid;
    }).length;
    if (matching >= setDef.requiredPieces) {
      score += setDef.bonusStyle;
    }
  }

  // Rarity diversity bonus
  const rarities = new Set<string>();
  for (const cat of categories) {
    const cid = out[cat];
    if (cid) {
      const costume = findCostume(s, cid);
      if (costume) rarities.add(costume.rarity);
    }
  }
  if (rarities.size >= 3) score += 10;
  if (rarities.size >= 5) score += 15;

  // Color harmony bonus
  const colors = new Set<string>();
  for (const cat of categories) {
    const cid = out[cat];
    if (cid) {
      const costume = findCostume(s, cid);
      if (costume?.appliedColor) colors.add(costume.appliedColor);
    }
  }
  if (colors.size >= 3) score += 8;
  if (colors.size === 1 && colors.size > 0) score += 12;

  // Slot fill bonus
  const nonFullSuitCats = categories.filter(c => c !== "full_suits");
  const fullSuitActive = out.full_suits !== null;
  if (fullSuitActive) {
    score += 5;
  } else {
    const filled = nonFullSuitCats.filter(c => out[c] !== null).length;
    if (filled >= 5) score += 10;
    if (filled >= 7) score += 15;
  }

  return clamp(score, 0, 150);
}

// ---- XP & Level System ----

function coAddXp(s: CostumeShopState, amount: number): void {
  s.xp += amount;
  while (s.xp >= s.xpToNext && s.level < 25) {
    s.xp -= s.xpToNext;
    s.level++;
    s.xpToNext = 100 + (s.level * 50);
    s.gems += 5 + s.level;
    s.coins += 100 * s.level;
  }
  if (s.level >= 25) {
    s.xp = Math.min(s.xp, s.xpToNext);
  }
}

// ---- Achievement Checking ----

function coCheckAchievements(s: CostumeShopState): Array<{ id: string; name: string; emoji: string; newlyUnlocked: boolean }> {
  const results: Array<{ id: string; name: string; emoji: string; newlyUnlocked: boolean }> = [];
  for (const ach of s.achievements) {
    const wasUnlocked = ach.unlocked;
    if (!ach.unlocked && ach.condition(s)) {
      ach.unlocked = true;
      ach.unlockedAt = Date.now();
      results.push({ id: ach.id, name: ach.name, emoji: ach.emoji, newlyUnlocked: true });
      if (ach.reward.currency === "coins") s.coins += ach.reward.amount;
      else if (ach.reward.currency === "gems") s.gems += ach.reward.amount;
      else if (ach.reward.currency === "tickets") s.tickets += ach.reward.amount;
    }
  }
  return results;
}

// =============================================================================
// PUBLIC EXPORTS — All use "co" prefix
// =============================================================================

// ---- State & Currency Accessors ----

export function coGetState(): CostumeShopState {
  return ensureInit();
}

export function coGetCoins(): number {
  return ensureInit().coins;
}

export function coGetGems(): number {
  return ensureInit().gems;
}

export function coGetTickets(): number {
  return ensureInit().tickets;
}

export function coAddCurrency(currency: Currency, amount: number): void {
  const s = ensureInit();
  if (currency === "coins") s.coins += amount;
  else if (currency === "gems") s.gems += amount;
  else if (currency === "tickets") s.tickets += amount;
  coCheckAchievements(s);
}

export function coSpendCurrency(currency: Currency, amount: number): boolean {
  const s = ensureInit();
  if (currency === "coins" && s.coins >= amount) { s.coins -= amount; return true; }
  if (currency === "gems" && s.gems >= amount) { s.gems -= amount; return true; }
  if (currency === "tickets" && s.tickets >= amount) { s.tickets -= amount; return true; }
  return false;
}

// ---- Level & XP ----

export function coGetLevel(): number {
  return ensureInit().level;
}

export function coGetXp(): number {
  return ensureInit().xp;
}

export function coGetXpToNext(): number {
  return ensureInit().xpToNext;
}

export function coGetXpProgress(): number {
  const s = ensureInit();
  return s.xpToNext > 0 ? Math.floor((s.xp / s.xpToNext) * 100) : 100;
}

export function coGetLevelTitle(): string {
  const s = ensureInit();
  const titles: Record<number, string> = {
    1: "Thread Picker", 2: "Apprentice Tailor", 3: "Junior Designer", 4: "Cloth Cutter",
    5: "Pattern Maker", 6: "Stitch Wizard", 7: "Color Theorist", 8: "Fabric Enchanter",
    9: "Style Student", 10: "Fashion Forward", 11: "Trend Setter", 12: "Runway Model",
    13: "Haute Couture", 14: "Style Maven", 15: "Design Virtuoso", 16: "Atelier Master",
    17: "Fashion Aristocrat", 18: "Grand Couturier", 19: "Style Luminary", 20: "Legend Weaver",
    21: "Celestial Tailor", 22: "Mythic Designer", 23: "Eternal Stylist", 24: "Void Fashioner",
    25: "Supreme Couturier",
  };
  return titles[s.level] ?? "Unknown";
}

// ---- Costume Catalog & Ownership ----

export function coGetAllCostumes(): CostumeItem[] {
  return ensureInit().costumes.slice();
}

export function coGetCostumeById(id: string): CostumeItem | undefined {
  return findCostume(ensureInit(), id);
}

export function coGetCostumesByCategory(category: CostumeCategory): CostumeItem[] {
  return ensureInit().costumes.filter(c => c.category === category);
}

export function coGetCostumesByRarity(rarity: Rarity): CostumeItem[] {
  return ensureInit().costumes.filter(c => c.rarity === rarity);
}

export function coGetOwnedCostumes(): CostumeItem[] {
  const s = ensureInit();
  return s.costumes.filter(c => s.ownedCostumeIds.includes(c.id));
}

export function coIsOwned(id: string): boolean {
  return isOwned(ensureInit(), id);
}

export function coGetOwnershipCount(): number {
  return ensureInit().ownedCostumeIds.length;
}

export function coGetCostumeCategories(): CostumeCategory[] {
  return ["headwear", "tops", "bottoms", "footwear", "accessories", "capes", "wings", "full_suits"];
}

export function coGetRarities(): Rarity[] {
  return ["common", "uncommon", "rare", "epic", "legendary"];
}

export function coGetRarityConfig(rarity: Rarity): { color: string; label: string; priceMultiplier: number; xpReward: number } {
  return RARITY_CONFIG[rarity];
}

// ---- Shop System ----

export function coGetDailyStock(dateStr: string): ShopDailyItem[] {
  const s = ensureInit();
  const seed = dateSeed(dateStr);
  const available = s.costumes.filter(c => !isOwned(s, c.id) && c.rarity !== "legendary");
  const stock: ShopDailyItem[] = [];
  const count = Math.min(6, available.length);
  const indices = new Set<number>();
  for (let i = 0; i < count; i++) {
    let idx: number;
    let attempts = 0;
    do {
      idx = Math.floor(seededRandom(seed, i * 7 + attempts) * available.length);
      attempts++;
    } while (indices.has(idx) && attempts < 50);
    indices.add(idx);
    const costume = available[idx];
    if (!costume) continue;
    const discountPercent = Math.floor(seededRandom(seed, i * 13 + 100) * 5) * 10;
    stock.push({
      costumeId: costume.id,
      discountPercent,
      originalPrice: costume.price,
      salePrice: Math.ceil(costume.price * (1 - discountPercent / 100)),
    });
  }
  return stock;
}

export function coGetWeeklyExclusive(weekNumber: number): CostumeItem | undefined {
  const idx = ((weekNumber - 1) % WEEKLY_EXCLUSIVES.length + WEEKLY_EXCLUSIVES.length) % WEEKLY_EXCLUSIVES.length;
  return WEEKLY_EXCLUSIVES[idx];
}

export function coGetSeasonalCostumes(season: "winter" | "spring" | "summer" | "autumn"): CostumeItem[] {
  const seasonMap: Record<string, string[]> = {
    winter: ["se_winter_crown", "se_festive_hat"],
    spring: ["se_spring_blossom"],
    summer: ["se_summer_ray"],
    autumn: ["se_autumn_cloak"],
  };
  const ids = seasonMap[season] ?? [];
  return SEASONAL_COSTUMES.filter(c => ids.includes(c.id));
}

export function coGetAllSeasonalCostumes(): CostumeItem[] {
  return SEASONAL_COSTUMES.slice();
}

export function coBuyCostume(costumeId: string, dateStr?: string): { success: boolean; message: string } {
  const s = ensureInit();
  if (isOwned(s, costumeId)) return { success: false, message: "Already owned!" };
  const costume = findCostume(s, costumeId);
  if (!costume) return { success: false, message: "Costume not found!" };

  let finalPrice = costume.price;
  if (dateStr) {
    const dailyStock = coGetDailyStock(dateStr);
    const stockItem = dailyStock.find(si => si.costumeId === costumeId);
    if (stockItem) finalPrice = stockItem.salePrice;
  }

  if (!coSpendCurrency(costume.currency, finalPrice)) {
    return { success: false, message: `Not enough ${costume.currency}! Need ${finalPrice}, have ${costume.currency === "coins" ? s.coins : costume.currency === "gems" ? s.gems : s.tickets}.` };
  }

  s.ownedCostumeIds.push(costumeId);
  coAddXp(s, RARITY_CONFIG[costume.rarity].xpReward);
  const newlyUnlocked = coCheckAchievements(s);
  return { success: true, message: `Purchased ${costume.name}! +${RARITY_CONFIG[costume.rarity].xpReward} XP${newlyUnlocked.length > 0 ? ` | Achievement: ${newlyUnlocked[0].name}!` : ""}` };
}

export function coBuyMysteryBox(): { costume: CostumeItem | null; message: string } {
  const s = ensureInit();
  const cost = 100;
  if (s.coins < cost) return { costume: null, message: "Not enough coins! Need 100 coins." };
  s.coins -= cost;

  const rarityWeights: Array<{ rarity: Rarity; weight: number }> = [
    { rarity: "common",    weight: 40 },
    { rarity: "uncommon",  weight: 30 },
    { rarity: "rare",      weight: 18 },
    { rarity: "epic",      weight: 9 },
    { rarity: "legendary", weight: 3 },
  ];

  const unowned = s.costumes.filter(c => !isOwned(s, c.id));
  if (unowned.length === 0) return { costume: null, message: "You own all costumes! No mystery box available." };

  const weighted: CostumeItem[] = [];
  for (const w of rarityWeights) {
    const matching = unowned.filter(c => c.rarity === w.rarity);
    for (let i = 0; i < w.weight; i++) {
      for (const c of matching) weighted.push(c);
    }
  }

  const pick = weighted[Math.floor(Math.random() * weighted.length)];
  if (!pick) return { costume: null, message: "Error selecting costume." };

  s.ownedCostumeIds.push(pick.id);
  coAddXp(s, RARITY_CONFIG[pick.rarity].xpReward * 2);
  coCheckAchievements(s);
  return { costume: pick, message: `Mystery Box: ${pick.emoji} ${pick.name} (${RARITY_CONFIG[pick.rarity].label})!` };
}

// ---- Wardrobe & Outfit Management ----

export function coEquipCostume(costumeId: string): boolean {
  const s = ensureInit();
  if (!isOwned(s, costumeId)) return false;
  const costume = findCostume(s, costumeId);
  if (!costume) return false;

  // Full suit unequips individual slots
  if (costume.category === "full_suits") {
    const categories: CostumeCategory[] = ["headwear", "tops", "bottoms", "footwear", "accessories", "capes", "wings"];
    for (const cat of categories) s.activeOutfit[cat] = null;
  } else {
    s.activeOutfit.full_suits = null;
  }

  s.activeOutfit[costume.category] = costumeId;
  coAddXp(s, 5);
  coCheckAchievements(s);
  return true;
}

export function coUnequipSlot(category: CostumeCategory): void {
  ensureInit().activeOutfit[category] = null;
}

export function coGetActiveOutfit(): OutfitSlot {
  return { ...ensureInit().activeOutfit };
}

export function coGetActiveOutfitCostumes(): CostumeItem[] {
  const s = ensureInit();
  const result: CostumeItem[] = [];
  const categories: CostumeCategory[] = ["headwear", "tops", "bottoms", "footwear", "accessories", "capes", "wings", "full_suits"];
  for (const cat of categories) {
    const cid = s.activeOutfit[cat];
    if (cid) {
      const costume = findCostume(s, cid);
      if (costume) result.push(costume);
    }
  }
  return result;
}

// ---- Outfit Presets ----

export function coSavePreset(name: string): OutfitPreset | null {
  const s = ensureInit();
  if (s.outfitPresets.length >= 8) return null;
  const preset: OutfitPreset = {
    id: `preset_${Date.now()}_${s.outfitPresets.length}`,
    name,
    slots: { ...s.activeOutfit },
    styleScore: coCalcStyleScore(s),
    createdAt: Date.now(),
  };
  s.outfitPresets.push(preset);
  coCheckAchievements(s);
  return preset;
}

export function coLoadPreset(presetId: string): boolean {
  const s = ensureInit();
  const preset = s.outfitPresets.find(p => p.id === presetId);
  if (!preset) return false;
  s.activeOutfit = { ...preset.slots };
  coAddXp(s, 3);
  return true;
}

export function coDeletePreset(presetId: string): boolean {
  const s = ensureInit();
  const idx = s.outfitPresets.findIndex(p => p.id === presetId);
  if (idx === -1) return false;
  s.outfitPresets.splice(idx, 1);
  return true;
}

export function coGetPresets(): OutfitPreset[] {
  return ensureInit().outfitPresets.slice();
}

export function coRenamePreset(presetId: string, newName: string): boolean {
  const s = ensureInit();
  const preset = s.outfitPresets.find(p => p.id === presetId);
  if (!preset) return false;
  preset.name = newName;
  return true;
}

// ---- Style Score ----

export function coGetStyleScore(): number {
  return coCalcStyleScore(ensureInit());
}

export function coGetStyleBreakdown(): { baseScore: number; setBonuses: number; diversityBonus: number; colorHarmony: number; total: number; details: string[] } {
  const s = ensureInit();
  const out = s.activeOutfit;
  let baseScore = 0;
  let setBonuses = 0;
  let diversityBonus = 0;
  let colorHarmony = 0;
  const details: string[] = [];
  const categories: CostumeCategory[] = ["headwear", "tops", "bottoms", "footwear", "accessories", "capes", "wings", "full_suits"];

  for (const cat of categories) {
    const cid = out[cat];
    if (cid) {
      const costume = findCostume(s, cid);
      if (costume) {
        baseScore += costume.styleBonus + (costume.enhancementLevel * 5);
      }
    }
  }

  for (const setDef of COSTUME_SETS) {
    const matching = setDef.pieceIds.filter(pid => {
      const costume = findCostume(s, pid);
      return costume && out[costume.category] === pid;
    }).length;
    if (matching >= setDef.requiredPieces) {
      setBonuses += setDef.bonusStyle;
      details.push(`${setDef.name}: +${setDef.bonusStyle} (set bonus)`);
    }
  }

  const rarities = new Set<string>();
  for (const cat of categories) {
    const cid = out[cat];
    if (cid) {
      const costume = findCostume(s, cid);
      if (costume) rarities.add(costume.rarity);
    }
  }
  if (rarities.size >= 3) { diversityBonus += 10; details.push("3+ rarity types: +10"); }
  if (rarities.size >= 5) { diversityBonus += 15; details.push("5+ rarity types: +15"); }

  const colors = new Set<string>();
  for (const cat of categories) {
    const cid = out[cat];
    if (cid) {
      const costume = findCostume(s, cid);
      if (costume?.appliedColor) colors.add(costume.appliedColor);
    }
  }
  if (colors.size >= 3) { colorHarmony += 8; details.push("3+ dye colors: +8"); }
  if (colors.size === 1 && colors.size > 0) { colorHarmony += 12; details.push("Mono-color outfit: +12"); }

  return { baseScore, setBonuses, diversityBonus, colorHarmony, total: baseScore + setBonuses + diversityBonus + colorHarmony, details };
}

// ---- Set Bonuses ----

export function coGetSetBonuses(): Array<{ setId: ThemedSet; name: string; matchedPieces: number; requiredPieces: number; bonusStyle: number; isActive: boolean; bonus: string; pieceIds: string[] }> {
  const s = ensureInit();
  return COSTUME_SETS.map(setDef => {
    const matched = setDef.pieceIds.filter(pid => {
      const costume = findCostume(s, pid);
      return costume && s.activeOutfit[costume.category] === pid;
    }).length;
    return {
      setId: setDef.id,
      name: setDef.name,
      matchedPieces: matched,
      requiredPieces: setDef.requiredPieces,
      bonusStyle: setDef.bonusStyle,
      isActive: matched >= setDef.requiredPieces,
      bonus: setDef.bonus,
      pieceIds: setDef.pieceIds,
    };
  });
}

export function coGetSetInfo(setId: ThemedSet): CostumeSet | undefined {
  return COSTUME_SETS.find(cs => cs.id === setId);
}

export function coGetAllSets(): CostumeSet[] {
  return COSTUME_SETS.slice();
}

// ---- Fashion Show / Contests ----

export function coGenerateContestOpponents(dateStr: string): FashionContestEntry[] {
  const seed = dateSeed(dateStr + "_contest");
  const opponents: FashionContestEntry[] = [];
  const npcNames = ["Glamour Queen", "Dapper Don", "Neon Knight", "Elegant Elf", "Cyber Samurai", "Crystal Mage", "Steel Knight", "Shadow Dancer"];
  const npcEmojis = ["👸", "🎩", "⚡", "🧝", "🤖", "🔮", "⚔️", "🌑"];
  const count = 3 + Math.floor(seededRandom(seed, 0) * 3);
  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(seededRandom(seed, i * 3 + 1) * npcNames.length);
    const score = 40 + Math.floor(seededRandom(seed, i * 5 + 2) * 80);
    opponents.push({
      outfitId: `npc_outfit_${i}`,
      npcName: npcNames[nameIdx],
      npcEmoji: npcEmojis[nameIdx],
      styleScore: score,
    });
  }
  return opponents;
}

export function coEnterContest(dateStr: string): { placement: number; totalEntries: number; playerScore: number; opponents: FashionContestEntry[]; criticReviews: Array<{ critic: FashionCritic; comment: string; score: number }> } {
  const s = ensureInit();
  const playerScore = coCalcStyleScore(s);
  const opponents = coGenerateContestOpponents(dateStr);
  const allEntries = [...opponents, { outfitId: "player", npcName: "You", npcEmoji: "🌟", styleScore: playerScore }];
  allEntries.sort((a, b) => b.styleScore - a.styleScore);
  const placement = allEntries.findIndex(e => e.outfitId === "player") + 1;
  s.contestHistory.push({ outfitId: "player", npcName: "You", npcEmoji: "🌟", styleScore: playerScore });

  // Critic reviews
  const criticReviews: Array<{ critic: FashionCritic; comment: string; score: number }> = [];
  for (const critic of FASHION_CRITICS) {
    let baseReaction = playerScore > 70 ? "Stunning! " : playerScore > 40 ? "Decent. " : "Needs work. ";
    if (critic.favoriteSet) {
      const setMatch = coCountSetPieces(s, critic.favoriteSet);
      if (setMatch >= 2) baseReaction += `I love the ${COSTUME_SETS.find(cs => cs.id === critic.favoriteSet)?.name ?? "set"} pieces! `;
    }
    const comments = [
      `${baseReaction}The color coordination is ${playerScore > 60 ? "impeccable" : "lacking"}.`,
      `${baseReaction}Your style ${playerScore > 50 ? "commands attention" : "needs more flair"}.`,
      `${baseReaction}${critic.personality.split(",")[0]} — ${playerScore > 80 ? "A true fashion icon!" : "Keep experimenting!"}`,
    ];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    const criticScore = clamp(Math.floor(playerScore * (1 - (critic.strictness - 5) / 30) + (Math.random() * 10 - 5)), 0, 100);
    criticReviews.push({ critic, comment, score: criticScore });
  }

  // Rewards based on placement
  if (placement === 1) { s.tickets += 3; s.gems += 50; coAddXp(s, 200); }
  else if (placement === 2) { s.gems += 30; coAddXp(s, 150); }
  else if (placement <= 3) { s.gems += 20; coAddXp(s, 100); }
  else { coAddXp(s, 50); }

  coCheckAchievements(s);
  return { placement, totalEntries: allEntries.length, playerScore, opponents, criticReviews };
}

export function coGetContestHistory(): FashionContestEntry[] {
  return ensureInit().contestHistory.slice();
}

// ---- NPC Fashion Critics ----

export function coGetCritics(): FashionCritic[] {
  return FASHION_CRITICS.slice();
}

export function coGetCriticReview(criticId: string): { comment: string; score: number } | null {
  const s = ensureInit();
  const critic = FASHION_CRITICS.find(c => c.id === criticId);
  if (!critic) return null;
  const styleScore = coCalcStyleScore(s);
  let baseReaction = styleScore > 70 ? "Magnificent! " : styleScore > 40 ? "Acceptable. " : "Disappointing. ";
  if (critic.favoriteSet) {
    const setMatch = coCountSetPieces(s, critic.favoriteSet);
    if (setMatch >= 2) baseReaction += `The ${COSTUME_SETS.find(cs => cs.id === critic.favoriteSet)?.name} theme shines through! `;
  }
  const comment = `${baseReaction}${critic.personality}`;
  const score = clamp(Math.floor(styleScore * (1 - (critic.strictness - 5) / 25)), 0, 100);
  return { comment, score };
}

// ---- Share Outfit Codes ----

export function coExportOutfitCode(): string {
  const s = ensureInit();
  const data = JSON.stringify({
    o: s.activeOutfit,
    v: 1,
  });
  return b64Encode(data);
}

export function coImportOutfitCode(code: string): OutfitSlot | null {
  try {
    const data = JSON.parse(b64Decode(code));
    if (data.v !== 1 || !data.o) return null;
    const slots: OutfitSlot = data.o;
    const s = ensureInit();
    // Verify all pieces are owned
    for (const cat of Object.keys(slots) as CostumeCategory[]) {
      const cid = slots[cat];
      if (cid && !isOwned(s, cid)) return null;
    }
    s.activeOutfit = slots;
    return slots;
  } catch {
    return null;
  }
}

// ---- Costume Parade ----

export function coGetParadeEntries(dateStr: string): Array<{ name: string; emoji: string; costume: CostumeItem; styleScore: number }> {
  const seed = dateSeed(dateStr + "_parade");
  const allCostumes = ensureInit().costumes;
  const entries: Array<{ name: string; emoji: string; costume: CostumeItem; styleScore: number }> = [];
  const paradeNames = ["Princess Aurora", "Shadow Fox", "Mage Merlin", "Captain Bones", "Astro Nova", "Dragon Knight", "Forest Sage", "Ocean Queen", "Frost Giant", "Phoenix Flame"];
  const paradeEmojis = ["👸", "🦊", "🧙", "💀", "🚀", "🐉", "🌿", "🧜‍♀️", "❄️", "🔥"];
  const count = 8;
  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(seededRandom(seed, i * 2) * paradeNames.length);
    const costumeIdx = Math.floor(seededRandom(seed, i * 2 + 1) * allCostumes.length);
    const costume = allCostumes[costumeIdx];
    entries.push({
      name: paradeNames[nameIdx],
      emoji: paradeEmojis[nameIdx],
      costume,
      styleScore: 30 + Math.floor(seededRandom(seed, i * 3 + 100) * 90),
    });
  }
  entries.sort((a, b) => b.styleScore - a.styleScore);
  return entries;
}

// ---- Tailor Workshop & Crafting ----

export function coGetMaterials(): MaterialEntry[] {
  return ensureInit().materials.slice();
}

export function coGetMaterial(id: MaterialId): MaterialEntry | undefined {
  return ensureInit().materials.find(m => m.id === id);
}

export function coAddMaterial(id: MaterialId, qty: number): void {
  const s = ensureInit();
  const mat = s.materials.find(m => m.id === id);
  if (mat) mat.quantity += qty;
}

export function coGetCraftingRecipes(): CraftingRecipe[] {
  return CRAFTING_RECIPES.slice();
}

export function coGetAvailableRecipes(): Array<{ recipe: CraftingRecipe; canCraft: boolean; missing: Array<{ id: MaterialId; name: string; needed: number; have: number }> }> {
  const s = ensureInit();
  return CRAFTING_RECIPES.map(recipe => {
    const missing: Array<{ id: MaterialId; name: string; needed: number; have: number }> = [];
    for (const req of recipe.materials) {
      const mat = s.materials.find(m => m.id === req.id);
      const have = mat?.quantity ?? 0;
      if (have < req.qty) {
        missing.push({ id: req.id, name: mat?.name ?? req.id, needed: req.qty, have });
      }
    }
    const levelOk = s.level >= recipe.requiredLevel;
    const canCraft = missing.length === 0 && levelOk;
    return { recipe, canCraft, missing };
  });
}

export function coCraftCostume(recipeIndex: number): { success: boolean; message: string } {
  const s = ensureInit();
  if (recipeIndex < 0 || recipeIndex >= CRAFTING_RECIPES.length) return { success: false, message: "Invalid recipe!" };
  const recipe = CRAFTING_RECIPES[recipeIndex];

  if (s.level < recipe.requiredLevel) return { success: false, message: `Need level ${recipe.requiredLevel}!` };
  if (isOwned(s, recipe.costumeId)) return { success: false, message: "Already owned!" };

  for (const req of recipe.materials) {
    const mat = s.materials.find(m => m.id === req.id);
    if (!mat || mat.quantity < req.qty) return { success: false, message: `Not enough ${mat?.name ?? req.id}!` };
  }

  for (const req of recipe.materials) {
    const mat = s.materials.find(m => m.id === req.id);
    if (mat) mat.quantity -= req.qty;
  }

  s.ownedCostumeIds.push(recipe.costumeId);
  coAddXp(s, 75);
  coCheckAchievements(s);
  const costume = findCostume(s, recipe.costumeId);
  return { success: true, message: `Crafted ${costume?.name ?? "costume"}! +75 XP` };
}

export function coGetWorkshopQueue() {
  const s = ensureInit();
  return s.workshopQueue as typeof s.workshopQueue;
}

// ---- Costume Enhancement ----

export function coEnhanceCostume(costumeId: string): { success: boolean; message: string; newLevel?: number } {
  const s = ensureInit();
  if (!isOwned(s, costumeId)) return { success: false, message: "Not owned!" };
  const costume = findCostume(s, costumeId);
  if (!costume) return { success: false, message: "Costume not found!" };

  const maxLevel = 10;
  if (costume.enhancementLevel >= maxLevel) return { success: false, message: "Already at max enhancement!" };

  const crystalCost = (costume.enhancementLevel + 1) * 3;
  const moonstoneCost = costume.enhancementLevel >= 5 ? 1 : 0;
  const matCrystals = s.materials.find(m => m.id === "crystal");
  const matMoonstone = s.materials.find(m => m.id === "moonstone");

  if (!matCrystals || matCrystals.quantity < crystalCost) return { success: false, message: `Need ${crystalCost} Crystals!` };
  if (moonstoneCost > 0 && (!matMoonstone || matMoonstone.quantity < moonstoneCost)) return { success: false, message: `Need ${moonstoneCost} Moonstone(s)!` };

  matCrystals.quantity -= crystalCost;
  if (moonstoneCost > 0 && matMoonstone) matMoonstone.quantity -= moonstoneCost;

  costume.enhancementLevel++;
  coAddXp(s, 30);
  return { success: true, message: `${costume.name} enhanced to +${costume.enhancementLevel}!`, newLevel: costume.enhancementLevel };
}

// ---- Costume Dye System ----

export function coGetDyePalette(): string[] {
  return ensureInit().dyeColors.slice();
}

export function coApplyDye(costumeId: string, color: string): { success: boolean; message: string } {
  const s = ensureInit();
  if (!isOwned(s, costumeId)) return { success: false, message: "Not owned!" };
  const costume = findCostume(s, costumeId);
  if (!costume) return { success: false, message: "Costume not found!" };
  if (!costume.dyeable) return { success: false, message: "This costume cannot be dyed!" };

  const dyeCost = costume.rarity === "common" ? 50 : costume.rarity === "uncommon" ? 100 : costume.rarity === "rare" ? 200 : 300;
  if (s.coins < dyeCost) return { success: false, message: `Need ${dyeCost} coins!` };
  s.coins -= dyeCost;
  costume.appliedColor = color;
  coAddXp(s, 10);
  coCheckAchievements(s);
  return { success: true, message: `${costume.name} dyed to ${color}!` };
}

export function coRemoveDye(costumeId: string): boolean {
  const s = ensureInit();
  const costume = findCostume(s, costumeId);
  if (!costume) return false;
  costume.appliedColor = null;
  return true;
}

export function coAddCustomColor(color: string): boolean {
  const s = ensureInit();
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return false;
  if (!s.dyeColors.includes(color)) {
    s.dyeColors.push(color);
  }
  return true;
}

// ---- Daily Challenge ----

export function coGetDailyChallenge(dateStr: string): CostumeShopState["dailyChallenge"] {
  const s = ensureInit();
  if (s.lastDate === dateStr && s.dailyChallenge) return s.dailyChallenge;
  const seed = dateSeed(dateStr + "_challenge");
  const challengeTypes = [
    { type: "wear_rare", progress: 0, target: 3, reward: { currency: "gems" as Currency, amount: 30 } },
    { type: "buy_any", progress: 0, target: 2, reward: { currency: "coins" as Currency, amount: 500 } },
    { type: "style_score", progress: 0, target: 60, reward: { currency: "gems" as Currency, amount: 50 } },
    { type: "dye_costume", progress: 0, target: 2, reward: { currency: "coins" as Currency, amount: 300 } },
    { type: "equip_set", progress: 0, target: 3, reward: { currency: "tickets" as Currency, amount: 2 } },
    { type: "craft_item", progress: 0, target: 1, reward: { currency: "gems" as Currency, amount: 40 } },
    { type: "enter_contest", progress: 0, target: 1, reward: { currency: "gems" as Currency, amount: 25 } },
  ];
  const idx = Math.floor(seededRandom(seed, 0) * challengeTypes.length);
  const challenge = { ...challengeTypes[idx], completed: false };
  s.dailyChallenge = challenge;
  s.lastDate = dateStr;
  return s.dailyChallenge;
}

export function coUpdateDailyProgress(dateStr: string, progress: number): boolean {
  const s = ensureInit();
  const challenge = coGetDailyChallenge(dateStr);
  if (!challenge || challenge.completed) return false;
  challenge.progress = Math.min(challenge.progress + progress, challenge.target);
  if (challenge.progress >= challenge.target) {
    challenge.completed = true;
    coAddCurrency(challenge.reward.currency, challenge.reward.amount);
    coAddXp(s, 50);
    return true;
  }
  return false;
}

export function coIsDailyChallengeComplete(dateStr: string): boolean {
  return coGetDailyChallenge(dateStr)?.completed ?? false;
}

// ---- Achievements ----

export function coGetAchievements(): Array<{ id: string; name: string; description: string; emoji: string; unlocked: boolean; reward: { currency: Currency; amount: number }; unlockedAt: number | null }> {
  return ensureInit().achievements.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    emoji: a.emoji,
    unlocked: a.unlocked,
    reward: { ...a.reward },
    unlockedAt: a.unlockedAt,
  }));
}

export function coGetUnlockedAchievements() {
  const s = ensureInit();
  return s.achievements.filter(a => a.unlocked) as typeof s.achievements;
}

export function coGetAchievementProgress(): { total: number; unlocked: number; percent: number } {
  const s = ensureInit();
  const total = s.achievements.length;
  const unlocked = s.achievements.filter(a => a.unlocked).length;
  return { total, unlocked, percent: total > 0 ? Math.floor((unlocked / total) * 100) : 0 };
}

// ---- Favorites ----

export function coToggleFavorite(costumeId: string): boolean {
  const s = ensureInit();
  if (!isOwned(s, costumeId)) return false;
  const idx = s.favoriteCostumeIds.indexOf(costumeId);
  if (idx >= 0) { s.favoriteCostumeIds.splice(idx, 1); }
  else { s.favoriteCostumeIds.push(costumeId); }
  return true;
}

export function coIsFavorite(costumeId: string): boolean {
  return ensureInit().favoriteCostumeIds.includes(costumeId);
}

export function coGetFavorites(): CostumeItem[] {
  const s = ensureInit();
  return s.favoriteCostumeIds.map(id => findCostume(s, id)).filter((c): c is CostumeItem => c !== undefined);
}

// ---- Reset / Debug ----

export function coResetState(): void {
  state = null;
}

export function coGrantAllCostumes(): void {
  const s = ensureInit();
  for (const c of s.costumes) {
    if (!s.ownedCostumeIds.includes(c.id)) s.ownedCostumeIds.push(c.id);
  }
  coCheckAchievements(s);
}

export function coGrantMaxCurrency(): void {
  const s = ensureInit();
  s.coins = 999999;
  s.gems = 99999;
  s.tickets = 9999;
}

// =============================================================================
// UI HELPER FUNCTIONS
// =============================================================================

export function coGetStatsGrid(): Array<{ label: string; value: string | number; icon: string; color: string }> {
  const s = ensureInit();
  return [
    { label: "Level", value: s.level, icon: "⭐", color: "#fbbf24" },
    { label: "Title", value: coGetLevelTitle(), icon: "🏆", color: "#f59e0b" },
    { label: "XP Progress", value: `${s.xp}/${s.xpToNext}`, icon: "📊", color: "#3498db" },
    { label: "Coins", value: s.coins.toLocaleString(), icon: "🪙", color: "#f1c40f" },
    { label: "Gems", value: s.gems.toLocaleString(), icon: "💎", color: "#9b59b6" },
    { label: "Tickets", value: s.tickets.toLocaleString(), icon: "🎫", color: "#e74c3c" },
    { label: "Owned Costumes", value: `${s.ownedCostumeIds.length}/${s.costumes.length}`, icon: "👗", color: "#2ecc71" },
    { label: "Style Score", value: coCalcStyleScore(s), icon: "✨", color: "#e84393" },
    { label: "Presets Saved", value: `${s.outfitPresets.length}/8`, icon: "📋", color: "#1abc9c" },
    { label: "Achievements", value: `${s.achievements.filter(a => a.unlocked).length}/${s.achievements.length}`, icon: "🎖️", color: "#6c5ce7" },
    { label: "Crafting Recipes", value: CRAFTING_RECIPES.length, icon: "🔨", color: "#fd79a8" },
    { label: "Collections", value: COSTUME_SETS.length, icon: "📚", color: "#00cec9" },
  ];
}

export function coGetCostumeCard(costumeId: string): { id: string; name: string; emoji: string; rarity: Rarity; rarityColor: string; rarityLabel: string; category: string; styleBonus: number; description: string; owned: boolean; equipped: boolean; enhancementLevel: number; appliedColor: string | null; dyeable: boolean; setName: string | null; price: number; currency: Currency } | null {
  const s = ensureInit();
  const costume = findCostume(s, costumeId);
  if (!costume) return null;
  const rc = RARITY_CONFIG[costume.rarity];
  const categoryLabels: Record<CostumeCategory, string> = {
    headwear: "Headwear", tops: "Tops", bottoms: "Bottoms", footwear: "Footwear",
    accessories: "Accessories", capes: "Capes", wings: "Wings", full_suits: "Full Suits",
  };
  const setInfo = costume.setId ? COSTUME_SETS.find(cs => cs.id === costume.setId) : null;
  return {
    id: costume.id,
    name: costume.name,
    emoji: costume.emoji,
    rarity: costume.rarity,
    rarityColor: rc.color,
    rarityLabel: rc.label,
    category: categoryLabels[costume.category],
    styleBonus: costume.styleBonus + (costume.enhancementLevel * 5),
    description: costume.description,
    owned: isOwned(s, costume.id),
    equipped: s.activeOutfit[costume.category] === costume.id,
    enhancementLevel: costume.enhancementLevel,
    appliedColor: costume.appliedColor,
    dyeable: costume.dyeable,
    setName: setInfo?.name ?? null,
    price: costume.price,
    currency: costume.currency,
  };
}

export function coGetShopStock(dateStr: string): { dailyItems: Array<ShopDailyItem & { costume: CostumeItem }>; weeklyExclusive: CostumeItem | undefined; seasonal: CostumeItem[]; mysteryBoxPrice: number } {
  const dailyItems = coGetDailyStock(dateStr).map(si => ({
    ...si,
    costume: findCostume(ensureInit(), si.costumeId)!,
  })).filter(si => si.costume);
  return {
    dailyItems,
    weeklyExclusive: coGetWeeklyExclusive(Math.ceil(Date.now() / (7 * 24 * 60 * 60 * 1000))),
    seasonal: coGetAllSeasonalCostumes(),
    mysteryBoxPrice: 100,
  };
}

export function coGetOutfitPreview(): { slots: OutfitSlot; slotCostumes: Record<string, CostumeItem | null>; styleScore: number; styleBreakdown: ReturnType<typeof coGetStyleBreakdown>; setBonuses: ReturnType<typeof coGetSetBonuses> } {
  const s = ensureInit();
  const categories: CostumeCategory[] = ["headwear", "tops", "bottoms", "footwear", "accessories", "capes", "wings", "full_suits"];
  const slotCostumes: Record<string, CostumeItem | null> = {};
  for (const cat of categories) {
    const cid = s.activeOutfit[cat];
    slotCostumes[cat] = cid ? (findCostume(s, cid) ?? null) : null;
  }
  return {
    slots: { ...s.activeOutfit },
    slotCostumes,
    styleScore: coCalcStyleScore(s),
    styleBreakdown: coGetStyleBreakdown(),
    setBonuses: coGetSetBonuses(),
  };
}

export function coGetSetBonus(setId: ThemedSet): { set: CostumeSet; matchedPieces: number; isActive: boolean; pieceStatus: Array<{ costumeId: string; costume: CostumeItem; owned: boolean; equipped: boolean }> } | null {
  const s = ensureInit();
  const setDef = COSTUME_SETS.find(cs => cs.id === setId);
  if (!setDef) return null;
  const matchedPieces = setDef.pieceIds.filter(pid => {
    const costume = findCostume(s, pid);
    return costume && s.activeOutfit[costume.category] === pid;
  }).length;
  return {
    set: setDef,
    matchedPieces,
    isActive: matchedPieces >= setDef.requiredPieces,
    pieceStatus: setDef.pieceIds.map(pid => {
      const costume = findCostume(s, pid);
      return {
        costumeId: pid,
        costume: costume!,
        owned: isOwned(s, pid),
        equipped: costume ? s.activeOutfit[costume.category] === pid : false,
      };
    }),
  };
}

export function coGetDailyCard(dateStr: string): { date: string; styleTip: string; challenge: CostumeShopState["dailyChallenge"]; shopItemCount: number; featuredSet: CostumeSet | null; quote: string } {
  const seed = dateSeed(dateStr + "_tip");
  const styleTips = [
    "Try matching accessories with your cape for extra flair!",
    "Monochromatic outfits gain a +12 color harmony bonus!",
    "Mixing 3+ rarity tiers gives you a diversity bonus!",
    "Complete a set of 4+ pieces for massive style bonuses!",
    "Legendary pieces are powerful but don't forget uncommon gems!",
    "Dyeable costumes let you create unique color themes!",
    "Enhance your favorite costumes with crystals for +5 style each!",
    "Save outfit presets so you can swap styles instantly!",
  ];
  const quotes = [
    "Fashion is the armor to survive everyday life. — Bill Cunningham",
    "Style is a way to say who you are without having to speak. — Rachel Zoe",
    "Dress shabbily and they remember the dress; dress impeccably and they remember the person. — Chanel",
    "Fashion fades, only style remains the same. — YSL",
    "Make it simple, but significant. — Don Draper",
    "Elegance is not standing out, but being remembered. — Giorgio Armani",
  ];
  const tipIdx = Math.floor(seededRandom(seed, 0) * styleTips.length);
  const quoteIdx = Math.floor(seededRandom(seed, 1) * quotes.length);
  const setIdx = Math.floor(seededRandom(seed, 2) * COSTUME_SETS.length);
  return {
    date: dateStr,
    styleTip: styleTips[tipIdx],
    challenge: coGetDailyChallenge(dateStr),
    shopItemCount: coGetDailyStock(dateStr).length,
    featuredSet: COSTUME_SETS[setIdx] ?? null,
    quote: quotes[quoteIdx],
  };
}

// coGetAchievements() is exported above in the Achievements section

export function coGetShopOverview(dateStr: string): { title: string; subtitle: string; coins: number; gems: number; tickets: number; dailyCount: number; weeklyName: string | null; seasonalCount: number; mysteryBoxAvailable: boolean; level: number; styleScore: number; ownedCount: number; totalCount: number } {
  const s = ensureInit();
  const dailyStock = coGetDailyStock(dateStr);
  const weeklyExclusive = coGetWeeklyExclusive(Math.ceil(Date.now() / (7 * 24 * 60 * 60 * 1000)));
  const unowned = s.costumes.filter(c => !isOwned(s, c.id));
  return {
    title: "Costume Boutique",
    subtitle: "Find your perfect look",
    coins: s.coins,
    gems: s.gems,
    tickets: s.tickets,
    dailyCount: dailyStock.length,
    weeklyName: weeklyExclusive?.name ?? null,
    seasonalCount: coGetAllSeasonalCostumes().length,
    mysteryBoxAvailable: s.coins >= 100 && unowned.length > 0,
    level: s.level,
    styleScore: coCalcStyleScore(s),
    ownedCount: s.ownedCostumeIds.length,
    totalCount: s.costumes.length,
  };
}

// ---- Additional Helper Exports ----

export function coGetCategoryEmoji(category: CostumeCategory): string {
  const map: Record<CostumeCategory, string> = {
    headwear: "🎩", tops: "👕", bottoms: "👖", footwear: "👢",
    accessories: "💍", capes: "🧣", wings: "🪽", full_suits: "🛡️",
  };
  return map[category];
}

export function coGetCategoryLabel(category: CostumeCategory): string {
  const map: Record<CostumeCategory, string> = {
    headwear: "Headwear", tops: "Tops", bottoms: "Bottoms", footwear: "Footwear",
    accessories: "Accessories", capes: "Capes", wings: "Wings", full_suits: "Full Suits",
  };
  return map[category];
}

export function coGetCurrencyEmoji(currency: Currency): string {
  const map: Record<Currency, string> = { coins: "🪙", gems: "💎", tickets: "🎫" };
  return map[currency];
}

export function coGetCurrencyLabel(currency: Currency): string {
  const map: Record<Currency, string> = { coins: "Coins", gems: "Gems", tickets: "Tickets" };
  return map[currency];
}

export function coGetCostumeCountByRarity(): Record<Rarity, { total: number; owned: number }> {
  const s = ensureInit();
  const result: Record<Rarity, { total: number; owned: number }> = { common: { total: 0, owned: 0 }, uncommon: { total: 0, owned: 0 }, rare: { total: 0, owned: 0 }, epic: { total: 0, owned: 0 }, legendary: { total: 0, owned: 0 } };
  for (const c of s.costumes) {
    result[c.rarity].total++;
    if (isOwned(s, c.id)) result[c.rarity].owned++;
  }
  return result;
}

export function coGetTotalStylePotential(): number {
  const s = ensureInit();
  let maxStyle = 0;
  for (const c of s.costumes) {
    maxStyle = Math.max(maxStyle, c.styleBonus + (c.enhancementLevel * 5));
  }
  return maxStyle * 7 + 55; // 7 slots + best set bonus
}

export function coGetCostumeGrid(category: CostumeCategory | null, rarity: Rarity | null, ownedOnly: boolean): CostumeItem[] {
  const s = ensureInit();
  return s.costumes.filter(c => {
    if (category && c.category !== category) return false;
    if (rarity && c.rarity !== rarity) return false;
    if (ownedOnly && !isOwned(s, c.id)) return false;
    return true;
  });
}

export function coQuickOutfit(setId: ThemedSet): boolean {
  const s = ensureInit();
  const setDef = COSTUME_SETS.find(cs => cs.id === setId);
  if (!setDef) return false;
  // Unequip all first
  const categories: CostumeCategory[] = ["headwear", "tops", "bottoms", "footwear", "accessories", "capes", "wings", "full_suits"];
  for (const cat of categories) s.activeOutfit[cat] = null;
  let equipped = 0;
  for (const pid of setDef.pieceIds) {
    if (isOwned(s, pid)) {
      const costume = findCostume(s, pid);
      if (costume) {
        s.activeOutfit[costume.category] = pid;
        equipped++;
      }
    }
  }
  coAddXp(s, equipped * 5);
  return equipped > 0;
}

export function coGetSearchResults(query: string): CostumeItem[] {
  const s = ensureInit();
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return s.costumes.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q) ||
    c.rarity.toLowerCase().includes(q) ||
    (c.setId && c.setId.toLowerCase().includes(q))
  );
}

export function coGetSortedCostumes(sortBy: "name" | "rarity" | "style" | "price" | "category", ascending: boolean): CostumeItem[] {
  const s = ensureInit();
  const sorted = s.costumes.slice();
  const rarityOrder: Record<Rarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "name": cmp = a.name.localeCompare(b.name); break;
      case "rarity": cmp = rarityOrder[a.rarity] - rarityOrder[b.rarity]; break;
      case "style": cmp = a.styleBonus - b.styleBonus; break;
      case "price": cmp = a.price - b.price; break;
      case "category": cmp = a.category.localeCompare(b.category); break;
    }
    return ascending ? cmp : -cmp;
  });
  return sorted;
}

export function coGetWardrobeSummary(): { totalOwned: number; totalAvailable: number; completionPercent: number; setsCompleted: number; totalSets: number; averageStyle: number; highestStyleCostume: CostumeItem | null } {
  const s = ensureInit();
  const owned = coGetOwnedCostumes();
  const avgStyle = owned.length > 0 ? owned.reduce((sum, c) => sum + c.styleBonus, 0) / owned.length : 0;
  const highestStyle = owned.reduce((best, c) => c.styleBonus > (best?.styleBonus ?? 0) ? c : best, null as CostumeItem | null);
  let setsCompleted = 0;
  for (const setDef of COSTUME_SETS) {
    const ownedCount = setDef.pieceIds.filter(pid => isOwned(s, pid)).length;
    if (ownedCount >= setDef.requiredPieces) setsCompleted++;
  }
  return {
    totalOwned: owned.length,
    totalAvailable: s.costumes.length,
    completionPercent: s.costumes.length > 0 ? Math.floor((owned.length / s.costumes.length) * 100) : 0,
    setsCompleted,
    totalSets: COSTUME_SETS.length,
    averageStyle: Math.round(avgStyle * 10) / 10,
    highestStyleCostume: highestStyle,
  };
}
