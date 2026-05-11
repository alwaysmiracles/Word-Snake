// =============================================================================
// Pixel Art Studio Wire — Complete Game System
// SSR-safe lazy initialization | px-prefixed exports | No use* functions
// =============================================================================

// ─── Type Definitions ───────────────────────────────────────────────────────

interface PixelRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface PixelLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  data: (PixelRGBA | null)[][];
}

type CanvasSize = 16 | 24 | 32;

type ToolType =
  | "pencil"
  | "brush"
  | "eraser"
  | "fill"
  | "line"
  | "rectangle"
  | "circle"
  | "eyedropper";

interface ToolDef {
  id: ToolType;
  label: string;
  icon: string;
  shortcut: string;
  unlockLevel: number;
}

interface HistoryEntry {
  timestamp: number;
  layerSnapshots: { layerId: string; data: (PixelRGBA | null)[][] }[];
}

interface PixelCanvas {
  id: string;
  name: string;
  width: CanvasSize;
  height: CanvasSize;
  layers: PixelLayer[];
  activeLayerId: string;
  gridVisible: boolean;
  zoom: number;
  history: HistoryEntry[];
  historyIndex: number;
  createdAt: number;
  updatedAt: number;
}

interface GalleryArtwork {
  id: string;
  name: string;
  width: CanvasSize;
  height: CanvasSize;
  tags: string[];
  likes: number;
  liked: boolean;
  isFavorite: boolean;
  thumbnailData: (PixelRGBA | null)[][];
  shareCode: string;
  createdAt: number;
}

interface AnimationFrame {
  id: string;
  index: number;
  data: (PixelRGBA | null)[][];
}

interface PixelAnimation {
  id: string;
  name: string;
  width: CanvasSize;
  height: CanvasSize;
  frames: AnimationFrame[];
  fps: number;
  onionSkin: boolean;
  createdAt: number;
}

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  condition: (s: PixelArtState) => boolean;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface DailyChallenge {
  date: string;
  theme: string;
  description: string;
  icon: string;
  completed: boolean;
  xpReward: number;
  coinReward: number;
}

interface WeeklyContest {
  weekStart: string;
  theme: string;
  description: string;
  icon: string;
  participated: boolean;
  xpReward: number;
  coinReward: number;
}

interface TemplateDef {
  id: string;
  name: string;
  category: string;
  icon: string;
  size: CanvasSize;
  data: (PixelRGBA | null)[][];
}

interface PaletteCategory {
  name: string;
  icon: string;
  colors: PixelRGBA[];
}

interface Unlockable {
  id: string;
  name: string;
  description: string;
  icon: string;
  levelRequired: number;
  coinCost: number;
  unlocked: boolean;
  type: "tool" | "palette" | "canvas_size" | "feature";
}

interface PixelArtState {
  canvases: PixelCanvas[];
  activeCanvasId: string | null;
  activeTool: ToolType;
  activeColor: PixelRGBA;
  palette: PaletteCategory[];
  recentColors: PixelRGBA[];
  customColors: (PixelRGBA | null)[];
  gallery: GalleryArtwork[];
  animations: PixelAnimation[];
  activeAnimationId: string | null;
  dailyChallenge: DailyChallenge;
  weeklyContest: WeeklyContest;
  streak: number;
  lastActiveDate: string;
  artistXP: number;
  artistLevel: number;
  studioCoins: number;
  totalPixelsDrawn: number;
  totalArtworksCreated: number;
  totalAnimationsCreated: number;
  achievements: AchievementDef[];
  unlocks: Unlockable[];
  templates: TemplateDef[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CANVAS_SIZES: CanvasSize[] = [16, 24, 32];

const LAYER_NAMES = ["Background", "Main", "Detail", "Overlay"];

const MAX_HISTORY = 50;
const MAX_GALLERY = 30;
const MAX_ANIM_FRAMES = 8;
const MIN_ANIM_FRAMES = 2;
const MAX_RECENT_COLORS = 8;
const MAX_CUSTOM_COLORS = 8;
const MAX_LAYERS = 4;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

const LEVEL_XP_TABLE: number[] = (() => {
  const table = [0];
  for (let i = 1; i <= 30; i++) {
    table.push(Math.floor(100 * Math.pow(1.25, i - 1)));
  }
  return table;
})();

const TITLE_TABLE: { minLevel: number; title: string; icon: string }[] = [
  { minLevel: 1, title: "Pixel Newbie", icon: "🐣" },
  { minLevel: 5, title: "Doodler", icon: "✏️" },
  { minLevel: 10, title: "Artist", icon: "🎨" },
  { minLevel: 15, title: "Pixel Artisan", icon: "🖌️" },
  { minLevel: 20, title: "Pixel Master", icon: "🏆" },
  { minLevel: 25, title: "Pixel Virtuoso", icon: "✨" },
  { minLevel: 30, title: "Pixel Legend", icon: "👑" },
];

const TOOLS: ToolDef[] = [
  { id: "pencil", label: "Pencil", icon: "✏️", shortcut: "P", unlockLevel: 1 },
  { id: "brush", label: "Brush", icon: "🖌️", shortcut: "B", unlockLevel: 1 },
  { id: "eraser", label: "Eraser", icon: "🧹", shortcut: "E", unlockLevel: 1 },
  { id: "fill", label: "Fill Bucket", icon: "🪣", shortcut: "F", unlockLevel: 3 },
  { id: "line", label: "Line", icon: "📏", shortcut: "L", unlockLevel: 5 },
  { id: "rectangle", label: "Rectangle", icon: "⬜", shortcut: "R", unlockLevel: 8 },
  { id: "circle", label: "Circle", icon: "⭕", shortcut: "C", unlockLevel: 10 },
  { id: "eyedropper", label: "Eyedropper", icon: "💉", shortcut: "I", unlockLevel: 1 },
];

const DAILY_THEMES: { theme: string; description: string; icon: string }[] = [
  { theme: "Draw a Robot", description: "Create a friendly robot character", icon: "🤖" },
  { theme: "Pixel Sunset", description: "Paint a beautiful sunset scene", icon: "🌅" },
  { theme: "Cute Animal", description: "Draw your favorite animal in pixels", icon: "🐱" },
  { theme: "Space Explorer", description: "Design a spaceship or astronaut", icon: "🚀" },
  { theme: "Fantasy Castle", description: "Build a magical castle", icon: "🏰" },
  { theme: "Pixel Food", description: "Create delicious pixel food", icon: "🍕" },
  { theme: "Under the Sea", description: "Draw ocean creatures and coral", icon: "🐠" },
  { theme: "Super Hero", description: "Design your own pixel hero", icon: "🦸" },
  { theme: "Pixel Flower", description: "Create a blooming flower", icon: "🌸" },
  { theme: "Alien World", description: "Design an alien landscape", icon: "👽" },
  { theme: "Music Note", description: "Draw musical instruments or notes", icon: "🎵" },
  { theme: "Pixel Vehicle", description: "Create a car, boat, or plane", icon: "🚗" },
  { theme: "Tree House", description: "Design a cozy tree house", icon: "🌳" },
  { theme: "Pixel Monster", description: "Create a cute or scary monster", icon: "👹" },
  { theme: "Winter Scene", description: "Draw a snowy winter landscape", icon: "❄️" },
];

const WEEKLY_THEMES: { theme: string; description: string; icon: string }[] = [
  { theme: "Retro Arcade", description: "Create pixel art inspired by classic arcade games", icon: "👾" },
  { theme: "Nature Walk", description: "Design a complete nature scene with wildlife", icon: "🌲" },
  { theme: "City Skyline", description: "Build a detailed city skyline at night", icon: "🌃" },
  { theme: "Mythical Creature", description: "Draw a dragon, unicorn, or phoenix", icon: "🐉" },
  { theme: "Pixel Portrait", description: "Create a self-portrait in pixel art style", icon: "🧑‍🎨" },
];

const ACHIEVEMENT_DEFS: {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  conditionKey: string;
}[] = [
  { id: "first_pixel", name: "First Pixel", description: "Draw your first pixel", icon: "⭐", xpReward: 10, coinReward: 5, conditionKey: "totalPixelsDrawn>=1" },
  { id: "first_artwork", name: "First Masterpiece", description: "Save your first artwork to gallery", icon: "🖼️", xpReward: 25, coinReward: 10, conditionKey: "totalArtworksCreated>=1" },
  { id: "five_artworks", name: "Growing Collection", description: "Save 5 artworks to gallery", icon: "📚", xpReward: 50, coinReward: 25, conditionKey: "totalArtworksCreated>=5" },
  { id: "gallery_full", name: "Gallery Full", description: "Fill your gallery with 30 artworks", icon: "🏛️", xpReward: 200, coinReward: 100, conditionKey: "totalArtworksCreated>=30" },
  { id: "first_animation", name: "Animator", description: "Create your first animation", icon: "🎬", xpReward: 50, coinReward: 20, conditionKey: "totalAnimationsCreated>=1" },
  { id: "animation_master", name: "Animation Master", description: "Create 10 animations", icon: "🎞️", xpReward: 150, coinReward: 75, conditionKey: "totalAnimationsCreated>=10" },
  { id: "colorful", name: "Colorful Mind", description: "Use 16 different colors in one session", icon: "🌈", xpReward: 30, coinReward: 15, conditionKey: "totalPixelsDrawn>=100" },
  { id: "pixel_hundred", name: "Centurion", description: "Draw 100 pixels", icon: "💯", xpReward: 20, coinReward: 10, conditionKey: "totalPixelsDrawn>=100" },
  { id: "pixel_thousand", name: "Pixel Thousand", description: "Draw 1,000 pixels", icon: "🔥", xpReward: 100, coinReward: 50, conditionKey: "totalPixelsDrawn>=1000" },
  { id: "pixel_ten_k", name: "Pixel Legend", description: "Draw 10,000 pixels", icon: "💎", xpReward: 300, coinReward: 150, conditionKey: "totalPixelsDrawn>=10000" },
  { id: "level5", name: "Rising Star", description: "Reach Artist Level 5", icon: "🌟", xpReward: 50, coinReward: 25, conditionKey: "artistLevel>=5" },
  { id: "level10", name: "Established Artist", description: "Reach Artist Level 10", icon: "🎨", xpReward: 100, coinReward: 50, conditionKey: "artistLevel>=10" },
  { id: "level20", name: "Master Creator", description: "Reach Artist Level 20", icon: "👑", xpReward: 250, coinReward: 125, conditionKey: "artistLevel>=20" },
  { id: "level30", name: "Ultimate Legend", description: "Reach Artist Level 30", icon: "🏆", xpReward: 500, coinReward: 250, conditionKey: "artistLevel>=30" },
  { id: "streak3", name: "Streak Starter", description: "Maintain a 3-day activity streak", icon: "📅", xpReward: 30, coinReward: 15, conditionKey: "streak>=3" },
  { id: "streak7", name: "Weekly Warrior", description: "Maintain a 7-day activity streak", icon: "🗓️", xpReward: 75, coinReward: 40, conditionKey: "streak>=7" },
  { id: "streak30", name: "Monthly Master", description: "Maintain a 30-day activity streak", icon: "📅", xpReward: 300, coinReward: 150, conditionKey: "streak>=30" },
  { id: "daily_first", name: "Challenge Accepted", description: "Complete your first daily challenge", icon: "🎯", xpReward: 40, coinReward: 20, conditionKey: "totalArtworksCreated>=1" },
  { id: "liked5", name: "Fan Favorite", description: "Like 5 artworks", icon: "❤️", xpReward: 25, coinReward: 10, conditionKey: "totalPixelsDrawn>=200" },
  { id: "all_tools", name: "Tool Master", description: "Unlock all drawing tools", icon: "🔧", xpReward: 200, coinReward: 100, conditionKey: "artistLevel>=10" },
];

// ─── Utility Functions ──────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function rgba(r: number, g: number, b: number, a: number = 255): PixelRGBA {
  return { r, g, b, a };
}

function cloneColor(c: PixelRGBA): PixelRGBA {
  return { r: c.r, g: c.g, b: c.b, a: c.a };
}

function colorEquals(a: PixelRGBA | null, b: PixelRGBA | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

function createEmptyLayerData(w: number, h: number): (PixelRGBA | null)[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => null));
}

