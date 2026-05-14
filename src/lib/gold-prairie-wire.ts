import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Gold Prairie (黄金草原) — Word Snake Wire Module
// ───────────────────────────────────────────────────────────────────────────────
// A vast golden prairie teeming with magnificent beasts, sun-drenched meadows,
// ancient grain varieties, and legendary artifacts from nomadic civilizations
// that once roamed these endless golden plains.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Color Theme Constants ────────────────────────────────────────────────────

const GP_COLOR_GOLDEN = '#FFD700';
const GP_COLOR_PRAIRIE_GREEN = '#8FBC8F';
const GP_COLOR_SUNSET_ORANGE = '#FF8C00';
const GP_COLOR_WHEAT_TAN = '#F5DEB3';
const GP_COLOR_DARK_EARTH = '#5C4033';
const GP_COLOR_SKY_BLUE = '#87CEEB';
const GP_COLOR_DAWN_PINK = '#FFB6C1';
const GP_COLOR_SHADOW_BROWN = '#3E2723';
const GP_COLOR_HAY_YELLOW = '#DAA520';
const GP_COLOR_MAROON = '#800020';
const GP_COLOR_SAGE = '#BCB88A';

// ─── Rarity Tier Constants ────────────────────────────────────────────────────

const GP_RARITY_COMMON = 'common';
const GP_RARITY_UNCOMMON = 'uncommon';
const GP_RARITY_RARE = 'rare';
const GP_RARITY_EPIC = 'epic';
const GP_RARITY_LEGENDARY = 'legendary';

const GP_RARITY_COLORS: Record<string, string> = {
  [GP_RARITY_COMMON]: '#9CA3AF',
  [GP_RARITY_UNCOMMON]: '#4ADE80',
  [GP_RARITY_RARE]: '#60A5FA',
  [GP_RARITY_EPIC]: '#C084FC',
  [GP_RARITY_LEGENDARY]: GP_COLOR_GOLDEN,
};

const GP_RARITY_LABELS: Record<string, { en: string; zh: string }> = {
  [GP_RARITY_COMMON]: { en: 'Common', zh: '普通' },
  [GP_RARITY_UNCOMMON]: { en: 'Uncommon', zh: '优良' },
  [GP_RARITY_RARE]: { en: 'Rare', zh: '稀有' },
  [GP_RARITY_EPIC]: { en: 'Epic', zh: '史诗' },
  [GP_RARITY_LEGENDARY]: { en: 'Legendary', zh: '传说' },
};

const GP_RARITY_MULTIPLIER: Record<string, number> = {
  [GP_RARITY_COMMON]: 1,
  [GP_RARITY_UNCOMMON]: 2,
  [GP_RARITY_RARE]: 4,
  [GP_RARITY_EPIC]: 8,
  [GP_RARITY_LEGENDARY]: 16,
};

// ─── Beast Type Constants ────────────────────────────────────────────────────

const GP_TYPE_GOLDEN_STAG = 'golden_stag';
const GP_TYPE_THUNDER_MUSTANG = 'thunder_mustang';
const GP_TYPE_PRAIRIE_FOX = 'prairie_fox';
const GP_TYPE_SUN_HAWK = 'sun_hawk';
const GP_TYPE_WIND_BISON = 'wind_bison';
const GP_TYPE_HARVEST_ANTELOPE = 'harvest_antelope';
const GP_TYPE_DAWN_WOLF = 'dawn_wolf';

// ─── Title Constants (8 progression titles) ───────────────────────────────────

const GP_TITLES = [
  { id: 'title_wanderer', name: 'Prairie Wanderer', nameZh: '草原漫游者', minTamed: 0, icon: '🚶', description: 'A newcomer setting foot on the golden plains for the first time' },
  { id: 'title_tracker', name: 'Beast Tracker', nameZh: '野兽追踪者', minTamed: 5, icon: '🐾', description: 'You have learned to read the signs left by prairie creatures' },
  { id: 'title_tamer', name: 'Prairie Tamer', nameZh: '驯兽师', minTamed: 12, icon: '🤠', description: 'Beasts of the grassland bow to your patient and steady hand' },
  { id: 'title_herdsman', name: 'Golden Herdsman', nameZh: '金牧人', minTamed: 20, icon: '🐎', description: 'A master of the herd, respected by nomadic tribes across the plains' },
  { id: 'title_guardian', name: 'Prairie Guardian', nameZh: '草原守护者', minTamed: 28, icon: '🛡️', description: 'Protector of the golden grasslands and all who dwell within them' },
  { id: 'title_lord', name: 'Lord of the Plains', nameZh: '平原领主', minTamed: 33, icon: '👑', description: 'Your dominion stretches across the horizon of the golden prairie' },
  { id: 'title_sovereign', name: 'Golden Sovereign', nameZh: '黄金至尊', minTamed: 40, icon: '🌟', description: 'Supreme ruler of every beast that walks the sunlit grasslands' },
  { id: 'title_legend', name: 'Prairie Legend', nameZh: '草原传说', minTamed: 50, icon: '✨', description: 'A living myth whose name echoes across every meadow and valley' },
];

// ─── Beast Type Info ─────────────────────────────────────────────────────────

const GP_BEAST_TYPES = [
  { id: GP_TYPE_GOLDEN_STAG, name: 'Golden Stag', nameZh: '金鹿', icon: '🦌', baseTameChance: 0.5, habitat: 'deep_forest' },
  { id: GP_TYPE_THUNDER_MUSTANG, name: 'Thunder Mustang', nameZh: '雷马', icon: '🐎', baseTameChance: 0.4, habitat: 'open_plains' },
  { id: GP_TYPE_PRAIRIE_FOX, name: 'Prairie Fox', nameZh: '草原狐', icon: '🦊', baseTameChance: 0.55, habitat: 'tall_grass' },
  { id: GP_TYPE_SUN_HAWK, name: 'Sun Hawk', nameZh: '太阳鹰', icon: '🦅', baseTameChance: 0.35, habitat: 'sky' },
  { id: GP_TYPE_WIND_BISON, name: 'Wind Bison', nameZh: '风野牛', icon: '🐃', baseTameChance: 0.45, habitat: 'open_plains' },
  { id: GP_TYPE_HARVEST_ANTELOPE, name: 'Harvest Antelope', nameZh: '收获羚羊', icon: '🦌', baseTameChance: 0.6, habitat: 'meadow' },
  { id: GP_TYPE_DAWN_WOLF, name: 'Dawn Wolf', nameZh: '晨曦狼', icon: '🐺', baseTameChance: 0.38, habitat: 'forest_edge' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Interface Definitions
// ═══════════════════════════════════════════════════════════════════════════════

interface BeastDef {
  id: string;
  name: string;
  nameZh: string;
  type: string;
  rarity: string;
  description: string;
  lore: string;
  icon: string;
  tameChance: number;
  xpReward: number;
  bondMax: number;
  requiredTamed: number;
}

interface MeadowDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  level: number;
  resources: string[];
  capacity: number;
  icon: string;
  unlockTamed: number;
}

interface MaterialDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  description: string;
  icon: string;
  category: string;
  harvestXp: number;
  stackSize: number;
  value: number;
}

interface StructureDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  category: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  bonusType: string;
  bonusPerLevel: number;
}

interface AbilityDef {
  id: string;
  name: string;
  nameZh: string;
  type: string;
  power: number;
  cooldown: number;
  description: string;
  icon: string;
  category: string;
}

interface AchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  condition: string;
  rewardXp: number;
  icon: string;
}

interface ArtifactDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  description: string;
  lore: string;
  icon: string;
  bonusType: string;
  bonusValue: number;
}

interface PrairieEventDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  effectType: string;
  effectValue: number;
  icon: string;
  probability: number;
}

interface BeastState {
  tamed: boolean;
  bondLevel: number;
  lastFed: number | null;
  encounterCount: number;
}

interface MeadowState {
  discovered: boolean;
  harvestCount: number;
  currentResources: Record<string, number>;
  lastHarvested: number | null;
}

interface InventoryItem {
  materialId: string;
  quantity: number;
}

interface StructureState {
  built: boolean;
  level: number;
}

