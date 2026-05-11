/**
 * inventory-system-wire.ts
 *
 * Unified inventory management wire for the Word Snake game.
 * Provides a standalone module of exported functions for managing all
 * collectibles, cosmetics, consumables, power-up charges, materials,
 * currencies, shop integration, and rarity system.
 *
 * Persistence: all data stored in localStorage under `ws_inventory_system`.
 */

// ─── Types & Interfaces ───────────────────────────────────────────

export type ItemCategory =
  | 'cosmetic'
  | 'consumable'
  | 'powerup'
  | 'currency'
  | 'material'
  | 'equipment'
  | 'special'

export type ItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'

export type CosmeticSlot = 'skin' | 'trail' | 'effect' | 'frame' | 'title'

export type CurrencyType = 'coins' | 'gems' | 'stars' | 'tokens'

export interface InventoryItem {
  id: string
  name: string
  description: string
  emoji: string
  category: ItemCategory
  rarity: ItemRarity
  quantity: number
  value: number
  stackable: boolean
  maxStack: number
  equipped: boolean
  slot: number
  obtainedAt: string
  subType?: string           // e.g. 'skin', 'trail', 'boost', 'key', 'fragment'
}

export interface InventorySummary {
  totalItems: number
  totalValue: number
  categories: Record<ItemCategory, number>
  equippedCount: number
}

export interface CraftingRecipe {
  id: string
  name: string
  description: string
  emoji: string
  materialsNeeded: Record<string, number>
  resultItem: string
  resultQuantity: number
  category: ItemCategory
  rarity: ItemRarity
}

export interface ShopListing {
  id: string
  name: string
  description: string
  emoji: string
  category: ItemCategory
  rarity: ItemRarity
  cost: number
  currency: CurrencyType
  originalCost?: number
  discount?: number
  inStock: boolean
  maxPurchases: number
  purchasedCount: number
}

export interface ActiveBoost {
  boostId: string
  name: string
  emoji: string
  effect: string
  activatedAt: string
  expiresAt: string
  remainingMs: number
}

export interface CurrencyBalances {
  coins: number
  gems: number
  stars: number
  tokens: number
}

export interface TransactionRecord {
  id: string
  type: 'earn' | 'spend'
  currency: CurrencyType
  amount: number
  reason: string
  timestamp: string
  balanceAfter: number
}

export interface InventoryGridPage {
  items: InventoryItem[]
  page: number
  perPage: number
  totalPages: number
  totalItems: number
}

export interface InventoryOverview {
  summary: InventorySummary
  recentItems: InventoryItem[]
  equippedCosmetics: Record<CosmeticSlot, InventoryItem | null>
  activeBoosts: ActiveBoost[]
  quickAccess: InventoryItem[]
  isNewNotification: boolean
}

export interface DailyDeal {
  listing: ShopListing
  expiresAt: string
}

// ─── Constants ────────────────────────────────────────────────────

const STORAGE_KEY = 'ws_inventory_system'
const DEFAULT_CAPACITY = 200
const MAX_TRANSACTIONS = 100

const ALL_CATEGORIES: ItemCategory[] = [
  'cosmetic', 'consumable', 'powerup', 'currency', 'material', 'equipment', 'special',
]

const ALL_RARITIES: ItemRarity[] = [
  'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic',
]

const ALL_CURRENCY_TYPES: CurrencyType[] = ['coins', 'gems', 'stars', 'tokens']

const ALL_COSMETIC_SLOTS: CosmeticSlot[] = ['skin', 'trail', 'effect', 'frame', 'title']

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
  mythic: '#ef4444',
}

const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
}

const RARITY_VALUES: Record<ItemRarity, number> = {
  common: 1,
  uncommon: 5,
  rare: 20,
  epic: 50,
  legendary: 150,
  mythic: 500,
}

const CONSUMABLE_EFFECTS: Record<string, string> = {
  shield_charge: 'Grants one shield charge that absorbs a collision',
  speed_boost_charge: 'Increases snake speed by 50% for 5 seconds',
  magnet_charge: 'Attracts nearby word food within 3 cells for 8 seconds',
  ghost_charge: 'Pass through walls for 7 seconds',
  word_bomb_charge: 'Next word eat clears a 3x3 area',
  freeze_charge: 'Freezes all obstacles for 8 seconds',
  score_x2_charge: 'Doubles all score earned for 10 seconds',
  extra_life: 'Grants one extra life for the current game',
  time_warp: 'Adds 10 seconds in speed run mode',
  reveal_word: 'Shows the category of the next word',
  boss_reroll: 'Rerolls the current boss encounter',
}

const MATERIAL_VALUES: Record<string, number> = {
  word_fragment: 2,
  letter_shard: 3,
  ink_drop: 5,
  parchment_scrap: 8,
  golden_quill: 25,
  enchanted_scroll: 50,
  crystal_inkwell: 100,
  ancient_tome: 200,
}

