import { getFavoritePoems, type FavoritePoem } from './poem-favorites'

export interface PoemCollageItem {
  poem: string
  style: string
  words: string[]
  date: string
  isFavorite?: boolean
}

export interface CollageLayout {
  id: string
  name: string
  emoji: string
  columns: number
  maxWidth: number
  maxHeight: number
  bgGradient: [string, string]
}

export const COLLAGE_LAYOUTS: CollageLayout[] = [
  { id: 'grid2x2', name: 'Grid 2×2', emoji: '⊞', columns: 2, maxWidth: 1200, maxHeight: 1200, bgGradient: ['#1e1b4b', '#312e81'] },
  { id: 'masonry', name: 'Masonry', emoji: '🧱', columns: 2, maxWidth: 1000, maxHeight: 1400, bgGradient: ['#0c4a6e', '#164e63'] },
  { id: 'strip', name: 'Film Strip', emoji: '🎬', columns: 1, maxWidth: 800, maxHeight: 2000, bgGradient: ['#1c1917', '#292524'] },
  { id: 'polaroid', name: 'Polaroid', emoji: '📸', columns: 3, maxWidth: 1400, maxHeight: 1000, bgGradient: ['#f5f5f4', '#e7e5e4'] },
]

const STYLE_COLORS: Record<string, string> = {
  'free_verse': '#a78bfa',
  'Free Verse': '#a78bfa',
  'haiku': '#34d399',
  'Haiku': '#34d399',
  'limerick': '#fbbf24',
  'Limerick': '#fbbf24',
  'sonnet': '#f472b6',
  'Sonnet': '#f472b6',
}

function getStyleColor(style: string): string {
  return STYLE_COLORS[style] ?? '#94a3b8'
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  const paragraphs = text.split('\n')

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push('')
      continue
    }
    const words = paragraph.split(' ')
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
  }
  return lines
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function measurePoemCard(
  ctx: CanvasRenderingContext2D,
  poem: PoemCollageItem,
  cardPadding: number,
  cardWidth: number,
  maxLines: number
): { height: number; lines: string[]; wordLines: string[] } {
  const innerWidth = cardWidth - cardPadding * 2
  const badgeH = 28
  const gap = 8

  ctx.font = 'italic 13px "Georgia", serif'
  const allLines = wrapText(ctx, poem.poem, innerWidth)
  const lines = allLines.slice(0, maxLines)

  // Measure word badges
  const badgeFont = '11px sans-serif'
  ctx.font = badgeFont
  const wordBadges: string[] = poem.words.slice(0, 6)
  const moreCount = poem.words.length - 6
  if (moreCount > 0) wordBadges.push(`+${moreCount}`)

  // Wrap word badges
  const wordLines: string[] = []
  let currentWordLine = ''
  const badgePad = 8
  for (const w of wordBadges) {
    const bw = ctx.measureText(w).width + badgePad
    const testW = currentWordLine ? ctx.measureText(currentWordLine + '  ' + w).width + badgePad : bw
    if (testW > innerWidth && currentWordLine) {
      wordLines.push(currentWordLine)
      currentWordLine = w
    } else {
      currentWordLine = currentWordLine ? currentWordLine + '  ' + w : w
    }
  }
  if (currentWordLine) wordLines.push(currentWordLine)

  const dateH = 16
  const textH = lines.length * 18
  const wordsH = wordLines.length > 0 ? wordLines.length * 18 + gap : 0
  const totalH = cardPadding + badgeH + gap + textH + wordsH + dateH + cardPadding

  return { height: totalH, lines, wordLines }
}

