// =============================================================================
// Photo Safari Wire — SSR-safe module for wildlife photography game
// All exports use the `ps` prefix. No React hooks. No browser APIs at top level.
// =============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type RarityTier = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type PhotoQuality = 'Blurry' | 'Decent' | 'Good' | 'Great' | 'Perfect';

export type WeatherType = 'Clear' | 'Cloudy' | 'Rainy' | 'Foggy' | 'Golden Hour' | 'Northern Lights';

export type AnimalBehavior = 'sleeping' | 'hunting' | 'playing' | 'migrating' | 'hiding';

export type BiomeId =
  | 'african_savanna'
  | 'amazon_rainforest'
  | 'arctic_tundra'
  | 'coral_reef_depths'
  | 'himalayan_peaks'
  | 'australian_outback'
  | 'deep_jungle'
  | 'mangrove_swamp';

export type PhotoAttribute = 'composition' | 'lighting' | 'timing' | 'clarity' | 'rarity_bonus';

export interface BiomeDef {
  id: BiomeId;
  name: string;
  description: string;
  icon: string;
  color: string;
  difficulty: number; // 1-5
  idealWeather: WeatherType[];
  baseVisibility: number; // 0-100
}

export interface AnimalDef {
  id: string;
  name: string;
  species: string;
  biomeId: BiomeId;
  primaryBiome: BiomeId;
  rarity: RarityTier;
  description: string;
  photographyTip: string;
  behaviorPatterns: AnimalBehavior[];
  bestTimeOfDay: string;
  bestWeather: WeatherType[];
  xpValue: number;
  coinValue: number;
  baseDifficulty: number; // 1-10
  mythicChance: number; // 0-1
}

export interface EquipmentDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  compositionBonus: number;
  lightingBonus: number;
  timingBonus: number;
  clarityBonus: number;
  rarityBonus: number;
  requiredLevel: number;
  icon: string;
}

export interface WeatherDef {
  type: WeatherType;
  description: string;
  compositionMod: number;
  lightingMod: number;
  timingMod: number;
  clarityMod: number;
  icon: string;
}

export interface GuideDef {
  id: string;
  name: string;
  specialty: string;
  ability: string;
  abilityDescription: string;
  bonusBiome: BiomeId | null;
  animalRevealBonus: number; // 0-1
  photoQualityBonus: number; // 0-1
  cost: number;
  icon: string;
}

export interface Biome {
  id: BiomeId;
  name: string;
  description: string;
  icon: string;
  color: string;
  difficulty: number;
  unlocked: boolean;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  biomeId: BiomeId;
  rarity: RarityTier;
  description: string;
  photographyTip: string;
  behaviorPatterns: AnimalBehavior[];
  bestTimeOfDay: string;
  bestWeather: WeatherType[];
  xpValue: number;
  coinValue: number;
  baseDifficulty: number;
  photographed: boolean;
  photoCount: number;
  bestQuality: PhotoQuality | null;
}

export interface VisibleAnimal {
  animalId: string;
  animalName: string;
  biomeId: BiomeId;
  rarity: RarityTier;
  behavior: AnimalBehavior;
  visibility: number; // 0-100
  timeRemaining: number; // seconds remaining
  distance: number; // 1-100, lower = closer
}

export interface PhotoEntry {
  id: string;
  animalId: string;
  animalName: string;
  biomeId: BiomeId;
  quality: PhotoQuality;
  composition: number;
  lighting: number;
  timing: number;
  clarity: number;
  rarityBonus: number;
  totalScore: number;
  timestamp: number;
  isFavorite: boolean;
  rating: number; // 1-5 stars
  equipmentUsed: string[];
  weather: WeatherType;
  behavior: AnimalBehavior;
  notes: string;
}

export interface Weather {
  current: WeatherType;
  duration: number;
  nextChange: number;
  forecast: WeatherType[];
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  equipped: boolean;
  compositionBonus: number;
  lightingBonus: number;
  timingBonus: number;
  clarityBonus: number;
  rarityBonus: number;
  icon: string;
}

export interface Guide {
  id: string;
  name: string;
  specialty: string;
  ability: string;
  abilityDescription: string;
  bonusBiome: BiomeId | null;
  animalRevealBonus: number;
  photoQualityBonus: number;
  active: boolean;
  icon: string;
}

export interface Contest {
  id: string;
  name: string;
  description: string;
  theme: string;
  judgeName: string;
  judgePersonality: string;
  requiredBiome: BiomeId | null;
  requiredRarity: RarityTier | null;
  minQuality: PhotoQuality;
  xpReward: number;
  coinReward: number;
  deadline: number;
  submissions: ContestSubmission[];
  isActive: boolean;
}

export interface ContestSubmission {
  photoId: string;
  score: number;
  feedback: string;
  submittedAt: number;
}

export interface ContestResult {
  score: number;
  maxScore: number;
  rank: string;
  feedback: string;
  xpReward: number;
  coinReward: number;
}

export interface MigrationInfo {
  currentMonth: number;
  season: string;
  migrations: MigrationEvent[];
  incomingAnimals: MigrationEvent[];
}

export interface MigrationEvent {
  animalId: string;
  animalName: string;
  fromBiome: BiomeId;
  toBiome: BiomeId;
  duration: string;
  reason: string;
}

export interface DailyRare {
  animalId: string;
  animalName: string;
  biomeId: BiomeId;
  rarity: RarityTier;
  timeLimit: number; // seconds
  bonusMultiplier: number;
  isAvailable: boolean;
  expiresAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: number | null;
  condition: string;
}

export interface SafariStats {
  totalPhotosTaken: number;
  totalAnimalsPhotographed: number;
  totalBiomesVisited: number;
  perfectPhotos: number;
  greatPhotos: number;
  epicPhotos: number;
  legendaryPhotos: number;
  mythicPhotos: number;
  totalCoinsEarned: number;
  totalXPEarned: number;
  totalContestsWon: number;
  totalDistanceTraveled: number;
  favoriteBiome: string;
  favoriteAnimal: string;
  longestStreak: number;
  averagePhotoScore: number;
  rarestCapture: string;
  totalDaysPlayed: number;
}

export interface PhotoResult {
  success: boolean;
  photo: PhotoEntry | null;
  xpGained: number;
  coinsGained: number;
  quality: PhotoQuality | null;
  message: string;
}

export interface PhotoSafariState {
  initialized: boolean;
  version: number;
  // Player
  level: number;
  xp: number;
  coins: number;
  title: string;
  // Biome
  activeBiome: BiomeId;
  visitedBiomes: BiomeId[];
  // Weather
  currentWeather: WeatherType;
  weatherDuration: number;
  weatherForecast: WeatherType[];
  // Animals
  visibleAnimals: VisibleAnimal[];
  discoveredAnimals: string[];
  // Album
  album: PhotoEntry[];
  albumCapacity: number;
  favorites: string[];
  // Equipment
  cameraEquipment: string[];
  unlockedEquipment: string[];
  // Guides
  activeGuide: string | null;
  unlockedGuides: string[];
  // Contests
  photoContests: Contest[];
  // Daily
  dailyRareAnimal: DailyRare | null;
  lastDailyRareDate: string;
  // Streak
  streak: number;
  bestStreak: number;
  lastPlayDate: string;
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: string[];
  // Stats
  stats: SafariStats;
  // Migration
  currentMonth: number;
  // Run history
  runHistory: { date: string; photos: number; xp: number; coins: number }[];
  // Recent photos for quick access
  recentPhotos: PhotoEntry[];
}

// ---------------------------------------------------------------------------
// Static Data — Biomes (8)
// ---------------------------------------------------------------------------

export const PS_BIOMES: BiomeDef[] = [
  {
    id: 'african_savanna',
    name: 'African Savanna',
    description: 'Vast golden grasslands stretching to the horizon, home to the greatest concentration of large mammals on Earth. The rhythmic cycle of the Great Migration shapes life here.',
    icon: '🦁',
    color: '#d4a843',
    difficulty: 2,
    idealWeather: ['Clear', 'Golden Hour'],
    baseVisibility: 75,
  },
  {
    id: 'amazon_rainforest',
    name: 'Amazon Rainforest',
    description: 'The lungs of the Earth — an impenetrable emerald canopy hiding millions of species. Dense foliage makes photography challenging but rewarding.',
    icon: '🦜',
    color: '#228b22',
    difficulty: 4,
    idealWeather: ['Cloudy', 'Foggy'],
    baseVisibility: 45,
  },
  {
    id: 'arctic_tundra',
    name: 'Arctic Tundra',
    description: 'A frozen wilderness where survival means adaptation. Polar bears roam ice floes while Arctic foxes blend into the snow under the ethereal glow of Northern Lights.',
    icon: '🐻‍❄️',
    color: '#b0e0e6',
    difficulty: 3,
    idealWeather: ['Northern Lights', 'Clear'],
    baseVisibility: 55,
  },
  {
    id: 'coral_reef_depths',
    name: 'Coral Reef Depths',
    description: 'An underwater kaleidoscope of color and life. Tropical fish dart between branching corals while sea turtles glide through crystal-clear currents.',
    icon: '🐠',
    color: '#00ced1',
    difficulty: 4,
    idealWeather: ['Clear'],
    baseVisibility: 50,
  },
  {
    id: 'himalayan_peaks',
    name: 'Himalayan Peaks',
    description: 'The rooftop of the world where snow leopards prowl among clouds. Extreme altitude and unpredictable weather test even the most experienced photographers.',
    icon: '🏔️',
    color: '#8b8682',
    difficulty: 5,
    idealWeather: ['Clear', 'Golden Hour'],
    baseVisibility: 40,
  },
  {
    id: 'australian_outback',
    name: 'Australian Outback',
    description: 'A sun-scorched red landscape harboring creatures found nowhere else on Earth. From kangaroos to thorny devils, adaptation is the name of the game.',
    icon: '🦘',
    color: '#cd5c5c',
    difficulty: 3,
    idealWeather: ['Clear', 'Golden Hour'],
    baseVisibility: 65,
  },
  {
    id: 'deep_jungle',
    name: 'Deep Jungle',
    description: 'An ancient, untouched wilderness where trees tower hundreds of feet overhead. Mist-choked valleys conceal animals that science has yet to catalog.',
    icon: '🌿',
    color: '#2e8b57',
    difficulty: 5,
    idealWeather: ['Foggy', 'Cloudy'],
    baseVisibility: 35,
  },
  {
    id: 'mangrove_swamp',
    name: 'Mangrove Swamp',
    description: 'A tangled maze of salt-tolerant roots where land meets sea. Crocodiles lurk in murky waters while exotic birds roost in the canopy above.',
    icon: '🐊',
    color: '#556b2f',
    difficulty: 4,
    idealWeather: ['Cloudy', 'Rainy'],
    baseVisibility: 42,
  },
];

// ---------------------------------------------------------------------------
// Static Data — Animals (50)
// ---------------------------------------------------------------------------

