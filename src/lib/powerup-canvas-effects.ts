/**
 * powerup-canvas-effects.ts
 *
 * Pure logic module for drawing power-up visual effects on an HTML5 Canvas (2D).
 * No React imports — operates entirely on `CanvasRenderingContext2D` and plain
 * data structures.
 *
 * Grid: CELL_SIZE = 20 px, canvas = 600 × 500 px.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CELL_SIZE = 20
const BOMB_ANIMATION_MS = 500
const MAX_GHOST_TRAIL = 12
const GHOST_MAX_AGE = 20
const BOMB_PARTICLE_COUNT = 18
const SPEED_LINE_COUNT = 6
const FROST_SPARKLE_COUNT = 5
const ICE_CRYSTAL_COUNT = 6

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Mutable visual state for all active power-up effects.
 * Create via {@link createPowerUpVisualState}, mutate each frame through helpers.
 */
export interface PowerUpVisualState {
  ghostMode: boolean
  ghostPositions: Array<{ x: number; y: number; age: number }>
  magnetRange: number
  bombExplosions: Array<{
    x: number
    y: number
    startTime: number
    cells: Array<{ x: number; y: number }>
  }>
  freezeActive: boolean
  speedBoostActive: boolean
  shieldActive: boolean
  scoreMultiplierActive: boolean
  scoreMultiplierValue: number
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface BombParticle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; color: string; size: number
}

interface BombExplosionInternal {
  x: number; y: number; startTime: number
  cells: Array<{ x: number; y: number }>
  particles: BombParticle[]
}

/** Parallel array kept in sync with `state.bombExplosions`. */
const internalExplosions: BombExplosionInternal[] = []

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/** Creates a fresh visual state with all effects inactive. */
export function createPowerUpVisualState(): PowerUpVisualState {
  internalExplosions.length = 0
  return {
    ghostMode: false,
    ghostPositions: [],
    magnetRange: 0,
    bombExplosions: [],
    freezeActive: false,
    speedBoostActive: false,
    shieldActive: false,
    scoreMultiplierActive: false,
    scoreMultiplierValue: 1,
  }
}

// ---------------------------------------------------------------------------
// Update logic
// ---------------------------------------------------------------------------

/**
 * Advances per-frame visual state. Ages ghost trails, removes finished bomb
 * explosions, and updates bomb particle physics.
 *
 * @param state     Mutable visual state.
 * @param deltaTime Seconds since last frame.
 * @param snakeHead Current grid position `{x, y}` of the snake head.
 */
export function updatePowerUpVisuals(
  state: PowerUpVisualState,
  deltaTime: number,
  snakeHead: { x: number; y: number },
): void {
  // Record ghost position when active
  if (state.ghostMode) {
    recordGhostPosition(state, snakeHead.x, snakeHead.y)
  }

  // Age & cull ghost trail
  for (let i = state.ghostPositions.length - 1; i >= 0; i--) {
    state.ghostPositions[i].age += deltaTime * 60
    if (state.ghostPositions[i].age > GHOST_MAX_AGE) {
      state.ghostPositions.splice(i, 1)
    }
  }
  while (state.ghostPositions.length > MAX_GHOST_TRAIL) {
    state.ghostPositions.shift()
  }

  // Remove finished bomb explosions
  const now = Date.now()
  for (let i = state.bombExplosions.length - 1; i >= 0; i--) {
    if (now - state.bombExplosions[i].startTime > BOMB_ANIMATION_MS + 200) {
      state.bombExplosions.splice(i, 1)
      internalExplosions.splice(i, 1)
    }
  }

  // Seed & update bomb particles
  for (let i = 0; i < state.bombExplosions.length; i++) {
    if (i >= internalExplosions.length || internalExplosions[i].particles.length === 0) {
      const exp = state.bombExplosions[i]
      ensureInternalExplosion(i, exp).particles = createBombParticles(
        exp.x * CELL_SIZE + CELL_SIZE / 2,
        exp.y * CELL_SIZE + CELL_SIZE / 2,
      )
    }
    for (const p of internalExplosions[i].particles) {
      p.x += p.vx * deltaTime * 60
      p.y += p.vy * deltaTime * 60
      p.vy += 60 * deltaTime
      p.vx *= Math.pow(0.96, deltaTime * 60)
      p.vy *= Math.pow(0.96, deltaTime * 60)
      p.life -= deltaTime
    }
  }
}