const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'recipe_word_shield',
    name: 'Word Shield',
    description: 'Combine fragments into a protective word shield',
    emoji: '🛡️',
    materialsNeeded: { word_fragment: 10, ink_drop: 2 },
    resultItem: 'shield_charge',
    resultQuantity: 3,
    category: 'consumable',
    rarity: 'uncommon',
  },
  {
    id: 'recipe_speed_elixir',
    name: 'Speed Elixir',
    description: 'Brew a potion that boosts snake speed',
    emoji: '⚡',
    materialsNeeded: { ink_drop: 5, letter_shard: 3 },
    resultItem: 'speed_boost_charge',
    resultQuantity: 2,
    category: 'consumable',
    rarity: 'rare',
  },
  {
    id: 'recipe_neon_trail',
    name: 'Neon Trail Skin',
    description: 'Craft a glowing neon trail cosmetic',
    emoji: '🎆',
    materialsNeeded: { golden_quill: 3, crystal_inkwell: 1 },
    resultItem: 'neon_trail',
    resultQuantity: 1,
    category: 'cosmetic',
    rarity: 'epic',
  },
  {
    id: 'recipe_legendary_scroll',
    name: 'Legendary Scroll',
    description: 'Combine rare materials into a powerful scroll',
    emoji: '📜',
    materialsNeeded: { enchanted_scroll: 2, ancient_tome: 1 },
    resultItem: 'legendary_scroll',
    resultQuantity: 1,
    category: 'special',
    rarity: 'legendary',
  },
  {
    id: 'recipe_ghost_cloak',
    name: 'Ghost Cloak',
    description: 'Craft a cloak that allows wall pass-through',
    emoji: '👻',
    materialsNeeded: { parchment_scrap: 8, ink_drop: 4 },
    resultItem: 'ghost_charge',
    resultQuantity: 2,
    category: 'consumable',
    rarity: 'rare',
  },
]

const SHOP_ITEMS: ShopListing[] = [
  { id: 'neon_trail', name: 'Neon Trail', description: 'Glowing neon trail behind snake', emoji: '🎆', category: 'cosmetic', rarity: 'epic', cost: 150, currency: 'coins', inStock: true, maxPurchases: 1, purchasedCount: 0 },
  { id: 'golden_snake', name: 'Golden Snake', description: 'Golden skin for your snake', emoji: '✨', category: 'cosmetic', rarity: 'legendary', cost: 300, currency: 'coins', inStock: true, maxPurchases: 1, purchasedCount: 0 },
  { id: 'shield_charge', name: 'Shield Charge', description: 'One shield charge to absorb a hit', emoji: '🛡️', category: 'consumable', rarity: 'uncommon', cost: 30, currency: 'coins', inStock: true, maxPurchases: -1, purchasedCount: 0 },
  { id: 'speed_boost_charge', name: 'Speed Boost', description: '50% speed increase for 5 seconds', emoji: '⚡', category: 'consumable', rarity: 'common', cost: 15, currency: 'coins', inStock: true, maxPurchases: -1, purchasedCount: 0 },
  { id: 'extra_life', name: 'Extra Life', description: 'Start with an extra life', emoji: '❤️', category: 'consumable', rarity: 'rare', cost: 50, currency: 'gems', inStock: true, maxPurchases: 3, purchasedCount: 0 },
  { id: 'word_fragment', name: 'Word Fragment', description: 'Crafting material — basic fragment', emoji: '🧩', category: 'material', rarity: 'common', cost: 5, currency: 'coins', inStock: true, maxPurchases: -1, purchasedCount: 0 },
  { id: 'golden_quill', name: 'Golden Quill', description: 'Rare crafting material', emoji: '🪶', category: 'material', rarity: 'epic', cost: 25, currency: 'gems', inStock: true, maxPurchases: -1, purchasedCount: 0 },
  { id: 'crystal_inkwell', name: 'Crystal Inkwell', description: 'Premium crafting material', emoji: '💎', category: 'material', rarity: 'legendary', cost: 100, currency: 'gems', inStock: true, maxPurchases: -1, purchasedCount: 0 },
  { id: 'xp_boost_30min', name: 'XP Boost 30min', description: 'Double XP for 30 minutes', emoji: '📈', category: 'consumable', rarity: 'rare', cost: 20, currency: 'stars', inStock: true, maxPurchases: -1, purchasedCount: 0 },
  { id: 'coin_boost_1hr', name: 'Coin Boost 1hr', description: 'Triple coins for 1 hour', emoji: '🪙', category: 'consumable', rarity: 'epic', cost: 15, currency: 'tokens', inStock: true, maxPurchases: -1, purchasedCount: 0 },
]

// ─── Persisted State ──────────────────────────────────────────────

interface PersistedState {
  items: Record<string, InventoryItem>
  equippedCosmetics: Record<CosmeticSlot, string | null>
  activeBoosts: ActiveBoost[]
  currencies: CurrencyBalances
  transactionHistory: TransactionRecord[]
  wishlist: string[]
  dailyDeals: DailyDeal[]
  dailyDealsGeneratedAt: string
  capacity: number
  usageCounts: Record<string, number>
  recentlyAcquired: Array<{ itemId: string; timestamp: string }>
}

function getDefaultState(): PersistedState {
  return {
    items: {},
    equippedCosmetics: { skin: null, trail: null, effect: null, frame: null, title: null },
    activeBoosts: [],
    currencies: { coins: 0, gems: 0, stars: 0, tokens: 0 },
    transactionHistory: [],
    wishlist: [],
    dailyDeals: [],
    dailyDealsGeneratedAt: '',
    capacity: DEFAULT_CAPACITY,
    usageCounts: {},
    recentlyAcquired: [],
  }
}

