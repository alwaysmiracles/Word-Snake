import { useState } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PX_STORAGE_KEY = 'pixel-forge-save';

// ---------------------------------------------------------------------------
// Type aliases
// ---------------------------------------------------------------------------

export type PaletteId =
  | 'monochrome'
  | 'cga'
  | 'nes'
  | 'gameboy'
  | 'pastel'
  | 'neon'
  | 'earth-tone'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'candy'
  | 'dark';

export type ToolId =
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'fill'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'spray'
  | 'eyedropper'
  | 'mirror'
  | 'stamp'
  | 'gradient'
  | 'smudge'
  | 'select'
  | 'text';

export type CanvasSizeId =
  | '8x8'
  | '16x16'
  | '32x32'
  | '48x48'
  | '64x64'
  | '96x96'
  | '128x128'
  | 'custom';

export type AnimationTypeId =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'attack'
  | 'hurt'
  | 'die'
  | 'celebrate'
  | 'emote'
  | 'custom';

export type ChallengeId =
  | 'recreate-classic'
  | 'speed-art'
  | 'theme-art'
  | 'pixel-by-numbers'
  | 'color-blind'
  | 'mirror-image'
  | 'tiny-canvas'
  | 'palette-restrict'
  | 'spriter'
  | 'landscape'
  | 'portrait'
  | 'abstract'
  | 'icon-design'
  | 'tile-sheet'
  | 'animation'
  | 'shading'
  | 'dithering'
  | 'silhouette'
  | 'minimalist'
  | 'masterpiece';

export type AchievementId =
  | 'first-pixel'
  | 'palette-master'
  | 'speed-demon'
  | 'gallery-owner'
  | 'challenge-king'
  | 'ten-canvas'
  | 'fifty-canvas'
  | 'first-sale'
  | 'rich-artist'
  | 'streak-7'
  | 'streak-30'
  | 'all-tools'
  | 'grandmaster'
  | 'perfect-score'
  | 'collector';

export type ArtistClassId =
  | 'pixel-novice'
  | 'pixel-apprentice'
  | 'pixel-artisan'
  | 'pixel-adept'
  | 'pixel-expert'
  | 'pixel-virtuoso'
  | 'pixel-master'
  | 'pixel-legend'
  | 'pixel-sage'
  | 'pixel-grandmaster';

export type ResourceId = 'pixels' | 'colorPigments' | 'frames' | 'blueprints' | 'inspiration';

export type SymmetryMode = 'none' | 'horizontal' | 'vertical' | 'quad';

// ---------------------------------------------------------------------------
// Static data types
// ---------------------------------------------------------------------------

export interface ArtistClass {
  id: ArtistClassId;
  name: string;
  stats: {
    creativity: number;
    speed: number;
    precision: number;
    colorTheory: number;
    imagination: number;
  };
  bonuses: string[];
  description: string;
  unlockLevel: number;
}

export interface CanvasSize {
  id: CanvasSizeId;
  width: number;
  height: number;
  name: string;
  unlockLevel: number;
}

export interface PaletteColor {
  hex: string;
  name: string;
}

export interface Palette {
  id: PaletteId;
  name: string;
  colors: PaletteColor[];
  unlockLevel: number;
}

export interface DrawingTool {
  id: ToolId;
  name: string;
  description: string;
  unlockLevel: number;
  icon: string;
  defaultSize: number;
}

export interface AnimationType {
  id: AnimationTypeId;
  name: string;
  description: string;
  defaultFrames: number;
}

export interface PixelChallenge {
  id: ChallengeId;
  name: string;
  description: string;
  timeLimit: number; // seconds, 0 = no limit
  canvasSize: CanvasSizeId;
  paletteId: PaletteId | 'any';
  maxScore: number;
  xpReward: number;
  resourceReward: Partial<Record<ResourceId, number>>;
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
}

export interface GallerySlot {
  id: number;
  name: string;
  pixelData: string | null; // base64 or JSON string
  canvasSize: CanvasSizeId;
  paletteId: PaletteId;
  createdAt: number;
  likes: number;
  views: number;
}

export interface MarketplaceCustomer {
  id: number;
  name: string;
  avatar: string;
  budget: number;
  preferredStyles: PaletteId[];
  patience: number; // 1-10
}

export interface Template {
  id: number;
  name: string;
  category: string;
  description: string;
  canvasSize: CanvasSizeId;
  paletteId: PaletteId;
  thumbnail: string;
  unlockLevel: number;
}

export interface MarketplaceListing {
  id: string;
  gallerySlotId: number;
  price: number;
  listedAt: number;
  views: number;
}

// ---------------------------------------------------------------------------
// Artist class data (10 classes)
// ---------------------------------------------------------------------------

export const PX_ARTIST_CLASSES: ArtistClass[] = [
  {
    id: 'pixel-novice',
    name: 'Pixel Novice',
    stats: { creativity: 2, speed: 1, precision: 1, colorTheory: 1, imagination: 2 },
    bonuses: ['+5% XP gain'],
    description: 'Every artist starts here. The journey of a thousand pixels begins with a single dot.',
    unlockLevel: 1,
  },
  {
    id: 'pixel-apprentice',
    name: 'Pixel Apprentice',
    stats: { creativity: 4, speed: 2, precision: 2, colorTheory: 2, imagination: 3 },
    bonuses: ['+10% XP gain', 'Unlock Brush tool'],
    description: 'Learning the fundamentals of pixel art. Basic shapes and colors are becoming familiar.',
    unlockLevel: 3,
  },
  {
    id: 'pixel-artisan',
    name: 'Pixel Artisan',
    stats: { creativity: 6, speed: 4, precision: 3, colorTheory: 4, imagination: 5 },
    bonuses: ['+15% XP gain', 'Unlock Fill tool', '+5% challenge score bonus'],
    description: 'Crafting pixel art with growing confidence. Each piece tells a small story.',
    unlockLevel: 6,
  },
  {
    id: 'pixel-adept',
    name: 'Pixel Adept',
    stats: { creativity: 8, speed: 5, precision: 5, colorTheory: 6, imagination: 7 },
    bonuses: ['+20% XP gain', 'Unlock Mirror tool', '+10% challenge score bonus'],
    description: 'Mastery of basic techniques. Colors blend and shapes form with purpose.',
    unlockLevel: 10,
  },
  {
    id: 'pixel-expert',
    name: 'Pixel Expert',
    stats: { creativity: 12, speed: 7, precision: 8, colorTheory: 9, imagination: 10 },
    bonuses: ['+25% XP gain', 'Unlock Gradient tool', '+15% challenge score bonus', 'Gallery slot +5'],
    description: 'A true pixel artist. Your work is recognized and admired by peers.',
    unlockLevel: 15,
  },
  {
    id: 'pixel-virtuoso',
    name: 'Pixel Virtuoso',
    stats: { creativity: 16, speed: 10, precision: 12, colorTheory: 14, imagination: 13 },
    bonuses: ['+30% XP gain', 'Unlock Stamp tool', '+20% challenge score bonus', 'Resource generation +10%'],
    description: 'Your pixel art transcends the medium. Each creation is a miniature masterpiece.',
    unlockLevel: 21,
  },
  {
    id: 'pixel-master',
    name: 'Pixel Master',
    stats: { creativity: 20, speed: 13, precision: 16, colorTheory: 18, imagination: 17 },
    bonuses: ['+40% XP gain', 'Unlock Smudge tool', '+25% challenge score bonus', 'Resource generation +20%'],
    description: 'A master of the pixel craft. Your techniques inspire others to learn.',
    unlockLevel: 28,
  },
  {
    id: 'pixel-legend',
    name: 'Pixel Legend',
    stats: { creativity: 26, speed: 17, precision: 20, colorTheory: 24, imagination: 22 },
    bonuses: ['+50% XP gain', '+30% challenge score bonus', 'Resource generation +30%', 'Marketplace fees -20%'],
    description: 'Your legend grows. Collectors seek your work and galleries compete for exhibitions.',
    unlockLevel: 36,
  },
  {
    id: 'pixel-sage',
    name: 'Pixel Sage',
    stats: { creativity: 33, speed: 22, precision: 26, colorTheory: 30, imagination: 28 },
    bonuses: ['+60% XP gain', '+35% challenge score bonus', 'Resource generation +40%', 'Marketplace fees -30%'],
    description: 'Wisdom of pixels flows through you. You see art where others see only grids.',
    unlockLevel: 44,
  },
  {
    id: 'pixel-grandmaster',
    name: 'Pixel Grandmaster',
    stats: { creativity: 42, speed: 28, precision: 33, colorTheory: 38, imagination: 35 },
    bonuses: [
      '+75% XP gain',
      '+40% challenge score bonus',
      'Resource generation +50%',
      'Marketplace fees -50%',
      'All tools unlocked',
    ],
    description: 'The pinnacle of pixel artistry. Your creations define genres and inspire generations.',
    unlockLevel: 50,
  },
];

// ---------------------------------------------------------------------------
// Canvas sizes (8)
// ---------------------------------------------------------------------------

export const PX_CANVAS_SIZES: CanvasSize[] = [
  { id: '8x8', width: 8, height: 8, name: 'Tiny 8×8', unlockLevel: 1 },
  { id: '16x16', width: 16, height: 16, name: 'Classic 16×16', unlockLevel: 1 },
  { id: '32x32', width: 32, height: 32, name: 'Standard 32×32', unlockLevel: 3 },
  { id: '48x48', width: 48, height: 48, name: 'Medium 48×48', unlockLevel: 8 },
  { id: '64x64', width: 64, height: 64, name: 'Large 64×64', unlockLevel: 14 },
  { id: '96x96', width: 96, height: 96, name: 'XL 96×96', unlockLevel: 22 },
  { id: '128x128', width: 128, height: 128, name: 'Huge 128×128', unlockLevel: 32 },
  { id: 'custom', width: 0, height: 0, name: 'Custom Size', unlockLevel: 10 },
];

// ---------------------------------------------------------------------------
// Palettes (12 × 16 colors each)
// ---------------------------------------------------------------------------