export const PS_ANIMALS: AnimalDef[] = [
  // ---- African Savanna (7) ----
  {
    id: 'afr_lion', name: 'Kibali the Lion King', species: 'Panthera leo', biomeId: 'african_savanna', primaryBiome: 'african_savanna',
    rarity: 'Epic', description: 'A majestic male lion with a coal-black mane, ruling his pride across the eastern grasslands. His roar can be heard from three miles away.',
    photographyTip: 'Golden hour is essential — the warm light makes his mane glow. Use a telephoto lens and stay downwind.',
    behaviorPatterns: ['sleeping', 'hunting', 'playing'], bestTimeOfDay: 'Dawn/Dusk', bestWeather: ['Golden Hour', 'Clear'],
    xpValue: 150, coinValue: 200, baseDifficulty: 7, mythicChance: 0.02,
  },
  {
    id: 'afr_elephant', name: 'Tembo Matriarch', species: 'Loxodonta africana', biomeId: 'african_savanna', primaryBiome: 'african_savanna',
    rarity: 'Common', description: 'A wise elephant matriarch leading her herd to seasonal water sources, remembered by her remarkable memory spanning decades.',
    photographyTip: 'Elephants are gentle — approach slowly. Wide angle lens captures the herd best. Dust in the air adds drama.',
    behaviorPatterns: ['playing', 'migrating', 'sleeping'], bestTimeOfDay: 'Morning', bestWeather: ['Clear', 'Cloudy'],
    xpValue: 40, coinValue: 30, baseDifficulty: 3, mythicChance: 0.0,
  },
  {
    id: 'afr_giraffe', name: 'Sky-Reach Giraffe', species: 'Giraffa camelopardalis', biomeId: 'african_savanna', primaryBiome: 'african_savanna',
    rarity: 'Common', description: 'An exceptionally tall reticulated giraffe with a unique pattern resembling constellations, earning her the nickname "Starhide."',
    photographyTip: 'Use a wide angle for silhouettes against sunset. The unique coat pattern makes for stunning abstract close-ups.',
    behaviorPatterns: ['playing', 'sleeping', 'migrating'], bestTimeOfDay: 'Sunset', bestWeather: ['Golden Hour', 'Clear'],
    xpValue: 45, coinValue: 35, baseDifficulty: 3, mythicChance: 0.0,
  },
  {
    id: 'afr_leopard', name: 'Shadow-Step Leopard', species: 'Panthera pardus', biomeId: 'african_savanna', primaryBiome: 'african_savanna',
    rarity: 'Rare', description: 'A melanistic leopard that moves like liquid shadow through the savanna at twilight. Extremely elusive and nocturnal.',
    photographyTip: 'Night vision equipment is crucial. Look for eyes reflecting in the darkness. Patience is key — wait near watering holes.',
    behaviorPatterns: ['hunting', 'hiding', 'sleeping'], bestTimeOfDay: 'Night', bestWeather: ['Clear', 'Foggy'],
    xpValue: 100, coinValue: 120, baseDifficulty: 8, mythicChance: 0.01,
  },
  {
    id: 'afr_cheetah', name: 'Bolt the Cheetah', species: 'Acinonyx jubatus', biomeId: 'african_savanna', primaryBiome: 'african_savanna',
    rarity: 'Rare', description: 'The fastest land animal alive, clocked at 70 mph. Bolt is known for hunting during golden hour when her spotted coat catches the light.',
    photographyTip: 'Pre-focus on the expected sprint path. Fast shutter speed (1/2000s minimum). A drone provides the best chase-angle shots.',
    behaviorPatterns: ['hunting', 'playing'], bestTimeOfDay: 'Dawn', bestWeather: ['Golden Hour', 'Clear'],
    xpValue: 90, coinValue: 100, baseDifficulty: 7, mythicChance: 0.01,
  },
  {
    id: 'afr_wildebeest', name: 'Great Migration Herd', species: 'Connochaetes taurinus', biomeId: 'african_savanna', primaryBiome: 'african_savanna',
    rarity: 'Common', description: 'A staggering herd of over a million wildebeest, part of the annual Great Migration across the Serengeti.',
    photographyTip: 'Wide angle captures the scale. Position yourself at river crossings for dramatic action shots.',
    behaviorPatterns: ['migrating', 'playing'], bestTimeOfDay: 'Midday', bestWeather: ['Clear', 'Cloudy'],
    xpValue: 35, coinValue: 25, baseDifficulty: 2, mythicChance: 0.0,
  },
  {
    id: 'afr_honey_badger', name: 'Braveheart Badger', species: 'Mellivora capensis', biomeId: 'african_savanna', primaryBiome: 'african_savanna',
    rarity: 'Epic', description: 'A fearless honey badger known for taking on lions and venomous snakes. Small but ferocious beyond all proportion.',
    photographyTip: 'Honey badgers are fast and aggressive. Use a telephoto lens and keep distance. Bait with honey to lure them.',
    behaviorPatterns: ['hunting', 'hiding', 'playing'], bestTimeOfDay: 'Dusk', bestWeather: ['Clear'],
    xpValue: 140, coinValue: 180, baseDifficulty: 9, mythicChance: 0.03,
  },

  // ---- Amazon Rainforest (6) ----
  {
    id: 'amz_jaguar', name: 'Ember Jaguar', species: 'Panthera onca', biomeId: 'amazon_rainforest', primaryBiome: 'amazon_rainforest',
    rarity: 'Legendary', description: 'A massive jaguar with rosettes that shimmer like embers in the dappled light. The apex predator of the Amazon basin.',
    photographyTip: 'Jaguars favor riverbanks at dawn. Underwater housing can capture fishing behavior. Silent approach is non-negotiable.',
    behaviorPatterns: ['hunting', 'hiding', 'sleeping'], bestTimeOfDay: 'Dawn', bestWeather: ['Cloudy', 'Foggy'],
    xpValue: 250, coinValue: 400, baseDifficulty: 9, mythicChance: 0.01,
  },
  {
    id: 'amz_toucan', name: 'Rainbow Toucan', species: 'Ramphastos toco', biomeId: 'amazon_rainforest', primaryBiome: 'amazon_rainforest',
    rarity: 'Common', description: 'A brilliantly colored toucan with an oversized bill used for reaching distant fruit. Its calls echo through the canopy.',
    photographyTip: 'Look up in the canopy. Telephoto lens required. Overcast days provide even lighting without harsh shadows.',
    behaviorPatterns: ['playing', 'sleeping'], bestTimeOfDay: 'Mid-morning', bestWeather: ['Cloudy', 'Rainy'],
    xpValue: 30, coinValue: 20, baseDifficulty: 4, mythicChance: 0.0,
  },
  {
    id: 'amz_anaconda', name: 'Verdant Anaconda', species: 'Eunectes murinus', biomeId: 'amazon_rainforest', primaryBiome: 'amazon_rainforest',
    rarity: 'Epic', description: 'A colossal green anaconda lurking in the dark waters of a hidden oxbow lake. One of the largest snakes ever recorded.',
    photographyTip: 'Guide assistance recommended. Look for partially submerged coils. Underwater housing is essential for the best shots.',
    behaviorPatterns: ['hunting', 'hiding', 'sleeping'], bestTimeOfDay: 'Night', bestWeather: ['Rainy', 'Cloudy'],
    xpValue: 160, coinValue: 220, baseDifficulty: 9, mythicChance: 0.02,
  },
  {
    id: 'amz_harpy_eagle', name: 'Crown Harpy Eagle', species: 'Harpia harpyja', biomeId: 'amazon_rainforest', primaryBiome: 'amazon_rainforest',
    rarity: 'Rare', description: 'The most powerful eagle in the world, with talons the size of grizzly bear claws. Nests in the tallest emergent trees.',
    photographyTip: 'Stake out known nest sites. Massive telephoto lens (600mm+). Mist provides atmospheric depth.',
    behaviorPatterns: ['hunting', 'playing'], bestTimeOfDay: 'Morning', bestWeather: ['Foggy', 'Cloudy'],
    xpValue: 120, coinValue: 150, baseDifficulty: 8, mythicChance: 0.01,
  },
  {
    id: 'amz_sloth', name: 'Zenith the Sloth', species: 'Bradypus variegatus', biomeId: 'amazon_rainforest', primaryBiome: 'amazon_rainforest',
    rarity: 'Common', description: 'A three-toed sloth so still it grows algae on its fur, creating a symbiotic green camouflage system.',
    photographyTip: 'Sloths are easy to photograph once spotted — the challenge is finding them. Guides are invaluable here.',
    behaviorPatterns: ['sleeping', 'playing'], bestTimeOfDay: 'Any', bestWeather: ['Cloudy', 'Rainy'],
    xpValue: 25, coinValue: 15, baseDifficulty: 2, mythicChance: 0.0,
  },
  {
    id: 'amz_piranha', name: 'Silver Fang School', species: 'Pygocentrus nattereri', biomeId: 'amazon_rainforest', primaryBiome: 'amazon_rainforest',
    rarity: 'Rare', description: 'A massive school of red-bellied piranhas that can strip a carcass in minutes. Their feeding frenzies create spectacular water eruptions.',
    photographyTip: 'Underwater housing required. Drop fish bait to trigger feeding. Fast shutter speed freezes the water action.',
    behaviorPatterns: ['hunting', 'playing'], bestTimeOfDay: 'Midday', bestWeather: ['Clear'],
    xpValue: 80, coinValue: 80, baseDifficulty: 7, mythicChance: 0.01,
  },

  // ---- Arctic Tundra (6) ----
  {
    id: 'arc_polar_bear', name: 'Ghost Polar Bear', species: 'Ursus maritimus', biomeId: 'arctic_tundra', primaryBiome: 'arctic_tundra',
    rarity: 'Legendary', description: 'An enormous polar bear with fur that appears almost translucent under the Northern Lights. The undisputed king of the Arctic.',
    photographyTip: 'Northern Lights backdrop is the holy grail shot. Use a telephoto and stay with a guide — polar bears are extremely dangerous.',
    behaviorPatterns: ['hunting', 'sleeping', 'migrating'], bestTimeOfDay: 'Night', bestWeather: ['Northern Lights', 'Clear'],
    xpValue: 280, coinValue: 450, baseDifficulty: 9, mythicChance: 0.02,
  },
  {
    id: 'arc_arctic_fox', name: 'Snow Phantom Fox', species: 'Vulpes lagopus', biomeId: 'arctic_tundra', primaryBiome: 'arctic_tundra',
    rarity: 'Rare', description: 'A pure white Arctic fox that blends seamlessly into the snowscape. Only its coal-black nose and bright eyes give it away.',
    photographyTip: 'Use contrast against the snow. The fox is nearly invisible — follow tracks. Dawn gives the best warm-cool color contrast.',
    behaviorPatterns: ['hunting', 'hiding', 'playing'], bestTimeOfDay: 'Dawn', bestWeather: ['Clear', 'Foggy'],
    xpValue: 110, coinValue: 130, baseDifficulty: 8, mythicChance: 0.01,
  },
  {
    id: 'arc_snowy_owl', name: 'Silent Snowy Owl', species: 'Bubo scandiacus', biomeId: 'arctic_tundra', primaryBiome: 'arctic_tundra',
    rarity: 'Epic', description: 'A magnificent snowy owl with piercing yellow eyes, capable of detecting prey beneath two feet of snow from 200 feet in the air.',
    photographyTip: 'Look for them perched on fence posts or rises. Avoid direct approach — they spook easily. Northern Lights background is exceptional.',
    behaviorPatterns: ['hunting', 'sleeping'], bestTimeOfDay: 'Dusk', bestWeather: ['Northern Lights', 'Clear'],
    xpValue: 145, coinValue: 190, baseDifficulty: 7, mythicChance: 0.02,
  },
  {
    id: 'arc_narwhal', name: 'Moonstone Narwhal', species: 'Monodon monoceros', biomeId: 'arctic_tundra', primaryBiome: 'arctic_tundra',
    rarity: 'Mythic', description: 'A narwhal whose spiral tusk seems carved from moonstone, glowing faintly under polar night. The unicorn of the sea.',
    photographyTip: 'Underwater housing mandatory. Patience over ice holes. The tusk emerges during breeding season displays.',
    behaviorPatterns: ['migrating', 'playing'], bestTimeOfDay: 'Midnight (polar night)', bestWeather: ['Northern Lights'],
    xpValue: 500, coinValue: 800, baseDifficulty: 10, mythicChance: 1.0,
  },
  {
    id: 'arc_musk_ox', name: 'Thunderhoof Musk Ox', species: 'Ovibos moschatus', biomeId: 'arctic_tundra', primaryBiome: 'arctic_tundra',
    rarity: 'Common', description: 'A prehistoric-looking musk ox with a shaggy coat that can withstand -40°F. Forms defensive circles when threatened.',
    photographyTip: 'Wide angle lens captures the herd formation. Golden hour on snow creates stunning rim lighting effects.',
    behaviorPatterns: ['playing', 'sleeping', 'migrating'], bestTimeOfDay: 'Dawn', bestWeather: ['Clear', 'Golden Hour'],
    xpValue: 35, coinValue: 30, baseDifficulty: 3, mythicChance: 0.0,
  },
  {
    id: 'arc_wolf', name: 'Aurora Pack Alpha', species: 'Canis lupus arctos', biomeId: 'arctic_tundra', primaryBiome: 'arctic_tundra',
    rarity: 'Epic', description: 'The alpha of an Arctic wolf pack, distinguished by silver-tipped fur that sparkles under the Northern Lights.',
    photographyTip: 'Pack behavior shots are rare and valuable. Use telephoto and follow at a distance. Howling sessions at dusk are magical.',
    behaviorPatterns: ['hunting', 'playing', 'migrating'], bestTimeOfDay: 'Dusk', bestWeather: ['Northern Lights', 'Clear'],
    xpValue: 155, coinValue: 200, baseDifficulty: 8, mythicChance: 0.02,
  },

  // ---- Coral Reef Depths (7) ----
  {
    id: 'crl_manta_ray', name: 'Twilight Manta Ray', species: 'Mobula birostris', biomeId: 'coral_reef_depths', primaryBiome: 'coral_reef_depths',
    rarity: 'Epic', description: 'A giant manta ray with a wingspan exceeding 20 feet, gliding through the reef like an underwater blanket. Absolutely graceful.',
    photographyTip: 'Underwater housing essential. Approach from below for the classic silhouette shot. Wide angle captures the wingspan.',
    behaviorPatterns: ['playing', 'migrating'], bestTimeOfDay: 'Midday', bestWeather: ['Clear'],
    xpValue: 160, coinValue: 210, baseDifficulty: 7, mythicChance: 0.02,
  },
  {
    id: 'crl_sea_turtle', name: 'Ancient Loggerhead', species: 'Caretta caretta', biomeId: 'coral_reef_depths', primaryBiome: 'coral_reef_depths',
    rarity: 'Common', description: 'A loggerhead sea turtle estimated to be over 80 years old, slowly navigating the reef with ancient wisdom in her eyes.',
    photographyTip: 'Approach slowly and let the turtle come to you. Natural light works best — stay shallow for golden rays through water.',
    behaviorPatterns: ['playing', 'sleeping', 'migrating'], bestTimeOfDay: 'Mid-morning', bestWeather: ['Clear'],
    xpValue: 35, coinValue: 25, baseDifficulty: 3, mythicChance: 0.0,
  },
  {
    id: 'crl_clownfish', name: 'Coral Castle Clownfish', species: 'Amphiprion ocellaris', biomeId: 'coral_reef_depths', primaryBiome: 'coral_reef_depths',
    rarity: 'Common', description: 'A vibrant orange clownfish defending its anemone home with surprising ferocity. The Nemo of the real world.',
    photographyTip: 'Macro lens for close-ups of the anemone interaction. Use flash carefully to avoid washing out colors.',
    behaviorPatterns: ['playing', 'hiding'], bestTimeOfDay: 'Any', bestWeather: ['Clear'],
    xpValue: 25, coinValue: 18, baseDifficulty: 2, mythicChance: 0.0,
  },
  {
    id: 'crl_whale_shark', name: 'Gentle Leviathan', species: 'Rhincodon typus', biomeId: 'coral_reef_depths', primaryBiome: 'coral_reef_depths',
    rarity: 'Legendary', description: 'The largest fish in the sea, a 40-foot whale shark with a checkerboard pattern. Filters thousands of gallons of plankton daily.',
    photographyTip: 'This is the ultimate underwater shot. Wide angle, natural light, and hope for a close pass. Do NOT use flash.',
    behaviorPatterns: ['migrating', 'playing'], bestTimeOfDay: 'Midday', bestWeather: ['Clear'],
    xpValue: 300, coinValue: 500, baseDifficulty: 8, mythicChance: 0.01,
  },
  {
    id: 'crl_octopus', name: 'Mimic Master Octopus', species: 'Thaumoctopus mimicus', biomeId: 'coral_reef_depths', primaryBiome: 'coral_reef_depths',
    rarity: 'Rare', description: 'An octopus that can impersonate over 15 marine species including lionfish, flatfish, and sea snakes to avoid predators.',
    photographyTip: 'Patience is everything — the mimicry happens without warning. Use video mode alongside stills. Night dives yield more activity.',
    behaviorPatterns: ['hiding', 'hunting', 'playing'], bestTimeOfDay: 'Night', bestWeather: ['Clear'],
    xpValue: 95, coinValue: 110, baseDifficulty: 8, mythicChance: 0.01,
  },
  {
    id: 'crl_moray', name: 'Jade Jaw Moray Eel', species: 'Gymnothorax javanicus', biomeId: 'coral_reef_depths', primaryBiome: 'coral_reef_depths',
    rarity: 'Rare', description: 'A giant moray eel with jaws that open impossibly wide, revealing a second set of pharyngeal teeth deep within.',
    photographyTip: 'Wait for the yawn display — it happens after feeding. Use a macro/wide combo. Respect their space.',
    behaviorPatterns: ['hiding', 'hunting'], bestTimeOfDay: 'Night', bestWeather: ['Clear'],
    xpValue: 85, coinValue: 95, baseDifficulty: 7, mythicChance: 0.01,
  },
  {
    id: 'crl_leafy_dragon', name: 'Fairy Leafy Seadragon', species: 'Phycodurus eques', biomeId: 'coral_reef_depths', primaryBiome: 'coral_reef_depths',
    rarity: 'Mythic', description: 'A leafy seadragon so perfectly camouflaged as floating seaweed that it was thought to be a myth until 1981.',
    photographyTip: 'The rarest underwater photo opportunity. Look near kelp forests. Slow, deliberate movements only. Portrait orientation works best.',
    behaviorPatterns: ['hiding', 'playing'], bestTimeOfDay: 'Dawn', bestWeather: ['Clear', 'Foggy'],
    xpValue: 500, coinValue: 850, baseDifficulty: 10, mythicChance: 1.0,
  },

  // ---- Himalayan Peaks (6) ----
  {
    id: 'him_snow_leopard', name: 'Cloud Ghost Snow Leopard', species: 'Panthera uncia', biomeId: 'himalayan_peaks', primaryBiome: 'himalayan_peaks',
    rarity: 'Mythic', description: 'The so-called "Ghost of the Mountains" — a snow leopard so rarely photographed that fewer than 100 quality images exist worldwide.',
    photographyTip: 'Use camera traps if possible. Scout for tracks and scent markings. Extreme patience — sightings average once per 3-week expedition.',
    behaviorPatterns: ['hunting', 'hiding', 'migrating'], bestTimeOfDay: 'Dawn/Dusk', bestWeather: ['Clear', 'Golden Hour'],
    xpValue: 600, coinValue: 1000, baseDifficulty: 10, mythicChance: 1.0,
  },
  {
    id: 'him_red_panda', name: 'Crimson Cloud Panda', species: 'Ailurus fulgens', biomeId: 'himalayan_peaks', primaryBiome: 'himalayan_peaks',
    rarity: 'Epic', description: 'A flame-furred red panda perched on a mossy branch, chewing bamboo with an expression of pure contentment.',
    photographyTip: 'Red pandas are most active at dawn and dusk. They often sleep in trees — look up. The bamboo forests they favor are misty.',
    behaviorPatterns: ['sleeping', 'playing', 'hiding'], bestTimeOfDay: 'Dawn', bestWeather: ['Foggy', 'Cloudy'],
    xpValue: 150, coinValue: 195, baseDifficulty: 7, mythicChance: 0.02,
  },
  {
    id: 'him_takin', name: 'Bearded Mountain Takin', species: 'Budorcas taxicolor', biomeId: 'himalayan_peaks', primaryBiome: 'himalayan_peaks',
    rarity: 'Rare', description: 'A bizarre goat-antelope hybrid with a golden coat and curved horns, looking like something out of Greek mythology.',
    photographyTip: 'They graze in alpine meadows at dawn. The golden coat photographs best in warm morning light. Keep distance — they are strong.',
    behaviorPatterns: ['playing', 'migrating', 'sleeping'], bestTimeOfDay: 'Dawn', bestWeather: ['Clear', 'Golden Hour'],
    xpValue: 90, coinValue: 105, baseDifficulty: 6, mythicChance: 0.01,
  },
  {
    id: 'him_himalayan_monal', name: 'Nine-Color Pheasant', species: 'Lophophorus impejanus', biomeId: 'himalayan_peaks', primaryBiome: 'himalayan_peaks',
    rarity: 'Rare', description: 'The Himalayan monal, Nepal\'s national bird, with iridescent plumage that displays every color of the rainbow.',
    photographyTip: 'Males display at dawn during breeding season. The iridescence is best captured in soft light. Telephoto from a blind.',
    behaviorPatterns: ['playing', 'hunting'], bestTimeOfDay: 'Dawn', bestWeather: ['Clear', 'Cloudy'],
    xpValue: 100, coinValue: 120, baseDifficulty: 7, mythicChance: 0.01,
  },
  {
    id: 'him_blue_sheep', name: 'Skyline Bharal', species: 'Pseudois nayaur', biomeId: 'himalayan_peaks', primaryBiome: 'himalayan_peaks',
    rarity: 'Common', description: 'Blue sheep that navigate near-vertical cliff faces with impossible grace, providing dramatic photography opportunities.',
    photographyTip: 'Position below them on cliff faces for dramatic upward angles. The blue sheen is visible in direct sunlight at altitude.',
    behaviorPatterns: ['playing', 'migrating', 'sleeping'], bestTimeOfDay: 'Midday', bestWeather: ['Clear'],
    xpValue: 40, coinValue: 30, baseDifficulty: 4, mythicChance: 0.0,
  },
  {
    id: 'him_tibetan_fox', name: 'Square-Jaw Fox', species: 'Vulpes ferrilata', biomeId: 'himalayan_peaks', primaryBiome: 'himalayan_peaks',
    rarity: 'Epic', description: 'A Tibetan sand fox with an impossibly square face, resembling a stop-motion puppet. The internet\'s favorite mysterious canid.',
    photographyTip: 'They hunt marmots on the plateau. The square face is best captured from a 3/4 angle at eye level. Very skittish.',
    behaviorPatterns: ['hunting', 'hiding', 'sleeping'], bestTimeOfDay: 'Dawn/Dusk', bestWeather: ['Clear', 'Golden Hour'],
    xpValue: 140, coinValue: 185, baseDifficulty: 8, mythicChance: 0.02,
  },

  // ---- Australian Outback (6) ----
  {
    id: 'out_kangaroo', name: 'Red Desert Kangaroo', species: 'Osphranter rufus', biomeId: 'australian_outback', primaryBiome: 'australian_outback',
    rarity: 'Common', description: 'A massive red kangaroo male standing over 6 feet tall, capable of leaping 30 feet in a single bound across the red desert.',
    photographyTip: 'Capture the mid-leap for dynamic action. Backlit dust at golden hour creates dramatic silhouettes. Respect their space during mating season.',
    behaviorPatterns: ['playing', 'sleeping', 'migrating'], bestTimeOfDay: 'Dawn/Dusk', bestWeather: ['Clear', 'Golden Hour'],
    xpValue: 40, coinValue: 30, baseDifficulty: 3, mythicChance: 0.0,
  },
  {
    id: 'out_platypus', name: 'Elusive Puzzle Platypus', species: 'Ornithorhynchus anatinus', biomeId: 'australian_outback', primaryBiome: 'australian_outback',
    rarity: 'Epic', description: 'One of only two egg-laying mammals on Earth, the platypus is so bizarre that early scientists thought it was a hoax.',
    photographyTip: 'Sit still by freshwater streams at dawn. They surface for seconds at a time — rapid burst shooting is essential. Polarizing filter reduces glare.',
    behaviorPatterns: ['hiding', 'playing', 'hunting'], bestTimeOfDay: 'Dawn', bestWeather: ['Cloudy', 'Foggy'],
    xpValue: 145, coinValue: 190, baseDifficulty: 9, mythicChance: 0.02,
  },
  {
    id: 'out_thorny_devil', name: 'Desert Dragon Lizard', species: 'Moloch horridus', biomeId: 'australian_outback', primaryBiome: 'australian_outback',
    rarity: 'Rare', description: 'A tiny lizard covered in spikes that collects morning dew through capillary action directly into its mouth. Nature\'s water bottle.',
    photographyTip: 'Macro lens for detail shots of the spikes. They are slow-moving — ideal for beginners. Look on desert tracks at dawn.',
    behaviorPatterns: ['hiding', 'sleeping'], bestTimeOfDay: 'Dawn', bestWeather: ['Clear'],
    xpValue: 85, coinValue: 90, baseDifficulty: 5, mythicChance: 0.01,
  },
  {
    id: 'out_wedge_tailed_eagle', name: 'Desert King Eagle', species: 'Aquila audax', biomeId: 'australian_outback', primaryBiome: 'australian_outback',
    rarity: 'Rare', description: 'Australia\'s largest bird of prey with a 7-foot wingspan, soaring on thermal currents above the red desert.',
    photographyTip: 'Telephoto lens (400mm+). Thermals peak in mid-morning. The wingspan is best shown in soaring shots against blue sky.',
    behaviorPatterns: ['hunting', 'playing', 'sleeping'], bestTimeOfDay: 'Mid-morning', bestWeather: ['Clear'],
    xpValue: 95, coinValue: 110, baseDifficulty: 6, mythicChance: 0.01,
  },
  {
    id: 'out_dingo', name: 'Golden Shadow Dingo', species: 'Canis lupus dingo', biomeId: 'australian_outback', primaryBiome: 'australian_outback',
    rarity: 'Epic', description: 'A purebred dingo with golden fur and an almost supernatural ability to appear and vanish without a sound.',
    photographyTip: 'Extremely wary of humans. Use a blind or remote trigger. Dawn and dusk near waterholes provide the best opportunities.',
    behaviorPatterns: ['hunting', 'hiding', 'playing'], bestTimeOfDay: 'Dawn/Dusk', bestWeather: ['Golden Hour', 'Clear'],
    xpValue: 135, coinValue: 175, baseDifficulty: 8, mythicChance: 0.02,
  },
  {
    id: 'out_lasso_wombat', name: 'Boulder Wombat', species: 'Vombatus ursinus', biomeId: 'australian_outback', primaryBiome: 'australian_outback',
    rarity: 'Common', description: 'A stocky wombat built like a furry boulder, capable of charging through fences. Surprisingly fast for its size.',
    photographyTip: 'Low angle shots emphasize their sturdy build. They are most active at dusk. Evening light warms their brown fur beautifully.',
    behaviorPatterns: ['sleeping', 'playing', 'hiding'], bestTimeOfDay: 'Dusk', bestWeather: ['Clear', 'Cloudy'],
    xpValue: 35, coinValue: 25, baseDifficulty: 3, mythicChance: 0.0,
  },

  // ---- Deep Jungle (6) ----
  {
    id: 'dj_gorilla', name: 'Silverback Sovereign', species: 'Gorilla beringei beringei', biomeId: 'deep_jungle', primaryBiome: 'deep_jungle',
    rarity: 'Legendary', description: 'A 400-pound silverback mountain gorilla gazing with unsettling intelligence. Sharing 98.3% of human DNA, the resemblance is profound.',
    photographyTip: 'No flash — ever. Quiet, slow movements. The gorilla may approach you if you remain calm. A once-in-a-lifetime encounter.',
    behaviorPatterns: ['playing', 'sleeping', 'hiding'], bestTimeOfDay: 'Morning', bestWeather: ['Foggy', 'Cloudy'],
    xpValue: 320, coinValue: 500, baseDifficulty: 8, mythicChance: 0.01,
  },
  {
    id: 'dj_okapi', name: 'Living Fossil Okapi', species: 'Okapia johnstoni', biomeId: 'deep_jungle', primaryBiome: 'deep_jungle',
    rarity: 'Epic', description: 'The last living relative of the giraffe, with zebra-like stripes on its legs. Called the "African unicorn" — not photographed until 1901.',
    photographyTip: 'Incredibly shy. Salt licks are the best ambush point. Undergrowth is dense — clear lines of sight are rare. Use a guide.',
    behaviorPatterns: ['hiding', 'sleeping', 'playing'], bestTimeOfDay: 'Dawn', bestWeather: ['Foggy', 'Cloudy'],
    xpValue: 155, coinValue: 200, baseDifficulty: 9, mythicChance: 0.02,
  },
  {
    id: 'dj_poison_dart', name: 'Sapphire Poison Dart Frog', species: 'Dendrobates tinctorius', biomeId: 'deep_jungle', primaryBiome: 'deep_jungle',
    rarity: 'Rare', description: 'A tiny frog whose brilliant blue skin contains enough batrachotoxin to kill 10 adult humans. Beauty and danger in one package.',
    photographyTip: 'Macro lens at minimum focus distance. Diffused flash is acceptable for frogs. Mossy backgrounds complement the blue.',
    behaviorPatterns: ['playing', 'hiding'], bestTimeOfDay: 'Morning', bestWeather: ['Rainy', 'Cloudy'],
    xpValue: 80, coinValue: 85, baseDifficulty: 6, mythicChance: 0.01,
  },
  {
    id: 'dj_bongo', name: 'Spiral Horn Bongo', species: 'Tragelaphus eurycerus', biomeId: 'deep_jungle', primaryBiome: 'deep_jungle',
    rarity: 'Rare', description: 'The largest forest antelope, with spectacular spiraled horns and a chestnut coat striped with white. Critically endangered.',
    photographyTip: 'Salt licks again are key. They emerge at forest edges at dawn. Low light conditions — push ISO and use fast lenses.',
    behaviorPatterns: ['hiding', 'playing', 'migrating'], bestTimeOfDay: 'Dawn', bestWeather: ['Foggy'],
    xpValue: 105, coinValue: 125, baseDifficulty: 8, mythicChance: 0.01,
  },
  {
    id: 'dj_chameleon', name: 'Prismatic Panther Chameleon', species: 'Furcifer pardalis', biomeId: 'deep_jungle', primaryBiome: 'deep_jungle',
    rarity: 'Common', description: 'A chameleon that cycles through the entire color spectrum depending on mood, temperature, and light. A living mood ring.',
    photographyTip: 'Move slowly — they track movement. Macro lens. Patience as they change color. Overcast light prevents overexposure.',
    behaviorPatterns: ['sleeping', 'hiding', 'hunting'], bestTimeOfDay: 'Any', bestWeather: ['Cloudy', 'Rainy'],
    xpValue: 30, coinValue: 22, baseDifficulty: 4, mythicChance: 0.0,
  },
  {
    id: 'dj_forest_elephant', name: 'Shadow Elephant', species: 'Loxodonta cyclotis', biomeId: 'deep_jungle', primaryBiome: 'deep_jungle',
    rarity: 'Epic', description: 'A smaller, elusive cousin of the savanna elephant, adapted to dense forest. Their presence is announced by crashing trees long before they appear.',
    photographyTip: 'Follow the sound of breaking branches. Extremely difficult to see in dense vegetation. A guide is essential. Use wide aperture for shallow DOF.',
    behaviorPatterns: ['hiding', 'migrating', 'playing'], bestTimeOfDay: 'Dawn', bestWeather: ['Cloudy', 'Rainy'],
    xpValue: 148, coinValue: 195, baseDifficulty: 9, mythicChance: 0.02,
  },

  // ---- Mangrove Swamp (6) ----
  {
    id: 'mng_crocodile', name: 'Tide King Crocodile', species: 'Crocodylus porosus', biomeId: 'mangrove_swamp', primaryBiome: 'mangrove_swamp',
    rarity: 'Epic', description: 'A saltwater crocodile over 18 feet long, the largest living reptile. Lies motionless for hours before erupting with terrifying speed.',
    photographyTip: 'Keep a safe distance — they are apex ambush predators. Use telephoto from elevated positions. The "death roll" is the ultimate action shot.',
    behaviorPatterns: ['hunting', 'hiding', 'sleeping'], bestTimeOfDay: 'Dawn/Dusk', bestWeather: ['Cloudy', 'Rainy'],
    xpValue: 150, coinValue: 200, baseDifficulty: 8, mythicChance: 0.02,
  },
  {
    id: 'mng_probet_monkey', name: 'Silver Crest Proboscis', species: 'Nasalis larvatus', biomeId: 'mangrove_swamp', primaryBiome: 'mangrove_swamp',
    rarity: 'Rare', description: 'A proboscis monkey with an enormous nose that amplifies calls through the swamp. Faces endangered status due to habitat loss.',
    photographyTip: 'They congregate at dawn in trees overhanging water. The nose is the key feature — use telephoto for expression detail.',
    behaviorPatterns: ['playing', 'sleeping', 'hiding'], bestTimeOfDay: 'Dawn', bestWeather: ['Foggy', 'Cloudy'],
    xpValue: 100, coinValue: 115, baseDifficulty: 7, mythicChance: 0.01,
  },
  {
    id: 'mng_mangrove_snake', name: 'Neon Mangrove Snake', species: 'Boiga dendrophila', biomeId: 'mangrove_swamp', primaryBiome: 'mangrove_swamp',
    rarity: 'Rare', description: 'A stunningly beautiful mildly venomous snake with jet black scales and neon yellow bands. Highly arboreal and nocturnal.',
    photographyTip: 'Night vision recommended. Shine a light to find the yellow bands reflecting. Use a macro-telephoto combo for detail and context.',
    behaviorPatterns: ['hunting', 'hiding', 'sleeping'], bestTimeOfDay: 'Night', bestWeather: ['Rainy', 'Cloudy'],
    xpValue: 90, coinValue: 100, baseDifficulty: 8, mythicChance: 0.01,
  },
  {
    id: 'mng_heron', name: 'Crescent Heron', species: 'Ardea sumatrana', biomeId: 'mangrove_swamp', primaryBiome: 'mangrove_swamp',
    rarity: 'Common', description: 'A graceful heron that stalks fish in the shallow mangrove roots, standing motionless before striking with surgical precision.',
    photographyTip: 'The strike is lightning fast — use continuous shooting. Early morning fog creates an ethereal backdrop. Patience pays off.',
    behaviorPatterns: ['hunting', 'sleeping', 'playing'], bestTimeOfDay: 'Dawn', bestWeather: ['Foggy', 'Cloudy'],
    xpValue: 30, coinValue: 20, baseDifficulty: 3, mythicChance: 0.0,
  },
  {
    id: 'mng_fiddler_crab', name: 'Crimson Claw Fiddler', species: 'Uca spp.', biomeId: 'mangrove_swamp', primaryBiome: 'mangrove_swamp',
    rarity: 'Common', description: 'Male fiddler crabs wave their oversized claw in elaborate mating displays, creating a sea of red flags across the mud flats.',
    photographyTip: 'Get down to mud-flat level for the best perspective. The waving display happens at low tide. Macro lens for claw detail.',
    behaviorPatterns: ['playing', 'hunting'], bestTimeOfDay: 'Low Tide', bestWeather: ['Clear', 'Cloudy'],
    xpValue: 25, coinValue: 15, baseDifficulty: 2, mythicChance: 0.0,
  },
  {
    id: 'mng_manatee', name: 'Gentle Tide Manatee', species: 'Trichechus manatus', biomeId: 'mangrove_swamp', primaryBiome: 'mangrove_swamp',
    rarity: 'Legendary', description: 'A West Indian manatee grazing on seagrass in warm mangrove channels. Nicknamed the "sea cow" for its docile, grazing nature.',
    photographyTip: 'Underwater housing or shoot from above. They move slowly — easy to track. Crystal clear water at high tide provides the best visibility.',
    behaviorPatterns: ['playing', 'sleeping', 'migrating'], bestTimeOfDay: 'Midday', bestWeather: ['Clear'],
    xpValue: 260, coinValue: 420, baseDifficulty: 7, mythicChance: 0.01,
  },
];

