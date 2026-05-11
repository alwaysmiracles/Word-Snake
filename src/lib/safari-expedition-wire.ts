// ============================================================================
// Safari Expedition Wire — SSR-safe module for the Word Snake game
// All exports use the `sx` prefix. No React hooks. No browser APIs at top level.
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export type AnimalBehavior =
  | 'Grazing'
  | 'Hunting'
  | 'Sleeping'
  | 'Playing'
  | 'Mating Dance'
  | 'Migration'
  | 'Nesting'
  | 'Bathing'
  | 'Stalking'
  | 'Roaring';

export type ActivityPattern = 'Diurnal' | 'Nocturnal' | 'Crepuscular';

export type WeatherType =
  | 'Clear Skies'
  | 'Light Rain'
  | 'Heavy Storm'
  | 'Fog'
  | 'Heat Wave'
  | 'Dust Storm'
  | 'Snow'
  | 'Windy';

export type VehicleType =
  | 'Jeep'
  | 'Helicopter'
  | 'Boat'
  | 'Hot Air Balloon'
  | 'Canoe'
  | 'ATV'
  | 'Elephant'
  | 'Camouflage Tent';

export type GuideSpecialty = 'Birds' | 'Predators' | 'Marine' | 'Nocturnal' | 'Tracking';

export type CameraType = 'Basic' | 'Advanced' | 'Telephoto' | 'Underwater' | 'Professional';

export interface SxAnimal {
  id: string;
  name: string;
  emoji: string;
  rarity: RarityTier;
  behavior: ActivityPattern;
  behaviors: AnimalBehavior[];
  dangerLevel: number; // 1-10
  speed: number; // 1-10
  habitat: string; // biome id
  description: string;
  funFact: string;
  weight: number; // kg
  lifespan: string;
  conservationStatus: string;
}

export interface SxBiome {
  id: string;
  name: string;
  emoji: string;
  description: string;
  terrain: string;
  weatherPatterns: WeatherType[];
  unlockLevel: number;
  unlockCost: number;
  unlocked: boolean;
  animalIds: string[];
  color: string;
}

export interface SxCamera {
  id: string;
  type: CameraType;
  name: string;
  level: number;
  maxLevel: number;
  zoomRange: number; // meters
  qualityBonus: number; // 0-1 multiplier
  upgradeCost: number;
  description: string;
}

export interface SxVehicle {
  id: string;
  type: VehicleType;
  name: string;
  emoji: string;
  speed: number; // 1-10
  stealth: number; // 1-10
  capacity: number;
  terrainAccess: string[]; // biome ids
  cost: number;
  unlocked: boolean;
  description: string;
}

export interface SxGuide {
  id: string;
  name: string;
  emoji: string;
  specialty: GuideSpecialty;
  bonus: number; // 0-1
  hireCost: number;
  hired: boolean;
  description: string;
  quote: string;
}

export interface SxWeather {
  type: WeatherType;
  emoji: string;
  visibilityModifier: number; // 0-2 (multiplier on animal visibility)
  behaviorModifier: Record<AnimalBehavior, number>; // probability modifiers
  description: string;
}

export interface SxPhoto {
  id: string;
  animalId: string;
  animalName: string;
  animalEmoji: string;
  biome: string;
  stars: number; // 1-5
  camera: string;
  distance: number; // meters
  behavior: AnimalBehavior;
  timestamp: number;
  shareCode: string;
  rarity: RarityTier;
}

export interface SxTrack {
  id: string;
  animalId: string;
  animalName: string;
  emoji: string;
  direction: string;
  freshness: number; // 0-100
  distance: number; // meters
  biome: string;
  following: boolean;
}

export interface SxExpedition {
  biomeId: string;
  startTime: number;
  duration: number; // seconds
  animalsSpotted: string[];
  photosTaken: number;
  coinsEarned: number;
  xpEarned: number;
  distanceCovered: number; // meters
  active: boolean;
  score: number;
}

export interface SxDailyChallenge {
  date: string;
  biomeId: string;
  targetAnimal: string;
  targetBehavior: AnimalBehavior | null;
  targetPhotos: number;
  bonusMultiplier: number;
  completed: boolean;
  photosTaken: number;
  animalsSpotted: number;
}

export interface SxAchievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedDate: number | null;
  icon: string;
  reward: { coins: number; xp: number };
}

export interface SxSpeciesCard {
  animalId: string;
  discovered: boolean;
  firstSeenDate: number | null;
  timesSpotted: number;
  bestPhotoStars: number;
  totalPhotos: number;
  behaviorsObserved: AnimalBehavior[];
  notes: string[];
}

export interface SxEquipment {
  binocularsLevel: number;
  binocularsMaxLevel: number;
  trackerLevel: number;
  trackerMaxLevel: number;
  baitTypes: string[];
  baitCount: Record<string, number>;
  scentMask: boolean;
}

export interface SxJournalEntry {
  id: string;
  timestamp: number;
  biomeId: string;
  text: string;
  animalSightings: string[];
  photosCount: number;
}

export interface SafariExpeditionState {
  initialized: boolean;
  version: number;
  /** Player expedition level, ranges 1-40 */
  level: number;
  /** Accumulated experience points */
  xp: number;
  /** XP required to reach next level */
  xpToNext: number;
  /** Total XP earned across all expeditions */
  totalXP: number;
  /** Currency used for purchasing equipment and unlocks */
  coins: number;
  /** Number of unique animal species spotted across all expeditions */
  totalSpotted: number;
  /** Number of rare-or-better animals spotted */
  rareSpotted: number;
  /** Current consecutive daily expedition streak */
  streak: number;
  /** Personal best consecutive daily expedition streak */
  bestStreak: number;
  /** Currently equipped biome for the active expedition */
  currentBiomeId: string;
  /** Collected wildlife photographs, max 80 */
  photos: SxPhoto[];
  /** Achievement tracking array, max 15 */
  achievements: SxAchievement[];
  /** Current daily challenge data */
  dailyChallenge: SxDailyChallenge;
  /** Active expedition details, null when idle */
  currentExpedition: SxExpedition | null;
  /** Explorer journal entries */
  journal: SxJournalEntry[];
  /** Equipment and gear status */
  equipment: SxEquipment;
  /** Currently equipped camera id */
  currentCameraId: string;
  /** Currently selected vehicle id */
  currentVehicleId: string;
  /** Currently hired guide id */
  currentGuideId: string;
  /** Current weather conditions */
  currentWeather: WeatherType;
  /** Weather tick counter */
  weatherTicks: number;
  /** Time of day index 0-5 (dawn, morning, noon, afternoon, dusk, night) */
  timeOfDay: number;
  /** Current animal footprints/tracks being followed */
  tracks: SxTrack[];
  /** Animal encyclopedia species cards */
  speciesCards: Record<string, SxSpeciesCard>;
  /** Biome unlock status map */
  biomeStates: Record<string, { unlocked: boolean; visited: boolean; timesVisited: number }>;
  /** Number of completed expeditions */
  completedExpeditions: number;
  /** Run history for completed expeditions */
  runHistory: SxExpedition[];
  /** Last daily challenge date string */
  lastDailyDate: string;
  /** Total distance traveled across all expeditions in meters */
  totalDistance: number;
  /** Total photos taken across all expeditions */
  totalPhotos: number;
  /** Unique animal IDs spotted */
  spottedAnimalIds: string[];
  /** Vehicles owned by the player */
  ownedVehicles: string[];
  /** Guides that have been hired */
  hiredGuides: string[];
}

// ---------------------------------------------------------------------------
// Internal Data — 35 Animal Species across 8 Biomes
// ---------------------------------------------------------------------------

