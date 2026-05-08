/**
 * powerup-factory-wire.ts
 *
 * Power-Up Factory system wire for the Word Snake game (单词贪吃蛇).
 * Provides a comprehensive crafting & production pipeline with 12 materials,
 * 20+ recipes, production queues, power-up combining, daily deals, and
 * blueprint collection — backed by a Zustand store with persist middleware.
 *
 * Storage key: ws_powerup_factory
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// Types & Interfaces
// ═══════════════════════════════════════════════════════════════════

export type MaterialRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type PowerUpEffectType =
  | 'speed_boost'
  | 'score_multiplier'
  | 'shield'
  | 'magnet'
  | 'extra_life'
  | 'ghost_mode'
  | 'time_slow'
  | 'word_reveal'
  | 'lucky_charm'
  | 'invincibility'
  | 'word_bomb'
  | 'xp_boost'
  | 'score_storm'
  | 'phase_shift'
  | 'gravity_well'
  | 'cosmic_power'
  | 'time_warp'

export interface FactoryMaterial {
  id: string
  name: string
  rarity: MaterialRarity
  icon: string
  description: string
  quantity: number
  maxStack: number
}

export interface RecipeIngredient {
  materialId: string
  count: number
}

export interface PowerUpRecipe {
  id: string
  name: string
  rarity: MaterialRarity
  description: string
  icon: string
  ingredients: RecipeIngredient[]
  craftTime: number
  powerUpEffect: PowerUpEffectType
  duration: number
  successRate: number
}

export interface ProductionItem {
  id: string
  recipeId: string
  queuedAt: number
  startedAt: number | null
  totalCraftTime: number
  status: 'queued' | 'crafting' | 'completed'
}

export interface CraftedPowerUp {
  id: string
  recipeId: string
  name: string
  rarity: MaterialRarity
  icon: string
  powerUpEffect: PowerUpEffectType
  duration: number
  craftedAt: string
}

export interface ActiveBuff {
  powerUpId: string
  name: string
  icon: string
  effect: PowerUpEffectType
  activatedAt: string
  expiresAt: string
  remainingMs: number
}

export interface CombinationEntry {
  id: string
  input1: string
  input2: string
  resultId: string | null
  resultRarity: MaterialRarity | null
  success: boolean
  timestamp: string
  refundedMaterials: RecipeIngredient[]
}

export interface DailyDeal {
  id: string
  type: 'material' | 'recipe_discount'
  label: string
  icon: string
  originalCost: RecipeIngredient[]
  discountedCost: RecipeIngredient[]
  discountPercent: number
  purchased: boolean
}

export interface Blueprint {
  id: string
  name: string
  description: string
  icon: string
  rarity: MaterialRarity
  unlockCondition: string
  variantRecipeId: string
  found: boolean
  foundAt: string | null
}

// ── UI-facing return types ───────────────────────────────────────

export interface FactoryOverview {
  factoryLevel: number
  factoryXP: number
  xpToNextLevel: number
  workers: number
  maxQueueSize: number
  materialCount: number
  craftedCount: number
  equippedCount: number
  totalCrafted: number
  totalUsed: number
  recipeUnlockCount: number
  totalRecipes: number
  blueprintProgress: number
}

export interface MaterialGridItem {
  id: string
  name: string
  rarity: MaterialRarity
  icon: string
  quantity: number
  maxStack: number
  color: string
}

export interface RecipeGridItem {
  id: string
  name: string
  rarity: MaterialRarity
  icon: string
  description: string
  craftTime: number
  successRate: number
  craftable: boolean
  unlocked: boolean
  ingredients: RecipeIngredient[]
}

export interface ProductionQueueSlot {
  id: string
  recipeId: string
  recipeName: string
  recipeIcon: string
  recipeRarity: MaterialRarity
  progress: number
  remainingSeconds: number
  status: 'queued' | 'crafting' | 'completed'
}

export interface EquippedSlot {
  index: number
  powerUp: CraftedPowerUp | null
}

export interface CombinePreview {
  item1: CraftedPowerUp | null
  item2: CraftedPowerUp | null
  chance: number
  resultRarity: MaterialRarity | null
  successLabel: string
}

export interface BlueprintGalleryItem {
  id: string
  name: string
  icon: string
  rarity: MaterialRarity
  description: string
  found: boolean
  color: string
}

export interface RarityDistributionEntry {
  rarity: MaterialRarity
  count: number
  color: string
}

export interface FactoryLevelCard {
  level: number
  currentXP: number
  xpToNextLevel: number
  progressPercent: number
  workers: number
  maxQueueSize: number
  nextBenefit: string
}

// ═══════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════

const RARITY_COLORS: Record<MaterialRarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

const RARITY_LABELS: Record<MaterialRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

const ALL_RARITIES: MaterialRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

// ── 12 Factory Materials ─────────────────────────────────────────

const DEFAULT_MATERIALS: FactoryMaterial[] = [
  // Common
  { id: 'iron_ore', name: 'Iron Ore', rarity: 'common', icon: '🪨', description: 'A sturdy chunk of iron ore, essential for basic crafting.', quantity: 0, maxStack: 999 },
  { id: 'wood', name: 'Wood', rarity: 'common', icon: '🪵', description: 'Fresh timber gathered from the enchanted forest.', quantity: 0, maxStack: 999 },
  { id: 'crystal_shard', name: 'Crystal Shard', rarity: 'common', icon: '💎', description: 'A small but potent crystal fragment.', quantity: 0, maxStack: 999 },
  { id: 'magic_dust', name: 'Magic Dust', rarity: 'common', icon: '✨', description: 'Shimmering dust imbued with faint magical energy.', quantity: 0, maxStack: 999 },
  // Uncommon
  { id: 'dragon_scale', name: 'Dragon Scale', rarity: 'uncommon', icon: '🐉', description: 'A shimmering scale shed by a young dragon.', quantity: 0, maxStack: 500 },
  { id: 'star_fragment', name: 'Star Fragment', rarity: 'uncommon', icon: '⭐', description: 'A fallen piece of a celestial star.', quantity: 0, maxStack: 500 },
  { id: 'enchanted_thread', name: 'Enchanted Thread', rarity: 'uncommon', icon: '🧵', description: 'Thread woven with enchantments from a fairy loom.', quantity: 0, maxStack: 500 },
  // Rare
  { id: 'phoenix_feather', name: 'Phoenix Feather', rarity: 'rare', icon: '🪶', description: 'A radiant feather from a reborn phoenix.', quantity: 0, maxStack: 200 },
  { id: 'moonstone', name: 'Moonstone', rarity: 'rare', icon: '🌙', description: 'A luminous stone that absorbs moonlight.', quantity: 0, maxStack: 200 },
  { id: 'lightning_essence', name: 'Lightning Essence', rarity: 'rare', icon: '⚡', description: 'Bottled essence from a thunderstorm.', quantity: 0, maxStack: 200 },
  // Epic
  { id: 'void_crystal', name: 'Void Crystal', rarity: 'epic', icon: '🔮', description: 'A crystal formed in the emptiness between dimensions.', quantity: 0, maxStack: 50 },
  { id: 'time_sand', name: 'Time Sand', rarity: 'epic', icon: '⏳', description: 'Sand that flows backwards through time.', quantity: 0, maxStack: 50 },
  // Legendary
  { id: 'cosmic_pearl', name: 'Cosmic Pearl', rarity: 'legendary', icon: '🌀', description: 'A pearl born from collapsing stars — immensely powerful.', quantity: 0, maxStack: 10 },
]

// ── 20 Power-Up Recipes ──────────────────────────────────────────

const DEFAULT_RECIPES: PowerUpRecipe[] = [
  // ── Common (5) ──────────────────────────────────────────────────
  {
    id: 'speed_boost', name: 'Speed Boost', rarity: 'common', icon: '💨',
    description: 'Increases snake speed by 30% for a short time.',
    ingredients: [{ materialId: 'iron_ore', count: 3 }, { materialId: 'crystal_shard', count: 2 }],
    craftTime: 15, powerUpEffect: 'speed_boost', duration: 10, successRate: 1.0,
  },
  {
    id: 'score_x1_5', name: 'Score Multiplier ×1.5', rarity: 'common', icon: '🔥',
    description: 'All word scores multiplied by 1.5.',
    ingredients: [{ materialId: 'wood', count: 3 }, { materialId: 'magic_dust', count: 2 }],
    craftTime: 15, powerUpEffect: 'score_multiplier', duration: 15, successRate: 1.0,
  },
  {
    id: 'shield', name: 'Shield', rarity: 'common', icon: '🛡️',
    description: 'Blocks one collision or obstacle hit.',
    ingredients: [{ materialId: 'iron_ore', count: 4 }, { materialId: 'crystal_shard', count: 1 }],
    craftTime: 20, powerUpEffect: 'shield', duration: 20, successRate: 1.0,
  },
  {
    id: 'magnet', name: 'Magnet', rarity: 'common', icon: '🧲',
    description: 'Attracts nearby word food within 3 cells.',
    ingredients: [{ materialId: 'iron_ore', count: 2 }, { materialId: 'crystal_shard', count: 3 }, { materialId: 'magic_dust', count: 1 }],
    craftTime: 20, powerUpEffect: 'magnet', duration: 12, successRate: 1.0,
  },
  {
    id: 'extra_life', name: 'Extra Life', rarity: 'common', icon: '❤️',
    description: 'Grants one extra life for the current run.',
    ingredients: [{ materialId: 'wood', count: 5 }, { materialId: 'magic_dust', count: 2 }, { materialId: 'crystal_shard', count: 1 }],
    craftTime: 25, powerUpEffect: 'extra_life', duration: 0, successRate: 1.0,
  },

  // ── Uncommon (5) ───────────────────────────────────────────────
  {
    id: 'score_x2', name: 'Double Score ×2', rarity: 'uncommon', icon: '💎',
    description: 'Doubles all word scores earned.',
    ingredients: [{ materialId: 'crystal_shard', count: 3 }, { materialId: 'dragon_scale', count: 2 }, { materialId: 'star_fragment', count: 1 }],
    craftTime: 30, powerUpEffect: 'score_multiplier', duration: 20, successRate: 0.95,
  },
  {
    id: 'ghost_mode', name: 'Ghost Mode', rarity: 'uncommon', icon: '👻',
    description: 'Pass through walls and obstacles harmlessly.',
    ingredients: [{ materialId: 'star_fragment', count: 2 }, { materialId: 'enchanted_thread', count: 3 }, { materialId: 'magic_dust', count: 2 }],
    craftTime: 30, powerUpEffect: 'ghost_mode', duration: 8, successRate: 0.95,
  },
  {
    id: 'time_slow', name: 'Time Slow', rarity: 'uncommon', icon: '⏰',
    description: 'Slows down obstacles and time pressure.',
    ingredients: [{ materialId: 'star_fragment', count: 3 }, { materialId: 'crystal_shard', count: 2 }, { materialId: 'enchanted_thread', count: 1 }],
    craftTime: 35, powerUpEffect: 'time_slow', duration: 10, successRate: 0.95,
  },
  {
    id: 'word_reveal', name: 'Word Reveal', rarity: 'uncommon', icon: '👁️',
    description: 'Reveals the category of upcoming words.',
    ingredients: [{ materialId: 'enchanted_thread', count: 2 }, { materialId: 'star_fragment', count: 3 }, { materialId: 'dragon_scale', count: 1 }],
    craftTime: 30, powerUpEffect: 'word_reveal', duration: 15, successRate: 0.95,
  },
  {
    id: 'lucky_charm', name: 'Lucky Charm', rarity: 'uncommon', icon: '🍀',
    description: 'Increases drop rate of rare materials by 50%.',
    ingredients: [{ materialId: 'dragon_scale', count: 3 }, { materialId: 'enchanted_thread', count: 2 }, { materialId: 'star_fragment', count: 2 }],
    craftTime: 35, powerUpEffect: 'lucky_charm', duration: 30, successRate: 0.95,
  },

  // ── Rare (5) ───────────────────────────────────────────────────
  {
    id: 'score_x3', name: 'Triple Score ×3', rarity: 'rare', icon: '🌟',
    description: 'Triples all word scores for a limited time.',
    ingredients: [{ materialId: 'phoenix_feather', count: 2 }, { materialId: 'dragon_scale', count: 3 }, { materialId: 'star_fragment', count: 2 }],
    craftTime: 45, powerUpEffect: 'score_multiplier', duration: 15, successRate: 0.85,
  },
  {
    id: 'invincibility', name: 'Invincibility', rarity: 'rare', icon: '👑',
    description: 'Become completely invulnerable for a short time.',
    ingredients: [{ materialId: 'phoenix_feather', count: 3 }, { materialId: 'moonstone', count: 2 }, { materialId: 'dragon_scale', count: 1 }],
    craftTime: 50, powerUpEffect: 'invincibility', duration: 8, successRate: 0.85,
  },
  {
    id: 'mega_magnet', name: 'Mega Magnet', rarity: 'rare', icon: '🌀',
    description: 'Massive attraction radius pulls words from across the board.',
    ingredients: [{ materialId: 'moonstone', count: 2 }, { materialId: 'phoenix_feather', count: 3 }, { materialId: 'lightning_essence', count: 2 }],
    craftTime: 45, powerUpEffect: 'magnet', duration: 15, successRate: 0.85,
  },
  {
    id: 'word_bomb', name: 'Word Bomb', rarity: 'rare', icon: '💣',
    description: 'Clears a 5×5 area and scores all words within it.',
    ingredients: [{ materialId: 'lightning_essence', count: 3 }, { materialId: 'phoenix_feather', count: 2 }, { materialId: 'moonstone', count: 1 }],
    craftTime: 40, powerUpEffect: 'word_bomb', duration: 0, successRate: 0.85,
  },
  {
    id: 'xp_boost', name: 'XP Boost', rarity: 'rare', icon: '📈',
    description: 'Doubles XP earned from all sources.',
    ingredients: [{ materialId: 'moonstone', count: 2 }, { materialId: 'lightning_essence', count: 2 }, { materialId: 'phoenix_feather', count: 3 }],
    craftTime: 45, powerUpEffect: 'xp_boost', duration: 60, successRate: 0.85,
  },

  // ── Epic (3) ───────────────────────────────────────────────────
  {
    id: 'score_storm', name: 'Score Storm ×5', rarity: 'epic', icon: '🌪️',
    description: 'An overwhelming score multiplier — all words count fivefold.',
    ingredients: [{ materialId: 'void_crystal', count: 3 }, { materialId: 'phoenix_feather', count: 2 }, { materialId: 'moonstone', count: 2 }],
    craftTime: 60, powerUpEffect: 'score_storm', duration: 12, successRate: 0.7,
  },
  {
    id: 'phase_shift', name: 'Phase Shift', rarity: 'epic', icon: '🌀',
    description: 'Shift between dimensions — intangible and ultra-fast.',
    ingredients: [{ materialId: 'void_crystal', count: 3 }, { materialId: 'time_sand', count: 2 }, { materialId: 'moonstone', count: 1 }],
    craftTime: 60, powerUpEffect: 'phase_shift', duration: 10, successRate: 0.7,
  },
  {
    id: 'gravity_well', name: 'Gravity Well', rarity: 'epic', icon: '🕳️',
    description: 'Creates a gravity well pulling all word food to your snake.',
    ingredients: [{ materialId: 'time_sand', count: 2 }, { materialId: 'void_crystal', count: 3 }, { materialId: 'lightning_essence', count: 1 }],
    craftTime: 65, powerUpEffect: 'gravity_well', duration: 15, successRate: 0.7,
  },

  // ── Legendary (2) ──────────────────────────────────────────────
  {
    id: 'cosmic_power', name: 'Cosmic Power', rarity: 'legendary', icon: '🌌',
    description: 'Unleashes all power-up effects simultaneously — god mode.',
    ingredients: [{ materialId: 'cosmic_pearl', count: 3 }, { materialId: 'void_crystal', count: 2 }, { materialId: 'time_sand', count: 2 }],
    craftTime: 90, powerUpEffect: 'cosmic_power', duration: 20, successRate: 0.5,
  },
  {
    id: 'time_warp', name: 'Time Warp', rarity: 'legendary', icon: '⏳',
    description: 'Freezes time entirely — play at your own pace for a while.',
    ingredients: [{ materialId: 'cosmic_pearl', count: 2 }, { materialId: 'time_sand', count: 3 }, { materialId: 'void_crystal', count: 2 }],
    craftTime: 90, powerUpEffect: 'time_warp', duration: 25, successRate: 0.5,
  },
]

// ── 15 Blueprints ────────────────────────────────────────────────

const DEFAULT_BLUEPRINTS: Blueprint[] = [
  { id: 'bp_speed_mastery', name: 'Speed Mastery', description: 'Variant: Speed Boost lasts 50% longer.', icon: '🏎️', rarity: 'common', unlockCondition: 'Craft 5 Speed Boosts', variantRecipeId: 'speed_boost', found: false, foundAt: null },
  { id: 'bp_shield_wall', name: 'Shield Wall', description: 'Variant: Shield blocks 2 hits instead of 1.', icon: '🏰', rarity: 'common', unlockCondition: 'Reach Factory Level 3', variantRecipeId: 'shield', found: false, foundAt: null },
  { id: 'bp_magnet_pro', name: 'Magnet Pro', description: 'Variant: Magnet range doubled.', icon: '🧭', rarity: 'common', unlockCondition: 'Craft 10 power-ups total', variantRecipeId: 'magnet', found: false, foundAt: null },
  { id: 'bp_score_hunter', name: 'Score Hunter', description: 'Variant: Double Score with 5s extra duration.', icon: '🎯', rarity: 'uncommon', unlockCondition: 'Earn 10,000 points in a single game', variantRecipeId: 'score_x2', found: false, foundAt: null },
  { id: 'bp_phantom', name: 'Phantom', description: 'Variant: Ghost Mode + Speed Boost combined.', icon: '🎭', rarity: 'uncommon', unlockCondition: 'Use Ghost Mode 3 times', variantRecipeId: 'ghost_mode', found: false, foundAt: null },
  { id: 'bp_time_master', name: 'Time Master', description: 'Variant: Time Slow also boosts score ×1.5.', icon: '🕰️', rarity: 'uncommon', unlockCondition: 'Reach Factory Level 6', variantRecipeId: 'time_slow', found: false, foundAt: null },
  { id: 'bp_oracle', name: 'Oracle Eye', description: 'Variant: Word Reveal shows full word preview.', icon: '🔮', rarity: 'uncommon', unlockCondition: 'Collect 200 unique words', variantRecipeId: 'word_reveal', found: false, foundAt: null },
  { id: 'bp_triple_threat', name: 'Triple Threat', description: 'Variant: Triple Score with invincibility for 3s.', icon: '🔥', rarity: 'rare', unlockCondition: 'Combine power-ups 5 times', variantRecipeId: 'score_x3', found: false, foundAt: null },
  { id: 'bp_iron_titan', name: 'Iron Titan', description: 'Variant: Invincibility lasts 12s instead of 8s.', icon: '🤖', rarity: 'rare', unlockCondition: 'Reach Factory Level 9', variantRecipeId: 'invincibility', found: false, foundAt: null },
  { id: 'bp_lightning_field', name: 'Lightning Field', description: 'Variant: Word Bomb clears 7×7 area.', icon: '⚡', rarity: 'rare', unlockCondition: 'Use Word Bomb 3 times in one game', variantRecipeId: 'word_bomb', found: false, foundAt: null },
  { id: 'bp_wisdom_sage', name: 'Wisdom Sage', description: 'Variant: XP Boost triples XP earned.', icon: '📚', rarity: 'rare', unlockCondition: 'Craft 50 power-ups total', variantRecipeId: 'xp_boost', found: false, foundAt: null },
  { id: 'bp_chaos_storm', name: 'Chaos Storm', description: 'Variant: Score Storm also attracts nearby words.', icon: '🌪️', rarity: 'epic', unlockCondition: 'Reach Factory Level 15', variantRecipeId: 'score_storm', found: false, foundAt: null },
  { id: 'bp_dimensional_rift', name: 'Dimensional Rift', description: 'Variant: Phase Shift with 3× speed boost.', icon: '🌀', rarity: 'epic', unlockCondition: 'Combine 10 power-ups', variantRecipeId: 'phase_shift', found: false, foundAt: null },
  { id: 'bp_cosmic_unity', name: 'Cosmic Unity', description: 'Variant: Cosmic Power lasts 30s with no cooldown.', icon: '🌌', rarity: 'legendary', unlockCondition: 'Reach Factory Level 20', variantRecipeId: 'cosmic_power', found: false, foundAt: null },
  { id: 'bp_eternal_sands', name: 'Eternal Sands', description: 'Variant: Time Warp freezes time for 40s.', icon: '⌛', rarity: 'legendary', unlockCondition: 'Collect all 14 other blueprints', variantRecipeId: 'time_warp', found: false, foundAt: null },
]

// ── Combination rate table ──────────────────────────────────────

const COMBINATION_RATES: Partial<Record<MaterialRarity, Partial<Record<MaterialRarity, { chance: number; resultRarity: MaterialRarity }>>>> = {
  common:   { common:   { chance: 0.30, resultRarity: 'uncommon' } },
  uncommon: { uncommon:  { chance: 0.20, resultRarity: 'rare' } },
  rare:     { rare:      { chance: 0.12, resultRarity: 'epic' } },
  epic:     { epic:      { chance: 0.08, resultRarity: 'legendary' } },
}

// ── XP / level helpers ───────────────────────────────────────────

const MAX_FACTORY_LEVEL = 20

function xpRequiredForLevel(level: number): number {
  return 100 * level
}

function totalXPForLevel(level: number): number {
  let total = 0
  for (let l = 2; l <= level; l++) total += xpRequiredForLevel(l)
  return total
}

function getRarityIndex(rarity: MaterialRarity): number {
  return ALL_RARITIES.indexOf(rarity)
}

// ═══════════════════════════════════════════════════════════════════
// Zustand Store
// ═══════════════════════════════════════════════════════════════════

interface FactoryStoreState {
  // ── State fields ───────────────────────────────────────────────
  materials: FactoryMaterial[]
  recipes: PowerUpRecipe[]
  unlockedRecipes: string[]
  productionQueue: ProductionItem[]
  maxQueueSize: number
  craftedPowerUps: CraftedPowerUp[]
  equippedPowerUps: string[]
  factoryLevel: number
  factoryXP: number
  factoryWorkers: number
  totalCrafted: number
  totalUsed: number
  totalDisassembled: number
  rareCrafts: number
  legendaryCrafts: number
  combinationLog: CombinationEntry[]
  dailyDeals: DailyDeal[]
  lastDealDate: string
  blueprintCollection: Blueprint[]
  activeBlueprint: string | null
  activeBuffs: ActiveBuff[]

  // ── Internal actions (not directly exported) ───────────────────
  _gatherMaterial: (materialId: string, amount: number) => boolean
  _spendMaterial: (materialId: string, amount: number) => boolean
  _unlockRecipe: (recipeId: string) => boolean
  _queueCraft: (recipeId: string) => boolean
  _removeFromQueue: (slotIndex: number) => boolean
  _reorderQueue: (slotIds: string[]) => boolean
  _processQueue: (elapsedSeconds?: number) => void
  _combinePowerUp: (powerUpId1: string, powerUpId2: string) => CombinationEntry | null
  _equipPowerUp: (powerUpId: string) => boolean
  _unequipPowerUp: (slotIndex: number) => boolean
  _usePowerUp: (slotIndex: number) => ActiveBuff | null
  _generateDailyDeals: () => DailyDeal[]
  _purchaseDeal: (dealIndex: number) => boolean
  _activateBlueprint: (id: string) => boolean
  _addXP: (amount: number) => void
  _findBlueprint: (id: string) => boolean
  _refreshBuffs: () => void
}

export const usePowerUpFactoryStore = create<FactoryStoreState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────
      materials: DEFAULT_MATERIALS.map((m) => ({ ...m })),
      recipes: DEFAULT_RECIPES.map((r) => ({ ...r, ingredients: r.ingredients.map((i) => ({ ...i })) })),
      unlockedRecipes: ['speed_boost', 'score_x1_5', 'shield'],
      productionQueue: [],
      maxQueueSize: 3,
      craftedPowerUps: [],
      equippedPowerUps: [null, null, null] as unknown as string[],
      factoryLevel: 1,
      factoryXP: 0,
      factoryWorkers: 1,
      totalCrafted: 0,
      totalUsed: 0,
      totalDisassembled: 0,
      rareCrafts: 0,
      legendaryCrafts: 0,
      combinationLog: [],
      dailyDeals: [],
      lastDealDate: '',
      blueprintCollection: DEFAULT_BLUEPRINTS.map((b) => ({ ...b })),
      activeBlueprint: null,
      activeBuffs: [],

      // ── Material actions ────────────────────────────────────────
      _gatherMaterial(materialId: string, amount: number): boolean {
        if (amount <= 0) return false
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === materialId
              ? { ...m, quantity: Math.min(m.quantity + amount, m.maxStack) }
              : m,
          ),
        }))
        return true
      },

      _spendMaterial(materialId: string, amount: number): boolean {
        if (amount <= 0) return false
        const state = get()
        const mat = state.materials.find((m) => m.id === materialId)
        if (!mat || mat.quantity < amount) return false
        set((s) => ({
          materials: s.materials.map((m) =>
            m.id === materialId ? { ...m, quantity: m.quantity - amount } : m,
          ),
        }))
        return true
      },

      // ── Recipe actions ──────────────────────────────────────────
      _unlockRecipe(recipeId: string): boolean {
        const state = get()
        if (state.unlockedRecipes.includes(recipeId)) return false
        const recipe = state.recipes.find((r) => r.id === recipeId)
        if (!recipe) return false
        set((s) => ({ unlockedRecipes: [...s.unlockedRecipes, recipeId] }))
        return true
      },

      // ── Production queue actions ────────────────────────────────
      _queueCraft(recipeId: string): boolean {
        const state = get()
        const recipe = state.recipes.find((r) => r.id === recipeId)
        if (!recipe) return false
        if (!state.unlockedRecipes.includes(recipeId)) return false
        if (state.productionQueue.length >= state.maxQueueSize) return false

        // Check and spend materials
        for (const ing of recipe.ingredients) {
          const mat = state.materials.find((m) => m.id === ing.materialId)
          if (!mat || mat.quantity < ing.count) return false
        }
        for (const ing of recipe.ingredients) {
          get()._spendMaterial(ing.materialId, ing.count)
        }

        const now = Date.now()
        const craftTime = recipe.craftTime / state.factoryWorkers
        const activeCrafting = state.productionQueue.filter(
          (p) => p.status === 'crafting',
        ).length
        const shouldStartNow = activeCrafting < state.factoryWorkers

        const item: ProductionItem = {
          id: `prod_${now}_${Math.random().toString(36).slice(2, 8)}`,
          recipeId,
          queuedAt: now,
          startedAt: shouldStartNow ? now : null,
          totalCraftTime: craftTime,
          status: shouldStartNow ? 'crafting' : 'queued',
        }

        set((s) => ({ productionQueue: [...s.productionQueue, item] }))
        return true
      },

      _removeFromQueue(slotIndex: number): boolean {
        const state = get()
        if (slotIndex < 0 || slotIndex >= state.productionQueue.length) return false
        const item = state.productionQueue[slotIndex]
        if (item.status === 'completed') return false

        // Refund 50% of materials
        const recipe = state.recipes.find((r) => r.id === item.recipeId)
        if (recipe) {
          for (const ing of recipe.ingredients) {
            get()._gatherMaterial(ing.materialId, Math.ceil(ing.count * 0.5))
          }
        }

        set((s) => ({
          productionQueue: [
            ...s.productionQueue.slice(0, slotIndex),
            ...s.productionQueue.slice(slotIndex + 1),
          ],
        }))
        return true
      },

      _reorderQueue(slotIds: string[]): boolean {
        const state = get()
        const existingIds = new Set(state.productionQueue.map((p) => p.id))
        if (!slotIds.every((id) => existingIds.has(id))) return false
        if (slotIds.length !== state.productionQueue.length) return false

        const reordered = slotIds
          .map((id) => state.productionQueue.find((p) => p.id === id))
          .filter(Boolean) as ProductionItem[]

        set((s) => ({ productionQueue: reordered }))
        return true
      },

      _processQueue(elapsedSeconds: number = 1): void {
        const state = get()
        const now = Date.now()
        const elapsedMs = elapsedSeconds * 1000
        let queue = [...state.productionQueue]
        let xpGained = 0
        let newCrafted: CraftedPowerUp[] = []

        // Start queued items if worker slots available
        const craftingCount = queue.filter((p) => p.status === 'crafting').length
        let workersAvailable = state.factoryWorkers - craftingCount

        for (let i = 0; i < queue.length && workersAvailable > 0; i++) {
          if (queue[i].status === 'queued') {
            queue[i] = {
              ...queue[i],
              status: 'crafting',
              startedAt: now,
            }
            workersAvailable--
          }
        }

        // Advance crafting items
        for (let i = 0; i < queue.length; i++) {
          const item = queue[i]
          if (item.status !== 'crafting' || !item.startedAt) continue

          const elapsed = now - item.startedAt
          if (elapsed >= item.totalCraftTime * 1000) {
            queue[i] = { ...item, status: 'completed' }

            // Determine if craft succeeds
            const recipe = state.recipes.find((r) => r.id === item.recipeId)
            if (recipe && Math.random() < recipe.successRate) {
              const crafted: CraftedPowerUp = {
                id: `craft_${now}_${Math.random().toString(36).slice(2, 8)}`,
                recipeId: item.recipeId,
                name: recipe.name,
                rarity: recipe.rarity,
                icon: recipe.icon,
                powerUpEffect: recipe.powerUpEffect,
                duration: recipe.duration,
                craftedAt: new Date(now).toISOString(),
              }
              newCrafted.push(crafted)

              // XP based on rarity
              const rarityXP: Record<MaterialRarity, number> = {
                common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 200,
              }
              xpGained += rarityXP[recipe.rarity]

              if (recipe.rarity === 'rare' || recipe.rarity === 'epic') {
                set((s) => ({ rareCrafts: s.rareCrafts + 1 }))
              }
              if (recipe.rarity === 'legendary') {
                set((s) => ({ legendaryCrafts: s.legendaryCrafts + 1 }))
              }
            }
          }
        }

        // Remove completed items, add crafted power-ups
        const completed = queue.filter((p) => p.status === 'completed')
        const remaining = queue.filter((p) => p.status !== 'completed')

        set((s) => ({
          productionQueue: remaining,
          craftedPowerUps: [...s.craftedPowerUps, ...newCrafted],
          totalCrafted: s.totalCrafted + completed.length,
        }))

        if (xpGained > 0) {
          get()._addXP(xpGained)
        }
      },

      // ── Combining ──────────────────────────────────────────────
      _combinePowerUp(powerUpId1: string, powerUpId2: string): CombinationEntry | null {
        const state = get()
        if (powerUpId1 === powerUpId2) return null

        const pu1 = state.craftedPowerUps.find((p) => p.id === powerUpId1)
        const pu2 = state.craftedPowerUps.find((p) => p.id === powerUpId2)
        if (!pu1 || !pu2) return null
        if (getRarityIndex(pu1.rarity) !== getRarityIndex(pu2.rarity)) return null

        const rateEntry = COMBINATION_RATES[pu1.rarity]?.[pu2.rarity]
        if (!rateEntry) return null

        const success = Math.random() < rateEntry.chance
        let resultId: string | null = null
        let resultRarity: MaterialRarity | null = null
        let refundedMaterials: RecipeIngredient[] = []

        if (success) {
          resultRarity = rateEntry.resultRarity
          // Find a recipe at the result rarity for the crafted item
          const possibleRecipe = state.recipes.find((r) => r.rarity === resultRarity)
          if (possibleRecipe) {
            const crafted: CraftedPowerUp = {
              id: `craft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              recipeId: possibleRecipe.id,
              name: possibleRecipe.name,
              rarity: possibleRecipe.rarity,
              icon: possibleRecipe.icon,
              powerUpEffect: possibleRecipe.powerUpEffect,
              duration: possibleRecipe.duration,
              craftedAt: new Date().toISOString(),
            }
            set((s) => ({
              craftedPowerUps: [...s.craftedPowerUps, crafted],
              totalCrafted: s.totalCrafted + 1,
            }))
            resultId = crafted.id
            if (resultRarity === 'rare' || resultRarity === 'epic') {
              set((s) => ({ rareCrafts: s.rareCrafts + 1 }))
            }
            if (resultRarity === 'legendary') {
              set((s) => ({ legendaryCrafts: s.legendaryCrafts + 1 }))
            }
          }
          get()._addXP(resultRarity === 'legendary' ? 150 : 50)
        } else {
          // Refund 50% of materials from both input power-ups
          const r1 = state.recipes.find((r) => r.id === pu1.recipeId)
          const r2 = state.recipes.find((r) => r.id === pu2.recipeId)
          if (r1) {
            for (const ing of r1.ingredients) {
              const refund = Math.ceil(ing.count * 0.5)
              get()._gatherMaterial(ing.materialId, refund)
              refundedMaterials.push({ materialId: ing.materialId, count: refund })
            }
          }
          if (r2) {
            for (const ing of r2.ingredients) {
              const refund = Math.ceil(ing.count * 0.5)
              get()._gatherMaterial(ing.materialId, refund)
              refundedMaterials.push({ materialId: ing.materialId, count: refund })
            }
          }
        }

        // Remove input power-ups
        set((s) => ({
          craftedPowerUps: s.craftedPowerUps.filter(
            (p) => p.id !== powerUpId1 && p.id !== powerUpId2,
          ),
          equippedPowerUps: s.equippedPowerUps.map((ep) =>
            ep === powerUpId1 || ep === powerUpId2 ? (null as unknown as string) : ep,
          ),
        }))

        const entry: CombinationEntry = {
          id: `comb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          input1: powerUpId1,
          input2: powerUpId2,
          resultId,
          resultRarity,
          success,
          timestamp: new Date().toISOString(),
          refundedMaterials,
        }

        set((s) => ({
          combinationLog: [entry, ...s.combinationLog].slice(0, 100),
        }))

        return entry
      },

      // ── Equip / Use ────────────────────────────────────────────
      _equipPowerUp(powerUpId: string): boolean {
        const state = get()
        const pu = state.craftedPowerUps.find((p) => p.id === powerUpId)
        if (!pu) return false
        if (state.equippedPowerUps.includes(powerUpId)) return false

        const slotIndex = state.equippedPowerUps.findIndex((ep) => !ep)
        if (slotIndex === -1) return false // all 3 slots full

        set((s) => {
          const updated = [...s.equippedPowerUps]
          updated[slotIndex] = powerUpId
          return { equippedPowerUps: updated }
        })
        return true
      },

      _unequipPowerUp(slotIndex: number): boolean {
        const state = get()
        if (slotIndex < 0 || slotIndex >= 3) return false
        if (!state.equippedPowerUps[slotIndex]) return false

        set((s) => {
          const updated = [...s.equippedPowerUps]
          updated[slotIndex] = null as unknown as string
          return { equippedPowerUps: updated }
        })
        return true
      },

      _usePowerUp(slotIndex: number): ActiveBuff | null {
        const state = get()
        if (slotIndex < 0 || slotIndex >= 3) return null
        const powerUpId = state.equippedPowerUps[slotIndex]
        if (!powerUpId) return null

        const pu = state.craftedPowerUps.find((p) => p.id === powerUpId)
        if (!pu) return null

        const now = Date.now()
        const buff: ActiveBuff = {
          powerUpId: pu.id,
          name: pu.name,
          icon: pu.icon,
          effect: pu.powerUpEffect,
          activatedAt: new Date(now).toISOString(),
          expiresAt: new Date(now + pu.duration * 1000).toISOString(),
          remainingMs: pu.duration * 1000,
        }

        set((s) => ({
          activeBuffs: [...s.activeBuffs, buff],
          equippedPowerUps: s.equippedPowerUps.map((ep) =>
            ep === powerUpId ? (null as unknown as string) : ep,
          ),
          craftedPowerUps: s.craftedPowerUps.filter((p) => p.id !== powerUpId),
          totalUsed: s.totalUsed + 1,
        }))

        return buff
      },

      // ── Daily deals ────────────────────────────────────────────
      _generateDailyDeals(): DailyDeal[] {
        const today = new Date().toISOString().slice(0, 10)
        if (get().lastDealDate === today && get().dailyDeals.length > 0) {
          return get().dailyDeals
        }

        // Simple date-seeded random
        const seed = today.split('-').join('').slice(0, 8)
        const numericSeed = parseInt(seed, 10) || 42
        const pseudoRandom = (i: number) => {
          const x = Math.sin(numericSeed + i * 127.1) * 43758.5453
          return x - Math.floor(x)
        }

        const materialOptions = DEFAULT_MATERIALS.filter((m) => m.rarity !== 'legendary')
        const recipeOptions = DEFAULT_RECIPES.filter(
          (r) => r.rarity === 'common' || r.rarity === 'uncommon',
        )

        const deals: DailyDeal[] = []

        for (let i = 0; i < 3; i++) {
          const rand = pseudoRandom(i)
          if (i < 2 && materialOptions.length > 0) {
            const mIdx = Math.floor(pseudoRandom(i * 10 + 1) * materialOptions.length)
            const mat = materialOptions[mIdx]
            const discount = 20 + Math.floor(pseudoRandom(i * 10 + 2) * 30)
            const originalCount = mat.rarity === 'common' ? 10 : mat.rarity === 'uncommon' ? 5 : 3
            const discountCount = Math.ceil(originalCount * (1 - discount / 100))
            deals.push({
              id: `deal_${today}_${i}`,
              type: 'material',
              label: `${mat.icon} ${mat.name} ×${discountCount}`,
              icon: mat.icon,
              originalCost: [{ materialId: 'iron_ore', count: originalCount * 3 }],
              discountedCost: [{ materialId: 'iron_ore', count: discountCount * 3 }],
              discountPercent: discount,
              purchased: false,
            })
          } else if (recipeOptions.length > 0) {
            const rIdx = Math.floor(pseudoRandom(i * 10 + 3) * recipeOptions.length)
            const rec = recipeOptions[rIdx]
            const discount = 25 + Math.floor(pseudoRandom(i * 10 + 4) * 25)
            deals.push({
              id: `deal_${today}_${i}`,
              type: 'recipe_discount',
              label: `${rec.icon} ${rec.name}`,
              icon: rec.icon,
              originalCost: rec.ingredients,
              discountedCost: rec.ingredients.map((ing) => ({
                ...ing,
                count: Math.ceil(ing.count * (1 - discount / 100)),
              })),
              discountPercent: discount,
              purchased: false,
            })
          }
        }

        set((s) => ({ dailyDeals: deals, lastDealDate: today }))
        return deals
      },

      _purchaseDeal(dealIndex: number): boolean {
        const state = get()
        if (dealIndex < 0 || dealIndex >= state.dailyDeals.length) return false
        const deal = state.dailyDeals[dealIndex]
        if (deal.purchased) return false

        // Check if player can afford discounted cost
        for (const ing of deal.discountedCost) {
          const mat = state.materials.find((m) => m.id === ing.materialId)
          if (!mat || mat.quantity < ing.count) return false
        }
        for (const ing of deal.discountedCost) {
          get()._spendMaterial(ing.materialId, ing.count)
        }

        // Grant the deal item
        if (deal.type === 'material') {
          // Grant based on original quantities (discounted cost already paid)
          const matMatch = DEFAULT_MATERIALS.find((m) => deal.icon === m.icon)
          if (matMatch) {
            get()._gatherMaterial(matMatch.id, matMatch.rarity === 'common' ? 10 : 5)
          }
        }

        set((s) => {
          const updated = [...s.dailyDeals]
          updated[dealIndex] = { ...updated[dealIndex], purchased: true }
          return { dailyDeals: updated }
        })
        return true
      },

      // ── Blueprints ──────────────────────────────────────────────
      _activateBlueprint(id: string): boolean {
        const state = get()
        const bp = state.blueprintCollection.find((b) => b.id === id)
        if (!bp || !bp.found) return false

        set((s) => ({ activeBlueprint: id }))
        return true
      },

      _findBlueprint(id: string): boolean {
        const state = get()
        const bp = state.blueprintCollection.find((b) => b.id === id)
        if (!bp || bp.found) return false

        set((s) => ({
          blueprintCollection: s.blueprintCollection.map((b) =>
            b.id === id
              ? { ...b, found: true, foundAt: new Date().toISOString() }
              : b,
          ),
        }))
        return true
      },

      // ── XP / Level ─────────────────────────────────────────────
      _addXP(amount: number): void {
        if (amount <= 0) return
        set((s) => {
          let xp = s.factoryXP + amount
          let level = s.factoryLevel
          let workers = s.factoryWorkers
          let maxQueue = s.maxQueueSize
          let newUnlocks = [...s.unlockedRecipes]

          while (level < MAX_FACTORY_LEVEL) {
            const needed = xpRequiredForLevel(level + 1)
            if (xp >= needed) {
              xp -= needed
              level++

              // Level benefits
              if (level % 3 === 0) maxQueue = Math.min(maxQueue + 1, 10)
              if (level % 2 === 0) workers = Math.min(workers + 1, 5)

              // Recipe unlocks at certain levels
              if (level === 2 && !newUnlocks.includes('magnet')) newUnlocks.push('magnet')
              if (level === 2 && !newUnlocks.includes('extra_life')) newUnlocks.push('extra_life')
              if (level === 4 && !newUnlocks.includes('score_x2')) newUnlocks.push('score_x2')
              if (level === 4 && !newUnlocks.includes('ghost_mode')) newUnlocks.push('ghost_mode')
              if (level === 5 && !newUnlocks.includes('time_slow')) newUnlocks.push('time_slow')
              if (level === 6 && !newUnlocks.includes('word_reveal')) newUnlocks.push('word_reveal')
              if (level === 6 && !newUnlocks.includes('lucky_charm')) newUnlocks.push('lucky_charm')
              if (level === 8 && !newUnlocks.includes('score_x3')) newUnlocks.push('score_x3')
              if (level === 8 && !newUnlocks.includes('invincibility')) newUnlocks.push('invincibility')
              if (level === 10 && !newUnlocks.includes('mega_magnet')) newUnlocks.push('mega_magnet')
              if (level === 10 && !newUnlocks.includes('word_bomb')) newUnlocks.push('word_bomb')
              if (level === 10 && !newUnlocks.includes('xp_boost')) newUnlocks.push('xp_boost')
              if (level === 13 && !newUnlocks.includes('score_storm')) newUnlocks.push('score_storm')
              if (level === 13 && !newUnlocks.includes('phase_shift')) newUnlocks.push('phase_shift')
              if (level === 15 && !newUnlocks.includes('gravity_well')) newUnlocks.push('gravity_well')
              if (level === 17 && !newUnlocks.includes('cosmic_power')) newUnlocks.push('cosmic_power')
              if (level === 19 && !newUnlocks.includes('time_warp')) newUnlocks.push('time_warp')
            } else {
              break
            }
          }

          return {
            factoryXP: xp,
            factoryLevel: level,
            factoryWorkers: workers,
            maxQueueSize: maxQueue,
            unlockedRecipes: newUnlocks,
          }
        })
      },

      // ── Buff maintenance ────────────────────────────────────────
      _refreshBuffs(): void {
        const state = get()
        const now = Date.now()
        const active = state.activeBuffs.filter(
          (b) => new Date(b.expiresAt).getTime() > now,
        )
        set({ activeBuffs: active })
      },
    }),
    {
      name: 'ws_powerup_factory',
      partialize: (state) => ({
        materials: state.materials,
        unlockedRecipes: state.unlockedRecipes,
        productionQueue: state.productionQueue,
        maxQueueSize: state.maxQueueSize,
        craftedPowerUps: state.craftedPowerUps,
        equippedPowerUps: state.equippedPowerUps,
        factoryLevel: state.factoryLevel,
        factoryXP: state.factoryXP,
        factoryWorkers: state.factoryWorkers,
        totalCrafted: state.totalCrafted,
        totalUsed: state.totalUsed,
        totalDisassembled: state.totalDisassembled,
        rareCrafts: state.rareCrafts,
        legendaryCrafts: state.legendaryCrafts,
        combinationLog: state.combinationLog,
        dailyDeals: state.dailyDeals,
        lastDealDate: state.lastDealDate,
        blueprintCollection: state.blueprintCollection,
        activeBlueprint: state.activeBlueprint,
        activeBuffs: state.activeBuffs,
      }),
    },
  ),
)

// ═══════════════════════════════════════════════════════════════════
// Exported Functions — Material System
// ═══════════════════════════════════════════════════════════════════

/** Add materials to the factory inventory. Returns true on success. */
export function gatherMaterial(materialId: string, amount: number = 1): boolean {
  return usePowerUpFactoryStore.getState()._gatherMaterial(materialId, amount)
}

