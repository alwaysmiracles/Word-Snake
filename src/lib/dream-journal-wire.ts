// ============================================================================
// Dream Journal Wire — Dream Journal & Exploration Game System
// SSR-safe: lazy init via ensureInit(). No module-level browser APIs.
// All exports prefixed `dj`. No `use*` functions (ESLint hooks rule).
// ============================================================================

// ---------------------------------------------------------------------------
// Types (inline, strict)
// ---------------------------------------------------------------------------

type DreamCategory =
  | "Adventure"
  | "Nightmare"
  | "Lucid"
  | "Flying"
  | "Falling"
  | "Romance"
  | "Mystery"
  | "Nostalgic"
  | "Epic"
  | "Surreal";

type DreamMood =
  | "Blissful"
  | "Peaceful"
  | "Neutral"
  | "Confused"
  | "Anxious"
  | "Fearful"
  | "Excited"
  | "Melancholic";

type DreamSymbolKey =
  | "water"
  | "flying"
  | "teeth"
  | "house"
  | "snake"
  | "mirror"
  | "door"
  | "fire"
  | "tree"
  | "mountain"
  | "ocean"
  | "bird"
  | "cat"
  | "dog"
  | "clock"
  | "key"
  | "bridge"
  | "garden"
  | "moon"
  | "star"
  | "storm"
  | "baby"
  | "death"
  | "car"
  | "road"
  | "forest"
  | "castle"
  | "shadow"
  | "light"
  | "music"
  | "book";

interface DreamSymbolDef {
  key: DreamSymbolKey;
  name: string;
  emoji: string;
  meaning: string;
  keywords: string[];
}

interface DreamEntry {
  id: string;
  title: string;
  content: string;
  mood: DreamMood;
  category: DreamCategory;
  tags: string[];
  date: string;
  symbols: DreamSymbolKey[];
  meaningScore: number;
  realmId: string | null;
  isLucid: boolean;
}

interface DreamInterpretation {
  symbols: { name: string; emoji: string; meaning: string }[];
  overallMeaning: string;
  advice: string;
  profoundity: number;
}

interface DreamRealmDef {
  id: string;
  name: string;
  emoji: string;
  theme: string;
  description: string;
  challenges: string[];
  rewards: string[];
  discoverRate: number;
  requiredLucidLevel: number;
  uniqueItems: string[];
}

interface DreamRealmState {
  id: string;
  discovered: boolean;
  visitCount: number;
  level: number;
  itemsFound: string[];
  lastVisited: string | null;
}

interface LucidAbilityDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requiredLevel: number;
  unlocked: boolean;
}

interface RealityCheckLog {
  type: string;
  count: number;
  lastPerformed: string | null;
}

interface DailyPromptEntry {
  topic: string;
  emoji: string;
  date: string;
  completed: boolean;
}

interface DailyChallengeEntry {
  description: string;
  category: DreamCategory | null;
  mood: DreamMood | null;
  reward: string;
  date: string;
  completed: boolean;
}

interface AchievementDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedDate: string | null;
}

type MasteryRankTitle =
  | "Dreamer"
  | "Oneirologist"
  | "Dreamwalker"
  | "Dreamweaver"
  | "Dreamlord";

interface MasteryRank {
  title: MasteryRankTitle;
  emoji: string;
  level: number;
  nextTitle: MasteryRankTitle | null;
  progressToNext: number;
}

interface SleepDayEntry {
  date: string;
  quality: number;
  dreamCount: number;
  mood: DreamMood | null;
  lucid: boolean;
}

