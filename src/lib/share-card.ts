// Game stats share card generator — creates a shareable PNG image of game results

export interface ShareCardData {
  score: number
  wordsEaten: number
  timeElapsed: number
  difficulty: string
  maxCombo: number
  longestSnake: number
  powerUpsCollected: number
  weather: string
  isDailyChallenge: boolean
  dailyCompleted: boolean
  isSpeedRun: boolean
  speedRunTimeLeft: number
  wordsByCategory: Record<string, number>
  date: string
  playerName?: string
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const DIFFICULTY_EMOJI: Record<string, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
}

const WEATHER_EMOJI: Record<string, string> = {
  clear: '☀️',
  rain: '🌧️',
  snow: '❄️',
  stars: '⭐',
}

const CATEGORY_COLORS: Record<string, string> = {
  nature: '#22c55e',
  emotion: '#f43f5e',
  element: '#3b82f6',
  time: '#a855f7',
  creature: '#f59e0b',
  quality: '#06b6d4',
  object: '#ec4899',
  action: '#f97316',
}

export function generateShareCard(data: ShareCardData): string {
  // Return SVG as data URL
  const w = 600
  const h = 400
  const date = new Date(data.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  // Build category bars
  const categories = Object.entries(data.wordsByCategory)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])

  const totalWords = categories.reduce((sum, [, count]) => sum + count, 0) || 1

  const categoryBars = categories.map(([cat, count]) => {
    const pct = Math.round((count / totalWords) * 100)
    const color = CATEGORY_COLORS[cat] ?? '#94a3b8'
    const label = cat.charAt(0).toUpperCase() + cat.slice(1)
    return `<rect x="60" y="${h - 100 + categories.indexOf([cat, count] as [string, number]) * 16}" width="${pct * 4.8}" height="10" rx="5" fill="${color}" opacity="0.8"/>
      <text x="55" y="${h - 91 + categories.indexOf([cat, count] as [string, number]) * 16}" fill="${color}" font-size="9" font-family="sans-serif" text-anchor="end">${label}</text>
      <text x="${60 + pct * 4.8 + 5}" y="${h - 91 + categories.indexOf([cat, count] as [string, number]) * 16}" fill="#94a3b8" font-size="8" font-family="sans-serif">${count}</text>`
  }).join('')

  const modeLabel = data.isSpeedRun
    ? 'Speed Run'
    : data.isDailyChallenge
      ? `Daily Challenge ${data.dailyCompleted ? '✓' : '✗'}`
      : 'Classic Mode'
  const modeEmoji = data.isSpeedRun ? '⚡' : data.isDailyChallenge ? '📅' : '🎮'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e1b4b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#22c55e"/>
      <stop offset="50%" style="stop-color:#8b5cf6"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" fill="url(#bg)" rx="16"/>

  <!-- Accent line at top -->
  <rect x="30" y="12" width="${w - 60}" height="3" rx="1.5" fill="url(#accent)" opacity="0.6"/>

  <!-- Header -->
  <text x="${w / 2}" y="50" fill="#f8fafc" font-size="24" font-weight="bold" font-family="sans-serif" text-anchor="middle">🐍 Word Snake</text>
  <text x="${w / 2}" y="70" fill="#94a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">${modeEmoji} ${modeLabel} — ${date}</text>

  <!-- Score -->
  <text x="${w / 2}" y="115" fill="#fbbf24" font-size="48" font-weight="bold" font-family="sans-serif" text-anchor="middle">${data.score}</text>
  <text x="${w / 2}" y="135" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">points</text>

  <!-- Stats grid -->
  <text x="80" y="175" fill="#4ade80" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">📝 ${data.wordsEaten}</text>
  <text x="80" y="190" fill="#64748b" font-size="9" font-family="sans-serif" text-anchor="middle">words</text>

  <text x="${w / 2}" y="175" fill="#38bdf8" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">⏱ ${formatTime(data.timeElapsed)}</text>
  <text x="${w / 2}" y="190" fill="#64748b" font-size="9" font-family="sans-serif" text-anchor="middle">time</text>

  <text x="${w - 80}" y="175" fill="#f472b6" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">🔥 ×${data.maxCombo.toFixed(1)}</text>
  <text x="${w - 80}" y="190" fill="#64748b" font-size="9" font-family="sans-serif" text-anchor="middle">max combo</text>

  <!-- Info row -->
  <text x="110" y="225" fill="#94a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">${DIFFICULTY_EMOJI[data.difficulty] ?? '⚪'} ${data.difficulty}</text>
  <text x="${w / 2}" y="225" fill="#94a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">${WEATHER_EMOJI[data.weather] ?? '☀️'} ${data.weather}</text>
  <text x="${w - 110}" y="225" fill="#94a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">📏 ${data.longestSnake} longest</text>

  <text x="${w / 2}" y="248" fill="#94a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">💎 ${data.powerUpsCollected} power-ups</text>

  <!-- Divider -->
  <line x1="40" y1="${h - 110}" x2="${w - 40}" y2="${h - 110}" stroke="#334155" stroke-width="1"/>

  <!-- Category breakdown -->
  ${categoryBars}

  <!-- Footer -->
  <text x="${w / 2}" y="${h - 15}" fill="#475569" font-size="9" font-family="sans-serif" text-anchor="middle">Word Snake — Collect words, create poetry 🐍✨</text>
</svg>`

  return svg
}

export function shareCardToDataURL(svgString: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`
}

export function downloadShareCard(data: ShareCardData): void {
  const svg = generateShareCard(data)
  const dataUrl = shareCardToDataURL(svg)

  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    const link = document.createElement('a')
    link.download = `word-snake-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  img.src = dataUrl
}
