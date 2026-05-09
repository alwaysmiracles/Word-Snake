// ============================================================================
// Puzzle Box Wire — Collection & Solving Game System
// ============================================================================
// SSR-safe: no localStorage, window, document, setInterval, setTimeout
// All exports use `pb` prefix. No `use`-prefixed functions.
// ============================================================================

// ---------------------------------------------------------------------------
// Inline Type Definitions
// ---------------------------------------------------------------------------

type PuzzleTier = "wooden" | "bronze" | "silver" | "gold" | "crystal" | "celestial";

type PuzzleCategory =
  | "word_lock"
  | "number_cipher"
  | "pattern_match"
  | "riddle_box"
  | "symbol_decode"
  | "color_logic";

type RewardType = "coins" | "gems" | "blueprints" | "artifacts" | "mystery";

type PuzzleBox = {
  id: string;
  name: string;
  tier: PuzzleTier;
  category: PuzzleCategory;
  difficulty: number;
  rewardType: RewardType;
  rewardAmount: number;
  solveTimeSec: number;
  hintCount: number;
  description: string;
  flavorText: string;
  puzzleData: Record<string, unknown>;
};

type SolveResult =
  | { success: true; reward: RewardGrant; timeTaken: number; xpGained: number; speedBonus: number }
  | { success: false; reason: string; attemptsLeft: number };

type RewardGrant = {
  type: RewardType;
  amount: number;
  label: string;
  rarity: PuzzleTier;
};

type AchievementDef = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (state: PuzzleBoxState) => boolean;
};

type PuzzleBoxState = {
  initialized: boolean;
  player: {
    level: number;
    xp: number;
    xpToNext: number;
    coins: number;
    gems: number;
    blueprints: number;
    artifacts: string[];
    mysteryPrizes: string[];
    streak: number;
    lastSolveDate: string;
    totalSolved: number;
    totalAttempts: number;
    bestTimes: Record<string, number>;
    achievements: string[];
    solvedBoxes: string[];
    currentBox: string | null;
    solveStartTime: number | null;
    hintsUsed: Record<string, number>;
    dailyCompleted: string;
    weeklyCompleted: string[];
    tradeTokens: number;
    totalCoinsEarned: number;
    totalGemsEarned: number;
    showHintsUsed: number;
  };
  showcase: string[];
  ownedBoxes: string[];
  duplicateBoxes: string[];
  seedOffset: number;
};

type BoxCardData = {
  id: string;
  name: string;
  tier: PuzzleTier;
  tierLabel: string;
  tierColor: string;
  category: string;
  categoryIcon: string;
  difficulty: number;
  difficultyStars: string;
  solved: boolean;
  bestTime: number | null;
  rewardType: string;
  rewardIcon: string;
  description: string;
  flavorText: string;
};

type SolveCardData = {
  boxId: string;
  name: string;
  category: PuzzleCategory;
  tier: PuzzleTier;
  tierColor: string;
  difficulty: number;
  puzzleDisplay: Record<string, unknown>;
  hintsRemaining: number;
  currentHint: string | null;
  elapsedTime: number;
  attemptsTotal: number;
};

type RewardCardData = {
  type: RewardType;
  amount: number;
  label: string;
  icon: string;
  color: string;
  rarity: PuzzleTier;
  bonusLabel: string | null;
};

type DailyCardData = {
  dateSeed: string;
  puzzleId: string;
  puzzleName: string;
  category: PuzzleCategory;
  difficulty: number;
  bonusReward: RewardGrant;
  completed: boolean;
  timeRemaining: string;
};

type StatsGridData = {
  label: string;
  value: string;
  icon: string;
  color: string;
}[];

type CollectionOverviewData = {
  totalBoxes: number;
  solved: number;
  unsolved: number;
  completionPct: number;
  byTier: { tier: PuzzleTier; label: string; color: string; total: number; solved: number }[];
  byCategory: { category: PuzzleCategory; label: string; icon: string; total: number; solved: number }[];
  recentSolves: { boxId: string; name: string; tier: PuzzleTier; timeAgo: string }[];
  showcaseItems: BoxCardData[];
  completionBonus: { unlocked: boolean; label: string; reward: string }[];
};

type AchievementCardData = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  xpReward: number;
  progress: string;
};

// ---------------------------------------------------------------------------
// Tier & Category Metadata
// ---------------------------------------------------------------------------

const PB_TIER_META: Record<PuzzleTier, { label: string; color: string; xpMult: number; coinMult: number; gemMult: number }> = {
  wooden: { label: "Common", color: "#8B6914", xpMult: 1, coinMult: 1, gemMult: 1 },
  bronze: { label: "Uncommon", color: "#CD7F32", xpMult: 1.5, coinMult: 1.5, gemMult: 1.5 },
  silver: { label: "Rare", color: "#C0C0C0", xpMult: 2, coinMult: 2, gemMult: 2 },
  gold: { label: "Epic", color: "#FFD700", xpMult: 3, coinMult: 3, gemMult: 3 },
  crystal: { label: "Legendary", color: "#7DF9FF", xpMult: 5, coinMult: 5, gemMult: 5 },
  celestial: { label: "Mythic", color: "#E0B0FF", xpMult: 8, coinMult: 8, gemMult: 8 },
};

const PB_CATEGORY_META: Record<PuzzleCategory, { label: string; icon: string; color: string }> = {
  word_lock: { label: "Word Lock", icon: "🔤", color: "#4A90D9" },
  number_cipher: { label: "Number Cipher", icon: "🔢", color: "#E67E22" },
  pattern_match: { label: "Pattern Match", icon: "🧩", color: "#2ECC71" },
  riddle_box: { label: "Riddle Box", icon: "❓", color: "#9B59B6" },
  symbol_decode: { label: "Symbol Decode", icon: "🔣", color: "#E74C3C" },
  color_logic: { label: "Color Logic", icon: "🎨", color: "#F39C12" },
};

const PB_REWARD_ICONS: Record<RewardType, { icon: string; color: string }> = {
  coins: { icon: "🪙", color: "#FFD700" },
  gems: { icon: "💎", color: "#7DF9FF" },
  blueprints: { icon: "📋", color: "#5DADE2" },
  artifacts: { icon: "🏺", color: "#AF7AC5" },
  mystery: { icon: "🎁", color: "#E74C3C" },
};

const PB_TIERS: PuzzleTier[] = ["wooden", "bronze", "silver", "gold", "crystal", "celestial"];
const PB_CATEGORIES: PuzzleCategory[] = ["word_lock", "number_cipher", "pattern_match", "riddle_box", "symbol_decode", "color_logic"];

// ---------------------------------------------------------------------------
// Puzzle Content Data
// ---------------------------------------------------------------------------

const PB_WORD_PUZZLES = [
  { scrambled: "FLAME", answer: "FLAME", hints: ["It produces light and heat", "Camping essential", "F-L-?-" ] },
  { scrambled: "MTORS", answer: "STORM", hints: ["Severe weather event", "Thunder and ___", "S-?-O-M" ] },
  { scrambled: "DEBRIG", answer: "BRIDGE", hints: ["Crosses over water", "Engineering structure", "B-?-I-D-E" ] },
  { scrambled: "LCTASE", answer: "CASTLE", hints: ["Medieval fortress", "King's residence", "C-A-?-L-E" ] },
  { scrambled: "YSTCLRA", answer: "CRYSTAL", hints: ["Transparent mineral", "Clear and shining", "C-R-?-S-T-A-L" ] },
  { scrambled: "NIXPHEO", answer: "PHOENIX", hints: ["Mythical fire bird", "Rises from ashes", "P-H-O-E-?-I-X" ] },
  { scrambled: "TNAYRBHI", answer: "BIRTHANY", hints: ["Celebration day", "Annual personal event", "B-I-R-?-D-A-Y" ] },
  { scrambled: "LREIMED", answer: "MIRACLE", hints: ["Extraordinary event", "Seemingly impossible", "M-I-R-A-C-?-E" ] },
  { scrambled: "LRETAEHE", answer: "ETHEREAL", hints: ["Extremely delicate", "Otherworldly beauty", "E-T-?-E-R-E-A-L" ] },
  { scrambled: "ENCEINQU", answer: "QUINENCE", hints: ["Five-fold essence", "Purest form", "Q-U-I-?-N-E-S-C-E" ] },
];

const PB_NUMBER_PUZZLES = [
  { equation: "? + 7 = 15", answer: "8", hints: ["Subtract 7 from 15", "Think: 15 - 7 = ?", "Single digit, even"] },
  { equation: "3 × ? = 27", answer: "9", hints: ["27 divided by 3", "Power of 3 squared", "Single digit"] },
  { equation: "?² - 16 = 9", answer: "5", hints: ["Add 16 to 9 first", "sqrt(25) = ?", "Perfect square root"] },
  { equation: "144 ÷ ? = 12", answer: "12", hints: ["What times 12 equals 144?", "A dozen", "Square root of 144"] },
  { equation: "? + ? + ? = 30, all same number", answer: "10", hints: ["30 divided by 3", "Perfect ten", "Two digits"] },
  { equation: "2^? = 64", answer: "6", hints: ["Powers of 2", "2×2×2×2×2×2", "Between 5 and 7"] },
  { equation: "(? × 4) + 3 = 23", answer: "5", hints: ["Subtract 3 first: 20", "20 divided by 4", "A handful"] },
  { equation: "Fibonacci: 1,1,2,3,5,8,?", answer: "13", hints: ["Sum of previous two", "5 + 8 = ?", "Teen number"] },
  { equation: "?! = 5040", answer: "7", hints: ["7 factorial", "7×6×5×4×3×2×1", "Lucky number"] },
  { equation: "∑(1..?) = 55", answer: "10", hints: ["Triangular number", "n(n+1)/2 = 55", "Two identical digits"] },
];

