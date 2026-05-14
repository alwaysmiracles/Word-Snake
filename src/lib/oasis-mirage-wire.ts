import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Oasis Mirage (幻影绿洲) — Word Snake Wire Module
// ───────────────────────────────────────────────────────────────────────────────
// A magical desert oasis where reality bends and mirages come alive. Players
// discover hidden oases, tame desert spirits, collect enchanted waters, and
// build magnificent structures across eight mystical oasis zones.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Color Theme Constants ────────────────────────────────────────────────────

const OM_COLOR_SAND_GOLD = '#D4A843';
const OM_COLOR_MIRAGE_SILVER = '#C0C8D0';
const OM_COLOR_OASIS_TURQUOISE = '#2EC4B6';
const OM_COLOR_DESERT_ROSE = '#E8767C';
const OM_COLOR_SUNSET_ORANGE = '#E88D2A';
const OM_COLOR_DEEP_SAND = '#A67C52';
const OM_COLOR_PALE_MIRAGE = '#E8E0D0';
const OM_COLOR_DARK_TURQUOISE = '#1A8A7D';
const OM_COLOR_WARM_DUNE = '#C9A96E';
const OM_COLOR_NIGHT_OASIS = '#1B2838';
const OM_COLOR_SHIMMER = '#F0E6C8';
const OM_COLOR_AMBER_GLOW = '#D4880F';

// ─── Rarity Tier Constants ────────────────────────────────────────────────────

const OM_RARITY_COMMON = 'common';
const OM_RARITY_UNUSUAL = 'unusual';
const OM_RARITY_RARE = 'rare';
const OM_RARITY_EPIC = 'epic';
const OM_RARITY_LEGENDARY = 'legendary';

const OM_RARITY_COLORS: Record<string, string> = {
  [OM_RARITY_COMMON]: '#9E9E9E',
  [OM_RARITY_UNUSUAL]: '#4CAF50',
  [OM_RARITY_RARE]: '#2196F3',
  [OM_RARITY_EPIC]: '#9C27B0',
  [OM_RARITY_LEGENDARY]: OM_COLOR_SAND_GOLD,
};

const OM_RARITY_LABELS: Record<string, { en: string; zh: string }> = {
  [OM_RARITY_COMMON]: { en: 'Common', zh: '普通' },
  [OM_RARITY_UNUSUAL]: { en: 'Unusual', zh: '不凡' },
  [OM_RARITY_RARE]: { en: 'Rare', zh: '稀有' },
  [OM_RARITY_EPIC]: { en: 'Epic', zh: '史诗' },
  [OM_RARITY_LEGENDARY]: { en: 'Legendary', zh: '传说' },
};

const OM_RARITY_MULTIPLIER: Record<string, number> = {
  [OM_RARITY_COMMON]: 1,
  [OM_RARITY_UNUSUAL]: 2,
  [OM_RARITY_RARE]: 4,
  [OM_RARITY_EPIC]: 8,
  [OM_RARITY_LEGENDARY]: 16,
};

// ─── Time of Day Constants ────────────────────────────────────────────────────

const OM_TIME_DAWN = 'dawn';
const OM_TIME_MORNING = 'morning';
const OM_TIME_NOON = 'noon';
const OM_TIME_DUSK = 'dusk';
const OM_TIME_NIGHT = 'night';

const OM_TIMES_OF_DAY = [
  { id: OM_TIME_DAWN, name: 'Dawn', nameZh: '黎明', icon: '🌅', spiritMod: 1.2, waterMod: 0.9, buildMod: 0.8, decipherMod: 1.1 },
  { id: OM_TIME_MORNING, name: 'Morning', nameZh: '上午', icon: '🌤️', spiritMod: 1.0, waterMod: 1.1, buildMod: 1.0, decipherMod: 1.0 },
  { id: OM_TIME_NOON, name: 'Noon', nameZh: '正午', icon: '☀️', spiritMod: 0.8, waterMod: 1.3, buildMod: 1.1, decipherMod: 0.8 },
  { id: OM_TIME_DUSK, name: 'Dusk', nameZh: '黄昏', icon: '🌇', spiritMod: 1.1, waterMod: 1.0, buildMod: 1.0, decipherMod: 1.3 },
  { id: OM_TIME_NIGHT, name: 'Night', nameZh: '夜晚', icon: '🌙', spiritMod: 1.5, waterMod: 0.7, buildMod: 0.9, decipherMod: 1.5 },
];

// ─── Title Constants ──────────────────────────────────────────────────────────

const OM_TITLES = [
  { name: 'Desert Wanderer', nameZh: '沙漠行者', minMiragePower: 0, icon: '🏜️' },
  { name: 'Oasis Seeker', nameZh: '绿洲追寻者', minMiragePower: 100, icon: '💧' },
  { name: 'Spirit Whisperer', nameZh: '灵语者', minMiragePower: 300, icon: '🌬️' },
  { name: 'Mirage Walker', nameZh: '幻影行者', minMiragePower: 600, icon: '🌟' },
  { name: 'Sandstorm Survivor', nameZh: '沙暴幸存者', minMiragePower: 1000, icon: '🌪️' },
  { name: 'Oasis Keeper', nameZh: '绿洲守护者', minMiragePower: 1500, icon: '🏰' },
  { name: 'Desert Sage', nameZh: '沙漠贤者', minMiragePower: 2500, icon: '🧙' },
  { name: 'Mirage Sovereign', nameZh: '幻影主宰', minMiragePower: 5000, icon: '👑' },
];

// ─── Mirage Event Definitions ────────────────────────────────────────────────

interface MirageEventDef {
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

const OM_MIRAGE_EVENTS: MirageEventDef[] = [
  { id: 'me01', name: 'Shimmering Spring', nameZh: '闪烁泉水', description: 'A hidden spring appears', effectType: 'water_bonus', effectValue: 150, duration: 0, icon: '⛲', probability: 0.08 },
  { id: 'me02', name: 'Sandstorm Warning', nameZh: '沙暴预警', description: 'Dark clouds gather on the horizon', effectType: 'power_loss', effectValue: 30, duration: 0, icon: '🌪️', probability: 0.06 },
  { id: 'me03', name: 'Spirit Awakening', nameZh: '灵体苏醒', description: 'A dormant spirit stirs beneath the dunes', effectType: 'spirit_bonus', effectValue: 40, duration: 0, icon: '👻', probability: 0.07 },
  { id: 'me04', name: 'Caravan Arrival', nameZh: '商队到来', description: 'Travelers bring news and goods', effectType: 'water_bonus', effectValue: 100, duration: 2, icon: '🐪', probability: 0.09 },
  { id: 'me05', name: 'Mirage Collapse', nameZh: '幻影崩塌', description: 'An unstable mirage shatters', effectType: 'power_loss', effectValue: 50, duration: 0, icon: '💥', probability: 0.04 },
  { id: 'me06', name: 'Rare Water Vein', nameZh: '罕见水脉', description: 'A vein of enchanted water discovered', effectType: 'water_bonus', effectValue: 300, duration: 0, icon: '💎', probability: 0.03 },
  { id: 'me07', name: 'Spirit Rebellion', nameZh: '灵体叛乱', description: 'Bound spirits grow restless', effectType: 'spirit_loss', effectValue: 80, duration: 0, icon: '⚡', probability: 0.03 },
  { id: 'me08', name: 'Oasis Bloom', nameZh: '绿洲绽放', description: 'Flowers bloom across the oasis', effectType: 'power_boost', effectValue: 60, duration: 0, icon: '🌺', probability: 0.05 },
  { id: 'me09', name: 'Ancient Inscription', nameZh: '远古铭文', description: 'Ancient runes glow on stone tablets', effectType: 'spirit_bonus', effectValue: 50, duration: 0, icon: '📜', probability: 0.06 },
  { id: 'me10', name: 'Meteor Shower', nameZh: '流星雨', description: 'Celestial fragments rain from the sky', effectType: 'power_boost', effectValue: 200, duration: 0, icon: '☄️', probability: 0.02 },
  { id: 'me11', name: 'Drought Surge', nameZh: '干旱涌潮', description: 'The desert reclaims land', effectType: 'water_loss', effectValue: 80, duration: 2, icon: '☀️', probability: 0.04 },
  { id: 'me12', name: 'Spirit Festival', nameZh: '灵体庆典', description: 'Spirits gather for a celebration', effectType: 'power_boost', effectValue: 100, duration: 0, icon: '🎉', probability: 0.06 },
  { id: 'me13', name: 'Hidden Passage', nameZh: '隐秘通道', description: 'A tunnel to another oasis reveals itself', effectType: 'zone_reveal', effectValue: 1, duration: 0, icon: '🚪', probability: 0.05 },
  { id: 'me14', name: 'Water Poisoning', nameZh: '水源毒化', description: 'Toxic minerals seep into the water', effectType: 'water_loss', effectValue: 60, duration: 0, icon: '🧪', probability: 0.04 },
  { id: 'me15', name: 'Moonlit Reflection', nameZh: '月夜倒影', description: 'The oasis reflects another world', effectType: 'decipher_bonus', effectValue: 30, duration: 0, icon: '🌕', probability: 0.03 },
  { id: 'me16', name: 'Starfall Elixir', nameZh: '星陨灵液', description: 'A celestial elixir drops from the sky', effectType: 'water_bonus', effectValue: 250, duration: 0, icon: '✨', probability: 0.03 },
];

// ─── Water Category Labels ───────────────────────────────────────────────────

const OM_WATER_CATEGORY_LABELS: Record<string, { en: string; zh: string; icon: string }> = {
  spring: { en: 'Spring', zh: '泉水', icon: '💧' },
  dew: { en: 'Dew', zh: '露水', icon: '🍃' },
  mist: { en: 'Mist', zh: '薄雾', icon: '🌫️' },
  rain: { en: 'Rain', zh: '雨水', icon: '🌧️' },
  river: { en: 'River', zh: '河水', icon: '🌊' },
  elixir: { en: 'Elixir', zh: '灵液', icon: '⚗️' },
  celestial: { en: 'Celestial', zh: '天水', icon: '🌟' },
};

// ─── Mirage Spirit Definitions (35 spirits across 5 tiers) ────────────────────

interface SpiritDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  element: string;
  illusionPower: number;
  agility: number;
  description: string;
  lore: string;
}

