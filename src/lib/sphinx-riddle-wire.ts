// ─────────────────────────────────────────────────────────────
// sphinx-riddle-wire.ts — Sphinx Riddle (斯芬克斯谜题)
// Ancient Egyptian riddle game — 60+ riddles, knowledge trees,
// hieroglyph cipher mini-game, treasure vault, reputation & more
// ─────────────────────────────────────────────────────────────

// ─── Type Definitions ───────────────────────────────────────

export type SphinxRiddleCategory = 'logic' | 'wordplay' | 'math' | 'philosophy' | 'nature' | 'history';

export type SphinxDifficulty = 'mortal' | 'hero' | 'demigod' | 'godlike';

export type SphinxHintLevel = 0 | 1 | 2 | 3;

export type SphinxRank =
  | 'wanderer'
  | 'initiate'
  | 'scholar'
  | 'oracle'
  | 'keeper'
  | 'pharaoh';

export type KnowledgeBranch = 'wisdom' | 'courage' | 'mystery' | 'justice' | 'creation';

export type ArtifactRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic';

export type RiddleStatus = 'unsolved' | 'solved' | 'hint1' | 'hint2' | 'hint3' | 'failed';

export type HieroglyphSymbol =
  | 'ankh'
  | 'eye'
  | 'scarab'
  | 'pyramid'
  | 'sun'
  | 'moon'
  | 'snake'
  | 'bird'
  | 'lotus'
  | 'water';

export interface SphinxRiddle {
  id: string;
  question: string;
  answer: string;
  category: SphinxRiddleCategory;
  difficulty: SphinxDifficulty;
  sphinxType: string;
  hints: [string, string, string];
  lore: string;
}

export interface SphinxType {
  id: string;
  name: string;
  title: string;
  description: string;
  riddleStyle: string;
  preferredCategories: SphinxRiddleCategory[];
  personality: string;
}

export interface Artifact {
  id: string;
  name: string;
  lore: string;
  rarity: ArtifactRarity;
  bonusRep: number;
  bonusXp: number;
  requiredRank: SphinxRank;
  category: SphinxRiddleCategory;
}

export interface KnowledgeNode {
  id: string;
  branch: KnowledgeBranch;
  name: string;
  description: string;
  requiredPoints: number;
  unlocked: boolean;
  bonus: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlocked: boolean;
  reward: { rep: number; xp: number; artifact?: string };
}

export interface DailyChallenge {
  dateStr: string;
  riddleId: string;
  completed: boolean;
  answeredCorrectly: boolean;
  timeLimit: number;
  hintsUsed: number;
}

export interface HieroglyphCipher {
  symbols: HieroglyphSymbol[];
  translation: string;
  difficulty: SphinxDifficulty;
  solved: boolean;
  attempts: number;
}

export interface TreasureVaultKey {
  riddleId: string;
  unlockedAt: number;
  vaultIndex: number;
}

export interface VaultRoom {
  index: number;
  name: string;
  description: string;
  locked: boolean;
  reward: string;
  requiredKeys: number;
}

export interface OracleProgress {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
}

export interface RiddleResult {
  riddleId: string;
  correct: boolean;
  hintsUsed: number;
  timeTaken: number;
  repGained: number;
  xpGained: number;
}

export interface SphinxRiddleState {
  // Core
  currentRiddle: SphinxRiddle | null;
  riddleStatus: RiddleStatus;
  currentHintLevel: SphinxHintLevel;
  score: number;
  totalXp: number;

  // Reputation
  reputation: number;
  rank: SphinxRank;

  // Progress
  solvedRiddleIds: string[];
  failedRiddleIds: string[];
  riddleHistory: RiddleResult[];
  consecutiveCorrect: number;
  bestStreak: number;

  // Daily
  dailyChallenge: DailyChallenge | null;
  currentStreak: number;
  longestStreak: number;
  lastDailyDate: string;

  // Knowledge Tree
  knowledgePoints: Record<KnowledgeBranch, number>;
  unlockedNodes: string[];

  // Artifacts
  ownedArtifacts: string[];
  equippedArtifact: string | null;

  // Hieroglyph
  currentCipher: HieroglyphCipher | null;
  ciphersCompleted: number;
  ciphersFailed: number;

  // Treasure Vault
  vaultKeys: TreasureVaultKey[];
  vaultRooms: VaultRoom[];

  // Achievements
  achievements: string[];

  // Oracle
  oracle: OracleProgress;

  // Stats
  totalRiddlesAttempted: number;
  totalCorrect: number;
  totalHintsUsed: number;
  favoriteCategory: SphinxRiddleCategory;
  gamesPlayed: number;

  // Meta
  activeSphinxType: string;
  selectedDifficulty: SphinxDifficulty;
  error: string | null;
}

// ─── Constants ──────────────────────────────────────────────

export const SPHINX_RIDDLE_CATEGORIES: { id: SphinxRiddleCategory; label: string; icon: string }[] = [
  { id: 'logic', label: 'Logic', icon: '🧠' },
  { id: 'wordplay', label: 'Wordplay', icon: '✨' },
  { id: 'math', label: 'Math', icon: '🔢' },
  { id: 'philosophy', label: 'Philosophy', icon: '🏛️' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'history', label: 'History', icon: '📜' },
];

export const SPHINX_DIFFICULTY_TIERS: { id: SphinxDifficulty; label: string; repMultiplier: number; xpMultiplier: number }[] = [
  { id: 'mortal', label: 'Mortal', repMultiplier: 1, xpMultiplier: 1 },
  { id: 'hero', label: 'Hero', repMultiplier: 1.5, xpMultiplier: 1.5 },
  { id: 'demigod', label: 'Demigod', repMultiplier: 2.5, xpMultiplier: 2.5 },
  { id: 'godlike', label: 'Godlike', repMultiplier: 4, xpMultiplier: 4 },
];

export const SPHINX_RANK_THRESHOLDS: { rank: SphinxRank; minRep: number; title: string }[] = [
  { rank: 'wanderer', minRep: 0, title: 'Desert Wanderer' },
  { rank: 'initiate', minRep: 100, title: 'Temple Initiate' },
  { rank: 'scholar', minRep: 300, title: 'Sacred Scholar' },
  { rank: 'oracle', minRep: 550, title: 'Great Oracle' },
  { rank: 'keeper', minRep: 800, title: 'Keeper of Riddles' },
  { rank: 'pharaoh', minRep: 1000, title: 'Pharaoh of Sphinx' },
];

export const KNOWLEDGE_BRANCHES: { id: KnowledgeBranch; name: string; color: string; icon: string }[] = [
  { id: 'wisdom', name: 'Wisdom', color: '#FFD700', icon: '📖' },
  { id: 'courage', name: 'Courage', color: '#FF4500', icon: '⚔️' },
  { id: 'mystery', name: 'Mystery', color: '#8B00FF', icon: '🔮' },
  { id: 'justice', name: 'Justice', color: '#4169E1', icon: '⚖️' },
  { id: 'creation', name: 'Creation', color: '#00C853', icon: '🎨' },
];

export const HIEROGLYPH_ALPHABET: Record<string, HieroglyphSymbol> = {
  a: 'ankh', b: 'eye', c: 'scarab', d: 'pyramid', e: 'sun',
  f: 'moon', g: 'snake', h: 'bird', i: 'lotus', j: 'water',
  k: 'ankh', l: 'eye', m: 'scarab', n: 'pyramid', o: 'sun',
  p: 'moon', q: 'snake', r: 'bird', s: 'lotus', t: 'water',
  u: 'ankh', v: 'eye', w: 'scarab', x: 'pyramid', y: 'sun', z: 'moon',
};

export const HIEROGLYPH_SYMBOLS_DISPLAY: Record<HieroglyphSymbol, string> = {
  ankh: '☥', eye: '👁️', scarab: '🪲', pyramid: '🔺', sun: '☀️',
  moon: '🌙', snake: '🐍', bird: '🐦', lotus: '🪷', water: '💧',
};

export const SPHINX_TYPES: SphinxType[] = [
  {
    id: 'guardian', name: 'Guardian Sphinx', title: 'The Eternal Watcher',
    description: 'A stoic sphinx who guards the ancient gates of Thebes.',
    riddleStyle: 'Classical logic puzzles with formal structure',
    preferredCategories: ['logic', 'philosophy'],
    personality: 'Stern but fair, speaks in measured tones',
  },
  {
    id: 'shadow', name: 'Shadow Sphinx', title: 'Whisper of the Dunes',
    description: 'Appears only at twilight, weaving cryptic wordplay.',
    riddleStyle: 'Poetic wordplay and linguistic tricks',
    preferredCategories: ['wordplay', 'philosophy'],
    personality: 'Mysterious, speaks in riddles within riddles',
  },
  {
    id: 'golden', name: 'Golden Sphinx', title: 'Eye of Ra',
    description: 'Radiant and magnificent, tests mathematical prowess.',
    riddleStyle: 'Numerical puzzles and mathematical conundrums',
    preferredCategories: ['math', 'logic'],
    personality: 'Proud and brilliant, values precision',
  },
  {
    id: 'desert', name: 'Desert Sphinx', title: 'Voice of the Sands',
    description: 'Emerges from sandstorms with nature-themed challenges.',
    riddleStyle: 'Natural world observations and environmental enigmas',
    preferredCategories: ['nature', 'philosophy'],
    personality: 'Ancient and patient, connected to all living things',
  },
  {
    id: 'royal', name: 'Royal Sphinx', title: 'Crown of the Nile',
    description: 'Adorned with the double crown, keeper of dynastic secrets.',
    riddleStyle: 'Historical questions about ancient civilizations',
    preferredCategories: ['history', 'philosophy'],
    personality: 'Regal and demanding, expects excellence',
  },
  {
    id: 'child', name: 'Child Sphinx', title: 'The Young Questioner',
    description: 'A playful sphinx cub with surprisingly deep riddles.',
    riddleStyle: 'Simple-sounding questions with profound answers',
    preferredCategories: ['logic', 'wordplay'],
    personality: 'Playful and curious, giggles when stumped',
  },
  {
    id: 'star', name: 'Star Sphinx', title: 'Celestial Observer',
    description: 'Covered in star-maps, poses cosmic riddles.',
    riddleStyle: 'Astronomical and mathematical cosmic puzzles',
    preferredCategories: ['math', 'nature'],
    personality: 'Serene and otherworldly, speaks slowly',
  },
  {
    id: 'war', name: 'War Sphinx', title: 'Battle-Hardened Sentinel',
    description: 'Scarred by millennia of challengers, offers combat riddles.',
    riddleStyle: 'Strategic and tactical logic problems',
    preferredCategories: ['logic', 'history'],
    personality: 'Intense and challenging, respects strength',
  },
  {
    id: 'dream', name: 'Dream Sphinx', title: 'Walker Between Worlds',
    description: 'Exists between sleeping and waking, speaks in paradox.',
    riddleStyle: 'Philosophical paradoxes and dream-logic puzzles',
    preferredCategories: ['philosophy', 'wordplay'],
    personality: 'Ethereal and dreamlike, hard to pin down',
  },
  {
    id: 'crystal', name: 'Crystal Sphinx', title: 'The Prismatic Mind',
    description: 'Made of living crystal, refracts truth into puzzles.',
    riddleStyle: 'Multi-layered riddles that change based on perspective',
    preferredCategories: ['logic', 'math', 'wordplay'],
    personality: 'Analytical and multifaceted, sees all angles',
  },
];

// ─── 60 Riddles ─────────────────────────────────────────────

