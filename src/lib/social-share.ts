// ─── Social Share System for Word Snake ───────────────────────────────────────
// Generates formatted share cards for game results, achievements, battle pass,
// word collection, daily streaks, and speed runs. Supports ASCII art cards,
// plain text (Twitter-compatible), JSON export, clipboard, and Web Share API.

// ─── Types ────────────────────────────────────────────────────────────────────

/** Valid share card types */
export type ShareType =
  | 'game_result'
  | 'achievement'
  | 'battle_pass'
  | 'collection'
  | 'streak'
  | 'speed_run'

/** A single recorded share event, persisted in localStorage */
export interface ShareRecord {
  id: string
  type: ShareType
  timestamp: number
  textPreview: string
}

/** Aggregate statistics about past shares */
export interface ShareStats {
  totalShares: number
  byType: Record<ShareType, number>
  lastShareAt: number | null
}

/** The public SocialShare object returned by createSocialShare() */
export interface SocialShare {
  generateShareCard(type: ShareType, data: Record<string, unknown>): string
  generateShareText(type: string, data: Record<string, unknown>): string
  generateShareJSON(type: string, data: Record<string, unknown>): string
  copyToClipboard(text: string): Promise<boolean>
  shareToTwitter(text: string): void
  shareToGeneric(text: string): Promise<void>
  getShareHistory(): ShareRecord[]
  getShareStats(): ShareStats
  clearShareHistory(): void
  formatCompactNumber(n: number): string
  formatDuration(seconds: number): string
  getShareableEmoji(type: string): string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_social_share_history'
const MAX_HISTORY = 200

/** Inner content width (chars between ║ delimiters) */
const CARD_WIDTH = 26

/** Themed emojis mapped to each share type */
const TYPE_EMOJIS: Record<ShareType, string> = {
  game_result: '🐍',
  achievement: '🏆',
  battle_pass: '⚔️',
  collection: '📚',
  streak: '🔥',
  speed_run: '⚡',
}

/** Display names for each share type */
const TYPE_LABELS: Record<ShareType, string> = {
  game_result: 'WORD SNAKE RESULT',
  achievement: 'ACHIEVEMENT UNLOCKED',
  battle_pass: 'BATTLE PASS PROGRESS',
  collection: 'WORD COLLECTION',
  streak: 'DAILY STREAK',
  speed_run: 'SPEED RUN',
}

/** Rarity labels and their associated sparkle emojis */
const RARITY_EMOJI: Record<string, string> = {
  common: '⚪',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟡',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Pad / truncate a value to exactly `width` characters */
function padRow(value: string, width = CARD_WIDTH): string {
  // account for double-width emoji code points
  const visible = [...value].length
  if (visible > width) return [...value].slice(0, width).join('')
  return value + ' '.repeat(width - visible)
}

/** Wrap text into lines that fit within `width` characters */
function wrapText(text: string, width: number): string[] {
  const lines: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    if ([...remaining].length <= width) {
      lines.push(remaining)
      break
    }
    // find a safe break point
    let breakAt = width
    const slice = [...remaining].slice(0, width).join('')
    const lastSpace = slice.lastIndexOf(' ')
    if (lastSpace > 0) breakAt = lastSpace
    lines.push([...remaining].slice(0, breakAt).join(''))
    remaining = remaining.slice(breakAt).trimStart()
  }
  return lines
}

/** Ensure a string is not longer than `max` characters */
function truncate(str: string, max: number): string {
  return [...str].length > max ? [...str].slice(0, max).join('') + '…' : str
}

// ─── ASCII Art Card Generators ───────────────────────────────────────────────

/**
 * Game Result Card — score, words, combo, mode, rating, date
 */
function buildGameResultCard(data: Record<string, unknown>): string {
  const score = Number(data.score ?? 0)
  const words = Number(data.words ?? 0)
  const combo = Number(data.combo ?? 0)
  const mode = String(data.mode ?? 'Classic')
  const rating = String(data.rating ?? 'B')
  const time = formatDuration(Number(data.timeSeconds ?? 0))

  const rows: string[] = []
  rows.push(`  Score: ${formatCompactNumber(score)} 🌟`)
  rows.push(`  Words: ${words} 📝`)
  rows.push(`  Combo: ${combo}x 🔥`)
  rows.push(`  Mode: ${truncate(mode, 17)} 🎮`)
  rows.push(`  Rating: ${rating} ⭐`)
  rows.push(`  Time: ${time} ⏱️`)

  return assembleCard('game_result', rows)
}

/**
 * Achievement Card — name, description, icon, unlock date, rarity
 */
function buildAchievementCard(data: Record<string, unknown>): string {
  const name = String(data.name ?? 'Unknown')
  const desc = String(data.description ?? '')
  const icon = String(data.icon ?? '🏅')
  const date = data.unlockDate
    ? new Date(String(data.unlockDate)).toLocaleDateString()
    : 'Today'
  const rarity = String(data.rarity ?? 'common')
  const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1)
  const sparkle = RARITY_EMOJI[rarity] ?? '⚪'

