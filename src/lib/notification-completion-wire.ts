/**
 * notification-completion-wire.ts
 *
 * Pure-logic bridge module that wires game events to the notification system
 * (NotifEventWire / NotificationManager).  Provides higher-level, context-aware
 * helpers for boss defeats, streak milestones, album achievements, daily
 * challenges, mode completions, battle-pass tier-ups, and mastery level-ups.
 *
 * Features:
 *  - 500 ms debounce between rapid-fire notifications
 *  - Priority queue ordering (boss > streak > achievement > daily > mode)
 *  - Max 3 visible notifications at once
 *  - Stats tracking persisted to localStorage
 *
 * **No React imports** — this file is safe to use from any JS/TS context.
 */

import {
  type NotifEventWire,
  createNotifEventWire,
  onAchievementUnlocked,
} from './notif-event-wire';
import {
  pushQuick,
  pushNotification,
} from './notification-manager';

// ── Constants ──────────────────────────────────────────────────────────────────

/** localStorage key used to persist stats across sessions. */
const STORAGE_KEY = 'ws_notification_completion_wire';

/** Minimum interval (ms) between two consecutive notifications. */
const DEBOUNCE_MS = 500;

/** Maximum number of notifications that can be visible simultaneously. */
const MAX_VISIBLE = 3;

/**
 * Streak milestones that trigger a special notification.
 * Sorted ascending so callers can binary-search if desired.
 */
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 90, 365] as const;

/** Priority weight per notification type (higher = more important). */
const TYPE_PRIORITY: Record<NotificationCompletionType, number> = {
  boss_defeat: 100,
  streak: 80,
  achievement: 60,
  daily: 40,
  mode: 20,
  battle_pass: 50,
  mastery: 30,
} as const;

/**
 * Notification type identifiers used for stats and priority ordering.
 * Not to be confused with the low-level `NotificationType` from the manager.
 */
type NotificationCompletionType =
  | 'boss_defeat'
  | 'streak'
  | 'achievement'
  | 'daily'
  | 'mode'
  | 'battle_pass'
  | 'mastery';

// ── Boss Defeat Helpers ────────────────────────────────────────────────────────

/**
 * Describes a boss tier with its display emoji, hex colour, and label.
 */
interface BossTierInfo {
  emoji: string;
  color: string;
  label: string;
}

/**
 * Returns tier-appropriate metadata for a boss defeat notification.
 *
 * | Tier range | Label      | Emoji | Colour   |
 * |------------|------------|-------|----------|
 * | 1-3        | Normal     | 💀    | `#ef4444`|
 * | 4-5        | Elite      | 👹    | `#f97316`|
 * | 6+         | Legendary  | 🐉    | `#eab308`|
 */
function getBossTierInfo(tier: number): BossTierInfo {
  if (tier >= 6) {
    return { emoji: '🐉', color: '#eab308', label: 'Legendary' };
  }
  if (tier >= 4) {
    return { emoji: '👹', color: '#f97316', label: 'Elite' };
  }
  return { emoji: '💀', color: '#ef4444', label: 'Normal' };
}

/**
 * Builds the title and message strings for a boss-defeat notification.
 */
function buildBossDefeatMessage(
  bossWord: string,
  tier: number,
  info: BossTierInfo,
): { title: string; message: string } {
  const tierTag = `${info.emoji} [${info.label}]`;
  if (tier >= 6) {
    return {
      title: `${tierTag} Legendary Boss Fallen!`,
      message: `You conquered "${bossWord}" — a legendary feat worthy of songs!`,
    };
  }
  if (tier >= 4) {
    return {
      title: `${tierTag} Elite Boss Slain!`,
      message: `"${bossWord}" has been vanquished. You are unstoppable!`,
    };
  }
  return {
    title: `${tierTag} Boss Defeated!`,
    message: `Victory over "${bossWord}" — well played, adventurer!`,
  };
}

// ── Streak Milestone Helpers ───────────────────────────────────────────────────

