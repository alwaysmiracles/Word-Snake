'use client'

import { gameEvents, getEventHistory, type GameHookEvent, type GameEventPayload } from './game-event-hooks'

export type EventAnalytics = {
  totalEvents: number
  eventsPerType: Record<string, number>
  eventsPerMinute: number
  sessionDuration: number
  topEvents: Array<{ event: string; count: number; percent: number }>
  eventTimeline: Array<{ minute: number; count: number }>
  categoryBreakdown: Record<string, number>
  peakActivityMinute: number
  averageEventsPerMinute: number
  recentActivity: 'idle' | 'low' | 'moderate' | 'high' | 'intense'
}

export type AnalyticsSnapshot = {
  timestamp: number
  analytics: EventAnalytics
}

export type EventCategory = 'game' | 'word' | 'score' | 'powerup' | 'combat' | 'social' | 'system' | 'collection'

export const EVENT_CATEGORIES: Record<string, EventCategory> = {
  'game:start': 'game', 'game:end': 'game', 'game:pause': 'game', 'game:resume': 'game',
  'word:eat': 'word', 'word:spawn': 'word', 'word:rare': 'word', 'word:legendary': 'word',
  'score:change': 'score',
  'combo:start': 'score', 'combo:end': 'score', 'combo:increase': 'score',
  'powerup:spawn': 'powerup', 'powerup:collect': 'powerup', 'powerup:activate': 'powerup', 'powerup:expire': 'powerup',
  'obstacle:spawn': 'combat', 'obstacle:hit': 'combat', 'obstacle:destroy': 'combat',
  'boss:appear': 'combat', 'boss:hit': 'combat', 'boss:defeat': 'combat',
  'quiz:show': 'system', 'quiz:correct': 'system', 'quiz:wrong': 'system',
  'achievement:unlock': 'collection',
  'coin:earn': 'collection', 'coin:spend': 'collection',
  'weather:change': 'system', 'difficulty:change': 'system',
  'skin:change': 'social', 'theme:change': 'social',
  'easter:egg': 'collection',
  'pvp:start': 'game', 'pvp:end': 'game',
  'daily:start': 'game', 'daily:complete': 'collection',
}

const CATEGORY_EMOJI: Record<EventCategory, string> = {
  game: '\u{1F3AE}',
  word: '\u{1F4DD}',
  score: '\u{1F3C6}',
  powerup: '\u26A1',
  combat: '\u2694\uFE0F',
  social: '\u{1F465}',
  system: '\u2699\uFE0F',
  collection: '\u{1F4E6}',
}

const SPARKLINE_BLOCKS = '\u2591\u2581\u2582\u2583\u2585\u2587\u2588'

export function getActivityLevel(
  count: number,
): 'idle' | 'low' | 'moderate' | 'high' | 'intense' {
  if (count === 0) return 'idle'
  if (count <= 3) return 'low'
  if (count <= 8) return 'moderate'
  if (count <= 15) return 'high'
  return 'intense'
}

export function getCategoryEmoji(category: EventCategory): string {
  return CATEGORY_EMOJI[category] ?? '\u2753'
}

