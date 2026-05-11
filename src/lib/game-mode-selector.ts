export type GameMode =
  | 'classic' | 'timed' | 'practice' | 'zen'
  | 'challenge' | 'pvp' | 'blitz' | 'marathon';

export interface GameModeConfig {
  id: GameMode;
  name: string;
  description: string;
  emoji: string;
  color: string;
  borderColor: string;
  timeLimit: number | null;
  scoreMultiplier: number;
  lives: number | null;
  obstacles: boolean;
  powerUps: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  isLocked: boolean;
  unlockCondition: string;
  features: string[];
  playCount: number;
  bestScore: number;
  totalTimePlayed: number;
  lastPlayedAt: number | null;
}

const STORAGE_PREFIX = 'ws_modes_';
const S = (id: GameMode, name: string, desc: string, emoji: string, color: string,
  border: string, timeLimit: number | null, scoreMultiplier: number,
  lives: number | null, obstacles: boolean, powerUps: boolean,
  difficulty: GameModeConfig['difficulty'], isLocked: boolean,
  unlockCondition: string, features: string[]): GameModeConfig => ({
  id, name, description: desc, emoji, color, borderColor: border,
  timeLimit, scoreMultiplier, lives, obstacles, powerUps,
  difficulty, isLocked, unlockCondition, features,
  playCount: 0, bestScore: 0, totalTimePlayed: 0, lastPlayedAt: null,
});

const BASE_MODES: GameModeConfig[] = [
  S('classic', 'Classic', 'Standard gameplay with no time pressure or special restrictions.',
    '🐍', '#22c55e', '#16a34a', null, 1, null, false, true, 'medium', false,
    'Available by default', ['word-collection', 'power-ups', 'leveling']),
  S('timed', 'Timed', 'Race the clock — 60 seconds to score as many points as you can.',
    '⏱️', '#f59e0b', '#d97706', 60000, 1.5, null, false, true, 'medium', false,
    'Available by default', ['timed', 'power-ups', 'high-score']),
  S('practice', 'Practice', 'No game over, unlimited lives — perfect for learning.',
    '🎓', '#6366f1', '#4f46e5', null, 0, null, false, true, 'easy', false,
    'Available by default', ['no-game-over', 'learning', 'unlimited-lives']),
  S('zen', 'Zen', 'A calming experience with no obstacles, power-ups, or timer.',
    '🧘', '#a78bfa', '#8b5cf6', null, 0.8, null, false, false, 'easy', false,
    'Available by default', ['no-obstacles', 'no-power-ups', 'relaxing']),
  S('challenge', 'Challenge', 'Hard difficulty with extra obstacles. Only for the brave.',
    '🎯', '#ef4444', '#dc2626', null, 2, 3, true, true, 'hard', true,
    'Play 5 Classic games', ['obstacles', 'limited-lives', 'power-ups', 'bonus-score']),
  S('pvp', 'PvP', 'Head-to-head two-player mode with separate score tracking.',
    '👥', '#ec4899', '#db2777', null, 1, null, true, true, 'adaptive', true,
    'Play 3 Timed games', ['multiplayer', 'obstacles', 'power-ups', 'competitive']),
  S('blitz', 'Blitz', '30 seconds of extreme speed — every millisecond counts.',
    '⚡', '#eab308', '#ca8a04', 30000, 2, null, false, true, 'hard', true,
    'Score 500+ in a single Timed game', ['timed', 'fast-paced', 'power-ups', 'bonus-score']),
  S('marathon', 'Marathon', '5-minute endurance test with persistent obstacles.',
    '🏃', '#14b8a6', '#0d9488', 300000, 1.2, null, true, true, 'adaptive', true,
    'Play 10 total games', ['timed', 'obstacles', 'power-ups', 'endurance']),
];

