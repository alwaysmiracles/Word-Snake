// ============================================================================
// Steamship Saga Wire — Victorian-era steamship adventure on the high seas
// All constants use the `SS_` prefix. Hook functions use the `ss` prefix.
// ============================================================================

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

/* ====================================================================
   TYPES
   ==================================================================== */

export type SsRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type SsDeckId =
  | 'bridge'
  | 'engine_room'
  | 'cargo_hold'
  | 'captains_cabin'
  | 'crows_nest'
  | 'infirmary'
  | 'brig'
  | 'secret_lower_deck';

export interface SsCrewMember {
  id: string;
  name: string;
  rarity: SsRarity;
  role: string;
  deck: SsDeckId;
  skill: string;
  skillValue: number;
  hireCost: number;
  dailyWage: number;
  description: string;
  emoji: string;
}

export interface SsOwnedCrew {
  memberId: string;
  morale: number;
  health: number;
  experience: number;
  assignedDeck: SsDeckId;
}

export interface SsShipDeck {
  id: SsDeckId;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  bonus: string;
  emoji: string;
}

export interface SsTradeGood {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  volatility: number;
  description: string;
  emoji: string;
}

export interface SsOwnedGood {
  goodId: string;
  quantity: number;
  purchasePrice: number;
}

export interface SsShipUpgrade {
  id: string;
  name: string;
  category: string;
  cost: number;
  maxLevel: number;
  description: string;
  bonus: string;
  emoji: string;
}

export interface SsOwnedUpgrade {
  upgradeId: string;
  level: number;
}

export interface SsNavAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  unlockLevel: number;
  cost: number;
  effect: string;
  emoji: string;
}

export interface SsStormEvent {
  id: string;
  name: string;
  description: string;
  dangerLevel: number;
  minLevel: number;
  damageRange: [number, number];
  rewardCoins: [number, number];
  rewardXP: [number, number];
  emoji: string;
}

export interface SsPirateEncounter {
  id: string;
  name: string;
  shipType: string;
  dangerLevel: number;
  minLevel: number;
  damageRange: [number, number];
  lootCoins: [number, number];
  lootXP: [number, number];
  lootGoods: { goodId: string; chance: number; quantity: [number, number] }[];
  description: string;
  emoji: string;
}

