// ============================================================================
// Word Sniper Wire — SSR-safe state module for the Word Snake sniper system
// ============================================================================
// Convention: every exported fn uses the "ws" prefix.
// No localStorage / window / document / setInterval / addEventListener.
// Timestamps via Date.now(). Lazy-init guard via ensureInit().
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MissionCategory =
  | 'letter-hunt'
  | 'word-elimination'
  | 'vowel-strike'
  | 'consonant-clear'
  | 'prefix-patrol'
  | 'suffix-sweep'
  | 'anagram-assassin'
  | 'double-agent'
  | 'palindrome-purge'
  | 'boss-target';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type TargetKind =
  | 'letter'
  | 'word'
  | 'phrase'
  | 'boss';

export type TargetSpecial =
  | 'none'
  | 'golden'
  | 'armored'
  | 'splitting';

export type WeaponId =
  | 'standard'
  | 'heavy'
  | 'shotgun'
  | 'laser'
  | 'silent'
  | 'legendary';

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// ---------------------------------------------------------------------------
// Mission catalogue (10 categories × 3 difficulties = 30 missions)
// ---------------------------------------------------------------------------

interface MissionDef {
  id: string;
  category: MissionCategory;
  categoryLabel: string;
  difficulty: Difficulty;
  label: string;
  description: string;
  objective: string;
  objectiveCount: number;
  timeLimit: number; // seconds
  basePoints: number;
}

