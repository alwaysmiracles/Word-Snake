'use client';

// Destructible Walls System for Word Snake Game
// Walls that can be broken when the snake has a hammer power-up.

// ─── Types ──────────────────────────────────────────────────────────────────

export type WallType = 'brick' | 'ice_wall' | 'crystal';

export interface DestructibleWall {
  id: number;
  x: number;
  y: number;
  hp: number;       // current hit points (1–maxHp)
  maxHp: number;
  type: WallType;
  width: number;    // cells
  height: number;   // cells
}

export interface DestructibleWallConfig {
  label: string;
  emoji: string;
  color: string;
  colorAlt: string;
  glowColor: string;
  defaultHp: number;
  points: number;
}

// ─── Configuration ──────────────────────────────────────────────────────────

export const DESTRUCTIBLE_WALL_CONFIG: Record<WallType, DestructibleWallConfig> = {
  brick: {
    label: 'Brick Wall',
    emoji: '🧱',
    color: '#92400e',
    colorAlt: '#b91c1c',
    glowColor: '#f97316',
    defaultHp: 2,
    points: 10,
  },
  ice_wall: {
    label: 'Ice Wall',
    emoji: '🧊',
    color: '#0ea5e9',
    colorAlt: '#7dd3fc',
    glowColor: '#38bdf8',
    defaultHp: 1,
    points: 5,
  },
  crystal: {
    label: 'Crystal Wall',
    emoji: '💎',
    color: '#7c3aed',
    colorAlt: '#c084fc',
    glowColor: '#a855f7',
    defaultHp: 3,
    points: 25,
  },
};

const WALL_TYPES: WallType[] = ['brick', 'ice_wall', 'crystal'];
const WALL_WEIGHTS: Record<WallType, number> = { brick: 45, ice_wall: 35, crystal: 20 };

// ─── ID Generator ───────────────────────────────────────────────────────────

let wallIdCounter = 0;

export function resetDestructibleWallIds(): void {
  wallIdCounter = 0;
}

function nextWallId(): number {
  return ++wallIdCounter;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pickWallType(): WallType {
  const total = WALL_TYPES.reduce((s, t) => s + WALL_WEIGHTS[t], 0);
  let roll = Math.random() * total;
  for (const t of WALL_TYPES) {
    roll -= WALL_WEIGHTS[t];
    if (roll <= 0) return t;
  }
  return 'brick';
}

/** Draw a small 4-pointed star shape. */
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i - Math.PI / 2;
    const method = i === 0 ? 'moveTo' : 'lineTo';
    ctx[method](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    const ia = a + Math.PI / 4;
    ctx.lineTo(cx + Math.cos(ia) * r * 0.35, cy + Math.sin(ia) * r * 0.35);
  }
  ctx.closePath();
  ctx.fill();
}