/** Remove materials from the factory inventory. Returns true on success. */
export function spendMaterial(materialId: string, amount: number = 1): boolean {
  return usePowerUpFactoryStore.getState()._spendMaterial(materialId, amount)
}

/** Get a single material by its ID, or null if not found. */
export function getMaterialById(materialId: string): FactoryMaterial | null {
  const { materials } = usePowerUpFactoryStore.getState()
  return materials.find((m) => m.id === materialId) ?? null
}

/** Get all materials of a given rarity. */
export function getMaterialsByRarity(rarity: MaterialRarity): FactoryMaterial[] {
  const { materials } = usePowerUpFactoryStore.getState()
  return materials.filter((m) => m.rarity === rarity)
}

// ═══════════════════════════════════════════════════════════════════
// Exported Functions — Recipe System
// ═══════════════════════════════════════════════════════════════════

/** Unlock a recipe by ID. Returns true if newly unlocked. */
export function unlockRecipe(recipeId: string): boolean {
  return usePowerUpFactoryStore.getState()._unlockRecipe(recipeId)
}

/** Get all recipes that the player has currently unlocked. */
export function getAvailableRecipes(): PowerUpRecipe[] {
  const { recipes, unlockedRecipes } = usePowerUpFactoryStore.getState()
  return recipes.filter((r) => unlockedRecipes.includes(r.id))
}