const SX_ANIMALS: SxAnimal[] = [
  // ---- Savanna Grasslands (6) ----
  {
    id: 'sav_lion', name: 'African Lion', emoji: '🦁', rarity: 'Epic', behavior: 'Crepuscular',
    behaviors: ['Hunting', 'Sleeping', 'Roaring', 'Playing'], dangerLevel: 9, speed: 7,
    habitat: 'savanna', description: 'The king of the savanna, lions live in prides and are the most social of all big cats.',
    funFact: 'A lion\'s roar can be heard from 8 kilometers away.', weight: 190, lifespan: '10-14 years',
    conservationStatus: 'Vulnerable',
  },
  {
    id: 'sav_elephant', name: 'African Elephant', emoji: '🐘', rarity: 'Rare', behavior: 'Diurnal',
    behaviors: ['Grazing', 'Bathing', 'Migration', 'Playing'], dangerLevel: 7, speed: 4,
    habitat: 'savanna', description: 'The largest land animal, African elephants are highly intelligent and form deep family bonds.',
    funFact: 'Elephants can recognize themselves in mirrors and mourn their dead.', weight: 6000, lifespan: '60-70 years',
    conservationStatus: 'Endangered',
  },
  {
    id: 'sav_zebra', name: 'Plains Zebra', emoji: '🦓', rarity: 'Common', behavior: 'Diurnal',
    behaviors: ['Grazing', 'Migration', 'Playing', 'Bathing'], dangerLevel: 3, speed: 8,
    habitat: 'savanna', description: 'Each zebra has a unique stripe pattern, like a fingerprint. They migrate in massive herds.',
    funFact: 'No two zebras have the same stripe pattern.', weight: 350, lifespan: '20-25 years',
    conservationStatus: 'Near Threatened',
  },
  {
    id: 'sav_giraffe', name: 'Masai Giraffe', emoji: '🦒', rarity: 'Uncommon', behavior: 'Diurnal',
    behaviors: ['Grazing', 'Sleeping', 'Migration'], dangerLevel: 4, speed: 6,
    habitat: 'savanna', description: 'The tallest living animal, giraffes use their long necks to reach leaves that other herbivores cannot.',
    funFact: 'A giraffe\'s tongue can be up to 45 cm long and is dark purple.', weight: 1200, lifespan: '25 years',
    conservationStatus: 'Endangered',
  },
  {
    id: 'sav_wildebeest', name: 'Blue Wildebeest', emoji: '🐃', rarity: 'Common', behavior: 'Diurnal',
    behaviors: ['Grazing', 'Migration'], dangerLevel: 2, speed: 7,
    habitat: 'savanna', description: 'Also known as the gnu, wildebeest participate in the Great Migration alongside zebras.',
    funFact: 'Over 1.5 million wildebeest participate in the annual Great Migration.', weight: 250, lifespan: '20 years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'sav_cheetah', name: 'Cheetah', emoji: '🐆', rarity: 'Rare', behavior: 'Diurnal',
    behaviors: ['Hunting', 'Sleeping', 'Playing'], dangerLevel: 6, speed: 10,
    habitat: 'savanna', description: 'The fastest land animal, capable of reaching speeds up to 112 km/h in short bursts.',
    funFact: 'Cheetahs cannot roar — they purr and chirp like house cats.', weight: 54, lifespan: '10-12 years',
    conservationStatus: 'Vulnerable',
  },
  // ---- Dense Jungle (5) ----
  {
    id: 'jgl_tiger', name: 'Bengal Tiger', emoji: '🐯', rarity: 'Legendary', behavior: 'Nocturnal',
    behaviors: ['Hunting', 'Stalking', 'Sleeping', 'Roaring'], dangerLevel: 10, speed: 8,
    habitat: 'jungle', description: 'The largest wild cat species, Bengal tigers are solitary apex predators of Asian jungles.',
    funFact: 'No two tigers have the same stripe pattern — they are unique like fingerprints.', weight: 260, lifespan: '10-15 years',
    conservationStatus: 'Endangered',
  },
  {
    id: 'jgl_orangutan', name: 'Bornean Orangutan', emoji: '🦧', rarity: 'Rare', behavior: 'Diurnal',
    behaviors: ['Nesting', 'Playing', 'Sleeping'], dangerLevel: 5, speed: 2,
    habitat: 'jungle', description: 'Highly intelligent great apes that build elaborate sleeping nests in the canopy each night.',
    funFact: 'Orangutans share approximately 97% of their DNA with humans.', weight: 75, lifespan: '35-45 years',
    conservationStatus: 'Critically Endangered',
  },
  {
    id: 'jgl_parrot', name: 'Scarlet Macaw', emoji: '🦜', rarity: 'Uncommon', behavior: 'Diurnal',
    behaviors: ['Playing', 'Grazing', 'Mating Dance'], dangerLevel: 1, speed: 6,
    habitat: 'jungle', description: 'One of the most colorful birds in the world, macaws mate for life and can live over 75 years.',
    funFact: 'Scarlet macaws can crack a Brazil nut with their beak — a nut that requires 300 pounds of pressure.', weight: 1, lifespan: '40-50 years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'jgl_python', name: 'Reticulated Python', emoji: '🐍', rarity: 'Uncommon', behavior: 'Nocturnal',
    behaviors: ['Hunting', 'Sleeping', 'Stalking'], dangerLevel: 8, speed: 3,
    habitat: 'jungle', description: 'The world\'s longest snake, reticulated pythons are powerful constrictors found in Southeast Asian jungles.',
    funFact: 'Reticulated pythons can grow over 7 meters long.', weight: 75, lifespan: '15-20 years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'jgl_poison_frog', name: 'Poison Dart Frog', emoji: '🐸', rarity: 'Rare', behavior: 'Diurnal',
    behaviors: ['Hunting', 'Mating Dance', 'Playing'], dangerLevel: 6, speed: 2,
    habitat: 'jungle', description: 'Tiny but deadly, these brilliantly colored frogs secrete toxins through their skin as a defense.',
    funFact: 'One golden poison frog has enough toxin to kill 10 adult humans.', weight: 0.03, lifespan: '3-15 years',
    conservationStatus: 'Vulnerable',
  },
  // ---- Desert Dunes (4) ----
  {
    id: 'dst_fennec', name: 'Fennec Fox', emoji: '🦊', rarity: 'Uncommon', behavior: 'Nocturnal',
    behaviors: ['Hunting', 'Playing', 'Sleeping'], dangerLevel: 1, speed: 7,
    habitat: 'desert', description: 'The smallest fox in the world, with enormous ears that help dissipate heat and detect underground prey.',
    funFact: 'Fennec foxes can go long periods without water, getting moisture from their food.', weight: 1.5, lifespan: '10-14 years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'dst_camel', name: 'Dromedary Camel', emoji: '🐫', rarity: 'Common', behavior: 'Diurnal',
    behaviors: ['Grazing', 'Migration', 'Sleeping'], dangerLevel: 3, speed: 5,
    habitat: 'desert', description: 'The ship of the desert, camels can carry heavy loads and travel vast distances with minimal water.',
    funFact: 'Camel humps store fat, not water — they can drink 100 liters of water in 10 minutes.', weight: 600, lifespan: '40-50 years',
    conservationStatus: 'Domesticated',
  },
  {
    id: 'dst_scorpion', name: 'Deathstalker Scorpion', emoji: '🦂', rarity: 'Rare', behavior: 'Nocturnal',
    behaviors: ['Hunting', 'Stalking'], dangerLevel: 8, speed: 3,
    habitat: 'desert', description: 'One of the most dangerous scorpions in the world, the deathstalker has potent venom.',
    funFact: 'Deathstalker venom is being researched for potential cancer-fighting properties.', weight: 0.03, lifespan: '3-5 years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'dst_sidewinder', name: 'Sidewinder Rattlesnake', emoji: '🐍', rarity: 'Uncommon', behavior: 'Nocturnal',
    behaviors: ['Hunting', 'Stalking'], dangerLevel: 7, speed: 5,
    habitat: 'desert', description: 'This rattlesnake moves in a unique sideways motion to navigate hot sand without overheating.',
    funFact: 'Sidewinding leaves distinctive J-shaped tracks in the sand.', weight: 1.2, lifespan: '10-20 years',
    conservationStatus: 'Least Concern',
  },
  // ---- Arctic Tundra (4) ----
  {
    id: 'arc_polar', name: 'Polar Bear', emoji: '🐻‍❄️', rarity: 'Legendary', behavior: 'Crepuscular',
    behaviors: ['Hunting', 'Stalking', 'Swimming', 'Sleeping'], dangerLevel: 10, speed: 6,
    habitat: 'arctic', description: 'The largest land carnivore, polar bears are superb swimmers and depend on sea ice for hunting seals.',
    funFact: 'Polar bear fur is actually transparent — their skin underneath is black to absorb heat.', weight: 450, lifespan: '25-30 years',
    conservationStatus: 'Vulnerable',
  },
  {
    id: 'arc_wolf', name: 'Arctic Wolf', emoji: '🐺', rarity: 'Epic', behavior: 'Crepuscular',
    behaviors: ['Hunting', 'Playing', 'Roaring', 'Migration'], dangerLevel: 8, speed: 8,
    habitat: 'arctic', description: 'A subspecies of the grey wolf adapted to the harsh Arctic environment with white fur year-round.',
    funFact: 'Arctic wolves can withstand temperatures as low as -53°C.', weight: 45, lifespan: '7-10 years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'arc_fox', name: 'Arctic Fox', emoji: '🦊', rarity: 'Uncommon', behavior: 'Crepuscular',
    behaviors: ['Hunting', 'Stalking', 'Playing'], dangerLevel: 2, speed: 7,
    habitat: 'arctic', description: 'This fox changes its fur color seasonally — white in winter, brown/grey in summer for camouflage.',
    funFact: 'Arctic foxes can survive temperatures as low as -70°C.', weight: 3.5, lifespan: '3-6 years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'arc_owl', name: 'Snowy Owl', emoji: '🦉', rarity: 'Rare', behavior: 'Crepuscular',
    behaviors: ['Hunting', 'Nesting'], dangerLevel: 3, speed: 5,
    habitat: 'arctic', description: 'A large white owl of the Arctic tundra, snowy owls are among the few owls active during the day.',
    funFact: 'Snowy owls can turn their heads 270 degrees in either direction.', weight: 2, lifespan: '10 years',
    conservationStatus: 'Vulnerable',
  },
  // ---- Mangrove Swamp (4) ----
  {
    id: 'mng_crocodile', name: 'Saltwater Crocodile', emoji: '🐊', rarity: 'Epic', behavior: 'Nocturnal',
    behaviors: ['Hunting', 'Stalking', 'Bathing', 'Sleeping'], dangerLevel: 10, speed: 5,
    habitat: 'mangrove', description: 'The largest living reptile, saltwater crocodiles are ambush predators found in mangrove swamps.',
    funFact: 'Saltwater crocodiles have the strongest bite force ever measured — 16,460 newtons.', weight: 1000, lifespan: '70+ years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'mng_heron', name: 'Goliath Heron', emoji: '🪶', rarity: 'Uncommon', behavior: 'Crepuscular',
    behaviors: ['Hunting', 'Nesting', 'Bathing'], dangerLevel: 2, speed: 3,
    habitat: 'mangrove', description: 'The largest heron in the world, standing up to 1.5 meters tall with a massive wingspan.',
    funFact: 'Goliath herons spear fish with their sharp bills and swallow them whole.', weight: 4.5, lifespan: '15-20 years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'mng_monkey', name: 'Proboscis Monkey', emoji: '🐒', rarity: 'Rare', behavior: 'Diurnal',
    behaviors: ['Playing', 'Sleeping', 'Grazing', 'Migration'], dangerLevel: 3, speed: 5,
    habitat: 'mangrove', description: 'Known for their large noses, proboscis monkeys are excellent swimmers and live in mangrove forests.',
    funFact: 'Males use their large noses to amplify their calls and attract mates.', weight: 20, lifespan: '20-25 years',
    conservationStatus: 'Endangered',
  },
  {
    id: 'mng_mangrove_snake', name: 'Mangrove Snake', emoji: '🐍', rarity: 'Uncommon', behavior: 'Nocturnal',
    behaviors: ['Hunting', 'Stalking', 'Sleeping'], dangerLevel: 6, speed: 4,
    habitat: 'mangrove', description: 'A strikingly beautiful black-and-yellow snake that is mildly venomous and hunts in mangroves.',
    funFact: 'Mangrove snakes are completely arboreal, rarely descending to the ground.', weight: 1.5, lifespan: '12-15 years',
    conservationStatus: 'Least Concern',
  },
  // ---- Bamboo Forest (4) ----
  {
    id: 'bmb_panda', name: 'Giant Panda', emoji: '🐼', rarity: 'Legendary', behavior: 'Crepuscular',
    behaviors: ['Grazing', 'Sleeping', 'Playing'], dangerLevel: 3, speed: 2,
    habitat: 'bamboo', description: 'The beloved giant panda subsists almost entirely on bamboo, eating up to 38 kg per day.',
    funFact: 'Despite being classified as bears, pandas spent millions of years evolving to eat bamboo.', weight: 100, lifespan: '20-30 years',
    conservationStatus: 'Vulnerable',
  },
  {
    id: 'bmb_red_panda', name: 'Red Panda', emoji: '🔴', rarity: 'Rare', behavior: 'Crepuscular',
    behaviors: ['Sleeping', 'Playing', 'Grazing'], dangerLevel: 2, speed: 3,
    habitat: 'bamboo', description: 'A small arboreal mammal with reddish-brown fur and a long bushy tail, native to bamboo forests.',
    funFact: 'Red pandas were discovered 48 years before giant pandas and are the original "pandas".', weight: 5, lifespan: '8-12 years',
    conservationStatus: 'Endangered',
  },
  {
    id: 'bmb_takin', name: 'Golden Takin', emoji: '🐂', rarity: 'Epic', behavior: 'Diurnal',
    behaviors: ['Grazing', 'Migration', 'Playing'], dangerLevel: 5, speed: 4,
    habitat: 'bamboo', description: 'A large goat-antelope with golden fur, found in the bamboo forests of the eastern Himalayas.',
    funFact: 'The takin\'s large sinus cavities warm cold air before it reaches their lungs.', weight: 300, lifespan: '15-20 years',
    conservationStatus: 'Vulnerable',
  },
  {
    id: 'bmb_pheasant', name: 'Golden Pheasant', emoji: '🐓', rarity: 'Uncommon', behavior: 'Diurnal',
    behaviors: ['Mating Dance', 'Grazing', 'Playing'], dangerLevel: 1, speed: 4,
    habitat: 'bamboo', description: 'One of the most beautiful birds in the world, the male golden pheasant displays vivid red and gold plumage.',
    funFact: 'Golden pheasants can fly but prefer to run on the ground.', weight: 0.6, lifespan: '5-6 years',
    conservationStatus: 'Least Concern',
  },
  // ---- Volcanic Highlands (4) ----
  {
    id: 'vlc_gorilla', name: 'Mountain Gorilla', emoji: '🦍', rarity: 'Legendary', behavior: 'Diurnal',
    behaviors: ['Grazing', 'Playing', 'Nesting', 'Roaring'], dangerLevel: 8, speed: 4,
    habitat: 'volcanic', description: 'One of our closest relatives, mountain gorillas live in family groups led by a dominant silverback.',
    funFact: 'Mountain gorillas share 98.3% of their DNA with humans.', weight: 160, lifespan: '35 years',
    conservationStatus: 'Endangered',
  },
  {
    id: 'vlc_eagle', name: 'Philippine Eagle', emoji: '🦅', rarity: 'Epic', behavior: 'Diurnal',
    behaviors: ['Hunting', 'Nesting', 'Roaring'], dangerLevel: 5, speed: 9,
    habitat: 'volcanic', description: 'One of the largest and most powerful eagles in the world, endemic to Philippine volcanic highlands.',
    funFact: 'The Philippine eagle is the national bird of the Philippines and is called "Haribon" (King of Birds).', weight: 7, lifespan: '30-60 years',
    conservationStatus: 'Critically Endangered',
  },
  {
    id: 'vlc_iguana', name: 'Marine Iguana', emoji: '🦎', rarity: 'Uncommon', behavior: 'Diurnal',
    behaviors: ['Bathing', 'Grazing', 'Sleeping'], dangerLevel: 2, speed: 2,
    habitat: 'volcanic', description: 'The only lizard in the world that forages in the sea, found on volcanic Galápagos Islands.',
    funFact: 'Marine iguanas can shrink up to 20% of their body size during food shortages.', weight: 12, lifespan: '20 years',
    conservationStatus: 'Vulnerable',
  },
  {
    id: 'vlc_bat', name: 'Volcano Bat', emoji: '🦇', rarity: 'Rare', behavior: 'Nocturnal',
    behaviors: ['Hunting', 'Migration', 'Roosting'], dangerLevel: 3, speed: 8,
    habitat: 'volcanic', description: 'These remarkable bats roost in volcanic cave systems and navigate through sulfur plumes.',
    funFact: 'Some volcano-dwelling bats can tolerate toxic gases that would be lethal to humans.', weight: 0.02, lifespan: '10 years',
    conservationStatus: 'Data Deficient',
  },
  // ---- Coral Reef Coast (4) ----
  {
    id: 'crl_turtle', name: 'Green Sea Turtle', emoji: '🐢', rarity: 'Rare', behavior: 'Diurnal',
    behaviors: ['Grazing', 'Bathing', 'Nesting', 'Migration'], dangerLevel: 1, speed: 3,
    habitat: 'coral', description: 'One of the largest sea turtles, green sea turtles graze on seagrass and are vital to reef health.',
    funFact: 'Green sea turtles can hold their breath for up to 5 hours while sleeping.', weight: 200, lifespan: '70+ years',
    conservationStatus: 'Endangered',
  },
  {
    id: 'crl_dolphin', name: 'Bottlenose Dolphin', emoji: '🐬', rarity: 'Uncommon', behavior: 'Diurnal',
    behaviors: ['Playing', 'Hunting', 'Migration'], dangerLevel: 3, speed: 9,
    habitat: 'coral', description: 'Highly intelligent marine mammals known for their playful behavior and complex social structures.',
    funFact: 'Dolphins sleep with one eye open — half their brain stays awake to watch for predators.', weight: 300, lifespan: '40-50 years',
    conservationStatus: 'Least Concern',
  },
  {
    id: 'crl_shark', name: 'Whale Shark', emoji: '🦈', rarity: 'Epic', behavior: 'Diurnal',
    behaviors: 'Bathing' as unknown as AnimalBehavior[], dangerLevel: 3, speed: 5,
    habitat: 'coral', description: 'The largest fish in the sea, whale sharks are gentle filter feeders that pose no threat to humans.',
    funFact: 'Whale sharks can grow up to 18 meters long and have over 300 rows of tiny teeth.', weight: 21000, lifespan: '70-100 years',
    conservationStatus: 'Endangered',
  },
  {
    id: 'crl_octopus', name: 'Blue-Ringed Octopus', emoji: '🐙', rarity: 'Rare', behavior: 'Nocturnal',
    behaviors: ['Hunting', 'Stalking', 'Playing'], dangerLevel: 9, speed: 3,
    habitat: 'coral', description: 'Tiny but deadly, this octopus displays vivid blue rings when threatened and has lethal venom.',
    funFact: 'Blue-ringed octopus venom contains tetrodotoxin — there is no known antidote.', weight: 0.03, lifespan: '2-3 years',
    conservationStatus: 'Least Concern',
  },
];

