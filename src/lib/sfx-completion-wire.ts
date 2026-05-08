// ─── SFX Completion Wire ────────────────────────────────────────────────────────
//
// Pure logic module that completes the wiring of game events to the SFX
// auto-trigger system.  Bridges the gap between high-level game events
// (collision, level-up, boss, etc.) and the concrete sound functions
// exported by `@/lib/sounds`.
//
// This module is intentionally free of React — it can be consumed from
// the game loop, a Redux thunk, or any imperative context.
//
// Sound palette (limited to what sounds.ts provides):
//   playEatSound          → word eat / combo chime
//   playPowerUpSound      → power-up collect / achievement / fanfare
//   playGameOverSound     → death / shield break / dramatic end
//   playStartSound        → game start / boss appear / mode change
//   playPauseSound        → timer warning / tick-tock
//   playClickSound        → UI micro-events / collision ticks
//   playEasterEggSound    → rare milestone / celebration
//   playThemePreviewSound → contextual theme switch cue
// ────────────────────────────────────────────────────────────────────────────────

import {
  playEatSound,
  playGameOverSound,
  playStartSound,
  playPauseSound,
  playClickSound,
  playPowerUpSound,
  playThemePreviewSound,
  playEasterEggSound,
} from '@/lib/sounds'

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Aggregate statistics about SFX triggers, useful for debugging overlays
 * or analytics telemetry.
 */
export interface SfxCompletionStats {
  /** Total number of sound triggers since last reset. */
  totalTriggers: number
  /** Number of triggers bucketed by event name. */
  byEvent: Record<string, number>
  /** Timestamp (ms since epoch) of the last trigger per event. */
  lastTriggerTimes: Record<string, number>
}

/**
 * Collision sub-types — each mapped to a slightly different audio flavour
 * even though they share the same underlying sound function.
 */
export type CollisionType = 'wall' | 'self' | 'obstacle' | 'bot'

/**
 * Power-up type identifiers.  The wire picks the most fitting sound
 * function for each, falling back to `playPowerUpSound` for unknowns.
 */
export type PowerUpKind =
  | 'speed_boost' | 'magnet' | 'shield' | 'freeze'
  | 'multiplier' | 'ghost' | 'bomb' | 'shrink'
  | string

/**
 * Public API surface of the completion wire.
 *
 * Instantiate via `createSfxCompletionWire()` and call the `on*` methods
 * from the game loop at appropriate points.
 */
export interface SfxCompletionWire {
  // ── Collision ──────────────────────────────────────────────────────────────
  /** Fire a collision sound.  Sound varies by collision target. */
  onCollision(type: CollisionType): void

  // ── Progression ────────────────────────────────────────────────────────────
  /** Level-up fanfare.  Higher levels get a more triumphant sound. */
  onLevelUp(level: number): void
  /** Mode-change transition whoosh. */
  onModeChange(modeId: string): void
  /** Streak milestone chime.  Escalates with streak length. */
  onStreakMilestone(streak: number): void

  // ── Timer / Urgency ────────────────────────────────────────────────────────
  /** Timer warning tick.  Urgency increases as `secondsLeft` decreases. */
  onTimerWarning(secondsLeft: number): void

  // ── Boss ───────────────────────────────────────────────────────────────────
  /** Dramatic sting when a boss appears.  Tier affects intensity. */
  onBossAppear(tier: number): void
  /** Victory sound when a boss is defeated. */
  onBossDefeated(tier: number): void

  // ── World Interaction ──────────────────────────────────────────────────────
  /** Whoosh sound for portal teleportation. */
  onPortalTeleport(): void
  /** Breaking sound for destructible wall destruction. */
  onWallBreak(): void

  // ── Power-Up Effects ───────────────────────────────────────────────────────
  /** Ice crackling when freeze activates. */
  onFreezeActivate(): void
  /** Rushing wind when speed boost activates. */
  onSpeedBoostActivate(): void
  /** Humming sound when magnet activates. */
  onMagnetActivate(): void
  /** Shatter sound when shield breaks. */
  onShieldBreak(): void

  // ── Power-Up Collection ────────────────────────────────────────────────────
  /** Collect a power-up.  Sound varies by power-up type. */
  onPowerUpCollect(type: PowerUpKind): void