const OM_SPIRITS: SpiritDef[] = [
  // ── Common (7) ──
  { id: 'sp01', name: 'Dust Wisp', nameZh: '尘风微灵', rarity: OM_RARITY_COMMON, element: 'wind', illusionPower: 30, agility: 40, description: 'A tiny spirit born from desert dust devils', lore: 'Dances at the edge of vision during sandstorms' },
  { id: 'sp02', name: 'Sand Pup', nameZh: '沙灵幼崽', rarity: OM_RARITY_COMMON, element: 'earth', illusionPower: 25, agility: 35, description: 'A playful sand spirit that mimics small animals', lore: 'Leaves tiny footprints that vanish at noon' },
  { id: 'sp03', name: 'Puddle Echo', nameZh: '水潭回响', rarity: OM_RARITY_COMMON, element: 'water', illusionPower: 35, agility: 30, description: 'A spirit that dwells in temporary rain puddles', lore: 'Whispers the names of forgotten travelers' },
  { id: 'sp04', name: 'Heat Shimmer', nameZh: '热浪幻影', rarity: OM_RARITY_COMMON, element: 'fire', illusionPower: 20, agility: 50, description: 'A faint spirit riding waves of heat', lore: 'Most visible at midday when temperatures peak' },
  { id: 'sp05', name: 'Tumbleweed Ghost', nameZh: '风滚草幽魂', rarity: OM_RARITY_COMMON, element: 'wind', illusionPower: 28, agility: 45, description: 'A spirit inhabiting dried tumbleweeds', lore: 'Rolls purposefully across dunes at twilight' },
  { id: 'sp06', name: 'Bone Whistle', nameZh: '白骨哨灵', rarity: OM_RARITY_COMMON, element: 'earth', illusionPower: 22, agility: 38, description: 'A spirit that sings through hollow bones', lore: 'Herders follow its song to find lost camels' },
  { id: 'sp07', name: 'Oasis Spark', nameZh: '绿洲火花', rarity: OM_RARITY_COMMON, element: 'water', illusionPower: 32, agility: 42, description: 'A bright spirit that appears near water sources', lore: 'Guides desperate travelers to hidden springs' },
  // ── Unusual (7) ──
  { id: 'sp08', name: 'Dune Fox', nameZh: '沙丘灵狐', rarity: OM_RARITY_UNUSUAL, element: 'wind', illusionPower: 80, agility: 70, description: 'A cunning spirit fox made of swirling sand', lore: 'Can create elaborate mirages to confuse hunters' },
  { id: 'sp09', name: 'Crystal Scarab', nameZh: '水晶圣甲虫', rarity: OM_RARITY_UNUSUAL, element: 'earth', illusionPower: 90, agility: 50, description: 'A scarab spirit with a carapace of desert crystals', lore: 'Rolls the sun across the sky in ancient myths' },
  { id: 'sp10', name: 'Mirage Stag', nameZh: '幻影牡鹿', rarity: OM_RARITY_UNUSUAL, element: 'water', illusionPower: 85, agility: 75, description: 'A majestic spirit stag with antlers of light', lore: 'Appears at the boundary between real and illusion' },
  { id: 'sp11', name: 'Ember Moth', nameZh: '余烬蛾灵', rarity: OM_RARITY_UNUSUAL, element: 'fire', illusionPower: 75, agility: 80, description: 'A luminous moth spirit trailing sparks', lore: 'Its wings can ignite the air during sandstorms' },
  { id: 'sp12', name: 'Sand Serpent', nameZh: '沙蟒之灵', rarity: OM_RARITY_UNUSUAL, element: 'earth', illusionPower: 95, agility: 65, description: 'A serpent that swims through sand dunes', lore: 'Guardian of buried treasures beneath the dunes' },
  { id: 'sp13', name: 'Twilight Djinn', nameZh: '黄昏灯神', rarity: OM_RARITY_UNUSUAL, element: 'fire', illusionPower: 88, agility: 60, description: 'A minor djinn that grants small wishes at dusk', lore: 'Appears in the last light of day for exactly one hour' },
  { id: 'sp14', name: 'Rain Caller', nameZh: '唤雨灵', rarity: OM_RARITY_UNUSUAL, element: 'water', illusionPower: 82, agility: 55, description: 'A spirit that can summon brief rain showers', lore: 'Farmers leave offerings to appease its temper' },
  // ── Rare (7) ──
  { id: 'sp15', name: 'Gale Phoenix', nameZh: '烈风凤凰', rarity: OM_RARITY_RARE, element: 'wind', illusionPower: 250, agility: 150, description: 'A phoenix reborn in desert cyclones', lore: 'Its tears become enchanted water when they touch sand' },
  { id: 'sp16', name: 'Obsidian Golem', nameZh: '黑曜石魔像', rarity: OM_RARITY_RARE, element: 'earth', illusionPower: 300, agility: 40, description: 'A massive golem spirit of volcanic glass', lore: 'Protects the deepest underground oases from intruders' },
  { id: 'sp17', name: 'Sapphire Leviathan', nameZh: '蓝宝石海兽', rarity: OM_RARITY_RARE, element: 'water', illusionPower: 280, agility: 120, description: 'A leviathan that swims through underground rivers', lore: 'Creates new springs wherever it surfaces' },
  { id: 'sp18', name: 'Crimson Ifrit', nameZh: '赤焰精灵', rarity: OM_RARITY_RARE, element: 'fire', illusionPower: 270, agility: 130, description: 'A powerful ifrit spirit of pure flame', lore: 'Can forge enchanted weapons from desert glass' },
  { id: 'sp19', name: 'Jade Mantis', nameZh: '碧玉螳螂', rarity: OM_RARITY_RARE, element: 'earth', illusionPower: 240, agility: 180, description: 'A mantis spirit with blades of living jade', lore: 'Its speed rivals the desert wind itself' },
  { id: 'sp20', name: 'Silver Sphinx', nameZh: '银色斯芬克斯', rarity: OM_RARITY_RARE, element: 'wind', illusionPower: 260, agility: 100, description: 'A sphinx spirit that poses ancient riddles', lore: 'Those who answer correctly gain great power' },
  { id: 'sp21', name: 'Coral Titan', nameZh: '珊瑚泰坦', rarity: OM_RARITY_RARE, element: 'water', illusionPower: 290, agility: 50, description: 'A titan formed from fossilized coral reefs', lore: 'Carries entire ecosystems on its back' },
  // ── Epic (7) ──
  { id: 'sp22', name: 'Astral Djinn King', nameZh: '星界灯神王', rarity: OM_RARITY_EPIC, illusionPower: 800, element: 'fire', agility: 200, description: 'The king of all desert djinn, ruler of mirages', lore: 'Can reshape reality within a five-mile radius' },
  { id: 'sp23', name: 'Verdant Dragon', nameZh: '翠绿巨龙', rarity: OM_RARITY_EPIC, element: 'water', illusionPower: 850, agility: 180, description: 'A dragon that breathes life-giving mist', lore: 'Where it flies, oases bloom in its wake' },
  { id: 'sp24', name: 'Tempest Roc', nameZh: '暴风大鹏', rarity: OM_RARITY_EPIC, element: 'wind', illusionPower: 780, agility: 250, description: 'A colossal bird that commands sandstorms', lore: 'Its wingspan blocks out the sun for entire regions' },
  { id: 'sp25', name: 'Obsidian Basilisk', nameZh: '黑曜石蛇怪', rarity: OM_RARITY_EPIC, element: 'earth', illusionPower: 900, agility: 120, description: 'A basilisk whose gaze turns sand to glass', lore: 'The desert glass fields are remnants of its passing' },
  { id: 'sp26', name: 'Sunfire Kirin', nameZh: '日焰麒麟', rarity: OM_RARITY_EPIC, element: 'fire', illusionPower: 820, agility: 220, description: 'A kirin wreathed in perpetual solar flames', lore: 'Only appears during total solar eclipses' },
  { id: 'sp27', name: 'Moonlit Naga', nameZh: '月光纳迦', rarity: OM_RARITY_EPIC, element: 'water', illusionPower: 760, agility: 190, description: 'A serpent deity that dwells in lunar reflections', lore: 'Controls the tides of all underground water' },
  { id: 'sp28', name: 'Dune Weaver', nameZh: '织沙者', rarity: OM_RARITY_EPIC, element: 'earth', illusionPower: 870, agility: 160, description: 'A spider spirit that weaves dunes like silk', lore: 'Can trap entire armies in shifting sand traps' },
  // ── Legendary (7) ──
  { id: 'sp29', name: 'Eternal Oasis Guardian', nameZh: '永恒绿洲守护者', rarity: OM_RARITY_LEGENDARY, element: 'water', illusionPower: 3000, agility: 300, description: 'The primordial guardian of the first oasis', lore: 'Has existed since the desert was an ocean' },
  { id: 'sp30', name: 'Mirage Sovereign', nameZh: '幻影主宰', rarity: OM_RARITY_LEGENDARY, element: 'wind', illusionPower: 3500, agility: 350, description: 'The lord of all mirages and illusions', lore: 'Can make the impossible appear real for eternity' },
  { id: 'sp31', name: 'Sun Dragon Ankhur', nameZh: '太阳龙安库尔', rarity: OM_RARITY_LEGENDARY, element: 'fire', illusionPower: 3200, agility: 280, description: 'A dragon made of concentrated sunlight', lore: 'Dwarfs even the Epic djinn king in power' },
  { id: 'sp32', name: 'World Serpent Shakir', nameZh: '世界蛇沙基尔', rarity: OM_RARITY_LEGENDARY, element: 'earth', illusionPower: 3800, agility: 250, description: 'A serpent that encircles the entire desert', lore: 'Its movements create the dunes themselves' },
  { id: 'sp33', name: 'Celestial Phoenix Aria', nameZh: '天界凤凰阿丽亚', rarity: OM_RARITY_LEGENDARY, element: 'fire', illusionPower: 3400, agility: 320, description: 'The original phoenix from which all others descend', lore: 'Each rebirth creates a new oasis somewhere in the world' },
  { id: 'sp34', name: 'Abyssal Kraken Zal', nameZh: '深渊海怪扎尔', rarity: OM_RARITY_LEGENDARY, element: 'water', illusionPower: 3600, agility: 200, description: 'A kraken dwelling in the aquifer beneath the desert', lore: 'The underground ocean is its domain' },
  { id: 'sp35', name: 'Chaos Sandstorm Entity', nameZh: '混沌沙暴之体', rarity: OM_RARITY_LEGENDARY, element: 'wind', illusionPower: 4000, agility: 400, description: 'A sentient sandstorm of immense power', lore: 'When it sleeps, the desert is at peace; when awake, nothing survives' },
];

// ─── Oasis Zone Definitions (8) ──────────────────────────────────────────────

interface OasisZoneDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  discoveryCost: number;
  basePower: number;
  icon: string;
  specialWaters: string[];
  hazardType: string;
}

const OM_OASIS_ZONES: OasisZoneDef[] = [
  { id: 'z01', name: 'Crystal Oasis', nameZh: '水晶绿洲', description: 'An oasis surrounded by crystalline formations', discoveryCost: 0, basePower: 50, icon: '💎', specialWaters: ['w01', 'w08'], hazardType: 'heat' },
  { id: 'z02', name: 'Phantom Springs', nameZh: '幻影泉', description: 'Springs that appear and vanish with the wind', discoveryCost: 400, basePower: 80, icon: '👻', specialWaters: ['w03', 'w15'], hazardType: 'mirage' },
  { id: 'z03', name: 'Sandstorm Basin', nameZh: '沙暴盆地', description: 'A sheltered basin where storms gather power', discoveryCost: 600, basePower: 100, icon: '🌪️', specialWaters: ['w06', 'w22'], hazardType: 'storm' },
  { id: 'z04', name: 'Sunken Gardens', nameZh: '沉没花园', description: 'Gardens buried beneath centuries of sand', discoveryCost: 900, basePower: 120, icon: '🌺', specialWaters: ['w10', 'w18'], hazardType: 'sinkhole' },
  { id: 'z05', name: 'Ember Dunes', nameZh: '余烬沙丘', description: 'Dunes that glow with internal heat at night', discoveryCost: 800, basePower: 150, icon: '🔥', specialWaters: ['w04', 'w25'], hazardType: 'heat' },
  { id: 'z06', name: 'Whispering Caverns', nameZh: '低语洞窟', description: 'Underground caves filled with echoing spirits', discoveryCost: 1200, basePower: 130, icon: '🕳️', specialWaters: ['w12', 'w20'], hazardType: 'collapse' },
  { id: 'z07', name: 'Mirror Lake', nameZh: '镜面湖', description: 'A perfectly still lake that reflects other worlds', discoveryCost: 1800, basePower: 200, icon: '🪞', specialWaters: ['w09', 'w27'], hazardType: 'mirage' },
  { id: 'z08', name: 'Zenith Spire', nameZh: '天顶尖塔', description: 'A spiraling tower of rock at the desert apex', discoveryCost: 2500, basePower: 250, icon: '🗼', specialWaters: ['w14', 'w30'], hazardType: 'lightning' },
];

// ─── Enchanted Waters / Elixirs (30) ─────────────────────────────────────────

interface WaterDef {
  id: string;
  name: string;
  nameZh: string;
  baseValue: number;
  potency: number;
  category: string;
  icon: string;
}