// Fix the shark behaviors
SX_ANIMALS[29].behaviors = ['Bathing', 'Migration', 'Playing'];

// ---------------------------------------------------------------------------
// Internal Data — 8 Biomes
// ---------------------------------------------------------------------------

const SX_BIOMES: SxBiome[] = [
  {
    id: 'savanna', name: 'Savanna Grasslands', emoji: '🌾',
    description: 'Vast golden plains dotted with acacia trees, home to the greatest concentration of large mammals on Earth.',
    terrain: 'Flat grasslands with scattered trees, seasonal rivers, and rocky outcrops.',
    weatherPatterns: ['Clear Skies', 'Light Rain', 'Heat Wave', 'Dust Storm'],
    unlockLevel: 1, unlockCost: 0, unlocked: true,
    animalIds: ['sav_lion', 'sav_elephant', 'sav_zebra', 'sav_giraffe', 'sav_wildebeest', 'sav_cheetah'],
    color: '#D4A574',
  },
  {
    id: 'jungle', name: 'Dense Jungle', emoji: '🌴',
    description: 'A lush, impenetrable rainforest teeming with life at every layer from the forest floor to the canopy.',
    terrain: 'Dense undergrowth, towering canopy, winding rivers, and moss-covered ancient trees.',
    weatherPatterns: ['Light Rain', 'Heavy Storm', 'Fog', 'Clear Skies'],
    unlockLevel: 3, unlockCost: 500, unlocked: false,
    animalIds: ['jgl_tiger', 'jgl_orangutan', 'jgl_parrot', 'jgl_python', 'jgl_poison_frog'],
    color: '#2D5A27',
  },
  {
    id: 'desert', name: 'Desert Dunes', emoji: '🏜️',
    description: 'Endless seas of golden sand under a blazing sun, where life adapts to survive extreme conditions.',
    terrain: 'Rolling sand dunes, rocky plateaus, dry riverbeds, and scattered oases.',
    weatherPatterns: ['Clear Skies', 'Heat Wave', 'Dust Storm', 'Windy'],
    unlockLevel: 6, unlockCost: 1200, unlocked: false,
    animalIds: ['dst_fennec', 'dst_camel', 'dst_scorpion', 'dst_sidewinder'],
    color: '#E8C872',
  },
  {
    id: 'arctic', name: 'Arctic Tundra', emoji: '❄️',
    description: 'A frozen wilderness of ice and snow where only the hardiest species can survive year-round.',
    terrain: 'Permafrost, ice sheets, frozen tundra, and snow-covered mountain passes.',
    weatherPatterns: ['Snow', 'Windy', 'Clear Skies', 'Fog'],
    unlockLevel: 10, unlockCost: 3000, unlocked: false,
    animalIds: ['arc_polar', 'arc_wolf', 'arc_fox', 'arc_owl'],
    color: '#B8D4E8',
  },
  {
    id: 'mangrove', name: 'Mangrove Swamp', emoji: '🌊',
    description: 'A tangled network of waterways and mangrove roots where land meets sea in a rich ecosystem.',
    terrain: 'Muddy banks, tangled root systems, brackish channels, and tidal flats.',
    weatherPatterns: ['Light Rain', 'Heavy Storm', 'Fog', 'Clear Skies'],
    unlockLevel: 14, unlockCost: 5500, unlocked: false,
    animalIds: ['mng_crocodile', 'mng_heron', 'mng_monkey', 'mng_mangrove_snake'],
    color: '#4A7C59',
  },
  {
    id: 'bamboo', name: 'Bamboo Forest', emoji: '🎋',
    description: 'Towering bamboo groves create a serene, emerald world high in misty mountain valleys.',
    terrain: 'Dense bamboo stands, misty ravines, mossy rocks, and mountain streams.',
    weatherPatterns: ['Fog', 'Light Rain', 'Clear Skies', 'Windy'],
    unlockLevel: 20, unlockCost: 10000, unlocked: false,
    animalIds: ['bmb_panda', 'bmb_red_panda', 'bmb_takin', 'bmb_pheasant'],
    color: '#7CB342',
  },
  {
    id: 'volcanic', name: 'Volcanic Highlands', emoji: '🌋',
    description: 'Dramatic volcanic landscapes where life thrives against all odds in geothermally active terrain.',
    terrain: 'Volcanic slopes, sulfur vents, lava fields, cloud forests, and crater lakes.',
    weatherPatterns: ['Fog', 'Heat Wave', 'Heavy Storm', 'Clear Skies'],
    unlockLevel: 27, unlockCost: 18000, unlocked: false,
    animalIds: ['vlc_gorilla', 'vlc_eagle', 'vlc_iguana', 'vlc_bat'],
    color: '#8B4513',
  },
  {
    id: 'coral', name: 'Coral Reef Coast', emoji: '🐠',
    description: 'Crystal-clear tropical waters surrounding vibrant coral reefs teeming with marine biodiversity.',
    terrain: 'Shallow reefs, turquoise lagoons, sandy beaches, underwater caves, and sea grass beds.',
    weatherPatterns: ['Clear Skies', 'Light Rain', 'Windy', 'Heat Wave'],
    unlockLevel: 34, unlockCost: 28000, unlocked: false,
    animalIds: ['crl_turtle', 'crl_dolphin', 'crl_shark', 'crl_octopus'],
    color: '#00BCD4',
  },
];

// ---------------------------------------------------------------------------
// Internal Data — 5 Camera Types
// ---------------------------------------------------------------------------