  // ── Scoring ────────────────────────────────────────────────────────────────
  /** Word eat event.  Pitch / pattern escalates with combo. */
  onWordEat(combo: number): void
  /** Combo milestone (e.g. every 5th or 10th combo). */
  onComboMilestone(combo: number): void

  // ── End-Game & Celebration ─────────────────────────────────────────────────
  /** Dramatic end-of-game sound. */
  onGameOver(): void
  /** Celebration fanfare for daily challenge completion. */
  onDailyChallengeComplete(): void

  // ── Social / Meta ──────────────────────────────────────────────────────────
  /** Achievement pop sound.  Rarity affects the sound chosen. */
  onAchievementPop(rarity: string): void

  // ── Diagnostics ────────────────────────────────────────────────────────────
  /** Return a snapshot of trigger statistics. */
  getStats(): SfxCompletionStats
  /** Reset all counters and timestamps. */
  resetStats(): void
}

// ─── Constants ─────────────────────────────────────────────────────────────────

/** localStorage key for persisting stats across sessions. */
const STORAGE_KEY = 'ws_sfx_completion_wire'

/** Minimum interval (ms) between rapid-fire event sounds (collision, score). */
const RAPID_COOLDOWN_MS = 100

/** Minimum interval (ms) between ambient / repeating event sounds. */
const AMBIENT_COOLDOWN_MS = 500

/** No cooldown applied — used for one-shot events (level up, boss defeat). */
const ONE_SHOT_COOLDOWN_MS = 0

// ─── Volume Tiers ──────────────────────────────────────────────────────────────

/**
 * Volume tiers control the relative loudness of different event categories.
 *
 * - **ambient**  (0.30) — Background hums, magnet drones, weather.
 * - **standard** (0.60) — Regular word eats, UI clicks.
 * - **important** (0.80) — Combo milestones, level ups, power-up collections.
 * - **critical** (1.00) — Death, timer warnings, boss events.
 */
const VOLUME_TIER = {
  ambient: 0.3,
  standard: 0.6,
  important: 0.8,
  critical: 1.0,
} as const

// ─── Cooldown Classification ───────────────────────────────────────────────────

/**
 * Each event is classified into a cooldown bucket.
 * The wire enforces minimum intervals per bucket.
 */
type CooldownBucket = 'rapid' | 'ambient' | 'oneshot'

/** Milliseconds per cooldown bucket. */
const COOLDOWN_MS: Record<CooldownBucket, number> = {
  rapid: RAPID_COOLDOWN_MS,
  ambient: AMBIENT_COOLDOWN_MS,
  oneshot: ONE_SHOT_COOLDOWN_MS,
}

/**
 * Returns the cooldown bucket for a given event name.
 * Default is `'rapid'` if the event is not explicitly listed.
 */
function getCooldownBucket(event: string): CooldownBucket {
  const AMBIENT_EVENTS: ReadonlySet<string> = new Set([
    'magnetActivate',
    'speedBoostActivate',
    'freezeActivate',
    'timerWarning',
    'portalTeleport',
  ])
  if (AMBIENT_EVENTS.has(event)) return 'ambient'

  const ONESHOT_EVENTS: ReadonlySet<string> = new Set([
    'levelUp',
    'modeChange',
    'bossAppear',
    'bossDefeated',
    'gameOver',
    'dailyChallengeComplete',
    'achievementPop',
    'comboMilestone',
    'streakMilestone',
  ])
  if (ONESHOT_EVENTS.has(event)) return 'oneshot'

  return 'rapid'
}

// ─── Stats Persistence ─────────────────────────────────────────────────────────

/**
 * Load persisted stats from localStorage, returning a fresh default when
 * the stored data is corrupt or absent.
 */
