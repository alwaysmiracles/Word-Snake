'use client';

import { useState, useCallback, useRef } from 'react';

/* ====================================================================
   TYPES
   ==================================================================== */

export interface PiShipStats {
  hull: number;
  speed: number;
  firepower: number;
  crewCapacity: number;
  cargoCapacity: number;
}

export interface PiShipType {
  id: string;
  name: string;
  description: string;
  tier: number;
  stats: PiShipStats;
  baseCost: number;
}

export interface PiOwnedShip {
  typeId: string;
  level: number;
  currentHull: number;
}

export interface PiCrewRole {
  id: string;
  name: string;
  role: string;
  skills: Record<string, number>;
  hireCost: number;
  dailyWage: number;
  description: string;
}

export interface PiOwnedCrew {
  roleId: string;
  morale: number;
  experience: number;
  health: number;
}

export interface PiIsland {
  id: string;
  name: string;
  biome: string;
  resources: string[];
  dangerLevel: number;
  description: string;
  connections: string[];
}

export interface PiTradeGoodType {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  volatility: number;
  description: string;
}

export interface PiOwnedGood {
  goodId: string;
  quantity: number;
  purchasePrice: number;
}

export interface PiPort {
  id: string;
  name: string;
  islandId: string;
  goodsAvailable: string[];
  services: string[];
  description: string;
}

export interface PiLootTable {
  coins: [number, number];
  xp: [number, number];
  goods: { goodId: string; chance: number; quantity: [number, number] }[];
}

export interface PiEnemyType {
  id: string;
  name: string;
  shipClass: string;
  stats: PiShipStats;
  loot: PiLootTable;
  minLevel: number;
  description: string;
}

export interface PiSkillType {
  id: string;
  name: string;
  description: string;
  category: string;
  maxLevel: number;
  trainCost: number;
}

export interface PiOwnedSkill {
  skillId: string;
  level: number;
  xp: number;
}

export interface PiQuestType {
  id: string;
  name: string;
  description: string;
  type: 'combat' | 'explore' | 'trade' | 'fetch' | 'crew';
  target: string;
  targetCount: number;
  rewardCoins: number;
  rewardXP: number;
  rewardRep: number;
  minLevel: number;
  npcId: string;
}

export interface PiEquipmentType {
  id: string;
  name: string;
  slot: 'weapon' | 'armor' | 'accessory' | 'tool';
  stats: Partial<PiShipStats> & { luck?: number; charisma?: number };
  cost: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
}

export interface PiNpcType {
  id: string;
  name: string;
  role: string;
  islandId: string;
  dialogue: string[];
  questIds: string[];
  description: string;
}

export interface PiAchievementType {
  id: string;
  name: string;
  description: string;
  rewardCoins: number;
  rewardXP: number;
}

export interface PiTitleEntry {
  name: string;
  threshold: number;
}

export interface PiTreasureMap {
  id: string;
  islandId: string;
  clue: string;
  difficulty: number;
}

export interface PiBattleState {
  enemyId: string;
  enemyHull: number;
  playerHull: number;
  maxEnemyHull: number;
  maxPlayerHull: number;
  turn: number;
  result: 'active' | 'won' | 'lost' | 'fled' | null;
}

export interface PiDailyTask {
  type: 'combat' | 'trade' | 'explore' | 'crew';
  target: number;
  progress: number;
  rewardCoins: number;
  rewardXP: number;
  claimed: boolean;
  description: string;
}

export interface PiBattleResult {
  action: 'attack' | 'defend' | 'flee';
  playerDamage: number;
  enemyDamage: number;
  playerHull: number;
  enemyHull: number;
  result: 'active' | 'won' | 'lost' | 'fled';
  rewards?: { coins: number; xp: number };
}

export interface PiExploreResult {
  events: string[];
  coins: number;
  xp: number;
  mapsFound: PiTreasureMap[];
  message: string;
}

export interface PiDigResult {
  success: boolean;
  coins: number;
  xp: number;
  equipment?: string;
  message: string;
}

export interface PiDailyRewardResult {
  success: boolean;
  coins: number;
  xp: number;
  message: string;
}

export interface PiGameSummary {
  level: number;
  title: string;
  coins: number;
  reputation: number;
  shipName: string;
  crewCount: number;
  islandsDiscovered: number;
  enemiesDefeated: number;
  day: number;
}

export interface PiGameState {
  seed: number;
  rngState: number;
  player: {
    level: number;
    xp: number;
    coins: number;
    reputation: number;
    currentIslandId: string;
    currentShipIndex: number;
  };
  ships: PiOwnedShip[];
  crew: PiOwnedCrew[];
  inventory: PiOwnedGood[];
  treasureMaps: PiTreasureMap[];
  activeMapIndex: number;
  skills: PiOwnedSkill[];
  activeQuests: string[];
  completedQuests: string[];
  equipped: Record<string, string | null>;
  ownedEquipment: string[];
  achievements: string[];
  dailyTask: PiDailyTask | null;
  battle: PiBattleState | null;
  discoveredIslands: string[];
  kills: Record<string, number>;
  totalTrades: number;
  totalTreasuresFound: number;
  totalEnemiesDefeated: number;
  day: number;
  totalCrewHired: number;
  explorationCount: number;
}

export interface PiBayAPI {
  piGetState: () => PiGameState;
  piResetState: () => void;
  piGetLevel: () => number;
  piGetTitle: () => string;
  piGetProgress: () => number;
  piAddXP: (amount: number) => number;
  piGetCoins: () => number;
  piAddCoins: (amount: number) => void;
  piSpendCoins: (amount: number) => boolean;
  piGetReputation: () => number;
  piAddReputation: (amount: number) => void;
  piGetShips: () => PiOwnedShip[];
  piBuyShip: (shipId: string) => boolean;
  piGetActiveShip: () => (PiOwnedShip & { type: PiShipType }) | null;
  piUpgradeShip: () => boolean;
  piGetShipStats: () => PiShipStats | null;
  piGetShipCapacity: () => { crew: number; cargo: number } | null;
  piRepairShip: () => boolean;
  piGetCrew: () => PiOwnedCrew[];
  piHireCrew: (crewId: string) => boolean;
  piDismissCrew: (index: number) => boolean;
  piGetCrewStats: () => Record<string, number>;
  piGetActiveCrew: () => PiOwnedCrew[];
  piGetAvailableCrew: () => PiCrewRole[];
  piGetCrewMorale: () => number;
  piRestCrew: () => void;
  piGetIslands: () => PiIsland[];
  piSailToIsland: (islandId: string) => boolean;
  piExploreIsland: () => PiExploreResult;
  piGetDiscoveredIslands: () => string[];
  piGetTreasureMaps: () => PiTreasureMap[];
  piFollowMap: (mapIndex: number) => boolean;
  piDigTreasure: () => PiDigResult;
  piSellMap: (mapIndex: number) => number;
  piGetTradeGoods: () => PiTradeGoodType[];
  piBuyGood: (goodId: string, quantity: number) => boolean;
  piSellGood: (goodId: string, quantity: number) => number;
  piGetPrices: () => Record<string, number>;
  piGetInventory: () => PiOwnedGood[];
  piGetNavalBattle: (enemyId?: string) => PiBattleResult;
  piAttack: () => PiBattleResult;
  piDefend: () => PiBattleResult;
  piFlee: () => PiBattleResult;
  piGetEnemyForLevel: () => PiEnemyType;
  piCalculateDamage: (firepower: number, defense: number) => number;
  piGetSkills: () => PiOwnedSkill[];
  piTrainSkill: (skillId: string) => boolean;
  piGetQuests: () => { available: PiQuestType[]; active: PiQuestType[]; completed: string[] };
  piAcceptQuest: (questId: string) => boolean;
  piCompleteQuest: (questId: string) => boolean;
  piGetCompletedQuests: () => string[];
  piGetEquipment: () => PiEquipmentType[];
  piBuyEquipment: (equipId: string) => boolean;
  piEquipItem: (equipId: string) => boolean;
  piGetOwnedEquipment: () => string[];
  piGetEquippedItems: () => Record<string, string | null>;
  piGetAchievements: () => PiAchievementType[];
  piCheckAchievements: () => string[];
  piGetDailyTask: () => PiDailyTask | null;
  piClaimDailyReward: () => PiDailyRewardResult;
  piAdvanceDay: () => void;
  piGetPortInfo: () => PiPort | null;
  piGetGameStateSummary: () => PiGameSummary;
}

/* ====================================================================
   SEEDED PRNG — mulberry32 (SSR-safe, no Math.random)
   ==================================================================== */

function piCreateRNG(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function piNextRandom(state: PiGameState): number {
  const s = state.rngState;
  state.rngState = (s + 0x6D2B79F5) | 0;
  let t = Math.imul(state.rngState ^ (state.rngState >>> 15), 1 | state.rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function piDeterministicHash(a: number, b: number, c: number): number {
  const x = Math.sin(a * 12.9898 + b * 78.233 + c * 45.164) * 43758.5453;
  return x - Math.floor(x);
}

/* ====================================================================
   XP / LEVEL HELPERS
   ==================================================================== */

function piXPForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.5) + 25 * level);
}

function piLevelFromXP(xp: number): number {
  let level = 1;
  let needed = piXPForLevel(level);
  while (xp >= needed && level < PI_MAX_LEVEL) {
    xp -= needed;
    level++;
    needed = piXPForLevel(level);
  }
  return level;
}

function piXPProgress(xp: number): number {
  const level = piLevelFromXP(xp);
  if (level >= PI_MAX_LEVEL) return 1;
  let totalUsed = 0;
  for (let i = 1; i < level; i++) totalUsed += piXPForLevel(i);
  const currentLevelXP = xp - totalUsed;
  return Math.min(1, currentLevelXP / piXPForLevel(level));
}

/* ====================================================================
   CONSTANTS
   ==================================================================== */

export const PI_MAX_LEVEL: number = 50;

export const PI_SHIPS: readonly PiShipType[] = [
  { id: 'sloop', name: 'Sloop', description: 'A nimble single-masted vessel perfect for beginners.', tier: 1,
    stats: { hull: 50, speed: 7, firepower: 2, crewCapacity: 5, cargoCapacity: 20 }, baseCost: 0 },
  { id: 'cutter', name: 'Cutter', description: 'Fast and maneuverable coastal patrol craft.', tier: 2,
    stats: { hull: 70, speed: 8, firepower: 4, crewCapacity: 7, cargoCapacity: 25 }, baseCost: 500 },
  { id: 'brigantine', name: 'Brigantine', description: 'A versatile two-masted ship favored by pirates.', tier: 3,
    stats: { hull: 100, speed: 7, firepower: 7, crewCapacity: 12, cargoCapacity: 40 }, baseCost: 1500 },
  { id: 'caravel', name: 'Caravel', description: 'An explorer\'s vessel built for long ocean voyages.', tier: 4,
    stats: { hull: 120, speed: 8, firepower: 5, crewCapacity: 10, cargoCapacity: 60 }, baseCost: 3000 },
  { id: 'frigate', name: 'Frigate', description: 'A fast warship packing serious firepower.', tier: 5,
    stats: { hull: 160, speed: 6, firepower: 12, crewCapacity: 18, cargoCapacity: 35 }, baseCost: 6000 },
  { id: 'galleon', name: 'Galleon', description: 'A heavy treasure-hauling behemoth of the seas.', tier: 6,
    stats: { hull: 250, speed: 4, firepower: 14, crewCapacity: 25, cargoCapacity: 80 }, baseCost: 12000 },
  { id: 'manowar', name: 'Man o\' War', description: 'The apex predator of naval combat vessels.', tier: 7,
    stats: { hull: 350, speed: 5, firepower: 20, crewCapacity: 35, cargoCapacity: 50 }, baseCost: 25000 },
  { id: 'ironclad', name: 'Ironclad', description: 'A revolutionary steam-powered armored warship.', tier: 8,
    stats: { hull: 450, speed: 6, firepower: 22, crewCapacity: 20, cargoCapacity: 30 }, baseCost: 50000 },
  { id: 'ghost_ship', name: 'Ghost Ship', description: 'A spectral vessel that sails between worlds.', tier: 9,
    stats: { hull: 300, speed: 10, firepower: 18, crewCapacity: 15, cargoCapacity: 45 }, baseCost: 80000 },
  { id: 'krakens_bane', name: 'Kraken\'s Bane', description: 'A legendary ship forged to slay the deep ones.', tier: 10,
    stats: { hull: 500, speed: 8, firepower: 30, crewCapacity: 40, cargoCapacity: 70 }, baseCost: 150000 },
] as const;

