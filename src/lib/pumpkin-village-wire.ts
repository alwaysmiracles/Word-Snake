'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// Pumpkin Village Wire — Halloween-Themed Pumpkin Farming & Spooky Village
// All constants prefixed with PV_, hook-based API via usePumpkinVillage().
// Color theme: orange / purple / dark green / black
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PvRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type PvAreaId =
  | 'pumpkin_patch' | 'haunted_farm' | 'spider_cellar' | 'witchs_garden'
  | 'moonlight_market' | 'ghost_orchard' | 'candy_workshop' | 'shadow_crypt';
export type PvWeatherType =
  | 'clear' | 'foggy' | 'full_moon' | 'thunderstorm' | 'haunted_mist' | 'blood_moon';
export type PvEventId =
  | 'trick_or_treat' | 'pumpkin_festival' | 'witchs_night' | 'ghost_parade'
  | 'harvest_moon_rise' | 'shadow_invasion' | 'candy_comet' | 'soul_harvest'
  | 'bonfire_night' | 'eternal_halloween';

export interface PvPumpkinDef {
  id: string;
  name: string;
  rarity: PvRarity;
  growTimeMinutes: number;
  candyCoinsPerHarvest: number;
  xpPerHarvest: number;
  seedCost: number;
  description: string;
  emoji: string;
  color: string;
  defenseBonus: number;
}

export interface PvAreaDef {
  id: PvAreaId;
  name: string;
  description: string;
  emoji: string;
  unlockLevel: number;
  unlockCost: number;
  maxPlots: number;
  color: string;
  specialBonus: string;
}

export interface PvRecipeDef {
  id: string;
  name: string;
  ingredients: { pumpkinId: string; amount: number }[];
  craftTimeSeconds: number;
  resultItem: string;
  resultEmoji: string;
  resultDescription: string;
  candyCoinValue: number;
  xpReward: number;
  defenseValue: number;
  requiredLevel: number;
  emoji: string;
  color: string;
}

export interface PvDecorationDef {
  id: string;
  name: string;
  areaId: PvAreaId;
  cost: number;
  spookinessBonus: number;
  defenseBonus: number;
  description: string;
  emoji: string;
  color: string;
}

export interface PvNpcDef {
  id: string;
  name: string;
  role: string;
  description: string;
  emoji: string;
  greeting: string;
  visitReward: { coins: number; xp: number };
  requiredLevel: number;
}

export interface PvEnemyDef {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  description: string;
  emoji: string;
  color: string;
  xpReward: number;
  candyCoinReward: number;
  dropChance: number;
  spawnArea: PvAreaId[];
}

export interface PvEventDef {
  id: PvEventId;
  name: string;
  description: string;
  durationHours: number;
  xpMultiplier: number;
  coinMultiplier: number;
  spawnRateMultiplier: number;
  specialReward: string;
  emoji: string;
  color: string;
}

export interface PvAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  icon: string;
}

export interface PvTitleDef {
  minLevel: number;
  title: string;
  description: string;
}

export interface PvWeatherDef {
  id: PvWeatherType;
  name: string;
  description: string;
  growSpeedMultiplier: number;
  enemyStrengthMultiplier: number;
  visibilityReduction: number;
  emoji: string;
  color: string;
}

export interface PvPlotState {
  plotIndex: number;
  areaId: PvAreaId;
  pumpkinId: string | null;
  plantedAt: number | null;
  growthProgress: number;
  readyToHarvest: boolean;
  watered: boolean;
  fertilized: boolean;
}

export interface PvInventoryItem {
  itemId: string;
  count: number;
}

export interface PvDefenseUnit {
  unitId: string;
  position: number;
  hp: number;
  maxHp: number;
  attack: number;
}

export interface PvEnemyInstance {
  enemyId: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  position: number;
}

export interface PvAchievementState {
  achievementId: string;
  unlocked: boolean;
  progress: number;
}

export interface PvEventState {
  eventId: PvEventId;
  active: boolean;
  startTime: number | null;
  progress: number;
}

export interface PvDailyQuest {
  id: string;
  name: string;
  description: string;
  type: 'plant' | 'harvest' | 'craft' | 'defend' | 'trick_or_treat' | 'npc_visit';
  target: number;
  progress: number;
  rewardCoins: number;
  rewardXP: number;
  completed: boolean;
  claimed: boolean;
  emoji: string;
}

export interface PvStats {
  totalPumpkinsPlanted: number;
  totalPumpkinsHarvested: number;
  totalItemsCrafted: number;
  totalEnemiesDefeated: number;
  totalDecorationsPlaced: number;
  totalNpcsVisited: number;
  totalTrickOrTreats: number;
  totalCandyCoinsEarned: number;
  totalCandyCoinsSpent: number;
  totalXPEarned: number;
  totalDefensesWon: number;
  totalDefensesLost: number;
  currentStreak: number;
  longestStreak: number;
}

export interface PvNpcVisitState {
  npcId: string;
  met: boolean;
  timesVisited: number;
  lastVisitDate: string | null;
}

export interface PvBattleLog {
  timestamp: number;
  enemyName: string;
  result: 'won' | 'lost';
  xpGained: number;
  coinsGained: number;
}

export interface PvPumpkinVillageState {
  level: number;
  xp: number;
  totalXp: number;
  candyCoins: number;
  title: string;
  seed: number;

  plots: PvPlotState[];
  inventory: PvInventoryItem[];
  achievements: PvAchievementState[];
  events: PvEventState[];
  dailyQuests: PvDailyQuest[];
  npcVisits: PvNpcVisitState[];

  currentWeather: PvWeatherType;
  weatherEndTime: number;

  defenseUnits: PvDefenseUnit[];
  activeEnemies: PvEnemyInstance[];
  battleLog: PvBattleLog[];
  villageDefense: number;
  villageSpookiness: number;

  stats: PvStats;
  dailyDate: string | null;
  lastTrickOrTreatTime: number;
  selectedArea: PvAreaId;
}

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32)
// ---------------------------------------------------------------------------

function pvMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Constants (all PV_ prefixed)
// ---------------------------------------------------------------------------

export const PV_MAX_LEVEL = 50;
export const PV_MAX_PLOTS_PER_AREA = 12;
export const PV_MAX_DEFENSE_UNITS = 10;
export const PV_MAX_INVENTORY = 200;
export const PV_WEATHER_DURATION_MINUTES = 30;
export const PV_TRICK_OR_TREAT_COOLDOWN_MS = 60000;
export const PV_DAILY_QUEST_COUNT = 3;

export const PV_RARITY_COLORS: Record<PvRarity, string> = {
  Common: '#A3A3A3',
  Uncommon: '#4ADE80',
  Rare: '#60A5FA',
  Epic: '#C084FC',
  Legendary: '#F59E0B',
};

export const PV_RARITY_MULTIPLIERS: Record<PvRarity, number> = {
  Common: 1,
  Uncommon: 1.5,
  Rare: 2.2,
  Epic: 3.5,
  Legendary: 5.0,
};

// ---------------------------------------------------------------------------
// 35 Pumpkin Varieties
// ---------------------------------------------------------------------------

export const PV_PUMPKIN_TYPES: PvPumpkinDef[] = [
  // Common (7)
  { id: 'classic_orange', name: 'Classic Orange', rarity: 'Common', growTimeMinutes: 5, candyCoinsPerHarvest: 10, xpPerHarvest: 8, seedCost: 5, description: 'The quintessential Halloween pumpkin. Bright orange and perfect for carving.', emoji: '🎃', color: '#F97316', defenseBonus: 1 },
  { id: 'sugar_pie', name: 'Sugar Pie', rarity: 'Common', growTimeMinutes: 4, candyCoinsPerHarvest: 8, xpPerHarvest: 6, seedCost: 4, description: 'A small, sweet pumpkin ideal for baking pies and tarts.', emoji: '🥧', color: '#FDBA74', defenseBonus: 0 },
  { id: 'jack_o_lantern', name: "Jack O'Lantern", rarity: 'Common', growTimeMinutes: 6, candyCoinsPerHarvest: 12, xpPerHarvest: 10, seedCost: 6, description: 'Specially bred for carving with a perfect round shape and thick walls.', emoji: '😶', color: '#EA580C', defenseBonus: 2 },
  { id: 'cinderella', name: 'Cinderella', rarity: 'Common', growTimeMinutes: 7, candyCoinsPerHarvest: 14, xpPerHarvest: 11, seedCost: 7, description: 'A fairytale-shaped pumpkin in a beautiful ruby red-orange hue.', emoji: '✨', color: '#DC2626', defenseBonus: 1 },
  { id: 'lumina', name: 'Lumina', rarity: 'Common', growTimeMinutes: 5, candyCoinsPerHarvest: 10, xpPerHarvest: 9, seedCost: 5, description: 'A ghostly white pumpkin that glows faintly under moonlight.', emoji: '👻', color: '#E5E7EB', defenseBonus: 2 },
  { id: 'spaghetti', name: 'Spaghetti', rarity: 'Common', growTimeMinutes: 6, candyCoinsPerHarvest: 9, xpPerHarvest: 7, seedCost: 5, description: 'Strand-like flesh perfect for spooky pasta dishes.', emoji: '🍝', color: '#FBBF24', defenseBonus: 0 },
  { id: 'delicata', name: 'Delicata', rarity: 'Common', growTimeMinutes: 4, candyCoinsPerHarvest: 8, xpPerHarvest: 6, seedCost: 4, description: 'A small, elongated pumpkin with edible skin and sweet cream flesh.', emoji: '🫒', color: '#FDE68A', defenseBonus: 0 },
  // Uncommon (8)
  { id: 'ghost_pepper_pumpkin', name: 'Ghost Pepper Pumpkin', rarity: 'Uncommon', growTimeMinutes: 10, candyCoinsPerHarvest: 25, xpPerHarvest: 18, seedCost: 15, description: 'A fiery pumpkin infused with ghost pepper heat. Handle with care!', emoji: '🌶️', color: '#EF4444', defenseBonus: 4 },
  { id: 'warty_goblin', name: 'Warty Goblin', rarity: 'Uncommon', growTimeMinutes: 9, candyCoinsPerHarvest: 22, xpPerHarvest: 16, seedCost: 14, description: 'Covered in green warts, this pumpkin looks like it crawled from a swamp.', emoji: '👺', color: '#65A30D', defenseBonus: 5 },
  { id: 'knucklehead', name: 'Knucklehead', rarity: 'Uncommon', growTimeMinutes: 10, candyCoinsPerHarvest: 24, xpPerHarvest: 17, seedCost: 15, description: 'Bumpy and fierce, its knobby protrusions scare off pests.', emoji: '🤜', color: '#92400E', defenseBonus: 5 },
  { id: 'goosebumps', name: 'Goosebumps', rarity: 'Uncommon', growTimeMinutes: 8, candyCoinsPerHarvest: 20, xpPerHarvest: 15, seedCost: 12, description: 'Tiny pebbled bumps cover this pumpkin, raising goosebumps on anyone who touches it.', emoji: '😱', color: '#D97706', defenseBonus: 3 },
  { id: 'marina_di_chioggia', name: 'Marina di Chioggia', rarity: 'Uncommon', growTimeMinutes: 12, candyCoinsPerHarvest: 26, xpPerHarvest: 19, seedCost: 16, description: 'A Venetian heirloom with deep green, blistered skin and sweet orange flesh.', emoji: '🌊', color: '#166534', defenseBonus: 4 },
  { id: 'kakai', name: 'Kakai', rarity: 'Uncommon', growTimeMinutes: 9, candyCoinsPerHarvest: 23, xpPerHarvest: 16, seedCost: 13, description: 'Produces hull-less seeds perfect for roasting, with striking orange and green stripes.', emoji: '🥜', color: '#CA8A04', defenseBonus: 3 },
  { id: 'red_kuri', name: 'Red Kuri', rarity: 'Uncommon', growTimeMinutes: 8, candyCoinsPerHarvest: 21, xpPerHarvest: 15, seedCost: 13, description: 'A teardrop-shaped Japanese pumpkin with chestnut-like flavor.', emoji: '🫘', color: '#B91C1C', defenseBonus: 3 },
  { id: 'buttercup', name: 'Buttercup', rarity: 'Uncommon', growTimeMinutes: 9, candyCoinsPerHarvest: 22, xpPerHarvest: 16, seedCost: 14, description: 'A dark green squash with a distinctive button on the bottom. Sweet and dense.', emoji: '🧈', color: '#15803D', defenseBonus: 3 },
  // Rare (8)
  { id: 'queensland_blue', name: 'Queensland Blue', rarity: 'Rare', growTimeMinutes: 18, candyCoinsPerHarvest: 55, xpPerHarvest: 35, seedCost: 40, description: 'A magnificent Australian pumpkin with deep ridges and steel blue skin.', emoji: '🇦🇺', color: '#1E40AF', defenseBonus: 8 },
  { id: 'jarrahdale', name: 'Jarrahdale', rarity: 'Rare', growTimeMinutes: 16, candyCoinsPerHarvest: 50, xpPerHarvest: 32, seedCost: 35, description: 'A slate-blue, heavily ribbed pumpkin from New Zealand with silvery skin.', emoji: '🪨', color: '#475569', defenseBonus: 7 },
  { id: 'black_futsu', name: 'Black Futsu', rarity: 'Rare', growTimeMinutes: 20, candyCoinsPerHarvest: 60, xpPerHarvest: 38, seedCost: 45, description: 'Starts black and ages to a dusty chestnut. Rare and deeply flavored.', emoji: '🖤', color: '#1C1917', defenseBonus: 10 },
  { id: 'crown_prince', name: 'Crown Prince', rarity: 'Rare', growTimeMinutes: 17, candyCoinsPerHarvest: 52, xpPerHarvest: 33, seedCost: 38, description: 'A regal grey-skinned pumpkin with vivid orange flesh fit for royalty.', emoji: '👑', color: '#6B7280', defenseBonus: 8 },
  { id: 'galeux_deysines', name: "Galeux d'Eysines", rarity: 'Rare', growTimeMinutes: 19, candyCoinsPerHarvest: 58, xpPerHarvest: 36, seedCost: 42, description: 'A French beauty covered in peanut-shell-like warts. Salmon-colored flesh is heavenly.', emoji: '🇫🇷', color: '#E11D48', defenseBonus: 7 },
  { id: 'musquee_de_provence', name: 'Musquee de Provence', rarity: 'Rare', growTimeMinutes: 22, candyCoinsPerHarvest: 62, xpPerHarvest: 40, seedCost: 48, description: 'A massive, flat, deeply ribbed French pumpkin that turns from dark green to ochre.', emoji: '🏰', color: '#9A3412', defenseBonus: 9 },
  { id: 'rouge_vif_detampes', name: "Rouge Vif d'Etampes", rarity: 'Rare', growTimeMinutes: 20, candyCoinsPerHarvest: 56, xpPerHarvest: 37, seedCost: 44, description: 'The original Cinderella pumpkin — a stunning deep red, ribbed beauty from France.', emoji: '💃', color: '#DC2626', defenseBonus: 8 },
  { id: 'hokkaido', name: 'Hokkaido', rarity: 'Rare', growTimeMinutes: 15, candyCoinsPerHarvest: 48, xpPerHarvest: 30, seedCost: 32, description: 'A beloved Japanese pumpkin with deep nutty flavor and vibrant orange flesh.', emoji: '🗻', color: '#EA580C', defenseBonus: 7 },
  // Epic (6)
  { id: 'triamble', name: 'Triamble', rarity: 'Epic', growTimeMinutes: 30, candyCoinsPerHarvest: 100, xpPerHarvest: 65, seedCost: 80, description: 'A rare three-lobed shield-shaped pumpkin. Said to ward off evil spirits.', emoji: '🛡️', color: '#334155', defenseBonus: 18 },
  { id: 'hubbard', name: 'Hubbard', rarity: 'Epic', growTimeMinutes: 28, candyCoinsPerHarvest: 90, xpPerHarvest: 58, seedCost: 70, description: 'A massive, bumpy squash that can grow to enormous sizes. Extremely tough.', emoji: '💪', color: '#713F12', defenseBonus: 15 },
  { id: 'acorn', name: 'Acorn', rarity: 'Epic', growTimeMinutes: 25, candyCoinsPerHarvest: 85, xpPerHarvest: 55, seedCost: 65, description: 'A dark green, acorn-shaped pumpkin with golden interior. Grows in enchanted forests.', emoji: '🌳', color: '#166534', defenseBonus: 14 },
  { id: 'butternut', name: 'Butternut', rarity: 'Epic', growTimeMinutes: 26, candyCoinsPerHarvest: 88, xpPerHarvest: 56, seedCost: 68, description: 'A pear-shaped pumpkin with smooth tan skin and impossibly sweet orange flesh.', emoji: '🍐', color: '#D97706', defenseBonus: 13 },
  { id: 'gem_squash', name: 'Gem Squash', rarity: 'Epic', growTimeMinutes: 27, candyCoinsPerHarvest: 92, xpPerHarvest: 60, seedCost: 72, description: 'A South African treasure — small, round, and packed with concentrated flavor.', emoji: '💎', color: '#7C3AED', defenseBonus: 16 },
  { id: 'sweet_dumpling', name: 'Sweet Dumpling', rarity: 'Epic', growTimeMinutes: 24, candyCoinsPerHarvest: 82, xpPerHarvest: 52, seedCost: 62, description: 'A miniature striped pumpkin with incredibly sweet, creamy flesh. Very rare.', emoji: '🍬', color: '#DB2777', defenseBonus: 12 },
  // Legendary (6)
  { id: 'carnival', name: 'Carnival', rarity: 'Legendary', growTimeMinutes: 40, candyCoinsPerHarvest: 180, xpPerHarvest: 120, seedCost: 150, description: 'A rainbow-striped pumpkin that shifts colors like a carnival. Truly magical.', emoji: '🎪', color: '#EC4899', defenseBonus: 25 },
  { id: 'turks_turban', name: "Turk's Turban", rarity: 'Legendary', growTimeMinutes: 38, candyCoinsPerHarvest: 170, xpPerHarvest: 115, seedCost: 140, description: 'Resembles a turban worn by ancient sultans. One of the most visually stunning pumpkins.', emoji: '🧕', color: '#DC2626', defenseBonus: 22 },
  { id: 'banana', name: 'Banana Pumpkin', rarity: 'Legendary', growTimeMinutes: 36, candyCoinsPerHarvest: 160, xpPerHarvest: 108, seedCost: 130, description: 'A long, curved, banana-shaped pumpkin. Extremely rare hybrid from the Candy Workshop.', emoji: '🍌', color: '#FBBF24', defenseBonus: 20 },
  { id: 'lupin', name: 'Lupin', rarity: 'Legendary', growTimeMinutes: 42, candyCoinsPerHarvest: 190, xpPerHarvest: 125, seedCost: 160, description: 'A mystical purple pumpkin that blooms under full moons. Named after the legendary werewolf flower.', emoji: '🐺', color: '#7C3AED', defenseBonus: 28 },
  { id: 'shadow_pumpkin', name: 'Shadow Pumpkin', rarity: 'Legendary', growTimeMinutes: 45, candyCoinsPerHarvest: 200, xpPerHarvest: 130, seedCost: 180, description: 'Grows only in complete darkness. Its flesh absorbs light and radiates darkness.', emoji: '🌑', color: '#1E1B4B', defenseBonus: 30 },
  { id: 'spirit_pumpkin', name: 'Spirit Pumpkin', rarity: 'Legendary', growTimeMinutes: 50, candyCoinsPerHarvest: 220, xpPerHarvest: 140, seedCost: 200, description: 'The rarest pumpkin in existence. Said to contain the souls of ancient Halloween spirits.', emoji: '✨', color: '#FDE68A', defenseBonus: 35 },
];

