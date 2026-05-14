import { useState, useCallback, useRef } from 'react';

// ============================================================
// Bee Hive Colony — Beekeeping Management Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type BeeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type QuestType = 'harvest' | 'forage' | 'earn' | 'split' | 'upgrade';
export type DailyType = 'harvest' | 'forage' | 'earn' | 'inspect';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type HealthStatus = 'healthy' | 'varroa' | 'nosema' | 'cold_stress' | 'weakened';
export type UpgradeType = 'honey' | 'health' | 'forage' | 'defense';

export interface BeeSpeciesDef {
  id: string;
  name: string;
  rarity: BeeRarity;
  baseHoneyRate: number;
  basePollenRate: number;
  foragingRange: number;
  coldTolerance: number;
  diseaseResistance: number;
  description: string;
  emoji: string;
}

export interface HiveTypeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseCapacity: number;
  baseHoneyMultiplier: number;
  baseUpgradeCost: number;
}

export interface FlowerDef {
  id: string;
  name: string;
  nectarValue: number;
  pollenValue: number;
  season: Season;
  bloomMonths: number[];
  description: string;
  emoji: string;
}

export interface HoneyDef {
  id: string;
  name: string;
  basePrice: number;
  rarity: BeeRarity;
  primaryFlower: string;
  description: string;
  emoji: string;
  requiredLevel: number;
}

export interface HiveUpgradeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  upgradeType: UpgradeType;
  baseBonusValue: number;
  baseUpgradeCost: number;
}

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  requiredLevel: number;
  emoji: string;
}