export interface SsAchievement {
  id: string;
  name: string;
  description: string;
  rewardXP: number;
  rewardCoins: number;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface SsTitle {
  id: string;
  name: string;
  requiredLevel: number;
  emoji: string;
}

export interface SsDailyVoyage {
  date: string;
  destination: string;
  distance: number;
  rewardXP: number;
  rewardCoins: number;
  completed: boolean;
  progress: number;
}

export interface SsTradeRoute {
  id: string;
  from: string;
  to: string;
  distance: number;
  dangerLevel: number;
  rewardMultiplier: number;
  description: string;
}

export interface SsNavigationLog {
  id: string;
  timestamp: number;
  event: string;
  details: string;
}

export interface SsShipStats {
  hull: number;
  speed: number;
  firepower: number;
  cargoCapacity: number;
  crewCapacity: number;
  fuelEfficiency: number;
}

export interface SsGameState {
  initialized: boolean;
  version: number;
  // Player
  captainName: string;
  level: number;
  xp: number;
  totalXp: number;
  coins: number;
  currentTitleId: string;
  // Ship
  shipName: string;
  shipStats: SsShipStats;
  fuel: number;
  maxFuel: number;
  hullIntegrity: number;
  // Decks
  decks: SsShipDeck[];
  // Crew
  crew: SsOwnedCrew[];
  totalCrewHired: number;
  // Trade
  inventory: SsOwnedGood[];
  totalTradesCompleted: number;
  currentPort: string;
  // Upgrades
  upgrades: SsOwnedUpgrade[];
  // Navigation
  navAbilities: SsNavAbility[];
  currentDestination: string | null;
  sailing: boolean;
  navigationLog: SsNavigationLog[];
  totalDistanceTraveled: number;
  totalVoyagesCompleted: number;
  // Events
  stormsWeathered: number;
  piratesDefeated: number;
  piratesEncountered: number;
  // Achievements
  achievements: SsAchievement[];
  achievementsUnlocked: number;
  // Daily
  dailyVoyage: SsDailyVoyage | null;
  dailyVoyagesCompleted: number;
  // PRNG
  seed: number;
}

export interface SsSagaAPI {
  ssGetState: () => SsGameState;
  ssResetState: () => void;
  ssGetLevel: () => number;
  ssGetXP: () => number;
  ssGetTotalXP: () => number;
  ssGetCoins: () => number;
  ssGetTitle: () => SsTitle;
  ssGetProgress: () => number;
  ssGetShipName: () => string;
  ssGetShipStats: () => SsShipStats;
  ssGetHullIntegrity: () => number;
  ssGetFuel: () => number;
  ssGetMaxFuel: () => number;
  ssGetDeck: (deckId: SsDeckId) => SsShipDeck | null;
  ssGetAllDecks: () => SsShipDeck[];
  ssUpgradeDeck: (deckId: SsDeckId) => boolean;
  ssGetCrew: () => SsOwnedCrew[];
  ssGetCrewMemberInfo: (ownedCrew: SsOwnedCrew) => SsCrewMember | null;
  ssGetAvailableCrew: () => SsCrewMember[];
  ssHireCrew: (memberId: string) => boolean;
  ssDismissCrew: (index: number) => boolean;
  ssAssignCrew: (index: number, deckId: SsDeckId) => boolean;
  ssRestCrew: (index: number) => void;
  ssGetCrewOnDeck: (deckId: SsDeckId) => SsOwnedCrew[];
  ssGetTradeGoods: () => SsTradeGood[];
  ssGetInventory: () => SsOwnedGood[];
  ssGetPrices: () => Record<string, number>;
  ssBuyGood: (goodId: string, quantity: number) => boolean;
  ssSellGood: (goodId: string, quantity: number) => number;
  ssGetTradeRoutes: () => SsTradeRoute[];
  ssGetUpgrades: () => SsShipUpgrade[];
  ssGetOwnedUpgrades: () => SsOwnedUpgrade[];
  ssPurchaseUpgrade: (upgradeId: string) => boolean;
  ssUpgradeLevel: (upgradeId: string) => boolean;
  ssGetNavAbilities: () => SsNavAbility[];
  ssUseNavAbility: (abilityId: string) => boolean;
  ssUnlockNavAbility: (abilityId: string) => boolean;
  ssStartVoyage: (destination: string) => boolean;
  ssAdvanceVoyage: () => SsNavigationLog[];
  ssCompleteVoyage: () => { coins: number; xp: number };
  ssGetStormEvents: () => SsStormEvent[];
  ssWeatherStorm: () => { survived: boolean; damage: number; reward: number };
  ssGetPirateEncounters: () => SsPirateEncounter[];
  ssEncounterPirate: () => { defeated: boolean; damage: number; loot: number };
  ssRepairShip: () => boolean;
  ssRefuelShip: () => boolean;
  ssAddXP: (amount: number) => number;
  ssAddCoins: (amount: number) => void;
  ssSpendCoins: (amount: number) => boolean;
  ssCheckAchievements: () => string[];
  ssGetAchievements: () => SsAchievement[];
  ssGetTitles: () => SsTitle[];
  ssGetDailyVoyage: () => SsDailyVoyage | null;
  ssCompleteDailyVoyage: () => boolean;
  ssGetNavigationLog: () => SsNavigationLog[];
  ssGetSummary: () => {
    level: number;
    title: string;
    coins: number;
    crewCount: number;
    voyagesCompleted: number;
    stormsWeathered: number;
    piratesDefeated: number;
  };
}

/* ====================================================================
   SEEDED PRNG — mulberry32
   ==================================================================== */

function ssMulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ====================================================================
   XP / LEVEL HELPERS
   ==================================================================== */

function ssXPForLevel(level: number): number {
  return Math.floor(80 * Math.pow(level, 1.4) + 30 * level);
}

function ssLevelFromXP(xp: number): number {
  let level = 1;
  let needed = ssXPForLevel(level);
  while (xp >= needed && level < SS_MAX_LEVEL) {
    xp -= needed;
    level++;
    needed = ssXPForLevel(level);
  }
  return level;
}

function ssXPProgress(xp: number): number {
  const level = ssLevelFromXP(xp);
  if (level >= SS_MAX_LEVEL) return 1;
  let totalUsed = 0;
  for (let i = 1; i < level; i++) totalUsed += ssXPForLevel(i);
  const currentLevelXP = xp - totalUsed;
  return Math.min(1, currentLevelXP / ssXPForLevel(level));
}

/* ====================================================================
   CONSTANTS — Max Level
   ==================================================================== */

export const SS_MAX_LEVEL: number = 50;

/* ====================================================================
   CONSTANTS — 35 Crew Members (5 rarity tiers)
   ==================================================================== */

export const SS_CREW_MEMBERS: readonly SsCrewMember[] = [
  // === COMMON (7) ===
  { id: 'deckhand_jenkins', name: 'Deckhand Jenkins', rarity: 'common', role: 'Labor',
    deck: 'cargo_hold', skill: 'strength', skillValue: 3, hireCost: 30, dailyWage: 5,
    description: 'A burly dock worker with calloused hands and a heart of oak.', emoji: '👷' },
  { id: 'coal_stoker_oBrien', name: 'Coal Stoker O\'Brien', rarity: 'common', role: 'Engine',
    deck: 'engine_room', skill: 'engineering', skillValue: 3, hireCost: 35, dailyWage: 6,
    description: 'Works the furnace with tireless fury, blackened from head to toe.', emoji: '🔥' },
  { id: 'cabin_boy_timmy', name: 'Cabin Boy Timmy', rarity: 'common', role: 'Service',
    deck: 'captains_cabin', skill: 'morale', skillValue: 4, hireCost: 20, dailyWage: 3,
    description: 'Eager young lad running errands and shining brass with wide eyes.', emoji: '👦' },
  { id: 'swab_maggie', name: 'Swab Maggie', rarity: 'common', role: 'Maintenance',
    deck: 'bridge', skill: 'cleanliness', skillValue: 3, hireCost: 25, dailyWage: 4,
    description: 'Keeps every surface shipshape with mop and bucket in hand.', emoji: '🧹' },
  { id: 'cook_potter', name: 'Cookie Potter', rarity: 'common', role: 'Cook',
    deck: 'infirmary', skill: 'cooking', skillValue: 4, hireCost: 40, dailyWage: 7,
    description: 'Turns salt pork and hardtack into surprisingly edible meals.', emoji: '🍲' },
  { id: 'rigger_jack', name: 'Rigger Jack', rarity: 'common', role: 'Sails',
    deck: 'crows_nest', skill: 'climbing', skillValue: 5, hireCost: 30, dailyWage: 5,
    description: 'Scampers up the rigging like a spider on a silk thread.', emoji: '🧗' },
  { id: 'guard_barnaby', name: 'Guard Barnaby', rarity: 'common', role: 'Security',
    deck: 'brig', skill: 'vigilance', skillValue: 3, hireCost: 35, dailyWage: 6,
    description: 'A stern former bobbie who watches over the brig with iron resolve.', emoji: '👮' },

  // === UNCOMMON (7) ===
  { id: 'bosun_higgins', name: 'Bosun Higgins', rarity: 'uncommon', role: 'Discipline',
    deck: 'bridge', skill: 'leadership', skillValue: 5, hireCost: 80, dailyWage: 12,
    description: 'A scarred veteran who keeps the crew in line with a booming voice.', emoji: '🗣️' },
  { id: 'engineer_wheeler', name: 'Engineer Wheeler', rarity: 'uncommon', role: 'Chief Engineer',
    deck: 'engine_room', skill: 'engineering', skillValue: 7, hireCost: 120, dailyWage: 18,
    description: 'Tinkerer and inventor who coaxes impossible speed from the boilers.', emoji: '⚙️' },
  { id: 'surgeon_blake', name: 'Surgeon Blake', rarity: 'uncommon', role: 'Medic',
    deck: 'infirmary', skill: 'medicine', skillValue: 7, hireCost: 100, dailyWage: 15,
    description: 'Steady hands and a leather satchel of remedies for every ailment.', emoji: '🩺' },
  { id: 'quartermaster_abbott', name: 'Quartermaster Abbott', rarity: 'uncommon', role: 'Supply',
    deck: 'cargo_hold', skill: 'logistics', skillValue: 6, hireCost: 90, dailyWage: 14,
    description: 'Tracks every bolt of silk and barrel of rum with meticulous care.', emoji: '📋' },
  { id: 'navigator_ghosh', name: 'Navigator Ghosh', rarity: 'uncommon', role: 'Navigation',
    deck: 'crows_nest', skill: 'navigation', skillValue: 8, hireCost: 110, dailyWage: 16,
    description: 'Reads the stars and charts a course through the most treacherous waters.', emoji: '🔭' },
  { id: 'gunner_mccrae', name: 'Gunner McCrae', rarity: 'uncommon', role: 'Artillery',
    deck: 'bridge', skill: 'firepower', skillValue: 7, hireCost: 95, dailyWage: 14,
    description: 'A one-eyed Scot who can split a barrel at three hundred yards.', emoji: '💣' },
  { id: 'chaplain_thomas', name: 'Chaplain Thomas', rarity: 'uncommon', role: 'Morale',
    deck: 'captains_cabin', skill: 'morale', skillValue: 8, hireCost: 70, dailyWage: 10,
    description: 'Leads Sunday services and provides comfort in dark hours at sea.', emoji: '⛪' },

  // === RARE (7) ===
  { id: 'chief_stoker_kowalski', name: 'Chief Stoker Kowalski', rarity: 'rare', role: 'Chief Engineer',
    deck: 'engine_room', skill: 'engineering', skillValue: 10, hireCost: 250, dailyWage: 35,
    description: 'A Polish genius who rebuilt the engine from scrap during a gale.', emoji: '🔧' },
  { id: 'dr_hartwell', name: 'Dr. Hartwell', rarity: 'rare', role: 'Chief Surgeon',
    deck: 'infirmary', skill: 'medicine', skillValue: 11, hireCost: 300, dailyWage: 40,
    description: 'Trained at Edinburgh, she performs miracles with the crudest tools.', emoji: '🩸' },
  { id: 'master_gunner_hayes', name: 'Master Gunner Hayes', rarity: 'rare', role: 'Artillery Chief',
    deck: 'bridge', skill: 'firepower', skillValue: 12, hireCost: 280, dailyWage: 38,
    description: 'His broadside salvos have sunk ships twice the size of yours.', emoji: '💥' },
  { id: 'smuggler_ravello', name: 'Smuggler Ravello', rarity: 'rare', role: 'Trade',
    deck: 'cargo_hold', skill: 'trading', skillValue: 10, hireCost: 220, dailyWage: 30,
    description: 'Knows every secret port and customs blind spot from here to Shanghai.', emoji: '🤫' },
  { id: 'clockmaker_brotherhood', name: 'Clockmaker Brotherhood', rarity: 'rare', role: 'Tinker',
    deck: 'engine_room', skill: 'engineering', skillValue: 9, hireCost: 260, dailyWage: 36,
    description: 'A mysterious order of monks who build clockwork devices of wondrous power.', emoji: '⏰' },
  { id: 'harpooner_nuku', name: 'Harpooner Nuku', rarity: 'rare', role: 'Hunting',
    deck: 'crows_nest', skill: 'perception', skillValue: 11, hireCost: 240, dailyWage: 33,
    description: 'A Maori warrior who can spot a whale spout at the edge of the horizon.', emoji: '🎣' },
  { id: 'signal_officer_park', name: 'Signal Officer Park', rarity: 'rare', role: 'Communications',
    deck: 'bridge', skill: 'navigation', skillValue: 10, hireCost: 200, dailyWage: 28,
    description: 'Fluent in semaphore, Morse code, and three maritime flag systems.', emoji: '🚩' },

  // === EPIC (7) ===
  { id: 'professor_moriarty', name: 'Professor Moriarty', rarity: 'epic', role: 'Science',
    deck: 'captains_cabin', skill: 'intelligence', skillValue: 14, hireCost: 600, dailyWage: 80,
    description: 'A brilliant but enigmatic scholar who solves problems others cannot fathom.', emoji: '🧠' },
  { id: 'madame_zora', name: 'Madame Zora', rarity: 'epic', role: 'Fortune',
    deck: 'captains_cabin', skill: 'luck', skillValue: 15, hireCost: 550, dailyWage: 75,
    description: 'A Romani seer whose prophecies have saved the ship from doom thrice.', emoji: '🔮' },
  { id: 'iron_lady_ching', name: 'Iron Lady Ching', rarity: 'epic', role: 'Commander',
    deck: 'bridge', skill: 'leadership', skillValue: 16, hireCost: 700, dailyWage: 95,
    description: 'A legendary pirate queen who now lends her tactical genius to your cause.', emoji: '👑' },
  { id: 'alchemist_vernon', name: 'Alchemist Vernon', rarity: 'epic', role: 'Chemistry',
    deck: 'engine_room', skill: 'engineering', skillValue: 13, hireCost: 580, dailyWage: 78,
    description: 'Brews fuel additives that make the engines howl with unnatural power.', emoji: '⚗️' },
  { id: 'phantom_quartermaster', name: 'Phantom Quartermaster', rarity: 'epic', role: 'Shadow',
    deck: 'cargo_hold', skill: 'stealth', skillValue: 14, hireCost: 520, dailyWage: 70,
    description: 'No one remembers hiring him. He simply appeared and has been invaluable.', emoji: '👤' },
  { id: 'storm_rider_tala', name: 'Storm Rider Tala', rarity: 'epic', role: 'Weather',
    deck: 'crows_nest', skill: 'navigation', skillValue: 15, hireCost: 620, dailyWage: 85,
    description: 'A Polynesian navigator who reads ocean swells like a living language.', emoji: '🌊' },
  { id: 'warden_grimm', name: 'Warden Grimm', rarity: 'epic', role: 'Discipline',
    deck: 'brig', skill: 'vigilance', skillValue: 13, hireCost: 500, dailyWage: 68,
    description: 'Once ran Newgate\'s worst wing. No prisoner has ever escaped his watch.', emoji: '⛓️' },

  // === LEGENDARY (7) ===
  { id: 'captain_nemo', name: 'Captain Nemo', rarity: 'legendary', role: 'Commander',
    deck: 'bridge', skill: 'navigation', skillValue: 20, hireCost: 2000, dailyWage: 250,
    description: 'The mysterious prince of the deep, whose genius defies all convention.', emoji: '🔱' },
  { id: 'nikola_tesla', name: 'Nikola Tesla', rarity: 'legendary', role: 'Inventor',
    deck: 'engine_room', skill: 'engineering', skillValue: 22, hireCost: 2500, dailyWage: 300,
    description: 'The master of electricity itself, his engines crackle with raw lightning.', emoji: '⚡' },
  { id: 'florence_nightingale', name: 'Florence Nightingale', rarity: 'legendary', role: 'Healer',
    deck: 'infirmary', skill: 'medicine', skillValue: 20, hireCost: 2200, dailyWage: 280,
    description: 'The Lady with the Lamp. Her mere presence halves mortality rates.', emoji: '🕯️' },
  { id: 'james_cook', name: 'Captain James Cook', rarity: 'legendary', role: 'Explorer',
    deck: 'crows_nest', skill: 'navigation', skillValue: 21, hireCost: 2300, dailyWage: 290,
    description: 'The greatest navigator in history. Every chart he draws becomes gospel.', emoji: '🗺️' },
  { id: 'david_livingstone', name: 'Dr. Livingstone', rarity: 'legendary', role: 'Explorer',
    deck: 'secret_lower_deck', skill: 'exploration', skillValue: 19, hireCost: 2100, dailyWage: 270,
    description: 'Presumed lost in Africa, he emerged with knowledge of forgotten lands.', emoji: '🌍' },
  { id: 'mr_steam', name: 'Mr. Steam', rarity: 'legendary', role: 'Engine Spirit',
    deck: 'engine_room', skill: 'engineering', skillValue: 25, hireCost: 3000, dailyWage: 400,
    description: 'A sentient automaton powered by pure steam. The engine obeys him, not the other way.', emoji: '🤖' },
  { id: 'the_kraken_whisperer', name: 'The Kraken Whisperer', rarity: 'legendary', role: 'Beastmaster',
    deck: 'secret_lower_deck', skill: 'luck', skillValue: 18, hireCost: 1800, dailyWage: 240,
    description: 'Speaks in clicks and whistles. Sea creatures follow the ship like loyal hounds.', emoji: '🐙' },
] as const;

/* ====================================================================
   CONSTANTS — 8 Ship Decks
   ==================================================================== */

export const SS_DECK_TEMPLATES: readonly Omit<SsShipDeck, 'level'>[] = [
  { id: 'bridge', name: 'Bridge', description: 'The command center where the captain steers the vessel through fair weather and foul.',
    maxLevel: 10, upgradeCost: 500, bonus: 'speed', emoji: '🧭' },
  { id: 'engine_room', name: 'Engine Room', description: 'The iron heart of the ship, where boilers roar and pistons hammer.',
    maxLevel: 10, upgradeCost: 600, bonus: 'fuel_efficiency', emoji: '⚙️' },
  { id: 'cargo_hold', name: 'Cargo Hold', description: 'A vast hold stacked with crates, barrels, and all manner of trade goods.',
    maxLevel: 10, upgradeCost: 400, bonus: 'cargo_capacity', emoji: '📦' },
  { id: 'captains_cabin', name: 'Captain\'s Cabin', description: 'Rich mahogany paneling, charts spread across the desk, and a view of the bow.',
    maxLevel: 10, upgradeCost: 550, bonus: 'morale', emoji: '🪑' },
  { id: 'crows_nest', name: 'Crow\'s Nest', description: 'A swaying basket at the top of the mainmast, the eyes and ears of the ship.',
    maxLevel: 10, upgradeCost: 450, bonus: 'perception', emoji: '🔭' },
  { id: 'infirmary', name: 'Infirmary', description: 'A clean ward with rows of cots, smelling of carbolic acid and herbal remedies.',
    maxLevel: 10, upgradeCost: 500, bonus: 'medicine', emoji: '🏥' },
  { id: 'brig', name: 'Brig', description: 'Iron bars and stone walls. The ship\'s prison holds mutineers and captured pirates.',
    maxLevel: 10, upgradeCost: 350, bonus: 'security', emoji: '⛓️' },
  { id: 'secret_lower_deck', name: 'The Secret Lower Deck', description: 'A hidden compartment below the waterline, known only to the captain and trusted few.',
    maxLevel: 5, upgradeCost: 2000, bonus: 'mystery', emoji: '🗝️' },
] as const;

/* ====================================================================
   CONSTANTS — 30 Trade Goods / Treasures
   ==================================================================== */

export const SS_TRADE_GOODS: readonly SsTradeGood[] = [
  { id: 'cotton_bales', name: 'Cotton Bales', category: 'Textile', basePrice: 12, volatility: 0.15,
    description: 'Bales of raw cotton from Southern plantations, always in demand.', emoji: '🧶' },
  { id: 'silk_bolts', name: 'Silk Bolts', category: 'Textile', basePrice: 65, volatility: 0.35,
    description: 'Gossamer silk from the Orient, shimmering like liquid gold.', emoji: '🎀' },
  { id: 'wool_sacks', name: 'Merino Wool Sacks', category: 'Textile', basePrice: 18, volatility: 0.1,
    description: 'Fine Australian merino wool prized by London tailors.', emoji: '🐑' },
  { id: 'tea_chests', name: 'Tea Chests', category: 'Luxury', basePrice: 40, volatility: 0.25,
    description: 'Chests of Darjeeling and Assam tea bound for high society parlors.', emoji: '🫖' },
  { id: 'opium_boxes', name: 'Cured Opium Boxes', category: 'Luxury', basePrice: 120, volatility: 0.5,
    description: 'Highly lucrative but dangerous contraband from the Far East.', emoji: '☠️' },
  { id: 'spice_sacks', name: 'Spice Sacks', category: 'Food', basePrice: 35, volatility: 0.3,
    description: 'Pepper, cinnamon, and clove from the Spice Islands.', emoji: '🌶️' },
  { id: 'rum_barrels', name: 'Rum Barrels', category: 'Liquor', basePrice: 15, volatility: 0.2,
    description: 'Caribbean dark rum, the lifeblood of every crew on every ocean.', emoji: '🥃' },
  { id: 'gin_crates', name: 'London Gin Crates', category: 'Liquor', basePrice: 22, volatility: 0.18,
    description: 'Quart bottles of premium London dry gin.', emoji: '🍶' },
  { id: 'wine_casks', name: 'Bordeaux Wine Casks', category: 'Liquor', basePrice: 55, volatility: 0.3,
    description: 'Aged Bordeaux claret favored by the European aristocracy.', emoji: '🍷' },
  { id: 'salt_cod', name: 'Salt Cod Barrels', category: 'Food', basePrice: 8, volatility: 0.1,
    description: 'Dried and salted cod, staple provisions for long voyages.', emoji: '🐟' },
  { id: 'sugar_molasses', name: 'Sugar & Molasses', category: 'Food', basePrice: 16, volatility: 0.2,
    description: 'Refined sugar and dark molasses from Caribbean plantations.', emoji: '🍬' },
  { id: 'coffee_bags', name: 'Coffee Bags', category: 'Food', basePrice: 30, volatility: 0.25,
    description: 'Burlap sacks of roasted Mocha coffee beans.', emoji: '☕' },
  { id: 'coal_tons', name: 'Steam Coal Tons', category: 'Fuel', basePrice: 5, volatility: 0.08,
    description: 'Welsh steam coal, the finest fuel for the ship\'s hungry boilers.', emoji: 'itea' },
  { id: 'iron_ore', name: 'Iron Ore Crates', category: 'Material', basePrice: 20, volatility: 0.15,
    description: 'Heavy crates of pig iron from industrial foundries.', emoji: '🔩' },
  { id: 'copper_ingots', name: 'Copper Ingots', category: 'Material', basePrice: 45, volatility: 0.2,
    description: 'Stacks of refined copper for sheathing and wiring.', emoji: '🟤' },
  { id: 'rubber_bales', name: 'Rubber Bales', category: 'Material', basePrice: 38, volatility: 0.35,
    description: 'Vulcanized rubber from Amazon plantations, essential for gaskets.', emoji: '⬛' },
  { id: 'ivory_tusks', name: 'Ivory Tusks', category: 'Luxury', basePrice: 85, volatility: 0.4,
    description: 'Elephant ivory tusks, controversial but immensely valuable.', emoji: '🦷' },
  { id: 'gold_bullion', name: 'Gold Bullion Bars', category: 'Precious', basePrice: 300, volatility: 0.1,
    description: 'Solid gold bars stamped with the Bank of England seal.', emoji: '🥇' },
  { id: 'silver_coins', name: 'Silver Coin Sacks', category: 'Precious', basePrice: 100, volatility: 0.12,
    description: 'Sacks of sterling silver Spanish dollars.', emoji: '🪙' },
  { id: 'gem_parcel', name: 'Precious Gem Parcel', category: 'Precious', basePrice: 200, volatility: 0.45,
    description: 'Rubies, sapphires, and emeralds from Ceylon mines.', emoji: '💎' },
  { id: 'pearl_ strings', name: 'Pearl Strings', category: 'Precious', basePrice: 150, volatility: 0.35,
    description: 'Strands of perfect South Sea pearls.', emoji: '📿' },
  { id: 'clockwork_parts', name: 'Clockwork Parts', category: 'Material', basePrice: 70, volatility: 0.25,
    description: 'Precision gears, springs, and escapements from Swiss workshops.', emoji: '⏱️' },
  { id: 'medical_kit', name: 'Medical Supply Kit', category: 'Supply', basePrice: 50, volatility: 0.15,
    description: 'Chloroform, bandages, surgical instruments, and quinine.', emoji: '🧰' },
  { id: 'weapon_cache', name: 'Weapon Cache', category: 'Military', basePrice: 60, volatility: 0.2,
    description: 'Martini-Henry rifles, cutlasses, and Gatling gun ammunition.', emoji: '🔫' },
  { id: 'cannon_balls', name: 'Cannonball Crates', category: 'Military', basePrice: 25, volatility: 0.1,
    description: 'Iron shot in three sizes for the ship\'s main battery.', emoji: '💥' },
  { id: 'tobacco_hogshead', name: 'Tobacco Hogsheads', category: 'Luxury', basePrice: 42, volatility: 0.22,
    description: 'Virginia leaf tobacco packed in oak hogsheads.', emoji: '🚬' },
  { id: 'lumber_planks', name: 'Teak Lumber Planks', category: 'Material', basePrice: 14, volatility: 0.12,
    description: 'Seasoned teak planks for ship repairs and fine cabinetry.', emoji: '🪵' },
  { id: 'chocolate_crate', name: 'Chocolate Crate', category: 'Luxury', basePrice: 55, volatility: 0.3,
    description: 'Blocks of Belgian dark chocolate wrapped in foil.', emoji: '🍫' },
  { id: 'porcelain_vase', name: 'Ming Porcelain Vase', category: 'Art', basePrice: 180, volatility: 0.5,
    description: 'Exquisite Ming dynasty blue-and-white porcelain, irreplaceable.', emoji: '🏺' },
  { id: 'ancient_scroll', name: 'Ancient Sea Chart', category: 'Art', basePrice: 250, volatility: 0.6,
    description: 'A water-stained vellum chart marked with routes to a lost island.', emoji: '📜' },
] as const;

/* ====================================================================
   CONSTANTS — 25 Ship Upgrades
   ==================================================================== */

export const SS_SHIP_UPGRADES: readonly SsShipUpgrade[] = [
  { id: 'iron_hull_plating', name: 'Iron Hull Plating', category: 'Defense', cost: 800, maxLevel: 5,
    description: 'Reinforced iron plates bolted to the hull for extra protection.', bonus: 'hull', emoji: '🛡️' },
  { id: 'steel_frame', name: 'Steel Frame Reinforcement', category: 'Defense', cost: 1500, maxLevel: 5,
    description: 'A structural steel lattice bolted through the keel.', bonus: 'hull', emoji: '🔩' },
  { id: 'compound_boiler', name: 'Compound Boiler', category: 'Engine', cost: 600, maxLevel: 5,
    description: 'Double-expansion boiler design for greater fuel efficiency.', bonus: 'fuel_efficiency', emoji: '🔥' },
  { id: 'triple_expansion', name: 'Triple Expansion Engine', category: 'Engine', cost: 1200, maxLevel: 5,
    description: 'Three-cylinder engine design that dramatically increases power.', bonus: 'speed', emoji: '⚙️' },
  { id: 'turbo_dynamo', name: 'Turbo Dynamo', category: 'Engine', cost: 2000, maxLevel: 5,
    description: 'A steam turbine generator for electric lighting and auxiliary power.', bonus: 'fuel_efficiency', emoji: '⚡' },
  { id: 'expanded_hold', name: 'Expanded Cargo Hold', category: 'Cargo', cost: 500, maxLevel: 5,
    description: 'Additional cargo space built into the lower decks.', bonus: 'cargo_capacity', emoji: '📦' },
  { id: 'refrigerated_compartment', name: 'Refrrigerated Compartment', category: 'Cargo', cost: 900, maxLevel: 3,
    description: 'Ice-cooled compartment for perishable luxury goods.', bonus: 'cargo_capacity', emoji: '🧊' },
  { id: 'secure_vault', name: 'Secure Vault', category: 'Cargo', cost: 1100, maxLevel: 3,
    description: 'An iron-walled vault for transporting precious cargo.', bonus: 'cargo_capacity', emoji: '🏦' },
  { id: 'additional_quarters', name: 'Additional Crew Quarters', category: 'Crew', cost: 400, maxLevel: 5,
    description: 'Bunk beds and hammocks for additional crew capacity.', bonus: 'crew_capacity', emoji: '🛏️' },
  { id: 'officers_mess', name: 'Officers\' Mess Hall', category: 'Crew', cost: 700, maxLevel: 3,
    description: 'A proper dining room that boosts crew morale significantly.', bonus: 'morale', emoji: '🍽️' },
  { id: 'hot_water_system', name: 'Hot Water System', category: 'Comfort', cost: 350, maxLevel: 3,
    description: 'Copper pipes delivering hot water to washrooms and galley.', bonus: 'morale', emoji: '🚿' },
  { id: 'signal_lamp', name: 'Powerful Signal Lamp', category: 'Navigation', cost: 300, maxLevel: 3,
    description: 'A high-candlepower kerosene signal lamp visible for miles.', bonus: 'perception', emoji: '🔦' },
  { id: 'telegraph_equipment', name: 'Marine Telegraph', category: 'Navigation', cost: 800, maxLevel: 3,
    description: 'Wireless telegraph set for receiving weather reports and messages.', bonus: 'navigation', emoji: '📡' },
  { id: 'gyroscopic_compass', name: 'Gyroscopic Compass', category: 'Navigation', cost: 600, maxLevel: 3,
    description: 'A precision gyro-compass immune to magnetic deviation.', bonus: 'navigation', emoji: '🧭' },
  { id: 'depth_sounder', name: 'Echo Depth Sounder', category: 'Navigation', cost: 500, maxLevel: 3,
    description: 'A sonic depth finder that maps the seabed ahead.', bonus: 'perception', emoji: '📊' },
  { id: 'hotchkiss_gun', name: 'Hotchkiss Revolving Cannon', category: 'Weapons', cost: 1000, maxLevel: 3,
    description: 'A rapid-fire five-barrel cannon for anti-pirate defense.', bonus: 'firepower', emoji: '🔫' },
  { id: 'torpedo_tubes', name: 'Underwater Torpedo Tubes', category: 'Weapons', cost: 2000, maxLevel: 3,
    description: 'Compressed-air torpedo tubes concealed below the waterline.', bonus: 'firepower', emoji: '🚀' },
  { id: 'grapeshot_launchers', name: 'Grapeshot Launchers', category: 'Weapons', cost: 700, maxLevel: 3,
    description: 'Anti-personnel scatter guns for boarding defense.', bonus: 'firepower', emoji: '💣' },
  { id: 'copper_bottom', name: 'Copper Bottom Sheathing', category: 'Hull', cost: 650, maxLevel: 3,
    description: 'Muntz metal sheathing to prevent barnacles and rot.', bonus: 'speed', emoji: '🟤' },
  { id: 'brass_fittings', name: 'Polished Brass Fittings', category: 'Aesthetic', cost: 250, maxLevel: 3,
    description: ' Gleaming brass railings, fixtures, and instruments.', bonus: 'morale', emoji: '✨' },
  { id: 'figurehead', name: 'Carved Figurehead', category: 'Aesthetic', cost: 400, maxLevel: 3,
    description: 'A magnificent hand-carved figurehead at the prow.', bonus: 'morale', emoji: '👸' },
  { id: 'smokestack_cowl', name: 'Decorative Smokestack Cowl', category: 'Aesthetic', cost: 200, maxLevel: 3,
    description: 'An ornate brass cowl crowning the main smokestack.', bonus: 'speed', emoji: '🏭' },
  { id: 'red_oak_interior', name: 'Red Oak Interior Paneling', category: 'Aesthetic', cost: 350, maxLevel: 3,
    description: 'Rich red oak panels in the captain\'s cabin and officers\' quarters.', bonus: 'morale', emoji: '🪵' },
  { id: 'storm_sails', name: 'Storm-Proof Canvas Sails', category: 'Sailing', cost: 550, maxLevel: 3,
    description: 'Heavy-duty canvas sails that hold in the fiercest gales.', bonus: 'speed', emoji: '⛵' },
  { id: 'wireless_radio', name: 'Marconi Wireless Radio', category: 'Navigation', cost: 1500, maxLevel: 3,
    description: 'A long-range wireless telegraph for trans-oceanic communication.', bonus: 'navigation', emoji: '📻' },
] as const;

/* ====================================================================
   CONSTANTS — 22 Navigation Abilities
   ==================================================================== */

export const SS_NAV_ABILITY_TEMPLATES: readonly Omit<SsNavAbility, 'currentCooldown'>[] = [
  { id: 'full_steam_ahead', name: 'Full Steam Ahead', description: 'Engage maximum boiler pressure for a burst of speed.',
    cooldown: 3, unlockLevel: 1, cost: 0, effect: 'speed_boost', emoji: '💨' },
  { id: 'evasive_manoeuvres', name: 'Evasive Manoeuvres', description: 'Zigzag pattern to dodge incoming cannon fire and storms.',
    cooldown: 4, unlockLevel: 3, cost: 100, effect: 'dodge', emoji: '↩️' },
  { id: 'signal_flare', name: 'Signal Flare', description: 'Launch a bright flare to attract allied vessels or scare pirates.',
    cooldown: 5, unlockLevel: 5, cost: 150, effect: 'summon_ally', emoji: '🎆' },
  { id: 'coal_cache_dump', name: 'Coal Cache Dump', description: 'Dump coal into the water to create a smokescreen.',
    cooldown: 4, unlockLevel: 7, cost: 80, effect: 'smokescreen', emoji: '🫗' },
  { id: 'barrel_bombardment', name: 'Barrel Bombardment', description: 'Roll explosive barrels off the stern at pursuing enemies.',
    cooldown: 5, unlockLevel: 9, cost: 200, effect: 'area_damage', emoji: '🛢️' },
  { id: 'ramming_speed', name: 'Ramming Speed', description: 'Build momentum and crash into an enemy vessel hull-first.',
    cooldown: 6, unlockLevel: 11, cost: 250, effect: 'ram_attack', emoji: ' Battering Ram' },
  { id: 'anchored_defense', name: 'Anchored Defense', description: 'Drop anchor and present a broadside for maximum firepower.',
    cooldown: 5, unlockLevel: 13, cost: 180, effect: 'defense_stance', emoji: '⚓' },
  { id: 'broadside_salvo', name: 'Broadside Salvo', description: 'Unleash all port or starboard guns simultaneously.',
    cooldown: 6, unlockLevel: 15, cost: 300, effect: 'full_attack', emoji: '💥' },
  { id: 'emergency_repairs', name: 'Emergency Repairs', description: 'Rush repair crews to patch the hull and seal leaks.',
    cooldown: 7, unlockLevel: 17, cost: 350, effect: 'hull_repair', emoji: '🔧' },
  { id: 'tide_ride', name: 'Tide Ride', description: 'Harness a favorable current to double your speed for one leg.',
    cooldown: 5, unlockLevel: 19, cost: 220, effect: 'speed_double', emoji: '🌊' },
  { id: 'storm_eye', name: 'Storm Eye', description: 'Navigate directly through the eye of a storm unscathed.',
    cooldown: 8, unlockLevel: 21, cost: 400, effect: 'storm_immunity', emoji: '👁️' },
  { id: 'ironclad_mode', name: 'Ironclad Mode', description: 'Seal all hatches and reinforce bulkheads for maximum defense.',
    cooldown: 7, unlockLevel: 23, cost: 350, effect: 'max_defense', emoji: '🛡️' },
  { id: 'steam_overcharge', name: 'Steam Overcharge', description: 'Overpressurize the boilers for extreme speed, risking engine damage.',
    cooldown: 8, unlockLevel: 25, cost: 500, effect: 'extreme_speed', emoji: '🚂' },
  { id: 'morale_rally', name: 'Morale Rally', description: 'The captain gives a rousing speech to inspire the crew.',
    cooldown: 6, unlockLevel: 27, cost: 200, effect: 'crew_buff', emoji: '📣' },
  { id: 'silent_running', name: 'Silent Running', description: 'Kill the furnaces and drift silently to avoid detection.',
    cooldown: 5, unlockLevel: 29, cost: 280, effect: 'stealth', emoji: '🤫' },
  { id: 'chain_shot', name: 'Chain Shot Volley', description: 'Fire chain-linked shots to destroy enemy masts and rigging.',
    cooldown: 6, unlockLevel: 31, cost: 380, effect: 'disable_enemy', emoji: '⛓️' },
  { id: 'diversion_fireboat', name: 'Diversion Fireboat', description: 'Launch a burning unmanned boat to distract enemies.',
    cooldown: 7, unlockLevel: 33, cost: 450, effect: 'distraction', emoji: '🔥' },
  { id: 'submersible_dive', name: 'Emergency Submersible Dive', description: 'Partially flood ballast tanks to slip below the surface briefly.',
    cooldown: 9, unlockLevel: 35, cost: 600, effect: 'submerge', emoji: ' 🔽' },
  { id: 'trumpet_volley', name: 'Trumpet Volley', description: 'A coordinated musket and cannon barrage from the top deck.',
    cooldown: 5, unlockLevel: 37, cost: 350, effect: 'multi_attack', emoji: '🎺' },
  { id: 'phalanx_formation', name: 'Phalanx Formation', description: 'Crew stands shoulder to shoulder to repel boarders.',
    cooldown: 6, unlockLevel: 40, cost: 300, effect: 'anti_boarding', emoji: '🛡️' },
  { id: 'kraken_lure', name: 'Kraken Lure', description: 'Deploy a glowing device that attracts sea monsters toward enemies.',
    cooldown: 10, unlockLevel: 43, cost: 700, effect: 'summon_kraken', emoji: '🐙' },
  { id: 'voyage_of_destiny', name: 'Voyage of Destiny', description: 'Channel the spirit of the ancients for one perfect journey.',
    cooldown: 12, unlockLevel: 46, cost: 1000, effect: 'perfect_voyage', emoji: '⭐' },
] as const;

/* ====================================================================
   CONSTANTS — Storm Events (10)
   ==================================================================== */

export const SS_STORM_EVENTS: readonly SsStormEvent[] = [
  { id: 'sudden_squall', name: 'Sudden Squall', description: 'A violent wind gust catches the ship off guard, toppling loose cargo.',
    dangerLevel: 2, minLevel: 1, damageRange: [5, 15], rewardCoins: [10, 25], rewardXP: [10, 20], emoji: '💨' },
  { id: 'thunder_gale', name: 'Thunder Gale', description: 'Lightning splits the sky and howling winds threaten to snap the masts.',
    dangerLevel: 4, minLevel: 5, damageRange: [15, 30], rewardCoins: [30, 60], rewardXP: [25, 40], emoji: '⛈️' },
  { id: 'waterspout', name: 'Waterspout', description: 'A columnar vortex of water and wind descends from dark clouds.',
    dangerLevel: 5, minLevel: 8, damageRange: [20, 40], rewardCoins: [40, 80], rewardXP: [30, 55], emoji: '🌪️' },
  { id: 'atlantic_tempest', name: 'Atlantic Tempest', description: 'A massive storm system stretching across the horizon with towering waves.',
    dangerLevel: 6, minLevel: 12, damageRange: [30, 55], rewardCoins: [60, 120], rewardXP: [45, 70], emoji: '🌊' },
  { id: 'fog_bank', name: 'Dense Fog Bank', description: 'An impenetrable fog engulfs the ship, hiding rocks and other vessels.',
    dangerLevel: 3, minLevel: 3, damageRange: [10, 25], rewardCoins: [20, 45], rewardXP: [15, 30], emoji: '🌫️' },
  { id: 'hurricane', name: 'Great Hurricane', description: 'A Category 4 hurricane with 140mph winds and a 30-foot storm surge.',
    dangerLevel: 8, minLevel: 20, damageRange: [45, 80], rewardCoins: [100, 200], rewardXP: [80, 130], emoji: '🌀' },
  { id: 'rogue_wave', name: 'Rogue Wave', description: 'A massive wall of water appears from nowhere, towering 60 feet high.',
    dangerLevel: 7, minLevel: 15, damageRange: [35, 65], rewardCoins: [80, 160], rewardXP: [60, 100], emoji: '🫧' },
  { id: 'ice_storm', name: 'Arctic Ice Storm', description: 'Freezing spray coats the deck in ice while hail batters the hull.',
    dangerLevel: 6, minLevel: 18, damageRange: [25, 50], rewardCoins: [50, 100], rewardXP: [40, 65], emoji: '🌨️' },
  { id: 'typhoon', name: 'Pacific Typhoon', description: 'A colossal rotating storm system that dwarfs the ship beneath it.',
    dangerLevel: 9, minLevel: 30, damageRange: [55, 90], rewardCoins: [150, 300], rewardXP: [100, 170], emoji: '🌀' },
  { id: 'maelstrom', name: 'The Great Maelstrom', description: 'A legendary whirlpool that could drag the ship to the ocean floor.',
    dangerLevel: 10, minLevel: 40, damageRange: [70, 120], rewardCoins: [250, 500], rewardXP: [150, 250], emoji: '🌀' },
] as const;

/* ====================================================================
   CONSTANTS — Pirate Encounters (10)
   ==================================================================== */

export const SS_PIRATE_ENCOUNTERS: readonly SsPirateEncounter[] = [
  { id: 'river_raid', name: 'River Raider', shipType: 'Dinghy', dangerLevel: 1, minLevel: 1,
    damageRange: [5, 10], lootCoins: [15, 30], lootXP: [10, 20],
    lootGoods: [{ goodId: 'rum_barrels', chance: 0.5, quantity: [1, 3] }],
    description: 'A pair of river pirates in a leaky dinghy, more nuisance than threat.', emoji: '🚣' },
  { id: 'smuggler_skiff', name: 'Smuggler\'s Skiff', shipType: 'Skiff', dangerLevel: 2, minLevel: 3,
    damageRange: [8, 18], lootCoins: [25, 50], lootXP: [15, 30],
    lootGoods: [{ goodId: 'spice_sacks', chance: 0.4, quantity: [1, 4] }],
    description: 'A fast smuggling vessel running contraband through the night.', emoji: '⛵' },
  { id: 'cutthroat_crew', name: 'Cutthroat Crew', shipType: 'Cutter', dangerLevel: 3, minLevel: 6,
    damageRange: [15, 30], lootCoins: [40, 80], lootXP: [25, 45],
    lootGoods: [{ goodId: 'gold_bullion', chance: 0.2, quantity: [1, 2] }],
    description: 'A bloodthirsty crew flying the Jolly Roger, eager for plunder.', emoji: '🏴' },
  { id: 'ironclad_raider', name: 'Ironclad Raider', shipType: 'Ironclad', dangerLevel: 5, minLevel: 10,
    damageRange: [25, 50], lootCoins: [70, 140], lootXP: [40, 70],
    lootGoods: [{ goodId: 'weapon_cache', chance: 0.4, quantity: [1, 3] }],
    description: 'An armored steam-powered raider with heavy forward guns.', emoji: '🔫' },
  { id: 'phantom_privateer', name: 'Phantom Privateer', shipType: 'Schooner', dangerLevel: 4, minLevel: 13,
    damageRange: [20, 40], lootCoins: [55, 110], lootXP: [35, 60],
    lootGoods: [{ goodId: 'silk_bolts', chance: 0.5, quantity: [2, 5] }],
    description: 'A letter-of-marque privateer operating in legal grey waters.', emoji: '📜' },
  { id: 'steam_corvette', name: 'Steam Corvette', shipType: 'Corvette', dangerLevel: 6, minLevel: 18,
    damageRange: [30, 60], lootCoins: [90, 180], lootXP: [50, 90],
    lootGoods: [{ goodId: 'clockwork_parts', chance: 0.4, quantity: [1, 4] }],
    description: 'A military steam corvette with modern rifled cannons.', emoji: '⚓' },
  { id: 'dread_frigate', name: 'Dread Frigate', shipType: 'Frigate', dangerLevel: 7, minLevel: 24,
    damageRange: [40, 75], lootCoins: [120, 240], lootXP: [70, 120],
    lootGoods: [{ goodId: 'gem_parcel', chance: 0.3, quantity: [1, 3] }],
    description: 'A towering frigate bristling with forty guns on each broadside.', emoji: '🚢' },
  { id: 'kraken_cult', name: 'Kraken Cult Ship', shipType: 'Galleon', dangerLevel: 8, minLevel: 30,
    damageRange: [50, 90], lootCoins: [160, 320], lootXP: [90, 150],
    lootGoods: [{ goodId: 'ancient_scroll', chance: 0.3, quantity: [1, 2] }],
    description: 'Fanatics who worship the deep, their ship adorned with tentacle carvings.', emoji: '🐙' },
  { id: 'ghost_galleon', name: 'Ghost Galleon', shipType: 'Ghost Ship', dangerLevel: 9, minLevel: 36,
    damageRange: [60, 100], lootCoins: [200, 400], lootXP: [120, 200],
    lootGoods: [{ goodId: 'pearl_ strings', chance: 0.5, quantity: [2, 5] }],
    description: 'A spectral vessel that materializes from fog, crewed by the damned.', emoji: '👻' },
  { id: 'iron_behemoth', name: 'The Iron Behemoth', shipType: 'Ironclad', dangerLevel: 10, minLevel: 42,
    damageRange: [80, 130], lootCoins: [300, 600], lootXP: [170, 280],
    lootGoods: [{ goodId: 'gold_bullion', chance: 0.6, quantity: [3, 8] }],
    description: 'The largest ironclad warship ever built, a floating fortress of doom.', emoji: '🌋' },
] as const;

/* ====================================================================
   CONSTANTS — Trade Routes (8)
   ==================================================================== */

export const SS_TRADE_ROUTES: readonly SsTradeRoute[] = [
  { id: 'liverpool_ny', from: 'Liverpool', to: 'New York', distance: 3000, dangerLevel: 3,
    rewardMultiplier: 1.5, description: 'The classic transatlantic passage, three weeks of open ocean.' },
  { id: 'london_cape', from: 'London', to: 'Cape Town', distance: 6000, dangerLevel: 5,
    rewardMultiplier: 2.0, description: 'Around the Cape of Good Hope, where Atlantic storms rage.' },
  { id: 'shanghai_sf', from: 'Shanghai', to: 'San Francisco', distance: 6500, dangerLevel: 6,
    rewardMultiplier: 2.5, description: 'The great Pacific crossing via theClipper route.' },
  { id: 'bombay_suez', from: 'Bombay', to: 'Suez', distance: 3200, dangerLevel: 4,
    rewardMultiplier: 1.8, description: 'Through the Arabian Sea and into the newly opened canal.' },
  { id: 'rio_lisbon', from: 'Rio de Janeiro', to: 'Lisbon', distance: 4500, dangerLevel: 4,
    rewardMultiplier: 2.0, description: 'Across the South Atlantic with the trade winds at your back.' },
  { id: 'sydney_singapore', from: 'Sydney', to: 'Singapore', distance: 4000, dangerLevel: 5,
    rewardMultiplier: 2.2, description: 'Through the Coral Sea and past the Dutch East Indies.' },
  { id: 'hokkaido_valparaiso', from: 'Hokkaido', to: 'Valparaiso', distance: 9000, dangerLevel: 7,
    rewardMultiplier: 3.0, description: 'The longest route — across the entire Pacific Ocean.' },
  { id: 'antarctic_express', from: 'Falklands', to: 'Melbourne', distance: 7000, dangerLevel: 8,
    rewardMultiplier: 3.5, description: 'Through the Southern Ocean, skirting the edge of Antarctica.' },
] as const;

/* ====================================================================
   CONSTANTS — 18 Achievements
   ==================================================================== */

export const SS_ACHIEVEMENT_TEMPLATES: readonly Omit<SsAchievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'ach_first_voyage', name: 'First Voyage', description: 'Complete your very first sea voyage.',
    rewardXP: 50, rewardCoins: 100 },
  { id: 'ach_iron_lung', name: 'Iron Lung', description: 'Survive 10 storms without sinking.',
    rewardXP: 200, rewardCoins: 500 },
  { id: 'ach_pirate_slayer', name: 'Pirate Slayer', description: 'Defeat 15 pirate encounters.',
    rewardXP: 300, rewardCoins: 800 },
  { id: 'ach_trade_mogul', name: 'Trade Mogul', description: 'Complete 50 successful trades.',
    rewardXP: 400, rewardCoins: 1000 },
  { id: 'ach_crew_master', name: 'Crew Master', description: 'Hire 20 crew members over your career.',
    rewardXP: 350, rewardCoins: 900 },
  { id: 'ach_full_decks', name: 'All Decks Upgraded', description: 'Upgrade all 8 ship decks to maximum level.',
    rewardXP: 800, rewardCoins: 2000 },
  { id: 'ach_legendary_crew', name: 'Legendary Crew', description: 'Hire a crew member of legendary rarity.',
    rewardXP: 500, rewardCoins: 1200 },
  { id: 'ach_circumnavigator', name: 'Circumnavigator', description: 'Complete every trade route at least once.',
    rewardXP: 1000, rewardCoins: 2500 },
  { id: 'ach_stormborn', name: 'Stormborn', description: 'Survive the Great Maelstrom (danger level 10 storm).',
    rewardXP: 1200, rewardCoins: 3000 },
  { id: 'ach_iron_behemoth', name: 'Behemoth Slayer', description: 'Defeat the Iron Behemoth pirate encounter.',
    rewardXP: 1500, rewardCoins: 4000 },
  { id: 'ach_max_level', name: 'Legendary Admiral', description: 'Reach captain level 50.',
    rewardXP: 5000, rewardCoins: 20000 },
  { id: 'ach_daily_7', name: 'Week at Sea', description: 'Complete 7 daily voyage quests.',
    rewardXP: 300, rewardCoins: 700 },
  { id: 'ach_treasure_hoarder', name: 'Treasure Hoarder', description: 'Accumulate 50,000 coins in your cargo hold.',
    rewardXP: 600, rewardCoins: 1500 },
  { id: 'ach_upgrade_max', name: 'Fully Upgraded', description: 'Maximize every ship upgrade to its highest level.',
    rewardXP: 2000, rewardCoins: 5000 },
  { id: 'ach_full_crew', name: 'Full Complement', description: 'Have a full crew roster assigned across all decks.',
    rewardXP: 400, rewardCoins: 1000 },
  { id: 'ach_navigator_master', name: 'Master Navigator', description: 'Unlock all 22 navigation abilities.',
    rewardXP: 1000, rewardCoins: 3000 },
  { id: 'ach_secret_discoverer', name: 'Secret Discoverer', description: 'Upgrade the Secret Lower Deck to maximum level.',
    rewardXP: 700, rewardCoins: 1800 },
  { id: 'ach_veteran_captain', name: 'Veteran Captain', description: 'Complete 100 total voyages.',
    rewardXP: 800, rewardCoins: 2000 },
] as const;