// ---------------------------------------------------------------------------
// State mutation helpers
// ---------------------------------------------------------------------------

/**
 * Records a snake-head position into the ghost trail. Deduplicates consecutive
 * identical positions.
 */
export function recordGhostPosition(
  state: PowerUpVisualState, x: number, y: number,
): void {
  const last = state.ghostPositions[state.ghostPositions.length - 1]
  if (last && last.x === x && last.y === y) return
  state.ghostPositions.push({ x, y, age: 0 })
}

/** Triggers a word-bomb explosion visual at the given grid position. */
export function triggerBombExplosion(
  state: PowerUpVisualState,
  x: number, y: number,
  cells: Array<{ x: number; y: number }>,
): void {
  const now = Date.now()
  state.bombExplosions.push({ x, y, startTime: now, cells })
  internalExplosions.push({ x, y, startTime: now, cells: [...cells], particles: [] })
}

// ---------------------------------------------------------------------------
// Main draw entry point
// ---------------------------------------------------------------------------

/**
 * Draws all active power-up effects onto the canvas. Call **after** the main
 * game render so effects layer on top.
 *
 * @param ctx      The 2D canvas context.
 * @param state    Current visual state (call updatePowerUpVisuals first).
 * @param cellSize Pixel size of one grid cell (typically 20).
 */
export function drawPowerUpEffects(
  ctx: CanvasRenderingContext2D,
  state: PowerUpVisualState,
  cellSize: number,
): void {
  const now = Date.now()

  if (state.freezeActive) drawFreezeOverlay(ctx, now)
  if (state.ghostMode && state.ghostPositions.length > 0) drawGhostTrail(ctx, state, cellSize)
  if (state.magnetRange > 0) drawMagnetRing(ctx, state, state.magnetRange, now, cellSize)

  for (let i = 0; i < state.bombExplosions.length; i++) {
    const ie = internalExplosions[i]
    if (ie) drawBombExplosion(ctx, state.bombExplosions[i], ie, now, cellSize)
  }

  if (state.speedBoostActive) drawSpeedLines(ctx, now, cellSize)
  if (state.shieldActive) drawShieldBubble(ctx, state, now, cellSize)
  if (state.scoreMultiplierActive && state.scoreMultiplierValue > 1) {
    drawMultiplierFloat(ctx, state, now, cellSize)
  }
}

// ---------------------------------------------------------------------------
// 1. Ghost trail
// ---------------------------------------------------------------------------

/** Draws semi-transparent cyan afterimages that fade with age. */
function drawGhostTrail(
  ctx: CanvasRenderingContext2D, state: PowerUpVisualState, cellSize: number,
): void {
  ctx.save()
  for (const pos of state.ghostPositions) {
    const ratio = 1 - pos.age / GHOST_MAX_AGE
    if (ratio <= 0) continue
    ctx.globalAlpha = ratio * 0.25
    ctx.fillStyle = '#67e8f9'
    ctx.shadowColor = '#22d3ee'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.roundRect(pos.x * cellSize + 2, pos.y * cellSize + 2, cellSize - 4, cellSize - 4, 4)
    ctx.fill()
    ctx.shadowBlur = 0
  }
  ctx.restore()
}

// ---------------------------------------------------------------------------
// 2. Magnet range ring
// ---------------------------------------------------------------------------

/** Draws a pulsing purple/magenta dashed ring around the snake head. */
function drawMagnetRing(
  ctx: CanvasRenderingContext2D, state: PowerUpVisualState, range: number, now: number, cellSize: number,
): void {
  ctx.save()
  const pulse = Math.sin(now * 0.005) * 2
  const r = (range + pulse) * cellSize
  const { cx, cy } = resolveHeadCenter(state, cellSize)

  // Radial glow fill
  const grad = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r)
  grad.addColorStop(0, 'rgba(168, 85, 247, 0.0)')
  grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.08)')
  grad.addColorStop(0.9, 'rgba(217, 70, 239, 0.15)')
  grad.addColorStop(1.0, 'rgba(217, 70, 239, 0.0)')
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()

  // Dashed ring
  const a = 0.3 + Math.sin(now * 0.004) * 0.15
  ctx.globalAlpha = a
  ctx.strokeStyle = '#d946ef'; ctx.lineWidth = 2
  ctx.setLineDash([6, 4]); ctx.lineDashOffset = -now * 0.02
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.setLineDash([])

  // Inner ring
  ctx.globalAlpha = a * 0.5
  ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2); ctx.stroke()
  ctx.restore()
}