const MISSION_CATALOGUE: MissionDef[] = [
  // ── Letter Hunt ──────────────────────────────────────────────────────────
  {
    id: 'lh-easy', category: 'letter-hunt', categoryLabel: 'Letter Hunt',
    difficulty: 'easy', label: 'Alphabet Scavenger',
    description: 'Spot and eliminate 10 letter targets as they scramble across the field.',
    objective: 'Eliminate letter targets', objectiveCount: 10,
    timeLimit: 60, basePoints: 200,
  },
  {
    id: 'lh-medium', category: 'letter-hunt', categoryLabel: 'Letter Hunt',
    difficulty: 'medium', label: 'Vowel Vanguard',
    description: 'Hunt down 15 letter targets with a mix of vowels and consonants.',
    objective: 'Eliminate letter targets', objectiveCount: 15,
    timeLimit: 60, basePoints: 400,
  },
  {
    id: 'lh-hard', category: 'letter-hunt', categoryLabel: 'Letter Hunt',
    difficulty: 'hard', label: 'Rare Letter Run',
    description: 'Eliminate 20 letter targets — rare letters (X, Z, Q, J) score triple.',
    objective: 'Eliminate letter targets', objectiveCount: 20,
    timeLimit: 90, basePoints: 700,
  },

  // ── Word Elimination ─────────────────────────────────────────────────────
  {
    id: 'we-easy', category: 'word-elimination', categoryLabel: 'Word Elimination',
    difficulty: 'easy', label: 'Short Word Slayer',
    description: 'Eliminate 8 three-letter word targets before they escape.',
    objective: 'Eliminate word targets', objectiveCount: 8,
    timeLimit: 60, basePoints: 300,
  },
  {
    id: 'we-medium', category: 'word-elimination', categoryLabel: 'Word Elimination',
    difficulty: 'medium', label: 'Word Wrecker',
    description: 'Eliminate 10 word targets of varying length. Longer words are worth more.',
    objective: 'Eliminate word targets', objectiveCount: 10,
    timeLimit: 90, basePoints: 550,
  },
  {
    id: 'we-hard', category: 'word-elimination', categoryLabel: 'Word Elimination',
    difficulty: 'hard', label: 'Lexicon Purge',
    description: 'Eliminate 15 word targets including 5+ letter words. No misses allowed.',
    objective: 'Eliminate word targets', objectiveCount: 15,
    timeLimit: 120, basePoints: 900,
  },

  // ── Vowel Strike ─────────────────────────────────────────────────────────
  {
    id: 'vs-easy', category: 'vowel-strike', categoryLabel: 'Vowel Strike',
    difficulty: 'easy', label: 'Vowel Spotter',
    description: 'Hit only vowel-bearing targets. Eliminate 10 vowel targets.',
    objective: 'Eliminate vowel targets', objectiveCount: 10,
    timeLimit: 60, basePoints: 250,
  },
  {
    id: 'vs-medium', category: 'vowel-strike', categoryLabel: 'Vowel Strike',
    difficulty: 'medium', label: 'Vowel Storm',
    description: 'Eliminate 15 vowel targets while avoiding consonant decoys.',
    objective: 'Eliminate vowel targets', objectiveCount: 15,
    timeLimit: 90, basePoints: 500,
  },
  {
    id: 'vs-hard', category: 'vowel-strike', categoryLabel: 'Vowel Strike',
    difficulty: 'hard', label: 'Vowel Blitz',
    description: 'Eliminate 20 vowel targets in a dense field of consonants.',
    objective: 'Eliminate vowel targets', objectiveCount: 20,
    timeLimit: 90, basePoints: 800,
  },

  // ── Consonant Clear ──────────────────────────────────────────────────────
  {
    id: 'cc-easy', category: 'consonant-clear', categoryLabel: 'Consonant Clear',
    difficulty: 'easy', label: 'Consonant Sweep',
    description: 'Clear 10 consonant targets from the field.',
    objective: 'Eliminate consonant targets', objectiveCount: 10,
    timeLimit: 60, basePoints: 250,
  },
  {
    id: 'cc-medium', category: 'consonant-clear', categoryLabel: 'Consonant Clear',
    difficulty: 'medium', label: 'Hard Consonant Barrage',
    description: 'Eliminate 15 hard consonant targets (B, C, D, G, K, P, T).',
    objective: 'Eliminate consonant targets', objectiveCount: 15,
    timeLimit: 90, basePoints: 500,
  },
  {
    id: 'cc-hard', category: 'consonant-clear', categoryLabel: 'Consonant Clear',
    difficulty: 'hard', label: 'Consonant Avalanche',
    description: 'Eliminate 20 consonant targets. Consonant combos give bonus points.',
    objective: 'Eliminate consonant targets', objectiveCount: 20,
    timeLimit: 90, basePoints: 800,
  },

  // ── Prefix Patrol ────────────────────────────────────────────────────────
  {
    id: 'pp-easy', category: 'prefix-patrol', categoryLabel: 'Prefix Patrol',
    difficulty: 'easy', label: 'Prefix Beginner',
    description: 'Eliminate 6 word targets that start with common prefixes (un-, re-).',
    objective: 'Eliminate prefix words', objectiveCount: 6,
    timeLimit: 60, basePoints: 350,
  },
  {
    id: 'pp-medium', category: 'prefix-patrol', categoryLabel: 'Prefix Patrol',
    difficulty: 'medium', label: 'Prefix Hunter',
    description: 'Eliminate 10 word targets with prefixes (pre-, dis-, mis-, over-).',
    objective: 'Eliminate prefix words', objectiveCount: 10,
    timeLimit: 90, basePoints: 600,
  },
  {
    id: 'pp-hard', category: 'prefix-patrol', categoryLabel: 'Prefix Patrol',
    difficulty: 'hard', label: 'Prefix Master',
    description: 'Eliminate 15 word targets matching any of 8+ prefix patterns.',
    objective: 'Eliminate prefix words', objectiveCount: 15,
    timeLimit: 120, basePoints: 950,
  },

  // ── Suffix Sweep ─────────────────────────────────────────────────────────
  {
    id: 'ss-easy', category: 'suffix-sweep', categoryLabel: 'Suffix Sweep',
    difficulty: 'easy', label: 'Suffix Starter',
    description: 'Eliminate 6 word targets ending in -ing or -ed.',
    objective: 'Eliminate suffix words', objectiveCount: 6,
    timeLimit: 60, basePoints: 350,
  },
  {
    id: 'ss-medium', category: 'suffix-sweep', categoryLabel: 'Suffix Sweep',
    difficulty: 'medium', label: 'Suffix Sweeper',
    description: 'Eliminate 10 word targets with suffixes (-tion, -ment, -ness, -able).',
    objective: 'Eliminate suffix words', objectiveCount: 10,
    timeLimit: 90, basePoints: 600,
  },
  {
    id: 'ss-hard', category: 'suffix-sweep', categoryLabel: 'Suffix Sweep',
    difficulty: 'hard', label: 'Suffix Cyclone',
    description: 'Eliminate 15 word targets across 8+ suffix patterns under pressure.',
    objective: 'Eliminate suffix words', objectiveCount: 15,
    timeLimit: 120, basePoints: 950,
  },

  // ── Anagram Assassin ─────────────────────────────────────────────────────
  {
    id: 'aa-easy', category: 'anagram-assassin', categoryLabel: 'Anagram Assassin',
    difficulty: 'easy', label: 'Anagram Novice',
    description: 'Identify and eliminate 5 anagram pairs in the target field.',
    objective: 'Eliminate anagram pairs', objectiveCount: 5,
    timeLimit: 60, basePoints: 400,
  },
  {
    id: 'aa-medium', category: 'anagram-assassin', categoryLabel: 'Anagram Assassin',
    difficulty: 'medium', label: 'Anagram Sharpshooter',
    description: 'Find and eliminate 8 anagram sets among scrambled targets.',
    objective: 'Eliminate anagram pairs', objectiveCount: 8,
    timeLimit: 90, basePoints: 700,
  },
  {
    id: 'aa-hard', category: 'anagram-assassin', categoryLabel: 'Anagram Assassin',
    difficulty: 'hard', label: 'Anagram Executioner',
    description: 'Eliminate 12 anagram groups. Fast recognition is critical.',
    objective: 'Eliminate anagram pairs', objectiveCount: 12,
    timeLimit: 90, basePoints: 1100,
  },

  // ── Double Agent ─────────────────────────────────────────────────────────
  {
    id: 'da-easy', category: 'double-agent', categoryLabel: 'Double Agent',
    difficulty: 'easy', label: 'Double Letter Scout',
    description: 'Eliminate 8 targets that contain double letters (e.g. LL, EE, OO).',
    objective: 'Eliminate double-letter targets', objectiveCount: 8,
    timeLimit: 60, basePoints: 350,
  },
  {
    id: 'da-medium', category: 'double-agent', categoryLabel: 'Double Agent',
    difficulty: 'medium', label: 'Double Agent Ops',
    description: 'Eliminate 12 double-letter word targets. Some are disguised.',
    objective: 'Eliminate double-letter targets', objectiveCount: 12,
    timeLimit: 90, basePoints: 650,
  },
  {
    id: 'da-hard', category: 'double-agent', categoryLabel: 'Double Agent',
    difficulty: 'hard', label: 'Double Agent Elite',
    description: 'Eliminate 15 double-letter targets in a crowded, fast-moving field.',
    objective: 'Eliminate double-letter targets', objectiveCount: 15,
    timeLimit: 120, basePoints: 1000,
  },

  // ── Palindrome Purge ─────────────────────────────────────────────────────
  {
    id: 'ppal-easy', category: 'palindrome-purge', categoryLabel: 'Palindrome Purge',
    difficulty: 'easy', label: 'Palindrome Seeker',
    description: 'Eliminate 5 palindrome word targets (e.g. mom, level, radar).',
    objective: 'Eliminate palindrome targets', objectiveCount: 5,
    timeLimit: 60, basePoints: 400,
  },
  {
    id: 'ppal-medium', category: 'palindrome-purge', categoryLabel: 'Palindrome Purge',
    difficulty: 'medium', label: 'Palindrome Hunter',
    description: 'Eliminate 8 palindrome targets hidden among decoy words.',
    objective: 'Eliminate palindrome targets', objectiveCount: 8,
    timeLimit: 90, basePoints: 700,
  },
  {
    id: 'ppal-hard', category: 'palindrome-purge', categoryLabel: 'Palindrome Purge',
    difficulty: 'hard', label: 'Palindrome Annihilator',
    description: 'Eliminate 12 palindrome targets. Longer palindromes score extra.',
    objective: 'Eliminate palindrome targets', objectiveCount: 12,
    timeLimit: 120, basePoints: 1100,
  },

  // ── Boss Target ──────────────────────────────────────────────────────────
  {
    id: 'bt-easy', category: 'boss-target', categoryLabel: 'Boss Target',
    difficulty: 'easy', label: 'Mini-Boss Takedown',
    description: 'Defeat a mini-boss target with 5 HP. Clear 3 supporting targets first.',
    objective: 'Defeat boss target', objectiveCount: 1,
    timeLimit: 90, basePoints: 500,
  },
  {
    id: 'bt-medium', category: 'boss-target', categoryLabel: 'Boss Target',
    difficulty: 'medium', label: 'Boss Encounter',
    description: 'Defeat a boss with 10 HP while eliminating 8 minion targets.',
    objective: 'Defeat boss target', objectiveCount: 1,
    timeLimit: 120, basePoints: 900,
  },
  {
    id: 'bt-hard', category: 'boss-target', categoryLabel: 'Boss Target',
    difficulty: 'hard', label: 'Ultimate Boss Fight',
    description: 'Defeat a legendary boss with 20 HP. Armored minions spawn every 10s.',
    objective: 'Defeat boss target', objectiveCount: 1,
    timeLimit: 120, basePoints: 1500,
  },
];

// ---------------------------------------------------------------------------
// Weapon definitions
// ---------------------------------------------------------------------------

interface WeaponDef {
  id: WeaponId;
  label: string;
  description: string;
  damage: number;
  fireRate: number; // ms between shots (lower = faster)
  range: number;
  special: string;
  bonusMultiplier: number;
  unlockRank: number;
}

