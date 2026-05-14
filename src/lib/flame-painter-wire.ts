/**
 * Flame Painter Wire — 火焰画师 (Flame Painter) feature module for Word Snake
 *
 * A creative fire painting art game where players use 8 flame types and 12 brush
 * techniques to create artwork on a 6×6 canvas. Features 24 flame-derived colors,
 * an art gallery (30 slots), scoring (0–100), daily theme challenges, flame
 * mastery levels (1–10 per flame), player artist level (1–40) with XP, 15
 * achievements, art commissions, and a streak system.
 *
 * Storage key: flame-painter-wire
 * Prefix: fp / FP_
 */

import { useState } from 'react'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type FPFlameTypeId =
  | 'candle_flame'
  | 'blue_fire'
  | 'phoenix_fire'
  | 'dragon_breath'
  | 'inferno'
  | 'spirit_fire'
  | 'solar_flare'
  | 'dark_flame'

export type FPBrushTechniqueId =
  | 'dab'
  | 'sweep'
  | 'splash'
  | 'calligraphy'
  | 'glow'
  | 'scorch'
  | 'wisps'
  | 'ripple'
  | 'ember_dust'
  | 'plasma_stroke'
  | 'shadow_blur'
  | 'spirit_trail'

export type FPArtStyle =
  | 'Impressionist Embers'
  | 'Blazing Realism'
  | 'Abstract Inferno'
  | 'Spiritual Radiance'
  | 'Shadowed Minimalism'
  | 'Cosmic Firestorm'
  | 'Ethereal Glow'
  | 'Dark Expressionism'

export interface FPPaintCell {
  readonly row: number
  readonly col: number
  color: string
  flameType: FPFlameTypeId
  intensity: number
  technique: FPBrushTechniqueId
  layers: Array<{ color: string; flameType: FPFlameTypeId; intensity: number }>
}

export interface FPCanvas {
  readonly rows: number
  readonly cols: number
  cells: FPPaintCell[][]
}

export interface FPGalleryEntry {
  readonly id: string
  readonly name: string
  canvas: FPCanvas
  score: number
  artStyle: FPArtStyle
  flameTypesUsed: FPFlameTypeId[]
  createdAt: number
}

export interface FPFlameMastery {
  readonly flameType: FPFlameTypeId
  level: number
  xp: number
}

export interface FPAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly condition: string
  readonly reward: string
  readonly xpReward: number
}

export interface FPCommission {
  readonly id: string
  readonly npcName: string
  readonly request: string
  readonly description: string
  readonly requiredFlameTypes: FPFlameTypeId[]
  readonly minScore: number
  readonly reward: number
  readonly xpReward: number
  readonly accepted: boolean
  readonly completed: boolean
  readonly acceptedAt: number | null
  readonly completedAt: number | null
}

export interface FPDailyTheme {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly suggestedFlames: FPFlameTypeId[]
  readonly bonusMultiplier: number
  readonly date: string
  readonly completed: boolean
}

export interface FPFlameTypeDef {
  readonly id: FPFlameTypeId
  readonly name: string
  readonly description: string
  readonly temperature: number
  readonly colors: string[]
  readonly intensity: number
  readonly unlockLevel: number
  readonly icon: string
}

export interface FPBrushTechniqueDef {
  readonly id: FPBrushTechniqueId
  readonly name: string
  readonly description: string
  readonly brushSize: number
  readonly opacityMultiplier: number
  readonly specialEffect: string
  readonly compatibleFlames: FPFlameTypeId[]
}

export interface FPPaintResult {
  success: boolean
  canvas: FPCanvas
  message: string
  cellsAffected: Array<{ row: number; col: number }>
  xpGained: number
}

export interface FPArtScore {
  total: number
  colorHarmony: number
  coverage: number
  patternScore: number
  artStyle: FPArtStyle
}

export interface FPStats {
  readonly totalPaintings: number
  readonly totalStrokes: number
  readonly totalUndo: number
  readonly highestScore: number
  readonly totalXP: number
  readonly flamesUnlocked: number
  readonly achievementsUnlocked: number
  readonly commissionsCompleted: number
  readonly dailyStreak: number
  readonly longestStreak: number
  readonly favoriteFlame: FPFlameTypeId
  readonly totalPlayTime: number
}

