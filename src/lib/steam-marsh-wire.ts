/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// ============================================================
// Steam Marsh — Misty Swamp of Bubbling Geysers Wire
// ============================================================

// ============================================================
// Types
// ============================================================

export type SmRarity = 'common' | 'unusual' | 'rare' | 'epic' | 'legendary';

export type SmSteamAction = 'tap' | 'navigate' | 'tame' | 'engineer' | 'explore';

export type SmGeyserGrade = 'mist' | 'vapor' | 'fumarole' | 'magmatic';

export type SmDailyQuestType = 'tap' | 'navigate' | 'tame' | 'engineer' | 'explore' | 'scout';

export interface SmCreatureDef {
  id: string;
  name: string;
  rarity: SmRarity;
  zoneId: string;
  steamType: string;
  steamPotency: number;
  mistAffinity: number;
  description: string;
  emoji: string;
  xpReward: number;
  tameChance: number;
  requiredLevel: number;
}

export interface SmZoneDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockLevel: number;
  baseTapRate: number;
  creatureList: string[];
  geyserList: string[];
}

export interface SmGeyserResourceDef {
  id: string;
  name: string;
  rarity: SmRarity;
  description: string;
  emoji: string;
  tapXp: number;
  zoneId: string;
}

export interface SmAbilityDef {
  id: string;
  name: string;
  rarity: SmRarity;
  description: string;
  emoji: string;
  steamCost: number;
  cooldown: number;
  xpReward: number;
  requiredLevel: number;
  effect: string;
}

export interface SmStructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  steamBonus: number;
  requiredLevel: number;
}

export interface SmFogWraithDef {
  id: string;
  name: string;
  element: string;
  description: string;
  emoji: string;
  blessingType: string;
  blessingPower: number;
  giftPreference: string;
}

export interface SmAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
  emoji: string;
}

