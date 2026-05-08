'use client';

// =============================================================================
// Moving Obstacles System — animated grid hazards for the Snake game.
// Canvas-rendered with glow effects, sinusoidal / circular movement, and
// full serialisation support for the replay system.
// =============================================================================

// ─── Types ────────────────────────────────────────────────────────────────────

export type MovingObstacleType = 'patrol_wall' | 'patrol_hazard' | 'spinner' | 'sweeper';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Pattern = 'horizontal' | 'vertical' | 'circular';

export interface Bounds { x: number; y: number; w: number; h: number }
export interface Size { width: number; height: number }

/**
 * A single moving obstacle. Positions are continuous floats for smooth
 * canvas animation; `getBounds()` returns an AABB in grid-cell coords.
 */
export interface MovingObstacle {
  id: number;
  type: MovingObstacleType;
  x: number;
  y: number;
  direction: Direction;
  speed: number;          // cells / second
  size: Size;
  color: string;
  pattern: Pattern;
  range: number;          // oscillation amplitude / orbit radius (cells)
  origin: { x: number; y: number };
  phase: number;          // radians – randomises path offset
  rotation: number;       // current visual rotation (radians)
  getBounds(): Bounds;
}

export interface CollisionResult { collided: boolean; obstacle: MovingObstacle | null }

export interface ObstacleTypeConfig {
  type: MovingObstacleType;
  label: string;
  color: string;
  glowColor: string;
  size: Size;
  pattern: Pattern;
  speed: number;
  range: number;
}

// ─── Obstacle Type Registry ───────────────────────────────────────────────────

export const OBSTACLE_TYPES: Record<MovingObstacleType, ObstacleTypeConfig> = {
  patrol_wall: {
    type: 'patrol_wall', label: 'Patrol Wall', color: '#475569', glowColor: '#94a3b8',
    size: { width: 2, height: 2 }, pattern: 'horizontal', speed: 3.2, range: 5,
  },
  patrol_hazard: {
    type: 'patrol_hazard', label: 'Patrol Hazard', color: '#ef4444', glowColor: '#f59e0b',
    size: { width: 1, height: 1 }, pattern: 'vertical', speed: 4.5, range: 4,
  },
  spinner: {
    type: 'spinner', label: 'Spinner', color: '#8b5cf6', glowColor: '#c084fc',
    size: { width: 1, height: 1 }, pattern: 'circular', speed: 2.0, range: 4,
  },
  sweeper: {
    type: 'sweeper', label: 'Sweeper', color: '#f97316', glowColor: '#fbbf24',
    size: { width: 3, height: 1 }, pattern: 'horizontal', speed: 5.5, range: 6,
  },
};

const TYPE_KEYS: MovingObstacleType[] = ['patrol_wall', 'patrol_hazard', 'spinner', 'sweeper'];

// ─── Internal Helpers ──────────────────────────────────────────────────────────

let nextId = 1;
const SPAWN_HEAD_MARGIN = 8;
const MAX_SPAWN_ATTEMPTS = 60;
const GRID_MARGIN = 2;

function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)); }

function createObstacle(type: MovingObstacleType, ox: number, oy: number): MovingObstacle {
  const cfg = OBSTACLE_TYPES[type];
  const phase = Math.random() * Math.PI * 2;
  return {
    id: nextId++, type, x: ox, y: oy,
    direction: cfg.pattern === 'vertical' ? 'down' : 'right',
    speed: cfg.speed, size: { ...cfg.size }, color: cfg.color,
    pattern: cfg.pattern, range: cfg.range,
    origin: { x: ox, y: oy }, phase, rotation: 0,
    getBounds() { return { x: this.x, y: this.y, w: this.size.width, h: this.size.height }; },
  };
}

/** Polyfill-safe rounded rect path (avoids ctx.roundRect API gap). */
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

// ─── Spawn Logic ───────────────────────────────────────────────────────────────

/**
 * Spawns `count` moving obstacles (clamped 2–4) avoiding the snake head
 * (8-cell margin) and existing obstacle bounding boxes.
 */
