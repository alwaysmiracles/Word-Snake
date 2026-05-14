// ============================================================================
// Crystal Cave Wire — SSR-safe module for the Crystal Cave mining game
// All exports use the `cc` prefix. No React hooks. No browser APIs at top level.
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type CrystalRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type CrystalProperty = 'Clarity' | 'Color Depth' | 'Cut Quality' | 'Carat Weight' | 'Luminescence';

export type ToolType = 'pickaxe' | 'chisel' | 'drill' | 'explosive' | 'sonic_hammer' | 'crystal_detector';

export type CaveZone =
  | 'amethyst_cavern'
  | 'emerald_grotto'
  | 'sapphire_depths'
  | 'ruby_vein'
  | 'diamond_core'
  | 'opal_mirage'
  | 'topaz_tunnel'
  | 'quartz_palace';

export type JewelryCategory =
  | 'Necklace'
  | 'Ring'
  | 'Bracelet'
  | 'Earrings'
  | 'Crown'
  | 'Amulet'
  | 'Brooch'
  | 'Tiara';

export type EnchantmentElement = 'Fire' | 'Ice' | 'Lightning' | 'Shadow' | 'Holy' | 'Nature';

export type HealingCategory = 'Physical' | 'Mental' | 'Spiritual' | 'Emotional';

export type ResonanceTier = 'None' | 'Harmonic' | 'Resonant' | 'Prismatic' | 'Transcendent';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface CaveCell {
  row: number;
  col: number;
  revealed: boolean;
  mined: boolean;
  crystalId: string | null;
  creatureId: string | null;
  riverId: string | null;
  hardness: number;       // 0–100
  mineralDensity: number; // 0–100
}

export interface CrystalDef {
  id: string;
  name: string;
  formula: string;
  color: string;
  rarity: CrystalRarity;
  caveId: CaveZone;
  baseValue: number;
  properties: Record<CrystalProperty, number>;
  healingPower: number;
  healingCategory: HealingCategory;
  description: string;
  lore: string;
}

export interface InventoryCrystal extends CrystalDef {
  instanceId: string;
  quantity: number;
  acquiredAt: number;
  cutApplied: string | null;
  enchantmentApplied: string | null;
  resonanceBoost: number;
}

export interface CaveDef {
  id: CaveZone;
  name: string;
  description: string;
  depth: number;
  difficulty: number;
  theme: string;
  ambientColor: string;
  unlockCost: number;
  unlocked: boolean;
  crystalPool: string[];
}

export interface ToolDef {
  id: ToolType;
  name: string;
  description: string;
  power: number;
  precision: number;
  speed: number;
  durability: number;
  maxDurability: number;
  cost: number;
  upgradeCost: number;
  level: number;
  maxLevel: number;
}

export interface JewelryTypeDef {
  id: string;
  name: string;
  category: JewelryCategory;
  description: string;
  slots: number;
  basePower: number;
  requiredLevel: number;
  icon: string;
}

export interface GemCutDef {
  id: string;
  name: string;
  description: string;
  bonusProperty: CrystalProperty;
  bonusAmount: number;
  cost: number;
  requiredLevel: number;
  rarity: CrystalRarity;
}

export interface EnchantmentDef {
  id: EnchantmentElement;
  name: string;
  description: string;
  element: EnchantmentElement;
  powerBonus: number;
  specialEffect: string;
  cost: number;
}

export interface CreatureDef {
  id: string;
  name: string;
  description: string;
  caveId: CaveZone;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  ability: string;
  weakness: CrystalRarity;
  xpReward: number;
  coinReward: number;
  defeated: boolean;
}

export interface MiningResult {
  success: boolean;
  crystal: InventoryCrystal | null;
  creature: CreatureDef | null;
  xpGained: number;
  coinsGained: number;
  toolDamage: number;
  message: string;
}

export interface CutResult {
  success: boolean;
  crystal: InventoryCrystal | null;
  message: string;
}

export interface CraftResult {
  success: boolean;
  jewelry: CraftedJewelry | null;
  message: string;
  xpGained: number;
}

export interface EnchantResult {
  success: boolean;
  jewelry: CraftedJewelry | null;
  message: string;
}

export interface ResonanceResult {
  tier: ResonanceTier;
  bonusPower: number;
  description: string;
  matchingProperties: CrystalProperty[];
}

export interface RiverResult {
  success: boolean;
  crystalsFound: InventoryCrystal[];
  xpGained: number;
  message: string;
}

export interface EncounterResult {
  success: boolean;
  defeated: boolean;
  xpGained: number;
  coinsGained: number;
  crystalDrop: InventoryCrystal | null;
  message: string;
}

export interface HealingResult {
  success: boolean;
  healingAmount: number;
  category: HealingCategory;
  message: string;
}

export interface CollectionResult {
  success: boolean;
  crystal: InventoryCrystal | null;
  xpGained: number;
  coinsGained: number;
  message: string;
}

export interface CraftedJewelry {
  id: string;
  typeId: string;
  name: string;
  category: JewelryCategory;
  crystals: string[];
  enchantment: string | null;
  power: number;
  createdAt: number;
}

export interface DailyCrystal {
  id: string;
  crystalId: string;
  bonusMultiplier: number;
  bonusType: 'xp' | 'coins' | 'healing' | 'luck';
  dateSeed: number;
  collected: boolean;
}

export interface HealingState {
  physicalWellness: number;
  mentalWellness: number;
  spiritualWellness: number;
  emotionalWellness: number;
  totalHealingSessions: number;
  favoriteCrystal: string | null;
}

export interface UndergroundRiver {
  id: string;
  name: string;
  caveId: CaveZone;
  length: number;
  discovered: boolean;
  crystalDeposits: string[];
  difficulty: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedDate: number | null;
  icon: string;
  reward: { coins: number; xp: number; badge: string };
}

export interface CaveStats {
  totalCrystalsMined: number;
  totalCellsRevealed: number;
  totalJewelryCrafted: number;
  totalCreaturesDefeated: number;
  totalRiversExplored: number;
  totalHealingSessions: number;
  totalCutsApplied: number;
  totalEnchantmentsApplied: number;
  highestCrystalRarity: string;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  favoriteCave: string;
  totalResonanceChecks: number;
  legendaryCrystalsFound: number;
  mythicCrystalsFound: number;
  longestExplorationStreak: number;
}

export interface CrystalCaveState {
  initialized: boolean;
  version: number;
  // Player
  level: number;
  xp: number;
  totalXP: number;
  coins: number;
  // Caves
  activeCave: CaveZone;
  caveGrid: Record<CaveZone, CaveCell[][]>;
  // Inventory
  crystals: InventoryCrystal[];
  // Tools
  miningTools: ToolDef[];
  equippedTool: ToolType;
  // Jewelry
  craftedJewelry: CraftedJewelry[];
  // Gem Cuts
  unlockedCuts: string[];
  // Enchantments
  appliedEnchantments: Record<string, EnchantmentElement>;
  // Creatures
  encounteredCreatures: string[];
  defeatedCreatures: string[];
  // Rivers
  undergroundRivers: UndergroundRiver[];
  // Healing
  crystalHealing: HealingState;
  // Daily
  dailyCrystal: DailyCrystal | null;
  lastDailySeed: number;
  // Streak
  streak: number;
  bestStreak: number;
  lastActiveSeed: number;
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: string[];
  // Stats
  stats: CaveStats;
  // Run history
  runHistory: { caveId: string; crystalsFound: number; timestamp: number }[];
}

// ---------------------------------------------------------------------------
// Static Data — 8 Cave Zones
// ---------------------------------------------------------------------------

export const CC_CAVES: CaveDef[] = [
  {
    id: 'amethyst_cavern',
    name: 'Amethyst Cavern',
    description: 'A vast underground chamber where purple amethyst crystals grow in towering geodes, their facets casting violet light across the cavern walls.',
    depth: 120,
    difficulty: 1,
    theme: 'purple-glow',
    ambientColor: '#9b59b6',
    unlockCost: 0,
    unlocked: true,
    crystalPool: ['amy_violet', 'amy_deep', 'amy_citrine', 'amy_prasiolite', 'amy_caer', 'amy_brand', 'amy_zeolite'],
  },
  {
    id: 'emerald_grotto',
    name: 'Emerald Grotto',
    description: 'A hidden grotto behind a waterfall where emeralds gleam among mossy rocks, their green luminescence attracting fireflies into the darkness.',
    depth: 200,
    difficulty: 2,
    theme: 'green-glow',
    ambientColor: '#27ae60',
    unlockCost: 500,
    unlocked: false,
    crystalPool: ['eme_colombian', 'eme_zambian', 'eme_sandawana', 'eme_chrome', 'eme_trapiche', 'eme_star', 'eme_cat'],
  },
  {
    id: 'sapphire_depths',
    name: 'Sapphire Depths',
    description: 'Deep blue sapphires embedded in ancient oceanic crust, the cavern floor still bearing fossilized coral from a primordial sea.',
    depth: 350,
    difficulty: 3,
    theme: 'blue-depths',
    ambientColor: '#2980b9',
    unlockCost: 1500,
    unlocked: false,
    crystalPool: ['sap_kashmir', 'sap_ceylon', 'sap_pad', 'sap_star', 'sap_color', 'sap_bi', 'sap_chang'],
  },
  {
    id: 'ruby_vein',
    name: 'Ruby Vein',
    description: 'A network of ruby-bearing veins cutting through marble, the intense heat of the deep earth giving the stones their crimson fire.',
    depth: 500,
    difficulty: 4,
    theme: 'red-fire',
    ambientColor: '#e74c3c',
    unlockCost: 4000,
    unlocked: false,
    crystalPool: ['rub_burmese', 'rub_mozambique', 'rub_star', 'rub_pigeon', 'rub_thai', 'rub_vietnam', 'rub_verneuil'],
  },
  {
    id: 'diamond_core',
    name: 'Diamond Core',
    description: 'The deepest accessible chamber where volcanic pipes have brought diamonds from the mantle, their brilliance undimmed by millennia of darkness.',
    depth: 800,
    difficulty: 5,
    theme: 'white-brilliance',
    ambientColor: '#ecf0f1',
    unlockCost: 10000,
    unlocked: false,
    crystalPool: ['dia_blue', 'dia_pink', 'dia_canary', 'dia_green', 'dia_white', 'dia_black', 'dia_hope'],
  },
  {
    id: 'opal_mirage',
    name: 'Opal Mirage',
    description: 'A shifting labyrinth of opal-bearing sandstone where light plays tricks, and the walls seem to ripple with every color imaginable.',
    depth: 280,
    difficulty: 3,
    theme: 'iridescent',
    ambientColor: '#f39c12',
    unlockCost: 2000,
    unlocked: false,
    crystalPool: ['opa_australian', 'opa_ethiopian', 'opa_fire', 'opa_black', 'opa_boulder', 'opa_hydro', 'opa_jelly'],
  },
  {
    id: 'topaz_tunnel',
    name: 'Topaz Tunnel',
    description: 'A winding tunnel system where imperial topaz crystals line the walls like golden streetlamps, guiding miners deeper with warm amber light.',
    depth: 320,
    difficulty: 3,
    theme: 'golden-warm',
    ambientColor: '#f1c40f',
    unlockCost: 2500,
    unlocked: false,
    crystalPool: ['top_imperial', 'top_blue', 'top_mystic', 'top_precious', 'top_champagne', 'top_pink', 'top_rutilated'],
  },
  {
    id: 'quartz_palace',
    name: 'Quartz Palace',
    description: 'A cathedral-scale cavern of massive quartz crystals, some over 30 feet tall, forming natural pillars that hum with piezoelectric energy.',
    depth: 400,
    difficulty: 4,
    theme: 'crystal-cathedral',
    ambientColor: '#e8e8e8',
    unlockCost: 6000,
    unlocked: false,
    crystalPool: ['qua_rose', 'qua_smoky', 'qua_citrine', 'qua_amethyst', 'qua_rutilated', 'qua_tourmalinated', 'qua_herkimer'],
  },
];

// ---------------------------------------------------------------------------
// Static Data — 50 Crystal Types
// ---------------------------------------------------------------------------