export const PI_CREW_ROLES: readonly PiCrewRole[] = [
  { id: 'veteran_captain', name: 'Veteran Captain', role: 'Captain',
    skills: { leadership: 5, navigation: 3, swordsmanship: 4 }, hireCost: 300, dailyWage: 20,
    description: 'A seasoned captain with decades of experience.' },
  { id: 'pirate_captain', name: 'Pirate Captain', role: 'Captain',
    skills: { leadership: 4, intimidation: 5, cannons: 3 }, hireCost: 350, dailyWage: 25,
    description: 'A ruthless pirate who commands through fear and respect.' },
  { id: 'navigator_captain', name: 'Navigator Captain', role: 'Captain',
    skills: { leadership: 3, navigation: 6, cartography: 4 }, hireCost: 280, dailyWage: 22,
    description: 'An expert chart-maker who never loses the way.' },
  { id: 'master_gunner', name: 'Master Gunner', role: 'Combat',
    skills: { cannons: 6, repair: 2, leadership: 2 }, hireCost: 200, dailyWage: 15,
    description: 'Controls the cannon deck with deadly precision.' },
  { id: 'cannoneer', name: 'Cannoneer', role: 'Combat',
    skills: { cannons: 4, strength: 3 }, hireCost: 120, dailyWage: 10,
    description: 'A burly sailor who lives for the boom of cannons.' },
  { id: 'boarding_lead', name: 'Boarding Party Lead', role: 'Combat',
    skills: { swordsmanship: 5, boarding: 6, intimidation: 3 }, hireCost: 180, dailyWage: 14,
    description: 'Leads the charge when ships close for boarding.' },
  { id: 'marine', name: 'Marine', role: 'Combat',
    skills: { swordsmanship: 3, marksmanship: 4, defense: 3 }, hireCost: 100, dailyWage: 8,
    description: 'A disciplined fighter trained in shipboard combat.' },
  { id: 'duelist', name: 'Duelist', role: 'Combat',
    skills: { swordsmanship: 7, agility: 4, intimidation: 2 }, hireCost: 250, dailyWage: 18,
    description: 'A master of one-on-one combat with a blade.' },
  { id: 'navigator', name: 'Navigator', role: 'Navigation',
    skills: { navigation: 5, cartography: 3, survival: 2 }, hireCost: 180, dailyWage: 12,
    description: 'Reads the stars and currents to chart the course.' },
  { id: 'helmsman', name: 'Helmsman', role: 'Navigation',
    skills: { sailing: 5, navigation: 3, agility: 3 }, hireCost: 140, dailyWage: 10,
    description: 'Keeps the ship steady through any storm.' },
  { id: 'lookout', name: 'Lookout', role: 'Navigation',
    skills: { perception: 6, agility: 4, navigation: 2 }, hireCost: 100, dailyWage: 8,
    description: 'Sharp eyes in the crow\'s nest spot danger first.' },
  { id: 'cartographer', name: 'Cartographer', role: 'Navigation',
    skills: { cartography: 7, exploration: 4, navigation: 3 }, hireCost: 220, dailyWage: 16,
    description: 'Maps every coastline and hidden cove discovered.' },
  { id: 'cook', name: 'Ship\'s Cook', role: 'Support',
    skills: { cooking: 6, medicine: 2, morale: 4 }, hireCost: 80, dailyWage: 6,
    description: 'Keeps the crew fed and spirits high with hearty meals.' },
  { id: 'surgeon', name: 'Surgeon', role: 'Support',
    skills: { medicine: 6, cooking: 1, morale: 3 }, hireCost: 200, dailyWage: 14,
    description: 'Mends wounds and prevents disease aboard ship.' },
  { id: 'carpenter', name: 'Carpenter', role: 'Support',
    skills: { repair: 7, carpentry: 5, strength: 2 }, hireCost: 160, dailyWage: 12,
    description: 'Keeps the hull sound and builds anything wooden.' },
  { id: 'boatswain', name: 'Boatswain', role: 'Support',
    skills: { leadership: 3, sailing: 4, repair: 3, strength: 3 }, hireCost: 120, dailyWage: 10,
    description: 'Manages the deck crew and enforces ship discipline.' },
  { id: 'quartermaster', name: 'Quartermaster', role: 'Support',
    skills: { leadership: 4, trading: 3, accounting: 4 }, hireCost: 200, dailyWage: 15,
    description: 'Handles supplies, loot distribution, and crew disputes.' },
  { id: 'treasure_hunter', name: 'Treasure Hunter', role: 'Special',
    skills: { exploration: 6, perception: 4, agility: 3 }, hireCost: 200, dailyWage: 14,
    description: 'Has a nose for buried gold and hidden caches.' },
  { id: 'smuggler', name: 'Smuggler', role: 'Special',
    skills: { smuggling: 6, stealth: 5, trading: 3 }, hireCost: 180, dailyWage: 13,
    description: 'Knows every secret cove and customs blind spot.' },
  { id: 'diplomat', name: 'Diplomat', role: 'Special',
    skills: { negotiation: 6, charisma: 5, languages: 4 }, hireCost: 220, dailyWage: 16,
    description: 'Smooths relations with governors and foreign powers.' },
  { id: 'spy', name: 'Spy', role: 'Special',
    skills: { stealth: 6, perception: 5, charisma: 3 }, hireCost: 240, dailyWage: 17,
    description: 'Gathers intelligence on enemy movements and ports.' },
  { id: 'musician', name: 'Musician', role: 'Special',
    skills: { morale: 7, charisma: 3, entertainment: 5 }, hireCost: 90, dailyWage: 7,
    description: 'Lifts spirits with sea shanties and lively tunes.' },
  { id: 'sea_witch', name: 'Sea Witch', role: 'Rare',
    skills: { magic: 6, medicine: 4, luck: 3 }, hireCost: 400, dailyWage: 30,
    description: 'Commands ocean spirits and brews enchanted remedies.' },
  { id: 'storm_caller', name: 'Storm Caller', role: 'Rare',
    skills: { magic: 5, navigation: 4, sailing: 3 }, hireCost: 380, dailyWage: 28,
    description: 'Summons or banishes storms at will.' },
  { id: 'kraken_hunter', name: 'Kraken Hunter', role: 'Rare',
    skills: { strength: 6, cannons: 5, defense: 4 }, hireCost: 350, dailyWage: 26,
    description: 'Specializes in hunting legendary sea creatures.' },
  { id: 'ghost_whisperer', name: 'Ghost Whisperer', role: 'Rare',
    skills: { magic: 5, perception: 5, luck: 4 }, hireCost: 360, dailyWage: 27,
    description: 'Communicates with drowned spirits for lost knowledge.' },
  { id: 'alchemist', name: 'Alchemist', role: 'Rare',
    skills: { medicine: 5, science: 6, luck: 2 }, hireCost: 320, dailyWage: 24,
    description: 'Brews potions and explosive mixtures for any occasion.' },
  { id: 'engineer', name: 'Engineer', role: 'Rare',
    skills: { repair: 5, science: 6, cannons: 3 }, hireCost: 300, dailyWage: 22,
    description: 'Designs ship improvements and experimental weapons.' },
  { id: 'bard', name: 'Bard', role: 'Rare',
    skills: { charisma: 6, morale: 5, entertainment: 6 }, hireCost: 150, dailyWage: 11,
    description: 'Tales of heroism inspire the crew to greatness.' },
  { id: 'exorcist', name: 'Exorcist', role: 'Rare',
    skills: { magic: 5, defense: 4, luck: 4 }, hireCost: 340, dailyWage: 25,
    description: 'Wards against curses, spirits, and undead sailors.' },
] as const;

export const PI_ISLANDS: readonly PiIsland[] = [
  { id: 'turtle_cove', name: 'Turtle Cove', biome: 'Tropical',
    resources: ['coconuts', 'fish', 'tropical_wood'], dangerLevel: 1,
    description: 'A peaceful sandy beach lined with palm trees.', connections: ['port_royal', 'barbados'] },
  { id: 'port_royal', name: 'Port Royal', biome: 'Colonial',
    resources: ['rum', 'sugar', 'gunpowder'], dangerLevel: 2,
    description: 'The infamous pirate capital of the Caribbean.', connections: ['turtle_cove', 'nassau', 'tortuga'] },
  { id: 'nassau', name: 'Nassau', biome: 'Tropical',
    resources: ['pineapples', 'cotton', 'salt'], dangerLevel: 3,
    description: 'A lawless haven for pirates and privateers.', connections: ['port_royal', 'havana', 'skull_rock'] },
  { id: 'havana', name: 'Havana', biome: 'Colonial',
    resources: ['tobacco', 'sugar', 'gems'], dangerLevel: 4,
    description: 'A wealthy Spanish port with fortified harbor.', connections: ['nassau', 'barbados', 'volcano_isle'] },
  { id: 'barbados', name: 'Barbados', biome: 'Tropical',
    resources: ['sugar', 'rum', 'cotton'], dangerLevel: 2,
    description: 'Lush island plantations producing fine goods.', connections: ['turtle_cove', 'havana'] },
  { id: 'volcano_isle', name: 'Volcano Isle', biome: 'Volcanic',
    resources: ['obsidian', 'sulfur', 'iron_ore'], dangerLevel: 7,
    description: 'A smoldering island with a constantly active volcano.', connections: ['havana', 'frozen_reach'] },
  { id: 'frozen_reach', name: 'Frozen Reach', biome: 'Frozen',
    resources: ['ice_crystals', 'furs', 'whale_oil'], dangerLevel: 6,
    description: 'Icy waters and glaciers hide ancient secrets.', connections: ['volcano_isle', 'shadow_isle'] },
  { id: 'shadow_isle', name: 'Shadow Isle', biome: 'Haunted',
    resources: ['ghost_pearls', 'cursed_gold', 'shadow_herbs'], dangerLevel: 8,
    description: 'A perpetually dark island wreathed in unnatural fog.', connections: ['frozen_reach', 'mechanical_atoll'] },
  { id: 'mechanical_atoll', name: 'Mechanical Atoll', biome: 'Mechanical',
    resources: ['clockwork_parts', 'copper', 'steam_cores'], dangerLevel: 9,
    description: 'An artificial island of gears and steam powered by unknown means.', connections: ['shadow_isle', 'sacred_temple'] },
  { id: 'sacred_temple', name: 'Sacred Temple Isle', biome: 'Mystical',
    resources: ['mystic_fragments', 'enchanted_wood', 'oracle_stones'], dangerLevel: 10,
    description: 'Ancient temple ruins pulse with otherworldly energy.', connections: ['mechanical_atoll', 'madagascar'] },
  { id: 'madagascar', name: 'Madagascar', biome: 'Jungle',
    resources: ['exotic_spices', 'rare_herbs', 'ivory'], dangerLevel: 5,
    description: 'A vast jungle island teeming with unique wildlife.', connections: ['sacred_temple', 'skull_rock'] },
  { id: 'skull_rock', name: 'Skull Rock', biome: 'Desolate',
    resources: ['bone_chips', 'salvage', 'pirate_loot'], dangerLevel: 5,
    description: 'A skull-shaped rock formation that serves as a pirate graveyard.', connections: ['nassau', 'madagascar'] },
] as const;

export const PI_PORTS: readonly PiPort[] = [
  { id: 'port_tortuga', name: 'Tortuga Harbor', islandId: 'turtle_cove',
    goodsAvailable: ['rum', 'food', 'wood', 'cloth'],
    services: ['repair', 'crew', 'shipwright'],
    description: 'A small but bustling trade port on a sheltered bay.' },
  { id: 'port_royal_dock', name: 'Port Royal Docks', islandId: 'port_royal',
    goodsAvailable: ['rum', 'sugar', 'spices', 'weapons', 'medicine', 'silk'],
    services: ['repair', 'crew', 'shipwright', 'trading', 'quest'],
    description: 'The largest and most dangerous port in the Caribbean.' },
  { id: 'port_nassau', name: 'Nassau Freeport', islandId: 'nassau',
    goodsAvailable: ['rum', 'salt', 'food', 'weapons'],
    services: ['repair', 'crew', 'shipwright'],
    description: 'A free port where anything can be bought or sold.' },
  { id: 'port_havana', name: 'Havana Grande', islandId: 'havana',
    goodsAvailable: ['tobacco', 'sugar', 'gems', 'silk', 'medicine'],
    services: ['repair', 'trading', 'quest'],
    description: 'A wealthy Spanish port with high-end goods.' },
  { id: 'port_barbados', name: 'Bridgetown Port', islandId: 'barbados',
    goodsAvailable: ['sugar', 'rum', 'cotton', 'cloth', 'food'],
    services: ['repair', 'crew', 'trading'],
    description: 'A genteel port serving the island\'s plantations.' },
  { id: 'port_volcano', name: 'Ashen Anchorage', islandId: 'volcano_isle',
    goodsAvailable: ['iron', 'weapons', 'obsidian'],
    services: ['repair', 'shipwright'],
    description: 'A dangerous port near the volcanic shore.' },
  { id: 'port_madagascar', name: 'Pirate Bay', islandId: 'madagascar',
    goodsAvailable: ['spices', 'gems', 'ivory', 'medicine', 'food'],
    services: ['repair', 'crew', 'trading', 'quest'],
    description: 'A remote pirate outpost on the African coast.' },
  { id: 'port_skull', name: 'Dead Man\'s Dock', islandId: 'skull_rock',
    goodsAvailable: ['pirate_loot', 'weapons', 'rum'],
    services: ['repair', 'crew'],
    description: 'A grim port where pirates come to hide and trade stolen goods.' },
] as const;

