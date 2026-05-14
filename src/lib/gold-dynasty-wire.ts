import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Gold Dynasty (黄金王朝) — Word Snake Wire Module
// ───────────────────────────────────────────────────────────────────────────────
// A prosperous ancient dynasty where players accumulate wealth, manage trade
// routes, build magnificent palaces, and command loyal armies to expand
// their empire across eight great provinces.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Color Theme Constants ────────────────────────────────────────────────────

const GD_COLOR_GOLD = '#FFD600';
const GD_COLOR_IMPERIAL_RED = '#C62828';
const GD_COLOR_JADE_GREEN = '#2E7D32';
const GD_COLOR_IVORY = '#FFF8E1';
const GD_COLOR_BRONZE = '#8D6E63';
const GD_COLOR_DARK_JADE = '#1B5E20';
const GD_COLOR_PALE_GOLD = '#FFF9C4';
const GD_COLOR_DEEP_RED = '#B71C1C';
const GD_COLOR_DARK_BRONZE = '#5D4037';
const GD_COLOR_SILVER = '#B0BEC5';
const GD_COLOR_ROYAL_PURPLE = '#6A1B9A';

// ─── Rarity Tier Constants ────────────────────────────────────────────────────

const GD_RARITY_COMMON = 'common';
const GD_RARITY_UNCOMMON = 'uncommon';
const GD_RARITY_RARE = 'rare';
const GD_RARITY_EPIC = 'epic';
const GD_RARITY_LEGENDARY = 'legendary';

const GD_RARITY_COLORS: Record<string, string> = {
  [GD_RARITY_COMMON]: '#9E9E9E',
  [GD_RARITY_UNCOMMON]: '#4CAF50',
  [GD_RARITY_RARE]: '#2196F3',
  [GD_RARITY_EPIC]: '#9C27B0',
  [GD_RARITY_LEGENDARY]: GD_COLOR_GOLD,
};

const GD_RARITY_LABELS: Record<string, { en: string; zh: string }> = {
  [GD_RARITY_COMMON]: { en: 'Common', zh: '普通' },
  [GD_RARITY_UNCOMMON]: { en: 'Uncommon', zh: '优良' },
  [GD_RARITY_RARE]: { en: 'Rare', zh: '稀有' },
  [GD_RARITY_EPIC]: { en: 'Epic', zh: '史诗' },
  [GD_RARITY_LEGENDARY]: { en: 'Legendary', zh: '传说' },
};

const GD_RARITY_MULTIPLIER: Record<string, number> = {
  [GD_RARITY_COMMON]: 1,
  [GD_RARITY_UNCOMMON]: 2,
  [GD_RARITY_RARE]: 4,
  [GD_RARITY_EPIC]: 8,
  [GD_RARITY_LEGENDARY]: 16,
};

// ─── Season Constants ─────────────────────────────────────────────────────────

const GD_SEASON_SPRING = 'spring';
const GD_SEASON_SUMMER = 'summer';
const GD_SEASON_AUTUMN = 'autumn';
const GD_SEASON_WINTER = 'winter';

const GD_SEASONS = [
  { id: GD_SEASON_SPRING, name: 'Spring', nameZh: '春', icon: '🌸', taxMod: 0.8, tradeMod: 1.0, armyMod: 1.0, buildMod: 0.9 },
  { id: GD_SEASON_SUMMER, name: 'Summer', nameZh: '夏', icon: '☀️', taxMod: 1.0, tradeMod: 1.2, armyMod: 1.1, buildMod: 1.0 },
  { id: GD_SEASON_AUTUMN, name: 'Autumn', nameZh: '秋', icon: '🍂', taxMod: 1.3, tradeMod: 1.1, armyMod: 0.9, buildMod: 1.1 },
  { id: GD_SEASON_WINTER, name: 'Winter', nameZh: '冬', icon: '❄️', taxMod: 0.6, tradeMod: 0.7, armyMod: 0.7, buildMod: 0.8 },
];

// ─── Title Constants ──────────────────────────────────────────────────────────

const GD_TITLES = [
  { name: 'Merchant', nameZh: '商人', minProsperity: 0, icon: '🏪' },
  { name: 'Trader', nameZh: '贸易商', minProsperity: 100, icon: '🧳' },
  { name: 'Merchant Prince', nameZh: '商王子', minProsperity: 300, icon: '👑' },
  { name: 'Trade Baron', nameZh: '贸易男爵', minProsperity: 600, icon: '🏰' },
  { name: 'Court Official', nameZh: '朝廷命官', minProsperity: 1000, icon: '📜' },
  { name: 'Viceroy', nameZh: '总督', minProsperity: 1500, icon: '⚔️' },
  { name: 'Grand Chancellor', nameZh: '太傅', minProsperity: 2500, icon: '🐉' },
  { name: 'Golden Emperor', nameZh: '黄金帝王', minProsperity: 5000, icon: '✨' },
  { name: 'Golden Empress', nameZh: '黄金女皇', minProsperity: 5000, icon: '🌟' },
];

// ─── Dynasty Event Definitions ────────────────────────────────────────────────

interface DynastyEventDef {
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

const GD_DYNASTY_EVENTS: DynastyEventDef[] = [
  { id: 'evt01', name: 'Bountiful Harvest', nameZh: '丰收年', description: 'Granaries overflow with grain', effectType: 'gold_bonus', effectValue: 200, duration: 0, icon: '🌾', probability: 0.08 },
  { id: 'evt02', name: 'Bandit Raid', nameZh: '山贼来袭', description: 'Bandits plunder trade routes', effectType: 'gold_loss', effectValue: 150, duration: 0, icon: '🗡️', probability: 0.06 },
  { id: 'evt03', name: 'Foreign Embassy', nameZh: '外国使团', description: 'A diplomatic envoy arrives', effectType: 'influence_gain', effectValue: 40, duration: 0, icon: '📮', probability: 0.07 },
  { id: 'evt04', name: 'Merchant Caravan', nameZh: '商队抵达', description: 'A wealthy caravan visits', effectType: 'trade_bonus', effectValue: 100, duration: 2, icon: '🐪', probability: 0.09 },
  { id: 'evt05', name: 'Plague Outbreak', nameZh: '瘟疫蔓延', description: 'Disease weakens provinces', effectType: 'prosperity_loss', effectValue: 30, duration: 0, icon: '🦠', probability: 0.04 },
  { id: 'evt06', name: 'Jade Discovery', nameZh: '发现玉矿', description: 'Miners find a jade deposit', effectType: 'rare_treasure', effectValue: 1, duration: 0, icon: '💎', probability: 0.03 },
  { id: 'evt07', name: 'Army Mutiny', nameZh: '兵变', description: 'Discontent in the ranks', effectType: 'army_loss', effectValue: 300, duration: 0, icon: '⚡', probability: 0.03 },
  { id: 'evt08', name: 'Imperial Festival', nameZh: '御赐庆典', description: 'Prosperity surges nationwide', effectType: 'prosperity_boost', effectValue: 50, duration: 0, icon: '🎆', probability: 0.05 },
  { id: 'evt09', name: 'Scholar Visit', nameZh: '大儒来访', description: 'A learned sage offers counsel', effectType: 'influence_gain', effectValue: 60, duration: 0, icon: '📚', probability: 0.06 },
  { id: 'evt10', name: 'Gold Mine Found', nameZh: '金矿发现', description: 'A new gold vein discovered', effectType: 'gold_bonus', effectValue: 500, duration: 0, icon: '⛏️', probability: 0.02 },
  { id: 'evt11', name: 'Drought', nameZh: '大旱', description: 'Water sources dry up', effectType: 'prosperity_loss', effectValue: 40, duration: 2, icon: '☀️', probability: 0.04 },
  { id: 'evt12', name: 'Alliance Proposal', nameZh: '结盟提议', description: 'A neighbor seeks friendship', effectType: 'diplomacy_boost', effectValue: 25, duration: 0, icon: '🤝', probability: 0.06 },
  { id: 'evt14', name: 'Artisan Masterpiece', nameZh: '匠心独运', description: 'An artisan creates a masterpiece', effectType: 'structure_bonus', effectValue: 1, duration: 0, icon: '🏺', probability: 0.05 },
  { id: 'evt15', name: 'Refugee Wave', nameZh: '难民潮', description: 'Refugees seek shelter', effectType: 'army_gain', effectValue: 200, duration: 0, icon: '🏃', probability: 0.04 },
  { id: 'evt16', name: 'Solar Eclipse', nameZh: '日食', description: 'An omen in the sky', effectType: 'influence_gain', effectValue: 30, duration: 0, icon: '🌑', probability: 0.03 },
];

// ─── Trade Good Category Constants ────────────────────────────────────────────

const GD_GOOD_CATEGORY_LABELS: Record<string, { en: string; zh: string; icon: string }> = {
  textile: { en: 'Textile', zh: '纺织', icon: '🧵' },
  craft: { en: 'Craft', zh: '工艺品', icon: '🏺' },
  gem: { en: 'Gem', zh: '宝石', icon: '💎' },
  food: { en: 'Food', zh: '食品', icon: '🍜' },
  material: { en: 'Material', zh: '材料', icon: '🪨' },
  herb: { en: 'Herb', zh: '草药', icon: '🌿' },
  precious: { en: 'Precious', zh: '珍品', icon: '✨' },
};

// ─── Treasure Definitions (35 artifacts across 5 tiers) ───────────────────────

interface TreasureDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  goldValue: number;
  influenceValue: number;
  description: string;
  lore: string;
}