function cloneLayerData(data: (PixelRGBA | null)[][]): (PixelRGBA | null)[][] {
  return data.map(row => row.map(cell => (cell ? cloneColor(cell) : null)));
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekStartStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function buildDefaultPalette(): PaletteCategory[] {
  return [
    {
      name: "Basics",
      icon: "🎯",
      colors: [
        rgba(255, 0, 0), rgba(0, 255, 0), rgba(0, 0, 255), rgba(255, 255, 0),
        rgba(255, 0, 255), rgba(0, 255, 255), rgba(255, 165, 0), rgba(128, 0, 128),
        rgba(255, 255, 255), rgba(0, 0, 0),
      ],
    },
    {
      name: "Pastels",
      icon: "🧁",
      colors: [
        rgba(255, 182, 193), rgba(173, 216, 230), rgba(144, 238, 144), rgba(255, 255, 224),
        rgba(255, 218, 185), rgba(221, 160, 221), rgba(176, 224, 230), rgba(255, 192, 203),
      ],
    },
    {
      name: "Earth",
      icon: "🌍",
      colors: [
        rgba(139, 69, 19), rgba(160, 82, 45), rgba(210, 180, 140), rgba(34, 139, 34),
        rgba(0, 128, 0), rgba(85, 107, 47), rgba(189, 183, 107), rgba(244, 164, 96),
      ],
    },
    {
      name: "Neon",
      icon: "💡",
      colors: [
        rgba(57, 255, 20), rgba(255, 16, 240), rgba(0, 255, 255), rgba(255, 255, 0),
        rgba(255, 0, 128), rgba(128, 0, 255), rgba(255, 100, 0), rgba(0, 200, 255),
      ],
    },
    {
      name: "Grayscale",
      icon: "⬛",
      colors: [
        rgba(32, 32, 32), rgba(64, 64, 64), rgba(96, 96, 96), rgba(128, 128, 128),
        rgba(160, 160, 160), rgba(192, 192, 192), rgba(224, 224, 224), rgba(240, 240, 240),
      ],
    },
    {
      name: "Custom",
      icon: "🎨",
      colors: [],
    },
  ];
}

function buildAchievements(): AchievementDef[] {
  const evalCondition = (key: string) => (s: PixelArtState): boolean => {
    const [field, op, valStr] = [key.slice(0, key.indexOf(">=") > 0 ? key.indexOf(">=") : -1), ">=", "0"];
    const match = key.match(/^(\w+)(>=)(\d+)$/);
    if (!match) return false;
    const [, fieldName, , val] = match;
    const stateVal = (s as unknown as Record<string, unknown>)[fieldName];
    return typeof stateVal === "number" && stateVal >= parseInt(val, 10);
  };

  return ACHIEVEMENT_DEFS.map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    icon: d.icon,
    xpReward: d.xpReward,
    coinReward: d.coinReward,
    condition: evalCondition(d.conditionKey),
    unlocked: false,
    unlockedAt: null,
  }));
}

function buildUnlockables(): Unlockable[] {
  return [
    { id: "tool_fill", name: "Fill Bucket", description: "Flood fill areas with color", icon: "🪣", levelRequired: 3, coinCost: 0, unlocked: false, type: "tool" },
    { id: "tool_line", name: "Line Tool", description: "Draw straight lines", icon: "📏", levelRequired: 5, coinCost: 0, unlocked: false, type: "tool" },
    { id: "tool_rectangle", name: "Rectangle Tool", description: "Draw rectangles", icon: "⬜", levelRequired: 8, coinCost: 0, unlocked: false, type: "tool" },
    { id: "tool_circle", name: "Circle Tool", description: "Draw circles", icon: "⭕", levelRequired: 10, coinCost: 0, unlocked: false, type: "tool" },
    { id: "canvas_24", name: "Medium Canvas", description: "Unlock 24×24 canvas size", icon: "📐", levelRequired: 2, coinCost: 0, unlocked: false, type: "canvas_size" },
    { id: "canvas_32", name: "Large Canvas", description: "Unlock 32×32 canvas size", icon: "🗺️", levelRequired: 6, coinCost: 0, unlocked: false, type: "canvas_size" },
    { id: "palette_neon", name: "Neon Palette Pack", description: "Unlock neon color palette", icon: "💡", levelRequired: 4, coinCost: 50, unlocked: false, type: "palette" },
    { id: "palette_earth", name: "Earth Palette Pack", description: "Unlock earth tone palette", icon: "🌍", levelRequired: 4, coinCost: 50, unlocked: false, type: "palette" },
    { id: "feature_onion", name: "Onion Skinning", description: "Show previous frame as ghost in animations", icon: "👻", levelRequired: 5, coinCost: 30, unlocked: false, type: "feature" },
    { id: "feature_layers", name: "Full Layers", description: "Unlock all 4 canvas layers", icon: "🍰", levelRequired: 3, coinCost: 0, unlocked: false, type: "feature" },
    { id: "palette_pastel", name: "Pastel Palette Pack", description: "Unlock pastel color palette", icon: "🧁", levelRequired: 2, coinCost: 30, unlocked: false, type: "palette" },
    { id: "feature_share", name: "Share Codes", description: "Generate share codes for artworks", icon: "🔗", levelRequired: 7, coinCost: 0, unlocked: false, type: "feature" },
  ];
}

