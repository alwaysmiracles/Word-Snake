// =============================================================================
// Color Studio Wire — Theme Customization System for Word Snake
// =============================================================================
// 35 exported standalone functions · localStorage persistence · key: ws_color_studio_wire
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A palette of five colors with metadata. */
export interface ColorPalette {
  id: string;
  name: string;
  colors: [string, string, string, string, string];
  mood: PaletteMood;
  isCustom: boolean;
  createdAt: number;
  usageCount: number;
}

/** A single custom color saved by the user. */
export interface CustomColor {
  id: string;
  hex: string;
  name: string;
  createdAt: number;
  tags: string[];
}

/** A gradient preset defined by two color stops and an angle. */
export interface GradientPreset {
  id: string;
  name: string;
  startColor: string;
  endColor: string;
  angle: number;
  style: 'linear' | 'radial' | 'conic';
  createdAt: number;
}

/** The full persisted state of the color studio. */
export interface ColorStudioState {
  palettes: ColorPalette[];
  currentPaletteId: string;
  paletteHistory: PaletteHistoryEntry[];
  customColors: CustomColor[];
  gradients: GradientPreset[];
  colorMode: ColorMode;
  initializedAt: number;
  lastModifiedAt: number;
}

/** Mood classification for palettes. */
export type PaletteMood =
  | 'calm'
  | 'energetic'
  | 'mysterious'
  | 'playful'
  | 'bold'
  | 'elegant'
  | 'warm'
  | 'cool'
  | 'dark'
  | 'retro'
  | 'futuristic'
  | 'minimal';

/** Color mode — how the palette is applied to the game. */
export type ColorMode =
  | 'full'
  | 'snake-only'
  | 'grid-only'
  | 'ui-only'
  | 'background-only';

/** Entry in the palette-switch history log. */
export interface PaletteHistoryEntry {
  paletteId: string;
  paletteName: string;
  switchedAt: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ws_color_studio_wire';

const MAX_HISTORY_LENGTH = 50;
const MAX_CUSTOM_COLORS = 100;
const MAX_CUSTOM_PALETTES = 30;

// ---------------------------------------------------------------------------
// Built-in Palettes
// ---------------------------------------------------------------------------

const BUILT_IN_PALETTES: Omit<ColorPalette, 'usageCount'>[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A'],
    mood: 'calm',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E'],
    mood: 'warm',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#B7E4C7'],
    mood: 'calm',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'neon',
    name: 'Neon',
    colors: ['#FF00FF', '#00FFFF', '#FF1493', '#39FF14', '#FFE500'],
    mood: 'energetic',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'pastel',
    name: 'Pastel',
    colors: ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#F9DCC4', '#FEC89A'],
    mood: 'playful',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: ['#F8F9FA', '#DEE2E6', '#ADB5BD', '#6C757D', '#212529'],
    mood: 'minimal',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'candy',
    name: 'Candy',
    colors: ['#FF69B4', '#FF1493', '#C71585', '#DB7093', '#FFB6C1'],
    mood: 'playful',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    colors: ['#0D1B2A', '#1B263B', '#415A77', '#778DA9', '#E0E1DD'],
    mood: 'mysterious',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'desert',
    name: 'Desert',
    colors: ['#EDC4B3', '#CD8B62', '#966B53', '#6B3A2A', '#3E2723'],
    mood: 'warm',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'arctic',
    name: 'Arctic',
    colors: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5'],
    mood: 'cool',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'lava',
    name: 'Lava',
    colors: ['#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FFA07A'],
    mood: 'energetic',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'mystic',
    name: 'Mystic',
    colors: ['#2E003E', '#5C0067', '#8F0078', '#B7006E', '#E6005C'],
    mood: 'mysterious',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'retro',
    name: 'Retro',
    colors: ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557'],
    mood: 'retro',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E'],
    mood: 'minimal',
    isCustom: false,
    createdAt: 0,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: ['#0D0221', '#0F084B', '#26081C', '#A40E4C', '#F3B0FF'],
    mood: 'futuristic',
    isCustom: false,
    createdAt: 0,
  },
];

// ---------------------------------------------------------------------------
// Default Gradient Presets
// ---------------------------------------------------------------------------