export interface SmTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface SmRarityInfo {
  key: SmRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface SmColorTheme {
  steamWhite: string;
  swampGreen: string;
  mistGray: string;
  geyserAmber: string;
  bogBrown: string;
  peatBlack: string;
}

export interface SmCreatureState {
  owned: boolean;
  count: number;
  tamed: boolean;
  ridden: boolean;
  lastSeen: number | null;
}

export interface SmZoneState {
  explored: boolean;
  level: number;
  tappedCount: number;
  creaturesFound: number;
  unlockedAt: number | null;
}

export interface SmAbilityState {
  learned: boolean;
  castCount: number;
  cooldownEnd: number;
}

export interface SmStructureState {
  level: number;
  builtAt: number | null;
}

export interface SmFogWraithState {
  befriended: boolean;
  friendship: number;
  giftsGiven: number;
  lastGiftAt: number | null;
}

export interface SmAchievementState {
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface SmDailyQuestState {
  lastDate: string | null;
  streak: number;
  completed: boolean;
  questType: SmDailyQuestType | null;
  questProgress: number;
  questTarget: number;
  rewardClaimed: boolean;
}

export interface SmSeasonState {
  id: string | null;
  progress: number;
  startTime: number | null;
  endTime: number | null;
  rewardClaimed: boolean;
}

export interface SmTotals {
  totalTapped: number;
  totalCreaturesFound: number;
  totalFogNavigated: number;
  totalEnginesBuilt: number;
  totalGeyserEruptions: number;
  totalAbilityCasts: number;
  totalWraithsBefriended: number;
  totalRides: number;
  totalResourcesGathered: number;
}

export interface SteamMarshState {
  level: number;
  xp: number;
  coins: number;
  title: string;
  creatures: Record<string, SmCreatureState>;
  zones: Record<string, SmZoneState>;
  resources: Record<string, number>;
  abilities: Record<string, SmAbilityState>;
  structures: Record<string, SmStructureState>;
  fogWraiths: Record<string, SmFogWraithState>;
  achievements: Record<string, SmAchievementState>;
  dailyQuest: SmDailyQuestState;
  activeSeason: SmSeasonState;
  totals: SmTotals;
  seed: number;
  fogDensity: number;
  steamPressure: number;
}

// ============================================================
// Seeded PRNG
// ============================================================

function smMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// Helper Functions
// ============================================================

export const SM_MAX_LEVEL = 50;

function smXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= SM_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function smClampLevel(lvl: number): number {
  return Math.max(1, Math.min(SM_MAX_LEVEL, lvl));
}

function smClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function smGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function smRarityMultiplier(r: SmRarity): number {
  const map: Record<SmRarity, number> = {
    common: 1,
    unusual: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  };
  return map[r] ?? 1;
}

function smMakeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// ============================================================
// Constants
// ============================================================

export const SM_COLOR_THEME: SmColorTheme = {
  steamWhite: '#F0EDE8',
  swampGreen: '#4A7C59',
  mistGray: '#9CA3AF',
  geyserAmber: '#D97706',
  bogBrown: '#78583B',
  peatBlack: '#2D2A26',
};

export const SM_RARITIES: SmRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'unusual', label: 'Unusual', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
];

export const SM_TITLES: SmTitleInfo[] = [
  { name: 'Mist Wader', levelRequired: 1, description: 'A newcomer wading through the fog-shrouded bogs of the steam marsh' },
  { name: 'Geyser Apprentice', levelRequired: 6, description: 'You have learned to tap your first bubbling geysers for steam' },
  { name: 'Fog Navigator', levelRequired: 12, description: 'You chart paths through the densest marsh fog with confidence' },
  { name: 'Swamp Engineer', levelRequired: 20, description: 'Your steam engines power entire sections of the marsh' },
  { name: 'Marsh Warden', levelRequired: 28, description: 'Guardian of the mist — creatures and wraiths bow to your command' },
  { name: 'Steam Sovereign', levelRequired: 36, description: 'Your mastery of steam and fog rivals the ancient marsh lords' },
  { name: 'Geyser Archon', levelRequired: 44, description: 'You command the volcanic forces beneath the bog itself' },
  { name: 'Eternal Marshkeeper', levelRequired: 50, description: 'The swamp chose you — an eternal bond between steam and earth' },
];

// ============================================================
// Marsh Zones (8)
// ============================================================

export const SM_ZONES: SmZoneDef[] = [
  {
    id: 'whispering_fen',
    name: 'Whispering Fen',
    description: 'A shallow marsh where steam vents murmur beneath a veil of perpetual mist',
    emoji: '🌫️',
    unlockLevel: 1,
    baseTapRate: 0.7,
    creatureList: ['mist_frog', 'steam_midge', 'bog_newt', 'fog_sprite', 'peat_snail'],
    geyserList: ['mineral_mist', 'bog_sulfur', 'peat_crystal'],
  },
  {
    id: 'bubbling_mire',
    name: 'Bubbling Mire',
    description: 'A treacherous mire of mud pots where geysers erupt unpredictably from the swamp floor',
    emoji: '💨',
    unlockLevel: 5,
    baseTapRate: 0.65,
    creatureList: ['mud_crab', 'steam_toad', 'fog_sprite', 'bog_newt', 'swamp_eel'],
    geyserList: ['mud_pot_mineral', 'sulfur_deposit', 'iron_bog_water'],
  },
  {
    id: 'copper_cauldron',
    name: 'Copper Cauldron',
    description: 'An ancient volcanic basin where copper-tinted steam rises from boiling pools',
    emoji: '🌋',
    unlockLevel: 10,
    baseTapRate: 0.75,
    creatureList: ['steam_midge', 'mud_crab', 'mist_frog', 'copper_beetle', 'geyser_worm'],
    geyserList: ['copper_shale', 'hot_spring_salt', 'brimstone_ore'],
  },
  {
    id: 'willow_veil',
    name: 'Willow Veil',
    description: 'Draped in weeping willows dripping with condensation, this zone hides fog creatures in its canopy',
    emoji: '🌿',
    unlockLevel: 15,
    baseTapRate: 0.7,
    creatureList: ['mist_frog', 'willow_wisp', 'peat_snail', 'steam_mantis', 'fog_moth'],
    geyserList: ['condensation_dew', 'willow_resin', 'amber_sap'],
  },
  {
    id: 'iron_bog',
    name: 'Iron Bog',
    description: 'Rich in iron deposits that stain the water rust-red, home to steam-powered ancient engines',
    emoji: '⚙️',
    unlockLevel: 20,
    baseTapRate: 0.6,
    creatureList: ['steam_mantis', 'fog_moth', 'mud_crab', 'iron_golem', 'steam_serpent'],
    geyserList: ['iron_oxide', 'rust_crystal', 'pressure_geode'],
  },
  {
    id: 'ancient_basin',
    name: 'Ancient Basin',
    description: 'The oldest part of the marsh where prehistoric steam engines still rumble underground',
    emoji: '🏛️',
    unlockLevel: 30,
    baseTapRate: 0.55,
    creatureList: ['iron_golem', 'steam_serpent', 'fog_moth', 'bog_leviathan', 'mist_titan'],
    geyserList: ['primordial_steam', 'fossil_resin', 'ancient_pressure_stone'],
  },
  {
    id: 'shadow_reach',
    name: 'Shadow Reach',
    description: 'The darkest zone where the fog thickens to ink-black, hiding the most dangerous creatures',
    emoji: '🌑',
    unlockLevel: 35,
    baseTapRate: 0.5,
    creatureList: ['bog_leviathan', 'mist_titan', 'steam_serpent', 'shadow_steamer', 'fog_dragon'],
    geyserList: ['shadow_steam', 'void_geyserite', 'dark_pressure_crystal'],
  },
  {
    id: 'great_caldera',
    name: 'Great Caldera',
    description: 'The legendary volcanic caldera at the marsh center — source of all steam and home to primordial beings',
    emoji: '🌍',
    unlockLevel: 45,
    baseTapRate: 0.45,
    creatureList: ['fog_dragon', 'caldera_guardian', 'steam_behemoth', 'ancient_marsh_king', 'eternal_geyser_spirit'],
    geyserList: ['caldera_core', 'primordial_amber', 'eternal_steam_crystal'],
  },
];

// ============================================================
// Steam Creatures (35: 8 common, 8 unusual, 7 rare, 7 epic, 5 legendary)
// ============================================================

export const SM_CREATURES: SmCreatureDef[] = [
  // Common (8)
  { id: 'mist_frog', name: 'Mist Frog', rarity: 'common', zoneId: 'whispering_fen', steamType: 'Vapor Croak', steamPotency: 8, mistAffinity: 0.6, description: 'A translucent frog that breathes steam through its porous skin', emoji: '🐸', xpReward: 10, tameChance: 0.5, requiredLevel: 1 },
  { id: 'steam_midge', name: 'Steam Midge', rarity: 'common', zoneId: 'whispering_fen', steamType: 'Thermal Swarm', steamPotency: 6, mistAffinity: 0.7, description: 'Tiny insects that swarm around geysers feeding on mineral-rich vapor', emoji: '🦟', xpReward: 8, tameChance: 0.55, requiredLevel: 1 },
  { id: 'bog_newt', name: 'Bog Newt', rarity: 'common', zoneId: 'whispering_fen', steamType: 'Swamp Slither', steamPotency: 9, mistAffinity: 0.5, description: 'A fiery-orange newt that absorbs heat from bubbling mud pots', emoji: '🦎', xpReward: 10, tameChance: 0.5, requiredLevel: 1 },
  { id: 'fog_sprite', name: 'Fog Sprite', rarity: 'common', zoneId: 'whispering_fen', steamType: 'Mist Form', steamPotency: 7, mistAffinity: 0.7, description: 'Ethereal sprites born from morning fog that dance above the marsh', emoji: '👻', xpReward: 8, tameChance: 0.55, requiredLevel: 1 },
  { id: 'peat_snail', name: 'Peat Snail', rarity: 'common', zoneId: 'whispering_fen', steamType: 'Shell Steamer', steamPotency: 5, mistAffinity: 0.8, description: 'Snails with shells that trap steam, using it to propel through the bog', emoji: '🐌', xpReward: 6, tameChance: 0.65, requiredLevel: 1 },
  { id: 'mud_crab', name: 'Mud Crab', rarity: 'common', zoneId: 'bubbling_mire', steamType: 'Mud Clamp', steamPotency: 12, mistAffinity: 0.4, description: 'Crabs that burrow into boiling mud, their claws superheated from geysers', emoji: '🦀', xpReward: 12, tameChance: 0.45, requiredLevel: 1 },
  { id: 'steam_toad', name: 'Steam Toad', rarity: 'common', zoneId: 'bubbling_mire', steamType: 'Pressure Pouch', steamPotency: 6, mistAffinity: 0.8, description: 'A plump toad that stores pressurized steam in its expandable throat pouch', emoji: '🐸', xpReward: 8, tameChance: 0.55, requiredLevel: 1 },
  { id: 'swamp_eel', name: 'Swamp Eel', rarity: 'common', zoneId: 'bubbling_mire', steamType: 'Thermal Coil', steamPotency: 10, mistAffinity: 0.5, description: 'Eels that swim through boiling marsh water, electrified by geothermal currents', emoji: '🐍', xpReward: 10, tameChance: 0.5, requiredLevel: 1 },
  // Unusual (8)
  { id: 'copper_beetle', name: 'Copper Beetle', rarity: 'unusual', zoneId: 'copper_cauldron', steamType: 'Copper Shell', steamPotency: 22, mistAffinity: 0.3, description: 'A beetle with a copper-colored shell that absorbs and reflects geyser heat', emoji: '🪲', xpReward: 25, tameChance: 0.35, requiredLevel: 5 },
  { id: 'geyser_worm', name: 'Geyser Worm', rarity: 'unusual', zoneId: 'copper_cauldron', steamType: 'Pressure Tube', steamPotency: 18, mistAffinity: 0.35, description: 'Worms that live inside geysers, shooting out during eruptions', emoji: '🪱', xpReward: 20, tameChance: 0.4, requiredLevel: 5 },
  { id: 'willow_wisp', name: 'Willow Wisp', rarity: 'unusual', zoneId: 'willow_veil', steamType: 'Branch Burner', steamPotency: 20, mistAffinity: 0.4, description: 'Wisps that inhabit willow trees, igniting them with controlled steam bursts', emoji: '🔥', xpReward: 24, tameChance: 0.35, requiredLevel: 5 },
  { id: 'steam_mantis', name: 'Steam Mantis', rarity: 'unusual', zoneId: 'willow_veil', steamType: 'Blade Vents', steamPotency: 19, mistAffinity: 0.3, description: 'A praying mantis that vents superheated steam through slots in its forelimbs', emoji: '🦗', xpReward: 22, tameChance: 0.38, requiredLevel: 5 },
  { id: 'fog_moth', name: 'Fog Moth', rarity: 'unusual', zoneId: 'willow_veil', steamType: 'Mist Wing', steamPotency: 24, mistAffinity: 0.25, description: 'A large moth whose wings generate local fog banks as it flies', emoji: '🦋', xpReward: 25, tameChance: 0.3, requiredLevel: 8 },
  { id: 'pressure_crab', name: 'Pressure Crab', rarity: 'unusual', zoneId: 'iron_bog', steamType: 'Boiling Claw', steamPotency: 21, mistAffinity: 0.3, description: 'A crab that channels underground steam pressure through its massive claw', emoji: '🦀', xpReward: 28, tameChance: 0.25, requiredLevel: 8 },
  { id: 'steam_serpent', name: 'Steam Serpent', rarity: 'unusual', zoneId: 'iron_bog', steamType: 'Coil Vent', steamPotency: 16, mistAffinity: 0.45, description: 'A serpent that travels through underground steam pipes between geysers', emoji: '🐍', xpReward: 20, tameChance: 0.4, requiredLevel: 5 },
  { id: 'iron_golem', name: 'Iron Golem', rarity: 'unusual', zoneId: 'iron_bog', steamType: 'Steam Core', steamPotency: 26, mistAffinity: 0.2, description: 'Ancient golems powered by steam engines embedded in their iron chests', emoji: '🤖', xpReward: 28, tameChance: 0.28, requiredLevel: 8 },
  // Rare (7)
  { id: 'mist_titan', name: 'Mist Titan', rarity: 'rare', zoneId: 'shadow_reach', steamType: 'Fog Titan', steamPotency: 45, mistAffinity: 0.15, description: 'A massive humanoid formed from compressed mist and marsh vapor', emoji: '🗿', xpReward: 55, tameChance: 0.18, requiredLevel: 12 },
  { id: 'bog_leviathan', name: 'Bog Leviathan', rarity: 'rare', zoneId: 'shadow_reach', steamType: 'Deep Steam', steamPotency: 42, mistAffinity: 0.18, description: 'An enormous creature that lurks in the deepest, hottest parts of the bog', emoji: '🐋', xpReward: 55, tameChance: 0.18, requiredLevel: 15 },
  { id: 'shadow_steamer', name: 'Shadow Steamer', rarity: 'rare', zoneId: 'shadow_reach', steamType: 'Dark Vapor', steamPotency: 48, mistAffinity: 0.12, description: 'A creature wreathed in shadow-steam that blinds prey in supernatural fog', emoji: '👤', xpReward: 60, tameChance: 0.15, requiredLevel: 18 },
  { id: 'steam_sphinx', name: 'Steam Sphinx', rarity: 'rare', zoneId: 'ancient_basin', steamType: 'Riddle Steam', steamPotency: 40, mistAffinity: 0.2, description: 'A sphinx that tests trespassers with riddles while venting scalding steam', emoji: '🦁', xpReward: 50, tameChance: 0.2, requiredLevel: 15 },
  { id: 'fog_dragon', name: 'Fog Dragon', rarity: 'rare', zoneId: 'great_caldera', steamType: 'Dragon Breath', steamPotency: 50, mistAffinity: 0.1, description: 'A dragon that exhales superheated fog capable of melting stone', emoji: '🐲', xpReward: 60, tameChance: 0.15, requiredLevel: 18 },
  { id: 'geyser_elemental', name: 'Geyser Elemental', rarity: 'rare', zoneId: 'great_caldera', steamType: 'Eruption Form', steamPotency: 55, mistAffinity: 0.08, description: 'A being of living geyser water that erupts violently when threatened', emoji: '🌊', xpReward: 65, tameChance: 0.12, requiredLevel: 20 },
  { id: 'marsh_hydra', name: 'Marsh Hydra', rarity: 'rare', zoneId: 'shadow_reach', steamType: 'Multi-Vent', steamPotency: 43, mistAffinity: 0.17, description: 'A multi-headed serpent that vents steam from each of its seven heads', emoji: '🐉', xpReward: 55, tameChance: 0.18, requiredLevel: 15 },
  // Epic (7)
  { id: 'ancient_marsh_king', name: 'Ancient Marsh King', rarity: 'epic', zoneId: 'great_caldera', steamType: 'Royal Steam', steamPotency: 85, mistAffinity: 0.05, description: 'The legendary ruler of the marsh, a colossal being of ancient steam magic', emoji: '👑', xpReward: 130, tameChance: 0.08, requiredLevel: 30 },
  { id: 'steam_behemoth', name: 'Steam Behemoth', rarity: 'epic', zoneId: 'great_caldera', steamType: 'Colossal Engine', steamPotency: 80, mistAffinity: 0.06, description: 'A living steam engine the size of a mountain that powers the entire marsh', emoji: '🏔️', xpReward: 130, tameChance: 0.08, requiredLevel: 30 },
  { id: 'caldera_guardian', name: 'Caldera Guardian', rarity: 'epic', zoneId: 'great_caldera', steamType: 'Volcanic Guard', steamPotency: 78, mistAffinity: 0.07, description: 'An ancient guardian forged from caldera rock and eternal steam', emoji: '🛡️', xpReward: 120, tameChance: 0.09, requiredLevel: 30 },
  { id: 'primordial_steamer', name: 'Primordial Steamer', rarity: 'epic', zoneId: 'ancient_basin', steamType: 'Origin Steam', steamPotency: 95, mistAffinity: 0.03, description: 'A creature from the dawn of the marsh, dripping with primordial vapor', emoji: '🌋', xpReward: 150, tameChance: 0.05, requiredLevel: 38 },
  { id: 'fog_phantom', name: 'Fog Phantom', rarity: 'epic', zoneId: 'shadow_reach', steamType: 'Phase Vapor', steamPotency: 90, mistAffinity: 0.04, description: 'A ghostly entity that exists half in the fog dimension and half in the material world', emoji: '👻', xpReward: 140, tameChance: 0.06, requiredLevel: 36 },
  { id: 'iron_colossus', name: 'Iron Colossus', rarity: 'epic', zoneId: 'iron_bog', steamType: 'Titanium Forge', steamPotency: 75, mistAffinity: 0.08, description: 'The largest iron golem ever constructed, powered by a network of geysers', emoji: '⚙️', xpReward: 110, tameChance: 0.1, requiredLevel: 28 },
  { id: 'mire_witch', name: 'Mire Witch', rarity: 'epic', zoneId: 'shadow_reach', steamType: 'Swamp Hex', steamPotency: 82, mistAffinity: 0.06, description: 'An ancient witch who commands the marsh fog to weave powerful hexes', emoji: '🧙', xpReward: 125, tameChance: 0.07, requiredLevel: 32 },
  // Legendary (5)
  { id: 'eternal_geyser_spirit', name: 'Eternal Geyser Spirit', rarity: 'legendary', zoneId: 'great_caldera', steamType: 'Infinite Eruption', steamPotency: 200, mistAffinity: 0.0, description: 'The primordial spirit of the first geyser, source of all marsh steam', emoji: '💠', xpReward: 500, tameChance: 0.01, requiredLevel: 50 },
  { id: 'steam_behemoth_lord', name: 'Steam Behemoth Lord', rarity: 'legendary', zoneId: 'great_caldera', steamType: 'Apocalypse Engine', steamPotency: 160, mistAffinity: 0.01, description: 'The supreme behemoth whose steam powers the entire marsh ecosystem', emoji: '🌋', xpReward: 380, tameChance: 0.015, requiredLevel: 48 },
  { id: 'fog_empress', name: 'Fog Empress', rarity: 'legendary', zoneId: 'shadow_reach', steamType: 'Absolute Fog', steamPotency: 150, mistAffinity: 0.01, description: 'She who rules the deepest fog, commanding all mist in the marsh', emoji: '👸', xpReward: 350, tameChance: 0.02, requiredLevel: 48 },
  { id: 'caldera_phoenix', name: 'Caldera Phoenix', rarity: 'legendary', zoneId: 'great_caldera', steamType: 'Rebirth Eruption', steamPotency: 170, mistAffinity: 0.008, description: 'A phoenix born from volcanic steam that dies and is reborn in every geyser eruption', emoji: '🔥', xpReward: 400, tameChance: 0.01, requiredLevel: 50 },
  { id: 'primordial_marsh_god', name: 'Primordial Marsh God', rarity: 'legendary', zoneId: 'ancient_basin', steamType: 'Genesis Steam', steamPotency: 145, mistAffinity: 0.015, description: 'The deity that created the steam marsh from boiling earth and primordial fog', emoji: '👑', xpReward: 320, tameChance: 0.03, requiredLevel: 45 },
];

// ============================================================
// Geyser Resources (30)
// ============================================================

export const SM_GEYSER_RESOURCES: SmGeyserResourceDef[] = [
  // Common (7)
  { id: 'mineral_mist', name: 'Mineral Mist', rarity: 'common', description: 'A fine mist carrying dissolved minerals from deep geothermal springs', emoji: '💨', tapXp: 8, zoneId: 'whispering_fen' },
  { id: 'bog_sulfur', name: 'Bog Sulfur', rarity: 'common', description: 'Yellow sulfur crystals deposited around bubbling marsh vents', emoji: '💛', tapXp: 7, zoneId: 'whispering_fen' },
  { id: 'peat_crystal', name: 'Peat Crystal', rarity: 'common', description: 'Crystallized peat formed under intense geothermal pressure', emoji: '💎', tapXp: 6, zoneId: 'whispering_fen' },
  { id: 'mud_pot_mineral', name: 'Mud Pot Mineral', rarity: 'common', description: 'Mineral-rich mud from violently bubbling mud pots', emoji: '🟤', tapXp: 8, zoneId: 'bubbling_mire' },
  { id: 'sulfur_deposit', name: 'Sulfur Deposit', rarity: 'common', description: 'Raw sulfur deposits found at the base of active geysers', emoji: '🟡', tapXp: 7, zoneId: 'bubbling_mire' },
  { id: 'iron_bog_water', name: 'Iron Bog Water', rarity: 'common', description: 'Iron-rich water from the reddish bogs that fuels steam engines', emoji: '💧', tapXp: 8, zoneId: 'bubbling_mire' },
  { id: 'hot_spring_salt', name: 'Hot Spring Salt', rarity: 'common', description: 'Salt crystallized from boiling hot spring water, essential for steam engineering', emoji: '🧂', tapXp: 7, zoneId: 'copper_cauldron' },
  // Unusual (7)
  { id: 'copper_shale', name: 'Copper Shale', rarity: 'unusual', description: 'Copper-infused shale from the volcanic basin, used to craft steam engine parts', emoji: '🟠', tapXp: 15, zoneId: 'copper_cauldron' },
  { id: 'brimstone_ore', name: 'Brimstone Ore', rarity: 'unusual', description: 'Purified brimstone from the hottest caldera vents', emoji: '🔶', tapXp: 14, zoneId: 'copper_cauldron' },
  { id: 'condensation_dew', name: 'Condensation Dew', rarity: 'unusual', description: 'Magical dew collected from willow branches in the fog-dense zone', emoji: '💧', tapXp: 16, zoneId: 'willow_veil' },
  { id: 'willow_resin', name: 'Willow Resin', rarity: 'unusual', description: 'Heat-resistant resin from ancient willows, used to seal steam pipes', emoji: '🪵', tapXp: 15, zoneId: 'willow_veil' },
  { id: 'amber_sap', name: 'Amber Sap', rarity: 'unusual', description: 'Fossilized sap containing prehistoric steam organisms', emoji: '🟡', tapXp: 16, zoneId: 'willow_veil' },
  { id: 'iron_oxide', name: 'Iron Oxide', rarity: 'unusual', description: 'Refined iron oxide from the rust bogs, core material for steam machinery', emoji: '🔴', tapXp: 14, zoneId: 'iron_bog' },
  { id: 'rust_crystal', name: 'Rust Crystal', rarity: 'unusual', description: 'Crystallized rust that paradoxically strengthens iron under steam pressure', emoji: '💎', tapXp: 15, zoneId: 'iron_bog' },
  // Rare (6)
  { id: 'pressure_geode', name: 'Pressure Geode', rarity: 'rare', description: 'A geode containing hyper-pressurized steam from the deep marsh', emoji: '💠', tapXp: 30, zoneId: 'iron_bog' },
  { id: 'primordial_steam', name: 'Primordial Steam', rarity: 'rare', description: 'Steam captured from the oldest vents in the ancient basin', emoji: '♨️', tapXp: 28, zoneId: 'ancient_basin' },
  { id: 'fossil_resin', name: 'Fossil Resin', rarity: 'rare', description: 'Million-year-old resin containing the preserved essence of ancient marsh life', emoji: '🪨', tapXp: 32, zoneId: 'ancient_basin' },
  { id: 'ancient_pressure_stone', name: 'Ancient Pressure Stone', rarity: 'rare', description: 'A stone that stores and releases geothermal pressure on command', emoji: '🪨', tapXp: 30, zoneId: 'ancient_basin' },
  { id: 'shadow_steam', name: 'Shadow Steam', rarity: 'rare', description: 'Steam infused with shadow essence from the darkest reaches of the marsh', emoji: '🌑', tapXp: 34, zoneId: 'shadow_reach' },
  { id: 'void_geyserite', name: 'Void Geyserite', rarity: 'rare', description: 'An impossibly light mineral ejected by void-touched geysers', emoji: '🕳️', tapXp: 35, zoneId: 'shadow_reach' },
  // Epic (5)
  { id: 'dark_pressure_crystal', name: 'Dark Pressure Crystal', rarity: 'epic', description: 'A crystal of pure compressed shadow-steam of immense power', emoji: '💎', tapXp: 70, zoneId: 'shadow_reach' },
  { id: 'caldera_core', name: 'Caldera Core', rarity: 'epic', description: 'A fragment of the volcanic caldera core, radiating primordial heat', emoji: '🌋', tapXp: 80, zoneId: 'great_caldera' },
  { id: 'primordial_amber', name: 'Primordial Amber', rarity: 'epic', description: 'Amber from the first trees of the marsh, containing the original steam essence', emoji: '🟡', tapXp: 75, zoneId: 'great_caldera' },
  { id: 'eternal_steam_crystal', name: 'Eternal Steam Crystal', rarity: 'epic', description: 'A crystal that produces steam eternally without fuel or heat source', emoji: '💠', tapXp: 85, zoneId: 'great_caldera' },
  { id: 'marsh_god_tear', name: 'Marsh God Tear', rarity: 'epic', description: 'A crystallized tear of the primordial marsh god, containing creation energy', emoji: '💧', tapXp: 90, zoneId: 'ancient_basin' },
  // Legendary (5)
  { id: 'heart_of_the_marsh', name: 'Heart of the Marsh', rarity: 'legendary', description: 'The crystallized heart of the marsh ecosystem, beating with geothermal energy', emoji: '❤️', tapXp: 200, zoneId: 'great_caldera' },
  { id: 'genesis_geyserite', name: 'Genesis Geyserite', rarity: 'legendary', description: 'The mineral that created the first geyser at the dawn of the marsh', emoji: '💫', tapXp: 220, zoneId: 'great_caldera' },
  { id: 'eternal_fog_essence', name: 'Eternal Fog Essence', rarity: 'legendary', description: 'Pure distilled fog that never dissipates, granting infinite visibility', emoji: '🌫️', tapXp: 250, zoneId: 'shadow_reach' },
  { id: 'primordial_steam_core', name: 'Primordial Steam Core', rarity: 'legendary', description: 'The compressed core of the first steam eruption, still radiating heat', emoji: '🔥', tapXp: 280, zoneId: 'ancient_basin' },
  { id: 'caldera_seed', name: 'Caldera Seed', rarity: 'legendary', description: 'The seed from which the great caldera grew, containing world-creation steam', emoji: '🌱', tapXp: 300, zoneId: 'great_caldera' },
];

// ============================================================
// Steam Abilities (22)
// ============================================================

export const SM_ABILITIES: SmAbilityDef[] = [
  // Common (5)
  { id: 'steam_burst', name: 'Steam Burst', rarity: 'common', description: 'Release a burst of scalding steam to damage nearby threats', emoji: '💨', steamCost: 10, cooldown: 5, xpReward: 15, requiredLevel: 1, effect: 'damage' },
  { id: 'fog_veil', name: 'Fog Veil', rarity: 'common', description: 'Create a thick fog screen around yourself for temporary concealment', emoji: '🌫️', steamCost: 8, cooldown: 10, xpReward: 12, requiredLevel: 1, effect: 'defense' },
  { id: 'geyser_tap', name: 'Geyser Tap', rarity: 'common', description: 'Tap a nearby geyser to extract resources and energy', emoji: '⛲', steamCost: 8, cooldown: 8, xpReward: 12, requiredLevel: 1, effect: 'utility' },
  { id: 'mud_splash', name: 'Mud Splash', rarity: 'common', description: 'Hurl boiling mud at a target for damage and slow effect', emoji: '🟤', steamCost: 10, cooldown: 3, xpReward: 10, requiredLevel: 1, effect: 'damage' },
  { id: 'healing_vapor', name: 'Healing Vapor', rarity: 'common', description: 'Summon restorative steam that heals you and nearby allies', emoji: '♨️', steamCost: 8, cooldown: 20, xpReward: 12, requiredLevel: 1, effect: 'heal' },
  // Unusual (5)
  { id: 'pressure_jet', name: 'Pressure Jet', rarity: 'unusual', description: 'Channel a high-pressure jet of steam for concentrated damage', emoji: '🔫', steamCost: 20, cooldown: 8, xpReward: 25, requiredLevel: 8, effect: 'damage' },
  { id: 'fog_wall', name: 'Fog Wall', rarity: 'unusual', description: 'Raise an impenetrable wall of dense marsh fog', emoji: '🧱', steamCost: 25, cooldown: 30, xpReward: 30, requiredLevel: 8, effect: 'defense' },
  { id: 'steam_leap', name: 'Steam Leap', rarity: 'unusual', description: 'Propel yourself with a burst of steam to reach high locations', emoji: '🦘', steamCost: 18, cooldown: 4, xpReward: 20, requiredLevel: 8, effect: 'utility' },
  { id: 'creature_soothe', name: 'Creature Soothe', rarity: 'unusual', description: 'Use calming vapor to make wild creatures more receptive to taming', emoji: '🦎', steamCost: 22, cooldown: 60, xpReward: 28, requiredLevel: 10, effect: 'buff' },
  { id: 'mist_step', name: 'Mist Step', rarity: 'unusual', description: 'Become one with the fog, moving silently and unseen through the marsh', emoji: '👣', steamCost: 15, cooldown: 15, xpReward: 22, requiredLevel: 8, effect: 'utility' },
  // Rare (5)
  { id: 'eruption_call', name: 'Eruption Call', rarity: 'rare', description: 'Trigger a controlled geyser eruption beneath your enemies', emoji: '🌋', steamCost: 40, cooldown: 20, xpReward: 50, requiredLevel: 18, effect: 'damage' },
  { id: 'steam_drain', name: 'Steam Drain', rarity: 'rare', description: 'Draw thermal energy from the environment to restore your vitality', emoji: '💀', steamCost: 35, cooldown: 25, xpReward: 45, requiredLevel: 20, effect: 'heal' },
  { id: 'beast_whistle', name: 'Beast Whistle', rarity: 'rare', description: 'Blow a steam whistle that summons tamed creatures to your location', emoji: '🎵', steamCost: 30, cooldown: 45, xpReward: 40, requiredLevel: 18, effect: 'summon' },
  { id: 'fog_network', name: 'Fog Network', rarity: 'rare', description: 'Connect with all fog patches in the zone for awareness and travel', emoji: '🕸️', steamCost: 25, cooldown: 30, xpReward: 35, requiredLevel: 18, effect: 'utility' },
  { id: 'pressure_lock', name: 'Pressure Lock', rarity: 'rare', description: 'Lock pressure in a geyser to create a temporary power surge', emoji: '🔒', steamCost: 30, cooldown: 40, xpReward: 45, requiredLevel: 20, effect: 'utility' },
  // Epic (4)
  { id: 'ancient_engine_awakening', name: 'Ancient Engine Awakening', rarity: 'epic', description: 'Awaken a dormant ancient steam engine to power the entire zone', emoji: '⚙️', steamCost: 60, cooldown: 120, xpReward: 100, requiredLevel: 32, effect: 'ultimate' },
  { id: 'fog_realm', name: 'Fog Realm', rarity: 'epic', description: 'Phase into the fog dimension, becoming invisible and intangible', emoji: '👻', steamCost: 50, cooldown: 90, xpReward: 80, requiredLevel: 35, effect: 'utility' },
  { id: 'caldera_blessing', name: 'Caldera Blessing', rarity: 'epic', description: 'Channel the great caldera to grant massive regeneration to all allies', emoji: '🌍', steamCost: 70, cooldown: 180, xpReward: 120, requiredLevel: 38, effect: 'heal' },
  { id: 'steam_cataclysm', name: 'Steam Cataclysm', rarity: 'epic', description: 'Cause geysers across the zone to erupt simultaneously', emoji: '🌊', steamCost: 55, cooldown: 100, xpReward: 90, requiredLevel: 30, effect: 'damage' },
  // Legendary (3)
  { id: 'marsh_apocalypse', name: 'Marsh Apocalypse', rarity: 'legendary', description: 'Unleash the full fury of the marsh upon your enemies', emoji: '⚔️', steamCost: 100, cooldown: 300, xpReward: 250, requiredLevel: 45, effect: 'ultimate' },
  { id: 'eternal_fog', name: 'Eternal Fog', rarity: 'legendary', description: 'Cast an eternal fog that obscures everything within a massive radius', emoji: '⏳', steamCost: 80, cooldown: 240, xpReward: 200, requiredLevel: 45, effect: 'utility' },
  { id: 'genesis_eruption', name: 'Genesis Eruption', rarity: 'legendary', description: 'The ultimate steam ability — trigger the primordial eruption that created the marsh', emoji: '🔄', steamCost: 120, cooldown: 600, xpReward: 300, requiredLevel: 50, effect: 'ultimate' },
];

// ============================================================
// Structures (25, Lv10)
// ============================================================

export const SM_STRUCTURES: SmStructureDef[] = [
  { id: 'steam_pipe_basic', name: 'Basic Steam Pipe', description: 'A simple pipe channeling geyser steam to a collection basin', emoji: '🔧', maxLevel: 10, baseCost: 30, costMultiplier: 1.4, steamBonus: 5, requiredLevel: 1 },
  { id: 'fog_collector', name: 'Fog Collector', description: 'A device that harvests water and minerals from marsh fog', emoji: '💨', maxLevel: 10, baseCost: 50, costMultiplier: 1.5, steamBonus: 8, requiredLevel: 3 },
  { id: 'geyser_tower', name: 'Geyser Tower', description: 'A tower built atop a geyser for maximum steam extraction', emoji: '🗼', maxLevel: 10, baseCost: 80, costMultiplier: 1.5, steamBonus: 10, requiredLevel: 5 },
  { id: 'peat_storage', name: 'Peat Storage', description: 'An underground storage for peat fuel and bog resources', emoji: '🗄️', maxLevel: 10, baseCost: 40, costMultiplier: 1.4, steamBonus: 6, requiredLevel: 2 },
  { id: 'marsh_bridge', name: 'Marsh Bridge', description: 'A steam-heated bridge spanning dangerous bog stretches', emoji: '🌉', maxLevel: 10, baseCost: 60, costMultiplier: 1.5, steamBonus: 7, requiredLevel: 8 },
  { id: 'mud_fortification', name: 'Mud Fortification', description: 'A defensive wall of hardened mud reinforced with steam pipes', emoji: '🧱', maxLevel: 10, baseCost: 70, costMultiplier: 1.5, steamBonus: 12, requiredLevel: 10 },
  { id: 'copper_forge', name: 'Copper Forge', description: 'A forge powered by copper caldera geysers for crafting steam parts', emoji: '🔨', maxLevel: 10, baseCost: 100, costMultiplier: 1.6, steamBonus: 15, requiredLevel: 15 },
  { id: 'steam_engine_basic', name: 'Basic Steam Engine', description: 'A rudimentary engine that converts geyser pressure into usable power', emoji: '⚙️', maxLevel: 10, baseCost: 120, costMultiplier: 1.6, steamBonus: 18, requiredLevel: 18 },
  { id: 'pressure_vault', name: 'Pressure Vault', description: 'A reinforced vault for storing pressurized steam and volatile resources', emoji: '🏦', maxLevel: 10, baseCost: 150, costMultiplier: 1.6, steamBonus: 20, requiredLevel: 22 },
  { id: 'fog_observatory', name: 'Fog Observatory', description: 'A tower with fog-piercing lenses for observing creatures across the marsh', emoji: '🔭', maxLevel: 10, baseCost: 130, costMultiplier: 1.6, steamBonus: 16, requiredLevel: 20 },
  { id: 'iron_foundry', name: 'Iron Foundry', description: 'A massive foundry smelting iron ore with geothermal heat', emoji: '🏭', maxLevel: 10, baseCost: 160, costMultiplier: 1.7, steamBonus: 22, requiredLevel: 25 },
  { id: 'ancient_engine_room', name: 'Ancient Engine Room', description: 'Restored room containing a prehistoric steam engine of immense power', emoji: '🏛️', maxLevel: 10, baseCost: 180, costMultiplier: 1.7, steamBonus: 25, requiredLevel: 28 },
  { id: 'fog_maze', name: 'Fog Maze', description: 'A labyrinth of deliberately generated fog that confuses intruders', emoji: '🌀', maxLevel: 10, baseCost: 200, costMultiplier: 1.7, steamBonus: 28, requiredLevel: 32 },
  { id: 'geyser_spires', name: 'Geyser Spires', description: 'Twin spires channeling steam from the deepest vents', emoji: '🗼', maxLevel: 10, baseCost: 220, costMultiplier: 1.8, steamBonus: 30, requiredLevel: 36 },
  { id: 'marsh_sanctum', name: 'Marsh Sanctum', description: 'A sacred chamber where the boundary between fog and material thins', emoji: '👑', maxLevel: 10, baseCost: 250, costMultiplier: 1.8, steamBonus: 35, requiredLevel: 40 },
  { id: 'steam_greenhouse', name: 'Steam Greenhouse', description: 'A greenhouse using geothermal heat to grow rare bog plants', emoji: '🌺', maxLevel: 10, baseCost: 90, costMultiplier: 1.5, steamBonus: 10, requiredLevel: 12 },
  { id: 'pipe_network_hub', name: 'Pipe Network Hub', description: 'Central hub connecting all steam pipes across the marsh', emoji: '🕸️', maxLevel: 10, baseCost: 140, costMultiplier: 1.6, steamBonus: 18, requiredLevel: 24 },
  { id: 'wraith_sanctuary', name: 'Wraith Sanctuary', description: 'A sanctuary where fog wraiths gather, boosting friendship gains', emoji: '🕊️', maxLevel: 10, baseCost: 170, costMultiplier: 1.7, steamBonus: 24, requiredLevel: 30 },
  { id: 'steam_arena', name: 'Steam Arena', description: 'An arena where creatures compete within steam-powered obstacle courses', emoji: '🏟️', maxLevel: 10, baseCost: 190, costMultiplier: 1.7, steamBonus: 26, requiredLevel: 34 },
  { id: 'marsh_monument', name: 'Marsh Monument', description: 'A monument to all marsh explorers, radiating eternal steam', emoji: '🗿', maxLevel: 10, baseCost: 300, costMultiplier: 1.9, steamBonus: 40, requiredLevel: 45 },
  { id: 'engineering_lab', name: 'Engineering Lab', description: 'A lab for advanced steam engineering and geyser research', emoji: '🔬', maxLevel: 10, baseCost: 110, costMultiplier: 1.5, steamBonus: 14, requiredLevel: 16 },
  { id: 'fog_control_station', name: 'Fog Control Station', description: 'A station for managing marsh fog density and visibility', emoji: '🌡️', maxLevel: 10, baseCost: 160, costMultiplier: 1.6, steamBonus: 20, requiredLevel: 26 },
  { id: 'caldera_gateway', name: 'Caldera Gateway', description: 'A gateway connecting to the great caldera steam network', emoji: '🚪', maxLevel: 10, baseCost: 350, costMultiplier: 2.0, steamBonus: 50, requiredLevel: 48 },
  { id: 'steam_palace', name: 'Steam Palace', description: 'The ultimate marsh structure — a palace of brass, copper, and living steam', emoji: '🏰', maxLevel: 10, baseCost: 400, costMultiplier: 2.0, steamBonus: 60, requiredLevel: 50 },
];

// ============================================================
// Fog Wraiths (10)
// ============================================================

export const SM_FOG_WRAITHS: SmFogWraithDef[] = [
  { id: 'wraith_vaporia', name: 'Vaporia', element: 'Vapor', description: 'The ancient wraith of vapor — her mist breath shapes the marsh fog daily', emoji: '💨', blessingType: 'speed', blessingPower: 16, giftPreference: 'mineral_mist' },
  { id: 'wraith_terma', name: 'Terma', element: 'Thermal', description: 'The wraith of thermal springs — she warms the coldest bog waters', emoji: '♨️', blessingType: 'growth', blessingPower: 15, giftPreference: 'condensation_dew' },
  { id: 'wraith_pressurus', name: 'Pressurus', element: 'Pressure', description: 'The wraith of pressure — his force powers every geyser eruption', emoji: '🌋', blessingType: 'power', blessingPower: 25, giftPreference: 'pressure_geode' },
  { id: 'wraith_nebulis', name: 'Nebulis', element: 'Nebula', description: 'The wraith of nebula fog — her clouds provide cover and vision', emoji: '🌅', blessingType: 'defense', blessingPower: 14, giftPreference: 'willow_resin' },
  { id: 'wraith_aqualis', name: 'Aqualis', element: 'Aqua', description: 'The wraith of marsh water — she purifies the foulest bog pools', emoji: '💧', blessingType: 'heal', blessingPower: 18, giftPreference: 'iron_bog_water' },
  { id: 'wraith_ferrum', name: 'Ferrum', element: 'Iron', description: 'The wraith of iron — he strengthens all steam engines and structures', emoji: '⚙️', blessingType: 'durability', blessingPower: 22, giftPreference: 'iron_oxide' },
  { id: 'wraith_crystara', name: 'Crystara', element: 'Crystal', description: 'The wraith of crystal — she transforms steam into solid mineral form', emoji: '💎', blessingType: 'yield', blessingPower: 20, giftPreference: 'peat_crystal' },
  { id: 'wraith_umbris', name: 'Umbris', element: 'Shadow', description: 'The wraith of shadow — his darkness nurtures the deepest fog creatures', emoji: '🌑', blessingType: 'adaptability', blessingPower: 16, giftPreference: 'shadow_steam' },
  { id: 'wraith_sulfura', name: 'Sulfura', element: 'Sulfur', description: 'The wraith of sulfur — she accelerates all geyser resource production', emoji: '💛', blessingType: 'speed', blessingPower: 24, giftPreference: 'bog_sulfur' },
  { id: 'wraith_primus', name: 'Primus', element: 'Primordial', description: 'The oldest wraith — his primordial steam created the first marsh life', emoji: '🌟', blessingType: 'ultimate', blessingPower: 30, giftPreference: 'primordial_steam' },
];

// ============================================================
// Daily Quest Types
// ============================================================

export const SM_DAILY_QUEST_TYPES: { type: SmDailyQuestType; name: string; description: string; target: number; rewardCoins: number; rewardXp: number; emoji: string }[] = [
  { type: 'tap', name: 'Geyser Tapping', description: 'Tap geysers in explored zones for resources', target: 5, rewardCoins: 50, rewardXp: 30, emoji: '⛲' },
  { type: 'navigate', name: 'Fog Navigation', description: 'Navigate through dense fog in dangerous zones', target: 3, rewardCoins: 60, rewardXp: 35, emoji: '🌫️' },
  { type: 'tame', name: 'Creature Taming', description: 'Attempt to tame wild steam creatures', target: 2, rewardCoins: 55, rewardXp: 30, emoji: '🦎' },
  { type: 'engineer', name: 'Steam Engineering', description: 'Build and upgrade steam structures', target: 2, rewardCoins: 65, rewardXp: 35, emoji: '⚙️' },
  { type: 'explore', name: 'Zone Exploration', description: 'Visit and secure all explored marsh zones', target: 4, rewardCoins: 75, rewardXp: 45, emoji: '🗺️' },
  { type: 'scout', name: 'Marsh Scouting', description: 'Scout fog wraiths in the misty zones', target: 3, rewardCoins: 70, rewardXp: 40, emoji: '👻' },
];

// ============================================================
// Season Events
// ============================================================

export const SM_SEASON_EVENTS: { id: string; name: string; description: string; emoji: string; duration: number; rewardCoins: number; rewardXp: number; targetProgress: number }[] = [
  { id: 'great_eruption', name: 'Great Eruption', description: 'All geysers erupt simultaneously — resource yields are doubled', emoji: '🌋', duration: 3600, rewardCoins: 500, rewardXp: 300, targetProgress: 50 },
  { id: 'fog_invasion', name: 'Fog Invasion', description: 'Supernatural fog threatens the marsh — navigate and clear it', emoji: '🌫️', duration: 3600, rewardCoins: 750, rewardXp: 500, targetProgress: 30 },
  { id: 'steam_festival', name: 'Steam Festival', description: 'A celebration of marsh engineering — fog wraiths are more friendly', emoji: '⚙️', duration: 7200, rewardCoins: 400, rewardXp: 400, targetProgress: 20 },
  { id: 'ancient_awakening', name: 'Ancient Awakening', description: 'Ancient steam engines stir with renewed geothermal power', emoji: '🏛️', duration: 5400, rewardCoins: 600, rewardXp: 600, targetProgress: 15 },
  { id: 'midnight_fog', name: 'Midnight Fog', description: 'The fog thickens at midnight — creature encounters are enhanced', emoji: '🌙', duration: 4800, rewardCoins: 350, rewardXp: 350, targetProgress: 40 },
];

// ============================================================
// Achievements (18)
// ============================================================

export const SM_ACHIEVEMENTS: SmAchievementDef[] = [
  { id: 'ach_first_zone', name: 'First Steps', description: 'Explore your first marsh zone', conditionKey: 'totalCreaturesFound', targetValue: 1, rewardCoins: 25, rewardXp: 15, emoji: '👣' },
  { id: 'ach_creature_finder_5', name: 'Creature Finder', description: 'Discover 5 different steam creatures', conditionKey: 'totalCreaturesFound', targetValue: 5, rewardCoins: 100, rewardXp: 50, emoji: '🔍' },
  { id: 'ach_creature_finder_15', name: 'Monster Scholar', description: 'Discover 15 different steam creatures', conditionKey: 'totalCreaturesFound', targetValue: 15, rewardCoins: 300, rewardXp: 150, emoji: '📖' },
  { id: 'ach_creature_finder_35', name: 'Bestiary Master', description: 'Discover all 35 steam creatures', conditionKey: 'totalCreaturesFound', targetValue: 35, rewardCoins: 1000, rewardXp: 500, emoji: '📚' },
  { id: 'ach_resource_gatherer', name: 'Resource Gatherer', description: 'Gather 20 geyser resources in total', conditionKey: 'totalResourcesGathered', targetValue: 20, rewardCoins: 80, rewardXp: 40, emoji: '💎' },
  { id: 'ach_master_gatherer', name: 'Master Gatherer', description: 'Gather 100 geyser resources in total', conditionKey: 'totalResourcesGathered', targetValue: 100, rewardCoins: 300, rewardXp: 150, emoji: '💎' },
  { id: 'ach_geyser_master', name: 'Geyser Master', description: 'Tap geysers 50 times', conditionKey: 'totalTapped', targetValue: 50, rewardCoins: 100, rewardXp: 50, emoji: '⛲' },
  { id: 'ach_fog_navigator', name: 'Fog Navigator', description: 'Navigate through fog 25 times', conditionKey: 'totalFogNavigated', targetValue: 25, rewardCoins: 400, rewardXp: 200, emoji: '🌫️' },
  { id: 'ach_engineer', name: 'Marsh Engineer', description: 'Build 10 steam structures', conditionKey: 'totalEnginesBuilt', targetValue: 10, rewardCoins: 200, rewardXp: 100, emoji: '⚙️' },
  { id: 'ach_eruption_manager', name: 'Eruption Manager', description: 'Manage 10 geyser eruptions', conditionKey: 'totalGeyserEruptions', targetValue: 10, rewardCoins: 200, rewardXp: 100, emoji: '🌋' },
  { id: 'ach_ability_master', name: 'Ability Master', description: 'Cast steam abilities 50 times', conditionKey: 'totalAbilityCasts', targetValue: 50, rewardCoins: 300, rewardXp: 150, emoji: '💨' },
  { id: 'ach_wraith_friend', name: 'Wraith Friend', description: 'Befriend 3 fog wraiths', conditionKey: 'totalWraithsBefriended', targetValue: 3, rewardCoins: 150, rewardXp: 75, emoji: '👻' },
  { id: 'ach_wraith_council', name: 'Wraith Council', description: 'Befriend all 10 fog wraiths', conditionKey: 'totalWraithsBefriended', targetValue: 10, rewardCoins: 1000, rewardXp: 500, emoji: '🕊️' },
  { id: 'ach_creature_rider', name: 'Creature Rider', description: 'Tame and ride a legendary steam creature', conditionKey: 'totalRides', targetValue: 1, rewardCoins: 500, rewardXp: 250, emoji: '🦎' },
  { id: 'ach_zone_explorer', name: 'Zone Explorer', description: 'Explore all 8 marsh zones', conditionKey: 'level', targetValue: 45, rewardCoins: 500, rewardXp: 250, emoji: '🗺️' },
  { id: 'ach_ancient_guardian', name: 'Ancient Guardian', description: 'Reach the maximum level of 50', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXp: 1000, emoji: '👑' },
  { id: 'ach_daily_10', name: 'Dedicated Marshkeeper', description: 'Complete 10 daily quests', conditionKey: 'totalTapped', targetValue: 50, rewardCoins: 500, rewardXp: 250, emoji: '🏹' },
  { id: 'ach_pressure_king', name: 'Pressure King', description: 'Reach maximum steam pressure of 100', conditionKey: 'totalGeyserEruptions', targetValue: 20, rewardCoins: 600, rewardXp: 300, emoji: '🌊' },
];

// ============================================================
// Initial State Factory
// ============================================================

function smCreateInitialState(seed?: number): SteamMarshState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const creatures: Record<string, SmCreatureState> = {};
  for (const c of SM_CREATURES) {
    creatures[c.id] = { owned: false, count: 0, tamed: false, ridden: false, lastSeen: null };
  }
  const zones: Record<string, SmZoneState> = {};
  for (const z of SM_ZONES) {
    zones[z.id] = {
      explored: z.unlockLevel <= 1,
      level: 1,
      tappedCount: 0,
      creaturesFound: 0,
      unlockedAt: z.unlockLevel <= 1 ? Date.now() : null,
    };
  }
  const abilities: Record<string, SmAbilityState> = {};
  for (const a of SM_ABILITIES) {
    abilities[a.id] = { learned: a.requiredLevel <= 1, castCount: 0, cooldownEnd: 0 };
  }
  const structures: Record<string, SmStructureState> = {};
  for (const s of SM_STRUCTURES) {
    structures[s.id] = { level: 0, builtAt: null };
  }
  const fogWraiths: Record<string, SmFogWraithState> = {};
  for (const w of SM_FOG_WRAITHS) {
    fogWraiths[w.id] = { befriended: false, friendship: 0, giftsGiven: 0, lastGiftAt: null };
  }
  const achievements: Record<string, SmAchievementState> = {};
  for (const ac of SM_ACHIEVEMENTS) {
    achievements[ac.id] = { unlocked: false, unlockedAt: null };
  }