/** Check whether the player has enough materials to craft a recipe. */
export function canCraft(recipeId: string): boolean {
  const state = usePowerUpFactoryStore.getState()
  if (!state.unlockedRecipes.includes(recipeId)) return false
  const recipe = state.recipes.find((r) => r.id === recipeId)
  if (!recipe) return false
  for (const ing of recipe.ingredients) {
    const mat = state.materials.find((m) => m.id === ing.materialId)
    if (!mat || mat.quantity < ing.count) return false
  }
  return true
}

// ═══════════════════════════════════════════════════════════════════
// Exported Functions — Production Queue
// ═══════════════════════════════════════════════════════════════════

/** Add a recipe to the production queue. Materials are deducted immediately. */
export function queueCraft(recipeId: string): boolean {
  return usePowerUpFactoryStore.getState()._queueCraft(recipeId)
}

/** Cancel a queued/crafting item and refund 50% of materials. */
export function removeFromQueue(slotIndex: number): boolean {
  return usePowerUpFactoryStore.getState()._removeFromQueue(slotIndex)
}

/** Reorder the production queue by providing the new order of item IDs. */
export function reorderQueue(slotIds: string[]): boolean {
  return usePowerUpFactoryStore.getState()._reorderQueue(slotIds)
}

/** Advance the production queue by the given number of seconds (default 1). */
export function processQueue(elapsedSeconds: number = 1): void {
  usePowerUpFactoryStore.getState()._processQueue(elapsedSeconds)
}