interface DreamJournalState {
  dreams: DreamEntry[];
  realms: Record<string, DreamRealmState>;
  lucidLevel: number;
  lucidXP: number;
  unlockedAbilities: string[];
  realityChecks: RealityCheckLog[];
  streak: number;
  lastDreamDate: string | null;
  dailyPrompt: DailyPromptEntry | null;
  dailyChallenge: DailyChallengeEntry | null;
  achievements: Record<string, AchievementDef>;
  sleepHistory: SleepDayEntry[];
  totalDreamsRecorded: number;
  totalRealmsDiscovered: number;
  totalLucidDreams: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_DREAMS = 50;

const DREAM_CATEGORIES: { name: DreamCategory; emoji: string }[] = [
  { name: "Adventure", emoji: "⚔️" },
  { name: "Nightmare", emoji: "👻" },
  { name: "Lucid", emoji: "👁️" },
  { name: "Flying", emoji: "🦅" },
  { name: "Falling", emoji: "🕳️" },
  { name: "Romance", emoji: "💕" },
  { name: "Mystery", emoji: "🔮" },
  { name: "Nostalgic", emoji: "📷" },
  { name: "Epic", emoji: "🐉" },
  { name: "Surreal", emoji: "🌀" },
];

const DREAM_MOODS: { name: DreamMood; emoji: string }[] = [
  { name: "Blissful", emoji: "😊" },
  { name: "Peaceful", emoji: "😌" },
  { name: "Neutral", emoji: "😐" },
  { name: "Confused", emoji: "😕" },
  { name: "Anxious", emoji: "😟" },
  { name: "Fearful", emoji: "😱" },
  { name: "Excited", emoji: "🤩" },
  { name: "Melancholic", emoji: "😢" },
];

const DREAM_SYMBOLS: DreamSymbolDef[] = [
  { key: "water", name: "Water", emoji: "💧", meaning: "Represents emotions and the subconscious mind", keywords: ["water", "ocean", "rain", "river", "lake", "swim", "swimming", "drown", "flood", "wave"] },
  { key: "flying", name: "Flying", emoji: "🕊️", meaning: "Symbolizes freedom, ambition, and transcending limitations", keywords: ["fly", "flying", "soar", "wings", "sky", "float", "floating", "air"] },
  { key: "teeth", name: "Teeth", emoji: "🦷", meaning: "Indicates anxiety about appearance or loss of control", keywords: ["teeth", "tooth", "lose teeth", "broken teeth", "dentist"] },
  { key: "house", name: "House", emoji: "🏠", meaning: "Represents the self, psyche, or different aspects of personality", keywords: ["house", "home", "room", "building", "apartment", "door"] },
  { key: "snake", name: "Snake", emoji: "🐍", meaning: "Signifies transformation, hidden fears, or temptation", keywords: ["snake", "serpent", "slither", "venom"] },
  { key: "mirror", name: "Mirror", emoji: "🪞", meaning: "Reflects self-image, truth, and introspection", keywords: ["mirror", "reflection", "reflect", "glass"] },
  { key: "door", name: "Door", emoji: "🚪", meaning: "Represents new opportunities or transitions in life", keywords: ["door", "doorway", "entrance", "gate", "threshold", "portal"] },
  { key: "fire", name: "Fire", emoji: "🔥", meaning: "Symbolizes passion, transformation, anger, or purification", keywords: ["fire", "flame", "burn", "blaze", "inferno", "ash"] },
  { key: "tree", name: "Tree", emoji: "🌳", meaning: "Represents growth, life, stability, and connection to roots", keywords: ["tree", "forest", "branch", "root", "leaf", "leaves"] },
  { key: "mountain", name: "Mountain", emoji: "🏔️", meaning: "Signifies challenges, ambition, and spiritual ascension", keywords: ["mountain", "climb", "peak", "summit", "hill"] },
  { key: "ocean", name: "Ocean", emoji: "🌊", meaning: "Represents vast emotions, the unconscious, and depth of feeling", keywords: ["ocean", "sea", "deep", "beach", "shore", "tide", "whale"] },
  { key: "bird", name: "Bird", emoji: "🐦", meaning: "Symbolizes freedom, perspective, and spiritual messages", keywords: ["bird", "eagle", "sparrow", "crow", "nest", "feather"] },
  { key: "cat", name: "Cat", emoji: "🐱", meaning: "Represents independence, intuition, and the feminine spirit", keywords: ["cat", "kitten", "feline", "purr"] },
  { key: "dog", name: "Dog", emoji: "🐕", meaning: "Signifies loyalty, friendship, and unconditional love", keywords: ["dog", "puppy", "hound", "bark"] },
  { key: "clock", name: "Clock", emoji: "🕐", meaning: "Represents urgency, mortality, and the passage of time", keywords: ["clock", "time", "watch", "hour", "minute", "tick"] },
  { key: "key", name: "Key", emoji: "🗝️", meaning: "Symbolizes solutions, hidden knowledge, and access to secrets", keywords: ["key", "unlock", "lock", "locked", "open"] },
  { key: "bridge", name: "Bridge", emoji: "🌉", meaning: "Represents transition, connection, and overcoming obstacles", keywords: ["bridge", "cross", "span", "connect"] },
  { key: "garden", name: "Garden", emoji: "🌷", meaning: "Symbolizes inner growth, fertility, and personal paradise", keywords: ["garden", "flower", "bloom", "blossom", "plant", "rose"] },
  { key: "moon", name: "Moon", emoji: "🌙", meaning: "Represents femininity, intuition, cycles, and the unconscious", keywords: ["moon", "lunar", "crescent", "night sky"] },
  { key: "star", name: "Star", emoji: "⭐", meaning: "Signifies hope, guidance, aspirations, and destiny", keywords: ["star", "stars", "constellation", "shooting star"] },
  { key: "storm", name: "Storm", emoji: "⛈️", meaning: "Represents emotional turmoil, conflict, and cleansing", keywords: ["storm", "thunder", "lightning", "rain", "wind", "tornado"] },
  { key: "baby", name: "Baby", emoji: "👶", meaning: "Symbolizes new beginnings, vulnerability, and potential", keywords: ["baby", "infant", "child", "newborn", "birth"] },
  { key: "death", name: "Death", emoji: "💀", meaning: "Represents transformation, endings, and new beginnings", keywords: ["death", "die", "dying", "grave", "cemetery", "funeral"] },
  { key: "car", name: "Car", emoji: "🚗", meaning: "Signifies life direction, control, and personal drive", keywords: ["car", "drive", "driving", "vehicle", "road", "highway"] },
  { key: "road", name: "Road", emoji: "🛤️", meaning: "Represents life journey, choices, and path forward", keywords: ["road", "path", "way", "journey", "trail", "direction"] },
  { key: "forest", name: "Forest", emoji: "🌲", meaning: "Symbolizes the unconscious mind and personal exploration", keywords: ["forest", "woods", "deep", "dark woods", "wilderness"] },
  { key: "castle", name: "Castle", emoji: "🏰", meaning: "Represents ambitions, goals, and the inner fortress of the mind", keywords: ["castle", "palace", "fortress", "tower", "kingdom"] },
  { key: "shadow", name: "Shadow", emoji: "👤", meaning: "Signifies hidden aspects, fears, and the unknown self", keywords: ["shadow", "dark", "darkness", "silhouette", "figure"] },
  { key: "light", name: "Light", emoji: "💡", meaning: "Represents awareness, hope, truth, and enlightenment", keywords: ["light", "bright", "glow", "shine", "sun", "illuminate"] },
  { key: "music", name: "Music", emoji: "🎵", meaning: "Symbolizes harmony, emotion, and the rhythm of life", keywords: ["music", "song", "sing", "melody", "rhythm", "dance"] },
  { key: "book", name: "Book", emoji: "📖", meaning: "Represents knowledge, wisdom, and life chapters", keywords: ["book", "read", "reading", "story", "page", "library"] },
];

const DREAM_REALMS: DreamRealmDef[] = [
  {
    id: "crystal-caverns",
    name: "Crystal Caverns",
    emoji: "💎",
    theme: "Luminous underground caves filled with refracting crystals",
    description: "A subterranean wonderland where crystalline formations hum with ancient energy and cast prismatic light across vast chambers.",
    challenges: ["Navigate the Crystal Maze", "Harmonize with Crystal Resonance", "Find the Heart Crystal"],
    rewards: ["Crystal Lens (enhanced perception)", "Prismatic Shard", "Crystal Tuning Fork"],
    discoverRate: 0.12,
    requiredLucidLevel: 1,
    uniqueItems: ["Crystal Lens", "Prismatic Shard", "Crystal Tuning Fork"],
  },
  {
    id: "sky-islands",
    name: "Sky Islands",
    emoji: "🏝️",
    theme: "Floating islands above an endless cloud sea",
    description: "Jagged islands drift serenely through an ocean of clouds, connected by rainbow bridges and ancient wind currents.",
    challenges: ["Cross the Bridge of Winds", "Tame the Sky Whale", "Reach the Highest Peak"],
    rewards: ["Cloud Compass", "Wind Rider Cloak", "Sky Pearl"],
    discoverRate: 0.10,
    requiredLucidLevel: 2,
    uniqueItems: ["Cloud Compass", "Wind Rider Cloak", "Sky Pearl"],
  },
  {
    id: "shadow-maze",
    name: "Shadow Maze",
    emoji: "🌑",
    theme: "A labyrinth of shifting darkness and hidden paths",
    description: "Walls of solidified shadow rearrange endlessly in this perplexing labyrinth where only inner light can guide you.",
    challenges: ["Escape the Shadow Loop", "Face Your Shadow Self", "Find the Light Source"],
    rewards: ["Shadow Cloak", "Lantern of Truth", "Shadow Fragment"],
    discoverRate: 0.08,
    requiredLucidLevel: 3,
    uniqueItems: ["Shadow Cloak", "Lantern of Truth", "Shadow Fragment"],
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    emoji: "🌊",
    theme: "Bioluminescent underwater kingdoms beneath crushing pressure",
    description: "An alien underwater realm where bioluminescent creatures light up ancient coral cities deep beneath the waves.",
    challenges: ["Survive the Pressure Gauntlet", "Communicate with the Leviathan", "Find the Sunken Library"],
    rewards: ["Abyssal Pearl", "Pressure Stone", "Aquatic Breathing Amulet"],
    discoverRate: 0.09,
    requiredLucidLevel: 4,
    uniqueItems: ["Abyssal Pearl", "Pressure Stone", "Aquatic Breathing Amulet"],
  },
  {
    id: "flame-gardens",
    name: "Flame Gardens",
    emoji: "🔥",
    theme: "Ethereal gardens of living fire and blooming embers",
    description: "Flowers of pure flame bloom in eternal sunset, their petals casting warm light across paths of cooling obsidian.",
    challenges: ["Walk the Ember Path", "Tend the Eternal Flame", "Befriend the Phoenix"],
    rewards: ["Fire Blossom Seed", "Ember Wand", "Phoenix Feather"],
    discoverRate: 0.07,
    requiredLucidLevel: 5,
    uniqueItems: ["Fire Blossom Seed", "Ember Wand", "Phoenix Feather"],
  },
  {
    id: "ice-palace",
    name: "Ice Palace",
    emoji: "❄️",
    theme: "A crystalline palace of eternal winter and frozen music",
    description: "Towers of perfectly clear ice reach skyward, resonating with crystalline chimes that play hauntingly beautiful melodies.",
    challenges: ["Solve the Ice Riddles", "Navigate the Frozen Lake", "Awaken the Ice Queen"],
    rewards: ["Frost Crystal", "Ice Skates of Speed", "Winter Crown"],
    discoverRate: 0.06,
    requiredLucidLevel: 7,
    uniqueItems: ["Frost Crystal", "Ice Skates of Speed", "Winter Crown"],
  },
  {
    id: "forest-whispers",
    name: "Forest Whispers",
    emoji: "🌿",
    theme: "An ancient sentient forest that speaks in rustling leaves",
    description: "Towering sentient trees communicate through rustling leaves, sharing ancient wisdom with those patient enough to listen.",
    challenges: ["Learn the Forest Language", "Find the Elder Tree", "Heal the Wounded Grove"],
    rewards: ["Whispering Leaf", "Elder Seed", "Green Thumb Charm"],
    discoverRate: 0.11,
    requiredLucidLevel: 3,
    uniqueItems: ["Whispering Leaf", "Elder Seed", "Green Thumb Charm"],
  },
  {
    id: "desert-mirages",
    name: "Desert Mirages",
    emoji: "🏜️",
    theme: "Shifting desert landscapes of illusion and hidden oases",
    description: "Endless dunes create mirages that become real when believed in, revealing hidden oases and ancient buried temples.",
    challenges: ["Distinguish Reality from Mirage", "Find the Hidden Oasis", "Enter the Buried Temple"],
    rewards: ["Mirage Sand", "Oasis Water Flask", "Desert Scarab"],
    discoverRate: 0.07,
    requiredLucidLevel: 6,
    uniqueItems: ["Mirage Sand", "Oasis Water Flask", "Desert Scarab"],
  },
  {
    id: "starlight-void",
    name: "Starlight Void",
    emoji: "✨",
    theme: "A cosmic expanse where thoughts become constellations",
    description: "Float through an infinite cosmos where every thought manifests as a new star, forming constellations of memories and dreams.",
    challenges: ["Shape Your Constellation", "Navigate the Nebula", "Meet the Star Keeper"],
    rewards: ["Star Dust Vial", "Constellation Map", "Cosmic Compass"],
    discoverRate: 0.05,
    requiredLucidLevel: 10,
    uniqueItems: ["Star Dust Vial", "Constellation Map", "Cosmic Compass"],
  },
  {
    id: "clockwork-city",
    name: "Clockwork City",
    emoji: "⚙️",
    theme: "A mechanical metropolis powered by dreams and gears",
    description: "Brass and crystal towers tick with impossible precision in a city where every gear is powered by captured dream energy.",
    challenges: ["Fix the Grand Clock", "Escape the Time Loop", "Meet the Dream Engineer"],
    rewards: ["Clockwork Key", "Time Gear", "Dream Battery"],
    discoverRate: 0.06,
    requiredLucidLevel: 8,
    uniqueItems: ["Clockwork Key", "Time Gear", "Dream Battery"],
  },
  {
    id: "mushroom-grove",
    name: "Mushroom Grove",
    emoji: "🍄",
    theme: "A psychedelic forest of giant sentient mushrooms",
    description: "Colossal bioluminescent mushrooms tower overhead, their caps forming a psychedelic canopy that pulses with otherworldly light.",
    challenges: ["Navigate the Spore Clouds", "Find the Ancient Mycelium", "Attend the Mushroom Festival"],
    rewards: ["Glowing Spore", "Mycelium Map", "Fungal Shield"],
    discoverRate: 0.08,
    requiredLucidLevel: 4,
    uniqueItems: ["Glowing Spore", "Mycelium Map", "Fungal Shield"],
  },
  {
    id: "thunder-peaks",
    name: "Thunder Peaks",
    emoji: "⚡",
    theme: "Mountain summits where lightning storms are eternal",
    description: "Jagged mountain peaks pierce through an eternal thunderstorm, where lightning bolts dance between ancient stone pylons.",
    challenges: ["Climb the Lightning Rod", "Channel the Storm", "Reach the Eye of the Storm"],
    rewards: ["Lightning Shard", "Storm Caller Staff", "Thunder Crown"],
    discoverRate: 0.05,
    requiredLucidLevel: 12,
    uniqueItems: ["Lightning Shard", "Storm Caller Staff", "Thunder Crown"],
  },
];

const LUCID_ABILITIES: LucidAbilityDef[] = [
  { id: "awareness", name: "Dream Awareness", emoji: "👁️", description: "Recognize you are dreaming more frequently", requiredLevel: 2, unlocked: false },
  { id: "control-scene", name: "Scene Control", emoji: "🎭", description: "Change the dream environment around you", requiredLevel: 5, unlocked: false },
  { id: "summon", name: "Summon Objects", emoji: "✋", description: "Manifest objects and people in dreams", requiredLevel: 8, unlocked: false },
  { id: "time-bend", name: "Time Bending", emoji: "⏳", description: "Slow down, speed up, or reverse dream time", requiredLevel: 12, unlocked: false },
  { id: "teleport", name: "Dream Teleport", emoji: "🌀", description: "Instantly travel between dream locations", requiredLevel: 16, unlocked: false },
  { id: "master", name: "Dream Mastery", emoji: "👑", description: "Full control over every aspect of dreams", requiredLevel: 20, unlocked: false },
];

const REALITY_CHECK_TYPES: string[] = [
  "finger-count",
  "text-read",
  "clock-check",
  "breath-pinch",
  "mirror-look",
  "hand-inspect",
  "light-switch",
  "gravity-test",
  "memory-check",
  "nose-pinch",
];

const DAILY_PROMPTS: { topic: string; emoji: string }[] = [
  { topic: "A place you visited as a child", emoji: "🧒" },
  { topic: "Flying over your hometown", emoji: "🦅" },
  { topic: "A conversation with an animal", emoji: "🦊" },
  { topic: "Finding a hidden door", emoji: "🚪" },
  { topic: "Being lost in a magical forest", emoji: "🌲" },
  { topic: "Receiving a mysterious gift", emoji: "🎁" },
  { topic: "Swimming in a sky full of stars", emoji: "🌊" },
  { topic: "Meeting a future version of yourself", emoji: "🪞" },
  { topic: "Exploring an underwater city", emoji: "🏙️" },
  { topic: "A garden that blooms at midnight", emoji: "🌙" },
  { topic: "Chasing something you can never catch", emoji: "🏃" },
  { topic: "A room that changes every time you enter", emoji: "🔄" },
  { topic: "Walking on clouds", emoji: "☁️" },
  { topic: "A feast with imaginary friends", emoji: "🍽️" },
  { topic: "Finding a book that writes itself", emoji: "📖" },
  { topic: "A bridge between two worlds", emoji: "🌈" },
  { topic: "An elevator that goes sideways", emoji: "🏢" },
  { topic: "Singing with the moon", emoji: "🎵" },
  { topic: "A color that doesn't exist", emoji: "🎨" },
  { topic: "Waking up inside your dream", emoji: "💫" },
  { topic: "A train that travels through time", emoji: "🚂" },
  { topic: "Discovering a secret underground lake", emoji: "💎" },
  { topic: "Dancing in a thunderstorm", emoji: "⚡" },
  { topic: "A staircase that spirals infinitely", emoji: "🌀" },
  { topic: "A marketplace in the clouds", emoji: "🛒" },
  { topic: "Playing chess with a shadow", emoji: "♟️" },
  { topic: "An island made of candy", emoji: "🍬" },
  { topic: "Riding a giant friendly spider", emoji: "🕷️" },
  { topic: "A library with books about your life", emoji: "📚" },
  { topic: "Watching the sunrise from space", emoji: "🌅" },
  { topic: "A phone that calls the future", emoji: "📞" },
];

const DAILY_CHALLENGES: { description: string; category: DreamCategory | null; mood: DreamMood | null; reward: string }[] = [
  { description: "Record a dream about flying", category: "Flying", mood: null, reward: "🪶 Flight Feather" },
  { description: "Capture a peaceful dream", category: null, mood: "Peaceful", reward: "🕊️ Peace Charm" },
  { description: "Document an adventure dream", category: "Adventure", mood: null, reward: "🗺️ Adventure Map" },
  { description: "Face and record a nightmare", category: "Nightmare", mood: null, reward: "🛡️ Bravery Badge" },
  { description: "Record a lucid dream experience", category: "Lucid", mood: null, reward: "👁️ Awareness Crystal" },
  { description: "Capture a romantic dream", category: "Romance", mood: null, reward: "💗 Heart Gem" },
  { description: "Document something surreal", category: "Surreal", mood: null, reward: "🌀 Reality Fragment" },
  { description: "Record a nostalgic dream", category: "Nostalgic", mood: null, reward: "📷 Memory Photo" },
  { description: "Capture a blissful experience", category: null, mood: "Blissful", reward: "☀️ Joy Stone" },
  { description: "Document an epic dream battle", category: "Epic", mood: "Excited", reward: "⚔️ Hero's Medal" },
  { description: "Record a mysterious dream", category: "Mystery", mood: null, reward: "🔍 Mystery Key" },
  { description: "Capture a dream with a falling sensation", category: "Falling", mood: "Anxious", reward: "🌪️ Wind Talisman" },
];

const ACHIEVEMENT_DEFS: { id: string; name: string; emoji: string; description: string; condition: string; maxProgress: number }[] = [
  { id: "first-dream", name: "First Dream", emoji: "💭", description: "Record your very first dream", condition: "Record 1 dream", maxProgress: 1 },
  { id: "dreamer-x5", name: "Dreamer", emoji: "📝", description: "Record 5 dreams", condition: "Record 5 dreams", maxProgress: 5 },
  { id: "dreamer-x10", name: "Dream Collector", emoji: "📚", description: "Record 10 dreams", condition: "Record 10 dreams", maxProgress: 10 },
  { id: "dreamer-x25", name: "Dream Archivist", emoji: "🗄️", description: "Record 25 dreams", condition: "Record 25 dreams", maxProgress: 25 },
  { id: "dreamer-x50", name: "Dream Encyclopedia", emoji: "📖", description: "Record 50 dreams", condition: "Record 50 dreams", maxProgress: 50 },
  { id: "lucid-first", name: "Awakened", emoji: "👁️", description: "Record your first lucid dream", condition: "Record 1 lucid dream", maxProgress: 1 },
  { id: "lucid-x10", name: "Lucid Dreamer", emoji: "🌟", description: "Record 10 lucid dreams", condition: "Record 10 lucid dreams", maxProgress: 10 },
  { id: "lucid-master", name: "Lucid Master", emoji: "🧠", description: "Reach lucid dream level 20", condition: "Max lucid level", maxProgress: 20 },
  { id: "realm-first", name: "Realm Discovery", emoji: "🗺️", description: "Discover your first dream realm", condition: "Discover 1 realm", maxProgress: 1 },
  { id: "realm-x6", name: "Explorer", emoji: "🧭", description: "Discover 6 dream realms", condition: "Discover 6 realms", maxProgress: 6 },
  { id: "realm-x12", name: "Realm Master", emoji: "🌍", description: "Discover all 12 dream realms", condition: "Discover 12 realms", maxProgress: 12 },
  { id: "streak-3", name: "Consistent Dreamer", emoji: "📅", description: "Maintain a 3-day dream streak", condition: "3-day streak", maxProgress: 3 },
  { id: "streak-7", name: "Weekly Dreamer", emoji: "🗓️", description: "Maintain a 7-day dream streak", condition: "7-day streak", maxProgress: 7 },
  { id: "streak-14", name: "Biweekly Dreamer", emoji: "📆", description: "Maintain a 14-day dream streak", condition: "14-day streak", maxProgress: 14 },
  { id: "streak-30", name: "Monthly Dreamer", emoji: "🏅", description: "Maintain a 30-day dream streak", condition: "30-day streak", maxProgress: 30 },
  { id: "all-categories", name: "Category Master", emoji: "🏷️", description: "Record dreams in all 10 categories", condition: "All 10 categories", maxProgress: 10 },
  { id: "all-moods", name: "Mood Explorer", emoji: "🎭", description: "Record dreams with all 8 moods", condition: "All 8 moods", maxProgress: 8 },
  { id: "reality-x10", name: "Reality Checker", emoji: "✋", description: "Perform 10 reality checks", condition: "10 reality checks", maxProgress: 10 },
  { id: "symbol-hunter", name: "Symbol Hunter", emoji: "🔍", description: "Encounter 20 unique dream symbols", condition: "20 unique symbols", maxProgress: 20 },
  { id: "sleep-excellent", name: "Perfect Sleep", emoji: "😴", description: "Achieve sleep quality of 90+", condition: "Sleep quality 90+", maxProgress: 1 },
];

const MASTERY_TIERS: { title: MasteryRankTitle; emoji: string; minDreams: number }[] = [
  { title: "Dreamer", emoji: "💤", minDreams: 0 },
  { title: "Oneirologist", emoji: "🔬", minDreams: 10 },
  { title: "Dreamwalker", emoji: "🚶", minDreams: 30 },
  { title: "Dreamweaver", emoji: "🕸️", minDreams: 60 },
  { title: "Dreamlord", emoji: "👑", minDreams: 100 },
];

const MOOD_QUALITY_MAP: Record<DreamMood, number> = {
  Blissful: 90,
  Peaceful: 80,
  Neutral: 60,
  Confused: 45,
  Anxious: 35,
  Fearful: 25,
  Excited: 85,
  Melancholic: 40,
};

// ---------------------------------------------------------------------------
// State — SSR-safe lazy init
// ---------------------------------------------------------------------------

let state: DreamJournalState | null = null;

function ensureInit(): DreamJournalState {
  if (state) return state;

  const today = new Date().toISOString().slice(0, 10);

  const realmStates: Record<string, DreamRealmState> = {};
  for (const realm of DREAM_REALMS) {
    realmStates[realm.id] = {
      id: realm.id,
      discovered: false,
      visitCount: 0,
      level: 0,
      itemsFound: [],
      lastVisited: null,
    };
  }

  const achievementStates: Record<string, AchievementDef> = {};
  for (const a of ACHIEVEMENT_DEFS) {
    achievementStates[a.id] = {
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      description: a.description,
      condition: a.condition,
      unlocked: false,
      progress: 0,
      maxProgress: a.maxProgress,
      unlockedDate: null,
    };
  }

  const realityChecks: RealityCheckLog[] = REALITY_CHECK_TYPES.map((type) => ({
    type,
    count: 0,
    lastPerformed: null,
  }));

  state = {
    dreams: [],
    realms: realmStates,
    lucidLevel: 1,
    lucidXP: 0,
    unlockedAbilities: [],
    realityChecks,
    streak: 0,
    lastDreamDate: null,
    dailyPrompt: null,
    dailyChallenge: null,
    achievements: achievementStates,
    sleepHistory: [],
    totalDreamsRecorded: 0,
    totalRealmsDiscovered: 0,
    totalLucidDreams: 0,
    createdAt: today,
  };

  return state;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return "dj-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function extractSymbols(content: string): DreamSymbolKey[] {
  const lower = content.toLowerCase();
  const found: DreamSymbolKey[] = [];
  for (const sym of DREAM_SYMBOLS) {
    for (const kw of sym.keywords) {
      if (lower.includes(kw)) {
        found.push(sym.key);
        break;
      }
    }
  }
  return found;
}

function computeMeaningScore(symbols: DreamSymbolKey[], mood: DreamMood): number {
  let score = 2;
  if (symbols.length >= 1) score += 0.5;
  if (symbols.length >= 3) score += 0.5;
  if (symbols.length >= 5) score += 0.5;
  const moodBoost: Record<DreamMood, number> = {
    Blissful: 0.5,
    Peaceful: 0.3,
    Neutral: 0,
    Confused: 0.4,
    Anxious: 0.3,
    Fearful: 0.6,
    Excited: 0.4,
    Melancholic: 0.5,
  };
  score += moodBoost[mood];
  return Math.min(5, Math.max(1, Math.round(score * 2) / 2));
}

function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.5));
}