export const PV_ETERNAL_PUMPKIN: PvPumpkinDef = {
  id: 'eternal_pumpkin', name: 'Eternal Pumpkin', rarity: 'Legendary',
  growTimeMinutes: 60, candyCoinsPerHarvest: 500, xpPerHarvest: 300, seedCost: 9999,
  description: 'A pumpkin of pure legend. Never withers, never dies. The crown jewel of any village.',
  emoji: '👑', color: '#F59E0B', defenseBonus: 50,
};

// ---------------------------------------------------------------------------
// 8 Village Areas
// ---------------------------------------------------------------------------

export const PV_VILLAGE_AREAS: PvAreaDef[] = [
  { id: 'pumpkin_patch', name: 'Pumpkin Patch', description: 'The heart of the village where all pumpkins begin their journey.', emoji: '🎃', unlockLevel: 1, unlockCost: 0, maxPlots: 6, color: '#F97316', specialBonus: '+10% pumpkin growth speed' },
  { id: 'haunted_farm', name: 'Haunted Farm', description: 'A decrepit farmstead tended by ghostly scarecrows and skeletal farmers.', emoji: '🚜', unlockLevel: 5, unlockCost: 200, maxPlots: 8, color: '#65A30D', specialBonus: '+15% candy coin yield' },
  { id: 'spider_cellar', name: 'Spider Cellar', description: 'A dark underground cellar where giant spiders guard rare seed varieties.', emoji: '🕷️', unlockLevel: 10, unlockCost: 500, maxPlots: 8, color: '#1C1917', specialBonus: 'Unlocks Rare seed drops' },
  { id: 'witchs_garden', name: "Witch's Garden", description: 'An enchanted garden where magical herbs and cursed pumpkins grow in twisted patterns.', emoji: '🧙‍♀️', unlockLevel: 15, unlockCost: 1000, maxPlots: 10, color: '#7C3AED', specialBonus: '+20% XP from harvests' },
  { id: 'moonlight_market', name: 'Moonlight Market', description: 'A mystical bazaar that appears only at night, selling rare items and recipes.', emoji: '🌙', unlockLevel: 20, unlockCost: 2000, maxPlots: 10, color: '#1E3A5F', specialBonus: '+25% crafting speed' },
  { id: 'ghost_orchard', name: 'Ghost Orchard', description: 'Twisted trees bearing spectral fruit in this ethereal orchard of the dead.', emoji: '🌳', unlockLevel: 28, unlockCost: 3500, maxPlots: 10, color: '#475569', specialBonus: 'Unlocks Epic seed drops' },
  { id: 'candy_workshop', name: 'Candy Workshop', description: 'A sugary workshop where candy corn and pumpkin treats are crafted in bulk.', emoji: '🍬', unlockLevel: 35, unlockCost: 5000, maxPlots: 12, color: '#EC4899', specialBonus: '+30% all production' },
  { id: 'shadow_crypt', name: 'Shadow Crypt', description: 'The deepest, darkest corner of the village. Only the bravest farmers dare enter.', emoji: '⚰️', unlockLevel: 42, unlockCost: 8000, maxPlots: 12, color: '#0F172A', specialBonus: 'Unlocks Legendary pumpkin growth' },
];

// ---------------------------------------------------------------------------
// 25 Crafting Recipes
// ---------------------------------------------------------------------------

export const PV_RECIPES: PvRecipeDef[] = [
  { id: 'recipe_pumpkin_pie', name: 'Pumpkin Pie', ingredients: [{ pumpkinId: 'sugar_pie', amount: 3 }, { pumpkinId: 'classic_orange', amount: 1 }], craftTimeSeconds: 30, resultItem: 'pumpkin_pie', resultEmoji: '🥧', resultDescription: 'A warm, spiced pumpkin pie baked to golden perfection.', candyCoinValue: 40, xpReward: 25, defenseValue: 0, requiredLevel: 1, emoji: '🥧', color: '#D97706' },
  { id: 'recipe_jack_o_lantern', name: "Jack O'Lantern", ingredients: [{ pumpkinId: 'jack_o_lantern', amount: 2 }], craftTimeSeconds: 45, resultItem: 'jack_o_lantern_item', resultEmoji: '😄', resultDescription: 'A carved pumpkin with a menacing grin, used to scare enemies.', candyCoinValue: 30, xpReward: 30, defenseValue: 8, requiredLevel: 1, emoji: '😄', color: '#EA580C' },
  { id: 'recipe_scarecrow', name: 'Scarecrow', ingredients: [{ pumpkinId: 'classic_orange', amount: 2 }, { pumpkinId: 'lumina', amount: 1 }], craftTimeSeconds: 60, resultItem: 'scarecrow', resultEmoji: '🧟', resultDescription: 'A spooky scarecrow that protects your village from monsters.', candyCoinValue: 25, xpReward: 35, defenseValue: 12, requiredLevel: 3, emoji: '🧟', color: '#78350F' },
  { id: 'recipe_witchs_brew', name: "Witch's Brew", ingredients: [{ pumpkinId: 'ghost_pepper_pumpkin', amount: 1 }, { pumpkinId: 'warty_goblin', amount: 1 }], craftTimeSeconds: 90, resultItem: 'witchs_brew', resultEmoji: '🧪', resultDescription: 'A bubbling cauldron of mysterious green liquid with powerful effects.', candyCoinValue: 80, xpReward: 50, defenseValue: 15, requiredLevel: 5, emoji: '🧪', color: '#22C55E' },
  { id: 'recipe_pumpkin_bread', name: 'Pumpkin Bread', ingredients: [{ pumpkinId: 'buttercup', amount: 2 }, { pumpkinId: 'sugar_pie', amount: 1 }], craftTimeSeconds: 40, resultItem: 'pumpkin_bread', resultEmoji: '🍞', resultDescription: 'Dense, moist pumpkin bread with warm spices.', candyCoinValue: 35, xpReward: 28, defenseValue: 0, requiredLevel: 2, emoji: '🍞', color: '#D97706' },
  { id: 'recipe_candy_corn_staff', name: 'Candy Corn Staff', ingredients: [{ pumpkinId: 'carnival', amount: 1 }, { pumpkinId: 'delicata', amount: 3 }], craftTimeSeconds: 120, resultItem: 'candy_corn_staff', resultEmoji: '🍭', resultDescription: 'A powerful staff tipped with enchanted candy corn.', candyCoinValue: 120, xpReward: 80, defenseValue: 25, requiredLevel: 20, emoji: '🍭', color: '#F59E0B' },
  { id: 'recipe_pumpkin_soup', name: 'Pumpkin Soup', ingredients: [{ pumpkinId: 'hokkaido', amount: 2 }, { pumpkinId: 'red_kuri', amount: 1 }], craftTimeSeconds: 35, resultItem: 'pumpkin_soup', resultEmoji: '🍜', resultDescription: 'A silky, warming pumpkin soup with a hint of nutmeg.', candyCoinValue: 45, xpReward: 32, defenseValue: 0, requiredLevel: 8, emoji: '🍜', color: '#F97316' },
  { id: 'recipe_shadow_shield', name: 'Shadow Shield', ingredients: [{ pumpkinId: 'shadow_pumpkin', amount: 1 }, { pumpkinId: 'black_futsu', amount: 2 }], craftTimeSeconds: 180, resultItem: 'shadow_shield', resultEmoji: '🛡️', resultDescription: 'A shield forged from shadow essence, absorbing all dark attacks.', candyCoinValue: 250, xpReward: 150, defenseValue: 50, requiredLevel: 38, emoji: '🛡️', color: '#1E1B4B' },
  { id: 'recipe_pumpkin_spice_latte', name: 'Pumpkin Spice Latte', ingredients: [{ pumpkinId: 'sugar_pie', amount: 2 }, { pumpkinId: 'cinderella', amount: 1 }], craftTimeSeconds: 20, resultItem: 'pumpkin_spice_latte', resultEmoji: '☕', resultDescription: 'The essential autumn beverage. Boosts XP gain temporarily.', candyCoinValue: 30, xpReward: 20, defenseValue: 0, requiredLevel: 1, emoji: '☕', color: '#92400E' },
  { id: 'recipe_ghost_lantern', name: 'Ghost Lantern', ingredients: [{ pumpkinId: 'lumina', amount: 3 }, { pumpkinId: 'goosebumps', amount: 1 }], craftTimeSeconds: 50, resultItem: 'ghost_lantern', resultEmoji: '🏮', resultDescription: 'A lantern that guides friendly ghosts and repels evil spirits.', candyCoinValue: 60, xpReward: 40, defenseValue: 18, requiredLevel: 6, emoji: '🏮', color: '#E5E7EB' },
  { id: 'recipe_pumpkin_cannon', name: 'Pumpkin Cannon', ingredients: [{ pumpkinId: 'hubbard', amount: 2 }, { pumpkinId: 'knucklehead', amount: 2 }], craftTimeSeconds: 150, resultItem: 'pumpkin_cannon', resultEmoji: '💣', resultDescription: 'Launches explosive pumpkins at invading monsters.', candyCoinValue: 150, xpReward: 90, defenseValue: 35, requiredLevel: 15, emoji: '💣', color: '#713F12' },
  { id: 'recipe_roasted_seeds', name: 'Roasted Seeds', ingredients: [{ pumpkinId: 'kakai', amount: 3 }, { pumpkinId: 'delicata', amount: 1 }], craftTimeSeconds: 15, resultItem: 'roasted_seeds', resultEmoji: '🥜', resultDescription: 'Crunchy roasted pumpkin seeds — a classic Halloween snack.', candyCoinValue: 20, xpReward: 15, defenseValue: 0, requiredLevel: 1, emoji: '🥜', color: '#CA8A04' },
  { id: 'recipe_potion_of_fortune', name: 'Potion of Fortune', ingredients: [{ pumpkinId: 'carnival', amount: 1 }, { pumpkinId: 'banana', amount: 1 }], craftTimeSeconds: 120, resultItem: 'potion_of_fortune', resultEmoji: '🧴', resultDescription: 'Increases candy coin drops from all sources for a limited time.', candyCoinValue: 200, xpReward: 100, defenseValue: 0, requiredLevel: 25, emoji: '🧴', color: '#F59E0B' },
  { id: 'recipe_spooky_wreath', name: 'Spooky Wreath', ingredients: [{ pumpkinId: 'marina_di_chioggia', amount: 2 }, { pumpkinId: 'acorn', amount: 1 }], craftTimeSeconds: 70, resultItem: 'spooky_wreath', resultEmoji: '📿', resultDescription: 'A hauntingly beautiful wreath that boosts village defense.', candyCoinValue: 75, xpReward: 45, defenseValue: 20, requiredLevel: 10, emoji: '📿', color: '#166534' },
  { id: 'recipe_eternal_crown', name: 'Eternal Crown', ingredients: [{ pumpkinId: 'spirit_pumpkin', amount: 1 }, { pumpkinId: 'lupin', amount: 1 }, { pumpkinId: 'shadow_pumpkin', amount: 1 }], craftTimeSeconds: 300, resultItem: 'eternal_crown', resultEmoji: '👑', resultDescription: 'The ultimate crafting achievement. Grants immense power and prestige.', candyCoinValue: 999, xpReward: 500, defenseValue: 100, requiredLevel: 48, emoji: '👑', color: '#F59E0B' },
  { id: 'recipe_pumpkin_muffin', name: 'Pumpkin Muffin', ingredients: [{ pumpkinId: 'sweet_dumpling', amount: 2 }, { pumpkinId: 'sugar_pie', amount: 1 }], craftTimeSeconds: 25, resultItem: 'pumpkin_muffin', resultEmoji: '🧁', resultDescription: 'A perfectly spiced pumpkin muffin with cream cheese frosting.', candyCoinValue: 32, xpReward: 22, defenseValue: 0, requiredLevel: 3, emoji: '🧁', color: '#F97316' },
  { id: 'recipe_spectral_armor', name: 'Spectral Armor', ingredients: [{ pumpkinId: 'shadow_pumpkin', amount: 1 }, { pumpkinId: 'triamble', amount: 2 }], craftTimeSeconds: 200, resultItem: 'spectral_armor', resultEmoji: '🦺', resultDescription: 'Armor woven from shadow and spectral pumpkin essence.', candyCoinValue: 220, xpReward: 130, defenseValue: 45, requiredLevel: 35, emoji: '🦺', color: '#312E81' },
  { id: 'recipe_cursed_amulet', name: 'Cursed Amulet', ingredients: [{ pumpkinId: 'black_futsu', amount: 1 }, { pumpkinId: 'warty_goblin', amount: 2 }], craftTimeSeconds: 100, resultItem: 'cursed_amulet', resultEmoji: '📿', resultDescription: 'An ancient amulet that weakens enemies by 20%.', candyCoinValue: 130, xpReward: 75, defenseValue: 22, requiredLevel: 12, emoji: '📿', color: '#1C1917' },
  { id: 'recipe_haunted_cake', name: 'Haunted Cake', ingredients: [{ pumpkinId: 'cinderella', amount: 2 }, { pumpkinId: 'lumina', amount: 2 }], craftTimeSeconds: 80, resultItem: 'haunted_cake', resultEmoji: '🎂', resultDescription: 'A towering cake with ghostly tiers that wobble on their own.', candyCoinValue: 90, xpReward: 55, defenseValue: 5, requiredLevel: 7, emoji: '🎂', color: '#F9A8D4' },
  { id: 'recipe_werewolf_bait', name: 'Werewolf Bait', ingredients: [{ pumpkinId: 'ghost_pepper_pumpkin', amount: 2 }, { pumpkinId: 'goosebumps', amount: 2 }], craftTimeSeconds: 60, resultItem: 'werewolf_bait', resultEmoji: '🥩', resultDescription: 'Irresistible bait that lures werewolves into traps.', candyCoinValue: 70, xpReward: 45, defenseValue: 10, requiredLevel: 8, emoji: '🥩', color: '#991B1B' },
  { id: 'recipe_pumpkin_butter', name: 'Pumpkin Butter', ingredients: [{ pumpkinId: 'butternut', amount: 2 }, { pumpkinId: 'buttercup', amount: 1 }], craftTimeSeconds: 30, resultItem: 'pumpkin_butter', resultEmoji: '🫙', resultDescription: 'Rich, spreadable pumpkin butter with autumn spices.', candyCoinValue: 38, xpReward: 26, defenseValue: 0, requiredLevel: 4, emoji: '🫙', color: '#D97706' },
  { id: 'recipe_phoenix_fire_potion', name: 'Phoenix Fire Potion', ingredients: [{ pumpkinId: 'lupin', amount: 1 }, { pumpkinId: 'ghost_pepper_pumpkin', amount: 2 }], craftTimeSeconds: 150, resultItem: 'phoenix_fire_potion', resultEmoji: '🔥', resultDescription: 'A blazing potion that burns enemies for 50 damage per wave.', candyCoinValue: 180, xpReward: 110, defenseValue: 30, requiredLevel: 30, emoji: '🔥', color: '#EF4444' },
  { id: 'recipe_pumpkin_candle', name: 'Pumpkin Candle', ingredients: [{ pumpkinId: 'lumina', amount: 2 }, { pumpkinId: 'cinderella', amount: 1 }], craftTimeSeconds: 20, resultItem: 'pumpkin_candle', resultEmoji: '🕯️', resultDescription: 'A softly glowing candle that increases harvest speed by 10%.', candyCoinValue: 25, xpReward: 18, defenseValue: 3, requiredLevel: 2, emoji: '🕯️', color: '#FBBF24' },
  { id: 'recipe_spirit_compass', name: 'Spirit Compass', ingredients: [{ pumpkinId: 'spirit_pumpkin', amount: 1 }, { pumpkinId: 'eternal_pumpkin', amount: 1 }], craftTimeSeconds: 360, resultItem: 'spirit_compass', resultEmoji: '🧭', resultDescription: 'Points toward hidden legendary pumpkins and rare events.', candyCoinValue: 500, xpReward: 300, defenseValue: 0, requiredLevel: 50, emoji: '🧭', color: '#8B5CF6' },
];