export const CC_CRYSTALS: CrystalDef[] = [
  // ---- Amethyst Cavern (7) ----
  {
    id: 'amy_violet', name: 'Violet Dream Amethyst', formula: 'SiO₂', color: '#7b2d8e',
    rarity: 'Common', caveId: 'amethyst_cavern', baseValue: 50,
    properties: { Clarity: 65, 'Color Depth': 75, 'Cut Quality': 50, 'Carat Weight': 40, Luminescence: 80 },
    healingPower: 15, healingCategory: 'Spiritual',
    description: 'A translucent purple amethyst with deep violet bands that seem to shift like aurora.',
    lore: 'Ancient Greeks believed amethyst could prevent drunkenness — its name means "not intoxicated."',
  },
  {
    id: 'amy_deep', name: 'Deep Space Amethyst', formula: 'SiO₂ (Fe³⁺)', color: '#4a0e5c',
    rarity: 'Rare', caveId: 'amethyst_cavern', baseValue: 200,
    properties: { Clarity: 85, 'Color Depth': 95, 'Cut Quality': 60, 'Carat Weight': 55, Luminescence: 90 },
    healingPower: 30, healingCategory: 'Mental',
    description: 'An exceptionally dark amethyst whose color rivals the void between stars.',
    lore: 'Monks used this crystal in meditation chambers to induce visions of the cosmos.',
  },
  {
    id: 'amy_citrine', name: 'Ametrine', formula: 'SiO₂', color: '#d4a017',
    rarity: 'Rare', caveId: 'amethyst_cavern', baseValue: 180,
    properties: { Clarity: 80, 'Color Depth': 85, 'Cut Quality': 65, 'Carat Weight': 50, Luminescence: 75 },
    healingPower: 25, healingCategory: 'Emotional',
    description: 'A bi-color quartz exhibiting both amethyst purple and citrine gold in a single crystal.',
    lore: 'Bolivian legend says Ametrine was born when a sacred gold mine was blessed by the sun god.',
  },
  {
    id: 'amy_prasiolite', name: 'Prasiolite Amethyst', formula: 'SiO₂ (Fe²⁺)', color: '#5b8c5a',
    rarity: 'Epic', caveId: 'amethyst_cavern', baseValue: 500,
    properties: { Clarity: 90, 'Color Depth': 80, 'Cut Quality': 75, 'Carat Weight': 60, Luminescence: 70 },
    healingPower: 45, healingCategory: 'Physical',
    description: 'Green amethyst (prasiolite) formed by heat treatment of naturally occurring iron-bearing quartz.',
    lore: 'Elves in old folklore carried prasiolite to communicate with forest spirits.',
  },
  {
    id: 'amy_caer', name: 'Caerleon Geode Amethyst', formula: 'SiO₂ + CaCO₃', color: '#6a1b9a',
    rarity: 'Epic', caveId: 'amethyst_cavern', baseValue: 600,
    properties: { Clarity: 88, 'Color Depth': 92, 'Cut Quality': 70, 'Carat Weight': 80, Luminescence: 95 },
    healingPower: 55, healingCategory: 'Spiritual',
    description: 'A massive geode fragment with cathedral-like amethyst formations and calcite accents.',
    lore: 'The legendary Caerleon geode was said to contain the dreams of sleeping gods.',
  },
  {
    id: 'amy_brand', name: 'Brandberg Amethyst', formula: 'SiO₂ (Fe, Al)', color: '#8e44ad',
    rarity: 'Legendary', caveId: 'amethyst_cavern', baseValue: 2000,
    properties: { Clarity: 95, 'Color Depth': 98, 'Cut Quality': 90, 'Carat Weight': 70, Luminescence: 99 },
    healingPower: 80, healingCategory: 'Spiritual',
    description: 'From the Brandberg Massif in Namibia, featuring phantom inclusions and enhydro water bubbles.',
    lore: 'Each Brandberg amethyst is said to contain a captured lightning storm from creation.',
  },
  {
    id: 'amy_zeolite', name: 'Amethyst Zeolite Cluster', formula: 'SiO₂ · NaAlSi₂O₆', color: '#9b59b6',
    rarity: 'Mythic', caveId: 'amethyst_cavern', baseValue: 8000,
    properties: { Clarity: 99, 'Color Depth': 100, 'Cut Quality': 95, 'Carat Weight': 85, Luminescence: 100 },
    healingPower: 100, healingCategory: 'Spiritual',
    description: 'An impossible fusion of amethyst and zeolite crystals forming a resonant cluster of immense power.',
    lore: 'The only known specimen was found inside a meteorite crater, suggesting extraterrestrial origin.',
  },

  // ---- Emerald Grotto (7) ----
  {
    id: 'eme_colombian', name: 'Colombian Emerald', formula: 'Be₃Al₂(SiO₃)₆', color: '#1a8a3f',
    rarity: 'Common', caveId: 'emerald_grotto', baseValue: 80,
    properties: { Clarity: 60, 'Color Depth': 80, 'Cut Quality': 55, 'Carat Weight': 45, Luminescence: 65 },
    healingPower: 20, healingCategory: 'Physical',
    description: 'A classic deep green emerald from the legendary Muzo mines of Colombia.',
    lore: 'Cleopatra famously gifted emeralds to foreign dignitaries as symbols of eternal friendship.',
  },
  {
    id: 'eme_zambian', name: 'Zambian Emerald', formula: 'Be₃Al₂(SiO₃)₆:Cr', color: '#0d6b2e',
    rarity: 'Common', caveId: 'emerald_grotto', baseValue: 70,
    properties: { Clarity: 70, 'Color Depth': 75, 'Cut Quality': 60, 'Carat Weight': 55, Luminescence: 60 },
    healingPower: 18, healingCategory: 'Physical',
    description: 'A slightly bluish-green emerald from the Kagem mine in Zambia with excellent clarity.',
    lore: 'Zambian miners believe these emeralds hold the spirit of the great Zambezi river.',
  },
  {
    id: 'eme_sandawana', name: 'Sandawana Emerald', formula: 'Be₃Al₂(SiO₃)₆:V,Cr', color: '#228b22',
    rarity: 'Rare', caveId: 'emerald_grotto', baseValue: 250,
    properties: { Clarity: 75, 'Color Depth': 92, 'Cut Quality': 70, 'Carat Weight': 35, Luminescence: 80 },
    healingPower: 35, healingCategory: 'Emotional',
    description: 'Tiny but intensely colored emeralds from Zimbabwe, so vivid they glow under any light.',
    lore: 'Despite their small size, a single Sandawana emerald is said to light a miner\'s path for a year.',
  },
  {
    id: 'eme_chrome', name: 'Chrome Emerald', formula: 'Be₃Al₂(SiO₃)₆:Cr³⁺', color: '#006400',
    rarity: 'Epic', caveId: 'emerald_grotto', baseValue: 650,
    properties: { Clarity: 85, 'Color Depth': 98, 'Cut Quality': 80, 'Carat Weight': 50, Luminescence: 85 },
    healingPower: 50, healingCategory: 'Physical',
    description: 'A chromium-rich emerald with the deepest green color possible in nature, rivaling the density of forest canopy.',
    lore: 'Alchemists claimed chrome emeralds were the philosopher\'s stone in disguise.',
  },
  {
    id: 'eme_trapiche', name: 'Trapiche Emerald', formula: 'Be₃Al₂(SiO₃)₆ + Albite', color: '#2e8b57',
    rarity: 'Legendary', caveId: 'emerald_grotto', baseValue: 3000,
    properties: { Clarity: 80, 'Color Depth': 95, 'Cut Quality': 85, 'Carat Weight': 65, Luminescence: 90 },
    healingPower: 75, healingCategory: 'Spiritual',
    description: 'A rare emerald exhibiting a six-rayed star pattern from albite inclusions, resembling a cogwheel.',
    lore: 'Indigenous peoples called trapiche emeralds "the eye of the green god."',
  },
  {
    id: 'eme_star', name: 'Star Emerald', formula: 'Be₃Al₂(SiO₃)₆:Cr,Ti', color: '#3cb371',
    rarity: 'Legendary', caveId: 'emerald_grotto', baseValue: 3500,
    properties: { Clarity: 78, 'Color Depth': 90, 'Cut Quality': 92, 'Carat Weight': 60, Luminescence: 95 },
    healingPower: 70, healingCategory: 'Mental',
    description: 'A cabochon-cut emerald displaying a six-rayed asterism from rutile needle inclusions.',
    lore: 'Navigators used star emeralds to find their way through enchanted forests.',
  },
  {
    id: 'eme_cat', name: 'Cat\'s Eye Emerald', formula: 'Be₃Al₂(SiO₃)₆:Cr,Fe', color: '#50c878',
    rarity: 'Mythic', caveId: 'emerald_grotto', baseValue: 9000,
    properties: { Clarity: 92, 'Color Depth': 97, 'Cut Quality': 98, 'Carat Weight': 72, Luminescence: 100 },
    healingPower: 100, healingCategory: 'Mental',
    description: 'The rarest emerald phenomenon — a sharp chatoyant eye of light that follows the viewer like a living thing.',
    lore: 'Only three cat\'s eye emeralds of gem quality are known to exist in the modern world.',
  },

  // ---- Sapphire Depths (7) ----
  {
    id: 'sap_kashmir', name: 'Kashmir Sapphire', formula: 'Al₂O₃:Cr,Ti', color: '#1a237e',
    rarity: 'Epic', caveId: 'sapphire_depths', baseValue: 800,
    properties: { Clarity: 88, 'Color Depth': 100, 'Cut Quality': 80, 'Carat Weight': 55, Luminescence: 85 },
    healingPower: 55, healingCategory: 'Mental',
    description: 'The legendary cornflower blue sapphire from the depleted mines of Kashmir, India.',
    lore: 'Kashmir sapphires are the gold standard against which all other blue gems are judged.',
  },
  {
    id: 'sap_ceylon', name: 'Ceylon Sapphire', formula: 'Al₂O₃:Fe,Ti', color: '#1565c0',
    rarity: 'Common', caveId: 'sapphire_depths', baseValue: 90,
    properties: { Clarity: 82, 'Color Depth': 78, 'Cut Quality': 68, 'Carat Weight': 50, Luminescence: 70 },
    healingPower: 22, healingCategory: 'Mental',
    description: 'A bright medium-blue sapphire from Sri Lanka (Ceylon), known for excellent brilliance.',
    lore: 'Sri Lankan kings wore Ceylon sapphires as protection against the evil eye.',
  },
  {
    id: 'sap_pad', name: 'Padparadscha Sapphire', formula: 'Al₂O₃:Cr,Fe', color: '#e8785e',
    rarity: 'Legendary', caveId: 'sapphire_depths', baseValue: 4000,
    properties: { Clarity: 90, 'Color Depth': 95, 'Cut Quality': 85, 'Carat Weight': 45, Luminescence: 88 },
    healingPower: 78, healingCategory: 'Emotional',
    description: 'The extremely rare pink-orange padparadscha, named after the Sinhalese word for lotus blossom.',
    lore: 'Only one padparadscha is found for every thousand sapphires mined.',
  },
  {
    id: 'sap_star', name: 'Star Sapphire', formula: 'Al₂O₃:TiO₂', color: '#283593',
    rarity: 'Rare', caveId: 'sapphire_depths', baseValue: 280,
    properties: { Clarity: 72, 'Color Depth': 82, 'Cut Quality': 55, 'Carat Weight': 65, Luminescence: 78 },
    healingPower: 38, healingCategory: 'Spiritual',
    description: 'A grayish-blue cabochon sapphire displaying a sharp six-rayed star phenomenon.',
    lore: 'The Star of India, a 563-carat star sapphire, is one of the most famous gems in the world.',
  },
  {
    id: 'sap_color', name: 'Color-Change Sapphire', formula: 'Al₂O₃:Cr,V', color: '#5c6bc0',
    rarity: 'Epic', caveId: 'sapphire_depths', baseValue: 700,
    properties: { Clarity: 85, 'Color Depth': 90, 'Cut Quality': 75, 'Carat Weight': 48, Luminescence: 92 },
    healingPower: 52, healingCategory: 'Emotional',
    description: 'A remarkable sapphire that shifts from blue in daylight to violet under incandescent light.',
    lore: 'Spies in ancient courts used color-change sapphires to detect poisoned candles.',
  },
  {
    id: 'sap_bi', name: 'Bicolor Sapphire', formula: 'Al₂O₃:Fe,Ti,Cr', color: '#7986cb',
    rarity: 'Rare', caveId: 'sapphire_depths', baseValue: 220,
    properties: { Clarity: 75, 'Color Depth': 80, 'Cut Quality': 62, 'Carat Weight': 55, Luminescence: 72 },
    healingPower: 32, healingCategory: 'Mental',
    description: 'A unique sapphire exhibiting both blue and yellow zones within a single crystal.',
    lore: 'Bicolor sapphires symbolize the duality of wisdom and joy.',
  },
  {
    id: 'sap_chang', name: 'Chanthaburi Star', formula: 'Al₂O₃:Fe,Ti,Ge', color: '#0d47a1',
    rarity: 'Mythic', caveId: 'sapphire_depths', baseValue: 10000,
    properties: { Clarity: 96, 'Color Depth': 99, 'Cut Quality': 96, 'Carat Weight': 82, Luminescence: 100 },
    healingPower: 100, healingCategory: 'Spiritual',
    description: 'A deep blue star sapphire from Thailand with a germanium-induced gold star of unprecedented sharpness.',
    lore: 'The Chanthaburi Star is said to contain the map to the lost city of the gem gods.',
  },

  // ---- Ruby Vein (7) ----
  {
    id: 'rub_burmese', name: 'Burmese Pigeon Blood Ruby', formula: 'Al₂O₃:Cr³⁺', color: '#b71c1c',
    rarity: 'Legendary', caveId: 'ruby_vein', baseValue: 5000,
    properties: { Clarity: 90, 'Color Depth': 100, 'Cut Quality': 88, 'Carat Weight': 50, Luminescence: 92 },
    healingPower: 85, healingCategory: 'Physical',
    description: 'The finest ruby color known — pure red with a subtle blue undertone, like fresh pigeon blood.',
    lore: 'Burmese warriors implanted rubies under their skin for invincibility in battle.',
  },
  {
    id: 'rub_mozambique', name: 'Mozambique Ruby', formula: 'Al₂O₃:Cr', color: '#d32f2f',
    rarity: 'Common', caveId: 'ruby_vein', baseValue: 100,
    properties: { Clarity: 70, 'Color Depth': 75, 'Cut Quality': 60, 'Carat Weight': 55, Luminescence: 68 },
    healingPower: 20, healingCategory: 'Physical',
    description: 'A vibrant red ruby from the Montepuez mine in Mozambique, the modern world\'s primary ruby source.',
    lore: 'Mozambique miners sing to the rubies at dawn, believing the stones respond to music.',
  },
  {
    id: 'rub_star', name: 'Star Ruby', formula: 'Al₂O₃:Cr,Ti', color: '#c62828',
    rarity: 'Rare', caveId: 'ruby_vein', baseValue: 300,
    properties: { Clarity: 68, 'Color Depth': 85, 'Cut Quality': 50, 'Carat Weight': 70, Luminescence: 75 },
    healingPower: 40, healingCategory: 'Spiritual',
    description: 'A translucent red cabochon ruby with a three-rayed or six-rayed asterism.',
    lore: 'The Rosser Reeves Star Ruby (138 carats) is housed in the Smithsonian Institution.',
  },
  {
    id: 'rub_pigeon', name: 'Pigeon Blood Star', formula: 'Al₂O₃:Cr³⁺,Ti', color: '#880e4f',
    rarity: 'Mythic', caveId: 'ruby_vein', baseValue: 12000,
    properties: { Clarity: 95, 'Color Depth': 100, 'Cut Quality': 97, 'Carat Weight': 68, Luminescence: 100 },
    healingPower: 100, healingCategory: 'Physical',
    description: 'The impossible dream — a pigeon blood ruby that also displays a perfect star phenomenon.',
    lore: 'Only one pigeon blood star ruby exists. It was last seen in the crown of a lost empire.',
  },
  {
    id: 'rub_thai', name: 'Thai Ruby', formula: 'Al₂O₃:Cr,Fe', color: '#a31515',
    rarity: 'Common', caveId: 'ruby_vein', baseValue: 75,
    properties: { Clarity: 62, 'Color Depth': 70, 'Cut Quality': 55, 'Carat Weight': 60, Luminescence: 60 },
    healingPower: 18, healingCategory: 'Emotional',
    description: 'A dark garnet-red ruby from Chanthaburi, Thailand, with high iron content.',
    lore: 'Thai rubies were the gem of choice for Siamese royal seal rings.',
  },
  {
    id: 'rub_vietnam', name: 'Vietnamese Luc Yen Ruby', formula: 'Al₂O₃:Cr', color: '#e53935',
    rarity: 'Epic', caveId: 'ruby_vein', baseValue: 900,
    properties: { Clarity: 88, 'Color Depth': 92, 'Cut Quality': 82, 'Carat Weight': 42, Luminescence: 85 },
    healingPower: 60, healingCategory: 'Emotional',
    description: 'A bright pinkish-red ruby from the Luc Yen district, known for exceptional fluorescence.',
    lore: 'Vietnamese healers placed Luc Yen rubies in water to create vitality elixirs.',
  },
  {
    id: 'rub_verneuil', name: 'Verneuil Synthetic Ruby', formula: 'Al₂O₃:Cr (synthetic)', color: '#ef5350',
    rarity: 'Rare', caveId: 'ruby_vein', baseValue: 160,
    properties: { Clarity: 95, 'Color Depth': 70, 'Cut Quality': 85, 'Carat Weight': 80, Luminescence: 55 },
    healingPower: 25, healingCategory: 'Mental',
    description: 'A lab-created ruby by the Verneuil flame fusion process — perfect clarity but no natural inclusions.',
    lore: 'The first synthetic ruby was created in 1902, launching the entire synthetic gem industry.',
  },

  // ---- Diamond Core (7) ----
  {
    id: 'dia_blue', name: 'Blue Hope Diamond', formula: 'C:B,N', color: '#1a237e',
    rarity: 'Mythic', caveId: 'diamond_core', baseValue: 15000,
    properties: { Clarity: 98, 'Color Depth': 100, 'Cut Quality': 99, 'Carat Weight': 95, Luminescence: 100 },
    healingPower: 100, healingCategory: 'Spiritual',
    description: 'A boron-infused type IIb diamond of extraordinary blue color, rivaling the legendary Hope Diamond.',
    lore: 'Blue diamonds are the rarest of all diamond colors — less than 0.1% of all diamonds mined.',
  },
  {
    id: 'dia_pink', name: 'Pink Argyle Diamond', formula: 'C:Plastic Deformation', color: '#e91e63',
    rarity: 'Legendary', caveId: 'diamond_core', baseValue: 8000,
    properties: { Clarity: 92, 'Color Depth': 96, 'Cut Quality': 94, 'Carat Weight': 55, Luminescence: 95 },
    healingPower: 90, healingCategory: 'Emotional',
    description: 'An intensely colored pink diamond from the now-closed Argyle mine in Australia.',
    lore: 'The Argyle mine produced 90% of the world\'s pink diamonds. Its closure made them irreplaceable.',
  },
  {
    id: 'dia_canary', name: 'Canary Yellow Diamond', formula: 'C:N', color: '#fdd835',
    rarity: 'Epic', caveId: 'diamond_core', baseValue: 1200,
    properties: { Clarity: 90, 'Color Depth': 88, 'Cut Quality': 85, 'Carat Weight': 70, Luminescence: 90 },
    healingPower: 58, healingCategory: 'Mental',
    description: 'A vivid yellow diamond colored by nitrogen atoms during formation deep in the mantle.',
    lore: 'The Tiffany Yellow Diamond (128 carats) was worn by Audrey Hepburn in Breakfast at Tiffany\'s.',
  },
  {
    id: 'dia_green', name: 'Dresden Green Diamond', formula: 'C:Natural Irradiation', color: '#388e3c',
    rarity: 'Legendary', caveId: 'diamond_core', baseValue: 6000,
    properties: { Clarity: 88, 'Color Depth': 94, 'Cut Quality': 90, 'Carat Weight': 60, Luminescence: 88 },
    healingPower: 82, healingCategory: 'Physical',
    description: 'A naturally irradiated green diamond of exceptional depth, rivaling the Dresden Green.',
    lore: 'Natural green diamonds are caused by millions of years of radioactive exposure in the earth.',
  },
  {
    id: 'dia_white', name: 'D Flawless White Diamond', formula: 'C', color: '#fafafa',
    rarity: 'Common', caveId: 'diamond_core', baseValue: 120,
    properties: { Clarity: 100, 'Color Depth': 30, 'Cut Quality': 70, 'Carat Weight': 60, Luminescence: 50 },
    healingPower: 15, healingCategory: 'Spiritual',
    description: 'A chemically pure carbon crystal with D color and IF clarity — the benchmark of diamond quality.',
    lore: 'Diamond is the hardest natural substance on Earth, 58 times harder than anything else.',
  },
  {
    id: 'dia_black', name: 'Carbonado Black Diamond', formula: 'C (polycrystalline)', color: '#212121',
    rarity: 'Epic', caveId: 'diamond_core', baseValue: 950,
    properties: { Clarity: 20, 'Color Depth': 85, 'Cut Quality': 60, 'Carat Weight': 90, Luminescence: 30 },
    healingPower: 50, healingCategory: 'Physical',
    description: 'A carbonado — a porous, polycrystalline black diamond found only in Brazil and Central Africa.',
    lore: 'Some scientists believe carbonados arrived on Earth via asteroid impacts billions of years ago.',
  },
  {
    id: 'dia_hope', name: 'Heart of Eternity Diamond', formula: 'C:B (Type IIb)', color: '#3f51b5',
    rarity: 'Mythic', caveId: 'diamond_core', baseValue: 20000,
    properties: { Clarity: 99, 'Color Depth': 100, 'Cut Quality': 100, 'Carat Weight': 88, Luminescence: 100 },
    healingPower: 100, healingCategory: 'Spiritual',
    description: 'A perfect heart-cut fancy vivid blue diamond of museum quality, the rarest gem configuration known.',
    lore: 'The original Heart of Eternity is said to have been forged in the core of a dying star.',
  },

  // ---- Opal Mirage (7) ----
  {
    id: 'opa_australian', name: 'Australian Black Opal', formula: 'SiO₂·nH₂O', color: '#1a1a2e',
    rarity: 'Rare', caveId: 'opal_mirage', baseValue: 350,
    properties: { Clarity: 75, 'Color Depth': 90, 'Cut Quality': 65, 'Carat Weight': 50, Luminescence: 95 },
    healingPower: 42, healingCategory: 'Emotional',
    description: 'A Lightning Ridge black opal with vivid play-of-color against a dark body tone.',
    lore: 'Australian Aboriginal dreamtime stories say opals were created when the creator\'s feet touched earth.',
  },
  {
    id: 'opa_ethiopian', name: 'Ethiopian Welo Opal', formula: 'SiO₂·nH₂O (hydrophane)', color: '#e1bee7',
    rarity: 'Common', caveId: 'opal_mirage', baseValue: 60,
    properties: { Clarity: 68, 'Color Depth': 72, 'Cut Quality': 55, 'Carat Weight': 45, Luminescence: 80 },
    healingPower: 20, healingCategory: 'Emotional',
    description: 'A hydrophane opal from Welo, Ethiopia that absorbs water and becomes more transparent.',
    lore: 'Ethiopian opals were discovered in 2008, making them the newest major opal source.',
  },
  {
    id: 'opa_fire', name: 'Mexican Fire Opal', formula: 'SiO₂·nH₂O', color: '#ff6f00',
    rarity: 'Common', caveId: 'opal_mirage', baseValue: 85,
    properties: { Clarity: 65, 'Color Depth': 85, 'Cut Quality': 60, 'Carat Weight': 40, Luminescence: 78 },
    healingPower: 22, healingCategory: 'Physical',
    description: 'A translucent orange-red opal from Mexico with flashes of green and gold play-of-color.',
    lore: 'Aztecs called fire opal "quetzalitzlipyollitliz" — the stone of the bird of paradise.',
  },
  {
    id: 'opa_black', name: 'Midnight Opal', formula: 'SiO₂·nH₂O (Fe,Mn)', color: '#0d0d0d',
    rarity: 'Legendary', caveId: 'opal_mirage', baseValue: 4500,
    properties: { Clarity: 80, 'Color Depth': 98, 'Cut Quality': 88, 'Carat Weight': 55, Luminescence: 100 },
    healingPower: 80, healingCategory: 'Spiritual',
    description: 'An impossibly dark opal with rainbow play-of-color so vivid it seems to glow from within.',
    lore: 'The Midnight Opal is said to contain the captured light of a billion years of sunsets.',
  },
  {
    id: 'opa_boulder', name: 'Boulder Opal Matrix', formula: 'SiO₂·nH₂O + Fe₂O₃', color: '#795548',
    rarity: 'Rare', caveId: 'opal_mirage', baseValue: 280,
    properties: { Clarity: 55, 'Color Depth': 82, 'Cut Quality': 50, 'Carat Weight': 75, Luminescence: 85 },
    healingPower: 38, healingCategory: 'Physical',
    description: 'Opal veins running through ironstone matrix, creating natural abstract patterns.',
    lore: 'Queensland boulder opal is found in seams too thin to cut free, so the host rock becomes part of the gem.',
  },
  {
    id: 'opa_hydro', name: 'Hydrophane Crystal Opal', formula: 'SiO₂·nH₂O', color: '#90caf9',
    rarity: 'Epic', caveId: 'opal_mirage', baseValue: 750,
    properties: { Clarity: 92, 'Color Depth': 78, 'Cut Quality': 72, 'Carat Weight': 38, Luminescence: 98 },
    healingPower: 55, healingCategory: 'Mental',
    description: 'A water-absorbing opal that completely changes appearance when wet — clear when dry, iridescent when wet.',
    lore: 'Hydrophane opals were used as natural mood rings by ancient desert seers.',
  },
  {
    id: 'opa_jelly', name: 'Jelly Opal', formula: 'SiO₂·nH₂O', color: '#ce93d8',
    rarity: 'Epic', caveId: 'opal_mirage', baseValue: 680,
    properties: { Clarity: 70, 'Color Depth': 86, 'Cut Quality': 68, 'Carat Weight': 60, Luminescence: 92 },
    healingPower: 48, healingCategory: 'Emotional',
    description: 'A translucent opal with a jelly-like body that diffuses light into soft rainbow patterns.',
    lore: 'Jelly opals were believed to be solidified moonbeams trapped in amber-like silica.',
  },

  // ---- Topaz Tunnel (7) ----
  {
    id: 'top_imperial', name: 'Imperial Topaz', formula: 'Al₂SiO₄(F,OH)₂', color: '#ff8f00',
    rarity: 'Rare', caveId: 'topaz_tunnel', baseValue: 260,
    properties: { Clarity: 82, 'Color Depth': 88, 'Cut Quality': 72, 'Carat Weight': 55, Luminescence: 75 },
    healingPower: 35, healingCategory: 'Emotional',
    description: 'The prized golden-orange imperial topaz from Ouro Preto, Brazil — the king of topaz colors.',
    lore: 'Imperial topaz was the personal gemstone of Russian tsars and was called "tsar\'s stone."',
  },
  {
    id: 'top_blue', name: 'Swiss Blue Topaz', formula: 'Al₂SiO₄(F,OH)₂ (irradiated)', color: '#42a5f5',
    rarity: 'Common', caveId: 'topaz_tunnel', baseValue: 55,
    properties: { Clarity: 90, 'Color Depth': 70, 'Cut Quality': 75, 'Carat Weight': 65, Luminescence: 55 },
    healingPower: 15, healingCategory: 'Mental',
    description: 'A bright sky-blue topaz, enhanced by irradiation and heat treatment from colorless natural topaz.',
    lore: 'Blue topaz is the birthstone for December and symbolizes love and fidelity.',
  },
  {
    id: 'top_mystic', name: 'Mystic Topaz', formula: 'Al₂SiO₄(F,OH)₂ + TiO₂', color: '#ab47bc',
    rarity: 'Epic', caveId: 'topaz_tunnel', baseValue: 720,
    properties: { Clarity: 88, 'Color Depth': 95, 'Cut Quality': 82, 'Carat Weight': 50, Luminescence: 96 },
    healingPower: 52, healingCategory: 'Spiritual',
    description: 'A colorless topaz coated with titanium dioxide, producing rainbow iridescence across the entire surface.',
    lore: 'Mystic topaz appears to shift through every color of the spectrum as it moves.',
  },
  {
    id: 'top_precious', name: 'Precious Topaz', formula: 'Al₂SiO₄(F,OH)₂:Cr', color: '#ffa726',
    rarity: 'Common', caveId: 'topaz_tunnel', baseValue: 65,
    properties: { Clarity: 78, 'Color Depth': 72, 'Cut Quality': 62, 'Carat Weight': 50, Luminescence: 62 },
    healingPower: 18, healingCategory: 'Physical',
    description: 'A natural golden-yellow topaz with warm champagne tones and good transparency.',
    lore: 'The word "topaz" may derive from the Sanskrit "tapas" meaning fire or heat.',
  },
  {
    id: 'top_champagne', name: 'Champagne Topaz', formula: 'Al₂SiO₄(F,OH)₂:Fe', color: '#d4a373',
    rarity: 'Rare', caveId: 'topaz_tunnel', baseValue: 200,
    properties: { Clarity: 80, 'Color Depth': 68, 'Cut Quality': 70, 'Carat Weight': 58, Luminescence: 65 },
    healingPower: 28, healingCategory: 'Emotional',
    description: 'A warm brownish-yellow topaz with effervescent inner fire, like trapped champagne bubbles.',
    lore: 'Champagne topaz was a favorite of Victorian jewelers for its warm, romantic glow.',
  },
  {
    id: 'top_pink', name: 'Pink Topaz', formula: 'Al₂SiO₄(F,OH)₂:Cr³⁺', color: '#f48fb1',
    rarity: 'Legendary', caveId: 'topaz_tunnel', baseValue: 3800,
    properties: { Clarity: 90, 'Color Depth': 92, 'Cut Quality': 88, 'Carat Weight': 42, Luminescence: 88 },
    healingPower: 76, healingCategory: 'Emotional',
    description: 'An exceptionally rare natural pink topaz from Pakistan, colored by chromium impurities.',
    lore: 'Natural pink topaz is rarer than diamond — most pink topaz on the market is heat-treated.',
  },
  {
    id: 'top_rutilated', name: 'Rutilated Topaz', formula: 'Al₂SiO₄(F,OH)₂ + TiO₂', color: '#ffcc80',
    rarity: 'Mythic', caveId: 'topaz_tunnel', baseValue: 8500,
    properties: { Clarity: 75, 'Color Depth': 96, 'Cut Quality': 94, 'Carat Weight': 78, Luminescence: 100 },
    healingPower: 100, healingCategory: 'Spiritual',
    description: 'A golden topaz containing needle-like rutile inclusions forming starburst patterns of trapped light.',
    lore: 'The Rutilated Topaz of the Sun Temple was said to be a solidified piece of sunlight.',
  },

  // ---- Quartz Palace (7) ----
  {
    id: 'qua_rose', name: 'Rose Quartz', formula: 'SiO₂:Ti,Mn', color: '#f48fb1',
    rarity: 'Common', caveId: 'quartz_palace', baseValue: 45,
    properties: { Clarity: 60, 'Color Depth': 65, 'Cut Quality': 50, 'Carat Weight': 70, Luminescence: 55 },
    healingPower: 25, healingCategory: 'Emotional',
    description: 'A translucent pink quartz colored by titanium and manganese inclusions, the stone of unconditional love.',
    lore: 'Rose quartz facial rollers have been used in Chinese beauty rituals for over 3,000 years.',
  },
  {
    id: 'qua_smoky', name: 'Smoky Quartz', formula: 'SiO₂:Al,⁴⁰K', color: '#5d4037',
    rarity: 'Common', caveId: 'quartz_palace', baseValue: 40,
    properties: { Clarity: 70, 'Color Depth': 60, 'Cut Quality': 55, 'Carat Weight': 75, Luminescence: 40 },
    healingPower: 20, healingCategory: 'Spiritual',
    description: 'A brown-to-black translucent quartz colored by natural irradiation of aluminum impurities.',
    lore: 'Smoky quartz was the national gemstone of Scotland, carried by Highlanders for protection.',
  },
  {
    id: 'qua_citrine', name: 'Natural Citrine', formula: 'SiO₂:Fe³⁺', color: '#ffab00',
    rarity: 'Common', caveId: 'quartz_palace', baseValue: 55,
    properties: { Clarity: 75, 'Color Depth': 72, 'Cut Quality': 62, 'Carat Weight': 60, Luminescence: 68 },
    healingPower: 22, healingCategory: 'Mental',
    description: 'A rare natural yellow-to-orange quartz, most commercial citrine is actually heat-treated amethyst.',
    lore: 'True natural citrine is so rare that many gemologists have never seen a natural specimen.',
  },
  {
    id: 'qua_amethyst', name: 'Quartz Amethyst', formula: 'SiO₂:Fe³⁺', color: '#9c27b0',
    rarity: 'Common', caveId: 'quartz_palace', baseValue: 50,
    properties: { Clarity: 65, 'Color Depth': 70, 'Cut Quality': 55, 'Carat Weight': 55, Luminescence: 72 },
    healingPower: 20, healingCategory: 'Spiritual',
    description: 'A well-formed amethyst crystal from quartz palace geodes, with deeper color than typical specimens.',
    lore: 'The Quartz Palace amethysts are considered more powerful due to the piezoelectric resonance of surrounding crystals.',
  },
  {
    id: 'qua_rutilated', name: 'Rutilated Quartz', formula: 'SiO₂ + TiO₂', color: '#d4a574',
    rarity: 'Epic', caveId: 'quartz_palace', baseValue: 650,
    properties: { Clarity: 70, 'Color Depth': 82, 'Cut Quality': 68, 'Carat Weight': 65, Luminescence: 78 },
    healingPower: 50, healingCategory: 'Mental',
    description: 'Clear quartz containing golden rutile needle inclusions creating dramatic internal landscapes.',
    lore: 'Called "Venus hair stone" in folklore, rutilated quartz was Cupid\'s favorite gem.',
  },
  {
    id: 'qua_tourmalinated', name: 'Tourmalinated Quartz', formula: 'SiO₂ + NaFe₃Al₆(BO₃)₃Si₆O₁₈(OH)₄', color: '#263238',
    rarity: 'Epic', caveId: 'quartz_palace', baseValue: 700,
    properties: { Clarity: 65, 'Color Depth': 88, 'Cut Quality': 65, 'Carat Weight': 60, Luminescence: 72 },
    healingPower: 55, healingCategory: 'Physical',
    description: 'Clear quartz with black tourmaline needle inclusions forming dramatic contrast patterns.',
    lore: 'Tourmalinated quartz combines the amplifying power of quartz with the protective energy of tourmaline.',
  },
  {
    id: 'qua_herkimer', name: 'Herkimer Diamond', formula: 'SiO₂ (double-terminated)', color: '#e0e0e0',
    rarity: 'Legendary', caveId: 'quartz_palace', baseValue: 2800,
    properties: { Clarity: 100, 'Color Depth': 45, 'Cut Quality': 92, 'Carat Weight': 35, Luminescence: 85 },
    healingPower: 72, healingCategory: 'Spiritual',
    description: 'A naturally double-terminated quartz crystal with 18 facets, formed 500 million years ago in Herkimer County, NY.',
    lore: 'Herkimer diamonds are not actually diamonds but are so brilliant they fooled early prospectors.',
  },
];