// ---------------------------------------------------------------------------
// Static Data — Equipment (6)
// ---------------------------------------------------------------------------

export const PS_EQUIPMENT: EquipmentDef[] = [
  {
    id: 'basic_camera', name: 'Basic Camera',
    description: 'A reliable point-and-shoot camera. Gets the job done for common wildlife in good conditions.',
    cost: 0, compositionBonus: 0, lightingBonus: 0, timingBonus: 0, clarityBonus: 5, rarityBonus: 0,
    requiredLevel: 1, icon: '📸',
  },
  {
    id: 'telephoto_lens', name: 'Telephoto Lens',
    description: 'A 600mm f/4 super-telephoto lens. Essential for distant or skittish animals. Dramatically improves clarity and composition.',
    cost: 500, compositionBonus: 10, lightingBonus: 0, timingBonus: 5, clarityBonus: 20, rarityBonus: 5,
    requiredLevel: 5, icon: '🔭',
  },
  {
    id: 'wide_angle', name: 'Wide Angle Lens',
    description: 'A 16-35mm ultra-wide lens. Perfect for sweeping landscapes, herd shots, and environmental portraits showing animals in context.',
    cost: 400, compositionBonus: 20, lightingBonus: 5, timingBonus: 0, clarityBonus: 5, rarityBonus: 0,
    requiredLevel: 3, icon: '🎬',
  },
  {
    id: 'night_vision', name: 'Night Vision Scope',
    description: 'Military-grade night vision attachment. Reveals nocturnal animals invisible to the naked eye. Game-changer for dark conditions.',
    cost: 1200, compositionBonus: 0, lightingBonus: 25, timingBonus: 15, clarityBonus: 15, rarityBonus: 10,
    requiredLevel: 15, icon: '🌙',
  },
  {
    id: 'underwater_housing', name: 'Underwater Housing',
    description: 'Professional waterproof housing rated to 200m depth. Essential for coral reef and mangrove aquatic photography.',
    cost: 800, compositionBonus: 5, lightingBonus: 10, timingBonus: 5, clarityBonus: 15, rarityBonus: 15,
    requiredLevel: 10, icon: '🤿',
  },
  {
    id: 'drone_camera', name: 'Drone Camera',
    description: 'A stealthy quadcopter with 8K camera. Provides aerial perspectives impossible from the ground. Ideal for herd tracking.',
    cost: 1500, compositionBonus: 15, lightingBonus: 10, timingBonus: 20, clarityBonus: 10, rarityBonus: 10,
    requiredLevel: 20, icon: '🚁',
  },
];