// ---------------------------------------------------------------------------
// 20 Spooky Decorations
// ---------------------------------------------------------------------------

export const PV_DECORATIONS: PvDecorationDef[] = [
  { id: 'dec_iron_gate', name: 'Iron Gate', areaId: 'pumpkin_patch', cost: 50, spookinessBonus: 3, defenseBonus: 2, description: 'A wrought iron gate with bat-shaped finials.', emoji: '🚪', color: '#1C1917' },
  { id: 'dec_scarecrow_post', name: 'Scarecrow Post', areaId: 'pumpkin_patch', cost: 80, spookinessBonus: 5, defenseBonus: 5, description: 'A tattered scarecrow that deters small creatures.', emoji: '🧟', color: '#78350F' },
  { id: 'dec_spider_web_arch', name: 'Spider Web Arch', areaId: 'spider_cellar', cost: 120, spookinessBonus: 8, defenseBonus: 3, description: 'An archway draped in thick spider webs.', emoji: '🕸️', color: '#D1D5DB' },
  { id: 'dec_bone_chandelier', name: 'Bone Chandelier', areaId: 'haunted_farm', cost: 200, spookinessBonus: 12, defenseBonus: 4, description: 'A chandelier made from interlocking bones. Spooky but elegant.', emoji: '💀', color: '#E5E7EB' },
  { id: 'dec_ghostly_fountain', name: 'Ghostly Fountain', areaId: 'ghost_orchard', cost: 350, spookinessBonus: 15, defenseBonus: 6, description: 'A fountain that flows with glowing green ectoplasm.', emoji: '⛲', color: '#22C55E' },
  { id: 'dec_witchs_cauldron', name: "Witch's Cauldron", areaId: 'witchs_garden', cost: 250, spookinessBonus: 14, defenseBonus: 8, description: 'A bubbling cauldron that enhances nearby crafting speed.', emoji: '🫕', color: '#166534' },
  { id: 'dec_skeleton_garden', name: 'Skeleton Garden', areaId: 'spider_cellar', cost: 180, spookinessBonus: 10, defenseBonus: 5, description: 'Decorative skeletons posed among the pumpkin vines.', emoji: '☠️', color: '#D1D5DB' },
  { id: 'dec_haunted_lantern_row', name: 'Haunted Lantern Row', areaId: 'pumpkin_patch', cost: 150, spookinessBonus: 8, defenseBonus: 6, description: 'A row of flickering Jack O\'Lanterns lining the path.', emoji: '🏮', color: '#F97316' },
  { id: 'dec_full_moon_mural', name: 'Full Moon Mural', areaId: 'moonlight_market', cost: 400, spookinessBonus: 18, defenseBonus: 7, description: 'A painted mural of a massive full moon that seems to glow.', emoji: '🌕', color: '#FBBF24' },
  { id: 'dec_vampire_coffin', name: 'Vampire Coffin', areaId: 'shadow_crypt', cost: 500, spookinessBonus: 22, defenseBonus: 12, description: 'An ornate coffin that houses a sleeping vampire ally.', emoji: '🧛', color: '#7F1D1D' },
  { id: 'dec_candy_corn_path', name: 'Candy Corn Path', areaId: 'candy_workshop', cost: 300, spookinessBonus: 10, defenseBonus: 3, description: 'A path paved with giant candy corn stones.', emoji: '🌽', color: '#F59E0B' },
  { id: 'dec_black_cat_statue', name: 'Black Cat Statue', areaId: 'haunted_farm', cost: 160, spookinessBonus: 9, defenseBonus: 5, description: 'A black cat statue whose eyes glow red at midnight.', emoji: '🐈‍⬛', color: '#1C1917' },
  { id: 'dec_gargoyle_pair', name: 'Gargoyle Pair', areaId: 'shadow_crypt', cost: 450, spookinessBonus: 20, defenseBonus: 15, description: 'Stone gargoyles that come alive to defend against intruders.', emoji: '🗿', color: '#6B7280' },
  { id: 'dec_ghost_balloons', name: 'Ghost Balloons', areaId: 'candy_workshop', cost: 100, spookinessBonus: 6, defenseBonus: 2, description: 'Floating white balloons shaped like friendly ghosts.', emoji: '🎈', color: '#E5E7EB' },
  { id: 'dec_creepy_candle_set', name: 'Creepy Candle Set', areaId: 'witchs_garden', cost: 130, spookinessBonus: 7, defenseBonus: 4, description: 'Black candles that burn with purple flames.', emoji: '🕯️', color: '#7C3AED' },
  { id: 'dec_raven_perch', name: 'Raven Perch', areaId: 'ghost_orchard', cost: 220, spookinessBonus: 13, defenseBonus: 7, description: 'A perch where spectral ravens gather to scout for enemies.', emoji: '🐦‍⬛', color: '#1C1917' },
  { id: 'dec_witch_hat_rack', name: 'Witch Hat Rack', areaId: 'moonlight_market', cost: 280, spookinessBonus: 11, defenseBonus: 4, description: 'A display of enchanted witch hats for sale.', emoji: '🧙‍♀️', color: '#4C1D95' },
  { id: 'dec_haunted_mirror', name: 'Haunted Mirror', areaId: 'shadow_crypt', cost: 550, spookinessBonus: 25, defenseBonus: 10, description: 'A mirror that shows reflections of the spirit world.', emoji: '🪞', color: '#374151' },
  { id: 'dec_spider_throne', name: 'Spider Throne', areaId: 'spider_cellar', cost: 380, spookinessBonus: 16, defenseBonus: 9, description: 'A throne made of web and bone, fit for a spider queen.', emoji: '🕷️', color: '#1C1917' },
  { id: 'dec_pumpkin_totem', name: 'Pumpkin Totem', areaId: 'haunted_farm', cost: 320, spookinessBonus: 14, defenseBonus: 11, description: 'A totem pole of carved pumpkins, each with a different face.', emoji: '🗿', color: '#EA580C' },
];

// ---------------------------------------------------------------------------
// 15 Ghost NPCs
// ---------------------------------------------------------------------------

export const PV_NPCS: PvNpcDef[] = [
  { id: 'npc_friendly_ghost', name: 'Friendly Ghost', role: 'Guide', description: 'A helpful spirit who shows new farmers the ropes.', emoji: '👻', greeting: 'Boo! Just kidding, welcome to the village!', visitReward: { coins: 10, xp: 15 }, requiredLevel: 1 },
  { id: 'npc_headless_horseman', name: 'Headless Horseman', role: 'Protector', description: 'A fearsome but noble guardian who patrols the village borders.', emoji: '🐎', greeting: 'I have lost my head... but not my courage.', visitReward: { coins: 25, xp: 30 }, requiredLevel: 3 },
  { id: 'npc_witch_agnes', name: 'Witch Agnes', role: 'Alchemist', description: 'An ancient witch who trades rare recipes for exotic pumpkins.', emoji: '🧙‍♀️', greeting: 'Eye of newt, toe of frog... oh, a visitor! Come in, come in!', visitReward: { coins: 15, xp: 25 }, requiredLevel: 5 },
  { id: 'npc_count_dracula', name: 'Count Dracula', role: 'Merchant', description: 'A sophisticated vampire who runs the Moonlight Market shop.', emoji: '🧛', greeting: 'Ah, a guest! Care for some... tomato juice?', visitReward: { coins: 50, xp: 40 }, requiredLevel: 10 },
  { id: 'npc_frankenstein', name: 'Frankenstein', role: 'Builder', description: 'A hulking creation who builds defense structures for the village.', emoji: '🧟', greeting: 'Frankenstein... smash... pumpkins...?', visitReward: { coins: 30, xp: 35 }, requiredLevel: 7 },
  { id: 'npc_mummy_pharaoh', name: 'Mummy Pharaoh', role: 'Historian', description: 'An ancient mummy who shares forgotten pumpkin lore.', emoji: '🪦', greeting: 'In my time, we worshipped the Great Pumpkin...', visitReward: { coins: 20, xp: 30 }, requiredLevel: 12 },
  { id: 'npc_werewolf_alpha', name: 'Werewolf Alpha', role: 'Hunter', description: 'A noble werewolf who helps defend the village during invasions.', emoji: '🐺', greeting: '*sniff sniff* ...you smell like candy corn. I trust you.', visitReward: { coins: 35, xp: 40 }, requiredLevel: 15 },
  { id: 'npc_banshee_moira', name: 'Banshee Moira', role: 'Seer', description: 'A banshee who predicts upcoming enemy waves and weather.', emoji: '😱', greeting: 'WAAAAAAIL... oh sorry, bad habit. Nice weather we\'re having.', visitReward: { coins: 25, xp: 35 }, requiredLevel: 18 },
  { id: 'npc_zombie_farmer', name: 'Zombie Farmer', role: 'Farmer', description: 'A surprisingly skilled undead farmer who tends rare pumpkins.', emoji: '🧟‍♂️', greeting: 'BRAAAINS... wait, no. BRAAAINS for harvesting pumpkins!', visitReward: { coins: 15, xp: 20 }, requiredLevel: 2 },
  { id: 'npc_skeleton_cook', name: 'Skeleton Cook', role: 'Chef', description: 'A bony chef who creates the finest pumpkin dishes in the land.', emoji: '💀', greeting: 'I\'ve been cooking for 200 years. Literally. I have no flesh.', visitReward: { coins: 20, xp: 28 }, requiredLevel: 8 },
  { id: 'npc_goblin_trader', name: 'Goblin Trader', role: 'Trader', description: 'A shrewd goblin who buys and sells at the best prices.', emoji: '👺', greeting: 'What are ya buyin\', what are ya sellin\'?', visitReward: { coins: 40, xp: 30 }, requiredLevel: 20 },
  { id: 'npc_pumpkin_king', name: 'Pumpkin King', role: 'Monarch', description: 'The legendary ruler of all Halloween pumpkins.', emoji: '👑', greeting: 'Every pumpkin in this village bows to my glory!', visitReward: { coins: 100, xp: 80 }, requiredLevel: 30 },
  { id: 'npc_phantom_duchess', name: 'Phantom Duchess', role: 'Aristocrat', description: 'A spectral noblewoman who rewards dedication and style.', emoji: '👸', greeting: 'How delightful! A visitor with such refined... pumpkins.', visitReward: { coins: 60, xp: 50 }, requiredLevel: 25 },
  { id: 'npc_ghoul_gardener', name: 'Ghoul Gardener', role: 'Botanist', description: 'A ghoul with an unnatural talent for growing extraordinary pumpkins.', emoji: '🪴', greeting: 'Want to see my prized Black Futsu? It\'s HUGE!', visitReward: { coins: 30, xp: 35 }, requiredLevel: 14 },
  { id: 'npc_spirit_oracle', name: 'Spirit Oracle', role: 'Oracle', description: 'An omniscient spirit who reveals secrets of the Shadow Crypt.', emoji: '🔮', greeting: 'I see all, I know all... mostly about pumpkins though.', visitReward: { coins: 75, xp: 65 }, requiredLevel: 35 },
];

// ---------------------------------------------------------------------------
// 22 Enemies
// ---------------------------------------------------------------------------

