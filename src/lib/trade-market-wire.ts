/**
 * trade-market-wire.ts — Player Trading & Marketplace System for Word Snake
 *
 * Standalone module providing an in-game marketplace with listings, auctions,
 * price tracking, daily deals, gifting, wishlists, vendor specials, and more.
 * All data persisted in localStorage with `ws_market_` prefix.
 *
 * Categories: Cosmetics, Materials, Power-ups, Pets, Rare Items, Bundles
 * Rarity tiers: Common, Uncommon, Rare, Epic, Legendary  •  Currency: coins (10–50 000)
 */

// ─── Types ──────────────────────────────────────────────────────────────────

/** Rarity tier for marketplace items. */
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

/** Listing type. */
export type ListingType = 'sell' | 'trade' | 'auction';

/** Sort order for filtered listings. */
export type SortOrder = 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popular';

/** Market category names. */
export type MarketCategory = 'Cosmetics' | 'Materials' | 'Power-ups' | 'Pets' | 'Rare Items' | 'Bundles';

/** A marketplace item definition. */
export interface MarketItem {
  id: string;
  name: string;
  description: string;
  category: MarketCategory;
  rarity: Rarity;
  basePrice: number;
  icon: string;
  stackable: boolean;
  maxStack: number;
}

/** A market listing created by a player. */
export interface MarketListing {
  id: string;
  itemId: string;
  seller: string;
  price: number;
  type: ListingType;
  createdAt: number;
  expiresAt: number;
  category: MarketCategory;
  rarity: Rarity;
  buyoutPrice?: number;
  currentBid?: number;
  bidCount?: number;
  highestBidder?: string;
  active: boolean;
}

/** A completed transaction record. */
export interface Transaction {
  id: string;
  listingId: string;
  itemId: string;
  buyer: string;
  seller: string;
  price: number;
  type: ListingType;
  completedAt: number;
}

/** Single price-history data point. */
export interface PricePoint {
  date: string;
  price: number;
  volume: number;
}

/** Price-alert subscription. */
export interface PriceAlert {
  itemId: string;
  targetPrice: number;
  createdAt: number;
  triggered: boolean;
}

/** A daily deal entry. */
export interface DailyDeal {
  itemId: string;
  originalPrice: number;
  dealPrice: number;
  discountPct: number;
  quantity: number;
  claimed: number;
}

/** A limited-time offer. */
export interface LimitedOffer {
  id: string;
  itemId: string;
  label: string;
  originalPrice: number;
  salePrice: number;
  startsAt: number;
  endsAt: number;
  claimed: boolean;
}

/** Bundle deal grouping multiple items at a discount. */
export interface BundleDeal {
  id: string;
  name: string;
  itemIds: string[];
  bundlePrice: number;
  originalTotal: number;
  discountPct: number;
  endsAt: number;
}

/** Rotating vendor special that changes weekly. */
export interface VendorSpecial {
  id: string;
  vendorName: string;
  itemId: string;
  salePrice: number;
  originalPrice: number;
  weekStart: string;
  description: string;
}

/** A gift record. */
export interface Gift {
  id: string;
  itemId: string;
  from: string;
  to: string;
  sentAt: number;
  opened: boolean;
  message?: string;
}

/** Promo-code redemption record. */
export interface RedeemedCode {
  code: string;
  redeemedAt: number;
  reward: string;
}

/** Aggregate market statistics. */
export interface MarketStats {
  totalVolume: number;
  totalListings: number;
  avgPrice: number;
  medianPrice: number;
  trendingItems: string[];
}

/** UI-ready listing card for grid display. */
export interface ListingCard {
  listingId: string;
  itemName: string;
  itemIcon: string;
  rarity: Rarity;
  price: number;
  type: ListingType;
  seller: string;
  timeLeft: string;
  category: MarketCategory;
  currentBid?: number;
  bidCount?: number;
}

/** UI-ready transaction card. */
export interface TransactionCard {
  transactionId: string;
  itemName: string;
  itemIcon: string;
  price: number;
  direction: 'bought' | 'sold';
  completedAt: string;
  rarity: Rarity;
}

