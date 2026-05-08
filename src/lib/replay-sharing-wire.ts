'use client'

// Replay Sharing Wire — UI-friendly layer for sharing Word Snake replays
// Wraps replay-sharing encoder/decoder and game-replay storage with clipboard,
// file I/O, leaderboard, share history, and quick-share text generation.

import type { GameReplay } from '@/lib/game-replay'
import { getReplay, getReplays, formatDuration, formatDate } from '@/lib/game-replay'
import {
  type SharedReplayData,
  generateShareCode as _encodeShareCode,
  parseShareCode,
  downloadReplayFile as _downloadFile,
  readReplayFile,
  calculateChecksum,
} from '@/lib/replay-sharing'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HISTORY_KEY = 'ws_replay_share_history'
const MAX_HISTORY = 50
const LEADERBOARD_LIMIT = 10

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Replay with its share code pre-baked for one-click sharing */
export interface ShareableReplay {
  replay: GameReplay
  shareCode: string
  rank: number
}

/** Single entry in the share / import history log */
export interface ShareHistoryEntry {
  id: string
  type: 'shared' | 'imported_code' | 'imported_file' | 'downloaded'
  replayId: string
  replaySummary: string
  shareCode: string | null
  score: number
  difficulty: string
  date: string
  wordsCollected: number
  maxCombo: number
}

/** Result of validating a share code without fully importing */
export interface ValidationResult {
  valid: boolean
  error: string | null
  format: 'wsnake_v1' | 'unknown' | 'malformed'
  hasFrames: boolean
  estimatedFrameCount: number
  checksumOk: boolean
}

/** Result of importing a share code or file */
export interface ImportResult {
  success: boolean
  error: string | null
  data: SharedReplayData | null
  sourceReplay: GameReplay | null
  shareCode: string | null
}

/** Leaderboard entry for top-scoring replays */
export interface LeaderboardEntry {
  rank: number
  replayId: string
  score: number
  wordsCollected: number
  maxCombo: number
  duration: number
  difficulty: string
  date: string
  shareCode: string
  isDailyChallenge: boolean
  weather: string
}

/** Compact text summary for messages / social media */
export interface ShareTextResult {
  success: boolean
  error: string | null
  text: string | null
}