export const PI_TRADE_GOODS: readonly PiTradeGoodType[] = [
  { id: 'rum', name: 'Rum', category: 'Liquor', basePrice: 15, volatility: 0.3,
    description: 'The lifeblood of every pirate crew.' },
  { id: 'spices', name: 'Exotic Spices', category: 'Food', basePrice: 40, volatility: 0.5,
    description: 'Rare spices from distant lands worth a fortune.' },
  { id: 'silk', name: 'Silk', category: 'Textile', basePrice: 60, volatility: 0.4,
    description: 'Fine silk from Eastern markets.' },
  { id: 'gold', name: 'Gold Bullion', category: 'Precious', basePrice: 200, volatility: 0.2,
    description: 'Solid gold bars, universally valuable.' },
  { id: 'weapons', name: 'Weapons', category: 'Military', basePrice: 50, volatility: 0.35,
    description: 'Swords, muskets, and cannons for battle.' },
  { id: 'food', name: 'Provisions', category: 'Food', basePrice: 8, volatility: 0.15,
    description: 'Salted meat, hardtack, and citrus for the crew.' },
  { id: 'medicine', name: 'Medicine', category: 'Supply', basePrice: 35, volatility: 0.25,
    description: 'Herbs, bandages, and remedies for the sick bay.' },
  { id: 'wood', name: 'Timber', category: 'Material', basePrice: 12, volatility: 0.2,
    description: 'Sturdy timber for ship repairs and building.' },
  { id: 'cloth', name: 'Fine Cloth', category: 'Textile', basePrice: 25, volatility: 0.3,
    description: 'Quality fabric for sails and clothing.' },
  { id: 'gems', name: 'Precious Gems', category: 'Precious', basePrice: 120, volatility: 0.45,
    description: 'Diamonds, rubies, and emeralds from exotic locales.' },
  { id: 'sugar', name: 'Sugar', category: 'Food', basePrice: 18, volatility: 0.25,
    description: 'Refined sugar from Caribbean plantations.' },
  { id: 'tobacco', name: 'Tobacco', category: 'Luxury', basePrice: 30, volatility: 0.3,
    description: 'Fine tobacco leaves prized by merchants.' },
  { id: 'salt', name: 'Salt', category: 'Material', basePrice: 5, volatility: 0.1,
    description: 'Essential for preserving food on long voyages.' },
  { id: 'iron', name: 'Iron Ore', category: 'Material', basePrice: 20, volatility: 0.2,
    description: 'Raw iron for forging tools and weapons.' },
  { id: 'ivory', name: 'Ivory', category: 'Luxury', basePrice: 80, volatility: 0.35,
    description: 'Pristine ivory from rare tusked creatures.' },
  { id: 'obsidian', name: 'Obsidian', category: 'Material', basePrice: 45, volatility: 0.4,
    description: 'Volcanic glass sharper than steel.' },
  { id: 'gunpowder', name: 'Gunpowder', category: 'Military', basePrice: 35, volatility: 0.3,
    description: 'Black powder for cannons and explosives.' },
  { id: 'cotton', name: 'Cotton', category: 'Textile', basePrice: 10, volatility: 0.15,
    description: 'Raw cotton bales from plantation fields.' },
  { id: 'exotic_herbs', name: 'Exotic Herbs', category: 'Supply', basePrice: 55, volatility: 0.5,
    description: 'Mysterious herbs with magical properties.' },
  { id: 'pirate_loot', name: 'Pirate Loot', category: 'Misc', basePrice: 70, volatility: 0.6,
    description: 'A mixed bag of stolen treasures and curiosities.' },
] as const;

export const PI_ENEMIES: readonly PiEnemyType[] = [
  { id: 'raft', name: 'Drifting Raft', shipClass: 'Raft',
    stats: { hull: 20, speed: 2, firepower: 0, crewCapacity: 1, cargoCapacity: 5 },
    loot: { coins: [5, 15], xp: [5, 10], goods: [{ goodId: 'food', chance: 0.4, quantity: [1, 3] }] }, minLevel: 1,
    description: 'A helpless raft that poses no threat.' },
  { id: 'fishing_boat', name: 'Fishing Boat', shipClass: 'Skiff',
    stats: { hull: 35, speed: 3, firepower: 1, crewCapacity: 3, cargoCapacity: 10 },
    loot: { coins: [10, 25], xp: [8, 15], goods: [{ goodId: 'food', chance: 0.5, quantity: [2, 5] }] }, minLevel: 2,
    description: 'A simple fishing vessel with minimal defenses.' },
  { id: 'pirate_skiff', name: 'Pirate Skiff', shipClass: 'Skiff',
    stats: { hull: 40, speed: 6, firepower: 3, crewCapacity: 4, cargoCapacity: 12 },
    loot: { coins: [20, 45], xp: [12, 20], goods: [{ goodId: 'rum', chance: 0.5, quantity: [1, 4] }] }, minLevel: 3,
    description: 'A small but fast pirate vessel.' },
  { id: 'patrol_dinghy', name: 'Naval Patrol', shipClass: 'Dinghy',
    stats: { hull: 45, speed: 5, firepower: 3, crewCapacity: 3, cargoCapacity: 8 },
    loot: { coins: [25, 50], xp: [15, 22], goods: [{ goodId: 'weapons', chance: 0.3, quantity: [1, 2] }] }, minLevel: 4,
    description: 'A navy patrol vessel enforcing the law.' },
  { id: 'smuggler_canoe', name: 'Smuggler\'s Canoe', shipClass: 'Canoe',
    stats: { hull: 30, speed: 7, firepower: 2, crewCapacity: 2, cargoCapacity: 15 },
    loot: { coins: [30, 60], xp: [15, 25], goods: [{ goodId: 'exotic_herbs', chance: 0.6, quantity: [1, 3] }] }, minLevel: 5,
    description: 'A stealthy canoe carrying illegal cargo.' },
  { id: 'navy_sloop', name: 'Navy Sloop', shipClass: 'Sloop',
    stats: { hull: 60, speed: 6, firepower: 5, crewCapacity: 6, cargoCapacity: 15 },
    loot: { coins: [40, 80], xp: [20, 30], goods: [{ goodId: 'gunpowder', chance: 0.4, quantity: [1, 3] }] }, minLevel: 7,
    description: 'A well-armed navy sloop on patrol duty.' },
  { id: 'buccaneer_cutter', name: 'Buccaneer Cutter', shipClass: 'Cutter',
    stats: { hull: 70, speed: 7, firepower: 6, crewCapacity: 8, cargoCapacity: 20 },
    loot: { coins: [50, 100], xp: [25, 35], goods: [{ goodId: 'gold', chance: 0.2, quantity: [1, 2] }] }, minLevel: 8,
    description: 'A pirate cutter captained by an experienced buccaneer.' },
  { id: 'river_pirate', name: 'River Pirate', shipClass: 'Skiff',
    stats: { hull: 55, speed: 8, firepower: 4, crewCapacity: 5, cargoCapacity: 12 },
    loot: { coins: [35, 70], xp: [22, 30], goods: [{ goodId: 'ivory', chance: 0.3, quantity: [1, 2] }] }, minLevel: 10,
    description: 'Pirates who haunt the great river deltas.' },
  { id: 'coastal_raider', name: 'Coastal Raider', shipClass: 'Brigantine',
    stats: { hull: 90, speed: 7, firepower: 8, crewCapacity: 12, cargoCapacity: 30 },
    loot: { coins: [60, 120], xp: [30, 45], goods: [{ goodId: 'silk', chance: 0.3, quantity: [1, 3] }] }, minLevel: 12,
    description: 'A raider that preys on coastal merchant ships.' },
  { id: 'merchant_brig', name: 'Armed Merchant', shipClass: 'Brig',
    stats: { hull: 100, speed: 5, firepower: 7, crewCapacity: 15, cargoCapacity: 50 },
    loot: { coins: [80, 160], xp: [35, 50], goods: [{ goodId: 'spices', chance: 0.5, quantity: [2, 5] }] }, minLevel: 13,
    description: 'A merchant vessel with hired guards and cannons.' },
  { id: 'pirate_brigantine', name: 'Pirate Brigantine', shipClass: 'Brigantine',
    stats: { hull: 110, speed: 7, firepower: 10, crewCapacity: 14, cargoCapacity: 35 },
    loot: { coins: [90, 180], xp: [40, 55], goods: [{ goodId: 'rum', chance: 0.6, quantity: [3, 8] }] }, minLevel: 15,
    description: 'A proper pirate ship with a bloodthirsty crew.' },
  { id: 'navy_frigate', name: 'Navy Frigate', shipClass: 'Frigate',
    stats: { hull: 150, speed: 6, firepower: 14, crewCapacity: 20, cargoCapacity: 25 },
    loot: { coins: [120, 240], xp: [50, 70], goods: [{ goodId: 'weapons', chance: 0.4, quantity: [2, 5] }] }, minLevel: 17,
    description: 'A powerful naval frigate hunting pirates.' },
  { id: 'corsair_caravel', name: 'Corsair Caravel', shipClass: 'Caravel',
    stats: { hull: 130, speed: 8, firepower: 9, crewCapacity: 12, cargoCapacity: 40 },
    loot: { coins: [100, 200], xp: [45, 65], goods: [{ goodId: 'gems', chance: 0.3, quantity: [1, 3] }] }, minLevel: 18,
    description: 'A fast corsair vessel loaded with plunder.' },
  { id: 'sea_serpent', name: 'Sea Serpent', shipClass: 'Creature',
    stats: { hull: 180, speed: 9, firepower: 16, crewCapacity: 0, cargoCapacity: 0 },
    loot: { coins: [150, 300], xp: [60, 85], goods: [{ goodId: 'obsidian', chance: 0.5, quantity: [2, 4] }] }, minLevel: 20,
    description: 'A massive serpentine creature from the deep.' },
  { id: 'war_galleon', name: 'War Galleon', shipClass: 'Galleon',
    stats: { hull: 220, speed: 4, firepower: 16, crewCapacity: 28, cargoCapacity: 60 },
    loot: { coins: [180, 360], xp: [65, 90], goods: [{ goodId: 'gold', chance: 0.4, quantity: [2, 5] }] }, minLevel: 22,
    description: 'A heavily armed war galleon bristling with cannons.' },
  { id: 'ghost_ship_enemy', name: 'Ghost Ship', shipClass: 'Specter',
    stats: { hull: 160, speed: 10, firepower: 14, crewCapacity: 10, cargoCapacity: 30 },
    loot: { coins: [200, 400], xp: [70, 95], goods: [{ goodId: 'exotic_herbs', chance: 0.5, quantity: [2, 4] }] }, minLevel: 24,
    description: 'A spectral vessel crewed by the damned.' },
  { id: 'kraken_spawn', name: 'Kraken Spawn', shipClass: 'Creature',
    stats: { hull: 200, speed: 7, firepower: 18, crewCapacity: 0, cargoCapacity: 0 },
    loot: { coins: [220, 440], xp: [75, 100], goods: [{ goodId: 'exotic_herbs', chance: 0.4, quantity: [1, 3] }] }, minLevel: 25,
    description: 'A young kraken testing its tentacles on passing ships.' },
  { id: 'ironclad_scout', name: 'Ironclad Scout', shipClass: 'Ironclad',
    stats: { hull: 280, speed: 5, firepower: 18, crewCapacity: 15, cargoCapacity: 20 },
    loot: { coins: [250, 500], xp: [80, 110], goods: [{ goodId: 'iron', chance: 0.5, quantity: [3, 6] }] }, minLevel: 27,
    description: 'An advanced iron-plated scout vessel.' },
  { id: 'dark_corsair', name: 'Dark Corsair', shipClass: 'Frigate',
    stats: { hull: 190, speed: 8, firepower: 16, crewCapacity: 18, cargoCapacity: 35 },
    loot: { coins: [240, 480], xp: [85, 115], goods: [{ goodId: 'pirate_loot', chance: 0.5, quantity: [2, 5] }] }, minLevel: 28,
    description: 'A notorious corsair flying no colors.' },
  { id: 'storm_giant', name: 'Storm Giant', shipClass: 'Creature',
    stats: { hull: 300, speed: 3, firepower: 22, crewCapacity: 0, cargoCapacity: 0 },
    loot: { coins: [300, 600], xp: [100, 140], goods: [{ goodId: 'obsidian', chance: 0.6, quantity: [3, 6] }] }, minLevel: 30,
    description: 'A towering giant that commands the storm itself.' },
  { id: 'armored_frigate', name: 'Armored Frigate', shipClass: 'Frigate',
    stats: { hull: 320, speed: 5, firepower: 20, crewCapacity: 22, cargoCapacity: 30 },
    loot: { coins: [280, 560], xp: [95, 130], goods: [{ goodId: 'weapons', chance: 0.5, quantity: [3, 6] }] }, minLevel: 32,
    description: 'A frigate with reinforced hull and heavy cannons.' },
  { id: 'leviathan', name: 'Leviathan', shipClass: 'Creature',
    stats: { hull: 400, speed: 6, firepower: 25, crewCapacity: 0, cargoCapacity: 0 },
    loot: { coins: [350, 700], xp: [120, 160], goods: [{ goodId: 'exotic_herbs', chance: 0.6, quantity: [3, 5] }] }, minLevel: 34,
    description: 'An ancient sea beast of mythic proportions.' },
  { id: 'shadow_fleet', name: 'Shadow Fleet', shipClass: 'Specter',
    stats: { hull: 350, speed: 9, firepower: 22, crewCapacity: 20, cargoCapacity: 40 },
    loot: { coins: [320, 640], xp: [110, 150], goods: [{ goodId: 'exotic_herbs', chance: 0.5, quantity: [2, 5] }] }, minLevel: 36,
    description: 'A fleet of ghost ships sailing in unnatural formation.' },
  { id: 'treasure_galleon', name: 'Treasure Galleon', shipClass: 'Galleon',
    stats: { hull: 280, speed: 4, firepower: 12, crewCapacity: 30, cargoCapacity: 100 },
    loot: { coins: [500, 1000], xp: [100, 140], goods: [{ goodId: 'gold', chance: 0.8, quantity: [5, 15] }] }, minLevel: 37,
    description: 'A fat galleon carrying legendary treasure.' },
  { id: 'cursed_sloop', name: 'Cursed Sloop', shipClass: 'Specter',
    stats: { hull: 250, speed: 11, firepower: 20, crewCapacity: 8, cargoCapacity: 25 },
    loot: { coins: [300, 600], xp: [110, 155], goods: [{ goodId: 'exotic_herbs', chance: 0.4, quantity: [2, 4] }] }, minLevel: 38,
    description: 'A cursed ship that moves impossibly fast.' },
  { id: 'dreadnought', name: 'Dreadnought', shipClass: 'Man o\' War',
    stats: { hull: 450, speed: 4, firepower: 28, crewCapacity: 35, cargoCapacity: 45 },
    loot: { coins: [400, 800], xp: [130, 175], goods: [{ goodId: 'weapons', chance: 0.5, quantity: [4, 8] }] }, minLevel: 40,
    description: 'An immense warship that dwarfs all others.' },
  { id: 'phoenix_ship', name: 'Phoenix Vessel', shipClass: 'Mythic',
    stats: { hull: 350, speed: 10, firepower: 24, crewCapacity: 20, cargoCapacity: 35 },
    loot: { coins: [450, 900], xp: [140, 190], goods: [{ goodId: 'gems', chance: 0.6, quantity: [3, 7] }] }, minLevel: 42,
    description: 'A blazing ship that resurrects itself from flames.' },
  { id: 'poseidon_chariot', name: 'Poseidon\'s Chariot', shipClass: 'Divine',
    stats: { hull: 500, speed: 8, firepower: 30, crewCapacity: 15, cargoCapacity: 20 },
    loot: { coins: [600, 1200], xp: [160, 220], goods: [{ goodId: 'gold', chance: 0.7, quantity: [5, 12] }] }, minLevel: 44,
    description: 'A divine vessel gifted by the sea god himself.' },
  { id: 'sea_dragon', name: 'Sea Dragon', shipClass: 'Creature',
    stats: { hull: 550, speed: 7, firepower: 35, crewCapacity: 0, cargoCapacity: 0 },
    loot: { coins: [700, 1400], xp: [180, 250], goods: [{ goodId: 'exotic_herbs', chance: 0.7, quantity: [4, 8] }] }, minLevel: 46,
    description: 'The most fearsome creature in all the seas.' },
  { id: 'davy_jones', name: 'Davy Jones\' Locker', shipClass: 'Undead',
    stats: { hull: 600, speed: 9, firepower: 38, crewCapacity: 25, cargoCapacity: 50 },
    loot: { coins: [1000, 2000], xp: [250, 350], goods: [{ goodId: 'pirate_loot', chance: 0.9, quantity: [5, 15] }] }, minLevel: 48,
    description: 'The legendary ship of Davy Jones, ferryman of the damned.' },
] as const;