const WEAPONS: WeaponDef[] = [
  {
    id: 'standard', label: 'Standard Rifle',
    description: 'Reliable all-rounder. Fast fire rate, 1 damage per shot.',
    damage: 1, fireRate: 300, range: 100,
    special: 'None', bonusMultiplier: 1.0, unlockRank: 1,
  },
  {
    id: 'heavy', label: 'Heavy Rifle',
    description: 'Deals 3 damage per shot but has a slow fire rate.',
    damage: 3, fireRate: 900, range: 80,
    special: 'High Damage', bonusMultiplier: 1.1, unlockRank: 3,
  },
  {
    id: 'shotgun', label: 'Shotgun',
    description: 'Area damage — hits all targets in a short cone.',
    damage: 1, fireRate: 700, range: 40,
    special: 'Area Damage', bonusMultiplier: 1.2, unlockRank: 5,
  },
  {
    id: 'laser', label: 'Laser Rifle',
    description: 'Piercing beam that passes through targets. Has a charge time.',
    damage: 2, fireRate: 1200, range: 150,
    special: 'Piercing', bonusMultiplier: 1.3, unlockRank: 8,
  },
  {
    id: 'silent', label: 'Silent Rifle',
    description: 'Does not alert nearby targets. Grants bonus points per kill.',
    damage: 1, fireRate: 400, range: 120,
    special: 'Stealth Bonus', bonusMultiplier: 1.5, unlockRank: 11,
  },
  {
    id: 'legendary', label: 'Legendary Rifle',
    description: 'The ultimate weapon. Combines all bonuses with max damage.',
    damage: 2, fireRate: 350, range: 130,
    special: 'All Bonuses', bonusMultiplier: 2.0, unlockRank: 14,
  },
];

// ---------------------------------------------------------------------------
// Rank definitions (15 ranks)
// ---------------------------------------------------------------------------

interface RankDef {
  rank: number;
  label: string;
  xpThreshold: number;
  bonusPointsPerMission: number;
}

const RANKS: RankDef[] = [
  { rank: 1, label: 'Recruit', xpThreshold: 0, bonusPointsPerMission: 0 },
  { rank: 2, label: 'Cadet', xpThreshold: 200, bonusPointsPerMission: 10 },
  { rank: 3, label: 'Private', xpThreshold: 500, bonusPointsPerMission: 20 },
  { rank: 4, label: 'Corporal', xpThreshold: 1000, bonusPointsPerMission: 30 },
  { rank: 5, label: 'Sergeant', xpThreshold: 1800, bonusPointsPerMission: 50 },
  { rank: 6, label: 'Sharpshooter', xpThreshold: 3000, bonusPointsPerMission: 70 },
  { rank: 7, label: 'Marksman', xpThreshold: 4500, bonusPointsPerMission: 90 },
  { rank: 8, label: 'Expert', xpThreshold: 6500, bonusPointsPerMission: 120 },
  { rank: 9, label: 'Elite', xpThreshold: 9000, bonusPointsPerMission: 150 },
  { rank: 10, label: 'Veteran', xpThreshold: 12000, bonusPointsPerMission: 180 },
  { rank: 11, label: 'Specialist', xpThreshold: 16000, bonusPointsPerMission: 220 },
  { rank: 12, label: 'Commando', xpThreshold: 21000, bonusPointsPerMission: 260 },
  { rank: 13, label: 'Legend', xpThreshold: 27000, bonusPointsPerMission: 300 },
  { rank: 14, label: 'Master', xpThreshold: 35000, bonusPointsPerMission: 350 },
  { rank: 15, label: 'Grandmaster', xpThreshold: 50000, bonusPointsPerMission: 500 },
];

// ---------------------------------------------------------------------------
// Achievement definitions (12 achievements)
// ---------------------------------------------------------------------------

interface AchievementDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  checkFn: (stats: SniperStats) => boolean;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-blood', label: 'First Blood',
    description: 'Eliminate your first target.',
    icon: '🎯',
    checkFn: (s) => s.totalEliminations >= 1,
  },
  {
    id: 'centurion', label: 'Centurion',
    description: 'Eliminate 100 targets total.',
    icon: '💯',
    checkFn: (s) => s.totalEliminations >= 100,
  },
  {
    id: 'sharp-eye', label: 'Sharp Eye',
    description: 'Achieve 95%+ accuracy in a single mission.',
    icon: '👁️',
    checkFn: (s) => s.bestAccuracy >= 95,
  },
  {
    id: 'combo-king', label: 'Combo King',
    description: 'Reach a 10-hit combo in a single mission.',
    icon: '🔥',
    checkFn: (s) => s.bestCombo >= 10,
  },
  {
    id: 'headhunter', label: 'Headhunter',
    description: 'Land 50 headshots total.',
    icon: '💀',
    checkFn: (s) => s.totalHeadshots >= 50,
  },
  {
    id: 'mission-master', label: 'Mission Master',
    description: 'Complete 30 missions.',
    icon: '🎖️',
    checkFn: (s) => s.totalMissionsCompleted >= 30,
  },
  {
    id: 'boss-slayer', label: 'Boss Slayer',
    description: 'Defeat 5 boss targets.',
    icon: '🐉',
    checkFn: (s) => s.bossEliminations >= 5,
  },
  {
    id: 'rank-legend', label: 'Rank Legend',
    description: 'Reach the rank of Legend or higher.',
    icon: '⭐',
    checkFn: (s) => s.currentRank >= 13,
  },
  {
    id: 'golden-touch', label: 'Golden Touch',
    description: 'Eliminate 20 golden targets.',
    icon: '🌟',
    checkFn: (s) => s.goldenEliminations >= 20,
  },
  {
    id: 'daily-streak-7', label: 'Daily Devotee',
    description: 'Maintain a 7-day daily mission streak.',
    icon: '📅',
    checkFn: (s) => s.dailyStreak >= 7,
  },
  {
    id: 'perfect-score', label: 'Perfect Score',
    description: 'Achieve an S grade on any mission.',
    icon: '🏆',
    checkFn: (s) => s.sGradeCount >= 1,
  },
  {
    id: 'armored-breaker', label: 'Armored Breaker',
    description: 'Eliminate 10 armored targets.',
    icon: '🛡️',
    checkFn: (s) => s.armoredEliminations >= 10,
  },
];

// ---------------------------------------------------------------------------
// Sample word pools for target generation
// ---------------------------------------------------------------------------

const WORD_POOL_SHORT = [
  'cat', 'dog', 'run', 'sun', 'hat', 'red', 'big', 'cup', 'map', 'fox',
  'box', 'pen', 'net', 'zip', 'jam', 'log', 'fig', 'oak', 'elm', 'yak',
];

const WORD_POOL_MEDIUM = [
  'apple', 'brave', 'cloud', 'dream', 'flame', 'grape', 'horse', 'ivory',
  'jelly', 'knife', 'lemon', 'magic', 'novel', 'ocean', 'pearl', 'quest',
  'river', 'stone', 'tiger', 'unity', 'value', 'wheat', 'xenon', 'youth',
];

const WORD_POOL_LONG = [
  'balloon', 'cabinet', 'diamond', 'element', 'fantasy', 'giraffe',
  'harvest', 'imagine', 'journey', 'kitchen', 'lantern', 'mystery',
  'napkin', 'organism', 'phantom', 'quantum', 'rainbow', 'silence',
  'triumph', 'uranium', 'village', 'warrior', 'xylophone', 'zeppelin',
];