export function spawnMovingObstacles(
  count: number,
  gridWidth: number,
  gridHeight: number,
  snake: Array<{ x: number; y: number }>,
  existingObstacles: MovingObstacle[],
): MovingObstacle[] {
  const safeCount = clamp(count, 2, 4);
  const result: MovingObstacle[] = [];
  const occupied = new Set<string>();

  for (const s of snake) occupied.add(`${s.x},${s.y}`);
  for (const obs of existingObstacles) {
    const b = obs.getBounds();
    for (let dx = 0; dx < Math.ceil(b.w); dx++)
      for (let dy = 0; dy < Math.ceil(b.h); dy++)
        occupied.add(`${Math.round(b.x) + dx},${Math.round(b.y) + dy}`);
  }

  const headX = snake[0]?.x ?? Math.floor(gridWidth / 2);
  const headY = snake[0]?.y ?? Math.floor(gridHeight / 2);

  for (let i = 0; i < safeCount; i++) {
    for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt++) {
      const type = TYPE_KEYS[Math.floor(Math.random() * TYPE_KEYS.length)];
      const cfg = OBSTACLE_TYPES[type];
      const margin = GRID_MARGIN + Math.max(cfg.size.width, cfg.size.height);
      const rm = cfg.range + margin;
      const ox = rm + Math.random() * Math.max(1, gridWidth - rm * 2);
      const oy = margin + Math.random() * Math.max(1, gridHeight - margin * 2);
      if (Math.abs(ox - headX) + Math.abs(oy - headY) < SPAWN_HEAD_MARGIN) continue;
      if (occupied.has(`${Math.round(ox)},${Math.round(oy)}`)) continue;

      const obs = createObstacle(type, ox, oy);
      result.push(obs);
      const b = obs.getBounds();
      for (let dx = 0; dx < Math.ceil(b.w); dx++)
        for (let dy = 0; dy < Math.ceil(b.h); dy++)
          occupied.add(`${Math.round(b.x) + dx},${Math.round(b.y) + dy}`);
      break;
    }
  }
  return result;
}

// ─── Physics Update ────────────────────────────────────────────────────────────

/**
 * Advances every obstacle by `dt`. Movement uses continuous `time` so the
 * position is deterministic for replay: sinusoidal for patrol patterns,
 * parametric circle for spinners.
 */
export function updateMovingObstacles(
  obstacles: MovingObstacle[],
  dt: number,
  time: number,
): MovingObstacle[] {
  for (const obs of obstacles) {
    const cfg = OBSTACLE_TYPES[obs.type];
    const angle = time * cfg.speed + obs.phase;

    switch (obs.pattern) {
      case 'horizontal':
        obs.x = obs.origin.x + Math.sin(angle) * obs.range;
        obs.y = obs.origin.y;
        obs.direction = Math.cos(angle) > 0 ? 'right' : 'left';
        obs.rotation = angle * 0.5;
        break;
      case 'vertical':
        obs.y = obs.origin.y + Math.sin(angle) * obs.range;
        obs.x = obs.origin.x;
        obs.direction = Math.cos(angle) > 0 ? 'down' : 'up';
        obs.rotation = angle * 0.5;
        break;
      case 'circular':
        obs.x = obs.origin.x + Math.cos(angle) * obs.range;
        obs.y = obs.origin.y + Math.sin(angle) * obs.range;
        obs.rotation = angle;
        { // derive direction from tangent
          const tx = -Math.sin(angle), ty = Math.cos(angle);
          obs.direction = Math.abs(tx) > Math.abs(ty)
            ? (tx > 0 ? 'right' : 'left')
            : (ty > 0 ? 'down' : 'up');
        }
        break;
    }
  }
  return obstacles;
}

// ─── Collision Detection ───────────────────────────────────────────────────────

/**
 * AABB overlap test between the snake head and every obstacle.
 * Uses a small epsilon so edge-touching doesn't false-positive.
 */
export function checkMovingObstacleCollision(
  head: { x: number; y: number },
  obstacles: MovingObstacle[],
): CollisionResult {
  const E = 0.35;
  for (const obs of obstacles) {
    const b = obs.getBounds();
    if (head.x + E >= b.x && head.x - E <= b.x + b.w &&
        head.y + E >= b.y && head.y - E <= b.y + b.h) {
      return { collided: true, obstacle: obs };
    }
  }
  return { collided: false, obstacle: null };
}

// ─── Canvas Rendering ──────────────────────────────────────────────────────────

/**
 * Draws all obstacles with per-type visual effects:
 *  - patrol_wall  → gray blocks + motion trail
 *  - patrol_hazard → red pulsing + danger glow rings
 *  - spinner       → purple diamond + orbit circle
 *  - sweeper       → orange bar + sweep zone + arc indicator
 */