const OM_ENCHANTED_WATERS: WaterDef[] = [
  { id: 'w01', name: 'Morning Dewdrop', nameZh: '晨露', baseValue: 20, potency: 10, category: 'dew', icon: '💧' },
  { id: 'w02', name: 'Sand Pearl Water', nameZh: '沙珠水', baseValue: 45, potency: 15, category: 'spring', icon: '🫧' },
  { id: 'w03', name: 'Phantom Mist', nameZh: '幻影雾', baseValue: 80, potency: 25, category: 'mist', icon: '🌫️' },
  { id: 'w04', name: 'Ember Essence', nameZh: '余烬精华', baseValue: 15, potency: 30, category: 'elixir', icon: '🔥' },
  { id: 'w05', name: 'Clear Spring Water', nameZh: '清泉水', baseValue: 5, potency: 5, category: 'spring', icon: '💧' },
  { id: 'w06', name: 'Storm Distillate', nameZh: '暴风馏液', baseValue: 30, potency: 20, category: 'rain', icon: '⚡' },
  { id: 'w07', name: 'Dune Perfume', nameZh: '沙丘香水', baseValue: 55, potency: 18, category: 'dew', icon: '🌸' },
  { id: 'w08', name: 'Crystal Tears', nameZh: '水晶之泪', baseValue: 120, potency: 35, category: 'celestial', icon: '💎' },
  { id: 'w09', name: 'Mirror Lake Extract', nameZh: '镜面湖精粹', baseValue: 90, potency: 28, category: 'river', icon: '🪞' },
  { id: 'w10', name: 'Garden Nectar', nameZh: '花园花蜜', baseValue: 70, potency: 22, category: 'spring', icon: '🌺' },
  { id: 'w11', name: 'Dust Filtrate', nameZh: '尘埃滤液', baseValue: 10, potency: 8, category: 'spring', icon: '🌾' },
  { id: 'w12', name: 'Cavern Dewdrop', nameZh: '洞窟露珠', baseValue: 8, potency: 12, category: 'dew', icon: '🕳️' },
  { id: 'w13', name: 'Golden Sand Water', nameZh: '金沙水', baseValue: 200, potency: 40, category: 'celestial', icon: '✨' },
  { id: 'w14', name: 'Zenith Dew', nameZh: '天顶露', baseValue: 12, potency: 10, category: 'dew', icon: '🗼' },
  { id: 'w15', name: 'Phantom Spring Water', nameZh: '幻影泉水', baseValue: 60, potency: 25, category: 'spring', icon: '👻' },
  { id: 'w16', name: 'Sunset Gradient', nameZh: '日落渐层水', baseValue: 50, potency: 18, category: 'river', icon: '🌅' },
  { id: 'w17', name: 'Moonbeam Condensate', nameZh: '月光凝结水', baseValue: 150, potency: 32, category: 'celestial', icon: '🌙' },
  { id: 'w18', name: 'Buried River Water', nameZh: '地下河水', baseValue: 65, potency: 20, category: 'river', icon: '🌊' },
  { id: 'w19', name: 'Oasis Heart Water', nameZh: '绿洲心水', baseValue: 25, potency: 15, category: 'spring', icon: '💚' },
  { id: 'w20', name: 'Echoing Water', nameZh: '回响水', baseValue: 180, potency: 30, category: 'river', icon: '🔇' },
  { id: 'w21', name: 'Nomad Flask Water', nameZh: '游民壶水', baseValue: 18, potency: 10, category: 'spring', icon: '🫗' },
  { id: 'w22', name: 'Storm Brew', nameZh: '暴风酿液', baseValue: 40, potency: 22, category: 'elixir', icon: '🍺' },
  { id: 'w23', name: 'Fossil Water', nameZh: '化石水', baseValue: 100, potency: 28, category: 'spring', icon: '🦴' },
  { id: 'w24', name: 'Amber Dew', nameZh: '琥珀露', baseValue: 110, potency: 26, category: 'dew', icon: '🟠' },
  { id: 'w25', name: 'Ember Spring Water', nameZh: '余烬泉水', baseValue: 85, potency: 30, category: 'spring', icon: '🌋' },
  { id: 'w26', name: 'Starfall Rain', nameZh: '星陨雨', baseValue: 160, potency: 35, category: 'celestial', icon: '☄️' },
  { id: 'w27', name: 'Mirror Reflection', nameZh: '镜中倒影水', baseValue: 130, potency: 28, category: 'river', icon: '🪞' },
  { id: 'w28', name: 'Cactus Juice', nameZh: '仙人掌汁', baseValue: 8, potency: 8, category: 'elixir', icon: '🌵' },
  { id: 'w29', name: 'Ancient Reservoir Water', nameZh: '古水库水', baseValue: 140, potency: 26, category: 'river', icon: '🏺' },
  { id: 'w30', name: 'Zenith Essence', nameZh: '天顶精华', baseValue: 250, potency: 45, category: 'celestial', icon: '🌟' },
];

// ─── Oasis Structures (25, upgradeable to Lv10) ──────────────────────────────

interface OasisStructureDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  powerPerLevel: number;
  icon: string;
  category: string;
}

const OM_OASIS_STRUCTURES: OasisStructureDef[] = [
  { id: 'os01', name: 'Spirit Well', nameZh: '灵体之井', description: 'A well that attracts and soothes spirits', baseCost: 150, costMultiplier: 1.6, maxLevel: 10, powerPerLevel: 12, icon: '🪣', category: 'spirit' },
  { id: 'os02', name: 'Water Repository', nameZh: '蓄水库', description: 'Stores enchanted waters safely', baseCost: 120, costMultiplier: 1.5, maxLevel: 10, powerPerLevel: 8, icon: '💦', category: 'water' },
  { id: 'os03', name: 'Mirage Tower', nameZh: '幻影塔', description: 'Amplifies mirage deciphering ability', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, powerPerLevel: 10, icon: '🗼', category: 'decipher' },
  { id: 'os04', name: 'Sandstone Forge', nameZh: '砂岩锻造台', description: 'Crafts tools from enchanted sandstone', baseCost: 130, costMultiplier: 1.5, maxLevel: 10, powerPerLevel: 9, icon: '🔨', category: 'craft' },
  { id: 'os05', name: 'Palm Pavilion', nameZh: '棕榈凉亭', description: 'Provides shade that boosts spirit energy', baseCost: 80, costMultiplier: 1.4, maxLevel: 10, powerPerLevel: 6, icon: '🌴', category: 'spirit' },
  { id: 'os06', name: 'Crystal Garden', nameZh: '水晶花园', description: 'Grows mirage crystals for power', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, powerPerLevel: 14, icon: '💎', category: 'power' },
  { id: 'os07', name: 'Elixir Distillery', nameZh: '灵液蒸馏所', description: 'Refines raw waters into potent elixirs', baseCost: 90, costMultiplier: 1.4, maxLevel: 10, powerPerLevel: 7, icon: '⚗️', category: 'water' },
  { id: 'os08', name: 'Ancient Library', nameZh: '远古图书馆', description: 'Contains knowledge of mirage deciphering', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, powerPerLevel: 11, icon: '📚', category: 'decipher' },
  { id: 'os09', name: 'Sandstorm Shelter', nameZh: '避风港', description: 'Protects the oasis from sandstorm damage', baseCost: 160, costMultiplier: 1.6, maxLevel: 10, powerPerLevel: 5, icon: '🏚️', category: 'defense' },
  { id: 'os10', name: 'Trading Post', nameZh: '驿站', description: 'Hub for exchanging waters and resources', baseCost: 140, costMultiplier: 1.5, maxLevel: 10, powerPerLevel: 10, icon: '🏪', category: 'economy' },
  { id: 'os11', name: 'Star Observatory', nameZh: '星辰观测台', description: 'Reads celestial signs for guidance', baseCost: 250, costMultiplier: 1.8, maxLevel: 10, powerPerLevel: 8, icon: '🔭', category: 'decipher' },
  { id: 'os12', name: 'Spirit Arena', nameZh: '灵体竞技场', description: 'Where spirits compete and grow stronger', baseCost: 220, costMultiplier: 1.7, maxLevel: 10, powerPerLevel: 9, icon: '🏟️', category: 'spirit' },
  { id: 'os13', name: 'Lotus Pool', nameZh: '莲花池', description: 'Sacred pool that purifies enchanted waters', baseCost: 110, costMultiplier: 1.4, maxLevel: 10, powerPerLevel: 7, icon: '🪷', category: 'water' },
  { id: 'os14', name: 'Glass Blower Hut', nameZh: '玻璃工坊', description: 'Creates vessels for storing enchanted waters', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, powerPerLevel: 8, icon: '🏺', category: 'craft' },
  { id: 'os15', name: 'Caravansary', nameZh: '商队客栈', description: 'Shelters travelers and earns water income', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, powerPerLevel: 12, icon: '⛺', category: 'economy' },
  { id: 'os16', name: 'Wind Harp Shrine', nameZh: '风琴神殿', description: 'Plays melodies that calm restless spirits', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, powerPerLevel: 10, icon: '🎵', category: 'spirit' },
  { id: 'os17', name: 'Desert Botanical Lab', nameZh: '沙漠植物实验室', description: 'Studies desert flora for medicinal uses', baseCost: 170, costMultiplier: 1.6, maxLevel: 10, powerPerLevel: 11, icon: '🧪', category: 'decipher' },
  { id: 'os18', name: 'Oasis Palace', nameZh: '绿洲宫殿', description: 'Seat of power in the oasis domain', baseCost: 300, costMultiplier: 1.8, maxLevel: 10, powerPerLevel: 16, icon: '🏰', category: 'power' },
  { id: 'os19', name: 'Rune Stone Circle', nameZh: '符文石阵', description: 'Ancient runes that amplify all spirit power', baseCost: 230, costMultiplier: 1.8, maxLevel: 10, powerPerLevel: 13, icon: '🗿', category: 'power' },
  { id: 'os20', name: 'Hidden Garden Gate', nameZh: '隐秘花园之门', description: 'Gateway to a secret garden dimension', baseCost: 280, costMultiplier: 1.9, maxLevel: 10, powerPerLevel: 14, icon: '🚪', category: 'decipher' },
  { id: 'os21', name: 'Moonlight Basin', nameZh: '月光盆', description: 'Collects moon-charged water at night', baseCost: 130, costMultiplier: 1.5, maxLevel: 10, powerPerLevel: 9, icon: '🌙', category: 'water' },
  { id: 'os22', name: 'Dune Fortification', nameZh: '沙丘堡垒', description: 'Defensive walls made of hardened dune glass', baseCost: 190, costMultiplier: 1.6, maxLevel: 10, powerPerLevel: 6, icon: '🧱', category: 'defense' },
  { id: 'os23', name: 'Spirit Binding Altar', nameZh: '灵体绑定祭坛', description: 'Enables binding of powerful spirits', baseCost: 260, costMultiplier: 1.8, maxLevel: 10, powerPerLevel: 12, icon: '🔄', category: 'spirit' },
  { id: 'os24', name: 'Scrying Pool', nameZh: '占卜池', description: 'Reveals distant oases and hidden spirits', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, powerPerLevel: 10, icon: '🔮', category: 'decipher' },
  { id: 'os25', name: 'Eternal Flame Spire', nameZh: '永恒之焰尖塔', description: 'A tower crowned with undying magical fire', baseCost: 400, costMultiplier: 2.0, maxLevel: 10, powerPerLevel: 20, icon: '🗼', category: 'power' },
];

// ─── Mirage Abilities (22) ───────────────────────────────────────────────────

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