const PB_PATTERN_SEQUENCES = [
  { sequence: [2, 4, 6, 8, 10, 12, 14], answer: "16", hint: "Add 2 each time", rule: "arithmetic +2" },
  { sequence: [1, 1, 2, 3, 5, 8, 13, 21], answer: "34", hint: "Each is sum of two before", rule: "fibonacci" },
  { sequence: [1, 4, 9, 16, 25, 36, 49], answer: "64", hint: "Perfect squares: n²", rule: "squares" },
  { sequence: [1, 8, 27, 64, 125, 216], answer: "343", hint: "Perfect cubes: n³", rule: "cubes" },
  { sequence: [2, 3, 5, 7, 11, 13, 17, 19], answer: "23", hint: "Prime numbers", rule: "primes" },
  { sequence: [1, 2, 4, 8, 16, 32, 64, 128], answer: "256", hint: "Each doubles: 2ⁿ", rule: "powers of 2" },
  { sequence: [1, 3, 6, 10, 15, 21, 28], answer: "36", hint: "Triangular numbers", rule: "triangular" },
  { sequence: [3, 6, 11, 18, 27, 38, 51], answer: "66", hint: "Differences: 3,5,7,9,11,13,15", rule: "increasing odd diffs" },
  { sequence: [1, 1, 2, 6, 24, 120], answer: "720", hint: "Factorials: n!", rule: "factorial" },
  { sequence: [0, 1, 3, 6, 10, 15, 21, 28, 36], answer: "45", hint: "Add 1,2,3,4,5,6,7,8,9", rule: "growing increment" },
  { sequence: [100, 97, 91, 82, 70, 55, 37], answer: "16", hint: "Subtract 3,6,9,12,15,18,21", rule: "increasing subtraction" },
  { sequence: [1, 4, 2, 5, 3, 6, 4, 7], answer: "5", hint: "Alternating +3,-2 pattern", rule: "alternating" },
  { sequence: [2, 6, 12, 20, 30, 42, 56], answer: "72", hint: "n(n+1): 1×2, 2×3, 3×4...", rule: "n(n+1)" },
  { sequence: [1, 3, 7, 15, 31, 63], answer: "127", hint: "2ⁿ - 1", rule: "mersenne" },
  { sequence: ["A", "B", "C", "D", "E", "F"], answer: "G", hint: "Alphabet sequence", rule: "alphabet" },
  { sequence: [1, 11, 21, 1211, 111221], answer: "312211", hint: "Look-and-say sequence", rule: "look and say" },
  { sequence: [1, 2, 3, 5, 7, 11, 13], answer: "17", hint: "Alternating primes and composites... no, all primes", rule: "primes v2" },
  { sequence: [3, 9, 27, 81, 243], answer: "729", hint: "Multiply by 3", rule: "geometric ×3" },
  { sequence: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34], answer: "55", hint: "Extended fibonacci", rule: "fibonacci ext" },
  { sequence: [2, 22, 222, 2222], answer: "22222", hint: "Digit repetition grows", rule: "digit repeat" },
  { sequence: [1, 2, 6, 24, 120, 720], answer: "5040", hint: "Factorials: 1!,2!,3!,4!...", rule: "factorials v2" },
  { sequence: [10, 7, 11, 8, 12, 9], answer: "13", hint: "Alternate -3, +4 pattern", rule: "alternate diff" },
];