// ---------------------------------------------------------------------------
// Static Data — 6 Mining Tools
// ---------------------------------------------------------------------------

export const CC_TOOLS: ToolDef[] = [
  {
    id: 'pickaxe', name: 'Gem Pickaxe', description: 'A sturdy pickaxe with a tungsten-carbide head designed for precision crystal extraction.',
    power: 40, precision: 60, speed: 50, durability: 100, maxDurability: 100,
    cost: 0, upgradeCost: 200, level: 1, maxLevel: 5,
  },
  {
    id: 'chisel', name: 'Crystal Chisel', description: 'A fine diamond-tipped chisel for delicate work around fragile crystal formations.',
    power: 25, precision: 90, speed: 35, durability: 80, maxDurability: 80,
    cost: 150, upgradeCost: 250, level: 1, maxLevel: 5,
  },
  {
    id: 'drill', name: 'Core Drill', description: 'A rotary drill that bores into cave walls to extract deep-embedded crystals.',
    power: 70, precision: 50, speed: 75, durability: 60, maxDurability: 60,
    cost: 400, upgradeCost: 400, level: 1, maxLevel: 5,
  },
  {
    id: 'explosive', name: 'Crystal Charge', description: 'A controlled micro-explosive that shatters rock walls to reveal hidden crystal veins.',
    power: 95, precision: 15, speed: 100, durability: 10, maxDurability: 10,
    cost: 800, upgradeCost: 500, level: 1, maxLevel: 5,
  },
  {
    id: 'sonic_hammer', name: 'Sonic Hammer', description: 'Uses focused sound waves to resonate crystals free from surrounding rock without damage.',
    power: 60, precision: 80, speed: 65, durability: 50, maxDurability: 50,
    cost: 1500, upgradeCost: 600, level: 1, maxLevel: 5,
  },
  {
    id: 'crystal_detector', name: 'Crystal Detector', description: 'An electromagnetic scanner that locates crystals through solid rock with pinpoint accuracy.',
    power: 10, precision: 100, speed: 90, durability: 120, maxDurability: 120,
    cost: 3000, upgradeCost: 800, level: 1, maxLevel: 5,
  },
];

