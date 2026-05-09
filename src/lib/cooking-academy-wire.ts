// =============================================================================
// Cooking Academy Wire — SSR-safe game state & logic for Word Snake
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Type Definitions
// ---------------------------------------------------------------------------

export type CuisineId =
  | 'italian' | 'japanese' | 'french' | 'mexican'
  | 'chinese' | 'indian' | 'thai' | 'american';

export type StationId = 'prep' | 'stovetop' | 'oven' | 'grill' | 'wok';

export type QualityTier = 'Common' | 'Fresh' | 'Premium' | 'Exotic';

export type DishRating = 1 | 2 | 3 | 4 | 5;

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  cuisines: CuisineId[];
  basePrice: number;
  qualityTiers: QualityTier[];
}

export type IngredientCategory =
  | 'Protein' | 'Vegetable' | 'Grain' | 'Spice' | 'Dairy' | 'Sauce';

export interface RecipeStep {
  order: number;
  instruction: string;
  station: StationId;
  durationSec: number;
  wordHint: string;
  difficulty: number; // 1-5
}

export interface Recipe {
  id: string;
  name: string;
  cuisine: CuisineId;
  ingredients: string[]; // ingredient ids
  steps: RecipeStep[];
  cookTimeSec: number;
  baseXp: number;
  baseCoins: number;
  difficulty: number; // 1-5
  isSecret: boolean;
}

export interface CookingStation {
  id: StationId;
  name: string;
  level: number; // 1-5
  unlocked: boolean;
  upgradeCost: number;
  speedBonus: number;
  qualityBonus: number;
}

export interface OpponentChef {
  id: string;
  name: string;
  cuisine: CuisineId;
  skillLevel: number; // 1-10
  avatar: string;
  specialty: string;
  personality: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: () => boolean;
  xpReward: number;
  coinReward: number;
  unlocked: boolean;
}

export interface KitchenDisaster {
  id: string;
  name: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  penaltySeconds: number;
  coinLoss: number;
}

export interface SpiceMix {
  id: string;
  name: string;
  baseSpices: string[];
  bonus: { station: StationId; qualityBonus: number };
  discoverCost: number;
}

export interface PlatingStyle {
  id: string;
  name: string;
  bonusPercent: number;
  description: string;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  season: SeasonId;
  specialRecipes: string[];
  bonusMultiplier: number;
}

export interface FoodTruckCustomer {
  id: string;
  name: string;
  order: string; // recipe id
  patience: number; // seconds
  tipMultiplier: number;
  satisfaction: number; // 0-100
}

export interface DailyChallenge {
  dateSeed: string;
  recipeId: string;
  constraint: string;
  bonusMultiplier: number;
  timeLimit: number;
}

export interface CookingCombo {
  count: number;
  multiplier: number;
  lastPerfectTime: number;
  bestStreak: number;
}

// ---------------------------------------------------------------------------
// 2. Static Data — Cuisines
// ---------------------------------------------------------------------------

export const CK_CUISINES: Record<CuisineId, { name: string; emoji: string; color: string; description: string }> = {
  italian: { name: 'Italian', emoji: '🍝', color: '#2E7D32', description: 'Mediterranean flavors, pasta & pizza mastery' },
  japanese: { name: 'Japanese', emoji: '🍱', color: '#C62828', description: 'Precise cuts, umami-rich dishes, sushi art' },
  french: { name: 'French', emoji: '🥐', color: '#4A148C', description: 'Classical technique, sauces & patisserie' },
  mexican: { name: 'Mexican', emoji: '🌮', color: '#E65100', description: 'Bold spices, mole sauces & street food' },
  chinese: { name: 'Chinese', emoji: '🥡', color: '#D32F2F', description: 'Wok-fired dishes, regional diversity' },
  indian: { name: 'Indian', emoji: '🍛', color: '#FF8F00', description: 'Complex spice layers, tandoor cooking' },
  thai: { name: 'Thai', emoji: '🍜', color: '#1B5E20', description: 'Sweet-sour-salty balance, aromatic herbs' },
  american: { name: 'American', emoji: '🍔', color: '#1565C0', description: 'Comfort food, BBQ & diner classics' },
};

// ---------------------------------------------------------------------------
// 3. Static Data — Ingredients (40 total)
// ---------------------------------------------------------------------------

