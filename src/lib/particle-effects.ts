'use client';

// ============================================================
// Types
// ============================================================

export type ParticleType =
  | 'burst'
  | 'spiral'
  | 'ring'
  | 'star'
  | 'trail'
  | 'confetti'
  | 'sparkle'
  | 'snow'
  | 'rain'
  | 'firework';

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  type: ParticleType;
  gravity: number;
  friction: number;
  opacity: number;
}

export interface EffectPreset {
  name: string;
  emoji: string;
  description: string;
  particleCount: number;
  colors: string[];
  spread: number;
  speed: number;
  gravity: number;
  sizeRange: [number, number];
  lifetime: [number, number];
  types: ParticleType[];
}

// ============================================================
// Helpers
// ============================================================

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hslToString(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function generateRainbowColor(): string {
  const h = Math.random() * 360;
  return hslToString(h, 80 + Math.random() * 20, 50 + Math.random() * 15);
}

// ============================================================
// Presets
// ============================================================

export const PRESET_EFFECTS: Record<string, EffectPreset> = {
  word_eat: {
    name: 'Word Eat',
    emoji: '💚',
    description: 'Green & gold burst when eating a word',
    particleCount: 12,
    colors: ['#22c55e', '#16a34a', '#eab308', '#facc15', '#4ade80'],
    spread: 2.5,
    speed: 3,
    gravity: 1.5,
    sizeRange: [3, 7],
    lifetime: [0.4, 0.8],
    types: ['burst'],
  },

  combo_fire: {
    name: 'Combo Fire',
    emoji: '🔥',
    description: 'Fiery spiral for combo streaks',
    particleCount: 20,
    colors: ['#ef4444', '#f97316', '#eab308', '#fbbf24', '#dc2626'],
    spread: 4,
    speed: 5,
    gravity: 0.5,
    sizeRange: [3, 8],
    lifetime: [0.5, 1.2],
    types: ['spiral'],
  },

  boss_defeat: {
    name: 'Boss Defeat',
    emoji: '💥',
    description: 'Rainbow fireworks when defeating a boss',
    particleCount: 40,
    colors: [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
      '#8b5cf6', '#ec4899', '#facc15', '#06b6d4', '#a855f7',
    ],
    spread: 6,
    speed: 7,
    gravity: 1.2,
    sizeRange: [4, 10],
    lifetime: [0.8, 2.0],
    types: ['firework'],
  },

  powerup_collect: {
    name: 'Powerup Collect',
    emoji: '⚡',
    description: 'Blue-cyan ring when collecting a powerup',
    particleCount: 15,
    colors: ['#3b82f6', '#06b6d4', '#22d3ee', '#60a5fa', '#0ea5e9'],
    spread: 3,
    speed: 4,
    gravity: 0,
    sizeRange: [3, 6],
    lifetime: [0.5, 1.0],
    types: ['ring'],
  },

  achievement_unlock: {
    name: 'Achievement Unlock',
    emoji: '🏆',
    description: 'Golden confetti celebration',
    particleCount: 30,
    colors: ['#eab308', '#f59e0b', '#d97706', '#fbbf24', '#fcd34d'],
    spread: 4,
    speed: 4,
    gravity: 2.0,
    sizeRange: [4, 9],
    lifetime: [1.0, 2.5],
    types: ['confetti'],
  },

  quiz_correct: {
    name: 'Quiz Correct',
    emoji: '✨',
    description: 'Purple sparkle for correct answers',
    particleCount: 10,
    colors: ['#8b5cf6', '#a855f7', '#d946ef', '#c084fc', '#e879f9'],
    spread: 1.5,
    speed: 2,
    gravity: 0,
    sizeRange: [2, 5],
    lifetime: [0.3, 0.7],
    types: ['sparkle'],
  },

  coin_earn: {
    name: 'Coin Earn',
    emoji: '🪙',
    description: 'Yellow-gold burst for earning coins',
    particleCount: 8,
    colors: ['#eab308', '#facc15', '#fbbf24', '#f59e0b', '#fde047'],
    spread: 1.8,
    speed: 2.5,
    gravity: 1.0,
    sizeRange: [3, 6],
    lifetime: [0.3, 0.6],
    types: ['burst'],
  },

  portal_enter: {
    name: 'Portal Enter',
    emoji: '🌀',
    description: 'Cyan-blue-purple spiral portal effect',
    particleCount: 16,
    colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#22d3ee', '#60a5fa'],
    spread: 2.5,
    speed: 3.5,
    gravity: 0,
    sizeRange: [3, 7],
    lifetime: [0.5, 1.2],
    types: ['spiral'],
  },

  death: {
    name: 'Death',
    emoji: '💀',
    description: 'Red-gray fireworks on death',
    particleCount: 25,
    colors: ['#ef4444', '#dc2626', '#991b1b', '#6b7280', '#9ca3af', '#b91c1c'],
    spread: 4,
    speed: 5,
    gravity: 2.0,
    sizeRange: [3, 8],
    lifetime: [0.6, 1.5],
    types: ['firework'],
  },

  level_up: {
    name: 'Level Up',
    emoji: '🆙',
    description: 'Purple-blue-green ring for level progression',
    particleCount: 20,
    colors: ['#8b5cf6', '#3b82f6', '#22c55e', '#a855f7', '#60a5fa', '#4ade80'],
    spread: 3,
    speed: 4,
    gravity: 0.3,
    sizeRange: [3, 7],
    lifetime: [0.6, 1.2],
    types: ['ring'],
  },

  scramble_success: {
    name: 'Scramble Success',
    emoji: '🧩',
    description: 'Green-lime sparkle on unscramble success',
    particleCount: 12,
    colors: ['#22c55e', '#84cc16', '#a3e635', '#4ade80', '#bef264'],
    spread: 2.5,
    speed: 3,
    gravity: 0,
    sizeRange: [2, 6],
    lifetime: [0.4, 0.9],
    types: ['sparkle'],
  },

  easter_egg: {
    name: 'Easter Egg',
    emoji: '🥚',
    description: 'Rainbow confetti surprise!',
    particleCount: 35,
    colors: [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
      '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1',
    ],
    spread: 5,
    speed: 5,
    gravity: 1.5,
    sizeRange: [4, 10],
    lifetime: [1.2, 3.0],
    types: ['confetti'],
  },

  streak_milestone: {
    name: 'Streak Milestone',
    emoji: '🔥',
    description: 'Orange-red-yellow fireworks for streak milestones',
    particleCount: 24,
    colors: ['#f97316', '#ef4444', '#eab308', '#fb923c', '#fbbf24', '#dc2626'],
    spread: 4,
    speed: 5.5,
    gravity: 1.0,
    sizeRange: [3, 8],
    lifetime: [0.7, 1.8],
    types: ['firework'],
  },

  shop_purchase: {
    name: 'Shop Purchase',
    emoji: '🛍️',
    description: 'Pink-rose burst for shop purchases',
    particleCount: 14,
    colors: ['#ec4899', '#f43f5e', '#fb7185', '#f472b6', '#be185d'],
    spread: 2.5,
    speed: 3,
    gravity: 1.0,
    sizeRange: [3, 7],
    lifetime: [0.5, 1.0],
    types: ['burst'],
  },

  pvp_steal: {
    name: 'PvP Steal',
    emoji: '🗡️',
    description: 'Amber-orange trail for PvP steals',
    particleCount: 10,
    colors: ['#f59e0b', '#f97316', '#d97706', '#fb923c', '#ea580c'],
    spread: 1.5,
    speed: 2.5,
    gravity: 0,
    sizeRange: [2, 5],
    lifetime: [0.4, 0.8],
    types: ['trail'],
  },
};

// ============================================================
// Spawn Preset Effect
// ============================================================

export function spawnEffect(
  x: number,
  y: number,
  presetName: string
): ParticleEffect[] {
  const preset = PRESET_EFFECTS[presetName];
  if (!preset) {
    console.warn(`[ParticleEffects] Unknown preset: "${presetName}"`);
    return [];
  }

  const particles: ParticleEffect[] = [];
  const { particleCount, colors, spread, speed, gravity, sizeRange, lifetime, types } = preset;

  for (let i = 0; i < particleCount; i++) {
    const type = pickRandom(types);
    const color = pickRandom(colors);
    const size = randomInRange(sizeRange[0], sizeRange[1]);
    const life = randomInRange(lifetime[0], lifetime[1]);
    const angle = (Math.PI * 2 * i) / particleCount + randomInRange(-0.3, 0.3);
    const vel = randomInRange(speed * 0.5, speed);

    let vx: number;
    let vy: number;

    switch (type) {
      case 'spiral':
        // Tangential velocity for spiral effect
        vx = Math.cos(angle + Math.PI / 2) * vel * spread * 0.3 + randomInRange(-0.5, 0.5);
        vy = Math.sin(angle + Math.PI / 2) * vel * spread * 0.3 + randomInRange(-0.5, 0.5);
        break;

      case 'ring':
        // Outward velocity for ring expansion
        vx = Math.cos(angle) * vel * spread * 0.4;
        vy = Math.sin(angle) * vel * spread * 0.4;
        break;

      case 'trail':
        // Mostly upward with slight horizontal drift
        vx = randomInRange(-spread * 0.3, spread * 0.3);
        vy = -randomInRange(vel * 0.5, vel);
        break;

      case 'confetti':
        // Wide spread with gravity pull
        vx = randomInRange(-spread, spread) * vel * 0.5;
        vy = randomInRange(-vel * 1.5, -vel * 0.3);
        break;

      case 'snow':
        // Gentle downward with horizontal drift
        vx = randomInRange(-1.5, 1.5);
        vy = randomInRange(0.5, vel * 0.5);
        break;

      case 'rain':
        // Predominantly downward
        vx = randomInRange(-0.3, 0.3);
        vy = randomInRange(vel, vel * 2);
        break;

      case 'firework':
        // Radial explosion
        vx = Math.cos(angle) * vel * spread * 0.6 + randomInRange(-0.5, 0.5);
        vy = Math.sin(angle) * vel * spread * 0.6 + randomInRange(-0.5, 0.5);
        break;

      case 'sparkle':
        // Small, focused sparkles
        vx = Math.cos(angle) * vel * spread * 0.2;
        vy = Math.sin(angle) * vel * spread * 0.2;
        break;

      default:
        // burst & star: standard radial burst
        vx = Math.cos(angle) * vel * spread * 0.4;
        vy = Math.sin(angle) * vel * spread * 0.4;
        break;
    }

    const friction = type === 'trail' ? 0.96 : type === 'confetti' ? 0.98 : 0.99;

    particles.push({
      x,
      y,
      vx,
      vy,
      life,
      maxLife: life,
      color,
      size,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: randomInRange(-4, 4),
      type,
      gravity: type === 'rain' ? gravity * 3 : gravity,
      friction,
      opacity: 1,
    });
  }

  return particles;
}

// ============================================================
// Spawn Custom Effect
// ============================================================

export interface CustomEffectOptions {
  count?: number;
  colors?: string[];
  type?: ParticleType;
  spread?: number;
  speed?: number;
  gravity?: number;
  size?: [number, number];
  lifetime?: [number, number];
}

export function spawnCustomEffect(
  x: number,
  y: number,
  options: CustomEffectOptions = {}
): ParticleEffect[] {
  const {
    count = 12,
    colors = ['#ffffff'],
    type = 'burst',
    spread = 3,
    speed = 3,
    gravity = 1,
    size = [3, 6],
    lifetime = [0.5, 1.0],
  } = options;

  const particles: ParticleEffect[] = [];

  for (let i = 0; i < count; i++) {
    const color = pickRandom(colors);
    const particleSize = randomInRange(size[0], size[1]);
    const life = randomInRange(lifetime[0], lifetime[1]);
    const angle = (Math.PI * 2 * i) / count + randomInRange(-0.2, 0.2);
    const vel = randomInRange(speed * 0.5, speed);

    let vx: number;
    let vy: number;

    switch (type) {
      case 'spiral':
        vx = Math.cos(angle + Math.PI / 2) * vel * spread * 0.3;
        vy = Math.sin(angle + Math.PI / 2) * vel * spread * 0.3;
        break;
      case 'ring':
        vx = Math.cos(angle) * vel * spread * 0.4;
        vy = Math.sin(angle) * vel * spread * 0.4;
        break;
      case 'trail':
        vx = randomInRange(-spread * 0.3, spread * 0.3);
        vy = -randomInRange(vel * 0.5, vel);
        break;
      case 'confetti':
        vx = randomInRange(-spread, spread) * vel * 0.5;
        vy = randomInRange(-vel * 1.5, -vel * 0.3);
        break;
      case 'snow':
        vx = randomInRange(-1.5, 1.5);
        vy = randomInRange(0.5, vel * 0.5);
        break;
      case 'rain':
        vx = randomInRange(-0.3, 0.3);
        vy = randomInRange(vel, vel * 2);
        break;
      case 'firework':
        vx = Math.cos(angle) * vel * spread * 0.6;
        vy = Math.sin(angle) * vel * spread * 0.6;
        break;
      case 'sparkle':
        vx = Math.cos(angle) * vel * spread * 0.2;
        vy = Math.sin(angle) * vel * spread * 0.2;
        break;
      default:
        vx = Math.cos(angle) * vel * spread * 0.4;
        vy = Math.sin(angle) * vel * spread * 0.4;
        break;
    }

    const friction = type === 'trail' ? 0.96 : type === 'confetti' ? 0.98 : 0.99;

    particles.push({
      x,
      y,
      vx,
      vy,
      life,
      maxLife: life,
      color,
      size: particleSize,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: randomInRange(-4, 4),
      type,
      gravity: type === 'rain' ? gravity * 3 : gravity,
      friction,
      opacity: 1,
    });
  }

  return particles;
}

// ============================================================
// Update Particles
// ============================================================

export function updateParticles(
  particles: ParticleEffect[],
  dt: number
): ParticleEffect[] {
  const alive: ParticleEffect[] = [];

  for (const p of particles) {
    // Reduce life
    p.life -= dt;
    if (p.life <= 0) continue;

    // Apply gravity
    p.vy += p.gravity * 60 * dt;

    // Apply friction
    p.vx *= Math.pow(p.friction, dt * 60);
    p.vy *= Math.pow(p.friction, dt * 60);

    // Update position
    p.x += p.vx * 60 * dt;
    p.y += p.vy * 60 * dt;

    // Update rotation
    p.rotation += p.rotSpeed * dt;

    // Calculate opacity based on remaining life ratio
    const lifeRatio = p.life / p.maxLife;
    // Fade out in the last 30% of life
    p.opacity = lifeRatio < 0.3 ? lifeRatio / 0.3 : 1;

    alive.push(p);
  }

  return alive;
}

// ============================================================
// Draw Particles
// ============================================================

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: ParticleEffect[]
): void {
  ctx.save();

  for (const p of particles) {
    ctx.globalAlpha = p.opacity;

    switch (p.type) {
      case 'burst':
        drawBurstParticle(ctx, p);
        break;
      case 'spiral':
        drawSpiralParticle(ctx, p);
        break;
      case 'ring':
        drawRingParticle(ctx, p);
        break;
      case 'star':
        drawStarParticle(ctx, p);
        break;
      case 'trail':
        drawTrailParticle(ctx, p);
        break;
      case 'confetti':
        drawConfettiParticle(ctx, p);
        break;
      case 'sparkle':
        drawSparkleParticle(ctx, p);
        break;
      case 'snow':
        drawSnowParticle(ctx, p);
        break;
      case 'rain':
        drawRainParticle(ctx, p);
        break;
      case 'firework':
        drawFireworkParticle(ctx, p);
        break;
    }
  }

  ctx.restore();
}