// ---------------------------------------------------------------------------
// Static Data — 8 Jewelry Types
// ---------------------------------------------------------------------------

export const CC_JEWELRY_TYPES: JewelryTypeDef[] = [
  {
    id: 'necklace', name: 'Crystal Necklace', category: 'Necklace',
    description: 'A chain of linked crystals worn close to the heart, amplifying emotional resonance.',
    slots: 5, basePower: 50, requiredLevel: 1, icon: '📿',
  },
  {
    id: 'ring', name: 'Signet Ring', category: 'Ring',
    description: 'A crystal-set ring that channels focused energy through the wearer\'s hand.',
    slots: 2, basePower: 25, requiredLevel: 1, icon: '💍',
  },
  {
    id: 'bracelet', name: 'Wrist Cuff', category: 'Bracelet',
    description: 'Crystals embedded in a flexible cuff that pulses with the wearer\'s heartbeat.',
    slots: 4, basePower: 40, requiredLevel: 3, icon: '⌚',
  },
  {
    id: 'earrings', name: 'Chandelier Earrings', category: 'Earrings',
    description: 'Dangling crystal formations that create harmonic frequencies near the ears.',
    slots: 3, basePower: 30, requiredLevel: 2, icon: '✨',
  },
  {
    id: 'crown', name: 'Crystal Crown', category: 'Crown',
    description: 'A circlet of the finest crystals, granting wisdom and command over lesser gems.',
    slots: 8, basePower: 100, requiredLevel: 20, icon: '👑',
  },
  {
    id: 'amulet', name: 'Pendant Amulet', category: 'Amulet',
    description: 'A single large crystal in a protective setting, worn as a ward against harm.',
    slots: 1, basePower: 35, requiredLevel: 1, icon: '🔮',
  },
  {
    id: 'brooch', name: 'Lapel Brooch', category: 'Brooch',
    description: 'An ornate crystal brooch for formal occasions, subtly projecting authority.',
    slots: 3, basePower: 28, requiredLevel: 5, icon: '📌',
  },
  {
    id: 'tiara', name: 'Princess Tiara', category: 'Tiara',
    description: 'A delicate tiara of interlocking crystals, radiating grace and inner light.',
    slots: 6, basePower: 70, requiredLevel: 15, icon: '👸',
  },
];

// ---------------------------------------------------------------------------
// Static Data — 30 Gem Cuts
// ---------------------------------------------------------------------------

export const CC_GEM_CUTS: GemCutDef[] = [
  { id: 'brilliant', name: 'Brilliant Round', description: 'The classic 57-facet round brilliant cut maximizing fire and brilliance.', bonusProperty: 'Luminescence', bonusAmount: 15, cost: 100, requiredLevel: 1, rarity: 'Common' },
  { id: 'emerald_cut', name: 'Emerald Step', description: 'A rectangular step cut with cropped corners, emphasizing clarity over fire.', bonusProperty: 'Clarity', bonusAmount: 20, cost: 100, requiredLevel: 1, rarity: 'Common' },
  { id: 'pear', name: 'Pear Teardrop', description: 'A hybrid of brilliant and marquise, shaped like a glistening teardrop.', bonusProperty: 'Color Depth', bonusAmount: 12, cost: 150, requiredLevel: 2, rarity: 'Common' },
  { id: 'marquise', name: 'Marquise Navette', description: 'An elongated boat-shaped cut with pointed ends, maximizing carat appearance.', bonusProperty: 'Carat Weight', bonusAmount: 18, cost: 200, requiredLevel: 3, rarity: 'Common' },
  { id: 'cushion', name: 'Cushion Modified', description: 'A rounded square with soft edges and large facets for vintage warmth.', bonusProperty: 'Color Depth', bonusAmount: 15, cost: 200, requiredLevel: 3, rarity: 'Common' },
  { id: 'princess', name: 'Princess Square', description: 'A sharp square brilliant cut combining modern geometry with maximum sparkle.', bonusProperty: 'Cut Quality', bonusAmount: 18, cost: 250, requiredLevel: 4, rarity: 'Common' },
  { id: 'oval', name: 'Oval Brilliant', description: 'An elongated brilliant cut that appears larger per carat than round.', bonusProperty: 'Carat Weight', bonusAmount: 14, cost: 180, requiredLevel: 3, rarity: 'Common' },
  { id: 'trillion', name: 'Trillion Triangle', description: 'A triangular brilliant cut with dramatic pointed corners and vivid fire.', bonusProperty: 'Luminescence', bonusAmount: 20, cost: 300, requiredLevel: 5, rarity: 'Rare' },
  { id: 'asscher', name: 'Asscher Step', description: 'An octagonal step cut with deep pavilion and art deco appeal.', bonusProperty: 'Clarity', bonusAmount: 22, cost: 350, requiredLevel: 6, rarity: 'Rare' },
  { id: 'radiant', name: 'Radiant Mixed', description: 'A trimmed rectangular cut combining brilliant and step cut facets.', bonusProperty: 'Cut Quality', bonusAmount: 20, cost: 400, requiredLevel: 7, rarity: 'Rare' },
  { id: 'heart', name: 'Heart Brilliant', description: 'A pear-shaped modification with a cleft, the ultimate symbol of love.', bonusProperty: 'Color Depth', bonusAmount: 18, cost: 500, requiredLevel: 8, rarity: 'Rare' },
  { id: 'baguette', name: 'Baguette Step', description: 'An elongated rectangular step cut favored in Art Deco jewelry designs.', bonusProperty: 'Clarity', bonusAmount: 16, cost: 250, requiredLevel: 5, rarity: 'Common' },
  { id: 'cabochon', name: 'Cabochon Dome', description: 'A polished dome with no facets, ideal for showing asterism and chatoyancy.', bonusProperty: 'Luminescence', bonusAmount: 25, cost: 150, requiredLevel: 2, rarity: 'Common' },
  { id: 'briolette', name: 'Briolette Teardrop', description: 'A fully faceted teardrop with triangular facets covering the entire surface.', bonusProperty: 'Luminescence', bonusAmount: 28, cost: 600, requiredLevel: 9, rarity: 'Rare' },
  { id: 'old_mine', name: 'Old Mine Cut', description: 'An antique cushion-shaped cut with irregular facets and romantic warmth.', bonusProperty: 'Color Depth', bonusAmount: 22, cost: 350, requiredLevel: 6, rarity: 'Rare' },
  { id: 'old_european', name: 'Old European Cut', description: 'A round predecessor to the modern brilliant with a small table and high crown.', bonusProperty: 'Cut Quality', bonusAmount: 16, cost: 300, requiredLevel: 5, rarity: 'Common' },
  { id: 'rose_cut', name: 'Rose Cut', description: 'A flat-bottomed dome covered with triangular facets like rose petals.', bonusProperty: 'Luminescence', bonusAmount: 18, cost: 200, requiredLevel: 3, rarity: 'Common' },
  { id: 'checkerboard', name: 'Checkerboard Cushion', description: 'A square modified cushion with alternating facet pattern on the crown.', bonusProperty: 'Luminescence', bonusAmount: 22, cost: 450, requiredLevel: 8, rarity: 'Rare' },
  { id: 'barion', name: 'Barion Octagonal', description: 'An octagonal brilliant cut with 4-fold symmetry and extra facet rows.', bonusProperty: 'Cut Quality', bonusAmount: 24, cost: 500, requiredLevel: 10, rarity: 'Epic' },
  { id: 'scissor', name: 'Scissor Cut', description: 'An octagonal step cut with V-shaped facets meeting at the center table.', bonusProperty: 'Clarity', bonusAmount: 26, cost: 550, requiredLevel: 11, rarity: 'Epic' },
  { id: 'laser', name: 'Laser Precision Cut', description: 'An ultra-precise computer-calculated cut achieving maximum light return.', bonusProperty: 'Cut Quality', bonusAmount: 30, cost: 1000, requiredLevel: 15, rarity: 'Epic' },
  { id: 'phantom', name: 'Phantom Facet', description: 'A cut with internal facet reflections creating ghost images of the original crystal shape.', bonusProperty: 'Luminescence', bonusAmount: 32, cost: 1200, requiredLevel: 18, rarity: 'Epic' },
  { id: 'infinity', name: 'Infinity Symbol Cut', description: 'A figure-eight shaped cut symbolizing eternal cycles of crystal energy.', bonusProperty: 'Color Depth', bonusAmount: 28, cost: 1500, requiredLevel: 22, rarity: 'Legendary' },
  { id: 'starburst', name: 'Starburst Radial', description: 'A radial cut with facets arranged in a starburst pattern for maximum fire display.', bonusProperty: 'Luminescence', bonusAmount: 35, cost: 2000, requiredLevel: 25, rarity: 'Legendary' },
  { id: 'quantum', name: 'Quantum Lattice', description: 'A theoretical cut with facets at angles that theoretically exist in multiple dimensions.', bonusProperty: 'Clarity', bonusAmount: 38, cost: 3000, requiredLevel: 30, rarity: 'Legendary' },
  { id: 'prism', name: 'Prismatic Spectrum', description: 'A cut specifically designed to separate light into its full spectral components.', bonusProperty: 'Color Depth', bonusAmount: 35, cost: 2500, requiredLevel: 28, rarity: 'Legendary' },
  { id: 'resonance', name: 'Resonance Chamber', description: 'A hollow cut creating internal acoustic resonance that amplifies crystal vibrations.', bonusProperty: 'Luminescence', bonusAmount: 40, cost: 5000, requiredLevel: 35, rarity: 'Mythic' },
  { id: 'singularity', name: 'Singularity Focus', description: 'A point-cut gem that concentrates all light energy to a single infinitely brilliant point.', bonusProperty: 'Cut Quality', bonusAmount: 45, cost: 8000, requiredLevel: 38, rarity: 'Mythic' },
  { id: 'eternal', name: 'Eternal Flame Cut', description: 'The legendary masterwork cut that makes a gem appear to burn with internal fire forever.', bonusProperty: 'Color Depth', bonusAmount: 42, cost: 10000, requiredLevel: 40, rarity: 'Mythic' },
  { id: 'transcendent', name: 'Transcendent Unity', description: 'The ultimate cut achieving perfect balance of all five crystal properties simultaneously.', bonusProperty: 'Clarity', bonusAmount: 50, cost: 20000, requiredLevel: 40, rarity: 'Mythic' },
];

