// ============================================================================
// Candy Kingdom Wire — Candy Collection & Kingdom Management Mini-Game
// SSR-safe: no localStorage, no window/document, no setInterval/addEventListener.
// All exported functions use `cn` prefix, all constants use `CN_` prefix.
// Uses React hooks internally (useState, useCallback, useRef).
// Color theme: pink / purple / rose tones
// ============================================================================

import { useState, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CnRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type CnCandyCategory = 'gummy' | 'hard' | 'chocolate' | 'chewy' | 'fizzy' | 'frozen' | 'premium';
export type CnShopType = 'bakery' | 'factory' | 'specialty' | 'premium' | 'garden' | 'wonder';
export type CnRecipeDifficulty = 'easy' | 'medium' | 'hard' | 'master' | 'legendary';
export type CnDecorationZone = 'entrance' | 'garden' | 'main_hall' | 'tower' | 'courtyard' | 'throne';
export type CnSugarRushType = 'speed_bake' | 'candy_rain' | 'golden_touch' | 'frost_bloom' | 'sugar_storm';
export type CnQuestType = 'bake' | 'collect' | 'decorate' | 'shop' | 'eat' | 'rush';
export type CnDailyType = 'bake' | 'collect' | 'earn' | 'eat' | 'shop' | 'decorate';

export interface CnCandyDef {
  id: string;
  name: string;
  category: CnCandyCategory;
  rarity: CnRarity;
  sweetness: number;
  value: number;
  description: string;
  emoji: string;
  color: string;
}

export interface CnShopDef {
  id: string;
  name: string;
  shopType: CnShopType;
  description: string;
  emoji: string;
  unlockLevel: number;
  unlockCost: number;
  coinMultiplier: number;
  xpBonus: number;
  color: string;
  specialties: string[];
}

export interface CnIngredientDef {
  id: string;
  name: string;
  rarity: CnRarity;
  cost: number;
  description: string;
  emoji: string;
  color: string;
}

export interface CnRecipeDef {
  id: string;
  name: string;
  difficulty: CnRecipeDifficulty;
  ingredients: { ingredientId: string; amount: number }[];
  bakeTime: number;
  sellPrice: number;
  xpReward: number;
  candyReward: { candyId: string; amount: number }[];
  description: string;
  emoji: string;
  requiredLevel: number;
  color: string;
}

export interface CnDecorationDef {
  id: string;
  name: string;
  zone: CnDecorationZone;
  rarity: CnRarity;
  cost: number;
  happinessBonus: number;
  description: string;
  emoji: string;
  color: string;
}

export interface CnAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  icon: string;
}

export interface CnTitleThreshold {
  minLevel: number;
  title: string;
  description: string;
}

export interface CnSugarRushDef {
  id: string;
  name: string;
  rushType: CnSugarRushType;
  duration: number;
  cooldown: number;
  multiplier: number;
  description: string;
  requiredLevel: number;
  emoji: string;
  color: string;
}

export interface CnNpcDef {
  id: string;
  name: string;
  role: string;
  description: string;
  emoji: string;
  greeting: string;
  shopId: string | null;
}

export interface CnQuestDef {
  id: string;
  name: string;
  description: string;
  type: CnQuestType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  requiredLevel: number;
  emoji: string;
}

export interface CnDailyTaskPoolDef {
  id: string;
  name: string;
  description: string;
  type: CnDailyType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface CnCandyInstance {
  candyId: string;
  count: number;
}

export interface CnShopState {
  shopId: string;
  unlocked: boolean;
  level: number;
  dailyEarnings: number;
}

export interface CnRecipeState {
  recipeId: string;
  unlocked: boolean;
  timesBaked: number;
  mastered: boolean;
}

export interface CnDecorationState {
  decorationId: string;
  placed: boolean;
  zone: CnDecorationZone | null;
}

export interface CnAchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface CnSugarRushState {
  rushId: string;
  unlocked: boolean;
  lastUsed: number;
  timesUsed: number;
}

export interface CnQuestState {
  questId: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
  claimed: boolean;
}

export interface CnNpcState {
  npcId: string;
  met: boolean;
  timesVisited: number;
}

export interface CnDailyData {
  dateSeed: string;
  candiesBakedToday: number;
  coinsEarnedToday: number;
  rewardClaimed: boolean;
  dailyQuestProgress: number;
  dailyQuestTarget: number;
}

export interface CnStats {
  totalCandiesBaked: number;
  totalCandiesEaten: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalXPEarned: number;
  totalSugarRushes: number;
  totalDecorationsPlaced: number;
  totalRecipesMastered: number;
  totalShopVisits: number;
  highestCombo: number;
  longestStreak: number;
}

export interface CandyKingdomState {
  level: number;
  xp: number;
  totalXp: number;
  coins: number;
  candies: CnCandyInstance[];
  shops: CnShopState[];
  recipes: CnRecipeState[];
  decorations: CnDecorationState[];
  achievements: CnAchievementState[];
  sugarRushes: CnSugarRushState[];
  quests: CnQuestState[];
  npcs: CnNpcState[];
  title: string;
  dailyBaked: number;
  dailyDate: string | null;
  totalBaked: number;
  totalEaten: number;
  sugarRushActive: CnSugarRushType | null;
  sugarRushEndTime: number;
  streak: number;
  lastPlayDate: string | null;
  daily: CnDailyData;
  stats: CnStats;
  seed: number;
}

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32 — no Math.random)
// ---------------------------------------------------------------------------

function cnMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function cnXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= CN_MAX_LEVEL) return Infinity;
  return Math.floor(80 * level * (1 + level * 0.15));
}

function cnClampLevel(lvl: number): number {
  return Math.max(1, Math.min(CN_MAX_LEVEL, lvl));
}

function cnClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function cnGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function cnRarityMultiplier(r: CnRarity): number {
  const map: Record<CnRarity, number> = {
    Common: 1, Uncommon: 1.5, Rare: 2, Epic: 3, Legendary: 5,
  };
  return map[r] ?? 1;
}

function cnDiffMultiplier(d: CnRecipeDifficulty): number {
  const map: Record<CnRecipeDifficulty, number> = {
    easy: 1, medium: 1.5, hard: 2.5, master: 4, legendary: 6,
  };
  return map[d] ?? 1;
}

function cnHashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return hash;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CN_MAX_LEVEL = 50;

export const CN_RARITY_COMMON: CnRarity = 'Common';
export const CN_RARITY_UNCOMMON: CnRarity = 'Uncommon';
export const CN_RARITY_RARE: CnRarity = 'Rare';
export const CN_RARITY_EPIC: CnRarity = 'Epic';
export const CN_RARITY_LEGENDARY: CnRarity = 'Legendary';

export const CN_RARITIES: { key: CnRarity; label: string; color: string; xpMult: number }[] = [
  { key: 'Common', label: 'Common', color: '#F9A8D4', xpMult: 1 },
  { key: 'Uncommon', label: 'Uncommon', color: '#D946EF', xpMult: 1.5 },
  { key: 'Rare', label: 'Rare', color: '#A855F7', xpMult: 2 },
  { key: 'Epic', label: 'Epic', color: '#7C3AED', xpMult: 3 },
  { key: 'Legendary', label: 'Legendary', color: '#EC4899', xpMult: 5 },
];

export const CN_XP_TABLE: number[] = Array.from({ length: CN_MAX_LEVEL }, (_, i) => cnXpRequired(i + 1));

export const CN_TITLES: CnTitleThreshold[] = [
  { minLevel: 1, title: 'Candy Helper', description: 'A sweet beginner eager to learn the candy arts' },
  { minLevel: 6, title: 'Taffy Tinker', description: 'Learning the delicate art of taffy pulling' },
  { minLevel: 12, title: 'Sugar Scholar', description: 'Known for deep knowledge of confectionery' },
  { minLevel: 18, title: 'Choco Artisan', description: 'Master chocolatier of the Candy Kingdom' },
  { minLevel: 25, title: 'Gummy Guildmaster', description: 'Leads the prestigious Gummy Crafters Guild' },
  { minLevel: 33, title: 'Candy Alchemist', description: 'Transforms basic sweets into extraordinary treats' },
  { minLevel: 42, title: 'Confection Baron', description: 'Rules a candy empire with a sugar fist' },
  { minLevel: 50, title: 'Sugar Monarch', description: 'The undisputed ruler of all things sweet' },
];

export const CN_CANDIES: CnCandyDef[] = [
  { id: 'gummy_bear', name: 'Gummy Bear', category: 'gummy', rarity: 'Common', sweetness: 3, value: 5, description: 'A classic chewy gummy bear in assorted fruit flavors.', emoji: '🧸', color: '#F472B6' },
  { id: 'lollipop', name: 'Lollipop', category: 'hard', rarity: 'Common', sweetness: 5, value: 8, description: 'A swirl of fruity sweetness on a stick.', emoji: '🍭', color: '#FB923C' },
  { id: 'chocolate_truffle', name: 'Chocolate Truffle', category: 'chocolate', rarity: 'Uncommon', sweetness: 7, value: 15, description: 'Rich dark chocolate with a molten center.', emoji: '🍫', color: '#78350F' },
  { id: 'cotton_candy', name: 'Cotton Candy', category: 'fizzy', rarity: 'Common', sweetness: 8, value: 10, description: 'Fluffy spun sugar that melts on your tongue.', emoji: '🍡', color: '#F9A8D4' },
  { id: 'peppermint_twist', name: 'Peppermint Twist', category: 'hard', rarity: 'Common', sweetness: 6, value: 7, description: 'Red and white striped peppermint candy.', emoji: '🍬', color: '#EF4444' },
  { id: 'caramel_apple', name: 'Caramel Apple', category: 'chewy', rarity: 'Uncommon', sweetness: 5, value: 12, description: 'A crisp apple dipped in golden caramel.', emoji: '🍎', color: '#F59E0B' },
  { id: 'gobstopper', name: 'Gobstopper', category: 'hard', rarity: 'Rare', sweetness: 9, value: 25, description: 'Layers of ever-changing flavors in one candy.', emoji: '🔮', color: '#8B5CF6' },
  { id: 'jelly_bean', name: 'Jelly Bean', category: 'gummy', rarity: 'Common', sweetness: 4, value: 4, description: 'Tiny bean-shaped candy in every flavor imaginable.', emoji: '🫘', color: '#34D399' },
  { id: 'taffy', name: 'Saltwater Taffy', category: 'chewy', rarity: 'Common', sweetness: 6, value: 6, description: 'Stretchy, chewy taffy in pastel colors.', emoji: '🩷', color: '#FDA4AF' },
  { id: 'marshmallow', name: 'Marshmallow', category: 'chewy', rarity: 'Common', sweetness: 3, value: 4, description: 'Soft, pillowy marshmallow — perfect for roasting.', emoji: '☁️', color: '#FDE68A' },
  { id: 'rock_candy', name: 'Rock Candy', category: 'hard', rarity: 'Uncommon', sweetness: 7, value: 14, description: 'Sparkling sugar crystals on a string.', emoji: '💎', color: '#C084FC' },
  { id: 'sour_worm', name: 'Sour Worm', category: 'gummy', rarity: 'Uncommon', sweetness: 2, value: 11, description: 'Tangy sour coating on a chewy gummy worm.', emoji: '🪱', color: '#A3E635' },
  { id: 'gumdrop', name: 'Gumdrop', category: 'gummy', rarity: 'Common', sweetness: 5, value: 5, description: 'Jelly-like sugar-coated candy in bright colors.', emoji: '🔴', color: '#F87171' },
  { id: 'candy_corn', name: 'Candy Corn', category: 'chewy', rarity: 'Common', sweetness: 8, value: 5, description: 'Tri-colored layered candy, a harvest classic.', emoji: '🌽', color: '#FBBF24' },
  { id: 'toffee', name: 'English Toffee', category: 'chewy', rarity: 'Uncommon', sweetness: 6, value: 13, description: 'Buttery crunch with a chocolate drizzle.', emoji: '🟤', color: '#92400E' },
  { id: 'fudge', name: 'Chocolate Fudge', category: 'chocolate', rarity: 'Uncommon', sweetness: 8, value: 16, description: 'Dense, rich fudge that melts in your mouth.', emoji: '🫕', color: '#451A03' },
  { id: 'licorice', name: 'Black Licorice', category: 'chewy', rarity: 'Common', sweetness: 2, value: 6, description: 'Anise-flavored chewy ropes. Love it or hate it.', emoji: '⚫', color: '#1F2937' },
  { id: 'butterscotch', name: 'Butterscotch Disc', category: 'hard', rarity: 'Common', sweetness: 7, value: 7, description: 'Smooth butterscotch flavor in a golden disc.', emoji: '🪙', color: '#D97706' },
  { id: 'sherbet', name: 'Sherbet Lemon', category: 'fizzy', rarity: 'Uncommon', sweetness: 6, value: 12, description: 'Tangy sherbet powder inside a lemon shell.', emoji: '🍋', color: '#FDE047' },
  { id: 'nougat', name: 'Nougat Bar', category: 'chewy', rarity: 'Uncommon', sweetness: 5, value: 14, description: 'Chewy nougat with almonds and honey.', emoji: '🟨', color: '#FEF08A' },
  { id: 'praline', name: 'Praline', category: 'premium', rarity: 'Rare', sweetness: 7, value: 28, description: 'Buttery pecan filling enrobed in fine chocolate.', emoji: '🌰', color: '#92400E' },
  { id: 'mocha_drop', name: 'Mocha Drop', category: 'premium', rarity: 'Rare', sweetness: 6, value: 26, description: 'Coffee-infused chocolate with a creamy center.', emoji: '☕', color: '#4B3621' },
  { id: 'bubble_gum', name: 'Bubble Gum', category: 'chewy', rarity: 'Common', sweetness: 4, value: 5, description: 'Blow the biggest bubble in the kingdom!', emoji: '🫧', color: '#F9A8D4' },
  { id: 'jawbreaker', name: 'Jawbreaker', category: 'hard', rarity: 'Rare', sweetness: 10, value: 22, description: 'Layers of color and flavor that last forever.', emoji: '🔵', color: '#6366F1' },
  { id: 'creme_brulee_candy', name: 'Creme Brulee Candy', category: 'premium', rarity: 'Epic', sweetness: 9, value: 45, description: 'Caramelized sugar crust over vanilla cream.', emoji: '🍮', color: '#FCD34D' },
  { id: 'maple_candy', name: 'Maple Leaf Candy', category: 'premium', rarity: 'Rare', sweetness: 8, value: 24, description: 'Pure maple syrup molded into leaf shapes.', emoji: '🍁', color: '#EA580C' },
  { id: 'honey_drops', name: 'Honey Drops', category: 'gummy', rarity: 'Uncommon', sweetness: 7, value: 11, description: 'Golden honey-flavored gummy drops.', emoji: '🍯', color: '#F59E0B' },
  { id: 'rose_candy', name: 'Rose Petal Candy', category: 'premium', rarity: 'Epic', sweetness: 6, value: 40, description: 'Delicate rose water candy with real petals.', emoji: '🌹', color: '#FB7185' },
  { id: 'violet_pastille', name: 'Violet Pastille', category: 'premium', rarity: 'Rare', sweetness: 5, value: 27, description: 'Floral violet cream in a sugar shell.', emoji: '💜', color: '#A855F7' },
  { id: 'cherry_bomb', name: 'Cherry Bomb', category: 'fizzy', rarity: 'Rare', sweetness: 8, value: 23, description: 'Explosive cherry flavor with a pop of fizz.', emoji: '🍒', color: '#DC2626' },
  { id: 'grape_gummy', name: 'Grape Gummy Worm', category: 'gummy', rarity: 'Common', sweetness: 5, value: 5, description: 'Two-tone grape and green apple gummy worm.', emoji: '🍇', color: '#7C3AED' },
  { id: 'blueberry_taffy', name: 'Blueberry Taffy', category: 'chewy', rarity: 'Uncommon', sweetness: 6, value: 10, description: 'Stretchy blueberry taffy with real fruit bits.', emoji: '🫐', color: '#3B82F6' },
  { id: 'lemon_drop', name: 'Lemon Drop', category: 'hard', rarity: 'Common', sweetness: 7, value: 6, description: 'Tangy sugar-coated lemon hard candy.', emoji: '💛', color: '#FACC15' },
  { id: 'mint_patty', name: 'Mint Patty', category: 'premium', rarity: 'Uncommon', sweetness: 3, value: 15, description: 'Cool peppermint cream sandwiched in dark chocolate.', emoji: '🍃', color: '#059669' },
  { id: 'sprinkles', name: 'Rainbow Sprinkles', category: 'fizzy', rarity: 'Common', sweetness: 4, value: 3, description: 'Tiny colorful sugar strands for topping anything.', emoji: '🌈', color: '#EC4899' },
  { id: 'strawberry_bonbon', name: 'Strawberry Bonbon', category: 'hard', rarity: 'Uncommon', sweetness: 7, value: 13, description: 'Strawberry cream center in a pink sugar shell.', emoji: '🍓', color: '#F43F5E' },
  { id: 'dark_choco_bar', name: 'Dark Chocolate Bar', category: 'chocolate', rarity: 'Rare', sweetness: 4, value: 30, description: '72% cacao single-origin dark chocolate.', emoji: '🍫', color: '#292524' },
  { id: 'white_choco_shell', name: 'White Chocolate Shell', category: 'chocolate', rarity: 'Rare', sweetness: 9, value: 28, description: 'Creamy white chocolate molded into a seashell.', emoji: '🐚', color: '#FEF3C7' },
  { id: 'sugar_plum', name: 'Sugar Plum', category: 'premium', rarity: 'Epic', sweetness: 8, value: 42, description: 'A mystical plum-shaped candy from sugar visions.', emoji: '🫧', color: '#D946EF' },
  { id: 'unicorn_swirl', name: 'Unicorn Swirl', category: 'frozen', rarity: 'Legendary', sweetness: 10, value: 80, description: 'A mythical candy that shifts through all flavors.', emoji: '🦄', color: '#E879F9' },
  { id: 'dragon_fruit_drop', name: 'Dragon Fruit Drop', category: 'frozen', rarity: 'Legendary', sweetness: 7, value: 75, description: 'Exotic dragon fruit candy with a frozen center.', emoji: '🐉', color: '#E11D48' },
  { id: 'caramel_dragon', name: 'Caramel Dragon Egg', category: 'premium', rarity: 'Epic', sweetness: 9, value: 48, description: 'A caramel shell enclosing a spicy cinnamon center.', emoji: '🥚', color: '#DC2626' },
  { id: 'coconut_ice', name: 'Coconut Ice Slice', category: 'chewy', rarity: 'Uncommon', sweetness: 6, value: 11, description: 'Two-tone pink and white coconut candy slice.', emoji: '🥥', color: '#FDF2F8' },
  { id: 'pineapple_lump', name: 'Pineapple Lump', category: 'chewy', rarity: 'Uncommon', sweetness: 7, value: 12, description: 'Tangy pineapple-flavored chewy candy from the tropics.', emoji: '🍍', color: '#EAB308' },
  { id: 'matcha_truffle', name: 'Matcha Truffle', category: 'premium', rarity: 'Rare', sweetness: 4, value: 30, description: 'Ceremonial-grade matcha enrobed in white chocolate.', emoji: '🍵', color: '#86EFAC' },
  { id: 'cinnamon_heart', name: 'Cinnamon Heart', category: 'hard', rarity: 'Common', sweetness: 8, value: 5, description: 'A classic cinnamon-flavored heart-shaped candy.', emoji: '❤️', color: '#B91C1C' },
  { id: 'apricot_gumdrop', name: 'Apricot Gumdrop', category: 'gummy', rarity: 'Uncommon', sweetness: 6, value: 10, description: 'A soft apricot-flavored gumdrop dusted with sugar.', emoji: '🍑', color: '#FB923C' },
];