const DEFAULT_GRADIENTS: GradientPreset[] = [
  { id: 'g-sunset', name: 'Sunset Glow', startColor: '#FF6B35', endColor: '#FF1493', angle: 135, style: 'linear', createdAt: 0 },
  { id: 'g-ocean', name: 'Ocean Depth', startColor: '#0077B6', endColor: '#CAF0F8', angle: 180, style: 'linear', createdAt: 0 },
  { id: 'g-neon', name: 'Neon Pulse', startColor: '#FF00FF', endColor: '#00FFFF', angle: 45, style: 'linear', createdAt: 0 },
  { id: 'g-forest', name: 'Forest Canopy', startColor: '#2D6A4F', endColor: '#B7E4C7', angle: 160, style: 'linear', createdAt: 0 },
  { id: 'g-cosmic', name: 'Cosmic Ring', startColor: '#0D0221', endColor: '#F3B0FF', angle: 0, style: 'radial', createdAt: 0 },
];

// ---------------------------------------------------------------------------
// Helpers — localStorage
// ---------------------------------------------------------------------------

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__ws_color_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function loadState(): ColorStudioState | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ColorStudioState;
  } catch {
    return null;
  }
}

function persistState(state: ColorStudioState): void {
  if (!isLocalStorageAvailable()) return;
  try {
    state.lastModifiedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — silently degrade */
  }
}

function buildDefaultState(): ColorStudioState {
  return {
    palettes: BUILT_IN_PALETTES.map((p) => ({ ...p, usageCount: 0 })),
    currentPaletteId: 'ocean',
    paletteHistory: [],
    customColors: [],
    gradients: [...DEFAULT_GRADIENTS],
    colorMode: 'full',
    initializedAt: Date.now(),
    lastModifiedAt: Date.now(),
  };
}

function ensureState(): ColorStudioState {
  let state = loadState();
  if (!state) {
    state = buildDefaultState();
    persistState(state);
  }
  return state;
}

function uid(): string {
  return 'cs_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------------
// Helpers — Color Math
// ---------------------------------------------------------------------------

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] | null {
  const cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return [r, g, b];
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return [r, g, b];
  }
  return null;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      case bn:
        h = ((rn - gn) / d + 4) / 6;
        break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number): number => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return [
    clampByte(hue2rgb(p, q, hn + 1 / 3) * 255),
    clampByte(hue2rgb(p, q, hn) * 255),
    clampByte(hue2rgb(p, q, hn - 1 / 3) * 255),
  ];
}

function colorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** Compute the perceived brightness of a hex color (0–255). */
function perceivedBrightness(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 128;
  return Math.round(0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
}

// ---------------------------------------------------------------------------
// Mood Detection
// ---------------------------------------------------------------------------

function detectMoodFromColors(colors: string[]): PaletteMood {
  let totalHue = 0;
  let totalSat = 0;
  let totalLit = 0;
  let count = 0;
  for (const hex of colors) {
    const rgb = parseHex(hex);
    if (!rgb) continue;
    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    totalHue += h;
    totalSat += s;
    totalLit += l;
    count++;
  }
  if (count === 0) return 'minimal';

  const avgSat = totalSat / count;
  const avgLit = totalLit / count;
  const avgHue = totalHue / count;

  if (avgLit < 25) return 'dark';
  if (avgLit > 85 && avgSat < 15) return 'minimal';
  if (avgSat > 70) return 'energetic';
  if (avgHue >= 0 && avgHue < 60 && avgSat > 30) return 'warm';
  if (avgHue >= 160 && avgHue < 280 && avgSat > 20) return 'cool';
  if (avgSat < 20) return 'minimal';
  if (avgLit > 70) return 'playful';
  if (avgHue >= 280 && avgHue < 340) return 'mysterious';
  return 'bold';
}

// ---------------------------------------------------------------------------
// Exported Functions — Initialization
// ---------------------------------------------------------------------------

/** Initialize the Color Studio. Returns the full state, setting defaults if needed. */
export function initColorStudio(): ColorStudioState {
  const state = ensureState();
  if (!state.initializedAt) {
    state.initializedAt = Date.now();
  }
  persistState(state);
  return { ...state };
}

// ---------------------------------------------------------------------------
// Exported Functions — Palette CRUD
// ---------------------------------------------------------------------------

/** Get all palettes (built-in + custom). */
export function getPalettes(): ColorPalette[] {
  return [...ensureState().palettes];
}

/** Get the currently active palette object, or null if the id is invalid. */
export function getCurrentPalette(): ColorPalette | null {
  const state = ensureState();
  return state.palettes.find((p) => p.id === state.currentPaletteId) ?? null;
}

/** Select a palette by id and record the switch in history. */
export function selectPalette(paletteId: string): ColorPalette | null {
  const state = ensureState();
  const palette = state.palettes.find((p) => p.id === paletteId);
  if (!palette) return null;

  state.currentPaletteId = paletteId;
  palette.usageCount += 1;

  state.paletteHistory.unshift({
    paletteId,
    paletteName: palette.name,
    switchedAt: Date.now(),
  });
  if (state.paletteHistory.length > MAX_HISTORY_LENGTH) {
    state.paletteHistory = state.paletteHistory.slice(0, MAX_HISTORY_LENGTH);
  }

  persistState(state);
  return { ...palette };
}

/**
 * Create a new custom palette with exactly five colors.
 * Returns the created palette or null if validation fails.
 */
export function createPalette(
  name: string,
  colors: [string, string, string, string, string],
): ColorPalette | null {
  if (!name || name.trim().length === 0) return null;
  if (colors.length !== 5) return null;

  for (const hex of colors) {
    if (!parseHex(hex)) return null;
  }

  const state = ensureState();
  const customCount = state.palettes.filter((p) => p.isCustom).length;
  if (customCount >= MAX_CUSTOM_PALETTES) return null;

  const mood = detectMoodFromColors(colors);
  const palette: ColorPalette = {
    id: uid(),
    name: name.trim(),
    colors,
    mood,
    isCustom: true,
    createdAt: Date.now(),
    usageCount: 0,
  };

  state.palettes.push(palette);
  persistState(state);
  return { ...palette };
}

/** Delete a custom palette by id. Built-in palettes cannot be deleted. */
export function deletePalette(paletteId: string): boolean {
  const state = ensureState();
  const idx = state.palettes.findIndex((p) => p.id === paletteId);
  if (idx === -1 || !state.palettes[idx].isCustom) return false;

  state.palettes.splice(idx, 1);

  if (state.currentPaletteId === paletteId) {
    state.currentPaletteId = 'ocean';
  }

  persistState(state);
  return true;
}

// ---------------------------------------------------------------------------
// Exported Functions — Export / Import
// ---------------------------------------------------------------------------

/** Export a palette as a JSON string for sharing or backup. */
export function exportPalette(paletteId: string): string | null {
  const state = ensureState();
  const palette = state.palettes.find((p) => p.id === paletteId);
  if (!palette) return null;

  const exportData = {
    name: palette.name,
    colors: palette.colors,
    mood: palette.mood,
    exportedAt: Date.now(),
    version: 1,
  };
  return JSON.stringify(exportData, null, 2);
}

/** Import a palette from a JSON string. Returns the created palette or null. */
export function importPalette(jsonString: string): ColorPalette | null {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(jsonString) as Record<string, unknown>;
  } catch {
    return null;
  }

  const name = typeof data.name === 'string' ? data.name : 'Imported Palette';
  const rawColors = data.colors;
  if (!Array.isArray(rawColors) || rawColors.length !== 5) return null;

  const colors = rawColors.map((c) => String(c)) as [string, string, string, string, string];
  for (const hex of colors) {
    if (!parseHex(hex)) return null;
  }

  return createPalette(name, colors);
}

// ---------------------------------------------------------------------------
// Exported Functions — History
// ---------------------------------------------------------------------------

/** Get the palette switch history, newest first. */
export function getPaletteHistory(): PaletteHistoryEntry[] {
  return [...ensureState().paletteHistory];
}

// ---------------------------------------------------------------------------
// Exported Functions — Random / Similar
// ---------------------------------------------------------------------------

/** Return a random palette from the full collection. */
export function getRandomPalette(): ColorPalette {
  const palettes = ensureState().palettes;
  const idx = Math.floor(Math.random() * palettes.length);
  return { ...palettes[idx] };
}

/**
 * Find palettes whose mood matches the given palette, sorted by color proximity.
 */