const PB_RIDDLES = [
  { riddle: "I have cities but no houses, forests but no trees, and water but no fish. What am I?", answer: "map", hints: ["You can fold it", "Found in an atlas", "Shows geography"] },
  { riddle: "The more you take, the more you leave behind. What are they?", answer: "footsteps", hints: ["Made by walking", "Left on the ground", "They fade away"] },
  { riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind.", answer: "echo", hints: ["Sound phenomenon", "Bounces off walls", "In mountains"] },
  { riddle: "What has keys but no locks, space but no room, and you can enter but can't go inside?", answer: "keyboard", hints: ["Used for typing", "On a computer", "Has letters and numbers"] },
  { riddle: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me.", answer: "fire", hints: ["It burns", "Needs oxygen", "Can be extinguished"] },
  { riddle: "What can travel around the world while staying in a corner?", answer: "stamp", hints: ["On an envelope", "Postage item", "Has a picture on it"] },
  { riddle: "I have hands but can't clap. What am I?", answer: "clock", hints: ["Has a face too", "Shows the time", "Has numbers on it"] },
  { riddle: "What has many teeth but cannot bite?", answer: "comb", hints: ["Used on hair", "Has many narrow teeth", "Grooming tool"] },
  { riddle: "What gets wetter the more it dries?", answer: "towel", hints: ["Bathroom item", "Made of cloth", "Used after a shower"] },
  { riddle: "What has a head and a tail but no body?", answer: "coin", hints: ["Used for money", "Flip it for luck", "Has two sides"] },
  { riddle: "What can you hold in your right hand but never in your left hand?", answer: "elbow", hints: ["Part of your body", "Joint between arm and forearm", "Always on the same side"] },
  { riddle: "I have branches but no fruit, trunk but no bark, and leaves but no tree. What am I?", answer: "bank", hints: ["Financial place", "Where money is stored", "Has accounts"] },
  { riddle: "What begins with T, ends with T, and has T in it?", answer: "teapot", hints: ["Kitchen item", "Used for hot drinks", "Pouring vessel"] },
  { riddle: "What is so fragile that saying its name breaks it?", answer: "silence", hints: ["The absence of sound", "Golden, they say", "Shhh..."] },
  { riddle: "I am always in front of you but can't be seen. What am I?", answer: "future", hints: ["Time concept", "Hasn't happened yet", "Opposite of past"] },
  { riddle: "What has one eye but cannot see?", answer: "needle", hints: ["Sewing tool", "Sharp and thin", "Has a hole for thread"] },
  { riddle: "What goes up but never comes down?", answer: "age", hints: ["Everyone has one", "Measured in years", "Only increases"] },
  { riddle: "What has a thumb and four fingers but is not alive?", answer: "glove", hints: ["Worn on the hand", "Keeps you warm", "Comes in pairs usually"] },
  { riddle: "I shave every day but my beard stays the same. What am I?", answer: "barber", hints: ["A profession", "Works with scissors", "Cuts hair"] },
  { riddle: "You see a boat filled with people. It has not sunk, but when you look again you don't see a single person. Why?", answer: "married", hints: ["Think about the word 'single'", "Relationship status", "They are all ___"] },
  { riddle: "What English word has three consecutive double letters?", answer: "bookkeeper", hints: ["An occupation", "Works with numbers and books", "Double-o, double-k, double-e"] },
  { riddle: "What word becomes shorter when you add two letters to it?", answer: "short", hints: ["The answer is ironic", "It means not tall", "S-H-O-R-T"] },
  { riddle: "What is the end of everything?", answer: "g", hints: ["Look at the word itself", "Last letter of 'everything'", "Single letter"] },
  { riddle: "I follow you all the time and copy your every move, but you can never touch me or catch me. What am I?", answer: "shadow", hints: ["Created by light", "Changes with the sun", "Dark version of you"] },
  { riddle: "What invention lets you look right through a wall?", answer: "window", hints: ["In houses", "Made of glass", "Lets light in"] },
  { riddle: "What breaks yet never falls, and what falls yet never breaks?", answer: "day night", hints: ["Time concepts", "One follows the other", "Cycle of light and dark"] },
  { riddle: "Feed me and I live, give me drink and I die. What am I?", answer: "fire", hints: ["Needs fuel", "Water extinguishes it", "Produces heat"] },
  { riddle: "What goes through cities and fields, but never moves?", answer: "road", hints: ["Made of asphalt", "Cars drive on it", "Connects places"] },
  { riddle: "I am easy to lift but hard to throw. What am I?", answer: "feather", hints: ["Very light", "From a bird", "Floats gently"] },
  { riddle: "The person who makes it has no need of it. The person who buys it has no use for it.", answer: "coffin", hints: ["Final resting place", "Wooden box", "Funeral item"] },
  { riddle: "What belongs to you but others use it more than you do?", answer: "name", hints: ["Given at birth", "People call you by it", "Written on documents"] },
  { riddle: "I have seas without water, coasts without sand, towns without people, and mountains without land.", answer: "map", hints: ["Flat representation", "Foldable", "Cartographic item"] },
];

const PB_SYMBOL_CIPHERS = [
  { symbols: ["☽", "☀", "★", "♠", "♣"], mapping: { "☽": "H", "☀": "E", "★": "L", "♠": "P", "♣": "S" }, encrypted: "☀☽★♠", answer: "HELPS", hints: ["☀ is the most common English letter", "☽ is the second most common", "★ maps to a consonant"] },
  { symbols: ["◆", "◇", "○", "●", "□"], mapping: { "◆": "W", "◇": "O", "○": "R", "●": "L", "□": "D" }, encrypted: "◆◇○●□", answer: "WORLD", hints: ["5-letter word", "Means 'earth' or 'globe'", "◆ starts a common word"] },
  { symbols: ["△", "▽", "☆", "♦", "♪"], mapping: { "△": "M", "▽": "A", "☆": "G", "♦": "I", "♪": "C" }, encrypted: "▽△☆♦♪", answer: "AMAGIC", hints: ["Starts with A", "Contains word MAGIC", "▽ = A"] },
  { symbols: ["♧", "♤", "♡", "♢", "⊗"], mapping: { "♧": "S", "♤": "T", "♡": "O", "♢": "N", "⊗": "E" }, encrypted: "♤♡♧♢♧", answer: "STONES", hints: ["6 letters, 2 S's", "Heavy objects", "♤ = S"] },
  { symbols: ["◎", "⊕", "⊗", "⊘", "⊙"], mapping: { "◎": "B", "⊕": "R", "⊗": "I", "⊘": "D", "⊙": "G" }, encrypted: "⊕◎⊗⊕○", answer: "BRIDGE", hints: ["Crosses gaps", "5 letters", "⊕ = B"] },
  { symbols: ["⌂", "♨", "♣", "♪", "✿"], mapping: { "⌂": "P", "♨": "L", "♣": "A", "♪": "N", "✿": "E" }, encrypted: "⌂♨♣♪✿", answer: "PLANE", hints: ["Flying machine", "5 letters", "⌂ = P"] },
  { symbols: ["♠", "♥", "♦", "♣", "★"], mapping: { "♠": "F", "♥": "L", "♦": "A", "♣": "M", "★": "E" }, encrypted: "♠♥♣♦★", answer: "FLAME", hints: ["Fire-related", "Vowel at start and end", "♠ = F"] },
  { symbols: ["▲", "▼", "►", "◄", "◆"], mapping: { "▲": "C", "▼": "R", "►": "Y", "◄": "S", "◆": "T" }, encrypted: "▲▼◆◄", answer: "CRYST", hints: ["Start of a shiny word", "4 letters shown", "▲ = C"] },
  { symbols: ["☯", "☂", "♫", "✪", "❄"], mapping: { "☯": "Q", "☂": "U", "♫": "I", "✪": "X", "❄": "N" }, encrypted: "☯☂♫✪", answer: "QUIXN", hints: ["A small word", "Contains U and I", "☯ = Q"] },
  { symbols: ["⬟", "⬡", "⬢", "⬣", "⏣"], mapping: { "⬟": "Z", "⬡": "E", "⬢": "N", "⬣": "I", "⏣": "T" }, encrypted: "⬡⬢⬟⬣⬡⬟", answer: "ENZITE", hints: ["6 letters", "Contains Z", "⬡ is a vowel"] },
];

const PB_COLOR_PUZZLES = [
  { colors: ["red", "blue", "green", "yellow"], slots: 3, clues: ["Red is in position 1", "Blue is not in position 3", "Green is adjacent to red"], answer: ["red", "green", "blue"], hints: ["Start with position 1 clue", "Green must be in position 2", "Blue fills the remaining slot"] },
  { colors: ["red", "blue", "green", "yellow", "purple"], slots: 4, clues: ["Yellow is first", "Purple is last", "Blue is not adjacent to green", "Green is in position 3"], answer: ["yellow", "red", "green", "purple"], hints: ["Pin down positions 1, 3, 4", "Only position 2 is left", "Red goes in position 2"] },
  { colors: ["red", "blue", "green", "yellow"], slots: 4, clues: ["All colors used", "Red is before blue", "Green is after yellow", "Yellow is second"], answer: ["red", "yellow", "green", "blue"], hints: ["Yellow locks position 2", "Green must be after position 2", "Red before blue"] },
  { colors: ["red", "orange", "yellow", "green", "blue"], slots: 3, clues: ["A warm color is in position 2", "The first and last are cool colors", "Blue is not last", "Green is used"], answer: ["blue", "orange", "green"], hints: ["Cool colors: blue, green", "Warm colors: red, orange, yellow", "Blue is first since not last"] },
  { colors: ["red", "blue", "white", "black"], slots: 3, clues: ["Black is not in position 1 or 3", "White is adjacent to black", "Red is in an odd position"], answer: ["red", "black", "white"], hints: ["Black must be in position 2", "White is adjacent (position 1 or 3)", "Red is odd (1 or 3), but white takes one"] },
  { colors: ["red", "blue", "green", "yellow", "purple", "orange"], slots: 4, clues: ["Primary colors are in positions 1,2,3", "Purple is in position 4", "Blue is between red and green", "Yellow is position 2"], answer: ["red", "yellow", "blue", "purple"], hints: ["Position 4 is purple", "Positions 1-3 are primary: red, blue, green, yellow", "Yellow is 2, blue between red and green means red=1, green=3 or green=1, red=3; blue must be between them"] },
  { colors: ["cyan", "magenta", "yellow", "black"], slots: 4, clues: ["They are in CMYK order but one is swapped", "Black is last", "Cyan is first", "Magenta is not in position 2"], answer: ["cyan", "yellow", "magenta", "black"], hints: ["CMYK = cyan, magenta, yellow, black", "Cyan first, black last", "Magenta swapped with yellow"] },
  { colors: ["red", "blue", "green"], slots: 2, clues: ["Both colors are primary", "Neither is red", "Blue is included"], answer: ["blue", "green"], hints: ["Only 2 primary colors besides red", "Simple elimination", "Blue and green remain"] },
  { colors: ["red", "blue", "green", "yellow", "purple", "orange"], slots: 5, clues: ["Rainbow order but two adjacent colors swapped", "Red is first", "Purple is last", "Blue is in position 3"], answer: ["red", "orange", "blue", "green", "purple"], hints: ["Normal: red, orange, yellow, green, blue, purple", "Blue and yellow are swapped", "Blue moves to position 3, yellow to position 4... wait, let's say green and yellow swap"] },
  { colors: ["red", "blue", "green", "yellow", "white", "black"], slots: 4, clues: ["Opposite colors are not adjacent", "Red is in position 2", "Green is opposite to red (position 4)", "Blue and yellow are not opposite here"], answer: ["blue", "red", "yellow", "green"], hints: ["Red at 2, green at 4", "Blue and yellow fill 1 and 3", "Blue can be 1, yellow can be 3"] },
];

const PB_MYSTERY_PRIZES: string[] = [
  "Golden Key Fragment", "Enchanted Gear", "Phoenix Feather",
  "Dragon Scale", "Moonstone Shard", "Star Compass",
  "Void Crystal", "Time Sand", "Echo Amulet",
  "Mirage Lens", "Storm Rune", "Frozen Ember",
];

const PB_ARTIFACTS: string[] = [
  "Ancient Sphinx Scroll", "Mechanical Puzzle Core", "Enchanted Lock Pick Set",
  "Cipher Master Ring", "Rainbow Prism Shard", "Timekeeper Hourglass",
  "Riddle Keeper Mask", "Symbol Translator Stone", "Color Alchemist Flask",
  "Puzzle Box Blueprint Vol 1", "Phantom Key", "Celestial Map Piece",
];

// ---------------------------------------------------------------------------
// Generate 60 Puzzle Boxes
// ---------------------------------------------------------------------------

function pbBuildAllBoxes(): PuzzleBox[] {
  const boxes: PuzzleBox[] = [];
  let boxIndex = 0;

  // --- Word Lock (10 boxes) ---
  const wordTiers: PuzzleTier[] = ["wooden", "wooden", "bronze", "bronze", "silver", "silver", "gold", "gold", "crystal", "celestial"];
  const wordDifficulties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = 0; i < PB_WORD_PUZZLES.length; i++) {
    const wp = PB_WORD_PUZZLES[i];
    const tier = wordTiers[i];
    const meta = PB_TIER_META[tier];
    boxes.push({
      id: `wl_${i + 1}`,
      name: `Word Lock ${i + 1}: ${wp.scrambled}`,
      tier,
      category: "word_lock",
      difficulty: wordDifficulties[i],
      rewardType: i % 3 === 0 ? "coins" : i % 3 === 1 ? "gems" : "blueprints",
      rewardAmount: Math.round((50 + i * 20) * meta.coinMult),
      solveTimeSec: 30 + i * 15,
      hintCount: 3,
      description: `Unscramble the jumbled letters to reveal a hidden word.`,
      flavorText: `The letters "${wp.scrambled}" glow faintly on the lock's surface...`,
      puzzleData: { type: "word_lock", scrambled: wp.scrambled, answer: wp.answer, hints: wp.hints },
    });
    boxIndex++;
  }

  // --- Number Cipher (10 boxes) ---
  const numTiers: PuzzleTier[] = ["wooden", "wooden", "bronze", "bronze", "silver", "silver", "gold", "gold", "crystal", "celestial"];
  const numDifficulties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = 0; i < PB_NUMBER_PUZZLES.length; i++) {
    const np = PB_NUMBER_PUZZLES[i];
    const tier = numTiers[i];
    const meta = PB_TIER_META[tier];
    boxes.push({
      id: `nc_${i + 1}`,
      name: `Number Cipher ${i + 1}: Solve "${np.equation.substring(0, 15)}${np.equation.length > 15 ? "..." : ""}"`,
      tier,
      category: "number_cipher",
      difficulty: numDifficulties[i],
      rewardType: i % 3 === 0 ? "coins" : i % 3 === 1 ? "gems" : "artifacts",
      rewardAmount: Math.round((40 + i * 25) * meta.coinMult),
      solveTimeSec: 20 + i * 12,
      hintCount: 3,
      description: `Find the missing number to complete the equation.`,
      flavorText: `Ancient numerals swirl around: "${np.equation}"...`,
      puzzleData: { type: "number_cipher", equation: np.equation, answer: np.answer, hints: np.hints },
    });
    boxIndex++;
  }

  // --- Pattern Match (10 boxes) ---
  const patTiers: PuzzleTier[] = ["wooden", "bronze", "bronze", "silver", "silver", "gold", "gold", "crystal", "crystal", "celestial"];
  const patDifficulties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = 0; i < 10 && i < PB_PATTERN_SEQUENCES.length; i++) {
    const pp = PB_PATTERN_SEQUENCES[i];
    const tier = patTiers[i];
    const meta = PB_TIER_META[tier];
    boxes.push({
      id: `pm_${i + 1}`,
      name: `Pattern Match ${i + 1}: ${pp.rule}`,
      tier,
      category: "pattern_match",
      difficulty: patDifficulties[i],
      rewardType: i % 3 === 0 ? "coins" : i % 3 === 1 ? "blueprints" : "gems",
      rewardAmount: Math.round((45 + i * 22) * meta.coinMult),
      solveTimeSec: 25 + i * 13,
      hintCount: 3,
      description: `Identify the next item in the sequence: ${pp.sequence.slice(0, 5).join(", ")}, ...`,
      flavorText: `Symbols arrange themselves: ${pp.sequence.slice(0, 4).join(", ")}, ?, ... What comes next?`,
      puzzleData: { type: "pattern_match", sequence: pp.sequence, answer: pp.answer, hint: pp.hint, rule: pp.rule },
    });
    boxIndex++;
  }

  // --- Riddle Box (10 boxes) ---
  const ridTiers: PuzzleTier[] = ["wooden", "wooden", "bronze", "bronze", "silver", "gold", "gold", "crystal", "crystal", "celestial"];
  const ridDifficulties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = 0; i < 10 && i < PB_RIDDLES.length; i++) {
    const rp = PB_RIDDLES[i];
    const tier = ridTiers[i];
    const meta = PB_TIER_META[tier];
    boxes.push({
      id: `rb_${i + 1}`,
      name: `Riddle Box ${i + 1}`,
      tier,
      category: "riddle_box",
      difficulty: ridDifficulties[i],
      rewardType: i % 3 === 0 ? "gems" : i % 3 === 1 ? "coins" : "mystery",
      rewardAmount: Math.round((55 + i * 18) * meta.gemMult),
      solveTimeSec: 40 + i * 10,
      hintCount: 3,
      description: `Solve the riddle to unlock the box.`,
      flavorText: `A mysterious voice echoes: "${rp.riddle.substring(0, 60)}${rp.riddle.length > 60 ? "..." : ""}"`,
      puzzleData: { type: "riddle_box", riddle: rp.riddle, answer: rp.answer, hints: rp.hints },
    });
    boxIndex++;
  }

  // --- Symbol Decode (10 boxes) ---
  const symTiers: PuzzleTier[] = ["bronze", "bronze", "silver", "silver", "gold", "gold", "crystal", "crystal", "celestial", "celestial"];
  const symDifficulties = [2, 3, 4, 5, 6, 7, 8, 9, 9, 10];
  for (let i = 0; i < PB_SYMBOL_CIPHERS.length; i++) {
    const sp = PB_SYMBOL_CIPHERS[i];
    const tier = symTiers[i];
    const meta = PB_TIER_META[tier];
    boxes.push({
      id: `sd_${i + 1}`,
      name: `Symbol Decode ${i + 1}: ${sp.encrypted}`,
      tier,
      category: "symbol_decode",
      difficulty: symDifficulties[i],
      rewardType: i % 3 === 0 ? "blueprints" : i % 3 === 1 ? "gems" : "artifacts",
      rewardAmount: Math.round((60 + i * 15) * meta.gemMult),
      solveTimeSec: 35 + i * 14,
      hintCount: 3,
      description: `Decode the ancient symbol cipher to reveal a hidden word.`,
      flavorText: `Strange symbols glow: ${sp.symbols.join(" ")} ... Their meaning awaits...`,
      puzzleData: { type: "symbol_decode", symbols: sp.symbols, mapping: sp.mapping, encrypted: sp.encrypted, answer: sp.answer, hints: sp.hints },
    });
    boxIndex++;
  }

  // --- Color Logic (10 boxes) ---
  const colTiers: PuzzleTier[] = ["wooden", "bronze", "silver", "silver", "gold", "gold", "crystal", "crystal", "celestial", "celestial"];
  const colDifficulties = [1, 3, 4, 5, 6, 7, 8, 9, 9, 10];
  for (let i = 0; i < PB_COLOR_PUZZLES.length; i++) {
    const cp = PB_COLOR_PUZZLES[i];
    const tier = colTiers[i];
    const meta = PB_TIER_META[tier];
    boxes.push({
      id: `cl_${i + 1}`,
      name: `Color Logic ${i + 1}: ${cp.slots}-Slot Puzzle`,
      tier,
      category: "color_logic",
      difficulty: colDifficulties[i],
      rewardType: i % 3 === 0 ? "coins" : i % 3 === 1 ? "mystery" : "gems",
      rewardAmount: Math.round((50 + i * 20) * meta.coinMult),
      solveTimeSec: 30 + i * 16,
      hintCount: 3,
      description: `Arrange the colors correctly in ${cp.slots} slots based on the clues.`,
      flavorText: `${cp.colors.length} colored gems await placement in ${cp.slots} slots...`,
      puzzleData: { type: "color_logic", colors: cp.colors, slots: cp.slots, clues: cp.clues, answer: cp.answer, hints: cp.hints },
    });
    boxIndex++;
  }

  return boxes;
}