// ---------------------------------------------------------------------------
// Static Data — 6 Enchantments
// ---------------------------------------------------------------------------

export const CC_ENCHANTMENTS: EnchantmentDef[] = [
  {
    id: 'Fire', name: 'Flame Binding', description: 'Imbues the item with fire elemental energy, adding searing damage to all effects.',
    element: 'Fire', powerBonus: 25, specialEffect: 'Burn: 5 damage per turn for 3 turns', cost: 500,
  },
  {
    id: 'Ice', name: 'Frost Enchantment', description: 'Wraps the item in eternal ice, freezing targets and providing cryogenic protection.',
    element: 'Ice', powerBonus: 20, specialEffect: 'Freeze: Target skips next action', cost: 500,
  },
  {
    id: 'Lightning', name: 'Storm Conduit', description: 'Channels lightning through the crystal lattice, adding shock damage and chain effects.',
    element: 'Lightning', powerBonus: 30, specialEffect: 'Chain: 50% chance to hit adjacent targets', cost: 600,
  },
  {
    id: 'Shadow', name: 'Void Imprint', description: 'Etches shadow magic into the gem, allowing it to absorb and redirect dark energy.',
    element: 'Shadow', powerBonus: 28, specialEffect: 'Leech: Restore 10% of damage as health', cost: 700,
  },
  {
    id: 'Holy', name: 'Sacred Blessing', description: 'Infuses the crystal with divine light, purifying corruption and healing the wearer.',
    element: 'Holy', powerBonus: 22, specialEffect: 'Purify: Remove all debuffs, +15 healing', cost: 800,
  },
  {
    id: 'Nature', name: 'Living Crystal', description: 'Makes the crystal a living organism that grows stronger over time and regenerates.',
    element: 'Nature', powerBonus: 18, specialEffect: 'Regrowth: +5 power each use, max +50', cost: 550,
  },
];

// ---------------------------------------------------------------------------
// Static Data — 8 Cave Creatures
// ---------------------------------------------------------------------------

export const CC_CREATURES: CreatureDef[] = [
  {
    id: 'crystal_golem', name: 'Crystal Golem', description: 'A massive humanoid construct of fused cave crystals, animated by ancient earth magic.',
    caveId: 'amethyst_cavern', hp: 200, maxHp: 200, attack: 30, defense: 40,
    ability: 'Crystal Shield: Reduces incoming damage by 50% for 2 turns', weakness: 'Epic',
    xpReward: 150, coinReward: 100, defeated: false,
  },
  {
    id: 'gem_spider', name: 'Gem Spider', description: 'A crystalline arachnid that spins webs of razor-sharp mineral threads.',
    caveId: 'emerald_grotto', hp: 80, maxHp: 80, attack: 45, defense: 10,
    ability: 'Web Trap: Immobilizes for 1 turn, deals 20 poison damage', weakness: 'Rare',
    xpReward: 100, coinReward: 75, defeated: false,
  },
  {
    id: 'rock_worm', name: 'Rock Worm', description: 'A segmented worm that tunnels through solid stone, digesting minerals for energy.',
    caveId: 'sapphire_depths', hp: 150, maxHp: 150, attack: 35, defense: 25,
    ability: 'Tunnel Dive: Burrows underground and resurfaces for double damage', weakness: 'Legendary',
    xpReward: 120, coinReward: 90, defeated: false,
  },
  {
    id: 'magma_sprite', name: 'Magma Sprite', description: 'A mischievous elemental born from volcanic heat, leaving trails of molten rock.',
    caveId: 'ruby_vein', hp: 60, maxHp: 60, attack: 55, defense: 5,
    ability: 'Eruption: AoE fire damage to all crystals in inventory', weakness: 'Common',
    xpReward: 80, coinReward: 60, defeated: false,
  },
  {
    id: 'diamond_mantis', name: 'Diamond Mantis', description: 'An insectoid predator with diamond-hard forelimbs that can cut through anything.',
    caveId: 'diamond_core', hp: 250, maxHp: 250, attack: 50, defense: 50,
    ability: 'Diamond Strike: Ignores all defense, guaranteed critical hit', weakness: 'Mythic',
    xpReward: 300, coinReward: 200, defeated: false,
  },
  {
    id: 'opal_serpent', name: 'Opal Serpent', description: 'A serpentine creature covered in shifting opal scales that create blinding light displays.',
    caveId: 'opal_mirage', hp: 120, maxHp: 120, attack: 40, defense: 20,
    ability: 'Prismatic Flash: Blinds the player, reducing accuracy to 0 for 1 turn', weakness: 'Epic',
    xpReward: 130, coinReward: 85, defeated: false,
  },
  {
    id: 'topaz_titan', name: 'Topaz Titan', description: 'A colossal humanoid made of fused imperial topaz crystals, radiating warmth.',
    caveId: 'topaz_tunnel', hp: 180, maxHp: 180, attack: 38, defense: 35,
    ability: 'Solar Beam: Concentrated light beam dealing 60 damage to a single target', weakness: 'Rare',
    xpReward: 140, coinReward: 95, defeated: false,
  },
  {
    id: 'quartz_phantom', name: 'Quartz Phantom', description: 'An ethereal being of pure crystalline energy that phases between dimensions.',
    caveId: 'quartz_palace', hp: 100, maxHp: 100, attack: 42, defense: 15,
    ability: 'Phase Shift: Becomes invulnerable for 1 turn, heals 20 HP', weakness: 'Legendary',
    xpReward: 160, coinReward: 110, defeated: false,
  },
];

// ---------------------------------------------------------------------------
// Static Data — 15 Achievements
// ---------------------------------------------------------------------------

const ACHIEVEMENTS_DEF: Omit<Achievement, 'unlocked' | 'unlockedDate'>[] = [
  { id: 'ach_first_mine', name: 'First Strike', description: 'Mine your first crystal from any cave.', condition: 'totalCrystalsMined >= 1', icon: '⛏️', reward: { coins: 50, xp: 25, badge: 'Novice Miner' } },
  { id: 'ach_cave_master', name: 'Cave Master', description: 'Mine crystals from all 8 caves.', condition: 'cavesExplored >= 8', icon: '🗺️', reward: { coins: 2000, xp: 500, badge: 'Spelunker' } },
  { id: 'ach_legendary_find', name: 'Legendary Discovery', description: 'Find a Legendary crystal.', condition: 'legendaryCrystalsFound >= 1', icon: '⭐', reward: { coins: 1000, xp: 300, badge: 'Legend Seeker' } },
  { id: 'ach_mythic_find', name: 'Mythic Revelation', description: 'Find a Mythic crystal.', condition: 'mythicCrystalsFound >= 1', icon: '🌟', reward: { coins: 5000, xp: 1000, badge: 'Myth Walker' } },
  { id: 'ach_jeweler', name: 'Apprentice Jeweler', description: 'Craft your first piece of jewelry.', condition: 'totalJewelryCrafted >= 1', icon: '💍', reward: { coins: 200, xp: 100, badge: 'Jeweler' } },
  { id: 'ach_master_crafter', name: 'Master Crafter', description: 'Craft 10 pieces of jewelry.', condition: 'totalJewelryCrafted >= 10', icon: '🎨', reward: { coins: 3000, xp: 800, badge: 'Master Artisan' } },
  { id: 'ach_creature_slayer', name: 'Creature Slayer', description: 'Defeat all 8 cave creatures.', condition: 'totalCreaturesDefeated >= 8', icon: '⚔️', reward: { coins: 4000, xp: 1200, badge: 'Beast Tamer' } },
  { id: 'ach_river_explorer', name: 'River Rat', description: 'Explore 5 underground rivers.', condition: 'totalRiversExplored >= 5', icon: '🌊', reward: { coins: 1500, xp: 400, badge: 'River Guide' } },
  { id: 'ach_healer', name: 'Crystal Healer', description: 'Perform 20 healing sessions.', condition: 'totalHealingSessions >= 20', icon: '💚', reward: { coins: 800, xp: 300, badge: 'Healer' } },
  { id: 'ach_cut_master', name: 'Gem Cutter', description: 'Apply 15 gem cuts to crystals.', condition: 'totalCutsApplied >= 15', icon: '💎', reward: { coins: 2000, xp: 600, badge: 'Lapidary' } },
  { id: 'ach_enchanter', name: 'Enchanter', description: 'Apply enchantments to 5 jewelry pieces.', condition: 'totalEnchantmentsApplied >= 5', icon: '✨', reward: { coins: 2500, xp: 700, badge: 'Arcane Smith' } },
  { id: 'ach_streak_7', name: 'Weekly Devotee', description: 'Maintain a 7-day mining streak.', condition: 'streak >= 7', icon: '📅', reward: { coins: 1000, xp: 400, badge: 'Dedicated' } },
  { id: 'ach_streak_30', name: 'Monthly Legend', description: 'Maintain a 30-day mining streak.', condition: 'streak >= 30', icon: '🏆', reward: { coins: 5000, xp: 2000, badge: 'Unstoppable' } },
  { id: 'ach_max_level', name: 'Master Gemologist', description: 'Reach level 40.', condition: 'level >= 40', icon: '🎓', reward: { coins: 10000, xp: 5000, badge: 'Grandmaster' } },
  { id: 'ach_rich_miner', name: 'Crystal Tycoon', description: 'Earn 50,000 coins total.', condition: 'totalCoinsEarned >= 50000', icon: '💰', reward: { coins: 10000, xp: 3000, badge: 'Tycoon' } },
];

// ---------------------------------------------------------------------------
// Static Data — Underground Rivers (16, 2 per cave)
// ---------------------------------------------------------------------------

const UNDERGROUND_RIVERS_DEF: Omit<UndergroundRiver, 'discovered'>[] = [
  { id: 'river_amy_1', name: 'Violet Stream', caveId: 'amethyst_cavern', length: 8, crystalDeposits: ['amy_violet', 'amy_deep'], difficulty: 1 },
  { id: 'river_amy_2', name: 'Amethyst Falls', caveId: 'amethyst_cavern', length: 12, crystalDeposits: ['amy_brand', 'amy_caer'], difficulty: 3 },
  { id: 'river_eme_1', name: 'Emerald Creek', caveId: 'emerald_grotto', length: 6, crystalDeposits: ['eme_colombian', 'eme_zambian'], difficulty: 2 },
  { id: 'river_eme_2', name: 'Jade Rapids', caveId: 'emerald_grotto', length: 15, crystalDeposits: ['eme_chrome', 'eme_star'], difficulty: 4 },
  { id: 'river_sap_1', name: 'Azure Current', caveId: 'sapphire_depths', length: 10, crystalDeposits: ['sap_ceylon', 'sap_star'], difficulty: 3 },
  { id: 'river_sap_2', name: 'Midnight Flow', caveId: 'sapphire_depths', length: 18, crystalDeposits: ['sap_kashmir', 'sap_pad'], difficulty: 5 },
  { id: 'river_rub_1', name: 'Crimson Wash', caveId: 'ruby_vein', length: 7, crystalDeposits: ['rub_mozambique', 'rub_thai'], difficulty: 3 },
  { id: 'river_rub_2', name: 'Blood River', caveId: 'ruby_vein', length: 14, crystalDeposits: ['rub_burmese', 'rub_pigeon'], difficulty: 5 },
  { id: 'river_dia_1', name: 'Diamond Brook', caveId: 'diamond_core', length: 9, crystalDeposits: ['dia_white', 'dia_canary'], difficulty: 4 },
  { id: 'river_dia_2', name: 'Brilliance Stream', caveId: 'diamond_core', length: 20, crystalDeposits: ['dia_blue', 'dia_hope'], difficulty: 5 },
  { id: 'river_opa_1', name: 'Iridescent Rill', caveId: 'opal_mirage', length: 11, crystalDeposits: ['opa_ethiopian', 'opa_fire'], difficulty: 3 },
  { id: 'river_opa_2', name: 'Mirage Torrent', caveId: 'opal_mirage', length: 16, crystalDeposits: ['opa_black', 'opa_hydro'], difficulty: 4 },
  { id: 'river_top_1', name: 'Golden Run', caveId: 'topaz_tunnel', length: 8, crystalDeposits: ['top_blue', 'top_precious'], difficulty: 2 },
  { id: 'river_top_2', name: 'Imperial Passage', caveId: 'topaz_tunnel', length: 17, crystalDeposits: ['top_imperial', 'top_pink'], difficulty: 5 },
  { id: 'river_qua_1', name: 'Crystal Conduit', caveId: 'quartz_palace', length: 10, crystalDeposits: ['qua_rose', 'qua_citrine'], difficulty: 3 },
  { id: 'river_qua_2', name: 'Herkimer Deep', caveId: 'quartz_palace', length: 19, crystalDeposits: ['qua_rutilated', 'qua_herkimer'], difficulty: 5 },
];