export const ALL_RIDDLES: SphinxRiddle[] = [
  // ── Logic (10) ──
  { id: 'l01', question: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?', answer: 'map', category: 'logic', difficulty: 'mortal', sphinxType: 'guardian', hints: ['You can fold me up', 'I show the world on paper', 'Cartographers create me'], lore: 'The Guardian Sphinx asks this of every traveller who approaches the gates of Thebes.' },
  { id: 'l02', question: 'The more you take, the more you leave behind. What am I?', answer: 'footsteps', category: 'logic', difficulty: 'mortal', sphinxType: 'shadow', hints: ['You make them while walking', 'They disappear in sand', 'Follow your own path'], lore: 'The Shadow Sphinx leaves this riddle written in sand at dusk.' },
  { id: 'l03', question: 'What has keys but no locks, space but no room, and you can enter but cannot go inside?', answer: 'keyboard', category: 'logic', difficulty: 'mortal', sphinxType: 'child', hints: ['You press my keys daily', 'I sit on a desk', 'I help you write'], lore: 'Even the Child Sphinx chuckles when mortals guess this one wrong.' },
  { id: 'l04', question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?', answer: 'echo', category: 'logic', difficulty: 'hero', sphinxType: 'guardian', hints: ['Found in canyons', 'I repeat what you say', 'Sound reflected'], lore: 'The Guardian Sphinx carved this riddle into the canyon walls of Karnak.' },
  { id: 'l05', question: 'What can travel around the world while staying in a corner?', answer: 'stamp', category: 'logic', difficulty: 'hero', sphinxType: 'royal', hints: ['Found on envelopes', 'I show faraway places', 'Post offices sell me'], lore: 'The Royal Sphinx collected messages from across the ancient world.' },
  { id: 'l06', question: 'What disappears as soon as you say its name?', answer: 'silence', category: 'logic', difficulty: 'hero', sphinxType: 'shadow', hints: ['It is the absence of sound', 'Say nothing to keep it', 'Libraries treasure it'], lore: 'The Shadow Sphinx teaches that silence is the greatest answer.' },
  { id: 'l07', question: 'I have hands but cannot clap. What am I?', answer: 'clock', category: 'logic', difficulty: 'mortal', sphinxType: 'child', hints: ['I show the time', 'My face has numbers', 'I tick constantly'], lore: 'The Child Sphinx watches time pass with innocent curiosity.' },
  { id: 'l08', question: 'What has a head and a tail but no body?', answer: 'coin', category: 'logic', difficulty: 'mortal', sphinxType: 'golden', hints: ['Flip me to decide', 'I have monetary value', 'Found in fountains'], lore: 'The Golden Sphinx demands fair payment in ancient coins.' },
  { id: 'l09', question: 'What gets wetter the more it dries?', answer: 'towel', category: 'logic', difficulty: 'hero', sphinxType: 'desert', hints: ['Found in bathrooms', 'Used after bathing', 'Made of cloth'], lore: 'The Desert Sphinx appreciates anything that tames water.' },
  { id: 'l10', question: 'What has many teeth but cannot bite?', answer: 'comb', category: 'logic', difficulty: 'demigod', sphinxType: 'war', hints: ['Used on your head', 'Straightens things out', 'Has rows of something'], lore: 'The War Sphinx values discipline, even in grooming.' },

  // ── Wordplay (10) ──
  { id: 'w01', question: 'I am a word of letters three. Add two and fewer there will be. What am I?', answer: 'few', category: 'wordplay', difficulty: 'hero', sphinxType: 'shadow', hints: ['I mean a small amount', 'Three letters to start', 'Fewer starts with me'], lore: 'The Shadow Sphinx delights in words that contradict themselves.' },
  { id: 'w02', question: 'What English word has three consecutive double letters?', answer: 'bookkeeper', category: 'wordplay', difficulty: 'demigod', sphinxType: 'crystal', hints: ['An occupation', 'Related to books', 'Double-o, double-k, double-e'], lore: 'The Crystal Sphinx refracts language into crystalline patterns.' },
  { id: 'w03', question: 'I am always in front of you but cannot be seen. What am I?', answer: 'future', category: 'wordplay', difficulty: 'hero', sphinxType: 'dream', hints: ['Time-related', 'Has not happened yet', 'Prophets see it'], lore: 'The Dream Sphinx walks in a land where all futures coexist.' },
  { id: 'w04', question: 'What begins with T, ends with T, and has T in it?', answer: 'teapot', category: 'wordplay', difficulty: 'mortal', sphinxType: 'child', hints: ['A container for hot drinks', 'British people love me', 'Made of ceramic'], lore: 'The Child Sphinx serves tea during especially tricky riddles.' },
  { id: 'w05', question: 'What word becomes shorter when you add two letters to it?', answer: 'short', category: 'wordplay', difficulty: 'hero', sphinxType: 'shadow', hints: ['An adjective for length', 'Add "er" to me', 'Not tall'], lore: 'The Shadow Sphinx loves paradoxes of language.' },
  { id: 'w06', question: 'I am not alive, but I grow. I do not have lungs, but I need air. What am I?', answer: 'fire', category: 'wordplay', difficulty: 'demigod', sphinxType: 'golden', hints: ['I give warmth and light', 'Water destroys me', 'Prometheus stole me'], lore: 'The Golden Sphinx guards the sacred flame of Ra.' },
  { id: 'w07', question: 'What five-letter word typed in all capital letters can be read the same upside down?', answer: 'swims', category: 'wordplay', difficulty: 'godlike', sphinxType: 'crystal', hints: ['Done in water', 'An activity', 'Rotate 180 degrees'], lore: 'The Crystal Sphinx views truth from every possible angle.' },
  { id: 'w08', question: 'What can you hold in your right hand but never in your left hand?', answer: 'left hand', category: 'wordplay', difficulty: 'demigod', sphinxType: 'dream', hints: ['It is a part of you', 'Think about the name itself', 'Mirror image'], lore: 'The Dream Sphinx poses riddles that make you question reality.' },
  { id: 'w09', question: 'I have branches but no fruit, trunk, or leaves. What am I?', answer: 'bank', category: 'wordplay', difficulty: 'hero', sphinxType: 'royal', hints: ['A financial institution', 'River version has water', 'Money is stored here'], lore: 'The Royal Sphinx hoarded the wealth of the Nile Delta.' },
  { id: 'w10', question: 'What is so fragile that saying its name breaks it?', answer: 'silence', category: 'wordplay', difficulty: 'hero', sphinxType: 'shadow', hints: ['The absence of noise', 'Loud sounds destroy it', 'Libraries enforce it'], lore: 'Silence is the Shadow Sphinx\'s most sacred teaching.' },

  // ── Math (10) ──
  { id: 'm01', question: 'I am an odd number. Take away a letter and I become even. What number am I?', answer: 'seven', category: 'math', difficulty: 'mortal', sphinxType: 'golden', hints: ['Between six and eight', 'Lucky number', 'Remove the "s"'], lore: 'The Golden Sphinx believes numbers hold divine truth.' },
  { id: 'm02', question: 'If you have me, you want to share me. If you share me, you have not kept me. What am I?', answer: 'secret', category: 'math', difficulty: 'hero', sphinxType: 'guardian', hints: ['Knowledge kept hidden', 'Telling destroys my nature', 'Whisper it'], lore: 'The Guardian Sphinx keeps the greatest secrets of ancient Egypt.' },
  { id: 'm03', question: 'A farmer has 17 sheep. All but 9 die. How many sheep are left?', answer: '9', category: 'math', difficulty: 'mortal', sphinxType: 'child', hints: ['Read the wording carefully', '"All but" is the key', 'Think subtraction differently'], lore: 'The Child Sphinx loves tricks disguised as arithmetic.' },
  { id: 'm04', question: 'What is the next number: 1, 1, 2, 3, 5, 8, 13, ?', answer: '21', category: 'math', difficulty: 'hero', sphinxType: 'star', hints: ['Each number is the sum of two before it', 'Named after an Italian', 'Found in nature'], lore: 'The Star Sphinx sees the golden ratio in every constellation.' },
  { id: 'm05', question: 'I am a three-digit number. My tens digit is five more than my ones digit. My hundreds digit is eight less than my tens digit. What number am I?', answer: '194', category: 'math', difficulty: 'demigod', sphinxType: 'crystal', hints: ['Hundreds digit is smallest', 'Work backwards from ones', '1-9-4'], lore: 'The Crystal Sphinx loves puzzles that require precise deduction.' },
  { id: 'm06', question: 'How many times can you subtract 5 from 25?', answer: 'once', category: 'math', difficulty: 'hero', sphinxType: 'war', hints: ['After one subtraction, it is no longer 25', 'Think about what remains', 'A trick question'], lore: 'The War Sphinx values cunning over brute force.' },
  { id: 'm07', question: 'If two fathers and two sons go fishing and catch exactly three fish, and each person gets one fish, how is this possible?', answer: 'three people', category: 'math', difficulty: 'hero', sphinxType: 'dream', hints: ['Think about family relationships', 'Grandfather, father, son', 'Overlapping roles'], lore: 'The Dream Sphinx shows how three can be both two and two.' },
  { id: 'm08', question: 'What is half of 2 + 2?', answer: '3', category: 'math', difficulty: 'demigod', sphinxType: 'golden', hints: ['Order of operations matters', '2 divided by 2, then add 2', 'Not 2'], lore: 'The Golden Sphinx teaches that precision saves lives.' },
  { id: 'm09', question: 'A plane crashes on the border of Egypt and Libya. Where do they bury the survivors?', answer: 'nowhere', category: 'math', difficulty: 'mortal', sphinxType: 'child', hints: ['Read the question carefully', 'They are alive', 'You do not bury survivors'], lore: 'The Child Sphinx giggles at the most ancient tricks.' },
  { id: 'm10', question: 'What is the smallest positive integer that is divisible by all numbers from 1 to 10?', answer: '2520', category: 'math', difficulty: 'godlike', sphinxType: 'star', hints: ['Find the least common multiple', 'Consider prime factorization', '2^3 × 3^2 × 5 × 7'], lore: 'The Star Sphinx calculated this while mapping the cosmos.' },

  // ── Philosophy (10) ──
  { id: 'p01', question: 'What is that which binds two people yet touches only one?', answer: 'wedding ring', category: 'philosophy', difficulty: 'hero', sphinxType: 'royal', hints: ['Worn on a finger', 'A symbol of commitment', 'Usually made of gold'], lore: 'The Royal Sphinx witnessed the first marriage of the pharaohs.' },
  { id: 'p02', question: 'The man who made it did not want it. The man who bought it did not use it. The man who used it did not know it. What is it?', answer: 'coffin', category: 'philosophy', difficulty: 'demigod', sphinxType: 'guardian', hints: ['Associated with death', 'A final resting container', 'The undertaker makes it'], lore: 'The Guardian Sphinx stands watch over every tomb in Thebes.' },
  { id: 'p03', question: 'What can fill a room but takes up no space?', answer: 'light', category: 'philosophy', difficulty: 'hero', sphinxType: 'star', hints: ['It lets you see', 'Comes from the sun', 'Travels as waves'], lore: 'The Star Sphinx knows that light is both particle and wave.' },
  { id: 'p04', question: 'I am not alive, but I have a soul. I am not dead, but I have no heartbeat. What am I?', answer: 'music', category: 'philosophy', difficulty: 'demigod', sphinxType: 'dream', hints: ['Made of notes and rhythm', 'Can move you to tears', 'Played by instruments'], lore: 'The Dream Sphinx hears songs from civilizations not yet born.' },
  { id: 'p05', question: 'What is greater than God, more evil than the devil, the poor have it, the rich need it, and if you eat it, you die?', answer: 'nothing', category: 'philosophy', difficulty: 'demigod', sphinxType: 'shadow', hints: ['The concept of absence', 'Zero, zilch, naught', 'An empty void'], lore: 'The Shadow Sphinx contemplates the power of nothingness.' },
  { id: 'p06', question: 'What belongs to you but others use it more than you do?', answer: 'name', category: 'philosophy', difficulty: 'mortal', sphinxType: 'guardian', hints: ['Given at birth', 'People call you by it', 'Written on scrolls'], lore: 'The Guardian Sphinx knows the true names of all things.' },
  { id: 'p07', question: 'If you drop me, I crack. If you smile at me, I smile back. What am I?', answer: 'mirror', category: 'philosophy', difficulty: 'hero', sphinxType: 'dream', hints: ['Reflects your image', 'Made of glass', 'Found in bathrooms'], lore: 'The Dream Sphinx asks: which reflection is truly you?' },
  { id: 'p08', question: 'What is it that no one wishes to have, yet no one wishes to lose?', answer: 'baldness', category: 'philosophy', difficulty: 'demigod', sphinxType: 'war', hints: ['Related to the top of your head', 'Hair is involved', 'Pharaohs wore wigs for this reason'], lore: 'Even the War Sphinx cannot conquer the passage of time.' },
  { id: 'p09', question: 'What weighs nothing but can be felt? What is seen by the blind and missed by the keen?', answer: 'wind', category: 'philosophy', difficulty: 'hero', sphinxType: 'desert', hints: ['Moves the sand', 'Carries seeds', 'Has no form'], lore: 'The Desert Sphinx speaks in the voice of the khamsin wind.' },
  { id: 'p10', question: 'I am always coming but never arrive. What am I?', answer: 'tomorrow', category: 'philosophy', difficulty: 'hero', sphinxType: 'star', hints: ['Always one day away', 'When it comes, it is today', 'The future is made of me'], lore: 'The Star Sphinx watches tomorrow approach from across the galaxy.' },

  // ── Nature (10) ──
  { id: 'n01', question: 'I have no voice yet I can tell you everything. I have no wings yet I can fly anywhere. What am I?', answer: 'imagination', category: 'nature', difficulty: 'demigod', sphinxType: 'dream', hints: ['Exists in your mind', 'Creates worlds', 'Artists use me'], lore: 'The Dream Sphinx is made entirely of imagination.' },
  { id: 'n02', question: 'What has roots as nobody sees, is taller than trees, up, up it goes, and yet never grows?', answer: 'mountain', category: 'nature', difficulty: 'hero', sphinxType: 'desert', hints: ['Made of rock', 'Has a snowy peak', 'Climbers scale me'], lore: 'The Desert Sphinx guards the mountains where the first riddles were carved.' },
  { id: 'n03', question: 'What lives in the winter, dies in the summer, and grows with its roots upward?', answer: 'icicle', category: 'nature', difficulty: 'hero', sphinxType: 'desert', hints: ['Made of frozen water', 'Hangs from rooftops', 'Melts in heat'], lore: 'The Desert Sphinx once traveled north and was enchanted by ice.' },
  { id: 'n04', question: 'I am the beginning of everything, the end of everywhere. I am the beginning of eternity, the end of time and space. What am I?', answer: 'e', category: 'nature', difficulty: 'godlike', sphinxType: 'crystal', hints: ['A single letter', 'The most common letter in English', 'Found in "everything"'], lore: 'The Crystal Sphinx sees the universe in a single letter.' },
  { id: 'n05', question: 'What breaks yet never falls, and what falls yet never breaks?', answer: 'day and night', category: 'nature', difficulty: 'demigod', sphinxType: 'star', hints: ['One follows the other', 'The sun is involved', 'Part of a 24-hour cycle'], lore: 'The Star Sphinx marks time by the eternal cycle of day and night.' },
  { id: 'n06', question: 'What has a heart that does not beat?', answer: 'artichoke', category: 'nature', difficulty: 'godlike', sphinxType: 'desert', hints: ['A vegetable', 'Has a name related to anatomy', 'Grown in gardens'], lore: 'The Desert Sphinx grows a garden of impossible plants.' },
  { id: 'n07', question: 'What eats to live but never drinks?', answer: 'fire', category: 'nature', difficulty: 'hero', sphinxType: 'golden', hints: ['Consumes fuel', 'Needs oxygen', 'Dances without legs'], lore: 'The Golden Sphinx feeds the sacred flame with riddles.' },
  { id: 'n08', question: 'I am not a plant, yet I have leaves. I am not a beast, yet I have a spine. I cannot walk, yet I have a foot. What am I?', answer: 'book', category: 'nature', difficulty: 'demigod', sphinxType: 'guardian', hints: ['Contains knowledge', 'Made of paper', 'Found in libraries'], lore: 'The Guardian Sphinx\'s library holds every book ever written.' },
  { id: 'n09', question: 'What wears a crown but is not royalty, has scales but is not a fish, and lives in a forest but is not an animal?', answer: 'pineapple', category: 'nature', difficulty: 'godlike', sphinxType: 'desert', hints: ['A tropical fruit', 'Spiky exterior', 'Yellow inside'], lore: 'The Desert Sphinx traded with distant lands for exotic fruits.' },
  { id: 'n10', question: 'Born in the ocean, raised in the river, but dies in the cup. What am I?', answer: 'tea', category: 'nature', difficulty: 'demigod', sphinxType: 'royal', hints: ['A popular beverage', 'Leaves are harvested', 'Served hot or cold'], lore: 'The Royal Sphinx demands tea be served before any riddle contest.' },

  // ── History (10) ──
  { id: 'h01', question: 'I was built to last forever, yet I am slowly disappearing grain by grain. Pharaohs rest within me. What am I?', answer: 'pyramid', category: 'history', difficulty: 'mortal', sphinxType: 'royal', hints: ['Found in Giza', 'Triangular shape', 'One of the Seven Wonders'], lore: 'The Royal Sphinx stands guard beside the Great Pyramids.' },
  { id: 'h02', question: 'I was a great ruler of Egypt, my tomb was found nearly intact in 1922. Who am I?', answer: 'tutankhamun', category: 'history', difficulty: 'hero', sphinxType: 'royal', hints: ['Known as King Tut', 'A boy pharaoh', 'Howard Carter discovered my tomb'], lore: 'The Royal Sphinx personally knew this young pharaoh.' },
  { id: 'h03', question: 'What ancient writing system used pictures to represent sounds and ideas, central to Egyptian civilization?', answer: 'hieroglyphics', category: 'history', difficulty: 'hero', sphinxType: 'guardian', hints: ['Found on temple walls', 'Decoded using the Rosetta Stone', 'Sacred carvings'], lore: 'The Guardian Sphinx reads hieroglyphics as easily as breathing.' },
  { id: 'h04', question: 'What river gave life to ancient Egypt, flowing northward through the desert?', answer: 'nile', category: 'history', difficulty: 'mortal', sphinxType: 'desert', hints: ['The longest river in Africa', 'Annual flooding enriched soil', 'Cleopatra lived along its banks'], lore: 'The Desert Sphinx drinks from the Nile at the hour of dawn.' },
  { id: 'h05', question: 'What stone slab, discovered in 1799, provided the key to deciphering Egyptian hieroglyphs?', answer: 'rosetta stone', category: 'history', difficulty: 'hero', sphinxType: 'guardian', hints: ['Found in Rosetta, Egypt', 'Contains three scripts', 'Currently in the British Museum'], lore: 'The Guardian Sphinx both blesses and curses the Rosetta Stone.' },
  { id: 'h06', question: 'Who was the last active pharaoh of ancient Egypt, known for her alliances with Rome?', answer: 'cleopatra', category: 'history', difficulty: 'hero', sphinxType: 'royal', hints: ['Ruled from Alexandria', 'Had relationships with Caesar and Mark Antony', 'Died by asp bite'], lore: 'The Royal Sphinx remembers Cleopatra as the wisest ruler.' },
  { id: 'h07', question: 'What process did ancient Egyptians use to preserve bodies for the afterlife?', answer: 'mummification', category: 'history', difficulty: 'mortal', sphinxType: 'guardian', hints: ['Wrapping in linen', 'Removing organs', 'Natron salt was used'], lore: 'The Guardian Sphinx oversees every mummification ritual.' },
  { id: 'h08', question: 'What legendary queen of ancient Egypt may have been Hatshepsut, who ruled as pharaoh disguised as a man?', answer: 'hatshepsut', category: 'history', difficulty: 'demigod', sphinxType: 'royal', hints: ['Built a great temple at Deir el-Bahri', 'Wore the false beard of pharaoh', 'One of Egypt\'s greatest builders'], lore: 'The Royal Sphinx helped Hatshepsut ascend to power.' },
  { id: 'h09', question: 'What ancient board game, popular in Egypt, was called "Game of Passing Through the Netherworld"?', answer: 'senet', category: 'history', difficulty: 'demigod', sphinxType: 'dream', hints: ['Played on a grid', 'Found in Tutankhamun\'s tomb', 'Over 5000 years old'], lore: 'The Dream Sphinx plays senet against the spirits of the dead.' },
  { id: 'h10', question: 'What massive limestone statue with a human head and lion body has guarded Giza for over 4500 years?', answer: 'great sphinx', category: 'history', difficulty: 'mortal', sphinxType: 'guardian', hints: ['Located near the pyramids', 'Has a missing nose', 'Symbol of royal power'], lore: 'The Guardian Sphinx is the original—the one all others are named after.' },
];

// ─── 20 Ancient Artifacts ──────────────────────────────────

export const ALL_ARTIFACTS: Artifact[] = [
  { id: 'art01', name: 'Eye of Horus', lore: 'The all-seeing eye of the falcon god, granting clarity of thought.', rarity: 'common', bonusRep: 5, bonusXp: 10, requiredRank: 'wanderer', category: 'logic' },
  { id: 'art02', name: 'Scarab Amulet', lore: 'A golden scarab that symbolizes rebirth and transformation.', rarity: 'common', bonusRep: 5, bonusXp: 10, requiredRank: 'wanderer', category: 'nature' },
  { id: 'art03', name: 'Ankh of Life', lore: 'The key of life, said to unlock hidden wisdom in any riddle.', rarity: 'uncommon', bonusRep: 10, bonusXp: 25, requiredRank: 'initiate', category: 'philosophy' },
  { id: 'art04', name: 'Scroll of Thoth', lore: 'Contains fragments of the god of wisdom\'s own riddles.', rarity: 'uncommon', bonusRep: 10, bonusXp: 25, requiredRank: 'initiate', category: 'wordplay' },
  { id: 'art05', name: 'Crook and Flail', lore: 'Symbols of pharaonic authority, granting confidence in answers.', rarity: 'uncommon', bonusRep: 12, bonusXp: 30, requiredRank: 'initiate', category: 'history' },
  { id: 'art06', name: 'Nefertiti\'s Crown', lore: 'Worn by the beautiful queen, enhances logical deduction.', rarity: 'rare', bonusRep: 20, bonusXp: 50, requiredRank: 'scholar', category: 'logic' },
  { id: 'art07', name: 'Pyramid Compass', lore: 'Always points toward truth, never toward deception.', rarity: 'rare', bonusRep: 20, bonusXp: 50, requiredRank: 'scholar', category: 'math' },
  { id: 'art08', name: 'Sphinx Heart', lore: 'The crystallized heart of the first sphinx, pulsing with ancient power.', rarity: 'rare', bonusRep: 25, bonusXp: 60, requiredRank: 'scholar', category: 'philosophy' },
  { id: 'art09', name: 'Ra\'s Sun Boat', lore: 'Travels between worlds, bringing enlightenment each dawn.', rarity: 'rare', bonusRep: 22, bonusXp: 55, requiredRank: 'scholar', category: 'nature' },
  { id: 'art10', name: 'Book of the Dead', lore: 'A guide through the underworld, revealing hidden answers.', rarity: 'rare', bonusRep: 20, bonusXp: 50, requiredRank: 'scholar', category: 'history' },
  { id: 'art11', name: 'Obelisk Fragment', lore: 'A shard of an ancient obelisk inscribed with forgotten knowledge.', rarity: 'legendary', bonusRep: 40, bonusXp: 100, requiredRank: 'oracle', category: 'wordplay' },
  { id: 'art12', name: 'Golden Mask of Osiris', lore: 'The lord of the underworld\'s mask, granting visions of truth.', rarity: 'legendary', bonusRep: 45, bonusXp: 120, requiredRank: 'oracle', category: 'philosophy' },
  { id: 'art13', name: 'Canopic Jar of Wisdom', lore: 'Contains the preserved knowledge of ancient sages.', rarity: 'legendary', bonusRep: 40, bonusXp: 100, requiredRank: 'oracle', category: 'logic' },
  { id: 'art14', name: 'Winged Sun Disc', lore: 'Symbol of divine power, illuminates the darkest riddles.', rarity: 'legendary', bonusRep: 42, bonusXp: 110, requiredRank: 'oracle', category: 'math' },
  { id: 'art15', name: 'Tutankhamun\'s Dagger', lore: 'Forged from meteoric iron, cuts through confusion.', rarity: 'legendary', bonusRep: 40, bonusXp: 100, requiredRank: 'oracle', category: 'history' },
  { id: 'art16', name: 'Benben Stone', lore: 'The primordial mound from which creation arose.', rarity: 'mythic', bonusRep: 80, bonusXp: 200, requiredRank: 'keeper', category: 'nature' },
  { id: 'art17', name: 'Staff of Djehuty', lore: 'The staff of Thoth himself, master of all riddles.', rarity: 'mythic', bonusRep: 90, bonusXp: 250, requiredRank: 'keeper', category: 'wordplay' },
  { id: 'art18', name: 'Apep\'s Severed Tail', lore: 'The defeated chaos serpent\'s tail, a trophy of order over chaos.', rarity: 'mythic', bonusRep: 85, bonusXp: 220, requiredRank: 'keeper', category: 'philosophy' },
  { id: 'art19', name: 'Sphinx Throne Fragment', lore: 'A piece of the throne upon which the Great Sphinx sits.', rarity: 'mythic', bonusRep: 100, bonusXp: 300, requiredRank: 'pharaoh', category: 'logic' },
  { id: 'art20', name: 'Eye of the Cosmos', lore: 'Contains the answer to every riddle ever posed or yet to be conceived.', rarity: 'mythic', bonusRep: 100, bonusXp: 300, requiredRank: 'pharaoh', category: 'math' },
];

// ─── Knowledge Tree Nodes ──────────────────────────────────

export const KNOWLEDGE_TREE_NODES: KnowledgeNode[] = [
  // Wisdom branch
  { id: 'w_b1', branch: 'wisdom', name: 'Ancient Scholar', description: 'Learn from the scrolls of Alexandria', requiredPoints: 0, unlocked: false, bonus: '+5% XP from logic riddles' },
  { id: 'w_b2', branch: 'wisdom', name: 'Sage\'s Insight', description: 'Perceive patterns in complex riddles', requiredPoints: 10, unlocked: false, bonus: 'Reveal first letter of answer' },
  { id: 'w_b3', branch: 'wisdom', name: 'Oracle\'s Vision', description: 'See through deception and misdirection', requiredPoints: 25, unlocked: false, bonus: '+10% reputation gain' },
  { id: 'w_b4', branch: 'wisdom', name: 'Library Guardian', description: 'Master the accumulated knowledge of ages', requiredPoints: 50, unlocked: false, bonus: 'Free hint on first riddle each session' },
  { id: 'w_b5', branch: 'wisdom', name: 'Mind of Thoth', description: 'Achieve divine understanding', requiredPoints: 100, unlocked: false, bonus: 'Double XP on all logic riddles' },
  // Courage branch
  { id: 'c_b1', branch: 'courage', name: 'Bold Challenger', description: 'Face riddles without fear', requiredPoints: 0, unlocked: false, bonus: '+5% XP from demigod riddles' },
  { id: 'c_b2', branch: 'courage', name: 'Fearless Solver', description: 'Tackle the hardest puzzles head-on', requiredPoints: 10, unlocked: false, bonus: 'No reputation loss on wrong answers' },
  { id: 'c_b3', branch: 'courage', name: 'Sphinx Slayer', description: 'Defeat sphinxes in single combat', requiredPoints: 25, unlocked: false, bonus: '+15 reputation per godlike riddle solved' },
  { id: 'c_b4', branch: 'courage', name: 'Desert Walker', description: 'Endure the harshest trials', requiredPoints: 50, unlocked: false, bonus: 'Unlock hero difficulty without prerequisites' },
  { id: 'c_b5', branch: 'courage', name: 'Pharaoh\'s Will', description: 'Unbreakable determination', requiredPoints: 100, unlocked: false, bonus: 'Guaranteed correct answer once per session' },
  // Mystery branch
  { id: 'm_b1', branch: 'mystery', name: 'Curious Seeker', description: 'Explore the unknown', requiredPoints: 0, unlocked: false, bonus: '+5% chance of rare artifacts' },
  { id: 'm_b2', branch: 'mystery', name: 'Cipher Adept', description: 'Decode hidden meanings', requiredPoints: 10, unlocked: false, bonus: 'Easier hieroglyph ciphers' },
  { id: 'm_b3', branch: 'mystery', name: 'Shadow Reader', description: 'Understand what is not said', requiredPoints: 25, unlocked: false, bonus: 'See all 3 hints at reduced cost' },
  { id: 'm_b4', branch: 'mystery', name: 'Void Walker', description: 'Navigate between worlds of meaning', requiredPoints: 50, unlocked: false, bonus: 'Access hidden riddle category' },
  { id: 'm_b5', branch: 'mystery', name: 'Cosmic Eye', description: 'Perceive all dimensions of truth', requiredPoints: 100, unlocked: false, bonus: 'Unlock mythical sphinx encounters' },
  // Justice branch
  { id: 'j_b1', branch: 'justice', name: 'Truth Speaker', description: 'Value honesty above all', requiredPoints: 0, unlocked: false, bonus: '+5 reputation per correct answer' },
  { id: 'j_b2', branch: 'justice', name: 'Fair Judge', description: 'Weigh all possibilities equally', requiredPoints: 10, unlocked: false, bonus: 'No penalty for hint usage' },
  { id: 'j_b3', branch: 'justice', name: 'Ma\'at\'s Scale', description: 'Balance wisdom with action', requiredPoints: 25, unlocked: false, bonus: '+10% reputation from daily challenges' },
  { id: 'j_b4', branch: 'justice', name: 'Lawgiver', description: 'Establish order in chaos', requiredPoints: 50, unlocked: false, bonus: 'Bonus reputation for streak milestones' },
  { id: 'j_b5', branch: 'justice', name: 'Pharaoh\'s Justice', description: 'Uphold the cosmic balance', requiredPoints: 100, unlocked: false, bonus: 'Triple reputation from daily streaks' },
  // Creation branch
  { id: 'cr_b1', branch: 'creation', name: 'Story Weaver', description: 'Create meaning from chaos', requiredPoints: 0, unlocked: false, bonus: '+5% XP from wordplay riddles' },
  { id: 'cr_b2', branch: 'creation', name: 'Name Giver', description: 'Know the true names of things', requiredPoints: 10, unlocked: false, bonus: 'Reveal category of any riddle' },
  { id: 'cr_b3', branch: 'creation', name: 'World Builder', description: 'Construct understanding from fragments', requiredPoints: 25, unlocked: false, bonus: 'Generate custom practice riddles' },
  { id: 'cr_b4', branch: 'creation', name: 'Life Giver', description: 'Breathe vitality into knowledge', requiredPoints: 50, unlocked: false, bonus: 'Earn bonus artifacts on level up' },
  { id: 'cr_b5', branch: 'creation', name: 'Ptah\'s Hand', description: 'Shape reality with thought alone', requiredPoints: 100, unlocked: false, bonus: 'Create and share riddles with others' },
];

// ─── 15 Achievements ───────────────────────────────────────

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach01', name: 'First Step', description: 'Solve your first riddle', icon: '👣', condition: 'solved_count >= 1', unlocked: false, reward: { rep: 10, xp: 20 } },
  { id: 'ach02', name: 'Riddle Apprentice', description: 'Solve 10 riddles correctly', icon: '📜', condition: 'solved_count >= 10', unlocked: false, reward: { rep: 25, xp: 50 } },
  { id: 'ach03', name: 'Sphinx Whisperer', description: 'Solve 25 riddles correctly', icon: '🦁', condition: 'solved_count >= 25', unlocked: false, reward: { rep: 50, xp: 100 } },
  { id: 'ach04', name: 'Riddle Master', description: 'Solve 50 riddles correctly', icon: '👑', condition: 'solved_count >= 50', unlocked: false, reward: { rep: 100, xp: 200 } },
  { id: 'ach05', name: 'No Hints Needed', description: 'Solve 5 riddles without using any hints', icon: '🧠', condition: 'no_hint_streak >= 5', unlocked: false, reward: { rep: 30, xp: 60 } },
  { id: 'ach06', name: 'Streak of Fire', description: 'Achieve a 5-riddle correct streak', icon: '🔥', condition: 'streak >= 5', unlocked: false, reward: { rep: 40, xp: 80 } },
  { id: 'ach07', name: 'Unbreakable', description: 'Achieve a 10-riddle correct streak', icon: '💎', condition: 'streak >= 10', unlocked: false, reward: { rep: 75, xp: 150 } },
  { id: 'ach08', name: 'Daily Devotee', description: 'Complete 7 daily challenges', icon: '📅', condition: 'daily_streak >= 7', unlocked: false, reward: { rep: 50, xp: 100 } },
  { id: 'ach09', name: 'Hieroglyph Scholar', description: 'Complete 10 hieroglyph ciphers', icon: 'ゖ', condition: 'ciphers_completed >= 10', unlocked: false, reward: { rep: 40, xp: 80 } },
  { id: 'ach10', name: 'Vault Raider', description: 'Unlock 5 treasure vault rooms', icon: '🏛️', condition: 'vault_rooms_unlocked >= 5', unlocked: false, reward: { rep: 60, xp: 120 } },
  { id: 'ach11', name: 'Artifact Collector', description: 'Own 10 ancient artifacts', icon: '🏺', condition: 'artifacts_owned >= 10', unlocked: false, reward: { rep: 50, xp: 100, artifact: 'art11' } },
  { id: 'ach12', name: 'All-Seeing Eye', description: 'Solve riddles from all 6 categories', icon: '👁️', condition: 'categories_solved >= 6', unlocked: false, reward: { rep: 60, xp: 120 } },
  { id: 'ach13', name: 'Pharaoh\'s Challenge', description: 'Solve a godlike difficulty riddle', icon: '⚡', condition: 'godlike_solved >= 1', unlocked: false, reward: { rep: 80, xp: 160 } },
  { id: 'ach14', name: 'Knowledge Seeker', description: 'Unlock 10 knowledge tree nodes', icon: '🌳', condition: 'nodes_unlocked >= 10', unlocked: false, reward: { rep: 70, xp: 140 } },
  { id: 'ach15', name: 'Oracle Ascendant', description: 'Reach Oracle level 25', icon: '🌟', condition: 'oracle_level >= 25', unlocked: false, reward: { rep: 100, xp: 250, artifact: 'art19' } },
];

// ─── Treasure Vault Rooms ──────────────────────────────────

export const DEFAULT_VAULT_ROOMS: VaultRoom[] = [
  { index: 0, name: 'Chamber of Papyrus', description: 'Ancient scrolls line the walls of this humble chamber.', locked: true, reward: 'art01', requiredKeys: 1 },
  { index: 1, name: 'Hall of the Scarab', description: 'Golden scarabs crawl across jeweled floors.', locked: true, reward: 'art02', requiredKeys: 2 },
  { index: 2, name: 'Tomb of Scribes', description: 'The resting place of Egypt\'s greatest scribes.', locked: true, reward: 'art05', requiredKeys: 3 },
  { index: 3, name: 'Crypt of Stars', description: 'The ceiling mirrors the night sky above Giza.', locked: true, reward: 'art09', requiredKeys: 4 },
  { index: 4, name: 'Sanctuary of Thoth', description: 'The ibis-headed god\'s personal sanctuary.', locked: true, reward: 'art04', requiredKeys: 5 },
  { index: 5, name: 'Vault of the Nile', description: 'An underground river flows through treasures untold.', locked: true, reward: 'art11', requiredKeys: 6 },
  { index: 6, name: 'Obelisk Chamber', description: 'A massive obelisk dominates this opulent room.', locked: true, reward: 'art14', requiredKeys: 8 },
  { index: 7, name: 'Pharaoh\'s Inner Sanctum', description: 'The most sacred space, reserved for the worthy.', locked: true, reward: 'art16', requiredKeys: 10 },
  { index: 8, name: 'Cosmic Vault', description: 'Reality bends within these walls of living stone.', locked: true, reward: 'art17', requiredKeys: 13 },
  { index: 9, name: 'Throne of Eternity', description: 'The final vault containing the Eye of the Cosmos.', locked: true, reward: 'art20', requiredKeys: 16 },
];

// ─── Oracle Level Titles ───────────────────────────────────

const ORACLE_TITLES: string[] = [
  'Novice Seeker', 'Seeker of Dust', 'Student of Sand', 'Pupil of Papyrus',
  'Reader of Runes', 'Follower of Fate', 'Disciple of Dawn', 'Apprentice Oracle',
  'Voice of the Void', 'Speaker of Signs', 'Chronicler of Chaos', 'Mind of the Maze',
  'Eye of Eternity', 'Heart of the Horizon', 'Soul of the Sphinx', 'Keeper of Keys',
  'Weaver of Wisdom', 'Master of Mystery', 'Sage of Silence', 'Guardian of Gates',
  'Lord of Layers', 'Sovereign of Secrets', 'Phantom Philosopher', 'Titan of Thought',
  'Architect of Answers', 'Beacon of Balance', 'Crown of Clarity', 'Diamond of Deduction',
  'Eclipse of Enlightenment', 'Flame of Forethought', 'Genesis of Genius', 'Harbinger of Hierarchy',
  'Infinity of Insight', 'Jewel of Judgment', 'Kinetic Knower', 'Luminous Logician',
  'Majesty of Mind', 'Nexus of Notion', 'Omniscient One', 'Paragon of Perception',
  'Quantum Questioner', 'Radiant Reasoner', 'Supreme Seer', 'Titan of Truth',
  'Ultimate Understanding', 'Visionary Voice', 'Wellspring of Wisdom', 'Xenolithic Xpert',
  'Yielding Yoda of Yore', 'Zenith of Zeus',
];

// ─── Pure State Functions ──────────────────────────────────
// (No React, no browser APIs — all exported with sp prefix)

export function spCreateInitialState(): SphinxRiddleState {
  return {
    currentRiddle: null,
    riddleStatus: 'unsolved',
    currentHintLevel: 0,
    score: 0,
    totalXp: 0,
    reputation: 0,
    rank: 'wanderer',
    solvedRiddleIds: [],
    failedRiddleIds: [],
    riddleHistory: [],
    consecutiveCorrect: 0,
    bestStreak: 0,
    dailyChallenge: null,
    currentStreak: 0,
    longestStreak: 0,
    lastDailyDate: '',
    knowledgePoints: { wisdom: 0, courage: 0, mystery: 0, justice: 0, creation: 0 },
    unlockedNodes: [],
    ownedArtifacts: [],
    equippedArtifact: null,
    currentCipher: null,
    ciphersCompleted: 0,
    ciphersFailed: 0,
    vaultKeys: [],
    vaultRooms: DEFAULT_VAULT_ROOMS.map((r) => ({ ...r })),
    achievements: [],
    oracle: spCreateOracleProgress(1),
    totalRiddlesAttempted: 0,
    totalCorrect: 0,
    totalHintsUsed: 0,
    favoriteCategory: 'logic',
    gamesPlayed: 0,
    activeSphinxType: 'guardian',
    selectedDifficulty: 'mortal',
    error: null,
  };
}

export function spCreateOracleProgress(level: number): OracleProgress {
  const xpToNext = spCalcXpToNextOracleLevel(level);
  const title = spGetOracleTitle(level);
  return { level, xp: 0, xpToNext, title };
}

export function spCalcXpToNextOracleLevel(level: number): number {
  return Math.floor(80 * Math.pow(level, 1.35) + 20);
}

export function spGetOracleTitle(level: number): string {
  if (level < 1) return ORACLE_TITLES[0];
  if (level >= ORACLE_TITLES.length) return ORACLE_TITLES[ORACLE_TITLES.length - 1];
  return ORACLE_TITLES[level - 1];
}

// ─── Rank / Reputation ────────────────────────────────────

export function spGetRankFromRep(rep: number): SphinxRank {
  let current: SphinxRank = 'wanderer';
  for (const t of SPHINX_RANK_THRESHOLDS) {
    if (rep >= t.minRep) current = t.rank;
  }
  return current;
}

export function spGetRankInfo(rank: SphinxRank) {
  return SPHINX_RANK_THRESHOLDS.find((t) => t.rank === rank) ?? SPHINX_RANK_THRESHOLDS[0];
}

export function spGetNextRankInfo(currentRank: SphinxRank) {
  const idx = SPHINX_RANK_THRESHOLDS.findIndex((t) => t.rank === currentRank);
  if (idx < 0 || idx >= SPHINX_RANK_THRESHOLDS.length - 1) return null;
  return SPHINX_RANK_THRESHOLDS[idx + 1];
}

export function spRepToNextRank(rep: number, rank: SphinxRank): number {
  const next = spGetNextRankInfo(rank);
  if (!next) return 0;
  return Math.max(0, next.minRep - rep);
}

export function spRepProgressPercent(rep: number, rank: SphinxRank): number {
  const current = spGetRankInfo(rank);
  const next = spGetNextRankInfo(rank);
  if (!next) return 100;
  return Math.min(100, Math.floor(((rep - current.minRep) / (next.minRep - current.minRep)) * 100));
}

export function spAddReputation(state: SphinxRiddleState, amount: number): SphinxRiddleState {
  const newRep = Math.min(1000, state.reputation + amount);
  const newRank = spGetRankFromRep(newRep);
  return { ...state, reputation: newRep, rank: newRank };
}

export function spSubtractReputation(state: SphinxRiddleState, amount: number): SphinxRiddleState {
  const newRep = Math.max(0, state.reputation - amount);
  const newRank = spGetRankFromRep(newRep);
  return { ...state, reputation: newRep, rank: newRank };
}

// ─── Difficulty Helpers ────────────────────────────────────

export function spGetDifficultyMultiplier(difficulty: SphinxDifficulty, field: 'rep' | 'xp'): number {
  const tier = SPHINX_DIFFICULTY_TIERS.find((t) => t.id === difficulty);
  if (!tier) return 1;
  return field === 'rep' ? tier.repMultiplier : tier.xpMultiplier;
}

export function spCalcRepReward(difficulty: SphinxDifficulty, hintPenalty: number): number {
  const base = difficulty === 'mortal' ? 10 : difficulty === 'hero' ? 20 : difficulty === 'demigod' ? 40 : 80;
  return Math.max(0, Math.floor((base - hintPenalty * 3) * spGetDifficultyMultiplier(difficulty, 'rep')));
}

export function spCalcXpReward(difficulty: SphinxDifficulty, hintPenalty: number): number {
  const base = difficulty === 'mortal' ? 15 : difficulty === 'hero' ? 30 : difficulty === 'demigod' ? 60 : 120;
  return Math.max(0, Math.floor((base - hintPenalty * 5) * spGetDifficultyMultiplier(difficulty, 'xp')));
}

// ─── Riddle Selection ──────────────────────────────────────

export function spFilterRiddles(
  riddles: SphinxRiddle[],
  opts: { category?: SphinxRiddleCategory; difficulty?: SphinxDifficulty; sphinxType?: string; excludeIds?: string[] }
): SphinxRiddle[] {
  let filtered = riddles;
  if (opts.category) filtered = filtered.filter((r) => r.category === opts.category);
  if (opts.difficulty) filtered = filtered.filter((r) => r.difficulty === opts.difficulty);
  if (opts.sphinxType) filtered = filtered.filter((r) => r.sphinxType === opts.sphinxType);
  if (opts.excludeIds) filtered = filtered.filter((r) => !opts.excludeIds!.includes(r.id));
  return filtered;
}

export function spPickRandomRiddle(
  riddles: SphinxRiddle[],
  opts: { category?: SphinxRiddleCategory; difficulty?: SphinxDifficulty; sphinxType?: string; excludeIds?: string[] }
): SphinxRiddle | null {
  const pool = spFilterRiddles(riddles, opts);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function spSelectRiddleForSphinx(
  state: SphinxRiddleState,
  riddles: SphinxRiddle[]
): SphinxRiddle | null {
  const sphinx = SPHINX_TYPES.find((s) => s.id === state.activeSphinxType) ?? SPHINX_TYPES[0];
  const exclude = [...state.solvedRiddleIds, ...state.failedRiddleIds];
  const chosen = spPickRandomRiddle(riddles, {
    category: sphinx.preferredCategories[Math.floor(Math.random() * sphinx.preferredCategories.length)],
    difficulty: state.selectedDifficulty,
    excludeIds: exclude.length > 0 ? exclude : undefined,
  });
  if (chosen) return chosen;
  return spPickRandomRiddle(riddles, { excludeIds: exclude.length > 0 ? exclude : undefined });
}

export function spSetCurrentRiddle(state: SphinxRiddleState, riddle: SphinxRiddle): SphinxRiddleState {
  return {
    ...state,
    currentRiddle: riddle,
    riddleStatus: 'unsolved',
    currentHintLevel: 0,
    totalRiddlesAttempted: state.totalRiddlesAttempted + 1,
    gamesPlayed: state.gamesPlayed + 1,
  };
}

// ─── Hints ─────────────────────────────────────────────────

export function spGetHint(riddle: SphinxRiddle, level: SphinxHintLevel): string | null {
  if (level < 1 || level > 3) return null;
  return riddle.hints[level - 1];
}

export function spRevealHint(state: SphinxRiddleState): SphinxRiddleState {
  if (!state.currentRiddle) return state;
  const nextLevel = (state.currentHintLevel + 1) as SphinxHintLevel;
  if (nextLevel > 3) return state;
  const statusMap: Record<number, RiddleStatus> = { 1: 'hint1', 2: 'hint2', 3: 'hint3' };
  return {
    ...state,
    currentHintLevel: nextLevel,
    riddleStatus: statusMap[nextLevel],
    totalHintsUsed: state.totalHintsUsed + 1,
  };
}

export function spHintCostRep(level: SphinxHintLevel): number {
  return level === 1 ? 0 : level === 2 ? 2 : 5;
}

// ─── Solve / Answer ────────────────────────────────────────

export function spCheckAnswer(riddle: SphinxRiddle, answer: string): boolean {
  return riddle.answer.trim().toLowerCase() === answer.trim().toLowerCase();
}

export function spSolveRiddle(state: SphinxRiddleState, answer: string): SphinxRiddleState {
  if (!state.currentRiddle || state.riddleStatus === 'solved' || state.riddleStatus === 'failed') {
    return state;
  }
  const correct = spCheckAnswer(state.currentRiddle, answer);
  if (correct) {
    return spApplyCorrectAnswer(state);
  }
  return spApplyWrongAnswer(state);
}

function spApplyCorrectAnswer(state: SphinxRiddleState): SphinxRiddleState {
  const riddle = state.currentRiddle!;
  const repGained = spCalcRepReward(riddle.difficulty, state.currentHintLevel);
  const xpGained = spCalcXpReward(riddle.difficulty, state.currentHintLevel);
  const artifactBonus = spGetEquippedArtifactBonus(state);
  const totalRep = repGained + artifactBonus.bonusRep;
  const totalXp = xpGained + artifactBonus.bonusXp;

  const result: RiddleResult = {
    riddleId: riddle.id,
    correct: true,
    hintsUsed: state.currentHintLevel,
    timeTaken: 0,
    repGained: totalRep,
    xpGained: totalXp,
  };

  const newState = spAddReputation(state, totalRep);
  const withXp = spAddOracleXp(newState, totalXp);
  const withKnowledge = spAddKnowledgePoints(withXp, riddle.category, 2);
  const newStreak = withKnowledge.consecutiveCorrect + 1;

  return {
    ...withKnowledge,
    riddleStatus: 'solved',
    solvedRiddleIds: [...withKnowledge.solvedRiddleIds, riddle.id],
    riddleHistory: [...withKnowledge.riddleHistory, result],
    score: withKnowledge.score + totalRep,
    totalXp: withKnowledge.totalXp + totalXp,
    totalCorrect: withKnowledge.totalCorrect + 1,
    consecutiveCorrect: newStreak,
    bestStreak: Math.max(withKnowledge.bestStreak, newStreak),
    favoriteCategory: spRecalcFavoriteCategory(withKnowledge, riddle.category),
    vaultKeys: [...withKnowledge.vaultKeys, { riddleId: riddle.id, unlockedAt: Date.now(), vaultIndex: 0 }],
  };
}

function spApplyWrongAnswer(state: SphinxRiddleState): SphinxRiddleState {
  const riddle = state.currentRiddle!;
  const result: RiddleResult = {
    riddleId: riddle.id,
    correct: false,
    hintsUsed: state.currentHintLevel,
    timeTaken: 0,
    repGained: 0,
    xpGained: 0,
  };

  const penaltyRep = riddle.difficulty === 'mortal' ? 0 : riddle.difficulty === 'hero' ? 2 : riddle.difficulty === 'demigod' ? 5 : 10;
  const withPenalty = spSubtractReputation(state, penaltyRep);

  return {
    ...withPenalty,
    riddleStatus: 'failed',
    failedRiddleIds: [...withPenalty.failedRiddleIds, riddle.id],
    riddleHistory: [...withPenalty.riddleHistory, result],
    consecutiveCorrect: 0,
  };
}

// ─── Oracle / XP ───────────────────────────────────────────

export function spAddOracleXp(state: SphinxRiddleState, xp: number): SphinxRiddleState {
  let current = { ...state.oracle, xp: state.oracle.xp + xp };
  while (current.xp >= current.xpToNext && current.level < 50) {
    current.xp -= current.xpToNext;
    current.level += 1;
    current.xpToNext = spCalcXpToNextOracleLevel(current.level);
    current.title = spGetOracleTitle(current.level);
  }
  return { ...state, oracle: current, totalXp: state.totalXp + xp };
}

export function spOracleLevelUp(state: SphinxRiddleState): boolean {
  return state.oracle.xp >= state.oracle.xpToNext && state.oracle.level < 50;
}

// ─── Knowledge Tree ────────────────────────────────────────

export function spGetCategoryBranch(category: SphinxRiddleCategory): KnowledgeBranch {
  const map: Record<SphinxRiddleCategory, KnowledgeBranch> = {
    logic: 'wisdom',
    wordplay: 'creation',
    math: 'wisdom',
    philosophy: 'mystery',
    nature: 'courage',
    history: 'justice',
  };
  return map[category];
}

export function spAddKnowledgePoints(state: SphinxRiddleState, category: SphinxRiddleCategory, points: number): SphinxRiddleState {
  const branch = spGetCategoryBranch(category);
  const newPoints = { ...state.knowledgePoints };
  newPoints[branch] = Math.min(200, newPoints[branch] + points);
  return { ...state, knowledgePoints: newPoints };
}

export function spGetUnlockableNodes(state: SphinxRiddleState): KnowledgeNode[] {
  return KNOWLEDGE_TREE_NODES.filter((node) => {
    if (state.unlockedNodes.includes(node.id)) return false;
    const branchPoints = state.knowledgePoints[node.branch];
    return branchPoints >= node.requiredPoints;
  });
}

export function spUnlockNode(state: SphinxRiddleState, nodeId: string): SphinxRiddleState {
  if (state.unlockedNodes.includes(nodeId)) return state;
  const node = KNOWLEDGE_TREE_NODES.find((n) => n.id === nodeId);
  if (!node) return state;
  const branchPoints = state.knowledgePoints[node.branch];
  if (branchPoints < node.requiredPoints) return state;
  return { ...state, unlockedNodes: [...state.unlockedNodes, nodeId] };
}

export function spGetNodesByBranch(branch: KnowledgeBranch): KnowledgeNode[] {
  return KNOWLEDGE_TREE_NODES.filter((n) => n.branch === branch);
}

export function spGetUnlockedNodeCount(state: SphinxRiddleState): number {
  return state.unlockedNodes.length;
}

// ─── Artifacts ─────────────────────────────────────────────

export function spGetAvailableArtifacts(state: SphinxRiddleState): Artifact[] {
  return ALL_ARTIFACTS.filter((a) => !state.ownedArtifacts.includes(a.id));
}

export function spGetOwnedArtifacts(state: SphinxRiddleState): Artifact[] {
  return ALL_ARTIFACTS.filter((a) => state.ownedArtifacts.includes(a.id));
}

export function spAcquireArtifact(state: SphinxRiddleState, artifactId: string): SphinxRiddleState {
  if (state.ownedArtifacts.includes(artifactId)) return state;
  const artifact = ALL_ARTIFACTS.find((a) => a.id === artifactId);
  if (!artifact) return state;
  return { ...state, ownedArtifacts: [...state.ownedArtifacts, artifactId] };
}

export function spEquipArtifact(state: SphinxRiddleState, artifactId: string | null): SphinxRiddleState {
  if (artifactId && !state.ownedArtifacts.includes(artifactId)) return state;
  return { ...state, equippedArtifact: artifactId };
}

export function spGetEquippedArtifactBonus(state: SphinxRiddleState): { bonusRep: number; bonusXp: number } {
  if (!state.equippedArtifact) return { bonusRep: 0, bonusXp: 0 };
  const artifact = ALL_ARTIFACTS.find((a) => a.id === state.equippedArtifact);
  if (!artifact) return { bonusRep: 0, bonusXp: 0 };
  return { bonusRep: artifact.bonusRep, bonusXp: artifact.bonusXp };
}

export function spGetArtifactsByRarity(rarity: ArtifactRarity): Artifact[] {
  return ALL_ARTIFACTS.filter((a) => a.rarity === rarity);
}

export function spGetArtifactsByCategory(category: SphinxRiddleCategory): Artifact[] {
  return ALL_ARTIFACTS.filter((a) => a.category === category);
}

// ─── Sphinx Types ──────────────────────────────────────────

export function spGetSphinxType(id: string): SphinxType | undefined {
  return SPHINX_TYPES.find((s) => s.id === id);
}

export function spSetActiveSphinx(state: SphinxRiddleState, sphinxId: string): SphinxRiddleState {
  const sphinx = SPHINX_TYPES.find((s) => s.id === sphinxId);
  if (!sphinx) return state;
  return { ...state, activeSphinxType: sphinxId };
}

export function spSetDifficulty(state: SphinxRiddleState, difficulty: SphinxDifficulty): SphinxRiddleState {
  return { ...state, selectedDifficulty: difficulty };
}

export function spGetSphinxRiddleCount(sphinxId: string): number {
  return ALL_RIDDLES.filter((r) => r.sphinxType === sphinxId).length;
}

export function spGetSphinxForRiddle(riddle: SphinxRiddle): SphinxType | undefined {
  return SPHINX_TYPES.find((s) => s.id === riddle.sphinxType);
}

// ─── Daily Challenge ───────────────────────────────────────

export function spGetDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function spIsNewDaily(state: SphinxRiddleState, date: Date): boolean {
  const today = spGetDateString(date);
  return state.lastDailyDate !== today;
}

export function spGenerateDailyChallenge(state: SphinxRiddleState, date: Date, riddles: SphinxRiddle[]): SphinxRiddleState {
  const today = spGetDateString(date);
  if (state.lastDailyDate === today && state.dailyChallenge) return state;

  const riddle = spPickRandomRiddle(riddles, { difficulty: 'hero' });
  if (!riddle) return state;

  const challenge: DailyChallenge = {
    dateStr: today,
    riddleId: riddle.id,
    completed: false,
    answeredCorrectly: false,
    timeLimit: 120,
    hintsUsed: 0,
  };

  // Streak logic
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = spGetDateString(yesterday);
  const isConsecutive = state.lastDailyDate === yesterdayStr;
  const newStreak = isConsecutive ? state.currentStreak + 1 : 1;
  const longestStreak = Math.max(state.longestStreak, newStreak);

  return {
    ...state,
    dailyChallenge: challenge,
    lastDailyDate: today,
    currentStreak: newStreak,
    longestStreak,
  };
}

export function spCompleteDailyChallenge(state: SphinxRiddleState, correct: boolean): SphinxRiddleState {
  if (!state.dailyChallenge || state.dailyChallenge.completed) return state;
  const updated = { ...state.dailyChallenge, completed: true, answeredCorrectly: correct };
  if (correct) {
    const bonusRep = 15 + state.currentStreak * 5;
    const bonusXp = 25 + state.currentStreak * 10;
    const withRep = spAddReputation(state, bonusRep);
    const withXp = spAddOracleXp(withRep, bonusXp);
    return { ...withXp, dailyChallenge: updated };
  }
  return { ...state, dailyChallenge: updated };
}

export function spGetDailyStreakBonus(streak: number): { rep: number; xp: number } {
  return {
    rep: 15 + streak * 5,
    xp: 25 + streak * 10,
  };
}

// ─── Hieroglyph Cipher Mini-Game ───────────────────────────

export function spStringToHieroglyphs(text: string): HieroglyphSymbol[] {
  const lower = text.toLowerCase().replace(/[^a-z]/g, '');
  return lower.split('').map((ch) => HIEROGLYPH_ALPHABET[ch] ?? 'ankh');
}

export function spHieroglyphsToDisplay(symbols: HieroglyphSymbol[]): string {
  return symbols.map((s) => HIEROGLYPH_SYMBOLS_DISPLAY[s] ?? '?').join(' ');
}

export function spGenerateCipher(word: string, difficulty: SphinxDifficulty): HieroglyphCipher {
  const symbols = spStringToHieroglyphs(word);
  return {
    symbols,
    translation: word,
    difficulty,
    solved: false,
    attempts: 0,
  };
}

export function spSolveCipher(cipher: HieroglyphCipher, answer: string): { solved: boolean; attempts: number } {
  const newAttempts = cipher.attempts + 1;
  const correct = cipher.translation.toLowerCase() === answer.trim().toLowerCase();
  return { solved: correct, attempts: newAttempts };
}

export function spGetCipherHint(cipher: HieroglyphCipher, level: number): string {
  const word = cipher.translation;
  if (level === 1) return `Length: ${word.length} letters`;
  if (level === 2) return `First letter: ${word[0]}`;
  if (level >= 3) return `Last letter: ${word[word.length - 1]}`;
  return '';
}

export function spGetCipherDifficultyWord(difficulty: SphinxDifficulty): string {
  const pools: Record<SphinxDifficulty, string[]> = {
    mortal: ['cat', 'sun', 'god', 'eye', 'sky', 'fire', 'water', 'sand', 'star', 'moon'],
    hero: ['temple', 'pharaoh', 'nile', 'scroll', 'pyramid', 'oracle', 'sphinx', 'ancient', 'desert', 'sacred'],
    demigod: ['hieroglyph', 'labyrinth', 'necropolis', 'sarcophagus', 'cartouche', 'mausoleum', 'pantheon', 'immortal'],
    godlike: ['papyrology', 'chrysoprase', 'onomatopoeia', 'supercalifragilistic', 'hieroglyphics', 'archaeological'],
  };
  const pool = pools[difficulty] ?? pools.mortal;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function spStartCipherGame(state: SphinxRiddleState, difficulty: SphinxDifficulty): SphinxRiddleState {
  const word = spGetCipherDifficultyWord(difficulty);
  const cipher = spGenerateCipher(word, difficulty);
  return { ...state, currentCipher: cipher };
}

export function spSubmitCipherAnswer(state: SphinxRiddleState, answer: string): SphinxRiddleState {
  if (!state.currentCipher || state.currentCipher.solved) return state;
  const result = spSolveCipher(state.currentCipher, answer);
  const updatedCipher = { ...state.currentCipher, ...result };
  const stateWithCipher = { ...state, currentCipher: updatedCipher };

  if (result.solved) {
    const xp = updatedCipher.difficulty === 'mortal' ? 10 : updatedCipher.difficulty === 'hero' ? 25 : updatedCipher.difficulty === 'demigod' ? 50 : 100;
    const withXp = spAddOracleXp(stateWithCipher, xp);
    return { ...withXp, ciphersCompleted: withXp.ciphersCompleted + 1 };
  }
  return { ...stateWithCipher, ciphersFailed: stateWithCipher.ciphersFailed + 1 };
}

// ─── Treasure Vault ────────────────────────────────────────

export function spGetVaultKeysCount(state: SphinxRiddleState): number {
  return state.vaultKeys.length;
}

export function spCanUnlockVaultRoom(state: SphinxRiddleState, roomIndex: number): boolean {
  const room = state.vaultRooms.find((r) => r.index === roomIndex);
  if (!room || !room.locked) return false;
  return state.vaultKeys.length >= room.requiredKeys;
}

export function spUnlockVaultRoom(state: SphinxRiddleState, roomIndex: number): SphinxRiddleState {
  const room = state.vaultRooms.find((r) => r.index === roomIndex);
  if (!room || !room.locked) return state;
  if (state.vaultKeys.length < room.requiredKeys) return state;

  const newRooms = state.vaultRooms.map((r) =>
    r.index === roomIndex ? { ...r, locked: false } : r
  );

  const artifactId = room.reward;
  const withArtifact = state.ownedArtifacts.includes(artifactId) ? state : spAcquireArtifact(state, artifactId);

  return { ...withArtifact, vaultRooms: newRooms };
}

export function spGetUnlockedVaultRooms(state: SphinxRiddleState): VaultRoom[] {
  return state.vaultRooms.filter((r) => !r.locked);
}

export function spGetLockedVaultRooms(state: SphinxRiddleState): VaultRoom[] {
  return state.vaultRooms.filter((r) => r.locked);
}

export function spGetNextVaultRoomProgress(state: SphinxRiddleState): { current: number; required: number; percent: number } {
  const nextLocked = state.vaultRooms.find((r) => r.locked);
  if (!nextLocked) return { current: state.vaultKeys.length, required: 0, percent: 100 };
  return {
    current: state.vaultKeys.length,
    required: nextLocked.requiredKeys,
    percent: Math.min(100, Math.floor((state.vaultKeys.length / nextLocked.requiredKeys) * 100)),
  };
}

// ─── Achievements ──────────────────────────────────────────

export function spCheckAchievements(state: SphinxRiddleState): string[] {
  const newlyUnlocked: string[] = [];

  const checks: Record<string, boolean> = {
    ach01: state.solvedRiddleIds.length >= 1,
    ach02: state.solvedRiddleIds.length >= 10,
    ach03: state.solvedRiddleIds.length >= 25,
    ach04: state.solvedRiddleIds.length >= 50,
    ach05: spGetNoHintStreak(state) >= 5,
    ach06: state.bestStreak >= 5,
    ach07: state.bestStreak >= 10,
    ach08: state.longestStreak >= 7,
    ach09: state.ciphersCompleted >= 10,
    ach10: spGetUnlockedVaultRooms(state).length >= 5,
    ach11: state.ownedArtifacts.length >= 10,
    ach12: spGetSolvedCategoriesCount(state) >= 6,
    ach13: spHasSolvedGodlike(state),
    ach14: state.unlockedNodes.length >= 10,
    ach15: state.oracle.level >= 25,
  };

  for (const [id, condition] of Object.entries(checks)) {
    if (condition && !state.achievements.includes(id) && !newlyUnlocked.includes(id)) {
      newlyUnlocked.push(id);
    }
  }

  return newlyUnlocked;
}

export function spUnlockAchievements(state: SphinxRiddleState, ids: string[]): SphinxRiddleState {
  let newState = state;
  for (const id of ids) {
    if (!newState.achievements.includes(id)) {
      newState = { ...newState, achievements: [...newState.achievements, id] };
    }
  }
  return newState;
}

export function spGetAchievementDefinition(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
}

export function spGetAllAchievementDefinitions(): Achievement[] {
  return [...ALL_ACHIEVEMENTS];
}

export function spGetUnlockedAchievements(state: SphinxRiddleState): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((a) => state.achievements.includes(a.id));
}

export function spGetLockedAchievements(state: SphinxRiddleState): Achievement[] {
  return ALL_ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id));
}