export const CK_INGREDIENTS: Ingredient[] = [
  // Proteins (8)
  { id: 'chicken_breast', name: 'Chicken Breast', category: 'Protein', cuisines: ['italian', 'american', 'chinese', 'indian', 'thai', 'japanese'], basePrice: 8, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'salmon_fillet', name: 'Salmon Fillet', category: 'Protein', cuisines: ['japanese', 'american', 'french'], basePrice: 15, qualityTiers: ['Fresh', 'Premium', 'Exotic'] },
  { id: 'ground_beef', name: 'Ground Beef', category: 'Protein', cuisines: ['mexican', 'american', 'italian'], basePrice: 10, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'shrimp', name: 'Tiger Shrimp', category: 'Protein', cuisines: ['thai', 'chinese', 'japanese', 'mexican'], basePrice: 18, qualityTiers: ['Fresh', 'Premium', 'Exotic'] },
  { id: 'tofu_firm', name: 'Firm Tofu', category: 'Protein', cuisines: ['japanese', 'chinese', 'thai', 'indian'], basePrice: 4, qualityTiers: ['Common', 'Fresh'] },
  { id: 'pork_belly', name: 'Pork Belly', category: 'Protein', cuisines: ['chinese', 'japanese', 'american'], basePrice: 12, qualityTiers: ['Fresh', 'Premium', 'Exotic'] },
  { id: 'lamb_leg', name: 'Lamb Leg', category: 'Protein', cuisines: ['indian', 'french', 'american'], basePrice: 20, qualityTiers: ['Premium', 'Exotic'] },
  { id: 'tuna_steak', name: 'Tuna Steak', category: 'Protein', cuisines: ['japanese', 'american', 'french'], basePrice: 22, qualityTiers: ['Premium', 'Exotic'] },
  // Vegetables (8)
  { id: 'tomato', name: 'Roma Tomato', category: 'Vegetable', cuisines: ['italian', 'mexican', 'american', 'indian'], basePrice: 2, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'bell_pepper', name: 'Bell Pepper', category: 'Vegetable', cuisines: ['mexican', 'american', 'thai', 'chinese'], basePrice: 2, qualityTiers: ['Common', 'Fresh'] },
  { id: 'onion', name: 'Yellow Onion', category: 'Vegetable', cuisines: ['indian', 'mexican', 'american', 'french', 'chinese', 'thai'], basePrice: 1, qualityTiers: ['Common', 'Fresh'] },
  { id: 'garlic', name: 'Garlic Cloves', category: 'Vegetable', cuisines: ['italian', 'chinese', 'japanese', 'indian', 'thai', 'french', 'mexican'], basePrice: 1, qualityTiers: ['Common', 'Fresh'] },
  { id: 'basil_leaves', name: 'Fresh Basil', category: 'Vegetable', cuisines: ['italian', 'thai'], basePrice: 3, qualityTiers: ['Fresh', 'Premium'] },
  { id: 'bok_choy', name: 'Bok Choy', category: 'Vegetable', cuisines: ['chinese', 'japanese'], basePrice: 3, qualityTiers: ['Fresh', 'Premium'] },
  { id: 'avocado', name: 'Avocado', category: 'Vegetable', cuisines: ['mexican', 'american', 'japanese'], basePrice: 4, qualityTiers: ['Fresh', 'Premium', 'Exotic'] },
  { id: 'mushroom', name: 'Cremini Mushroom', category: 'Vegetable', cuisines: ['italian', 'japanese', 'chinese', 'french'], basePrice: 3, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  // Grains (6)
  { id: 'pasta_spaghetti', name: 'Spaghetti Pasta', category: 'Grain', cuisines: ['italian', 'american'], basePrice: 2, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'jasmine_rice', name: 'Jasmine Rice', category: 'Grain', cuisines: ['thai', 'chinese', 'japanese', 'indian'], basePrice: 2, qualityTiers: ['Common', 'Fresh'] },
  { id: 'tortilla', name: 'Corn Tortilla', category: 'Grain', cuisines: ['mexican'], basePrice: 2, qualityTiers: ['Common', 'Fresh'] },
  { id: 'bread_french', name: 'French Baguette', category: 'Grain', cuisines: ['french', 'american'], basePrice: 3, qualityTiers: ['Fresh', 'Premium'] },
  { id: 'soba_noodles', name: 'Soba Noodles', category: 'Grain', cuisines: ['japanese'], basePrice: 4, qualityTiers: ['Fresh', 'Premium'] },
  { id: 'naan_bread', name: 'Naan Bread', category: 'Grain', cuisines: ['indian'], basePrice: 2, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  // Spices (8)
  { id: 'oregano', name: 'Dried Oregano', category: 'Spice', cuisines: ['italian', 'mexican'], basePrice: 3, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'cumin', name: 'Ground Cumin', category: 'Spice', cuisines: ['indian', 'mexican', 'thai'], basePrice: 3, qualityTiers: ['Common', 'Fresh'] },
  { id: 'turmeric', name: 'Turmeric Powder', category: 'Spice', cuisines: ['indian', 'thai'], basePrice: 4, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'chili_flakes', name: 'Red Chili Flakes', category: 'Spice', cuisines: ['italian', 'mexican', 'thai', 'indian', 'chinese'], basePrice: 3, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'star_anise', name: 'Star Anise', category: 'Spice', cuisines: ['chinese', 'indian'], basePrice: 5, qualityTiers: ['Fresh', 'Premium', 'Exotic'] },
  { id: 'wasabi_powder', name: 'Wasabi Powder', category: 'Spice', cuisines: ['japanese'], basePrice: 8, qualityTiers: ['Premium', 'Exotic'] },
  { id: 'lemongrass', name: 'Lemongrass', category: 'Spice', cuisines: ['thai', 'indian'], basePrice: 4, qualityTiers: ['Fresh', 'Premium'] },
  { id: 'thyme', name: 'Fresh Thyme', category: 'Spice', cuisines: ['french', 'italian', 'american'], basePrice: 3, qualityTiers: ['Fresh', 'Premium'] },
  // Dairy (5)
  { id: 'parmesan_cheese', name: 'Parmesan Cheese', category: 'Dairy', cuisines: ['italian', 'american'], basePrice: 8, qualityTiers: ['Fresh', 'Premium', 'Exotic'] },
  { id: 'butter_unsalted', name: 'Unsalted Butter', category: 'Dairy', cuisines: ['french', 'american', 'italian', 'indian'], basePrice: 4, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'heavy_cream', name: 'Heavy Cream', category: 'Dairy', cuisines: ['french', 'italian', 'american'], basePrice: 5, qualityTiers: ['Common', 'Fresh'] },
  { id: 'mozzarella', name: 'Fresh Mozzarella', category: 'Dairy', cuisines: ['italian', 'american'], basePrice: 7, qualityTiers: ['Fresh', 'Premium'] },
  { id: 'greek_yogurt', name: 'Greek Yogurt', category: 'Dairy', cuisines: ['indian', 'american'], basePrice: 4, qualityTiers: ['Common', 'Fresh'] },
  // Sauces (5)
  { id: 'soy_sauce', name: 'Soy Sauce', category: 'Sauce', cuisines: ['japanese', 'chinese', 'thai'], basePrice: 3, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'tomato_sauce', name: 'Marinara Sauce', category: 'Sauce', cuisines: ['italian', 'american'], basePrice: 3, qualityTiers: ['Common', 'Fresh'] },
  { id: 'fish_sauce', name: 'Fish Sauce', category: 'Sauce', cuisines: ['thai', 'vietnamese' as any], basePrice: 4, qualityTiers: ['Fresh', 'Premium'] },
  { id: 'teriyaki_sauce', name: 'Teriyaki Sauce', category: 'Sauce', cuisines: ['japanese', 'american'], basePrice: 4, qualityTiers: ['Common', 'Fresh', 'Premium'] },
  { id: 'sriracha', name: 'Sriracha Sauce', category: 'Sauce', cuisines: ['thai', 'american', 'mexican'], basePrice: 4, qualityTiers: ['Common', 'Fresh', 'Premium'] },
];

// ---------------------------------------------------------------------------
// 4. Static Data — Recipes (60 total, 6-8 per cuisine)
// ---------------------------------------------------------------------------

export const CK_RECIPES: Recipe[] = [
  // ── Italian (8) ──
  { id: 'spaghetti_carbonara', name: 'Spaghetti Carbonara', cuisine: 'italian', ingredients: ['pasta_spaghetti', 'pork_belly', 'parmesan_cheese', 'garlic'], steps: [{ order: 1, instruction: 'Boil pasta until al dente', station: 'stovetop', durationSec: 10, wordHint: 'ALDENTE', difficulty: 2 }, { order: 2, instruction: 'Crisp the guanciale in a pan', station: 'stovetop', durationSec: 8, wordHint: 'CRISP', difficulty: 3 }, { order: 3, instruction: 'Whisk eggs with cheese', station: 'prep', durationSec: 5, wordHint: 'WHISK', difficulty: 2 }, { order: 4, instruction: 'Toss pasta with egg mixture off heat', station: 'prep', durationSec: 6, wordHint: 'TOSS', difficulty: 4 }], cookTimeSec: 25, baseXp: 50, baseCoins: 30, difficulty: 3, isSecret: false },
  { id: 'margherita_pizza', name: 'Margherita Pizza', cuisine: 'italian', ingredients: ['tomato', 'mozzarella', 'basil_leaves', 'garlic'], steps: [{ order: 1, instruction: 'Knead and stretch pizza dough', station: 'prep', durationSec: 8, wordHint: 'STRETCH', difficulty: 2 }, { order: 2, instruction: 'Spread tomato sauce evenly', station: 'prep', durationSec: 5, wordHint: 'SPREAD', difficulty: 1 }, { order: 3, instruction: 'Bake at highest heat', station: 'oven', durationSec: 12, wordHint: 'BAKE', difficulty: 3 }], cookTimeSec: 20, baseXp: 45, baseCoins: 25, difficulty: 2, isSecret: false },
  { id: 'risotto_mushroom', name: 'Mushroom Risotto', cuisine: 'italian', ingredients: ['mushroom', 'onion', 'butter_unsalted', 'parmesan_cheese', 'garlic'], steps: [{ order: 1, instruction: 'Sauté onions and mushrooms', station: 'stovetop', durationSec: 8, wordHint: 'SAUTE', difficulty: 2 }, { order: 2, instruction: 'Toast rice in butter', station: 'stovetop', durationSec: 5, wordHint: 'TOAST', difficulty: 3 }, { order: 3, instruction: 'Gradually add broth while stirring', station: 'stovetop', durationSec: 15, wordHint: 'STIR', difficulty: 4 }], cookTimeSec: 25, baseXp: 60, baseCoins: 35, difficulty: 4, isSecret: false },
  { id: 'lasagna_classic', name: 'Classic Lasagna', cuisine: 'italian', ingredients: ['pasta_spaghetti', 'tomato_sauce', 'mozzarella', 'parmesan_cheese', 'ground_beef'], steps: [{ order: 1, instruction: 'Brown the ground beef', station: 'stovetop', durationSec: 8, wordHint: 'BROWN', difficulty: 2 }, { order: 2, instruction: 'Layer pasta, sauce, and cheese', station: 'prep', durationSec: 10, wordHint: 'LAYER', difficulty: 3 }, { order: 3, instruction: 'Bake until bubbly and golden', station: 'oven', durationSec: 18, wordHint: 'GOLDEN', difficulty: 3 }], cookTimeSec: 30, baseXp: 70, baseCoins: 40, difficulty: 4, isSecret: false },
  { id: 'tiramisu', name: 'Tiramisu', cuisine: 'italian', ingredients: ['heavy_cream', 'mascarpone' as any], steps: [{ order: 1, instruction: 'Whisk mascarpone with cream', station: 'prep', durationSec: 8, wordHint: 'WHISK', difficulty: 3 }, { order: 2, instruction: 'Soak ladyfingers in espresso', station: 'prep', durationSec: 5, wordHint: 'SOAK', difficulty: 2 }, { order: 3, instruction: 'Chill in refrigerator to set', station: 'prep', durationSec: 10, wordHint: 'CHILL', difficulty: 1 }], cookTimeSec: 20, baseXp: 55, baseCoins: 45, difficulty: 3, isSecret: true },
  { id: 'minestrone', name: 'Minestrone Soup', cuisine: 'italian', ingredients: ['tomato', 'onion', 'garlic', 'basil_leaves'], steps: [{ order: 1, instruction: 'Sauté aromatics in olive oil', station: 'stovetop', durationSec: 6, wordHint: 'AROMA', difficulty: 2 }, { order: 2, instruction: 'Add vegetables and broth', station: 'stovetop', durationSec: 12, wordHint: 'SIMMER', difficulty: 2 }], cookTimeSec: 15, baseXp: 35, baseCoins: 20, difficulty: 2, isSecret: false },
  { id: 'bruschetta', name: 'Bruschetta', cuisine: 'italian', ingredients: ['bread_french', 'tomato', 'basil_leaves', 'garlic'], steps: [{ order: 1, instruction: 'Toast bread until golden', station: 'grill', durationSec: 4, wordHint: 'TOAST', difficulty: 1 }, { order: 2, instruction: 'Dice tomatoes and mix topping', station: 'prep', durationSec: 5, wordHint: 'DICE', difficulty: 2 }], cookTimeSec: 8, baseXp: 25, baseCoins: 15, difficulty: 1, isSecret: false },
  { id: 'gnocchi_pesto', name: 'Gnocchi al Pesto', cuisine: 'italian', ingredients: ['potato' as any, 'basil_leaves', 'parmesan_cheese', 'garlic'], steps: [{ order: 1, instruction: 'Boil potatoes and mash', station: 'stovetop', durationSec: 10, wordHint: 'MASH', difficulty: 2 }, { order: 2, instruction: 'Blend pesto sauce', station: 'prep', durationSec: 6, wordHint: 'BLEND', difficulty: 3 }, { order: 3, instruction: 'Pan-fry gnocchi until crispy', station: 'stovetop', durationSec: 7, wordHint: 'FRY', difficulty: 3 }], cookTimeSec: 20, baseXp: 50, baseCoins: 30, difficulty: 3, isSecret: false },

  // ── Japanese (8) ──
  { id: 'sushi_salmon', name: 'Salmon Nigiri', cuisine: 'japanese', ingredients: ['salmon_fillet', 'jasmine_rice', 'wasabi_powder', 'soy_sauce'], steps: [{ order: 1, instruction: 'Sushi rice: wash, cook, season', station: 'stovetop', durationSec: 12, wordHint: 'SEASON', difficulty: 3 }, { order: 2, instruction: 'Slice salmon at an angle', station: 'prep', durationSec: 8, wordHint: 'SLICE', difficulty: 4 }, { order: 3, instruction: 'Form nigiri by hand', station: 'prep', durationSec: 6, wordHint: 'FORM', difficulty: 4 }], cookTimeSec: 22, baseXp: 65, baseCoins: 50, difficulty: 4, isSecret: false },
  { id: 'ramen_tonkotsu', name: 'Tonkotsu Ramen', cuisine: 'japanese', ingredients: ['pork_belly', 'jasmine_rice', 'garlic', 'soy_sauce', 'bok_choy'], steps: [{ order: 1, instruction: 'Prepare rich pork broth', station: 'stovetop', durationSec: 15, wordHint: 'BROTH', difficulty: 4 }, { order: 2, instruction: 'Cook chashu pork belly', station: 'oven', durationSec: 12, wordHint: 'CHASHU', difficulty: 3 }, { order: 3, instruction: 'Cook noodles and assemble', station: 'stovetop', durationSec: 5, wordHint: 'ASSEMBLE', difficulty: 2 }], cookTimeSec: 30, baseXp: 80, baseCoins: 55, difficulty: 5, isSecret: false },
  { id: 'tempura_shrimp', name: 'Shrimp Tempura', cuisine: 'japanese', ingredients: ['shrimp', 'garlic'], steps: [{ order: 1, instruction: 'Make light batter', station: 'prep', durationSec: 5, wordHint: 'BATTER', difficulty: 3 }, { order: 2, instruction: 'Deep fry at precise temp', station: 'stovetop', durationSec: 8, wordHint: 'FRY', difficulty: 4 }], cookTimeSec: 12, baseXp: 50, baseCoins: 40, difficulty: 3, isSecret: false },
  { id: 'yakitori', name: 'Chicken Yakitori', cuisine: 'japanese', ingredients: ['chicken_breast', 'soy_sauce', 'garlic'], steps: [{ order: 1, instruction: 'Skewer chicken pieces', station: 'prep', durationSec: 5, wordHint: 'SKEWER', difficulty: 2 }, { order: 2, instruction: 'Grill with tare glaze', station: 'grill', durationSec: 8, wordHint: 'GLAZE', difficulty: 3 }], cookTimeSec: 12, baseXp: 40, baseCoins: 25, difficulty: 2, isSecret: false },
  { id: 'miso_soup', name: 'Miso Soup', cuisine: 'japanese', ingredients: ['tofu_firm', 'bok_choy', 'soy_sauce'], steps: [{ order: 1, instruction: 'Dissolve miso in dashi', station: 'stovetop', durationSec: 6, wordHint: 'DISSOLVE', difficulty: 2 }, { order: 2, instruction: 'Add tofu and greens', station: 'stovetop', durationSec: 3, wordHint: 'FLOAT', difficulty: 1 }], cookTimeSec: 8, baseXp: 25, baseCoins: 15, difficulty: 1, isSecret: false },
  { id: 'gyoza', name: 'Pan-Fried Gyoza', cuisine: 'japanese', ingredients: ['ground_beef', 'garlic', 'onion', 'soy_sauce'], steps: [{ order: 1, instruction: 'Fill and fold dumplings', station: 'prep', durationSec: 10, wordHint: 'FOLD', difficulty: 4 }, { order: 2, instruction: 'Pan-fry with steam technique', station: 'stovetop', durationSec: 8, wordHint: 'STEAM', difficulty: 3 }], cookTimeSec: 16, baseXp: 50, baseCoins: 30, difficulty: 3, isSecret: false },
  { id: 'katsu_curry', name: 'Chicken Katsu Curry', cuisine: 'japanese', ingredients: ['chicken_breast', 'curry' as any, 'jasmine_rice'], steps: [{ order: 1, instruction: 'Bread and fry chicken cutlet', station: 'stovetop', durationSec: 10, wordHint: 'BREAD', difficulty: 3 }, { order: 2, instruction: 'Prepare curry roux', station: 'stovetop', durationSec: 12, wordHint: 'ROUX', difficulty: 3 }], cookTimeSec: 20, baseXp: 55, baseCoins: 35, difficulty: 3, isSecret: false },
  { id: 'chirashi_bowl', name: 'Chirashi Bowl', cuisine: 'japanese', ingredients: ['salmon_fillet', 'shrimp', 'jasmine_rice', 'avocado'], steps: [{ order: 1, instruction: 'Prepare sushi rice', station: 'stovetop', durationSec: 10, wordHint: 'VINEGAR', difficulty: 3 }, { order: 2, instruction: 'Slice sashimi and arrange', station: 'prep', durationSec: 10, wordHint: 'ARRANGE', difficulty: 5 }], cookTimeSec: 18, baseXp: 75, baseCoins: 60, difficulty: 5, isSecret: true },

  // ── French (7) ──
  { id: 'croissant', name: 'Butter Croissant', cuisine: 'french', ingredients: ['butter_unsalted', 'bread_french'], steps: [{ order: 1, instruction: 'Laminate dough with butter', station: 'prep', durationSec: 12, wordHint: 'LAMINATE', difficulty: 5 }, { order: 2, instruction: 'Proof and shape crescents', station: 'prep', durationSec: 8, wordHint: 'SHAPE', difficulty: 3 }, { order: 3, instruction: 'Bake until flaky golden', station: 'oven', durationSec: 14, wordHint: 'FLAKY', difficulty: 3 }], cookTimeSec: 30, baseXp: 70, baseCoins: 40, difficulty: 4, isSecret: false },
  { id: 'coq_au_vin', name: 'Coq au Vin', cuisine: 'french', ingredients: ['chicken_breast', 'mushroom', 'onion', 'butter_unsalted', 'thyme'], steps: [{ order: 1, instruction: 'Sear chicken until browned', station: 'stovetop', durationSec: 8, wordHint: 'SEAR', difficulty: 3 }, { order: 2, instruction: 'Braise in red wine sauce', station: 'oven', durationSec: 20, wordHint: 'BRAISE', difficulty: 4 }], cookTimeSec: 25, baseXp: 75, baseCoins: 50, difficulty: 5, isSecret: false },
  { id: 'ratatouille', name: 'Ratatouille', cuisine: 'french', ingredients: ['tomato', 'bell_pepper', 'onion', 'garlic', 'thyme'], steps: [{ order: 1, instruction: 'Thinly slice all vegetables', station: 'prep', durationSec: 10, wordHint: 'THIN', difficulty: 3 }, { order: 2, instruction: 'Layer and roast in oven', station: 'oven', durationSec: 18, wordHint: 'ROAST', difficulty: 3 }], cookTimeSec: 25, baseXp: 55, baseCoins: 30, difficulty: 3, isSecret: false },
  { id: 'french_onion_soup', name: 'French Onion Soup', cuisine: 'french', ingredients: ['onion', 'butter_unsalted', 'bread_french', 'gruyere' as any], steps: [{ order: 1, instruction: 'Caramelize onions slowly', station: 'stovetop', durationSec: 15, wordHint: 'CARAMEL', difficulty: 4 }, { order: 2, instruction: 'Ladle soup and top with crouton', station: 'prep', durationSec: 4, wordHint: 'LADLE', difficulty: 2 }], cookTimeSec: 18, baseXp: 50, baseCoins: 30, difficulty: 3, isSecret: false },
  { id: 'beef_bourguignon', name: 'Beef Bourguignon', cuisine: 'french', ingredients: ['ground_beef', 'mushroom', 'onion', 'thyme', 'butter_unsalted'], steps: [{ order: 1, instruction: 'Brown beef in batches', station: 'stovetop', durationSec: 10, wordHint: 'BROWN', difficulty: 3 }, { order: 2, instruction: 'Slow cook in wine', station: 'oven', durationSec: 22, wordHint: 'STEW', difficulty: 4 }], cookTimeSec: 30, baseXp: 80, baseCoins: 55, difficulty: 5, isSecret: true },
  { id: 'crepe', name: 'French Crêpe', cuisine: 'french', ingredients: ['heavy_cream', 'butter_unsalted'], steps: [{ order: 1, instruction: 'Pour thin batter on hot pan', station: 'stovetop', durationSec: 4, wordHint: 'SWIRL', difficulty: 3 }, { order: 2, instruction: 'Fill and fold elegantly', station: 'prep', durationSec: 3, wordHint: 'FOLD', difficulty: 2 }], cookTimeSec: 6, baseXp: 30, baseCoins: 20, difficulty: 2, isSecret: false },
  { id: 'quiche_lorraine', name: 'Quiche Lorraine', cuisine: 'french', ingredients: ['butter_unsalted', 'heavy_cream', 'onion', 'garlic'], steps: [{ order: 1, instruction: 'Prepare flaky pastry crust', station: 'prep', durationSec: 10, wordHint: 'CRUST', difficulty: 4 }, { order: 2, instruction: 'Pour custard and bake', station: 'oven', durationSec: 20, wordHint: 'CUSTARD', difficulty: 3 }], cookTimeSec: 28, baseXp: 60, baseCoins: 35, difficulty: 4, isSecret: false },

  // ── Mexican (7) ──
  { id: 'tacos_al_pastor', name: 'Tacos al Pastor', cuisine: 'mexican', ingredients: ['pork_belly', 'tortilla', 'onion', 'chili_flakes'], steps: [{ order: 1, instruction: 'Marinate pork in achiote', station: 'prep', durationSec: 6, wordHint: 'MARINATE', difficulty: 3 }, { order: 2, instruction: 'Grill marinated pork', station: 'grill', durationSec: 10, wordHint: 'GRILL', difficulty: 3 }, { order: 3, instruction: 'Assemble tacos with pineapple', station: 'prep', durationSec: 4, wordHint: 'ASSEMBLE', difficulty: 2 }], cookTimeSec: 18, baseXp: 55, baseCoins: 30, difficulty: 3, isSecret: false },
  { id: 'enchiladas', name: 'Cheese Enchiladas', cuisine: 'mexican', ingredients: ['tortilla', 'tomato_sauce', 'chili_flakes', 'onion'], steps: [{ order: 1, instruction: 'Fill tortillas and roll', station: 'prep', durationSec: 6, wordHint: 'ROLL', difficulty: 2 }, { order: 2, instruction: 'Cover with sauce and bake', station: 'oven', durationSec: 12, wordHint: 'COVER', difficulty: 2 }], cookTimeSec: 16, baseXp: 45, baseCoins: 25, difficulty: 2, isSecret: false },
  { id: 'guacamole', name: 'Fresh Guacamole', cuisine: 'mexican', ingredients: ['avocado', 'tomato', 'onion', 'chili_flakes'], steps: [{ order: 1, instruction: 'Mash avocados coarsely', station: 'prep', durationSec: 4, wordHint: 'MASH', difficulty: 1 }, { order: 2, instruction: 'Mix in diced tomato and onion', station: 'prep', durationSec: 3, wordHint: 'MIX', difficulty: 1 }], cookTimeSec: 6, baseXp: 20, baseCoins: 15, difficulty: 1, isSecret: false },
  { id: 'mole_sauce', name: 'Chicken Mole', cuisine: 'mexican', ingredients: ['chicken_breast', 'chili_flakes', 'onion', 'garlic', 'cumin'], steps: [{ order: 1, instruction: 'Toast and grind chilies', station: 'prep', durationSec: 8, wordHint: 'GRIND', difficulty: 4 }, { order: 2, instruction: 'Simmer complex mole sauce', station: 'stovetop', durationSec: 15, wordHint: 'SIMMER', difficulty: 4 }, { order: 3, instruction: 'Plate chicken with mole', station: 'prep', durationSec: 4, wordHint: 'PLATE', difficulty: 2 }], cookTimeSec: 25, baseXp: 75, baseCoins: 45, difficulty: 5, isSecret: true },
  { id: 'churros', name: 'Cinnamon Churros', cuisine: 'mexican', ingredients: ['butter_unsalted', 'cinnamon' as any], steps: [{ order: 1, instruction: 'Pipe churro dough into hot oil', station: 'stovetop', durationSec: 6, wordHint: 'PIPE', difficulty: 3 }, { order: 2, instruction: 'Roll in cinnamon sugar', station: 'prep', durationSec: 3, wordHint: 'COAT', difficulty: 1 }], cookTimeSec: 8, baseXp: 35, baseCoins: 25, difficulty: 2, isSecret: false },
  { id: 'quesadilla', name: 'Quesadilla', cuisine: 'mexican', ingredients: ['tortilla', 'chicken_breast', 'onion'], steps: [{ order: 1, instruction: 'Stuff tortilla with filling', station: 'prep', durationSec: 4, wordHint: 'STUFF', difficulty: 1 }, { order: 2, instruction: 'Grill until crispy and melted', station: 'grill', durationSec: 6, wordHint: 'MELT', difficulty: 2 }], cookTimeSec: 10, baseXp: 30, baseCoins: 20, difficulty: 1, isSecret: false },
  { id: 'pozole', name: 'Pozole Rojo', cuisine: 'mexican', ingredients: ['pork_belly', 'onion', 'garlic', 'chili_flakes'], steps: [{ order: 1, instruction: 'Boil pork until tender', station: 'stovetop', durationSec: 15, wordHint: 'TENDER', difficulty: 3 }, { order: 2, instruction: 'Prepare red chili broth', station: 'stovetop', durationSec: 8, wordHint: 'BROTH', difficulty: 3 }], cookTimeSec: 20, baseXp: 55, baseCoins: 30, difficulty: 3, isSecret: false },

  // ── Chinese (8) ──
  { id: 'kung_pao_chicken', name: 'Kung Pao Chicken', cuisine: 'chinese', ingredients: ['chicken_breast', 'garlic', 'chili_flakes', 'soy_sauce', 'onion'], steps: [{ order: 1, instruction: 'Marinate chicken in soy sauce', station: 'prep', durationSec: 5, wordHint: 'MARINATE', difficulty: 2 }, { order: 2, instruction: 'Stir-fry with peanuts and chilies', station: 'wok', durationSec: 8, wordHint: 'STIRFRY', difficulty: 4 }], cookTimeSec: 12, baseXp: 50, baseCoins: 30, difficulty: 3, isSecret: false },
  { id: 'mapo_tofu', name: 'Mapo Tofu', cuisine: 'chinese', ingredients: ['tofu_firm', 'chili_flakes', 'garlic', 'soy_sauce', 'star_anise'], steps: [{ order: 1, instruction: 'Cube tofu carefully', station: 'prep', durationSec: 4, wordHint: 'CUBE', difficulty: 2 }, { order: 2, instruction: 'Cook spicy bean paste in wok', station: 'wok', durationSec: 8, wordHint: 'SPICY', difficulty: 4 }], cookTimeSec: 10, baseXp: 45, baseCoins: 25, difficulty: 3, isSecret: false },
  { id: 'peking_duck', name: 'Peking Duck', cuisine: 'chinese', ingredients: ['duck' as any, 'garlic', 'onion', 'star_anise'], steps: [{ order: 1, instruction: 'Air-dry and glaze duck', station: 'prep', durationSec: 10, wordHint: 'GLAZE', difficulty: 4 }, { order: 2, instruction: 'Roast until skin is crispy', station: 'oven', durationSec: 20, wordHint: 'CRISPY', difficulty: 5 }, { order: 3, instruction: 'Carve and serve with pancakes', station: 'prep', durationSec: 6, wordHint: 'CARVE', difficulty: 4 }], cookTimeSec: 32, baseXp: 90, baseCoins: 70, difficulty: 5, isSecret: true },
  { id: 'fried_rice', name: 'Egg Fried Rice', cuisine: 'chinese', ingredients: ['jasmine_rice', 'garlic', 'soy_sauce', 'onion'], steps: [{ order: 1, instruction: 'Scramble eggs in hot wok', station: 'wok', durationSec: 3, wordHint: 'SCRAMBLE', difficulty: 2 }, { order: 2, instruction: 'Toss rice with high heat', station: 'wok', durationSec: 5, wordHint: 'TOSS', difficulty: 3 }], cookTimeSec: 7, baseXp: 30, baseCoins: 18, difficulty: 2, isSecret: false },
  { id: 'dim_sum', name: 'Steamed Dim Sum', cuisine: 'chinese', ingredients: ['shrimp', 'garlic', 'soy_sauce', 'onion'], steps: [{ order: 1, instruction: 'Wrap filling in wonton skins', station: 'prep', durationSec: 10, wordHint: 'WRAP', difficulty: 4 }, { order: 2, instruction: 'Steam until translucent', station: 'stovetop', durationSec: 8, wordHint: 'STEAM', difficulty: 3 }], cookTimeSec: 16, baseXp: 55, baseCoins: 35, difficulty: 4, isSecret: false },
  { id: 'sweet_sour_pork', name: 'Sweet & Sour Pork', cuisine: 'chinese', ingredients: ['pork_belly', 'bell_pepper', 'onion', 'garlic'], steps: [{ order: 1, instruction: 'Deep fry battered pork', station: 'stovetop', durationSec: 8, wordHint: 'BATTER', difficulty: 3 }, { order: 2, instruction: 'Stir-fry sauce with vegetables', station: 'wok', durationSec: 6, wordHint: 'GLAZE', difficulty: 3 }], cookTimeSec: 12, baseXp: 45, baseCoins: 28, difficulty: 3, isSecret: false },
  { id: 'hot_pot', name: 'Sichuan Hot Pot', cuisine: 'chinese', ingredients: ['tofu_firm', 'mushroom', 'bok_choy', 'chili_flakes', 'star_anise'], steps: [{ order: 1, instruction: 'Prepare spicy broth base', station: 'stovetop', durationSec: 10, wordHint: 'BROTH', difficulty: 3 }, { order: 2, instruction: 'Cook ingredients at table', station: 'stovetop', durationSec: 10, wordHint: 'DIP', difficulty: 2 }], cookTimeSec: 18, baseXp: 55, baseCoins: 35, difficulty: 3, isSecret: false },
  { id: 'char_siu', name: 'Char Siu Pork', cuisine: 'chinese', ingredients: ['pork_belly', 'garlic', 'star_anise', 'soy_sauce'], steps: [{ order: 1, instruction: 'Marinate pork overnight', station: 'prep', durationSec: 5, wordHint: 'MARINATE', difficulty: 2 }, { order: 2, instruction: 'Roast with honey glaze', station: 'oven', durationSec: 15, wordHint: 'GLAZE', difficulty: 4 }], cookTimeSec: 18, baseXp: 60, baseCoins: 40, difficulty: 4, isSecret: false },

  // ── Indian (8) ──
  { id: 'butter_chicken', name: 'Butter Chicken', cuisine: 'indian', ingredients: ['chicken_breast', 'butter_unsalted', 'tomato', 'cumin', 'turmeric'], steps: [{ order: 1, instruction: 'Marinate chicken in yogurt spices', station: 'prep', durationSec: 6, wordHint: 'MARINATE', difficulty: 2 }, { order: 2, instruction: 'Grill chicken pieces', station: 'grill', durationSec: 10, wordHint: 'GRILL', difficulty: 3 }, { order: 3, instruction: 'Simmer in creamy tomato sauce', station: 'stovetop', durationSec: 12, wordHint: 'SIMMER', difficulty: 3 }], cookTimeSec: 25, baseXp: 65, baseCoins: 40, difficulty: 4, isSecret: false },
  { id: 'chicken_biryani', name: 'Chicken Biryani', cuisine: 'indian', ingredients: ['chicken_breast', 'jasmine_rice', 'onion', 'cumin', 'turmeric', 'star_anise'], steps: [{ order: 1, instruction: 'Fry whole spices in ghee', station: 'stovetop', durationSec: 5, wordHint: 'FRY', difficulty: 3 }, { order: 2, instruction: 'Layer rice and chicken', station: 'prep', durationSec: 6, wordHint: 'LAYER', difficulty: 3 }, { order: 3, instruction: 'Steam dum-style until aromatic', station: 'stovetop', durationSec: 15, wordHint: 'STEAM', difficulty: 4 }], cookTimeSec: 22, baseXp: 75, baseCoins: 50, difficulty: 5, isSecret: false },
  { id: 'masala_dosa', name: 'Masala Dosa', cuisine: 'indian', ingredients: ['potato' as any, 'onion', 'cumin', 'turmeric', 'chili_flakes'], steps: [{ order: 1, instruction: 'Ferment and spread dosa batter', station: 'stovetop', durationSec: 6, wordHint: 'SPREAD', difficulty: 3 }, { order: 2, instruction: 'Prepare spiced potato filling', station: 'stovetop', durationSec: 8, wordHint: 'FILL', difficulty: 3 }], cookTimeSec: 12, baseXp: 50, baseCoins: 28, difficulty: 3, isSecret: false },
  { id: 'palak_paneer', name: 'Palak Paneer', cuisine: 'indian', ingredients: ['paneer' as any, 'garlic', 'cumin', 'turmeric', 'greek_yogurt'], steps: [{ order: 1, instruction: 'Blanch and puree spinach', station: 'prep', durationSec: 8, wordHint: 'PUREE', difficulty: 3 }, { order: 2, instruction: 'Cook paneer in spiced sauce', station: 'stovetop', durationSec: 10, wordHint: 'SAUCE', difficulty: 3 }], cookTimeSec: 16, baseXp: 50, baseCoins: 30, difficulty: 3, isSecret: false },
  { id: 'naan_garlic', name: 'Garlic Naan', cuisine: 'indian', ingredients: ['naan_bread', 'garlic', 'butter_unsalted'], steps: [{ order: 1, instruction: 'Stretch and slap dough', station: 'prep', durationSec: 5, wordHint: 'STRETCH', difficulty: 3 }, { order: 2, instruction: 'Cook in tandoor oven', station: 'oven', durationSec: 6, wordHint: 'TANDOOR', difficulty: 4 }], cookTimeSec: 10, baseXp: 35, baseCoins: 20, difficulty: 3, isSecret: false },
  { id: 'tandoori_chicken', name: 'Tandoori Chicken', cuisine: 'indian', ingredients: ['chicken_breast', 'cumin', 'turmeric', 'chili_flakes', 'greek_yogurt'], steps: [{ order: 1, instruction: 'Coat in spiced yogurt marinade', station: 'prep', durationSec: 6, wordHint: 'COAT', difficulty: 2 }, { order: 2, instruction: 'Grill at high heat until charred', station: 'grill', durationSec: 14, wordHint: 'CHAR', difficulty: 4 }], cookTimeSec: 18, baseXp: 60, baseCoins: 38, difficulty: 4, isSecret: false },
  { id: 'samosa', name: 'Vegetable Samosa', cuisine: 'indian', ingredients: ['potato' as any, 'peas' as any, 'cumin', 'chili_flakes'], steps: [{ order: 1, instruction: 'Fill and fold triangular pastry', station: 'prep', durationSec: 10, wordHint: 'FOLD', difficulty: 4 }, { order: 2, instruction: 'Deep fry until golden', station: 'stovetop', durationSec: 8, wordHint: 'FRY', difficulty: 3 }], cookTimeSec: 16, baseXp: 45, baseCoins: 25, difficulty: 3, isSecret: false },
  { id: 'mango_lassi', name: 'Mango Lassi', cuisine: 'indian', ingredients: ['mango' as any, 'greek_yogurt'], steps: [{ order: 1, instruction: 'Blend mango with yogurt', station: 'prep', durationSec: 4, wordHint: 'BLEND', difficulty: 1 }], cookTimeSec: 4, baseXp: 15, baseCoins: 10, difficulty: 1, isSecret: false },

  // ── Thai (7) ──
  { id: 'pad_thai', name: 'Pad Thai', cuisine: 'thai', ingredients: ['shrimp', 'soy_sauce', 'garlic', 'onion', 'chili_flakes'], steps: [{ order: 1, instruction: 'Soak rice noodles', station: 'prep', durationSec: 5, wordHint: 'SOAK', difficulty: 1 }, { order: 2, instruction: 'Stir-fry with tamarind sauce', station: 'wok', durationSec: 8, wordHint: 'STIRFRY', difficulty: 4 }], cookTimeSec: 12, baseXp: 50, baseCoins: 30, difficulty: 3, isSecret: false },
  { id: 'green_curry', name: 'Green Curry', cuisine: 'thai', ingredients: ['chicken_breast', 'coconut' as any, 'bell_pepper', 'lemongrass', 'chili_flakes'], steps: [{ order: 1, instruction: 'Fry curry paste in coconut cream', station: 'stovetop', durationSec: 5, wordHint: 'PASTE', difficulty: 3 }, { order: 2, instruction: 'Simmer chicken and vegetables', station: 'stovetop', durationSec: 10, wordHint: 'SIMMER', difficulty: 3 }], cookTimeSec: 14, baseXp: 55, baseCoins: 35, difficulty: 3, isSecret: false },
  { id: 'tom_yum', name: 'Tom Yum Goong', cuisine: 'thai', ingredients: ['shrimp', 'lemongrass', 'chili_flakes', 'garlic', 'mushroom'], steps: [{ order: 1, instruction: 'Boil aromatic broth base', station: 'stovetop', durationSec: 6, wordHint: 'BOIL', difficulty: 3 }, { order: 2, instruction: 'Add shrimp and finish with lime', station: 'stovetop', durationSec: 4, wordHint: 'FINISH', difficulty: 2 }], cookTimeSec: 9, baseXp: 45, baseCoins: 28, difficulty: 3, isSecret: false },
  { id: 'mango_sticky_rice', name: 'Mango Sticky Rice', cuisine: 'thai', ingredients: ['mango' as any, 'jasmine_rice', 'coconut' as any], steps: [{ order: 1, instruction: 'Steam sticky rice', station: 'stovetop', durationSec: 10, wordHint: 'STEAM', difficulty: 2 }, { order: 2, instruction: 'Slice ripe mango and plate', station: 'prep', durationSec: 4, wordHint: 'PLATE', difficulty: 1 }], cookTimeSec: 12, baseXp: 35, baseCoins: 25, difficulty: 2, isSecret: false },
  { id: 'thai_basil_stirfry', name: 'Thai Basil Stir-Fry', cuisine: 'thai', ingredients: ['chicken_breast', 'garlic', 'chili_flakes', 'bell_pepper', 'soy_sauce'], steps: [{ order: 1, instruction: 'Prep ingredients Thai style', station: 'prep', durationSec: 5, wordHint: 'PREP', difficulty: 2 }, { order: 2, instruction: 'Flash fry in smoking wok', station: 'wok', durationSec: 6, wordHint: 'FLASH', difficulty: 4 }], cookTimeSec: 10, baseXp: 45, baseCoins: 25, difficulty: 3, isSecret: false },
  { id: 'som_tum', name: 'Green Papaya Salad', cuisine: 'thai', ingredients: ['papaya' as any, 'chili_flakes', 'garlic', 'tomato'], steps: [{ order: 1, instruction: 'Shred green papaya', station: 'prep', durationSec: 5, wordHint: 'SHRED', difficulty: 3 }, { order: 2, instruction: 'Pound in mortar and pestle', station: 'prep', durationSec: 4, wordHint: 'POUND', difficulty: 3 }], cookTimeSec: 8, baseXp: 30, baseCoins: 18, difficulty: 2, isSecret: false },
  { id: 'massaman_curry', name: 'Massaman Curry', cuisine: 'thai', ingredients: ['chicken_breast', 'potato' as any, 'onion', 'cumin', 'chili_flakes'], steps: [{ order: 1, instruction: 'Toast whole spices for paste', station: 'prep', durationSec: 6, wordHint: 'TOAST', difficulty: 3 }, { order: 2, instruction: 'Slow-cook with coconut milk', station: 'stovetop', durationSec: 18, wordHint: 'SLOW', difficulty: 4 }], cookTimeSec: 22, baseXp: 65, baseCoins: 40, difficulty: 4, isSecret: true },

  // ── American (7) ──
  { id: 'classic_burger', name: 'Classic Cheeseburger', cuisine: 'american', ingredients: ['ground_beef', 'onion', 'tomato', 'mozzarella'], steps: [{ order: 1, instruction: 'Form and season beef patties', station: 'prep', durationSec: 4, wordHint: 'PATTY', difficulty: 1 }, { order: 2, instruction: 'Grill to desired doneness', station: 'grill', durationSec: 8, wordHint: 'GRILL', difficulty: 3 }], cookTimeSec: 12, baseXp: 40, baseCoins: 25, difficulty: 2, isSecret: false },
  { id: 'bbq_ribs', name: 'Smoky BBQ Ribs', cuisine: 'american', ingredients: ['pork_belly', 'garlic', 'onion', 'thyme'], steps: [{ order: 1, instruction: 'Apply dry rub generously', station: 'prep', durationSec: 5, wordHint: 'RUB', difficulty: 2 }, { order: 2, instruction: 'Low and slow smoke for hours', station: 'grill', durationSec: 20, wordHint: 'SMOKE', difficulty: 4 }, { order: 3, instruction: 'Glaze with BBQ sauce', station: 'grill', durationSec: 5, wordHint: 'GLAZE', difficulty: 2 }], cookTimeSec: 28, baseXp: 75, baseCoins: 50, difficulty: 5, isSecret: false },
  { id: 'mac_and_cheese', name: 'Mac & Cheese', cuisine: 'american', ingredients: ['pasta_spaghetti', 'mozzarella', 'butter_unsalted', 'heavy_cream'], steps: [{ order: 1, instruction: 'Cook pasta until tender', station: 'stovetop', durationSec: 8, wordHint: 'BOIL', difficulty: 1 }, { order: 2, instruction: 'Make smooth cheese sauce', station: 'stovetop', durationSec: 8, wordHint: 'SAUCE', difficulty: 3 }], cookTimeSec: 14, baseXp: 35, baseCoins: 20, difficulty: 2, isSecret: false },
  { id: 'cajun_jambalaya', name: 'Cajun Jambalaya', cuisine: 'american', ingredients: ['shrimp', 'chicken_breast', 'onion', 'bell_pepper', 'chili_flakes', 'jasmine_rice'], steps: [{ order: 1, instruction: 'Sauté holy trinity', station: 'stovetop', durationSec: 6, wordHint: 'SAUTE', difficulty: 2 }, { order: 2, instruction: 'Add rice and proteins, simmer', station: 'stovetop', durationSec: 15, wordHint: 'SIMMER', difficulty: 4 }], cookTimeSec: 20, baseXp: 60, baseCoins: 38, difficulty: 4, isSecret: false },
  { id: 'pancakes', name: 'Fluffy Pancakes', cuisine: 'american', ingredients: ['heavy_cream', 'butter_unsalted'], steps: [{ order: 1, instruction: 'Mix batter until just combined', station: 'prep', durationSec: 4, wordHint: 'MIX', difficulty: 1 }, { order: 2, instruction: 'Cook on griddle until bubbly', station: 'stovetop', durationSec: 8, wordHint: 'FLIP', difficulty: 3 }], cookTimeSec: 10, baseXp: 25, baseCoins: 15, difficulty: 1, isSecret: false },
  { id: 'clam_chowder', name: 'New England Clam Chowder', cuisine: 'american', ingredients: ['potato' as any, 'butter_unsalted', 'heavy_cream', 'onion', 'thyme'], steps: [{ order: 1, instruction: 'Cook bacon and aromatics', station: 'stovetop', durationSec: 6, wordHint: 'AROMA', difficulty: 2 }, { order: 2, instruction: 'Add potatoes and cream, simmer', station: 'stovetop', durationSec: 12, wordHint: 'SIMMER', difficulty: 2 }], cookTimeSec: 16, baseXp: 45, baseCoins: 28, difficulty: 2, isSecret: false },
  { id: 'nashville_hot_chicken', name: 'Nashville Hot Chicken', cuisine: 'american', ingredients: ['chicken_breast', 'buttermilk' as any, 'chili_flakes', 'garlic'], steps: [{ order: 1, instruction: 'Brine in spicy buttermilk', station: 'prep', durationSec: 6, wordHint: 'BRINE', difficulty: 2 }, { order: 2, instruction: 'Fry with cayenne-laced flour', station: 'stovetop', durationSec: 10, wordHint: 'FRY', difficulty: 4 }], cookTimeSec: 14, baseXp: 55, baseCoins: 35, difficulty: 4, isSecret: true },
];

// ---------------------------------------------------------------------------
// 5. Static Data — Opponent Chefs (10)
// ---------------------------------------------------------------------------

export const CK_OPPONENTS: OpponentChef[] = [
  { id: 'chef_massimo', name: 'Chef Massimo', cuisine: 'italian', skillLevel: 8, avatar: '👨‍🍳', specialty: 'Handmade Pasta', personality: 'Intense perfectionist' },
  { id: 'chef_yuki', name: 'Chef Yuki Tanaka', cuisine: 'japanese', skillLevel: 9, avatar: '👩‍🍳', specialty: 'Sushi & Sashimi', personality: 'Calm and precise' },
  { id: 'chef_pierre', name: 'Chef Pierre Dupont', cuisine: 'french', skillLevel: 10, avatar: '👨‍🍳', specialty: 'Classical Sauces', personality: 'Arrogant genius' },
  { id: 'chef_carmen', name: 'Chef Carmen Reyes', cuisine: 'mexican', skillLevel: 7, avatar: '👩‍🍳', specialty: 'Mole & Salsas', personality: 'Warm and creative' },
  { id: 'chef_wei', name: 'Chef Wei Chen', cuisine: 'chinese', skillLevel: 9, avatar: '👨‍🍳', specialty: 'Wok Mastery', personality: 'Lightning-fast hands' },
  { id: 'chef_priya', name: 'Chef Priya Sharma', cuisine: 'indian', skillLevel: 8, avatar: '👩‍🍳', specialty: 'Spice Blending', personality: 'Passionate storyteller' },
  { id: 'chef_niran', name: 'Chef Niran Srikham', cuisine: 'thai', skillLevel: 7, avatar: '👨‍🍳', specialty: 'Street Food', personality: 'Energetic and fun' },
  { id: 'chef_bobby', name: 'Chef Bobby James', cuisine: 'american', skillLevel: 8, avatar: '👨‍🍳', specialty: 'BBQ & Grill', personality: 'Loud and enthusiastic' },
  { id: 'chef_lucia', name: 'Chef Lucia Martelli', cuisine: 'italian', skillLevel: 6, avatar: '👩‍🍳', specialty: 'Desserts', personality: 'Sweet and nurturing' },
  { id: 'chef_kenji', name: 'Chef Kenji Watanabe', cuisine: 'japanese', skillLevel: 7, avatar: '👨‍🍳', specialty: 'Ramen', personality: 'Mysterious and focused' },
];

// ---------------------------------------------------------------------------
// 6. Static Data — Kitchen Disasters (8)
// ---------------------------------------------------------------------------

export const CK_DISASTERS: KitchenDisaster[] = [
  { id: 'grease_fire', name: 'Grease Fire!', description: 'Oil in the pan catches fire!', severity: 'severe', penaltySeconds: 15, coinLoss: 20 },
  { id: 'power_outage', name: 'Power Outage!', description: 'The kitchen goes dark briefly.', severity: 'moderate', penaltySeconds: 10, coinLoss: 10 },
  { id: 'missing_ingredient', name: 'Missing Ingredient!', description: 'A key ingredient cannot be found!', severity: 'minor', penaltySeconds: 8, coinLoss: 5 },
  { id: 'broken_thermometer', name: 'Broken Thermometer!', description: 'Cannot read the oven temperature!', severity: 'moderate', penaltySeconds: 12, coinLoss: 15 },
  { id: 'slippery_floor', name: 'Slippery Floor!', description: 'Someone spilled oil on the floor!', severity: 'minor', penaltySeconds: 6, coinLoss: 5 },
  { id: 'bug_invasion', name: 'Bug Invasion!', description: 'Ants are marching toward your station!', severity: 'moderate', penaltySeconds: 10, coinLoss: 10 },
  { id: 'burner_malfunction', name: 'Burner Malfunction!', description: 'One burner is stuck on high!', severity: 'severe', penaltySeconds: 14, coinLoss: 18 },
  { id: 'wrong_order', name: 'Wrong Order Ticket!', description: 'The ticket was misread — start over!', severity: 'severe', penaltySeconds: 12, coinLoss: 15 },
];

// ---------------------------------------------------------------------------
// 7. Static Data — Spice Mixes
// ---------------------------------------------------------------------------

export const CK_SPICE_MIXES: SpiceMix[] = [
  { id: 'italian_seasoning', name: 'Italian Seasoning', baseSpices: ['oregano', 'thyme', 'basil_leaves'], bonus: { station: 'stovetop', qualityBonus: 0.1 }, discoverCost: 100 },
  { id: 'garam_masala', name: 'Garam Masala', baseSpices: ['cumin', 'turmeric', 'star_anise'], bonus: { station: 'wok', qualityBonus: 0.12 }, discoverCost: 150 },
  { id: 'five_spice', name: 'Chinese Five Spice', baseSpices: ['star_anise', 'cumin', 'turmeric'], bonus: { station: 'oven', qualityBonus: 0.1 }, discoverCost: 120 },
  { id: 'taco_seasoning', name: 'Taco Seasoning', baseSpices: ['cumin', 'chili_flakes', 'oregano'], bonus: { station: 'grill', qualityBonus: 0.08 }, discoverCost: 80 },
  { id: 'thai_curry_paste', name: 'Thai Curry Paste', baseSpices: ['chili_flakes', 'lemongrass', 'turmeric'], bonus: { station: 'stovetop', qualityBonus: 0.12 }, discoverCost: 130 },
  { id: 'cajun_rub', name: 'Cajun Dry Rub', baseSpices: ['chili_flakes', 'thyme', 'oregano'], bonus: { station: 'grill', qualityBonus: 0.15 }, discoverCost: 140 },
];

// ---------------------------------------------------------------------------
// 8. Static Data — Plating Styles
// ---------------------------------------------------------------------------

export const CK_PLATING_STYLES: PlatingStyle[] = [
  { id: 'classic', name: 'Classic Plating', bonusPercent: 5, description: 'Traditional arrangement on the plate rim' },
  { id: 'minimalist', name: 'Minimalist Style', bonusPercent: 8, description: 'Clean lines, white space, focus on ingredients' },
  { id: 'rustic', name: 'Rustic Charm', bonusPercent: 10, description: 'Wood boards, casual elegance' },
  { id: 'elegant', name: 'Fine Dining', bonusPercent: 15, description: 'Precise placement, sauce art, edible flowers' },
  { id: 'street_food', name: 'Street Food Style', bonusPercent: 3, description: 'Wrapped, skewered, handheld presentation' },
  { id: 'family_style', name: 'Family Style', bonusPercent: 7, description: 'Shared platters, generous portions' },
];

// ---------------------------------------------------------------------------
// 9. Static Data — Seasonal Events
// ---------------------------------------------------------------------------

export const CK_SEASONAL_EVENTS: SeasonalEvent[] = [
  { id: 'spring_hanami', name: 'Cherry Blossom Festival', season: 'spring', specialRecipes: ['sakura_mochi' as any, 'strawberry_shortcake' as any], bonusMultiplier: 1.5 },
  { id: 'summer_bbq', name: 'Summer BBQ Bash', season: 'summer', specialRecipes: ['watermelon_salad' as any, 'grilled_corn' as any], bonusMultiplier: 1.4 },
  { id: 'autumn_harvest', name: 'Autumn Harvest Feast', season: 'autumn', specialRecipes: ['pumpkin_pie' as any, 'apple_cider_doughnuts' as any], bonusMultiplier: 1.3 },
  { id: 'winter_holiday', name: 'Winter Holiday Dinner', season: 'winter', specialRecipes: ['gingerbread' as any, 'roast_turkey' as any], bonusMultiplier: 1.6 },
];

// ---------------------------------------------------------------------------
// 10. Static Data — Achievements (15)
// ---------------------------------------------------------------------------

export const CK_ACHIEVEMENT_DEFS: Omit<Achievement, 'requirement' | 'unlocked'>[] = [
  { id: 'first_dish', name: 'First Dish', description: 'Complete your first recipe', icon: '🍳', xpReward: 20, coinReward: 10 },
  { id: 'master_chef', name: 'Master Chef', description: 'Reach chef level 40', icon: '👨‍🍳', xpReward: 500, coinReward: 200 },
  { id: 'five_star_streak', name: '5-Star Streak', description: 'Get 5 perfect ratings in a row', icon: '⭐', xpReward: 100, coinReward: 50 },
  { id: 'recipe_collector', name: 'Recipe Collector', description: 'Discover all 60 recipes', icon: '📖', xpReward: 300, coinReward: 150 },
  { id: 'iron_chef', name: 'Iron Chef', description: 'Win 10 cooking competitions', icon: '🏆', xpReward: 250, coinReward: 120 },
  { id: 'station_master', name: 'Station Master', description: 'Upgrade all stations to level 5', icon: '🔧', xpReward: 200, coinReward: 100 },
  { id: 'spice_connoisseur', name: 'Spice Connoisseur', description: 'Discover all spice mixes', icon: '🌶️', xpReward: 150, coinReward: 75 },
  { id: 'food_truck_mogul', name: 'Food Truck Mogul', description: 'Earn 1000 coins from the food truck', icon: '🚚', xpReward: 200, coinReward: 100 },
  { id: 'disaster_avenger', name: 'Disaster Avenger', description: 'Survive 5 kitchen disasters', icon: '🔥', xpReward: 100, coinReward: 50 },
  { id: 'cuisine_explorer', name: 'Cuisine Explorer', description: 'Cook at least one dish from each cuisine', icon: '🌍', xpReward: 150, coinReward: 75 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a recipe in under half the time', icon: '⚡', xpReward: 120, coinReward: 60 },
  { id: 'penny_pincher', name: 'Penny Pincher', description: 'Cook a 5-star dish with only Common ingredients', icon: '💰', xpReward: 100, coinReward: 80 },
  { id: 'daily_devotee', name: 'Daily Devotee', description: 'Complete 7 daily challenges', icon: '📅', xpReward: 150, coinReward: 70 },
  { id: 'plating_artist', name: 'Plating Artist', description: 'Use all 6 plating styles', icon: '🎨', xpReward: 100, coinReward: 50 },
  { id: 'combo_king', name: 'Combo King', description: 'Achieve a 10x combo multiplier', icon: '👑', xpReward: 300, coinReward: 150 },
];

// ---------------------------------------------------------------------------
// 11. Game State Interface
// ---------------------------------------------------------------------------

export interface CookingAcademyState {
  chefLevel: number;
  chefXp: number;
  totalCoins: number;
  totalDishesCooked: number;
  totalPerfectDishes: number;
  unlockedStations: StationId[];
  stationLevels: Record<StationId, number>;
  discoveredRecipes: string[];
  recipeMastery: Record<string, number>; // recipeId -> 0-100
  ownedIngredients: Record<string, { id: string; quantity: number; quality: QualityTier }>;
  equippedSpiceMix: string | null;
  discoveredSpiceMixes: string[];
  unlockedPlatingStyles: string[];
  currentPlatingStyle: string;
  competitionWins: number;
  competitionsCompleted: number;
  foodTruckEarnings: number;
  foodTruckCustomersServed: number;
  foodTruckMenu: string[];
  disastersSurvived: number;
  consecutivePerfect: number;
  bestCombo: number;
  currentCombo: number;
  achievements: string[];
  dailyChallengesCompleted: number;
  activeDailyChallenge: DailyChallenge | null;
  lastDailyDate: string;
  platingStylesUsed: string[];
  cuisinesCooked: CuisineId[];
  bestTimeForRecipe: Record<string, number>;
}

// ---------------------------------------------------------------------------
// 12. Lazy State Initialization (SSR-safe)
// ---------------------------------------------------------------------------

let state: CookingAcademyState | null = null;

function ensureInit(): CookingAcademyState {
  if (state !== null) return state;
  state = {
    chefLevel: 1,
    chefXp: 0,
    totalCoins: 100,
    totalDishesCooked: 0,
    totalPerfectDishes: 0,
    unlockedStations: ['prep', 'stovetop'],
    stationLevels: { prep: 1, stovetop: 1, oven: 0, grill: 0, wok: 0 },
    discoveredRecipes: ['bruschetta', 'miso_soup', 'guacamole', 'pancakes'],
    recipeMastery: {},
    ownedIngredients: {},
    equippedSpiceMix: null,
    discoveredSpiceMixes: [],
    unlockedPlatingStyles: ['classic', 'street_food'],
    currentPlatingStyle: 'classic',
    competitionWins: 0,
    competitionsCompleted: 0,
    foodTruckEarnings: 0,
    foodTruckCustomersServed: 0,
    foodTruckMenu: ['bruschetta', 'pancakes'],
    disastersSurvived: 0,
    consecutivePerfect: 0,
    bestCombo: 0,
    currentCombo: 0,
    achievements: [],
    dailyChallengesCompleted: 0,
    activeDailyChallenge: null,
    lastDailyDate: '',
    platingStylesUsed: ['classic'],
    cuisinesCooked: [],
    bestTimeForRecipe: {},
  };
  return state;
}

// ---------------------------------------------------------------------------
// 13. State Access
// ---------------------------------------------------------------------------

export function ckGetState(): CookingAcademyState {
  return ensureInit();
}

export function ckResetState(): void {
  state = null;
  ensureInit();
}

export function ckLoadState(partial: Partial<CookingAcademyState>): CookingAcademyState {
  const s = ensureInit();
  Object.assign(s, partial);
  return s;
}

// ---------------------------------------------------------------------------
// 14. Chef Level & XP
// ---------------------------------------------------------------------------

const XP_PER_LEVEL = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 4900, 5900, 7000, 8200, 9500, 11000, 12600, 14400, 16400, 18600, 21000, 23600, 26400, 29500, 32800, 36400, 40300, 44500, 49000, 53900, 59200, 64900, 71000, 77600, 84700, 92300, 100500, 109400, 119000];

export function ckGetXpForLevel(level: number): number {
  if (level < 1 || level > 40) return 999999;
  return XP_PER_LEVEL[level - 1];
}

export function ckGetLevelProgress(): { current: number; needed: number; percent: number } {
  const s = ensureInit();
  if (s.chefLevel >= 40) return { current: s.chefXp, needed: 1, percent: 100 };
  const needed = ckGetXpForLevel(s.chefLevel + 1) - ckGetXpForLevel(s.chefLevel);
  const current = s.chefXp - ckGetXpForLevel(s.chefLevel);
  return { current: Math.max(0, current), needed: Math.max(1, needed), percent: Math.min(100, (current / needed) * 100) };
}

export function ckAddXp(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  let leveledUp = false;
  s.chefXp += amount;
  while (s.chefLevel < 40 && s.chefXp >= ckGetXpForLevel(s.chefLevel + 1)) {
    s.chefLevel++;
    leveledUp = true;
  }
  return { leveledUp, newLevel: s.chefLevel };
}

export function ckGetChefTitle(): string {
  const s = ensureInit();
  if (s.chefLevel >= 38) return 'Legendary Grand Chef';
  if (s.chefLevel >= 35) return 'Master Chef';
  if (s.chefLevel >= 30) return 'Executive Chef';
  if (s.chefLevel >= 25) return 'Head Chef';
  if (s.chefLevel >= 20) return 'Sous Chef';
  if (s.chefLevel >= 15) return 'Line Cook';
  if (s.chefLevel >= 10) return 'Commis Chef';
  if (s.chefLevel >= 5) return 'Junior Cook';
  return 'Kitchen Helper';
}

// ---------------------------------------------------------------------------
// 15. Currency
// ---------------------------------------------------------------------------

export function ckGetCoins(): number {
  return ensureInit().totalCoins;
}

export function ckAddCoins(amount: number): number {
  const s = ensureInit();
  s.totalCoins += amount;
  return s.totalCoins;
}

export function ckSpendCoins(amount: number): { success: boolean; remaining: number } {
  const s = ensureInit();
  if (s.totalCoins < amount) return { success: false, remaining: s.totalCoins };
  s.totalCoins -= amount;
  return { success: true, remaining: s.totalCoins };
}

// ---------------------------------------------------------------------------
// 16. Station Management
// ---------------------------------------------------------------------------

const STATION_UNLOCK_COST: Record<StationId, number> = { prep: 0, stovetop: 0, oven: 200, grill: 300, wok: 250 };
const STATION_UPGRADE_BASE_COST: Record<StationId, number> = { prep: 80, stovetop: 100, oven: 150, grill: 180, wok: 140 };

export function ckGetStations(): CookingStation[] {
  const s = ensureInit();
  const allStations: StationId[] = ['prep', 'stovetop', 'oven', 'grill', 'wok'];
  const names: Record<StationId, string> = { prep: 'Prep Counter', stovetop: 'Stovetop', oven: 'Oven', grill: 'Grill', wok: 'Wok' };
  return allStations.map(id => ({
    id,
    name: names[id],
    level: s.stationLevels[id],
    unlocked: s.unlockedStations.includes(id),
    upgradeCost: STATION_UPGRADE_BASE_COST[id] * (s.stationLevels[id] + 1),
    speedBonus: s.stationLevels[id] * 0.05,
    qualityBonus: s.stationLevels[id] * 0.03,
  }));
}

export function ckUnlockStation(stationId: StationId): { success: boolean; cost: number } {
  const s = ensureInit();
  const cost = STATION_UNLOCK_COST[stationId];
  if (s.unlockedStations.includes(stationId)) return { success: false, cost: 0 };
  const result = ckSpendCoins(cost);
  if (!result.success) return { success: false, cost };
  s.unlockedStations.push(stationId);
  s.stationLevels[stationId] = 1;
  return { success: true, cost };
}

export function ckUpgradeStation(stationId: StationId): { success: boolean; newLevel: number; cost: number } {
  const s = ensureInit();
  if (s.stationLevels[stationId] >= 5) return { success: false, newLevel: 5, cost: 0 };
  const cost = STATION_UPGRADE_BASE_COST[stationId] * (s.stationLevels[stationId] + 1);
  const result = ckSpendCoins(cost);
  if (!result.success) return { success: false, newLevel: s.stationLevels[stationId], cost };
  s.stationLevels[stationId]++;
  return { success: true, newLevel: s.stationLevels[stationId], cost };
}

export function ckGetStationSpeedBonus(stationId: StationId): number {
  const s = ensureInit();
  return s.stationLevels[stationId] * 0.05;
}

export function ckGetStationQualityBonus(stationId: StationId): number {
  const s = ensureInit();
  return s.stationLevels[stationId] * 0.03;
}

// ---------------------------------------------------------------------------
// 17. Recipe Book
// ---------------------------------------------------------------------------

export function ckGetRecipe(recipeId: string): Recipe | undefined {
  return CK_RECIPES.find(r => r.id === recipeId);
}

export function ckGetAllRecipes(): Recipe[] {
  return [...CK_RECIPES];
}

export function ckGetRecipesByCuisine(cuisine: CuisineId): Recipe[] {
  return CK_RECIPES.filter(r => r.cuisine === cuisine);
}

export function ckDiscoverRecipe(recipeId: string): { success: boolean; totalDiscovered: number } {
  const s = ensureInit();
  if (s.discoveredRecipes.includes(recipeId)) return { success: false, totalDiscovered: s.discoveredRecipes.length };
  s.discoveredRecipes.push(recipeId);
  return { success: true, totalDiscovered: s.discoveredRecipes.length };
}

export function ckIsRecipeDiscovered(recipeId: string): boolean {
  return ensureInit().discoveredRecipes.includes(recipeId);
}

export function ckGetDiscoveredRecipes(): Recipe[] {
  const s = ensureInit();
  return CK_RECIPES.filter(r => s.discoveredRecipes.includes(r.id));
}

export function ckGetRecipeMastery(recipeId: string): number {
  const s = ensureInit();
  return s.recipeMastery[recipeId] ?? 0;
}

export function ckAddRecipeMastery(recipeId: string, amount: number): { newMastery: number; mastered: boolean } {
  const s = ensureInit();
  const current = s.recipeMastery[recipeId] ?? 0;
  const newMastery = Math.min(100, current + amount);
  s.recipeMastery[recipeId] = newMastery;
  return { newMastery, mastered: newMastery >= 100 };
}

export function ckGetOverallMastery(): number {
  const s = ensureInit();
  if (s.discoveredRecipes.length === 0) return 0;
  const totalMastery = s.discoveredRecipes.reduce((sum, id) => sum + (s.recipeMastery[id] ?? 0), 0);
  return Math.round(totalMastery / s.discoveredRecipes.length);
}

// ---------------------------------------------------------------------------
// 18. Ingredient Management
// ---------------------------------------------------------------------------

export function ckGetIngredient(ingredientId: string): Ingredient | undefined {
  return CK_INGREDIENTS.find(i => i.id === ingredientId);
}

export function ckGetAllIngredients(): Ingredient[] {
  return [...CK_INGREDIENTS];
}

export function ckGetIngredientsByCategory(category: IngredientCategory): Ingredient[] {
  return CK_INGREDIENTS.filter(i => i.category === category);
}

export function ckGetIngredientsByCuisine(cuisine: CuisineId): Ingredient[] {
  return CK_INGREDIENTS.filter(i => i.cuisines.includes(cuisine));
}

export function ckGetIngredientPrice(ingredientId: string, quality: QualityTier): number {
  const ing = CK_INGREDIENTS.find(i => i.id === ingredientId);
  if (!ing) return 0;
  const qualityMultiplier: Record<QualityTier, number> = { Common: 1, Fresh: 1.5, Premium: 2.5, Exotic: 4 };
  return Math.round(ing.basePrice * qualityMultiplier[quality]);
}

export function ckBuyIngredient(ingredientId: string, quality: QualityTier, quantity: number): { success: boolean; cost: number; totalOwned: number } {
  const price = ckGetIngredientPrice(ingredientId, quality) * quantity;
  const result = ckSpendCoins(price);
  if (!result.success) return { success: false, cost: price, totalOwned: 0 };
  const s = ensureInit();
  const key = `${ingredientId}_${quality}`;
  if (!s.ownedIngredients[key]) {
    s.ownedIngredients[key] = { id: ingredientId, quantity: 0, quality };
  }
  s.ownedIngredients[key].quantity += quantity;
  return { success: true, cost: price, totalOwned: s.ownedIngredients[key].quantity };
}

export function ckGetOwnedIngredients(): Array<{ id: string; quantity: number; quality: QualityTier; ingredient: Ingredient | undefined }> {
  const s = ensureInit();
  return Object.values(s.ownedIngredients).map(oi => ({
    id: oi.id,
    quantity: oi.quantity,
    quality: oi.quality,
    ingredient: CK_INGREDIENTS.find(i => i.id === oi.id),
  }));
}

export function ckHasIngredients(recipeId: string): boolean {
  const s = ensureInit();
  const recipe = CK_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return false;
  return recipe.ingredients.every(ingId => {
    return Object.values(s.ownedIngredients).some(oi => oi.id === ingId && oi.quantity > 0);
  });
}

export function ckConsumeIngredients(recipeId: string): boolean {
  const s = ensureInit();
  const recipe = CK_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return false;
  const counts: Record<string, number> = {};
  for (const ingId of recipe.ingredients) {
    counts[ingId] = (counts[ingId] || 0) + 1;
  }
  for (const [ingId, needed] of Object.entries(counts)) {
    const owned = Object.entries(s.ownedIngredients).find(([key, oi]) => oi.id === ingId && oi.quantity >= needed);
    if (!owned) return false;
  }
  for (const [ingId, needed] of Object.entries(counts)) {
    const entry = Object.entries(s.ownedIngredients).find(([key, oi]) => oi.id === ingId && oi.quantity >= needed);
    if (entry) {
      entry[1].quantity -= needed;
      if (entry[1].quantity <= 0) {
        delete s.ownedIngredients[entry[0]];
      }
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// 19. Cooking Mechanics
// ---------------------------------------------------------------------------

export interface CookingSession {
  recipeId: string;
  recipe: Recipe;
  currentStep: number;
  timeRemaining: number;
  totalTime: number;
  temperature: number; // 0-100 scale
  targetTemperature: number;
  mistakes: number;
  score: number;
  active: boolean;
}

export function ckStartCooking(recipeId: string): CookingSession | null {
  const s = ensureInit();
  if (!s.discoveredRecipes.includes(recipeId)) return null;
  if (!ckHasIngredients(recipeId)) return null;
  const recipe = CK_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return null;
  ckConsumeIngredients(recipeId);
  return {
    recipeId,
    recipe,
    currentStep: 0,
    timeRemaining: recipe.cookTimeSec,
    totalTime: recipe.cookTimeSec,
    temperature: 50,
    targetTemperature: ckGetTargetTemp(recipe),
    mistakes: 0,
    score: 0,
    active: true,
  };
}

function ckGetTargetTemp(recipe: Recipe): number {
  // Different recipes need different target temps
  const stationTemps: Record<StationId, number> = { prep: 0, stovetop: 70, oven: 85, grill: 80, wok: 90 };
  const mainStation = recipe.steps[0]?.station ?? 'stovetop';
  return stationTemps[mainStation];
}

export function ckAdvanceCookingStep(session: CookingSession): { success: boolean; stepCompleted: boolean; hint: string } {
  if (!session.active || session.currentStep >= session.recipe.steps.length) {
    return { success: false, stepCompleted: false, hint: '' };
  }
  const step = session.recipe.steps[session.currentStep];
  session.currentStep++;
  return { success: true, stepCompleted: session.currentStep >= session.recipe.steps.length, hint: step.wordHint };
}

export function ckUpdateCookingTimer(session: CookingSession, deltaSeconds: number): CookingSession {
  if (!session.active) return session;
  const speedBonus = ckGetStationSpeedBonus(session.recipe.steps[Math.min(session.currentStep, session.recipe.steps.length - 1)]?.station ?? 'prep');
  const effectiveDelta = deltaSeconds * (1 - speedBonus);
  session.timeRemaining = Math.max(0, session.timeRemaining - effectiveDelta);
  return session;
}

export function ckSetTemperature(session: CookingSession, temp: number): { tempDiff: number; penalty: number } {
  const diff = Math.abs(temp - session.targetTemperature);
  const penalty = diff > 20 ? Math.floor(diff / 10) : 0;
  session.temperature = temp;
  session.mistakes += penalty;
  return { tempDiff: diff, penalty };
}

export function ckSubmitWord(session: CookingSession, word: string, targetWord: string): { correct: boolean; bonus: number; newScore: number } {
  if (!session.active) return { correct: false, bonus: 0, newScore: session.score };
  const correct = word.toUpperCase() === targetWord.toUpperCase();
  if (correct) {
    const bonus = 10 + (session.recipe.difficulty * 5);
    session.score += bonus;
  } else {
    session.mistakes++;
  }
  return { correct, bonus: correct ? 10 + session.recipe.difficulty * 5 : 0, newScore: session.score };
}

export function ckFinishCooking(session: CookingSession): {
  rating: DishRating;
  xpGained: number;
  coinsGained: number;
  masteryGained: number;
  newLevel: number;
  leveledUp: boolean;
} {
  const s = ensureInit();
  session.active = false;
  const timeBonus = Math.round((session.timeRemaining / session.totalTime) * 20);
  const tempBonus = Math.max(0, 20 - Math.abs(session.temperature - session.targetTemperature));
  const mistakePenalty = session.mistakes * 5;
  const platingBonus = ckGetPlatingBonus();
  const comboBonus = ckGetCurrentComboMultiplier();
  const rawScore = session.score + timeBonus + tempBonus - mistakePenalty + platingBonus;
  const rating = ckCalculateRating(rawScore);
  const ratingMultiplier: Record<DishRating, number> = { 1: 0.5, 2: 0.75, 3: 1, 4: 1.5, 5: 2.5 };
  const xpGained = Math.round(session.recipe.baseXp * ratingMultiplier[rating] * comboBonus);
  const coinsGained = Math.round(session.recipe.baseCoins * ratingMultiplier[rating] * comboBonus);
  const masteryGained = rating * 5;
  const { leveledUp, newLevel } = ckAddXp(xpGained);
  ckAddCoins(coinsGained);
  ckAddRecipeMastery(session.recipeId, masteryGained);
  s.totalDishesCooked++;
  if (rating === 5) {
    s.totalPerfectDishes++;
    s.consecutivePerfect++;
    s.currentCombo++;
    if (s.currentCombo > s.bestCombo) s.bestCombo = s.currentCombo;
  } else {
    s.consecutivePerfect = 0;
    s.currentCombo = 0;
  }
  if (!s.cuisinesCooked.includes(session.recipe.cuisine)) {
    s.cuisinesCooked.push(session.recipe.cuisine);
  }
  const currentTime = session.totalTime - session.timeRemaining;
  const bestTime = s.bestTimeForRecipe[session.recipeId];
  if (bestTime === undefined || currentTime < bestTime) {
    s.bestTimeForRecipe[session.recipeId] = currentTime;
  }
  return { rating, xpGained, coinsGained, masteryGained, newLevel, leveledUp };
}

export function ckCalculateRating(rawScore: number): DishRating {
  if (rawScore >= 80) return 5;
  if (rawScore >= 60) return 4;
  if (rawScore >= 40) return 3;
  if (rawScore >= 20) return 2;
  return 1;
}

export function ckGetRatingStars(rating: DishRating): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export function ckGetRatingLabel(rating: DishRating): string {
  const labels: Record<DishRating, string> = { 1: 'Burnt', 2: 'Undercooked', 3: 'Good', 4: 'Great', 5: 'Perfect' };
  return labels[rating];
}

// ---------------------------------------------------------------------------
// 20. Word-Based Hints
// ---------------------------------------------------------------------------

export function ckGetHint(recipeId: string, stepIndex: number): string {
  const recipe = CK_RECIPES.find(r => r.id === recipeId);
  if (!recipe || stepIndex < 0 || stepIndex >= recipe.steps.length) return '';
  const word = recipe.steps[stepIndex].wordHint;
  return ckScrambleWord(word);
}

export function ckGetStepWord(recipeId: string, stepIndex: number): string {
  const recipe = CK_RECIPES.find(r => r.id === recipeId);
  if (!recipe || stepIndex < 0 || stepIndex >= recipe.steps.length) return '';
  return recipe.steps[stepIndex].wordHint;
}

export function ckScrambleWord(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export function ckGetWordDifficulty(recipeId: string): number {
  const recipe = CK_RECIPES.find(r => r.id === recipeId);
  return recipe?.difficulty ?? 1;
}

// ---------------------------------------------------------------------------
// 21. Kitchen Disasters
// ---------------------------------------------------------------------------

export function ckRollDisaster(): KitchenDisaster | null {
  // 15% chance of disaster
  if (Math.random() > 0.15) return null;
  return CK_DISASTERS[Math.floor(Math.random() * CK_DISASTERS.length)];
}

export function ckSurviveDisaster(disaster: KitchenDisaster): {
  coinsLost: number;
  timePenalty: number;
  survived: boolean;
  totalDisasters: number;
} {
  const s = ensureInit();
  const coinsLost = disaster.coinLoss;
  const timePenalty = disaster.penaltySeconds;
  s.totalCoins = Math.max(0, s.totalCoins - coinsLost);
  s.disastersSurvived++;
  return { coinsLost, timePenalty, survived: true, totalDisasters: s.disastersSurvived };
}

export function ckActivateAbility(ability: string): { effect: string; cooldownApplied: boolean } {
  const abilities: Record<string, string> = {
    'fire_extinguisher': 'Reduces fire disaster time penalty by 50%',
    'surge_protector': 'Prevents power outage next time',
    'spice_intuition': 'Auto-corrects temperature for 10 seconds',
    'time_warp': 'Pauses timer for 5 seconds',
    'ingredient_detect': 'Instantly locates missing ingredients',
  };
  return { effect: abilities[ability] ?? 'Unknown ability', cooldownApplied: true };
}

// ---------------------------------------------------------------------------
// 22. Cooking Competitions
// ---------------------------------------------------------------------------

export interface CompetitionResult {
  playerScore: number;
  opponentScore: number;
  won: boolean;
  xpGained: number;
  coinsGained: number;
  opponentName: string;
}

export function ckStartCompetition(opponentId: string): { recipeId: string; opponent: OpponentChef; timeLimit: number } {
  const opponent = CK_OPPONENTS.find(o => o.id === opponentId);
  if (!opponent) return { recipeId: '', opponent: CK_OPPONENTS[0], timeLimit: 60 };
  const cuisineRecipes = CK_RECIPES.filter(r => r.cuisine === opponent.cuisine && !r.isSecret);
  const recipe = cuisineRecipes[Math.floor(Math.random() * cuisineRecipes.length)] ?? CK_RECIPES[0];
  return { recipeId: recipe.id, opponent, timeLimit: 60 };
}

export function ckScoreCompetition(playerRating: DishRating, opponentId: string): CompetitionResult {
  const s = ensureInit();
  const opponent = CK_OPPONENTS.find(o => o.id === opponentId) ?? CK_OPPONENTS[0];
  const ratingScore: Record<DishRating, number> = { 1: 10, 2: 25, 3: 50, 4: 75, 5: 100 };
  const playerScore = ratingScore[playerRating] + (s.stationLevels.stovetop * 3);
  const opponentBase = opponent.skillLevel * 8 + Math.random() * 20;
  const opponentScore = Math.min(100, Math.round(opponentBase));
  const won = playerScore > opponentScore;
  const xpGained = won ? 80 + opponent.skillLevel * 10 : 20;
  const coinsGained = won ? 50 + opponent.skillLevel * 8 : 10;
  ckAddXp(xpGained);
  ckAddCoins(coinsGained);
  s.competitionsCompleted++;
  if (won) s.competitionWins++;
  return { playerScore, opponentScore, won, xpGained, coinsGained, opponentName: opponent.name };
}

export function ckGetOpponents(): OpponentChef[] {
  return [...CK_OPPONENTS];
}

export function ckGetOpponent(id: string): OpponentChef | undefined {
  return CK_OPPONENTS.find(o => o.id === id);
}

export function ckGetCompetitionRecord(): { wins: number; total: number; winRate: number } {
  const s = ensureInit();
  return { wins: s.competitionWins, total: s.competitionsCompleted, winRate: s.competitionsCompleted > 0 ? Math.round((s.competitionWins / s.competitionsCompleted) * 100) : 0 };
}

// ---------------------------------------------------------------------------
// 23. Food Truck
// ---------------------------------------------------------------------------

export function ckGenerateFoodTruckCustomer(): FoodTruckCustomer {
  const s = ensureInit();
  const availableRecipes = s.foodTruckMenu.length > 0 ? s.foodTruckMenu : ['pancakes'];
  const recipeId = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
  const names = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack', 'Karen', 'Leo', 'Mia', 'Nick', 'Olivia'];
  return {
    id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: names[Math.floor(Math.random() * names.length)],
    order: recipeId,
    patience: 30 + Math.floor(Math.random() * 40),
    tipMultiplier: 1 + Math.random() * 0.5,
    satisfaction: 50,
  };
}

export function ckServeFoodTruckCustomer(customer: FoodTruckCustomer, rating: DishRating): {
  coinsEarned: number;
  tip: number;
  satisfaction: number;
  totalServed: number;
} {
  const s = ensureInit();
  const recipe = CK_RECIPES.find(r => r.id === customer.order);
  const baseEarning = recipe?.baseCoins ?? 10;
  const ratingMultiplier: Record<DishRating, number> = { 1: 0.3, 2: 0.6, 3: 1, 4: 1.3, 5: 1.8 };
  const coinsEarned = Math.round(baseEarning * ratingMultiplier[rating]);
  const tip = Math.round(coinsEarned * customer.tipMultiplier * (rating >= 4 ? 0.5 : 0));
  const satisfaction = rating * 20;
  ckAddCoins(coinsEarned + tip);
  s.foodTruckEarnings += coinsEarned + tip;
  s.foodTruckCustomersServed++;
  return { coinsEarned, tip, satisfaction, totalServed: s.foodTruckCustomersServed };
}

export function ckSetFoodTruckMenu(recipeIds: string[]): { success: boolean; menuCount: number } {
  const s = ensureInit();
  const valid = recipeIds.filter(id => s.discoveredRecipes.includes(id));
  s.foodTruckMenu = valid.slice(0, 6);
  return { success: true, menuCount: s.foodTruckMenu.length };
}

export function ckGetFoodTruckStats(): { totalEarnings: number; customersServed: number; menuItems: Recipe[] } {
  const s = ensureInit();
  return {
    totalEarnings: s.foodTruckEarnings,
    customersServed: s.foodTruckCustomersServed,
    menuItems: s.foodTruckMenu.map(id => CK_RECIPES.find(r => r.id === id)!).filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// 24. Daily Challenge
// ---------------------------------------------------------------------------

export function ckGetDailyChallenge(dateString?: string): DailyChallenge {
  const s = ensureInit();
  const today = dateString ?? new Date().toISOString().split('T')[0];
  if (s.lastDailyDate === today && s.activeDailyChallenge) return s.activeDailyChallenge;
  const seed = ckSimpleHash(today);
  const availableRecipes = CK_RECIPES.filter(r => !r.isSecret);
  const recipe = availableRecipes[seed % availableRecipes.length];
  const constraints = ['No mistakes allowed', 'Half time limit', 'Temperature must stay within 5 degrees', 'Use only Common ingredients', 'Cook without any hints', 'Speed bonus must exceed 15 points'];
  const constraint = constraints[seed % constraints.length];
  const challenge: DailyChallenge = {
    dateSeed: today,
    recipeId: recipe.id,
    constraint,
    bonusMultiplier: 1.5,
    timeLimit: Math.round(recipe.cookTimeSec * 0.7),
  };
  s.activeDailyChallenge = challenge;
  s.lastDailyDate = today;
  return challenge;
}

function ckSimpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function ckCompleteDailyChallenge(rating: DishRating): { bonusApplied: boolean; xpGained: number; coinsGained: number; totalCompleted: number } {
  const s = ensureInit();
  if (!s.activeDailyChallenge) return { bonusApplied: false, xpGained: 0, coinsGained: 0, totalCompleted: s.dailyChallengesCompleted };
  const recipe = CK_RECIPES.find(r => r.id === s.activeDailyChallenge.recipeId);
  const baseXp = recipe?.baseXp ?? 20;
  const baseCoins = recipe?.baseCoins ?? 10;
  const xpGained = Math.round(baseXp * s.activeDailyChallenge.bonusMultiplier * (rating / 3));
  const coinsGained = Math.round(baseCoins * s.activeDailyChallenge.bonusMultiplier * (rating / 3));
  ckAddXp(xpGained);
  ckAddCoins(coinsGained);
  s.dailyChallengesCompleted++;
  return { bonusApplied: true, xpGained, coinsGained, totalCompleted: s.dailyChallengesCompleted };
}

// ---------------------------------------------------------------------------
// 25. Spice Blending
// ---------------------------------------------------------------------------

export function ckDiscoverSpiceMix(spiceMixId: string): { success: boolean; cost: number; bonus: { station: StationId; qualityBonus: number } } {
  const s = ensureInit();
  const mix = CK_SPICE_MIXES.find(m => m.id === spiceMixId);
  if (!mix) return { success: false, cost: 0, bonus: { station: 'prep', qualityBonus: 0 } };
  if (s.discoveredSpiceMixes.includes(spiceMixId)) return { success: false, cost: 0, bonus: mix.bonus };
  const result = ckSpendCoins(mix.discoverCost);
  if (!result.success) return { success: false, cost: mix.discoverCost, bonus: mix.bonus };
  s.discoveredSpiceMixes.push(spiceMixId);
  return { success: true, cost: mix.discoverCost, bonus: mix.bonus };
}

export function ckEquipSpiceMix(spiceMixId: string): { equipped: boolean } {
  const s = ensureInit();
  if (!s.discoveredSpiceMixes.includes(spiceMixId)) return { equipped: false };
  s.equippedSpiceMix = spiceMixId;
  return { equipped: true };
}

export function ckUnequipSpiceMix(): void {
  ensureInit().equippedSpiceMix = null;
}

export function ckGetEquippedSpiceMix(): SpiceMix | null {
  const s = ensureInit();
  if (!s.equippedSpiceMix) return null;
  return CK_SPICE_MIXES.find(m => m.id === s.equippedSpiceMix) ?? null;
}

export function ckGetDiscoveredSpiceMixes(): SpiceMix[] {
  const s = ensureInit();
  return CK_SPICE_MIXES.filter(m => s.discoveredSpiceMixes.includes(m.id));
}

export function ckGetAllSpiceMixes(): SpiceMix[] {
  return [...CK_SPICE_MIXES];
}

export function ckGetSpiceBonus(stationId: StationId): number {
  const s = ensureInit();
  if (!s.equippedSpiceMix) return 0;
  const mix = CK_SPICE_MIXES.find(m => m.id === s.equippedSpiceMix);
  if (!mix || mix.bonus.station !== stationId) return 0;
  return mix.bonus.qualityBonus;
}

// ---------------------------------------------------------------------------
// 26. Plating System
// ---------------------------------------------------------------------------

export function ckGetPlatingStyles(): PlatingStyle[] {
  return [...CK_PLATING_STYLES];
}

export function ckUnlockPlatingStyle(styleId: string): { success: boolean; cost: number } {
  const s = ensureInit();
  const style = CK_PLATING_STYLES.find(p => p.id === styleId);
  if (!style || s.unlockedPlatingStyles.includes(styleId)) return { success: false, cost: 0 };
  const cost = 50 + s.unlockedPlatingStyles.length * 30;
  const result = ckSpendCoins(cost);
  if (!result.success) return { success: false, cost };
  s.unlockedPlatingStyles.push(styleId);
  return { success: true, cost };
}

export function ckSetPlatingStyle(styleId: string): { success: boolean } {
  const s = ensureInit();
  if (!s.unlockedPlatingStyles.includes(styleId)) return { success: false };
  s.currentPlatingStyle = styleId;
  if (!s.platingStylesUsed.includes(styleId)) {
    s.platingStylesUsed.push(styleId);
  }
  return { success: true };
}

export function ckGetPlatingBonus(): number {
  const s = ensureInit();
  const style = CK_PLATING_STYLES.find(p => p.id === s.currentPlatingStyle);
  return style?.bonusPercent ?? 0;
}

export function ckGetCurrentPlatingStyle(): PlatingStyle {
  const s = ensureInit();
  return CK_PLATING_STYLES.find(p => p.id === s.currentPlatingStyle) ?? CK_PLATING_STYLES[0];
}

export function ckGetPlatingStylesUsed(): string[] {
  return [...ensureInit().platingStylesUsed];
}

// ---------------------------------------------------------------------------
// 27. Combo System
// ---------------------------------------------------------------------------

export function ckGetCurrentComboMultiplier(): number {
  const s = ensureInit();
  if (s.currentCombo <= 1) return 1;
  return 1 + (s.currentCombo - 1) * 0.1;
}

export function ckGetComboInfo(): CookingCombo {
  const s = ensureInit();
  return {
    count: s.currentCombo,
    multiplier: ckGetCurrentComboMultiplier(),
    lastPerfectTime: Date.now(),
    bestStreak: s.bestCombo,
  };
}

export function ckResetCombo(): void {
  const s = ensureInit();
  s.currentCombo = 0;
  s.consecutivePerfect = 0;
}

export function ckGetBestCombo(): number {
  return ensureInit().bestCombo;
}

export function ckGetConsecutivePerfect(): number {
  return ensureInit().consecutivePerfect;
}

// ---------------------------------------------------------------------------
// 28. Seasonal Events
// ---------------------------------------------------------------------------

export function ckGetCurrentSeason(): SeasonId {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function ckGetActiveSeasonalEvent(): SeasonalEvent | null {
  const season = ckGetCurrentSeason();
  return CK_SEASONAL_EVENTS.find(e => e.season === season) ?? null;
}

export function ckGetSeasonalBonusMultiplier(): number {
  const event = ckGetActiveSeasonalEvent();
  return event?.bonusMultiplier ?? 1;
}

export function ckGetAllSeasonalEvents(): SeasonalEvent[] {
  return [...CK_SEASONAL_EVENTS];
}

// ---------------------------------------------------------------------------
// 29. Achievements
// ---------------------------------------------------------------------------

export function ckCheckAchievements(): Achievement[] {
  const s = ensureInit();
  const newlyUnlocked: Achievement[] = [];
  const checks: Record<string, () => boolean> = {
    first_dish: () => s.totalDishesCooked >= 1,
    master_chef: () => s.chefLevel >= 40,
    five_star_streak: () => s.consecutivePerfect >= 5,
    recipe_collector: () => s.discoveredRecipes.length >= 60,
    iron_chef: () => s.competitionWins >= 10,
    station_master: () => Object.values(s.stationLevels).every(l => l >= 5),
    spice_connoisseur: () => s.discoveredSpiceMixes.length >= CK_SPICE_MIXES.length,
    food_truck_mogul: () => s.foodTruckEarnings >= 1000,
    disaster_avenger: () => s.disastersSurvived >= 5,
    cuisine_explorer: () => s.cuisinesCooked.length >= 8,
    speed_demon: () => Object.values(s.bestTimeForRecipe).some(t => t > 0),
    penny_pincher: () => s.totalPerfectDishes >= 1,
    daily_devotee: () => s.dailyChallengesCompleted >= 7,
    plating_artist: () => s.platingStylesUsed.length >= 6,
    combo_king: () => s.bestCombo >= 10,
  };
  for (const def of CK_ACHIEVEMENT_DEFS) {
    if (s.achievements.includes(def.id)) continue;
    const check = checks[def.id];
    if (check && check()) {
      s.achievements.push(def.id);
      ckAddXp(def.xpReward);
      ckAddCoins(def.coinReward);
      newlyUnlocked.push({ ...def, requirement: check, unlocked: true });
    }
  }
  return newlyUnlocked;
}

export function ckGetAchievements(): Achievement[] {
  const s = ensureInit();
  return CK_ACHIEVEMENT_DEFS.map(def => ({
    ...def,
    unlocked: s.achievements.includes(def.id),
    requirement: () => false,
  }));
}

export function ckGetUnlockedAchievementCount(): number {
  return ensureInit().achievements.length;
}

export function ckGetTotalAchievementCount(): number {
  return CK_ACHIEVEMENT_DEFS.length;
}

export function ckIsAchievementUnlocked(achievementId: string): boolean {
  return ensureInit().achievements.includes(achievementId);
}

// ---------------------------------------------------------------------------
// 30. Market / Shopping
// ---------------------------------------------------------------------------

export interface MarketItem {
  ingredientId: string;
  quality: QualityTier;
  price: number;
  discount: number; // 0-50 percent
  inStock: boolean;
}

export function ckGetDailyMarket(): MarketItem[] {
  const today = new Date().toISOString().split('T')[0];
  const seed = ckSimpleHash(today);
  const items: MarketItem[] = [];
  const shuffledIngredients = [...CK_INGREDIENTS].sort(() => {
    seed + 1;
    return Math.random() - 0.5;
  });
  const dailyItems = shuffledIngredients.slice(0, 15);
  for (const ing of dailyItems) {
    const availableTiers = ing.qualityTiers;
    const tier = availableTiers[Math.floor(Math.random() * availableTiers.length)];
    const price = ckGetIngredientPrice(ing.id, tier);
    const discount = Math.random() < 0.3 ? Math.floor(Math.random() * 3 + 1) * 10 : 0;
    items.push({
      ingredientId: ing.id,
      quality: tier,
      price: Math.round(price * (1 - discount / 100)),
      discount,
      inStock: true,
    });
  }
  return items;
}

export function ckBuyFromMarket(item: MarketItem, quantity: number): { success: boolean; cost: number; totalOwned: number } {
  if (!item.inStock) return { success: false, cost: 0, totalOwned: 0 };
  return ckBuyIngredient(item.ingredientId, item.quality, quantity);
}

// ---------------------------------------------------------------------------
// 31. Statistics & Summary
// ---------------------------------------------------------------------------

export function ckGetStats(): {
  chefLevel: number;
  chefTitle: string;
  totalDishes: number;
  perfectDishes: number;
  perfectRate: number;
  totalCoins: number;
  recipesDiscovered: number;
  totalRecipes: number;
  overallMastery: number;
  competitionsWon: number;
  competitionWinRate: number;
  foodTruckEarnings: number;
  customersServed: number;
  bestCombo: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  cuisinesExplored: number;
  stationsUnlocked: number;
} {
  const s = ensureInit();
  return {
    chefLevel: s.chefLevel,
    chefTitle: ckGetChefTitle(),
    totalDishes: s.totalDishesCooked,
    perfectDishes: s.totalPerfectDishes,
    perfectRate: s.totalDishesCooked > 0 ? Math.round((s.totalPerfectDishes / s.totalDishesCooked) * 100) : 0,
    totalCoins: s.totalCoins,
    recipesDiscovered: s.discoveredRecipes.length,
    totalRecipes: CK_RECIPES.length,
    overallMastery: ckGetOverallMastery(),
    competitionsWon: s.competitionWins,
    competitionWinRate: s.competitionsCompleted > 0 ? Math.round((s.competitionWins / s.competitionsCompleted) * 100) : 0,
    foodTruckEarnings: s.foodTruckEarnings,
    customersServed: s.foodTruckCustomersServed,
    bestCombo: s.bestCombo,
    achievementsUnlocked: s.achievements.length,
    totalAchievements: CK_ACHIEVEMENT_DEFS.length,
    cuisinesExplored: s.cuisinesCooked.length,
    stationsUnlocked: s.unlockedStations.length,
  };
}

// ---------------------------------------------------------------------------
// 32. Random Cooking Word
// ---------------------------------------------------------------------------

export function ckGetRandomCookingWord(difficulty?: number): { word: string; hint: string; category: string } {
  const wordsByDifficulty: Record<number, Array<{ word: string; hint: string; category: string }>> = {
    1: [
      { word: 'CUT', hint: 'Basic knife motion', category: 'prep' },
      { word: 'MIX', hint: 'Combine ingredients', category: 'prep' },
      { word: 'BOIL', hint: 'Heat water to bubbles', category: 'cooking' },
      { word: 'WASH', hint: 'Clean ingredients', category: 'prep' },
      { word: 'STIR', hint: 'Move spoon in circles', category: 'cooking' },
    ],
    2: [
      { word: 'CHOP', hint: 'Cut into small pieces', category: 'prep' },
      { word: 'DICE', hint: 'Cut into small cubes', category: 'prep' },
      { word: 'BAKE', hint: 'Cook in the oven', category: 'cooking' },
      { word: 'GRILL', hint: 'Cook over open flame', category: 'cooking' },
      { word: 'TOAST', hint: 'Brown with dry heat', category: 'cooking' },
    ],
    3: [
      { word: 'SAUTE', hint: 'Cook quickly in hot fat', category: 'cooking' },
      { word: 'BRAISE', hint: 'Slow cook in liquid', category: 'cooking' },
      { word: 'BLANCH', hint: 'Brief boiling then ice bath', category: 'prep' },
      { word: 'PUREE', hint: 'Blend until smooth', category: 'prep' },
      { word: 'SEAR', hint: 'Brown surface at high heat', category: 'cooking' },
    ],
    4: [
      { word: 'JULIENNE', hint: 'Cut into thin matchsticks', category: 'prep' },
      { word: 'FLAMBE', hint: 'Ignite alcohol in pan', category: 'cooking' },
      { word: 'LAMINATE', hint: 'Layer dough and butter', category: 'prep' },
      { word: 'CARAMELIZE', hint: 'Cook sugar until golden', category: 'cooking' },
      { word: 'TEMPERA', hint: 'Japanese deep-fry batter', category: 'cooking' },
    ],
    5: [
      { word: 'SOUVIDE', hint: 'Vacuum-seal slow cook', category: 'technique' },
      { word: 'CHIFFONADE', hint: 'Ribbon-cut herbs finely', category: 'prep' },
      { word: 'CONFIT', hint: 'Slow-cook in fat', category: 'technique' },
      { word: 'EMULSIFY', hint: 'Blend oil into liquid', category: 'technique' },
      { word: 'MACERATE', hint: 'Soak fruit in liquid', category: 'technique' },
    ],
  };
  const level = difficulty ?? (Math.floor(Math.random() * 5) + 1);
  const pool = wordsByDifficulty[level] ?? wordsByDifficulty[1];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---------------------------------------------------------------------------
// 33. Temperature Control Helper
// ---------------------------------------------------------------------------

export function ckGetTemperatureLabel(temp: number): string {
  if (temp <= 10) return 'Cold';
  if (temp <= 25) return 'Cool';
  if (temp <= 40) return 'Warm';
  if (temp <= 55) return 'Medium-Low';
  if (temp <= 70) return 'Medium';
  if (temp <= 85) return 'Medium-High';
  if (temp <= 95) return 'High';
  return 'Maximum Heat';
}

export function ckGetTemperatureColor(temp: number): string {
  if (temp <= 25) return '#2196F3';
  if (temp <= 50) return '#FFC107';
  if (temp <= 75) return '#FF9800';
  return '#F44336';
}

// ---------------------------------------------------------------------------
// 34. Timing Mini-Game
// ---------------------------------------------------------------------------

export interface TimingChallenge {
  targetMs: number;
  toleranceMs: number;
  difficulty: number;
}

export function ckGenerateTimingChallenge(difficulty: number): TimingChallenge {
  const baseTarget = 2000 - (difficulty * 200);
  const targetMs = Math.max(600, baseTarget + Math.floor(Math.random() * 400));
  const toleranceMs = Math.max(100, 500 - (difficulty * 60));
  return { targetMs, toleranceMs, difficulty };
}

export function ckEvaluateTiming(challenge: TimingChallenge, actualMs: number): { perfect: boolean; good: boolean; score: number; offBy: number } {
  const offBy = Math.abs(actualMs - challenge.targetMs);
  const perfect = offBy <= challenge.toleranceMs * 0.5;
  const good = offBy <= challenge.toleranceMs;
  const score = perfect ? 20 : good ? 10 : Math.max(0, 5 - Math.floor(offBy / challenge.toleranceMs));
  return { perfect, good, score, offBy };
}

// ---------------------------------------------------------------------------
// 35. Difficulty Scaling
// ---------------------------------------------------------------------------

export function ckGetScaledDifficulty(baseDifficulty: number, chefLevel: number): number {
  // As chef levels up, face harder challenges
  const scaling = 1 + (chefLevel * 0.02);
  return Math.min(5, Math.round(baseDifficulty * scaling * 10) / 10);
}

export function ckGetRecipeCost(recipeId: string, quality: QualityTier = 'Fresh'): number {
  const recipe = CK_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return 0;
  return recipe.ingredients.reduce((sum, ingId) => sum + ckGetIngredientPrice(ingId, quality), 0);
}

// ---------------------------------------------------------------------------
// 36. Export helpers
// ---------------------------------------------------------------------------

export function ckGetCuisines() {
  return { ...CK_CUISINES };
}

export function ckGetDisasters() {
  return [...CK_DISASTERS];
}

export function ckGetStationNames(): Record<StationId, string> {
  return { prep: 'Prep Counter', stovetop: 'Stovetop', oven: 'Oven', grill: 'Grill', wok: 'Wok' };
}

export function ckGetIngredientCategories(): IngredientCategory[] {
  return ['Protein', 'Vegetable', 'Grain', 'Spice', 'Dairy', 'Sauce'];
}

export function ckGetQualityTiers(): QualityTier[] {
  return ['Common', 'Fresh', 'Premium', 'Exotic'];
}

export function ckGetQualityTierColor(tier: QualityTier): string {
  const colors: Record<QualityTier, string> = { Common: '#9E9E9E', Fresh: '#4CAF50', Premium: '#FFD700', Exotic: '#E040FB' };
  return colors[tier];
}