/**
 * Celebration data for each streak milestone.
 */
interface StreakCelebration {
  emoji: string;
  title: string;
  message: string;
}

/**
 * Returns escalating celebration content for a given streak count.
 * Messages get progressively more hype as the streak grows.
 */
function getStreakCelebration(
  streak: number,
  bestStreak: number,
): StreakCelebration {
  // Personal-best branch — highest praise
  if (streak > bestStreak) {
    if (streak >= 365) {
      return {
        emoji: '🌟',
        title: '🌟 NEW PERSONAL BEST — A Full Year!',
        message: `${streak} days and counting. You are an absolute legend!`,
      };
    }
    if (streak >= 90) {
      return {
        emoji: '💎',
        title: '💎 New Personal Record — 90 Days!',
        message: `Unbelievable dedication! ${streak} days of mastery.`,
      };
    }
    if (streak >= 60) {
      return {
        emoji: '🔥',
        title: '🔥 Personal Best — 60 Days!',
        message: `${streak} consecutive days — your best streak ever!`,
      };
    }
    return {
      emoji: '⭐',
      title: `⭐ New Personal Best: ${streak} Days!`,
      message: `You surpassed your previous record. Keep the fire alive!`,
    };
  }

  // Standard milestone messages (ascending)
  if (streak >= 365) {
    return {
      emoji: '🌟',
      title: '🌟 One Year Streak!',
      message: `${streak} days of daily dedication — truly legendary.`,
    };
  }
  if (streak >= 90) {
    return {
      emoji: '💎',
      title: '💎 90-Day Diamond Streak!',
      message: 'Three months of consistency — diamond-tier commitment!',
    };
  }
  if (streak >= 60) {
    return {
      emoji: '🔥',
      title: '🔥 60-Day Streak!',
      message: 'Two full months of daily play — incredible stamina!',
    };
  }
  if (streak >= 30) {
    return {
      emoji: '⭐',
      title: '⭐ 30-Day Streak!',
      message: 'A full month of dedication — you are unstoppable!',
    };
  }
  if (streak >= 21) {
    return {
      emoji: '🎯',
      title: '🎯 21-Day Streak — Habit Formed!',
      message: 'Three weeks strong! Science says it takes 21 days to build a habit.',
    };
  }
  if (streak >= 14) {
    return {
      emoji: '🔥',
      title: '🔥 14-Day Streak!',
      message: 'Two weeks of consistency — the momentum is building!',
    };
  }
  if (streak >= 7) {
    return {
      emoji: '⭐',
      title: '⭐ 7-Day Streak!',
      message: 'A full week of daily play — well done!',
    };
  }
  // streak === 3
  return {
    emoji: '🔥',
    title: '🔥 3-Day Streak!',
    message: "You're building momentum! Keep the streak alive!",
  };
}

// ── Album Achievement Helpers ──────────────────────────────────────────────────

/**
 * Known achievement categories and their associated emojis.
 * Falls back to 📖 for unknown categories.
 */
const ALBUM_CATEGORY_EMOJIS: Record<string, string> = {
  collection: '📖',
  rare: '💎',
  legendary: '👑',
  mythic: '🌟',
  speed: '⚡',
  endurance: '🏃',
  puzzle: '🧩',
  vocabulary: '📚',
  multiplayer: '👥',
  seasonal: '🎄',
  boss: '🐉',
  combo: '💥',
  streak: '🔥',
  exploration: '🗺️',
};

/**
 * Picks an emoji for an album achievement by matching known keywords
 * in the achievement name (case-insensitive).
 */
function pickAlbumEmoji(achievementName: string): string {
  const lower = achievementName.toLowerCase();
  for (const [keyword, emoji] of Object.entries(ALBUM_CATEGORY_EMOJIS)) {
    if (lower.includes(keyword)) return emoji;
  }
  return '📖';
}

// ── Daily Challenge Helpers ────────────────────────────────────────────────────

