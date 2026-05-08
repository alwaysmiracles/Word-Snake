// Achievement Queue — manages sequential display of achievement notifications
// Stub implementation for integration with game-stats agent

export interface AchievementNotification {
  title: string
  description: string
  emoji: string
}

export class AchievementQueue {
  private queue: AchievementNotification[] = []

  enqueue(notification: AchievementNotification): void {
    this.queue.push(notification)
  }

  dequeue(): AchievementNotification | undefined {
    return this.queue.shift()
  }

  get size(): number {
    return this.queue.length
  }

  isEmpty(): boolean {
    return this.queue.length === 0
  }

  clear(): void {
    this.queue = []
  }

  peek(): AchievementNotification | undefined {
    return this.queue[0]
  }
}