/** Crack pattern overlaid on damaged walls. Intensity 0–1. */
function drawCracks(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number, ph: number, intensity: number): void {
  ctx.save();
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.6 + intensity * 0.3;
  const seed = Math.floor(intensity * 100);
  for (let i = 0; i < 1 + Math.floor(intensity * 3); i++) {
    let cx = px + (seed * (i + 1) * 17) % pw;
    let cy = py + (seed * (i + 1) * 31) % ph;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const segs = 2 + (i % 2);
    for (let s = 0; s < segs; s++) {
      cx = Math.max(px, Math.min(px + pw, cx + ((seed * (i + s + 1) * 7) % (pw * 0.4)) - pw * 0.2));
      cy = Math.max(py, Math.min(py + ph, cy + ((seed * (i + s + 1) * 13) % (ph * 0.4)) - ph * 0.2));
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** HP bar drawn above a wall when damaged. */
function drawHpBar(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number, hp: number, maxHp: number): void {
  const barH = 3, barY = py - barH - 2, ratio = Math.max(0, hp / maxHp);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(px, barY, pw, barH);
  ctx.fillStyle = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#eab308' : '#ef4444';
  ctx.fillRect(px, barY, pw * ratio, barH);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(px, barY, pw, barH);
}

// ─── Spawn ──────────────────────────────────────────────────────────────────

export function spawnDestructibleWalls(
  count: number,
  gridW: number,
  gridH: number,
  snake: Array<{ x: number; y: number }>,
  existing: Array<{ x: number; y: number }>,
): DestructibleWall[] {
  const walls: DestructibleWall[] = [];
  const occ = new Set<string>();

  for (const seg of snake) occ.add(`${seg.x},${seg.y}`);
  if (snake.length > 0) {
    const h = snake[0];
    for (let dx = -3; dx <= 3; dx++)
      for (let dy = -3; dy <= 3; dy++)
        occ.add(`${h.x + dx},${h.y + dy}`);
  }
  for (const p of existing) occ.add(`${p.x},${p.y}`);

  const margin = 1;
  let attempts = 0;

  while (walls.length < count && attempts < count * 60) {
    attempts++;
    const type = pickWallType();
    const hp = Math.max(1, Math.min(3, DESTRUCTIBLE_WALL_CONFIG[type].defaultHp));
    const w = Math.random() < 0.1 && gridW > 12 ? 2 : 1;
    const h = w === 1 && Math.random() < 0.1 && gridH > 12 ? 2 : 1;
    const x = margin + Math.floor(Math.random() * (gridW - margin * 2 - (w - 1)));
    const y = margin + Math.floor(Math.random() * (gridH - margin * 2 - (h - 1)));

    let blocked = false;
    for (let dx = 0; dx < w && !blocked; dx++)
      for (let dy = 0; dy < h && !blocked; dy++)
        if (occ.has(`${x + dx},${y + dy}`)) blocked = true;
    if (blocked) continue;

    walls.push({ id: nextWallId(), x, y, hp, maxHp: hp, type, width: w, height: h });
    for (let dx = 0; dx < w; dx++)
      for (let dy = 0; dy < h; dy++)
        occ.add(`${x + dx},${y + dy}`);
  }
  return walls;
}

// ─── Hit / Destroy ──────────────────────────────────────────────────────────

export function hitDestructibleWall(wall: DestructibleWall): boolean {
  wall.hp -= 1;
  return wall.hp <= 0;
}

// ─── Serialization ──────────────────────────────────────────────────────────

export function serializeDestructibleWalls(walls: DestructibleWall[]): string {
  return JSON.stringify(walls);
}

export function deserializeDestructibleWalls(data: string): DestructibleWall[] {
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    let maxId = 0;
    for (const w of parsed)
      if (w && typeof w.id === 'number' && w.id > maxId) maxId = w.id;
    if (maxId >= wallIdCounter) wallIdCounter = maxId;
    return parsed as DestructibleWall[];
  } catch {
    return [];
  }
}

// ─── Drawing ────────────────────────────────────────────────────────────────

export function drawDestructibleWalls(
  ctx: CanvasRenderingContext2D,
  walls: DestructibleWall[],
  cellSize: number,
  time: number,
): void {
  ctx.save();
  for (const wall of walls) {
    const cfg = DESTRUCTIBLE_WALL_CONFIG[wall.type];
    const px = wall.x * cellSize, py = wall.y * cellSize;
    const pw = wall.width * cellSize, ph = wall.height * cellSize;
    const pad = 1;

    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 8 + Math.sin(time * 0.003) * 3;

    if (wall.type === 'brick') {
      // ── Brick ──
      ctx.fillStyle = cfg.color;
      ctx.fillRect(px + pad, py + pad, pw - pad * 2, ph - pad * 2);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      const bH = cellSize * 0.5;
      for (let r = 0; r < Math.ceil(ph / bH); r++) {
        const ry = py + r * bH;
        ctx.beginPath(); ctx.moveTo(px + pad, ry); ctx.lineTo(px + pw - pad, ry); ctx.stroke();
        const off = r % 2 === 0 ? 0 : cellSize * 0.5;
        for (let c = 0; c <= Math.ceil(pw / cellSize) + 1; c++) {
          const lx = px + c * cellSize + off;
          if (lx < px + pad || lx > px + pw - pad) continue;
          ctx.beginPath(); ctx.moveTo(lx, ry); ctx.lineTo(lx, Math.min(ry + bH, py + ph - pad)); ctx.stroke();
        }
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = cfg.colorAlt;
        for (let c = 0; c <= Math.ceil(pw / cellSize); c++)
          ctx.fillRect(px + c * cellSize + off + 2, ry + 2, cellSize * 0.5 - 4, bH * 0.35);
        ctx.globalAlpha = 1;
      }
      if (wall.hp < wall.maxHp) drawCracks(ctx, px, py, pw, ph, 1 - wall.hp / wall.maxHp);
    } else if (wall.type === 'ice_wall') {
      // ── Ice Wall ──
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = cfg.color;
      ctx.fillRect(px + pad, py + pad, pw - pad * 2, ph - pad * 2);
      const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
      g.addColorStop(0, cfg.colorAlt); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, cfg.colorAlt);
      ctx.globalAlpha = 0.2 + Math.sin(time * 0.004) * 0.1;
      ctx.fillStyle = g;
      ctx.fillRect(px + pad, py + pad, pw - pad * 2, ph - pad * 2);
      const band = (time * 0.08) % (pw * 2);
      ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + pad + band - pw * 0.5, py + pad, pw * 0.3, ph - pad * 2);
      ctx.globalAlpha = 0.6; ctx.strokeStyle = cfg.colorAlt; ctx.lineWidth = 1.5;
      ctx.strokeRect(px + pad + 0.5, py + pad + 0.5, pw - pad * 2 - 1, ph - pad * 2 - 1);
      ctx.globalAlpha = 1;
    } else {
      // ── Crystal ──
      const hue = (time * 0.05) % 360;
      const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
      g.addColorStop(0, cfg.color); g.addColorStop(0.35, cfg.colorAlt);
      g.addColorStop(0.65, cfg.color); g.addColorStop(1, cfg.colorAlt);
      ctx.fillStyle = g;
      ctx.fillRect(px + pad, py + pad, pw - pad * 2, ph - pad * 2);
      // Facet lines
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px + pw * 0.3, py + pad); ctx.lineTo(px + pw * 0.5, py + ph * 0.5); ctx.lineTo(px + pw * 0.3, py + ph - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + pw * 0.7, py + pad); ctx.lineTo(px + pw * 0.5, py + ph * 0.5); ctx.lineTo(px + pw * 0.7, py + ph - pad); ctx.stroke();
      // Sparkles
      for (let i = 0; i < 3; i++) {
        const a = Math.max(0, Math.sin((time * 0.002 + i * 2.1) % (Math.PI * 2)));
        if (a < 0.1) continue;
        ctx.globalAlpha = a * 0.9; ctx.fillStyle = '#ffffff';
        drawStar(ctx, px + ((i * 37 + time * 0.02) % (pw - 2)) + 1, py + ((i * 53 + time * 0.015) % (ph - 2)) + 1, 2 + a * 3);
      }
      ctx.globalAlpha = 0.15 + Math.sin(time * 0.003) * 0.08;
      ctx.strokeStyle = `hsl(${hue}, 70%, 70%)`; ctx.lineWidth = 2;
      ctx.strokeRect(px + pad, py + pad, pw - pad * 2, ph - pad * 2);
      ctx.globalAlpha = 1;
      if (wall.hp < wall.maxHp) drawCracks(ctx, px, py, pw, ph, 1 - wall.hp / wall.maxHp);
    }

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    if (wall.hp < wall.maxHp) drawHpBar(ctx, px, py, pw, wall.hp, wall.maxHp);
  }
  ctx.restore();
}

// ─── Collision Utility ──────────────────────────────────────────────────────

export function getDestructibleWallAt(
  x: number, y: number, walls: DestructibleWall[],
): DestructibleWall | null {
  for (const w of walls)
    if (x >= w.x && x < w.x + w.width && y >= w.y && y < w.y + w.height) return w;
  return null;
}