const OM_ABILITIES: AbilityDef[] = [
  { id: 'ma01', name: 'Mirage Decipher', nameZh: '幻影解读', description: 'Reveal and decode a hidden mirage', cooldown: 3, cost: 50, effectType: 'instant_power', effectValue: 100, icon: '🔍', category: 'decipher' },
  { id: 'ma02', name: 'Spirit Bind', nameZh: '灵体绑定', description: 'Attempt to bind a wandering spirit', cooldown: 5, cost: 80, effectType: 'spirit_gain', effectValue: 1, icon: '🔗', category: 'spirit' },
  { id: 'ma03', name: 'Water Harvest', nameZh: '水源采集', description: 'Collect enchanted water from nearby springs', cooldown: 3, cost: 30, effectType: 'water_gain', effectValue: 80, icon: '💧', category: 'water' },
  { id: 'ma04', name: 'Dune Shield', nameZh: '沙丘护盾', description: 'Raise a protective sand barrier', cooldown: 6, cost: 120, effectType: 'defense_boost', effectValue: 2, icon: '🛡️', category: 'defense' },
  { id: 'ma05', name: 'Oasis Bloom', nameZh: '绿洲绽放', description: 'Accelerate oasis growth for 2 cycles', cooldown: 4, cost: 60, effectType: 'build_boost', effectValue: 2, icon: '🌺', category: 'building' },
  { id: 'ma06', name: 'Sandstorm Call', nameZh: '召唤沙暴', description: 'Summon a brief sandstorm to scatter enemies', cooldown: 7, cost: 150, effectType: 'power_boost', effectValue: 200, icon: '🌪️', category: 'power' },
  { id: 'ma07', name: 'Spirit Communion', nameZh: '灵体共鸣', description: 'Communicate with all bound spirits at once', cooldown: 5, cost: 100, effectType: 'spirit_boost', effectValue: 50, icon: '👻', category: 'spirit' },
  { id: 'ma08', name: 'Elixir Brew', nameZh: '灵液酿造', description: 'Brew a random powerful elixir', cooldown: 4, cost: 70, effectType: 'water_gain', effectValue: 150, icon: '⚗️', category: 'water' },
  { id: 'ma09', name: 'Crystal Resonance', nameZh: '水晶共振', description: 'Amplify crystal power for 1 cycle', cooldown: 6, cost: 90, effectType: 'power_multiplier', effectValue: 2, icon: '💎', category: 'power' },
  { id: 'ma10', name: 'Ancient Vision', nameZh: '远古视觉', description: 'See through mirages to find hidden treasures', cooldown: 4, cost: 80, effectType: 'decipher_reveal', effectValue: 3, icon: '👁️', category: 'decipher' },
  { id: 'ma11', name: 'Desert Sprint', nameZh: '沙漠冲刺', description: 'Move swiftly between oasis zones', cooldown: 3, cost: 40, effectType: 'instant_power', effectValue: 60, icon: '🏃', category: 'travel' },
  { id: 'ma12', name: 'Moonbeam Focus', nameZh: '月光聚焦', description: 'Concentrate moonlight into spirit energy', cooldown: 5, cost: 100, effectType: 'spirit_gain', effectValue: 2, icon: '🌙', category: 'spirit' },
  { id: 'ma13', name: 'Tidal Surge', nameZh: '潮涌', description: 'Release underground water pressure', cooldown: 6, cost: 130, effectType: 'water_gain', effectValue: 250, icon: '🌊', category: 'water' },
  { id: 'ma14', name: 'Rune Activation', nameZh: '符文激活', description: 'Activate dormant runes in the oasis', cooldown: 8, cost: 200, effectType: 'power_boost', effectValue: 350, icon: '✨', category: 'power' },
  { id: 'ma15', name: 'Mirage Clone', nameZh: '幻影分身', description: 'Create illusion copies to confuse threats', cooldown: 5, cost: 110, effectType: 'defense_boost', effectValue: 3, icon: '🎭', category: 'defense' },
  { id: 'ma16', name: 'Spirit Feast', nameZh: '灵体盛宴', description: 'All bound spirits gain power rapidly', cooldown: 7, cost: 180, effectType: 'spirit_boost', effectValue: 100, icon: '🎉', category: 'spirit' },
  { id: 'ma17', name: 'Quick Build', nameZh: '极速建造', description: 'Reduce structure costs by 40% for 2 cycles', cooldown: 6, cost: 120, effectType: 'build_discount', effectValue: 0.4, icon: '🏗️', category: 'building' },
  { id: 'ma18', name: 'Rare Spirit Call', nameZh: '召唤稀有灵体', description: 'Attract a rare or better spirit', cooldown: 9, cost: 300, effectType: 'rare_spirit', effectValue: 1, icon: '🌟', category: 'spirit' },
  { id: 'ma19', name: 'Deep Scry', nameZh: '深度占卜', description: 'Reveal all hidden oasis zones briefly', cooldown: 5, cost: 90, effectType: 'zone_reveal', effectValue: 2, icon: '🔮', category: 'decipher' },
  { id: 'ma20', name: 'Emergency Oasis', nameZh: '紧急绿洲', description: 'Create a temporary emergency water source', cooldown: 3, cost: 40, effectType: 'water_gain', effectValue: 120, icon: '🚰', category: 'water' },
  { id: 'ma21', name: 'Mirage Collapse', nameZh: '幻影崩塌', description: 'Collapse all mirages into pure energy', cooldown: 10, cost: 500, effectType: 'reset_cooldowns', effectValue: 0, icon: '💥', category: 'special' },
  { id: 'ma22', name: 'Oasis Harmony', nameZh: '绿洲和谐', description: 'Double all oasis output for 2 cycles', cooldown: 9, cost: 400, effectType: 'double_output', effectValue: 2, icon: '☮️', category: 'special' },
];

// ─── Achievement Definitions (18) ─────────────────────────────────────────────

interface AchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  condition: string;
  reward: { water: number; power: number };
  icon: string;
}

const OM_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'oma01', name: 'First Spirit', nameZh: '首只灵体', description: 'Bind your first mirage spirit', condition: 'spirits_bound >= 1', reward: { water: 50, power: 10 }, icon: '👻' },
  { id: 'oma02', name: 'Spirit Collector', nameZh: '灵体收藏家', description: 'Bind 10 mirage spirits', condition: 'spirits_bound >= 10', reward: { water: 200, power: 40 }, icon: '📦' },
  { id: 'oma03', name: 'Spirit Master', nameZh: '灵体大师', description: 'Bind all 35 mirage spirits', condition: 'spirits_bound >= 35', reward: { water: 5000, power: 1000 }, icon: '👑' },
  { id: 'oma04', name: 'Zone Explorer', nameZh: '区域探索者', description: 'Discover 3 oasis zones', condition: 'zones_discovered >= 3', reward: { water: 150, power: 30 }, icon: '🗺️' },
  { id: 'oma05', name: 'Desert Cartographer', nameZh: '沙漠制图师', description: 'Discover all 8 oasis zones', condition: 'zones_discovered >= 8', reward: { water: 3000, power: 600 }, icon: '🌍' },
  { id: 'oma06', name: 'Grand Architect', nameZh: '大建筑师', description: 'Upgrade any structure to level 10', condition: 'max_structure_level >= 10', reward: { water: 500, power: 100 }, icon: '🏗️' },
  { id: 'oma07', name: 'Oasis Magnificence', nameZh: '绿洲华美', description: 'Build all 25 oasis structures', condition: 'structures_built >= 25', reward: { water: 2000, power: 400 }, icon: '🏰' },
  { id: 'oma08', name: 'Water Hoarder', nameZh: '囤水者', description: 'Accumulate 5,000 total water collected', condition: 'total_water >= 5000', reward: { water: 800, power: 150 }, icon: '💧' },
  { id: 'oma09', name: 'Elixir Master', nameZh: '灵液大师', description: 'Collect 30 enchanted waters', condition: 'waters_collected >= 30', reward: { water: 1000, power: 200 }, icon: '⚗️' },
  { id: 'oma10', name: 'Decipher Expert', nameZh: '解读专家', description: 'Decipher 50 mirages total', condition: 'mirages_deciphered >= 50', reward: { water: 600, power: 120 }, icon: '🔍' },
  { id: 'oma11', name: 'Sandstorm Veteran', nameZh: '沙暴老手', description: 'Survive 10 sandstorms', condition: 'sandstorms_survived >= 10', reward: { water: 700, power: 140 }, icon: '🌪️' },
  { id: 'oma12', name: 'Legendary Tamer', nameZh: '传说驯灵师', description: 'Bind 5 legendary spirits', condition: 'legendary_spirits >= 5', reward: { water: 3000, power: 600 }, icon: '🌟' },
  { id: 'oma13', name: 'Oasis Builder', nameZh: '绿洲建造者', description: 'Build structures in 5 different zones', condition: 'zones_with_structures >= 5', reward: { water: 500, power: 100 }, icon: '🏗️' },
  { id: 'oma14', name: 'Water Guardian', nameZh: '水源守护者', description: 'Harvest water 20 times', condition: 'water_harvests >= 20', reward: { water: 1000, power: 150 }, icon: '🚰' },
  { id: 'oma15', name: 'Ability Adept', nameZh: '术法熟手', description: 'Activate 30 mirage abilities', condition: 'abilities_used >= 30', reward: { water: 800, power: 250 }, icon: '🔮' },
  { id: 'oma16', name: 'Mirage Powerhouse', nameZh: '幻影强权', description: 'Reach 3,000 total mirage power', condition: 'power >= 3000', reward: { water: 4000, power: 800 }, icon: '✨' },
  { id: 'oma17', name: 'Daily Explorer', nameZh: '每日探索者', description: 'Complete 7 daily quests', condition: 'daily_quests_completed >= 7', reward: { water: 500, power: 100 }, icon: '📅' },
  { id: 'oma18', name: 'Mirage Sovereign', nameZh: '幻影主宰', description: 'Achieve the title of Mirage Sovereign', condition: 'title_index >= 7', reward: { water: 10000, power: 2000 }, icon: '🏅' },
];

// ─── State Interface Types ────────────────────────────────────────────────────

interface BoundSpirit {
  id: string;
  boundAt: number;
}