const PB_ALL_BOXES: PuzzleBox[] = pbBuildAllBoxes();

// ---------------------------------------------------------------------------
// State Management (SSR-safe)
// ---------------------------------------------------------------------------

let state: PuzzleBoxState | null = null;

function pbCreateInitialState(): PuzzleBoxState {
  return {
    initialized: true,
    player: {
      level: 1,
      xp: 0,
      xpToNext: 100,
      coins: 0,
      gems: 0,
      blueprints: 0,
      artifacts: [],
      mysteryPrizes: [],
      streak: 0,
      lastSolveDate: "",
      totalSolved: 0,
      totalAttempts: 0,
      bestTimes: {},
      achievements: [],
      solvedBoxes: [],
      currentBox: null,
      solveStartTime: null,
      hintsUsed: {},
      dailyCompleted: "",
      weeklyCompleted: [],
      tradeTokens: 0,
      totalCoinsEarned: 0,
      totalGemsEarned: 0,
      showHintsUsed: 0,
    },
    showcase: [],
    ownedBoxes: [],
    duplicateBoxes: [],
    seedOffset: 0,
  };
}

function ensureInit(): PuzzleBoxState {
  if (!state) {
    state = pbCreateInitialState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// XP & Leveling
// ---------------------------------------------------------------------------

function pbGetXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.3, level - 1));
}

function pbGetLevelFromXP(totalXP: number): { level: number; currentXP: number; xpToNext: number } {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= pbGetXPForLevel(level)) {
    remaining -= pbGetXPForLevel(level);
    level++;
  }
  return {
    level: Math.min(level, 30),
    currentXP: remaining,
    xpToNext: pbGetXPForLevel(level),
  };
}

// ---------------------------------------------------------------------------
// Achievement Definitions (15)
// ---------------------------------------------------------------------------

const PB_ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_solve",
    name: "First Unlock",
    description: "Solve your first puzzle box",
    icon: "🔓",
    xpReward: 50,
    condition: (s) => s.player.totalSolved >= 1,
  },
  {
    id: "ten_solves",
    name: "Puzzle Apprentice",
    description: "Solve 10 puzzle boxes",
    icon: "🧑‍🏫",
    xpReward: 200,
    condition: (s) => s.player.totalSolved >= 10,
  },
  {
    id: "twenty_five_solves",
    name: "Puzzle Journeyman",
    description: "Solve 25 puzzle boxes",
    icon: "🧑‍🔧",
    xpReward: 500,
    condition: (s) => s.player.totalSolved >= 25,
  },
  {
    id: "fifty_solves",
    name: "Puzzle Master",
    description: "Solve 50 puzzle boxes",
    icon: "👨‍🎓",
    xpReward: 1000,
    condition: (s) => s.player.totalSolved >= 50,
  },
  {
    id: "all_solved",
    name: "Grand Puzzle Solver",
    description: "Solve all 60 puzzle boxes",
    icon: "🏆",
    xpReward: 5000,
    condition: (s) => s.player.totalSolved >= 60,
  },
  {
    id: "streak_3",
    name: "Hot Streak",
    description: "Solve 3 boxes consecutively",
    icon: "🔥",
    xpReward: 100,
    condition: (s) => s.player.streak >= 3,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day solve streak",
    icon: "⚡",
    xpReward: 300,
    condition: (s) => s.player.streak >= 7,
  },
  {
    id: "streak_30",
    name: "Monthly Marvel",
    description: "Maintain a 30-day solve streak",
    icon: "🌟",
    xpReward: 1500,
    condition: (s) => s.player.streak >= 30,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Solve any box in under 10 seconds",
    icon: "⏱️",
    xpReward: 250,
    condition: (s) => Object.values(s.player.bestTimes).some((t) => t < 10),
  },
  {
    id: "no_hints",
    name: "Pure Intellect",
    description: "Solve 5 boxes without using any hints",
    icon: "🧠",
    xpReward: 400,
    condition: (s) => s.player.solvedBoxes.filter((id) => !(s.player.hintsUsed[id] && s.player.hintsUsed[id] > 0)).length >= 5,
  },
  {
    id: "collector_wooden",
    name: "Wooden Collector",
    description: "Solve all Wooden tier boxes",
    icon: "🪵",
    xpReward: 200,
    condition: (s) => PB_ALL_BOXES.filter((b) => b.tier === "wooden").every((b) => s.player.solvedBoxes.includes(b.id)),
  },
  {
    id: "collector_bronze",
    name: "Bronze Collector",
    description: "Solve all Bronze tier boxes",
    icon: "🥉",
    xpReward: 300,
    condition: (s) => PB_ALL_BOXES.filter((b) => b.tier === "bronze").every((b) => s.player.solvedBoxes.includes(b.id)),
  },
  {
    id: "collector_silver",
    name: "Silver Collector",
    description: "Solve all Silver tier boxes",
    icon: "🥈",
    xpReward: 500,
    condition: (s) => PB_ALL_BOXES.filter((b) => b.tier === "silver").every((b) => s.player.solvedBoxes.includes(b.id)),
  },
  {
    id: "category_master",
    name: "Category Master",
    description: "Solve at least 1 box of every category",
    icon: "🎖️",
    xpReward: 350,
    condition: (s) => PB_CATEGORIES.every((cat) => PB_ALL_BOXES.filter((b) => b.category === cat).some((b) => s.player.solvedBoxes.includes(b.id))),
  },
  {
    id: "daily_week",
    name: "Daily Devotee",
    description: "Complete 7 daily puzzles",
    icon: "📅",
    xpReward: 600,
    condition: (s) => s.player.dailyCompleted.length >= 14,
  },
];

// ---------------------------------------------------------------------------
// Date Seeding (deterministic daily puzzle)
// ---------------------------------------------------------------------------

