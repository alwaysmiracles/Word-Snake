import { useState, useCallback, useRef } from 'react';

// ============================================================
// Ninja Dojo — Martial Arts Training Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type NDRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type NDStat = 'strength' | 'speed' | 'chakra' | 'stealth' | 'defense';
export type NDQuestType = 'train' | 'mission' | 'learn' | 'defeat' | 'master';
export type NDDailyType = 'train' | 'mission' | 'learn' | 'defeat';
export type NDClanElement = 'fire' | 'water' | 'earth' | 'wind' | 'lightning' | 'shadow';

export interface NDTechniqueDef {
  id: string;
  name: string;
  rarity: NDRarity;
  element: NDClanElement;
  chakraCost: number;
  damage: number;
  description: string;
  emoji: string;
  requiredLevel: number;
  requiredRank: number;
  stat: NDStat;
}

export interface NDTrainingGroundDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseXpMultiplier: number;
  baseChakraRegen: number;
  baseUpgradeCost: number;
  statFocus: NDStat;
}

export interface NDWeaponDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseDamage: number;
  baseSpeedBonus: number;
  baseUpgradeCost: number;
  requiredLevel: number;
}

export interface NDRankDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requiredLevel: number;
  requiredMissions: number;
}

export interface NDMissionDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  difficulty: number;
  requiredLevel: number;
  requiredRank: number;
  baseRewardCoins: number;
  baseRewardXP: number;
  baseRewardChakra: number;
  type: string;
  isStealth: boolean;
}

export interface NDClanDef {
  id: string;
  name: string;
  element: NDClanElement;
  description: string;
  emoji: string;
  bonusStat: NDStat;
  bonusValue: number;
  passiveAbility: string;
}

export interface NDQuestDef {
  id: string;
  name: string;
  description: string;
  type: NDQuestType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  rewardChakra: number;
  requiredLevel: number;
  emoji: string;
}

export interface NDNPCDef {
  id: string;
  name: string;
  role: string;
  description: string;
  emoji: string;
  greeting: string;
}

export interface NDAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface NDDailyTaskPoolDef {
  id: string;
  name: string;
  description: string;
  type: NDDailyType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface NDTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface NDRarityInfo {
  key: NDRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface NDSenseiInfo {
  name: string;
  emoji: string;
  description: string;
  requiredLevel: number;
  bonusXP: number;
}

export interface NDWeaponState {
  id: string;
  level: number;
  equipped: boolean;
}

export interface NDTrainingGroundState {
  id: string;
  level: number;
}

export interface NDQuestState {
  id: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
}

export interface NDAchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface NDDailyTaskState {
  poolId: string;
  progress: number;
  claimed: boolean;
  dayKey: string;
}

export interface NDInfiltrationResult {
  success: boolean;
  rewardCoins: number;
  rewardXP: number;
  stealthScore: number;
  enemiesAvoided: number;
  trapsDisarmed: number;
}

export interface NDTrainingResult {
  xpGained: number;
  chakraUsed: number;
  chakraRegenerated: number;
  statImproved: NDStat;
  statGain: number;
  techniqueLearned: string | null;
}

export interface NDMissionResult {
  success: boolean;
  rewardCoins: number;
  rewardXP: number;
  rewardChakra: number;
  techniquesUsed: number;
  enemiesDefeated: number;
  wasStealth: boolean;
}

export interface NinjaDojoState {
  level: number;
  xp: number;
  coins: number;
  chakra: number;
  maxChakra: number;
  rankIndex: number;
  senseiIndex: number;
  clanId: string | null;
  unlockedTechniques: string[];
  activeTrainingGround: string;
  stats: Record<NDStat, number>;
  completedTrainings: number;
  completedMissions: number;
  totalDefeated: number;
  totalStealthSuccess: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalChakraSpent: number;
  totalXPEarned: number;
  dailyStreak: number;
  lastDaily: string | null;
  activeQuests: NDQuestState[];
  completedQuests: string[];
  unlockedAchievements: NDAchievementState[];
  dailyTask: NDDailyTaskState | null;
  trainingGrounds: NDTrainingGroundState[];
  weapons: NDWeaponState[];
  seed: number;
  techniqueCountByRarity: Record<NDRarity, number>;
  missionCountByDifficulty: Record<number, number>;
  trainingGroundUpgradeCount: number;
  weaponUpgradeCount: number;
  currentSenseiProgress: number;
  infiltrationAttempts: number;
  infiltrationSuccesses: number;
  techniquesMastered: number;
  clanMissionsCompleted: number;
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

function ndHashString(str: string): number {
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

function ndXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= ND_MAX_LEVEL) return Infinity;
  return Math.floor(120 * level * (1 + level * 0.14));
}

function ndClampLevel(lvl: number): number {
  return Math.max(1, Math.min(ND_MAX_LEVEL, lvl));
}

function ndClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function ndGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function ndRarityMultiplier(r: NDRarity): number {
  const map: Record<NDRarity, number> = {
    common: 1, uncommon: 1.5, rare: 2.2, epic: 3.5, legendary: 6,
  };
  return map[r] ?? 1;
}

function ndStatLabel(stat: NDStat): string {
  const map: Record<NDStat, string> = {
    strength: 'Strength', speed: 'Speed', chakra: 'Chakra', stealth: 'Stealth', defense: 'Defense',
  };
  return map[stat] ?? stat;
}

// ============================================================
// Constants
// ============================================================

export const ND_MAX_LEVEL = 50;

export const ND_RARITIES: NDRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2.2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3.5 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 6 },
];

export const ND_TITLE_THRESHOLDS: NDTitleInfo[] = [
  { name: 'Academy Student', levelRequired: 1, description: 'A fresh recruit beginning the path of the shinobi' },
  { name: 'Genin', levelRequired: 5, description: 'A junior ninja who has passed the academy exams' },
  { name: 'Chunin', levelRequired: 12, description: 'A capable ninja leading small teams on missions' },
  { name: 'Special Jonin', levelRequired: 20, description: 'An elite ninja specializing in advanced techniques' },
  { name: 'Jonin', levelRequired: 28, description: 'A master ninja commanding respect across the village' },
  { name: 'Anbu Black Ops', levelRequired: 35, description: 'A shadow operative serving the village in secret' },
  { name: 'Kage Candidate', levelRequired: 42, description: 'One step away from the highest ninja authority' },
  { name: 'Supreme Kage', levelRequired: 50, description: 'The ultimate ninja — ruler of the shinobi world' },
];

export const ND_RANKS: NDRankDef[] = [
  { id: 'rank_academy', name: 'Academy Student', description: 'Learning the basics of ninjutsu', emoji: '📚', requiredLevel: 1, requiredMissions: 0 },
  { id: 'rank_genin', name: 'Genin', description: 'Junior ninja ready for field missions', emoji: '🔰', requiredLevel: 5, requiredMissions: 5 },
  { id: 'rank_chunin', name: 'Chunin', description: 'Skilled ninja leading small squads', emoji: '⚔️', requiredLevel: 12, requiredMissions: 20 },
  { id: 'rank_special_jonin', name: 'Special Jonin', description: 'Elite specialist in one discipline', emoji: '🌟', requiredLevel: 20, requiredMissions: 50 },
  { id: 'rank_jonin', name: 'Jonin', description: 'Master ninja of exceptional ability', emoji: '💎', requiredLevel: 28, requiredMissions: 100 },
  { id: 'rank_anbu', name: 'Anbu Black Ops', description: 'Covert shadow operative', emoji: '🦊', requiredLevel: 35, requiredMissions: 200 },
  { id: 'rank_sage', name: 'Sage', description: 'Master of natural energy and sage arts', emoji: '🏔️', requiredLevel: 42, requiredMissions: 350 },
  { id: 'rank_kage', name: 'Kage', description: 'Supreme leader of the ninja village', emoji: '👑', requiredLevel: 50, requiredMissions: 500 },
];