const GD_TREASURES: TreasureDef[] = [
  // ── Common (7) ──
  { id: 't01', name: 'Copper Coin Cache', nameZh: '铜钱窖藏', rarity: GD_RARITY_COMMON, goldValue: 50, influenceValue: 5, description: 'A hoard of ancient copper coins', lore: 'Found beneath a ruined watchtower' },
  { id: 't02', name: 'Jade Pendant', nameZh: '翡翠吊坠', rarity: GD_RARITY_COMMON, goldValue: 60, influenceValue: 8, description: 'A simple yet elegant carved jade pendant', lore: 'Once worn by a minor court lady' },
  { id: 't03', name: 'Bronze Mirror', nameZh: '铜镜', rarity: GD_RARITY_COMMON, goldValue: 45, influenceValue: 6, description: 'A polished bronze mirror with cloud patterns', lore: 'Reflects the image of its owner in moonlight' },
  { id: 't04', name: 'Silk Scroll Fragment', nameZh: '丝绸残卷', rarity: GD_RARITY_COMMON, goldValue: 55, influenceValue: 7, description: 'A fragment of an ancient silk manuscript', lore: 'Contains verses from a forgotten poet' },
  { id: 't05', name: 'Porcelain Teacup', nameZh: '瓷器茶杯', rarity: GD_RARITY_COMMON, goldValue: 40, influenceValue: 5, description: 'A delicately painted porcelain teacup', lore: 'Blue-and-white from a southern kiln' },
  { id: 't06', name: 'Ink Stone', nameZh: '砚台', rarity: GD_RARITY_COMMON, goldValue: 35, influenceValue: 4, description: 'A smooth ink stone for calligraphy', lore: 'Produced the finest ink when ground with care' },
  { id: 't07', name: 'Wooden Comb', nameZh: '木梳', rarity: GD_RARITY_COMMON, goldValue: 30, influenceValue: 3, description: 'A sandalwood comb with carved flowers', lore: 'Faint fragrance still lingers after centuries' },
  // ── Uncommon (7) ──
  { id: 't08', name: 'Silver Ingot', nameZh: '银锭', rarity: GD_RARITY_UNCOMMON, goldValue: 150, influenceValue: 15, description: 'A stamped silver ingot from the royal mint', lore: 'Bears the imperial treasury mark' },
  { id: 't09', name: 'Celadon Vase', nameZh: '青瓷花瓶', rarity: GD_RARITY_UNCOMMON, goldValue: 180, influenceValue: 18, description: 'A Song-dynasty style celadon vase', lore: 'Its glaze shimmers like jade in sunlight' },
  { id: 't10', name: 'Tiger Seal', nameZh: '虎符', rarity: GD_RARITY_UNCOMMON, goldValue: 200, influenceValue: 25, description: 'A military command seal in two halves', lore: 'One half held by the emperor, one by the general' },
  { id: 't11', name: 'Bamboo Flute', nameZh: '竹笛', rarity: GD_RARITY_UNCOMMON, goldValue: 120, influenceValue: 20, description: 'A flute carved from aged purple bamboo', lore: 'Its melody can calm wild beasts' },
  { id: 't12', name: 'Embroidered Robe', nameZh: '绣花锦袍', rarity: GD_RARITY_UNCOMMON, goldValue: 160, influenceValue: 16, description: 'A silk robe with golden phoenix embroidery', lore: 'Each stitch tells a different mythological tale' },
  { id: 't13', name: 'Jade Chess Set', nameZh: '翡翠棋盘', rarity: GD_RARITY_UNCOMMON, goldValue: 170, influenceValue: 17, description: 'A complete Go set carved from fine jade', lore: 'Said to be the very set used by the founding emperor' },
  { id: 't14', name: 'Bronze Bell', nameZh: '青铜编钟', rarity: GD_RARITY_UNCOMMON, goldValue: 140, influenceValue: 22, description: 'A ceremonial bronze bell with inscriptions', lore: 'Its tone resonates across three provinces' },
  // ── Rare (7) ──
  { id: 't15', name: 'Gold Phoenix Crown', nameZh: '金凤冠', rarity: GD_RARITY_RARE, goldValue: 500, influenceValue: 50, description: 'A crown adorned with golden phoenixes', lore: 'Worn only during celestial ceremonies' },
  { id: 't16', name: 'Dragon Jade Tablet', nameZh: '龙纹玉牌', rarity: GD_RARITY_RARE, goldValue: 450, influenceValue: 55, description: 'A jade tablet inscribed with dragon motifs', lore: 'Grants passage through imperial checkpoints' },
  { id: 't17', name: 'Imperial Edict Scroll', nameZh: '圣旨', rarity: GD_RARITY_RARE, goldValue: 600, influenceValue: 70, description: 'An authentic imperial decree on yellow silk', lore: 'Commands absolute obedience from all officials' },
  { id: 't18', name: 'Star-Mapped Astrolabe', nameZh: '星象仪', rarity: GD_RARITY_RARE, goldValue: 550, influenceValue: 45, description: 'An intricate brass astronomical instrument', lore: 'Predicts eclipses and seasonal changes with uncanny accuracy' },
  { id: 't19', name: 'Thousand-Year Ginseng', nameZh: '千年人参', rarity: GD_RARITY_RARE, goldValue: 400, influenceValue: 40, description: 'A legendary ginseng root of immense vitality', lore: 'Harvested from the slopes of Mystic Mountain' },
  { id: 't20', name: 'Pearl Dragon Boat', nameZh: '珍珠龙舟', rarity: GD_RARITY_RARE, goldValue: 480, influenceValue: 48, description: 'A miniature boat crafted entirely from pearls', lore: 'Said to float on water without sinking' },
  { id: 't21', name: 'Crimson Lacquer Armor', nameZh: '朱漆铠甲', rarity: GD_RARITY_RARE, goldValue: 520, influenceValue: 60, description: 'A ceremonial armor set inlaid with rubies', lore: 'Worn by the legendary General of the Red Banner' },
  // ── Epic (7) ──
  { id: 't22', name: 'Heavenly Jade Seal', nameZh: '传国玉玺', rarity: GD_RARITY_EPIC, goldValue: 2000, influenceValue: 200, description: 'The legendary seal of heavenly mandate', lore: 'He who holds it holds the mandate of heaven itself' },
  { id: 't23', name: 'Nine-Dragon Wall Relief', nameZh: '九龙壁浮雕', rarity: GD_RARITY_EPIC, goldValue: 1800, influenceValue: 180, description: 'A miniature relief of the imperial nine-dragon wall', lore: 'Each dragon represents a dynastic virtue' },
  { id: 't24', name: 'Moonlight Saber', nameZh: '月光宝剑', rarity: GD_RARITY_EPIC, goldValue: 2200, influenceValue: 220, description: 'A legendary blade that glows under moonlight', lore: 'Forged from meteorite iron by a master swordsmith' },
  { id: 't25', name: 'Phoenix Feather Fan', nameZh: '孔雀翎扇', rarity: GD_RARITY_EPIC, goldValue: 1900, influenceValue: 190, description: 'A fan made from iridescent phoenix feathers', lore: 'Each wave summons a cooling breeze indoors' },
  { id: 't26', name: 'Dragon Pearl', nameZh: '龙珠', rarity: GD_RARITY_EPIC, goldValue: 2500, influenceValue: 250, description: 'A luminous pearl said to grant wisdom', lore: 'Found in the lair of an ancient dragon emperor' },
  { id: 't27', name: 'Emperor\'s Silk Banner', nameZh: '御赐锦旗', rarity: GD_RARITY_EPIC, goldValue: 1700, influenceValue: 210, description: 'A banner bearing the emperor\'s personal calligraphy', lore: 'Unfurling it rallies armies to fight harder' },
  { id: 't28', name: 'Celestial Inkstone', nameZh: '天工砚', rarity: GD_RARITY_EPIC, goldValue: 2100, influenceValue: 195, description: 'An inkstone that never runs dry of perfect ink', lore: 'Gifted by the gods to the first scholar-emperor' },
  // ── Legendary (7) ──
  { id: 't29', name: 'Golden Dragon Throne', nameZh: '金龙宝座', rarity: GD_RARITY_LEGENDARY, goldValue: 10000, influenceValue: 1000, description: 'The throne of the first Golden Emperor himself', lore: 'Sitting upon it grants visions of past and future dynasties' },
  { id: 't30', name: 'Eternal Flame Lantern', nameZh: '长生明灯', rarity: GD_RARITY_LEGENDARY, goldValue: 8000, influenceValue: 800, description: 'A lantern that burns with undying golden flame', lore: 'Its light can never be extinguished by any force' },
  { id: 't31', name: 'Mandate of Heaven Scroll', nameZh: '天命画卷', rarity: GD_RARITY_LEGENDARY, goldValue: 12000, influenceValue: 1200, description: 'The scroll that bestows divine right to rule', lore: 'Contains the names of all past and future emperors' },
  { id: 't32', name: 'Kunlun Mountain Jade', nameZh: '昆仑玉璧', rarity: GD_RARITY_LEGENDARY, goldValue: 9000, influenceValue: 900, description: 'A jade disc from the mythical Kunlun Mountains', lore: 'Said to be a fragment of the pillar separating heaven and earth' },
  { id: 't33', name: 'Phoenix Crown of Empress Wu', nameZh: '武则天凤冠', rarity: GD_RARITY_LEGENDARY, goldValue: 11000, influenceValue: 1100, description: 'The legendary crown of the only female emperor', lore: 'Empowers its wearer with unmatched strategic brilliance' },
  { id: 't34', name: 'Terracotta General', nameZh: '兵马俑将军', rarity: GD_RARITY_LEGENDARY, goldValue: 9500, influenceValue: 950, description: 'A life-size terracotta warrior in full regalia', lore: 'At midnight it guards the palace corridors' },
  { id: 't35', name: 'Void Compass', nameZh: '虚空罗盘', rarity: GD_RARITY_LEGENDARY, goldValue: 15000, influenceValue: 1500, description: 'A compass that points toward boundless fortune', lore: 'Created by an immortal alchemist at the edge of the world' },
];

// ─── Province Definitions (8) ─────────────────────────────────────────────────

interface ProvinceDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  expansionCost: number;
  baseProsperity: number;
  icon: string;
  specialGoods: string[];
  terrainType: string;
}

const GD_PROVINCES: ProvinceDef[] = [
  { id: 'p01', name: 'Capital Province', nameZh: '京畿', description: 'The heart of the empire, seat of power', expansionCost: 0, baseProsperity: 50, icon: '🏯', specialGoods: ['g19', 'g23'], terrainType: 'plains' },
  { id: 'p02', name: 'Silk Road Province', nameZh: '丝路', description: 'Gateway to western trade routes', expansionCost: 500, baseProsperity: 80, icon: '🐪', specialGoods: ['g01', 'g07'], terrainType: 'desert' },
  { id: 'p03', name: 'Jade River Province', nameZh: '翡翠江', description: 'Rich in jade mines and fishing villages', expansionCost: 800, baseProsperity: 100, icon: '🏞️', specialGoods: ['g03', 'g21'], terrainType: 'river' },
  { id: 'p04', name: 'Iron Mountain Province', nameZh: '铁山', description: 'Abundant iron ore and skilled blacksmiths', expansionCost: 1200, baseProsperity: 120, icon: '⛰️', specialGoods: ['g06', 'g15'], terrainType: 'mountain' },
  { id: 'p05', name: 'Rice Paddy Province', nameZh: '稻乡', description: 'The breadbasket feeding the entire empire', expansionCost: 1000, baseProsperity: 150, icon: '🌾', specialGoods: ['g05', 'g27'], terrainType: 'farmland' },
  { id: 'p06', name: 'South Sea Province', nameZh: '南海', description: 'Maritime trade hub and pearl fisheries', expansionCost: 1500, baseProsperity: 130, icon: '🌊', specialGoods: ['g08', 'g14'], terrainType: 'coastal' },
  { id: 'p07', name: 'Northern Steppes', nameZh: '北疆', description: 'Frontier lands with nomadic horsemen', expansionCost: 2000, baseProsperity: 90, icon: '🐎', specialGoods: ['g11', 'g24'], terrainType: 'grassland' },
  { id: 'p08', name: 'Mystic Mountain Province', nameZh: '仙山', description: 'Sacred peaks where monks seek enlightenment', expansionCost: 3000, baseProsperity: 200, icon: '🌋', specialGoods: ['g10', 'g20'], terrainType: 'highlands' },
];

// ─── Trade Goods (30) ─────────────────────────────────────────────────────────

interface TradeGoodDef {
  id: string;
  name: string;
  nameZh: string;
  basePrice: number;
  volatility: number;
  category: string;
  icon: string;
}

