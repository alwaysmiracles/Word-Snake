import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Wanderer Bazaar (流浪者集市) — Word Snake Wire Module
// ───────────────────────────────────────────────────────────────────────────────
// A mystical marketplace that appears between worlds, where travelers trade
// enchanted goods, rare curiosities, and dimensional artifacts across eight
// ethereal districts while haggling with otherworldly merchants.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Color Theme Constants ────────────────────────────────────────────────────

const WB_COLOR_BAZAAR_GOLD = '#D4A017';
const WB_COLOR_CURIO_PURPLE = '#7B2D8E';
const WB_COLOR_MYSTIC_TEAL = '#0D7377';
const WB_COLOR_LANTERN_ORANGE = '#E8751A';
const WB_COLOR_SILK_CRIMSON = '#A8102E';
// Additional palette colors available for UI theming:
// WB_COLOR_PALE_GOLD = '#F5E6C8';
// WB_COLOR_DEEP_PURPLE = '#4A1259';
// WB_COLOR_DARK_TEAL = '#064D50';
// WB_COLOR_WARM_AMBER = '#B8860B';
// WB_COLOR_SHADOW_INDIGO = '#2E1A47';
// WB_COLOR_MIST_SILVER = '#C0C0D0';
// WB_COLOR_EMBER_RED = '#C0392B';

// ─── Rarity Tier Constants ────────────────────────────────────────────────────

const WB_RARITY_COMMON = 'common';
const WB_RARITY_UNCOMMON = 'uncommon';
const WB_RARITY_RARE = 'rare';
const WB_RARITY_EPIC = 'epic';
const WB_RARITY_LEGENDARY = 'legendary';

const WB_RARITY_COLORS: Record<string, string> = {
  [WB_RARITY_COMMON]: '#9E9E9E',
  [WB_RARITY_UNCOMMON]: WB_COLOR_MYSTIC_TEAL,
  [WB_RARITY_RARE]: WB_COLOR_CURIO_PURPLE,
  [WB_RARITY_EPIC]: WB_COLOR_LANTERN_ORANGE,
  [WB_RARITY_LEGENDARY]: WB_COLOR_BAZAAR_GOLD,
};

const WB_RARITY_LABELS: Record<string, { en: string; zh: string }> = {
  [WB_RARITY_COMMON]: { en: 'Common', zh: '普通' },
  [WB_RARITY_UNCOMMON]: { en: 'Uncommon', zh: '优良' },
  [WB_RARITY_RARE]: { en: 'Rare', zh: '稀有' },
  [WB_RARITY_EPIC]: { en: 'Epic', zh: '史诗' },
  [WB_RARITY_LEGENDARY]: { en: 'Legendary', zh: '传说' },
};

const WB_RARITY_MULTIPLIER: Record<string, number> = {
  [WB_RARITY_COMMON]: 1,
  [WB_RARITY_UNCOMMON]: 2,
  [WB_RARITY_RARE]: 4,
  [WB_RARITY_EPIC]: 8,
  [WB_RARITY_LEGENDARY]: 16,
};

// ─── Moon Phase Constants ────────────────────────────────────────────────────

const WB_PHASE_NEW_MOON = 'new_moon';
const WB_PHASE_WAXING = 'waxing';
const WB_PHASE_FULL_MOON = 'full_moon';
const WB_PHASE_WANING = 'waning';

const WB_MOON_PHASES = [
  { id: WB_PHASE_NEW_MOON, name: 'New Moon', nameZh: '新月', icon: '🌑', haggleMod: 1.3, tradeMod: 0.7, eventMod: 0.5, rarityMod: 0.8 },
  { id: WB_PHASE_WAXING, name: 'Waxing Moon', nameZh: '上弦月', icon: '🌓', haggleMod: 1.1, tradeMod: 1.0, eventMod: 0.8, rarityMod: 1.0 },
  { id: WB_PHASE_FULL_MOON, name: 'Full Moon', nameZh: '满月', icon: '🌕', haggleMod: 0.8, tradeMod: 1.3, eventMod: 1.5, rarityMod: 1.4 },
  { id: WB_PHASE_WANING, name: 'Waning Moon', nameZh: '下弦月', icon: '🌗', haggleMod: 1.0, tradeMod: 0.9, eventMod: 1.0, rarityMod: 1.1 },
];

// ─── Title Constants (8) ─────────────────────────────────────────────────────

const WB_TITLES = [
  { name: 'Peddler', nameZh: '小贩', minReputation: 0, icon: '🧳' },
  { name: 'Tinker', nameZh: '工匠', minReputation: 80, icon: '🔧' },
  { name: 'Haggler', nameZh: '还价客', minReputation: 200, icon: '💰' },
  { name: 'Merchant', nameZh: '商人', minReputation: 400, icon: '🏪' },
  { name: 'Trader of Realms', nameZh: '界域商人', minReputation: 700, icon: '🌀' },
  { name: 'Master Curator', nameZh: '馆长', minReputation: 1200, icon: '🗝️' },
  { name: 'Dimensional Archon', nameZh: '维度执政官', minReputation: 2000, icon: '🔮' },
  { name: 'Bazaar Sovereign', nameZh: '集市之主', minReputation: 4000, icon: '👑' },
];

// ─── Bazaar Event Definitions ────────────────────────────────────────────────

interface BazaarEventDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  effectType: string;
  effectValue: number;
  duration: number;
  icon: string;
  probability: number;
}

const WB_BAZAAR_EVENTS: BazaarEventDef[] = [
  { id: 'evt01', name: 'Wandering Alchemist', nameZh: '流浪炼金师', description: 'An alchemist sells rare potions at discount', effectType: 'gold_bonus', effectValue: 180, duration: 0, icon: '⚗️', probability: 0.08 },
  { id: 'evt02', name: 'Dimensional Rift', nameZh: '维度裂缝', description: 'A rift spews cursed items into stalls', effectType: 'gold_loss', effectValue: 120, duration: 0, icon: '🌀', probability: 0.06 },
  { id: 'evt03', name: 'Spirit Caravan', nameZh: '灵体商队', description: 'Ghost merchants bring exotic wares', effectType: 'reputation_gain', effectValue: 35, duration: 0, icon: '👻', probability: 0.07 },
  { id: 'evt04', name: 'Bazaar Festival', nameZh: '集市庆典', description: 'Lanterns illuminate every stall', effectType: 'trade_bonus', effectValue: 80, duration: 2, icon: '🏮', probability: 0.09 },
  { id: 'evt05', name: 'Shadow Thief', nameZh: '暗影窃贼', description: 'Thieves prowl the moonlit alleys', effectType: 'reputation_loss', effectValue: 25, duration: 0, icon: '🗡️', probability: 0.05 },
  { id: 'evt06', name: 'Mystic Artifact Found', nameZh: '发现神器', description: 'A rare artifact surfaces in the market', effectType: 'rare_good', effectValue: 1, duration: 0, icon: '💎', probability: 0.03 },
  { id: 'evt07', name: 'Portal Storm', nameZh: '传送门风暴', description: 'Wild magic destabilizes prices', effectType: 'price_chaos', effectValue: 0, duration: 2, icon: '⚡', probability: 0.04 },
  { id: 'evt08', name: 'Blessing of the Bazaar', nameZh: '集市祝福', description: 'Ancient spirits favor all traders', effectType: 'reputation_boost', effectValue: 40, duration: 0, icon: '✨', probability: 0.05 },
  { id: 'evt09', name: 'Traveler\'s Tale', nameZh: '旅者传说', description: 'A bard sings of your deeds', effectType: 'reputation_gain', effectValue: 50, duration: 0, icon: '📜', probability: 0.06 },
  { id: 'evt10', name: 'Astral Windfall', nameZh: '星界意外之财', description: 'Starlight condenses into coins', effectType: 'gold_bonus', effectValue: 400, duration: 0, icon: '🌠', probability: 0.02 },
  { id: 'evt11', name: 'Fog of Forgetting', nameZh: '遗忘之雾', description: 'Thick fog erodes merchant reputation', effectType: 'reputation_loss', effectValue: 35, duration: 2, icon: '🌫️', probability: 0.04 },
  { id: 'evt12', name: 'Djinn\'s Bargain', nameZh: '精灵契约', description: 'A djinn offers a tempting trade', effectType: 'haggle_boost', effectValue: 1, duration: 2, icon: '🧞', probability: 0.06 },
  { id: 'evt13', name: 'Crystal Resonance', nameZh: '水晶共鸣', description: 'Crystals amplify stall enchantments', effectType: 'stall_boost', effectValue: 1, duration: 0, icon: '🔮', probability: 0.05 },
  { id: 'evt14', name: 'Exotic Beast Market', nameZh: '异兽市场', description: 'Rare creatures attract wealthy buyers', effectType: 'trade_bonus', effectValue: 120, duration: 1, icon: '🦅', probability: 0.04 },
  { id: 'evt15', name: 'Eclipse Alignment', nameZh: '日食对齐', description: 'Celestial alignment empowers rare finds', effectType: 'rarity_boost', effectValue: 1, duration: 0, icon: '🌑', probability: 0.03 },
];

// ─── Trade Commodity Category Constants ───────────────────────────────────────

const WB_COMMODITY_CATEGORY_LABELS: Record<string, { en: string; zh: string; icon: string }> = {
  potion: { en: 'Potion', zh: '药剂', icon: '🧪' },
  scroll: { en: 'Scroll', zh: '卷轴', icon: '📜' },
  crystal: { en: 'Crystal', zh: '水晶', icon: '💎' },
  food: { en: 'Delicacy', zh: '美食', icon: '🧁' },
  material: { en: 'Material', zh: '材料', icon: '🪨' },
  relic: { en: 'Relic', zh: '遗物', icon: '🏺' },
  enchanted: { en: 'Enchanted', zh: '附魔', icon: '✨' },
};

// ─── Enchanted Good Definitions (35 artifacts across 5 tiers) ───────────────

interface EnchantedGoodDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  goldValue: number;
  reputationValue: number;
  description: string;
  lore: string;
}