// ---------------------------------------------------------------------------
// 3. Word bomb explosion
// ---------------------------------------------------------------------------

function createBombParticles(cx: number, cy: number): BombParticle[] {
  const colors = ['#ef4444', '#f97316', '#eab308', '#fbbf24', '#dc2626']
  const out: BombParticle[] = []
  for (let i = 0; i < BOMB_PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / BOMB_PARTICLE_COUNT + (Math.random() - 0.5) * 0.4
    const speed = 60 + Math.random() * 100
    const life = 0.3 + Math.random() * 0.4
    out.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life, maxLife: life,
      color: colors[i % colors.length],
      size: 2 + Math.random() * 3,
    })
  }
  return out
}

/** Draws expanding shockwave ring + flying orange/red/yellow particles. */
function drawBombExplosion(
  ctx: CanvasRenderingContext2D,
  exp: PowerUpVisualState['bombExplosions'][number],
  internal: BombExplosionInternal,
  now: number, cellSize: number,
): void {
  const elapsed = now - exp.startTime
  if (elapsed > BOMB_ANIMATION_MS + 200) return
  const progress = Math.min(elapsed / BOMB_ANIMATION_MS, 1)
  const cx = exp.x * cellSize + cellSize / 2
  const cy = exp.y * cellSize + cellSize / 2
  const maxR = 1.8 * cellSize

  ctx.save()

  // Outer shockwave ring
  const ringR = maxR * easeOutCubic(progress)
  const ringA = 1 - progress
  ctx.globalAlpha = ringA * 0.7
  ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3 * (1 - progress * 0.5)
  ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 12 * ringA
  ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke()
  ctx.shadowBlur = 0

  // Inner hot ring
  ctx.globalAlpha = ringA * 0.4
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2 * (1 - progress)
  ctx.beginPath(); ctx.arc(cx, cy, ringR * 0.6, 0, Math.PI * 2); ctx.stroke()

  // Center flash
  if (progress < 0.3) {
    ctx.globalAlpha = (1 - progress / 0.3) * 0.6
    const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellSize)
    fg.addColorStop(0, '#ffffff'); fg.addColorStop(0.4, '#fbbf24')
    fg.addColorStop(1, 'rgba(249, 115, 22, 0)')
    ctx.fillStyle = fg
    ctx.beginPath(); ctx.arc(cx, cy, cellSize, 0, Math.PI * 2); ctx.fill()
  }

  // Particles
  for (const p of internal.particles) {
    if (p.life <= 0) continue
    const lr = p.life / p.maxLife
    ctx.globalAlpha = lr * 0.9; ctx.fillStyle = p.color
    ctx.shadowColor = p.color; ctx.shadowBlur = 6 * lr
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * lr, 0, Math.PI * 2); ctx.fill()
  }
  ctx.shadowBlur = 0

  // Cleared cell highlight
  if (progress < 0.7) {
    ctx.globalAlpha = (1 - progress / 0.7) * 0.25
    ctx.fillStyle = '#fbbf24'
    for (const c of exp.cells) {
      ctx.fillRect(c.x * cellSize + 1, c.y * cellSize + 1, cellSize - 2, cellSize - 2)
    }
  }

  ctx.restore()
}

// ---------------------------------------------------------------------------
// 4. Freeze overlay
// ---------------------------------------------------------------------------

/** Draws a subtle full-canvas frost tint when freeze is active. */
function drawFreezeOverlay(ctx: CanvasRenderingContext2D, now: number): void {
  ctx.save()
  ctx.globalAlpha = 0.03 + Math.sin(now * 0.002) * 0.02
  ctx.fillStyle = '#bfdbfe'
  ctx.fillRect(0, 0, 600, 500)
  ctx.restore()
}