// ---------------------------------------------------------------------------
// Constants — XP, Levels, Grid
// ---------------------------------------------------------------------------

const CAVE_GRID_ROWS = 5;
const CAVE_GRID_COLS = 8;
const MAX_LEVEL = 40;
const RARITY_WEIGHTS: Record<CrystalRarity, number> = {
  Common: 50,
  Rare: 25,
  Epic: 15,
  Legendary: 8,
  Mythic: 2,
};
const RARITY_XP_MULTIPLIER: Record<CrystalRarity, number> = {
  Common: 1,
  Rare: 2,
  Epic: 4,
  Legendary: 8,
  Mythic: 16,
};
const RARITY_COIN_MULTIPLIER: Record<CrystalRarity, number> = {
  Common: 1,
  Rare: 3,
  Epic: 6,
  Legendary: 15,
  Mythic: 40,
};

const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice Gemologist',
  2: 'Stone Reader',
  3: 'Mineral Student',
  4: 'Pebble Picker',
  5: 'Crystal Apprentice',
  6: 'Ore Scout',
  7: 'Gem Tender',
  8: 'Vein Tracker',
  9: 'Shaft Explorer',
  10: 'Journeyman Miner',
  11: 'Crystal Seeker',
  12: 'Gem Analyst',
  13: 'Cavern Mapper',
  14: 'Lapidary Trainee',
  15: 'Mineral Expert',
  16: 'Deep Delver',
  17: 'Gem Cutter',
  18: 'Crystal Harmonizer',
  19: 'Ore Master',
  20: 'Expert Gemologist',
  21: 'Jewelry Artisan',
  22: 'Vein Prophet',
  23: 'Crystal Sage',
  24: 'Enchantment Scholar',
  25: 'Mine Foreman',
  26: 'Gem Enlightened',
  27: 'Crystal Resonator',
  28: 'Master Cutter',
  29: 'Earth Whisperer',
  30: 'Senior Gemologist',
  31: 'Crystal Architect',
  32: 'Lore Keeper',
  33: 'Enchantment Master',
  34: 'Gem Virtuoso',
  35: 'Cave Sovereign',
  36: 'Crystal Philosopher',
  37: 'Myth Seeker',
  38: 'Grand Artisan',
  39: 'Gem Prophet',
  40: 'Master Gemologist',
};

const HINTS: string[] = [
  'Use the Crystal Detector to find hidden deposits before mining blindly.',
  'Match crystal properties when crafting jewelry for resonance bonuses.',
  'The Sonic Hammer preserves crystal quality better than explosives.',
  'Underground rivers often lead to rare crystal deposits.',
  'Healing crystals restore wellness — keep your physical, mental, spiritual, and emotional stats balanced.',
  'Apply gem cuts before enchantments for maximum power.',
  'Defeated cave creatures sometimes drop legendary crystals.',
  'The Diamond Core has the highest difficulty but the most valuable crystals.',
  'Maintain your streak for increasing daily crystal bonuses.',
  'Combine crystals of the same cave for harmonic resonance bonuses.',
  'Mythic crystals are extremely rare — explore every cave to maximize your chances.',
  'The Transcendent Unity cut is the ultimate achievement for any gem cutter.',
  'Fire enchantment is strong against cave creatures with low defense.',
  'Higher-level caves require better tools — upgrade your equipment regularly.',
  'Nature enchantment grows stronger the more you use it — invest early.',
];

// ---------------------------------------------------------------------------
// State — lazy initialized, no browser API at module level
// ---------------------------------------------------------------------------

let state: CrystalCaveState | null = null;

function generateCaveGrid(): Record<CaveZone, CaveCell[][]> {
  const grids: Record<string, CaveCell[][]> = {};
  const seed = Date.now();
  let rngIdx = 0;
  function rng(): number {
    rngIdx++;
    const x = Math.sin(seed + rngIdx * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }
  for (const cave of CC_CAVES) {
    const grid: CaveCell[][] = [];
    for (let r = 0; r < CAVE_GRID_ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < CAVE_GRID_COLS; c++) {
        const hardness = 20 + rng() * 60 + cave.difficulty * 5;
        const mineralDensity = 10 + rng() * 80;
        const hasCrystal = rng() < (0.3 + cave.difficulty * 0.05);
        const hasCreature = rng() < 0.08;
        const hasRiver = rng() < 0.06;
        let crystalId: string | null = null;
        if (hasCrystal) {
          const pool = cave.crystalPool;
          crystalId = pool[Math.floor(rng() * pool.length)];
        }
        let creatureId: string | null = null;
        if (hasCreature) {
          const creaturesInCave = CC_CREATURES.filter(cr => cr.caveId === cave.id);
          if (creaturesInCave.length > 0) {
            creatureId = creaturesInCave[Math.floor(rng() * creaturesInCave.length)].id;
          }
        }
        let riverId: string | null = null;
        if (hasRiver) {
          const riversInCave = UNDERGROUND_RIVERS_DEF.filter(rv => rv.caveId === cave.id);
          if (riversInCave.length > 0) {
            riverId = riversInCave[Math.floor(rng() * riversInCave.length)].id;
          }
        }
        grid[r][c] = {
          row: r,
          col: c,
          revealed: false,
          mined: false,
          crystalId,
          creatureId,
          riverId,
          hardness: Math.round(hardness),
          mineralDensity: Math.round(mineralDensity),
        };
      }
    }
    grids[cave.id] = grid;
  }
  return grids as Record<CaveZone, CaveCell[][]>;
}

function createInitialState(): CrystalCaveState {
  const rivers: UndergroundRiver[] = UNDERGROUND_RIVERS_DEF.map(rv => ({ ...rv, discovered: false }));
  const achievements: Achievement[] = ACHIEVEMENTS_DEF.map(a => ({ ...a, unlocked: false, unlockedDate: null }));
  const tools: ToolDef[] = CC_TOOLS.map(t => ({ ...t }));
  return {
    initialized: true,
    version: 1,
    level: 1,
    xp: 0,
    totalXP: 0,
    coins: 100,
    activeCave: 'amethyst_cavern',
    caveGrid: generateCaveGrid(),
    crystals: [],
    miningTools: tools,
    equippedTool: 'pickaxe',
    craftedJewelry: [],
    unlockedCuts: ['brilliant', 'emerald_cut', 'cabochon'],
    appliedEnchantments: {},
    encounteredCreatures: [],
    defeatedCreatures: [],
    undergroundRivers: rivers,
    crystalHealing: {
      physicalWellness: 50,
      mentalWellness: 50,
      spiritualWellness: 50,
      emotionalWellness: 50,
      totalHealingSessions: 0,
      favoriteCrystal: null,
    },
    dailyCrystal: null,
    lastDailySeed: 0,
    streak: 0,
    bestStreak: 0,
    lastActiveSeed: 0,
    achievements,
    unlockedAchievements: [],
    stats: {
      totalCrystalsMined: 0,
      totalCellsRevealed: 0,
      totalJewelryCrafted: 0,
      totalCreaturesDefeated: 0,
      totalRiversExplored: 0,
      totalHealingSessions: 0,
      totalCutsApplied: 0,
      totalEnchantmentsApplied: 0,
      highestCrystalRarity: 'Common',
      totalCoinsEarned: 100,
      totalCoinsSpent: 0,
      favoriteCave: 'amethyst_cavern',
      totalResonanceChecks: 0,
      legendaryCrystalsFound: 0,
      mythicCrystalsFound: 0,
      longestExplorationStreak: 0,
    },
    runHistory: [],
  };
}

function ensureInit(): CrystalCaveState {
  if (state) return state;
  state = createInitialState();
  return state;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function xpForLevel(level: number): number {
  return Math.floor(200 * Math.pow(1.12, level - 1));
}

function generateId(): string {
  return 'cc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickRarity(rngFn: () => number): CrystalRarity {
  const roll = rngFn() * 100;
  if (roll < RARITY_WEIGHTS.Common) return 'Common';
  if (roll < RARITY_WEIGHTS.Common + RARITY_WEIGHTS.Rare) return 'Rare';
  if (roll < RARITY_WEIGHTS.Common + RARITY_WEIGHTS.Rare + RARITY_WEIGHTS.Epic) return 'Epic';
  if (roll < RARITY_WEIGHTS.Common + RARITY_WEIGHTS.Rare + RARITY_WEIGHTS.Epic + RARITY_WEIGHTS.Legendary) return 'Legendary';
  return 'Mythic';
}

function crystalDefById(id: string): CrystalDef | undefined {
  return CC_CRYSTALS.find(c => c.id === id);
}

function rarityRank(rarity: CrystalRarity): number {
  const ranks: Record<CrystalRarity, number> = { Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4 };
  return ranks[rarity];
}

function toolById(id: ToolType): ToolDef | undefined {
  return CC_TOOLS.find(t => t.id === id);
}

function getDailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function rarityToCoins(rarity: CrystalRarity, baseValue: number): number {
  return Math.round(baseValue * RARITY_COIN_MULTIPLIER[rarity] * (0.8 + Math.random() * 0.4));
}

function rarityToXP(rarity: CrystalRarity, baseValue: number): number {
  return Math.round((baseValue * 0.5 + 10) * RARITY_XP_MULTIPLIER[rarity]);
}

function updateHighestRarity(s: CrystalCaveState, rarity: CrystalRarity): void {
  if (rarityRank(rarity) > rarityRank(s.stats.highestCrystalRarity as CrystalRarity)) {
    s.stats.highestCrystalRarity = rarity;
  }
  if (rarity === 'Legendary') s.stats.legendaryCrystalsFound++;
  if (rarity === 'Mythic') s.stats.mythicCrystalsFound++;
}

function updateStreak(s: CrystalCaveState): void {
  const todaySeed = getDailySeed();
  if (s.lastActiveSeed === 0) {
    s.streak = 1;
  } else if (todaySeed === s.lastActiveSeed + 1) {
    s.streak++;
  } else if (todaySeed > s.lastActiveSeed + 1) {
    s.streak = 1;
  }
  s.lastActiveSeed = todaySeed;
  if (s.streak > s.bestStreak) {
    s.bestStreak = s.streak;
  }
}

function evaluateCondition(condition: string, s: CrystalCaveState): boolean {
  const st = s.stats;
  switch (condition) {
    case 'totalCrystalsMined >= 1': return st.totalCrystalsMined >= 1;
    case 'cavesExplored >= 8': {
      const cavesExplored = new Set(s.runHistory.map(r => r.caveId));
      return cavesExplored.size >= 8;
    }
    case 'legendaryCrystalsFound >= 1': return st.legendaryCrystalsFound >= 1;
    case 'mythicCrystalsFound >= 1': return st.mythicCrystalsFound >= 1;
    case 'totalJewelryCrafted >= 1': return st.totalJewelryCrafted >= 1;
    case 'totalJewelryCrafted >= 10': return st.totalJewelryCrafted >= 10;
    case 'totalCreaturesDefeated >= 8': return st.totalCreaturesDefeated >= 8;
    case 'totalRiversExplored >= 5': return st.totalRiversExplored >= 5;
    case 'totalHealingSessions >= 20': return st.totalHealingSessions >= 20;
    case 'totalCutsApplied >= 15': return st.totalCutsApplied >= 15;
    case 'totalEnchantmentsApplied >= 5': return st.totalEnchantmentsApplied >= 5;
    case 'streak >= 7': return s.streak >= 7;
    case 'streak >= 30': return s.streak >= 30;
    case 'level >= 40': return s.level >= MAX_LEVEL;
    case 'totalCoinsEarned >= 50000': return st.totalCoinsEarned >= 50000;
    default: return false;
  }
}

// ---------------------------------------------------------------------------
// Exported: State & Init
// ---------------------------------------------------------------------------

export function ccGetState(): CrystalCaveState {
  return ensureInit();
}

export function ccResetState(): void {
  state = null;
}

// ---------------------------------------------------------------------------
// Exported: Level & XP
// ---------------------------------------------------------------------------

export function ccGetLevel(): number {
  return ensureInit().level;
}

export function ccAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  s.xp += amount;
  s.totalXP += amount;
  let leveledUp = false;
  while (s.level < MAX_LEVEL && s.xp >= xpForLevel(s.level)) {
    s.xp -= xpForLevel(s.level);
    s.level++;
    leveledUp = true;
  }
  return { leveledUp, newLevel: s.level };
}

export function ccGetXPProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  const needed = xpForLevel(s.level);
  return { current: s.xp, needed, percentage: needed > 0 ? Math.round((s.xp / needed) * 100) : 100 };
}

export function ccGetTitle(): string {
  const s = ensureInit();
  return LEVEL_TITLES[s.level] || 'Master Gemologist';
}

// ---------------------------------------------------------------------------
// Exported: Coins
// ---------------------------------------------------------------------------

export function ccGetCoins(): number {
  return ensureInit().coins;
}

export function ccSpendCoins(amount: number): { success: boolean; remaining: number } {
  const s = ensureInit();
  if (s.coins < amount) return { success: false, remaining: s.coins };
  s.coins -= amount;
  s.stats.totalCoinsSpent += amount;
  return { success: true, remaining: s.coins };
}

// ---------------------------------------------------------------------------
// Exported: Caves
// ---------------------------------------------------------------------------

export function ccGetCaves(): CaveDef[] {
  return CC_CAVES.map(c => ({ ...c, unlocked: ensureInit().miningTools.length >= 0 ? c.unlockCost === 0 || isCaveUnlocked(c.id) : c.unlocked }));
}

function isCaveUnlocked(caveId: CaveZone): boolean {
  const cave = CC_CAVES.find(c => c.id === caveId);
  if (!cave) return false;
  if (cave.unlockCost === 0) return true;
  const s = ensureInit();
  const history = s.runHistory;
  const coins = s.stats.totalCoinsSpent;
  return coins >= cave.unlockCost * 0.5 || s.level >= cave.difficulty * 5;
}

export function ccGetActiveCave(): CaveDef | null {
  const s = ensureInit();
  return CC_CAVES.find(c => c.id === s.activeCave) || null;
}

export function ccSetActiveCave(caveId: string): void {
  const s = ensureInit();
  const cave = CC_CAVES.find(c => c.id === caveId);
  if (cave) {
    s.activeCave = cave.id;
    s.stats.favoriteCave = caveId;
  }
}

export function ccGetCaveGrid(): CaveCell[][] {
  const s = ensureInit();
  return s.caveGrid[s.activeCave] || [];
}

