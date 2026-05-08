// ─── Game Mode Engine: wires mode configs into the live game loop ─────────
// Pure logic module — no 'use client' needed.

import {
  type GameMode, type GameModeConfig,
  getMode, getTimeDisplay, getScoreDisplay,
  recordPlay,
} from './game-mode-selector';

// ─── Interfaces ───────────────────────────────────────────────────────────

/** Minimal shape of the mutable game-state the engine reads/writes. */
export interface MutableGameState {
  gameOver: boolean;
  gameStarted: boolean;
  paused: boolean;
  score: number;
  elapsedTime: number;
  isSpeedRun: boolean;
  startTime: number;
  snake: Array<{ x: number; y: number }>;
  obstacles: unknown[];
  powerUp: unknown | null;
  activePowerUps: unknown[];
  wordsEaten: number;
  [key: string]: unknown;
}

/** Running engine instance created by `createGameModeEngine`. */
export interface GameModeEngine {
  activeMode: GameMode;
  modeConfig: GameModeConfig;
  timeRemaining: number;       // ms left (for timed modes)
  livesRemaining: number;
  isTimedMode: boolean;
  isPracticeMode: boolean;
  isZenMode: boolean;
  scoreMultiplier: number;
  modeStartTime: number;
}

/** Data returned for the HUD overlay. */
export interface ModeDisplayInfo {
  modeName: string;
  modeEmoji: string;
  timeDisplay: string;
  livesDisplay: string;
  multiplierDisplay: string;
}

/** Persisted per-mode stats. */
export interface ModeStatsRecord {
  playCount: number;
  bestScore: number;
  totalTimePlayed: number;
  lastPlayedAt: number | null;
}

/** Summary returned by `getModeSummary`. */
export interface ModeSummary {
  modeId: GameMode;
  modeName: string;
  modeEmoji: string;
  stats: ModeStatsRecord;
  isLocked: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────

const ACTIVE_MODE_KEY = 'ws_active_game_mode';
const MODE_STATS_PREFIX = 'ws_mode_stats_';

const DEFAULT_MODE: GameMode = 'classic';

// ─── Internal helpers ─────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function lsGet(key: string): string | null {
  if (!isBrowser()) return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function lsSet(key: string, value: string): void {
  if (!isBrowser()) return;
  try { localStorage.setItem(key, value); } catch { /* storage full */ }
}

function resolveMode(id: GameMode | undefined): GameMode {
  if (id && getMode(id)) return id;
  return DEFAULT_MODE;
}

function loadPersistedMode(): GameMode {
  const raw = lsGet(ACTIVE_MODE_KEY);
  if (!raw) return DEFAULT_MODE;
  return resolveMode(raw as GameMode);
}

function loadModeStatsRecord(modeId: GameMode): ModeStatsRecord {
  const raw = lsGet(`${MODE_STATS_PREFIX}${modeId}`);
  if (!raw) return { playCount: 0, bestScore: 0, totalTimePlayed: 0, lastPlayedAt: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      playCount: typeof parsed.playCount === 'number' ? parsed.playCount : 0,
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      totalTimePlayed: typeof parsed.totalTimePlayed === 'number' ? parsed.totalTimePlayed : 0,
      lastPlayedAt: typeof parsed.lastPlayedAt === 'number' ? parsed.lastPlayedAt : null,
    };
  } catch {
    return { playCount: 0, bestScore: 0, totalTimePlayed: 0, lastPlayedAt: null };
  }
}

function saveModeStatsRecord(modeId: GameMode, stats: ModeStatsRecord): void {
  lsSet(`${MODE_STATS_PREFIX}${modeId}`, JSON.stringify(stats));
}

// ─── Factory ──────────────────────────────────────────────────────────────

/**
 * Create a `GameModeEngine` for the given mode (or the last-persisted mode).
 * Pure creation — no side-effects beyond reading localStorage for the active id.
 */
export function createGameModeEngine(modeId?: string): GameModeEngine {
  const resolved = modeId ? resolveMode(modeId as GameMode) : loadPersistedMode();
  const config = getMode(resolved)!;
  const isTimed = config.timeLimit !== null && config.timeLimit > 0;

  return {
    activeMode: resolved,
    modeConfig: config,
    timeRemaining: config.timeLimit ?? Infinity,
    livesRemaining: config.lives ?? Infinity,
    isTimedMode: isTimed,
    isPracticeMode: resolved === 'practice',
    isZenMode: resolved === 'zen',
    scoreMultiplier: config.scoreMultiplier,
    modeStartTime: Date.now(),
  };
}

// ─── Core rule applicators ────────────────────────────────────────────────

/**
 * Apply mode-specific modifiers to the mutable game state at the start of
 * each game loop tick.  Mutates `engine.timeRemaining` and `engine.livesRemaining`
 * in-place when relevant.
 */