let modes: GameModeConfig[] = BASE_MODES.map((m) => ({ ...m }));

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function loadModeStats(): void {
  if (!isBrowser()) return;
  try {
    modes = BASE_MODES.map((mode) => {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${mode.id}`);
      if (!raw) return { ...mode };
      return { ...mode, ...JSON.parse(raw) as Partial<GameModeConfig> };
    });
  } catch { /* corrupt data — keep defaults */ }
}

export function saveModeStats(): void {
  if (!isBrowser()) return;
  try {
    for (const mode of modes) {
      localStorage.setItem(`${STORAGE_PREFIX}${mode.id}`, JSON.stringify({
        playCount: mode.playCount, bestScore: mode.bestScore,
        totalTimePlayed: mode.totalTimePlayed, lastPlayedAt: mode.lastPlayedAt,
        isLocked: mode.isLocked,
      }));
    }
  } catch { /* storage unavailable */ }
}

export function GAME_MODES(): GameModeConfig[] {
  return modes;
}

export function getMode(id: GameMode): GameModeConfig | undefined {
  return modes.find((m) => m.id === id);
}

export function getAllModes(): GameModeConfig[] {
  return [...modes];
}

export function getUnlockedModes(): GameModeConfig[] {
  return modes.filter((m) => !m.isLocked);
}

export function getLockedModes(): GameModeConfig[] {
  return modes.filter((m) => m.isLocked);
}

export function unlockMode(id: GameMode): boolean {
  const mode = modes.find((m) => m.id === id);
  if (!mode || !mode.isLocked) return false;
  mode.isLocked = false;
  saveModeStats();
  return true;
}

export function setBestScore(id: GameMode, score: number): void {
  const mode = modes.find((m) => m.id === id);
  if (!mode || score <= mode.bestScore) return;
  mode.bestScore = score;
  saveModeStats();
}

export function recordPlay(id: GameMode, score: number, duration: number): void {
  const mode = modes.find((m) => m.id === id);
  if (!mode) return;
  mode.playCount += 1;
  mode.totalTimePlayed += duration;
  mode.lastPlayedAt = Date.now();
  if (score > mode.bestScore) mode.bestScore = score;
  saveModeStats();
}

export function getModeStats(id: GameMode): {
  playCount: number; bestScore: number; totalTimePlayed: number; lastPlayedAt: number | null;
} | null {
  const mode = modes.find((m) => m.id === id);
  if (!mode) return null;
  const { playCount, bestScore, totalTimePlayed, lastPlayedAt } = mode;
  return { playCount, bestScore, totalTimePlayed, lastPlayedAt };
}

export function getModeComparison(): Array<{
  id: GameMode; name: string; emoji: string; playCount: number; bestScore: number;
}> {
  return modes.map(({ id, name, emoji, playCount, bestScore }) => ({
    id, name, emoji, playCount, bestScore,
  }));
}

export function getModesByFeature(feature: string): GameModeConfig[] {
  const lc = feature.toLowerCase();
  return modes.filter((m) =>
    m.features.some((f) => f.includes(lc)) || m.id.includes(lc),
  );
}

export function getRecommendedMode(totalGamesPlayed: number): GameMode {
  if (totalGamesPlayed === 0) return 'classic';
  const find = (id: GameMode) => modes.find((m) => m.id === id)!;
  const classic = find('classic');
  if (classic.playCount >= 5 && classic.bestScore >= 300) {
    const ch = find('challenge');
    if (ch.isLocked) return 'challenge';
  }
  if (classic.playCount < 3) return 'classic';
  const timed = find('timed');
  if (timed.playCount === 0) return 'timed';
  if (find('practice').playCount === 0) return 'practice';
  if (find('zen').playCount === 0) return 'zen';
  const blitz = find('blitz');
  if (!blitz.isLocked && blitz.playCount < 2) return 'blitz';
  const marathon = find('marathon');
  if (!marathon.isLocked && marathon.playCount === 0) return 'marathon';
  return 'classic';
}

export function getTimeDisplay(ms: number | null): string {
  if (ms === null) return '∞';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getScoreDisplay(multiplier: number): string {
  return `x${multiplier.toFixed(1)}`;
}

export function getDifficultyColor(d: GameModeConfig['difficulty']): string {
  const map: Record<GameModeConfig['difficulty'], string> = {
    easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444', adaptive: '#a78bfa',
  };
  return map[d] ?? '#9ca3af';
}

const MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000];

export function getModeProgress(id: GameMode): number {
  const mode = modes.find((m) => m.id === id);
  if (!mode || mode.playCount === 0) return 0;
  const passed = MILESTONES.filter((t) => mode.bestScore >= t).length;
  return Math.round((passed / MILESTONES.length) * 100);
}

export function resetModeStats(id?: GameMode): void {
  if (!isBrowser()) return;
  try {
    if (id) {
      const mode = modes.find((m) => m.id === id);
      if (!mode) return;
      mode.playCount = 0;
      mode.bestScore = 0;
      mode.totalTimePlayed = 0;
      mode.lastPlayedAt = null;
      const base = BASE_MODES.find((b) => b.id === id);
      if (base) mode.isLocked = base.isLocked;
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
    } else {
      modes = BASE_MODES.map((m) => ({ ...m }));
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    }
  } catch { /* storage error */ }
}

if (isBrowser()) loadModeStats();