/**
 * Draws frost overlay on a specific frozen obstacle cell. Call from the game
 * renderer for each frozen obstacle position.
 *
 * @param ctx      Canvas 2D context.
 * @param gridX    Grid column of the obstacle.
 * @param gridY    Grid row of the obstacle.
 * @param cellSize Pixel size of a cell.
 * @param now      Current timestamp for animation.
 */
export function drawFreezeOnObstacle(
  ctx: CanvasRenderingContext2D,
  gridX: number, gridY: number, cellSize: number, now: number,
): void {
  const px = gridX * cellSize, py = gridY * cellSize
  ctx.save()

  // Light blue tint
  ctx.globalAlpha = 0.35; ctx.fillStyle = '#bae6fd'
  ctx.beginPath(); ctx.roundRect(px + 1, py + 1, cellSize - 2, cellSize - 2, 3); ctx.fill()

  // Sparkle dots
  const seed = gridX * 73 + gridY * 137
  for (let i = 0; i < FROST_SPARKLE_COUNT; i++) {
    const sx = px + 3 + ((seed * (i + 1) * 17) % (cellSize - 6))
    const sy = py + 3 + ((seed * (i + 1) * 31) % (cellSize - 6))
    ctx.globalAlpha = (Math.sin(now * 0.006 + i * 1.7) * 0.4 + 0.6) * 0.8
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill()
  }

  // Ice crystal prongs at edges
  ctx.globalAlpha = 0.4 + Math.sin(now * 0.003) * 0.1
  ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 1
  for (let i = 0; i < ICE_CRYSTAL_COUNT; i++) {
    const a = (Math.PI * 2 * i) / ICE_CRYSTAL_COUNT + now * 0.0005
    const ex = px + cellSize / 2 + Math.cos(a) * (cellSize / 2)
    const ey = py + cellSize / 2 + Math.sin(a) * (cellSize / 2)
    const tl = 4 + Math.sin(now * 0.004 + i) * 2
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(a) * tl, ey + Math.sin(a) * tl); ctx.stroke()
  }

  ctx.restore()
}

// ---------------------------------------------------------------------------
// 5. Speed boost lines
// ---------------------------------------------------------------------------

/** Draws horizontal streaking white/yellow lines across the canvas. */
function drawSpeedLines(ctx: CanvasRenderingContext2D, now: number, cellSize: number): void {
  ctx.save()
  for (let i = 0; i < SPEED_LINE_COUNT; i++) {
    const phase = now * 0.008 + i * 1.3
    const y = (i / SPEED_LINE_COUNT) * 500
    const xOff = ((phase * 400) % 700) - 100
    const len = 30 + Math.sin(phase * 2) * 15
    const alpha = 0.15 + Math.sin(phase) * 0.1

    ctx.globalAlpha = alpha
    ctx.strokeStyle = i % 2 === 0 ? '#fde68a' : '#ffffff'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(xOff, y); ctx.lineTo(xOff - len, y); ctx.stroke()

    // Secondary thin line
    ctx.globalAlpha = alpha * 0.5; ctx.lineWidth = 0.8
    const yOff = 4 * cellSize * 0.05
    ctx.beginPath(); ctx.moveTo(xOff + 3, y + yOff); ctx.lineTo(xOff - len + 8, y + yOff); ctx.stroke()
  }
  ctx.restore()
}

// ---------------------------------------------------------------------------
// 6. Shield bubble
// ---------------------------------------------------------------------------

