'use client'

// ============================================================================
// Gem Crusher Wire — 宝石粉碎模块 (SSR-safe)
// A gem mining & crushing puzzle game for Word Snake.
// All named exports are pure functions with `gc` prefix.
// Default export is a React hook that wraps state.
// No localStorage, window, document, setInterval, or setTimeout.
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react'

// ============================================================================
// Types — 类型定义
// ============================================================================

/** 八种宝石类型 — Eight gem types */
export type GemType =
  | 'ruby'
  | 'sapphire'
  | 'emerald'
  | 'diamond'
  | 'amethyst'
  | 'topaz'
  | 'opal'
  | 'pearl'

/** 五种稀有度 — Five rarity tiers */
export type GemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/** 特殊能力 — Special ability types */
export type SpecialAbility =
  | 'fire_blast'
  | 'ice_shatter'
  | 'lightning_strike'
  | 'earth_quake'
  | 'wind_vortex'
  | 'shadow_consume'
  | 'holy_beam'
  | 'void_crush'
  | 'nature_bloom'
  | 'cosmic_nova'

/** 矿井深度 — Mine depth levels */
export type MineDepth = 1 | 2 | 3 | 4 | 5

/** 碎石机升级状态 — Crusher upgrade state */
export type CrusherLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

// ============================================================================
// Interfaces — 接口定义
// ============================================================================

/** 宝石定义 — Gem definition */
export interface GemDef {
  type: GemType
  name: string
  nameZh: string
  emoji: string
  color: string
  glowColor: string
  baseScore: number
  description: string
}

/** 稀有度定义 — Rarity definition */
export interface RarityDef {
  rarity: GemRarity
  label: string
  labelZh: string
  color: string
  bgGradient: string
  xpMultiplier: number
  scoreMultiplier: number
  dropWeight: number
}

/** 网格中的宝石格子 — Gem cell in grid */
export interface GemCell {
  row: number
  col: number
  gemType: GemType | null
  rarity: GemRarity
  locked: boolean
  special: SpecialAbility | null
  marked: boolean
}

/** 库存中的宝石 — Gem in inventory */
export interface GemItem {
  id: string
  gemType: GemType
  rarity: GemRarity
  quantity: number
  acquiredAt: number
  source: 'mined' | 'crafted' | 'reward' | 'daily'
}

/** 特殊能力定义 — Special ability definition */
export interface SpecialAbilityDef {
  id: SpecialAbility
  name: string
  nameZh: string
  description: string
  emoji: string
  cooldown: number
  power: number
  targetPattern: 'cross' | 'row' | 'col' | 'area' | 'all' | 'random'
  range: number
}

/** 矿井层级定义 — Mine depth definition */
export interface MineDepthDef {
  depth: MineDepth
  name: string
  nameZh: string
  description: string
  emoji: string
  unlockLevel: number
  baseGemScore: number
  epicChance: number
  legendaryChance: number
  bgColor: string
}

/** 碎石机等级定义 — Crusher level definition */
export interface CrusherLevelDef {
  level: CrusherLevel
  name: string
  nameZh: string
  bonusMultiplier: number
  bonusXp: number
  autoCrushChance: number
  unlockCost: number
  description: string
  emoji: string
}

/** 成就定义 — Achievement definition */
export interface AchievementDef {
  id: string
  name: string
  nameZh: string
  description: string
  conditionKey: string
  targetValue: number
  rewardXp: number
  rewardScore: number
  emoji: string
}

/** 每日宝石冲刺 — Daily gem rush */
export interface DailyRush {
  bonusGemType: GemType | null
  bonusMultiplier: number
  bonusRarity: GemRarity | null
  challengeTarget: number
  challengeType: 'crush' | 'craft' | 'combo' | 'score'
  reward: number
}

/** 粉碎结果 — Crush result */
export interface CrushResult {
  success: boolean
  score: number
  xpGained: number
  gemsCrushed: number
  matches: { row: number; col: number }[]
  combo: number
  specialTriggered: SpecialAbility | null
  message: string
  newState: GemCrusherState
}

/** 合成结果 — Craft result */
export interface CraftResult {
  success: boolean
  outputGem: GemItem | null
  xpGained: number
  message: string
  newState: GemCrusherState
}

/** 交换结果 — Swap result */
export interface SwapResult {
  success: boolean
  crushResult: CrushResult | null
  message: string
  newState: GemCrusherState
}

/** 矿石采集结果 — Mine result */
export interface MineResult {
  success: boolean
  gem: GemItem | null
  xpGained: number
  depthBonus: number
  message: string
  newState: GemCrusherState
}

/** 碎石机升级结果 — Crusher upgrade result */
export interface UpgradeResult {
  success: boolean
  newLevel: CrusherLevel
  bonusMultiplier: number
  message: string
  newState: GemCrusherState
}

/** 使用技能结果 — Use ability result */
export interface AbilityResult {
  success: boolean
  abilityUsed: SpecialAbility | null
  score: number
  cellsAffected: number
  message: string
  newState: GemCrusherState
}

/** 成就检查结果 — Achievement check result */
export interface AchievementCheckResult {
  newlyUnlocked: string[]
  totalUnlocked: number
}

/** 主游戏状态 — Main game state */
export interface GemCrusherState {
  // 核心数据 — Core data
  level: number
  xp: number
  totalXp: number
  totalScore: number
  gemsCrushed: number

  // 网格 — Grid (6×6)
  grid: GemCell[][]

  // 矿井 — Mine
  mineDepth: MineDepth
  totalMined: number

  // 碎石机 — Crusher
  crusherLevel: CrusherLevel
  crusherEnergy: number

  // 连击 — Streak & Combo
  streak: number
  bestStreak: number
  currentCombo: number
  bestCombo: number
  lastPlayDate: string | null

  // 成就 — Achievements
  achievements: string[]

  // 每日 — Daily
  dailyPlayed: boolean
  dailyDate: string | null
  dailyRushProgress: number

  // 库存 — Inventory
  inventory: GemItem[]

  // 技能冷却 — Ability cooldowns
  abilityCooldowns: Record<SpecialAbility, number>

  // 特殊宝石 — Special gem count
  specialGemsUsed: number

  // 统计 — Statistics
  totalCrafted: number
  totalSwaps: number
  totalAbilitiesUsed: number
  largestSingleCrush: number
  legendaryCrushed: number
  epicCrushed: number

  // 初始化标志 — Init flag
  initialized: boolean
  version: number
}

// ============================================================================
// Constants — 常量数据
// ============================================================================

/** 最大等级 — Max player level */
export const GC_MAX_LEVEL = 40

/** 网格尺寸 — Grid dimensions */
export const GC_GRID_ROWS = 6
export const GC_GRID_COLS = 6

/** 最大库容量 — Max inventory slots */
export const GC_MAX_INVENTORY = 100

/** 升级所需经验表 — XP table for leveling */
export const GC_XP_TABLE: number[] = []
for (let i = 0; i <= GC_MAX_LEVEL; i++) {
  GC_XP_TABLE.push(i >= GC_MAX_LEVEL ? Infinity : Math.floor(80 * i * (1 + i * 0.15)))
}

// ============================================================================
// 宝石定义 — 8 Gem Types
// ============================================================================

export const GC_GEM_TYPES: GemDef[] = [
  {
    type: 'ruby',
    name: 'Ruby',
    nameZh: '红宝石',
    emoji: '🔴',
    color: '#E53E3E',
    glowColor: '#FEB2B2',
    baseScore: 10,
    description: 'Deep crimson ruby, flame of passion and power',
  },
  {
    type: 'sapphire',
    name: 'Sapphire',
    nameZh: '蓝宝石',
    emoji: '🔵',
    color: '#3182CE',
    glowColor: '#90CDF4',
    baseScore: 12,
    description: 'Cool blue sapphire, wisdom and clarity',
  },
  {
    type: 'emerald',
    name: 'Emerald',
    nameZh: '翡翠',
    emoji: '🟢',
    color: '#38A169',
    glowColor: '#9AE6B4',
    baseScore: 11,
    description: 'Verdant emerald, growth and vitality',
  },
  {
    type: 'diamond',
    name: 'Diamond',
    nameZh: '钻石',
    emoji: '💎',
    color: '#E2E8F0',
    glowColor: '#F7FAFC',
    baseScore: 20,
    description: 'Brilliant diamond, purity and brilliance',
  },
  {
    type: 'amethyst',
    name: 'Amethyst',
    nameZh: '紫水晶',
    emoji: '🟣',
    color: '#805AD5',
    glowColor: '#D6BCFA',
    baseScore: 14,
    description: 'Royal amethyst, calm and spiritual insight',
  },
  {
    type: 'topaz',
    name: 'Topaz',
    nameZh: '黄玉',
    emoji: '🟡',
    color: '#D69E2E',
    glowColor: '#FAF089',
    baseScore: 13,
    description: 'Golden topaz, warmth and abundance',
  },
  {
    type: 'opal',
    name: 'Opal',
    nameZh: '欧泊石',
    emoji: '🌈',
    color: '#ED8936',
    glowColor: '#FEEBC8',
    baseScore: 16,
    description: 'Iridescent opal, creativity and inspiration',
  },
  {
    type: 'pearl',
    name: 'Pearl',
    nameZh: '珍珠',
    emoji: '⚪',
    color: '#CBD5E0',
    glowColor: '#EDF2F7',
    baseScore: 15,
    description: 'Lustrous pearl, purity and elegance',
  },
]

// ============================================================================
// 稀有度定义 — 5 Rarity Tiers with color codes
// ============================================================================

export const GC_RARITIES: RarityDef[] = [
  {
    rarity: 'common',
    label: 'Common',
    labelZh: '普通',
    color: '#9CA3AF',
    bgGradient: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
    xpMultiplier: 1,
    scoreMultiplier: 1,
    dropWeight: 50,
  },
  {
    rarity: 'uncommon',
    label: 'Uncommon',
    labelZh: '优良',
    color: '#F59E0B',
    bgGradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
    xpMultiplier: 1.5,
    scoreMultiplier: 1.5,
    dropWeight: 30,
  },
  {
    rarity: 'rare',
    label: 'Rare',
    labelZh: '稀有',
    color: '#3B82F6',
    bgGradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    xpMultiplier: 2.5,
    scoreMultiplier: 2.5,
    dropWeight: 14,
  },
  {
    rarity: 'epic',
    label: 'Epic',
    labelZh: '史诗',
    color: '#A855F7',
    bgGradient: 'linear-gradient(135deg, #7C3AED, #A855F7)',
    xpMultiplier: 4,
    scoreMultiplier: 4,
    dropWeight: 5,
  },
  {
    rarity: 'legendary',
    label: 'Legendary',
    labelZh: '传说',
    color: '#EF4444',
    bgGradient: 'linear-gradient(135deg, #DC2626, #F97316)',
    xpMultiplier: 8,
    scoreMultiplier: 8,
    dropWeight: 1,
  },
]