export function generatePoemCollage(
  poems: PoemCollageItem[],
  layout: CollageLayout,
  options?: { title?: string; author?: string }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const padding = 40
  const cardGap = 20
  const cardPadding = 16
  const headerH = 80
  const footerH = 40
  const isPolaroid = layout.id === 'polaroid'
  const columns = Math.min(layout.columns, poems.length)

  const availableWidth = layout.maxWidth - padding * 2
  const cardWidth = Math.floor((availableWidth - cardGap * (columns - 1)) / columns)
  const maxLines = layout.id === 'strip' ? 8 : layout.id === 'polaroid' ? 5 : 6

  // Measure all cards
  ctx.font = 'italic 13px "Georgia", serif'
  const cardMeasurements = poems.map(p =>
    measurePoemCard(ctx, p, cardPadding, cardWidth, maxLines)
  )

  // Calculate card positions based on layout
  const positions: { x: number; y: number; w: number; h: number; poemIdx: number }[] = []

  if (layout.id === 'masonry') {
    // Masonry: distribute heights to create uneven columns
    const colHeights = new Array(columns).fill(0)
    for (let i = 0; i < poems.length; i++) {
      const shortestCol = colHeights.indexOf(Math.min(...colHeights))
      positions.push({
        x: padding + shortestCol * (cardWidth + cardGap),
        y: headerH + padding + colHeights[shortestCol],
        w: cardWidth,
        h: cardMeasurements[i].height,
        poemIdx: i,
      })
      colHeights[shortestCol] += cardMeasurements[i].height + cardGap
    }
  } else {
    // Grid / Strip / Polaroid: uniform grid
    for (let i = 0; i < poems.length; i++) {
      const col = i % columns
      const row = Math.floor(i / columns)
      const rowMaxH = Math.max(
        ...poems.slice(row * columns, (row + 1) * columns).map((_, j) => cardMeasurements[row * columns + j]?.height ?? 0)
      )
      positions.push({
        x: padding + col * (cardWidth + cardGap),
        y: headerH + padding + row * (rowMaxH + cardGap),
        w: cardWidth,
        h: cardMeasurements[i].height,
        poemIdx: i,
      })
    }
  }

  // Compute total canvas height
  let maxY = 0
  for (const p of positions) {
    if (p.y + p.h > maxY) maxY = p.y + p.h
  }
  const canvasHeight = Math.max(layout.maxHeight, maxY + padding + footerH)

  canvas.width = layout.maxWidth
  canvas.height = canvasHeight

  // Draw gradient background
  const grad = ctx.createLinearGradient(0, 0, layout.maxWidth, canvasHeight)
  grad.addColorStop(0, layout.bgGradient[0])
  grad.addColorStop(1, layout.bgGradient[1])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, layout.maxWidth, canvasHeight)

  // Decorative border
  ctx.strokeStyle = isPolaroid ? '#d6d3d1' : 'rgba(139, 92, 246, 0.2)'
  ctx.lineWidth = 2
  drawRoundedRect(ctx, 10, 10, layout.maxWidth - 20, canvasHeight - 20, 16)
  ctx.stroke()

  // Inner decorative border
  if (!isPolaroid) {
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)'
    ctx.lineWidth = 1
    drawRoundedRect(ctx, 16, 16, layout.maxWidth - 32, canvasHeight - 32, 14)
    ctx.stroke()
  }

  // Draw header
  const title = options?.title ?? 'Word Snake — Poem Collection'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = isPolaroid ? '#1c1917' : '#e2e8f0'
  ctx.font = 'bold 24px "Georgia", serif'
  ctx.fillText(title, layout.maxWidth / 2, padding + 20)

  // Subtitle line
  ctx.font = '13px sans-serif'
  ctx.fillStyle = isPolaroid ? '#78716c' : '#94a3b8'
  const subtitle = `${poems.length} poem${poems.length !== 1 ? 's' : ''} • ${layout.name}`
  ctx.fillText(subtitle, layout.maxWidth / 2, padding + 48)

  // Draw a subtle separator under header
  const sepY = headerH
  ctx.strokeStyle = isPolaroid ? '#d6d3d1' : 'rgba(148, 163, 184, 0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, sepY)
  ctx.lineTo(layout.maxWidth - padding, sepY)
  ctx.stroke()

  // Draw poem cards
  for (const pos of positions) {
    const poem = poems[pos.poemIdx]
    const measurement = cardMeasurements[pos.poemIdx]

    ctx.save()

    // Card shadow (for polaroid: darker; for dark: colored glow)
    if (isPolaroid) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
    } else {
      const sc = getStyleColor(poem.style)
      ctx.shadowColor = sc + '30'
      ctx.shadowBlur = 16
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    // Card background
    const cardBg = isPolaroid ? '#ffffff' : 'rgba(30, 41, 59, 0.7)'
    ctx.fillStyle = cardBg
    drawRoundedRect(ctx, pos.x, pos.y, pos.w, pos.h, 12)
    ctx.fill()

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Card border
    ctx.strokeStyle = isPolaroid ? '#e7e5e4' : 'rgba(148, 163, 184, 0.12)'
    ctx.lineWidth = 1
    drawRoundedRect(ctx, pos.x, pos.y, pos.w, pos.h, 12)
    ctx.stroke()

    // Style badge pill
    const styleColor = getStyleColor(poem.style)
    const styleLabel = poem.style.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    ctx.font = 'bold 10px sans-serif'
    const badgeTextW = ctx.measureText(styleLabel).width
    const pillW = badgeTextW + 16
    const pillH = 22
    const pillX = pos.x + cardPadding
    const pillY = pos.y + cardPadding

    ctx.fillStyle = styleColor + '25'
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 11)
    ctx.fill()

    ctx.fillStyle = styleColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(styleLabel, pillX + pillW / 2, pillY + pillH / 2)

    // Favorite star
    if (poem.isFavorite) {
      const starX = pillX + pillW + 8
      ctx.font = '12px sans-serif'
      ctx.fillStyle = '#fbbf24'
      ctx.textAlign = 'left'
      ctx.fillText('★', starX, pillY + pillH / 2)
    }

    // Poem text
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.font = 'italic 13px "Georgia", serif'
    ctx.fillStyle = isPolaroid ? '#44403c' : '#cbd5e1'
    const textY = pillY + pillH + 8
    for (let l = 0; l < measurement.lines.length; l++) {
      ctx.fillText(measurement.lines[l], pos.x + cardPadding, textY + l * 18)
    }

    // Word badges
    if (measurement.wordLines.length > 0) {
      const wordsY = textY + measurement.lines.length * 18 + 8
      ctx.font = '11px sans-serif'
      for (let wl = 0; wl < measurement.wordLines.length; wl++) {
        const wordLine = measurement.wordLines[wl]
        // Draw badge backgrounds for each word
        const wordsInLine = wordLine.split('  ')
        let wx = pos.x + cardPadding
        for (const word of wordsInLine) {
          const wW = ctx.measureText(word).width + 10
          ctx.fillStyle = isPolaroid ? '#f5f5f4' : 'rgba(71, 85, 105, 0.4)'
          drawRoundedRect(ctx, wx, wordsY + wl * 18, wW, 16, 8)
          ctx.fill()
          ctx.fillStyle = isPolaroid ? '#78716c' : '#94a3b8'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(word, wx + 5, wordsY + wl * 18 + 8)
          wx += wW + 4
        }
      }
    }

    // Date
    const dateStr = poem.date
    ctx.font = '10px sans-serif'
    ctx.fillStyle = isPolaroid ? '#a8a29e' : '#64748b'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(dateStr, pos.x + pos.w - cardPadding, pos.y + pos.h - cardPadding / 2)

    ctx.restore()
  }

  // Draw footer
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '11px sans-serif'
  ctx.fillStyle = isPolaroid ? '#a8a29e' : '#475569'
  const footerText = options?.author ? `by ${options.author} • word-snake.app` : 'word-snake.app'
  ctx.fillText(footerText, layout.maxWidth / 2, canvasHeight - padding + 8)

  return canvas
}

export function downloadPoemCollage(
  poems: PoemCollageItem[],
  layout: CollageLayout,
  filename?: string
): void {
  const canvas = generatePoemCollage(poems, layout)
  const link = document.createElement('a')
  link.download = filename ?? `word-snake-collage-${layout.id}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export function getCollagePoemSources(): {
  favorites: PoemCollageItem[]
  recent: PoemCollageItem[]
} {
  const favorites = getFavoritePoems().map((fav: FavoritePoem) => ({
    poem: fav.poem,
    style: fav.style,
    words: fav.usedWords ?? [],
    date: new Date(fav.favoritedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    isFavorite: true,
  }))

  // Recent poems from session history stored in sessionStorage
  let recent: PoemCollageItem[] = []
  try {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('word-snake-recent-poems')
      if (stored) {
        recent = JSON.parse(stored).map((p: { poem: string; style: string; usedWords: string[]; timestamp: number }) => ({
          poem: p.poem,
          style: p.style,
          words: p.usedWords ?? [],
          date: new Date(p.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          isFavorite: favorites.some(f => f.poem === p.poem),
        }))
      }
    }
  } catch {
    recent = []
  }

  return { favorites, recent }
}
