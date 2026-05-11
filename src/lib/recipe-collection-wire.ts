// =============================================================================
// Recipe Collection Wire — Word Snake Game
// =============================================================================
// Collect virtual recipes by playing the word game. Each word eaten unlocks a
// recipe ingredient. Cook recipes, master them, earn achievements, and
// complete daily specials.
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecipeCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Dessert'
  | 'Snack'
  | 'Beverage'
  | 'Soup'
  | 'Salad';

export type CuisineType =
  | 'American'
  | 'Italian'
  | 'Japanese'
  | 'Mexican'
  | 'Indian'
  | 'French'
  | 'Thai'
  | 'Chinese';

export interface Ingredient {
  key: string;
  emoji: string;
  name: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  cuisine: CuisineType;
  ingredients: string[];
  time: number;
  difficulty: number;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CookingState {
  recipeId: string;
  startTime: number;
  duration: number;
  isDaily: boolean;
}

export interface RecipeState {
  collectedRecipes: string[];
  masteredRecipes: Record<string, number>;
  totalCooks: number;
  recipeRatings: Record<string, number>;
  unlockedAchievements: string[];
  dailyStreak: number;
  lastDailyDate: string;
  collectedIngredients: string[];
  cookingState: CookingState | null;
  dailyCompletedDates: string[];
  recipeCookCount: Record<string, number>;
}

export interface CollectionProgress {
  category: string;
  collected: number;
  total: number;
  percentage: number;
}

export interface RecipeStats {
  totalRecipes: number;
  collected: number;
  mastered: number;
  totalCooks: number;
  completionPercent: number;
  favoriteCuisine: string;
  favoriteCategory: string;
  averageRating: number;
  achievementsUnlocked: number;
}

export interface RecipeCard {
  recipe: Recipe;
  isCollected: boolean;
  mastery: number;
  canCook: boolean;
  rating: number;
  cookCount: number;
}

export interface DailySpecialInfo {
  recipe: Recipe;
  bonusReward: number;
  streak: number;
  isCompleted: boolean;
}

export interface OverviewData {
  stats: RecipeStats;
  recentRecipes: RecipeCard[];
  dailySpecial: DailySpecialInfo;
  categoryProgress: CollectionProgress[];
  newAchievements: Achievement[];
}

export interface StatsGridItem {
  label: string;
  value: string | number;
  icon: string;
}

export interface CategoryGridItem {
  category: RecipeCategory;
  icon: string;
  collected: number;
  total: number;
  percentage: number;
}

export interface CuisineGridItem {
  cuisine: CuisineType;
  icon: string;
  collected: number;
  total: number;
  percentage: number;
}

export interface CollectionGridItem {
  recipe: Recipe;
  isCollected: boolean;
  mastery: number;
  rating: number;
  isNew: boolean;
}

export interface AchievementGridItem {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  progressLabel: string;
}

export interface DailyCardData {
  recipe: Recipe;
  bonusReward: number;
  streak: number;
  isCompleted: boolean;
  canCook: boolean;
  missingIngredients: Ingredient[];
}

// ---------------------------------------------------------------------------
// Constants — Categories & Cuisines
// ---------------------------------------------------------------------------

const RECIPE_CATEGORIES: { category: RecipeCategory; icon: string }[] = [
  { category: 'Breakfast', icon: '🍳' },
  { category: 'Lunch', icon: '🥗' },
  { category: 'Dinner', icon: '🍽️' },
  { category: 'Dessert', icon: '🍰' },
  { category: 'Snack', icon: '🍿' },
  { category: 'Beverage', icon: '🍹' },
  { category: 'Soup', icon: '🍜' },
  { category: 'Salad', icon: '🥬' },
];

const CUISINE_TYPES: { cuisine: CuisineType; icon: string }[] = [
  { cuisine: 'American', icon: '🇺🇸' },
  { cuisine: 'Italian', icon: '🇮🇹' },
  { cuisine: 'Japanese', icon: '🇯🇵' },
  { cuisine: 'Mexican', icon: '🇲🇽' },
  { cuisine: 'Indian', icon: '🇮🇳' },
  { cuisine: 'French', icon: '🇫🇷' },
  { cuisine: 'Thai', icon: '🇹🇭' },
  { cuisine: 'Chinese', icon: '🇨🇳' },
];

// ---------------------------------------------------------------------------
// Constants — Ingredient Mapping (105 ingredients)
// ---------------------------------------------------------------------------

const INGREDIENT_DB: Ingredient[] = [
  // Fruits
  { key: 'apple', emoji: '🍎', name: 'Apple' },
  { key: 'lemon', emoji: '🍋', name: 'Lemon' },
  { key: 'lime', emoji: '🍋', name: 'Lime' },
  { key: 'orange', emoji: '🍊', name: 'Orange' },
  { key: 'strawberry', emoji: '🍓', name: 'Strawberry' },
  { key: 'blueberry', emoji: '🫐', name: 'Blueberry' },
  { key: 'banana', emoji: '🍌', name: 'Banana' },
  { key: 'mango', emoji: '🥭', name: 'Mango' },
  { key: 'avocado', emoji: '🥑', name: 'Avocado' },
  { key: 'pineapple', emoji: '🍍', name: 'Pineapple' },
  { key: 'coconut', emoji: '🥥', name: 'Coconut' },
  { key: 'watermelon', emoji: '🍉', name: 'Watermelon' },
  { key: 'grape', emoji: '🍇', name: 'Grape' },
  { key: 'peach', emoji: '🍑', name: 'Peach' },
  { key: 'cherry', emoji: '🍒', name: 'Cherry' },
  { key: 'kiwi', emoji: '🥝', name: 'Kiwi' },
  { key: 'raspberry', emoji: '🫐', name: 'Raspberry' },
  { key: 'date', emoji: '🫘', name: 'Date' },
  { key: 'fig', emoji: '🫒', name: 'Fig' },
  { key: 'pear', emoji: '🍐', name: 'Pear' },
  // Vegetables
  { key: 'tomato', emoji: '🍅', name: 'Tomato' },
  { key: 'onion', emoji: '🧅', name: 'Onion' },
  { key: 'garlic', emoji: '🧄', name: 'Garlic' },
  { key: 'carrot', emoji: '🥕', name: 'Carrot' },
  { key: 'potato', emoji: '🥔', name: 'Potato' },
  { key: 'lettuce', emoji: '🥬', name: 'Lettuce' },
  { key: 'cucumber', emoji: '🥒', name: 'Cucumber' },
  { key: 'corn', emoji: '🌽', name: 'Corn' },
  { key: 'pea', emoji: '🟢', name: 'Pea' },
  { key: 'bean', emoji: '🫘', name: 'Bean' },
  { key: 'mushroom', emoji: '🍄', name: 'Mushroom' },
  { key: 'broccoli', emoji: '🥦', name: 'Broccoli' },
  { key: 'celery', emoji: '🥬', name: 'Celery' },
  { key: 'zucchini', emoji: '🥒', name: 'Zucchini' },
  { key: 'eggplant', emoji: '🍆', name: 'Eggplant' },
  { key: 'pepper', emoji: '🫑', name: 'Bell Pepper' },
  { key: 'spinach', emoji: '🥬', name: 'Spinach' },
  { key: 'kale', emoji: '🥬', name: 'Kale' },
  { key: 'ginger', emoji: '🫚', name: 'Ginger' },
  { key: 'cabbage', emoji: '🥬', name: 'Cabbage' },
  { key: 'scallion', emoji: '🧅', name: 'Scallion' },
  { key: 'radish', emoji: '🔴', name: 'Radish' },
  // Proteins
  { key: 'egg', emoji: '🥚', name: 'Egg' },
  { key: 'chicken', emoji: '🍗', name: 'Chicken' },
  { key: 'beef', emoji: '🥩', name: 'Beef' },
  { key: 'pork', emoji: '🥓', name: 'Pork' },
  { key: 'fish', emoji: '🐟', name: 'Fish' },
  { key: 'shrimp', emoji: '🦐', name: 'Shrimp' },
  { key: 'salmon', emoji: '🐠', name: 'Salmon' },
  { key: 'tofu', emoji: '🧈', name: 'Tofu' },
  { key: 'bacon', emoji: '🥓', name: 'Bacon' },
  { key: 'ham', emoji: '🍖', name: 'Ham' },
  { key: 'sausage', emoji: '🌭', name: 'Sausage' },
  { key: 'lamb', emoji: '🥩', name: 'Lamb' },
  // Dairy
  { key: 'milk', emoji: '🥛', name: 'Milk' },
  { key: 'cheese', emoji: '🧀', name: 'Cheese' },
  { key: 'cream', emoji: '🥛', name: 'Cream' },
  { key: 'butter', emoji: '🧈', name: 'Butter' },
  { key: 'cream_cheese', emoji: '🧀', name: 'Cream Cheese' },
  { key: 'mozzarella', emoji: '🧀', name: 'Mozzarella' },
  { key: 'parmesan', emoji: '🧀', name: 'Parmesan' },
  { key: 'cheddar', emoji: '🧀', name: 'Cheddar' },
  { key: 'yogurt', emoji: '🥛', name: 'Yogurt' },
  { key: 'condensed_milk', emoji: '🥛', name: 'Condensed Milk' },
  // Grains & Starches
  { key: 'flour', emoji: '🌾', name: 'Flour' },
  { key: 'rice', emoji: '🍚', name: 'Rice' },
  { key: 'noodle', emoji: '🍜', name: 'Noodle' },
  { key: 'bread', emoji: '🍞', name: 'Bread' },
  { key: 'pasta', emoji: '🍝', name: 'Pasta' },
  { key: 'oats', emoji: '🥣', name: 'Oats' },
  { key: 'tortilla', emoji: '🫓', name: 'Tortilla' },
  { key: 'rice_noodle', emoji: '🍜', name: 'Rice Noodle' },
  { key: 'tapioca', emoji: '⚪', name: 'Tapioca' },
  // Nuts & Seeds
  { key: 'almond', emoji: '🥜', name: 'Almond' },
  { key: 'walnut', emoji: '🥜', name: 'Walnut' },
  { key: 'peanut', emoji: '🥜', name: 'Peanut' },
  { key: 'sesame', emoji: '⚪', name: 'Sesame' },
  { key: 'cashew', emoji: '🥜', name: 'Cashew' },
  { key: 'pistachio', emoji: '🟢', name: 'Pistachio' },
  // Spices & Herbs
  { key: 'salt', emoji: '🧂', name: 'Salt' },
  { key: 'pepper', emoji: '🌶️', name: 'Pepper' },
  { key: 'basil', emoji: '🌿', name: 'Basil' },
  { key: 'mint', emoji: '🌿', name: 'Mint' },
  { key: 'cilantro', emoji: '🌿', name: 'Cilantro' },
  { key: 'cinnamon', emoji: '🫚', name: 'Cinnamon' },
  { key: 'nutmeg', emoji: '🫚', name: 'Nutmeg' },
  { key: 'paprika', emoji: '🔴', name: 'Paprika' },
  { key: 'cumin', emoji: '🟤', name: 'Cumin' },
  { key: 'turmeric', emoji: '🟡', name: 'Turmeric' },
  { key: 'chili', emoji: '🌶️', name: 'Chili' },
  { key: 'oregano', emoji: '🌿', name: 'Oregano' },
  { key: 'thyme', emoji: '🌿', name: 'Thyme' },
  { key: 'rosemary', emoji: '🌿', name: 'Rosemary' },
  { key: 'vanilla', emoji: '🫙', name: 'Vanilla' },
  { key: 'saffron', emoji: '🔴', name: 'Saffron' },
  { key: 'star_anise', emoji: '⭐', name: 'Star Anise' },
  { key: 'lemongrass', emoji: '🌿', name: 'Lemongrass' },
  // Condiments & Sweeteners
  { key: 'honey', emoji: '🍯', name: 'Honey' },
  { key: 'sugar', emoji: '🍬', name: 'Sugar' },
  { key: 'olive_oil', emoji: '🫒', name: 'Olive Oil' },
  { key: 'vinegar', emoji: '🫗', name: 'Vinegar' },
  { key: 'soy_sauce', emoji: '🫗', name: 'Soy Sauce' },
  { key: 'peanut_butter', emoji: '🥜', name: 'Peanut Butter' },
  { key: 'chocolate', emoji: '🍫', name: 'Chocolate' },
  { key: 'matcha', emoji: '🍵', name: 'Matcha' },
  { key: 'tamarind', emoji: '🟤', name: 'Tamarind' },
  { key: 'coconut_milk', emoji: '🥥', name: 'Coconut Milk' },
  // Beverages
  { key: 'water', emoji: '💧', name: 'Water' },
  { key: 'tea', emoji: '🍵', name: 'Tea' },
  { key: 'coffee', emoji: '☕', name: 'Coffee' },
  { key: 'wine', emoji: '🍷', name: 'Wine' },
  { key: 'sake', emoji: '🍶', name: 'Sake' },
];

const WORD_TO_INGREDIENT_KEY: Record<string, string> = {
  apple: 'apple', apples: 'apple',
  egg: 'egg', eggs: 'egg',
  milk: 'milk',
  flour: 'flour',
  sugar: 'sugar',
  butter: 'butter',
  salt: 'salt',
  pepper: 'pepper',
  chicken: 'chicken',
  beef: 'beef',
  pork: 'pork',
  fish: 'fish',
  rice: 'rice',
  noodle: 'noodle', noodles: 'noodle',
  tomato: 'tomato', tomatoes: 'tomato',
  onion: 'onion', onions: 'onion',
  garlic: 'garlic',
  carrot: 'carrot', carrots: 'carrot',
  potato: 'potato', potatoes: 'potato',
  lettuce: 'lettuce',
  cheese: 'cheese',
  cream: 'cream',
  bread: 'bread',
  pasta: 'pasta',
  chocolate: 'chocolate',
  vanilla: 'vanilla',
  honey: 'honey',
  lemon: 'lemon', lemons: 'lemon',
  lime: 'lime', limes: 'lime',
  orange: 'orange', oranges: 'orange',
  strawberry: 'strawberry', strawberries: 'strawberry',
  blueberry: 'blueberry', blueberries: 'blueberry',
  banana: 'banana', bananas: 'banana',
  mango: 'mango', mangoes: 'mango',
  avocado: 'avocado', avocados: 'avocado',
  cucumber: 'cucumber',
  corn: 'corn',
  pea: 'pea', peas: 'pea',
  bean: 'bean', beans: 'bean',
  mushroom: 'mushroom', mushrooms: 'mushroom',
  shrimp: 'shrimp',
  salmon: 'salmon',
  tofu: 'tofu',
  ginger: 'ginger',
  basil: 'basil',
  mint: 'mint',
  cilantro: 'cilantro',
  cinnamon: 'cinnamon',
  nutmeg: 'nutmeg',
  paprika: 'paprika',
  cumin: 'cumin',
  turmeric: 'turmeric',
  chili: 'chili', chilies: 'chili',
  vinegar: 'vinegar',
  oats: 'oats', oat: 'oats',
  almond: 'almond', almonds: 'almond',
  walnut: 'walnut', walnuts: 'walnut',
  peanut: 'peanut', peanuts: 'peanut',
  sesame: 'sesame',
  spinach: 'spinach',
  kale: 'kale',
  broccoli: 'broccoli',
  celery: 'celery',
  zucchini: 'zucchini',
  eggplant: 'eggplant',
  pineapple: 'pineapple',
  watermelon: 'watermelon',
  grape: 'grape', grapes: 'grape',
  peach: 'peach', peaches: 'peach',
  cherry: 'cherry', cherries: 'cherry',
  kiwi: 'kiwi',
  raspberry: 'raspberry', raspberries: 'raspberry',
  date: 'date', dates: 'date',
  tea: 'tea',
  coffee: 'coffee',
  wine: 'wine',
  bacon: 'bacon',
  ham: 'ham',
  sausage: 'sausage',
  lamb: 'lamb',
  mozzarella: 'mozzarella',
  parmesan: 'parmesan',
  cheddar: 'cheddar',
  yogurt: 'yogurt',
  coconut: 'coconut',
  coconut_milk: 'coconut_milk',
  tortilla: 'tortilla',
  soy: 'soy_sauce', soy_sauce: 'soy_sauce',
  olive: 'olive_oil', olive_oil: 'olive_oil',
  matcha: 'matcha',
  sake: 'sake',
  cashew: 'cashew', cashews: 'cashew',
  pistachio: 'pistachio',
  oregano: 'oregano',
  thyme: 'thyme',
  rosemary: 'rosemary',
  saffron: 'saffron',
  lemongrass: 'lemongrass',
  peanut_butter: 'peanut_butter',
  tamarind: 'tamarind',
  cabbage: 'cabbage',
  scallion: 'scallion',
  radish: 'radish',
  water: 'water',
  tapioca: 'tapioca',
  condensed_milk: 'condensed_milk',
  rice_noodle: 'rice_noodle',
};

// ---------------------------------------------------------------------------
// Constants — Recipe Database (62 recipes)
// ---------------------------------------------------------------------------

const RECIPES: Recipe[] = [
  // ── Breakfast (8) ────────────────────────────────────────────────────────
  {
    id: 'r01', name: 'Classic Pancakes', category: 'Breakfast', cuisine: 'American',
    ingredients: ['flour', 'egg', 'milk', 'butter', 'sugar'],
    time: 15, difficulty: 1,
    description: 'Fluffy golden pancakes drizzled with maple syrup',
  },
  {
    id: 'r02', name: 'French Toast', category: 'Breakfast', cuisine: 'French',
    ingredients: ['bread', 'egg', 'milk', 'cinnamon', 'vanilla'],
    time: 12, difficulty: 1,
    description: 'Bread soaked in custard and pan-fried to perfection',
  },
  {
    id: 'r03', name: 'Veggie Omelette', category: 'Breakfast', cuisine: 'American',
    ingredients: ['egg', 'cheese', 'pepper', 'mushroom', 'onion'],
    time: 10, difficulty: 1,
    description: 'A protein-packed omelette with colorful vegetables',
  },
  {
    id: 'r04', name: 'Avocado Toast', category: 'Breakfast', cuisine: 'American',
    ingredients: ['bread', 'avocado', 'tomato', 'salt', 'pepper'],
    time: 8, difficulty: 1,
    description: 'Creamy smashed avocado on artisan toast',
  },
  {
    id: 'r05', name: 'Berry Smoothie Bowl', category: 'Breakfast', cuisine: 'American',
    ingredients: ['banana', 'strawberry', 'blueberry', 'honey', 'milk'],
    time: 5, difficulty: 1,
    description: 'Thick blended fruit bowl topped with granola',
  },
  {
    id: 'r06', name: 'Japanese Tamagoyaki', category: 'Breakfast', cuisine: 'Japanese',
    ingredients: ['egg', 'sugar', 'soy_sauce', 'salt', 'water'],
    time: 10, difficulty: 3,
    description: 'Layered rolled omelette, sweet and savory',
  },
  {
    id: 'r07', name: 'Chilaquiles', category: 'Breakfast', cuisine: 'Mexican',
    ingredients: ['tortilla', 'egg', 'chili', 'cheese', 'onion'],
    time: 20, difficulty: 2,
    description: 'Crispy tortilla chips simmered in salsa with eggs',
  },
  {
    id: 'r08', name: 'Masala Oats', category: 'Breakfast', cuisine: 'Indian',
    ingredients: ['oats', 'onion', 'pepper', 'turmeric', 'ginger'],
    time: 15, difficulty: 2,
    description: 'Spiced Indian-style oats with aromatic vegetables',
  },
  // ── Lunch (8) ────────────────────────────────────────────────────────────
  {
    id: 'r09', name: 'Grilled Cheese', category: 'Lunch', cuisine: 'American',
    ingredients: ['bread', 'cheese', 'butter'],
    time: 8, difficulty: 1,
    description: 'Crispy bread with melted cheese golden perfection',
  },
  {
    id: 'r10', name: 'Caesar Salad', category: 'Lunch', cuisine: 'American',
    ingredients: ['lettuce', 'cheese', 'bread', 'garlic', 'lemon'],
    time: 15, difficulty: 2,
    description: 'Crisp romaine with tangy Caesar dressing and croutons',
  },
  {
    id: 'r11', name: 'BLT Sandwich', category: 'Lunch', cuisine: 'American',
    ingredients: ['bread', 'bacon', 'lettuce', 'tomato'],
    time: 10, difficulty: 1,
    description: 'Classic bacon lettuce and tomato on toasted bread',
  },
  {
    id: 'r12', name: 'Tom Yum Soup', category: 'Lunch', cuisine: 'Thai',
    ingredients: ['shrimp', 'mushroom', 'lemon', 'chili', 'lemongrass'],
    time: 25, difficulty: 3,
    description: 'Hot and sour Thai soup with fragrant herbs',
  },
  {
    id: 'r13', name: 'Fish Tacos', category: 'Lunch', cuisine: 'Mexican',
    ingredients: ['fish', 'tortilla', 'lime', 'avocado', 'cabbage'],
    time: 20, difficulty: 2,
    description: 'Crispy battered fish in warm tortillas',
  },
  {
    id: 'r14', name: 'Sushi Roll', category: 'Lunch', cuisine: 'Japanese',
    ingredients: ['fish', 'rice', 'avocado', 'cucumber', 'soy_sauce'],
    time: 30, difficulty: 4,
    description: 'Fresh fish and vegetables wrapped in seasoned rice',
  },
  {
    id: 'r15', name: 'Falafel Wrap', category: 'Lunch', cuisine: 'Indian',
    ingredients: ['bean', 'cucumber', 'tomato', 'onion', 'lemon'],
    time: 25, difficulty: 2,
    description: 'Crispy spiced chickpea fritters in flatbread',
  },
  {
    id: 'r16', name: 'Croque Monsieur', category: 'Lunch', cuisine: 'French',
    ingredients: ['bread', 'ham', 'cheese', 'butter', 'cream'],
    time: 15, difficulty: 2,
    description: 'Grilled ham and cheese with creamy béchamel',
  },
  // ── Dinner (10) ──────────────────────────────────────────────────────────
  {
    id: 'r17', name: 'Spaghetti Bolognese', category: 'Dinner', cuisine: 'Italian',
    ingredients: ['pasta', 'beef', 'tomato', 'onion', 'garlic'],
    time: 35, difficulty: 2,
    description: 'Rich meat sauce over al dente spaghetti',
  },
  {
    id: 'r18', name: 'Butter Chicken', category: 'Dinner', cuisine: 'Indian',
    ingredients: ['chicken', 'butter', 'cream', 'tomato', 'cumin'],
    time: 40, difficulty: 3,
    description: 'Tender chicken in creamy tomato-spice sauce',
  },
  {
    id: 'r19', name: 'Grilled Steak', category: 'Dinner', cuisine: 'American',
    ingredients: ['beef', 'salt', 'pepper', 'butter', 'garlic'],
    time: 20, difficulty: 3,
    description: 'Perfectly seared steak with herb butter',
  },
  {
    id: 'r20', name: 'Pad Thai', category: 'Dinner', cuisine: 'Thai',
    ingredients: ['rice_noodle', 'shrimp', 'egg', 'peanut', 'lime'],
    time: 25, difficulty: 3,
    description: 'Stir-fried rice noodles with tamarind sauce',
  },
  {
    id: 'r21', name: 'Fish and Chips', category: 'Dinner', cuisine: 'American',
    ingredients: ['fish', 'potato', 'flour', 'salt', 'vinegar'],
    time: 30, difficulty: 2,
    description: 'Beer-battered fish with crispy golden fries',
  },
  {
    id: 'r22', name: 'Beef Stew', category: 'Dinner', cuisine: 'American',
    ingredients: ['beef', 'potato', 'carrot', 'onion', 'garlic'],
    time: 90, difficulty: 2,
    description: 'Hearty slow-cooked stew with tender beef',
  },
  {
    id: 'r23', name: 'Chicken Parmesan', category: 'Dinner', cuisine: 'Italian',
    ingredients: ['chicken', 'parmesan', 'tomato', 'bread', 'basil'],
    time: 35, difficulty: 2,
    description: 'Breaded chicken cutlet with marinara and melted cheese',
  },
  {
    id: 'r24', name: 'Fried Rice', category: 'Dinner', cuisine: 'Chinese',
    ingredients: ['rice', 'egg', 'carrot', 'pea', 'soy_sauce'],
    time: 15, difficulty: 2,
    description: 'Wok-fried rice with vegetables and egg',
  },
  {
    id: 'r25', name: 'Lamb Tagine', category: 'Dinner', cuisine: 'Indian',
    ingredients: ['lamb', 'onion', 'cumin', 'cinnamon', 'saffron'],
    time: 120, difficulty: 4,
    description: 'Slow-braised lamb with aromatic North African spices',
  },
  {
    id: 'r26', name: 'Coq au Vin', category: 'Dinner', cuisine: 'French',
    ingredients: ['chicken', 'wine', 'mushroom', 'onion', 'garlic'],
    time: 90, difficulty: 4,
    description: 'Braised chicken in Burgundy wine sauce',
  },
  // ── Dessert (8) ──────────────────────────────────────────────────────────
  {
    id: 'r27', name: 'Chocolate Lava Cake', category: 'Dessert', cuisine: 'French',
    ingredients: ['chocolate', 'butter', 'egg', 'sugar', 'flour'],
    time: 25, difficulty: 3,
    description: 'Warm cake with a molten chocolate center',
  },
  {
    id: 'r28', name: 'Apple Pie', category: 'Dessert', cuisine: 'American',
    ingredients: ['apple', 'sugar', 'butter', 'flour', 'cinnamon'],
    time: 60, difficulty: 3,
    description: 'Classic comfort pie with spiced apple filling',
  },
  {
    id: 'r29', name: 'Tiramisu', category: 'Dessert', cuisine: 'Italian',
    ingredients: ['coffee', 'cheese', 'egg', 'sugar', 'cocoa'],
    time: 30, difficulty: 3,
    description: 'Layers of espresso-soaked ladyfingers and mascarpone',
  },
  {
    id: 'r30', name: 'New York Cheesecake', category: 'Dessert', cuisine: 'American',
    ingredients: ['cheese', 'sugar', 'egg', 'vanilla', 'butter'],
    time: 50, difficulty: 3,
    description: 'Rich and creamy cheesecake with a buttery crust',
  },
  {
    id: 'r31', name: 'Mochi Ice Cream', category: 'Dessert', cuisine: 'Japanese',
    ingredients: ['rice', 'sugar', 'coconut_milk', 'matcha', 'strawberry'],
    time: 40, difficulty: 4,
    description: 'Soft chewy rice cake filled with ice cream',
  },
  {
    id: 'r32', name: 'Churros', category: 'Dessert', cuisine: 'Mexican',
    ingredients: ['flour', 'butter', 'egg', 'sugar', 'chocolate'],
    time: 25, difficulty: 2,
    description: 'Fried dough sticks coated in cinnamon sugar',
  },
  {
    id: 'r33', name: 'Gulab Jamun', category: 'Dessert', cuisine: 'Indian',
    ingredients: ['milk', 'sugar', 'cardamom', 'butter', 'flour'],
    time: 45, difficulty: 3,
    description: 'Deep-fried milk dumplings soaked in rose-scented syrup',
  },
  {
    id: 'r34', name: 'Crème Brûlée', category: 'Dessert', cuisine: 'French',
    ingredients: ['cream', 'egg', 'sugar', 'vanilla'],
    time: 55, difficulty: 4,
    description: 'Silky custard with a crackling caramelized top',
  },
  // ── Snack (8) ────────────────────────────────────────────────────────────
  {
    id: 'r35', name: 'Guacamole', category: 'Snack', cuisine: 'Mexican',
    ingredients: ['avocado', 'lime', 'onion', 'tomato', 'cilantro'],
    time: 10, difficulty: 1,
    description: 'Fresh creamy avocado dip with zesty lime',
  },
  {
    id: 'r36', name: 'Bruschetta', category: 'Snack', cuisine: 'Italian',
    ingredients: ['bread', 'tomato', 'basil', 'garlic', 'olive_oil'],
    time: 10, difficulty: 1,
    description: 'Toasted bread topped with fresh tomato and basil',
  },
  {
    id: 'r37', name: 'Spring Rolls', category: 'Snack', cuisine: 'Chinese',
    ingredients: ['cabbage', 'carrot', 'mushroom', 'soy_sauce', 'ginger'],
    time: 20, difficulty: 2,
    description: 'Crispy fried rolls filled with vegetables',
  },
  {
    id: 'r38', name: 'Hummus Plate', category: 'Snack', cuisine: 'Indian',
    ingredients: ['bean', 'lemon', 'garlic', 'olive_oil', 'sesame'],
    time: 15, difficulty: 1,
    description: 'Creamy chickpea dip served with warm pita',
  },
  {
    id: 'r39', name: 'Edamame', category: 'Snack', cuisine: 'Japanese',
    ingredients: ['soy_sauce', 'salt', 'garlic', 'ginger'],
    time: 8, difficulty: 1,
    description: 'Steamed soybeans tossed with sea salt and garlic',
  },
  {
    id: 'r40', name: 'Nachos Supreme', category: 'Snack', cuisine: 'Mexican',
    ingredients: ['tortilla', 'cheese', 'chili', 'bean', 'avocado'],
    time: 15, difficulty: 1,
    description: 'Loaded tortilla chips with all the toppings',
  },
  {
    id: 'r41', name: 'Caprese Skewers', category: 'Snack', cuisine: 'Italian',
    ingredients: ['mozzarella', 'tomato', 'basil', 'olive_oil'],
    time: 5, difficulty: 1,
    description: 'Fresh mozzarella, tomato, and basil on skewers',
  },
  {
    id: 'r42', name: 'Satay Chicken', category: 'Snack', cuisine: 'Thai',
    ingredients: ['chicken', 'peanut', 'coconut_milk', 'lemongrass', 'chili'],
    time: 25, difficulty: 3,
    description: 'Grilled chicken skewers with spicy peanut sauce',
  },
  // ── Beverage (8) ─────────────────────────────────────────────────────────
  {
    id: 'r43', name: 'Classic Lemonade', category: 'Beverage', cuisine: 'American',
    ingredients: ['lemon', 'sugar', 'water'],
    time: 5, difficulty: 1,
    description: 'Refreshing freshly squeezed lemonade',
  },
  {
    id: 'r44', name: 'Matcha Latte', category: 'Beverage', cuisine: 'Japanese',
    ingredients: ['matcha', 'milk', 'sugar', 'water'],
    time: 5, difficulty: 1,
    description: 'Vibrant green tea latte with steamed milk',
  },
  {
    id: 'r45', name: 'Mango Lassi', category: 'Beverage', cuisine: 'Indian',
    ingredients: ['mango', 'yogurt', 'sugar', 'water'],
    time: 5, difficulty: 1,
    description: 'Creamy mango yogurt drink from India',
  },
  {
    id: 'r46', name: 'Thai Iced Tea', category: 'Beverage', cuisine: 'Thai',
    ingredients: ['tea', 'condensed_milk', 'sugar', 'water'],
    time: 10, difficulty: 1,
    description: 'Strong brewed tea with sweet condensed milk',
  },
  {
    id: 'r47', name: 'Hot Chocolate', category: 'Beverage', cuisine: 'American',
    ingredients: ['chocolate', 'milk', 'sugar', 'vanilla'],
    time: 8, difficulty: 1,
    description: 'Rich creamy hot cocoa with a hint of vanilla',
  },
  {
    id: 'r48', name: 'Sangria', category: 'Beverage', cuisine: 'French',
    ingredients: ['wine', 'orange', 'apple', 'sugar', 'lemon'],
    time: 15, difficulty: 2,
    description: 'Wine punch with fresh fruit and a touch of sweetness',
  },
  {
    id: 'r49', name: 'Bubble Tea', category: 'Beverage', cuisine: 'Chinese',
    ingredients: ['tea', 'milk', 'sugar', 'tapioca'],
    time: 15, difficulty: 2,
    description: 'Creamy milk tea with chewy tapioca pearls',
  },
  {
    id: 'r50', name: 'Espresso Martini', category: 'Beverage', cuisine: 'Italian',
    ingredients: ['coffee', 'sugar', 'vanilla', 'cream'],
    time: 5, difficulty: 3,
    description: 'Bold cocktail blending espresso with smooth spirits',
  },
  // ── Soup (6) ─────────────────────────────────────────────────────────────
  {
    id: 'r51', name: 'Minestrone', category: 'Soup', cuisine: 'Italian',
    ingredients: ['bean', 'tomato', 'carrot', 'celery', 'pasta'],
    time: 35, difficulty: 2,
    description: 'Hearty Italian vegetable soup with pasta and beans',
  },
  {
    id: 'r52', name: 'Pho', category: 'Soup', cuisine: 'Chinese',
    ingredients: ['beef', 'rice_noodle', 'onion', 'ginger', 'basil'],
    time: 45, difficulty: 3,
    description: 'Vietnamese aromatic beef noodle soup',
  },
  {
    id: 'r53', name: 'Tonkotsu Ramen', category: 'Soup', cuisine: 'Japanese',
    ingredients: ['pork', 'noodle', 'egg', 'garlic', 'scallion'],
    time: 60, difficulty: 4,
    description: 'Rich pork bone broth with noodles and toppings',
  },
  {
    id: 'r54', name: 'French Onion Soup', category: 'Soup', cuisine: 'French',
    ingredients: ['onion', 'beef', 'bread', 'cheese', 'butter'],
    time: 50, difficulty: 3,
    description: 'Caramelized onion soup with cheesy bread topping',
  },
  {
    id: 'r55', name: 'Tom Kha Gai', category: 'Soup', cuisine: 'Thai',
    ingredients: ['chicken', 'coconut_milk', 'lemon', 'ginger', 'chili'],
    time: 30, difficulty: 3,
    description: 'Thai coconut soup with chicken and galangal',
  },
  {
    id: 'r56', name: 'Hot and Sour Soup', category: 'Soup', cuisine: 'Chinese',
    ingredients: ['tofu', 'mushroom', 'vinegar', 'pepper', 'soy_sauce'],
    time: 25, difficulty: 2,
    description: 'Spicy and tangy Chinese soup with silken tofu',
  },
  // ── Salad (6) ────────────────────────────────────────────────────────────
  {
    id: 'r57', name: 'Greek Salad', category: 'Salad', cuisine: 'American',
    ingredients: ['tomato', 'cucumber', 'onion', 'cheese', 'olive_oil'],
    time: 10, difficulty: 1,
    description: 'Fresh Mediterranean vegetables with feta cheese',
  },
  {
    id: 'r58', name: 'Cobb Salad', category: 'Salad', cuisine: 'American',
    ingredients: ['chicken', 'bacon', 'egg', 'lettuce', 'avocado'],
    time: 15, difficulty: 2,
    description: 'Protein-packed salad with classic American toppings',
  },
  {
    id: 'r59', name: 'Caprese Salad', category: 'Salad', cuisine: 'Italian',
    ingredients: ['mozzarella', 'tomato', 'basil', 'olive_oil'],
    time: 5, difficulty: 1,
    description: 'Simple Italian salad of fresh mozzarella and tomato',
  },
  {
    id: 'r60', name: 'Asian Slaw', category: 'Salad', cuisine: 'Chinese',
    ingredients: ['cabbage', 'carrot', 'peanut', 'vinegar', 'chili'],
    time: 10, difficulty: 1,
    description: 'Crunchy slaw with Asian-inspired peanut dressing',
  },
  {
    id: 'r61', name: 'Kale Caesar', category: 'Salad', cuisine: 'American',
    ingredients: ['kale', 'cheese', 'bread', 'garlic', 'lemon'],
    time: 12, difficulty: 1,
    description: 'Trendy twist on the classic Caesar with kale',
  },
  {
    id: 'r62', name: 'Som Tum', category: 'Salad', cuisine: 'Thai',
    ingredients: ['carrot', 'tomato', 'peanut', 'lime', 'chili'],
    time: 15, difficulty: 2,
    description: 'Thai green papaya salad with spicy lime dressing',
  },
];

// ---------------------------------------------------------------------------
// Constants — Achievements (15)
// ---------------------------------------------------------------------------

const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_first_ingredient', name: 'First Harvest', description: 'Collect your first ingredient', icon: '🌱' },
  { id: 'ach_ingredient_25', name: 'Pantry Stocked', description: 'Collect 25 unique ingredients', icon: '📦' },
  { id: 'ach_ingredient_50', name: 'Master Forager', description: 'Collect 50 unique ingredients', icon: '🌿' },
  { id: 'ach_ingredient_all', name: 'Full Pantry', description: 'Collect every ingredient', icon: '🏛️' },
  { id: 'ach_first_cook', name: 'First Cook', description: 'Cook your first recipe', icon: '👨‍🍳' },
  { id: 'ach_cook_10', name: 'Line Cook', description: 'Cook 10 total recipes', icon: '🍳' },
  { id: 'ach_cook_50', name: 'Sous Chef', description: 'Cook 50 total recipes', icon: '👨‍🍳' },
  { id: 'ach_cook_100', name: 'Prolific Cook', description: 'Cook 100 total recipes', icon: '⭐' },
  { id: 'ach_master_chef', name: 'Master Chef 5\u2605', description: 'Master any recipe to 5 stars', icon: '🏆' },
  { id: 'ach_master_5', name: 'Five-Star Chef', description: 'Master 5 different recipes', icon: '🌟' },
  { id: 'ach_breakfast_buff', name: 'Breakfast Buff', description: 'Collect all Breakfast recipes', icon: '🍳' },
  { id: 'ach_world_tourist', name: 'World Tourist', description: 'Collect recipes from all 8 cuisines', icon: '✈️' },
  { id: 'ach_completionist', name: 'Completionist', description: 'Collect all recipes', icon: '🎖️' },
  { id: 'ach_daily_7', name: 'Daily Devotion', description: 'Complete 7 daily specials', icon: '📅' },
  { id: 'ach_daily_streak_5', name: 'Consistency King', description: 'Reach a 5-day daily streak', icon: '🔥' },
];

