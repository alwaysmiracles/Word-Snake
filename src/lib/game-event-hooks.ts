'use client'

export type GameHookEvent =
  | 'game:start' | 'game:end' | 'game:pause' | 'game:resume'
  | 'word:eat' | 'word:spawn' | 'word:rare' | 'word:legendary'
  | 'score:change' | 'combo:start' | 'combo:end' | 'combo:increase'
  | 'powerup:spawn' | 'powerup:collect' | 'powerup:activate' | 'powerup:expire'
  | 'obstacle:spawn' | 'obstacle:hit' | 'obstacle:destroy'
  | 'portal:enter' | 'portal:exit'
  | 'boss:appear' | 'boss:hit' | 'boss:defeat'
  | 'quiz:show' | 'quiz:correct' | 'quiz:wrong'
  | 'achievement:unlock'
  | 'coin:earn' | 'coin:spend'
  | 'weather:change' | 'difficulty:change'
  | 'skin:change' | 'theme:change'
  | 'easter:egg'
  | 'pvp:start' | 'pvp:end'
  | 'daily:start' | 'daily:complete'

export type GameEventPayload = {
  type: GameHookEvent
  timestamp: number
  data: Record<string, unknown>
}

export type EventSubscriber = (payload: GameEventPayload) => void

export type SubscriptionHandle = {
  event: GameHookEvent | '*'
  id: string
  unsubscribe: () => void
}

export type EventHandlerOptions = {
  once?: boolean        // auto-unsubscribe after first call
  priority?: number     // lower = earlier execution (default 10)
  filter?: (payload: GameEventPayload) => boolean
}

type SubscriberRecord = {
  id: string
  handler: EventSubscriber
  priority: number
  once: boolean
  filter?: (p: GameEventPayload) => boolean
}

let _nextId = 0
function uniqueId(): string {
  return `gev_${++_nextId}`
}

class GameEventBus {
  private subscribers: Map<string, SubscriberRecord[]>
  private history: GameEventPayload[]
  private maxHistory: number

  constructor(maxHistory = 100) {
    this.subscribers = new Map()
    this.history = []
    this.maxHistory = maxHistory
  }

  subscribe(
    event: GameHookEvent | '*',
    handler: EventSubscriber,
    options?: EventHandlerOptions,
  ): SubscriptionHandle {
    const id = uniqueId()
    const record: SubscriberRecord = {
      id,
      handler,
      priority: options?.priority ?? 10,
      once: options?.once ?? false,
      filter: options?.filter,
    }
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, [])
    }
    const list = this.subscribers.get(event)!
    list.push(record)
    list.sort((a, b) => a.priority - b.priority)

    return { event, id, unsubscribe: () => this.unsubscribe(id) }
  }

  emit(event: GameHookEvent, data?: Record<string, unknown>): void {
    const payload: GameEventPayload = {
      type: event,
      timestamp: Date.now(),
      data: data ?? {},
    }
    // Cap history
    this.history.push(payload)
    if (this.history.length > this.maxHistory) this.history.shift()

    // Gather subscriber lists (specific + wildcard)
    const lists: SubscriberRecord[][] = []
    const specific = this.subscribers.get(event)
    if (specific) lists.push(specific)
    const wildcard = this.subscribers.get('*')
    if (wildcard) lists.push(wildcard)

    const toRemove: { key: string; id: string }[] = []
    for (const l of lists) {
      for (const record of l) {
        if (record.filter && !record.filter(payload)) continue
        record.handler(payload)
        if (record.once) {
          toRemove.push({ key: specific?.includes(record) ? event : '*', id: record.id })
        }
      }
    }
    for (const { key, id } of toRemove) {
      const l = this.subscribers.get(key)
      if (l) {
        const idx = l.findIndex((r) => r.id === id)
        if (idx !== -1) l.splice(idx, 1)
      }
    }
  }

  unsubscribe(handleId: string): void {
    for (const [event, list] of this.subscribers.entries()) {
      const idx = list.findIndex((r) => r.id === handleId)
      if (idx !== -1) {
        list.splice(idx, 1)
        if (list.length === 0) this.subscribers.delete(event)
        return
      }
    }
  }

  getHistory(event?: GameHookEvent): GameEventPayload[] {
    if (!event) return [...this.history]
    return this.history.filter((p) => p.type === event)
  }

  getEventCount(event: GameHookEvent): number {
    return this.history.filter((p) => p.type === event).length
  }

  clearHistory(): void { this.history = [] }

  clearAll(): void {
    this.history = []
    this.subscribers.clear()
  }
}

// Singleton
export const gameEvents = new GameEventBus(100)

// Convenience subscribe helpers

export function onGameStart(handler: EventSubscriber, options?: EventHandlerOptions): SubscriptionHandle {
  return gameEvents.subscribe('game:start', handler, options)
}
export function onGameEnd(handler: EventSubscriber, options?: EventHandlerOptions): SubscriptionHandle {
  return gameEvents.subscribe('game:end', handler, options)
}
export function onWordEat(handler: EventSubscriber, options?: EventHandlerOptions): SubscriptionHandle {
  return gameEvents.subscribe('word:eat', handler, options)
}
export function onScoreChange(handler: EventSubscriber, options?: EventHandlerOptions): SubscriptionHandle {
  return gameEvents.subscribe('score:change', handler, options)
}
export function onComboChange(handler: EventSubscriber, options?: EventHandlerOptions): SubscriptionHandle {
  return gameEvents.subscribe('combo:increase', handler, options)
}
export function onPowerUp(handler: EventSubscriber, options?: EventHandlerOptions): SubscriptionHandle {
  return gameEvents.subscribe('powerup:collect', handler, options)
}
export function onAchievement(handler: EventSubscriber, options?: EventHandlerOptions): SubscriptionHandle {
  return gameEvents.subscribe('achievement:unlock', handler, options)
}
export function onAnyEvent(handler: EventSubscriber, options?: EventHandlerOptions): SubscriptionHandle {
  return gameEvents.subscribe('*', handler, options)
}

// Shorthands

export function emitGameEvent(event: GameHookEvent, data?: Record<string, unknown>): void {
  gameEvents.emit(event, data)
}

export function getEventHistory(event?: GameHookEvent): GameEventPayload[] {
  return gameEvents.getHistory(event)
}

// Utility factories

export function createEventCounter(
  events: GameHookEvent[],
): () => Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(events.map((e) => [e, 0]))
  for (const event of events) {
    gameEvents.subscribe(event, () => {
      counts[event] = (counts[event] ?? 0) + 1
    })
  }
  return () => ({ ...counts })
}

export function createEventTimer(
  event: GameHookEvent,
): { start: () => void; elapsed: () => number; stop: () => number } {
  let startTime: number | null = null
  let endTime: number | null = null
  let handle: SubscriptionHandle | null = null

  return {
    start() {
      startTime = performance.now()
      endTime = null
      handle = gameEvents.subscribe(event, () => {
        endTime = performance.now()
        handle?.unsubscribe()
        handle = null
      }, { once: true })
    },
    elapsed() {
      if (startTime === null) return 0
      return (endTime ?? performance.now()) - startTime
    },
    stop() {
      const e = this.elapsed()
      handle?.unsubscribe()
      handle = null
      startTime = null
      endTime = null
      return e
    },
  }
}
