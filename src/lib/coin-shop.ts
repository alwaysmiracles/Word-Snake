// Coin & Shop System for Word Snake
// Virtual currency earned from gameplay, spent on cosmetics, perks, and specials.

export interface CoinBalance {
  coins: number
  totalEarned: number
  totalSpent: number
}

export interface ShopItem {
  id: string
  name: string
  emoji: string
  description: string
  cost: number
  category: 'cosmetic' | 'perk' | 'special'
  effect: string
  consumable: boolean
  maxPurchases: number   // -1 for unlimited
  purchasedCount: number // how many times player has bought this
}

export interface PurchaseResult {
  success: boolean
  newBalance: number
  item: ShopItem
  reason?: string // 'insufficient_coins' | 'max_purchased' | undefined
}

// ---------------------------------------------------------------------------
// localStorage keys
// ---------------------------------------------------------------------------
const COIN_KEY = 'word-snake-coins'
const PURCHASE_KEY = 'word-snake-shop-purchases'

// ---------------------------------------------------------------------------
// Safe localStorage helpers (follows project conventions)
// ---------------------------------------------------------------------------
function getStoredObject<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const val = localStorage.getItem(key)
    return val ? (JSON.parse(val) as T) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStored(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, typeof value === 'number' ? String(value) : JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Coin earning constants
// ---------------------------------------------------------------------------
export const COIN_REWARD = {
  EAT_WORD: 1,
  RARE_WORD_UNCOMMON: 2,
  RARE_WORD_RARE: 5,
  RARE_WORD_LEGENDARY: 10,
  DAILY_CHALLENGE: 20,
  BOSS_MINOR: 15,
  BOSS_MAJOR: 30,
  BOSS_LEGENDARY: 50,
  COMBO_BONUS_THRESHOLD: 3, // combo x3+ triggers bonus
  COMBO_BONUS_PER_HIT: 5,   // bonus coins per combo after threshold
  PVP_WIN: 10,
  QUIZ_CORRECT: 3,
} as const

// ---------------------------------------------------------------------------
// Default shop item definitions (purchasedCount is filled dynamically)
// ---------------------------------------------------------------------------
const SHOP_ITEM_DEFINITIONS: Omit<ShopItem, 'purchasedCount'>[] = [
  // Cosmetic (4)
  {
    id: 'neon_trail',
    name: 'Neon Trail Effect',
    emoji: '🎆',
    description: 'Adds a special neon trail behind the snake',
    cost: 50,
    category: 'cosmetic',
    effect: 'neon_trail',
    consumable: false,
    maxPurchases: 1,
  },
  {
    id: 'golden_snake',
    name: 'Golden Snake Skin',
    emoji: '✨',
    description: 'Golden head and body colors for your snake',
    cost: 100,
    category: 'cosmetic',
    effect: 'golden_snake',
    consumable: false,
    maxPurchases: 1,
  },
  {
    id: 'particle_burst',
    name: 'Particle Burst',
    emoji: '💥',
    description: 'Extra particles burst when eating words',
    cost: 75,
    category: 'cosmetic',
    effect: 'particle_burst',
    consumable: false,
    maxPurchases: 1,
  },
  {
    id: 'confetti_bg',
    name: 'Confetti Background',
    emoji: '🎊',
    description: 'Confetti gently falls in the background',
    cost: 60,
    category: 'cosmetic',
    effect: 'confetti_bg',
    consumable: false,
    maxPurchases: 1,
  },

  // Perks (5)
  {
    id: 'extra_life',
    name: 'Extra Life',
    emoji: '❤️',
    description: 'Start with an extra life',
    cost: 30,
    category: 'perk',
    effect: 'extra_life',
    consumable: true,
    maxPurchases: 3,
  },
  {
    id: 'time_bonus',
    name: 'Time Warp',
    emoji: '⏰',
    description: '+10 seconds in speed run mode',
    cost: 25,
    category: 'perk',
    effect: 'time_bonus',
    consumable: true,
    maxPurchases: 2,
  },
  {
    id: 'magnet_start',
    name: 'Head Start Magnet',
    emoji: '🧲',
    description: 'Start with magnet active for 5 seconds',
    cost: 20,
    category: 'perk',
    effect: 'magnet_start',
    consumable: true,
    maxPurchases: 3,
  },
  {
    id: 'double_first',
    name: 'First Word x3',
    emoji: '💎',
    description: 'Your first word is worth 3x points',
    cost: 40,
    category: 'perk',
    effect: 'double_first',
    consumable: true,
    maxPurchases: 2,
  },
  {
    id: 'shield_start',
    name: 'Shield Start',
    emoji: '🛡️',
    description: 'Start with shield active for 5 seconds',
    cost: 35,
    category: 'perk',
    effect: 'shield_start',
    consumable: true,
    maxPurchases: 2,
  },

  // Special (3)
  {
    id: 'boss_reroll',
    name: 'Boss Reroll',
    emoji: '🎲',
    description: 'Reroll the current boss encounter',
    cost: 15,
    category: 'special',
    effect: 'boss_reroll',
    consumable: true,
    maxPurchases: 5,
  },
  {
    id: 'daily_reroll',
    name: 'Challenge Reroll',
    emoji: '🔄',
    description: 'Get a new set of daily challenge words',
    cost: 10,
    category: 'special',
    effect: 'daily_reroll',
    consumable: true,
    maxPurchases: 1,
  },
  {
    id: 'reveal_word',
    name: 'Word Reveal',
    emoji: '👁️',
    description: 'Show the category of the next word',
    cost: 5,
    category: 'special',
    effect: 'reveal_word',
    consumable: true,
    maxPurchases: 5,
  },
]

// Re-exported as SHOP_ITEMS with purchasedCount always 0 (static base catalog)
export const SHOP_ITEMS: ShopItem[] = SHOP_ITEM_DEFINITIONS.map((def) => ({
  ...def,
  purchasedCount: 0,
}))

// ---------------------------------------------------------------------------
// Internal: read/write purchase counts
// ---------------------------------------------------------------------------
function getPurchaseMap(): Record<string, number> {
  return getStoredObject<Record<string, number>>(PURCHASE_KEY, {})
}

function savePurchaseMap(map: Record<string, number>): void {
  setStored(PURCHASE_KEY, map)
}

// ---------------------------------------------------------------------------
// Coin balance
// ---------------------------------------------------------------------------

/**
 * Get the current coin balance from localStorage.
 */
export function getCoinBalance(): CoinBalance {
  return getStoredObject<CoinBalance>(COIN_KEY, {
    coins: 0,
    totalEarned: 0,
    totalSpent: 0,
  })
}

function saveCoinBalance(balance: CoinBalance): void {
  setStored(COIN_KEY, balance)
}

/**
 * Add coins to the player's balance.
 * @param amount  Number of coins to add (must be >= 0)
 * @param reason  Description of why coins were earned (for logging / audit)
 * @returns       The new balance after adding
 */
export function addCoins(amount: number, reason: string): number {
  if (amount <= 0) return getCoinBalance().coins

  const balance = getCoinBalance()
  balance.coins += amount
  balance.totalEarned += amount
  saveCoinBalance(balance)
  return balance.coins
}

/**
 * Spend coins from the player's balance.
 * @param amount  Number of coins to spend (must be >= 0)
 * @returns       `true` if the spend succeeded, `false` if insufficient funds
 */
export function spendCoins(amount: number): boolean {
  if (amount <= 0) return false

  const balance = getCoinBalance()
  if (balance.coins < amount) return false

  balance.coins -= amount
  balance.totalSpent += amount
  saveCoinBalance(balance)
  return true
}

// ---------------------------------------------------------------------------
// Shop items — dynamic (with current purchasedCount from localStorage)
// ---------------------------------------------------------------------------

/**
 * Get all shop items with the player's current purchasedCount merged in.
 */
export function getShopItems(): ShopItem[] {
  const map = getPurchaseMap()
  return SHOP_ITEM_DEFINITIONS.map((def) => ({
    ...def,
    purchasedCount: map[def.id] ?? 0,
  }))
}

/**
 * Purchase a shop item.
 * Validates funds and max-purchase limits, then deducts coins and records the purchase.
 */
export function purchaseItem(itemId: string): PurchaseResult {
  const definition = SHOP_ITEM_DEFINITIONS.find((d) => d.id === itemId)

  if (!definition) {
    const fallbackItem: ShopItem = {
      id: itemId,
      name: 'Unknown',
      emoji: '❓',
      description: 'Item not found',
      cost: 0,
      category: 'cosmetic',
      effect: '',
      consumable: false,
      maxPurchases: 0,
      purchasedCount: 0,
    }
    return { success: false, newBalance: getCoinBalance().coins, item: fallbackItem, reason: 'insufficient_coins' }
  }

  const map = getPurchaseMap()
  const currentPurchased = map[itemId] ?? 0

  // Build the item with live purchasedCount for the result
  const item: ShopItem = { ...definition, purchasedCount: currentPurchased }

  // Check max purchases
  if (definition.maxPurchases !== -1 && currentPurchased >= definition.maxPurchases) {
    return {
      success: false,
      newBalance: getCoinBalance().coins,
      item,
      reason: 'max_purchased',
    }
  }

  // Check funds
  const balance = getCoinBalance()
  if (balance.coins < definition.cost) {
    return {
      success: false,
      newBalance: balance.coins,
      item,
      reason: 'insufficient_coins',
    }
  }

  // Execute purchase
  balance.coins -= definition.cost
  balance.totalSpent += definition.cost
  saveCoinBalance(balance)

  map[itemId] = currentPurchased + 1
  savePurchaseMap(map)

  return {
    success: true,
    newBalance: balance.coins,
    item: { ...definition, purchasedCount: currentPurchased + 1 },
  }
}

/**
 * Check if the player owns at least one of a consumable item.
 * Always returns `true` for non-consumable items that have been purchased at least once.
 */
export function hasItem(itemId: string): boolean {
  const map = getPurchaseMap()
  return (map[itemId] ?? 0) > 0
}

/**
 * Consume one instance of a consumable item.
 * @returns `true` if the item was available and decremented, `false` otherwise
 */
export function consumeItem(itemId: string): boolean {
  const map = getPurchaseMap()
  const count = map[itemId] ?? 0
  if (count <= 0) return false

  map[itemId] = count - 1
  savePurchaseMap(map)
  return true
}

/**
 * Get how many times the player has purchased an item.
 */
export function getItemPurchasedCount(itemId: string): number {
  const map = getPurchaseMap()
  return map[itemId] ?? 0
}

/**
 * Format a coin amount for display, e.g. "🪙 150"
 */
export function formatCoins(amount: number): string {
  return `🪙 ${amount}`
}