function computeLucidLevelFromXP(xp: number): number {
  let level = 1;
  let totalXp = 0;
  while (totalXp + xpForLevel(level) <= xp && level < 20) {
    totalXp += xpForLevel(level);
    level++;
  }
  return level;
}

function generateRealmDream(s: DreamJournalState, realm: DreamRealmDef): DreamEntry {
  const moods: DreamMood[] = ["Blissful", "Peaceful", "Excited", "Neutral", "Confused"];
  const mood = moods[Math.floor(Math.random() * moods.length)];
  const contentOptions = [
    `Explored the ${realm.name} tonight. The ${realm.theme.toLowerCase()} surrounded me as I ventured deeper into the unknown. Colors shifted and sounds echoed through impossible spaces.`,
    `A vivid journey through ${realm.name}. I encountered strange challenges and found wonders beyond imagination. The experience felt profoundly real yet utterly dreamlike.`,
    `Visited the ${realm.name} again. This time I discovered new paths and hidden secrets within the ${realm.theme.toLowerCase()}. Each visit reveals more of its mystery.`,
  ];
  return {
    id: generateId(),
    title: `Journey to ${realm.name}`,
    content: contentOptions[Math.floor(Math.random() * contentOptions.length)],
    mood,
    category: "Adventure",
    tags: [realm.name, "realm", "exploration"],
    date: todayString(),
    symbols: extractSymbols(realm.theme + " " + realm.description),
    meaningScore: computeMeaningScore(extractSymbols(realm.theme), mood),
    realmId: realm.id,
    isLucid: false,
  };
}