export const ND_TECHNIQUES: NDTechniqueDef[] = [
  // Common (7)
  { id: 'basic_throw', name: 'Basic Shuriken Throw', rarity: 'common', element: 'wind', chakraCost: 5, damage: 12, description: 'A fundamental projectile technique every ninja learns', emoji: '⭐', requiredLevel: 1, requiredRank: 0, stat: 'strength' },
  { id: 'shadow_clone', name: 'Shadow Clone Jutsu', rarity: 'common', element: 'shadow', chakraCost: 10, damage: 8, description: 'Creates a single shadow clone to aid in combat', emoji: '👤', requiredLevel: 1, requiredRank: 0, stat: 'chakra' },
  { id: 'tree_walk', name: 'Tree Walking', rarity: 'common', element: 'earth', chakraCost: 3, damage: 0, description: 'Channel chakra to feet to walk on vertical surfaces', emoji: '🌲', requiredLevel: 1, requiredRank: 0, stat: 'stealth' },
  { id: 'body_flicker', name: 'Body Flicker Jutsu', rarity: 'common', element: 'wind', chakraCost: 8, damage: 0, description: 'A quick burst of speed for short-distance movement', emoji: '💨', requiredLevel: 2, requiredRank: 0, stat: 'speed' },
  { id: 'transformation', name: 'Transformation Jutsu', rarity: 'common', element: 'shadow', chakraCost: 6, damage: 0, description: 'Transform your appearance into another person or object', emoji: '🎭', requiredLevel: 2, requiredRank: 0, stat: 'stealth' },
  { id: 'substitution', name: 'Substitution Jutsu', rarity: 'common', element: 'earth', chakraCost: 7, damage: 0, description: 'Swap places with a nearby object to evade attacks', emoji: '🪵', requiredLevel: 3, requiredRank: 0, stat: 'defense' },
  { id: 'basic_kunai', name: 'Kunai Slash', rarity: 'common', element: 'wind', chakraCost: 4, damage: 15, description: 'A close-range kunai strike enhanced with chakra', emoji: '🗡️', requiredLevel: 3, requiredRank: 0, stat: 'strength' },
  // Uncommon (7)
  { id: 'fireball', name: 'Fireball Jutsu', rarity: 'uncommon', element: 'fire', chakraCost: 15, damage: 28, description: 'Launches a large sphere of concentrated fire', emoji: '🔥', requiredLevel: 5, requiredRank: 1, stat: 'strength' },
  { id: 'water_blast', name: 'Water Cannon', rarity: 'uncommon', element: 'water', chakraCost: 14, damage: 24, description: 'Fires a high-pressure stream of water', emoji: '🌊', requiredLevel: 5, requiredRank: 1, stat: 'chakra' },
  { id: 'earth_wall', name: 'Earth Style: Stone Wall', rarity: 'uncommon', element: 'earth', chakraCost: 12, damage: 0, description: 'Raises a defensive wall of stone from the ground', emoji: '🧱', requiredLevel: 6, requiredRank: 1, stat: 'defense' },
  { id: 'wind_blade', name: 'Wind Blade', rarity: 'uncommon', element: 'wind', chakraCost: 13, damage: 26, description: 'Creates a blade of compressed wind for cutting attacks', emoji: '🌪️', requiredLevel: 7, requiredRank: 1, stat: 'speed' },
  { id: 'chakra_sense', name: 'Chakra Sensing', rarity: 'uncommon', element: 'shadow', chakraCost: 8, damage: 0, description: 'Sense nearby chakra signatures through walls and obstacles', emoji: '👁️', requiredLevel: 8, requiredRank: 1, stat: 'stealth' },
  { id: 'lightning_palm', name: 'Lightning Palm Strike', rarity: 'uncommon', element: 'lightning', chakraCost: 16, damage: 30, description: 'Channels lightning into the palm for a devastating strike', emoji: '⚡', requiredLevel: 9, requiredRank: 1, stat: 'strength' },
  { id: 'multi_clone', name: 'Multiple Shadow Clones', rarity: 'uncommon', element: 'shadow', chakraCost: 20, damage: 12, description: 'Creates up to five shadow clones simultaneously', emoji: '👥', requiredLevel: 10, requiredRank: 1, stat: 'chakra' },
  // Rare (7)
  { id: 'chidori', name: 'Chidori', rarity: 'rare', element: 'lightning', chakraCost: 28, damage: 55, description: 'A concentrated mass of lightning chakra in the hand — piercing thrust', emoji: '⚡', requiredLevel: 12, requiredRank: 2, stat: 'strength' },
  { id: 'rasengan', name: 'Rasengan', rarity: 'rare', element: 'wind', chakraCost: 25, damage: 50, description: 'A spinning sphere of pure chakra — devastating close-range attack', emoji: '🌀', requiredLevel: 14, requiredRank: 2, stat: 'chakra' },
  { id: 'sand_shield', name: 'Sand Shield', rarity: 'rare', element: 'earth', chakraCost: 18, damage: 0, description: 'An automatic shield of sand that blocks incoming attacks', emoji: '🏜️', requiredLevel: 15, requiredRank: 2, stat: 'defense' },
  { id: 'water_dragon', name: 'Water Dragon Jutsu', rarity: 'rare', element: 'water', chakraCost: 30, damage: 48, description: 'Summons a massive dragon made of water to crash upon enemies', emoji: '🐉', requiredLevel: 16, requiredRank: 2, stat: 'chakra' },
  { id: 'fire_phoenix', name: 'Fire Phoenix Flower', rarity: 'rare', element: 'fire', chakraCost: 26, damage: 45, description: 'Launches a barrage of phoenix-shaped fireballs', emoji: '🔥', requiredLevel: 17, requiredRank: 2, stat: 'strength' },
  { id: 'gentle_fist', name: 'Gentle Fist', rarity: 'rare', element: 'shadow', chakraCost: 20, damage: 40, description: 'Precise strikes that target chakra points to disable opponents', emoji: '✋', requiredLevel: 18, requiredRank: 2, stat: 'speed' },
  { id: 'shadow_neck_bind', name: 'Shadow Neck Bind', rarity: 'rare', element: 'shadow', chakraCost: 22, damage: 38, description: 'Extends your shadow to bind and strangle an opponent', emoji: '🌑', requiredLevel: 19, requiredRank: 2, stat: 'stealth' },
  // Epic (7)
  { id: 'sage_mode', name: 'Sage Mode Activation', rarity: 'epic', element: 'earth', chakraCost: 40, damage: 70, description: 'Enter Sage Mode — greatly enhances all abilities using natural energy', emoji: '🧘', requiredLevel: 22, requiredRank: 3, stat: 'chakra' },
  { id: 'amaterasu', name: 'Amaterasu', rarity: 'epic', element: 'fire', chakraCost: 45, damage: 80, description: 'Unquenchable black flames that burn anything they touch', emoji: '⚫', requiredLevel: 25, requiredRank: 3, stat: 'strength' },
  { id: 'susano', name: 'Susanoo', rarity: 'epic', element: 'shadow', chakraCost: 50, damage: 60, description: 'Manifest a massive ethereal warrior for defense and offense', emoji: '👹', requiredLevel: 27, requiredRank: 3, stat: 'defense' },
  { id: 'tsukuyomi', name: 'Tsukuyomi', rarity: 'epic', element: 'shadow', chakraCost: 48, damage: 75, description: 'Trap an opponent in an inescapable genjutsu illusion world', emoji: '🌙', requiredLevel: 29, requiredRank: 3, stat: 'stealth' },
  { id: 'chidori_stream', name: 'Chidori Stream', rarity: 'epic', element: 'lightning', chakraCost: 42, damage: 72, description: 'Extends Chidori into a continuous stream of lightning', emoji: '⚡', requiredLevel: 30, requiredRank: 3, stat: 'speed' },
  { id: 'sage_rasengan', name: 'Sage Rasengan', rarity: 'epic', element: 'wind', chakraCost: 46, damage: 85, description: 'A Rasengan enhanced with natural energy from Sage Mode', emoji: '🌀', requiredLevel: 32, requiredRank: 3, stat: 'chakra' },
  { id: 'water_shark_bomb', name: 'Water Shark Bomb', rarity: 'epic', element: 'water', chakraCost: 44, damage: 78, description: 'Creates a shark of water that homes in on the target', emoji: '🦈', requiredLevel: 33, requiredRank: 3, stat: 'chakra' },
  // Legendary (7)
  { id: 'eight_gates', name: 'Eight Gates: Opening', rarity: 'legendary', element: 'fire', chakraCost: 60, damage: 120, description: 'Unlock the Eight Inner Gates for catastrophic power beyond limits', emoji: '🚪', requiredLevel: 36, requiredRank: 4, stat: 'strength' },
  { id: 'six_paths_rasengan', name: 'Six Paths Rasengan', rarity: 'legendary', element: 'wind', chakraCost: 65, damage: 130, description: 'The ultimate Rasengan infused with Six Paths chakra', emoji: '✨', requiredLevel: 38, requiredRank: 5, stat: 'chakra' },
  { id: 'perfect_susano', name: 'Perfect Susanoo', rarity: 'legendary', element: 'shadow', chakraCost: 70, damage: 100, description: 'A towering Susanoo the size of mountains with immense power', emoji: '⛩️', requiredLevel: 40, requiredRank: 5, stat: 'defense' },
  { id: 'infinite_tsukuyomi', name: 'Infinite Tsukuyomi', rarity: 'legendary', element: 'shadow', chakraCost: 80, damage: 150, description: 'Cast a genjutsu upon the entire world — the ultimate illusion', emoji: '🌈', requiredLevel: 42, requiredRank: 5, stat: 'stealth' },
  { id: 'truthseeker_orb', name: 'Truthseeker Orb', rarity: 'legendary', element: 'earth', chakraCost: 75, damage: 140, description: 'A sphere of all five natures that erases anything it touches', emoji: '🔮', requiredLevel: 44, requiredRank: 6, stat: 'chakra' },
  { id: 'biju_rasengan', name: 'Tailed Beast Rasengan', rarity: 'legendary', element: 'fire', chakraCost: 72, damage: 135, description: 'A Rasengan infused with the raw chakra of a Tailed Beast', emoji: '🦊', requiredLevel: 46, requiredRank: 6, stat: 'strength' },
  { id: 'flying_thunder_god', name: 'Flying Thunder God', rarity: 'legendary', element: 'lightning', chakraCost: 55, damage: 0, description: 'Teleport instantly to any marked location — the ultimate speed technique', emoji: '⚡', requiredLevel: 48, requiredRank: 6, stat: 'speed' },
];

export const ND_TRAINING_GROUNDS: NDTrainingGroundDef[] = [
  { id: 'dojo_floor', name: 'Dojo Floor', description: 'The main training hall with wooden dummies and tatami mats', emoji: '🏠', maxLevel: 10, baseXpMultiplier: 1.0, baseChakraRegen: 5, baseUpgradeCost: 80, statFocus: 'strength' },
  { id: 'bamboo_forest', name: 'Bamboo Forest', description: 'Dense bamboo groves perfect for stealth and agility drills', emoji: '🎋', maxLevel: 10, baseXpMultiplier: 1.0, baseChakraRegen: 4, baseUpgradeCost: 100, statFocus: 'stealth' },
  { id: 'waterfall', name: 'Sacred Waterfall', description: 'Training beneath powerful falls builds endurance and chakra control', emoji: '🌊', maxLevel: 10, baseXpMultiplier: 1.1, baseChakraRegen: 8, baseUpgradeCost: 120, statFocus: 'chakra' },
  { id: 'mountain_peak', name: 'Mountain Peak', description: 'Thin air and rugged terrain push strength and willpower to the limit', emoji: '🏔️', maxLevel: 10, baseXpMultiplier: 1.2, baseChakraRegen: 3, baseUpgradeCost: 150, statFocus: 'defense' },
  { id: 'lightning_field', name: 'Lightning Training Field', description: 'A barren plateau where lightning strikes sharpen reflexes', emoji: '⚡', maxLevel: 10, baseXpMultiplier: 1.15, baseChakraRegen: 6, baseUpgradeCost: 130, statFocus: 'speed' },
  { id: 'cave_of_darkness', name: 'Cave of Darkness', description: 'An pitch-black cave where only chakra sensing can guide you', emoji: '🕳️', maxLevel: 10, baseXpMultiplier: 1.1, baseChakraRegen: 7, baseUpgradeCost: 140, statFocus: 'stealth' },
  { id: 'hot_spring', name: 'Hidden Hot Spring', description: 'Thermal waters accelerate recovery and restore depleted chakra', emoji: '♨️', maxLevel: 10, baseXpMultiplier: 0.8, baseChakraRegen: 15, baseUpgradeCost: 200, statFocus: 'defense' },
  { id: 'sage_mountain', name: 'Sage Mountain', description: 'A sacred peak rich in natural energy for sage arts training', emoji: '🧘', maxLevel: 10, baseXpMultiplier: 1.4, baseChakraRegen: 10, baseUpgradeCost: 250, statFocus: 'chakra' },
];

export const ND_WEAPONS: NDWeaponDef[] = [
  { id: 'kunai', name: 'Kunai', description: 'The standard ninja throwing knife — versatile and reliable', emoji: '🗡️', maxLevel: 10, baseDamage: 8, baseSpeedBonus: 2, baseUpgradeCost: 50, requiredLevel: 1 },
  { id: 'shuriken', name: 'Shuriken', description: 'Four-pointed throwing stars for ranged combat', emoji: '⭐', maxLevel: 10, baseDamage: 6, baseSpeedBonus: 5, baseUpgradeCost: 40, requiredLevel: 1 },
  { id: 'katana', name: 'Katana', description: 'A masterwork curved blade — the samurai-ninja hybrid weapon', emoji: '⚔️', maxLevel: 10, baseDamage: 18, baseSpeedBonus: 1, baseUpgradeCost: 120, requiredLevel: 5 },
  { id: 'kusarigama', name: 'Kusarigama', description: 'A chain-sickle weapon with deadly range and reach', emoji: '🔗', maxLevel: 10, baseDamage: 15, baseSpeedBonus: 3, baseUpgradeCost: 100, requiredLevel: 8 },
  { id: 'tanto', name: 'Tanto', description: 'A short dagger for close-quarters assassination', emoji: '🔪', maxLevel: 10, baseDamage: 12, baseSpeedBonus: 6, baseUpgradeCost: 60, requiredLevel: 3 },
  { id: 'nunchaku', name: 'Nunchaku', description: 'Two connected sticks for rapid bludgeoning attacks', emoji: '🪨', maxLevel: 10, baseDamage: 14, baseSpeedBonus: 4, baseUpgradeCost: 70, requiredLevel: 4 },
  { id: 'bo_staff', name: 'Bo Staff', description: 'A six-foot staff for sweeping defense and offense', emoji: '🪵', maxLevel: 10, baseDamage: 16, baseSpeedBonus: 2, baseUpgradeCost: 90, requiredLevel: 6 },
  { id: 'war_fan', name: 'War Fan (Tessen)', description: 'A reinforced iron fan that conceals deadly blades', emoji: '🪭', maxLevel: 10, baseDamage: 13, baseSpeedBonus: 4, baseUpgradeCost: 80, requiredLevel: 7 },
  { id: 'poison_needles', name: 'Poison Needles', description: 'Thin needles tipped with slow-acting ninja poison', emoji: '💉', maxLevel: 10, baseDamage: 10, baseSpeedBonus: 7, baseUpgradeCost: 110, requiredLevel: 10 },
  { id: 'explosive_tags', name: 'Explosive Tags', description: 'Paper talismans inscribed with detonation seals', emoji: '💣', maxLevel: 10, baseDamage: 22, baseSpeedBonus: 0, baseUpgradeCost: 150, requiredLevel: 12 },
  { id: 'giant_shuriken', name: 'Giant Shuriken', description: 'Oversized windmill shuriken capable of cleaving trees', emoji: '🌀', maxLevel: 10, baseDamage: 25, baseSpeedBonus: 1, baseUpgradeCost: 180, requiredLevel: 15 },
  { id: 'legendary_blade', name: 'Blade of the Kage', description: 'A legendary weapon passed down through generations of Kage', emoji: '🗡️', maxLevel: 10, baseDamage: 35, baseSpeedBonus: 3, baseUpgradeCost: 300, requiredLevel: 20 },
];