/** UI-ready marketplace overview for dashboard display. */
export interface MarketOverview {
  totalListings: number;
  totalTransactions: number;
  avgPrice: number;
  trendingItems: { id: string; name: string; change: number }[];
  dailyDealsCount: number;
  activeAuctions: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const PREFIX = 'ws_market_';

/** Load JSON from localStorage with fallback. */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Save JSON to localStorage (silently ignores errors). */
function save(key: string, data: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch { /* storage full or unavailable */ }
}

/** Generate a unique ID string. */
function uid(): string {
  return 'mk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Format remaining time as human-readable string. */
function timeLeftStr(expiresAt: number): string {
  const diff = Math.max(0, expiresAt - Date.now());
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs >= 24) return `${Math.floor(hrs / 24)}d`;
  if (hrs > 0) return `${hrs}h`;
  return `${Math.floor(diff / 60_000)}m`;
}

/** Deterministic pseudo-random 0–1 from a seed. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ─── Mock Catalogue — 22 items across 6 categories × 5 rarities ────────────

const CATALOGUE: MarketItem[] = [
  // Cosmetics (5)
  { id: 'c01', name: 'Blue Snake Skin', description: 'A sleek blue skin for your snake.', category: 'Cosmetics', rarity: 'Common', basePrice: 50, icon: '🐍', stackable: false, maxStack: 1 },
  { id: 'c02', name: 'Golden Trail', description: 'Leave a glittering gold trail.', category: 'Cosmetics', rarity: 'Uncommon', basePrice: 200, icon: '✨', stackable: false, maxStack: 1 },
  { id: 'c03', name: 'Neon Glow Head', description: 'A pulsing neon head accessory.', category: 'Cosmetics', rarity: 'Rare', basePrice: 800, icon: '💡', stackable: false, maxStack: 1 },
  { id: 'c04', name: 'Shadow Cloak', description: 'Wrap your snake in shadow.', category: 'Cosmetics', rarity: 'Epic', basePrice: 3500, icon: '👤', stackable: false, maxStack: 1 },
  { id: 'c05', name: 'Celestial Aura', description: 'Radiant cosmic aura effect.', category: 'Cosmetics', rarity: 'Legendary', basePrice: 18000, icon: '🌟', stackable: false, maxStack: 1 },
  // Materials (4)
  { id: 'm01', name: 'Letter Shard', description: 'A fragment of a powerful letter.', category: 'Materials', rarity: 'Common', basePrice: 10, icon: '🧩', stackable: true, maxStack: 99 },
  { id: 'm02', name: 'Ink Vial', description: 'Used to craft word scrolls.', category: 'Materials', rarity: 'Uncommon', basePrice: 75, icon: '🧪', stackable: true, maxStack: 50 },
  { id: 'm03', name: 'Parchment Sheet', description: 'High-quality crafting parchment.', category: 'Materials', rarity: 'Common', basePrice: 30, icon: '📜', stackable: true, maxStack: 99 },
  { id: 'm04', name: 'Enchanted Quill', description: 'Writes words that come alive.', category: 'Materials', rarity: 'Rare', basePrice: 600, icon: '🪶', stackable: true, maxStack: 10 },
  // Power-ups (4)
  { id: 'p01', name: 'Speed Boost', description: 'Temporarily increases speed.', category: 'Power-ups', rarity: 'Common', basePrice: 40, icon: '⚡', stackable: true, maxStack: 20 },
  { id: 'p02', name: 'Shield Bubble', description: 'Protects from one collision.', category: 'Power-ups', rarity: 'Uncommon', basePrice: 150, icon: '🛡️', stackable: true, maxStack: 10 },
  { id: 'p03', name: 'Magnet Pull', description: 'Attracts nearby letters.', category: 'Power-ups', rarity: 'Rare', basePrice: 500, icon: '🧲', stackable: true, maxStack: 5 },
  { id: 'p04', name: 'Time Freeze', description: 'Pauses the timer briefly.', category: 'Power-ups', rarity: 'Epic', basePrice: 2200, icon: '⏳', stackable: true, maxStack: 3 },
  // Pets (5)
  { id: 'pt01', name: 'Baby Slime', description: 'A cute slime companion.', category: 'Pets', rarity: 'Common', basePrice: 120, icon: '🟢', stackable: false, maxStack: 1 },
  { id: 'pt02', name: 'Pixel Owl', description: 'Wise owl that spots words.', category: 'Pets', rarity: 'Uncommon', basePrice: 350, icon: '🦉', stackable: false, maxStack: 1 },
  { id: 'pt03', name: 'Fire Drake', description: 'A fierce miniature dragon.', category: 'Pets', rarity: 'Rare', basePrice: 1200, icon: '🐉', stackable: false, maxStack: 1 },
  { id: 'pt04', name: 'Ghost Phoenix', description: 'Rises from defeat stronger.', category: 'Pets', rarity: 'Epic', basePrice: 5000, icon: '🔥', stackable: false, maxStack: 1 },
  { id: 'pt05', name: 'Cosmic Tortoise', description: 'Ancient being of the stars.', category: 'Pets', rarity: 'Legendary', basePrice: 25000, icon: '🐢', stackable: false, maxStack: 1 },
  // Rare Items (3)
  { id: 'r01', name: 'Dictionary Fragment', description: 'Piece of a legendary dictionary.', category: 'Rare Items', rarity: 'Rare', basePrice: 900, icon: '📖', stackable: true, maxStack: 5 },
  { id: 'r02', name: 'Word Stone', description: 'Ancient stone inscribed with power.', category: 'Rare Items', rarity: 'Epic', basePrice: 4000, icon: '🪨', stackable: true, maxStack: 3 },
  { id: 'r03', name: 'Infinity Scroll', description: 'Contains every word ever spoken.', category: 'Rare Items', rarity: 'Legendary', basePrice: 45000, icon: '🌀', stackable: false, maxStack: 1 },
];

const CATEGORIES: MarketCategory[] = ['Cosmetics', 'Materials', 'Power-ups', 'Pets', 'Rare Items', 'Bundles'];

// ─── Seed helpers ───────────────────────────────────────────────────────────

/** Ensure listings exist in localStorage; create mock data on first access. */
function ensureListings(): MarketListing[] {
  let listings = load<MarketListing[]>('listings', []);
  if (listings.length === 0) {
    const sellers = ['Player_42', 'WordNinja', 'SnakeCharmer', 'AlphaWord', 'LetterLord', 'VowelKing'];
    const types: ListingType[] = ['sell', 'sell', 'sell', 'trade', 'auction'];
    const now = Date.now();
    listings = CATALOGUE.map((item, i) => {
      const price = Math.round(item.basePrice * (0.7 + seededRandom(i * 137 + 7) * 0.6));
      const type = types[i % types.length];
      const listing: MarketListing = {
        id: `l_${i}_${uid()}`,
        itemId: item.id,
        seller: sellers[i % sellers.length],
        price,
        type,
        createdAt: now - seededRandom(i * 53) * 86400000,
        expiresAt: now + (24 + Math.floor(seededRandom(i * 31) * 48)) * 3_600_000,
        category: item.category,
        rarity: item.rarity,
        active: true,
      };
      if (type === 'auction') {
        listing.buyoutPrice = Math.round(price * 2.5);
        listing.currentBid = price + Math.floor(seededRandom(i * 19) * price * 0.4);
        listing.bidCount = 1 + Math.floor(seededRandom(i * 41) * 6);
      }
      return listing;
    });
    save('listings', listings);
  }
  return listings;
}

/** Ensure 14-day price history exists for every catalogue item. */
function ensurePriceHistory(): Record<string, PricePoint[]> {
  let history = load<Record<string, PricePoint[]>>('price_history', {});
  if (Object.keys(history).length === 0) {
    CATALOGUE.forEach((item, idx) => {
      const pts: PricePoint[] = [];
      for (let d = 14; d >= 0; d--) {
        const date = new Date(Date.now() - d * 86400000);
        const variation = 0.8 + seededRandom(idx * 100 + d * 7) * 0.4;
        pts.push({
          date: date.toISOString().slice(0, 10),
          price: Math.round(item.basePrice * variation),
          volume: 1 + Math.floor(seededRandom(idx * 200 + d) * 20),
        });
      }
      history[item.id] = pts;
    });
    save('price_history', history);
  }
  return history;
}

// ─── 1. getMarketListings ──────────────────────────────────────────────────

/**
 * Browse all active market listings.
 * @returns Array of active, non-expired MarketListing objects.
 */
export function getMarketListings(): MarketListing[] {
  try {
    return ensureListings().filter((l) => l.active && l.expiresAt > Date.now());
  } catch {
    return [];
  }
}

// ─── 2. createListing ─────────────────────────────────────────────────────

/**
 * Create a new market listing for an item.
 * @param item   - Catalogue item ID to list.
 * @param price  - Listing price in coins (must be > 0).
 * @param type   - 'sell' | 'trade' | 'auction'.
 * @returns The newly created listing, or null on failure.
 */
export function createListing(item: string, price: number, type: ListingType): MarketListing | null {
  try {
    const catalogItem = CATALOGUE.find((c) => c.id === item);
    if (!catalogItem || price <= 0) return null;

    const listing: MarketListing = {
      id: `l_${uid()}`, itemId: item, seller: 'You', price, type,
      createdAt: Date.now(), expiresAt: Date.now() + 72 * 3_600_000,
      category: catalogItem.category, rarity: catalogItem.rarity, active: true,
    };
    if (type === 'auction') {
      listing.buyoutPrice = Math.round(price * 2.5);
      listing.currentBid = 0;
      listing.bidCount = 0;
    }
    const listings = load<MarketListing[]>('listings', []);
    listings.push(listing);
    save('listings', listings);
    return listing;
  } catch {
    return null;
  }
}

// ─── 3. cancelListing ─────────────────────────────────────────────────────

/**
 * Cancel one of your own active listings.
 * @param listingId - The listing to cancel.
 * @returns True if successfully cancelled.
 */
export function cancelListing(listingId: string): boolean {
  try {
    const listings = load<MarketListing[]>('listings', []);
    const idx = listings.findIndex((l) => l.id === listingId && l.seller === 'You' && l.active);
    if (idx === -1) return false;
    listings[idx].active = false;
    save('listings', listings);
    return true;
  } catch {
    return false;
  }
}

// ─── 4. buyListing ────────────────────────────────────────────────────────

/**
 * Purchase an item from a 'sell' or 'trade' listing.
 * @param listingId - The listing to purchase.
 * @returns The transaction ID, or null on failure.
 */
export function buyListing(listingId: string): string | null {
  try {
    const listings = load<MarketListing[]>('listings', []);
    const idx = listings.findIndex((l) => l.id === listingId && l.active && l.type !== 'auction');
    if (idx === -1) return null;

    const listing = listings[idx];
    listing.active = false;
    save('listings', listings);

    const tx: Transaction = {
      id: `tx_${uid()}`, listingId, itemId: listing.itemId,
      buyer: 'You', seller: listing.seller, price: listing.price,
      type: listing.type, completedAt: Date.now(),
    };
    const history = load<Transaction[]>('transactions', []);
    history.push(tx);
    save('transactions', history);
    return tx.id;
  } catch {
    return null;
  }
}

// ─── 5. placeBid ──────────────────────────────────────────────────────────

/**
 * Place a bid on an auction listing. Must exceed the current highest bid.
 * @param listingId - The auction listing ID.
 * @param amount    - Bid amount in coins (must be > current bid).
 * @returns True if the bid was accepted.
 */
export function placeBid(listingId: string, amount: number): boolean {
  try {
    if (amount <= 0) return false;
    const listings = load<MarketListing[]>('listings', []);
    const listing = listings.find((l) => l.id === listingId && l.active && l.type === 'auction');
    if (!listing) return false;
    if (listing.buyoutPrice !== undefined && amount >= listing.buyoutPrice) return false;
    if ((listing.currentBid ?? 0) >= amount) return false;

    listing.currentBid = amount;
    listing.highestBidder = 'You';
    listing.bidCount = (listing.bidCount ?? 0) + 1;
    save('listings', listings);

    const bids = load<{ auctionId: string; bidder: string; amount: number; at: number }[]>('bids', []);
    bids.push({ auctionId: listingId, bidder: 'You', amount, at: Date.now() });
    save('bids', bids);
    return true;
  } catch {
    return false;
  }
}

// ─── 6. getMyListings ─────────────────────────────────────────────────────

/**
 * Get all of your own active listings.
 * @returns Array of your active MarketListing objects.
 */
export function getMyListings(): MarketListing[] {
  try {
    return load<MarketListing[]>('listings', []).filter((l) => l.seller === 'You' && l.active);
  } catch {
    return [];
  }
}

// ─── 7. getTransactionHistory ─────────────────────────────────────────────

/**
 * Get complete transaction history, newest first.
 * @returns Array of past Transaction records.
 */
export function getTransactionHistory(): Transaction[] {
  try {
    return load<Transaction[]>('transactions', []).sort((a, b) => b.completedAt - a.completedAt);
  } catch {
    return [];
  }
}

// ─── 8. getMarketCategories ───────────────────────────────────────────────

/**
 * Get available marketplace category filter options.
 * @returns Array of category names.
 */
export function getMarketCategories(): MarketCategory[] {
  return [...CATEGORIES];
}

// ─── 9. filterListings ────────────────────────────────────────────────────

/**
 * Filter and sort marketplace listings by category, rarity, and sort order.
 * @param category - Optional category filter.
 * @param rarity   - Optional rarity filter.
 * @param sort     - Sort order, defaults to 'newest'.
 * @returns Filtered and sorted array of active listings.
 */
export function filterListings(category?: MarketCategory, rarity?: Rarity, sort: SortOrder = 'newest'): MarketListing[] {
  try {
    let result = getMarketListings();
    if (category) result = result.filter((l) => l.category === category);
    if (rarity) result = result.filter((l) => l.rarity === rarity);
    switch (sort) {
      case 'price_asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'oldest':     result.sort((a, b) => a.createdAt - b.createdAt); break;
      case 'popular':    result.sort((a, b) => (b.bidCount ?? 0) - (a.bidCount ?? 0)); break;
      default:           result.sort((a, b) => b.createdAt - a.createdAt); break;
    }
    return result;
  } catch {
    return [];
  }
}

// ─── 10. searchMarket ─────────────────────────────────────────────────────

/**
 * Search listings by item name or description substring.
 * @param query - Search string (case-insensitive).
 * @returns Matching listings.
 */
export function searchMarket(query: string): MarketListing[] {
  try {
    if (!query.trim()) return getMarketListings();
    const q = query.toLowerCase();
    return getMarketListings().filter((l) => {
      const cat = CATALOGUE.find((c) => c.id === l.itemId);
      return cat && (cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q));
    });
  } catch {
    return [];
  }
}

