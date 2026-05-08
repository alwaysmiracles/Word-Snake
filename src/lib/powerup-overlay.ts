'use client';

import { type PowerUpType, POWERUP_CONFIG } from './powerups';

// --- Types -----------------------------------------------------------------

/** Shape of a single active power-up entry rendered in the overlay. */
export type ActivePowerUpOverlay = {
  type: PowerUpType;
  remainingMs: number;
  totalMs: number;
  stacks: number;
  label: string;
  emoji: string;
  color: string;
  description: string;
};

/** Supported overlay layout strategies. */
export type PowerUpOverlayLayout = 'horizontal' | 'vertical' | 'grid' | 'minimal';

// --- Constants ------------------------------------------------------------
export const OVERLAY_PADDING = 8;
export const OVERLAY_BAR_HEIGHT = 3;
export const OVERLAY_MIN_WIDTH = 90;
export const OVERLAY_HEIGHT = 28;

// --- Themes --------------------------------------------------------------

export const POWERUP_OVERLAY_THEMES: Record<
  string,
  { background: string; border: string; text: string; glow: string }
> = {
  default: {
    background: 'rgba(15, 23, 42, 0.85)',
    border: '#475569',
    text: '#ffffff',
    glow: 'rgba(59, 130, 246, 0.6)',
  },
  neon: {
    background: 'rgba(10, 10, 30, 0.9)',
    border: '', // filled per-power-up at draw time
    text: '#00ffcc',
    glow: '0 0 10px #00ffcc',
  },
  minimal: {
    background: 'transparent',
    border: 'transparent',
    text: 'rgba(255,255,255,0.55)',
    glow: 'transparent',
  },
  frost: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.25)',
    text: '#1e293b',
    glow: 'rgba(255, 255, 255, 0.3)',
  },
};

// --- Helpers -------------------------------------------------------------

/** Format remaining ms as "12s", "9.4s", or "<1s". */
export function formatPowerUpTime(ms: number): string {
  if (ms < 1000) return '<1s';
  const secs = ms / 1000;
  return secs >= 10 ? `${Math.round(secs)}s` : `${secs.toFixed(1)}s`;
}

/** Classify urgency: critical <15%, warning <30%, normal <70%, fresh otherwise. */
export function getPowerUpUrgency(
  remainingMs: number,
  totalMs: number,
): 'critical' | 'warning' | 'normal' | 'fresh' {
  if (totalMs === 0) return 'fresh';
  const ratio = remainingMs / totalMs;
  if (ratio < 0.15) return 'critical';
  if (ratio < 0.3) return 'warning';
  if (ratio < 0.7) return 'normal';
  return 'fresh';
}

/** Return 0-100 progress-bar percentage. */
export function getPowerUpProgressBarWidth(
  remainingMs: number,
  totalMs: number,
): number {
  if (totalMs <= 0) return 0;
  return Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));
}

// --- Layout --------------------------------------------------------------

const GAP = 6;

/** Calculate the canvas position for the *index*-th overlay badge. */
export function calculateOverlayPosition(
  index: number,
  total: number,
  layout: PowerUpOverlayLayout,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number } {
  const col = index % 2;
  const row = layout === 'grid' ? Math.floor(index / 2) : index;
  const slotH = OVERLAY_HEIGHT + OVERLAY_BAR_HEIGHT + GAP;

  switch (layout) {
    case 'horizontal': {
      const slotW = OVERLAY_MIN_WIDTH + GAP;
      const startX = (canvasWidth - total * slotW) / 2;
      return { x: startX + index * slotW, y: GAP };
    }
    case 'vertical': {
      return {
        x: canvasWidth - OVERLAY_MIN_WIDTH - OVERLAY_PADDING,
        y: GAP + index * slotH,
      };
    }
    case 'grid': {
      const slotW = OVERLAY_MIN_WIDTH + GAP;
      return { x: OVERLAY_PADDING + col * slotW, y: GAP + row * slotH };
    }
    case 'minimal': {
      const slotW = OVERLAY_MIN_WIDTH * 0.75 + GAP;
      const startX = (canvasWidth - total * slotW) / 2;
      return { x: startX + index * slotW, y: 2 };
    }
  }
}

// --- Drawing -------------------------------------------------------------

const URGENCY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  warning: '#f59e0b',
  normal: '#e2e8f0',
  fresh: '#22c55e',
};

/** Render an active power-up badge: pill, emoji, timer, stacks, bar, glow, pulse. */
export function drawPowerUpOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: ActivePowerUpOverlay,
  position: { x: number; y: number },
  theme: string,
  urgency: 'critical' | 'warning' | 'normal' | 'fresh',
  time: number,
): void {
  const t = POWERUP_OVERLAY_THEMES[theme] ?? POWERUP_OVERLAY_THEMES.default;
  const w = OVERLAY_MIN_WIDTH;
  const h = OVERLAY_HEIGHT;
  const r = 6;
  const { x, y } = position;
  const pulse = urgency === 'critical' ? 0.12 * Math.abs(Math.sin(time * 0.025)) : 0;
  ctx.save();
  // Glow for warning & critical
  if (urgency === 'critical' || urgency === 'warning') {
    ctx.shadowColor = URGENCY_COLOR[urgency];
    ctx.shadowBlur = 8 + pulse * 16;
  }
  // Background pill
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = t.background;
  ctx.fill();
  if (t.border !== 'transparent') {
    ctx.strokeStyle = theme === 'neon' ? (overlay.color ?? t.text) : t.border;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  // Emoji
  ctx.font = '14px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(overlay.emoji, x + OVERLAY_PADDING, y + h / 2);
  // Label (colored by urgency)
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = URGENCY_COLOR[urgency];
  ctx.textAlign = 'left';
  ctx.fillText(overlay.label, x + OVERLAY_PADDING + 18, y + h / 2 - 1);
  // Timer
  ctx.font = '10px monospace';
  ctx.fillStyle = t.text;
  ctx.textAlign = 'right';
  ctx.fillText(formatPowerUpTime(overlay.remainingMs), x + w - OVERLAY_PADDING, y + h / 2);
  // Stacks indicator
  if (overlay.stacks > 1) {
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'right';
    ctx.fillText(`×${overlay.stacks}`, x + w - OVERLAY_PADDING - 28, y + h / 2);
  }
  // Progress bar (track + filled segment)
  const barY = y + h + 1;
  const barW = getPowerUpProgressBarWidth(overlay.remainingMs, overlay.totalMs);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.roundRect(x + 2, barY, w - 4, OVERLAY_BAR_HEIGHT, 1.5);
  ctx.fill();
  if (barW > 0) {
    ctx.fillStyle = URGENCY_COLOR[urgency];
    ctx.globalAlpha =
      urgency === 'critical' ? 0.7 + 0.3 * Math.abs(Math.sin(time * 0.02)) : 1;
    ctx.beginPath();
    ctx.roundRect(x + 2, barY, Math.max(0, ((w - 4) * barW) / 100), OVERLAY_BAR_HEIGHT, 1.5);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
