/**
 * notif-event-wire.ts
 *
 * Connects the NotificationManager to actual game events in the Word Snake game.
 * Provides event-driven notification triggers for achievements, combos, power-ups,
 * level-ups, streaks, challenges, and more — all with cooldown management,
 * visibility limits, and per-category toggle settings.
 */

import {
  createNotificationQueue,
  pushQuick,
  pushNotification,
  getActive,
  createAchievementNotification,
  createComboNotification,
  getTypeConfig,
  dismissById as dismissByIdFromManager,
  dismissAll as dismissAllFromManager,
  type NotificationQueue,
  type Notification,
  type NotificationType,
} from './notification-manager';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface NotifEventWireSettings {
  enabled: boolean;
  showAchievements: boolean;
  showCombos: boolean;
  showPowerUps: boolean;
  showChallenges: boolean;
  showLevelUps: boolean;
  showStreaks: boolean;
  maxVisible: number;
  soundEnabled: boolean;
}

export interface NotifStats {
  totalShown: number;
  totalDismissed: number;
  byType: Record<string, number>;
}

export interface NotifEventWire {
  queue: NotificationQueue;
  activeNotifications: Notification[];
  settings: NotifEventWireSettings;
  cooldowns: Map<string, number>;
  /** Internal stats counters (not on the underlying queue). */
  _stats: NotifStats;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: NotifEventWireSettings = {
  enabled: true,
  showAchievements: true,
  showCombos: true,
  showPowerUps: true,
  showChallenges: true,
  showLevelUps: true,
  showStreaks: true,
  maxVisible: 3,
  soundEnabled: true,
};

// ── Cooldown helpers ───────────────────────────────────────────────────────────

const ACHIEVEMENT_COOLDOWN_MS = 5_000;
const LEVEL_UP_COOLDOWN_MS = 10_000;

function isOnCooldown(wire: NotifEventWire, key: string): boolean {
  updateCooldowns(wire);
  return wire.cooldowns.has(key);
}

function setCooldown(wire: NotifEventWire, key: string, ms: number): void {
  wire.cooldowns.set(key, Date.now() + ms);
}

// ── Stats helpers ──────────────────────────────────────────────────────────────

function trackPush(wire: NotifEventWire, type: string): void {
  wire._stats.totalShown++;
  wire._stats.byType[type] = (wire._stats.byType[type] ?? 0) + 1;
}

function syncActiveList(wire: NotifEventWire): void {
  const active = getActive(wire.queue);
  wire.activeNotifications = active ? [active] : [];
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createNotifEventWire(
  settings?: Partial<NotifEventWireSettings>,
): NotifEventWire {
  const merged: NotifEventWireSettings = { ...DEFAULT_SETTINGS, ...settings };
  return {
    queue: createNotificationQueue({ maxSize: merged.maxVisible + 2, maxHistory: 60 }),
    activeNotifications: [],
    settings: merged,
    cooldowns: new Map(),
    _stats: { totalShown: 0, totalDismissed: 0, byType: {} },
  };
}

// ── 3. Achievement ────────────────────────────────────────────────────────────

export function onAchievementUnlocked(
  wire: NotifEventWire,
  title: string,
  description: string,
  emoji?: string,
): void {
  if (!wire.settings.enabled || !wire.settings.showAchievements) return;
  if (isOnCooldown(wire, 'achievement')) return;
  setCooldown(wire, 'achievement', ACHIEVEMENT_COOLDOWN_MS);

  const preset = createAchievementNotification(title, description);
  pushNotification(wire.queue, {
    ...preset,
    icon: emoji ?? preset.icon,
  });
  trackPush(wire, 'achievement');
  syncActiveList(wire);
}

// ── 4. Combo Milestone ────────────────────────────────────────────────────────

const COMBO_MILESTONES = new Set([5, 10, 15, 20, 25, 50, 100]);

function comboMessage(size: number): string {
  if (size >= 100) return `${size}x Combo!!!!! 🌟✨`;
  if (size >= 50) return `${size}x Combo!!!! 🔥🔥🔥`;
  if (size >= 25) return `${size}x Combo!!! 💥💥`;
  if (size >= 20) return `${size}x Combo!! 💥`;
  if (size >= 15) return `${size}x Combo!! 🔥`;
  if (size >= 10) return `${size}x Combo!! 💥`;
  return `${size}x Combo! 🔥`;
}

export function onComboMilestone(wire: NotifEventWire, comboSize: number): void {
  if (!wire.settings.enabled || !wire.settings.showCombos) return;
  if (!COMBO_MILESTONES.has(comboSize)) return;

  const estimatedPoints = comboSize * 10;
  const preset = createComboNotification(comboSize, estimatedPoints);
  pushNotification(wire.queue, {
    ...preset,
    title: comboMessage(comboSize),
    priority: Math.min(10, 5 + Math.floor(comboSize / 10)),
  });
  trackPush(wire, 'combo');
  syncActiveList(wire);
}

// ── 5. Power-Up Collected ─────────────────────────────────────────────────────

const POWERUP_EMOJIS: Record<string, string> = {
  speed: '⚡',
  shield: '🛡️',
  magnet: '🧲',
  freeze: '❄️',
  multiplier: '✖️',
  bomb: '💣',
  expand: '📏',
  shrink: '🔍',
  ghost: '👻',
  score_boost: '💰',
};

function powerUpEmoji(type: string): string {
  return POWERUP_EMOJIS[type.toLowerCase()] ?? '⚡';
}

export function onPowerUpCollected(
  wire: NotifEventWire,
  type: string,
  description?: string,
): void {
  if (!wire.settings.enabled || !wire.settings.showPowerUps) return;

  pushQuick(
    wire.queue,
    'powerup',
    `${powerUpEmoji(type)} ${type} Collected!`,
    description ?? 'Power-up activated!',
  );
  trackPush(wire, 'powerup');
  syncActiveList(wire);
}

// ── 6. Level Up ───────────────────────────────────────────────────────────────

export function onLevelUp(wire: NotifEventWire, newLevel: number): void {
  if (!wire.settings.enabled || !wire.settings.showLevelUps) return;
  if (isOnCooldown(wire, 'levelup')) return;
  setCooldown(wire, 'levelup', LEVEL_UP_COOLDOWN_MS);

  pushQuick(
    wire.queue,
    'success',
    `🎉 Level ${newLevel}!`,
    `You reached level ${newLevel} — keep going!`,
  );
  trackPush(wire, 'levelup');
  syncActiveList(wire);
}

// ── 7. Streak Milestone ───────────────────────────────────────────────────────

const STREAK_MILESTONES = new Set([3, 7, 14, 30, 60, 100, 365]);

function streakMessage(days: number): { title: string; message: string } {
  if (days >= 365) return { title: '🔥 One Year Streak!', message: `${days} days of dedication — legendary!` };
  if (days >= 100) return { title: '🏆 100-Day Streak!', message: `${days} consecutive days — incredible!` };
  if (days >= 60) return { title: '🔥 60-Day Streak!', message: `${days} days and counting!` };
  if (days >= 30) return { title: '⭐ 30-Day Streak!', message: 'A full month of daily play!' };
  if (days >= 14) return { title: '🔥 14-Day Streak!', message: 'Two weeks of consistency!' };
  if (days >= 7) return { title: '⭐ 7-Day Streak!', message: 'A full week streak — nice!' };
  return { title: '🔥 3-Day Streak!', message: 'You\'re building momentum!' };
}

export function onStreakMilestone(wire: NotifEventWire, streakDays: number): void {
  if (!wire.settings.enabled || !wire.settings.showStreaks) return;
  if (!STREAK_MILESTONES.has(streakDays)) return;

  const { title, message } = streakMessage(streakDays);
  pushQuick(wire.queue, 'success', title, message);
  trackPush(wire, 'streak');
  syncActiveList(wire);
}

// ── 8. Daily Challenge Complete ───────────────────────────────────────────────

export function onDailyChallengeComplete(wire: NotifEventWire, score: number): void {
  if (!wire.settings.enabled || !wire.settings.showChallenges) return;

  pushQuick(
    wire.queue,
    'challenge',
    '🎯 Daily Challenge Complete!',
    `Score: ${score.toLocaleString()} — come back tomorrow!`,
  );
  trackPush(wire, 'challenge');
  syncActiveList(wire);
}

// ── 9. New Word Discovered ────────────────────────────────────────────────────

export function onNewWordDiscovered(wire: NotifEventWire, word: string): void {
  if (!wire.settings.enabled) return;

  pushQuick(
    wire.queue,
    'info',
    `📖 New Word: ${word}`,
    'Added to your collection!',
  );
  trackPush(wire, 'new_word');
  syncActiveList(wire);
}

// ── 10. Boss Defeated ─────────────────────────────────────────────────────────

export function onBossDefeated(wire: NotifEventWire, bossWord: string): void {
  if (!wire.settings.enabled) return;

  pushNotification(wire.queue, {
    type: 'achievement',
    title: `👑 Boss Defeated: ${bossWord}`,
    message: 'Victory is yours — well played!',
    priority: 10,
    duration: 5000,
    icon: '👑',
  });
  trackPush(wire, 'boss');
  syncActiveList(wire);
}

// ── 11. XP Bonus ──────────────────────────────────────────────────────────────

export function onXPBonus(wire: NotifEventWire, amount: number, source: string): void {
  if (!wire.settings.enabled) return;

  pushQuick(
    wire.queue,
    'info',
    `✨ +${amount} XP`,
    `Earned from ${source}`,
  );
  trackPush(wire, 'xp_bonus');
  syncActiveList(wire);
}

// ── 12. Game Complete ─────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function onGameComplete(wire: NotifEventWire, score: number, timeSec: number): void {
  if (!wire.settings.enabled) return;

  pushNotification(wire.queue, {
    type: 'success',
    title: '🎊 Game Complete!',
    message: `Score: ${score.toLocaleString()} in ${formatTime(timeSec)}`,
    priority: 7,
    duration: 5000,
  });
  trackPush(wire, 'game_complete');
  syncActiveList(wire);
}

// ── 13. Speed Record ──────────────────────────────────────────────────────────

export function onSpeedRecord(wire: NotifEventWire, type: string, value: string): void {
  if (!wire.settings.enabled) return;

  pushNotification(wire.queue, {
    type: 'achievement',
    title: `⚡ New Speed Record!`,
    message: `${type}: ${value}`,
    priority: 9,
    duration: 4500,
    icon: '⚡',
  });
  trackPush(wire, 'speed_record');
  syncActiveList(wire);
}

// ── 14. Get Active Notifications ──────────────────────────────────────────────

export function getActiveNotifications(wire: NotifEventWire): Notification[] {
  syncActiveList(wire);
  return wire.activeNotifications.slice(0, wire.settings.maxVisible);
}

// ── 15. Dismiss Notification ──────────────────────────────────────────────────

export function dismissNotification(wire: NotifEventWire, id: string): boolean {
  const existed = getActive(wire.queue)?.id === id
    || wire.queue.queue.some((n) => n.id === id);

  if (existed) {
    dismissByIdFromManager(wire.queue, id);
    wire._stats.totalDismissed++;
    syncActiveList(wire);
  }
  return existed;
}

// ── 16. Dismiss All ───────────────────────────────────────────────────────────

export function dismissAll(wire: NotifEventWire): void {
  const count = wire.activeNotifications.length + wire.queue.queue.length;
  wire._stats.totalDismissed += count;

  dismissAllFromManager(wire.queue);
  wire.activeNotifications = [];
}

// ── 17. Update Cooldowns ──────────────────────────────────────────────────────

export function updateCooldowns(wire: NotifEventWire): void {
  const now = Date.now();
  for (const [key, expiry] of wire.cooldowns) {
    if (now >= expiry) wire.cooldowns.delete(key);
  }
}

// ── 18. Toggle Setting ────────────────────────────────────────────────────────

type ToggleableSetting = keyof Pick<
  NotifEventWireSettings,
  'enabled' | 'showAchievements' | 'showCombos' | 'showPowerUps'
  | 'showChallenges' | 'showLevelUps' | 'showStreaks' | 'soundEnabled'
>;

export function toggleSetting(wire: NotifEventWire, setting: ToggleableSetting): void {
  wire.settings[setting] = !wire.settings[setting];
}

// ── 19. Get Settings ──────────────────────────────────────────────────────────

export function getSettings(wire: NotifEventWire): Readonly<NotifEventWireSettings> {
  return wire.settings;
}

// ── 20. Get Stats ─────────────────────────────────────────────────────────────

export function getNotifStats(wire: NotifEventWire): NotifStats {
  return { ...wire._stats, byType: { ...wire._stats.byType } };
}