export const PV_ENEMIES: PvEnemyDef[] = [
  { id: 'enemy_zombie', name: 'Zombie', hp: 30, attack: 5, defense: 2, speed: 1, description: 'A shambling corpse that slowly approaches the village.', emoji: '🧟', color: '#65A30D', xpReward: 10, candyCoinReward: 5, dropChance: 0.15, spawnArea: ['haunted_farm', 'pumpkin_patch'] },
  { id: 'enemy_skeleton', name: 'Skeleton', hp: 20, attack: 8, defense: 1, speed: 2, description: 'Bones rattle as this animated skeleton marches forward.', emoji: '💀', color: '#E5E7EB', xpReward: 12, candyCoinReward: 6, dropChance: 0.18, spawnArea: ['spider_cellar', 'shadow_crypt'] },
  { id: 'enemy_witch', name: 'Witch', hp: 40, attack: 12, defense: 5, speed: 1.5, description: 'A cackling witch on a broomstick hurling hexes.', emoji: '🧙‍♀️', color: '#7C3AED', xpReward: 20, candyCoinReward: 12, dropChance: 0.25, spawnArea: ['witchs_garden', 'moonlight_market'] },
  { id: 'enemy_werewolf', name: 'Werewolf', hp: 60, attack: 15, defense: 8, speed: 3, description: 'A massive wolf-human hybrid under the full moon.', emoji: '🐺', color: '#78350F', xpReward: 30, candyCoinReward: 18, dropChance: 0.3, spawnArea: ['ghost_orchard', 'shadow_crypt'] },
  { id: 'enemy_vampire', name: 'Vampire', hp: 50, attack: 18, defense: 10, speed: 2.5, description: 'A swift and deadly vampire with hypnotic gaze.', emoji: '🧛', color: '#7F1D1D', xpReward: 35, candyCoinReward: 22, dropChance: 0.3, spawnArea: ['moonlight_market', 'shadow_crypt'] },
  { id: 'enemy_ghost_soldier', name: 'Ghost Soldier', hp: 35, attack: 10, defense: 6, speed: 2, description: 'A spectral warrior from a forgotten battle.', emoji: '👻', color: '#94A3B8', xpReward: 18, candyCoinReward: 10, dropChance: 0.22, spawnArea: ['ghost_orchard', 'haunted_farm'] },
  { id: 'enemy_giant_spider', name: 'Giant Spider', hp: 45, attack: 14, defense: 7, speed: 2, description: 'An enormous spider that drops from webs to ambush.', emoji: '🕷️', color: '#1C1917', xpReward: 22, candyCoinReward: 14, dropChance: 0.28, spawnArea: ['spider_cellar', 'pumpkin_patch'] },
  { id: 'enemy_frankenstein_monster', name: 'Frankenstein Monster', hp: 100, attack: 20, defense: 15, speed: 0.8, description: 'A hulking brute of stitched-together parts.', emoji: '🧟', color: '#4ADE80', xpReward: 50, candyCoinReward: 35, dropChance: 0.35, spawnArea: ['haunted_farm', 'shadow_crypt'] },
  { id: 'enemy_mummy', name: 'Mummy', hp: 55, attack: 10, defense: 20, speed: 1, description: 'Bandaged in ancient cloth, slow but incredibly tough.', emoji: '🪦', color: '#D97706', xpReward: 28, candyCoinReward: 16, dropChance: 0.25, spawnArea: ['shadow_crypt', 'witchs_garden'] },
  { id: 'enemy_banshee', name: 'Banshee', hp: 25, attack: 25, defense: 3, speed: 3, description: 'Her wail weakens all defenses in range.', emoji: '😱', color: '#DB2777', xpReward: 32, candyCoinReward: 20, dropChance: 0.28, spawnArea: ['ghost_orchard', 'shadow_crypt'] },
  { id: 'enemy_gargoyle', name: 'Gargoyle', hp: 70, attack: 16, defense: 18, speed: 1.2, description: 'Stone wings beat as it swoops down from rooftops.', emoji: '🗿', color: '#6B7280', xpReward: 38, candyCoinReward: 24, dropChance: 0.32, spawnArea: ['moonlight_market', 'shadow_crypt'] },
  { id: 'enemy_ghoul', name: 'Ghoul', hp: 40, attack: 14, defense: 6, speed: 2.5, description: 'A ravenous creature that feeds on fear and pumpkins.', emoji: '👺', color: '#15803D', xpReward: 20, candyCoinReward: 12, dropChance: 0.2, spawnArea: ['haunted_farm', 'spider_cellar'] },
  { id: 'enemy_phantom_knight', name: 'Phantom Knight', hp: 80, attack: 22, defense: 12, speed: 1.8, description: 'An armored specter wielding a ghostly blade.', emoji: '⚔️', color: '#312E81', xpReward: 45, candyCoinReward: 28, dropChance: 0.35, spawnArea: ['shadow_crypt'] },
  { id: 'enemy_wraith', name: 'Wraith', hp: 35, attack: 20, defense: 5, speed: 4, description: 'A fast, incorporeal being of pure dark energy.', emoji: '🌑', color: '#1E1B4B', xpReward: 40, candyCoinReward: 25, dropChance: 0.3, spawnArea: ['shadow_crypt', 'ghost_orchard'] },
  { id: 'enemy_demon_imp', name: 'Demon Imp', hp: 20, attack: 15, defense: 3, speed: 5, description: 'Tiny but vicious, they swarm in packs.', emoji: '😈', color: '#DC2626', xpReward: 15, candyCoinReward: 8, dropChance: 0.15, spawnArea: ['witchs_garden', 'spider_cellar'] },
  { id: 'enemy_cursed_scarecrow', name: 'Cursed Scarecrow', hp: 65, attack: 18, defense: 14, speed: 1, description: 'A possessed scarecrow that has turned against its creator.', emoji: '🧟', color: '#78350F', xpReward: 36, candyCoinReward: 22, dropChance: 0.3, spawnArea: ['pumpkin_patch', 'haunted_farm'] },
  { id: 'enemy_shadow_wyrm', name: 'Shadow Wyrm', hp: 90, attack: 24, defense: 16, speed: 1.5, description: 'A massive serpentine creature made of living shadow.', emoji: '🐉', color: '#0F172A', xpReward: 55, candyCoinReward: 40, dropChance: 0.4, spawnArea: ['shadow_crypt'] },
  { id: 'enemy_poltergeist', name: 'Poltergeist', hp: 30, attack: 12, defense: 8, speed: 3.5, description: 'Throws objects and creates chaos in the village.', emoji: '💫', color: '#818CF8', xpReward: 25, candyCoinReward: 15, dropChance: 0.22, spawnArea: ['haunted_farm', 'ghost_orchard'] },
  { id: 'enemy_headless_horror', name: 'Headless Horror', hp: 75, attack: 20, defense: 12, speed: 2, description: 'A headless brute swinging a flaming pumpkin.', emoji: '🔥', color: '#991B1B', xpReward: 42, candyCoinReward: 30, dropChance: 0.35, spawnArea: ['shadow_crypt', 'haunted_farm'] },
  { id: 'enemy_bone_dragon', name: 'Bone Dragon', hp: 120, attack: 28, defense: 20, speed: 1, description: 'An enormous skeletal dragon breathing spectral fire.', emoji: '🦴', color: '#FDE68A', xpReward: 70, candyCoinReward: 55, dropChance: 0.5, spawnArea: ['shadow_crypt'] },
  { id: 'enemy_pumpkin_golem', name: 'Pumpkin Golem', hp: 150, attack: 22, defense: 25, speed: 0.5, description: 'A massive construct of fused pumpkins. Slow but devastating.', emoji: '🎃', color: '#EA580C', xpReward: 60, candyCoinReward: 45, dropChance: 0.45, spawnArea: ['pumpkin_patch', 'candy_workshop'] },
  { id: 'enemy_reaper', name: 'Reaper', hp: 200, attack: 35, defense: 15, speed: 2, description: 'Death itself has come for your pumpkins. The ultimate foe.', emoji: '💀', color: '#0F0F0F', xpReward: 100, candyCoinReward: 80, dropChance: 0.6, spawnArea: ['shadow_crypt'] },
];

// ---------------------------------------------------------------------------
// 10 Halloween Events
// ---------------------------------------------------------------------------

export const PV_EVENTS: PvEventDef[] = [
  { id: 'trick_or_treat', name: 'Trick or Treat', description: 'Visit houses and collect candy coins! But beware of tricks...', durationHours: 2, xpMultiplier: 1.2, coinMultiplier: 2.0, spawnRateMultiplier: 0.5, specialReward: 'Candy Bag (50 coins)', emoji: '🍬', color: '#F97316' },
  { id: 'pumpkin_festival', name: 'Pumpkin Festival', description: 'A grand celebration of all things pumpkin! Double harvest yields.', durationHours: 4, xpMultiplier: 1.5, coinMultiplier: 1.5, spawnRateMultiplier: 0.3, specialReward: 'Golden Pumpkin Seed', emoji: '🎪', color: '#F59E0B' },
  { id: 'witchs_night', name: "Witch's Night", description: 'Witches from far and wide gather. Crafting speed doubled!', durationHours: 3, xpMultiplier: 1.3, coinMultiplier: 1.3, spawnRateMultiplier: 1.5, specialReward: 'Enchanted Cauldron', emoji: '🧙‍♀️', color: '#7C3AED' },
  { id: 'ghost_parade', name: 'Ghost Parade', description: 'A parade of friendly ghosts boosts XP gains and visits.', durationHours: 2, xpMultiplier: 2.0, coinMultiplier: 1.0, spawnRateMultiplier: 0.2, specialReward: 'Spirit Candle', emoji: '👻', color: '#94A3B8' },
  { id: 'harvest_moon_rise', name: 'Harvest Moon Rise', description: 'The harvest moon illuminates the fields. All grow times halved.', durationHours: 6, xpMultiplier: 1.0, coinMultiplier: 1.0, spawnRateMultiplier: 0.8, specialReward: 'Moonlight Essence', emoji: '🌕', color: '#FBBF24' },
  { id: 'shadow_invasion', name: 'Shadow Invasion', description: 'Massive waves of shadow creatures attack! Survive for rewards.', durationHours: 3, xpMultiplier: 2.0, coinMultiplier: 2.0, spawnRateMultiplier: 3.0, specialReward: 'Shadow Fragment', emoji: '🌑', color: '#1E1B4B' },
  { id: 'candy_comet', name: 'Candy Comet', description: 'A comet made of candy streaks across the sky! Coin bonanza!', durationHours: 1, xpMultiplier: 1.0, coinMultiplier: 3.0, spawnRateMultiplier: 0.5, specialReward: 'Star Candy', emoji: '☄️', color: '#EC4899' },
  { id: 'soul_harvest', name: 'Soul Harvest', description: 'Collect souls from defeated enemies for massive XP.', durationHours: 3, xpMultiplier: 3.0, coinMultiplier: 1.5, spawnRateMultiplier: 2.0, specialReward: 'Soul Gem', emoji: '🔮', color: '#8B5CF6' },
  { id: 'bonfire_night', name: 'Bonfire Night', description: 'Great bonfires light up the village. Enemy defense reduced.', durationHours: 2, xpMultiplier: 1.5, coinMultiplier: 1.2, spawnRateMultiplier: 1.5, specialReward: 'Bonfire Spark', emoji: '🔥', color: '#EF4444' },
  { id: 'eternal_halloween', name: 'Eternal Halloween', description: 'The rarest event! All bonuses active simultaneously.', durationHours: 1, xpMultiplier: 3.0, coinMultiplier: 3.0, spawnRateMultiplier: 2.0, specialReward: 'Eternal Pumpkin Seed', emoji: '👑', color: '#F59E0B' },
];

// ---------------------------------------------------------------------------
// 8 Titles
// ---------------------------------------------------------------------------

export const PV_TITLES: PvTitleDef[] = [
  { minLevel: 1, title: 'Pumpkin Seed', description: 'Every great farmer starts as a tiny seed.' },
  { minLevel: 6, title: 'Pumpkin Farmer', description: 'Learning the ancient art of pumpkin cultivation.' },
  { minLevel: 12, title: 'Halloween Helper', description: 'A trusted hand during the spooky season.' },
  { minLevel: 18, title: 'Spooky Gardener', description: 'The pumpkins grow at your command.' },
  { minLevel: 25, title: 'Pumpkin Master', description: 'Known across the land for legendary harvests.' },
  { minLevel: 33, title: 'Shadow Warden', description: 'Guardian of the darkest corners of the village.' },
  { minLevel: 42, title: 'Halloween Lord', description: 'Ruler of all things spooky and squash-related.' },
  { minLevel: 50, title: 'Eternal Pumpkin King', description: 'The supreme sovereign of the Pumpkin Village for all eternity.' },
];

// ---------------------------------------------------------------------------
// 15 Achievements
// ---------------------------------------------------------------------------

export const PV_ACHIEVEMENTS: PvAchievementDef[] = [
  { id: 'ach_first_plant', name: 'First Seed', description: 'Plant your very first pumpkin.', conditionKey: 'totalPumpkinsPlanted', targetValue: 1, rewardCoins: 10, rewardXP: 10, icon: '🌱' },
  { id: 'ach_green_thumb', name: 'Green Thumb', description: 'Plant 50 pumpkins.', conditionKey: 'totalPumpkinsPlanted', targetValue: 50, rewardCoins: 100, rewardXP: 80, icon: '🌿' },
  { id: 'ach_harvest_king', name: 'Harvest King', description: 'Harvest 100 pumpkins.', conditionKey: 'totalPumpkinsHarvested', targetValue: 100, rewardCoins: 200, rewardXP: 150, icon: '🫅' },
  { id: 'ach_master_crafter', name: 'Master Crafter', description: 'Craft 50 items.', conditionKey: 'totalItemsCrafted', targetValue: 50, rewardCoins: 300, rewardXP: 200, icon: '🔨' },
  { id: 'ach_defender', name: 'Village Defender', description: 'Defeat 25 enemies.', conditionKey: 'totalEnemiesDefeated', targetValue: 25, rewardCoins: 150, rewardXP: 120, icon: '🛡️' },
  { id: 'ach_monster_slayer', name: 'Monster Slayer', description: 'Defeat 100 enemies.', conditionKey: 'totalEnemiesDefeated', targetValue: 100, rewardCoins: 500, rewardXP: 400, icon: '⚔️' },
  { id: 'ach_decorator', name: 'Spooky Decorator', description: 'Place 10 decorations.', conditionKey: 'totalDecorationsPlaced', targetValue: 10, rewardCoins: 200, rewardXP: 150, icon: '🎨' },
  { id: 'ach_social_butterfly', name: 'Social Butterfly', description: 'Visit 10 different NPCs.', conditionKey: 'totalNpcsVisited', targetValue: 10, rewardCoins: 150, rewardXP: 100, icon: '🦋' },
  { id: 'ach_trick_master', name: 'Trick Master', description: 'Complete 20 Trick or Treats.', conditionKey: 'totalTrickOrTreats', targetValue: 20, rewardCoins: 200, rewardXP: 160, icon: '🍬' },
  { id: 'ach_wealthy_farmer', name: 'Wealthy Farmer', description: 'Earn 5,000 candy coins total.', conditionKey: 'totalCandyCoinsEarned', targetValue: 5000, rewardCoins: 500, rewardXP: 300, icon: '💰' },
  { id: 'ach_legendary_harvest', name: 'Legendary Harvest', description: 'Harvest 5 Legendary pumpkins.', conditionKey: 'legendaryHarvests', targetValue: 5, rewardCoins: 400, rewardXP: 350, icon: '✨' },
  { id: 'ach_all_areas', name: 'World Explorer', description: 'Unlock all 8 village areas.', conditionKey: 'areasUnlocked', targetValue: 8, rewardCoins: 600, rewardXP: 500, icon: '🗺️' },
  { id: 'ach_endurance', name: 'Enduring Spirit', description: 'Reach a 7-day login streak.', conditionKey: 'longestStreak', targetValue: 7, rewardCoins: 300, rewardXP: 200, icon: '🔥' },
  { id: 'ach_max_level', name: 'Pumpkin Perfection', description: 'Reach level 50.', conditionKey: 'level', targetValue: 50, rewardCoins: 1000, rewardXP: 1000, icon: '👑' },
  { id: 'ach_all_recipes', name: 'Recipe Collector', description: 'Craft every recipe at least once.', conditionKey: 'uniqueRecipesCrafted', targetValue: 25, rewardCoins: 800, rewardXP: 600, icon: '📖' },
];