/** Lightweight result wrapper used internally */
interface WireResult<T> {
  ok: boolean
  value: T
  error: string | null
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSetItem(key: string, value: unknown): boolean {
  try {
    if (typeof window === 'undefined') return false
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function loadReplay(replayId: string): GameReplay | null {
  try {
    const r = getReplay(replayId)
    if (r) return r
  } catch { /* fallback */ }
  return getReplays().find(r => r.id === replayId) ?? null
}

function loadAllReplays(): GameReplay[] {
  try {
    const r = getReplays()
    if (r.length > 0) return r
  } catch { /* fallback */ }
  return []
}

function newHistoryId(): string {
  return `sh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function replaySummary(r: GameReplay): string {
  return `${r.finalScore} pts · ${r.totalWordsEaten} words · ${r.maxCombo}x combo · ${r.difficulty}`
}

function readShareHistory(): ShareHistoryEntry[] {
  return safeGetItem<ShareHistoryEntry[]>(HISTORY_KEY, [])
}

function appendShareHistory(entry: ShareHistoryEntry): void {
  const h = readShareHistory()
  h.unshift(entry)
  safeSetItem(HISTORY_KEY, h.slice(0, MAX_HISTORY))
}

/** Shorthand for building a failed ImportResult */
function failImport(error: string): ImportResult {
  return { success: false, error, data: null, sourceReplay: null, shareCode: null }
}

/** Shorthand for building a failed ValidationResult */
function failValidation(error: string, format: ValidationResult['format']): ValidationResult {
  return { valid: false, error, format, hasFrames: false, estimatedFrameCount: 0, checksumOk: false }
}

/** Try to encode a replay; returns empty string on failure */
function tryEncode(replay: GameReplay): string {
  try {
    return replay.frames.length > 0 ? _encodeShareCode(replay) : ''
  } catch {
    return ''
  }
}

/** Build a history entry from a replay for "shared" or "downloaded" actions */
function makeHistoryEntry(
  replay: GameReplay,
  type: ShareHistoryEntry['type'],
  shareCode: string | null,
): ShareHistoryEntry {
  return {
    id: newHistoryId(),
    type,
    replayId: replay.id,
    replaySummary: replaySummary(replay),
    shareCode,
    score: replay.finalScore,
    difficulty: replay.difficulty,
    date: new Date().toISOString(),
    wordsCollected: replay.totalWordsEaten,
    maxCombo: replay.maxCombo,
  }
}

// ---------------------------------------------------------------------------
// 1. Generate Share Code
// ---------------------------------------------------------------------------

/** Encode a stored replay into a compact shareable WSNAKE code string. */
export function generateShareCode(replayId: string): WireResult<string> {
  try {
    const replay = loadReplay(replayId)
    if (!replay) return { ok: false, value: '', error: `Replay not found: ${replayId}` }
    if (replay.frames.length === 0) return { ok: false, value: '', error: 'Replay has no frames to encode' }
    const code = _encodeShareCode(replay)
    appendShareHistory(makeHistoryEntry(replay, 'shared', code))
    return { ok: true, value: code, error: null }
  } catch (err) {
    return { ok: false, value: '', error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ---------------------------------------------------------------------------
// 2. Import Share Code
// ---------------------------------------------------------------------------

/** Decode a WSNAKE share code, validate it, and record in history. */
export function importShareCode(code: string): ImportResult {
  try {
    if (!code || typeof code !== 'string') return failImport('Share code is empty or invalid')
    const trimmed = code.trim()
    if (!trimmed.startsWith('WSNAKE-')) return failImport('Invalid format — must start with WSNAKE-')
    const parsed = parseShareCode(trimmed)
    if (!parsed) return { success: false, error: 'Corrupted or invalid checksum', data: null, sourceReplay: null, shareCode: trimmed }

    appendShareHistory({
      id: newHistoryId(),
      type: 'imported_code',
      replayId: parsed.id,
      replaySummary: `Imported · ${parsed.frameCount} frames`,
      shareCode: trimmed,
      score: 0,
      difficulty: 'unknown',
      date: new Date().toISOString(),
      wordsCollected: 0,
      maxCombo: 0,
    })
    return { success: true, error: null, data: parsed, sourceReplay: null, shareCode: trimmed }
  } catch (err) {
    return failImport(err instanceof Error ? err.message : 'Unknown error')
  }
}

// ---------------------------------------------------------------------------
// 3. Get Shareable Replays
// ---------------------------------------------------------------------------

/** All stored replays sorted by score (best first) with pre-generated codes. */
export function getShareableReplays(): ShareableReplay[] {
  try {
    const replays = loadAllReplays()
    return [...replays]
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((replay, i) => ({ replay, shareCode: tryEncode(replay), rank: i + 1 }))
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// 4. Copy Share Code
// ---------------------------------------------------------------------------

/** Generate a share code for a replay and copy it to the clipboard. */
export async function copyShareCode(replayId: string): Promise<WireResult<boolean>> {
  try {
    const replay = loadReplay(replayId)
    if (!replay) return { ok: false, value: false, error: `Replay not found: ${replayId}` }
    if (replay.frames.length === 0) return { ok: false, value: false, error: 'Replay has no frames' }

    const code = _encodeShareCode(replay)
    let copied = false

    // Clipboard API
    try { await navigator.clipboard.writeText(code); copied = true } catch { /* fallback */ }

    // Textarea fallback for older browsers / restricted contexts
    if (!copied) {
      try {
        const ta = Object.assign(document.createElement('textarea'), {
          value: code, style: { position: 'fixed', opacity: '0' },
        })
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        copied = true
      } catch { /* give up */ }
    }

    if (!copied) return { ok: false, value: false, error: 'Clipboard access denied' }
    appendShareHistory(makeHistoryEntry(replay, 'shared', code))
    return { ok: true, value: true, error: null }
  } catch (err) {
    return { ok: false, value: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ---------------------------------------------------------------------------
// 5. Download Replay File
// ---------------------------------------------------------------------------

/** Download a stored replay as a .wsnake JSON file. */
export function downloadReplayFile(replayId: string): WireResult<void> {
  try {
    const replay = loadReplay(replayId)
    if (!replay) return { ok: false, value: undefined, error: `Replay not found: ${replayId}` }
    _downloadFile(replay, `replay_${replay.id}.wsnake`)
    appendShareHistory(makeHistoryEntry(replay, 'downloaded', null))
    return { ok: true, value: undefined, error: null }
  } catch (err) {
    return { ok: false, value: undefined, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ---------------------------------------------------------------------------
// 6. Import File
// ---------------------------------------------------------------------------

/** Read a .wsnake JSON file, validate it, and return replay data. */
export async function importReplayFromFile(file: File): Promise<ImportResult> {
  try {
    const name = file.name.toLowerCase()
    if (!name.endsWith('.wsnake') && !name.endsWith('.json'))
      return failImport('Invalid file type — expected .wsnake or .json')
    if (file.size > 5 * 1024 * 1024)
      return failImport('File too large — maximum is 5 MB')

    const replay = await readReplayFile(file)
    if (!replay) return failImport('Failed to parse replay file — invalid .wsnake format')

    const shareCode = tryEncode(replay) || null
    appendShareHistory(makeHistoryEntry(replay, 'imported_file', shareCode))
    return { success: true, error: null, data: null, sourceReplay: replay, shareCode }
  } catch (err) {
    return failImport(err instanceof Error ? err.message : 'Unknown error')
  }
}

// ---------------------------------------------------------------------------
// 7. Replay Leaderboard
// ---------------------------------------------------------------------------

/** Top 10 replays ranked by score, each with a pre-generated share code. */
export function getReplayLeaderboard(): LeaderboardEntry[] {
  try {
    const replays = loadAllReplays()
    if (replays.length === 0) return []

    const sorted = [...replays].sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return sorted.slice(0, LEADERBOARD_LIMIT).map((replay, i) => ({
      rank: i + 1,
      replayId: replay.id,
      score: replay.finalScore,
      wordsCollected: replay.totalWordsEaten,
      maxCombo: replay.maxCombo,
      duration: replay.duration,
      difficulty: replay.difficulty,
      date: replay.date,
      shareCode: tryEncode(replay),
      isDailyChallenge: replay.isDailyChallenge,
      weather: replay.weather,
    }))
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// 8. Share History
// ---------------------------------------------------------------------------

/** Full share history (shared, imported, downloaded). Most recent first. */
export function getShareHistory(): ShareHistoryEntry[] {
  try { return readShareHistory() } catch { return [] }
}

// ---------------------------------------------------------------------------
// 9. Validate Share Code
// ---------------------------------------------------------------------------

/** Validate a share code format and checksum without performing a full import. */
export function validateShareCode(code: string): ValidationResult {
  try {
    if (!code || typeof code !== 'string' || code.trim().length === 0)
      return failValidation('Share code is empty', 'malformed')

    const trimmed = code.trim()

    if (!trimmed.startsWith('WSNAKE-')) {
      if (trimmed.length < 20) return failValidation('Code is too short', 'malformed')
      return failValidation('Share codes must start with WSNAKE-', 'unknown')
    }

    const parts = trimmed.split('-')
    if (parts.length < 4) return failValidation('Too few segments in share code', 'malformed')
    if (parts[1] !== '1') return failValidation(`Unsupported version: ${parts[1]}`, 'unknown')

    // Extract data and checksum
    const checksum = parts[parts.length - 1]
    const encodedData = parts.slice(2, parts.length - 1).join('-')
    const checksumOk = checksum.toLowerCase() === calculateChecksum(encodedData).toLowerCase()

    if (!checksumOk) {
      return {
        valid: false, error: 'Checksum mismatch — code may be corrupted',
        format: 'wsnake_v1', hasFrames: false, estimatedFrameCount: 0, checksumOk: false,
      }
    }

    // Estimate frame count from base64 payload
    let estimatedFrameCount = 0
    let hasFrames = false
    try {
      let b64 = encodedData.replace(/-/g, '+').replace(/_/g, '/')
      while (b64.length % 4 !== 0) b64 += '='
      const payload = atob(b64)
      estimatedFrameCount = Math.floor(payload.length / 7)
      hasFrames = payload.length > 0 && payload.length % 7 === 0
    } catch { /* undecodable */ }

    if (!hasFrames) {
      return {
        valid: false, error: 'No decodable frame data found',
        format: 'wsnake_v1', hasFrames: false, estimatedFrameCount: 0, checksumOk: true,
      }
    }

    return { valid: true, error: null, format: 'wsnake_v1', hasFrames: true, estimatedFrameCount, checksumOk: true }
  } catch (err) {
    return failValidation(err instanceof Error ? err.message : 'Validation error', 'malformed')
  }
}

// ---------------------------------------------------------------------------
// 10. Quick Share Text
// ---------------------------------------------------------------------------

/** Generate a compact text summary of a replay for sharing in messages / chat. */
export function generateShareText(replayId: string): ShareTextResult {
  try {
    const replay = loadReplay(replayId)
    if (!replay) return { success: false, error: `Replay not found: ${replayId}`, text: null }

    const dateStr = formatDate(replay.date)
    const durationStr = formatDuration(replay.duration)
    const highlights: string[] = []

    if (replay.maxCombo >= 3) highlights.push(`${replay.maxCombo}x combo`)
    if (replay.totalWordsEaten >= 20) highlights.push(`${replay.totalWordsEaten} words eaten`)
    if (replay.finalScore >= 1000) highlights.push(`${replay.finalScore.toLocaleString()} pts`)
    if (replay.isDailyChallenge) highlights.push('Daily Challenge')
    if (replay.weather && replay.weather !== 'clear') highlights.push(`${replay.weather} weather`)
    if (replay.wordPack && replay.wordPack !== 'default') highlights.push(`"${replay.wordPack}" pack`)

    const lines: string[] = [
      '🐍 Word Snake Replay',
      `Score: ${replay.finalScore.toLocaleString()} · ${replay.totalWordsEaten} words · ${replay.maxCombo}x max combo`,
      `Difficulty: ${replay.difficulty.toUpperCase()} · Duration: ${durationStr} · ${dateStr}`,
    ]

    // Top words collected (prefer longer words, show up to 5)
    if (replay.wordsCollected.length > 0) {
      const long = replay.wordsCollected.filter(w => w.length > 3).slice(0, 5).join(', ')
      lines.push(`Words: ${long || replay.wordsCollected.slice(0, 5).join(', ')}`)
    }

    if (highlights.length > 0) lines.push(`Highlights: ${highlights.join(' · ')}`)

    // Append truncated share code
    const code = tryEncode(replay)
    if (code) {
      lines.push(code.length > 60 ? `Code: ${code.slice(0, 40)}...${code.slice(-10)}` : `Code: ${code}`)
    }

    return { success: true, error: null, text: lines.join('\n') }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error', text: null }
  }
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Clear the entire share history */
export function clearShareHistory(): boolean {
  try {
    if (typeof window === 'undefined') return false
    localStorage.removeItem(HISTORY_KEY)
    return true
  } catch {
    return false
  }
}

/** Quick stat counts of share history for badges / indicators */
export function getShareHistoryStats(): {
  total: number; shared: number; importedCode: number; importedFile: number; downloaded: number; bestScore: number
} {
  try {
    const h = readShareHistory()
    return {
      total: h.length,
      shared: h.filter(e => e.type === 'shared').length,
      importedCode: h.filter(e => e.type === 'imported_code').length,
      importedFile: h.filter(e => e.type === 'imported_file').length,
      downloaded: h.filter(e => e.type === 'downloaded').length,
      bestScore: h.length > 0 ? Math.max(...h.map(e => e.score)) : 0,
    }
  } catch {
    return { total: 0, shared: 0, importedCode: 0, importedFile: 0, downloaded: 0, bestScore: 0 }
  }
}