/** Get the current status of all items in the production queue. */
export function getQueueStatus(): ProductionQueueSlot[] {
  const state = usePowerUpFactoryStore.getState()
  const now = Date.now()

  return state.productionQueue.map((item) => {
    const recipe = state.recipes.find((r) => r.id === item.recipeId)
    let progress = 0
    let remaining = 0

    if (item.status === 'crafting' && item.startedAt) {
      const elapsed = (now - item.startedAt) / 1000
      progress = Math.min(elapsed / item.totalCraftTime, 1)
      remaining = Math.max(item.totalCraftTime - elapsed, 0)
    } else if (item.status === 'completed') {
      progress = 1
      remaining = 0
    } else {
      // Estimate remaining time (position in queue × craft time / workers)
      const position = state.productionQueue
        .filter((p) => p.status === 'queued')
        .findIndex((p) => p.id === item.id)
      remaining = (position + 1) * item.totalCraftTime / state.factoryWorkers
    }

    return {
      id: item.id,
      recipeId: item.recipeId,
      recipeName: recipe?.name ?? 'Unknown',
      recipeIcon: recipe?.icon ?? '❓',
      recipeRarity: recipe?.rarity ?? 'common',
      progress,
      remainingSeconds: Math.ceil(remaining),
      status: item.status,
    }
  })
}

