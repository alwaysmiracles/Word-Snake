'use client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PersistentEvent {
  id: string;
  type: string;
  message: string;
  emoji: string | undefined;
  color: string | undefined;
  timestamp: number;
  gameId: string;
}

export interface EventFeedSettings {
  maxPersistentEvents: number;
  persistAcrossSessions: boolean;
  showHistory: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'word-snake-event-history';
const SETTINGS_KEY = 'word-snake-event-feed-settings';

const DEFAULT_SETTINGS: EventFeedSettings = {
  maxPersistentEvents: 50,
  persistAcrossSessions: true,
  showHistory: true,
};

// ─── Internal Helpers ─────────────────────────────────────────────────────────

const isBrowser = () => typeof window !== 'undefined';
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function readStorage(): PersistentEvent[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(events: PersistentEvent[]): void {
  if (!isBrowser()) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch { /* noop */ }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function getEventFeedSettings(): EventFeedSettings {
  if (!isBrowser()) return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveEventFeedSettings(settings: EventFeedSettings): void {
  if (!isBrowser()) return;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* noop */ }
}

// ─── Event History ────────────────────────────────────────────────────────────

/** Append a new event to persistent storage with an auto-generated unique ID. */
export function saveEventToHistory(
  event: Omit<PersistentEvent, 'id'>,
): PersistentEvent {
  const settings = getEventFeedSettings();
  const stored: PersistentEvent = { ...event, id: generateId() };
  if (!settings.persistAcrossSessions) return stored;

  const all = readStorage();
  all.push(stored);
  while (all.length > settings.maxPersistentEvents) all.shift();
  writeStorage(all);
  return stored;
}

/** Retrieve recent events, newest first. Optionally cap with `limit`. */
export function getEventHistory(limit?: number): PersistentEvent[] {
  const sorted = [...readStorage()].sort((a, b) => b.timestamp - a.timestamp);
  return limit ? sorted.slice(0, limit) : sorted;
}

/** Remove all persistent events. */
export function clearEventHistory(): void {
  if (isBrowser()) localStorage.removeItem(STORAGE_KEY);
}

/** Return the total number of stored events. */
export function getEventHistoryCount(): number {
  return readStorage().length;
}

/** Return events belonging to a specific game session (newest first). */
export function getEventsForGame(gameId: string): PersistentEvent[] {
  return readStorage()
    .filter((e) => e.gameId === gameId)
    .sort((a, b) => b.timestamp - a.timestamp);
}

/** Merge persistent history with live in-session events, deduplicate, newest-first. */
export function mergeWithLiveEvents(
  persistentEvents: PersistentEvent[],
  liveEvents: { type: string; message: string; timestamp: number }[],
  limit?: number,
): PersistentEvent[] {
  const seen = new Set<string>();
  const makeKey = (e: { type: string; message: string; timestamp: number }) =>
    `${e.timestamp}:${e.type}:${e.message}`;
  const merged: PersistentEvent[] = [];

  for (const live of liveEvents) {
    const k = makeKey(live);
    if (!seen.has(k)) { seen.add(k); merged.push(live as PersistentEvent); }
  }
  for (const stored of persistentEvents) {
    const k = makeKey(stored);
    if (!seen.has(k)) { seen.add(k); merged.push(stored); }
  }

  merged.sort((a, b) => b.timestamp - a.timestamp);
  return limit ? merged.slice(0, limit) : merged;
}