export const PI_SKILLS: readonly PiSkillType[] = [
  { id: 'swordsmanship', name: 'Swordsmanship', description: 'Master the blade for boarding combat.', category: 'Combat', maxLevel: 10, trainCost: 30 },
  { id: 'cannons', name: 'Cannoneering', description: 'Increase naval firepower through gunnery mastery.', category: 'Combat', maxLevel: 10, trainCost: 30 },
  { id: 'boarding', name: 'Boarding', description: 'Lead boarding parties to capture enemy vessels.', category: 'Combat', maxLevel: 10, trainCost: 25 },
  { id: 'defense', name: 'Defense', description: 'Harden your ship and crew against attacks.', category: 'Combat', maxLevel: 10, trainCost: 25 },
  { id: 'marksmanship', name: 'Marksmanship', description: 'Accuracy with muskets and long-range weapons.', category: 'Combat', maxLevel: 10, trainCost: 28 },
  { id: 'navigation', name: 'Navigation', description: 'Chart courses through dangerous waters.', category: 'Seamanship', maxLevel: 10, trainCost: 20 },
  { id: 'sailing', name: 'Sailing', description: 'Harness the wind for maximum speed.', category: 'Seamanship', maxLevel: 10, trainCost: 20 },
  { id: 'repair', name: 'Ship Repair', description: 'Fix damage to keep your vessel seaworthy.', category: 'Seamanship', maxLevel: 10, trainCost: 22 },
  { id: 'fishing', name: 'Fishing', description: 'Catch fish to sustain your crew on long voyages.', category: 'Seamanship', maxLevel: 10, trainCost: 10 },
  { id: 'swimming', name: 'Swimming', description: 'Survive in the water when things go overboard.', category: 'Seamanship', maxLevel: 10, trainCost: 15 },
  { id: 'negotiation', name: 'Negotiation', description: 'Haggle for better prices in trade deals.', category: 'Trading', maxLevel: 10, trainCost: 25 },
  { id: 'appraisal', name: 'Appraisal', description: 'Evaluate the true value of goods and treasure.', category: 'Trading', maxLevel: 10, trainCost: 20 },
  { id: 'smuggling', name: 'Smuggling', description: 'Move illicit goods past port authorities.', category: 'Trading', maxLevel: 10, trainCost: 30 },
  { id: 'accounting', name: 'Accounting', description: 'Manage finances and maximize profits.', category: 'Trading', maxLevel: 10, trainCost: 18 },
  { id: 'persuasion', name: 'Persuasion', description: 'Convince NPCs to offer better deals.', category: 'Trading', maxLevel: 10, trainCost: 22 },
  { id: 'cartography', name: 'Cartography', description: 'Create detailed maps of discovered regions.', category: 'Exploration', maxLevel: 10, trainCost: 20 },
  { id: 'survival', name: 'Survival', description: 'Endure harsh conditions on uncharted islands.', category: 'Exploration', maxLevel: 10, trainCost: 18 },
  { id: 'archaeology', name: 'Archaeology', description: 'Unearth ancient artifacts and treasures.', category: 'Exploration', maxLevel: 10, trainCost: 35 },
  { id: 'scouting', name: 'Scouting', description: 'Spot threats and opportunities from afar.', category: 'Exploration', maxLevel: 10, trainCost: 20 },
  { id: 'diving', name: 'Deep Diving', description: 'Explore underwater wrecks and reefs.', category: 'Exploration', maxLevel: 10, trainCost: 25 },
  { id: 'leadership', name: 'Leadership', description: 'Inspire your crew to fight harder and work better.', category: 'Special', maxLevel: 10, trainCost: 30 },
  { id: 'luck', name: 'Fortune', description: 'Increase your chances of finding rare items.', category: 'Special', maxLevel: 10, trainCost: 40 },
  { id: 'intimidation', name: 'Intimidation', description: 'Scare enemies into surrendering faster.', category: 'Special', maxLevel: 10, trainCost: 28 },
  { id: 'medicine', name: 'Medicine', description: 'Heal crew wounds and cure exotic diseases.', category: 'Special', maxLevel: 10, trainCost: 25 },
  { id: 'engineering', name: 'Engineering', description: 'Design and build advanced ship modifications.', category: 'Special', maxLevel: 10, trainCost: 35 },
] as const;

export const PI_QUESTS: readonly PiQuestType[] = [
  { id: 'q_sea_trials', name: 'Sea Trials', description: 'Defeat 3 pirate skiffs to prove your worth.',
    type: 'combat', target: 'pirate_skiff', targetCount: 3, rewardCoins: 100, rewardXP: 50, rewardRep: 5, minLevel: 1, npcId: 'npc_pete' },
  { id: 'q_trade_route', name: 'Trade Route', description: 'Complete 5 trades to establish a trade route.',
    type: 'trade', target: 'trade', targetCount: 5, rewardCoins: 150, rewardXP: 40, rewardRep: 3, minLevel: 1, npcId: 'npc_zheng' },
  { id: 'q_map_hunter', name: 'Map Hunter', description: 'Explore 2 new islands to expand your chart.',
    type: 'explore', target: 'island', targetCount: 2, rewardCoins: 120, rewardXP: 60, rewardRep: 5, minLevel: 2, npcId: 'npc_pete' },
  { id: 'q_navy_slayer', name: 'Navy Slayer', description: 'Sink 2 navy patrol ships.',
    type: 'combat', target: 'patrol_dinghy', targetCount: 2, rewardCoins: 200, rewardXP: 80, rewardRep: 10, minLevel: 4, npcId: 'npc_ghost' },
  { id: 'q_rum_runner', name: 'Rum Runner', description: 'Buy and sell 10 units of rum across ports.',
    type: 'trade', target: 'rum', targetCount: 10, rewardCoins: 250, rewardXP: 60, rewardRep: 5, minLevel: 3, npcId: 'npc_zheng' },
  { id: 'q_crew_assembly', name: 'Crew Assembly', description: 'Hire 3 crew members for your ship.',
    type: 'crew', target: 'crew', targetCount: 3, rewardCoins: 180, rewardXP: 50, rewardRep: 3, minLevel: 3, npcId: 'npc_anne' },
  { id: 'q_volcano_exp', name: 'Volcano Expedition', description: 'Discover Volcano Isle and return safely.',
    type: 'explore', target: 'volcano_isle', targetCount: 1, rewardCoins: 300, rewardXP: 120, rewardRep: 15, minLevel: 7, npcId: 'npc_pete' },
  { id: 'q_galleon_hunter', name: 'Galleon Hunter', description: 'Capture 2 merchant galleons.',
    type: 'combat', target: 'merchant_brig', targetCount: 2, rewardCoins: 400, rewardXP: 150, rewardRep: 15, minLevel: 13, npcId: 'npc_ghost' },
  { id: 'q_spice_trade', name: 'Spice Road', description: 'Trade 8 units of exotic spices.',
    type: 'trade', target: 'spices', targetCount: 8, rewardCoins: 500, rewardXP: 100, rewardRep: 10, minLevel: 10, npcId: 'npc_zheng' },
  { id: 'q_ghost_hunt', name: 'Ghost Hunter', description: 'Defeat a Ghost Ship.',
    type: 'combat', target: 'ghost_ship_enemy', targetCount: 1, rewardCoins: 600, rewardXP: 200, rewardRep: 20, minLevel: 24, npcId: 'npc_ghost' },
  { id: 'q_frozen_wastes', name: 'Frozen Wastes', description: 'Explore the Frozen Reach and survive.',
    type: 'explore', target: 'frozen_reach', targetCount: 1, rewardCoins: 450, rewardXP: 180, rewardRep: 15, minLevel: 6, npcId: 'npc_pete' },
  { id: 'q_kraken_fisher', name: 'Kraken Fisher', description: 'Defeat a Kraken Spawn.',
    type: 'combat', target: 'kraken_spawn', targetCount: 1, rewardCoins: 500, rewardXP: 220, rewardRep: 20, minLevel: 25, npcId: 'npc_kraken' },
  { id: 'q_shadow_expedition', name: 'Into the Shadows', description: 'Discover Shadow Isle.',
    type: 'explore', target: 'shadow_isle', targetCount: 1, rewardCoins: 550, rewardXP: 200, rewardRep: 18, minLevel: 8, npcId: 'npc_pete' },
  { id: 'q_arms_dealer', name: 'Arms Dealer', description: 'Trade 6 units of weapons.',
    type: 'trade', target: 'weapons', targetCount: 6, rewardCoins: 350, rewardXP: 90, rewardRep: 8, minLevel: 8, npcId: 'npc_zheng' },
  { id: 'q_cursed_voyage', name: 'Cursed Voyage', description: 'Defeat the Cursed Sloop.',
    type: 'combat', target: 'cursed_sloop', targetCount: 1, rewardCoins: 800, rewardXP: 300, rewardRep: 25, minLevel: 38, npcId: 'npc_ghost' },
  { id: 'q_mechanical_mystery', name: 'Mechanical Mystery', description: 'Discover the Mechanical Atoll.',
    type: 'explore', target: 'mechanical_atoll', targetCount: 1, rewardCoins: 700, rewardXP: 250, rewardRep: 20, minLevel: 9, npcId: 'npc_pete' },
  { id: 'q_elite_crew', name: 'Elite Crew', description: 'Hire 5 crew members total.',
    type: 'crew', target: 'crew', targetCount: 5, rewardCoins: 400, rewardXP: 120, rewardRep: 10, minLevel: 8, npcId: 'npc_anne' },
  { id: 'q_dragon_slayer', name: 'Dragon Slayer', description: 'Defeat the legendary Sea Dragon.',
    type: 'combat', target: 'sea_dragon', targetCount: 1, rewardCoins: 1500, rewardXP: 500, rewardRep: 50, minLevel: 46, npcId: 'npc_kraken' },
  { id: 'q_temple_rites', name: 'Temple Rites', description: 'Discover the Sacred Temple Isle.',
    type: 'explore', target: 'sacred_temple', targetCount: 1, rewardCoins: 800, rewardXP: 300, rewardRep: 25, minLevel: 10, npcId: 'npc_oracle' },
  { id: 'q_davy_jones', name: 'Davy Jones\' Locker', description: 'Defeat Davy Jones in final combat.',
    type: 'combat', target: 'davy_jones', targetCount: 1, rewardCoins: 5000, rewardXP: 1000, rewardRep: 100, minLevel: 48, npcId: 'npc_oracle' },
] as const;

export const PI_EQUIPMENT: readonly PiEquipmentType[] = [
  { id: 'cutlass', name: 'Rusty Cutlass', slot: 'weapon',
    stats: { firepower: 2 }, cost: 50, rarity: 'common',
    description: 'A basic but reliable pirate blade.' },
  { id: 'rapier', name: 'Captain\'s Rapier', slot: 'weapon',
    stats: { firepower: 5, speed: 1 }, cost: 200, rarity: 'uncommon',
    description: 'An elegant dueling sword with fine balance.' },
  { id: 'blunderbuss', name: 'Heavy Blunderbuss', slot: 'weapon',
    stats: { firepower: 8 }, cost: 350, rarity: 'rare',
    description: 'Devastating at close range with spread shot.' },
  { id: 'boarding_axe', name: 'Boarding Axe', slot: 'weapon',
    stats: { firepower: 4, speed: 1 }, cost: 150, rarity: 'uncommon',
    description: 'A hooked axe for boarding and cutting rigging.' },
  { id: 'golden_sword', name: 'Golden Cutlass', slot: 'weapon',
    stats: { firepower: 12, luck: 3 }, cost: 800, rarity: 'epic',
    description: 'A golden blade said to bring fortune in battle.' },
  { id: 'leather_vest', name: 'Leather Vest', slot: 'armor',
    stats: { hull: 10 }, cost: 60, rarity: 'common',
    description: 'Basic leather armor for light protection.' },
  { id: 'chain_mail', name: 'Chain Mail', slot: 'armor',
    stats: { hull: 25, speed: -1 }, cost: 300, rarity: 'uncommon',
    description: 'Heavy chain links that slow but protect.' },
  { id: 'captains_coat', name: 'Captain\'s Coat', slot: 'armor',
    stats: { hull: 40, charisma: 2 }, cost: 600, rarity: 'rare',
    description: 'A fine coat that inspires the crew and deflects blades.' },
  { id: 'compass', name: 'Brass Compass', slot: 'accessory',
    stats: { speed: 2, luck: 1 }, cost: 100, rarity: 'common',
    description: 'A reliable compass that always points true.' },
  { id: 'spyglass', name: 'Engraved Spyglass', slot: 'accessory',
    stats: { speed: 3, firepower: 2 }, cost: 250, rarity: 'uncommon',
    description: 'Spot enemies and aim cannons with precision.' },
  { id: 'lucky_charm', name: 'Lucky Charm', slot: 'accessory',
    stats: { luck: 5, charisma: 1 }, cost: 400, rarity: 'rare',
    description: 'A mysterious trinket that bends fate.' },
  { id: 'captains_hat', name: 'Tricorn Hat', slot: 'accessory',
    stats: { charisma: 4, luck: 2 }, cost: 350, rarity: 'uncommon',
    description: 'A distinguished hat marking true authority.' },
  { id: 'repair_kit', name: 'Carpenter\'s Toolkit', slot: 'tool',
    stats: { hull: 15 }, cost: 80, rarity: 'common',
    description: 'Tools for emergency hull repairs at sea.' },
  { id: 'fishing_net', name: 'Deep Sea Net', slot: 'tool',
    stats: { luck: 3, cargoCapacity: 10 }, cost: 120, rarity: 'uncommon',
    description: 'A reinforced net for deep-sea fishing and salvage.' },
  { id: 'treasure_shovel', name: 'Treasure Shovel', slot: 'tool',
    stats: { luck: 6 }, cost: 500, rarity: 'rare',
    description: 'A shovel enchanted to sense buried treasure.' },
] as const;