function pbDateString(date?: Date): string {
  const d = date ?? new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pbHashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function pbDateSeed(dateStr?: string): number {
  return pbHashString(dateStr ?? pbDateString());
}

function pbWeekSeed(dateStr?: string): number {
  const d = dateStr ?? pbDateString();
  const date = new Date(d);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return pbHashString(`${date.getFullYear()}-W${weekNum}`);
}

function pbSeededRandom(seed: number): (index: number) => number {
  let s = seed;
  return (index: number): number => {
    const x = Math.sin(s + index * 9301 + 49297) * 233280;
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return x - Math.floor(x);
  };
}

// ---------------------------------------------------------------------------
// State Management Functions
// ---------------------------------------------------------------------------

export function pbGetState(): PuzzleBoxState {
  return ensureInit();
}

export function pbInit(): PuzzleBoxState {
  if (!state) {
    state = pbCreateInitialState();
  }
  return state;
}

export function pbReset(): PuzzleBoxState {
  state = pbCreateInitialState();
  return state;
}

export function pbExportState(): string {
  const s = ensureInit();
  return JSON.stringify(s);
}

export function pbImportState(json: string): PuzzleBoxState {
  try {
    const parsed = JSON.parse(json) as PuzzleBoxState;
    if (parsed && parsed.initialized && parsed.player) {
      state = parsed;
      return state;
    }
  } catch {
    // Invalid JSON — reset
  }
  state = pbCreateInitialState();
  return state;
}

// ---------------------------------------------------------------------------
// Box Query Functions
// ---------------------------------------------------------------------------

export function pbGetAllBoxes(): PuzzleBox[] {
  return [...PB_ALL_BOXES];
}

export function pbGetBoxById(id: string): PuzzleBox | null {
  return PB_ALL_BOXES.find((b) => b.id === id) ?? null;
}

export function pbGetBoxesByTier(tier: PuzzleTier): PuzzleBox[] {
  return PB_ALL_BOXES.filter((b) => b.tier === tier);
}

export function pbGetBoxesByCategory(category: PuzzleCategory): PuzzleBox[] {
  return PB_ALL_BOXES.filter((b) => b.category === category);
}

export function pbGetBoxesByDifficultyRange(min: number, max: number): PuzzleBox[] {
  return PB_ALL_BOXES.filter((b) => b.difficulty >= min && b.difficulty <= max);
}

export function pbGetBoxCount(): number {
  return PB_ALL_BOXES.length;
}

export function pbGetRandomBox(seed?: number): PuzzleBox {
  const idx = seed !== undefined
    ? Math.floor(pbSeededRandom(seed)(0) * PB_ALL_BOXES.length)
    : Math.floor(Math.random() * PB_ALL_BOXES.length);
  return PB_ALL_BOXES[idx % PB_ALL_BOXES.length];
}

export function pbGetTierInfo(tier: PuzzleTier): { label: string; color: string; xpMult: number; coinMult: number; gemMult: number } {
  return { ...PB_TIER_META[tier] };
}

export function pbGetAllTiers(): { tier: PuzzleTier; label: string; color: string }[] {
  return PB_TIERS.map((t) => ({ tier: t, label: PB_TIER_META[t].label, color: PB_TIER_META[t].color }));
}

export function pbGetAllCategories(): { category: PuzzleCategory; label: string; icon: string; color: string }[] {
  return PB_CATEGORIES.map((c) => ({ category: c, label: PB_CATEGORY_META[c].label, icon: PB_CATEGORY_META[c].icon, color: PB_CATEGORY_META[c].color }));
}

export function pbIsBoxSolved(boxId: string): boolean {
  const s = ensureInit();
  return s.player.solvedBoxes.includes(boxId);
}

export function pbGetOwnedBoxIds(): string[] {
  const s = ensureInit();
  return [...s.ownedBoxes];
}

// ---------------------------------------------------------------------------
// Solving Functions
// ---------------------------------------------------------------------------

export function pbOpenBox(boxId: string): { success: boolean; error?: string; box?: PuzzleBox } {
  const s = ensureInit();
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return { success: false, error: `Box "${boxId}" not found` };
  if (s.player.currentBox) return { success: false, error: "Another box is already open. Close it first." };
  if (s.player.solvedBoxes.includes(boxId)) return { success: false, error: "This box is already solved." };

  if (!s.ownedBoxes.includes(boxId)) {
    s.ownedBoxes.push(boxId);
  }

  s.player.currentBox = boxId;
  s.player.solveStartTime = Date.now();
  s.player.hintsUsed[boxId] = s.player.hintsUsed[boxId] ?? 0;

  return { success: true, box };
}

export function pbGetActivePuzzle(): { boxId: string; puzzleData: Record<string, unknown>; category: PuzzleCategory } | null {
  const s = ensureInit();
  if (!s.player.currentBox) return null;
  const box = PB_ALL_BOXES.find((b) => b.id === s.player.currentBox);
  if (!box) return null;
  return { boxId: box.id, puzzleData: box.puzzleData, category: box.category };
}

export function pbCloseBox(): boolean {
  const s = ensureInit();
  if (!s.player.currentBox) return false;
  s.player.currentBox = null;
  s.player.solveStartTime = null;
  return true;
}

export function pbGetElapsedTime(): number {
  const s = ensureInit();
  if (!s.player.solveStartTime) return 0;
  return (Date.now() - s.player.solveStartTime) / 1000;
}

export function pbSubmitAnswer(boxId: string, answer: string): SolveResult {
  const s = ensureInit();
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return { success: false, reason: "Box not found", attemptsLeft: 0 };

  if (s.player.solvedBoxes.includes(boxId)) {
    return { success: false, reason: "Already solved", attemptsLeft: 0 };
  }

  s.player.totalAttempts++;

  const data = box.puzzleData;
  const normalizedAnswer = answer.trim().toLowerCase();
  let correct = false;

  switch (box.category) {
    case "word_lock": {
      const expected = String(data.answer).toLowerCase();
      correct = normalizedAnswer === expected;
      break;
    }
    case "number_cipher": {
      const expected = String(data.answer).trim();
      correct = normalizedAnswer === expected.toLowerCase();
      break;
    }
    case "pattern_match": {
      const expected = String(data.answer).trim().toLowerCase();
      correct = normalizedAnswer === expected;
      break;
    }
    case "riddle_box": {
      const expected = String(data.answer).trim().toLowerCase();
      correct = normalizedAnswer === expected;
      break;
    }
    case "symbol_decode": {
      const expected = String(data.answer).trim().toLowerCase();
      correct = normalizedAnswer === expected;
      break;
    }
    case "color_logic": {
      const expected: string[] = data.answer as string[];
      const submitted = normalizedAnswer.split(",").map((c) => c.trim());
      correct = submitted.length === expected.length && submitted.every((c, i) => c === expected[i].toLowerCase());
      break;
    }
    default:
      correct = false;
  }

  if (!correct) {
    const hintsRemaining = box.hintCount - (s.player.hintsUsed[boxId] ?? 0);
    return { success: false, reason: "Incorrect answer", attemptsLeft: hintsRemaining };
  }

  // Success!
  const elapsed = s.player.solveStartTime ? (Date.now() - s.player.solveStartTime) / 1000 : 0;
  const timeBonus = Math.max(0, Math.floor((box.solveTimeSec - elapsed) / box.solveTimeSec * 100));
  const meta = PB_TIER_META[box.tier];
  const baseXP = Math.floor(box.difficulty * 20 * meta.xpMult);
  const streakMult = 1 + s.player.streak * 0.05;
  const totalXP = Math.floor((baseXP + timeBonus) * streakMult);

  s.player.solvedBoxes.push(boxId);
  s.player.totalSolved++;

  if (!s.player.bestTimes[boxId] || elapsed < s.player.bestTimes[boxId]) {
    s.player.bestTimes[boxId] = Math.floor(elapsed * 100) / 100;
  }

  // Update streak
  const today = pbDateString();
  if (s.player.lastSolveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (s.player.lastSolveDate === pbDateString(yesterday)) {
      s.player.streak++;
    } else if (s.player.lastSolveDate === "") {
      s.player.streak = 1;
    } else {
      s.player.streak = 1;
    }
    s.player.lastSolveDate = today;
  }

  // Grant reward
  const reward = pbGrantReward(box);

  // XP
  pbAddXP(totalXP);

  // Check achievements
  pbCheckAndUnlockAchievements();

  // Clear active box
  s.player.currentBox = null;
  s.player.solveStartTime = null;

  return {
    success: true,
    reward,
    timeTaken: Math.floor(elapsed * 100) / 100,
    xpGained: totalXP,
    speedBonus: timeBonus,
  };
}

export function pbSubmitPatternAnswer(boxId: string, answer: string): SolveResult {
  return pbSubmitAnswer(boxId, answer);
}

export function pbSubmitRiddleAnswer(boxId: string, answer: string): SolveResult {
  return pbSubmitAnswer(boxId, answer);
}

export function pbSubmitColorAnswer(boxId: string, colors: string[]): SolveResult {
  const answer = colors.join(", ");
  return pbSubmitAnswer(boxId, answer);
}

// ---------------------------------------------------------------------------
// Hint System
// ---------------------------------------------------------------------------

export function pbGetHint(boxId: string): { success: boolean; hint: string | null; cost: number; hintsRemaining: number } {
  const s = ensureInit();
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return { success: false, hint: null, cost: 0, hintsRemaining: 0 };

  const used = s.player.hintsUsed[boxId] ?? 0;
  const remaining = box.hintCount - used;
  if (remaining <= 0) return { success: false, hint: null, cost: 0, hintsRemaining: 0 };

  const cost = Math.floor(10 * (used + 1) * PB_TIER_META[box.tier].coinMult);
  if (s.player.coins < cost) return { success: false, hint: null, cost, hintsRemaining: remaining };

  const data = box.puzzleData;
  let hintText: string;

  switch (box.category) {
    case "word_lock":
    case "number_cipher":
    case "symbol_decode":
    case "color_logic": {
      const hints: string[] = (data.hints as string[]) ?? [];
      hintText = used < hints.length ? hints[used] : "No more hints available.";
      break;
    }
    case "pattern_match": {
      hintText = used === 0 ? String(data.hint ?? "Look at the differences between consecutive numbers.") : "Try computing the rule explicitly.";
      break;
    }
    case "riddle_box": {
      const hints: string[] = (data.hints as string[]) ?? [];
      hintText = used < hints.length ? hints[used] : "Think more creatively!";
      break;
    }
    default:
      hintText = "No hint available.";
  }

  s.player.coins -= cost;
  s.player.hintsUsed[boxId] = used + 1;
  s.player.showHintsUsed++;

  return { success: true, hint: hintText, cost, hintsRemaining: remaining - 1 };
}

export function pbGetHintsRemaining(boxId: string): number {
  const s = ensureInit();
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return 0;
  const used = s.player.hintsUsed[boxId] ?? 0;
  return Math.max(0, box.hintCount - used);
}

export function pbGetHintCost(boxId: string, hintNumber: number): number {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return 0;
  return Math.floor(10 * hintNumber * PB_TIER_META[box.tier].coinMult);
}

// ---------------------------------------------------------------------------
// Reward Functions
// ---------------------------------------------------------------------------

function pbGrantReward(box: PuzzleBox): RewardGrant {
  const s = ensureInit();
  const meta = PB_TIER_META[box.tier];
  const baseAmount = box.rewardAmount;
  const streakMult = 1 + s.player.streak * 0.02;
  const amount = Math.floor(baseAmount * streakMult);

  const grant: RewardGrant = {
    type: box.rewardType,
    amount,
    label: "",
    rarity: box.tier,
  };

  switch (box.rewardType) {
    case "coins":
      s.player.coins += amount;
      s.player.totalCoinsEarned += amount;
      grant.label = `${amount} Coins`;
      break;
    case "gems":
      s.player.gems += amount;
      s.player.totalGemsEarned += amount;
      grant.label = `${amount} Gems`;
      break;
    case "blueprints":
      s.player.blueprints += amount;
      grant.label = `${amount} Blueprints`;
      break;
    case "artifacts": {
      const artifact = PB_ARTIFACTS[Math.floor(Math.random() * PB_ARTIFACTS.length)];
      s.player.artifacts.push(artifact);
      grant.label = artifact;
      break;
    }
    case "mystery": {
      const prize = PB_MYSTERY_PRIZES[Math.floor(Math.random() * PB_MYSTERY_PRIZES.length)];
      s.player.mysteryPrizes.push(prize);
      grant.label = prize;
      break;
    }
  }

  // Trade token for duplicates
  if (s.player.solvedBoxes.filter((id) => id === box.id).length > 1) {
    s.player.tradeTokens++;
  }

  return grant;
}

export function pbGetRewardPreview(boxId: string): RewardGrant | null {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return null;
  const meta = PB_TIER_META[box.tier];
  return {
    type: box.rewardType,
    amount: box.rewardAmount,
    label: `${box.rewardAmount} ${box.rewardType}`,
    rarity: box.tier,
  };
}

export function pbGetPlayerCoins(): number {
  return ensureInit().player.coins;
}

export function pbGetPlayerGems(): number {
  return ensureInit().player.gems;
}

export function pbGetPlayerBlueprints(): number {
  return ensureInit().player.blueprints;
}

export function pbGetPlayerArtifacts(): string[] {
  return [...ensureInit().player.artifacts];
}

export function pbGetPlayerMysteryPrizes(): string[] {
  return [...ensureInit().player.mysteryPrizes];
}

// ---------------------------------------------------------------------------
// Duplicate Trading
// ---------------------------------------------------------------------------

export function pbGetDuplicateCount(): number {
  return ensureInit().duplicateBoxes.length;
}

export function pbGetTradeValue(): number {
  const s = ensureInit();
  return Math.floor(s.duplicateBoxes.length * 25);
}

export function pbTradeDuplicates(): { traded: number; newBoxId: string | null; coinsEarned: number } {
  const s = ensureInit();
  const count = s.duplicateBoxes.length;
  if (count === 0) return { traded: 0, newBoxId: null, coinsEarned: 0 };

  const coinsEarned = Math.floor(count * 25);
  s.player.coins += coinsEarned;
  s.duplicateBoxes = [];

  // Chance to get a new box
  const unsolved = PB_ALL_BOXES.filter((b) => !s.player.solvedBoxes.includes(b.id));
  let newBoxId: string | null = null;
  if (unsolved.length > 0) {
    const rand = pbSeededRandom(Date.now());
    const idx = Math.floor(rand(0) * unsolved.length);
    newBoxId = unsolved[idx].id;
    if (!s.ownedBoxes.includes(newBoxId)) {
      s.ownedBoxes.push(newBoxId);
    }
  }

  return { traded: count, newBoxId, coinsEarned };
}

export function pbPurchaseBox(tier: PuzzleTier): { success: boolean; boxId: string | null; cost: number } {
  const s = ensureInit();
  const costByTier: Record<PuzzleTier, number> = {
    wooden: 50, bronze: 150, silver: 400,
    gold: 1000, crystal: 2500, celestial: 6000,
  };
  const cost = costByTier[tier];
  if (s.player.coins < cost) return { success: false, boxId: null, cost };

  const candidates = PB_ALL_BOXES.filter(
    (b) => b.tier === tier && !s.ownedBoxes.includes(b.id) && !s.player.solvedBoxes.includes(b.id)
  );
  if (candidates.length === 0) return { success: false, boxId: null, cost };

  s.player.coins -= cost;
  const rand = pbSeededRandom(Date.now() + 7);
  const chosen = candidates[Math.floor(rand(0) * candidates.length)];
  s.ownedBoxes.push(chosen.id);
  return { success: true, boxId: chosen.id, cost };
}

// ---------------------------------------------------------------------------
// Collection & Showcase
// ---------------------------------------------------------------------------

export function pbGetSolvedBoxes(): PuzzleBox[] {
  const s = ensureInit();
  return PB_ALL_BOXES.filter((b) => s.player.solvedBoxes.includes(b.id));
}

export function pbGetUnsolvedBoxes(): PuzzleBox[] {
  const s = ensureInit();
  return PB_ALL_BOXES.filter((b) => !s.player.solvedBoxes.includes(b.id));
}

export function pbGetSolvedCount(): number {
  return ensureInit().player.solvedBoxes.length;
}

export function pbGetUnsolvedCount(): number {
  return PB_ALL_BOXES.length - ensureInit().player.solvedBoxes.length;
}

export function pbGetCompletionPct(): number {
  return Math.floor((ensureInit().player.solvedBoxes.length / PB_ALL_BOXES.length) * 1000) / 10;
}

export function pbGetSolvedByTier(): Record<PuzzleTier, number> {
  const s = ensureInit();
  const result: Record<PuzzleTier, number> = { wooden: 0, bronze: 0, silver: 0, gold: 0, crystal: 0, celestial: 0 };
  for (const boxId of s.player.solvedBoxes) {
    const box = PB_ALL_BOXES.find((b) => b.id === boxId);
    if (box) result[box.tier]++;
  }
  return result;
}

export function pbGetSolvedByCategory(): Record<PuzzleCategory, number> {
  const s = ensureInit();
  const result: Record<PuzzleCategory, number> = {
    word_lock: 0, number_cipher: 0, pattern_match: 0,
    riddle_box: 0, symbol_decode: 0, color_logic: 0,
  };
  for (const boxId of s.player.solvedBoxes) {
    const box = PB_ALL_BOXES.find((b) => b.id === boxId);
    if (box) result[box.category]++;
  }
  return result;
}

export function pbGetBestTime(boxId: string): number | null {
  const s = ensureInit();
  return s.player.bestTimes[boxId] ?? null;
}

export function pbGetShowcaseIds(): string[] {
  return [...ensureInit().showcase];
}

export function pbAddToShowcase(boxId: string): boolean {
  const s = ensureInit();
  if (!s.player.solvedBoxes.includes(boxId)) return false;
  if (s.showcase.length >= 10) return false;
  if (s.showcase.includes(boxId)) return false;
  s.showcase.push(boxId);
  return true;
}

export function pbRemoveFromShowcase(boxId: string): boolean {
  const s = ensureInit();
  const idx = s.showcase.indexOf(boxId);
  if (idx === -1) return false;
  s.showcase.splice(idx, 1);
  return true;
}

export function pbGetCollectionCompletionBonuses(): { tier: PuzzleTier; label: string; completed: boolean; reward: string }[] {
  const s = ensureInit();
  return PB_TIERS.map((tier) => {
    const total = PB_ALL_BOXES.filter((b) => b.tier === tier).length;
    const solved = s.player.solvedBoxes.filter((id) => {
      const box = PB_ALL_BOXES.find((b) => b.id === id);
      return box?.tier === tier;
    }).length;
    const meta = PB_TIER_META[tier];
    return {
      tier,
      label: `${meta.label} Collection`,
      completed: solved >= total,
      reward: `500 ${meta.label} Coins + ${100 * (PB_TIERS.indexOf(tier) + 1)} XP`,
    };
  });
}

export function pbGetCategoryCompletionBonuses(): { category: PuzzleCategory; label: string; completed: boolean; reward: string }[] {
  const s = ensureInit();
  return PB_CATEGORIES.map((cat) => {
    const total = PB_ALL_BOXES.filter((b) => b.category === cat).length;
    const solved = s.player.solvedBoxes.filter((id) => {
      const box = PB_ALL_BOXES.find((b) => b.id === id);
      return box?.category === cat;
    }).length;
    const meta = PB_CATEGORY_META[cat];
    return {
      category: cat,
      label: `${meta.label} Master`,
      completed: solved >= total,
      reward: `300 Coins + 150 XP`,
    };
  });
}

// ---------------------------------------------------------------------------
// Progression Functions
// ---------------------------------------------------------------------------

export function pbGetPlayerLevel(): number {
  return ensureInit().player.level;
}

export function pbGetPlayerXP(): number {
  return ensureInit().player.xp;
}

export function pbGetXPToNextLevel(): number {
  return ensureInit().player.xpToNext;
}

export function pbAddXP(amount: number): { leveledUp: boolean; newLevel: number; xpGained: number } {
  const s = ensureInit();
  s.player.xp += amount;
  let leveledUp = false;
  let newLevel = s.player.level;

  while (s.player.xp >= s.player.xpToNext && s.player.level < 30) {
    s.player.xp -= s.player.xpToNext;
    s.player.level++;
    newLevel = s.player.level;
    s.player.xpToNext = pbGetXPForLevel(s.player.level);
    leveledUp = true;

    // Level up rewards
    const levelBonus = Math.floor(50 * Math.pow(1.5, s.player.level - 1));
    s.player.coins += levelBonus;
    if (s.player.level % 5 === 0) {
      s.player.gems += 10;
    }
    if (s.player.level % 10 === 0) {
      s.player.blueprints += 5;
    }
  }

  return { leveledUp, newLevel, xpGained: amount };
}

export function pbGetStreak(): number {
  return ensureInit().player.streak;
}

export function pbGetStreakBonus(): { multiplier: number; label: string } {
  const s = ensureInit();
  const mult = 1 + s.player.streak * 0.05;
  return {
    multiplier: Math.floor(mult * 100) / 100,
    label: s.player.streak > 0 ? `${s.player.streak}-day streak: +${Math.floor((mult - 1) * 100)}% rewards` : "No active streak",
  };
}

export function pbGetSpeedBonus(timeTaken: number, solveTimeLimit: number): { bonus: number; label: string } {
  const bonus = Math.max(0, Math.floor((solveTimeLimit - timeTaken) / solveTimeLimit * 100));
  const label = bonus > 80 ? "⚡ Lightning Fast!" : bonus > 50 ? "🔥 Speed Bonus!" : bonus > 20 ? "✨ Quick Solve" : bonus > 0 ? "👍 Timed Bonus" : "No time bonus";
  return { bonus, label };
}

export function pbGetTotalAttempts(): number {
  return ensureInit().player.totalAttempts;
}

export function pbGetSuccessRate(): number {
  const s = ensureInit();
  if (s.player.totalAttempts === 0) return 0;
  return Math.floor((s.player.totalSolved / s.player.totalAttempts) * 1000) / 10;
}

// ---------------------------------------------------------------------------
// Daily Puzzle
// ---------------------------------------------------------------------------

export function pbGetDailyPuzzle(dateStr?: string): { box: PuzzleBox; dateSeed: string; isCompleted: boolean } {
  const s = ensureInit();
  const dateSeed = dateStr ?? pbDateString();
  const seed = pbDateSeed(dateSeed) + (s.seedOffset || 0);
  const rand = pbSeededRandom(seed);
  const idx = Math.floor(rand(0) * PB_ALL_BOXES.length);
  const box = PB_ALL_BOXES[idx % PB_ALL_BOXES.length];

  return {
    box,
    dateSeed,
    isCompleted: s.player.dailyCompleted === dateSeed,
  };
}

export function pbIsDailyCompleted(dateStr?: string): boolean {
  const s = ensureInit();
  const dateSeed = dateStr ?? pbDateString();
  return s.player.dailyCompleted === dateSeed;
}

export function pbCompleteDaily(dateStr?: string): { success: boolean; bonusReward: RewardGrant } {
  const s = ensureInit();
  const dateSeed = dateStr ?? pbDateString();
  if (s.player.dailyCompleted === dateSeed) {
    return {
      success: false,
      bonusReward: { type: "coins", amount: 0, label: "Already completed", rarity: "wooden" },
    };
  }
  s.player.dailyCompleted = dateSeed;

  const dailyBonus: RewardGrant = {
    type: "coins",
    amount: 200,
    label: "Daily Completion: 200 Coins + 25 XP",
    rarity: "silver",
  };
  s.player.coins += 200;
  pbAddXP(25);

  return { success: true, bonusReward: dailyBonus };
}

// ---------------------------------------------------------------------------
// Weekly Puzzle Set
// ---------------------------------------------------------------------------

export function pbGetWeeklySet(dateStr?: string): { boxes: PuzzleBox[]; weekLabel: string; completed: string[] } {
  const s = ensureInit();
  const weekSeed = pbWeekSeed(dateStr) + (s.seedOffset || 0);
  const rand = pbSeededRandom(weekSeed);
  const weekLabel = dateStr
    ? `Week of ${dateStr}`
    : `Week of ${pbDateString()}`;

  const shuffled = [...PB_ALL_BOXES].sort((a, b) => rand(PB_ALL_BOXES.indexOf(a)) - rand(PB_ALL_BOXES.indexOf(b)));
  const selected = shuffled.slice(0, 7);

  return {
    boxes: selected,
    weekLabel,
    completed: selected.filter((b) => s.player.weeklyCompleted.includes(b.id)).map((b) => b.id),
  };
}

export function pbGetWeeklyProgress(dateStr?: string): { total: number; completed: number; percentage: number } {
  const weekly = pbGetWeeklySet(dateStr);
  return {
    total: weekly.boxes.length,
    completed: weekly.completed.length,
    percentage: Math.floor((weekly.completed.length / weekly.boxes.length) * 100),
  };
}

export function pbCompleteWeeklyBox(boxId: string): { success: boolean; weekBonus: boolean } {
  const s = ensureInit();
  if (!s.player.weeklyCompleted.includes(boxId)) {
    s.player.weeklyCompleted.push(boxId);
  }
  const weekly = pbGetWeeklySet();
  const weekBonus = weekly.boxes.every((b) => s.player.weeklyCompleted.includes(b.id));
  if (weekBonus) {
    s.player.coins += 1000;
    s.player.gems += 50;
    pbAddXP(500);
  }
  return { success: true, weekBonus };
}

// ---------------------------------------------------------------------------
// Achievement Functions
// ---------------------------------------------------------------------------

export function pbGetAllAchievements(): AchievementDef[] {
  return [...PB_ACHIEVEMENT_DEFS];
}

export function pbGetUnlockedAchievements(): AchievementDef[] {
  const s = ensureInit();
  return PB_ACHIEVEMENT_DEFS.filter((a) => s.player.achievements.includes(a.id));
}

export function pbIsAchievementUnlocked(id: string): boolean {
  return ensureInit().player.achievements.includes(id);
}

export function pbGetAchievementCount(): { unlocked: number; total: number } {
  const s = ensureInit();
  return { unlocked: s.player.achievements.length, total: PB_ACHIEVEMENT_DEFS.length };
}

export function pbCheckAndUnlockAchievements(): string[] {
  const s = ensureInit();
  const newlyUnlocked: string[] = [];
  for (const ach of PB_ACHIEVEMENT_DEFS) {
    if (!s.player.achievements.includes(ach.id) && ach.condition(s)) {
      s.player.achievements.push(ach.id);
      pbAddXP(ach.xpReward);
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

export function pbGetAchievementProgress(id: string): { current: number; target: number; label: string } {
  const s = ensureInit();
  const ach = PB_ACHIEVEMENT_DEFS.find((a) => a.id === id);
  if (!ach) return { current: 0, target: 1, label: "Unknown" };

  switch (id) {
    case "first_solve": return { current: Math.min(s.player.totalSolved, 1), target: 1, label: "Solve 1 box" };
    case "ten_solves": return { current: Math.min(s.player.totalSolved, 10), target: 10, label: "Solve 10 boxes" };
    case "twenty_five_solves": return { current: Math.min(s.player.totalSolved, 25), target: 25, label: "Solve 25 boxes" };
    case "fifty_solves": return { current: Math.min(s.player.totalSolved, 50), target: 50, label: "Solve 50 boxes" };
    case "all_solved": return { current: s.player.totalSolved, target: 60, label: "Solve all 60 boxes" };
    case "streak_3": return { current: Math.min(s.player.streak, 3), target: 3, label: "3-day streak" };
    case "streak_7": return { current: Math.min(s.player.streak, 7), target: 7, label: "7-day streak" };
    case "streak_30": return { current: Math.min(s.player.streak, 30), target: 30, label: "30-day streak" };
    case "speed_demon": {
      const fastest = Math.min(...Object.values(s.player.bestTimes), Infinity);
      return { current: fastest < 10 ? 1 : 0, target: 1, label: "Solve under 10s" };
    }
    case "no_hints": {
      const noHint = s.player.solvedBoxes.filter((bid) => !(s.player.hintsUsed[bid] && s.player.hintsUsed[bid] > 0)).length;
      return { current: Math.min(noHint, 5), target: 5, label: "5 solves without hints" };
    }
    case "collector_wooden": {
      const total = PB_ALL_BOXES.filter((b) => b.tier === "wooden").length;
      const solved = s.player.solvedBoxes.filter((bid) => PB_ALL_BOXES.find((b) => b.id === bid)?.tier === "wooden").length;
      return { current: solved, target: total, label: "All Wooden boxes" };
    }
    case "collector_bronze": {
      const total = PB_ALL_BOXES.filter((b) => b.tier === "bronze").length;
      const solved = s.player.solvedBoxes.filter((bid) => PB_ALL_BOXES.find((b) => b.id === bid)?.tier === "bronze").length;
      return { current: solved, target: total, label: "All Bronze boxes" };
    }
    case "collector_silver": {
      const total = PB_ALL_BOXES.filter((b) => b.tier === "silver").length;
      const solved = s.player.solvedBoxes.filter((bid) => PB_ALL_BOXES.find((b) => b.id === bid)?.tier === "silver").length;
      return { current: solved, target: total, label: "All Silver boxes" };
    }
    case "category_master": {
      const cats = PB_CATEGORIES.filter((cat) =>
        PB_ALL_BOXES.filter((b) => b.category === cat).some((b) => s.player.solvedBoxes.includes(b.id))
      ).length;
      return { current: cats, target: PB_CATEGORIES.length, label: "All categories" };
    }
    case "daily_week": {
      const chars = s.player.dailyCompleted.length;
      return { current: Math.min(Math.floor(chars / 10), 7), target: 7, label: "7 daily completions" };
    }
    default: return { current: 0, target: 1, label: ach.description };
  }
}

// ---------------------------------------------------------------------------
// UI Helper Functions
// ---------------------------------------------------------------------------

export function pbGetBoxCard(boxId: string): BoxCardData | null {
  const s = ensureInit();
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return null;

  const tierMeta = PB_TIER_META[box.tier];
  const catMeta = PB_CATEGORY_META[box.category];
  const rewardMeta = PB_REWARD_ICONS[box.rewardType];
  const solved = s.player.solvedBoxes.includes(boxId);
  const bestTime = s.player.bestTimes[boxId] ?? null;

  return {
    id: box.id,
    name: box.name,
    tier: box.tier,
    tierLabel: tierMeta.label,
    tierColor: tierMeta.color,
    category: box.category,
    categoryIcon: catMeta.icon,
    difficulty: box.difficulty,
    difficultyStars: "★".repeat(box.difficulty) + "☆".repeat(10 - box.difficulty),
    solved,
    bestTime,
    rewardType: box.rewardType,
    rewardIcon: rewardMeta.icon,
    description: box.description,
    flavorText: box.flavorText,
  };
}

export function pbGetSolveCard(boxId: string): SolveCardData | null {
  const s = ensureInit();
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return null;

  const tierMeta = PB_TIER_META[box.tier];
  const hintsUsed = s.player.hintsUsed[boxId] ?? 0;
  const hintsRemaining = box.hintCount - hintsUsed;
  const elapsedTime = s.player.solveStartTime ? (Date.now() - s.player.solveStartTime) / 1000 : 0;

  let currentHint: string | null = null;
  if (hintsUsed > 0) {
    const data = box.puzzleData;
    const hints: string[] = (data.hints as string[]) ?? [];
    currentHint = hintsUsed <= hints.length ? hints[hintsUsed - 1] : null;
  }

  return {
    boxId: box.id,
    name: box.name,
    category: box.category,
    tier: box.tier,
    tierColor: tierMeta.color,
    difficulty: box.difficulty,
    puzzleDisplay: box.puzzleData,
    hintsRemaining,
    currentHint,
    elapsedTime: Math.floor(elapsedTime * 100) / 100,
    attemptsTotal: s.player.totalAttempts,
  };
}

export function pbGetRewardCard(reward: RewardGrant): RewardCardData {
  const meta = PB_REWARD_ICONS[reward.type];
  const tierMeta = PB_TIER_META[reward.rarity];

  return {
    type: reward.type,
    amount: reward.amount,
    label: reward.label,
    icon: meta.icon,
    color: meta.color,
    rarity: reward.rarity,
    bonusLabel: reward.rarity !== "wooden" ? `${tierMeta.label} Quality` : null,
  };
}

export function pbGetDailyCard(dateStr?: string): DailyCardData {
  const s = ensureInit();
  const dateSeed = dateStr ?? pbDateString();
  const daily = pbGetDailyPuzzle(dateSeed);
  const box = daily.box;
  const catMeta = PB_CATEGORY_META[box.category];

  return {
    dateSeed,
    puzzleId: box.id,
    puzzleName: box.name,
    category: box.category,
    difficulty: box.difficulty,
    bonusReward: {
      type: "coins",
      amount: 200,
      label: "Daily Bonus: 200 Coins + 25 XP",
      rarity: "silver",
    },
    completed: daily.isCompleted,
    timeRemaining: "Resets at midnight",
  };
}

export function pbGetStatsGrid(): StatsGridData {
  const s = ensureInit();
  const completionPct = Math.floor((s.player.totalSolved / PB_ALL_BOXES.length) * 100);

  return [
    { label: "Level", value: `${s.player.level}`, icon: "📊", color: "#4A90D9" },
    { label: "XP Progress", value: `${s.player.xp}/${s.player.xpToNext}`, icon: "✨", color: "#F39C12" },
    { label: "Coins", value: `${s.player.coins}`, icon: "🪙", color: "#FFD700" },
    { label: "Gems", value: `${s.player.gems}`, icon: "💎", color: "#7DF9FF" },
    { label: "Blueprints", value: `${s.player.blueprints}`, icon: "📋", color: "#5DADE2" },
    { label: "Artifacts", value: `${s.player.artifacts.length}`, icon: "🏺", color: "#AF7AC5" },
    { label: "Boxes Solved", value: `${s.player.totalSolved}/${PB_ALL_BOXES.length}`, icon: "📦", color: "#2ECC71" },
    { label: "Completion", value: `${completionPct}%`, icon: "🎯", color: completionPct >= 100 ? "#FFD700" : "#E74C3C" },
    { label: "Current Streak", value: `${s.player.streak} days`, icon: "🔥", color: s.player.streak >= 7 ? "#FF6347" : "#95A5A6" },
    { label: "Total Attempts", value: `${s.player.totalAttempts}`, icon: "🔄", color: "#8E44AD" },
    { label: "Success Rate", value: `${pbGetSuccessRate()}%`, icon: "📈", color: "#27AE60" },
    { label: "Achievements", value: `${s.player.achievements.length}/${PB_ACHIEVEMENT_DEFS.length}`, icon: "🏆", color: "#F1C40F" },
    { label: "Hints Used", value: `${s.player.showHintsUsed}`, icon: "💡", color: "#E67E22" },
    { label: "Trade Tokens", value: `${s.player.tradeTokens}`, icon: "♻️", color: "#1ABC9C" },
    { label: "Showcase Items", value: `${s.showcase.length}/10`, icon: "🖼️", color: "#3498DB" },
    { label: "Mystery Prizes", value: `${s.player.mysteryPrizes.length}`, icon: "🎁", color: "#E74C3C" },
  ];
}

export function pbGetAchievements(): AchievementCardData[] {
  const s = ensureInit();
  return PB_ACHIEVEMENT_DEFS.map((ach) => {
    const unlocked = s.player.achievements.includes(ach.id);
    const progress = pbGetAchievementProgress(ach.id);
    return {
      id: ach.id,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      unlocked,
      xpReward: ach.xpReward,
      progress: `${progress.current}/${progress.target}`,
    };
  });
}

export function pbGetCollectionOverview(): CollectionOverviewData {
  const s = ensureInit();
  const solved = s.player.solvedBoxes.length;
  const unsolved = PB_ALL_BOXES.length - solved;
  const completionPct = Math.floor((solved / PB_ALL_BOXES.length) * 1000) / 10;

  const byTier = PB_TIERS.map((tier) => {
    const meta = PB_TIER_META[tier];
    const total = PB_ALL_BOXES.filter((b) => b.tier === tier).length;
    const tierSolved = s.player.solvedBoxes.filter((id) => PB_ALL_BOXES.find((b) => b.id === id)?.tier === tier).length;
    return { tier, label: meta.label, color: meta.color, total, solved: tierSolved };
  });

  const byCategory = PB_CATEGORIES.map((cat) => {
    const meta = PB_CATEGORY_META[cat];
    const total = PB_ALL_BOXES.filter((b) => b.category === cat).length;
    const catSolved = s.player.solvedBoxes.filter((id) => PB_ALL_BOXES.find((b) => b.id === id)?.category === cat).length;
    return { category: cat, label: meta.label, icon: meta.icon, total, solved: catSolved };
  });

  const recentSolves = s.player.solvedBoxes.slice(-5).reverse().map((boxId) => {
    const box = PB_ALL_BOXES.find((b) => b.id === boxId);
    return {
      boxId,
      name: box?.name ?? "Unknown",
      tier: box?.tier ?? "wooden",
      timeAgo: "Recently",
    };
  });

  const showcaseItems = s.showcase.slice(0, 5).map((boxId) => {
    const card = pbGetBoxCard(boxId);
    if (!card) return { id: boxId, name: "Unknown", tier: "wooden" as PuzzleTier, tierLabel: "", tierColor: "", category: "" as PuzzleCategory, categoryIcon: "", difficulty: 0, difficultyStars: "", solved: true, bestTime: null, rewardType: "" as RewardType, rewardIcon: "", description: "", flavorText: "" };
    return card;
  });

  const completionBonus = pbGetCollectionCompletionBonuses().map((cb) => ({
    unlocked: cb.completed,
    label: cb.label,
    reward: cb.reward,
  }));

  return {
    totalBoxes: PB_ALL_BOXES.length,
    solved,
    unsolved,
    completionPct,
    byTier,
    byCategory,
    recentSolves,
    showcaseItems,
    completionBonus,
  };
}

export function pbGetSolveProgress(): { currentBox: string | null; category: PuzzleCategory | null; elapsed: number; hintsUsed: number } {
  const s = ensureInit();
  if (!s.player.currentBox) return { currentBox: null, category: null, elapsed: 0, hintsUsed: 0 };
  const box = PB_ALL_BOXES.find((b) => b.id === s.player.currentBox);
  return {
    currentBox: s.player.currentBox,
    category: box?.category ?? null,
    elapsed: s.player.solveStartTime ? (Date.now() - s.player.solveStartTime) / 1000 : 0,
    hintsUsed: s.player.hintsUsed[s.player.currentBox] ?? 0,
  };
}

export function pbGetPlayerSummary(): { level: number; coins: number; gems: number; solvedCount: number; streak: number; achievements: number } {
  const s = ensureInit();
  return {
    level: s.player.level,
    coins: s.player.coins,
    gems: s.player.gems,
    solvedCount: s.player.totalSolved,
    streak: s.player.streak,
    achievements: s.player.achievements.length,
  };
}

// ---------------------------------------------------------------------------
// Puzzle Content Access (for UI rendering)
// ---------------------------------------------------------------------------

export function pbGetWordPuzzleData(boxId: string): { scrambled: string; hints: string[] } | null {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box || box.category !== "word_lock") return null;
  const d = box.puzzleData;
  return { scrambled: String(d.scrambled), hints: d.hints as string[] };
}

export function pbGetNumberPuzzleData(boxId: string): { equation: string; hints: string[] } | null {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box || box.category !== "number_cipher") return null;
  const d = box.puzzleData;
  return { equation: String(d.equation), hints: d.hints as string[] };
}

export function pbGetPatternPuzzleData(boxId: string): { sequence: unknown[]; hint: string; rule: string } | null {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box || box.category !== "pattern_match") return null;
  const d = box.puzzleData;
  return { sequence: d.sequence as unknown[], hint: String(d.hint ?? ""), rule: String(d.rule ?? "") };
}

export function pbGetRiddlePuzzleData(boxId: string): { riddle: string; hints: string[] } | null {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box || box.category !== "riddle_box") return null;
  const d = box.puzzleData;
  return { riddle: String(d.riddle), hints: d.hints as string[] };
}