/** Estimate total seconds until all items in the queue are completed. */
export function getEstimatedCompletion(): number {
  const state = usePowerUpFactoryStore.getState()
  if (state.productionQueue.length === 0) return 0
  const now = Date.now()
  let totalRemaining = 0

  for (const item of state.productionQueue) {
    if (item.status === 'completed') continue
    if (item.status === 'crafting' && item.startedAt) {
      totalRemaining += Math.max(item.totalCraftTime - (now - item.startedAt) / 1000, 0)
    } else {
      totalRemaining += item.totalCraftTime
    }
  }

  return Math.ceil(totalRemaining / state.factoryWorkers)
}

// ═══════════════════════════════════════════════════════════════════
// Exported Functions — Factory Progression
// ═══════════════════════════════════════════════════════════════════

/** XP remaining to reach the next factory level. */
export function getXPToNextLevel(): number {
  const { factoryLevel } = usePowerUpFactoryStore.getState()
  if (factoryLevel >= MAX_FACTORY_LEVEL) return 0
  return xpRequiredForLevel(factoryLevel + 1)
}

// ═══════════════════════════════════════════════════════════════════
// Exported Functions — Power-Up Combining
// ═══════════════════════════════════════════════════════════════════

/** Combine two power-ups of the same rarity. Returns the combination entry. */
export function combinePowerUp(
  powerUpId1: string,
  powerUpId2: string,
): CombinationEntry | null {
  return usePowerUpFactoryStore.getState()._combinePowerUp(powerUpId1, powerUpId2)
}