export function applyModeRules(
  engine: GameModeEngine,
  gameState: MutableGameState,
): void {
  const { activeMode } = engine;

  switch (activeMode) {
    // ── Classic: baseline, no special rules ──
    case 'classic':
      break;

    // ── Timed: 60 s countdown, auto game-over at zero ──
    case 'timed':
      updateModeTimer(engine, gameState.elapsedTime, gameState);
      break;

    // ── Practice: suppress game-over & score tracking ──
    case 'practice':
      gameState.score = 0;  // practice never accumulates score
      break;

    // ── Zen: no obstacles, relaxed pace, double word spawn ──
    case 'zen':
      gameState.obstacles = [];
      break;

    // ── Challenge: 1.5× obstacles, 2× score, harder words ──
    case 'challenge':
      engine.scoreMultiplier = 2;
      break;

    // ── PvP: delegate to pvp-mode module — no extra wiring here ──
    case 'pvp':
      break;

    // ── Blitz: 30 s, 3× score, very fast pace ──
    case 'blitz':
      updateModeTimer(engine, gameState.elapsedTime, gameState);
      engine.scoreMultiplier = 3;
      break;

    // ── Marathon: 5 min, increasing difficulty over time ──
    case 'marathon':
      updateModeTimer(engine, gameState.elapsedTime, gameState);
      break;
  }
}

// ─── Timer ────────────────────────────────────────────────────────────────

/**
 * Decrement the countdown timer for timed modes.  When the timer hits zero
 * the game state is marked as game-over and paused.
 */
export function updateModeTimer(
  engine: GameModeEngine,
  elapsedMs: number,
  gameState: MutableGameState,
): void {
  if (!engine.isTimedMode || engine.modeConfig.timeLimit === null) return;

  const elapsed = elapsedMs - (engine.modeStartTime - (gameState.startTime || Date.now()));
  engine.timeRemaining = Math.max(0, engine.modeConfig.timeLimit - elapsedMs);

  if (engine.timeRemaining <= 0) {
    engine.timeRemaining = 0;
    gameState.gameOver = true;
    gameState.paused = true;
  }
}

// ─── Collision handling ───────────────────────────────────────────────────

/**
 * Mode-aware collision resolution.
 * - Practice: reset snake to center, clear power-ups, NO game over.
 * - Zen: collision is entirely ignored.
 * - Others: standard game-over.
 *
 * Returns `true` if the caller should still trigger a game-over
 * (i.e. the mode did NOT absorb the collision).
 */
export function handleCollisionForMode(
  engine: GameModeEngine,
  gameState: MutableGameState,
): boolean {
  // Zen: collision is a no-op
  if (engine.isZenMode) return false;

  // Practice: absorb the collision, reset position
  if (engine.isPracticeMode) {
    const cx = Math.floor(20 / 2);   // approximate grid center
    const cy = Math.floor(20 / 2);
    gameState.snake = [{ x: cx, y: cy }];
    gameState.powerUp = null;
    gameState.activePowerUps = [];
    gameState.score = 0;
    return false;
  }

  // Challenge: consume a life if available
  if (engine.activeMode === 'challenge' && engine.livesRemaining > 0) {
    engine.livesRemaining -= 1;
    if (engine.livesRemaining > 0) {
      const cx = Math.floor(20 / 2);
      const cy = Math.floor(20 / 2);
      gameState.snake = [{ x: cx, y: cy }];
      return false;
    }
  }

  // Default: allow game over
  return true;
}

// ─── Modifier getters ─────────────────────────────────────────────────────

/** Returns the score multiplier for the current mode. */
export function getScoreMultiplier(engine: GameModeEngine): number {
  return engine.scoreMultiplier;
}

/**
 * Returns a frame-interval modifier.
 * Values > 1 slow the game down; values < 1 speed it up.
 */
export function getFrameIntervalModifier(engine: GameModeEngine): number {
  switch (engine.activeMode) {
    case 'practice': return 1.5;
    case 'zen':      return 1.5;
    case 'blitz':    return 0.7;
    case 'marathon': {
      // Gradually accelerates: starts at 1.0, reaches ~0.6 by end
      const cfg = engine.modeConfig;
      if (cfg.timeLimit === null) return 1.0;
      const progress = 1 - (engine.timeRemaining / cfg.timeLimit);
      return Math.max(0.6, 1.0 - progress * 0.4);
    }
    case 'timed':    return 0.9;
    case 'challenge': return 0.85;
    default:         return 1.0;
  }
}

/**
 * Returns a word-spawn-rate modifier (lower = more frequent).
 * Zen doubles spawn rate (0.5), Blitz slightly increases (0.77).
 */