const SX_CAMERAS: SxCamera[] = [
  {
    id: 'cam_basic', type: 'Basic', name: 'SnapShot 100', level: 1, maxLevel: 5,
    zoomRange: 30, qualityBonus: 0.0, upgradeCost: 200,
    description: 'A simple point-and-shoot camera. Great for beginners but limited zoom range.',
  },
  {
    id: 'cam_advanced', type: 'Advanced', name: 'WildEye Pro', level: 1, maxLevel: 5,
    zoomRange: 60, qualityBonus: 0.15, upgradeCost: 500,
    description: 'Mid-range DSLR with decent zoom. Captures clear shots at moderate distances.',
  },
  {
    id: 'cam_telephoto', type: 'Telephoto', name: 'LongReach 600mm', level: 1, maxLevel: 5,
    zoomRange: 120, qualityBonus: 0.25, upgradeCost: 1000,
    description: 'Professional telephoto lens for distant subjects. Essential for dangerous animals.',
  },
  {
    id: 'cam_underwater', type: 'Underwater', name: 'AquaLens Deep', level: 1, maxLevel: 5,
    zoomRange: 40, qualityBonus: 0.2, upgradeCost: 800,
    description: 'Waterproof camera for marine photography. Performs best in coral reef biome.',
  },
  {
    id: 'cam_professional', type: 'Professional', name: 'SafariMaster X', level: 1, maxLevel: 5,
    zoomRange: 200, qualityBonus: 0.4, upgradeCost: 2000,
    description: 'The ultimate wildlife photography rig. Unmatched quality and zoom.',
  },
];

// ---------------------------------------------------------------------------
// Internal Data — 8 Safari Vehicles
// ---------------------------------------------------------------------------

const SX_VEHICLES: SxVehicle[] = [
  {
    id: 'veh_jeep', type: 'Jeep', name: 'Safari Rover', emoji: '🚙',
    speed: 7, stealth: 4, capacity: 4, terrainAccess: ['savanna', 'desert', 'arctic'],
    cost: 0, unlocked: true,
    description: 'A rugged 4x4 vehicle perfect for savanna expeditions. Reliable and versatile.',
  },
  {
    id: 'veh_helicopter', type: 'Helicopter', name: 'Sky Scout', emoji: '🚁',
    speed: 10, stealth: 2, capacity: 3, terrainAccess: ['savanna', 'jungle', 'desert', 'arctic', 'mangrove', 'bamboo', 'volcanic', 'coral'],
    cost: 15000, unlocked: false,
    description: 'Aerial reconnaissance vehicle. Access any biome but low stealth alarms animals.',
  },
  {
    id: 'veh_boat', type: 'Boat', name: 'River Runner', emoji: '⛵',
    speed: 6, stealth: 5, capacity: 3, terrainAccess: ['mangrove', 'coral'],
    cost: 3000, unlocked: false,
    description: 'Sturdy motorboat for water-based biomes. Quiet engine for stealth approaches.',
  },
  {
    id: 'veh_balloon', type: 'Hot Air Balloon', name: 'Cloud Drifter', emoji: '🎈',
    speed: 3, stealth: 8, capacity: 2, terrainAccess: ['savanna', 'desert', 'arctic'],
    cost: 8000, unlocked: false,
    description: 'Silent aerial platform. Animals are less aware but movement is slow.',
  },
  {
    id: 'veh_canoe', type: 'Canoe', name: 'Silent Paddler', emoji: '🛶',
    speed: 4, stealth: 9, capacity: 2, terrainAccess: ['mangrove', 'bamboo', 'coral'],
    cost: 2000, unlocked: false,
    description: 'Near-silent watercraft. Ideal for getting close to skittish animals in wet biomes.',
  },
  {
    id: 'veh_atv', type: 'ATV', name: 'Trail Blazer', emoji: '🏍️',
    speed: 8, stealth: 3, capacity: 1, terrainAccess: ['savanna', 'desert', 'volcanic'],
    cost: 4000, unlocked: false,
    description: 'Fast all-terrain vehicle for solo expeditions. Great speed but noisy.',
  },
  {
    id: 'veh_elephant', type: 'Elephant', name: 'Tusker Mount', emoji: '🐘',
    speed: 4, stealth: 6, capacity: 2, terrainAccess: ['savanna', 'jungle', 'bamboo'],
    cost: 12000, unlocked: false,
    description: 'Ride a trained elephant through dense terrain. Animals are surprisingly unafraid.',
  },
  {
    id: 'veh_tent', type: 'Camouflage Tent', name: 'Hidesight Blind', emoji: '⛺',
    speed: 1, stealth: 10, capacity: 1, terrainAccess: ['savanna', 'jungle', 'desert', 'arctic', 'mangrove', 'bamboo', 'volcanic'],
    cost: 2500, unlocked: false,
    description: 'Stationary camouflage blind. Maximum stealth but you must wait for animals to come to you.',
  },
];

// ---------------------------------------------------------------------------
// Internal Data — 5 NPC Guides
// ---------------------------------------------------------------------------

const SX_GUIDES: SxGuide[] = [
  {
    id: 'guide_birds', name: 'Amara Ndegwa', emoji: '🧕',
    specialty: 'Birds', bonus: 0.3, hireCost: 800, hired: false,
    description: 'Expert ornithologist who can identify any bird by its call and locate rare species.',
    quote: 'Every feather tells a story of the sky.',
  },
  {
    id: 'guide_predators', name: 'Kael Voronov', emoji: '🧔',
    specialty: 'Predators', bonus: 0.35, hireCost: 1200, hired: false,
    description: 'Former wildlife ranger specializing in tracking large predators safely through dangerous terrain.',
    quote: 'To understand the hunter, you must think like the prey.',
  },
  {
    id: 'guide_marine', name: 'Dr. Coral Reyes', emoji: '👩‍🔬',
    specialty: 'Marine', bonus: 0.3, hireCost: 1000, hired: false,
    description: 'Marine biologist who knows every creature in the reef and can predict their movements.',
    quote: 'The ocean is not silent — you just need to learn how to listen.',
  },
  {
    id: 'guide_nocturnal', name: 'Rafiq Hassan', emoji: '👨',
    specialty: 'Nocturnal', bonus: 0.35, hireCost: 1500, hired: false,
    description: 'Desert survivalist who thrives in darkness and can find nocturnal creatures others would miss.',
    quote: 'The night reveals what the sun conceals.',
  },
  {
    id: 'guide_tracking', name: 'Zuri Mwangi', emoji: '👩‍🌾',
    specialty: 'Tracking', bonus: 0.4, hireCost: 2000, hired: false,
    description: 'Master tracker who can read footprints, broken twigs, and disturbed soil to follow any animal.',
    quote: 'The earth remembers every step that crosses it.',
  },
];

// ---------------------------------------------------------------------------
// Internal Data — 8 Weather Types
// ---------------------------------------------------------------------------

const SX_WEATHERS: SxWeather[] = [
  {
    type: 'Clear Skies', emoji: '☀️',
    visibilityModifier: 1.5,
    behaviorModifier: { Grazing: 0.1, Hunting: 0.05, Sleeping: -0.1, Playing: 0.15, 'Mating Dance': 0.1, Migration: 0.05, Nesting: 0.05, Bathing: 0.1, Stalking: -0.05, Roaring: 0.05 },
    description: 'Perfect conditions for wildlife spotting. Clear visibility and active animals.',
  },
  {
    type: 'Light Rain', emoji: '🌧️',
    visibilityModifier: 1.0,
    behaviorModifier: { Grazing: -0.05, Hunting: 0.05, Sleeping: 0.1, Playing: -0.1, 'Mating Dance': 0.0, Migration: -0.05, Nesting: 0.05, Bathing: 0.2, Stalking: 0.1, Roaring: -0.1 },
    description: 'Gentle rain encourages some animals to bathe while others seek shelter.',
  },
  {
    type: 'Heavy Storm', emoji: '⛈️',
    visibilityModifier: 0.4,
    behaviorModifier: { Grazing: -0.2, Hunting: -0.15, Sleeping: 0.2, Playing: -0.3, 'Mating Dance': -0.2, Migration: -0.1, Nesting: 0.1, Bathing: -0.1, Stalking: -0.15, Roaring: -0.2 },
    description: 'Severe weather drives most animals into cover. Few sightings expected.',
  },
  {
    type: 'Fog', emoji: '🌫️',
    visibilityModifier: 0.5,
    behaviorModifier: { Grazing: 0.0, Hunting: 0.1, Sleeping: 0.05, Playing: -0.05, 'Mating Dance': 0.0, Migration: -0.1, Nesting: 0.0, Bathing: 0.0, Stalking: 0.2, Roaring: 0.05 },
    description: 'Thick fog reduces visibility but predators become bolder. Good for tracking.',
  },
  {
    type: 'Heat Wave', emoji: '🔥',
    visibilityModifier: 0.8,
    behaviorModifier: { Grazing: -0.15, Hunting: -0.1, Sleeping: 0.3, Playing: -0.2, 'Mating Dance': -0.15, Migration: -0.2, Nesting: -0.1, Bathing: 0.25, Stalking: -0.1, Roaring: -0.15 },
    description: 'Extreme heat makes animals lethargic. Most rest in shade near water.',
  },
  {
    type: 'Dust Storm', emoji: '💨',
    visibilityModifier: 0.3,
    behaviorModifier: { Grazing: -0.2, Hunting: -0.2, Sleeping: 0.15, Playing: -0.25, 'Mating Dance': -0.2, Migration: -0.15, Nesting: 0.0, Bathing: -0.2, Stalking: -0.1, Roaring: -0.2 },
    description: 'Blinding dust severely limits visibility. Animals hunker down and wait it out.',
  },
  {
    type: 'Snow', emoji: '🌨️',
    visibilityModifier: 0.6,
    behaviorModifier: { Grazing: 0.05, Hunting: 0.1, Sleeping: 0.15, Playing: 0.1, 'Mating Dance': -0.1, Migration: 0.1, Nesting: 0.0, Bathing: -0.2, Stalking: 0.1, Roaring: 0.0 },
    description: 'Snowfall creates a beautiful white backdrop. Arctic animals become more active.',
  },
  {
    type: 'Windy', emoji: '🌬️',
    visibilityModifier: 1.0,
    behaviorModifier: { Grazing: -0.1, Hunting: 0.15, Sleeping: -0.1, Playing: 0.05, 'Mating Dance': -0.1, Migration: 0.15, Nesting: -0.05, Bathing: 0.0, Stalking: 0.05, Roaring: -0.05 },
    description: 'Strong winds carry scents far. Predators use this advantage while prey stays alert.',
  },
];

// ---------------------------------------------------------------------------
// Internal Data — 15 Achievement Definitions
// ---------------------------------------------------------------------------