// ═══════════════════════════════════════════════════════════════════
// Exported Functions — Equipping & Using
// ═══════════════════════════════════════════════════════════════════

/** Equip a crafted power-up to the first available slot (max 3). */
export function equipPowerUp(powerUpId: string): boolean {
  return usePowerUpFactoryStore.getState()._equipPowerUp(powerUpId)
}

/** Unequip the power-up in the given slot index (0-2). */
export function unequipPowerUp(slotIndex: number): boolean {
  return usePowerUpFactoryStore.getState()._unequipPowerUp(slotIndex)
}

/** Activate the equipped power-up in the given slot. Returns the resulting buff. */
export function usePowerUp(slotIndex: number): ActiveBuff | null {
  return usePowerUpFactoryStore.getState()._usePowerUp(slotIndex)
}

/** Get the combined effect descriptions of all currently equipped power-ups. */
export function getEquippedEffects(): { name: string; icon: string; effect: PowerUpEffectType; rarity: MaterialRarity }[] {
  const state = usePowerUpFactoryStore.getState()
  const effects: { name: string; icon: string; effect: PowerUpEffectType; rarity: MaterialRarity }[] = []

  for (const epId of state.equippedPowerUps) {
    if (!epId) continue
    const pu = state.craftedPowerUps.find((p) => p.id === epId)
    if (pu) {
      effects.push({ name: pu.name, icon: pu.icon, effect: pu.powerUpEffect, rarity: pu.rarity })
    }
  }
  return effects
}

