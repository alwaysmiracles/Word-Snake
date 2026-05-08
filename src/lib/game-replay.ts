// Game Replay System — Record and replay game sessions
// Stores lightweight frame snapshots in localStorage for playback

export interface ReplayFrame {
  tick: number
  snake: { x: number; y: number }[]
  direction: string
  food: { x: number; y: number; word: string } | null
  powerUp: { x: number; y: number; type: string; emoji: string } | null
  score: number
  wordsEaten: string[]
  comboCount: number
  event?: 'eat_word' | 'power_up' | 'death' | 'combo' | 'easter_egg' | 'rarity'
  eventData?: Record<string, unknown>
}

export interface GameReplay {
  id: string
  date: string
  difficulty: string
  finalScore: number
  wordsCollected: string[]
  totalWordsEaten: number
  duration: number
  maxCombo: number
  isDailyChallenge: boolean
  weather: string
  wordPack: string
  frameCount: number
  frames: ReplayFrame[]
}

const STORAGE_KEY = 'word-snake-replays'
const MAX_REPLAYS = 10
const RECORD_INTERVAL = 3 // Record every Nth tick

let currentRecording: {
  startTime: number
  frames: ReplayFrame[]
  tickCount: number
  wordsCollected: string[]
  maxCombo: number
} | null = null

let currentPlayback: {
  replay: GameReplay
  frameIndex: number
  playing: boolean
  speed: number
} | null = null

export function startRecording(): void {
  currentRecording = {
    startTime: Date.now(),
    frames: [],
    tickCount: 0,
    wordsCollected: [],
    maxCombo: 0,
  }
}

export function recordFrame(frame: Omit<ReplayFrame, 'tick'>): void {
  if (!currentRecording) return
  currentRecording.tickCount++
  // Only record every Nth tick to save storage
  if (currentRecording.tickCount % RECORD_INTERVAL !== 0) return
  currentRecording.frames.push({
    tick: currentRecording.tickCount,
    ...frame,
  })
  // Track max combo
  if (frame.comboCount > currentRecording.maxCombo) {
    currentRecording.maxCombo = frame.comboCount
  }
  // Track unique words collected
  if (frame.event === 'eat_word' && frame.eventData?.word) {
    const word = String(frame.eventData.word)
    if (!currentRecording.wordsCollected.includes(word)) {
      currentRecording.wordsCollected.push(word)
    }
  }
}

export function stopRecording(metadata: {
  difficulty: string
  isDailyChallenge: boolean
  weather: string
  wordPack: string
}): GameReplay | null {
  if (!currentRecording) return null
  const lastFrame = currentRecording.frames[currentRecording.frames.length - 1]
  const replay: GameReplay = {
    id: `replay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    difficulty: metadata.difficulty,
    finalScore: lastFrame?.score ?? 0,
    wordsCollected: currentRecording.wordsCollected,
    totalWordsEaten: lastFrame?.wordsEaten.length ?? 0,
    duration: Math.round((Date.now() - currentRecording.startTime) / 1000),
    maxCombo: currentRecording.maxCombo,
    isDailyChallenge: metadata.isDailyChallenge,
    weather: metadata.weather,
    wordPack: metadata.wordPack,
    frameCount: currentRecording.frames.length,
    frames: currentRecording.frames,
  }
  currentRecording = null
  saveReplay(replay)
  return replay
}

export function isRecording(): boolean {
  return currentRecording !== null
}

export function saveReplay(replay: GameReplay): void {
  try {
    const replays = getReplays()
    replays.unshift(replay)
    // Keep only max replays
    while (replays.length > MAX_REPLAYS) {
      replays.pop()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(replays))
  } catch {
    // Storage full, remove oldest and retry
    try {
      const replays = getReplays()
      if (replays.length > 1) {
        replays.pop()
        replays.unshift(replay)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(replays))
      }
    } catch {
      // Give up silently
    }
  }
}

export function getReplays(): GameReplay[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as GameReplay[]
      return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  } catch { /* ignore */ }
  return []
}

export function deleteReplay(id: string): void {
  const replays = getReplays().filter(r => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(replays))
}

export function getReplay(id: string): GameReplay | null {
  return getReplays().find(r => r.id === id) ?? null
}

export function clearAllReplays(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// Playback controls
export function startPlayback(replay: GameReplay, speed: number = 1): void {
  currentPlayback = {
    replay,
    frameIndex: 0,
    playing: true,
    speed,
  }
}

export function stopPlayback(): void {
  currentPlayback = null
}

export function getPlaybackState() {
  return currentPlayback
}

export function isPlaybackActive(): boolean {
  return currentPlayback !== null
}

export function advancePlayback(): ReplayFrame | null {
  if (!currentPlayback) return null
  const { replay, frameIndex } = currentPlayback
  if (frameIndex >= replay.frames.length) {
    currentPlayback = null
    return null
  }
  const frame = replay.frames[frameIndex]
  currentPlayback.frameIndex++
  return frame
}

export function setPlaybackSpeed(speed: number): void {
  if (currentPlayback) {
    currentPlayback.speed = speed
  }
}

export function setPlaybackPlaying(playing: boolean): void {
  if (currentPlayback) {
    currentPlayback.playing = playing
  }
}

export function getPlaybackProgress(): number {
  if (!currentPlayback) return 0
  return currentPlayback.replay.frames.length > 0
    ? currentPlayback.frameIndex / currentPlayback.replay.frames.length
    : 0
}

export function seekPlayback(progress: number): void {
  if (!currentPlayback) return
  const idx = Math.floor(progress * currentPlayback.replay.frames.length)
  currentPlayback.frameIndex = Math.max(0, Math.min(idx, currentPlayback.replay.frames.length - 1))
}

export function getReplayStorageUsage(): { used: number; max: number; count: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const used = stored ? new Blob([stored]).size : 0
    // Rough estimate: each frame ~200 bytes, 10 replays * ~200 frames = ~400KB max
    const max = 500 * 1024
    return { used, max, count: getReplays().length }
  } catch {
    return { used: 0, max: 500 * 1024, count: 0 }
  }
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
