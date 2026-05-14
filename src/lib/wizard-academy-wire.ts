import { useState, useCallback, useRef } from 'react';

// ============================================================
// Wizard Academy — Magic School Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type WZRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type WZSpellSchool = 'elemental' | 'dark_arts' | 'healing' | 'enchantment' | 'divination' | 'conjuration' | 'illusion' | 'abjuration';
export type WZMasteryLevel = 'learned' | 'practiced' | 'mastered' | 'grandmaster';
export type WZQuestType = 'cast' | 'learn' | 'duel' | 'attend' | 'discover';
export type WZDailyType = 'cast' | 'learn' | 'duel' | 'attend';

export interface WZSpellDef {
  id: string;
  name: string;
  school: WZSpellSchool;
  rarity: WZRarity;
  manaCost: number;
  damage: number;
  healing: number;
  shield: number;
  duration: number;
  effectDescription: string;
  requiredLevel: number;
  masteryXpToLearn: number;
  masteryXpToPractice: number;
  masteryXpToMaster: number;
  masteryXpToGrandmaster: number;
  emoji: string;
}

export interface WZMagicClassDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  spellIds: string[];
  requiredLevel: number;
  xpReward: number;
  coinReward: number;
  professorId: string;
  roomId: string;
}

export interface WZRoomDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAtLevel: number;
}

export interface WZCreatureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: WZRarity;
  bonusType: 'mana_regen' | 'spell_power' | 'luck' | 'defense' | 'xp_boost';
  bonusValue: number;
  requiredLevel: number;
}

export interface WZProfessorDef {
  id: string;
  name: string;
  title: string;
  teachingStyle: string;
  description: string;
  emoji: string;
  favoredSchool: WZSpellSchool;
}

export interface WZHouseDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  colors: string;
  trait: string;
}

export interface WZQuestDef {
  id: string;
  name: string;
  description: string;
  type: WZQuestType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  rewardHousePoints: number;
  requiredLevel: number;
  emoji: string;
}

export interface WZNPCDef {
  id: string;
  name: string;
  role: string;
  description: string;
  emoji: string;
  greeting: string;
}

export interface WZAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  rewardHousePoints: number;
  emoji: string;
}