// ─── 11. getPriceHistory ──────────────────────────────────────────────────

/**
 * Get 14-day price history for a specific item.
 * @param itemId - Catalogue item ID.
 * @returns Array of daily PricePoint records.
 */
export function getPriceHistory(itemId: string): PricePoint[] {
  try {
    return ensurePriceHistory()[itemId] ?? [];
  } catch {
    return [];
  }
}

// ─── 12. getItemValue ─────────────────────────────────────────────────────

/**
 * Estimate current market value based on recent price history (last 7 days).
 * @param itemId - Catalogue item ID.
 * @returns Estimated price in coins, or 0 if unknown.
 */
export function getItemValue(itemId: string): number {
  try {
    const pts = getPriceHistory(itemId);
    if (pts.length === 0) {
      const cat = CATALOGUE.find((c) => c.id === itemId);
      return cat ? cat.basePrice : 0;
    }
    const recent = pts.slice(-7);
    return Math.round(recent.reduce((s, p) => s + p.price, 0) / recent.length);
  } catch {
    return 0;
  }
}

// ─── 13. getMarketStats ───────────────────────────────────────────────────

/**
 * Get aggregate market statistics: volume, averages, trending items.
 * @returns MarketStats summary object.
 */
export function getMarketStats(): MarketStats {
  try {
    const listings = getMarketListings();
    const txs = getTransactionHistory();
    const prices = listings.map((l) => l.price).sort((a, b) => a - b);
    const avgPrice = prices.length ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : 0;
    const medianPrice = prices.length ? prices[Math.floor(prices.length / 2)] : 0;

    const txCounts: Record<string, number> = {};
    txs.forEach((t) => { txCounts[t.itemId] = (txCounts[t.itemId] ?? 0) + 1; });
    const trendingItems = Object.entries(txCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);

    return { totalVolume: txs.reduce((s, t) => s + t.price, 0), totalListings: listings.length, avgPrice, medianPrice, trendingItems };
  } catch {
    return { totalVolume: 0, totalListings: 0, avgPrice: 0, medianPrice: 0, trendingItems: [] };
  }
}