const GD_TRADE_GOODS: TradeGoodDef[] = [
  { id: 'g01', name: 'Raw Silk', nameZh: '生丝', basePrice: 20, volatility: 0.15, category: 'textile', icon: '🧵' },
  { id: 'g02', name: 'Porcelain', nameZh: '瓷器', basePrice: 45, volatility: 0.2, category: 'craft', icon: '🏺' },
  { id: 'g03', name: 'Jade', nameZh: '玉石', basePrice: 80, volatility: 0.1, category: 'gem', icon: '💎' },
  { id: 'g04', name: 'Tea Leaves', nameZh: '茶叶', basePrice: 15, volatility: 0.25, category: 'food', icon: '🍵' },
  { id: 'g05', name: 'Rice', nameZh: '大米', basePrice: 5, volatility: 0.3, category: 'food', icon: '🍚' },
  { id: 'g06', name: 'Iron Ore', nameZh: '铁矿', basePrice: 30, volatility: 0.12, category: 'material', icon: '⛏️' },
  { id: 'g07', name: 'Spices', nameZh: '香料', basePrice: 55, volatility: 0.22, category: 'food', icon: '🌶️' },
  { id: 'g08', name: 'Pearls', nameZh: '珍珠', basePrice: 120, volatility: 0.08, category: 'gem', icon: '🫧' },
  { id: 'g09', name: 'Lacquerware', nameZh: '漆器', basePrice: 35, volatility: 0.18, category: 'craft', icon: '🪵' },
  { id: 'g10', name: 'Ginseng', nameZh: '人参', basePrice: 70, volatility: 0.14, category: 'herb', icon: '🌿' },
  { id: 'g11', name: 'Cotton', nameZh: '棉花', basePrice: 10, volatility: 0.2, category: 'textile', icon: '☁️' },
  { id: 'g12', name: 'Timber', nameZh: '木材', basePrice: 8, volatility: 0.15, category: 'material', icon: '🌲' },
  { id: 'g13', name: 'Gold Dust', nameZh: '金沙', basePrice: 200, volatility: 0.05, category: 'precious', icon: '✨' },
  { id: 'g14', name: 'Salt', nameZh: '盐', basePrice: 12, volatility: 0.1, category: 'food', icon: '🧂' },
  { id: 'g15', name: 'Bronze Ingot', nameZh: '青铜锭', basePrice: 40, volatility: 0.1, category: 'material', icon: '🔶' },
  { id: 'g16', name: 'Fine Wine', nameZh: '美酒', basePrice: 50, volatility: 0.18, category: 'food', icon: '🍶' },
  { id: 'g17', name: 'Ivory', nameZh: '象牙', basePrice: 150, volatility: 0.07, category: 'precious', icon: '🦷' },
  { id: 'g18', name: 'Cinnabar', nameZh: '朱砂', basePrice: 65, volatility: 0.16, category: 'material', icon: '🔴' },
  { id: 'g19', name: 'Ink Sticks', nameZh: '墨锭', basePrice: 25, volatility: 0.12, category: 'craft', icon: '🖤' },
  { id: 'g20', name: 'Saffron', nameZh: '藏红花', basePrice: 180, volatility: 0.25, category: 'herb', icon: '🌸' },
  { id: 'g21', name: 'Coral', nameZh: '珊瑚', basePrice: 90, volatility: 0.13, category: 'gem', icon: '🪸' },
  { id: 'g22', name: 'Turmeric', nameZh: '姜黄', basePrice: 18, volatility: 0.2, category: 'herb', icon: '🟡' },
  { id: 'g23', name: 'Linen', nameZh: '亚麻', basePrice: 14, volatility: 0.17, category: 'textile', icon: '🧶' },
  { id: 'g24', name: 'Copper', nameZh: '铜', basePrice: 28, volatility: 0.14, category: 'material', icon: '🟤' },
  { id: 'g25', name: 'Musk', nameZh: '麝香', basePrice: 160, volatility: 0.06, category: 'herb', icon: '🫧' },
  { id: 'g26', name: 'Amber', nameZh: '琥珀', basePrice: 110, volatility: 0.09, category: 'gem', icon: '🟠' },
  { id: 'g27', name: 'Honey', nameZh: '蜂蜜', basePrice: 22, volatility: 0.16, category: 'food', icon: '🍯' },
  { id: 'g28', name: 'Wax', nameZh: '蜂蜡', basePrice: 16, volatility: 0.13, category: 'material', icon: '🕯️' },
  { id: 'g29', name: 'Tortoise Shell', nameZh: '玳瑁', basePrice: 130, volatility: 0.08, category: 'precious', icon: '🐢' },
  { id: 'g30', name: 'Agate', nameZh: '玛瑙', basePrice: 75, volatility: 0.11, category: 'gem', icon: '🔁' },
];

// ─── Palace Structures (25, upgradeable to Lv10) ──────────────────────────────

interface StructureDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  prosperityPerLevel: number;
  icon: string;
  category: string;
}

const GD_STRUCTURES: StructureDef[] = [
  { id: 's01', name: 'Throne Hall', nameZh: '金銮殿', description: 'Central seat of dynastic power', baseCost: 200, costMultiplier: 1.8, maxLevel: 10, prosperityPerLevel: 15, icon: '🏛️', category: 'government' },
  { id: 's02', name: 'Treasury Vault', nameZh: '宝库', description: 'Stores and protects the dynasty wealth', baseCost: 150, costMultiplier: 1.6, maxLevel: 10, prosperityPerLevel: 10, icon: '💰', category: 'economy' },
  { id: 's03', name: 'Silk Workshop', nameZh: '织锦坊', description: 'Produces fine silk for trade', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, prosperityPerLevel: 8, icon: '🧵', category: 'production' },
  { id: 's04', name: 'Iron Foundry', nameZh: '炼铁炉', description: 'Forges weapons and tools', baseCost: 120, costMultiplier: 1.5, maxLevel: 10, prosperityPerLevel: 8, icon: '🔥', category: 'production' },
  { id: 's05', name: 'Granary', nameZh: '粮仓', description: 'Ensures food supply for the people', baseCost: 80, costMultiplier: 1.4, maxLevel: 10, prosperityPerLevel: 6, icon: '🏭', category: 'economy' },
  { id: 's06', name: 'Jade Pavilion', nameZh: '玉翠阁', description: 'Showcases precious jade collections', baseCost: 250, costMultiplier: 1.7, maxLevel: 10, prosperityPerLevel: 12, icon: '🏯', category: 'culture' },
  { id: 's07', name: 'Tea Garden', nameZh: '茶园', description: 'Cultivates the finest tea leaves', baseCost: 90, costMultiplier: 1.4, maxLevel: 10, prosperityPerLevel: 7, icon: '🍵', category: 'production' },
  { id: 's08', name: 'Library Pavilion', nameZh: '藏书阁', description: 'Preserves knowledge and wisdom', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, prosperityPerLevel: 10, icon: '📚', category: 'culture' },
  { id: 's09', name: 'Barracks', nameZh: '兵营', description: 'Trains and houses the imperial guard', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, prosperityPerLevel: 5, icon: '⚔️', category: 'military' },
  { id: 's10', name: 'Merchant Quarter', nameZh: '商市', description: 'Hub for domestic and foreign trade', baseCost: 160, costMultiplier: 1.5, maxLevel: 10, prosperityPerLevel: 12, icon: '🏪', category: 'economy' },
  { id: 's11', name: 'Alchemist Tower', nameZh: '炼丹塔', description: 'Researches ancient elixirs and medicines', baseCost: 300, costMultiplier: 1.8, maxLevel: 10, prosperityPerLevel: 9, icon: '⚗️', category: 'culture' },
  { id: 's12', name: 'Observatory', nameZh: '观星台', description: 'Studies celestial phenomena', baseCost: 280, costMultiplier: 1.8, maxLevel: 10, prosperityPerLevel: 8, icon: '🔭', category: 'culture' },
  { id: 's13', name: 'Lotus Pond', nameZh: '荷塘', description: 'A serene garden for contemplation', baseCost: 70, costMultiplier: 1.3, maxLevel: 10, prosperityPerLevel: 5, icon: '🪷', category: 'culture' },
  { id: 's14', name: 'Ceramic Kiln', nameZh: '窑炉', description: 'Fires world-renowned porcelain', baseCost: 110, costMultiplier: 1.5, maxLevel: 10, prosperityPerLevel: 9, icon: '🏺', category: 'production' },
  { id: 's15', name: 'Pearl Docks', nameZh: '珠贝码头', description: 'Harvests pearls from the sea', baseCost: 200, costMultiplier: 1.6, maxLevel: 10, prosperityPerLevel: 11, icon: '⚓', category: 'economy' },
  { id: 's16', name: 'War Elephant Stables', nameZh: '象厩', description: 'Houses war elephants for the army', baseCost: 350, costMultiplier: 1.9, maxLevel: 10, prosperityPerLevel: 4, icon: '🐘', category: 'military' },
  { id: 's17', name: 'Imperial Gardens', nameZh: '御花园', description: 'Magnificent botanical gardens', baseCost: 130, costMultiplier: 1.4, maxLevel: 10, prosperityPerLevel: 10, icon: '🌺', category: 'culture' },
  { id: 's18', name: 'Chancellor Office', nameZh: '丞相府', description: 'Administrative center of governance', baseCost: 220, costMultiplier: 1.7, maxLevel: 10, prosperityPerLevel: 14, icon: '📜', category: 'government' },
  { id: 's19', name: 'Spell Chamber', nameZh: '符咒室', description: 'Crafts protective talismans', baseCost: 260, costMultiplier: 1.8, maxLevel: 10, prosperityPerLevel: 7, icon: '🔮', category: 'culture' },
  { id: 's20', name: 'Dragon Gate', nameZh: '龙门', description: 'Monumental entrance to the palace', baseCost: 320, costMultiplier: 1.9, maxLevel: 10, prosperityPerLevel: 13, icon: '🐉', category: 'government' },
  { id: 's21', name: 'Music Pavilion', nameZh: '乐坊', description: 'Court musicians perform here', baseCost: 100, costMultiplier: 1.4, maxLevel: 10, prosperityPerLevel: 6, icon: '🎵', category: 'culture' },
  { id: 's22', name: 'Armory', nameZh: '武器库', description: 'Stores the finest weapons and armor', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, prosperityPerLevel: 5, icon: '🛡️', category: 'military' },
  { id: 's23', name: 'Stamp Workshop', nameZh: '印坊', description: 'Produces official imperial seals', baseCost: 150, costMultiplier: 1.5, maxLevel: 10, prosperityPerLevel: 8, icon: '🔏', category: 'government' },
  { id: 's24', name: 'Watchtower', nameZh: '烽火台', description: 'Early warning system for invasions', baseCost: 140, costMultiplier: 1.5, maxLevel: 10, prosperityPerLevel: 4, icon: '🗼', category: 'military' },
  { id: 's25', name: 'Golden Pagoda', nameZh: '金塔', description: 'Sacred pagoda blessing the dynasty', baseCost: 500, costMultiplier: 2.0, maxLevel: 10, prosperityPerLevel: 20, icon: '🗼', category: 'culture' },
];

// ─── Dynasty Abilities (22) ───────────────────────────────────────────────────

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

const GD_ABILITIES: AbilityDef[] = [
  { id: 'a01', name: 'Royal Decree', nameZh: '圣旨', description: 'Doubles tax income for 3 turns', cooldown: 5, cost: 100, effectType: 'tax_boost', effectValue: 2, icon: '📜', category: 'economy' },
  { id: 'a02', name: 'Trade Wind', nameZh: '贸易风', description: 'Reduces all trade costs by 30% for 2 turns', cooldown: 4, cost: 80, effectType: 'trade_discount', effectValue: 0.3, icon: '💨', category: 'trade' },
  { id: 'a03', name: 'Iron Wall', nameZh: '铁壁', description: 'Doubles army defense for 1 turn', cooldown: 6, cost: 150, effectType: 'army_defense', effectValue: 2, icon: '🧱', category: 'military' },
  { id: 'a04', name: 'Golden Touch', nameZh: '点石成金', description: 'Instantly gain 300 gold', cooldown: 3, cost: 50, effectType: 'instant_gold', effectValue: 300, icon: '🪙', category: 'economy' },
  { id: 'a05', name: 'Jade Blessing', nameZh: '玉赐', description: 'Gain 50 influence points', cooldown: 4, cost: 60, effectType: 'instant_influence', effectValue: 50, icon: '💚', category: 'diplomacy' },
  { id: 'a06', name: 'Dragon Roar', nameZh: '龙啸', description: 'Scout a random province for free', cooldown: 5, cost: 120, effectType: 'free_scout', effectValue: 1, icon: '🐉', category: 'military' },
  { id: 'a07', name: 'Prosperity Rain', nameZh: '甘霖', description: 'All provinces gain +20 prosperity', cooldown: 7, cost: 200, effectType: 'province_prosperity', effectValue: 20, icon: '🌧️', category: 'province' },
  { id: 'a08', name: 'Merchant Guild', nameZh: '商会令', description: 'Unlock a random trade route for free', cooldown: 6, cost: 130, effectType: 'free_trade', effectValue: 1, icon: '🤝', category: 'trade' },
  { id: 'a09', name: 'Fortification Rush', nameZh: '筑城令', description: 'Upgrade a random structure by 1 level', cooldown: 8, cost: 250, effectType: 'free_upgrade', effectValue: 1, icon: '🏗️', category: 'building' },
  { id: 'a10', name: 'Spy Network', nameZh: '情报网', description: 'Reveal all trade good prices for 2 turns', cooldown: 4, cost: 90, effectType: 'market_insight', effectValue: 2, icon: '🕵️', category: 'trade' },
  { id: 'a11', name: 'Imperial Banquet', nameZh: '御宴', description: 'Gain 100 gold and 30 influence', cooldown: 5, cost: 110, effectType: 'dual_reward', effectValue: 100, icon: '🥂', category: 'economy' },
  { id: 'a12', name: 'Conscription', nameZh: '征兵令', description: 'Instantly train 500 troops', cooldown: 4, cost: 80, effectType: 'instant_army', effectValue: 500, icon: '🎖️', category: 'military' },
  { id: 'a13', name: 'Silk Road Boom', nameZh: '丝路繁荣', description: 'Triple silk trade profit for 1 turn', cooldown: 6, cost: 160, effectType: 'silk_bonus', effectValue: 3, icon: '🧵', category: 'trade' },
  { id: 'a14', name: 'Mystic Insight', nameZh: '天机', description: 'Reveal next treasure rarity', cooldown: 3, cost: 70, effectType: 'treasure_reveal', effectValue: 1, icon: '👁️', category: 'exploration' },
  { id: 'a15', name: 'War Drum', nameZh: '战鼓', description: 'Triple army strength for 1 battle', cooldown: 5, cost: 180, effectType: 'army_attack', effectValue: 3, icon: '🥁', category: 'military' },
  { id: 'a16', name: 'Tax Amnesty', nameZh: '免赋令', description: 'All provinces gain loyalty, +30 prosperity each', cooldown: 7, cost: 200, effectType: 'loyalty_boost', effectValue: 30, icon: '🕊️', category: 'province' },
  { id: 'a17', name: 'Artisan Festival', nameZh: '百工节', description: 'All structure upgrades cost 40% less for 2 turns', cooldown: 6, cost: 140, effectType: 'build_discount', effectValue: 0.4, icon: '🎪', category: 'building' },
  { id: 'a18', name: 'Pearl Diver', nameZh: '采珠人', description: 'Find a random rare or better treasure', cooldown: 8, cost: 300, effectType: 'rare_treasure', effectValue: 1, icon: '🤿', category: 'exploration' },
  { id: 'a19', name: 'Diplomatic Envoy', nameZh: '使节团', description: 'Improve all diplomatic relations by +15', cooldown: 5, cost: 100, effectType: 'diplomacy_boost', effectValue: 15, icon: '📮', category: 'diplomacy' },
  { id: 'a20', name: 'Granary Overflow', nameZh: '仓廪实', description: 'Sell surplus goods for 200 gold', cooldown: 3, cost: 40, effectType: 'sell_goods', effectValue: 200, icon: '🍚', category: 'economy' },
  { id: 'a21', name: 'Phoenix Rise', nameZh: '凤凰涅槃', description: 'Reset all ability cooldowns', cooldown: 10, cost: 500, effectType: 'reset_cooldowns', effectValue: 0, icon: '🔥', category: 'special' },
  { id: 'a22', name: 'Mandate Renewal', nameZh: '续天命', description: 'Double all income sources for 2 turns', cooldown: 9, cost: 400, effectType: 'double_income', effectValue: 2, icon: '☑️', category: 'special' },
];