const SX_ACHIEVEMENT_DEFS: { id: string; name: string; description: string; icon: string; reward: { coins: number; xp: number } }[] = [
  { id: 'sx_a1', name: 'First Spot', description: 'Spot your first animal in the wild', icon: '👁️', reward: { coins: 50, xp: 100 } },
  { id: 'sx_a2', name: 'Wildlife Photographer', description: 'Take your first wildlife photograph', icon: '📷', reward: { coins: 75, xp: 150 } },
  { id: 'sx_a3', name: 'Big Five', description: 'Spot all 5 savanna apex animals', icon: '👑', reward: { coins: 500, xp: 1000 } },
  { id: 'sx_a4', name: 'Rare Sighting', description: 'Spot a rare or higher rarity animal', icon: '💎', reward: { coins: 200, xp: 400 } },
  { id: 'sx_a5', name: 'Expedition Master', description: 'Complete 25 expeditions', icon: '🗺️', reward: { coins: 1000, xp: 2000 } },
  { id: 'sx_a6', name: 'Legendary Finder', description: 'Spot a Legendary rarity animal', icon: '⭐', reward: { coins: 2000, xp: 3000 } },
  { id: 'sx_a7', name: 'Biome Explorer', description: 'Visit all 8 biomes at least once', icon: '🌍', reward: { coins: 1500, xp: 2500 } },
  { id: 'sx_a8', name: 'Night Owl', description: 'Spot 5 different nocturnal animals', icon: '🦉', reward: { coins: 400, xp: 800 } },
  { id: 'sx_a9', name: 'Photo Album', description: 'Fill your gallery with 50 photos', icon: '📸', reward: { coins: 800, xp: 1500 } },
  { id: 'sx_a10', name: 'Perfect Shot', description: 'Take a 5-star photograph', icon: '🌟', reward: { coins: 500, xp: 1000 } },
  { id: 'sx_a11', name: 'Tracking Expert', description: 'Follow 50 tracks successfully', icon: '🐾', reward: { coins: 600, xp: 1200 } },
  { id: 'sx_a12', name: 'Daily Devotee', description: 'Maintain a 7-day daily streak', icon: '🔥', reward: { coins: 700, xp: 1400 } },
  { id: 'sx_a13', name: 'Full Encyclopedia', description: 'Discover all 35 animal species', icon: '📖', reward: { coins: 5000, xp: 5000 } },
  { id: 'sx_a14', name: 'Storm Chaser', description: 'Spot animals during a heavy storm', icon: '⛈️', reward: { coins: 300, xp: 600 } },
  { id: 'sx_a15', name: 'Safari Legend', description: 'Reach level 40', icon: '🏆', reward: { coins: 10000, xp: 10000 } },
];

// ---------------------------------------------------------------------------
// Internal Data — Time of Day
// ---------------------------------------------------------------------------

const SX_TIME_OF_DAY = [
  { name: 'Dawn', emoji: '🌅', hourRange: '5:00-7:00' },
  { name: 'Morning', emoji: '🌤️', hourRange: '7:00-11:00' },
  { name: 'Noon', emoji: '☀️', hourRange: '11:00-14:00' },
  { name: 'Afternoon', emoji: '⛅', hourRange: '14:00-17:00' },
  { name: 'Dusk', emoji: '🌇', hourRange: '17:00-19:00' },
  { name: 'Night', emoji: '🌙', hourRange: '19:00-5:00' },
];

// ---------------------------------------------------------------------------
// Internal Data — Behavior list
// ---------------------------------------------------------------------------

const ALL_BEHAVIORS: AnimalBehavior[] = [
  'Grazing', 'Hunting', 'Sleeping', 'Playing', 'Mating Dance',
  'Migration', 'Nesting', 'Bathing', 'Stalking', 'Roaring',
];

// ---------------------------------------------------------------------------
// State Management — SSR-safe lazy initialization
// ---------------------------------------------------------------------------

let state: SafariExpeditionState | null = null;

function ensureInit(): SafariExpeditionState {
  if (state) return state;

  const speciesCards: Record<string, SxSpeciesCard> = {};
  for (const animal of SX_ANIMALS) {
    speciesCards[animal.id] = {
      animalId: animal.id,
      discovered: false,
      firstSeenDate: null,
      timesSpotted: 0,
      bestPhotoStars: 0,
      totalPhotos: 0,
      behaviorsObserved: [],
      notes: [],
    };
  }

  const biomeStates: Record<string, { unlocked: boolean; visited: boolean; timesVisited: number }> = {};
  for (const biome of SX_BIOMES) {
    biomeStates[biome.id] = { unlocked: biome.unlocked, visited: biome.id === 'savanna', timesVisited: biome.id === 'savanna' ? 1 : 0 };
  }

  state = {
    initialized: true,
    version: 1,
    level: 1,
    xp: 0,
    xpToNext: 100,
    totalXP: 0,
    coins: 500,
    totalSpotted: 0,
    rareSpotted: 0,
    streak: 0,
    bestStreak: 0,
    currentBiomeId: 'savanna',
    photos: [],
    achievements: SX_ACHIEVEMENT_DEFS.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      unlocked: false,
      unlockedDate: null,
      icon: d.icon,
      reward: { ...d.reward },
    })),
    dailyChallenge: {
      date: '',
      biomeId: 'savanna',
      targetAnimal: '',
      targetBehavior: null,
      targetPhotos: 3,
      bonusMultiplier: 1.5,
      completed: false,
      photosTaken: 0,
      animalsSpotted: 0,
    },
    currentExpedition: null,
    journal: [],
    equipment: {
      binocularsLevel: 1,
      binocularsMaxLevel: 5,
      trackerLevel: 1,
      trackerMaxLevel: 5,
      baitTypes: ['basic', 'scented', 'premium'],
      baitCount: { basic: 5, scented: 2, premium: 0 },
      scentMask: false,
    },
    currentCameraId: 'cam_basic',
    currentVehicleId: 'veh_jeep',
    currentGuideId: '',
    currentWeather: 'Clear Skies',
    weatherTicks: 0,
    timeOfDay: 1,
    tracks: [],
    speciesCards,
    biomeStates,
    completedExpeditions: 0,
    runHistory: [],
    lastDailyDate: '',
    totalDistance: 0,
    totalPhotos: 0,
    spottedAnimalIds: [],
    ownedVehicles: ['veh_jeep'],
    hiredGuides: [],
  };

  return state;
}

// ---------------------------------------------------------------------------
// Helper Functions (internal)
// ---------------------------------------------------------------------------

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SX-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getRarityStarBonus(rarity: RarityTier): number {
  const map: Record<RarityTier, number> = {
    'Common': 0, 'Uncommon': 0.3, 'Rare': 0.6, 'Epic': 0.9, 'Legendary': 1.2,
  };
  return map[rarity];
}

function getBehaviorStarBonus(behavior: AnimalBehavior): number {
  const map: Record<AnimalBehavior, number> = {
    'Grazing': 0, 'Sleeping': 0, 'Migration': 0.1,
    'Bathing': 0.2, 'Playing': 0.3, 'Nesting': 0.4,
    'Roaring': 0.5, 'Stalking': 0.6, 'Hunting': 0.7, 'Mating Dance': 0.9,
  };
  return map[behavior];
}

function getDistanceStarMultiplier(distance: number): number {
  if (distance <= 10) return 1.0;
  if (distance <= 30) return 0.8;
  if (distance <= 60) return 0.6;
  if (distance <= 100) return 0.4;
  return 0.2;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getDateSeed(): number {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = ((seed << 5) - seed + dateStr.charCodeAt(i)) | 0;
  }
  return seed;
}

// ---------------------------------------------------------------------------
// Exported Functions — Core State Management
// ---------------------------------------------------------------------------

export function sxGetState(): SafariExpeditionState {
  return ensureInit();
}

export function sxResetState(): void {
  state = null;
}

export function sxGetLevel(): number {
  return ensureInit().level;
}

export function sxAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  const clampedLevel = Math.min(s.level, 40);
  if (clampedLevel >= 40) {
    s.totalXP += amount;
    return { leveledUp: false, newLevel: 40 };
  }
  s.xp += amount;
  s.totalXP += amount;
  let leveledUp = false;
  while (s.xp >= s.xpToNext && s.level < 40) {
    s.xp -= s.xpToNext;
    s.level++;
    s.xpToNext = Math.floor(s.xpToNext * 1.25) + 50;
    leveledUp = true;
  }
  if (s.level >= 40) {
    s.xp = 0;
    s.xpToNext = 1;
  }
  return { leveledUp, newLevel: s.level };
}

export function sxGetXpProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  return {
    current: s.xp,
    needed: s.xpToNext,
    percentage: s.xpToNext > 0 ? Math.floor((s.xp / s.xpToNext) * 100) : 100,
  };
}

export function sxGetCoins(): number {
  return ensureInit().coins;
}

export function sxAddCoins(amount: number): number {
  const s = ensureInit();
  s.coins += amount;
  return s.coins;
}

// ---------------------------------------------------------------------------
// Exported Functions — Biomes
// ---------------------------------------------------------------------------

export function sxGetBiomes(): SxBiome[] {
  const s = ensureInit();
  return SX_BIOMES.map(b => ({
    ...b,
    unlocked: s.biomeStates[b.id]?.unlocked ?? b.unlocked,
  }));
}

export function sxGetCurrentBiome(): SxBiome {
  const s = ensureInit();
  const biome = SX_BIOMES.find(b => b.id === s.currentBiomeId);
  if (!biome) return SX_BIOMES[0];
  return { ...biome, unlocked: true };
}

export function sxSetBiome(biomeId: string): boolean {
  const s = ensureInit();
  const biomeState = s.biomeStates[biomeId];
  if (!biomeState || !biomeState.unlocked) return false;
  s.currentBiomeId = biomeId;
  return true;
}