// ─── 14. getTrendingItems ─────────────────────────────────────────────────

/**
 * Get the most-traded items in the marketplace.
 * @returns Array of { itemId, name, tradeCount } sorted by trade count descending.
 */
export function getTrendingItems(): { itemId: string; name: string; tradeCount: number }[] {
  try {
    const txCounts: Record<string, number> = {};
    getTransactionHistory().forEach((t) => { txCounts[t.itemId] = (txCounts[t.itemId] ?? 0) + 1; });
    return Object.entries(txCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([id, tradeCount]) => ({ itemId: id, name: CATALOGUE.find((c) => c.id === id)?.name ?? id, tradeCount }));
  } catch {
    return [];
  }
}

// ─── 15. getDailyDeals ────────────────────────────────────────────────────

/**
 * Get today's daily deals. Three deals per day, deterministic rotation based on date.
 * @returns Array of DailyDeal objects.
 */
export function getDailyDeals(): DailyDeal[] {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const cacheDate = load<string>('daily_deals_date', '');
    if (cacheDate === today) return load<DailyDeal[]>('daily_deals_cache', []);

    const daySeed = parseInt(today.replace(/-/g, ''), 10) || 0;
    const deals: DailyDeal[] = [];
    for (let i = 0; i < 3; i++) {
      const item = CATALOGUE[Math.floor(seededRandom(daySeed + i * 97) * CATALOGUE.length)];
      const discount = 15 + Math.floor(seededRandom(daySeed + i * 31) * 30);
      deals.push({
        itemId: item.id, originalPrice: item.basePrice,
        dealPrice: Math.round(item.basePrice * (1 - discount / 100)),
        discountPct: discount,
        quantity: 3 + Math.floor(seededRandom(daySeed + i * 17) * 8),
        claimed: Math.floor(seededRandom(daySeed + i * 53) * 2),
      });
    }
    save('daily_deals_cache', deals);
    save('daily_deals_date', today);
    return deals;
  } catch {
    return [];
  }
}