// ─── Achievement Definitions (18) ─────────────────────────────────────────────

interface AchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  condition: string;
  reward: { gold: number; influence: number };
  icon: string;
}

const GD_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach01', name: 'First Steps', nameZh: '初出茅庐', description: 'Collect your first treasure', condition: 'treasures_collected >= 1', reward: { gold: 50, influence: 10 }, icon: '👣' },
  { id: 'ach02', name: 'Hoarder', nameZh: '藏宝家', description: 'Collect 10 treasures', condition: 'treasures_collected >= 10', reward: { gold: 200, influence: 40 }, icon: '📦' },
  { id: 'ach03', name: 'Treasure Emperor', nameZh: '宝藏帝王', description: 'Collect all 35 treasures', condition: 'treasures_collected >= 35', reward: { gold: 5000, influence: 1000 }, icon: '👑' },
  { id: 'ach04', name: 'Province Founder', nameZh: '开疆拓土', description: 'Expand to 3 provinces', condition: 'provinces_owned >= 3', reward: { gold: 300, influence: 60 }, icon: '🗺️' },
  { id: 'ach05', name: 'Continental', nameZh: '大陆霸主', description: 'Own all 8 provinces', condition: 'provinces_owned >= 8', reward: { gold: 3000, influence: 600 }, icon: '🌍' },
  { id: 'ach06', name: 'Master Builder', nameZh: '建筑大师', description: 'Upgrade any structure to level 10', condition: 'max_structure_level >= 10', reward: { gold: 500, influence: 100 }, icon: '🏗️' },
  { id: 'ach07', name: 'Palace Magnificence', nameZh: '宫殿华美', description: 'Build all 25 structures', condition: 'structures_built >= 25', reward: { gold: 2000, influence: 400 }, icon: '🏯' },
  { id: 'ach08', name: 'Silk Road King', nameZh: '丝路之王', description: 'Establish 10 trade routes', condition: 'trade_routes >= 10', reward: { gold: 800, influence: 150 }, icon: '🐪' },
  { id: 'ach09', name: 'Trade Mogul', nameZh: '贸易巨头', description: 'Accumulate 10,000 total gold earned', condition: 'total_gold >= 10000', reward: { gold: 1000, influence: 200 }, icon: '💰' },
  { id: 'ach10', name: 'Dragon Tamer', nameZh: '驯龙者', description: 'Train army to 5000 strength', condition: 'army_strength >= 5000', reward: { gold: 1500, influence: 300 }, icon: '🐉' },
  { id: 'ach11', name: 'Influential', nameZh: '德高望重', description: 'Reach 500 influence points', condition: 'influence >= 500', reward: { gold: 600, influence: 120 }, icon: '⭐' },
  { id: 'ach12', name: 'Legendary Collector', nameZh: '传奇收藏家', description: 'Own 5 legendary treasures', condition: 'legendary_treasures >= 5', reward: { gold: 3000, influence: 600 }, icon: '🌟' },
  { id: 'ach13', name: 'Diplomat', nameZh: '外交家', description: 'Forge 5 alliances', condition: 'alliances >= 5', reward: { gold: 700, influence: 200 }, icon: '🤝' },
  { id: 'ach14', name: 'Tax Season', nameZh: '收税季', description: 'Levy tax 20 times', condition: 'tax_levies >= 20', reward: { gold: 1000, influence: 150 }, icon: '🪙' },
  { id: 'ach15', name: 'Ability Master', nameZh: '术法大师', description: 'Activate 30 abilities', condition: 'abilities_used >= 30', reward: { gold: 1200, influence: 250 }, icon: '🔮' },
  { id: 'ach16', name: 'Prosperous Age', nameZh: '盛世', description: 'Reach 3000 dynasty prosperity', condition: 'prosperity >= 3000', reward: { gold: 4000, influence: 800 }, icon: '✨' },
  { id: 'ach17', name: 'Daily Devotee', nameZh: '勤勉之臣', description: 'Complete 7 daily trade tasks', condition: 'daily_tasks_completed >= 7', reward: { gold: 500, influence: 100 }, icon: '📅' },
  { id: 'ach18', name: 'Golden Ascension', nameZh: '金身飞升', description: 'Achieve the title of Golden Emperor', condition: 'title_index >= 7', reward: { gold: 10000, influence: 2000 }, icon: '🏅' },
];

// ─── State Interface Types ────────────────────────────────────────────────────

interface CollectedTreasure {
  id: string;
  collectedAt: number;
}

interface OwnedProvince {
  id: string;
  owned: boolean;
  prosperity: number;
  loyalty: number;
}

interface StructureState {
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
  fromProvince: string;
  toProvince: string;
  goodId: string;
  profit: number;
  active: boolean;
  establishedAt: number;
}

interface DiplomaticRelation {
  factionId: string;
  factionName: string;
  standing: number;
  maxStanding: number;
}

interface DailyTradeTask {
  id: string;
  description: string;
  targetGoodId: string;
  targetAmount: number;
  currentAmount: number;
  reward: { gold: number; influence: number };
  expiresAt: number;
  completed: boolean;
}

interface EventLogEntry {
  id: string;
  turnNumber: number;
  type: 'treasure' | 'province' | 'structure' | 'ability' | 'trade' | 'army' | 'tax' | 'diplomacy' | 'event' | 'achievement' | 'season' | 'daily';
  message: string;
  messageZh: string;
  goldChange: number;
  influenceChange: number;
  timestamp: number;
}

interface ActiveEvent {
  eventId: string;
  remainingTurns: number;
}

interface GoodPriceSnapshot {
  goodId: string;
  currentPrice: number;
  priceChange: number;
}

interface GoldDynastyState {
  treasures: CollectedTreasure[];
  provinces: OwnedProvince[];
  structures: StructureState[];
  abilities: AbilityState[];
  achievements: AchievementState[];
  currentProvince: string;
  treasuryGold: number;
  influencePoints: number;
  totalGoldEarned: number;
  tradeRoutes: TradeRoute[];
  armyStrength: number;
  titleIndex: number;
  dynastyProsperity: number;
  diplomaticRelations: DiplomaticRelation[];
  dailyTradeTask: DailyTradeTask | null;
  taxLevies: number;
  abilitiesUsed: number;
  alliancesForged: number;
  dailyTasksCompleted: number;
  turnCount: number;
  currentSeason: string;
  eventLog: EventLogEntry[];
  activeEvents: ActiveEvent[];
  goodPrices: GoodPriceSnapshot[];
}

// ─── Output Interface Types ───────────────────────────────────────────────────

interface GoldDynastyStats {
  totalTreasures: number;
  treasuresByRarity: Record<string, number>;
  provincesOwned: number;
  totalStructureLevels: number;
  maxStructureLevel: number;
  activeTradeRoutes: number;
  totalTradeProfit: number;
  armyStrength: number;
  currentTitle: string;
  currentTitleZh: string;
  dynastyProsperity: number;
  treasuryGold: number;
  influencePoints: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  turnCount: number;
  currentSeason: string;
  eventsHandled: number;
}

interface GoldDynastyProgress {
  nextTitle: { name: string; nameZh: string; progress: number; required: number };
  treasureCompletion: number;
  provinceCompletion: number;
  structureCompletion: number;
  achievementCompletion: number;
  overallCompletion: number;
}

interface MilitaryReadiness {
  level: string;
  label: string;
  labelZh: string;
  color: string;
  recommended: number;
  current: number;
}

interface TreasuryHealth {
  level: string;
  label: string;
  labelZh: string;
  color: string;
  surplus: number;
}

// ─── Diplomatic Factions ──────────────────────────────────────────────────────