const PREFIX_LIST = ['un', 're', 'pre', 'dis', 'mis', 'over', 'out', 'sub'];

const SUFFIX_LIST = ['ing', 'ed', 'tion', 'ment', 'ness', 'able', 'ful', 'less', 'ous', 'ive'];

const DOUBLE_LETTER_WORDS = [
  'hello', 'coffee', 'button', 'little', 'letter', 'better', 'summer', 'winter',
  'bottle', 'cotton', 'muffin', 'dinner', 'balloon', 'spelling', 'lesson',
  'rabbit', 'pillow', 'pickle', 'bubble', 'puzzle', 'gallop', 'muddle',
];

const PALINDROME_WORDS = [
  'mom', 'dad', 'wow', 'pop', 'level', 'radar', 'kayak', 'rotor', 'civic',
  'madam', 'refer', 'racecar', 'deified', 'repaper', 'reviver', 'rotator',
  'tenet', 'sagas', 'stats', 'minim',
];

// ---------------------------------------------------------------------------
// Runtime types
// ---------------------------------------------------------------------------

export interface Target {
  id: string;
  kind: TargetKind;
  label: string;
  displayText: string;
  health: number;
  maxHealth: number;
  points: number;
  special: TargetSpecial;
  x: number;       // normalised 0-1
  y: number;       // normalised 0-1
  vx: number;      // velocity x
  vy: number;      // velocity y
  active: boolean;
  spawnedAt: number;
  scrambling: boolean;
  scrambleRate: number; // ms between scramble
  lastScramble: number;
}

export interface SniperStats {
  totalMissionsCompleted: number;
  totalMissionsFailed: number;
  totalEliminations: number;
  totalHeadshots: number;
  totalShotsFired: number;
  totalShotsHit: number;
  bestCombo: number;
  bestAccuracy: number;
  totalScore: number;
  bossEliminations: number;
  goldenEliminations: number;
  armoredEliminations: number;
  splittingEliminations: number;
  sGradeCount: number;
  currentRank: number;
  xp: number;
  dailyStreak: number;
  lastDailyDate: string;
  unlockedAchievements: string[];
  bestScorePerCategory: Record<string, number>;
  missionHistory: MissionHistoryEntry[];
}

interface MissionHistoryEntry {
  missionId: string;
  completedAt: number;
  score: number;
  grade: Grade;
  eliminations: number;
  headshots: number;
  accuracy: number;
  combo: number;
  timeRemaining: number;
}

export interface ActiveMission {
  missionId: string;
  startedAt: number;
  timeLimit: number;
  targets: Target[];
  eliminations: number;
  headshots: number;
  shotsFired: number;
  shotsHit: number;
  combo: number;
  maxCombo: number;
  score: number;
  objectiveProgress: number;
}

export interface WeaponInstance {
  id: WeaponId;
  equipped: boolean;
  unlocked: boolean;
  totalKills: number;
  lastUsedAt: number;
}