/** Get all currently active buffs with remaining timer. */
export function getActiveBuffs(): ActiveBuff[] {
  const state = usePowerUpFactoryStore.getState()
  state._refreshBuffs()
  const refreshed = usePowerUpFactoryStore.getState()
  const now = Date.now()
  return refreshed.activeBuffs
    .map((b) => ({
      ...b,
      remainingMs: new Date(b.expiresAt).getTime() - now,
    }))
    .filter((b) => b.remainingMs > 0)
}

// ═══════════════════════════════════════════════════════════════════
// Exported Functions — Daily Deals
// ═══════════════════════════════════════════════════════════════════

/** Generate (or retrieve cached) daily deals. Seeded by today's date. */
export function generateDailyDeals(): DailyDeal[] {
  return usePowerUpFactoryStore.getState()._generateDailyDeals()
}

/** Purchase a daily deal at the discounted price. */
export function purchaseDeal(dealIndex: number): boolean {
  return usePowerUpFactoryStore.getState()._purchaseDeal(dealIndex)
}

/** Milliseconds until the daily deals refresh (next midnight UTC). */
export function getDealTimer(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)
  return tomorrow.getTime() - now.getTime()
}

// ═══════════════════════════════════════════════════════════════════
// Exported Functions — Blueprint Collection
// ═══════════════════════════════════════════════════════════════════