/** Draws a translucent blue bubble with highlight glint around the snake head. */
function drawShieldBubble(
  ctx: CanvasRenderingContext2D, state: PowerUpVisualState, now: number, cellSize: number,
): void {
  ctx.save()
  const { cx, cy } = resolveHeadCenter(state, cellSize)
  const base = cellSize * 1.1
  const breathe = Math.sin(now * 0.004) * 1.5
  const r = base + breathe

  // Outer glow
  const gg = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.3)
  gg.addColorStop(0, 'rgba(59, 130, 246, 0.0)'); gg.addColorStop(0.7, 'rgba(59, 130, 246, 0.06)')
  gg.addColorStop(1, 'rgba(59, 130, 246, 0.0)')
  ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2); ctx.fill()

  // Bubble body
  ctx.globalAlpha = 0.2
  const bg = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r)
  bg.addColorStop(0, 'rgba(147, 197, 253, 0.5)'); bg.addColorStop(0.6, 'rgba(59, 130, 246, 0.3)')
  bg.addColorStop(1, 'rgba(37, 99, 235, 0.15)')
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()

  // Edge ring
  ctx.globalAlpha = 0.45 + Math.sin(now * 0.003) * 0.1
  ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()

  // Highlight glint
  ctx.globalAlpha = 0.5; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.55, -Math.PI * 0.7, -Math.PI * 0.3)
  ctx.stroke()
  ctx.restore()
}

// ---------------------------------------------------------------------------
// 7. Score multiplier float
// ---------------------------------------------------------------------------

/** Draws a gently bobbing "×N" pill near the snake head. */
function drawMultiplierFloat(
  ctx: CanvasRenderingContext2D, state: PowerUpVisualState, now: number, cellSize: number,
): void {
  ctx.save()
  const { cx, cy } = resolveHeadCenter(state, cellSize)
  const bob = Math.sin(now * 0.005) * 3
  const tx = cx + cellSize * 0.8
  const ty = cy - cellSize * 0.9 + bob

  const label = state.scoreMultiplierValue === Math.floor(state.scoreMultiplierValue)
    ? `×${state.scoreMultiplierValue}`
    : `×${state.scoreMultiplierValue.toFixed(1)}`

  // Background pill
  ctx.globalAlpha = 0.6; ctx.font = 'bold 14px monospace'
  const m = ctx.measureText(label)
  const pw = m.width + 10, ph = 20
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath(); ctx.roundRect(tx - pw / 2, ty - ph / 2 - 2, pw, ph, 6); ctx.fill()

  // Gold text
  ctx.globalAlpha = 0.9 + Math.sin(now * 0.006) * 0.1
  ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 6
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(label, tx, ty)
  ctx.shadowBlur = 0
  ctx.restore()
}

// ---------------------------------------------------------------------------
// Additional exported utilities
// ---------------------------------------------------------------------------

/**
 * Returns the alpha to apply to the snake body in ghost mode (0.35 when active,
 * 1.0 otherwise).
 */
export function getGhostSnakeAlpha(state: PowerUpVisualState): number {
  return state.ghostMode ? 0.35 : 1.0
}

/**
 * Draws a cyan radial glow around the snake head during ghost mode. Call after
 * rendering the head.
 */
export function drawGhostHeadGlow(
  ctx: CanvasRenderingContext2D,
  headX: number, headY: number, cellSize: number, now: number,
): void {
  ctx.save()
  const pulse = Math.sin(now * 0.006) * 2 + 8
  const g = ctx.createRadialGradient(headX, headY, 0, headX, headY, cellSize + pulse)
  g.addColorStop(0, 'rgba(34, 211, 238, 0.3)'); g.addColorStop(0.5, 'rgba(34, 211, 238, 0.1)')
  g.addColorStop(1, 'rgba(34, 211, 238, 0.0)')
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(headX, headY, cellSize + pulse, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

// ---------------------------------------------------------------------------
// Shared internal helpers
// ---------------------------------------------------------------------------

function resolveHeadCenter(
  state: PowerUpVisualState, cellSize: number,
): { cx: number; cy: number } {
  if (state.ghostPositions.length > 0) {
    const last = state.ghostPositions[state.ghostPositions.length - 1]
    return { cx: last.x * cellSize + cellSize / 2, cy: last.y * cellSize + cellSize / 2 }
  }
  return { cx: cellSize * 15, cy: cellSize * 12 }
}

function ensureInternalExplosion(
  index: number, exp: PowerUpVisualState['bombExplosions'][number],
): BombExplosionInternal {
  if (index < internalExplosions.length) return internalExplosions[index]
  const internal: BombExplosionInternal = {
    x: exp.x, y: exp.y, startTime: exp.startTime,
    cells: [...exp.cells], particles: [],
  }
  internalExplosions.push(internal)
  return internal
}

function easeOutCubic(t: number): number { return 1 - Math.pow(1 - t, 3) }