export const CN_SHOPS: CnShopDef[] = [
  { id: 'sugar_rush_bakery', name: 'Sugar Rush Bakery', shopType: 'bakery', description: 'The heart of the kingdom — where all sweet dreams are baked.', emoji: '🧁', unlockLevel: 1, unlockCost: 0, coinMultiplier: 1.0, xpBonus: 1.0, color: '#F9A8D4', specialties: ['gummy', 'chewy'] },
  { id: 'chocolate_factory', name: 'Chocolate Factory', shopType: 'factory', description: 'A towering factory of flowing chocolate rivers and cacao mills.', emoji: '🏭', unlockLevel: 4, unlockCost: 200, coinMultiplier: 1.2, xpBonus: 1.1, color: '#78350F', specialties: ['chocolate'] },
  { id: 'lollipop_lane', name: 'Lollipop Lane', shopType: 'specialty', description: 'A whimsical lane lined with oversized lollipops of every flavor.', emoji: '🍭', unlockLevel: 8, unlockCost: 500, coinMultiplier: 1.3, xpBonus: 1.2, color: '#FB923C', specialties: ['hard'] },
  { id: 'candy_apple_corner', name: 'Candy Apple Corner', shopType: 'bakery', description: 'A cozy corner shop famous for its caramel-dipped creations.', emoji: '🍎', unlockLevel: 12, unlockCost: 800, coinMultiplier: 1.4, xpBonus: 1.3, color: '#F59E0B', specialties: ['chewy', 'premium'] },
  { id: 'taffy_twist_shoppe', name: 'Taffy Twist Shoppe', shopType: 'specialty', description: 'Watch taffy being pulled and twisted through enchanted machines.', emoji: '🩷', unlockLevel: 16, unlockCost: 1200, coinMultiplier: 1.5, xpBonus: 1.4, color: '#FDA4AF', specialties: ['chewy'] },
  { id: 'gummy_bear_grove', name: 'Gummy Bear Grove', shopType: 'garden', description: 'A magical grove where gummy bears grow on candy trees.', emoji: '🌳', unlockLevel: 22, unlockCost: 2000, coinMultiplier: 1.7, xpBonus: 1.5, color: '#34D399', specialties: ['gummy'] },
  { id: 'cotton_candy_cloud', name: 'Cotton Candy Cloud', shopType: 'wonder', description: 'Floating among cotton candy clouds, crafting airy confections.', emoji: '☁️', unlockLevel: 30, unlockCost: 3500, coinMultiplier: 2.0, xpBonus: 1.8, color: '#E879F9', specialties: ['fizzy', 'frozen'] },
  { id: 'peppermint_palace', name: 'Peppermint Palace', shopType: 'premium', description: 'The grandest shop in the kingdom — legendary candies await.', emoji: '🏰', unlockLevel: 40, unlockCost: 6000, coinMultiplier: 2.5, xpBonus: 2.2, color: '#EC4899', specialties: ['premium', 'frozen'] },
];

export const CN_INGREDIENTS: CnIngredientDef[] = [
  { id: 'cn_sugar', name: 'Candy Sugar', rarity: 'Common', cost: 3, description: 'Fine crystalline sugar ground from sugar cane.', emoji: '✨', color: '#FDE68A' },
  { id: 'cn_cocoa', name: 'Royal Cocoa', rarity: 'Uncommon', cost: 10, description: 'Premium cocoa powder from the Chocolate Mountains.', emoji: '🍫', color: '#78350F' },
  { id: 'cn_gelatin', name: 'Enchanted Gelatin', rarity: 'Common', cost: 5, description: 'Magical gelatin for gummy candy base.', emoji: '🧪', color: '#C4B5FD' },
  { id: 'cn_caramel', name: 'Golden Caramel', rarity: 'Uncommon', cost: 8, description: 'Smooth caramel boiled to perfection.', emoji: '🟤', color: '#D97706' },
  { id: 'cn_peppermint', name: 'Peppermint Essence', rarity: 'Common', cost: 4, description: 'Cool peppermint extract from the Peppermint Fields.', emoji: '🌿', color: '#059669' },
  { id: 'cn_rose_water', name: 'Rose Water', rarity: 'Rare', cost: 18, description: 'Distilled from the rare Candy Kingdom roses.', emoji: '🌹', color: '#FB7185' },
  { id: 'cn_honey', name: 'Bee Candy Honey', rarity: 'Uncommon', cost: 9, description: 'Sweet honey from the kingdom\'s candy bees.', emoji: '🍯', color: '#F59E0B' },
  { id: 'cn_vanilla', name: 'Madagascar Vanilla', rarity: 'Rare', cost: 20, description: 'The finest vanilla beans from enchanted vines.', emoji: '🫘', color: '#FEF3C7' },
  { id: 'cn_cream', name: 'Sugar Cream', rarity: 'Common', cost: 4, description: 'Rich cream from the kingdom\'s candy cows.', emoji: '🥛', color: '#FEFCE8' },
  { id: 'cn_food_color', name: 'Rainbow Food Color', rarity: 'Uncommon', cost: 7, description: 'Vibrant colors extracted from rainbow flowers.', emoji: '🌈', color: '#EC4899' },
  { id: 'cn_candy_ore', name: 'Candy Ore', rarity: 'Rare', cost: 22, description: 'Rare mineral that adds sparkle to any candy.', emoji: '💎', color: '#A855F7' },
  { id: 'cn_frost_essence', name: 'Frost Essence', rarity: 'Epic', cost: 35, description: 'Captured winter frost for frozen candies.', emoji: '❄️', color: '#93C5FD' },
  { id: 'cn_stardust', name: 'Candy Stardust', rarity: 'Legendary', cost: 60, description: 'Magical stardust that makes candies glow.', emoji: '⭐', color: '#FCD34D' },
  { id: 'cn_butterscotch_chip', name: 'Butterscotch Chip', rarity: 'Common', cost: 5, description: 'Melt-in-your-mouth butterscotch morsels.', emoji: '🟡', color: '#FBBF24' },
];