function updateSleepHistory(s: DreamJournalState, date: string, quality: number, mood: DreamMood | null, lucid: boolean, dreamCount: number): void {
  const existing = s.sleepHistory.findIndex((d) => d.date === date);
  const entry: SleepDayEntry = { date, quality, dreamCount, mood, lucid };
  if (existing >= 0) {
    s.sleepHistory[existing] = entry;
  } else {
    s.sleepHistory.push(entry);
    s.sleepHistory.sort((a, b) => a.date.localeCompare(b.date));
    if (s.sleepHistory.length > 30) {
      s.sleepHistory = s.sleepHistory.slice(-30);
    }
  }
}

function computeSleepQuality(s: DreamJournalState, date: string): number {
  const dayDreams = s.dreams.filter((d) => d.date === date);
  if (dayDreams.length === 0) return 50;

  let quality = 50;
  for (const dream of dayDreams) {
    quality += (MOOD_QUALITY_MAP[dream.mood] - 50) * 0.15;
    if (dream.isLucid) quality += 3;
    if (dream.realmId) quality += 2;
  }
  quality += Math.min(s.lucidLevel * 0.5, 5);
  return Math.min(100, Math.max(0, Math.round(quality)));
}

function refreshDaily(s: DreamJournalState, date: string): void {
  const seed = dateSeed(date);
  const promptIdx = seed % DAILY_PROMPTS.length;
  const challengeIdx = (seed >> 4) % DAILY_CHALLENGES.length;
  const prompt = DAILY_PROMPTS[promptIdx];
  const challenge = DAILY_CHALLENGES[challengeIdx];

  if (!s.dailyPrompt || s.dailyPrompt.date !== date) {
    s.dailyPrompt = {
      topic: prompt.topic,
      emoji: prompt.emoji,
      date,
      completed: s.dailyPrompt?.date === date ? s.dailyPrompt.completed : false,
    };
  }
  if (!s.dailyChallenge || s.dailyChallenge.date !== date) {
    s.dailyChallenge = {
      description: challenge.description,
      category: challenge.category,
      mood: challenge.mood,
      reward: challenge.reward,
      date,
      completed: s.dailyChallenge?.date === date ? s.dailyChallenge.completed : false,
    };
  }
}

function updateStreak(s: DreamJournalState, date: string): void {
  if (s.lastDreamDate === date) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (s.lastDreamDate === yesterdayStr) {
    s.streak += 1;
  } else if (s.lastDreamDate !== date) {
    s.streak = 1;
  }
  s.lastDreamDate = date;
}

function checkAndUpdateAchievements(s: DreamJournalState): void {
  const totalDreams = s.totalDreamsRecorded;

  // Dream count achievements
  setAchievementProgress(s, "first-dream", totalDreams);
  setAchievementProgress(s, "dreamer-x5", totalDreams);
  setAchievementProgress(s, "dreamer-x10", totalDreams);
  setAchievementProgress(s, "dreamer-x25", totalDreams);
  setAchievementProgress(s, "dreamer-x50", totalDreams);

  // Lucid achievements
  setAchievementProgress(s, "lucid-first", s.totalLucidDreams);
  setAchievementProgress(s, "lucid-x10", s.totalLucidDreams);
  setAchievementProgress(s, "lucid-master", s.lucidLevel);

  // Realm achievements
  const discoveredCount = s.totalRealmsDiscovered;
  setAchievementProgress(s, "realm-first", discoveredCount);
  setAchievementProgress(s, "realm-x6", discoveredCount);
  setAchievementProgress(s, "realm-x12", discoveredCount);

  // Streak achievements
  setAchievementProgress(s, "streak-3", s.streak);
  setAchievementProgress(s, "streak-7", s.streak);
  setAchievementProgress(s, "streak-14", s.streak);
  setAchievementProgress(s, "streak-30", s.streak);

  // Category diversity
  const categoriesUsed = new Set(s.dreams.map((d) => d.category)).size;
  setAchievementProgress(s, "all-categories", categoriesUsed);

  // Mood diversity
  const moodsUsed = new Set(s.dreams.map((d) => d.mood)).size;
  setAchievementProgress(s, "all-moods", moodsUsed);

  // Reality checks
  const totalRC = s.realityChecks.reduce((sum, rc) => sum + rc.count, 0);
  setAchievementProgress(s, "reality-x10", totalRC);

  // Symbol hunter
  const uniqueSymbols = new Set(s.dreams.flatMap((d) => d.symbols)).size;
  setAchievementProgress(s, "symbol-hunter", uniqueSymbols);

  // Sleep quality
  if (s.sleepHistory.length > 0) {
    const lastQuality = s.sleepHistory[s.sleepHistory.length - 1].quality;
    if (lastQuality >= 90) {
      setAchievementProgress(s, "sleep-excellent", 1);
    }
  }
}

function setAchievementProgress(s: DreamJournalState, id: string, progress: number): void {
  const ach = s.achievements[id];
  if (!ach) return;
  const prevUnlocked = ach.unlocked;
  ach.progress = Math.min(progress, ach.maxProgress);
  if (ach.progress >= ach.maxProgress && !ach.unlocked) {
    ach.unlocked = true;
    ach.unlockedDate = todayString();
  }
}

// ---------------------------------------------------------------------------
// 1. State Functions
// ---------------------------------------------------------------------------

export function djGetState(): DreamJournalState {
  const s = ensureInit();
  refreshDaily(s, todayString());
  return { ...s };
}

export function djResetState(): void {
  state = null;
}

// ---------------------------------------------------------------------------
// 2. Dream Journal Functions
// ---------------------------------------------------------------------------

export function djGetDreams(): DreamEntry[] {
  const s = ensureInit();
  return [...s.dreams].sort((a, b) => b.date.localeCompare(a.date));
}

export function djGetDream(id: string): DreamEntry | null {
  const s = ensureInit();
  return s.dreams.find((d) => d.id === id) ?? null;
}