// ---------------------------------------------------------------------------
// Static Data — Weather Types (6)
// ---------------------------------------------------------------------------

export const PS_WEATHER_TYPES: WeatherDef[] = [
  { type: 'Clear', description: 'Bright, cloudless skies with excellent visibility.', compositionMod: 5, lightingMod: 10, timingMod: 0, clarityMod: 15, icon: '☀️' },
  { type: 'Cloudy', description: 'Diffused light with even illumination — great for avoiding harsh shadows.', compositionMod: 10, lightingMod: 5, timingMod: 0, clarityMod: -5, icon: '⛅' },
  { type: 'Rainy', description: 'Rain creates puddle reflections and mist. Challenging but artistic conditions.', compositionMod: 15, lightingMod: -10, timingMod: 5, clarityMod: -15, icon: '🌧️' },
  { type: 'Foggy', description: 'Thick fog creates atmospheric, moody shots with layered depth.', compositionMod: 20, lightingMod: -5, timingMod: 0, clarityMod: -20, icon: '🌫️' },
  { type: 'Golden Hour', description: 'The magical time around sunrise/sunset with warm, directional light.', compositionMod: 15, lightingMod: 25, timingMod: 10, clarityMod: 5, icon: '🌅' },
  { type: 'Northern Lights', description: 'Aurora borealis paints the sky in curtains of green, purple, and pink.', compositionMod: 25, lightingMod: 20, timingMod: 15, clarityMod: -10, icon: '🌌' },
];

// ---------------------------------------------------------------------------
// Static Data — Guides (5)
// ---------------------------------------------------------------------------

export const PS_GUIDES: GuideDef[] = [
  {
    id: 'guide_amara', name: 'Amara Okafor',
    specialty: 'African Wildlife Tracker',
    ability: 'Savanna Intuition',
    abilityDescription: 'Reveals hidden animals in the African Savanna 30% more often and improves photo quality during Golden Hour.',
    bonusBiome: 'african_savanna', animalRevealBonus: 0.3, photoQualityBonus: 0.1,
    cost: 300, icon: '🧑🏿‍🌾',
  },
  {
    id: 'guide_kenji', name: 'Kenji Tanaka',
    specialty: 'Deep Sea Photographer',
    ability: 'Coral Whisper',
    abilityDescription: 'Reveals rare aquatic creatures in Coral Reef and Mangrove biomes. Underwater housing grants +20% clarity.',
    bonusBiome: 'coral_reef_depths', animalRevealBonus: 0.25, photoQualityBonus: 0.15,
    cost: 500, icon: '🤿',
  },
  {
    id: 'guide_elena', name: 'Elena Petrova',
    specialty: 'Arctic Expedition Leader',
    ability: 'Aurora Sense',
    abilityDescription: 'Predicts Northern Lights weather with 90% accuracy. Arctic animals appear 25% more frequently while active.',
    bonusBiome: 'arctic_tundra', animalRevealBonus: 0.25, photoQualityBonus: 0.15,
    cost: 600, icon: '🧊',
  },
  {
    id: 'guide_raj', name: 'Raj Thapa',
    specialty: 'Himalayan Mountaineer',
    ability: 'Mountain Sight',
    abilityDescription: 'Reveals snow leopards and rare mountain species 35% more often. Reduces weather penalties by 50% at altitude.',
    bonusBiome: 'himalayan_peaks', animalRevealBonus: 0.35, photoQualityBonus: 0.1,
    cost: 700, icon: '⛰️',
  },
  {
    id: 'guide_lucia', name: 'Lucia Mendez',
    specialty: 'Rainforest Ethnobotanist',
    ability: 'Jungle Song',
    abilityDescription: 'Calls hidden jungle animals by mimicking their sounds. Jungle and Mangrove visibility improves by 20%.',
    bonusBiome: 'deep_jungle', animalRevealBonus: 0.3, photoQualityBonus: 0.12,
    cost: 450, icon: '🌿',
  },
];

// ---------------------------------------------------------------------------
// Static Data — Migration Table
// ---------------------------------------------------------------------------

const MIGRATION_TABLE: { month: number; season: string; events: MigrationEvent[] }[] = [
  { month: 0, season: 'Winter', events: [
    { animalId: 'afr_wildebeest', animalName: 'Great Migration Herd', fromBiome: 'african_savanna', toBiome: 'african_savanna', duration: 'Year-round', reason: 'Calving season in southern Serengeti' },
    { animalId: 'arc_polar_bear', animalName: 'Ghost Polar Bear', fromBiome: 'arctic_tundra', toBiome: 'arctic_tundra', duration: 'Year-round', reason: 'Hunting seals on ice floes' },
  ]},
  { month: 1, season: 'Late Winter', events: [
    { animalId: 'afr_wildebeest', animalName: 'Great Migration Herd', fromBiome: 'african_savanna', toBiome: 'african_savanna', duration: 'Year-round', reason: 'Following rains northward' },
  ]},
  { month: 2, season: 'Early Spring', events: [
    { animalId: 'him_snow_leopard', animalName: 'Cloud Ghost Snow Leopard', fromBiome: 'himalayan_peaks', toBiome: 'himalayan_peaks', duration: 'Mar-Apr', reason: 'Descending to lower valleys for mating' },
    { animalId: 'arc_narwhal', animalName: 'Moonstone Narwhal', fromBiome: 'arctic_tundra', toBiome: 'arctic_tundra', duration: 'Mar-May', reason: 'Spring migration through ice channels' },
  ]},
  { month: 3, season: 'Spring', events: [
    { animalId: 'crl_whale_shark', animalName: 'Gentle Leviathan', fromBiome: 'coral_reef_depths', toBiome: 'coral_reef_depths', duration: 'Apr-Jun', reason: 'Arriving at Ningaloo Reef to feed' },
    { animalId: 'out_kangaroo', animalName: 'Red Desert Kangaroo', fromBiome: 'australian_outback', toBiome: 'australian_outback', duration: 'Year-round', reason: 'Breeding season begins' },
  ]},
  { month: 4, season: 'Late Spring', events: [
    { animalId: 'afr_cheetah', animalName: 'Bolt the Cheetah', fromBiome: 'african_savanna', toBiome: 'african_savanna', duration: 'May-Jul', reason: 'Teaching cubs to hunt in open plains' },
  ]},
  { month: 5, season: 'Early Summer', events: [
    { animalId: 'crl_manta_ray', animalName: 'Twilight Manta Ray', fromBiome: 'coral_reef_depths', toBiome: 'coral_reef_depths', duration: 'Jun-Aug', reason: 'Feeding on plankton blooms' },
    { animalId: 'arc_musk_ox', animalName: 'Thunderhoof Musk Ox', fromBiome: 'arctic_tundra', toBiome: 'arctic_tundra', duration: 'Year-round', reason: 'Summer grazing on tundra vegetation' },
  ]},
  { month: 6, season: 'Summer', events: [
    { animalId: 'afr_lion', animalName: 'Kibali the Lion King', fromBiome: 'african_savanna', toBiome: 'african_savanna', duration: 'Jul-Sep', reason: 'Peak hunting season during dry spell' },
    { animalId: 'him_red_panda', animalName: 'Crimson Cloud Panda', fromBiome: 'himalayan_peaks', toBiome: 'himalayan_peaks', duration: 'Jun-Aug', reason: 'Most active during bamboo shoot season' },
  ]},
  { month: 7, season: 'Late Summer', events: [
    { animalId: 'afr_elephant', animalName: 'Tembo Matriarch', fromBiome: 'african_savanna', toBiome: 'african_savanna', duration: 'Aug-Oct', reason: 'Leading herd to permanent water sources' },
  ]},
  { month: 8, season: 'Early Autumn', events: [
    { animalId: 'mng_manatee', animalName: 'Gentle Tide Manatee', fromBiome: 'mangrove_swamp', toBiome: 'mangrove_swamp', duration: 'Sep-Nov', reason: 'Returning to warm mangrove channels' },
    { animalId: 'arc_wolf', animalName: 'Aurora Pack Alpha', fromBiome: 'arctic_tundra', toBiome: 'arctic_tundra', duration: 'Oct-Feb', reason: 'Pack forming for winter hunting' },
  ]},
  { month: 9, season: 'Autumn', events: [
    { animalId: 'out_platypus', animalName: 'Elusive Puzzle Platypus', fromBiome: 'australian_outback', toBiome: 'australian_outback', duration: 'Oct-Nov', reason: 'Breeding season — males become more active' },
  ]},
  { month: 10, season: 'Late Autumn', events: [
    { animalId: 'afr_wildebeest', animalName: 'Great Migration Herd', fromBiome: 'african_savanna', toBiome: 'african_savanna', duration: 'Nov-Dec', reason: 'River crossing season — dramatic action' },
    { animalId: 'him_takin', animalName: 'Bearded Mountain Takin', fromBiome: 'himalayan_peaks', toBiome: 'himalayan_peaks', duration: 'Nov-Mar', reason: 'Descending to avoid deep snow' },
  ]},
  { month: 11, season: 'Early Winter', events: [
    { animalId: 'arc_snowy_owl', animalName: 'Silent Snowy Owl', fromBiome: 'arctic_tundra', toBiome: 'arctic_tundra', duration: 'Nov-Feb', reason: 'Irruption years bring them southward' },
    { animalId: 'dj_gorilla', animalName: 'Silverback Sovereign', fromBiome: 'deep_jungle', toBiome: 'deep_jungle', duration: 'Dec-Feb', reason: 'Fruiting season in mountain forests' },
  ]},
];

