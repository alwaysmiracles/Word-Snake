// ─────────────────────────────────────────────────────────────────────────────
// game-settings-wire.ts — Centralized Word Snake game settings management wire
// Reads/writes localStorage key: ws_game_settings_wire
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type GameSpeed = 'slow' | 'normal' | 'fast' | 'insane';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type ControlScheme = 'arrows' | 'wasd' | 'swipe' | 'auto';
export type PowerUpFrequency = 'rare' | 'normal' | 'frequent';
export type HudStyle = 'minimal' | 'detailed' | 'compact' | 'immersive';
export type FontSize = 'small' | 'medium' | 'large';
export type GameMode = 'timed' | 'blitz' | 'marathon' | 'zen';

export interface GameSettings {
  gameSpeed: GameSpeed;
  gridSize: number;
  difficulty: Difficulty;
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  controlScheme: ControlScheme;
  showFPS: boolean;
  showGridLines: boolean;
  particlesEnabled: boolean;
  screenShake: boolean;
  darkMode: boolean;
  language: string;
  autoPause: boolean;
  confirmQuit: boolean;
  showTutorialOnStart: boolean;
  snakeColor: string;
  foodColor: string;
  bgColor: string;
  obstacleDensity: number;
  powerUpFrequency: PowerUpFrequency;
  maxPowerUps: number;
  comboTimer: number;
  wordDisplayTime: number;
  floatTextEnabled: boolean;
  notificationEnabled: boolean;
  hudStyle: HudStyle;
  fontSize: FontSize;
}

export type SettingKey = keyof GameSettings;

export interface SettingConstraint {
  min?: number;
  max?: number;
  allowed?: string[];
  type: 'number' | 'boolean' | 'string' | 'color';
  description: string;
}

export interface Preset {
  name: string;
  description: string;
  gameSpeed: GameSpeed;
  gridSize: number;
  difficulty: Difficulty;
  obstacleDensity: number;
  powerUpFrequency: PowerUpFrequency;
  comboTimer: number;
}

export interface SettingsHistoryEntry {
  timestamp: number;
  key: SettingKey;
  oldValue: unknown;
  newValue: unknown;
}

export interface SettingsGroup {
  gameplay: SettingKey[];
  audio: SettingKey[];
  visual: SettingKey[];
  control: SettingKey[];
  accessibility: SettingKey[];
}

export interface SettingsDiff {
  key: SettingKey;
  current: unknown;
  other: unknown;
}

export interface ImportResult {
  success: boolean;
  error?: string;
  settingsApplied?: Partial<GameSettings>;
}

export interface SettingsOverviewGroup {
  label: string;
  keys: SettingKey[];
  values: Record<string, unknown>;
}

export interface PerformanceRecommendation {
  setting: SettingKey;
  currentValue: unknown;
  recommendedValue: unknown;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

export const STORAGE_KEY = 'ws_game_settings_wire';
const HISTORY_KEY = 'ws_settings_history';
const CUSTOM_PRESETS_KEY = 'ws_custom_presets';

// ── Default Settings ─────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: Readonly<GameSettings> = {
  gameSpeed: 'normal',
  gridSize: 20,
  difficulty: 'medium',
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.5,
  controlScheme: 'arrows',
  showFPS: false,
  showGridLines: false,
  particlesEnabled: true,
  screenShake: true,
  darkMode: true,
  language: 'en',
  autoPause: true,
  confirmQuit: true,
  showTutorialOnStart: false,
  snakeColor: '#00ff88',
  foodColor: '#ff6b6b',
  bgColor: '#1a1a2e',
  obstacleDensity: 0.1,
  powerUpFrequency: 'normal',
  maxPowerUps: 3,
  comboTimer: 5000,
  wordDisplayTime: 3000,
  floatTextEnabled: true,
  notificationEnabled: true,
  hudStyle: 'minimal',
  fontSize: 'medium',
};

// ── Setting Constraints ──────────────────────────────────────────────────────