export function pbGetSymbolPuzzleData(boxId: string): { symbols: string[]; encrypted: string; hints: string[] } | null {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box || box.category !== "symbol_decode") return null;
  const d = box.puzzleData;
  return { symbols: d.symbols as string[], encrypted: String(d.encrypted), hints: d.hints as string[] };
}

export function pbGetColorPuzzleData(boxId: string): { colors: string[]; slots: number; clues: string[] } | null {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box || box.category !== "color_logic") return null;
  const d = box.puzzleData;
  return { colors: d.colors as string[], slots: d.slots as number, clues: d.clues as string[] };
}

// ---------------------------------------------------------------------------
// Leaderboard / Ranking Helpers
// ---------------------------------------------------------------------------

export function pbGetPlayerRank(): { title: string; color: string } {
  const level = ensureInit().player.level;
  if (level >= 25) return { title: "Puzzle Grandmaster", color: "#E0B0FF" };
  if (level >= 20) return { title: "Puzzle Legend", color: "#7DF9FF" };
  if (level >= 15) return { title: "Puzzle Expert", color: "#FFD700" };
  if (level >= 10) return { title: "Puzzle Adept", color: "#C0C0C0" };
  if (level >= 5) return { title: "Puzzle Apprentice", color: "#CD7F32" };
  return { title: "Puzzle Novice", color: "#8B6914" };
}

