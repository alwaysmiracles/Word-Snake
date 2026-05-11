'use client'

// Game Replay Sharing System — Encode, decode, share, and export Word Snake replays
// Supports compact base64 share codes and .wsnake JSON file downloads

import { type GameReplay, type ReplayFrame, getReplays } from './game-replay'

/** Current share code format version */
export const SHARE_CODE_VERSION = '1'

/** Structured metadata for a parsed shared replay */
export interface SharedReplayData {
  id: string
  createdAt: number
  playerScore: number
  wordsEaten: number
  duration: number
  difficulty: string
  frameCount: number
  encodedFrames: string
  checksum: string
}

// ── Checksum ────────────────────────────────────────────────────────────────

/** Sum of char codes mod 256, returned as 2-char lowercase hex */
export function calculateChecksum(data: string): string {
  let sum = 0
  for (let i = 0; i < data.length; i++) sum += data.charCodeAt(i)
  return (sum % 256).toString(16).padStart(2, '0')
}

// ── Frame Encoding / Decoding (7 ASCII chars/frame → base64url) ─────────────
//   direction(1): U/D/L/R | food X(2 hex) | food Y(2 hex) | snake len(2 hex)

const DIR: Record<string, string> = { up: 'U', down: 'D', left: 'L', right: 'R' }
const DIR_REV: Record<string, string> = { U: 'up', D: 'down', L: 'left', R: 'right' }

function encodeFrame(f: ReplayFrame): string {
  const d = DIR[f.direction] ?? 'U'
  const fx = (f.food?.x ?? 0).toString(16).padStart(2, '0')
  const fy = (f.food?.y ?? 0).toString(16).padStart(2, '0')
  const sl = Math.min(f.snake.length, 255).toString(16).padStart(2, '0')
  return d + fx + fy + sl
}

/** Serialize all replay frames to a compact base64url string */
export function encodeReplayToBase64(replay: GameReplay): string {
  const raw = replay.frames.map(encodeFrame).join('')
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Decode a base64url payload back into ReplayFrame stubs (null on invalid) */
export function decodeReplayFromBase64(encoded: string): ReplayFrame[] | null {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4 !== 0) b64 += '='
    const payload = atob(b64)
    if (payload.length % 7 !== 0) return null
    const frames: ReplayFrame[] = []
    for (let i = 0; i < payload.length; i += 7) {
      const dir = DIR_REV[payload[i]]
      if (!dir) return null
      const fx = parseInt(payload.slice(i + 1, i + 3), 16)
      const fy = parseInt(payload.slice(i + 3, i + 5), 16)
      const sl = parseInt(payload.slice(i + 5, i + 7), 16)
      if (isNaN(fx) || isNaN(fy) || isNaN(sl)) return null
      frames.push({
        tick: (i / 7) * 3,
        snake: Array.from({ length: sl }, () => ({ x: 0, y: 0 })),
        direction: dir,
        food: fx === 0 && fy === 0 ? null : { x: fx, y: fy, word: '' },
        powerUp: null, score: 0, wordsEaten: [], comboCount: 0,
      })
    }
    return frames
  } catch { return null }
}

// ── Share Code: WSNAKE-{version}-{encodedData}-{checksum} ──────────────────

/** Generate a full share code string from a complete replay */
export function generateShareCode(replay: GameReplay): string {
  const enc = encodeReplayToBase64(replay)
  return `WSNAKE-${SHARE_CODE_VERSION}-${enc}-${calculateChecksum(enc)}`
}

/** Parse a share code back into structured data (null on invalid / bad checksum) */
export function parseShareCode(code: string): SharedReplayData | null {
  const parts = code.trim().split('-')
  if (parts.length < 4 || parts[0] !== 'WSNAKE') return null
  const [, ver, ...rest] = parts
  if (ver !== SHARE_CODE_VERSION) return null
  const checksum = rest.pop()!
  const encodedFrames = rest.join('-')
  if (calculateChecksum(encodedFrames) !== checksum.toLowerCase()) return null
  const frames = decodeReplayFromBase64(encodedFrames)
  if (!frames) return null
  return {
    id: `shared_${Date.now()}`, createdAt: Date.now(),
    playerScore: 0, wordsEaten: 0, duration: 0, difficulty: 'unknown',
    frameCount: frames.length, encodedFrames, checksum,
  }
}

// ── Clipboard & File I/O ────────────────────────────────────────────────────

/** Copy a share code to the clipboard; returns true on success */
export async function copyShareCodeToClipboard(code: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(code); return true } catch { /* fallback */ }
  try {
    const ta = Object.assign(document.createElement('textarea'),
      { value: code, style: { position: 'fixed', opacity: '0' } })
    document.body.appendChild(ta); ta.select(); document.execCommand('copy')
    document.body.removeChild(ta); return true
  } catch { return false }
}

/** Download a replay as a .wsnake JSON file */
export function downloadReplayFile(replay: GameReplay, filename?: string): void {
  const blob = new Blob([JSON.stringify(replay, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'),
    { href: url, download: filename ?? `replay_${replay.id}.wsnake` })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Read and parse an uploaded .wsnake file (null on failure) */
export async function readReplayFile(file: File): Promise<GameReplay | null> {
  try {
    const data = JSON.parse(await file.text())
    if (!data?.frames || !Array.isArray(data.frames)) return null
    if (typeof data.id !== 'string' || typeof data.finalScore !== 'number') return null
    return data as GameReplay
  } catch { return null }
}

// ── Display ─────────────────────────────────────────────────────────────────

/** Human-readable one-liner summary of a shared replay */
export function formatReplaySummary(data: SharedReplayData): string {
  return `Word Snake Replay: Score ${data.playerScore}, ${data.wordsEaten} words, ${data.duration}s, ${data.difficulty} difficulty`
}