const SPEED_MAP: Record<GameSpeed, number> = {
  slow: 0.5,
  normal: 1,
  fast: 2,
  insane: 3,
};

export const SETTING_CONSTRAINTS: Readonly<Record<SettingKey, SettingConstraint>> = {
  gameSpeed: {
    allowed: ['slow', 'normal', 'fast', 'insane'],
    type: 'string',
    description: 'Snake movement speed',
  },
  gridSize: { min: 10, max: 40, type: 'number', description: 'Grid cell count per axis' },
  difficulty: {
    allowed: ['easy', 'medium', 'hard', 'extreme'],
    type: 'string',
    description: 'Overall game difficulty',
  },
  soundEnabled: { type: 'boolean', description: 'Master sound toggle' },
  musicEnabled: { type: 'boolean', description: 'Background music toggle' },
  sfxVolume: { min: 0, max: 1, type: 'number', description: 'Sound effects volume' },
  musicVolume: { min: 0, max: 1, type: 'number', description: 'Music volume' },
  controlScheme: {
    allowed: ['arrows', 'wasd', 'swipe', 'auto'],
    type: 'string',
    description: 'Primary input method',
  },
  showFPS: { type: 'boolean', description: 'Show frames-per-second counter' },
  showGridLines: { type: 'boolean', description: 'Render grid lines on board' },
  particlesEnabled: { type: 'boolean', description: 'Enable visual particle effects' },
  screenShake: { type: 'boolean', description: 'Screen shake on events' },
  darkMode: { type: 'boolean', description: 'Use dark color theme' },
  language: { type: 'string', description: 'UI language code' },
  autoPause: { type: 'boolean', description: 'Auto-pause when tab loses focus' },
  confirmQuit: { type: 'boolean', description: 'Show confirmation before quitting' },
  showTutorialOnStart: { type: 'boolean', description: 'Display tutorial on game start' },
  snakeColor: { type: 'color', description: 'Primary snake body color' },
  foodColor: { type: 'color', description: 'Food item color' },
  bgColor: { type: 'color', description: 'Background canvas color' },
  obstacleDensity: { min: 0, max: 0.5, type: 'number', description: 'Obstacle fill ratio' },
  powerUpFrequency: {
    allowed: ['rare', 'normal', 'frequent'],
    type: 'string',
    description: 'How often power-ups spawn',
  },
  maxPowerUps: { min: 0, max: 10, type: 'number', description: 'Max active power-ups on board' },
  comboTimer: { min: 1000, max: 15000, type: 'number', description: 'Combo window in ms' },
  wordDisplayTime: { min: 500, max: 10000, type: 'number', description: 'Word popup duration ms' },
  floatTextEnabled: { type: 'boolean', description: 'Floating score text' },
  notificationEnabled: { type: 'boolean', description: 'In-game notification popups' },
  hudStyle: {
    allowed: ['minimal', 'detailed', 'compact', 'immersive'],
    type: 'string',
    description: 'HUD display style',
  },
  fontSize: {
    allowed: ['small', 'medium', 'large'],
    type: 'string',
    description: 'UI font size',
  },
};

// ── Built-in Presets ─────────────────────────────────────────────────────────

const BUILTIN_PRESETS: Readonly<Preset[]> = [
  {
    name: 'Casual',
    description: 'Relaxed pace with a spacious grid and gentle obstacles',
    gameSpeed: 'slow',
    gridSize: 25,
    difficulty: 'easy',
    obstacleDensity: 0.05,
    powerUpFrequency: 'frequent',
    comboTimer: 7000,
  },
  {
    name: 'Standard',
    description: 'Balanced gameplay for most players',
    gameSpeed: 'normal',
    gridSize: 20,
    difficulty: 'medium',
    obstacleDensity: 0.1,
    powerUpFrequency: 'normal',
    comboTimer: 5000,
  },
  {
    name: 'Challenge',
    description: 'Faster pace with tighter grid and more obstacles',
    gameSpeed: 'fast',
    gridSize: 18,
    difficulty: 'hard',
    obstacleDensity: 0.2,
    powerUpFrequency: 'normal',
    comboTimer: 4000,
  },
  {
    name: 'Hardcore',
    description: 'Intense speed, small grid, heavy obstacles — experts only',
    gameSpeed: 'insane',
    gridSize: 15,
    difficulty: 'extreme',
    obstacleDensity: 0.35,
    powerUpFrequency: 'rare',
    comboTimer: 3000,
  },
  {
    name: 'Zen',
    description: 'Stress-free: no obstacles, slow pace, generous combos',
    gameSpeed: 'slow',
    gridSize: 30,
    difficulty: 'easy',
    obstacleDensity: 0,
    powerUpFrequency: 'frequent',
    comboTimer: 10000,
  },
];