/** Activate a found blueprint to enable its variant recipe. */
export function activateBlueprint(id: string): boolean {
  return usePowerUpFactoryStore.getState()._activateBlueprint(id)
}

/** Get blueprint collection progress as a percentage (0-100). */
export function getBlueprintProgress(): number {
  const { blueprintCollection } = usePowerUpFactoryStore.getState()
  const found = blueprintCollection.filter((b) => b.found).length
  return Math.round((found / blueprintCollection.length) * 100)
}

// ═══════════════════════════════════════════════════════════════════
// UI Helper Functions
// ═══════════════════════════════════════════════════════════════════

/** High-level factory overview with key stats. */
export function getFactoryOverview(): FactoryOverview {
  const state = usePowerUpFactoryStore.getState()
  const level = state.factoryLevel
  const xpToNext = level >= MAX_FACTORY_LEVEL ? 0 : xpRequiredForLevel(level + 1)
  const foundBps = state.blueprintCollection.filter((b) => b.found).length

  return {
    factoryLevel: level,
    factoryXP: state.factoryXP,
    xpToNextLevel: xpToNext,
    workers: state.factoryWorkers,
    maxQueueSize: state.maxQueueSize,
    materialCount: state.materials.reduce((sum, m) => sum + m.quantity, 0),
    craftedCount: state.craftedPowerUps.length,
    equippedCount: state.equippedPowerUps.filter(Boolean).length,
    totalCrafted: state.totalCrafted,
    totalUsed: state.totalUsed,
    recipeUnlockCount: state.unlockedRecipes.length,
    totalRecipes: state.recipes.length,
    blueprintProgress: Math.round((foundBps / state.blueprintCollection.length) * 100),
  }
}

/** All materials with quantities and rarity colors for the material grid UI. */
export function getMaterialGrid(): MaterialGridItem[] {
  const { materials } = usePowerUpFactoryStore.getState()
  return materials.map((m) => ({
    id: m.id,
    name: m.name,
    rarity: m.rarity,
    icon: m.icon,
    quantity: m.quantity,
    maxStack: m.maxStack,
    color: RARITY_COLORS[m.rarity],
  }))
}

/** All recipes with craftability status for the recipe grid UI. */
export function getRecipeGrid(): RecipeGridItem[] {
  const state = usePowerUpFactoryStore.getState()
  return state.recipes.map((r) => ({
    id: r.id,
    name: r.name,
    rarity: r.rarity,
    icon: r.icon,
    description: r.description,
    craftTime: r.craftTime / state.factoryWorkers,
    successRate: r.successRate,
    craftable: canCraft(r.id),
    unlocked: state.unlockedRecipes.includes(r.id),
    ingredients: r.ingredients.map((i) => ({ ...i })),
  }))
}

/** Production queue items with progress bars for the queue UI. */
export function getProductionQueueUI(): ProductionQueueSlot[] {
  return getQueueStatus()
}

/** The three equipment slots with their current power-ups. */
export function getEquippedSlots(): EquippedSlot[] {
  const state = usePowerUpFactoryStore.getState()
  return [0, 1, 2].map((index) => {
    const epId = state.equippedPowerUps[index]
    const pu = epId
      ? state.craftedPowerUps.find((p) => p.id === epId) ?? null
      : null
    return { index, powerUp: pu ? { ...pu } : null }
  })
}

/** Combination chance and result preview for two selected power-ups. */
export function getCombinePreview(
  powerUpId1: string | null,
  powerUpId2: string | null,
): CombinePreview {
  const state = usePowerUpFactoryStore.getState()
  const item1 = powerUpId1
    ? state.craftedPowerUps.find((p) => p.id === powerUpId1) ?? null
    : null
  const item2 = powerUpId2
    ? state.craftedPowerUps.find((p) => p.id === powerUpId2) ?? null
    : null

  let chance = 0
  let resultRarity: MaterialRarity | null = null

  if (item1 && item2 && item1.rarity === item2.rarity && item1.id !== item2.id) {
    const rate = COMBINATION_RATES[item1.rarity]?.[item2.rarity]
    if (rate) {
      chance = rate.chance
      resultRarity = rate.resultRarity
    }
  }

  return {
    item1,
    item2,
    chance,
    resultRarity,
    successLabel: resultRarity
      ? `${Math.round(chance * 100)}% → ${RARITY_LABELS[resultRarity]}`
      : chance > 0
        ? `${Math.round(chance * 100)}% chance`
        : 'Cannot combine',
  }
}

/** All blueprints with found status for the gallery UI. */
export function getBlueprintGallery(): BlueprintGalleryItem[] {
  const { blueprintCollection } = usePowerUpFactoryStore.getState()
  return blueprintCollection.map((bp) => ({
    id: bp.id,
    name: bp.name,
    icon: bp.icon,
    rarity: bp.rarity,
    description: bp.description,
    found: bp.found,
    color: RARITY_COLORS[bp.rarity],
  }))
}

/** Crafted power-ups distribution by rarity tier. */
export function getRarityDistribution(): RarityDistributionEntry[] {
  const { craftedPowerUps } = usePowerUpFactoryStore.getState()
  return ALL_RARITIES.map((rarity) => ({
    rarity,
    count: craftedPowerUps.filter((p) => p.rarity === rarity).length,
    color: RARITY_COLORS[rarity],
  }))
}

/** Factory level card with XP progress, worker count, and next benefit preview. */
export function getFactoryLevelCard(): FactoryLevelCard {
  const state = usePowerUpFactoryStore.getState()
  const level = state.factoryLevel
  const xpToNext = level >= MAX_FACTORY_LEVEL ? 0 : xpRequiredForLevel(level + 1)
  const progressPercent = level >= MAX_FACTORY_LEVEL ? 100 : Math.round((state.factoryXP / xpToNext) * 100)

  let nextBenefit = 'Max level reached!'
  if (level < MAX_FACTORY_LEVEL) {
    const nextLevel = level + 1
    const benefits: string[] = []
    if (nextLevel % 3 === 0) benefits.push('+1 queue slot')
    if (nextLevel % 2 === 0) benefits.push('+1 worker')
    const nextUnlock = state.recipes.find(
      (r) => !state.unlockedRecipes.includes(r.id),
    )
    if (nextUnlock) benefits.push(`Unlock: ${nextUnlock.name}`)
    nextBenefit = benefits.length > 0 ? benefits.join(', ') : 'Level up bonus'
  }

  return {
    level,
    currentXP: state.factoryXP,
    xpToNextLevel: xpToNext,
    progressPercent,
    workers: state.factoryWorkers,
    maxQueueSize: state.maxQueueSize,
    nextBenefit,
  }
}