export function getSimilarPalettes(paletteId: string, limit: number = 5): ColorPalette[] {
  const state = ensureState();
  const source = state.palettes.find((p) => p.id === paletteId);
  if (!source) return [];

  const sourceRgb = source.colors.map((c) => parseHex(c)!).filter(Boolean);

  return state.palettes
    .filter((p) => p.id !== paletteId)
    .map((p) => {
      const pRgb = p.colors.map((c) => parseHex(c)!).filter(Boolean);
      let totalDist = 0;
      const pairs = Math.min(sourceRgb.length, pRgb.length);
      for (let i = 0; i < pairs; i++) {
        totalDist += colorDistance(sourceRgb[i], pRgb[i]);
      }
      const avgDist = pairs > 0 ? totalDist / pairs : Infinity;
      return { palette: p, distance: avgDist };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((e) => ({ ...e.palette }));
}

// ---------------------------------------------------------------------------
// Exported Functions — Statistics
// ---------------------------------------------------------------------------

/** Compute usage statistics across all palettes. */
export function getColorStats(): {
  totalPalettes: number;
  customPalettes: number;
  builtInPalettes: number;
  totalSwitches: number;
  averageUsage: number;
  moodDistribution: Record<PaletteMood, number>;
} {
  const state = ensureState();
  const palettes = state.palettes;
  const totalSwitches = palettes.reduce((sum, p) => sum + p.usageCount, 0);
  const moodDistribution: Record<PaletteMood, number> = {
    calm: 0,
    energetic: 0,
    mysterious: 0,
    playful: 0,
    bold: 0,
    elegant: 0,
    warm: 0,
    cool: 0,
    dark: 0,
    retro: 0,
    futuristic: 0,
    minimal: 0,
  };

  for (const p of palettes) {
    moodDistribution[p.mood] = (moodDistribution[p.mood] || 0) + 1;
  }

  return {
    totalPalettes: palettes.length,
    customPalettes: palettes.filter((p) => p.isCustom).length,
    builtInPalettes: palettes.filter((p) => !p.isCustom).length,
    totalSwitches,
    averageUsage: palettes.length > 0 ? Math.round((totalSwitches / palettes.length) * 100) / 100 : 0,
    moodDistribution,
  };
}

/** Get the most-used palette, or the current one if usage is tied at zero. */
export function getMostUsedPalette(): ColorPalette {
  const palettes = ensureState().palettes;
  const sorted = [...palettes].sort((a, b) => b.usageCount - a.usageCount);
  return { ...sorted[0] };
}

// ---------------------------------------------------------------------------
// Exported Functions — Preview Cards
// ---------------------------------------------------------------------------

/**
 * Generate a lightweight preview object for a palette, including gradient CSS.
 */
export function getPalettePreview(paletteId: string): {
  id: string;
  name: string;
  colors: [string, string, string, string, string];
  gradientCss: string;
  averageBrightness: number;
} | null {
  const state = ensureState();
  const palette = state.palettes.find((p) => p.id === paletteId);
  if (!palette) return null;

  const gradientCss = `linear-gradient(135deg, ${palette.colors.join(', ')})`;
  const avgBrightness =
    palette.colors.reduce((sum, c) => sum + perceivedBrightness(c), 0) / palette.colors.length;

  return {
    id: palette.id,
    name: palette.name,
    colors: palette.colors,
    gradientCss,
    averageBrightness: Math.round(avgBrightness),
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Color Mode
// ---------------------------------------------------------------------------

/** Get the current color application mode. */
export function getActiveColorMode(): ColorMode {
  return ensureState().colorMode;
}

/** Set the color application mode. */
export function setColorMode(mode: ColorMode): ColorMode {
  const state = ensureState();
  state.colorMode = mode;
  persistState(state);
  return mode;
}

// ---------------------------------------------------------------------------
// Exported Functions — Gradients
// ---------------------------------------------------------------------------

/** Get all gradient presets. */
export function getGradients(): GradientPreset[] {
  return [...ensureState().gradients];
}

/** Create a new gradient preset. */
export function createGradient(
  name: string,
  startColor: string,
  endColor: string,
  angle: number = 135,
  style: 'linear' | 'radial' | 'conic' = 'linear',
): GradientPreset | null {
  if (!name || name.trim().length === 0) return null;
  if (!parseHex(startColor) || !parseHex(endColor)) return null;

  const state = ensureState();
  const gradient: GradientPreset = {
    id: uid(),
    name: name.trim(),
    startColor,
    endColor,
    angle: Math.max(0, Math.min(360, angle)),
    style,
    createdAt: Date.now(),
  };
  state.gradients.push(gradient);
  persistState(state);
  return { ...gradient };
}

/** Get a CSS gradient string for a gradient preset. */
export function getGradientPreview(gradientId: string): string | null {
  const gradient = ensureState().gradients.find((g) => g.id === gradientId);
  if (!gradient) return null;

  switch (gradient.style) {
    case 'radial':
      return `radial-gradient(circle, ${gradient.startColor}, ${gradient.endColor})`;
    case 'conic':
      return `conic-gradient(from ${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`;
    default:
      return `linear-gradient(${gradient.angle}deg, ${gradient.startColor}, ${gradient.endColor})`;
  }
}

// ---------------------------------------------------------------------------
// Exported Functions — Theme Integration
// ---------------------------------------------------------------------------

/**
 * Compute the full set of themed colors derived from the current palette.
 * Returns snake colors, grid colors, food color, UI accents, and background.
 */
export function getThemeColors(): {
  snakeHead: string;
  snakeBody: string;
  snakeTail: string;
  gridLine: string;
  gridBackground: string;
  foodPrimary: string;
  foodSecondary: string;
  uiAccent: string;
  uiBackground: string;
  uiText: string;
  overlay: string;
} {
  const palette = getCurrentPalette();
  const defaults = {
    snakeHead: '#00FF88',
    snakeBody: '#00CC66',
    snakeTail: '#009944',
    gridLine: '#1A3A2A',
    gridBackground: '#0A1F14',
    foodPrimary: '#FF4444',
    foodSecondary: '#FF8888',
    uiAccent: '#00FF88',
    uiBackground: '#0A1F14',
    uiText: '#E0F0E8',
    overlay: 'rgba(0,0,0,0.6)',
  };

  if (!palette) return defaults;

  const mode = getActiveColorMode();
  const isFull = mode === 'full';

  const brightnesses = palette.colors.map((c) => perceivedBrightness(c));
  const sortedByBright = palette.colors
    .map((c, i) => ({ color: c, brightness: brightnesses[i] }))
    .sort((a, b) => a.brightness - b.brightness);

  const dark = sortedByBright[0].color;
  const midDark = sortedByBright[1].color;
  const mid = sortedByBright[2].color;
  const midBright = sortedByBright[3].color;
  const bright = sortedByBright[4].color;

  if (isFull || mode === 'snake-only') {
    defaults.snakeHead = bright;
    defaults.snakeBody = midBright;
    defaults.snakeTail = mid;
  }

  if (isFull || mode === 'grid-only') {
    defaults.gridLine = midDark;
    defaults.gridBackground = dark;
  }

  if (isFull || mode === 'ui-only') {
    defaults.uiAccent = midBright;
    defaults.uiBackground = dark;
    defaults.uiText = bright;
    defaults.overlay = dark.startsWith('#')
      ? `${dark}${Math.round(0.6 * 255)
          .toString(16)
          .padStart(2, '0')}`
      : 'rgba(0,0,0,0.6)';
  }

  if (isFull || mode === 'background-only') {
    defaults.gridBackground = dark;
    defaults.uiBackground = midDark;
  }

  defaults.foodPrimary = palette.colors[2];
  defaults.foodSecondary = palette.colors[3];

  return defaults;
}

/** Apply the current palette — returns the current palette and theme colors together. */
export function applyPalette(): {
  palette: ColorPalette | null;
  theme: ReturnType<typeof getThemeColors>;
} {
  return {
    palette: getCurrentPalette(),
    theme: getThemeColors(),
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Overview & Grid
// ---------------------------------------------------------------------------

/** Get a high-level overview of the color studio state. */
export function getColorOverview(): {
  currentPaletteName: string;
  totalPalettes: number;
  totalGradients: number;
  totalCustomColors: number;
  colorMode: ColorMode;
  recentSwitchCount: number;
  moodBreakdown: Record<string, number>;
} {
  const state = ensureState();
  const current = state.palettes.find((p) => p.id === state.currentPaletteId);
  const stats = getColorStats();
  const moodBreakdown: Record<string, number> = {};
  for (const [mood, count] of Object.entries(stats.moodDistribution)) {
    if (count > 0) moodBreakdown[mood] = count;
  }

  return {
    currentPaletteName: current?.name ?? 'Unknown',
    totalPalettes: stats.totalPalettes,
    totalGradients: state.gradients.length,
    totalCustomColors: state.customColors.length,
    colorMode: state.colorMode,
    recentSwitchCount: Math.min(state.paletteHistory.length, 10),
    moodBreakdown,
  };
}

/**
 * Return a grid-friendly representation of all palettes with preview data.
 */
export function getPaletteGrid(): Array<{
  id: string;
  name: string;
  mood: PaletteMood;
  isCustom: boolean;
  isActive: boolean;
  gradientCss: string;
  usageCount: number;
  brightness: number;
}> {
  const state = ensureState();
  return state.palettes.map((p) => ({
    id: p.id,
    name: p.name,
    mood: p.mood,
    isCustom: p.isCustom,
    isActive: p.id === state.currentPaletteId,
    gradientCss: `linear-gradient(135deg, ${p.colors.join(', ')})`,
    usageCount: p.usageCount,
    brightness: Math.round(
      p.colors.reduce((s, c) => s + perceivedBrightness(c), 0) / p.colors.length,
    ),
  }));
}

/**
 * Build a full card representation of a single palette for UI rendering.
 */
export function getPaletteCard(paletteId: string): {
  id: string;
  name: string;
  mood: PaletteMood;
  isCustom: boolean;
  isActive: boolean;
  colors: Array<{ hex: string; brightness: number; textColor: string }>;
  gradientCss: string;
  usageCount: number;
  createdAt: number;
} | null {
  const state = ensureState();
  const p = state.palettes.find((pl) => pl.id === paletteId);
  if (!p) return null;

  return {
    id: p.id,
    name: p.name,
    mood: p.mood,
    isCustom: p.isCustom,
    isActive: p.id === state.currentPaletteId,
    colors: p.colors.map((hex) => {
      const bright = perceivedBrightness(hex);
      return {
        hex,
        brightness: bright,
        textColor: bright > 128 ? '#000000' : '#FFFFFF',
      };
    }),
    gradientCss: `linear-gradient(135deg, ${p.colors.join(', ')})`,
    usageCount: p.usageCount,
    createdAt: p.createdAt,
  };
}

/**
 * Build a card representation of a single gradient preset.
 */
export function getGradientCard(gradientId: string): {
  id: string;
  name: string;
  css: string;
  style: string;
  angle: number;
  startColor: { hex: string; brightness: number };
  endColor: { hex: string; brightness: number };
} | null {
  const g = ensureState().gradients.find((gr) => gr.id === gradientId);
  if (!g) return null;

  return {
    id: g.id,
    name: g.name,
    css: getGradientPreview(g.id) ?? '',
    style: g.style,
    angle: g.angle,
    startColor: { hex: g.startColor, brightness: perceivedBrightness(g.startColor) },
    endColor: { hex: g.endColor, brightness: perceivedBrightness(g.endColor) },
  };
}

// ---------------------------------------------------------------------------
// Exported Functions — Color Stats Grid
// ---------------------------------------------------------------------------

/**
 * Return a grid of stats cells suitable for dashboard rendering.
 */
export function getColorStatsGrid(): Array<{
  label: string;
  value: string | number;
  accent: string;
}> {
  const stats = getColorStats();
  const overview = getColorOverview();
  const current = getCurrentPalette();
  const accentColor = current?.colors[0] ?? '#00FF88';

  return [
    { label: 'Total Palettes', value: stats.totalPalettes, accent: accentColor },
    { label: 'Custom Palettes', value: stats.customPalettes, accent: accentColor },
    { label: 'Total Switches', value: stats.totalSwitches, accent: accentColor },
    { label: 'Avg Usage', value: stats.averageUsage, accent: accentColor },
    { label: 'Gradients', value: overview.totalGradients, accent: accentColor },
    { label: 'Custom Colors', value: overview.totalCustomColors, accent: accentColor },
    { label: 'Color Mode', value: overview.colorMode, accent: accentColor },
    { label: 'Current Palette', value: overview.currentPaletteName, accent: accentColor },
    ...Object.entries(stats.moodDistribution)
      .filter(([, count]) => count > 0)
      .map(([mood, count]) => ({
        label: mood.charAt(0).toUpperCase() + mood.slice(1),
        value: count as number,
        accent: accentColor,
      })),
  ];
}

// ---------------------------------------------------------------------------
// Exported Functions — Mood
// ---------------------------------------------------------------------------

/** Get palettes filtered by mood. */
export function getMoodPalettes(mood: PaletteMood): ColorPalette[] {
  return ensureState()
    .palettes.filter((p) => p.mood === mood)
    .map((p) => ({ ...p }));
}

/** Suggest a palette based on a given mood keyword. */
export function suggestPalette(moodHint: string): ColorPalette | null {
  const lower = moodHint.toLowerCase().trim();
  const state = ensureState();
  const palettes = state.palettes;

  const moodMap: Record<string, PaletteMood[]> = {
    calm: ['calm', 'cool'],
    relaxed: ['calm', 'cool'],
    chill: ['calm', 'cool'],
    energetic: ['energetic', 'bold'],
    exciting: ['energetic', 'bold'],
    hype: ['energetic', 'bold'],
    mysterious: ['mysterious', 'dark'],
    dark: ['dark', 'mysterious'],
    playful: ['playful', 'warm'],
    fun: ['playful', 'warm'],
    happy: ['playful', 'warm'],
    elegant: ['elegant', 'minimal'],
    clean: ['minimal', 'elegant'],
    simple: ['minimal', 'elegant'],
    retro: ['retro', 'warm'],
    vintage: ['retro', 'warm'],
    future: ['futuristic', 'bold'],
    cyber: ['futuristic', 'dark'],
  };

  const targetMoods = moodMap[lower];
  if (!targetMoods) {
    return getRandomPalette();
  }

  for (const mood of targetMoods) {
    const match = palettes.find((p) => p.mood === mood);
    if (match) return { ...match };
  }

  return palettes.length > 0 ? { ...palettes[Math.floor(Math.random() * palettes.length)] } : null;
}

// ---------------------------------------------------------------------------
// Exported Functions — Custom Colors
// ---------------------------------------------------------------------------

/** Save a custom color to the user's collection. */
export function saveCustomColor(hex: string, name?: string): CustomColor | null {
  if (!parseHex(hex)) return null;

  const state = ensureState();
  if (state.customColors.length >= MAX_CUSTOM_COLORS) return null;

  const exists = state.customColors.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  if (exists) return { ...exists };

  const customColor: CustomColor = {
    id: uid(),
    hex: hex.toLowerCase(),
    name: name?.trim() || 'Custom Color',
    createdAt: Date.now(),
    tags: [],
  };

  state.customColors.push(customColor);
  persistState(state);
  return { ...customColor };
}

/** Get all saved custom colors. */
export function getCustomColors(): CustomColor[] {
  return [...ensureState().customColors];
}

// ---------------------------------------------------------------------------
// Exported Functions — Color Utilities
// ---------------------------------------------------------------------------

/** Compute the complementary (opposite) color of a hex color. */
export function getComplementaryColor(hex: string): string | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;

  const [r, g, b] = rgb;
  return rgbToHex(255 - r, 255 - g, 255 - b);
}

/**
 * Get a darker shade of a hex color.
 * @param amount 0–100, where 100 is pure black.
 */
export function getShade(hex: string, amount: number = 25): string | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;

  const factor = 1 - Math.max(0, Math.min(100, amount)) / 100;
  return rgbToHex(clampByte(rgb[0] * factor), clampByte(rgb[1] * factor), clampByte(rgb[2] * factor));
}

/**
 * Get a lighter tint of a hex color.
 * @param amount 0–100, where 100 is pure white.
 */
export function getTint(hex: string, amount: number = 25): string | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;

  const factor = Math.max(0, Math.min(100, amount)) / 100;
  return rgbToHex(
    clampByte(rgb[0] + (255 - rgb[0]) * factor),
    clampByte(rgb[1] + (255 - rgb[1]) * factor),
    clampByte(rgb[2] + (255 - rgb[2]) * factor),
  );
}

/** Convert a hex color string to an { r, g, b } object. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

/** Convert individual r, g, b values (0–255) to a hex color string. */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => {
    const clamped = clampByte(n);
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