// ── Settings Groups Definition ───────────────────────────────────────────────

const SETTINGS_GROUPS: Readonly<SettingsGroup> = {
  gameplay: [
    'gameSpeed', 'gridSize', 'difficulty', 'obstacleDensity',
    'powerUpFrequency', 'maxPowerUps', 'comboTimer', 'wordDisplayTime',
  ],
  audio: ['soundEnabled', 'musicEnabled', 'sfxVolume', 'musicVolume'],
  visual: [
    'particlesEnabled', 'screenShake', 'showGridLines', 'showFPS',
    'hudStyle', 'snakeColor', 'foodColor', 'bgColor', 'fontSize',
  ],
  control: ['controlScheme', 'autoPause', 'confirmQuit'],
  accessibility: ['language', 'showTutorialOnStart', 'darkMode'],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function mergeDefaults(partial: Partial<GameSettings>): GameSettings {
  return { ...DEFAULT_SETTINGS, ...partial };
}

function pushHistory(key: SettingKey, oldValue: unknown, newValue: unknown): void {
  try {
    const history: SettingsHistoryEntry[] = readStorage<SettingsHistoryEntry[]>(HISTORY_KEY, []);
    history.push({ timestamp: Date.now(), key, oldValue, newValue });
    // Keep only last 20
    writeStorage(HISTORY_KEY, history.slice(-20));
  } catch {
    // Silently fail — history is non-critical
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

// ── 1. Core Settings CRUD ───────────────────────────────────────────────────

export function getSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return mergeDefaults(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function updateSetting<K extends SettingKey>(key: K, value: GameSettings[K]): GameSettings {
  try {
    const sanitized = sanitizeSetting(key, value) as GameSettings[K];
    const current = getSettings();
    const oldValue = current[key];
    if (oldValue === sanitized) return current;

    const updated = { ...current, [key]: sanitized };
    writeStorage(STORAGE_KEY, updated);
    pushHistory(key, oldValue, sanitized);
    return updated;
  } catch {
    return getSettings();
  }
}

export function resetSetting(key: SettingKey): GameSettings {
  try {
    const current = getSettings();
    const oldValue = current[key];
    if (current[key] === DEFAULT_SETTINGS[key]) return current;

    const updated = { ...current, [key]: DEFAULT_SETTINGS[key] };
    writeStorage(STORAGE_KEY, updated);
    pushHistory(key, oldValue, DEFAULT_SETTINGS[key]);
    return updated;
  } catch {
    return getSettings();
  }
}

export function resetAllSettings(): GameSettings {
  try {
    const current = getSettings();
    const defaults = { ...DEFAULT_SETTINGS };
    writeStorage(STORAGE_KEY, defaults);
    // Record history for keys that actually changed
    for (const key of Object.keys(defaults) as SettingKey[]) {
      if (current[key] !== defaults[key]) {
        pushHistory(key, current[key], defaults[key]);
      }
    }
    return defaults;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

// ── 2. Speed/Difficulty Presets ──────────────────────────────────────────────

export function getPresets(): Preset[] {
  try {
    const custom: Preset[] = readStorage<Preset[]>(CUSTOM_PRESETS_KEY, []);
    return [...BUILTIN_PRESETS, ...custom];
  } catch {
    return [...BUILTIN_PRESETS];
  }
}

export function applyPreset(presetName: string): GameSettings {
  try {
    const allPresets = getPresets();
    const preset = allPresets.find(
      (p) => p.name.toLowerCase() === presetName.toLowerCase()
    );
    if (!preset) return getSettings();

    const current = getSettings();
    const updated: GameSettings = {
      ...current,
      gameSpeed: preset.gameSpeed,
      gridSize: preset.gridSize,
      difficulty: preset.difficulty,
      obstacleDensity: preset.obstacleDensity,
      powerUpFrequency: preset.powerUpFrequency,
      comboTimer: preset.comboTimer,
    };

    writeStorage(STORAGE_KEY, updated);

    // Record history for changed keys
    const presetKeys: SettingKey[] = [
      'gameSpeed', 'gridSize', 'difficulty', 'obstacleDensity',
      'powerUpFrequency', 'comboTimer',
    ];
    for (const key of presetKeys) {
      if (current[key] !== updated[key]) {
        pushHistory(key, current[key], updated[key]);
      }
    }

    return updated;
  } catch {
    return getSettings();
  }
}

export function createCustomPreset(name: string, settings: Partial<Preset>): Preset | null {
  try {
    const existing: Preset[] = readStorage<Preset[]>(CUSTOM_PRESETS_KEY, []);
    if (existing.length >= 5) return null;

    // Check for duplicate name
    const normalizedName = name.toLowerCase();
    if (existing.some((p) => p.name.toLowerCase() === normalizedName)) return null;

    const current = getSettings();
    const newPreset: Preset = {
      name,
      description: settings.description || `Custom preset: ${name}`,
      gameSpeed: settings.gameSpeed ?? current.gameSpeed,
      gridSize: settings.gridSize ?? current.gridSize,
      difficulty: settings.difficulty ?? current.difficulty,
      obstacleDensity: settings.obstacleDensity ?? current.obstacleDensity,
      powerUpFrequency: settings.powerUpFrequency ?? current.powerUpFrequency,
      comboTimer: settings.comboTimer ?? current.comboTimer,
    };

    existing.push(newPreset);
    writeStorage(CUSTOM_PRESETS_KEY, existing);
    return newPreset;
  } catch {
    return null;
  }
}

export function deleteCustomPreset(name: string): boolean {
  try {
    const existing: Preset[] = readStorage<Preset[]>(CUSTOM_PRESETS_KEY, []);
    const filtered = existing.filter(
      (p) => p.name.toLowerCase() !== name.toLowerCase()
    );
    if (filtered.length === existing.length) return false;

    writeStorage(CUSTOM_PRESETS_KEY, filtered);
    return true;
  } catch {
    return false;
  }
}

// ── 3. Settings Groups ──────────────────────────────────────────────────────

export function getGameplaySettings(): Partial<GameSettings> {
  try {
    const s = getSettings();
    const result = {} as Partial<GameSettings>;
    for (const key of SETTINGS_GROUPS.gameplay) {
      (result as Record<string, unknown>)[key] = s[key];
    }
    return result;
  } catch {
    return {};
  }
}

export function getAudioSettings(): Partial<GameSettings> {
  try {
    const s = getSettings();
    const result = {} as Partial<GameSettings>;
    for (const key of SETTINGS_GROUPS.audio) {
      (result as Record<string, unknown>)[key] = s[key];
    }
    return result;
  } catch {
    return {};
  }
}

export function getVisualSettings(): Partial<GameSettings> {
  try {
    const s = getSettings();
    const result = {} as Partial<GameSettings>;
    for (const key of SETTINGS_GROUPS.visual) {
      (result as Record<string, unknown>)[key] = s[key];
    }
    return result;
  } catch {
    return {};
  }
}

export function getControlSettings(): Partial<GameSettings> {
  try {
    const s = getSettings();
    const result = {} as Partial<GameSettings>;
    for (const key of SETTINGS_GROUPS.control) {
      (result as Record<string, unknown>)[key] = s[key];
    }
    return result;
  } catch {
    return {};
  }
}

export function getAccessibilitySettings(): Partial<GameSettings> {
  try {
    const s = getSettings();
    const result = {} as Partial<GameSettings>;
    for (const key of SETTINGS_GROUPS.accessibility) {
      (result as Record<string, unknown>)[key] = s[key];
    }
    return result;
  } catch {
    return {};
  }
}

export function updateSettingsGroup(
  group: keyof SettingsGroup,
  updates: Partial<GameSettings>
): GameSettings {
  try {
    const groupKeys = SETTINGS_GROUPS[group];
    if (!groupKeys) return getSettings();

    const current = getSettings();
    const updated = { ...current };

    for (const key of groupKeys) {
      if (key in updates) {
        const sanitized = sanitizeSetting(key, (updates as Record<string, unknown>)[key]);
        if (updated[key] !== sanitized) {
          pushHistory(key, updated[key], sanitized);
        }
        (updated as Record<string, unknown>)[key] = sanitized;
      }
    }

    writeStorage(STORAGE_KEY, updated);
    return updated;
  } catch {
    return getSettings();
  }
}

// ── 4. Validation & Sanitization ────────────────────────────────────────────

export function validateSettings(settings: Partial<GameSettings>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    for (const [rawKey, value] of Object.entries(settings)) {
      const key = rawKey as SettingKey;
      const constraint = SETTING_CONSTRAINTS[key];
      if (!constraint) {
        errors.push(`Unknown setting key: "${key}"`);
        continue;
      }

      if (constraint.type === 'number' && typeof value === 'number') {
        if (constraint.min !== undefined && value < constraint.min) {
          errors.push(`${key}: ${value} is below minimum ${constraint.min}`);
        }
        if (constraint.max !== undefined && value > constraint.max) {
          errors.push(`${key}: ${value} exceeds maximum ${constraint.max}`);
        }
      }

      if (constraint.allowed && typeof value === 'string') {
        if (!constraint.allowed.includes(value)) {
          errors.push(`${key}: "${value}" is not one of [${constraint.allowed.join(', ')}]`);
        }
      }

      if (constraint.type === 'color' && typeof value === 'string') {
        if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
          errors.push(`${key}: "${value}" is not a valid hex color`);
        }
      }
    }
  } catch {
    errors.push('Unexpected error during validation');
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeSetting(key: SettingKey, value: unknown): unknown {
  try {
    const constraint = SETTING_CONSTRAINTS[key];
    if (!constraint) return DEFAULT_SETTINGS[key];

    // Type mismatch → default
    if (constraint.type === 'boolean' && typeof value !== 'boolean') {
      return DEFAULT_SETTINGS[key];
    }
    if (constraint.type === 'string' && typeof value !== 'string') {
      return DEFAULT_SETTINGS[key];
    }
    if (constraint.type === 'color' && typeof value !== 'string') {
      return DEFAULT_SETTINGS[key];
    }

    // Enum-like allowed values
    if (constraint.allowed && typeof value === 'string') {
      return constraint.allowed.includes(value) ? value : DEFAULT_SETTINGS[key];
    }

    // Numeric clamping
    if (constraint.type === 'number' && typeof value === 'number') {
      let clamped = value;
      if (constraint.min !== undefined) clamped = Math.max(constraint.min, clamped);
      if (constraint.max !== undefined) clamped = Math.min(constraint.max, clamped);
      // Round to 2 decimals for cleanliness
      clamped = Math.round(clamped * 100) / 100;
      return clamped;
    }

    // Hex color pattern
    if (constraint.type === 'color' && typeof value === 'string') {
      return /^#[0-9a-fA-F]{6}$/.test(value) ? value : DEFAULT_SETTINGS[key];
    }

    return value;
  } catch {
    return DEFAULT_SETTINGS[key];
  }
}

export function getSettingConstraints(): Readonly<Record<SettingKey, SettingConstraint>> {
  return SETTING_CONSTRAINTS;
}

// ── 5. Settings Import/Export ───────────────────────────────────────────────

export function exportSettings(format: 'json' | 'base64' = 'json'): string {
  try {
    const settings = getSettings();
    const payload = JSON.stringify(settings);

    if (format === 'json') {
      return payload;
    }

    // Compressed base64: JSON → UTF-8 bytes → btoa
    const encoded = btoa(unescape(encodeURIComponent(payload)));
    return `WSG1:${encoded}`;
  } catch {
    return '';
  }
}

export function importSettings(data: string): ImportResult {
  try {
    let parsed: Partial<GameSettings>;

    // Detect format
    if (data.startsWith('WSG1:')) {
      // Base64 compressed format
      const b64 = data.slice(5);
      const json = decodeURIComponent(escape(atob(b64)));
      parsed = JSON.parse(json) as Partial<GameSettings>;
    } else {
      // Raw JSON
      parsed = JSON.parse(data) as Partial<GameSettings>;
    }

    // Validate first
    const validation = validateSettings(parsed);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join('; ')}`,
      };
    }

    // Sanitize each value and apply
    const current = getSettings();
    const applied: Partial<GameSettings> = {};

    for (const [rawKey, rawValue] of Object.entries(parsed)) {
      const key = rawKey as SettingKey;
      if (key in DEFAULT_SETTINGS) {
        const sanitized = sanitizeSetting(key, rawValue);
        (applied as Record<string, unknown>)[key] = sanitized;
      }
    }

    const updated = { ...current, ...applied };
    writeStorage(STORAGE_KEY, updated);

    // Record history for changed keys
    for (const [rawKey, value] of Object.entries(applied)) {
      const key = rawKey as SettingKey;
      if (current[key] !== value) {
        pushHistory(key, current[key], value);
      }
    }

    return { success: true, settingsApplied: applied };
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse settings: ${err instanceof Error ? err.message : 'unknown error'}`,
    };
  }
}

export function compareSettings(other: Partial<GameSettings>): SettingsDiff[] {
  try {
    const current = getSettings();
    const diffs: SettingsDiff[] = [];

    for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[]) {
      if (key in other && current[key] !== other[key]) {
        diffs.push({
          key,
          current: current[key],
          other: (other as Record<string, unknown>)[key],
        });
      }
    }

    return diffs;
  } catch {
    return [];
  }
}

export function getSettingsHash(): number {
  try {
    const settings = getSettings();
    const serialized = JSON.stringify(settings);
    return simpleHash(serialized);
  } catch {
    return 0;
  }
}

// ── 6. Settings History ─────────────────────────────────────────────────────

export function getSettingsHistory(): SettingsHistoryEntry[] {
  try {
    return readStorage<SettingsHistoryEntry[]>(HISTORY_KEY, []);
  } catch {
    return [];
  }
}

export function getSettingHistory(key: SettingKey): SettingsHistoryEntry[] {
  try {
    const history = getSettingsHistory();
    return history.filter((entry) => entry.key === key);
  } catch {
    return [];
  }
}

export function getMostChangedSettings(): Array<{ key: SettingKey; count: number }> {
  try {
    const history = getSettingsHistory();
    const counts = new Map<SettingKey, number>();

    for (const entry of history) {
      counts.set(entry.key, (counts.get(entry.key) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

// ── 7. Settings Recommendations ─────────────────────────────────────────────

export function getOptimalSettings(gameMode: GameMode): Partial<GameSettings> {
  try {
    switch (gameMode) {
      case 'timed':
        return {
          gameSpeed: 'fast',
          gridSize: 20,
          difficulty: 'medium',
          obstacleDensity: 0.1,
          powerUpFrequency: 'frequent',
          comboTimer: 4000,
          wordDisplayTime: 2000,
          floatTextEnabled: true,
          particlesEnabled: true,
          screenShake: false, // Reduce distractions when speed matters
          hudStyle: 'compact',
        };
      case 'blitz':
        return {
          gameSpeed: 'insane',
          gridSize: 15,
          difficulty: 'hard',
          obstacleDensity: 0.15,
          powerUpFrequency: 'frequent',
          comboTimer: 3000,
          wordDisplayTime: 1500,
          floatTextEnabled: false, // Minimal visual clutter
          particlesEnabled: false,
          screenShake: false,
          hudStyle: 'compact',
          fontSize: 'small',
        };
      case 'marathon':
        return {
          gameSpeed: 'slow',
          gridSize: 25,
          difficulty: 'medium',
          obstacleDensity: 0.15,
          powerUpFrequency: 'normal',
          comboTimer: 6000,
          wordDisplayTime: 3000,
          floatTextEnabled: true,
          particlesEnabled: true,
          screenShake: true,
          hudStyle: 'detailed',
          autoPause: true,
        };
      case 'zen':
        return {
          gameSpeed: 'slow',
          gridSize: 30,
          difficulty: 'easy',
          obstacleDensity: 0,
          powerUpFrequency: 'frequent',
          comboTimer: 10000,
          wordDisplayTime: 5000,
          floatTextEnabled: true,
          particlesEnabled: true,
          screenShake: false,
          hudStyle: 'immersive',
          musicVolume: 0.8,
          sfxVolume: 0.5,
          showGridLines: false,
          darkMode: true,
        };
      default:
        return {};
    }
  } catch {
    return {};
  }
}

export function getPerformanceBasedRecommendation(): PerformanceRecommendation[] {
  try {
    const current = getSettings();
    const recommendations: PerformanceRecommendation[] = [];

    // Analyze particle impact on perceived performance
    if (current.gameSpeed === 'insane' && current.particlesEnabled) {
      recommendations.push({
        setting: 'particlesEnabled',
        currentValue: true,
        recommendedValue: false,
        reason: 'Disabling particles at insane speed can improve frame stability',
        impact: 'high',
      });
    }

    // Screen shake at high speed can be disorienting
    if (SPEED_MAP[current.gameSpeed] >= 2 && current.screenShake) {
      recommendations.push({
        setting: 'screenShake',
        currentValue: true,
        recommendedValue: false,
        reason: 'Screen shake at high speed can reduce readability',
        impact: 'medium',
      });
    }

    // Tight grid with high obstacle density
    if (current.gridSize <= 15 && current.obstacleDensity > 0.25) {
      recommendations.push({
        setting: 'obstacleDensity',
        currentValue: current.obstacleDensity,
        recommendedValue: 0.15,
        reason: 'High obstacle density on a small grid leaves very little room to maneuver',
        impact: 'high',
      });
    }

    // Word display time vs game speed mismatch
    if (current.gameSpeed === 'insane' && current.wordDisplayTime > 3000) {
      recommendations.push({
        setting: 'wordDisplayTime',
        currentValue: current.wordDisplayTime,
        recommendedValue: 1500,
        reason: 'Long word display times slow down your pace at insane speed',
        impact: 'medium',
      });
    }

    // Combo timer too short for new players
    if (current.difficulty === 'easy' && current.comboTimer < 3000) {
      recommendations.push({
        setting: 'comboTimer',
        currentValue: current.comboTimer,
        recommendedValue: 5000,
        reason: 'Short combo timer on easy difficulty defeats the learning purpose',
        impact: 'low',
      });
    }

    // FPS counter suggestion
    if (current.gameSpeed === 'fast' || current.gameSpeed === 'insane') {
      if (!current.showFPS) {
        recommendations.push({
          setting: 'showFPS',
          currentValue: false,
          recommendedValue: true,
          reason: 'Enabling FPS helps identify performance issues at high speed',
          impact: 'low',
        });
      }
    }

    // Music volume drowning out SFX cues
    if (current.musicVolume > 0.8 && current.sfxVolume < 0.4) {
      recommendations.push({
        setting: 'musicVolume',
        currentValue: current.musicVolume,
        recommendedValue: 0.5,
        reason: 'Music may drown out important sound effect cues',
        impact: 'medium',
      });
    }

    // Grid lines on immersive HUD style
    if (current.hudStyle === 'immersive' && current.showGridLines) {
      recommendations.push({
        setting: 'showGridLines',
        currentValue: true,
        recommendedValue: false,
        reason: 'Grid lines reduce immersion in immersive HUD mode',
        impact: 'low',
      });
    }

    return recommendations;
  } catch {
    return [];
  }
}

export function getBeginnerFriendlySettings(): Partial<GameSettings> {
  return {
    gameSpeed: 'slow',
    gridSize: 20,
    difficulty: 'easy',
    obstacleDensity: 0.05,
    powerUpFrequency: 'frequent',
    maxPowerUps: 3,
    comboTimer: 7000,
    wordDisplayTime: 4000,
    floatTextEnabled: true,
    particlesEnabled: true,
    screenShake: true,
    showGridLines: true,
    controlScheme: 'arrows',
    autoPause: true,
    confirmQuit: true,
    showTutorialOnStart: true,
    notificationEnabled: true,
    hudStyle: 'detailed',
    fontSize: 'medium',
    darkMode: true,
    soundEnabled: true,
    musicEnabled: true,
    sfxVolume: 0.7,
    musicVolume: 0.5,
  };
}

// ── 8. UI Data Helpers ──────────────────────────────────────────────────────

const GROUP_LABELS: Record<keyof SettingsGroup, string> = {
  gameplay: 'Gameplay',
  audio: 'Audio',
  visual: 'Visual',
  control: 'Controls',
  accessibility: 'Accessibility',
};

export function getSettingsOverview(): SettingsOverviewGroup[] {
  try {
    const settings = getSettings();
    const overview: SettingsOverviewGroup[] = [];

    for (const [group, keys] of Object.entries(SETTINGS_GROUPS)) {
      const values: Record<string, unknown> = {};
      for (const key of keys) {
        values[key] = settings[key];
      }
      overview.push({
        label: GROUP_LABELS[group as keyof SettingsGroup],
        keys: keys as SettingKey[],
        values,
      });
    }

    return overview;
  } catch {
    return [];
  }
}

export function getActivePresetName(): string | null {
  try {
    const current = getSettings();
    const allPresets = getPresets();

    let bestMatch: string | null = null;
    let bestScore = 0;

    const COMPARISON_KEYS: (keyof Preset)[] = [
      'gameSpeed', 'gridSize', 'difficulty', 'obstacleDensity',
      'powerUpFrequency', 'comboTimer',
    ];

    for (const preset of allPresets) {
      let matches = 0;
      for (const key of COMPARISON_KEYS) {
        if (current[key] === preset[key]) {
          matches++;
        }
      }
      if (matches === COMPARISON_KEYS.length) {
        return preset.name; // Exact match
      }
      if (matches > bestScore) {
        bestScore = matches;
        bestMatch = preset.name;
      }
    }

    // Only return closest match if it's a strong match (≥80% of keys)
    return bestScore >= Math.ceil(COMPARISON_KEYS.length * 0.8) ? bestMatch : null;
  } catch {
    return null;
  }
}

export function getSettingsCompletion(): {
  total: number;
  modified: number;
  percentage: number;
  changedKeys: SettingKey[];
} {
  try {
    const current = getSettings();
    const allKeys = Object.keys(DEFAULT_SETTINGS) as SettingKey[];
    const changedKeys: SettingKey[] = [];

    for (const key of allKeys) {
      if (current[key] !== DEFAULT_SETTINGS[key]) {
        changedKeys.push(key);
      }
    }

    const total = allKeys.length;
    const modified = changedKeys.length;
    const percentage = total > 0 ? Math.round((modified / total) * 100) : 0;

    return { total, modified, percentage, changedKeys };
  } catch {
    return { total: 0, modified: 0, percentage: 0, changedKeys: [] };
  }
}