export function pbGetLevelMilestones(): { level: number; reward: string }[] {
  return [
    { level: 5, reward: "100 Coins + Bronze Badge" },
    { level: 10, reward: "500 Coins + Silver Badge + 10 Gems" },
    { level: 15, reward: "1000 Coins + Gold Badge + 25 Gems + 5 Blueprints" },
    { level: 20, reward: "2500 Coins + Crystal Badge + 50 Gems + 10 Blueprints" },
    { level: 25, reward: "5000 Coins + Legendary Badge + 100 Gems + 20 Blueprints" },
    { level: 30, reward: "10000 Coins + Mythic Badge + 200 Gems + 50 Blueprints + Artifact" },
  ];
}

// ---------------------------------------------------------------------------
// Difficulty / Balance Helpers
// ---------------------------------------------------------------------------

export function pbGetRecommendedBoxes(): PuzzleBox[] {
  const s = ensureInit();
  const avgDifficulty = Math.min(10, Math.floor(s.player.level / 3) + 1);
  return PB_ALL_BOXES.filter((b) =>
    !s.player.solvedBoxes.includes(b.id) &&
    s.ownedBoxes.includes(b.id) &&
    b.difficulty >= avgDifficulty - 1 &&
    b.difficulty <= avgDifficulty + 2
  ).sort((a, b) => a.difficulty - b.difficulty);
}