interface GoldPrairieState {
  gpBeasts: Record<string, BeastState>;
  gpMeadows: Record<string, MeadowState>;
  gpInventory: InventoryItem[];
  gpArtifacts: string[];
  gpAchievements: string[];
  gpTitle: string;
  gpEvents: string[];
  gpStats: { totalTamed: number; totalHarvested: number };
  abilityCooldowns: Record<string, number>;
  structureStates: Record<string, StructureState>;
  eventLog: Array<{
    id: string;
    type: string;
    message: string;
    messageZh: string;
    timestamp: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Prairie Beasts (35 beasts: 5 rarity tiers × 7 types)
// ═══════════════════════════════════════════════════════════════════════════════

const GP_BEASTS: BeastDef[] = [
  // ── Common (7) ──
  { id: 'b01', name: 'Fawn of the Meadow', nameZh: '草地幼鹿', type: GP_TYPE_GOLDEN_STAG, rarity: GP_RARITY_COMMON, description: 'A gentle fawn with dappled golden fur that grazes at dawn', lore: 'Said to appear only when the morning dew glistens like gold', icon: '🦌', tameChance: 0.65, xpReward: 10, bondMax: 5, requiredTamed: 0 },
  { id: 'b02', name: 'Dust Trail Pony', nameZh: '尘土小马', type: GP_TYPE_THUNDER_MUSTANG, rarity: GP_RARITY_COMMON, description: 'A small but sturdy pony that kicks up golden dust as it runs', lore: 'Nomads use them to carry grain across the plains', icon: '🐎', tameChance: 0.55, xpReward: 12, bondMax: 5, requiredTamed: 0 },
  { id: 'b03', name: 'Copper-Eared Fox', nameZh: '铜耳狐', type: GP_TYPE_PRAIRIE_FOX, rarity: GP_RARITY_COMMON, description: 'A clever fox with copper-colored ears and a bushy tail', lore: 'It buries acorns and remembers every single one', icon: '🦊', tameChance: 0.7, xpReward: 8, bondMax: 5, requiredTamed: 0 },
  { id: 'b04', name: 'Grassland Sparrow Hawk', nameZh: '草地雀鹰', type: GP_TYPE_SUN_HAWK, rarity: GP_RARITY_COMMON, description: 'A small hawk that hunts rodents in the tall grass', lore: 'Its cry signals the changing of the prairie wind', icon: '🦅', tameChance: 0.5, xpReward: 14, bondMax: 5, requiredTamed: 0 },
  { id: 'b05', name: 'Yearling Bison', nameZh: '一岁野牛', type: GP_TYPE_WIND_BISON, rarity: GP_RARITY_COMMON, description: 'A young bison calf following its mother across the plains', lore: 'Even calves can outrun a horse when the wind is right', icon: '🐃', tameChance: 0.6, xpReward: 11, bondMax: 5, requiredTamed: 0 },
  { id: 'b06', name: 'Wheat-Ear Antelope', nameZh: '麦穗羚', type: GP_TYPE_HARVEST_ANTELOPE, rarity: GP_RARITY_COMMON, description: 'A nimble antelope with fur the color of ripe wheat', lore: 'They migrate with the harvest season across the prairie', icon: '🦌', tameChance: 0.72, xpReward: 9, bondMax: 5, requiredTamed: 0 },
  { id: 'b07', name: 'Dusk Pup', nameZh: '黄昏幼狼', type: GP_TYPE_DAWN_WOLF, rarity: GP_RARITY_COMMON, description: 'A playful wolf pup that emerges at twilight to explore', lore: 'Its howl is so soft it sounds like the evening breeze', icon: '🐺', tameChance: 0.58, xpReward: 13, bondMax: 5, requiredTamed: 0 },
  // ── Uncommon (7) ──
  { id: 'b08', name: 'Amber-Antler Stag', nameZh: '琥珀角鹿', type: GP_TYPE_GOLDEN_STAG, rarity: GP_RARITY_UNCOMMON, description: 'A stag whose antlers glow with warm amber light at sunset', lore: 'Its antlers are prized by healers for their restorative properties', icon: '🦌', tameChance: 0.42, xpReward: 30, bondMax: 8, requiredTamed: 5 },
  { id: 'b09', name: 'Storm Runner', nameZh: '暴风跑者', type: GP_TYPE_THUNDER_MUSTANG, rarity: GP_RARITY_UNCOMMON, description: 'A mustang that gallops ahead of thunderstorms', lore: 'Lightning never strikes where this horse has just passed', icon: '🐎', tameChance: 0.35, xpReward: 35, bondMax: 8, requiredTamed: 5 },
  { id: 'b10', name: 'Silver-Tongued Fox', nameZh: '银舌狐', type: GP_TYPE_PRAIRIE_FOX, rarity: GP_RARITY_UNCOMMON, description: 'An unusually intelligent fox with silver-tipped fur', lore: 'It can mimic bird calls to lure prey from hiding', icon: '🦊', tameChance: 0.48, xpReward: 28, bondMax: 8, requiredTamed: 5 },
  { id: 'b11', name: 'Crimson-Wing Hawk', nameZh: '赤翼鹰', type: GP_TYPE_SUN_HAWK, rarity: GP_RARITY_UNCOMMON, description: 'A hawk with feathers that turn crimson at midday', lore: 'It can spot a mouse from a thousand feet above the prairie', icon: '🦅', tameChance: 0.32, xpReward: 38, bondMax: 8, requiredTamed: 5 },
  { id: 'b12', name: 'Gale Buffalo', nameZh: '疾风野牛', type: GP_TYPE_WIND_BISON, rarity: GP_RARITY_UNCOMMON, description: 'A massive bison that runs so fast it creates its own wind', lore: 'Its hooves leave circular patterns in the prairie dust', icon: '🐃', tameChance: 0.4, xpReward: 32, bondMax: 8, requiredTamed: 5 },
  { id: 'b13', name: 'Golden-Horn Antelope', nameZh: '金角羚', type: GP_TYPE_HARVEST_ANTELOPE, rarity: GP_RARITY_UNCOMMON, description: 'An antelope with horns that gleam like polished gold', lore: 'Its horns are said to point toward the richest meadows', icon: '🦌', tameChance: 0.52, xpReward: 26, bondMax: 8, requiredTamed: 5 },
  { id: 'b14', name: 'Twilight Scout Wolf', nameZh: '暮色侦察狼', type: GP_TYPE_DAWN_WOLF, rarity: GP_RARITY_UNCOMMON, description: 'A wolf that patrols the prairie border at dusk', lore: 'It never sleeps, guarding its territory through every twilight', icon: '🐺', tameChance: 0.36, xpReward: 34, bondMax: 8, requiredTamed: 5 },
  // ── Rare (7) ──
  { id: 'b15', name: 'Radiant Crown Stag', nameZh: '光冕金鹿', type: GP_TYPE_GOLDEN_STAG, rarity: GP_RARITY_RARE, description: 'A magnificent stag with a crown-like rack of golden antlers', lore: 'Ancient tribes believed it was the avatar of the prairie spirit', icon: '🦌', tameChance: 0.22, xpReward: 70, bondMax: 12, requiredTamed: 12 },
  { id: 'b16', name: 'Thunderhoof Mustang', nameZh: '雷蹄马', type: GP_TYPE_THUNDER_MUSTANG, rarity: GP_RARITY_RARE, description: 'A midnight-black mustang whose hooves crackle with electricity', lore: 'When it stamps the ground, thunder echoes across the plains', icon: '🐎', tameChance: 0.18, xpReward: 80, bondMax: 12, requiredTamed: 12 },
  { id: 'b17', name: 'Spirit Flame Fox', nameZh: '灵火狐', type: GP_TYPE_PRAIRIE_FOX, rarity: GP_RARITY_RARE, description: 'A fox wreathed in pale golden flames that do not burn', lore: 'It appears only during the harvest moon, dancing in the wheat fields', icon: '🦊', tameChance: 0.25, xpReward: 65, bondMax: 12, requiredTamed: 12 },
  { id: 'b18', name: 'Sun-Blaze Eagle', nameZh: '烈日雕', type: GP_TYPE_SUN_HAWK, rarity: GP_RARITY_RARE, description: 'An eagle so bright it appears to be made of molten gold', lore: 'It soars so high it seems to touch the sun itself', icon: '🦅', tameChance: 0.16, xpReward: 85, bondMax: 12, requiredTamed: 12 },
  { id: 'b19', name: 'Tempest Bison', nameZh: '风暴野牛', type: GP_TYPE_WIND_BISON, rarity: GP_RARITY_RARE, description: 'An enormous bison that summons whirlwinds when it charges', lore: 'A single charge can flatten a mile of tall grass', icon: '🐃', tameChance: 0.2, xpReward: 75, bondMax: 12, requiredTamed: 12 },
  { id: 'b20', name: 'Aurora Antelope', nameZh: '极光羚', type: GP_TYPE_HARVEST_ANTELOPE, rarity: GP_RARITY_RARE, description: 'An antelope whose horns shimmer with aurora-like colors', lore: 'It appears where the prairie meets the northern lights', icon: '🦌', tameChance: 0.28, xpReward: 60, bondMax: 12, requiredTamed: 12 },
  { id: 'b21', name: 'Phantom Dawn Wolf', nameZh: '幻晨狼', type: GP_TYPE_DAWN_WOLF, rarity: GP_RARITY_RARE, description: 'A ghostly wolf that fades between visibility at dawn', lore: 'It is said to be the guardian of the first sunrise on the prairie', icon: '🐺', tameChance: 0.19, xpReward: 78, bondMax: 12, requiredTamed: 12 },
  // ── Epic (7) ──
  { id: 'b22', name: 'Celestial Stag', nameZh: '天神金鹿', type: GP_TYPE_GOLDEN_STAG, rarity: GP_RARITY_EPIC, description: 'A stag whose antlers hold tiny stars that glow at night', lore: 'Legend says it guided the first nomads to the golden prairie', icon: '🦌', tameChance: 0.1, xpReward: 180, bondMax: 18, requiredTamed: 20 },
  { id: 'b23', name: 'Thunderbolt Mustang', nameZh: '闪电马', type: GP_TYPE_THUNDER_MUSTANG, rarity: GP_RARITY_EPIC, description: 'A mustang that literally rides lightning bolts across the sky', lore: 'Only the greatest riders have ever stayed on its back', icon: '🐎', tameChance: 0.08, xpReward: 200, bondMax: 18, requiredTamed: 20 },
  { id: 'b24', name: 'Kitsune Empress', nameZh: '妖狐女王', type: GP_TYPE_PRAIRIE_FOX, rarity: GP_RARITY_EPIC, description: 'A nine-tailed fox of immense magical power and ancient wisdom', lore: 'She has watched over the prairie for a thousand human lifetimes', icon: '🦊', tameChance: 0.09, xpReward: 170, bondMax: 18, requiredTamed: 20 },
  { id: 'b25', name: 'Phoenix Hawk', nameZh: '凤凰鹰', type: GP_TYPE_SUN_HAWK, rarity: GP_RARITY_EPIC, description: 'A hawk that can burst into golden flame and be reborn from ashes', lore: 'It nests at the peak of the Sunspire Mountain', icon: '🦅', tameChance: 0.07, xpReward: 220, bondMax: 18, requiredTamed: 20 },
  { id: 'b26', name: 'Storm Lord Bison', nameZh: '风暴领主牛', type: GP_TYPE_WIND_BISON, rarity: GP_RARITY_EPIC, description: 'A colossal bison that controls the weather across the entire prairie', lore: 'When it stamps, tornadoes form; when it breathes, the rain falls', icon: '🐃', tameChance: 0.09, xpReward: 190, bondMax: 18, requiredTamed: 20 },
  { id: 'b27', name: 'Harvest God Antelope', nameZh: '丰收神羚', type: GP_TYPE_HARVEST_ANTELOPE, rarity: GP_RARITY_EPIC, description: 'A divine antelope that makes any meadow bloom with golden grain', lore: 'Wherever it walks, the soil becomes eternally fertile', icon: '🦌', tameChance: 0.11, xpReward: 160, bondMax: 18, requiredTamed: 20 },
  { id: 'b28', name: 'Alpha Eclipse Wolf', nameZh: '食月魔狼', type: GP_TYPE_DAWN_WOLF, rarity: GP_RARITY_EPIC, description: 'A massive wolf that howls during eclipses, shrouding the prairie in darkness', lore: 'Its pack numbers in the hundreds and spans the entire continent', icon: '🐺', tameChance: 0.08, xpReward: 210, bondMax: 18, requiredTamed: 20 },
  // ── Legendary (7) ──
  { id: 'b29', name: 'Emperor Golden Stag', nameZh: '黄金帝鹿', type: GP_TYPE_GOLDEN_STAG, rarity: GP_RARITY_LEGENDARY, description: 'The supreme stag of the prairie — its antlers form a living crown of pure sunlight', lore: 'It is the prairie itself given form, the heart of all golden grass', icon: '🦌', tameChance: 0.03, xpReward: 500, bondMax: 25, requiredTamed: 33 },
  { id: 'b30', name: 'Infinite Thunder Mustang', nameZh: '无尽雷马', type: GP_TYPE_THUNDER_MUSTANG, rarity: GP_RARITY_LEGENDARY, description: 'A mustang of infinite speed that exists simultaneously in all places on the prairie', lore: 'No fence has ever contained it; no storm has ever slowed it', icon: '🐎', tameChance: 0.02, xpReward: 550, bondMax: 25, requiredTamed: 33 },
  { id: 'b31', name: 'Prairie Sage Fox', nameZh: '草原圣狐', type: GP_TYPE_PRAIRIE_FOX, rarity: GP_RARITY_LEGENDARY, description: 'A fox that knows every secret of the prairie, past, present, and future', lore: 'It has existed since before the first blade of grass ever grew', icon: '🦊', tameChance: 0.03, xpReward: 480, bondMax: 25, requiredTamed: 33 },
  { id: 'b32', name: 'Sun Tyrant Hawk', nameZh: '太阳霸鹰', type: GP_TYPE_SUN_HAWK, rarity: GP_RARITY_LEGENDARY, description: 'A hawk so powerful it can extinguish or ignite the sun at will', lore: 'The golden prairie exists because this hawk chose to warm the earth', icon: '🦅', tameChance: 0.02, xpReward: 600, bondMax: 25, requiredTamed: 33 },
  { id: 'b33', name: 'World Bison', nameZh: '世界野牛', type: GP_TYPE_WIND_BISON, rarity: GP_RARITY_LEGENDARY, description: 'A bison the size of a mountain whose footsteps shape continents', lore: 'The prairie valleys were formed by where this bison once lay down to rest', icon: '🐃', tameChance: 0.02, xpReward: 520, bondMax: 25, requiredTamed: 33 },
  { id: 'b34', name: 'Eternal Harvest Antelope', nameZh: '永生收获羚', type: GP_TYPE_HARVEST_ANTELOPE, rarity: GP_RARITY_LEGENDARY, description: 'An antelope that grants eternal abundance to whoever tames it', lore: 'Civilizations have risen and fallen trying to claim its golden horns', icon: '🦌', tameChance: 0.03, xpReward: 460, bondMax: 25, requiredTamed: 33 },
  { id: 'b35', name: 'Primordial Dawn Wolf', nameZh: '太初晨曦狼', type: GP_TYPE_DAWN_WOLF, rarity: GP_RARITY_LEGENDARY, description: 'The wolf that howled the first dawn into existence at the beginning of time', lore: 'Its howl created day and night, and its pack created all other wolves', icon: '🐺', tameChance: 0.02, xpReward: 580, bondMax: 25, requiredTamed: 33 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Meadow Locations (8)
// ═══════════════════════════════════════════════════════════════════════════════

const GP_MEADOWS: MeadowDef[] = [
  { id: 'm01', name: 'Sunrise Meadow', nameZh: '日出草原', description: 'The easternmost meadow where the first light touches the golden grass each morning', level: 1, resources: ['mat01', 'mat02', 'mat03', 'mat04'], capacity: 50, icon: '🌅', unlockTamed: 0 },
  { id: 'm02', name: 'Amber Valley', nameZh: '琥珀谷', description: 'A sheltered valley filled with ancient amber deposits and wild grain', level: 3, resources: ['mat05', 'mat06', 'mat07', 'mat08'], capacity: 65, icon: '🌾', unlockTamed: 3 },
  { id: 'm03', name: 'Whispering Grasslands', nameZh: '低语草原', description: 'Tall grass that rustles with the voices of ancient travelers', level: 5, resources: ['mat09', 'mat10', 'mat11', 'mat12'], capacity: 80, icon: '🌿', unlockTamed: 6 },
  { id: 'm04', name: 'Golden Dust Basin', nameZh: '金沙盆地', description: 'A wide basin where golden dust settles each evening like snow', level: 8, resources: ['mat13', 'mat14', 'mat15', 'mat16'], capacity: 100, icon: '🏜️', unlockTamed: 10 },
  { id: 'm05', name: 'Crimson Steppe', nameZh: '绯红草原', description: 'Grasslands that turn crimson at sunset, home to rare medicinal herbs', level: 12, resources: ['mat17', 'mat18', 'mat19', 'mat20'], capacity: 120, icon: '🌺', unlockTamed: 15 },
  { id: 'm06', name: 'Harvest Shrine Meadow', nameZh: '丰收圣殿草原', description: 'A sacred meadow surrounding an ancient shrine to the harvest god', level: 16, resources: ['mat21', 'mat22', 'mat23', 'mat24'], capacity: 150, icon: '⛩️', unlockTamed: 20 },
  { id: 'm07', name: 'Tempest Plateau', nameZh: '暴风高原', description: 'A high plateau where storms gather, yielding rare storm-forged materials', level: 22, resources: ['mat25', 'mat26', 'mat27', 'mat28'], capacity: 180, icon: '⛈️', unlockTamed: 28 },
  { id: 'm08', name: 'Eternal Dawn Sanctuary', nameZh: '永恒黎明圣地', description: 'The holiest place on the prairie where dawn never truly ends', level: 30, resources: ['mat29', 'mat30'], capacity: 250, icon: '✨', unlockTamed: 35 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Materials (30 grain/herb materials)
// ═══════════════════════════════════════════════════════════════════════════════

const GP_MATERIALS: MaterialDef[] = [
  // Common (8)
  { id: 'mat01', name: 'Golden Wheat', nameZh: '金麦', rarity: GP_RARITY_COMMON, description: 'The most common grain on the prairie, golden and plentiful', icon: '🌾', category: 'grain', harvestXp: 5, stackSize: 99, value: 2 },
  { id: 'mat02', name: 'Prairie Clover', nameZh: '草原三叶草', rarity: GP_RARITY_COMMON, description: 'A humble clover that grows everywhere on the plains', icon: '🍀', category: 'herb', harvestXp: 4, stackSize: 99, value: 1 },
  { id: 'mat03', name: 'Sungrass', nameZh: '阳草', rarity: GP_RARITY_COMMON, description: 'A tough grass that follows the sun across the sky', icon: '🌿', category: 'herb', harvestXp: 5, stackSize: 99, value: 2 },
  { id: 'mat04', name: 'Wild Barley', nameZh: '野生大麦', rarity: GP_RARITY_COMMON, description: 'Hardy barley that thrives in the prairie wind', icon: '🌾', category: 'grain', harvestXp: 4, stackSize: 99, value: 1 },
  { id: 'mat05', name: 'Amber Pollen', nameZh: '琥珀花粉', rarity: GP_RARITY_COMMON, description: 'Golden pollen collected from prairie wildflowers', icon: '🌼', category: 'herb', harvestXp: 5, stackSize: 99, value: 2 },
  { id: 'mat06', name: 'Dust Spores', nameZh: '尘孢', rarity: GP_RARITY_COMMON, description: 'Spores that float on the prairie wind', icon: '🌿', category: 'herb', harvestXp: 3, stackSize: 99, value: 1 },
  { id: 'mat07', name: 'Valley Oats', nameZh: '山谷燕麦', rarity: GP_RARITY_COMMON, description: 'Nutritious oats grown in sheltered valleys', icon: '🌾', category: 'grain', harvestXp: 5, stackSize: 99, value: 2 },
  { id: 'mat08', name: 'Meadow Moss', nameZh: '草地苔藓', rarity: GP_RARITY_COMMON, description: 'Soft green moss used for bedding and poultices', icon: '🌿', category: 'herb', harvestXp: 4, stackSize: 99, value: 1 },
  // Uncommon (8)
  { id: 'mat09', name: 'Moonlit Rye', nameZh: '月光黑麦', rarity: GP_RARITY_UNCOMMON, description: 'Rye that only grows where moonlight touches the prairie', icon: '🌾', category: 'grain', harvestXp: 15, stackSize: 50, value: 8 },
  { id: 'mat10', name: 'Whisper Root', nameZh: '低语草根', rarity: GP_RARITY_UNCOMMON, description: 'A root that hums faintly when the wind blows', icon: '🌿', category: 'herb', harvestXp: 18, stackSize: 50, value: 10 },
  { id: 'mat11', name: 'Golden Flax', nameZh: '金亚麻', rarity: GP_RARITY_UNCOMMON, description: 'Flax with golden fibers used in fine weaving', icon: '🌾', category: 'grain', harvestXp: 14, stackSize: 50, value: 7 },
  { id: 'mat12', name: 'Storm Mint', nameZh: '风暴薄荷', rarity: GP_RARITY_UNCOMMON, description: 'Mint with a tangy, electric flavor', icon: '🌿', category: 'herb', harvestXp: 16, stackSize: 50, value: 9 },
  { id: 'mat13', name: 'Amber Resin', nameZh: '琥珀树脂', rarity: GP_RARITY_UNCOMMON, description: 'Sticky golden resin harvested from ancient prairie trees', icon: '🟠', category: 'herb', harvestXp: 17, stackSize: 40, value: 12 },
  { id: 'mat14', name: 'Sun-Dried Sorghum', nameZh: '日晒高粱', rarity: GP_RARITY_UNCOMMON, description: 'Sorghum dried to perfection in the prairie sun', icon: '🌾', category: 'grain', harvestXp: 15, stackSize: 50, value: 8 },
  { id: 'mat15', name: 'Dust Crystal Seeds', nameZh: '尘晶种子', rarity: GP_RARITY_UNCOMMON, description: 'Seeds that contain tiny crystalline structures', icon: '✨', category: 'herb', harvestXp: 20, stackSize: 30, value: 15 },
  { id: 'mat16', name: 'Basin Millet', nameZh: '盆地小米', rarity: GP_RARITY_UNCOMMON, description: 'Tiny golden grains prized for their sweet flavor', icon: '🌾', category: 'grain', harvestXp: 13, stackSize: 50, value: 7 },
  // Rare (7)
  { id: 'mat17', name: 'Crimson Sage', nameZh: '绯红鼠尾草', rarity: GP_RARITY_RARE, description: 'A rare sage with crimson leaves and powerful healing properties', icon: '🌿', category: 'herb', harvestXp: 40, stackSize: 20, value: 30 },
  { id: 'mat18', name: 'Sunfire Grain', nameZh: '日火麦', rarity: GP_RARITY_RARE, description: 'Grain that literally glows with inner fire', icon: '🌾', category: 'grain', harvestXp: 45, stackSize: 15, value: 35 },
  { id: 'mat19', name: 'Twilight Blossom', nameZh: '暮光花', rarity: GP_RARITY_RARE, description: 'A flower that only opens during the twilight hour', icon: '🌺', category: 'herb', harvestXp: 42, stackSize: 20, value: 32 },
  { id: 'mat20', name: 'Steppe Ginseng', nameZh: '草原人参', rarity: GP_RARITY_RARE, description: 'A potent ginseng that grows only on the prairie steppe', icon: '🌿', category: 'herb', harvestXp: 50, stackSize: 10, value: 40 },
  { id: 'mat21', name: 'Sacred Barley', nameZh: '神圣大麦', rarity: GP_RARITY_RARE, description: 'Barley grown in the sacred soil near the Harvest Shrine', icon: '🌾', category: 'grain', harvestXp: 38, stackSize: 20, value: 28 },
  { id: 'mat22', name: 'Shrine Incense Herb', nameZh: '圣殿香草', rarity: GP_RARITY_RARE, description: 'An aromatic herb used in prairie religious ceremonies', icon: '🌿', category: 'herb', harvestXp: 44, stackSize: 15, value: 36 },
  { id: 'mat23', name: 'Divine Corn', nameZh: '神玉米', rarity: GP_RARITY_RARE, description: 'Corn with kernels that shimmer like tiny suns', icon: '🌽', category: 'grain', harvestXp: 48, stackSize: 10, value: 38 },
  { id: 'mat24', name: 'Prism Pollen', nameZh: '棱镜花粉', rarity: GP_RARITY_RARE, description: 'Pollen that refracts light into rainbow colors', icon: '🌈', category: 'herb', harvestXp: 46, stackSize: 12, value: 34 },
  // Epic (4)
  { id: 'mat25', name: 'Tempest Wheat', nameZh: '暴风麦', rarity: GP_RARITY_EPIC, description: 'Wheat infused with the power of storms, crackling with energy', icon: '🌾', category: 'grain', harvestXp: 100, stackSize: 5, value: 120 },
  { id: 'mat26', name: 'Lightning Reed', nameZh: '闪电芦苇', rarity: GP_RARITY_EPIC, description: 'A reed that channels lightning and stores it in its fibers', icon: '⚡', category: 'herb', harvestXp: 110, stackSize: 5, value: 140 },
  { id: 'mat27', name: 'Cloud Sage', nameZh: '云雾仙草', rarity: GP_RARITY_EPIC, description: 'A rare sage found only at the peaks where clouds touch the plateau', icon: '🌿', category: 'herb', harvestXp: 105, stackSize: 5, value: 130 },
  { id: 'mat28', name: 'Thunder Corn', nameZh: '雷玉米', rarity: GP_RARITY_EPIC, description: 'Corn that generates a mild electric field around itself', icon: '🌽', category: 'grain', harvestXp: 115, stackSize: 5, value: 150 },
  // Legendary (3)
  { id: 'mat29', name: 'Dawn Essence', nameZh: '黎明精华', rarity: GP_RARITY_LEGENDARY, description: 'The crystallized essence of the first dawn, glowing with eternal golden light', icon: '✨', category: 'herb', harvestXp: 300, stackSize: 1, value: 500 },
  { id: 'mat30', name: 'Eternal Grain', nameZh: '永恒麦穗', rarity: GP_RARITY_LEGENDARY, description: 'A single grain that if planted would feed the world forever', icon: '🌾', category: 'grain', harvestXp: 350, stackSize: 1, value: 600 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Prairie Structures (25, upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════════════════

const GP_STRUCTURES: StructureDef[] = [
  { id: 'str01', name: 'Hay Barn', nameZh: '干草仓', description: 'Stores harvested grain and hay for the winter months', icon: '🏚️', category: 'storage', baseCost: 50, costMultiplier: 1.4, maxLevel: 10, bonusType: 'storage_capacity', bonusPerLevel: 20 },
  { id: 'str02', name: 'Windmill', nameZh: '风车磨坊', description: 'A windmill that grinds grain into fine flour', icon: '🏛️', category: 'production', baseCost: 80, costMultiplier: 1.5, maxLevel: 10, bonusType: 'grind_speed', bonusPerLevel: 10 },
  { id: 'str03', name: 'Beast Pen', nameZh: '兽栏', description: 'A sturdy pen to house and care for tamed beasts', icon: '🏠', category: 'housing', baseCost: 60, costMultiplier: 1.4, maxLevel: 10, bonusType: 'beast_capacity', bonusPerLevel: 3 },
  { id: 'str04', name: 'Herb Garden', nameZh: '草药园', description: 'A garden for cultivating rare prairie herbs', icon: '🌱', category: 'production', baseCost: 70, costMultiplier: 1.4, maxLevel: 10, bonusType: 'herb_yield', bonusPerLevel: 8 },
  { id: 'str05', name: 'Watchtower', nameZh: '瞭望塔', description: 'A tall tower for watching over the prairie and spotting beasts', icon: '🗼', category: 'defense', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, bonusType: 'sight_range', bonusPerLevel: 12 },
  { id: 'str06', name: 'Grain Silo', nameZh: '粮仓', description: 'A massive silo that protects grain from pests and weather', icon: '🏭', category: 'storage', baseCost: 120, costMultiplier: 1.5, maxLevel: 10, bonusType: 'grain_storage', bonusPerLevel: 30 },
  { id: 'str07', name: 'Tanning Rack', nameZh: '鞣皮架', description: 'Processes animal hides into leather for trade', icon: '🧵', category: 'crafting', baseCost: 90, costMultiplier: 1.4, maxLevel: 10, bonusType: 'leather_quality', bonusPerLevel: 7 },
  { id: 'str08', name: 'Bee Hive Cluster', nameZh: '蜂巢群', description: 'Colonies of prairie bees producing golden honey', icon: '🐝', category: 'production', baseCost: 75, costMultiplier: 1.4, maxLevel: 10, bonusType: 'honey_production', bonusPerLevel: 6 },
  { id: 'str09', name: 'Trading Post', nameZh: '贸易站', description: 'A post where nomads and travelers exchange goods', icon: '🏪', category: 'economy', baseCost: 150, costMultiplier: 1.6, maxLevel: 10, bonusType: 'trade_bonus', bonusPerLevel: 15 },
  { id: 'str10', name: 'Shaman Tent', nameZh: '萨满帐篷', description: 'A sacred tent where prairie shamans perform rituals', icon: '⛺', category: 'spiritual', baseCost: 130, costMultiplier: 1.5, maxLevel: 10, bonusType: 'tame_bonus', bonusPerLevel: 5 },
  { id: 'str11', name: 'Irrigation Canal', nameZh: '灌溉渠', description: 'Channels water from the river to the meadow fields', icon: '💧', category: 'infrastructure', baseCost: 110, costMultiplier: 1.5, maxLevel: 10, bonusType: 'harvest_speed', bonusPerLevel: 10 },
  { id: 'str12', name: 'Forge', nameZh: '锻造炉', description: 'A forge powered by prairie grass briquettes', icon: '🔨', category: 'crafting', baseCost: 140, costMultiplier: 1.6, maxLevel: 10, bonusType: 'craft_speed', bonusPerLevel: 12 },
  { id: 'str13', name: 'Stable', nameZh: '马厩', description: 'A large stable for housing thunder mustangs', icon: '🐎', category: 'housing', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, bonusType: 'horse_capacity', bonusPerLevel: 4 },
  { id: 'str14', name: 'Apothecary', nameZh: '药房', description: 'Processes herbs into medicines and taming potions', icon: '🧪', category: 'crafting', baseCost: 160, costMultiplier: 1.6, maxLevel: 10, bonusType: 'potion_power', bonusPerLevel: 14 },
  { id: 'str15', name: 'Sun Dial', nameZh: '日晷', description: 'An ancient sundial that tracks time and predicts weather', icon: '☀️', category: 'spiritual', baseCost: 180, costMultiplier: 1.7, maxLevel: 10, bonusType: 'weather_forecast', bonusPerLevel: 8 },
  { id: 'str16', name: 'Grain Market', nameZh: '粮食市场', description: 'A bustling market for buying and selling prairie grain', icon: '🏬', category: 'economy', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, bonusType: 'market_income', bonusPerLevel: 18 },
  { id: 'str17', name: 'Boundary Cairn', nameZh: '界碑', description: 'A stone cairn marking and protecting your territory', icon: '🪨', category: 'defense', baseCost: 90, costMultiplier: 1.3, maxLevel: 10, bonusType: 'territory_size', bonusPerLevel: 10 },
  { id: 'str18', name: 'Bakery', nameZh: '面包坊', description: 'Bakes fresh bread from the finest prairie wheat', icon: '🍞', category: 'production', baseCost: 120, costMultiplier: 1.5, maxLevel: 10, bonusType: 'bread_quality', bonusPerLevel: 11 },
  { id: 'str19', name: 'Observatory', nameZh: '观星台', description: 'Studies the stars above the prairie for omens and guidance', icon: '🔭', category: 'spiritual', baseCost: 250, costMultiplier: 1.8, maxLevel: 10, bonusType: 'omen_accuracy', bonusPerLevel: 10 },
  { id: 'str20', name: 'Beast Training Ground', nameZh: '驯兽场', description: 'An open arena for training and bonding with beasts', icon: '🏟️', category: 'housing', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, bonusType: 'bond_speed', bonusPerLevel: 15 },
  { id: 'str21', name: 'Butter Churnery', nameZh: '奶油坊', description: 'Churns prairie milk into butter and cheese', icon: '🧈', category: 'production', baseCost: 100, costMultiplier: 1.4, maxLevel: 10, bonusType: 'dairy_output', bonusPerLevel: 9 },
  { id: 'str22', name: 'Archive Tent', nameZh: '档案帐篷', description: 'Preserves the oral history and knowledge of the prairie', icon: '📚', category: 'spiritual', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, bonusType: 'knowledge_bonus', bonusPerLevel: 12 },
  { id: 'str23', name: 'War Drum Tower', nameZh: '战鼓塔', description: 'A tower with massive drums that can be heard for miles', icon: '🥁', category: 'defense', baseCost: 220, costMultiplier: 1.7, maxLevel: 10, bonusType: 'warning_range', bonusPerLevel: 16 },
  { id: 'str24', name: 'Golden Shrine', nameZh: '黄金神殿', description: 'A sacred shrine dedicated to the spirit of the prairie', icon: '⛩️', category: 'spiritual', baseCost: 300, costMultiplier: 1.8, maxLevel: 10, bonusType: 'all_bonuses', bonusPerLevel: 5 },
  { id: 'str25', name: 'Prairie Palace', nameZh: '草原宫殿', description: 'The ultimate structure — a magnificent palace on the golden plains', icon: '🏰', baseCost: 500, costMultiplier: 2.0, maxLevel: 10, bonusType: 'prestige', bonusPerLevel: 25 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Prairie Abilities (22)
// ═══════════════════════════════════════════════════════════════════════════════

const GP_ABILITIES: AbilityDef[] = [
  { id: 'ab01', name: 'Golden Lure', nameZh: '金色诱饵', type: 'tame', power: 15, cooldown: 3, description: 'Increases taming chance by 15% for the next attempt', icon: '🪤', category: 'taming' },
  { id: 'ab02', name: 'Wind Sprint', nameZh: '疾风冲刺', type: 'explore', power: 2, cooldown: 2, description: 'Instantly discover a new meadow location', icon: '💨', category: 'exploration' },
  { id: 'ab03', name: 'Harvest Blessing', nameZh: '丰收祝福', type: 'harvest', power: 30, cooldown: 4, description: 'Double the harvest yield from the next meadow', icon: '🌾', category: 'gathering' },
  { id: 'ab04', name: 'Beast Call', nameZh: '兽鸣', type: 'tame', power: 25, cooldown: 5, description: 'Attracts a random beast to your current meadow', icon: '📯', category: 'taming' },
  { id: 'ab05', name: 'Herb Sense', nameZh: '草药感知', type: 'gather', power: 20, cooldown: 3, description: 'Reveals all hidden rare herbs in a meadow', icon: '🌿', category: 'gathering' },
  { id: 'ab06', name: 'Prairie Storm', nameZh: '草原风暴', type: 'combat', power: 50, cooldown: 8, description: 'Summons a brief storm that stuns all wild beasts for one turn', icon: '⛈️', category: 'special' },
  { id: 'ab07', name: 'Bonding Ritual', nameZh: '羁绊仪式', type: 'tame', power: 10, cooldown: 6, description: 'Instantly increases bond level with a tamed beast by 1', icon: '💕', category: 'taming' },
  { id: 'ab08', name: 'Golden Shield', nameZh: '黄金护盾', type: 'defense', power: 40, cooldown: 7, description: 'Protects your structures from a random event for 2 turns', icon: '🛡️', category: 'defense' },
  { id: 'ab09', name: 'Swift Build', nameZh: '快速建造', type: 'build', power: 1, cooldown: 5, description: 'Instantly complete the next structure upgrade', icon: '🏗️', category: 'building' },
  { id: 'ab10', name: 'Nature Whisper', nameZh: '自然低语', type: 'tame', power: 20, cooldown: 4, description: 'Calms a wild beast, increasing tame chance significantly', icon: '🤫', category: 'taming' },
  { id: 'ab11', name: 'Amber Gaze', nameZh: '琥珀凝视', type: 'explore', power: 3, cooldown: 5, description: 'Reveals the location of the rarest beast in each meadow', icon: '👁️', category: 'exploration' },
  { id: 'ab12', name: 'Dawn Howl', nameZh: '黎明嚎叫', type: 'tame', power: 30, cooldown: 6, description: 'A howl that echoes across the prairie, rallying friendly beasts', icon: '🐺', category: 'taming' },
  { id: 'ab13', name: 'Grain Surge', nameZh: '谷物涌动', type: 'harvest', power: 50, cooldown: 7, description: 'All meadows produce double resources for one harvest cycle', icon: '🌾', category: 'gathering' },
  { id: 'ab14', name: 'Taming Mastery', nameZh: '驯服精通', type: 'tame', power: 40, cooldown: 9, description: 'Guarantees a successful tame on the next common or uncommon beast', icon: '🎯', category: 'taming' },
  { id: 'ab15', name: 'Sacred Ground', nameZh: '神圣之地', type: 'build', power: 20, cooldown: 8, description: 'Temporarily doubles all structure bonuses for 3 turns', icon: '⛩️', category: 'building' },
  { id: 'ab16', name: 'Wind Walk', nameZh: '御风行走', type: 'explore', power: 4, cooldown: 6, description: 'Move instantly between any two discovered meadows', icon: '🌀', category: 'exploration' },
  { id: 'ab17', name: 'Herbalist Touch', nameZh: '药师之手', type: 'harvest', power: 35, cooldown: 5, description: 'Harvest rare materials from any meadow regardless of level', icon: '🌿', category: 'gathering' },
  { id: 'ab18', name: 'Thunder Stampede', nameZh: '雷鸣狂奔', type: 'combat', power: 80, cooldown: 10, description: 'Your mustangs charge and scatter all hostile forces', icon: '⚡', category: 'special' },
  { id: 'ab19', name: 'Sunforged Armor', nameZh: '日锻铠甲', type: 'defense', power: 60, cooldown: 9, description: 'Creates golden armor that prevents one failure event', icon: '🛡️', category: 'defense' },
  { id: 'ab20', name: 'Artifact Reveal', nameZh: '神器启示', type: 'explore', power: 1, cooldown: 12, description: 'Reveals the location of a hidden legendary artifact', icon: '🗺️', category: 'exploration' },
  { id: 'ab21', name: 'Eternal Dawn', nameZh: '永恒黎明', type: 'special', power: 100, cooldown: 15, description: 'Resets all ability cooldowns and boosts taming for 5 turns', icon: '🌅', category: 'special' },
  { id: 'ab22', name: 'Prairie Awakening', nameZh: '草原觉醒', type: 'special', power: 0, cooldown: 20, description: 'Awakens the prairie spirit, granting massive bonuses for one turn', icon: '✨', category: 'special' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Achievements (18)
// ═══════════════════════════════════════════════════════════════════════════════

const GP_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach01', name: 'First Steps', nameZh: '初入草原', description: 'Tame your first prairie beast', condition: 'totalTamed >= 1', rewardXp: 20, icon: '👣' },
  { id: 'ach02', name: 'Beast Friend', nameZh: '野兽之友', description: 'Tame 5 prairie beasts', condition: 'totalTamed >= 5', rewardXp: 60, icon: '🐾' },
  { id: 'ach03', name: 'Herd Master', nameZh: '牧群大师', description: 'Tame 15 prairie beasts', condition: 'totalTamed >= 15', rewardXp: 150, icon: '🐄' },
  { id: 'ach04', name: 'Full Collection', nameZh: '全部收集', description: 'Tame all 35 prairie beasts', condition: 'totalTamed >= 35', rewardXp: 1000, icon: '👑' },
  { id: 'ach05', name: 'Meadow Explorer', nameZh: '草原探索者', description: 'Discover all 8 meadow locations', condition: 'meadowsDiscovered >= 8', rewardXp: 200, icon: '🗺️' },
  { id: 'ach06', name: 'Grain Baron', nameZh: '粮食大亨', description: 'Harvest 100 times from meadows', condition: 'totalHarvested >= 100', rewardXp: 120, icon: '🌾' },
  { id: 'ach07', name: 'Builder', nameZh: '建造者', description: 'Build your first prairie structure', condition: 'structuresBuilt >= 1', rewardXp: 50, icon: '🏗️' },
  { id: 'ach08', name: 'Architect', nameZh: '建筑师', description: 'Build all 25 prairie structures', condition: 'structuresBuilt >= 25', rewardXp: 500, icon: '🏛️' },
  { id: 'ach09', name: 'Master Builder', nameZh: '建造大师', description: 'Upgrade any structure to level 10', condition: 'maxStructureLevel >= 10', rewardXp: 300, icon: '🏗️' },
  { id: 'ach10', name: 'Artifact Hunter', nameZh: '神器猎人', description: 'Activate your first artifact', condition: 'artifactsActivated >= 1', rewardXp: 80, icon: '🏺' },
  { id: 'ach11', name: 'Artifact Lord', nameZh: '神器领主', description: 'Collect all 15 legendary artifacts', condition: 'artifactsCollected >= 15', rewardXp: 800, icon: '🌟' },
  { id: 'ach12', name: 'Eventful Day', nameZh: '事件之日', description: 'Trigger 10 prairie events', condition: 'eventsTriggered >= 10', rewardXp: 100, icon: '📅' },
  { id: 'ach13', name: 'Rare Catch', nameZh: '稀有收获', description: 'Tame a rare or better beast', condition: 'rareTamed >= 1', rewardXp: 200, icon: '💎' },
  { id: 'ach14', name: 'Legendary Tamer', nameZh: '传说驯兽师', description: 'Tame a legendary beast', condition: 'legendaryTamed >= 1', rewardXp: 500, icon: '✨' },
  { id: 'ach15', name: 'Title Earned', nameZh: '获得称号', description: 'Earn the Herdsman title', condition: 'titleIndex >= 3', rewardXp: 200, icon: '🎖️' },
  { id: 'ach16', name: 'Bond of Trust', nameZh: '信任之绊', description: 'Reach maximum bond with any beast', condition: 'maxBond >= 25', rewardXp: 400, icon: '💕' },
  { id: 'ach17', name: 'Harvest Moon', nameZh: '丰收之月', description: 'Harvest 500 times total', condition: 'totalHarvested >= 500', rewardXp: 350, icon: '🌕' },
  { id: 'ach18', name: 'Prairie Legend', nameZh: '草原传说', description: 'Achieve the Prairie Legend title', condition: 'titleIndex >= 7', rewardXp: 2000, icon: '🏅' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Legendary Artifacts (15)
// ═══════════════════════════════════════════════════════════════════════════════

const GP_ARTIFACTS: ArtifactDef[] = [
  { id: 'art01', name: 'Golden Antler Crown', nameZh: '金角王冠', rarity: GP_RARITY_COMMON, description: 'A crown woven from shed golden stag antlers', lore: 'Worn by the first Herdsman of the prairie', icon: '👑', bonusType: 'tame_chance', bonusValue: 5 },
  { id: 'art02', name: 'Storm Bell', nameZh: '风暴铃铛', rarity: GP_RARITY_COMMON, description: 'A small bell that rings before thunderstorms', lore: 'Hung from the necks of lead mustangs', icon: '🔔', bonusType: 'explore_range', bonusValue: 10 },
  { id: 'art03', name: 'Fox Tail Charm', nameZh: '狐尾护符', rarity: GP_RARITY_UNCOMMON, description: 'A charm made from a silver-tongued fox tail', lore: 'Grants the wearer cunning and quick reflexes', icon: '🪶', bonusType: 'tame_chance', bonusValue: 8 },
  { id: 'art04', name: 'Sunstone Amulet', nameZh: '太阳石护身符', rarity: GP_RARITY_UNCOMMON, description: 'An amulet containing a fragment of solidified sunlight', lore: 'Glows warmly when danger approaches', icon: '☀️', bonusType: 'harvest_yield', bonusValue: 10 },
  { id: 'art05', name: 'Bison Horn Trophy', nameZh: '野牛角战利品', rarity: GP_RARITY_UNCOMMON, description: 'Trophy from the first bison tamed on the plains', lore: 'Symbolizes strength and perseverance', icon: '📯', bonusType: 'defense', bonusValue: 15 },
  { id: 'art06', name: 'Dawn Fang Pendant', nameZh: '晨曦狼牙坠', rarity: GP_RARITY_RARE, description: 'A pendant made from a dawn wolf fang', lore: 'Allows the wearer to see in absolute darkness', icon: '🐺', bonusType: 'tame_chance', bonusValue: 12 },
  { id: 'art07', name: 'Prairie Map Scroll', nameZh: '草原古地图', rarity: GP_RARITY_RARE, description: 'An ancient map showing all meadows and hidden paths', lore: 'Drawn by nomads who knew every blade of grass', icon: '🗺️', bonusType: 'explore_range', bonusValue: 20 },
  { id: 'art08', name: 'Harvest Scepter', nameZh: '丰收权杖', rarity: GP_RARITY_RARE, description: 'A scepter carved from ancient prairie oak', lore: 'It makes crops grow faster wherever it touches the ground', icon: '🪄', bonusType: 'harvest_yield', bonusValue: 20 },
  { id: 'art09', name: 'Amber Tear Drop', nameZh: '琥珀泪滴', rarity: GP_RARITY_RARE, description: 'A perfectly preserved amber teardrop', lore: 'Said to be the tear of the first beast ever tamed', icon: '💧', bonusType: 'bond_speed', bonusValue: 15 },
  { id: 'art10', name: 'Thunder Hoof Shoe', nameZh: '雷蹄铁', rarity: GP_RARITY_EPIC, description: 'A horseshoe forged from a thunderbolt itself', lore: 'Any horse shod with it gains the speed of lightning', icon: '⚡', bonusType: 'tame_chance', bonusValue: 18 },
  { id: 'art11', name: 'Spirit Mask', nameZh: '灵魂面具', rarity: GP_RARITY_EPIC, description: 'A mask that lets you communicate with prairie spirits', lore: 'Shamans use it to speak with the wind and grass', icon: '🎭', bonusType: 'all_bonuses', bonusValue: 10 },
  { id: 'art12', name: 'Eternal Seed', nameZh: '永恒种子', rarity: GP_RARITY_EPIC, description: 'A seed that never dies and always sprouts golden wheat', lore: 'Planting it guarantees a harvest regardless of conditions', icon: '🌱', bonusType: 'harvest_yield', bonusValue: 30 },
  { id: 'art13', name: 'Sun Hawk Feather', nameZh: '太阳鹰羽', rarity: GP_RARITY_EPIC, description: 'A feather from the Sun-Blaze Eagle itself', lore: 'Holding it makes you weightless for a moment', icon: '🪶', bonusType: 'explore_range', bonusValue: 30 },
  { id: 'art14', name: 'Prairie Heart Stone', nameZh: '草原之心', rarity: GP_RARITY_LEGENDARY, description: 'The crystallized heart of the prairie spirit', lore: 'It beats in rhythm with the golden grass', icon: '💛', bonusType: 'tame_chance', bonusValue: 25 },
  { id: 'art15', name: 'Crown of the Golden Sovereign', nameZh: '黄金至尊之冠', rarity: GP_RARITY_LEGENDARY, description: 'The crown of the supreme ruler of the prairie', lore: 'Whoever wears it commands every beast and blade of grass', icon: '👑', bonusType: 'all_bonuses', bonusValue: 25 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Random Prairie Events (12)
// ═══════════════════════════════════════════════════════════════════════════════

const GP_EVENTS: PrairieEventDef[] = [
  { id: 'evt01', name: 'Golden Swarm', nameZh: '金色蜂群', description: 'A massive swarm of golden bees visits the meadows', effectType: 'bonus_harvest', effectValue: 50, icon: '🐝', probability: 0.10 },
  { id: 'evt02', name: 'Prairie Fire', nameZh: '草原大火', description: 'Fire sweeps across the dry grasslands', effectType: 'lose_resources', effectValue: 30, icon: '🔥', probability: 0.06 },
  { id: 'evt03', name: 'Wandering Herd', nameZh: '游牧兽群', description: 'A massive herd of wild beasts passes through', effectType: 'bonus_tame', effectValue: 20, icon: '🐃', probability: 0.09 },
  { id: 'evt04', name: 'Shaman Visit', nameZh: '萨满造访', description: 'A wise shaman offers ancient prairie knowledge', effectType: 'bonus_xp', effectValue: 100, icon: '🧙', probability: 0.07 },
  { id: 'evt05', name: 'Dust Storm', nameZh: '沙尘暴', description: 'A terrible dust storm reduces visibility across the plains', effectType: 'slow_explore', effectValue: 2, icon: '🌪️', probability: 0.08 },
  { id: 'evt06', name: 'Amber Discovery', nameZh: '琥珀发现', description: 'Miners find a rich amber deposit in the basin', effectType: 'bonus_gold', effectValue: 200, icon: '🟠', probability: 0.05 },
  { id: 'evt07', name: 'Beast Migration', nameZh: '兽群迁徙', description: 'Rare beasts migrate through the prairie', effectType: 'rare_beast_spawn', effectValue: 1, icon: '🦌', probability: 0.06 },
  { id: 'evt08', name: 'Harvest Festival', nameZh: '丰收节', description: 'The annual harvest festival doubles all yields', effectType: 'double_harvest', effectValue: 2, icon: '🎉', probability: 0.07 },
  { id: 'evt09', name: 'Wolf Pack Attack', nameZh: '狼群袭击', description: 'A pack of wild wolves attacks your beast pens', effectType: 'lose_bonds', effectValue: 10, icon: '🐺', probability: 0.05 },
  { id: 'evt10', name: 'Rain of Gold', nameZh: '黄金雨', description: 'A magical rain falls, enriching the soil', effectType: 'bonus_growth', effectValue: 40, icon: '🌧️', probability: 0.04 },
  { id: 'evt11', name: 'Ancient Trail', nameZh: '古道重现', description: 'An ancient nomad trail is revealed by the wind', effectType: 'new_meadow', effectValue: 1, icon: '👣', probability: 0.06 },
  { id: 'evt12', name: 'Solar Eclipse', nameZh: '日食', description: 'The sun goes dark, and magical beasts emerge', effectType: 'legendary_chance', effectValue: 5, icon: '🌑', probability: 0.03 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions (outside the hook)
// ═══════════════════════════════════════════════════════════════════════════════

function gpMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gpCreateInitialState(): GoldPrairieState {
  const beasts: Record<string, BeastState> = {};
  for (const b of GP_BEASTS) {
    beasts[b.id] = { tamed: false, bondLevel: 0, lastFed: null, encounterCount: 0 };
  }

  const meadows: Record<string, MeadowState> = {};
  for (const m of GP_MEADOWS) {
    const currentResources: Record<string, number> = {};
    for (const r of m.resources) {
      currentResources[r] = 0;
    }
    meadows[m.id] = { discovered: false, harvestCount: 0, currentResources, lastHarvested: null };
  }

  const structureStates: Record<string, StructureState> = {};
  for (const s of GP_STRUCTURES) {
    structureStates[s.id] = { built: false, level: 0 };
  }

  return {
    gpBeasts: beasts,
    gpMeadows: meadows,
    gpInventory: [],
    gpArtifacts: [],
    gpAchievements: [],
    gpTitle: 'title_wanderer',
    gpEvents: [],
    gpStats: { totalTamed: 0, totalHarvested: 0 },
    abilityCooldowns: {},
    structureStates,
    eventLog: [],
  };
}

function gpRollTameChance(baseChance: number, artifacts: string[]): number {
  let bonus = 0;
  for (const artId of artifacts) {
    const def = GP_ARTIFACTS.find(a => a.id === artId);
    if (def && def.bonusType === 'tame_chance') {
      bonus += def.bonusValue;
    }
    if (def && def.bonusType === 'all_bonuses') {
      bonus += def.bonusValue;
    }
  }
  return Math.min(0.99, baseChance + bonus / 100);
}

function gpDetermineTitleIndex(totalTamed: number): number {
  for (let i = GP_TITLES.length - 1; i >= 0; i--) {
    if (totalTamed >= GP_TITLES[i].minTamed) return i;
  }
  return 0;
}

function gpCalculateStructureBonus(
  structureStates: Record<string, StructureState>,
  bonusType: string,
): number {
  let total = 0;
  for (const sId of Object.keys(structureStates)) {
    const sState = structureStates[sId];
    if (sState.built && sState.level > 0) {
      const sDef = GP_STRUCTURES.find(s => s.id === sId);
      if (sDef && sDef.bonusType === bonusType) {
        total += sDef.bonusPerLevel * sState.level;
      }
      if (sDef && sDef.bonusType === 'all_bonuses') {
        total += sDef.bonusPerLevel * sState.level;
      }
    }
  }
  return total;
}

function gpGenerateEventId(): string {
  return `evt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function gpGenerateLogId(): string {
  return `log_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function gpMatchCondition(condition: string, metrics: Record<string, number>): boolean {
  const match = condition.match(/(\w+)\s*>=\s*(\d+)/);
  if (!match) return false;
  const key = match[1];
  const threshold = parseInt(match[2], 10);
  return (metrics[key] ?? 0) >= threshold;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export default function useGoldPrairie() {
  const [state, setState] = useState<GoldPrairieState>(gpCreateInitialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ─── Action: Tame Beast ──────────────────────────────────────────────────

  const tameBeast = useCallback((beastId: string): { success: boolean; xpGained: number; message: string } => {
    let success = false;
    let xpGained = 0;
    let message = '';

    setState(prev => {
      const beastDef = GP_BEASTS.find(b => b.id === beastId);
      if (!beastDef) {
        message = 'Beast not found';
        return prev;
      }

      const beastState = prev.gpBeasts[beastId];
      if (!beastState) {
        message = 'Beast state not found';
        return prev;
      }

      if (beastState.tamed) {
        message = `${beastDef.nameZh} is already tamed`;
        return prev;
      }

      if (prev.gpStats.totalTamed < beastDef.requiredTamed) {
        message = `Need ${beastDef.requiredTamed} tamed beasts to encounter ${beastDef.nameZh}`;
        return prev;
      }

      const effectiveChance = gpRollTameChance(beastDef.tameChance, prev.gpArtifacts);
      const roll = Math.random();

      if (roll < effectiveChance) {
        success = true;
        xpGained = beastDef.xpReward;
        const newTitleId = GP_TITLES[gpDetermineTitleIndex(prev.gpStats.totalTamed + 1)].id;
        const newAchievements = [...prev.gpAchievements];
        const logEntry = {
          id: gpGenerateLogId(),
          type: 'tame',
          message: `Successfully tamed ${beastDef.name}!`,
          messageZh: `成功驯服了${beastDef.nameZh}！`,
          timestamp: Date.now(),
        };

        message = `Tamed ${beastDef.nameZh}! +${xpGained} XP`;

        return {
          ...prev,
          gpBeasts: {
            ...prev.gpBeasts,
            [beastId]: {
              ...beastState,
              tamed: true,
              bondLevel: 1,
              lastFed: Date.now(),
              encounterCount: beastState.encounterCount + 1,
            },
          },
          gpStats: {
            ...prev.gpStats,
            totalTamed: prev.gpStats.totalTamed + 1,
          },
          gpTitle: newTitleId,
          gpAchievements: newAchievements,
          eventLog: [...prev.eventLog.slice(-199), logEntry],
        };
      }

      message = `Failed to tame ${beastDef.nameZh} (chance: ${Math.round(effectiveChance * 100)}%)`;
      return {
        ...prev,
        gpBeasts: {
          ...prev.gpBeasts,
          [beastId]: {
            ...beastState,
            encounterCount: beastState.encounterCount + 1,
          },
        },
      };
    });

    return { success, xpGained, message };
  }, []);

  // ─── Action: Harvest Meadow ──────────────────────────────────────────────

  const harvestMeadow = useCallback((meadowId: string): { materials: Array<{ materialId: string; quantity: number; name: string }>; xpGained: number; message: string } => {
    const result: { materials: Array<{ materialId: string; quantity: number; name: string }>; xpGained: number; message: string } = {
      materials: [],
      xpGained: 0,
      message: '',
    };

    setState(prev => {
      const meadowDef = GP_MEADOWS.find(m => m.id === meadowId);
      if (!meadowDef) {
        result.message = 'Meadow not found';
        return prev;
      }

      const meadowState = prev.gpMeadows[meadowId];
      if (!meadowState || !meadowState.discovered) {
        result.message = 'Meadow not discovered yet';
        return prev;
      }

      const harvestBonus = gpCalculateStructureBonus(prev.structureStates, 'harvest_yield');
      const harvestBonusFromArtifacts = prev.gpArtifacts.reduce((sum, artId) => {
        const artDef = GP_ARTIFACTS.find(a => a.id === artId);
        if (artDef && artDef.bonusType === 'harvest_yield') return sum + artDef.bonusValue;
        if (artDef && artDef.bonusType === 'all_bonuses') return sum + artDef.bonusValue;
        return sum;
      }, 0);

      const totalBonus = 1 + (harvestBonus + harvestBonusFromArtifacts) / 100;
      const rng = gpMulberry32(Date.now() + meadowDef.level);
      const collected: Array<{ materialId: string; quantity: number; name: string }> = [];
      let totalXp = 0;
      const newInventory = [...prev.gpInventory];
      const newCurrentResources = { ...meadowState.currentResources };

      for (const matId of meadowDef.resources) {
        const matDef = GP_MATERIALS.find(m => m.id === matId);
        if (!matDef) continue;

        const baseAmount = Math.max(1, Math.floor(rng() * 3) + 1);
        const amount = Math.floor(baseAmount * totalBonus);
        const actualAmount = Math.min(amount, matDef.stackSize - (newCurrentResources[matId] ?? 0));

        if (actualAmount > 0) {
          newCurrentResources[matId] = (newCurrentResources[matId] ?? 0) + actualAmount;
          const existingItem = newInventory.find(item => item.materialId === matId);
          if (existingItem) {
            existingItem.quantity += actualAmount;
          } else {
            newInventory.push({ materialId: matId, quantity: actualAmount });
          }
          collected.push({ materialId: matId, quantity: actualAmount, name: matDef.nameZh });
          totalXp += matDef.harvestXp * actualAmount;
        }
      }

      result.materials = collected;
      result.xpGained = totalXp;
      result.message = `Harvested ${collected.length} materials from ${meadowDef.nameZh}`;

      const logEntry = {
        id: gpGenerateLogId(),
        type: 'harvest',
        message: `Harvested from ${meadowDef.name}: ${collected.map(c => `${c.quantity}x ${c.name}`).join(', ')}`,
        messageZh: `在${meadowDef.nameZh}收获了${collected.map(c => `${c.quantity}x${c.name}`).join('、')}`,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        gpMeadows: {
          ...prev.gpMeadows,
          [meadowId]: {
            ...meadowState,
            harvestCount: meadowState.harvestCount + 1,
            currentResources: newCurrentResources,
            lastHarvested: Date.now(),
          },
        },
        gpInventory: newInventory,
        gpStats: {
          ...prev.gpStats,
          totalHarvested: prev.gpStats.totalHarvested + 1,
        },
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return result;
  }, []);

  // ─── Action: Build Structure ─────────────────────────────────────────────

  const buildStructure = useCallback((structureId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const structDef = GP_STRUCTURES.find(s => s.id === structureId);
      if (!structDef) {
        message = 'Structure not found';
        return prev;
      }

      const structState = prev.structureStates[structureId];
      if (!structState) {
        message = 'Structure state not found';
        return prev;
      }

      if (structState.built && structState.level >= structDef.maxLevel) {
        message = `${structDef.nameZh} is already at max level`;
        return prev;
      }

      const newLevel = structState.built ? structState.level + 1 : 1;
      const cost = structState.built
        ? Math.floor(structDef.baseCost * Math.pow(structDef.costMultiplier, newLevel - 1))
        : structDef.baseCost;

      if (!structState.built || structState.level < structDef.maxLevel) {
        success = true;
        message = structState.built
          ? `Upgraded ${structDef.nameZh} to level ${newLevel}`
          : `Built ${structDef.nameZh} at level ${newLevel}`;

        const logEntry = {
          id: gpGenerateLogId(),
          type: 'build',
          message: message,
          messageZh: message,
          timestamp: Date.now(),
        };

        return {
          ...prev,
          structureStates: {
            ...prev.structureStates,
            [structureId]: { built: true, level: newLevel },
          },
          eventLog: [...prev.eventLog.slice(-199), logEntry],
        };
      }

      return prev;
    });

    return { success, message };
  }, []);

  // ─── Action: Activate Artifact ───────────────────────────────────────────

  const activateArtifact = useCallback((artifactId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      if (prev.gpArtifacts.includes(artifactId)) {
        message = 'Artifact already activated';
        return prev;
      }

      const artDef = GP_ARTIFACTS.find(a => a.id === artifactId);
      if (!artDef) {
        message = 'Artifact not found';
        return prev;
      }

      success = true;
      message = `Activated ${artDef.nameZh}`;

      const logEntry = {
        id: gpGenerateLogId(),
        type: 'artifact',
        message: `Activated ${artDef.name}: ${artDef.description}`,
        messageZh: `激活了${artDef.nameZh}：${artDef.description}`,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        gpArtifacts: [...prev.gpArtifacts, artifactId],
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, message };
  }, []);

  // ─── Action: Trigger Prairie Event ───────────────────────────────────────

  const triggerPrairieEvent = useCallback((): { event: PrairieEventDef | null; effectDescription: string } => {
    const result: { event: PrairieEventDef | null; effectDescription: string } = {
      event: null,
      effectDescription: '',
    };

    setState(prev => {
      const roll = Math.random();
      let cumulative = 0;
      let chosenEvent: PrairieEventDef | null = null;

      for (const evt of GP_EVENTS) {
        cumulative += evt.probability;
        if (roll < cumulative) {
          chosenEvent = evt;
          break;
        }
      }

      if (!chosenEvent) {
        chosenEvent = GP_EVENTS[0];
      }

      result.event = chosenEvent;

      switch (chosenEvent.effectType) {
        case 'bonus_harvest':
          result.effectDescription = `+${chosenEvent.effectValue}% harvest bonus`;
          break;
        case 'lose_resources':
          result.effectDescription = `Lost ${chosenEvent.effectValue}% of stored resources`;
          break;
        case 'bonus_tame':
          result.effectDescription = `+${chosenEvent.effectValue}% tame chance bonus`;
          break;
        case 'bonus_xp':
          result.effectDescription = `+${chosenEvent.effectValue} bonus XP`;
          break;
        case 'slow_explore':
          result.effectDescription = `Exploration slowed for ${chosenEvent.effectValue} turns`;
          break;
        case 'bonus_gold':
          result.effectDescription = `Found ${chosenEvent.effectValue} gold worth of amber`;
          break;
        case 'rare_beast_spawn':
          result.effectDescription = 'Rare beasts have appeared on the prairie';
          break;
        case 'double_harvest':
          result.effectDescription = 'All harvests doubled this cycle';
          break;
        case 'lose_bonds':
          result.effectDescription = `Beast bonds reduced by ${chosenEvent.effectValue}%`;
          break;
        case 'bonus_growth':
          result.effectDescription = `+${chosenEvent.effectValue}% growth boost`;
          break;
        case 'new_meadow':
          result.effectDescription = 'A new meadow has been revealed';
          break;
        case 'legendary_chance':
          result.effectDescription = `+${chosenEvent.effectValue}% legendary beast appearance chance`;
          break;
        default:
          result.effectDescription = 'An event has occurred on the prairie';
      }

      const logEntry = {
        id: gpGenerateLogId(),
        type: 'event',
        message: `Prairie Event: ${chosenEvent.name} — ${chosenEvent.description}`,
        messageZh: `草原事件：${chosenEvent.nameZh} — ${chosenEvent.description}`,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        gpEvents: [...prev.gpEvents, chosenEvent.id],
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return result;
  }, []);

  // ─── Action: Reset Gold Prairie ──────────────────────────────────────────

  const resetGoldPrairie = useCallback(() => {
    setState(gpCreateInitialState);
  }, []);

  // ─── Action: Discover Meadow ──────────────────────────────────────────────

  const discoverMeadow = useCallback((meadowId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const meadowDef = GP_MEADOWS.find(m => m.id === meadowId);
      if (!meadowDef) {
        message = 'Meadow not found';
        return prev;
      }

      const meadowState = prev.gpMeadows[meadowId];
      if (!meadowState || meadowState.discovered) {
        message = meadowState?.discovered ? 'Meadow already discovered' : 'Meadow state not found';
        return prev;
      }

      if (prev.gpStats.totalTamed < meadowDef.unlockTamed) {
        message = `Need ${meadowDef.unlockTamed} tamed beasts to discover ${meadowDef.nameZh}`;
        return prev;
      }

      success = true;
      message = `Discovered ${meadowDef.nameZh}`;

      const logEntry = {
        id: gpGenerateLogId(),
        type: 'explore',
        message: `Discovered ${meadowDef.name}: ${meadowDef.description}`,
        messageZh: `发现了${meadowDef.nameZh}：${meadowDef.description}`,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        gpMeadows: {
          ...prev.gpMeadows,
          [meadowId]: { ...meadowState, discovered: true },
        },
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, message };
  }, []);

  // ─── Action: Feed Beast ─────────────────────────────────────────────────

  const feedBeast = useCallback((beastId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const beastDef = GP_BEASTS.find(b => b.id === beastId);
      if (!beastDef) {
        message = 'Beast not found';
        return prev;
      }

      const beastState = prev.gpBeasts[beastId];
      if (!beastState || !beastState.tamed) {
        message = 'Beast is not tamed';
        return prev;
      }

      if (beastState.bondLevel >= beastDef.bondMax) {
        message = `${beastDef.nameZh} is already at maximum bond level`;
        return prev;
      }

      success = true;
      message = `Fed ${beastDef.nameZh}, bond level increased to ${beastState.bondLevel + 1}`;

      return {
        ...prev,
        gpBeasts: {
          ...prev.gpBeasts,
          [beastId]: {
            ...beastState,
            bondLevel: beastState.bondLevel + 1,
            lastFed: Date.now(),
          },
        },
      };
    });

    return { success, message };
  }, []);

  // ─── Action: Discover Random Meadow ──────────────────────────────────────

  const discoverRandomMeadow = useCallback((): { discovered: string | null; message: string } => {
    const result: { discovered: string | null; message: string } = { discovered: null, message: 'No new meadows to discover' };

    setState(prev => {
      const undiscovered = GP_MEADOWS.filter(m => {
        const ms = prev.gpMeadows[m.id];
        return ms && !ms.discovered && prev.gpStats.totalTamed >= m.unlockTamed;
      });

      if (undiscovered.length === 0) {
        return prev;
      }

      const chosen = undiscovered[Math.floor(Math.random() * undiscovered.length)];
      result.discovered = chosen.id;
      result.message = `Discovered ${chosen.nameZh}`;

      const logEntry = {
        id: gpGenerateLogId(),
        type: 'explore',
        message: `Discovered ${chosen.name}: ${chosen.description}`,
        messageZh: `发现了${chosen.nameZh}：${chosen.description}`,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        gpMeadows: {
          ...prev.gpMeadows,
          [chosen.id]: { ...prev.gpMeadows[chosen.id], discovered: true },
        },
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return result;
  }, []);

  // ─── Action: Use Ability ──────────────────────────────────────────────────

  const useAbility = useCallback((abilityId: string): { success: boolean; message: string; cooldownApplied: number } => {
    const result: { success: boolean; message: string; cooldownApplied: number } = { success: false, message: '', cooldownApplied: 0 };

    setState(prev => {
      const abilityDef = GP_ABILITIES.find(a => a.id === abilityId);
      if (!abilityDef) {
        result.message = 'Ability not found';
        return prev;
      }

      const currentCooldown = prev.abilityCooldowns[abilityId] ?? 0;
      if (currentCooldown > 0) {
        result.message = `${abilityDef.nameZh} is on cooldown (${currentCooldown} turns remaining)`;
        return prev;
      }

      const cooldownApplied = abilityDef.cooldown;
      result.success = true;
      result.cooldownApplied = cooldownApplied;
      result.message = `Used ${abilityDef.nameZh}: ${abilityDef.description}`;

      const logEntry = {
        id: gpGenerateLogId(),
        type: 'ability',
        message: `Activated ${abilityDef.name} (Power: ${abilityDef.power}, CD: ${cooldownApplied}t)`,
        messageZh: `使用了${abilityDef.nameZh}（威力：${abilityDef.power}，冷却：${cooldownApplied}回合）`,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        abilityCooldowns: {
          ...prev.abilityCooldowns,
          [abilityId]: cooldownApplied,
        },
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return result;
  }, []);

  // ─── Action: Check and Claim Achievements ────────────────────────────────

  const checkAndClaimAchievements = useCallback((): { newlyUnlocked: AchievementDef[] } => {
    const newlyUnlocked: AchievementDef[] = [];

    setState(prev => {
      const metrics: Record<string, number> = {
        totalTamed: prev.gpStats.totalTamed,
        meadowsDiscovered: Object.values(prev.gpMeadows).filter(m => m.discovered).length,
        totalHarvested: prev.gpStats.totalHarvested,
        structuresBuilt: Object.values(prev.structureStates).filter(s => s.built).length,
        maxStructureLevel: Math.max(0, ...Object.values(prev.structureStates).map(s => s.level)),
        artifactsActivated: prev.gpArtifacts.length,
        artifactsCollected: prev.gpArtifacts.length,
        eventsTriggered: prev.gpEvents.length,
        rareTamed: Object.entries(prev.gpBeasts).filter(([id, b]) => {
          if (!b.tamed) return false;
          const def = GP_BEASTS.find(beast => beast.id === id);
          return def && (def.rarity === GP_RARITY_RARE || def.rarity === GP_RARITY_EPIC || def.rarity === GP_RARITY_LEGENDARY);
        }).length,
        legendaryTamed: Object.entries(prev.gpBeasts).filter(([id, b]) => {
          if (!b.tamed) return false;
          const def = GP_BEASTS.find(beast => beast.id === id);
          return def && def.rarity === GP_RARITY_LEGENDARY;
        }).length,
        titleIndex: GP_TITLES.findIndex(t => t.id === prev.gpTitle),
        maxBond: Math.max(0, ...Object.values(prev.gpBeasts).map(b => b.bondLevel)),
      };

      const newAchievements = [...prev.gpAchievements];

      for (const ach of GP_ACHIEVEMENTS) {
        if (newAchievements.includes(ach.id)) continue;
        if (gpMatchCondition(ach.condition, metrics)) {
          newAchievements.push(ach.id);
          newlyUnlocked.push(ach);
        }
      }

      if (newAchievements.length === prev.gpAchievements.length) {
        return prev;
      }

      const logEntries = newlyUnlocked.map(ach => ({
        id: gpGenerateLogId(),
        type: 'achievement' as const,
        message: `Achievement Unlocked: ${ach.name} — ${ach.description}`,
        messageZh: `成就解锁：${ach.nameZh} — ${ach.description}`,
        timestamp: Date.now(),
      }));

      return {
        ...prev,
        gpAchievements: newAchievements,
        eventLog: [...prev.eventLog.slice(-199), ...logEntries],
      };
    });

    return { newlyUnlocked };
  }, []);

  // ─── Auto-check achievements on state change ──────────────────────────────

  useEffect(() => {
    const metrics: Record<string, number> = {
      totalTamed: state.gpStats.totalTamed,
      meadowsDiscovered: Object.values(state.gpMeadows).filter(m => m.discovered).length,
      totalHarvested: state.gpStats.totalHarvested,
      structuresBuilt: Object.values(state.structureStates).filter(s => s.built).length,
      maxStructureLevel: Math.max(0, ...Object.values(state.structureStates).map(s => s.level)),
      artifactsActivated: state.gpArtifacts.length,
      artifactsCollected: state.gpArtifacts.length,
      eventsTriggered: state.gpEvents.length,
      rareTamed: Object.entries(state.gpBeasts).filter(([id, b]) => {
        if (!b.tamed) return false;
        const def = GP_BEASTS.find(beast => beast.id === id);
        return def && (def.rarity === GP_RARITY_RARE || def.rarity === GP_RARITY_EPIC || def.rarity === GP_RARITY_LEGENDARY);
      }).length,
      legendaryTamed: Object.entries(state.gpBeasts).filter(([id, b]) => {
        if (!b.tamed) return false;
        const def = GP_BEASTS.find(beast => beast.id === id);
        return def && def.rarity === GP_RARITY_LEGENDARY;
      }).length,
      titleIndex: GP_TITLES.findIndex(t => t.id === state.gpTitle),
      maxBond: Math.max(0, ...Object.values(state.gpBeasts).map(b => b.bondLevel)),
    };

    const newAchs: string[] = [];
    for (const ach of GP_ACHIEVEMENTS) {
      if (state.gpAchievements.includes(ach.id)) continue;
      if (gpMatchCondition(ach.condition, metrics)) {
        newAchs.push(ach.id);
      }
    }

    if (newAchs.length > 0) {
      setState(prev => ({
        ...prev,
        gpAchievements: [...prev.gpAchievements, ...newAchs],
      }));
    }
  }, [state.gpStats.totalTamed, state.gpMeadows, state.gpStats.totalHarvested, state.structureStates, state.gpArtifacts, state.gpEvents, state.gpBeasts, state.gpAchievements, state.gpTitle]);

  // ─── Computed: Title Info ────────────────────────────────────────────────

  const currentTitleInfo = useMemo(() => {
    const idx = GP_TITLES.findIndex(t => t.id === state.gpTitle);
    if (idx >= 0) return GP_TITLES[idx];
    return GP_TITLES[0];
  }, [state.gpTitle]);

  const nextTitleInfo = useMemo(() => {
    const currentIdx = GP_TITLES.findIndex(t => t.id === state.gpTitle);
    if (currentIdx < GP_TITLES.length - 1) {
      return GP_TITLES[currentIdx + 1];
    }
    return null;
  }, [state.gpTitle]);

  // ─── Computed: Stats Summary ─────────────────────────────────────────────

  const statsSummary = useMemo(() => {
    const tamedCount = Object.values(state.gpBeasts).filter(b => b.tamed).length;
    const discoveredMeadows = Object.values(state.gpMeadows).filter(m => m.discovered).length;
    const builtStructures = Object.values(state.structureStates).filter(s => s.built).length;
    const maxStructureLevel = Math.max(0, ...Object.values(state.structureStates).map(s => s.level));
    const totalInventoryItems = state.gpInventory.reduce((sum, item) => sum + item.quantity, 0);
    const maxBond = Math.max(0, ...Object.values(state.gpBeasts).map(b => b.bondLevel));
    const rareTamed = Object.entries(state.gpBeasts).filter(([id, b]) => {
      if (!b.tamed) return false;
      const def = GP_BEASTS.find(beast => beast.id === id);
      return def && (def.rarity === GP_RARITY_RARE || def.rarity === GP_RARITY_EPIC || def.rarity === GP_RARITY_LEGENDARY);
    }).length;
    const legendaryTamed = Object.entries(state.gpBeasts).filter(([id, b]) => {
      if (!b.tamed) return false;
      const def = GP_BEASTS.find(beast => beast.id === id);
      return def && def.rarity === GP_RARITY_LEGENDARY;
    }).length;
    const titleIndex = GP_TITLES.findIndex(t => t.id === state.gpTitle);
    const structuresBuilt = builtStructures;
    const artifactsCollected = state.gpArtifacts.length;
    const eventsTriggered = state.gpEvents.length;

    return {
      totalTamed: state.gpStats.totalTamed,
      tamedCount,
      discoveredMeadows,
      builtStructures,
      maxStructureLevel,
      totalInventoryItems,
      maxBond,
      rareTamed,
      legendaryTamed,
      totalHarvested: state.gpStats.totalHarvested,
      artifactsCollected,
      eventsTriggered,
      achievementsUnlocked: state.gpAchievements.length,
      achievementsTotal: GP_ACHIEVEMENTS.length,
      titleIndex,
      inventoryUnique: state.gpInventory.length,
    };
  }, [state]);

  // ─── Computed: Check Achievements ────────────────────────────────────────

  const pendingAchievements = useMemo(() => {
    const metrics: Record<string, number> = {
      totalTamed: state.gpStats.totalTamed,
      meadowsDiscovered: Object.values(state.gpMeadows).filter(m => m.discovered).length,
      totalHarvested: state.gpStats.totalHarvested,
      structuresBuilt: Object.values(state.structureStates).filter(s => s.built).length,
      maxStructureLevel: Math.max(0, ...Object.values(state.structureStates).map(s => s.level)),
      artifactsActivated: state.gpArtifacts.length,
      artifactsCollected: state.gpArtifacts.length,
      eventsTriggered: state.gpEvents.length,
      rareTamed: Object.entries(state.gpBeasts).filter(([id, b]) => {
        if (!b.tamed) return false;
        const def = GP_BEASTS.find(beast => beast.id === id);
        return def && (def.rarity === GP_RARITY_RARE || def.rarity === GP_RARITY_EPIC || def.rarity === GP_RARITY_LEGENDARY);
      }).length,
      legendaryTamed: Object.entries(state.gpBeasts).filter(([id, b]) => {
        if (!b.tamed) return false;
        const def = GP_BEASTS.find(beast => beast.id === id);
        return def && def.rarity === GP_RARITY_LEGENDARY;
      }).length,
      titleIndex: GP_TITLES.findIndex(t => t.id === state.gpTitle),
      maxBond: Math.max(0, ...Object.values(state.gpBeasts).map(b => b.bondLevel)),
    };

    return GP_ACHIEVEMENTS
      .filter(ach => !state.gpAchievements.includes(ach.id))
      .filter(ach => gpMatchCondition(ach.condition, metrics))
      .map(ach => ({
        ...ach,
        rarityColor: GP_RARITY_COLORS[GP_RARITY_COMMON],
      }));
  }, [state]);

  // ─── Computed: Enriched Beasts ────────────────────────────────────────────

  const enrichedBeasts = useMemo(() => {
    return GP_BEASTS.map(def => {
      const beastState = state.gpBeasts[def.id] ?? { tamed: false, bondLevel: 0, lastFed: null, encounterCount: 0 };
      const typeInfo = GP_BEAST_TYPES.find(t => t.id === def.type);
      return {
        ...def,
        tamed: beastState.tamed,
        bondLevel: beastState.bondLevel,
        encounterCount: beastState.encounterCount,
        lastFed: beastState.lastFed,
        canTame: !beastState.tamed && state.gpStats.totalTamed >= def.requiredTamed,
        typeName: typeInfo?.name ?? '',
        typeIcon: typeInfo?.icon ?? '',
        rarityColor: GP_RARITY_COLORS[def.rarity] ?? '#9CA3AF',
        rarityLabel: GP_RARITY_LABELS[def.rarity] ?? { en: 'Unknown', zh: '未知' },
      };
    });
  }, [state.gpBeasts, state.gpStats.totalTamed]);

  // ─── Computed: Enriched Meadows ───────────────────────────────────────────

  const enrichedMeadows = useMemo(() => {
    return GP_MEADOWS.map(def => {
      const meadowState = state.gpMeadows[def.id] ?? { discovered: false, harvestCount: 0, currentResources: {}, lastHarvested: null };
      const materialsList = def.resources.map(matId => {
        const matDef = GP_MATERIALS.find(m => m.id === matId);
        return {
          materialId: matId,
          name: matDef?.name ?? '',
          nameZh: matDef?.nameZh ?? '',
          icon: matDef?.icon ?? '',
          currentAmount: meadowState.currentResources[matId] ?? 0,
          maxAmount: matDef?.stackSize ?? 99,
          rarity: matDef?.rarity ?? GP_RARITY_COMMON,
          rarityColor: GP_RARITY_COLORS[matDef?.rarity ?? GP_RARITY_COMMON] ?? '#9CA3AF',
        };
      });
      return {
        ...def,
        discovered: meadowState.discovered,
        harvestCount: meadowState.harvestCount,
        lastHarvested: meadowState.lastHarvested,
        materials: materialsList,
        canDiscover: !meadowState.discovered && state.gpStats.totalTamed >= def.unlockTamed,
        isReadyToHarvest: meadowState.discovered,
      };
    });
  }, [state.gpMeadows, state.gpStats.totalTamed]);

  // ─── Computed: Enriched Structures ────────────────────────────────────────

  const enrichedStructures = useMemo(() => {
    return GP_STRUCTURES.map(def => {
      const structState = state.structureStates[def.id] ?? { built: false, level: 0 };
      const upgradeCost = structState.built
        ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, structState.level))
        : def.baseCost;
      return {
        ...def,
        built: structState.built,
        level: structState.level,
        upgradeCost,
        canUpgrade: structState.built && structState.level < def.maxLevel,
        currentBonus: structState.built ? def.bonusPerLevel * structState.level : 0,
        maxBonus: def.bonusPerLevel * def.maxLevel,
      };
    });
  }, [state.structureStates]);

  // ─── Computed: Enriched Inventory ─────────────────────────────────────────

  const enrichedInventory = useMemo(() => {
    return state.gpInventory.map(item => {
      const matDef = GP_MATERIALS.find(m => m.id === item.materialId);
      return {
        ...item,
        name: matDef?.name ?? '',
        nameZh: matDef?.nameZh ?? '',
        icon: matDef?.icon ?? '',
        rarity: matDef?.rarity ?? GP_RARITY_COMMON,
        rarityColor: GP_RARITY_COLORS[matDef?.rarity ?? GP_RARITY_COMMON] ?? '#9CA3AF',
        category: matDef?.category ?? '',
        value: matDef?.value ?? 0,
        totalValue: (matDef?.value ?? 0) * item.quantity,
        stackSize: matDef?.stackSize ?? 99,
      };
    });
  }, [state.gpInventory]);

  // ─── Computed: Enriched Artifacts ─────────────────────────────────────────

  const enrichedArtifacts = useMemo(() => {
    return GP_ARTIFACTS.map(def => ({
      ...def,
      activated: state.gpArtifacts.includes(def.id),
      rarityColor: GP_RARITY_COLORS[def.rarity] ?? '#9CA3AF',
    }));
  }, [state.gpArtifacts]);

  // ─── Computed: Beast Summary by Type ─────────────────────────────────────

  const beastsByType = useMemo(() => {
    const types: Record<string, { total: number; tamed: number; icon: string; name: string }> = {};
    for (const type of GP_BEAST_TYPES) {
      types[type.id] = { total: 0, tamed: 0, icon: type.icon, name: type.name };
    }
    for (const beast of GP_BEASTS) {
      if (types[beast.type]) {
        types[beast.type].total += 1;
      }
    }
    for (const [beastId, beastState] of Object.entries(state.gpBeasts)) {
      if (beastState.tamed) {
        const def = GP_BEASTS.find(b => b.id === beastId);
        if (def && types[def.type]) {
          types[def.type].tamed += 1;
        }
      }
    }
    return types;
  }, [state.gpBeasts]);

  // ─── Computed: Beasts by Rarity ──────────────────────────────────────────

  const beastsByRarity = useMemo(() => {
    const result: Record<string, { total: number; tamed: number; color: string; label: string }> = {};
    for (const rarity of [GP_RARITY_COMMON, GP_RARITY_UNCOMMON, GP_RARITY_RARE, GP_RARITY_EPIC, GP_RARITY_LEGENDARY]) {
      const beastsOfRarity = GP_BEASTS.filter(b => b.rarity === rarity);
      const tamedOfRarity = beastsOfRarity.filter(b => {
        const s = state.gpBeasts[b.id];
        return s && s.tamed;
      }).length;
      result[rarity] = {
        total: beastsOfRarity.length,
        tamed: tamedOfRarity,
        color: GP_RARITY_COLORS[rarity],
        label: GP_RARITY_LABELS[rarity].en,
      };
    }
    return result;
  }, [state.gpBeasts]);

  // ─── Computed: Completion Percentage ─────────────────────────────────────

  const completionStats = useMemo(() => {
    const tamedCount = Object.values(state.gpBeasts).filter(b => b.tamed).length;
    const discoveredMeadows = Object.values(state.gpMeadows).filter(m => m.discovered).length;
    const builtStructures = Object.values(state.structureStates).filter(s => s.built).length;

    const beastCompletion = GP_BEASTS.length > 0 ? tamedCount / GP_BEASTS.length : 0;
    const meadowCompletion = GP_MEADOWS.length > 0 ? discoveredMeadows / GP_MEADOWS.length : 0;
    const structureCompletion = GP_STRUCTURES.length > 0 ? builtStructures / GP_STRUCTURES.length : 0;
    const artifactCompletion = GP_ARTIFACTS.length > 0 ? state.gpArtifacts.length / GP_ARTIFACTS.length : 0;
    const achievementCompletion = GP_ACHIEVEMENTS.length > 0 ? state.gpAchievements.length / GP_ACHIEVEMENTS.length : 0;

    const overall = (
      beastCompletion * 0.35 +
      meadowCompletion * 0.15 +
      structureCompletion * 0.15 +
      artifactCompletion * 0.2 +
      achievementCompletion * 0.15
    );

    return {
      beastCompletion: Math.round(beastCompletion * 100),
      meadowCompletion: Math.round(meadowCompletion * 100),
      structureCompletion: Math.round(structureCompletion * 100),
      artifactCompletion: Math.round(artifactCompletion * 100),
      achievementCompletion: Math.round(achievementCompletion * 100),
      overallCompletion: Math.round(overall * 100),
    };
  }, [state]);

  // ─── Computed: Recent Event Log ──────────────────────────────────────────

  const recentEventLog = useMemo(() => {
    return state.eventLog.slice(-20).reverse();
  }, [state.eventLog]);

  // ─── Computed: Available Tame Candidates ─────────────────────────────────

  const availableTameCandidates = useMemo(() => {
    return GP_BEASTS.filter(def => {
      const beastState = state.gpBeasts[def.id];
      if (!beastState || beastState.tamed) return false;
      return state.gpStats.totalTamed >= def.requiredTamed;
    });
  }, [state.gpBeasts, state.gpStats.totalTamed]);

  // ─── Computed: Progress to Next Title ────────────────────────────────────

  const titleProgress = useMemo(() => {
    const currentIdx = GP_TITLES.findIndex(t => t.id === state.gpTitle);
    if (currentIdx < 0 || currentIdx >= GP_TITLES.length - 1) {
      return { progress: 100, required: GP_TITLES[currentIdx]?.minTamed ?? 0, current: state.gpStats.totalTamed, isMax: true };
    }
    const next = GP_TITLES[currentIdx + 1];
    const current = GP_TITLES[currentIdx];
    const range = next.minTamed - current.minTamed;
    const progress = range > 0 ? Math.min(100, ((state.gpStats.totalTamed - current.minTamed) / range) * 100) : 100;
    return { progress: Math.round(progress), required: next.minTamed, current: state.gpStats.totalTamed, isMax: false };
  }, [state.gpTitle, state.gpStats.totalTamed]);

  // ─── Computed: Active Artifact Bonuses ───────────────────────────────────

  const artifactBonuses = useMemo(() => {
    const bonuses: Record<string, number> = {};
    for (const artId of state.gpArtifacts) {
      const def = GP_ARTIFACTS.find(a => a.id === artId);
      if (def) {
        bonuses[def.bonusType] = (bonuses[def.bonusType] ?? 0) + def.bonusValue;
      }
    }
    return bonuses;
  }, [state.gpArtifacts]);

  // ─── Computed: Top Beasts by Bond Level ──────────────────────────────────

  const topBondedBeasts = useMemo(() => {
    return Object.entries(state.gpBeasts)
      .filter(([, b]) => b.tamed && b.bondLevel > 0)
      .map(([id, b]) => {
        const def = GP_BEASTS.find(beast => beast.id === id);
        return { id, name: def?.name ?? '', nameZh: def?.nameZh ?? '', icon: def?.icon ?? '', bondLevel: b.bondLevel, maxBond: def?.bondMax ?? 5, rarity: def?.rarity ?? GP_RARITY_COMMON };
      })
      .sort((a, b) => b.bondLevel - a.bondLevel)
      .slice(0, 10);
  }, [state.gpBeasts]);

  // ─── Computed: Structures by Category ────────────────────────────────────

  const structuresByCategory = useMemo(() => {
    const categories: Record<string, typeof enrichedStructures> = {};
    for (const s of enrichedStructures) {
      if (!categories[s.category]) {
        categories[s.category] = [];
      }
      categories[s.category].push(s);
    }
    return categories;
  }, [enrichedStructures]);

  // ─── Computed: Materials by Category ─────────────────────────────────────

  const materialsByCategory = useMemo(() => {
    const categories: Record<string, typeof GP_MATERIALS> = {};
    for (const m of GP_MATERIALS) {
      if (!categories[m.category]) {
        categories[m.category] = [];
      }
      categories[m.category].push(m);
    }
    return categories;
  }, []);

  // ─── Computed: Abilities by Category ─────────────────────────────────────

  const abilitiesByCategory = useMemo(() => {
    const categories: Record<string, typeof GP_ABILITIES> = {};
    for (const a of GP_ABILITIES) {
      if (!categories[a.category]) {
        categories[a.category] = [];
      }
      categories[a.category].push(a);
    }
    return categories;
  }, []);

  // ─── Computed: Harvested Materials with Inventory ────────────────────────

  const inventoryWithDetails = useMemo(() => {
    return state.gpInventory.map(item => {
      const matDef = GP_MATERIALS.find(m => m.id === item.materialId);
      const rarityMult = GP_RARITY_MULTIPLIER[matDef?.rarity ?? GP_RARITY_COMMON] ?? 1;
      return {
        materialId: item.materialId,
        quantity: item.quantity,
        name: matDef?.name ?? '',
        nameZh: matDef?.nameZh ?? '',
        description: matDef?.description ?? '',
        icon: matDef?.icon ?? '',
        rarity: matDef?.rarity ?? GP_RARITY_COMMON,
        rarityColor: GP_RARITY_COLORS[matDef?.rarity ?? GP_RARITY_COMMON] ?? '#9CA3AF',
        category: matDef?.category ?? '',
        unitValue: matDef?.value ?? 0,
        totalValue: (matDef?.value ?? 0) * item.quantity * rarityMult,
        rarityMultiplier: rarityMult,
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
  }, [state.gpInventory]);

  // ─── Computed: Total Inventory Value ─────────────────────────────────────

  const totalInventoryValue = useMemo(() => {
    return inventoryWithDetails.reduce((sum, item) => sum + item.totalValue, 0);
  }, [inventoryWithDetails]);

  // ═══════════════════════════════════════════════════════════════════════
  // RETURNED API
  // ═══════════════════════════════════════════════════════════════════════

  return {
    // ─── Raw State ───
    state,

    // ─── GP Constants (Pattern A: directly on API object) ───
    GP_BEASTS,
    GP_MEADOWS,
    GP_MATERIALS,
    GP_STRUCTURES,
    GP_ABILITIES,
    GP_ACHIEVEMENTS,
    GP_ARTIFACTS,
    GP_EVENTS,
    GP_TITLES,
    GP_BEAST_TYPES,
    GP_RARITY_COLORS,
    GP_RARITY_LABELS,
    GP_RARITY_MULTIPLIER,
    GP_RARITY_COMMON,
    GP_RARITY_UNCOMMON,
    GP_RARITY_RARE,
    GP_RARITY_EPIC,
    GP_RARITY_LEGENDARY,
    GP_TYPE_GOLDEN_STAG,
    GP_TYPE_THUNDER_MUSTANG,
    GP_TYPE_PRAIRIE_FOX,
    GP_TYPE_SUN_HAWK,
    GP_TYPE_WIND_BISON,
    GP_TYPE_HARVEST_ANTELOPE,
    GP_TYPE_DAWN_WOLF,
    GP_COLOR_GOLDEN,
    GP_COLOR_PRAIRIE_GREEN,
    GP_COLOR_SUNSET_ORANGE,
    GP_COLOR_WHEAT_TAN,
    GP_COLOR_DARK_EARTH,
    GP_COLOR_SKY_BLUE,
    GP_COLOR_DAWN_PINK,
    GP_COLOR_SHADOW_BROWN,
    GP_COLOR_HAY_YELLOW,
    GP_COLOR_MAROON,
    GP_COLOR_SAGE,

    // ─── Core Actions ───
    tameBeast,
    harvestMeadow,
    buildStructure,
    activateArtifact,
    triggerPrairieEvent,
    resetGoldPrairie,

    // ─── Extended Actions ───
    discoverMeadow,
    checkAndClaimAchievements,
    useAbility,
    feedBeast,
    discoverRandomMeadow,

    // ─── Title Info ───
    currentTitleInfo,
    nextTitleInfo,
    titleProgress,

    // ─── Stats ───
    statsSummary,
    completionStats,

    // ─── Enriched Data ───
    enrichedBeasts,
    enrichedMeadows,
    enrichedStructures,
    enrichedInventory,
    enrichedArtifacts,
    inventoryWithDetails,
    totalInventoryValue,

    // ─── Computed Data ───
    beastsByType,
    beastsByRarity,
    availableTameCandidates,
    pendingAchievements,
    recentEventLog,
    artifactBonuses,
    topBondedBeasts,
    structuresByCategory,
    materialsByCategory,
    abilitiesByCategory,
  };
}
