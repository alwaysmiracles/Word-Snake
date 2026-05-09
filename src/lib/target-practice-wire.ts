// =============================================================================
// Target Practice / Shooting Range Wire Module
// Word Snake Game — Comprehensive Shooting Range Training System
// =============================================================================
// SSR-safe: no window, document, localStorage, setInterval, addEventListener
// All function names use `tp` prefix. No `use` prefix.
// =============================================================================

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type TargetType =
  | "normal"
  | "golden"
  | "red"
  | "blue"
  | "rainbow"
  | "skull";

export type TargetSize = "large" | "medium" | "small" | "tiny";

export type MovementPattern = "static" | "horizontal" | "zigzag" | "circular" | "falling";

export type WeaponId =
  | "peashooter"
  | "scatter"
  | "sniper"
  | "laser"
  | "rocket"
  | "homing"
  | "chain_lightning"
  | "word_cannon";

export type ModeId =
  | "letter_blitz"
  | "word_hunt"
  | "rapid_fire"
  | "precision"
  | "boss_battle";

export type Grade = "S" | "A" | "B" | "C" | "D" | "F";

export interface Target {
  id: string;
  type: TargetType;
  size: TargetSize;
  letter: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pattern: MovementPattern;
  hp: number;
  maxHp: number;
  points: number;
  spawnTime: number;
  ttl: number; // time-to-live ms, 0 = infinite
  active: boolean;
}

export interface WeaponDef {
  id: WeaponId;
  name: string;
  description: string;
  unlockLevel: number;
  damage: number;
  fireRate: number; // ms between shots
  accuracy: number; // 0–1
  special: string;
  icon: string;
}

export interface ModeDef {
  id: ModeId;
  name: string;
  description: string;
  icon: string;
  duration: number; // ms, 0 = unlimited
  targetCount: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
}

export interface Session {
  id: string;
  modeId: ModeId;
  weaponId: WeaponId;
  startTime: number;
  endTime: number | null;
  score: number;
  shots: number;
  hits: number;
  misses: number;
  combo: number;
  maxCombo: number;
  targets: Target[];
  wordsCompleted: string[];
  active: boolean;
  reactionTimes: number[];
  frozenUntil: number;
  finalGrade: Grade | null;
}

export interface Stats {
  totalShots: number;
  totalHits: number;
  totalMisses: number;
  totalScore: number;
  totalTimeMs: number;
  bestCombo: number;
  bestScores: Record<ModeId, number>;
  weaponUsage: Record<WeaponId, number>;
  sessionsPlayed: number;
  sessionsWon: number;
  reactionTimes: number[];
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (s: Stats) => boolean;
  reward: string;
}

export interface DailyChallengeData {
  date: string; // YYYY-MM-DD
  modeId: ModeId;
  modifier: string;
  completed: boolean;
  scoreThreshold: number;
  rewardXP: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  modeId: ModeId;
  timestamp: number;
  grade: Grade;
}