export interface NPCDef {
  id: string;
  name: string;
  role: string;
  description: string;
  emoji: string;
  greeting: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface DailyTaskPoolDef {
  id: string;
  name: string;
  description: string;
  type: DailyType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface TitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface RarityInfo {
  key: BeeRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface ForageJob {
  id: string;
  flowerId: string;
  startedAt: number;
  endsAt: number;
  nectarYield: number;
  pollenYield: number;
}

export interface HiveState {
  id: string;
  level: number;
  capacity: number;
  beeCount: number;
  activeBees: string[];
  installedUpgrades: string[];
  health: HealthStatus;
  healthSeverity: number;
}

export interface UpgradeState {
  id: string;
  level: number;
  installedOn: string | null;
}

export interface QuestState {
  id: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
}

export interface AchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface DailyTaskState {
  poolId: string;
  progress: number;
  claimed: boolean;
  dayKey: string;
}

export interface PollinationContract {
  id: string;
  gardenName: string;
  rewardCoins: number;
  rewardXP: number;
  requiredForages: number;
  completedForages: number;
  expiresAt: number;
  active: boolean;
}

export interface SwarmingWarning {
  hiveId: string;
  severity: number;
  triggeredAt: number;
  prevented: boolean;
}

export interface BeeHiveState {
  level: number;
  xp: number;
  coins: number;
  hives: HiveState[];
  flowers: Record<string, number>;
  foragingQueue: ForageJob[];
  dailyStreak: number;
  lastDaily: string | null;
  activeQuests: QuestState[];
  completedQuests: string[];
  unlockedAchievements: AchievementState[];
  dailyTask: DailyTaskState | null;
  upgrades: UpgradeState[];
  seed: number;
  totalHoneyHarvested: number;
  totalPollenCollected: number;
  totalEarned: number;
  totalSpent: number;
  completedForages: number;
  completedHarvests: number;
  coloniesSplit: number;
  swarmsPrevented: number;
  contractsCompleted: number;
  activeContracts: PollinationContract[];
  swarmWarnings: SwarmingWarning[];
  season: Season;
  honeyInventory: Record<string, number>;
  beeCountByRarity: Record<BeeRarity, number>;
  unlockedSpecies: string[];
  activeHiveId: string;
  hiveUpgradeCount: number;
}

// ============================================================
// Seeded PRNG (mulberry32 — no Math.random)
// ============================================================

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bhHashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return hash;
}

// ============================================================
// XP Curve Helper
// ============================================================

function xpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= BH_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function clampLevel(lvl: number): number {
  return Math.max(1, Math.min(BH_MAX_LEVEL, lvl));
}

function clampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function generateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function rarityMultiplier(r: BeeRarity): number {
  const map: Record<BeeRarity, number> = {
    common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5,
  };
  return map[r] ?? 1;
}

function getSeasonForDate(now: number): Season {
  const d = new Date(now);
  const month = d.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function seasonMultiplier(season: Season): number {
  const map: Record<Season, number> = {
    spring: 1.2,
    summer: 1.5,
    autumn: 0.8,
    winter: 0.3,
  };
  return map[season];
}

// ============================================================
// Constants
// ============================================================

export const BH_MAX_LEVEL = 45;

export const BH_RARITIES: RarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
];

export const BH_TITLE_THRESHOLDS: TitleInfo[] = [
  { name: 'Novice Beekeeper', levelRequired: 1, description: 'Just starting your beekeeping journey' },
  { name: 'Apprentice Apiarist', levelRequired: 5, description: 'Learning the ancient art of beekeeping' },
  { name: 'Hive Tender', levelRequired: 10, description: 'Your colonies are thriving under your care' },
  { name: 'Seasoned Beekeeper', levelRequired: 18, description: 'Experienced in all four seasons of beekeeping' },
  { name: 'Master Apiarist', levelRequired: 25, description: 'Your honey is renowned across the valley' },
  { name: 'Queen Breeder', levelRequired: 32, description: 'Expert at raising queen bees and colony splits' },
  { name: 'Grand Apiarist', levelRequired: 38, description: 'A living legend in the beekeeping world' },
  { name: 'Master Apiarist', levelRequired: 45, description: 'The greatest beekeeper in all the land' },
];

export const BH_SPECIES: BeeSpeciesDef[] = [
  { id: 'western_honey', name: 'Western Honey Bee', rarity: 'common', baseHoneyRate: 10, basePollenRate: 8, foragingRange: 3, coldTolerance: 5, diseaseResistance: 5, description: 'The classic honey bee, reliable and productive', emoji: '🐝' },
  { id: 'bumblebee', name: 'Bumblebee', rarity: 'common', baseHoneyRate: 4, basePollenRate: 15, foragingRange: 2, coldTolerance: 8, diseaseResistance: 6, description: 'Large fuzzy bees, excellent pollinators in cool weather', emoji: '🪲' },
  { id: 'carpenter_bee', name: 'Carpenter Bee', rarity: 'common', baseHoneyRate: 2, basePollenRate: 12, foragingRange: 2, coldTolerance: 3, diseaseResistance: 7, description: 'Solitary wood-boring bees, efficient pollinators', emoji: '🪵' },
  { id: 'leafcutter', name: 'Leafcutter Bee', rarity: 'uncommon', baseHoneyRate: 3, basePollenRate: 14, foragingRange: 2, coldTolerance: 4, diseaseResistance: 8, description: 'Meticulous bees that cut perfect leaf circles for nests', emoji: '🍃' },
  { id: 'sweat_bee', name: 'Sweat Bee', rarity: 'common', baseHoneyRate: 1, basePollenRate: 6, foragingRange: 1, coldTolerance: 2, diseaseResistance: 4, description: 'Tiny metallic-green bees attracted to perspiration', emoji: '💧' },
  { id: 'mason_bee', name: 'Mason Bee', rarity: 'uncommon', baseHoneyRate: 2, basePollenRate: 18, foragingRange: 2, coldTolerance: 7, diseaseResistance: 6, description: 'Incredible early-spring pollinators, active in cool temps', emoji: '🧱' },
  { id: 'alfalfa_leafcutter', name: 'Alfalfa Leafcutter', rarity: 'uncommon', baseHoneyRate: 3, basePollenRate: 16, foragingRange: 3, coldTolerance: 5, diseaseResistance: 7, description: 'Essential pollinators for alfalfa seed production', emoji: '🌱' },
  { id: 'blue_banded', name: 'Blue-Banded Bee', rarity: 'rare', baseHoneyRate: 5, basePollenRate: 20, foragingRange: 3, coldTolerance: 3, diseaseResistance: 5, description: 'Stunning blue-striped bees with a unique buzz pollination technique', emoji: '💙' },
  { id: 'rufous_leafcutter', name: 'Rufous Leafcutter', rarity: 'rare', baseHoneyRate: 3, basePollenRate: 17, foragingRange: 3, coldTolerance: 4, diseaseResistance: 7, description: 'Reddish-brown bees with exceptional leaf-cutting precision', emoji: '🟤' },
  { id: 'squash_bee', name: 'Squash Bee', rarity: 'uncommon', baseHoneyRate: 4, basePollenRate: 19, foragingRange: 2, coldTolerance: 4, diseaseResistance: 5, description: 'Specialist pollinators of squash and gourd flowers', emoji: '🎃' },
  { id: 'digger_bee', name: 'Digger Bee', rarity: 'uncommon', baseHoneyRate: 3, basePollenRate: 10, foragingRange: 2, coldTolerance: 5, diseaseResistance: 6, description: 'Ground-nesting bees that emerge early in spring', emoji: '⛏️' },
  { id: 'cuckoo_bee', name: 'Cuckoo Bee', rarity: 'rare', baseHoneyRate: 0, basePollenRate: 12, foragingRange: 4, coldTolerance: 3, diseaseResistance: 8, description: 'Clever brood parasites — boost colony disease resistance', emoji: '🐦' },
  { id: 'stingless_bee', name: 'Stingless Bee', rarity: 'rare', baseHoneyRate: 6, basePollenRate: 11, foragingRange: 2, coldTolerance: 2, diseaseResistance: 6, description: 'Tropical bees that produce prized medicinal honey', emoji: '🍯' },
  { id: 'rock_bee', name: 'Rock Bee', rarity: 'rare', baseHoneyRate: 14, basePollenRate: 8, foragingRange: 5, coldTolerance: 6, diseaseResistance: 4, description: 'Large wild honey bees that build massive exposed combs', emoji: '🪨' },
  { id: 'italian_honey', name: 'Italian Honey Bee', rarity: 'uncommon', baseHoneyRate: 12, basePollenRate: 9, foragingRange: 3, coldTolerance: 4, diseaseResistance: 5, description: 'Gentle and prolific, the most popular commercial bee', emoji: '🇮🇹' },
  { id: 'carniolan_honey', name: 'Carniolan Honey Bee', rarity: 'uncommon', baseHoneyRate: 11, basePollenRate: 10, foragingRange: 3, coldTolerance: 8, diseaseResistance: 7, description: 'Dark gentle giants of the bee world, very cold-hardy', emoji: '🏔️' },
  { id: 'russian_honey', name: 'Russian Honey Bee', rarity: 'rare', baseHoneyRate: 9, basePollenRate: 11, foragingRange: 4, coldTolerance: 9, diseaseResistance: 9, description: 'Incredibly resilient, bred for varroa mite resistance', emoji: '🇷🇺' },
  { id: 'caucasian_honey', name: 'Caucasian Honey Bee', rarity: 'rare', baseHoneyRate: 10, basePollenRate: 13, foragingRange: 4, coldTolerance: 8, diseaseResistance: 7, description: 'Long-tongued bees that can access deep nectar flowers', emoji: '🌺' },
  { id: 'killer_bee', name: 'Africanized Bee', rarity: 'epic', baseHoneyRate: 16, basePollenRate: 12, foragingRange: 5, coldTolerance: 2, diseaseResistance: 9, description: 'Extremely productive but very aggressive — handle with care', emoji: '⚡' },
  { id: 'giant_honey', name: 'Giant Honey Bee', rarity: 'epic', baseHoneyRate: 18, basePollenRate: 7, foragingRange: 6, coldTolerance: 1, diseaseResistance: 5, description: 'The largest honey bee, builds spectacular cliff-side combs', emoji: '🗻' },
  { id: 'dwarf_honey', name: 'Dwarf Honey Bee', rarity: 'epic', baseHoneyRate: 7, basePollenRate: 14, foragingRange: 2, coldTolerance: 2, diseaseResistance: 6, description: 'Tiny forest bees with unique open-nesting behavior', emoji: '🌳' },
  { id: 'red_tailed_bumblebee', name: 'Red-Tailed Bumblebee', rarity: 'rare', baseHoneyRate: 5, basePollenRate: 16, foragingRange: 3, coldTolerance: 7, diseaseResistance: 6, description: 'Striking black bees with bright red tails', emoji: '🔴' },
  { id: 'carder_bee', name: 'Carder Bee', rarity: 'rare', baseHoneyRate: 3, basePollenRate: 15, foragingRange: 2, coldTolerance: 5, diseaseResistance: 7, description: 'Moss and fiber gatherers that card their nesting material', emoji: '🧶' },
  { id: 'hairy_footed_flower', name: 'Hairy-Footed Flower Bee', rarity: 'epic', baseHoneyRate: 4, basePollenRate: 22, foragingRange: 2, coldTolerance: 4, diseaseResistance: 5, description: 'Extraordinary pollinators with specialized pollen baskets on their feet', emoji: '🌸' },
  { id: 'mining_bee', name: 'Mining Bee', rarity: 'rare', baseHoneyRate: 2, basePollenRate: 13, foragingRange: 2, coldTolerance: 6, diseaseResistance: 7, description: 'Diligent ground-nesters that aerate your garden soil', emoji: '🕳️' },
  { id: 'resin_bee', name: 'Resin Bee', rarity: 'epic', baseHoneyRate: 5, basePollenRate: 11, foragingRange: 3, coldTolerance: 3, diseaseResistance: 10, description: 'Propolis specialists — their resin makes colonies nearly disease-proof', emoji: '🪵' },
  { id: 'teddy_bear_bee', name: 'Teddy Bear Bee', rarity: 'epic', baseHoneyRate: 8, basePollenRate: 18, foragingRange: 3, coldTolerance: 5, diseaseResistance: 7, description: 'Round fluffy golden bees, impossibly adorable and productive', emoji: '🧸' },
  { id: 'glowing_green_carpenter', name: 'Glowing Green Carpenter', rarity: 'legendary', baseHoneyRate: 12, basePollenRate: 25, foragingRange: 4, coldTolerance: 4, diseaseResistance: 8, description: 'Bioluminescent bees that forage at dusk, producing iridescent honey', emoji: '✨' },
  { id: 'golden_royal', name: 'Golden Royal Bee', rarity: 'legendary', baseHoneyRate: 25, basePollenRate: 20, foragingRange: 6, coldTolerance: 7, diseaseResistance: 9, description: 'The mythical king of all bees — produces legendary honey worth a fortune', emoji: '👑' },
  { id: 'frost_willow', name: 'Frost Willow Bee', rarity: 'legendary', baseHoneyRate: 15, basePollenRate: 22, foragingRange: 5, coldTolerance: 10, diseaseResistance: 8, description: 'Winter-hardy wonder bees that forage even when snow is on the ground', emoji: '❄️' },
];

export const BH_HIVES: HiveTypeDef[] = [
  { id: 'langstroth', name: 'Langstroth Hive', description: 'The standard modular beehive used worldwide', emoji: '🏠', maxLevel: 10, baseCapacity: 50, baseHoneyMultiplier: 1.0, baseUpgradeCost: 100 },
  { id: 'top_bar', name: 'Top-Bar Hive', description: 'Horizontal hive design, easier to inspect', emoji: '🪵', maxLevel: 10, baseCapacity: 40, baseHoneyMultiplier: 0.9, baseUpgradeCost: 80 },
  { id: 'warre', name: 'Warre Hive', description: 'Vertical top-bar hive mimicking natural tree cavities', emoji: '🌲', maxLevel: 10, baseCapacity: 35, baseHoneyMultiplier: 0.85, baseUpgradeCost: 90 },
  { id: 'observation', name: 'Observation Hive', description: 'Glass-walled hive for education and monitoring', emoji: '🔍', maxLevel: 10, baseCapacity: 20, baseHoneyMultiplier: 0.7, baseUpgradeCost: 120 },
  { id: 'flow_hive', name: 'Flow Hive', description: 'Revolutionary tap-to-harvest design from Australia', emoji: '🚿', maxLevel: 10, baseCapacity: 60, baseHoneyMultiplier: 1.3, baseUpgradeCost: 200 },
  { id: 'skep', name: 'Skep', description: 'Traditional dome-shaped woven straw hive', emoji: '🧺', maxLevel: 10, baseCapacity: 25, baseHoneyMultiplier: 0.75, baseUpgradeCost: 60 },
  { id: 'log_hive', name: 'Log Hive', description: 'Hollowed log hive for natural beekeeping', emoji: '🪵', maxLevel: 10, baseCapacity: 45, baseHoneyMultiplier: 1.1, baseUpgradeCost: 110 },
  { id: 'tree_hive', name: 'Tree Hive', description: 'Suspended hive placed high in a living tree', emoji: '🌳', maxLevel: 10, baseCapacity: 55, baseHoneyMultiplier: 1.2, baseUpgradeCost: 150 },
];

export const BH_FLOWERS: FlowerDef[] = [
  { id: 'lavender', name: 'Lavender', nectarValue: 12, pollenValue: 8, season: 'summer', bloomMonths: [6, 7, 8], description: 'Fragrant purple flowers, a bee favorite', emoji: '💜' },
  { id: 'sunflower', name: 'Sunflower', nectarValue: 10, pollenValue: 18, season: 'summer', bloomMonths: [7, 8, 9], description: 'Massive pollen producers that feed thousands', emoji: '🌻' },
  { id: 'clover', name: 'White Clover', nectarValue: 8, pollenValue: 6, season: 'spring', bloomMonths: [5, 6, 7, 8, 9], description: 'The backbone of honey production worldwide', emoji: '🍀' },
  { id: 'rose', name: 'Wild Rose', nectarValue: 6, pollenValue: 4, season: 'spring', bloomMonths: [5, 6], description: 'Beautiful but modest nectar yield', emoji: '🌹' },
  { id: 'apple_blossom', name: 'Apple Blossom', nectarValue: 9, pollenValue: 14, season: 'spring', bloomMonths: [4, 5], description: 'Essential for apple orchard pollination', emoji: '🍎' },
  { id: 'dandelion', name: 'Dandelion', nectarValue: 5, pollenValue: 7, season: 'spring', bloomMonths: [3, 4, 5, 6], description: 'Early spring lifesaver for emerging colonies', emoji: '🌼' },
  { id: 'buckwheat', name: 'Buckwheat', nectarValue: 14, pollenValue: 10, season: 'summer', bloomMonths: [7, 8, 9], description: 'Produces dark, robust buckwheat honey', emoji: '🌾' },
  { id: 'orange_blossom', name: 'Orange Blossom', nectarValue: 15, pollenValue: 8, season: 'spring', bloomMonths: [3, 4, 5], description: 'Sweet citrus nectar for premium honey', emoji: '🍊' },
  { id: 'manuka', name: 'Manuka', nectarValue: 20, pollenValue: 5, season: 'summer', bloomMonths: [6, 7], description: 'New Zealand wonder plant with medicinal honey', emoji: '🇳🇿' },
  { id: 'acacia', name: 'Black Locust', nectarValue: 18, pollenValue: 6, season: 'spring', bloomMonths: [5, 6], description: 'Produces light, sweet acacia honey', emoji: '🤍' },
  { id: 'wildflower', name: 'Wildflower Mix', nectarValue: 10, pollenValue: 12, season: 'summer', bloomMonths: [5, 6, 7, 8], description: 'Diverse meadow blend for complex honey flavors', emoji: '🌸' },
  { id: 'eucalyptus', name: 'Eucalyptus', nectarValue: 11, pollenValue: 7, season: 'winter', bloomMonths: [1, 2, 12], description: 'Winter-blooming tree, vital off-season forage', emoji: '🫧' },
  { id: 'goldenrod', name: 'Goldenrod', nectarValue: 9, pollenValue: 16, season: 'autumn', bloomMonths: [8, 9, 10], description: 'Late-season essential for building winter stores', emoji: '🟡' },
  { id: 'cherry_blossom', name: 'Cherry Blossom', nectarValue: 11, pollenValue: 10, season: 'spring', bloomMonths: [3, 4], description: 'Delicate spring blossoms with sweet nectar', emoji: '🌸' },
  { id: 'borage', name: 'Borage', nectarValue: 13, pollenValue: 9, season: 'summer', bloomMonths: [6, 7, 8], description: 'The "bee magnet" — refills nectar every 2 minutes', emoji: '🔷' },
];

export const BH_HONEYS: HoneyDef[] = [
  { id: 'wildflower', name: 'Wildflower Honey', basePrice: 15, rarity: 'common', primaryFlower: 'wildflower', description: 'Rich, complex flavor from diverse meadow flowers', emoji: '🍯', requiredLevel: 1 },
  { id: 'clover', name: 'Clover Honey', basePrice: 12, rarity: 'common', primaryFlower: 'clover', description: 'Mild, sweet honey — the everyday classic', emoji: '🤍', requiredLevel: 1 },
  { id: 'orange_blossom', name: 'Orange Blossom Honey', basePrice: 25, rarity: 'uncommon', primaryFlower: 'orange_blossom', description: 'Light citrus aroma with a floral finish', emoji: '🍊', requiredLevel: 5 },
  { id: 'manuka', name: 'Manuka Honey', basePrice: 80, rarity: 'epic', primaryFlower: 'manuka', description: 'Prized medicinal honey from New Zealand', emoji: '💊', requiredLevel: 15 },
  { id: 'buckwheat', name: 'Buckwheat Honey', basePrice: 20, rarity: 'uncommon', primaryFlower: 'buckwheat', description: 'Dark, robust, malty — full of antioxidants', emoji: '🟤', requiredLevel: 8 },
  { id: 'acacia', name: 'Acacia Honey', basePrice: 35, rarity: 'rare', primaryFlower: 'acacia', description: 'Extremely clear, slow-crystallizing premium honey', emoji: '💎', requiredLevel: 12 },
];

export const BH_UPGRADES: HiveUpgradeDef[] = [
  { id: 'ventilation', name: 'Ventilation Fan', description: 'Improves airflow, reduces humidity and disease risk', emoji: '🌬️', maxLevel: 10, upgradeType: 'health', baseBonusValue: 5, baseUpgradeCost: 50 },
  { id: 'insulation', name: 'Winter Insulation', description: 'Protects colony from cold stress in winter months', emoji: '🧣', maxLevel: 10, upgradeType: 'health', baseBonusValue: 6, baseUpgradeCost: 60 },
  { id: 'pest_guard', name: 'Pest Guard Screen', description: 'Barrier against varroa mites and wax moths', emoji: '🛡️', maxLevel: 10, upgradeType: 'health', baseBonusValue: 8, baseUpgradeCost: 80 },
  { id: 'queen_excluder', name: 'Queen Excluder', description: 'Keeps the queen in the brood box, separates honey supers', emoji: '👑', maxLevel: 10, upgradeType: 'honey', baseBonusValue: 5, baseUpgradeCost: 45 },
  { id: 'foundation_frames', name: 'Foundation Frames', description: 'Pre-formed wax foundation for faster comb building', emoji: '🖼️', maxLevel: 10, upgradeType: 'honey', baseBonusValue: 4, baseUpgradeCost: 40 },
  { id: 'nectar_booster', name: 'Nectar Booster Feeder', description: 'Supplemental feeding to boost honey production', emoji: '🍯', maxLevel: 10, upgradeType: 'honey', baseBonusValue: 6, baseUpgradeCost: 70 },
  { id: 'scent_attractor', name: 'Scent Attractor', description: 'Lures more foraging bees to productive flowers', emoji: '🌸', maxLevel: 10, upgradeType: 'forage', baseBonusValue: 7, baseUpgradeCost: 55 },
  { id: 'entrance_reducer', name: 'Entrance Reducer', description: 'Controls hive entrance to defend against robbers', emoji: '🚪', maxLevel: 10, upgradeType: 'defense', baseBonusValue: 5, baseUpgradeCost: 35 },
];

export const BH_QUESTS: QuestDef[] = [
  { id: 'quest_first_harvest', name: 'First Harvest', description: 'Harvest honey from your first hive', type: 'harvest', target: 1, rewardCoins: 50, rewardXP: 25, requiredLevel: 1, emoji: '🍯' },
  { id: 'quest_forage_10', name: 'Busy Bees', description: 'Complete 10 foraging trips', type: 'forage', target: 10, rewardCoins: 100, rewardXP: 50, requiredLevel: 1, emoji: '🌸' },
  { id: 'quest_earn_200', name: 'Honey Money', description: 'Earn a total of 200 coins', type: 'earn', target: 200, rewardCoins: 80, rewardXP: 40, requiredLevel: 2, emoji: '💰' },
  { id: 'quest_split_colony', name: 'Population Growth', description: 'Split your first colony', type: 'split', target: 1, rewardCoins: 150, rewardXP: 75, requiredLevel: 5, emoji: '🐝' },
  { id: 'quest_upgrade_hive', name: 'Better Digs', description: 'Upgrade any hive to level 5', type: 'upgrade', target: 5, rewardCoins: 200, rewardXP: 100, requiredLevel: 6, emoji: '🔧' },
  { id: 'quest_harvest_25', name: 'Honey Factory', description: 'Harvest honey 25 times', type: 'harvest', target: 25, rewardCoins: 300, rewardXP: 150, requiredLevel: 10, emoji: '🏭' },
  { id: 'quest_earn_1000', name: 'Honey Tycoon', description: 'Earn a total of 1000 coins', type: 'earn', target: 1000, rewardCoins: 400, rewardXP: 200, requiredLevel: 12, emoji: '🤑' },
  { id: 'quest_rare_species', name: 'Rare Find', description: 'Acquire a rare bee species', type: 'forage', target: 1, rewardCoins: 350, rewardXP: 175, requiredLevel: 8, emoji: '💎' },
  { id: 'quest_prevent_swarms', name: 'Swarm Stopper', description: 'Prevent 5 colony swarms', type: 'split', target: 5, rewardCoins: 500, rewardXP: 250, requiredLevel: 18, emoji: '🛑' },
  { id: 'quest_master_harvest', name: 'Apiary Empire', description: 'Complete 100 total harvests', type: 'harvest', target: 100, rewardCoins: 1000, rewardXP: 500, requiredLevel: 30, emoji: '👑' },
];

export const BH_NPCS: NPCDef[] = [
  { id: 'npc_old_beekeeper', name: 'Old Barnes', role: 'Retired Beekeeper', description: 'A wise elder who has kept bees for 50 years', emoji: '👴', greeting: 'Back in my day, we didn\'t have fancy Flow Hives. Just bees and hope.' },
  { id: 'npc_honey_merchant', name: 'Mellifera Gold', role: 'Honey Merchant', description: 'Travels far and wide trading rare honey varieties', emoji: '🧳', greeting: 'Ah, another beekeeper! Show me your finest honey and I\'ll make it worth your while.' },
  { id: 'npc_florist', name: 'Rose Thornfield', role: 'Master Florist', description: 'Grows the best flowers for bee foraging', emoji: '👩‍🌾', greeting: 'My fields are blooming! Your bees would love what I\'ve planted this season.' },
  { id: 'npc_vet', name: 'Dr. Apis', role: 'Bee Veterinarian', description: 'Specializes in bee health diagnosis and treatment', emoji: '👨‍⚕️', greeting: 'How are your colonies doing? Any signs of varroa or nosema lately?' },
  { id: 'npc_queen_breeder', name: 'Queen Beatrice', role: 'Queen Bee Breeder', description: 'Breeds the finest queen bees in the region', emoji: '👸', greeting: 'Looking for a new queen? I have some exceptional genetics available.' },
  { id: 'npc_rival', name: 'Stinger Steve', role: 'Rival Beekeeper', description: 'Your competitor at the annual honey competition', emoji: '😤', greeting: 'My honey won last year and it\'ll win again! You don\'t stand a chance.' },
];

export const BH_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach_first_harvest', name: 'First Drops', description: 'Harvest honey for the first time', conditionKey: 'completedHarvests', targetValue: 1, rewardCoins: 10, rewardXP: 5, emoji: '🍯' },
  { id: 'ach_harvest_10', name: 'Getting Sticky', description: 'Complete 10 honey harvests', conditionKey: 'completedHarvests', targetValue: 10, rewardCoins: 50, rewardXP: 25, emoji: '✋' },
  { id: 'ach_harvest_50', name: 'Honey Stream', description: 'Complete 50 honey harvests', conditionKey: 'completedHarvests', targetValue: 50, rewardCoins: 200, rewardXP: 100, emoji: '🌊' },
  { id: 'ach_harvest_100', name: 'Liquid Gold Factory', description: 'Complete 100 honey harvests', conditionKey: 'completedHarvests', targetValue: 100, rewardCoins: 500, rewardXP: 250, emoji: '🏆' },
  { id: 'ach_forage_50', name: 'Busy as a Bee', description: 'Complete 50 foraging trips', conditionKey: 'completedForages', targetValue: 50, rewardCoins: 150, rewardXP: 75, emoji: '🌸' },
  { id: 'ach_forage_200', name: 'Pollination Machine', description: 'Complete 200 foraging trips', conditionKey: 'completedForages', targetValue: 200, rewardCoins: 400, rewardXP: 200, emoji: '🌺' },
  { id: 'ach_earn_500', name: 'Pocket Change', description: 'Earn 500 coins total', conditionKey: 'totalEarned', targetValue: 500, rewardCoins: 50, rewardXP: 25, emoji: '💰' },
  { id: 'ach_earn_5000', name: 'Honey Baron', description: 'Earn 5000 coins total', conditionKey: 'totalEarned', targetValue: 5000, rewardCoins: 500, rewardXP: 250, emoji: '🤑' },
  { id: 'ach_level_10', name: 'Double Digits', description: 'Reach level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 100, rewardXP: 50, emoji: '🔟' },
  { id: 'ach_level_25', name: 'Apiary Master', description: 'Reach level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 300, rewardXP: 150, emoji: '🌟' },
  { id: 'ach_level_45', name: 'Peak Apiarist', description: 'Reach the maximum level', conditionKey: 'level', targetValue: 45, rewardCoins: 2000, rewardXP: 1000, emoji: '👑' },
  { id: 'ach_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day daily streak', conditionKey: 'dailyStreak', targetValue: 7, rewardCoins: 150, rewardXP: 75, emoji: '📅' },
  { id: 'ach_streak_30', name: 'Monthly Devotee', description: 'Maintain a 30-day daily streak', conditionKey: 'dailyStreak', targetValue: 30, rewardCoins: 800, rewardXP: 400, emoji: '🗓️' },
  { id: 'ach_split_5', name: 'Colony Builder', description: 'Split colonies 5 times', conditionKey: 'coloniesSplit', targetValue: 5, rewardCoins: 200, rewardXP: 100, emoji: '🐝' },
  { id: 'ach_all_honey', name: 'Honey Connoisseur', description: 'Produce every type of honey', conditionKey: 'allHoneyTypes', targetValue: 6, rewardCoins: 500, rewardXP: 250, emoji: '🍯' },
];

export const BH_DAILY_TASK_POOL: DailyTaskPoolDef[] = [
  { id: 'daily_harvest_2', name: 'Morning Harvest', description: 'Harvest honey 2 times today', type: 'harvest', target: 2, rewardCoins: 25, rewardXP: 12, emoji: '🍯' },
  { id: 'daily_harvest_5', name: 'Harvest Frenzy', description: 'Harvest honey 5 times today', type: 'harvest', target: 5, rewardCoins: 50, rewardXP: 25, emoji: '🔥' },
  { id: 'daily_forage_3', name: 'Daily Forage', description: 'Send bees foraging 3 times', type: 'forage', target: 3, rewardCoins: 20, rewardXP: 10, emoji: '🌸' },
  { id: 'daily_forage_8', name: 'Forage Marathon', description: 'Send bees foraging 8 times', type: 'forage', target: 8, rewardCoins: 45, rewardXP: 22, emoji: '🌺' },
  { id: 'daily_earn_100', name: 'Daily Income', description: 'Earn 100 coins today', type: 'earn', target: 100, rewardCoins: 30, rewardXP: 15, emoji: '💰' },
  { id: 'daily_earn_300', name: 'Big Earner', description: 'Earn 300 coins today', type: 'earn', target: 300, rewardCoins: 60, rewardXP: 30, emoji: '💎' },
  { id: 'daily_inspect_1', name: 'Hive Inspection', description: 'Inspect one hive for health', type: 'inspect', target: 1, rewardCoins: 15, rewardXP: 8, emoji: '🔍' },
  { id: 'daily_inspect_3', name: 'Full Inspection', description: 'Inspect all your hives today', type: 'inspect', target: 3, rewardCoins: 35, rewardXP: 18, emoji: '📋' },
];

// ============================================================
// Initial State Factory
// ============================================================

function createInitialState(seed?: number): BeeHiveState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const now = Date.now();
  return {
    level: 1,
    xp: 0,
    coins: 100,
    hives: [
      { id: 'langstroth', level: 1, capacity: 50, beeCount: 5, activeBees: ['western_honey', 'western_honey', 'western_honey', 'bumblebee', 'bumblebee'], installedUpgrades: [], health: 'healthy', healthSeverity: 0 },
    ],
    flowers: { lavender: 3, clover: 5, dandelion: 4, wildflower: 2, sunflower: 1 },
    foragingQueue: [],
    dailyStreak: 0,
    lastDaily: null,
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: BH_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    dailyTask: null,
    upgrades: BH_UPGRADES.map((u) => ({ id: u.id, level: 0, installedOn: null })),
    seed: effectiveSeed,
    totalHoneyHarvested: 0,
    totalPollenCollected: 0,
    totalEarned: 0,
    totalSpent: 0,
    completedForages: 0,
    completedHarvests: 0,
    coloniesSplit: 0,
    swarmsPrevented: 0,
    contractsCompleted: 0,
    activeContracts: [],
    swarmWarnings: [],
    season: getSeasonForDate(now),
    honeyInventory: { wildflower: 0, clover: 0, orange_blossom: 0, manuka: 0, buckwheat: 0, acacia: 0 },
    beeCountByRarity: { common: 5, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    unlockedSpecies: ['western_honey', 'bumblebee', 'carpenter_bee', 'sweat_bee'],
    activeHiveId: 'langstroth',
    hiveUpgradeCount: 0,
  };
}

// ============================================================
// Quest Progress Helper (defined before the hook so it can be used inside)
// ============================================================

function bhProcessQuestProgress(state: BeeHiveState, type: QuestType, amount: number): BeeHiveState {
  let updated = state;
  for (const aq of updated.activeQuests) {
    if (aq.completed) continue;
    const def = BH_QUESTS.find((q) => q.id === aq.id);
    if (!def || def.type !== type) continue;
    const newProgress = aq.progress + amount;
    if (newProgress >= def.target) {
      updated = {
        ...updated,
        activeQuests: updated.activeQuests.map((q) =>
          q.id === aq.id ? { ...q, progress: Math.min(newProgress, def.target), completed: true } : q
        ),
      };
    } else {
      updated = {
        ...updated,
        activeQuests: updated.activeQuests.map((q) =>
          q.id === aq.id ? { ...q, progress: newProgress } : q
        ),
      };
    }
  }
  return updated;
}

// ============================================================
// Hook: useBeeHive
// ============================================================

export default function useBeeHive(initialSeed?: number) {
  const [state, setState] = useState<BeeHiveState>(() => createInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // ---- Core State ----

  const bhGetState = useCallback((): Readonly<BeeHiveState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const bhResetState = useCallback((newSeed?: number) => {
    const s = createInitialState(newSeed);
    prngRef.current = mulberry32(s.seed);
    setState(s);
  }, []);

  const bhSeed = useCallback((seed: number) => {
    prngRef.current = mulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const bhRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const bhRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const bhRandomChoice = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const bhGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const bhGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const bhGetXPTillNext = useCallback((): number => {
    return xpRequiredForLevel(state.level);
  }, [state.level]);

  const bhGetXPTotal = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const bhAddXP = useCallback((amount: number): BeeHiveState => {
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < BH_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= BH_MAX_LEVEL) xp = 0;
      next = { ...prev, level: clampLevel(level), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Title ----

  const bhGetTitle = useCallback((): TitleInfo => {
    let current = BH_TITLE_THRESHOLDS[0];
    for (const t of BH_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const bhGetAllTitles = useCallback((): TitleInfo[] => {
    return [...BH_TITLE_THRESHOLDS];
  }, []);

  const bhGetNextTitle = useCallback((): TitleInfo | null => {
    for (const t of BH_TITLE_THRESHOLDS) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const bhGetProgress = useCallback((): number => {
    const needed = xpRequiredForLevel(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const bhGetOverallProgress = useCallback((): number => {
    return state.level / BH_MAX_LEVEL;
  }, [state.level]);

  // ---- Coins ----

  const bhGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const bhAddCoins = useCallback((amount: number): BeeHiveState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins + amount), totalEarned: prev.totalEarned + Math.max(0, amount) };
      return next;
    });
    return next;
  }, [state]);

  const bhSpendCoins = useCallback((amount: number): { success: boolean; state: BeeHiveState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins - amount), totalSpent: prev.totalSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const bhCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Season ----

  const bhGetSeason = useCallback((): Season => {
    return state.season;
  }, [state]);

  const bhGetSeasonMultiplier = useCallback((): number => {
    return seasonMultiplier(state.season);
  }, [state.season]);

  const bhUpdateSeason = useCallback((now: number = Date.now()): BeeHiveState => {
    const newSeason = getSeasonForDate(now);
    if (newSeason === state.season) return state;
    let next = state;
    setState((prev) => {
      next = { ...prev, season: newSeason };
      return next;
    });
    return next;
  }, [state]);

  // ---- Bee Species ----

  const bhGetSpecies = useCallback((): BeeSpeciesDef[] => {
    return [...BH_SPECIES];
  }, []);

  const bhGetSpeciesById = useCallback((id: string): BeeSpeciesDef | null => {
    return BH_SPECIES.find((s) => s.id === id) ?? null;
  }, []);

  const bhGetUnlockedSpecies = useCallback((): BeeSpeciesDef[] => {
    return BH_SPECIES.filter((s) => state.unlockedSpecies.includes(s.id));
  }, [state.unlockedSpecies]);

  const bhGetLockedSpecies = useCallback((): BeeSpeciesDef[] => {
    return BH_SPECIES.filter((s) => !state.unlockedSpecies.includes(s.id));
  }, [state.unlockedSpecies]);

  const bhUnlockSpecies = useCallback((speciesId: string, cost: number): { success: boolean; state: BeeHiveState } => {
    const def = BH_SPECIES.find((s) => s.id === speciesId);
    if (!def) return { success: false, state };
    if (state.unlockedSpecies.includes(speciesId)) return { success: false, state };
    if (state.coins < cost) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        unlockedSpecies: [...prev.unlockedSpecies, speciesId],
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const bhGetBees = useCallback((): BeeSpeciesDef[] => {
    const bees: BeeSpeciesDef[] = [];
    for (const hive of state.hives) {
      for (const beeId of hive.activeBees) {
        const def = BH_SPECIES.find((s) => s.id === beeId);
        if (def && !bees.find((b) => b.id === beeId)) bees.push(def);
      }
    }
    return bees;
  }, [state.hives]);

  const bhGetBeeCount = useCallback((): number => {
    return state.hives.reduce((sum, h) => sum + h.beeCount, 0);
  }, [state.hives]);

  // ---- Hives ----

  const bhGetHives = useCallback((): HiveTypeDef[] => {
    return [...BH_HIVES];
  }, []);

  const bhGetHiveStates = useCallback((): HiveState[] => {
    return [...state.hives];
  }, [state.hives]);

  const bhGetActiveHive = useCallback((): HiveState | null => {
    return state.hives.find((h) => h.id === state.activeHiveId) ?? null;
  }, [state.hives, state.activeHiveId]);

  const bhSetActiveHive = useCallback((hiveId: string): { success: boolean; state: BeeHiveState } => {
    if (!state.hives.find((h) => h.id === hiveId)) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, activeHiveId: hiveId };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const bhGetHiveLevel = useCallback((hiveId: string): number => {
    const h = state.hives.find((s) => s.id === hiveId);
    return h?.level ?? 1;
  }, [state.hives]);

  const bhGetHiveCapacity = useCallback((hiveId: string): number => {
    const hiveDef = BH_HIVES.find((h) => h.id === hiveId);
    const hiveState = state.hives.find((h) => h.id === hiveId);
    if (!hiveDef || !hiveState) return 0;
    return hiveDef.baseCapacity + (hiveState.level - 1) * 10;
  }, [state.hives]);

  const bhGetHiveHoneyMultiplier = useCallback((hiveId: string): number => {
    const def = BH_HIVES.find((h) => h.id === hiveId);
    const st = state.hives.find((h) => h.id === hiveId);
    if (!def || !st) return 1;
    return def.baseHoneyMultiplier * (1 + (st.level - 1) * 0.08);
  }, [state.hives]);

  const bhAddHive = useCallback((hiveTypeId: string, cost: number): { success: boolean; state: BeeHiveState } => {
    const hiveDef = BH_HIVES.find((h) => h.id === hiveTypeId);
    if (!hiveDef) return { success: false, state };
    if (state.hives.find((h) => h.id === hiveTypeId)) return { success: false, state };
    if (state.coins < cost) return { success: false, state };
    const newHive: HiveState = {
      id: hiveTypeId,
      level: 1,
      capacity: hiveDef.baseCapacity,
      beeCount: 0,
      activeBees: [],
      installedUpgrades: [],
      health: 'healthy',
      healthSeverity: 0,
    };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        hives: [...prev.hives, newHive],
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const bhUpgradeHive = useCallback((hiveId: string): { success: boolean; cost: number; state: BeeHiveState } => {
    const def = BH_HIVES.find((h) => h.id === hiveId);
    const st = state.hives.find((h) => h.id === hiveId);
    if (!def || !st) return { success: false, cost: 0, state };
    if (st.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, st.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const newHives = prev.hives.map((h) =>
        h.id === hiveId ? { ...h, level: h.level + 1, capacity: def.baseCapacity + h.level * 10 } : h
      );
      next = {
        ...prev,
        hives: newHives,
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        hiveUpgradeCount: prev.hiveUpgradeCount + 1,
      };
      next = bhProcessQuestProgress(next, 'upgrade', next.hiveUpgradeCount);
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Flowers ----

  const bhGetFlowers = useCallback((): FlowerDef[] => {
    return [...BH_FLOWERS];
  }, []);

  const bhGetFlowerById = useCallback((id: string): FlowerDef | null => {
    return BH_FLOWERS.find((f) => f.id === id) ?? null;
  }, []);

  const bhGetAvailableFlowers = useCallback((now: number = Date.now()): FlowerDef[] => {
    const month = new Date(now).getMonth() + 1;
    return BH_FLOWERS.filter((f) => f.bloomMonths.includes(month));
  }, []);

  const bhGetFlowerInventory = useCallback((): Record<string, number> => {
    return { ...state.flowers };
  }, [state.flowers]);

  const bhGetFlowerCount = useCallback((flowerId: string): number => {
    return state.flowers[flowerId] ?? 0;
  }, [state.flowers]);

  const bhBuyFlower = useCallback((flowerId: string, amount: number = 1, cost: number): { success: boolean; totalCost: number; state: BeeHiveState } => {
    const totalCost = cost * amount;
    if (state.coins < totalCost) return { success: false, totalCost, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        flowers: { ...prev.flowers, [flowerId]: (prev.flowers[flowerId] ?? 0) + amount },
        coins: clampCoins(prev.coins - totalCost),
        totalSpent: prev.totalSpent + totalCost,
      };
      return next;
    });
    return { success: true, totalCost, state: next };
  }, [state]);

  // ---- Foraging ----

  const bhForage = useCallback((hiveId: string, flowerId: string, now: number = Date.now()): { success: boolean; job: ForageJob | null; state: BeeHiveState } => {
    const hive = state.hives.find((h) => h.id === hiveId);
    const flower = BH_FLOWERS.find((f) => f.id === flowerId);
    if (!hive || !flower) return { success: false, job: null, state };
    if (hive.beeCount === 0) return { success: false, job: null, state };
    if (state.foragingQueue.length >= 5) return { success: false, job: null, state };
    if (state.flowers[flowerId] < 1) return { success: false, job: null, state };

    // Check if this hive already has a foraging job
    if (state.foragingQueue.some((j) => j.id.startsWith(`forage_${hiveId}`))) return { success: false, job: null, state };

    const forageRange = hive.activeBees.reduce((sum, beeId) => {
      const sp = BH_SPECIES.find((s) => s.id === beeId);
      return sum + (sp?.foragingRange ?? 1);
    }, 0) / Math.max(1, hive.activeBees.length);

    const avgPollenRate = hive.activeBees.reduce((sum, beeId) => {
      const sp = BH_SPECIES.find((s) => s.id === beeId);
      return sum + (sp?.basePollenRate ?? 0);
    }, 0) / Math.max(1, hive.activeBees.length);

    const honeyMult = bhGetHiveHoneyMultiplier(hiveId);
    const sMult = seasonMultiplier(state.season);

    // Flower availability check
    const month = new Date(now).getMonth() + 1;
    const inSeason = flower.bloomMonths.includes(month);
    const seasonPenalty = inSeason ? 1 : 0.3;

    const forageTime = Math.max(10, Math.floor(60 / (1 + forageRange * 0.2)));
    const nectarYield = Math.floor(flower.nectarValue * honeyMult * sMult * seasonPenalty * (0.8 + prngRef.current() * 0.4));
    const pollenYield = Math.floor(flower.pollenValue * (avgPollenRate / 10) * sMult * seasonPenalty * (0.8 + prngRef.current() * 0.4));

    const job: ForageJob = {
      id: `forage_${hiveId}_${flowerId}_${now}`,
      flowerId,
      startedAt: now,
      endsAt: now + forageTime * 1000,
      nectarYield,
      pollenYield,
    };

    let next = state;
    setState((prev) => {
      const newFlowers = { ...prev.flowers };
      newFlowers[flowerId] = (newFlowers[flowerId] ?? 0) - 1;
      if (newFlowers[flowerId] <= 0) delete newFlowers[flowerId];

      next = {
        ...prev,
        flowers: newFlowers,
        foragingQueue: [...prev.foragingQueue, job],
      };

      next = bhProcessQuestProgress(next, 'forage', 1);

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = BH_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'forage') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });

    return { success: true, job, state: next };
  }, [state, bhGetHiveHoneyMultiplier]);

  const bhGetForagingQueue = useCallback((): ForageJob[] => {
    return [...state.foragingQueue];
  }, [state.foragingQueue]);

  const bhCollectForage = useCallback((jobId: string, now: number = Date.now()): { success: boolean; nectar: number; pollen: number; xpEarned: number; state: BeeHiveState } => {
    const job = state.foragingQueue.find((j) => j.id === jobId);
    if (!job) return { success: false, nectar: 0, pollen: 0, xpEarned: 0, state };
    if (now < job.endsAt) return { success: false, nectar: 0, pollen: 0, xpEarned: 0, state };

    const nectar = job.nectarYield;
    const pollen = job.pollenYield;
    const xpEarned = Math.floor((nectar + pollen) * 0.5);

    let next = state;
    setState((prev) => {
      const newQueue = prev.foragingQueue.filter((j) => j.id !== jobId);
      let { level, xp } = prev;
      xp += xpEarned;
      while (level < BH_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= BH_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        foragingQueue: newQueue,
        totalHoneyHarvested: prev.totalHoneyHarvested + nectar,
        totalPollenCollected: prev.totalPollenCollected + pollen,
        completedForages: prev.completedForages + 1,
        level: clampLevel(level),
        xp,
      };

      // Apply pollination contracts
      const updatedContracts = prev.activeContracts.map((c) => ({
        ...c,
        completedForages: c.completedForages + 1,
      }));
      next = { ...next, activeContracts: updatedContracts };

      return next;
    });

    return { success: true, nectar, pollen, xpEarned, state: next };
  }, [state]);

  const bhCancelForage = useCallback((jobId: string): { success: boolean; state: BeeHiveState } => {
    const idx = state.foragingQueue.findIndex((j) => j.id === jobId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const job = prev.foragingQueue[idx];
      const newQueue = [...prev.foragingQueue];
      newQueue.splice(idx, 1);
      next = {
        ...prev,
        foragingQueue: newQueue,
        flowers: { ...prev.flowers, [job.flowerId]: (prev.flowers[job.flowerId] ?? 0) + 1 },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Honey ----

  const bhGetHoneys = useCallback((): HoneyDef[] => {
    return [...BH_HONEYS];
  }, []);

  const bhGetHoneyById = useCallback((id: string): HoneyDef | null => {
    return BH_HONEYS.find((h) => h.id === id) ?? null;
  }, []);

  const bhGetHoneyInventory = useCallback((): Record<string, number> => {
    return { ...state.honeyInventory };
  }, [state.honeyInventory]);

  const bhGetHoneyCount = useCallback((honeyId: string): number => {
    return state.honeyInventory[honeyId] ?? 0;
  }, [state.honeyInventory]);

  const bhHarvest = useCallback((hiveId: string, now: number = Date.now()): { success: boolean; honeyType: string; amount: number; coinsEarned: number; xpEarned: number; state: BeeHiveState } => {
    const hive = state.hives.find((h) => h.id === hiveId);
    if (!hive || hive.beeCount === 0) return { success: false, honeyType: '', amount: 0, coinsEarned: 0, xpEarned: 0, state };
    if (state.totalHoneyHarvested === 0 && state.foragingQueue.length === 0) {
      // Need some forage history or stored honey to harvest
    }

    // Calculate honey production from bee composition
    let totalHoneyRate = 0;
    const flowerCounts: Record<string, number> = {};
    for (const beeId of hive.activeBees) {
      const sp = BH_SPECIES.find((s) => s.id === beeId);
      if (sp) totalHoneyRate += sp.baseHoneyRate;
    }

    const honeyMult = bhGetHiveHoneyMultiplier(hiveId);
    const sMult = seasonMultiplier(state.season);
    const healthMult = hive.health === 'healthy' ? 1 : hive.health === 'weakened' ? 0.5 : 0.3;

    const rawHoney = Math.max(1, Math.floor(totalHoneyRate * honeyMult * sMult * healthMult * 0.1));

    // Determine honey type based on available flowers
    const availableFlowerIds = Object.keys(state.flowers).filter((f) => (state.flowers[f] ?? 0) > 0);
    let honeyType = 'wildflower';
    if (availableFlowerIds.length > 0) {
      const flowerId = availableFlowerIds[Math.floor(prngRef.current() * availableFlowerIds.length)];
      const honeyMatch = BH_HONEYS.find((h) => h.primaryFlower === flowerId);
      if (honeyMatch && state.level >= honeyMatch.requiredLevel) {
        honeyType = honeyMatch.id;
      }
    }

    const honeyDef = BH_HONEYS.find((h) => h.id === honeyType);
    const amount = rawHoney;
    const rarityMult = honeyDef ? rarityMultiplier(honeyDef.rarity) : 1;
    const coinsEarned = Math.floor((honeyDef?.basePrice ?? 10) * amount * rarityMult * 0.5);
    const xpEarned = Math.floor(amount * 2 * rarityMult);

    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += xpEarned;
      while (level < BH_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= BH_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        honeyInventory: { ...prev.honeyInventory, [honeyType]: (prev.honeyInventory[honeyType] ?? 0) + amount },
        coins: clampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
        completedHarvests: prev.completedHarvests + 1,
        level: clampLevel(level),
        xp,
      };

      next = bhProcessQuestProgress(next, 'harvest', 1);

      // Earn quest progress
      next = bhProcessQuestProgress(next, 'earn', coinsEarned);

      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = BH_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'harvest') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
        if (poolDef && poolDef.type === 'earn') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + coinsEarned } };
        }
      }

      return next;
    });

    return { success: true, honeyType, amount, coinsEarned, xpEarned, state: next };
  }, [state, bhGetHiveHoneyMultiplier]);

  const bhSellHoney = useCallback((honeyId: string, amount: number = 1): { success: boolean; coinsEarned: number; state: BeeHiveState } => {
    const have = state.honeyInventory[honeyId] ?? 0;
    if (have < amount) return { success: false, coinsEarned: 0, state };
    const def = BH_HONEYS.find((h) => h.id === honeyId);
    if (!def) return { success: false, coinsEarned: 0, state };
    const coinsEarned = Math.floor(def.basePrice * amount * rarityMultiplier(def.rarity));

    let next = state;
    setState((prev) => {
      const newInv = { ...prev.honeyInventory };
      newInv[honeyId] = (newInv[honeyId] ?? 0) - amount;
      if (newInv[honeyId] <= 0) delete newInv[honeyId];

      next = {
        ...prev,
        honeyInventory: newInv,
        coins: clampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
      };
      next = bhProcessQuestProgress(next, 'earn', coinsEarned);
      return next;
    });

    return { success: true, coinsEarned, state: next };
  }, [state]);

  // ---- Add Bees to Hive ----

  const bhAddBeeToHive = useCallback((hiveId: string, speciesId: string): { success: boolean; state: BeeHiveState } => {
    const hive = state.hives.find((h) => h.id === hiveId);
    if (!hive) return { success: false, state };
    if (!state.unlockedSpecies.includes(speciesId)) return { success: false, state };
    const capacity = bhGetHiveCapacity(hiveId);
    if (hive.beeCount >= capacity) return { success: false, state };

    const sp = BH_SPECIES.find((s) => s.id === speciesId);
    let next = state;
    setState((prev) => {
      const newBeeCount = { ...prev.beeCountByRarity };
      if (sp) newBeeCount[sp.rarity] = (newBeeCount[sp.rarity] ?? 0) + 1;
      next = {
        ...prev,
        hives: prev.hives.map((h) =>
          h.id === hiveId ? { ...h, beeCount: h.beeCount + 1, activeBees: [...h.activeBees, speciesId] } : h
        ),
        beeCountByRarity: newBeeCount,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state, bhGetHiveCapacity]);

  const bhRemoveBeeFromHive = useCallback((hiveId: string, speciesId: string): { success: boolean; state: BeeHiveState } => {
    const hive = state.hives.find((h) => h.id === hiveId);
    if (!hive) return { success: false, state };
    const idx = hive.activeBees.indexOf(speciesId);
    if (idx === -1) return { success: false, state };

    const sp = BH_SPECIES.find((s) => s.id === speciesId);
    let next = state;
    setState((prev) => {
      const newBeeCount = { ...prev.beeCountByRarity };
      if (sp) newBeeCount[sp.rarity] = Math.max(0, (newBeeCount[sp.rarity] ?? 0) - 1);
      const hive = prev.hives.find((h) => h.id === hiveId)!;
      const newBees = [...hive.activeBees];
      newBees.splice(idx, 1);
      next = {
        ...prev,
        hives: prev.hives.map((h) =>
          h.id === hiveId ? { ...h, beeCount: h.beeCount - 1, activeBees: newBees } : h
        ),
        beeCountByRarity: newBeeCount,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Health ----

  const bhGetHiveHealth = useCallback((hiveId: string): { status: HealthStatus; severity: number } => {
    const hive = state.hives.find((h) => h.id === hiveId);
    if (!hive) return { status: 'healthy', severity: 0 };
    return { status: hive.health, severity: hive.healthSeverity };
  }, [state.hives]);

  const bhInspectHive = useCallback((hiveId: string, now: number = Date.now()): { health: HealthStatus; severity: number; issues: string[]; state: BeeHiveState } => {
    const hive = state.hives.find((h) => h.id === hiveId);
    if (!hive) return { health: 'healthy', severity: 0, issues: [], state };

    // Check for health issues based on season, upgrades, and species
    const issues: string[] = [];
    let newHealth: HealthStatus = 'healthy';
    let newSeverity = 0;

    const hasPestGuard = hive.installedUpgrades.includes('pest_guard');
    const hasInsulation = hive.installedUpgrades.includes('insulation');

    // Disease resistance from bees
    const avgDiseaseRes = hive.activeBees.reduce((sum, beeId) => {
      const sp = BH_SPECIES.find((s) => s.id === beeId);
      return sum + (sp?.diseaseResistance ?? 5);
    }, 0) / Math.max(1, hive.activeBees.length);

    const avgColdTol = hive.activeBees.reduce((sum, beeId) => {
      const sp = BH_SPECIES.find((s) => s.id === beeId);
      return sum + (sp?.coldTolerance ?? 5);
    }, 0) / Math.max(1, hive.activeBees.length);

    // Varroa check
    const varroaChance = 0.15 - avgDiseaseRes * 0.01 - (hasPestGuard ? 0.05 : 0);
    const rng = mulberry32(bhHashString(`inspect_${hiveId}_${now}`));
    if (rng() < Math.max(0.01, varroaChance)) {
      newHealth = 'varroa';
      newSeverity = Math.floor(rng() * 40) + 20;
      issues.push('Varroa mite infestation detected');
    }

    // Cold stress in winter
    if (state.season === 'winter' && !hasInsulation && avgColdTol < 5) {
      newHealth = newHealth === 'healthy' ? 'cold_stress' : newHealth;
      newSeverity = newHealth === 'cold_stress' ? Math.floor(rng() * 30) + 30 : newSeverity;
      if (!issues.includes('Cold stress — colony struggling')) issues.push('Cold stress — colony struggling');
    }

    // Nosema
    const nosemaChance = 0.08 - avgDiseaseRes * 0.005 - (hasPestGuard ? 0.03 : 0);
    if (rng() < Math.max(0.01, nosemaChance) && newHealth === 'healthy') {
      newHealth = 'nosema';
      newSeverity = Math.floor(rng() * 25) + 15;
      issues.push('Nosema spore infection detected');
    }

    if (newHealth === 'healthy') {
      newSeverity = 0;
    }

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        hives: prev.hives.map((h) =>
          h.id === hiveId ? { ...h, health: newHealth, healthSeverity: newSeverity } : h
        ),
      };

      // Daily task progress for inspect
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = BH_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'inspect') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });

    return { health: newHealth, severity: newSeverity, issues, state: next };
  }, [state]);

  const bhTreatHive = useCallback((hiveId: string, cost: number): { success: boolean; state: BeeHiveState } => {
    const hive = state.hives.find((h) => h.id === hiveId);
    if (!hive || hive.health === 'healthy') return { success: false, state };
    if (state.coins < cost) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        hives: prev.hives.map((h) =>
          h.id === hiveId ? { ...h, health: 'healthy' as HealthStatus, healthSeverity: 0 } : h
        ),
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Upgrades ----

  const bhGetUpgrades = useCallback((): HiveUpgradeDef[] => {
    return [...BH_UPGRADES];
  }, []);

  const bhGetUpgradeStates = useCallback((): UpgradeState[] => {
    return [...state.upgrades];
  }, [state.upgrades]);

  const bhGetUpgradeLevel = useCallback((upgradeId: string): number => {
    const u = state.upgrades.find((s) => s.id === upgradeId);
    return u?.level ?? 0;
  }, [state.upgrades]);

  const bhGetUpgradeBonus = useCallback((upgradeId: string): number => {
    const us = state.upgrades.find((u) => u.id === upgradeId);
    const def = BH_UPGRADES.find((u) => u.id === upgradeId);
    if (!us || !def) return 0;
    return def.baseBonusValue * (0.5 + us.level * 0.15);
  }, [state.upgrades]);

  const bhInstallUpgrade = useCallback((upgradeId: string, hiveId: string): { success: boolean; cost: number; state: BeeHiveState } => {
    const def = BH_UPGRADES.find((u) => u.id === upgradeId);
    const hive = state.hives.find((h) => h.id === hiveId);
    if (!def || !hive) return { success: false, cost: 0, state };

    const currentLevel = state.upgrades.find((u) => u.id === upgradeId)?.level ?? 0;
    if (currentLevel >= def.maxLevel) return { success: false, cost: 0, state };
    if (hive.installedUpgrades.includes(upgradeId)) return { success: false, cost: 0, state };

    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.4, currentLevel));
    if (state.coins < cost) return { success: false, cost, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        upgrades: prev.upgrades.map((u) =>
          u.id === upgradeId ? { ...u, level: u.level + 1, installedOn: hiveId } : u
        ),
        hives: prev.hives.map((h) =>
          h.id === hiveId ? { ...h, installedUpgrades: [...h.installedUpgrades, upgradeId] } : h
        ),
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        hiveUpgradeCount: prev.hiveUpgradeCount + 1,
      };
      next = bhProcessQuestProgress(next, 'upgrade', next.hiveUpgradeCount);
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Swarming / Splitting ----

  const bhGetSwarmWarnings = useCallback((): SwarmingWarning[] => {
    return [...state.swarmWarnings];
  }, [state.swarmWarnings]);

  const bhCheckSwarmRisk = useCallback((hiveId: string, now: number = Date.now()): { atRisk: boolean; severity: number; state: BeeHiveState } => {
    const hive = state.hives.find((h) => h.id === hiveId);
    if (!hive) return { atRisk: false, severity: 0, state };
    const capacity = bhGetHiveCapacity(hiveId);
    const fillRatio = hive.beeCount / capacity;
    const severity = Math.min(100, Math.floor(fillRatio * 100));
    const atRisk = fillRatio > 0.85;

    if (atRisk) {
      const existing = state.swarmWarnings.find((w) => w.hiveId === hiveId && !w.prevented);
      if (!existing) {
        let next = state;
        setState((prev) => {
          next = {
            ...prev,
            swarmWarnings: [...prev.swarmWarnings, { hiveId, severity, triggeredAt: now, prevented: false }],
          };
          return next;
        });
        return { atRisk: true, severity, state: next };
      }
    }

    return { atRisk, severity, state };
  }, [state, bhGetHiveCapacity]);

  const bhPreventSwarm = useCallback((hiveId: string, now: number = Date.now()): { success: boolean; state: BeeHiveState } => {
    const warning = state.swarmWarnings.find((w) => w.hiveId === hiveId && !w.prevented);
    if (!warning) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        swarmWarnings: prev.swarmWarnings.map((w) =>
          w.hiveId === hiveId && !w.prevented ? { ...w, prevented: true } : w
        ),
        swarmsPrevented: prev.swarmsPrevented + 1,
      };
      next = bhProcessQuestProgress(next, 'split', prev.swarmsPrevented + 1);
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const bhSplitColony = useCallback((hiveId: string, newHiveTypeId: string, cost: number): { success: boolean; state: BeeHiveState } => {
    const hive = state.hives.find((h) => h.id === hiveId);
    const newHiveDef = BH_HIVES.find((h) => h.id === newHiveTypeId);
    if (!hive || !newHiveDef) return { success: false, state };
    if (hive.beeCount < 5) return { success: false, state };
    if (state.hives.find((h) => h.id === newHiveTypeId)) return { success: false, state };
    if (state.coins < cost) return { success: false, state };

    const splitCount = Math.floor(hive.beeCount / 2);
    const splitBees = hive.activeBees.slice(0, splitCount);
    const remainingBees = hive.activeBees.slice(splitCount);

    const newHive: HiveState = {
      id: newHiveTypeId,
      level: 1,
      capacity: newHiveDef.baseCapacity,
      beeCount: splitCount,
      activeBees: splitBees,
      installedUpgrades: [],
      health: 'healthy',
      healthSeverity: 0,
    };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        hives: [
          ...prev.hives.map((h) =>
            h.id === hiveId ? { ...h, beeCount: h.beeCount - splitCount, activeBees: remainingBees } : h
          ),
          newHive,
        ],
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        coloniesSplit: prev.coloniesSplit + 1,
        activeHiveId: prev.hives.length === 1 ? newHiveTypeId : prev.activeHiveId,
      };
      next = bhProcessQuestProgress(next, 'split', prev.coloniesSplit + 1);
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  // ---- Pollination Contracts ----

  const bhGetContracts = useCallback((): PollinationContract[] => {
    return [...state.activeContracts];
  }, [state.activeContracts]);

  const bhAcceptContract = useCallback((contractId: string): { success: boolean; state: BeeHiveState } => {
    // Generate a contract from available gardens
    const gardenNames = ['Rose Garden Estate', 'Apple Valley Farm', 'Meadow Creek Orchard', 'Sunflower Hills', 'Clover Fields Community Garden', 'Lavender Lane Botanicals'];
    const now = Date.now();

    const contractSeed = bhHashString(`contract_${contractId}_${state.seed}`);
    const rng = mulberry32(contractSeed);
    const gardenIdx = Math.floor(rng() * gardenNames.length);

    const contract: PollinationContract = {
      id: contractId,
      gardenName: gardenNames[gardenIdx],
      rewardCoins: Math.floor(50 + rng() * 150),
      rewardXP: Math.floor(25 + rng() * 75),
      requiredForages: Math.floor(3 + rng() * 7),
      completedForages: 0,
      expiresAt: now + 86400000 * 3,
      active: true,
    };

    let next = state;
    setState((prev) => {
      next = { ...prev, activeContracts: [...prev.activeContracts, contract] };
      return next;
    });

    return { success: true, state: next };
  }, [state]);

  const bhCompleteContracts = useCallback((now: number = Date.now()): { completed: PollinationContract[]; totalReward: { coins: number; xp: number }; state: BeeHiveState } => {
    const completed: PollinationContract[] = [];
    let totalCoins = 0;
    let totalXP = 0;

    let next = state;
    setState((prev) => {
      const stillActive: PollinationContract[] = [];
      for (const c of prev.activeContracts) {
        if (c.completedForages >= c.requiredForages || now > c.expiresAt) {
          if (c.completedForages >= c.requiredForages) {
            completed.push(c);
            totalCoins += c.rewardCoins;
            totalXP += c.rewardXP;
          }
        } else {
          stillActive.push(c);
        }
      }

      let { level, xp } = prev;
      xp += totalXP;
      while (level < BH_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= BH_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        activeContracts: stillActive,
        coins: clampCoins(prev.coins + totalCoins),
        totalEarned: prev.totalEarned + totalCoins,
        contractsCompleted: prev.contractsCompleted + completed.length,
        level: clampLevel(level),
        xp,
      };
      return next;
    });

    return { completed, totalReward: { coins: totalCoins, xp: totalXP }, state: next };
  }, [state]);

  // ---- Quests ----

  const bhGetQuests = useCallback((): QuestDef[] => {
    return [...BH_QUESTS];
  }, []);

  const bhGetActiveQuests = useCallback((): (QuestDef & QuestState)[] => {
    return state.activeQuests.map((aq) => {
      const def = BH_QUESTS.find((q) => q.id === aq.id);
      if (!def) return { ...aq, name: '', description: '', type: 'harvest' as QuestType, target: 0, rewardCoins: 0, rewardXP: 0, requiredLevel: 0, emoji: '' };
      return { ...aq, ...def };
    });
  }, [state.activeQuests]);

  const bhGetAvailableQuests = useCallback((): QuestDef[] => {
    const activeIds = new Set(state.activeQuests.map((q) => q.id));
    const completedIds = new Set(state.completedQuests);
    return BH_QUESTS.filter((q) => !activeIds.has(q.id) && !completedIds.has(q.id) && state.level >= q.requiredLevel);
  }, [state.activeQuests, state.completedQuests, state.level]);

  const bhGetCompletedQuests = useCallback((): string[] => {
    return [...state.completedQuests];
  }, [state.completedQuests]);

  const bhAcceptQuest = useCallback((questId: string): { success: boolean; state: BeeHiveState } => {
    const def = BH_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.activeQuests.some((q) => q.id === questId)) return { success: false, state };
    if (state.completedQuests.includes(questId)) return { success: false, state };
    if (state.activeQuests.length >= 5) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeQuests: [...prev.activeQuests, { id: questId, accepted: true, completed: false, progress: 0 }],
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const bhGetQuestProgress = useCallback((questId: string): number => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    return aq?.progress ?? 0;
  }, [state.activeQuests]);

  const bhCompleteQuest = useCallback((questId: string): { success: boolean; rewardCoins: number; rewardXP: number; state: BeeHiveState } => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    if (!aq || !aq.completed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const def = BH_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    let next = state;
    setState((prev) => {
      const newActive = prev.activeQuests.filter((q) => q.id !== questId);
      let { level, xp } = prev;
      xp += def.rewardXP;
      while (level < BH_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= BH_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        activeQuests: newActive,
        completedQuests: [...prev.completedQuests, questId],
        coins: clampCoins(prev.coins + def.rewardCoins),
        totalEarned: prev.totalEarned + def.rewardCoins,
        level: clampLevel(level),
        xp,
      };
      return next;
    });

    return { success: true, rewardCoins: def.rewardCoins, rewardXP: def.rewardXP, state: next };
  }, [state]);

  const bhAbandonQuest = useCallback((questId: string): { success: boolean; state: BeeHiveState } => {
    const idx = state.activeQuests.findIndex((q) => q.id === questId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newActive = [...prev.activeQuests];
      newActive.splice(idx, 1);
      next = { ...prev, activeQuests: newActive };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const bhGetAchievements = useCallback((): AchievementDef[] => {
    return [...BH_ACHIEVEMENTS];
  }, []);

  const bhGetUnlockedAchievements = useCallback((): AchievementState[] => {
    return state.unlockedAchievements.filter((a) => a.unlocked);
  }, [state.unlockedAchievements]);

  const bhIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const a = state.unlockedAchievements.find((ach) => ach.id === achievementId);
    return a?.unlocked ?? false;
  }, [state.unlockedAchievements]);

  const bhCheckAchievements = useCallback((): AchievementState[] => {
    const now = Date.now();
    const newlyUnlocked: AchievementState[] = [];

    let next = state;
    setState((prev) => {
      let updated = prev;
      const honeyTypes = Object.keys(prev.honeyInventory).filter((k) => (prev.honeyInventory[k] ?? 0) > 0).length;

      for (const ach of BH_ACHIEVEMENTS) {
        const currentState = updated.unlockedAchievements.find((a) => a.id === ach.id);
        if (!currentState || currentState.unlocked) continue;

        let value = 0;
        switch (ach.conditionKey) {
          case 'completedHarvests': value = updated.completedHarvests; break;
          case 'completedForages': value = updated.completedForages; break;
          case 'totalEarned': value = updated.totalEarned; break;
          case 'level': value = updated.level; break;
          case 'dailyStreak': value = updated.dailyStreak; break;
          case 'coloniesSplit': value = updated.coloniesSplit; break;
          case 'allHoneyTypes': value = honeyTypes; break;
          default: value = 0; break;
        }

        if (value >= ach.targetValue) {
          newlyUnlocked.push({ id: ach.id, unlocked: true, unlockedAt: now });
          updated = {
            ...updated,
            unlockedAchievements: updated.unlockedAchievements.map((a) =>
              a.id === ach.id ? { ...a, unlocked: true, unlockedAt: now } : a
            ),
            coins: clampCoins(updated.coins + ach.rewardCoins),
            totalEarned: updated.totalEarned + ach.rewardCoins,
          };
          let { level, xp } = updated;
          xp += ach.rewardXP;
          while (level < BH_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
            xp -= xpRequiredForLevel(level);
            level += 1;
          }
          if (level >= BH_MAX_LEVEL) xp = 0;
          updated = { ...updated, level: clampLevel(level), xp };
        }
      }
      next = updated;
      return updated;
    });

    return newlyUnlocked;
  }, [state]);

  const bhUnlockAchievement = useCallback((achievementId: string): { success: boolean; state: BeeHiveState } => {
    const ach = BH_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return { success: false, state };
    const current = state.unlockedAchievements.find((a) => a.id === achievementId);
    if (current?.unlocked) return { success: false, state };

    let next = state;
    const now = Date.now();
    setState((prev) => {
      let { level, xp } = prev;
      xp += ach.rewardXP;
      while (level < BH_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= BH_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        unlockedAchievements: prev.unlockedAchievements.map((a) =>
          a.id === achievementId ? { ...a, unlocked: true, unlockedAt: now } : a
        ),
        coins: clampCoins(prev.coins + ach.rewardCoins),
        totalEarned: prev.totalEarned + ach.rewardCoins,
        level: clampLevel(level),
        xp,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Daily Tasks ----

  const bhGetDailyTask = useCallback((): DailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const bhRefreshDailyTask = useCallback((now: number = Date.now()): { dailyTask: DailyTaskPoolDef | null; state: BeeHiveState } => {
    const dayKey = generateDayKey(now);
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const pool = BH_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return { dailyTask: pool ?? null, state };
    }

    const daySeed = bhHashString(dayKey) & 0x7fffffff;
    const rng = mulberry32(daySeed);
    const taskIndex = Math.floor(rng() * BH_DAILY_TASK_POOL.length);
    const task = BH_DAILY_TASK_POOL[taskIndex];

    const yesterdayKey = generateDayKey(now - 86400000);
    const newStreak = state.lastDaily === yesterdayKey ? state.dailyStreak + 1 : (state.lastDaily === dayKey ? state.dailyStreak : 1);

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyTask: { poolId: task.id, progress: 0, claimed: false, dayKey },
        dailyStreak: newStreak,
        lastDaily: dayKey,
      };
      return next;
    });

    return { dailyTask: task, state: next };
  }, [state]);

  const bhClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: BeeHiveState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = BH_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    const streakBonus = 1 + state.dailyStreak * 0.05;
    const rewardCoins = Math.floor(poolDef.rewardCoins * streakBonus);
    const rewardXP = Math.floor(poolDef.rewardXP * streakBonus);

    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += rewardXP;
      while (level < BH_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= BH_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        dailyTask: { ...prev.dailyTask!, claimed: true },
        coins: clampCoins(prev.coins + rewardCoins),
        totalEarned: prev.totalEarned + rewardCoins,
        level: clampLevel(level),
        xp,
      };
      return next;
    });

    return { success: true, rewardCoins, rewardXP, state: next };
  }, [state]);

  const bhGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const bhGetLastDaily = useCallback((): string | null => {
    return state.lastDaily;
  }, [state.lastDaily]);

  // ---- Forage Report ----

  const bhGetForageReport = useCallback((now: number = Date.now()): { season: Season; availableFlowers: FlowerDef[]; multiplier: number; recommendations: string[] } => {
    const available = bhGetAvailableFlowers(now);
    const mult = seasonMultiplier(state.season);
    const recommendations: string[] = [];

    if (state.season === 'spring') recommendations.push('Plant dandelions and apple blossoms for early forage');
    if (state.season === 'summer') recommendations.push('Peak season — maximize foraging trips!');
    if (state.season === 'autumn') recommendations.push('Focus on goldenrod and buckwheat for winter stores');
    if (state.season === 'winter') recommendations.push('Minimal forage available — ensure colonies are well-fed');

    const month = new Date(now).getMonth() + 1;
    const inSeasonFlowers = available.length;
    if (inSeasonFlowers < 3) recommendations.push('Plant more flower varieties for next season');

    return { season: state.season, availableFlowers: available, multiplier: mult, recommendations };
  }, [state.season, bhGetAvailableFlowers]);

  // ---- Honey Competition ----

  const bhEnterCompetition = useCallback((honeyId: string, now: number = Date.now()): { success: boolean; rank: number; prize: number; state: BeeHiveState } => {
    const honeyDef = BH_HONEYS.find((h) => h.id === honeyId);
    if (!honeyDef || (state.honeyInventory[honeyId] ?? 0) < 1) return { success: false, rank: 0, prize: 0, state };
    if (state.level < honeyDef.requiredLevel) return { success: false, rank: 0, prize: 0, state };

    const contestSeed = bhHashString(`competition_${now}_${state.seed}`);
    const rng = mulberry32(contestSeed);
    const avgUpgradeBonus = state.upgrades.reduce((sum, u) => sum + u.level, 0) * 0.5;
    const baseScore = 30 + state.level * 1.5 + rarityMultiplier(honeyDef.rarity) * 15 + avgUpgradeBonus;
    const myScore = baseScore + rng() * 25;

    const npcScores: number[] = [];
    for (let i = 0; i < 9; i++) {
      npcScores.push(25 + rng() * 75);
    }
    const allScores = [...npcScores, myScore];
    allScores.sort((a, b) => b - a);
    const rank = allScores.indexOf(myScore) + 1;

    const prizes = [0, 400, 250, 125, 60, 25, 10, 0, 0, 0];
    const prize = prizes[rank - 1] ?? 0;

    let next = state;
    setState((prev) => {
      const newInv = { ...prev.honeyInventory };
      newInv[honeyId] = (newInv[honeyId] ?? 0) - 1;
      if (newInv[honeyId] <= 0) delete newInv[honeyId];

      const participationXP = Math.floor(honeyDef.basePrice * 0.3);
      let { level, xp } = prev;
      xp += participationXP;
      while (level < BH_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= BH_MAX_LEVEL) xp = 0;

      next = {
        ...prev,
        honeyInventory: newInv,
        coins: clampCoins(prev.coins + prize),
        totalEarned: prev.totalEarned + prize,
        level: clampLevel(level),
        xp,
      };
      return next;
    });

    return { success: true, rank, prize, state: next };
  }, [state]);

  // ---- Stats ----

  const bhGetStats = useCallback(() => {
    return {
      totalHoneyHarvested: state.totalHoneyHarvested,
      totalPollenCollected: state.totalPollenCollected,
      completedForages: state.completedForages,
      completedHarvests: state.completedHarvests,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      profit: state.totalEarned - state.totalSpent,
      coloniesSplit: state.coloniesSplit,
      swarmsPrevented: state.swarmsPrevented,
      contractsCompleted: state.contractsCompleted,
      dailyStreak: state.dailyStreak,
      totalBees: state.hives.reduce((sum, h) => sum + h.beeCount, 0),
      totalHives: state.hives.length,
    };
  }, [state]);

  // ---- NPC Interaction ----

  const bhGetNPCs = useCallback((): NPCDef[] => {
    return [...BH_NPCS];
  }, []);

  const bhGetNPCGreeting = useCallback((npcId: string): string => {
    const npc = BH_NPCS.find((n) => n.id === npcId);
    return npc?.greeting ?? '';
  }, []);

  const bhGetNPCInfo = useCallback((npcId: string): NPCDef | null => {
    return BH_NPCS.find((n) => n.id === npcId) ?? null;
  }, []);

  // ---- Daily Task Pool ----

  const bhGetDailyTaskPool = useCallback((): DailyTaskPoolDef[] => {
    return [...BH_DAILY_TASK_POOL];
  }, []);

  // ---- Return API ----

  return {
    // Core
    bhGetState,
    bhResetState,
    bhSeed,
    bhRandom,
    bhRandomInt,
    bhRandomChoice,
    // Level / XP
    bhGetLevel,
    bhGetXP,
    bhGetXPTillNext,
    bhGetXPTotal,
    bhAddXP,
    // Title
    bhGetTitle,
    bhGetAllTitles,
    bhGetNextTitle,
    // Progress
    bhGetProgress,
    bhGetOverallProgress,
    // Coins
    bhGetCoins,
    bhAddCoins,
    bhSpendCoins,
    bhCanAfford,
    // Season
    bhGetSeason,
    bhGetSeasonMultiplier,
    bhUpdateSeason,
    // Species
    bhGetSpecies,
    bhGetSpeciesById,
    bhGetUnlockedSpecies,
    bhGetLockedSpecies,
    bhUnlockSpecies,
    bhGetBees,
    bhGetBeeCount,
    // Hives
    bhGetHives,
    bhGetHiveStates,
    bhGetActiveHive,
    bhSetActiveHive,
    bhGetHiveLevel,
    bhGetHiveCapacity,
    bhGetHiveHoneyMultiplier,
    bhAddHive,
    bhUpgradeHive,
    // Flowers
    bhGetFlowers,
    bhGetFlowerById,
    bhGetAvailableFlowers,
    bhGetFlowerInventory,
    bhGetFlowerCount,
    bhBuyFlower,
    // Foraging
    bhForage,
    bhGetForagingQueue,
    bhCollectForage,
    bhCancelForage,
    // Honey
    bhGetHoneys,
    bhGetHoneyById,
    bhGetHoneyInventory,
    bhGetHoneyCount,
    bhHarvest,
    bhSellHoney,
    // Bees in Hive
    bhAddBeeToHive,
    bhRemoveBeeFromHive,
    // Health
    bhGetHiveHealth,
    bhInspectHive,
    bhTreatHive,
    // Upgrades
    bhGetUpgrades,
    bhGetUpgradeStates,
    bhGetUpgradeLevel,
    bhGetUpgradeBonus,
    bhInstallUpgrade,
    // Swarming
    bhGetSwarmWarnings,
    bhCheckSwarmRisk,
    bhPreventSwarm,
    bhSplitColony,
    // Contracts
    bhGetContracts,
    bhAcceptContract,
    bhCompleteContracts,
    // Quests
    bhGetQuests,
    bhGetActiveQuests,
    bhGetAvailableQuests,
    bhGetCompletedQuests,
    bhAcceptQuest,
    bhGetQuestProgress,
    bhCompleteQuest,
    bhAbandonQuest,
    // Achievements
    bhGetAchievements,
    bhGetUnlockedAchievements,
    bhIsAchievementUnlocked,
    bhCheckAchievements,
    bhUnlockAchievement,
    // Daily
    bhGetDailyTask,
    bhRefreshDailyTask,
    bhClaimDailyReward,
    bhGetDailyStreak,
    bhGetLastDaily,
    bhGetDailyTaskPool,
    // Report
    bhGetForageReport,
    // Competition
    bhEnterCompetition,
    // Stats
    bhGetStats,
    // NPCs
    bhGetNPCs,
    bhGetNPCGreeting,
    bhGetNPCInfo,
  };
}