export function djRecordDream(params: {
  title: string;
  content: string;
  mood: DreamMood;
  category: DreamCategory;
  tags?: string[];
  isLucid?: boolean;
  realmId?: string | null;
}): DreamEntry {
  const s = ensureInit();
  const date = todayString();
  const trimmedContent = params.content.trim();

  if (trimmedContent.length < 100) {
    throw new Error("Dream content must be at least 100 characters");
  }
  if (trimmedContent.length > 500) {
    throw new Error("Dream content must be at most 500 characters");
  }

  const symbols = extractSymbols(trimmedContent);
  const meaningScore = computeMeaningScore(symbols, params.mood);
  const isLucid = params.isLucid ?? false;
  const realmId = params.realmId ?? null;

  const dream: DreamEntry = {
    id: generateId(),
    title: params.title.trim(),
    content: trimmedContent,
    mood: params.mood,
    category: params.category,
    tags: params.tags ?? [],
    date,
    symbols,
    meaningScore,
    realmId,
    isLucid,
  };

  s.dreams.push(dream);
  if (s.dreams.length > MAX_DREAMS) {
    s.dreams.shift();
  }

  s.totalDreamsRecorded++;
  if (isLucid) s.totalLucidDreams++;

  updateStreak(s, date);

  // Lucid XP bonus for daily writing
  if (isLucid) {
    s.lucidXP += 15;
  }
  s.lucidXP += 5; // Base XP for recording
  s.lucidLevel = computeLucidLevelFromXP(s.lucidXP);

  const dayDreams = s.dreams.filter((d) => d.date === date);
  const dayLucid = dayDreams.some((d) => d.isLucid);
  const quality = computeSleepQuality(s, date);
  updateSleepHistory(s, date, quality, params.mood, dayLucid, dayDreams.length);

  refreshDaily(s, date);
  checkAndUpdateAchievements(s);

  return { ...dream };
}

export function djDeleteDream(id: string): boolean {
  const s = ensureInit();
  const idx = s.dreams.findIndex((d) => d.id === id);
  if (idx < 0) return false;
  s.dreams.splice(idx, 1);
  return true;
}

export function djGetDreamsByCategory(category: DreamCategory): DreamEntry[] {
  const s = ensureInit();
  return s.dreams.filter((d) => d.category === category).sort((a, b) => b.date.localeCompare(a.date));
}

export function djGetDreamsByMood(mood: DreamMood): DreamEntry[] {
  const s = ensureInit();
  return s.dreams.filter((d) => d.mood === mood).sort((a, b) => b.date.localeCompare(a.date));
}