// ─── Persistence Helpers ──────────────────────────────────────────

function loadState(): PersistedState {
  if (typeof window === 'undefined') return getDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    const defaults = getDefaultState()
    return {
      items: parsed.items ?? defaults.items,
      equippedCosmetics: {
        ...defaults.equippedCosmetics,
        ...(parsed.equippedCosmetics ?? {}),
      },
      activeBoosts: pruneExpiredBoosts(parsed.activeBoosts ?? defaults.activeBoosts),
      currencies: { ...defaults.currencies, ...(parsed.currencies ?? {}) },
      transactionHistory: (parsed.transactionHistory ?? defaults.transactionHistory).slice(-MAX_TRANSACTIONS),
      wishlist: parsed.wishlist ?? defaults.wishlist,
      dailyDeals: pruneExpiredDeals(parsed.dailyDeals ?? defaults.dailyDeals),
      dailyDealsGeneratedAt: parsed.dailyDealsGeneratedAt ?? defaults.dailyDealsGeneratedAt,
      capacity: parsed.capacity ?? defaults.capacity,
      usageCounts: parsed.usageCounts ?? defaults.usageCounts,
      recentlyAcquired: pruneOldAcquired(parsed.recentlyAcquired ?? defaults.recentlyAcquired),
    }
  } catch {
    return getDefaultState()
  }
}

function saveState(state: PersistedState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

function pruneExpiredBoosts(boosts: ActiveBoost[]): ActiveBoost[] {
  const now = Date.now()
  return boosts.filter((b) => b.expiresAt && new Date(b.expiresAt).getTime() > now)
}

function pruneExpiredDeals(deals: DailyDeal[]): DailyDeal[] {
  const now = Date.now()
  return deals.filter((d) => new Date(d.expiresAt).getTime() > now)
}

function pruneOldAcquired(items: Array<{ itemId: string; timestamp: string }>): Array<{ itemId: string; timestamp: string }> {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000 // Keep last 24 hours
  return items.filter((a) => new Date(a.timestamp).getTime() > cutoff)
}

// ─── Internal Helpers ─────────────────────────────────────────────

function getNextSlot(state: PersistedState): number {
  const usedSlots = new Set(Object.values(state.items).map((i) => i.slot))
  let slot = 0
  while (usedSlots.has(slot)) slot++
  return slot
}

function makeInventoryItem(
  id: string,
  name: string,
  description: string,
  emoji: string,
  category: ItemCategory,
  rarity: ItemRarity,
  quantity: number,
  value: number,
  stackable: boolean,
  maxStack: number,
  subType?: string,
): InventoryItem {
  return {
    id,
    name,
    description,
    emoji,
    category,
    rarity,
    quantity,
    value,
    stackable,
    maxStack,
    equipped: false,
    slot: -1,
    obtainedAt: new Date().toISOString(),
    subType,
  }
}

function recordTransaction(
  state: PersistedState,
  type: 'earn' | 'spend',
  currency: CurrencyType,
  amount: number,
  reason: string,
): void {
  const tx: TransactionRecord = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    currency,
    amount,
    reason,
    timestamp: new Date().toISOString(),
    balanceAfter: state.currencies[currency],
  }
  state.transactionHistory.push(tx)
  if (state.transactionHistory.length > MAX_TRANSACTIONS) {
    state.transactionHistory = state.transactionHistory.slice(-MAX_TRANSACTIONS)
  }
}

function addToRecentlyAcquired(state: PersistedState, itemId: string): void {
  state.recentlyAcquired.push({ itemId, timestamp: new Date().toISOString() })
  state.recentlyAcquired = pruneOldAcquired(state.recentlyAcquired)
}

// ═══════════════════════════════════════════════════════════════════
// 1. INVENTORY OVERVIEW
// ═══════════════════════════════════════════════════════════════════

/** Returns all inventory items with counts, categories, and equipped status. */
export function getInventory(): InventoryItem[] {
  try {
    const state = loadState()
    return Object.values(state.items)
  } catch {
    return []
  }
}

/** Returns a summary: { totalItems, totalValue, categories, equippedCount }. */
export function getInventorySummary(): InventorySummary {
  try {
    const state = loadState()
    const items = Object.values(state.items)
    const categories: Record<ItemCategory, number> = {
      cosmetic: 0, consumable: 0, powerup: 0, currency: 0,
      material: 0, equipment: 0, special: 0,
    }
    let totalItems = 0
    let totalValue = 0
    let equippedCount = 0

    for (const item of items) {
      categories[item.category] += item.quantity
      totalItems += item.quantity
      totalValue += item.value * item.quantity
      if (item.equipped) equippedCount++
    }

    return { totalItems, totalValue, categories, equippedCount }
  } catch {
    return {
      totalItems: 0,
      totalValue: 0,
      categories: {
        cosmetic: 0, consumable: 0, powerup: 0, currency: 0,
        material: 0, equipment: 0, special: 0,
      },
      equippedCount: 0,
    }
  }
}