export const CN_RECIPES: CnRecipeDef[] = [
  { id: 'rc_gummy_bear_basic', name: 'Basic Gummy Bear', difficulty: 'easy', ingredients: [{ ingredientId: 'cn_sugar', amount: 3 }, { ingredientId: 'cn_gelatin', amount: 2 }], bakeTime: 10, sellPrice: 12, xpReward: 8, candyReward: [{ candyId: 'gummy_bear', amount: 3 }], description: 'A simple but delicious gummy bear recipe.', emoji: '🧸', requiredLevel: 1, color: '#F472B6' },
  { id: 'rc_swirl_lollipop', name: 'Swirl Lollipop', difficulty: 'easy', ingredients: [{ ingredientId: 'cn_sugar', amount: 4 }, { ingredientId: 'cn_food_color', amount: 1 }], bakeTime: 15, sellPrice: 15, xpReward: 10, candyReward: [{ candyId: 'lollipop', amount: 2 }], description: 'Colorful swirl pattern on a classic lollipop.', emoji: '🍭', requiredLevel: 1, color: '#FB923C' },
  { id: 'rc_choco_truffle', name: 'Chocolate Truffle', difficulty: 'medium', ingredients: [{ ingredientId: 'cn_cocoa', amount: 2 }, { ingredientId: 'cn_cream', amount: 2 }, { ingredientId: 'cn_sugar', amount: 1 }], bakeTime: 25, sellPrice: 35, xpReward: 20, candyReward: [{ candyId: 'chocolate_truffle', amount: 2 }], description: 'Decadent truffle with a molten chocolate center.', emoji: '🍫', requiredLevel: 3, color: '#78350F' },
  { id: 'rc_cotton_candy_puff', name: 'Cotton Candy Puff', difficulty: 'easy', ingredients: [{ ingredientId: 'cn_sugar', amount: 3 }, { ingredientId: 'cn_food_color', amount: 1 }], bakeTime: 8, sellPrice: 18, xpReward: 12, candyReward: [{ candyId: 'cotton_candy', amount: 2 }], description: 'Fluffy spun sugar in pastel hues.', emoji: '🍡', requiredLevel: 1, color: '#F9A8D4' },
  { id: 'rc_peppermint_twist', name: 'Peppermint Twist', difficulty: 'easy', ingredients: [{ ingredientId: 'cn_sugar', amount: 3 }, { ingredientId: 'cn_peppermint', amount: 2 }], bakeTime: 12, sellPrice: 14, xpReward: 9, candyReward: [{ candyId: 'peppermint_twist', amount: 2 }], description: 'Classic red and white peppermint twist.', emoji: '🍬', requiredLevel: 1, color: '#EF4444' },
  { id: 'rc_caramel_apple_dip', name: 'Caramel Apple Dip', difficulty: 'medium', ingredients: [{ ingredientId: 'cn_caramel', amount: 3 }, { ingredientId: 'cn_sugar', amount: 1 }], bakeTime: 20, sellPrice: 28, xpReward: 16, candyReward: [{ candyId: 'caramel_apple', amount: 2 }], description: 'Golden caramel perfectly coating a crisp apple.', emoji: '🍎', requiredLevel: 3, color: '#F59E0B' },
  { id: 'rc_jelly_bean_mix', name: 'Jelly Bean Mix', difficulty: 'easy', ingredients: [{ ingredientId: 'cn_sugar', amount: 2 }, { ingredientId: 'cn_gelatin', amount: 2 }, { ingredientId: 'cn_food_color', amount: 1 }], bakeTime: 10, sellPrice: 10, xpReward: 7, candyReward: [{ candyId: 'jelly_bean', amount: 5 }], description: 'A handful of assorted jelly bean flavors.', emoji: '🫘', requiredLevel: 1, color: '#34D399' },
  { id: 'rc_taffy_pull', name: 'Saltwater Taffy', difficulty: 'medium', ingredients: [{ ingredientId: 'cn_sugar', amount: 3 }, { ingredientId: 'cn_caramel', amount: 2 }, { ingredientId: 'cn_cream', amount: 1 }], bakeTime: 22, sellPrice: 22, xpReward: 14, candyReward: [{ candyId: 'taffy', amount: 3 }], description: 'Stretchy taffy in seaside pastel colors.', emoji: '🩷', requiredLevel: 3, color: '#FDA4AF' },
  { id: 'rc_gumdrop_garden', name: 'Gumdrop Garden', difficulty: 'easy', ingredients: [{ ingredientId: 'cn_sugar', amount: 3 }, { ingredientId: 'cn_gelatin', amount: 1 }, { ingredientId: 'cn_food_color', amount: 1 }], bakeTime: 12, sellPrice: 13, xpReward: 8, candyReward: [{ candyId: 'gumdrop', amount: 4 }], description: 'Colorful gumdrops straight from the garden.', emoji: '🔴', requiredLevel: 2, color: '#F87171' },
  { id: 'rc_rock_candy_crystal', name: 'Rock Crystal Candy', difficulty: 'hard', ingredients: [{ ingredientId: 'cn_sugar', amount: 5 }, { ingredientId: 'cn_food_color', amount: 2 }, { ingredientId: 'cn_candy_ore', amount: 1 }], bakeTime: 40, sellPrice: 45, xpReward: 30, candyReward: [{ candyId: 'rock_candy', amount: 2 }], description: 'Grow your own sparkling candy crystals.', emoji: '💎', requiredLevel: 6, color: '#C084FC' },
  { id: 'rc_sour_worm_bite', name: 'Sour Worm Explosion', difficulty: 'medium', ingredients: [{ ingredientId: 'cn_sugar', amount: 2 }, { ingredientId: 'cn_gelatin', amount: 3 }, { ingredientId: 'cn_food_color', amount: 1 }], bakeTime: 18, sellPrice: 30, xpReward: 18, candyReward: [{ candyId: 'sour_worm', amount: 3 }], description: 'Extra sour coating for bold candy lovers.', emoji: '🪱', requiredLevel: 4, color: '#A3E635' },
  { id: 'rc_chocolate_fudge', name: 'Double Chocolate Fudge', difficulty: 'hard', ingredients: [{ ingredientId: 'cn_cocoa', amount: 4 }, { ingredientId: 'cn_cream', amount: 2 }, { ingredientId: 'cn_sugar', amount: 2 }], bakeTime: 35, sellPrice: 55, xpReward: 35, candyReward: [{ candyId: 'fudge', amount: 2 }], description: 'Rich, dense fudge loaded with chocolate.', emoji: '🫕', requiredLevel: 7, color: '#451A03' },
  { id: 'rc_gobstopper_layers', name: 'Eternal Gobstopper', difficulty: 'hard', ingredients: [{ ingredientId: 'cn_sugar', amount: 5 }, { ingredientId: 'cn_food_color', amount: 3 }, { ingredientId: 'cn_candy_ore', amount: 1 }], bakeTime: 45, sellPrice: 60, xpReward: 38, candyReward: [{ candyId: 'gobstopper', amount: 2 }], description: 'Layer upon layer of flavor-changing candy.', emoji: '🔮', requiredLevel: 8, color: '#8B5CF6' },
  { id: 'rc_butterscotch_disc', name: 'Butterscotch Gold', difficulty: 'easy', ingredients: [{ ingredientId: 'cn_butterscotch_chip', amount: 3 }, { ingredientId: 'cn_cream', amount: 1 }], bakeTime: 15, sellPrice: 16, xpReward: 10, candyReward: [{ candyId: 'butterscotch', amount: 3 }], description: 'Classic butterscotch discs with a golden sheen.', emoji: '🪙', requiredLevel: 2, color: '#D97706' },
  { id: 'rc_toffee_crunch', name: 'English Toffee Crunch', difficulty: 'medium', ingredients: [{ ingredientId: 'cn_caramel', amount: 3 }, { ingredientId: 'cn_cocoa', amount: 1 }, { ingredientId: 'cn_sugar', amount: 1 }], bakeTime: 28, sellPrice: 38, xpReward: 22, candyReward: [{ candyId: 'toffee', amount: 2 }], description: 'Buttery toffee with a satisfying crunch.', emoji: '🟤', requiredLevel: 5, color: '#92400E' },
  { id: 'rc_sherbet_lemon', name: 'Sherbet Lemon Fizz', difficulty: 'medium', ingredients: [{ ingredientId: 'cn_sugar', amount: 3 }, { ingredientId: 'cn_food_color', amount: 1 }, { ingredientId: 'cn_peppermint', amount: 1 }], bakeTime: 18, sellPrice: 25, xpReward: 15, candyReward: [{ candyId: 'sherbet', amount: 3 }], description: 'Fizzing sherbet inside a sugar lemon shell.', emoji: '🍋', requiredLevel: 4, color: '#FDE047' },
  { id: 'rc_nougat_bar', name: 'Honey Nougat Bar', difficulty: 'hard', ingredients: [{ ingredientId: 'cn_honey', amount: 3 }, { ingredientId: 'cn_caramel', amount: 2 }, { ingredientId: 'cn_sugar', amount: 1 }], bakeTime: 30, sellPrice: 40, xpReward: 25, candyReward: [{ candyId: 'nougat', amount: 2 }], description: 'Chewy honey nougat studded with nuts.', emoji: '🟨', requiredLevel: 7, color: '#FEF08A' },
  { id: 'rc_praline_pecan', name: 'Praline Pecan Delight', difficulty: 'hard', ingredients: [{ ingredientId: 'cn_caramel', amount: 3 }, { ingredientId: 'cn_cocoa', amount: 2 }, { ingredientId: 'cn_vanilla', amount: 1 }], bakeTime: 35, sellPrice: 58, xpReward: 32, candyReward: [{ candyId: 'praline', amount: 2 }], description: 'Southern-style praline with butter pecan.', emoji: '🌰', requiredLevel: 9, color: '#92400E' },
  { id: 'rc_bubble_gum_ball', name: 'Bubble Gum Galaxy', difficulty: 'easy', ingredients: [{ ingredientId: 'cn_gelatin', amount: 2 }, { ingredientId: 'cn_sugar', amount: 2 }, { ingredientId: 'cn_food_color', amount: 1 }], bakeTime: 12, sellPrice: 12, xpReward: 8, candyReward: [{ candyId: 'bubble_gum', amount: 3 }], description: 'Blow bubbles the size of planets.', emoji: '🫧', requiredLevel: 1, color: '#F9A8D4' },
  { id: 'rc_jawbreaker_supreme', name: 'Jawbreaker Supreme', difficulty: 'hard', ingredients: [{ ingredientId: 'cn_sugar', amount: 6 }, { ingredientId: 'cn_food_color', amount: 3 }, { ingredientId: 'cn_candy_ore', amount: 1 }], bakeTime: 50, sellPrice: 65, xpReward: 40, candyReward: [{ candyId: 'jawbreaker', amount: 2 }], description: 'The ultimate jawbreaker with infinite layers.', emoji: '🔵', requiredLevel: 10, color: '#6366F1' },
  { id: 'rc_creme_brulee_bite', name: 'Creme Brulee Bite', difficulty: 'master', ingredients: [{ ingredientId: 'cn_cream', amount: 3 }, { ingredientId: 'cn_vanilla', amount: 2 }, { ingredientId: 'cn_sugar', amount: 2 }, { ingredientId: 'cn_candy_ore', amount: 1 }], bakeTime: 45, sellPrice: 80, xpReward: 50, candyReward: [{ candyId: 'creme_brulee_candy', amount: 2 }], description: 'Caramelized sugar crust with silky custard.', emoji: '🍮', requiredLevel: 15, color: '#FCD34D' },
  { id: 'rc_maple_leaf', name: 'Maple Leaf Crystal', difficulty: 'hard', ingredients: [{ ingredientId: 'cn_honey', amount: 3 }, { ingredientId: 'cn_sugar', amount: 2 }, { ingredientId: 'cn_candy_ore', amount: 1 }], bakeTime: 30, sellPrice: 50, xpReward: 30, candyReward: [{ candyId: 'maple_candy', amount: 2 }], description: 'Pure maple syrup crystallized into leaves.', emoji: '🍁', requiredLevel: 11, color: '#EA580C' },
  { id: 'rc_rose_petal_sweet', name: 'Rose Petal Sweet', difficulty: 'master', ingredients: [{ ingredientId: 'cn_rose_water', amount: 2 }, { ingredientId: 'cn_sugar', amount: 3 }, { ingredientId: 'cn_cream', amount: 1 }, { ingredientId: 'cn_candy_ore', amount: 1 }], bakeTime: 40, sellPrice: 75, xpReward: 45, candyReward: [{ candyId: 'rose_candy', amount: 2 }], description: 'Delicate rose-scented candy with real petals.', emoji: '🌹', requiredLevel: 18, color: '#FB7185' },
  { id: 'rc_mint_patty_royal', name: 'Royal Mint Patty', difficulty: 'medium', ingredients: [{ ingredientId: 'cn_peppermint', amount: 2 }, { ingredientId: 'cn_cocoa', amount: 2 }, { ingredientId: 'cn_cream', amount: 1 }], bakeTime: 25, sellPrice: 35, xpReward: 20, candyReward: [{ candyId: 'mint_patty', amount: 2 }], description: 'Cool mint cream in dark chocolate.', emoji: '🍃', requiredLevel: 5, color: '#059669' },
  { id: 'rc_strawberry_bonbon', name: 'Strawberry Bonbon', difficulty: 'medium', ingredients: [{ ingredientId: 'cn_sugar', amount: 3 }, { ingredientId: 'cn_cream', amount: 1 }, { ingredientId: 'cn_food_color', amount: 1 }], bakeTime: 20, sellPrice: 32, xpReward: 18, candyReward: [{ candyId: 'strawberry_bonbon', amount: 3 }], description: 'Juicy strawberry cream in a pink shell.', emoji: '🍓', requiredLevel: 5, color: '#F43F5E' },
  { id: 'rc_sugar_plum_fairy', name: 'Sugar Plum Fairy', difficulty: 'master', ingredients: [{ ingredientId: 'cn_sugar', amount: 4 }, { ingredientId: 'cn_rose_water', amount: 1 }, { ingredientId: 'cn_vanilla', amount: 1 }, { ingredientId: 'cn_candy_ore', amount: 2 }], bakeTime: 50, sellPrice: 90, xpReward: 55, candyReward: [{ candyId: 'sugar_plum', amount: 2 }], description: 'A mystical candy from sugar plum dreams.', emoji: '🫧', requiredLevel: 20, color: '#D946EF' },
  { id: 'rc_dark_choco_bar', name: 'Dark Cacao Bar', difficulty: 'hard', ingredients: [{ ingredientId: 'cn_cocoa', amount: 5 }, { ingredientId: 'cn_cream', amount: 1 }, { ingredientId: 'cn_sugar', amount: 1 }], bakeTime: 35, sellPrice: 55, xpReward: 32, candyReward: [{ candyId: 'dark_choco_bar', amount: 2 }], description: 'Intense single-origin dark chocolate.', emoji: '🍫', requiredLevel: 12, color: '#292524' },
  { id: 'rc_frost_candy_pop', name: 'Frost Candy Pop', difficulty: 'master', ingredients: [{ ingredientId: 'cn_frost_essence', amount: 2 }, { ingredientId: 'cn_sugar', amount: 3 }, { ingredientId: 'cn_cream', amount: 2 }, { ingredientId: 'cn_candy_ore', amount: 1 }], bakeTime: 55, sellPrice: 95, xpReward: 58, candyReward: [{ candyId: 'cherry_bomb', amount: 2 }], description: 'Frozen candy that crackles with frost energy.', emoji: '❄️', requiredLevel: 22, color: '#93C5FD' },
  { id: 'rc_unicorn_swirl', name: 'Unicorn Swirl Crown', difficulty: 'legendary', ingredients: [{ ingredientId: 'cn_stardust', amount: 2 }, { ingredientId: 'cn_candy_ore', amount: 3 }, { ingredientId: 'cn_cream', amount: 2 }, { ingredientId: 'cn_food_color', amount: 2 }, { ingredientId: 'cn_vanilla', amount: 1 }], bakeTime: 80, sellPrice: 180, xpReward: 120, candyReward: [{ candyId: 'unicorn_swirl', amount: 1 }], description: 'The most legendary candy — shifts through every flavor.', emoji: '🦄', requiredLevel: 35, color: '#E879F9' },
  { id: 'rc_dragon_frost', name: 'Dragon Frost Sphere', difficulty: 'legendary', ingredients: [{ ingredientId: 'cn_stardust', amount: 2 }, { ingredientId: 'cn_frost_essence', amount: 2 }, { ingredientId: 'cn_candy_ore', amount: 2 }, { ingredientId: 'cn_cocoa', amount: 1 }], bakeTime: 75, sellPrice: 160, xpReward: 100, candyReward: [{ candyId: 'dragon_fruit_drop', amount: 1 }], description: 'Frozen dragon fruit candy with legendary frost.', emoji: '🐉', requiredLevel: 32, color: '#E11D48' },
];