const WB_ENCHANTED_GOODS: EnchantedGoodDef[] = [
  // ── Common (7) ──
  { id: 't01', name: 'Pebble of Light', nameZh: '光之石', rarity: WB_RARITY_COMMON, goldValue: 40, reputationValue: 4, description: 'A stone that glows faintly in darkness', lore: 'Found along the Path Between Worlds' },
  { id: 't02', name: 'Traveler\'s Candle', nameZh: '旅者蜡烛', rarity: WB_RARITY_COMMON, goldValue: 35, reputationValue: 5, description: 'A candle that never extinguishes', lore: 'Burns with the memory of a thousand campfires' },
  { id: 't03', name: 'Rustic Compass', nameZh: '朴素罗盘', rarity: WB_RARITY_COMMON, goldValue: 45, reputationValue: 3, description: 'A compass pointing to the nearest market', lore: 'Its needle sways with the rhythm of commerce' },
  { id: 't04', name: 'Lucky Copper Coin', nameZh: '幸运铜币', rarity: WB_RARITY_COMMON, goldValue: 30, reputationValue: 6, description: 'A coin said to bring fortune', lore: 'Minted by the First Peddler of the Bazaar' },
  { id: 't05', name: 'Bundle of Dream Silk', nameZh: '梦丝束', rarity: WB_RARITY_COMMON, goldValue: 50, reputationValue: 4, description: 'Silk woven from captured dreams', lore: 'Whispered secrets are encoded in its threads' },
  { id: 't06', name: 'Tinderbox of Sparks', nameZh: '火星火绒匣', rarity: WB_RARITY_COMMON, goldValue: 25, reputationValue: 3, description: 'Produces magical flames on command', lore: 'Each spark contains a tiny wish' },
  { id: 't07', name: 'Herb Pouch', nameZh: '草药袋', rarity: WB_RARITY_COMMON, goldValue: 35, reputationValue: 5, description: 'A pouch of mystical herbs', lore: 'Collected from meadows that exist only at twilight' },
  // ── Uncommon (7) ──
  { id: 't08', name: 'Mirror of Glimpses', nameZh: '一瞥之镜', rarity: WB_RARITY_UNCOMMON, goldValue: 120, reputationValue: 12, description: 'Shows fragments of other dimensions', lore: 'Gazing too long reveals truths better left unseen' },
  { id: 't09', name: 'Phial of Starwater', nameZh: '星水瓶', rarity: WB_RARITY_UNCOMMON, goldValue: 140, reputationValue: 14, description: 'Water collected from falling stars', lore: 'Drinking it grants visions of distant shores' },
  { id: 't10', name: 'Carved Waystone', nameZh: '路标石', rarity: WB_RARITY_UNCOMMON, goldValue: 160, reputationValue: 16, description: 'Marks safe paths between realms', lore: 'Placed by ancient wanderers at crossroads' },
  { id: 't11', name: 'Singing Teapot', nameZh: '歌唱茶壶', rarity: WB_RARITY_UNCOMMON, goldValue: 110, reputationValue: 13, description: 'A teapot that hums enchanting melodies', lore: 'Its songs calm even the fiercest storm spirits' },
  { id: 't12', name: 'Bottle of Captured Rain', nameZh: '捕获雨水瓶', rarity: WB_RARITY_UNCOMMON, goldValue: 130, reputationValue: 11, description: 'Rain from a storm that never ended', lore: 'Pouring it summons a brief rain wherever you stand' },
  { id: 't13', name: 'Shadow Puppet Set', nameZh: '皮影戏偶', rarity: WB_RARITY_UNCOMMON, goldValue: 100, reputationValue: 15, description: 'Puppets that perform on their own', lore: 'Each puppet tells a different traveler\'s tale' },
  { id: 't14', name: 'Woven Sand Basket', nameZh: '编织沙篮', rarity: WB_RARITY_UNCOMMON, goldValue: 115, reputationValue: 12, description: 'A basket that can hold anything', lore: 'Its interior exists in a pocket dimension' },
  // ── Rare (7) ──
  { id: 't15', name: 'Lantern of Lost Souls', nameZh: '迷魂灯笼', rarity: WB_RARITY_RARE, goldValue: 450, reputationValue: 40, description: 'Guides lost travelers home', lore: 'Its light is visible across three dimensions' },
  { id: 't16', name: 'Pocket Sundial', nameZh: '袖珍日晷', rarity: WB_RARITY_RARE, goldValue: 400, reputationValue: 45, description: 'Tells time across all realms simultaneously', lore: 'Created by the Timekeeper of the Seventh Bazaar' },
  { id: 't17', name: 'Enchanted Quill', nameZh: '附魔羽毛笔', rarity: WB_RARITY_RARE, goldValue: 500, reputationValue: 50, description: 'Writes contracts that cannot be broken', lore: 'Its ink is distilled from pure intent' },
  { id: 't18', name: 'Crystal Key', nameZh: '水晶钥匙', rarity: WB_RARITY_RARE, goldValue: 480, reputationValue: 42, description: 'Opens doors to hidden bazaar vaults', lore: 'Each turn of the lock reveals a new passage' },
  { id: 't19', name: 'Moonstone Amulet', nameZh: '月石护符', rarity: WB_RARITY_RARE, goldValue: 420, reputationValue: 38, description: 'Protects against dimensional storms', lore: 'Woven with moonlight harvested during an eclipse' },
  { id: 't20', name: 'Traveler\'s Map', nameZh: '旅者地图', rarity: WB_RARITY_RARE, goldValue: 460, reputationValue: 44, description: 'Shows all known bazaar locations', lore: 'The map redraws itself as new markets are discovered' },
  { id: 't21', name: 'Chime of Wandering', nameZh: '游荡风铃', rarity: WB_RARITY_RARE, goldValue: 440, reputationValue: 46, description: 'Its sound opens minor portals', lore: 'Hung at every crossroads between worlds' },
  // ── Epic (7) ──
  { id: 't22', name: 'Staff of the Infinite Market', nameZh: '无限集市法杖', rarity: WB_RARITY_EPIC, goldValue: 1800, reputationValue: 160, description: 'Summons a temporary stall anywhere', lore: 'Carved from the World Tree\'s smallest branch' },
  { id: 't23', name: 'Crown of the Bazaar King', nameZh: '集市之王冠', rarity: WB_RARITY_EPIC, goldValue: 2000, reputationValue: 180, description: 'Grants authority over all merchants', lore: 'Worn by the legendary founder of the first bazaar' },
  { id: 't24', name: 'Dimensional Scales', nameZh: '维度天平', rarity: WB_RARITY_EPIC, goldValue: 2200, reputationValue: 200, description: 'Weighs the true value of any item', lore: 'Its pans balance across space and time' },
  { id: 't25', name: 'Robe of the Unseen Buyer', nameZh: '隐形买家之袍', rarity: WB_RARITY_EPIC, goldValue: 1900, reputationValue: 170, description: 'Renders the wearer invisible to sellers', lore: 'Perfect for inspecting goods without commitment' },
  { id: 't26', name: 'Orb of Convergences', nameZh: '汇聚之球', rarity: WB_RARITY_EPIC, goldValue: 2400, reputationValue: 210, description: 'Reveals where dimensional paths cross', lore: 'A swirling sphere of converging realities' },
  { id: 't27', name: 'Golden Merchant\'s Ledger', nameZh: '黄金商人账本', rarity: WB_RARITY_EPIC, goldValue: 1700, reputationValue: 190, description: 'Records every transaction ever made', lore: 'Its pages are infinite and self-organizing' },
  { id: 't28', name: 'Eternal Haggling Coin', nameZh: '永恒还价币', rarity: WB_RARITY_EPIC, goldValue: 2100, reputationValue: 185, description: 'Ensures the holder always gets a fair deal', lore: 'Minted from the concept of fairness itself' },
  // ── Legendary (7) ──
  { id: 't29', name: 'Key to All Bazaars', nameZh: '万市之钥', rarity: WB_RARITY_LEGENDARY, goldValue: 9000, reputationValue: 800, description: 'Unlocks every bazaar across every dimension', lore: 'A single key that fits every lock in every market' },
  { id: 't30', name: 'The First Stall', nameZh: '第一摊位', rarity: WB_RARITY_LEGENDARY, goldValue: 8000, reputationValue: 750, description: 'A portable stall that exists everywhere at once', lore: 'Where the very first trade between worlds occurred' },
  { id: 't31', name: 'Wanderer\'s Eternal Compass', nameZh: '流浪者永恒罗盘', rarity: WB_RARITY_LEGENDARY, goldValue: 11000, reputationValue: 1000, description: 'Points to whatever the seeker desires most', lore: 'Its needle is forged from a fallen star\'s core' },
  { id: 't32', name: 'Bazaar Heart Crystal', nameZh: '集市之心水晶', rarity: WB_RARITY_LEGENDARY, goldValue: 10000, reputationValue: 900, description: 'The living core of the Wanderer Bazaar', lore: 'Beats in rhythm with every transaction across dimensions' },
  { id: 't33', name: 'Cloak of the Between', nameZh: '间隙之斗篷', rarity: WB_RARITY_LEGENDARY, goldValue: 12000, reputationValue: 1100, description: 'Lets the wearer walk between any two worlds', lore: 'Woven from the fabric of dimensional barriers' },
  { id: 't34', name: 'Merchant\'s Immortal Ledger', nameZh: '商人不朽账本', rarity: WB_RARITY_LEGENDARY, goldValue: 9500, reputationValue: 850, description: 'Records trades across all past and future bazaars', lore: 'Predicts market trends before they happen' },
  { id: 't35', name: 'The Wandering Flame', nameZh: '流浪之焰', rarity: WB_RARITY_LEGENDARY, goldValue: 15000, reputationValue: 1500, description: 'An undying flame that powers the entire bazaar', lore: 'The original light that drew the first wanderers together' },
];

// ─── District Definitions (8) ─────────────────────────────────────────────────

interface DistrictDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  unlockCost: number;
  baseReputation: number;
  icon: string;
  specialCommodities: string[];
  atmosphere: string;
}

const WB_DISTRICTS: DistrictDef[] = [
  { id: 'd01', name: ' Lantern Quarter', nameZh: '灯笼区', description: 'The glowing entrance where lanterns light every path', unlockCost: 0, baseReputation: 30, icon: '🏮', specialCommodities: ['c01', 'c08'], atmosphere: 'warm' },
  { id: 'd02', name: 'Arcane Alley', nameZh: '奥术巷', description: 'Where spellcasters sell enchanted wares', unlockCost: 400, baseReputation: 50, icon: '🔮', specialCommodities: ['c03', 'c20'], atmosphere: 'mystic' },
  { id: 'd03', name: 'Silk Emporium', nameZh: '丝绸大卖场', description: 'Fine fabrics and dimensional textiles', unlockCost: 600, baseReputation: 70, icon: '🧵', specialCommodities: ['c05', 'c15'], atmosphere: 'luxurious' },
  { id: 'd04', name: 'Curio Corner', nameZh: '古怪角', description: 'Rare curiosities from forgotten realms', unlockCost: 900, baseReputation: 90, icon: '🏺', specialCommodities: ['c07', 'c22'], atmosphere: 'mysterious' },
  { id: 'd05', name: 'Potion Plaza', nameZh: '药水广场', description: 'Alchemical brews and elixirs of power', unlockCost: 800, baseReputation: 80, icon: '🧪', specialCommodities: ['c02', 'c12'], atmosphere: 'bubbling' },
  { id: 'd06', name: 'Crystal Grotto', nameZh: '水晶洞穴', description: 'Gems and crystals resonating with raw magic', unlockCost: 1200, baseReputation: 110, icon: '💎', specialCommodities: ['c04', 'c18'], atmosphere: 'shimmering' },
  { id: 'd07', name: 'Shadow Market', nameZh: '暗影市场', description: 'Deals made in twilight, information traded like gold', unlockCost: 1500, baseReputation: 130, icon: '🌑', specialCommodities: ['c10', 'c25'], atmosphere: 'shadowy' },
  { id: 'd08', name: 'Astral Nexus', nameZh: '星界枢纽', description: 'The convergence point of all dimensional paths', unlockCost: 2500, baseReputation: 200, icon: '🌀', specialCommodities: ['c14', 'c28'], atmosphere: 'ethereal' },
];

// ─── Trade Commodities (30) ──────────────────────────────────────────────────

interface CommodityDef {
  id: string;
  name: string;
  nameZh: string;
  basePrice: number;
  volatility: number;
  category: string;
  icon: string;
}