// ---------------------------------------------------------------------------
// Exported: Mining
// ---------------------------------------------------------------------------

export function ccMineCell(row: number, col: number): MiningResult {
  const s = ensureInit();
  const grid = s.caveGrid[s.activeCave];
  if (!grid || row < 0 || row >= CAVE_GRID_ROWS || col < 0 || col >= CAVE_GRID_COLS) {
    return { success: false, crystal: null, creature: null, xpGained: 0, coinsGained: 0, toolDamage: 0, message: 'Invalid cell coordinates.' };
  }
  const cell = grid[row][col];
  if (cell.mined) {
    return { success: false, crystal: null, creature: null, xpGained: 0, coinsGained: 0, toolDamage: 0, message: 'This cell has already been mined.' };
  }
  cell.revealed = true;
  cell.mined = true;
  s.stats.totalCellsRevealed++;
  updateStreak(s);

  const tool = s.miningTools.find(t => t.id === s.equippedTool);
  const power = tool ? tool.power + tool.level * 8 : 30;
  const toolDamage = Math.round(cell.hardness * 0.1);

  if (tool) {
    tool.durability = Math.max(0, tool.durability - toolDamage);
  }

  let crystal: InventoryCrystal | null = null;
  let creature: CreatureDef | null = null;
  let xpGained = 5;
  let coinsGained = 2;
  let message = 'Mined the rock but found nothing interesting.';

  if (cell.creatureId) {
    creature = CC_CREATURES.find(cr => cr.id === cell.creatureId) || null;
    if (creature) {
      if (!s.encounteredCreatures.includes(creature.id)) {
        s.encounteredCreatures.push(creature.id);
      }
      const damage = power - creature.defense * 0.3;
      if (damage > creature.hp * 0.5 && power > 30) {
        creature.defeated = true;
        creature.hp = 0;
        if (!s.defeatedCreatures.includes(creature.id)) {
          s.defeatedCreatures.push(creature.id);
          s.stats.totalCreaturesDefeated++;
        }
        xpGained += creature.xpReward;
        coinsGained += creature.coinReward;
        s.stats.totalCoinsEarned += creature.coinReward;
        s.coins += creature.coinReward;
        message = `Defeated the ${creature.name}! Earned ${creature.xpReward} XP and ${creature.coinReward} coins.`;
        const rng = Math.random;
        if (rng() < 0.3) {
          const caveCrystals = CC_CRYSTALS.filter(cr => cr.caveId === s.activeCave);
          const dropPool = caveCrystals.filter(cr => rarityRank(cr.rarity) >= rarityRank(creature.weakness));
          if (dropPool.length > 0) {
            const dropDef = dropPool[Math.floor(rng() * dropPool.length)];
            crystal = createInventoryCrystal(dropDef);
            s.crystals.push(crystal);
            s.stats.totalCrystalsMined++;
            updateHighestRarity(s, dropDef.rarity);
            message += ` The creature dropped a ${dropDef.name}!`;
          }
        }
      } else {
        message = `Encountered a ${creature.name}! Your tool is not powerful enough to defeat it (need more power).`;
      }
    }
  }

  if (cell.crystalId && !creature) {
    const def = crystalDefById(cell.crystalId);
    if (def && power >= cell.hardness * 0.3) {
      crystal = createInventoryCrystal(def);
      s.crystals.push(crystal);
      s.stats.totalCrystalsMined++;
      updateHighestRarity(s, def.rarity);
      xpGained += rarityToXP(def.rarity, def.baseValue);
      coinsGained += rarityToCoins(def.rarity, def.baseValue);
      s.stats.totalCoinsEarned += coinsGained;
      s.coins += coinsGained;
      message = `Found a ${def.rarity} ${def.name}! +${xpGained} XP, +${coinsGained} coins.`;
    } else if (def) {
      message = 'The crystal was too fragile and shattered during mining. Try a more precise tool.';
    }
  }

  if (cell.riverId && !creature && !crystal) {
    const river = s.undergroundRivers.find(rv => rv.id === cell.riverId);
    if (river && !river.discovered) {
      river.discovered = true;
      message = `Discovered the ${river.name} underground river! Use ccExploreRiver to navigate it.`;
      xpGained += 20;
    }
  }

  const levelResult = ccAddXP(xpGained);
  if (levelResult.leveledUp) {
    message += ` LEVEL UP! Now level ${levelResult.newLevel}!`;
  }

  return { success: true, crystal, creature, xpGained, coinsGained, toolDamage, message };
}

function createInventoryCrystal(def: CrystalDef): InventoryCrystal {
  return {
    ...def,
    instanceId: generateId(),
    quantity: 1,
    acquiredAt: Date.now(),
    cutApplied: null,
    enchantmentApplied: null,
    resonanceBoost: 0,
  };
}

export function ccRevealArea(row: number, col: number, radius: number): CaveCell[] {
  const s = ensureInit();
  const grid = s.caveGrid[s.activeCave];
  if (!grid) return [];
  const revealed: CaveCell[] = [];
  for (let r = Math.max(0, row - radius); r <= Math.min(CAVE_GRID_ROWS - 1, row + radius); r++) {
    for (let c = Math.max(0, col - radius); c <= Math.min(CAVE_GRID_COLS - 1, col + radius); c++) {
      if (!grid[r][c].revealed) {
        grid[r][c].revealed = true;
        s.stats.totalCellsRevealed++;
        revealed.push(grid[r][c]);
      }
    }
  }
  return revealed;
}

// ---------------------------------------------------------------------------
// Exported: Crystals
// ---------------------------------------------------------------------------

export function ccGetCrystals(): CrystalDef[] {
  return CC_CRYSTALS;
}

export function ccGetCrystalsByCave(caveId: string): CrystalDef[] {
  return CC_CRYSTALS.filter(c => c.caveId === caveId);
}

export function ccGetInventory(): InventoryCrystal[] {
  return ensureInit().crystals;
}

// ---------------------------------------------------------------------------
// Exported: Mining Tools
// ---------------------------------------------------------------------------

export function ccGetMiningTools(): ToolDef[] {
  return ensureInit().miningTools;
}

export function ccPurchaseTool(toolId: string): { success: boolean; cost: number } {
  const s = ensureInit();
  const toolDef = CC_TOOLS.find(t => t.id === toolId);
  if (!toolDef) return { success: false, cost: 0 };
  const owned = s.miningTools.find(t => t.id === toolId);
  if (owned) return { success: false, cost: 0 };
  if (s.coins < toolDef.cost) return { success: false, cost: toolDef.cost };
  s.coins -= toolDef.cost;
  s.stats.totalCoinsSpent += toolDef.cost;
  s.miningTools.push({ ...toolDef });
  return { success: true, cost: toolDef.cost };
}

export function ccEquipTool(toolId: string): void {
  const s = ensureInit();
  const tool = s.miningTools.find(t => t.id === toolId);
  if (tool && tool.durability > 0) {
    s.equippedTool = tool.id as ToolType;
  }
}

// ---------------------------------------------------------------------------
// Exported: Jewelry Crafting
// ---------------------------------------------------------------------------

export function ccGetJewelryTypes(): JewelryTypeDef[] {
  return CC_JEWELRY_TYPES;
}

export function ccCraftJewelry(jewelryTypeId: string, crystalIds: string[]): CraftResult {
  const s = ensureInit();
  const jType = CC_JEWELRY_TYPES.find(j => j.id === jewelryTypeId);
  if (!jType) return { success: false, jewelry: null, message: 'Invalid jewelry type.', xpGained: 0 };
  if (s.level < jType.requiredLevel) return { success: false, jewelry: null, message: `Requires level ${jType.requiredLevel}.`, xpGained: 0 };
  if (crystalIds.length > jType.slots) return { success: false, jewelry: null, message: `Too many crystals. Max ${jType.slots} slots.`, xpGained: 0 };
  if (crystalIds.length < 1) return { success: false, jewelry: null, message: 'At least one crystal is required.', xpGained: 0 };

  const crystals: InventoryCrystal[] = [];
  for (const cId of crystalIds) {
    const invCrystal = s.crystals.find(c => c.instanceId === cId);
    if (!invCrystal) return { success: false, jewelry: null, message: `Crystal ${cId} not found in inventory.`, xpGained: 0 };
    crystals.push(invCrystal);
  }

  let totalPower = jType.basePower;
  for (const c of crystals) {
    totalPower += c.baseValue * 0.01;
    totalPower += c.properties.Clarity * 0.1;
    totalPower += c.properties.Luminescence * 0.1;
    if (c.cutApplied) {
      const cut = CC_GEM_CUTS.find(gc => gc.id === c.cutApplied);
      if (cut) totalPower += cut.bonusAmount;
    }
    if (c.enchantmentApplied) {
      const ench = CC_ENCHANTMENTS.find(e => e.id === c.enchantmentApplied);
      if (ench) totalPower += ench.powerBonus;
    }
  }

  // Resonance bonus for matching cave crystals
  const caveCount = new Map<string, number>();
  for (const c of crystals) {
    const count = caveCount.get(c.caveId) || 0;
    caveCount.set(c.caveId, count + 1);
  }
  caveCount.forEach((count) => {
    if (count >= 2) totalPower *= 1.15;
    if (count >= 3) totalPower *= 1.1;
  });

  totalPower = Math.round(totalPower);

  const jewelry: CraftedJewelry = {
    id: generateId(),
    typeId: jewelryTypeId,
    name: `${jType.name} of ${crystals[0].name.split(' ')[0]}`,
    category: jType.category,
    crystals: crystalIds,
    enchantment: null,
    power: totalPower,
    createdAt: Date.now(),
  };

  // Remove crystals from inventory
  s.crystals = s.crystals.filter(c => !crystalIds.includes(c.instanceId));
  s.craftedJewelry.push(jewelry);
  s.stats.totalJewelryCrafted++;

  const xpGained = Math.round(totalPower * 0.5 + jType.slots * 10);
  ccAddXP(xpGained);
  updateStreak(s);

  return { success: true, jewelry, message: `Crafted a ${jewelry.name} with power ${totalPower}!`, xpGained };
}

export function ccGetCraftedJewelry(): CraftedJewelry[] {
  return ensureInit().craftedJewelry;
}

// ---------------------------------------------------------------------------
// Exported: Gem Cuts
// ---------------------------------------------------------------------------

export function ccGetGemCuts(): GemCutDef[] {
  return CC_GEM_CUTS;
}

export function ccGetUnlockedCuts(): string[] {
  return ensureInit().unlockedCuts;
}

export function ccUnlockCut(cutId: string): { success: boolean; cost: number } {
  const s = ensureInit();
  const cutDef = CC_GEM_CUTS.find(c => c.id === cutId);
  if (!cutDef) return { success: false, cost: 0 };
  if (s.unlockedCuts.includes(cutId)) return { success: false, cost: 0 };
  if (s.level < cutDef.requiredLevel) return { success: false, cost: cutDef.cost };
  if (s.coins < cutDef.cost) return { success: false, cost: cutDef.cost };
  s.coins -= cutDef.cost;
  s.stats.totalCoinsSpent += cutDef.cost;
  s.unlockedCuts.push(cutId);
  return { success: true, cost: cutDef.cost };
}

export function ccApplyCut(crystalId: string, cutId: string): CutResult {
  const s = ensureInit();
  const crystal = s.crystals.find(c => c.instanceId === crystalId);
  if (!crystal) return { success: false, crystal: null, message: 'Crystal not found in inventory.' };
  if (crystal.cutApplied) return { success: false, crystal: null, message: 'This crystal already has a cut applied.' };
  const cutDef = CC_GEM_CUTS.find(c => c.id === cutId);
  if (!cutDef) return { success: false, crystal: null, message: 'Invalid gem cut.' };
  if (!s.unlockedCuts.includes(cutId)) return { success: false, crystal: null, message: 'This gem cut is not unlocked yet.' };

  crystal.cutApplied = cutId;
  crystal.properties[cutDef.bonusProperty] = clamp(
    crystal.properties[cutDef.bonusProperty] + cutDef.bonusAmount,
    0,
    100
  );
  crystal.baseValue = Math.round(crystal.baseValue * 1.3);
  s.stats.totalCutsApplied++;

  ccAddXP(25);
  return {
    success: true,
    crystal: { ...crystal },
    message: `Applied ${cutDef.name} cut to ${crystal.name}. ${cutDef.bonusProperty} +${cutDef.bonusAmount}.`,
  };
}

// ---------------------------------------------------------------------------
// Exported: Enchantments
// ---------------------------------------------------------------------------

export function ccGetEnchantments(): EnchantmentDef[] {
  return CC_ENCHANTMENTS;
}

export function ccApplyEnchantment(jewelryId: string, enchantmentId: string): EnchantResult {
  const s = ensureInit();
  const jewelry = s.craftedJewelry.find(j => j.id === jewelryId);
  if (!jewelry) return { success: false, jewelry: null, message: 'Jewelry not found.' };
  if (jewelry.enchantment) return { success: false, jewelry: null, message: 'This jewelry already has an enchantment.' };
  const enchDef = CC_ENCHANTMENTS.find(e => e.id === enchantmentId);
  if (!enchDef) return { success: false, jewelry: null, message: 'Invalid enchantment.' };
  if (s.coins < enchDef.cost) return { success: false, jewelry: null, message: `Not enough coins. Need ${enchDef.cost}.` };

  s.coins -= enchDef.cost;
  s.stats.totalCoinsSpent += enchDef.cost;
  jewelry.enchantment = enchantmentId;
  jewelry.power += enchDef.powerBonus;
  s.appliedEnchantments[jewelryId] = enchantmentId as EnchantmentElement;
  s.stats.totalEnchantmentsApplied++;

  ccAddXP(40);
  return {
    success: true,
    jewelry: { ...jewelry },
    message: `Applied ${enchDef.name} enchantment to ${jewelry.name}. Power +${enchDef.powerBonus}. Special: ${enchDef.specialEffect}.`,
  };
}

// ---------------------------------------------------------------------------
// Exported: Crystal Resonance
// ---------------------------------------------------------------------------