  // Wrap long descriptions across two lines
  const descLines = wrapText(desc, 22)

  const rows: string[] = []
  rows.push(`  ${icon} ${truncate(name, 21)}`)
  for (const line of descLines) {
    rows.push(`    ${line}`)
  }
  rows.push(`  Rarity: ${rarityLabel} ${sparkle}`)
  rows.push(`  Unlocked: ${truncate(date, 16)} 📅`)

  return assembleCard('achievement', rows)
}

/**
 * Battle Pass Card — tier, season, XP progress, next reward
 */
function buildBattlePassCard(data: Record<string, unknown>): string {
  const tier = Number(data.currentTier ?? 1)
  const totalTiers = Number(data.totalTiers ?? 25)
  const season = String(data.seasonName ?? 'Season 1')
  const xp = Number(data.currentXP ?? 0)
  const xpNeeded = Number(data.xpNeeded ?? 100)
  const nextReward = String(data.nextReward ?? '—')
  const pct = xpNeeded > 0 ? Math.round((xp / xpNeeded) * 100) : 100

  // Visual XP bar using block characters (16-wide to fit card width)
  const filled = Math.round(pct / 6.25)
  const bar = '█'.repeat(filled) + '░'.repeat(16 - filled)

  const rows: string[] = []
  rows.push(`  🌸 ${truncate(season, 19)}`)
  rows.push(`  Tier: ${tier} / ${totalTiers} 📊`)
  rows.push(`  [${bar}] ${pct}%`)
  rows.push(`  Next: ${truncate(nextReward, 18)} 🎁`)

  return assembleCard('battle_pass', rows)
}

/**
 * Word Collection Card — progress %, total, rarest word, category completion
 */
function buildCollectionCard(data: Record<string, unknown>): string {
  const total = Number(data.totalCollected ?? 0)
  const maxWords = Number(data.maxWords ?? 500)
  const pct = maxWords > 0 ? Math.round((total / maxWords) * 100) : 0
  const rarest = String(data.rarestWord ?? '???')
  const catDone = Number(data.categoriesCompleted ?? 0)
  const catTotal = Number(data.categoriesTotal ?? 8)

  const filled = Math.round(pct / 6.25)
  const bar = '█'.repeat(filled) + '░'.repeat(16 - filled)

  const rows: string[] = []
  rows.push(`  ${formatCompactNumber(total)} / ${formatCompactNumber(maxWords)} words 📖`)
  rows.push(`  [${bar}] ${pct}%`)
  rows.push(`  Rarest: "${truncate(rarest, 14)}" 💎`)
  rows.push(`  Categories: ${catDone}/${catTotal} ✅`)

  return assembleCard('collection', rows)
}

/**
 * Daily Streak Card — current streak, best, total days, calendar summary
 */
function buildStreakCard(data: Record<string, unknown>): string {
  const current = Number(data.currentStreak ?? 0)
  const best = Number(data.bestStreak ?? 0)
  const totalDays = Number(data.totalDaysPlayed ?? 0)
  const weekDays = String(data.calendarSummary ?? '·····')

  // Streak milestone emoji (1-6 fire emojis, capped at 6)
  const fires = '🔥'.repeat(Math.min(current, 6)) + (current > 6 ? '+' : '')

  const rows: string[] = []
  rows.push(`  Streak: ${current} days ${fires}`)
  rows.push(`  Best: ${best} days 🏆`)
  rows.push(`  Played: ${totalDays} total 📅`)
  rows.push(`  Week: [${weekDays}]`)

  return assembleCard('streak', rows)
}

/**
 * Speed Run Card — best time, WPM, score, rank
 */