export const PI_NPCS: readonly PiNpcType[] = [
  { id: 'npc_pete', name: 'Old Salt Pete', role: 'Quest Giver', islandId: 'port_royal',
    dialogue: ['Arrr, ye look like ye can handle a challenge.', 'The seas are full of secrets, lad.'],
    questIds: ['q_sea_trials', 'q_map_hunter', 'q_volcano_exp', 'q_frozen_wastes', 'q_shadow_expedition', 'q_mechanical_mystery'],
    description: 'A grizzled old sailor with tales of every ocean.' },
  { id: 'npc_zheng', name: 'Madam Zheng', role: 'Trade Master', islandId: 'port_royal',
    dialogue: ['Good prices today, captain.', 'I have special goods if you know where to sell.'],
    questIds: ['q_trade_route', 'q_rum_runner', 'q_spice_trade', 'q_arms_dealer'],
    description: 'A powerful merchant who controls trade across the region.' },
  { id: 'npc_ghost', name: 'Blackbeard\'s Ghost', role: 'Combat Trainer', islandId: 'skull_rock',
    dialogue: ['Ye fight like a landlubber!', 'True power comes from the sea itself.'],
    questIds: ['q_navy_slayer', 'q_ghost_hunt', 'q_cursed_voyage'],
    description: 'The spectral remnant of the most feared pirate ever.' },
  { id: 'npc_calico', name: 'Calico Jack', role: 'Shipwright', islandId: 'nassau',
    dialogue: ['Fine vessel ye have there, captain.', 'I can upgrade yer ship for the right price.'],
    questIds: [],
    description: 'A master shipbuilder who sells and upgrades vessels.' },
  { id: 'npc_anne', name: 'Anne Bonny', role: 'Crew Recruiter', islandId: 'nassau',
    dialogue: ['Looking for able hands? I know the best.', 'A good crew is worth more than gold.'],
    questIds: ['q_crew_assembly', 'q_elite_crew'],
    description: 'A fierce pirate who recruits the finest crew members.' },
  { id: 'npc_jones', name: 'Davy Jones', role: 'Equipment Dealer', islandId: 'shadow_isle',
    dialogue: ['Ye seek power? Everything has a price...', 'These items carry the weight of the deep.'],
    questIds: [],
    description: 'The legendary keeper of lost souls and cursed items.' },
  { id: 'npc_oracle', name: 'The Oracle', role: 'Mystic', islandId: 'sacred_temple',
    dialogue: ['I see great battles in your future.', 'The tides of fate shift around you.'],
    questIds: ['q_temple_rites', 'q_davy_jones'],
    description: 'An ancient seer who perceives all possible futures.' },
  { id: 'npc_kraken', name: 'Old Kraken-eye', role: 'Beast Master', islandId: 'volcano_isle',
    dialogue: ['The deep ones speak to me.', 'To fight beasts, you must think like one.'],
    questIds: ['q_kraken_fisher', 'q_dragon_slayer'],
    description: 'A one-eyed hunter who understands sea creatures.' },
] as const;

export const PI_ACHIEVEMENTS: readonly PiAchievementType[] = [
  { id: 'ach_first_blood', name: 'First Blood', description: 'Win your first naval battle.',
    rewardCoins: 50, rewardXP: 25 },
  { id: 'ach_ten_kills', name: 'Sea Terror', description: 'Defeat 10 enemy ships.',
    rewardCoins: 200, rewardXP: 100 },
  { id: 'ach_fifty_kills', name: 'Armada Slayer', description: 'Defeat 50 enemy ships.',
    rewardCoins: 1000, rewardXP: 500 },
  { id: 'ach_first_trade', name: 'First Trade', description: 'Complete your first trade deal.',
    rewardCoins: 30, rewardXP: 15 },
  { id: 'ach_trade_master', name: 'Trade Master', description: 'Complete 50 total trades.',
    rewardCoins: 500, rewardXP: 250 },
  { id: 'ach_explorer', name: 'Explorer', description: 'Discover 6 different islands.',
    rewardCoins: 300, rewardXP: 150 },
  { id: 'ach_cartographer', name: 'Master Cartographer', description: 'Discover all 12 islands.',
    rewardCoins: 2000, rewardXP: 1000 },
  { id: 'ach_rich_pirate', name: 'Rich Pirate', description: 'Accumulate 10,000 coins.',
    rewardCoins: 500, rewardXP: 200 },
  { id: 'ach_treasure_hunter', name: 'Treasure Hunter', description: 'Find 5 buried treasures.',
    rewardCoins: 400, rewardXP: 200 },
  { id: 'ach_captain', name: 'Captain', description: 'Reach level 10.',
    rewardCoins: 300, rewardXP: 150 },
  { id: 'ach_commodore', name: 'Commodore', description: 'Reach level 25.',
    rewardCoins: 800, rewardXP: 400 },
  { id: 'ach_pirate_king', name: 'Pirate King', description: 'Reach level 50.',
    rewardCoins: 5000, rewardXP: 2500 },
  { id: 'ach_full_crew', name: 'Full Crew', description: 'Hire 10 crew members total.',
    rewardCoins: 250, rewardXP: 125 },
  { id: 'ach_quest_hero', name: 'Quest Hero', description: 'Complete 10 quests.',
    rewardCoins: 600, rewardXP: 300 },
  { id: 'ach_dragon_slayer', name: 'Dragon Slayer', description: 'Defeat the Sea Dragon.',
    rewardCoins: 2000, rewardXP: 1000 },
] as const;

export const PI_TITLE_THRESHOLDS: readonly PiTitleEntry[] = [
  { name: 'Landlubber', threshold: 1 },
  { name: 'Cabin Boy', threshold: 5 },
  { name: 'Deckhand', threshold: 10 },
  { name: 'Sailor', threshold: 15 },
  { name: 'Pirate', threshold: 20 },
  { name: 'Captain', threshold: 30 },
  { name: 'Commodore', threshold: 40 },
  { name: 'Pirate King', threshold: 50 },
] as const;

/* ====================================================================
   INTERNAL HELPERS
   ==================================================================== */

function piCreateInitialState(seed?: number): PiGameState {
  const s = seed ?? 42;
  return {
    seed: s,
    rngState: s,
    player: {
      level: 1,
      xp: 0,
      coins: 100,
      reputation: 0,
      currentIslandId: 'turtle_cove',
      currentShipIndex: 0,
    },
    ships: [{ typeId: 'sloop', level: 1, currentHull: 50 }],
    crew: [],
    inventory: [],
    treasureMaps: [],
    activeMapIndex: -1,
    skills: [],
    activeQuests: [],
    completedQuests: [],
    equipped: { weapon: null, armor: null, accessory: null, tool: null },
    ownedEquipment: [],
    achievements: [],
    dailyTask: null,
    battle: null,
    discoveredIslands: ['turtle_cove'],
    kills: {},
    totalTrades: 0,
    totalTreasuresFound: 0,
    totalEnemiesDefeated: 0,
    day: 1,
    totalCrewHired: 0,
    explorationCount: 0,
  };
}

function piGetShipType(typeId: string): PiShipType {
  return PI_SHIPS.find(s => s.id === typeId) ?? PI_SHIPS[0];
}

function piGetPlayerStats(state: PiGameState): PiShipStats {
  const activeShip = state.ships[state.player.currentShipIndex];
  if (!activeShip) return { hull: 50, speed: 5, firepower: 1, crewCapacity: 5, cargoCapacity: 20 };
  const base = piGetShipType(activeShip.typeId).stats;
  const levelMult = 1 + (activeShip.level - 1) * 0.08;
  const crewBonus = state.crew.reduce((acc, c) => {
    const role = PI_CREW_ROLES.find(r => r.id === c.roleId);
    if (!role) return acc;
    const combatBonus = (role.skills.cannons ?? 0) + (role.skills.swordsmanship ?? 0);
    const navBonus = (role.skills.sailing ?? 0) + (role.skills.navigation ?? 0);
    const supBonus = (role.skills.repair ?? 0) + (role.skills.carpentry ?? 0);
    return {
      firepower: acc.firepower + combatBonus * 0.3,
      speed: acc.speed + navBonus * 0.2,
      hull: acc.hull + supBonus * 0.5,
    };
  }, { firepower: 0, speed: 0, hull: 0 });
  const equipBonus = Object.values(state.equipped).reduce((acc, eqId) => {
    if (!eqId) return acc;
    const eq = PI_EQUIPMENT.find(e => e.id === eqId);
    if (!eq) return acc;
    return {
      firepower: acc.firepower + (eq.stats.firepower ?? 0),
      speed: acc.speed + (eq.stats.speed ?? 0),
      hull: acc.hull + (eq.stats.hull ?? 0),
    };
  }, { firepower: 0, speed: 0, hull: 0 });
  return {
    hull: Math.floor(base.hull * levelMult) + crewBonus.hull + equipBonus.hull,
    speed: Math.floor(base.speed * levelMult) + crewBonus.speed + equipBonus.speed,
    firepower: Math.floor(base.firepower * levelMult) + crewBonus.firepower + equipBonus.firepower,
    crewCapacity: base.crewCapacity + Math.floor(base.crewCapacity * (activeShip.level - 1) * 0.02),
    cargoCapacity: base.cargoCapacity + (Object.values(state.equipped).reduce((a, id) => {
      if (!id) return a;
      const eq = PI_EQUIPMENT.find(e => e.id === id);
      return a + ((eq?.stats as Record<string, number>)?.cargoCapacity ?? 0);
    }, 0)),
  };
}

function piCalculatePrice(good: PiTradeGoodType, day: number, islandId: string): number {
  const islandMod = piDeterministicHash(
    PI_ISLANDS.findIndex(i => i.id === islandId),
    PI_TRADE_GOODS.findIndex(g => g.id === good.id),
    day * 0.1,
  ) * 0.3 - 0.15;
  const cycle = Math.sin(day * 0.15 + good.basePrice * 0.05) * good.volatility * 0.25;
  const dayVar = piDeterministicHash(good.basePrice, day, islandId.length) * good.volatility * 0.2 - good.volatility * 0.1;
  return Math.max(1, Math.round(good.basePrice * (1 + cycle + islandMod + dayVar)));
}

function piGenerateDailyTask(state: PiGameState): PiDailyTask {
  const types: PiDailyTask['type'][] = ['combat', 'trade', 'explore', 'crew'];
  const typeIndex = Math.floor(piDeterministicHash(state.seed, state.day, 1) * types.length);
  const type = types[typeIndex];
  const descriptions: Record<string, string[]> = {
    combat: ['Defeat {n} enemy ships.', 'Sink {n} hostile vessels.', 'Win {n} naval battles.'],
    trade: ['Complete {n} trades.', 'Buy or sell {n} goods.', 'Make {n} market deals.'],
    explore: ['Explore {n} islands.', 'Discover {n} new locations.', 'Survey {n} regions.'],
    crew: ['Hire {n} crew members.', 'Recruit {n} sailors.'],
  };
  const level = state.player.level;
  const baseTarget = Math.floor(2 + level * 0.4 + piDeterministicHash(state.seed, state.day, 2) * 3);
  const target = Math.max(1, baseTarget);
  const rewardCoins = Math.floor(target * (15 + level * 2));
  const rewardXP = Math.floor(target * (10 + level * 1.5));
  const descOptions = descriptions[type];
  const descIndex = Math.floor(piDeterministicHash(state.seed, state.day, 3) * descOptions.length);
  return {
    type,
    target,
    progress: 0,
    rewardCoins,
    rewardXP,
    claimed: false,
    description: descOptions[descIndex].replace('{n}', String(target)),
  };
}

function piCheckAchievementConditions(state: PiGameState): string[] {
  const newlyUnlocked: string[] = [];
  const checks: Record<string, boolean> = {
    ach_first_blood: state.totalEnemiesDefeated >= 1,
    ach_ten_kills: state.totalEnemiesDefeated >= 10,
    ach_fifty_kills: state.totalEnemiesDefeated >= 50,
    ach_first_trade: state.totalTrades >= 1,
    ach_trade_master: state.totalTrades >= 50,
    ach_explorer: state.discoveredIslands.length >= 6,
    ach_cartographer: state.discoveredIslands.length >= 12,
    ach_rich_pirate: state.player.coins >= 10000,
    ach_treasure_hunter: state.totalTreasuresFound >= 5,
    ach_captain: state.player.level >= 10,
    ach_commodore: state.player.level >= 25,
    ach_pirate_king: state.player.level >= 50,
    ach_full_crew: state.totalCrewHired >= 10,
    ach_quest_hero: state.completedQuests.length >= 10,
    ach_dragon_slayer: (state.kills['sea_dragon'] ?? 0) >= 1,
  };
  for (const [id, condition] of Object.entries(checks)) {
    if (condition && !state.achievements.includes(id)) {
      state.achievements.push(id);
      newlyUnlocked.push(id);
      const ach = PI_ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        state.player.coins += ach.rewardCoins;
        state.player.xp += ach.rewardXP;
      }
    }
  }
  if (newlyUnlocked.length > 0) {
    state.player.level = Math.min(PI_MAX_LEVEL, piLevelFromXP(state.player.xp));
  }
  return newlyUnlocked;
}