/**
 * Star-rating metadata for daily challenge completion.
 */
interface StarRating {
  label: string;
  emoji: string;
  color: string;
  title: string;
  message: string;
}

/**
 * Returns star-based celebration content.
 *
 * | Stars | Label   | Emoji | Colour   |
 * |-------|---------|-------|----------|
 * | 0     | Failed  | 😢    | `#ef4444`|
 * | 1     | Bronze  | 🥉    | `#d97706`|
 * | 2     | Silver  | 🥈    | `#94a3b8`|
 * | 3     | Gold    | 🥇    | `#eab308`|
 */
function getStarRating(
  stars: number,
  score: number,
  target: number,
): StarRating {
  const pct = target > 0 ? Math.round((score / target) * 100) : 0;

  if (stars >= 3) {
    return {
      label: 'Gold',
      emoji: '🥇',
      color: '#eab308',
      title: '🥇 Gold Star — Daily Challenge!',
      message: `Perfect score! ${score.toLocaleString()} pts (${pct}% of target).`,
    };
  }
  if (stars >= 2) {
    return {
      label: 'Silver',
      emoji: '🥈',
      color: '#94a3b8',
      title: '🥈 Silver Star — Daily Challenge!',
      message: `Great job! ${score.toLocaleString()} pts (${pct}% of target).`,
    };
  }
  if (stars >= 1) {
    return {
      label: 'Bronze',
      emoji: '🥉',
      color: '#d97706',
      title: '🥉 Bronze Star — Daily Challenge!',
      message: `You made it! ${score.toLocaleString()} pts (${pct}% of target).`,
    };
  }
  return {
    label: 'Failed',
    emoji: '😢',
    color: '#ef4444',
    title: '😢 Daily Challenge — So Close!',
    message: `Scored ${score.toLocaleString()} / ${target.toLocaleString()} pts. Try again tomorrow!`,
  };
}

// ── Mode Completion Helpers ────────────────────────────────────────────────────

/** Known game mode labels with display emojis. */
const MODE_EMOJIS: Record<string, string> = {
  timed: '⏱️',
  blitz: '⚡',
  marathon: '🏃',
  zen: '🧘',
  practice: '📝',
  boss: '🐉',
  pvp: '⚔️',
  survival: '🛡️',
  puzzle: '🧩',
  daily: '📅',
  story: '📖',
};

function getModeEmoji(modeName: string): string {
  const lower = modeName.toLowerCase();
  for (const [keyword, emoji] of Object.entries(MODE_EMOJIS)) {
    if (lower.includes(keyword)) return emoji;
  }
  return '🎮';
}

// ── Battle Pass Helpers ────────────────────────────────────────────────────────

/** Emojis used at different battle-pass tier breakpoints. */
const BP_TIER_EMOJIS: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💠',
  diamond: '💎',
  mythic: '🌟',
};

function getBattlePassEmoji(tierName: string): string {
  const lower = tierName.toLowerCase();
  for (const [keyword, emoji] of Object.entries(BP_TIER_EMOJIS)) {
    if (lower.includes(keyword)) return emoji;
  }
  return '🎖️';
}

// ── Stats Helpers ──────────────────────────────────────────────────────────────

/**
 * Default empty stats object.
 */
function emptyStats(): NotificationCompletionStats {
  return { totalSent: 0, byType: {}, lastSentAt: 0 };
}

/**
 * Reads stats from localStorage, falling back to empty defaults.
 */
function loadStats(): NotificationCompletionStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NotificationCompletionStats;
      // Ensure shape is valid even if data was corrupted
      return {
        totalSent: typeof parsed.totalSent === 'number' ? parsed.totalSent : 0,
        byType:
          parsed.byType && typeof parsed.byType === 'object'
            ? { ...parsed.byType }
            : {},
        lastSentAt:
          typeof parsed.lastSentAt === 'number' ? parsed.lastSentAt : 0,
      };
    }
  } catch {
    // Corrupted or unavailable — silently ignore
  }
  return emptyStats();
}

