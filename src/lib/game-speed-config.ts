// ─── Game Speed Configuration ─────────────────────────────────────────────────
// Fine-grained independent speed control for the Word Snake game loop.

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SpeedConfig {
  baseSpeed: number;
  currentSpeed: number;
  minSpeed: number;
  maxSpeed: number;
  stepSize: number;
  speedMultiplier: number;
  adaptiveSpeed: boolean;
  speedProfile: 'linear' | 'ease-in' | 'ease-out' | 'custom';
  customCurve: number[];
  showSpeedIndicator: boolean;
  speedUnit: 'ms' | 'fps';
}

export interface SpeedProfile {
  name: string;
  id: string;
  description: string;
  curve: number[];
  icon: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SPEED_CONFIG: SpeedConfig = {
  baseSpeed: 150,
  currentSpeed: 150,
  minSpeed: 50,
  maxSpeed: 400,
  stepSize: 10,
  speedMultiplier: 1.0,
  adaptiveSpeed: false,
  speedProfile: 'linear',
  customCurve: [],
  showSpeedIndicator: true,
  speedUnit: 'ms',
};

// ─── Predefined Profiles ──────────────────────────────────────────────────────

export const SPEED_PROFILES: SpeedProfile[] = [
  {
    name: 'Relaxed',
    id: 'relaxed',
    description: 'Gentle pace — great for learning or casual play',
    curve: [200, 195, 190, 188, 185, 183, 180, 178, 176, 175],
    icon: '☕',
  },
  {
    name: 'Normal',
    id: 'normal',
    description: 'Balanced speed — the default experience',
    curve: [150, 150, 150, 150, 150, 150, 150, 150, 150, 150],
    icon: '⚡',
  },
  {
    name: 'Fast',
    id: 'fast',
    description: 'Accelerating pace — ramps up as you progress',
    curve: [120, 115, 108, 100, 93, 87, 82, 78, 74, 70],
    icon: '🏃',
  },
  {
    name: 'Blitz',
    id: 'blitz',
    description: 'Aggressive speed — for experienced players only',
    curve: [90, 82, 74, 68, 62, 57, 53, 50, 48, 46],
    icon: '🔥',
  },
  {
    name: 'Marathon',
    id: 'marathon',
    description: 'Consistent long-session pace — minimal speed change',
    curve: [180, 179, 178, 177, 176, 175, 174, 173, 172, 171],
    icon: '🐢',
  },
  {
    name: 'Custom',
    id: 'custom',
    description: 'User-defined speed curve',
    curve: [],
    icon: '🎨',
  },
];

// ─── Factory & Persistence ────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_speed_config';

/** Create a speed config with optional partial overrides merged onto defaults. */
export function createSpeedConfig(overrides?: Partial<SpeedConfig>): SpeedConfig {
  return { ...DEFAULT_SPEED_CONFIG, ...overrides };
}

/** Persist a speed config to localStorage (client-side only). */
export function saveSpeedConfig(config: SpeedConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage unavailable (private browsing, quota, etc.)
  }
}

/** Load a previously saved speed config, falling back to defaults. */
export function loadSpeedConfig(): SpeedConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SpeedConfig>;
      return { ...DEFAULT_SPEED_CONFIG, ...parsed };
    }
  } catch {
    // Corrupt data — fall back to defaults
  }
  return { ...DEFAULT_SPEED_CONFIG };
}

// ─── Speed Mutations ──────────────────────────────────────────────────────────

/** Set current speed, clamped to the config's min/max range. */
export function setSpeed(config: SpeedConfig, speed: number): SpeedConfig {
  const clamped = Math.max(config.minSpeed, Math.min(config.maxSpeed, speed));
  return { ...config, currentSpeed: clamped };
}

/** Adjust current speed by a signed delta, respecting min/max. */
export function adjustSpeed(config: SpeedConfig, delta: number): SpeedConfig {
  return setSpeed(config, config.currentSpeed + delta);
}

// ─── Frame Timing ─────────────────────────────────────────────────────────────