/** Returns the current max capacity (default 200, upgradeable). */
export function getInventoryCapacity(): number {
  try {
    const state = loadState()
    return state.capacity
  } catch {
    return DEFAULT_CAPACITY
  }
}

/** Returns the number of used inventory slots. */
export function getUsedSlots(): number {
  try {
    const state = loadState()
    return Object.keys(state.items).length
  } catch {
    return 0
  }
}

/** Returns true if the inventory is at capacity. */
export function isInventoryFull(): boolean {
  try {
    return getUsedSlots() >= getInventoryCapacity()
  } catch {
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. ITEM CATEGORIES
// ═══════════════════════════════════════════════════════════════════

/** Filter inventory items by category. */
export function getItemsByCategory(category: ItemCategory): InventoryItem[] {
  try {
    const state = loadState()
    return Object.values(state.items).filter((i) => i.category === category)
  } catch {
    return []
  }
}

/** Returns item count per category. */
export function getCategoryCounts(): Record<ItemCategory, number> {
  try {
    return getInventorySummary().categories
  } catch {
    const counts: Record<ItemCategory, number> = {
      cosmetic: 0, consumable: 0, powerup: 0, currency: 0,
      material: 0, equipment: 0, special: 0,
    }
    return counts
  }
}

/** Returns total value of all items in a category. */
export function getCategoryValue(category: ItemCategory): number {
  try {
    const items = getItemsByCategory(category)
    return items.reduce((sum, i) => sum + i.value * i.quantity, 0)
  } catch {
    return 0
  }
}

// ═══════════════════════════════════════════════════════════════════
// 3. ITEM MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/** Add an item (or increment quantity) to inventory. */
export function addItem(
  itemId: string,
  quantity: number = 1,
  overrides?: Partial<Pick<InventoryItem, 'name' | 'description' | 'emoji' | 'category' | 'rarity' | 'value' | 'stackable' | 'maxStack' | 'subType'>>,
): boolean {
  try {
    if (quantity <= 0) return false
    const state = loadState()
    const existing = state.items[itemId]

    if (existing) {
      if (existing.stackable) {
        const newQty = Math.min(existing.quantity + quantity, existing.maxStack)
        existing.quantity = newQty
      } else {
        // Non-stackable: add individual copies with unique keys
        const copyId = `${itemId}_copy_${Date.now()}`
        const copy: InventoryItem = {
          ...existing,
          id: copyId,
          quantity: 1,
          slot: getNextSlot(state),
          obtainedAt: new Date().toISOString(),
        }
        state.items[copyId] = copy
      }
    } else {
      if (isInventoryFull() && Object.keys(state.items).length >= state.capacity) {
        return false // Inventory full
      }
      const item = makeInventoryItem(
        itemId,
        overrides?.name ?? itemId,
        overrides?.description ?? '',
        overrides?.emoji ?? '📦',
        overrides?.category ?? 'special',
        overrides?.rarity ?? 'common',
        quantity,
        overrides?.value ?? RARITY_VALUES[overrides?.rarity ?? 'common'],
        overrides?.stackable ?? true,
        overrides?.maxStack ?? 99,
        overrides?.subType,
      )
      item.slot = getNextSlot(state)
      state.items[itemId] = item
    }

    addToRecentlyAcquired(state, itemId)
    state.usageCounts[itemId] = (state.usageCounts[itemId] ?? 0) + quantity
    saveState(state)
    return true
  } catch {
    return false
  }
}

/** Remove quantity of an item. Returns true on success. */
export function removeItem(itemId: string, quantity: number = 1): boolean {
  try {
    if (quantity <= 0) return false
    const state = loadState()
    const item = state.items[itemId]
    if (!item || item.quantity < quantity) return false

    item.quantity -= quantity
    if (item.quantity <= 0) {
      // Unequip if equipped
      if (item.equipped) {
        for (const slot of ALL_COSMETIC_SLOTS) {
          if (state.equippedCosmetics[slot] === itemId) {
            state.equippedCosmetics[slot] = null
          }
        }
      }
      delete state.items[itemId]
    }

    saveState(state)
    return true
  } catch {
    return false
  }
}

/** Consume a consumable item (reduces count by 1). Returns true if used. */
export function useItem(itemId: string): boolean {
  try {
    const state = loadState()
    const item = state.items[itemId]
    if (!item || item.quantity <= 0) return false
    if (item.category !== 'consumable' && item.category !== 'powerup') return false

    item.quantity -= 1
    if (item.quantity <= 0) delete state.items[itemId]

    saveState(state)
    return true
  } catch {
    return false
  }
}

/** Check if any quantity of an item exists. */
export function hasItem(itemId: string): boolean {
  try {
    const state = loadState()
    const item = state.items[itemId]
    return !!item && item.quantity > 0
  } catch {
    return false
  }
}

/** Get the quantity of a specific item. */
export function getItemCount(itemId: string): number {
  try {
    const state = loadState()
    return state.items[itemId]?.quantity ?? 0
  } catch {
    return 0
  }
}

/** Move an item to a different slot position. */
export function transferItem(itemId: string, targetSlot: number): boolean {
  try {
    if (targetSlot < 0) return false
    const state = loadState()
    const item = state.items[itemId]
    if (!item) return false

    // Check if target slot is occupied
    const occupant = Object.values(state.items).find((i) => i.slot === targetSlot)
    if (occupant && occupant.id !== itemId) {
      // Swap slots
      const oldSlot = item.slot
      occupant.slot = oldSlot
    }

    item.slot = targetSlot
    saveState(state)
    return true
  } catch {
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. COSMETIC ITEMS
// ═══════════════════════════════════════════════════════════════════

/** Returns all cosmetic items owned. */
export function getCosmetics(): InventoryItem[] {
  try {
    return getItemsByCategory('cosmetic')
  } catch {
    return []
  }
}

/** Equip a cosmetic to a slot ('skin', 'trail', 'effect', 'frame', 'title'). */
export function equipCosmetic(itemId: string, slot: CosmeticSlot): boolean {
  try {
    const state = loadState()
    const item = state.items[itemId]
    if (!item || item.category !== 'cosmetic') return false

    // Unequip current occupant of the slot
    const currentId = state.equippedCosmetics[slot]
    if (currentId && state.items[currentId]) {
      state.items[currentId].equipped = false
    }

    // If item was equipped in another slot, clear that slot
    if (item.equipped) {
      for (const s of ALL_COSMETIC_SLOTS) {
        if (state.equippedCosmetics[s] === itemId) {
          state.equippedCosmetics[s] = null
        }
      }
    }

    item.equipped = true
    state.equippedCosmetics[slot] = itemId
    saveState(state)
    return true
  } catch {
    return false
  }
}

/** Remove cosmetic from a slot. */
export function unequipCosmetic(slot: CosmeticSlot): boolean {
  try {
    const state = loadState()
    const currentId = state.equippedCosmetics[slot]
    if (!currentId) return false

    const item = state.items[currentId]
    if (item) item.equipped = false
    state.equippedCosmetics[slot] = null
    saveState(state)
    return true
  } catch {
    return false
  }
}

/** Returns currently equipped cosmetics mapped by slot. */
export function getEquippedCosmetics(): Record<CosmeticSlot, InventoryItem | null> {
  try {
    const state = loadState()
    const result: Record<CosmeticSlot, InventoryItem | null> = {
      skin: null, trail: null, effect: null, frame: null, title: null,
    }
    for (const slot of ALL_COSMETIC_SLOTS) {
      const id = state.equippedCosmetics[slot]
      result[slot] = id ? (state.items[id] ?? null) : null
    }
    return result
  } catch {
    return { skin: null, trail: null, effect: null, frame: null, title: null }
  }
}

/** Returns preview data for a cosmetic item (for display panels). */
export function getCosmeticPreview(itemId: string): {
  item: InventoryItem | null
  rarityColor: string
  rarityLabel: string
  isEquipped: boolean
  equippedSlot: CosmeticSlot | null
} {
  try {
    const state = loadState()
    const item = state.items[itemId] ?? null
    if (!item) {
      return { item: null, rarityColor: '#9ca3af', rarityLabel: 'Common', isEquipped: false, equippedSlot: null }
    }
    let equippedSlot: CosmeticSlot | null = null
    for (const s of ALL_COSMETIC_SLOTS) {
      if (state.equippedCosmetics[s] === itemId) {
        equippedSlot = s
        break
      }
    }
    return {
      item,
      rarityColor: RARITY_COLORS[item.rarity],
      rarityLabel: RARITY_LABELS[item.rarity],
      isEquipped: item.equipped,
      equippedSlot,
    }
  } catch {
    return { item: null, rarityColor: '#9ca3af', rarityLabel: 'Common', isEquipped: false, equippedSlot: null }
  }
}

/** Returns all owned skin cosmetics. */
export function getOwnedSkins(): InventoryItem[] {
  try {
    return getCosmetics().filter((i) => i.subType === 'skin' || i.id.includes('skin'))
  } catch {
    return []
  }
}

/** Returns all owned trail cosmetics. */
export function getOwnedTrails(): InventoryItem[] {
  try {
    return getCosmetics().filter((i) => i.subType === 'trail' || i.id.includes('trail'))
  } catch {
    return []
  }
}

/** Returns all owned effect cosmetics. */
export function getOwnedEffects(): InventoryItem[] {
  try {
    return getCosmetics().filter((i) => i.subType === 'effect' || i.id.includes('effect'))
  } catch {
    return []
  }
}

// ═══════════════════════════════════════════════════════════════════
// 5. CONSUMABLE ITEMS
// ═══════════════════════════════════════════════════════════════════

/** Returns all consumable items. */
export function getConsumables(): InventoryItem[] {
  try {
    return getItemsByCategory('consumable')
  } catch {
    return []
  }
}

/** Use a consumable item, reducing its count by one. */
export function useConsumable(itemId: string): boolean {
  try {
    const state = loadState()
    const item = state.items[itemId]
    if (!item || item.quantity <= 0) return false
    if (item.category !== 'consumable') return false

    item.quantity -= 1
    if (item.quantity <= 0) delete state.items[itemId]

    saveState(state)
    return true
  } catch {
    return false
  }
}

/** Returns the effect description of a consumable item. */
export function getConsumableEffect(itemId: string): string {
  try {
    return CONSUMABLE_EFFECTS[itemId] ?? 'No effect description available'
  } catch {
    return 'No effect description available'
  }
}

/** Returns currently active boosts with remaining time. */
export function getBoostStatus(): ActiveBoost[] {
  try {
    const state = loadState()
    const now = Date.now()
    return state.activeBoosts
      .filter((b) => new Date(b.expiresAt).getTime() > now)
      .map((b) => ({
        ...b,
        remainingMs: new Date(b.expiresAt).getTime() - now,
      }))
  } catch {
    return []
  }
}

/** Activate a time-limited boost. */
export function activateBoost(boostId: string, durationMs: number): ActiveBoost | null {
  try {
    if (durationMs <= 0) return null
    const state = loadState()
    const now = Date.now()

    // Check if already active and refresh or stack
    const existingIdx = state.activeBoosts.findIndex((b) => b.boostId === boostId)
    if (existingIdx !== -1) {
      // Refresh the existing boost
      state.activeBoosts[existingIdx].expiresAt = new Date(now + durationMs).toISOString()
      state.activeBoosts[existingIdx].activatedAt = new Date(now).toISOString()
      state.activeBoosts[existingIdx].remainingMs = durationMs
      saveState(state)
      return { ...state.activeBoosts[existingIdx] }
    }

    const boost: ActiveBoost = {
      boostId,
      name: boostId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      emoji: CONSUMABLE_EFFECTS[boostId] ? '✨' : '⚡',
      effect: CONSUMABLE_EFFECTS[boostId] ?? 'Unknown boost',
      activatedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + durationMs).toISOString(),
      remainingMs: durationMs,
    }

    state.activeBoosts.push(boost)
    saveState(state)
    return { ...boost }
  } catch {
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════
// 6. MATERIAL ITEMS
// ═══════════════════════════════════════════════════════════════════

/** Returns all material items. */
export function getMaterials(): InventoryItem[] {
  try {
    return getItemsByCategory('material')
  } catch {
    return []
  }
}

/** Returns the value/price of a material item. */
export function getMaterialValue(itemId: string): number {
  try {
    return MATERIAL_VALUES[itemId] ?? 0
  } catch {
    return 0
  }
}

/** Returns all available crafting recipes. */
export function getCraftingRecipes(): CraftingRecipe[] {
  try {
    return [...CRAFTING_RECIPES]
  } catch {
    return []
  }
}

/** Checks if the player has enough materials to craft a recipe. */
export function canCraft(recipeId: string): boolean {
  try {
    const recipe = CRAFTING_RECIPES.find((r) => r.id === recipeId)
    if (!recipe) return false
    const state = loadState()

    for (const [matId, needed] of Object.entries(recipe.materialsNeeded)) {
      const item = state.items[matId]
      if (!item || item.quantity < needed) return false
    }
    return true
  } catch {
    return false
  }
}

/** Craft an item from materials. Returns true on success. */
export function craft(recipeId: string): boolean {
  try {
    const recipe = CRAFTING_RECIPES.find((r) => r.id === recipeId)
    if (!recipe) return false

    const state = loadState()

    // Verify materials
    for (const [matId, needed] of Object.entries(recipe.materialsNeeded)) {
      const item = state.items[matId]
      if (!item || item.quantity < needed) return false
    }

    // Consume materials
    for (const [matId, needed] of Object.entries(recipe.materialsNeeded)) {
      const item = state.items[matId]!
      item.quantity -= needed
      if (item.quantity <= 0) delete state.items[matId]
    }

    // Add result item
    const resultItem = makeInventoryItem(
      recipe.resultItem,
      recipe.name,
      recipe.description,
      recipe.emoji,
      recipe.category,
      recipe.rarity,
      recipe.resultQuantity,
      RARITY_VALUES[recipe.rarity],
      recipe.category === 'consumable',
      recipe.category === 'consumable' ? 99 : 1,
    )
    resultItem.slot = getNextSlot(state)
    state.items[recipe.resultItem] = resultItem

    addToRecentlyAcquired(state, recipe.resultItem)
    saveState(state)
    return true
  } catch {
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════
// 7. CURRENCY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

/** Returns all currency balances: { coins, gems, stars, tokens }. */
export function getBalances(): CurrencyBalances {
  try {
    const state = loadState()
    return { ...state.currencies }
  } catch {
    return { coins: 0, gems: 0, stars: 0, tokens: 0 }
  }
}

/** Add currency to the player's balance. */
export function addCurrency(type: CurrencyType, amount: number): CurrencyBalances {
  try {
    if (amount <= 0) return getBalances()
    const state = loadState()
    state.currencies[type] += amount
    recordTransaction(state, 'earn', type, amount, 'Currency added')
    saveState(state)
    return { ...state.currencies }
  } catch {
    return getBalances()
  }
}

/** Spend currency. Returns true if successful, false if insufficient funds. */
export function spendCurrency(type: CurrencyType, amount: number): boolean {
  try {
    if (amount <= 0) return false
    const state = loadState()
    if (state.currencies[type] < amount) return false

    state.currencies[type] -= amount
    recordTransaction(state, 'spend', type, amount, 'Currency spent')
    saveState(state)
    return true
  } catch {
    return false
  }
}

/** Check if the player can afford a multi-currency cost object. */
export function canAfford(cost: Partial<Record<CurrencyType, number>>): boolean {
  try {
    const balances = getBalances()
    for (const [type, amount] of Object.entries(cost)) {
      if (amount && balances[type as CurrencyType] < amount) return false
    }
    return true
  } catch {
    return false
  }
}

/** Returns recent currency transaction history. */
export function getTransactionHistory(limit: number = 20): TransactionRecord[] {
  try {
    const state = loadState()
    return state.transactionHistory
      .slice(-limit)
      .reverse()
      .map((tx) => ({ ...tx }))
  } catch {
    return []
  }
}

// ═══════════════════════════════════════════════════════════════════
// 8. SHOP INTEGRATION
// ═══════════════════════════════════════════════════════════════════

/** Returns all available shop items. */
export function getShopItems(): ShopListing[] {
  try {
    return SHOP_ITEMS.map((item) => ({ ...item }))
  } catch {
    return []
  }
}

/** Purchase an item from the shop. */
export function purchaseItem(
  itemId: string,
  currency: CurrencyType = 'coins',
  cost: number = 0,
): { success: boolean; reason?: string } {
  try {
    const listing = SHOP_ITEMS.find((l) => l.id === itemId)
    if (!listing) return { success: false, reason: 'item_not_found' }

    const effectiveCost = cost > 0 ? cost : listing.cost
    const effectiveCurrency = currency ?? listing.currency

    const state = loadState()

    // Check max purchases
    if (listing.maxPurchases !== -1) {
      const purchased = listing.purchasedCount
      if (purchased >= listing.maxPurchases) {
        return { success: false, reason: 'max_purchased' }
      }
    }

    // Check funds
    if (state.currencies[effectiveCurrency] < effectiveCost) {
      return { success: false, reason: 'insufficient_funds' }
    }

    // Deduct currency
    state.currencies[effectiveCurrency] -= effectiveCost
    recordTransaction(state, 'spend', effectiveCurrency, effectiveCost, `Purchased ${listing.name}`)

    // Add item to inventory
    const existing = state.items[itemId]
    if (existing) {
      existing.quantity += 1
    } else {
      const item = makeInventoryItem(
        itemId,
        listing.name,
        listing.description,
        listing.emoji,
        listing.category,
        listing.rarity,
        1,
        RARITY_VALUES[listing.rarity],
        listing.category === 'consumable' || listing.category === 'material',
        99,
      )
      item.slot = getNextSlot(state)
      state.items[itemId] = item
    }

    addToRecentlyAcquired(state, itemId)
    saveState(state)
    return { success: true }
  } catch {
    return { success: false, reason: 'unknown_error' }
  }
}

/** Returns time-limited discounted daily deals. */
export function getDailyShopDeals(): DailyDeal[] {
  try {
    const state = loadState()
    // Auto-generate if none exist or expired
    if (state.dailyDeals.length === 0) {
      refreshDailyDeals()
      return loadState().dailyDeals
    }
    return state.dailyDeals.filter((d) => new Date(d.expiresAt).getTime() > Date.now())
  } catch {
    return []
  }
}

/** Generate new daily deals (5 random discounted items, valid for 24 hours). */
export function refreshDailyDeals(): DailyDeal[] {
  try {
    const state = loadState()
    const now = Date.now()
    const expiresAt = new Date(now + 24 * 60 * 60 * 1000).toISOString()

    // Shuffle and pick 5 random shop items
    const shuffled = [...SHOP_ITEMS].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 5)

    const deals: DailyDeal[] = selected.map((item) => {
      const discountPercent = [10, 20, 25, 30, 40][Math.floor(Math.random() * 5)]
      const discountedCost = Math.ceil(item.cost * (1 - discountPercent / 100))
      return {
        listing: {
          ...item,
          cost: discountedCost,
          originalCost: item.cost,
          discount: discountPercent,
        },
        expiresAt,
      }
    })

    state.dailyDeals = deals
    state.dailyDealsGeneratedAt = new Date(now).toISOString()
    saveState(state)
    return deals
  } catch {
    return []
  }
}

/** Returns the player's wishlist of desired items. */
export function getWishlist(): string[] {
  try {
    const state = loadState()
    return [...state.wishlist]
  } catch {
    return []
  }
}

/** Add an item to the wishlist. */
export function addToWishlist(itemId: string): boolean {
  try {
    const state = loadState()
    if (state.wishlist.includes(itemId)) return false
    state.wishlist.push(itemId)
    saveState(state)
    return true
  } catch {
    return false
  }
}

/** Remove an item from the wishlist. */
export function removeFromWishlist(itemId: string): boolean {
  try {
    const state = loadState()
    const idx = state.wishlist.indexOf(itemId)
    if (idx === -1) return false
    state.wishlist.splice(idx, 1)
    saveState(state)
    return true
  } catch {
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════
// 9. RARITY SYSTEM
// ═══════════════════════════════════════════════════════════════════

/** Returns the display color for a rarity level. */
export function getRarityColor(rarity: ItemRarity): string {
  try {
    return RARITY_COLORS[rarity] ?? '#9ca3af'
  } catch {
    return '#9ca3af'
  }
}

/** Returns the display label for a rarity level. */
export function getRarityLabel(rarity: ItemRarity): string {
  try {
    return RARITY_LABELS[rarity] ?? 'Common'
  } catch {
    return 'Common'
  }
}

/** Filter inventory items by rarity. */
export function getItemsByRarity(rarity: ItemRarity): InventoryItem[] {
  try {
    const state = loadState()
    return Object.values(state.items).filter((i) => i.rarity === rarity)
  } catch {
    return []
  }
}

/** Returns count distribution of items per rarity for stats. */
export function getRarityDistribution(): Record<ItemRarity, number> {
  try {
    const distribution: Record<ItemRarity, number> = {
      common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0,
    }
    const items = getInventory()
    for (const item of items) {
      distribution[item.rarity] += item.quantity
    }
    return distribution
  } catch {
    return { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 }
  }
}

// ═══════════════════════════════════════════════════════════════════
// 10. UI HELPERS
// ═══════════════════════════════════════════════════════════════════

/** Returns pre-computed panel data for the inventory overview screen. */
export function getInventoryOverview(): InventoryOverview {
  try {
    const state = loadState()
    const items = Object.values(state.items)
    const summary = getInventorySummary()
    const activeBoosts = getBoostStatus()

    // Recently acquired items (last 24 hours, deduplicated, most recent first)
    const recentIds = Array.from(new Set(state.recentlyAcquired.map((a) => a.itemId)))
      .reverse()
      .slice(0, 5)
    const recentItems = recentIds
      .map((id) => state.items[id])
      .filter(Boolean) as InventoryItem[]

    // Equipped cosmetics
    const equippedCosmetics: Record<CosmeticSlot, InventoryItem | null> = {
      skin: null, trail: null, effect: null, frame: null, title: null,
    }
    for (const slot of ALL_COSMETIC_SLOTS) {
      const id = state.equippedCosmetics[slot]
      equippedCosmetics[slot] = id ? (state.items[id] ?? null) : null
    }

    // Quick access — most used items
    const quickAccess = items
      .filter((i) => i.category === 'consumable' || i.category === 'powerup')
      .sort((a, b) => (state.usageCounts[b.id] ?? 0) - (state.usageCounts[a.id] ?? 0))
      .slice(0, 6)

    return {
      summary,
      recentItems,
      equippedCosmetics,
      activeBoosts,
      quickAccess,
      isNewNotification: recentItems.length > 0,
    }
  } catch {
    return {
      summary: {
        totalItems: 0, totalValue: 0,
        categories: { cosmetic: 0, consumable: 0, powerup: 0, currency: 0, material: 0, equipment: 0, special: 0 },
        equippedCount: 0,
      },
      recentItems: [],
      equippedCosmetics: { skin: null, trail: null, effect: null, frame: null, title: null },
      activeBoosts: [],
      quickAccess: [],
      isNewNotification: false,
    }
  }
}

/** Returns a paginated inventory grid for display. */
export function getInventoryGrid(page: number = 1, perPage: number = 20): InventoryGridPage {
  try {
    const items = Object.values(getInventory()).sort((a, b) => {
      // Sort by rarity (mythic first), then by obtainedAt (newest first)
      const rarityOrder = ALL_RARITIES.indexOf(a.rarity) - ALL_RARITIES.indexOf(b.rarity)
      if (rarityOrder !== 0) return -rarityOrder
      return new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime()
    })

    const totalItems = items.length
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
    const safePage = Math.max(1, Math.min(page, totalPages))
    const start = (safePage - 1) * perPage
    const end = start + perPage

    return {
      items: items.slice(start, end),
      page: safePage,
      perPage,
      totalPages,
      totalItems,
    }
  } catch {
    return { items: [], page: 1, perPage: 20, totalPages: 1, totalItems: 0 }
  }
}

/** Returns recently acquired items for toast notifications. */
export function getNewItemNotification(): InventoryItem[] {
  try {
    const state = loadState()
    const cutoff = Date.now() - 5 * 60 * 1000 // Items acquired in last 5 minutes
    const recentIds = state.recentlyAcquired
      .filter((a) => new Date(a.timestamp).getTime() > cutoff)
      .map((a) => a.itemId)

    const uniqueIds = Array.from(new Set(recentIds))
    return uniqueIds
      .map((id) => state.items[id])
      .filter((i): i is InventoryItem => !!i)
  } catch {
    return []
  }
}

/** Returns the estimated total value of all inventory contents. */
export function getInventoryWorth(): number {
  try {
    const items = getInventory()
    return items.reduce((sum, i) => sum + i.value * i.quantity, 0)
  } catch {
    return 0
  }
}

/** Returns the most used items for the quick access bar. */
export function getQuickAccess(limit: number = 6): InventoryItem[] {
  try {
    const state = loadState()
    const items = Object.values(state.items)
      .filter((i) => i.category === 'consumable' || i.category === 'powerup')
      .sort((a, b) => (state.usageCounts[b.id] ?? 0) - (state.usageCounts[a.id] ?? 0))
    return items.slice(0, limit)
  } catch {
    return []
  }
}