// ---------------------------------------------------------------------------
// Static Data — Achievements (15)
// ---------------------------------------------------------------------------

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'ps_first_photo', name: 'First Click', description: 'Take your very first wildlife photograph.', icon: '📸', condition: 'totalPhotosTaken >= 1' },
  { id: 'ps_10_species', name: 'Naturalist', description: 'Photograph 10 different animal species.', icon: '🦎', condition: 'totalAnimalsPhotographed >= 10' },
  { id: 'ps_25_species', name: 'Wildlife Expert', description: 'Photograph 25 different animal species.', icon: '🦁', condition: 'totalAnimalsPhotographed >= 25' },
  { id: 'ps_50_species', name: 'Complete Encyclopedia', description: 'Photograph all 50 animal species.', icon: '📚', condition: 'totalAnimalsPhotographed >= 50' },
  { id: 'ps_perfect_shot', name: 'Perfect Shot', description: 'Take a Perfect quality photograph.', icon: '⭐', condition: 'perfectPhotos >= 1' },
  { id: 'ps_10_perfect', name: 'Perfectionist', description: 'Take 10 Perfect quality photographs.', icon: '💎', condition: 'perfectPhotos >= 10' },
  { id: 'ps_mythic_capture', name: 'Mythic Hunter', description: 'Photograph a Mythic rarity animal.', icon: '🐉', condition: 'mythicPhotos >= 1' },
  { id: 'ps_all_biomes', name: 'World Traveler', description: 'Visit all 8 biomes.', icon: '🗺️', condition: 'totalBiomesVisited >= 8' },
  { id: 'ps_level_10', name: 'Seasoned Photographer', description: 'Reach photographer level 10.', icon: '📈', condition: 'level >= 10' },
  { id: 'ps_level_25', name: 'Master Photographer', description: 'Reach photographer level 25.', icon: '🏆', condition: 'level >= 25' },
  { id: 'ps_level_40', name: 'Living Legend', description: 'Reach photographer level 40.', icon: '👑', condition: 'level >= 40' },
  { id: 'ps_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day photography streak.', icon: '🔥', condition: 'bestStreak >= 7' },
  { id: 'ps_streak_30', name: 'Monthly Master', description: 'Maintain a 30-day photography streak.', icon: '📅', condition: 'bestStreak >= 30' },
  { id: 'ps_contest_win', name: 'Award Winner', description: 'Win a photo contest.', icon: '🏅', condition: 'totalContestsWon >= 1' },
  { id: 'ps_full_album', name: 'Gallery Owner', description: 'Fill your entire photo album (30 slots).', icon: '🖼️', condition: 'albumFull' },
];

// ---------------------------------------------------------------------------
// Static Data — Photo Contests (6)
// ---------------------------------------------------------------------------

const CONTEST_DEFS: Omit<Contest, 'submissions' | 'isActive'>[] = [
  {
    id: 'contest_sunset_savanna', name: 'Golden Savanna', description: 'Capture the essence of the African Savanna during Golden Hour.',
    theme: 'Sunset Wildlife', judgeName: 'Sir Reginald Foss', judgePersonality: 'Strict on composition, generous on atmosphere.',
    requiredBiome: 'african_savanna', requiredRarity: null, minQuality: 'Good',
    xpReward: 200, coinReward: 300, deadline: 86400000,
  },
  {
    id: 'contest_deep_blue', name: 'Abyssal Beauty', description: 'Submit your most stunning underwater photograph from the Coral Reef.',
    theme: 'Marine Life', judgeName: 'Dr. Marina Kovacs', judgePersonality: 'Loves color and clarity. Hates blurry shots.',
    requiredBiome: 'coral_reef_depths', requiredRarity: null, minQuality: 'Good',
    xpReward: 250, coinReward: 400, deadline: 86400000,
  },
  {
    id: 'contest_rare_bird', name: 'Winged Wonder', description: 'Photograph any rare or above bird species in its natural habitat.',
    theme: 'Avian Photography', judgeName: 'Professor Aiko Yamamoto', judgePersonality: 'Obsessed with wing detail and eye sharpness.',
    requiredBiome: null, requiredRarity: 'Rare', minQuality: 'Great',
    xpReward: 350, coinReward: 500, deadline: 86400000,
  },
  {
    id: 'contest_arctic_aurora', name: 'Northern Exposure', description: 'Photograph an Arctic animal with the Northern Lights in the background.',
    theme: 'Aurora Wildlife', judgeName: 'Erik Bjornsson', judgePersonality: 'Values drama and rarity. Loves action shots.',
    requiredBiome: 'arctic_tundra', requiredRarity: null, minQuality: 'Great',
    xpReward: 400, coinReward: 600, deadline: 86400000,
  },
  {
    id: 'contest_hidden_predator', name: 'Predator Unseen', description: 'Capture a predator in hunting mode, preferably with camouflage.',
    theme: 'Predator Photography', judgeName: 'Amara Okafor', judgePersonality: 'Rewards patience and storytelling in photos.',
    requiredBiome: null, requiredRarity: 'Epic', minQuality: 'Great',
    xpReward: 500, coinReward: 700, deadline: 86400000,
  },
  {
    id: 'contest_mythic_legend', name: 'Legends Among Us', description: 'Submit a photograph of a Legendary or Mythic animal. Only the best will do.',
    theme: 'Mythic Photography', judgeName: 'The Collective', judgePersonality: 'An anonymous panel demanding perfection in every attribute.',
    requiredBiome: null, requiredRarity: 'Legendary', minQuality: 'Perfect',
    xpReward: 1000, coinReward: 1500, deadline: 172800000,
  },
];

// ---------------------------------------------------------------------------
// Static Data — Level Titles
// ---------------------------------------------------------------------------

const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: 'Amateur' },
  { minLevel: 5, title: 'Enthusiast' },
  { minLevel: 10, title: 'Novice Photographer' },
  { minLevel: 15, title: 'Skilled Shooter' },
  { minLevel: 20, title: 'Wildlife Photographer' },
  { minLevel: 25, title: 'Expert Photographer' },
  { minLevel: 30, title: 'Master Photographer' },
  { minLevel: 35, title: 'Grand Master' },
  { minLevel: 40, title: 'Legend' },
];

// ---------------------------------------------------------------------------
// Rarity & Quality Config
// ---------------------------------------------------------------------------

const RARITY_CONFIG: Record<RarityTier, { color: string; xpMult: number; coinMult: number; spawnWeight: number }> = {
  Common:    { color: '#9ca3af', xpMult: 1.0,  coinMult: 1.0,  spawnWeight: 50 },
  Rare:      { color: '#3b82f6', xpMult: 2.0,  coinMult: 2.5,  spawnWeight: 25 },
  Epic:      { color: '#a855f7', xpMult: 3.5,  coinMult: 4.0,  spawnWeight: 15 },
  Legendary: { color: '#f59e0b', xpMult: 6.0,  coinMult: 8.0,  spawnWeight: 8 },
  Mythic:    { color: '#ef4444', xpMult: 12.0, coinMult: 15.0, spawnWeight: 2 },
};

const QUALITY_CONFIG: Record<PhotoQuality, { minScore: number; xpBonus: number; coinBonus: number; color: string }> = {
  Blurry:  { minScore: 0,  xpBonus: 0,    coinBonus: 0,    color: '#6b7280' },
  Decent:  { minScore: 30, xpBonus: 0.25, coinBonus: 0.25, color: '#22c55e' },
  Good:    { minScore: 55, xpBonus: 0.5,  coinBonus: 0.5,  color: '#3b82f6' },
  Great:   { minScore: 75, xpBonus: 1.0,  coinBonus: 1.0,  color: '#a855f7' },
  Perfect: { minScore: 90, xpBonus: 2.0,  coinBonus: 2.0,  color: '#f59e0b' },
};

const QUALITY_ORDER: PhotoQuality[] = ['Blurry', 'Decent', 'Good', 'Great', 'Perfect'];

// ---------------------------------------------------------------------------
// PRNG & Helpers
// ---------------------------------------------------------------------------

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = h ^ (h << 13);
    h = h ^ (h >> 17);
    h = h ^ (h << 5);
    return (h >>> 0) / 4294967296;
  };
}

function getDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTimestamp(): number {
  return Date.now();
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function generateId(): string {
  return 'ps_' + Math.random().toString(36).slice(2, 10) + '_' + getTimestamp().toString(36);
}

function xpForLevel(level: number): number {
  return Math.floor(200 * Math.pow(1.12, level - 1));
}

function getTitleForLevel(level: number): string {
  let title = 'Amateur';
  for (const t of LEVEL_TITLES) {
    if (level >= t.minLevel) title = t.title;
  }
  return title;
}

function getQualityForScore(score: number): PhotoQuality {
  let quality: PhotoQuality = 'Blurry';
  for (const q of QUALITY_ORDER) {
    if (score >= QUALITY_CONFIG[q].minScore) quality = q;
  }
  return quality;
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// Photo Scoring
// ---------------------------------------------------------------------------

function calculatePhotoScore(
  animal: AnimalDef,
  weather: WeatherType,
  equippedItems: EquipmentDef[],
  activeGuide: GuideDef | null,
  behavior: AnimalBehavior,
): {
  composition: number;
  lighting: number;
  timing: number;
  clarity: number;
  rarityBonus: number;
  total: number;
  quality: PhotoQuality;
} {
  const rng = seededRandom('photo_' + animal.id + '_' + getTimestamp());

  // Base scores with randomness
  let composition = clamp(30 + rng() * 40, 10, 100);
  let lighting = clamp(30 + rng() * 40, 10, 100);
  let timing = clamp(25 + rng() * 45, 5, 100);
  let clarity = clamp(35 + rng() * 35, 10, 100);

  // Weather modifiers
  const weatherDef = PS_WEATHER_TYPES.find(w => w.type === weather);
  if (weatherDef) {
    composition += weatherDef.compositionMod;
    lighting += weatherDef.lightingMod;
    timing += weatherDef.timingMod;
    clarity += weatherDef.clarityMod;
  }

  // Best weather bonus
  if (animal.bestWeather.includes(weather)) {
    composition += 8;
    lighting += 8;
    timing += 5;
  }

  // Behavior bonus
  const behaviorBonus: Record<AnimalBehavior, { comp: number; timing: number }> = {
    sleeping: { comp: 5, timing: -5 },
    hunting: { comp: 10, timing: 15 },
    playing: { comp: 8, timing: 10 },
    migrating: { comp: 12, timing: 5 },
    hiding: { comp: -10, timing: -10 },
  };
  const bb = behaviorBonus[behavior] || { comp: 0, timing: 0 };
  composition += bb.comp;
  timing += bb.timing;

  // Equipment bonuses
  for (const eq of equippedItems) {
    composition += eq.compositionBonus;
    lighting += eq.lightingBonus;
    timing += eq.timingBonus;
    clarity += eq.clarityBonus;
  }

  // Guide bonus
  if (activeGuide) {
    const guideBoost = 5 + activeGuide.photoQualityBonus * 15;
    composition += guideBoost;
    lighting += guideBoost * 0.5;
    clarity += guideBoost * 0.5;
  }

  // Difficulty penalty
  const diffPenalty = animal.baseDifficulty * 1.5;
  clarity -= diffPenalty;
  timing -= diffPenalty * 0.5;

  // Clamp all values
  composition = clamp(Math.round(composition), 0, 100);
  lighting = clamp(Math.round(lighting), 0, 100);
  timing = clamp(Math.round(timing), 0, 100);
  clarity = clamp(Math.round(clarity), 0, 100);

  // Rarity bonus
  const rarityBonusVal = RARITY_CONFIG[animal.rarity].xpMult * 5;

  // Total score
  const total = Math.round(
    composition * 0.25 +
    lighting * 0.2 +
    timing * 0.2 +
    clarity * 0.25 +
    rarityBonusVal * 0.1
  );
  const clampedTotal = clamp(total, 0, 100);

  return {
    composition,
    lighting,
    timing,
    clarity,
    rarityBonus: Math.round(rarityBonusVal),
    total: clampedTotal,
    quality: getQualityForScore(clampedTotal),
  };
}

// ---------------------------------------------------------------------------
// Visible Animal Generation
// ---------------------------------------------------------------------------

function generateVisibleAnimals(
  biomeId: BiomeId,
  weather: WeatherType,
  guide: GuideDef | null,
  level: number,
): VisibleAnimal[] {
  const rng = seededRandom('visible_' + biomeId + '_' + getDateString() + '_' + Math.floor(getTimestamp() / 3600000));
  const biomeDef = PS_BIOMES.find(b => b.id === biomeId);
  if (!biomeDef) return [];

  const biomeAnimals = PS_ANIMALS.filter(a => a.biomeId === biomeId || a.primaryBiome === biomeId);
  const visible: VisibleAnimal[] = [];
  const maxVisible = 3 + Math.floor(level / 5);

  // Weight by rarity
  for (const animal of biomeAnimals) {
    const weight = RARITY_CONFIG[animal.rarity].spawnWeight;
    if (rng() * 100 < weight) {
      const baseVisibility = biomeDef.baseVisibility;
      const weatherMatch = animal.bestWeather.includes(weather) ? 20 : -10;
      const guideBonus = guide && (guide.bonusBiome === biomeId) ? guide.animalRevealBonus * 30 : 0;
      const rarityPenalty = RARITY_CONFIG[animal.rarity].spawnWeight < 10 ? -15 : 0;
      const vis = clamp(baseVisibility + weatherMatch + guideBonus + rarityPenalty + rng() * 20, 10, 100);

      const behavior = pickRandom(animal.behaviorPatterns, rng);
      const dist = clamp(10 + rng() * 80 - guideBonus * 2, 5, 95);

      visible.push({
        animalId: animal.id,
        animalName: animal.name,
        biomeId: animal.biomeId,
        rarity: animal.rarity,
        behavior,
        visibility: Math.round(vis),
        timeRemaining: Math.round(120 + rng() * 300),
        distance: Math.round(dist),
      });
    }

    if (visible.length >= maxVisible) break;
  }

  return visible;
}

// ---------------------------------------------------------------------------
// State — Lazy initialized, SSR-safe
// ---------------------------------------------------------------------------

let state: PhotoSafariState | null = null;

function createInitialState(): PhotoSafariState {
  const today = getDateString();
  const now = getTimestamp();

  const achievements: Achievement[] = ACHIEVEMENT_DEFS.map(a => ({
    ...a, unlocked: false, unlockedAt: null,
  }));

  const contests: Contest[] = CONTEST_DEFS.map(c => ({
    ...c, submissions: [], isActive: true,
  }));

  const weatherTypes: WeatherType[] = ['Clear', 'Cloudy', 'Rainy', 'Foggy', 'Golden Hour', 'Northern Lights'];
  const initialWeather = weatherTypes[Math.floor(new Date().getHours() / 4) % weatherTypes.length];
  const forecast: WeatherType[] = [];
  const fRng = seededRandom('forecast_' + today);
  for (let i = 0; i < 3; i++) {
    forecast.push(pickRandom(weatherTypes, fRng));
  }

  return {
    initialized: true,
    version: 1,
    level: 1,
    xp: 0,
    coins: 200,
    title: 'Amateur',
    activeBiome: 'african_savanna',
    visitedBiomes: ['african_savanna'],
    currentWeather: initialWeather,
    weatherDuration: 1800 + Math.floor(Math.random() * 3600),
    weatherForecast: forecast,
    visibleAnimals: [],
    discoveredAnimals: [],
    album: [],
    albumCapacity: 30,
    favorites: [],
    cameraEquipment: ['basic_camera'],
    unlockedEquipment: ['basic_camera'],
    activeGuide: null,
    unlockedGuides: [],
    photoContests: contests,
    dailyRareAnimal: null,
    lastDailyRareDate: today,
    streak: 0,
    bestStreak: 0,
    lastPlayDate: today,
    achievements,
    unlockedAchievements: [],
    stats: {
      totalPhotosTaken: 0,
      totalAnimalsPhotographed: 0,
      totalBiomesVisited: 1,
      perfectPhotos: 0,
      greatPhotos: 0,
      epicPhotos: 0,
      legendaryPhotos: 0,
      mythicPhotos: 0,
      totalCoinsEarned: 200,
      totalXPEarned: 0,
      totalContestsWon: 0,
      totalDistanceTraveled: 0,
      favoriteBiome: 'African Savanna',
      favoriteAnimal: '',
      longestStreak: 0,
      averagePhotoScore: 0,
      rarestCapture: '',
      totalDaysPlayed: 0,
    },
    currentMonth: new Date().getMonth(),
    runHistory: [],
    recentPhotos: [],
  };
}

function ensureInit(): PhotoSafariState {
  if (!state) {
    state = createInitialState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// Achievement Checking
// ---------------------------------------------------------------------------

function evaluateCondition(state: PhotoSafariState, condition: string): boolean {
  switch (condition) {
    case 'totalPhotosTaken >= 1':
      return state.stats.totalPhotosTaken >= 1;
    case 'totalAnimalsPhotographed >= 10':
      return state.stats.totalAnimalsPhotographed >= 10;
    case 'totalAnimalsPhotographed >= 25':
      return state.stats.totalAnimalsPhotographed >= 25;
    case 'totalAnimalsPhotographed >= 50':
      return state.stats.totalAnimalsPhotographed >= 50;
    case 'perfectPhotos >= 1':
      return state.stats.perfectPhotos >= 1;
    case 'perfectPhotos >= 10':
      return state.stats.perfectPhotos >= 10;
    case 'mythicPhotos >= 1':
      return state.stats.mythicPhotos >= 1;
    case 'totalBiomesVisited >= 8':
      return state.stats.totalBiomesVisited >= 8;
    case 'level >= 10':
      return state.level >= 10;
    case 'level >= 25':
      return state.level >= 25;
    case 'level >= 40':
      return state.level >= 40;
    case 'bestStreak >= 7':
      return state.bestStreak >= 7;
    case 'bestStreak >= 30':
      return state.bestStreak >= 30;
    case 'totalContestsWon >= 1':
      return state.stats.totalContestsWon >= 1;
    case 'albumFull':
      return state.album.length >= state.albumCapacity;
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Streak Management
// ---------------------------------------------------------------------------

function updateStreak(s: PhotoSafariState): void {
  const today = getDateString();
  const yesterday = new Date(getTimestamp() - 86400000);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (s.lastPlayDate === today) return;

  if (s.lastPlayDate === yesterdayStr) {
    s.streak += 1;
  } else if (s.lastPlayDate !== today) {
    s.streak = 1;
  }

  if (s.streak > s.bestStreak) {
    s.bestStreak = s.streak;
    s.stats.longestStreak = s.streak;
  }

  s.lastPlayDate = today;
  s.stats.totalDaysPlayed += 1;
}

// ---------------------------------------------------------------------------
// Exported Functions — State Management
// ---------------------------------------------------------------------------

export function psGetState(): PhotoSafariState {
  return ensureInit();
}

export function psResetState(): void {
  state = null;
}

// ---------------------------------------------------------------------------
// Exported Functions — Level & XP
// ---------------------------------------------------------------------------

export function psGetLevel(): number {
  return ensureInit().level;
}

export function psAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  let xpToAdd = Math.round(amount);
  s.xp += xpToAdd;
  s.stats.totalXPEarned += xpToAdd;

  let leveledUp = false;
  let newLevel = s.level;

  while (s.level < 40 && s.xp >= xpForLevel(s.level + 1)) {
    s.level += 1;
    leveledUp = true;
    newLevel = s.level;
  }

  s.title = getTitleForLevel(s.level);
  return { leveledUp, newLevel };
}

export function psGetXPProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  const currentLevelXP = xpForLevel(s.level);
  const nextLevelXP = s.level < 40 ? xpForLevel(s.level + 1) : currentLevelXP;
  const current = s.xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  const percentage = s.level >= 40 ? 100 : Math.round((current / needed) * 100);
  return { current: Math.max(0, current), needed: Math.max(1, needed), percentage: clamp(percentage, 0, 100) };
}

export function psGetTitle(): string {
  return ensureInit().title;
}

// ---------------------------------------------------------------------------
// Exported Functions — Coins
// ---------------------------------------------------------------------------

export function psGetCoins(): number {
  return ensureInit().coins;
}

export function psSpendCoins(amount: number): { success: boolean; remaining: number } {
  const s = ensureInit();
  if (s.coins < amount) {
    return { success: false, remaining: s.coins };
  }
  s.coins -= amount;
  return { success: true, remaining: s.coins };
}

// ---------------------------------------------------------------------------
// Exported Functions — Biomes
// ---------------------------------------------------------------------------

export function psGetBiomes(): Biome[] {
  const s = ensureInit();
  return PS_BIOMES.map(b => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    color: b.color,
    difficulty: b.difficulty,
    unlocked: s.visitedBiomes.includes(b.id),
  }));
}

export function psGetActiveBiome(): Biome | null {
  const s = ensureInit();
  const def = PS_BIOMES.find(b => b.id === s.activeBiome);
  if (!def) return null;
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    color: def.color,
    difficulty: def.difficulty,
    unlocked: true,
  };
}

export function psSetActiveBiome(biomeId: string): void {
  const s = ensureInit();
  const exists = PS_BIOMES.find(b => b.id === biomeId);
  if (!exists) return;

  s.activeBiome = biomeId as BiomeId;

  if (!s.visitedBiomes.includes(biomeId as BiomeId)) {
    s.visitedBiomes.push(biomeId as BiomeId);
    s.stats.totalBiomesVisited = s.visitedBiomes.length;
  }

  // Regenerate visible animals for new biome
  const guide = s.activeGuide ? PS_GUIDES.find(g => g.id === s.activeGuide) : null;
  s.visibleAnimals = generateVisibleAnimals(
    biomeId as BiomeId,
    s.currentWeather,
    guide || null,
    s.level,
  );
}

// ---------------------------------------------------------------------------
// Exported Functions — Animals
// ---------------------------------------------------------------------------

export function psGetAnimals(): Animal[] {
  const s = ensureInit();
  return PS_ANIMALS.map(a => ({
    id: a.id,
    name: a.name,
    species: a.species,
    biomeId: a.biomeId,
    rarity: a.rarity,
    description: a.description,
    photographyTip: a.photographyTip,
    behaviorPatterns: a.behaviorPatterns,
    bestTimeOfDay: a.bestTimeOfDay,
    bestWeather: a.bestWeather,
    xpValue: a.xpValue,
    coinValue: a.coinValue,
    baseDifficulty: a.baseDifficulty,
    photographed: s.discoveredAnimals.includes(a.id),
    photoCount: s.album.filter(p => p.animalId === a.id).length,
    bestQuality: getBestPhotoQuality(s, a.id),
  }));
}

function getBestPhotoQuality(s: PhotoSafariState, animalId: string): PhotoQuality | null {
  const photos = s.album.filter(p => p.animalId === animalId);
  if (photos.length === 0) return null;
  let best: PhotoQuality = 'Blurry';
  for (const p of photos) {
    const idx = QUALITY_ORDER.indexOf(p.quality);
    if (idx > QUALITY_ORDER.indexOf(best)) best = p.quality;
  }
  return best;
}

export function psGetAnimalsByBiome(biomeId: string): Animal[] {
  return psGetAnimals().filter(a => a.biomeId === biomeId);
}

export function psGetVisibleAnimals(): VisibleAnimal[] {
  const s = ensureInit();

  // Regenerate if empty (initial load or after biome change)
  if (s.visibleAnimals.length === 0) {
    const guide = s.activeGuide ? PS_GUIDES.find(g => g.id === s.activeGuide) : null;
    s.visibleAnimals = generateVisibleAnimals(s.activeBiome, s.currentWeather, guide || null, s.level);
  }

  return s.visibleAnimals;
}

// ---------------------------------------------------------------------------
// Exported Functions — Photography
// ---------------------------------------------------------------------------

export function psPhotographAnimal(animalId: string): PhotoResult {
  const s = ensureInit();
  const animalDef = PS_ANIMALS.find(a => a.id === animalId);
  if (!animalDef) {
    return { success: false, photo: null, xpGained: 0, coinsGained: 0, quality: null, message: 'Animal not found.' };
  }

  const visible = s.visibleAnimals.find(v => v.animalId === animalId);
  if (!visible) {
    return { success: false, photo: null, xpGained: 0, coinsGained: 0, quality: null, message: 'Animal is not currently visible.' };
  }

  // Gather equipment bonuses
  const equippedDefs = s.cameraEquipment
    .map(id => PS_EQUIPMENT.find(e => e.id === id))
    .filter((e): e is EquipmentDef => e !== undefined);

  // Get active guide
  const guideDef = s.activeGuide ? PS_GUIDES.find(g => g.id === s.activeGuide) || null : null;

  // Calculate photo score
  const scores = calculatePhotoScore(
    animalDef,
    s.currentWeather,
    equippedDefs,
    guideDef,
    visible.behavior,
  );

  // Calculate rewards
  const rarityConf = RARITY_CONFIG[animalDef.rarity];
  const qualityConf = QUALITY_CONFIG[scores.quality];
  const baseXP = animalDef.xpValue * rarityConf.xpMult;
  let xpGained = Math.round(baseXP * (1 + qualityConf.xpBonus));
  const baseCoins = animalDef.coinValue * rarityConf.coinMult;
  const coinsGained = Math.round(baseCoins * (1 + qualityConf.coinBonus));

  // Daily rare bonus
  let isDailyRare = false;
  if (s.dailyRareAnimal && s.dailyRareAnimal.animalId === animalId && s.dailyRareAnimal.isAvailable) {
    isDailyRare = true;
    const bonus = Math.round(xpGained * s.dailyRareAnimal.bonusMultiplier);
    xpGained += bonus;
  }

  // Create photo entry
  const photo: PhotoEntry = {
    id: generateId(),
    animalId: animalDef.id,
    animalName: animalDef.name,
    biomeId: animalDef.biomeId,
    quality: scores.quality,
    composition: scores.composition,
    lighting: scores.lighting,
    timing: scores.timing,
    clarity: scores.clarity,
    rarityBonus: scores.rarityBonus,
    totalScore: scores.total,
    timestamp: getTimestamp(),
    isFavorite: false,
    rating: scores.quality === 'Perfect' ? 5 : scores.quality === 'Great' ? 4 : scores.quality === 'Good' ? 3 : scores.quality === 'Decent' ? 2 : 1,
    equipmentUsed: s.cameraEquipment,
    weather: s.currentWeather,
    behavior: visible.behavior,
    notes: `Photographed ${animalDef.name} (${animalDef.species}) in ${PS_BIOMES.find(b => b.id === animalDef.biomeId)?.name || animalDef.biomeId}`,
  };

  // Add to album (evict oldest if full)
  if (s.album.length >= s.albumCapacity) {
    s.album.shift();
  }
  s.album.push(photo);
  s.recentPhotos.unshift(photo);
  if (s.recentPhotos.length > 10) s.recentPhotos.pop();

  // Update stats
  s.stats.totalPhotosTaken += 1;
  if (!s.discoveredAnimals.includes(animalDef.id)) {
    s.discoveredAnimals.push(animalDef.id);
    s.stats.totalAnimalsPhotographed = s.discoveredAnimals.length;
  }

  // Track quality stats
  switch (scores.quality) {
    case 'Perfect': s.stats.perfectPhotos += 1; break;
    case 'Great': s.stats.greatPhotos += 1; break;
  }
  switch (animalDef.rarity) {
    case 'Epic': s.stats.epicPhotos += 1; break;
    case 'Legendary': s.stats.legendaryPhotos += 1; break;
    case 'Mythic': s.stats.mythicPhotos += 1; break;
  }

  // Update average score
  const totalScoreSum = s.album.reduce((sum, p) => sum + p.totalScore, 0);
  s.stats.averagePhotoScore = Math.round(totalScoreSum / s.album.length);

  // Track rarest capture
  const rarityOrder: RarityTier[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
  if (!s.stats.rarestCapture || rarityOrder.indexOf(animalDef.rarity) > rarityOrder.indexOf(s.stats.rarestCapture as RarityTier)) {
    s.stats.rarestCapture = animalDef.rarity;
  }

  // Apply rewards
  const totalXPGained = isDailyRare ? Math.round(xpGained * (1 + (s.dailyRareAnimal?.bonusMultiplier || 0))) : xpGained;
  const totalCoinsGained = isDailyRare ? Math.round(coinsGained * 1.5) : coinsGained;
  s.coins += totalCoinsGained;
  s.stats.totalCoinsEarned += totalCoinsGained;

  // Remove photographed animal from visible
  s.visibleAnimals = s.visibleAnimals.filter(v => v.animalId !== animalId);

  // Update streak
  updateStreak(s);

  return {
    success: true,
    photo,
    xpGained: totalXPGained,
    coinsGained: totalCoinsGained,
    quality: scores.quality,
    message: scores.quality === 'Perfect'
      ? `🏆 PERFECT shot of ${animalDef.name}! Legendary photograph!`
      : scores.quality === 'Great'
        ? `🌟 Great photo of ${animalDef.name}! The ${scores.quality} quality really shows.`
        : `📸 ${scores.quality} photo of ${animalDef.name}.`,
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Album
// ---------------------------------------------------------------------------

export function psGetAlbum(): PhotoEntry[] {
  return ensureInit().album;
}

export function psGetFavorites(): PhotoEntry[] {
  const s = ensureInit();
  return s.album.filter(p => s.favorites.includes(p.id));
}

export function psToggleFavorite(photoId: string): void {
  const s = ensureInit();
  const idx = s.favorites.indexOf(photoId);
  if (idx >= 0) {
    s.favorites.splice(idx, 1);
    const photo = s.album.find(p => p.id === photoId);
    if (photo) photo.isFavorite = false;
  } else {
    s.favorites.push(photoId);
    const photo = s.album.find(p => p.id === photoId);
    if (photo) photo.isFavorite = true;
  }
}

// ---------------------------------------------------------------------------
// Exported Functions — Weather
// ---------------------------------------------------------------------------

export function psGetWeather(): Weather {
  const s = ensureInit();
  return {
    current: s.currentWeather,
    duration: s.weatherDuration,
    nextChange: getTimestamp() + s.weatherDuration,
    forecast: s.weatherForecast,
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Equipment
// ---------------------------------------------------------------------------

export function psGetCameraEquipment(): Equipment[] {
  const s = ensureInit();
  return PS_EQUIPMENT.map(e => ({
    id: e.id,
    name: e.name,
    description: e.description,
    equipped: s.cameraEquipment.includes(e.id),
    compositionBonus: e.compositionBonus,
    lightingBonus: e.lightingBonus,
    timingBonus: e.timingBonus,
    clarityBonus: e.clarityBonus,
    rarityBonus: e.rarityBonus,
    icon: e.icon,
  }));
}

export function psGetUnlockedEquipment(): string[] {
  return ensureInit().unlockedEquipment;
}

export function psPurchaseEquipment(equipmentId: string): { success: boolean; cost: number } {
  const s = ensureInit();
  const eqDef = PS_EQUIPMENT.find(e => e.id === equipmentId);
  if (!eqDef) return { success: false, cost: 0 };
  if (s.unlockedEquipment.includes(equipmentId)) return { success: false, cost: 0 };
  if (s.level < eqDef.requiredLevel) return { success: false, cost: 0 };
  if (s.coins < eqDef.cost) return { success: false, cost: eqDef.cost };

  s.coins -= eqDef.cost;
  s.unlockedEquipment.push(equipmentId);
  s.cameraEquipment.push(equipmentId);
  return { success: true, cost: eqDef.cost };
}

export function psEquipCamera(equipmentId: string): void {
  const s = ensureInit();
  if (!s.unlockedEquipment.includes(equipmentId)) return;
  if (!s.cameraEquipment.includes(equipmentId)) {
    s.cameraEquipment.push(equipmentId);
  }
}

// ---------------------------------------------------------------------------
// Exported Functions — Guides
// ---------------------------------------------------------------------------

export function psGetGuides(): Guide[] {
  const s = ensureInit();
  return PS_GUIDES.map(g => ({
    id: g.id,
    name: g.name,
    specialty: g.specialty,
    ability: g.ability,
    abilityDescription: g.abilityDescription,
    bonusBiome: g.bonusBiome,
    animalRevealBonus: g.animalRevealBonus,
    photoQualityBonus: g.photoQualityBonus,
    active: s.activeGuide === g.id,
    icon: g.icon,
  }));
}

export function psSetActiveGuide(guideId: string): void {
  const s = ensureInit();
  const guide = PS_GUIDES.find(g => g.id === guideId);
  if (!guide) return;
  if (!s.unlockedGuides.includes(guideId)) return;
  s.activeGuide = guideId;

  // Regenerate visible animals with new guide
  s.visibleAnimals = generateVisibleAnimals(s.activeBiome, s.currentWeather, guide, s.level);
}

// ---------------------------------------------------------------------------
// Exported Functions — Photo Contests
// ---------------------------------------------------------------------------

export function psGetPhotoContests(): Contest[] {
  return ensureInit().photoContests;
}

export function psSubmitToContest(contestId: string, photoId: string): ContestResult {
  const s = ensureInit();
  const contest = s.photoContests.find(c => c.id === contestId);
  if (!contest) return { score: 0, maxScore: 100, rank: 'N/A', feedback: 'Contest not found.', xpReward: 0, coinReward: 0 };
  if (!contest.isActive) return { score: 0, maxScore: 100, rank: 'N/A', feedback: 'Contest is no longer active.', xpReward: 0, coinReward: 0 };

  const photo = s.album.find(p => p.id === photoId);
  if (!photo) return { score: 0, maxScore: 100, rank: 'N/A', feedback: 'Photo not found in album.', xpReward: 0, coinReward: 0 };

  // Validate contest requirements
  if (contest.requiredBiome && photo.biomeId !== contest.requiredBiome) {
    return { score: 0, maxScore: 100, rank: 'Disqualified', feedback: `Photo must be from ${PS_BIOMES.find(b => b.id === contest.requiredBiome)?.name}.`, xpReward: 0, coinReward: 0 };
  }

  if (contest.requiredRarity) {
    const animal = PS_ANIMALS.find(a => a.id === photo.animalId);
    if (animal) {
      const rarityOrder: RarityTier[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
      if (rarityOrder.indexOf(animal.rarity) < rarityOrder.indexOf(contest.requiredRarity)) {
        return { score: 0, maxScore: 100, rank: 'Disqualified', feedback: `Animal must be ${contest.requiredRarity} rarity or above.`, xpReward: 0, coinReward: 0 };
      }
    }
  }

  const qualityOrder: PhotoQuality[] = ['Blurry', 'Decent', 'Good', 'Great', 'Perfect'];
  if (qualityOrder.indexOf(photo.quality) < qualityOrder.indexOf(contest.minQuality)) {
    return { score: photo.totalScore, maxScore: 100, rank: 'Below Threshold', feedback: `Photo quality must be at least ${contest.minQuality}.`, xpReward: 0, coinReward: 0 };
  }

  // Check if already submitted
  if (contest.submissions.some(sub => sub.photoId === photoId)) {
    return { score: photo.totalScore, maxScore: 100, rank: 'Already Submitted', feedback: 'This photo has already been submitted to this contest.', xpReward: 0, coinReward: 0 };
  }

  // Judge scoring
  const rng = seededRandom('contest_' + contestId + '_' + photoId);
  const judgeStrictness = contest.judgePersonality.includes('Strict') ? 0.8 : contest.judgePersonality.includes('Anonymous') ? 0.95 : 0.9;
  const baseScore = photo.totalScore;
  const judgeScore = Math.round(baseScore * judgeStrictness + rng() * 10);
  const finalScore = clamp(judgeScore, 0, 100);

  let rank: string;
  if (finalScore >= 95) rank = '🏆 First Place';
  else if (finalScore >= 85) rank = '🥈 Second Place';
  else if (finalScore >= 70) rank = '🥉 Third Place';
  else if (finalScore >= 55) rank = '📜 Honorable Mention';
  else rank = '📝 Participation';

  const won = finalScore >= 70;
  const xpReward = won ? contest.xpReward : Math.round(contest.xpReward * 0.2);
  const coinReward = won ? contest.coinReward : Math.round(contest.coinReward * 0.2);

  const feedbackMessages: Record<string, string[]> = {
    '🏆 First Place': [
      `Breathtaking work! ${contest.judgeName} was moved to tears by this photograph.`,
      `A masterpiece. ${contest.judgeName} declares this the finest submission of the season.`,
      `Absolutely stunning. ${contest.judgeName} says this belongs in a museum.`,
    ],
    '🥈 Second Place': [
      `Excellent technique, ${contest.judgeName} notes. Just missing that final spark of magic.`,
      `Strong composition and lighting. ${contest.judgeName} was very impressed.`,
    ],
    '🥉 Third Place': [
      `Good work! ${contest.judgeName} appreciates the effort but suggests refining the timing.`,
      `Solid photograph. ${contest.judgeName} sees potential for greatness.`,
    ],
    '📜 Honorable Mention': [
      `Decent attempt. ${contest.judgeName} suggests working on clarity and composition.`,
      `${contest.judgeName}: "Has promise, but needs more practice with lighting conditions."`,
    ],
    '📝 Participation': [
      `${contest.judgeName}: "Keep practicing. Wildlife photography requires immense patience."`,
      `Not quite there yet. ${contest.judgeName} recommends studying animal behavior patterns.`,
    ],
  };

  const feedback = feedbackMessages[rank]?.[Math.floor(rng() * 3)] || 'Thank you for your submission.';

  contest.submissions.push({
    photoId,
    score: finalScore,
    feedback,
    submittedAt: getTimestamp(),
  });

  if (won) {
    s.stats.totalContestsWon += 1;
  }

  return { score: finalScore, maxScore: 100, rank, feedback, xpReward, coinReward };
}

// ---------------------------------------------------------------------------
// Exported Functions — Migration
// ---------------------------------------------------------------------------

export function psGetMigration(): MigrationInfo {
  const s = ensureInit();
  s.currentMonth = new Date().getMonth();
  const monthData = MIGRATION_TABLE.find(m => m.month === s.currentMonth);

  return {
    currentMonth: s.currentMonth,
    season: monthData?.season || 'Unknown',
    migrations: monthData?.events || [],
    incomingAnimals: (monthData?.events || []).filter(e => {
      const biomeDef = PS_BIOMES.find(b => b.id === s.activeBiome);
      return biomeDef && e.toBiome === s.activeBiome;
    }),
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Daily Rare Animal
// ---------------------------------------------------------------------------

export function psGetDailyRareAnimal(): DailyRare | null {
  const s = ensureInit();
  const today = getDateString();

  // Generate new daily rare if needed
  if (!s.dailyRareAnimal || s.lastDailyRareDate !== today) {
    const rng = seededRandom('daily_rare_' + today);
    const rareAnimals = PS_ANIMALS.filter(a => a.rarity === 'Rare' || a.rarity === 'Epic' || a.rarity === 'Legendary' || a.rarity === 'Mythic');
    const chosen = pickRandom(rareAnimals, rng);

    s.dailyRareAnimal = {
      animalId: chosen.id,
      animalName: chosen.name,
      biomeId: chosen.biomeId,
      rarity: chosen.rarity,
      timeLimit: 1800, // 30 minutes
      bonusMultiplier: 2.5,
      isAvailable: true,
      expiresAt: getTimestamp() + 1800000,
    };
    s.lastDailyRareDate = today;
  }

  // Check expiration
  if (s.dailyRareAnimal && getTimestamp() > s.dailyRareAnimal.expiresAt) {
    s.dailyRareAnimal.isAvailable = false;
  }

  return s.dailyRareAnimal;
}

export function psPhotographDailyRare(): PhotoResult | null {
  const s = ensureInit();
  const daily = psGetDailyRareAnimal();
  if (!daily || !daily.isAvailable) return null;

  // Add daily rare to visible animals temporarily
  if (!s.visibleAnimals.find(v => v.animalId === daily.animalId)) {
    const animalDef = PS_ANIMALS.find(a => a.id === daily.animalId);
    if (animalDef) {
      s.visibleAnimals.push({
        animalId: animalDef.id,
        animalName: animalDef.name,
        biomeId: animalDef.biomeId,
        rarity: animalDef.rarity,
        behavior: pickRandom(animalDef.behaviorPatterns, Math.random),
        visibility: 80,
        timeRemaining: Math.round((daily.expiresAt - getTimestamp()) / 1000),
        distance: 20,
      });
    }
  }

  const result = psPhotographAnimal(daily.animalId);
  if (result.success) {
    // Apply bonus multiplier to the result
    result.xpGained = Math.round(result.xpGained * daily.bonusMultiplier);
    result.coinsGained = Math.round(result.coinsGained * daily.bonusMultiplier);
    result.message = `⭐ DAILY RARE! ${result.message} Bonus x${daily.bonusMultiplier} applied!`;
    daily.isAvailable = false;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Exported Functions — Streak
// ---------------------------------------------------------------------------

export function psGetStreak(): number {
  return ensureInit().streak;
}

export function psGetBestStreak(): number {
  return ensureInit().bestStreak;
}

// ---------------------------------------------------------------------------
// Exported Functions — Stats
// ---------------------------------------------------------------------------

export function psGetStats(): SafariStats {
  return ensureInit().stats;
}

// ---------------------------------------------------------------------------
// Exported Functions — Achievements
// ---------------------------------------------------------------------------

export function psGetAchievements(): Achievement[] {
  return ensureInit().achievements;
}

export function psCheckAchievements(): Achievement[] {
  const s = ensureInit();
  const newlyUnlocked: Achievement[] = [];

  for (const ach of s.achievements) {
    if (ach.unlocked) continue;
    if (evaluateCondition(s, ach.condition)) {
      ach.unlocked = true;
      ach.unlockedAt = getTimestamp();
      s.unlockedAchievements.push(ach.id);
      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
}

export function psGetUnlockedAchievements(): Achievement[] {
  const s = ensureInit();
  return s.achievements.filter(a => a.unlocked);
}

export function psIsAchievementUnlocked(id: string): boolean {
  const s = ensureInit();
  const ach = s.achievements.find(a => a.id === id);
  return ach ? ach.unlocked : false;
}

// ---------------------------------------------------------------------------
// Exported Functions — Hint System
// ---------------------------------------------------------------------------

export function psGetHint(): string {
  const s = ensureInit();
  const rng = seededRandom('hint_' + getDateString() + '_' + Math.floor(getTimestamp() / 600000));

  const generalHints = [
    `The current weather is ${s.currentWeather}. ${PS_WEATHER_TYPES.find(w => w.type === s.currentWeather)?.description || ''}`,
    `You are in ${PS_BIOMES.find(b => b.id === s.activeBiome)?.name || s.activeBiome}. Difficulty: ${PS_BIOMES.find(b => b.id === s.activeBiome)?.difficulty || '?'}/5.`,
    `You have photographed ${s.stats.totalAnimalsPhotographed}/50 species. Keep exploring!`,
    `Your streak is ${s.streak} days. ${s.streak >= 3 ? 'Keep it going!' : 'Take a photo today to maintain your streak.'}`,
    `Album: ${s.album.length}/${s.albumCapacity} slots used. ${s.album.length >= 25 ? 'Consider removing lower quality photos.' : ''}`,
    `Level ${s.level} — ${getTitleForLevel(s.level)}. Need ${xpForLevel(s.level + 1)} XP for next level.`,
  ];

  const biomeHints: Record<BiomeId, string[]> = {
    african_savanna: [
      'Golden Hour is the best time for savanna photography. Warm light makes everything magical.',
      'Look for animals near waterholes during dry spells. Predators stake them out.',
      'The Great Migration herd is easiest to photograph during river crossings.',
      'Lions sleep up to 20 hours a day. Patience is the telephoto photographer\'s best friend.',
    ],
    amazon_rainforest: [
      'Dense canopy means diffused light — great for avoiding harsh shadows.',
      'Many Amazonian creatures are nocturnal. Night Vision equipment is a game-changer.',
      'Listen for calls — toucans and monkeys announce their presence loudly.',
      'After rainstorms, animals emerge to feed. Best time for amphibian photography.',
    ],
    arctic_tundra: [
      'Northern Lights provide the most dramatic backdrop for Arctic photography.',
      'White animals blend into snow — look for movement, not shapes.',
      'Polar bears are most active at dawn when they hunt seals on ice.',
      'Extreme cold drains batteries fast. Keep equipment warm inside your jacket.',
    ],
    coral_reef_depths: [
      'Underwater Housing is mandatory for reef photography. Clear water = clear photos.',
      'Whale sharks appear during plankton blooms — usually midday.',
      'Mantis shrimp have the world\'s most complex eyes. Try macro photography.',
      'Currents can be strong. Use a reef hook to stay stationary for steady shots.',
    ],
    himalayan_peaks: [
      'Snow leopards are called "Ghosts of the Mountains" for good reason. Camera traps help.',
      'The Tibetan Fox\'s square face is best captured from a 3/4 angle.',
      'Red pandas are most active at dawn when they feed on bamboo.',
      'High altitude means thin air and less oxygen. Plan your physical approach carefully.',
    ],
    australian_outback: [
      'Golden Hour in the Outback is extraordinary — the red earth glows like embers.',
      'Platypuses are best spotted at dawn in quiet freshwater streams.',
      'The Wedge-tailed Eagle rides thermals mid-morning. Use the heat shimmer as a guide.',
      'Thorny Devils are slow — perfect for practicing macro photography techniques.',
    ],
    deep_jungle: [
      'Fog and mist create atmospheric depth. Embrace low-visibility conditions.',
      'Okapis are incredibly shy. A guide who knows salt lick locations is essential.',
      'The Gorilla Silverback demands respect. Never make direct eye contact.',
      'Poison dart frogs are tiny but vivid. Get low and use a macro lens.',
    ],
    mangrove_swamp: [
      'Crocodiles are ambush predators. Watch for "eyes above water" — the classic shot.',
      'Proboscis monkeys congregate at dawn in trees overhanging water.',
      'Low tide is best for crab photography. Get down to mud-flat level.',
      'Manatees move slowly — easy to track in clear water at high tide.',
    ],
  };

  const equipmentHints = [
    ...s.unlockedEquipment.length < 2
      ? ['Upgrade your equipment! The Telephoto Lens dramatically improves distant animal shots.']
      : [],
    ...!s.unlockedEquipment.includes('night_vision')
      ? ['Night Vision unlocks nocturnal photography — essential for leopards and owls.']
      : [],
    ...!s.unlockedEquipment.includes('drone_camera')
      ? ['The Drone Camera provides aerial perspectives impossible from the ground.']
      : [],
  ];

  const guideHints = [
    ...s.activeGuide === null
      ? ['Hiring a guide reveals hidden animals and improves photo quality in their specialty biome.']
      : [`Your guide ${s.activeGuide ? PS_GUIDES.find(g => g.id === s.activeGuide)?.name : ''} is active. Their bonus applies to ${s.activeGuide ? PS_GUIDES.find(g => g.id === s.activeGuide)?.specialty : ''}.`],
  ];

  const allHints = [
    ...generalHints,
    ...(biomeHints[s.activeBiome] || []),
    ...equipmentHints,
    ...guideHints,
  ];

  return pickRandom(allHints, rng);
}

// ---------------------------------------------------------------------------
// Additional Helper Functions (not in main export list but useful)
// ---------------------------------------------------------------------------

export function psGetBiomeById(id: BiomeId): BiomeDef | null {
  return PS_BIOMES.find(b => b.id === id) || null;
}

export function psGetAnimalById(id: string): AnimalDef | null {
  return PS_ANIMALS.find(a => a.id === id) || null;
}

export function psGetEquipmentById(id: string): EquipmentDef | null {
  return PS_EQUIPMENT.find(e => e.id === id) || null;
}

export function psGetGuideById(id: string): GuideDef | null {
  return PS_GUIDES.find(g => g.id === id) || null;
}

export function psUnlockGuide(guideId: string): boolean {
  const s = ensureInit();
  const guide = PS_GUIDES.find(g => g.id === guideId);
  if (!guide || s.unlockedGuides.includes(guideId)) return false;
  if (s.coins < guide.cost) return false;
  s.coins -= guide.cost;
  s.unlockedGuides.push(guideId);
  return true;
}

export function psRefreshVisibleAnimals(): VisibleAnimal[] {
  const s = ensureInit();
  const guide = s.activeGuide ? PS_GUIDES.find(g => g.id === s.activeGuide) : null;
  s.visibleAnimals = generateVisibleAnimals(s.activeBiome, s.currentWeather, guide || null, s.level);
  return s.visibleAnimals;
}

export function psGetPhotoById(photoId: string): PhotoEntry | null {
  return ensureInit().album.find(p => p.id === photoId) || null;
}

export function psRemovePhotoFromAlbum(photoId: string): boolean {
  const s = ensureInit();
  const idx = s.album.findIndex(p => p.id === photoId);
  if (idx < 0) return false;
  s.album.splice(idx, 1);
  const favIdx = s.favorites.indexOf(photoId);
  if (favIdx >= 0) s.favorites.splice(favIdx, 1);
  return true;
}

export function psRatePhoto(photoId: string, rating: number): boolean {
  const s = ensureInit();
  const photo = s.album.find(p => p.id === photoId);
  if (!photo) return false;
  photo.rating = clamp(Math.round(rating), 1, 5);
  return true;
}

export function psGetRecentPhotos(): PhotoEntry[] {
  return ensureInit().recentPhotos;
}

export function psGetRunHistory(): { date: string; photos: number; xp: number; coins: number }[] {
  return ensureInit().runHistory;
}

export function psGetAlbumUsage(): { used: number; capacity: number; percentage: number } {
  const s = ensureInit();
  return {
    used: s.album.length,
    capacity: s.albumCapacity,
    percentage: Math.round((s.album.length / s.albumCapacity) * 100),
  };
}

export function psGetDiscoveredCount(): { discovered: number; total: number } {
  const s = ensureInit();
  return {
    discovered: s.discoveredAnimals.length,
    total: PS_ANIMALS.length,
  };
}

export function psGetBiomeDiscoveryMap(): Record<string, { total: number; discovered: number }> {
  const s = ensureInit();
  const map: Record<string, { total: number; discovered: number }> = {};
  for (const biome of PS_BIOMES) {
    const biomeAnimals = PS_ANIMALS.filter(a => a.biomeId === biome.id || a.primaryBiome === biome.id);
    const discovered = biomeAnimals.filter(a => s.discoveredAnimals.includes(a.id)).length;
    map[biome.id] = { total: biomeAnimals.length, discovered };
  }
  return map;
}

export function psSimulateWeatherChange(): WeatherType {
  const s = ensureInit();
  const rng = seededRandom('weather_' + getTimestamp().toString());
  const allWeather: WeatherType[] = ['Clear', 'Cloudy', 'Rainy', 'Foggy', 'Golden Hour', 'Northern Lights'];

  // Weight based on time of day
  const hour = new Date().getHours();
  let weights = [3, 2, 1, 1, 2, 1];
  if (hour >= 6 && hour <= 8) weights = [2, 1, 1, 1, 4, 0]; // Dawn = Golden Hour
  if (hour >= 17 && hour <= 19) weights = [1, 1, 1, 1, 5, 0]; // Dusk = Golden Hour
  if (hour >= 21 || hour <= 3) weights = [1, 0, 1, 1, 0, 4]; // Night = Northern Lights

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * totalWeight;
  let newWeather: WeatherType = 'Clear';
  for (let i = 0; i < allWeather.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      newWeather = allWeather[i];
      break;
    }
  }

  s.currentWeather = newWeather;
  s.weatherDuration = 1200 + Math.floor(rng() * 3600);

  // Update forecast
  s.weatherForecast = [];
  for (let i = 0; i < 3; i++) {
    s.weatherForecast.push(pickRandom(allWeather, rng));
  }

  // Regenerate visible animals
  const guide = s.activeGuide ? PS_GUIDES.find(g => g.id === s.activeGuide) : null;
  s.visibleAnimals = generateVisibleAnimals(s.activeBiome, s.currentWeather, guide || null, s.level);

  return newWeather;
}

export function psGetRarityColor(rarity: RarityTier): string {
  return RARITY_CONFIG[rarity]?.color || '#9ca3af';
}

export function psGetQualityColor(quality: PhotoQuality): string {
  return QUALITY_CONFIG[quality]?.color || '#6b7280';
}

export function psGetAnimalRaritySummary(): Record<RarityTier, { total: number; discovered: number }> {
  const s = ensureInit();
  const summary: Record<RarityTier, { total: number; discovered: number }> = {
    Common: { total: 0, discovered: 0 },
    Rare: { total: 0, discovered: 0 },
    Epic: { total: 0, discovered: 0 },
    Legendary: { total: 0, discovered: 0 },
    Mythic: { total: 0, discovered: 0 },
  };

  for (const animal of PS_ANIMALS) {
    summary[animal.rarity].total += 1;
    if (s.discoveredAnimals.includes(animal.id)) {
      summary[animal.rarity].discovered += 1;
    }
  }

  return summary;
}

export function psGetTopPhotos(count: number): PhotoEntry[] {
  const s = ensureInit();
  return [...s.album]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, Math.max(1, count));
}

export function psGetPhotoStatsForAnimal(animalId: string): {
  totalPhotos: number;
  bestScore: number;
  bestQuality: PhotoQuality | null;
  avgScore: number;
} {
  const s = ensureInit();
  const photos = s.album.filter(p => p.animalId === animalId);
  if (photos.length === 0) {
    return { totalPhotos: 0, bestScore: 0, bestQuality: null, avgScore: 0 };
  }
  const bestScore = Math.max(...photos.map(p => p.totalScore));
  let bestQuality: PhotoQuality = 'Blurry';
  for (const p of photos) {
    if (QUALITY_ORDER.indexOf(p.quality) > QUALITY_ORDER.indexOf(bestQuality)) {
      bestQuality = p.quality;
    }
  }
  const avgScore = Math.round(photos.reduce((sum, p) => sum + p.totalScore, 0) / photos.length);
  return { totalPhotos: photos.length, bestScore, bestQuality, avgScore };
}

export function psEndSession(): {
  photosTaken: number;
  xpEarned: number;
  coinsEarned: number;
  newSpecies: string[];
} {
  const s = ensureInit();

  // Snapshot current session stats
  const today = getDateString();
  const existingRun = s.runHistory.find(r => r.date === today);
  const photosTaken = s.stats.totalPhotosTaken - (existingRun?.photos || 0);

  const sessionData = {
    photosTaken,
    xpEarned: 0,
    coinsEarned: 0,
    newSpecies: [] as string[],
  };

  if (!existingRun) {
    s.runHistory.push({
      date: today,
      photos: s.stats.totalPhotosTaken,
      xp: s.stats.totalXPEarned,
      coins: s.stats.totalCoinsEarned,
    });
  }

  return sessionData;
}