// ============================================================
// Individual Particle Drawing Functions
// ============================================================

function drawBurstParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  const radius = p.size * (0.5 + lifeRatio * 0.5);

  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
}

function drawSpiralParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  // Trail: slightly larger with a smaller inner glow
  const outerRadius = p.size * 1.2 * (0.6 + lifeRatio * 0.4);
  const innerRadius = p.size * 0.5 * lifeRatio;

  // Outer glow
  ctx.beginPath();
  ctx.arc(p.x, p.y, outerRadius, 0, Math.PI * 2);
  ctx.globalAlpha = p.opacity * 0.4;
  ctx.fillStyle = p.color;
  ctx.fill();

  // Inner core
  ctx.globalAlpha = p.opacity;
  ctx.beginPath();
  ctx.arc(p.x, p.y, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
}

function drawRingParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  // Expanding radius as life decreases
  const radius = p.size * (0.5 + (1 - lifeRatio) * 2);

  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(1, p.size * 0.3 * lifeRatio);
  ctx.stroke();
}

function drawStarParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  const radius = p.size * (0.5 + lifeRatio * 0.5);

  // Glow effect
  ctx.shadowColor = p.color;
  ctx.shadowBlur = radius * 3;

  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();

  ctx.shadowBlur = 0;
}

function drawTrailParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  const radius = p.size * (0.4 + lifeRatio * 0.6);

  // Tail effect: draw multiple circles trailing behind
  const tailLength = 4;
  for (let i = 0; i < tailLength; i++) {
    const tailRatio = i / tailLength;
    const tailX = p.x - p.vx * tailRatio * 2;
    const tailY = p.y - p.vy * tailRatio * 2;
    const tailRadius = radius * (1 - tailRatio * 0.5);
    const tailAlpha = p.opacity * (1 - tailRatio) * 0.6;

    ctx.globalAlpha = tailAlpha;
    ctx.beginPath();
    ctx.arc(tailX, tailY, tailRadius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  // Main circle
  ctx.globalAlpha = p.opacity;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
}

function drawConfettiParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  const width = p.size * 1.5;
  const height = p.size * 0.8;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  // Slight scale pulse
  const scale = 0.8 + Math.sin(p.life * 10) * 0.2;
  ctx.scale(scale, scale);

  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.fillRect(-width / 2, -height / 2, width, height);

  ctx.restore();
}

function drawSparkleParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  const armLength = p.size * (0.6 + lifeRatio * 0.4);
  const dotRadius = Math.max(1, p.size * 0.25);

  // Draw 4 small circles forming a cross/plus shape
  const positions = [
    { x: 0, y: -armLength },           // top
    { x: 0, y: armLength },            // bottom
    { x: -armLength, y: 0 },           // left
    { x: armLength, y: 0 },            // right
    { x: -armLength * 0.5, y: -armLength * 0.5 }, // diagonal
    { x: armLength * 0.5, y: -armLength * 0.5 },  // diagonal
    { x: -armLength * 0.5, y: armLength * 0.5 },  // diagonal
    { x: armLength * 0.5, y: armLength * 0.5 },   // diagonal
  ];

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const isDiagonal = i >= 4;
    const r = isDiagonal ? dotRadius * 0.7 : dotRadius;
    const alpha = p.opacity * (isDiagonal ? 0.5 : 0.9);

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x + pos.x, p.y + pos.y, r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  // Center glow
  ctx.globalAlpha = p.opacity * 0.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, armLength * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
}

function drawSnowParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  const radius = p.size * (0.6 + lifeRatio * 0.4);

  // Slight horizontal drift wobble
  const wobbleX = Math.sin(p.life * 5 + p.rotation) * 0.5;

  ctx.globalAlpha = p.opacity * 0.85;
  ctx.beginPath();
  ctx.arc(p.x + wobbleX, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Subtle inner highlight
  ctx.globalAlpha = p.opacity * 0.3;
  ctx.beginPath();
  ctx.arc(p.x + wobbleX - radius * 0.2, p.y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = '#e0f2fe';
  ctx.fill();
}

function drawRainParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  const length = p.size * 2.5 * (0.5 + lifeRatio * 0.5);
  const width = Math.max(1, p.size * 0.3);

  ctx.save();
  ctx.translate(p.x, p.y);

  // Slight angle based on velocity
  const angle = Math.atan2(p.vy, p.vx);
  ctx.rotate(angle);

  ctx.globalAlpha = p.opacity * 0.7;
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(-width / 2, -length / 2, width, length);

  ctx.restore();
}

function drawFireworkParticle(
  ctx: CanvasRenderingContext2D,
  p: ParticleEffect
): void {
  const lifeRatio = p.life / p.maxLife;
  const radius = p.size * (0.4 + lifeRatio * 0.6);

  // Fade trail
  const tailLength = 3;
  for (let i = 1; i <= tailLength; i++) {
    const tailRatio = i / (tailLength + 1);
    const tailX = p.x - p.vx * tailRatio * 1.5;
    const tailY = p.y - p.vy * tailRatio * 1.5;
    const tailRadius = radius * (1 - tailRatio * 0.6);
    const tailAlpha = p.opacity * (1 - tailRatio) * 0.3;

    ctx.globalAlpha = tailAlpha;
    ctx.beginPath();
    ctx.arc(tailX, tailY, tailRadius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  // Main particle with glow
  ctx.shadowColor = p.color;
  ctx.shadowBlur = radius * 2;

  ctx.globalAlpha = p.opacity;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();

  ctx.shadowBlur = 0;
}