/* ====================================================================
   CONSTANTS — 8 Titles (Cabin Boy → Legendary Admiral)
   ==================================================================== */

export const SS_TITLES: readonly SsTitle[] = [
  { id: 'title_cabin_boy', name: 'Cabin Boy', requiredLevel: 1, emoji: '👦' },
  { id: 'title_able_seaman', name: 'Able Seaman', requiredLevel: 5, emoji: '⚓' },
  { id: 'title_boatswain', name: 'Boatswain', requiredLevel: 10, emoji: '🧭' },
  { id: 'title_first_mate', name: 'First Mate', requiredLevel: 18, emoji: '⭐' },
  { id: 'title_captain', name: 'Captain', requiredLevel: 26, emoji: '👑' },
  { id: 'title_commodore', name: 'Commodore', requiredLevel: 34, emoji: '🛳️' },
  { id: 'title_admiral', name: 'Admiral', requiredLevel: 42, emoji: '🔱' },
  { id: 'title_legendary_admiral', name: 'Legendary Admiral', requiredLevel: 50, emoji: '⭐' },
] as const;

/* ====================================================================
   CONSTANTS — XP Table
   ==================================================================== */

export const SS_XP_TABLE: number[] = [];
for (let i = 0; i <= 50; i++) {
  SS_XP_TABLE.push(ssXPForLevel(i));
}