function piIncrementDailyProgress(state: PiGameState, type: PiDailyTask['type']): void {
  if (!state.dailyTask || state.dailyTask.claimed) return;
  if (state.dailyTask.type === type) {
    state.dailyTask.progress = Math.min(state.dailyTask.target, state.dailyTask.progress + 1);
  }
}

function piMergeStats(base: PiShipStats, bonus: Partial<PiShipStats>): PiShipStats {
  return {
    hull: base.hull + (bonus.hull ?? 0),
    speed: base.speed + (bonus.speed ?? 0),
    firepower: base.firepower + (bonus.firepower ?? 0),
    crewCapacity: base.crewCapacity + (bonus.crewCapacity ?? 0),
    cargoCapacity: base.cargoCapacity + (bonus.cargoCapacity ?? 0),
  };
}

/* ====================================================================
   MAIN HOOK — usePirateBay
   ==================================================================== */

export function usePirateBay(seed?: number): PiBayAPI {
  const stateRef = useRef<PiGameState>(piCreateInitialState(seed));
  const [, setTick] = useState(0);
  const tick = useCallback(() => setTick(v => v + 1), []);

  const piGetState = useCallback((): PiGameState => {
    return { ...stateRef.current };
  }, []);

  const piResetState = useCallback(() => {
    stateRef.current = piCreateInitialState(seed);
    tick();
  }, [seed, tick]);

  const piGetLevel = useCallback((): number => {
    return stateRef.current.player.level;
  }, []);

  const piGetTitle = useCallback((): string => {
    const level = stateRef.current.player.level;
    let title = PI_TITLE_THRESHOLDS[0].name;
    for (const t of PI_TITLE_THRESHOLDS) {
      if (level >= t.threshold) title = t.name;
    }
    return title;
  }, []);

  const piGetProgress = useCallback((): number => {
    return piXPProgress(stateRef.current.player.xp);
  }, []);

  const piAddXP = useCallback((amount: number): number => {
    const state = stateRef.current;
    state.player.xp += amount;
    const newLevel = Math.min(PI_MAX_LEVEL, piLevelFromXP(state.player.xp));
    const leveled = newLevel > state.player.level;
    state.player.level = newLevel;
    if (leveled) piCheckAchievementConditions(state);
    tick();
    return state.player.xp;
  }, [tick]);

  const piGetCoins = useCallback((): number => {
    return stateRef.current.player.coins;
  }, []);

  const piAddCoins = useCallback((amount: number) => {
    stateRef.current.player.coins += amount;
    piCheckAchievementConditions(stateRef.current);
    tick();
  }, [tick]);

  const piSpendCoins = useCallback((amount: number): boolean => {
    if (stateRef.current.player.coins < amount) return false;
    stateRef.current.player.coins -= amount;
    tick();
    return true;
  }, [tick]);

  const piGetReputation = useCallback((): number => {
    return stateRef.current.player.reputation;
  }, []);

  const piAddReputation = useCallback((amount: number) => {
    stateRef.current.player.reputation += amount;
    tick();
  }, [tick]);

  /* — Ships — */

  const piGetShips = useCallback((): PiOwnedShip[] => {
    return [...stateRef.current.ships];
  }, []);

  const piBuyShip = useCallback((shipId: string): boolean => {
    const state = stateRef.current;
    const shipType = PI_SHIPS.find(s => s.id === shipId);
    if (!shipType) return false;
    if (state.player.coins < shipType.baseCost) return false;
    state.player.coins -= shipType.baseCost;
    state.ships.push({ typeId: shipId, level: 1, currentHull: shipType.stats.hull });
    tick();
    return true;
  }, [tick]);

  const piGetActiveShip = useCallback((): (PiOwnedShip & { type: PiShipType }) | null => {
    const state = stateRef.current;
    const owned = state.ships[state.player.currentShipIndex];
    if (!owned) return null;
    return { ...owned, type: piGetShipType(owned.typeId) };
  }, []);

  const piUpgradeShip = useCallback((): boolean => {
    const state = stateRef.current;
    const ship = state.ships[state.player.currentShipIndex];
    if (!ship) return false;
    const shipType = piGetShipType(ship.typeId);
    const cost = Math.floor(shipType.baseCost * 0.3 * ship.level);
    if (ship.level >= 10) return false;
    if (state.player.coins < cost) return false;
    state.player.coins -= cost;
    ship.level++;
    ship.currentHull = piGetPlayerStats(state).hull;
    tick();
    return true;
  }, [tick]);

  const piGetShipStats = useCallback((): PiShipStats | null => {
    const state = stateRef.current;
    if (!state.ships[state.player.currentShipIndex]) return null;
    return piGetPlayerStats(state);
  }, []);

  const piGetShipCapacity = useCallback((): { crew: number; cargo: number } | null => {
    const state = stateRef.current;
    if (!state.ships[state.player.currentShipIndex]) return null;
    const stats = piGetPlayerStats(state);
    return { crew: stats.crewCapacity, cargo: stats.cargoCapacity };
  }, []);

  const piRepairShip = useCallback((): boolean => {
    const state = stateRef.current;
    const ship = state.ships[state.player.currentShipIndex];
    if (!ship) return false;
    const maxHull = piGetPlayerStats(state).hull;
    if (ship.currentHull >= maxHull) return false;
    const missing = maxHull - ship.currentHull;
    const cost = Math.max(1, Math.floor(missing * 0.5));
    if (state.player.coins < cost) return false;
    state.player.coins -= cost;
    ship.currentHull = maxHull;
    tick();
    return true;
  }, [tick]);

  /* — Crew — */

  const piGetCrew = useCallback((): PiOwnedCrew[] => {
    return [...stateRef.current.crew];
  }, []);

  const piHireCrew = useCallback((crewId: string): boolean => {
    const state = stateRef.current;
    const role = PI_CREW_ROLES.find(r => r.id === crewId);
    if (!role) return false;
    const shipStats = piGetPlayerStats(state);
    if (state.crew.length >= shipStats.crewCapacity) return false;
    if (state.player.coins < role.hireCost) return false;
    state.player.coins -= role.hireCost;
    state.crew.push({ roleId: crewId, morale: 80, experience: 0, health: 100 });
    state.totalCrewHired++;
    piIncrementDailyProgress(state, 'crew');
    piCheckAchievementConditions(state);
    tick();
    return true;
  }, [tick]);

  const piDismissCrew = useCallback((index: number): boolean => {
    const state = stateRef.current;
    if (index < 0 || index >= state.crew.length) return false;
    state.crew.splice(index, 1);
    tick();
    return true;
  }, [tick]);

  const piGetCrewStats = useCallback((): Record<string, number> => {
    const state = stateRef.current;
    return state.crew.reduce<Record<string, number>>((acc, c) => {
      const role = PI_CREW_ROLES.find(r => r.id === c.roleId);
      if (!role) return acc;
      for (const [skill, value] of Object.entries(role.skills)) {
        acc[skill] = (acc[skill] ?? 0) + Math.floor(value * (1 + c.experience * 0.01));
      }
      return acc;
    }, {});
  }, []);

  const piGetActiveCrew = useCallback((): PiOwnedCrew[] => {
    return [...stateRef.current.crew];
  }, []);

  const piGetAvailableCrew = useCallback((): PiCrewRole[] => {
    const state = stateRef.current;
    const ownedIds = new Set(state.crew.map(c => c.roleId));
    return PI_CREW_ROLES.filter(r => !ownedIds.has(r.id));
  }, []);

  const piGetCrewMorale = useCallback((): number => {
    const state = stateRef.current;
    if (state.crew.length === 0) return 0;
    const avg = state.crew.reduce((sum, c) => sum + c.morale, 0) / state.crew.length;
    return Math.floor(avg);
  }, []);

  const piRestCrew = useCallback(() => {
    const state = stateRef.current;
    const restCost = state.crew.length * 5;
    if (state.player.coins < restCost) return;
    state.player.coins -= restCost;
    for (const c of state.crew) {
      c.morale = Math.min(100, c.morale + 15);
      c.health = Math.min(100, c.health + 20);
      c.experience += 1;
    }
    tick();
  }, [tick]);

  /* — Islands — */

  const piGetIslands = useCallback((): PiIsland[] => {
    return PI_ISLANDS.map(island => ({
      ...island,
      resources: [...island.resources],
      connections: [...island.connections],
    }));
  }, []);

  const piSailToIsland = useCallback((islandId: string): boolean => {
    const state = stateRef.current;
    const currentIsland = PI_ISLANDS.find(i => i.id === state.player.currentIslandId);
    const targetIsland = PI_ISLANDS.find(i => i.id === islandId);
    if (!currentIsland || !targetIsland) return false;
    if (!currentIsland.connections.includes(islandId)) return false;
    if (state.battle?.result === 'active') return false;
    state.player.currentIslandId = islandId;
    if (!state.discoveredIslands.includes(islandId)) {
      state.discoveredIslands.push(islandId);
      piIncrementDailyProgress(state, 'explore');
      piCheckAchievementConditions(state);
    }
    state.dailyTask = piGenerateDailyTask(state);
    tick();
    return true;
  }, [tick]);

  const piExploreIsland = useCallback((): PiExploreResult => {
    const state = stateRef.current;
    const island = PI_ISLANDS.find(i => i.id === state.player.currentIslandId);
    if (!island) return { events: ['error'], coins: 0, xp: 0, mapsFound: [], message: 'No island found.' };
    state.explorationCount++;
    piIncrementDailyProgress(state, 'explore');
    const rng = () => piNextRandom(state);
    const luckBonus = Object.values(state.equipped).reduce((a, id) => {
      if (!id) return a;
      return a + (PI_EQUIPMENT.find(e => e.id === id)?.stats.luck ?? 0);
    }, 0);
    const luckMod = 1 + luckBonus * 0.03;
    const events: string[] = [];
    let totalCoins = 0;
    let totalXP = Math.floor(10 + island.dangerLevel * 5);
    const mapsFound: PiTreasureMap[] = [];
    const roll = rng();
    if (roll < 0.15 * luckMod) {
      const mapCoins = Math.floor(rng() * 50 + 20);
      totalCoins += mapCoins;
      events.push('Found a treasure map!');
      mapsFound.push({
        id: `map_${state.day}_${state.explorationCount}`,
        islandId: island.id,
        clue: `A weathered map points to buried treasure on ${island.name}.`,
        difficulty: island.dangerLevel,
      });
      state.treasureMaps.push(mapsFound[mapsFound.length - 1]);
    }
    if (rng() < 0.3) {
      const found = Math.floor(rng() * 30 + 10 + island.dangerLevel * 5);
      totalCoins += found;
      events.push(`Found ${found} coins in a hidden cache.`);
    }
    if (rng() < 0.2) {
      const res = island.resources[Math.floor(rng() * island.resources.length)];
      events.push(`Discovered valuable ${res} deposits.`);
      totalXP += 10;
    }
    if (rng() < island.dangerLevel * 0.04) {
      const dmg = Math.floor(rng() * island.dangerLevel * 5 + 5);
      const ship = state.ships[state.player.currentShipIndex];
      if (ship) {
        ship.currentHull = Math.max(1, ship.currentHull - dmg);
        events.push(`Encountered dangerous wildlife! Hull damaged by ${dmg}.`);
      }
    }
    if (rng() < 0.25) {
      const crewXP = Math.floor(rng() * 5 + 2);
      for (const c of state.crew) c.experience += crewXP;
      events.push(`The crew gained valuable experience exploring.`);
    }
    if (events.length === 0) {
      events.push('Explored the island but found nothing of note.');
    }
    state.player.coins += totalCoins;
    state.player.xp += totalXP;
    state.player.level = Math.min(PI_MAX_LEVEL, piLevelFromXP(state.player.xp));
    piCheckAchievementConditions(state);
    tick();
    return { events, coins: totalCoins, xp: totalXP, mapsFound, message: events.join(' ') };
  }, [tick]);

  const piGetDiscoveredIslands = useCallback((): string[] => {
    return [...stateRef.current.discoveredIslands];
  }, []);

  /* — Treasure — */

  const piGetTreasureMaps = useCallback((): PiTreasureMap[] => {
    return [...stateRef.current.treasureMaps];
  }, []);

  const piFollowMap = useCallback((mapIndex: number): boolean => {
    const state = stateRef.current;
    if (mapIndex < 0 || mapIndex >= state.treasureMaps.length) return false;
    state.activeMapIndex = mapIndex;
    tick();
    return true;
  }, [tick]);

  const piDigTreasure = useCallback((): PiDigResult => {
    const state = stateRef.current;
    if (state.activeMapIndex < 0 || state.activeMapIndex >= state.treasureMaps.length) {
      return { success: false, coins: 0, xp: 0, message: 'No active treasure map.' };
    }
    const map = state.treasureMaps[state.activeMapIndex];
    const rng = () => piNextRandom(state);
    const luckBonus = Object.values(state.equipped).reduce((a, id) => {
      if (!id) return a;
      return a + (PI_EQUIPMENT.find(e => e.id === id)?.stats.luck ?? 0);
    }, 0);
    const skillBonus = state.skills.find(s => s.skillId === 'archaeology')?.level ?? 0;
    const successChance = Math.min(0.95, 0.5 + luckBonus * 0.03 + skillBonus * 0.05 - map.difficulty * 0.03);
    if (rng() > successChance) {
      state.treasureMaps.splice(state.activeMapIndex, 1);
      state.activeMapIndex = -1;
      tick();
      return { success: false, coins: 0, xp: 5, message: 'Dug but found nothing. The map crumbles.' };
    }
    const baseCoins = 50 + map.difficulty * 30;
    const coinReward = Math.floor(baseCoins * (0.8 + rng() * 0.8));
    const xpReward = 20 + map.difficulty * 10;
    let foundEquipment: string | undefined;
    if (rng() < 0.15 + luckBonus * 0.01) {
      const eligible = PI_EQUIPMENT.filter(e => {
        const rarityChance: Record<string, number> = { common: 0.5, uncommon: 0.3, rare: 0.15, epic: 0.04, legendary: 0.01 };
        return rng() < (rarityChance[e.rarity] ?? 0.1);
      });
      if (eligible.length > 0) {
        foundEquipment = eligible[Math.floor(rng() * eligible.length)].id;
        if (foundEquipment && !state.ownedEquipment.includes(foundEquipment)) {
          state.ownedEquipment.push(foundEquipment);
        }
      }
    }
    state.player.coins += coinReward;
    state.player.xp += xpReward;
    state.player.level = Math.min(PI_MAX_LEVEL, piLevelFromXP(state.player.xp));
    state.totalTreasuresFound++;
    state.treasureMaps.splice(state.activeMapIndex, 1);
    state.activeMapIndex = -1;
    piCheckAchievementConditions(state);
    tick();
    return {
      success: true,
      coins: coinReward,
      xp: xpReward,
      equipment: foundEquipment,
      message: `Found ${coinReward} coins!${foundEquipment ? ` Also discovered ${foundEquipment}!` : ''}`,
    };
  }, [tick]);

  const piSellMap = useCallback((mapIndex: number): number => {
    const state = stateRef.current;
    if (mapIndex < 0 || mapIndex >= state.treasureMaps.length) return 0;
    const map = state.treasureMaps[mapIndex];
    const price = 20 + map.difficulty * 15;
    state.player.coins += price;
    state.treasureMaps.splice(mapIndex, 1);
    if (state.activeMapIndex === mapIndex) state.activeMapIndex = -1;
    else if (state.activeMapIndex > mapIndex) state.activeMapIndex--;
    tick();
    return price;
  }, [tick]);

  /* — Trading — */

  const piGetTradeGoods = useCallback((): PiTradeGoodType[] => {
    return PI_TRADE_GOODS.map(g => ({ ...g }));
  }, []);

  const piBuyGood = useCallback((goodId: string, quantity: number): boolean => {
    const state = stateRef.current;
    const good = PI_TRADE_GOODS.find(g => g.id === goodId);
    if (!good || quantity <= 0) return false;
    const price = piCalculatePrice(good, state.day, state.player.currentIslandId);
    const totalCost = price * quantity;
    const shipStats = piGetPlayerStats(state);
    const currentCargo = state.inventory.reduce((sum, i) => sum + i.quantity, 0);
    if (state.player.coins < totalCost) return false;
    if (currentCargo + quantity > shipStats.cargoCapacity) return false;
    state.player.coins -= totalCost;
    const existing = state.inventory.find(i => i.goodId === goodId);
    if (existing) {
      const oldQty = existing.quantity;
      existing.purchasePrice = Math.floor((existing.purchasePrice * oldQty + price * quantity) / (oldQty + quantity));
      existing.quantity += quantity;
    } else {
      state.inventory.push({ goodId, quantity, purchasePrice: price });
    }
    state.totalTrades++;
    piIncrementDailyProgress(state, 'trade');
    piCheckAchievementConditions(state);
    tick();
    return true;
  }, [tick]);

  const piSellGood = useCallback((goodId: string, quantity: number): number => {
    const state = stateRef.current;
    const good = PI_TRADE_GOODS.find(g => g.id === goodId);
    if (!good || quantity <= 0) return 0;
    const inv = state.inventory.find(i => i.goodId === goodId);
    if (!inv || inv.quantity < quantity) return 0;
    const sellPrice = piCalculatePrice(good, state.day, state.player.currentIslandId);
    const negotiationLevel = state.skills.find(s => s.skillId === 'negotiation')?.level ?? 0;
    const adjustedPrice = Math.floor(sellPrice * (1 + negotiationLevel * 0.05));
    const revenue = adjustedPrice * quantity;
    inv.quantity -= quantity;
    if (inv.quantity <= 0) {
      state.inventory = state.inventory.filter(i => i.quantity > 0);
    }
    state.player.coins += revenue;
    state.totalTrades++;
    piIncrementDailyProgress(state, 'trade');
    piCheckAchievementConditions(state);
    tick();
    return revenue;
  }, [tick]);

  const piGetPrices = useCallback((): Record<string, number> => {
    const state = stateRef.current;
    const prices: Record<string, number> = {};
    for (const good of PI_TRADE_GOODS) {
      prices[good.id] = piCalculatePrice(good, state.day, state.player.currentIslandId);
    }
    return prices;
  }, []);

  const piGetInventory = useCallback((): PiOwnedGood[] => {
    return stateRef.current.inventory.map(i => ({ ...i }));
  }, []);

  /* — Combat — */

  const piGetNavalBattle = useCallback((enemyId?: string): PiBattleResult => {
    const state = stateRef.current;
    if (state.battle?.result === 'active') {
      return {
        action: 'attack', playerDamage: 0, enemyDamage: 0,
        playerHull: state.battle.playerHull, enemyHull: state.battle.enemyHull,
        result: 'active',
      };
    }
    let enemy: PiEnemyType;
    if (enemyId) {
      const found = PI_ENEMIES.find(e => e.id === enemyId);
      if (!found) return { action: 'attack', playerDamage: 0, enemyDamage: 0, playerHull: 0, enemyHull: 0, result: 'lost' };
      enemy = found;
    } else {
      const eligible = PI_ENEMIES.filter(e => e.minLevel <= state.player.level);
      if (eligible.length === 0) enemy = PI_ENEMIES[0];
      else {
        const idx = Math.floor(piNextRandom(state) * eligible.length);
        enemy = eligible[idx];
      }
    }
    const playerStats = piGetPlayerStats(state);
    const ship = state.ships[state.player.currentShipIndex];
    state.battle = {
      enemyId: enemy.id,
      enemyHull: enemy.stats.hull,
      playerHull: ship?.currentHull ?? playerStats.hull,
      maxEnemyHull: enemy.stats.hull,
      maxPlayerHull: playerStats.hull,
      turn: 0,
      result: 'active',
    };
    tick();
    return {
      action: 'attack', playerDamage: 0, enemyDamage: 0,
      playerHull: state.battle.playerHull, enemyHull: state.battle.enemyHull,
      result: 'active',
      rewards: { coins: 0, xp: 0 },
    };
  }, [tick]);

  const piCalculateDamage = useCallback((firepower: number, defense: number): number => {
    const base = firepower * (1 + firepower * 0.05);
    const reduced = base * (100 / (100 + defense));
    return Math.max(1, Math.floor(reduced + piNextRandom(stateRef.current) * firepower * 0.3));
  }, []);

  const piAttack = useCallback((): PiBattleResult => {
    const state = stateRef.current;
    if (!state.battle || state.battle.result !== 'active') {
      return { action: 'attack', playerDamage: 0, enemyDamage: 0, playerHull: 0, enemyHull: 0, result: 'lost' };
    }
    const battle = state.battle;
    const enemy = PI_ENEMIES.find(e => e.id === battle.enemyId);
    if (!enemy) return { action: 'attack', playerDamage: 0, enemyDamage: 0, playerHull: 0, enemyHull: 0, result: 'lost' };
    const rng = () => piNextRandom(state);
    const playerStats = piGetPlayerStats(state);
    const swordLevel = state.skills.find(s => s.skillId === 'swordsmanship')?.level ?? 0;
    const cannonLevel = state.skills.find(s => s.skillId === 'cannons')?.level ?? 0;
    const moraleMod = state.crew.length > 0
      ? 1 + (state.crew.reduce((a, c) => a + c.morale, 0) / state.crew.length / 100 - 0.5) * 0.2
      : 1;
    const playerDmg = piCalculateDamage(
      playerStats.firepower + swordLevel * 2 + cannonLevel * 3,
      enemy.stats.hull * 0.1,
    );
    const critChance = 0.1 + swordLevel * 0.02;
    const finalPlayerDmg = Math.floor(playerDmg * moraleMod * (rng() < critChance ? 1.5 : 1));
    state.battle.enemyHull -= finalPlayerDmg;
    state.battle.turn++;
    if (state.battle.enemyHull <= 0) {
      state.battle.enemyHull = 0;
      state.battle.result = 'won';
      const luckBonus = Object.values(state.equipped).reduce((a, id) => {
        if (!id) return a;
        return a + (PI_EQUIPMENT.find(e => e.id === id)?.stats.luck ?? 0);
      }, 0);
      const lootCoins = Math.floor(
        (enemy.loot.coins[0] + rng() * (enemy.loot.coins[1] - enemy.loot.coins[0])) * (1 + luckBonus * 0.02)
      );
      const lootXP = Math.floor(enemy.loot.xp[0] + rng() * (enemy.loot.xp[1] - enemy.loot.xp[0]));
      state.player.coins += lootCoins;
      state.player.xp += lootXP;
      state.player.level = Math.min(PI_MAX_LEVEL, piLevelFromXP(state.player.xp));
      state.kills[enemy.id] = (state.kills[enemy.id] ?? 0) + 1;
      state.totalEnemiesDefeated++;
      piIncrementDailyProgress(state, 'combat');
      for (const loot of enemy.loot.goods) {
        if (rng() < loot.chance) {
          const qty = Math.floor(loot.quantity[0] + rng() * (loot.quantity[1] - loot.quantity[0]));
          const existing = state.inventory.find(i => i.goodId === loot.goodId);
          if (existing) existing.quantity += qty;
          else state.inventory.push({ goodId: loot.goodId, quantity: qty, purchasePrice: 0 });
        }
      }
      for (const c of state.crew) {
        c.experience += 2;
        c.morale = Math.min(100, c.morale + 3);
      }
      piCheckAchievementConditions(state);
      tick();
      return {
        action: 'attack', playerDamage: finalPlayerDmg, enemyDamage: 0,
        playerHull: state.battle.playerHull, enemyHull: 0,
        result: 'won', rewards: { coins: lootCoins, xp: lootXP },
      };
    }
    const enemyDmg = piCalculateDamage(enemy.stats.firepower, playerStats.hull * 0.08);
    const defenseLevel = state.skills.find(s => s.skillId === 'defense')?.level ?? 0;
    const mitigatedEnemyDmg = Math.max(1, Math.floor(enemyDmg * (1 - defenseLevel * 0.04)));
    if (!state.battle) return { action: 'attack', playerDamage: finalPlayerDmg, enemyDamage: 0, playerHull: 0, enemyHull: 0, result: 'lost' };
    state.battle.playerHull -= mitigatedEnemyDmg;
    for (const c of state.crew) {
      c.health = Math.max(0, c.health - Math.floor(rng() * 3));
      c.morale = Math.max(0, c.morale - 1);
    }
    if (state.battle.playerHull <= 0) {
      state.battle.playerHull = 0;
      state.battle.result = 'lost';
      const penalty = Math.floor(state.player.coins * 0.1);
      state.player.coins -= penalty;
      tick();
      return {
        action: 'attack', playerDamage: finalPlayerDmg, enemyDamage: mitigatedEnemyDmg,
        playerHull: 0, enemyHull: 0,
        result: 'lost',
      };
    }
    tick();
    return {
      action: 'attack', playerDamage: finalPlayerDmg, enemyDamage: mitigatedEnemyDmg,
      playerHull: state.battle.playerHull, enemyHull: state.battle.enemyHull,
      result: 'active',
    };
  }, [piCalculateDamage, tick]);

  const piDefend = useCallback((): PiBattleResult => {
    const state = stateRef.current;
    if (!state.battle || state.battle.result !== 'active') {
      return { action: 'defend', playerDamage: 0, enemyDamage: 0, playerHull: 0, enemyHull: 0, result: 'lost' };
    }
    const battle = state.battle;
    const enemy = PI_ENEMIES.find(e => e.id === battle.enemyId);
    if (!enemy) return { action: 'defend', playerDamage: 0, enemyDamage: 0, playerHull: 0, enemyHull: 0, result: 'lost' };
    const rng = () => piNextRandom(state);
    const playerStats = piGetPlayerStats(state);
    const defenseLevel = state.skills.find(s => s.skillId === 'defense')?.level ?? 0;
    const reductionFactor = 0.4 + defenseLevel * 0.05;
    const enemyDmg = piCalculateDamage(enemy.stats.firepower, playerStats.hull * 0.08);
    const mitigated = Math.max(1, Math.floor(enemyDmg * reductionFactor));
    state.battle.playerHull -= mitigated;
    const counterDmg = Math.max(1, Math.floor(playerStats.firepower * 0.3 * (0.5 + rng() * 0.5)));
    state.battle.enemyHull -= counterDmg;
    state.battle.turn++;
    if (!state.battle) return { action: 'defend', playerDamage: counterDmg, enemyDamage: mitigated, playerHull: 0, enemyHull: 0, result: 'lost' };
    if (state.battle.enemyHull <= 0) {
      state.battle.enemyHull = 0;
      state.battle.result = 'won';
      const lootCoins = Math.floor(enemy.loot.coins[0] + rng() * (enemy.loot.coins[1] - enemy.loot.coins[0]));
      const lootXP = Math.floor(enemy.loot.xp[0] + rng() * (enemy.loot.xp[1] - enemy.loot.xp[0]));
      state.player.coins += lootCoins;
      state.player.xp += lootXP;
      state.player.level = Math.min(PI_MAX_LEVEL, piLevelFromXP(state.player.xp));
      state.kills[enemy.id] = (state.kills[enemy.id] ?? 0) + 1;
      state.totalEnemiesDefeated++;
      piIncrementDailyProgress(state, 'combat');
      piCheckAchievementConditions(state);
      tick();
      return {
        action: 'defend', playerDamage: counterDmg, enemyDamage: mitigated,
        playerHull: state.battle.playerHull, enemyHull: 0,
        result: 'won', rewards: { coins: lootCoins, xp: lootXP },
      };
    }
    if (state.battle.playerHull <= 0) {
      state.battle.playerHull = 0;
      state.battle.result = 'lost';
      state.player.coins -= Math.floor(state.player.coins * 0.1);
      tick();
      return {
        action: 'defend', playerDamage: counterDmg, enemyDamage: mitigated,
        playerHull: 0, enemyHull: 0, result: 'lost',
      };
    }
    tick();
    return {
      action: 'defend', playerDamage: counterDmg, enemyDamage: mitigated,
      playerHull: state.battle.playerHull, enemyHull: state.battle.enemyHull,
      result: 'active',
    };
  }, [piCalculateDamage, tick]);

  const piFlee = useCallback((): PiBattleResult => {
    const state = stateRef.current;
    if (!state.battle || state.battle.result !== 'active') {
      return { action: 'flee', playerDamage: 0, enemyDamage: 0, playerHull: 0, enemyHull: 0, result: 'fled' };
    }
    const battle = state.battle;
    const enemy = PI_ENEMIES.find(e => e.id === battle.enemyId);
    if (!enemy) return { action: 'flee', playerDamage: 0, enemyDamage: 0, playerHull: 0, enemyHull: 0, result: 'fled' };
    const rng = () => piNextRandom(state);
    const playerStats = piGetPlayerStats(state);
    const sailingLevel = state.skills.find(s => s.skillId === 'sailing')?.level ?? 0;
    const fleeChance = Math.min(0.9, 0.3 + (playerStats.speed / (playerStats.speed + enemy.stats.speed)) * 0.4 + sailingLevel * 0.05);
    if (rng() < fleeChance) {
      state.battle.result = 'fled';
      tick();
      return {
        action: 'flee', playerDamage: 0, enemyDamage: 0,
        playerHull: state.battle.playerHull, enemyHull: state.battle.enemyHull,
        result: 'fled',
      };
    }
    const enemyDmg = piCalculateDamage(enemy.stats.firepower, playerStats.hull * 0.05);
    const finalDmg = Math.floor(enemyDmg * 1.3);
    if (!state.battle) return { action: 'flee', playerDamage: 0, enemyDamage: finalDmg, playerHull: 0, enemyHull: 0, result: 'lost' };
    state.battle.playerHull -= finalDmg;
    state.battle.turn++;
    if (state.battle.playerHull <= 0) {
      state.battle.playerHull = 0;
      state.battle.result = 'lost';
      state.player.coins -= Math.floor(state.player.coins * 0.1);
      tick();
      return {
        action: 'flee', playerDamage: 0, enemyDamage: finalDmg,
        playerHull: 0, enemyHull: 0, result: 'lost',
      };
    }
    tick();
    return {
      action: 'flee', playerDamage: 0, enemyDamage: finalDmg,
      playerHull: state.battle.playerHull, enemyHull: state.battle.enemyHull,
      result: 'active',
    };
  }, [piCalculateDamage, tick]);

  const piGetEnemyForLevel = useCallback((): PiEnemyType => {
    const state = stateRef.current;
    const eligible = PI_ENEMIES.filter(e => e.minLevel <= state.player.level + 3);
    if (eligible.length === 0) return PI_ENEMIES[0];
    const nearLevel = eligible.filter(e => Math.abs(e.minLevel - state.player.level) <= 5);
    const pool = nearLevel.length > 0 ? nearLevel : eligible;
    return pool[Math.floor(piNextRandom(state) * pool.length)];
  }, []);

  /* — Skills — */

  const piGetSkills = useCallback((): PiOwnedSkill[] => {
    return [...stateRef.current.skills];
  }, []);

  const piTrainSkill = useCallback((skillId: string): boolean => {
    const state = stateRef.current;
    const skillType = PI_SKILLS.find(s => s.id === skillId);
    if (!skillType) return false;
    let owned = state.skills.find(s => s.skillId === skillId);
    if (!owned) {
      if (state.skills.length >= 8) return false;
      owned = { skillId, level: 0, xp: 0 };
      state.skills.push(owned);
    }
    if (owned.level >= skillType.maxLevel) return false;
    const cost = Math.floor(skillType.trainCost * (1 + owned.level * 0.5));
    if (state.player.coins < cost) return false;
    state.player.coins -= cost;
    const rng = () => piNextRandom(state);
    const xpGain = Math.floor(20 + rng() * 15 + owned.level * 5);
    owned.xp += xpGain;
    const xpNeeded = Math.floor(30 + owned.level * 20 + owned.level * owned.level * 3);
    if (owned.xp >= xpNeeded) {
      owned.level++;
      owned.xp = 0;
      state.player.xp += 25;
      state.player.level = Math.min(PI_MAX_LEVEL, piLevelFromXP(state.player.xp));
    }
    piCheckAchievementConditions(state);
    tick();
    return true;
  }, [tick]);

  /* — Quests — */

  const piGetQuests = useCallback((): { available: PiQuestType[]; active: PiQuestType[]; completed: string[] } => {
    const state = stateRef.current;
    const available = PI_QUESTS.filter(q =>
      q.minLevel <= state.player.level &&
      !state.activeQuests.includes(q.id) &&
      !state.completedQuests.includes(q.id)
    );
    const active = PI_QUESTS.filter(q => state.activeQuests.includes(q.id));
    return { available, active, completed: [...state.completedQuests] };
  }, []);

  const piAcceptQuest = useCallback((questId: string): boolean => {
    const state = stateRef.current;
    const quest = PI_QUESTS.find(q => q.id === questId);
    if (!quest) return false;
    if (quest.minLevel > state.player.level) return false;
    if (state.activeQuests.includes(questId)) return false;
    if (state.completedQuests.includes(questId)) return false;
    if (state.activeQuests.length >= 5) return false;
    state.activeQuests.push(questId);
    tick();
    return true;
  }, [tick]);

  const piCompleteQuest = useCallback((questId: string): boolean => {
    const state = stateRef.current;
    const quest = PI_QUESTS.find(q => q.id === questId);
    if (!quest || !state.activeQuests.includes(questId)) return false;
    let completed = false;
    switch (quest.type) {
      case 'combat': {
        const kills = state.kills[quest.target] ?? 0;
        completed = kills >= quest.targetCount;
        break;
      }
      case 'explore': {
        if (quest.target === 'island') {
          completed = state.discoveredIslands.length >= quest.targetCount;
        } else {
          completed = state.discoveredIslands.includes(quest.target);
        }
        break;
      }
      case 'trade': {
        if (quest.target === 'trade') {
          completed = state.totalTrades >= quest.targetCount;
        } else {
          const traded = state.inventory.find(i => i.goodId === quest.target)?.quantity ?? 0;
          completed = traded >= quest.targetCount;
        }
        break;
      }
      case 'fetch': {
        const have = state.inventory.find(i => i.goodId === quest.target)?.quantity ?? 0;
        completed = have >= quest.targetCount;
        break;
      }
      case 'crew': {
        completed = state.totalCrewHired >= quest.targetCount;
        break;
      }
    }
    if (!completed) return false;
    state.activeQuests = state.activeQuests.filter(id => id !== questId);
    state.completedQuests.push(questId);
    state.player.coins += quest.rewardCoins;
    state.player.xp += quest.rewardXP;
    state.player.reputation += quest.rewardRep;
    state.player.level = Math.min(PI_MAX_LEVEL, piLevelFromXP(state.player.xp));
    piCheckAchievementConditions(state);
    tick();
    return true;
  }, [tick]);

  const piGetCompletedQuests = useCallback((): string[] => {
    return [...stateRef.current.completedQuests];
  }, []);

  /* — Equipment — */

  const piGetEquipment = useCallback((): PiEquipmentType[] => {
    return PI_EQUIPMENT.map(e => ({ ...e, stats: { ...e.stats } }));
  }, []);

  const piBuyEquipment = useCallback((equipId: string): boolean => {
    const state = stateRef.current;
    const equip = PI_EQUIPMENT.find(e => e.id === equipId);
    if (!equip) return false;
    if (state.player.coins < equip.cost) return false;
    state.player.coins -= equip.cost;
    if (!state.ownedEquipment.includes(equipId)) {
      state.ownedEquipment.push(equipId);
    }
    tick();
    return true;
  }, [tick]);

  const piEquipItem = useCallback((equipId: string): boolean => {
    const state = stateRef.current;
    const equip = PI_EQUIPMENT.find(e => e.id === equipId);
    if (!equip || !state.ownedEquipment.includes(equipId)) return false;
    state.equipped[equip.slot] = equipId;
    tick();
    return true;
  }, [tick]);

  const piGetOwnedEquipment = useCallback((): string[] => {
    return [...stateRef.current.ownedEquipment];
  }, []);

  const piGetEquippedItems = useCallback((): Record<string, string | null> => {
    return { ...stateRef.current.equipped };
  }, []);

  /* — Achievements — */

  const piGetAchievements = useCallback((): PiAchievementType[] => {
    return PI_ACHIEVEMENTS.map(a => ({ ...a }));
  }, []);

  const piCheckAchievements = useCallback((): string[] => {
    const state = stateRef.current;
    const newOnes = piCheckAchievementConditions(state);
    tick();
    return newOnes;
  }, [tick]);

  /* — Daily — */

  const piGetDailyTask = useCallback((): PiDailyTask | null => {
    const state = stateRef.current;
    if (!state.dailyTask) {
      state.dailyTask = piGenerateDailyTask(state);
    }
    return { ...state.dailyTask };
  }, []);

  const piClaimDailyReward = useCallback((): PiDailyRewardResult => {
    const state = stateRef.current;
    if (!state.dailyTask || state.dailyTask.claimed) {
      return { success: false, coins: 0, xp: 0, message: 'No reward to claim.' };
    }
    if (state.dailyTask.progress < state.dailyTask.target) {
      return { success: false, coins: 0, xp: 0, message: 'Daily task not yet completed.' };
    }
    state.dailyTask.claimed = true;
    state.player.coins += state.dailyTask.rewardCoins;
    state.player.xp += state.dailyTask.rewardXP;
    state.player.level = Math.min(PI_MAX_LEVEL, piLevelFromXP(state.player.xp));
    piCheckAchievementConditions(state);
    tick();
    return {
      success: true,
      coins: state.dailyTask.rewardCoins,
      xp: state.dailyTask.rewardXP,
      message: `Claimed ${state.dailyTask.rewardCoins} coins and ${state.dailyTask.rewardXP} XP!`,
    };
  }, [tick]);

  const piAdvanceDay = useCallback(() => {
    const state = stateRef.current;
    state.day++;
    state.dailyTask = piGenerateDailyTask(state);
    const dailyWages = state.crew.reduce((sum, c) => {
      const role = PI_CREW_ROLES.find(r => r.id === c.roleId);
      return sum + (role?.dailyWage ?? 5);
    }, 0);
    state.player.coins = Math.max(0, state.player.coins - dailyWages);
    for (const c of state.crew) {
      c.morale = Math.max(0, c.morale - 2);
      c.health = Math.min(100, c.health + 5);
    }
    tick();
  }, [tick]);

  /* — Utility — */

  const piGetPortInfo = useCallback((): PiPort | null => {
    const state = stateRef.current;
    const port = PI_PORTS.find(p => p.islandId === state.player.currentIslandId);
    return port ? { ...port, goodsAvailable: [...port.goodsAvailable], services: [...port.services] } : null;
  }, []);

  const piGetGameStateSummary = useCallback((): PiGameSummary => {
    const state = stateRef.current;
    const level = state.player.level;
    let title = PI_TITLE_THRESHOLDS[0].name;
    for (const t of PI_TITLE_THRESHOLDS) {
      if (level >= t.threshold) title = t.name;
    }
    const ship = state.ships[state.player.currentShipIndex];
    return {
      level,
      title,
      coins: state.player.coins,
      reputation: state.player.reputation,
      shipName: ship ? piGetShipType(ship.typeId).name : 'None',
      crewCount: state.crew.length,
      islandsDiscovered: state.discoveredIslands.length,
      enemiesDefeated: state.totalEnemiesDefeated,
      day: state.day,
    };
  }, []);

  return {
    piGetState, piResetState, piGetLevel, piGetTitle, piGetProgress,
    piAddXP, piGetCoins, piAddCoins, piSpendCoins, piGetReputation,
    piAddReputation, piGetShips, piBuyShip, piGetActiveShip, piUpgradeShip,
    piGetShipStats, piGetShipCapacity, piRepairShip, piGetCrew, piHireCrew,
    piDismissCrew, piGetCrewStats, piGetActiveCrew, piGetAvailableCrew,
    piGetCrewMorale, piRestCrew, piGetIslands, piSailToIsland, piExploreIsland,
    piGetDiscoveredIslands, piGetTreasureMaps, piFollowMap, piDigTreasure,
    piSellMap, piGetTradeGoods, piBuyGood, piSellGood, piGetPrices,
    piGetInventory, piGetNavalBattle, piAttack, piDefend, piFlee,
    piGetEnemyForLevel, piCalculateDamage, piGetSkills, piTrainSkill,
    piGetQuests, piAcceptQuest, piCompleteQuest, piGetCompletedQuests,
    piGetEquipment, piBuyEquipment, piEquipItem, piGetOwnedEquipment,
    piGetEquippedItems, piGetAchievements, piCheckAchievements,
    piGetDailyTask, piClaimDailyReward, piAdvanceDay, piGetPortInfo,
    piGetGameStateSummary,
  };
}