/**
 * Persists stats to localStorage. Errors are silently caught so that
 * the notification system never blocks game logic.
 */
function saveStats(stats: NotificationCompletionStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage full, private mode, etc. — degrade gracefully
  }
}

/**
 * Increments a counter in the stats tracker and persists.
 */
function recordSend(
  stats: NotificationCompletionStats,
  type: NotificationCompletionType,
): void {
  stats.totalSent++;
  stats.byType[type] = (stats.byType[type] ?? 0) + 1;
  stats.lastSentAt = Date.now();
  saveStats(stats);
}

// ── Debounce Queue ─────────────────────────────────────────────────────────────

/**
 * A single item waiting in the debounce queue.
 */
interface PendingNotification {
  /** Notification-type key used for priority ordering. */
  type: NotificationCompletionType;
  /** The function that actually sends the notification. */
  send: () => void;
  /** Monotonic insertion counter for stable sort (FIFO within same priority). */
  order: number;
}

/**
 * Creates a debounced notification queue manager.
 *
 * - Rapid-fire notifications within `DEBOUNCE_MS` are queued.
 * - The queue is ordered by priority (higher first), then FIFO.
 * - At most `MAX_VISIBLE` are allowed through per flush cycle.
 */
function createDebounceQueue() {
  let pending: PendingNotification[] = [];
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let insertionCounter = 0;

  /**
   * Enqueue a notification send. If nothing is currently debouncing,
   * the send fires immediately and a cooldown window opens.
   */
  function enqueue(
    type: NotificationCompletionType,
    send: () => void,
  ): void {
    if (timerId === null) {
      // Nothing debouncing — fire immediately
      send();
      openCooldown();
    } else {
      // Already in cooldown — queue for later
      pending.push({ type, send, order: insertionCounter++ });
      // Keep the queue sorted by priority desc, then insertion order asc
      pending.sort((a, b) => {
        const pa = TYPE_PRIORITY[a.type];
        const pb = TYPE_PRIORITY[b.type];
        return pb !== pa ? pb - pa : a.order - b.order;
      });
    }
  }

  /**
   * Starts the cooldown timer. When it fires the queue is flushed.
   */
  function openCooldown(): void {
    timerId = setTimeout(() => {
      timerId = null;
      flush();
    }, DEBOUNCE_MS);
  }

  /**
   * Flushes up to `MAX_VISIBLE` items from the pending queue.
   * After each item sent, a new cooldown opens so the next item
   * fires after the debounce interval.
   */
  function flush(): void {
    const batch = pending.splice(0, MAX_VISIBLE);
    if (batch.length === 0) return;

    for (const item of batch) {
      item.send();
    }

    // If there are still items left, schedule another flush
    if (pending.length > 0) {
      openCooldown();
    }
  }

  /**
   * Cancels any pending cooldown timer and discards queued items.
   * Useful when the game session ends or the wire is destroyed.
   */
  function destroy(): void {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    pending = [];
  }

  return { enqueue, destroy };
}

// ── Public Interfaces ──────────────────────────────────────────────────────────

/**
 * Cumulative statistics for notification-completion-wire.
 * Persisted across sessions via localStorage.
 */
export interface NotificationCompletionStats {
  /** Total number of notifications dispatched through this wire. */
  totalSent: number;
  /** Breakdown by completion notification type. */
  byType: Record<string, number>;
  /** Timestamp (ms since epoch) of the last sent notification. */
  lastSentAt: number;
}

/**
 * High-level notification wire that bridges game events to the
 * underlying `NotifEventWire` / `NotificationManager` system.
 *
 * Each method respects the debounce interval and priority queue,
 * ensuring rapid-fire events are delivered gracefully.
 */
export interface NotificationCompletionWire {
  /**
   * Fire a boss-defeat notification.
   * @param bossWord  The word that was the boss.
   * @param tier      Boss difficulty tier (1-3 normal, 4-5 elite, 6+ legendary).
   */
  notifyBossDefeated(bossWord: string, tier: number): void;