export interface FlamePainterState {
  canvas: FPCanvas
  activeFlameType: FPFlameTypeId
  activeBrushTechnique: FPBrushTechniqueId
  activeColor: string
  gallery: FPGalleryEntry[]
  flameMastery: Record<FPFlameTypeId, FPFlameMastery>
  playerLevel: number
  playerXP: number
  playerTitle: string
  achievements: string[]
  commissions: FPCommission[]
  dailyTheme: FPDailyTheme
  paintHistory: FPCanvas[]
  historyIndex: number
  tutorialStep: number
  stats: FPStats
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: CONSTANTS — FLAME TYPES (8)
// ═══════════════════════════════════════════════════════════════════

export const FP_FLAME_TYPES: readonly FPFlameTypeDef[] = [
  {
    id: 'candle_flame',
    name: 'Candle Flame',
    description:
      'A warm, gentle flame that flickers softly like a candle in a dark room. Produces soft gradients of yellow and orange, ideal for delicate detail work and ambient lighting effects in paintings.',
    temperature: 1400,
    colors: ['#FFF8DC', '#FFE4B5', '#FFD700', '#FFA500', '#FF8C00'],
    intensity: 3,
    unlockLevel: 1,
    icon: '🕯️',
  },
  {
    id: 'blue_fire',
    name: 'Blue Fire',
    description:
      'An otherworldly azure flame that burns at extreme temperatures. Creates stunning cyan and blue hues with white-hot cores, perfect for ethereal night scenes and mystical artwork.',
    temperature: 3500,
    colors: ['#E0FFFF', '#87CEEB', '#4682B4', '#1E90FF', '#0000CD'],
    intensity: 6,
    unlockLevel: 1,
    icon: '🔥',
  },
  {
    id: 'phoenix_fire',
    name: 'Phoenix Fire',
    description:
      'The sacred flame of rebirth, shifting through gold, crimson, and white. Leaves trailing sparks of hope and renewal on the canvas, creating artworks that seem to glow from within.',
    temperature: 5000,
    colors: ['#FFFFFF', '#FFD700', '#FF6347', '#DC143C', '#8B0000'],
    intensity: 8,
    unlockLevel: 5,
    icon: '🦅',
  },
  {
    id: 'dragon_breath',
    name: 'Dragon Breath',
    description:
      'A fierce, concentrated torrent of dragon fire. Produces deep oranges and reds with occasional bursts of green, creating powerful and dramatic strokes that dominate any composition.',
    temperature: 7200,
    colors: ['#FFFF00', '#FF6600', '#CC3300', '#990000', '#006600'],
    intensity: 9,
    unlockLevel: 10,
    icon: '🐉',
  },
  {
    id: 'inferno',
    name: 'Inferno',
    description:
      'An all-consuming wildfire that spreads across the canvas with intense heat. Mixes every warm color into a chaotic but beautiful blaze, ideal for large-scale abstract works.',
    temperature: 10000,
    colors: ['#FF4500', '#FF0000', '#FF1493', '#FF00FF', '#FFD700'],
    intensity: 10,
    unlockLevel: 15,
    icon: '🌋',
  },
  {
    id: 'spirit_fire',
    name: 'Spirit Fire',
    description:
      'A ghostly pale flame that exists between the material and spirit worlds. Produces soft purples, lavenders, and ghostly whites, perfect for otherworldly and dreamlike compositions.',
    temperature: 2200,
    colors: ['#F8F8FF', '#E6E6FA', '#DDA0DD', '#BA55D3', '#9370DB'],
    intensity: 5,
    unlockLevel: 20,
    icon: '👻',
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    description:
      'The explosive energy of a solar eruption captured in paint. Blinding whites, electric yellows, and radiation greens create artworks that pulse with stellar power and cosmic energy.',
    temperature: 15000,
    colors: ['#FFFFFF', '#FFFACD', '#FFFF00', '#7FFF00', '#00FF00'],
    intensity: 10,
    unlockLevel: 28,
    icon: '☀️',
  },
  {
    id: 'dark_flame',
    name: 'Dark Flame',
    description:
      'A paradoxical flame that consumes light rather than emitting it. Creates deep blacks, dark purples, and smoky grays that can be used for shadow, negative space, and dramatic contrast.',
    temperature: 4000,
    colors: ['#2F2F2F', '#1C1C1C', '#0D0D0D', '#4B0082', '#191970'],
    intensity: 7,
    unlockLevel: 35,
    icon: '🌑',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: CONSTANTS — BRUSH TECHNIQUES (12)
// ═══════════════════════════════════════════════════════════════════

export const FP_BRUSH_TECHNIQUES: readonly FPBrushTechniqueDef[] = [
  {
    id: 'dab',
    name: 'Dab',
    description: 'A soft, gentle touch that applies a small amount of flame color to a single cell. Perfect for pixel-precise detail work.',
    brushSize: 1,
    opacityMultiplier: 0.8,
    specialEffect: 'Creates a soft circular gradient within the cell.',
    compatibleFlames: ['candle_flame', 'blue_fire', 'spirit_fire'],
  },
  {
    id: 'sweep',
    name: 'Sweep',
    description: 'A flowing horizontal motion that paints across 3 cells in a row. Creates smooth gradients and flowing lines.',
    brushSize: 3,
    opacityMultiplier: 0.6,
    specialEffect: 'Colors blend smoothly from left to right across affected cells.',
    compatibleFlames: ['candle_flame', 'phoenix_fire', 'spirit_fire', 'solar_flare'],
  },
  {
    id: 'splash',
    name: 'Splash',
    description: 'An explosive burst that scatters flame color across a 3×3 area with random intensity. Creates chaotic, energetic patterns.',
    brushSize: 5,
    opacityMultiplier: 0.4,
    specialEffect: 'Random cells in splash area receive varying intensity levels.',
    compatibleFlames: ['dragon_breath', 'inferno', 'solar_flare'],
  },
  {
    id: 'calligraphy',
    name: 'Calligraphy',
    description: 'A precise vertical stroke that creates elegant lines. Intensity varies based on brush direction, creating thick-thin transitions.',
    brushSize: 2,
    opacityMultiplier: 0.9,
    specialEffect: 'Top cell gets 60% intensity, bottom cell gets 100% for taper effect.',
    compatibleFlames: ['candle_flame', 'phoenix_fire', 'dark_flame'],
  },
  {
    id: 'glow',
    name: 'Glow',
    description: 'Applies a soft luminous halo around the target cell, gently tinting adjacent cells with a lighter version of the flame color.',
    brushSize: 4,
    opacityMultiplier: 0.3,
    specialEffect: 'Center cell at full intensity, surrounding cells at 30% intensity with lighter shade.',
    compatibleFlames: ['blue_fire', 'spirit_fire', 'solar_flare', 'phoenix_fire'],
  },
  {
    id: 'scorch',
    name: 'Scorch',
    description: 'An intense, focused burn that applies maximum intensity to a single cell with a darkened edge effect.',
    brushSize: 1,
    opacityMultiplier: 1.0,
    specialEffect: 'Target cell at max intensity; 4 adjacent cells get a darkened scorch mark.',
    compatibleFlames: ['dragon_breath', 'inferno', 'dark_flame'],
  },
  {
    id: 'wisps',
    name: 'Wisps',
    description: 'Creates thin, curving trails of flame that drift upward from the target cell like smoke. Affects 4 cells in an irregular pattern.',
    brushSize: 4,
    opacityMultiplier: 0.5,
    specialEffect: 'Creates diagonal wispy trails that fade in intensity toward the top.',
    compatibleFlames: ['spirit_fire', 'candle_flame', 'blue_fire'],
  },
  {
    id: 'ripple',
    name: 'Ripple',
    description: 'A circular expanding wave of flame color emanating from the target cell. Creates concentric rings of decreasing intensity.',
    brushSize: 5,
    opacityMultiplier: 0.35,
    specialEffect: 'Rings expand outward; each ring is 20% less intense than the previous.',
    compatibleFlames: ['blue_fire', 'solar_flare', 'inferno'],
  },
  {
    id: 'ember_dust',
    name: 'Ember Dust',
    description: 'Scatters tiny particles of flame across the canvas like sparks from a dying fire. Affects random cells with very low intensity.',
    brushSize: 6,
    opacityMultiplier: 0.2,
    specialEffect: '8 random cells receive a dusting of ember particles at low intensity.',
    compatibleFlames: ['candle_flame', 'dragon_breath', 'phoenix_fire', 'inferno'],
  },
  {
    id: 'plasma_stroke',
    name: 'Plasma Stroke',
    description: 'A superheated stroke that ionizes the paint, creating brilliant white cores with colored halos. One of the most powerful techniques.',
    brushSize: 3,
    opacityMultiplier: 0.95,
    specialEffect: 'Center cell turns white-hot; flanking cells get intense colored glow.',
    compatibleFlames: ['solar_flare', 'blue_fire', 'dragon_breath'],
  },
  {
    id: 'shadow_blur',
    name: 'Shadow Blur',
    description: 'A subtle technique that darkens and softens existing colors, creating depth and shadow effects. Does not add new color, modifies existing.',
    brushSize: 3,
    opacityMultiplier: 0.5,
    specialEffect: 'Reduces intensity of existing colors and adds a dark overlay.',
    compatibleFlames: ['dark_flame', 'spirit_fire'],
  },
  {
    id: 'spirit_trail',
    name: 'Spirit Trail',
    description: 'Leaves a ghostly afterimage that slowly fades across multiple cells. Creates beautiful trailing effects reminiscent of spectral movement.',
    brushSize: 5,
    opacityMultiplier: 0.45,
    specialEffect: 'Creates a trail of 5 cells with decreasing opacity, like a comet tail.',
    compatibleFlames: ['spirit_fire', 'dark_flame', 'phoenix_fire'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: CONSTANTS — COLOR PALETTE (24 flame-derived colors)
// ═══════════════════════════════════════════════════════════════════

export const FP_COLOR_PALETTE: readonly { id: string; hex: string; name: string; temperature: number; flame: FPFlameTypeId }[] = [
  { id: 'fp_c1', hex: '#FFF8DC', name: 'Ghost Candlelight', temperature: 900, flame: 'candle_flame' },
  { id: 'fp_c2', hex: '#FFE4B5', name: 'Warm Amber', temperature: 1200, flame: 'candle_flame' },
  { id: 'fp_c3', hex: '#FFD700', name: 'Molten Gold', temperature: 1800, flame: 'candle_flame' },
  { id: 'fp_c4', hex: '#E0FFFF', name: 'Ice Blue Core', temperature: 3000, flame: 'blue_fire' },
  { id: 'fp_c5', hex: '#87CEEB', name: 'Sky Flame', temperature: 3200, flame: 'blue_fire' },
  { id: 'fp_c6', hex: '#1E90FF', name: 'Deep Azure Burn', temperature: 3600, flame: 'blue_fire' },
  { id: 'fp_c7', hex: '#FFFFFF', name: 'Phoenix Ash White', temperature: 6000, flame: 'phoenix_fire' },
  { id: 'fp_c8', hex: '#FF6347', name: 'Crimson Rebirth', temperature: 4500, flame: 'phoenix_fire' },
  { id: 'fp_c9', hex: '#8B0000', name: 'Ancient Ember', temperature: 2000, flame: 'phoenix_fire' },
  { id: 'fp_c10', hex: '#FF4500', name: 'Dragon Scale', temperature: 7000, flame: 'dragon_breath' },
  { id: 'fp_c11', hex: '#CC3300', name: 'Dragon Blood', temperature: 7500, flame: 'dragon_breath' },
  { id: 'fp_c12', hex: '#006600', name: 'Dragon Venom', temperature: 6500, flame: 'dragon_breath' },
  { id: 'fp_c13', hex: '#FF1493', name: 'Inferno Rose', temperature: 9000, flame: 'inferno' },
  { id: 'fp_c14', hex: '#FF00FF', name: 'Wildfire Magenta', temperature: 9500, flame: 'inferno' },
  { id: 'fp_c15', hex: '#FF0000', name: 'Blazing Red', temperature: 10000, flame: 'inferno' },
  { id: 'fp_c16', hex: '#E6E6FA', name: 'Spirit Veil', temperature: 1500, flame: 'spirit_fire' },
  { id: 'fp_c17', hex: '#BA55D3', name: 'Medium Orchid Burn', temperature: 2000, flame: 'spirit_fire' },
  { id: 'fp_c18', hex: '#9370DB', name: 'Spectral Purple', temperature: 2500, flame: 'spirit_fire' },
  { id: 'fp_c19', hex: '#FFFF00', name: 'Solar Yellow', temperature: 12000, flame: 'solar_flare' },
  { id: 'fp_c20', hex: '#7FFF00', name: 'Chlorophyll Flare', temperature: 14000, flame: 'solar_flare' },
  { id: 'fp_c21', hex: '#00FF00', name: 'Stellar Green', temperature: 15000, flame: 'solar_flare' },
  { id: 'fp_c22', hex: '#2F2F2F', name: 'Dark Smoke', temperature: 3000, flame: 'dark_flame' },
  { id: 'fp_c23', hex: '#4B0082', name: 'Indigo Shadow', temperature: 3800, flame: 'dark_flame' },
  { id: 'fp_c24', hex: '#0D0D0D', name: 'Void Black', temperature: 4200, flame: 'dark_flame' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: CONSTANTS — ACHIEVEMENTS (15)
// ═══════════════════════════════════════════════════════════════════

export const FP_ACHIEVEMENTS: readonly FPAchievementDef[] = [
  {
    id: 'fp_ach_first_stroke',
    name: 'First Spark',
    description: 'Paint your first cell on the canvas.',
    icon: '✨',
    condition: 'totalStrokes >= 1',
    reward: '+10 XP',
    xpReward: 10,
  },
  {
    id: 'fp_ach_first_masterpiece',
    name: 'First Masterpiece',
    description: 'Save a painting with a score of 80 or higher.',
    icon: '🎨',
    condition: 'highestScore >= 80',
    reward: '+50 XP, Unlock Phoenix Fire preview',
    xpReward: 50,
  },
  {
    id: 'fp_ach_pyromancer',
    name: 'Pyromancer',
    description: 'Master any single flame type to level 10.',
    icon: '🔥',
    condition: 'anyMasteryMaxLevel',
    reward: '+100 XP, Title: Pyromancer',
    xpReward: 100,
  },
  {
    id: 'fp_ach_inferno_artist',
    name: 'Inferno Artist',
    description: 'Create 5 paintings all scoring 70 or higher.',
    icon: '🌋',
    condition: 'paintingsAbove70 >= 5',
    reward: '+75 XP',
    xpReward: 75,
  },
  {
    id: 'fp_ach_chromatic_blaze',
    name: 'Chromatic Blaze',
    description: 'Use all 24 colors in a single painting.',
    icon: '🌈',
    condition: 'uniqueColorsInPainting >= 24',
    reward: '+60 XP',
    xpReward: 60,
  },
  {
    id: 'fp_ach_daily_devotee',
    name: 'Daily Devotee',
    description: 'Complete 7 daily painting themes in a row.',
    icon: '📅',
    condition: 'dailyStreak >= 7',
    reward: '+80 XP, Title: Devoted Painter',
    xpReward: 80,
  },
  {
    id: 'fp_ach_gallery_filled',
    name: 'Gallery Filled',
    description: 'Save 30 paintings to your art gallery.',
    icon: '🖼️',
    condition: 'gallerySize >= 30',
    reward: '+90 XP',
    xpReward: 90,
  },
  {
    id: 'fp_ach_all_flames',
    name: 'Flame Collector',
    description: 'Unlock all 8 flame types.',
    icon: '🔥',
    condition: 'flamesUnlocked >= 8',
    reward: '+120 XP, Title: Flame Collector',
    xpReward: 120,
  },
  {
    id: 'fp_ach_commission_pro',
    name: 'Commission Pro',
    description: 'Complete 10 art commissions successfully.',
    icon: '💼',
    condition: 'commissionsCompleted >= 10',
    reward: '+100 XP, Title: Master Artisan',
    xpReward: 100,
  },
  {
    id: 'fp_ach_ghost_painter',
    name: 'Ghost Painter',
    description: 'Create a painting using only Spirit Fire and Dark Flame.',
    icon: '👻',
    condition: 'usedOnlySpiritAndDark',
    reward: '+70 XP',
    xpReward: 70,
  },
  {
    id: 'fp_ach_solar_master',
    name: 'Solar Master',
    description: 'Reach mastery level 8 with Solar Flare.',
    icon: '☀️',
    condition: 'solarFlareMastery >= 8',
    reward: '+110 XP, Title: Solar Artisan',
    xpReward: 110,
  },
  {
    id: 'fp_ach_centurion',
    name: 'Centurion Painter',
    description: 'Make 100 total paint strokes.',
    icon: '💯',
    condition: 'totalStrokes >= 100',
    reward: '+40 XP',
    xpReward: 40,
  },
  {
    id: 'fp_ach_perfect_score',
    name: 'Perfect Canvas',
    description: 'Achieve a perfect score of 100 on any painting.',
    icon: '⭐',
    condition: 'highestScore >= 100',
    reward: '+200 XP, Title: Perfect Flame',
    xpReward: 200,
  },
  {
    id: 'fp_ach_technique_master',
    name: 'Technique Master',
    description: 'Use all 12 brush techniques in a single painting session.',
    icon: '🖌️',
    condition: 'techniquesUsedInSession >= 12',
    reward: '+85 XP',
    xpReward: 85,
  },
  {
    id: 'fp_ach_dark_virtuoso',
    name: 'Dark Virtuoso',
    description: 'Reach mastery level 10 with Dark Flame.',
    icon: '🌑',
    condition: 'darkFlameMastery >= 10',
    reward: '+150 XP, Title: Dark Virtuoso',
    xpReward: 150,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: CONSTANTS — NPC COMMISSIONS (10)
// ═══════════════════════════════════════════════════════════════════

export const FP_COMMISSION_TEMPLATES: readonly Omit<FPCommission, 'accepted' | 'completed' | 'acceptedAt' | 'completedAt'>[] = [
  {
    id: 'fp_comm_1',
    npcName: 'Elder Flamekeeper',
    request: 'Sunrise Horizon',
    description: 'Paint a warm sunrise using Candle Flame and Phoenix Fire with smooth gradient transitions across the canvas.',
    requiredFlameTypes: ['candle_flame', 'phoenix_fire'],
    minScore: 50,
    reward: 200,
    xpReward: 40,
  },
  {
    id: 'fp_comm_2',
    npcName: 'Mystic Seer',
    request: 'Ethereal Dreamscape',
    description: 'Create an otherworldly dreamscape using Spirit Fire and Blue Fire. Focus on soft, glowing colors with mystical atmosphere.',
    requiredFlameTypes: ['spirit_fire', 'blue_fire'],
    minScore: 55,
    reward: 250,
    xpReward: 50,
  },
  {
    id: 'fp_comm_3',
    npcName: 'Dragon Tamer',
    request: 'Dragon\'s Fury',
    description: 'A powerful, aggressive painting using Dragon Breath. Show the raw power and ferocity of dragon fire with bold strokes.',
    requiredFlameTypes: ['dragon_breath'],
    minScore: 60,
    reward: 300,
    xpReward: 60,
  },
  {
    id: 'fp_comm_4',
    npcName: 'Solar Priestess',
    request: 'Coronal Eruption',
    description: 'Capture the magnificence of a solar flare using Solar Flare and Inferno. The canvas should radiate cosmic energy.',
    requiredFlameTypes: ['solar_flare', 'inferno'],
    minScore: 65,
    reward: 400,
    xpReward: 80,
  },
  {
    id: 'fp_comm_5',
    npcName: 'Shadow Archon',
    request: 'Void Between Stars',
    description: 'Create a dark, haunting void using Dark Flame and Spirit Fire. Evoke the emptiness and mystery of deep space.',
    requiredFlameTypes: ['dark_flame', 'spirit_fire'],
    minScore: 55,
    reward: 280,
    xpReward: 55,
  },
  {
    id: 'fp_comm_6',
    npcName: 'Phoenix Elder',
    request: 'Cycle of Rebirth',
    description: 'Depict the eternal cycle of death and renewal using Phoenix Fire across multiple intensities on the canvas.',
    requiredFlameTypes: ['phoenix_fire'],
    minScore: 70,
    reward: 350,
    xpReward: 70,
  },
  {
    id: 'fp_comm_7',
    npcName: 'Infernal Artisan',
    request: 'Cascading Wildfire',
    description: 'Paint an unstoppable wildfire using Inferno and Dragon Breath. Make the fire feel alive and spreading.',
    requiredFlameTypes: ['inferno', 'dragon_breath'],
    minScore: 60,
    reward: 320,
    xpReward: 65,
  },
  {
    id: 'fp_comm_8',
    npcName: 'Candle Maker',
    request: 'A Thousand Candles',
    description: 'A serene, warm scene painted entirely with Candle Flame. Create intimacy and gentle warmth using subtle variations.',
    requiredFlameTypes: ['candle_flame'],
    minScore: 45,
    reward: 180,
    xpReward: 35,
  },
  {
    id: 'fp_comm_9',
    npcName: 'Cosmic Observer',
    request: 'Nebula Birth',
    description: 'Combine Solar Flare and Blue Fire to paint a forming nebula. Use plasma strokes and glow techniques for stellar effects.',
    requiredFlameTypes: ['solar_flare', 'blue_fire'],
    minScore: 70,
    reward: 450,
    xpReward: 90,
  },
  {
    id: 'fp_comm_10',
    npcName: 'Flame Oracle',
    request: 'Elemental Harmony',
    description: 'Use at least 4 different flame types to create a harmonious painting that showcases the full spectrum of fire art.',
    requiredFlameTypes: ['candle_flame', 'blue_fire', 'phoenix_fire', 'dragon_breath'],
    minScore: 75,
    reward: 500,
    xpReward: 100,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: CONSTANTS — DAILY THEMES (14 themes, rotated)
// ═══════════════════════════════════════════════════════════════════

export const FP_DAILY_THEMES: readonly Omit<FPDailyTheme, 'date' | 'completed'>[] = [
  {
    id: 'fp_dt_sunrise',
    name: 'Golden Sunrise',
    description: 'Paint a breathtaking sunrise with warm gradient colors spreading across the horizon.',
    suggestedFlames: ['candle_flame', 'phoenix_fire'],
    bonusMultiplier: 1.5,
  },
  {
    id: 'fp_dt_ocean_night',
    name: 'Ocean at Night',
    description: 'Capture the mysterious beauty of the ocean under moonlight using cool flame tones.',
    suggestedFlames: ['blue_fire', 'spirit_fire'],
    bonusMultiplier: 1.5,
  },
  {
    id: 'fp_dt_volcano',
    name: 'Erupting Volcano',
    description: 'Depict the raw power of a volcanic eruption with dramatic reds and oranges.',
    suggestedFlames: ['dragon_breath', 'inferno'],
    bonusMultiplier: 1.8,
  },
  {
    id: 'fp_dt_spirit_world',
    name: 'Spirit World Portal',
    description: 'Create a portal to the spirit realm using ethereal ghostly flames and shadow.',
    suggestedFlames: ['spirit_fire', 'dark_flame'],
    bonusMultiplier: 1.6,
  },
  {
    id: 'fp_dt_solar_system',
    name: 'Solar System',
    description: 'Paint our solar system with the blazing sun at center and orbiting planets.',
    suggestedFlames: ['solar_flare', 'blue_fire'],
    bonusMultiplier: 2.0,
  },
  {
    id: 'fp_dt_phoenix_rebirth',
    name: 'Phoenix Rebirth',
    description: 'Illustrate the moment a phoenix rises from its own ashes in a burst of flame.',
    suggestedFlames: ['phoenix_fire', 'inferno'],
    bonusMultiplier: 1.7,
  },
  {
    id: 'fp_dt_dragon_lair',
    name: 'Dragon\'s Lair',
    description: 'Paint the treasure-filled lair of an ancient dragon, illuminated by its fiery breath.',
    suggestedFlames: ['dragon_breath', 'candle_flame'],
    bonusMultiplier: 1.6,
  },
  {
    id: 'fp_dt_aurora',
    name: 'Flame Aurora',
    description: 'Create a breathtaking aurora made entirely of dancing flames in the night sky.',
    suggestedFlames: ['spirit_fire', 'solar_flare', 'blue_fire'],
    bonusMultiplier: 2.0,
  },
  {
    id: 'fp_dt_ember_forest',
    name: 'Ember Forest',
    description: 'A forest where the trees burn eternally without being consumed, painted in warm autumn tones.',
    suggestedFlames: ['candle_flame', 'phoenix_fire', 'dragon_breath'],
    bonusMultiplier: 1.5,
  },
  {
    id: 'fp_dt_void_gate',
    name: 'Gate to the Void',
    description: 'Paint a dark gateway to nothingness, framed by eerie dark flames and spectral light.',
    suggestedFlames: ['dark_flame', 'spirit_fire'],
    bonusMultiplier: 1.8,
  },
  {
    id: 'fp_dt_fireworks',
    name: 'Flame Fireworks',
    description: 'A celebration of fire! Paint exploding fireworks across a night sky using multiple flame types.',
    suggestedFlames: ['inferno', 'solar_flare', 'phoenix_fire'],
    bonusMultiplier: 1.9,
  },
  {
    id: 'fp_dt_candle_vigil',
    name: 'Candlelight Vigil',
    description: 'A quiet, solemn scene lit only by dozens of candles. Focus on subtle warm tones and gentle shadows.',
    suggestedFlames: ['candle_flame', 'dark_flame'],
    bonusMultiplier: 1.4,
  },
  {
    id: 'fp_dt_plasma_storm',
    name: 'Plasma Storm',
    description: 'A violent electromagnetic storm rendered in superheated plasma colors and electric blues.',
    suggestedFlames: ['solar_flare', 'blue_fire', 'inferno'],
    bonusMultiplier: 2.0,
  },
  {
    id: 'fp_dt_dreamscape',
    name: 'Burning Dreamscape',
    description: 'A surreal dreamscape where reality bends and everything is made of living flame.',
    suggestedFlames: ['spirit_fire', 'phoenix_fire', 'dark_flame'],
    bonusMultiplier: 1.7,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════

const FP_GRID_ROWS = 6
const FP_GRID_COLS = 6
const FP_MAX_GALLERY_SIZE = 30
const FP_MAX_PLAYER_LEVEL = 40
const FP_MAX_MASTERY_LEVEL = 10
const FP_MAX_HISTORY = 50

function fpDeepCloneCanvas(canvas: FPCanvas): FPCanvas {
  return {
    rows: canvas.rows,
    cols: canvas.cols,
    cells: canvas.cells.map(row =>
      row.map(cell => ({
        row: cell.row,
        col: cell.col,
        color: cell.color,
        flameType: cell.flameType,
        intensity: cell.intensity,
        technique: cell.technique,
        layers: cell.layers.map(l => ({ ...l })),
      }))
    ),
  }
}

function fpCreateEmptyCanvas(): FPCanvas {
  const cells: FPPaintCell[][] = []
  for (let r = 0; r < FP_GRID_ROWS; r++) {
    const row: FPPaintCell[] = []
    for (let c = 0; c < FP_GRID_COLS; c++) {
      row.push({
        row: r,
        col: c,
        color: '',
        flameType: 'candle_flame',
        intensity: 0,
        technique: 'dab',
        layers: [],
      })
    }
    cells.push(row)
  }
  return { rows: FP_GRID_ROWS, cols: FP_GRID_COLS, cells }
}

function fpXpForPlayerLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= FP_MAX_PLAYER_LEVEL) return Infinity
  return Math.floor(120 * Math.pow(1.12, level) + level * 20)
}

function fpXpForMasteryLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= FP_MAX_MASTERY_LEVEL) return Infinity
  return Math.floor(50 * Math.pow(1.25, level) + level * 8)
}

function fpLevelFromXp(totalXp: number, maxXpFn: (lv: number) => number, maxLv: number): number {
  let level = 1
  let remaining = totalXp
  while (level < maxLv) {
    const needed = maxXpFn(level)
    if (remaining < needed) break
    remaining -= needed
    level++
  }
  return level
}

function fpGenerateId(): string {
  return `fp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function fpGetFlameTypeDef(id: FPFlameTypeId): FPFlameTypeDef | undefined {
  return FP_FLAME_TYPES.find(f => f.id === id)
}

function fpGetBrushTechDef(id: FPBrushTechniqueId): FPBrushTechniqueDef | undefined {
  return FP_BRUSH_TECHNIQUES.find(b => b.id === id)
}

function fpHexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return null
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return { r, g, b }
}

function fpRgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`
}

function internalLightenColor(hex: string, factor: number): string {
  const rgb = fpHexToRgb(hex)
  if (!rgb) return hex
  return fpRgbToHex(
    rgb.r + (255 - rgb.r) * factor,
    rgb.g + (255 - rgb.g) * factor,
    rgb.b + (255 - rgb.b) * factor
  )
}

function internalDarkenColor(hex: string, factor: number): string {
  const rgb = fpHexToRgb(hex)
  if (!rgb) return hex
  return fpRgbToHex(rgb.r * (1 - factor), rgb.g * (1 - factor), rgb.b * (1 - factor))
}

function fpBlendHexColors(hex1: string, hex2: string, ratio: number): string {
  const c1 = fpHexToRgb(hex1)
  const c2 = fpHexToRgb(hex2)
  if (!c1 || !c2) return hex1
  return fpRgbToHex(
    c1.r * (1 - ratio) + c2.r * ratio,
    c1.g * (1 - ratio) + c2.g * ratio,
    c1.b * (1 - ratio) + c2.b * ratio
  )
}

function internalColorDistance(hex1: string, hex2: string): number {
  const c1 = fpHexToRgb(hex1)
  const c2 = fpHexToRgb(hex2)
  if (!c1 || !c2) return 999
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2)
  )
}

function fpIsValidCell(row: number, col: number): boolean {
  return row >= 0 && row < FP_GRID_ROWS && col >= 0 && col < FP_GRID_COLS
}

function internalGetAdjacentCells(row: number, col: number): Array<{ row: number; col: number }> {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  return dirs
    .map(([dr, dc]) => ({ row: row + dr, col: col + dc }))
    .filter(c => fpIsValidCell(c.row, c.col))
}

function fpGetSurroundingCells(row: number, col: number, radius: number): Array<{ row: number; col: number; dist: number }> {
  const result: Array<{ row: number; col: number; dist: number }> = []
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (dr === 0 && dc === 0) continue
      const r = row + dr
      const c = col + dc
      if (fpIsValidCell(r, c)) {
        result.push({ row: r, col: c, dist: Math.abs(dr) + Math.abs(dc) })
      }
    }
  }
  return result.sort((a, b) => a.dist - b.dist)
}

function fpGetTodayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fpGetDailyThemeForToday(): Omit<FPDailyTheme, 'completed'> & { date: string } {
  const themes = FP_DAILY_THEMES
  const today = new Date()
  const dayIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 24)) % themes.length
  const theme = themes[dayIndex]
  return {
    ...theme,
    date: fpGetTodayDateString(),
  }
}

function fpCreateInitialFlameMastery(): Record<FPFlameTypeId, FPFlameMastery> {
  const mastery: Record<string, FPFlameMastery> = {}
  for (const ft of FP_FLAME_TYPES) {
    mastery[ft.id] = { flameType: ft.id, level: 1, xp: 0 }
  }
  return mastery as Record<FPFlameTypeId, FPFlameMastery>
}

function fpCreateInitialStats(): FPStats {
  return {
    totalPaintings: 0,
    totalStrokes: 0,
    totalUndo: 0,
    highestScore: 0,
    totalXP: 0,
    flamesUnlocked: 2,
    achievementsUnlocked: 0,
    commissionsCompleted: 0,
    dailyStreak: 0,
    longestStreak: 0,
    favoriteFlame: 'candle_flame',
    totalPlayTime: 0,
  }
}

function fpCalculateCoverage(canvas: FPCanvas): number {
  let painted = 0
  for (const row of canvas.cells) {
    for (const cell of row) {
      if (cell.color !== '' && cell.intensity > 0) painted++
    }
  }
  return Math.round((painted / (FP_GRID_ROWS * FP_GRID_COLS)) * 100)
}

function fpCalculateColorHarmony(canvas: FPCanvas): number {
  const colors: string[] = []
  for (const row of canvas.cells) {
    for (const cell of row) {
      if (cell.color && cell.intensity > 0) {
        colors.push(cell.color)
      }
    }
  }
  if (colors.length < 2) return 0

  const uniqueColors = Array.from(new Set(colors))
  if (uniqueColors.length === 1) return 50

  let totalDistance = 0
  let pairs = 0
  for (let i = 0; i < Math.min(colors.length, 10); i++) {
    for (let j = i + 1; j < Math.min(colors.length, 10); j++) {
      totalDistance += internalColorDistance(colors[i], colors[j])
      pairs++
    }
  }
  const avgDistance = pairs > 0 ? totalDistance / pairs : 0

  // Harmony peaks at moderate distances (not too similar, not too different)
  const harmonyScore = Math.max(0, 100 - Math.abs(avgDistance - 180) * 0.5)
  const varietyBonus = Math.min(uniqueColors.length / 6, 1) * 20
  return Math.min(100, Math.round(harmonyScore + varietyBonus))
}

function fpCalculatePatternScore(canvas: FPCanvas): number {
  let patterns = 0
  let symmetries = 0

  // Check horizontal symmetry
  for (let r = 0; r < FP_GRID_ROWS; r++) {
    for (let c = 0; c < Math.floor(FP_GRID_COLS / 2); c++) {
      const left = canvas.cells[r][c]
      const right = canvas.cells[r][FP_GRID_COLS - 1 - c]
      if (left.color && right.color && left.color === right.color) symmetries++
    }
  }

  // Check vertical symmetry
  for (let r = 0; r < Math.floor(FP_GRID_ROWS / 2); r++) {
    for (let c = 0; c < FP_GRID_COLS; c++) {
      const top = canvas.cells[r][c]
      const bottom = canvas.cells[FP_GRID_ROWS - 1 - r][c]
      if (top.color && bottom.color && top.color === bottom.color) symmetries++
    }
  }

  // Check for adjacent same-color groups (pattern detection)
  for (let r = 0; r < FP_GRID_ROWS; r++) {
    for (let c = 0; c < FP_GRID_COLS; c++) {
      if (!canvas.cells[r][c].color) continue
      for (const adj of fpGetAdjacentCells(r, c)) {
        if (canvas.cells[adj.row][adj.col].color === canvas.cells[r][c].color) {
          patterns++
        }
      }
    }
  }

  const symmetryScore = Math.min(40, (symmetries / (FP_GRID_ROWS * FP_GRID_COLS)) * 100)
  const patternScore = Math.min(40, (patterns / (FP_GRID_ROWS * FP_GRID_COLS * 4)) * 100)
  const balanceBonus = Math.min(20, fpCalculateCoverage(canvas) * 0.2)
  return Math.min(100, Math.round(symmetryScore + patternScore + balanceBonus))
}

function fpDetermineArtStyle(score: FPArtScore): FPArtStyle {
  if (score.colorHarmony > score.patternScore && score.colorHarmony > 60) {
    if (score.coverage > 60) return 'Blazing Realism'
    return 'Impressionist Embers'
  }
  if (score.patternScore > 60) {
    if (score.coverage > 70) return 'Cosmic Firestorm'
    return 'Abstract Inferno'
  }
  if (score.colorHarmony > 50 && score.coverage < 40) {
    return 'Ethereal Glow'
  }
  if (score.coverage < 30) {
    return 'Shadowed Minimalism'
  }
  if (score.colorHarmony < 30 && score.coverage > 50) {
    return 'Dark Expressionism'
  }
  return 'Spiritual Radiance'
}

function fpCalculateFullScore(canvas: FPCanvas): FPArtScore {
  const coverage = fpCalculateCoverage(canvas)
  const colorHarmony = fpCalculateColorHarmony(canvas)
  const patternScore = fpCalculatePatternScore(canvas)

  const total = Math.round(
    coverage * 0.3 + colorHarmony * 0.4 + patternScore * 0.3
  )

  const score: FPArtScore = { total, colorHarmony, coverage, patternScore, artStyle: 'Impressionist Embers' }
  score.artStyle = fpDetermineArtStyle(score)
  return score
}

function fpGetUniqueColors(canvas: FPCanvas): string[] {
  const colors = new Set<string>()
  for (const row of canvas.cells) {
    for (const cell of row) {
      if (cell.color) colors.add(cell.color)
    }
  }
  return Array.from(colors)
}

function fpGetFlameTypesUsed(canvas: FPCanvas): FPFlameTypeId[] {
  const types = new Set<FPFlameTypeId>()
  for (const row of canvas.cells) {
    for (const cell of row) {
      if (cell.color) types.add(cell.flameType)
    }
  }
  return Array.from(types)
}

function fpApplyBrushTechnique(
  canvas: FPCanvas,
  row: number,
  col: number,
  flameType: FPFlameTypeId,
  color: string,
  technique: FPBrushTechniqueId,
  masteryLevel: number
): { newCanvas: FPCanvas; cellsAffected: Array<{ row: number; col: number }> } {
  const newCanvas = fpDeepCloneCanvas(canvas)
  const tech = fpGetBrushTechDef(technique)
  const flameDef = fpGetFlameTypeDef(flameType)
  const intensityMod = 1 + (masteryLevel - 1) * 0.05
  const affected: Array<{ row: number; col: number }> = []

  if (!tech || !flameDef) {
    return { newCanvas, cellsAffected: affected }
  }

  const baseIntensity = Math.min(100, Math.round(flameDef.intensity * 10 * tech.opacityMultiplier * intensityMod))

  const paintCell = (r: number, c: number, paintColor: string, paintIntensity: number) => {
    if (!fpIsValidCell(r, c)) return
    const cell = newCanvas.cells[r][c]
    const existingColor = cell.color
    let finalColor = paintColor
    let finalIntensity = Math.min(100, paintIntensity)

    if (existingColor) {
      finalColor = fpBlendHexColors(existingColor, paintColor, 0.4)
      finalIntensity = Math.min(100, Math.round(cell.intensity + paintIntensity * 0.5))
    }

    cell.color = finalColor
    cell.flameType = flameType
    cell.intensity = finalIntensity
    cell.technique = technique
    cell.layers.push({ color: paintColor, flameType, intensity: paintIntensity })
    if (cell.layers.length > 5) cell.layers.shift()
    affected.push({ row: r, col: c })
  }

  switch (technique) {
    case 'dab':
      paintCell(row, col, color, baseIntensity)
      break

    case 'sweep':
      for (let dc = -1; dc <= 1; dc++) {
        const sweepIntensity = baseIntensity * (1 - Math.abs(dc) * 0.2)
        const sweepColor = fpLightenColor(color, Math.abs(dc) * 0.1)
        paintCell(row, col + dc, sweepColor, sweepIntensity)
      }
      break

    case 'splash':
      paintCell(row, col, color, baseIntensity)
      for (const sur of fpGetSurroundingCells(row, col, 1)) {
        if (sur.dist <= 2 && Math.random() > 0.3) {
          const splashIntensity = baseIntensity * (1 - sur.dist * 0.25) * Math.random()
          paintCell(sur.row, sur.col, fpLightenColor(color, sur.dist * 0.1), splashIntensity)
        }
      }
      break

    case 'calligraphy':
      paintCell(row, col, fpLightenColor(color, 0.2), baseIntensity * 0.6)
      if (fpIsValidCell(row + 1, col)) {
        paintCell(row + 1, col, color, baseIntensity)
      }
      break

    case 'glow':
      paintCell(row, col, fpLightenColor(color, 0.5), baseIntensity)
      for (const sur of fpGetSurroundingCells(row, col, 1)) {
        if (sur.dist <= 1) {
          paintCell(sur.row, sur.col, fpLightenColor(color, 0.7), baseIntensity * 0.3)
        }
      }
      break

    case 'scorch':
      paintCell(row, col, color, Math.min(100, baseIntensity * 1.2))
      for (const adj of fpGetAdjacentCells(row, col)) {
        paintCell(adj.row, adj.col, fpDarkenColor(color, 0.4), baseIntensity * 0.3)
      }
      break

    case 'wisps': {
      paintCell(row, col, color, baseIntensity * 0.5)
      const wispDirs = [[-1, 0], [-1, 1], [-2, 0], [-2, -1]]
      for (let i = 0; i < wispDirs.length; i++) {
        const [dr, dc] = wispDirs[i]
        const wispIntensity = baseIntensity * (1 - (i + 1) * 0.2)
        const wispColor = fpLightenColor(color, (i + 1) * 0.15)
        paintCell(row + dr, col + dc, wispColor, wispIntensity)
      }
      break
    }

    case 'ripple':
      paintCell(row, col, color, baseIntensity)
      for (const sur of fpGetSurroundingCells(row, col, 2)) {
        const ringIntensity = baseIntensity * Math.max(0, 1 - sur.dist * 0.2)
        if (ringIntensity > 0) {
          paintCell(sur.row, sur.col, fpLightenColor(color, sur.dist * 0.12), ringIntensity)
        }
      }
      break

    case 'ember_dust': {
      paintCell(row, col, color, baseIntensity * 0.4)
      const allCells: Array<{ row: number; col: number }> = []
      for (let r = 0; r < FP_GRID_ROWS; r++) {
        for (let c = 0; c < FP_GRID_COLS; c++) {
          allCells.push({ row: r, col: c })
        }
      }
      const shuffled = allCells.sort(() => Math.random() - 0.5).slice(0, 7)
      for (const target of shuffled) {
        paintCell(target.row, target.col, fpLightenColor(color, Math.random() * 0.3), baseIntensity * 0.15 * Math.random())
      }
      break
    }

    case 'plasma_stroke':
      paintCell(row, col, '#FFFFFF', Math.min(100, baseIntensity * 1.1))
      if (fpIsValidCell(row, col - 1)) {
        paintCell(row, col - 1, color, baseIntensity * 0.85)
      }
      if (fpIsValidCell(row, col + 1)) {
        paintCell(row, col + 1, color, baseIntensity * 0.85)
      }
      break

    case 'shadow_blur':
      for (const sur of fpGetSurroundingCells(row, col, 1)) {
        if (sur.dist <= 1) {
          const cell = newCanvas.cells[sur.row][sur.col]
          if (cell.color) {
            cell.color = fpDarkenColor(cell.color, 0.3)
            cell.intensity = Math.max(0, Math.round(cell.intensity * 0.7))
            affected.push({ row: sur.row, col: sur.col })
          }
        }
      }
      break

    case 'spirit_trail': {
      const trailPositions = [
        { row, col },
        { row, col: col - 1 },
        { row: row - 1, col: col - 1 },
        { row: row - 1, col },
        { row: row - 1, col: col + 1 },
      ]
      for (let i = 0; i < trailPositions.length; i++) {
        const tp = trailPositions[i]
        const trailIntensity = baseIntensity * (1 - i * 0.18)
        const trailColor = fpLightenColor(color, i * 0.1)
        paintCell(tp.row, tp.col, trailColor, trailIntensity)
      }
      break
    }

    default:
      paintCell(row, col, color, baseIntensity)
  }

  return { newCanvas, cellsAffected: affected }
}

function fpCheckAchievementConditions(state: FlamePainterState): string[] {
  const newAch: string[] = []
  const earned = new Set(state.achievements)

  for (const ach of FP_ACHIEVEMENTS) {
    if (earned.has(ach.id)) continue
    let unlocked = false

    switch (ach.id) {
      case 'fp_ach_first_stroke':
        unlocked = state.stats.totalStrokes >= 1
        break
      case 'fp_ach_first_masterpiece':
        unlocked = state.stats.highestScore >= 80
        break
      case 'fp_ach_pyromancer':
        unlocked = Object.values(state.flameMastery).some(m => m.level >= FP_MAX_MASTERY_LEVEL)
        break
      case 'fp_ach_inferno_artist': {
        const highScores = state.gallery.filter(g => g.score >= 70).length
        unlocked = highScores >= 5
        break
      }
      case 'fp_ach_chromatic_blaze': {
        const lastCanvas = state.canvas
        const uniqueColors = fpGetUniqueColors(lastCanvas)
        unlocked = uniqueColors.length >= 24
        break
      }
      case 'fp_ach_daily_devotee':
        unlocked = state.stats.dailyStreak >= 7
        break
      case 'fp_ach_gallery_filled':
        unlocked = state.gallery.length >= FP_MAX_GALLERY_SIZE
        break
      case 'fp_ach_all_flames':
        unlocked = state.stats.flamesUnlocked >= FP_FLAME_TYPES.length
        break
      case 'fp_ach_commission_pro':
        unlocked = state.stats.commissionsCompleted >= 10
        break
      case 'fp_ach_ghost_painter': {
        const used = fpGetFlameTypesUsed(state.canvas)
        unlocked = used.length > 0 && used.every(f => f === 'spirit_fire' || f === 'dark_flame')
        break
      }
      case 'fp_ach_solar_master':
        unlocked = state.flameMastery.solar_flare.level >= 8
        break
      case 'fp_ach_centurion':
        unlocked = state.stats.totalStrokes >= 100
        break
      case 'fp_ach_perfect_score':
        unlocked = state.stats.highestScore >= 100
        break
      case 'fp_ach_technique_master': {
        const techniques = new Set<string>()
        for (const row of state.canvas.cells) {
          for (const cell of row) {
            if (cell.color) techniques.add(cell.technique)
          }
        }
        unlocked = techniques.size >= 12
        break
      }
      case 'fp_ach_dark_virtuoso':
        unlocked = state.flameMastery.dark_flame.level >= FP_MAX_MASTERY_LEVEL
        break
    }

    if (unlocked) newAch.push(ach.id)
  }
  return newAch
}

function fpUpdateFlameUsageStats(state: FlamePainterState, flameType: FPFlameTypeId): FPStats {
  // Track favorite flame by incrementing an implicit counter (use simple heuristic)
  return {
    ...state.stats,
    favoriteFlame: flameType,
  }
}

function fpGetArtistTitleForLevel(level: number): string {
  if (level >= 38) return 'Legendary Flame Archon'
  if (level >= 34) return 'Grand Master Painter'
  if (level >= 28) return 'Eminent Flame Artist'
  if (level >= 22) return 'Master Artisan'
  if (level >= 16) return 'Adept Painter'
  if (level >= 10) return 'Apprentice Artist'
  if (level >= 5) return 'Novice Painter'
  return 'Fledgling Spark'
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: EXPORTED PURE FUNCTIONS (60+)
// ═══════════════════════════════════════════════════════════════════

/** Create the initial game state */
export function fpInitialState(): FlamePainterState {
  return {
    canvas: fpCreateEmptyCanvas(),
    activeFlameType: 'candle_flame',
    activeBrushTechnique: 'dab',
    activeColor: '#FFD700',
    gallery: [],
    flameMastery: fpCreateInitialFlameMastery(),
    playerLevel: 1,
    playerXP: 0,
    playerTitle: 'Fledgling Spark',
    achievements: [],
    commissions: FP_COMMISSION_TEMPLATES.map(t => ({
      ...t,
      accepted: false,
      completed: false,
      acceptedAt: null,
      completedAt: null,
    })),
    dailyTheme: { ...fpGetDailyThemeForToday(), completed: false },
    paintHistory: [fpCreateEmptyCanvas()],
    historyIndex: 0,
    tutorialStep: 0,
    stats: fpCreateInitialStats(),
  }
}

/** Retrieve state (identity function for wire pattern compatibility) */
export function fpGetState(state: FlamePainterState): FlamePainterState {
  return state
}

/** Reset all state to initial values */
export function fpResetState(): FlamePainterState {
  return fpInitialState()
}

/** Validate a canvas cell coordinate */
export function fpValidateCell(row: number, col: number): boolean {
  return fpIsValidCell(row, col)
}

/** Get adjacent cells for a given position */
export function fpGetAdjacentCells(row: number, col: number): Array<{ row: number; col: number }> {
  return internalGetAdjacentCells(row, col)
}

/** Get the current canvas from state */
export function fpGetCanvas(state: FlamePainterState): FPCanvas {
  return state.canvas
}

/** Select a flame type */
export function fpSelectFlame(state: FlamePainterState, flameType: FPFlameTypeId): FlamePainterState {
  const def = fpGetFlameTypeDef(flameType)
  if (!def) return state
  const color = def.colors[Math.floor(def.colors.length / 2)]
  return { ...state, activeFlameType: flameType, activeColor: color }
}

/** Select a brush technique */
export function fpSelectBrush(state: FlamePainterState, technique: FPBrushTechniqueId): FlamePainterState {
  const def = fpGetBrushTechDef(technique)
  if (!def) return state
  return { ...state, activeBrushTechnique: technique }
}

/** Select a specific color from the palette */
export function fpSelectColor(state: FlamePainterState, color: string): FlamePainterState {
  return { ...state, activeColor: color }
}

/** Apply paint to a cell (returns new state) */
export function fpPaint(state: FlamePainterState, row: number, col: number): FlamePainterState {
  return fpPaintWithFlame(state, row, col, state.activeFlameType)
}

/** Apply paint with specific flame type (returns new state) */
export function fpPaintWithFlame(state: FlamePainterState, row: number, col: number, flameType: FPFlameTypeId): FlamePainterState {
  if (!fpIsValidCell(row, col)) return state

  const mastery = state.flameMastery[flameType]
  const result = fpApplyBrushTechnique(
    state.canvas,
    row,
    col,
    flameType,
    state.activeColor,
    state.activeBrushTechnique,
    mastery.level
  )

  const newXPHarvested = result.cellsAffected.length * 2
  const newMasteryXp = mastery.xp + result.cellsAffected.length * 3
  const newMasteryLevel = fpLevelFromXp(newMasteryXp, fpXpForMasteryLevel, FP_MAX_MASTERY_LEVEL)

  const updatedMastery = {
    ...state.flameMastery,
    [flameType]: {
      ...mastery,
      xp: newMasteryXp,
      level: newMasteryLevel,
    },
  }

  const newHistory = state.paintHistory.slice(0, state.historyIndex + 1)
  newHistory.push(result.newCanvas)
  if (newHistory.length > FP_MAX_HISTORY) newHistory.shift()

  const newState: FlamePainterState = {
    ...state,
    canvas: result.newCanvas,
    flameMastery: updatedMastery,
    playerXP: state.playerXP + newXPHarvested,
    paintHistory: newHistory,
    historyIndex: Math.min(newHistory.length - 1, state.historyIndex + 1),
    stats: {
      ...fpUpdateFlameUsageStats(state, flameType),
      totalStrokes: state.stats.totalStrokes + 1,
      totalXP: state.stats.totalXP + newXPHarvested,
    },
  }

  const newLevel = fpLevelFromXp(newState.playerXP, fpXpForPlayerLevel, FP_MAX_PLAYER_LEVEL)
  if (newLevel > newState.playerLevel) {
    newState.playerLevel = newLevel
    newState.playerTitle = fpGetArtistTitleForLevel(newLevel)
  }

  return newState
}

/** Get the paint result details without mutating state */
export function fpPaintResult(
  state: FlamePainterState,
  row: number,
  col: number,
  flameType: FPFlameTypeId
): FPPaintResult {
  if (!fpIsValidCell(row, col)) {
    return { success: false, canvas: state.canvas, message: 'Invalid cell position', cellsAffected: [], xpGained: 0 }
  }

  const mastery = state.flameMastery[flameType]
  const result = fpApplyBrushTechnique(
    state.canvas, row, col, flameType, state.activeColor, state.activeBrushTechnique, mastery.level
  )

  return {
    success: true,
    canvas: result.newCanvas,
    message: `Painted ${result.cellsAffected.length} cell(s) with ${flameType}`,
    cellsAffected: result.cellsAffected,
    xpGained: result.cellsAffected.length * 2,
  }
}

/** Apply brush effect to a cell (lower-level paint function) */
export function fpApplyBrushEffect(
  canvas: FPCanvas,
  row: number,
  col: number,
  flameType: FPFlameTypeId,
  color: string,
  technique: FPBrushTechniqueId,
  masteryLevel: number
): { newCanvas: FPCanvas; cellsAffected: Array<{ row: number; col: number }> } {
  return fpApplyBrushTechnique(canvas, row, col, flameType, color, technique, masteryLevel)
}

/** Clear the entire canvas */
export function fpClearCanvas(state: FlamePainterState): FlamePainterState {
  const empty = fpCreateEmptyCanvas()
  const newHistory = state.paintHistory.slice(0, state.historyIndex + 1)
  newHistory.push(empty)
  if (newHistory.length > FP_MAX_HISTORY) newHistory.shift()
  return {
    ...state,
    canvas: empty,
    paintHistory: newHistory,
    historyIndex: Math.min(newHistory.length - 1, state.historyIndex + 1),
  }
}

/** Save the current painting to the gallery */
export function fpSavePainting(state: FlamePainterState, name: string): FlamePainterState {
  if (state.gallery.length >= FP_MAX_GALLERY_SIZE) return state

  const score = fpCalculateFullScore(state.canvas)
  const flameTypesUsed = fpGetFlameTypesUsed(state.canvas)
  const entry: FPGalleryEntry = {
    id: fpGenerateId(),
    name: name || 'Untitled',
    canvas: fpDeepCloneCanvas(state.canvas),
    score: score.total,
    artStyle: score.artStyle,
    flameTypesUsed,
    createdAt: Date.now(),
  }

  const newGallery = [...state.gallery, entry]
  const highestScore = Math.max(state.stats.highestScore, score.total)

  const newState: FlamePainterState = {
    ...state,
    gallery: newGallery,
    stats: {
      ...state.stats,
      totalPaintings: state.stats.totalPaintings + 1,
      highestScore,
    },
  }

  const newAchievements = fpCheckAchievementConditions(newState)
  if (newAchievements.length > 0) {
    newState.achievements = [...state.achievements, ...newAchievements]
    newState.stats = {
      ...newState.stats,
      achievementsUnlocked: newState.achievements.length,
    }
  }

  return newState
}

/** Load a painting from the gallery onto the canvas */
export function fpLoadPainting(state: FlamePainterState, galleryId: string): FlamePainterState {
  const entry = state.gallery.find(g => g.id === galleryId)
  if (!entry) return state
  return {
    ...state,
    canvas: fpDeepCloneCanvas(entry.canvas),
    paintHistory: [fpDeepCloneCanvas(entry.canvas)],
    historyIndex: 0,
  }
}

/** Delete a painting from the gallery */
export function fpDeletePainting(state: FlamePainterState, galleryId: string): FlamePainterState {
  return {
    ...state,
    gallery: state.gallery.filter(g => g.id !== galleryId),
  }
}

/** Get the gallery entries */
export function fpGetGallery(state: FlamePainterState): FPGalleryEntry[] {
  return state.gallery
}

/** Get the current gallery size */
export function fpGetGallerySize(state: FlamePainterState): number {
  return state.gallery.length
}

/** Check if the gallery is full */
export function fpIsGalleryFull(state: FlamePainterState): boolean {
  return state.gallery.length >= FP_MAX_GALLERY_SIZE
}

/** Calculate the art score for the current canvas */
export function fpCalculateScore(state: FlamePainterState): FPArtScore {
  return fpCalculateFullScore(state.canvas)
}

/** Calculate just the coverage score */
export function fpGetCoverageScore(state: FlamePainterState): number {
  return fpCalculateCoverage(state.canvas)
}

/** Calculate just the color harmony score */
export function fpGetColorHarmonyScore(state: FlamePainterState): number {
  return fpCalculateColorHarmony(state.canvas)
}

/** Calculate just the pattern score */
export function fpGetPatternScore(state: FlamePainterState): number {
  return fpCalculatePatternScore(state.canvas)
}

/** Determine the art style of the current canvas */
export function fpGetArtStyle(state: FlamePainterState): FPArtStyle {
  const score = fpCalculateFullScore(state.canvas)
  return score.artStyle
}

/** Get flame mastery info for a specific flame type */
export function fpGetFlameMastery(state: FlamePainterState, flameType: FPFlameTypeId): FPFlameMastery {
  return state.flameMastery[flameType]
}

/** Get mastery level for a specific flame type */
export function fpGetFlameMasteryLevel(state: FlamePainterState, flameType: FPFlameTypeId): number {
  return state.flameMastery[flameType]?.level ?? 1
}

/** Add XP to a flame mastery (pure function) */
export function fpAddFlameXP(state: FlamePainterState, flameType: FPFlameTypeId, amount: number): FlamePainterState {
  const mastery = state.flameMastery[flameType]
  if (!mastery) return state
  const newXp = mastery.xp + amount
  const newLevel = fpLevelFromXp(newXp, fpXpForMasteryLevel, FP_MAX_MASTERY_LEVEL)
  return {
    ...state,
    flameMastery: {
      ...state.flameMastery,
      [flameType]: { ...mastery, xp: newXp, level: newLevel },
    },
  }
}

/** Get player level from state */
export function fpGetPlayerLevel(state: FlamePainterState): number {
  return state.playerLevel
}

/** Get player XP from state */
export function fpGetPlayerXP(state: FlamePainterState): number {
  return state.playerXP
}

/** Add XP to player (pure function) */
export function fpAddPlayerXP(state: FlamePainterState, amount: number): FlamePainterState {
  const newTotalXp = state.playerXP + amount
  const newLevel = fpLevelFromXp(newTotalXp, fpXpForPlayerLevel, FP_MAX_PLAYER_LEVEL)
  return {
    ...state,
    playerXP: newTotalXp,
    playerLevel: newLevel,
    playerTitle: fpGetArtistTitleForLevel(newLevel),
    stats: { ...state.stats, totalXP: state.stats.totalXP + amount },
  }
}

/** Get the player's artist title */
export function fpGetArtistTitle(state: FlamePainterState): string {
  return state.playerTitle
}

/** Check for newly unlockable achievements */
export function fpCheckAchievements(state: FlamePainterState): string[] {
  return fpCheckAchievementConditions(state)
}

/** Get all earned achievements */
export function fpGetAchievements(state: FlamePainterState): string[] {
  return state.achievements
}

/** Get achievement definition by id */
export function fpGetAchievementDef(achievementId: string): FPAchievementDef | undefined {
  return FP_ACHIEVEMENTS.find(a => a.id === achievementId)
}

/** Get achievement progress details */
export function fpGetAchievementProgress(state: FlamePainterState, achievementId: string): { current: number; target: number; label: string } {
  switch (achievementId) {
    case 'fp_ach_first_stroke':
      return { current: Math.min(1, state.stats.totalStrokes), target: 1, label: 'Strokes' }
    case 'fp_ach_first_masterpiece':
      return { current: state.stats.highestScore, target: 80, label: 'Score' }
    case 'fp_ach_pyromancer': {
      const maxMastery = Math.max(...Object.values(state.flameMastery).map(m => m.level))
      return { current: maxMastery, target: 10, label: 'Max Mastery' }
    }
    case 'fp_ach_inferno_artist':
      return { current: state.gallery.filter(g => g.score >= 70).length, target: 5, label: 'Paintings ≥70' }
    case 'fp_ach_chromatic_blaze':
      return { current: fpGetUniqueColors(state.canvas).length, target: 24, label: 'Colors Used' }
    case 'fp_ach_daily_devotee':
      return { current: state.stats.dailyStreak, target: 7, label: 'Day Streak' }
    case 'fp_ach_gallery_filled':
      return { current: state.gallery.length, target: 30, label: 'Gallery Size' }
    case 'fp_ach_all_flames':
      return { current: state.stats.flamesUnlocked, target: 8, label: 'Flames Unlocked' }
    case 'fp_ach_commission_pro':
      return { current: state.stats.commissionsCompleted, target: 10, label: 'Commissions' }
    case 'fp_ach_solar_master':
      return { current: state.flameMastery.solar_flare.level, target: 8, label: 'Solar Mastery' }
    case 'fp_ach_centurion':
      return { current: Math.min(100, state.stats.totalStrokes), target: 100, label: 'Strokes' }
    case 'fp_ach_perfect_score':
      return { current: state.stats.highestScore, target: 100, label: 'Score' }
    case 'fp_ach_technique_master': {
      const techniques = new Set<string>()
      for (const row of state.canvas.cells) {
        for (const cell of row) {
          if (cell.color) techniques.add(cell.technique)
        }
      }
      return { current: techniques.size, target: 12, label: 'Techniques Used' }
    }
    case 'fp_ach_dark_virtuoso':
      return { current: state.flameMastery.dark_flame.level, target: 10, label: 'Dark Mastery' }
    case 'fp_ach_ghost_painter': {
      const used = fpGetFlameTypesUsed(state.canvas)
      const onlyGhost = used.length > 0 && used.every(f => f === 'spirit_fire' || f === 'dark_flame')
      return { current: onlyGhost ? 1 : 0, target: 1, label: 'Ghost Only' }
    }
    default:
      return { current: 0, target: 1, label: 'Unknown' }
  }
}

/** Get the current daily theme */
export function fpGetDailyTheme(state: FlamePainterState): FPDailyTheme {
  return state.dailyTheme
}

/** Complete the daily theme challenge */
export function fpCompleteDailyTheme(state: FlamePainterState): FlamePainterState {
  if (state.dailyTheme.completed) return state

  const score = fpCalculateFullScore(state.canvas)
  const baseXP = 30
  const bonusXP = Math.round(score.total * state.dailyTheme.bonusMultiplier * 0.3)
  const totalThemeXP = baseXP + bonusXP
  const newStreak = state.stats.dailyStreak + 1
  const longestStreak = Math.max(state.stats.longestStreak, newStreak)

  const newLevel = fpLevelFromXp(
    state.playerXP + totalThemeXP,
    fpXpForPlayerLevel,
    FP_MAX_PLAYER_LEVEL
  )

  return {
    ...state,
    dailyTheme: { ...state.dailyTheme, completed: true },
    playerXP: state.playerXP + totalThemeXP,
    playerLevel: newLevel,
    playerTitle: fpGetArtistTitleForLevel(newLevel),
    stats: {
      ...state.stats,
      dailyStreak: newStreak,
      longestStreak,
      totalXP: state.stats.totalXP + totalThemeXP,
    },
  }
}

/** Get the current daily streak */
export function fpGetStreak(state: FlamePainterState): number {
  return state.stats.dailyStreak
}

/** Get the longest daily streak achieved */
export function fpGetLongestStreak(state: FlamePainterState): number {
  return state.stats.longestStreak
}

/** Get all available commissions */
export function fpGetCommissions(state: FlamePainterState): FPCommission[] {
  return state.commissions
}

/** Accept a commission */
export function fpAcceptCommission(state: FlamePainterState, commissionId: string): FlamePainterState {
  return {
    ...state,
    commissions: state.commissions.map(c =>
      c.id === commissionId ? { ...c, accepted: true, acceptedAt: Date.now() } : c
    ),
  }
}

/** Complete a commission */
export function fpCompleteCommission(state: FlamePainterState, commissionId: string): FlamePainterState {
  const commission = state.commissions.find(c => c.id === commissionId)
  if (!commission || !commission.accepted || commission.completed) return state

  const score = fpCalculateFullScore(state.canvas)
  if (score.total < commission.minScore) return state

  const usedFlames = fpGetFlameTypesUsed(state.canvas)
  const hasRequired = commission.requiredFlameTypes.every(f => usedFlames.includes(f))
  if (!hasRequired) return state

  const newLevel = fpLevelFromXp(
    state.playerXP + commission.xpReward,
    fpXpForPlayerLevel,
    FP_MAX_PLAYER_LEVEL
  )

  return {
    ...state,
    commissions: state.commissions.map(c =>
      c.id === commissionId ? { ...c, completed: true, completedAt: Date.now() } : c
    ),
    playerXP: state.playerXP + commission.xpReward,
    playerLevel: newLevel,
    playerTitle: fpGetArtistTitleForLevel(newLevel),
    stats: {
      ...state.stats,
      commissionsCompleted: state.stats.commissionsCompleted + 1,
      totalXP: state.stats.totalXP + commission.xpReward,
    },
  }
}

/** Get the reward details for a commission */
export function fpGetCommissionReward(state: FlamePainterState, commissionId: string): { gold: number; xp: number } | null {
  const commission = state.commissions.find(c => c.id === commissionId)
  if (!commission) return null
  return { gold: commission.reward, xp: commission.xpReward }
}

/** Get all 8 flame type definitions */
export function fpGetFlameTypes(): readonly FPFlameTypeDef[] {
  return FP_FLAME_TYPES
}

/** Get all 12 brush technique definitions */
export function fpGetBrushTechniques(): readonly FPBrushTechniqueDef[] {
  return FP_BRUSH_TECHNIQUES
}

/** Get the 24-color flame palette */
export function fpGetColorPalette(): readonly { id: string; hex: string; name: string; temperature: number; flame: FPFlameTypeId }[] {
  return FP_COLOR_PALETTE
}

/** Get info about a specific flame type */
export function fpGetFlameTypeInfo(flameType: FPFlameTypeId): FPFlameTypeDef | undefined {
  return fpGetFlameTypeDef(flameType)
}

/** Get info about a specific brush technique */
export function fpGetBrushTechniqueInfo(technique: FPBrushTechniqueId): FPBrushTechniqueDef | undefined {
  return fpGetBrushTechDef(technique)
}

/** Get the colors associated with a flame type */
export function fpGetFlameColor(flameType: FPFlameTypeId): string[] {
  const def = fpGetFlameTypeDef(flameType)
  return def ? [...def.colors] : []
}

/** Get the temperature of a flame type */
export function fpGetTemperature(flameType: FPFlameTypeId): number {
  const def = fpGetFlameTypeDef(flameType)
  return def?.temperature ?? 0
}

/** Get the intensity of a flame type */
export function fpGetFlameIntensity(flameType: FPFlameTypeId): number {
  const def = fpGetFlameTypeDef(flameType)
  return def?.intensity ?? 0
}

/** Blend two hex colors together */
export function fpBlendColors(hex1: string, hex2: string, ratio: number): string {
  return fpBlendHexColors(hex1, hex2, Math.max(0, Math.min(1, ratio)))
}

/** Lighten a hex color */
export function fpLightenColor(hex: string, factor: number): string {
  return internalLightenColor(hex, Math.max(0, Math.min(1, factor)))
}

/** Darken a hex color */
export function fpDarkenColor(hex: string, factor: number): string {
  return internalDarkenColor(hex, Math.max(0, Math.min(1, factor)))
}

/** Undo last paint action */
export function fpUndoPaint(state: FlamePainterState): FlamePainterState {
  if (state.historyIndex <= 0) return state
  const newIndex = state.historyIndex - 1
  return {
    ...state,
    canvas: fpDeepCloneCanvas(state.paintHistory[newIndex]),
    historyIndex: newIndex,
    stats: { ...state.stats, totalUndo: state.stats.totalUndo + 1 },
  }
}

/** Redo last undone paint action */
export function fpRedoPaint(state: FlamePainterState): FlamePainterState {
  if (state.historyIndex >= state.paintHistory.length - 1) return state
  const newIndex = state.historyIndex + 1
  return {
    ...state,
    canvas: fpDeepCloneCanvas(state.paintHistory[newIndex]),
    historyIndex: newIndex,
  }
}

/** Get the paint history */
export function fpGetHistory(state: FlamePainterState): FPCanvas[] {
  return state.paintHistory
}

/** Get current history index */
export function fpGetHistoryIndex(state: FlamePainterState): number {
  return state.historyIndex
}

/** Check if undo is available */
export function fpCanUndo(state: FlamePainterState): boolean {
  return state.historyIndex > 0
}

/** Check if redo is available */
export function fpCanRedo(state: FlamePainterState): boolean {
  return state.historyIndex < state.paintHistory.length - 1
}

/** Fill an area with the current flame color (flood fill) */
export function fpFillArea(state: FlamePainterState, row: number, col: number): FlamePainterState {
  if (!fpIsValidCell(row, col)) return state

  const newCanvas = fpDeepCloneCanvas(state.canvas)
  const targetColor = newCanvas.cells[row][col].color
  const fillColor = state.activeColor

  if (targetColor === fillColor) return state

  const visited = new Set<string>()
  const queue: Array<{ row: number; col: number }> = [{ row, col }]

  while (queue.length > 0) {
    const { row: r, col: c } = queue.shift()!
    const key = `${r},${c}`
    if (visited.has(key)) continue
    if (!fpIsValidCell(r, c)) continue
    if (newCanvas.cells[r][c].color !== targetColor) continue

    visited.add(key)
    newCanvas.cells[r][c].color = fillColor
    newCanvas.cells[r][c].flameType = state.activeFlameType
    newCanvas.cells[r][c].intensity = 80
    newCanvas.cells[r][c].technique = 'dab'
    newCanvas.cells[r][c].layers.push({ color: fillColor, flameType: state.activeFlameType, intensity: 80 })

    queue.push({ row: r - 1, col: c })
    queue.push({ row: r + 1, col: c })
    queue.push({ row: r, col: c - 1 })
    queue.push({ row: r, col: c + 1 })
  }

  const newHistory = state.paintHistory.slice(0, state.historyIndex + 1)
  newHistory.push(newCanvas)
  if (newHistory.length > FP_MAX_HISTORY) newHistory.shift()

  return {
    ...state,
    canvas: newCanvas,
    paintHistory: newHistory,
    historyIndex: Math.min(newHistory.length - 1, state.historyIndex + 1),
    stats: {
      ...state.stats,
      totalStrokes: state.stats.totalStrokes + visited.size,
    },
  }
}

/** Check if a flame type can be unlocked at the current player level */
export function fpCanUnlockFlame(state: FlamePainterState, flameType: FPFlameTypeId): boolean {
  const def = fpGetFlameTypeDef(flameType)
  if (!def) return false
  if (def.unlockLevel <= 2) return true // Already unlocked at start
  return state.playerLevel >= def.unlockLevel
}

/** Unlock a new flame type (if eligible) */
export function fpUnlockFlame(state: FlamePainterState, flameType: FPFlameTypeId): FlamePainterState {
  if (!fpCanUnlockFlame(state, flameType)) return state
  const def = fpGetFlameTypeDef(flameType)
  if (!def) return state

  const newStats = {
    ...state.stats,
    flamesUnlocked: Math.max(state.stats.flamesUnlocked, FP_FLAME_TYPES.filter(f => f.unlockLevel <= state.playerLevel).length),
  }

  const newState: FlamePainterState = {
    ...state,
    stats: newStats,
  }

  const newAchievements = fpCheckAchievementConditions(newState)
  if (newAchievements.length > 0) {
    newState.achievements = [...state.achievements, ...newAchievements]
    newState.stats = { ...newState.stats, achievementsUnlocked: newState.achievements.length }
  }

  return newState
}

/** Get total number of saved paintings */
export function fpGetTotalPaintings(state: FlamePainterState): number {
  return state.stats.totalPaintings
}

/** Get the highest score achieved */
export function fpGetBestScore(state: FlamePainterState): number {
  return state.stats.highestScore
}

/** Get the average score of all gallery paintings */
export function fpGetAverageScore(state: FlamePainterState): number {
  if (state.gallery.length === 0) return 0
  const sum = state.gallery.reduce((acc, g) => acc + g.score, 0)
  return Math.round(sum / state.gallery.length)
}

/** Get flame usage statistics from the current canvas */
export function fpGetFlameUsage(state: FlamePainterState): Record<FPFlameTypeId, number> {
  const usage: Record<string, number> = {}
  for (const ft of FP_FLAME_TYPES) {
    usage[ft.id] = 0
  }
  for (const row of state.canvas.cells) {
    for (const cell of row) {
      if (cell.color && cell.intensity > 0) {
        usage[cell.flameType] = (usage[cell.flameType] || 0) + 1
      }
    }
  }
  return usage as Record<FPFlameTypeId, number>
}

/** Get the most used flame type in the current canvas */
export function fpGetMostUsedFlame(state: FlamePainterState): FPFlameTypeId {
  const usage = fpGetFlameUsage(state)
  let maxType: FPFlameTypeId = 'candle_flame'
  let maxCount = 0
  for (const [type, count] of Object.entries(usage)) {
    if (count > maxCount) {
      maxCount = count
      maxType = type as FPFlameTypeId
    }
  }
  return maxType
}

/** Export a painting as a serializable object */
export function fpExportPainting(state: FlamePainterState): object {
  return {
    version: 1,
    canvas: state.canvas,
    score: fpCalculateFullScore(state.canvas),
    flameTypesUsed: fpGetFlameTypesUsed(state.canvas),
    exportedAt: Date.now(),
  }
}

/** Import a painting from a serialized object */
export function fpImportPainting(state: FlamePainterState, data: unknown): FlamePainterState | null {
  try {
    const obj = data as Record<string, unknown>
    if (!obj.canvas || typeof obj.canvas !== 'object') return null
    const canvas = obj.canvas as FPCanvas
    if (!canvas.cells || !Array.isArray(canvas.cells)) return null
    return {
      ...state,
      canvas: fpDeepCloneCanvas(canvas),
      paintHistory: [fpDeepCloneCanvas(canvas)],
      historyIndex: 0,
    }
  } catch {
    return null
  }
}

/** Get the current tutorial step */
export function fpGetTutorialStep(state: FlamePainterState): number {
  return state.tutorialStep
}

/** Advance to the next tutorial step */
export function fpAdvanceTutorial(state: FlamePainterState): FlamePainterState {
  const totalSteps = 8
  return {
    ...state,
    tutorialStep: Math.min(totalSteps, state.tutorialStep + 1),
  }
}

/** Check if the tutorial is complete */
export function fpIsTutorialComplete(state: FlamePainterState): boolean {
  return state.tutorialStep >= 8
}

/** Get aggregated player statistics */
export function fpGetStats(state: FlamePainterState): FPStats {
  return { ...state.stats }
}

/** Get flame animation metadata for visual effects */
export function fpGetFlameAnimation(flameType: FPFlameTypeId): { speed: number; flicker: number; spread: number; colorShift: number } {
  const def = fpGetFlameTypeDef(flameType)
  if (!def) return { speed: 1, flicker: 0.5, spread: 1, colorShift: 0 }
  const tempFactor = def.temperature / 15000
  return {
    speed: 0.5 + tempFactor * 2,
    flicker: 0.2 + tempFactor * 0.6,
    spread: 0.5 + (def.intensity / 10) * 1.5,
    colorShift: Math.round(tempFactor * 30),
  }
}

/** Get brush stroke visual metadata */
export function fpGetBrushStroke(technique: FPBrushTechniqueId): { width: number; alpha: number; shape: string; trail: boolean } {
  const def = fpGetBrushTechDef(technique)
  if (!def) return { width: 1, alpha: 1, shape: 'circle', trail: false }
  const hasTrail = ['spirit_trail', 'wisps', 'sweep', 'calligraphy'].includes(technique)
  const shapes: Record<string, string> = {
    dab: 'circle',
    sweep: 'line',
    splash: 'scatter',
    calligraphy: 'taper',
    glow: 'soft_circle',
    scorch: 'hard_circle',
    wisps: 'wavy',
    ripple: 'ring',
    ember_dust: 'particles',
    plasma_stroke: 'bright_line',
    shadow_blur: 'soft_square',
    spirit_trail: 'comet',
  }
  return {
    width: def.brushSize,
    alpha: def.opacityMultiplier,
    shape: shapes[technique] || 'circle',
    trail: hasTrail,
  }
}

/** Get a recommended flame type based on the current canvas content */
export function fpGetRecommendedFlame(state: FlamePainterState): FPFlameTypeId {
  const used = fpGetFlameTypesUsed(state.canvas)
  if (used.length === 0) return 'candle_flame'

  // Recommend complementary flame types
  const complementary: Record<FPFlameTypeId, FPFlameTypeId> = {
    candle_flame: 'blue_fire',
    blue_fire: 'phoenix_fire',
    phoenix_fire: 'dragon_breath',
    dragon_breath: 'spirit_fire',
    inferno: 'dark_flame',
    spirit_fire: 'solar_flare',
    solar_flare: 'candle_flame',
    dark_flame: 'inferno',
  }

  const lastUsed = used[used.length - 1]
  return complementary[lastUsed] || 'candle_flame'
}

/** Get a palette suggestion based on the current canvas */
export function fpGetPaletteSuggestion(state: FlamePainterState): string[] {
  const used = fpGetUniqueColors(state.canvas)
  if (used.length === 0) return FP_COLOR_PALETTE.slice(0, 6).map(c => c.hex)

  // Find the average hue and suggest nearby colors
  const avgColor = used.length > 0 ? used[Math.floor(used.length / 2)] : '#FFD700'
  const suggestions = FP_COLOR_PALETTE
    .map(p => ({ hex: p.hex, dist: internalColorDistance(avgColor, p.hex) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 6)
    .map(s => s.hex)

  return suggestions
}

/** Get canvas entropy (measure of visual complexity) */
export function fpGetCanvasEntropy(state: FlamePainterState): number {
  const colors = fpGetUniqueColors(state.canvas)
  const painted = state.canvas.cells.flat().filter(c => c.color && c.intensity > 0).length
  if (painted === 0) return 0
  const total = FP_GRID_ROWS * FP_GRID_COLS
  const colorEntropy = -colors.reduce((acc, _, i) => {
    const count = state.canvas.cells.flat().filter(c => c.color === colors[i]).length
    const p = count / painted
    return acc + (p > 0 ? p * Math.log2(p) : 0)
  }, 0)
  const spatialEntropy = Math.log2(total / Math.max(1, painted)) / Math.log2(total)
  return Math.round((Math.abs(colorEntropy) + spatialEntropy) * 50)
}

/** Check if a commission can be completed with the current canvas */
export function fpCanCompleteCommission(state: FlamePainterState, commissionId: string): boolean {
  const commission = state.commissions.find(c => c.id === commissionId)
  if (!commission || !commission.accepted || commission.completed) return false

  const score = fpCalculateFullScore(state.canvas)
  if (score.total < commission.minScore) return false

  const usedFlames = fpGetFlameTypesUsed(state.canvas)
  return commission.requiredFlameTypes.every(f => usedFlames.includes(f))
}

/** Refresh the daily theme if the date has changed */
export function fpRefreshDailyTheme(state: FlamePainterState): FlamePainterState {
  const today = fpGetTodayDateString()
  if (state.dailyTheme.date === today) return state

  const newTheme = fpGetDailyThemeForToday()
  const lostStreak = state.dailyTheme.completed ? 0 : 1
  return {
    ...state,
    dailyTheme: { ...newTheme, completed: false },
    stats: {
      ...state.stats,
      dailyStreak: lostStreak === 0 ? state.stats.dailyStreak : 0,
    },
  }
}

/** Get mastery XP needed for next level */
export function fpGetMasteryXpNeeded(state: FlamePainterState, flameType: FPFlameTypeId): number {
  const mastery = state.flameMastery[flameType]
  if (!mastery || mastery.level >= FP_MAX_MASTERY_LEVEL) return 0
  return fpXpForMasteryLevel(mastery.level)
}

/** Get player XP needed for next level */
export function fpGetPlayerXpNeeded(state: FlamePainterState): number {
  if (state.playerLevel >= FP_MAX_PLAYER_LEVEL) return 0
  return fpXpForPlayerLevel(state.playerLevel)
}

/** Get XP progress as a fraction for a flame mastery */
export function fpGetMasteryXpProgress(state: FlamePainterState, flameType: FPFlameTypeId): number {
  const mastery = state.flameMastery[flameType]
  if (!mastery || mastery.level >= FP_MAX_MASTERY_LEVEL) return 1
  const needed = fpXpForMasteryLevel(mastery.level)
  return Math.min(1, mastery.xp / needed)
}

/** Get XP progress as a fraction for player level */
export function fpGetPlayerXpProgress(state: FlamePainterState): number {
  if (state.playerLevel >= FP_MAX_PLAYER_LEVEL) return 1
  const needed = fpXpForPlayerLevel(state.playerLevel)
  return Math.min(1, state.playerXP / needed)
}

/** Check if a specific color is in the palette */
export function fpIsPaletteColor(hex: string): boolean {
  return FP_COLOR_PALETTE.some(c => c.hex.toLowerCase() === hex.toLowerCase())
}

/** Get flame type by color hex */
export function fpGetFlameByColor(hex: string): FPFlameTypeId | null {
  const found = FP_COLOR_PALETTE.find(c => c.hex.toLowerCase() === hex.toLowerCase())
  return found ? found.flame : null
}

/** Get all available daily themes (for reference) */
export function fpGetAllDailyThemes(): readonly Omit<FPDailyTheme, 'date' | 'completed'>[] {
  return FP_DAILY_THEMES
}

/** Get all commission templates (for reference) */
export function fpGetAllCommissionTemplates(): readonly Omit<FPCommission, 'accepted' | 'completed' | 'acceptedAt' | 'completedAt'>[] {
  return FP_COMMISSION_TEMPLATES
}

/** Get all achievement definitions (for reference) */
export function fpGetAllAchievements(): readonly FPAchievementDef[] {
  return FP_ACHIEVEMENTS
}

/** Paint a specific cell with a specific color (bypass active selection) */
export function fpPaintCellDirect(
  state: FlamePainterState,
  row: number,
  col: number,
  color: string,
  flameType: FPFlameTypeId,
  technique: FPBrushTechniqueId
): FlamePainterState {
  if (!fpIsValidCell(row, col)) return state

  const mastery = state.flameMastery[flameType]
  const result = fpApplyBrushTechnique(state.canvas, row, col, flameType, color, technique, mastery.level)

  const newHistory = state.paintHistory.slice(0, state.historyIndex + 1)
  newHistory.push(result.newCanvas)
  if (newHistory.length > FP_MAX_HISTORY) newHistory.shift()

  return {
    ...state,
    canvas: result.newCanvas,
    paintHistory: newHistory,
    historyIndex: Math.min(newHistory.length - 1, state.historyIndex + 1),
    stats: { ...state.stats, totalStrokes: state.stats.totalStrokes + 1 },
  }
}

/** Get the grid dimensions */
export function fpGetGridDimensions(): { rows: number; cols: number } {
  return { rows: FP_GRID_ROWS, cols: FP_GRID_COLS }
}

/** Get max gallery size */
export function fpGetMaxGallerySize(): number {
  return FP_MAX_GALLERY_SIZE
}

/** Get max player level */
export function fpGetMaxPlayerLevel(): number {
  return FP_MAX_PLAYER_LEVEL
}

/** Get max mastery level */
export function fpGetMaxMasteryLevel(): number {
  return FP_MAX_MASTERY_LEVEL
}

/** Clone a canvas deeply */
export function fpCloneCanvas(canvas: FPCanvas): FPCanvas {
  return fpDeepCloneCanvas(canvas)
}

/** Get color distance between two hex colors */
export function fpGetColorDistance(hex1: string, hex2: string): number {
  return internalColorDistance(hex1, hex2)
}

/** Count unique colors on the current canvas */
export function fpCountUniqueColors(state: FlamePainterState): number {
  return fpGetUniqueColors(state.canvas).length
}

/** Count unique flame types used on the current canvas */
export function fpCountUniqueFlames(state: FlamePainterState): number {
  return fpGetFlameTypesUsed(state.canvas).length
}

/** Get a summary of the current canvas state */
export function fpGetCanvasSummary(state: FlamePainterState): {
  paintedCells: number
  totalCells: number
  coveragePercent: number
  uniqueColors: number
  uniqueFlames: number
  dominantFlame: FPFlameTypeId
  score: FPArtScore
} {
  const painted = state.canvas.cells.flat().filter(c => c.color && c.intensity > 0).length
  const total = FP_GRID_ROWS * FP_GRID_COLS
  return {
    paintedCells: painted,
    totalCells: total,
    coveragePercent: Math.round((painted / total) * 100),
    uniqueColors: fpGetUniqueColors(state.canvas).length,
    uniqueFlames: fpGetFlameTypesUsed(state.canvas).length,
    dominantFlame: fpGetMostUsedFlame(state),
    score: fpCalculateFullScore(state.canvas),
  }
}

/** Check if a specific brush technique is compatible with a flame type */
export function fpIsTechniqueCompatible(technique: FPBrushTechniqueId, flameType: FPFlameTypeId): boolean {
  const tech = fpGetBrushTechDef(technique)
  return tech ? tech.compatibleFlames.includes(flameType) : false
}

/** Get techniques compatible with a flame type */
export function fpGetCompatibleTechniques(flameType: FPFlameTypeId): FPBrushTechniqueId[] {
  return FP_BRUSH_TECHNIQUES
    .filter(t => t.compatibleFlames.includes(flameType))
    .map(t => t.id)
}

/** Get flames compatible with a technique */
export function fpGetCompatibleFlames(technique: FPBrushTechniqueId): FPFlameTypeId[] {
  const tech = fpGetBrushTechDef(technique)
  return tech ? [...tech.compatibleFlames] : []
}

/** Calculate XP reward for saving a painting */
export function fpCalculateSaveXP(state: FlamePainterState): number {
  const score = fpCalculateFullScore(state.canvas)
  return Math.round(10 + score.total * 0.5)
}

/** Reset the current canvas while keeping gallery and progress */
export function fpResetCanvas(state: FlamePainterState): FlamePainterState {
  const empty = fpCreateEmptyCanvas()
  return {
    ...state,
    canvas: empty,
    paintHistory: [empty],
    historyIndex: 0,
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: DEFAULT EXPORT — REACT HOOK
// ═══════════════════════════════════════════════════════════════════

export default function useFlamePainter(initialState?: FlamePainterState) {
  const [state, setState] = useState<FlamePainterState>(initialState || fpInitialState())

  return {
    // State
    ...state,

    // Actions
    fpPaint: (row: number, col: number) => setState(s => fpPaint(s, row, col)),
    fpPaintWithFlame: (row: number, col: number, ft: FPFlameTypeId) =>
      setState(s => fpPaintWithFlame(s, row, col, ft)),
    fpSelectFlame: (ft: FPFlameTypeId) => setState(s => fpSelectFlame(s, ft)),
    fpSelectBrush: (t: FPBrushTechniqueId) => setState(s => fpSelectBrush(s, t)),
    fpSelectColor: (c: string) => setState(s => fpSelectColor(s, c)),
    fpClearCanvas: () => setState(fpClearCanvas),
    fpSavePainting: (name: string) => setState(s => fpSavePainting(s, name)),
    fpLoadPainting: (id: string) => setState(s => fpLoadPainting(s, id)),
    fpDeletePainting: (id: string) => setState(s => fpDeletePainting(s, id)),
    fpAddFlameXP: (ft: FPFlameTypeId, amt: number) => setState(s => fpAddFlameXP(s, ft, amt)),
    fpAddPlayerXP: (amt: number) => setState(s => fpAddPlayerXP(s, amt)),
    fpCompleteDailyTheme: () => setState(fpCompleteDailyTheme),
    fpAcceptCommission: (id: string) => setState(s => fpAcceptCommission(s, id)),
    fpCompleteCommission: (id: string) => setState(s => fpCompleteCommission(s, id)),
    fpUnlockFlame: (ft: FPFlameTypeId) => setState(s => fpUnlockFlame(s, ft)),
    fpUndoPaint: () => setState(fpUndoPaint),
    fpRedoPaint: () => setState(fpRedoPaint),
    fpFillArea: (row: number, col: number) => setState(s => fpFillArea(s, row, col)),
    fpAdvanceTutorial: () => setState(fpAdvanceTutorial),
    fpResetCanvas: () => setState(fpResetCanvas),
    fpResetState: () => setState(fpResetState()),
    fpRefreshDailyTheme: () => setState(fpRefreshDailyTheme),
    fpImportPainting: (data: unknown) => {
      const result = fpImportPainting(state, data)
      if (result) setState(result)
    },
    fpPaintCellDirect: (
      row: number, col: number, color: string, ft: FPFlameTypeId, tech: FPBrushTechniqueId
    ) => setState(s => fpPaintCellDirect(s, row, col, color, ft, tech)),
  }
}