function loadPersistedStats(): SfxCompletionStats {
  if (typeof window === 'undefined') {
    return { totalTriggers: 0, byEvent: {}, lastTriggerTimes: {} }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SfxCompletionStats>
      return {
        totalTriggers: typeof parsed.totalTriggers === 'number' ? parsed.totalTriggers : 0,
        byEvent: typeof parsed.byEvent === 'object' && parsed.byEvent !== null
          ? { ...parsed.byEvent }
          : {},
        lastTriggerTimes: typeof parsed.lastTriggerTimes === 'object' && parsed.lastTriggerTimes !== null
          ? { ...parsed.lastTriggerTimes }
          : {},
      }
    }
  } catch {
    // Corrupt data — start fresh
  }
  return { totalTriggers: 0, byEvent: {}, lastTriggerTimes: {} }
}

/**
 * Persist stats to localStorage.  Silently no-ops when storage is
 * unavailable or full.
 */
function persistStats(stats: SfxCompletionStats): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // Storage unavailable or quota exceeded
  }
}

// ─── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a new `SfxCompletionWire` instance.
 *
 * Each instance maintains its own cooldown timers and statistics.
 * Stats are persisted to `localStorage` under the key `ws_sfx_completion_wire`
 * so they survive page reloads.
 *
 * @returns A fully wired `SfxCompletionWire` ready to receive game events.
 *
 * @example
 * ```ts
 * const wire = createSfxCompletionWire()
 * wire.onWordEat(3)       // combo = 3
 * wire.onLevelUp(5)       // level 5 reached
 * wire.onCollision('wall')
 * console.log(wire.getStats())
 * ```
 */