export function pbGetDifficultyDistribution(): { difficulty: number; total: number; solved: number }[] {
  const s = ensureInit();
  const distribution: { difficulty: number; total: number; solved: number }[] = [];
  for (let d = 1; d <= 10; d++) {
    const total = PB_ALL_BOXES.filter((b) => b.difficulty === d).length;
    const solved = PB_ALL_BOXES.filter(
      (b) => b.difficulty === d && s.player.solvedBoxes.includes(b.id)
    ).length;
    distribution.push({ difficulty: d, total, solved });
  }
  return distribution;
}

// ---------------------------------------------------------------------------
// Event / Inventory Helpers
// ---------------------------------------------------------------------------

export function pbGetTradeTokenCount(): number {
  return ensureInit().player.tradeTokens;
}

export function pbGetPurchaseCost(tier: PuzzleTier): number {
  const costs: Record<PuzzleTier, number> = {
    wooden: 50, bronze: 150, silver: 400,
    gold: 1000, crystal: 2500, celestial: 6000,
  };
  return costs[tier];
}

export function pbGetAllArtifacts(): string[] {
  return [...PB_ARTIFACTS];
}

export function pbGetAllMysteryPrizeNames(): string[] {
  return [...PB_MYSTERY_PRIZES];
}

// ---------------------------------------------------------------------------
// Validation / Utility
// ---------------------------------------------------------------------------

export function pbValidateAnswer(boxId: string, answer: string): boolean {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return false;
  const expected = String(box.puzzleData.answer).trim().toLowerCase();
  return answer.trim().toLowerCase() === expected;
}

export function pbFormatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export function pbGetBoxDisplayName(boxId: string): string {
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  return box?.name ?? "Unknown Box";
}

export function pbGetCategoryLabel(category: PuzzleCategory): string {
  return PB_CATEGORY_META[category]?.label ?? category;
}

export function pbGetTierLabel(tier: PuzzleTier): string {
  return PB_TIER_META[tier]?.label ?? tier;
}

export function pbGetRewardLabel(type: RewardType, amount: number): string {
  const meta = PB_REWARD_ICONS[type];
  return `${meta.icon} ${amount} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
}

export function pbGetTotalEarned(): { coins: number; gems: number } {
  const s = ensureInit();
  return {
    coins: s.player.totalCoinsEarned,
    gems: s.player.totalGemsEarned,
  };
}

export function pbGetRecentSolveCount(lastN: number): number {
  const s = ensureInit();
  return Math.min(s.player.solvedBoxes.length, lastN);
}

// ---------------------------------------------------------------------------
// Additional Content Accessors
// ---------------------------------------------------------------------------

export function pbGetPatternCount(): number {
  return PB_PATTERN_SEQUENCES.length;
}

export function pbGetRiddleCount(): number {
  return PB_RIDDLES.length;
}

export function pbGetBoxTypes(): string[] {
  return PB_CATEGORIES.map((c) => c);
}

export function pbGetTierOrder(): PuzzleTier[] {
  return [...PB_TIERS];
}

export function pbIsMaxLevel(): boolean {
  return ensureInit().player.level >= 30;
}

export function pbGetTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += pbGetXPForLevel(i);
  }
  return total;
}

export function pbGetNextAchievement(): AchievementDef | null {
  const s = ensureInit();
  for (const ach of PB_ACHIEVEMENT_DEFS) {
    if (!s.player.achievements.includes(ach.id) && !ach.condition(s)) {
      return ach;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Seed / Debug Helpers (for testing)
// ---------------------------------------------------------------------------

export function pbSetSeedOffset(offset: number): void {
  ensureInit().seedOffset = offset;
}

export function pbDebugGrantCoins(amount: number): void {
  ensureInit().player.coins += amount;
}

export function pbDebugGrantGems(amount: number): void {
  ensureInit().player.gems += amount;
}

export function pbDebugSolveBox(boxId: string): boolean {
  const s = ensureInit();
  if (s.player.solvedBoxes.includes(boxId)) return false;
  const box = PB_ALL_BOXES.find((b) => b.id === boxId);
  if (!box) return false;
  s.player.solvedBoxes.push(boxId);
  s.player.totalSolved++;
  s.player.bestTimes[boxId] = Math.random() * 30 + 5;
  pbGrantReward(box);
  pbCheckAndUnlockAchievements();
  return true;
}

export function pbDebugSetLevel(level: number): void {
  const s = ensureInit();
  s.player.level = Math.min(Math.max(level, 1), 30);
  s.player.xp = 0;
  s.player.xpToNext = pbGetXPForLevel(s.player.level);
}

export function pbDebugSetStreak(streak: number): void {
  ensureInit().player.streak = streak;
}

// ---------------------------------------------------------------------------
// Puzzle Box count verification
// ---------------------------------------------------------------------------

export function pbVerifyBoxCount(): { total: number; byCategory: Record<string, number>; byTier: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  for (const box of PB_ALL_BOXES) {
    byCategory[box.category] = (byCategory[box.category] ?? 0) + 1;
    byTier[box.tier] = (byTier[box.tier] ?? 0) + 1;
  }
  return { total: PB_ALL_BOXES.length, byCategory, byTier };
}