export function djSearchDreams(query: string): DreamEntry[] {
  const s = ensureInit();
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return s.dreams.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function djGetDreamCount(): number {
  return ensureInit().dreams.length;
}

// ---------------------------------------------------------------------------
// 3. Dream Interpretation Functions
// ---------------------------------------------------------------------------

export function djGetSymbols(): DreamSymbolDef[] {
  return [...DREAM_SYMBOLS];
}

export function djGetSymbolMeaning(key: DreamSymbolKey): { name: string; emoji: string; meaning: string } | null {
  const sym = DREAM_SYMBOLS.find((s) => s.key === key);
  if (!sym) return null;
  return { name: sym.name, emoji: sym.emoji, meaning: sym.meaning };
}

export function djInterpretDream(dream: DreamEntry): DreamInterpretation {
  const matchedSymbols = dream.symbols
    .map((key) => DREAM_SYMBOLS.find((s) => s.key === key))
    .filter((s): s is DreamSymbolDef => !!s);

  const symbolReadings = matchedSymbols.map((s) => ({
    name: s.name,
    emoji: s.emoji,
    meaning: s.meaning,
  }));

  const moodThemes: Record<DreamMood, string> = {
    Blissful: "Your subconscious is in a state of harmony and fulfillment.",
    Peaceful: "Your inner world seeks and finds tranquility and balance.",
    Neutral: "A contemplative state — your mind is processing experiences evenly.",
    Confused: "Your subconscious is working through uncertainty and seeking clarity.",
    Anxious: "Underlying tensions are surfacing, asking for your attention and care.",
    Fearful: "Deep-seated fears are being processed by your dreaming mind.",
    Excited: "Your creative energy and enthusiasm are at a peak expression.",
    Melancholic: "Your heart is processing loss, longing, or bittersweet memories.",
  };

  const combinedAdvice: string[] = [];
  if (matchedSymbols.length === 0) {
    combinedAdvice.push("Consider keeping a symbol journal to track recurring themes in your dreams.");
  }
  if (dream.mood === "Fearful" || dream.mood === "Anxious") {
    combinedAdvice.push("Practice grounding techniques before bed to ease nighttime anxiety.");
  }
  if (dream.category === "Lucid" || dream.isLucid) {
    combinedAdvice.push("Your lucid awareness is growing — continue reality checks during the day.");
  }
  if (dream.symbols.length >= 3) {
    combinedAdvice.push("Your dreams are rich with symbolism — explore each symbol's deeper personal meaning.");
  }
  if (matchedSymbols.length > 0) {
    const primary = matchedSymbols[0];
    combinedAdvice.push(`The dominant symbol "${primary.name}" ${primary.emoji} suggests you should focus on ${primary.meaning.toLowerCase().split(".")[0]}.`);
  }

  const overallMeaning =
    matchedSymbols.length > 0
      ? `Your dream weaves together ${matchedSymbols.map((s) => `"${s.name}"`).join(", ")}, creating a narrative about ${matchedSymbols[0].meaning.toLowerCase().split(".")[0]}. ${moodThemes[dream.mood]}`
      : `${moodThemes[dream.mood]} While no standard symbols were detected, your dream carries personal significance that only you can fully interpret.`;

  return {
    symbols: symbolReadings,
    overallMeaning,
    advice: combinedAdvice.length > 0 ? combinedAdvice.join(" ") : "Keep recording your dreams to unlock deeper insights over time.",
    profoundity: dream.meaningScore,
  };
}

export function djGetDreamMeaningScore(dream: DreamEntry): number {
  return computeMeaningScore(dream.symbols, dream.mood);
}

export function djGetDailyInterpretation(): DreamInterpretation {
  const s = ensureInit();
  const date = todayString();
  refreshDaily(s, date);

  const dayDreams = s.dreams.filter((d) => d.date === date);
  if (dayDreams.length === 0) {
    return {
      symbols: [],
      overallMeaning: "No dreams recorded today yet. Record a dream to receive your daily interpretation.",
      advice: "Try writing about the last dream you remember, even fragments. Every detail matters.",
      profoundity: 0,
    };
  }

  const latestDream = dayDreams[dayDreams.length - 1];
  return djInterpretDream(latestDream);
}

// ---------------------------------------------------------------------------
// 4. Dream Realm Functions
// ---------------------------------------------------------------------------

export function djGetRealms(): { def: DreamRealmDef; state: DreamRealmState }[] {
  const s = ensureInit();
  return DREAM_REALMS.map((def) => ({
    def: { ...def },
    state: { ...s.realms[def.id] },
  }));
}

export function djGetRealm(id: string): { def: DreamRealmDef; state: DreamRealmState } | null {
  const s = ensureInit();
  const def = DREAM_REALMS.find((r) => r.id === id);
  if (!def) return null;
  return { def: { ...def }, state: { ...s.realms[id] } };
}

export function djDiscoverRealm(id: string): { def: DreamRealmDef; state: DreamRealmState; success: boolean } | null {
  const s = ensureInit();
  const def = DREAM_REALMS.find((r) => r.id === id);
  if (!def) return null;

  const realmState = s.realms[id];
  if (realmState.discovered) {
    return { def: { ...def }, state: { ...realmState }, success: false };
  }

  if (s.lucidLevel < def.requiredLucidLevel) {
    return { def: { ...def }, state: { ...realmState }, success: false };
  }

  const roll = Math.random();
  if (roll > def.discoverRate) {
    return { def: { ...def }, state: { ...realmState }, success: false };
  }

  realmState.discovered = true;
  realmState.visitCount = 1;
  realmState.level = 1;
  realmState.lastVisited = todayString();
  s.totalRealmsDiscovered++;

  s.lucidXP += 25;
  s.lucidLevel = computeLucidLevelFromXP(s.lucidXP);

  // Auto-generate a dream entry for this realm
  const realmDream = generateRealmDream(s, def);
  s.dreams.push(realmDream);
  if (s.dreams.length > MAX_DREAMS) s.dreams.shift();
  s.totalDreamsRecorded++;

  checkAndUpdateAchievements(s);

  return { def: { ...def }, state: { ...realmState }, success: true };
}

export function djVisitRealm(id: string): { state: DreamRealmState; rewards: string[] } | null {
  const s = ensureInit();
  const def = DREAM_REALMS.find((r) => r.id === id);
  if (!def) return null;

  const realmState = s.realms[id];
  if (!realmState.discovered) return null;

  realmState.visitCount++;
  realmState.level = Math.min(10, Math.floor(realmState.visitCount / 2) + 1);
  realmState.lastVisited = todayString();

  // Chance to find an item
  const foundItems: string[] = [];
  const unfoundItems = def.uniqueItems.filter((item) => !realmState.itemsFound.includes(item));
  if (unfoundItems.length > 0 && Math.random() < 0.3) {
    const item = unfoundItems[Math.floor(Math.random() * unfoundItems.length)];
    realmState.itemsFound.push(item);
    foundItems.push(item);
  }

  // XP for visiting
  s.lucidXP += 10;
  s.lucidLevel = computeLucidLevelFromXP(s.lucidXP);

  // Auto-generate dream entry for visit
  const realmDream = generateRealmDream(s, def);
  realmDream.realmId = id;
  s.dreams.push(realmDream);
  if (s.dreams.length > MAX_DREAMS) s.dreams.shift();
  s.totalDreamsRecorded++;

  const quality = computeSleepQuality(s, todayString());
  updateSleepHistory(s, todayString(), quality, realmDream.mood, false, s.dreams.filter((d) => d.date === todayString()).length);

  checkAndUpdateAchievements(s);

  return { state: { ...realmState }, rewards: foundItems };
}

export function djGetRealmProgress(id: string): { discovered: boolean; level: number; visits: number; itemsFound: number; totalItems: number } | null {
  const s = ensureInit();
  const def = DREAM_REALMS.find((r) => r.id === id);
  if (!def) return null;
  const rs = s.realms[id];
  return {
    discovered: rs.discovered,
    level: rs.level,
    visits: rs.visitCount,
    itemsFound: rs.itemsFound.length,
    totalItems: def.uniqueItems.length,
  };
}

export function djExploreRealm(id: string): {
  discovered: boolean;
  event: string;
  xpGained: number;
  itemsFound: string[];
  dreamGenerated: boolean;
} | null {
  const s = ensureInit();
  const def = DREAM_REALMS.find((r) => r.id === id);
  if (!def) return null;

  const realmState = s.realms[id];

  // If not discovered, attempt discovery
  if (!realmState.discovered) {
    if (s.lucidLevel < def.requiredLucidLevel) {
      return {
        discovered: false,
        event: `You need lucid level ${def.requiredLucidLevel} to discover ${def.name}. Current level: ${s.lucidLevel}.`,
        xpGained: 5,
        itemsFound: [],
        dreamGenerated: false,
      };
    }

    if (Math.random() < def.discoverRate) {
      realmState.discovered = true;
      realmState.visitCount = 1;
      realmState.level = 1;
      realmState.lastVisited = todayString();
      s.totalRealmsDiscovered++;
      s.lucidXP += 25;
      s.lucidLevel = computeLucidLevelFromXP(s.lucidXP);

      const realmDream = generateRealmDream(s, def);
      s.dreams.push(realmDream);
      if (s.dreams.length > MAX_DREAMS) s.dreams.shift();
      s.totalDreamsRecorded++;

      checkAndUpdateAchievements(s);

      return {
        discovered: true,
        event: `🎉 You discovered ${def.name}! ${def.description}`,
        xpGained: 25,
        itemsFound: [],
        dreamGenerated: true,
      };
    }

    return {
      discovered: false,
      event: `The mists of ${def.name} elude you for now. Keep practicing lucid dreaming to increase your chances.`,
      xpGained: 5,
      itemsFound: [],
      dreamGenerated: false,
    };
  }

  // Already discovered — explore deeper
  realmState.visitCount++;
  realmState.level = Math.min(10, Math.floor(realmState.visitCount / 2) + 1);
  realmState.lastVisited = todayString();

  const events = [
    `You encountered a mysterious ${def.theme.split(" ").slice(0, 2).join(" ")} deep within ${def.name}.`,
    `A hidden passage revealed itself in ${def.name}, leading to new discoveries.`,
    `The ${def.theme.split(" ")[0]} shifted around you, creating a new path to explore.`,
    `You felt a strange resonance within ${def.name} — your connection to this realm grows stronger.`,
    def.challenges[Math.floor(Math.random() * def.challenges.length)] + " presented itself as you explored.",
  ];

  const foundItems: string[] = [];
  const unfoundItems = def.uniqueItems.filter((item) => !realmState.itemsFound.includes(item));
  if (unfoundItems.length > 0 && Math.random() < 0.25) {
    const item = unfoundItems[Math.floor(Math.random() * unfoundItems.length)];
    realmState.itemsFound.push(item);
    foundItems.push(item);
  }

  const xp = 10 + realmState.level * 2;
  s.lucidXP += xp;
  s.lucidLevel = computeLucidLevelFromXP(s.lucidXP);

  const realmDream = generateRealmDream(s, def);
  realmDream.realmId = id;
  s.dreams.push(realmDream);
  if (s.dreams.length > MAX_DREAMS) s.dreams.shift();
  s.totalDreamsRecorded++;

  const quality = computeSleepQuality(s, todayString());
  updateSleepHistory(s, todayString(), quality, realmDream.mood, false, s.dreams.filter((d) => d.date === todayString()).length);

  checkAndUpdateAchievements(s);

  return {
    discovered: true,
    event: events[Math.floor(Math.random() * events.length)],
    xpGained: xp,
    itemsFound: foundItems,
    dreamGenerated: true,
  };
}

export function djGetDiscoveredRealms(): { def: DreamRealmDef; state: DreamRealmState }[] {
  const s = ensureInit();
  return DREAM_REALMS.filter((def) => s.realms[def.id].discovered).map((def) => ({
    def: { ...def },
    state: { ...s.realms[def.id] },
  }));
}

// ---------------------------------------------------------------------------
// 5. Lucid Dream Functions
// ---------------------------------------------------------------------------

export function djGetLucidLevel(): { level: number; xp: number; xpToNext: number; xpForCurrent: number } {
  const s = ensureInit();
  const level = s.lucidLevel;
  let totalXpForCurrent = 0;
  for (let i = 1; i < level; i++) {
    totalXpForCurrent += xpForLevel(i);
  }
  const xpToNext = level < 20 ? xpForLevel(level) : 0;
  const currentLevelXP = s.lucidXP - totalXpForCurrent;

  return {
    level,
    xp: s.lucidXP,
    xpToNext,
    xpForCurrent: currentLevelXP,
  };
}

export function djAddLucidXP(amount: number): { newLevel: number; newXP: number; leveledUp: boolean } {
  const s = ensureInit();
  const prevLevel = s.lucidLevel;
  s.lucidXP += amount;
  s.lucidLevel = computeLucidLevelFromXP(s.lucidXP);

  const leveledUp = s.lucidLevel > prevLevel;

  if (leveledUp) {
    for (const ability of LUCID_ABILITIES) {
      if (ability.requiredLevel <= s.lucidLevel && !s.unlockedAbilities.includes(ability.id)) {
        s.unlockedAbilities.push(ability.id);
      }
    }
  }

  checkAndUpdateAchievements(s);

  return { newLevel: s.lucidLevel, newXP: s.lucidXP, leveledUp };
}

export function djGetLucidAbilities(): LucidAbilityDef[] {
  const s = ensureInit();
  return LUCID_ABILITIES.map((a) => ({
    ...a,
    unlocked: s.unlockedAbilities.includes(a.id),
  }));
}

export function djUnlockAbility(id: string): LucidAbilityDef | null {
  const s = ensureInit();
  const ability = LUCID_ABILITIES.find((a) => a.id === id);
  if (!ability) return null;
  if (s.unlockedAbilities.includes(id)) return { ...ability, unlocked: true };
  if (s.lucidLevel < ability.requiredLevel) return { ...ability, unlocked: false };

  s.unlockedAbilities.push(id);
  checkAndUpdateAchievements(s);

  return { ...ability, unlocked: true };
}

export function djPerformRealityCheck(type: string): { success: boolean; totalChecks: number; xpGained: number } {
  const s = ensureInit();
  const rc = s.realityChecks.find((r) => r.type === type);
  if (!rc) return { success: false, totalChecks: 0, xpGained: 0 };

  rc.count++;
  rc.lastPerformed = todayString();
  const totalChecks = s.realityChecks.reduce((sum, r) => sum + r.count, 0);

  const xpGained = 3;
  s.lucidXP += xpGained;
  s.lucidLevel = computeLucidLevelFromXP(s.lucidXP);

  // Bonus XP for performing 5 different checks in one day
  const todayChecks = s.realityChecks.filter((r) => r.lastPerformed === todayString()).length;
  if (todayChecks >= 5) {
    s.lucidXP += 5;
    s.lucidLevel = computeLucidLevelFromXP(s.lucidXP);
  }

  checkAndUpdateAchievements(s);

  return { success: true, totalChecks, xpGained };
}

export function djGetRealityChecks(): RealityCheckLog[] {
  return ensureInit().realityChecks.map((rc) => ({ ...rc }));
}

// ---------------------------------------------------------------------------
// 6. Sleep Quality Functions
// ---------------------------------------------------------------------------

export function djGetSleepQuality(date?: string): number {
  const s = ensureInit();
  const target = date ?? todayString();
  const entry = s.sleepHistory.find((d) => d.date === target);
  if (entry) return entry.quality;
  return computeSleepQuality(s, target);
}

export function djGetSleepChart(days?: number): { date: string; quality: number; dreamCount: number }[] {
  const s = ensureInit();
  const count = days ?? 7;
  const result: { date: string; quality: number; dreamCount: number }[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = s.sleepHistory.find((h) => h.date === dateStr);
    result.push({
      date: dateStr,
      quality: entry ? entry.quality : computeSleepQuality(s, dateStr),
      dreamCount: entry ? entry.dreamCount : s.dreams.filter((dr) => dr.date === dateStr).length,
    });
  }

  return result;
}

export function djGetSleepPatterns(): {
  averageQuality: number;
  bestDay: string | null;
  worstDay: string | null;
  trend: "improving" | "declining" | "stable";
  lucidDreamRate: number;
  mostCommonMood: DreamMood | null;
  averageDreamsPerNight: number;
} {
  const s = ensureInit();
  if (s.sleepHistory.length === 0) {
    return {
      averageQuality: 50,
      bestDay: null,
      worstDay: null,
      trend: "stable",
      lucidDreamRate: 0,
      mostCommonMood: null,
      averageDreamsPerNight: 0,
    };
  }

  const total = s.sleepHistory.reduce((sum, d) => sum + d.quality, 0);
  const averageQuality = Math.round(total / s.sleepHistory.length);

  const best = s.sleepHistory.reduce((best, d) => (d.quality > best.quality ? d : best));
  const worst = s.sleepHistory.reduce((worst, d) => (d.quality < worst.quality ? d : worst));

  let trend: "improving" | "declining" | "stable" = "stable";
  if (s.sleepHistory.length >= 3) {
    const recent = s.sleepHistory.slice(-3);
    const older = s.sleepHistory.slice(-6, -3);
    if (older.length > 0) {
      const recentAvg = recent.reduce((sum, d) => sum + d.quality, 0) / recent.length;
      const olderAvg = older.reduce((sum, d) => sum + d.quality, 0) / older.length;
      if (recentAvg > olderAvg + 5) trend = "improving";
      else if (recentAvg < olderAvg - 5) trend = "declining";
    }
  }

  const lucidDreams = s.sleepHistory.filter((d) => d.lucid).length;
  const lucidDreamRate = Math.round((lucidDreams / s.sleepHistory.length) * 100);

  const moodCounts: Record<string, number> = {};
  for (const d of s.sleepHistory) {
    if (d.mood) {
      moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1;
    }
  }
  let mostCommonMood: DreamMood | null = null;
  let maxCount = 0;
  for (const [mood, count] of Object.entries(moodCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonMood = mood as DreamMood;
    }
  }

  const avgDreams = s.sleepHistory.reduce((sum, d) => sum + d.dreamCount, 0) / s.sleepHistory.length;

  return {
    averageQuality,
    bestDay: best.date,
    worstDay: worst.date,
    trend,
    lucidDreamRate,
    mostCommonMood,
    averageDreamsPerNight: Math.round(avgDreams * 10) / 10,
  };
}

export function djGetRecommendations(): { text: string; emoji: string; priority: "high" | "medium" | "low" }[] {
  const s = ensureInit();
  const recommendations: { text: string; emoji: string; priority: "high" | "medium" | "low" }[] = [];

  // Based on lucid level
  if (s.lucidLevel < 5) {
    recommendations.push({
      text: "Perform reality checks throughout the day to boost lucid dream frequency.",
      emoji: "✋",
      priority: "high",
    });
  }

  // Based on streak
  if (s.streak < 3) {
    recommendations.push({
      text: "Record dreams consistently to build your streak and earn bonus lucid XP.",
      emoji: "📝",
      priority: "high",
    });
  }

  // Based on mood patterns
  const recentDreams = s.dreams.slice(-10);
  const negativeDreams = recentDreams.filter((d) => d.mood === "Fearful" || d.mood === "Anxious" || d.mood === "Melancholic");
  if (negativeDreams.length > recentDreams.length * 0.5 && recentDreams.length >= 3) {
    recommendations.push({
      text: "Your recent dreams suggest underlying stress. Try meditation or calming activities before bed.",
      emoji: "🧘",
      priority: "high",
    });
  }

  // Based on realm exploration
  if (s.totalRealmsDiscovered < 3) {
    recommendations.push({
      text: "Explore dream realms by increasing your lucid dream level and recording more dreams.",
      emoji: "🗺️",
      priority: "medium",
    });
  }

  // Based on dream content length / richness
  const shortDreams = recentDreams.filter((d) => d.content.length < 200);
  if (shortDreams.length > recentDreams.length * 0.5 && recentDreams.length >= 3) {
    recommendations.push({
      text: "Try writing more detailed dream entries. Richer descriptions lead to deeper interpretations.",
      emoji: "✍️",
      priority: "medium",
    });
  }

  // Bedtime routine
  recommendations.push({
    text: "Maintain a consistent bedtime routine: dim lights 30 minutes before sleep, avoid screens.",
    emoji: "🌙",
    priority: "low",
  });

  // General tip
  recommendations.push({
    text: "Keep a dream journal by your bed and write down dreams immediately upon waking.",
    emoji: "📓",
    priority: "low",
  });

  // Lucid ability suggestion
  const nextAbility = LUCID_ABILITIES.find((a) => !s.unlockedAbilities.includes(a.id));
  if (nextAbility && s.lucidLevel >= nextAbility.requiredLevel - 2) {
    recommendations.push({
      text: `You're close to unlocking "${nextAbility.name}" ${nextAbility.emoji}! Keep practicing to reach lucid level ${nextAbility.requiredLevel}.`,
      emoji: "🎯",
      priority: "medium",
    });
  }

  return recommendations;
}

export function djGetDreamFrequency(): {
  totalDreams: number;
  averagePerWeek: number;
  thisWeek: number;
  lastWeek: number;
  mostProductiveDay: string;
  mostProductiveCount: number;
} {
  const s = ensureInit();
  const totalDreams = s.totalDreamsRecorded;
  const createdAt = s.createdAt ? new Date(s.createdAt) : new Date();
  const now = new Date();
  const daysSinceCreation = Math.max(1, Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
  const averagePerWeek = Math.round((totalDreams / daysSinceCreation) * 7 * 10) / 10;

  // This week
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  const thisWeek = s.dreams.filter((d) => new Date(d.date) >= thisWeekStart).length;

  // Last week
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeek = s.dreams.filter((d) => {
    const dd = new Date(d.date);
    return dd >= lastWeekStart && dd < thisWeekStart;
  }).length;

  // Most productive day of week
  const dayCounts: Record<string, number> = {};
  for (const dream of s.dreams) {
    const dayOfWeek = new Date(dream.date).toLocaleDateString("en-US", { weekday: "long" });
    dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
  }

  let mostProductiveDay = "N/A";
  let mostProductiveCount = 0;
  for (const [day, count] of Object.entries(dayCounts)) {
    if (count > mostProductiveCount) {
      mostProductiveDay = day;
      mostProductiveCount = count;
    }
  }

  return { totalDreams, averagePerWeek, thisWeek, lastWeek, mostProductiveDay, mostProductiveCount };
}

// ---------------------------------------------------------------------------
// 7. Daily Functions
// ---------------------------------------------------------------------------

export function djGetDailyPrompt(): DailyPromptEntry {
  const s = ensureInit();
  const date = todayString();
  refreshDaily(s, date);
  return { ...s.dailyPrompt! };
}

export function djGetDailyChallenge(): DailyChallengeEntry {
  const s = ensureInit();
  const date = todayString();
  refreshDaily(s, date);
  return { ...s.dailyChallenge! };
}

export function djCompleteDailyChallenge(): { completed: boolean; reward: string; xpGained: number } {
  const s = ensureInit();
  const date = todayString();
  refreshDaily(s, date);

  if (!s.dailyChallenge) return { completed: false, reward: "", xpGained: 0 };
  if (s.dailyChallenge.completed) return { completed: false, reward: "", xpGained: 0 };

  s.dailyChallenge.completed = true;
  const xpGained = 20;
  s.lucidXP += xpGained;
  s.lucidLevel = computeLucidLevelFromXP(s.lucidXP);

  checkAndUpdateAchievements(s);

  return { completed: true, reward: s.dailyChallenge.reward, xpGained };
}

export function djGetStreak(): { current: number; best: number; lastDreamDate: string | null; todayActive: boolean } {
  const s = ensureInit();
  const today = todayString();
  return {
    current: s.streak,
    best: Math.max(s.streak, (s.achievements["streak-30"]?.progress ?? 0)),
    lastDreamDate: s.lastDreamDate,
    todayActive: s.lastDreamDate === today,
  };
}

export function djCheckStreakMilestone(): { milestone: number; reached: boolean; reward: string }[] {
  const s = ensureInit();
  const milestones = [
    { milestone: 3, reward: "🌙 Dream Catcher Badge" },
    { milestone: 7, reward: "⭐ Week Warrior Badge" },
    { milestone: 14, reward: "🌟 Fortnight Phoenix Badge" },
    { milestone: 30, reward: "👑 Monthly Dreamlord Badge" },
  ];

  return milestones.map((m) => ({
    milestone: m.milestone,
    reached: s.streak >= m.milestone,
    reward: m.reward,
  }));
}

// ---------------------------------------------------------------------------
// 8. UI Helper Functions
// ---------------------------------------------------------------------------

export function djGetJournalOverview(): {
  totalDreams: number;
  recentDreams: DreamEntry[];
  topCategory: { name: string; emoji: string; count: number } | null;
  topMood: { name: string; emoji: string; count: number } | null;
  lucidCount: number;
  realmDreams: number;
  averageMeaningScore: number;
} {
  const s = ensureInit();
  const dreams = [...s.dreams].sort((a, b) => b.date.localeCompare(a.date));
  const recentDreams = dreams.slice(0, 5);

  const catCounts: Record<string, number> = {};
  const moodCounts: Record<string, number> = {};
  for (const d of s.dreams) {
    catCounts[d.category] = (catCounts[d.category] || 0) + 1;
    moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1;
  }

  let topCategory: { name: string; emoji: string; count: number } | null = null;
  for (const [name, count] of Object.entries(catCounts)) {
    if (!topCategory || count > topCategory.count) {
      const cat = DREAM_CATEGORIES.find((c) => c.name === name);
      topCategory = { name, emoji: cat?.emoji ?? "💭", count };
    }
  }

  let topMood: { name: string; emoji: string; count: number } | null = null;
  for (const [name, count] of Object.entries(moodCounts)) {
    if (!topMood || count > topMood.count) {
      const mood = DREAM_MOODS.find((m) => m.name === name);
      topMood = { name, emoji: mood?.emoji ?? "😐", count };
    }
  }

  const lucidCount = s.dreams.filter((d) => d.isLucid).length;
  const realmDreams = s.dreams.filter((d) => d.realmId !== null).length;
  const avgScore = s.dreams.length > 0 ? Math.round((s.dreams.reduce((sum, d) => sum + d.meaningScore, 0) / s.dreams.length) * 10) / 10 : 0;

  return {
    totalDreams: s.dreams.length,
    recentDreams,
    topCategory,
    topMood,
    lucidCount,
    realmDreams,
    averageMeaningScore: avgScore,
  };
}

export function djGetDreamCard(dream: DreamEntry): {
  title: string;
  mood: string;
  moodEmoji: string;
  category: string;
  categoryEmoji: string;
  date: string;
  symbols: { name: string; emoji: string }[];
  stars: string;
  starCount: number;
  isLucid: boolean;
  tags: string[];
  contentPreview: string;
} {
  const moodInfo = DREAM_MOODS.find((m) => m.name === dream.mood);
  const catInfo = DREAM_CATEGORIES.find((c) => c.name === dream.category);

  const symbolCards = dream.symbols
    .slice(0, 5)
    .map((key) => {
      const sym = DREAM_SYMBOLS.find((s) => s.key === key);
      return sym ? { name: sym.name, emoji: sym.emoji } : { name: key, emoji: "❓" };
    });

  const fullStars = Math.floor(dream.meaningScore);
  const halfStar = dream.meaningScore % 1 >= 0.5;
  let stars = "⭐".repeat(fullStars);
  if (halfStar) stars += "✨";

  return {
    title: dream.title,
    mood: dream.mood,
    moodEmoji: moodInfo?.emoji ?? "😐",
    category: dream.category,
    categoryEmoji: catInfo?.emoji ?? "💭",
    date: dream.date,
    symbols: symbolCards,
    stars,
    starCount: dream.meaningScore,
    isLucid: dream.isLucid,
    tags: dream.tags.slice(0, 4),
    contentPreview: dream.content.length > 120 ? dream.content.slice(0, 120) + "…" : dream.content,
  };
}

export function djGetRealmCard(id: string): {
  name: string;
  theme: string;
  emoji: string;
  level: number;
  discovered: boolean;
  visits: number;
  itemsFound: number;
  totalItems: number;
  requiredLevel: number;
  locked: boolean;
  description: string;
  lastVisited: string | null;
} | null {
  const s = ensureInit();
  const def = DREAM_REALMS.find((r) => r.id === id);
  if (!def) return null;
  const rs = s.realms[id];

  return {
    name: def.name,
    theme: def.theme,
    emoji: def.emoji,
    level: rs.level,
    discovered: rs.discovered,
    visits: rs.visitCount,
    itemsFound: rs.itemsFound.length,
    totalItems: def.uniqueItems.length,
    requiredLevel: def.requiredLucidLevel,
    locked: s.lucidLevel < def.requiredLucidLevel,
    description: def.description,
    lastVisited: rs.lastVisited,
  };
}

export function djGetInterpretationCard(dream: DreamEntry): {
  title: string;
  moodEmoji: string;
  categoryEmoji: string;
  symbols: { name: string; emoji: string; meaning: string }[];
  overallMeaning: string;
  advice: string;
  profoundity: number;
  profoundityEmoji: string;
  profoundityLabel: string;
} {
  const interp = djInterpretDream(dream);
  const moodInfo = DREAM_MOODS.find((m) => m.name === dream.mood);
  const catInfo = DREAM_CATEGORIES.find((c) => c.name === dream.category);

  let profoundityEmoji = "💭";
  let profoundityLabel = "Subtle";
  if (interp.profoundity >= 4) {
    profoundityEmoji = "🌟";
    profoundityLabel = "Profound";
  } else if (interp.profoundity >= 3) {
    profoundityEmoji = "✨";
    profoundityLabel = "Meaningful";
  } else if (interp.profoundity >= 2) {
    profoundityEmoji = "💡";
    profoundityLabel = "Noteworthy";
  }

  return {
    title: dream.title,
    moodEmoji: moodInfo?.emoji ?? "😐",
    categoryEmoji: catInfo?.emoji ?? "💭",
    symbols: interp.symbols,
    overallMeaning: interp.overallMeaning,
    advice: interp.advice,
    profoundity: interp.profoundity,
    profoundityEmoji,
    profoundityLabel,
  };
}

export function djGetSleepCard(): {
  quality: number;
  qualityEmoji: string;
  qualityLabel: string;
  chart: { date: string; quality: number; dreamCount: number }[];
  patterns: {
    averageQuality: number;
    trend: string;
    trendEmoji: string;
    mostCommonMood: string;
    lucidRate: number;
  };
  recommendations: { text: string; emoji: string }[];
} {
  const quality = djGetSleepQuality();
  const chart = djGetSleepChart(7);
  const patterns = djGetSleepPatterns();
  const recs = djGetRecommendations().slice(0, 3);

  let qualityEmoji = "😐";
  let qualityLabel = "Fair";
  if (quality >= 80) {
    qualityEmoji = "😊";
    qualityLabel = "Excellent";
  } else if (quality >= 65) {
    qualityEmoji = "😌";
    qualityLabel = "Good";
  } else if (quality >= 50) {
    qualityEmoji = "😐";
    qualityLabel = "Fair";
  } else if (quality >= 35) {
    qualityEmoji = "😟";
    qualityLabel = "Poor";
  } else {
    qualityEmoji = "😫";
    qualityLabel = "Restless";
  }

  const trendEmoji = patterns.trend === "improving" ? "📈" : patterns.trend === "declining" ? "📉" : "➡️";

  return {
    quality,
    qualityEmoji,
    qualityLabel,
    chart,
    patterns: {
      averageQuality: patterns.averageQuality,
      trend: patterns.trend,
      trendEmoji,
      mostCommonMood: patterns.mostCommonMood ?? "Unknown",
      lucidRate: patterns.lucidDreamRate,
    },
    recommendations: recs.map((r) => ({ text: r.text, emoji: r.emoji })),
  };
}

export function djGetDailyCard(): {
  prompt: { topic: string; emoji: string; completed: boolean };
  challenge: { description: string; reward: string; completed: boolean };
  streak: { current: number; emoji: string; label: string };
  quality: { score: number; emoji: string };
} {
  const s = ensureInit();
  const date = todayString();
  refreshDaily(s, date);

  const prompt = s.dailyPrompt!;
  const challenge = s.dailyChallenge!;

  let streakEmoji = "💤";
  let streakLabel = "Start recording!";
  if (s.streak >= 30) {
    streakEmoji = "👑";
    streakLabel = "Legendary!";
  } else if (s.streak >= 14) {
    streakEmoji = "🔥";
    streakLabel = "On fire!";
  } else if (s.streak >= 7) {
    streakEmoji = "⭐";
    streakLabel = "Great week!";
  } else if (s.streak >= 3) {
    streakEmoji = "📝";
    streakLabel = "Building up!";
  }

  const quality = djGetSleepQuality();
  const qualityEmoji = quality >= 80 ? "😊" : quality >= 60 ? "😌" : quality >= 40 ? "😐" : "😫";

  return {
    prompt: { topic: prompt.topic, emoji: prompt.emoji, completed: prompt.completed },
    challenge: { description: challenge.description, reward: challenge.reward, completed: challenge.completed },
    streak: { current: s.streak, emoji: streakEmoji, label: streakLabel },
    quality: { score: quality, emoji: qualityEmoji },
  };
}

export function djGetStatsGrid(): {
  cells: {
    label: string;
    value: string;
    emoji: string;
    sublabel: string;
  }[];
} {
  const s = ensureInit();
  const dreamCount = s.dreams.length;
  const discoveredCount = s.totalRealmsDiscovered;
  const lucidInfo = djGetLucidLevel();

  return {
    cells: [
      {
        label: "Dreams Recorded",
        value: String(dreamCount),
        emoji: "💭",
        sublabel: `${s.streak}-day streak`,
      },
      {
        label: "Lucid Level",
        value: String(lucidInfo.level),
        emoji: "👁️",
        sublabel: `XP: ${lucidInfo.xp}`,
      },
      {
        label: "Realms Found",
        value: `${discoveredCount}/12`,
        emoji: "🗺️",
        sublabel: `${discoveredCount} discovered`,
      },
      {
        label: "Current Streak",
        value: String(s.streak),
        emoji: "🔥",
        sublabel: s.streak >= 7 ? "Amazing!" : "Keep going!",
      },
    ],
  };
}

export function djGetAchievements(): AchievementDef[] {
  const s = ensureInit();
  return Object.values(s.achievements).map((a) => ({ ...a }));
}

export function djCheckAchievements(): { newlyUnlocked: AchievementDef[]; totalUnlocked: number; totalAchievements: number } {
  const s = ensureInit();
  const prevUnlocked = new Set(Object.values(s.achievements).filter((a) => a.unlocked).map((a) => a.id));

  checkAndUpdateAchievements(s);

  const currentUnlocked = Object.values(s.achievements).filter((a) => a.unlocked);
  const newlyUnlocked = currentUnlocked.filter((a) => !prevUnlocked.has(a.id));

  return {
    newlyUnlocked,
    totalUnlocked: currentUnlocked.length,
    totalAchievements: ACHIEVEMENT_DEFS.length,
  };
}

export function djGetMasteryRank(): MasteryRank {
  const s = ensureInit();
  const totalDreams = s.totalDreamsRecorded;

  let currentTier = MASTERY_TIERS[0];
  let nextTier: { title: MasteryRankTitle; emoji: string; minDreams: number } | null = null;

  for (let i = MASTERY_TIERS.length - 1; i >= 0; i--) {
    if (totalDreams >= MASTERY_TIERS[i].minDreams) {
      currentTier = MASTERY_TIERS[i];
      nextTier = i + 1 < MASTERY_TIERS.length ? MASTERY_TIERS[i + 1] : null;
      break;
    }
  }

  const progressToNext = nextTier
    ? Math.min(100, Math.round(((totalDreams - currentTier.minDreams) / (nextTier.minDreams - currentTier.minDreams)) * 100))
    : 100;

  return {
    title: currentTier.title,
    emoji: currentTier.emoji,
    level: totalDreams,
    nextTitle: nextTier?.title ?? null,
    progressToNext,
  };
}

export function djGetCategories(): { name: DreamCategory; emoji: string }[] {
  return [...DREAM_CATEGORIES];
}

export function djGetMoods(): { name: DreamMood; emoji: string }[] {
  return [...DREAM_MOODS];
}

export function djGetRealmDefinitions(): DreamRealmDef[] {
  return DREAM_REALMS.map((r) => ({ ...r }));
}

export function djGetRealityCheckTypes(): string[] {
  return [...REALITY_CHECK_TYPES];
}

export function djGetAllTags(): string[] {
  const s = ensureInit();
  const tagSet = new Set<string>();
  for (const dream of s.dreams) {
    for (const tag of dream.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}