// ─── 16. getLimitedOffers ─────────────────────────────────────────────────

/**
 * Get currently active limited-time offers. Generates flash sales on first call if none active.
 * @returns Array of LimitedOffer objects.
 */
export function getLimitedOffers(): LimitedOffer[] {
  try {
    const now = Date.now();
    const offers = load<LimitedOffer[]>('limited_offers', []);
    const active = offers.filter((o) => o.startsAt <= now && o.endsAt >= now && !o.claimed);
    if (active.length > 0) return active;

    const candidates = CATALOGUE.filter((c) => c.rarity === 'Epic' || c.rarity === 'Legendary');
    const generated: LimitedOffer[] = candidates.slice(0, 2).map((item, i) => ({
      id: `lo_${uid()}`, itemId: item.id,
      label: `${item.rarity} Flash Sale!`,
      originalPrice: item.basePrice,
      salePrice: Math.round(item.basePrice * (1 - (20 + i * 10) / 100)),
      startsAt: now, endsAt: now + (4 + i * 3) * 3_600_000, claimed: false,
    }));
    save('limited_offers', generated);
    return generated;
  } catch {
    return [];
  }
}

// ─── 17. redeemCode ───────────────────────────────────────────────────────

/**
 * Redeem a promotional code for a reward. Each code can only be used once.
 * @param code - The promo code string (case-insensitive).
 * @returns Reward description string, or null if invalid / already used.
 */