// ---------------------------------------------------------------------------
// Constants — Category & Cuisine lookups
// ---------------------------------------------------------------------------

const INGREDIENT_MAP: Record<string, Ingredient> = {};
for (const ing of INGREDIENT_DB) {
  INGREDIENT_MAP[ing.key] = ing;
}

const RECIPE_MAP: Record<string, Recipe> = {};
for (const recipe of RECIPES) {
  RECIPE_MAP[recipe.id] = recipe;
}

// ---------------------------------------------------------------------------
// Helper — createDefaultState
// ---------------------------------------------------------------------------

function createDefaultState(): RecipeState {
  return {
    collectedRecipes: [],
    masteredRecipes: {},
    totalCooks: 0,
    recipeRatings: {},
    unlockedAchievements: [],
    dailyStreak: 0,
    lastDailyDate: '',
    collectedIngredients: [],
    cookingState: null,
    dailyCompletedDates: [],
    recipeCookCount: {},
  };
}

// ---------------------------------------------------------------------------
// Module-level state (null initial for SSR safety)
// ---------------------------------------------------------------------------

let state: RecipeState | null = null;

function ensureInit(): RecipeState {
  if (!state) {
    state = createDefaultState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  let s = h >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function normalizeWord(word: string): string {
  return word.toLowerCase().trim();
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

// ===========================================================================
// EXPORTED FUNCTIONS — State Management
// ===========================================================================

export function rcInit(): RecipeState {
  state = createDefaultState();
  return state;
}

export function rcGetState(): RecipeState {
  return { ...ensureInit() };
}

export function rcResetState(): RecipeState {
  state = createDefaultState();
  return state;
}

/** Called by the game when a word is eaten. Maps the word to an ingredient. */
export function rcCollectWord(word: string): Ingredient | null {
  const s = ensureInit();
  const normalized = normalizeWord(word);
  const key = WORD_TO_INGREDIENT_KEY[normalized];
  if (!key) return null;

  if (!s.collectedIngredients.includes(key)) {
    s.collectedIngredients.push(key);
  }
  return INGREDIENT_MAP[key] ?? null;
}

// ===========================================================================
// EXPORTED FUNCTIONS — Recipe Queries
// ===========================================================================

export function rcGetRecipes(): Recipe[] {
  ensureInit();
  return [...RECIPES];
}

export function rcGetRecipeById(id: string): Recipe | null {
  ensureInit();
  return RECIPE_MAP[id] ?? null;
}

export function rcGetRecipesByCategory(category: RecipeCategory): Recipe[] {
  ensureInit();
  return RECIPES.filter((r) => r.category === category);
}

export function rcGetRecipesByCuisine(cuisine: CuisineType): Recipe[] {
  ensureInit();
  return RECIPES.filter((r) => r.cuisine === cuisine);
}

// ===========================================================================
// EXPORTED FUNCTIONS — Cooking
// ===========================================================================

export function rcStartCooking(
  recipeId: string,
  options?: { isDaily?: boolean }
): { success: boolean; message: string; recipe: Recipe | null } {
  const s = ensureInit();
  const recipe = RECIPE_MAP[recipeId];
  if (!recipe) {
    return { success: false, message: 'Recipe not found', recipe: null };
  }

  if (s.cookingState) {
    return { success: false, message: 'Already cooking something', recipe: null };
  }

  const hasAll = recipe.ingredients.every((ing) =>
    s.collectedIngredients.includes(ing)
  );

  if (!hasAll) {
    return { success: false, message: 'Missing required ingredients', recipe };
  }

  s.cookingState = {
    recipeId,
    startTime: Date.now(),
    duration: recipe.time * 1000, // convert minutes → ms for real-time feel (scaled)
    isDaily: options?.isDaily ?? false,
  };

  return { success: true, message: 'Cooking started!', recipe };
}

export function rcGetCookingProgress(): {
  isCooking: boolean;
  recipeId: string | null;
  progress: number; // 0-1
  recipe: Recipe | null;
  remainingMs: number;
} {
  const s = ensureInit();
  if (!s.cookingState) {
    return { isCooking: false, recipeId: null, progress: 0, recipe: null, remainingMs: 0 };
  }

  const elapsed = Date.now() - s.cookingState.startTime;
  const progress = Math.min(1, elapsed / s.cookingState.duration);
  const remaining = Math.max(0, s.cookingState.duration - elapsed);
  const recipe = RECIPE_MAP[s.cookingState.recipeId] ?? null;

  return {
    isCooking: progress < 1,
    recipeId: s.cookingState.recipeId,
    progress: Math.round(progress * 100) / 100,
    recipe,
    remainingMs: remaining,
  };
}

export function rcCompleteCooking(): {
  success: boolean;
  message: string;
  isNew: boolean;
  mastery: number;
  masteryIncrease: number;
  reward: number;
  recipe: Recipe | null;
} {
  const s = ensureInit();
  if (!s.cookingState) {
    return { success: false, message: 'Nothing cooking', isNew: false, mastery: 0, masteryIncrease: 0, reward: 0, recipe: null };
  }

  const elapsed = Date.now() - s.cookingState.startTime;
  if (elapsed < s.cookingState.duration) {
    return { success: false, message: 'Not ready yet', isNew: false, mastery: 0, masteryIncrease: 0, reward: 0, recipe: null };
  }

  const recipe = RECIPE_MAP[s.cookingState.recipeId];
  if (!recipe) {
    s.cookingState = null;
    return { success: false, message: 'Recipe missing', isNew: false, mastery: 0, masteryIncrease: 0, reward: 0, recipe: null };
  }

  const wasCollected = s.collectedRecipes.includes(recipe.id);
  const oldMastery = s.masteredRecipes[recipe.id] ?? 0;
  const newMastery = Math.min(5, oldMastery + 1);

  if (!wasCollected) {
    s.collectedRecipes.push(recipe.id);
  }

  s.masteredRecipes[recipe.id] = newMastery;
  s.totalCooks += 1;
  s.recipeCookCount[recipe.id] = (s.recipeCookCount[recipe.id] ?? 0) + 1;

  const isDaily = s.cookingState.isDaily;
  const baseReward = recipe.difficulty * 10;
  const masteryBonus = newMastery * 5;
  const dailyBonus = isDaily ? 50 + s.dailyStreak * 10 : 0;
  const reward = baseReward + masteryBonus + dailyBonus;

  if (isDaily) {
    const today = todayISO();
    if (!s.dailyCompletedDates.includes(today)) {
      s.dailyCompletedDates.push(today);

      if (s.lastDailyDate === daysBetween(s.lastDailyDate, today).toString() || s.lastDailyDate === '') {
        if (s.lastDailyDate !== '') {
          const diff = daysBetween(s.lastDailyDate, today);
          s.dailyStreak = diff === 1 ? s.dailyStreak + 1 : 1;
        } else {
          s.dailyStreak = 1;
        }
      }
      s.lastDailyDate = today;
    }
  }

  s.cookingState = null;

  return {
    success: true,
    message: wasCollected
      ? `Cooked ${recipe.name}! Mastery ${oldMastery}→${newMastery}`
      : `New recipe discovered: ${recipe.name}!`,
    isNew: !wasCollected,
    mastery: newMastery,
    masteryIncrease: newMastery - oldMastery,
    reward,
    recipe,
  };
}

export function rcRateRecipe(recipeId: string, rating: number): { success: boolean; message: string } {
  const s = ensureInit();
  const clamped = Math.max(1, Math.min(5, Math.round(rating)));

  if (!s.collectedRecipes.includes(recipeId)) {
    return { success: false, message: 'Recipe not collected yet' };
  }

  s.recipeRatings[recipeId] = clamped;
  return { success: true, message: `Rated ${RECIPE_MAP[recipeId]?.name ?? recipeId} ${clamped} stars` };
}

// ===========================================================================
// EXPORTED FUNCTIONS — Collection
// ===========================================================================

export function rcGetCollectedRecipes(): Recipe[] {
  const s = ensureInit();
  return s.collectedRecipes
    .map((id) => RECIPE_MAP[id])
    .filter((r): r is Recipe => r !== undefined);
}

export function rcGetCollectionProgress(): CollectionProgress[] {
  const s = ensureInit();
  return RECIPE_CATEGORIES.map(({ category }) => {
    const total = RECIPES.filter((r) => r.category === category).length;
    const collected = RECIPES.filter(
      (r) => r.category === category && s.collectedRecipes.includes(r.id)
    ).length;
    return {
      category,
      collected,
      total,
      percentage: total > 0 ? Math.round((collected / total) * 100) : 0,
    };
  });
}

export function rcGetMastery(recipeId: string): number {
  const s = ensureInit();
  return s.masteredRecipes[recipeId] ?? 0;
}

export function rcGetTotalCollected(): number {
  return ensureInit().collectedRecipes.length;
}

// ===========================================================================
// EXPORTED FUNCTIONS — Ingredients
// ===========================================================================

export function rcGetIngredientForWord(word: string): Ingredient | null {
  ensureInit();
  const normalized = normalizeWord(word);
  const key = WORD_TO_INGREDIENT_KEY[normalized];
  if (!key) return null;
  return INGREDIENT_MAP[key] ?? null;
}

export function rcGetAvailableIngredients(): Ingredient[] {
  const s = ensureInit();
  return s.collectedIngredients
    .map((key) => INGREDIENT_MAP[key])
    .filter((i): i is Ingredient => i !== undefined);
}

export function rcGetMatchedRecipes(): Recipe[] {
  const s = ensureInit();
  return RECIPES.filter((recipe) =>
    recipe.ingredients.every((ing) => s.collectedIngredients.includes(ing))
  );
}

// ===========================================================================
// EXPORTED FUNCTIONS — Daily Special
// ===========================================================================

export function rcGetDailySpecial(): DailySpecialInfo {
  const s = ensureInit();
  const today = todayISO();
  const rng = seededRandom(today);
  const index = Math.floor(rng() * RECIPES.length);
  const recipe = RECIPES[index];
  const bonus = 50 + s.dailyStreak * 10;

  return {
    recipe,
    bonusReward: bonus,
    streak: s.dailyStreak,
    isCompleted: s.dailyCompletedDates.includes(today),
  };
}

export function rcIsDailyCompleted(): boolean {
  const s = ensureInit();
  return s.dailyCompletedDates.includes(todayISO());
}

export function rcGetDailyStreak(): number {
  return ensureInit().dailyStreak;
}

// ===========================================================================
// EXPORTED FUNCTIONS — Achievements
// ===========================================================================

export function rcGetAchievements(): Achievement[] {
  ensureInit();
  return [...ACHIEVEMENTS];
}

export function rcCheckAchievements(): Achievement[] {
  const s = ensureInit();
  const newlyUnlocked: Achievement[] = [];

  const checks: [string, boolean][] = [
    ['ach_first_ingredient', s.collectedIngredients.length >= 1],
    ['ach_ingredient_25', s.collectedIngredients.length >= 25],
    ['ach_ingredient_50', s.collectedIngredients.length >= 50],
    ['ach_ingredient_all', s.collectedIngredients.length >= INGREDIENT_DB.length],
    ['ach_first_cook', s.totalCooks >= 1],
    ['ach_cook_10', s.totalCooks >= 10],
    ['ach_cook_50', s.totalCooks >= 50],
    ['ach_cook_100', s.totalCooks >= 100],
    ['ach_master_chef', Object.values(s.masteredRecipes).some((m) => m >= 5)],
    ['ach_master_5', Object.values(s.masteredRecipes).filter((m) => m >= 5).length >= 5],
    ['ach_breakfast_buff', RECIPES.filter((r) => r.category === 'Breakfast').every((r) => s.collectedRecipes.includes(r.id))],
    ['ach_world_tourist', CUISINE_TYPES.every(({ cuisine }) => RECIPES.some((r) => r.cuisine === cuisine && s.collectedRecipes.includes(r.id)))],
    ['ach_completionist', s.collectedRecipes.length >= RECIPES.length],
    ['ach_daily_7', s.dailyCompletedDates.length >= 7],
    ['ach_daily_streak_5', s.dailyStreak >= 5],
  ];

  for (const [id, met] of checks) {
    if (met && !s.unlockedAchievements.includes(id)) {
      s.unlockedAchievements.push(id);
      const ach = ACHIEVEMENTS.find((a) => a.id === id);
      if (ach) newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
}

// ===========================================================================
// EXPORTED FUNCTIONS — UI Helpers
// ===========================================================================

// ---------------------------------------------------------------------------
// rcGetOverview
// ---------------------------------------------------------------------------

export function rcGetOverview(): OverviewData {
  const s = ensureInit();
  const stats = rcGetStats();
  const dailySpecial = rcGetDailySpecial();
  const categoryProgress = rcGetCollectionProgress();
  const newAchievements = rcCheckAchievements();

  const recentIds = s.collectedRecipes.slice(-5).reverse();
  const recentRecipes: RecipeCard[] = recentIds.map((id) => {
    const recipe = RECIPE_MAP[id];
    if (!recipe) return null;
    return rcGetRecipeCard(id);
  }).filter((c): c is RecipeCard => c !== null);

  return { stats, recentRecipes, dailySpecial, categoryProgress, newAchievements };
}

// ---------------------------------------------------------------------------
// rcGetStatsGrid
// ---------------------------------------------------------------------------

export function rcGetStatsGrid(): StatsGridItem[] {
  const stats = rcGetStats();
  return [
    { label: 'Recipes Collected', value: `${stats.collected}/${stats.totalRecipes}`, icon: '📖' },
    { label: 'Recipes Mastered', value: stats.mastered, icon: '⭐' },
    { label: 'Total Cooks', value: stats.totalCooks, icon: '🍳' },
    { label: 'Completion', value: `${stats.completionPercent}%`, icon: '📊' },
    { label: 'Favorite Cuisine', value: stats.favoriteCuisine || '—', icon: '🌍' },
    { label: 'Avg Rating', value: stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}★` : '—', icon: '⭐' },
    { label: 'Achievements', value: `${stats.achievementsUnlocked}/${ACHIEVEMENTS.length}`, icon: '🏆' },
    { label: 'Ingredients', value: ensureInit().collectedIngredients.length, icon: '🧺' },
  ];
}

// ---------------------------------------------------------------------------
// rcGetRecipeCard
// ---------------------------------------------------------------------------

export function rcGetRecipeCard(recipeId: string): RecipeCard {
  const s = ensureInit();
  const recipe = RECIPE_MAP[recipeId];
  if (!recipe) {
    return {
      recipe: RECIPES[0],
      isCollected: false,
      mastery: 0,
      canCook: false,
      rating: 0,
      cookCount: 0,
    };
  }

  const isCollected = s.collectedRecipes.includes(recipeId);
  const mastery = s.masteredRecipes[recipeId] ?? 0;
  const canCook = recipe.ingredients.every((ing) =>
    s.collectedIngredients.includes(ing)
  );
  const rating = s.recipeRatings[recipeId] ?? 0;
  const cookCount = s.recipeCookCount[recipeId] ?? 0;

  return { recipe, isCollected, mastery, canCook, rating, cookCount };
}

// ---------------------------------------------------------------------------
// rcGetCategoryGrid
// ---------------------------------------------------------------------------

export function rcGetCategoryGrid(): CategoryGridItem[] {
  const s = ensureInit();
  return RECIPE_CATEGORIES.map(({ category, icon }) => {
    const total = RECIPES.filter((r) => r.category === category).length;
    const collected = RECIPES.filter(
      (r) => r.category === category && s.collectedRecipes.includes(r.id)
    ).length;
    return {
      category,
      icon,
      collected,
      total,
      percentage: total > 0 ? Math.round((collected / total) * 100) : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// rcGetCuisineGrid
// ---------------------------------------------------------------------------

export function rcGetCuisineGrid(): CuisineGridItem[] {
  const s = ensureInit();
  return CUISINE_TYPES.map(({ cuisine, icon }) => {
    const total = RECIPES.filter((r) => r.cuisine === cuisine).length;
    const collected = RECIPES.filter(
      (r) => r.cuisine === cuisine && s.collectedRecipes.includes(r.id)
    ).length;
    return {
      cuisine,
      icon,
      collected,
      total,
      percentage: total > 0 ? Math.round((collected / total) * 100) : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// rcGetCollectionGrid
// ---------------------------------------------------------------------------

export function rcGetCollectionGrid(options?: {
  category?: RecipeCategory;
  cuisine?: CuisineType;
  sortBy?: 'name' | 'mastery' | 'difficulty' | 'time';
}): CollectionGridItem[] {
  const s = ensureInit();
  let filtered = RECIPES;

  if (options?.category) {
    filtered = filtered.filter((r) => r.category === options.category);
  }
  if (options?.cuisine) {
    filtered = filtered.filter((r) => r.cuisine === options.cuisine);
  }

  const sortBy = options?.sortBy ?? 'name';
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'mastery':
        return (s.masteredRecipes[b.id] ?? 0) - (s.masteredRecipes[a.id] ?? 0);
      case 'difficulty':
        return a.difficulty - b.difficulty;
      case 'time':
        return a.time - b.time;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return sorted.map((recipe) => ({
    recipe,
    isCollected: s.collectedRecipes.includes(recipe.id),
    mastery: s.masteredRecipes[recipe.id] ?? 0,
    rating: s.recipeRatings[recipe.id] ?? 0,
    isNew: s.recipeCookCount[recipe.id] === 1,
  }));
}

// ---------------------------------------------------------------------------
// rcGetAchievementGrid
// ---------------------------------------------------------------------------

export function rcGetAchievementGrid(): AchievementGridItem[] {
  const s = ensureInit();
  return ACHIEVEMENTS.map((ach) => {
    let progress = 0;
    let progressLabel = '';

    switch (ach.id) {
      case 'ach_first_ingredient':
        progress = Math.min(1, s.collectedIngredients.length);
        progressLabel = `${s.collectedIngredients.length}/1`;
        break;
      case 'ach_ingredient_25':
        progress = Math.min(1, s.collectedIngredients.length / 25);
        progressLabel = `${s.collectedIngredients.length}/25`;
        break;
      case 'ach_ingredient_50':
        progress = Math.min(1, s.collectedIngredients.length / 50);
        progressLabel = `${s.collectedIngredients.length}/50`;
        break;
      case 'ach_ingredient_all':
        progress = s.collectedIngredients.length / INGREDIENT_DB.length;
        progressLabel = `${s.collectedIngredients.length}/${INGREDIENT_DB.length}`;
        break;
      case 'ach_first_cook':
        progress = Math.min(1, s.totalCooks);
        progressLabel = `${s.totalCooks}/1`;
        break;
      case 'ach_cook_10':
        progress = Math.min(1, s.totalCooks / 10);
        progressLabel = `${s.totalCooks}/10`;
        break;
      case 'ach_cook_50':
        progress = Math.min(1, s.totalCooks / 50);
        progressLabel = `${s.totalCooks}/50`;
        break;
      case 'ach_cook_100':
        progress = Math.min(1, s.totalCooks / 100);
        progressLabel = `${s.totalCooks}/100`;
        break;
      case 'ach_master_chef': {
        const maxMastery = Math.max(0, ...Object.values(s.masteredRecipes));
        progress = Math.min(1, maxMastery / 5);
        progressLabel = `${maxMastery}/5`;
        break;
      }
      case 'ach_master_5': {
        const masteredCount = Object.values(s.masteredRecipes).filter((m) => m >= 5).length;
        progress = Math.min(1, masteredCount / 5);
        progressLabel = `${masteredCount}/5`;
        break;
      }
      case 'ach_breakfast_buff': {
        const breakfastTotal = RECIPES.filter((r) => r.category === 'Breakfast').length;
        const breakfastCollected = RECIPES.filter(
          (r) => r.category === 'Breakfast' && s.collectedRecipes.includes(r.id)
        ).length;
        progress = breakfastTotal > 0 ? breakfastCollected / breakfastTotal : 0;
        progressLabel = `${breakfastCollected}/${breakfastTotal}`;
        break;
      }
      case 'ach_world_tourist': {
        const cuisinesCovered = CUISINE_TYPES.filter(({ cuisine }) =>
          RECIPES.some((r) => r.cuisine === cuisine && s.collectedRecipes.includes(r.id))
        ).length;
        progress = cuisinesCovered / CUISINE_TYPES.length;
        progressLabel = `${cuisinesCovered}/8`;
        break;
      }
      case 'ach_completionist':
        progress = s.collectedRecipes.length / RECIPES.length;
        progressLabel = `${s.collectedRecipes.length}/${RECIPES.length}`;
        break;
      case 'ach_daily_7':
        progress = Math.min(1, s.dailyCompletedDates.length / 7);
        progressLabel = `${s.dailyCompletedDates.length}/7`;
        break;
      case 'ach_daily_streak_5':
        progress = Math.min(1, s.dailyStreak / 5);
        progressLabel = `${s.dailyStreak}/5`;
        break;
      default:
        progressLabel = '';
    }

    return {
      achievement: ach,
      isUnlocked: s.unlockedAchievements.includes(ach.id),
      progress: Math.round(progress * 100) / 100,
      progressLabel,
    };
  });
}

// ---------------------------------------------------------------------------
// rcGetDailyCard
// ---------------------------------------------------------------------------

export function rcGetDailyCard(): DailyCardData {
  const s = ensureInit();
  const daily = rcGetDailySpecial();
  const recipe = daily.recipe;
  const canCook = recipe.ingredients.every((ing) =>
    s.collectedIngredients.includes(ing)
  );

  const missingIngredients = recipe.ingredients
    .filter((ing) => !s.collectedIngredients.includes(ing))
    .map((key) => INGREDIENT_MAP[key])
    .filter((i): i is Ingredient => i !== undefined);

  return {
    recipe,
    bonusReward: daily.bonusReward,
    streak: daily.streak,
    isCompleted: daily.isCompleted,
    canCook,
    missingIngredients,
  };
}

// ===========================================================================
// Internal Stats
// ===========================================================================

function rcGetStats(): RecipeStats {
  const s = ensureInit();

  const totalRecipes = RECIPES.length;
  const collected = s.collectedRecipes.length;
  const mastered = Object.values(s.masteredRecipes).filter((m) => m >= 5).length;
  const totalCooks = s.totalCooks;
  const completionPercent = totalRecipes > 0
    ? Math.round((collected / totalRecipes) * 100)
    : 0;

  // Favorite cuisine: the cuisine with most collected recipes
  const cuisineCounts: Record<string, number> = {};
  for (const id of s.collectedRecipes) {
    const recipe = RECIPE_MAP[id];
    if (recipe) {
      cuisineCounts[recipe.cuisine] = (cuisineCounts[recipe.cuisine] ?? 0) + 1;
    }
  }
  let favoriteCuisine = '';
  let maxCuisine = 0;
  for (const [cuisine, count] of Object.entries(cuisineCounts)) {
    if (count > maxCuisine) {
      maxCuisine = count;
      favoriteCuisine = cuisine;
    }
  }

  // Favorite category
  const categoryCounts: Record<string, number> = {};
  for (const id of s.collectedRecipes) {
    const recipe = RECIPE_MAP[id];
    if (recipe) {
      categoryCounts[recipe.category] = (categoryCounts[recipe.category] ?? 0) + 1;
    }
  }
  let favoriteCategory = '';
  let maxCategory = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCategory) {
      maxCategory = count;
      favoriteCategory = cat;
    }
  }

  // Average rating
  const ratings = Object.values(s.recipeRatings);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  return {
    totalRecipes,
    collected,
    mastered,
    totalCooks,
    completionPercent,
    favoriteCuisine,
    favoriteCategory,
    averageRating: Math.round(averageRating * 10) / 10,
    achievementsUnlocked: s.unlockedAchievements.length,
  };
}