interface SniperState {
  stats: SniperStats;
  activeMission: ActiveMission | null;
  weapons: WeaponInstance[];
  equippedWeaponId: WeaponId;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let state: SniperState | null = null;

function wsEnsureInit(): SniperState {
  if (state) return state;

  state = {
    stats: {
      totalMissionsCompleted: 0,
      totalMissionsFailed: 0,
      totalEliminations: 0,
      totalHeadshots: 0,
      totalShotsFired: 0,
      totalShotsHit: 0,
      bestCombo: 0,
      bestAccuracy: 0,
      totalScore: 0,
      bossEliminations: 0,
      goldenEliminations: 0,
      armoredEliminations: 0,
      splittingEliminations: 0,
      sGradeCount: 0,
      currentRank: 1,
      xp: 0,
      dailyStreak: 0,
      lastDailyDate: '',
      unlockedAchievements: [],
      bestScorePerCategory: {},
      missionHistory: [],
    },
    activeMission: null,
    weapons: WEAPONS.map((w) => ({
      id: w.id,
      equipped: w.id === 'standard',
      unlocked: w.unlockRank <= 1,
      totalKills: 0,
      lastUsedAt: 0,
    })),
    equippedWeaponId: 'standard',
  };

  return state;
}

function wsRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function wsRandomId(): string {
  return 'tgt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function wsGetRandomWord(pool: string[], rng: () => number): string {
  return pool[Math.floor(rng() * pool.length)];
}

function wsGetDateString(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function wsSeedFromDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function wsClamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function wsGetRankDef(rank: number): RankDef {
  return RANKS[Math.min(rank - 1, RANKS.length - 1)];
}

function wsGetWeaponDef(id: WeaponId): WeaponDef {
  return WEAPONS.find((w) => w.id === id) ?? WEAPONS[0];
}

// ---------------------------------------------------------------------------
// Target generation helpers
// ---------------------------------------------------------------------------

function wsGenerateTarget(
  kind: TargetKind,
  label: string,
  displayText: string,
  health: number,
  points: number,
  special: TargetSpecial,
  rng: () => number,
): Target {
  const x = 0.1 + rng() * 0.8;
  const y = 0.1 + rng() * 0.8;
  const angle = rng() * Math.PI * 2;
  const speed = 0.0002 + rng() * 0.0008;
  return {
    id: wsRandomId(),
    kind,
    label,
    displayText,
    health,
    maxHealth: health,
    points,
    special,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    active: true,
    spawnedAt: Date.now(),
    scrambling: true,
    scrambleRate: 500 + rng() * 2000,
    lastScramble: Date.now(),
  };
}

function wsGenerateTargetsForMission(mission: MissionDef, rng: () => number): Target[] {
  const targets: Target[] = [];
  const count = mission.objectiveCount;
  const { category, difficulty } = mission;

  const hpMult = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const ptMult = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2.5;

  const rollSpecial = (rngVal: () => number): TargetSpecial => {
    const roll = rngVal();
    if (roll < 0.05) return 'golden';
    if (roll < 0.15) return 'armored';
    if (roll < 0.22) return 'splitting';
    return 'none';
  };

  if (category === 'boss-target') {
    // Generate minions + boss
    const minionCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 8 : 12;
    for (let i = 0; i < minionCount; i++) {
      const special = rollSpecial(rng);
      const hp = (special === 'armored' ? 3 : 1) * hpMult;
      targets.push(
        wsGenerateTarget(
          'word',
          'Minion',
          wsGetRandomWord(WORD_POOL_SHORT, rng),
          hp,
          Math.round(50 * ptMult),
          special,
          rng,
        ),
      );
    }
    // Boss target
    const bossHP = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20;
    targets.push(
      wsGenerateTarget(
        'boss',
        'Boss',
        difficulty === 'easy' ? 'MINI-BOSS' : difficulty === 'medium' ? 'BOSS' : 'LEGENDARY',
        bossHP * hpMult,
        Math.round(mission.basePoints * ptMult),
        'armored',
        rng,
      ),
    );
    return targets;
  }

  for (let i = 0; i < count; i++) {
    const special = rollSpecial(rng);
    let targetKind: TargetKind = 'letter';
    const hp = (special === 'armored' ? 3 : 1) * (targetKind === 'word' ? 2 : 1) * hpMult;
    let displayText = '';
    let label = '';

    switch (category) {
      case 'letter-hunt':
        targetKind = 'letter';
        displayText = String.fromCharCode(65 + Math.floor(rng() * 26));
        label = `Letter ${displayText}`;
        break;
      case 'vowel-strike': {
        targetKind = 'letter';
        const vowelArr = ['A', 'E', 'I', 'O', 'U'];
        displayText = vowelArr[Math.floor(rng() * vowelArr.length)];
        label = `Vowel ${displayText}`;
        break;
      }
      case 'consonant-clear': {
        targetKind = 'letter';
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ'.split('');
        displayText = consonants[Math.floor(rng() * consonants.length)];
        label = `Consonant ${displayText}`;
        break;
      }
      case 'word-elimination': {
        targetKind = 'word';
        const pool = difficulty === 'easy' ? WORD_POOL_SHORT
          : difficulty === 'medium' ? WORD_POOL_MEDIUM
          : WORD_POOL_LONG;
        displayText = wsGetRandomWord(pool, rng);
        label = displayText;
        break;
      }
      case 'prefix-patrol': {
        targetKind = 'word';
        const prefix = PREFIX_LIST[Math.floor(rng() * PREFIX_LIST.length)];
        const base = wsGetRandomWord(WORD_POOL_SHORT, rng);
        displayText = prefix + base;
        label = `${prefix}-word`;
        break;
      }
      case 'suffix-sweep': {
        targetKind = 'word';
        const suffix = SUFFIX_LIST[Math.floor(rng() * SUFFIX_LIST.length)];
        const base = wsGetRandomWord(WORD_POOL_SHORT, rng);
        displayText = base + suffix;
        label = `${suffix}-word`;
        break;
      }
      case 'anagram-assassin': {
        targetKind = 'word';
        displayText = wsGetRandomWord(WORD_POOL_MEDIUM, rng);
        label = displayText;
        break;
      }
      case 'double-agent': {
        targetKind = 'word';
        displayText = wsGetRandomWord(DOUBLE_LETTER_WORDS, rng);
        label = displayText;
        break;
      }
      case 'palindrome-purge': {
        targetKind = 'word';
        displayText = wsGetRandomWord(PALINDROME_WORDS, rng);
        label = displayText;
        break;
      }
      default: {
        targetKind = 'word';
        displayText = wsGetRandomWord(WORD_POOL_MEDIUM, rng);
        label = displayText;
      }
    }

    const basePoints = targetKind === 'word' ? 100 : targetKind === 'boss' ? 500 : 30;
    const pts = Math.round(
      (basePoints + displayText.length * 15) * ptMult * (special === 'golden' ? 2 : 1),
    );

    targets.push(
      wsGenerateTarget(targetKind, label, displayText, hp, pts, special, rng),
    );
  }

  return targets;
}

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function wsComputeGrade(score: number, basePoints: number, timeRemaining: number): Grade {
  const timeRatio = timeRemaining > 0 ? Math.min(timeRemaining / 120, 1) : 0;
  const efficiency = basePoints > 0 ? score / basePoints : 0;
  const composite = efficiency * 0.7 + timeRatio * 0.3;

  if (composite >= 3.0) return 'S';
  if (composite >= 2.2) return 'A';
  if (composite >= 1.5) return 'B';
  if (composite >= 1.0) return 'C';
  if (composite >= 0.5) return 'D';
  return 'F';
}

function wsComputeAccuracy(shotsFired: number, shotsHit: number): number {
  if (shotsFired === 0) return 0;
  return Math.round((shotsHit / shotsFired) * 1000) / 10; // one decimal
}

function wsComboMultiplier(combo: number): number {
  if (combo < 2) return 1;
  const mult = 1 + (combo - 1) * 0.2;
  return Math.min(mult, 5);
}

function wsAccuracyMultiplier(accuracy: number): number {
  if (accuracy >= 95) return 2;
  if (accuracy >= 90) return 1.5;
  return 1;
}

// ---------------------------------------------------------------------------
// State mutation helpers
// ---------------------------------------------------------------------------

function wsUpdateRank(): void {
  const s = wsEnsureInit();
  let rank = 1;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (s.stats.xp >= RANKS[i].xpThreshold) {
      rank = RANKS[i].rank;
      break;
    }
  }
  const prevRank = s.stats.currentRank;
  s.stats.currentRank = rank;

  // Unlock weapons at new rank
  for (const wDef of WEAPONS) {
    if (wDef.unlockRank <= rank) {
      const inst = s.weapons.find((w) => w.id === wDef.id);
      if (inst && !inst.unlocked) {
        inst.unlocked = true;
      }
    }
  }

  // Track rank-up for potential future use
  void prevRank;
}

function wsAddXP(amount: number): void {
  const s = wsEnsureInit();
  s.stats.xp += amount;
  wsUpdateRank();
}

// ---------------------------------------------------------------------------
// Public API — State
// ---------------------------------------------------------------------------

/** Return the full internal state (for debugging / inspection). */
export function wsGetState(): SniperState {
  return wsEnsureInit();
}

/** Reset all state to defaults. Returns the new state. */
export function wsResetState(): SniperState {
  state = null;
  return wsEnsureInit();
}

// ---------------------------------------------------------------------------
// Public API — Missions
// ---------------------------------------------------------------------------

/** Return all 30 mission definitions. */
export function wsGetMissions(): MissionDef[] {
  return [...MISSION_CATALOGUE];
}

/** Return a single mission definition by id. */
export function wsGetMission(id: string): MissionDef | undefined {
  return MISSION_CATALOGUE.find((m) => m.id === id);
}

/** Return the date-seeded daily mission. */
export function wsGetDailyMission(): MissionDef {
  const dateStr = wsGetDateString(Date.now());
  const seed = wsSeedFromDate(dateStr);
  const rng = wsRng(seed);
  const index = Math.floor(rng() * MISSION_CATALOGUE.length);
  return MISSION_CATALOGUE[index];
}

/** Start a mission by id. Returns the active mission object. */
export function wsStartMission(id: string): ActiveMission {
  const s = wsEnsureInit();
  const mission = MISSION_CATALOGUE.find((m) => m.id === id);
  if (!mission) {
    throw new Error(`[ws] Mission "${id}" not found.`);
  }

  const seed = Date.now();
  const rng = wsRng(seed);
  const targets = wsGenerateTargetsForMission(mission, rng);

  const active: ActiveMission = {
    missionId: id,
    startedAt: Date.now(),
    timeLimit: mission.timeLimit,
    targets,
    eliminations: 0,
    headshots: 0,
    shotsFired: 0,
    shotsHit: 0,
    combo: 0,
    maxCombo: 0,
    score: 0,
    objectiveProgress: 0,
  };

  s.activeMission = active;
  return active;
}

/** Complete the active mission, record stats, grant XP. Returns the final score and grade. */
export function wsCompleteMission(): { score: number; grade: Grade; xpGained: number } {
  const s = wsEnsureInit();
  const active = s.activeMission;
  if (!active) {
    throw new Error('[ws] No active mission to complete.');
  }

  const mission = MISSION_CATALOGUE.find((m) => m.id === active.missionId);
  if (!mission) {
    throw new Error(`[ws] Active mission id "${active.missionId}" not found in catalogue.`);
  }

  const elapsed = Date.now() - active.startedAt;
  const timeRemaining = Math.max(0, mission.timeLimit - Math.floor(elapsed / 1000));
  const accuracy = wsComputeAccuracy(active.shotsFired, active.shotsHit);

  // Time bonus: extra points proportional to time remaining
  const timeBonus = Math.round(timeRemaining * 10 * (mission.difficulty === 'hard' ? 2 : 1));

  // Rank bonus
  const rankDef = wsGetRankDef(s.stats.currentRank);
  const rankBonus = rankDef.bonusPointsPerMission;

  const finalScore = active.score + timeBonus + rankBonus;
  const grade = wsComputeGrade(finalScore, mission.basePoints, timeRemaining);

  // XP grant
  const baseXP = mission.basePoints;
  const gradeXP: Record<Grade, number> = { S: 500, A: 300, B: 200, C: 100, D: 50, F: 10 };
  const xpGained = baseXP + gradeXP[grade] + timeBonus;

  // Update stats
  s.stats.totalMissionsCompleted++;
  s.stats.totalEliminations += active.eliminations;
  s.stats.totalHeadshots += active.headshots;
  s.stats.totalShotsFired += active.shotsFired;
  s.stats.totalShotsHit += active.shotsHit;
  s.stats.totalScore += finalScore;

  if (active.maxCombo > s.stats.bestCombo) s.stats.bestCombo = active.maxCombo;
  if (accuracy > s.stats.bestAccuracy) s.stats.bestAccuracy = accuracy;
  if (grade === 'S') s.stats.sGradeCount++;

  // Best score per category
  const cat = mission.category;
  const prevBest = s.stats.bestScorePerCategory[cat] ?? 0;
  if (finalScore > prevBest) {
    s.stats.bestScorePerCategory[cat] = finalScore;
  }

  // Mission history
  s.stats.missionHistory.push({
    missionId: active.missionId,
    completedAt: Date.now(),
    score: finalScore,
    grade,
    eliminations: active.eliminations,
    headshots: active.headshots,
    accuracy,
    combo: active.maxCombo,
    timeRemaining,
  });

  // Keep history at most 100 entries
  if (s.stats.missionHistory.length > 100) {
    s.stats.missionHistory = s.stats.missionHistory.slice(-100);
  }

  // Grant XP and update rank
  wsAddXP(xpGained);

  s.activeMission = null;

  // Check achievements
  wsCheckAchievements();

  return { score: finalScore, grade, xpGained };
}

/** Fail the active mission. Records the failure and clears active state. */
export function wsFailMission(): void {
  const s = wsEnsureInit();
  if (!s.activeMission) return;

  s.stats.totalMissionsFailed++;
  s.stats.totalEliminations += s.activeMission.eliminations;
  s.stats.totalHeadshots += s.activeMission.headshots;
  s.stats.totalShotsFired += s.activeMission.shotsFired;
  s.stats.totalShotsHit += s.activeMission.shotsHit;

  // Small consolation XP
  wsAddXP(20);

  s.activeMission = null;
}

/** Check if a mission is currently active. */
export function wsIsMissionActive(): boolean {
  return wsEnsureInit().activeMission !== null;
}

/** Return the active mission or null. */
export function wsGetActiveMission(): ActiveMission | null {
  return wsEnsureInit().activeMission;
}

/** Get remaining time in seconds for the active mission. */
export function wsGetMissionTimer(): number {
  const s = wsEnsureInit();
  if (!s.activeMission) return 0;
  const elapsed = Date.now() - s.activeMission.startedAt;
  return Math.max(0, s.activeMission.timeLimit - Math.floor(elapsed / 1000));
}

// ---------------------------------------------------------------------------
// Public API — Targets
// ---------------------------------------------------------------------------

/** Return all targets for the active mission. */
export function wsGetTargets(): Target[] {
  const s = wsEnsureInit();
  if (!s.activeMission) return [];
  return s.activeMission.targets.filter((t) => t.active);
}

/** Return a specific target by id. */
export function wsGetTarget(id: string): Target | undefined {
  const s = wsEnsureInit();
  if (!s.activeMission) return undefined;
  return s.activeMission.targets.find((t) => t.id === id);
}

/**
 * Record a shot that eliminates (or damages) a target.
 * Returns the damage dealt and whether the target was eliminated.
 */
export function wsEliminateTarget(id: string): { damage: number; eliminated: boolean; points: number } {
  const s = wsEnsureInit();
  if (!s.activeMission) {
    throw new Error('[ws] No active mission.');
  }

  const target = s.activeMission.targets.find((t) => t.id === id);
  if (!target || !target.active) {
    return { damage: 0, eliminated: false, points: 0 };
  }

  const weaponDef = wsGetWeaponDef(s.equippedWeaponId);
  const damage = weaponDef.damage;
  target.health -= damage;

  s.activeMission.shotsFired++;
  s.activeMission.shotsHit++;

  let pointsEarned = 0;

  if (target.health <= 0) {
    target.active = false;
    s.activeMission.eliminations++;
    s.activeMission.objectiveProgress++;
    s.activeMission.combo++;
    if (s.activeMission.combo > s.activeMission.maxCombo) {
      s.activeMission.maxCombo = s.activeMission.combo;
    }

    // Combo multiplier
    const comboMult = wsComboMultiplier(s.activeMission.combo);
    // Weapon bonus multiplier
    const weaponMult = weaponDef ? weaponDef.bonusMultiplier : 1;
    // Golden special bonus
    const specialMult = target.special === 'golden' ? 3 : 1;
    pointsEarned = Math.round(target.points * comboMult * weaponMult * specialMult);

    s.activeMission.score += pointsEarned;

    // Update global stats counters
    s.stats.totalEliminations++;
    if (target.kind === 'boss') s.stats.bossEliminations++;
    if (target.special === 'golden') s.stats.goldenEliminations++;
    if (target.special === 'armored') s.stats.armoredEliminations++;
    if (target.special === 'splitting') s.stats.splittingEliminations++;

    // Update weapon kill count
    const weaponInst = s.weapons.find((w) => w.id === s.equippedWeaponId);
    if (weaponInst) {
      weaponInst.totalKills++;
      weaponInst.lastUsedAt = Date.now();
    }

    // Handle splitting targets: spawn two smaller targets
    if (target.special === 'splitting') {
      const halfPoints = Math.round(target.points * 0.4);
      const rng = wsRng(Date.now());
      for (let i = 0; i < 2; i++) {
        const split = wsGenerateTarget(
          target.kind,
          target.label + ' (split)',
          target.displayText.slice(0, Math.max(1, target.displayText.length - 1)),
          1,
          halfPoints,
          'none',
          rng,
        );
        split.x = wsClamp(target.x + (i === 0 ? -0.05 : 0.05), 0.05, 0.95);
        split.y = wsClamp(target.y + (i === 0 ? -0.05 : 0.05), 0.05, 0.95);
        s.activeMission.targets.push(split);
      }
    }
  } else {
    // Target damaged but not eliminated — partial points for armored targets
    if (target.special === 'armored') {
      pointsEarned = Math.round(target.points * 0.1);
      s.activeMission.score += pointsEarned;
    }
  }

  return { damage, eliminated: target.health <= 0, points: pointsEarned };
}

/** Record a headshot on a target. Returns points with 2x headshot bonus. */
export function wsHeadshot(id: string): { damage: number; eliminated: boolean; points: number } {
  const result = wsEliminateTarget(id);

  // Apply headshot 2x multiplier to points
  const headshotPoints = result.points;
  const bonusPoints = headshotPoints; // same amount again = 2x
  result.points += bonusPoints;

  const s = wsEnsureInit();
  if (s.activeMission) {
    s.activeMission.score += bonusPoints;
    s.activeMission.headshots++;
  }
  s.stats.totalHeadshots++;

  return result;
}

/** Record a miss (shot that did not hit any target). */
export function wsMiss(): void {
  const s = wsEnsureInit();
  if (!s.activeMission) return;

  s.activeMission.shotsFired++;
  s.activeMission.combo = 0; // reset combo on miss
}

/** Get current accuracy percentage for the active mission. */
export function wsGetAccuracy(): number {
  const s = wsEnsureInit();
  if (!s.activeMission || s.activeMission.shotsFired === 0) return 0;
  return wsComputeAccuracy(s.activeMission.shotsFired, s.activeMission.shotsHit);
}

// ---------------------------------------------------------------------------
// Public API — Combo
// ---------------------------------------------------------------------------

/** Get the current combo count. */
export function wsGetCombo(): number {
  const s = wsEnsureInit();
  return s.activeMission?.combo ?? 0;
}

/** Reset the current combo to 0. */
export function wsResetCombo(): void {
  const s = wsEnsureInit();
  if (s.activeMission) {
    s.activeMission.combo = 0;
  }
}

/** Get the current combo multiplier (max 5x). */
export function wsGetComboMultiplier(): number {
  const s = wsEnsureInit();
  if (!s.activeMission) return 1;
  return wsComboMultiplier(s.activeMission.combo);
}

// ---------------------------------------------------------------------------
// Public API — Weapons
// ---------------------------------------------------------------------------

/** Return all 6 weapon definitions with unlock status. */
export function wsGetWeapons(): (WeaponDef & { unlocked: boolean; equipped: boolean; totalKills: number })[] {
  const s = wsEnsureInit();
  return WEAPONS.map((def) => {
    const inst = s.weapons.find((w) => w.id === def.id);
    return {
      ...def,
      unlocked: inst?.unlocked ?? false,
      equipped: inst?.equipped ?? false,
      totalKills: inst?.totalKills ?? 0,
    };
  });
}

/** Return a single weapon definition by id. */
export function wsGetWeapon(id: WeaponId): (WeaponDef & { unlocked: boolean; equipped: boolean; totalKills: number }) | undefined {
  const all = wsGetWeapons();
  return all.find((w) => w.id === id);
}

/** Equip a weapon by id. Must be unlocked first. */
export function wsEquipWeapon(id: WeaponId): void {
  const s = wsEnsureInit();
  const inst = s.weapons.find((w) => w.id === id);
  if (!inst || !inst.unlocked) {
    throw new Error(`[ws] Weapon "${id}" is not unlocked.`);
  }
  // Unequip current
  for (const w of s.weapons) w.equipped = false;
  inst.equipped = true;
  s.equippedWeaponId = id;
}

/** Return the currently equipped weapon definition. */
export function wsGetEquippedWeapon(): WeaponDef & { unlocked: boolean; equipped: boolean; totalKills: number } {
  const all = wsGetWeapons();
  return all.find((w) => w.equipped) ?? all[0];
}

// ---------------------------------------------------------------------------
// Public API — Score / Grade / Timer
// ---------------------------------------------------------------------------

/** Get the current score for the active mission. */
export function wsGetScore(): number {
  const s = wsEnsureInit();
  return s.activeMission?.score ?? 0;
}

/** Compute and return the grade for the active mission based on current progress. */
export function wsGetGrade(): Grade | null {
  const s = wsEnsureInit();
  if (!s.activeMission) return null;
  const mission = MISSION_CATALOGUE.find((m) => m.id === s.activeMission!.missionId);
  if (!mission) return null;
  const timeRemaining = wsGetMissionTimer();
  return wsComputeGrade(s.activeMission.score, mission.basePoints, timeRemaining);
}

/** Get the remaining time for the active mission in seconds. Alias for wsGetMissionTimer. */
export function wsGetTimer(): number {
  return wsGetMissionTimer();
}

// ---------------------------------------------------------------------------
// Public API — Rank & XP
// ---------------------------------------------------------------------------

/** Get the current rank definition. */
export function wsGetRank(): RankDef {
  const s = wsEnsureInit();
  return wsGetRankDef(s.stats.currentRank);
}

/** Get rank progress: { current, next, progressPct }. */
export function wsGetRankProgress(): {
  current: RankDef;
  next: RankDef | null;
  progressPct: number;
  xpToNext: number;
} {
  const s = wsEnsureInit();
  const current = wsGetRankDef(s.stats.currentRank);
  const nextIdx = RANKS.findIndex((r) => r.rank === s.stats.currentRank) + 1;
  const next = nextIdx < RANKS.length ? RANKS[nextIdx] : null;

  if (!next) {
    return { current, next: null, progressPct: 100, xpToNext: 0 };
  }

  const xpInRank = s.stats.xp - current.xpThreshold;
  const xpNeeded = next.xpThreshold - current.xpThreshold;
  const progressPct = Math.min(100, Math.round((xpInRank / xpNeeded) * 1000) / 10);
  const xpToNext = next.xpThreshold - s.stats.xp;

  return { current, next, progressPct, xpToNext };
}

/** Get the total XP earned. */
export function wsGetXP(): number {
  return wsEnsureInit().stats.xp;
}

// ---------------------------------------------------------------------------
// Public API — Statistics
// ---------------------------------------------------------------------------

/** Return the full stats snapshot. */
export function wsGetStats(): SniperStats {
  return { ...wsEnsureInit().stats };
}

/** Return the best score for a given category. */
export function wsGetBestScore(categoryId: string): number {
  return wsEnsureInit().stats.bestScorePerCategory[categoryId] ?? 0;
}

/** Return total eliminations across all missions. */
export function wsGetTotalEliminations(): number {
  return wsEnsureInit().stats.totalEliminations;
}

/** Return total headshots across all missions. */
export function wsGetTotalHeadshots(): number {
  return wsEnsureInit().stats.totalHeadshots;
}

/** Return the last N mission history entries (max 100). */
export function wsGetMissionHistory(limit = 20): MissionHistoryEntry[] {
  const s = wsEnsureInit();
  return s.stats.missionHistory.slice(-limit).reverse();
}

// ---------------------------------------------------------------------------
// Public API — Achievements
// ---------------------------------------------------------------------------

/** Return all 12 achievements with unlocked status. */
export function wsGetAchievements(): (AchievementDef & { unlocked: boolean; unlockedAt: number | null })[] {
  const s = wsEnsureInit();
  return ACHIEVEMENTS.map((def) => ({
    ...def,
    unlocked: s.stats.unlockedAchievements.includes(def.id),
    unlockedAt: null, // Could be expanded
  }));
}

/**
 * Check all achievement conditions and unlock newly met ones.
 * Returns the list of newly unlocked achievement ids.
 */
export function wsCheckAchievements(): string[] {
  const s = wsEnsureInit();
  const newlyUnlocked: string[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (s.stats.unlockedAchievements.includes(ach.id)) continue;
    if (ach.checkFn(s.stats)) {
      s.stats.unlockedAchievements.push(ach.id);
      newlyUnlocked.push(ach.id);
    }
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Public API — Daily Mission / Streak
// ---------------------------------------------------------------------------

/** Get the current daily mission streak count. */
export function wsGetDailyStreak(): number {
  return wsEnsureInit().stats.dailyStreak;
}

/**
 * Mark the daily mission as completed for today.
 * Updates streak. Returns { streak, bonusPoints }.
 */
export function wsCompleteDailyMission(): { streak: number; bonusPoints: number } {
  const s = wsEnsureInit();
  const today = wsGetDateString(Date.now());
  const yesterday = wsGetDateString(Date.now() - 86400000);

  if (s.stats.lastDailyDate === today) {
    return { streak: s.stats.dailyStreak, bonusPoints: 0 };
  }

  // Check if streak continues (completed yesterday)
  if (s.stats.lastDailyDate === yesterday) {
    s.stats.dailyStreak++;
  } else {
    s.stats.dailyStreak = 1;
  }

  s.stats.lastDailyDate = today;

  const streakBonus = Math.min(s.stats.dailyStreak * 50, 500);
  wsAddXP(100 + streakBonus);

  wsCheckAchievements();

  return { streak: s.stats.dailyStreak, bonusPoints: streakBonus };
}

// ---------------------------------------------------------------------------
// Public API — Card / Overview helpers
// ---------------------------------------------------------------------------

/** Return a summary card for a mission definition. */
export function wsGetMissionCard(id: string): {
  mission: MissionDef | undefined;
  bestScore: number;
  completed: boolean;
  timesPlayed: number;
} {
  const s = wsEnsureInit();
  const mission = MISSION_CATALOGUE.find((m) => m.id === id);
  const history = s.stats.missionHistory.filter((h) => h.missionId === id);
  return {
    mission,
    bestScore: s.stats.bestScorePerCategory[mission?.category ?? ''] ?? 0,
    completed: history.length > 0,
    timesPlayed: history.length,
  };
}

/** Return a weapon card with stats. */
export function wsGetWeaponCard(id: WeaponId): {
  weapon: WeaponDef & { unlocked: boolean; equipped: boolean; totalKills: number } | undefined;
  rankRequired: number;
  canUnlock: boolean;
} {
  const all = wsGetWeapons();
  const weapon = all.find((w) => w.id === id);
  const rank = wsGetRank();
  return {
    weapon,
    rankRequired: weapon?.unlockRank ?? 0,
    canUnlock: (rank.rank >= (weapon?.unlockRank ?? 99)),
  };
}

/** Return a target card with info. */
export function wsGetTargetCard(id: string): {
  target: Target | undefined;
  healthPct: number;
  pointsPreview: number;
  isSpecial: boolean;
} {
  const target = wsGetTarget(id);
  if (!target) {
    return { target: undefined, healthPct: 0, pointsPreview: 0, isSpecial: false };
  }
  const s = wsEnsureInit();
  const weaponDef = wsGetWeaponDef(s.equippedWeaponId);
  const comboMult = s.activeMission ? wsGetComboMultiplier(s.activeMission.combo) : 1;
  const headshotMult = 2;
  const preview = Math.round(
    target.points * comboMult * weaponDef.bonusMultiplier * (target.special === 'golden' ? 3 : 1) * headshotMult,
  );
  return {
    target,
    healthPct: Math.round((target.health / target.maxHealth) * 1000) / 10,
    pointsPreview: preview,
    isSpecial: target.special !== 'none',
  };
}

/** Return a full sniper overview: rank, stats, achievements, weapons summary. */
export function wsGetSniperOverview(): {
  rank: RankDef;
  rankProgress: ReturnType<typeof wsGetRankProgress>;
  stats: SniperStats;
  weaponCount: number;
  unlockedWeaponCount: number;
  achievementCount: number;
  unlockedAchievementCount: number;
  totalMissions: number;
  dailyMission: MissionDef;
  dailyStreak: number;
} {
  const s = wsEnsureInit();
  const weapons = wsGetWeapons();
  const achievements = wsGetAchievements();
  return {
    rank: wsGetRank(),
    rankProgress: wsGetRankProgress(),
    stats: s.stats,
    weaponCount: WEAPONS.length,
    unlockedWeaponCount: weapons.filter((w) => w.unlocked).length,
    achievementCount: ACHIEVEMENTS.length,
    unlockedAchievementCount: achievements.filter((a) => a.unlocked).length,
    totalMissions: MISSION_CATALOGUE.length,
    dailyMission: wsGetDailyMission(),
    dailyStreak: s.stats.dailyStreak,
  };
}

/** Return a dashboard payload for the sniper HUD. */
export function wsGetSniperDashboard(): {
  activeMission: ActiveMission | null;
  timer: number;
  score: number;
  combo: number;
  comboMultiplier: number;
  accuracy: number;
  accuracyMultiplier: number;
  grade: Grade | null;
  equippedWeapon: ReturnType<typeof wsGetEquippedWeapon>;
  targetCount: number;
  objectiveProgress: number;
  objectiveTotal: number;
  rank: RankDef;
  xp: number;
  recentHistory: MissionHistoryEntry[];
} {
  const s = wsEnsureInit();
  const acc = wsGetAccuracy();
  const mission = s.activeMission;
  let objectiveTotal = 0;

  if (mission) {
    const def = MISSION_CATALOGUE.find((m) => m.id === mission.missionId);
    objectiveTotal = def?.objectiveCount ?? 0;
  }

  return {
    activeMission: mission,
    timer: wsGetMissionTimer(),
    score: mission?.score ?? 0,
    combo: mission?.combo ?? 0,
    comboMultiplier: wsGetComboMultiplier(),
    accuracy: acc,
    accuracyMultiplier: wsAccuracyMultiplier(acc),
    grade: wsGetGrade(),
    equippedWeapon: wsGetEquippedWeapon(),
    targetCount: wsGetTargets().length,
    objectiveProgress: mission?.objectiveProgress ?? 0,
    objectiveTotal,
    rank: wsGetRank(),
    xp: s.stats.xp,
    recentHistory: wsGetMissionHistory(5),
  };
}


