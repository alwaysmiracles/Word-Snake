export type NotificationType =
  | 'info' | 'success' | 'warning' | 'error'
  | 'achievement' | 'combo' | 'powerup' | 'challenge';

export interface Notification {
  id: string; type: NotificationType; title: string; message: string;
  duration: number; priority: number; dismissible: boolean;
  icon: string; color: string; timestamp: number;
  dismissed: boolean; shownAt: number | null;
}

export interface NotificationQueue {
  active: Notification | null; queue: Notification[]; history: Notification[];
  maxSize: number; maxHistory: number; paused: boolean;
  defaultDuration: number; onShow: ((notification: Notification) => void) | null;
  _timerId: ReturnType<typeof setTimeout> | null; _counter: number;
}

export interface TypeConfig { icon: string; color: string; defaultDuration: number; }

export interface NotificationStats {
  totalPushed: number; totalDismissed: number;
  avgDuration: number; typeBreakdown: Record<NotificationType, number>;
}

// ── Type Configs ─────────────────────────────────────────────────────────────

const TYPE_CONFIGS: Record<NotificationType, TypeConfig> = {
  info:        { icon: 'ℹ️', color: '#3b82f6', defaultDuration: 3000 },
  success:     { icon: '✅', color: '#22c55e', defaultDuration: 2500 },
  warning:     { icon: '⚠️', color: '#f59e0b', defaultDuration: 4000 },
  error:       { icon: '❌', color: '#ef4444', defaultDuration: 5000 },
  achievement: { icon: '🏆', color: '#eab308', defaultDuration: 4000 },
  combo:       { icon: '🔥', color: '#f97316', defaultDuration: 2000 },
  powerup:     { icon: '⚡', color: '#06b6d4', defaultDuration: 2000 },
  challenge:   { icon: '🎯', color: '#a855f7', defaultDuration: 3500 },
};

export function getTypeConfig(type: NotificationType): TypeConfig {
  return TYPE_CONFIGS[type];
}

// ── ID Generation ────────────────────────────────────────────────────────────

let globalCounter = 0;

function generateId(): string {
  return `notif-${Date.now()}-${++globalCounter}`;
}

// ── Queue Factory ────────────────────────────────────────────────────────────

export function createNotificationQueue(
  config?: Partial<Pick<NotificationQueue,
    'maxSize' | 'maxHistory' | 'defaultDuration' | 'onShow'>>,
): NotificationQueue {
  return {
    active: null, queue: [], history: [],
    maxSize: config?.maxSize ?? 5, maxHistory: config?.maxHistory ?? 50,
    paused: false, defaultDuration: config?.defaultDuration ?? 3000,
    onShow: config?.onShow ?? null, _timerId: null, _counter: 0,
  };
}

// ── Timer Management ─────────────────────────────────────────────────────────

function clearTimer(q: NotificationQueue): void {
  if (q._timerId !== null) { clearTimeout(q._timerId); q._timerId = null; }
}

function startAutoDismiss(q: NotificationQueue): void {
  clearTimer(q);
  if (!q.active || q.active.duration <= 0) return;
  q._timerId = setTimeout(() => { q._timerId = null; dismissActive(q); }, q.active.duration);
}

// ── Push ─────────────────────────────────────────────────────────────────────

export function pushNotification(
  queue: NotificationQueue,
  notification: Partial<Notification> & { title: string; message: string },
): string {
  const tc = getTypeConfig(notification.type ?? 'info');
  const full: Notification = {
    id: notification.id ?? generateId(),
    type: notification.type ?? 'info',
    title: notification.title, message: notification.message,
    duration: notification.duration ?? tc.defaultDuration,
    priority: Math.max(1, Math.min(10, notification.priority ?? 5)),
    dismissible: notification.dismissible ?? true,
    icon: notification.icon ?? tc.icon, color: notification.color ?? tc.color,
    timestamp: Date.now(), dismissed: false, shownAt: null,
  };
  queue._counter++;
  if (queue.queue.length >= queue.maxSize) queue.queue.pop();
  queue.queue.push(full);
  queue.queue.sort((a, b) => b.priority - a.priority);
  processQueue(queue);
  return full.id;
}