// ============================================================================
// 特殊能力 — 10 Special Abilities
// ============================================================================

export const GC_SPECIAL_ABILITIES: SpecialAbilityDef[] = [
  {
    id: 'fire_blast',
    name: 'Fire Blast',
    nameZh: '烈焰爆破',
    description: 'Destroys gems in a 3×3 area around target',
    emoji: '🔥',
    cooldown: 3,
    power: 50,
    targetPattern: 'area',
    range: 1,
  },
  {
    id: 'ice_shatter',
    name: 'Ice Shatter',
    nameZh: '寒冰碎裂',
    description: 'Destroys entire row and column of target',
    emoji: '❄️',
    cooldown: 4,
    power: 40,
    targetPattern: 'cross',
    range: 1,
  },
  {
    id: 'lightning_strike',
    name: 'Lightning Strike',
    nameZh: '雷电打击',
    description: 'Destroys up to 5 random gems of same type',
    emoji: '⚡',
    cooldown: 3,
    power: 35,
    targetPattern: 'random',
    range: 5,
  },
  {
    id: 'earth_quake',
    name: 'Earthquake',
    nameZh: '大地震动',
    description: 'Shuffles grid and crushes all resulting matches',
    emoji: '🌍',
    cooldown: 5,
    power: 60,
    targetPattern: 'all',
    range: 0,
  },
  {
    id: 'wind_vortex',
    name: 'Wind Vortex',
    nameZh: '风之旋涡',
    description: 'Removes one entire row of gems',
    emoji: '🌪️',
    cooldown: 3,
    power: 30,
    targetPattern: 'row',
    range: 0,
  },
  {
    id: 'shadow_consume',
    name: 'Shadow Consume',
    nameZh: '暗影吞噬',
    description: 'Removes one entire column of gems',
    emoji: '🌑',
    cooldown: 3,
    power: 30,
    targetPattern: 'col',
    range: 0,
  },
  {
    id: 'holy_beam',
    name: 'Holy Beam',
    nameZh: '圣光之束',
    description: 'Converts all gems in cross pattern to diamonds',
    emoji: '✨',
    cooldown: 6,
    power: 80,
    targetPattern: 'cross',
    range: 2,
  },
  {
    id: 'void_crush',
    name: 'Void Crush',
    nameZh: '虚空粉碎',
    description: 'Destroys the lowest-scoring 8 gems on grid',
    emoji: '🕳️',
    cooldown: 4,
    power: 45,
    targetPattern: 'random',
    range: 8,
  },
  {
    id: 'nature_bloom',
    name: 'Nature Bloom',
    nameZh: '自然绽放',
    description: 'Fills empty cells with common emeralds',
    emoji: '🌸',
    cooldown: 5,
    power: 25,
    targetPattern: 'all',
    range: 0,
  },
  {
    id: 'cosmic_nova',
    name: 'Cosmic Nova',
    nameZh: '宇宙新星',
    description: 'Destroys all gems of one random type, big score bonus',
    emoji: '💫',
    cooldown: 7,
    power: 100,
    targetPattern: 'all',
    range: 0,
  },
]

// ============================================================================
// 矿井深度 — 5 Mine Depth Levels
// ============================================================================

export const GC_MINE_DEPTHS: MineDepthDef[] = [
  {
    depth: 1,
    name: 'Shallow Vein',
    nameZh: '浅层矿脉',
    description: 'Basic gems and common minerals, safe for beginners',
    emoji: '⛏️',
    unlockLevel: 1,
    baseGemScore: 5,
    epicChance: 0.02,
    legendaryChance: 0,
    bgColor: '#D4C5A9',
  },
  {
    depth: 2,
    name: 'Crystal Cavern',
    nameZh: '水晶洞穴',
    description: 'Sparkling crystals line the walls, uncommon finds likely',
    emoji: '🕳️',
    unlockLevel: 5,
    baseGemScore: 10,
    epicChance: 0.08,
    legendaryChance: 0.01,
    bgColor: '#8B7DBB',
  },
  {
    depth: 3,
    name: 'Magma Chamber',
    nameZh: '熔岩洞窟',
    description: 'Heat-blessed gems with enhanced power',
    emoji: '🌋',
    unlockLevel: 12,
    baseGemScore: 18,
    epicChance: 0.15,
    legendaryChance: 0.03,
    bgColor: '#C0392B',
  },
  {
    depth: 4,
    name: 'Abyssal Trench',
    nameZh: '深渊裂谷',
    description: 'Rare and epic gems found in the deepest dark',
    emoji: '🌑',
    unlockLevel: 22,
    baseGemScore: 30,
    epicChance: 0.25,
    legendaryChance: 0.08,
    bgColor: '#1A1A2E',
  },
  {
    depth: 5,
    name: 'Starfall Core',
    nameZh: '星陨核心',
    description: 'Legendary gems rain from above in the world\'s heart',
    emoji: '⭐',
    unlockLevel: 32,
    baseGemScore: 50,
    epicChance: 0.4,
    legendaryChance: 0.15,
    bgColor: '#0F0C29',
  },
]

// ============================================================================
// 碎石机 — 10 Crusher Levels
// ============================================================================

export const GC_CRUSHER_LEVELS: CrusherLevelDef[] = [
  { level: 1, name: 'Stone Crusher', nameZh: '石碾', bonusMultiplier: 1.0, bonusXp: 0, autoCrushChance: 0, unlockCost: 0, description: 'Basic manual crusher for common gems', emoji: '🪨' },
  { level: 2, name: 'Iron Press', nameZh: '铁轧机', bonusMultiplier: 1.1, bonusXp: 5, autoCrushChance: 0, unlockCost: 200, description: 'Sturdy iron mechanism, slightly more efficient', emoji: '⚙️' },
  { level: 3, name: 'Steel Grinder', nameZh: '钢磨机', bonusMultiplier: 1.25, bonusXp: 12, autoCrushChance: 0.02, unlockCost: 600, description: 'Steel gears grind gems to fine powder', emoji: '🔧' },
  { level: 4, name: 'Crystal Mill', nameZh: '水晶磨坊', bonusMultiplier: 1.4, bonusXp: 20, autoCrushChance: 0.04, unlockCost: 1500, description: 'Crystal-tipped blades for precision crushing', emoji: '💎' },
  { level: 5, name: 'Magma Hammer', nameZh: '熔岩锤', bonusMultiplier: 1.6, bonusXp: 30, autoCrushChance: 0.06, unlockCost: 3500, description: 'Volcanic power drives each crushing blow', emoji: '🔨' },
  { level: 6, name: 'Thunder Press', nameZh: '雷霆压机', bonusMultiplier: 1.85, bonusXp: 45, autoCrushChance: 0.08, unlockCost: 7000, description: 'Lightning-charged plates smash with thunderous force', emoji: '⚡' },
  { level: 7, name: 'Shadow Grinder', nameZh: '暗影碎磨', bonusMultiplier: 2.1, bonusXp: 65, autoCrushChance: 0.1, unlockCost: 13000, description: 'Dark energy tears gems apart at the molecular level', emoji: '🌑' },
  { level: 8, name: 'Dragon Jaw', nameZh: '龙颚碎石', bonusMultiplier: 2.4, bonusXp: 90, autoCrushChance: 0.12, unlockCost: 22000, description: 'Modeled after dragon teeth, nothing survives', emoji: '🐉' },
  { level: 9, name: 'Star Forge', nameZh: '星辰熔炉', bonusMultiplier: 2.8, bonusXp: 120, autoCrushChance: 0.15, unlockCost: 38000, description: 'Harnesses stellar energy for cosmic crushing', emoji: '⭐' },
  { level: 10, name: 'Void Obliterator', nameZh: '虚空湮灭器', bonusMultiplier: 3.5, bonusXp: 160, autoCrushChance: 0.2, unlockCost: 65000, description: 'The ultimate crusher — gems are erased from existence', emoji: '🌀' },
]

// ============================================================================
// 成就 — 15 Achievements
// ============================================================================

export const GC_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_crush', name: 'First Crush', nameZh: '初次粉碎', description: 'Crush your first gem', conditionKey: 'gemsCrushed', targetValue: 1, rewardXp: 20, rewardScore: 50, emoji: '💎' },
  { id: 'centurion', name: 'Gem Centurion', nameZh: '宝石百夫长', description: 'Crush 100 gems total', conditionKey: 'gemsCrushed', targetValue: 100, rewardXp: 100, rewardScore: 500, emoji: '💯' },
  { id: 'gem_master', name: 'Gem Master', nameZh: '宝石大师', description: 'Crush 1,000 gems total', conditionKey: 'gemsCrushed', targetValue: 1000, rewardXp: 500, rewardScore: 5000, emoji: '🏆' },
  { id: 'combo_5', name: 'Combo Strike', nameZh: '五连击', description: 'Achieve a 5-combo', conditionKey: 'bestCombo', targetValue: 5, rewardXp: 80, rewardScore: 300, emoji: '🔥' },
  { id: 'combo_10', name: 'Combo Fury', nameZh: '十连怒火', description: 'Achieve a 10-combo', conditionKey: 'bestCombo', targetValue: 10, rewardXp: 200, rewardScore: 1000, emoji: '💥' },
  { id: 'streak_7', name: 'Weekly Miner', nameZh: '周常矿工', description: 'Maintain a 7-day streak', conditionKey: 'bestStreak', targetValue: 7, rewardXp: 150, rewardScore: 750, emoji: '📅' },
  { id: 'streak_30', name: 'Monthly Legend', nameZh: '月度传说', description: 'Maintain a 30-day streak', conditionKey: 'bestStreak', targetValue: 30, rewardXp: 1000, rewardScore: 10000, emoji: '👑' },
  { id: 'depth_5', name: 'Deep Diver', nameZh: '深渊探索者', description: 'Reach mine depth 5', conditionKey: 'mineDepth', targetValue: 5, rewardXp: 300, rewardScore: 2000, emoji: '🌊' },
  { id: 'crusher_10', name: 'Max Crusher', nameZh: '终极碎石机', description: 'Upgrade crusher to level 10', conditionKey: 'crusherLevel', targetValue: 10, rewardXp: 500, rewardScore: 5000, emoji: '🌀' },
  { id: 'craft_50', name: 'Artisan', nameZh: '工匠之心', description: 'Craft 50 gems total', conditionKey: 'totalCrafted', targetValue: 50, rewardXp: 200, rewardScore: 1500, emoji: '🔨' },
  { id: 'legendary_crush', name: 'Legend Slayer', nameZh: '传说猎手', description: 'Crush a legendary gem', conditionKey: 'legendaryCrushed', targetValue: 1, rewardXp: 250, rewardScore: 2000, emoji: '⭐' },
  { id: 'score_100k', name: 'Score Tycoon', nameZh: '百分富翁', description: 'Reach 100,000 total score', conditionKey: 'totalScore', targetValue: 100000, rewardXp: 400, rewardScore: 3000, emoji: '💰' },
  { id: 'level_20', name: 'Veteran', nameZh: '老练矿工', description: 'Reach player level 20', conditionKey: 'level', targetValue: 20, rewardXp: 300, rewardScore: 2500, emoji: '⬆️' },
  { id: 'level_40', name: 'Gem Emperor', nameZh: '宝石大帝', description: 'Reach max level 40', conditionKey: 'level', targetValue: 40, rewardXp: 2000, rewardScore: 20000, emoji: '🏔️' },
  { id: 'big_crush', name: 'Massive Crush', nameZh: '巨型粉碎', description: 'Crush 12+ gems in a single move', conditionKey: 'largestSingleCrush', targetValue: 12, rewardXp: 350, rewardScore: 3000, emoji: '☄️' },
]