export const CN_DECORATIONS: CnDecorationDef[] = [
  { id: 'dec_candy_cane_gate', name: 'Candy Cane Gate', zone: 'entrance', rarity: 'Common', cost: 50, happinessBonus: 3, description: 'A grand entrance framed by towering candy canes.', emoji: '🎪', color: '#EF4444' },
  { id: 'dec_chocolate_fountain', name: 'Chocolate Fountain', zone: 'main_hall', rarity: 'Rare', cost: 300, happinessBonus: 12, description: 'A flowing fountain of warm chocolate in the center hall.', emoji: '⛲', color: '#78350F' },
  { id: 'dec_gumdrop_path', name: 'Gumdrop Pathway', zone: 'garden', rarity: 'Common', cost: 80, happinessBonus: 5, description: 'A winding path made of colorful gumdrop stones.', emoji: '🛤️', color: '#F87171' },
  { id: 'dec_lollipop_trees', name: 'Lollipop Tree Grove', zone: 'garden', rarity: 'Uncommon', cost: 150, happinessBonus: 8, description: 'Trees topped with giant swirling lollipops.', emoji: '🌳', color: '#FB923C' },
  { id: 'dec_peppermint_pillars', name: 'Peppermint Pillars', zone: 'entrance', rarity: 'Uncommon', cost: 120, happinessBonus: 7, description: 'Striped peppermint columns flanking the entrance.', emoji: '🏛️', color: '#EF4444' },
  { id: 'dec_sugar_glass_windows', name: 'Sugar Glass Windows', zone: 'main_hall', rarity: 'Rare', cost: 250, happinessBonus: 10, description: 'Stained glass windows made entirely of colored sugar.', emoji: '🪟', color: '#C084FC' },
  { id: 'dec_marshmallow_seats', name: 'Marshmallow Seating', zone: 'main_hall', rarity: 'Common', cost: 60, happinessBonus: 4, description: 'Plush marshmallow chairs and sofas for guests.', emoji: '🛋️', color: '#FDE68A' },
  { id: 'dec_caramel_waterfall', name: 'Caramel Waterfall', zone: 'garden', rarity: 'Epic', cost: 500, happinessBonus: 18, description: 'A golden waterfall of smooth caramel in the garden.', emoji: '🌊', color: '#D97706' },
  { id: 'dec_cotton_candy_clouds', name: 'Cotton Candy Clouds', zone: 'tower', rarity: 'Epic', cost: 450, happinessBonus: 16, description: 'Floating cotton candy clouds decorating the tower.', emoji: '☁️', color: '#F9A8D4' },
  { id: 'dec_candy_corn_mosaic', name: 'Candy Corn Mosaic', zone: 'courtyard', rarity: 'Common', cost: 70, happinessBonus: 4, description: 'A mosaic floor pattern made of candy corn tiles.', emoji: '🌽', color: '#FBBF24' },
  { id: 'dec_ice_cream_sundae_statue', name: 'Ice Cream Sundae Statue', zone: 'courtyard', rarity: 'Rare', cost: 280, happinessBonus: 11, description: 'A towering statue of a perfect ice cream sundae.', emoji: '🗿', color: '#FDA4AF' },
  { id: 'dec_gummy_bear_chandelier', name: 'Gummy Bear Chandelier', zone: 'main_hall', rarity: 'Epic', cost: 400, happinessBonus: 15, description: 'An ornate chandelier adorned with gummy bear crystals.', emoji: '💡', color: '#F472B6' },
  { id: 'dec_sprinkle_lanterns', name: 'Sprinkle Lanterns', zone: 'garden', rarity: 'Common', cost: 40, happinessBonus: 3, description: 'Colorful lanterns that cast sprinkle-shaped shadows.', emoji: '🏮', color: '#EC4899' },
  { id: 'dec_chocolate_statue', name: 'Chocolate Guardian Statue', zone: 'entrance', rarity: 'Epic', cost: 550, happinessBonus: 20, description: 'A majestic chocolate sculpture guarding the entrance.', emoji: '🗿', color: '#451A03' },
  { id: 'dec_honeycomb_shelves', name: 'Honeycomb Display Shelves', zone: 'main_hall', rarity: 'Uncommon', cost: 130, happinessBonus: 7, description: 'Hexagonal honeycomb-shaped shelves for candy display.', emoji: '🍯', color: '#F59E0B' },
  { id: 'dec_sugar_sparkle_floor', name: 'Sugar Sparkle Floor', zone: 'throne', rarity: 'Rare', cost: 320, happinessBonus: 13, description: 'A glittering floor made of crushed sugar crystals.', emoji: '✨', color: '#FDE68A' },
  { id: 'dec_rainbow_arch', name: 'Rainbow Candy Arch', zone: 'entrance', rarity: 'Rare', cost: 260, happinessBonus: 10, description: 'An archway of rainbow-colored candy blocks.', emoji: '🌈', color: '#EC4899' },
  { id: 'dec_rose_garden_beds', name: 'Rose Petal Flower Beds', zone: 'garden', rarity: 'Uncommon', cost: 140, happinessBonus: 7, description: 'Flower beds where the flowers are made of candy petals.', emoji: '🌷', color: '#FB7185' },
  { id: 'dec_crown_chandelier', name: 'Crown Sugar Chandelier', zone: 'throne', rarity: 'Legendary', cost: 800, happinessBonus: 30, description: 'A magnificent chandelier shaped like a candy crown.', emoji: '👑', color: '#FCD34D' },
  { id: 'dec_sugar_throne', name: 'Sugar Crystal Throne', zone: 'throne', rarity: 'Legendary', cost: 1000, happinessBonus: 40, description: 'The ultimate throne carved from a giant sugar crystal.', emoji: '🪑', color: '#E879F9' },
  { id: 'dec_licorice_fence', name: 'Licorice Fence', zone: 'garden', rarity: 'Common', cost: 55, happinessBonus: 3, description: 'Twisted licorice ropes forming a whimsical fence.', emoji: '🏗️', color: '#1F2937' },
  { id: 'dec_toffee_bridge', name: 'Toffee Bridge', zone: 'courtyard', rarity: 'Uncommon', cost: 160, happinessBonus: 8, description: 'A bridge made of hardened toffee over a caramel river.', emoji: '🌉', color: '#92400E' },
  { id: 'dec_sugar_carousel', name: 'Sugar Carousel', zone: 'courtyard', rarity: 'Rare', cost: 290, happinessBonus: 11, description: 'A spinning carousel with candy horse riders.', emoji: '🎠', color: '#F9A8D4' },
  { id: 'dec_gingerbread_house', name: 'Gingerbread House', zone: 'garden', rarity: 'Epic', cost: 480, happinessBonus: 17, description: 'A life-sized gingerbread house decorated with frosting.', emoji: '🏠', color: '#D97706' },
  { id: 'dec_peppermint_lamp', name: 'Peppermint Lamp Post', zone: 'entrance', rarity: 'Common', cost: 45, happinessBonus: 3, description: 'A striped peppermint lamp that glows with warm light.', emoji: '🏮', color: '#EF4444' },
];

export const CN_ACHIEVEMENTS: CnAchievementDef[] = [
  { id: 'cn_ach_first_bake', name: 'First Crystals', description: 'Bake your first candy recipe.', conditionKey: 'totalBaked', targetValue: 1, rewardCoins: 20, rewardXP: 10, icon: '✨' },
  { id: 'cn_ach_bake_25', name: 'Sweet Start', description: 'Bake 25 candies total.', conditionKey: 'totalBaked', targetValue: 25, rewardCoins: 100, rewardXP: 50, icon: '🧁' },
  { id: 'cn_ach_bake_100', name: 'Candy Factory', description: 'Bake 100 candies total.', conditionKey: 'totalBaked', targetValue: 100, rewardCoins: 300, rewardXP: 150, icon: '🏭' },
  { id: 'cn_ach_bake_500', name: 'Sugar Overlord', description: 'Bake 500 candies total.', conditionKey: 'totalBaked', targetValue: 500, rewardCoins: 1000, rewardXP: 500, icon: '👑' },
  { id: 'cn_ach_eat_10', name: 'Sweet Tooth', description: 'Eat 10 candies from your collection.', conditionKey: 'totalEaten', targetValue: 10, rewardCoins: 50, rewardXP: 25, icon: '😋' },
  { id: 'cn_ach_eat_100', name: 'Candy Devourer', description: 'Eat 100 candies.', conditionKey: 'totalEaten', targetValue: 100, rewardCoins: 500, rewardXP: 250, icon: '💫' },
  { id: 'cn_ach_open_all_shops', name: 'Shopaholic', description: 'Unlock all 8 candy shops.', conditionKey: 'shopsUnlocked', targetValue: 8, rewardCoins: 800, rewardXP: 400, icon: '🏪' },
  { id: 'cn_ach_master_5_recipes', name: 'Recipe Master', description: 'Master 5 different recipes.', conditionKey: 'totalRecipesMastered', targetValue: 5, rewardCoins: 400, rewardXP: 200, icon: '📖' },
  { id: 'cn_ach_collect_20_candies', name: 'Collector', description: 'Collect 20 different candy types.', conditionKey: 'uniqueCandies', targetValue: 20, rewardCoins: 300, rewardXP: 150, icon: '🍬' },
  { id: 'cn_ach_all_candies', name: 'Complete Collection', description: 'Collect every candy type in the kingdom.', conditionKey: 'uniqueCandies', targetValue: 42, rewardCoins: 5000, rewardXP: 2500, icon: '🏆' },
  { id: 'cn_ach_sugar_rush_5', name: 'Sugar Rush Addict', description: 'Activate 5 sugar rushes.', conditionKey: 'totalSugarRushes', targetValue: 5, rewardCoins: 200, rewardXP: 100, icon: '⚡' },
  { id: 'cn_ach_streak_7', name: 'Week of Sweets', description: 'Maintain a 7-day playing streak.', conditionKey: 'longestStreak', targetValue: 7, rewardCoins: 250, rewardXP: 125, icon: '📅' },
  { id: 'cn_ach_streak_30', name: 'Monthly Sugar High', description: 'Maintain a 30-day playing streak.', conditionKey: 'longestStreak', targetValue: 30, rewardCoins: 1500, rewardXP: 750, icon: '🗓️' },
  { id: 'cn_ach_level_25', name: 'Halfway Sweet', description: 'Reach level 25.', conditionKey: 'level', targetValue: 25, rewardCoins: 500, rewardXP: 250, icon: '🌟' },
  { id: 'cn_ach_level_50', name: 'Sugar Monarch', description: 'Reach the maximum level of 50.', conditionKey: 'level', targetValue: 50, rewardCoins: 3000, rewardXP: 1500, icon: '👑' },
  { id: 'cn_ach_earn_5000', name: 'Rich in Sweets', description: 'Earn 5000 total coins.', conditionKey: 'totalCoinsEarned', targetValue: 5000, rewardCoins: 500, rewardXP: 250, icon: '💰' },
  { id: 'cn_ach_decorate_10', name: 'Kingdom Beautifier', description: 'Place 10 decorations in your kingdom.', conditionKey: 'totalDecorationsPlaced', targetValue: 10, rewardCoins: 350, rewardXP: 175, icon: '🎨' },
  { id: 'cn_ach_quest_5', name: 'Quest Champion', description: 'Complete 5 quests.', conditionKey: 'questsCompleted', targetValue: 5, rewardCoins: 200, rewardXP: 100, icon: '📋' },
  { id: 'cn_ach_npc_8', name: 'Social Butterfly', description: 'Meet all 10 NPCs in the kingdom.', conditionKey: 'npcsMet', targetValue: 10, rewardCoins: 300, rewardXP: 150, icon: '🤝' },
];

export const CN_SUGAR_RUSHES: CnSugarRushDef[] = [
  { id: 'rush_speed_bake', name: 'Speed Bake', rushType: 'speed_bake', duration: 120, cooldown: 600, multiplier: 2.0, description: 'Double baking speed for 2 minutes!', requiredLevel: 5, emoji: '⚡', color: '#FBBF24' },
  { id: 'rush_candy_rain', name: 'Candy Rain', rushType: 'candy_rain', duration: 60, cooldown: 900, multiplier: 3.0, description: 'Triple candy rewards from baking for 1 minute!', requiredLevel: 10, emoji: '🌧️', color: '#60A5FA' },
  { id: 'rush_golden_touch', name: 'Golden Touch', rushType: 'golden_touch', duration: 90, cooldown: 1200, multiplier: 2.5, description: 'All coin earnings multiplied by 2.5x for 90 seconds!', requiredLevel: 18, emoji: '✨', color: '#FCD34D' },
  { id: 'rush_frost_bloom', name: 'Frost Bloom', rushType: 'frost_bloom', duration: 150, cooldown: 1500, multiplier: 2.0, description: 'Double XP from all activities for 2.5 minutes!', requiredLevel: 28, emoji: '❄️', color: '#93C5FD' },
  { id: 'rush_sugar_storm', name: 'Sugar Storm', rushType: 'sugar_storm', duration: 60, cooldown: 2400, multiplier: 5.0, description: 'ALL rewards multiplied by 5x for a wild 1 minute!', requiredLevel: 40, emoji: '🌪️', color: '#E879F9' },
];

export const CN_NPCS: CnNpcDef[] = [
  { id: 'npc_sugar_sage', name: 'Sugar Sage Praline', role: 'Kingdom Elder', description: 'An ancient candy sage who has seen centuries of confectionery evolution.', emoji: '🧙', greeting: 'Welcome, young confectioner. The sugar crystals have foretold your arrival.', shopId: null },
  { id: 'npc_cocoa_chef', name: 'Chef Cacao', role: 'Master Baker', description: 'The legendary chocolatier who invented the double-fudge technique.', emoji: '👨‍🍳', greeting: 'Ah, another aspiring candy maker! Let me show you the art of chocolate.', shopId: 'sugar_rush_bakery' },
  { id: 'npc_gummy_guardian', name: 'Gummy Guardian', role: 'Shop Keeper', description: 'A cheerful gummy bear who manages the Gummy Bear Grove shop.', emoji: '🧸', greeting: 'Welcome to the grove! Everything here is gummy and delicious!', shopId: 'gummy_bear_grove' },
  { id: 'npc_taffy_twins', name: 'Taffy Twins Tik & Tak', role: 'Taffy Pullers', description: 'Identical twin taffy experts who pull taffy in perfect sync.', emoji: '🩷', greeting: 'Tik says try the blueberry! Tak says try the strawberry!', shopId: 'taffy_twist_shoppe' },
  { id: 'npc_mint_duchess', name: 'Duchess Peppermint', role: 'Palace Manager', description: 'The elegant duchess who oversees the Peppermint Palace.', emoji: '👸', greeting: 'Only the finest candies grace my palace. Show me what you have.', shopId: 'peppermint_palace' },
  { id: 'npc_cotton_cloud', name: 'Cloud Weaver Fluff', role: 'Cloud Artisan', description: 'A dreamy artisan who spins cotton candy from actual clouds.', emoji: '☁️', greeting: 'Would you like to taste the clouds? They are extra fluffy today.', shopId: 'cotton_candy_cloud' },
  { id: 'npc_candy_merchant', name: 'Merchant Bonbon', role: 'Traveling Trader', description: 'A mysterious merchant who trades rare ingredients from distant lands.', emoji: '🧳', greeting: 'I have ingredients from the Caramel Caves and the Sugar Dunes...', shopId: null },
  { id: 'npc_frost_fairy', name: 'Frost Fairy Glaze', role: 'Ingredient Seller', description: 'A tiny fairy who collects frost essence from winter winds.', emoji: '🧚', greeting: 'Brrr! My frost essence is perfect for frozen candies!', shopId: null },
  { id: 'npc_lollipop_kid', name: 'Lollipop Kid Pop', role: 'Candy Courier', description: 'A speedy kid who delivers candy orders across the kingdom on a giant lollipop stick.', emoji: '🚀', greeting: 'Need a delivery? I can get there faster than a sugar rush!', shopId: 'lollipop_lane' },
  { id: 'npc_choco_scientist', name: 'Dr. Fudge', role: 'Chocolate Researcher', description: 'A brilliant scientist who studies the molecular structure of chocolate.', emoji: '🔬', greeting: 'Fascinating! The cacao crystallization rate is off the charts today!', shopId: 'chocolate_factory' },
];