export function getSpawnRateModifier(engine: GameModeEngine): number {
  switch (engine.activeMode) {
    case 'zen':   return 0.5;
    case 'blitz': return 0.77;
    default:      return 1.0;
  }
}

/**
 * Returns an obstacle-count modifier.
 * - Challenge: 1.5×
 * - Zen: 0 (no obstacles)
 * - Marathon: ramps from 0.5× to 2.0× over time
 */
export function getObstacleModifier(engine: GameModeEngine): number {
  if (engine.isZenMode) return 0;

  switch (engine.activeMode) {
    case 'challenge':
      return 1.5;
    case 'marathon': {
      const cfg = engine.modeConfig;
      if (cfg.timeLimit === null) return 1.0;
      const progress = 1 - (engine.timeRemaining / cfg.timeLimit);
      return 0.5 + progress * 1.5;  // 0.5 → 2.0
    }
    default:
      return 1.0;
  }
}

// ─── Game-end check ───────────────────────────────────────────────────────

/** Returns `true` if the current mode rules require the game to end. */
export function shouldEndGame(
  engine: GameModeEngine,
  gameState: MutableGameState,
): boolean {
  if (gameState.gameOver) return true;

  // Timed modes: time ran out
  if (engine.isTimedMode && engine.timeRemaining <= 0) return true;

  // Challenge: lives exhausted
  if (engine.activeMode === 'challenge' && engine.livesRemaining <= 0) return true;

  return false;
}

// ─── HUD display info ─────────────────────────────────────────────────────

/** Build display strings for the in-game HUD overlay. */
export function getModeDisplayInfo(engine: GameModeEngine): ModeDisplayInfo {
  const cfg = engine.modeConfig;

  const timeDisplay = cfg.timeLimit !== null
    ? getTimeDisplay(engine.timeRemaining)
    : '∞';

  const livesDisplay = cfg.lives !== null
    ? `♥ ×${engine.livesRemaining}`
    : '';

  const multiplierDisplay = cfg.scoreMultiplier !== 0
    ? getScoreDisplay(engine.scoreMultiplier)
    : '—';

  return {
    modeName: cfg.name,
    modeEmoji: cfg.emoji,
    timeDisplay,
    livesDisplay,
    multiplierDisplay,
  };
}

// ─── Mode switching ───────────────────────────────────────────────────────

/**
 * Switch the engine to a different mode.  Persists the choice to localStorage
 * and also records the completed play for the *previous* mode.
 */
export function activateMode(
  engine: GameModeEngine,
  modeId: GameMode,
): GameModeEngine {
  // Record stats for the outgoing session
  recordModeSession(engine, 0, 0);

  const config = getMode(modeId);
  if (!config) return engine;   // keep current if invalid

  const isTimed = config.timeLimit !== null && config.timeLimit > 0;

  const updated: GameModeEngine = {
    activeMode: modeId,
    modeConfig: config,
    timeRemaining: config.timeLimit ?? Infinity,
    livesRemaining: config.lives ?? Infinity,
    isTimedMode: isTimed,
    isPracticeMode: modeId === 'practice',
    isZenMode: modeId === 'zen',
    scoreMultiplier: config.scoreMultiplier,
    modeStartTime: Date.now(),
  };

  lsSet(ACTIVE_MODE_KEY, modeId);
  return updated;
}

// ─── Stats tracking ───────────────────────────────────────────────────────

/** Record a completed play session for the engine's active mode. */
export function recordModeSession(
  engine: GameModeEngine,
  finalScore: number,
  durationMs: number,
): void {
  const record = loadModeStatsRecord(engine.activeMode);
  record.playCount += 1;
  record.totalTimePlayed += durationMs;
  record.lastPlayedAt = Date.now();
  if (finalScore > record.bestScore) record.bestScore = finalScore;
  saveModeStatsRecord(engine.activeMode, record);

  // Also update the shared mode-selector stats
  recordPlay(engine.activeMode, finalScore, durationMs);
}

/** Retrieve stored stats for a specific mode. */
export function getStoredModeStats(modeId: GameMode): ModeStatsRecord {
  return loadModeStatsRecord(modeId);
}

/** Return a summary array of all modes with their persisted stats. */
export function getModeSummary(): ModeSummary[] {
  const allModes: GameMode[] = [
    'classic', 'timed', 'practice', 'zen',
    'challenge', 'pvp', 'blitz', 'marathon',
  ];

  return allModes.map((id) => {
    const config = getMode(id);
    return {
      modeId: id,
      modeName: config?.name ?? id,
      modeEmoji: config?.emoji ?? '🎮',
      stats: loadModeStatsRecord(id),
      isLocked: config?.isLocked ?? true,
    };
  });
}