const WB_COMMODITIES: CommodityDef[] = [
  { id: 'c01', name: 'Lantern Oil', nameZh: '灯笼油', basePrice: 15, volatility: 0.15, category: 'material', icon: '🏮' },
  { id: 'c02', name: 'Healing Potion', nameZh: '治愈药剂', basePrice: 30, volatility: 0.2, category: 'potion', icon: '🧪' },
  { id: 'c03', name: 'Mana Crystal', nameZh: '魔力水晶', basePrice: 80, volatility: 0.1, category: 'crystal', icon: '💎' },
  { id: 'c04', name: 'Star Sapphire', nameZh: '星辰蓝宝石', basePrice: 150, volatility: 0.08, category: 'crystal', icon: '💠' },
  { id: 'c05', name: 'Dream Silk', nameZh: '梦丝', basePrice: 45, volatility: 0.18, category: 'material', icon: '🧵' },
  { id: 'c06', name: 'Phoenix Feather', nameZh: '凤凰羽毛', basePrice: 200, volatility: 0.06, category: 'enchanted', icon: '🪶' },
  { id: 'c07', name: 'Ancient Coin', nameZh: '古币', basePrice: 60, volatility: 0.12, category: 'relic', icon: '🪙' },
  { id: 'c08', name: 'Moon Tea', nameZh: '月光茶', basePrice: 20, volatility: 0.22, category: 'food', icon: '🍵' },
  { id: 'c09', name: 'Enchanted Parchment', nameZh: '附魔羊皮纸', basePrice: 35, volatility: 0.16, category: 'scroll', icon: '📜' },
  { id: 'c10', name: 'Shadow Essence', nameZh: '暗影精华', basePrice: 90, volatility: 0.14, category: 'potion', icon: '🌑' },
  { id: 'c11', name: 'Ethereal Wood', nameZh: '以太木材', basePrice: 25, volatility: 0.2, category: 'material', icon: '🪵' },
  { id: 'c12', name: 'Elixir of Sight', nameZh: '千里眼药剂', basePrice: 70, volatility: 0.15, category: 'potion', icon: '👁️' },
  { id: 'c13', name: 'Dimensional Dust', nameZh: '维度之尘', basePrice: 120, volatility: 0.1, category: 'enchanted', icon: '✨' },
  { id: 'c14', name: 'Astral Fragment', nameZh: '星界碎片', basePrice: 180, volatility: 0.07, category: 'crystal', icon: '🌀' },
  { id: 'c15', name: 'Void Velvet', nameZh: '虚空天鹅绒', basePrice: 55, volatility: 0.18, category: 'material', icon: '🎭' },
  { id: 'c16', name: 'Bazaar Spice', nameZh: '集市香料', basePrice: 18, volatility: 0.25, category: 'food', icon: '🌶️' },
  { id: 'c17', name: 'Dragon Scale', nameZh: '龙鳞', basePrice: 160, volatility: 0.06, category: 'enchanted', icon: '🐉' },
  { id: 'c18', name: 'Amethyst Cluster', nameZh: '紫水晶簇', basePrice: 75, volatility: 0.12, category: 'crystal', icon: '🔮' },
  { id: 'c19', name: 'Rune Stone', nameZh: '符文石', basePrice: 40, volatility: 0.14, category: 'relic', icon: '🪨' },
  { id: 'c20', name: 'Spell Scroll', nameZh: '法术卷轴', basePrice: 100, volatility: 0.16, category: 'scroll', icon: '📜' },
  { id: 'c21', name: 'Fairy Honey', nameZh: '妖精蜂蜜', basePrice: 50, volatility: 0.2, category: 'food', icon: '🍯' },
  { id: 'c22', name: 'Cursed Relic', nameZh: '诅咒遗物', basePrice: 85, volatility: 0.22, category: 'relic', icon: '💀' },
  { id: 'c23', name: 'Phantom Thread', nameZh: '幻影线', basePrice: 65, volatility: 0.17, category: 'material', icon: '🧶' },
  { id: 'c24', name: 'Spirit Candle', nameZh: '灵魂蜡烛', basePrice: 28, volatility: 0.15, category: 'enchanted', icon: '🕯️' },
  { id: 'c25', name: 'Whisper Potion', nameZh: '低语药剂', basePrice: 110, volatility: 0.09, category: 'potion', icon: '🤫' },
  { id: 'c26', name: 'Moonstone Shard', nameZh: '月光石碎片', basePrice: 95, volatility: 0.11, category: 'crystal', icon: '🌙' },
  { id: 'c27', name: 'Traveler\'s Bread', nameZh: '旅者面包', basePrice: 10, volatility: 0.3, category: 'food', icon: '🍞' },
  { id: 'c28', name: 'Nexus Crystal', nameZh: '枢纽水晶', basePrice: 250, volatility: 0.05, category: 'crystal', icon: '💠' },
  { id: 'c29', name: 'Charm of Protection', nameZh: '守护护符', basePrice: 70, volatility: 0.13, category: 'enchanted', icon: '🛡️' },
  { id: 'c30', name: 'Map of Nowhere', nameZh: '无处之图', basePrice: 130, volatility: 0.08, category: 'scroll', icon: '🗺️' },
];

// ─── Stall Definitions (25, upgradeable to Lv10) ─────────────────────────────

interface StallDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  reputationPerLevel: number;
  icon: string;
  category: string;
}

const WB_STALLS: StallDef[] = [
  { id: 's01', name: 'Lantern Stall', nameZh: '灯笼摊', description: 'Illuminates the bazaar entrance', baseCost: 150, costMultiplier: 1.6, maxLevel: 10, reputationPerLevel: 10, icon: '🏮', category: 'display' },
  { id: 's02', name: 'Potion Brewer', nameZh: '药剂铺', description: 'Brews and sells magical potions', baseCost: 120, costMultiplier: 1.5, maxLevel: 10, reputationPerLevel: 8, icon: '🧪', category: 'production' },
  { id: 's03', name: 'Crystal Emporium', nameZh: '水晶店', description: 'Showcases precious gems', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, reputationPerLevel: 12, icon: '💎', category: 'display' },
  { id: 's04', name: 'Silk Weaver', nameZh: '织丝绸坊', description: 'Weaves dimensional textiles', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, reputationPerLevel: 7, icon: '🧵', category: 'production' },
  { id: 's05', name: 'Curio Cabinet', nameZh: '古董柜', description: 'Displays rare curiosities', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, reputationPerLevel: 11, icon: '🏺', category: 'display' },
  { id: 's06', name: 'Scroll Shop', nameZh: '卷轴店', description: 'Sells enchanted scrolls', baseCost: 130, costMultiplier: 1.5, maxLevel: 10, reputationPerLevel: 8, icon: '📜', category: 'production' },
  { id: 's07', name: 'Food Pavilion', nameZh: '美食亭', description: 'Exotic delicacies from many worlds', baseCost: 90, costMultiplier: 1.4, maxLevel: 10, reputationPerLevel: 6, icon: '🧁', category: 'service' },
  { id: 's08', name: 'Fortune Teller', nameZh: '占卜帐篷', description: 'Reads fate for gold', baseCost: 160, costMultiplier: 1.6, maxLevel: 10, reputationPerLevel: 9, icon: '🔮', category: 'service' },
  { id: 's09', name: 'Material Depot', nameZh: '材料仓库', description: 'Stores and sells raw materials', baseCost: 110, costMultiplier: 1.4, maxLevel: 10, reputationPerLevel: 6, icon: '🪨', category: 'production' },
  { id: 's10', name: 'Enchantment Forge', nameZh: '附魔炉', description: 'Enchants goods with magical properties', baseCost: 220, costMultiplier: 1.7, maxLevel: 10, reputationPerLevel: 13, icon: '🔥', category: 'production' },
  { id: 's11', name: 'Shadow Broker', nameZh: '暗影经纪人', description: 'Deals in secrets and rare information', baseCost: 250, costMultiplier: 1.8, maxLevel: 10, reputationPerLevel: 10, icon: '🌑', category: 'service' },
  { id: 's12', name: 'Artifact Display', nameZh: '神品陈列', description: 'Museum-quality artifact showcase', baseCost: 300, costMultiplier: 1.8, maxLevel: 10, reputationPerLevel: 15, icon: '🏛️', category: 'display' },
  { id: 's13', name: 'Wandering Cart', nameZh: '流动推车', description: 'A mobile stall for opportunistic trading', baseCost: 80, costMultiplier: 1.3, maxLevel: 10, reputationPerLevel: 5, icon: '🛒', category: 'display' },
  { id: 's14', name: 'Alchemy Station', nameZh: '炼金台', description: 'Transmutes base materials into gold', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, reputationPerLevel: 9, icon: '⚗️', category: 'production' },
  { id: 's15', name: 'Music Corner', nameZh: '音乐角落', description: 'Bards attract customers with song', baseCost: 100, costMultiplier: 1.4, maxLevel: 10, reputationPerLevel: 7, icon: '🎵', category: 'service' },
  { id: 's16', name: 'Beast Pen', nameZh: '异兽栏', description: 'Houses exotic creatures for trade', baseCost: 280, costMultiplier: 1.8, maxLevel: 10, reputationPerLevel: 8, icon: '🦅', category: 'display' },
  { id: 's17', name: 'Repair Bench', nameZh: '修复台', description: 'Restores damaged enchanted goods', baseCost: 140, costMultiplier: 1.5, maxLevel: 10, reputationPerLevel: 7, icon: '🔧', category: 'service' },
  { id: 's18', name: 'Information Kiosk', nameZh: '情报亭', description: 'Gathers market intelligence', baseCost: 170, costMultiplier: 1.6, maxLevel: 10, reputationPerLevel: 10, icon: '📢', category: 'service' },
  { id: 's19', name: 'Portal Gate', nameZh: '传送门', description: 'Connects to other bazaar branches', baseCost: 350, costMultiplier: 1.9, maxLevel: 10, reputationPerLevel: 14, icon: '🌀', category: 'display' },
  { id: 's20', name: 'Haggle Arena', nameZh: '还价竞技场', description: 'Hosts haggling competitions', baseCost: 240, costMultiplier: 1.7, maxLevel: 10, reputationPerLevel: 11, icon: '🤝', category: 'service' },
  { id: 's21', name: 'Tea House', nameZh: '茶馆', description: 'Where merchants negotiate over tea', baseCost: 130, costMultiplier: 1.5, maxLevel: 10, reputationPerLevel: 8, icon: '🍵', category: 'service' },
  { id: 's22', name: 'Rune Workshop', nameZh: '符文工坊', description: 'Inscribes powerful runes on goods', baseCost: 190, costMultiplier: 1.6, maxLevel: 10, reputationPerLevel: 9, icon: '🪨', category: 'production' },
  { id: 's23', name: 'Trading Post', nameZh: '驿站', description: 'Manages commodity shipments', baseCost: 160, costMultiplier: 1.5, maxLevel: 10, reputationPerLevel: 10, icon: '📮', category: 'production' },
  { id: 's24', name: 'Storage Vault', nameZh: '保险库', description: 'Safeguards valuable goods', baseCost: 200, costMultiplier: 1.6, maxLevel: 10, reputationPerLevel: 6, icon: '🔒', category: 'display' },
  { id: 's25', name: 'The Grand Pavilion', nameZh: '大殿', description: 'The crown jewel of the bazaar', baseCost: 500, costMultiplier: 2.0, maxLevel: 10, reputationPerLevel: 20, icon: '👑', category: 'display' },
];

// ─── Merchant Abilities (22) ─────────────────────────────────────────────────

interface AbilityDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  cooldown: number;
  cost: number;
  effectType: string;
  effectValue: number;
  icon: string;
  category: string;
}