function buildSpeedRunCard(data: Record<string, unknown>): string {
  const bestTime = formatDuration(Number(data.bestTimeSeconds ?? 0))
  const wpm = Number(data.wordsPerMinute ?? 0)
  const score = Number(data.score ?? 0)
  const rank = String(data.rank ?? '—')

  const rows: string[] = []
  rows.push(`  Best: ${bestTime} ⏱️`)
  rows.push(`  WPM: ${wpm} 🗣️`)
  rows.push(`  Score: ${formatCompactNumber(score)} 🌟`)
  rows.push(`  Rank: ${truncate(rank, 19)} 🏅`)

  return assembleCard('speed_run', rows)
}

/**
 * Assemble a complete ASCII card from title type and content rows.
 * Uses box-drawing characters and emoji decorations.
 */
function assembleCard(type: ShareType, rows: string[]): string {
  const emoji = TYPE_EMOJIS[type]
  const label = TYPE_LABELS[type]
  const divider = '═'.repeat(CARD_WIDTH)
  const thinDivider = '─'.repeat(CARD_WIDTH)

  // Title row — centered emoji + label
  const titleInner = `${emoji} ${label}`
  const titlePad = Math.max(0, CARD_WIDTH - [...titleInner].length)
  const titleLine = titleInner + ' '.repeat(titlePad)

  // Content rows padded to inner width
  const contentLines = rows.map((r) => `║${padRow(r)}║`)

  // Footer
  const footer = `║${padRow('#WordSnake @WordSnake')}║`

  return (
    `╔${divider}╗\n` +
    `║${padRow(titleLine)}║\n` +
    `╠${thinDivider}╣\n` +
    contentLines.join('\n') + '\n' +
    `╠${thinDivider}╣\n` +
    footer + '\n' +
    `╚${divider}╝`
  )
}

// ─── Plain-Text Share Generator (Twitter/X <280 chars) ───────────────────────

/**
 * Build a concise, Twitter-compatible share message.
 * Kept under 280 characters with hashtags.
 */
function buildShareText(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case 'game_result': {
      const score = formatCompactNumber(Number(data.score ?? 0))
      const words = data.words ?? 0
      const combo = data.combo ?? 0
      const mode = data.mode ?? 'Classic'
      return `🐍 Just scored ${score} in Word Snake (${words} words, ${combo}x combo) on ${mode} mode! Can you beat me? #WordSnake`
    }
    case 'achievement': {
      const name = String(data.name ?? 'an achievement')
      const rarity = String(data.rarity ?? '')
      const rText = rarity ? ` [${rarity}]` : ''
      return `🏆 Unlocked "${name}"${rText} in Word Snake! My collection keeps growing 🐍 #WordSnake #Achievement`
    }
    case 'battle_pass': {
      const tier = data.currentTier ?? 1
      const total = data.totalTiers ?? 25
      const season = String(data.seasonName ?? 'this season')
      return `⚔️ Tier ${tier}/${total} on ${season} Battle Pass in Word Snake! Grinding hard 🐍 #WordSnake #BattlePass`
    }
    case 'collection': {
      const total = Number(data.totalCollected ?? 0)
      const maxW = Number(data.maxWords ?? 500)
      const pct = maxW > 0 ? Math.round((total / maxW) * 100) : 0
      const rarest = String(data.rarestWord ?? '???')
      return `📚 ${pct}% word collection complete! Collected ${total} words. Rarest find: "${rarest}" 🐍 #WordSnake`
    }
    case 'streak': {
      const current = data.currentStreak ?? 0
      const best = data.bestStreak ?? 0
      return `🔥 ${current}-day streak in Word Snake!${current >= best ? ' New personal best!' : ` Best: ${best} days`} 🐍 #WordSnake #DailyStreak`
    }
    case 'speed_run': {
      const time = formatDuration(Number(data.bestTimeSeconds ?? 0))
      const wpm = data.wordsPerMinute ?? 0
      const score = formatCompactNumber(Number(data.score ?? 0))
      return `⚡ Speed Run: ${time} | ${wpm} WPM | ${score} pts in Word Snake! Think you're faster? 🐍 #WordSnake #SpeedRun`
    }
    default:
      return `🐍 Check out my Word Snake progress! #WordSnake`
  }
}

// ─── JSON Share Generator ─────────────────────────────────────────────────────

/**
 * Build a structured JSON payload for programmatic sharing.
 * Includes metadata, the display-ready text, and the raw data.
 */
function buildShareJSON(type: string, data: Record<string, unknown>): string {
  const payload = {
    type,
    timestamp: Date.now(),
    text: buildShareText(type, data),
    data,
    hashtags: ['#WordSnake'],
  }
  return JSON.stringify(payload, null, 2)
}