export function redeemCode(code: string): string | null {
  try {
    const upper = code.trim().toUpperCase();
    const redeemed = getRedeemedCodes();
    if (redeemed.some((r) => r.code === upper)) return null;

    const codes: Record<string, string> = {
      'WORDSNAKE10': '500 bonus coins', 'FREEPET2024': 'Baby Slime pet',
      'NEONSKIN': 'Neon Glow Head accessory', 'POWERUPX5': '5 random power-ups',
      'DICTIONARY50': 'Dictionary Fragment', 'SNAKEGOLD': '1000 bonus coins',
    };
    const reward = codes[upper] ?? null;
    if (!reward) return null;

    redeemed.push({ code: upper, redeemedAt: Date.now(), reward });
    save('redeemed_codes', redeemed);
    return reward;
  } catch {
    return null;
  }
}

// ─── 18. getRedeemedCodes ─────────────────────────────────────────────────

/**
 * Get history of all redeemed promo codes.
 * @returns Array of RedeemedCode records.
 */
export function getRedeemedCodes(): RedeemedCode[] {
  try {
    return load<RedeemedCode[]>('redeemed_codes', []);
  } catch {
    return [];
  }
}

// ─── 19. getGifts ─────────────────────────────────────────────────────────

/**
 * Get all gifts you have received, newest first.
 * @returns Array of Gift records.
 */
export function getGifts(): Gift[] {
  try {
    return load<Gift[]>('gifts', []).sort((a, b) => b.sentAt - a.sentAt);
  } catch {
    return [];
  }
}

// ─── 20. sendGift ─────────────────────────────────────────────────────────

/**
 * Send an item to another player as a gift.
 * @param item    - Catalogue item ID.
 * @param to      - Recipient player name.
 * @param message - Optional message to attach to the gift.
 * @returns True if the gift was sent successfully.
 */
export function sendGift(item: string, to: string, message?: string): boolean {
  try {
    if (!to.trim() || !CATALOGUE.find((c) => c.id === item)) return false;
    const gifts = load<Gift[]>('gifts', []);
    gifts.push({ id: `gift_${uid()}`, itemId: item, from: 'You', to, sentAt: Date.now(), opened: false, message });
    save('gifts', gifts);
    return true;
  } catch {
    return false;
  }
}

// ─── 21. mkGetWishlist (renamed from getWishlist) ─────────────────────────

/**
 * Get the player's marketplace wishlist.
 * @returns Array of item IDs currently wishlisted.
 */
export function mkGetWishlist(): string[] {
  try {
    return load<string[]>('wishlist', []);
  } catch {
    return [];
  }
}

// ─── 22. addToWishlist ────────────────────────────────────────────────────

/**
 * Add an item to the marketplace wishlist.
 * @param itemId - Catalogue item ID to add.
 * @returns True if the item was added (was not already present).
 */
export function addToWishlist(itemId: string): boolean {
  try {
    const list = mkGetWishlist();
    if (list.includes(itemId)) return false;
    list.push(itemId);
    save('wishlist', list);
    return true;
  } catch {
    return false;
  }
}

// ─── 23. removeFromWishlist ───────────────────────────────────────────────

/**
 * Remove an item from the marketplace wishlist.
 * @param itemId - Catalogue item ID to remove.
 * @returns True if the item was found and removed.
 */
export function removeFromWishlist(itemId: string): boolean {
  try {
    const list = mkGetWishlist();
    const idx = list.indexOf(itemId);
    if (idx === -1) return false;
    list.splice(idx, 1);
    save('wishlist', list);
    return true;
  } catch {
    return false;
  }
}

// ─── 24. getPriceAlerts ───────────────────────────────────────────────────

/**
 * Get all price alerts the player has configured.
 * @returns Array of PriceAlert objects.
 */