export const CN_QUESTS: CnQuestDef[] = [
  { id: 'cq_first_bake', name: 'First Steps in Sugar', description: 'Bake your first 3 candies to prove your commitment.', type: 'bake', target: 3, rewardCoins: 50, rewardXP: 25, requiredLevel: 1, emoji: '🧁' },
  { id: 'cq_cookie_monster', name: 'Gummy Collector', description: 'Collect 15 gummy bears through baking and exploring.', type: 'collect', target: 15, rewardCoins: 100, rewardXP: 50, requiredLevel: 2, emoji: '🧸' },
  { id: 'cq_shop_unlock_3', name: 'Shop Explorer', description: 'Unlock 3 different candy shops across the kingdom.', type: 'shop', target: 3, rewardCoins: 150, rewardXP: 75, requiredLevel: 5, emoji: '🏪' },
  { id: 'cq_decorate_5', name: 'Kingdom Beautifier', description: 'Place 5 decorations to beautify your candy kingdom.', type: 'decorate', target: 5, rewardCoins: 120, rewardXP: 60, requiredLevel: 6, emoji: '🎨' },
  { id: 'cq_bake_25', name: 'Production Line', description: 'Bake a total of 25 candies in your career.', type: 'bake', target: 25, rewardCoins: 200, rewardXP: 100, requiredLevel: 8, emoji: '🏭' },
  { id: 'cq_eat_10', name: 'Sweet Tooth', description: 'Eat 10 candies from your collection for energy.', type: 'eat', target: 10, rewardCoins: 80, rewardXP: 40, requiredLevel: 4, emoji: '😋' },
  { id: 'cq_rush_3', name: 'Sugar Crazed', description: 'Activate 3 sugar rushes to boost your kingdom.', type: 'rush', target: 3, rewardCoins: 200, rewardXP: 100, requiredLevel: 10, emoji: '⚡' },
  { id: 'cq_master_recipe', name: 'Recipe Perfectionist', description: 'Master any recipe by baking it 10 times.', type: 'bake', target: 10, rewardCoins: 250, rewardXP: 125, requiredLevel: 12, emoji: '📖' },
  { id: 'cq_collect_rare', name: 'Rare Connoisseur', description: 'Own at least 5 rare candies in your collection.', type: 'collect', target: 5, rewardCoins: 300, rewardXP: 150, requiredLevel: 15, emoji: '💎' },
  { id: 'cq_all_shops', name: 'Shopping Spree', description: 'Unlock all 8 candy shops in the kingdom.', type: 'shop', target: 8, rewardCoins: 500, rewardXP: 250, requiredLevel: 25, emoji: '🏰' },
  { id: 'cq_decorate_15', name: 'Master Decorator', description: 'Place 15 decorations to create a stunning kingdom.', type: 'decorate', target: 15, rewardCoins: 400, rewardXP: 200, requiredLevel: 20, emoji: '🌈' },
  { id: 'cq_bake_100', name: 'Candy Tycoon', description: 'Bake a total of 100 candies — a true tycoon!', type: 'bake', target: 100, rewardCoins: 800, rewardXP: 400, requiredLevel: 30, emoji: '👑' },
  { id: 'cq_eat_50', name: 'Candy Devourer', description: 'Eat 50 candies from your ever-growing collection.', type: 'eat', target: 50, rewardCoins: 600, rewardXP: 300, requiredLevel: 35, emoji: '💫' },
  { id: 'cq_rush_10', name: 'Rush Addict', description: 'Activate 10 sugar rushes total.', type: 'rush', target: 10, rewardCoins: 500, rewardXP: 250, requiredLevel: 38, emoji: '🌪️' },
  { id: 'cq_legendary_collection', name: 'Legendary Hoard', description: 'Collect all legendary candies in the kingdom.', type: 'collect', target: 2, rewardCoins: 1000, rewardXP: 500, requiredLevel: 40, emoji: '🦄' },
];

export const CN_DAILY_TASK_POOL: CnDailyTaskPoolDef[] = [
  { id: 'cdt_bake_3', name: 'Daily Baking', description: 'Bake 3 candies today.', type: 'bake', target: 3, rewardCoins: 30, rewardXP: 15, emoji: '🧁' },
  { id: 'cdt_bake_7', name: 'Bake Marathon', description: 'Bake 7 candies today.', type: 'bake', target: 7, rewardCoins: 70, rewardXP: 35, emoji: '🎂' },
  { id: 'cdt_collect_5', name: 'Candy Gathering', description: 'Discover 5 new candy types today.', type: 'collect', target: 5, rewardCoins: 50, rewardXP: 25, emoji: '🍬' },
  { id: 'cdt_earn_200', name: 'Coin Collector', description: 'Earn 200 coins today from baking and shops.', type: 'earn', target: 200, rewardCoins: 40, rewardXP: 20, emoji: '💰' },
  { id: 'cdt_earn_500', name: 'Big Earn Day', description: 'Earn 500 coins today from all sources.', type: 'earn', target: 500, rewardCoins: 80, rewardXP: 40, emoji: '💎' },
  { id: 'cdt_eat_3', name: 'Taste Test', description: 'Eat 3 candies from your collection today.', type: 'eat', target: 3, rewardCoins: 25, rewardXP: 12, emoji: '😋' },
  { id: 'cdt_shop_visit_3', name: 'Shop Hop', description: 'Visit 3 different shops today.', type: 'shop', target: 3, rewardCoins: 35, rewardXP: 18, emoji: '🏪' },
  { id: 'cdt_bake_15', name: 'Baking Frenzy', description: 'Bake 15 candies in a single day!', type: 'bake', target: 15, rewardCoins: 120, rewardXP: 60, emoji: '🔥' },
  { id: 'cdt_eat_10', name: 'Sugar Feast', description: 'Eat 10 candies in one day.', type: 'eat', target: 10, rewardCoins: 60, rewardXP: 30, emoji: '🍭' },
  { id: 'cdt_decorate_2', name: 'Quick Decor', description: 'Place 2 new decorations in your kingdom.', type: 'decorate', target: 2, rewardCoins: 40, rewardXP: 20, emoji: '🎨' },
];

export const CN_THEME = {
  primary: '#EC4899',
  secondary: '#A855F7',
  accent: '#F472B6',
  background: '#FDF2F8',
  surface: '#FCE7F3',
  text: '#831843',
  textLight: '#9D174D',
  border: '#FBCFE8',
  gold: '#FBBF24',
  success: '#34D399',
  danger: '#FB7185',
  info: '#C084FC',
};

export const CN_DECORATION_ZONES: { zone: CnDecorationZone; label: string; description: string; color: string }[] = [
  { zone: 'entrance', label: 'Kingdom Entrance', description: 'The grand entryway to your candy kingdom.', color: '#EF4444' },
  { zone: 'garden', label: 'Candy Garden', description: 'A lush garden where candy grows on trees.', color: '#34D399' },
  { zone: 'main_hall', label: 'Grand Hall', description: 'The central gathering hall for all candy folk.', color: '#F9A8D4' },
  { zone: 'courtyard', label: 'Sugar Courtyard', description: 'An open courtyard for events and festivals.', color: '#FBBF24' },
  { zone: 'tower', label: 'Sugar Tower', description: 'A tall tower offering views of the sweet kingdom.', color: '#C084FC' },
  { zone: 'throne', label: 'Throne Room', description: 'The seat of power for the Sugar Monarch.', color: '#E879F9' },
];

export const CN_RECIPE_DIFFICULTIES: { key: CnRecipeDifficulty; label: string; color: string; xpMult: number }[] = [
  { key: 'easy', label: 'Easy', color: '#86EFAC', xpMult: 1 },
  { key: 'medium', label: 'Medium', color: '#FDE047', xpMult: 1.5 },
  { key: 'hard', label: 'Hard', color: '#FB923C', xpMult: 2.5 },
  { key: 'master', label: 'Master', color: '#C084FC', xpMult: 4 },
  { key: 'legendary', label: 'Legendary', color: '#EC4899', xpMult: 6 },
];

export const CN_CANDY_CATEGORIES: { key: CnCandyCategory; label: string; color: string; emoji: string }[] = [
  { key: 'gummy', label: 'Gummy', color: '#F472B6', emoji: '🧸' },
  { key: 'hard', label: 'Hard Candy', color: '#FB923C', emoji: '🍭' },
  { key: 'chocolate', label: 'Chocolate', color: '#78350F', emoji: '🍫' },
  { key: 'chewy', label: 'Chewy', color: '#FDA4AF', emoji: '🩷' },
  { key: 'fizzy', label: 'Fizzy', color: '#A3E635', emoji: '🫧' },
  { key: 'frozen', label: 'Frozen', color: '#93C5FD', emoji: '❄️' },
  { key: 'premium', label: 'Premium', color: '#FCD34D', emoji: '👑' },
];

// ---------------------------------------------------------------------------
// Initial State Factory
// ---------------------------------------------------------------------------