// ---------------------------------------------------------------------------
// Weather System
// ---------------------------------------------------------------------------

export const PV_WEATHER_TYPES: PvWeatherDef[] = [
  { id: 'clear', name: 'Clear Night', description: 'A crisp, clear Halloween night. Perfect for farming.', growSpeedMultiplier: 1.0, enemyStrengthMultiplier: 1.0, visibilityReduction: 0, emoji: '🌙', color: '#1E3A5F' },
  { id: 'foggy', name: 'Foggy Night', description: 'Dense fog rolls in, reducing visibility but boosting rare drops.', growSpeedMultiplier: 0.9, enemyStrengthMultiplier: 1.1, visibilityReduction: 40, emoji: '🌫️', color: '#6B7280' },
  { id: 'full_moon', name: 'Full Moon', description: 'The full moon empowers werewolves but boosts all XP gains!', growSpeedMultiplier: 1.2, enemyStrengthMultiplier: 1.5, visibilityReduction: 0, emoji: '🌕', color: '#FBBF24' },
  { id: 'thunderstorm', name: 'Thunderstorm', description: 'Lightning illuminates the sky! Watered pumpkins grow faster.', growSpeedMultiplier: 1.3, enemyStrengthMultiplier: 1.2, visibilityReduction: 30, emoji: '⛈️', color: '#475569' },
  { id: 'haunted_mist', name: 'Haunted Mist', description: 'Spectral mist drifts through the village. Enemies are weakened.', growSpeedMultiplier: 0.8, enemyStrengthMultiplier: 0.7, visibilityReduction: 60, emoji: '👻', color: '#818CF8' },
  { id: 'blood_moon', name: 'Blood Moon', description: 'The blood moon rises! Enemy spawn rate triples but rewards double.', growSpeedMultiplier: 0.7, enemyStrengthMultiplier: 2.0, visibilityReduction: 20, emoji: '🔴', color: '#991B1B' },
];

// ---------------------------------------------------------------------------
// Helper Functions (private)
// ---------------------------------------------------------------------------

function pvXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= PV_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.18));
}

function pvClampLevel(lvl: number): number {
  return Math.max(1, Math.min(PV_MAX_LEVEL, lvl));
}

function pvGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function pvHashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return Math.abs(hash);
}

function pvPickRandom<T>(rng: () => number, arr: T[]): T {
  if (arr.length === 0) return arr[0] as T;
  return arr[Math.floor(rng() * arr.length)];
}

function pvGetTitleForLevel(level: number): string {
  let title = PV_TITLES[0].title;
  for (const t of PV_TITLES) {
    if (level >= t.minLevel) {
      title = t.title;
    }
  }
  return title;
}

function pvGetAreaDef(areaId: PvAreaId): PvAreaDef | undefined {
  return PV_VILLAGE_AREAS.find((a) => a.id === areaId);
}

function pvGetPumpkinDef(pumpkinId: string): PvPumpkinDef | undefined {
  return PV_PUMPKIN_TYPES.find((p) => p.id === pumpkinId) ?? PV_ETERNAL_PUMPKIN;
}

function pvGetRecipeDef(recipeId: string): PvRecipeDef | undefined {
  return PV_RECIPES.find((r) => r.id === recipeId);
}

function pvGetEnemyDef(enemyId: string): PvEnemyDef | undefined {
  return PV_ENEMIES.find((e) => e.id === enemyId);
}

function pvIsAreaUnlocked(state: PvPumpkinVillageState, areaId: PvAreaId): boolean {
  const area = pvGetAreaDef(areaId);
  if (!area) return false;
  if (area.unlockLevel === 1 && area.unlockCost === 0) return true;
  return state.level >= area.unlockLevel;
}

function pvCreateInitialPlots(): PvPlotState[] {
  const plots: PvPlotState[] = [];
  const defaultArea: PvAreaId = 'pumpkin_patch';
  for (let i = 0; i < PV_MAX_PLOTS_PER_AREA; i++) {
    plots.push({
      plotIndex: i,
      areaId: defaultArea,
      pumpkinId: null,
      plantedAt: null,
      growthProgress: 0,
      readyToHarvest: false,
      watered: false,
      fertilized: false,
    });
  }
  return plots;
}

function pvCreateInitialAchievements(): PvAchievementState[] {
  return PV_ACHIEVEMENTS.map((a) => ({
    achievementId: a.id,
    unlocked: false,
    progress: 0,
  }));
}

function pvCreateInitialEvents(): PvEventState[] {
  return PV_EVENTS.map((e) => ({
    eventId: e.id,
    active: false,
    startTime: null,
    progress: 0,
  }));
}

function pvCreateInitialNpcVisits(): PvNpcVisitState[] {
  return PV_NPCS.map((n) => ({
    npcId: n.id,
    met: false,
    timesVisited: 0,
    lastVisitDate: null,
  }));
}

function pvGenerateDailyQuests(seed: number): PvDailyQuest[] {
  const rng = pvMulberry32(seed);
  const questPool: PvDailyQuest[] = [
    { id: 'dq_plant_5', name: 'Plant 5 Pumpkins', description: 'Plant 5 pumpkins in the village.', type: 'plant', target: 5, progress: 0, rewardCoins: 25, rewardXP: 20, completed: false, claimed: false, emoji: '🌱' },
    { id: 'dq_harvest_10', name: 'Harvest 10 Pumpkins', description: 'Harvest 10 fully grown pumpkins.', type: 'harvest', target: 10, progress: 0, rewardCoins: 40, rewardXP: 30, completed: false, claimed: false, emoji: '🎃' },
    { id: 'dq_craft_3', name: 'Craft 3 Items', description: 'Craft 3 items at the workshop.', type: 'craft', target: 3, progress: 0, rewardCoins: 50, rewardXP: 35, completed: false, claimed: false, emoji: '🔨' },
    { id: 'dq_defend_5', name: 'Defeat 5 Enemies', description: 'Defend the village from 5 monsters.', type: 'defend', target: 5, progress: 0, rewardCoins: 45, rewardXP: 40, completed: false, claimed: false, emoji: '⚔️' },
    { id: 'dq_trick_3', name: 'Trick or Treat x3', description: 'Complete 3 Trick or Treats.', type: 'trick_or_treat', target: 3, progress: 0, rewardCoins: 30, rewardXP: 25, completed: false, claimed: false, emoji: '🍬' },
    { id: 'dq_visit_2_npc', name: 'Visit 2 NPCs', description: 'Visit 2 different NPCs in the village.', type: 'npc_visit', target: 2, progress: 0, rewardCoins: 20, rewardXP: 15, completed: false, claimed: false, emoji: '👻' },
    { id: 'dq_plant_rare', name: 'Plant a Rare Pumpkin', description: 'Plant at least 1 Rare pumpkin.', type: 'plant', target: 1, progress: 0, rewardCoins: 60, rewardXP: 45, completed: false, claimed: false, emoji: '💎' },
    { id: 'dq_harvest_20', name: 'Harvest 20 Pumpkins', description: 'Harvest 20 pumpkins in one day.', type: 'harvest', target: 20, progress: 0, rewardCoins: 80, rewardXP: 60, completed: false, claimed: false, emoji: '🧺' },
    { id: 'dq_craft_defense', name: 'Craft a Defense Item', description: 'Craft any item with defense value.', type: 'craft', target: 1, progress: 0, rewardCoins: 55, rewardXP: 40, completed: false, claimed: false, emoji: '🛡️' },
    { id: 'dq_defend_wave', name: 'Survive a Wave', description: 'Defeat all enemies in a defense wave.', type: 'defend', target: 1, progress: 0, rewardCoins: 70, rewardXP: 50, completed: false, claimed: false, emoji: '🏰' },
  ];
  const shuffled = [...questPool].sort(() => rng() - 0.5);
  return shuffled.slice(0, PV_DAILY_QUEST_COUNT);
}

function pvCreateDefaultState(): PvPumpkinVillageState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    candyCoins: 100,
    title: 'Pumpkin Seed',
    seed: Date.now(),
    plots: pvCreateInitialPlots(),
    inventory: [],
    achievements: pvCreateInitialAchievements(),
    events: pvCreateInitialEvents(),
    dailyQuests: pvGenerateDailyQuests(Date.now()),
    npcVisits: pvCreateInitialNpcVisits(),
    currentWeather: 'clear',
    weatherEndTime: 0,
    defenseUnits: [],
    activeEnemies: [],
    battleLog: [],
    villageDefense: 0,
    villageSpookiness: 0,
    stats: {
      totalPumpkinsPlanted: 0,
      totalPumpkinsHarvested: 0,
      totalItemsCrafted: 0,
      totalEnemiesDefeated: 0,
      totalDecorationsPlaced: 0,
      totalNpcsVisited: 0,
      totalTrickOrTreats: 0,
      totalCandyCoinsEarned: 0,
      totalCandyCoinsSpent: 0,
      totalXPEarned: 0,
      totalDefensesWon: 0,
      totalDefensesLost: 0,
      currentStreak: 1,
      longestStreak: 1,
    },
    dailyDate: null,
    lastTrickOrTreatTime: 0,
    selectedArea: 'pumpkin_patch',
  };
}

// ---------------------------------------------------------------------------
// XP Table
// ---------------------------------------------------------------------------

export const PV_XP_TABLE: number[] = Array.from({ length: PV_MAX_LEVEL }, (_, i) =>
  pvXpRequired(i + 1)
);

// ---------------------------------------------------------------------------
// Fortune / Tarot System
// ---------------------------------------------------------------------------

export type PvFortuneType = 'bounty' | 'storm' | 'rest' | 'growth' | 'defense' | 'mystery';

export interface PvFortuneDef {
  id: string;
  name: string;
  fortuneType: PvFortuneType;
  description: string;
  effectDescription: string;
  durationMinutes: number;
  multiplier: number;
  emoji: string;
  color: string;
  rarity: PvRarity;
}

export const PV_FORTUNE_CARDS: PvFortuneDef[] = [
  { id: 'fc_harvest_moon', name: 'Harvest Moon', fortuneType: 'bounty', description: 'The harvest moon shines upon your fields, blessing them with abundance.', effectDescription: 'Double candy coin yield for 30 minutes.', durationMinutes: 30, multiplier: 2.0, emoji: '🌕', color: '#FBBF24', rarity: 'Rare' },
  { id: 'fc_shadow_gale', name: 'Shadow Gale', fortuneType: 'storm', description: 'Dark winds sweep through the village, stirring up danger.', effectDescription: 'Enemy waves are harder but drop 3x rewards for 20 minutes.', durationMinutes: 20, multiplier: 3.0, emoji: '🌪️', color: '#1E1B4B', rarity: 'Epic' },
  { id: 'fc_ancient_rest', name: 'Ancient Rest', fortuneType: 'rest', description: 'The spirits grant you a moment of peace and rejuvenation.', effectDescription: 'All pumpkins grow instantly to completion.', durationMinutes: 0, multiplier: 0, emoji: '💤', color: '#93C5FD', rarity: 'Legendary' },
  { id: 'fc_enchanted_soil', name: 'Enchanted Soil', fortuneType: 'growth', description: 'The ground itself pulses with magical energy.', effectDescription: 'Pumpkin growth speed x3 for 45 minutes.', durationMinutes: 45, multiplier: 3.0, emoji: '🌱', color: '#4ADE80', rarity: 'Epic' },
  { id: 'fc_ward_of_ancients', name: 'Ward of the Ancients', fortuneType: 'defense', description: 'An invisible barrier surrounds your village.', effectDescription: 'Village defense doubled for 30 minutes.', durationMinutes: 30, multiplier: 2.0, emoji: '🛡️', color: '#60A5FA', rarity: 'Rare' },
  { id: 'fc_mystery_box', name: 'Mystery Box', fortuneType: 'mystery', description: 'A mysterious box appears from thin air...', effectDescription: 'Random reward: 50-500 coins or a rare seed.', durationMinutes: 0, multiplier: 0, emoji: '🎁', color: '#C084FC', rarity: 'Common' },
  { id: 'fc_blood_moon_rise', name: 'Blood Moon Rise', fortuneType: 'storm', description: 'The blood moon empowers both allies and enemies.', effectDescription: 'All stats boosted by 50% for 25 minutes.', durationMinutes: 25, multiplier: 1.5, emoji: '🔴', color: '#991B1B', rarity: 'Epic' },
  { id: 'fc_fairy_ring', name: 'Fairy Ring', fortuneType: 'bounty', description: 'Magical mushrooms form a ring of fortune.', effectDescription: 'Triple XP from all sources for 15 minutes.', durationMinutes: 15, multiplier: 3.0, emoji: '🍄', color: '#F9A8D4', rarity: 'Rare' },
  { id: 'fc_ecto_rain', name: 'Ecto Rain', fortuneType: 'growth', description: 'A gentle rain of spectral ectoplasm nourishes your crops.', effectDescription: 'All plots auto-watered and fertilized for 1 hour.', durationMinutes: 60, multiplier: 0, emoji: '🌧️', color: '#818CF8', rarity: 'Legendary' },
  { id: 'fc_phoenix_ash', name: 'Phoenix Ash', fortuneType: 'defense', description: 'Ashes of a fallen phoenix grant fiery protection.', effectDescription: 'Enemies take 20 damage per tick for 20 minutes.', durationMinutes: 20, multiplier: 20, emoji: '🔥', color: '#EF4444', rarity: 'Rare' },
  { id: 'fc_void_whisper', name: 'Void Whisper', fortuneType: 'mystery', description: 'The void speaks in riddles... with rewards.', effectDescription: 'Gain 200 XP and 100 coins instantly.', durationMinutes: 0, multiplier: 0, emoji: '🌑', color: '#0F172A', rarity: 'Common' },
  { id: 'fc_pumpkin_blessing', name: 'Pumpkin Blessing', fortuneType: 'bounty', description: 'The Great Pumpkin smiles upon you.', effectDescription: 'Next harvest gives 5x yield.', durationMinutes: 0, multiplier: 5.0, emoji: '🎃', color: '#F97316', rarity: 'Epic' },
];

// ---------------------------------------------------------------------------
// NPC Extended Dialogues
// ---------------------------------------------------------------------------

export interface PvNpcDialogue {
  npcId: string;
  dialogues: string[];
  farewell: string;
}