const GD_FACTIONS = [
  { id: 'f01', name: 'Mongol Horde', nameZh: '蒙古部落', maxStanding: 100 },
  { id: 'f02', name: 'Persian Traders', nameZh: '波斯商人', maxStanding: 100 },
  { id: 'f03', name: 'Korean Kingdom', nameZh: '高丽王国', maxStanding: 100 },
  { id: 'f04', name: 'Vietnam Tribes', nameZh: '越族部落', maxStanding: 100 },
  { id: 'f05', name: 'Tibetan Monks', nameZh: '吐蕃僧侣', maxStanding: 100 },
  { id: 'f06', name: 'Japanese Shogunate', nameZh: '日本幕府', maxStanding: 100 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions (outside the hook)
// ═══════════════════════════════════════════════════════════════════════════════

function createInitialState(): GoldDynastyState {
  return {
    treasures: [],
    provinces: GD_PROVINCES.map(p => ({
      id: p.id,
      owned: p.id === 'p01',
      prosperity: p.id === 'p01' ? p.baseProsperity : 0,
      loyalty: p.id === 'p01' ? 100 : 0,
    })),
    structures: GD_STRUCTURES.map(s => ({
      id: s.id,
      level: 0,
    })),
    abilities: GD_ABILITIES.map(a => ({
      id: a.id,
      currentCooldown: 0,
      timesUsed: 0,
    })),
    achievements: GD_ACHIEVEMENTS.map(a => ({
      id: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    currentProvince: 'p01',
    treasuryGold: 500,
    influencePoints: 50,
    totalGoldEarned: 500,
    tradeRoutes: [],
    armyStrength: 200,
    titleIndex: 0,
    dynastyProsperity: 50,
    diplomaticRelations: GD_FACTIONS.map(f => ({
      factionId: f.id,
      factionName: f.name,
      standing: 30,
      maxStanding: f.maxStanding,
    })),
    dailyTradeTask: null,
    taxLevies: 0,
    abilitiesUsed: 0,
    alliancesForged: 0,
    dailyTasksCompleted: 0,
    turnCount: 0,
    currentSeason: GD_SEASON_SPRING,
    eventLog: [],
    activeEvents: [],
    goodPrices: GD_TRADE_GOODS.map(g => ({
      goodId: g.id,
      currentPrice: g.basePrice,
      priceChange: 0,
    })),
  };
}

function rollTreasureRarity(): string {
  const roll = Math.random() * 100;
  if (roll < 35) return GD_RARITY_COMMON;
  if (roll < 60) return GD_RARITY_UNCOMMON;
  if (roll < 80) return GD_RARITY_RARE;
  if (roll < 94) return GD_RARITY_EPIC;
  return GD_RARITY_LEGENDARY;
}

function generateDailyTask(): DailyTradeTask {
  const good = GD_TRADE_GOODS[Math.floor(Math.random() * GD_TRADE_GOODS.length)];
  const amount = Math.floor(Math.random() * 5) + 3;
  const goldReward = amount * good.basePrice * 2 + Math.floor(Math.random() * 100) + 50;
  const influenceReward = amount * 3 + Math.floor(Math.random() * 10) + 5;
  const now = Date.now();
  return {
    id: `task_${now}`,
    description: `Trade ${amount} units of ${good.nameZh} (${good.name})`,
    targetGoodId: good.id,
    targetAmount: amount,
    currentAmount: 0,
    reward: { gold: goldReward, influence: influenceReward },
    expiresAt: now + 24 * 60 * 60 * 1000,
    completed: false,
  };
}

function calculateUpgradeCost(structureDef: StructureDef, currentLevel: number): number {
  return Math.floor(structureDef.baseCost * Math.pow(structureDef.costMultiplier, currentLevel));
}

function calculateTradeProfit(good: TradeGoodDef, distance: number): number {
  const base = good.basePrice * (1 + good.volatility * (Math.random() - 0.5));
  return Math.floor(base * distance * 0.5 + good.basePrice);
}

function calculateDynastyProsperity(
  provinces: OwnedProvince[],
  structures: StructureState[],
  treasures: CollectedTreasure[],
): number {
  let prosperity = 0;
  for (const province of provinces) {
    if (province.owned) {
      prosperity += province.prosperity;
    }
  }
  for (const struct of structures) {
    const def = GD_STRUCTURES.find(s => s.id === struct.id);
    if (def && struct.level > 0) {
      prosperity += def.prosperityPerLevel * struct.level;
    }
  }
  for (const treasure of treasures) {
    const def = GD_TREASURES.find(t => t.id === treasure.id);
    if (def) {
      const multiplier = GD_RARITY_MULTIPLIER[def.rarity] || 1;
      prosperity += Math.floor(multiplier * 2);
    }
  }
  return prosperity;
}

function determineTitleIndex(prosperity: number): number {
  for (let i = GD_TITLES.length - 1; i >= 0; i--) {
    if (prosperity >= GD_TITLES[i].minProsperity) return i;
  }
  return 0;
}

function evaluateAchievements(state: GoldDynastyState): AchievementState[] {
  const metrics: Record<string, number> = {
    treasures_collected: state.treasures.length,
    provinces_owned: state.provinces.filter(p => p.owned).length,
    max_structure_level: Math.max(...state.structures.map(s => s.level)),
    structures_built: state.structures.filter(s => s.level > 0).length,
    trade_routes: state.tradeRoutes.filter(r => r.active).length,
    total_gold: state.totalGoldEarned,
    army_strength: state.armyStrength,
    influence: state.influencePoints,
    legendary_treasures: state.treasures.filter(tid => {
      const def = GD_TREASURES.find(t => t.id === tid.id);
      return def && def.rarity === GD_RARITY_LEGENDARY;
    }).length,
    alliances: state.alliancesForged,
    tax_levies: state.taxLevies,
    abilities_used: state.abilitiesUsed,
    prosperity: state.dynastyProsperity,
    daily_tasks_completed: state.dailyTasksCompleted,
    title_index: state.titleIndex,
  };

  return state.achievements.map(ach => {
    if (ach.unlocked) return ach;
    const def = GD_ACHIEVEMENTS.find(a => a.id === ach.id);
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

function advanceSeason(currentSeason: string): string {
  const order = [GD_SEASON_SPRING, GD_SEASON_SUMMER, GD_SEASON_AUTUMN, GD_SEASON_WINTER];
  const idx = order.indexOf(currentSeason);
  return order[(idx + 1) % order.length];
}

function fluctuateGoodPrices(prices: GoodPriceSnapshot[]): GoodPriceSnapshot[] {
  return prices.map(gp => {
    const good = GD_TRADE_GOODS.find(g => g.id === gp.goodId);
    if (!good) return gp;
    const change = good.basePrice * good.volatility * (Math.random() - 0.5) * 2;
    const newPrice = Math.max(
      Math.floor(good.basePrice * 0.3),
      Math.floor(good.basePrice * 2.5),
    );
    const clampedPrice = Math.max(
      Math.floor(good.basePrice * 0.3),
      Math.min(newPrice, Math.floor(gp.currentPrice + change)),
    );
    return { goodId: gp.goodId, currentPrice: clampedPrice, priceChange: clampedPrice - gp.currentPrice };
  });
}

function rollDynastyEvent(): DynastyEventDef | null {
  const roll = Math.random();
  let cumulative = 0;
  for (const evt of GD_DYNASTY_EVENTS) {
    cumulative += evt.probability;
    if (roll < cumulative) return evt;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export default function useGoldDynasty() {
  const [state, setState] = useState<GoldDynastyState>(createInitialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Generate daily task if none exists or expired
  useEffect(() => {
    const now = Date.now();
    if (!state.dailyTradeTask || (state.dailyTradeTask.expiresAt < now && !state.dailyTradeTask.completed)) {
      setState(prev => ({ ...prev, dailyTradeTask: generateDailyTask() }));
    }
  }, [state.dailyTradeTask, state.turnCount]);

  // ─── Internal: log event to event log ──────────────────────────────────
  const logEvent = useCallback((
    type: EventLogEntry['type'],
    message: string,
    messageZh: string,
    goldChange: number,
    influenceChange: number,
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
          influenceChange,
          timestamp: Date.now(),
        },
      ],
    }));
  }, []);

  // ─── Internal: recalculate prosperity and title ────────────────────────
  const recalcProsperity = useCallback((
    provinces: OwnedProvince[],
    structures: StructureState[],
    treasures: CollectedTreasure[],
  ): { prosperity: number; titleIndex: number } => {
    const prosperity = calculateDynastyProsperity(provinces, structures, treasures);
    const titleIndex = determineTitleIndex(prosperity);
    return { prosperity, titleIndex };
  }, []);

  // ─── Collect Treasure ──────────────────────────────────────────────────
  const collectTreasure = useCallback(() => {
    setState(prev => {
      const alreadyCollected = new Set(prev.treasures.map(t => t.id));
      const rarity = rollTreasureRarity();
      const candidates = GD_TREASURES.filter(t => t.rarity === rarity && !alreadyCollected.has(t.id));

      let chosen: TreasureDef;
      if (candidates.length > 0) {
        chosen = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        const anyUncollected = GD_TREASURES.filter(t => !alreadyCollected.has(t.id));
        if (anyUncollected.length === 0) return prev;
        chosen = anyUncollected[Math.floor(Math.random() * anyUncollected.length)];
      }

      return {
        ...prev,
        treasuryGold: prev.treasuryGold + chosen.goldValue,
        influencePoints: prev.influencePoints + chosen.influenceValue,
        totalGoldEarned: prev.totalGoldEarned + chosen.goldValue,
        treasures: [...prev.treasures, { id: chosen.id, collectedAt: Date.now() }],
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'treasure' as const,
            message: `Collected ${chosen.name} (${chosen.rarity})`,
            messageZh: `获得${chosen.nameZh}（${GD_RARITY_LABELS[chosen.rarity]?.zh ?? ''}）`,
            goldChange: chosen.goldValue,
            influenceChange: chosen.influenceValue,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Expand Province ───────────────────────────────────────────────────
  const expandProvince = useCallback((provinceId: string) => {
    setState(prev => {
      const provinceState = prev.provinces.find(p => p.id === provinceId);
      const provinceDef = GD_PROVINCES.find(p => p.id === provinceId);
      if (!provinceState || !provinceDef || provinceState.owned) return prev;
      if (prev.treasuryGold < provinceDef.expansionCost) return prev;

      const updatedProvinces = prev.provinces.map(p =>
        p.id === provinceId ? { ...p, owned: true, prosperity: provinceDef.baseProsperity, loyalty: 80 } : p
      );
      const { prosperity, titleIndex } = recalcProsperity(updatedProvinces, prev.structures, prev.treasures);

      return {
        ...prev,
        provinces: updatedProvinces,
        treasuryGold: prev.treasuryGold - provinceDef.expansionCost,
        dynastyProsperity: prosperity,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'province' as const,
            message: `Expanded into ${provinceDef.name}`,
            messageZh: `开拓${provinceDef.nameZh}`,
            goldChange: -provinceDef.expansionCost,
            influenceChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcProsperity]);

  // ─── Upgrade Structure ─────────────────────────────────────────────────
  const upgradeStructure = useCallback((structureId: string) => {
    setState(prev => {
      const structState = prev.structures.find(s => s.id === structureId);
      const structDef = GD_STRUCTURES.find(s => s.id === structureId);
      if (!structState || !structDef || structState.level >= structDef.maxLevel) return prev;

      const cost = calculateUpgradeCost(structDef, structState.level);
      if (prev.treasuryGold < cost) return prev;

      const updatedStructures = prev.structures.map(s =>
        s.id === structureId ? { ...s, level: s.level + 1 } : s
      );
      const { prosperity, titleIndex } = recalcProsperity(prev.provinces, updatedStructures, prev.treasures);

      return {
        ...prev,
        structures: updatedStructures,
        treasuryGold: prev.treasuryGold - cost,
        dynastyProsperity: prosperity,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'structure' as const,
            message: `Upgraded ${structDef.name} to Lv${structState.level + 1}`,
            messageZh: `${structDef.nameZh}升级至${structState.level + 1}级`,
            goldChange: -cost,
            influenceChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcProsperity]);

  // ─── Activate Ability ──────────────────────────────────────────────────
  const activateAbility = useCallback((abilityId: string) => {
    setState(prev => {
      const abilityState = prev.abilities.find(a => a.id === abilityId);
      const abilityDef = GD_ABILITIES.find(a => a.id === abilityId);
      if (!abilityState || !abilityDef || abilityState.currentCooldown > 0) return prev;
      if (prev.treasuryGold < abilityDef.cost) return prev;

      let goldChange = -abilityDef.cost;
      let influenceChange = 0;
      let armyChange = 0;
      let prosperityChange = 0;

      switch (abilityDef.effectType) {
        case 'instant_gold':
          goldChange += abilityDef.effectValue;
          break;
        case 'instant_influence':
          influenceChange = abilityDef.effectValue;
          break;
        case 'instant_army':
          armyChange = abilityDef.effectValue;
          break;
        case 'province_prosperity':
          prosperityChange = abilityDef.effectValue;
          break;
        case 'dual_reward':
          goldChange += 100;
          influenceChange = 30;
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

      let updatedProvinces = prev.provinces;
      if (prosperityChange > 0) {
        updatedProvinces = prev.provinces.map(p =>
          p.owned ? { ...p, prosperity: p.prosperity + prosperityChange } : p
        );
      }

      const { prosperity, titleIndex } = recalcProsperity(updatedProvinces, prev.structures, prev.treasures);

      return {
        ...prev,
        abilities: tickCooldowns(updatedAbilities),
        treasuryGold: prev.treasuryGold + goldChange,
        influencePoints: prev.influencePoints + influenceChange,
        armyStrength: prev.armyStrength + armyChange,
        provinces: updatedProvinces,
        dynastyProsperity: prosperity,
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
            influenceChange,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcProsperity]);

  // ─── Establish Trade Route ─────────────────────────────────────────────
  const establishTrade = useCallback((fromProvince: string, toProvince: string, goodId: string) => {
    setState(prev => {
      if (fromProvince === toProvince) return prev;
      const fromOwned = prev.provinces.find(p => p.id === fromProvince)?.owned;
      const toOwned = prev.provinces.find(p => p.id === toProvince)?.owned;
      if (!fromOwned || !toOwned) return prev;

      const good = GD_TRADE_GOODS.find(g => g.id === goodId);
      if (!good) return prev;

      const establishmentCost = Math.floor(good.basePrice * 2);
      if (prev.treasuryGold < establishmentCost) return prev;

      const exists = prev.tradeRoutes.some(
        r => r.fromProvince === fromProvince && r.toProvince === toProvince && r.goodId === goodId && r.active
      );
      if (exists) return prev;

      const fromIdx = GD_PROVINCES.findIndex(p => p.id === fromProvince);
      const toIdx = GD_PROVINCES.findIndex(p => p.id === toProvince);
      const distance = Math.abs(fromIdx - toIdx);
      const profit = calculateTradeProfit(good, distance + 1);

      const newRoute: TradeRoute = {
        id: makeTradeRouteId(),
        fromProvince,
        toProvince,
        goodId,
        profit,
        active: true,
        establishedAt: Date.now(),
      };

      const fromDef = GD_PROVINCES.find(p => p.id === fromProvince);
      const toDef = GD_PROVINCES.find(p => p.id === toProvince);

      return {
        ...prev,
        tradeRoutes: [...prev.tradeRoutes, newRoute],
        treasuryGold: prev.treasuryGold - establishmentCost,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'trade' as const,
            message: `Trade route: ${fromDef?.name} → ${toDef?.name} (${good.name}, ${profit}/turn)`,
            messageZh: `商路：${fromDef?.nameZh} → ${toDef?.nameZh}（${good.nameZh}，${profit}金/回合）`,
            goldChange: -establishmentCost,
            influenceChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Train Army ────────────────────────────────────────────────────────
  const trainArmy = useCallback((troops: number) => {
    setState(prev => {
      const costPerTroop = 2;
      const totalCost = troops * costPerTroop;
      if (prev.treasuryGold < totalCost || troops <= 0) return prev;

      return {
        ...prev,
        treasuryGold: prev.treasuryGold - totalCost,
        armyStrength: prev.armyStrength + troops,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'army' as const,
            message: `Trained ${troops} troops (-${totalCost} gold)`,
            messageZh: `训练${troops}名士兵（-${totalCost}金）`,
            goldChange: -totalCost,
            influenceChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Build Palace (build + first level) ────────────────────────────────
  const buildPalace = useCallback((structureId: string) => {
    setState(prev => {
      const structState = prev.structures.find(s => s.id === structureId);
      const structDef = GD_STRUCTURES.find(s => s.id === structureId);
      if (!structState || !structDef || structState.level > 0) return prev;
      if (prev.treasuryGold < structDef.baseCost) return prev;

      const updatedStructures = prev.structures.map(s =>
        s.id === structureId ? { ...s, level: 1 } : s
      );
      const { prosperity, titleIndex } = recalcProsperity(prev.provinces, updatedStructures, prev.treasures);

      return {
        ...prev,
        structures: updatedStructures,
        treasuryGold: prev.treasuryGold - structDef.baseCost,
        dynastyProsperity: prosperity,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'structure' as const,
            message: `Built ${structDef.name} (Lv1)`,
            messageZh: `建造${structDef.nameZh}（1级）`,
            goldChange: -structDef.baseCost,
            influenceChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcProsperity]);

  // ─── Forge Alliance ────────────────────────────────────────────────────
  const forgeAlliance = useCallback((factionId: string) => {
    setState(prev => {
      const relation = prev.diplomaticRelations.find(r => r.factionId === factionId);
      if (!relation || relation.standing >= 80) return prev;

      const allianceCost = Math.floor((100 - relation.standing) * 5);
      if (prev.treasuryGold < allianceCost) return prev;

      const standingGain = 20;
      const updatedRelations = prev.diplomaticRelations.map(r =>
        r.factionId === factionId
          ? { ...r, standing: Math.min(r.maxStanding, r.standing + standingGain) }
          : r
      );

      let allianceCount = prev.alliancesForged;
      const newStanding = Math.min(relation.maxStanding, relation.standing + standingGain);
      if (newStanding >= 80 && relation.standing < 80) {
        allianceCount += 1;
      }

      return {
        ...prev,
        diplomaticRelations: updatedRelations,
        treasuryGold: prev.treasuryGold - allianceCost,
        alliancesForged: allianceCount,
        influencePoints: prev.influencePoints + 15,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'diplomacy' as const,
            message: `Improved relations with ${relation.factionName} (+${standingGain} standing)`,
            messageZh: `改善与${relation.factionName}的关系（+${standingGain}好感）`,
            goldChange: -allianceCost,
            influenceChange: 15,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Levy Tax ──────────────────────────────────────────────────────────
  const levyTax = useCallback(() => {
    setState(prev => {
      const ownedProvinces = prev.provinces.filter(p => p.owned);
      if (ownedProvinces.length === 0) return prev;

      const seasonDef = GD_SEASONS.find(s => s.id === prev.currentSeason);
      const taxMod = seasonDef?.taxMod ?? 1;

      const baseTax = ownedProvinces.length * 25;
      const loyaltyBonus = ownedProvinces.reduce((sum, p) => sum + Math.floor(p.loyalty * 0.1), 0);
      const structureBonus = prev.structures.find(s => s.id === 's02')?.level ?? 0;
      const totalTax = Math.floor((baseTax + loyaltyBonus + structureBonus * 15) * taxMod);

      const updatedProvinces = prev.provinces.map(p =>
        p.owned ? { ...p, loyalty: Math.max(0, p.loyalty - 3) } : p
      );

      return {
        ...prev,
        provinces: updatedProvinces,
        treasuryGold: prev.treasuryGold + totalTax,
        totalGoldEarned: prev.totalGoldEarned + totalTax,
        taxLevies: prev.taxLevies + 1,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'tax' as const,
            message: `Levied tax: +${totalTax} gold (${seasonDef?.nameZh} modifier: x${taxMod})`,
            messageZh: `征税：+${totalTax}金（${seasonDef?.nameZh}系数：x${taxMod}）`,
            goldChange: totalTax,
            influenceChange: 0,
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
      let influenceReward = 0;

      const newEntries: EventLogEntry[] = [];
      for (let i = 0; i < newAchievements.length; i++) {
        if (newAchievements[i].unlocked && !prev.achievements[i].unlocked) {
          const def = GD_ACHIEVEMENTS.find(a => a.id === newAchievements[i].id);
          if (def) {
            goldReward += def.reward.gold;
            influenceReward += def.reward.influence;
            newEntries.push({
              id: makeEventLogId(),
              turnNumber: prev.turnCount,
              type: 'achievement' as const,
              message: `Achievement unlocked: ${def.name}!`,
              messageZh: `成就解锁：${def.nameZh}！`,
              goldChange: def.reward.gold,
              influenceChange: def.reward.influence,
              timestamp: Date.now(),
            });
          }
        }
      }

      return {
        ...prev,
        achievements: newAchievements,
        treasuryGold: prev.treasuryGold + goldReward,
        influencePoints: prev.influencePoints + influenceReward,
        totalGoldEarned: prev.totalGoldEarned + goldReward,
        eventLog: [...prev.eventLog.slice(-(200 - newEntries.length)), ...newEntries],
      };
    });
  }, []);

  // ─── Complete Daily Trade Task ─────────────────────────────────────────
  const completeDailyTradeTask = useCallback(() => {
    setState(prev => {
      if (!prev.dailyTradeTask || prev.dailyTradeTask.completed) return prev;
      if (prev.dailyTradeTask.currentAmount < prev.dailyTradeTask.targetAmount) return prev;

      return {
        ...prev,
        dailyTradeTask: { ...prev.dailyTradeTask, completed: true },
        treasuryGold: prev.treasuryGold + prev.dailyTradeTask.reward.gold,
        influencePoints: prev.influencePoints + prev.dailyTradeTask.reward.influence,
        totalGoldEarned: prev.totalGoldEarned + prev.dailyTradeTask.reward.gold,
        dailyTasksCompleted: prev.dailyTasksCompleted + 1,
        turnCount: prev.turnCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            turnNumber: prev.turnCount,
            type: 'daily' as const,
            message: `Daily task completed!`,
            messageZh: `每日贸易任务完成！`,
            goldChange: prev.dailyTradeTask.reward.gold,
            influenceChange: prev.dailyTradeTask.reward.influence,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Contribute to Daily Task ──────────────────────────────────────────
  const contributeToTask = useCallback((amount: number) => {
    setState(prev => {
      if (!prev.dailyTradeTask || prev.dailyTradeTask.completed) return prev;
      const newAmount = Math.min(
        prev.dailyTradeTask.targetAmount,
        prev.dailyTradeTask.currentAmount + amount,
      );
      return { ...prev, dailyTradeTask: { ...prev.dailyTradeTask, currentAmount: newAmount } };
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

  // ─── Set Current Province ──────────────────────────────────────────────
  const setCurrentProvince = useCallback((provinceId: string) => {
    setState(prev => {
      const province = prev.provinces.find(p => p.id === provinceId);
      if (!province || !province.owned) return prev;
      return { ...prev, currentProvince: provinceId };
    });
  }, []);

  // ─── Advance Turn (the main game tick) ─────────────────────────────────
  const advanceTurn = useCallback(() => {
    setState(prev => {
      // Trade income
      const tradeIncome = prev.tradeRoutes
        .filter(r => r.active)
        .reduce((sum, r) => sum + r.profit, 0);

      // Recover loyalty
      const updatedProvinces = prev.provinces.map(p =>
        p.owned ? { ...p, loyalty: Math.min(100, p.loyalty + 2) } : p
      );

      // Tick ability cooldowns
      const tickedAbilities = tickCooldowns(prev.abilities);

      // Advance season every 10 turns
      const newSeason = prev.turnCount > 0 && (prev.turnCount + 1) % 10 === 0
        ? advanceSeason(prev.currentSeason)
        : prev.currentSeason;

      // Tick active events
      const remainingEvents = prev.activeEvents
        .map(e => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
        .filter(e => e.remainingTurns > 0);

      // Fluctuate good prices
      const newPrices = fluctuateGoodPrices(prev.goodPrices);

      // Recalculate prosperity
      const { prosperity, titleIndex } = recalcProsperity(updatedProvinces, prev.structures, prev.treasures);

      // Evaluate achievements
      const checkedAchievements = evaluateAchievements({
        ...prev,
        provinces: updatedProvinces,
        dynastyProsperity: prosperity,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
      });

      // Award new achievement rewards
      let achGold = 0;
      let achInfluence = 0;
      const achLogEntries: EventLogEntry[] = [];
      for (let i = 0; i < checkedAchievements.length; i++) {
        if (checkedAchievements[i].unlocked && !prev.achievements[i].unlocked) {
          const def = GD_ACHIEVEMENTS.find(a => a.id === checkedAchievements[i].id);
          if (def) {
            achGold += def.reward.gold;
            achInfluence += def.reward.influence;
            achLogEntries.push({
              id: makeEventLogId(),
              turnNumber: prev.turnCount + 1,
              type: 'achievement' as const,
              message: `Achievement: ${def.name}!`,
              messageZh: `成就：${def.nameZh}！`,
              goldChange: def.reward.gold,
              influenceChange: def.reward.influence,
              timestamp: Date.now(),
            });
          }
        }
      }

      // Roll dynasty event
      const dynEvent = rollDynastyEvent();
      let evtGold = 0;
      let evtInfluence = 0;
      let evtProsperityChange = 0;
      let evtArmyChange = 0;
      const evtLogEntry: EventLogEntry | null = null;

      if (dynEvent) {
        switch (dynEvent.effectType) {
          case 'gold_bonus': evtGold = dynEvent.effectValue; break;
          case 'gold_loss': evtGold = -dynEvent.effectValue; break;
          case 'influence_gain': evtInfluence = dynEvent.effectValue; break;
          case 'prosperity_boost': evtProsperityChange = dynEvent.effectValue; break;
          case 'prosperity_loss': evtProsperityChange = -dynEvent.effectValue; break;
          case 'army_loss': evtArmyChange = -dynEvent.effectValue; break;
          case 'army_gain': evtArmyChange = dynEvent.effectValue; break;
          case 'diplomacy_boost': evtInfluence = dynEvent.effectValue; break;
          default: break;
        }
      }

      let finalProvinces = updatedProvinces;
      if (evtProsperityChange !== 0) {
        finalProvinces = updatedProvinces.map(p =>
          p.owned ? { ...p, prosperity: Math.max(0, p.prosperity + evtProsperityChange) } : p
        );
      }

      const finalProsperity = prosperity + evtProsperityChange;

      // Build event log
      const turnLogs: EventLogEntry[] = [];

      if (newSeason !== prev.currentSeason) {
        const seasonDef = GD_SEASONS.find(s => s.id === newSeason);
        turnLogs.push({
          id: makeEventLogId(),
          turnNumber: prev.turnCount + 1,
          type: 'season' as const,
          message: `Season changed to ${seasonDef?.name}`,
          messageZh: `季节变为${seasonDef?.nameZh}`,
          goldChange: 0,
          influenceChange: 0,
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
          influenceChange: 0,
          timestamp: Date.now(),
        });
      }

      if (dynEvent && evtLogEntry) {
        turnLogs.push(evtLogEntry);
      } else if (dynEvent) {
        turnLogs.push({
          id: makeEventLogId(),
          turnNumber: prev.turnCount + 1,
          type: 'event' as const,
          message: `Event: ${dynEvent.name} — ${dynEvent.description}`,
          messageZh: `事件：${dynEvent.nameZh} — ${dynEvent.description}`,
          goldChange: evtGold,
          influenceChange: evtInfluence,
          timestamp: Date.now(),
        });
      }

      if (dynEvent && dynEvent.duration > 0) {
        remainingEvents.push({ eventId: dynEvent.id, remainingTurns: dynEvent.duration });
      }

      return {
        ...prev,
        provinces: finalProvinces,
        abilities: tickedAbilities,
        achievements: checkedAchievements,
        currentSeason: newSeason,
        activeEvents: remainingEvents,
        goodPrices: newPrices,
        treasuryGold: prev.treasuryGold + tradeIncome + achGold + evtGold,
        influencePoints: prev.influencePoints + achInfluence + evtInfluence,
        armyStrength: Math.max(0, prev.armyStrength + evtArmyChange),
        totalGoldEarned: prev.totalGoldEarned + tradeIncome + achGold + Math.max(0, evtGold),
        dynastyProsperity: finalProsperity,
        titleIndex: Math.max(prev.titleIndex, determineTitleIndex(finalProsperity)),
        turnCount: prev.turnCount + 1,
        eventLog: [...prev.eventLog.slice(-(200 - turnLogs.length - achLogEntries.length)), ...turnLogs, ...achLogEntries],
      };
    });
  }, [recalcProsperity]);

  // ─── Get Title ─────────────────────────────────────────────────────────
  const getTitle = useCallback((): { name: string; nameZh: string; icon: string; index: number } => {
    const title = GD_TITLES[state.titleIndex] || GD_TITLES[0];
    return { name: title.name, nameZh: title.nameZh, icon: title.icon, index: state.titleIndex };
  }, [state.titleIndex]);

  // ─── Get Progress ──────────────────────────────────────────────────────
  const getProgress = useCallback((): GoldDynastyProgress => {
    const currentTitle = GD_TITLES[state.titleIndex];
    const nextTitleDef = GD_TITLES[state.titleIndex + 1];

    const treasureCompletion = state.treasures.length / GD_TREASURES.length;
    const provinceCompletion = state.provinces.filter(p => p.owned).length / GD_PROVINCES.length;
    const structureCompletion = state.structures.filter(s => s.level > 0).length / GD_STRUCTURES.length;
    const achievementCompletion = state.achievements.filter(a => a.unlocked).length / GD_ACHIEVEMENTS.length;

    let nextTitle: GoldDynastyProgress['nextTitle'];
    if (nextTitleDef) {
      const prevThreshold = currentTitle.minProsperity;
      const nextThreshold = nextTitleDef.minProsperity;
      const progress = Math.min(1, (state.dynastyProsperity - prevThreshold) / (nextThreshold - prevThreshold));
      nextTitle = { name: nextTitleDef.name, nameZh: nextTitleDef.nameZh, progress, required: nextThreshold };
    } else {
      nextTitle = { name: currentTitle.name, nameZh: currentTitle.nameZh, progress: 1, required: currentTitle.minProsperity };
    }

    const overallCompletion = (
      treasureCompletion * 0.25 +
      provinceCompletion * 0.2 +
      structureCompletion * 0.2 +
      achievementCompletion * 0.2 +
      nextTitle.progress * 0.15
    );

    return {
      nextTitle,
      treasureCompletion,
      provinceCompletion,
      structureCompletion,
      achievementCompletion,
      overallCompletion: Math.min(1, overallCompletion),
    };
  }, [state]);

  // ─── Get Stats ─────────────────────────────────────────────────────────
  const getStats = useCallback((): GoldDynastyStats => {
    const treasuresByRarity: Record<string, number> = {
      [GD_RARITY_COMMON]: 0,
      [GD_RARITY_UNCOMMON]: 0,
      [GD_RARITY_RARE]: 0,
      [GD_RARITY_EPIC]: 0,
      [GD_RARITY_LEGENDARY]: 0,
    };
    for (const t of state.treasures) {
      const def = GD_TREASURES.find(td => td.id === t.id);
      if (def) treasuresByRarity[def.rarity] = (treasuresByRarity[def.rarity] || 0) + 1;
    }
    const title = GD_TITLES[state.titleIndex] || GD_TITLES[0];
    return {
      totalTreasures: state.treasures.length,
      treasuresByRarity,
      provincesOwned: state.provinces.filter(p => p.owned).length,
      totalStructureLevels: state.structures.reduce((sum, s) => sum + s.level, 0),
      maxStructureLevel: Math.max(0, ...state.structures.map(s => s.level)),
      activeTradeRoutes: state.tradeRoutes.filter(r => r.active).length,
      totalTradeProfit: state.tradeRoutes.filter(r => r.active).reduce((sum, r) => sum + r.profit, 0),
      armyStrength: state.armyStrength,
      currentTitle: title.name,
      currentTitleZh: title.nameZh,
      dynastyProsperity: state.dynastyProsperity,
      treasuryGold: state.treasuryGold,
      influencePoints: state.influencePoints,
      achievementsUnlocked: state.achievements.filter(a => a.unlocked).length,
      achievementsTotal: GD_ACHIEVEMENTS.length,
      turnCount: state.turnCount,
      currentSeason: state.currentSeason,
      eventsHandled: state.activeEvents.length,
    };
  }, [state]);

  // ═══════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES (useMemo)
  // ═══════════════════════════════════════════════════════════════════════

  const enrichedTreasures = useMemo(() => {
    return state.treasures.map(ct => {
      const def = GD_TREASURES.find(t => t.id === ct.id);
      if (!def) return null;
      return {
        ...ct,
        ...def,
        rarityColor: GD_RARITY_COLORS[def.rarity] || '#999',
        rarityMultiplier: GD_RARITY_MULTIPLIER[def.rarity] || 1,
        rarityLabel: GD_RARITY_LABELS[def.rarity] || { en: 'Unknown', zh: '未知' },
      };
    }).filter(Boolean) as (CollectedTreasure & TreasureDef & { rarityColor: string; rarityMultiplier: number; rarityLabel: { en: string; zh: string } })[];
  }, [state.treasures]);

  const enrichedProvinces = useMemo(() => {
    return state.provinces.map(ps => {
      const def = GD_PROVINCES.find(p => p.id === ps.id);
      if (!def) return null;
      return { ...ps, ...def };
    }).filter(Boolean) as (OwnedProvince & ProvinceDef)[];
  }, [state.provinces]);

  const enrichedStructures = useMemo(() => {
    return state.structures.map(ss => {
      const def = GD_STRUCTURES.find(s => s.id === ss.id);
      if (!def) return null;
      const upgradeCost = ss.level < def.maxLevel ? calculateUpgradeCost(def, ss.level) : 0;
      return { ...ss, ...def, upgradeCost, canUpgrade: ss.level < def.maxLevel };
    }).filter(Boolean) as (StructureState & StructureDef & { upgradeCost: number; canUpgrade: boolean })[];
  }, [state.structures]);

  const enrichedAbilities = useMemo(() => {
    return state.abilities.map(as => {
      const def = GD_ABILITIES.find(a => a.id === as.id);
      if (!def) return null;
      return { ...as, ...def, isReady: as.currentCooldown === 0 };
    }).filter(Boolean) as (AbilityState & AbilityDef & { isReady: boolean })[];
  }, [state.abilities]);

  const enrichedAchievements = useMemo(() => {
    return state.achievements.map(achs => {
      const def = GD_ACHIEVEMENTS.find(a => a.id === achs.id);
      if (!def) return null;
      return { ...achs, ...def };
    }).filter(Boolean) as (AchievementState & AchievementDef)[];
  }, [state.achievements]);

  const enrichedTradeRoutes = useMemo(() => {
    return state.tradeRoutes.map(tr => {
      const fromDef = GD_PROVINCES.find(p => p.id === tr.fromProvince);
      const toDef = GD_PROVINCES.find(p => p.id === tr.toProvince);
      const goodDef = GD_TRADE_GOODS.find(g => g.id === tr.goodId);
      return {
        ...tr,
        fromName: fromDef?.name ?? 'Unknown',
        fromNameZh: fromDef?.nameZh ?? '未知',
        toName: toDef?.name ?? 'Unknown',
        toNameZh: toDef?.nameZh ?? '未知',
        goodName: goodDef?.name ?? 'Unknown',
        goodNameZh: goodDef?.nameZh ?? '未知',
        goodIcon: goodDef?.icon ?? '📦',
      };
    });
  }, [state.tradeRoutes]);

  const enrichedGoodPrices = useMemo(() => {
    return state.goodPrices.map(gp => {
      const good = GD_TRADE_GOODS.find(g => g.id === gp.goodId);
      if (!good) return null;
      const categoryLabel = GD_GOOD_CATEGORY_LABELS[good.category];
      return { ...gp, ...good, categoryLabel };
    }).filter(Boolean) as (GoodPriceSnapshot & TradeGoodDef & { categoryLabel: { en: string; zh: string; icon: string } })[];
  }, [state.goodPrices]);

  const currentSeasonDef = useMemo(() => {
    return GD_SEASONS.find(s => s.id === state.currentSeason) ?? GD_SEASONS[0];
  }, [state.currentSeason]);

  const availableTreasuresByRarity = useMemo(() => {
    const collectedIds = new Set(state.treasures.map(t => t.id));
    const result: Record<string, number> = {};
    for (const rarity of [GD_RARITY_COMMON, GD_RARITY_UNCOMMON, GD_RARITY_RARE, GD_RARITY_EPIC, GD_RARITY_LEGENDARY]) {
      result[rarity] = GD_TREASURES.filter(t => t.rarity === rarity && !collectedIds.has(t.id)).length;
    }
    return result;
  }, [state.treasures]);

  const tradeIncomePerTurn = useMemo(() => {
    return state.tradeRoutes.filter(r => r.active).reduce((sum, r) => sum + r.profit, 0);
  }, [state.tradeRoutes]);

  const structureProsperityBonus = useMemo(() => {
    return state.structures.reduce((sum, s) => {
      const def = GD_STRUCTURES.find(sd => sd.id === s.id);
      return sum + (def ? def.prosperityPerLevel * s.level : 0);
    }, 0);
  }, [state.structures]);

  const treasureProsperityBonus = useMemo(() => {
    return state.treasures.reduce((sum, t) => {
      const def = GD_TREASURES.find(td => td.id === t.id);
      return sum + (def ? (GD_RARITY_MULTIPLIER[def.rarity] || 1) * 2 : 0);
    }, 0);
  }, [state.treasures]);

  const provinceProsperityTotal = useMemo(() => {
    return state.provinces.filter(p => p.owned).reduce((sum, p) => sum + p.prosperity, 0);
  }, [state.provinces]);

  const militaryReadiness = useMemo((): MilitaryReadiness => {
    const ownedProvinces = state.provinces.filter(p => p.owned).length;
    const recommended = ownedProvinces * 500;
    const ratio = state.armyStrength / Math.max(1, recommended);
    if (ratio >= 2) return { level: 'overwhelming', label: 'Overwhelming Force', labelZh: '压倒性兵力', color: GD_COLOR_GOLD, recommended, current: state.armyStrength };
    if (ratio >= 1.2) return { level: 'strong', label: 'Strong Garrison', labelZh: '兵力充沛', color: GD_COLOR_JADE_GREEN, recommended, current: state.armyStrength };
    if (ratio >= 0.8) return { level: 'adequate', label: 'Adequate Defense', labelZh: '防御尚可', color: GD_COLOR_BRONZE, recommended, current: state.armyStrength };
    if (ratio >= 0.4) return { level: 'weak', label: 'Vulnerable', labelZh: '兵力薄弱', color: GD_COLOR_IMPERIAL_RED, recommended, current: state.armyStrength };
    return { level: 'critical', label: 'Critically Undermanned', labelZh: '危在旦夕', color: '#FF0000', recommended, current: state.armyStrength };
  }, [state.armyStrength, state.provinces]);

  const treasuryHealth = useMemo((): TreasuryHealth => {
    const ownedProvinces = state.provinces.filter(p => p.owned).length;
    const structureCount = state.structures.filter(s => s.level > 0).length;
    const upkeepEstimate = ownedProvinces * 20 + structureCount * 10;
    const surplus = state.treasuryGold - upkeepEstimate * 5;
    if (surplus > 1000) return { level: 'thriving', label: 'Thriving Coffers', labelZh: '国库充盈', color: GD_COLOR_GOLD, surplus };
    if (surplus > 200) return { level: 'stable', label: 'Stable Finances', labelZh: '财政稳定', color: GD_COLOR_JADE_GREEN, surplus };
    if (surplus > 0) return { level: 'modest', label: 'Modest Reserves', labelZh: '略有结余', color: GD_COLOR_BRONZE, surplus };
    return { level: 'deficit', label: 'Treasury Deficit', labelZh: '入不敷出', color: GD_COLOR_IMPERIAL_RED, surplus };
  }, [state.treasuryGold, state.provinces, state.structures]);

  const diplomaticSummary = useMemo(() => {
    const alliances = state.diplomaticRelations.filter(r => r.standing >= 80).length;
    const friendly = state.diplomaticRelations.filter(r => r.standing >= 50 && r.standing < 80).length;
    const neutral = state.diplomaticRelations.filter(r => r.standing >= 30 && r.standing < 50).length;
    const hostile = state.diplomaticRelations.filter(r => r.standing < 30).length;
    const avg = state.diplomaticRelations.reduce((sum, r) => sum + r.standing, 0) / Math.max(1, state.diplomaticRelations.length);
    return { alliances, friendly, neutral, hostile, averageStanding: Math.round(avg) };
  }, [state.diplomaticRelations]);

  const estimatedTaxIncome = useMemo(() => {
    const ownedProvinces = state.provinces.filter(p => p.owned);
    const seasonDef = GD_SEASONS.find(s => s.id === state.currentSeason);
    const taxMod = seasonDef?.taxMod ?? 1;
    const baseTax = ownedProvinces.length * 25;
    const loyaltyBonus = ownedProvinces.reduce((sum, p) => sum + Math.floor(p.loyalty * 0.1), 0);
    const treasuryLevel = state.structures.find(s => s.id === 's02')?.level ?? 0;
    return Math.floor((baseTax + loyaltyBonus + treasuryLevel * 15) * taxMod);
  }, [state.provinces, state.structures, state.currentSeason]);

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

  const dailyTaskProgress = useMemo(() => {
    if (!state.dailyTradeTask) return null;
    const task = state.dailyTradeTask;
    const progress = Math.min(1, task.currentAmount / Math.max(1, task.targetAmount));
    const isExpired = Date.now() > task.expiresAt && !task.completed;
    return { ...task, progress, isExpired, goodDef: GD_TRADE_GOODS.find(g => g.id === task.targetGoodId) };
  }, [state.dailyTradeTask]);

  const collectionValue = useMemo(() => {
    let totalGoldValue = 0;
    let totalInfluenceValue = 0;
    for (const t of state.treasures) {
      const def = GD_TREASURES.find(td => td.id === t.id);
      if (def) { totalGoldValue += def.goldValue; totalInfluenceValue += def.influenceValue; }
    }
    return { totalGoldValue, totalInfluenceValue };
  }, [state.treasures]);

  const projectedIncome = useMemo(() => {
    return { trade: tradeIncomePerTurn, tax: estimatedTaxIncome, total: tradeIncomePerTurn + estimatedTaxIncome };
  }, [tradeIncomePerTurn, estimatedTaxIncome]);

  const structuresByCategory = useMemo(() => {
    const cats: Record<string, typeof enrichedStructures> = {};
    for (const s of enrichedStructures) {
      const cat = s.category || 'other';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(s);
    }
    return cats;
  }, [enrichedStructures]);

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
    return [...enrichedGoodPrices]
      .sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange))
      .slice(0, 5);
  }, [enrichedGoodPrices]);

  // ─── Cost helpers (use stateRef) ───────────────────────────────────────
  const canAfford = useCallback((amount: number): boolean => {
    return stateRef.current.treasuryGold >= amount;
  }, []);

  const getUpgradeCost = useCallback((structureId: string): number => {
    const ss = stateRef.current.structures.find(s => s.id === structureId);
    const def = GD_STRUCTURES.find(s => s.id === structureId);
    if (!ss || !def || ss.level >= def.maxLevel) return 0;
    return calculateUpgradeCost(def, ss.level);
  }, []);

  const getExpansionCost = useCallback((provinceId: string): number => {
    const def = GD_PROVINCES.find(p => p.id === provinceId);
    return def?.expansionCost ?? 0;
  }, []);

  const getAbilityCost = useCallback((abilityId: string): number => {
    const def = GD_ABILITIES.find(a => a.id === abilityId);
    return def?.cost ?? 0;
  }, []);

  const getAllianceCost = useCallback((factionId: string): number => {
    const relation = stateRef.current.diplomaticRelations.find(r => r.factionId === factionId);
    if (!relation || relation.standing >= 80) return 0;
    return Math.floor((100 - relation.standing) * 5);
  }, []);

  // ─── Dynasty Advisor Summary ────────────────────────────────────────────
  const advisorSummary = useMemo(() => {
    const tips: string[] = [];
    const tipsZh: string[] = [];

    // Treasury advice
    if (state.treasuryGold < 200) {
      tips.push('Treasury is dangerously low — prioritize trade routes or levy tax.');
      tipsZh.push('国库告急——优先建立商路或征税。');
    }
    if (state.treasuryGold > 5000 && state.structures.filter(s => s.level > 0).length < 10) {
      tips.push('Gold reserves are healthy — invest in more structures.');
      tipsZh.push('储备充足——投资更多建筑。');
    }

    // Province advice
    const unownedProvinces = state.provinces.filter(p => !p.owned);
    if (unownedProvinces.length > 0 && state.treasuryGold > (GD_PROVINCES.find(pd => pd.id === unownedProvinces[0].id)?.expansionCost ?? 9999)) {
      const cheapest = unownedProvinces
        .map(p => ({ ...p, def: GD_PROVINCES.find(pd => pd.id === p.id)! }))
        .filter(p => p.def)
        .sort((a, b) => a.def.expansionCost - b.def.expansionCost)[0];
      if (cheapest) {
        tips.push(`Consider expanding to ${cheapest.def.name} (cost: ${cheapest.def.expansionCost} gold).`);
        tipsZh.push(`考虑开拓${cheapest.def.nameZh}（费用：${cheapest.def.expansionCost}金）。`);
      }
    }

    // Army advice
    if (militaryReadiness.level === 'weak' || militaryReadiness.level === 'critical') {
      tips.push('Army is undermanned — train more troops to defend your provinces.');
      tipsZh.push('兵力不足——训练更多士兵保卫领土。');
    }

    // Trade advice
    const ownedProvinces = state.provinces.filter(p => p.owned);
    if (ownedProvinces.length >= 2 && state.tradeRoutes.filter(r => r.active).length < 2) {
      tips.push('Establish more trade routes between provinces to boost income.');
      tipsZh.push('建立更多省份间商路以提高收入。');
    }

    // Diplomacy advice
    const hostileFactions = state.diplomaticRelations.filter(r => r.standing < 30);
    if (hostileFactions.length > 0) {
      tips.push(`${hostileFactions.length} faction(s) have low standing — consider forging alliances.`);
      tipsZh.push(`${hostileFactions.length}个势力好感度低——考虑结盟。`);
    }

    // Structure upgrade advice
    const maxedStructures = state.structures.filter(s => s.level >= 10).length;
    if (maxedStructures === 0 && state.structures.filter(s => s.level > 0).length > 3) {
      tips.push('Focus on upgrading existing structures to maximize prosperity.');
      tipsZh.push('集中升级现有建筑以最大化繁荣度。');
    }

    // Daily task
    if (state.dailyTradeTask && !state.dailyTradeTask.completed && state.dailyTradeTask.currentAmount === 0) {
      tips.push('Complete your daily trade task for bonus rewards.');
      tipsZh.push('完成每日贸易任务获取额外奖励。');
    }

    if (tips.length === 0) {
      tips.push('Your dynasty is flourishing. Continue expanding and trading!');
      tipsZh.push('王朝繁荣昌盛，继续扩张和贸易！');
    }

    return { tips, tipsZh };
  }, [state, militaryReadiness]);

  // ─── Active events detail ──────────────────────────────────────────────
  const activeEventsDetail = useMemo(() => {
    return state.activeEvents.map(ae => {
      const evtDef = GD_DYNASTY_EVENTS.find(e => e.id === ae.eventId);
      return evtDef ? { ...ae, ...evtDef } : null;
    }).filter(Boolean) as (ActiveEvent & DynastyEventDef)[];
  }, [state.activeEvents]);

  // ─── Province loyalty overview ─────────────────────────────────────────
  const provinceLoyaltySummary = useMemo(() => {
    const owned = state.provinces.filter(p => p.owned);
    if (owned.length === 0) return { average: 0, lowest: 0, critical: 0 };
    const loyal = owned.filter(p => p.loyalty >= 80).length;
    const average = Math.round(owned.reduce((s, p) => s + p.loyalty, 0) / owned.length);
    const lowest = Math.min(...owned.map(p => p.loyalty));
    const critical = owned.filter(p => p.loyalty < 30).length;
    return { average, lowest, critical, loyal, total: owned.length };
  }, [state.provinces]);

  // ═══════════════════════════════════════════════════════════════════════
  // RETURNED API
  // ═══════════════════════════════════════════════════════════════════════

  return {
    // Raw state
    state,

    // Core actions
    collectTreasure,
    expandProvince,
    upgradeStructure,
    activateAbility,
    establishTrade,
    trainArmy,
    buildPalace,
    forgeAlliance,
    levyTax,
    checkAchievements,
    advanceTurn,

    // Navigation & tasks
    setCurrentProvince,
    contributeToTask,
    completeDailyTradeTask,
    deactivateTradeRoute,

    // Query functions
    getTitle,
    getProgress,
    getStats,

    // Cost helpers
    canAfford,
    getUpgradeCost,
    getExpansionCost,
    getAbilityCost,
    getAllianceCost,

    // Enriched data
    enrichedTreasures,
    enrichedProvinces,
    enrichedStructures,
    enrichedAbilities,
    enrichedAchievements,
    enrichedTradeRoutes,
    enrichedGoodPrices,

    // Computed metrics
    availableTreasuresByRarity,
    tradeIncomePerTurn,
    structureProsperityBonus,
    treasureProsperityBonus,
    provinceProsperityTotal,
    militaryReadiness,
    treasuryHealth,
    diplomaticSummary,
    estimatedTaxIncome,
    recentAchievements,
    topTradeRoutes,
    recentEventLog,
    dailyTaskProgress,
    collectionValue,
    projectedIncome,
    structuresByCategory,
    abilitiesByCategory,
    priceMovers,
    currentSeasonDef,

    // Advisor & summaries
    advisorSummary,
    activeEventsDetail,
    provinceLoyaltySummary,
  };
}