// ============================================================================
// Internal Helpers — 内部辅助函数
// ============================================================================

/** 哈希生成简单种子 — Simple seed hash for deterministic randomness */
function gcHashSeed(seed: number): number {
  let h = seed | 0
  h = ((h >> 16) ^ h) * 0x45d9f3b | 0
  h = ((h >> 16) ^ h) * 0x45d9f3b | 0
  h = (h >> 16) ^ h
  return Math.abs(h)
}

/** 基于种子的伪随机 — Seeded pseudo-random number */
function gcRandom(seed: number): number {
  const h = gcHashSeed(seed)
  return (h % 10000) / 10000
}

/** 基于种子的随机整数 — Seeded random int in [0, max) */
function gcRandomInt(seed: number, max: number): number {
  return gcRandom(seed) * max | 0
}

/** 从数组中按权重随机选取 — Weighted random pick */
function gcWeightedPick<T extends { dropWeight?: number }>(seed: number, items: T[]): T {
  const totalWeight = items.reduce((s, item) => s + (item.dropWeight || 1), 0)
  let roll = gcRandom(seed) * totalWeight
  for (const item of items) {
    roll -= item.dropWeight || 1
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

/** 根据稀有度概率选择 — Pick rarity based on mine depth chances */
function gcPickRarity(seed: number, epicChance: number, legendaryChance: number): GemRarity {
  const roll = gcRandom(seed)
  if (roll < legendaryChance) return 'legendary'
  if (roll < legendaryChance + epicChance) return 'epic'
  if (roll < legendaryChance + epicChance + 0.25) return 'rare'
  if (roll < legendaryChance + epicChance + 0.25 + 0.30) return 'uncommon'
  return 'common'
}

/** 获取稀有度乘数 — Get rarity multiplier */
function gcRarityScoreMult(rarity: GemRarity): number {
  const def = GC_RARITIES.find(r => r.rarity === rarity)
  return def?.scoreMultiplier ?? 1
}

function gcRarityXpMult(rarity: GemRarity): number {
  const def = GC_RARITIES.find(r => r.rarity === rarity)
  return def?.xpMultiplier ?? 1
}

/** 获取宝石基础分 — Get gem base score */
function gcGemBaseScore(gemType: GemType): number {
  const def = GC_GEM_TYPES.find(g => g.type === gemType)
  return def?.baseScore ?? 10
}

/** 计算等级 — Calculate level from XP */
function gcCalcLevel(xp: number): number {
  let lvl = 1
  for (let i = 1; i < GC_MAX_LEVEL; i++) {
    if (xp >= GC_XP_TABLE[i]) {
      lvl = i + 1
    } else {
      break
    }
  }
  return Math.min(lvl, GC_MAX_LEVEL)
}

/** 创建空格子 — Create empty gem cell */
function gcEmptyCell(row: number, col: number): GemCell {
  return {
    row,
    col,
    gemType: null,
    rarity: 'common',
    locked: false,
    special: null,
    marked: false,
  }
}

/** 生成随机格子 — Generate random gem cell */
function gcRandomCell(row: number, col: number, seed: number, allowedRarity: GemRarity): GemCell {
  const types: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'amethyst', 'topaz', 'opal', 'pearl']
  const idx = gcRandomInt(seed, types.length)
  return {
    row,
    col,
    gemType: types[idx],
    rarity: allowedRarity,
    locked: false,
    special: null,
    marked: false,
  }
}

/** 生成初始网格 — Generate initial grid ensuring no initial matches */
function gcGenerateGrid(seed: number): GemCell[][] {
  const grid: GemCell[][] = []
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    grid[r] = []
    for (let c = 0; c < GC_GRID_COLS; c++) {
      let cell: GemCell
      let attempts = 0
      // 确保初始网格没有自动匹配 — Ensure no initial matches
      do {
        cell = gcRandomCell(r, c, seed + r * GC_GRID_COLS + c + attempts * 100, 'common')
        attempts++
      } while (gcWouldMatch(grid, r, c, cell.gemType!) && attempts < 20)
      grid[r][c] = cell
    }
  }
  return grid
}

/** 检查放置是否会造成匹配 — Check if placement would cause a match */
function gcWouldMatch(grid: GemCell[][], row: number, col: number, gemType: GemType): boolean {
  // 检查水平方向 — Check horizontal
  if (col >= 2) {
    const c1 = grid[row][col - 1]
    const c2 = grid[row][col - 2]
    if (c1.gemType === gemType && c2.gemType === gemType) return true
  }
  // 检查垂直方向 — Check vertical
  if (row >= 2) {
    const c1 = grid[row - 1][col]
    const c2 = grid[row - 2][col]
    if (c1.gemType === gemType && c2.gemType === gemType) return true
  }
  return false
}

/** 查找所有三连匹配 — Find all match-3 groups */
function gcFindAllMatches(grid: GemCell[][]): { row: number; col: number }[] {
  const matched = new Set<string>()

  // 水平扫描 — Horizontal scan
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c <= GC_GRID_COLS - 3; c++) {
      const a = grid[r][c]
      const b = grid[r][c + 1]
      const cv = grid[r][c + 2]
      if (a.gemType && a.gemType === b.gemType && a.gemType === cv.gemType && !a.locked && !b.locked && !cv.locked) {
        matched.add(`${r},${c}`)
        matched.add(`${r},${c + 1}`)
        matched.add(`${r},${c + 2}`)
      }
    }
  }

  // 垂直扫描 — Vertical scan
  for (let c = 0; c < GC_GRID_COLS; c++) {
    for (let r = 0; r <= GC_GRID_ROWS - 3; r++) {
      const a = grid[r][c]
      const b = grid[r + 1][c]
      const cv = grid[r + 2][c]
      if (a.gemType && a.gemType === b.gemType && a.gemType === cv.gemType && !a.locked && !b.locked && !cv.locked) {
        matched.add(`${r},${c}`)
        matched.add(`${r + 1},${c}`)
        matched.add(`${r + 2},${c}`)
      }
    }
  }

  return Array.from(matched).map(s => {
    const [r, c] = s.split(',').map(Number)
    return { row: r, col: c }
  })
}

/** 移除匹配的格子并让宝石下落 — Remove matches and drop gems */
function gcApplyGravity(grid: GemCell[][], seed: number): GemCell[][] {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })))

  for (let c = 0; c < GC_GRID_COLS; c++) {
    // 收集该列非空格子 — Collect non-empty cells in column
    const remaining: GemCell[] = []
    for (let r = GC_GRID_ROWS - 1; r >= 0; r--) {
      if (newGrid[r][c].gemType !== null) {
        remaining.push(newGrid[r][c])
      }
    }

    // 从底部重新排列 — Rearrange from bottom
    for (let r = GC_GRID_ROWS - 1; r >= 0; r--) {
      const idx = GC_GRID_ROWS - 1 - r
      if (idx < remaining.length) {
        newGrid[r][c] = { ...remaining[idx], row: r, col: c }
      } else {
        // 生成新宝石填充空位 — Fill empty spots with new gems
        const types: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'amethyst', 'topaz', 'opal', 'pearl']
        const pick = types[gcRandomInt(seed + r * GC_GRID_COLS + c, types.length)]
        newGrid[r][c] = {
          row: r,
          col: c,
          gemType: pick,
          rarity: 'common',
          locked: false,
          special: null,
          marked: false,
        }
      }
    }
  }

  return newGrid
}

/** 检查网格是否还有有效移动 — Check if valid moves exist */
function gcHasValidMoves(grid: GemCell[][]): boolean {
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c < GC_GRID_COLS; c++) {
      if (!grid[r][c].gemType || grid[r][c].locked) continue
      // 尝试向右交换 — Try swap right
      if (c < GC_GRID_COLS - 1 && grid[r][c + 1].gemType && !grid[r][c + 1].locked) {
        const temp = grid[r][c].gemType
        grid[r][c].gemType = grid[r][c + 1].gemType
        grid[r][c + 1].gemType = temp
        const has = gcFindAllMatches(grid).length > 0
        grid[r][c + 1].gemType = grid[r][c].gemType
        grid[r][c].gemType = temp
        if (has) return true
      }
      // 尝试向下交换 — Try swap down
      if (r < GC_GRID_ROWS - 1 && grid[r + 1][c].gemType && !grid[r + 1][c].locked) {
        const temp = grid[r][c].gemType
        grid[r][c].gemType = grid[r + 1][c].gemType
        grid[r + 1][c].gemType = temp
        const has = gcFindAllMatches(grid).length > 0
        grid[r + 1][c].gemType = grid[r][c].gemType
        grid[r][c].gemType = temp
        if (has) return true
      }
    }
  }
  return false
}

/** 洗牌网格 — Shuffle grid */
function gcShuffleGridInternal(grid: GemCell[][], seed: number): GemCell[][] {
  const types: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'amethyst', 'topaz', 'opal', 'pearl']
  const newGrid: GemCell[][] = []

  for (let r = 0; r < GC_GRID_ROWS; r++) {
    newGrid[r] = []
    for (let c = 0; c < GC_GRID_COLS; c++) {
      if (grid[r][c].locked) {
        newGrid[r][c] = { ...grid[r][c] }
      } else {
        let cell: GemCell
        let attempts = 0
        let pickType: GemType = 'ruby'
        do {
          pickType = types[gcRandomInt(seed + r * GC_GRID_COLS + c + attempts * 77, types.length)]
          cell = { row: r, col: c, gemType: pickType, rarity: grid[r][c].rarity, locked: false, special: null, marked: false }
          attempts++
        } while (gcWouldMatch(newGrid, r, c, pickType) && attempts < 30)
        newGrid[r][c] = cell
      }
    }
  }
  return newGrid
}

/** 检查并授予成就 — Check and grant achievements */
function gcCheckAchievementsInternal(state: GemCrusherState): string[] {
  const newlyUnlocked: string[] = []
  for (const ach of GC_ACHIEVEMENTS) {
    if (state.achievements.includes(ach.id)) continue
    const stateVal = (state as unknown as Record<string, number>)[ach.conditionKey] ?? 0
    if (stateVal >= ach.targetValue) {
      newlyUnlocked.push(ach.id)
    }
  }
  return newlyUnlocked
}