  /**
   * Fire a streak-milestone notification if the streak hits a known milestone.
   * @param streak     Current streak count.
   * @param bestStreak All-time best streak (for "new personal best" messages).
   */
  notifyStreakMilestone(streak: number, bestStreak: number): void;

  /**
   * Fire an album / collection achievement notification.
   * @param achievementName  Short title of the achievement.
   * @param description      Longer description.
   */
  notifyAlbumAchievement(achievementName: string, description: string): void;

  /**
   * Fire a daily-challenge completion notification with star rating.
   * @param score  Points earned.
   * @param target Target score for the challenge.
   * @param stars  Star rating (0-3).
   */
  notifyDailyChallengeComplete(score: number, target: number, stars: number): void;

  /**
   * Fire a mode-completion notification for timed / blitz / marathon endings.
   * @param modeName   Display name of the game mode.
   * @param score      Final score.
   * @param timeBonus  Time-bonus points awarded.
   */
  notifyModeCompletion(modeName: string, score: number, timeBonus: number): void;

  /**
   * Fire a battle-pass tier-up celebration.
   * @param oldTier   Previous tier number.
   * @param newTier   New tier number after upgrade.
   * @param tierName  Human-readable tier label (e.g. "Gold").
   */
  notifyBattlePassTierUp(oldTier: number, newTier: number, tierName: string): void;

  /**
   * Fire a word-mastery level-up notification (for sidebar integration).
   * @param word      The word whose mastery increased.
   * @param oldLevel  Previous mastery level label.
   * @param newLevel  New mastery level label.
   * @param emoji     Emoji representing the new level.
   */
  notifyMasteryLevelUp(
    word: string,
    oldLevel: string,
    newLevel: string,
    emoji: string,
  ): void;

  /**
   * Returns a snapshot of cumulative notification stats.
   */
  getStats(): NotificationCompletionStats;

  /**
   * Resets all stats to zero and clears the persisted state.
   */
  resetStats(): void;
}

// ── Factory ────────────────────────────────────────────────────────────────────

/**
 * Creates a new `NotificationCompletionWire` instance.
 *
 * The returned wire owns its own `NotifEventWire` internally and
 * persists stats to localStorage under `ws_notification_completion_wire`.
 *
 * @example
 * ```ts
 * const wire = createNotificationCompletionWire();
 * wire.notifyBossDefeated('QUETZAL', 6);
 * wire.notifyStreakMilestone(30, 25);
 * ```
 */