export interface RangeState {
  level: number;
  xp: number;
  xpToNext: number;
  equippedWeapon: WeaponId;
  unlockedWeapons: WeaponId[];
  activeSession: Session | null;
  sessionHistory: Session[];
  stats: Stats;
  achievements: string[];
  dailyChallenge: DailyChallengeData | null;
  dailyStreak: number;
  leaderboard: LeaderboardEntry[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const TARGET_TYPE_DEFS: Record<TargetType, { multiplier: number; description: string }> = {
  normal: { multiplier: 1, description: "Standard target. No special effect." },
  golden: { multiplier: 2, description: "Golden target. Worth 2× points." },
  red: { multiplier: 1.5, description: "Red target. Timer — shoot before it expires for bonus." },
  blue: { multiplier: 1, description: "Blue target. Freezes session timer for 3 s on hit." },
  rainbow: { multiplier: 0, description: "Rainbow target. Awards a random bonus (50–200 pts)." },
  skull: { multiplier: -1, description: "Skull target. Avoid! Hitting it costs 50 pts and breaks combo." },
};

const SIZE_POINT_MAP: Record<TargetSize, number> = {
  large: 10,
  medium: 25,
  small: 50,
  tiny: 100,
};

const SIZE_HP_MAP: Record<TargetSize, number> = {
  large: 1,
  medium: 1,
  small: 2,
  tiny: 3,
};

const MODES: ModeDef[] = [
  {
    id: "letter_blitz",
    name: "Letter Blitz",
    description: "Shoot individual letters before they disappear. 30 targets, 30 s.",
    icon: "⚡",
    duration: 30000,
    targetCount: 30,
    difficulty: "easy",
  },
  {
    id: "word_hunt",
    name: "Word Hunt",
    description: "Spell words by shooting letters in order. 10 words per round.",
    icon: "🔍",
    duration: 0,
    targetCount: 50,
    difficulty: "medium",
  },
  {
    id: "rapid_fire",
    name: "Rapid Fire",
    description: "Shoot as many targets as possible in 60 seconds.",
    icon: "🔥",
    duration: 60000,
    targetCount: 999,
    difficulty: "hard",
  },
  {
    id: "precision",
    name: "Precision",
    description: "Hit small targets for bonus points. Accuracy-focused mode.",
    icon: "🎯",
    duration: 45000,
    targetCount: 20,
    difficulty: "expert",
  },
  {
    id: "boss_battle",
    name: "Boss Battle",
    description: "Defeat word monsters by spelling their weakness word.",
    icon: "👾",
    duration: 0,
    targetCount: 0,
    difficulty: "hard",
  },
];

const WEAPONS: WeaponDef[] = [
  { id: "peashooter", name: "Peashooter", description: "Reliable sidearm. Hits 1 target per shot.", unlockLevel: 1, damage: 1, fireRate: 300, accuracy: 0.85, special: "none", icon: "🔫" },
  { id: "scatter", name: "Scatter Shot", description: "Sprays pellets. Hits 3 adjacent targets.", unlockLevel: 5, damage: 1, fireRate: 500, accuracy: 0.7, special: "spread3", icon: "💥" },
  { id: "sniper", name: "Sniper", description: "High-powered single shot. Slow but devastating.", unlockLevel: 10, damage: 5, fireRate: 1200, accuracy: 0.98, special: "pierce1", icon: "🔭" },
  { id: "laser", name: "Laser Beam", description: "Continuous beam pierces through all targets in a line.", unlockLevel: 15, damage: 2, fireRate: 800, accuracy: 0.9, special: "pierce_all", icon: "⚡" },
  { id: "rocket", name: "Rocket Launcher", description: "Area damage. Destroys targets in a radius.", unlockLevel: 20, damage: 3, fireRate: 1500, accuracy: 0.75, special: "area", icon: "🚀" },
  { id: "homing", name: "Homing Missile", description: "Auto-aims the nearest target. Never misses.", unlockLevel: 25, damage: 2, fireRate: 600, accuracy: 1.0, special: "homing", icon: "🧭" },
  { id: "chain_lightning", name: "Chain Lightning", description: "Chains to 3 nearby targets after the first hit.", unlockLevel: 28, damage: 1, fireRate: 700, accuracy: 0.95, special: "chain3", icon: "🔗" },
  { id: "word_cannon", name: "Word Cannon", description: "Uses word power for mega damage against boss monsters.", unlockLevel: 30, damage: 10, fireRate: 2000, accuracy: 0.8, special: "mega", icon: "📖" },
];

const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_shot", name: "First Shot", description: "Fire your first shot in the shooting range.", icon: "🎯", condition: (s) => s.totalShots >= 1, reward: "50 XP" },
  { id: "sharpshooter", name: "Sharpshooter", description: "Achieve 90%+ accuracy in a session with 20+ shots.", icon: "🏆", condition: (s) => s.totalShots >= 20 && s.totalHits / s.totalShots >= 0.9, reward: "100 XP" },
  { id: "combo_king", name: "Combo King", description: "Reach a combo of 15 or higher.", icon: "👑", condition: (s) => s.bestCombo >= 15, reward: "150 XP" },
  { id: "centurion", name: "Centurion", description: "Score 10,000+ points in a single session.", icon: "💯", condition: (s) => Object.values(s.bestScores).some((v) => v >= 10000), reward: "200 XP" },
  { id: "speed_demon", name: "Speed Demon", description: "Complete a Rapid Fire session with 30+ hits.", icon: "⚡", condition: (s) => s.bestScores.rapid_fire >= 300, reward: "125 XP" },
  { id: "boss_slayer", name: "Boss Slayer", description: "Defeat 5 boss monsters.", icon: "👹", condition: (s) => s.sessionsWon >= 5, reward: "300 XP" },
  { id: "arsenal", name: "Full Arsenal", description: "Unlock all 8 weapons.", icon: "🎒", condition: () => false, reward: "500 XP" },
  { id: "perfectionist", name: "Perfectionist", description: "Get an S grade on any mode.", icon: "✨", condition: (s) => Object.values(s.bestScores).some((v) => v >= 5000), reward: "250 XP" },
  { id: "veteran", name: "Veteran", description: "Play 50 training sessions total.", icon: "🎖️", condition: (s) => s.sessionsPlayed >= 50, reward: "400 XP" },
  { id: "streak_master", name: "Streak Master", description: "Maintain a 7-day daily challenge streak.", icon: "🔥", condition: () => false, reward: "350 XP" },
  { id: "word_slinger", name: "Word Slinger", description: "Complete Word Hunt with all 10 words.", icon: "📖", condition: (s) => s.bestScores.word_hunt >= 1000, reward: "175 XP" },
  { id: "ice_cold", name: "Ice Cold", description: "Hit 5 blue targets in a single session.", icon: "❄️", condition: (s) => s.totalHits >= 50, reward: "100 XP" },
];

const GRADE_THRESHOLDS: [number, Grade][] = [
  [10000, "S"],
  [7000, "A"],
  [4000, "B"],
  [2000, "C"],
  [500, "D"],
  [0, "F"],
];

const XP_PER_LEVEL = [
  0, 100, 220, 380, 580, 820, 1100, 1450, 1860, 2350,
  2900, 3540, 4280, 5140, 6130, 7280, 8600, 10130, 11910, 13950,
  16400, 19200, 22450, 26200, 30500, 35500, 41350, 48200, 56300, 66000,
];

const MODIFIERS = [
  "Double Points",
  "Tiny Targets",
  "Fast Movement",
  "No Combos",
  "Reverse Controls",
  "Half Time",
  "Skull Swarm",
  "Golden Rush",
];

const BOSS_WORDS = [
  "PYTHON", "VIPER", "COBRA", "MAMBA", "SERPENT",
  "RATTLESNAKE", "ANACONDA", "BOA", "TAIPAN", "KRAIT",
  "COPPERHEAD", "SIDEWINDER", "KING", "QUEEN", "EMPEROR",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function todayString(): string {
  const d = new Date(Date.now());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateSeed(): number {
  const ds = todayString();
  let h = 0;
  for (let i = 0; i < ds.length; i++) {
    h = (h * 31 + ds.charCodeAt(i)) | 0;
  }
  return h;
}

function randomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function generateId(): string {
  return "tp_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function comboMultiplier(combo: number): number {
  if (combo <= 0) return 1;
  const raw = 1 + 0.1 * combo;
  return Math.min(raw, 5);
}

function calculateGrade(score: number): Grade {
  for (const [threshold, grade] of GRADE_THRESHOLDS) {
    if (score >= threshold) return grade;
  }
  return "F";
}

function xpForLevel(level: number): number {
  if (level < 1 || level >= XP_PER_LEVEL.length) return XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
  return XP_PER_LEVEL[level];
}

function speedBonusMultiplier(elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0) return 1;
  const ratio = elapsedMs / durationMs;
  if (ratio <= 0.25) return 2.0;
  if (ratio <= 0.5) return 1.5;
  if (ratio <= 0.75) return 1.2;
  return 1.0;
}

// ---------------------------------------------------------------------------
// State (SSR-safe singleton)
// ---------------------------------------------------------------------------

let state: RangeState | null = null;

function ensureInit(): RangeState {
  if (state) return state;
  state = {
    level: 1,
    xp: 0,
    xpToNext: XP_PER_LEVEL[1],
    equippedWeapon: "peashooter",
    unlockedWeapons: ["peashooter"],
    activeSession: null,
    sessionHistory: [],
    stats: {
      totalShots: 0,
      totalHits: 0,
      totalMisses: 0,
      totalScore: 0,
      totalTimeMs: 0,
      bestCombo: 0,
      bestScores: {
        letter_blitz: 0,
        word_hunt: 0,
        rapid_fire: 0,
        precision: 0,
        boss_battle: 0,
      },
      weaponUsage: {
        peashooter: 0,
        scatter: 0,
        sniper: 0,
        laser: 0,
        rocket: 0,
        homing: 0,
        chain_lightning: 0,
        word_cannon: 0,
      },
      sessionsPlayed: 0,
      sessionsWon: 0,
      reactionTimes: [],
    },
    achievements: [],
    dailyChallenge: null,
    dailyStreak: 0,
    leaderboard: generateDefaultLeaderboard(),
  };
  return state;
}

function generateDefaultLeaderboard(): LeaderboardEntry[] {
  const names = [
    "AceShooter", "WordNinja", "TargetMaster", "SnakeEyes",
    "BulletStorm", "QuickDraw", "PhantomAim", "BlitzKing",
    "PrecisionPro", "LetterHunter", "BossSlayer99", "ComboLord",
  ];
  return names.map((name, i) => ({
    rank: i + 1,
    name,
    score: Math.max(100, 15000 - i * 1100 + Math.floor(Math.random() * 500)),
    modeId: (MODES[i % MODES.length].id) as ModeId,
    timestamp: Date.now() - i * 60000,
    grade: calculateGrade(15000 - i * 1100),
  }));
}

// ---------------------------------------------------------------------------
// State Accessors
// ---------------------------------------------------------------------------

export function tpGetState(): RangeState {
  return ensureInit();
}

export function tpResetState(): void {
  state = null;
  ensureInit();
}

// ---------------------------------------------------------------------------
// Range Level & XP
// ---------------------------------------------------------------------------

export function tpGetRange(): { level: number; xp: number; xpToNext: number; progress: number } {
  const s = ensureInit();
  const progress = s.xpToNext > 0 ? s.xp / s.xpToNext : 0;
  return { level: s.level, xp: s.xp, xpToNext: s.xpToNext, progress };
}

export function tpGetRangeLevel(): number {
  return ensureInit().level;
}

export function tpAddRangeXP(amount: number): { levelUp: boolean; newLevel: number; totalXP: number } {
  const s = ensureInit();
  let levelUp = false;
  let newLevel = s.level;
  let xpRemaining = amount;

  while (xpRemaining > 0 && s.level < 30) {
    const needed = s.xpToNext - s.xp;
    if (xpRemaining >= needed) {
      xpRemaining -= needed;
      s.level += 1;
      s.xp = 0;
      s.xpToNext = xpForLevel(s.level);
      newLevel = s.level;
      levelUp = true;

      // Check weapon unlock
      for (const w of WEAPONS) {
        if (w.unlockLevel === s.level && !s.unlockedWeapons.includes(w.id)) {
          s.unlockedWeapons.push(w.id);
        }
      }
    } else {
      s.xp += xpRemaining;
      xpRemaining = 0;
    }
  }

  // Overflow XP at max level still counts
  if (s.level >= 30 && xpRemaining > 0) {
    s.xp += xpRemaining;
  }

  return { levelUp, newLevel, totalXP: s.xp };
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

export function tpGetModes(): ModeDef[] {
  return [...MODES];
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export function tpStartSession(modeId: ModeId): Session {
  const s = ensureInit();
  const modeDef = MODES.find((m) => m.id === modeId) ?? MODES[0];
  const session: Session = {
    id: generateId(),
    modeId,
    weaponId: s.equippedWeapon,
    startTime: Date.now(),
    endTime: null,
    score: 0,
    shots: 0,
    hits: 0,
    misses: 0,
    combo: 0,
    maxCombo: 0,
    targets: [],
    wordsCompleted: [],
    active: true,
    reactionTimes: [],
    frozenUntil: 0,
    finalGrade: null,
  };

  // Seed initial targets for the mode
  const count = Math.min(modeDef.targetCount, modeDef.targetCount <= 0 ? 5 : Math.min(modeDef.targetCount, 8));
  for (let i = 0; i < count; i++) {
    session.targets.push(createTarget(modeId));
  }

  s.activeSession = session;
  return session;
}

export function tpEndSession(): { score: number; grade: Grade; xpEarned: number } | null {
  const s = ensureInit();
  const session = s.activeSession;
  if (!session || !session.active) return null;

  session.active = false;
  session.endTime = Date.now();
  const elapsed = session.endTime - session.startTime;

  // Speed bonus
  const modeDef = MODES.find((m) => m.id === session.modeId);
  const speedMult = speedBonusMultiplier(elapsed, modeDef?.duration ?? 0);

  // Accuracy bonus: perfect round = 2×
  const accuracyBonus = session.shots > 0 && session.hits === session.shots ? 2.0 : 1.0;

  session.score = Math.floor(session.score * speedMult * accuracyBonus);
  session.finalGrade = calculateGrade(session.score);

  // Update persistent stats
  s.stats.totalShots += session.shots;
  s.stats.totalHits += session.hits;
  s.stats.totalMisses += session.misses;
  s.stats.totalScore += session.score;
  s.stats.totalTimeMs += elapsed;
  s.stats.sessionsPlayed += 1;
  s.stats.sessionsWon += session.finalGrade !== "F" ? 1 : 0;
  s.stats.weaponUsage[session.weaponId] = (s.stats.weaponUsage[session.weaponId] || 0) + session.shots;
  s.stats.reactionTimes.push(...session.reactionTimes);

  if (session.maxCombo > s.stats.bestCombo) {
    s.stats.bestCombo = session.maxCombo;
  }
  if (session.score > (s.stats.bestScores[session.modeId] || 0)) {
    s.stats.bestScores[session.modeId] = session.score;
  }

  // XP reward
  const xpEarned = Math.floor(session.score / 10) + 50;
  tpAddRangeXP(xpEarned);

  // Check achievements
  tpCheckAchievements();

  // Leaderboard insertion
  insertLeaderboardEntry(session.score, session.modeId, session.finalGrade);

  s.sessionHistory.unshift(session);
  if (s.sessionHistory.length > 100) s.sessionHistory.length = 100;

  s.activeSession = null;

  return { score: session.score, grade: session.finalGrade, xpEarned };
}

export function tpGetActiveSession(): Session | null {
  return ensureInit().activeSession;
}

export function tpIsSessionActive(): boolean {
  const s = ensureInit();
  return s.activeSession !== null && s.activeSession.active;
}

export function tpGetSessionTimer(): { elapsed: number; remaining: number | null; frozen: boolean } {
  const s = ensureInit();
  const session = s.activeSession;
  if (!session || !session.active) return { elapsed: 0, remaining: null, frozen: false };

  const now = Date.now();
  let effectiveNow = now;
  if (now < session.frozenUntil) {
    effectiveNow = session.frozenUntil;
  }

  const elapsed = effectiveNow - session.startTime;
  const modeDef = MODES.find((m) => m.id === session.modeId);
  const duration = modeDef?.duration ?? 0;
  const remaining = duration > 0 ? Math.max(0, duration - elapsed) : null;

  return { elapsed, remaining, frozen: now < session.frozenUntil };
}

// ---------------------------------------------------------------------------
// Shooting Mechanics
// ---------------------------------------------------------------------------

export function tpShoot(targetId: string): {
  hit: boolean;
  points: number;
  combo: number;
  newTargets: Target[];
  weaponSpecial: string;
} {
  const s = ensureInit();
  const session = s.activeSession;
  if (!session || !session.active) {
    return { hit: false, points: 0, combo: 0, newTargets: [], weaponSpecial: "none" };
  }

  const weapon = WEAPONS.find((w) => w.id === session.weaponId) ?? WEAPONS[0];
  const targetIdx = session.targets.findIndex((t) => t.id === targetId && t.active);
  const newTargets: Target[] = [];

  session.shots += 1;
  s.stats.weaponUsage[session.weaponId] = (s.stats.weaponUsage[session.weaponId] || 0) + 1;

  if (targetIdx === -1) {
    return tpHandleMiss(session, weapon, newTargets);
  }

  const target = session.targets[targetIdx];
  const lastShotTime = session.startTime + session.reactionTimes.reduce((a, b) => a + b, 0);
  const reactionTime = Date.now() - (lastShotTime || session.startTime);
  if (session.shots > 1) session.reactionTimes.push(reactionTime);

  // Skull penalty
  if (target.type === "skull") {
    session.score = Math.max(0, session.score - 50);
    session.combo = 0;
    target.active = false;
    return { hit: true, points: -50, combo: 0, newTargets, weaponSpecial: "skull" };
  }

  // Apply damage
  target.hp -= weapon.damage;
  let pointsEarned = 0;

  if (target.hp <= 0) {
    target.active = false;
    session.hits += 1;
    session.combo += 1;
    if (session.combo > session.maxCombo) session.maxCombo = session.combo;

    // Base points
    const basePoints = SIZE_POINT_MAP[target.size];
    const typeMult = TARGET_TYPE_DEFS[target.type].multiplier;
    const comboMult = comboMultiplier(session.combo);

    if (target.type === "rainbow") {
      pointsEarned = 50 + Math.floor(Math.random() * 150);
    } else {
      pointsEarned = Math.floor(basePoints * typeMult * comboMult);
    }

    session.score += pointsEarned;

    // Blue freeze effect
    if (target.type === "blue") {
      session.frozenUntil = Date.now() + 3000;
    }
  }

  // Weapon special effects
  const specials = applyWeaponSpecial(weapon, session, target, newTargets);
  pointsEarned += specials.bonusPoints;

  // Respawn logic — refill targets for timed modes
  const modeDef = MODES.find((m) => m.id === session.modeId);
  const activeCount = session.targets.filter((t) => t.active).length;
  if (modeDef && modeDef.targetCount > 0 && activeCount < Math.min(6, modeDef.targetCount - session.hits)) {
    newTargets.push(createTarget(session.modeId));
  }

  return {
    hit: true,
    points: pointsEarned,
    combo: session.combo,
    newTargets,
    weaponSpecial: weapon.special,
  };
}

function tpHandleMiss(
  session: Session,
  weapon: WeaponDef,
  newTargets: Target[],
): { hit: false; points: number; combo: number; newTargets: Target[]; weaponSpecial: string } {
  // Accuracy check — if weapon accuracy roll fails, it's a miss
  const roll = Math.random();
  if (roll > weapon.accuracy) {
    session.misses += 1;
    session.combo = 0;
    return { hit: false, points: 0, combo: 0, newTargets, weaponSpecial: weapon.special };
  }

  // "Missed" the specific target but weapon might still hit something
  session.misses += 1;
  session.combo = 0;
  return { hit: false, points: 0, combo: 0, newTargets, weaponSpecial: weapon.special };
}

function applyWeaponSpecial(
  weapon: WeaponDef,
  session: Session,
  primaryTarget: Target,
  newTargets: Target[],
): { bonusPoints: number } {
  let bonusPoints = 0;
  const nearby = session.targets.filter(
    (t) => t.active && t.id !== primaryTarget.id,
  );

  switch (weapon.special) {
    case "spread3": {
      const hits = nearby.slice(0, 3);
      for (const t of hits) {
        t.hp -= weapon.damage;
        if (t.hp <= 0 && t.type !== "skull") {
          t.active = false;
          bonusPoints += SIZE_POINT_MAP[t.size];
          session.hits += 1;
        }
      }
      break;
    }
    case "pierce1":
    case "pierce_all": {
      const limit = weapon.special === "pierce_all" ? nearby.length : 1;
      const pierced = nearby.slice(0, limit);
      for (const t of pierced) {
        t.hp -= weapon.damage;
        if (t.hp <= 0 && t.type !== "skull") {
          t.active = false;
          bonusPoints += Math.floor(SIZE_POINT_MAP[t.size] * 0.5);
          session.hits += 1;
        }
      }
      break;
    }
    case "area": {
      const inArea = nearby.filter(
        (t) => Math.abs(t.x - primaryTarget.x) < 80 && Math.abs(t.y - primaryTarget.y) < 80,
      );
      for (const t of inArea) {
        t.hp -= Math.floor(weapon.damage * 0.5);
        if (t.hp <= 0 && t.type !== "skull") {
          t.active = false;
          bonusPoints += SIZE_POINT_MAP[t.size];
          session.hits += 1;
        }
      }
      break;
    }
    case "homing": {
      // Homing always hits — bonus for nearest
      if (nearby.length > 0) {
        const nearest = nearby.reduce((a, b) =>
          Math.hypot(a.x - primaryTarget.x, a.y - primaryTarget.y) <
          Math.hypot(b.x - primaryTarget.x, b.y - primaryTarget.y)
            ? a
            : b,
        );
        nearest.hp -= weapon.damage;
        if (nearest.hp <= 0 && nearest.type !== "skull") {
          nearest.active = false;
          bonusPoints += SIZE_POINT_MAP[nearest.size];
          session.hits += 1;
        }
      }
      break;
    }
    case "chain3": {
      let chain = [...nearby];
      let lastX = primaryTarget.x;
      let lastY = primaryTarget.y;
      let chainCount = 0;
      while (chain.length > 0 && chainCount < 3) {
        chain.sort(
          (a, b) =>
            Math.hypot(a.x - lastX, a.y - lastY) -
            Math.hypot(b.x - lastX, b.y - lastY),
        );
        const next = chain.shift();
        if (!next) break;
        next.hp -= weapon.damage;
        lastX = next.x;
        lastY = next.y;
        chainCount += 1;
        if (next.hp <= 0 && next.type !== "skull") {
          next.active = false;
          bonusPoints += Math.floor(SIZE_POINT_MAP[next.size] * 0.7);
          session.hits += 1;
        }
      }
      break;
    }
    case "mega": {
      // Word Cannon: massive damage to primary + splash to all
      bonusPoints += 50;
      for (const t of nearby.slice(0, 5)) {
        t.hp -= 2;
        if (t.hp <= 0 && t.type !== "skull") {
          t.active = false;
          bonusPoints += Math.floor(SIZE_POINT_MAP[t.size] * 0.3);
          session.hits += 1;
        }
      }
      break;
    }
    default:
      break;
  }

  return { bonusPoints };
}

export function tpMiss(): void {
  const s = ensureInit();
  const session = s.activeSession;
  if (!session || !session.active) return;

  session.shots += 1;
  session.misses += 1;
  session.combo = 0;
}

export function tpGetCombo(): number {
  const session = ensureInit().activeSession;
  return session?.combo ?? 0;
}

export function tpResetCombo(): void {
  const session = ensureInit().activeSession;
  if (session) session.combo = 0;
}

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

function createTarget(modeId: ModeId): Target {
  const s = ensureInit();
  const level = s.level;
  const rng = Math.random();

  // Determine target type based on rarity
  let type: TargetType = "normal";
  const typeRoll = rng;
  if (typeRoll < 0.03) type = "skull";
  else if (typeRoll < 0.10) type = "rainbow";
  else if (typeRoll < 0.18) type = "blue";
  else if (typeRoll < 0.28) type = "red";
  else if (typeRoll < 0.40) type = "golden";

  // Size scales with difficulty
  let size: TargetSize = "large";
  const sizeRoll = Math.random();
  if (modeId === "precision") {
    if (sizeRoll < 0.4) size = "tiny";
    else if (sizeRoll < 0.7) size = "small";
    else size = "medium";
  } else {
    if (sizeRoll < 0.15 + level * 0.01) size = "tiny";
    else if (sizeRoll < 0.35 + level * 0.01) size = "small";
    else if (sizeRoll < 0.65) size = "medium";
  }

  // Movement pattern
  const patterns: MovementPattern[] = ["static", "horizontal", "zigzag", "circular", "falling"];
  const pattern = patterns[Math.floor(Math.random() * Math.min(patterns.length, 2 + Math.floor(level / 5)))];

  // Position
  const x = 50 + Math.random() * 700;
  const y = 50 + Math.random() * 400;
  const speed = 0.5 + Math.random() * (1 + level * 0.1);

  const hp = SIZE_HP_MAP[size];

  return {
    id: generateId(),
    type,
    size,
    letter: randomLetter(),
    x,
    y,
    vx: pattern === "horizontal" ? speed : pattern === "zigzag" ? speed * 0.7 : 0,
    vy: pattern === "falling" ? speed * 1.5 : pattern === "circular" ? speed * 0.5 : 0,
    pattern,
    hp,
    maxHp: hp,
    points: SIZE_POINT_MAP[size],
    spawnTime: Date.now(),
    ttl: type === "red" ? 3000 + Math.floor(Math.random() * 4000) : 0,
    active: true,
  };
}

export function tpGetTargets(): Target[] {
  const session = ensureInit().activeSession;
  if (!session) return [];
  return session.targets.filter((t) => t.active);
}

export function tpSpawnTarget(): Target | null {
  const session = ensureInit().activeSession;
  if (!session || !session.active) return null;

  const target = createTarget(session.modeId);
  session.targets.push(target);
  return target;
}

export function tpGetTargetTypes(): Record<TargetType, { multiplier: number; description: string }> {
  return { ...TARGET_TYPE_DEFS };
}

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------

export function tpGetWeapons(): WeaponDef[] {
  return [...WEAPONS];
}

export function tpGetWeapon(id: WeaponId): WeaponDef | null {
  return WEAPONS.find((w) => w.id === id) ?? null;
}

export function tpEquipWeapon(id: WeaponId): { success: boolean; reason?: string } {
  const s = ensureInit();
  if (!s.unlockedWeapons.includes(id)) {
    return { success: false, reason: `Weapon "${id}" not yet unlocked.` };
  }
  s.equippedWeapon = id;
  return { success: true };
}

export function tpGetEquippedWeapon(): WeaponDef {
  const s = ensureInit();
  return WEAPONS.find((w) => w.id === s.equippedWeapon) ?? WEAPONS[0];
}

// ---------------------------------------------------------------------------
// Scoring & Grading
// ---------------------------------------------------------------------------

export function tpGetScore(): number {
  const session = ensureInit().activeSession;
  return session?.score ?? 0;
}

export function tpGetAccuracy(): { session: number; overall: number } {
  const s = ensureInit();
  const session = s.activeSession;

  let sessionAcc = 0;
  if (session && session.shots > 0) {
    sessionAcc = session.hits / session.shots;
  }

  const overallAcc = s.stats.totalShots > 0 ? s.stats.totalHits / s.stats.totalShots : 0;

  return { session, overall: overallAcc };
}

export function tpGetGrade(): Grade {
  const session = ensureInit().activeSession;
  if (session && session.finalGrade) return session.finalGrade;
  return calculateGrade(session?.score ?? 0);
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export function tpGetStats(): Stats {
  return { ...ensureInit().stats };
}

export function tpGetBestScore(modeId: ModeId): number {
  return ensureInit().stats.bestScores[modeId] ?? 0;
}

export function tpGetTotalShots(): number {
  return ensureInit().stats.totalShots;
}

export function tpGetReactionTime(): { current: number; average: number; best: number } {
  const s = ensureInit();
  const session = s.activeSession;
  const times = session?.reactionTimes ?? s.stats.reactionTimes;

  if (times.length === 0) return { current: 0, average: 0, best: 0 };

  const current = times[times.length - 1] ?? 0;
  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const best = Math.min(...times);

  return { current, average: Math.round(average), best };
}

export function tpGetShotsPerMinute(): number {
  const s = ensureInit();
  if (s.stats.totalTimeMs === 0) return 0;
  const minutes = s.stats.totalTimeMs / 60000;
  return Math.round(s.stats.totalShots / minutes);
}

export function tpGetWeaponMastery(id: WeaponId): {
  shotsFired: number;
  totalShots: number;
  percentage: number;
  proficiency: "novice" | "apprentice" | "skilled" | "expert" | "master";
} {
  const s = ensureInit();
  const shots = s.stats.weaponUsage[id] ?? 0;
  const total = s.stats.totalShots;
  const percentage = total > 0 ? shots / total : 0;

  let proficiency: "novice" | "apprentice" | "skilled" | "expert" | "master" = "novice";
  if (percentage >= 0.4) proficiency = "master";
  else if (percentage >= 0.25) proficiency = "expert";
  else if (percentage >= 0.15) proficiency = "skilled";
  else if (percentage >= 0.05) proficiency = "apprentice";

  return { shotsFired: shots, totalShots: total, percentage, proficiency };
}

// ---------------------------------------------------------------------------
// Session History
// ---------------------------------------------------------------------------

export function tpGetSessionHistory(): Session[] {
  return [...ensureInit().sessionHistory];
}

export function tpGetRecentSessions(count: number): Session[] {
  return ensureInit().sessionHistory.slice(0, count);
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export function tpGetAchievements(): (AchievementDef & { unlocked: boolean })[] {
  const s = ensureInit();
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: s.achievements.includes(a.id),
  }));
}

export function tpCheckAchievements(): string[] {
  const s = ensureInit();
  const newlyUnlocked: string[] = [];

  // Update dynamic conditions
  const dynamicAchievements = ACHIEVEMENTS.map((a) => {
    if (a.id === "arsenal") {
      return { ...a, condition: () => s.unlockedWeapons.length >= 8 };
    }
    if (a.id === "streak_master") {
      return { ...a, condition: () => s.dailyStreak >= 7 };
    }
    return a;
  });

  for (const ach of dynamicAchievements) {
    if (!s.achievements.includes(ach.id) && ach.condition(s.stats)) {
      s.achievements.push(ach.id);
      newlyUnlocked.push(ach.id);
      tpAddRangeXP(100);
    }
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Daily Challenge
// ---------------------------------------------------------------------------

export function tpGetDailyChallenge(): DailyChallengeData {
  const s = ensureInit();
  const today = todayString();

  if (s.dailyChallenge && s.dailyChallenge.date === today) {
    return s.dailyChallenge;
  }

  const rng = seededRandom(dateSeed());
  const modeIdx = Math.floor(rng() * MODES.length);
  const modIdx = Math.floor(rng() * MODIFIERS.length);
  const scoreThreshold = 1000 + Math.floor(rng() * 4000);
  const rewardXP = 200 + Math.floor(rng() * 300);

  const challenge: DailyChallengeData = {
    date: today,
    modeId: MODES[modeIdx].id,
    modifier: MODIFIERS[modIdx],
    completed: false,
    scoreThreshold,
    rewardXP,
  };

  // Streak check: if last daily was yesterday, keep streak; else reset
  if (s.dailyChallenge) {
    const lastDate = new Date(s.dailyChallenge.date);
    const todayDate = new Date(today);
    const diff = (todayDate.getTime() - lastDate.getTime()) / 86400000;
    if (diff > 1.5) {
      s.dailyStreak = 0;
    } else if (diff >= 0.5 && s.dailyChallenge.completed) {
      s.dailyStreak += 1;
    }
  }

  s.dailyChallenge = challenge;
  return challenge;
}

export function tpCompleteDailyChallenge(score: number): { success: boolean; xpEarned: number; streak: number } {
  const s = ensureInit();
  const challenge = tpGetDailyChallenge();

  if (challenge.completed) {
    return { success: false, xpEarned: 0, streak: s.dailyStreak };
  }

  if (score < challenge.scoreThreshold) {
    return { success: false, xpEarned: 0, streak: s.dailyStreak };
  }

  challenge.completed = true;
  s.dailyStreak += 1;
  const streakBonus = Math.min(s.dailyStreak * 0.1, 0.5);
  const xpEarned = Math.floor(challenge.rewardXP * (1 + streakBonus));
  tpAddRangeXP(xpEarned);

  return { success: true, xpEarned, streak: s.dailyStreak };
}

export function tpGetDailyStreak(): number {
  return ensureInit().dailyStreak;
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

function insertLeaderboardEntry(score: number, modeId: ModeId, grade: Grade): void {
  const s = ensureInit();
  s.leaderboard.push({
    rank: 0,
    name: "You",
    score,
    modeId,
    timestamp: Date.now(),
    grade,
  });

  s.leaderboard.sort((a, b) => b.score - a.score);
  s.leaderboard = s.leaderboard.slice(0, 20);
  s.leaderboard.forEach((entry, i) => {
    entry.rank = i + 1;
  });
}

export function tpGetLeaderboard(): LeaderboardEntry[] {
  return [...ensureInit().leaderboard];
}

export function tpGetRank(): { rank: number; totalEntries: number; topPercentile: number } {
  const s = ensureInit();
  const yourEntry = s.leaderboard.find((e) => e.name === "You");
  const rank = yourEntry?.rank ?? s.leaderboard.length + 1;
  const total = s.leaderboard.length;
  const topPercentile = total > 0 ? ((total - rank) / total) * 100 : 0;
  return { rank, totalEntries: total, topPercentile: Math.round(topPercentile) };
}

// ---------------------------------------------------------------------------
// UI Helpers & Cards
// ---------------------------------------------------------------------------

export function tpGetTargetPracticeOverview(): {
  level: number;
  xp: number;
  xpToNext: number;
  weaponsUnlocked: number;
  weaponsTotal: number;
  totalSessions: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  dailyStreak: number;
  bestMode: ModeId | null;
  bestScore: number;
} {
  const s = ensureInit();
  let bestMode: ModeId | null = null;
  let bestScore = 0;

  for (const [mode, score] of Object.entries(s.stats.bestScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestMode = mode as ModeId;
    }
  }

  return {
    level: s.level,
    xp: s.xp,
    xpToNext: s.xpToNext,
    weaponsUnlocked: s.unlockedWeapons.length,
    weaponsTotal: WEAPONS.length,
    totalSessions: s.stats.sessionsPlayed,
    achievementsUnlocked: s.achievements.length,
    achievementsTotal: ACHIEVEMENTS.length,
    dailyStreak: s.dailyStreak,
    bestMode,
    bestScore,
  };
}

export function tpGetRangeDashboard(): {
  range: { level: number; progress: number };
  activeSession: boolean;
  sessionMode: ModeId | null;
  sessionScore: number;
  sessionCombo: number;
  recentScores: number[];
  accuracyTrend: number[];
  topModes: { mode: ModeId; bestScore: number }[];
  equippedWeapon: WeaponDef;
  dailyChallengeActive: boolean;
  dailyChallengeCompleted: boolean;
  dailyStreak: number;
  rank: number;
} {
  const s = ensureInit();
  const session = s.activeSession;

  const recentScores = s.sessionHistory.slice(0, 10).map((sess) => sess.score);
  const accuracyTrend = s.sessionHistory
    .slice(0, 10)
    .reverse()
    .map((sess) => (sess.shots > 0 ? Math.round((sess.hits / sess.shots) * 100) : 0));

  const topModes = Object.entries(s.stats.bestScores)
    .map(([mode, score]) => ({ mode: mode as ModeId, bestScore: score }))
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 3);

  const daily = tpGetDailyChallenge();
  const rank = tpGetRank();

  return {
    range: { level: s.level, progress: s.xpToNext > 0 ? s.xp / s.xpToNext : 1 },
    activeSession: session !== null && session.active,
    sessionMode: session?.modeId ?? null,
    sessionScore: session?.score ?? 0,
    sessionCombo: session?.combo ?? 0,
    recentScores,
    accuracyTrend,
    topModes,
    equippedWeapon: WEAPONS.find((w) => w.id === s.equippedWeapon) ?? WEAPONS[0],
    dailyChallengeActive: !daily.completed,
    dailyChallengeCompleted: daily.completed,
    dailyStreak: s.dailyStreak,
    rank: rank.rank,
  };
}

export function tpGetModeCard(id: ModeId): {
  mode: ModeDef;
  bestScore: number;
  sessionsPlayed: number;
  grade: Grade;
  locked: boolean;
  requiredLevel: number;
} | null {
  const modeDef = MODES.find((m) => m.id === id);
  if (!modeDef) return null;

  const s = ensureInit();
  const bestScore = s.stats.bestScores[id] ?? 0;
  const sessionsPlayed = s.sessionHistory.filter((sess) => sess.modeId === id).length;
  const grade = calculateGrade(bestScore);

  // Mode unlock thresholds
  const modeUnlockLevels: Record<ModeId, number> = {
    letter_blitz: 1,
    word_hunt: 3,
    rapid_fire: 6,
    precision: 10,
    boss_battle: 15,
  };
  const requiredLevel = modeUnlockLevels[id] ?? 1;
  const locked = s.level < requiredLevel;

  return { mode: modeDef, bestScore, sessionsPlayed, grade, locked, requiredLevel };
}

export function tpGetWeaponCard(id: WeaponId): {
  weapon: WeaponDef;
  unlocked: boolean;
  equipped: boolean;
  mastery: ReturnType<typeof tpGetWeaponMastery>;
  nextLevelXP: number;
} | null {
  const weaponDef = WEAPONS.find((w) => w.id === id);
  if (!weaponDef) return null;

  const s = ensureInit();
  const unlocked = s.unlockedWeapons.includes(id);
  const equipped = s.equippedWeapon === id;
  const mastery = tpGetWeaponMastery(id);
  const nextLevelXP = weaponDef.unlockLevel > s.level
    ? xpForLevel(weaponDef.unlockLevel) - s.xp
    : 0;

  return { weapon: weaponDef, unlocked, equipped, mastery, nextLevelXP };
}

export function tpGetTargetCard(id: string): {
  target: Target | null;
  typeInfo: { multiplier: number; description: string } | null;
  sizeInfo: { points: number; label: string };
} {
  const s = ensureInit();
  const target = s.activeSession?.targets.find((t) => t.id === id) ?? null;
  const typeInfo = target ? TARGET_TYPE_DEFS[target.type] : null;

  const sizeLabels: Record<TargetSize, string> = {
    large: "Easy",
    medium: "Medium",
    small: "Hard",
    tiny: "Expert",
  };

  const sizeInfo = {
    points: target ? SIZE_POINT_MAP[target.size] : 0,
    label: target ? sizeLabels[target.size] : "Unknown",
  };

  return { target, typeInfo, sizeInfo };
}

// ---------------------------------------------------------------------------
// Boss Battle Helpers
// ---------------------------------------------------------------------------

export function tpGetBossWord(): string {
  const s = ensureInit();
  const session = s.activeSession;
  if (!session || session.modeId !== "boss_battle") return BOSS_WORDS[0];

  const bossIndex = session.wordsCompleted.length % BOSS_WORDS.length;
  return BOSS_WORDS[bossIndex];
}

export function tpGetBossProgress(): {
  currentWord: string;
  lettersNeeded: string[];
  lettersHit: string[];
  progress: number;
  bossCount: number;
} {
  const s = ensureInit();
  const session = s.activeSession;
  if (!session || session.modeId !== "boss_battle") {
    return { currentWord: "", lettersNeeded: [], lettersHit: [], progress: 0, bossCount: 0 };
  }

  const currentWord = tpGetBossWord();
  const lettersNeeded = currentWord.split("");
  // Find which letters have been hit (targets destroyed matching word letters)
  const hitTargets = session.targets.filter((t) => !t.active && currentWord.includes(t.letter));
  const lettersHit = hitTargets.map((t) => t.letter);
  const uniqueHit = new Set(lettersHit);
  const progress = uniqueHit.size / lettersNeeded.length;

  return {
    currentWord,
    lettersNeeded,
    lettersHit: [...uniqueHit],
    progress: Math.min(progress, 1),
    bossCount: session.wordsCompleted.length,
  };
}

export function tpDefeatBoss(): { word: string; reward: number; xp: number } | null {
  const s = ensureInit();
  const session = s.activeSession;
  if (!session || session.modeId !== "boss_battle") return null;

  const progress = tpGetBossProgress();
  if (progress.progress < 1) return null;

  const word = progress.currentWord;
  session.wordsCompleted.push(word);
  const reward = word.length * 200;
  session.score += reward;

  // Spawn next boss word targets
  const nextWord = BOSS_WORDS[session.wordsCompleted.length % BOSS_WORDS.length];
  for (const letter of nextWord.split("")) {
    const target: Target = {
      id: generateId(),
      type: "red",
      size: "medium",
      letter,
      x: 100 + Math.random() * 600,
      y: 100 + Math.random() * 300,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      pattern: "circular",
      hp: 2,
      maxHp: 2,
      points: 50,
      spawnTime: Date.now(),
      ttl: 8000,
      active: true,
    };
    session.targets.push(target);
  }

  const xp = Math.floor(reward / 5);
  return { word, reward, xp };
}

// ---------------------------------------------------------------------------
// Target Update / Tick (for movement)
// ---------------------------------------------------------------------------

export function tpUpdateTargets(): Target[] {
  const s = ensureInit();
  const session = s.activeSession;
  if (!session || !session.active) return [];

  const now = Date.now();
  const updated: Target[] = [];

  for (const target of session.targets) {
    if (!target.active) continue;

    // TTL check
    if (target.ttl > 0 && now - target.spawnTime > target.ttl) {
      target.active = false;
      continue;
    }

    // Movement
    switch (target.pattern) {
      case "horizontal":
        target.x += target.vx;
        if (target.x < 20 || target.x > 780) target.vx *= -1;
        target.x = clamp(target.x, 20, 780);
        break;
      case "zigzag":
        target.x += target.vx;
        target.y += Math.sin(now * 0.003 + target.x * 0.01) * 1.5;
        if (target.x < 20 || target.x > 780) target.vx *= -1;
        target.x = clamp(target.x, 20, 780);
        target.y = clamp(target.y, 20, 500);
        break;
      case "circular": {
        const cx = 400;
        const cy = 250;
        const angle = now * 0.002 + target.spawnTime * 0.001;
        const radius = 150 + Math.sin(target.spawnTime) * 50;
        target.x = cx + Math.cos(angle) * radius;
        target.y = cy + Math.sin(angle) * radius;
        break;
      }
      case "falling":
        target.y += target.vy;
        if (target.y > 520) {
          target.y = 0;
          target.x = 50 + Math.random() * 700;
        }
        break;
      default:
        break;
    }

    updated.push(target);
  }

  return updated;
}