export function pushQuick(
  queue: NotificationQueue, type: NotificationType,
  title: string, message: string,
): string {
  return pushNotification(queue, { type, title, message });
}

// ── Dismiss ──────────────────────────────────────────────────────────────────

function archiveActive(q: NotificationQueue): void {
  q.active!.dismissed = true;
  if (q.active!.shownAt !== null) {
    q.history.unshift(q.active!);
    if (q.history.length > q.maxHistory) q.history.length = q.maxHistory;
  }
  q.active = null;
}

export function dismissActive(q: NotificationQueue): void {
  if (!q.active) return;
  clearTimer(q);
  archiveActive(q);
  processQueue(q);
}

export function dismissById(q: NotificationQueue, id: string): boolean {
  if (q.active && q.active.id === id) { dismissActive(q); return true; }
  const idx = q.queue.findIndex((n) => n.id === id);
  if (idx !== -1) {
    q.queue[idx].dismissed = true;
    q.queue.splice(idx, 1);
    return true;
  }
  const hIdx = q.history.findIndex((n) => n.id === id);
  if (hIdx !== -1) { q.history[hIdx].dismissed = true; return true; }
  return false;
}

export function dismissAll(q: NotificationQueue): void {
  clearTimer(q);
  if (q.active) archiveActive(q);
  for (const n of q.queue) n.dismissed = true;
  q.queue.length = 0;
}

// ── Process Queue ────────────────────────────────────────────────────────────

export function processQueue(q: NotificationQueue): void {
  if (q.paused || q.active || q.queue.length === 0) return;
  const next = q.queue.shift()!;
  next.shownAt = Date.now();
  q.active = next;
  q.onShow?.(next);
  startAutoDismiss(q);
}

// ── Accessors ────────────────────────────────────────────────────────────────

export function getActive(q: NotificationQueue): Notification | null { return q.active; }
export function getQueue(q: NotificationQueue): Notification[] { return [...q.queue]; }
export function getHistory(q: NotificationQueue): Notification[] { return [...q.history]; }
export function clearHistory(q: NotificationQueue): void { q.history.length = 0; }

// ── Pause / Resume ───────────────────────────────────────────────────────────

export function pauseQueue(q: NotificationQueue): void { q.paused = true; clearTimer(q); }

export function resumeQueue(q: NotificationQueue): void {
  if (!q.paused) return;
  q.paused = false;
  processQueue(q);
}

// ── Stats ────────────────────────────────────────────────────────────────────

const ALL_TYPES: NotificationType[] = [
  'info', 'success', 'warning', 'error',
  'achievement', 'combo', 'powerup', 'challenge',
];

export function getNotificationStats(q: NotificationQueue): NotificationStats {
  const all = [...q.history, q.active].filter(Boolean) as Notification[];
  const totalPushed = q._counter;
  const totalDismissed = all.filter((n) => n.dismissed).length;
  const durations = all
    .filter((n) => n.shownAt !== null && n.dismissed)
    .map((n) => n.timestamp + n.duration - n.shownAt!);
  const avgDuration = durations.length
    ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;
  const typeBreakdown = {} as Record<NotificationType, number>;
  for (const t of ALL_TYPES) typeBreakdown[t] = all.filter((n) => n.type === t).length;
  return { totalPushed, totalDismissed, avgDuration, typeBreakdown };
}

// ── Time Formatting ──────────────────────────────────────────────────────────

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 0) return 'just now';
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Preset Factories ─────────────────────────────────────────────────────────

export function createAchievementNotification(
  title: string, description: string,
): Partial<Notification> & { title: string; message: string } {
  return {
    type: 'achievement', title: `🏆 ${title}`, message: description,
    priority: 8, duration: 4500, dismissible: true,
  };
}

export function createComboNotification(
  combo: number, points: number,
): Partial<Notification> & { title: string; message: string } {
  return {
    type: 'combo', title: `${combo}x Combo!`, message: `+${points} points earned`,
    priority: Math.min(10, 4 + combo), duration: 1800, dismissible: false,
  };
}