interface DiscoveredZone {
  id: string;
  discovered: boolean;
  power: number;
  stability: number;
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

interface CollectedWater {
  id: string;
  collectedAt: number;
}

interface DailyQuest {
  id: string;
  description: string;
  targetType: string;
  targetAmount: number;
  currentAmount: number;
  reward: { water: number; power: number };
  expiresAt: number;
  completed: boolean;
}

interface EventLogEntry {
  id: string;
  cycleNumber: number;
  type: 'spirit' | 'zone' | 'structure' | 'ability' | 'water' | 'mirage' | 'sandstorm' | 'achievement' | 'time' | 'daily' | 'event';
  message: string;
  messageZh: string;
  waterChange: number;
  powerChange: number;
  timestamp: number;
}

interface ActiveEvent {
  eventId: string;
  remainingCycles: number;
}

interface WaterPriceSnapshot {
  waterId: string;
  currentValue: number;
  valueChange: number;
}

interface OasisMirageState {
  spirits: BoundSpirit[];
  zones: DiscoveredZone[];
  structures: StructureState[];
  abilities: AbilityState[];
  achievements: AchievementState[];
  collectedWaters: CollectedWater[];
  currentZone: string;
  waterReserve: number;
  miragePower: number;
  totalWaterEarned: number;
  titleIndex: number;
  totalMiragePower: number;
  dailyQuest: DailyQuest | null;
  miragesDeciphered: number;
  abilitiesUsed: number;
  sandstormsSurvived: number;
  waterHarvests: number;
  dailyQuestsCompleted: number;
  cycleCount: number;
  currentTimeOfDay: string;
  eventLog: EventLogEntry[];
  activeEvents: ActiveEvent[];
  waterPrices: WaterPriceSnapshot[];
  boundSpiritCount: number;
  zonesWithStructures: number;
}

// ─── Output Interface Types ───────────────────────────────────────────────────

interface OasisMirageStats {
  totalSpirits: number;
  spiritsByRarity: Record<string, number>;
  zonesDiscovered: number;
  totalStructureLevels: number;
  maxStructureLevel: number;
  totalWatersCollected: number;
  miragePower: number;
  currentTitle: string;
  currentTitleZh: string;
  totalMiragePower: number;
  waterReserve: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  cycleCount: number;
  currentTimeOfDay: string;
  eventsHandled: number;
}

interface OasisMirageProgress {
  nextTitle: { name: string; nameZh: string; progress: number; required: number };
  spiritCompletion: number;
  zoneCompletion: number;
  structureCompletion: number;
  achievementCompletion: number;
  overallCompletion: number;
}

interface SandstormReadiness {
  level: string;
  label: string;
  labelZh: string;
  color: string;
  recommended: number;
  current: number;
}

interface WaterReserveHealth {
  level: string;
  label: string;
  labelZh: string;
  color: string;
  surplus: number;
}

// ─── Desert Factions ─────────────────────────────────────────────────────────

const OM_FACTIONS = [
  { id: 'df01', name: 'Sand Nomads', nameZh: '沙游牧民', maxStanding: 100 },
  { id: 'df02', name: 'Tomb Guardians', nameZh: '陵墓守卫', maxStanding: 100 },
  { id: 'df03', name: 'Water Merchants', nameZh: '水商', maxStanding: 100 },
  { id: 'df04', name: 'Crystal Miners', nameZh: '水晶矿工', maxStanding: 100 },
  { id: 'df05', name: 'Spirit Shamans', nameZh: '灵体萨满', maxStanding: 100 },
  { id: 'df06', name: 'Mirage Knights', nameZh: '幻影骑士', maxStanding: 100 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions (outside the hook)
// ═══════════════════════════════════════════════════════════════════════════════

function createInitialState(): OasisMirageState {
  return {
    spirits: [],
    zones: OM_OASIS_ZONES.map(z => ({
      id: z.id,
      discovered: z.id === 'z01',
      power: z.id === 'z01' ? z.basePower : 0,
      stability: z.id === 'z01' ? 100 : 0,
    })),
    structures: OM_OASIS_STRUCTURES.map(s => ({
      id: s.id,
      level: 0,
    })),
    abilities: OM_ABILITIES.map(a => ({
      id: a.id,
      currentCooldown: 0,
      timesUsed: 0,
    })),
    achievements: OM_ACHIEVEMENTS.map(a => ({
      id: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    collectedWaters: [],
    currentZone: 'z01',
    waterReserve: 300,
    miragePower: 50,
    totalWaterEarned: 300,
    titleIndex: 0,
    totalMiragePower: 50,
    dailyQuest: null,
    miragesDeciphered: 0,
    abilitiesUsed: 0,
    sandstormsSurvived: 0,
    waterHarvests: 0,
    dailyQuestsCompleted: 0,
    cycleCount: 0,
    currentTimeOfDay: OM_TIME_DAWN,
    eventLog: [],
    activeEvents: [],
    waterPrices: OM_ENCHANTED_WATERS.map(w => ({
      waterId: w.id,
      currentValue: w.baseValue,
      valueChange: 0,
    })),
    boundSpiritCount: 0,
    zonesWithStructures: 0,
  };
}

function rollSpiritRarity(): string {
  const roll = Math.random() * 100;
  if (roll < 35) return OM_RARITY_COMMON;
  if (roll < 60) return OM_RARITY_UNUSUAL;
  if (roll < 80) return OM_RARITY_RARE;
  if (roll < 94) return OM_RARITY_EPIC;
  return OM_RARITY_LEGENDARY;
}

function generateDailyQuest(): DailyQuest {
  const questTypes = [
    { type: 'spirit', descriptionPrefix: 'Bind' },
    { type: 'water', descriptionPrefix: 'Collect' },
    { type: 'mirage', descriptionPrefix: 'Decipher' },
  ];
  const chosen = questTypes[Math.floor(Math.random() * questTypes.length)];
  const amount = Math.floor(Math.random() * 4) + 2;
  const waterReward = amount * 30 + Math.floor(Math.random() * 80) + 40;
  const powerReward = amount * 15 + Math.floor(Math.random() * 20) + 10;
  const now = Date.now();
  return {
    id: `quest_${now}`,
    description: `${chosen.descriptionPrefix} ${amount} targets for the oasis`,
    targetType: chosen.type,
    targetAmount: amount,
    currentAmount: 0,
    reward: { water: waterReward, power: powerReward },
    expiresAt: now + 24 * 60 * 60 * 1000,
    completed: false,
  };
}

function calculateUpgradeCost(structureDef: OasisStructureDef, currentLevel: number): number {
  return Math.floor(structureDef.baseCost * Math.pow(structureDef.costMultiplier, currentLevel));
}

function calculateTotalMiragePower(
  zones: DiscoveredZone[],
  structures: StructureState[],
  spirits: BoundSpirit[],
): number {
  let power = 0;
  for (const zone of zones) {
    if (zone.discovered) {
      power += zone.power;
    }
  }
  for (const struct of structures) {
    const def = OM_OASIS_STRUCTURES.find(s => s.id === struct.id);
    if (def && struct.level > 0) {
      power += def.powerPerLevel * struct.level;
    }
  }
  for (const spirit of spirits) {
    const def = OM_SPIRITS.find(s => s.id === spirit.id);
    if (def) {
      const multiplier = OM_RARITY_MULTIPLIER[def.rarity] || 1;
      power += Math.floor(def.illusionPower * 0.1 * multiplier);
    }
  }
  return power;
}

function determineTitleIndex(power: number): number {
  for (let i = OM_TITLES.length - 1; i >= 0; i--) {
    if (power >= OM_TITLES[i].minMiragePower) return i;
  }
  return 0;
}

function evaluateAchievements(state: OasisMirageState): AchievementState[] {
  const metrics: Record<string, number> = {
    spirits_bound: state.spirits.length,
    zones_discovered: state.zones.filter(z => z.discovered).length,
    max_structure_level: Math.max(...state.structures.map(s => s.level), 0),
    structures_built: state.structures.filter(s => s.level > 0).length,
    total_water: state.totalWaterEarned,
    waters_collected: state.collectedWaters.length,
    mirages_deciphered: state.miragesDeciphered,
    sandstorms_survived: state.sandstormsSurvived,
    legendary_spirits: state.spirits.filter(sid => {
      const def = OM_SPIRITS.find(s => s.id === sid.id);
      return def && def.rarity === OM_RARITY_LEGENDARY;
    }).length,
    zones_with_structures: state.zonesWithStructures,
    water_harvests: state.waterHarvests,
    abilities_used: state.abilitiesUsed,
    power: state.totalMiragePower,
    daily_quests_completed: state.dailyQuestsCompleted,
    title_index: state.titleIndex,
  };

  return state.achievements.map(ach => {
    if (ach.unlocked) return ach;
    const def = OM_ACHIEVEMENTS.find(a => a.id === ach.id);
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

function makeEventLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}

function advanceTimeOfDay(currentTime: string): string {
  const order = [OM_TIME_DAWN, OM_TIME_MORNING, OM_TIME_NOON, OM_TIME_DUSK, OM_TIME_NIGHT];
  const idx = order.indexOf(currentTime);
  return order[(idx + 1) % order.length];
}

function fluctuateWaterPrices(prices: WaterPriceSnapshot[]): WaterPriceSnapshot[] {
  return prices.map(wp => {
    const water = OM_ENCHANTED_WATERS.find(w => w.id === wp.waterId);
    if (!water) return wp;
    const change = water.baseValue * water.potency * 0.001 * (Math.random() - 0.5) * 2;
    const minPrice = Math.floor(water.baseValue * 0.3);
    const maxPrice = Math.floor(water.baseValue * 2.5);
    const newPrice = Math.floor(wp.currentValue + change);
    const clampedPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
    return { waterId: wp.waterId, currentValue: clampedPrice, valueChange: clampedPrice - wp.currentValue };
  });
}

function rollMirageEvent(): MirageEventDef | null {
  const roll = Math.random();
  let cumulative = 0;
  for (const evt of OM_MIRAGE_EVENTS) {
    cumulative += evt.probability;
    if (roll < cumulative) return evt;
  }
  return null;
}

function countZonesWithStructures(zones: DiscoveredZone[], structures: StructureState[]): number {
  let count = 0;
  for (const zone of zones) {
    if (!zone.discovered) continue;
    const hasStructure = structures.some(s => s.level > 0);
    if (hasStructure) count++;
  }
  return Math.max(count, zones.filter(z => z.discovered).length > 1 ? 1 : 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export default function useOasisMirage() {
  const [state, setState] = useState<OasisMirageState>(createInitialState);
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
  }, [state.dailyQuest, state.cycleCount]);

  // ─── Internal: log event to event log ──────────────────────────────────
  const logEvent = useCallback((
    type: EventLogEntry['type'],
    message: string,
    messageZh: string,
    waterChange: number,
    powerChange: number,
  ) => {
    setState(prev => ({
      ...prev,
      eventLog: [
        ...prev.eventLog.slice(-199),
        {
          id: makeEventLogId(),
          cycleNumber: prev.cycleCount,
          type,
          message,
          messageZh,
          waterChange,
          powerChange,
          timestamp: Date.now(),
        },
      ],
    }));
  }, []);

  // ─── Internal: recalculate power and title ────────────────────────────
  const recalcPower = useCallback((
    zones: DiscoveredZone[],
    structures: StructureState[],
    spirits: BoundSpirit[],
  ): { power: number; titleIndex: number } => {
    const power = calculateTotalMiragePower(zones, structures, spirits);
    const titleIndex = determineTitleIndex(power);
    return { power, titleIndex };
  }, []);

  // ─── Bind Spirit ──────────────────────────────────────────────────────
  const bindSpirit = useCallback(() => {
    setState(prev => {
      const alreadyBound = new Set(prev.spirits.map(s => s.id));
      const rarity = rollSpiritRarity();
      const candidates = OM_SPIRITS.filter(s => s.rarity === rarity && !alreadyBound.has(s.id));

      let chosen: SpiritDef;
      if (candidates.length > 0) {
        chosen = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        const anyUnbound = OM_SPIRITS.filter(s => !alreadyBound.has(s.id));
        if (anyUnbound.length === 0) return prev;
        chosen = anyUnbound[Math.floor(Math.random() * anyUnbound.length)];
      }

      const timeDef = OM_TIMES_OF_DAY.find(t => t.id === prev.currentTimeOfDay);
      const spiritMod = timeDef?.spiritMod ?? 1;
      const bonusPower = Math.floor(chosen.illusionPower * 0.3 * spiritMod);
      const newSpirits = [...prev.spirits, { id: chosen.id, boundAt: Date.now() }];
      const { power, titleIndex } = recalcPower(prev.zones, prev.structures, newSpirits);

      return {
        ...prev,
        spirits: newSpirits,
        miragePower: power,
        totalMiragePower: power,
        waterReserve: prev.waterReserve - 20,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'spirit' as const,
            message: `Bound ${chosen.name} (${chosen.rarity}, ${chosen.element})`,
            messageZh: `绑定${chosen.nameZh}（${OM_RARITY_LABELS[chosen.rarity]?.zh ?? ''}，${chosen.element}）`,
            waterChange: -20,
            powerChange: bonusPower,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcPower]);

  // ─── Discover Zone ────────────────────────────────────────────────────
  const discoverZone = useCallback((zoneId: string) => {
    setState(prev => {
      const zoneState = prev.zones.find(z => z.id === zoneId);
      const zoneDef = OM_OASIS_ZONES.find(z => z.id === zoneId);
      if (!zoneState || !zoneDef || zoneState.discovered) return prev;
      if (prev.waterReserve < zoneDef.discoveryCost) return prev;

      const updatedZones = prev.zones.map(z =>
        z.id === zoneId ? { ...z, discovered: true, power: zoneDef.basePower, stability: 80 } : z
      );
      const { power, titleIndex } = recalcPower(updatedZones, prev.structures, prev.spirits);

      return {
        ...prev,
        zones: updatedZones,
        waterReserve: prev.waterReserve - zoneDef.discoveryCost,
        totalMiragePower: power,
        miragePower: power,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'zone' as const,
            message: `Discovered ${zoneDef.name}`,
            messageZh: `发现${zoneDef.nameZh}`,
            waterChange: -zoneDef.discoveryCost,
            powerChange: zoneDef.basePower,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcPower]);

  // ─── Build Structure ──────────────────────────────────────────────────
  const buildStructure = useCallback((structureId: string) => {
    setState(prev => {
      const structState = prev.structures.find(s => s.id === structureId);
      const structDef = OM_OASIS_STRUCTURES.find(s => s.id === structureId);
      if (!structState || !structDef || structState.level > 0) return prev;
      if (prev.waterReserve < structDef.baseCost) return prev;

      const updatedStructures = prev.structures.map(s =>
        s.id === structureId ? { ...s, level: 1 } : s
      );
      const { power, titleIndex } = recalcPower(prev.zones, updatedStructures, prev.spirits);
      const zwStructures = countZonesWithStructures(prev.zones, updatedStructures);

      return {
        ...prev,
        structures: updatedStructures,
        waterReserve: prev.waterReserve - structDef.baseCost,
        totalMiragePower: power,
        miragePower: power,
        zonesWithStructures: zwStructures,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'structure' as const,
            message: `Built ${structDef.name} (Lv1)`,
            messageZh: `建造${structDef.nameZh}（1级）`,
            waterChange: -structDef.baseCost,
            powerChange: structDef.powerPerLevel,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcPower]);

  // ─── Upgrade Structure ─────────────────────────────────────────────────
  const upgradeStructure = useCallback((structureId: string) => {
    setState(prev => {
      const structState = prev.structures.find(s => s.id === structureId);
      const structDef = OM_OASIS_STRUCTURES.find(s => s.id === structureId);
      if (!structState || !structDef || structState.level >= structDef.maxLevel) return prev;

      const cost = calculateUpgradeCost(structDef, structState.level);
      if (prev.waterReserve < cost) return prev;

      const updatedStructures = prev.structures.map(s =>
        s.id === structureId ? { ...s, level: s.level + 1 } : s
      );
      const { power, titleIndex } = recalcPower(prev.zones, updatedStructures, prev.spirits);

      return {
        ...prev,
        structures: updatedStructures,
        waterReserve: prev.waterReserve - cost,
        totalMiragePower: power,
        miragePower: power,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'structure' as const,
            message: `Upgraded ${structDef.name} to Lv${structState.level + 1}`,
            messageZh: `${structDef.nameZh}升级至${structState.level + 1}级`,
            waterChange: -cost,
            powerChange: structDef.powerPerLevel,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcPower]);

  // ─── Activate Ability ──────────────────────────────────────────────────
  const activateAbility = useCallback((abilityId: string) => {
    setState(prev => {
      const abilityState = prev.abilities.find(a => a.id === abilityId);
      const abilityDef = OM_ABILITIES.find(a => a.id === abilityId);
      if (!abilityState || !abilityDef || abilityState.currentCooldown > 0) return prev;
      if (prev.waterReserve < abilityDef.cost) return prev;

      let waterChange = -abilityDef.cost;
      let powerChange = 0;
      let spiritChange = 0;

      switch (abilityDef.effectType) {
        case 'instant_power':
          powerChange = abilityDef.effectValue;
          waterChange += 0;
          break;
        case 'spirit_gain':
          spiritChange = abilityDef.effectValue;
          break;
        case 'water_gain':
          waterChange += abilityDef.effectValue;
          break;
        case 'spirit_boost':
          powerChange = abilityDef.effectValue;
          break;
        case 'power_boost':
          powerChange = abilityDef.effectValue;
          break;
        case 'power_multiplier':
          powerChange = Math.floor(prev.totalMiragePower * (abilityDef.effectValue - 1));
          break;
        default:
          break;
      }

      const updatedAbilities = prev.abilities.map(a =>
        a.id === abilityId
          ? { ...a, currentCooldown: abilityDef.effectType === 'reset_cooldowns' ? 0 : abilityDef.cooldown, timesUsed: a.timesUsed + 1 }
          : (abilityDef.effectType === 'reset_cooldowns' ? { ...a, currentCooldown: 0 } : a)
      );

      const newSpirits = [...prev.spirits];
      if (spiritChange > 0) {
        const alreadyBound = new Set(prev.spirits.map(s => s.id));
        for (let i = 0; i < spiritChange; i++) {
          const rarity = rollSpiritRarity();
          const candidates = OM_SPIRITS.filter(s => s.rarity === rarity && !alreadyBound.has(s.id));
          if (candidates.length > 0) {
            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            newSpirits.push({ id: chosen.id, boundAt: Date.now() });
            alreadyBound.add(chosen.id);
          }
        }
      }

      const { power, titleIndex } = recalcPower(prev.zones, prev.structures, newSpirits);

      return {
        ...prev,
        abilities: tickCooldowns(updatedAbilities),
        spirits: newSpirits,
        waterReserve: prev.waterReserve + waterChange,
        totalWaterEarned: prev.totalWaterEarned + Math.max(0, waterChange),
        totalMiragePower: power,
        miragePower: power,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
        abilitiesUsed: prev.abilitiesUsed + 1,
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'ability' as const,
            message: `Activated ${abilityDef.name}`,
            messageZh: `发动${abilityDef.nameZh}`,
            waterChange,
            powerChange,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, [recalcPower]);

  // ─── Harvest Water ─────────────────────────────────────────────────────
  const harvestWater = useCallback((amount: number) => {
    setState(prev => {
      const timeDef = OM_TIMES_OF_DAY.find(t => t.id === prev.currentTimeOfDay);
      const waterMod = timeDef?.waterMod ?? 1;
      const baseHarvest = Math.floor(amount * 10 * waterMod);
      if (baseHarvest <= 0) return prev;

      return {
        ...prev,
        waterReserve: prev.waterReserve + baseHarvest,
        totalWaterEarned: prev.totalWaterEarned + baseHarvest,
        waterHarvests: prev.waterHarvests + 1,
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'water' as const,
            message: `Harvested +${baseHarvest} water`,
            messageZh: `采集 +${baseHarvest} 水`,
            waterChange: baseHarvest,
            powerChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Collect Enchanted Water ──────────────────────────────────────────
  const collectEnchantedWater = useCallback((waterId: string) => {
    setState(prev => {
      const alreadyCollected = new Set(prev.collectedWaters.map(w => w.id));
      if (alreadyCollected.has(waterId)) return prev;

      const waterDef = OM_ENCHANTED_WATERS.find(w => w.id === waterId);
      if (!waterDef) return prev;

      return {
        ...prev,
        collectedWaters: [...prev.collectedWaters, { id: waterId, collectedAt: Date.now() }],
        waterReserve: prev.waterReserve + waterDef.baseValue,
        totalWaterEarned: prev.totalWaterEarned + waterDef.baseValue,
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'water' as const,
            message: `Collected ${waterDef.name}`,
            messageZh: `获得${waterDef.nameZh}`,
            waterChange: waterDef.baseValue,
            powerChange: 0,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Decipher Mirage ──────────────────────────────────────────────────
  const decipherMirage = useCallback(() => {
    setState(prev => {
      const timeDef = OM_TIMES_OF_DAY.find(t => t.id === prev.currentTimeOfDay);
      const decipherMod = timeDef?.decipherMod ?? 1;
      const basePower = Math.floor((30 + Math.random() * 50) * decipherMod);
      const waterGain = Math.floor(10 + Math.random() * 20 * decipherMod);

      return {
        ...prev,
        miragePower: prev.miragePower + basePower,
        totalMiragePower: prev.totalMiragePower + basePower,
        waterReserve: prev.waterReserve + waterGain,
        totalWaterEarned: prev.totalWaterEarned + waterGain,
        miragesDeciphered: prev.miragesDeciphered + 1,
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'mirage' as const,
            message: `Deciphered mirage (+${basePower} power, +${waterGain} water)`,
            messageZh: `解读幻影（+${basePower} 力量，+${waterGain} 水）`,
            waterChange: waterGain,
            powerChange: basePower,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Survive Sandstorm ────────────────────────────────────────────────
  const surviveSandstorm = useCallback(() => {
    setState(prev => {
      const defense = prev.structures.find(s => s.id === 'os09')?.level ?? 0;
      const wallDefense = prev.structures.find(s => s.id === 'os22')?.level ?? 0;
      const totalDefense = defense * 10 + wallDefense * 8;
      const damage = Math.max(0, 80 - totalDefense);
      const survivalBonus = Math.floor(damage * 0.5);

      const updatedZones = prev.zones.map(z =>
        z.discovered ? { ...z, stability: Math.max(0, z.stability - Math.floor(damage * 0.2)) } : z
      );

      return {
        ...prev,
        zones: updatedZones,
        waterReserve: prev.waterReserve - damage,
        miragePower: prev.miragePower + survivalBonus,
        totalMiragePower: prev.totalMiragePower + survivalBonus,
        sandstormsSurvived: prev.sandstormsSurvived + 1,
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'sandstorm' as const,
            message: `Survived sandstorm (-${damage} water, +${survivalBonus} power)`,
            messageZh: `沙暴中幸存（-${damage} 水，+${survivalBonus} 力量）`,
            waterChange: -damage,
            powerChange: survivalBonus,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Check Achievements ───────────────────────────────────────────────
  const checkAchievements = useCallback(() => {
    setState(prev => {
      const newAchievements = evaluateAchievements(prev);
      let waterReward = 0;
      let powerReward = 0;

      const newEntries: EventLogEntry[] = [];
      for (let i = 0; i < newAchievements.length; i++) {
        if (newAchievements[i].unlocked && !prev.achievements[i].unlocked) {
          const def = OM_ACHIEVEMENTS.find(a => a.id === newAchievements[i].id);
          if (def) {
            waterReward += def.reward.water;
            powerReward += def.reward.power;
            newEntries.push({
              id: makeEventLogId(),
              cycleNumber: prev.cycleCount,
              type: 'achievement' as const,
              message: `Achievement unlocked: ${def.name}!`,
              messageZh: `成就解锁：${def.nameZh}！`,
              waterChange: def.reward.water,
              powerChange: def.reward.power,
              timestamp: Date.now(),
            });
          }
        }
      }

      return {
        ...prev,
        achievements: newAchievements,
        waterReserve: prev.waterReserve + waterReward,
        totalWaterEarned: prev.totalWaterEarned + waterReward,
        totalMiragePower: prev.totalMiragePower + powerReward,
        miragePower: prev.miragePower + powerReward,
        eventLog: [...prev.eventLog.slice(-(200 - newEntries.length)), ...newEntries],
      };
    });
  }, []);

  // ─── Complete Daily Quest ──────────────────────────────────────────────
  const completeDailyQuest = useCallback(() => {
    setState(prev => {
      if (!prev.dailyQuest || prev.dailyQuest.completed) return prev;
      if (prev.dailyQuest.currentAmount < prev.dailyQuest.targetAmount) return prev;

      return {
        ...prev,
        dailyQuest: { ...prev.dailyQuest, completed: true },
        waterReserve: prev.waterReserve + prev.dailyQuest.reward.water,
        totalWaterEarned: prev.totalWaterEarned + prev.dailyQuest.reward.water,
        totalMiragePower: prev.totalMiragePower + prev.dailyQuest.reward.power,
        miragePower: prev.miragePower + prev.dailyQuest.reward.power,
        dailyQuestsCompleted: prev.dailyQuestsCompleted + 1,
        cycleCount: prev.cycleCount + 1,
        eventLog: [
          ...prev.eventLog.slice(-199),
          {
            id: makeEventLogId(),
            cycleNumber: prev.cycleCount,
            type: 'daily' as const,
            message: 'Daily quest completed!',
            messageZh: '每日任务完成！',
            waterChange: prev.dailyQuest.reward.water,
            powerChange: prev.dailyQuest.reward.power,
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  // ─── Contribute to Daily Quest ────────────────────────────────────────
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

  // ─── Set Current Zone ─────────────────────────────────────────────────
  const setCurrentZone = useCallback((zoneId: string) => {
    setState(prev => {
      const zone = prev.zones.find(z => z.id === zoneId);
      if (!zone || !zone.discovered) return prev;
      return { ...prev, currentZone: zoneId };
    });
  }, []);

  // ─── Advance Cycle (the main game tick) ───────────────────────────────
  const advanceCycle = useCallback(() => {
    setState(prev => {
      // Water income from structures
      const waterIncome = prev.structures
        .filter(s => s.level > 0)
        .reduce((sum, s) => {
          const def = OM_OASIS_STRUCTURES.find(sd => sd.id === s.id);
          return sum + (def ? def.powerPerLevel * s.level * 0.5 : 0);
        }, 0);

      // Recover stability
      const updatedZones = prev.zones.map(z =>
        z.discovered ? { ...z, stability: Math.min(100, z.stability + 2) } : z
      );

      // Tick ability cooldowns
      const tickedAbilities = tickCooldowns(prev.abilities);

      // Advance time of day every 8 cycles
      const newTime = prev.cycleCount > 0 && (prev.cycleCount + 1) % 8 === 0
        ? advanceTimeOfDay(prev.currentTimeOfDay)
        : prev.currentTimeOfDay;

      // Tick active events
      const remainingEvents = prev.activeEvents
        .map(e => ({ ...e, remainingCycles: e.remainingCycles - 1 }))
        .filter(e => e.remainingCycles > 0);

      // Fluctuate water prices
      const newPrices = fluctuateWaterPrices(prev.waterPrices);

      // Recalculate power
      const { power, titleIndex } = recalcPower(updatedZones, prev.structures, prev.spirits);

      // Evaluate achievements
      const checkedAchievements = evaluateAchievements({
        ...prev,
        zones: updatedZones,
        totalMiragePower: power,
        titleIndex: Math.max(prev.titleIndex, titleIndex),
      });

      // Award new achievement rewards
      let achWater = 0;
      let achPower = 0;
      const achLogEntries: EventLogEntry[] = [];
      for (let i = 0; i < checkedAchievements.length; i++) {
        if (checkedAchievements[i].unlocked && !prev.achievements[i].unlocked) {
          const def = OM_ACHIEVEMENTS.find(a => a.id === checkedAchievements[i].id);
          if (def) {
            achWater += def.reward.water;
            achPower += def.reward.power;
            achLogEntries.push({
              id: makeEventLogId(),
              cycleNumber: prev.cycleCount + 1,
              type: 'achievement' as const,
              message: `Achievement: ${def.name}!`,
              messageZh: `成就：${def.nameZh}！`,
              waterChange: def.reward.water,
              powerChange: def.reward.power,
              timestamp: Date.now(),
            });
          }
        }
      }

      // Roll mirage event
      const mirEvent = rollMirageEvent();
      let evtWater = 0;
      let evtPower = 0;

      if (mirEvent) {
        switch (mirEvent.effectType) {
          case 'water_bonus': evtWater = mirEvent.effectValue; break;
          case 'water_loss': evtWater = -mirEvent.effectValue; break;
          case 'power_boost': evtPower = mirEvent.effectValue; break;
          case 'power_loss': evtPower = -mirEvent.effectValue; break;
          case 'spirit_bonus': evtPower = mirEvent.effectValue; break;
          case 'spirit_loss': evtPower = -mirEvent.effectValue; break;
          case 'decipher_bonus': evtPower = mirEvent.effectValue; break;
          default: break;
        }
      }

      // Build event log
      const cycleLogs: EventLogEntry[] = [];

      if (newTime !== prev.currentTimeOfDay) {
        const timeDef = OM_TIMES_OF_DAY.find(t => t.id === newTime);
        cycleLogs.push({
          id: makeEventLogId(),
          cycleNumber: prev.cycleCount + 1,
          type: 'time' as const,
          message: `Time changed to ${timeDef?.name}`,
          messageZh: `时段变为${timeDef?.nameZh}`,
          waterChange: 0,
          powerChange: 0,
          timestamp: Date.now(),
        });
      }

      if (waterIncome > 0) {
        cycleLogs.push({
          id: makeEventLogId(),
          cycleNumber: prev.cycleCount + 1,
          type: 'water' as const,
          message: `Water income: +${Math.floor(waterIncome)} water`,
          messageZh: `水源收入：+${Math.floor(waterIncome)} 水`,
          waterChange: Math.floor(waterIncome),
          powerChange: 0,
          timestamp: Date.now(),
        });
      }

      if (mirEvent) {
        cycleLogs.push({
          id: makeEventLogId(),
          cycleNumber: prev.cycleCount + 1,
          type: 'event' as const,
          message: `Event: ${mirEvent.name} — ${mirEvent.description}`,
          messageZh: `事件：${mirEvent.nameZh} — ${mirEvent.description}`,
          waterChange: evtWater,
          powerChange: evtPower,
          timestamp: Date.now(),
        });
      }

      if (mirEvent && mirEvent.duration > 0) {
        remainingEvents.push({ eventId: mirEvent.id, remainingCycles: mirEvent.duration });
      }

      const finalPower = power + evtPower + achPower;

      return {
        ...prev,
        zones: updatedZones,
        abilities: tickedAbilities,
        achievements: checkedAchievements,
        currentTimeOfDay: newTime,
        activeEvents: remainingEvents,
        waterPrices: newPrices,
        waterReserve: prev.waterReserve + Math.floor(waterIncome) + achWater + evtWater,
        totalWaterEarned: prev.totalWaterEarned + Math.floor(waterIncome) + achWater + Math.max(0, evtWater),
        totalMiragePower: finalPower,
        miragePower: finalPower,
        titleIndex: Math.max(prev.titleIndex, determineTitleIndex(finalPower)),
        cycleCount: prev.cycleCount + 1,
        eventLog: [...prev.eventLog.slice(-(200 - cycleLogs.length - achLogEntries.length)), ...cycleLogs, ...achLogEntries],
      };
    });
  }, [recalcPower]);

  // ─── Get Title ─────────────────────────────────────────────────────────
  const getTitle = useCallback((): { name: string; nameZh: string; icon: string; index: number } => {
    const title = OM_TITLES[state.titleIndex] || OM_TITLES[0];
    return { name: title.name, nameZh: title.nameZh, icon: title.icon, index: state.titleIndex };
  }, [state.titleIndex]);

  // ─── Get Progress ──────────────────────────────────────────────────────
  const getProgress = useCallback((): OasisMirageProgress => {
    const currentTitle = OM_TITLES[state.titleIndex];
    const nextTitleDef = OM_TITLES[state.titleIndex + 1];

    const spiritCompletion = state.spirits.length / OM_SPIRITS.length;
    const zoneCompletion = state.zones.filter(z => z.discovered).length / OM_OASIS_ZONES.length;
    const structureCompletion = state.structures.filter(s => s.level > 0).length / OM_OASIS_STRUCTURES.length;
    const achievementCompletion = state.achievements.filter(a => a.unlocked).length / OM_ACHIEVEMENTS.length;

    let nextTitle: OasisMirageProgress['nextTitle'];
    if (nextTitleDef) {
      const prevThreshold = currentTitle.minMiragePower;
      const nextThreshold = nextTitleDef.minMiragePower;
      const progress = Math.min(1, (state.totalMiragePower - prevThreshold) / (nextThreshold - prevThreshold));
      nextTitle = { name: nextTitleDef.name, nameZh: nextTitleDef.nameZh, progress, required: nextThreshold };
    } else {
      nextTitle = { name: currentTitle.name, nameZh: currentTitle.nameZh, progress: 1, required: currentTitle.minMiragePower };
    }

    const overallCompletion = (
      spiritCompletion * 0.25 +
      zoneCompletion * 0.2 +
      structureCompletion * 0.2 +
      achievementCompletion * 0.2 +
      nextTitle.progress * 0.15
    );

    return {
      nextTitle,
      spiritCompletion,
      zoneCompletion,
      structureCompletion,
      achievementCompletion,
      overallCompletion: Math.min(1, overallCompletion),
    };
  }, [state]);

  // ─── Get Stats ─────────────────────────────────────────────────────────
  const getStats = useCallback((): OasisMirageStats => {
    const spiritsByRarity: Record<string, number> = {
      [OM_RARITY_COMMON]: 0,
      [OM_RARITY_UNUSUAL]: 0,
      [OM_RARITY_RARE]: 0,
      [OM_RARITY_EPIC]: 0,
      [OM_RARITY_LEGENDARY]: 0,
    };
    for (const spirit of state.spirits) {
      const def = OM_SPIRITS.find(s => s.id === spirit.id);
      if (def) {
        spiritsByRarity[def.rarity] = (spiritsByRarity[def.rarity] || 0) + 1;
      }
    }

    const title = OM_TITLES[state.titleIndex] || OM_TITLES[0];

    return {
      totalSpirits: state.spirits.length,
      spiritsByRarity,
      zonesDiscovered: state.zones.filter(z => z.discovered).length,
      totalStructureLevels: state.structures.reduce((sum, s) => sum + s.level, 0),
      maxStructureLevel: Math.max(...state.structures.map(s => s.level), 0),
      totalWatersCollected: state.collectedWaters.length,
      miragePower: state.miragePower,
      currentTitle: title.name,
      currentTitleZh: title.nameZh,
      totalMiragePower: state.totalMiragePower,
      waterReserve: state.waterReserve,
      achievementsUnlocked: state.achievements.filter(a => a.unlocked).length,
      achievementsTotal: OM_ACHIEVEMENTS.length,
      cycleCount: state.cycleCount,
      currentTimeOfDay: state.currentTimeOfDay,
      eventsHandled: state.activeEvents.length,
    };
  }, [state]);

  // ═══════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES (useMemo)
  // ═══════════════════════════════════════════════════════════════════════

  const enrichedSpirits = useMemo(() => {
    return state.spirits.map(spirit => {
      const def = OM_SPIRITS.find(s => s.id === spirit.id);
      if (!def) return { ...spirit, name: 'Unknown', nameZh: '未知', rarity: OM_RARITY_COMMON, element: 'wind', illusionPower: 0, agility: 0 };
      return {
        ...spirit,
        name: def.name,
        nameZh: def.nameZh,
        rarity: def.rarity,
        element: def.element,
        illusionPower: def.illusionPower,
        agility: def.agility,
        description: def.description,
        lore: def.lore,
        rarityColor: OM_RARITY_COLORS[def.rarity] || '#9E9E9E',
        rarityLabel: OM_RARITY_LABELS[def.rarity]?.en || 'Common',
      };
    });
  }, [state]);

  const enrichedZones = useMemo(() => {
    return state.zones.map(zs => {
      const def = OM_OASIS_ZONES.find(z => z.id === zs.id);
      if (!def) return { ...zs, name: 'Unknown', nameZh: '未知', hazardType: 'none', icon: '❓' };
      return { ...zs, ...def, isCurrent: zs.id === state.currentZone };
    });
  }, [state]);

  const enrichedStructures = useMemo(() => {
    return state.structures.map(ss => {
      const def = OM_OASIS_STRUCTURES.find(s => s.id === ss.id);
      if (!def) return { ...ss, name: 'Unknown', upgradeCost: 0, canUpgrade: false };
      const upgradeCost = calculateUpgradeCost(def, ss.level);
      return { ...ss, ...def, upgradeCost, canUpgrade: ss.level < def.maxLevel };
    });
  }, [state]);

  const enrichedAbilities = useMemo(() => {
    return state.abilities.map(as => {
      const def = OM_ABILITIES.find(a => a.id === as.id);
      if (!def) return { ...as, name: 'Unknown', isReady: false };
      return { ...as, ...def, isReady: as.currentCooldown === 0 };
    });
  }, [state]);

  const enrichedAchievements = useMemo(() => {
    return state.achievements.map(achs => {
      const def = OM_ACHIEVEMENTS.find(a => a.id === achs.id);
      if (!def) return { ...achs, name: 'Unknown' };
      return { ...achs, ...def };
    });
  }, [state]);

  const enrichedWaters = useMemo(() => {
    return state.collectedWaters.map(cw => {
      const def = OM_ENCHANTED_WATERS.find(w => w.id === cw.id);
      if (!def) return { ...cw, name: 'Unknown', nameZh: '未知', category: 'spring', icon: '💧' };
      const categoryLabel = OM_WATER_CATEGORY_LABELS[def.category] || { en: 'Unknown', zh: '未知', icon: '💧' };
      return { ...cw, ...def, categoryLabel };
    });
  }, [state]);

  const enrichedWaterPrices = useMemo(() => {
    return state.waterPrices.map(wp => {
      const water = OM_ENCHANTED_WATERS.find(w => w.id === wp.waterId);
      if (!water) return { ...wp, name: 'Unknown', nameZh: '未知', category: 'spring' };
      return { ...wp, ...water };
    });
  }, [state]);

  const currentTimeDef = useMemo(() => {
    return OM_TIMES_OF_DAY.find(t => t.id === state.currentTimeOfDay) || OM_TIMES_OF_DAY[0];
  }, [state]);

  const availableSpiritsByRarity = useMemo(() => {
    const alreadyBound = new Set(state.spirits.map(s => s.id));
    const result: Record<string, number> = {
      [OM_RARITY_COMMON]: 0,
      [OM_RARITY_UNUSUAL]: 0,
      [OM_RARITY_RARE]: 0,
      [OM_RARITY_EPIC]: 0,
      [OM_RARITY_LEGENDARY]: 0,
    };
    for (const spirit of OM_SPIRITS) {
      if (!alreadyBound.has(spirit.id)) {
        result[spirit.rarity] = (result[spirit.rarity] || 0) + 1;
      }
    }
    return result;
  }, [state]);

  const waterIncomePerCycle = useMemo(() => {
    return state.structures
      .filter(s => s.level > 0)
      .reduce((sum, s) => {
        const def = OM_OASIS_STRUCTURES.find(sd => sd.id === s.id);
        return sum + (def ? def.powerPerLevel * s.level * 0.5 : 0);
      }, 0);
  }, [state]);

  const structurePowerBonus = useMemo(() => {
    let bonus = 0;
    for (const struct of state.structures) {
      const def = OM_OASIS_STRUCTURES.find(s => s.id === struct.id);
      if (def && struct.level > 0) {
        bonus += def.powerPerLevel * struct.level;
      }
    }
    return bonus;
  }, [state]);

  const spiritPowerBonus = useMemo(() => {
    let bonus = 0;
    for (const spirit of state.spirits) {
      const def = OM_SPIRITS.find(s => s.id === spirit.id);
      if (def) {
        const multiplier = OM_RARITY_MULTIPLIER[def.rarity] || 1;
        bonus += Math.floor(def.illusionPower * 0.1 * multiplier);
      }
    }
    return bonus;
  }, [state]);

  const zonePowerTotal = useMemo(() => {
    let total = 0;
    for (const zone of state.zones) {
      if (zone.discovered) {
        total += zone.power;
      }
    }
    return total;
  }, [state]);

  const sandstormReadiness = useMemo((): SandstormReadiness => {
    const defense = state.structures.find(s => s.id === 'os09')?.level ?? 0;
    const wallDefense = state.structures.find(s => s.id === 'os22')?.level ?? 0;
    const totalDefense = defense * 10 + wallDefense * 8;
    const recommended = 80;
    const ratio = totalDefense / recommended;

    if (ratio >= 2) {
      return { level: 'impregnable', label: 'Impregnable', labelZh: '固若金汤', color: OM_COLOR_SAND_GOLD, recommended, current: totalDefense };
    }
    if (ratio >= 1.2) {
      return { level: 'strong', label: 'Well Fortified', labelZh: '防御坚固', color: OM_COLOR_OASIS_TURQUOISE, recommended, current: totalDefense };
    }
    if (ratio >= 0.8) {
      return { level: 'adequate', label: 'Adequate Shelter', labelZh: '庇护尚可', color: OM_COLOR_WARM_DUNE, recommended, current: totalDefense };
    }
    if (ratio >= 0.4) {
      return { level: 'weak', label: 'Vulnerable', labelZh: '脆弱不堪', color: OM_COLOR_DESERT_ROSE, recommended, current: totalDefense };
    }
    return { level: 'critical', label: 'No Defense', labelZh: '毫无防御', color: '#FF0000', recommended, current: totalDefense };
  }, [state]);

  const waterReserveHealth = useMemo((): WaterReserveHealth => {
    const consumption = Math.max(50, waterIncomePerCycle * 2);
    const surplus = state.waterReserve - consumption;

    if (surplus > 500) {
      return { level: 'overflowing', label: 'Overflowing Reserves', labelZh: '水源充沛', color: OM_COLOR_SAND_GOLD, surplus };
    }
    if (surplus > 100) {
      return { level: 'stable', label: 'Stable Supply', labelZh: '供应稳定', color: OM_COLOR_OASIS_TURQUOISE, surplus };
    }
    if (surplus > 0) {
      return { level: 'modest', label: 'Modest Reserves', labelZh: '略有结余', color: OM_COLOR_WARM_DUNE, surplus };
    }
    return { level: 'drought', label: 'Water Shortage', labelZh: '水源匮乏', color: OM_COLOR_DESERT_ROSE, surplus };
  }, [state, waterIncomePerCycle]);

  const estimatedWaterIncome = useMemo(() => {
    const ownedZones = state.zones.filter(z => z.discovered).length;
    const baseIncome = ownedZones * 15;
    const structBonus = Math.floor(waterIncomePerCycle);
    return Math.floor((baseIncome + structBonus) * (currentTimeDef.waterMod));
  }, [state, waterIncomePerCycle, currentTimeDef]);

  const recentAchievements = useMemo(() => {
    return state.achievements
      .filter(a => a.unlocked && a.unlockedAt !== null)
      .sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))
      .slice(0, 5);
  }, [state]);

  const topSpirits = useMemo(() => {
    return enrichedSpirits
      .sort((a, b) => b.illusionPower - a.illusionPower)
      .slice(0, 5);
  }, [enrichedSpirits]);

  const recentEventLog = useMemo(() => {
    return state.eventLog.slice(-20);
  }, [state]);

  const dailyQuestProgress = useMemo(() => {
    const task = state.dailyQuest;
    if (!task) return null;
    const progress = task.targetAmount > 0 ? task.currentAmount / task.targetAmount : 0;
    const isExpired = task.expiresAt < Date.now() && !task.completed;
    return { ...task, progress, isExpired };
  }, [state]);

  const spiritCollectionValue = useMemo(() => {
    let totalIllusionPower = 0;
    let totalAgility = 0;
    for (const spirit of state.spirits) {
      const def = OM_SPIRITS.find(s => s.id === spirit.id);
      if (def) {
        const multiplier = OM_RARITY_MULTIPLIER[def.rarity] || 1;
        totalIllusionPower += Math.floor(def.illusionPower * multiplier);
        totalAgility += def.agility;
      }
    }
    return { totalIllusionPower, totalAgility };
  }, [state]);

  const projectedIncome = useMemo(() => {
    return {
      water: estimatedWaterIncome,
      power: Math.floor(spiritPowerBonus * 0.1),
      total: estimatedWaterIncome + Math.floor(spiritPowerBonus * 0.1),
    };
  }, [estimatedWaterIncome, spiritPowerBonus]);

  const structuresByCategory = useMemo(() => {
    const categories: Record<string, typeof enrichedStructures> = {};
    for (const struct of enrichedStructures) {
      const cat = struct.category || 'other';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(struct);
    }
    return categories;
  }, [enrichedStructures]);

  const abilitiesByCategory = useMemo(() => {
    const categories: Record<string, typeof enrichedAbilities> = {};
    for (const ability of enrichedAbilities) {
      const cat = ability.category || 'other';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(ability);
    }
    return categories;
  }, [enrichedAbilities]);

  const priceMovers = useMemo(() => {
    return enrichedWaterPrices
      .filter(wp => Math.abs(wp.valueChange) > 0)
      .sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange))
      .slice(0, 5);
  }, [enrichedWaterPrices]);

  const advisorSummary = useMemo(() => {
    const tips: string[] = [];
    const tipsZh: string[] = [];

    if (state.waterReserve < 50) {
      tips.push('Water reserves critically low — harvest water immediately!');
      tipsZh.push('水源储备极低——立即采集水！');
    }
    if (state.zones.filter(z => z.discovered).length < 3 && state.waterReserve > 500) {
      tips.push('Consider discovering new oasis zones to expand your domain.');
      tipsZh.push('考虑探索新的绿洲区域来扩展你的领地。');
    }
    if (state.structures.filter(s => s.level > 0).length < 5) {
      tips.push('Build more structures to increase your oasis power.');
      tipsZh.push('建造更多结构来提高绿洲力量。');
    }
    if (state.spirits.length < 5) {
      tips.push('Bind more spirits to strengthen your mirage abilities.');
      tipsZh.push('绑定更多灵体来增强幻影能力。');
    }
    if (sandstormReadiness.level === 'critical' || sandstormReadiness.level === 'weak') {
      tips.push('Your sandstorm defenses are inadequate — upgrade shelters!');
      tipsZh.push('你的沙暴防御不足——升级避风港！');
    }
    if (state.currentTimeOfDay === OM_TIME_NIGHT) {
      tips.push('Night time boosts spirit power and deciphering — make the most of it!');
      tipsZh.push('夜晚时段增强灵体力量和解读能力——好好利用！');
    }
    if (state.abilities.some(a => a.currentCooldown === 0) && state.abilitiesUsed === 0) {
      tips.push('You have abilities ready to use — try activating one!');
      tipsZh.push('你有能力可以使用——试试激活一个！');
    }

    const highLevelStructs = state.structures.filter(s => s.level >= 8).length;
    if (highLevelStructs >= 3) {
      tips.push('Your structures are well-developed — focus on spirits and exploration.');
      tipsZh.push('你的结构发展良好——专注于灵体和探索。');
    }

    if (state.totalMiragePower >= 4000 && state.titleIndex < 7) {
      tips.push('You are close to the title of Mirage Sovereign!');
      tipsZh.push('你即将获得幻影主宰的称号！');
    }

    if (tips.length === 0) {
      tips.push('Everything looks stable — continue expanding your oasis empire.');
      tipsZh.push('一切看起来很稳定——继续扩展你的绿洲帝国。');
    }

    return { tips, tipsZh };
  }, [state, sandstormReadiness]);

  const activeEventsDetail = useMemo(() => {
    return state.activeEvents.map(ae => {
      const def = OM_MIRAGE_EVENTS.find(e => e.id === ae.eventId);
      return {
        ...ae,
        name: def?.name ?? 'Unknown',
        nameZh: def?.nameZh ?? '未知',
        icon: def?.icon ?? '❓',
        description: def?.description ?? '',
      };
    });
  }, [state]);

  const zoneStabilitySummary = useMemo(() => {
    const discovered = state.zones.filter(z => z.discovered);
    if (discovered.length === 0) {
      return { average: 0, lowest: 0, critical: 0 };
    }
    const avg = discovered.reduce((sum, z) => sum + z.stability, 0) / discovered.length;
    const lowest = Math.min(...discovered.map(z => z.stability));
    const critical = discovered.filter(z => z.stability < 30).length;
    const loyal = discovered.filter(z => z.stability >= 80).length;
    return { average: Math.round(avg), lowest, critical, loyal, total: discovered.length };
  }, [state]);

  const unboundSpiritsCount = useMemo(() => {
    const alreadyBound = new Set(state.spirits.map(s => s.id));
    return OM_SPIRITS.filter(s => !alreadyBound.has(s.id)).length;
  }, [state]);

  const totalSpiritsAvailable = useMemo(() => {
    return OM_SPIRITS.length;
  }, []);

  const watersByCategory = useMemo(() => {
    const categories: Record<string, typeof enrichedWaters> = {};
    for (const water of enrichedWaters) {
      const cat = water.category || 'spring';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(water);
    }
    return categories;
  }, [enrichedWaters]);

  const legendarySpiritsBound = useMemo(() => {
    return state.spirits.filter(sid => {
      const def = OM_SPIRITS.find(s => s.id === sid.id);
      return def && def.rarity === OM_RARITY_LEGENDARY;
    }).length;
  }, [state]);

  const elementDistribution = useMemo(() => {
    const dist: Record<string, number> = { wind: 0, earth: 0, water: 0, fire: 0 };
    for (const spirit of state.spirits) {
      const def = OM_SPIRITS.find(s => s.id === spirit.id);
      if (def && dist[def.element] !== undefined) {
        dist[def.element] += 1;
      }
    }
    return dist;
  }, [state]);

  const readinessScore = useMemo(() => {
    const defensePower = sandstormReadiness.current;
    const spiritPower = spiritCollectionValue.totalIllusionPower;
    const structurePower = structurePowerBonus;
    return Math.floor(defensePower + spiritPower * 0.1 + structurePower * 0.2);
  }, [sandstormReadiness, spiritCollectionValue, structurePowerBonus]);

  const isNightTime = useMemo(() => {
    return state.currentTimeOfDay === OM_TIME_NIGHT || state.currentTimeOfDay === OM_TIME_DUSK;
  }, [state]);

  const isDawnTime = useMemo(() => {
    return state.currentTimeOfDay === OM_TIME_DAWN;
  }, [state]);

  // ═══════════════════════════════════════════════════════════════════════
  // RETURN API
  // ═══════════════════════════════════════════════════════════════════════

  return {
    // Raw state access
    state,
    stateRef,

    // Actions
    bindSpirit,
    discoverZone,
    buildStructure,
    upgradeStructure,
    activateAbility,
    harvestWater,
    collectEnchantedWater,
    decipherMirage,
    surviveSandstorm,
    checkAchievements,
    completeDailyQuest,
    contributeToQuest,
    setCurrentZone,
    advanceCycle,

    // Getters
    getTitle,
    getProgress,
    getStats,

    // Enriched / computed data
    enrichedSpirits,
    enrichedZones,
    enrichedStructures,
    enrichedAbilities,
    enrichedAchievements,
    enrichedWaters,
    enrichedWaterPrices,
    currentTimeDef,
    availableSpiritsByRarity,
    waterIncomePerCycle,
    structurePowerBonus,
    spiritPowerBonus,
    zonePowerTotal,
    sandstormReadiness,
    waterReserveHealth,
    estimatedWaterIncome,
    recentAchievements,
    topSpirits,
    recentEventLog,
    dailyQuestProgress,
    spiritCollectionValue,
    projectedIncome,
    structuresByCategory,
    abilitiesByCategory,
    priceMovers,
    advisorSummary,
    activeEventsDetail,
    zoneStabilitySummary,
    unboundSpiritsCount,
    totalSpiritsAvailable,
    watersByCategory,
    legendarySpiritsBound,
    elementDistribution,
    readinessScore,
    isNightTime,
    isDawnTime,

    // Static data references
    spiritsDef: OM_SPIRITS,
    zonesDef: OM_OASIS_ZONES,
    structuresDef: OM_OASIS_STRUCTURES,
    abilitiesDef: OM_ABILITIES,
    achievementsDef: OM_ACHIEVEMENTS,
    watersDef: OM_ENCHANTED_WATERS,
    eventsDef: OM_MIRAGE_EVENTS,
    titles: OM_TITLES,
    timesOfDay: OM_TIMES_OF_DAY,
    rarityColors: OM_RARITY_COLORS,
    rarityLabels: OM_RARITY_LABELS,
    rarityMultiplier: OM_RARITY_MULTIPLIER,
    waterCategoryLabels: OM_WATER_CATEGORY_LABELS,

    // Color theme
    colors: {
      sandGold: OM_COLOR_SAND_GOLD,
      mirageSilver: OM_COLOR_MIRAGE_SILVER,
      oasisTurquoise: OM_COLOR_OASIS_TURQUOISE,
      desertRose: OM_COLOR_DESERT_ROSE,
      sunsetOrange: OM_COLOR_SUNSET_ORANGE,
      deepSand: OM_COLOR_DEEP_SAND,
      paleMirage: OM_COLOR_PALE_MIRAGE,
      darkTurquoise: OM_COLOR_DARK_TURQUOISE,
      warmDune: OM_COLOR_WARM_DUNE,
      nightOasis: OM_COLOR_NIGHT_OASIS,
      shimmer: OM_COLOR_SHIMMER,
      amberGlow: OM_COLOR_AMBER_GLOW,
    },
  };
}