function cnCreateInitialState(seed?: number): CandyKingdomState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 50,
    candies: CN_CANDIES.filter((c) => c.rarity === 'Common').map((c) => ({ candyId: c.id, count: 2 })),
    shops: CN_SHOPS.map((s) => ({
      shopId: s.id,
      unlocked: s.unlockLevel === 1,
      level: 1,
      dailyEarnings: 0,
    })),
    recipes: CN_RECIPES.filter((r) => r.requiredLevel <= 1).map((r) => ({
      recipeId: r.id,
      unlocked: true,
      timesBaked: 0,
      mastered: false,
    })),
    decorations: CN_DECORATIONS.map((d) => ({
      decorationId: d.id,
      placed: false,
      zone: null,
    })),
    achievements: CN_ACHIEVEMENTS.map((a) => ({
      achievementId: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    sugarRushes: CN_SUGAR_RUSHES.map((r) => ({
      rushId: r.id,
      unlocked: r.requiredLevel <= 1,
      lastUsed: 0,
      timesUsed: 0,
    })),
    quests: CN_QUESTS.filter((q) => q.requiredLevel <= 1).map((q) => ({
      questId: q.id,
      accepted: false,
      completed: false,
      progress: 0,
      claimed: false,
    })),
    npcs: CN_NPCS.map((n) => ({
      npcId: n.id,
      met: false,
      timesVisited: 0,
    })),
    title: 'Candy Helper',
    dailyBaked: 0,
    dailyDate: null,
    totalBaked: 0,
    totalEaten: 0,
    sugarRushActive: null,
    sugarRushEndTime: 0,
    streak: 0,
    lastPlayDate: null,
    daily: {
      dateSeed: '',
      candiesBakedToday: 0,
      coinsEarnedToday: 0,
      rewardClaimed: false,
      dailyQuestProgress: 0,
      dailyQuestTarget: 5,
    },
    stats: {
      totalCandiesBaked: 0,
      totalCandiesEaten: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      totalXPEarned: 0,
      totalSugarRushes: 0,
      totalDecorationsPlaced: 0,
      totalRecipesMastered: 0,
      totalShopVisits: 0,
      highestCombo: 0,
      longestStreak: 0,
    },
    seed: effectiveSeed,
  };
}

// ---------------------------------------------------------------------------
// Hook: useCandyKingdom
// ---------------------------------------------------------------------------

export default function useCandyKingdom(initialSeed?: number) {
  const [state, setState] = useState<CandyKingdomState>(() => cnCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(cnMulberry32(state.seed));
  const stateRef = useRef(state);
  stateRef.current = state;

  // ---- Core State ----

  const cnGetState = useCallback((): Readonly<CandyKingdomState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const cnGetLevel = useCallback((): number => state.level, [state.level]);

  const cnGetXp = useCallback((): number => state.xp, [state.xp]);

  const cnGetTotalXp = useCallback((): number => state.totalXp, [state.totalXp]);

  const cnGetCoins = useCallback((): number => state.coins, [state.coins]);

  const cnGetTitle = useCallback((): string => state.title, [state.title]);

  const cnGetStreak = useCallback((): number => state.streak, [state.streak]);

  const cnGetXpToNext = useCallback((): number => cnXpRequired(state.level), [state.level]);

  const cnGetXpProgress = useCallback((): number => {
    const needed = cnXpRequired(state.level);
    if (needed === Infinity) return 1;
    return needed > 0 ? state.xp / needed : 0;
  }, [state.xp, state.level]);

  const cnGetRandom = useCallback((): number => prngRef.current(), []);

  const cnGetRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  // ---- Candy Access ----

  const cnGetCandies = useCallback((): readonly CnCandyInstance[] => state.candies, [state.candies]);

  const cnGetCandyDef = useCallback((candyId: string): CnCandyDef | undefined => {
    return CN_CANDIES.find((c) => c.id === candyId);
  }, []);

  const cnGetCandyCount = useCallback((candyId: string): number => {
    const found = state.candies.find((c) => c.candyId === candyId);
    return found ? found.count : 0;
  }, [state.candies]);

  const cnGetUniqueCandyCount = useCallback((): number => {
    return state.candies.filter((c) => c.count > 0).length;
  }, [state.candies]);

  const cnGetTotalCandyCount = useCallback((): number => {
    return state.candies.reduce((sum, c) => sum + c.count, 0);
  }, [state.candies]);

  const cnGetCandiesByRarity = useCallback((rarity: CnRarity): CnCandyDef[] => {
    return CN_CANDIES.filter((c) => c.rarity === rarity);
  }, []);

  const cnGetCandiesByCategory = useCallback((category: CnCandyCategory): CnCandyDef[] => {
    return CN_CANDIES.filter((c) => c.category === category);
  }, []);

  // ---- Candy Actions ----

  const cnAddCandy = useCallback((candyId: string, amount: number): void => {
    setState((prev) => {
      const candies = prev.candies.map((c) => {
        if (c.candyId === candyId) return { ...c, count: c.count + amount };
        return c;
      });
      const existing = candies.find((c) => c.candyId === candyId);
      if (!existing) {
        candies.push({ candyId, count: amount });
      }
      return { ...prev, candies };
    });
  }, []);

  const cnRemoveCandy = useCallback((candyId: string, amount: number): boolean => {
    let success = false;
    setState((prev) => {
      const instance = prev.candies.find((c) => c.candyId === candyId);
      if (!instance || instance.count < amount) return prev;
      success = true;
      const candies = prev.candies.map((c) => {
        if (c.candyId === candyId) return { ...c, count: Math.max(0, c.count - amount) };
        return c;
      });
      return { ...prev, candies };
    });
    return success;
  }, []);

  const cnEatCandy = useCallback((candyId: string, amount: number = 1): boolean => {
    let success = false;
    setState((prev) => {
      const instance = prev.candies.find((c) => c.candyId === candyId);
      if (!instance || instance.count < amount) return prev;
      success = true;
      const candies = prev.candies.map((c) => {
        if (c.candyId === candyId) return { ...c, count: Math.max(0, c.count - amount) };
        return c;
      });
      const candyDef = CN_CANDIES.find((c) => c.id === candyId);
      const xpGain = candyDef ? Math.floor(candyDef.value * 0.5) : 5;
      const stats = { ...prev.stats, totalCandiesEaten: prev.stats.totalCandiesEaten + amount };
      return { ...prev, candies, totalEaten: prev.totalEaten + amount, xp: prev.xp + xpGain, totalXp: prev.totalXp + xpGain, stats };
    });
    return success;
  }, []);

  // ---- Level & XP ----

  const cnAddXp = useCallback((amount: number): number => {
    let gainedLevel = 0;
    const rush = stateRef.current.sugarRushActive;
    const rushDef = rush ? CN_SUGAR_RUSHES.find((r) => r.rushType === rush) : null;
    const effectiveAmount = (rushDef && rushDef.rushType === 'frost_bloom')
      ? Math.floor(amount * rushDef.multiplier)
      : amount;
    setState((prev) => {
      let { level, xp } = prev;
      let xpToAdd = effectiveAmount;
      while (level < CN_MAX_LEVEL && xpToAdd > 0) {
        const needed = cnXpRequired(level);
        if (needed === Infinity) { xpToAdd = 0; break; }
        if (xp + xpToAdd >= needed) {
          xpToAdd -= (needed - xp);
          xp = 0;
          level += 1;
          gainedLevel += 1;
        } else {
          xp += xpToAdd;
          xpToAdd = 0;
        }
      }
      if (level >= CN_MAX_LEVEL) { xp = 0; level = CN_MAX_LEVEL; }
      const newTitle = cnComputeTitle(level);
      return { ...prev, level: cnClampLevel(level), xp, totalXp: prev.totalXp + effectiveAmount, title: newTitle, stats: { ...prev.stats, totalXPEarned: prev.stats.totalXPEarned + effectiveAmount } };
    });
    return gainedLevel;
  }, []);

  const cnAddCoins = useCallback((amount: number): void => {
    const rush = stateRef.current.sugarRushActive;
    const rushDef = rush ? CN_SUGAR_RUSHES.find((r) => r.rushType === rush) : null;
    const effectiveAmount = (rushDef && rushDef.rushType === 'golden_touch')
      ? Math.floor(amount * rushDef.multiplier)
      : amount;
    setState((prev) => ({
      ...prev,
      coins: cnClampCoins(prev.coins + effectiveAmount),
      daily: { ...prev.daily, coinsEarnedToday: prev.daily.coinsEarnedToday + effectiveAmount },
      stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + effectiveAmount },
    }));
  }, []);

  const cnSpendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.coins < amount) return prev;
      success = true;
      return { ...prev, coins: cnClampCoins(prev.coins - amount), stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + amount } };
    });
    return success;
  }, []);

  // ---- Shops ----

  const cnGetShops = useCallback((): readonly CnShopState[] => state.shops, [state.shops]);

  const cnGetShopDef = useCallback((shopId: string): CnShopDef | undefined => {
    return CN_SHOPS.find((s) => s.id === shopId);
  }, []);

  const cnGetUnlockedShops = useCallback((): CnShopState[] => {
    return state.shops.filter((s) => s.unlocked);
  }, [state.shops]);

  const cnOpenShop = useCallback((shopId: string): boolean => {
    let success = false;
    setState((prev) => {
      const def = CN_SHOPS.find((s) => s.id === shopId);
      if (!def) return prev;
      const shop = prev.shops.find((s) => s.shopId === shopId);
      if (!shop || shop.unlocked || prev.level < def.unlockLevel || prev.coins < def.unlockCost) return prev;
      success = true;
      const shops = prev.shops.map((s) => s.shopId === shopId ? { ...s, unlocked: true } : s);
      return { ...prev, shops, coins: cnClampCoins(prev.coins - def.unlockCost), stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + def.unlockCost } };
    });
    return success;
  }, []);

  const cnUpgradeShop = useCallback((shopId: string): boolean => {
    let success = false;
    setState((prev) => {
      const def = CN_SHOPS.find((s) => s.id === shopId);
      const shop = prev.shops.find((s) => s.shopId === shopId);
      if (!def || !shop || !shop.unlocked) return prev;
      const cost = Math.floor(def.unlockCost * 0.5 * Math.pow(1.3, shop.level));
      if (prev.coins < cost) return prev;
      success = true;
      const shops = prev.shops.map((s) => s.shopId === shopId ? { ...s, level: s.level + 1 } : s);
      return { ...prev, shops, coins: cnClampCoins(prev.coins - cost) };
    });
    return success;
  }, []);

  const cnVisitShop = useCallback((shopId: string): number => {
    let earned = 0;
    setState((prev) => {
      const shop = prev.shops.find((s) => s.shopId === shopId);
      const def = CN_SHOPS.find((s) => s.id === shopId);
      if (!shop || !def || !shop.unlocked) return prev;
      const base = 10 + shop.level * 5;
      const mult = def.coinMultiplier * (1 + shop.level * 0.1);
      earned = Math.floor(base * mult);
      const shops = prev.shops.map((s) => s.shopId === shopId ? { ...s, dailyEarnings: s.dailyEarnings + earned } : s);
      return { ...prev, shops, coins: cnClampCoins(prev.coins + earned), stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + earned, totalShopVisits: prev.stats.totalShopVisits + 1 } };
    });
    return earned;
  }, []);

  const cnGetShopUpgradeCost = useCallback((shopId: string): number => {
    const def = CN_SHOPS.find((s) => s.id === shopId);
    const shop = state.shops.find((s) => s.shopId === shopId);
    if (!def || !shop) return 0;
    return Math.floor(def.unlockCost * 0.5 * Math.pow(1.3, shop.level));
  }, [state.shops]);

  // ---- Recipes ----

  const cnGetRecipes = useCallback((): readonly CnRecipeState[] => state.recipes, [state.recipes]);

  const cnGetRecipeDef = useCallback((recipeId: string): CnRecipeDef | undefined => {
    return CN_RECIPES.find((r) => r.id === recipeId);
  }, []);

  const cnGetUnlockedRecipes = useCallback((): CnRecipeState[] => {
    return state.recipes.filter((r) => r.unlocked);
  }, [state.recipes]);

  const cnGetMasteredRecipes = useCallback((): CnRecipeState[] => {
    return state.recipes.filter((r) => r.mastered);
  }, [state.recipes]);

  const cnUnlockRecipe = useCallback((recipeId: string): boolean => {
    let success = false;
    setState((prev) => {
      const def = CN_RECIPES.find((r) => r.id === recipeId);
      if (!def || prev.level < def.requiredLevel) return prev;
      const existing = prev.recipes.find((r) => r.recipeId === recipeId);
      if (existing && existing.unlocked) return prev;
      success = true;
      const recipes = existing
        ? prev.recipes.map((r) => r.recipeId === recipeId ? { ...r, unlocked: true } : r)
        : [...prev.recipes, { recipeId, unlocked: true, timesBaked: 0, mastered: false }];
      return { ...prev, recipes };
    });
    return success;
  }, []);

  const cnBakeCandy = useCallback((recipeId: string): { success: boolean; candies: { candyId: string; amount: number }[] } => {
    let result: { success: boolean; candies: { candyId: string; amount: number }[] } = { success: false, candies: [] };
    setState((prev) => {
      const recipe = prev.recipes.find((r) => r.recipeId === recipeId);
      const def = CN_RECIPES.find((r) => r.id === recipeId);
      if (!recipe || !def || !recipe.unlocked) return prev;
      const rush = prev.sugarRushActive;
      const rushDef = rush ? CN_SUGAR_RUSHES.find((r) => r.rushType === rush) : null;
      const candyMult = (rushDef && rushDef.rushType === 'candy_rain')
        ? rushDef.multiplier
        : 1;
      const candyRewards = def.candyReward.map((cr) => ({ candyId: cr.candyId, amount: Math.floor(cr.amount * candyMult) }));
      const xpReward = Math.floor(def.xpReward * cnDiffMultiplier(def.difficulty));
      const coinReward = def.sellPrice;
      const recipes = prev.recipes.map((r) => {
        if (r.recipeId !== recipeId) return r;
        const timesBaked = r.timesBaked + 1;
        const mastered = timesBaked >= 10;
        return { ...r, timesBaked, mastered };
      });
      const totalBaked = prev.totalBaked + 1;
      const dailyBaked = prev.dailyBaked + 1;
      result = { success: true, candies: candyRewards };
      return {
        ...prev,
        recipes,
        totalBaked,
        dailyBaked,
        coins: cnClampCoins(prev.coins + coinReward),
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
        daily: { ...prev.daily, candiesBakedToday: prev.daily.candiesBakedToday + 1, coinsEarnedToday: prev.daily.coinsEarnedToday + coinReward },
        stats: { ...prev.stats, totalCandiesBaked: prev.stats.totalCandiesBaked + 1, totalCoinsEarned: prev.stats.totalCoinsEarned + coinReward, totalXPEarned: prev.stats.totalXPEarned + xpReward },
      };
    });
    if (result.success) {
      for (const cr of result.candies) {
        cnAddCandy(cr.candyId, cr.amount);
      }
    }
    return result;
  }, [cnAddCandy]);

  const cnGetRecipeTimesBaked = useCallback((recipeId: string): number => {
    const recipe = state.recipes.find((r) => r.recipeId === recipeId);
    return recipe ? recipe.timesBaked : 0;
  }, [state.recipes]);

  const cnIsRecipeMastered = useCallback((recipeId: string): boolean => {
    const recipe = state.recipes.find((r) => r.recipeId === recipeId);
    return recipe ? recipe.mastered : false;
  }, [state.recipes]);

  // ---- Decorations ----

  const cnGetDecorations = useCallback((): readonly CnDecorationState[] => state.decorations, [state.decorations]);

  const cnGetDecorationDef = useCallback((decorationId: string): CnDecorationDef | undefined => {
    return CN_DECORATIONS.find((d) => d.id === decorationId);
  }, []);

  const cnGetPlacedDecorations = useCallback((): CnDecorationState[] => {
    return state.decorations.filter((d) => d.placed);
  }, [state.decorations]);

  const cnGetDecorationsByZone = useCallback((zone: CnDecorationZone): CnDecorationState[] => {
    return state.decorations.filter((d) => d.zone === zone);
  }, [state.decorations]);

  const cnBuyDecoration = useCallback((decorationId: string): boolean => {
    let success = false;
    setState((prev) => {
      const def = CN_DECORATIONS.find((d) => d.id === decorationId);
      if (!def || prev.coins < def.cost) return prev;
      const existing = prev.decorations.find((d) => d.decorationId === decorationId);
      if (existing && existing.placed) return prev;
      success = true;
      const decorations = existing
        ? prev.decorations
        : [...prev.decorations, { decorationId, placed: false, zone: null }];
      return { ...prev, decorations, coins: cnClampCoins(prev.coins - def.cost), stats: { ...prev.stats, totalCoinsSpent: prev.stats.totalCoinsSpent + def.cost } };
    });
    return success;
  }, []);

  const cnDecorate = useCallback((decorationId: string, zone: CnDecorationZone): boolean => {
    let success = false;
    setState((prev) => {
      const existing = prev.decorations.find((d) => d.decorationId === decorationId);
      if (!existing) return prev;
      const def = CN_DECORATIONS.find((d) => d.id === decorationId);
      if (!def || def.zone !== zone) return prev;
      const wasPlaced = existing.placed;
      const decorations = prev.decorations.map((d) =>
        d.decorationId === decorationId ? { ...d, placed: true, zone } : d
      );
      const totalDecorationsPlaced = wasPlaced ? prev.stats.totalDecorationsPlaced : prev.stats.totalDecorationsPlaced + 1;
      success = true;
      return { ...prev, decorations, stats: { ...prev.stats, totalDecorationsPlaced } };
    });
    return success;
  }, []);

  const cnRemoveDecoration = useCallback((decorationId: string): boolean => {
    setState((prev) => {
      const existing = prev.decorations.find((d) => d.decorationId === decorationId);
      if (!existing || !existing.placed) return prev;
      const decorations = prev.decorations.map((d) =>
        d.decorationId === decorationId ? { ...d, placed: false, zone: null } : d
      );
      return { ...prev, decorations };
    });
    return true;
  }, []);

  const cnGetTotalHappiness = useCallback((): number => {
    return state.decorations.filter((d) => d.placed).reduce((sum, d) => {
      const def = CN_DECORATIONS.find((dd) => dd.id === d.decorationId);
      return sum + (def ? def.happinessBonus : 0);
    }, 0);
  }, [state.decorations]);

  // ---- Achievements ----

  const cnGetAchievements = useCallback((): readonly CnAchievementState[] => state.achievements, [state.achievements]);

  const cnGetAchievementDef = useCallback((achievementId: string): CnAchievementDef | undefined => {
    return CN_ACHIEVEMENTS.find((a) => a.id === achievementId);
  }, []);

  const cnGetUnlockedAchievements = useCallback((): CnAchievementState[] => {
    return state.achievements.filter((a) => a.unlocked);
  }, [state.achievements]);

  const cnGetLockedAchievements = useCallback((): CnAchievementState[] => {
    return state.achievements.filter((a) => !a.unlocked);
  }, [state.achievements]);

  const cnCheckAchievements = useCallback((): CnAchievementState[] => {
    const newlyUnlocked: CnAchievementState[] = [];
    const conditionValues: Record<string, number> = {
      totalBaked: state.stats.totalCandiesBaked,
      totalEaten: state.stats.totalCandiesEaten,
      shopsUnlocked: state.shops.filter((s) => s.unlocked).length,
      totalRecipesMastered: state.stats.totalRecipesMastered,
      uniqueCandies: state.candies.filter((c) => c.count > 0).length,
      totalSugarRushes: state.stats.totalSugarRushes,
      longestStreak: state.stats.longestStreak,
      level: state.level,
      totalCoinsEarned: state.stats.totalCoinsEarned,
      totalDecorationsPlaced: state.stats.totalDecorationsPlaced,
      questsCompleted: state.quests.filter((q) => q.completed && q.claimed).length,
      npcsMet: state.npcs.filter((n) => n.met).length,
    };
    setState((prev) => {
      const achievements = prev.achievements.map((a) => {
        if (a.unlocked) return a;
        const def = CN_ACHIEVEMENTS.find((ad) => ad.id === a.achievementId);
        if (!def) return a;
        const value = conditionValues[def.conditionKey] ?? 0;
        if (value >= def.targetValue) {
          newlyUnlocked.push({ ...a, unlocked: true, unlockedAt: Date.now() });
          return { ...a, unlocked: true, unlockedAt: Date.now() };
        }
        return a;
      });
      return { ...prev, achievements };
    });
    return newlyUnlocked;
  }, [state.stats, state.shops, state.candies, state.level]);

  // ---- Sugar Rushes ----

  const cnGetSugarRushes = useCallback((): readonly CnSugarRushState[] => state.sugarRushes, [state.sugarRushes]);

  const cnGetSugarRushDef = useCallback((rushId: string): CnSugarRushDef | undefined => {
    return CN_SUGAR_RUSHES.find((r) => r.id === rushId);
  }, []);

  const cnGetUnlockedRushes = useCallback((): CnSugarRushState[] => {
    return state.sugarRushes.filter((r) => r.unlocked);
  }, [state.sugarRushes]);

  const cnGetActiveRush = useCallback((): CnSugarRushType | null => {
    if (!state.sugarRushActive) return null;
    if (Date.now() > state.sugarRushEndTime) return null;
    return state.sugarRushActive;
  }, [state.sugarRushActive, state.sugarRushEndTime]);

  const cnGetRushTimeRemaining = useCallback((): number => {
    if (!state.sugarRushActive) return 0;
    const remaining = state.sugarRushEndTime - Date.now();
    return Math.max(0, remaining);
  }, [state.sugarRushActive, state.sugarRushEndTime]);

  const cnActivateRush = useCallback((rushId: string): boolean => {
    let success = false;
    setState((prev) => {
      const rush = prev.sugarRushes.find((r) => r.rushId === rushId);
      const def = CN_SUGAR_RUSHES.find((r) => r.id === rushId);
      if (!rush || !def || !rush.unlocked) return prev;
      if (Date.now() - rush.lastUsed < def.cooldown * 1000) return prev;
      if (prev.sugarRushActive && Date.now() < prev.sugarRushEndTime) return prev;
      success = true;
      const now = Date.now();
      const endTime = now + def.duration * 1000;
      const rushes = prev.sugarRushes.map((r) =>
        r.rushId === rushId ? { ...r, lastUsed: now, timesUsed: r.timesUsed + 1 } : r
      );
      return { ...prev, sugarRushes: rushes, sugarRushActive: def.rushType, sugarRushEndTime: endTime, stats: { ...prev.stats, totalSugarRushes: prev.stats.totalSugarRushes + 1 } };
    });
    return success;
  }, []);

  const cnExpireRush = useCallback((): void => {
    setState((prev) => {
      if (!prev.sugarRushActive || Date.now() < prev.sugarRushEndTime) return prev;
      return { ...prev, sugarRushActive: null, sugarRushEndTime: 0 };
    });
  }, []);

  const cnGetRushCooldownRemaining = useCallback((rushId: string): number => {
    const rush = state.sugarRushes.find((r) => r.rushId === rushId);
    const def = CN_SUGAR_RUSHES.find((r) => r.id === rushId);
    if (!rush || !def || !rush.unlocked) return 0;
    const elapsed = Date.now() - rush.lastUsed;
    const remaining = def.cooldown * 1000 - elapsed;
    return Math.max(0, remaining);
  }, [state.sugarRushes]);

  // ---- Daily ----

  const cnGetDaily = useCallback((): Readonly<CnDailyData> => state.daily, [state.daily]);

  const cnCheckDailyReset = useCallback((): boolean => {
    const today = cnGenerateDayKey(Date.now());
    return state.daily.dateSeed !== today;
  }, [state.daily.dateSeed]);

  const cnClaimDailyReward = useCallback((): { coins: number; xp: number } | null => {
    let reward: { coins: number; xp: number } | null = null;
    setState((prev) => {
      if (prev.daily.rewardClaimed) return prev;
      const streakBonus = 1 + prev.streak * 0.1;
      const coins = Math.floor(50 * streakBonus);
      const xp = Math.floor(20 * streakBonus);
      reward = { coins, xp };
      return {
        ...prev,
        daily: { ...prev.daily, rewardClaimed: true },
        coins: cnClampCoins(prev.coins + coins),
        xp: prev.xp + xp,
        totalXp: prev.totalXp + xp,
        stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + coins, totalXPEarned: prev.stats.totalXPEarned + xp },
      };
    });
    return reward;
  }, []);

  const cnUpdateDailyQuest = useCallback((amount: number): void => {
    setState((prev) => ({
      ...prev,
      daily: { ...prev.daily, dailyQuestProgress: Math.min(prev.daily.dailyQuestTarget, prev.daily.dailyQuestProgress + amount) },
    }));
  }, []);

  const cnIsDailyQuestComplete = useCallback((): boolean => {
    return state.daily.dailyQuestProgress >= state.daily.dailyQuestTarget;
  }, [state.daily]);

  const cnResetDaily = useCallback((): void => {
    const today = cnGenerateDayKey(Date.now());
    setState((prev) => {
      const lastDate = prev.lastPlayDate;
      let newStreak = prev.streak;
      if (lastDate) {
        const last = new Date(lastDate);
        const now = new Date(today);
        const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          newStreak = prev.streak + 1;
        } else if (diff > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      const longestStreak = Math.max(prev.stats.longestStreak, newStreak);
      return {
        ...prev,
        dailyBaked: 0,
        dailyDate: today,
        lastPlayDate: today,
        streak: newStreak,
        daily: { dateSeed: today, candiesBakedToday: 0, coinsEarnedToday: 0, rewardClaimed: false, dailyQuestProgress: 0, dailyQuestTarget: 5 + Math.floor(prev.level / 5) },
        stats: { ...prev.stats, longestStreak },
      };
    });
  }, []);

  // ---- Stats ----

  const cnGetStats = useCallback((): Readonly<CnStats> => state.stats, [state.stats]);

  const cnGetTotalBaked = useCallback((): number => state.totalBaked, [state.totalBaked]);

  const cnGetTotalEaten = useCallback((): number => state.totalEaten, [state.totalEaten]);

  const cnGetDailyBaked = useCallback((): number => state.dailyBaked, [state.dailyBaked]);

  // ---- Title ----

  const cnComputeTitle = useCallback((level: number): string => {
    let title = CN_TITLES[0].title;
    for (const t of CN_TITLES) {
      if (level >= t.minLevel) title = t.title;
    }
    return title;
  }, []);

  const cnGetCurrentTitleInfo = useCallback((): CnTitleThreshold => {
    let current = CN_TITLES[0];
    for (const t of CN_TITLES) {
      if (state.level >= t.minLevel) current = t;
    }
    return current;
  }, [state.level]);

  const cnGetNextTitle = useCallback((): CnTitleThreshold | null => {
    for (const t of CN_TITLES) {
      if (state.level < t.minLevel) return t;
    }
    return null;
  }, [state.level]);

  // ---- Ingredient Access ----

  const cnGetIngredients = useCallback((): readonly CnIngredientDef[] => CN_INGREDIENTS, []);

  const cnGetIngredientDef = useCallback((ingredientId: string): CnIngredientDef | undefined => {
    return CN_INGREDIENTS.find((i) => i.id === ingredientId);
  }, []);

  const cnGetIngredientsByRarity = useCallback((rarity: CnRarity): CnIngredientDef[] => {
    return CN_INGREDIENTS.filter((i) => i.rarity === rarity);
  }, []);

  // ---- NPCs ----

  const cnGetNpcs = useCallback((): readonly CnNpcState[] => state.npcs, [state.npcs]);

  const cnGetNpcDef = useCallback((npcId: string): CnNpcDef | undefined => {
    return CN_NPCS.find((n) => n.id === npcId);
  }, []);

  const cnIsNpcMet = useCallback((npcId: string): boolean => {
    const npc = state.npcs.find((n) => n.npcId === npcId);
    return npc ? npc.met : false;
  }, [state.npcs]);

  const cnMeetNpc = useCallback((npcId: string): boolean => {
    let success = false;
    setState((prev) => {
      const npc = prev.npcs.find((n) => n.npcId === npcId);
      if (!npc) return prev;
      if (npc.met) {
        success = true;
        const npcs = prev.npcs.map((n) => n.npcId === npcId ? { ...n, timesVisited: n.timesVisited + 1 } : n);
        return { ...prev, npcs };
      }
      success = true;
      const npcs = prev.npcs.map((n) => n.npcId === npcId ? { ...n, met: true, timesVisited: 1 } : n);
      const def = CN_NPCS.find((d) => d.id === npcId);
      const xpGain = def ? 15 : 5;
      return { ...prev, npcs, xp: prev.xp + xpGain, totalXp: prev.totalXp + xpGain, stats: { ...prev.stats, totalXPEarned: prev.stats.totalXPEarned + xpGain } };
    });
    return success;
  }, []);

  const cnGetNpcTimesVisited = useCallback((npcId: string): number => {
    const npc = state.npcs.find((n) => n.npcId === npcId);
    return npc ? npc.timesVisited : 0;
  }, [state.npcs]);

  const cnGetMetNpcCount = useCallback((): number => {
    return state.npcs.filter((n) => n.met).length;
  }, [state.npcs]);

  const cnGetNpcsByShop = useCallback((shopId: string): CnNpcDef[] => {
    return CN_NPCS.filter((n) => n.shopId === shopId);
  }, []);

  // ---- Quests ----

  const cnGetQuests = useCallback((): readonly CnQuestState[] => state.quests, [state.quests]);

  const cnGetQuestDef = useCallback((questId: string): CnQuestDef | undefined => {
    return CN_QUESTS.find((q) => q.id === questId);
  }, []);

  const cnGetAvailableQuests = useCallback((): CnQuestState[] => {
    return state.quests.filter((q) => !q.accepted && !q.completed);
  }, [state.quests]);

  const cnGetActiveQuests = useCallback((): CnQuestState[] => {
    return state.quests.filter((q) => q.accepted && !q.completed);
  }, [state.quests]);

  const cnGetCompletedQuests = useCallback((): CnQuestState[] => {
    return state.quests.filter((q) => q.completed);
  }, [state.quests]);

  const cnGetClaimableQuests = useCallback((): CnQuestState[] => {
    return state.quests.filter((q) => q.completed && !q.claimed);
  }, [state.quests]);

  const cnAcceptQuest = useCallback((questId: string): boolean => {
    let success = false;
    setState((prev) => {
      const def = CN_QUESTS.find((q) => q.id === questId);
      if (!def || prev.level < def.requiredLevel) return prev;
      const quest = prev.quests.find((q) => q.questId === questId);
      if (!quest || quest.accepted || quest.completed) return prev;
      const activeCount = prev.quests.filter((q) => q.accepted && !q.completed).length;
      if (activeCount >= 3) return prev;
      success = true;
      const quests = prev.quests.map((q) => q.questId === questId ? { ...q, accepted: true } : q);
      return { ...prev, quests };
    });
    return success;
  }, []);

  const cnUpdateQuestProgress = useCallback((questType: CnQuestType, amount: number): void => {
    setState((prev) => {
      const quests = prev.quests.map((q) => {
        if (!q.accepted || q.completed) return q;
        const def = CN_QUESTS.find((qd) => qd.id === q.questId);
        if (!def || def.type !== questType) return q;
        const newProgress = Math.min(def.target, q.progress + amount);
        return { ...q, progress: newProgress, completed: newProgress >= def.target };
      });
      return { ...prev, quests };
    });
  }, []);

  const cnClaimQuestReward = useCallback((questId: string): { coins: number; xp: number } | null => {
    let reward: { coins: number; xp: number } | null = null;
    setState((prev) => {
      const quest = prev.quests.find((q) => q.questId === questId);
      const def = CN_QUESTS.find((q) => q.id === questId);
      if (!quest || !def || !quest.completed || quest.claimed) return prev;
      reward = { coins: def.rewardCoins, xp: def.rewardXP };
      const quests = prev.quests.map((q) => q.questId === questId ? { ...q, claimed: true } : q);
      return {
        ...prev,
        quests,
        coins: cnClampCoins(prev.coins + def.rewardCoins),
        xp: prev.xp + def.rewardXP,
        totalXp: prev.totalXp + def.rewardXP,
        stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + def.rewardCoins, totalXPEarned: prev.stats.totalXPEarned + def.rewardXP },
      };
    });
    return reward;
  }, []);

  const cnGetQuestProgress = useCallback((questId: string): { progress: number; target: number } | null => {
    const quest = state.quests.find((q) => q.questId === questId);
    const def = CN_QUESTS.find((q) => q.id === questId);
    if (!quest || !def) return null;
    return { progress: quest.progress, target: def.target };
  }, [state.quests]);

  // ---- Daily Task Pool ----

  const cnGetDailyTaskPool = useCallback((): readonly CnDailyTaskPoolDef[] => CN_DAILY_TASK_POOL, []);

  const cnGetDailyTaskByType = useCallback((type: CnDailyType): CnDailyTaskPoolDef[] => {
    return CN_DAILY_TASK_POOL.filter((t) => t.type === type);
  }, []);

  // ---- Theme & Zones ----

  const cnGetTheme = useCallback((): typeof CN_THEME => CN_THEME, []);

  const cnGetDecorationZones = useCallback((): typeof CN_DECORATION_ZONES => CN_DECORATION_ZONES, []);

  const cnGetDecorationsForZone = useCallback((zone: CnDecorationZone): { def: CnDecorationDef; placed: boolean }[] => {
    return CN_DECORATIONS.filter((d) => d.zone === zone).map((def) => {
      const state = stateRef.current.decorations.find((ds) => ds.decorationId === def.id);
      return { def, placed: state ? state.placed : false };
    });
  }, []);

  const cnGetZoneHappiness = useCallback((zone: CnDecorationZone): number => {
    return state.decorations.filter((d) => d.zone === zone && d.placed).reduce((sum, d) => {
      const def = CN_DECORATIONS.find((dd) => dd.id === d.decorationId);
      return sum + (def ? def.happinessBonus : 0);
    }, 0);
  }, [state.decorations]);

  const cnGetRecipeDifficulties = useCallback((): typeof CN_RECIPE_DIFFICULTIES => CN_RECIPE_DIFFICULTIES, []);

  // ---- Utility Getters ----

  const cnGetCandyValue = useCallback((candyId: string): number => {
    const def = CN_CANDIES.find((c) => c.id === candyId);
    return def ? def.value : 0;
  }, []);

  const cnGetCandySweetness = useCallback((candyId: string): number => {
    const def = CN_CANDIES.find((c) => c.id === candyId);
    return def ? def.sweetness : 0;
  }, []);

  const cnGetCandyRarity = useCallback((candyId: string): CnRarity | undefined => {
    const def = CN_CANDIES.find((c) => c.id === candyId);
    return def ? def.rarity : undefined;
  }, []);

  const cnGetShopLevel = useCallback((shopId: string): number => {
    const shop = state.shops.find((s) => s.shopId === shopId);
    return shop ? shop.level : 0;
  }, [state.shops]);

  const cnIsShopUnlocked = useCallback((shopId: string): boolean => {
    const shop = state.shops.find((s) => s.shopId === shopId);
    return shop ? shop.unlocked : false;
  }, [state.shops]);

  const cnCanAfford = useCallback((cost: number): boolean => {
    return state.coins >= cost;
  }, [state.coins]);

  const cnGetShopDailyEarnings = useCallback((shopId: string): number => {
    const shop = state.shops.find((s) => s.shopId === shopId);
    return shop ? shop.dailyEarnings : 0;
  }, [state.shops]);

  const cnGetTotalShopEarnings = useCallback((): number => {
    return state.shops.reduce((sum, s) => sum + s.dailyEarnings, 0);
  }, [state.shops]);

  const cnGetCandyColor = useCallback((candyId: string): string => {
    const def = CN_CANDIES.find((c) => c.id === candyId);
    return def ? def.color : '#F9A8D4';
  }, []);

  const cnGetCandyEmoji = useCallback((candyId: string): string => {
    const def = CN_CANDIES.find((c) => c.id === candyId);
    return def ? def.emoji : '🍬';
  }, []);

  const cnGetRarityColor = useCallback((rarity: CnRarity): string => {
    const entry = CN_RARITIES.find((r) => r.key === rarity);
    return entry ? entry.color : '#F9A8D4';
  }, []);

  const cnGetRarityLabel = useCallback((rarity: CnRarity): string => {
    const entry = CN_RARITIES.find((r) => r.key === rarity);
    return entry ? entry.label : 'Common';
  }, []);

  const cnHasCandy = useCallback((candyId: string): boolean => {
    const instance = state.candies.find((c) => c.candyId === candyId);
    return instance ? instance.count > 0 : false;
  }, [state.candies]);

  const cnIsMaxLevel = useCallback((): boolean => state.level >= CN_MAX_LEVEL, [state.level]);

  const cnGetTotalUnlockedRecipes = useCallback((): number => {
    return state.recipes.filter((r) => r.unlocked).length;
  }, [state.recipes]);

  const cnGetTotalMasteredCount = useCallback((): number => {
    return state.recipes.filter((r) => r.mastered).length;
  }, [state.recipes]);

  // ---- Combo ----

  const cnRecordCombo = useCallback((comboSize: number): void => {
    setState((prev) => {
      const highestCombo = Math.max(prev.stats.highestCombo, comboSize);
      return { ...prev, stats: { ...prev.stats, highestCombo } };
    });
  }, []);

  // ---- Bulk Actions ----

  const cnBakeMultiple = useCallback((bakes: { recipeId: string; count: number }[]): { totalCandies: { candyId: string; amount: number }[]; totalXP: number; totalCoins: number } => {
    let totalCandies: { candyId: string; amount: number }[] = [];
    let totalXP = 0;
    let totalCoins = 0;
    for (const bake of bakes) {
      for (let i = 0; i < bake.count; i++) {
        const result = cnBakeCandy(bake.recipeId);
        if (result.success) {
          for (const cr of result.candies) {
            const existing = totalCandies.find((tc) => tc.candyId === cr.candyId);
            if (existing) {
              existing.amount += cr.amount;
            } else {
              totalCandies.push({ ...cr });
            }
          }
          const def = CN_RECIPES.find((r) => r.id === bake.recipeId);
          if (def) {
            totalXP += Math.floor(def.xpReward * cnDiffMultiplier(def.difficulty));
            totalCoins += def.sellPrice;
          }
        }
      }
    }
    return { totalCandies, totalXP, totalCoins };
  }, [cnBakeCandy]);

  const cnSellAllCandies = useCallback((): number => {
    let totalSold = 0;
    setState((prev) => {
      let coinGain = 0;
      const candies = prev.candies.map((c) => {
        const def = CN_CANDIES.find((cd) => cd.id === c.candyId);
        const value = def ? def.value * c.count : 0;
        coinGain += value;
        return { ...c, count: 0 };
      });
      totalSold = coinGain;
      return { ...prev, candies, coins: cnClampCoins(prev.coins + coinGain), stats: { ...prev.stats, totalCoinsEarned: prev.stats.totalCoinsEarned + coinGain } };
    });
    return totalSold;
  }, []);

  // ---- Progress ----

  const cnGetProgressPercent = useCallback((): number => {
    return CN_MAX_LEVEL > 0 ? (state.level / CN_MAX_LEVEL) * 100 : 0;
  }, [state.level]);

  const cnGetKingdomCompletion = useCallback((): { shops: number; recipes: number; decorations: number; achievements: number; overall: number } => {
    const shopsPct = CN_SHOPS.length > 0 ? (state.shops.filter((s) => s.unlocked).length / CN_SHOPS.length) * 100 : 0;
    const recipesPct = CN_RECIPES.length > 0 ? (state.recipes.filter((r) => r.unlocked).length / CN_RECIPES.length) * 100 : 0;
    const decorPct = CN_DECORATIONS.length > 0 ? (state.decorations.filter((d) => d.placed).length / CN_DECORATIONS.length) * 100 : 0;
    const achPct = CN_ACHIEVEMENTS.length > 0 ? (state.achievements.filter((a) => a.unlocked).length / CN_ACHIEVEMENTS.length) * 100 : 0;
    const overall = (shopsPct + recipesPct + decorPct + achPct) / 4;
    return { shops: Math.floor(shopsPct), recipes: Math.floor(recipesPct), decorations: Math.floor(decorPct), achievements: Math.floor(achPct), overall: Math.floor(overall) };
  }, [state.shops, state.recipes, state.decorations, state.achievements]);

  // ---- Random Candy ----

  const cnDiscoverRandomCandy = useCallback((): CnCandyDef | null => {
    const owned = new Set(state.candies.filter((c) => c.count > 0).map((c) => c.candyId));
    const unowned = CN_CANDIES.filter((c) => !owned.has(c.id));
    if (unowned.length === 0) return null;
    const rng = prngRef.current();
    const picked = unowned[Math.floor(rng * unowned.length)];
    cnAddCandy(picked.id, 1);
    return picked;
  }, [state.candies, cnAddCandy]);

  const cnGetRandomCandyGift = useCallback((): { candy: CnCandyDef; amount: number } | null => {
    const rng = prngRef.current();
    const rarityRoll = rng;
    let pool: CnCandyDef[];
    if (rarityRoll > 0.95) {
      pool = CN_CANDIES.filter((c) => c.rarity === 'Legendary');
    } else if (rarityRoll > 0.80) {
      pool = CN_CANDIES.filter((c) => c.rarity === 'Epic');
    } else if (rarityRoll > 0.55) {
      pool = CN_CANDIES.filter((c) => c.rarity === 'Rare');
    } else if (rarityRoll > 0.25) {
      pool = CN_CANDIES.filter((c) => c.rarity === 'Uncommon');
    } else {
      pool = CN_CANDIES.filter((c) => c.rarity === 'Common');
    }
    if (pool.length === 0) pool = CN_CANDIES.filter((c) => c.rarity === 'Common');
    if (pool.length === 0) return null;
    const candy = pool[Math.floor(prngRef.current() * pool.length)];
    const amount = 1 + Math.floor(prngRef.current() * 3);
    cnAddCandy(candy.id, amount);
    return { candy, amount };
  }, [cnAddCandy]);

  // ---- Ref Access ----

  const cnGetStateRef = useCallback((): React.RefObject<CandyKingdomState> => stateRef, []);

  // ---- Reset (plain function, NO useCallback) ----

  const cnResetProgress = (newSeed?: number): void => {
    const s = cnCreateInitialState(newSeed);
    prngRef.current = cnMulberry32(s.seed);
    setState(s);
  };

  return {
    // Core
    cnGetState,
    cnGetLevel,
    cnGetXp,
    cnGetTotalXp,
    cnGetCoins,
    cnGetTitle,
    cnGetStreak,
    cnGetXpToNext,
    cnGetXpProgress,
    cnGetRandom,
    cnGetRandomInt,
    // Candies
    cnGetCandies,
    cnGetCandyDef,
    cnGetCandyCount,
    cnGetUniqueCandyCount,
    cnGetTotalCandyCount,
    cnGetCandiesByRarity,
    cnGetCandiesByCategory,
    cnAddCandy,
    cnRemoveCandy,
    cnEatCandy,
    // XP & Coins
    cnAddXp,
    cnAddCoins,
    cnSpendCoins,
    // Shops
    cnGetShops,
    cnGetShopDef,
    cnGetUnlockedShops,
    cnOpenShop,
    cnUpgradeShop,
    cnVisitShop,
    cnGetShopUpgradeCost,
    // Recipes
    cnGetRecipes,
    cnGetRecipeDef,
    cnGetUnlockedRecipes,
    cnGetMasteredRecipes,
    cnUnlockRecipe,
    cnBakeCandy,
    cnGetRecipeTimesBaked,
    cnIsRecipeMastered,
    // Decorations
    cnGetDecorations,
    cnGetDecorationDef,
    cnGetPlacedDecorations,
    cnGetDecorationsByZone,
    cnBuyDecoration,
    cnDecorate,
    cnRemoveDecoration,
    cnGetTotalHappiness,
    // Achievements
    cnGetAchievements,
    cnGetAchievementDef,
    cnGetUnlockedAchievements,
    cnGetLockedAchievements,
    cnCheckAchievements,
    // Sugar Rushes
    cnGetSugarRushes,
    cnGetSugarRushDef,
    cnGetUnlockedRushes,
    cnGetActiveRush,
    cnGetRushTimeRemaining,
    cnActivateRush,
    cnExpireRush,
    cnGetRushCooldownRemaining,
    // Daily
    cnGetDaily,
    cnCheckDailyReset,
    cnClaimDailyReward,
    cnUpdateDailyQuest,
    cnIsDailyQuestComplete,
    cnResetDaily,
    // Stats
    cnGetStats,
    cnGetTotalBaked,
    cnGetTotalEaten,
    cnGetDailyBaked,
    // Titles
    cnComputeTitle,
    cnGetCurrentTitleInfo,
    cnGetNextTitle,
    // Ingredients
    cnGetIngredients,
    cnGetIngredientDef,
    cnGetIngredientsByRarity,
    // NPCs
    cnGetNpcs,
    cnGetNpcDef,
    cnIsNpcMet,
    cnMeetNpc,
    cnGetNpcTimesVisited,
    cnGetMetNpcCount,
    cnGetNpcsByShop,
    // Quests
    cnGetQuests,
    cnGetQuestDef,
    cnGetAvailableQuests,
    cnGetActiveQuests,
    cnGetCompletedQuests,
    cnGetClaimableQuests,
    cnAcceptQuest,
    cnUpdateQuestProgress,
    cnClaimQuestReward,
    cnGetQuestProgress,
    // Daily Task Pool
    cnGetDailyTaskPool,
    cnGetDailyTaskByType,
    // Theme & Zones
    cnGetTheme,
    cnGetDecorationZones,
    cnGetDecorationsForZone,
    cnGetZoneHappiness,
    cnGetRecipeDifficulties,
    // Utility Getters
    cnGetCandyValue,
    cnGetCandySweetness,
    cnGetCandyRarity,
    cnGetShopLevel,
    cnIsShopUnlocked,
    cnCanAfford,
    cnGetShopDailyEarnings,
    cnGetTotalShopEarnings,
    cnGetCandyColor,
    cnGetCandyEmoji,
    cnGetRarityColor,
    cnGetRarityLabel,
    cnHasCandy,
    cnIsMaxLevel,
    cnGetTotalUnlockedRecipes,
    cnGetTotalMasteredCount,
    // Combo
    cnRecordCombo,
    // Bulk
    cnBakeMultiple,
    cnSellAllCandies,
    // Progress
    cnGetProgressPercent,
    cnGetKingdomCompletion,
    // Random
    cnDiscoverRandomCandy,
    cnGetRandomCandyGift,
    // Ref
    cnGetStateRef,
    // Reset (plain function)
    cnResetProgress,
  };
}
