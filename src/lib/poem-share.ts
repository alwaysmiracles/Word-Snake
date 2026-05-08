/**
 * Poem Sharing — generates a beautiful 1080×1080 shareable social media image
 * from poem results, and provides share/download functionality.
 */

const SHARE_WIDTH = 1080
const SHARE_HEIGHT = 1080
const PADDING = 80
const MAX_LINE_CHARS = 40

/**
 * Wrap a line of text at approximately `maxChars` characters, breaking at word boundaries.
 */
function wrapLine(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text]
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (current.length + (current ? 1 : 0) + word.length > maxChars) {
      if (current) lines.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) lines.push(current)
  return lines
}

/**
 * Generate a beautiful shareable PNG image for a poem.
 * Returns the canvas content as a Blob.
 */
export async function generateShareImage(
  poem: string,
  style: string,
  usedWords: string[],
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = SHARE_WIDTH
  canvas.height = SHARE_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas 2d context')

  // ── Background gradient ──────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, SHARE_WIDTH, SHARE_HEIGHT)
  bgGrad.addColorStop(0, '#1e1b4b')
  bgGrad.addColorStop(0.5, '#0f172a')
  bgGrad.addColorStop(1, '#1a0533')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT)

  // ── Constellation dot pattern ────────────────────────────────
  const dotCount = 120
  for (let i = 0; i < dotCount; i++) {
    const x = Math.random() * SHARE_WIDTH
    const y = Math.random() * SHARE_HEIGHT
    const radius = 0.5 + Math.random() * 1.5
    const opacity = 0.05 + Math.random() * 0.25
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.fill()
  }

  // ── Soft radial glow in center ───────────────────────────────
  const glowGrad = ctx.createRadialGradient(
    SHARE_WIDTH / 2, SHARE_HEIGHT / 2, 50,
    SHARE_WIDTH / 2, SHARE_HEIGHT / 2, 400,
  )
  glowGrad.addColorStop(0, 'rgba(124, 58, 237, 0.12)')
  glowGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.06)')
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glowGrad
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT)

  // ── Decorative thin border with rounded corners ──────────────
  const borderInset = 24
  const borderRadius = 20
  ctx.strokeStyle = 'rgba(124, 58, 237, 0.25)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(borderInset, borderInset, SHARE_WIDTH - borderInset * 2, SHARE_HEIGHT - borderInset * 2, borderRadius)
  ctx.stroke()

  // ── Corner ornaments (✦ symbols) ─────────────────────────────
  ctx.font = '18px serif'
  ctx.fillStyle = 'rgba(196, 181, 253, 0.35)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const ornPad = 38
  ctx.fillText('✦', ornPad, ornPad)
  ctx.textAlign = 'right'
  ctx.fillText('✦', SHARE_WIDTH - ornPad, ornPad)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText('✦', ornPad, SHARE_HEIGHT - ornPad)
  ctx.textAlign = 'right'
  ctx.fillText('✦', SHARE_WIDTH - ornPad, SHARE_HEIGHT - ornPad)

  // Reset for subsequent drawing
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // ── Title section ────────────────────────────────────────────
  const titleY = PADDING + 50

  // "✨ Word Snake Poem"
  ctx.font = 'bold 36px sans-serif'
  ctx.fillStyle = '#c4b5fd'
  ctx.fillText('✨ Word Snake Poem', SHARE_WIDTH / 2, titleY)

  // Style label
  ctx.font = '18px sans-serif'
  ctx.fillStyle = '#7c3aed'
  ctx.fillText(style, SHARE_WIDTH / 2, titleY + 36)

  // ── Poem text ────────────────────────────────────────────────
  const poemFontSize = 24
  const lineSpacing = poemFontSize * 1.6
  ctx.font = `italic ${poemFontSize}px serif`
  ctx.fillStyle = '#e2e8f0'
  ctx.textAlign = 'center'

  const rawLines = poem.split('\n')
  const wrappedLines: string[] = []
  for (const line of rawLines) {
    const wrapped = wrapLine(line, MAX_LINE_CHARS)
    wrappedLines.push(...wrapped)
  }

  // Calculate vertical start to center the poem block
  const poemBlockHeight = wrappedLines.length * lineSpacing
  const wordsSectionHeight = usedWords.length > 0 ? 100 : 0
  const availableHeight = SHARE_HEIGHT - titleY - 80 - PADDING - wordsSectionHeight - 40
  let poemY = titleY + 70 + Math.max(0, (availableHeight - poemBlockHeight) / 2)

  for (const line of wrappedLines) {
    ctx.fillText(line, SHARE_WIDTH / 2, poemY)
    poemY += lineSpacing
  }

  // ── Used words section ───────────────────────────────────────
  if (usedWords.length > 0) {
    const wordsY = SHARE_HEIGHT - PADDING - 60 - wordsSectionHeight + 40

    // "Words woven in:" label
    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('Words woven in:', SHARE_WIDTH / 2, wordsY)

    // Comma-separated word list
    ctx.font = 'italic 15px serif'
    ctx.fillStyle = '#c4b5fd'
    const wordsText = usedWords.join(', ')
    const wrappedWords = wrapLine(wordsText, 55)
    let wy = wordsY + 26
    for (const wl of wrappedWords.slice(0, 3)) {
      ctx.fillText(wl, SHARE_WIDTH / 2, wy)
      wy += 22
    }
    if (wrappedWords.length > 3) {
      ctx.fillStyle = '#7c3aed80'
      ctx.fillText(`...and ${usedWords.length - wrappedWords.slice(0, 3).join(', ').split(', ').length} more`, SHARE_WIDTH / 2, wy)
    }
  }

  // ── Watermark ────────────────────────────────────────────────
  ctx.font = '12px sans-serif'
  ctx.fillStyle = 'rgba(148, 163, 184, 0.25)'
  ctx.textAlign = 'center'
  ctx.fillText('word-snake.game', SHARE_WIDTH / 2, SHARE_HEIGHT - 36)

  // Convert canvas to Blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create image blob'))
      },
      'image/png',
      1.0,
    )
  })
}

/**
 * Share a poem image using the Web Share API if available,
 * otherwise fall back to downloading.
 */
export async function sharePoem(blob: Blob): Promise<void> {
  const file = new File([blob], 'word-snake-poem.png', { type: 'image/png' })

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'Word Snake Poem',
        text: 'Check out this poem I created with Word Snake!',
        files: [file],
      })
      return
    } catch {
      // User cancelled or share failed — fall back to download
    }
  }

  // Fallback: download the image
  downloadShareImage(blob)
}

/**
 * Download the generated share image as a PNG file.
 */
export function downloadShareImage(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename ?? `word-snake-poem-${Date.now()}.png`
  link.href = url
  link.click()
  // Clean up after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