function buildTemplates(): TemplateDef[] {
  const empty16 = createEmptyLayerData(16, 16);
  const empty24 = createEmptyLayerData(24, 24);
  const empty32 = createEmptyLayerData(32, 32);

  const putPixel = (data: (PixelRGBA | null)[][], x: number, y: number, c: PixelRGBA) => {
    if (y >= 0 && y < data.length && x >= 0 && x < data[0].length) {
      data[y][x] = c;
    }
  };

  // Template 1: Heart (16x16)
  const heart = cloneLayerData(empty16);
  const rc = rgba(255, 50, 80);
  const heartPixels = [
    [2,1],[3,1],[5,1],[6,1],[8,1],[9,1],[11,1],[12,1],[13,1],
    [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[14,2],
    [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],[12,3],[13,3],[14,3],
    [2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],
    [3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],[12,5],
    [4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],
    [5,7],[6,7],[7,7],[8,7],[9,7],[10,7],
    [6,8],[7,8],[8,8],[9,8],
    [7,9],[8,9],
  ];
  heartPixels.forEach(([x, y]) => putPixel(heart, x, y, rc));

  // Template 2: Smiley (16x16)
  const smiley = cloneLayerData(empty16);
  const yc = rgba(255, 220, 50);
  for (let y = 3; y <= 12; y++) for (let x = 3; x <= 12; x++) putPixel(smiley, x, y, yc);
  putPixel(smiley, 5, 6, rgba(0, 0, 0));
  putPixel(smiley, 10, 6, rgba(0, 0, 0));
  for (let x = 5; x <= 10; x++) {
    if (x === 5 || x === 10) putPixel(smiley, x, 9, rgba(0, 0, 0));
    else putPixel(smiley, x, 10, rgba(0, 0, 0));
  }

  // Template 3: Sword (16x16)
  const sword = cloneLayerData(empty16);
  const sc = rgba(192, 192, 192);
  const hc = rgba(139, 90, 43);
  for (let y = 1; y <= 12; y++) putPixel(sword, 7, y, sc);
  for (let y = 1; y <= 12; y++) putPixel(sword, 8, y, sc);
  putPixel(sword, 5, 13, hc); putPixel(sword, 6, 13, hc);
  putPixel(sword, 7, 13, hc); putPixel(sword, 8, 13, hc);
  putPixel(sword, 9, 13, hc); putPixel(sword, 10, 13, hc);
  putPixel(sword, 6, 14, hc); putPixel(sword, 7, 14, hc);
  putPixel(sword, 8, 14, hc); putPixel(sword, 9, 14, hc);
  putPixel(sword, 7, 0, rgba(255, 255, 200));
  putPixel(sword, 8, 0, rgba(255, 255, 200));

  // Template 4: Tree (16x16)
  const tree = cloneLayerData(empty16);
  const tc = rgba(34, 139, 34);
  const trc = rgba(139, 69, 19);
  for (let y = 2; y <= 6; y++) for (let x = 5; x <= 10; x++) putPixel(tree, x, y, tc);
  for (let y = 4; y <= 8; y++) for (let x = 4; x <= 11; x++) putPixel(tree, x, y, tc);
  for (let y = 6; y <= 10; y++) for (let x = 3; x <= 12; x++) putPixel(tree, x, y, tc);
  for (let y = 11; y <= 14; y++) { putPixel(tree, 7, y, trc); putPixel(tree, 8, y, trc); }

  // Template 5: Star (16x16)
  const star = cloneLayerData(empty16);
  const stc = rgba(255, 215, 0);
  [[7,1],[8,1],[7,2],[8,2],[6,3],[7,3],[8,3],[9,3],
   [5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],
   [4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],
   [4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],
   [5,8],[6,8],[7,8],[8,8],[9,8],[10,8],[6,9],[7,9],[8,9],[9,9],[7,10],[8,10]].forEach(([x,y]) => putPixel(star, x, y, stc));

  // Template 6: Mushroom (16x16)
  const mushroom = cloneLayerData(empty16);
  const mrc = rgba(255, 0, 0);
  const mwc = rgba(255, 255, 255);
  const msc = rgba(200, 180, 150);
  for (let x = 4; x <= 11; x++) putPixel(mushroom, x, 6, mrc);
  for (let y = 3; y <= 5; y++) for (let x = 3; x <= 12; x++) putPixel(mushroom, x, y, mrc);
  putPixel(mushroom, 5, 4, mwc); putPixel(mushroom, 9, 4, mwc); putPixel(mushroom, 7, 3, mwc);
  for (let y = 7; y <= 11; y++) { putPixel(mushroom, 6, y, msc); putPixel(mushroom, 7, y, msc); putPixel(mushroom, 8, y, msc); putPixel(mushroom, 9, y, msc); }
  for (let x = 5; x <= 10; x++) putPixel(mushroom, x, 12, msc);

  // Template 7: Spaceship (24x24)
  const spaceship = cloneLayerData(empty24);
  const spc = rgba(150, 150, 200);
  const spg = rgba(0, 255, 150);
  for (let y = 4; y <= 10; y++) for (let x = 8; x <= 15; x++) putPixel(spaceship, x, y, spc);
  for (let x = 10; x <= 13; x++) putPixel(spaceship, x, 3, spc);
  putPixel(spaceship, 11, 2, spc); putPixel(spaceship, 12, 2, spc);
  for (let x = 10; x <= 13; x++) putPixel(spaceship, x, 11, rgba(0, 150, 255));
  putPixel(spaceship, 9, 11, rgba(0, 150, 255)); putPixel(spaceship, 14, 11, rgba(0, 150, 255));

  // Template 8: Castle (24x24)
  const castle = cloneLayerData(empty24);
  const csc = rgba(160, 160, 170);
  for (let y = 6; y <= 18; y++) for (let x = 5; x <= 18; x++) putPixel(castle, x, y, csc);
  for (let x = 5; x <= 18; x += 4) for (let y = 4; y <= 5; y++) putPixel(castle, x, y, csc);
  putPixel(castle, 6, 4, csc); putPixel(castle, 7, 4, csc);
  putPixel(castle, 11, 12, rgba(80, 50, 30)); putPixel(castle, 12, 12, rgba(80, 50, 30));

  // Template 9: Skull (16x16)
  const skull = cloneLayerData(empty16);
  const skc = rgba(240, 240, 230);
  for (let y = 3; y <= 10; y++) for (let x = 4; x <= 11; x++) putPixel(skull, x, y, skc);
  putPixel(skull, 3, 5, skc); putPixel(skull, 12, 5, skc);
  for (let y = 11; y <= 13; y++) for (let x = 5; x <= 10; x++) putPixel(skull, x, y, skc);
  putPixel(skull, 6, 5, rgba(0,0,0)); putPixel(skull, 7, 5, rgba(0,0,0));
  putPixel(skull, 8, 5, rgba(0,0,0)); putPixel(skull, 9, 5, rgba(0,0,0));
  putPixel(skull, 6, 6, rgba(0,0,0)); putPixel(skull, 7, 6, rgba(0,0,0));
  putPixel(skull, 8, 6, rgba(0,0,0)); putPixel(skull, 9, 6, rgba(0,0,0));
  putPixel(skull, 7, 8, rgba(0,0,0)); putPixel(skull, 8, 8, rgba(0,0,0));
  putPixel(skull, 7, 9, rgba(0,0,0)); putPixel(skull, 8, 9, rgba(0,0,0));

  // Template 10: Diamond (16x16)
  const diamond = cloneLayerData(empty16);
  const dc = rgba(100, 200, 255);
  const dlc = rgba(180, 230, 255);
  [[7,1],[8,1],[6,2],[7,2],[8,2],[9,2],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
   [4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[3,5],[4,5],[5,5],[6,5],[7,5],
   [8,5],[9,5],[10,5],[11,5],[12,5],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],[12,6],[13,6],
   [3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],[12,7],
   [4,8],[5,8],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],
   [5,9],[6,9],[7,9],[8,9],[9,9],[10,9],[6,10],[7,10],[8,10],[9,10],[7,11],[8,11]].forEach(([x,y]) => putPixel(diamond, x, y, y <= 3 ? dlc : dc));

  // Templates 11-20: Use empty canvases with different themes
  const emptyTemplates: { name: string; category: string; icon: string; size: CanvasSize }[] = [
    { name: "Pixel Cat", category: "Animals", icon: "🐱", size: 16 },
    { name: "Pixel Dog", category: "Animals", icon: "🐶", size: 16 },
    { name: "Pixel House", category: "Buildings", icon: "🏠", size: 16 },
    { name: "Pixel Car", category: "Vehicles", icon: "🚗", size: 16 },
    { name: "Pixel Fish", category: "Animals", icon: "🐟", size: 16 },
    { name: "Pixel Ghost", category: "Fantasy", icon: "👻", size: 16 },
    { name: "Pixel Potion", category: "Fantasy", icon: "🧪", size: 16 },
    { name: "Pixel Key", category: "Objects", icon: "🔑", size: 16 },
    { name: "Pixel Shield", category: "Objects", icon: "🛡️", size: 24 },
    { name: "Pixel Crown", category: "Objects", icon: "👑", size: 24 },
  ];

  const filledTemplates: TemplateDef[] = [
    { id: uid(), name: "Heart", category: "Shapes", icon: "❤️", size: 16, data: heart },
    { id: uid(), name: "Smiley", category: "Faces", icon: "😊", size: 16, data: smiley },
    { id: uid(), name: "Sword", category: "Weapons", icon: "⚔️", size: 16, data: sword },
    { id: uid(), name: "Tree", category: "Nature", icon: "🌲", size: 16, data: tree },
    { id: uid(), name: "Star", category: "Shapes", icon: "⭐", size: 16, data: star },
    { id: uid(), name: "Mushroom", category: "Nature", icon: "🍄", size: 16, data: mushroom },
    { id: uid(), name: "Spaceship", category: "Vehicles", icon: "🚀", size: 24, data: spaceship },
    { id: uid(), name: "Castle", category: "Buildings", icon: "🏰", size: 24, data: castle },
    { id: uid(), name: "Skull", category: "Fantasy", icon: "💀", size: 16, data: skull },
    { id: uid(), name: "Diamond", category: "Objects", icon: "💎", size: 16, data: diamond },
  ];

  const outlineTemplates: TemplateDef[] = emptyTemplates.map(t => ({
    id: uid(),
    name: t.name,
    category: t.category,
    icon: t.icon,
    size: t.size,
    data: cloneLayerData(t.size === 16 ? empty16 : empty24),
  }));

  return [...filledTemplates, ...outlineTemplates];
}

// ─── Bresenham's Line Algorithm ─────────────────────────────────────────────

function bresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const points: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return points;
}

// ─── Midpoint Circle Algorithm ──────────────────────────────────────────────