export const PX_PALETTES: Palette[] = [
  {
    id: 'monochrome',
    name: 'Monochrome',
    unlockLevel: 1,
    colors: [
      { hex: '#000000', name: 'Black' },
      { hex: '#1a1a1a', name: 'Dark 1' },
      { hex: '#333333', name: 'Dark 2' },
      { hex: '#4d4d4d', name: 'Dark 3' },
      { hex: '#666666', name: 'Gray 1' },
      { hex: '#808080', name: 'Gray 2' },
      { hex: '#999999', name: 'Gray 3' },
      { hex: '#b3b3b3', name: 'Light 1' },
      { hex: '#cccccc', name: 'Light 2' },
      { hex: '#d9d9d9', name: 'Light 3' },
      { hex: '#e6e6e6', name: 'Light 4' },
      { hex: '#f0f0f0', name: 'Light 5' },
      { hex: '#f5f5f5', name: 'Light 6' },
      { hex: '#fafafa', name: 'Light 7' },
      { hex: '#ffffff', name: 'White' },
      { hex: '#888888', name: 'Mid Gray' },
    ],
  },
  {
    id: 'cga',
    name: 'CGA',
    unlockLevel: 1,
    colors: [
      { hex: '#000000', name: 'Black' },
      { hex: '#0000aa', name: 'Blue' },
      { hex: '#00aa00', name: 'Green' },
      { hex: '#00aaaa', name: 'Cyan' },
      { hex: '#aa0000', name: 'Red' },
      { hex: '#aa00aa', name: 'Magenta' },
      { hex: '#aa5500', name: 'Brown' },
      { hex: '#aaaaaa', name: 'Light Gray' },
      { hex: '#555555', name: 'Dark Gray' },
      { hex: '#5555ff', name: 'Bright Blue' },
      { hex: '#55ff55', name: 'Bright Green' },
      { hex: '#55ffff', name: 'Bright Cyan' },
      { hex: '#ff5555', name: 'Bright Red' },
      { hex: '#ff55ff', name: 'Bright Magenta' },
      { hex: '#ffff55', name: 'Yellow' },
      { hex: '#ffffff', name: 'White' },
    ],
  },
  {
    id: 'nes',
    name: 'NES',
    unlockLevel: 2,
    colors: [
      { hex: '#000000', name: 'Black' },
      { hex: '#fcfcfc', name: 'White' },
      { hex: '#f83800', name: 'Red' },
      { hex: '#e45c10', name: 'Orange' },
      { hex: '#ac7c00', name: 'Dark Yellow' },
      { hex: '#00b800', name: 'Green' },
      { hex: '#007800', name: 'Dark Green' },
      { hex: '#0058f8', name: 'Blue' },
      { hex: '#0000fc', name: 'Dark Blue' },
      { hex: '#6844fc', name: 'Purple' },
      { hex: '#f878f8', name: 'Pink' },
      { hex: '#00b8b8', name: 'Cyan' },
      { hex: '#b8f818', name: 'Lime' },
      { hex: '#f8b800', name: 'Yellow' },
      { hex: '#a40000', name: 'Dark Red' },
      { hex: '#503000', name: 'Brown' },
    ],
  },
  {
    id: 'gameboy',
    name: 'Game Boy',
    unlockLevel: 2,
    colors: [
      { hex: '#0f380f', name: 'Darkest' },
      { hex: '#306230', name: 'Dark' },
      { hex: '#8bac0f', name: 'Light' },
      { hex: '#9bbc0f', name: 'Lightest' },
      { hex: '#1b4d1b', name: 'Dark 2' },
      { hex: '#255225', name: 'Dark 3' },
      { hex: '#3d7d3d', name: 'Mid Dark' },
      { hex: '#4a8c4a', name: 'Mid' },
      { hex: '#5c9e5c', name: 'Mid Light' },
      { hex: '#6dae6d', name: 'Light 2' },
      { hex: '#7ebe7e', name: 'Light 3' },
      { hex: '#0d320d', name: 'Extra Dark 1' },
      { hex: '#163f16', name: 'Extra Dark 2' },
      { hex: '#1f4c1f', name: 'Extra Dark 3' },
      { hex: '#a4c8a4', name: 'Pale' },
      { hex: '#b8d8b8', name: 'Palest' },
    ],
  },
  {
    id: 'pastel',
    name: 'Pastel',
    unlockLevel: 4,
    colors: [
      { hex: '#ffadad', name: 'Pastel Red' },
      { hex: '#ffd6a5', name: 'Pastel Orange' },
      { hex: '#fdffb6', name: 'Pastel Yellow' },
      { hex: '#caffbf', name: 'Pastel Green' },
      { hex: '#9bf6ff', name: 'Pastel Cyan' },
      { hex: '#a0c4ff', name: 'Pastel Blue' },
      { hex: '#bdb2ff', name: 'Pastel Purple' },
      { hex: '#ffc6ff', name: 'Pastel Pink' },
      { hex: '#fffffc', name: 'Near White' },
      { hex: '#f0f0f0', name: 'Light Gray' },
      { hex: '#e8d5e0', name: 'Dusty Rose' },
      { hex: '#d5e8d4', name: 'Dusty Green' },
      { hex: '#d4e8e8', name: 'Dusty Cyan' },
      { hex: '#d5d4e8', name: 'Dusty Lavender' },
      { hex: '#e8e4d4', name: 'Dusty Yellow' },
      { hex: '#f5f0e8', name: 'Cream' },
    ],
  },
  {
    id: 'neon',
    name: 'Neon',
    unlockLevel: 6,
    colors: [
      { hex: '#ff0080', name: 'Neon Pink' },
      { hex: '#ff00ff', name: 'Neon Magenta' },
      { hex: '#8000ff', name: 'Neon Purple' },
      { hex: '#0000ff', name: 'Neon Blue' },
      { hex: '#0080ff', name: 'Electric Blue' },
      { hex: '#00ffff', name: 'Neon Cyan' },
      { hex: '#00ff80', name: 'Neon Green' },
      { hex: '#00ff00', name: 'Lime Neon' },
      { hex: '#80ff00', name: 'Yellow Green' },
      { hex: '#ffff00', name: 'Neon Yellow' },
      { hex: '#ff8000', name: 'Neon Orange' },
      { hex: '#ff0000', name: 'Neon Red' },
      { hex: '#ffffff', name: 'White' },
      { hex: '#0a0a0a', name: 'Deep Black' },
      { hex: '#333333', name: 'Dark Gray' },
      { hex: '#1a0a2e', name: 'Dark Purple' },
    ],
  },
  {
    id: 'earth-tone',
    name: 'Earth Tone',
    unlockLevel: 8,
    colors: [
      { hex: '#2b1d0e', name: 'Dark Brown' },
      { hex: '#4a3222', name: 'Brown' },
      { hex: '#6b4423', name: 'Medium Brown' },
      { hex: '#8b6d3f', name: 'Tan' },
      { hex: '#a0845c', name: 'Sand' },
      { hex: '#c4a265', name: 'Wheat' },
      { hex: '#d4b896', name: 'Khaki' },
      { hex: '#e6d5b8', name: 'Cream' },
      { hex: '#3d5c3a', name: 'Forest Green' },
      { hex: '#5a7247', name: 'Olive' },
      { hex: '#7d8c5a', name: 'Sage' },
      { hex: '#9aa87c', name: 'Light Sage' },
      { hex: '#8c4a2f', name: 'Rust' },
      { hex: '#b5651d', name: 'Russet' },
      { hex: '#c9a959', name: 'Gold Brown' },
      { hex: '#f5efe6', name: 'Linen' },
    ],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    unlockLevel: 10,
    colors: [
      { hex: '#1a0533', name: 'Night Sky' },
      { hex: '#2d1b69', name: 'Deep Purple' },
      { hex: '#5b2c6f', name: 'Purple' },
      { hex: '#8e44ad', name: 'Violet' },
      { hex: '#c0392b', name: 'Crimson' },
      { hex: '#e74c3c', name: 'Red' },
      { hex: '#f39c12', name: 'Orange' },
      { hex: '#f1c40f', name: 'Yellow' },
      { hex: '#ff6348', name: 'Coral' },
      { hex: '#ff7979', name: 'Salmon' },
      { hex: '#ffbe76', name: 'Peach' },
      { hex: '#ffeaa7', name: 'Pale Yellow' },
      { hex: '#dfe6e9', name: 'Cloud' },
      { hex: '#0c2461', name: 'Twilight' },
      { hex: '#6c5ce7', name: 'Indigo' },
      { hex: '#fd79a8', name: 'Hot Pink' },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    unlockLevel: 12,
    colors: [
      { hex: '#0c2461', name: 'Deep Ocean' },
      { hex: '#1e3799', name: 'Navy' },
      { hex: '#0a3d62', name: 'Dark Teal' },
      { hex: '#3c6382', name: 'Steel Blue' },
      { hex: '#60a3bc', name: 'Sky Blue' },
      { hex: '#82ccdd', name: 'Light Blue' },
      { hex: '#b8e994', name: 'Seafoam' },
      { hex: '#78e08f', name: 'Aquamarine' },
      { hex: '#38ada9', name: 'Teal' },
      { hex: '#079992', name: 'Dark Cyan' },
      { hex: '#c7ecee', name: 'Ice Blue' },
      { hex: '#dff9fb', name: 'Pale Aqua' },
      { hex: '#ebf5fb', name: 'Frosted' },
      { hex: '#1b4f72', name: 'Ocean Floor' },
      { hex: '#2e86c1', name: 'Royal Blue' },
      { hex: '#85c1e9', name: 'Bay Blue' },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    unlockLevel: 16,
    colors: [
      { hex: '#0b3d0b', name: 'Deep Forest' },
      { hex: '#145214', name: 'Dark Green' },
      { hex: '#1e7a1e', name: 'Forest' },
      { hex: '#27ae27', name: 'Green' },
      { hex: '#2ecc71', name: 'Emerald' },
      { hex: '#82e0aa', name: 'Light Green' },
      { hex: '#abebc6', name: 'Mint' },
      { hex: '#f9e79f', name: 'Sunlight' },
      { hex: '#5d4e37', name: 'Bark' },
      { hex: '#8b7355', name: 'Wood' },
      { hex: '#a0522d', name: 'Sienna' },
      { hex: '#d2b48c', name: 'Tan' },
      { hex: '#f5deb3', name: 'Wheat' },
      { hex: '#4a235a', name: 'Moss Purple' },
      { hex: '#1a5276', name: 'Pond Blue' },
      { hex: '#f0f0e0', name: 'Lichen' },
    ],
  },
  {
    id: 'candy',
    name: 'Candy',
    unlockLevel: 20,
    colors: [
      { hex: '#ff69b4', name: 'Hot Pink' },
      { hex: '#ff1493', name: 'Deep Pink' },
      { hex: '#da70d6', name: 'Orchid' },
      { hex: '#ba55d3', name: 'Orchid Dark' },
      { hex: '#ff6eb4', name: 'Hot Pink 2' },
      { hex: '#ffb6c1', name: 'Light Pink' },
      { hex: '#ffc0cb', name: 'Pink' },
      { hex: '#fff0f5', name: 'Lavender Blush' },
      { hex: '#dda0dd', name: 'Plum' },
      { hex: '#ee82ee', name: 'Violet' },
      { hex: '#ff82ab', name: 'Pink 2' },
      { hex: '#ff34b3', name: 'Fuchsia' },
      { hex: '#f08080', name: 'Light Coral' },
      { hex: '#cd5c5c', name: 'Indian Red' },
      { hex: '#fff5ee', name: 'Seashell' },
      { hex: '#ffe4e1', name: 'Misty Rose' },
    ],
  },
  {
    id: 'dark',
    name: 'Dark',
    unlockLevel: 25,
    colors: [
      { hex: '#0a0a0a', name: 'Abyss' },
      { hex: '#141414', name: 'Void' },
      { hex: '#1e1e1e', name: 'Charcoal' },
      { hex: '#282828', name: 'Smoke' },
      { hex: '#323232', name: 'Ash' },
      { hex: '#3c3c3c', name: 'Shadow' },
      { hex: '#4a4a4a', name: 'Graphite' },
      { hex: '#585858', name: 'Slate' },
      { hex: '#6b0000', name: 'Blood Red' },
      { hex: '#6b3a00', name: 'Ember' },
      { hex: '#6b6b00', name: 'Disease' },
      { hex: '#006b6b', name: 'Deep Teal' },
      { hex: '#1a0033', name: 'Midnight' },
      { hex: '#330033', name: 'Deep Purple' },
      { hex: '#003300', name: 'Deep Green' },
      { hex: '#555555', name: 'Gunmetal' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Drawing tools (15)
// ---------------------------------------------------------------------------

export const PX_DRAWING_TOOLS: DrawingTool[] = [
  { id: 'pencil', name: 'Pencil', description: 'Draw single pixels with precision.', unlockLevel: 1, icon: '✏️', defaultSize: 1 },
  { id: 'brush', name: 'Brush', description: 'Paint with variable brush size.', unlockLevel: 3, icon: '🖌️', defaultSize: 2 },
  { id: 'eraser', name: 'Eraser', description: 'Remove pixels from the canvas.', unlockLevel: 1, icon: '🧹', defaultSize: 1 },
  { id: 'fill', name: 'Fill', description: 'Flood-fill a connected area with color.', unlockLevel: 6, icon: '🪣', defaultSize: 1 },
  { id: 'line', name: 'Line', description: 'Draw straight lines between two points.', unlockLevel: 5, icon: '📏', defaultSize: 1 },
  { id: 'rectangle', name: 'Rectangle', description: 'Draw rectangular outlines or filled shapes.', unlockLevel: 5, icon: '⬜', defaultSize: 1 },
  { id: 'circle', name: 'Circle', description: 'Draw circular outlines or filled circles.', unlockLevel: 7, icon: '⭕', defaultSize: 1 },
  { id: 'spray', name: 'Spray', description: 'Spray random pixels in an area.', unlockLevel: 8, icon: '💨', defaultSize: 3 },
  { id: 'eyedropper', name: 'Eyedropper', description: 'Pick a color from the canvas.', unlockLevel: 1, icon: '💉', defaultSize: 1 },
  { id: 'mirror', name: 'Mirror', description: 'Draw with symmetry across axes.', unlockLevel: 10, icon: '🪞', defaultSize: 1 },
  { id: 'stamp', name: 'Stamp', description: 'Place pre-made pixel art stamps.', unlockLevel: 21, icon: '🔖', defaultSize: 1 },
  { id: 'gradient', name: 'Gradient', description: 'Create color gradients across areas.', unlockLevel: 15, icon: '🌈', defaultSize: 1 },
  { id: 'smudge', name: 'Smudge', description: 'Blend and smear adjacent pixels.', unlockLevel: 28, icon: '👆', defaultSize: 2 },
  { id: 'select', name: 'Select', description: 'Select and move pixel regions.', unlockLevel: 12, icon: '⬚', defaultSize: 1 },
  { id: 'text', name: 'Text', description: 'Place pixel text on the canvas.', unlockLevel: 14, icon: '🔤', defaultSize: 1 },
];

// ---------------------------------------------------------------------------
// Animation types (10)
// ---------------------------------------------------------------------------

export const PX_ANIMATION_TYPES: AnimationType[] = [
  { id: 'idle', name: 'Idle', description: 'A subtle breathing or standing animation.', defaultFrames: 4 },
  { id: 'walk', name: 'Walk', description: 'Character walking cycle.', defaultFrames: 6 },
  { id: 'run', name: 'Run', description: 'Faster running animation.', defaultFrames: 6 },
  { id: 'jump', name: 'Jump', description: 'Jumping arc animation.', defaultFrames: 4 },
  { id: 'attack', name: 'Attack', description: 'Striking or shooting animation.', defaultFrames: 4 },
  { id: 'hurt', name: 'Hurt', description: 'Taking damage animation.', defaultFrames: 3 },
  { id: 'die', name: 'Die', description: 'Death or defeat animation.', defaultFrames: 5 },
  { id: 'celebrate', name: 'Celebrate', description: 'Victory celebration animation.', defaultFrames: 6 },
  { id: 'emote', name: 'Emote', description: 'Character expression change.', defaultFrames: 3 },
  { id: 'custom', name: 'Custom', description: 'Create your own animation sequence.', defaultFrames: 8 },
];

// ---------------------------------------------------------------------------
// Challenges (20)
// ---------------------------------------------------------------------------

export const PX_CHALLENGES: PixelChallenge[] = [
  {
    id: 'recreate-classic',
    name: 'Recreate Classic',
    description: 'Recreate a classic video game sprite from memory.',
    timeLimit: 300,
    canvasSize: '16x16',
    paletteId: 'nes',
    maxScore: 100,
    xpReward: 50,
    resourceReward: { pixels: 20, inspiration: 5 },
  },
  {
    id: 'speed-art',
    name: 'Speed Art',
    description: 'Create pixel art as fast as possible. Quality matters!',
    timeLimit: 60,
    canvasSize: '16x16',
    paletteId: 'any',
    maxScore: 100,
    xpReward: 40,
    resourceReward: { pixels: 15, colorPigments: 5 },
  },
  {
    id: 'theme-art',
    name: 'Theme Art',
    description: 'Create art based on a random theme prompt.',
    timeLimit: 180,
    canvasSize: '32x32',
    paletteId: 'any',
    maxScore: 100,
    xpReward: 60,
    resourceReward: { pixels: 25, inspiration: 8 },
  },
  {
    id: 'pixel-by-numbers',
    name: 'Pixel by Numbers',
    description: 'Fill in numbered pixels to reveal a hidden image.',
    timeLimit: 120,
    canvasSize: '16x16',
    paletteId: 'monochrome',
    maxScore: 100,
    xpReward: 35,
    resourceReward: { pixels: 10, blueprints: 3 },
  },
  {
    id: 'color-blind',
    name: 'Color Blind',
    description: 'Create art without seeing the palette colors.',
    timeLimit: 180,
    canvasSize: '16x16',
    paletteId: 'cga',
    maxScore: 100,
    xpReward: 45,
    resourceReward: { colorPigments: 10, inspiration: 5 },
  },
  {
    id: 'mirror-image',
    name: 'Mirror Image',
    description: 'Create perfectly symmetrical pixel art.',
    timeLimit: 150,
    canvasSize: '16x16',
    paletteId: 'pastel',
    maxScore: 100,
    xpReward: 40,
    resourceReward: { pixels: 15, blueprints: 3 },
  },
  {
    id: 'tiny-canvas',
    name: 'Tiny Canvas',
    description: 'Express a full idea in just 8×8 pixels.',
    timeLimit: 120,
    canvasSize: '8x8',
    paletteId: 'any',
    maxScore: 100,
    xpReward: 30,
    resourceReward: { pixels: 10, inspiration: 3 },
  },
  {
    id: 'palette-restrict',
    name: 'Palette Restrict',
    description: 'Create art using only 4 specific colors.',
    timeLimit: 180,
    canvasSize: '16x16',
    paletteId: 'gameboy',
    maxScore: 100,
    xpReward: 45,
    resourceReward: { colorPigments: 8, inspiration: 5 },
  },
  {
    id: 'spriter',
    name: 'Spriter',
    description: 'Create a character sprite with walk animation.',
    timeLimit: 300,
    canvasSize: '16x16',
    paletteId: 'nes',
    maxScore: 100,
    xpReward: 70,
    resourceReward: { pixels: 30, frames: 10, inspiration: 8 },
  },
  {
    id: 'landscape',
    name: 'Landscape',
    description: 'Create a scenic landscape pixel art piece.',
    timeLimit: 300,
    canvasSize: '32x32',
    paletteId: 'earth-tone',
    maxScore: 100,
    xpReward: 55,
    resourceReward: { pixels: 20, colorPigments: 8, blueprints: 5 },
  },
  {
    id: 'portrait',
    name: 'Portrait',
    description: 'Create a pixel art portrait of a character.',
    timeLimit: 240,
    canvasSize: '32x32',
    paletteId: 'any',
    maxScore: 100,
    xpReward: 50,
    resourceReward: { pixels: 20, inspiration: 6 },
  },
  {
    id: 'abstract',
    name: 'Abstract',
    description: 'Create an abstract pixel art composition.',
    timeLimit: 180,
    canvasSize: '32x32',
    paletteId: 'neon',
    maxScore: 100,
    xpReward: 40,
    resourceReward: { colorPigments: 10, inspiration: 8 },
  },
  {
    id: 'icon-design',
    name: 'Icon Design',
    description: 'Design a recognizable app icon at small size.',
    timeLimit: 120,
    canvasSize: '16x16',
    paletteId: 'any',
    maxScore: 100,
    xpReward: 35,
    resourceReward: { pixels: 15, blueprints: 4 },
  },
  {
    id: 'tile-sheet',
    name: 'Tile Sheet',
    description: 'Create a 4-tile tileset for a game.',
    timeLimit: 300,
    canvasSize: '32x32',
    paletteId: 'earth-tone',
    maxScore: 100,
    xpReward: 60,
    resourceReward: { pixels: 25, blueprints: 8, inspiration: 5 },
  },
  {
    id: 'animation',
    name: 'Animation',
    description: 'Create a smooth 8-frame animation.',
    timeLimit: 600,
    canvasSize: '16x16',
    paletteId: 'any',
    maxScore: 100,
    xpReward: 80,
    resourceReward: { pixels: 30, frames: 15, inspiration: 10 },
  },
  {
    id: 'shading',
    name: 'Shading',
    description: 'Demonstrate advanced shading techniques.',
    timeLimit: 180,
    canvasSize: '32x32',
    paletteId: 'sunset',
    maxScore: 100,
    xpReward: 50,
    resourceReward: { colorPigments: 12, pixels: 15 },
  },
  {
    id: 'dithering',
    name: 'Dithering',
    description: 'Create art using dithering patterns.',
    timeLimit: 180,
    canvasSize: '16x16',
    paletteId: 'monochrome',
    maxScore: 100,
    xpReward: 45,
    resourceReward: { pixels: 15, colorPigments: 5 },
  },
  {
    id: 'silhouette',
    name: 'Silhouette',
    description: 'Create recognizable shapes using only black.',
    timeLimit: 120,
    canvasSize: '16x16',
    paletteId: 'monochrome',
    maxScore: 100,
    xpReward: 35,
    resourceReward: { pixels: 10, inspiration: 5 },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Use the fewest pixels possible to convey an idea.',
    timeLimit: 90,
    canvasSize: '8x8',
    paletteId: 'any',
    maxScore: 100,
    xpReward: 30,
    resourceReward: { pixels: 8, inspiration: 6 },
  },
  {
    id: 'masterpiece',
    name: 'Masterpiece',
    description: 'Create your best pixel art. No limits.',
    timeLimit: 0,
    canvasSize: '64x64',
    paletteId: 'any',
    maxScore: 100,
    xpReward: 100,
    resourceReward: { pixels: 50, colorPigments: 20, frames: 15, blueprints: 10, inspiration: 20 },
  },
];

// ---------------------------------------------------------------------------
// Achievements (15)
// ---------------------------------------------------------------------------

export const PX_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-pixel', name: 'First Pixel', description: 'Place your first pixel on the canvas.', icon: '🔲' },
  { id: 'palette-master', name: 'Palette Master', description: 'Use every color in a single palette.', icon: '🎨' },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete any challenge in under 30 seconds.', icon: '⚡' },
  { id: 'gallery-owner', name: 'Gallery Owner', description: 'Fill 10 gallery slots with artwork.', icon: '🖼️' },
  { id: 'challenge-king', name: 'Challenge King', description: 'Complete all 20 challenges at least once.', icon: '👑' },
  { id: 'ten-canvas', name: 'Canvas Master', description: 'Create 10 different artworks.', icon: '📐' },
  { id: 'fifty-canvas', name: 'Prolific Artist', description: 'Create 50 different artworks.', icon: '✨' },
  { id: 'first-sale', name: 'First Sale', description: 'Sell your first artwork on the marketplace.', icon: '💰' },
  { id: 'rich-artist', name: 'Rich Artist', description: 'Accumulate 10,000 coins.', icon: '💎' },
  { id: 'streak-7', name: 'Weekly Warrior', description: 'Maintain a 7-day daily challenge streak.', icon: '🔥' },
  { id: 'streak-30', name: 'Monthly Master', description: 'Maintain a 30-day daily challenge streak.', icon: '🌟' },
  { id: 'all-tools', name: 'Tool Collector', description: 'Unlock and use all 15 drawing tools.', icon: '🔧' },
  { id: 'grandmaster', name: 'Grandmaster', description: 'Reach the Pixel Grandmaster class.', icon: '🏆' },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Get 100 on any challenge.', icon: '💯' },
  { id: 'collector', name: 'Collector', description: 'Own artwork in all 12 palette styles.', icon: '📦' },
];

// ---------------------------------------------------------------------------
// Marketplace customers (10)
// ---------------------------------------------------------------------------

export const PX_MARKETPLACE_CUSTOMERS: MarketplaceCustomer[] = [
  { id: 1, name: 'Pixel Pete', avatar: '🧑‍🎨', budget: 500, preferredStyles: ['nes', 'cga'], patience: 7 },
  { id: 2, name: 'Art Annie', avatar: '👩‍🎨', budget: 1200, preferredStyles: ['pastel', 'candy'], patience: 8 },
  { id: 3, name: 'Retro Rick', avatar: '👴', budget: 800, preferredStyles: ['gameboy', 'monochrome'], patience: 5 },
  { id: 4, name: 'Neon Nina', avatar: '👩‍💻', budget: 2000, preferredStyles: ['neon', 'dark'], patience: 6 },
  { id: 5, name: 'Nature Nate', avatar: '🧑‍🌾', budget: 600, preferredStyles: ['forest', 'earth-tone'], patience: 9 },
  { id: 6, name: 'Sunset Sara', avatar: '👩‍🔬', budget: 1500, preferredStyles: ['sunset', 'ocean'], patience: 7 },
  { id: 7, name: 'Gamer Gary', avatar: '🎮', budget: 3000, preferredStyles: ['nes', 'cga', 'gameboy'], patience: 4 },
  { id: 8, name: 'Minimalist Mia', avatar: '🧘‍♀️', budget: 900, preferredStyles: ['monochrome', 'pastel'], patience: 8 },
  { id: 9, name: 'Collector Carl', avatar: '🎩', budget: 5000, preferredStyles: ['any' as PaletteId], patience: 10 },
  { id: 10, name: 'Newbie Nick', avatar: '👶', budget: 200, preferredStyles: ['pastel', 'candy', 'neon'], patience: 6 },
];

// ---------------------------------------------------------------------------
// Templates (15)
// ---------------------------------------------------------------------------

export const PX_TEMPLATES: Template[] = [
  { id: 1, name: 'Knight', category: 'Characters', description: 'A brave knight character sprite.', canvasSize: '16x16', paletteId: 'nes', thumbnail: '', unlockLevel: 1 },
  { id: 2, name: 'Slime', category: 'Characters', description: 'A classic slime enemy.', canvasSize: '16x16', paletteId: 'nes', thumbnail: '', unlockLevel: 1 },
  { id: 3, name: 'Sword', category: 'Items', description: 'A pixel art sword.', canvasSize: '16x16', paletteId: 'monochrome', thumbnail: '', unlockLevel: 2 },
  { id: 4, name: 'Potion', category: 'Items', description: 'A health potion bottle.', canvasSize: '8x8', paletteId: 'cga', thumbnail: '', unlockLevel: 2 },
  { id: 5, name: 'Tree', category: 'Landscape', description: 'A simple tree for outdoor scenes.', canvasSize: '16x16', paletteId: 'forest', thumbnail: '', unlockLevel: 3 },
  { id: 6, name: 'House', category: 'Landscape', description: 'A small cottage.', canvasSize: '32x32', paletteId: 'earth-tone', thumbnail: '', unlockLevel: 5 },
  { id: 7, name: 'Heart', category: 'UI', description: 'A heart icon for health display.', canvasSize: '8x8', paletteId: 'cga', thumbnail: '', unlockLevel: 1 },
  { id: 8, name: 'Button', category: 'UI', description: 'A game menu button.', canvasSize: '16x16', paletteId: 'pastel', thumbnail: '', unlockLevel: 3 },
  { id: 9, name: 'Wizard', category: 'Characters', description: 'A mysterious wizard character.', canvasSize: '16x16', paletteId: 'nes', thumbnail: '', unlockLevel: 6 },
  { id: 10, name: 'Coin', category: 'Items', description: 'A shiny gold coin.', canvasSize: '8x8', paletteId: 'sunset', thumbnail: '', unlockLevel: 2 },
  { id: 11, name: 'Mountain', category: 'Landscape', description: 'A mountain range.', canvasSize: '32x32', paletteId: 'earth-tone', thumbnail: '', unlockLevel: 8 },
  { id: 12, name: 'Dialog Box', category: 'UI', description: 'A pixel art dialog box frame.', canvasSize: '32x32', paletteId: 'cga', thumbnail: '', unlockLevel: 5 },
  { id: 13, name: 'Spaceship', category: 'Characters', description: 'A small spaceship.', canvasSize: '16x16', paletteId: 'neon', thumbnail: '', unlockLevel: 10 },
  { id: 14, name: 'Flower', category: 'Items', description: 'A small flower.', canvasSize: '8x8', paletteId: 'pastel', thumbnail: '', unlockLevel: 1 },
  { id: 15, name: 'Castle', category: 'Landscape', description: 'A grand castle.', canvasSize: '48x48', paletteId: 'earth-tone', thumbnail: '', unlockLevel: 12 },
];

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------

export interface PixelForgeState {
  // Core progression
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  rank: number;
  coins: number;

  // Artist class
  artistClass: ArtistClassId;
  creativity: number;
  speed: number;
  precision: number;
  colorTheory: number;
  imagination: number;

  // Canvas / Editor
  currentCanvas: CanvasSizeId;
  customCanvasWidth: number;
  customCanvasHeight: number;
  selectedTool: ToolId;
  selectedPalette: PaletteId;
  selectedColorIndex: number;
  brushSize: number;
  opacity: number;
  symmetryMode: SymmetryMode;
  gridVisible: boolean;
  zoom: number;

  // Pixel data (JSON string of 2D hex color array)
  pixelData: string;

  // Animation
  animationType: AnimationTypeId;
  currentFrameIndex: number;
  fps: number;
  isPlaying: boolean;
  animationFrames: string; // JSON array of pixel data strings

  // Gallery
  gallery: GallerySlot[];

  // Challenges
  completedChallenges: string[];
  challengeScores: Record<string, number>;
  bestChallengeScores: Record<string, number>;

  // Resources
  pixels: number;
  colorPigments: number;
  frames: number;
  blueprints: number;
  inspiration: number;

  // Achievements
  unlockedAchievements: string[];

  // Daily challenge
  dailyChallengeDate: string;
  dailyChallengeCompleted: boolean;
  dailyStreak: number;
  longestStreak: number;

  // Marketplace
  marketplaceListings: MarketplaceListing[];
  totalSales: number;
  totalEarnings: number;

  // Stats
  totalPixelsPlaced: number;
  totalArtworksCreated: number;
  totalTimeSpent: number; // in seconds
  toolsUsed: string[];
  palettesUsed: string[];

  // Unlocks tracking
  unlockedTools: ToolId[];
  unlockedPalettes: PaletteId[];
  unlockedCanvasSizes: CanvasSizeId[];

  // Settings
  showTutorial: boolean;
  soundEnabled: boolean;
  autoSave: boolean;
}

// ---------------------------------------------------------------------------
// Default state
// ---------------------------------------------------------------------------

const createEmptyPixelData = (width: number, height: number): string => {
  const grid: string[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = '';
    }
  }
  return JSON.stringify(grid);
};

const createEmptyGallery = (): GallerySlot[] => {
  const slots: GallerySlot[] = [];
  for (let i = 0; i < 30; i++) {
    slots.push({
      id: i,
      name: `Slot ${i + 1}`,
      pixelData: null,
      canvasSize: '16x16',
      paletteId: 'monochrome',
      createdAt: 0,
      likes: 0,
      views: 0,
    });
  }
  return slots;
};

const defaultState: PixelForgeState = {
  level: 1,
  xp: 0,
  xpToNext: 100,
  totalXp: 0,
  rank: 1,
  coins: 0,

  artistClass: 'pixel-novice',
  creativity: 2,
  speed: 1,
  precision: 1,
  colorTheory: 1,
  imagination: 2,

  currentCanvas: '16x16',
  customCanvasWidth: 64,
  customCanvasHeight: 64,
  selectedTool: 'pencil',
  selectedPalette: 'nes',
  selectedColorIndex: 0,
  brushSize: 1,
  opacity: 1,
  symmetryMode: 'none',
  gridVisible: true,
  zoom: 1,

  pixelData: createEmptyPixelData(16, 16),

  animationType: 'idle',
  currentFrameIndex: 0,
  fps: 8,
  isPlaying: false,
  animationFrames: JSON.stringify([createEmptyPixelData(16, 16)]),

  gallery: createEmptyGallery(),

  completedChallenges: [],
  challengeScores: {},
  bestChallengeScores: {},

  pixels: 50,
  colorPigments: 20,
  frames: 10,
  blueprints: 5,
  inspiration: 10,

  unlockedAchievements: [],

  dailyChallengeDate: '',
  dailyChallengeCompleted: false,
  dailyStreak: 0,
  longestStreak: 0,

  marketplaceListings: [],
  totalSales: 0,
  totalEarnings: 0,

  totalPixelsPlaced: 0,
  totalArtworksCreated: 0,
  totalTimeSpent: 0,
  toolsUsed: [],
  palettesUsed: [],

  unlockedTools: ['pencil', 'eraser', 'eyedropper'] as ToolId[],
  unlockedPalettes: ['monochrome', 'cga'] as PaletteId[],
  unlockedCanvasSizes: ['8x8', '16x16'] as CanvasSizeId[],

  showTutorial: true,
  soundEnabled: true,
  autoSave: true,
};

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function loadState(): PixelForgeState {
  try {
    const saved = localStorage.getItem(PX_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...defaultState };
}

function saveState(state: PixelForgeState): void {
  try {
    localStorage.setItem(PX_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function getCanvasDimensions(canvasId: CanvasSizeId, customW?: number, customH?: number): { width: number; height: number } {
  if (canvasId === 'custom') {
    return { width: customW || 64, height: customH || 64 };
  }
  const found = PX_CANVAS_SIZES.find((c) => c.id === canvasId);
  return found ? { width: found.width, height: found.height } : { width: 16, height: 16 };
}

function getArtistClassById(classId: ArtistClassId): ArtistClass | undefined {
  return PX_ARTIST_CLASSES.find((c) => c.id === classId);
}

function getPaletteById(paletteId: PaletteId): Palette | undefined {
  return PX_PALETTES.find((p) => p.id === paletteId);
}

function getToolById(toolId: ToolId): DrawingTool | undefined {
  return PX_DRAWING_TOOLS.find((t) => t.id === toolId);
}

function getChallengeById(challengeId: string): PixelChallenge | undefined {
  return PX_CHALLENGES.find((c) => c.id === challengeId);
}

function getTemplateById(templateId: number): Template | undefined {
  return PX_TEMPLATES.find((t) => t.id === templateId);
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function calculateXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function calculateRank(level: number): number {
  return Math.min(50, Math.floor(level * 1.1));
}

// ---------------------------------------------------------------------------
// The hook
// ---------------------------------------------------------------------------

export default function usePixelForge() {
  const [state, setState] = useState<PixelForgeState>(() => loadState());

  // Helper: save after every state change
  const update = (partial: Partial<PixelForgeState>): void => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      saveState(next);
      return next;
    });
  };

  // =========================================================================
  // ACCESSORS — pxGet*
  // =========================================================================

  function pxGetLevel(): number {
    return state.level;
  }

  function pxGetXp(): number {
    return state.xp;
  }

  function pxGetXpToNext(): number {
    return state.xpToNext;
  }

  function pxGetTotalXp(): number {
    return state.totalXp;
  }

  function pxGetRank(): number {
    return state.rank;
  }

  function pxGetCoins(): number {
    return state.coins;
  }

  function pxGetArtistClass(): ArtistClassId {
    return state.artistClass;
  }

  function pxGetArtistClassData(): ArtistClass | undefined {
    return getArtistClassById(state.artistClass);
  }

  function pxGetCreativity(): number {
    return state.creativity;
  }

  function pxGetSpeed(): number {
    return state.speed;
  }

  function pxGetPrecision(): number {
    return state.precision;
  }

  function pxGetColorTheory(): number {
    return state.colorTheory;
  }

  function pxGetImagination(): number {
    return state.imagination;
  }

  function pxGetCurrentCanvas(): CanvasSizeId {
    return state.currentCanvas;
  }

  function pxGetCustomCanvasWidth(): number {
    return state.customCanvasWidth;
  }

  function pxGetCustomCanvasHeight(): number {
    return state.customCanvasHeight;
  }

  function pxGetCanvasDimensions(): { width: number; height: number } {
    return getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
  }

  function pxGetSelectedTool(): ToolId {
    return state.selectedTool;
  }

  function pxGetSelectedToolData(): DrawingTool | undefined {
    return getToolById(state.selectedTool);
  }

  function pxGetSelectedPalette(): PaletteId {
    return state.selectedPalette;
  }

  function pxGetSelectedPaletteData(): Palette | undefined {
    return getPaletteById(state.selectedPalette);
  }

  function pxGetSelectedColorIndex(): number {
    return state.selectedColorIndex;
  }

  function pxGetSelectedColor(): PaletteColor | undefined {
    const palette = getPaletteById(state.selectedPalette);
    if (!palette) return undefined;
    return palette.colors[state.selectedColorIndex] || palette.colors[0];
  }

  function pxGetBrushSize(): number {
    return state.brushSize;
  }

  function pxGetOpacity(): number {
    return state.opacity;
  }

  function pxGetSymmetryMode(): SymmetryMode {
    return state.symmetryMode;
  }

  function pxGetGridVisible(): boolean {
    return state.gridVisible;
  }

  function pxGetZoom(): number {
    return state.zoom;
  }

  function pxGetPixelData(): string {
    return state.pixelData;
  }

  function pxGetPixelGrid(): string[][] {
    try {
      return JSON.parse(state.pixelData);
    } catch {
      return [];
    }
  }

  function pxGetAnimationType(): AnimationTypeId {
    return state.animationType;
  }

  function pxGetAnimationTypeData(): AnimationType | undefined {
    return PX_ANIMATION_TYPES.find((a) => a.id === state.animationType);
  }

  function pxGetCurrentFrameIndex(): number {
    return state.currentFrameIndex;
  }

  function pxGetFps(): number {
    return state.fps;
  }

  function pxGetIsPlaying(): boolean {
    return state.isPlaying;
  }

  function pxGetAnimationFrames(): string[] {
    try {
      return JSON.parse(state.animationFrames);
    } catch {
      return [state.pixelData];
    }
  }

  function pxGetAnimationFrameCount(): number {
    try {
      const frames: string[] = JSON.parse(state.animationFrames);
      return frames.length;
    } catch {
      return 1;
    }
  }

  function pxGetGallery(): GallerySlot[] {
    return state.gallery;
  }

  function pxGetGallerySlot(index: number): GallerySlot | undefined {
    return state.gallery[index];
  }

  function pxGetGalleryFilledCount(): number {
    return state.gallery.filter((s) => s.pixelData !== null).length;
  }

  function pxGetCompletedChallenges(): string[] {
    return state.completedChallenges;
  }

  function pxGetChallengeScore(challengeId: string): number {
    return state.challengeScores[challengeId] || 0;
  }

  function pxGetBestChallengeScore(challengeId: string): number {
    return state.bestChallengeScores[challengeId] || 0;
  }

  function pxGetPixels(): number {
    return state.pixels;
  }

  function pxGetColorPigments(): number {
    return state.colorPigments;
  }

  function pxGetFrames(): number {
    return state.frames;
  }

  function pxGetBlueprints(): number {
    return state.blueprints;
  }

  function pxGetInspiration(): number {
    return state.inspiration;
  }

  function pxGetUnlockedAchievements(): string[] {
    return state.unlockedAchievements;
  }

  function pxIsAchievementUnlocked(id: string): boolean {
    return state.unlockedAchievements.includes(id);
  }

  function pxGetDailyChallengeDate(): string {
    return state.dailyChallengeDate;
  }

  function pxGetDailyChallengeCompleted(): boolean {
    return state.dailyChallengeCompleted;
  }

  function pxGetDailyStreak(): number {
    return state.dailyStreak;
  }

  function pxGetLongestStreak(): number {
    return state.longestStreak;
  }

  function pxGetMarketplaceListings(): MarketplaceListing[] {
    return state.marketplaceListings;
  }

  function pxGetTotalSales(): number {
    return state.totalSales;
  }

  function pxGetTotalEarnings(): number {
    return state.totalEarnings;
  }

  function pxGetTotalPixelsPlaced(): number {
    return state.totalPixelsPlaced;
  }

  function pxGetTotalArtworksCreated(): number {
    return state.totalArtworksCreated;
  }

  function pxGetTotalTimeSpent(): number {
    return state.totalTimeSpent;
  }

  function pxGetToolsUsed(): string[] {
    return state.toolsUsed;
  }

  function pxGetPalettesUsed(): string[] {
    return state.palettesUsed;
  }

  function pxGetUnlockedTools(): ToolId[] {
    return state.unlockedTools;
  }

  function pxGetUnlockedPalettes(): PaletteId[] {
    return state.unlockedPalettes;
  }

  function pxGetUnlockedCanvasSizes(): CanvasSizeId[] {
    return state.unlockedCanvasSizes;
  }

  function pxIsToolUnlocked(toolId: ToolId): boolean {
    return state.unlockedTools.includes(toolId);
  }

  function pxIsPaletteUnlocked(paletteId: PaletteId): boolean {
    return state.unlockedPalettes.includes(paletteId);
  }

  function pxIsCanvasSizeUnlocked(canvasSizeId: CanvasSizeId): boolean {
    return state.unlockedCanvasSizes.includes(canvasSizeId);
  }

  function pxIsArtistClassUnlocked(classId: ArtistClassId): boolean {
    const cls = getArtistClassById(classId);
    return cls ? state.level >= cls.unlockLevel : false;
  }

  function pxGetShowTutorial(): boolean {
    return state.showTutorial;
  }

  function pxGetSoundEnabled(): boolean {
    return state.soundEnabled;
  }

  function pxGetAutoSave(): boolean {
    return state.autoSave;
  }

  function pxGetXpProgressPercent(): number {
    if (state.xpToNext === 0) return 100;
    return Math.min(100, Math.floor((state.xp / state.xpToNext) * 100));
  }

  function pxGetResource(id: ResourceId): number {
    switch (id) {
      case 'pixels': return state.pixels;
      case 'colorPigments': return state.colorPigments;
      case 'frames': return state.frames;
      case 'blueprints': return state.blueprints;
      case 'inspiration': return state.inspiration;
    }
  }

  function pxGetAllResources(): Record<ResourceId, number> {
    return {
      pixels: state.pixels,
      colorPigments: state.colorPigments,
      frames: state.frames,
      blueprints: state.blueprints,
      inspiration: state.inspiration,
    };
  }

  function pxGetState(): PixelForgeState {
    return state;
  }

  // =========================================================================
  // MUTATORS — pxSet*
  // =========================================================================

  function pxSetLevel(l: number): void {
    update({
      level: l,
      xpToNext: calculateXpToNext(l),
      rank: calculateRank(l),
    });
  }

  function pxSetXp(xp: number): void {
    update({ xp });
  }

  function pxSetRank(r: number): void {
    update({ rank: Math.max(1, Math.min(50, r)) });
  }

  function pxSetCoins(c: number): void {
    update({ coins: Math.max(0, c) });
  }

  function pxSetArtistClass(classId: ArtistClassId): void {
    const cls = getArtistClassById(classId);
    if (!cls) return;
    if (state.level < cls.unlockLevel) return;
    update({
      artistClass: classId,
      creativity: cls.stats.creativity,
      speed: cls.stats.speed,
      precision: cls.stats.precision,
      colorTheory: cls.stats.colorTheory,
      imagination: cls.stats.imagination,
    });
  }

  function pxSetCreativity(v: number): void {
    update({ creativity: Math.max(0, v) });
  }

  function pxSetSpeed(v: number): void {
    update({ speed: Math.max(0, v) });
  }

  function pxSetPrecision(v: number): void {
    update({ precision: Math.max(0, v) });
  }

  function pxSetColorTheory(v: number): void {
    update({ colorTheory: Math.max(0, v) });
  }

  function pxSetImagination(v: number): void {
    update({ imagination: Math.max(0, v) });
  }

  function pxSetCurrentCanvas(canvasId: CanvasSizeId): void {
    update({ currentCanvas: canvasId });
  }

  function pxSetCustomCanvasWidth(w: number): void {
    update({ customCanvasWidth: Math.max(1, Math.min(256, w)) });
  }

  function pxSetCustomCanvasHeight(h: number): void {
    update({ customCanvasHeight: Math.max(1, Math.min(256, h)) });
  }

  function pxSetSelectedTool(toolId: ToolId): void {
    if (!state.unlockedTools.includes(toolId)) return;
    update({ selectedTool: toolId });
    if (!state.toolsUsed.includes(toolId)) {
      update({ toolsUsed: [...state.toolsUsed, toolId] });
    }
  }

  function pxSetSelectedPalette(paletteId: PaletteId): void {
    if (!state.unlockedPalettes.includes(paletteId)) return;
    update({ selectedPalette: paletteId, selectedColorIndex: 0 });
  }

  function pxSetSelectedColorIndex(index: number): void {
    const palette = getPaletteById(state.selectedPalette);
    if (!palette) return;
    update({ selectedColorIndex: Math.max(0, Math.min(palette.colors.length - 1, index)) });
  }

  function pxSetBrushSize(size: number): void {
    update({ brushSize: Math.max(1, Math.min(16, size)) });
  }

  function pxSetOpacity(o: number): void {
    update({ opacity: Math.max(0, Math.min(1, o)) });
  }

  function pxSetSymmetryMode(mode: SymmetryMode): void {
    update({ symmetryMode: mode });
  }

  function pxSetGridVisible(visible: boolean): void {
    update({ gridVisible: visible });
  }

  function pxSetZoom(z: number): void {
    update({ zoom: Math.max(0.25, Math.min(8, z)) });
  }

  function pxSetPixelData(data: string): void {
    update({ pixelData: data });
  }

  function pxSetAnimationType(animType: AnimationTypeId): void {
    update({ animationType: animType });
  }

  function pxSetCurrentFrameIndex(index: number): void {
    const maxFrames = 24;
    update({ currentFrameIndex: Math.max(0, Math.min(maxFrames - 1, index)) });
  }

  function pxSetFps(fps: number): void {
    update({ fps: Math.max(1, Math.min(30, fps)) });
  }

  function pxSetIsPlaying(playing: boolean): void {
    update({ isPlaying: playing });
  }

  function pxSetAnimationFrames(frames: string[]): void {
    const clamped = frames.slice(0, 24);
    update({ animationFrames: JSON.stringify(clamped) });
  }

  function pxSetGallery(gallery: GallerySlot[]): void {
    update({ gallery });
  }

  function pxSetPixels(v: number): void {
    update({ pixels: Math.max(0, v) });
  }

  function pxSetColorPigments(v: number): void {
    update({ colorPigments: Math.max(0, v) });
  }

  function pxSetFrames(v: number): void {
    update({ frames: Math.max(0, v) });
  }

  function pxSetBlueprints(v: number): void {
    update({ blueprints: Math.max(0, v) });
  }

  function pxSetInspiration(v: number): void {
    update({ inspiration: Math.max(0, v) });
  }

  function pxSetResource(id: ResourceId, amount: number): void {
    switch (id) {
      case 'pixels': update({ pixels: Math.max(0, amount) }); break;
      case 'colorPigments': update({ colorPigments: Math.max(0, amount) }); break;
      case 'frames': update({ frames: Math.max(0, amount) }); break;
      case 'blueprints': update({ blueprints: Math.max(0, amount) }); break;
      case 'inspiration': update({ inspiration: Math.max(0, amount) }); break;
    }
  }

  function pxSetShowTutorial(show: boolean): void {
    update({ showTutorial: show });
  }

  function pxSetSoundEnabled(enabled: boolean): void {
    update({ soundEnabled: enabled });
  }

  function pxSetAutoSave(auto: boolean): void {
    update({ autoSave: auto });
  }

  function pxSetDailyStreak(streak: number): void {
    const newLongest = Math.max(state.longestStreak, streak);
    update({ dailyStreak: streak, longestStreak: newLongest });
  }

  // =========================================================================
  // GAME LOGIC FUNCTIONS
  // =========================================================================

  // -- XP & Leveling --

  function pxAddXp(amount: number): void {
    const classBonus = state.artistClass === 'pixel-grandmaster' ? 1.75
      : state.artistClass === 'pixel-sage' ? 1.6
      : state.artistClass === 'pixel-legend' ? 1.5
      : state.artistClass === 'pixel-master' ? 1.4
      : state.artistClass === 'pixel-virtuoso' ? 1.3
      : state.artistClass === 'pixel-expert' ? 1.25
      : state.artistClass === 'pixel-adept' ? 1.2
      : state.artistClass === 'pixel-artisan' ? 1.15
      : state.artistClass === 'pixel-apprentice' ? 1.1
      : 1.05;

    let newXp = state.xp + Math.floor(amount * classBonus);
    let newLevel = state.level;
    let newXpToNext = state.xpToNext;
    let newTotalXp = state.totalXp + Math.floor(amount * classBonus);

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel += 1;
      newXpToNext = calculateXpToNext(newLevel);
    }

    const newRank = calculateRank(newLevel);

    // Check for new unlocks
    const newUnlockedTools = [...state.unlockedTools];
    const newUnlockedPalettes = [...state.unlockedPalettes];
    const newUnlockedCanvasSizes = [...state.unlockedCanvasSizes];

    for (const tool of PX_DRAWING_TOOLS) {
      if (tool.unlockLevel <= newLevel && !newUnlockedTools.includes(tool.id)) {
        newUnlockedTools.push(tool.id);
      }
    }
    for (const palette of PX_PALETTES) {
      if (palette.unlockLevel <= newLevel && !newUnlockedPalettes.includes(palette.id)) {
        newUnlockedPalettes.push(palette.id);
      }
    }
    for (const cs of PX_CANVAS_SIZES) {
      if (cs.unlockLevel <= newLevel && !newUnlockedCanvasSizes.includes(cs.id)) {
        newUnlockedCanvasSizes.push(cs.id);
      }
    }

    update({
      xp: newXp,
      level: newLevel,
      xpToNext: newXpToNext,
      totalXp: newTotalXp,
      rank: newRank,
      unlockedTools: newUnlockedTools,
      unlockedPalettes: newUnlockedPalettes,
      unlockedCanvasSizes: newUnlockedCanvasSizes,
    });
  }

  function pxAddCoins(amount: number): void {
    update({ coins: state.coins + Math.max(0, amount) });
  }

  function pxSpendCoins(amount: number): boolean {
    if (state.coins < amount) return false;
    update({ coins: state.coins - amount });
    return true;
  }

  // -- Pixel Drawing --

  function pxSetPixel(x: number, y: number, color: string): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    if (x < 0 || x >= dim.width || y < 0 || y >= dim.height) return;

    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    if (!grid[y]) grid[y] = [];
    grid[y][x] = color;

    update({
      pixelData: JSON.stringify(grid),
      totalPixelsPlaced: state.totalPixelsPlaced + 1,
    });
  }

  function pxClearPixel(x: number, y: number): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    if (x < 0 || x >= dim.width || y < 0 || y >= dim.height) return;

    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    if (grid[y] && grid[y][x]) {
      grid[y][x] = '';
      update({ pixelData: JSON.stringify(grid) });
    }
  }

  function pxClearCanvas(): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    update({ pixelData: createEmptyPixelData(dim.width, dim.height) });
  }

  function pxFillCanvas(color: string): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const grid: string[][] = [];
    for (let y = 0; y < dim.height; y++) {
      grid[y] = [];
      for (let x = 0; x < dim.width; x++) {
        grid[y][x] = color;
      }
    }
    update({ pixelData: JSON.stringify(grid), totalPixelsPlaced: state.totalPixelsPlaced + dim.width * dim.height });
  }

  function pxFloodFill(startX: number, startY: number, fillColor: string): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    if (startX < 0 || startX >= dim.width || startY < 0 || startY >= dim.height) return;

    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    const targetColor = grid[startY]?.[startX] || '';
    if (targetColor === fillColor) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    let filled = 0;

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      if (cx < 0 || cx >= dim.width || cy < 0 || cy >= dim.height) continue;

      const current = grid[cy]?.[cx] || '';
      if (current !== targetColor) continue;

      visited.add(key);
      if (!grid[cy]) grid[cy] = [];
      grid[cy][cx] = fillColor;
      filled++;

      stack.push([cx + 1, cy]);
      stack.push([cx - 1, cy]);
      stack.push([cx, cy + 1]);
      stack.push([cx, cy - 1]);
    }

    update({
      pixelData: JSON.stringify(grid),
      totalPixelsPlaced: state.totalPixelsPlaced + filled,
    });
  }

  function pxApplyBrush(x: number, y: number, color: string, size: number): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    let placed = 0;
    const half = Math.floor(size / 2);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= dim.width || ny < 0 || ny >= dim.height) continue;

        // Round brush shape
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > half + 0.5) continue;

        if (!grid[ny]) grid[ny] = [];
        grid[ny][nx] = color;
        placed++;

        // Symmetry
        if (state.symmetryMode === 'horizontal' || state.symmetryMode === 'quad') {
          const mx = dim.width - 1 - nx;
          if (mx >= 0 && mx < dim.width) {
            if (!grid[ny]) grid[ny] = [];
            grid[ny][mx] = color;
            placed++;
          }
        }
        if (state.symmetryMode === 'vertical' || state.symmetryMode === 'quad') {
          const my = dim.height - 1 - ny;
          if (my >= 0 && my < dim.height) {
            if (!grid[my]) grid[my] = [];
            grid[my][nx] = color;
            placed++;
          }
        }
        if (state.symmetryMode === 'quad') {
          const mx = dim.width - 1 - nx;
          const my = dim.height - 1 - ny;
          if (mx >= 0 && mx < dim.width && my >= 0 && my < dim.height) {
            if (!grid[my]) grid[my] = [];
            grid[my][mx] = color;
            placed++;
          }
        }
      }
    }

    update({
      pixelData: JSON.stringify(grid),
      totalPixelsPlaced: state.totalPixelsPlaced + placed,
    });
  }

  function pxDrawLine(x0: number, y0: number, x1: number, y1: number, color: string): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    let placed = 0;
    // Bresenham's line algorithm
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;

    while (true) {
      if (cx >= 0 && cx < dim.width && cy >= 0 && cy < dim.height) {
        if (!grid[cy]) grid[cy] = [];
        grid[cy][cx] = color;
        placed++;
      }
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }

    update({
      pixelData: JSON.stringify(grid),
      totalPixelsPlaced: state.totalPixelsPlaced + placed,
    });
  }

  function pxDrawRectangle(x: number, y: number, w: number, h: number, color: string, filled: boolean): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    let placed = 0;

    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        if (px < 0 || px >= dim.width || py < 0 || py >= dim.height) continue;
        if (!filled && px > x && px < x + w - 1 && py > y && py < y + h - 1) continue;

        if (!grid[py]) grid[py] = [];
        grid[py][px] = color;
        placed++;
      }
    }

    update({
      pixelData: JSON.stringify(grid),
      totalPixelsPlaced: state.totalPixelsPlaced + placed,
    });
  }

  function pxDrawCircle(cxCenter: number, cyCenter: number, radius: number, color: string, filled: boolean): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    let placed = 0;
    const r = Math.max(1, radius);

    for (let py = cyCenter - r; py <= cyCenter + r; py++) {
      for (let px = cxCenter - r; px <= cxCenter + r; px++) {
        if (px < 0 || px >= dim.width || py < 0 || py >= dim.height) continue;
        const dist = Math.sqrt((px - cxCenter) ** 2 + (py - cyCenter) ** 2);
        if (filled) {
          if (dist > r + 0.5) continue;
        } else {
          if (Math.abs(dist - r) > 0.7) continue;
        }
        if (!grid[py]) grid[py] = [];
        grid[py][px] = color;
        placed++;
      }
    }

    update({
      pixelData: JSON.stringify(grid),
      totalPixelsPlaced: state.totalPixelsPlaced + placed,
    });
  }

  function pxSprayPaint(x: number, y: number, color: string, radius: number, density: number): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    let placed = 0;
    const r = Math.max(1, radius);
    const d = Math.max(0.1, Math.min(1, density));

    for (let py = y - r; py <= y + r; py++) {
      for (let px = x - r; px <= x + r; px++) {
        if (px < 0 || px >= dim.width || py < 0 || py >= dim.height) continue;
        if (Math.random() > d) continue;
        if (!grid[py]) grid[py] = [];
        grid[py][px] = color;
        placed++;
      }
    }

    update({
      pixelData: JSON.stringify(grid),
      totalPixelsPlaced: state.totalPixelsPlaced + placed,
    });
  }

  function pxEyedrop(x: number, y: number): string | null {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    if (x < 0 || x >= dim.width || y < 0 || y >= dim.height) return null;

    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    return grid[y]?.[x] || null;
  }

  // -- Canvas Resize --

  function pxResizeCanvas(newCanvasId: CanvasSizeId, newWidth?: number, newHeight?: number): void {
    const newDim = getCanvasDimensions(newCanvasId, newWidth, newHeight);
    const newPixelData = createEmptyPixelData(newDim.width, newDim.height);

    update({
      currentCanvas: newCanvasId,
      customCanvasWidth: newWidth || state.customCanvasWidth,
      customCanvasHeight: newHeight || state.customCanvasHeight,
      pixelData: newPixelData,
      animationFrames: JSON.stringify([newPixelData]),
    });
  }

  // -- Animation --

  function pxAddAnimationFrame(pixelData?: string): void {
    const frames: string[] = (() => {
      try { return JSON.parse(state.animationFrames); } catch { return [state.pixelData]; }
    })();

    if (frames.length >= 24) return;

    const newFrame = pixelData || state.pixelData;
    frames.push(newFrame);

    update({
      animationFrames: JSON.stringify(frames),
      currentFrameIndex: frames.length - 1,
      frames: state.frames + 1,
    });
  }

  function pxRemoveAnimationFrame(index: number): void {
    const frames: string[] = (() => {
      try { return JSON.parse(state.animationFrames); } catch { return [state.pixelData]; }
    })();

    if (frames.length <= 1) return;
    if (index < 0 || index >= frames.length) return;

    frames.splice(index, 1);

    const newIndex = Math.min(state.currentFrameIndex, frames.length - 1);
    update({
      animationFrames: JSON.stringify(frames),
      currentFrameIndex: newIndex,
    });
  }

  function pxDuplicateAnimationFrame(index: number): void {
    const frames: string[] = (() => {
      try { return JSON.parse(state.animationFrames); } catch { return [state.pixelData]; }
    })();

    if (frames.length >= 24) return;
    if (index < 0 || index >= frames.length) return;

    frames.splice(index + 1, 0, frames[index]);

    update({
      animationFrames: JSON.stringify(frames),
      currentFrameIndex: index + 1,
    });
  }

  function pxSwapAnimationFrames(i: number, j: number): void {
    const frames: string[] = (() => {
      try { return JSON.parse(state.animationFrames); } catch { return [state.pixelData]; }
    })();

    if (i < 0 || i >= frames.length || j < 0 || j >= frames.length) return;
    if (i === j) return;

    const temp = frames[i];
    frames[i] = frames[j];
    frames[j] = temp;

    update({ animationFrames: JSON.stringify(frames) });
  }

  function pxLoadAnimationFrame(index: number): void {
    const frames: string[] = (() => {
      try { return JSON.parse(state.animationFrames); } catch { return [state.pixelData]; }
    })();

    if (index < 0 || index >= frames.length) return;

    // Save current to current frame
    const updatedFrames = [...frames];
    updatedFrames[state.currentFrameIndex] = state.pixelData;

    update({
      animationFrames: JSON.stringify(updatedFrames),
      currentFrameIndex: index,
      pixelData: updatedFrames[index],
    });
  }

  function pxSaveCurrentFrame(): void {
    const frames: string[] = (() => {
      try { return JSON.parse(state.animationFrames); } catch { return [state.pixelData]; }
    })();

    frames[state.currentFrameIndex] = state.pixelData;

    update({ animationFrames: JSON.stringify(frames) });
  }

  function pxTogglePlayback(): void {
    update({ isPlaying: !state.isPlaying });
  }

  function pxNextFrame(): void {
    const frames: string[] = (() => {
      try { return JSON.parse(state.animationFrames); } catch { return [state.pixelData]; }
    })();

    if (frames.length <= 1) return;
    const next = (state.currentFrameIndex + 1) % frames.length;
    update({
      currentFrameIndex: next,
      pixelData: frames[next],
    });
  }

  function pxPrevFrame(): void {
    const frames: string[] = (() => {
      try { return JSON.parse(state.animationFrames); } catch { return [state.pixelData]; }
    })();

    if (frames.length <= 1) return;
    const prev = (state.currentFrameIndex - 1 + frames.length) % frames.length;
    update({
      currentFrameIndex: prev,
      pixelData: frames[prev],
    });
  }

  function pxNewAnimation(templateType: AnimationTypeId, canvasSize: CanvasSizeId): void {
    const dim = getCanvasDimensions(canvasSize, state.customCanvasWidth, state.customCanvasHeight);
    const animType = PX_ANIMATION_TYPES.find((a) => a.id === templateType);
    const numFrames = animType ? Math.min(animType.defaultFrames, 24) : 4;
    const emptyFrame = createEmptyPixelData(dim.width, dim.height);

    const frames: string[] = [];
    for (let i = 0; i < numFrames; i++) {
      frames.push(emptyFrame);
    }

    update({
      animationType: templateType,
      currentCanvas: canvasSize,
      pixelData: emptyFrame,
      animationFrames: JSON.stringify(frames),
      currentFrameIndex: 0,
      isPlaying: false,
    });
  }

  // -- Gallery --

  function pxSaveToGallery(slotIndex: number, name: string): boolean {
    if (slotIndex < 0 || slotIndex >= 30) return false;

    const newGallery = [...state.gallery];
    const existing = newGallery[slotIndex];

    newGallery[slotIndex] = {
      id: slotIndex,
      name: name || `Artwork ${slotIndex + 1}`,
      pixelData: state.pixelData,
      canvasSize: state.currentCanvas,
      paletteId: state.selectedPalette,
      createdAt: Date.now(),
      likes: existing ? existing.likes : 0,
      views: existing ? existing.views : 0,
    };

    update({
      gallery: newGallery,
      totalArtworksCreated: state.totalArtworksCreated + (existing?.pixelData ? 0 : 1),
    });
    return true;
  }

  function pxLoadFromGallery(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= 30) return false;
    const slot = state.gallery[slotIndex];
    if (!slot || !slot.pixelData) return false;

    update({
      pixelData: slot.pixelData,
      currentCanvas: slot.canvasSize,
      selectedPalette: slot.paletteId,
    });

    // Update gallery views
    const newGallery = [...state.gallery];
    newGallery[slotIndex] = { ...slot, views: slot.views + 1 };
    update({ gallery: newGallery });

    return true;
  }

  function pxDeleteFromGallery(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= 30) return false;

    const newGallery = [...state.gallery];
    newGallery[slotIndex] = {
      ...newGallery[slotIndex],
      pixelData: null,
      name: `Slot ${slotIndex + 1}`,
      createdAt: 0,
    };

    update({ gallery: newGallery });
    return true;
  }

  function pxRenameGallerySlot(slotIndex: number, name: string): boolean {
    if (slotIndex < 0 || slotIndex >= 30) return false;

    const newGallery = [...state.gallery];
    newGallery[slotIndex] = { ...newGallery[slotIndex], name };
    update({ gallery: newGallery });
    return true;
  }

  function pxLikeGallerySlot(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= 30) return false;
    const slot = state.gallery[slotIndex];
    if (!slot || !slot.pixelData) return false;

    const newGallery = [...state.gallery];
    newGallery[slotIndex] = { ...slot, likes: slot.likes + 1 };
    update({ gallery: newGallery });
    return true;
  }

  function pxGetTotalLikes(): number {
    return state.gallery.reduce((sum, slot) => sum + slot.likes, 0);
  }

  function pxGetTotalViews(): number {
    return state.gallery.reduce((sum, slot) => sum + slot.views, 0);
  }

  // -- Challenges --

  function pxCompleteChallenge(challengeId: string, score: number, timeTaken: number): void {
    const challenge = getChallengeById(challengeId);
    if (!challenge) return;

    const clampedScore = Math.max(0, Math.min(challenge.maxScore, score));
    const newCompleted = [...state.completedChallenges];
    const newScores = { ...state.challengeScores };
    const newBestScores = { ...state.bestChallengeScores };

    if (!newCompleted.includes(challengeId)) {
      newCompleted.push(challengeId);
    }
    newScores[challengeId] = clampedScore;
    if (!newBestScores[challengeId] || clampedScore > newBestScores[challengeId]) {
      newBestScores[challengeId] = clampedScore;
    }

    // Challenge score bonus from class
    const classBonus = state.artistClass === 'pixel-grandmaster' ? 0.4
      : state.artistClass === 'pixel-sage' ? 0.35
      : state.artistClass === 'pixel-legend' ? 0.3
      : state.artistClass === 'pixel-master' ? 0.25
      : state.artistClass === 'pixel-virtuoso' ? 0.2
      : state.artistClass === 'pixel-expert' ? 0.15
      : state.artistClass === 'pixel-adept' ? 0.1
      : state.artistClass === 'pixel-artisan' ? 0.05
      : 0;

    const xpEarned = Math.floor(challenge.xpReward * (0.5 + (clampedScore / challenge.maxScore) * 0.5) * (1 + classBonus));

    // Resource rewards (scaled by score)
    const resourceScale = clampedScore / challenge.maxScore;
    const newPixels = state.pixels + Math.floor((challenge.resourceReward.pixels || 0) * resourceScale);
    const newColorPigments = state.colorPigments + Math.floor((challenge.resourceReward.colorPigments || 0) * resourceScale);
    const newFrames = state.frames + Math.floor((challenge.resourceReward.frames || 0) * resourceScale);
    const newBlueprints = state.blueprints + Math.floor((challenge.resourceReward.blueprints || 0) * resourceScale);
    const newInspiration = state.inspiration + Math.floor((challenge.resourceReward.inspiration || 0) * resourceScale);

    const newCoins = state.coins + Math.floor(clampedScore * 2);

    // Track palette usage
    const newPalettesUsed = [...state.palettesUsed];
    if (challenge.paletteId !== 'any' && !newPalettesUsed.includes(challenge.paletteId)) {
      newPalettesUsed.push(challenge.paletteId);
    }

    update({
      completedChallenges: newCompleted,
      challengeScores: newScores,
      bestChallengeScores: newBestScores,
      pixels: newPixels,
      colorPigments: newColorPigments,
      frames: newFrames,
      blueprints: newBlueprints,
      inspiration: newInspiration,
      coins: newCoins,
      palettesUsed: newPalettesUsed,
    });

    // Add XP after state update (needs fresh state via the update chain)
    // We add XP separately so the level-up logic runs
    pxAddXp(xpEarned);

    // Check achievements
    pxCheckAchievements();
  }

  function pxGetChallengeCompletionCount(): number {
    return state.completedChallenges.length;
  }

  function pxIsChallengeCompleted(challengeId: string): boolean {
    return state.completedChallenges.includes(challengeId);
  }

  function pxGetChallengeXpReward(challengeId: string): number {
    const challenge = getChallengeById(challengeId);
    return challenge ? challenge.xpReward : 0;
  }

  // -- Resources --

  function pxAddResource(id: ResourceId, amount: number): void {
    const current = pxGetResource(id);
    pxSetResource(id, current + Math.max(0, amount));
  }

  function pxSpendResource(id: ResourceId, amount: number): boolean {
    const current = pxGetResource(id);
    if (current < amount) return false;
    pxSetResource(id, current - amount);
    return true;
  }

  function pxAddAllResources(amounts: Partial<Record<ResourceId, number>>): void {
    const updates: Partial<PixelForgeState> = {};
    if (amounts.pixels) updates.pixels = state.pixels + amounts.pixels;
    if (amounts.colorPigments) updates.colorPigments = state.colorPigments + amounts.colorPigments;
    if (amounts.frames) updates.frames = state.frames + amounts.frames;
    if (amounts.blueprints) updates.blueprints = state.blueprints + amounts.blueprints;
    if (amounts.inspiration) updates.inspiration = state.inspiration + amounts.inspiration;
    if (Object.keys(updates).length > 0) update(updates);
  }

  // -- Achievements --

  function pxUnlockAchievement(achievementId: string): boolean {
    if (state.unlockedAchievements.includes(achievementId)) return false;

    update({
      unlockedAchievements: [...state.unlockedAchievements, achievementId],
    });
    return true;
  }

  function pxCheckAchievements(): string[] {
    const newlyUnlocked: string[] = [];

    // First Pixel
    if (!state.unlockedAchievements.includes('first-pixel') && state.totalPixelsPlaced >= 1) {
      newlyUnlocked.push('first-pixel');
    }

    // Palette Master
    if (!state.unlockedAchievements.includes('palette-master') && state.palettesUsed.length >= 12) {
      newlyUnlocked.push('palette-master');
    }

    // Gallery Owner
    if (!state.unlockedAchievements.includes('gallery-owner') && pxGetGalleryFilledCount() >= 10) {
      newlyUnlocked.push('gallery-owner');
    }

    // Challenge King
    if (!state.unlockedAchievements.includes('challenge-king') && state.completedChallenges.length >= 20) {
      newlyUnlocked.push('challenge-king');
    }

    // Canvas Master
    if (!state.unlockedAchievements.includes('ten-canvas') && state.totalArtworksCreated >= 10) {
      newlyUnlocked.push('ten-canvas');
    }

    // Prolific Artist
    if (!state.unlockedAchievements.includes('fifty-canvas') && state.totalArtworksCreated >= 50) {
      newlyUnlocked.push('fifty-canvas');
    }

    // First Sale
    if (!state.unlockedAchievements.includes('first-sale') && state.totalSales >= 1) {
      newlyUnlocked.push('first-sale');
    }

    // Rich Artist
    if (!state.unlockedAchievements.includes('rich-artist') && state.coins >= 10000) {
      newlyUnlocked.push('rich-artist');
    }

    // Streak 7
    if (!state.unlockedAchievements.includes('streak-7') && state.dailyStreak >= 7) {
      newlyUnlocked.push('streak-7');
    }

    // Streak 30
    if (!state.unlockedAchievements.includes('streak-30') && state.dailyStreak >= 30) {
      newlyUnlocked.push('streak-30');
    }

    // All Tools
    if (!state.unlockedAchievements.includes('all-tools') && state.unlockedTools.length >= 15) {
      newlyUnlocked.push('all-tools');
    }

    // Grandmaster
    if (!state.unlockedAchievements.includes('grandmaster') && state.artistClass === 'pixel-grandmaster') {
      newlyUnlocked.push('grandmaster');
    }

    // Perfect Score
    if (!state.unlockedAchievements.includes('perfect-score')) {
      const hasPerfect = Object.values(state.bestChallengeScores).some((s) => s >= 100);
      if (hasPerfect) newlyUnlocked.push('perfect-score');
    }

    // Collector
    if (!state.unlockedAchievements.includes('collector') && state.palettesUsed.length >= 12) {
      newlyUnlocked.push('collector');
    }

    // Speed Demon
    if (!state.unlockedAchievements.includes('speed-demon')) {
      // Assume speed demon is checked when completing challenges fast
    }

    for (const id of newlyUnlocked) {
      pxUnlockAchievement(id);
      pxAddXp(25); // bonus XP per achievement
    }

    return newlyUnlocked;
  }

  function pxGetAchievementData(id: string): Achievement | undefined {
    return PX_ACHIEVEMENTS.find((a) => a.id === id);
  }

  function pxGetAchievementCount(): number {
    return state.unlockedAchievements.length;
  }

  function pxGetAchievementXpBonus(): number {
    return state.unlockedAchievements.length * 25;
  }

  // -- Daily Challenge --

  function pxCheckDailyChallenge(): { isToday: boolean; completed: boolean } {
    const today = getTodayDateString();
    return {
      isToday: state.dailyChallengeDate === today,
      completed: state.dailyChallengeDate === today && state.dailyChallengeCompleted,
    };
  }

  function pxStartDailyChallenge(): { challenge: PixelChallenge | undefined; streak: number } {
    const today = getTodayDateString();

    if (state.dailyChallengeDate !== today) {
      // New day — check streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const newStreak = state.dailyChallengeDate === yesterdayStr ? state.dailyStreak + 1 : 1;
      update({
        dailyChallengeDate: today,
        dailyChallengeCompleted: false,
        dailyStreak: newStreak,
        longestStreak: Math.max(state.longestStreak, newStreak),
      });
    }

    // Pick challenge based on day hash
    const dayNum = parseInt(today.replace(/-/g, ''), 10);
    const challengeIndex = dayNum % PX_CHALLENGES.length;
    const challenge = PX_CHALLENGES[challengeIndex];

    return { challenge, streak: state.dailyStreak };
  }

  function pxCompleteDailyChallenge(score: number): void {
    const today = getTodayDateString();
    if (state.dailyChallengeDate !== today) return;

    const newCoins = state.coins + 50 + state.dailyStreak * 10;
    const inspirationBonus = state.dailyStreak * 2;

    update({
      dailyChallengeCompleted: true,
      coins: newCoins,
      inspiration: state.inspiration + inspirationBonus,
    });

    pxAddXp(30 + state.dailyStreak * 5);
    pxCheckAchievements();
  }

  function pxResetDailyStreak(): void {
    update({ dailyStreak: 0, dailyChallengeDate: '', dailyChallengeCompleted: false });
  }

  // -- Marketplace --

  function pxListOnMarketplace(gallerySlotId: number, price: number): string | null {
    if (gallerySlotId < 0 || gallerySlotId >= 30) return null;
    const slot = state.gallery[gallerySlotId];
    if (!slot || !slot.pixelData) return null;
    if (price <= 0) return null;

    const listingId = `listing-${Date.now()}-${gallerySlotId}`;
    const newListing: MarketplaceListing = {
      id: listingId,
      gallerySlotId,
      price,
      listedAt: Date.now(),
      views: 0,
    };

    update({
      marketplaceListings: [...state.marketplaceListings, newListing],
    });

    return listingId;
  }

  function pxRemoveListing(listingId: string): boolean {
    const idx = state.marketplaceListings.findIndex((l) => l.id === listingId);
    if (idx === -1) return false;

    const newListings = [...state.marketplaceListings];
    newListings.splice(idx, 1);
    update({ marketplaceListings: newListings });
    return true;
  }

  function pxSimulateCustomerOffer(listingId: string): { customerId: number; offer: number; accepted: boolean } | null {
    const listing = state.marketplaceListings.find((l) => l.id === listingId);
    if (!listing) return null;

    // Pick a random customer
    const customerIdx = Math.floor(Math.random() * PX_MARKETPLACE_CUSTOMERS.length);
    const customer = PX_MARKETPLACE_CUSTOMERS[customerIdx];

    // Check if customer likes the style
    const slot = state.gallery[listing.gallerySlotId];
    const styleMatch = slot && customer.preferredStyles.includes('any' as PaletteId)
      ? true
      : slot ? customer.preferredStyles.includes(slot.paletteId) : false;

    // Calculate offer
    const baseOffer = styleMatch ? listing.price : Math.floor(listing.price * 0.5);
    const budgetCap = Math.min(customer.budget, baseOffer * 1.2);
    const offer = Math.min(Math.floor(baseOffer * (0.8 + Math.random() * 0.4)), budgetCap);

    if (offer <= 0) return null;

    // Decide if they buy (based on patience and randomness)
    const buyChance = styleMatch ? 0.7 : 0.3;
    const accepted = Math.random() < buyChance;

    if (accepted) {
      // Apply marketplace fee
      const fee = state.artistClass === 'pixel-grandmaster' ? 0.5
        : state.artistClass === 'pixel-legend' ? 0.7
        : state.artistClass === 'pixel-sage' ? 0.8
        : 0.9;

      const earnings = Math.floor(offer * fee);
      const newCoins = state.coins + earnings;

      // Remove listing
      const newListings = state.marketplaceListings.filter((l) => l.id !== listingId);

      update({
        coins: newCoins,
        totalSales: state.totalSales + 1,
        totalEarnings: state.totalEarnings + earnings,
        marketplaceListings: newListings,
      });

      pxCheckAchievements();
    }

    return { customerId: customer.id, offer, accepted };
  }

  function pxBuyFromMarketplace(cost: number): boolean {
    if (state.coins < cost) return false;
    update({ coins: state.coins - cost, pixels: state.pixels + 10, inspiration: state.inspiration + 5 });
    return true;
  }

  // -- Templates --

  function pxApplyTemplate(templateId: number): boolean {
    const template = getTemplateById(templateId);
    if (!template) return false;
    if (state.level < template.unlockLevel) return false;

    const dim = getCanvasDimensions(template.canvasSize);
    const newPixelData = createEmptyPixelData(dim.width, dim.height);

    update({
      currentCanvas: template.canvasSize,
      selectedPalette: template.paletteId,
      pixelData: newPixelData,
      animationFrames: JSON.stringify([newPixelData]),
    });

    if (!state.palettesUsed.includes(template.paletteId)) {
      update({ palettesUsed: [...state.palettesUsed, template.paletteId] });
    }

    return true;
  }

  function pxIsTemplateUnlocked(templateId: number): boolean {
    const template = getTemplateById(templateId);
    return template ? state.level >= template.unlockLevel : false;
  }

  function pxGetTemplateData(templateId: number): Template | undefined {
    return getTemplateById(templateId);
  }

  function pxGetTemplatesByCategory(category: string): Template[] {
    return PX_TEMPLATES.filter((t) => t.category === category);
  }

  function pxGetUnlockedTemplates(): Template[] {
    return PX_TEMPLATES.filter((t) => state.level >= t.unlockLevel);
  }

  // -- Rank System --

  function pxCalculateRankProgress(): { current: number; next: number; percent: number } {
    const rankLevels: Record<number, number> = {};
    for (let l = 1; l <= 50; l++) {
      rankLevels[calculateRank(l)] = l;
    }

    const currentRank = state.rank;
    const currentLevel = state.level;

    const nextRank = Math.min(50, currentRank + 1);
    const levelForNextRank = nextRank <= 50 ? rankLevels[nextRank] || currentLevel + 5 : currentLevel;

    const levelProgress = currentLevel - (rankLevels[currentRank] || 1);
    const levelRange = levelForNextRank - (rankLevels[currentRank] || 1);
    const percent = levelRange > 0 ? Math.min(100, Math.floor((levelProgress / levelRange) * 100)) : 100;

    return { current: currentRank, next: nextRank, percent };
  }

  function pxGetRankTitle(): string {
    const r = state.rank;
    if (r >= 46) return 'Eternal Artist';
    if (r >= 41) return 'Mythic Creator';
    if (r >= 36) return 'Transcendent';
    if (r >= 31) return 'Legendary';
    if (r >= 26) return 'Masterwork';
    if (r >= 21) return 'Renowned';
    if (r >= 16) return 'Veteran';
    if (r >= 11) return 'Skilled';
    if (r >= 6) return 'Apprentice';
    return 'Beginner';
  }

  function pxGetRankColor(): string {
    const r = state.rank;
    if (r >= 46) return '#ff0000';
    if (r >= 41) return '#ff4500';
    if (r >= 36) return '#ff8c00';
    if (r >= 31) return '#ffd700';
    if (r >= 26) return '#adff2f';
    if (r >= 21) return '#00ff7f';
    if (r >= 16) return '#00ced1';
    if (r >= 11) return '#4169e1';
    if (r >= 6) return '#8a2be2';
    return '#a9a9a9';
  }

  // -- Stats & Info --

  function pxGetTotalUnlockedItems(): number {
    return state.unlockedTools.length
      + state.unlockedPalettes.length
      + state.unlockedCanvasSizes.length
      + state.unlockedAchievements.length
      + state.completedChallenges.length;
  }

  function pxGetOverallProgress(): number {
    const maxTools = PX_DRAWING_TOOLS.length;
    const maxPalettes = PX_PALETTES.length;
    const maxCanvasSizes = PX_CANVAS_SIZES.length;
    const maxAchievements = PX_ACHIEVEMENTS.length;
    const maxChallenges = PX_CHALLENGES.length;

    const total =
      (state.unlockedTools.length / maxTools) +
      (state.unlockedPalettes.length / maxPalettes) +
      (state.unlockedCanvasSizes.length / maxCanvasSizes) +
      (state.unlockedAchievements.length / maxAchievements) +
      (state.completedChallenges.length / maxChallenges) +
      (state.level / 50);

    return Math.min(100, Math.floor((total / 6) * 100));
  }

  function pxGetClassProgressToNext(): { currentClass: ArtistClass; nextClass: ArtistClass | undefined; percent: number } {
    const currentIdx = PX_ARTIST_CLASSES.findIndex((c) => c.id === state.artistClass);
    const currentClass = PX_ARTIST_CLASSES[currentIdx] || PX_ARTIST_CLASSES[0];
    const nextClass = currentIdx < PX_ARTIST_CLASSES.length - 1 ? PX_ARTIST_CLASSES[currentIdx + 1] : undefined;

    if (!nextClass) return { currentClass, nextClass: undefined, percent: 100 };

    const levelsGained = state.level - currentClass.unlockLevel;
    const levelsNeeded = nextClass.unlockLevel - currentClass.unlockLevel;
    const percent = levelsNeeded > 0 ? Math.min(100, Math.floor((levelsGained / levelsNeeded) * 100)) : 100;

    return { currentClass, nextClass, percent };
  }

  function pxGetStatsSummary(): {
    artworks: number;
    pixelsPlaced: number;
    challenges: number;
    achievements: number;
    sales: number;
    earnings: number;
    rank: number;
    rankTitle: string;
  } {
    return {
      artworks: state.totalArtworksCreated,
      pixelsPlaced: state.totalPixelsPlaced,
      challenges: state.completedChallenges.length,
      achievements: state.unlockedAchievements.length,
      sales: state.totalSales,
      earnings: state.totalEarnings,
      rank: state.rank,
      rankTitle: pxGetRankTitle(),
    };
  }

  // -- Import / Export --

  function pxExportSave(): string {
    return JSON.stringify(state, null, 2);
  }

  function pxImportSave(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed.level !== 'number') return false;
      const merged = { ...defaultState, ...parsed };
      setState(merged);
      saveState(merged);
      return true;
    } catch {
      return false;
    }
  }

  function pxResetAll(): void {
    const fresh = { ...defaultState, gallery: createEmptyGallery() };
    setState(fresh);
    saveState(fresh);
  }

  // -- Random / Generator helpers --

  function pxGetRandomPalette(): Palette {
    return PX_PALETTES[Math.floor(Math.random() * PX_PALETTES.length)];
  }

  function pxGetRandomChallenge(): PixelChallenge {
    return PX_CHALLENGES[Math.floor(Math.random() * PX_CHALLENGES.length)];
  }

  function pxGetRandomCustomer(): MarketplaceCustomer {
    return PX_MARKETPLACE_CUSTOMERS[Math.floor(Math.random() * PX_MARKETPLACE_CUSTOMERS.length)];
  }

  function pxGetRandomTemplate(): Template {
    const unlocked = pxGetUnlockedTemplates();
    if (unlocked.length === 0) return PX_TEMPLATES[0];
    return unlocked[Math.floor(Math.random() * unlocked.length)];
  }

  function pxGenerateRandomArt(width: number, height: number, palette: Palette): string {
    const grid: string[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        // ~30% fill rate for interesting random art
        if (Math.random() < 0.3) {
          const colorIdx = Math.floor(Math.random() * palette.colors.length);
          grid[y][x] = palette.colors[colorIdx].hex;
        } else {
          grid[y][x] = '';
        }
      }
    }
    return JSON.stringify(grid);
  }

  function pxGeneratePattern(width: number, height: number, palette: Palette, patternType: string): string {
    const grid: string[][] = [];
    const colors = palette.colors.map((c) => c.hex);
    const len = colors.length;

    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        let colorIdx = 0;
        switch (patternType) {
          case 'checkerboard':
            colorIdx = (x + y) % 2 === 0 ? 0 : len > 1 ? 1 : 0;
            break;
          case 'stripes-h':
            colorIdx = y % len;
            break;
          case 'stripes-v':
            colorIdx = x % len;
            break;
          case 'diagonal':
            colorIdx = (x + y) % len;
            break;
          case 'gradient':
            colorIdx = Math.floor((x / width) * len);
            if (colorIdx >= len) colorIdx = len - 1;
            break;
          case 'gradient-v':
            colorIdx = Math.floor((y / height) * len);
            if (colorIdx >= len) colorIdx = len - 1;
            break;
          case 'diamond':
            colorIdx = Math.abs(x - Math.floor(width / 2)) + Math.abs(y - Math.floor(height / 2));
            colorIdx = colorIdx % len;
            break;
          case 'circles':
            {
              const cx = width / 2;
              const cy = height / 2;
              const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
              colorIdx = Math.floor(dist) % len;
            }
            break;
          default:
            colorIdx = Math.floor(Math.random() * len);
            break;
        }
        grid[y][x] = colors[colorIdx];
      }
    }
    return JSON.stringify(grid);
  }

  // -- Undo/Redo stub helpers --

  function pxCreateUndoSnapshot(): string {
    return JSON.stringify({
      pixelData: state.pixelData,
      currentFrameIndex: state.currentFrameIndex,
    });
  }

  function pxRestoreSnapshot(snapshot: string): boolean {
    try {
      const parsed = JSON.parse(snapshot);
      if (typeof parsed.pixelData !== 'string') return false;
      update({
        pixelData: parsed.pixelData,
        currentFrameIndex: parsed.currentFrameIndex ?? state.currentFrameIndex,
      });
      return true;
    } catch {
      return false;
    }
  }

  // -- Palette / Color utilities --

  function pxHexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  function pxRgbToHex(r: number, g: number, b: number): string {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  function pxBlendColors(hex1: string, hex2: string, factor: number): string | null {
    const c1 = pxHexToRgb(hex1);
    const c2 = pxHexToRgb(hex2);
    if (!c1 || !c2) return null;

    const r = c1.r + (c2.r - c1.r) * factor;
    const g = c1.g + (c2.g - c1.g) * factor;
    const b = c1.b + (c2.b - c1.b) * factor;

    return pxRgbToHex(r, g, b);
  }

  function pxInvertColor(hex: string): string | null {
    const rgb = pxHexToRgb(hex);
    if (!rgb) return null;
    return pxRgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
  }

  function pxGetClosestPaletteColor(hex: string, paletteId: PaletteId): PaletteColor | null {
    const palette = getPaletteById(paletteId);
    if (!palette) return null;

    const target = pxHexToRgb(hex);
    if (!target) return null;

    let closest: PaletteColor | null = null;
    let minDist = Infinity;

    for (const color of palette.colors) {
      const rgb = pxHexToRgb(color.hex);
      if (!rgb) continue;

      const dist = Math.sqrt(
        (target.r - rgb.r) ** 2 +
        (target.g - rgb.g) ** 2 +
        (target.b - rgb.b) ** 2
      );

      if (dist < minDist) {
        minDist = dist;
        closest = color;
      }
    }

    return closest;
  }

  // -- Time tracking --

  function pxAddTimeSpent(seconds: number): void {
    update({ totalTimeSpent: state.totalTimeSpent + Math.max(0, seconds) });
  }

  function pxFormatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function pxGetTimeSpentFormatted(): string {
    return pxFormatTime(state.totalTimeSpent);
  }

  // -- Grid utilities --

  function pxCreateGrid(width: number, height: number, fill: string): string {
    const grid: string[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        grid[y][x] = fill;
      }
    }
    return JSON.stringify(grid);
  }

  function pxGetPixelAt(grid: string[][], x: number, y: number): string {
    if (y < 0 || y >= grid.length) return '';
    if (x < 0 || x >= (grid[y]?.length || 0)) return '';
    return grid[y][x] || '';
  }

  function pxGetGridSize(grid: string[][]): { width: number; height: number } {
    if (grid.length === 0) return { width: 0, height: 0 };
    return { width: grid[0]?.length || 0, height: grid.length };
  }

  function pxMirrorGridHorizontal(grid: string[][]): string[][] {
    return grid.map((row) => [...row].reverse());
  }

  function pxMirrorGridVertical(grid: string[][]): string[][] {
    return [...grid].reverse();
  }

  function pxRotateGrid90CW(grid: string[][]): string[][] {
    if (grid.length === 0) return [];
    const h = grid.length;
    const w = grid[0]?.length || 0;
    const result: string[][] = [];
    for (let x = 0; x < w; x++) {
      result[x] = [];
      for (let y = h - 1; y >= 0; y--) {
        result[x].push(grid[y]?.[x] || '');
      }
    }
    return result;
  }

  function pxRotateGrid90CCW(grid: string[][]): string[][] {
    if (grid.length === 0) return [];
    const h = grid.length;
    const w = grid[0]?.length || 0;
    const result: string[][] = [];
    for (let x = w - 1; x >= 0; x--) {
      result[w - 1 - x] = [];
      for (let y = 0; y < h; y++) {
        result[w - 1 - x].push(grid[y]?.[x] || '');
      }
    }
    return result;
  }

  // -- Smudge logic --

  function pxSmudgeAt(x: number, y: number, radius: number): void {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    if (x < 0 || x >= dim.width || y < 0 || y >= dim.height) return;

    const targetColor = grid[y]?.[x] || '';

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= dim.width || ny < 0 || ny >= dim.height) continue;
        if (Math.random() > 0.3) continue; // 30% chance per neighbor

        const neighborColor = grid[ny]?.[nx] || '';
        if (neighborColor === '' || neighborColor === targetColor) continue;

        // Blend target into neighbor
        const blended = pxBlendColors(neighborColor, targetColor, 0.3);
        if (blended) {
          if (!grid[ny]) grid[ny] = [];
          grid[ny][nx] = blended;
        }
      }
    }

    update({ pixelData: JSON.stringify(grid) });
  }

  // -- Text rendering --

  function pxPlaceText(startX: number, startY: number, text: string, color: string, fontSize: number): number {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    // Simple 3x5 pixel font for uppercase letters and numbers
    const font: Record<string, string[]> = {
      A: ['111', '101', '111', '101', '101'],
      B: ['110', '101', '110', '101', '110'],
      C: ['111', '100', '100', '100', '111'],
      D: ['110', '101', '101', '101', '110'],
      E: ['111', '100', '110', '100', '111'],
      F: ['111', '100', '110', '100', '100'],
      G: ['111', '100', '101', '101', '111'],
      H: ['101', '101', '111', '101', '101'],
      I: ['111', '010', '010', '010', '111'],
      J: ['001', '001', '001', '101', '111'],
      K: ['101', '101', '110', '101', '101'],
      L: ['100', '100', '100', '100', '111'],
      M: ['101', '111', '111', '101', '101'],
      N: ['101', '111', '111', '111', '101'],
      O: ['111', '101', '101', '101', '111'],
      P: ['111', '101', '111', '100', '100'],
      Q: ['111', '101', '101', '111', '001'],
      R: ['111', '101', '110', '101', '101'],
      S: ['111', '100', '111', '001', '111'],
      T: ['111', '010', '010', '010', '010'],
      U: ['101', '101', '101', '101', '111'],
      V: ['101', '101', '101', '101', '010'],
      W: ['101', '101', '111', '111', '101'],
      X: ['101', '101', '010', '101', '101'],
      Y: ['101', '101', '010', '010', '010'],
      Z: ['111', '001', '010', '100', '111'],
      '0': ['111', '101', '101', '101', '111'],
      '1': ['010', '110', '010', '010', '111'],
      '2': ['111', '001', '111', '100', '111'],
      '3': ['111', '001', '111', '001', '111'],
      '4': ['101', '101', '111', '001', '001'],
      '5': ['111', '100', '111', '001', '111'],
      '6': ['111', '100', '111', '101', '111'],
      '7': ['111', '001', '001', '001', '001'],
      '8': ['111', '101', '111', '101', '111'],
      '9': ['111', '101', '111', '001', '111'],
      ' ': ['000', '000', '000', '000', '000'],
      '!': ['1', '1', '1', '0', '1'],
      '.': ['0', '0', '0', '0', '1'],
      '-': ['000', '000', '111', '000', '000'],
    };

    const upper = text.toUpperCase();
    let placed = 0;
    let cursorX = startX;

    for (const char of upper) {
      const glyph = font[char];
      if (!glyph) { cursorX += 4; continue; }

      for (let gy = 0; gy < glyph.length; gy++) {
        for (let gx = 0; gx < glyph[gy].length; gx++) {
          if (glyph[gy][gx] === '1') {
            const px = cursorX + gx * fontSize;
            const py = startY + gy * fontSize;

            if (px >= 0 && px < dim.width && py >= 0 && py < dim.height) {
              if (!grid[py]) grid[py] = [];
              grid[py][px] = color;
              placed++;
            }
          }
        }
      }

      cursorX += (glyph[0]?.length || 3) * fontSize + fontSize;
    }

    update({
      pixelData: JSON.stringify(grid),
      totalPixelsPlaced: state.totalPixelsPlaced + placed,
    });

    return placed;
  }

  // -- Canvas transformations --

  function pxFlipCanvasHorizontal(): void {
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();
    const flipped = pxMirrorGridHorizontal(grid);
    update({ pixelData: JSON.stringify(flipped) });
  }

  function pxFlipCanvasVertical(): void {
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();
    const flipped = pxMirrorGridVertical(grid);
    update({ pixelData: JSON.stringify(flipped) });
  }

  function pxRotateCanvasCW(): void {
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();
    const rotated = pxRotateGrid90CW(grid);
    update({ pixelData: JSON.stringify(rotated) });
  }

  function pxRotateCanvasCCW(): void {
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();
    const rotated = pxRotateGrid90CCW(grid);
    update({ pixelData: JSON.stringify(rotated) });
  }

  function pxCopyRegion(x: number, y: number, w: number, h: number): string | null {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    const region: string[][] = [];
    for (let py = y; py < y + h; py++) {
      const row: string[] = [];
      for (let px = x; px < x + w; px++) {
        if (px >= 0 && px < dim.width && py >= 0 && py < dim.height) {
          row.push(grid[py]?.[px] || '');
        } else {
          row.push('');
        }
      }
      region.push(row);
    }

    return JSON.stringify(region);
  }

  function pxPasteRegion(destX: number, destY: number, regionData: string): boolean {
    try {
      const region: string[][] = JSON.parse(regionData);
      const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
      const grid: string[][] = (() => {
        try { return JSON.parse(state.pixelData); } catch { return []; }
      })();

      let placed = 0;
      for (let ry = 0; ry < region.length; ry++) {
        for (let rx = 0; rx < region[ry].length; rx++) {
          const px = destX + rx;
          const py = destY + ry;
          if (px >= 0 && px < dim.width && py >= 0 && py < dim.height) {
            if (!grid[py]) grid[py] = [];
            grid[py][px] = region[ry][rx];
            placed++;
          }
        }
      }

      update({
        pixelData: JSON.stringify(grid),
        totalPixelsPlaced: state.totalPixelsPlaced + placed,
      });
      return true;
    } catch {
      return false;
    }
  }

  // -- Onion skinning --

  function pxGetOnionSkinFrame(offset: number): string | null {
    const frames: string[] = (() => {
      try { return JSON.parse(state.animationFrames); } catch { return [state.pixelData]; }
    })();

    const targetIndex = state.currentFrameIndex + offset;
    if (targetIndex < 0 || targetIndex >= frames.length) return null;
    return frames[targetIndex];
  }

  // -- Color counting --

  function pxGetUniqueColorsInCanvas(): number {
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    const colors = new Set<string>();
    for (const row of grid) {
      for (const cell of row) {
        if (cell && cell !== '') {
          colors.add(cell);
        }
      }
    }
    return colors.size;
  }

  function pxGetPixelCountInCanvas(): number {
    const grid: string[][] = (() => {
      try { return JSON.parse(state.pixelData); } catch { return []; }
    })();

    let count = 0;
    for (const row of grid) {
      for (const cell of row) {
        if (cell && cell !== '') {
          count++;
        }
      }
    }
    return count;
  }

  function pxGetCanvasFillPercent(): number {
    const dim = getCanvasDimensions(state.currentCanvas, state.customCanvasWidth, state.customCanvasHeight);
    const total = dim.width * dim.height;
    if (total === 0) return 0;
    return Math.floor((pxGetPixelCountInCanvas() / total) * 100);
  }

  // =========================================================================
  // RETURN ALL EXPORTED FUNCTIONS
  // =========================================================================

  return {
    state,

    // Accessors
    pxGetLevel,
    pxGetXp,
    pxGetXpToNext,
    pxGetTotalXp,
    pxGetRank,
    pxGetCoins,
    pxGetArtistClass,
    pxGetArtistClassData,
    pxGetCreativity,
    pxGetSpeed,
    pxGetPrecision,
    pxGetColorTheory,
    pxGetImagination,
    pxGetCurrentCanvas,
    pxGetCustomCanvasWidth,
    pxGetCustomCanvasHeight,
    pxGetCanvasDimensions,
    pxGetSelectedTool,
    pxGetSelectedToolData,
    pxGetSelectedPalette,
    pxGetSelectedPaletteData,
    pxGetSelectedColorIndex,
    pxGetSelectedColor,
    pxGetBrushSize,
    pxGetOpacity,
    pxGetSymmetryMode,
    pxGetGridVisible,
    pxGetZoom,
    pxGetPixelData,
    pxGetPixelGrid,
    pxGetAnimationType,
    pxGetAnimationTypeData,
    pxGetCurrentFrameIndex,
    pxGetFps,
    pxGetIsPlaying,
    pxGetAnimationFrames,
    pxGetAnimationFrameCount,
    pxGetGallery,
    pxGetGallerySlot,
    pxGetGalleryFilledCount,
    pxGetCompletedChallenges,
    pxGetChallengeScore,
    pxGetBestChallengeScore,
    pxGetPixels,
    pxGetColorPigments,
    pxGetFrames,
    pxGetBlueprints,
    pxGetInspiration,
    pxGetUnlockedAchievements,
    pxIsAchievementUnlocked,
    pxGetDailyChallengeDate,
    pxGetDailyChallengeCompleted,
    pxGetDailyStreak,
    pxGetLongestStreak,
    pxGetMarketplaceListings,
    pxGetTotalSales,
    pxGetTotalEarnings,
    pxGetTotalPixelsPlaced,
    pxGetTotalArtworksCreated,
    pxGetTotalTimeSpent,
    pxGetToolsUsed,
    pxGetPalettesUsed,
    pxGetUnlockedTools,
    pxGetUnlockedPalettes,
    pxGetUnlockedCanvasSizes,
    pxIsToolUnlocked,
    pxIsPaletteUnlocked,
    pxIsCanvasSizeUnlocked,
    pxIsArtistClassUnlocked,
    pxGetShowTutorial,
    pxGetSoundEnabled,
    pxGetAutoSave,
    pxGetXpProgressPercent,
    pxGetResource,
    pxGetAllResources,
    pxGetState,
    pxGetTotalLikes,
    pxGetTotalViews,
    pxGetChallengeCompletionCount,
    pxIsChallengeCompleted,
    pxGetChallengeXpReward,
    pxGetAchievementData,
    pxGetAchievementCount,
    pxGetAchievementXpBonus,
    pxGetTemplateData,
    pxGetTemplatesByCategory,
    pxGetUnlockedTemplates,
    pxIsTemplateUnlocked,
    pxGetRankTitle,
    pxGetRankColor,
    pxGetStatsSummary,
    pxGetClassProgressToNext,
    pxGetOverallProgress,
    pxGetTotalUnlockedItems,
    pxGetRandomPalette,
    pxGetRandomChallenge,
    pxGetRandomCustomer,
    pxGetRandomTemplate,
    pxGetUniqueColorsInCanvas,
    pxGetPixelCountInCanvas,
    pxGetCanvasFillPercent,
    pxGetOnionSkinFrame,
    pxGetTimeSpentFormatted,

    // Mutators
    pxSetLevel,
    pxSetXp,
    pxSetRank,
    pxSetCoins,
    pxSetArtistClass,
    pxSetCreativity,
    pxSetSpeed,
    pxSetPrecision,
    pxSetColorTheory,
    pxSetImagination,
    pxSetCurrentCanvas,
    pxSetCustomCanvasWidth,
    pxSetCustomCanvasHeight,
    pxSetSelectedTool,
    pxSetSelectedPalette,
    pxSetSelectedColorIndex,
    pxSetBrushSize,
    pxSetOpacity,
    pxSetSymmetryMode,
    pxSetGridVisible,
    pxSetZoom,
    pxSetPixelData,
    pxSetAnimationType,
    pxSetCurrentFrameIndex,
    pxSetFps,
    pxSetIsPlaying,
    pxSetAnimationFrames,
    pxSetGallery,
    pxSetPixels,
    pxSetColorPigments,
    pxSetFrames,
    pxSetBlueprints,
    pxSetInspiration,
    pxSetResource,
    pxSetShowTutorial,
    pxSetSoundEnabled,
    pxSetAutoSave,
    pxSetDailyStreak,

    // Game logic
    pxAddXp,
    pxAddCoins,
    pxSpendCoins,
    pxSetPixel,
    pxClearPixel,
    pxClearCanvas,
    pxFillCanvas,
    pxFloodFill,
    pxApplyBrush,
    pxDrawLine,
    pxDrawRectangle,
    pxDrawCircle,
    pxSprayPaint,
    pxEyedrop,
    pxResizeCanvas,
    pxAddAnimationFrame,
    pxRemoveAnimationFrame,
    pxDuplicateAnimationFrame,
    pxSwapAnimationFrames,
    pxLoadAnimationFrame,
    pxSaveCurrentFrame,
    pxTogglePlayback,
    pxNextFrame,
    pxPrevFrame,
    pxNewAnimation,
    pxSaveToGallery,
    pxLoadFromGallery,
    pxDeleteFromGallery,
    pxRenameGallerySlot,
    pxLikeGallerySlot,
    pxCompleteChallenge,
    pxAddResource,
    pxSpendResource,
    pxAddAllResources,
    pxUnlockAchievement,
    pxCheckAchievements,
    pxCheckDailyChallenge,
    pxStartDailyChallenge,
    pxCompleteDailyChallenge,
    pxResetDailyStreak,
    pxListOnMarketplace,
    pxRemoveListing,
    pxSimulateCustomerOffer,
    pxBuyFromMarketplace,
    pxApplyTemplate,
    pxCalculateRankProgress,
    pxExportSave,
    pxImportSave,
    pxResetAll,
    pxGenerateRandomArt,
    pxGeneratePattern,
    pxCreateUndoSnapshot,
    pxRestoreSnapshot,
    pxHexToRgb,
    pxRgbToHex,
    pxBlendColors,
    pxInvertColor,
    pxGetClosestPaletteColor,
    pxAddTimeSpent,
    pxFormatTime,
    pxCreateGrid,
    pxGetPixelAt,
    pxGetGridSize,
    pxMirrorGridHorizontal,
    pxMirrorGridVertical,
    pxRotateGrid90CW,
    pxRotateGrid90CCW,
    pxSmudgeAt,
    pxPlaceText,
    pxFlipCanvasHorizontal,
    pxFlipCanvasVertical,
    pxRotateCanvasCW,
    pxRotateCanvasCCW,
    pxCopyRegion,
    pxPasteRegion,
  };
}