// ─── Stats ─────────────────────────────────────────────────

export function spGetAccuracy(state: SphinxRiddleState): number {
  if (state.totalRiddlesAttempted === 0) return 0;
  return Math.floor((state.totalCorrect / state.totalRiddlesAttempted) * 100);
}

export function spGetSolvedCategoriesCount(state: SphinxRiddleState): number {
  const categories = new Set<SphinxRiddleCategory>();
  for (const id of state.solvedRiddleIds) {
    const riddle = ALL_RIDDLES.find((r) => r.id === id);
    if (riddle) categories.add(riddle.category);
  }
  return categories.size;
}

export function spHasSolvedGodlike(state: SphinxRiddleState): boolean {
  return state.solvedRiddleIds.some((id) => {
    const riddle = ALL_RIDDLES.find((r) => r.id === id);
    return riddle?.difficulty === 'godlike';
  });
}

export function spGetNoHintStreak(state: SphinxRiddleState): number {
  let streak = 0;
  for (let i = state.riddleHistory.length - 1; i >= 0; i--) {
    const entry = state.riddleHistory[i];
    if (entry.correct && entry.hintsUsed === 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function spRecalcFavoriteCategory(state: SphinxRiddleState, lastCategory: SphinxRiddleCategory): SphinxRiddleCategory {
  const counts: Record<SphinxRiddleCategory, number> = {
    logic: 0, wordplay: 0, math: 0, philosophy: 0, nature: 0, history: 0,
  };
  for (const id of state.solvedRiddleIds) {
    const riddle = ALL_RIDDLES.find((r) => r.id === id);
    if (riddle) counts[riddle.category]++;
  }
  counts[lastCategory]++;
  let maxCat: SphinxRiddleCategory = 'logic';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxCat = cat as SphinxRiddleCategory;
    }
  }
  return maxCat;
}

export function spGetCategoryProgress(state: SphinxRiddleState): Record<SphinxRiddleCategory, { total: number; solved: number }> {
  const result: Record<SphinxRiddleCategory, { total: number; solved: number }> = {
    logic: { total: 0, solved: 0 },
    wordplay: { total: 0, solved: 0 },
    math: { total: 0, solved: 0 },
    philosophy: { total: 0, solved: 0 },
    nature: { total: 0, solved: 0 },
    history: { total: 0, solved: 0 },
  };
  for (const riddle of ALL_RIDDLES) {
    result[riddle.category].total++;
  }
  for (const id of state.solvedRiddleIds) {
    const riddle = ALL_RIDDLES.find((r) => r.id === id);
    if (riddle) result[riddle.category].solved++;
  }
  return result;
}

export function spGetDifficultyStats(state: SphinxRiddleState): Record<SphinxDifficulty, { attempted: number; correct: number }> {
  const result: Record<SphinxDifficulty, { attempted: number; correct: number }> = {
    mortal: { attempted: 0, correct: 0 },
    hero: { attempted: 0, correct: 0 },
    demigod: { attempted: 0, correct: 0 },
    godlike: { attempted: 0, correct: 0 },
  };
  for (const entry of state.riddleHistory) {
    const riddle = ALL_RIDDLES.find((r) => r.id === entry.riddleId);
    if (riddle) {
      result[riddle.difficulty].attempted++;
      if (entry.correct) result[riddle.difficulty].correct++;
    }
  }
  return result;
}

export function spGetTotalPlayTime(state: SphinxRiddleState): number {
  return state.riddleHistory.reduce((sum, entry) => sum + entry.timeTaken, 0);
}

// ─── Utility / Misc ────────────────────────────────────────

export function spResetGame(): SphinxRiddleState {
  return spCreateInitialState();
}

export function spGetError(state: SphinxRiddleState): string | null {
  return state.error;
}

export function spClearError(state: SphinxRiddleState): SphinxRiddleState {
  return { ...state, error: null };
}

export function spSetError(state: SphinxRiddleState, message: string): SphinxRiddleState {
  return { ...state, error: message };
}

export function spGetRiddleLore(riddleId: string): string {
  const riddle = ALL_RIDDLES.find((r) => r.id === riddleId);
  return riddle?.lore ?? '';
}

export function spGetRiddleById(riddleId: string): SphinxRiddle | undefined {
  return ALL_RIDDLES.find((r) => r.id === riddleId);
}

export function spGetRiddleCount(): number {
  return ALL_RIDDLES.length;
}

export function spGetRiddlesByCategory(category: SphinxRiddleCategory): SphinxRiddle[] {
  return ALL_RIDDLES.filter((r) => r.category === category);
}

export function spGetRiddlesByDifficulty(difficulty: SphinxDifficulty): SphinxRiddle[] {
  return ALL_RIDDLES.filter((r) => r.difficulty === difficulty);
}

export function spShuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function spGetRandomSphinxType(): SphinxType {
  return SPHINX_TYPES[Math.floor(Math.random() * SPHINX_TYPES.length)];
}

export function spGetRiddleCompletionPercent(state: SphinxRiddleState): number {
  if (ALL_RIDDLES.length === 0) return 0;
  return Math.floor((state.solvedRiddleIds.length / ALL_RIDDLES.length) * 100);
}

export function spGetSolvedCount(state: SphinxRiddleState): number {
  return state.solvedRiddleIds.length;
}

export function spGetFailedCount(state: SphinxRiddleState): number {
  return state.failedRiddleIds.length;
}

export function spGetOverallGrade(state: SphinxRiddleState): string {
  const accuracy = spGetAccuracy(state);
  const solved = state.solvedRiddleIds.length;
  if (accuracy >= 90 && solved >= 40) return 'S+';
  if (accuracy >= 85 && solved >= 30) return 'S';
  if (accuracy >= 75 && solved >= 20) return 'A';
  if (accuracy >= 65 && solved >= 15) return 'B';
  if (accuracy >= 50 && solved >= 10) return 'C';
  if (solved >= 5) return 'D';
  return 'F';
}

export function spGetSummaryStats(state: SphinxRiddleState) {
  return {
    solved: state.solvedRiddleIds.length,
    failed: state.failedRiddleIds.length,
    accuracy: spGetAccuracy(state),
    streak: state.consecutiveCorrect,
    bestStreak: state.bestStreak,
    reputation: state.reputation,
    rank: state.rank,
    oracleLevel: state.oracle.level,
    oracleTitle: state.oracle.title,
    artifacts: state.ownedArtifacts.length,
    achievements: state.achievements.length,
    dailyStreak: state.currentStreak,
    ciphersCompleted: state.ciphersCompleted,
    vaultRoomsUnlocked: spGetUnlockedVaultRooms(state).length,
    grade: spGetOverallGrade(state),
    totalXp: state.totalXp,
  };
}

// ─── Derived Getters ───────────────────────────────────────

export function spGetCurrentHintText(state: SphinxRiddleState): string | null {
  if (!state.currentRiddle || state.currentHintLevel === 0) return null;
  return spGetHint(state.currentRiddle, state.currentHintLevel);
}

export function spIsRiddleActive(state: SphinxRiddleState): boolean {
  return state.currentRiddle !== null && state.riddleStatus === 'unsolved';
}

export function spCanRevealNextHint(state: SphinxRiddleState): boolean {
  return state.currentRiddle !== null && state.currentHintLevel < 3 && state.riddleStatus !== 'solved' && state.riddleStatus !== 'failed';
}

export function spHasRiddleAvailable(state: SphinxRiddleState): boolean {
  const solved = new Set(state.solvedRiddleIds);
  const failed = new Set(state.failedRiddleIds);
  return ALL_RIDDLES.some((r) => !solved.has(r.id) && !failed.has(r.id));
}

export function spIsDailyAvailable(state: SphinxRiddleState, date: Date): boolean {
  return spIsNewDaily(state, date) || (state.dailyChallenge !== null && !state.dailyChallenge.completed);
}

export function spGetCipherWordLength(state: SphinxRiddleState): number | null {
  if (!state.currentCipher) return null;
  return state.currentCipher.symbols.length;
}

export function spIsCipherActive(state: SphinxRiddleState): boolean {
  return state.currentCipher !== null && !state.currentCipher.solved;
}

// ─── Score Combos ──────────────────────────────────────────

export function spCalcComboMultiplier(streak: number): number {
  if (streak >= 20) return 5;
  if (streak >= 15) return 4;
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export function spGetComboLabel(streak: number): string {
  if (streak >= 20) return 'LEGENDARY COMBO';
  if (streak >= 15) return 'GODLIKE COMBO';
  if (streak >= 10) return 'DEMIGOD COMBO';
  if (streak >= 5) return 'HERO COMBO';
  if (streak >= 3) return 'MORTAL COMBO';
  return '';
}

// ─── Exported category/difficulty helpers ───────────────────

export function spGetCategoryInfo(categoryId: SphinxRiddleCategory) {
  return SPHINX_RIDDLE_CATEGORIES.find((c) => c.id === categoryId);
}

export function spGetDifficultyInfo(difficultyId: SphinxDifficulty) {
  return SPHINX_DIFFICULTY_TIERS.find((d) => d.id === difficultyId);
}

export function spGetBranchInfo(branchId: KnowledgeBranch) {
  return KNOWLEDGE_BRANCHES.find((b) => b.id === branchId);
}

export function spAllCategories(): SphinxRiddleCategory[] {
  return ['logic', 'wordplay', 'math', 'philosophy', 'nature', 'history'];
}

export function spAllDifficulties(): SphinxDifficulty[] {
  return ['mortal', 'hero', 'demigod', 'godlike'];
}

export function spAllBranches(): KnowledgeBranch[] {
  return ['wisdom', 'courage', 'mystery', 'justice', 'creation'];
}

export function spAllRanks(): SphinxRank[] {
  return ['wanderer', 'initiate', 'scholar', 'oracle', 'keeper', 'pharaoh'];
}

export function spAllHieroglyphSymbols(): HieroglyphSymbol[] {
  return ['ankh', 'eye', 'scarab', 'pyramid', 'sun', 'moon', 'snake', 'bird', 'lotus', 'water'];
}

// ─── State Merge (for partial updates) ─────────────────────

export function spMergeState(state: SphinxRiddleState, partial: Partial<SphinxRiddleState>): SphinxRiddleState {
  return { ...state, ...partial };
}

// ─── Validation ────────────────────────────────────────────

export function spValidateAnswer(answer: string): { valid: boolean; sanitized: string } {
  const sanitized = answer.trim().toLowerCase();
  return { valid: sanitized.length > 0, sanitized };
}

export function spIsRiddleComplete(status: RiddleStatus): boolean {
  return status === 'solved' || status === 'failed';
}

export function spIsHintUsed(status: RiddleStatus): boolean {
  return status === 'hint1' || status === 'hint2' || status === 'hint3';
}

export function spGetHintLevelFromStatus(status: RiddleStatus): SphinxHintLevel {
  if (status === 'hint1') return 1;
  if (status === 'hint2') return 2;
  if (status === 'hint3') return 3;
  return 0;
}

// ─── Quick-Start Helpers ───────────────────────────────────

export function spQuickStartGame(): SphinxRiddleState {
  const state = spCreateInitialState();
  const riddle = spPickRandomRiddle(ALL_RIDDLES, { difficulty: 'mortal' });
  if (!riddle) return state;
  return spSetCurrentRiddle(state, riddle);
}

export function spStartCategoryGame(category: SphinxRiddleCategory): SphinxRiddleState {
  const state = spCreateInitialState();
  const riddle = spPickRandomRiddle(ALL_RIDDLES, { category });
  if (!riddle) return state;
  return spSetCurrentRiddle(state, riddle);
}

export function spStartSphinxGame(sphinxId: string): SphinxRiddleState {
  const state = spCreateInitialState();
  const withSphinx = spSetActiveSphinx(state, sphinxId);
  const riddle = spSelectRiddleForSphinx(withSphinx, ALL_RIDDLES);
  if (!riddle) return withSphinx;
  return spSetCurrentRiddle(withSphinx, riddle);
}

export function spNextRiddle(state: SphinxRiddleState): SphinxRiddleState {
  const riddle = spSelectRiddleForSphinx(state, ALL_RIDDLES);
  if (!riddle) return { ...state, currentRiddle: null, error: 'No more riddles available!' };
  return spSetCurrentRiddle(state, riddle);
}

export function spRetryFailedRiddle(state: SphinxRiddleState): SphinxRiddleState {
  if (state.failedRiddleIds.length === 0) return state;
  const lastFailedId = state.failedRiddleIds[state.failedRiddleIds.length - 1];
  const riddle = ALL_RIDDLES.find((r) => r.id === lastFailedId);
  if (!riddle) return state;
  return spSetCurrentRiddle(state, riddle);
}

// ─── Special Event Riddles ─────────────────────────────────

export function spGetEventRiddle(eventType: string): SphinxRiddle | null {
  const eventMap: Record<string, SphinxRiddleCategory> = {
    full_moon: 'logic',
    solar_eclipse: 'math',
    nile_flood: 'nature',
    pharaoh_birthday: 'history',
    sphinx_day: 'philosophy',
  };
  const category = eventMap[eventType];
  if (!category) return null;
  return spPickRandomRiddle(ALL_RIDDLES, { category, difficulty: 'demigod' });
}

export function spGenerateChallengeSet(count: number, difficulty: SphinxDifficulty): SphinxRiddle[] {
  const pool = ALL_RIDDLES.filter((r) => r.difficulty === difficulty);
  return spShuffleArray(pool).slice(0, Math.min(count, pool.length));
}

// ─── Export Count Verification ─────────────────────────────
// (internal helper, not exported as sp-prefixed)

function spCountExports(): number {
  return 0; // placeholder — export count is verified externally
}

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT — React Hook
// React imports ONLY in this block; no useMemo
// ═══════════════════════════════════════════════════════════

export default function useSphinxRiddle(initialState?: SphinxRiddleState) {
  // React imports are only used in this default export hook
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMod = require('react') as typeof import('react');
  const useState = ReactMod.useState;
  const useCallback = ReactMod.useCallback;
  const useRef = ReactMod.useRef;

  const [state, setState] = useState<SphinxRiddleState>(
    initialState ?? spCreateInitialState()
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const getState = useCallback(() => stateRef.current, []);

  const startNewGame = useCallback(() => {
    const s = spQuickStartGame();
    setState(s);
    return s;
  }, []);

  const selectCategory = useCallback((category: SphinxRiddleCategory) => {
    const s = spStartCategoryGame(category);
    setState(s);
    return s;
  }, []);

  const selectSphinx = useCallback((sphinxId: string) => {
    const s = spStartSphinxGame(sphinxId);
    setState(s);
    return s;
  }, []);

  const setDifficulty = useCallback((difficulty: SphinxDifficulty) => {
    setState((prev) => spSetDifficulty(prev, difficulty));
  }, []);

  const revealHint = useCallback(() => {
    setState((prev) => spRevealHint(prev));
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    setState((prev) => {
      const nextState = spSolveRiddle(prev, answer);
      const newAchievements = spCheckAchievements(nextState);
      return spUnlockAchievements(nextState, newAchievements);
    });
  }, []);

  const nextRiddle = useCallback(() => {
    setState((prev) => spNextRiddle(prev));
  }, []);

  const retryFailed = useCallback(() => {
    setState((prev) => spRetryFailedRiddle(prev));
  }, []);

  const generateDaily = useCallback(() => {
    const now = new Date();
    setState((prev) => spGenerateDailyChallenge(prev, now, ALL_RIDDLES));
  }, []);

  const completeDaily = useCallback((correct: boolean) => {
    setState((prev) => spCompleteDailyChallenge(prev, correct));
  }, []);

  const unlockNode = useCallback((nodeId: string) => {
    setState((prev) => spUnlockNode(prev, nodeId));
  }, []);

  const equipArtifact = useCallback((artifactId: string | null) => {
    setState((prev) => spEquipArtifact(prev, artifactId));
  }, []);

  const startCipher = useCallback((difficulty: SphinxDifficulty) => {
    setState((prev) => spStartCipherGame(prev, difficulty));
  }, []);

  const submitCipher = useCallback((answer: string) => {
    setState((prev) => {
      const nextState = spSubmitCipherAnswer(prev, answer);
      const newAchievements = spCheckAchievements(nextState);
      return spUnlockAchievements(nextState, newAchievements);
    });
  }, []);

  const unlockVault = useCallback((roomIndex: number) => {
    setState((prev) => {
      const nextState = spUnlockVaultRoom(prev, roomIndex);
      const newAchievements = spCheckAchievements(nextState);
      return spUnlockAchievements(nextState, newAchievements);
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(spCreateInitialState());
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => spClearError(prev));
  }, []);

  // Direct computed values (no useMemo)
  const currentHintText = spGetCurrentHintText(state);
  const isRiddleActive = spIsRiddleActive(state);
  const canRevealHint = spCanRevealNextHint(state);
  const accuracy = spGetAccuracy(state);
  const completionPercent = spGetRiddleCompletionPercent(state);
  const overallGrade = spGetOverallGrade(state);
  const summaryStats = spGetSummaryStats(state);
  const categoryProgress = spGetCategoryProgress(state);
  const difficultyStats = spGetDifficultyStats(state);
  const unlockableNodes = spGetUnlockableNodes(state);
  const ownedArtifacts = spGetOwnedArtifacts(state);
  const availableArtifacts = spGetAvailableArtifacts(state);
  const unlockedAchievements = spGetUnlockedAchievements(state);
  const lockedAchievements = spGetLockedAchievements(state);
  const isCipherActive = spIsCipherActive(state);
  const comboMultiplier = spCalcComboMultiplier(state.consecutiveCorrect);
  const comboLabel = spGetComboLabel(state.consecutiveCorrect);
  const vaultProgress = spGetNextVaultRoomProgress(state);
  const repProgress = spRepProgressPercent(state.reputation, state.rank);
  const nextRank = spGetNextRankInfo(state.rank);
  const repToNext = spRepToNextRank(state.reputation, state.rank);
  const activeSphinx = spGetSphinxType(state.activeSphinxType);
  const rankInfo = spGetRankInfo(state.rank);

  return {
    state,
    getState,
    startNewGame,
    selectCategory,
    selectSphinx,
    setDifficulty,
    revealHint,
    submitAnswer,
    nextRiddle,
    retryFailed,
    generateDaily,
    completeDaily,
    unlockNode,
    equipArtifact,
    startCipher,
    submitCipher,
    unlockVault,
    resetGame,
    clearError,
    // Computed
    currentHintText,
    isRiddleActive,
    canRevealHint,
    accuracy,
    completionPercent,
    overallGrade,
    summaryStats,
    categoryProgress,
    difficultyStats,
    unlockableNodes,
    ownedArtifacts,
    availableArtifacts,
    unlockedAchievements,
    lockedAchievements,
    isCipherActive,
    comboMultiplier,
    comboLabel,
    vaultProgress,
    repProgress,
    nextRank,
    repToNext,
    activeSphinx,
    rankInfo,
  };
}