/** Return the interval in milliseconds per game-frame based on current speed. */
export function getFrameInterval(config: SpeedConfig): number {
  const effective = config.currentSpeed / config.speedMultiplier;
  return Math.max(config.minSpeed, Math.min(config.maxSpeed, effective));
}

/** Return the frames-per-second equivalent of the current speed. */
export function getFPS(config: SpeedConfig): number {
  const interval = getFrameInterval(config);
  return parseFloat((1000 / interval).toFixed(1));
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

/** Apply a named speed profile to the given config. */
export function applySpeedProfile(
  config: SpeedConfig,
  profileId: string,
): SpeedConfig {
  const profile = SPEED_PROFILES.find((p) => p.id === profileId);
  if (!profile) return config;

  const isFirst = profile.curve.length > 0 ? profile.curve[0] : config.baseSpeed;
  const profileType = profileId === 'relaxed' ? 'ease-out'
    : profileId === 'fast' ? 'ease-in'
    : profileId === 'custom' ? 'custom'
    : 'linear';

  return {
    ...config,
    baseSpeed: isFirst,
    currentSpeed: isFirst,
    speedProfile: profileType,
    customCurve: profileId === 'custom' ? config.customCurve : profile.curve,
  };
}

// ─── Custom Curve Generation ──────────────────────────────────────────────────

type EasingFn = (t: number) => number;

const EASING_MAP: Record<string, EasingFn> = {
  linear: (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => t * (2 - t),
  'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

/** Generate a smooth speed curve array of the given length. */
export function calculateCustomCurve(
  length: number,
  startSpeed: number,
  endSpeed: number,
  easing: string = 'linear',
): number[] {
  const ease = EASING_MAP[easing] ?? EASING_MAP.linear;
  const curve: number[] = [];
  for (let i = 0; i < length; i++) {
    const t = length === 1 ? 0 : i / (length - 1);
    curve.push(startSpeed + (endSpeed - startSpeed) * ease(t));
  }
  return curve;
}

// ─── Adaptive Speed ───────────────────────────────────────────────────────────

/** Return an adaptive speed value based on the current score progression. */
export function getSpeedForScore(config: SpeedConfig, score: number): number {
  if (!config.adaptiveSpeed) return config.currentSpeed;

  const curve = config.speedProfile === 'custom' && config.customCurve.length > 0
    ? config.customCurve
    : SPEED_PROFILES.find((p) => p.id === 'normal')!.curve;

  // Map score to a position in the curve
  const segmentLength = 100; // points per curve step
  const index = Math.min(
    Math.floor(score / segmentLength),
    curve.length - 1,
  );

  const curveSpeed = curve[Math.max(0, index)] ?? config.baseSpeed;
  return setSpeed(config, curveSpeed).currentSpeed;
}

// ─── Display Helpers ──────────────────────────────────────────────────────────

/** Format a millisecond speed value for display. */
export function formatSpeed(ms: number, unit?: SpeedConfig['speedUnit']): string {
  if (unit === 'fps') {
    return `${(1000 / ms).toFixed(1)} FPS`;
  }
  return `${Math.round(ms)}ms`;
}

/** Return a hex colour representing the speed intensity (green → yellow → red). */
export function getSpeedColor(speed: number): string {
  // Lower ms = faster = redder; higher ms = slower = greener
  const t = Math.max(0, Math.min(1, (speed - 50) / 350)); // 50→red, 400→green
  const r = Math.round(255 * (1 - t));
  const g = Math.round(200 * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}00`;
}

/** Return a human-readable label for a given speed in ms. */
export function getSpeedLabel(speed: number): string {
  if (speed >= 300) return 'Very Slow';
  if (speed >= 220) return 'Slow';
  if (speed >= 140) return 'Normal';
  if (speed >= 90) return 'Fast';
  if (speed >= 60) return 'Very Fast';
  return 'Extreme';
}

/** Return a 0–100 progress percentage for a speed within a min/max range. */
export function getSpeedProgress(speed: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.round(((speed - min) / (max - min)) * 100);
}