/** Compute a full analytics snapshot from the in-memory event bus history. */
export function calculateAnalytics(): EventAnalytics {
  const history = getEventHistory()
  const totalEvents = history.length

  // Per-type counts
  const eventsPerType: Record<string, number> = {}
  for (const payload of history) {
    eventsPerType[payload.type] = (eventsPerType[payload.type] ?? 0) + 1
  }

  // Session duration (ms) — time span from first to last event, or 0
  let sessionDuration = 0
  if (totalEvents >= 2) {
    sessionDuration = history[totalEvents - 1].timestamp - history[0].timestamp
  }

  // Events per minute (avoid division by zero)
  const sessionMinutes = sessionDuration / 60_000 || 1
  const eventsPerMinute = totalEvents / sessionMinutes

  // Top events sorted by count descending, top 5
  const sorted = Object.entries(eventsPerType).sort((a, b) => b[1] - a[1])
  const topEvents = sorted.slice(0, 5).map(([event, count]) => ({
    event,
    count,
    percent: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
  }))

  // Event timeline — bucket into per-minute windows
  const timeline: Array<{ minute: number; count: number }> = []
  if (totalEvents > 0 && sessionDuration > 0) {
    const totalMinutes = Math.ceil(sessionDuration / 60_000)
    const buckets = new Array(totalMinutes).fill(0)
    for (const payload of history) {
      const minuteOffset = Math.floor((payload.timestamp - history[0].timestamp) / 60_000)
      if (minuteOffset < buckets.length) buckets[minuteOffset]++
    }
    for (let i = 0; i < buckets.length; i++) {
      timeline.push({ minute: i, count: buckets[i] })
    }
  }

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {}
  for (const payload of history) {
    const cat = EVENT_CATEGORIES[payload.type] ?? 'system'
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + 1
  }

  // Peak activity minute
  let peakActivityMinute = 0
  let peakCount = 0
  for (const entry of timeline) {
    if (entry.count > peakCount) {
      peakCount = entry.count
      peakActivityMinute = entry.minute
    }
  }

  // Average events per minute across the timeline
  const averageEventsPerMinute =
    timeline.length > 0
      ? timeline.reduce((sum, t) => sum + t.count, 0) / timeline.length
      : 0

  // Recent activity — events in the last 30 seconds
  const now = Date.now()
  const recentWindowStart = now - 30_000
  const recentCount = history.filter((p) => p.timestamp >= recentWindowStart).length
  const recentActivity = getActivityLevel(recentCount)

  return {
    totalEvents,
    eventsPerType,
    eventsPerMinute: Math.round(eventsPerMinute * 100) / 100,
    sessionDuration,
    topEvents,
    eventTimeline: timeline,
    categoryBreakdown,
    peakActivityMinute,
    averageEventsPerMinute: Math.round(averageEventsPerMinute * 100) / 100,
    recentActivity,
  }
}

/** One-line human-readable summary, e.g. "47 events in 3:24 — mostly word events (62%)" */
export function getAnalyticsSummary(): string {
  const a = calculateAnalytics()
  if (a.totalEvents === 0) return 'No events recorded yet'

  const minutes = Math.floor(a.sessionDuration / 60_000)
  const seconds = Math.floor((a.sessionDuration % 60_000) / 1000)
  const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`

  // Find the dominant category
  const dominant = Object.entries(a.categoryBreakdown).sort((a, b) => b[1] - a[1])[0]
  if (!dominant) return `${a.totalEvents} events in ${durationStr}`

  const [cat, count] = dominant
  const percent = Math.round((count / a.totalEvents) * 100)
  const emoji = getCategoryEmoji(cat as EventCategory)

  return `${a.totalEvents} events in ${durationStr} \u2014 mostly ${emoji} ${cat} events (${percent}%)`
}

/** Render a mini sparkline string from a timeline. Uses Unicode block chars: ░▁▂▃▅▇█ */
export function formatEventTimeline(
  timeline: Array<{ minute: number; count: number }>,
): string {
  if (timeline.length === 0) return '\u2591'

  const maxCount = Math.max(...timeline.map((t) => t.count), 1)
  const blockCount = SPARKLINE_BLOCKS.length // 7 blocks

  let result = ''
  for (const entry of timeline) {
    const level = Math.round((entry.count / maxCount) * (blockCount - 1))
    result += SPARKLINE_BLOCKS[Math.min(level, blockCount - 1)]
  }
  return result
}

/** Capture a timestamped analytics snapshot. */
export function createAnalyticsSnapshot(): AnalyticsSnapshot {
  return {
    timestamp: Date.now(),
    analytics: calculateAnalytics(),
  }
}

export function getSnapshotAge(snapshot: AnalyticsSnapshot): string {
  const elapsed = Date.now() - snapshot.timestamp
  const seconds = Math.floor(elapsed / 1000)

  if (seconds < 60) return `${seconds} seconds ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 minute ago'
  return `${minutes} minutes ago`
}