export function getPriceAlerts(): PriceAlert[] {
  try {
    return load<PriceAlert[]>('price_alerts', []);
  } catch {
    return [];
  }
}

// ─── 25. setPriceAlert ────────────────────────────────────────────────────

/**
 * Set a price alert that triggers when estimated market value drops to or below a target.
 * @param itemId      - Catalogue item ID.
 * @param targetPrice - Price threshold in coins.
 * @returns True if the alert was created/updated successfully.
 */
export function setPriceAlert(itemId: string, targetPrice: number): boolean {
  try {
    if (targetPrice <= 0) return false;
    const alerts = getPriceAlerts();
    const existing = alerts.findIndex((a) => a.itemId === itemId);
    const alert: PriceAlert = { itemId, targetPrice, createdAt: Date.now(), triggered: false };
    if (existing >= 0) alerts[existing] = alert;
    else alerts.push(alert);
    save('price_alerts', alerts);
    return true;
  } catch {
    return false;
  }
}

// ─── 26. checkPriceAlerts ─────────────────────────────────────────────────

/**
 * Check which price alerts have been triggered by current market values.
 * Triggered alerts are marked and not returned again.
 * @returns Array of newly triggered PriceAlert objects.
 */
export function checkPriceAlerts(): PriceAlert[] {
  try {
    const alerts = getPriceAlerts();
    const triggered: PriceAlert[] = [];
    let changed = false;
    alerts.forEach((a) => {
      if (a.triggered) return;
      if (getItemValue(a.itemId) <= a.targetPrice) {
        a.triggered = true;
        changed = true;
        triggered.push(a);
      }
    });
    if (changed) save('price_alerts', alerts);
    return triggered;
  } catch {
    return [];
  }
}

// ─── 27. getAuctionHouse ──────────────────────────────────────────────────

/**
 * Get all active auction listings currently running.
 * @returns Array of auction-type MarketListing objects.
 */
export function getAuctionHouse(): MarketListing[] {
  try {
    return getMarketListings().filter((l) => l.type === 'auction');
  } catch {
    return [];
  }
}

// ─── 28. getBidHistory ────────────────────────────────────────────────────

/**
 * Get full bid history for a specific auction, newest bids first.
 * @param auctionId - The auction listing ID.
 * @returns Array of bid records with bidder, amount, and timestamp.
 */