export function sxUnlockBiome(biomeId: string): boolean {
  const s = ensureInit();
  const biome = SX_BIOMES.find(b => b.id === biomeId);
  const biomeState = s.biomeStates[biomeId];
  if (!biome || !biomeState || biomeState.unlocked) return false;
  if (s.level < biome.unlockLevel) return false;
  if (s.coins < biome.unlockCost) return false;
  s.coins -= biome.unlockCost;
  biomeState.unlocked = true;
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Animals
// ---------------------------------------------------------------------------

export function sxGetAnimals(): SxAnimal[] {
  return SX_ANIMALS.map(a => ({ ...a }));
}

export function sxGetAnimalsByBiome(biomeId: string): SxAnimal[] {
  const biome = SX_BIOMES.find(b => b.id === biomeId);
  if (!biome) return [];
  return biome.animalIds.map(id => {
    const animal = SX_ANIMALS.find(a => a.id === id);
    return animal ? { ...animal } : null;
  }).filter((a): a is SxAnimal => a !== null);
}

export function sxSpotAnimal(animalId: string): { spotted: boolean; rarity: RarityTier; xpEarned: number; isNew: boolean } | null {
  const s = ensureInit();
  const animal = SX_ANIMALS.find(a => a.id === animalId);
  if (!animal) return null;

  const isNew = !s.spottedAnimalIds.includes(animalId);
  if (isNew) {
    s.spottedAnimalIds.push(animalId);
    s.totalSpotted++;
    if (animal.rarity === 'Rare' || animal.rarity === 'Epic' || animal.rarity === 'Legendary') {
      s.rareSpotted++;
    }
  }

  const card = s.speciesCards[animalId];
  if (card) {
    card.discovered = true;
    card.timesSpotted++;
    if (!card.firstSeenDate) card.firstSeenDate = Date.now();
  }

  const xpMap: Record<RarityTier, number> = {
    'Common': 20, 'Uncommon': 40, 'Rare': 80, 'Epic': 150, 'Legendary': 300,
  };
  const xpEarned = xpMap[animal.rarity];
  void sxAddXP(xpEarned);

  if (s.currentExpedition && !s.currentExpedition.animalsSpotted.includes(animalId)) {
    s.currentExpedition.animalsSpotted.push(animalId);
    s.currentExpedition.xpEarned += xpEarned;
    s.currentExpedition.score += xpEarned;
  }

  return { spotted: true, rarity: animal.rarity, xpEarned, isNew };
}

export function sxGetSpotted(): { animalId: string; name: string; emoji: string; rarity: RarityTier; timesSpotted: number; bestPhoto: number }[] {
  const s = ensureInit();
  return s.spottedAnimalIds.map(id => {
    const animal = SX_ANIMALS.find(a => a.id === id);
    const card = s.speciesCards[id];
    return {
      animalId: id,
      name: animal?.name ?? 'Unknown',
      emoji: animal?.emoji ?? '❓',
      rarity: animal?.rarity ?? 'Common',
      timesSpotted: card?.timesSpotted ?? 0,
      bestPhoto: card?.bestPhotoStars ?? 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Exported Functions — Expeditions
// ---------------------------------------------------------------------------

export function sxStartExpedition(biomeId: string | null): SxExpedition | null {
  const s = ensureInit();
  if (s.currentExpedition) return null;

  const targetBiome = biomeId ?? s.currentBiomeId;
  const biomeState = s.biomeStates[targetBiome];
  if (!biomeState || !biomeState.unlocked) return null;

  biomeState.visited = true;
  biomeState.timesVisited++;

  s.currentBiomeId = targetBiome;
  s.timeOfDay = 1;
  s.weatherTicks = 0;
  s.currentWeather = 'Clear Skies';
  s.tracks = [];

  const duration = 300 + s.level * 30;

  s.currentExpedition = {
    biomeId: targetBiome,
    startTime: Date.now(),
    duration,
    animalsSpotted: [],
    photosTaken: 0,
    coinsEarned: 0,
    xpEarned: 0,
    distanceCovered: 0,
    active: true,
    score: 0,
  };

  s.journal.push({
    id: `journal-${Date.now()}`,
    timestamp: Date.now(),
    biomeId: targetBiome,
    text: `Expedition started in ${SX_BIOMES.find(b => b.id === targetBiome)?.name ?? targetBiome}.`,
    animalSightings: [],
    photosCount: 0,
  });

  return { ...s.currentExpedition };
}

export function sxEndExpedition(): { success: boolean; score: number; coins: number; xp: number; animalsSpotted: number; photosTaken: number } {
  const s = ensureInit();
  if (!s.currentExpedition) {
    return { success: false, score: 0, coins: 0, xp: 0, animalsSpotted: 0, photosTaken: 0 };
  }

  s.currentExpedition.active = false;
  s.completedExpeditions++;

  const expedition = { ...s.currentExpedition };
  s.runHistory.push(expedition);
  if (s.runHistory.length > 50) s.runHistory.shift();

  const coinsEarned = expedition.score * 2;
  s.coins += coinsEarned;
  s.currentExpedition.coinsEarned = coinsEarned;

  void sxAddXP(expedition.xpEarned);

  const result = {
    success: true,
    score: expedition.score,
    coins: coinsEarned,
    xp: expedition.xpEarned,
    animalsSpotted: expedition.animalsSpotted.length,
    photosTaken: expedition.photosTaken,
  };

  s.currentExpedition = null;
  void sxCheckAchievements();

  return result;
}

export function sxGetExpeditionProgress(): { active: boolean; timeRemaining: number; percentage: number; animalsSpotted: number; photosTaken: number; score: number } | null {
  const s = ensureInit();
  if (!s.currentExpedition) return null;
  const elapsed = (Date.now() - s.currentExpedition.startTime) / 1000;
  const remaining = Math.max(0, s.currentExpedition.duration - elapsed);
  const percentage = s.currentExpedition.duration > 0 ? Math.min(100, Math.floor((elapsed / s.currentExpedition.duration) * 100)) : 100;
  return {
    active: s.currentExpedition.active,
    timeRemaining: remaining,
    percentage,
    animalsSpotted: s.currentExpedition.animalsSpotted.length,
    photosTaken: s.currentExpedition.photosTaken,
    score: s.currentExpedition.score,
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Photography System
// ---------------------------------------------------------------------------

export function sxTakePhoto(animalId: string, distance: number, behavior: AnimalBehavior): SxPhoto | null {
  const s = ensureInit();
  if (s.photos.length >= 80) return null;

  const animal = SX_ANIMALS.find(a => a.id === animalId);
  if (!animal) return null;

  const camera = SX_CAMERAS.find(c => c.id === s.currentCameraId);
  const qualityBonus = camera?.qualityBonus ?? 0;

  const stars = sxGetPhotoQuality(animal.rarity, behavior, distance, qualityBonus);

  const photo: SxPhoto = {
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    animalId,
    animalName: animal.name,
    animalEmoji: animal.emoji,
    biome: s.currentBiomeId,
    stars,
    camera: camera?.name ?? 'Basic',
    distance,
    behavior,
    timestamp: Date.now(),
    shareCode: generateShareCode(),
    rarity: animal.rarity,
  };

  s.photos.push(photo);
  if (s.photos.length > 80) s.photos.shift();
  s.totalPhotos++;

  const card = s.speciesCards[animalId];
  if (card) {
    card.totalPhotos++;
    if (stars > card.bestPhotoStars) card.bestPhotoStars = stars;
    if (!card.behaviorsObserved.includes(behavior)) {
      card.behaviorsObserved.push(behavior);
    }
  }

  if (s.currentExpedition) {
    s.currentExpedition.photosTaken++;
    s.currentExpedition.score += stars * 10;
  }

  const lastJournal = s.journal[s.journal.length - 1];
  if (lastJournal) {
    lastJournal.photosCount++;
    if (!lastJournal.animalSightings.includes(animalId)) {
      lastJournal.animalSightings.push(animalId);
    }
  }

  void sxSpotAnimal(animalId);

  return photo;
}

export function sxGetPhotoQuality(
  rarity: RarityTier,
  behavior: AnimalBehavior,
  distance: number,
  cameraBonus: number,
): number {
  let score = 1.0;
  score += getRarityStarBonus(rarity);
  score += getBehaviorStarBonus(behavior);
  score += cameraBonus;

  const weather = SX_WEATHERS.find(w => w.type === state?.currentWeather);
  if (weather) score *= weather.visibilityModifier;

  const distMult = getDistanceStarMultiplier(distance);
  score = score * (0.5 + distMult * 0.5);

  const guide = SX_GUIDES.find(g => g.id === state?.currentGuideId);
  if (guide) score += guide.bonus;

  return Math.max(1, Math.min(5, Math.round(score)));
}

export function sxGetPhotoGallery(): SxPhoto[] {
  return [...ensureInit().photos].reverse();
}

export function sxGetBestPhotos(limit: number = 10): SxPhoto[] {
  const s = ensureInit();
  return [...s.photos].sort((a, b) => b.stars - a.stars).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Exported Functions — Cameras
// ---------------------------------------------------------------------------

export function sxGetCameras(): SxCamera[] {
  return SX_CAMERAS.map(c => ({ ...c }));
}

export function sxGetCurrentCamera(): SxCamera {
  const s = ensureInit();
  const camera = SX_CAMERAS.find(c => c.id === s.currentCameraId);
  return camera ? { ...camera } : { ...SX_CAMERAS[0] };
}

export function sxEquipCamera(cameraId: string): boolean {
  const s = ensureInit();
  const camera = SX_CAMERAS.find(c => c.id === cameraId);
  if (!camera) return false;
  s.currentCameraId = cameraId;
  return true;
}

export function sxUpgradeCamera(cameraId: string): boolean {
  const s = ensureInit();
  const camera = SX_CAMERAS.find(c => c.id === cameraId);
  if (!camera) return false;
  if (camera.level >= camera.maxLevel) return false;
  const upgradeCost = Math.floor(camera.upgradeCost * Math.pow(1.5, camera.level - 1));
  if (s.coins < upgradeCost) return false;
  s.coins -= upgradeCost;
  camera.level++;
  camera.qualityBonus = Math.min(0.8, camera.qualityBonus + 0.08);
  camera.zoomRange = Math.floor(camera.zoomRange * 1.15);
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Vehicles
// ---------------------------------------------------------------------------

export function sxGetVehicles(): SxVehicle[] {
  const s = ensureInit();
  return SX_VEHICLES.map(v => ({
    ...v,
    unlocked: s.ownedVehicles.includes(v.id),
  }));
}

export function sxGetCurrentVehicle(): SxVehicle {
  const s = ensureInit();
  const vehicle = SX_VEHICLES.find(v => v.id === s.currentVehicleId);
  return vehicle ? { ...vehicle, unlocked: true } : { ...SX_VEHICLES[0], unlocked: true };
}

export function sxSetVehicle(vehicleId: string): boolean {
  const s = ensureInit();
  if (!s.ownedVehicles.includes(vehicleId)) return false;
  s.currentVehicleId = vehicleId;
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Guides
// ---------------------------------------------------------------------------

export function sxGetGuides(): SxGuide[] {
  const s = ensureInit();
  return SX_GUIDES.map(g => ({
    ...g,
    hired: s.hiredGuides.includes(g.id),
  }));
}

export function sxGetCurrentGuide(): SxGuide | null {
  const s = ensureInit();
  if (!s.currentGuideId) return null;
  const guide = SX_GUIDES.find(g => g.id === s.currentGuideId);
  if (!guide) return null;
  return { ...guide, hired: true };
}

export function sxHireGuide(guideId: string): boolean {
  const s = ensureInit();
  const guide = SX_GUIDES.find(g => g.id === guideId);
  if (!guide) return false;
  if (s.hiredGuides.includes(guideId)) {
    s.currentGuideId = guideId;
    return true;
  }
  if (s.coins < guide.hireCost) return false;
  s.coins -= guide.hireCost;
  s.hiredGuides.push(guideId);
  s.currentGuideId = guideId;
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Weather & Time
// ---------------------------------------------------------------------------

export function sxGetWeather(): { weather: SxWeather; ticksRemaining: number } {
  const s = ensureInit();
  const weather = SX_WEATHERS.find(w => w.type === s.currentWeather);
  return {
    weather: weather ? { ...weather } : { ...SX_WEATHERS[0] },
    ticksRemaining: 5 - (s.weatherTicks % 5),
  };
}

export function sxAdvanceWeather(): SxWeather {
  const s = ensureInit();
  s.weatherTicks++;
  if (s.weatherTicks % 5 === 0) {
    const biome = SX_BIOMES.find(b => b.id === s.currentBiomeId);
    const patterns = biome?.weatherPatterns ?? ['Clear Skies'];
    const idx = Math.floor(Math.random() * patterns.length);
    s.currentWeather = patterns[idx];
  }
  const weather = SX_WEATHERS.find(w => w.type === s.currentWeather);
  return weather ? { ...weather } : { ...SX_WEATHERS[0] };
}

export function sxGetTimeOfDay(): { name: string; emoji: string; hourRange: string; index: number } {
  const s = ensureInit();
  const tod = SX_TIME_OF_DAY[s.timeOfDay];
  return {
    name: tod.name,
    emoji: tod.emoji,
    hourRange: tod.hourRange,
    index: s.timeOfDay,
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Tracking System
// ---------------------------------------------------------------------------

export function sxGetTracks(): SxTrack[] {
  return [...ensureInit().tracks];
}

export function sxFollowTracks(trackId: string): { success: boolean; animal: SxAnimal | null; distance: number } {
  const s = ensureInit();
  const track = s.tracks.find(t => t.id === trackId);
  if (!track) return { success: false, animal: null, distance: 0 };

  track.following = true;
  track.freshness = Math.max(0, track.freshness - 15);

  const animal = SX_ANIMALS.find(a => a.id === track.animalId);
  const found = track.freshness > 20 && Math.random() < track.freshness / 100;

  if (found && s.currentExpedition) {
    s.currentExpedition.distanceCovered += track.distance;
    s.totalDistance += track.distance;
  }

  return {
    success: found,
    animal: found && animal ? { ...animal } : null,
    distance: track.distance,
  };
}

export function sxIdentifyCall(biomeId: string): { animal: SxAnimal | null; behavior: AnimalBehavior; confidence: number } {
  const s = ensureInit();
  const animals = sxGetAnimalsByBiome(biomeId);
  if (animals.length === 0) return { animal: null, behavior: 'Grazing', confidence: 0 };

  const trackerBonus = 0.1 * s.equipment.trackerLevel;
  const guide = SX_GUIDES.find(g => g.id === s.currentGuideId);
  const guideBonus = guide?.bonus ?? 0;

  const confidence = Math.min(1.0, 0.4 + trackerBonus + guideBonus);
  const identified = Math.random() < confidence;

  const idx = Math.floor(Math.random() * animals.length);
  const animal = animals[idx];
  const behavior = animal.behaviors[Math.floor(Math.random() * animal.behaviors.length)];

  return {
    animal: identified ? animal : null,
    behavior,
    confidence: Math.round(confidence * 100),
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Animal Encyclopedia
// ---------------------------------------------------------------------------

export function sxGetEncyclopedia(): { total: number; discovered: number; cards: SxSpeciesCard[] } {
  const s = ensureInit();
  const cards = SX_ANIMALS.map(a => ({ ...s.speciesCards[a.id] }));
  const discovered = cards.filter(c => c.discovered).length;
  return { total: SX_ANIMALS.length, discovered, cards };
}

export function sxDiscoveries(): { count: number; percentage: number; rareCount: number; legendaryCount: number } {
  const s = ensureInit();
  const total = SX_ANIMALS.length;
  const count = s.spottedAnimalIds.length;
  const rareAnimals = SX_ANIMALS.filter(a => a.rarity === 'Rare' || a.rarity === 'Epic' || a.rarity === 'Legendary');
  const rareCount = rareAnimals.filter(a => s.spottedAnimalIds.includes(a.id)).length;
  const legendaryCount = SX_ANIMALS.filter(a => a.rarity === 'Legendary' && s.spottedAnimalIds.includes(a.id)).length;
  return {
    count,
    percentage: Math.floor((count / total) * 100),
    rareCount,
    legendaryCount,
  };
}

export function sxGetSpeciesCard(animalId: string): SxSpeciesCard | null {
  const s = ensureInit();
  const card = s.speciesCards[animalId];
  if (!card) return null;
  const animal = SX_ANIMALS.find(a => a.id === animalId);
  return {
    ...card,
    notes: animal
      ? [animal.funFact, `Weight: ${animal.weight} kg`, `Lifespan: ${animal.lifespan}`, `Conservation: ${animal.conservationStatus}`]
      : card.notes,
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Daily Challenge
// ---------------------------------------------------------------------------

export function sxGetDailyChallenge(): SxDailyChallenge {
  const s = ensureInit();
  const today = new Date().toDateString();
  const seed = getDateSeed();
  const rng = seededRandom(seed);

  if (s.dailyChallenge.date !== today) {
    const biomeIdx = Math.floor(rng() * SX_BIOMES.length);
    const biome = SX_BIOMES[biomeIdx];
    const animals = biome.animalIds;
    const animalIdx = Math.floor(rng() * animals.length);
    const targetAnimal = animals[animalIdx];
    const animal = SX_ANIMALS.find(a => a.id === targetAnimal);
    const targetBehavior = animal
      ? animal.behaviors[Math.floor(rng() * animal.behaviors.length)]
      : null;

    s.dailyChallenge = {
      date: today,
      biomeId: biome.id,
      targetAnimal,
      targetBehavior,
      targetPhotos: 2 + Math.floor(rng() * 3),
      bonusMultiplier: 1.5 + rng() * 1.0,
      completed: false,
      photosTaken: 0,
      animalsSpotted: 0,
    };

    if (s.lastDailyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (s.lastDailyDate === yesterday) {
        s.streak++;
      } else if (s.lastDailyDate !== '') {
        s.streak = 1;
      } else {
        s.streak = 1;
      }
      if (s.streak > s.bestStreak) s.bestStreak = s.streak;
      s.lastDailyDate = today;
    }
  }

  return { ...s.dailyChallenge };
}

export function sxCompleteDaily(): { bonus: number; xpBonus: number; streakIncreased: boolean } {
  const s = ensureInit();
  const daily = sxGetDailyChallenge();
  if (daily.completed) return { bonus: 0, xpBonus: 0, streakIncreased: false };

  s.dailyChallenge.completed = true;
  const coinBonus = Math.floor(200 * daily.bonusMultiplier);
  const xpBonus = Math.floor(150 * daily.bonusMultiplier);
  s.coins += coinBonus;
  void sxAddXP(xpBonus);

  return { bonus: coinBonus, xpBonus, streakIncreased: s.streak > 1 };
}

export function sxGetStreak(): number {
  return ensureInit().streak;
}

export function sxGetBestStreak(): number {
  return ensureInit().bestStreak;
}

// ---------------------------------------------------------------------------
// Exported Functions — Stats
// ---------------------------------------------------------------------------

export function sxGetStats(): { label: string; value: string | number }[] {
  const s = ensureInit();
  const discoveries = sxDiscoveries();
  const biome = SX_BIOMES.find(b => b.id === s.currentBiomeId);
  return [
    { label: 'Level', value: `${s.level} / 40` },
    { label: 'Total XP', value: s.totalXP },
    { label: 'Coins', value: s.coins },
    { label: 'Species Discovered', value: `${discoveries.count} / ${discoveries.total}` },
    { label: 'Rare+ Spotted', value: s.rareSpotted },
    { label: 'Total Photos', value: s.totalPhotos },
    { label: 'Current Biome', value: biome ? `${biome.emoji} ${biome.name}` : 'Unknown' },
    { label: 'Expeditions', value: s.completedExpeditions },
    { label: 'Streak', value: `${s.streak} (Best: ${s.bestStreak})` },
    { label: 'Distance Traveled', value: `${(s.totalDistance / 1000).toFixed(1)} km` },
    { label: 'Vehicles Owned', value: `${s.ownedVehicles.length} / ${SX_VEHICLES.length}` },
    { label: 'Guides Hired', value: `${s.hiredGuides.length} / ${SX_GUIDES.length}` },
  ];
}

// ---------------------------------------------------------------------------
// Exported Functions — Achievements
// ---------------------------------------------------------------------------

export function sxGetAchievements(): SxAchievement[] {
  return ensureInit().achievements.map(a => ({ ...a }));
}

export function sxCheckAchievements(): string[] {
  const s = ensureInit();
  const newlyUnlocked: string[] = [];
  const savannaApex = ['sav_lion', 'sav_elephant', 'sav_zebra', 'sav_giraffe', 'sav_cheetah'];

  const checks: Record<string, boolean> = {
    sx_a1: s.totalSpotted >= 1,
    sx_a2: s.totalPhotos >= 1,
    sx_a3: savannaApex.every(id => s.spottedAnimalIds.includes(id)),
    sx_a4: s.rareSpotted >= 1,
    sx_a5: s.completedExpeditions >= 25,
    sx_a6: SX_ANIMALS.some(a => a.rarity === 'Legendary' && s.spottedAnimalIds.includes(a.id)),
    sx_a7: Object.values(s.biomeStates).filter(bs => bs.visited).length >= 8,
    sx_a8: SX_ANIMALS.filter(a => a.behavior === 'Nocturnal' && s.spottedAnimalIds.includes(a.id)).length >= 5,
    sx_a9: s.photos.length >= 50,
    sx_a10: s.photos.some(p => p.stars >= 5),
    sx_a11: s.totalDistance >= 5000,
    sx_a12: s.bestStreak >= 7,
    sx_a13: s.spottedAnimalIds.length >= 35,
    sx_a14: s.photos.some(p => {
      const weather = SX_WEATHERS.find(w => w.type === p.biome ? s.currentWeather : 'Clear Skies');
      return weather?.type === 'Heavy Storm';
    }),
    sx_a15: s.level >= 40,
  };

  for (const ach of s.achievements) {
    if (!ach.unlocked && checks[ach.id]) {
      ach.unlocked = true;
      ach.unlockedDate = Date.now();
      s.coins += ach.reward.coins;
      void sxAddXP(ach.reward.xp);
      newlyUnlocked.push(ach.id);
    }
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Exported Functions — Run History
// ---------------------------------------------------------------------------

export function sxGetRunHistory(): SxExpedition[] {
  const s = ensureInit();
  return [...s.runHistory].reverse().slice(0, 20);
}

// ---------------------------------------------------------------------------
// Exported Functions — Hint System
// ---------------------------------------------------------------------------

export function sxGetHint(): string {
  const s = ensureInit();
  const biome = SX_BIOMES.find(b => b.id === s.currentBiomeId);
  const weather = SX_WEATHERS.find(w => w.type === s.currentWeather);
  const undiscovered = SX_ANIMALS.filter(
    a => a.habitat === s.currentBiomeId && !s.spottedAnimalIds.includes(a.id),
  );

  const activityHints: Record<ActivityPattern, string> = {
    'Diurnal': 'Look during morning or afternoon for the best sightings.',
    'Nocturnal': 'Wait until nightfall — some of the rarest creatures only appear after dark.',
    'Crepuscular': 'Dawn and dusk are prime time for crepuscular animals.',
  };

  const hints: string[] = [];

  if (biome) {
    hints.push(`You are exploring the ${biome.emoji} ${biome.name}. Keep your eyes peeled!`);
  }

  if (weather && weather.visibilityModifier < 0.7) {
    hints.push('Poor visibility right now. Consider waiting for the weather to improve.');
  }

  if (undiscovered.length > 0) {
    const target = undiscovered[Math.floor(s.level % undiscovered.length)];
    hints.push(`There are still undiscovered species here. Try looking near water sources.`);
  }

  const activeAnimal = SX_ANIMALS.find(a => a.habitat === s.currentBiomeId);
  if (activeAnimal) {
    hints.push(activityHints[activeAnimal.behavior]);
  }

  const guide = SX_GUIDES.find(g => g.id === s.currentGuideId);
  if (guide) {
    hints.push(`${guide.name} says: "${guide.quote}"`);
  }

  if (s.equipment.binocularsLevel < 3) {
    hints.push('Upgrading your binoculars will help you spot distant animals more easily.');
  }

  if (s.photos.length >= 70) {
    hints.push('Your photo gallery is nearly full. Keep only your best shots!');
  }

  const activeBehavior = activeAnimal?.behaviors[Math.floor(Date.now() / 30000) % activeAnimal.behaviors.length];
  if (activeBehavior) {
    hints.push(`Animals in this biome tend to be ${activeBehavior.toLowerCase()} around this time.`);
  }

  return hints[Math.floor(Date.now() / 10000) % Math.max(1, hints.length)] ?? 'Explore and observe carefully!';
}

// ---------------------------------------------------------------------------
// Exported Functions — Equipment
// ---------------------------------------------------------------------------

export function sxGetEquipment(): SxEquipment {
  return { ...ensureInit().equipment };
}

export function sxUpgradeBinoculars(): boolean {
  const s = ensureInit();
  if (s.equipment.binocularsLevel >= s.equipment.binocularsMaxLevel) return false;
  const cost = 300 * s.equipment.binocularsLevel;
  if (s.coins < cost) return false;
  s.coins -= cost;
  s.equipment.binocularsLevel++;
  return true;
}

export function sxUpgradeTracker(): boolean {
  const s = ensureInit();
  if (s.equipment.trackerLevel >= s.equipment.trackerMaxLevel) return false;
  const cost = 400 * s.equipment.trackerLevel;
  if (s.coins < cost) return false;
  s.coins -= cost;
  s.equipment.trackerLevel++;
  return true;
}

export function sxUseBait(baitType: string): boolean {
  const s = ensureInit();
  const count = s.equipment.baitCount[baitType];
  if (!count || count <= 0) return false;
  s.equipment.baitCount[baitType]--;
  return true;
}

export function sxBuyBait(baitType: string, amount: number): boolean {
  const s = ensureInit();
  if (!s.equipment.baitTypes.includes(baitType)) return false;
  const costs: Record<string, number> = { basic: 10, scented: 30, premium: 80 };
  const unitCost = costs[baitType] ?? 20;
  const totalCost = unitCost * amount;
  if (s.coins < totalCost) return false;
  s.coins -= totalCost;
  s.equipment.baitCount[baitType] = (s.equipment.baitCount[baitType] ?? 0) + amount;
  return true;
}

export function sxToggleScentMask(): boolean {
  const s = ensureInit();
  if (!s.equipment.scentMask) {
    if (s.coins < 500) return false;
    s.coins -= 500;
  }
  s.equipment.scentMask = !s.equipment.scentMask;
  return s.equipment.scentMask;
}

// ---------------------------------------------------------------------------
// Exported Functions — Journal
// ---------------------------------------------------------------------------

export function sxGetJournal(): SxJournalEntry[] {
  return [...ensureInit().journal].reverse();
}

export function sxAddJournalEntry(text: string): SxJournalEntry | null {
  const s = ensureInit();
  if (!s.currentExpedition) return null;

  const entry: SxJournalEntry = {
    id: `journal-${Date.now()}`,
    timestamp: Date.now(),
    biomeId: s.currentBiomeId,
    text,
    animalSightings: [...s.currentExpedition.animalsSpotted],
    photosCount: s.currentExpedition.photosTaken,
  };

  s.journal.push(entry);
  if (s.journal.length > 100) s.journal.shift();

  return { ...entry };
}

// ---------------------------------------------------------------------------
// Exported Functions — Vehicles (purchase)
// ---------------------------------------------------------------------------

export function sxPurchaseVehicle(vehicleId: string): boolean {
  const s = ensureInit();
  const vehicle = SX_VEHICLES.find(v => v.id === vehicleId);
  if (!vehicle) return false;
  if (s.ownedVehicles.includes(vehicleId)) return false;
  if (s.coins < vehicle.cost) return false;
  s.coins -= vehicle.cost;
  s.ownedVehicles.push(vehicleId);
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Utility
// ---------------------------------------------------------------------------

export function sxGetAllBehaviors(): AnimalBehavior[] {
  return [...ALL_BEHAVIORS];
}

export function sxGetRarityTierOrder(): RarityTier[] {
  return ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
}

export function sxGetAnimalById(animalId: string): SxAnimal | null {
  const animal = SX_ANIMALS.find(a => a.id === animalId);
  return animal ? { ...animal } : null;
}

export function sxGetBiomeById(biomeId: string): SxBiome | null {
  const biome = SX_BIOMES.find(b => b.id === biomeId);
  if (!biome) return null;
  const s = ensureInit();
  return { ...biome, unlocked: s.biomeStates[biomeId]?.unlocked ?? biome.unlocked };
}

export function sxGetBiomeAnimalsCount(biomeId: string): { total: number; discovered: number } {
  const biome = SX_BIOMES.find(b => b.id === biomeId);
  if (!biome) return { total: 0, discovered: 0 };
  const s = ensureInit();
  const discovered = biome.animalIds.filter(id => s.spottedAnimalIds.includes(id)).length;
  return { total: biome.animalIds.length, discovered };
}

export function sxGetTimeOfDayOptions(): { name: string; emoji: string; hourRange: string }[] {
  return SX_TIME_OF_DAY.map(t => ({ name: t.name, emoji: t.emoji, hourRange: t.hourRange }));
}

export function sxAdvanceTime(): { name: string; emoji: string; hourRange: string; index: number } {
  const s = ensureInit();
  s.timeOfDay = (s.timeOfDay + 1) % SX_TIME_OF_DAY.length;
  const tod = SX_TIME_OF_DAY[s.timeOfDay];
  return { name: tod.name, emoji: tod.emoji, hourRange: tod.hourRange, index: s.timeOfDay };
}

export function sxGetWeatherOptions(): SxWeather[] {
  return SX_WEATHERS.map(w => ({ ...w }));
}

export function sxSetWeather(weatherType: WeatherType): boolean {
  const s = ensureInit();
  const exists = SX_WEATHERS.some(w => w.type === weatherType);
  if (!exists) return false;
  s.currentWeather = weatherType;
  s.weatherTicks = 0;
  return true;
}

export function sxGetVehicleAccess(biomeId: string): SxVehicle[] {
  const s = ensureInit();
  return SX_VEHICLES.filter(v => s.ownedVehicles.includes(v.id) && v.terrainAccess.includes(biomeId))
    .map(v => ({ ...v, unlocked: true }));
}

export function sxGetGuideForBiome(biomeId: string): SxGuide | null {
  const s = ensureInit();
  const biome = SX_BIOMES.find(b => b.id === biomeId);
  if (!biome) return null;
  const animals = biome.animalIds.map(id => SX_ANIMALS.find(a => a.id === id)).filter((a): a is SxAnimal => a !== null);

  let bestGuideId = '';
  let bestMatch = 0;

  for (const guideId of s.hiredGuides) {
    const guide = SX_GUIDES.find(g => g.id === guideId);
    if (!guide) continue;
    let match = 0;
    if (guide.specialty === 'Tracking') match = animals.length * 2;
    if (guide.specialty === 'Birds') match = animals.filter(a => ['jgl_parrot', 'crl_turtle', 'vlc_eagle', 'arc_owl', 'bmb_pheasant', 'mng_heron'].includes(a.id)).length * 3;
    if (guide.specialty === 'Predators') match = animals.filter(a => a.dangerLevel >= 6).length * 3;
    if (guide.specialty === 'Marine') match = animals.filter(a => ['crl_turtle', 'crl_dolphin', 'crl_shark', 'crl_octopus', 'mng_crocodile'].includes(a.id)).length * 3;
    if (guide.specialty === 'Nocturnal') match = animals.filter(a => a.behavior === 'Nocturnal').length * 3;
    if (match > bestMatch) {
      bestMatch = match;
      bestGuideId = guideId;
    }
  }

  if (!bestGuideId) return null;
  const guide = SX_GUIDES.find(g => g.id === bestGuideId);
  return guide ? { ...guide, hired: true } : null;
}

export function sxGetFilteredPhotos(filters: { biome?: string; rarity?: RarityTier; minStars?: number; animalId?: string }): SxPhoto[] {
  const s = ensureInit();
  return s.photos.filter(p => {
    if (filters.biome && p.biome !== filters.biome) return false;
    if (filters.rarity && p.rarity !== filters.rarity) return false;
    if (filters.minStars && p.stars < filters.minStars) return false;
    if (filters.animalId && p.animalId !== filters.animalId) return false;
    return true;
  }).reverse();
}

export function sxGetPhotoStats(): { total: number; averageStars: number; fiveStarCount: number; byBiome: Record<string, number>; byRarity: Record<string, number> } {
  const s = ensureInit();
  const photos = s.photos;
  const total = photos.length;
  if (total === 0) {
    return { total: 0, averageStars: 0, fiveStarCount: 0, byBiome: {}, byRarity: {} };
  }
  const averageStars = Math.round((photos.reduce((sum, p) => sum + p.stars, 0) / total) * 10) / 10;
  const fiveStarCount = photos.filter(p => p.stars >= 5).length;

  const byBiome: Record<string, number> = {};
  const byRarity: Record<string, number> = {};
  for (const p of photos) {
    byBiome[p.biome] = (byBiome[p.biome] ?? 0) + 1;
    byRarity[p.rarity] = (byRarity[p.rarity] ?? 0) + 1;
  }

  return { total, averageStars, fiveStarCount, byBiome, byRarity };
}

export function sxGetWeatherEffect(behavior: AnimalBehavior): number {
  const s = ensureInit();
  const weather = SX_WEATHERS.find(w => w.type === s.currentWeather);
  return weather?.behaviorModifier[behavior] ?? 0;
}

export function sxGetSafariSummary(): { expeditionsCompleted: number; totalAnimalsSpotted: number; totalPhotos: number; favoriteBiome: string; currentLevel: number } {
  const s = ensureInit();

  const visitCounts: Record<string, number> = {};
  for (const [id, bs] of Object.entries(s.biomeStates)) {
    if (bs.timesVisited > 0) visitCounts[id] = bs.timesVisited;
  }

  let favoriteBiome = 'savanna';
  let maxVisits = 0;
  for (const [id, count] of Object.entries(visitCounts)) {
    if (count > maxVisits) {
      maxVisits = count;
      favoriteBiome = id;
    }
  }

  return {
    expeditionsCompleted: s.completedExpeditions,
    totalAnimalsSpotted: s.totalSpotted,
    totalPhotos: s.totalPhotos,
    favoriteBiome,
    currentLevel: s.level,
  };
}