function midpointCircle(cx: number, cy: number, r: number): [number, number][] {
  const points: [number, number][] = [];
  let x = r;
  let y = 0;
  let err = 1 - r;

  const plotSymmetric = (px: number, py: number) => {
    points.push([cx + px, cy + py], [cx - px, cy + py], [cx + px, cy - py], [cx - px, cy - py]);
    points.push([cx + py, cy + px], [cx - py, cy + px], [cx + py, cy - px], [cx - py, cy - px]);
  };

  while (x >= y) {
    plotSymmetric(x, y);
    y++;
    if (err < 0) { err += 2 * y + 1; }
    else { x--; err += 2 * (y - x) + 1; }
  }

  // Deduplicate
  const seen = new Set<string>();
  return points.filter(([px, py]) => {
    const key = `${px},${py}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Flood Fill Algorithm ───────────────────────────────────────────────────

function floodFill(
  data: (PixelRGBA | null)[][],
  startX: number,
  startY: number,
  fillColor: PixelRGBA,
): (PixelRGBA | null)[][] {
  const newData = cloneLayerData(data);
  const h = newData.length;
  const w = newData[0].length;
  if (startX < 0 || startX >= w || startY < 0 || startY >= h) return newData;

  const targetColor = newData[startY][startX];
  if (colorEquals(targetColor, fillColor)) return newData;

  const stack: [number, number][] = [[startX, startY]];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    if (!colorEquals(newData[y][x], targetColor)) continue;

    visited.add(key);
    newData[y][x] = cloneColor(fillColor);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return newData;
}

// ─── State Initialization ───────────────────────────────────────────────────

let state: PixelArtState | null = null;

function ensureInit(): PixelArtState {
  if (state !== null) return state;

  const today = getTodayStr();
  const seed = dateSeed(today);
  const themeIdx = seed % DAILY_THEMES.length;
  const dailyTheme = DAILY_THEMES[themeIdx];

  const weekStart = getWeekStartStr();
  const weekSeed = dateSeed(weekStart);
  const weekIdx = weekSeed % WEEKLY_THEMES.length;
  const weeklyTheme = WEEKLY_THEMES[weekIdx];

  state = {
    canvases: [],
    activeCanvasId: null,
    activeTool: "pencil",
    activeColor: rgba(0, 0, 0),
    palette: buildDefaultPalette(),
    recentColors: [],
    customColors: Array.from({ length: MAX_CUSTOM_COLORS }, () => null),
    gallery: [],
    animations: [],
    activeAnimationId: null,
    dailyChallenge: {
      date: today,
      theme: dailyTheme.theme,
      description: dailyTheme.description,
      icon: dailyTheme.icon,
      completed: false,
      xpReward: 50,
      coinReward: 25,
    },
    weeklyContest: {
      weekStart: weekStart,
      theme: weeklyTheme.theme,
      description: weeklyTheme.description,
      icon: weeklyTheme.icon,
      participated: false,
      xpReward: 200,
      coinReward: 100,
    },
    streak: 0,
    lastActiveDate: "",
    artistXP: 0,
    artistLevel: 1,
    studioCoins: 0,
    totalPixelsDrawn: 0,
    totalArtworksCreated: 0,
    totalAnimationsCreated: 0,
    achievements: buildAchievements(),
    unlocks: buildUnlockables(),
    templates: buildTemplates(),
  };

  return state;
}

// ─── History Management ─────────────────────────────────────────────────────

function pushHistory(s: PixelArtState, canvas: PixelCanvas): void {
  const snapshot: HistoryEntry = {
    timestamp: Date.now(),
    layerSnapshots: canvas.layers.map(l => ({ layerId: l.id, data: cloneLayerData(l.data) })),
  };

  // Truncate future history if we're not at the end
  canvas.history = canvas.history.slice(0, canvas.historyIndex + 1);
  canvas.history.push(snapshot);

  if (canvas.history.length > MAX_HISTORY) {
    canvas.history.shift();
  }
  canvas.historyIndex = canvas.history.length - 1;
}

function restoreFromHistory(canvas: PixelCanvas, entry: HistoryEntry): void {
  for (const snap of entry.layerSnapshots) {
    const layer = canvas.layers.find(l => l.id === snap.layerId);
    if (layer) {
      layer.data = cloneLayerData(snap.data);
    }
  }
}

// ─── Level / XP Calculation ─────────────────────────────────────────────────

function recalcLevel(s: PixelArtState): void {
  let level = 1;
  for (let i = 1; i < LEVEL_XP_TABLE.length; i++) {
    if (s.artistXP >= LEVEL_XP_TABLE[i]) {
      level = i;
    } else {
      break;
    }
  }
  s.artistLevel = level;
  refreshUnlocks(s);
}

function refreshUnlocks(s: PixelArtState): void {
  for (const u of s.unlocks) {
    if (!u.unlocked && s.artistLevel >= u.levelRequired && u.coinCost === 0) {
      u.unlocked = true;
    }
  }
}

function refreshStreak(s: PixelArtState): void {
  const today = getTodayStr();
  if (s.lastActiveDate === today) return;

  if (s.lastActiveDate === "") {
    s.streak = 1;
  } else {
    const last = new Date(s.lastActiveDate);
    const now = new Date(today);
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      s.streak += 1;
    } else if (diffDays > 1) {
      s.streak = 1;
    }
  }
  s.lastActiveDate = today;
}

// ─── Achievement Checking ───────────────────────────────────────────────────

function checkAllAchievements(s: PixelArtState): void {
  for (const a of s.achievements) {
    if (!a.unlocked && a.condition(s)) {
      a.unlocked = true;
      a.unlockedAt = Date.now();
      s.artistXP += a.xpReward;
      s.studioCoins += a.coinReward;
    }
  }
  recalcLevel(s);
}

// ─── Flatten canvas to single layer (for thumbnails/gallery) ────────────────

function flattenCanvas(canvas: PixelCanvas): (PixelRGBA | null)[][] {
  const w = canvas.width;
  const h = canvas.height;
  const flat: (PixelRGBA | null)[][] = createEmptyLayerData(w, h);

  for (const layer of canvas.layers) {
    if (!layer.visible) continue;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (layer.data[y][x] !== null) {
          flat[y][x] = cloneColor(layer.data[y][x]!);
        }
      }
    }
  }
  return flat;
}

// ─── Share Code Generation ──────────────────────────────────────────────────

function encodeShareCode(data: (PixelRGBA | null)[][]): string {
  const flat: number[] = [];
  for (const row of data) {
    for (const cell of row) {
      if (cell) {
        flat.push(cell.r, cell.g, cell.b, cell.a);
      } else {
        flat.push(-1);
      }
    }
  }
  const json = JSON.stringify({ w: data[0]?.length ?? 0, h: data.length, d: flat });
  if (typeof btoa !== "undefined") {
    return btoa(json);
  }
  // Fallback for SSR: hex encode
  return Array.from(json).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}

// =============================================================================
// EXPORTED FUNCTIONS — State Management
// =============================================================================

export function pxGetState(): PixelArtState {
  return ensureInit();
}

export function pxResetState(): void {
  state = null;
}

// =============================================================================
// EXPORTED FUNCTIONS — Canvas Management
// =============================================================================

export function pxCreateCanvas(name: string, size: CanvasSize = 16): PixelCanvas {
  const s = ensureInit();

  // Check unlock for larger sizes
  if (size === 24 && !s.unlocks.find(u => u.id === "canvas_24")?.unlocked) {
    size = 16;
  }
  if (size === 32 && !s.unlocks.find(u => u.id === "canvas_32")?.unlocked) {
    size = 16;
  }

  const canvas: PixelCanvas = {
    id: uid(),
    name: name || "Untitled Canvas",
    width: size,
    height: size,
    layers: [{
      id: uid(),
      name: LAYER_NAMES[0],
      visible: true,
      opacity: 1,
      data: createEmptyLayerData(size, size),
    }],
    activeLayerId: "",
    gridVisible: true,
    zoom: 4,
    history: [],
    historyIndex: -1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  canvas.activeLayerId = canvas.layers[0].id;

  // Push initial state to history
  pushHistory(s, canvas);

  s.canvases.push(canvas);
  s.activeCanvasId = canvas.id;
  refreshStreak(s);
  checkAllAchievements(s);
  return canvas;
}

export function pxGetCanvas(canvasId: string): PixelCanvas | null {
  const s = ensureInit();
  return s.canvases.find(c => c.id === canvasId) ?? null;
}

export function pxGetActiveCanvas(): PixelCanvas | null {
  const s = ensureInit();
  if (!s.activeCanvasId) return null;
  return s.canvases.find(c => c.id === s.activeCanvasId) ?? null;
}

export function pxDeleteCanvas(canvasId: string): boolean {
  const s = ensureInit();
  const idx = s.canvases.findIndex(c => c.id === canvasId);
  if (idx === -1) return false;
  s.canvases.splice(idx, 1);
  if (s.activeCanvasId === canvasId) {
    s.activeCanvasId = s.canvases.length > 0 ? s.canvases[s.canvases.length - 1].id : null;
  }
  return true;
}

export function pxResizeCanvas(canvasId: string, newSize: CanvasSize): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;
  if (newSize === 24 && !s.unlocks.find(u => u.id === "canvas_24")?.unlocked) return false;
  if (newSize === 32 && !s.unlocks.find(u => u.id === "canvas_32")?.unlocked) return false;

  pushHistory(s, canvas);

  for (const layer of canvas.layers) {
    const newData = createEmptyLayerData(newSize, newSize);
    const minW = Math.min(canvas.width, newSize);
    const minH = Math.min(canvas.height, newSize);
    for (let y = 0; y < minH; y++) {
      for (let x = 0; x < minW; x++) {
        newData[y][x] = layer.data[y][x];
      }
    }
    layer.data = newData;
  }

  canvas.width = newSize;
  canvas.height = newSize;
  canvas.updatedAt = Date.now();
  return true;
}

export function pxSetPixel(canvasId: string, x: number, y: number, color: PixelRGBA | null): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;

  const layer = canvas.layers.find(l => l.id === canvas.activeLayerId);
  if (!layer || !layer.visible) return false;
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return false;

  pushHistory(s, canvas);
  layer.data[y][x] = color ? cloneColor(color) : null;
  canvas.updatedAt = Date.now();

  if (color) {
    s.totalPixelsDrawn++;
    pxAddRecentColor(color);
  }

  checkAllAchievements(s);
  return true;
}

export function pxGetPixel(canvasId: string, x: number, y: number): PixelRGBA | null {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return null;
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return null;

  // Return topmost visible layer pixel
  for (let i = canvas.layers.length - 1; i >= 0; i--) {
    const layer = canvas.layers[i];
    if (layer.visible && layer.data[y][x] !== null) {
      return cloneColor(layer.data[y][x]!);
    }
  }
  return null;
}

export function pxFillArea(canvasId: string, startX: number, startY: number, color: PixelRGBA): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;

  const layer = canvas.layers.find(l => l.id === canvas.activeLayerId);
  if (!layer || !layer.visible) return false;

  pushHistory(s, canvas);
  layer.data = floodFill(layer.data, startX, startY, color);
  canvas.updatedAt = Date.now();
  s.totalPixelsDrawn++;
  pxAddRecentColor(color);
  checkAllAchievements(s);
  return true;
}

export function pxDrawLine(canvasId: string, x0: number, y0: number, x1: number, y1: number, color: PixelRGBA): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;

  const layer = canvas.layers.find(l => l.id === canvas.activeLayerId);
  if (!layer || !layer.visible) return false;

  pushHistory(s, canvas);
  const points = bresenhamLine(x0, y0, x1, y1);
  for (const [px, py] of points) {
    if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
      layer.data[py][px] = cloneColor(color);
      s.totalPixelsDrawn++;
    }
  }
  canvas.updatedAt = Date.now();
  pxAddRecentColor(color);
  checkAllAchievements(s);
  return true;
}

export function pxDrawRect(canvasId: string, x0: number, y0: number, x1: number, y1: number, color: PixelRGBA, filled: boolean = false): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;

  const layer = canvas.layers.find(l => l.id === canvas.activeLayerId);
  if (!layer || !layer.visible) return false;

  pushHistory(s, canvas);
  const minX = clamp(Math.min(x0, x1), 0, canvas.width - 1);
  const maxX = clamp(Math.max(x0, x1), 0, canvas.width - 1);
  const minY = clamp(Math.min(y0, y1), 0, canvas.height - 1);
  const maxY = clamp(Math.max(y0, y1), 0, canvas.height - 1);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (filled || x === minX || x === maxX || y === minY || y === maxY) {
        layer.data[y][x] = cloneColor(color);
        s.totalPixelsDrawn++;
      }
    }
  }
  canvas.updatedAt = Date.now();
  pxAddRecentColor(color);
  checkAllAchievements(s);
  return true;
}

export function pxDrawCircle(canvasId: string, cx: number, cy: number, radius: number, color: PixelRGBA): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;

  const layer = canvas.layers.find(l => l.id === canvas.activeLayerId);
  if (!layer || !layer.visible) return false;

  pushHistory(s, canvas);
  const points = midpointCircle(cx, cy, radius);
  for (const [px, py] of points) {
    if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
      layer.data[py][px] = cloneColor(color);
      s.totalPixelsDrawn++;
    }
  }
  canvas.updatedAt = Date.now();
  pxAddRecentColor(color);
  checkAllAchievements(s);
  return true;
}

export function pxApplyBrush(canvasId: string, cx: number, cy: number, color: PixelRGBA): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;

  const layer = canvas.layers.find(l => l.id === canvas.activeLayerId);
  if (!layer || !layer.visible) return false;

  pushHistory(s, canvas);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const px = cx + dx;
      const py = cy + dy;
      if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
        layer.data[py][px] = cloneColor(color);
        s.totalPixelsDrawn++;
      }
    }
  }
  canvas.updatedAt = Date.now();
  pxAddRecentColor(color);
  checkAllAchievements(s);
  return true;
}

export function pxUndo(canvasId: string): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas || canvas.historyIndex <= 0) return false;
  canvas.historyIndex--;
  restoreFromHistory(canvas, canvas.history[canvas.historyIndex]);
  canvas.updatedAt = Date.now();
  return true;
}

export function pxRedo(canvasId: string): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas || canvas.historyIndex >= canvas.history.length - 1) return false;
  canvas.historyIndex++;
  restoreFromHistory(canvas, canvas.history[canvas.historyIndex]);
  canvas.updatedAt = Date.now();
  return true;
}

export function pxGetHistory(canvasId: string): { total: number; currentIndex: number; canUndo: boolean; canRedo: boolean } {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return { total: 0, currentIndex: -1, canUndo: false, canRedo: false };
  return {
    total: canvas.history.length,
    currentIndex: canvas.historyIndex,
    canUndo: canvas.historyIndex > 0,
    canRedo: canvas.historyIndex < canvas.history.length - 1,
  };
}

export function pxClearCanvas(canvasId: string): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;

  pushHistory(s, canvas);
  for (const layer of canvas.layers) {
    layer.data = createEmptyLayerData(canvas.width, canvas.height);
  }
  canvas.updatedAt = Date.now();
  return true;
}

export function pxGetCanvasSize(canvasId: string): { width: CanvasSize; height: CanvasSize } | null {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return null;
  return { width: canvas.width, height: canvas.height };
}

export function pxGetCanvasGrid(canvasId: string): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;
  return canvas.gridVisible;
}

export function pxToggleGrid(canvasId: string): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;
  canvas.gridVisible = !canvas.gridVisible;
  return canvas.gridVisible;
}

export function pxSetTool(tool: ToolType): boolean {
  const s = ensureInit();
  const toolDef = TOOLS.find(t => t.id === tool);
  if (!toolDef) return false;
  if (toolDef.unlockLevel > s.artistLevel) return false;
  s.activeTool = tool;
  return true;
}

export function pxGetTool(): ToolType {
  const s = ensureInit();
  return s.activeTool;
}

export function pxSetZoom(canvasId: string, zoom: number): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;
  canvas.zoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  return true;
}

export function pxGetZoom(canvasId: string): number {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return 1;
  return canvas.zoom;
}

// ─── Layer Management ───────────────────────────────────────────────────────

export function pxAddLayer(canvasId: string): string | null {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return null;
  if (canvas.layers.length >= MAX_LAYERS) return null;
  if (canvas.layers.length >= 2 && !s.unlocks.find(u => u.id === "feature_layers")?.unlocked) return null;

  const layerIdx = canvas.layers.length;
  const layer: PixelLayer = {
    id: uid(),
    name: LAYER_NAMES[layerIdx] || `Layer ${layerIdx + 1}`,
    visible: true,
    opacity: 1,
    data: createEmptyLayerData(canvas.width, canvas.height),
  };
  canvas.layers.push(layer);
  canvas.activeLayerId = layer.id;
  canvas.updatedAt = Date.now();
  return layer.id;
}

export function pxRemoveLayer(canvasId: string, layerId: string): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas || canvas.layers.length <= 1) return false;
  const idx = canvas.layers.findIndex(l => l.id === layerId);
  if (idx === -1) return false;
  canvas.layers.splice(idx, 1);
  if (canvas.activeLayerId === layerId) {
    canvas.activeLayerId = canvas.layers[Math.min(idx, canvas.layers.length - 1)].id;
  }
  canvas.updatedAt = Date.now();
  return true;
}

export function pxSetActiveLayer(canvasId: string, layerId: string): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;
  const layer = canvas.layers.find(l => l.id === layerId);
  if (!layer) return false;
  canvas.activeLayerId = layerId;
  return true;
}

export function pxToggleLayerVisibility(canvasId: string, layerId: string): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;
  const layer = canvas.layers.find(l => l.id === layerId);
  if (!layer) return false;
  layer.visible = !layer.visible;
  return layer.visible;
}

export function pxSetLayerOpacity(canvasId: string, layerId: string, opacity: number): boolean {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return false;
  const layer = canvas.layers.find(l => l.id === layerId);
  if (!layer) return false;
  layer.opacity = clamp(opacity, 0, 1);
  return true;
}

export function pxGetLayers(canvasId: string): { id: string; name: string; visible: boolean; opacity: number; isActive: boolean }[] {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return [];
  return canvas.layers.map(l => ({
    id: l.id,
    name: l.name,
    visible: l.visible,
    opacity: l.opacity,
    isActive: l.id === canvas.activeLayerId,
  }));
}

// =============================================================================
// EXPORTED FUNCTIONS — Color System
// =============================================================================

export function pxGetPalette(): PaletteCategory[] {
  const s = ensureInit();
  return s.palette;
}

export function pxSetPalette(categories: PaletteCategory[]): void {
  const s = ensureInit();
  s.palette = categories;
}

export function pxGetAllPaletteColors(): PixelRGBA[] {
  const s = ensureInit();
  const colors: PixelRGBA[] = [];
  for (const cat of s.palette) {
    for (const c of cat.colors) {
      colors.push(c);
    }
  }
  return colors;
}

export function pxGetRecentColors(): PixelRGBA[] {
  const s = ensureInit();
  return s.recentColors.map(c => cloneColor(c));
}

export function pxAddRecentColor(color: PixelRGBA): void {
  const s = ensureInit();
  // Remove duplicate if exists
  const idx = s.recentColors.findIndex(c => colorEquals(c, color));
  if (idx !== -1) s.recentColors.splice(idx, 1);
  s.recentColors.unshift(cloneColor(color));
  if (s.recentColors.length > MAX_RECENT_COLORS) {
    s.recentColors = s.recentColors.slice(0, MAX_RECENT_COLORS);
  }
}

export function pxGetCustomColors(): (PixelRGBA | null)[] {
  const s = ensureInit();
  return s.customColors.map(c => (c ? cloneColor(c) : null));
}

export function pxSetCustomColor(index: number, color: PixelRGBA): boolean {
  const s = ensureInit();
  if (index < 0 || index >= MAX_CUSTOM_COLORS) return false;
  s.customColors[index] = cloneColor(color);
  // Also add to Custom palette category
  const customCat = s.palette.find(c => c.name === "Custom");
  if (customCat) {
    const existing = customCat.colors.findIndex(c => colorEquals(c, color));
    if (existing === -1) {
      customCat.colors.push(cloneColor(color));
    }
  }
  return true;
}

export function pxPickColor(canvasId: string, x: number, y: number): PixelRGBA | null {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return null;
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return null;

  for (let i = canvas.layers.length - 1; i >= 0; i--) {
    const layer = canvas.layers[i];
    if (layer.visible && layer.data[y][x] !== null) {
      s.activeColor = cloneColor(layer.data[y][x]!);
      pxAddRecentColor(s.activeColor);
      return cloneColor(s.activeColor);
    }
  }
  return null;
}

export function pxSetActiveColor(color: PixelRGBA): void {
  const s = ensureInit();
  s.activeColor = cloneColor(color);
  pxAddRecentColor(color);
}

export function pxGetActiveColor(): PixelRGBA {
  const s = ensureInit();
  return cloneColor(s.activeColor);
}

export function pxExportPalette(): { categories: string[]; colors: PixelRGBA[][] } {
  const s = ensureInit();
  return {
    categories: s.palette.map(c => c.name),
    colors: s.palette.map(c => c.colors.map(col => cloneColor(col))),
  };
}

export function pxImportPalette(data: { categories: string[]; colors: PixelRGBA[][] }): boolean {
  const s = ensureInit();
  if (!data.categories || !data.colors) return false;
  if (data.categories.length !== data.colors.length) return false;

  s.palette = data.categories.map((name, i) => {
    const existing = s.palette.find(c => c.name === name);
    return {
      name,
      icon: existing?.icon ?? "🎨",
      colors: data.colors[i].map(c => cloneColor(c)),
    };
  });
  return true;
}

// =============================================================================
// EXPORTED FUNCTIONS — Gallery System
// =============================================================================

export function pxSaveToGallery(canvasId: string, name: string, tags: string[] = []): GalleryArtwork | null {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return null;
  if (s.gallery.length >= MAX_GALLERY) return null;

  const flat = flattenCanvas(canvas);
  const artwork: GalleryArtwork = {
    id: uid(),
    name: name || canvas.name,
    width: canvas.width,
    height: canvas.height,
    tags,
    likes: 0,
    liked: false,
    isFavorite: false,
    thumbnailData: flat,
    shareCode: encodeShareCode(flat),
    createdAt: Date.now(),
  };

  s.gallery.push(artwork);
  s.totalArtworksCreated++;
  s.artistXP += 15;
  s.studioCoins += 5;
  recalcLevel(s);
  checkAllAchievements(s);
  return artwork;
}

export function pxGetGallery(): GalleryArtwork[] {
  const s = ensureInit();
  return [...s.gallery];
}

export function pxGetArtwork(artworkId: string): GalleryArtwork | null {
  const s = ensureInit();
  return s.gallery.find(a => a.id === artworkId) ?? null;
}

export function pxDeleteArtwork(artworkId: string): boolean {
  const s = ensureInit();
  const idx = s.gallery.findIndex(a => a.id === artworkId);
  if (idx === -1) return false;
  s.gallery.splice(idx, 1);
  return true;
}

export function pxLikeArtwork(artworkId: string): boolean {
  const s = ensureInit();
  const artwork = s.gallery.find(a => a.id === artworkId);
  if (!artwork) return false;
  artwork.liked = !artwork.liked;
  artwork.likes += artwork.liked ? 1 : -1;
  checkAllAchievements(s);
  return true;
}

export function pxToggleFavorite(artworkId: string): boolean {
  const s = ensureInit();
  const artwork = s.gallery.find(a => a.id === artworkId);
  if (!artwork) return false;
  artwork.isFavorite = !artwork.isFavorite;
  return artwork.isFavorite;
}

export function pxGetFavorites(): GalleryArtwork[] {
  const s = ensureInit();
  return s.gallery.filter(a => a.isFavorite);
}

export function pxSearchGallery(query: string): GalleryArtwork[] {
  const s = ensureInit();
  const q = query.toLowerCase().trim();
  if (!q) return [...s.gallery];
  return s.gallery.filter(a =>
    a.name.toLowerCase().includes(q) ||
    a.tags.some(t => t.toLowerCase().includes(q)),
  );
}

export function pxFilterByTag(tag: string): GalleryArtwork[] {
  const s = ensureInit();
  const t = tag.toLowerCase().trim();
  if (!t) return [...s.gallery];
  return s.gallery.filter(a => a.tags.some(tag => tag.toLowerCase() === t));
}

export function pxGenerateShareCode(canvasId: string): string | null {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return null;

  if (!s.unlocks.find(u => u.id === "feature_share")?.unlocked) return null;

  const flat = flattenCanvas(canvas);
  return encodeShareCode(flat);
}

// =============================================================================
// EXPORTED FUNCTIONS — Animation System
// =============================================================================

export function pxCreateAnimation(name: string, size: CanvasSize = 16): PixelAnimation {
  const s = ensureInit();

  const anim: PixelAnimation = {
    id: uid(),
    name: name || "Untitled Animation",
    width: size,
    height: size,
    frames: [{
      id: uid(),
      index: 0,
      data: createEmptyLayerData(size, size),
    }],
    fps: 4,
    onionSkin: false,
    createdAt: Date.now(),
  };

  s.animations.push(anim);
  s.activeAnimationId = anim.id;
  s.totalAnimationsCreated++;
  s.artistXP += 25;
  s.studioCoins += 10;
  recalcLevel(s);
  checkAllAchievements(s);
  return anim;
}

export function pxGetAnimation(animId: string): PixelAnimation | null {
  const s = ensureInit();
  return s.animations.find(a => a.id === animId) ?? null;
}

export function pxGetActiveAnimation(): PixelAnimation | null {
  const s = ensureInit();
  if (!s.activeAnimationId) return null;
  return s.animations.find(a => a.id === s.activeAnimationId) ?? null;
}

export function pxGetAnimations(): PixelAnimation[] {
  const s = ensureInit();
  return [...s.animations];
}

export function pxAddFrame(animId: string): boolean {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return false;
  if (anim.frames.length >= MAX_ANIM_FRAMES) return false;

  const frame: AnimationFrame = {
    id: uid(),
    index: anim.frames.length,
    data: createEmptyLayerData(anim.width, anim.height),
  };
  anim.frames.push(frame);
  return true;
}

export function pxRemoveFrame(animId: string, frameId: string): boolean {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim || anim.frames.length <= MIN_ANIM_FRAMES) return false;
  const idx = anim.frames.findIndex(f => f.id === frameId);
  if (idx === -1) return false;
  anim.frames.splice(idx, 1);
  // Re-index
  anim.frames.forEach((f, i) => { f.index = i; });
  return true;
}

export function pxDuplicateFrame(animId: string, frameId: string): boolean {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim || anim.frames.length >= MAX_ANIM_FRAMES) return false;
  const frame = anim.frames.find(f => f.id === frameId);
  if (!frame) return false;

  const newFrame: AnimationFrame = {
    id: uid(),
    index: frame.index + 1,
    data: cloneLayerData(frame.data),
  };
  anim.frames.splice(frame.index + 1, 0, newFrame);
  anim.frames.forEach((f, i) => { f.index = i; });
  return true;
}

export function pxSetFrameData(animId: string, frameId: string, data: (PixelRGBA | null)[][]): boolean {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return false;
  const frame = anim.frames.find(f => f.id === frameId);
  if (!frame) return false;
  frame.data = cloneLayerData(data);
  return true;
}

export function pxSetFramePixel(animId: string, frameId: string, x: number, y: number, color: PixelRGBA | null): boolean {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return false;
  const frame = anim.frames.find(f => f.id === frameId);
  if (!frame) return false;
  if (x < 0 || x >= anim.width || y < 0 || y >= anim.height) return false;
  frame.data[y][x] = color ? cloneColor(color) : null;
  if (color) s.totalPixelsDrawn++;
  checkAllAchievements(s);
  return true;
}

export function pxGetFramePixel(animId: string, frameId: string, x: number, y: number): PixelRGBA | null {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return null;
  const frame = anim.frames.find(f => f.id === frameId);
  if (!frame) return null;
  if (x < 0 || x >= anim.width || y < 0 || y >= anim.height) return null;
  return frame.data[y][x] ? cloneColor(frame.data[y][x]!) : null;
}

export function pxReorderFrame(animId: string, frameId: string, newIndex: number): boolean {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return false;
  const oldIdx = anim.frames.findIndex(f => f.id === frameId);
  if (oldIdx === -1) return false;
  if (newIndex < 0 || newIndex >= anim.frames.length) return false;

  const [frame] = anim.frames.splice(oldIdx, 1);
  anim.frames.splice(newIndex, 0, frame);
  anim.frames.forEach((f, i) => { f.index = i; });
  return true;
}

export function pxSetPlaybackSpeed(animId: string, fps: number): boolean {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return false;
  anim.fps = clamp(fps, 1, 12);
  return true;
}

export function pxGetPlaybackSpeed(animId: string): number {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return 4;
  return anim.fps;
}

export function pxToggleOnionSkin(animId: string): boolean {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return false;
  if (!s.unlocks.find(u => u.id === "feature_onion")?.unlocked) return false;
  anim.onionSkin = !anim.onionSkin;
  return anim.onionSkin;
}

export function pxGetOnionSkinData(animId: string, frameId: string): (PixelRGBA | null)[][] | null {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim || !anim.onionSkin) return null;
  const idx = anim.frames.findIndex(f => f.id === frameId);
  if (idx <= 0) return null;
  // Return previous frame as ghost (semi-transparent)
  const prevData = anim.frames[idx - 1].data;
  return prevData.map(row => row.map(cell => (cell ? { ...cell, a: Math.floor(cell.a * 0.3) } : null)));
}

export function pxDeleteAnimation(animId: string): boolean {
  const s = ensureInit();
  const idx = s.animations.findIndex(a => a.id === animId);
  if (idx === -1) return false;
  s.animations.splice(idx, 1);
  if (s.activeAnimationId === animId) {
    s.activeAnimationId = s.animations.length > 0 ? s.animations[s.animations.length - 1].id : null;
  }
  return true;
}

export function pxSaveAnimationToGallery(animId: string, name: string): GalleryArtwork | null {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim || anim.frames.length === 0) return null;
  if (s.gallery.length >= MAX_GALLERY) return null;

  // Use first frame as thumbnail
  const thumbnail = cloneLayerData(anim.frames[0].data);
  const artwork: GalleryArtwork = {
    id: uid(),
    name: name || anim.name,
    width: anim.width,
    height: anim.height,
    tags: ["animation", `${anim.frames.length} frames`],
    likes: 0,
    liked: false,
    isFavorite: false,
    thumbnailData: thumbnail,
    shareCode: encodeShareCode(thumbnail),
    createdAt: Date.now(),
  };

  s.gallery.push(artwork);
  s.totalArtworksCreated++;
  s.artistXP += 30;
  s.studioCoins += 15;
  recalcLevel(s);
  checkAllAchievements(s);
  return artwork;
}

// =============================================================================
// EXPORTED FUNCTIONS — Progression System
// =============================================================================

export function pxGetArtistLevel(): number {
  const s = ensureInit();
  return s.artistLevel;
}

export function pxAddArtistXP(amount: number): { newLevel: number; leveledUp: boolean; xpGained: number } {
  const s = ensureInit();
  const oldLevel = s.artistLevel;
  s.artistXP += amount;
  recalcLevel(s);
  checkAllAchievements(s);
  return {
    newLevel: s.artistLevel,
    leveledUp: s.artistLevel > oldLevel,
    xpGained: amount,
  };
}

export function pxGetTitle(): { title: string; icon: string; level: number } {
  const s = ensureInit();
  let result = TITLE_TABLE[0];
  for (const t of TITLE_TABLE) {
    if (s.artistLevel >= t.minLevel) result = t;
    else break;
  }
  return { title: result.title, icon: result.icon, level: s.artistLevel };
}

export function pxGetTitleProgress(): { current: { title: string; icon: string }; next: { title: string; icon: string; levelRequired: number } | null; progress: number } {
  const s = ensureInit();
  let current = TITLE_TABLE[0];
  let next: typeof TITLE_TABLE[0] | null = null;

  for (let i = 0; i < TITLE_TABLE.length; i++) {
    if (s.artistLevel >= TITLE_TABLE[i].minLevel) {
      current = TITLE_TABLE[i];
      next = TITLE_TABLE[i + 1] ?? null;
    } else {
      next = TITLE_TABLE[i];
      break;
    }
  }

  const progress = next
    ? ((s.artistLevel - current.minLevel) / (next.minLevel - current.minLevel)) * 100
    : 100;

  return {
    current: { title: current.title, icon: current.icon },
    next: next ? { title: next.title, icon: next.icon, levelRequired: next.minLevel } : null,
    progress: Math.min(100, Math.round(progress)),
  };
}

export function pxGetStudioCoins(): number {
  const s = ensureInit();
  return s.studioCoins;
}

export function pxSpendCoins(amount: number): boolean {
  const s = ensureInit();
  if (s.studioCoins < amount) return false;
  s.studioCoins -= amount;
  return true;
}

export function pxEarnCoins(amount: number): number {
  const s = ensureInit();
  s.studioCoins += amount;
  return s.studioCoins;
}

export function pxGetUnlocks(): Unlockable[] {
  const s = ensureInit();
  return [...s.unlocks];
}

export function pxPurchaseUnlock(unlockId: string): boolean {
  const s = ensureInit();
  const unlock = s.unlocks.find(u => u.id === unlockId);
  if (!unlock || unlock.unlocked) return false;
  if (s.artistLevel < unlock.levelRequired) return false;
  if (unlock.coinCost > 0 && s.studioCoins < unlock.coinCost) return false;
  if (unlock.coinCost > 0) s.studioCoins -= unlock.coinCost;
  unlock.unlocked = true;
  return true;
}

export function pxGetXPProgress(): { currentXP: number; currentLevel: number; nextLevelXP: number; progressPercent: number } {
  const s = ensureInit();
  const currentLevelXP = LEVEL_XP_TABLE[s.artistLevel] ?? 0;
  const nextLevelXP = LEVEL_XP_TABLE[s.artistLevel + 1] ?? LEVEL_XP_TABLE[LEVEL_XP_TABLE.length - 1];
  const range = nextLevelXP - currentLevelXP;
  const earned = s.artistXP - currentLevelXP;
  const progressPercent = range > 0 ? Math.round((earned / range) * 100) : 100;

  return {
    currentXP: s.artistXP,
    currentLevel: s.artistLevel,
    nextLevelXP,
    progressPercent: Math.min(100, progressPercent),
  };
}

// =============================================================================
// EXPORTED FUNCTIONS — Daily & Challenge Systems
// =============================================================================

export function pxGetDailyChallenge(): DailyChallenge {
  const s = ensureInit();
  // Refresh if date changed
  const today = getTodayStr();
  if (s.dailyChallenge.date !== today) {
    const seed = dateSeed(today);
    const themeIdx = seed % DAILY_THEMES.length;
    const theme = DAILY_THEMES[themeIdx];
    s.dailyChallenge = {
      date: today,
      theme: theme.theme,
      description: theme.description,
      icon: theme.icon,
      completed: false,
      xpReward: 50,
      coinReward: 25,
    };
  }
  return { ...s.dailyChallenge };
}

export function pxCompleteDailyChallenge(): { xpGained: number; coinsGained: number; streak: number } {
  const s = ensureInit();
  refreshStreak(s);
  if (s.dailyChallenge.completed) {
    return { xpGained: 0, coinsGained: 0, streak: s.streak };
  }
  s.dailyChallenge.completed = true;
  s.artistXP += s.dailyChallenge.xpReward;
  s.studioCoins += s.dailyChallenge.coinReward;

  // Bonus for streak
  const streakBonus = Math.min(s.streak, 7) * 5;
  s.studioCoins += streakBonus;

  recalcLevel(s);
  checkAllAchievements(s);
  return {
    xpGained: s.dailyChallenge.xpReward,
    coinsGained: s.dailyChallenge.coinReward + streakBonus,
    streak: s.streak,
  };
}

export function pxGetWeeklyContest(): WeeklyContest {
  const s = ensureInit();
  const weekStart = getWeekStartStr();
  if (s.weeklyContest.weekStart !== weekStart) {
    const seed = dateSeed(weekStart);
    const idx = seed % WEEKLY_THEMES.length;
    const theme = WEEKLY_THEMES[idx];
    s.weeklyContest = {
      weekStart,
      theme: theme.theme,
      description: theme.description,
      icon: theme.icon,
      participated: false,
      xpReward: 200,
      coinReward: 100,
    };
  }
  return { ...s.weeklyContest };
}

export function pxParticipateWeeklyContest(): { xpGained: number; coinsGained: number } {
  const s = ensureInit();
  if (s.weeklyContest.participated) {
    return { xpGained: 0, coinsGained: 0 };
  }
  s.weeklyContest.participated = true;
  s.artistXP += s.weeklyContest.xpReward;
  s.studioCoins += s.weeklyContest.coinReward;
  recalcLevel(s);
  checkAllAchievements(s);
  return { xpGained: s.weeklyContest.xpReward, coinsGained: s.weeklyContest.coinReward };
}

export function pxGetStreak(): number {
  const s = ensureInit();
  refreshStreak(s);
  return s.streak;
}

// =============================================================================
// EXPORTED FUNCTIONS — Template System
// =============================================================================

export function pxGetTemplates(): TemplateDef[] {
  const s = ensureInit();
  return s.templates.map(t => ({
    ...t,
    data: cloneLayerData(t.data),
  }));
}

export function pxGetTemplate(templateId: string): TemplateDef | null {
  const s = ensureInit();
  const t = s.templates.find(t => t.id === templateId);
  if (!t) return null;
  return { ...t, data: cloneLayerData(t.data) };
}

export function pxGetTemplateCategories(): { name: string; icon: string; count: number }[] {
  const s = ensureInit();
  const cats = new Map<string, { icon: string; count: number }>();
  for (const t of s.templates) {
    const existing = cats.get(t.category);
    if (existing) {
      existing.count++;
    } else {
      cats.set(t.category, { icon: t.icon, count: 1 });
    }
  }
  return Array.from(cats.entries()).map(([name, v]) => ({ name, icon: v.icon, count: v.count }));
}

export function pxLoadTemplate(templateId: string, canvasName: string): PixelCanvas | null {
  const s = ensureInit();
  const template = s.templates.find(t => t.id === templateId);
  if (!template) return null;

  const canvas: PixelCanvas = {
    id: uid(),
    name: canvasName || template.name,
    width: template.size,
    height: template.size,
    layers: [{
      id: uid(),
      name: LAYER_NAMES[0],
      visible: true,
      opacity: 1,
      data: cloneLayerData(template.data),
    }],
    activeLayerId: "",
    gridVisible: true,
    zoom: 4,
    history: [],
    historyIndex: -1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  canvas.activeLayerId = canvas.layers[0].id;
  pushHistory(s, canvas);
  s.canvases.push(canvas);
  s.activeCanvasId = canvas.id;
  return canvas;
}

// =============================================================================
// EXPORTED FUNCTIONS — Achievement System
// =============================================================================

export function pxGetAchievements(): { id: string; name: string; description: string; icon: string; xpReward: number; coinReward: number; unlocked: boolean; unlockedAt: number | null }[] {
  const s = ensureInit();
  return s.achievements.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    xpReward: a.xpReward,
    coinReward: a.coinReward,
    unlocked: a.unlocked,
    unlockedAt: a.unlockedAt,
  }));
}

export function pxCheckAchievements(): { newlyUnlocked: string[] } {
  const s = ensureInit();
  const previouslyUnlocked = s.achievements.filter(a => a.unlocked).map(a => a.id);
  checkAllAchievements(s);
  const newlyUnlocked = s.achievements
    .filter(a => a.unlocked && !previouslyUnlocked.includes(a.id))
    .map(a => a.id);
  return { newlyUnlocked };
}

export function pxGetAchievementProgress(): { total: number; unlocked: number; percent: number } {
  const s = ensureInit();
  const total = s.achievements.length;
  const unlocked = s.achievements.filter(a => a.unlocked).length;
  return { total, unlocked, percent: Math.round((unlocked / total) * 100) };
}

// =============================================================================
// EXPORTED FUNCTIONS — UI Helpers
// =============================================================================

export function pxGetStudioOverview(): {
  title: { text: string; icon: string };
  level: number;
  xp: { current: number; next: number; percent: number };
  coins: number;
  streak: number;
  dailyTheme: string;
  dailyIcon: string;
  dailyCompleted: boolean;
  galleryCount: number;
  animationCount: number;
  canvasCount: number;
} {
  const s = ensureInit();
  const title = pxGetTitle();
  const xpProgress = pxGetXPProgress();
  const daily = pxGetDailyChallenge();
  return {
    title: { text: title.title, icon: title.icon },
    level: s.artistLevel,
    xp: { current: s.artistXP, next: xpProgress.nextLevelXP, percent: xpProgress.progressPercent },
    coins: s.studioCoins,
    streak: s.streak,
    dailyTheme: daily.theme,
    dailyIcon: daily.icon,
    dailyCompleted: daily.completed,
    galleryCount: s.gallery.length,
    animationCount: s.animations.length,
    canvasCount: s.canvases.length,
  };
}

export function pxGetStatsGrid(): { cells: { label: string; value: string | number; icon: string; color: string }[] } {
  const s = ensureInit();
  const title = pxGetTitle();
  return {
    cells: [
      { label: "Level", value: s.artistLevel, icon: title.icon, color: "#6C5CE7" },
      { label: "Artworks", value: s.gallery.length, icon: "🖼️", color: "#00B894" },
      { label: "Animations", value: s.animations.length, icon: "🎬", color: "#E17055" },
      { label: "Coins", value: s.studioCoins, icon: "🪙", color: "#FDCB6E" },
    ],
  };
}

export function pxGetCanvasCard(canvasId: string): {
  id: string;
  name: string;
  size: string;
  layers: number;
  zoom: number;
  gridVisible: boolean;
  activeTool: string;
  updatedAt: number;
} | null {
  const s = ensureInit();
  const canvas = s.canvases.find(c => c.id === canvasId);
  if (!canvas) return null;
  const toolDef = TOOLS.find(t => t.id === s.activeTool);
  return {
    id: canvas.id,
    name: canvas.name,
    size: `${canvas.width}×${canvas.height}`,
    layers: canvas.layers.length,
    zoom: canvas.zoom,
    gridVisible: canvas.gridVisible,
    activeTool: toolDef?.icon ?? "✏️",
    updatedAt: canvas.updatedAt,
  };
}

export function pxGetArtworkCard(artworkId: string): {
  id: string;
  name: string;
  size: string;
  tags: string[];
  likes: number;
  liked: boolean;
  isFavorite: boolean;
  date: number;
  thumbnail: (PixelRGBA | null)[][];
} | null {
  const s = ensureInit();
  const artwork = s.gallery.find(a => a.id === artworkId);
  if (!artwork) return null;
  return {
    id: artwork.id,
    name: artwork.name,
    size: `${artwork.width}×${artwork.height}`,
    tags: artwork.tags,
    likes: artwork.likes,
    liked: artwork.liked,
    isFavorite: artwork.isFavorite,
    date: artwork.createdAt,
    thumbnail: cloneLayerData(artwork.thumbnailData),
  };
}

export function pxGetAnimationCard(animId: string): {
  id: string;
  name: string;
  size: string;
  frameCount: number;
  fps: number;
  onionSkin: boolean;
  createdAt: number;
} | null {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return null;
  return {
    id: anim.id,
    name: anim.name,
    size: `${anim.width}×${anim.height}`,
    frameCount: anim.frames.length,
    fps: anim.fps,
    onionSkin: anim.onionSkin,
    createdAt: anim.createdAt,
  };
}

export function pxGetDailyCard(): {
  theme: string;
  description: string;
  icon: string;
  completed: boolean;
  streak: number;
  reward: { xp: number; coins: number };
  streakBonus: number;
} {
  const s = ensureInit();
  refreshStreak(s);
  const daily = pxGetDailyChallenge();
  return {
    theme: daily.theme,
    description: daily.description,
    icon: daily.icon,
    completed: daily.completed,
    streak: s.streak,
    reward: { xp: daily.xpReward, coins: daily.coinReward },
    streakBonus: Math.min(s.streak, 7) * 5,
  };
}

export function pxGetGalleryGrid(): {
  artworks: {
    id: string;
    name: string;
    thumbnail: (PixelRGBA | null)[][];
    liked: boolean;
    isFavorite: boolean;
    tags: string[];
  }[];
  totalCount: number;
  maxCount: number;
} {
  const s = ensureInit();
  return {
    artworks: s.gallery.map(a => ({
      id: a.id,
      name: a.name,
      thumbnail: cloneLayerData(a.thumbnailData),
      liked: a.liked,
      isFavorite: a.isFavorite,
      tags: a.tags,
    })),
    totalCount: s.gallery.length,
    maxCount: MAX_GALLERY,
  };
}

export function pxGetToolGrid(): {
  tools: {
    id: ToolType;
    label: string;
    icon: string;
    shortcut: string;
    active: boolean;
    locked: boolean;
    unlockLevel: number;
  }[];
} {
  const s = ensureInit();
  return {
    tools: TOOLS.map(t => ({
      id: t.id,
      label: t.label,
      icon: t.icon,
      shortcut: t.shortcut,
      active: s.activeTool === t.id,
      locked: t.unlockLevel > s.artistLevel,
      unlockLevel: t.unlockLevel,
    })),
  };
}

export function pxGetPaletteGrid(): {
  categories: {
    name: string;
    icon: string;
    colors: { r: number; g: number; b: number; a: number; isActive: boolean }[];
  }[];
  recentColors: PixelRGBA[];
  customColors: (PixelRGBA | null)[];
  activeColor: PixelRGBA;
} {
  const s = ensureInit();
  return {
    categories: s.palette.map(cat => ({
      name: cat.name,
      icon: cat.icon,
      colors: cat.colors.map(c => ({
        r: c.r,
        g: c.g,
        b: c.b,
        a: c.a,
        isActive: colorEquals(c, s.activeColor),
      })),
    })),
    recentColors: s.recentColors.map(c => cloneColor(c)),
    customColors: s.customColors.map(c => (c ? cloneColor(c) : null)),
    activeColor: cloneColor(s.activeColor),
  };
}

export function pxGetCanvasSizeOptions(): {
  sizes: { value: CanvasSize; label: string; locked: boolean; icon: string }[];
  current: CanvasSize | null;
} {
  const s = ensureInit();
  const canvas = s.activeCanvasId ? s.canvases.find(c => c.id === s.activeCanvasId) : null;

  return {
    sizes: CANVAS_SIZES.map(size => ({
      value: size,
      label: `${size}×${size}`,
      locked: (size === 24 && !s.unlocks.find(u => u.id === "canvas_24")?.unlocked) ||
              (size === 32 && !s.unlocks.find(u => u.id === "canvas_32")?.unlocked),
      icon: size === 16 ? "📐" : size === 24 ? "📏" : "🗺️",
    })),
    current: canvas?.width ?? null,
  };
}

export function pxGetWeeklyCard(): {
  theme: string;
  description: string;
  icon: string;
  participated: boolean;
  reward: { xp: number; coins: number };
  daysRemaining: number;
} {
  const s = ensureInit();
  const contest = pxGetWeeklyContest();
  const weekStart = new Date(contest.weekStart);
  const now = new Date();
  const daysRemaining = Math.max(0, 7 - Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    theme: contest.theme,
    description: contest.description,
    icon: contest.icon,
    participated: contest.participated,
    reward: { xp: contest.xpReward, coins: contest.coinReward },
    daysRemaining,
  };
}

export function pxGetAllCanvasCards(): {
  cards: { id: string; name: string; size: string; layers: number; updatedAt: number }[];
} {
  const s = ensureInit();
  return {
    cards: s.canvases.map(c => ({
      id: c.id,
      name: c.name,
      size: `${c.width}×${c.height}`,
      layers: c.layers.length,
      updatedAt: c.updatedAt,
    })),
  };
}

export function pxGetAllAnimationCards(): {
  cards: { id: string; name: string; frameCount: number; fps: number; createdAt: number }[];
} {
  const s = ensureInit();
  return {
    cards: s.animations.map(a => ({
      id: a.id,
      name: a.name,
      frameCount: a.frames.length,
      fps: a.fps,
      createdAt: a.createdAt,
    })),
  };
}

export function pxGetTemplateGrid(): {
  categories: { name: string; icon: string; templates: { id: string; name: string; icon: string; size: CanvasSize }[] }[];
} {
  const s = ensureInit();
  const catMap = new Map<string, { icon: string; templates: { id: string; name: string; icon: string; size: CanvasSize }[] }>();

  for (const t of s.templates) {
    const existing = catMap.get(t.category);
    if (existing) {
      existing.templates.push({ id: t.id, name: t.name, icon: t.icon, size: t.size });
    } else {
      catMap.set(t.category, {
        icon: t.icon,
        templates: [{ id: t.id, name: t.name, icon: t.icon, size: t.size }],
      });
    }
  }

  return {
    categories: Array.from(catMap.entries()).map(([name, v]) => ({ name, icon: v.icon, templates: v.templates })),
  };
}

export function pxGetUnlockGrid(): {
  items: { id: string; name: string; description: string; icon: string; type: string; locked: boolean; levelRequired: number; coinCost: number }[];
} {
  const s = ensureInit();
  return {
    items: s.unlocks.map(u => ({
      id: u.id,
      name: u.name,
      description: u.description,
      icon: u.icon,
      type: u.type,
      locked: !u.unlocked,
      levelRequired: u.levelRequired,
      coinCost: u.coinCost,
    })),
  };
}

export function pxGetFrameData(animId: string, frameId: string): (PixelRGBA | null)[][] | null {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return null;
  const frame = anim.frames.find(f => f.id === frameId);
  if (!frame) return null;
  return cloneLayerData(frame.data);
}

export function pxGetFrameList(animId: string): { id: string; index: number }[] {
  const s = ensureInit();
  const anim = s.animations.find(a => a.id === animId);
  if (!anim) return [];
  return anim.frames.map(f => ({ id: f.id, index: f.index }));
}