export function getBidHistory(auctionId: string): { bidder: string; amount: number; at: number }[] {
  try {
    return load<{ auctionId: string; bidder: string; amount: number; at: number }[]>('bids', [])
      .filter((b) => b.auctionId === auctionId)
      .sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}

// ─── 29. getMyBids ────────────────────────────────────────────────────────

/**
 * Get all auctions where the player has placed a bid.
 * @returns Array of auction MarketListing objects you are bidding on.
 */
export function getMyBids(): MarketListing[] {
  try {
    const myAuctionIds = new Set(
      load<{ auctionId: string; bidder: string }[]>('bids', [])
        .filter((b) => b.bidder === 'You')
        .map((b) => b.auctionId)
    );
    return getAuctionHouse().filter((l) => myAuctionIds.has(l.id));
  } catch {
    return [];
  }
}

// ─── 30. getMarketOverview ────────────────────────────────────────────────

/**
 * Get a summary overview of the marketplace for dashboard / HUD display.
 * @returns MarketOverview with key metrics and trending data.
 */
export function getMarketOverview(): MarketOverview {
  try {
    const listings = getMarketListings();
    const txs = getTransactionHistory();
    const stats = getMarketStats();
    const auctions = listings.filter((l) => l.type === 'auction');

    const trendingItems = stats.trendingItems.slice(0, 3).map((id) => {
      const cat = CATALOGUE.find((c) => c.id === id);
      const history = getPriceHistory(id);
      const last = history.length >= 2 ? history[history.length - 2].price : (cat?.basePrice ?? 0);
      const current = history.length >= 1 ? history[history.length - 1].price : last;
      const change = last > 0 ? Math.round(((current - last) / last) * 100) : 0;
      return { id, name: cat?.name ?? id, change };
    });

    return {
      totalListings: listings.length, totalTransactions: txs.length,
      avgPrice: stats.avgPrice, trendingItems,
      dailyDealsCount: getDailyDeals().length, activeAuctions: auctions.length,
    };
  } catch {
    return { totalListings: 0, totalTransactions: 0, avgPrice: 0, trendingItems: [], dailyDealsCount: 0, activeAuctions: 0 };
  }
}

// ─── 31. getListingCard ───────────────────────────────────────────────────

/**
 * Get a UI-ready card for rendering a listing in the marketplace grid.
 * @param listingId - The listing ID to render.
 * @returns ListingCard object, or null if listing not found.
 */
export function getListingCard(listingId: string): ListingCard | null {
  try {
    const listing = load<MarketListing[]>('listings', []).find((l) => l.id === listingId);
    if (!listing) return null;
    const cat = CATALOGUE.find((c) => c.id === listing.itemId);
    return {
      listingId: listing.id, itemName: cat?.name ?? 'Unknown', itemIcon: cat?.icon ?? '❓',
      rarity: listing.rarity, price: listing.price, type: listing.type, seller: listing.seller,
      timeLeft: timeLeftStr(listing.expiresAt), category: listing.category,
      currentBid: listing.currentBid, bidCount: listing.bidCount,
    };
  } catch {
    return null;
  }
}

// ─── 32. getTransactionCard ───────────────────────────────────────────────

/**
 * Get a UI-ready card for rendering a past transaction.
 * @param transactionId - The transaction ID to render.
 * @returns TransactionCard object, or null if not found.
 */
export function getTransactionCard(transactionId: string): TransactionCard | null {
  try {
    const tx = load<Transaction[]>('transactions', []).find((t) => t.id === transactionId);
    if (!tx) return null;
    const cat = CATALOGUE.find((c) => c.id === tx.itemId);
    return {
      transactionId: tx.id, itemName: cat?.name ?? 'Unknown', itemIcon: cat?.icon ?? '❓',
      price: tx.price, direction: tx.buyer === 'You' ? 'bought' : 'sold',
      completedAt: new Date(tx.completedAt).toLocaleDateString(), rarity: cat?.rarity ?? 'Common',
    };
  } catch {
    return null;
  }
}

// ─── 33. getMarketGraph ───────────────────────────────────────────────────

/**
 * Get data suitable for rendering a price history chart for an item.
 * @param itemId - Catalogue item ID.
 * @returns Object with price points array and item metadata.
 */
export function getMarketGraph(itemId: string): { points: PricePoint[]; item: MarketItem | null } {
  try {
    return { points: getPriceHistory(itemId), item: CATALOGUE.find((c) => c.id === itemId) ?? null };
  } catch {
    return { points: [], item: null };
  }
}

// ─── 34. getBundleDeals ───────────────────────────────────────────────────

/**
 * Get current multi-item bundle deals at discounted prices.
 * @returns Array of BundleDeal objects.
 */
export function getBundleDeals(): BundleDeal[] {
  try {
    const now = Date.now();
    const bundles = load<BundleDeal[]>('bundles', []);
    const active = bundles.filter((b) => b.endsAt > now);
    if (active.length > 0) return active;

    const generated: BundleDeal[] = [
      { id: 'bun_starter', name: 'Starter Pack', itemIds: ['c01', 'p01', 'p02', 'm01'], bundlePrice: 200, originalTotal: 350, discountPct: 43, endsAt: now + 7 * 86400000 },
      { id: 'bun_power', name: 'Power Player Bundle', itemIds: ['p01', 'p02', 'p03', 'p04', 'pt01'], bundlePrice: 1800, originalTotal: 3010, discountPct: 40, endsAt: now + 5 * 86400000 },
      { id: 'bun_pets', name: 'Pet Lover Pack', itemIds: ['pt01', 'pt02', 'pt03', 'pt04'], bundlePrice: 4000, originalTotal: 6670, discountPct: 40, endsAt: now + 3 * 86400000 },
    ];
    save('bundles', generated);
    return generated;
  } catch {
    return [];
  }
}

// ─── 35. getVendorSpecials ────────────────────────────────────────────────

/**
 * Get rotating vendor specials that change every week based on the ISO week start.
 * @returns Array of VendorSpecial objects for the current week.
 */
export function getVendorSpecials(): VendorSpecial[] {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStr = weekStart.toISOString().slice(0, 10);
    const cacheWeek = load<string>('vendor_week', '');
    if (cacheWeek === weekStr) return load<VendorSpecial[]>('vendor_specials_cache', []);

    const vendors = ['Mystic Merchant', 'Wandering Scribe', 'The Alchemist', 'Shadow Trader'];
    const specials: VendorSpecial[] = vendors.map((vendorName, i) => {
      const item = CATALOGUE[Math.floor(seededRandom(weekStart.getTime() + i * 111) * CATALOGUE.length)];
      const discount = 10 + Math.floor(seededRandom(weekStart.getTime() + i * 73) * 25);
      return {
        id: `vs_${uid()}`, vendorName, itemId: item.id,
        salePrice: Math.round(item.basePrice * (1 - discount / 100)),
        originalPrice: item.basePrice, weekStart: weekStr,
        description: `${vendorName} offers ${item.name} at ${discount}% off!`,
      };
    });
    save('vendor_specials_cache', specials);
    save('vendor_week', weekStr);
    return specials;
  } catch {
    return [];
  }
}