const WB_ABILITIES: AbilityDef[] = [
  { id: 'a01', name: 'Silver Tongue', nameZh: '银舌', description: 'Gain a bonus on next haggling attempt', cooldown: 3, cost: 40, effectType: 'haggle_boost', effectValue: 1.5, icon: '🗣️', category: 'haggling' },
  { id: 'a02', name: 'Dimensional Shortcut', nameZh: '维度捷径', description: 'Reduce trade route cost by 30%', cooldown: 4, cost: 60, effectType: 'trade_discount', effectValue: 0.3, icon: '🌀', category: 'trade' },
  { id: 'a03', name: 'Bazaar Blessing', nameZh: '集市祝福', description: 'All stalls gain +10 reputation', cooldown: 7, cost: 180, effectType: 'stall_reputation', effectValue: 10, icon: '✨', category: 'stall' },
  { id: 'a04', name: 'Coin Rain', nameZh: '金币雨', description: 'Instantly gain 250 gold', cooldown: 3, cost: 50, effectType: 'instant_gold', effectValue: 250, icon: '🪙', category: 'economy' },
  { id: 'a05', name: 'Charisma Surge', nameZh: '魅力激增', description: 'Gain 40 reputation instantly', cooldown: 4, cost: 70, effectType: 'instant_reputation', effectValue: 40, icon: '⭐', category: 'reputation' },
  { id: 'a06', name: 'Scout Dimension', nameZh: '探索维度', description: 'Discover a random district for less cost', cooldown: 5, cost: 100, effectType: 'free_scout', effectValue: 1, icon: '🔭', category: 'exploration' },
  { id: 'a07', name: 'Flash Sale', nameZh: '闪电促销', description: 'Sell all commodities at 20% premium', cooldown: 6, cost: 120, effectType: 'sell_bonus', effectValue: 0.2, icon: '🏷️', category: 'trade' },
  { id: 'a08', name: 'Pocket Portal', nameZh: '口袋传送门', description: 'Establish a free trade route', cooldown: 6, cost: 100, effectType: 'free_trade', effectValue: 1, icon: '🌀', category: 'trade' },
  { id: 'a09', name: 'Rapid Renovation', nameZh: '快速翻新', description: 'Upgrade a random stall by 1 level', cooldown: 8, cost: 200, effectType: 'free_upgrade', effectValue: 1, icon: '🔨', category: 'stall' },
  { id: 'a10', name: 'Market Insight', nameZh: '市场洞察', description: 'Reveal all commodity prices for 2 turns', cooldown: 4, cost: 80, effectType: 'price_insight', effectValue: 2, icon: '👁️', category: 'trade' },
  { id: 'a11', name: 'Double Deal', nameZh: '双重交易', description: 'Gain 100 gold and 25 reputation', cooldown: 5, cost: 90, effectType: 'dual_reward', effectValue: 100, icon: '🤝', category: 'economy' },
  { id: 'a12', name: 'Haggle Master', nameZh: '还价大师', description: 'Win the next 3 haggling attempts', cooldown: 7, cost: 150, effectType: 'haggle_streak', effectValue: 3, icon: '💰', category: 'haggling' },
  { id: 'a13', name: 'Crystal Resonance', nameZh: '水晶共鸣', description: 'Triple crystal commodity profits for 1 turn', cooldown: 6, cost: 140, effectType: 'crystal_bonus', effectValue: 3, icon: '💎', category: 'trade' },
  { id: 'a14', name: 'Fate\'s Whisper', nameZh: '命运低语', description: 'Reveal the rarity of next enchanted good', cooldown: 3, cost: 60, effectType: 'rarity_reveal', effectValue: 1, icon: '🔮', category: 'exploration' },
  { id: 'a15', name: 'Intimidating Presence', nameZh: '威慑气场', description: 'Force a merchant to lower prices', cooldown: 5, cost: 130, effectType: 'price_lower', effectValue: 0.4, icon: '😤', category: 'haggling' },
  { id: 'a16', name: 'Lantern Festival', nameZh: '灯笼节', description: 'All districts gain reputation, +25 each', cooldown: 7, cost: 180, effectType: 'district_reputation', effectValue: 25, icon: '🏮', category: 'district' },
  { id: 'a17', name: 'Bargain Hunter', nameZh: '特价猎手', description: 'All stall upgrades cost 40% less for 2 turns', cooldown: 6, cost: 120, effectType: 'build_discount', effectValue: 0.4, icon: '🏷️', category: 'stall' },
  { id: 'a18', name: 'Rift Scavenger', nameZh: '裂缝拾荒者', description: 'Find a random rare or better enchanted good', cooldown: 8, cost: 250, effectType: 'rare_good', effectValue: 1, icon: '🌀', category: 'exploration' },
  { id: 'a19', name: 'Word of Mouth', nameZh: '口碑传播', description: 'Boost reputation with all known factions', cooldown: 5, cost: 100, effectType: 'faction_boost', effectValue: 15, icon: '📢', category: 'reputation' },
  { id: 'a20', name: 'Liquidate Stock', nameZh: '清仓处理', description: 'Sell surplus commodities for 150 gold', cooldown: 3, cost: 30, effectType: 'sell_goods', effectValue: 150, icon: '📦', category: 'economy' },
  { id: 'a21', name: 'Moonlit Resurgence', nameZh: '月光复苏', description: 'Reset all ability cooldowns', cooldown: 10, cost: 400, effectType: 'reset_cooldowns', effectValue: 0, icon: '🌙', category: 'special' },
  { id: 'a22', name: 'Bazaar Nexus', nameZh: '集市枢纽', description: 'Double all income for 2 turns', cooldown: 9, cost: 350, effectType: 'double_income', effectValue: 2, icon: '✨', category: 'special' },
];

// ─── Achievement Definitions (18) ────────────────────────────────────────────

interface AchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  condition: string;
  reward: { gold: number; reputation: number };
  icon: string;
}

const WB_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach01', name: 'First Find', nameZh: '初获', description: 'Acquire your first enchanted good', condition: 'goods_acquired >= 1', reward: { gold: 40, reputation: 8 }, icon: '👣' },
  { id: 'ach02', name: 'Curio Collector', nameZh: '古怪收藏家', description: 'Acquire 10 enchanted goods', condition: 'goods_acquired >= 10', reward: { gold: 180, reputation: 35 }, icon: '📦' },
  { id: 'ach03', name: 'Artifact Hoarder', nameZh: '神器囤积者', description: 'Acquire all 35 enchanted goods', condition: 'goods_acquired >= 35', reward: { gold: 5000, reputation: 800 }, icon: '👑' },
  { id: 'ach04', name: 'District Explorer', nameZh: '街区探索者', description: 'Unlock 3 bazaar districts', condition: 'districts_owned >= 3', reward: { gold: 250, reputation: 50 }, icon: '🗺️' },
  { id: 'ach05', name: 'Bazaar Conqueror', nameZh: '集市征服者', description: 'Unlock all 8 districts', condition: 'districts_owned >= 8', reward: { gold: 3000, reputation: 500 }, icon: '🌍' },
  { id: 'ach06', name: 'Stall Master', nameZh: '摊位大师', description: 'Upgrade any stall to level 10', condition: 'max_stall_level >= 10', reward: { gold: 450, reputation: 90 }, icon: '🏗️' },
  { id: 'ach07', name: 'Market Magnate', nameZh: '市场巨头', description: 'Build all 25 stalls', condition: 'stalls_built >= 25', reward: { gold: 2000, reputation: 350 }, icon: '🏪' },
  { id: 'ach08', name: 'Trade Network', nameZh: '贸易网络', description: 'Establish 10 trade routes', condition: 'trade_routes >= 10', reward: { gold: 700, reputation: 130 }, icon: '🔗' },
  { id: 'ach09', name: 'Gold Hoarder', nameZh: '囤金者', description: 'Accumulate 10,000 total gold', condition: 'total_gold >= 10000', reward: { gold: 900, reputation: 180 }, icon: '💰' },
  { id: 'ach10', name: 'Haggle Champion', nameZh: '还价冠军', description: 'Win 20 haggling attempts', condition: 'haggles_won >= 20', reward: { gold: 1200, reputation: 250 }, icon: '🤝' },
  { id: 'ach11', name: 'Reputable', nameZh: '声名卓著', description: 'Reach 500 reputation', condition: 'reputation >= 500', reward: { gold: 600, reputation: 100 }, icon: '⭐' },
  { id: 'ach12', name: 'Legendary Finder', nameZh: '传奇发现者', description: 'Own 5 legendary enchanted goods', condition: 'legendary_goods >= 5', reward: { gold: 3000, reputation: 500 }, icon: '🌟' },
  { id: 'ach13', name: 'Diplomat of Realms', nameZh: '界域外交官', description: 'Reach friendly with 5 factions', condition: 'factions_friendly >= 5', reward: { gold: 650, reputation: 180 }, icon: '🤝' },
  { id: 'ach14', name: 'Daily Devotee', nameZh: '每日信徒', description: 'Complete 7 daily quests', condition: 'daily_quests_completed >= 7', reward: { gold: 500, reputation: 80 }, icon: '📅' },
  { id: 'ach15', name: 'Ability Adept', nameZh: '能力达人', description: 'Activate abilities 30 times', condition: 'abilities_used >= 30', reward: { gold: 1000, reputation: 200 }, icon: '🔮' },
  { id: 'ach16', name: 'Bazaar Legend', nameZh: '集市传说', description: 'Reach 3000 total reputation', condition: 'reputation >= 3000', reward: { gold: 4000, reputation: 700 }, icon: '✨' },
  { id: 'ach17', name: 'Dimensoinal Walker', nameZh: '维度行者', description: 'Visit every district in one cycle', condition: 'districts_visited >= 8', reward: { gold: 800, reputation: 150 }, icon: '🌀' },
  { id: 'ach18', name: 'Sovereign Ascendant', nameZh: '至尊觉醒', description: 'Achieve the title of Bazaar Sovereign', condition: 'title_index >= 7', reward: { gold: 10000, reputation: 1500 }, icon: '🏅' },
];

// ─── State Interface Types ────────────────────────────────────────────────────

interface AcquiredGood {
  id: string;
  acquiredAt: number;
}

interface UnlockedDistrict {
  id: string;
  unlocked: boolean;
  reputation: number;
  visited: boolean;
}

interface StallState {
  id: string;
  level: number;
}

interface AbilityState {
  id: string;
  currentCooldown: number;
  timesUsed: number;
}

interface AchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface TradeRoute {
  id: string;
  fromDistrict: string;
  toDistrict: string;
  commodityId: string;
  profit: number;
  active: boolean;
  establishedAt: number;
}

interface FactionRelation {
  factionId: string;
  factionName: string;
  standing: number;
  maxStanding: number;
}

interface DailyQuest {
  id: string;
  description: string;
  targetCommodityId: string;
  targetAmount: number;
  currentAmount: number;
  reward: { gold: number; reputation: number };
  expiresAt: number;
  completed: boolean;
}

interface EventLogEntry {
  id: string;
  turnNumber: number;
  type: 'good' | 'district' | 'stall' | 'ability' | 'trade' | 'haggle' | 'faction' | 'event' | 'achievement' | 'moon' | 'daily';
  message: string;
  messageZh: string;
  goldChange: number;
  reputationChange: number;
  timestamp: number;
}

interface ActiveEvent {
  eventId: string;
  remainingTurns: number;
}

interface CommodityPriceSnapshot {
  commodityId: string;
  currentPrice: number;
  priceChange: number;
}

interface WandererBazaarState {
  goods: AcquiredGood[];
  districts: UnlockedDistrict[];
  stalls: StallState[];
  abilities: AbilityState[];
  achievements: AchievementState[];
  currentDistrict: string;
  bazaarGold: number;
  reputation: number;
  totalGoldEarned: number;
  tradeRoutes: TradeRoute[];
  titleIndex: number;
  bazaarReputation: number;
  factionRelations: FactionRelation[];
  dailyQuest: DailyQuest | null;
  hagglesWon: number;
  abilitiesUsed: number;
  dailyQuestsCompleted: number;
  turnCount: number;
  currentMoonPhase: string;
  eventLog: EventLogEntry[];
  activeEvents: ActiveEvent[];
  commodityPrices: CommodityPriceSnapshot[];
}

// ─── Output Interface Types ───────────────────────────────────────────────────

interface WandererBazaarStats {
  totalGoods: number;
  goodsByRarity: Record<string, number>;
  districtsOwned: number;
  totalStallLevels: number;
  maxStallLevel: number;
  activeTradeRoutes: number;
  totalTradeProfit: number;
  hagglesWon: number;
  currentTitle: string;
  currentTitleZh: string;
  bazaarReputation: number;
  bazaarGold: number;
  reputation: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  turnCount: number;
  currentMoonPhase: string;
  eventsHandled: number;
}

interface WandererBazaarProgress {
  nextTitle: { name: string; nameZh: string; progress: number; required: number };
  goodCompletion: number;
  districtCompletion: number;
  stallCompletion: number;
  achievementCompletion: number;
  overallCompletion: number;
}

interface HaggleReadiness {
  level: string;
  label: string;
  labelZh: string;
  color: string;
  winRate: number;
}

interface GoldReserves {
  level: string;
  label: string;
  labelZh: string;
  color: string;
  surplus: number;
}

// ─── Faction Definitions ─────────────────────────────────────────────────────