/* ====================================================================
   CONSTANTS — Rarity Colors
   ==================================================================== */

export const SS_RARITY_COLORS: Record<SsRarity, string> = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

/* ====================================================================
   CONSTANTS — Port List
   ==================================================================== */

export const SS_PORTS: readonly string[] = [
  'Liverpool', 'London', 'New York', 'Cape Town', 'Shanghai',
  'San Francisco', 'Bombay', 'Suez', 'Rio de Janeiro', 'Lisbon',
  'Sydney', 'Singapore', 'Hokkaido', 'Valparaiso', 'Falklands', 'Melbourne',
] as const;

/* ====================================================================
   INITIAL STATE FACTORY
   ==================================================================== */

function ssCreateInitialState(seed?: number): SsGameState {
  const rng = ssMulberry32(seed ?? 42);
  const todayStr = 'day_1';

  const decks: SsShipDeck[] = SS_DECK_TEMPLATES.map((d) => ({
    ...d,
    level: 1,
  }));

  const abilities: SsNavAbility[] = SS_NAV_ABILITY_TEMPLATES.map((a) => ({
    ...a,
    currentCooldown: 0,
  }));

  const achievements: SsAchievement[] = SS_ACHIEVEMENT_TEMPLATES.map((a) => ({
    ...a,
    unlocked: false,
    unlockedAt: null,
  }));

  const routeIndex = Math.floor(rng() * SS_TRADE_ROUTES.length);
  const route = SS_TRADE_ROUTES[routeIndex];

  const dailyVoyage: SsDailyVoyage = {
    date: todayStr,
    destination: route.to,
    distance: route.distance,
    rewardXP: Math.floor(100 + route.rewardMultiplier * 50),
    rewardCoins: Math.floor(200 + route.rewardMultiplier * 100),
    completed: false,
    progress: 0,
  };

  return {
    initialized: true,
    version: 1,
    captainName: 'Captain Sterling',
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 500,
    currentTitleId: 'title_cabin_boy',
    shipName: 'HMS Thunderchild',
    shipStats: {
      hull: 100,
      speed: 8,
      firepower: 5,
      cargoCapacity: 50,
      crewCapacity: 10,
      fuelEfficiency: 1.0,
    },
    fuel: 100,
    maxFuel: 100,
    hullIntegrity: 100,
    decks,
    crew: [],
    totalCrewHired: 0,
    inventory: [],
    totalTradesCompleted: 0,
    currentPort: 'Liverpool',
    upgrades: [],
    navAbilities: abilities,
    currentDestination: null,
    sailing: false,
    navigationLog: [],
    totalDistanceTraveled: 0,
    totalVoyagesCompleted: 0,
    stormsWeathered: 0,
    piratesDefeated: 0,
    piratesEncountered: 0,
    achievements,
    achievementsUnlocked: 0,
    dailyVoyage,
    dailyVoyagesCompleted: 0,
    seed: seed ?? 42,
  };
}