export function drawMovingObstacles(
  ctx: CanvasRenderingContext2D,
  obstacles: MovingObstacle[],
  cellSize: number,
  time: number,
): void {
  for (const obs of obstacles) {
    const cfg = OBSTACLE_TYPES[obs.type];
    const px = obs.x * cellSize, py = obs.y * cellSize;
    const pw = obs.size.width * cellSize, ph = obs.size.height * cellSize;
    ctx.save();

    if (obs.type === 'patrol_wall') {
      // --- Motion trail (fading copies behind) ---
      const tdx = obs.direction === 'right' ? -1 : obs.direction === 'left' ? 1 : 0;
      const tdy = obs.direction === 'down' ? -1 : obs.direction === 'up' ? 1 : 0;
      for (let i = 4; i >= 1; i--) {
        const a = 0.12 - i * 0.025; if (a <= 0) continue;
        ctx.globalAlpha = a; ctx.fillStyle = cfg.glowColor;
        ctx.beginPath(); rrect(ctx, px + tdx * i * cellSize * 0.4, py + tdy * i * cellSize * 0.4, pw, ph, 4); ctx.fill();
      }
      // Glow + main block + highlight stripe
      ctx.globalAlpha = 0.25; ctx.shadowColor = cfg.glowColor; ctx.shadowBlur = 12;
      ctx.fillStyle = cfg.glowColor;
      ctx.beginPath(); rrect(ctx, px - 2, py - 2, pw + 4, ph + 4, 6); ctx.fill(); ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.95; ctx.fillStyle = cfg.color;
      ctx.beginPath(); rrect(ctx, px, py, pw, ph, 4); ctx.fill();
      ctx.globalAlpha = 0.2; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); rrect(ctx, px + 3, py + 3, pw * 0.3, ph - 6, 2); ctx.fill();
      ctx.globalAlpha = Math.sin(time * 2) * 0.08 + 0.08; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); rrect(ctx, px, py, pw, ph, 4); ctx.fill();
    }

    else if (obs.type === 'patrol_hazard') {
      // --- Red / amber pulse + expanding danger rings ---
      const pulse = Math.sin(time * 6);
      const baseCol = pulse > 0 ? '#ef4444' : '#f59e0b';
      const glowCol = pulse > 0 ? '#fca5a5' : '#fde68a';
      const cx = px + pw / 2, cy = py + ph / 2;

      for (let r = 0; r < 2; r++) {
        const rp = (time * 1.5 + r * 0.5) % 1;
        ctx.globalAlpha = (1 - rp) * (r === 0 ? 0.35 : 0.2);
        ctx.strokeStyle = glowCol; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, cellSize * 0.5 + rp * cellSize * 1.5, 0, Math.PI * 2); ctx.stroke();
      }
      // Glow halo + main block + diamond highlight
      ctx.globalAlpha = 0.4 + pulse * 0.15; ctx.shadowColor = glowCol; ctx.shadowBlur = 16;
      ctx.fillStyle = baseCol;
      ctx.beginPath(); rrect(ctx, px - 2, py - 2, pw + 4, ph + 4, 4); ctx.fill(); ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.95; ctx.fillStyle = baseCol;
      ctx.beginPath(); rrect(ctx, px, py, pw, ph, 3); ctx.fill();
      const s = cellSize * 0.15;
      ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy); ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s, cy); ctx.closePath(); ctx.fill();
    }

    else if (obs.type === 'spinner') {
      // --- Dashed orbit ring + bright arc near block ---
      const cx = obs.origin.x * cellSize, cy = obs.origin.y * cellSize;
      const rpx = obs.range * cellSize;
      const curAngle = Math.atan2((obs.y - obs.origin.y), (obs.x - obs.origin.x));

      ctx.globalAlpha = 0.18; ctx.strokeStyle = cfg.glowColor; ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]); ctx.lineDashOffset = -time * 30;
      ctx.beginPath(); ctx.arc(cx, cy, rpx, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);

      ctx.globalAlpha = 0.35; ctx.strokeStyle = cfg.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, rpx, curAngle - Math.PI * 0.5, curAngle + Math.PI * 0.5); ctx.stroke();

      // Centre dot
      ctx.globalAlpha = 0.25; ctx.fillStyle = cfg.glowColor;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();

      // Glow + rotating diamond block
      ctx.globalAlpha = 0.4; ctx.shadowColor = cfg.glowColor; ctx.shadowBlur = 14;
      ctx.fillStyle = cfg.color;
      ctx.beginPath(); rrect(ctx, px - 2, py - 2, pw + 4, ph + 4, 4); ctx.fill(); ctx.shadowBlur = 0;

      ctx.save();
      ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(obs.rotation);
      const hw = pw / 2;
      ctx.globalAlpha = 0.95; ctx.fillStyle = cfg.color;
      ctx.beginPath(); ctx.moveTo(0, -hw); ctx.lineTo(hw, 0); ctx.lineTo(0, hw); ctx.lineTo(-hw, 0); ctx.closePath(); ctx.fill();
      const cs = hw * 0.35;
      ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(0, -cs); ctx.lineTo(cs, 0); ctx.lineTo(0, cs); ctx.lineTo(-cs, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    else if (obs.type === 'sweeper') {
      // --- Sweep zone + boundary lines + direction arrow + wide bar ---
      const cx = obs.origin.x * cellSize, cy = obs.origin.y * cellSize;
      const spx = obs.range * cellSize;

      ctx.globalAlpha = 0.08; ctx.fillStyle = cfg.glowColor;
      ctx.fillRect(cx - spx, cy, spx * 2, cellSize);
      ctx.globalAlpha = 0.2; ctx.strokeStyle = cfg.glowColor; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx - spx, cy - cellSize * 0.5); ctx.lineTo(cx - spx, cy + cellSize * 1.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + spx, cy - cellSize * 0.5); ctx.lineTo(cx + spx, cy + cellSize * 1.5); ctx.stroke();
      ctx.setLineDash([]);

      // Direction arrow
      const ad = obs.direction === 'right' ? 1 : -1;
      const ax = px + pw / 2, ay = py - cellSize * 0.25;
      ctx.globalAlpha = 0.4; ctx.fillStyle = cfg.glowColor;
      ctx.beginPath(); ctx.moveTo(ax + ad * 8, ay); ctx.lineTo(ax - ad * 4, ay - 5); ctx.lineTo(ax - ad * 4, ay + 5); ctx.closePath(); ctx.fill();

      // Glow + main bar + top highlight + leading-edge marker
      ctx.globalAlpha = 0.35; ctx.shadowColor = cfg.glowColor; ctx.shadowBlur = 10;
      ctx.fillStyle = cfg.color;
      ctx.beginPath(); rrect(ctx, px - 2, py - 2, pw + 4, ph + 4, 5); ctx.fill(); ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.95; ctx.fillStyle = cfg.color;
      ctx.beginPath(); rrect(ctx, px, py, pw, ph, 4); ctx.fill();

      const grad = ctx.createLinearGradient(px, py, px, py + ph);
      grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 0.3; ctx.fillStyle = grad;
      ctx.beginPath(); rrect(ctx, px + 2, py + 1, pw - 4, ph * 0.5, 3); ctx.fill();

      const le = obs.direction === 'right' ? px + pw : px;
      ctx.globalAlpha = 0.5; ctx.shadowColor = cfg.glowColor; ctx.shadowBlur = 8; ctx.fillStyle = cfg.glowColor;
      ctx.fillRect(le - 2, py - 1, 4, ph + 2); ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}