export interface WZDailyTaskPoolDef {
  id: string;
  name: string;
  description: string;
  type: WZDailyType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface WZTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface WZRarityInfo {
  key: WZRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface WZSpellMastery {
  spellId: string;
  level: WZMasteryLevel;
  currentXp: number;
  castsCount: number;
}

export interface WZQuestState {
  id: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
}

export interface WZAchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface WZDailyTaskState {
  poolId: string;
  progress: number;
  claimed: boolean;
  dayKey: string;
}

export interface WZDuelResult {
  opponentId: string;
  opponentName: string;
  won: boolean;
  coinsEarned: number;
  xpEarned: number;
  housePointsEarned: number;
  roundsWon: number;
  roundsLost: number;
  spellsCast: string[];
}

export interface WZLessonResult {
  classId: string;
  className: string;
  xpEarned: number;
  coinsEarned: number;
  spellsPracticed: string[];
  bonusXP: number;
}

export interface WZSpellCastResult {
  spellId: string;
  spellName: string;
  success: boolean;
  manaUsed: number;
  xpGained: number;
  masteryXpGained: number;
  damageDealt: number;
  healingDone: number;
  shieldGained: number;
  critHit: boolean;
  backfired: boolean;
}

export interface WZFamiliarBondResult {
  creatureId: string;
  creatureName: string;
  success: boolean;
  coinsSpent: number;
}

export interface WizardAcademyState {
  level: number;
  xp: number;
  coins: number;
  mana: number;
  maxMana: number;
  houseId: string;
  housePoints: number;
  activeSpellBook: string[];
  learnedSpells: WZSpellMastery[];
  unlockedClasses: string[];
  completedClasses: string[];
  activeRoom: string;
  familiarId: string | null;
  familiarBonded: boolean;
  professorsMet: string[];
  totalSpellsCast: number;
  totalDuelsWon: number;
  totalDuelsLost: number;
  totalLessonsAttended: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalManaRegenerated: number;
  castCountBySchool: Record<WZSpellSchool, number>;
  castCountByRarity: Record<WZRarity, number>;
  grandmasterCount: number;
  dailyStreak: number;
  lastDaily: string | null;
  activeQuests: WZQuestState[];
  completedQuests: string[];
  unlockedAchievements: WZAchievementState[];
  dailyTask: WZDailyTaskState | null;
  seed: number;
  duelsToday: number;
  lessonsToday: number;
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

function wzHashString(str: string): number {
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

function wzXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= WZ_MAX_LEVEL) return Infinity;
  return Math.floor(120 * level * (1 + level * 0.1));
}

function wzClampLevel(lvl: number): number {
  return Math.max(1, Math.min(WZ_MAX_LEVEL, lvl));
}

function wzClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function wzClampMana(m: number): number {
  return Math.max(0, Math.floor(m));
}

function wzGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function wzRarityMultiplier(r: WZRarity): number {
  const map: Record<WZRarity, number> = {
    common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5, mythic: 8,
  };
  return map[r] ?? 1;
}

function wzMasteryMultiplier(ml: WZMasteryLevel): number {
  const map: Record<WZMasteryLevel, number> = {
    learned: 1, practiced: 1.25, mastered: 1.5, grandmaster: 2,
  };
  return map[ml] ?? 1;
}

// ============================================================
// Constants
// ============================================================

export const WZ_MAX_LEVEL = 50;
export const WZ_MAX_MANA = 100;
export const WZ_BASE_MANA_REGEN = 10;
export const WZ_DUEL_COOLDOWN_MAX = 5;
export const WZ_SPELLS_PER_PAGE = 8;
export const WZ_HOUSE_POINTS_PER_WIN = 10;
export const WZ_MAX_FAMILIAR_BONUS = 5;

export const WZ_RARITIES: WZRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
  { key: 'mythic', label: 'Mythic', color: '#F472B6', xpMultiplier: 8 },
];

export const WZ_TITLE_THRESHOLDS: WZTitleInfo[] = [
  { name: 'First Year', levelRequired: 1, description: 'A newly enrolled student at the Academy of Arcane Arts' },
  { name: 'Apprentice Wizard', levelRequired: 5, description: 'You have learned your first incantations and can light a candle with magic' },
  { name: 'Spellcaster', levelRequired: 10, description: 'Your spells are reliable and you command the basics of multiple schools' },
  { name: 'Arcane Scholar', levelRequired: 18, description: 'A dedicated student who has mastered several spell disciplines' },
  { name: 'Battle Mage', levelRequired: 25, description: 'Proven in duels and respected by peers across all houses' },
  { name: 'High Wizard', levelRequired: 33, description: 'Your mastery of magic rivals that of junior professors' },
  { name: 'Sage Arcanum', levelRequired: 42, description: 'A living legend within the academy walls' },
  { name: 'Archmage', levelRequired: 50, description: 'The pinnacle of magical achievement — your name echoes through the ages' },
];

export const WZ_SPELLS: WZSpellDef[] = [
  // === Common Spells (8) ===
  { id: 'spark', name: 'Spark', school: 'elemental', rarity: 'common', manaCost: 5, damage: 8, healing: 0, shield: 0, duration: 0, effectDescription: 'A small burst of flame from the fingertip', requiredLevel: 1, masteryXpToLearn: 10, masteryXpToPractice: 50, masteryXpToMaster: 200, masteryXpToGrandmaster: 500, emoji: '✨' },
  { id: 'minor_heal', name: 'Minor Heal', school: 'healing', rarity: "common", manaCost: 8, damage: 0, healing: 15, shield: 0, duration: 0, effectDescription: 'Channels gentle restorative energy to mend wounds', requiredLevel: 1, masteryXpToLearn: 10, masteryXpToPractice: 50, masteryXpToMaster: 200, masteryXpToGrandmaster: 500, emoji: '💚' },
  { id: 'frost_touch', name: 'Frost Touch', school: 'elemental', rarity: 'common', manaCost: 6, damage: 10, healing: 0, shield: 0, duration: 0, effectDescription: 'Freezing cold radiates from your hand on contact', requiredLevel: 2, masteryXpToLearn: 12, masteryXpToPractice: 60, masteryXpToMaster: 250, masteryXpToGrandmaster: 600, emoji: '❄️' },
  { id: 'arcane_shield', name: 'Arcane Shield', school: 'abjuration', rarity: 'common', manaCost: 10, damage: 0, healing: 0, shield: 12, duration: 3, effectDescription: 'A shimmering barrier absorbs incoming damage', requiredLevel: 2, masteryXpToLearn: 12, masteryXpToPractice: 60, masteryXpToMaster: 250, masteryXpToGrandmaster: 600, emoji: '🛡️' },
  { id: 'mana_siphon', name: 'Mana Siphon', school: 'enchantment', rarity: 'common', manaCost: 3, damage: 5, healing: 0, shield: 0, duration: 0, effectDescription: 'Drains a small amount of magical energy from the target', requiredLevel: 3, masteryXpToLearn: 10, masteryXpToPractice: 55, masteryXpToMaster: 220, masteryXpToGrandmaster: 550, emoji: '🔵' },
  { id: 'wind_push', name: 'Wind Push', school: 'elemental', rarity: 'common', manaCost: 7, damage: 6, healing: 0, shield: 0, duration: 0, effectDescription: 'A gust of wind that pushes the target backward', requiredLevel: 3, masteryXpToLearn: 10, masteryXpToPractice: 50, masteryXpToMaster: 200, masteryXpToGrandmaster: 500, emoji: '💨' },
  { id: 'light', name: 'Light', school: 'conjuration', rarity: 'common', manaCost: 2, damage: 0, healing: 0, shield: 0, duration: 60, effectDescription: 'Creates a floating orb of bright light', requiredLevel: 1, masteryXpToLearn: 5, masteryXpToPractice: 25, masteryXpToMaster: 100, masteryXpToGrandmaster: 250, emoji: '💡' },
  { id: 'minor_illusion', name: 'Minor Illusion', school: 'illusion', rarity: 'common', manaCost: 4, damage: 0, healing: 0, shield: 0, duration: 10, effectDescription: 'Creates a brief sound or image that distracts', requiredLevel: 3, masteryXpToLearn: 10, masteryXpToPractice: 50, masteryXpToMaster: 200, masteryXpToGrandmaster: 500, emoji: '🎭' },

  // === Uncommon Spells (8) ===
  { id: 'fireball', name: 'Fireball', school: 'elemental', rarity: 'uncommon', manaCost: 15, damage: 25, healing: 0, shield: 0, duration: 0, effectDescription: 'Hurls a sphere of roaring flame that explodes on impact', requiredLevel: 5, masteryXpToLearn: 25, masteryXpToPractice: 120, masteryXpToMaster: 500, masteryXpToGrandmaster: 1200, emoji: '🔥' },
  { id: 'ice_storm', name: 'Ice Storm', school: 'elemental', rarity: 'uncommon', manaCost: 18, damage: 20, healing: 0, shield: 0, duration: 3, effectDescription: 'Summons a swirling blizzard that damages over time', requiredLevel: 6, masteryXpToLearn: 28, masteryXpToPractice: 130, masteryXpToMaster: 550, masteryXpToGrandmaster: 1300, emoji: '🌨️' },
  { id: 'heal_wounds', name: 'Heal Wounds', school: 'healing', rarity: 'uncommon', manaCost: 14, damage: 0, healing: 35, shield: 0, duration: 0, effectDescription: 'Restores a significant amount of health', requiredLevel: 5, masteryXpToLearn: 25, masteryXpToPractice: 120, masteryXpToMaster: 500, masteryXpToGrandmaster: 1200, emoji: '❤️' },
  { id: 'lightning_bolt', name: 'Lightning Bolt', school: 'elemental', rarity: 'uncommon', manaCost: 20, damage: 35, healing: 0, shield: 0, duration: 0, effectDescription: 'Calls down a bolt of lightning from the sky', requiredLevel: 7, masteryXpToLearn: 30, masteryXpToPractice: 150, masteryXpToMaster: 600, masteryXpToGrandmaster: 1500, emoji: '⚡' },
  { id: 'teleport', name: 'Teleport', school: 'conjuration', rarity: 'uncommon', manaCost: 22, damage: 0, healing: 0, shield: 0, duration: 0, effectDescription: 'Instantly transports the caster to a known location', requiredLevel: 8, masteryXpToLearn: 30, masteryXpToPractice: 150, masteryXpToMaster: 600, masteryXpToGrandmaster: 1500, emoji: '🌀' },
  { id: 'dark_vision', name: 'Dark Vision', school: 'divination', rarity: 'uncommon', manaCost: 10, damage: 0, healing: 0, shield: 0, duration: 30, effectDescription: 'See perfectly in total darkness', requiredLevel: 6, masteryXpToLearn: 20, masteryXpToPractice: 100, masteryXpToMaster: 400, masteryXpToGrandmaster: 1000, emoji: '👁️' },
  { id: 'charm_person', name: 'Charm Person', school: 'enchantment', rarity: 'uncommon', manaCost: 16, damage: 0, healing: 0, shield: 0, duration: 10, effectDescription: 'Makes a humanoid creature friendly toward you', requiredLevel: 7, masteryXpToLearn: 25, masteryXpToPractice: 120, masteryXpToMaster: 500, masteryXpToGrandmaster: 1200, emoji: '💕' },
  { id: 'dispel_magic', name: 'Dispel Magic', school: 'abjuration', rarity: 'uncommon', manaCost: 18, damage: 15, healing: 0, shield: 0, duration: 0, effectDescription: 'Ends one magical effect on a target or area', requiredLevel: 8, masteryXpToLearn: 28, masteryXpToPractice: 140, masteryXpToMaster: 550, masteryXpToGrandmaster: 1400, emoji: '✂️' },

  // === Rare Spells (8) ===
  { id: 'chain_lightning', name: 'Chain Lightning', school: 'elemental', rarity: 'rare', manaCost: 30, damage: 45, healing: 0, shield: 0, duration: 0, effectDescription: 'A lightning bolt that arcs between multiple targets', requiredLevel: 12, masteryXpToLearn: 50, masteryXpToPractice: 250, masteryXpToMaster: 1000, masteryXpToGrandmaster: 2500, emoji: '⚡' },
  { id: 'shadow_step', name: 'Shadow Step', school: 'illusion', rarity: 'rare', manaCost: 20, damage: 0, healing: 0, shield: 0, duration: 0, effectDescription: 'Teleport through shadows, reappearing behind your target', requiredLevel: 11, masteryXpToLearn: 45, masteryXpToPractice: 220, masteryXpToMaster: 900, masteryXpToGrandmaster: 2200, emoji: '🌑' },
  { id: 'resurrection', name: 'Resurrection', school: 'healing', rarity: 'rare', manaCost: 50, damage: 0, healing: 100, shield: 0, duration: 0, effectDescription: 'Brings a fallen ally back to life with full health', requiredLevel: 15, masteryXpToLearn: 60, masteryXpToPractice: 300, masteryXpToMaster: 1200, masteryXpToGrandmaster: 3000, emoji: '🕊️' },
  { id: 'stoneskin', name: 'Stoneskin', school: 'abjuration', rarity: 'rare', manaCost: 25, damage: 0, healing: 0, shield: 40, duration: 5, effectDescription: 'Turns your skin to stone, absorbing massive damage', requiredLevel: 13, masteryXpToLearn: 50, masteryXpToPractice: 250, masteryXpToMaster: 1000, masteryXpToGrandmaster: 2500, emoji: '🪨' },
  { id: 'summon_familiar', name: 'Summon Familiar', school: 'conjuration', rarity: 'rare', manaCost: 30, damage: 0, healing: 0, shield: 0, duration: 60, effectDescription: 'Calls forth a magical companion to aid you', requiredLevel: 14, masteryXpToLearn: 55, masteryXpToPractice: 275, masteryXpToMaster: 1100, masteryXpToGrandmaster: 2750, emoji: '🦉' },
  { id: 'scrying_eye', name: 'Scrying Eye', school: 'divination', rarity: 'rare', manaCost: 22, damage: 0, healing: 0, shield: 0, duration: 15, effectDescription: 'An invisible eye that lets you see distant places', requiredLevel: 12, masteryXpToLearn: 45, masteryXpToPractice: 225, masteryXpToMaster: 900, masteryXpToGrandmaster: 2250, emoji: '🔮' },
  { id: 'vampiric_touch', name: 'Vampiric Touch', school: 'dark_arts', rarity: 'rare', manaCost: 18, damage: 20, healing: 20, shield: 0, duration: 0, effectDescription: 'Drains life force from the target, healing yourself', requiredLevel: 13, masteryXpToLearn: 48, masteryXpToPractice: 240, masteryXpToMaster: 960, masteryXpToGrandmaster: 2400, emoji: '🧛' },
  { id: 'elemental_wall', name: 'Elemental Wall', school: 'elemental', rarity: 'rare', manaCost: 28, damage: 15, healing: 0, shield: 30, duration: 5, effectDescription: 'Creates a wall of swirling elemental energy', requiredLevel: 14, masteryXpToLearn: 52, masteryXpToPractice: 260, masteryXpToMaster: 1040, masteryXpToGrandmaster: 2600, emoji: '🌊' },

  // === Epic Spells (8) ===
  { id: 'meteor_shower', name: 'Meteor Shower', school: 'elemental', rarity: 'epic', manaCost: 50, damage: 80, healing: 0, shield: 0, duration: 3, effectDescription: 'Rains blazing meteors from the sky upon your enemies', requiredLevel: 20, masteryXpToLearn: 100, masteryXpToPractice: 500, masteryXpToMaster: 2000, masteryXpToGrandmaster: 5000, emoji: '☄️' },
  { id: 'time_stop', name: 'Time Stop', school: 'conjuration', rarity: 'epic', manaCost: 60, damage: 0, healing: 0, shield: 20, duration: 3, effectDescription: 'Freezes time for everything except you', requiredLevel: 22, masteryXpToLearn: 110, masteryXpToPractice: 550, masteryXpToMaster: 2200, masteryXpToGrandmaster: 5500, emoji: '⏱️' },
  { id: 'soul_steal', name: 'Soul Steal', school: 'dark_arts', rarity: 'epic', manaCost: 40, damage: 50, healing: 40, shield: 0, duration: 0, effectDescription: 'Rips the very soul from a target, draining their essence', requiredLevel: 21, masteryXpToLearn: 100, masteryXpToPractice: 500, masteryXpToMaster: 2000, masteryXpToGrandmaster: 5000, emoji: '💀' },
  { id: 'mass_heal', name: 'Mass Heal', school: 'healing', rarity: 'epic', manaCost: 45, damage: 0, healing: 60, shield: 0, duration: 0, effectDescription: 'Heals all allies in a large area simultaneously', requiredLevel: 20, masteryXpToLearn: 95, masteryXpToPractice: 475, masteryXpToMaster: 1900, masteryXpToGrandmaster: 4750, emoji: '💖' },
  { id: 'prismatic_spray', name: 'Prismatic Spray', school: 'illusion', rarity: 'epic', manaCost: 42, damage: 55, healing: 0, shield: 0, duration: 0, effectDescription: 'Sprays a rainbow of destructive energy in a cone', requiredLevel: 23, masteryXpToLearn: 105, masteryXpToPractice: 525, masteryXpToMaster: 2100, masteryXpToGrandmaster: 5250, emoji: '🌈' },
  { id: 'planar_gate', name: 'Planar Gate', school: 'conjuration', rarity: 'epic', manaCost: 55, damage: 0, healing: 0, shield: 0, duration: 10, effectDescription: 'Opens a gateway to another plane of existence', requiredLevel: 24, masteryXpToLearn: 115, masteryXpToPractice: 575, masteryXpToMaster: 2300, masteryXpToGrandmaster: 5750, emoji: '🌀' },
  { id: 'forbidden_ritual', name: 'Forbidden Ritual', school: 'dark_arts', rarity: 'epic', manaCost: 48, damage: 60, healing: 0, shield: 0, duration: 0, effectDescription: 'Performs a dark ritual that channels immense destructive energy', requiredLevel: 25, masteryXpToLearn: 120, masteryXpToPractice: 600, masteryXpToMaster: 2400, masteryXpToGrandmaster: 6000, emoji: '🕯️' },
  { id: 'mind_palace', name: 'Mind Palace', school: 'divination', rarity: 'epic', manaCost: 35, damage: 0, healing: 0, shield: 15, duration: 15, effectDescription: 'Creates a mental fortress that boosts concentration and spell power', requiredLevel: 22, masteryXpToLearn: 100, masteryXpToPractice: 500, masteryXpToMaster: 2000, masteryXpToGrandmaster: 5000, emoji: '🏰' },

  // === Legendary Spells (4) ===
  { id: 'phoenix_flame', name: 'Phoenix Flame', school: 'elemental', rarity: 'legendary', manaCost: 70, damage: 120, healing: 80, shield: 0, duration: 0, effectDescription: 'The eternal fire of the phoenix — damages and heals in one blazing wave', requiredLevel: 30, masteryXpToLearn: 200, masteryXpToPractice: 1000, masteryXpToMaster: 4000, masteryXpToGrandmaster: 10000, emoji: '🐦‍🔥' },
  { id: 'world_break', name: 'World Break', school: 'dark_arts', rarity: 'legendary', manaCost: 85, damage: 150, healing: 0, shield: 0, duration: 0, effectDescription: 'Shatters reality itself, dealing cataclysmic damage', requiredLevel: 35, masteryXpToLearn: 250, masteryXpToPractice: 1250, masteryXpToMaster: 5000, masteryXpToGrandmaster: 12500, emoji: '🌋' },
  { id: 'resurrection_aura', name: 'Resurrection Aura', school: 'healing', rarity: 'legendary', manaCost: 80, damage: 0, healing: 150, shield: 30, duration: 5, effectDescription: 'An aura of pure life force that revives and shields all allies', requiredLevel: 33, masteryXpToLearn: 230, masteryXpToPractice: 1150, masteryXpToMaster: 4600, masteryXpToGrandmaster: 11500, emoji: '✨' },
  { id: 'starfall', name: 'Starfall', school: 'conjuration', rarity: 'legendary', manaCost: 75, damage: 130, healing: 0, shield: 0, duration: 4, effectDescription: 'Calls down the fury of the stars themselves', requiredLevel: 32, masteryXpToLearn: 220, masteryXpToPractice: 1100, masteryXpToMaster: 4400, masteryXpToGrandmaster: 11000, emoji: '🌟' },

  // === Mythic Spells (4) ===
  { id: 'omniscience', name: 'Omniscience', school: 'divination', rarity: 'mythic', manaCost: 100, damage: 0, healing: 50, shield: 50, duration: 10, effectDescription: 'Achieve total awareness — see all, know all, master all', requiredLevel: 42, masteryXpToLearn: 500, masteryXpToPractice: 2500, masteryXpToMaster: 10000, masteryXpToGrandmaster: 25000, emoji: '👁️‍🗨️' },
  { id: 'reality_rewrite', name: 'Reality Rewrite', school: 'illusion', rarity: 'mythic', manaCost: 120, damage: 100, healing: 100, shield: 50, duration: 5, effectDescription: 'Rewrite the fabric of reality itself to your will', requiredLevel: 45, masteryXpToLearn: 600, masteryXpToPractice: 3000, masteryXpToMaster: 12000, masteryXpToGrandmaster: 30000, emoji: '📖' },
  { id: 'apocalypse', name: 'Apocalypse', school: 'dark_arts', rarity: 'mythic', manaCost: 150, damage: 200, healing: 0, shield: 0, duration: 5, effectDescription: 'The ultimate dark spell — unleashes devastating destruction', requiredLevel: 48, masteryXpToLearn: 700, masteryXpToPractice: 3500, masteryXpToMaster: 14000, masteryXpToGrandmaster: 35000, emoji: '☠️' },
  { id: 'genesis', name: 'Genesis', school: 'conjuration', rarity: 'mythic', manaCost: 130, damage: 0, healing: 200, shield: 100, duration: 10, effectDescription: 'Create and shape matter from pure magical energy — the birth spell', requiredLevel: 50, masteryXpToLearn: 800, masteryXpToPractice: 4000, masteryXpToMaster: 16000, masteryXpToGrandmaster: 40000, emoji: '🌌' },
];

export const WZ_MAGIC_CLASSES: WZMagicClassDef[] = [
  { id: 'class_elemental_basics', name: 'Elemental Basics', description: 'Learn to command fire, ice, and wind — the foundations of elemental magic', emoji: '🔥', spellIds: ['spark', 'frost_touch', 'wind_push'], requiredLevel: 1, xpReward: 20, coinReward: 15, professorId: 'prof_ignis', roomId: 'spell_library' },
  { id: 'class_healing_arts', name: 'Healing Arts', description: 'The sacred art of mending wounds and restoring vitality', emoji: '💚', spellIds: ['minor_heal'], requiredLevel: 1, xpReward: 20, coinReward: 15, professorId: 'prof_silvanus', roomId: 'potion_lab' },
  { id: 'class_defensive_magic', name: 'Defensive Magic', description: 'Shield spells and ward techniques to protect yourself and allies', emoji: '🛡️', spellIds: ['arcane_shield'], requiredLevel: 2, xpReward: 25, coinReward: 20, professorId: 'prof_bastion', roomId: 'great_hall' },
  { id: 'class_enchantment_101', name: 'Enchantment 101', description: 'Learn to bend magical energy to enhance and manipulate', emoji: '💜', spellIds: ['mana_siphon', 'charm_person'], requiredLevel: 5, xpReward: 35, coinReward: 25, professorId: 'prof_enchantia', roomId: 'enchantment_hall' },
  { id: 'class_divination_studies', name: 'Divination Studies', description: 'Peer beyond the veil — see the unseen and predict the future', emoji: '🔮', spellIds: ['dark_vision', 'scrying_eye'], requiredLevel: 8, xpReward: 45, coinReward: 30, professorId: 'prof_oracle', roomId: 'divination_tower' },
  { id: 'class_dark_arts_intro', name: 'Dark Arts Introduction', description: 'A carefully supervised introduction to the darker side of magic', emoji: '🌑', spellIds: ['vampiric_touch'], requiredLevel: 10, xpReward: 50, coinReward: 35, professorId: 'prof_malador', roomId: 'forbidden_wing' },
  { id: 'class_illusion_mastery', name: 'Illusion Mastery', description: 'Make the impossible seem real and the real seem impossible', emoji: '🎭', spellIds: ['minor_illusion', 'shadow_step', 'prismatic_spray'], requiredLevel: 12, xpReward: 60, coinReward: 40, professorId: 'prof_mirage', roomId: 'enchantment_hall' },
  { id: 'class_advanced_conjuration', name: 'Advanced Conjuration', description: 'Summon creatures, create objects, and open portals between worlds', emoji: '🌀', spellIds: ['teleport', 'summon_familiar', 'planar_gate'], requiredLevel: 15, xpReward: 75, coinReward: 50, professorId: 'prof_ignis', roomId: 'duel_arena' },
];

export const WZ_ROOMS: WZRoomDef[] = [
  { id: 'great_hall', name: 'Great Hall', description: 'The magnificent central hall where ceremonies, feasts, and assemblies are held beneath enchanted ceilings', emoji: '🏰', unlockedAtLevel: 1 },
  { id: 'spell_library', name: 'Spell Library', description: 'Towering shelves of ancient grimoires and spell scrolls, watched over by whispering enchantments', emoji: '📚', unlockedAtLevel: 1 },
  { id: 'potion_lab', name: 'Potion Laboratory', description: 'Bubbling cauldrons and shelves of exotic ingredients fill this aromatic workspace', emoji: '🧪', unlockedAtLevel: 1 },
  { id: 'duel_arena', name: 'Duel Arena', description: 'A grand amphitheater warded with powerful protection spells for magical combat practice', emoji: '⚔️', unlockedAtLevel: 3 },
  { id: 'enchantment_hall', name: 'Enchantment Hall', description: 'A shimmering hall where objects are imbued with magical properties', emoji: '✨', unlockedAtLevel: 5 },
  { id: 'divination_tower', name: 'Divination Tower', description: 'The tallest tower in the academy, where seers gaze into crystal balls and star charts', emoji: '🗼', unlockedAtLevel: 8 },
  { id: 'creature_sanctuary', name: 'Creature Sanctuary', description: 'A vast enchanted forest enclosure where magical creatures roam freely', emoji: '🌿', unlockedAtLevel: 10 },
  { id: 'forbidden_wing', name: 'Forbidden Wing', description: 'Locked behind seven enchanted doors — home to dangerous artifacts and dark research', emoji: '🔒', unlockedAtLevel: 15 },
];

export const WZ_CREATURES: WZCreatureDef[] = [
  { id: 'owl', name: 'Snowy Owl', description: 'A wise owl with gleaming white feathers, perfect for delivering messages and night vision', emoji: '🦉', rarity: 'common', bonusType: 'xp_boost', bonusValue: 2, requiredLevel: 1 },
  { id: 'cat', name: 'Magical Cat', description: 'A sleek black cat that can sense magical disturbances and find hidden objects', emoji: '🐱', rarity: 'common', bonusType: 'luck', bonusValue: 3, requiredLevel: 1 },
  { id: 'toad', name: 'Enchanted Toad', description: 'A surprisingly intelligent toad whose croaks amplify nearby healing magic', emoji: '🐸', rarity: 'common', bonusType: 'defense', bonusValue: 2, requiredLevel: 2 },
  { id: 'raven', name: 'Shadow Raven', description: 'A raven with feathers darker than midnight, able to carry messages between realms', emoji: '🐦‍⬛', rarity: 'common', bonusType: 'mana_regen', bonusValue: 2, requiredLevel: 2 },
  { id: 'fox', name: 'Arcane Fox', description: 'A fox with shimmering fur that shifts colors based on nearby magical energy', emoji: '🦊', rarity: 'uncommon', bonusType: 'spell_power', bonusValue: 3, requiredLevel: 5 },
  { id: 'hawk', name: 'Storm Hawk', description: 'A magnificent hawk that rides wind currents and can summon miniature storms', emoji: '🦅', rarity: 'uncommon', bonusType: 'spell_power', bonusValue: 3, requiredLevel: 6 },
  { id: 'snake', name: 'Serpent of Wisdom', description: 'An ancient serpent whose scales contain accumulated magical knowledge', emoji: '🐍', rarity: 'uncommon', bonusType: 'xp_boost', bonusValue: 4, requiredLevel: 7 },
  { id: 'wolf', name: 'Moon Wolf', description: 'A spectral wolf that howls to strengthen abjuration wards during full moons', emoji: '🐺', rarity: 'uncommon', bonusType: 'defense', bonusValue: 4, requiredLevel: 8 },
  { id: 'turtle', name: 'Enchanted Tortoise', description: 'An impossibly old tortoise whose shell provides natural magical shielding', emoji: '🐢', rarity: 'rare', bonusType: 'defense', bonusValue: 5, requiredLevel: 12 },
  { id: 'peacock', name: 'Prismatic Peacock', description: 'A peacock whose tail feathers cast natural illusion enchantments', emoji: '🦚', rarity: 'rare', bonusType: 'luck', bonusValue: 5, requiredLevel: 13 },
  { id: 'eagle', name: 'Thunder Eagle', description: 'A giant eagle wreathed in lightning, king of all aerial familiars', emoji: '🦅', rarity: 'rare', bonusType: 'spell_power', bonusValue: 5, requiredLevel: 14 },
  { id: 'panther', name: 'Shadow Panther', description: 'A panther made of living shadow that moves between dimensions', emoji: '🐆', rarity: 'rare', bonusType: 'mana_regen', bonusValue: 5, requiredLevel: 15 },
  { id: 'stallion', name: 'Starlight Stallion', description: 'A horse that gallops across the night sky leaving trails of starlight', emoji: '🐴', rarity: 'epic', bonusType: 'spell_power', bonusValue: 7, requiredLevel: 20 },
  { id: 'phoenix', name: 'Phoenix', description: 'The legendary bird of flame — reborn endlessly from its own ashes', emoji: '🐦‍🔥', rarity: 'epic', bonusType: 'mana_regen', bonusValue: 7, requiredLevel: 22 },
  { id: 'dragon', name: 'Miniature Dragon', description: 'A young dragon with scales like gemstones and breath like a furnace', emoji: '🐉', rarity: 'legendary', bonusType: 'spell_power', bonusValue: 10, requiredLevel: 30 },
  { id: 'unicorn', name: 'Unicorn', description: 'A majestic unicorn whose horn contains the purest healing magic in existence', emoji: '🦄', rarity: 'legendary', bonusType: 'defense', bonusValue: 10, requiredLevel: 32 },
  { id: 'griffin', name: 'Griffin', description: 'Half eagle, half lion — the noble guardian of ancient magical treasures', emoji: '🦁', rarity: 'legendary', bonusType: 'luck', bonusValue: 10, requiredLevel: 35 },
  { id: 'basilisk', name: 'Lesser Basilisk', description: 'A young basilisk whose gaze can petrify — controlled through powerful bonding', emoji: '🪨', rarity: 'epic', bonusType: 'defense', bonusValue: 8, requiredLevel: 25 },
  { id: 'kraken_spawn', name: 'Kraken Spawn', description: 'A tiny tentacled creature from the depths, surprisingly affectionate', emoji: '🦑', rarity: 'epic', bonusType: 'xp_boost', bonusValue: 8, requiredLevel: 24 },
  { id: 'celestial_serpent', name: 'Celestial Serpent', description: 'A serpent made of pure starlight, said to have coiled around the world tree', emoji: '🌟', rarity: 'mythic', bonusType: 'spell_power', bonusValue: 15, requiredLevel: 42 },
];

export const WZ_PROFESSORS: WZProfessorDef[] = [
  { id: 'prof_ignis', name: 'Professor Ignis Blaze', title: 'Master of Elemental Arts', teachingStyle: 'Explosive demonstrations and hands-on fire practice', description: 'A passionate pyromancer who once accidentally set the great hall ceiling ablaze — three times', emoji: '🔥', favoredSchool: 'elemental' },
  { id: 'prof_silvanus', name: 'Professor Silvanus Green', title: 'Arch-Healer', teachingStyle: 'Gentle guided meditation and herbal remedy preparation', description: 'An ancient healer who tends the academy gardens and has never lost a patient', emoji: '🌿', favoredSchool: 'healing' },
  { id: 'prof_bastion', name: 'Professor Bastion Ward', title: 'Warden of Shields', teachingStyle: 'Strict drills and protective formation exercises', description: 'A retired war mage whose wards have withstood dragonfire', emoji: '🛡️', favoredSchool: 'abjuration' },
  { id: 'prof_enchantia', name: 'Professor Enchantia Charm', title: 'Mistress of Enchantment', teachingStyle: 'Storytelling and collaborative spell-weaving sessions', description: 'Known for enchanting the castle stairs to sing on holidays', emoji: '💖', favoredSchool: 'enchantment' },
  { id: 'prof_oracle', name: 'Professor Oracle Vex', title: 'Seer of the Seventh Sight', teachingStyle: 'Cryptic riddles and meditation under starlight', description: 'Claims to have foreseen every student enrollment three centuries in advance', emoji: '🔮', favoredSchool: 'divination' },
  { id: 'prof_malador', name: 'Professor Malador Dark', title: 'Keeper of Forbidden Knowledge', teachingStyle: 'Cold lectures with dangerous practical demonstrations', description: 'A mysterious figure who never removes his hooded cloak — or explains why', emoji: '🌑', favoredSchool: 'dark_arts' },
  { id: 'prof_mirage', name: 'Professor Mirage Twilight', title: 'Grand Illusionist', teachingStyle: 'Immersive demonstrations that blur the line between reality and illusion', description: 'No one is entirely sure what Professor Mirage actually looks like', emoji: '🎭', favoredSchool: 'illusion' },
  { id: 'prof_vortex', name: 'Professor Vortex Gate', title: 'Master Conjurer', teachingStyle: 'Portal theory and summoning circles drawn on every surface', description: 'Once accidentally opened a portal to a dimension of nothing but pigeons', emoji: '🌀', favoredSchool: 'conjuration' },
];

export const WZ_HOUSES: WZHouseDef[] = [
  { id: 'house_phoenixfire', name: 'Phoenixfire', description: 'House of the brave and bold — its members are known for their courage and fierce determination', emoji: '🔥', colors: 'Crimson & Gold', trait: 'Courage' },
  { id: 'house_moonshadow', name: 'Moonshadow', description: 'House of the cunning and clever — its members value wisdom and strategic thinking above all', emoji: '🌙', colors: 'Silver & Blue', trait: 'Wisdom' },
  { id: 'house_starweave', name: 'Starweave', description: 'House of the creative and ambitious — its members pursue magical innovation and artistic expression', emoji: '⭐', colors: 'Purple & White', trait: 'Ambition' },
  { id: 'house_thornveil', name: 'Thornveil', description: 'House of the loyal and just — its members are steadfast defenders of truth and honor', emoji: '🌿', colors: 'Green & Bronze', trait: 'Loyalty' },
];

export const WZ_QUESTS: WZQuestDef[] = [
  { id: 'quest_first_spell', name: 'First Incantation', description: 'Cast your first spell to prove your magical aptitude', type: 'cast', target: 1, rewardCoins: 50, rewardXP: 30, rewardHousePoints: 5, requiredLevel: 1, emoji: '✨' },
  { id: 'quest_spell_novice', name: 'Spell Novice', description: 'Cast 15 spells of any kind to build your fundamentals', type: 'cast', target: 15, rewardCoins: 120, rewardXP: 80, rewardHousePoints: 10, requiredLevel: 1, emoji: '📖' },
  { id: 'quest_learn_three', name: 'Eager Learner', description: 'Learn 3 different spells from your classes', type: 'learn', target: 3, rewardCoins: 100, rewardXP: 60, rewardHousePoints: 8, requiredLevel: 2, emoji: '🎓' },
  { id: 'quest_first_duel', name: 'Duel Initiate', description: 'Win your first duel in the Duel Arena', type: 'duel', target: 1, rewardCoins: 80, rewardXP: 50, rewardHousePoints: 10, requiredLevel: 3, emoji: '⚔️' },
  { id: 'quest_lesson_attendee', name: 'Dedicated Student', description: 'Attend 5 magic classes', type: 'attend', target: 5, rewardCoins: 150, rewardXP: 100, rewardHousePoints: 12, requiredLevel: 5, emoji: '📚' },
  { id: 'quest_rare_spell', name: 'Rare Discovery', description: 'Learn a rare or higher rarity spell', type: 'learn', target: 1, rewardCoins: 200, rewardXP: 120, rewardHousePoints: 15, requiredLevel: 10, emoji: '💎' },
  { id: 'quest_duel_champion', name: 'Duel Champion', description: 'Win 10 duels against other students', type: 'duel', target: 10, rewardCoins: 300, rewardXP: 200, rewardHousePoints: 25, requiredLevel: 12, emoji: '🏆' },
  { id: 'quest_spell_master', name: 'Master of Spells', description: 'Grandmaster 3 different spells', type: 'learn', target: 3, rewardCoins: 400, rewardXP: 250, rewardHousePoints: 30, requiredLevel: 20, emoji: '🌟' },
  { id: 'quest_creature_bond', name: 'Familiar Bond', description: 'Bond with a magical creature companion', type: 'discover', target: 1, rewardCoins: 200, rewardXP: 150, rewardHousePoints: 15, requiredLevel: 8, emoji: '🦉' },
  { id: 'quest_archmage_path', name: 'Path to Archmage', description: 'Reach level 40 and cast 200 spells total', type: 'cast', target: 200, rewardCoins: 1500, rewardXP: 1000, rewardHousePoints: 100, requiredLevel: 35, emoji: '👑' },
];

export const WZ_NPCS: WZNPCDef[] = [
  { id: 'npc_headmaster', name: 'Headmaster Theron', role: 'Headmaster', description: 'The ancient and wise leader of the Academy, an Archmage of legendary repute', emoji: '🧙‍♂️', greeting: 'Welcome, young wizard. The halls of this academy hold wonders beyond your imagination — and dangers. Choose your path wisely.' },
  { id: 'npc_librarian', name: 'Madame Parchment', role: 'Head Librarian', description: 'A stern but knowledgeable keeper of the Spell Library, keeper of all magical texts', emoji: '📖', greeting: 'Shh! The books are sleeping. If you need a spell manual, consult the index — and do NOT dog-ear the pages!' },
  { id: 'npc_groundskeeper', name: 'Thornwick', role: 'Groundskeeper', description: 'A gruff but kind half-giant who tends the academy grounds and creature sanctuary', emoji: '🌳', greeting: 'Arr, another student wandering the grounds. Stay on the path — the moonflowers bite after sundown.' },
  { id: 'npc_shopkeeper', name: 'Rune Merchant Finnick', role: 'Arcane Shopkeeper', description: 'A cheerful goblin who sells spell components, wands, and magical supplies', emoji: '🛒', greeting: 'Welcome, welcome! Fresh phoenix feathers just arrived — half off if you buy a wand too! Just kidding. Mostly.' },
  { id: 'npc_duel_master', name: 'Champion Valeria', role: 'Duel Master', description: 'The undefeated duel champion who oversees all magical combat at the academy', emoji: '⚔️', greeting: 'Think you have what it takes to face me in the arena? Ha! Let us see what you have learned today.' },
  { id: 'npc_house_ghost', name: 'The Grey Lady', role: 'House Ghost', description: 'The friendly specter who haunts the corridors and dispenses cryptic advice', emoji: '👻', greeting: 'Ooooh... a student! I have haunted these halls for 800 years and still cannot find the library restroom. Can you help?' },
];

export const WZ_ACHIEVEMENTS: WZAchievementDef[] = [
  { id: 'ach_first_cast', name: 'First Spark of Magic', description: 'Cast your very first spell', conditionKey: 'totalSpellsCast', targetValue: 1, rewardCoins: 10, rewardXP: 5, rewardHousePoints: 2, emoji: '✨' },
  { id: 'ach_cast_25', name: 'Apprentice Caster', description: 'Cast 25 spells', conditionKey: 'totalSpellsCast', targetValue: 25, rewardCoins: 50, rewardXP: 30, rewardHousePoints: 5, emoji: '🔥' },
  { id: 'ach_cast_100', name: 'Centurion Caster', description: 'Cast 100 spells', conditionKey: 'totalSpellsCast', targetValue: 100, rewardCoins: 200, rewardXP: 100, rewardHousePoints: 15, emoji: '💯' },
  { id: 'ach_cast_500', name: 'Spell Storm', description: 'Cast 500 spells', conditionKey: 'totalSpellsCast', targetValue: 500, rewardCoins: 800, rewardXP: 400, rewardHousePoints: 50, emoji: '🌩️' },
  { id: 'ach_learn_5', name: 'Bookworm', description: 'Learn 5 different spells', conditionKey: 'learnedSpellsCount', targetValue: 5, rewardCoins: 60, rewardXP: 40, rewardHousePoints: 5, emoji: '📚' },
  { id: 'ach_learn_15', name: 'Spell Encyclopedia', description: 'Learn 15 different spells', conditionKey: 'learnedSpellsCount', targetValue: 15, rewardCoins: 300, rewardXP: 150, rewardHousePoints: 20, emoji: '📖' },
  { id: 'ach_learn_30', name: 'Grand Grimoire', description: 'Learn 30 different spells', conditionKey: 'learnedSpellsCount', targetValue: 30, rewardCoins: 1000, rewardXP: 500, rewardHousePoints: 50, emoji: '📕' },
  { id: 'ach_first_duel_win', name: 'Duel Victor', description: 'Win your first duel', conditionKey: 'totalDuelsWon', targetValue: 1, rewardCoins: 30, rewardXP: 20, rewardHousePoints: 5, emoji: '⚔️' },
  { id: 'ach_duel_10', name: 'Arena Champion', description: 'Win 10 duels', conditionKey: 'totalDuelsWon', targetValue: 10, rewardCoins: 250, rewardXP: 150, rewardHousePoints: 25, emoji: '🏆' },
  { id: 'ach_level_10', name: 'Double Digits', description: 'Reach level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 100, rewardXP: 50, rewardHousePoints: 10, emoji: '🔟' },
  { id: 'ach_level_25', name: 'Battle Mage', description: 'Reach level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 300, rewardXP: 200, rewardHousePoints: 30, emoji: '🌟' },
  { id: 'ach_level_50', name: 'Archmage Ascended', description: 'Reach the maximum level', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXP: 1000, rewardHousePoints: 100, emoji: '👑' },
  { id: 'ach_familiar', name: 'Kindred Spirit', description: 'Bond with a magical familiar', conditionKey: 'familiarBonded', targetValue: 1, rewardCoins: 80, rewardXP: 50, rewardHousePoints: 10, emoji: '🦉' },
  { id: 'ach_streak_7', name: 'Week of Wizardry', description: 'Maintain a 7-day daily streak', conditionKey: 'dailyStreak', targetValue: 7, rewardCoins: 150, rewardXP: 80, rewardHousePoints: 15, emoji: '📅' },
  { id: 'ach_grandmaster', name: 'Grandmaster of the Arcane', description: 'Grandmaster any spell', conditionKey: 'grandmasterCount', targetValue: 1, rewardCoins: 200, rewardXP: 120, rewardHousePoints: 20, emoji: '🎓' },
];

export const WZ_DAILY_TASK_POOL: WZDailyTaskPoolDef[] = [
  { id: 'daily_cast_5', name: 'Daily Practice', description: 'Cast 5 spells today', type: 'cast', target: 5, rewardCoins: 25, rewardXP: 15, emoji: '✨' },
  { id: 'daily_cast_15', name: 'Spell Frenzy', description: 'Cast 15 spells today', type: 'cast', target: 15, rewardCoins: 60, rewardXP: 35, emoji: '🔥' },
  { id: 'daily_learn_1', name: 'Study Session', description: 'Learn or practice 1 spell today', type: 'learn', target: 1, rewardCoins: 20, rewardXP: 12, emoji: '📖' },
  { id: 'daily_learn_3', name: 'Deep Study', description: 'Learn or practice 3 spells today', type: 'learn', target: 3, rewardCoins: 50, rewardXP: 30, emoji: '📚' },
  { id: 'daily_duel_1', name: 'Daily Sparring', description: 'Win 1 duel today', type: 'duel', target: 1, rewardCoins: 30, rewardXP: 18, emoji: '⚔️' },
  { id: 'daily_duel_3', name: 'Arena Grind', description: 'Win 3 duels today', type: 'duel', target: 3, rewardCoins: 80, rewardXP: 45, emoji: '🏆' },
  { id: 'daily_attend_1', name: 'Morning Class', description: 'Attend 1 class today', type: 'attend', target: 1, rewardCoins: 20, rewardXP: 12, emoji: '🎓' },
  { id: 'daily_attend_2', name: 'Full Schedule', description: 'Attend 2 classes today', type: 'attend', target: 2, rewardCoins: 40, rewardXP: 25, emoji: '📋' },
];

// Duel opponent templates
export const WZ_DUEL_OPPONENTS: { id: string; name: string; level: number; spellIds: string[]; difficulty: 'easy' | 'medium' | 'hard' | 'legendary'; emoji: string }[] = [
  { id: 'opp_first_year_1', name: 'Nervous Ned', level: 1, spellIds: ['spark', 'light'], difficulty: 'easy', emoji: '👧' },
  { id: 'opp_first_year_2', name: 'Eager Ella', level: 2, spellIds: ['spark', 'minor_heal', 'wind_push'], difficulty: 'easy', emoji: '👦' },
  { id: 'opp_first_year_3', name: 'Bookworm Beth', level: 3, spellIds: ['arcane_shield', 'frost_touch', 'light'], difficulty: 'easy', emoji: '🧒' },
  { id: 'opp_second_year_1', name: 'Firebrand Finn', level: 5, spellIds: ['fireball', 'spark', 'arcane_shield'], difficulty: 'medium', emoji: '🧑' },
  { id: 'opp_second_year_2', name: 'Icy Iris', level: 6, spellIds: ['ice_storm', 'frost_touch', 'arcane_shield'], difficulty: 'medium', emoji: '👩' },
  { id: 'opp_second_year_3', name: 'Charming Chloe', level: 7, spellIds: ['charm_person', 'lightning_bolt', 'mana_siphon'], difficulty: 'medium', emoji: '👱‍♀️' },
  { id: 'opp_third_year_1', name: 'Shadow Sam', level: 10, spellIds: ['shadow_step', 'vampiric_touch', 'dispel_magic', 'scrying_eye'], difficulty: 'hard', emoji: '🧙' },
  { id: 'opp_third_year_2', name: 'Storm sorceress Stella', level: 12, spellIds: ['chain_lightning', 'elemental_wall', 'stoneskin', 'lightning_bolt'], difficulty: 'hard', emoji: '🧙‍♀️' },
  { id: 'opp_fourth_year_1', name: 'Dark Damon', level: 15, spellIds: ['soul_steal', 'forbidden_ritual', 'vampiric_touch', 'mass_heal'], difficulty: 'hard', emoji: '🧛' },
  { id: 'opp_fourth_year_2', name: 'Prismatic Petra', level: 18, spellIds: ['prismatic_spray', 'planar_gate', 'mind_palace', 'time_stop'], difficulty: 'legendary', emoji: '🌟' },
  { id: 'opp_fifth_year_1', name: 'Meteor Mason', level: 22, spellIds: ['meteor_shower', 'resurrection', 'phoenix_flame', 'elemental_wall'], difficulty: 'legendary', emoji: '☄️' },
  { id: 'opp_fifth_year_2', name: 'Archmage Alice', level: 30, spellIds: ['phoenix_flame', 'world_break', 'starfall', 'time_stop'], difficulty: 'legendary', emoji: '👑' },
];

// ============================================================
// Initial State Factory
// ============================================================

function wzCreateInitialState(seed?: number): WizardAcademyState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const rng = mulberry32(effectiveSeed);
  const houses = WZ_HOUSES;
  const houseIdx = Math.floor(rng() * houses.length);
  return {
    level: 1,
    xp: 0,
    coins: 80,
    mana: WZ_MAX_MANA,
    maxMana: WZ_MAX_MANA,
    houseId: houses[houseIdx].id,
    housePoints: 0,
    activeSpellBook: ['spark', 'minor_heal', 'light'],
    learnedSpells: [
      { spellId: 'spark', level: 'learned', currentXp: 0, castsCount: 0 },
      { spellId: 'minor_heal', level: 'learned', currentXp: 0, castsCount: 0 },
      { spellId: 'light', level: 'learned', currentXp: 0, castsCount: 0 },
    ],
    unlockedClasses: ['class_elemental_basics', 'class_healing_arts'],
    completedClasses: [],
    activeRoom: 'great_hall',
    familiarId: null,
    familiarBonded: false,
    professorsMet: [],
    totalSpellsCast: 0,
    totalDuelsWon: 0,
    totalDuelsLost: 0,
    totalLessonsAttended: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    totalManaRegenerated: 0,
    castCountBySchool: {
      elemental: 0, dark_arts: 0, healing: 0, enchantment: 0,
      divination: 0, conjuration: 0, illusion: 0, abjuration: 0,
    },
    castCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    grandmasterCount: 0,
    dailyStreak: 0,
    lastDaily: null,
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: WZ_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    dailyTask: null,
    seed: effectiveSeed,
    duelsToday: 0,
    lessonsToday: 0,
  };
}

// ============================================================
// Hook: useWizardAcademy
// ============================================================

export default function useWizardAcademy(initialSeed?: number) {
  const [state, setState] = useState<WizardAcademyState>(() => wzCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // ---- Core State ----

  const wzGetState = useCallback((): Readonly<WizardAcademyState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const wzResetState = useCallback((newSeed?: number) => {
    const s = wzCreateInitialState(newSeed);
    prngRef.current = mulberry32(s.seed);
    setState(s);
  }, []);

  const wzSeed = useCallback((seed: number) => {
    prngRef.current = mulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const wzRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const wzRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const wzRandomChoice = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const wzGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const wzGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const wzGetXPTillNext = useCallback((): number => {
    return wzXpRequiredForLevel(state.level);
  }, [state.level]);

  const wzGetXPProgress = useCallback((): number => {
    const needed = wzXpRequiredForLevel(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const wzAddXP = useCallback((amount: number): WizardAcademyState => {
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < WZ_MAX_LEVEL && xp >= wzXpRequiredForLevel(level)) {
        xp -= wzXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= WZ_MAX_LEVEL) xp = 0;
      next = { ...prev, level: wzClampLevel(level), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Title ----

  const wzGetTitle = useCallback((): WZTitleInfo => {
    let current = WZ_TITLE_THRESHOLDS[0];
    for (const t of WZ_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const wzGetAllTitles = useCallback((): WZTitleInfo[] => {
    return [...WZ_TITLE_THRESHOLDS];
  }, []);

  const wzGetNextTitle = useCallback((): WZTitleInfo | null => {
    for (const t of WZ_TITLE_THRESHOLDS) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Coins ----

  const wzGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const wzAddCoins = useCallback((amount: number): WizardAcademyState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: wzClampCoins(prev.coins + amount), totalCoinsEarned: prev.totalCoinsEarned + Math.max(0, amount) };
      return next;
    });
    return next;
  }, [state]);

  const wzSpendCoins = useCallback((amount: number): { success: boolean; state: WizardAcademyState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: wzClampCoins(prev.coins - amount), totalCoinsSpent: prev.totalCoinsSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const wzCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Mana ----

  const wzGetMana = useCallback((): number => {
    return state.mana;
  }, [state.mana]);

  const wzGetMaxMana = useCallback((): number => {
    return state.maxMana;
  }, [state.maxMana]);

  const wzGetManaPercent = useCallback((): number => {
    if (state.maxMana <= 0) return 0;
    return state.mana / state.maxMana;
  }, [state.mana, state.maxMana]);

  const wzUseMana = useCallback((amount: number): boolean => {
    if (state.mana < amount) return false;
    setState((prev) => ({ ...prev, mana: wzClampMana(prev.mana - amount) }));
    return true;
  }, [state.mana]);

  const wzRegenMana = useCallback((amount: number): WizardAcademyState => {
    let next = state;
    setState((prev) => {
      const newMana = Math.min(prev.maxMana, prev.mana + amount);
      next = { ...prev, mana: newMana, totalManaRegenerated: prev.totalManaRegenerated + (newMana - prev.mana) };
      return next;
    });
    return next;
  }, [state]);

  const wzRestMana = useCallback((): WizardAcademyState => {
    let next = state;
    setState((prev) => {
      const restored = prev.maxMana - prev.mana;
      next = { ...prev, mana: prev.maxMana, totalManaRegenerated: prev.totalManaRegenerated + restored };
      return next;
    });
    return next;
  }, [state]);

  // ---- Spells ----

  const wzGetSpells = useCallback((): WZSpellDef[] => {
    return [...WZ_SPELLS];
  }, []);

  const wzGetSpell = useCallback((spellId: string): WZSpellDef | null => {
    return WZ_SPELLS.find((s) => s.id === spellId) ?? null;
  }, []);

  const wzGetLearnedSpells = useCallback((): WZSpellMastery[] => {
    return [...state.learnedSpells];
  }, [state.learnedSpells]);

  const wzGetActiveSpellBook = useCallback((): WZSpellDef[] => {
    return WZ_SPELLS.filter((s) => state.activeSpellBook.includes(s.id));
  }, [state.activeSpellBook]);

  const wzGetSpellDefForMastery = useCallback((mastery: WZSpellMastery): WZSpellDef | null => {
    return WZ_SPELLS.find((s) => s.id === mastery.spellId) ?? null;
  }, []);

  const wzIsSpellLearned = useCallback((spellId: string): boolean => {
    return state.learnedSpells.some((m) => m.spellId === spellId);
  }, [state.learnedSpells]);

  const wzGetSpellMastery = useCallback((spellId: string): WZSpellMastery | null => {
    return state.learnedSpells.find((m) => m.spellId === spellId) ?? null;
  }, [state.learnedSpells]);

  const wzLearnSpell = useCallback((spellId: string): { success: boolean; state: WizardAcademyState } => {
    const spellDef = WZ_SPELLS.find((s) => s.id === spellId);
    if (!spellDef) return { success: false, state };
    if (state.level < spellDef.requiredLevel) return { success: false, state };
    if (state.learnedSpells.some((m) => m.spellId === spellId)) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newMastery: WZSpellMastery = {
        spellId,
        level: 'learned',
        currentXp: 0,
        castsCount: 0,
      };
      next = {
        ...prev,
        learnedSpells: [...prev.learnedSpells, newMastery],
        activeSpellBook: [...prev.activeSpellBook, spellId],
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const wzAddSpellToBook = useCallback((spellId: string): boolean => {
    if (!state.learnedSpells.some((m) => m.spellId === spellId)) return false;
    if (state.activeSpellBook.includes(spellId)) return false;
    setState((prev) => ({ ...prev, activeSpellBook: [...prev.activeSpellBook, spellId] }));
    return true;
  }, [state]);

  const wzRemoveSpellFromBook = useCallback((spellId: string): boolean => {
    if (!state.activeSpellBook.includes(spellId)) return false;
    setState((prev) => ({ ...prev, activeSpellBook: prev.activeSpellBook.filter((id) => id !== spellId) }));
    return true;
  }, [state]);

  const wzCastSpell = useCallback((spellId: string): WZSpellCastResult => {
    const spellDef = WZ_SPELLS.find((s) => s.id === spellId);
    const mastery = state.learnedSpells.find((m) => m.spellId === spellId);
    if (!spellDef || !mastery) {
      return { spellId, spellName: spellId, success: false, manaUsed: 0, xpGained: 0, masteryXpGained: 0, damageDealt: 0, healingDone: 0, shieldGained: 0, critHit: false, backfired: false };
    }
    if (state.mana < spellDef.manaCost) {
      return { spellId, spellName: spellDef.name, success: false, manaUsed: 0, xpGained: 0, masteryXpGained: 0, damageDealt: 0, healingDone: 0, shieldGained: 0, critHit: false, backfired: false };
    }
    const rng = prngRef.current();
    const masteryMult = wzMasteryMultiplier(mastery.level);
    // Backfire chance: lower with higher mastery
    const backfireChance = mastery.level === 'learned' ? 0.1 : mastery.level === 'practiced' ? 0.05 : mastery.level === 'mastered' ? 0.02 : 0.005;
    const backfired = rng < backfireChance;
    // Crit chance: higher with higher mastery
    const critChance = mastery.level === 'learned' ? 0.05 : mastery.level === 'practiced' ? 0.1 : mastery.level === 'mastered' ? 0.15 : 0.25;
    const critHit = rng < critChance;
    const critMult = critHit ? 2 : 1;
    const backfireMult = backfired ? 0.3 : 1;
    const damageDealt = backfired ? 0 : Math.floor(spellDef.damage * masteryMult * critMult);
    const healingDone = backfired ? 0 : Math.floor(spellDef.healing * masteryMult * critMult);
    const shieldGained = backfired ? 0 : Math.floor(spellDef.shield * masteryMult * critMult);
    const baseXP = Math.floor(5 * wzRarityMultiplier(spellDef.rarity) * backfireMult);
    const masteryXP = Math.floor((3 + wzRarityMultiplier(spellDef.rarity) * 2) * backfireMult);
    let next = state;
    setState((prev) => {
      // Update mastery
      const updatedSpells = prev.learnedSpells.map((m) => {
        if (m.spellId !== spellId) return m;
        let newMasteryLevel = m.level;
        let newCurrentXp = m.currentXp + masteryXP;
        const def = WZ_SPELLS.find((s) => s.id === spellId)!;
        if (m.level === 'learned' && newCurrentXp >= def.masteryXpToPractice) {
          newMasteryLevel = 'practiced';
          newCurrentXp -= def.masteryXpToPractice;
        }
        if (newMasteryLevel === 'practiced' && newCurrentXp >= def.masteryXpToMaster) {
          newMasteryLevel = 'mastered';
          newCurrentXp -= def.masteryXpToMaster;
        }
        if (newMasteryLevel === 'mastered' && newCurrentXp >= def.masteryXpToGrandmaster) {
          newMasteryLevel = 'grandmaster';
          newCurrentXp = 0;
        }
        return { ...m, level: newMasteryLevel, currentXp: newCurrentXp, castsCount: m.castsCount + 1 };
      });
      const gmCount = updatedSpells.filter((m) => m.level === 'grandmaster').length;
      next = {
        ...prev,
        mana: prev.mana - spellDef.manaCost,
        xp: prev.xp + baseXP,
        totalSpellsCast: prev.totalSpellsCast + 1,
        learnedSpells: updatedSpells,
        grandmasterCount: gmCount,
        castCountBySchool: {
          ...prev.castCountBySchool,
          [spellDef.school]: prev.castCountBySchool[spellDef.school] + 1,
        },
        castCountByRarity: {
          ...prev.castCountByRarity,
          [spellDef.rarity]: prev.castCountByRarity[spellDef.rarity] + 1,
        },
      };
      // Check level up
      let { level, xp } = next;
      while (level < WZ_MAX_LEVEL && xp >= wzXpRequiredForLevel(level)) {
        xp -= wzXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= WZ_MAX_LEVEL) xp = 0;
      next = { ...next, level: wzClampLevel(level), xp };
      return next;
    });
    return {
      spellId,
      spellName: spellDef.name,
      success: true,
      manaUsed: spellDef.manaCost,
      xpGained: baseXP,
      masteryXpGained: masteryXP,
      damageDealt,
      healingDone,
      shieldGained,
      critHit,
      backfired,
    };
  }, [state]);

  const wzGetMasteryProgress = useCallback((spellId: string): { current: number; target: number; percent: number } | null => {
    const mastery = state.learnedSpells.find((m) => m.spellId === spellId);
    if (!mastery) return null;
    const def = WZ_SPELLS.find((s) => s.id === spellId);
    if (!def) return null;
    let target: number;
    switch (mastery.level) {
      case 'learned': target = def.masteryXpToPractice; break;
      case 'practiced': target = def.masteryXpToMaster; break;
      case 'mastered': target = def.masteryXpToGrandmaster; break;
      case 'grandmaster': target = 1; break;
      default: target = 1;
    }
    const percent = mastery.level === 'grandmaster' ? 1 : Math.min(1, mastery.currentXp / Math.max(1, target));
    return { current: mastery.currentXp, target, percent };
  }, [state.learnedSpells]);

  const wzGetSpellsBySchool = useCallback((school: WZSpellSchool): WZSpellDef[] => {
    return WZ_SPELLS.filter((s) => s.school === school);
  }, []);

  const wzGetSpellsByRarity = useCallback((rarity: WZRarity): WZSpellDef[] => {
    return WZ_SPELLS.filter((s) => s.rarity === rarity);
  }, []);

  const wzGetCastableSpells = useCallback((): WZSpellDef[] => {
    return WZ_SPELLS.filter((s) => state.activeSpellBook.includes(s.id) && state.mana >= s.manaCost);
  }, [state.activeSpellBook, state.mana]);

  // ---- Magic Classes ----

  const wzGetClasses = useCallback((): WZMagicClassDef[] => {
    return [...WZ_MAGIC_CLASSES];
  }, []);

  const wzGetClass = useCallback((classId: string): WZMagicClassDef | null => {
    return WZ_MAGIC_CLASSES.find((c) => c.id === classId) ?? null;
  }, []);

  const wzGetUnlockedClasses = useCallback((): WZMagicClassDef[] => {
    return WZ_MAGIC_CLASSES.filter((c) => state.unlockedClasses.includes(c.id));
  }, [state.unlockedClasses]);

  const wzGetAvailableClasses = useCallback((): WZMagicClassDef[] => {
    return WZ_MAGIC_CLASSES.filter(
      (c) => state.unlockedClasses.includes(c.id) && !state.completedClasses.includes(c.id) && state.level >= c.requiredLevel
    );
  }, [state.unlockedClasses, state.completedClasses, state.level]);

  const wzAttendClass = useCallback((classId: string): WZLessonResult => {
    const classDef = WZ_MAGIC_CLASSES.find((c) => c.id === classId);
    if (!classDef) return { classId, className: classId, xpEarned: 0, coinsEarned: 0, spellsPracticed: [], bonusXP: 0 };
    if (!state.unlockedClasses.includes(classId)) return { classId, className: classDef.name, xpEarned: 0, coinsEarned: 0, spellsPracticed: [], bonusXP: 0 };
    const rng = prngRef.current();
    // Learn new spells from class
    let learnedAny = false;
    const newSpells: string[] = [];
    let next = state;
    setState((prev) => {
      let updated = { ...prev };
      let updatedLearnedSpells = [...prev.learnedSpells];
      let updatedActiveBook = [...prev.activeSpellBook];
      const practicedSpells: string[] = [];
      for (const spellId of classDef.spellIds) {
        const spellDef = WZ_SPELLS.find((s) => s.id === spellId);
        if (!spellDef) continue;
        const existing = updatedLearnedSpells.find((m) => m.spellId === spellId);
        if (!existing && prev.level >= spellDef.requiredLevel) {
          updatedLearnedSpells = [...updatedLearnedSpells, { spellId, level: 'learned', currentXp: 0, castsCount: 0 }];
          if (!updatedActiveBook.includes(spellId)) {
            updatedActiveBook = [...updatedActiveBook, spellId];
          }
          newSpells.push(spellId);
          learnedAny = true;
        } else if (existing) {
          // Practice mastery XP
          const masteryXP = Math.floor(5 * wzRarityMultiplier(spellDef.rarity));
          updatedLearnedSpells = updatedLearnedSpells.map((m) => {
            if (m.spellId !== spellId) return m;
            let newMasteryLevel = m.level;
            let newCurrentXp = m.currentXp + masteryXP;
            if (m.level === 'learned' && newCurrentXp >= spellDef.masteryXpToPractice) {
              newMasteryLevel = 'practiced';
              newCurrentXp -= spellDef.masteryXpToPractice;
            }
            if (newMasteryLevel === 'practiced' && newCurrentXp >= spellDef.masteryXpToMaster) {
              newMasteryLevel = 'mastered';
              newCurrentXp -= spellDef.masteryXpToMaster;
            }
            if (newMasteryLevel === 'mastered' && newCurrentXp >= spellDef.masteryXpToGrandmaster) {
              newMasteryLevel = 'grandmaster';
              newCurrentXp = 0;
            }
            practicedSpells.push(spellId);
            return { ...m, level: newMasteryLevel, currentXp: newCurrentXp, castsCount: m.castsCount };
          });
        }
      }
      const gmCount = updatedLearnedSpells.filter((m) => m.level === 'grandmaster').length;
      const bonusXP = learnedAny ? Math.floor(classDef.xpReward * 0.5) : 0;
      const totalXP = classDef.xpReward + bonusXP;
      const profMet = updated.professorsMet.includes(classDef.professorId) ? updated.professorsMet : [...updated.professorsMet, classDef.professorId];
      let { level, xp } = updated;
      xp += totalXP;
      while (level < WZ_MAX_LEVEL && xp >= wzXpRequiredForLevel(level)) {
        xp -= wzXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= WZ_MAX_LEVEL) xp = 0;
      next = {
        ...updated,
        learnedSpells: updatedLearnedSpells,
        activeSpellBook: updatedActiveBook,
        xp,
        level: wzClampLevel(level),
        coins: wzClampCoins(updated.coins + classDef.coinReward),
        totalCoinsEarned: updated.totalCoinsEarned + classDef.coinReward,
        totalLessonsAttended: updated.totalLessonsAttended + 1,
        lessonsToday: updated.lessonsToday + 1,
        completedClasses: updated.completedClasses.includes(classId) ? updated.completedClasses : [...updated.completedClasses, classId],
        professorsMet: profMet,
        grandmasterCount: gmCount,
      };
      return next;
    });
    return {
      classId,
      className: classDef.name,
      xpEarned: classDef.xpReward,
      coinsEarned: classDef.coinReward,
      spellsPracticed: newSpells,
      bonusXP: newSpells.length > 0 ? Math.floor(classDef.xpReward * 0.5) : 0,
    };
  }, [state]);

  // ---- Rooms ----

  const wzGetRooms = useCallback((): WZRoomDef[] => {
    return [...WZ_ROOMS];
  }, []);

  const wzGetUnlockedRooms = useCallback((): WZRoomDef[] => {
    return WZ_ROOMS.filter((r) => state.level >= r.unlockedAtLevel);
  }, [state.level]);

  const wzGetActiveRoom = useCallback((): WZRoomDef | null => {
    return WZ_ROOMS.find((r) => r.id === state.activeRoom) ?? null;
  }, [state.activeRoom]);

  const wzSetActiveRoom = useCallback((roomId: string): boolean => {
    const room = WZ_ROOMS.find((r) => r.id === roomId);
    if (!room || state.level < room.unlockedAtLevel) return false;
    setState((prev) => ({ ...prev, activeRoom: roomId }));
    return true;
  }, [state.level]);

  // ---- Creatures / Familiars ----

  const wzGetCreatures = useCallback((): WZCreatureDef[] => {
    return [...WZ_CREATURES];
  }, []);

  const wzGetAvailableCreatures = useCallback((): WZCreatureDef[] => {
    return WZ_CREATURES.filter((c) => state.level >= c.requiredLevel);
  }, [state.level]);

  const wzGetFamiliar = useCallback((): WZCreatureDef | null => {
    if (!state.familiarId) return null;
    return WZ_CREATURES.find((c) => c.id === state.familiarId) ?? null;
  }, [state.familiarId]);

  const wzBondFamiliar = useCallback((creatureId: string): WZFamiliarBondResult => {
    const creatureDef = WZ_CREATURES.find((c) => c.id === creatureId);
    if (!creatureDef) return { creatureId, creatureName: creatureId, success: false, coinsSpent: 0 };
    if (state.level < creatureDef.requiredLevel) return { creatureId, creatureName: creatureDef.name, success: false, coinsSpent: 0 };
    const cost = Math.floor(30 * wzRarityMultiplier(creatureDef.rarity));
    if (state.coins < cost) return { creatureId, creatureName: creatureDef.name, success: false, coinsSpent: 0 };
    const rng = prngRef.current();
    // Bond success chance: 80% base, +5% per level above required
    const bonusChance = Math.min(0.2, (state.level - creatureDef.requiredLevel) * 0.02);
    const successChance = 0.8 + bonusChance;
    const success = rng < successChance;
    if (success) {
      setState((prev) => ({
        ...prev,
        coins: wzClampCoins(prev.coins - cost),
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        familiarId: creatureId,
        familiarBonded: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        coins: wzClampCoins(prev.coins - Math.floor(cost * 0.3)),
        totalCoinsSpent: prev.totalCoinsSpent + Math.floor(cost * 0.3),
      }));
    }
    return { creatureId, creatureName: creatureDef.name, success, coinsSpent: success ? cost : Math.floor(cost * 0.3) };
  }, [state]);

  const wzReleaseFamiliar = useCallback((): void => {
    setState((prev) => ({ ...prev, familiarId: null, familiarBonded: false }));
  }, []);

  const wzGetFamiliarBonus = useCallback((): { type: string; value: number } => {
    if (!state.familiarId) return { type: 'none', value: 0 };
    const creature = WZ_CREATURES.find((c) => c.id === state.familiarId);
    if (!creature) return { type: 'none', value: 0 };
    return { type: creature.bonusType, value: creature.bonusValue };
  }, [state.familiarId]);

  // ---- Houses ----

  const wzGetHouses = useCallback((): WZHouseDef[] => {
    return [...WZ_HOUSES];
  }, []);

  const wzGetHouse = useCallback((): WZHouseDef | null => {
    return WZ_HOUSES.find((h) => h.id === state.houseId) ?? null;
  }, [state.houseId]);

  const wzGetHousePoints = useCallback((): number => {
    return state.housePoints;
  }, [state.housePoints]);

  const wzAddHousePoints = useCallback((points: number): WizardAcademyState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, housePoints: prev.housePoints + points };
      return next;
    });
    return next;
  }, [state]);

  const wzGetHouseRankings = useCallback((): { houseId: string; name: string; emoji: string; points: number }[] => {
    // Simulate other houses based on player house points
    const rng = mulberry32(wzHashString('house_rankings_' + state.seed));
    const otherHouses = WZ_HOUSES.filter((h) => h.id !== state.houseId);
    const rankings = [
      { houseId: state.houseId, name: WZ_HOUSES.find((h) => h.id === state.houseId)?.name ?? '', emoji: WZ_HOUSES.find((h) => h.id === state.houseId)?.emoji ?? '', points: state.housePoints },
    ];
    for (const house of otherHouses) {
      const basePoints = Math.floor(state.housePoints * (0.6 + rng() * 0.8));
      rankings.push({ houseId: house.id, name: house.name, emoji: house.emoji, points: basePoints });
    }
    rankings.sort((a, b) => b.points - a.points);
    return rankings;
  }, [state.houseId, state.housePoints, state.seed]);

  // ---- Professors ----

  const wzGetProfessors = useCallback((): WZProfessorDef[] => {
    return [...WZ_PROFESSORS];
  }, []);

  const wzGetProfessor = useCallback((professorId: string): WZProfessorDef | null => {
    return WZ_PROFESSORS.find((p) => p.id === professorId) ?? null;
  }, []);

  const wzGetMetProfessors = useCallback((): WZProfessorDef[] => {
    return WZ_PROFESSORS.filter((p) => state.professorsMet.includes(p.id));
  }, [state.professorsMet]);

  // ---- Duels ----

  const wzGetDuelOpponents = useCallback((): typeof WZ_DUEL_OPPONENTS => {
    return WZ_DUEL_OPPONENTS.filter((o) => o.level <= state.level + 3);
  }, [state.level]);

  const wzInitiateDuel = useCallback((opponentId: string): WZDuelResult => {
    const opponent = WZ_DUEL_OPPONENTS.find((o) => o.id === opponentId);
    if (!opponent) {
      return { opponentId, opponentName: 'Unknown', won: false, coinsEarned: 0, xpEarned: 0, housePointsEarned: 0, roundsWon: 0, roundsLost: 0, spellsCast: [] };
    }
    const rng = prngRef.current;
    const playerSpells = state.activeSpellBook;
    if (playerSpells.length === 0) {
      return { opponentId, opponentName: opponent.name, won: false, coinsEarned: 0, xpEarned: 0, housePointsEarned: 0, roundsWon: 0, roundsLost: 3, spellsCast: [] };
    }
    // Simulate best of 5 rounds
    let playerWins = 0;
    let opponentWins = 0;
    const spellsCast: string[] = [];
    const totalRounds = 3;
    for (let round = 0; round < totalRounds; round++) {
      const playerSpellId = playerSpells[Math.floor(rng() * playerSpells.length)];
      const oppSpellId = opponent.spellIds[Math.floor(rng() * opponent.spellIds.length)];
      const playerDef = WZ_SPELLS.find((s) => s.id === playerSpellId);
      const oppDef = WZ_SPELLS.find((s) => s.id === oppSpellId);
      spellsCast.push(playerSpellId);
      if (!playerDef || !oppDef) continue;
      // Calculate round outcome
      const playerPower = playerDef.damage + playerDef.healing + playerDef.shield;
      const oppPower = oppDef.damage + oppDef.healing + oppDef.shield;
      const playerMastery = state.learnedSpells.find((m) => m.spellId === playerSpellId);
      const masteryBonus = playerMastery ? wzMasteryMultiplier(playerMastery.level) : 0.5;
      const levelAdvantage = (state.level - opponent.level) * 2;
      const roll = rng();
      const playerScore = (playerPower * masteryBonus + levelAdvantage) * (0.7 + roll * 0.6);
      const oppRoll = rng();
      const diffMult = opponent.difficulty === 'easy' ? 0.6 : opponent.difficulty === 'medium' ? 0.8 : opponent.difficulty === 'hard' ? 1.0 : 1.2;
      const oppScore = oppPower * diffMult * (0.7 + oppRoll * 0.6);
      if (playerScore >= oppScore) {
        playerWins++;
      } else {
        opponentWins++;
      }
    }
    const won = playerWins > opponentWins;
    const coinsEarned = won ? Math.floor(20 + opponent.level * 5 * wzRarityMultiplier(opponent.difficulty === 'legendary' ? 'epic' : opponent.difficulty === 'hard' ? 'rare' : 'uncommon')) : 5;
    const xpEarned = won ? Math.floor(15 + opponent.level * 3) : Math.floor(5 + opponent.level);
    const housePointsEarned = won ? WZ_HOUSE_POINTS_PER_WIN : 0;
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        coins: wzClampCoins(prev.coins + coinsEarned),
        totalCoinsEarned: prev.totalCoinsEarned + coinsEarned,
        totalDuelsWon: prev.totalDuelsWon + (won ? 1 : 0),
        totalDuelsLost: prev.totalDuelsLost + (won ? 0 : 1),
        duelsToday: prev.duelsToday + 1,
        housePoints: prev.housePoints + housePointsEarned,
      };
      let { level, xp } = next;
      xp += xpEarned;
      while (level < WZ_MAX_LEVEL && xp >= wzXpRequiredForLevel(level)) {
        xp -= wzXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= WZ_MAX_LEVEL) xp = 0;
      next = { ...next, level: wzClampLevel(level), xp };
      return next;
    });
    return { opponentId, opponentName: opponent.name, won, coinsEarned, xpEarned, housePointsEarned, roundsWon: playerWins, roundsLost: opponentWins, spellsCast };
  }, [state]);

  const wzGetDuelStats = useCallback((): { won: number; lost: number; ratio: number; total: number } => {
    const total = state.totalDuelsWon + state.totalDuelsLost;
    return { won: state.totalDuelsWon, lost: state.totalDuelsLost, ratio: total > 0 ? state.totalDuelsWon / total : 0, total };
  }, [state.totalDuelsWon, state.totalDuelsLost]);

  // ---- Quests ----

  const wzGetQuests = useCallback((): WZQuestDef[] => {
    return [...WZ_QUESTS];
  }, []);

  const wzGetActiveQuests = useCallback((): (WZQuestDef & { progress: number; completed: boolean })[] => {
    return state.activeQuests.map((qState) => {
      const def = WZ_QUESTS.find((q) => q.id === qState.id);
      if (!def) return { ...WZ_QUESTS[0], progress: 0, completed: false };
      return { ...def, progress: qState.progress, completed: qState.completed };
    });
  }, [state.activeQuests]);

  const wzGetAvailableQuests = useCallback((): WZQuestDef[] => {
    return WZ_QUESTS.filter(
      (q) => q.requiredLevel <= state.level
        && !state.activeQuests.some((a) => a.id === q.id)
        && !state.completedQuests.includes(q.id)
    );
  }, [state.activeQuests, state.completedQuests, state.level]);

  const wzAcceptQuest = useCallback((questId: string): boolean => {
    const def = WZ_QUESTS.find((q) => q.id === questId);
    if (!def) return false;
    if (state.activeQuests.some((q) => q.id === questId)) return false;
    if (state.completedQuests.includes(questId)) return false;
    if (state.level < def.requiredLevel) return false;
    setState((prev) => ({
      ...prev,
      activeQuests: [...prev.activeQuests, { id: questId, accepted: true, completed: false, progress: 0 }],
    }));
    return true;
  }, [state]);

  const wzGetQuestProgress = useCallback((questId: string): { progress: number; target: number; completed: boolean } | null => {
    const qState = state.activeQuests.find((q) => q.id === questId);
    if (!qState) return null;
    const def = WZ_QUESTS.find((q) => q.id === questId);
    if (!def) return null;
    return { progress: qState.progress, target: def.target, completed: qState.completed };
  }, [state.activeQuests]);

  const wzClaimQuest = useCallback((questId: string): { success: boolean; coins: number; xp: number; housePoints: number } => {
    const qState = state.activeQuests.find((q) => q.id === questId);
    if (!qState || !qState.completed) return { success: false, coins: 0, xp: 0, housePoints: 0 };
    const def = WZ_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, coins: 0, xp: 0, housePoints: 0 };
    setState((prev) => {
      let updated = {
        ...prev,
        coins: wzClampCoins(prev.coins + def.rewardCoins),
        totalCoinsEarned: prev.totalCoinsEarned + def.rewardCoins,
        housePoints: prev.housePoints + def.rewardHousePoints,
        activeQuests: prev.activeQuests.filter((q) => q.id !== questId),
        completedQuests: [...prev.completedQuests, questId],
      };
      let { level, xp } = updated;
      xp += def.rewardXP;
      while (level < WZ_MAX_LEVEL && xp >= wzXpRequiredForLevel(level)) {
        xp -= wzXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= WZ_MAX_LEVEL) xp = 0;
      return { ...updated, level: wzClampLevel(level), xp };
    });
    return { success: true, coins: def.rewardCoins, xp: def.rewardXP, housePoints: def.rewardHousePoints };
  }, [state.activeQuests]);

  // ---- NPCs ----

  const wzGetNPCs = useCallback((): WZNPCDef[] => {
    return [...WZ_NPCS];
  }, []);

  const wzGetNPC = useCallback((npcId: string): WZNPCDef | null => {
    return WZ_NPCS.find((n) => n.id === npcId) ?? null;
  }, []);

  // ---- Achievements ----

  const wzGetAchievements = useCallback((): WZAchievementDef[] => {
    return [...WZ_ACHIEVEMENTS];
  }, []);

  const wzGetUnlockedAchievements = useCallback((): WZAchievementDef[] => {
    return WZ_ACHIEVEMENTS.filter((a) => state.unlockedAchievements.some((s) => s.id === a.id && s.unlocked));
  }, [state.unlockedAchievements]);

  const wzGetAchievementState = useCallback((achievementId: string): WZAchievementState | null => {
    return state.unlockedAchievements.find((a) => a.id === achievementId) ?? null;
  }, [state.unlockedAchievements]);

  const wzCheckAchievements = useCallback((): WZAchievementDef[] => {
    const conditionValues: Record<string, number> = {
      totalSpellsCast: state.totalSpellsCast,
      learnedSpellsCount: state.learnedSpells.length,
      totalDuelsWon: state.totalDuelsWon,
      level: state.level,
      dailyStreak: state.dailyStreak,
      familiarBonded: state.familiarBonded ? 1 : 0,
      grandmasterCount: state.grandmasterCount,
    };
    const newlyUnlocked: WZAchievementDef[] = [];
    setState((prev) => {
      let updated = prev;
      for (const ach of WZ_ACHIEVEMENTS) {
        const current = prev.unlockedAchievements.find((a) => a.id === ach.id);
        if (current && current.unlocked) continue;
        const value = conditionValues[ach.conditionKey] ?? 0;
        if (value >= ach.targetValue) {
          newlyUnlocked.push(ach);
          updated = {
            ...updated,
            coins: wzClampCoins(updated.coins + ach.rewardCoins),
            totalCoinsEarned: updated.totalCoinsEarned + ach.rewardCoins,
            housePoints: updated.housePoints + ach.rewardHousePoints,
            unlockedAchievements: updated.unlockedAchievements.map((a) =>
              a.id === ach.id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
            ),
          };
          let { level, xp } = updated;
          xp += ach.rewardXP;
          while (level < WZ_MAX_LEVEL && xp >= wzXpRequiredForLevel(level)) {
            xp -= wzXpRequiredForLevel(level);
            level += 1;
          }
          if (level >= WZ_MAX_LEVEL) xp = 0;
          updated = { ...updated, level: wzClampLevel(level), xp };
        }
      }
      return updated;
    });
    return newlyUnlocked;
  }, [state]);

  // ---- Daily Task ----

  const wzGetDailyTaskPool = useCallback((): WZDailyTaskPoolDef[] => {
    return [...WZ_DAILY_TASK_POOL];
  }, []);

  const wzGetDailyTask = useCallback((): (WZDailyTaskPoolDef & { progress: number; claimed: boolean }) | null => {
    if (!state.dailyTask) return null;
    const def = WZ_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
    if (!def) return null;
    return { ...def, progress: state.dailyTask.progress, claimed: state.dailyTask.claimed };
  }, [state.dailyTask]);

  const wzRefreshDailyTask = useCallback((now: number): WZDailyTaskPoolDef => {
    const dayKey = wzGenerateDayKey(now);
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const def = WZ_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return def ?? WZ_DAILY_TASK_POOL[0];
    }
    const eligible = WZ_DAILY_TASK_POOL.filter((d) => {
      if (d.type === 'learn') return state.learnedSpells.length > 0;
      return true;
    });
    const task = eligible[Math.floor(prngRef.current() * eligible.length)];
    const streak = state.dailyTask?.dayKey !== dayKey
      ? (state.lastDaily === wzGenerateDayKey(now - 86400000) ? state.dailyStreak + 1 : 1)
      : state.dailyStreak;
    setState((prev) => ({
      ...prev,
      dailyTask: { poolId: task.id, progress: 0, claimed: false, dayKey },
      dailyStreak: streak,
      lastDaily: dayKey,
      duelsToday: prev.dailyTask?.dayKey !== dayKey ? 0 : prev.duelsToday,
      lessonsToday: prev.dailyTask?.dayKey !== dayKey ? 0 : prev.lessonsToday,
    }));
    return task;
  }, [state]);

  const wzClaimDailyTask = useCallback((): { success: boolean; coins: number; xp: number } => {
    if (!state.dailyTask || state.dailyTask.claimed || state.dailyTask.progress < WZ_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId)?.target) {
      return { success: false, coins: 0, xp: 0 };
    }
    const def = WZ_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId)!;
    setState((prev) => {
      let updated = {
        ...prev,
        coins: wzClampCoins(prev.coins + def.rewardCoins),
        totalCoinsEarned: prev.totalCoinsEarned + def.rewardCoins,
        dailyTask: prev.dailyTask ? { ...prev.dailyTask, claimed: true } : null,
      };
      let { level, xp } = updated;
      xp += def.rewardXP;
      while (level < WZ_MAX_LEVEL && xp >= wzXpRequiredForLevel(level)) {
        xp -= wzXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= WZ_MAX_LEVEL) xp = 0;
      return { ...updated, level: wzClampLevel(level), xp };
    });
    return { success: true, coins: def.rewardCoins, xp: def.rewardXP };
  }, [state.dailyTask]);

  const wzAdvanceDailyTask = useCallback((type: WZDailyType, amount: number): void => {
    if (!state.dailyTask || state.dailyTask.claimed) return;
    const def = WZ_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
    if (!def || def.type !== type) return;
    setState((prev) => ({
      ...prev,
      dailyTask: prev.dailyTask
        ? { ...prev.dailyTask, progress: Math.min(prev.dailyTask.progress + amount, def.target) }
        : null,
    }));
  }, [state.dailyTask]);

  // ---- Quest Progress Helper ----

  const wzAdvanceQuests = useCallback((type: WZQuestType, amount: number): void => {
    setState((prev) => {
      let updated = prev;
      for (const aq of updated.activeQuests) {
        if (aq.completed) continue;
        const def = WZ_QUESTS.find((q) => q.id === aq.id);
        if (!def || def.type !== type) continue;
        const newProgress = aq.progress + amount;
        const isCompleted = newProgress >= def.target;
        updated = {
          ...updated,
          activeQuests: updated.activeQuests.map((q) =>
            q.id === aq.id ? { ...q, progress: Math.min(newProgress, def.target), completed: isCompleted } : q
          ),
        };
      }
      return updated;
    });
  }, []);

  // ---- Stats ----

  const wzGetTotalSpellsCast = useCallback((): number => {
    return state.totalSpellsCast;
  }, [state.totalSpellsCast]);

  const wzGetCastCountBySchool = useCallback((): Record<WZSpellSchool, number> => {
    return { ...state.castCountBySchool };
  }, [state.castCountBySchool]);

  const wzGetCastCountByRarity = useCallback((): Record<WZRarity, number> => {
    return { ...state.castCountByRarity };
  }, [state.castCountByRarity]);

  const wzGetTotalLessonsAttended = useCallback((): number => {
    return state.totalLessonsAttended;
  }, [state.totalLessonsAttended]);

  const wzGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const wzGetSummary = useCallback((): {
    level: number; title: string; xp: number; xpTillNext: number; coins: number; mana: number; maxMana: number;
    houseName: string; housePoints: number; totalSpellsCast: number; totalDuelsWon: number; totalDuelsLost: number;
    totalLessonsAttended: number; learnedSpellCount: number; grandmasterCount: number; dailyStreak: number;
    familiarName: string | null; activeQuests: number; achievementsUnlocked: number;
  } => {
    const house = WZ_HOUSES.find((h) => h.id === state.houseId);
    const title = WZ_TITLE_THRESHOLDS.reduce((acc, t) => state.level >= t.levelRequired ? t : acc, WZ_TITLE_THRESHOLDS[0]);
    const familiar = state.familiarId ? WZ_CREATURES.find((c) => c.id === state.familiarId)?.name ?? null : null;
    return {
      level: state.level,
      title: title.name,
      xp: state.xp,
      xpTillNext: wzXpRequiredForLevel(state.level),
      coins: state.coins,
      mana: state.mana,
      maxMana: state.maxMana,
      houseName: house?.name ?? 'Unknown',
      housePoints: state.housePoints,
      totalSpellsCast: state.totalSpellsCast,
      totalDuelsWon: state.totalDuelsWon,
      totalDuelsLost: state.totalDuelsLost,
      totalLessonsAttended: state.totalLessonsAttended,
      learnedSpellCount: state.learnedSpells.length,
      grandmasterCount: state.grandmasterCount,
      dailyStreak: state.dailyStreak,
      familiarName: familiar,
      activeQuests: state.activeQuests.filter((q) => !q.completed).length,
      achievementsUnlocked: state.unlockedAchievements.filter((a) => a.unlocked).length,
    };
  }, [state]);

  const wzGetNetWorth = useCallback((): number => {
    return state.coins + state.housePoints * 2;
  }, [state.coins, state.housePoints]);

  const wzGetSpellSchoolDistribution = useCallback((): { school: WZSpellSchool; count: number; percent: number }[] => {
    const total = state.totalSpellsCast || 1;
    return (Object.keys(state.castCountBySchool) as WZSpellSchool[]).map((school) => ({
      school,
      count: state.castCountBySchool[school],
      percent: state.castCountBySchool[school] / total,
    }));
  }, [state.castCountBySchool, state.totalSpellsCast]);

  const wzGetTopSpells = useCallback((limit: number = 5): { spellId: string; spellName: string; casts: number }[] => {
    return state.learnedSpells
      .sort((a, b) => b.castsCount - a.castsCount)
      .slice(0, limit)
      .map((m) => {
        const def = WZ_SPELLS.find((s) => s.id === m.spellId);
        return { spellId: m.spellId, spellName: def?.name ?? m.spellId, casts: m.castsCount };
      });
  }, [state.learnedSpells]);

  // ---- Simulation ----

  const wzSimulateDuel = useCallback((opponentId: string, spellId: string): { estimatedWinChance: number; description: string } => {
    const opponent = WZ_DUEL_OPPONENTS.find((o) => o.id === opponentId);
    const spellDef = WZ_SPELLS.find((s) => s.id === spellId);
    if (!opponent || !spellDef) return { estimatedWinChance: 0, description: 'Invalid opponent or spell' };
    const playerPower = spellDef.damage + spellDef.healing + spellDef.shield;
    const oppAvgPower = opponent.spellIds.reduce((sum, id) => {
      const def = WZ_SPELLS.find((s) => s.id === id);
      return sum + (def ? def.damage + def.healing + def.shield : 0);
    }, 0) / Math.max(1, opponent.spellIds.length);
    const mastery = state.learnedSpells.find((m) => m.spellId === spellId);
    const masteryBonus = mastery ? wzMasteryMultiplier(mastery.level) : 0.5;
    const levelAdvantage = (state.level - opponent.level) * 0.05;
    const diffMult = opponent.difficulty === 'easy' ? 0.6 : opponent.difficulty === 'medium' ? 0.8 : opponent.difficulty === 'hard' ? 1.0 : 1.2;
    const winChance = Math.min(0.95, Math.max(0.05, (playerPower * masteryBonus) / (oppAvgPower * diffMult) * 0.5 + 0.5 + levelAdvantage));
    const description = winChance > 0.7 ? 'Favorable matchup' : winChance > 0.4 ? 'Evenly matched' : 'Difficult opponent';
    return { estimatedWinChance: winChance, description };
  }, [state.learnedSpells, state.level]);

  const wzGetRecommendedSpell = useCallback((): WZSpellDef | null => {
    const castable = WZ_SPELLS.filter((s) => state.activeSpellBook.includes(s.id) && state.mana >= s.manaCost);
    if (castable.length === 0) return null;
    return castable.reduce((best, spell) => {
      const mastery = state.learnedSpells.find((m) => m.spellId === spell.id);
      const mMult = mastery ? wzMasteryMultiplier(mastery.level) : 1;
      const score = (spell.damage + spell.healing + spell.shield) * mMult * wzRarityMultiplier(spell.rarity);
      const bestMastery = state.learnedSpells.find((m) => m.spellId === best.id);
      const bestMMult = bestMastery ? wzMasteryMultiplier(bestMastery.level) : 1;
      const bestScore = (best.damage + best.healing + best.shield) * bestMMult * wzRarityMultiplier(best.rarity);
      return score > bestScore ? spell : best;
    });
  }, [state.activeSpellBook, state.learnedSpells, state.mana]);

  const wzGetNextSpellToLearn = useCallback((): WZSpellDef | null => {
    const available = WZ_SPELLS.filter(
      (s) => s.requiredLevel <= state.level && !state.learnedSpells.some((m) => m.spellId === s.id)
    );
    if (available.length === 0) return null;
    return available.sort((a, b) => {
      const aRar = wzRarityMultiplier(a.rarity);
      const bRar = wzRarityMultiplier(b.rarity);
      if (bRar !== aRar) return bRar - aRar;
      return a.requiredLevel - b.requiredLevel;
    })[0];
  }, [state.learnedSpells, state.level]);

  // ============================================================
  // API Object
  // ============================================================

  return {
    // Core
    wzGetState,
    wzResetState,
    wzSeed,
    wzRandom,
    wzRandomInt,
    wzRandomChoice,

    // Level / XP
    wzGetLevel,
    wzGetXP,
    wzGetXPTillNext,
    wzGetXPProgress,
    wzAddXP,

    // Title
    wzGetTitle,
    wzGetAllTitles,
    wzGetNextTitle,

    // Coins
    wzGetCoins,
    wzAddCoins,
    wzSpendCoins,
    wzCanAfford,

    // Mana
    wzGetMana,
    wzGetMaxMana,
    wzGetManaPercent,
    wzUseMana,
    wzRegenMana,
    wzRestMana,

    // Spells
    wzGetSpells,
    wzGetSpell,
    wzGetLearnedSpells,
    wzGetActiveSpellBook,
    wzGetSpellDefForMastery,
    wzIsSpellLearned,
    wzGetSpellMastery,
    wzLearnSpell,
    wzAddSpellToBook,
    wzRemoveSpellFromBook,
    wzCastSpell,
    wzGetMasteryProgress,
    wzGetSpellsBySchool,
    wzGetSpellsByRarity,
    wzGetCastableSpells,

    // Magic Classes
    wzGetClasses,
    wzGetClass,
    wzGetUnlockedClasses,
    wzGetAvailableClasses,
    wzAttendClass,

    // Rooms
    wzGetRooms,
    wzGetUnlockedRooms,
    wzGetActiveRoom,
    wzSetActiveRoom,

    // Creatures
    wzGetCreatures,
    wzGetAvailableCreatures,
    wzGetFamiliar,
    wzBondFamiliar,
    wzReleaseFamiliar,
    wzGetFamiliarBonus,

    // Houses
    wzGetHouses,
    wzGetHouse,
    wzGetHousePoints,
    wzAddHousePoints,
    wzGetHouseRankings,

    // Professors
    wzGetProfessors,
    wzGetProfessor,
    wzGetMetProfessors,

    // Duels
    wzGetDuelOpponents,
    wzInitiateDuel,
    wzGetDuelStats,

    // Quests
    wzGetQuests,
    wzGetActiveQuests,
    wzGetAvailableQuests,
    wzAcceptQuest,
    wzGetQuestProgress,
    wzClaimQuest,
    wzAdvanceQuests,

    // NPCs
    wzGetNPCs,
    wzGetNPC,

    // Achievements
    wzGetAchievements,
    wzGetUnlockedAchievements,
    wzGetAchievementState,
    wzCheckAchievements,

    // Daily
    wzGetDailyTaskPool,
    wzGetDailyTask,
    wzRefreshDailyTask,
    wzClaimDailyTask,
    wzAdvanceDailyTask,
    wzGetDailyStreak,

    // Stats
    wzGetTotalSpellsCast,
    wzGetCastCountBySchool,
    wzGetCastCountByRarity,
    wzGetTotalLessonsAttended,
    wzGetSummary,
    wzGetNetWorth,
    wzGetSpellSchoolDistribution,
    wzGetTopSpells,

    // Simulation
    wzSimulateDuel,
    wzGetRecommendedSpell,
    wzGetNextSpellToLearn,
  };
}