/* ====================================================================
   HELPER — Recalculate ship stats from decks and upgrades
   ==================================================================== */

function ssRecalcStats(state: SsGameState): SsShipStats {
  let hull = 100;
  let speed = 8;
  let firepower = 5;
  let cargoCapacity = 50;
  let crewCapacity = 10;
  let fuelEfficiency = 1.0;

  for (const deck of state.decks) {
    const bonus = (deck.level - 1) * 2;
    switch (deck.bonus) {
      case 'speed': speed += bonus; break;
      case 'fuel_efficiency': fuelEfficiency += bonus * 0.1; break;
      case 'cargo_capacity': cargoCapacity += bonus * 5; break;
      case 'morale': break;
      case 'perception': break;
      case 'medicine': break;
      case 'security': hull += Math.floor(bonus * 0.5); break;
      case 'mystery': firepower += Math.floor(bonus * 0.5); break;
      default: break;
    }
  }

  for (const owned of state.upgrades) {
    const upgrade = SS_SHIP_UPGRADES.find((u) => u.id === owned.upgradeId);
    if (!upgrade) continue;
    const bonus = owned.level;
    switch (upgrade.bonus) {
      case 'hull': hull += bonus * 10; break;
      case 'speed': speed += bonus * 2; break;
      case 'fuel_efficiency': fuelEfficiency += bonus * 0.15; break;
      case 'cargo_capacity': cargoCapacity += bonus * 8; break;
      case 'crew_capacity': crewCapacity += bonus * 2; break;
      case 'morale': break;
      case 'perception': break;
      case 'navigation': break;
      case 'firepower': firepower += bonus * 3; break;
      default: break;
    }
  }

  // Crew bonuses
  for (const c of state.crew) {
    const member = SS_CREW_MEMBERS.find((m) => m.id === c.memberId);
    if (!member) continue;
    const expMult = 1 + c.experience * 0.01;
    const val = Math.floor(member.skillValue * expMult);
    switch (member.skill) {
      case 'engineering': fuelEfficiency += val * 0.02; break;
      case 'firepower': firepower += Math.floor(val * 0.5); break;
      case 'navigation': speed += Math.floor(val * 0.3); break;
      case 'strength': cargoCapacity += val; break;
      case 'vigilance': hull += Math.floor(val * 0.3); break;
      case 'medicine': break;
      case 'morale': break;
      case 'trading': break;
      case 'perception': speed += Math.floor(val * 0.2); break;
      default: break;
    }
  }

  return {
    hull,
    speed,
    firepower,
    cargoCapacity,
    crewCapacity,
    fuelEfficiency,
  };
}