export function createNotificationCompletionWire(): NotificationCompletionWire {
  // Underlying event wire (maxVisible + 2 buffer for queued items)
  const eventWire = createNotifEventWire({ maxVisible: MAX_VISIBLE });

  // Stats loaded from localStorage
  const stats = loadStats();

  // Debounce queue for rapid-fire protection
  const debounce = createDebounceQueue();

  // ── Notification senders (wrapped in debounce.enqueue) ────────────

  function notifyBossDefeated(bossWord: string, tier: number): void {
    const info = getBossTierInfo(tier);
    const { title, message } = buildBossDefeatMessage(bossWord, tier, info);

    debounce.enqueue('boss_defeat', () => {
      pushNotification(eventWire.queue, {
        type: 'achievement',
        title,
        message,
        priority: 10,
        duration: 5000,
        icon: info.emoji,
        color: info.color,
      });
      recordSend(stats, 'boss_defeat');
    });
  }

  function notifyStreakMilestone(streak: number, bestStreak: number): void {
    if (!STREAK_MILESTONES.includes(streak as any)) return;

    const celebration = getStreakCelebration(streak, bestStreak);

    debounce.enqueue('streak', () => {
      pushNotification(eventWire.queue, {
        type: 'success',
        title: celebration.title,
        message: celebration.message,
        priority: 8,
        duration: 4000,
        icon: celebration.emoji,
        color: '#22c55e',
      });
      recordSend(stats, 'streak');
    });
  }

  function notifyAlbumAchievement(
    achievementName: string,
    description: string,
  ): void {
    const emoji = pickAlbumEmoji(achievementName);

    debounce.enqueue('achievement', () => {
      onAchievementUnlocked(eventWire, achievementName, description, emoji);
      recordSend(stats, 'achievement');
    });
  }

  function notifyDailyChallengeComplete(
    score: number,
    target: number,
    stars: number,
  ): void {
    const rating = getStarRating(stars, score, target);
    const clampedStars = Math.max(0, Math.min(3, stars));

    debounce.enqueue('daily', () => {
      pushNotification(eventWire.queue, {
        type: clampedStars >= 3 ? 'achievement' : 'challenge',
        title: rating.title,
        message: rating.message,
        priority: clampedStars + 4,
        duration: clampedStars >= 3 ? 5000 : 3500,
        icon: rating.emoji,
        color: rating.color,
      });
      recordSend(stats, 'daily');
    });
  }

  function notifyModeCompletion(
    modeName: string,
    score: number,
    timeBonus: number,
  ): void {
    const emoji = getModeEmoji(modeName);
    const totalScore = score + timeBonus;
    const parts = [`Score: ${score.toLocaleString()}`];
    if (timeBonus > 0) {
      parts.push(`Time Bonus: +${timeBonus.toLocaleString()}`);
    }
    parts.push(`Total: ${totalScore.toLocaleString()}`);

    debounce.enqueue('mode', () => {
      pushNotification(eventWire.queue, {
        type: 'success',
        title: `${emoji} ${modeName} Complete!`,
        message: parts.join(' · '),
        priority: 6,
        duration: 4000,
        icon: emoji,
      });
      recordSend(stats, 'mode');
    });
  }

  function notifyBattlePassTierUp(
    oldTier: number,
    newTier: number,
    tierName: string,
  ): void {
    const emoji = getBattlePassEmoji(tierName);
    const tiersJumped = newTier - oldTier;

    let title: string;
    let message: string;

    if (tiersJumped > 1) {
      title = `${emoji} Battle Pass: +${tiersJumped} Tiers!`;
      message = `Jumped from tier ${oldTier} to ${newTier} (${tierName})!`;
    } else {
      title = `${emoji} Battle Pass Tier ${newTier}!`;
      message = `Reached ${tierName} tier — keep grinding!`;
    }

    debounce.enqueue('battle_pass', () => {
      pushNotification(eventWire.queue, {
        type: 'achievement',
        title,
        message,
        priority: 7,
        duration: 4500,
        icon: emoji,
        color: '#a855f7',
      });
      recordSend(stats, 'battle_pass');
    });
  }

  function notifyMasteryLevelUp(
    word: string,
    oldLevel: string,
    newLevel: string,
    emoji: string,
  ): void {
    debounce.enqueue('mastery', () => {
      pushQuick(
        eventWire.queue,
        'info',
        `${emoji} ${word} → ${newLevel}`,
        `Mastery improved: ${oldLevel} → ${newLevel}`,
      );
      recordSend(stats, 'mastery');
    });
  }

  function getStats(): NotificationCompletionStats {
    // Return a defensive copy so callers cannot mutate internals
    return {
      totalSent: stats.totalSent,
      byType: { ...stats.byType },
      lastSentAt: stats.lastSentAt,
    };
  }

  function resetStats(): void {
    stats.totalSent = 0;
    stats.byType = {};
    stats.lastSentAt = 0;
    saveStats(stats);
  }

  // ── Return the wire ────────────────────────────────────────────────

  return {
    notifyBossDefeated,
    notifyStreakMilestone,
    notifyAlbumAchievement,
    notifyDailyChallengeComplete,
    notifyModeCompletion,
    notifyBattlePassTierUp,
    notifyMasteryLevelUp,
    getStats,
    resetStats,
  };
}