export const PV_NPC_DIALOGUES: PvNpcDialogue[] = [
  { npcId: 'npc_friendly_ghost', dialogues: [
    'Did you know? Lumina pumpkins glow because they absorb moonlight during the day.',
    'The Shadow Crypt is the most dangerous area, but the pumpkins there are legendary!',
    'Always keep your Scarecrows maintained. Zombies hate them more than anything.',
    'I heard the Eternal Pumpkin can only be grown by a true Pumpkin King...',
    'Try visiting the Moonlight Market during a full moon for special deals!',
  ], farewell: 'See you on the other side! ...of the village, I mean.' },
  { npcId: 'npc_headless_horseman', dialogues: [
    'I patrol these borders every night. Nothing gets past me... usually.',
    'My horse is named Thunder. She\'s the fastest in the spirit realm.',
    'The werewolves are strongest during full moon weather. Be prepared!',
    'I once lost a race to a skeleton. The humiliation still haunts me.',
    'If you see my head anywhere, please return it. I keep forgetting where I left it.',
  ], farewell: 'Stay safe, farmer. I\'ll keep watch.' },
  { npcId: 'npc_witch_agnes', dialogues: [
    'The Witch\'s Brew recipe uses Ghost Pepper Pumpkin for its fiery kick!',
    'Cursed Amulets weaken enemies by 20%. Essential for later levels!',
    'I\'ve been brewing potions since before your great-grandmother was born.',
    'The Phoenix Fire Potion is my proudest creation. Burns enemies to cinders!',
    'Never mix Spirit Pumpkin essence with Shadow Pumpkin... unless you want an explosion.',
  ], farewell: 'Come back when you need more potions! *cackles*' },
  { npcId: 'npc_count_dracula', dialogues: [
    'The Moonlight Market has the finest wares... if you can afford them.',
    'I don\'t drink... tomato juice. That was a joke. Maybe.',
    'Vampire Coffins make excellent defense decorations, I should know!',
    'I\'ve lived for 800 years and this village has the best pumpkins.',
    'My castle overlooks the Shadow Crypt. Lovely neighborhood.',
  ], farewell: 'Until next time... *transforms into a bat and flies away*' },
  { npcId: 'npc_frankenstein', dialogues: [
    'Frankenstein... strong! Frankenstein... build!',
    'The Pumpkin Cannon is my favorite invention. BOOM!',
    'I use Hubbard pumpkins for my building projects. Very sturdy.',
    'Sometimes I accidentally squash pumpkins when I hug them.',
    'Frankenstein help defend village! Franken-smash!',
  ], farewell: 'Frankenstein... go now. Much work to do!' },
  { npcId: 'npc_pumpkin_king', dialogues: [
    'I have watched over every pumpkin since the first Halloween.',
    'The Eternal Pumpkin is the pinnacle of pumpkin perfection. Grohe it!',
    'Only those who reach level 50 may truly call themselves King.',
    'The Spirit Compass will guide you to the rarest pumpkins.',
    'My crown was carved from the first pumpkin ever grown. Treasure it.',
  ], farewell: 'Grow well, young farmer. The pumpkins are watching.' },
  { npcId: 'npc_spirit_oracle', dialogues: [
    'I foresaw your arrival. The pumpkins told me.',
    'The Shadow Crypt holds secrets even I cannot fully comprehend.',
    'Your fortune today reads: Great harvests await the patient farmer.',
    'I see a Rare pumpkin in your near future... or was it a ghost?',
    'The weather will change soon. Prepare accordingly.',
  ], farewell: 'The spirits guide you. Always.' },
];

// ---------------------------------------------------------------------------
// Festival Calendar Data
// ---------------------------------------------------------------------------

export interface PvFestivalEntry {
  month: number; // 1-12
  day: number;   // 1-31
  name: string;
  description: string;
  bonusType: 'xp' | 'coins' | 'growth' | 'defense' | 'spawn';
  bonusValue: number;
  emoji: string;
  color: string;
}

export const PV_FESTIVAL_CALENDAR: PvFestivalEntry[] = [
  { month: 10, day: 1, name: 'Month of Fright Begins', description: 'October begins! All month long, enjoy spooky bonuses.', bonusType: 'xp', bonusValue: 1.5, emoji: '🕸️', color: '#7C3AED' },
  { month: 10, day: 8, name: 'Ghost Pepper Festival', description: 'Celebrate fiery flavors! Ghost Pepper Pumpkins grow 50% faster.', bonusType: 'growth', bonusValue: 1.5, emoji: '🌶️', color: '#EF4444' },
  { month: 10, day: 15, name: 'Witching Hour Eve', description: 'Witches gather early! Crafting speed doubled.', bonusType: 'coins', bonusValue: 2.0, emoji: '🧙‍♀️', color: '#7C3AED' },
  { month: 10, day: 20, name: 'Full Moon Festival', description: 'The full moon empowers all defenders!', bonusType: 'defense', bonusValue: 2.0, emoji: '🌕', color: '#FBBF24' },
  { month: 10, day: 25, name: 'Pumpkin Carving Contest', description: 'Jack O\'Lanterns yield triple rewards today!', bonusType: 'coins', bonusValue: 3.0, emoji: '😄', color: '#F97316' },
  { month: 10, day: 30, name: 'Night of the Great Pumpkin', description: 'The Great Pumpkin rises! All bonuses active!', bonusType: 'xp', bonusValue: 2.0, emoji: '🎃', color: '#F97316' },
  { month: 10, day: 31, name: 'Halloween Night', description: 'The most magical night of the year! Everything is tripled!', bonusType: 'xp', bonusValue: 3.0, emoji: '👑', color: '#F59E0B' },
  { month: 11, day: 1, name: 'Day of the Dead', description: 'Spirits return for one last celebration. Double XP!', bonusType: 'xp', bonusValue: 2.0, emoji: '💀', color: '#F472B6' },
  { month: 12, day: 21, name: 'Winter Solstice', description: 'The longest night. Shadow pumpkins grow 2x faster.', bonusType: 'growth', bonusValue: 2.0, emoji: '❄️', color: '#93C5FD' },
  { month: 1, day: 1, name: 'New Year\'s Awakening', description: 'A fresh start! Bonus candy coins for the new year.', bonusType: 'coins', bonusValue: 2.5, emoji: '🎉', color: '#FBBF24' },
  { month: 3, day: 15, name: 'Beware the Ides', description: 'Enemies are weakened! Easy defense waves.', bonusType: 'defense', bonusValue: 0.5, emoji: '🗡️', color: '#991B1B' },
  { month: 6, day: 21, name: 'Midsummer Nightmare', description: 'Even in summer, the spooky never stops. Spawn rate up.', bonusType: 'spawn', bonusValue: 2.0, emoji: '☀️', color: '#F97316' },
];

// ---------------------------------------------------------------------------
// Main Hook
// ---------------------------------------------------------------------------