export const ND_MISSIONS: NDMissionDef[] = [
  { id: 'mission_d_rank_escort', name: 'D-Rank: Cat Retrieval', description: 'Help an elderly woman find her lost cat in the village', emoji: '🐱', difficulty: 1, requiredLevel: 1, requiredRank: 0, baseRewardCoins: 30, baseRewardXP: 20, baseRewardChakra: 5, type: 'Escort', isStealth: false },
  { id: 'mission_d_rank_garden', name: 'D-Rank: Garden Defense', description: 'Protect the village gardens from wild boars', emoji: '🐷', difficulty: 1, requiredLevel: 1, requiredRank: 0, baseRewardCoins: 35, baseRewardXP: 25, baseRewardChakra: 5, type: 'Defense', isStealth: false },
  { id: 'mission_c_rank_bandits', name: 'C-Rank: Bandit Suppression', description: 'Clear out a group of bandits terrorizing a trade route', emoji: '⚔️', difficulty: 2, requiredLevel: 5, requiredRank: 1, baseRewardCoins: 80, baseRewardXP: 60, baseRewardChakra: 10, type: 'Combat', isStealth: false },
  { id: 'mission_c_rank_escort', name: 'C-Rank: Merchant Escort', description: 'Safeguard a merchant caravan through dangerous territory', emoji: '🛒', difficulty: 2, requiredLevel: 6, requiredRank: 1, baseRewardCoins: 100, baseRewardXP: 70, baseRewardChakra: 12, type: 'Escort', isStealth: false },
  { id: 'mission_c_rank_spy', name: 'C-Rank: Spy Recovery', description: 'Locate and extract an injured spy from enemy territory', emoji: '🔍', difficulty: 3, requiredLevel: 8, requiredRank: 1, baseRewardCoins: 120, baseRewardXP: 90, baseRewardChakra: 15, type: 'Rescue', isStealth: true },
  { id: 'mission_b_rank_espionage', name: 'B-Rank: Enemy Espionage', description: 'Infiltrate a rival village and steal intelligence scrolls', emoji: '📜', difficulty: 4, requiredLevel: 12, requiredRank: 2, baseRewardCoins: 200, baseRewardXP: 150, baseRewardChakra: 20, type: 'Espionage', isStealth: true },
  { id: 'mission_b_rank_assassination', name: 'B-Rank: Target Neutralization', description: 'Eliminate a corrupt warlord threatening the region', emoji: '🎯', difficulty: 4, requiredLevel: 14, requiredRank: 2, baseRewardCoins: 250, baseRewardXP: 180, baseRewardChakra: 22, type: 'Assassination', isStealth: true },
  { id: 'mission_b_rank_rescue', name: 'B-Rank: Hostage Rescue', description: 'Rescue kidnapped villagers from a criminal syndicate', emoji: '🆘', difficulty: 4, requiredLevel: 15, requiredRank: 2, baseRewardCoins: 230, baseRewardXP: 170, baseRewardChakra: 25, type: 'Rescue', isStealth: false },
  { id: 'mission_a_rank_siege', name: 'A-Rank: Fortress Siege', description: 'Lead an assault on a fortified enemy compound', emoji: '🏰', difficulty: 5, requiredLevel: 20, requiredRank: 3, baseRewardCoins: 400, baseRewardXP: 300, baseRewardChakra: 35, type: 'Siege', isStealth: false },
  { id: 'mission_a_rank_infiltration', name: 'A-Rank: Deep Infiltration', description: 'Penetrate the enemy Kage tower and retrieve secret plans', emoji: '🏢', difficulty: 5, requiredLevel: 22, requiredRank: 3, baseRewardCoins: 450, baseRewardXP: 350, baseRewardChakra: 40, type: 'Espionage', isStealth: true },
  { id: 'mission_a_rank_escort_daimyo', name: 'A-Rank: Daimyo Escort', description: 'Protect the feudal lord during his diplomatic journey', emoji: '🏯', difficulty: 5, requiredLevel: 24, requiredRank: 3, baseRewardCoins: 420, baseRewardXP: 320, baseRewardChakra: 38, type: 'Escort', isStealth: false },
  { id: 'mission_a_rank_missing_nin', name: 'A-Rank: Missing Ninja Hunt', description: 'Track down and capture a dangerous missing-nin', emoji: '🦅', difficulty: 6, requiredLevel: 25, requiredRank: 3, baseRewardCoins: 480, baseRewardXP: 360, baseRewardChakra: 42, type: 'Hunt', isStealth: false },
  { id: 'mission_s_rank_sage', name: 'S-Rank: Sage Scroll Retrieval', description: 'Recover the ancient Sage Scrolls from the Forbidden Temple', emoji: '⛩️', difficulty: 7, requiredLevel: 30, requiredRank: 4, baseRewardCoins: 800, baseRewardXP: 600, baseRewardChakra: 60, type: 'Artifact', isStealth: true },
  { id: 'mission_s_rank_biiju', name: 'S-Rank: Tailed Beast Containment', description: 'Assist in sealing a rampaging Tailed Beast', emoji: '🦊', difficulty: 8, requiredLevel: 35, requiredRank: 5, baseRewardCoins: 1000, baseRewardXP: 800, baseRewardChakra: 80, type: 'Boss', isStealth: false },
  { id: 'mission_s_rank_conspiracy', name: 'S-Rank: Village Conspiracy', description: 'Uncover a conspiracy within the village council', emoji: '🎭', difficulty: 7, requiredLevel: 33, requiredRank: 4, baseRewardCoins: 900, baseRewardXP: 700, baseRewardChakra: 70, type: 'Investigation', isStealth: true },
  { id: 'mission_s_rank_rebellion', name: 'S-Rank: Rebellion Suppression', description: 'Quell a ninja rebellion that threatens to start a war', emoji: '🏴', difficulty: 8, requiredLevel: 37, requiredRank: 5, baseRewardCoins: 1100, baseRewardXP: 850, baseRewardChakra: 85, type: 'Siege', isStealth: false },
  { id: 'mission_ss_rank_war', name: 'SS-Rank: Ninja War Battle', description: 'Fight on the front lines of an inter-village war', emoji: '⚔️', difficulty: 9, requiredLevel: 40, requiredRank: 6, baseRewardCoins: 1500, baseRewardXP: 1200, baseRewardChakra: 100, type: 'War', isStealth: false },
  { id: 'mission_ss_rank_seal', name: 'SS-Rank: Forbidden Seal Removal', description: 'Remove a dangerous forbidden seal from an ally', emoji: '🔒', difficulty: 9, requiredLevel: 42, requiredRank: 6, baseRewardCoins: 1600, baseRewardXP: 1300, baseRewardChakra: 110, type: 'Artifact', isStealth: true },
  { id: 'mission_ss_rank_rogue_kage', name: 'SS-Rank: Rogue Kage Elimination', description: 'Defeat a rogue Kage who threatens the ninja world', emoji: '💀', difficulty: 10, requiredLevel: 45, requiredRank: 7, baseRewardCoins: 2000, baseRewardXP: 1600, baseRewardChakra: 130, type: 'Boss', isStealth: false },
  { id: 'mission_ss_rank_sage_art', name: 'SS-Rank: Perfect Sage Art', description: 'Complete the ultimate Sage Art training in the Sacred Realm', emoji: '🌟', difficulty: 10, requiredLevel: 48, requiredRank: 7, baseRewardCoins: 2500, baseRewardXP: 2000, baseRewardChakra: 150, type: 'Training', isStealth: false },
];

export const ND_CLANS: NDClanDef[] = [
  { id: 'clan_uchiha', name: 'Uchiha Clan', element: 'fire', description: 'Descendants of the Sage\'s elder son, masters of the Sharingan', emoji: '🔥', bonusStat: 'strength', bonusValue: 3, passiveAbility: 'Fire Jutsu damage increased by 15%' },
  { id: 'clan_uzumaki', name: 'Uzumaki Clan', element: 'wind', description: 'Known for immense chakra reserves and sealing jutsu', emoji: '🌀', bonusStat: 'chakra', bonusValue: 5, passiveAbility: 'Maximum chakra increased by 20%' },
  { id: 'clan_hyuuga', name: 'Hyuuga Clan', element: 'shadow', description: 'The noble clan with the Byakugan and Gentle Fist style', emoji: '👁️', bonusStat: 'stealth', bonusValue: 3, passiveAbility: 'Gentle Fist techniques deal 20% more damage' },
  { id: 'clan_nara', name: 'Nara Clan', element: 'shadow', description: 'Lazy geniuses who manipulate shadows and strategy', emoji: '🌑', bonusStat: 'stealth', bonusValue: 4, passiveAbility: 'Shadow techniques cost 20% less chakra' },
  { id: 'clan_sarutobi', name: 'Sarutobi Clan', element: 'fire', description: 'The will of fire runs deep in this legendary clan', emoji: '🦊', bonusStat: 'defense', bonusValue: 3, passiveAbility: 'Fire techniques boost defense by 10%' },
  { id: 'clan_yamanaka', name: 'Yamanaka Clan', element: 'water', description: 'Masters of mind-transfer and sensory techniques', emoji: '🧠', bonusStat: 'chakra', bonusValue: 3, passiveAbility: 'Sensory range increased by 25%' },
  { id: 'clan_aburame', name: 'Aburame Clan', element: 'earth', description: 'Symbiotic relationship with destruction insects', emoji: '🐛', bonusStat: 'defense', bonusValue: 4, passiveAbility: 'Insect shield blocks 15% of damage' },
  { id: 'clan_akimichi', name: 'Akimichi Clan', element: 'earth', description: 'Convert calories into powerful jutsu — size matters', emoji: '💪', bonusStat: 'strength', bonusValue: 5, passiveAbility: 'Butterfly Mode available at half chakra cost' },
];

export const ND_SENSEIS: NDSenseiInfo[] = [
  { name: 'Iruka-sensei', emoji: '👨‍🏫', description: 'Your first instructor at the ninja academy', requiredLevel: 1, bonusXP: 0 },
  { name: 'Kakashi-sensei', emoji: '🪖', description: 'The Copy Ninja — master of a thousand jutsu', requiredLevel: 5, bonusXP: 5 },
  { name: 'Gai-sensei', emoji: '💪', description: 'The Green Beast — master of taijutsu and gates', requiredLevel: 12, bonusXP: 10 },
  { name: 'Jiraiya-sama', emoji: '🐸', description: 'The Toad Sage — legendary sannin and author', requiredLevel: 20, bonusXP: 18 },
  { name: 'Tsunade-shishou', emoji: '🌸', description: 'The legendary medic-nin and greatest kunoichi', requiredLevel: 28, bonusXP: 25 },
  { name: 'Orochimaru', emoji: '🐍', description: 'The dark sage — forbidden jutsu specialist', requiredLevel: 35, bonusXP: 35 },
];

export const ND_QUESTS: NDQuestDef[] = [
  { id: 'quest_first_training', name: 'First Steps', description: 'Complete 3 training sessions to prove your dedication', type: 'train', target: 3, rewardCoins: 60, rewardXP: 30, rewardChakra: 10, requiredLevel: 1, emoji: '🏠' },
  { id: 'quest_first_mission', name: 'Initiate Mission', description: 'Complete your first D-Rank mission', type: 'mission', target: 1, rewardCoins: 80, rewardXP: 50, rewardChakra: 10, requiredLevel: 1, emoji: '🎯' },
  { id: 'quest_learn_5', name: 'Technique Collector', description: 'Learn 5 different jutsu techniques', type: 'learn', target: 5, rewardCoins: 120, rewardXP: 80, rewardChakra: 20, requiredLevel: 3, emoji: '📚' },
  { id: 'quest_defeat_20', name: 'Battle Hardened', description: 'Defeat 20 enemies in combat missions', type: 'defeat', target: 20, rewardCoins: 200, rewardXP: 150, rewardChakra: 25, requiredLevel: 5, emoji: '⚔️' },
  { id: 'quest_stealth_5', name: 'Shadow Walker', description: 'Complete 5 stealth infiltration missions successfully', type: 'mission', target: 5, rewardCoins: 250, rewardXP: 180, rewardChakra: 30, requiredLevel: 8, emoji: '🌑' },
  { id: 'quest_train_30', name: 'Dedicated Disciple', description: 'Complete 30 training sessions total', type: 'train', target: 30, rewardCoins: 300, rewardXP: 200, rewardChakra: 40, requiredLevel: 12, emoji: '🏋️' },
  { id: 'quest_learn_15', name: 'Jutsu Master', description: 'Learn 15 jutsu techniques', type: 'learn', target: 15, rewardCoins: 400, rewardXP: 300, rewardChakra: 50, requiredLevel: 18, emoji: '✨' },
  { id: 'quest_master_weapon', name: 'Weapon Specialist', description: 'Fully upgrade any weapon to max level', type: 'master', target: 10, rewardCoins: 350, rewardXP: 250, rewardChakra: 45, requiredLevel: 15, emoji: '⚔️' },
  { id: 'quest_s_rank', name: 'S-Rank Ninja', description: 'Complete an S-Rank mission', type: 'mission', target: 1, rewardCoins: 800, rewardXP: 600, rewardChakra: 80, requiredLevel: 28, emoji: '🌟' },
  { id: 'quest_kage_path', name: 'Path to Kage', description: 'Reach Jonin rank and complete 100 missions', type: 'mission', target: 100, rewardCoins: 1500, rewardXP: 1000, rewardChakra: 150, requiredLevel: 35, emoji: '👑' },
];