// ─── Share History (localStorage Persistence) ─────────────────────────────────

/** Load share history from localStorage */
function loadHistory(): ShareRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ShareRecord[]) : []
  } catch {
    return []
  }
}

/** Persist share history to localStorage */
function saveHistory(records: ShareRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // storage full — silently ignore
  }
}

/** Record a new share event */
function recordShare(type: ShareType, textPreview: string): void {
  const history = loadHistory()
  history.unshift({
    id: `share_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    timestamp: Date.now(),
    textPreview: truncate(textPreview, 80),
  })
  // Trim to max entries
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  saveHistory(history)
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Format a number in compact notation: 1200 → "1.2K", 3500000 → "3.5M"
 */
function formatCompactNumber(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
}

/**
 * Format seconds into a human-readable duration string.
 * Examples: 90 → "1m 30s", 45 → "0m 45s", 3600 → "60m 0s"
 */
function formatDuration(seconds: number): string {
  const totalSecs = Math.max(0, Math.floor(seconds))
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return `${m}m ${s}s`
}

/**
 * Return a themed emoji for the given share type.
 * Falls back to 🐍 for unknown types.
 */
function getShareableEmoji(type: string): string {
  return TYPE_EMOJIS[type as ShareType] ?? '🐍'
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create and return a SocialShare instance.
 * Each method is bound so consumers can destructure freely.
 */
export function createSocialShare(): SocialShare {
  // ── Card generation ───────────────────────────────────────────
  function generateShareCard(type: ShareType, data: Record<string, unknown>): string {
    switch (type) {
      case 'game_result':
        return buildGameResultCard(data)
      case 'achievement':
        return buildAchievementCard(data)
      case 'battle_pass':
        return buildBattlePassCard(data)
      case 'collection':
        return buildCollectionCard(data)
      case 'streak':
        return buildStreakCard(data)
      case 'speed_run':
        return buildSpeedRunCard(data)
      default:
        return assembleCard('game_result', [`  Unknown card type: ${type}`])
    }
  }

  // ── Plain text (Twitter-safe) ─────────────────────────────────
  function generateShareText(type: string, data: Record<string, unknown>): string {
    const text = buildShareText(type, data)
    // Enforce 280-char limit for Twitter/X compatibility
    if (text.length > 280) return text.slice(0, 277) + '...'
    return text
  }

  // ── JSON format ───────────────────────────────────────────────
  function generateShareJSON(type: string, data: Record<string, unknown>): string {
    return buildShareJSON(type, data)
  }

  // ── Clipboard ─────────────────────────────────────────────────
  async function copyToClipboard(text: string): Promise<boolean> {
    // Record the copy event for history tracking
    recordShare('game_result', text)
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  // ── Twitter / X intent ────────────────────────────────────────
  function shareToTwitter(text: string): void {
    const encoded = encodeURIComponent(text.slice(0, 280))
    const url = `https://twitter.com/intent/tweet?text=${encoded}`
    window.open(url, '_blank', 'noopener,noreferrer,width=550,height=420')
    recordShare('game_result', text)
  }

  // ── Web Share API (with clipboard fallback) ───────────────────
  async function shareToGeneric(text: string): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Word Snake',
          text,
        })
        recordShare('game_result', text)
        return
      } catch {
        // User cancelled or API unavailable — fall through to clipboard
      }
    }
    // Fallback: copy to clipboard
    await copyToClipboard(text)
  }

  // ── Share history ─────────────────────────────────────────────
  function getShareHistory(): ShareRecord[] {
    return loadHistory()
  }

  function getShareStats(): ShareStats {
    const records = loadHistory()
    const byType = {
      game_result: 0,
      achievement: 0,
      battle_pass: 0,
      collection: 0,
      streak: 0,
      speed_run: 0,
    } as Record<ShareType, number>

    for (const rec of records) {
      if (byType[rec.type] !== undefined) byType[rec.type]++
    }

    return {
      totalShares: records.length,
      byType,
      lastShareAt: records.length > 0 ? records[0].timestamp : null,
    }
  }

  function clearShareHistory(): void {
    saveHistory([])
  }

  return {
    generateShareCard,
    generateShareText,
    generateShareJSON,
    copyToClipboard,
    shareToTwitter,
    shareToGeneric,
    getShareHistory,
    getShareStats,
    clearShareHistory,
    formatCompactNumber,
    formatDuration,
    getShareableEmoji,
  }
}