const WB_FACTIONS = [
  { id: 'f01', name: 'Djinn Traders', nameZh: '精灵商人', maxStanding: 100 },
  { id: 'f02', name: 'Fey Merchants', nameZh: '妖精商人', maxStanding: 100 },
  { id: 'f03', name: 'Shadow Brokerage', nameZh: '暗影经纪', maxStanding: 100 },
  { id: 'f04', name: 'Crystal Guild', nameZh: '水晶公会', maxStanding: 100 },
  { id: 'f05', name: 'Wanderer\'s Circle', nameZh: '流浪者之环', maxStanding: 100 },
  { id: 'f06', name: 'Astral Bankers', nameZh: '星界银行家', maxStanding: 100 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions (outside the hook)
// ═══════════════════════════════════════════════════════════════════════════════

function createInitialState(): WandererBazaarState {
  return {
    goods: [],
    districts: WB_DISTRICTS.map(d => ({
      id: d.id,
      unlocked: d.id === 'd01',
      reputation: d.id === 'd01' ? d.baseReputation : 0,
      visited: d.id === 'd01',
    })),
    stalls: WB_STALLS.map(s => ({
      id: s.id,
      level: 0,
    })),
    abilities: WB_ABILITIES.map(a => ({
      id: a.id,
      currentCooldown: 0,
      timesUsed: 0,
    })),
    achievements: WB_ACHIEVEMENTS.map(a => ({
      id: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    currentDistrict: 'd01',
    bazaarGold: 400,
    reputation: 30,
    totalGoldEarned: 400,
    tradeRoutes: [],
    titleIndex: 0,
    bazaarReputation: 30,
    factionRelations: WB_FACTIONS.map(f => ({
      factionId: f.id,
      factionName: f.name,
      standing: 25,
      maxStanding: f.maxStanding,
    })),
    dailyQuest: null,
    hagglesWon: 0,
    abilitiesUsed: 0,
    dailyQuestsCompleted: 0,
    turnCount: 0,
    currentMoonPhase: WB_PHASE_NEW_MOON,
    eventLog: [],
    activeEvents: [],
    commodityPrices: WB_COMMODITIES.map(c => ({
      commodityId: c.id,
      currentPrice: c.basePrice,
      priceChange: 0,
    })),
  };
}

function rollGoodRarity(): string {
  const roll = Math.random() * 100;
  if (roll < 35) return WB_RARITY_COMMON;
  if (roll < 60) return WB_RARITY_UNCOMMON;
  if (roll < 80) return WB_RARITY_RARE;
  if (roll < 94) return WB_RARITY_EPIC;
  return WB_RARITY_LEGENDARY;
}

function generateDailyQuest(): DailyQuest {
  const commodity = WB_COMMODITIES[Math.floor(Math.random() * WB_COMMODITIES.length)];
  const amount = Math.floor(Math.random() * 5) + 3;
  const goldReward = amount * commodity.basePrice * 2 + Math.floor(Math.random() * 80) + 40;
  const reputationReward = amount * 3 + Math.floor(Math.random() * 10) + 5;
  const now = Date.now();
  return {
    id: `quest_${now}`,
    description: `Trade ${amount} units of ${commodity.nameZh} (${commodity.name})`,
    targetCommodityId: commodity.id,
    targetAmount: amount,
    currentAmount: 0,
    reward: { gold: goldReward, reputation: reputationReward },
    expiresAt: now + 24 * 60 * 60 * 1000,
    completed: false,
  };
}

function calculateStallUpgradeCost(stallDef: StallDef, currentLevel: number): number {
  return Math.floor(stallDef.baseCost * Math.pow(stallDef.costMultiplier, currentLevel));
}

function calculateTradeProfit(commodity: CommodityDef, distance: number): number {
  const base = commodity.basePrice * (1 + commodity.volatility * (Math.random() - 0.5));
  return Math.floor(base * distance * 0.5 + commodity.basePrice);
}

function calculateBazaarReputation(
  districts: UnlockedDistrict[],
  stalls: StallState[],
  goods: AcquiredGood[],
): number {
  let reputation = 0;
  for (const district of districts) {
    if (district.unlocked) {
      reputation += district.reputation;
    }
  }
  for (const stall of stalls) {
    const def = WB_STALLS.find(s => s.id === stall.id);
    if (def && stall.level > 0) {
      reputation += def.reputationPerLevel * stall.level;
    }
  }
  for (const good of goods) {
    const def = WB_ENCHANTED_GOODS.find(t => t.id === good.id);
    if (def) {
      const multiplier = WB_RARITY_MULTIPLIER[def.rarity] || 1;
      reputation += Math.floor(multiplier * 2);
    }
  }
  return reputation;
}

function determineTitleIndex(reputation: number): number {
  for (let i = WB_TITLES.length - 1; i >= 0; i--) {
    if (reputation >= WB_TITLES[i].minReputation) return i;
  }
  return 0;
}

function evaluateAchievements(state: WandererBazaarState): AchievementState[] {
  const metrics: Record<string, number> = {
    goods_acquired: state.goods.length,
    districts_owned: state.districts.filter(d => d.unlocked).length,
    max_stall_level: Math.max(0, ...state.stalls.map(s => s.level)),
    stalls_built: state.stalls.filter(s => s.level > 0).length,
    trade_routes: state.tradeRoutes.filter(r => r.active).length,
    total_gold: state.totalGoldEarned,
    haggles_won: state.hagglesWon,
    reputation: state.bazaarReputation,
    legendary_goods: state.goods.filter(gid => {
      const def = WB_ENCHANTED_GOODS.find(t => t.id === gid.id);
      return def && def.rarity === WB_RARITY_LEGENDARY;
    }).length,
    factions_friendly: state.factionRelations.filter(r => r.standing >= 60).length,
    daily_quests_completed: state.dailyQuestsCompleted,
    abilities_used: state.abilitiesUsed,
    title_index: state.titleIndex,
    districts_visited: state.districts.filter(d => d.visited).length,
  };

  return state.achievements.map(ach => {
    if (ach.unlocked) return ach;
    const def = WB_ACHIEVEMENTS.find(a => a.id === ach.id);
    if (!def) return ach;
    const match = def.condition.match(/(\w+)\s*>=\s*(\d+)/);
    if (!match) return ach;
    const key = match[1];
    const threshold = parseInt(match[2], 10);
    const value = metrics[key] ?? 0;
    if (value >= threshold) {
      return { ...ach, unlocked: true, unlockedAt: Date.now() };
    }
    return ach;
  });
}

function tickCooldowns(abilities: AbilityState[]): AbilityState[] {
  return abilities.map(a => ({
    ...a,
    currentCooldown: Math.max(0, a.currentCooldown - 1),
  }));
}

function makeTradeRouteId(): string {
  return `tr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function makeEventLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}

function advanceMoonPhase(currentPhase: string): string {
  const order = [WB_PHASE_NEW_MOON, WB_PHASE_WAXING, WB_PHASE_FULL_MOON, WB_PHASE_WANING];
  const idx = order.indexOf(currentPhase);
  return order[(idx + 1) % order.length];
}

function fluctuateCommodityPrices(prices: CommodityPriceSnapshot[]): CommodityPriceSnapshot[] {
  return prices.map(cp => {
    const commodity = WB_COMMODITIES.find(c => c.id === cp.commodityId);
    if (!commodity) return cp;
    const change = commodity.basePrice * commodity.volatility * (Math.random() - 0.5) * 2;
    const newPrice = Math.floor(cp.currentPrice + change);
    const minPrice = Math.floor(commodity.basePrice * 0.3);
    const maxPrice = Math.floor(commodity.basePrice * 2.5);
    const clampedPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
    return { commodityId: cp.commodityId, currentPrice: clampedPrice, priceChange: clampedPrice - cp.currentPrice };
  });
}

function rollBazaarEvent(): BazaarEventDef | null {
  const roll = Math.random();
  let cumulative = 0;
  for (const evt of WB_BAZAAR_EVENTS) {
    cumulative += evt.probability;
    if (roll < cumulative) return evt;
  }
  return null;
}

function attemptHaggle(): boolean {
  return Math.random() < 0.6;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export default function useWandererBazaar() {
  const [state, setState] = useState<WandererBazaarState>(createInitialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Generate daily quest if none exists or expired
  useEffect(() => {
    const now = Date.now();
    if (!state.dailyQuest || (state.dailyQuest.expiresAt < now && !state.dailyQuest.completed)) {
      setState(prev => ({ ...prev, dailyQuest: generateDailyQuest() }));
    }
  }, [state.dailyQuest, state.turnCount]);

  // ─── Internal: log event helper (available for external use) ───────────────
  const logEvent = useCallback((
    type: EventLogEntry['type'],
    message: string,
    messageZh: string,
    goldChange: number,
    reputationChange: number,
  ) => {
    setState(prev => ({
      ...prev,
      eventLog: [
        ...prev.eventLog.slice(-199),
        {
          id: makeEventLogId(),
          turnNumber: prev.turnCount,
          type,
          message,
          messageZh,
          goldChange,
          reputationChange,
          timestamp: Date.now(),
        },
      ],
    }));
  }, []);

  // ─── Internal: recalculate reputation and title ────────────────────────
  const recalcReputation = useCallback((
    districts: UnlockedDistrict[],
    stalls: StallState[],
    goods: AcquiredGood[],
  ): { reputation: number; titleIndex: number } => {
    const reputation = calculateBazaarReputation(districts, stalls, goods);
    const titleIndex = determineTitleIndex(reputation);
    return { reputation, titleIndex };
  }, []);

  // ─── Acquire Enchanted Good ─────────────────────────────────────────────
  const acquireGood = useCallback(() => {
    setState(prev => {
      const alreadyAcquired = new Set(prev.goods.map(g => g.id));
      const rarity = rollGoodRarity();
      const candidates = WB_ENCHANTED_GOODS.filter(t => t.rarity === rarity && !alreadyAcquired.has(t.id));

      let chosen: EnchantedGoodDef;
      if (candidates.length > 0) {
        chosen = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        const anyUncollected = WB_ENCHANTED_GOODS.filter(t => !alreadyAcquired.has(t.id));
        if (anyUncollected.length === 0) return prev;
        chosen = anyUncollected[Math.floor(Math.random() * anyUncollected.length)];
      }

      return {
        ...prev,
        bazaarGold: prev.bazaarGold + chosen.goldValue,
        reputation: prev.reputation + chosen.reputationValue,
        totalGoldEarned: prev.totalGoldEarned + chosen.goldValue,
        goods: [...prev.goods, { id: chosen.id, acquiredAt: Date.now() }],
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'good' as const,
            message: `Acquired ${chosen.name} (${chosen.rarity})`,
            messageZh: `获得${chosen.nameZh}（${WB_RARITY_LABELS[chosen.rarity]?.zh ?? ''}）`,
            goldChange: chosen.goldValue,
            reputationChange: chosen.reputationValue,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Unlock District ────────────────────────────────────────────────────
  const unlockDistrict = useCallback((districtId: string) => {
    setState(prev => {
      const districtState = prev.districts.find(d => d.id === districtId);
      const districtDef = WB_DISTRICTS.find(d => d.id === districtId);
      if (!districtState || !districtDef || districtState.unlocked) return prev;
      if (prev.bazaarGold < districtDef.unlockCost) return prev;

      const updatedDistricts = prev.districts.map(d =>
        d.id === districtId ? { ...d, unlocked: true, reputation: districtDef.baseReputation, visited: false } : d
      );
      const { reputation, titleIndex } = recalcReputation(updatedDistricts, prev.stalls, prev.goods);

      return {
        ...prev,
        districts: updatedDistricts,
        bazaarGold: prev.bazaarGold - districtDef.unlockCost,
        bazaarReputation: reputation,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'district' as const,
            message: `Unlocked ${districtDef.name}`,
            messageZh: `解锁${districtDef.nameZh}`,
            goldChange: -districtDef.unlockCost,
            reputationChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcReputation]);

  // ─── Upgrade Stall ──────────────────────────────────────────────────────
  const upgradeStall = useCallback((stallId: string) => {
    setState(prev => {
      const stallState = prev.stalls.find(s => s.id === stallId);
      const stallDef = WB_STALLS.find(s => s.id === stallId);
      if (!stallState || !stallDef || stallState.level >= stallDef.maxLevel) return prev;

      const cost = calculateStallUpgradeCost(stallDef, stallState.level);
      if (prev.bazaarGold < cost) return prev;

      const updatedStalls = prev.stalls.map(s =>
        s.id === stallId ? { ...s, level: s.level + 1 } : s
      );
      const { reputation, titleIndex } = recalcReputation(prev.districts, updatedStalls, prev.goods);

      return {
        ...prev,
        stalls: updatedStalls,
        bazaarGold: prev.bazaarGold - cost,
        bazaarReputation: reputation,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'stall' as const,
            message: `Upgraded ${stallDef.name} to Lv${stallState.level + 1}`,
            messageZh: `${stallDef.nameZh}升级至${stallState.level + 1}级`,
            goldChange: -cost,
            reputationChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcReputation]);

  // ─── Activate Ability ───────────────────────────────────────────────────
  const activateAbility = useCallback((abilityId: string) => {
    setState(prev => {
      const abilityState = prev.abilities.find(a => a.id === abilityId);
      const abilityDef = WB_ABILITIES.find(a => a.id === abilityId);
      if (!abilityState || !abilityDef || abilityState.currentCooldown > 0) return prev;
      if (prev.bazaarGold < abilityDef.cost) return prev;

      let goldChange = -abilityDef.cost;
      let reputationChange = 0;
      let stallRepChange = 0;

      switch (abilityDef.effectType) {
        case 'instant_gold':
          goldChange += abilityDef.effectValue;
          break;
        case 'instant_reputation':
          reputationChange = abilityDef.effectValue;
          break;
        case 'stall_reputation':
          stallRepChange = abilityDef.effectValue;
          break;
        case 'dual_reward':
          goldChange += 100;
          reputationChange = 25;
          break;
        case 'sell_goods':
          goldChange += abilityDef.effectValue;
          break;
        case 'reset_cooldowns':
          break;
        default:
          break;
      }

      const updatedAbilities = prev.abilities.map(a =>
        a.id === abilityId
          ? { ...a, currentCooldown: abilityDef.effectType === 'reset_cooldowns' ? 0 : abilityDef.cooldown, timesUsed: a.timesUsed + 1 }
          : (abilityDef.effectType === 'reset_cooldowns' ? { ...a, currentCooldown: 0 } : a)
      );

      let updatedStalls = prev.stalls;
      if (stallRepChange > 0) {
        updatedStalls = prev.stalls.map(s =>
          s.level > 0 ? s : s
        );
      }

      const { reputation, titleIndex } = recalcReputation(prev.districts, prev.stalls, prev.goods);

      return {
        ...prev,
        abilities: tickCooldowns(updatedAbilities),
        stalls: updatedStalls,
        bazaarGold: prev.bazaarGold + goldChange,
        reputation: prev.reputation + reputationChange,
        bazaarReputation: reputation,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        abilitiesUsed: prev.abilitiesUsed + 1,
        totalGoldEarned: prev.totalGoldEarned + Math.max(0, goldChange),
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'ability' as const,
            message: `Activated ${abilityDef.name}`,
            messageZh: `发动${abilityDef.nameZh}`,
            goldChange,
            reputationChange,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcReputation]);

  // ─── Establish Trade Route ──────────────────────────────────────────────
  const establishTrade = useCallback((fromDistrict: string, toDistrict: string, commodityId: string) => {
    setState(prev => {
      if (fromDistrict === toDistrict) return prev;
      const fromUnlocked = prev.districts.find(d => d.id === fromDistrict)?.unlocked;
      const toUnlocked = prev.districts.find(d => d.id === toDistrict)?.unlocked;
      if (!fromUnlocked || !toUnlocked) return prev;

      const commodity = WB_COMMODITIES.find(c => c.id === commodityId);
      if (!commodity) return prev;

      const establishmentCost = Math.floor(commodity.basePrice * 2);
      if (prev.bazaarGold < establishmentCost) return prev;

      const exists = prev.tradeRoutes.some(
        r => r.fromDistrict === fromDistrict && r.toDistrict === toDistrict && r.commodityId === commodityId && r.active
      );
      if (exists) return prev;

      const fromIdx = WB_DISTRICTS.findIndex(d => d.id === fromDistrict);
      const toIdx = WB_DISTRICTS.findIndex(d => d.id === toDistrict);
      const distance = Math.abs(fromIdx - toIdx);
      const profit = calculateTradeProfit(commodity, distance + 1);

      const newRoute: TradeRoute = {
        id: makeTradeRouteId(),
        fromDistrict,
        toDistrict,
        commodityId,
        profit,
        active: true,
        establishedAt: Date.now(),
      };

      const fromDef = WB_DISTRICTS.find(d => d.id === fromDistrict);
      const toDef = WB_DISTRICTS.find(d => d.id === toDistrict);

      return {
        ...prev,
        tradeRoutes: [...prev.tradeRoutes, newRoute],
        bazaarGold: prev.bazaarGold - establishmentCost,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'trade' as const,
            message: `Trade route: ${fromDef?.name} → ${toDef?.name} (${commodity.name}, ${profit}/turn)`,
            messageZh: `商路：${fromDef?.nameZh} → ${toDef?.nameZh}（${commodity.nameZh}，${profit}金/回合）`,
            goldChange: -establishmentCost,
            reputationChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Haggle ─────────────────────────────────────────────────────────────
  const haggle = useCallback((): boolean => {
    let won = false;
    setState(prev => {
      const moonDef = WB_MOON_PHASES.find(m => m.id === prev.currentMoonPhase);
      const haggleBonus = moonDef?.haggleMod ?? 1;
      const success = attemptHaggle();
      won = success;

      const goldGain = success ? Math.floor(50 * haggleBonus) : 0;
      const reputationGain = success ? Math.floor(8 * haggleBonus) : -3;

      return {
        ...prev,
        bazaarGold: prev.bazaarGold + goldGain,
        reputation: Math.max(0, prev.reputation + reputationGain),
        hagglesWon: success ? prev.hagglesWon + 1 : prev.hagglesWon,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'haggle' as const,
            message: success ? `Haggle won! +${goldGain} gold, +${reputationGain} rep` : 'Haggle lost...',
            messageZh: success ? `还价成功！+${goldGain}金，+${reputationGain}声望` : '还价失败...',
            goldChange: goldGain,
            reputationChange: reputationGain,
            timestamp: Date.now(),
          },
        ],
      };
    });
    return won;
  }, []);

  // ─── Build Stall (build + first level) ──────────────────────────────────
  const buildStall = useCallback((stallId: string) => {
    setState(prev => {
      const stallState = prev.stalls.find(s => s.id === stallId);
      const stallDef = WB_STALLS.find(s => s.id === stallId);
      if (!stallState || !stallDef || stallState.level > 0) return prev;
      if (prev.bazaarGold < stallDef.baseCost) return prev;

      const updatedStalls = prev.stalls.map(s =>
        s.id === stallId ? { ...s, level: 1 } : s
      );
      const { reputation, titleIndex } = recalcReputation(prev.districts, updatedStalls, prev.goods);

      return {
        ...prev,
        stalls: updatedStalls,
        bazaarGold: prev.bazaarGold - stallDef.baseCost,
        bazaarReputation: reputation,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'stall' as const,
            message: `Built ${stallDef.name} (Lv1)`,
            messageZh: `建造${stallDef.nameZh}（1级）`,
            goldChange: -stallDef.baseCost,
            reputationChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcReputation]);

  // ─── Improve Faction Standing ───────────────────────────────────────────
  const improveFaction = useCallback((factionId: string) => {
    setState(prev => {
      const relation = prev.factionRelations.find(r => r.factionId === factionId);
      if (!relation || relation.standing >= 80) return prev;

      const cost = Math.floor((100 - relation.standing) * 4);
      if (prev.bazaarGold < cost) return prev;

      const standingGain = 18;
      const updatedRelations = prev.factionRelations.map(r =>
        r.factionId === factionId
          ? { ...r, standing: Math.min(r.maxStanding, r.standing + standingGain) }
          : r
      );

      return {
        ...prev,
        factionRelations: updatedRelations,
        bazaarGold: prev.bazaarGold - cost,
        reputation: prev.reputation + 12,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'faction' as const,
            message: `Improved relations with ${relation.factionName} (+${standingGain} standing)`,
            messageZh: `改善与${relation.factionName}的关系（+${standingGain}好感）`,
            goldChange: -cost,
            reputationChange: 12,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Check Achievements ────────────────────────────────────────────────
  const checkAchievements = useCallback(() => {
    setState(prev => {
      const newAchievements = evaluateAchievements(prev);
      let goldReward = 0;
      let reputationReward = 0;

      const newEntries: EventLogEntry[] = [];
      for (let i = 0; i < newAchievements.length; i++) {
        if (newAchievements[i].unlocked && !prev.achievements[i].unlocked) {
          const def = WB_ACHIEVEMENTS.find(a => a.id === newAchievements[i].id);
          if (def) {
            goldReward += def.reward.gold;
            reputationReward += def.reward.reputation;
            newEntries.push({
              id: makeEventLogId(),
              turnNumber: prev.turnCount,
              type: 'achievement' as const,
              message: `Achievement unlocked: ${def.name}!`,
              messageZh: `成就解锁：${def.nameZh}！`,
              goldChange: def.reward.gold,
              reputationChange: def.reward.reputation,
              timestamp: Date.now(),
            });
          }
        }
      }

      return {
        ...prev,
        achievements: newAchievements,
        bazaarGold: prev.bazaarGold + goldReward,
        reputation: prev.reputation + reputationReward,
        totalGoldEarned: prev.totalGoldEarned + goldReward,
        eventLog: [...prev.eventLog.slice(-(200 - newEntries.length)), ...newEntries],
      };
    });
  }, []);

  // ─── Complete Daily Quest ───────────────────────────────────────────────
  const completeDailyQuest = useCallback(() => {
    setState(prev => {
      if (!prev.dailyQuest || prev.dailyQuest.completed) return prev;
      if (prev.dailyQuest.currentAmount < prev.dailyQuest.targetAmount) return prev;

      return {
        ...prev,
        dailyQuest: { ...prev.dailyQuest, completed: true },
        bazaarGold: prev.bazaarGold + prev.dailyQuest.reward.gold,
        reputation: prev.reputation + prev.dailyQuest.reward.reputation,
        totalGoldEarned: prev.totalGoldEarned + prev.dailyQuest.reward.gold,
        dailyQuestsCompleted: prev.dailyQuestsCompleted + 1,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'daily' as const,
            message: 'Daily quest completed!',
            messageZh: '每日任务完成！',
            goldChange: prev.dailyQuest.reward.gold,
            reputationChange: prev.dailyQuest.reward.reputation,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Contribute to Daily Quest ──────────────────────────────────────────
  const contributeToQuest = useCallback((amount: number) => {
    setState(prev => {
      if (!prev.dailyQuest || prev.dailyQuest.completed) return prev;
      const newAmount = Math.min(
        prev.dailyQuest.targetAmount,
        prev.dailyQuest.currentAmount + amount,
      );
      return { ...prev, dailyQuest: { ...prev.dailyQuest, currentAmount: newAmount } };
    });
  }, []);

  // ─── Deactivate Trade Route ────────────────────────────────────────────
  const deactivateTradeRoute = useCallback((routeId: string) => {
    setState(prev => ({
      ...prev,
      tradeRoutes: prev.tradeRoutes.map(r =>
        r.id === routeId ? { ...r, active: false } : r
      ),
    }));
  }, []);

  // ─── Set Current District ───────────────────────────────────────────────
  const setCurrentDistrict = useCallback((districtId: string) => {
    setState(prev => {
      const district = prev.districts.find(d => d.id === districtId);
      if (!district || !district.unlocked) return prev;
      const updatedDistricts = prev.districts.map(d =>
        d.id === districtId ? { ...d, visited: true } : d
      );
      return { ...prev, currentDistrict: districtId, districts: updatedDistricts };
    });
  }, []);

  // ─── Advance Turn (the main game tick) ──────────────────────────────────
  const advanceTurn = useCallback(() => {
    setState(prev => {
      // Trade income
      const tradeIncome = prev.tradeRoutes
        .filter(r => r.active)
        .reduce((sum, r) => sum + r.profit, 0);

      // Tick ability cooldowns
      const tickedAbilities = tickCooldowns(prev.abilities);

      // Advance moon phase every 8 turns
      const newMoonPhase = prev.turnCount > 0 && (prev.turnCount + 1) % 8 === 0
        ? advanceMoonPhase(prev.currentMoonPhase)
        : prev.currentMoonPhase;

      // Tick active events
      const remainingEvents = prev.activeEvents
        .map(e => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
        .filter(e => e.remainingTurns > 0);

      // Fluctuate commodity prices
      const newPrices = fluctuateCommodityPrices(prev.commodityPrices);

      // Recalculate reputation
      const { reputation, titleIndex } = recalcReputation(prev.districts, prev.stalls, prev.goods);

      // Evaluate achievements
      const checkedAchievements = evaluateAchievements({
        ...prev,
        bazaarReputation: reputation,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
      });

      // Award new achievement rewards
      let achGold = 0;
      let achReputation = 0;
      const achLogEntries: EventLogEntry[] = [];
      for (let i = 0; i < checkedAchievements.length; i++) {
        if (checkedAchievements[i].unlocked && !prev.achievements[i].unlocked) {
          const def = WB_ACHIEVEMENTS.find(a => a.id === checkedAchievements[i].id);
          if (def) {
            achGold += def.reward.gold;
            achReputation += def.reward.reputation;
            achLogEntries.push({
              id: makeEventLogId(),
              turnNumber: prev.turnCount + 1,
              type: 'achievement' as const,
              message: `Achievement: ${def.name}!`,
              messageZh: `成就：${def.nameZh}！`,
              goldChange: def.reward.gold,
              reputationChange: def.reward.reputation,
              timestamp: Date.now(),
            });
          }
        }
      }

      // Roll bazaar event
      const bazaarEvent = rollBazaarEvent();
      let evtGold = 0;
      let evtReputation = 0;
      let evtReputationChange = 0;

      if (bazaarEvent) {
        switch (bazaarEvent.effectType) {
          case 'gold_bonus': evtGold = bazaarEvent.effectValue; break;
          case 'gold_loss': evtGold = -bazaarEvent.effectValue; break;
          case 'reputation_gain': evtReputation = bazaarEvent.effectValue; break;
          case 'reputation_loss': evtReputation = -bazaarEvent.effectValue; break;
          case 'reputation_boost': evtReputationChange = bazaarEvent.effectValue; break;
          default: break;
        }
      }

      const finalReputation = reputation + evtReputationChange;

      // Build event log
      const turnLogs: EventLogEntry[] = [];

      if (newMoonPhase !== prev.currentMoonPhase) {
        const moonDef = WB_MOON_PHASES.find(m => m.id === newMoonPhase);
        turnLogs.push({
          id: makeEventLogId(),
          turnNumber: prev.turnCount + 1,
          type: 'moon' as const,
          message: `Moon phase changed to ${moonDef?.name}`,
          messageZh: `月相变为${moonDef?.nameZh}`,
          goldChange: 0,
          reputationChange: 0,
          timestamp: Date.now(),
        });
      }

      if (tradeIncome > 0) {
        turnLogs.push({
          id: makeEventLogId(),
          turnNumber: prev.turnCount + 1,
          type: 'trade' as const,
          message: `Trade income: +${tradeIncome} gold`,
          messageZh: `贸易收入：+${tradeIncome}金`,
          goldChange: tradeIncome,
          reputationChange: 0,
          timestamp: Date.now(),
        });
      }

      if (bazaarEvent) {
        turnLogs.push({
          id: makeEventLogId(),
          turnNumber: prev.turnCount + 1,
          type: 'event' as const,
          message: `Event: ${bazaarEvent.name} — ${bazaarEvent.description}`,
          messageZh: `事件：${bazaarEvent.nameZh} — ${bazaarEvent.description}`,
          goldChange: evtGold,
          reputationChange: evtReputation,
          timestamp: Date.now(),
        });
      }

      if (bazaarEvent && bazaarEvent.duration > 0) {
        remainingEvents.push({ eventId: bazaarEvent.id, remainingTurns: bazaarEvent.duration });
      }

      return {
        ...prev,
        abilities: tickedAbilities,
        achievements: checkedAchievements,
        currentMoonPhase: newMoonPhase,
        activeEvents: remainingEvents,
        commodityPrices: newPrices,
        bazaarGold: prev.bazaarGold + tradeIncome + achGold + evtGold,
        reputation: prev.reputation + achReputation + evtReputation,
        bazaarReputation: finalReputation,
        titleIndex: Math.max(prev.titleIndex, determineTitleIndex(finalReputation)),
        turnCount: prev.turnCount + 1,
        eventLog: [...prev.eventLog.slice(-(200 - turnLogs.length - achLogEntries.length)), ...turnLogs, ...achLogEntries],
      };
    });
  }, [recalcReputation]);

  // ─── Get Title ──────────────────────────────────────────────────────────
  const getTitle = useCallback((): { name: string; nameZh: string; icon: string; index: number } => {
    const title = WB_TITLES[state.titleIndex] || WB_TITLES[0];
    return { name: title.name, nameZh: title.nameZh, icon: title.icon, index: state.titleIndex };
  }, [state.titleIndex]);

  // ─── Get Progress ───────────────────────────────────────────────────────
  const getProgress = useCallback((): WandererBazaarProgress => {
    const currentTitle = WB_TITLES[state.titleIndex];
    const nextTitleDef = WB_TITLES[state.titleIndex + 1];

    const goodCompletion = state.goods.length / WB_ENCHANTED_GOODS.length;
    const districtCompletion = state.districts.filter(d => d.unlocked).length / WB_DISTRICTS.length;
    const stallCompletion = state.stalls.filter(s => s.level > 0).length / WB_STALLS.length;
    const achievementCompletion = state.achievements.filter(a => a.unlocked).length / WB_ACHIEVEMENTS.length;

    let nextTitle: WandererBazaarProgress['nextTitle'];
    if (nextTitleDef) {
      const prevThreshold = currentTitle.minReputation;
      const nextThreshold = nextTitleDef.minReputation;
      const progress = Math.min(1, (state.bazaarReputation - prevThreshold) / (nextThreshold - prevThreshold));
      nextTitle = { name: nextTitleDef.name, nameZh: nextTitleDef.nameZh, progress, required: nextThreshold };
    } else {
      nextTitle = { name: currentTitle.name, nameZh: currentTitle.nameZh, progress: 1, required: currentTitle.minReputation };
    }

    const overallCompletion = (
      goodCompletion * 0.25 +
      districtCompletion * 0.2 +
      stallCompletion * 0.2 +
      achievementCompletion * 0.2 +
      nextTitle.progress * 0.15
    );

    return {
      nextTitle,
      goodCompletion,
      districtCompletion,
      stallCompletion,
      achievementCompletion,
      overallCompletion: Math.min(1, overallCompletion),
    };
  }, [state]);

  // ─── Get Stats ──────────────────────────────────────────────────────────
  const getStats = useCallback((): WandererBazaarStats => {
    const goodsByRarity: Record<string, number> = {
      [WB_RARITY_COMMON]: 0,
      [WB_RARITY_UNCOMMON]: 0,
      [WB_RARITY_RARE]: 0,
      [WB_RARITY_EPIC]: 0,
      [WB_RARITY_LEGENDARY]: 0,
    };
    for (const g of state.goods) {
      const def = WB_ENCHANTED_GOODS.find(t => t.id === g.id);
      if (def) goodsByRarity[def.rarity] = (goodsByRarity[def.rarity] || 0) + 1;
    }
    const title = WB_TITLES[state.titleIndex] || WB_TITLES[0];
    return {
      totalGoods: state.goods.length,
      goodsByRarity,
      districtsOwned: state.districts.filter(d => d.unlocked).length,
      totalStallLevels: state.stalls.reduce((sum, s) => sum + s.level, 0),
      maxStallLevel: Math.max(0, ...state.stalls.map(s => s.level)),
      activeTradeRoutes: state.tradeRoutes.filter(r => r.active).length,
      totalTradeProfit: state.tradeRoutes.filter(r => r.active).reduce((sum, r) => sum + r.profit, 0),
      hagglesWon: state.hagglesWon,
      currentTitle: title.name,
      currentTitleZh: title.nameZh,
      bazaarReputation: state.bazaarReputation,
      bazaarGold: state.bazaarGold,
      reputation: state.reputation,
      achievementsUnlocked: state.achievements.filter(a => a.unlocked).length,
      achievementsTotal: WB_ACHIEVEMENTS.length,
      turnCount: state.turnCount,
      currentMoonPhase: state.currentMoonPhase,
      eventsHandled: state.activeEvents.length,
    };
  }, [state]);

  // ═══════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES (useMemo)
  // ═══════════════════════════════════════════════════════════════════════

  const enrichedGoods = useMemo(() => {
    return state.goods.map(ag => {
      const def = WB_ENCHANTED_GOODS.find(t => t.id === ag.id);
      if (!def) return null;
      return {
        ...ag,
        ...def,
        rarityColor: WB_RARITY_COLORS[def.rarity] || '#999',
        rarityMultiplier: WB_RARITY_MULTIPLIER[def.rarity] || 1,
        rarityLabel: WB_RARITY_LABELS[def.rarity] || { en: 'Unknown', zh: '未知' },
      };
    }).filter(Boolean) as (AcquiredGood & EnchantedGoodDef & { rarityColor: string; rarityMultiplier: number; rarityLabel: { en: string; zh: string } })[];
  }, [state.goods]);

  const enrichedDistricts = useMemo(() => {
    return state.districts.map(ds => {
      const def = WB_DISTRICTS.find(d => d.id === ds.id);
      if (!def) return null;
      return { ...ds, ...def };
    }).filter(Boolean) as (UnlockedDistrict & DistrictDef)[];
  }, [state.districts]);

  const enrichedStalls = useMemo(() => {
    return state.stalls.map(ss => {
      const def = WB_STALLS.find(s => s.id === ss.id);
      if (!def) return null;
      const upgradeCost = ss.level < def.maxLevel ? calculateStallUpgradeCost(def, ss.level) : 0;
      return { ...ss, ...def, upgradeCost, canUpgrade: ss.level < def.maxLevel };
    }).filter(Boolean) as (StallState & StallDef & { upgradeCost: number; canUpgrade: boolean })[];
  }, [state.stalls]);

  const enrichedAbilities = useMemo(() => {
    return state.abilities.map(as => {
      const def = WB_ABILITIES.find(a => a.id === as.id);
      if (!def) return null;
      return { ...as, ...def, isReady: as.currentCooldown === 0 };
    }).filter(Boolean) as (AbilityState & AbilityDef & { isReady: boolean })[];
  }, [state.abilities]);

  const enrichedAchievements = useMemo(() => {
    return state.achievements.map(achs => {
      const def = WB_ACHIEVEMENTS.find(a => a.id === achs.id);
      if (!def) return null;
      return { ...achs, ...def };
    }).filter(Boolean) as (AchievementState & AchievementDef)[];
  }, [state.achievements]);

  const enrichedTradeRoutes = useMemo(() => {
    return state.tradeRoutes.map(tr => {
      const fromDef = WB_DISTRICTS.find(d => d.id === tr.fromDistrict);
      const toDef = WB_DISTRICTS.find(d => d.id === tr.toDistrict);
      const commodityDef = WB_COMMODITIES.find(c => c.id === tr.commodityId);
      return {
        ...tr,
        fromName: fromDef?.name ?? 'Unknown',
        fromNameZh: fromDef?.nameZh ?? '未知',
        toName: toDef?.name ?? 'Unknown',
        toNameZh: toDef?.nameZh ?? '未知',
        commodityName: commodityDef?.name ?? 'Unknown',
        commodityNameZh: commodityDef?.nameZh ?? '未知',
        commodityIcon: commodityDef?.icon ?? '📦',
      };
    });
  }, [state.tradeRoutes]);

  const enrichedCommodityPrices = useMemo(() => {
    return state.commodityPrices.map(cp => {
      const commodity = WB_COMMODITIES.find(c => c.id === cp.commodityId);
      if (!commodity) return null;
      const categoryLabel = WB_COMMODITY_CATEGORY_LABELS[commodity.category];
      return { ...cp, ...commodity, categoryLabel };
    }).filter(Boolean) as (CommodityPriceSnapshot & CommodityDef & { categoryLabel: { en: string; zh: string; icon: string } })[];
  }, [state.commodityPrices]);

  const currentMoonPhaseDef = useMemo(() => {
    return WB_MOON_PHASES.find(m => m.id === state.currentMoonPhase) ?? WB_MOON_PHASES[0];
  }, [state.currentMoonPhase]);

  const availableGoodsByRarity = useMemo(() => {
    const acquiredIds = new Set(state.goods.map(g => g.id));
    const result: Record<string, number> = {};
    for (const rarity of [WB_RARITY_COMMON, WB_RARITY_UNCOMMON, WB_RARITY_RARE, WB_RARITY_EPIC, WB_RARITY_LEGENDARY]) {
      result[rarity] = WB_ENCHANTED_GOODS.filter(t => t.rarity === rarity && !acquiredIds.has(t.id)).length;
    }
    return result;
  }, [state.goods]);

  const tradeIncomePerTurn = useMemo(() => {
    return state.tradeRoutes.filter(r => r.active).reduce((sum, r) => sum + r.profit, 0);
  }, [state.tradeRoutes]);

  const stallReputationBonus = useMemo(() => {
    return state.stalls.reduce((sum, s) => {
      const def = WB_STALLS.find(sd => sd.id === s.id);
      return sum + (def ? def.reputationPerLevel * s.level : 0);
    }, 0);
  }, [state.stalls]);

  const goodReputationBonus = useMemo(() => {
    return state.goods.reduce((sum, g) => {
      const def = WB_ENCHANTED_GOODS.find(t => t.id === g.id);
      return sum + (def ? (WB_RARITY_MULTIPLIER[def.rarity] || 1) * 2 : 0);
    }, 0);
  }, [state.goods]);

  const districtReputationTotal = useMemo(() => {
    return state.districts.filter(d => d.unlocked).reduce((sum, d) => sum + d.reputation, 0);
  }, [state.districts]);

  const haggleReadiness = useMemo((): HaggleReadiness => {
    const totalHaggles = state.hagglesWon + Math.max(0, state.turnCount - state.hagglesWon);
    const winRate = totalHaggles > 0 ? state.hagglesWon / totalHaggles : 0;
    if (winRate >= 0.8) return { level: 'master', label: 'Master Haggler', labelZh: '还价大师', color: WB_COLOR_BAZAAR_GOLD, winRate };
    if (winRate >= 0.6) return { level: 'skilled', label: 'Skilled Negotiator', labelZh: '熟练谈判者', color: WB_COLOR_MYSTIC_TEAL, winRate };
    if (winRate >= 0.4) return { level: 'average', label: 'Average Trader', labelZh: '普通商人', color: WB_COLOR_LANTERN_ORANGE, winRate };
    if (winRate >= 0.2) return { level: 'novice', label: 'Novice Haggle', labelZh: '新手还价者', color: WB_COLOR_SILK_CRIMSON, winRate };
    return { level: 'struggling', label: 'Struggling', labelZh: '挣扎中', color: '#FF4444', winRate };
  }, [state.hagglesWon, state.turnCount]);

  const goldReserves = useMemo((): GoldReserves => {
    const stallCount = state.stalls.filter(s => s.level > 0).length;
    const districtCount = state.districts.filter(d => d.unlocked).length;
    const upkeepEstimate = districtCount * 15 + stallCount * 8;
    const surplus = state.bazaarGold - upkeepEstimate * 5;
    if (surplus > 800) return { level: 'thriving', label: 'Thriving Coffers', labelZh: '财源充盈', color: WB_COLOR_BAZAAR_GOLD, surplus };
    if (surplus > 200) return { level: 'stable', label: 'Stable Funds', labelZh: '资金稳定', color: WB_COLOR_MYSTIC_TEAL, surplus };
    if (surplus > 0) return { level: 'modest', label: 'Modest Reserves', labelZh: '略有结余', color: WB_COLOR_LANTERN_ORANGE, surplus };
    return { level: 'deficit', label: 'Running Low', labelZh: '入不敷出', color: WB_COLOR_SILK_CRIMSON, surplus };
  }, [state.bazaarGold, state.stalls, state.districts]);

  const factionSummary = useMemo(() => {
    const friendly = state.factionRelations.filter(r => r.standing >= 60).length;
    const neutral = state.factionRelations.filter(r => r.standing >= 30 && r.standing < 60).length;
    const wary = state.factionRelations.filter(r => r.standing < 30).length;
    const avg = state.factionRelations.reduce((sum, r) => sum + r.standing, 0) / Math.max(1, state.factionRelations.length);
    return { friendly, neutral, wary, averageStanding: Math.round(avg) };
  }, [state.factionRelations]);

  const recentAchievements = useMemo(() => {
    return enrichedAchievements
      .filter(a => a.unlocked && a.unlockedAt !== null)
      .sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))
      .slice(0, 5);
  }, [enrichedAchievements]);

  const topTradeRoutes = useMemo(() => {
    return [...enrichedTradeRoutes].filter(r => r.active).sort((a, b) => b.profit - a.profit).slice(0, 5);
  }, [enrichedTradeRoutes]);

  const recentEventLog = useMemo(() => {
    return state.eventLog.slice(-20).reverse();
  }, [state.eventLog]);

  const dailyQuestProgress = useMemo(() => {
    if (!state.dailyQuest) return null;
    const quest = state.dailyQuest;
    const progress = Math.min(1, quest.currentAmount / Math.max(1, quest.targetAmount));
    const isExpired = Date.now() > quest.expiresAt && !quest.completed;
    return { ...quest, progress, isExpired, commodityDef: WB_COMMODITIES.find(c => c.id === quest.targetCommodityId) };
  }, [state.dailyQuest]);

  const collectionValue = useMemo(() => {
    let totalGoldValue = 0;
    let totalReputationValue = 0;
    for (const g of state.goods) {
      const def = WB_ENCHANTED_GOODS.find(t => t.id === g.id);
      if (def) {
        totalGoldValue += def.goldValue;
        totalReputationValue += def.reputationValue;
      }
    }
    return { totalGoldValue, totalReputationValue };
  }, [state.goods]);

  const projectedIncome = useMemo(() => {
    return { trade: tradeIncomePerTurn, haggle: 0, total: tradeIncomePerTurn };
  }, [tradeIncomePerTurn]);

  const stallsByCategory = useMemo(() => {
    const cats: Record<string, typeof enrichedStalls> = {};
    for (const s of enrichedStalls) {
      const cat = s.category || 'other';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(s);
    }
    return cats;
  }, [enrichedStalls]);

  const abilitiesByCategory = useMemo(() => {
    const cats: Record<string, typeof enrichedAbilities> = {};
    for (const a of enrichedAbilities) {
      const cat = a.category || 'other';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(a);
    }
    return cats;
  }, [enrichedAbilities]);

  const priceMovers = useMemo(() => {
    return [...enrichedCommodityPrices]
      .sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange))
      .slice(0, 5);
  }, [enrichedCommodityPrices]);

  // ─── Cost helpers (use stateRef) ───────────────────────────────────────
  const canAfford = useCallback((amount: number): boolean => {
    return stateRef.current.bazaarGold >= amount;
  }, []);

  const getStallUpgradeCost = useCallback((stallId: string): number => {
    const ss = stateRef.current.stalls.find(s => s.id === stallId);
    const def = WB_STALLS.find(s => s.id === stallId);
    if (!ss || !def || ss.level >= def.maxLevel) return 0;
    return calculateStallUpgradeCost(def, ss.level);
  }, []);

  const getDistrictUnlockCost = useCallback((districtId: string): number => {
    const def = WB_DISTRICTS.find(d => d.id === districtId);
    return def?.unlockCost ?? 0;
  }, []);

  const getAbilityCost = useCallback((abilityId: string): number => {
    const def = WB_ABILITIES.find(a => a.id === abilityId);
    return def?.cost ?? 0;
  }, []);

  const getFactionCost = useCallback((factionId: string): number => {
    const relation = stateRef.current.factionRelations.find(r => r.factionId === factionId);
    if (!relation || relation.standing >= 80) return 0;
    return Math.floor((100 - relation.standing) * 4);
  }, []);

  // ─── Bazaar Advisor Summary ─────────────────────────────────────────────
  const advisorSummary = useMemo(() => {
    const tips: string[] = [];
    const tipsZh: string[] = [];

    // Gold advice
    if (state.bazaarGold < 150) {
      tips.push('Gold is critically low — haggle more or sell commodities.');
      tipsZh.push('金币严重不足——多还价或出售商品。');
    }
    if (state.bazaarGold > 4000 && state.stalls.filter(s => s.level > 0).length < 8) {
      tips.push('Gold reserves are healthy — invest in more stalls.');
      tipsZh.push('储备充足——投资更多摊位。');
    }

    // District advice
    const lockedDistricts = state.districts.filter(d => !d.unlocked);
    if (lockedDistricts.length > 0) {
      const cheapest = lockedDistricts
        .map(d => ({ ...d, def: WB_DISTRICTS.find(dd => dd.id === d.id)! }))
        .filter(d => d.def)
        .sort((a, b) => a.def.unlockCost - b.def.unlockCost)[0];
      if (cheapest && state.bazaarGold >= cheapest.def.unlockCost) {
        tips.push(`Consider unlocking ${cheapest.def.name} (cost: ${cheapest.def.unlockCost} gold).`);
        tipsZh.push(`考虑解锁${cheapest.def.nameZh}（费用：${cheapest.def.unlockCost}金）。`);
      }
    }

    // Haggle advice
    if (haggleReadiness.level === 'struggling' || haggleReadiness.level === 'novice') {
      tips.push('Haggle success rate is low — try during New Moon for better odds.');
      tipsZh.push('还价成功率低——新月时尝试以获得更好几率。');
    }

    // Trade advice
    const unlockedDistricts = state.districts.filter(d => d.unlocked);
    if (unlockedDistricts.length >= 2 && state.tradeRoutes.filter(r => r.active).length < 2) {
      tips.push('Establish more trade routes between districts to boost income.');
      tipsZh.push('建立更多街区间商路以提高收入。');
    }

    // Faction advice
    const waryFactions = state.factionRelations.filter(r => r.standing < 30);
    if (waryFactions.length > 0) {
      tips.push(`${waryFactions.length} faction(s) have low standing — consider improving relations.`);
      tipsZh.push(`${waryFactions.length}个势力好感度低——考虑改善关系。`);
    }

    // Stall upgrade advice
    const maxedStalls = state.stalls.filter(s => s.level >= 10).length;
    if (maxedStalls === 0 && state.stalls.filter(s => s.level > 0).length > 3) {
      tips.push('Focus on upgrading existing stalls to maximize reputation.');
      tipsZh.push('集中升级现有摊位以最大化声望。');
    }

    // Daily quest
    if (state.dailyQuest && !state.dailyQuest.completed && state.dailyQuest.currentAmount === 0) {
      tips.push('Complete your daily quest for bonus rewards.');
      tipsZh.push('完成每日任务获取额外奖励。');
    }

    if (tips.length === 0) {
      tips.push('The bazaar thrives under your guidance. Keep exploring!');
      tipsZh.push('集市在你的指引下繁荣发展，继续探索！');
    }

    return { tips, tipsZh };
  }, [state, haggleReadiness]);

  // ─── Active events detail ───────────────────────────────────────────────
  const activeEventsDetail = useMemo(() => {
    return state.activeEvents.map(ae => {
      const evtDef = WB_BAZAAR_EVENTS.find(e => e.id === ae.eventId);
      return evtDef ? { ...ae, ...evtDef } : null;
    }).filter(Boolean) as (ActiveEvent & BazaarEventDef)[];
  }, [state.activeEvents]);

  // ─── District reputation overview ───────────────────────────────────────
  const districtReputationSummary = useMemo(() => {
    const unlocked = state.districts.filter(d => d.unlocked);
    if (unlocked.length === 0) return { average: 0, lowest: 0, total: 0 };
    const visited = unlocked.filter(d => d.visited).length;
    const average = Math.round(unlocked.reduce((s, d) => s + d.reputation, 0) / unlocked.length);
    const lowest = Math.min(...unlocked.map(d => d.reputation));
    return { average, lowest, visited, total: unlocked.length };
  }, [state.districts]);

  // ═══════════════════════════════════════════════════════════════════════
  // RETURNED API
  // ═══════════════════════════════════════════════════════════════════════

  return {
    // Raw state
    state,

    // Core actions
    acquireGood,
    unlockDistrict,
    upgradeStall,
    activateAbility,
    establishTrade,
    haggle,
    buildStall,
    improveFaction,
    checkAchievements,
    advanceTurn,

    // Navigation & quests
    setCurrentDistrict,
    contributeToQuest,
    completeDailyQuest,
    deactivateTradeRoute,

    // Query functions
    getTitle,
    getProgress,
    getStats,

    // Cost helpers
    canAfford,
    getStallUpgradeCost,
    getDistrictUnlockCost,
    getAbilityCost,
    getFactionCost,

    // Enriched data
    enrichedGoods,
    enrichedDistricts,
    enrichedStalls,
    enrichedAbilities,
    enrichedAchievements,
    enrichedTradeRoutes,
    enrichedCommodityPrices,

    // Computed metrics
    availableGoodsByRarity,
    tradeIncomePerTurn,
    stallReputationBonus,
    goodReputationBonus,
    districtReputationTotal,
    haggleReadiness,
    goldReserves,
    factionSummary,
    recentAchievements,
    topTradeRoutes,
    recentEventLog,
    dailyQuestProgress,
    collectionValue,
    projectedIncome,
    stallsByCategory,
    abilitiesByCategory,
    priceMovers,
    currentMoonPhaseDef,

    // Advisor & summaries
    advisorSummary,
    activeEventsDetail,
    districtReputationSummary,
  };
}