export const ND_NPCS: NDNPCDef[] = [
  { id: 'npc_hokage', name: 'Lord Hokage', role: 'Village Leader', description: 'The supreme leader of the Hidden Leaf Village', emoji: '👑', greeting: 'You have the will of fire within you. Prove your worth, young shinobi.' },
  { id: 'npc_sensei', name: 'Team Sensei', role: 'Training Instructor', description: 'Your personal sensei guiding you on the ninja path', emoji: '🪖', greeting: 'A ninja must see underneath the underneath. Let\'s begin training.' },
  { id: 'npc_merchant', name: 'Tenten\'s Armory', role: 'Weapon Merchant', description: 'Sells and upgrades ninja weapons and equipment', emoji: '🏪', greeting: 'Welcome! I have the finest weapons in all five nations.' },
  { id: 'npc_mission_desk', name: 'Shizune', role: 'Mission Assigner', description: 'The mission desk handler who assigns ninja missions', emoji: '📋', greeting: 'We have missions of every rank. Choose one that matches your abilities.' },
  { id: 'npc_clan_elder', name: 'Clan Elder', role: 'Clan Advisor', description: 'Elder of your clan who shares ancient wisdom and techniques', emoji: '🧙', greeting: 'The blood of our ancestors flows through your veins. Honor them.' },
  { id: 'npc_medical_nin', name: 'Sakura', role: 'Medical Ninja', description: 'A skilled medical ninja who can restore your chakra and heal injuries', emoji: '💊', greeting: 'You look exhausted. Let me restore your chakra before you push yourself further.' },
];

export const ND_ACHIEVEMENTS: NDAchievementDef[] = [
  { id: 'ach_first_training', name: 'First Stance', description: 'Complete your first training session', conditionKey: 'completedTrainings', targetValue: 1, rewardCoins: 15, rewardXP: 10, emoji: '🎌' },
  { id: 'ach_training_25', name: 'Disciplined', description: 'Complete 25 training sessions', conditionKey: 'completedTrainings', targetValue: 25, rewardCoins: 100, rewardXP: 75, emoji: '🏋️' },
  { id: 'ach_training_100', name: 'Training Machine', description: 'Complete 100 training sessions', conditionKey: 'completedTrainings', targetValue: 100, rewardCoins: 400, rewardXP: 300, emoji: '🥋' },
  { id: 'ach_first_mission', name: 'Mission Start', description: 'Complete your first mission', conditionKey: 'completedMissions', targetValue: 1, rewardCoins: 20, rewardXP: 15, emoji: '🎯' },
  { id: 'ach_missions_50', name: 'Veteran Operative', description: 'Complete 50 missions', conditionKey: 'completedMissions', targetValue: 50, rewardCoins: 300, rewardXP: 200, emoji: '🎖️' },
  { id: 'ach_defeat_100', name: 'Unstoppable Force', description: 'Defeat 100 enemies in total', conditionKey: 'totalDefeated', targetValue: 100, rewardCoins: 250, rewardXP: 180, emoji: '💥' },
  { id: 'ach_stealth_10', name: 'Phantom Ninja', description: 'Complete 10 stealth infiltrations successfully', conditionKey: 'totalStealthSuccess', targetValue: 10, rewardCoins: 200, rewardXP: 150, emoji: '👻' },
  { id: 'ach_level_10', name: 'Rising Star', description: 'Reach level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 120, rewardXP: 80, emoji: '⭐' },
  { id: 'ach_level_25', name: 'Elite Ninja', description: 'Reach level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 350, rewardXP: 250, emoji: '🌟' },
  { id: 'ach_level_50', name: 'Supreme Kage', description: 'Reach the maximum level', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXP: 1500, emoji: '👑' },
  { id: 'ach_coins_1000', name: 'Wealthy Shinobi', description: 'Earn 1000 coins total', conditionKey: 'totalCoinsEarned', targetValue: 1000, rewardCoins: 150, rewardXP: 100, emoji: '💰' },
  { id: 'ach_coins_10000', name: 'Daimyo Riches', description: 'Earn 10000 coins total', conditionKey: 'totalCoinsEarned', targetValue: 10000, rewardCoins: 1000, rewardXP: 750, emoji: '💎' },
  { id: 'ach_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day daily streak', conditionKey: 'dailyStreak', targetValue: 7, rewardCoins: 200, rewardXP: 120, emoji: '📅' },
  { id: 'ach_streak_30', name: 'Monthly Devotee', description: 'Maintain a 30-day daily streak', conditionKey: 'dailyStreak', targetValue: 30, rewardCoins: 800, rewardXP: 500, emoji: '🗓️' },
  { id: 'ach_learn_all', name: 'Ultimate Arsenal', description: 'Learn all 35 jutsu techniques', conditionKey: 'techniquesMastered', targetValue: 35, rewardCoins: 3000, rewardXP: 2000, emoji: '🏆' },
];

export const ND_DAILY_TASK_POOL: NDDailyTaskPoolDef[] = [
  { id: 'daily_train_3', name: 'Daily Drill', description: 'Complete 3 training sessions today', type: 'train', target: 3, rewardCoins: 30, rewardXP: 20, emoji: '🏋️' },
  { id: 'daily_train_5', name: 'Intensive Training', description: 'Complete 5 training sessions today', type: 'train', target: 5, rewardCoins: 55, rewardXP: 35, emoji: '🔥' },
  { id: 'daily_mission_1', name: 'Quick Mission', description: 'Complete 1 mission today', type: 'mission', target: 1, rewardCoins: 25, rewardXP: 18, emoji: '🎯' },
  { id: 'daily_mission_3', name: 'Busy Ninja', description: 'Complete 3 missions today', type: 'mission', target: 3, rewardCoins: 60, rewardXP: 40, emoji: '⚔️' },
  { id: 'daily_learn_1', name: 'Study Jutsu', description: 'Learn 1 new technique today', type: 'learn', target: 1, rewardCoins: 35, rewardXP: 25, emoji: '📚' },
  { id: 'daily_defeat_10', name: 'Combat Training', description: 'Defeat 10 enemies today', type: 'defeat', target: 10, rewardCoins: 45, rewardXP: 30, emoji: '💥' },
  { id: 'daily_train_8', name: 'Training Marathon', description: 'Complete 8 training sessions today', type: 'train', target: 8, rewardCoins: 90, rewardXP: 55, emoji: '⚡' },
  { id: 'daily_mission_5', name: 'Mission Rush', description: 'Complete 5 missions today', type: 'mission', target: 5, rewardCoins: 100, rewardXP: 65, emoji: '🌟' },
];

// ============================================================
// Initial State Factory
// ============================================================

function ndCreateInitialState(seed?: number): NinjaDojoState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    level: 1,
    xp: 0,
    coins: 100,
    chakra: 50,
    maxChakra: 50,
    rankIndex: 0,
    senseiIndex: 0,
    clanId: null,
    unlockedTechniques: ['basic_throw', 'shadow_clone', 'tree_walk'],
    activeTrainingGround: 'dojo_floor',
    stats: { strength: 5, speed: 5, chakra: 5, stealth: 5, defense: 5 },
    completedTrainings: 0,
    completedMissions: 0,
    totalDefeated: 0,
    totalStealthSuccess: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    totalChakraSpent: 0,
    totalXPEarned: 0,
    dailyStreak: 0,
    lastDaily: null,
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: ND_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    dailyTask: null,
    trainingGrounds: ND_TRAINING_GROUNDS.map((tg) => ({ id: tg.id, level: 1 })),
    weapons: ND_WEAPONS.map((w) => ({ id: w.id, level: 1, equipped: w.id === 'kunai' })),
    seed: effectiveSeed,
    techniqueCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    missionCountByDifficulty: {},
    trainingGroundUpgradeCount: 0,
    weaponUpgradeCount: 0,
    currentSenseiProgress: 0,
    infiltrationAttempts: 0,
    infiltrationSuccesses: 0,
    techniquesMastered: 0,
    clanMissionsCompleted: 0,
  };
}

// ============================================================
// Hook: useNinjaDojo
// ============================================================