export function createSfxCompletionWire(): SfxCompletionWire {
  // ── Mutable state ─────────────────────────────────────────────────────────

  const stats = loadPersistedStats()

  /**
   * Record a trigger, incrementing the counter and storing the timestamp.
   * Returns `true` if the cooldown gate passed and the sound should fire.
   */
  function tryTrigger(eventName: string): boolean {
    const bucket = getCooldownBucket(eventName)
    const cooldownMs = COOLDOWN_MS[bucket]

    // Check cooldown (skip for oneshot events)
    if (cooldownMs > 0) {
      const lastTime = stats.lastTriggerTimes[eventName]
      if (lastTime !== undefined) {
        const elapsed = Date.now() - lastTime
        if (elapsed < cooldownMs) {
          return false
        }
      }
    }

    // Record the trigger
    stats.totalTriggers += 1
    stats.byEvent[eventName] = (stats.byEvent[eventName] ?? 0) + 1
    stats.lastTriggerTimes[eventName] = Date.now()

    return true
  }

  // ── Sound helpers (volume-tier wrappers) ──────────────────────────────────

  /**
   * Wrap a sound function call so it only fires when the cooldown gate passes.
   * We don't directly control volume at the oscillator level here — instead we
   * call the sound functions as-is but gate them via cooldown and stats.
   *
   * For context-aware routing, the *choice* of which sound function to call
   * varies by event parameters even though the palette is small.
   */
  function fire(
    eventName: string,
    soundFn: () => void,
    _volumeTier: keyof typeof VOLUME_TIER,
  ): void {
    if (tryTrigger(eventName)) {
      soundFn()
      persistStats(stats)
    }
  }

  // ── Collision ─────────────────────────────────────────────────────────────

  /**
   * Collision sounds mapped by target type:
   * - **wall**:      Click sound (low-impact bump)
   * - **self**:      Game-over descending tone (self-collision = death)
   * - **obstacle**:  Click sound with pause cadence (thud)
   * - **bot**:       Power-up sound (bot collision = special event)
   */
  function onCollision(type: CollisionType): void {
    switch (type) {
      case 'wall':
        fire('collisionWall', playClickSound, 'standard')
        break
      case 'self':
        fire('collisionSelf', playGameOverSound, 'critical')
        break
      case 'obstacle':
        fire('collisionObstacle', playPauseSound, 'standard')
        break
      case 'bot':
        fire('collisionBot', playPowerUpSound, 'important')
        break
    }
  }

  // ── Progression ───────────────────────────────────────────────────────────

  /**
   * Level-up fanfare:
   * - Levels 1–3:   start sound (basic fanfare)
   * - Levels 4–7:   power-up sound (ascending magic)
   * - Levels 8+:    easter egg sound (full celebration)
   */
  function onLevelUp(level: number): void {
    const eventName = 'levelUp'
    if (level <= 3) {
      fire(eventName, playStartSound, 'important')
    } else if (level <= 7) {
      fire(eventName, playPowerUpSound, 'important')
    } else {
      fire(eventName, playEasterEggSound, 'important')
    }
  }

  /**
   * Mode-change transition:
   * - Maps game mode IDs to the nearest `SoundThemeId` so different
   *   modes produce aurally distinct cues via `playThemePreviewSound`.
   * - Falls back to `'default'` for unrecognised modes.
   */
  function onModeChange(modeId: string): void {
    // Map game modes to available sound theme IDs for audio variety
    const MODE_TO_THEME: Record<string, 'default' | 'retro' | 'soft' | 'epic'> = {
      classic: 'retro',
      blitz: 'epic',
      zen: 'soft',
      puzzle: 'soft',
      boss: 'epic',
      pvp: 'epic',
      daily: 'default',
      speed: 'retro',
      story: 'soft',
      practice: 'soft',
      survival: 'epic',
      custom: 'default',
    }
    const themeId = MODE_TO_THEME[modeId] ?? 'default'

    fire('modeChange', () => playThemePreviewSound(themeId), 'important')
  }

  /**
   * Streak milestone chime — escalates with streak length:
   * - streak < 5:  click (subtle)
   * - streak < 10: eat sound (recognisable)
   * - streak < 20: power-up sound (building excitement)
   * - streak ≥ 20: easter egg sound (rare celebration)
   */
  function onStreakMilestone(streak: number): void {
    const eventName = 'streakMilestone'
    if (streak < 5) {
      fire(eventName, playClickSound, 'important')
    } else if (streak < 10) {
      fire(eventName, playEatSound, 'important')
    } else if (streak < 20) {
      fire(eventName, playPowerUpSound, 'important')
    } else {
      fire(eventName, playEasterEggSound, 'important')
    }
  }

  // ── Timer ─────────────────────────────────────────────────────────────────

  /**
   * Timer warning tick-tock.  Urgency escalates as time runs out:
   * - > 10 s:   single click (ambient, infrequent)
   * - 5–10 s:   pause sound (moderate urgency)
   * - 3–5 s:    two rapid clicks (heightened urgency)
   * - ≤ 3 s:    game-over rumble (critical urgency)
   *
   * The ambient cooldown bucket ensures this doesn't fire every frame.
   */
  function onTimerWarning(secondsLeft: number): void {
    const eventName = 'timerWarning'
    if (secondsLeft > 10) {
      fire(eventName, playClickSound, 'ambient')
    } else if (secondsLeft > 5) {
      fire(eventName, playPauseSound, 'ambient')
    } else if (secondsLeft > 3) {
      fire(eventName, () => {
        playClickSound()
        setTimeout(playClickSound, 50)
      }, 'important')
    } else {
      fire(eventName, playGameOverSound, 'critical')
    }
  }

  // ── Boss ──────────────────────────────────────────────────────────────────

  /**
   * Boss appear — dramatic sting:
   * - Tier 1: start sound (standard intro)
   * - Tier 2: power-up sound (building tension)
   * - Tier 3+: game-over rumble (maximum drama)
   */
  function onBossAppear(tier: number): void {
    const eventName = 'bossAppear'
    if (tier <= 1) {
      fire(eventName, playStartSound, 'critical')
    } else if (tier <= 2) {
      fire(eventName, playPowerUpSound, 'critical')
    } else {
      fire(eventName, playGameOverSound, 'critical')
    }
  }

  /**
   * Boss defeated — victory fanfare:
   * - Tier 1: power-up sound
   * - Tier 2: easter egg sound (bigger reward)
   * - Tier 3+: easter egg + theme preview cascade (maximum celebration)
   */
  function onBossDefeated(tier: number): void {
    const eventName = 'bossDefeated'
    if (tier <= 1) {
      fire(eventName, playPowerUpSound, 'critical')
    } else if (tier <= 2) {
      fire(eventName, playEasterEggSound, 'critical')
    } else {
      fire(eventName, () => {
        playEasterEggSound()
        setTimeout(() => playThemePreviewSound('epic'), 300)
      }, 'critical')
    }
  }

  // ── World Interaction ─────────────────────────────────────────────────────

  /** Portal teleport — whoosh via ascending pause sound. */
  function onPortalTeleport(): void {
    fire('portalTeleport', playPauseSound, 'ambient')
  }

  /** Wall break — crunch via click + pause combo. */
  function onWallBreak(): void {
    fire('wallBreak', () => {
      playClickSound()
      setTimeout(playPauseSound, 60)
    }, 'standard')
  }

  // ── Power-Up Activation Effects ───────────────────────────────────────────

  /**
   * Freeze activate — ice crackling: two rapid pause blips at different
   * intervals to simulate the crackling texture of ice forming.
   */
  function onFreezeActivate(): void {
    fire('freezeActivate', () => {
      playPauseSound()
      setTimeout(playPauseSound, 80)
      setTimeout(playClickSound, 140)
    }, 'ambient')
  }

  /**
   * Speed boost — rushing wind: pause sound with rapid retrigger to
   * simulate wind acceleration.
   */
  function onSpeedBoostActivate(): void {
    fire('speedBoostActivate', () => {
      playPauseSound()
      setTimeout(playPauseSound, 40)
      setTimeout(playPauseSound, 80)
    }, 'ambient')
  }

  /**
   * Magnet activate — humming: a sustained-sounding pattern via repeated
   * clicks at low cadence.
   */
  function onMagnetActivate(): void {
    fire('magnetActivate', () => {
      playClickSound()
      setTimeout(playClickSound, 100)
      setTimeout(playClickSound, 200)
    }, 'ambient')
  }

  /**
   * Shield break — shatter: game-over sound represents the dramatic
   * breakage moment.
   */
  function onShieldBreak(): void {
    fire('shieldBreak', playGameOverSound, 'critical')
  }

  // ── Power-Up Collection ───────────────────────────────────────────────────

  /**
   * Power-up collection with type-based routing:
   *
   * | Type         | Sound function       | Rationale                        |
   * |-------------|----------------------|----------------------------------|
   * | speed_boost | `playPauseSound`     | Rushing wind feel                |
   * | magnet      | `playClickSound`     ×3 | Magnetic attraction hum       |
   * | shield      | `playStartSound`     | Defensive activation fanfare     |
   * | freeze      | `playPauseSound`     ×2 | Ice crystallisation            |
   * | multiplier  | `playPowerUpSound`   | Standard power-up magic          |
   * | ghost       | `playClickSound`     | Ethereal whisper                 |
   * | bomb        | `playGameOverSound`  | Explosive impact                 |
   * | shrink      | `playPauseSound`     | Deflation sound                  |
   * | (other)     | `playPowerUpSound`   | Default catch-all                |
   */
  function onPowerUpCollect(type: PowerUpKind): void {
    const eventName = 'powerUpCollect'
    switch (type) {
      case 'speed_boost':
        fire(eventName, () => {
          playPauseSound()
          setTimeout(playPauseSound, 50)
        }, 'important')
        break
      case 'magnet':
        fire(eventName, () => {
          playClickSound()
          setTimeout(playClickSound, 60)
          setTimeout(playClickSound, 120)
        }, 'important')
        break
      case 'shield':
        fire(eventName, playStartSound, 'important')
        break
      case 'freeze':
        fire(eventName, () => {
          playPauseSound()
          setTimeout(playPauseSound, 80)
        }, 'important')
        break
      case 'multiplier':
        fire(eventName, playPowerUpSound, 'important')
        break
      case 'ghost':
        fire(eventName, playClickSound, 'ambient')
        break
      case 'bomb':
        fire(eventName, playGameOverSound, 'critical')
        break
      case 'shrink':
        fire(eventName, playPauseSound, 'standard')
        break
      default:
        fire(eventName, playPowerUpSound, 'important')
        break
    }
  }

  // ── Scoring ───────────────────────────────────────────────────────────────

  /**
   * Word eat with combo-based pitch escalation:
   *
   * - combo 0–2:   single `playEatSound` (standard)
   * - combo 3–5:   eat + delayed click (building rhythm)
   * - combo 6–9:   eat + power-up overlay (hot streak)
   * - combo 10+:   eat + easter egg cascade (max intensity)
   *
   * Uses the **rapid** cooldown bucket to prevent audio flooding
   * during fast word chains.
   */
  function onWordEat(combo: number): void {
    const eventName = 'wordEat'
    if (combo <= 2) {
      fire(eventName, playEatSound, 'standard')
    } else if (combo <= 5) {
      fire(eventName, () => {
        playEatSound()
        setTimeout(playClickSound, 100)
      }, 'standard')
    } else if (combo <= 9) {
      fire(eventName, () => {
        playEatSound()
        setTimeout(playPowerUpSound, 120)
      }, 'important')
    } else {
      fire(eventName, () => {
        playEatSound()
        setTimeout(playEasterEggSound, 150)
      }, 'important')
    }
  }

  /**
   * Combo milestone — escalating chime:
   * - combo < 5:   click (subtle recognition)
   * - combo < 10:  eat sound (acknowledging progress)
   * - combo < 20:  power-up sound (momentum building)
   * - combo ≥ 20:  easter egg sound (extraordinary streak)
   */
  function onComboMilestone(combo: number): void {
    const eventName = 'comboMilestone'
    if (combo < 5) {
      fire(eventName, playClickSound, 'important')
    } else if (combo < 10) {
      fire(eventName, playEatSound, 'important')
    } else if (combo < 20) {
      fire(eventName, playPowerUpSound, 'important')
    } else {
      fire(eventName, playEasterEggSound, 'important')
    }
  }

  // ── End-Game & Celebration ────────────────────────────────────────────────

  /** Game over — dramatic end using the full descending tone. */
  function onGameOver(): void {
    fire('gameOver', playGameOverSound, 'critical')
  }

  /**
   * Daily challenge complete — celebration fanfare:
   * Uses the easter egg sound for the most triumphant feel, followed
   * by a theme preview for a satisfying coda.
   */
  function onDailyChallengeComplete(): void {
    fire('dailyChallengeComplete', () => {
      playEasterEggSound()
      setTimeout(() => playThemePreviewSound('epic'), 400)
    }, 'critical')
  }

  // ── Social / Meta ─────────────────────────────────────────────────────────

  /**
   * Achievement pop — sparkle sound based on rarity:
   * - `common`:    click (subtle ping)
   * - `rare`:      eat sound (pleasant chime)
   * - `epic`:      power-up sound (exciting fanfare)
   * - `legendary`: easter egg sound (maximum fanfare)
   * - (other):     power-up sound (safe default)
   */
  function onAchievementPop(rarity: string): void {
    const eventName = 'achievementPop'
    switch (rarity.toLowerCase()) {
      case 'common':
        fire(eventName, playClickSound, 'standard')
        break
      case 'rare':
        fire(eventName, playEatSound, 'important')
        break
      case 'epic':
        fire(eventName, playPowerUpSound, 'important')
        break
      case 'legendary':
        fire(eventName, playEasterEggSound, 'critical')
        break
      default:
        fire(eventName, playPowerUpSound, 'important')
        break
    }
  }

  // ── Diagnostics ───────────────────────────────────────────────────────────

  /** Return a shallow snapshot of current statistics. */
  function getStats(): SfxCompletionStats {
    return {
      totalTriggers: stats.totalTriggers,
      byEvent: { ...stats.byEvent },
      lastTriggerTimes: { ...stats.lastTriggerTimes },
    }
  }

  /** Reset all counters and timestamps, clearing persisted storage. */
  function resetStats(): void {
    stats.totalTriggers = 0
    stats.byEvent = {}
    stats.lastTriggerTimes = {}
    persistStats(stats)
  }

  // ── Public surface ────────────────────────────────────────────────────────

  return {
    onCollision,
    onLevelUp,
    onModeChange,
    onStreakMilestone,
    onTimerWarning,
    onBossAppear,
    onBossDefeated,
    onPortalTeleport,
    onWallBreak,
    onFreezeActivate,
    onSpeedBoostActivate,
    onMagnetActivate,
    onShieldBreak,
    onGameOver,
    onDailyChallengeComplete,
    onAchievementPop,
    onComboMilestone,
    onPowerUpCollect,
    onWordEat,
    getStats,
    resetStats,
  }
}
