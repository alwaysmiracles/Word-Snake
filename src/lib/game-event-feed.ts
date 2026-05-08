'use client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GameEvent {
  id: number;
  type: string;
  message: string;
  emoji: string;
  color: string;
  timestamp: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface GameEventFeedConfig {
  maxEvents: number;
}

export interface GameEventFeed {
  events: GameEvent[];
  config: GameEventFeedConfig;
  nextId: number;
}

// ─── Event Style Definitions ─────────────────────────────────────────────────

export const EVENT_STYLES: Record<
  string,
  { emoji: string; color: string; label: string }
> = {
  word_eaten: { emoji: '📝', color: '#22c55e', label: 'Word Eaten' },
  combo: { emoji: '🔥', color: '#f97316', label: 'Combo' },
  powerup: { emoji: '⚡', color: '#3b82f6', label: 'Power-Up' },
  boss_hit: { emoji: '💥', color: '#ef4444', label: 'Boss Hit' },
  quiz_correct: { emoji: '🎯', color: '#a855f7', label: 'Quiz' },
  achievement: { emoji: '🏆', color: '#eab308', label: 'Achievement' },
  obstacle_hit: { emoji: '🧱', color: '#94a3b8', label: 'Obstacle' },
  portal_teleport: { emoji: '🌀', color: '#06b6d4', label: 'Portal' },
  coin_earned: { emoji: '🪙', color: '#fbbf24', label: 'Coins' },
  scramble_complete: { emoji: '🔤', color: '#10b981', label: 'Scramble' },
  death: { emoji: '💀', color: '#ef4444', label: 'Game Over' },
  level_up: { emoji: '📈', color: '#8b5cf6', label: 'Level Up' },
  weather: { emoji: '🌦️', color: '#60a5fa', label: 'Weather' },
  shop: { emoji: '🛒', color: '#f472b6', label: 'Shop' },
  pvp: { emoji: '⚔️', color: '#fb923c', label: 'PvP' },
  streak: { emoji: '🔥', color: '#f59e0b', label: 'Streak' },
  easter_egg: { emoji: '🥚', color: '#c084fc', label: 'Easter Egg' },
};

// ─── Priority Mappings ───────────────────────────────────────────────────────

const TYPE_PRIORITY: Record<string, GameEvent['priority']> = {
  word_eaten: 'low',
  combo: 'normal',
  powerup: 'high',
  boss_hit: 'high',
  quiz_correct: 'normal',
  achievement: 'high',
  obstacle_hit: 'low',
  portal_teleport: 'normal',
  coin_earned: 'low',
  scramble_complete: 'normal',
  death: 'critical',
  level_up: 'high',
  weather: 'low',
  shop: 'normal',
  pvp: 'high',
  streak: 'normal',
  easter_egg: 'normal',
};

// ─── Event Feed Creation ─────────────────────────────────────────────────────

/**
 * Creates a new GameEventFeed instance.
 * @param maxEvents Maximum number of events to retain (default 50).
 */
export function createEventFeed(maxEvents: number = 50): GameEventFeed {
  return {
    events: [],
    config: { maxEvents },
    nextId: 1,
  };
}

// ─── Event Management ────────────────────────────────────────────────────────

/**
 * Adds an event to the feed. Style properties (emoji, color) are resolved
 * from EVENT_STYLES if not explicitly provided.
 */
export function addEvent(
  feed: GameEventFeed,
  event: Omit<GameEvent, 'id' | 'timestamp'> & { timestamp?: number },
): GameEvent {
  const style = EVENT_STYLES[event.type];

  const fullEvent: GameEvent = {
    id: feed.nextId++,
    type: event.type,
    message: event.message,
    emoji: event.emoji ?? style?.emoji ?? '🎮',
    color: event.color ?? style?.color ?? '#ffffff',
    timestamp: event.timestamp ?? Date.now(),
    priority: event.priority ?? TYPE_PRIORITY[event.type] ?? 'normal',
  };

  feed.events.push(fullEvent);

  // Evict oldest events when the feed exceeds maxEvents
  while (feed.events.length > feed.config.maxEvents) {
    feed.events.shift();
  }

  return fullEvent;
}

/**
 * Returns all events currently in the feed.
 */
export function getEvents(feed: GameEventFeed): GameEvent[] {
  return feed.events;
}

/**
 * Returns the most recent N events from the feed (default 10).
 */
export function getRecentEvents(
  feed: GameEventFeed,
  count: number = 10,
): GameEvent[] {
  return feed.events.slice(-count);
}

/**
 * Removes all events from the feed and resets the ID counter.
 */
export function clearEvents(feed: GameEventFeed): void {
  feed.events = [];
  feed.nextId = 1;
}