  return {
    level: 1,
    xp: 0,
    coins: 100,
    title: 'Mist Wader',
    creatures,
    zones,
    resources: { mineral_mist: 3, bog_sulfur: 2, peat_crystal: 2 },
    abilities,
    structures,
    fogWraiths,
    achievements,
    dailyQuest: {
      lastDate: null,
      streak: 0,
      completed: false,
      questType: null,
      questProgress: 0,
      questTarget: 0,
      rewardClaimed: false,
    },
    activeSeason: {
      id: null,
      progress: 0,
      startTime: null,
      endTime: null,
      rewardClaimed: false,
    },
    totals: {
      totalTapped: 0,
      totalCreaturesFound: 0,
      totalFogNavigated: 0,
      totalEnginesBuilt: 0,
      totalGeyserEruptions: 0,
      totalAbilityCasts: 0,
      totalWraithsBefriended: 0,
      totalRides: 0,
      totalResourcesGathered: 0,
    },
    seed: effectiveSeed,
    fogDensity: 0,
    steamPressure: 0,
  };
}

// ============================================================
// Hook: useSteamMarsh
// ============================================================

export default function useSteamMarsh(initialSeed?: number) {
  const [state, setState] = useState<SteamMarshState>(() => smCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(smMulberry32(state.seed));
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Core State ----

  const smGetState = useCallback((): Readonly<SteamMarshState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const smResetState = useCallback((newSeed?: number) => {
    const s = smCreateInitialState(newSeed);
    prngRef.current = smMulberry32(s.seed);
    setState(s);
  }, []);

  const smGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const smGetXp = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const smGetXPTillNext = useCallback((): number => {
    return smXpRequired(state.level);
  }, [state.level]);

  const smAddXp = useCallback((amount: number): SteamMarshState => {
    let next = state;
    setState((prev) => {
      let lvl = prev.level;
      let xp = prev.xp + Math.floor(amount);
      while (lvl < SM_MAX_LEVEL && xp >= smXpRequired(lvl)) {
        xp -= smXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= SM_MAX_LEVEL) xp = 0;
      next = { ...prev, level: smClampLevel(lvl), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Coins ----

  const smGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const smAddCoins = useCallback((amount: number): SteamMarshState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: smClampCoins(prev.coins + amount) };
      return next;
    });
    return next;
  }, [state]);

  const smSpendCoins = useCallback((amount: number): { success: boolean; state: SteamMarshState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: smClampCoins(prev.coins - amount) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Title ----

  const smGetTitle = useCallback((): SmTitleInfo => {
    let current = SM_TITLES[0];
    for (const t of SM_TITLES) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const smGetAllTitles = useCallback((): SmTitleInfo[] => {
    return [...SM_TITLES];
  }, []);

  const smGetNextTitle = useCallback((): SmTitleInfo | null => {
    for (const t of SM_TITLES) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const smGetProgress = useCallback((): number => {
    const needed = smXpRequired(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const smGetOverallProgress = useCallback((): number => {
    return state.level / SM_MAX_LEVEL;
  }, [state.level]);

  // ---- Creatures ----

  const smGetCreatures = useCallback((): SmCreatureDef[] => {
    return [...SM_CREATURES];
  }, []);

  const smGetCreatureById = useCallback((id: string): SmCreatureDef | null => {
    return SM_CREATURES.find((c) => c.id === id) ?? null;
  }, []);

  const smGetOwnedCreatures = useCallback((): SmCreatureDef[] => {
    return SM_CREATURES.filter((c) => state.creatures[c.id]?.owned);
  }, [state.creatures]);

  const smGetCreatureByRarity = useCallback((rarity: SmRarity): SmCreatureDef[] => {
    return SM_CREATURES.filter((c) => c.rarity === rarity);
  }, []);

  const smDiscoverCreature = useCallback((creatureId: string): { success: boolean; state: SteamMarshState } => {
    const def = SM_CREATURES.find((c) => c.id === creatureId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      const existing = prev.creatures[creatureId];
      if (!existing) return prev;
      const wasNew = !existing.owned;
      next = {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: {
            ...existing,
            owned: true,
            count: existing.count + 1,
            lastSeen: Date.now(),
          },
        },
        totals: {
          ...prev.totals,
          totalCreaturesFound: prev.totals.totalCreaturesFound + (wasNew ? 1 : 0),
        },
      };
      if (wasNew && existing.lastSeen === null) {
        const zoneState = prev.zones[def.zoneId];
        if (zoneState) {
          next = {
            ...next,
            zones: {
              ...next.zones,
              [def.zoneId]: { ...zoneState, creaturesFound: zoneState.creaturesFound + 1 },
            },
          };
        }
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smTameCreature = useCallback((creatureId: string): { success: boolean; state: SteamMarshState } => {
    const def = SM_CREATURES.find((c) => c.id === creatureId);
    if (!def) return { success: false, state };
    const creatureState = state.creatures[creatureId];
    if (!creatureState || !creatureState.owned) return { success: false, state };
    if (creatureState.tamed) return { success: false, state };

    const rng = prngRef.current();
    const structBoost = Object.entries(state.structures)
      .filter(([, s]) => s.builtAt !== null && s.level > 0)
      .reduce((sum, [structId, s]) => {
        const structDef = SM_STRUCTURES.find((d) => d.id === structId);
        return sum + (structDef?.steamBonus ?? 0) * s.level * 0.002;
      }, 0);
    const chance = def.tameChance + structBoost;

    if (rng > chance) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: { ...prev.creatures[creatureId], tamed: true },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smIsCreatureTamed = useCallback((creatureId: string): boolean => {
    return state.creatures[creatureId]?.tamed ?? false;
  }, [state.creatures]);

  const smRideCreature = useCallback((creatureId: string): { success: boolean; state: SteamMarshState } => {
    const creatureState = state.creatures[creatureId];
    if (!creatureState || !creatureState.owned || !creatureState.tamed) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: { ...prev.creatures[creatureId], ridden: true },
        },
        totals: { ...prev.totals, totalRides: prev.totals.totalRides + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smGetTamedCreatures = useCallback((): SmCreatureDef[] => {
    return SM_CREATURES.filter((c) => state.creatures[c.id]?.tamed);
  }, [state.creatures]);

  const smGetCreatureInfo = useCallback((creatureId: string): SmCreatureState | null => {
    return state.creatures[creatureId] ?? null;
  }, [state.creatures]);

  // ---- Zones ----

  const smGetZones = useCallback((): SmZoneDef[] => {
    return [...SM_ZONES];
  }, []);

  const smGetZoneById = useCallback((id: string): SmZoneDef | null => {
    return SM_ZONES.find((z) => z.id === id) ?? null;
  }, []);

  const smExploreZone = useCallback((zoneId: string): { success: boolean; state: SteamMarshState } => {
    const def = SM_ZONES.find((z) => z.id === zoneId);
    if (!def) return { success: false, state };
    if (state.level < def.unlockLevel) return { success: false, state };
    if (state.zones[zoneId]?.explored) return { success: false, state };
    let next = state;
    setState((prev) => {
      const zoneState = prev.zones[zoneId];
      if (!zoneState) return prev;
      next = {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zoneState, explored: true, unlockedAt: Date.now() },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smIsZoneExplored = useCallback((zoneId: string): boolean => {
    return state.zones[zoneId]?.explored ?? false;
  }, [state.zones]);

  const smGetExploredZones = useCallback((): SmZoneDef[] => {
    return SM_ZONES.filter((z) => state.zones[z.id]?.explored);
  }, [state.zones]);

  const smTapInZone = useCallback((zoneId: string): { success: boolean; resources: { resourceId: string; amount: number }[]; state: SteamMarshState } => {
    const def = SM_ZONES.find((z) => z.id === zoneId);
    if (!def) return { success: false, resources: [], state };
    const zoneState = state.zones[zoneId];
    if (!zoneState || !zoneState.explored) return { success: false, resources: [], state };

    const zoneLevel = zoneState.level;
    const baseRate = def.baseTapRate + zoneLevel * 0.02;
    const seasonBoost = state.activeSeason.id === 'great_eruption' ? 1.5 : 1;
    const rng = prngRef.current();

    const foundResources: { resourceId: string; amount: number }[] = [];
    const newResources: Record<string, number> = { ...state.resources };

    for (const resourceId of def.geyserList) {
      if (rng <= baseRate * seasonBoost) {
        const amount = 1 + Math.floor(prngRef.current() * 2);
        newResources[resourceId] = (newResources[resourceId] ?? 0) + amount;
        foundResources.push({ resourceId, amount });
      }
    }

    if (foundResources.length === 0) return { success: true, resources: [], state };

    const totalXp = foundResources.reduce((sum, r) => {
      const resDef = SM_GEYSER_RESOURCES.find((rd) => rd.id === r.resourceId);
      return sum + ((resDef?.tapXp ?? 5) * r.amount);
    }, 0);

    let next = state;
    setState((prev) => {
      const zs = prev.zones[zoneId];
      next = {
        ...prev,
        resources: newResources,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zs!, tappedCount: zs!.tappedCount + foundResources.length },
        },
        totals: { ...prev.totals, totalResourcesGathered: prev.totals.totalResourcesGathered + foundResources.length },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(totalXp);
      while (lvl < SM_MAX_LEVEL && xp >= smXpRequired(lvl)) {
        xp -= smXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= SM_MAX_LEVEL) xp = 0;
      next = { ...next, level: smClampLevel(lvl), xp };
      return next;
    });
    return { success: true, resources: foundResources, state: next };
  }, [state]);

  const smGetZoneInfo = useCallback((zoneId: string): SmZoneState | null => {
    return state.zones[zoneId] ?? null;
  }, [state.zones]);

  const smUpgradeZone = useCallback((zoneId: string): { success: boolean; cost: number; state: SteamMarshState } => {
    const def = SM_ZONES.find((z) => z.id === zoneId);
    if (!def) return { success: false, cost: 0, state };
    const zoneState = state.zones[zoneId];
    if (!zoneState || !zoneState.explored) return { success: false, cost: 0, state };
    const cost = Math.floor(50 * Math.pow(1.5, zoneState.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const zs = prev.zones[zoneId];
      if (!zs) return prev;
      next = {
        ...prev,
        zones: { ...prev.zones, [zoneId]: { ...zs, level: zs.level + 1 } },
        coins: smClampCoins(prev.coins - cost),
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Geyser Resources ----

  const smGetResources = useCallback((): SmGeyserResourceDef[] => {
    return [...SM_GEYSER_RESOURCES];
  }, []);

  const smGetResourceById = useCallback((id: string): SmGeyserResourceDef | null => {
    return SM_GEYSER_RESOURCES.find((r) => r.id === id) ?? null;
  }, []);

  const smGetResourceCount = useCallback((resourceId: string): number => {
    return state.resources[resourceId] ?? 0;
  }, [state.resources]);

  const smGetAllResourceCounts = useCallback((): Record<string, number> => {
    return { ...state.resources };
  }, [state.resources]);

  // ---- Abilities ----

  const smGetAbilities = useCallback((): SmAbilityDef[] => {
    return [...SM_ABILITIES];
  }, []);

  const smLearnAbility = useCallback((abilityId: string): { success: boolean; state: SteamMarshState } => {
    const def = SM_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.abilities[abilityId]?.learned) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        abilities: {
          ...prev.abilities,
          [abilityId]: { ...prev.abilities[abilityId], learned: true },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smCastAbility = useCallback((abilityId: string, now: number = Date.now()): { success: boolean; state: SteamMarshState } => {
    const def = SM_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, state };
    const abilityState = state.abilities[abilityId];
    if (!abilityState || !abilityState.learned) return { success: false, state };
    if (now < abilityState.cooldownEnd) return { success: false, state };
    let next = state;
    setState((prev) => {
      const as = prev.abilities[abilityId];
      next = {
        ...prev,
        abilities: {
          ...prev.abilities,
          [abilityId]: {
            ...as!,
            castCount: as!.castCount + 1,
            cooldownEnd: now + def.cooldown * 1000,
          },
        },
        totals: { ...prev.totals, totalAbilityCasts: prev.totals.totalAbilityCasts + 1 },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(def.xpReward);
      while (lvl < SM_MAX_LEVEL && xp >= smXpRequired(lvl)) {
        xp -= smXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= SM_MAX_LEVEL) xp = 0;
      next = { ...next, level: smClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smIsAbilityLearned = useCallback((abilityId: string): boolean => {
    return state.abilities[abilityId]?.learned ?? false;
  }, [state.abilities]);

  const smGetLearnedAbilities = useCallback((): SmAbilityDef[] => {
    return SM_ABILITIES.filter((a) => state.abilities[a.id]?.learned);
  }, [state.abilities]);

  // ---- Structures ----

  const smGetStructures = useCallback((): SmStructureDef[] => {
    return [...SM_STRUCTURES];
  }, []);

  const smBuildStructure = useCallback((structureId: string): { success: boolean; state: SteamMarshState } => {
    const def = SM_STRUCTURES.find((s) => s.id === structureId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    const currentLevel = state.structures[structureId]?.level ?? 0;
    if (currentLevel >= def.maxLevel) return { success: false, state };
    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
    if (state.coins < cost) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newLevel = (prev.structures[structureId]?.level ?? 0) + 1;
      next = {
        ...prev,
        structures: {
          ...prev.structures,
          [structureId]: {
            level: newLevel,
            builtAt: prev.structures[structureId]?.builtAt ?? Date.now(),
          },
        },
        coins: smClampCoins(prev.coins - cost),
        totals: {
          ...prev.totals,
          totalEnginesBuilt: prev.totals.totalEnginesBuilt + 1,
        },
      };
      let lvl = next.level;
      let xp = next.xp + Math.floor(20 + newLevel * 5);
      while (lvl < SM_MAX_LEVEL && xp >= smXpRequired(lvl)) {
        xp -= smXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= SM_MAX_LEVEL) xp = 0;
      next = { ...next, level: smClampLevel(lvl), xp };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smGetStructureLevel = useCallback((structureId: string): number => {
    return state.structures[structureId]?.level ?? 0;
  }, [state.structures]);

  const smGetStructureInfo = useCallback((structureId: string): SmStructureState | null => {
    return state.structures[structureId] ?? null;
  }, [state.structures]);

  const smGetStructureUpgradeCost = useCallback((structureId: string): number => {
    const def = SM_STRUCTURES.find((s) => s.id === structureId);
    if (!def) return 0;
    const currentLevel = state.structures[structureId]?.level ?? 0;
    if (currentLevel >= def.maxLevel) return 0;
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
  }, [state.structures]);

  // ---- Fog Wraiths ----

  const smGetFogWraiths = useCallback((): SmFogWraithDef[] => {
    return [...SM_FOG_WRAITHS];
  }, []);

  const smBefriendWraith = useCallback((wraithId: string): { success: boolean; state: SteamMarshState } => {
    const def = SM_FOG_WRAITHS.find((w) => w.id === wraithId);
    if (!def) return { success: false, state };
    const wraithState = state.fogWraiths[wraithId];
    if (!wraithState) return { success: false, state };
    if (wraithState.befriended) return { success: false, state };
    let next = state;
    setState((prev) => {
      const ws = prev.fogWraiths[wraithId];
      if (!ws) return prev;
      next = {
        ...prev,
        fogWraiths: {
          ...prev.fogWraiths,
          [wraithId]: { ...ws, befriended: true, friendship: 100 },
        },
        totals: { ...prev.totals, totalWraithsBefriended: prev.totals.totalWraithsBefriended + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smGiftWraith = useCallback((wraithId: string, resourceId: string): { success: boolean; friendshipGain: number; state: SteamMarshState } => {
    const def = SM_FOG_WRAITHS.find((w) => w.id === wraithId);
    if (!def) return { success: false, friendshipGain: 0, state };
    const wraithState = state.fogWraiths[wraithId];
    if (!wraithState) return { success: false, friendshipGain: 0, state };
    if (state.resources[resourceId] === undefined || state.resources[resourceId] < 1) {
      return { success: false, friendshipGain: 0, state };
    }

    const isFavorite = def.giftPreference === resourceId;
    const baseGain = isFavorite ? 15 : 5;
    const seasonBoost = state.activeSeason.id === 'steam_festival' ? 1.5 : 1;
    const friendshipGain = Math.floor(baseGain * seasonBoost);
    const newFriendship = Math.min(100, wraithState.friendship + friendshipGain);

    let next = state;
    setState((prev) => {
      const newResources = { ...prev.resources };
      newResources[resourceId] -= 1;
      if (newResources[resourceId] <= 0) delete newResources[resourceId];
      const ws = prev.fogWraiths[wraithId];
      next = {
        ...prev,
        resources: newResources,
        fogWraiths: {
          ...prev.fogWraiths,
          [wraithId]: {
            ...ws!,
            friendship: Math.min(100, ws!.friendship + friendshipGain),
            giftsGiven: ws!.giftsGiven + 1,
            lastGiftAt: Date.now(),
            befriended: newFriendship >= 100,
          },
        },
        totals: {
          ...prev.totals,
          totalWraithsBefriended: prev.totals.totalWraithsBefriended + (newFriendship >= 100 && !ws!.befriended ? 1 : 0),
        },
      };
      return next;
    });
    return { success: true, friendshipGain, state: next };
  }, [state]);

  const smIsWraithBefriended = useCallback((wraithId: string): boolean => {
    return state.fogWraiths[wraithId]?.befriended ?? false;
  }, [state.fogWraiths]);

  const smGetBefriendedWraiths = useCallback((): SmFogWraithDef[] => {
    return SM_FOG_WRAITHS.filter((w) => state.fogWraiths[w.id]?.befriended);
  }, [state.fogWraiths]);

  // ---- Geyser Tapping ----

  const smTapGeyser = useCallback((): { success: boolean; xp: number; state: SteamMarshState } => {
    const rng = prngRef.current();
    const xpGain = Math.floor(10 + rng * 15 + state.level * 2);
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        totals: { ...prev.totals, totalTapped: prev.totals.totalTapped + 1 },
      };
      let lvl = next.level;
      let xp = next.xp + xpGain;
      while (lvl < SM_MAX_LEVEL && xp >= smXpRequired(lvl)) {
        xp -= smXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= SM_MAX_LEVEL) xp = 0;
      next = { ...next, level: smClampLevel(lvl), xp };
      return next;
    });
    return { success: true, xp: xpGain, state: next };
  }, [state]);

  // ---- Fog Navigation ----

  const smNavigateFog = useCallback((): { success: boolean; state: SteamMarshState } => {
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        fogDensity: Math.min(100, prev.fogDensity + 5),
        totals: { ...prev.totals, totalFogNavigated: prev.totals.totalFogNavigated + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smGetFogDensity = useCallback((): number => {
    return state.fogDensity;
  }, [state.fogDensity]);

  // ---- Steam Pressure ----

  const smIncreasePressure = useCallback((): { success: boolean; state: SteamMarshState } => {
    const cost = 10 + state.steamPressure * 2;
    if (state.coins < cost) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        steamPressure: prev.steamPressure + 1,
        coins: smClampCoins(prev.coins - cost),
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smGetSteamPressure = useCallback((): number => {
    return state.steamPressure;
  }, [state.steamPressure]);

  // ---- Daily Quest ----

  const smGetDailyQuest = useCallback((): SmDailyQuestState => {
    return { ...state.dailyQuest };
  }, [state.dailyQuest]);

  const smStartDailyQuest = useCallback((): { success: boolean; state: SteamMarshState } => {
    const today = smGenerateDayKey(Date.now());
    if (state.dailyQuest.lastDate === today) return { success: false, state };
    const questIdx = Math.floor(prngRef.current() * SM_DAILY_QUEST_TYPES.length);
    const quest = SM_DAILY_QUEST_TYPES[questIdx];
    const newStreak = state.dailyQuest.lastDate !== null
      ? (smGenerateDayKey(Date.now() - 86400000) === state.dailyQuest.lastDate ? state.dailyQuest.streak + 1 : 1)
      : 1;
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyQuest: {
          lastDate: today,
          streak: newStreak,
          completed: false,
          questType: quest.type,
          questProgress: 0,
          questTarget: quest.target,
          rewardClaimed: false,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smUpdateQuestProgress = useCallback((amount: number = 1): { success: boolean; state: SteamMarshState } => {
    const dq = state.dailyQuest;
    if (!dq.questType) return { success: false, state };
    if (dq.completed) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newProgress = Math.min(prev.dailyQuest.questTarget, prev.dailyQuest.questProgress + amount);
      const completed = newProgress >= prev.dailyQuest.questTarget;
      next = {
        ...prev,
        dailyQuest: {
          ...prev.dailyQuest,
          questProgress: newProgress,
          completed,
        },
      };
      if (completed) {
        const quest = SM_DAILY_QUEST_TYPES.find((q) => q.type === prev.dailyQuest.questType);
        if (quest) {
          const streakBonus = Math.floor(quest.rewardCoins * (prev.dailyQuest.streak * 0.1));
          next = {
            ...next,
            coins: smClampCoins(next.coins + quest.rewardCoins + streakBonus),
          };
          let lvl = next.level;
          let xp = next.xp + Math.floor(quest.rewardXp);
          while (lvl < SM_MAX_LEVEL && xp >= smXpRequired(lvl)) {
            xp -= smXpRequired(lvl);
            lvl += 1;
          }
          if (lvl >= SM_MAX_LEVEL) xp = 0;
          next = { ...next, level: smClampLevel(lvl), xp };
        }
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smGetQuestStreak = useCallback((): number => {
    return state.dailyQuest.streak;
  }, [state.dailyQuest]);

  const smGetQuestInfo = useCallback((): { type: SmDailyQuestType | null; name: string; description: string; target: number; progress: number; rewardCoins: number; rewardXp: number; emoji: string } | null => {
    const dq = state.dailyQuest;
    if (!dq.questType) return null;
    const questDef = SM_DAILY_QUEST_TYPES.find((q) => q.type === dq.questType);
    if (!questDef) return null;
    return {
      type: dq.questType,
      name: questDef.name,
      description: questDef.description,
      target: dq.questTarget,
      progress: dq.questProgress,
      rewardCoins: questDef.rewardCoins + Math.floor(questDef.rewardCoins * (dq.streak * 0.1)),
      rewardXp: questDef.rewardXp,
      emoji: questDef.emoji,
    };
  }, [state.dailyQuest]);

  // ---- Season Events ----

  const smGetAllSeasons = useCallback((): typeof SM_SEASON_EVENTS => {
    return [...SM_SEASON_EVENTS];
  }, []);

  const smGetActiveSeason = useCallback((): { event: typeof SM_SEASON_EVENTS[0] | null; progress: number; timeRemaining: number } => {
    if (!state.activeSeason.id) return { event: null, progress: 0, timeRemaining: 0 };
    const def = SM_SEASON_EVENTS.find((e) => e.id === state.activeSeason.id);
    if (!def) return { event: null, progress: 0, timeRemaining: 0 };
    const remaining = state.activeSeason.endTime ? Math.max(0, state.activeSeason.endTime - Date.now()) : 0;
    return { event: def, progress: state.activeSeason.progress, timeRemaining: remaining };
  }, [state.activeSeason]);

  const smStartSeason = useCallback((seasonId: string): { success: boolean; state: SteamMarshState } => {
    const def = SM_SEASON_EVENTS.find((e) => e.id === seasonId);
    if (!def) return { success: false, state };
    if (state.activeSeason.id) return { success: false, state };
    const now = Date.now();
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeSeason: {
          id: seasonId,
          progress: 0,
          startTime: now,
          endTime: now + def.duration * 1000,
          rewardClaimed: false,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const smEndSeason = useCallback((): { success: boolean; state: SteamMarshState } => {
    if (!state.activeSeason.id) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeSeason: { id: null, progress: 0, startTime: null, endTime: null, rewardClaimed: false },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const smGetAchievements = useCallback((): SmAchievementDef[] => {
    return [...SM_ACHIEVEMENTS];
  }, []);

  const smIsAchievementUnlocked = useCallback((id: string): boolean => {
    return state.achievements[id]?.unlocked ?? false;
  }, [state.achievements]);

  const smGetUnlockedAchievements = useCallback((): SmAchievementDef[] => {
    return SM_ACHIEVEMENTS.filter((a) => state.achievements[a.id]?.unlocked);
  }, [state.achievements]);

  const smGetLockedAchievements = useCallback((): SmAchievementDef[] => {
    return SM_ACHIEVEMENTS.filter((a) => !state.achievements[a.id]?.unlocked);
  }, [state.achievements]);

  const smCheckAchievements = useCallback((): { newlyUnlocked: SmAchievementDef[]; state: SteamMarshState } => {
    const newlyUnlocked: SmAchievementDef[] = [];
    let next = state;
    setState((prev) => {
      const checkValue = (key: string): number => {
        if (key === 'level') return prev.level;
        const totals = prev.totals as Record<string, number>;
        return totals[key] ?? 0;
      };
      const newAchievements = { ...prev.achievements };
      for (const ach of SM_ACHIEVEMENTS) {
        if (prev.achievements[ach.id]?.unlocked) continue;
        const current = checkValue(ach.conditionKey);
        if (current >= ach.targetValue) {
          newAchievements[ach.id] = { unlocked: true, unlockedAt: Date.now() };
          newlyUnlocked.push(ach);
        }
      }
      next = {
        ...prev,
        achievements: newAchievements,
        coins: smClampCoins(prev.coins + newlyUnlocked.reduce((s, a) => s + a.rewardCoins, 0)),
      };
      let lvl = next.level;
      let xp = next.xp + newlyUnlocked.reduce((s, a) => s + a.rewardXp, 0);
      while (lvl < SM_MAX_LEVEL && xp >= smXpRequired(lvl)) {
        xp -= smXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= SM_MAX_LEVEL) xp = 0;
      next = { ...next, level: smClampLevel(lvl), xp };
      return next;
    });
    return { newlyUnlocked, state: next };
  }, [state]);

  const smGetAchievementProgress = useCallback((id: string): { current: number; target: number; percentage: number } => {
    const def = SM_ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return { current: 0, target: 0, percentage: 0 };
    let current = 0;
    if (def.conditionKey === 'level') {
      current = state.level;
    } else {
      const totals = state.totals as Record<string, number>;
      current = totals[def.conditionKey] ?? 0;
    }
    return { current, target: def.targetValue, percentage: Math.min(100, Math.floor((current / def.targetValue) * 100)) };
  }, [state]);

  // ---- Stats ----

  const smGetTotalCreaturesFound = useCallback((): number => {
    return state.totals.totalCreaturesFound;
  }, [state.totals]);

  const smGetTotalResourcesGathered = useCallback((): number => {
    return state.totals.totalResourcesGathered;
  }, [state.totals]);

  const smGetTotalFogNavigated = useCallback((): number => {
    return state.totals.totalFogNavigated;
  }, [state.totals]);

  const smGetTotalEnginesBuilt = useCallback((): number => {
    return state.totals.totalEnginesBuilt;
  }, [state.totals]);

  const smGetTotalGeyserEruptions = useCallback((): number => {
    return state.totals.totalGeyserEruptions;
  }, [state.totals]);

  const smGetTotalAbilityCasts = useCallback((): number => {
    return state.totals.totalAbilityCasts;
  }, [state.totals]);

  // ---- Computed Values ----

  const currentTitle = useMemo((): SmTitleInfo => {
    let current = SM_TITLES[0];
    for (const t of SM_TITLES) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const xpProgress = useMemo((): number => {
    const needed = smXpRequired(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const overallProgress = useMemo((): number => {
    return state.level / SM_MAX_LEVEL;
  }, [state.level]);

  const ownedCreatureCount = useMemo((): number => {
    return SM_CREATURES.filter((c) => state.creatures[c.id]?.owned).length;
  }, [state.creatures]);

  const exploredZoneCount = useMemo((): number => {
    return SM_ZONES.filter((z) => state.zones[z.id]?.explored).length;
  }, [state.zones]);

  const totalResourceCount = useMemo((): number => {
    return Object.values(state.resources).reduce((sum, count) => sum + count, 0);
  }, [state.resources]);

  const befriendedWraithCount = useMemo((): number => {
    return SM_FOG_WRAITHS.filter((w) => state.fogWraiths[w.id]?.befriended).length;
  }, [state.fogWraiths]);

  const unlockedAchievementCount = useMemo((): number => {
    return SM_ACHIEVEMENTS.filter((a) => state.achievements[a.id]?.unlocked).length;
  }, [state.achievements]);

  const totalStructureLevel = useMemo((): number => {
    return Object.values(state.structures).reduce((sum, s) => sum + s.level, 0);
  }, [state.structures]);

  const tamedCreatureCount = useMemo((): number => {
    return SM_CREATURES.filter((c) => state.creatures[c.id]?.tamed).length;
  }, [state.creatures]);

  const learnedAbilityCount = useMemo((): number => {
    return SM_ABILITIES.filter((a) => state.abilities[a.id]?.learned).length;
  }, [state.abilities]);

  // ---- Auto Achievement Check ----

  useEffect(() => {
    const checkValue = (key: string): number => {
      if (key === 'level') return stateRef.current.level;
      const totals = stateRef.current.totals as Record<string, number>;
      return totals[key] ?? 0;
    };
    const newUnlocks: string[] = [];
    for (const ach of SM_ACHIEVEMENTS) {
      if (stateRef.current.achievements[ach.id]?.unlocked) continue;
      const current = checkValue(ach.conditionKey);
      if (current >= ach.targetValue) {
        newUnlocks.push(ach.id);
      }
    }
    if (newUnlocks.length === 0) return;
    setState((prev) => {
      const newAchievements = { ...prev.achievements };
      const xpGain = newUnlocks.reduce((sum, id) => {
        const ach = SM_ACHIEVEMENTS.find((a) => a.id === id);
        return sum + (ach?.rewardXp ?? 0);
      }, 0);
      const coinGain = newUnlocks.reduce((sum, id) => {
        const ach = SM_ACHIEVEMENTS.find((a) => a.id === id);
        return sum + (ach?.rewardCoins ?? 0);
      }, 0);
      for (const id of newUnlocks) {
        newAchievements[id] = { unlocked: true, unlockedAt: Date.now() };
      }
      let lvl = prev.level;
      let xp = prev.xp + xpGain;
      while (lvl < SM_MAX_LEVEL && xp >= smXpRequired(lvl)) {
        xp -= smXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= SM_MAX_LEVEL) xp = 0;
      return { ...prev, achievements: newAchievements, level: smClampLevel(lvl), xp, coins: smClampCoins(prev.coins + coinGain) };
    });
  }, [state.totals, state.level, state.achievements]);

  // ---- Color Theme ----

  const smGetColorTheme = useCallback((): SmColorTheme => {
    return SM_COLOR_THEME;
  }, []);

  // ---- Random Helpers ----

  const smRandomInt = useCallback((min: number, max: number): number => {
    return min + Math.floor(prngRef.current() * (max - min + 1));
  }, []);

  const smGetSeed = useCallback((): number => {
    return state.seed;
  }, [state.seed]);

  const smSetSeed = useCallback((newSeed: number): void => {
    prngRef.current = smMulberry32(newSeed);
  }, []);

  // ---- Persist Config ----

  const smPersistConfig = useMemo(() => ({
    name: 'steam-marsh-storage' as const,
    storage: typeof localStorage,
    partialize: (s: SteamMarshState) => ({
      level: s.level,
      xp: s.xp,
      coins: s.coins,
      title: s.title,
      creatures: s.creatures,
      zones: s.zones,
      resources: s.resources,
      abilities: s.abilities,
      structures: s.structures,
      fogWraiths: s.fogWraiths,
      achievements: s.achievements,
      dailyQuest: s.dailyQuest,
      activeSeason: s.activeSeason,
      totals: s.totals,
      seed: s.seed,
      fogDensity: s.fogDensity,
      steamPressure: s.steamPressure,
    }),
  }), []);

  // ---- Return API ----

  const smAPI = useMemo(() => ({
    // State
    getState: smGetState,
    resetState: smResetState,
    // Level & XP
    getLevel: smGetLevel,
    getXp: smGetXp,
    getXPTillNext: smGetXPTillNext,
    addXp: smAddXp,
    // Coins
    getCoins: smGetCoins,
    addCoins: smAddCoins,
    spendCoins: smSpendCoins,
    canAfford: smCanAfford,
    // Title
    getTitle: smGetTitle,
    getAllTitles: smGetAllTitles,
    getNextTitle: smGetNextTitle,
    // Progress
    getProgress: smGetProgress,
    getOverallProgress: smGetOverallProgress,
    // Creatures
    getCreatures: smGetCreatures,
    getCreatureById: smGetCreatureById,
    getOwnedCreatures: smGetOwnedCreatures,
    getCreatureByRarity: smGetCreatureByRarity,
    discoverCreature: smDiscoverCreature,
    tameCreature: smTameCreature,
    isCreatureTamed: smIsCreatureTamed,
    rideCreature: smRideCreature,
    getTamedCreatures: smGetTamedCreatures,
    getCreatureInfo: smGetCreatureInfo,
    // Zones
    getZones: smGetZones,
    getZoneById: smGetZoneById,
    exploreZone: smExploreZone,
    isZoneExplored: smIsZoneExplored,
    getExploredZones: smGetExploredZones,
    tapInZone: smTapInZone,
    getZoneInfo: smGetZoneInfo,
    upgradeZone: smUpgradeZone,
    // Resources
    getResources: smGetResources,
    getResourceById: smGetResourceById,
    getResourceCount: smGetResourceCount,
    getAllResourceCounts: smGetAllResourceCounts,
    // Abilities
    getAbilities: smGetAbilities,
    learnAbility: smLearnAbility,
    castAbility: smCastAbility,
    isAbilityLearned: smIsAbilityLearned,
    getLearnedAbilities: smGetLearnedAbilities,
    // Structures
    getStructures: smGetStructures,
    buildStructure: smBuildStructure,
    getStructureLevel: smGetStructureLevel,
    getStructureInfo: smGetStructureInfo,
    getStructureUpgradeCost: smGetStructureUpgradeCost,
    // Fog Wraiths
    getFogWraiths: smGetFogWraiths,
    befriendWraith: smBefriendWraith,
    giftWraith: smGiftWraith,
    isWraithBefriended: smIsWraithBefriended,
    getBefriendedWraiths: smGetBefriendedWraiths,
    // Geyser Tapping
    tapGeyser: smTapGeyser,
    // Fog Navigation
    navigateFog: smNavigateFog,
    getFogDensity: smGetFogDensity,
    // Steam Pressure
    increasePressure: smIncreasePressure,
    getSteamPressure: smGetSteamPressure,
    // Daily Quest
    getDailyQuest: smGetDailyQuest,
    startDailyQuest: smStartDailyQuest,
    updateQuestProgress: smUpdateQuestProgress,
    getQuestStreak: smGetQuestStreak,
    getQuestInfo: smGetQuestInfo,
    // Season Events
    getAllSeasons: smGetAllSeasons,
    getActiveSeason: smGetActiveSeason,
    startSeason: smStartSeason,
    endSeason: smEndSeason,
    // Achievements
    getAchievements: smGetAchievements,
    isAchievementUnlocked: smIsAchievementUnlocked,
    getUnlockedAchievements: smGetUnlockedAchievements,
    getLockedAchievements: smGetLockedAchievements,
    checkAchievements: smCheckAchievements,
    getAchievementProgress: smGetAchievementProgress,
    // Stats
    getTotalCreaturesFound: smGetTotalCreaturesFound,
    getTotalResourcesGathered: smGetTotalResourcesGathered,
    getTotalFogNavigated: smGetTotalFogNavigated,
    getTotalEnginesBuilt: smGetTotalEnginesBuilt,
    getTotalGeyserEruptions: smGetTotalGeyserEruptions,
    getTotalAbilityCasts: smGetTotalAbilityCasts,
    // Computed
    currentTitle,
    xpProgress,
    overallProgress,
    ownedCreatureCount,
    exploredZoneCount,
    totalResourceCount,
    befriendedWraithCount,
    unlockedAchievementCount,
    totalStructureLevel,
    tamedCreatureCount,
    learnedAbilityCount,
    // Theme
    getColorTheme: smGetColorTheme,
    // Random
    randomInt: smRandomInt,
    getSeed: smGetSeed,
    setSeed: smSetSeed,
    // Persist
    persistConfig: smPersistConfig,
    // Raw state for advanced usage
    _state: state,
  }), [state]);

  return smAPI;
}
