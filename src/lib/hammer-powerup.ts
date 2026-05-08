'use client';

// Hammer Power-Up — break through destructible walls with bonus points.

import { DestructibleWall, DESTRUCTIBLE_WALL_CONFIG } from './destructible-walls';

export interface HammerPowerUp {
  type: 'hammer';
  position: { x: number; y: number };
  spawnTime: number;
  duration: number; // ms
}

export interface HammerState {
  active: boolean;
  expiresAt: number;
  breakCount: number;
}

export const HAMMER_CONFIG = {
  spawnChance: 0.08,
  duration: 8000,
  bonusMultiplier: 2.5,
  emoji: '🔨',
  label: 'Hammer',
  color: '#f97316',
  description: 'Break through walls with bonus points!',
} as const;

export function shouldSpawnHammer(wordsEaten: number, difficulty: number): boolean {
  if (wordsEaten < 15) return false;
  return Math.random() < HAMMER_CONFIG.spawnChance + (difficulty - 1) * 0.01;
}

export function createHammerPowerUp(position: { x: number; y: number }): HammerPowerUp {
  return { type: 'hammer', position: { ...position }, spawnTime: Date.now(), duration: HAMMER_CONFIG.duration };
}

export function createInitialHammerState(): HammerState {
  return { active: false, expiresAt: 0, breakCount: 0 };
}

export function activateHammer(state: HammerState, duration?: number): void {
  state.active = true;
  state.expiresAt = Date.now() + (duration ?? HAMMER_CONFIG.duration);
  state.breakCount = 0;
}

export function isHammerActive(state: HammerState): boolean {
  return state.active;
}

export function applyHammerOnWall(
  state: HammerState,
  wall: DestructibleWall,
): { destroyed: boolean; bonusPoints: number } {
  if (!state.active) return { destroyed: false, bonusPoints: 0 };

  wall.hp -= 1;
  const destroyed = wall.hp <= 0;

  if (destroyed) {
    state.breakCount += 1;
    const bonusPoints = Math.round(DESTRUCTIBLE_WALL_CONFIG[wall.type].points * HAMMER_CONFIG.bonusMultiplier);
    return { destroyed: true, bonusPoints };
  }
  return { destroyed: false, bonusPoints: 0 };
}

export function updateHammerState(state: HammerState): void {
  if (state.active && Date.now() >= state.expiresAt) {
    state.active = false;
  }
}

export function drawHammerIndicator(
  ctx: CanvasRenderingContext2D,
  state: HammerState,
  canvasWidth: number,
  time: number,
): void {
  if (!state.active) return;

  const remaining = Math.max(0, state.expiresAt - Date.now());
  const ratio = remaining / HAMMER_CONFIG.duration;
  const pulse = 0.7 + Math.sin(time * 0.006) * 0.3;

  const barW = 120, barH = 8, barX = canvasWidth / 2 - barW / 2, barY = 14;

  ctx.save();

  // Emoji with pulsing glow
  ctx.shadowColor = HAMMER_CONFIG.color;
  ctx.shadowBlur = 10 * pulse;
  ctx.font = '20px serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(HAMMER_CONFIG.emoji, barX - 8, barY + barH / 2 + 2);
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Background track
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(barX, barY, barW, barH, 4);
  } else {
    roundedRectPath(ctx, barX, barY, barW, barH, 4);
  }
  ctx.fill();

  // Fill — orange normally, red when < 30% remaining
  const fillW = barW * ratio;
  if (fillW > 0) {
    ctx.fillStyle = ratio > 0.3 ? HAMMER_CONFIG.color : '#ef4444';
    ctx.globalAlpha = 0.85 + pulse * 0.15;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(barX, barY, fillW, barH, 4);
    } else {
      roundedRectPath(ctx, barX, barY, fillW, barH, 4);
    }
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Break-count badge
  if (state.breakCount > 0) {
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`×${state.breakCount}`, barX + barW + 8, barY + barH / 2 + 2);
  }

  ctx.restore();
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const s = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + s, y);
  ctx.arcTo(x + w, y, x + w, y + h, s);
  ctx.arcTo(x + w, y + h, x, y + h, s);
  ctx.arcTo(x, y + h, x, y, s);
  ctx.arcTo(x, y, x + w, y, s);
  ctx.closePath();
}