/** 生成唯一ID — Generate unique ID */
function gcGenId(): string {
  return `gem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** 简单日期键 — Simple date key */
function gcDayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

// ============================================================================
// Named Exports — 纯函数导出 (60+ gc-prefixed functions)
// ============================================================================

/** 获取初始状态 — Get initial state */
export function gcInitialState(): GemCrusherState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    totalScore: 0,
    gemsCrushed: 0,
    grid: gcGenerateGrid(42),
    mineDepth: 1,
    totalMined: 0,
    crusherLevel: 1,
    crusherEnergy: 100,
    streak: 0,
    bestStreak: 0,
    currentCombo: 0,
    bestCombo: 0,
    lastPlayDate: null,
    achievements: [],
    dailyPlayed: false,
    dailyDate: null,
    dailyRushProgress: 0,
    inventory: [],
    abilityCooldowns: {
      fire_blast: 0, ice_shatter: 0, lightning_strike: 0, earth_quake: 0,
      wind_vortex: 0, shadow_consume: 0, holy_beam: 0, void_crush: 0,
      nature_bloom: 0, cosmic_nova: 0,
    },
    specialGemsUsed: 0,
    totalCrafted: 0,
    totalSwaps: 0,
    totalAbilitiesUsed: 0,
    largestSingleCrush: 0,
    legendaryCrushed: 0,
    epicCrushed: 0,
    initialized: true,
    version: 1,
  }
}

/** 获取状态 (直接返回) — Get state directly */
export function gcGetState(state: GemCrusherState): GemCrusherState {
  return { ...state }
}

/** 重置状态 — Reset state */
export function gcResetState(): GemCrusherState {
  return gcInitialState()
}

/** 获取当前等级 — Get current level */
export function gcGetLevel(state: GemCrusherState): number {
  return state.level
}

/** 获取总经验 — Get total XP */
export function gcGetTotalXp(state: GemCrusherState): number {
  return state.totalXp
}

/** 获取当前经验值 — Get current XP */
export function gcGetXp(state: GemCrusherState): number {
  return state.xp
}

/** 获取升级所需经验 — Get XP required for next level */
export function gcGetXpToNextLevel(state: GemCrusherState): number {
  const lvl = state.level
  if (lvl >= GC_MAX_LEVEL) return Infinity
  return GC_XP_TABLE[lvl]
}

/** 获取经验进度百分比 — Get XP progress percentage */
export function gcGetXpProgress(state: GemCrusherState): number {
  if (state.level >= GC_MAX_LEVEL) return 100
  const prevXp = GC_XP_TABLE[state.level - 1]
  const nextXp = GC_XP_TABLE[state.level]
  if (nextXp <= prevXp) return 100
  return Math.min(100, Math.max(0, ((state.xp - prevXp) / (nextXp - prevXp)) * 100))
}

/** 获取总分数 — Get total score */
export function gcGetTotalScore(state: GemCrusherState): number {
  return state.totalScore
}

/** 获取已粉碎宝石数 — Get total gems crushed */
export function gcGetGemsCrushed(state: GemCrusherState): number {
  return state.gemsCrushed
}

/** 获取连击数 — Get streak */
export function gcGetStreak(state: GemCrusherState): number {
  return state.streak
}

/** 获取最佳连击 — Get best streak */
export function gcGetBestStreak(state: GemCrusherState): number {
  return state.bestStreak
}

/** 获取当前连击 — Get current combo */
export function gcGetCurrentCombo(state: GemCrusherState): number {
  return state.currentCombo
}

/** 获取最佳连击 — Get best combo */
export function gcGetBestCombo(state: GemCrusherState): number {
  return state.bestCombo
}

/** 获取网格 — Get grid */
export function gcGetGrid(state: GemCrusherState): GemCell[][] {
  return state.grid.map(row => row.map(cell => ({ ...cell })))
}

/** 获取格子 — Get cell at position */
export function gcGetCell(state: GemCrusherState, row: number, col: number): GemCell | null {
  if (row < 0 || row >= GC_GRID_ROWS || col < 0 || col >= GC_GRID_COLS) return null
  return { ...state.grid[row][col] }
}

/** 获取矿井深度 — Get mine depth */
export function gcGetMineDepth(state: GemCrusherState): MineDepth {
  return state.mineDepth
}

/** 获取碎石机等级 — Get crusher level */
export function gcGetCrusherLevel(state: GemCrusherState): CrusherLevel {
  return state.crusherLevel
}

/** 获取碎石机乘数 — Get crusher multiplier */
export function gcGetCrusherMultiplier(state: GemCrusherState): number {
  const def = GC_CRUSHER_LEVELS.find(l => l.level === state.crusherLevel)
  return def?.bonusMultiplier ?? 1
}

/** 获取库存 — Get inventory */
export function gcGetInventory(state: GemCrusherState): GemItem[] {
  return state.inventory.map(item => ({ ...item }))
}

/** 获取库存中某种宝石的数量 — Get gem count by type */
export function gcGetGemCount(state: GemCrusherState, gemType: GemType, rarity: GemRarity): number {
  return state.inventory
    .filter(i => i.gemType === gemType && i.rarity === rarity)
    .reduce((sum, i) => sum + i.quantity, 0)
}

/** 获取成就列表 — Get achievements */
export function gcGetAchievements(state: GemCrusherState): string[] {
  return [...state.achievements]
}

/** 获取已解锁成就数 — Get unlocked achievement count */
export function gcGetAchievementCount(state: GemCrusherState): number {
  return state.achievements.length
}

/** 获取所有成就定义 — Get all achievement definitions */
export function gcGetAllAchievementDefs(): AchievementDef[] {
  return [...GC_ACHIEVEMENTS]
}

/** 获取宝石定义 — Get gem definition */
export function gcGetGemDef(gemType: GemType): GemDef | undefined {
  return GC_GEM_TYPES.find(g => g.type === gemType)
}

/** 获取所有宝石定义 — Get all gem definitions */
export function gcGetAllGemDefs(): GemDef[] {
  return [...GC_GEM_TYPES]
}

/** 获取稀有度定义 — Get rarity definition */
export function gcGetRarityDef(rarity: GemRarity): RarityDef | undefined {
  return GC_RARITIES.find(r => r.rarity === rarity)
}

/** 获取所有稀有度定义 — Get all rarity definitions */
export function gcGetAllRarityDefs(): RarityDef[] {
  return [...GC_RARITIES]
}

/** 获取特殊能力定义 — Get special ability definition */
export function gcGetSpecialAbilityDef(ability: SpecialAbility): SpecialAbilityDef | undefined {
  return GC_SPECIAL_ABILITIES.find(a => a.id === ability)
}

/** 获取所有特殊能力定义 — Get all special ability definitions */
export function gcGetAllSpecialAbilities(): SpecialAbilityDef[] {
  return [...GC_SPECIAL_ABILITIES]
}

/** 获取矿井深度信息 — Get mine depth info */
export function gcGetMineDepthInfo(depth: MineDepth): MineDepthDef | undefined {
  return GC_MINE_DEPTHS.find(d => d.depth === depth)
}

/** 获取所有矿井深度定义 — Get all mine depth definitions */
export function gcGetAllMineDepths(): MineDepthDef[] {
  return [...GC_MINE_DEPTHS]
}

/** 获取碎石机等级信息 — Get crusher level info */
export function gcGetCrusherLevelInfo(level: CrusherLevel): CrusherLevelDef | undefined {
  return GC_CRUSHER_LEVELS.find(l => l.level === level)
}

/** 获取所有碎石机等级定义 — Get all crusher level definitions */
export function gcGetAllCrusherLevels(): CrusherLevelDef[] {
  return [...GC_CRUSHER_LEVELS]
}

/** 获取碎石机升级费用 — Get crusher upgrade cost */
export function gcGetCrusherUpgradeCost(state: GemCrusherState): number {
  if (state.crusherLevel >= 10) return Infinity
  const nextLevel = (state.crusherLevel + 1) as CrusherLevel
  const def = GC_CRUSHER_LEVELS.find(l => l.level === nextLevel)
  return def?.unlockCost ?? Infinity
}

/** 检查是否可以升级碎石机 — Check if crusher can be upgraded */
export function gcCanUpgradeCrusher(state: GemCrusherState): boolean {
  if (state.crusherLevel >= 10) return false
  const cost = gcGetCrusherUpgradeCost(state)
  return state.totalScore >= cost
}

/** 获取玩家称号 — Get player title based on level */
export function gcGetPlayerTitle(state: GemCrusherState): string {
  const lvl = state.level
  if (lvl >= 40) return '💎 宝石大帝 Gem Emperor'
  if (lvl >= 35) return '👑 宝石宗师 Gem Grandmaster'
  if (lvl >= 30) return '⭐ 星辉矿师 Star Miner'
  if (lvl >= 25) return '🐉 龙矿守卫 Dragon Guardian'
  if (lvl >= 20) return '🔥 熔岩工匠 Magma Artisan'
  if (lvl >= 15) return '💎 深渊矿工 Abyss Digger'
  if (lvl >= 10) return '⛏️ 晶石猎人 Crystal Hunter'
  if (lvl >= 5) return '🌿 学徒矿工 Apprentice Miner'
  return '🪨 新手矿工 Novice Miner'
}

/** 获取稀有度颜色 — Get rarity color code */
export function gcGetRarityColor(rarity: GemRarity): string {
  return GC_RARITIES.find(r => r.rarity === rarity)?.color ?? '#9CA3AF'
}

/** 获取宝石颜色 — Get gem color */
export function gcGetGemColor(gemType: GemType): string {
  return GC_GEM_TYPES.find(g => g.type === gemType)?.color ?? '#9CA3AF'
}

/** 计算宝石分数 — Calculate gem score */
export function gcCalcGemScore(gemType: GemType, rarity: GemRarity, crusherMult: number): number {
  const base = gcGemBaseScore(gemType)
  const rarityMult = gcRarityScoreMult(rarity)
  return Math.floor(base * rarityMult * crusherMult)
}

/** 获取连击乘数 — Get combo multiplier */
export function gcGetComboMultiplier(combo: number): number {
  if (combo <= 1) return 1
  if (combo <= 3) return 1.5
  if (combo <= 5) return 2.0
  if (combo <= 8) return 3.0
  if (combo <= 12) return 4.0
  return 5.0
}

/** 检查每日是否已玩 — Check if daily has been played */
export function gcIsDailyPlayed(state: GemCrusherState): boolean {
  const today = gcDayKey()
  return state.dailyPlayed && state.dailyDate === today
}

/** 获取每日宝石冲刺 — Get daily gem rush */
export function gcGetDailyRush(state: GemCrusherState): DailyRush {
  // 基于日期种子的确定性每日数据 — Deterministic daily data from date seed
  const daySeed = gcHashSeed(new Date().getDate() + new Date().getMonth() * 31)
  const types: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'amethyst', 'topaz', 'opal', 'pearl']
  const challenges: Array<{ target: number; type: DailyRush['challengeType'] }> = [
    { target: 50, type: 'crush' },
    { target: 5, type: 'craft' },
    { target: 8, type: 'combo' },
    { target: 2000, type: 'score' },
  ]
  const rarities: GemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
  return {
    bonusGemType: types[gcRandomInt(daySeed, types.length)],
    bonusMultiplier: 1.5 + gcRandomInt(daySeed + 1, 5) * 0.5,
    bonusRarity: rarities[gcRandomInt(daySeed + 2, rarities.length)],
    challengeTarget: challenges[gcRandomInt(daySeed + 3, challenges.length)].target,
    challengeType: challenges[gcRandomInt(daySeed + 3, challenges.length)].type,
    reward: 500 + gcRandomInt(daySeed + 4, 10) * 200,
  }
}

/** 获取技能冷却状态 — Get ability cooldown status */
export function gcGetAbilityCooldown(state: GemCrusherState, ability: SpecialAbility): number {
  return state.abilityCooldowns[ability] ?? 0
}

/** 检查技能是否可用 — Check if ability is ready */
export function gcIsAbilityReady(state: GemCrusherState, ability: SpecialAbility): boolean {
  return (state.abilityCooldowns[ability] ?? 0) <= 0
}

/** 检查是否有有效移动 — Check if there are valid moves on grid */
export function gcHasValidMovesCheck(state: GemCrusherState): boolean {
  return gcHasValidMoves(state.grid.map(row => row.map(cell => ({ ...cell }))))
}

/** 获取最大等级 — Get max level */
export function gcGetMaxLevel(): number {
  return GC_MAX_LEVEL
}

/** 获取等级经验表 — Get XP table */
export function gcGetXpTable(): number[] {
  return [...GC_XP_TABLE]
}

/** 获取网格尺寸 — Get grid dimensions */
export function gcGetGridSize(): { rows: number; cols: number } {
  return { rows: GC_GRID_ROWS, cols: GC_GRID_COLS }
}

/** 计算合成费用 — Calculate craft cost */
export function gcGetCraftCost(state: GemCrusherState, gemType: GemType, rarity: GemRarity): number {
  const rarityIdx = GC_RARITIES.findIndex(r => r.rarity === rarity)
  const baseCost = (rarityIdx + 1) * 100
  const gemBase = gcGemBaseScore(gemType)
  return Math.floor(baseCost * (1 + gemBase / 20))
}

/** 检查是否可以合成 — Check if crafting is possible */
export function gcCanCraft(state: GemCrusherState, gemType: GemType, rarity: GemRarity): boolean {
  const cost = gcGetCraftCost(state, gemType, rarity)
  if (state.totalScore < cost) return false
  // 需要同类型、同稀有度3颗宝石 — Need 3 same gems
  const count = gcGetGemCount(state, gemType, rarity)
  return count >= 3
}

// ============================================================================
// State-Mutating Functions (return new state) — 状态变更函数
// ============================================================================

/** 执行粉碎 — Execute crush at position, returns new state */
export function gcCrushResult(state: GemCrusherState, row: number, col: number): GemCrusherState {
  if (row < 0 || row >= GC_GRID_ROWS || col < 0 || col >= GC_GRID_COLS) return state
  const cell = state.grid[row][col]
  if (!cell.gemType || cell.locked) return state

  // 临时交换并检查匹配 — Temporarily swap and check matches
  const gridCopy = state.grid.map(r => r.map(c => ({ ...c })))
  // We need a reference gem to find matches — 标记当前格
  // Simulate: we "activate" this cell and find all adjacent same-type matches
  let matches = gcFindAllMatches(gridCopy)

  // 如果没有预存匹配，尝试与相邻格交换 — If no matches, try swap with neighbors
  if (matches.length === 0) {
    const neighbors = [
      { r: row, c: col - 1 },
      { r: row, c: col + 1 },
      { r: row - 1, c: col },
      { r: row + 1, c: col },
    ]
    for (const nb of neighbors) {
      if (nb.r >= 0 && nb.r < GC_GRID_ROWS && nb.c >= 0 && nb.c < GC_GRID_COLS) {
        // Swap
        const tmp = gridCopy[row][col].gemType
        gridCopy[row][col].gemType = gridCopy[nb.r][nb.c].gemType
        gridCopy[nb.r][nb.c].gemType = tmp
        const found = gcFindAllMatches(gridCopy)
        if (found.length > 0) {
          matches = found
          // Keep the swap in place
          break
        }
        // Swap back
        gridCopy[nb.r][nb.c].gemType = gridCopy[row][col].gemType
        gridCopy[row][col].gemType = tmp
      }
    }
  }

  if (matches.length === 0) return state

  return gcProcessCrush(state, gridCopy, matches)
}

/** 处理粉碎逻辑 — Process crush logic internally */
function gcProcessCrush(state: GemCrusherState, grid: GemCell[][], matches: { row: number; col: number }[]): GemCrusherState {
  let newState = { ...state, grid: grid.map(r => r.map(c => ({ ...c }))) }

  // 计算分数 — Calculate score
  let totalScore = 0
  let totalXp = 0
  const crusherMult = gcGetCrusherMultiplier(state)
  const comboMult = gcGetComboMultiplier(state.currentCombo + 1)

  for (const m of matches) {
    const cell = newState.grid[m.row][m.col]
    if (cell.gemType) {
      const baseScore = gcCalcGemScore(cell.gemType, cell.rarity, crusherMult)
      totalScore += Math.floor(baseScore * comboMult)
      totalXp += Math.floor(5 * gcRarityXpMult(cell.rarity))

      // 统计稀有度 — Track rarity stats
      if (cell.rarity === 'legendary') newState = { ...newState, legendaryCrushed: newState.legendaryCrushed + 1 }
      if (cell.rarity === 'epic') newState = { ...newState, epicCrushed: newState.epicCrushed + 1 }
    }
  }

  // 清除匹配的格子 — Clear matched cells
  for (const m of matches) {
    newState.grid[m.row][m.col] = {
      ...newState.grid[m.row][m.col],
      gemType: null,
      marked: true,
    }
  }

  // 应用重力 — Apply gravity
  newState.grid = gcApplyGravity(newState.grid, Date.now())

  // 级联检查 — Cascade check
  const cascadeMatches = gcFindAllMatches(newState.grid)
  if (cascadeMatches.length > 0) {
    newState = gcProcessCrush(newState, newState.grid, cascadeMatches)
    totalScore += newState.totalScore - state.totalScore
  }

  // 更新连击 — Update combo
  const newCombo = state.currentCombo + 1
  const bestCombo = Math.max(state.bestCombo, newCombo)

  // 更新经验 — Update XP
  const newTotalXp = state.totalXp + totalXp
  const newLevel = gcCalcLevel(newTotalXp)
  const currentLvlXp = GC_XP_TABLE[newLevel - 1]
  const newXp = newTotalXp - currentLvlXp

  // 更新最大粉碎数 — Update largest single crush
  const largestCrush = Math.max(state.largestSingleCrush, matches.length)

  // 检查成就 — Check achievements
  const newStateForAch = { ...newState, level: newLevel, xp: newXp, totalXp: newTotalXp, totalScore: state.totalScore + totalScore, gemsCrushed: state.gemsCrushed + matches.length, bestCombo, largestSingleCrush: largestCrush }
  const newAch = gcCheckAchievementsInternal(newStateForAch)

  // 成就奖励 — Achievement rewards
  let achXp = 0
  let achScore = 0
  for (const achId of newAch) {
    const def = GC_ACHIEVEMENTS.find(a => a.id === achId)
    if (def) {
      achXp += def.rewardXp
      achScore += def.rewardScore
    }
  }

  const finalTotalXp = newTotalXp + achXp
  const finalLevel = gcCalcLevel(finalTotalXp)
  const finalXp = finalTotalXp - GC_XP_TABLE[finalLevel - 1]

  return {
    ...newStateForAch,
    level: finalLevel,
    xp: finalXp,
    totalXp: finalTotalXp,
    totalScore: state.totalScore + totalScore + achScore,
    gemsCrushed: state.gemsCrushed + matches.length,
    currentCombo: newCombo,
    bestCombo,
    largestSingleCrush: largestCrush,
    achievements: [...state.achievements, ...newAch],
    dailyRushProgress: state.dailyRushProgress + matches.length,
  }
}

/** 交换两个宝石 — Swap two gems */
export function gcSwapResult(state: GemCrusherState, r1: number, c1: number, r2: number, c2: number): GemCrusherState {
  if (r1 === r2 && c1 === c2) return state
  if (
    r1 < 0 || r1 >= GC_GRID_ROWS || c1 < 0 || c1 >= GC_GRID_COLS ||
    r2 < 0 || r2 >= GC_GRID_ROWS || c2 < 0 || c2 >= GC_GRID_COLS
  ) return state

  const grid = state.grid.map(r => r.map(c => ({ ...c })))
  const cell1 = grid[r1][c1]
  const cell2 = grid[r2][c2]

  if (cell1.locked || cell2.locked) return state
  if (!cell1.gemType || !cell2.gemType) return state

  // 只允许相邻交换 — Only allow adjacent swaps
  const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2)
  if (dist !== 1) return state

  // 交换 — Swap
  const tmpType = grid[r1][c1].gemType
  const tmpRarity = grid[r1][c1].rarity
  grid[r1][c1].gemType = grid[r2][c2].gemType
  grid[r1][c1].rarity = grid[r2][c2].rarity
  grid[r2][c2].gemType = tmpType
  grid[r2][c2].rarity = tmpRarity

  // 检查匹配 — Check for matches
  const matches = gcFindAllMatches(grid)
  if (matches.length === 0) {
    // 交换回去 — Swap back if no match
    const t = grid[r1][c1].gemType
    const tr = grid[r1][c1].rarity
    grid[r1][c1].gemType = grid[r2][c2].gemType
    grid[r1][c1].rarity = grid[r2][c2].rarity
    grid[r2][c2].gemType = t
    grid[r2][c2].rarity = tr
    return state
  }

  const newState = { ...state, grid, totalSwaps: state.totalSwaps + 1, currentCombo: 0 }
  return gcProcessCrush(newState, grid, matches)
}

/** 采矿 — Mine a gem from current depth */
export function gcMineResult(state: GemCrusherState): GemCrusherState {
  const depthDef = GC_MINE_DEPTHS.find(d => d.depth === state.mineDepth)
  if (!depthDef) return state

  const seed = Date.now() + state.totalMined
  const rarity = gcPickRarity(seed, depthDef.epicChance, depthDef.legendaryChance)
  const types: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'amethyst', 'topaz', 'opal', 'pearl']
  const gemType = types[gcRandomInt(seed + 1, types.length)]

  // 基于稀有度修正类型权重 — Bias gem type by rarity
  let selectedType = gemType
  if (rarity === 'legendary') {
    // 传说级更可能是钻石或红宝石 — Legendary more likely diamond/ruby
    const legendaryBias = [gcRandomInt(seed + 2, 100) < 40 ? 'diamond' : gemType][0]
    selectedType = legendaryBias as GemType
  }

  const gem: GemItem = {
    id: gcGenId(),
    gemType: selectedType,
    rarity,
    quantity: 1,
    acquiredAt: Date.now(),
    source: 'mined',
  }

  const scoreGain = Math.floor(gcGemBaseScore(selectedType) * gcRarityScoreMult(rarity) * (1 + depthDef.baseGemScore / 10))
  const xpGain = Math.floor(10 * gcRarityXpMult(rarity))

  const newTotalXp = state.totalXp + xpGain
  const newLevel = gcCalcLevel(newTotalXp)
  const newXp = newTotalXp - GC_XP_TABLE[newLevel - 1]

  const inventory = [...state.inventory, gem]
  const newState = {
    ...state,
    inventory,
    totalScore: state.totalScore + scoreGain,
    totalMined: state.totalMined + 1,
    level: newLevel,
    xp: newXp,
    totalXp: newTotalXp,
    dailyRushProgress: state.dailyRushProgress + 1,
  }

  const newAch = gcCheckAchievementsInternal(newState)
  return { ...newState, achievements: [...state.achievements, ...newAch] }
}

/** 合成宝石 — Craft gem (combine 3 same → higher tier) */
export function gcCraftResult(state: GemCrusherState, gemType: GemType, rarity: GemRarity): GemCrusherState {
  const cost = gcGetCraftCost(state, gemType, rarity)
  if (state.totalScore < cost) return state

  const count = gcGetGemCount(state, gemType, rarity)
  if (count < 3) return state

  // Check if we can go higher rarity — 不能超过传说级
  const rarityIdx = GC_RARITIES.findIndex(r => r.rarity === rarity)
  if (rarityIdx >= GC_RARITIES.length - 1) return state

  const nextRarity = GC_RARITIES[rarityIdx + 1].rarity

  // Remove 3 gems from inventory — 从库存移除3颗
  let remaining = count - 3
  const newInventory = state.inventory
    .map(i => {
      if (i.gemType === gemType && i.rarity === rarity) {
        const remove = Math.min(i.quantity, remaining)
        remaining -= remove
        return remove > 0 ? { ...i, quantity: i.quantity - remove } : null
      }
      return i
    })
    .filter((i): i is GemItem => i !== null && i.quantity > 0)

  // Create crafted gem — 创建合成宝石
  const craftedGem: GemItem = {
    id: gcGenId(),
    gemType,
    rarity: nextRarity,
    quantity: 1,
    acquiredAt: Date.now(),
    source: 'crafted',
  }

  const xpGain = Math.floor(25 * gcRarityXpMult(nextRarity))
  const newTotalXp = state.totalXp + xpGain
  const newLevel = gcCalcLevel(newTotalXp)
  const newXp = newTotalXp - GC_XP_TABLE[newLevel - 1]

  const newState = {
    ...state,
    inventory: [...newInventory, craftedGem],
    totalScore: state.totalScore - cost,
    totalCrafted: state.totalCrafted + 1,
    level: newLevel,
    xp: newXp,
    totalXp: newTotalXp,
  }

  const newAch = gcCheckAchievementsInternal(newState)
  return { ...newState, achievements: [...state.achievements, ...newAch] }
}

/** 升级碎石机 — Upgrade crusher */
export function gcUpgradeCrusherResult(state: GemCrusherState): GemCrusherState {
  if (state.crusherLevel >= 10) return state
  const cost = gcGetCrusherUpgradeCost(state)
  if (state.totalScore < cost || !isFinite(cost)) return state

  const newLevel = (state.crusherLevel + 1) as CrusherLevel
  const newState = {
    ...state,
    crusherLevel: newLevel,
    totalScore: state.totalScore - cost,
  }

  const newAch = gcCheckAchievementsInternal(newState)
  return { ...newState, achievements: [...state.achievements, ...newAch] }
}

/** 使用特殊能力 — Use special ability */
export function gcUseAbilityResult(state: GemCrusherState, ability: SpecialAbility, targetRow?: number, targetCol?: number): GemCrusherState {
  if (!gcIsAbilityReady(state, ability)) return state

  const def = GC_SPECIAL_ABILITIES.find(a => a.id === ability)
  if (!def) return state

  const grid = state.grid.map(r => r.map(c => ({ ...c })))
  let affected = 0
  let scoreGain = 0

  switch (def.targetPattern) {
    case 'area': {
      // 3×3 area around target — 目标周围3×3
      if (targetRow === undefined || targetCol === undefined) return state
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = targetRow + dr
          const c = targetCol + dc
          if (r >= 0 && r < GC_GRID_ROWS && c >= 0 && c < GC_GRID_COLS && grid[r][c].gemType) {
            scoreGain += gcCalcGemScore(grid[r][c].gemType!, grid[r][c].rarity, gcGetCrusherMultiplier(state))
            grid[r][c] = gcEmptyCell(r, c)
            affected++
          }
        }
      }
      break
    }
    case 'cross': {
      // Row + column cross pattern — 行列十字
      if (targetRow === undefined || targetCol === undefined) return state
      const range = def.range || 1
      for (let i = -range; i <= range; i++) {
        const r1 = targetRow + i
        const c1 = targetCol + i
        if (r1 >= 0 && r1 < GC_GRID_ROWS && grid[r1][targetCol].gemType) {
          scoreGain += gcCalcGemScore(grid[r1][targetCol].gemType!, grid[r1][targetCol].rarity, gcGetCrusherMultiplier(state))
          grid[r1][targetCol] = gcEmptyCell(r1, targetCol)
          affected++
        }
        if (targetCol + i >= 0 && targetCol + i < GC_GRID_COLS && grid[targetRow][targetCol + i].gemType) {
          scoreGain += gcCalcGemScore(grid[targetRow][targetCol + i].gemType!, grid[targetRow][targetCol + i].rarity, gcGetCrusherMultiplier(state))
          grid[targetRow][targetCol + i] = gcEmptyCell(targetRow, targetCol + i)
          affected++
        }
      }
      break
    }
    case 'row': {
      // Clear entire row — 清除整行
      const r = targetRow ?? 0
      for (let c = 0; c < GC_GRID_COLS; c++) {
        if (grid[r][c].gemType) {
          scoreGain += gcCalcGemScore(grid[r][c].gemType!, grid[r][c].rarity, gcGetCrusherMultiplier(state))
          grid[r][c] = gcEmptyCell(r, c)
          affected++
        }
      }
      break
    }
    case 'col': {
      // Clear entire column — 清除整列
      const c = targetCol ?? 0
      for (let r = 0; r < GC_GRID_ROWS; r++) {
        if (grid[r][c].gemType) {
          scoreGain += gcCalcGemScore(grid[r][c].gemType!, grid[r][c].rarity, gcGetCrusherMultiplier(state))
          grid[r][c] = gcEmptyCell(r, c)
          affected++
        }
      }
      break
    }
    case 'random': {
      // Destroy N random gems — 随机摧毁N颗
      const allCells: GemCell[] = []
      for (let r = 0; r < GC_GRID_ROWS; r++) {
        for (let c = 0; c < GC_GRID_COLS; c++) {
          if (grid[r][c].gemType && !grid[r][c].locked) allCells.push(grid[r][c])
        }
      }
      const toRemove = Math.min(def.range, allCells.length)
      for (let i = 0; i < toRemove; i++) {
        const idx = gcRandomInt(Date.now() + i, allCells.length)
        const cell = allCells.splice(idx, 1)[0]
        if (cell.gemType) {
          scoreGain += gcCalcGemScore(cell.gemType, cell.rarity, gcGetCrusherMultiplier(state))
          grid[cell.row][cell.col] = gcEmptyCell(cell.row, cell.col)
          affected++
        }
      }
      break
    }
    case 'all': {
      if (ability === 'cosmic_nova') {
        // Destroy all of one type — 消灭某一类全部
        const types: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'amethyst', 'topaz', 'opal', 'pearl']
        const targetType = types[gcRandomInt(Date.now(), types.length)]
        for (let r = 0; r < GC_GRID_ROWS; r++) {
          for (let c = 0; c < GC_GRID_COLS; c++) {
            if (grid[r][c].gemType === targetType) {
              scoreGain += gcCalcGemScore(targetType, grid[r][c].rarity, gcGetCrusherMultiplier(state))
              grid[r][c] = gcEmptyCell(r, c)
              affected++
            }
          }
        }
      } else if (ability === 'earth_quake') {
        // Shuffle and auto-crush — 洗牌并自动消除
        const shuffled = gcShuffleGridInternal(grid, Date.now())
        for (let r = 0; r < GC_GRID_ROWS; r++) {
          for (let c = 0; c < GC_GRID_COLS; c++) {
            grid[r][c] = shuffled[r][c]
          }
        }
        const shuffleMatches = gcFindAllMatches(grid)
        for (const m of shuffleMatches) {
          if (grid[m.row][m.col].gemType) {
            scoreGain += gcCalcGemScore(grid[m.row][m.col].gemType!, grid[m.row][m.col].rarity, gcGetCrusherMultiplier(state))
            grid[m.row][m.col] = gcEmptyCell(m.row, m.col)
            affected++
          }
        }
      } else if (ability === 'nature_bloom') {
        // Fill empty cells with emeralds — 填充空格为翡翠
        for (let r = 0; r < GC_GRID_ROWS; r++) {
          for (let c = 0; c < GC_GRID_COLS; c++) {
            if (!grid[r][c].gemType) {
              grid[r][c] = { row: r, col: c, gemType: 'emerald', rarity: 'common', locked: false, special: null, marked: false }
              affected++
            }
          }
        }
      }
      break
    }
  }

  if (affected === 0) return state

  // Apply gravity after ability — 技能后应用重力
  const finalGrid = gcApplyGravity(grid, Date.now())

  const xpGain = Math.floor(def.power * 0.5)
  const newTotalXp = state.totalXp + xpGain
  const newLevel = gcCalcLevel(newTotalXp)
  const newXp = newTotalXp - GC_XP_TABLE[newLevel - 1]

  return {
    ...state,
    grid: finalGrid,
    totalScore: state.totalScore + scoreGain,
    gemsCrushed: state.gemsCrushed + affected,
    level: newLevel,
    xp: newXp,
    totalXp: newTotalXp,
    totalAbilitiesUsed: state.totalAbilitiesUsed + 1,
    specialGemsUsed: state.specialGemsUsed + 1,
    abilityCooldowns: {
      ...state.abilityCooldowns,
      [ability]: def.cooldown,
    },
    currentCombo: 0,
  }
}

/** 深入矿井 — Go deeper in mine */
export function gcGoDeeperResult(state: GemCrusherState): GemCrusherState {
  if (state.mineDepth >= 5) return state
  const nextDepth = (state.mineDepth + 1) as MineDepth
  const depthDef = GC_MINE_DEPTHS.find(d => d.depth === nextDepth)
  if (!depthDef || state.level < depthDef.unlockLevel) return state

  const newState = { ...state, mineDepth: nextDepth }
  const newAch = gcCheckAchievementsInternal(newState)
  return { ...newState, achievements: [...state.achievements, ...newAch] }
}

/** 减少技能冷却 — Reduce ability cooldowns */
export function gcTickCooldowns(state: GemCrusherState): GemCrusherState {
  const newCooldowns = { ...state.abilityCooldowns }
  for (const key of Object.keys(newCooldowns) as SpecialAbility[]) {
    if (newCooldowns[key] > 0) {
      newCooldowns[key] = newCooldowns[key] - 1
    }
  }
  return { ...state, abilityCooldowns: newCooldowns }
}

/** 重置每日 — Reset daily state */
export function gcClaimDailyRewardResult(state: GemCrusherState): GemCrusherState {
  if (gcIsDailyPlayed(state)) return state

  const daily = gcGetDailyRush(state)
  const streakBonus = 1 + state.streak * 0.05
  const reward = Math.floor(daily.reward * streakBonus)

  // 赠送一颗随机宝石 — Gift a random gem
  const types: GemType[] = ['ruby', 'sapphire', 'emerald', 'diamond', 'amethyst', 'topaz', 'opal', 'pearl']
  const giftType = types[gcRandomInt(Date.now(), types.length)]
  const giftGem: GemItem = {
    id: gcGenId(),
    gemType: giftType,
    rarity: daily.bonusRarity ?? 'uncommon',
    quantity: 1,
    acquiredAt: Date.now(),
    source: 'daily',
  }

  // 更新连击 — Update streak
  const today = gcDayKey()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  let newStreak = state.lastPlayDate === yesterday ? state.streak + 1 : 1
  const bestStreak = Math.max(state.bestStreak, newStreak)

  const newState = {
    ...state,
    dailyPlayed: true,
    dailyDate: today,
    dailyRushProgress: 0,
    totalScore: state.totalScore + reward,
    streak: newStreak,
    bestStreak,
    lastPlayDate: today,
    inventory: [...state.inventory, giftGem],
  }

  const newAch = gcCheckAchievementsInternal(newState)
  let achXp = 0
  for (const achId of newAch) {
    const def = GC_ACHIEVEMENTS.find(a => a.id === achId)
    if (def) achXp += def.rewardXp
  }

  const finalTotalXp = newState.totalXp + achXp
  const finalLevel = gcCalcLevel(finalTotalXp)
  const finalXp = finalTotalXp - GC_XP_TABLE[finalLevel - 1]

  return {
    ...newState,
    level: finalLevel,
    xp: finalXp,
    totalXp: finalTotalXp,
    achievements: [...state.achievements, ...newAch],
  }
}

/** 洗牌网格 — Shuffle grid (returns new state) */
export function gcShuffleGridResult(state: GemCrusherState): GemCrusherState {
  const newGrid = gcShuffleGridInternal(state.grid, Date.now())
  return { ...state, grid: newGrid, currentCombo: 0 }
}

/** 重置连击 — Reset combo */
export function gcResetCombo(state: GemCrusherState): GemCrusherState {
  return { ...state, currentCombo: 0 }
}

/** 获取玩家统计 — Get player statistics */
export function gcGetPlayerStats(state: GemCrusherState): Record<string, number> {
  return {
    level: state.level,
    xp: state.xp,
    totalXp: state.totalXp,
    totalScore: state.totalScore,
    gemsCrushed: state.gemsCrushed,
    mineDepth: state.mineDepth,
    crusherLevel: state.crusherLevel,
    streak: state.streak,
    bestStreak: state.bestStreak,
    bestCombo: state.bestCombo,
    totalMined: state.totalMined,
    totalCrafted: state.totalCrafted,
    totalSwaps: state.totalSwaps,
    totalAbilitiesUsed: state.totalAbilitiesUsed,
    largestSingleCrush: state.largestSingleCrush,
    legendaryCrushed: state.legendaryCrushed,
    epicCrushed: state.epicCrushed,
    specialGemsUsed: state.specialGemsUsed,
    achievementCount: state.achievements.length,
    inventorySize: state.inventory.reduce((s, i) => s + i.quantity, 0),
    crusherMultiplier: gcGetCrusherMultiplier(state),
  }
}

/** 获取成就进度 — Get achievement progress */
export function gcGetAchievementProgress(state: GemCrusherState, achievementId: string): number {
  const def = GC_ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!def) return 0
  const stateVal = (state as unknown as Record<string, number>)[def.conditionKey] ?? 0
  return Math.min(1, stateVal / def.targetValue)
}

/** 检查成就是否解锁 — Check if achievement is unlocked */
export function gcIsAchievementUnlocked(state: GemCrusherState, achievementId: string): boolean {
  return state.achievements.includes(achievementId)
}

/** 获取游戏状态摘要 — Get game state summary */
export function gcGetGameStateSummary(state: GemCrusherState): string {
  return [
    `矿工等级 Lv.${state.level}`,
    `称号: ${gcGetPlayerTitle(state)}`,
    `总分: ${state.totalScore.toLocaleString()}`,
    `已粉碎: ${state.gemsCrushed}`,
    `最大连击: ${state.bestCombo}`,
    `连续登录: ${state.streak}天`,
    `碎石机: Lv.${state.crusherLevel}`,
    `矿井深度: ${state.mineDepth}`,
    `成就: ${state.achievements.length}/${GC_ACHIEVEMENTS.length}`,
  ].join(' | ')
}

/** 获取经验等级颜色 — Get level-based color */
export function gcGetLevelColor(level: number): string {
  if (level >= 35) return '#F97316'
  if (level >= 25) return '#A855F7'
  if (level >= 15) return '#3B82F6'
  if (level >= 8) return '#10B981'
  return '#9CA3AF'
}

/** 获取连击等级 — Get combo tier name */
export function gcGetComboTier(combo: number): { name: string; nameZh: string; color: string } {
  if (combo >= 12) return { name: 'GODLIKE', nameZh: '神级连击', color: '#EF4444' }
  if (combo >= 8) return { name: 'LEGENDARY', nameZh: '传说连击', color: '#F97316' }
  if (combo >= 5) return { name: 'EPIC', nameZh: '史诗连击', color: '#A855F7' }
  if (combo >= 3) return { name: 'RARE', nameZh: '稀有连击', color: '#3B82F6' }
  if (combo >= 2) return { name: 'NICE', nameZh: '不错', color: '#10B981' }
  return { name: 'NORMAL', nameZh: '普通', color: '#9CA3AF' }
}

/** 从库存移除宝石 — Remove gem from inventory */
export function gcRemoveFromInventory(state: GemCrusherState, gemId: string): GemCrusherState {
  return {
    ...state,
    inventory: state.inventory.filter(i => i.id !== gemId),
  }
}

/** 添加宝石到库存 — Add gem to inventory */
export function gcAddToInventory(state: GemCrusherState, gem: GemItem): GemCrusherState {
  return {
    ...state,
    inventory: [...state.inventory, gem],
  }
}

/** 检查矿井是否可深入 — Check if mine can go deeper */
export function gcCanGoDeeper(state: GemCrusherState): boolean {
  if (state.mineDepth >= 5) return false
  const nextDepth = (state.mineDepth + 1) as MineDepth
  const def = GC_MINE_DEPTHS.find(d => d.depth === nextDepth)
  return def ? state.level >= def.unlockLevel : false
}

/** 获取每日进度 — Get daily rush progress */
export function gcGetDailyProgress(state: GemCrusherState): number {
  return state.dailyRushProgress
}

/** 检查是否达到每日目标 — Check if daily target is reached */
export function gcIsDailyTargetReached(state: GemCrusherState): boolean {
  const daily = gcGetDailyRush(state)
  if (daily.challengeType === 'crush' || daily.challengeType === 'craft') {
    return state.dailyRushProgress >= daily.challengeTarget
  }
  return false
}

/** 获取自动粉碎概率 — Get auto crush chance */
export function gcGetAutoCrushChance(state: GemCrusherState): number {
  const def = GC_CRUSHER_LEVELS.find(l => l.level === state.crusherLevel)
  return def?.autoCrushChance ?? 0
}

/** 获取碎石机能量 — Get crusher energy */
export function gcGetCrusherEnergy(state: GemCrusherState): number {
  return state.crusherEnergy
}

/** 添加碎石机能量 — Add crusher energy */
export function gcAddCrusherEnergy(state: GemCrusherState, amount: number): GemCrusherState {
  return {
    ...state,
    crusherEnergy: Math.min(200, state.crusherEnergy + amount),
  }
}

/** 尝试自动粉碎 — Try auto crush based on crusher level */
export function gcTryAutoCrush(state: GemCrusherState): GemCrusherState {
  const chance = gcGetAutoCrushChance(state)
  if (chance <= 0) return state
  if (Math.random() > chance) return state

  // 随机选一个有宝石的格子 — Pick a random non-empty cell
  const candidates: { row: number; col: number }[] = []
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c < GC_GRID_COLS; c++) {
      if (state.grid[r][c].gemType && !state.grid[r][c].locked) {
        candidates.push({ row: r, col: c })
      }
    }
  }
  if (candidates.length === 0) return state

  const pick = candidates[Math.floor(Math.random() * candidates.length)]
  return gcCrushResult(state, pick.row, pick.col)
}

/** 刷新网格 — Refresh grid entirely */
export function gcRefreshGrid(state: GemCrusherState): GemCrusherState {
  return {
    ...state,
    grid: gcGenerateGrid(Date.now()),
    currentCombo: 0,
  }
}

/** 设置矿井深度 — Set mine depth directly */
export function gcSetMineDepth(state: GemCrusherState, depth: MineDepth): GemCrusherState {
  return { ...state, mineDepth: depth }
}

/** 检查网格是否为空 — Check if grid is empty */
export function gcIsGridEmpty(state: GemCrusherState): boolean {
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c < GC_GRID_COLS; c++) {
      if (state.grid[r][c].gemType) return false
    }
  }
  return true
}

/** 统计网格上每种宝石的数量 — Count gems by type on grid */
export function gcCountGemsOnGrid(state: GemCrusherState): Record<GemType, number> {
  const counts: Record<GemType, number> = {
    ruby: 0, sapphire: 0, emerald: 0, diamond: 0,
    amethyst: 0, topaz: 0, opal: 0, pearl: 0,
  }
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c < GC_GRID_COLS; c++) {
      const t = state.grid[r][c].gemType
      if (t) counts[t]++
    }
  }
  return counts
}

/** 统计网格上各稀有度宝石数量 — Count gems by rarity on grid */
export function gcCountRaritiesOnGrid(state: GemCrusherState): Record<GemRarity, number> {
  const counts: Record<GemRarity, number> = {
    common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
  }
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c < GC_GRID_COLS; c++) {
      counts[state.grid[r][c].rarity]++
    }
  }
  return counts
}

/** 计算网格总价值 — Calculate total grid value */
export function gcGetGridValue(state: GemCrusherState): number {
  let total = 0
  const crusherMult = gcGetCrusherMultiplier(state)
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c < GC_GRID_COLS; c++) {
      const cell = state.grid[r][c]
      if (cell.gemType) {
        total += gcCalcGemScore(cell.gemType, cell.rarity, crusherMult)
      }
    }
  }
  return total
}

/** 获取所有锁定格子 — Get all locked cells */
export function gcGetLockedCells(state: GemCrusherState): GemCell[] {
  const locked: GemCell[] = []
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c < GC_GRID_COLS; c++) {
      if (state.grid[r][c].locked) locked.push({ ...state.grid[r][c] })
    }
  }
  return locked
}

/** 检查两格是否可交换 — Check if two cells can be swapped */
export function gcCanSwap(state: GemCrusherState, r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2 && c1 === c2) return false
  const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2)
  if (dist !== 1) return false
  const cell1 = gcGetCell(state, r1, c1)
  const cell2 = gcGetCell(state, r2, c2)
  if (!cell1 || !cell2) return false
  if (cell1.locked || cell2.locked) return false
  if (!cell1.gemType || !cell2.gemType) return false
  return true
}

/** 获取宝石描述 — Get gem description with rarity */
export function gcGetGemDescription(gemType: GemType, rarity: GemRarity): string {
  const gemDef = GC_GEM_TYPES.find(g => g.type === gemType)
  const rarityDef = GC_RARITIES.find(r => r.rarity === rarity)
  if (!gemDef || !rarityDef) return 'Unknown gem'
  return `${rarityDef.labelZh} ${gemDef.nameZh} — ${gemDef.description}`
}

/** 获取经验等级对应标题 — Get XP level milestone title */
export function gcGetLevelMilestone(level: number): { title: string; titleZh: string; reward: string } {
  const milestones: Array<{ lvl: number; title: string; titleZh: string; reward: string }> = [
    { lvl: 1, title: 'Novice', titleZh: '新手', reward: '基础矿镐' },
    { lvl: 5, title: 'Apprentice', titleZh: '学徒', reward: '水晶矿镐' },
    { lvl: 10, title: 'Journeyman', titleZh: '熟练工', reward: '钢铁粉碎机' },
    { lvl: 15, title: 'Expert', titleZh: '专家', reward: '龙骨矿镐' },
    { lvl: 20, title: 'Veteran', titleZh: '老手', reward: '熔岩锤' },
    { lvl: 25, title: 'Master', titleZh: '大师', reward: '星辰熔炉' },
    { lvl: 30, title: 'Grandmaster', titleZh: '宗师', reward: '龙颚碎石机' },
    { lvl: 35, title: 'Legend', titleZh: '传说', reward: '虚空湮灭器' },
    { lvl: 40, title: 'Emperor', titleZh: '大帝', reward: '宇宙之心' },
  ]
  let result = milestones[0]
  for (const m of milestones) {
    if (level >= m.lvl) result = m
  }
  return result
}

/** 检查是否所有成就已解锁 — Check if all achievements are unlocked */
export function gcIsAllAchievementsUnlocked(state: GemCrusherState): boolean {
  return state.achievements.length >= GC_ACHIEVEMENTS.length
}

/** 获取未解锁成就 — Get locked achievements */
export function gcGetLockedAchievements(state: GemCrusherState): AchievementDef[] {
  return GC_ACHIEVEMENTS.filter(a => !state.achievements.includes(a.id))
}

/** 获取下一个解锁的矿井深度 — Get next mine depth unlock info */
export function gcGetNextDepthUnlock(state: GemCrusherState): MineDepthDef | null {
  for (const depth of GC_MINE_DEPTHS) {
    if (depth.depth > state.mineDepth) {
      return depth
    }
  }
  return null
}

/** 获取已解锁的技能 — Get unlocked abilities */
export function gcGetUnlockedAbilities(state: GemCrusherState): SpecialAbilityDef[] {
  // 前两个技能默认解锁，其余随等级开放 — First 2 unlocked by default
  const abilityUnlocks: Array<{ ability: SpecialAbility; level: number }> = [
    { ability: 'fire_blast', level: 1 },
    { ability: 'ice_shatter', level: 1 },
    { ability: 'lightning_strike', level: 5 },
    { ability: 'wind_vortex', level: 8 },
    { ability: 'shadow_consume', level: 8 },
    { ability: 'earth_quake', level: 12 },
    { ability: 'holy_beam', level: 18 },
    { ability: 'void_crush', level: 22 },
    { ability: 'nature_bloom', level: 28 },
    { ability: 'cosmic_nova', level: 35 },
  ]
  return abilityUnlocks
    .filter(u => state.level >= u.level)
    .map(u => GC_SPECIAL_ABILITIES.find(a => a.id === u.ability)!)
    .filter(Boolean)
}

/** 获取锁定格子的坐标列表 — Get locked cell positions */
export function gcGetLockedPositions(state: GemCrusherState): Array<{ row: number; col: number }> {
  const positions: Array<{ row: number; col: number }> = []
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c < GC_GRID_COLS; c++) {
      if (state.grid[r][c].locked) positions.push({ row: r, col: c })
    }
  }
  return positions
}

/** 计算单步最大分数 — Calculate max possible single crush score */
export function gcCalcMaxSingleCrush(state: GemCrusherState): number {
  const crusherMult = gcGetCrusherMultiplier(state)
  let maxScore = 0
  for (let r = 0; r < GC_GRID_ROWS; r++) {
    for (let c = 0; c < GC_GRID_COLS; c++) {
      const cell = state.grid[r][c]
      if (cell.gemType && !cell.locked) {
        const score = gcCalcGemScore(cell.gemType, cell.rarity, crusherMult)
        if (score > maxScore) maxScore = score
      }
    }
  }
  return maxScore * gcGetComboMultiplier(state.bestCombo)
}

// ============================================================================
// Default Export — React Hook (default export)
// ============================================================================

/** 返回类型 — Hook return type */
export interface UseGemCrusherReturn extends GemCrusherState {
  // Actions — 动作方法
  gcCrush: (row: number, col: number) => void
  gcSwap: (r1: number, c1: number, r2: number, c2: number) => void
  gcMine: () => void
  gcCraft: (gemType: GemType, rarity: GemRarity) => void
  gcUpgradeCrusher: () => void
  gcUseAbility: (ability: SpecialAbility, targetRow?: number, targetCol?: number) => void
  gcGoDeeper: () => void
  gcClaimDaily: () => void
  gcShuffleGrid: () => void
  gcRefreshGrid: () => void
  gcResetCombo: () => void
  gcResetState: () => void
  gcTickCooldowns: () => void
  gcTryAutoCrush: () => void

  // Getters — 纯数据访问（同步）
  gcGetPlayerTitle: () => string
  gcGetPlayerStats: () => Record<string, number>
  gcGetGridSize: () => { rows: number; cols: number }
}

/**
 * useGemCrusher — 主游戏 Hook
 * 宝石粉碎游戏的主入口点，封装所有状态和操作。
 */
export default function useGemCrusher(initialState?: GemCrusherState): UseGemCrusherReturn {
  const [state, setState] = useState<GemCrusherState>(
    () => initialState || gcInitialState()
  )

  // Actions wrapped in useCallback for stability
  const gcCrush = useCallback((row: number, col: number) => {
    setState(s => gcCrushResult(s, row, col))
  }, [])

  const gcSwap = useCallback((r1: number, c1: number, r2: number, c2: number) => {
    setState(s => gcSwapResult(s, r1, c1, r2, c2))
  }, [])

  const gcMine = useCallback(() => {
    setState(s => gcMineResult(s))
  }, [])

  const gcCraft = useCallback((gemType: GemType, rarity: GemRarity) => {
    setState(s => gcCraftResult(s, gemType, rarity))
  }, [])

  const gcUpgradeCrusher = useCallback(() => {
    setState(s => gcUpgradeCrusherResult(s))
  }, [])

  const gcUseAbility = useCallback((ability: SpecialAbility, targetRow?: number, targetCol?: number) => {
    setState(s => gcUseAbilityResult(s, ability, targetRow, targetCol))
  }, [])

  const gcGoDeeper = useCallback(() => {
    setState(s => gcGoDeeperResult(s))
  }, [])

  const gcClaimDaily = useCallback(() => {
    setState(s => gcClaimDailyRewardResult(s))
  }, [])

  const gcShuffleGridAction = useCallback(() => {
    setState(s => gcShuffleGridResult(s))
  }, [])

  const gcRefreshGridAction = useCallback(() => {
    setState(s => gcRefreshGrid(s))
  }, [])

  const gcResetComboAction = useCallback(() => {
    setState(s => gcResetCombo(s))
  }, [])

  const gcResetStateAction = useCallback(() => {
    setState(gcInitialState())
  }, [])

  const gcTickCooldownsAction = useCallback(() => {
    setState(s => gcTickCooldowns(s))
  }, [])

  const gcTryAutoCrushAction = useCallback(() => {
    setState(s => gcTryAutoCrush(s))
  }, [])

  // Getters — 纯数据访问
  const gcPlayerTitleGetter = useCallback(() => {
    return gcGetPlayerTitle(state)
  }, [state])

  const gcPlayerStatsGetter = useCallback(() => {
    return gcGetPlayerStats(state)
  }, [state])

  const gcGetGridSize = useCallback(() => {
    return { rows: GC_GRID_ROWS, cols: GC_GRID_COLS }
  }, [])

  return {
    ...state,
    // Actions
    gcCrush,
    gcSwap,
    gcMine,
    gcCraft,
    gcUpgradeCrusher,
    gcUseAbility,
    gcGoDeeper,
    gcClaimDaily,
    gcShuffleGrid: gcShuffleGridAction,
    gcRefreshGrid: gcRefreshGridAction,
    gcResetCombo: gcResetComboAction,
    gcResetState: gcResetStateAction,
    gcTickCooldowns: gcTickCooldownsAction,
    gcTryAutoCrush: gcTryAutoCrushAction,
    // Getters
    gcGetPlayerTitle: gcPlayerTitleGetter,
    gcGetPlayerStats: gcPlayerStatsGetter,
    gcGetGridSize: gcGetGridSize,
  }
}