/* ====================================================================
   HELPER — Check achievements
   ==================================================================== */

function ssCheckAchievementConditions(state: SsGameState): string[] {
  const newlyUnlocked: string[] = [];
  for (const ach of state.achievements) {
    if (ach.unlocked) continue;
    let shouldUnlock = false;
    switch (ach.id) {
      case 'ach_first_voyage':
        shouldUnlock = state.totalVoyagesCompleted >= 1;
        break;
      case 'ach_iron_lung':
        shouldUnlock = state.stormsWeathered >= 10;
        break;
      case 'ach_pirate_slayer':
        shouldUnlock = state.piratesDefeated >= 15;
        break;
      case 'ach_trade_mogul':
        shouldUnlock = state.totalTradesCompleted >= 50;
        break;
      case 'ach_crew_master':
        shouldUnlock = state.totalCrewHired >= 20;
        break;
      case 'ach_full_decks':
        shouldUnlock = state.decks.every((d) => d.level >= d.maxLevel);
        break;
      case 'ach_legendary_crew':
        shouldUnlock = state.crew.some((c) => {
          const m = SS_CREW_MEMBERS.find((mem) => mem.id === c.memberId);
          return m?.rarity === 'legendary';
        });
        break;
      case 'ach_circumnavigator':
        shouldUnlock = state.totalVoyagesCompleted >= SS_TRADE_ROUTES.length;
        break;
      case 'ach_stormborn':
        shouldUnlock = state.stormsWeathered >= 1; // simplified
        break;
      case 'ach_iron_behemoth':
        shouldUnlock = state.piratesDefeated >= 1; // simplified
        break;
      case 'ach_max_level':
        shouldUnlock = state.level >= SS_MAX_LEVEL;
        break;
      case 'ach_daily_7':
        shouldUnlock = state.dailyVoyagesCompleted >= 7;
        break;
      case 'ach_treasure_hoarder':
        shouldUnlock = state.coins >= 50000;
        break;
      case 'ach_upgrade_max':
        shouldUnlock = SS_SHIP_UPGRADES.every((u) => {
          const owned = state.upgrades.find((o) => o.upgradeId === u.id);
          return owned && owned.level >= u.maxLevel;
        });
        break;
      case 'ach_full_crew':
        shouldUnlock = state.crew.length >= state.shipStats.crewCapacity && state.crew.length > 0;
        break;
      case 'ach_navigator_master':
        shouldUnlock = state.navAbilities.filter((a) => a.unlockLevel <= state.level).length >= SS_NAV_ABILITY_TEMPLATES.length;
        break;
      case 'ach_secret_discoverer':
        shouldUnlock = state.decks.find((d) => d.id === 'secret_lower_deck')?.level === 5;
        break;
      case 'ach_veteran_captain':
        shouldUnlock = state.totalVoyagesCompleted >= 100;
        break;
      default:
        break;
    }
    if (shouldUnlock) {
      ach.unlocked = true;
      ach.unlockedAt = Date.now();
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

/* ====================================================================
   HELPER — Get dynamic prices based on port
   ==================================================================== */

function ssGetDynamicPrices(state: SsGameState): Record<string, number> {
  const rng = ssMulberry32(state.seed + state.totalTradesCompleted + 7);
  const portIndex = SS_PORTS.indexOf(state.currentPort);
  const prices: Record<string, number> = {};
  for (const good of SS_TRADE_GOODS) {
    const portFactor = 1 + (portIndex % 5 - 2) * 0.1;
    const fluctuation = 1 + (rng() - 0.5) * 2 * good.volatility;
    prices[good.id] = Math.max(1, Math.floor(good.basePrice * portFactor * fluctuation));
  }
  return prices;
}

/* ====================================================================
   HELPER — Reduce cooldowns
   ==================================================================== */

function ssTickCooldowns(state: SsGameState): void {
  for (const ability of state.navAbilities) {
    if (ability.currentCooldown > 0) {
      ability.currentCooldown -= 1;
    }
  }
}

/* ====================================================================
   HELPER — Get current title from level
   ==================================================================== */

function ssGetCurrentTitle(state: SsGameState): SsTitle {
  let title = SS_TITLES[0];
  for (const t of SS_TITLES) {
    if (state.level >= t.requiredLevel) {
      title = t;
    }
  }
  return title;
}

/* ====================================================================
   HELPER — Auto-advance title
   ==================================================================== */

function ssAutoAdvanceTitle(state: SsGameState): void {
  const title = ssGetCurrentTitle(state);
  if (title.id !== state.currentTitleId) {
    state.currentTitleId = title.id;
  }
}

/* ====================================================================
   MAIN HOOK — useSteamshipSaga
   ==================================================================== */

export default function useSteamshipSaga(initialSeed?: number): SsSagaAPI {
  const [state, setState] = useState<SsGameState>(() =>
    ssCreateInitialState(initialSeed),
  );

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Recalculate ship stats whenever state changes
  const effectiveStats = useMemo(() => ssRecalcStats(state), [state]);

  // ---- State Accessors ----

  const ssGetState = useCallback(() => state, [state]);

  const ssResetState = useCallback(() => {
    setState(ssCreateInitialState(initialSeed));
  }, [initialSeed]);

  const ssGetLevel = useCallback(() => state.level, [state]);

  const ssGetXP = useCallback(() => state.xp, [state]);

  const ssGetTotalXP = useCallback(() => state.totalXp, [state]);

  const ssGetCoins = useCallback(() => state.coins, [state]);

  const ssGetTitle = useCallback((): SsTitle => {
    return ssGetCurrentTitle(state);
  }, [state]);

  const ssGetProgress = useCallback(() => ssXPProgress(state.xp), [state]);

  const ssGetShipName = useCallback(() => state.shipName, [state]);

  const ssGetShipStats = useCallback(() => effectiveStats, [effectiveStats]);

  const ssGetHullIntegrity = useCallback(() => state.hullIntegrity, [state]);

  const ssGetFuel = useCallback(() => state.fuel, [state]);

  const ssGetMaxFuel = useCallback(() => state.maxFuel, [state]);

  // ---- Decks ----

  const ssGetDeck = useCallback(
    (deckId: SsDeckId): SsShipDeck | null => {
      return state.decks.find((d) => d.id === deckId) ?? null;
    },
    [state],
  );

  const ssGetAllDecks = useCallback(() => state.decks, [state]);

  const ssUpgradeDeck = useCallback(
    (deckId: SsDeckId): boolean => {
      const deck = state.decks.find((d) => d.id === deckId);
      if (!deck) return false;
      if (deck.level >= deck.maxLevel) return false;
      const cost = Math.floor(deck.upgradeCost * deck.level * 0.8);
      if (state.coins < cost) return false;
      setState((prev) => {
        const newDecks = prev.decks.map((d) =>
          d.id === deckId ? { ...d, level: d.level + 1 } : d,
        );
        const newState = { ...prev, decks: newDecks, coins: prev.coins - cost };
        newState.shipStats = ssRecalcStats(newState);
        newState.maxFuel = Math.floor(100 + (newState.shipStats.fuelEfficiency - 1) * 50);
        ssCheckAchievementConditions(newState);
        return newState;
      });
      return true;
    },
    [state],
  );

  // ---- Crew ----

  const ssGetCrew = useCallback(() => state.crew, [state]);

  const ssGetCrewMemberInfo = useCallback(
    (ownedCrew: SsOwnedCrew): SsCrewMember | null => {
      return SS_CREW_MEMBERS.find((m) => m.id === ownedCrew.memberId) ?? null;
    },
    [],
  );

  const ssGetAvailableCrew = useCallback(
    (): SsCrewMember[] => {
      const ownedIds = new Set(state.crew.map((c) => c.memberId));
      return SS_CREW_MEMBERS.filter((m) => !ownedIds.has(m.id));
    },
    [state],
  );

  const ssHireCrew = useCallback(
    (memberId: string): boolean => {
      const member = SS_CREW_MEMBERS.find((m) => m.id === memberId);
      if (!member) return false;
      if (state.coins < member.hireCost) return false;
      if (state.crew.length >= effectiveStats.crewCapacity) return false;
      setState((prev) => {
        const newCrew: SsOwnedCrew = {
          memberId,
          morale: 80,
          health: 100,
          experience: 0,
          assignedDeck: member.deck,
        };
        const newState = {
          ...prev,
          crew: [...prev.crew, newCrew],
          coins: prev.coins - member.hireCost,
          totalCrewHired: prev.totalCrewHired + 1,
        };
        newState.shipStats = ssRecalcStats(newState);
        ssCheckAchievementConditions(newState);
        return newState;
      });
      return true;
    },
    [state, effectiveStats],
  );

  const ssDismissCrew = useCallback(
    (index: number): boolean => {
      if (index < 0 || index >= state.crew.length) return false;
      setState((prev) => ({
        ...prev,
        crew: prev.crew.filter((_, i) => i !== index),
      }));
      return true;
    },
    [state],
  );

  const ssAssignCrew = useCallback(
    (index: number, deckId: SsDeckId): boolean => {
      if (index < 0 || index >= state.crew.length) return false;
      const deckExists = state.decks.some((d) => d.id === deckId);
      if (!deckExists) return false;
      setState((prev) => {
        const newCrew = prev.crew.map((c, i) =>
          i === index ? { ...c, assignedDeck: deckId } : c,
        );
        const newState = { ...prev, crew: newCrew };
        newState.shipStats = ssRecalcStats(newState);
        return newState;
      });
      return true;
    },
    [state],
  );

  const ssRestCrew = useCallback(
    (index: number): void => {
      if (index < 0 || index >= state.crew.length) return;
      const cost = 20;
      if (state.coins < cost) return;
      setState((prev) => {
        const newCrew = prev.crew.map((c, i) =>
          i === index
            ? { ...c, morale: Math.min(100, c.morale + 30), health: Math.min(100, c.health + 20) }
            : c,
        );
        return { ...prev, crew: newCrew, coins: prev.coins - cost };
      });
    },
    [state],
  );

  const ssGetCrewOnDeck = useCallback(
    (deckId: SsDeckId): SsOwnedCrew[] => {
      return state.crew.filter((c) => c.assignedDeck === deckId);
    },
    [state],
  );

  // ---- Trade ----

  const ssGetTradeGoods = useCallback(() => [...SS_TRADE_GOODS], []);

  const ssGetInventory = useCallback(() => state.inventory, [state]);

  const ssGetPrices = useCallback(
    () => ssGetDynamicPrices(state),
    [state],
  );

  const ssBuyGood = useCallback(
    (goodId: string, quantity: number): boolean => {
      const good = SS_TRADE_GOODS.find((g) => g.id === goodId);
      if (!good) return false;
      const prices = ssGetDynamicPrices(state);
      const totalCost = prices[goodId] * quantity;
      if (state.coins < totalCost) return false;
      // Check cargo space
      const currentCargo = state.inventory.reduce((sum, item) => sum + item.quantity, 0);
      if (currentCargo + quantity > effectiveStats.cargoCapacity) return false;
      setState((prev) => {
        const existing = prev.inventory.find((item) => item.goodId === goodId);
        let newInventory: SsOwnedGood[];
        if (existing) {
          newInventory = prev.inventory.map((item) =>
            item.goodId === goodId
              ? { ...item, quantity: item.quantity + quantity, purchasePrice: prices[goodId] }
              : item,
          );
        } else {
          newInventory = [
            ...prev.inventory,
            { goodId, quantity, purchasePrice: prices[goodId] },
          ];
        }
        return { ...prev, coins: prev.coins - totalCost, inventory: newInventory };
      });
      return true;
    },
    [state, effectiveStats],
  );

  const ssSellGood = useCallback(
    (goodId: string, quantity: number): number => {
      const existing = state.inventory.find((item) => item.goodId === goodId);
      if (!existing) return 0;
      const sellQty = Math.min(quantity, existing.quantity);
      const prices = ssGetDynamicPrices(state);
      const sellPrice = Math.floor(prices[goodId] * 0.9); // 10% commission
      const totalRevenue = sellPrice * sellQty;
      setState((prev) => {
        let newInventory: SsOwnedGood[];
        if (existing.quantity <= sellQty) {
          newInventory = prev.inventory.filter((item) => item.goodId !== goodId);
        } else {
          newInventory = prev.inventory.map((item) =>
            item.goodId === goodId
              ? { ...item, quantity: item.quantity - sellQty }
              : item,
          );
        }
        const newState = {
          ...prev,
          coins: prev.coins + totalRevenue,
          inventory: newInventory,
          totalTradesCompleted: prev.totalTradesCompleted + 1,
        };
        ssCheckAchievementConditions(newState);
        return newState;
      });
      return totalRevenue;
    },
    [state],
  );

  const ssGetTradeRoutes = useCallback(() => [...SS_TRADE_ROUTES], []);

  // ---- Upgrades ----

  const ssGetUpgrades = useCallback(() => [...SS_SHIP_UPGRADES], []);

  const ssGetOwnedUpgrades = useCallback(() => state.upgrades, [state]);

  const ssPurchaseUpgrade = useCallback(
    (upgradeId: string): boolean => {
      const upgrade = SS_SHIP_UPGRADES.find((u) => u.id === upgradeId);
      if (!upgrade) return false;
      const alreadyOwned = state.upgrades.some((o) => o.upgradeId === upgradeId);
      if (alreadyOwned) return false;
      if (state.coins < upgrade.cost) return false;
      setState((prev) => {
        const newUpgrades = [...prev.upgrades, { upgradeId, level: 1 }];
        const newState = { ...prev, upgrades: newUpgrades, coins: prev.coins - upgrade.cost };
        newState.shipStats = ssRecalcStats(newState);
        newState.maxFuel = Math.floor(100 + (newState.shipStats.fuelEfficiency - 1) * 50);
        return newState;
      });
      return true;
    },
    [state],
  );

  const ssUpgradeLevel = useCallback(
    (upgradeId: string): boolean => {
      const upgrade = SS_SHIP_UPGRADES.find((u) => u.id === upgradeId);
      const owned = state.upgrades.find((o) => o.upgradeId === upgradeId);
      if (!upgrade || !owned) return false;
      if (owned.level >= upgrade.maxLevel) return false;
      const cost = Math.floor(upgrade.cost * owned.level * 0.6);
      if (state.coins < cost) return false;
      setState((prev) => {
        const newUpgrades = prev.upgrades.map((o) =>
          o.upgradeId === upgradeId ? { ...o, level: o.level + 1 } : o,
        );
        const newState = { ...prev, upgrades: newUpgrades, coins: prev.coins - cost };
        newState.shipStats = ssRecalcStats(newState);
        ssCheckAchievementConditions(newState);
        return newState;
      });
      return true;
    },
    [state],
  );

  // ---- Navigation Abilities ----

  const ssGetNavAbilities = useCallback(() => state.navAbilities, [state]);

  const ssUseNavAbility = useCallback(
    (abilityId: string): boolean => {
      const ability = state.navAbilities.find((a) => a.id === abilityId);
      if (!ability) return false;
      if (ability.currentCooldown > 0) return false;
      if (ability.unlockLevel > state.level) return false;
      setState((prev) => {
        const newAbilities = prev.navAbilities.map((a) =>
          a.id === abilityId ? { ...a, currentCooldown: a.cooldown } : a,
        );
        return { ...prev, navAbilities: newAbilities };
      });
      return true;
    },
    [state],
  );

  const ssUnlockNavAbility = useCallback(
    (abilityId: string): boolean => {
      const template = SS_NAV_ABILITY_TEMPLATES.find((a) => a.id === abilityId);
      if (!template) return false;
      if (template.unlockLevel > state.level) return false;
      if (state.coins < template.cost) return false;
      setState((prev) => {
        const alreadyUnlocked = prev.navAbilities.some(
          (a) => a.id === abilityId && a.unlockLevel <= prev.level,
        );
        if (alreadyUnlocked) return prev;
        return { ...prev, coins: prev.coins - template.cost };
      });
      return true;
    },
    [state],
  );

  // ---- Voyage ----

  const ssStartVoyage = useCallback(
    (destination: string): boolean => {
      if (state.sailing) return false;
      if (state.fuel < 20) return false;
      if (!SS_PORTS.includes(destination)) return false;
      if (destination === state.currentPort) return false;
      const route = SS_TRADE_ROUTES.find(
        (r) =>
          (r.from === state.currentPort && r.to === destination) ||
          (r.to === state.currentPort && r.from === destination),
      );
      const distance = route?.distance ?? 1000;
      setState((prev) => ({
        ...prev,
        sailing: true,
        currentDestination: destination,
        navigationLog: [
          {
            id: `nav_${prev.seed}_${Date.now()}`,
            timestamp: Date.now(),
            event: 'voyage_start',
            details: `Set sail from ${prev.currentPort} to ${destination} (${distance} nautical miles)`,
          },
          ...prev.navigationLog,
        ],
      }));
      return true;
    },
    [state],
  );

  const ssAdvanceVoyage = useCallback((): SsNavigationLog[] => {
    if (!state.sailing) return [];
    const rng = ssMulberry32(state.seed + state.totalDistanceTraveled + 13);
    const newLogs: SsNavigationLog[] = [];

    setState((prev) => {
      const distStep = 100 + Math.floor(rng() * effectiveStats.speed * 20);
      const fuelCost = Math.max(1, Math.floor(distStep / effectiveStats.fuelEfficiency / 20));
      const newFuel = Math.max(0, prev.fuel - fuelCost);
      const newDistance = prev.totalDistanceTraveled + distStep;

      // Check for events
      const stormChance = 0.15 + rng() * 0.1;
      const pirateChance = 0.12 + rng() * 0.08;
      const roll = rng();
      let hullDamage = 0;
      let coinsGained = 0;
      let xpGained = 0;
      let stormWeathered = prev.stormsWeathered;
      let piratesDefeated = prev.piratesDefeated;
      let piratesEncountered = prev.piratesEncountered;

      if (roll < stormChance) {
        // Storm event
        const eligible = SS_STORM_EVENTS.filter((s) => s.minLevel <= prev.level);
        if (eligible.length > 0) {
          const storm = eligible[Math.floor(rng() * eligible.length)];
          const dmg =
            storm.damageRange[0] +
            Math.floor(rng() * (storm.damageRange[1] - storm.damageRange[0]));
          const def = Math.floor(prev.shipStats.hull * 0.1);
          hullDamage = Math.max(0, dmg - def);
          coinsGained +=
            storm.rewardCoins[0] +
            Math.floor(rng() * (storm.rewardCoins[1] - storm.rewardCoins[0]));
          xpGained +=
            storm.rewardXP[0] +
            Math.floor(rng() * (storm.rewardXP[1] - storm.rewardXP[0]));
          stormWeathered += 1;
          newLogs.push({
            id: `storm_${prev.seed}_${Date.now()}`,
            timestamp: Date.now(),
            event: 'storm',
            details: `${storm.name}: Took ${hullDamage} hull damage, gained ${coinsGained} coins and ${xpGained} XP`,
          });
        }
      } else if (roll < stormChance + pirateChance) {
        // Pirate event
        const eligible = SS_PIRATE_ENCOUNTERS.filter((p) => p.minLevel <= prev.level);
        if (eligible.length > 0) {
          const pirate = eligible[Math.floor(rng() * eligible.length)];
          const dmg =
            pirate.damageRange[0] +
            Math.floor(rng() * (pirate.damageRange[1] - pirate.damageRange[0]));
          const def = Math.floor(prev.shipStats.hull * 0.08 + prev.shipStats.firepower * 0.5);
          hullDamage = Math.max(0, dmg - def);
          piratesEncountered += 1;
          if (hullDamage < dmg * 0.5) {
            piratesDefeated += 1;
            coinsGained +=
              pirate.lootCoins[0] +
              Math.floor(rng() * (pirate.lootCoins[1] - pirate.lootCoins[0]));
            xpGained +=
              pirate.lootXP[0] +
              Math.floor(rng() * (pirate.lootXP[1] - pirate.lootXP[0]));
            newLogs.push({
              id: `pirate_win_${prev.seed}_${Date.now()}`,
              timestamp: Date.now(),
              event: 'pirate_defeated',
              details: `${pirate.name}: Defeated! Gained ${coinsGained} coins and ${xpGained} XP`,
            });
          } else {
            newLogs.push({
              id: `pirate_dmg_${prev.seed}_${Date.now()}`,
              timestamp: Date.now(),
              event: 'pirate_damage',
              details: `${pirate.name}: Took ${hullDamage} damage before escaping`,
            });
          }
        }
      }

      // Gain crew experience
      const newCrew = prev.crew.map((c) => ({
        ...c,
        experience: c.experience + 1,
      }));

      // Level up XP
      let newXp = prev.xp + xpGained + 5;
      let newLevel = ssLevelFromXP(newXp);
      if (newLevel > prev.level) {
        newXp = newXp; // keep surplus
        ssAutoAdvanceTitle({ ...prev, level: newLevel, xp: newXp });
      }

      const newState: SsGameState = {
        ...prev,
        fuel: newFuel,
        totalDistanceTraveled: newDistance,
        hullIntegrity: Math.max(0, prev.hullIntegrity - hullDamage),
        coins: prev.coins + coinsGained,
        xp: newXp,
        totalXp: prev.totalXp + xpGained + 5,
        level: newLevel,
        crew: newCrew,
        stormsWeathered: stormWeathered,
        piratesDefeated: piratesDefeated,
        piratesEncountered: piratesEncountered,
        navigationLog: [...newLogs, ...prev.navigationLog],
      };

      newState.shipStats = ssRecalcStats(newState);
      ssCheckAchievementConditions(newState);
      ssTickCooldowns(newState);

      return newState;
    });

    return newLogs;
  }, [state, effectiveStats]);

  const ssCompleteVoyage = useCallback((): { coins: number; xp: number } => {
    if (!state.sailing || !state.currentDestination) {
      return { coins: 0, xp: 0 };
    }
    const route = SS_TRADE_ROUTES.find(
      (r) =>
        (r.from === state.currentPort && r.to === state.currentDestination) ||
        (r.to === state.currentPort && r.from === state.currentDestination),
    );
    const rewardMultiplier = route?.rewardMultiplier ?? 1.0;
    const bonusCoins = Math.floor(100 * rewardMultiplier);
    const bonusXP = Math.floor(50 * rewardMultiplier);

    setState((prev) => {
      const newState = {
        ...prev,
        sailing: false,
        currentPort: prev.currentDestination ?? prev.currentPort,
        currentDestination: null,
        coins: prev.coins + bonusCoins,
        xp: prev.xp + bonusXP,
        totalXp: prev.totalXp + bonusXP,
        level: ssLevelFromXP(prev.xp + bonusXP),
        totalVoyagesCompleted: prev.totalVoyagesCompleted + 1,
        navigationLog: [
          {
            id: `arrive_${prev.seed}_${Date.now()}`,
            timestamp: Date.now(),
            event: 'voyage_complete',
            details: `Arrived at ${prev.currentDestination}. Bonus: ${bonusCoins} coins, ${bonusXP} XP`,
          },
          ...prev.navigationLog,
        ],
      };
      newState.shipStats = ssRecalcStats(newState);
      ssAutoAdvanceTitle(newState);
      ssCheckAchievementConditions(newState);
      return newState;
    });

    return { coins: bonusCoins, xp: bonusXP };
  }, [state]);

  // ---- Storm / Pirate Standalone ----

  const ssGetStormEvents = useCallback(() => [...SS_STORM_EVENTS], []);

  const ssWeatherStorm = useCallback(
    (): { survived: boolean; damage: number; reward: number } => {
      const rng = ssMulberry32(state.seed + state.stormsWeathered + 99);
      const eligible = SS_STORM_EVENTS.filter((s) => s.minLevel <= state.level);
      if (eligible.length === 0) {
        return { survived: true, damage: 0, reward: 0 };
      }
      const storm = eligible[Math.floor(rng() * eligible.length)];
      const dmg =
        storm.damageRange[0] +
        Math.floor(rng() * (storm.damageRange[1] - storm.damageRange[0]));
      const def = Math.floor(effectiveStats.hull * 0.15);
      const finalDamage = Math.max(0, dmg - def);
      const reward =
        storm.rewardCoins[0] +
        Math.floor(rng() * (storm.rewardCoins[1] - storm.rewardCoins[0]));
      const xpReward =
        storm.rewardXP[0] +
        Math.floor(rng() * (storm.rewardXP[1] - storm.rewardXP[0]));
      const survived = state.hullIntegrity - finalDamage > 0;

      setState((prev) => {
        if (!survived) return prev;
        const newState = {
          ...prev,
          hullIntegrity: Math.max(0, prev.hullIntegrity - finalDamage),
          coins: prev.coins + reward,
          xp: prev.xp + xpReward,
          totalXp: prev.totalXp + xpReward,
          level: ssLevelFromXP(prev.xp + xpReward),
          stormsWeathered: prev.stormsWeathered + 1,
        };
        newState.shipStats = ssRecalcStats(newState);
        ssAutoAdvanceTitle(newState);
        ssCheckAchievementConditions(newState);
        return newState;
      });

      return { survived, damage: finalDamage, reward };
    },
    [state, effectiveStats],
  );

  const ssGetPirateEncounters = useCallback(() => [...SS_PIRATE_ENCOUNTERS], []);

  const ssEncounterPirate = useCallback(
    (): { defeated: boolean; damage: number; loot: number } => {
      const rng = ssMulberry32(state.seed + state.piratesEncountered + 77);
      const eligible = SS_PIRATE_ENCOUNTERS.filter((p) => p.minLevel <= state.level);
      if (eligible.length === 0) {
        return { defeated: false, damage: 0, loot: 0 };
      }
      const pirate = eligible[Math.floor(rng() * eligible.length)];
      const dmg =
        pirate.damageRange[0] +
        Math.floor(rng() * (pirate.damageRange[1] - pirate.damageRange[0]));
      const def = Math.floor(effectiveStats.hull * 0.1 + effectiveStats.firepower * 0.8);
      const finalDamage = Math.max(0, dmg - def);
      const loot =
        pirate.lootCoins[0] +
        Math.floor(rng() * (pirate.lootCoins[1] - pirate.lootCoins[0]));
      const xpLoot =
        pirate.lootXP[0] +
        Math.floor(rng() * (pirate.lootXP[1] - pirate.lootXP[0]));
      const defeated = finalDamage < dmg * 0.5;

      setState((prev) => {
        const newState = {
          ...prev,
          hullIntegrity: Math.max(0, prev.hullIntegrity - finalDamage),
          piratesEncountered: prev.piratesEncountered + 1,
          piratesDefeated: defeated ? prev.piratesDefeated + 1 : prev.piratesDefeated,
          coins: defeated ? prev.coins + loot : prev.coins,
          xp: defeated ? prev.xp + xpLoot : prev.xp,
          totalXp: defeated ? prev.totalXp + xpLoot : prev.totalXp,
          level: ssLevelFromXP(defeated ? prev.xp + xpLoot : prev.xp),
        };
        newState.shipStats = ssRecalcStats(newState);
        ssAutoAdvanceTitle(newState);
        ssCheckAchievementConditions(newState);
        return newState;
      });

      return { defeated, damage: finalDamage, loot: defeated ? loot : 0 };
    },
    [state, effectiveStats],
  );

  // ---- Ship Maintenance ----

  const ssRepairShip = useCallback((): boolean => {
    if (state.hullIntegrity >= 100) return false;
    const missing = 100 - state.hullIntegrity;
    const cost = Math.max(1, Math.floor(missing * 3));
    if (state.coins < cost) return false;
    setState((prev) => ({
      ...prev,
      hullIntegrity: 100,
      coins: prev.coins - cost,
    }));
    return true;
  }, [state]);

  const ssRefuelShip = useCallback((): boolean => {
    if (state.fuel >= state.maxFuel) return false;
    const missing = state.maxFuel - state.fuel;
    const cost = Math.max(1, Math.floor(missing * 1.5));
    if (state.coins < cost) return false;
    setState((prev) => ({
      ...prev,
      fuel: prev.maxFuel,
      coins: prev.coins - cost,
    }));
    return true;
  }, [state]);

  // ---- XP & Coins ----

  const ssAddXP = useCallback(
    (amount: number): number => {
      setState((prev) => {
        const newXp = prev.xp + amount;
        const newLevel = Math.min(SS_MAX_LEVEL, ssLevelFromXP(newXp));
        const newState = {
          ...prev,
          xp: newXp,
          totalXp: prev.totalXp + amount,
          level: newLevel,
        };
        newState.shipStats = ssRecalcStats(newState);
        ssAutoAdvanceTitle(newState);
        ssCheckAchievementConditions(newState);
        return newState;
      });
      return state.xp + amount;
    },
    [state],
  );

  const ssAddCoins = useCallback(
    (amount: number): void => {
      setState((prev) => {
        const newState = { ...prev, coins: prev.coins + amount };
        ssCheckAchievementConditions(newState);
        return newState;
      });
    },
    [],
  );

  const ssSpendCoins = useCallback(
    (amount: number): boolean => {
      if (state.coins < amount) return false;
      setState((prev) => ({ ...prev, coins: prev.coins - amount }));
      return true;
    },
    [state],
  );

  // ---- Achievements ----

  const ssCheckAchievements = useCallback((): string[] => {
    const current = stateRef.current;
    return ssCheckAchievementConditions(current);
  }, []);

  const ssGetAchievements = useCallback(() => state.achievements, [state]);

  const ssGetTitles = useCallback(() => [...SS_TITLES], []);

  // ---- Daily Voyage ----

  const ssGetDailyVoyage = useCallback(() => state.dailyVoyage, [state]);

  const ssCompleteDailyVoyage = useCallback((): boolean => {
    if (!state.dailyVoyage || state.dailyVoyage.completed) return false;
    setState((prev) => {
      if (!prev.dailyVoyage || prev.dailyVoyage.completed) return prev;
      return {
        ...prev,
        coins: prev.coins + prev.dailyVoyage.rewardCoins,
        xp: prev.xp + prev.dailyVoyage.rewardXP,
        totalXp: prev.totalXp + prev.dailyVoyage.rewardXP,
        level: ssLevelFromXP(prev.xp + prev.dailyVoyage.rewardXP),
        dailyVoyage: { ...prev.dailyVoyage, completed: true },
        dailyVoyagesCompleted: prev.dailyVoyagesCompleted + 1,
      };
    });
    return true;
  }, [state]);

  // ---- Navigation Log ----

  const ssGetNavigationLog = useCallback(() => state.navigationLog, [state]);

  // ---- Summary ----

  const ssGetSummary = useCallback(() => {
    const title = ssGetCurrentTitle(state);
    return {
      level: state.level,
      title: `${title.emoji} ${title.name}`,
      coins: state.coins,
      crewCount: state.crew.length,
      voyagesCompleted: state.totalVoyagesCompleted,
      stormsWeathered: state.stormsWeathered,
      piratesDefeated: state.piratesDefeated,
    };
  }, [state]);

  return {
    ssGetState,
    ssResetState,
    ssGetLevel,
    ssGetXP,
    ssGetTotalXP,
    ssGetCoins,
    ssGetTitle,
    ssGetProgress,
    ssGetShipName,
    ssGetShipStats,
    ssGetHullIntegrity,
    ssGetFuel,
    ssGetMaxFuel,
    ssGetDeck,
    ssGetAllDecks,
    ssUpgradeDeck,
    ssGetCrew,
    ssGetCrewMemberInfo,
    ssGetAvailableCrew,
    ssHireCrew,
    ssDismissCrew,
    ssAssignCrew,
    ssRestCrew,
    ssGetCrewOnDeck,
    ssGetTradeGoods,
    ssGetInventory,
    ssGetPrices,
    ssBuyGood,
    ssSellGood,
    ssGetTradeRoutes,
    ssGetUpgrades,
    ssGetOwnedUpgrades,
    ssPurchaseUpgrade,
    ssUpgradeLevel,
    ssGetNavAbilities,
    ssUseNavAbility,
    ssUnlockNavAbility,
    ssStartVoyage,
    ssAdvanceVoyage,
    ssCompleteVoyage,
    ssGetStormEvents,
    ssWeatherStorm,
    ssGetPirateEncounters,
    ssEncounterPirate,
    ssRepairShip,
    ssRefuelShip,
    ssAddXP,
    ssAddCoins,
    ssSpendCoins,
    ssCheckAchievements,
    ssGetAchievements,
    ssGetTitles,
    ssGetDailyVoyage,
    ssCompleteDailyVoyage,
    ssGetNavigationLog,
    ssGetSummary,
  };
}