export function ccGetCrystalResonance(crystalIds: string[]): ResonanceResult {
  const s = ensureInit();
  s.stats.totalResonanceChecks++;
  updateStreak(s);

  if (crystalIds.length < 2) {
    return { tier: 'None', bonusPower: 0, description: 'At least two crystals are needed for resonance.', matchingProperties: [] };
  }

  const crystals: InventoryCrystal[] = [];
  for (const cId of crystalIds) {
    const c = s.crystals.find(inv => inv.instanceId === cId);
    if (c) crystals.push(c);
  }

  if (crystals.length < 2) {
    return { tier: 'None', bonusPower: 0, description: 'Not enough valid crystals found.', matchingProperties: [] };
  }

  const properties: CrystalProperty[] = ['Clarity', 'Color Depth', 'Cut Quality', 'Carat Weight', 'Luminescence'];
  const matchingProperties: CrystalProperty[] = [];
  let resonanceScore = 0;

  // Check for matching cave origins
  const caveSet = new Set(crystals.map(c => c.caveId));
  if (caveSet.size === 1) resonanceScore += 20;
  else if (caveSet.size === 2) resonanceScore += 10;

  // Check for matching rarity
  const raritySet = new Set(crystals.map(c => c.rarity));
  if (raritySet.size === 1) resonanceScore += 15;

  // Check for matching property levels (within 10 points)
  for (const prop of properties) {
    const values = crystals.map(c => c.properties[prop]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const allClose = values.every(v => Math.abs(v - avg) <= 10);
    if (allClose && avg >= 60) {
      matchingProperties.push(prop);
      resonanceScore += 12;
    }
  }

  // Check for complementary healing categories
  const healingSet = new Set(crystals.map(c => c.healingCategory));
  if (healingSet.size >= 3) resonanceScore += 25;
  if (healingSet.size === 4) resonanceScore += 15;

  // Determine tier
  let tier: ResonanceTier;
  let bonusPower: number;
  let description: string;

  if (resonanceScore >= 80) {
    tier = 'Transcendent';
    bonusPower = 50;
    description = 'Transcendent Resonance! The crystals harmonize across all dimensions, creating a singularity of power.';
  } else if (resonanceScore >= 55) {
    tier = 'Prismatic';
    bonusPower = 30;
    description = 'Prismatic Resonance! The crystals refract light into pure energy, multiplying their individual strengths.';
  } else if (resonanceScore >= 35) {
    tier = 'Resonant';
    bonusPower = 15;
    description = 'Resonant harmony detected. The crystals amplify each other\'s natural frequencies.';
  } else if (resonanceScore >= 15) {
    tier = 'Harmonic';
    bonusPower = 5;
    description = 'A mild harmonic vibration passes between the crystals. Some synergy exists.';
  } else {
    tier = 'None';
    bonusPower = 0;
    description = 'No measurable resonance between these crystals. Try combining crystals with similar properties.';
  }

  ccAddXP(Math.round(resonanceScore * 0.3));
  return { tier, bonusPower, description, matchingProperties };
}

// ---------------------------------------------------------------------------
// Exported: Underground Rivers
// ---------------------------------------------------------------------------

export function ccGetRivers(): UndergroundRiver[] {
  return ensureInit().undergroundRivers;
}

export function ccExploreRiver(riverId: string): RiverResult {
  const s = ensureInit();
  const river = s.undergroundRivers.find(rv => rv.id === riverId);
  if (!river) return { success: false, crystalsFound: [], xpGained: 0, message: 'River not found.' };
  if (!river.discovered) return { success: false, crystalsFound: [], xpGained: 0, message: 'This river has not been discovered yet. Mine cells to find it.' };
  if (s.level < river.difficulty * 4) return { success: false, crystalsFound: [], xpGained: 0, message: `Too dangerous. Requires level ${river.difficulty * 4}.` };

  const crystalsFound: InventoryCrystal[] = [];
  const rng = () => Math.random();
  const numCrystals = Math.min(river.crystalDeposits.length, 1 + Math.floor(rng() * river.length * 0.2));

  for (let i = 0; i < numCrystals; i++) {
    const defId = river.crystalDeposits[Math.floor(rng() * river.crystalDeposits.length)];
    const def = crystalDefById(defId);
    if (def) {
      // River crystals have boosted properties
      const boosted = createInventoryCrystal(def);
      boosted.properties.Luminescence = clamp(boosted.properties.Luminescence + 10, 0, 100);
      boosted.properties.Clarity = clamp(boosted.properties.Clarity + 5, 0, 100);
      boosted.baseValue = Math.round(boosted.baseValue * 1.2);
      crystalsFound.push(boosted);
      s.crystals.push(boosted);
      s.stats.totalCrystalsMined++;
      updateHighestRarity(s, def.rarity);
    }
  }

  s.stats.totalRiversExplored++;
  river.discovered = false; // Can be found again via mining for re-exploration

  const xpGained = river.length * 3 + river.difficulty * 20;
  ccAddXP(xpGained);
  updateStreak(s);

  return {
    success: true,
    crystalsFound,
    xpGained,
    message: `Explored ${river.name} and found ${crystalsFound.length} crystal${crystalsFound.length !== 1 ? 's' : ''}! +${xpGained} XP.`,
  };
}

// ---------------------------------------------------------------------------
// Exported: Creatures
// ---------------------------------------------------------------------------

export function ccGetCreatures(): CreatureDef[] {
  return CC_CREATURES;
}

export function ccEncounterCreature(creatureId: string): EncounterResult {
  const s = ensureInit();
  const creatureDef = CC_CREATURES.find(cr => cr.id === creatureId);
  if (!creatureDef) return { success: false, defeated: false, xpGained: 0, coinsGained: 0, crystalDrop: null, message: 'Creature not found.' };

  if (!s.encounteredCreatures.includes(creatureDef.id)) {
    s.encounteredCreatures.push(creatureDef.id);
  }

  const tool = s.miningTools.find(t => t.id === s.equippedTool);
  const playerPower = (tool ? tool.power + tool.level * 8 : 30) + s.level * 3;
  const creature = { ...creatureDef, hp: creatureDef.maxHp, defeated: false };
  const damage = Math.max(1, playerPower - creature.defense * 0.4);
  const defeated = damage >= creature.hp * 0.4;

  let crystalDrop: InventoryCrystal | null = null;
  let xpGained = 0;
  let coinsGained = 0;

  if (defeated) {
    creature.defeated = true;
    creature.hp = 0;
    if (!s.defeatedCreatures.includes(creatureDef.id)) {
      s.defeatedCreatures.push(creatureDef.id);
      s.stats.totalCreaturesDefeated++;
    }
    xpGained = creatureDef.xpReward;
    coinsGained = creatureDef.coinReward;
    s.stats.totalCoinsEarned += coinsGained;
    s.coins += coinsGained;

    if (Math.random() < 0.25) {
      const caveCrystals = CC_CRYSTALS.filter(c => c.caveId === creatureDef.caveId);
      const dropPool = caveCrystals.filter(c => rarityRank(c.rarity) >= rarityRank(creatureDef.weakness));
      if (dropPool.length > 0) {
        const dropDef = dropPool[Math.floor(Math.random() * dropPool.length)];
        crystalDrop = createInventoryCrystal(dropDef);
        s.crystals.push(crystalDrop);
        s.stats.totalCrystalsMined++;
        updateHighestRarity(s, dropDef.rarity);
      }
    }
  }

  ccAddXP(xpGained);
  updateStreak(s);

  return {
    success: true,
    defeated,
    xpGained,
    coinsGained,
    crystalDrop,
    message: defeated
      ? `Defeated the ${creatureDef.name}! +${xpGained} XP, +${coinsGained} coins.${crystalDrop ? ` Dropped: ${crystalDrop.name}.` : ''}`
      : `The ${creatureDef.name} withstands your attack. You need more power! (dealt ${Math.round(damage)} damage, ${creatureDef.hp} HP remaining)`,
  };
}

// ---------------------------------------------------------------------------
// Exported: Crystal Healing
// ---------------------------------------------------------------------------

export function ccGetCrystalHealing(): HealingState {
  return ensureInit().crystalHealing;
}

export function ccPerformHealing(crystalId: string): HealingResult {
  const s = ensureInit();
  const crystal = s.crystals.find(c => c.instanceId === crystalId);
  if (!crystal) return { success: false, healingAmount: 0, category: crystal?.healingCategory || 'Physical', message: 'Crystal not found in inventory.' };

  const baseHeal = crystal.healingPower;
  const luminescenceBonus = crystal.properties.Luminescence * 0.1;
  const cutBonus = crystal.cutApplied ? 5 : 0;
  const resonanceBonus = crystal.resonanceBoost;
  const totalHeal = Math.round(baseHeal + luminescenceBonus + cutBonus + resonanceBonus);

  const healing = s.crystalHealing;
  const category = crystal.healingCategory;
  const multiplier = 1 + (crystal.properties['Color Depth'] / 200);
  const adjustedHeal = Math.round(totalHeal * multiplier);

  switch (category) {
    case 'Physical':
      healing.physicalWellness = clamp(healing.physicalWellness + adjustedHeal, 0, 100);
      break;
    case 'Mental':
      healing.mentalWellness = clamp(healing.mentalWellness + adjustedHeal, 0, 100);
      break;
    case 'Spiritual':
      healing.spiritualWellness = clamp(healing.spiritualWellness + adjustedHeal, 0, 100);
      break;
    case 'Emotional':
      healing.emotionalWellness = clamp(healing.emotionalWellness + adjustedHeal, 0, 100);
      break;
  }

  healing.totalHealingSessions++;
  if (!healing.favoriteCrystal || Math.random() < 0.3) {
    healing.favoriteCrystal = crystal.instanceId;
  }

  s.stats.totalHealingSessions++;

  // Small XP bonus for healing
  ccAddXP(10);
  updateStreak(s);

  return {
    success: true,
    healingAmount: adjustedHeal,
    category,
    message: `${crystal.name} restored ${adjustedHeal} ${category.toLowerCase()} wellness (${category} is now at ${getWellnessForCategory(healing, category)}%).`,
  };
}

function getWellnessForCategory(healing: HealingState, category: HealingCategory): number {
  switch (category) {
    case 'Physical': return healing.physicalWellness;
    case 'Mental': return healing.mentalWellness;
    case 'Spiritual': return healing.spiritualWellness;
    case 'Emotional': return healing.emotionalWellness;
  }
}

// ---------------------------------------------------------------------------
// Exported: Daily Crystal
// ---------------------------------------------------------------------------

export function ccGetDailyCrystal(): DailyCrystal | null {
  const s = ensureInit();
  const todaySeed = getDailySeed();
  if (s.dailyCrystal && s.dailyCrystal.dateSeed === todaySeed) {
    return s.dailyCrystal;
  }
  // Generate new daily crystal
  const rng = () => seededRandom(todaySeed);
  const crystalIndex = Math.floor(rng() * CC_CRYSTALS.length);
  const crystal = CC_CRYSTALS[crystalIndex];
  const bonusTypes: ('xp' | 'coins' | 'healing' | 'luck')[] = ['xp', 'coins', 'healing', 'luck'];
  const bonusType = bonusTypes[Math.floor(rng() * bonusTypes.length)];
  const bonusMultiplier = 1.5 + rng() * 2;

  s.dailyCrystal = {
    id: generateId(),
    crystalId: crystal.id,
    bonusMultiplier: Math.round(bonusMultiplier * 100) / 100,
    bonusType,
    dateSeed: todaySeed,
    collected: false,
  };
  return s.dailyCrystal;
}

export function ccCollectDailyCrystal(): CollectionResult {
  const s = ensureInit();
  const daily = ccGetDailyCrystal();
  if (!daily) return { success: false, crystal: null, xpGained: 0, coinsGained: 0, message: 'No daily crystal available.' };
  if (daily.collected) return { success: false, crystal: null, xpGained: 0, coinsGained: 0, message: 'Already collected today\'s daily crystal.' };

  daily.collected = true;
  s.lastDailySeed = getDailySeed();
  updateStreak(s);

  const def = crystalDefById(daily.crystalId);
  if (!def) return { success: false, crystal: null, xpGained: 0, coinsGained: 0, message: 'Daily crystal definition not found.' };

  const crystal = createInventoryCrystal(def);

  // Apply bonus
  let xpGained = 0;
  let coinsGained = 0;
  switch (daily.bonusType) {
    case 'xp':
      xpGained = Math.round(rarityToXP(def.rarity, def.baseValue) * daily.bonusMultiplier);
      break;
    case 'coins':
      coinsGained = Math.round(rarityToCoins(def.rarity, def.baseValue) * daily.bonusMultiplier);
      break;
    case 'healing':
      crystal.healingPower = Math.round(crystal.healingPower * daily.bonusMultiplier);
      break;
    case 'luck':
      crystal.properties.Luminescence = clamp(Math.round(crystal.properties.Luminescence * daily.bonusMultiplier), 0, 100);
      break;
  }

  s.crystals.push(crystal);
  s.stats.totalCrystalsMined++;
  updateHighestRarity(s, def.rarity);
  s.stats.totalCoinsEarned += coinsGained;
  s.coins += coinsGained;
  ccAddXP(xpGained + 50);

  return {
    success: true,
    crystal,
    xpGained: xpGained + 50,
    coinsGained,
    message: `Collected daily ${def.name}! ${daily.bonusType} bonus x${daily.bonusMultiplier.toFixed(2)}. Streak: ${s.streak} days.`,
  };
}

// ---------------------------------------------------------------------------
// Exported: Streak
// ---------------------------------------------------------------------------

export function ccGetStreak(): number {
  return ensureInit().streak;
}

export function ccGetBestStreak(): number {
  return ensureInit().bestStreak;
}

// ---------------------------------------------------------------------------
// Exported: Stats
// ---------------------------------------------------------------------------

export function ccGetStats(): CaveStats {
  return ensureInit().stats;
}

// ---------------------------------------------------------------------------
// Exported: Achievements
// ---------------------------------------------------------------------------

export function ccGetAchievements(): Achievement[] {
  return ensureInit().achievements;
}

export function ccCheckAchievements(): Achievement[] {
  const s = ensureInit();
  const newlyUnlocked: Achievement[] = [];
  for (const ach of s.achievements) {
    if (!ach.unlocked && evaluateCondition(ach.condition, s)) {
      ach.unlocked = true;
      ach.unlockedDate = Date.now();
      s.unlockedAchievements.push(ach.id);
      s.coins += ach.reward.coins;
      s.stats.totalCoinsEarned += ach.reward.coins;
      ccAddXP(ach.reward.xp);
      newlyUnlocked.push(ach);
    }
  }
  return newlyUnlocked;
}

export function ccGetUnlockedAchievements(): Achievement[] {
  const s = ensureInit();
  return s.achievements.filter(a => a.unlocked);
}

export function ccIsAchievementUnlocked(id: string): boolean {
  const s = ensureInit();
  return s.unlockedAchievements.includes(id);
}

// ---------------------------------------------------------------------------
// Exported: Hint
// ---------------------------------------------------------------------------

export function ccGetHint(): string {
  const idx = Math.floor(Math.random() * HINTS.length);
  return HINTS[idx];
}