export default function usePumpkinVillage() {
  const [state, setState] = useState<PvPumpkinVillageState>(pvCreateDefaultState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // -- Daily reset effect ---------------------------------------------------

  useEffect(() => {
    const now = Date.now();
    const todayKey = pvGenerateDayKey(now);
    if (state.dailyDate !== todayKey) {
      setState((prev) => ({
        ...prev,
        dailyDate: todayKey,
        dailyQuests: pvGenerateDailyQuests(now),
        stats: {
          ...prev.stats,
          currentStreak: prev.dailyDate !== null ? prev.stats.currentStreak + 1 : 1,
          longestStreak: Math.max(
            prev.stats.longestStreak,
            prev.dailyDate !== null ? prev.stats.currentStreak + 1 : 1
          ),
        },
      }));
    }
  }, [state.dailyDate]);

  // -- Weather rotation effect ----------------------------------------------

  useEffect(() => {
    const now = Date.now();
    if (now >= state.weatherEndTime) {
      const rng = pvMulberry32(now);
      const weathers = PV_WEATHER_TYPES.map((w) => w.id);
      const newWeather = pvPickRandom(rng, weathers);
      const duration = PV_WEATHER_DURATION_MINUTES * 60 * 1000;
      setState((prev) => ({
        ...prev,
        currentWeather: newWeather,
        weatherEndTime: now + duration,
      }));
    }
  }, [state.weatherEndTime, state.currentWeather]);

  // -- Compute event multiplier --------------------------------------------

  const activeEventMultiplier = useMemo(() => {
    const now = Date.now();
    let xpMult = 1;
    let coinMult = 1;
    for (const ev of state.events) {
      if (ev.active && ev.startTime !== null) {
        const def = PV_EVENTS.find((e) => e.id === ev.eventId);
        if (def && (now - ev.startTime) < def.durationHours * 3600 * 1000) {
          xpMult = Math.max(xpMult, def.xpMultiplier);
          coinMult = Math.max(coinMult, def.coinMultiplier);
        } else if (ev.active) {
          setState((prev) => ({
            ...prev,
            events: prev.events.map((e) =>
              e.eventId === ev.eventId ? { ...e, active: false, startTime: null } : e
            ),
          }));
        }
      }
    }
    const weatherDef = PV_WEATHER_TYPES.find((w) => w.id === state.currentWeather);
    return {
      xpMult,
      coinMult,
      growMult: weatherDef?.growSpeedMultiplier ?? 1,
      enemyMult: weatherDef?.enemyStrengthMultiplier ?? 1,
      visibility: weatherDef?.visibilityReduction ?? 0,
    };
  }, [state.events, state.currentWeather]);

  // -- Computed: unlocked areas --------------------------------------------

  const unlockedAreas = useMemo(() => {
    return PV_VILLAGE_AREAS.filter((area) => pvIsAreaUnlocked(state, area.id));
  }, [state.level]);

  // -- Computed: available pumpkins by level --------------------------------

  const availablePumpkins = useMemo(() => {
    const allPumpkins = [...PV_PUMPKIN_TYPES, PV_ETERNAL_PUMPKIN];
    return allPumpkins.filter((p) => {
      if (p.rarity === 'Common') return state.level >= 1;
      if (p.rarity === 'Uncommon') return state.level >= 5;
      if (p.rarity === 'Rare') return state.level >= 10;
      if (p.rarity === 'Epic') return state.level >= 20;
      if (p.rarity === 'Legendary') return state.level >= 35;
      return false;
    });
  }, [state.level]);

  // -- Computed: available recipes by level --------------------------------

  const availableRecipes = useMemo(() => {
    return PV_RECIPES.filter((r) => state.level >= r.requiredLevel);
  }, [state.level]);

  // -- Computed: active events list -----------------------------------------

  const activeEvents = useMemo(() => {
    const now = Date.now();
    return state.events.filter((e) => {
      if (!e.active || e.startTime === null) return false;
      const def = PV_EVENTS.find((d) => d.id === e.eventId);
      if (!def) return false;
      return (now - e.startTime) < def.durationHours * 3600 * 1000;
    });
  }, [state.events]);

  // -- Computed: unlockable areas -------------------------------------------

  const unlockableAreas = useMemo(() => {
    return PV_VILLAGE_AREAS.filter(
      (area) => area.unlockLevel > 1 && !pvIsAreaUnlocked(state, area.id)
    );
  }, [state.level]);

  // -- Computed: achievement progress values --------------------------------

  const achievementProgress = useMemo(() => {
    const statsMap: Record<string, number> = {
      totalPumpkinsPlanted: state.stats.totalPumpkinsPlanted,
      totalPumpkinsHarvested: state.stats.totalPumpkinsHarvested,
      totalItemsCrafted: state.stats.totalItemsCrafted,
      totalEnemiesDefeated: state.stats.totalEnemiesDefeated,
      totalDecorationsPlaced: state.stats.totalDecorationsPlaced,
      totalNpcsVisited: state.stats.totalNpcsVisited,
      totalTrickOrTreats: state.stats.totalTrickOrTreats,
      totalCandyCoinsEarned: state.stats.totalCandyCoinsEarned,
      longestStreak: state.stats.longestStreak,
      level: state.level,
      areasUnlocked: unlockedAreas.length,
      legendaryHarvests: state.stats.totalPumpkinsHarvested,
      uniqueRecipesCrafted: state.stats.totalItemsCrafted,
    };
    return PV_ACHIEVEMENTS.map((ach) => ({
      ...ach,
      currentProgress: statsMap[ach.conditionKey] ?? 0,
    }));
  }, [state.stats, state.level, unlockedAreas.length]);

  // -- Computed: inventory summary ------------------------------------------

  const inventorySummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of state.inventory) {
      counts.set(item.itemId, (counts.get(item.itemId) ?? 0) + item.count);
    }
    return Array.from(counts.entries()).map(([itemId, count]) => ({
      itemId,
      count,
      recipe: PV_RECIPES.find((r) => r.resultItem === itemId),
    }));
  }, [state.inventory]);

  // -- Computed: weather info -----------------------------------------------

  const currentWeatherInfo = useMemo(() => {
    return PV_WEATHER_TYPES.find((w) => w.id === state.currentWeather) ?? PV_WEATHER_TYPES[0];
  }, [state.currentWeather]);

  // -- Computed: XP to next level -------------------------------------------

  const xpToNextLevel = useMemo(() => {
    if (state.level >= PV_MAX_LEVEL) return 0;
    return pvXpRequired(state.level) - state.xp;
  }, [state.level, state.xp]);

  const xpProgressPercent = useMemo(() => {
    if (state.level >= PV_MAX_LEVEL) return 100;
    const needed = pvXpRequired(state.level);
    return needed > 0 ? Math.floor((state.xp / needed) * 100) : 100;
  }, [state.level, state.xp]);

  // -- Computed: village stats ---------------------------------------------

  const villageStats = useMemo(() => {
    const defenseFromPlots = state.plots
      .filter((p) => p.pumpkinId !== null)
      .reduce((sum, p) => {
        const def = pvGetPumpkinDef(p.pumpkinId!);
        return sum + (def?.defenseBonus ?? 0);
      }, 0);
    const totalDefense = state.villageDefense + defenseFromPlots;
    return {
      totalDefense,
      totalSpookiness: state.villageSpookiness,
      totalPlots: state.plots.length,
      activePlots: state.plots.filter((p) => p.pumpkinId !== null).length,
      readyPlots: state.plots.filter((p) => p.readyToHarvest).length,
    };
  }, [state.plots, state.villageDefense, state.villageSpookiness]);

  // =========================================================================
  // Actions (useCallback)
  // =========================================================================

  // -- Add XP & Level Up ---------------------------------------------------

  const addXp = useCallback((amount: number) => {
    const scaledAmount = Math.floor(amount * activeEventMultiplier.xpMult);
    setState((prev) => {
      let newLevel = prev.level;
      let newXp = prev.xp + scaledAmount;
      let totalXp = prev.totalXp + scaledAmount;
      while (newLevel < PV_MAX_LEVEL && newXp >= pvXpRequired(newLevel)) {
        newXp -= pvXpRequired(newLevel);
        newLevel += 1;
      }
      if (newLevel >= PV_MAX_LEVEL) {
        newXp = 0;
      }
      return {
        ...prev,
        level: pvClampLevel(newLevel),
        xp: newXp,
        totalXp,
        title: pvGetTitleForLevel(newLevel),
        stats: { ...prev.stats, totalXPEarned: prev.stats.totalXPEarned + scaledAmount },
      };
    });
  }, [activeEventMultiplier.xpMult]);

  // -- Add Candy Coins -----------------------------------------------------

  const addCoins = useCallback((amount: number) => {
    const scaledAmount = Math.floor(amount * activeEventMultiplier.coinMult);
    setState((prev) => ({
      ...prev,
      candyCoins: prev.candyCoins + scaledAmount,
      stats: { ...prev.stats, totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + scaledAmount },
    }));
  }, [activeEventMultiplier.coinMult]);

  // -- Spend Candy Coins ---------------------------------------------------

  const spendCoins = useCallback((amount: number) => {
    setState((prev) => {
      if (prev.candyCoins < amount) return prev;
      return {
        ...prev,
        candyCoins: prev.candyCoins - amount,
        stats: { ...prev.stats, totalCandyCoinsSpent: prev.stats.totalCandyCoinsSpent + amount },
      };
    });
  }, []);

  // -- Plant Pumpkin -------------------------------------------------------

  const plantPumpkin = useCallback(
    (plotIndex: number, pumpkinId: string) => {
      const pumpkin = pvGetPumpkinDef(pumpkinId);
      if (!pumpkin) return false;
      return new Promise<boolean>((resolve) => {
        setState((prev) => {
          if (prev.candyCoins < pumpkin.seedCost) { resolve(false); return prev; }
          const plot = prev.plots[plotIndex];
          if (!plot || plot.pumpkinId !== null) { resolve(false); return prev; }
          resolve(true);
          return {
            ...prev,
            candyCoins: prev.candyCoins - pumpkin.seedCost,
            plots: prev.plots.map((p, i) =>
              i === plotIndex
                ? { ...p, pumpkinId, plantedAt: Date.now(), growthProgress: 0, readyToHarvest: false, watered: false, fertilized: false }
                : p
            ),
            stats: {
              ...prev.stats,
              totalPumpkinsPlanted: prev.stats.totalPumpkinsPlanted + 1,
              totalCandyCoinsSpent: prev.stats.totalCandyCoinsSpent + pumpkin.seedCost,
            },
          };
        });
      });
    },
    []
  );

  // -- Water Plot ----------------------------------------------------------

  const waterPlot = useCallback((plotIndex: number) => {
    setState((prev) => ({
      ...prev,
      plots: prev.plots.map((p, i) =>
        i === plotIndex ? { ...p, watered: true } : p
      ),
    }));
  }, []);

  // -- Fertilize Plot ------------------------------------------------------

  const fertilizePlot = useCallback((plotIndex: number) => {
    setState((prev) => {
      if (prev.candyCoins < 10) return prev;
      return {
        ...prev,
        candyCoins: prev.candyCoins - 10,
        plots: prev.plots.map((p, i) =>
          i === plotIndex ? { ...p, fertilized: true } : p
        ),
        stats: { ...prev.stats, totalCandyCoinsSpent: prev.stats.totalCandyCoinsSpent + 10 },
      };
    });
  }, []);

  // -- Harvest Pumpkin -----------------------------------------------------

  const harvestPumpkin = useCallback(
    (plotIndex: number) => {
      return new Promise<{ coins: number; xp: number; pumpkinName: string } | null>((resolve) => {
        setState((prev) => {
          const plot = prev.plots[plotIndex];
          if (!plot || !plot.pumpkinId || !plot.readyToHarvest) {
            resolve(null);
            return prev;
          }
          const pumpkin = pvGetPumpkinDef(plot.pumpkinId);
          if (!pumpkin) { resolve(null); return prev; }
          const coins = Math.floor(pumpkin.candyCoinsPerHarvest * activeEventMultiplier.coinMult);
          const xp = Math.floor(pumpkin.xpPerHarvest * activeEventMultiplier.xpMult);
          resolve({ coins, xp, pumpkinName: pumpkin.name });
          return {
            ...prev,
            candyCoins: prev.candyCoins + coins,
            xp: prev.xp + xp,
            totalXp: prev.totalXp + xp,
            stats: {
              ...prev.stats,
              totalPumpkinsHarvested: prev.stats.totalPumpkinsHarvested + 1,
              totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + coins,
              totalXPEarned: prev.stats.totalXPEarned + xp,
            },
            plots: prev.plots.map((p, i) =>
              i === plotIndex
                ? { ...p, pumpkinId: null, plantedAt: null, growthProgress: 0, readyToHarvest: false, watered: false, fertilized: false }
                : p
            ),
          };
        });
      });
    },
    [activeEventMultiplier.coinMult, activeEventMultiplier.xpMult]
  );

  // -- Update Plot Growth (call periodically) ------------------------------

  const updatePlotGrowth = useCallback(() => {
    const now = Date.now();
    setState((prev) => {
      const updatedPlots = prev.plots.map((plot) => {
        if (!plot.pumpkinId || plot.readyToHarvest || plot.plantedAt === null) return plot;
        const pumpkin = pvGetPumpkinDef(plot.pumpkinId);
        if (!pumpkin) return plot;
        const growTimeMs = pumpkin.growTimeMinutes * 60 * 1000;
        let speedMult = activeEventMultiplier.growMult;
        if (plot.watered) speedMult *= 1.25;
        if (plot.fertilized) speedMult *= 1.5;
        const elapsed = (now - plot.plantedAt) * speedMult;
        const progress = Math.min(100, (elapsed / growTimeMs) * 100);
        return { ...plot, growthProgress: progress, readyToHarvest: progress >= 100 };
      });
      return { ...prev, plots: updatedPlots };
    });
  }, [activeEventMultiplier.growMult]);

  // -- Craft Item ----------------------------------------------------------

  const craftItem = useCallback(
    (recipeId: string) => {
      const recipe = pvGetRecipeDef(recipeId);
      if (!recipe) return null;
      return new Promise<{ success: boolean; resultItem: string; resultEmoji: string; coins: number; xp: number } | null>((resolve) => {
        setState((prev) => {
          if (prev.level < recipe.requiredLevel) {
            resolve({ success: false, resultItem: '', resultEmoji: '', coins: 0, xp: 0 });
            return prev;
          }
          // Check inventory for ingredients (using pumpkin counts from harvested stats)
          // Simplified: just check if enough coins for crafting fee
          const craftFee = 5;
          if (prev.candyCoins < craftFee) {
            resolve({ success: false, resultItem: '', resultEmoji: '', coins: 0, xp: 0 });
            return prev;
          }
          const coins = Math.floor(recipe.candyCoinValue * activeEventMultiplier.coinMult);
          const xp = Math.floor(recipe.xpReward * activeEventMultiplier.xpMult);
          const existingItem = prev.inventory.find((inv) => inv.itemId === recipe.resultItem);
          let newInventory: PvInventoryItem[];
          if (existingItem) {
            newInventory = prev.inventory.map((inv) =>
              inv.itemId === recipe.resultItem ? { ...inv, count: inv.count + 1 } : inv
            );
          } else {
            if (prev.inventory.length >= PV_MAX_INVENTORY) {
              resolve({ success: false, resultItem: '', resultEmoji: '', coins: 0, xp: 0 });
              return prev;
            }
            newInventory = [...prev.inventory, { itemId: recipe.resultItem, count: 1 }];
          }
          resolve({ success: true, resultItem: recipe.resultItem, resultEmoji: recipe.resultEmoji, coins, xp });
          return {
            ...prev,
            candyCoins: prev.candyCoins - craftFee + coins,
            xp: prev.xp + xp,
            totalXp: prev.totalXp + xp,
            inventory: newInventory,
            villageDefense: prev.villageDefense + recipe.defenseValue,
            stats: {
              ...prev.stats,
              totalItemsCrafted: prev.stats.totalItemsCrafted + 1,
              totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + coins,
              totalXPEarned: prev.stats.totalXPEarned + xp,
            },
          };
        });
      });
    },
    [activeEventMultiplier.coinMult, activeEventMultiplier.xpMult]
  );

  // -- Place Decoration ----------------------------------------------------

  const placeDecoration = useCallback((decorationId: string) => {
    const decoration = PV_DECORATIONS.find((d) => d.id === decorationId);
    if (!decoration) return false;
    return new Promise<boolean>((resolve) => {
      setState((prev) => {
        if (prev.candyCoins < decoration.cost) { resolve(false); return prev; }
        resolve(true);
        return {
          ...prev,
          candyCoins: prev.candyCoins - decoration.cost,
          villageSpookiness: prev.villageSpookiness + decoration.spookinessBonus,
          villageDefense: prev.villageDefense + decoration.defenseBonus,
          stats: {
            ...prev.stats,
            totalDecorationsPlaced: prev.stats.totalDecorationsPlaced + 1,
            totalCandyCoinsSpent: prev.stats.totalCandyCoinsSpent + decoration.cost,
          },
        };
      });
    });
  }, []);

  // -- Visit NPC -----------------------------------------------------------

  const visitNpc = useCallback((npcId: string) => {
    const npc = PV_NPCS.find((n) => n.id === npcId);
    if (!npc) return null;
    return new Promise<{ greeting: string; coins: number; xp: number }>((resolve) => {
      setState((prev) => {
        if (prev.level < npc.requiredLevel) {
          resolve({ greeting: 'You are not ready to meet me yet...', coins: 0, xp: 0 });
          return prev;
        }
        const coins = Math.floor(npc.visitReward.coins * activeEventMultiplier.coinMult);
        const xp = Math.floor(npc.visitReward.xp * activeEventMultiplier.xpMult);
        resolve({ greeting: npc.greeting, coins, xp });
        return {
          ...prev,
          candyCoins: prev.candyCoins + coins,
          xp: prev.xp + xp,
          totalXp: prev.totalXp + xp,
          npcVisits: prev.npcVisits.map((nv) =>
            nv.npcId === npcId
              ? { ...nv, met: true, timesVisited: nv.timesVisited + 1, lastVisitDate: pvGenerateDayKey(Date.now()) }
              : nv
          ),
          stats: {
            ...prev.stats,
            totalNpcsVisited: prev.stats.totalNpcsVisited + 1,
            totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + coins,
            totalXPEarned: prev.stats.totalXPEarned + xp,
          },
        };
      });
    });
  }, [activeEventMultiplier.coinMult, activeEventMultiplier.xpMult]);

  // -- Trick or Treat ------------------------------------------------------

  const trickOrTreat = useCallback(() => {
    const now = Date.now();
    if (now - state.lastTrickOrTreatTime < PV_TRICK_OR_TREAT_COOLDOWN_MS) {
      return null;
    }
    const rng = pvMulberry32(now);
    const isTrick = rng() < 0.3;
    const coinReward = isTrick ? 0 : Math.floor(20 + rng() * 80);
    const xpReward = isTrick ? 5 : Math.floor(15 + rng() * 35);
    return new Promise<{ isTrick: boolean; coins: number; xp: number; message: string }>((resolve) => {
      setState((prev) => {
        if (now - prev.lastTrickOrTreatTime < PV_TRICK_OR_TREAT_COOLDOWN_MS) {
          resolve({ isTrick: false, coins: 0, xp: 0, message: 'Too soon! Wait a moment.' });
          return prev;
        }
        const multCoins = Math.floor(coinReward * activeEventMultiplier.coinMult);
        const multXp = Math.floor(xpReward * activeEventMultiplier.xpMult);
        const trickMessages = [
          'A ghost jumps out! You drop some coins in surprise.',
          'The door slams shut! Spooky but no treats.',
          'A bat swoops down and steals your candy!',
          'A skeleton hands you a rock instead of candy.',
          'The house was a mirage! Just an empty field.',
        ];
        const treatMessages = [
          'A friendly witch gives you a handful of candy coins!',
          'A vampire offers you a bag of treats. How generous!',
          'A ghost floats up and drops candy from above!',
          'You find a pumpkin full of candy on the doorstep!',
          'A mummy unwraps bandages to reveal candy inside!',
        ];
        const messages = isTrick ? trickMessages : treatMessages;
        const message = messages[Math.floor(rng() * messages.length)];
        resolve({ isTrick, coins: multCoins, xp: multXp, message });
        return {
          ...prev,
          lastTrickOrTreatTime: now,
          candyCoins: prev.candyCoins + multCoins,
          xp: prev.xp + multXp,
          totalXp: prev.totalXp + multXp,
          stats: {
            ...prev.stats,
            totalTrickOrTreats: prev.stats.totalTrickOrTreats + 1,
            totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + multCoins,
            totalXPEarned: prev.stats.totalXPEarned + multXp,
          },
        };
      });
    });
  }, [state.lastTrickOrTreatTime, activeEventMultiplier.coinMult, activeEventMultiplier.xpMult]);

  // -- Defend Village (Battle) ---------------------------------------------

  const startDefenseWave = useCallback(() => {
    const now = Date.now();
    const rng = pvMulberry32(now);
    const areaId = stateRef.current.selectedArea;
    const areaEnemies = PV_ENEMIES.filter((e) => e.spawnArea.includes(areaId));
    const waveSize = Math.min(1 + Math.floor(stateRef.current.level / 5), 5);
    const enemies: PvEnemyInstance[] = [];
    for (let i = 0; i < waveSize; i++) {
      const enemyDef = pvPickRandom(rng, areaEnemies);
      const hpMult = activeEventMultiplier.enemyMult;
      enemies.push({
        enemyId: enemyDef.id,
        hp: Math.floor(enemyDef.hp * hpMult),
        maxHp: Math.floor(enemyDef.hp * hpMult),
        attack: Math.floor(enemyDef.attack * hpMult),
        defense: enemyDef.defense,
        position: i,
      });
    }
    setState((prev) => ({
      ...prev,
      activeEnemies: enemies,
    }));
    return enemies;
  }, [activeEventMultiplier.enemyMult]);

  const attackEnemy = useCallback((enemyPosition: number) => {
    return new Promise<{ enemyDefeated: boolean; damage: number; xpGained: number; coinsGained: number; enemyName: string } | null>((resolve) => {
      setState((prev) => {
        const enemy = prev.activeEnemies.find((e) => e.position === enemyPosition);
        if (!enemy) { resolve(null); return prev; }
        const enemyDef = pvGetEnemyDef(enemy.enemyId);
        if (!enemyDef) { resolve(null); return prev; }
        const playerDamage = Math.max(1, 10 + prev.level * 2 - enemy.defense);
        const newHp = enemy.hp - playerDamage;
        if (newHp <= 0) {
          const xp = Math.floor(enemyDef.xpReward * activeEventMultiplier.xpMult);
          const coins = Math.floor(enemyDef.candyCoinReward * activeEventMultiplier.coinMult);
          resolve({ enemyDefeated: true, damage: playerDamage, xpGained: xp, coinsGained: coins, enemyName: enemyDef.name });
          return {
            ...prev,
            candyCoins: prev.candyCoins + coins,
            xp: prev.xp + xp,
            totalXp: prev.totalXp + xp,
            activeEnemies: prev.activeEnemies.filter((e) => e.position !== enemyPosition),
            battleLog: [
              ...prev.battleLog,
              { timestamp: Date.now(), enemyName: enemyDef.name, result: 'won', xpGained: xp, coinsGained: coins },
            ],
            stats: {
              ...prev.stats,
              totalEnemiesDefeated: prev.stats.totalEnemiesDefeated + 1,
              totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + coins,
              totalXPEarned: prev.stats.totalXPEarned + xp,
            },
          };
        }
        resolve({ enemyDefeated: false, damage: playerDamage, xpGained: 0, coinsGained: 0, enemyName: enemyDef.name });
        return {
          ...prev,
          activeEnemies: prev.activeEnemies.map((e) =>
            e.position === enemyPosition ? { ...e, hp: newHp } : e
          ),
        };
      });
    });
  }, [activeEventMultiplier.xpMult, activeEventMultiplier.coinMult]);

  const enemiesAttack = useCallback(() => {
    setState((prev) => {
      if (prev.activeEnemies.length === 0) return prev;
      const totalDefense = villageStats.totalDefense;
      const damageToVillage = prev.activeEnemies.reduce(
        (sum, e) => sum + Math.max(0, e.attack - totalDefense * 0.1),
        0
      );
      return {
        ...prev,
        activeEnemies: prev.activeEnemies.map((e) => ({
          ...e,
          position: e.position - 1,
        })),
      };
    });
  }, [villageStats.totalDefense]);

  const endDefenseWave = useCallback((won: boolean) => {
    setState((prev) => ({
      ...prev,
      activeEnemies: [],
      stats: {
        ...prev.stats,
        totalDefensesWon: won ? prev.stats.totalDefensesWon + 1 : prev.stats.totalDefensesWon,
        totalDefensesLost: won ? prev.stats.totalDefensesLost : prev.stats.totalDefensesLost + 1,
      },
    }));
  }, []);

  // -- Unlock Area ---------------------------------------------------------

  const unlockArea = useCallback((areaId: PvAreaId) => {
    const area = pvGetAreaDef(areaId);
    if (!area) return false;
    return new Promise<boolean>((resolve) => {
      setState((prev) => {
        if (prev.level < area.unlockLevel || prev.candyCoins < area.unlockCost) {
          resolve(false);
          return prev;
        }
        resolve(true);
        return {
          ...prev,
          candyCoins: prev.candyCoins - area.unlockCost,
          stats: { ...prev.stats, totalCandyCoinsSpent: prev.stats.totalCandyCoinsSpent + area.unlockCost },
        };
      });
    });
  }, []);

  // -- Select Area ---------------------------------------------------------

  const selectArea = useCallback((areaId: PvAreaId) => {
    setState((prev) => {
      if (!pvIsAreaUnlocked(prev, areaId)) return prev;
      return { ...prev, selectedArea: areaId };
    });
  }, []);

  // -- Activate Event ------------------------------------------------------

  const activateEvent = useCallback((eventId: PvEventId) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.eventId === eventId ? { ...e, active: true, startTime: Date.now(), progress: 0 } : e
      ),
    }));
  }, []);

  // -- Complete Daily Quest ------------------------------------------------

  const progressDailyQuest = useCallback(
    (type: PvDailyQuest['type'], amount?: number) => {
      setState((prev) => {
        return {
          ...prev,
          dailyQuests: prev.dailyQuests.map((q) => {
            if (q.type !== type || q.completed) return q;
            const increment = amount ?? 1;
            const newProgress = Math.min(q.progress + increment, q.target);
            return { ...q, progress: newProgress, completed: newProgress >= q.target };
          }),
        };
      });
    },
    []
  );

  const claimDailyQuest = useCallback((questId: string) => {
    setState((prev) => {
      const quest = prev.dailyQuests.find((q) => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return prev;
      return {
        ...prev,
        candyCoins: prev.candyCoins + quest.rewardCoins,
        xp: prev.xp + quest.rewardXP,
        totalXp: prev.totalXp + quest.rewardXP,
        dailyQuests: prev.dailyQuests.map((q) =>
          q.id === questId ? { ...q, claimed: true } : q
        ),
        stats: {
          ...prev.stats,
          totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + quest.rewardCoins,
          totalXPEarned: prev.stats.totalXPEarned + quest.rewardXP,
        },
      };
    });
  }, []);

  // -- Check & Unlock Achievements -----------------------------------------

  const checkAchievements = useCallback(() => {
    setState((prev) => {
      const statsMap: Record<string, number> = {
        totalPumpkinsPlanted: prev.stats.totalPumpkinsPlanted,
        totalPumpkinsHarvested: prev.stats.totalPumpkinsHarvested,
        totalItemsCrafted: prev.stats.totalItemsCrafted,
        totalEnemiesDefeated: prev.stats.totalEnemiesDefeated,
        totalDecorationsPlaced: prev.stats.totalDecorationsPlaced,
        totalNpcsVisited: prev.stats.totalNpcsVisited,
        totalTrickOrTreats: prev.stats.totalTrickOrTreats,
        totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned,
        longestStreak: prev.stats.longestStreak,
        level: prev.level,
        areasUnlocked: unlockedAreas.length,
        legendaryHarvests: prev.stats.totalPumpkinsHarvested,
        uniqueRecipesCrafted: prev.stats.totalItemsCrafted,
      };
      let totalBonusCoins = 0;
      let totalBonusXp = 0;
      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.unlocked) return ach;
        const achDef = PV_ACHIEVEMENTS.find((a) => a.id === ach.achievementId);
        if (!achDef) return ach;
        const currentValue = statsMap[achDef.conditionKey] ?? 0;
        const shouldUnlock = currentValue >= achDef.targetValue;
        if (shouldUnlock) {
          totalBonusCoins += achDef.rewardCoins;
          totalBonusXp += achDef.rewardXP;
          return { ...ach, unlocked: true, progress: achDef.targetValue };
        }
        return { ...ach, progress: currentValue };
      });
      if (totalBonusCoins === 0 && totalBonusXp === 0) {
        return { ...prev, achievements: prev.achievements.map((a) => {
          const def = PV_ACHIEVEMENTS.find((d) => d.id === a.achievementId);
          const val = statsMap[def?.conditionKey ?? ''] ?? 0;
          return { ...a, progress: val };
        })};
      }
      return {
        ...prev,
        candyCoins: prev.candyCoins + totalBonusCoins,
        xp: prev.xp + totalBonusXp,
        totalXp: prev.totalXp + totalBonusXp,
        achievements: updatedAchievements,
        stats: {
          ...prev.stats,
          totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + totalBonusCoins,
          totalXPEarned: prev.stats.totalXPEarned + totalBonusXp,
        },
      };
    });
  }, [unlockedAreas.length]);

  // -- Sell Inventory Item -------------------------------------------------

  const sellItem = useCallback((itemId: string, amount: number) => {
    setState((prev) => {
      const item = prev.inventory.find((i) => i.itemId === itemId);
      if (!item || item.count < amount) return prev;
      const recipe = PV_RECIPES.find((r) => r.resultItem === itemId);
      const sellValue = recipe ? Math.floor(recipe.candyCoinValue * 0.5 * amount) : amount * 2;
      const newInventory = prev.inventory
        .map((i) => (i.itemId === itemId ? { ...i, count: i.count - amount } : i))
        .filter((i) => i.count > 0);
      return {
        ...prev,
        candyCoins: prev.candyCoins + sellValue,
        inventory: newInventory,
        stats: {
          ...prev.stats,
          totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + sellValue,
        },
      };
    });
  }, []);

  // -- Use Defense Item from Inventory ------------------------------------

  const useDefenseItem = useCallback((itemId: string) => {
    setState((prev) => {
      const item = prev.inventory.find((i) => i.itemId === itemId);
      if (!item || item.count < 1) return prev;
      const recipe = PV_RECIPES.find((r) => r.resultItem === itemId);
      const defenseValue = recipe?.defenseValue ?? 0;
      if (defenseValue <= 0) return prev;
      const newInventory = prev.inventory
        .map((i) => (i.itemId === itemId ? { ...i, count: i.count - 1 } : i))
        .filter((i) => i.count > 0);
      return {
        ...prev,
        villageDefense: prev.villageDefense + defenseValue,
        inventory: newInventory,
      };
    });
  }, []);

  // -- Get NPC by ID -------------------------------------------------------

  const getNpcById = useCallback((npcId: string) => {
    return PV_NPCS.find((n) => n.id === npcId) ?? null;
  }, []);

  // -- Get Pumpkin by ID ---------------------------------------------------

  const getPumpkinById = useCallback((pumpkinId: string) => {
    const fromList = PV_PUMPKIN_TYPES.find((p) => p.id === pumpkinId);
    if (fromList) return fromList;
    if (PV_ETERNAL_PUMPKIN.id === pumpkinId) return PV_ETERNAL_PUMPKIN;
    return null;
  }, []);

  // -- Get Enemy by ID -----------------------------------------------------

  const getEnemyById = useCallback((enemyId: string) => {
    return PV_ENEMIES.find((e) => e.id === enemyId) ?? null;
  }, []);

  // -- Get Recipe by ID ----------------------------------------------------

  const getRecipeById = useCallback((recipeId: string) => {
    return PV_RECIPES.find((r) => r.id === recipeId) ?? null;
  }, []);

  // -- Get Decoration by ID ------------------------------------------------

  const getDecorationById = useCallback((decorationId: string) => {
    return PV_DECORATIONS.find((d) => d.id === decorationId) ?? null;
  }, []);

  // -- Get Event by ID -----------------------------------------------------

  const getEventById = useCallback((eventId: PvEventId) => {
    return PV_EVENTS.find((e) => e.id === eventId) ?? null;
  }, []);

  // -- Reset Village -------------------------------------------------------

  const resetVillage = useCallback(() => {
    setState(pvCreateDefaultState());
  }, []);

  // -- Draw Fortune Card ---------------------------------------------------

  const drawFortuneCard = useCallback(() => {
    const now = Date.now();
    const rng = pvMulberry32(now);
    const card = pvPickRandom(rng, PV_FORTUNE_CARDS);
    const bonusCoins = Math.floor(50 + rng() * 450);
    const bonusXp = Math.floor(30 + rng() * 170);
    // Apply fortune effects immediately
    switch (card.fortuneType) {
      case 'bounty':
        addCoins(bonusCoins);
        break;
      case 'storm':
        addXp(bonusXp);
        break;
      case 'rest':
        // Grow all pumpkins instantly
        setState((prev) => ({
          ...prev,
          plots: prev.plots.map((p) =>
            p.pumpkinId !== null && !p.readyToHarvest
              ? { ...p, growthProgress: 100, readyToHarvest: true }
              : p
          ),
        }));
        break;
      case 'growth':
        addXp(bonusXp);
        break;
      case 'defense':
        addCoins(bonusCoins);
        break;
      case 'mystery':
        addCoins(bonusCoins);
        addXp(bonusXp);
        break;
    }
    return card;
  }, [addCoins, addXp]);

  // -- Get NPC Dialogue ----------------------------------------------------

  const getNpcDialogue = useCallback((npcId: string) => {
    const dialogueSet = PV_NPC_DIALOGUES.find((d) => d.npcId === npcId);
    if (!dialogueSet) return { line: 'The spirit has nothing to say...', farewell: 'Goodbye.' };
    const rng = pvMulberry32(Date.now());
    const line = pvPickRandom(rng, dialogueSet.dialogues);
    return { line, farewell: dialogueSet.farewell };
  }, []);

  // -- Get Today's Festival ------------------------------------------------

  const todayFestival = useMemo(() => {
    const now = new Date();
    return PV_FESTIVAL_CALENDAR.find(
      (f) => f.month === now.getMonth() + 1 && f.day === now.getDate()
    ) ?? null;
  }, []);

  // -- Get Current Season --------------------------------------------------

  const currentSeason = useMemo(() => {
    const month = new Date().getMonth(); // 0-11
    if (month >= 2 && month <= 4) return { name: 'Spring Awakening', emoji: '🌸', color: '#F9A8D4' };
    if (month >= 5 && month <= 7) return { name: 'Midsummer Nightmare', emoji: '☀️', color: '#F59E0B' };
    if (month >= 8 && month <= 10) return { name: 'Spooky Season', emoji: '🎃', color: '#F97316' };
    return { name: 'Winter Shadows', emoji: '❄️', color: '#93C5FD' };
  }, []);

  // -- Weather Time Remaining ----------------------------------------------

  const weatherTimeRemaining = useMemo(() => {
    const now = Date.now();
    const remaining = Math.max(0, state.weatherEndTime - now);
    return Math.ceil(remaining / 60000); // minutes
  }, [state.weatherEndTime]);

  // -- Force Weather Change ------------------------------------------------

  const forceWeatherChange = useCallback((weatherId: PvWeatherType) => {
    const duration = PV_WEATHER_DURATION_MINUTES * 60 * 1000;
    setState((prev) => ({
      ...prev,
      currentWeather: weatherId,
      weatherEndTime: Date.now() + duration,
    }));
  }, []);

  // -- Mass Harvest (harvest all ready plots) ------------------------------

  const harvestAll = useCallback(() => {
    const results: { plotIndex: number; coins: number; xp: number; pumpkinName: string }[] = [];
    setState((prev) => {
      let totalCoins = 0;
      let totalXp = 0;
      const newPlots = prev.plots.map((plot, i) => {
        if (!plot.pumpkinId || !plot.readyToHarvest) return plot;
        const pumpkin = pvGetPumpkinDef(plot.pumpkinId);
        if (!pumpkin) return plot;
        const coins = Math.floor(pumpkin.candyCoinsPerHarvest * activeEventMultiplier.coinMult);
        const xp = Math.floor(pumpkin.xpPerHarvest * activeEventMultiplier.xpMult);
        totalCoins += coins;
        totalXp += xp;
        results.push({ plotIndex: i, coins, xp, pumpkinName: pumpkin.name });
        return { ...plot, pumpkinId: null, plantedAt: null, growthProgress: 0, readyToHarvest: false, watered: false, fertilized: false };
      });
      return {
        ...prev,
        candyCoins: prev.candyCoins + totalCoins,
        xp: prev.xp + totalXp,
        totalXp: prev.totalXp + totalXp,
        plots: newPlots,
        stats: {
          ...prev.stats,
          totalPumpkinsHarvested: prev.stats.totalPumpkinsHarvested + results.length,
          totalCandyCoinsEarned: prev.stats.totalCandyCoinsEarned + totalCoins,
          totalXPEarned: prev.stats.totalXPEarned + totalXp,
        },
      };
    });
    return results;
  }, [activeEventMultiplier.coinMult, activeEventMultiplier.xpMult]);

  // -- Mass Plant (plant same pumpkin in all empty plots) -----------------

  const massPlant = useCallback(
    (pumpkinId: string) => {
      const pumpkin = pvGetPumpkinDef(pumpkinId);
      if (!pumpkin) return 0;
      return new Promise<number>((resolve) => {
        setState((prev) => {
          let filled = 0;
          const totalCost = 0;
          const newPlots = prev.plots.map((plot) => {
            if (plot.pumpkinId !== null || prev.candyCoins - totalCost - pumpkin.seedCost < 0) return plot;
            filled += 1;
            return {
              ...plot,
              pumpkinId,
              plantedAt: Date.now(),
              growthProgress: 0,
              readyToHarvest: false,
              watered: false,
              fertilized: false,
            };
          });
          const cost = filled * pumpkin.seedCost;
          resolve(filled);
          return {
            ...prev,
            candyCoins: prev.candyCoins - cost,
            plots: newPlots,
            stats: {
              ...prev.stats,
              totalPumpkinsPlanted: prev.stats.totalPumpkinsPlanted + filled,
              totalCandyCoinsSpent: prev.stats.totalCandyCoinsSpent + cost,
            },
          };
        });
      });
    },
    []
  );

  // -- Water All Plots -----------------------------------------------------

  const waterAllPlots = useCallback(() => {
    setState((prev) => ({
      ...prev,
      plots: prev.plots.map((p) =>
        p.pumpkinId !== null && !p.watered ? { ...p, watered: true } : p
      ),
    }));
  }, []);

  // -- Get All Enemy Definitions -------------------------------------------

  const getAllEnemyDefs = useCallback(() => {
    return PV_ENEMIES;
  }, []);

  // -- Get Battle Log (recent) ---------------------------------------------

  const recentBattleLog = useMemo(() => {
    return state.battleLog.slice(-20);
  }, [state.battleLog]);

  // =========================================================================
  // Return API Object
  // =========================================================================

  return {
    // --- Raw State ---
    state,

    // --- Core Stats ---
    level: state.level,
    xp: state.xp,
    totalXp: state.totalXp,
    candyCoins: state.candyCoins,
    title: state.title,
    xpToNextLevel,
    xpProgressPercent,
    selectedArea: state.selectedArea,

    // --- Computed ---
    unlockedAreas,
    unlockableAreas,
    availablePumpkins,
    availableRecipes,
    activeEvents,
    achievementProgress,
    inventorySummary,
    currentWeatherInfo,
    villageStats,
    recentBattleLog,
    todayFestival,
    currentSeason,
    weatherTimeRemaining,

    // --- Multipliers ---
    activeEventMultiplier,

    // --- Actions ---
    addXp,
    addCoins,
    spendCoins,
    plantPumpkin,
    waterPlot,
    fertilizePlot,
    harvestPumpkin,
    harvestAll,
    massPlant,
    waterAllPlots,
    updatePlotGrowth,
    craftItem,
    placeDecoration,
    visitNpc,
    trickOrTreat,
    startDefenseWave,
    attackEnemy,
    enemiesAttack,
    endDefenseWave,
    unlockArea,
    selectArea,
    activateEvent,
    progressDailyQuest,
    claimDailyQuest,
    checkAchievements,
    sellItem,
    useDefenseItem,
    resetVillage,
    drawFortuneCard,
    forceWeatherChange,

    // --- Lookups ---
    getNpcById,
    getPumpkinById,
    getEnemyById,
    getRecipeById,
    getDecorationById,
    getEventById,
    getNpcDialogue,
    getAllEnemyDefs,
  };
}