export default function useNinjaDojo(initialSeed?: number) {
  const [state, setState] = useState<NinjaDojoState>(() => ndCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // ---- Core State ----

  const ndGetState = useCallback((): Readonly<NinjaDojoState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const ndResetState = useCallback((newSeed?: number) => {
    const s = ndCreateInitialState(newSeed);
    prngRef.current = mulberry32(s.seed);
    setState(s);
  }, []);

  const ndSeed = useCallback((seed: number) => {
    prngRef.current = mulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const ndRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const ndRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const ndRandomChoice = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const ndGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const ndGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const ndGetXPTillNext = useCallback((): number => {
    return ndXpRequiredForLevel(state.level);
  }, [state.level]);

  const ndAddXP = useCallback((amount: number): NinjaDojoState => {
    let next: NinjaDojoState = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < ND_MAX_LEVEL && xp >= ndXpRequiredForLevel(level)) {
        xp -= ndXpRequiredForLevel(level);
        level++;
      }
      if (level > ND_MAX_LEVEL) {
        level = ND_MAX_LEVEL;
        xp = 0;
      }
      const nextLevel = ndClampLevel(level);
      const maxChakra = 50 + (nextLevel - 1) * 10;
      next = {
        ...prev,
        level: nextLevel,
        xp,
        maxChakra,
        totalXPEarned: prev.totalXPEarned + Math.floor(amount),
      };
      return next;
    });
    return next;
  }, [state]);

  // ---- Titles ----

  const ndGetTitle = useCallback((): NDTitleInfo => {
    let current = ND_TITLE_THRESHOLDS[0];
    for (const t of ND_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const ndGetAllTitles = useCallback((): NDTitleInfo[] => {
    return [...ND_TITLE_THRESHOLDS];
  }, []);

  const ndGetNextTitle = useCallback((): NDTitleInfo | null => {
    const current = ndGetTitle();
    const idx = ND_TITLE_THRESHOLDS.indexOf(current);
    if (idx < 0 || idx >= ND_TITLE_THRESHOLDS.length - 1) return null;
    return ND_TITLE_THRESHOLDS[idx + 1];
  }, [ndGetTitle]);

  // ---- Rank ----

  const ndGetRank = useCallback((): NDRankDef => {
    return ND_RANKS[state.rankIndex] ?? ND_RANKS[0];
  }, [state.rankIndex]);

  const ndGetAllRanks = useCallback((): NDRankDef[] => {
    return [...ND_RANKS];
  }, []);

  const ndGetNextRank = useCallback((): NDRankDef | null => {
    if (state.rankIndex >= ND_RANKS.length - 1) return null;
    return ND_RANKS[state.rankIndex + 1];
  }, [state.rankIndex]);

  const ndCheckRankUp = useCallback((): { canRankUp: boolean; current: NDRankDef; next: NDRankDef | null; missionsNeeded: number } => {
    const current = ndGetRank();
    const next = ndGetNextRank();
    if (!next) return { canRankUp: false, current, next: null, missionsNeeded: 0 };
    const canRankUp = state.level >= next.requiredLevel && state.completedMissions >= next.requiredMissions;
    const missionsNeeded = Math.max(0, next.requiredMissions - state.completedMissions);
    return { canRankUp, current, next, missionsNeeded };
  }, [state.level, state.completedMissions, ndGetRank, ndGetNextRank]);

  const ndPromoteRank = useCallback((): { success: boolean; state: NinjaDojoState } => {
    const check = ndCheckRankUp();
    if (!check.canRankUp || !check.next) return { success: false, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      next = { ...prev, rankIndex: prev.rankIndex + 1 };
      return next;
    });
    return { success: true, state: next };
  }, [state, ndCheckRankUp]);

  // ---- Sensei ----

  const ndGetSensei = useCallback((): NDSenseiInfo => {
    let current = ND_SENSEIS[0];
    for (const s of ND_SENSEIS) {
      if (state.level >= s.requiredLevel) current = s;
    }
    return current;
  }, [state.level]);

  const ndGetAllSenseis = useCallback((): NDSenseiInfo[] => {
    return [...ND_SENSEIS];
  }, []);

  const ndGetSenseiProgress = useCallback((): number => {
    return state.currentSenseiProgress;
  }, [state.currentSenseiProgress]);

  const ndAddSenseiProgress = useCallback((amount: number): { sensei: NDSenseiInfo; progress: number; leveledUp: boolean; oldSensei: NDSenseiInfo; newSensei: NDSenseiInfo | null } => {
    const oldSensei = ndGetSensei();
    let leveledUp = false;
    let newSensei: NDSenseiInfo | null = null;
    let next: NinjaDojoState = state;
    setState((prev) => {
      let prog = prev.currentSenseiProgress + Math.floor(amount);
      let current = ND_SENSEIS[0];
      for (const s of ND_SENSEIS) {
        if (prev.level >= s.requiredLevel) current = s;
      }
      const threshold = 100 + current.bonusXP * 5;
      if (prog >= threshold) {
        const currentIdx = ND_SENSEIS.indexOf(current);
        if (currentIdx < ND_SENSEIS.length - 1) {
          prog = 0;
          leveledUp = true;
          newSensei = ND_SENSEIS[currentIdx + 1];
        } else {
          prog = threshold;
        }
      }
      next = { ...prev, currentSenseiProgress: prog };
      return next;
    });
    return { sensei: oldSensei, progress: next.currentSenseiProgress, leveledUp, oldSensei, newSensei };
  }, [state, ndGetSensei]);

  // ---- Coins ----

  const ndGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const ndAddCoins = useCallback((amount: number): NinjaDojoState => {
    let next: NinjaDojoState = state;
    setState((prev) => {
      next = { ...prev, coins: ndClampCoins(prev.coins + amount), totalCoinsEarned: prev.totalCoinsEarned + Math.max(0, Math.floor(amount)) };
      return next;
    });
    return next;
  }, [state]);

  const ndSpendCoins = useCallback((amount: number): { success: boolean; state: NinjaDojoState } => {
    if (state.coins < amount) return { success: false, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      next = { ...prev, coins: ndClampCoins(prev.coins - amount), totalCoinsSpent: prev.totalCoinsSpent + Math.floor(amount) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ndCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Chakra ----

  const ndGetChakra = useCallback((): number => {
    return state.chakra;
  }, [state.chakra]);

  const ndGetMaxChakra = useCallback((): number => {
    let max = state.maxChakra;
    if (state.clanId) {
      const clan = ND_CLANS.find((c) => c.id === state.clanId);
      if (clan && clan.id === 'clan_uzumaki') max = Math.floor(max * 1.2);
    }
    return max;
  }, [state.maxChakra, state.clanId]);

  const ndUseChakra = useCallback((amount: number): { success: boolean; chakraUsed: number; state: NinjaDojoState } => {
    if (state.chakra < amount) return { success: false, chakraUsed: 0, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      next = { ...prev, chakra: prev.chakra - Math.floor(amount), totalChakraSpent: prev.totalChakraSpent + Math.floor(amount) };
      return next;
    });
    return { success: true, chakraUsed: Math.floor(amount), state: next };
  }, [state]);

  const ndRegenChakra = useCallback((amount: number): { chakraRestored: number; state: NinjaDojoState } => {
    let next: NinjaDojoState = state;
    setState((prev) => {
      const max = 50 + (prev.level - 1) * 10;
      const newChakra = Math.min(max, prev.chakra + Math.floor(amount));
      next = { ...prev, chakra: newChakra };
      return next;
    });
    return { chakraRestored: next.chakra - state.chakra, state: next };
  }, [state]);

  const ndRestoreChakra = useCallback((): { chakraRestored: number; cost: number; state: NinjaDojoState } => {
    const cost = 20;
    const maxChakra = 50 + (state.level - 1) * 10;
    if (state.chakra >= maxChakra) return { chakraRestored: 0, cost: 0, state };
    if (state.coins < cost) return { chakraRestored: 0, cost, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      const max = 50 + (prev.level - 1) * 10;
      next = { ...prev, chakra: max, coins: ndClampCoins(prev.coins - cost), totalCoinsSpent: prev.totalCoinsSpent + cost };
      return next;
    });
    return { chakraRestored: next.chakra - state.chakra, cost, state: next };
  }, [state]);

  // ---- Stats ----

  const ndGetStats = useCallback((): Record<NDStat, number> => {
    const baseStats = { ...state.stats };
    if (state.clanId) {
      const clan = ND_CLANS.find((c) => c.id === state.clanId);
      if (clan) {
        baseStats[clan.bonusStat] += clan.bonusValue;
      }
    }
    return baseStats;
  }, [state.stats, state.clanId]);

  const ndGetStat = useCallback((stat: NDStat): number => {
    const stats = ndGetStats();
    return stats[stat];
  }, [ndGetStats]);

  const ndAddStat = useCallback((stat: NDStat, amount: number): NinjaDojoState => {
    let next: NinjaDojoState = state;
    setState((prev) => {
      next = {
        ...prev,
        stats: { ...prev.stats, [stat]: prev.stats[stat] + Math.floor(amount) },
      };
      return next;
    });
    return next;
  }, [state]);

  // ---- Clan ----

  const ndGetClan = useCallback((): NDClanDef | null => {
    if (!state.clanId) return null;
    return ND_CLANS.find((c) => c.id === state.clanId) ?? null;
  }, [state.clanId]);

  const ndGetAllClans = useCallback((): NDClanDef[] => {
    return [...ND_CLANS];
  }, []);

  const ndJoinClan = useCallback((clanId: string): { success: boolean; state: NinjaDojoState } => {
    const clan = ND_CLANS.find((c) => c.id === clanId);
    if (!clan) return { success: false, state };
    if (state.clanId !== null) return { success: false, state };
    if (state.level < 5) return { success: false, state };
    let next: NinjaDojoState = state;
    setState((prev) => ({ ...prev, clanId: clanId }));
    next = { ...next, clanId };
    return { success: true, state: next };
  }, [state]);

  const ndGetClanElement = useCallback((): NDClanElement | null => {
    const clan = ndGetClan();
    return clan?.element ?? null;
  }, [ndGetClan]);

  // ---- Techniques ----

  const ndGetTechniques = useCallback((): NDTechniqueDef[] => {
    return [...ND_TECHNIQUES];
  }, []);

  const ndGetUnlockedTechniques = useCallback((): NDTechniqueDef[] => {
    return ND_TECHNIQUES.filter((t) => state.unlockedTechniques.includes(t.id));
  }, [state.unlockedTechniques]);

  const ndGetLockedTechniques = useCallback((): NDTechniqueDef[] => {
    return ND_TECHNIQUES.filter((t) => !state.unlockedTechniques.includes(t.id));
  }, [state.unlockedTechniques]);

  const ndGetTechniqueById = useCallback((id: string): NDTechniqueDef | undefined => {
    return ND_TECHNIQUES.find((t) => t.id === id);
  }, []);

  const ndIsTechniqueUnlocked = useCallback((id: string): boolean => {
    return state.unlockedTechniques.includes(id);
  }, [state.unlockedTechniques]);

  const ndLearnTechnique = useCallback((techniqueId: string): { success: boolean; cost: number; state: NinjaDojoState } => {
    const tech = ND_TECHNIQUES.find((t) => t.id === techniqueId);
    if (!tech) return { success: false, cost: 0, state };
    if (state.unlockedTechniques.includes(techniqueId)) return { success: false, cost: 0, state };
    if (state.level < tech.requiredLevel) return { success: false, cost: 0, state };
    if (state.rankIndex < tech.requiredRank) return { success: false, cost: 0, state };
    const cost = Math.floor(30 * ndRarityMultiplier(tech.rarity));
    if (state.coins < cost) return { success: false, cost, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      next = {
        ...prev,
        coins: ndClampCoins(prev.coins - cost),
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        unlockedTechniques: [...prev.unlockedTechniques, techniqueId],
        techniqueCountByRarity: { ...prev.techniqueCountByRarity, [tech.rarity]: prev.techniqueCountByRarity[tech.rarity] + 1 },
        techniquesMastered: prev.techniquesMastered + 1,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  const ndGetTechniquesByRarity = useCallback((rarity: NDRarity): NDTechniqueDef[] => {
    return ND_TECHNIQUES.filter((t) => t.rarity === rarity);
  }, []);

  const ndGetTechniquesByElement = useCallback((element: NDClanElement): NDTechniqueDef[] => {
    return ND_TECHNIQUES.filter((t) => t.element === element);
  }, []);

  const ndGetAffordableTechniques = useCallback((): NDTechniqueDef[] => {
    return ND_TECHNIQUES.filter((t) => {
      if (state.unlockedTechniques.includes(t.id)) return false;
      if (state.level < t.requiredLevel) return false;
      if (state.rankIndex < t.requiredRank) return false;
      const cost = Math.floor(30 * ndRarityMultiplier(t.rarity));
      return state.coins >= cost;
    });
  }, [state]);

  // ---- Training Grounds ----

  const ndGetTrainingGrounds = useCallback((): NDTrainingGroundDef[] => {
    return [...ND_TRAINING_GROUNDS];
  }, []);

  const ndGetTrainingGroundStates = useCallback((): NDTrainingGroundState[] => {
    return [...state.trainingGrounds];
  }, [state.trainingGrounds]);

  const ndGetActiveTrainingGround = useCallback((): string => {
    return state.activeTrainingGround;
  }, [state.activeTrainingGround]);

  const ndSetActiveTrainingGround = useCallback((groundId: string): NinjaDojoState => {
    const exists = ND_TRAINING_GROUNDS.some((tg) => tg.id === groundId);
    if (!exists) return state;
    let next: NinjaDojoState = state;
    setState((prev) => ({ ...prev, activeTrainingGround: groundId }));
    next = { ...next, activeTrainingGround: groundId };
    return next;
  }, [state]);

  const ndGetTrainingGroundLevel = useCallback((groundId: string): number => {
    const gs = state.trainingGrounds.find((g) => g.id === groundId);
    return gs?.level ?? 1;
  }, [state.trainingGrounds]);

  const ndGetTrainingGroundXpMultiplier = useCallback((): number => {
    const def = ND_TRAINING_GROUNDS.find((tg) => tg.id === state.activeTrainingGround);
    const gs = state.trainingGrounds.find((g) => g.id === state.activeTrainingGround);
    if (!def || !gs) return 1.0;
    const sensei = ndGetSensei();
    return def.baseXpMultiplier * (1 + (gs.level - 1) * 0.1) * (1 + sensei.bonusXP / 100);
  }, [state.activeTrainingGround, state.trainingGrounds, ndGetSensei]);

  const ndGetTrainingGroundChakraRegen = useCallback((): number => {
    const def = ND_TRAINING_GROUNDS.find((tg) => tg.id === state.activeTrainingGround);
    const gs = state.trainingGrounds.find((g) => g.id === state.activeTrainingGround);
    if (!def || !gs) return 0;
    return def.baseChakraRegen + (gs.level - 1) * 2;
  }, [state.activeTrainingGround, state.trainingGrounds]);

  const ndUpgradeTrainingGround = useCallback((groundId: string): { success: boolean; cost: number; state: NinjaDojoState } => {
    const def = ND_TRAINING_GROUNDS.find((tg) => tg.id === groundId);
    const gs = state.trainingGrounds.find((g) => g.id === groundId);
    if (!def || !gs) return { success: false, cost: 0, state };
    if (gs.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, gs.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      const newGrounds = prev.trainingGrounds.map((g) => g.id === groundId ? { ...g, level: g.level + 1 } : g);
      next = {
        ...prev,
        coins: ndClampCoins(prev.coins - cost),
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        trainingGrounds: newGrounds,
        trainingGroundUpgradeCount: prev.trainingGroundUpgradeCount + 1,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Weapons ----

  const ndGetWeapons = useCallback((): NDWeaponDef[] => {
    return [...ND_WEAPONS];
  }, []);

  const ndGetWeaponStates = useCallback((): NDWeaponState[] => {
    return [...state.weapons];
  }, [state.weapons]);

  const ndGetEquippedWeapon = useCallback((): NDWeaponState | null => {
    return state.weapons.find((w) => w.equipped) ?? null;
  }, [state.weapons]);

  const ndGetWeaponLevel = useCallback((weaponId: string): number => {
    const ws = state.weapons.find((w) => w.id === weaponId);
    return ws?.level ?? 1;
  }, [state.weapons]);

  const ndGetWeaponDamage = useCallback((): number => {
    const equipped = state.weapons.find((w) => w.equipped);
    if (!equipped) return 0;
    const def = ND_WEAPONS.find((w) => w.id === equipped.id);
    if (!def) return 0;
    return def.baseDamage + (equipped.level - 1) * Math.ceil(def.baseDamage * 0.15);
  }, [state.weapons]);

  const ndGetWeaponSpeedBonus = useCallback((): number => {
    const equipped = state.weapons.find((w) => w.equipped);
    if (!equipped) return 0;
    const def = ND_WEAPONS.find((w) => w.id === equipped.id);
    if (!def) return 0;
    return def.baseSpeedBonus + (equipped.level - 1) * 1;
  }, [state.weapons]);

  const ndEquipWeapon = useCallback((weaponId: string): { success: boolean; state: NinjaDojoState } => {
    const def = ND_WEAPONS.find((w) => w.id === weaponId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      const newWeapons = prev.weapons.map((w) => ({ ...w, equipped: w.id === weaponId }));
      next = { ...prev, weapons: newWeapons };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ndUpgradeWeapon = useCallback((weaponId: string): { success: boolean; cost: number; state: NinjaDojoState } => {
    const def = ND_WEAPONS.find((w) => w.id === weaponId);
    const ws = state.weapons.find((w) => w.id === weaponId);
    if (!def || !ws) return { success: false, cost: 0, state };
    if (ws.level >= def.maxLevel) return { success: false, cost: 0, state };
    if (state.level < def.requiredLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.4, ws.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      const newWeapons = prev.weapons.map((w) => w.id === weaponId ? { ...w, level: w.level + 1 } : w);
      next = {
        ...prev,
        coins: ndClampCoins(prev.coins - cost),
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        weapons: newWeapons,
        weaponUpgradeCount: prev.weaponUpgradeCount + 1,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Train ----

  const ndTrain = useCallback((): NDTrainingResult => {
    if (state.chakra < 5) return { xpGained: 0, chakraUsed: 0, chakraRegenerated: 0, statImproved: 'strength', statGain: 0, techniqueLearned: null };
    const def = ND_TRAINING_GROUNDS.find((tg) => tg.id === state.activeTrainingGround);
    const gs = state.trainingGrounds.find((g) => g.id === state.activeTrainingGround);
    const xpMult = ndGetTrainingGroundXpMultiplier();
    const chakraCost = 5 + state.level;
    const chakraRegen = ndGetTrainingGroundChakraRegen();
    const baseXP = 10 + state.level * 2;
    const xpGained = Math.floor(baseXP * xpMult * (1 + prngRef.current() * 0.3));
    const statImproved = def?.statFocus ?? 'strength';
    const statGain = Math.floor((1 + prngRef.current() * 2) * (gs ? (1 + (gs.level - 1) * 0.15) : 1));
    let techniqueLearned: string | null = null;
    if (prngRef.current() < 0.08) {
      const locked = ND_TECHNIQUES.filter(
        (t) =>
          !state.unlockedTechniques.includes(t.id) &&
          t.requiredLevel <= state.level &&
          t.requiredRank <= state.rankIndex,
      );
      if (locked.length > 0) {
        techniqueLearned = locked[Math.floor(prngRef.current() * locked.length)].id;
      }
    }
    let next: NinjaDojoState = state;
    setState((prev) => {
      let { level, xp } = prev;
      const newXp = xp + xpGained;
      while (level < ND_MAX_LEVEL && newXp >= ndXpRequiredForLevel(level)) {
        xp -= ndXpRequiredForLevel(level);
        level++;
      }
      if (level >= ND_MAX_LEVEL) { level = ND_MAX_LEVEL; xp = 0; } else { xp = newXp; }
      const maxChakra = 50 + (level - 1) * 10;
      const newChakra = Math.min(maxChakra, prev.chakra - chakraCost + chakraRegen);
      const newUnlocked = techniqueLearned && !prev.unlockedTechniques.includes(techniqueLearned)
        ? [...prev.unlockedTechniques, techniqueLearned]
        : prev.unlockedTechniques;
      const techDef = techniqueLearned ? ND_TECHNIQUES.find((t) => t.id === techniqueLearned) : null;
      const newRarityCount = techDef ? { ...prev.techniqueCountByRarity, [techDef.rarity]: prev.techniqueCountByRarity[techDef.rarity] + 1 } : prev.techniqueCountByRarity;
      const newMastered = techniqueLearned ? prev.techniquesMastered + 1 : prev.techniquesMastered;
      next = {
        ...prev,
        level: ndClampLevel(level),
        xp,
        chakra: newChakra,
        maxChakra,
        stats: { ...prev.stats, [statImproved]: prev.stats[statImproved] + statGain },
        completedTrainings: prev.completedTrainings + 1,
        totalChakraSpent: prev.totalChakraSpent + chakraCost,
        totalXPEarned: prev.totalXPEarned + xpGained,
        unlockedTechniques: newUnlocked,
        techniqueCountByRarity: newRarityCount,
        techniquesMastered: newMastered,
        currentSenseiProgress: prev.currentSenseiProgress + 1,
      };
      return next;
    });
    return { xpGained, chakraUsed: chakraCost, chakraRegenerated: chakraRegen, statImproved, statGain, techniqueLearned };
  }, [state, ndGetTrainingGroundXpMultiplier, ndGetTrainingGroundChakraRegen]);

  // ---- Missions ----

  const ndGetMissions = useCallback((): NDMissionDef[] => {
    return [...ND_MISSIONS];
  }, []);

  const ndGetAvailableMissions = useCallback((): NDMissionDef[] => {
    return ND_MISSIONS.filter(
      (m) => state.level >= m.requiredLevel && state.rankIndex >= m.requiredRank,
    );
  }, [state.level, state.rankIndex]);

  const ndGetMissionsByDifficulty = useCallback((difficulty: number): NDMissionDef[] => {
    return ND_MISSIONS.filter((m) => m.difficulty === difficulty);
  }, []);

  const ndGetStealthMissions = useCallback((): NDMissionDef[] => {
    return ND_MISSIONS.filter((m) => m.isStealth && state.level >= m.requiredLevel && state.rankIndex >= m.requiredRank);
  }, [state.level, state.rankIndex]);

  const ndGetMissionsByType = useCallback((type: string): NDMissionDef[] => {
    return ND_MISSIONS.filter((m) => m.type === type);
  }, []);

  const ndStartMission = useCallback((missionId: string): { success: boolean; mission: NDMissionDef | null; result: NDMissionResult | null; state: NinjaDojoState } => {
    const mission = ND_MISSIONS.find((m) => m.id === missionId);
    if (!mission) return { success: false, mission: null, result: null, state };
    if (state.level < mission.requiredLevel) return { success: false, mission, result: null, state };
    if (state.rankIndex < mission.requiredRank) return { success: false, mission, result: null, state };
    if (state.chakra < 10) return { success: false, mission, result: null, state };
    const roll = prngRef.current();
    const statBonus = (state.stats[mission.isStealth ? 'stealth' : 'strength'] + state.level) / 100;
    const weaponBonus = ndGetWeaponDamage() / 200;
    const successChance = Math.min(0.95, 0.4 + roll * 0.3 + statBonus + weaponBonus);
    const success = roll < successChance;
    const diffMultiplier = mission.difficulty;
    const rankMultiplier = 1 + state.rankIndex * 0.3;
    const rewardCoins = success ? Math.floor(mission.baseRewardCoins * rankMultiplier * (0.8 + roll * 0.4)) : 0;
    const rewardXP = success ? Math.floor(mission.baseRewardXP * rankMultiplier * (0.8 + roll * 0.4)) : Math.floor(mission.baseRewardXP * 0.1);
    const rewardChakra = success ? Math.floor(mission.baseRewardChakra * rankMultiplier) : 0;
    const enemiesDefeated = success ? ndRandomInt(1, diffMultiplier * 3) : 0;
    let next: NinjaDojoState = state;
    setState((prev) => {
      let { level, xp, chakra } = prev;
      const newXp = xp + rewardXP;
      while (level < ND_MAX_LEVEL && newXp >= ndXpRequiredForLevel(level)) {
        xp -= ndXpRequiredForLevel(level);
        level++;
      }
      if (level >= ND_MAX_LEVEL) { level = ND_MAX_LEVEL; xp = 0; } else { xp = newXp; }
      const maxChakra = 50 + (level - 1) * 10;
      chakra = Math.min(maxChakra, chakra - 10 + rewardChakra);
      const newDiffCount = { ...prev.missionCountByDifficulty };
      newDiffCount[mission.difficulty] = (newDiffCount[mission.difficulty] ?? 0) + 1;
      next = {
        ...prev,
        level: ndClampLevel(level),
        xp,
        chakra,
        maxChakra,
        coins: ndClampCoins(prev.coins + rewardCoins),
        completedMissions: prev.completedMissions + (success ? 1 : 0),
        totalDefeated: prev.totalDefeated + enemiesDefeated,
        totalStealthSuccess: prev.totalStealthSuccess + (success && mission.isStealth ? 1 : 0),
        totalCoinsEarned: prev.totalCoinsEarned + rewardCoins,
        totalChakraSpent: prev.totalChakraSpent + 10,
        totalXPEarned: prev.totalXPEarned + rewardXP,
        missionCountByDifficulty: newDiffCount,
        clanMissionsCompleted: prev.clanMissionsCompleted + (success ? 1 : 0),
      };
      return next;
    });
    const result: NDMissionResult = {
      success,
      rewardCoins,
      rewardXP,
      rewardChakra,
      techniquesUsed: ndRandomInt(1, 3),
      enemiesDefeated,
      wasStealth: mission.isStealth,
    };
    return { success: true, mission, result, state: next };
  }, [state, ndGetWeaponDamage, ndRandomInt]);

  // ---- Stealth Infiltration ----

  const ndStartInfiltration = useCallback((): NDInfiltrationResult => {
    if (state.chakra < 15) return { success: false, rewardCoins: 0, rewardXP: 0, stealthScore: 0, enemiesAvoided: 0, trapsDisarmed: 0 };
    const stealthStat = state.stats.stealth + ndGetWeaponSpeedBonus();
    const roll = prngRef.current();
    const successChance = Math.min(0.9, 0.3 + stealthStat / 50 + roll * 0.2);
    const success = roll < successChance;
    const stealthScore = Math.floor(stealthStat * (0.5 + prngRef.current() * 0.5));
    const enemiesAvoided = ndRandomInt(2, 8);
    const trapsDisarmed = ndRandomInt(1, 5);
    const rewardCoins = success ? Math.floor((30 + state.level * 5) * (0.8 + prngRef.current() * 0.4)) : 0;
    const rewardXP = success ? Math.floor((20 + state.level * 3) * (0.8 + prngRef.current() * 0.4)) : Math.floor(5 + state.level);
    let next: NinjaDojoState = state;
    setState((prev) => {
      let { level, xp, chakra } = prev;
      const newXp = xp + rewardXP;
      while (level < ND_MAX_LEVEL && newXp >= ndXpRequiredForLevel(level)) {
        xp -= ndXpRequiredForLevel(level);
        level++;
      }
      if (level >= ND_MAX_LEVEL) { level = ND_MAX_LEVEL; xp = 0; } else { xp = newXp; }
      const maxChakra = 50 + (level - 1) * 10;
      chakra = Math.max(0, chakra - 15);
      next = {
        ...prev,
        level: ndClampLevel(level),
        xp,
        chakra,
        maxChakra,
        coins: ndClampCoins(prev.coins + rewardCoins),
        completedMissions: prev.completedMissions + (success ? 1 : 0),
        totalStealthSuccess: prev.totalStealthSuccess + (success ? 1 : 0),
        totalCoinsEarned: prev.totalCoinsEarned + rewardCoins,
        totalChakraSpent: prev.totalChakraSpent + 15,
        totalXPEarned: prev.totalXPEarned + rewardXP,
        infiltrationAttempts: prev.infiltrationAttempts + 1,
        infiltrationSuccesses: prev.infiltrationSuccesses + (success ? 1 : 0),
      };
      return next;
    });
    return { success, rewardCoins, rewardXP, stealthScore, enemiesAvoided, trapsDisarmed };
  }, [state, ndGetWeaponSpeedBonus, ndRandomInt]);

  // ---- Quests ----

  const ndGetQuests = useCallback((): NDQuestDef[] => {
    return [...ND_QUESTS];
  }, []);

  const ndGetActiveQuests = useCallback((): (NDQuestState & NDQuestDef)[] => {
    return state.activeQuests.map((q) => {
      const def = ND_QUESTS.find((qd) => qd.id === q.id);
      if (!def) return { ...q, name: '', description: '', type: 'train' as NDQuestType, target: 0, rewardCoins: 0, rewardXP: 0, rewardChakra: 0, requiredLevel: 0, emoji: '' };
      return { ...q, ...def };
    });
  }, [state.activeQuests]);

  const ndGetAvailableQuests = useCallback((): NDQuestDef[] => {
    return ND_QUESTS.filter(
      (q) =>
        state.level >= q.requiredLevel &&
        !state.activeQuests.some((aq) => aq.id === q.id) &&
        !state.completedQuests.includes(q.id),
    );
  }, [state.level, state.activeQuests, state.completedQuests]);

  const ndGetCompletedQuests = useCallback((): string[] => {
    return [...state.completedQuests];
  }, [state.completedQuests]);

  const ndAcceptQuest = useCallback((questId: string): { success: boolean; state: NinjaDojoState } => {
    const def = ND_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.activeQuests.some((q) => q.id === questId)) return { success: false, state };
    if (state.completedQuests.includes(questId)) return { success: false, state };
    if (state.activeQuests.length >= 5) return { success: false, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      next = { ...prev, activeQuests: [...prev.activeQuests, { id: questId, accepted: true, completed: false, progress: 0 }] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ndGetQuestProgress = useCallback((): { questId: string; progress: number; target: number }[] => {
    return state.activeQuests.map((q) => {
      const def = ND_QUESTS.find((qd) => qd.id === q.id);
      return { questId: q.id, progress: q.progress, target: def?.target ?? 0 };
    });
  }, [state.activeQuests]);

  const ndIncrementQuestProgress = useCallback((type: NDQuestType, amount: number): NinjaDojoState => {
    let next: NinjaDojoState = state;
    setState((prev) => {
      const newQuests = prev.activeQuests.map((q) => {
        const def = ND_QUESTS.find((qd) => qd.id === q.id);
        if (!def || q.completed) return q;
        if (def.type !== type) return q;
        const newProgress = Math.min(def.target, q.progress + amount);
        return { ...q, progress: newProgress, completed: newProgress >= def.target };
      });
      next = { ...prev, activeQuests: newQuests };
      return next;
    });
    return next;
  }, [state]);

  const ndCompleteQuest = useCallback((questId: string): { success: boolean; rewardCoins: number; rewardXP: number; rewardChakra: number; state: NinjaDojoState } => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    if (!aq || !aq.completed) return { success: false, rewardCoins: 0, rewardXP: 0, rewardChakra: 0, state };
    const def = ND_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, rewardCoins: 0, rewardXP: 0, rewardChakra: 0, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      let { level, xp, chakra } = prev;
      const newXp = xp + def.rewardXP;
      while (level < ND_MAX_LEVEL && newXp >= ndXpRequiredForLevel(level)) {
        xp -= ndXpRequiredForLevel(level);
        level++;
      }
      if (level >= ND_MAX_LEVEL) { level = ND_MAX_LEVEL; xp = 0; } else { xp = newXp; }
      const maxChakra = 50 + (level - 1) * 10;
      next = {
        ...prev,
        level: ndClampLevel(level),
        xp,
        coins: ndClampCoins(prev.coins + def.rewardCoins),
        chakra: Math.min(maxChakra, chakra + def.rewardChakra),
        maxChakra,
        totalCoinsEarned: prev.totalCoinsEarned + def.rewardCoins,
        totalXPEarned: prev.totalXPEarned + def.rewardXP,
        activeQuests: prev.activeQuests.filter((q) => q.id !== questId),
        completedQuests: [...prev.completedQuests, questId],
      };
      return next;
    });
    return { success: true, rewardCoins: def.rewardCoins, rewardXP: def.rewardXP, rewardChakra: def.rewardChakra, state: next };
  }, [state]);

  const ndAbandonQuest = useCallback((questId: string): { success: boolean; state: NinjaDojoState } => {
    const idx = state.activeQuests.findIndex((q) => q.id === questId);
    if (idx === -1) return { success: false, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      next = { ...prev, activeQuests: prev.activeQuests.filter((q) => q.id !== questId) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const ndGetAchievements = useCallback((): NDAchievementDef[] => {
    return [...ND_ACHIEVEMENTS];
  }, []);

  const ndGetUnlockedAchievements = useCallback((): NDAchievementDef[] => {
    return ND_ACHIEVEMENTS.filter((a) => state.unlockedAchievements.some((s) => s.id === a.id && s.unlocked));
  }, [state.unlockedAchievements]);

  const ndIsAchievementUnlocked = useCallback((id: string): boolean => {
    return state.unlockedAchievements.some((a) => a.id === id && a.unlocked);
  }, [state.unlockedAchievements]);

  const ndCheckAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    const values: Record<string, number> = {
      completedTrainings: state.completedTrainings,
      completedMissions: state.completedMissions,
      totalDefeated: state.totalDefeated,
      totalStealthSuccess: state.totalStealthSuccess,
      level: state.level,
      totalCoinsEarned: state.totalCoinsEarned,
      dailyStreak: state.dailyStreak,
      techniquesMastered: state.techniquesMastered,
    };
    for (const ach of ND_ACHIEVEMENTS) {
      const current = state.unlockedAchievements.find((a) => a.id === ach.id);
      if (current?.unlocked) continue;
      const value = values[ach.conditionKey] ?? 0;
      if (value >= ach.targetValue) {
        newlyUnlocked.push(ach.id);
      }
    }
    return newlyUnlocked;
  }, [state]);

  const ndUnlockAchievement = useCallback((achievementId: string): { success: boolean; state: NinjaDojoState } => {
    const ach = ND_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return { success: false, state };
    const current = state.unlockedAchievements.find((a) => a.id === achievementId);
    if (current?.unlocked) return { success: false, state };
    let next: NinjaDojoState = state;
    setState((prev) => {
      let { level, xp } = prev;
      const newXp = xp + ach.rewardXP;
      while (level < ND_MAX_LEVEL && newXp >= ndXpRequiredForLevel(level)) {
        xp -= ndXpRequiredForLevel(level);
        level++;
      }
      if (level >= ND_MAX_LEVEL) { level = ND_MAX_LEVEL; xp = 0; } else { xp = newXp; }
      const newAch = prev.unlockedAchievements.map((a) =>
        a.id === achievementId ? { ...a, unlocked: true, unlockedAt: Date.now() } : a,
      );
      next = {
        ...prev,
        level: ndClampLevel(level),
        xp,
        coins: ndClampCoins(prev.coins + ach.rewardCoins),
        totalCoinsEarned: prev.totalCoinsEarned + ach.rewardCoins,
        totalXPEarned: prev.totalXPEarned + ach.rewardXP,
        unlockedAchievements: newAch,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Daily Task ----

  const ndGetDailyTask = useCallback((): NDDailyTaskPoolDef | null => {
    if (!state.dailyTask) return null;
    return ND_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId) ?? null;
  }, [state.dailyTask]);

  const ndRefreshDailyTask = useCallback((): { dailyTask: NDDailyTaskPoolDef | null; state: NinjaDojoState } => {
    const now = Date.now();
    const dayKey = ndGenerateDayKey(now);
    let next: NinjaDojoState = state;
    setState((prev) => {
      if (prev.dailyTask && prev.dailyTask.dayKey === dayKey && !prev.dailyTask.claimed) {
        next = prev;
        return prev;
      }
      const streak = prev.lastDaily === ndGenerateDayKey(now - 86400000) ? prev.dailyStreak + 1 : 1;
      const pool = ND_DAILY_TASK_POOL[Math.floor(prngRef.current() * ND_DAILY_TASK_POOL.length)];
      next = {
        ...prev,
        dailyTask: { poolId: pool.id, progress: 0, claimed: false, dayKey },
        dailyStreak: streak,
        lastDaily: dayKey,
      };
      return next;
    });
    const task = ND_DAILY_TASK_POOL.find((d) => d.id === next.dailyTask?.poolId) ?? null;
    return { dailyTask: task, state: next };
  }, [state]);

  const ndIncrementDailyProgress = useCallback((type: NDDailyType, amount: number): NinjaDojoState => {
    if (!state.dailyTask || state.dailyTask.claimed) return state;
    const poolDef = ND_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
    if (!poolDef || poolDef.type !== type) return state;
    let next: NinjaDojoState = state;
    setState((prev) => {
      if (!prev.dailyTask) return prev;
      const newProgress = Math.min(poolDef.target, prev.dailyTask.progress + amount);
      next = { ...prev, dailyTask: { ...prev.dailyTask, progress: newProgress } };
      return next;
    });
    return next;
  }, [state]);

  const ndClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: NinjaDojoState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = ND_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const streakBonus = 1 + state.dailyStreak * 0.05;
    const rewardCoins = Math.floor(poolDef.rewardCoins * streakBonus);
    const rewardXP = Math.floor(poolDef.rewardXP * streakBonus);
    let next: NinjaDojoState = state;
    setState((prev) => {
      let { level, xp } = prev;
      const newXp = xp + rewardXP;
      while (level < ND_MAX_LEVEL && newXp >= ndXpRequiredForLevel(level)) {
        xp -= ndXpRequiredForLevel(level);
        level++;
      }
      if (level >= ND_MAX_LEVEL) { level = ND_MAX_LEVEL; xp = 0; } else { xp = newXp; }
      next = {
        ...prev,
        level: ndClampLevel(level),
        xp,
        coins: ndClampCoins(prev.coins + rewardCoins),
        totalCoinsEarned: prev.totalCoinsEarned + rewardCoins,
        totalXPEarned: prev.totalXPEarned + rewardXP,
        dailyTask: prev.dailyTask ? { ...prev.dailyTask, claimed: true } : null,
      };
      return next;
    });
    return { success: true, rewardCoins, rewardXP, state: next };
  }, [state]);

  const ndGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const ndGetLastDaily = useCallback((): string | null => {
    return state.lastDaily;
  }, [state.lastDaily]);

  // ---- NPCs ----

  const ndGetNPCs = useCallback((): NDNPCDef[] => {
    return [...ND_NPCS];
  }, []);

  const ndGetNPCById = useCallback((id: string): NDNPCDef | undefined => {
    return ND_NPCS.find((n) => n.id === id);
  }, []);

  // ---- Rarity ----

  const ndGetRarityInfo = useCallback((): NDRarityInfo[] => {
    return [...ND_RARITIES];
  }, []);

  const ndGetRarityByKey = useCallback((key: NDRarity): NDRarityInfo | undefined => {
    return ND_RARITIES.find((r) => r.key === key);
  }, []);

  // ---- Progress ----

  const ndGetProgress = useCallback((): { level: number; xp: number; xpNeeded: number; percent: number } => {
    const needed = ndXpRequiredForLevel(state.level);
    return { level: state.level, xp: state.xp, xpNeeded: needed, percent: needed > 0 ? Math.min(100, (state.xp / needed) * 100) : 100 };
  }, [state.level, state.xp]);

  const ndGetOverallProgress = useCallback((): { levelProgress: number; techniqueProgress: number; missionProgress: number; achievementProgress: number; overallScore: number } => {
    const levelProgress = state.level / ND_MAX_LEVEL;
    const techniqueProgress = state.unlockedTechniques.length / ND_TECHNIQUES.length;
    const missionProgress = Math.min(1, state.completedMissions / 200);
    const achievementProgress = state.unlockedAchievements.filter((a) => a.unlocked).length / ND_ACHIEVEMENTS.length;
    const overallScore = (levelProgress * 0.3 + techniqueProgress * 0.25 + missionProgress * 0.25 + achievementProgress * 0.2) * 100;
    return {
      levelProgress: Math.round(levelProgress * 100) / 100,
      techniqueProgress: Math.round(techniqueProgress * 100) / 100,
      missionProgress: Math.round(missionProgress * 100) / 100,
      achievementProgress: Math.round(achievementProgress * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100,
    };
  }, [state.level, state.unlockedTechniques, state.completedMissions, state.unlockedAchievements]);

  // ---- Stats / Info ----

  const ndGetStatsOverview = useCallback((): {
    totalTrainings: number;
    totalMissions: number;
    totalDefeated: number;
    totalStealthSuccess: number;
    totalCoinsEarned: number;
    totalChakraSpent: number;
    totalXPEarned: number;
    infiltrationRate: number;
    techniquesLearned: number;
    rankName: string;
    clanName: string | null;
    senseiName: string;
    title: string;
  } => {
    const rank = ndGetRank();
    const clan = ndGetClan();
    const sensei = ndGetSensei();
    const title = ndGetTitle();
    return {
      totalTrainings: state.completedTrainings,
      totalMissions: state.completedMissions,
      totalDefeated: state.totalDefeated,
      totalStealthSuccess: state.totalStealthSuccess,
      totalCoinsEarned: state.totalCoinsEarned,
      totalChakraSpent: state.totalChakraSpent,
      totalXPEarned: state.totalXPEarned,
      infiltrationRate: state.infiltrationAttempts > 0 ? state.infiltrationSuccesses / state.infiltrationAttempts : 0,
      techniquesLearned: state.techniquesMastered,
      rankName: rank.name,
      clanName: clan?.name ?? null,
      senseiName: sensei.name,
      title: title.name,
    };
  }, [state, ndGetRank, ndGetClan, ndGetSensei, ndGetTitle]);

  const ndGetChakraInfo = useCallback((): { current: number; max: number; percent: number; isLow: boolean; regenRate: number } => {
    const max = ndGetMaxChakra();
    const percent = max > 0 ? (state.chakra / max) * 100 : 0;
    const regenRate = ndGetTrainingGroundChakraRegen();
    return { current: state.chakra, max, percent, isLow: percent < 20, regenRate };
  }, [state.chakra, ndGetMaxChakra, ndGetTrainingGroundChakraRegen]);

  const ndGetBattlePower = useCallback((): number => {
    const stats = ndGetStats();
    const weaponDmg = ndGetWeaponDamage();
    const techniqueBonus = state.unlockedTechniques.length * 3;
    const rankBonus = state.rankIndex * 20;
    const levelBonus = state.level * 2;
    return Math.floor(
      stats.strength * 2 +
      stats.speed * 1.5 +
      stats.chakra * 1.5 +
      stats.defense +
      stats.stealth +
      weaponDmg +
      techniqueBonus +
      rankBonus +
      levelBonus,
    );
  }, [state.stats, state.unlockedTechniques.length, state.rankIndex, state.level, ndGetStats, ndGetWeaponDamage]);

  // ---- Extended Utilities ----

  const ndGetRecommendedTraining = useCallback((): NDTrainingGroundDef => {
    const lowestStat = (Object.entries(state.stats) as [NDStat, number][]).reduce((a, b) => (a[1] < b[1] ? a : b));
    const matching = ND_TRAINING_GROUNDS.find((tg) => tg.statFocus === lowestStat[0]);
    return matching ?? ND_TRAINING_GROUNDS[0];
  }, [state.stats]);

  const ndGetRecommendedMissions = useCallback((): NDMissionDef[] => {
    const available = ND_MISSIONS.filter(
      (m) => state.level >= m.requiredLevel && state.rankIndex >= m.requiredRank,
    );
    const highReward = available
      .filter((m) => state.level >= m.requiredLevel + 3)
      .sort((a, b) => (b.baseRewardCoins + b.baseRewardXP) - (a.baseRewardCoins + a.baseRewardXP));
    return highReward.length > 0 ? highReward.slice(0, 3) : available.slice(0, 3);
  }, [state.level, state.rankIndex]);

  const ndGetNinjaSummary = useCallback((): {
    name: string;
    title: NDTitleInfo;
    rank: NDRankDef;
    level: number;
    battlePower: number;
    chakra: number;
    maxChakra: number;
    coins: number;
    techniques: number;
    completedMissions: number;
    clan: string | null;
  } => {
    return {
      name: 'Shinobi',
      title: ndGetTitle(),
      rank: ndGetRank(),
      level: state.level,
      battlePower: ndGetBattlePower(),
      chakra: state.chakra,
      maxChakra: ndGetMaxChakra(),
      coins: state.coins,
      techniques: state.unlockedTechniques.length,
      completedMissions: state.completedMissions,
      clan: state.clanId,
    };
  }, [state, ndGetTitle, ndGetRank, ndGetBattlePower, ndGetMaxChakra]);

  const ndGetNinjaTips = useCallback((): string[] => {
    const tips: string[] = [];
    if (state.chakra < 20) tips.push('💡 Visit the Medical Ninja to restore your chakra.');
    if (state.clanId === null && state.level >= 5) tips.push('💡 You can now join a clan to gain powerful passive bonuses!');
    if (state.unlockedTechniques.length < 5) tips.push('💡 Learn more techniques to increase your battle power.');
    const rankCheck = ndCheckRankUp();
    if (rankCheck.next && rankCheck.missionsNeeded > 0) tips.push(`💡 Complete ${rankCheck.missionsNeeded} more missions to rank up to ${rankCheck.next.name}.`);
    if (state.weapons.every((w) => w.level === 1)) tips.push('💡 Upgrade your weapon to increase your combat effectiveness.');
    if (state.dailyTask && !state.dailyTask.claimed && state.dailyTask.progress >= (ND_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId)?.target ?? 0)) {
      tips.push('💡 Claim your daily task reward!');
    }
    if (ndCheckAchievements().length > 0) tips.push('💡 You have new achievements to unlock!');
    if (tips.length === 0) tips.push('🗡️ Keep training and completing missions to grow stronger!');
    return tips;
  }, [state, ndCheckRankUp, ndCheckAchievements]);

  const ndGetTechniqueLearnCost = useCallback((): Record<NDRarity, number> => {
    return {
      common: Math.floor(30 * ndRarityMultiplier('common')),
      uncommon: Math.floor(30 * ndRarityMultiplier('uncommon')),
      rare: Math.floor(30 * ndRarityMultiplier('rare')),
      epic: Math.floor(30 * ndRarityMultiplier('epic')),
      legendary: Math.floor(30 * ndRarityMultiplier('legendary')),
    };
  }, []);

  const ndGetMissionSuccessChance = useCallback((missionId: string): number => {
    const mission = ND_MISSIONS.find((m) => m.id === missionId);
    if (!mission) return 0;
    if (state.level < mission.requiredLevel) return 0;
    if (state.rankIndex < mission.requiredRank) return 0;
    const statBonus = (state.stats[mission.isStealth ? 'stealth' : 'strength'] + state.level) / 100;
    const weaponBonus = ndGetWeaponDamage() / 200;
    return Math.min(0.95, 0.55 + statBonus + weaponBonus);
  }, [state.level, state.rankIndex, state.stats, ndGetWeaponDamage]);

  const ndGetClanBonus = useCallback((): { stat: NDStat; value: number; ability: string } | null => {
    const clan = ndGetClan();
    if (!clan) return null;
    return { stat: clan.bonusStat, value: clan.bonusValue, ability: clan.passiveAbility };
  }, [ndGetClan]);

  const ndGetAllElements = useCallback((): NDClanElement[] => {
    return ['fire', 'water', 'earth', 'wind', 'lightning', 'shadow'];
  }, []);

  const ndGetAllStats = useCallback((): NDStat[] => {
    return ['strength', 'speed', 'chakra', 'stealth', 'defense'];
  }, []);

  // ============================================================
  // Return all functions
  // ============================================================

  return {
    // -- Core --
    ndGetState,
    ndResetState,
    ndSeed,
    ndRandom,
    ndRandomInt,
    ndRandomChoice,
    // -- Level / XP --
    ndGetLevel,
    ndGetXP,
    ndGetXPTillNext,
    ndAddXP,
    // -- Titles --
    ndGetTitle,
    ndGetAllTitles,
    ndGetNextTitle,
    // -- Rank --
    ndGetRank,
    ndGetAllRanks,
    ndGetNextRank,
    ndCheckRankUp,
    ndPromoteRank,
    // -- Sensei --
    ndGetSensei,
    ndGetAllSenseis,
    ndGetSenseiProgress,
    ndAddSenseiProgress,
    // -- Coins --
    ndGetCoins,
    ndAddCoins,
    ndSpendCoins,
    ndCanAfford,
    // -- Chakra --
    ndGetChakra,
    ndGetMaxChakra,
    ndUseChakra,
    ndRegenChakra,
    ndRestoreChakra,
    // -- Stats --
    ndGetStats,
    ndGetStat,
    ndAddStat,
    ndGetAllStats,
    // -- Clan --
    ndGetClan,
    ndGetAllClans,
    ndJoinClan,
    ndGetClanElement,
    ndGetClanBonus,
    ndGetAllElements,
    // -- Techniques --
    ndGetTechniques,
    ndGetUnlockedTechniques,
    ndGetLockedTechniques,
    ndGetTechniqueById,
    ndIsTechniqueUnlocked,
    ndLearnTechnique,
    ndGetTechniquesByRarity,
    ndGetTechniquesByElement,
    ndGetAffordableTechniques,
    ndGetTechniqueLearnCost,
    // -- Training Grounds --
    ndGetTrainingGrounds,
    ndGetTrainingGroundStates,
    ndGetActiveTrainingGround,
    ndSetActiveTrainingGround,
    ndGetTrainingGroundLevel,
    ndGetTrainingGroundXpMultiplier,
    ndGetTrainingGroundChakraRegen,
    ndUpgradeTrainingGround,
    // -- Weapons --
    ndGetWeapons,
    ndGetWeaponStates,
    ndGetEquippedWeapon,
    ndGetWeaponLevel,
    ndGetWeaponDamage,
    ndGetWeaponSpeedBonus,
    ndEquipWeapon,
    ndUpgradeWeapon,
    // -- Training --
    ndTrain,
    // -- Missions --
    ndGetMissions,
    ndGetAvailableMissions,
    ndGetMissionsByDifficulty,
    ndGetStealthMissions,
    ndGetMissionsByType,
    ndStartMission,
    ndGetMissionSuccessChance,
    // -- Stealth --
    ndStartInfiltration,
    // -- Quests --
    ndGetQuests,
    ndGetActiveQuests,
    ndGetAvailableQuests,
    ndGetCompletedQuests,
    ndAcceptQuest,
    ndGetQuestProgress,
    ndIncrementQuestProgress,
    ndCompleteQuest,
    ndAbandonQuest,
    // -- Achievements --
    ndGetAchievements,
    ndGetUnlockedAchievements,
    ndIsAchievementUnlocked,
    ndCheckAchievements,
    ndUnlockAchievement,
    // -- Daily --
    ndGetDailyTask,
    ndRefreshDailyTask,
    ndIncrementDailyProgress,
    ndClaimDailyReward,
    ndGetDailyStreak,
    ndGetLastDaily,
    // -- NPCs --
    ndGetNPCs,
    ndGetNPCById,
    // -- Rarity --
    ndGetRarityInfo,
    ndGetRarityByKey,
    // -- Progress --
    ndGetProgress,
    ndGetOverallProgress,
    // -- Stats / Info --
    ndGetStatsOverview,
    ndGetChakraInfo,
    ndGetBattlePower,
    // -- Extended --
    ndGetRecommendedTraining,
    ndGetRecommendedMissions,
    ndGetNinjaSummary,
    ndGetNinjaTips,
    ndHashString,
  };
}