// ─── Serialization (Replay System) ────────────────────────────────────────────

export interface SerializedMovingObstacle {
  id: number; type: MovingObstacleType;
  x: number; y: number; direction: Direction; speed: number;
  width: number; height: number; color: string;
  pattern: Pattern; range: number;
  originX: number; originY: number; phase: number; rotation: number;
}

/** Serialize obstacles to plain objects for storage / replay. */
export function serializeMovingObstacles(obstacles: MovingObstacle[]): SerializedMovingObstacle[] {
  return obstacles.map((o) => ({
    id: o.id, type: o.type, x: o.x, y: o.y, direction: o.direction, speed: o.speed,
    width: o.size.width, height: o.size.height, color: o.color,
    pattern: o.pattern, range: o.range,
    originX: o.origin.x, originY: o.origin.y, phase: o.phase, rotation: o.rotation,
  }));
}

/** Reconstruct `MovingObstacle[]` from serialized data (reattaches `getBounds`). */
export function deserializeMovingObstacles(data: SerializedMovingObstacle[]): MovingObstacle[] {
  return data.map((d) => ({
    id: d.id, type: d.type, x: d.x, y: d.y, direction: d.direction,
    speed: d.speed, size: { width: d.width, height: d.height }, color: d.color,
    pattern: d.pattern, range: d.range,
    origin: { x: d.originX, y: d.originY }, phase: d.phase, rotation: d.rotation,
    getBounds() { return { x: this.x, y: this.y, w: this.size.width, h: this.size.height }; },
  }));
}

/** Reset auto-increment ID counter (call on new game). */
export function resetMovingObstacleIds(): void { nextId = 1; }
