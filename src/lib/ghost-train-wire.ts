import { useState, useCallback, useRef } from 'react';

// ============================================================
// Ghost Train — Haunted Railway Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type GhostRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type QuestType = 'transport' | 'collect' | 'explore' | 'negotiate' | 'haunt';
export type DailyType = 'transport' | 'collect' | 'explore' | 'negotiate';

export interface GhostTypeDef {
  id: string;
  name: string;
  rarity: GhostRarity;
  description: string;
  emoji: string;
  fare: number;
  xpReward: number;
  hauntPower: number;
  preferredCarriage: string;
  requiredLevel: number;
}

export interface CarriageDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxCapacity: number;
  baseComfortBonus: number;
  baseSpeedBonus: number;
  maxLevel: number;
  baseUpgradeCost: number;
}

export interface StationDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseReputationBonus: number;
  baseUpgradeCost: number;
  connections: string[];
  requiredLevel: number;
  dangerLevel: number;
}

export interface ArtifactDef {
  id: string;
  name: string;
  rarity: GhostRarity;
  description: string;
  emoji: string;
  cost: number;
  effect: string;
  requiredLevel: number;
}

export interface ConductorAbilityDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  bonusType: 'speed' | 'comfort' | 'capacity' | 'haunt';
  baseBonusValue: number;
  baseUpgradeCost: number;
  cooldown: number;
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
  key: GhostRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface PassengerJob {
  id: string;
  ghostId: string;
  boardedAt: number;
  destinationId: string;
  farePaid: number;
  satisfaction: number;
  carriageId: string;
}

export interface RouteLeg {
  stationId: string;
  departAt: number;
  arriveAt: number;
}

export interface PlannedRoute {
  id: string;
  legs: RouteLeg[];
  totalDistance: number;
  totalTime: number;
  fare: number;
}

export interface EncounterResult {
  ghostId: string;
  ghostName: string;
  rarity: GhostRarity;
  outcome: 'befriended' | 'negotiated' | 'fleed' | 'failed';
  coinsEarned: number;
  xpEarned: number;
  spiritEnergy: number;
  wasNew: boolean;
}

export interface CarriageState {
  id: string;
  level: number;
}

export interface StationState {
  id: string;
  level: number;
}

export interface AbilityState {
  id: string;
  level: number;
  equipped: boolean;
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

export interface GhostTrainState {
  level: number;
  xp: number;
  coins: number;
  ectoplasm: number;
  spiritEnergy: number;
  unlockedGhosts: string[];
  currentStation: string;
  currentRoute: PlannedRoute | null;
  passengers: PassengerJob[];
  artifacts: Record<string, number>;
  reputation: number;
  reputationTitle: string;
  totalPassengers: number;
  totalFareCollected: number;
  totalEarned: number;
  totalSpent: number;
  totalDistanceTraveled: number;
  stationsVisited: string[];
  ghostsBefriended: number;
  ghostsNegotiated: number;
  encountersCompleted: number;
  dailyStreak: number;
  lastDaily: string | null;
  activeQuests: QuestState[];
  completedQuests: string[];
  unlockedAchievements: AchievementState[];
  carriages: CarriageState[];
  stations: StationState[];
  abilities: AbilityState[];
  seed: number;
  ghostCountByRarity: Record<GhostRarity, number>;
  artifactCountByRarity: Record<GhostRarity, number>;
  carriageUpgradeCount: number;
  abilityUpgradeCount: number;
  stationUpgradeCount: number;
  dailyTask: DailyTaskState | null;
  hauntedJourneys: number;
  title: string;
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

function gtHashString(str: string): number {
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
  if (level >= GT_MAX_LEVEL) return Infinity;
  return Math.floor(80 * level * (1 + level * 0.15));
}

function clampLevel(lvl: number): number {
  return Math.max(1, Math.min(GT_MAX_LEVEL, lvl));
}

function clampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function generateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function rarityMultiplier(r: GhostRarity): number {
  const map: Record<GhostRarity, number> = {
    common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5,
  };
  return map[r] ?? 1;
}

// ============================================================
// Constants
// ============================================================

export const GT_MAX_LEVEL = 45;

export const GT_CARRIAGES_COUNT = 8;

export const GT_MAX_PASSENGERS = 24;

export const GT_MAX_ACTIVE_QUESTS = 5;

export const GT_STARTING_COINS = 150;

export const GT_STARTING_ECTOPLASM = 20;

export const GT_RARITIES: RarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#A78BFA', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#F472B6', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
];

export const GT_TITLE_THRESHOLDS: TitleInfo[] = [
  { name: 'Ticket Collector', levelRequired: 1, description: 'A humble beginning on the haunted railway' },
  { name: 'Station Attendant', levelRequired: 5, description: 'Learning the spectral routes and phantom timetables' },
  { name: 'Signal Keeper', levelRequired: 10, description: 'You can read the ghostly signals in the fog' },
  { name: 'Night Conductor', levelRequired: 16, description: 'The spirits trust you with their midnight journeys' },
  { name: 'Spirit Engineer', levelRequired: 23, description: 'You maintain the engines that run on ectoplasm and dreams' },
  { name: 'Phantom Steward', levelRequired: 31, description: 'Even wraiths bow when you walk the corridors' },
  { name: 'Ghost Captain', levelRequired: 39, description: 'Commander of the most haunted train on the rails' },
  { name: 'Phantom Engineer', levelRequired: 45, description: 'Master of all spectral railways, living and dead' },
];

export const GT_REPUTATION_TITLES: string[] = [
  'Unknown Spirit', 'Whisper', 'Apparition', 'Specter', 'Wraith Lord', 'Phantom Legend',
];

// ---- 30 Ghost Types ----

export const GT_GHOSTS: GhostTypeDef[] = [
  // Common (8)
  { id: 'poltergeist', name: 'Poltergeist', rarity: 'common', description: 'A mischievous spirit that rattles luggage and flickers lights', emoji: '👻', fare: 5, xpReward: 8, hauntPower: 10, preferredCarriage: 'lounge', requiredLevel: 1 },
  { id: 'shade', name: 'Shade', rarity: 'common', description: 'A shadowy figure that drifts silently between seats', emoji: '🌑', fare: 4, xpReward: 7, hauntPower: 8, preferredCarriage: 'sleeper', requiredLevel: 1 },
  { id: 'will_o_wisp', name: 'Will-o\'-Wisp', rarity: 'common', description: 'A flickering light that leads passengers astray', emoji: '✨', fare: 5, xpReward: 6, hauntPower: 12, preferredCarriage: 'observatory', requiredLevel: 1 },
  { id: 'whisper', name: 'Whisper', rarity: 'common', description: 'Speaks only in hushed tones of forgotten stations', emoji: '🌫️', fare: 3, xpReward: 5, hauntPower: 6, preferredCarriage: 'lounge', requiredLevel: 1 },
  { id: 'mist_walker', name: 'Mist Walker', rarity: 'common', description: 'Materializes from fog, seems surprised to be on a train', emoji: '🌫️', fare: 4, xpReward: 7, hauntPower: 9, preferredCarriage: 'sleeper', requiredLevel: 1 },
  { id: 'echo', name: 'Echo', rarity: 'common', description: 'Repeats the last words spoken near it, forever', emoji: '🗣️', fare: 3, xpReward: 5, hauntPower: 5, preferredCarriage: 'lounge', requiredLevel: 1 },
  { id: 'frost_wisp', name: 'Frost Wisp', rarity: 'common', description: 'A cold presence that leaves frost on the windows', emoji: '❄️', fare: 4, xpReward: 6, hauntPower: 7, preferredCarriage: 'observatory', requiredLevel: 1 },
  { id: 'lantern_bearer', name: 'Lantern Bearer', rarity: 'common', description: 'Carries a ghostly lantern that never dims', emoji: '🏮', fare: 5, xpReward: 8, hauntPower: 10, preferredCarriage: 'dining', requiredLevel: 1 },
  // Uncommon (7)
  { id: 'banshee', name: 'Banshee', rarity: 'uncommon', description: 'A mournful spirit whose wail predicts arrivals', emoji: '😱', fare: 10, xpReward: 15, hauntPower: 18, preferredCarriage: 'sleeper', requiredLevel: 3 },
  { id: 'specter', name: 'Specter', rarity: 'uncommon', description: 'A translucent figure always staring out the window', emoji: '👤', fare: 8, xpReward: 12, hauntPower: 15, preferredCarriage: 'lounge', requiredLevel: 3 },
  { id: 'wisp_mother', name: 'Wisp Mother', rarity: 'uncommon', description: 'Surrounded by a swarm of tiny will-o\'-wisps', emoji: '🌟', fare: 12, xpReward: 18, hauntPower: 20, preferredCarriage: 'observatory', requiredLevel: 4 },
  { id: 'bogie', name: 'Bogie', rarity: 'uncommon', description: 'Hides under seats and snatches loose coins', emoji: '🙈', fare: 7, xpReward: 10, hauntPower: 14, preferredCarriage: 'cargo', requiredLevel: 3 },
  { id: 'chain_rattler', name: 'Chain Rattler', rarity: 'uncommon', description: 'Dragged here by mysterious chains, seeks passage', emoji: '⛓️', fare: 9, xpReward: 14, hauntPower: 16, preferredCarriage: 'cargo', requiredLevel: 4 },
  { id: 'clockwork_spirit', name: 'Clockwork Spirit', rarity: 'uncommon', description: 'Moves in precise mechanical patterns, never off-schedule', emoji: '⚙️', fare: 11, xpReward: 16, hauntPower: 13, preferredCarriage: 'engine', requiredLevel: 5 },
  { id: 'ink_spirit', name: 'Ink Spirit', rarity: 'uncommon', description: 'A living stain that absorbs stories from passengers', emoji: '🖋️', fare: 8, xpReward: 13, hauntPower: 17, preferredCarriage: 'lounge', requiredLevel: 4 },
  // Rare (6)
  { id: 'wraith', name: 'Wraith', rarity: 'rare', description: 'A powerful undead spirit seeking vengeance across the rails', emoji: '💀', fare: 22, xpReward: 30, hauntPower: 30, preferredCarriage: 'vip', requiredLevel: 8 },
  { id: 'phantom', name: 'Phantom', rarity: 'rare', description: 'An elegant ghost in Victorian attire, tipped with ghostly currency', emoji: '🎩', fare: 25, xpReward: 35, hauntPower: 28, preferredCarriage: 'vip', requiredLevel: 9 },
  { id: 'doppelganger', name: 'Doppelganger', rarity: 'rare', description: 'Mimics passengers perfectly, unsettling the crew', emoji: '🪞', fare: 20, xpReward: 28, hauntPower: 32, preferredCarriage: 'lounge', requiredLevel: 10 },
  { id: 'howling_spirit', name: 'Howling Spirit', rarity: 'rare', description: 'Its cries echo through tunnels, shaking the carriages', emoji: '🐺', fare: 18, xpReward: 25, hauntPower: 35, preferredCarriage: 'sleeper', requiredLevel: 8 },
  { id: 'void_stalker', name: 'Void Stalker', rarity: 'rare', description: 'Exists between dimensions, only partially visible', emoji: '🕳️', fare: 24, xpReward: 32, hauntPower: 33, preferredCarriage: 'observatory', requiredLevel: 11 },
  { id: 'storm_specter', name: 'Storm Specter', rarity: 'rare', description: 'Gathers electrical energy from passing storms', emoji: '⛈️', fare: 21, xpReward: 29, hauntPower: 31, preferredCarriage: 'engine', requiredLevel: 10 },
  // Epic (5)
  { id: 'lamented_queen', name: 'Lamented Queen', rarity: 'epic', description: 'A spectral monarch travelling to her forgotten kingdom', emoji: '👑', fare: 50, xpReward: 65, hauntPower: 50, preferredCarriage: 'vip', requiredLevel: 18 },
  { id: 'necromancer_ghost', name: 'Necromancer Ghost', rarity: 'epic', description: 'Raises small spectral animals as company during trips', emoji: '🧙‍♀️', fare: 45, xpReward: 60, hauntPower: 55, preferredCarriage: 'lounge', requiredLevel: 20 },
  { id: 'dreamweaver', name: 'Dreamweaver', rarity: 'epic', description: 'Weaves nightmares and pleasant dreams for sleeping passengers', emoji: '🕸️', fare: 48, xpReward: 62, hauntPower: 48, preferredCarriage: 'sleeper', requiredLevel: 19 },
  { id: 'time_phantom', name: 'Time Phantom', rarity: 'epic', description: 'Exists simultaneously in multiple time periods', emoji: '⏰', fare: 55, xpReward: 70, hauntPower: 52, preferredCarriage: 'observatory', requiredLevel: 22 },
  { id: 'soul_collector', name: 'Soul Collector', rarity: 'epic', description: 'Gently gathers lost soul fragments during the journey', emoji: '🔮', fare: 52, xpReward: 68, hauntPower: 58, preferredCarriage: 'cargo', requiredLevel: 21 },
  // Legendary (4)
  { id: 'headless_conductor', name: 'Headless Conductor', rarity: 'legendary', description: 'An ancient conductor who lost more than his hat', emoji: '🎩', fare: 120, xpReward: 150, hauntPower: 80, preferredCarriage: 'engine', requiredLevel: 30 },
  { id: 'celestial_phantom', name: 'Celestial Phantom', rarity: 'legendary', description: 'A being of pure starlight riding the midnight express', emoji: '⭐', fare: 130, xpReward: 165, hauntPower: 75, preferredCarriage: 'observatory', requiredLevel: 33 },
  { id: 'ancient_leviathan_spirit', name: 'Ancient Leviathan Spirit', rarity: 'legendary', description: 'The ghost of a sea serpent that followed tracks inland', emoji: '🌊', fare: 140, xpReward: 175, hauntPower: 85, preferredCarriage: 'aquarium', requiredLevel: 35 },
  { id: 'doom_engine', name: 'Doom Engine', rarity: 'legendary', description: 'A sentient ghostly locomotive seeking its lost cars', emoji: '🚂', fare: 150, xpReward: 180, hauntPower: 90, preferredCarriage: 'engine', requiredLevel: 38 },
];

// ---- 8 Train Carriages ----

export const GT_CARRIAGES: CarriageDef[] = [
  { id: 'engine', name: 'Phantom Engine', description: 'The spectral locomotive powered by ectoplasm and willpower', emoji: '🚂', maxCapacity: 4, maxLevel: 10, baseComfortBonus: 0, baseSpeedBonus: 1.0, baseUpgradeCost: 120 },
  { id: 'dining', name: 'Dining Car', description: 'Serves ghostly delicacies and ethereal beverages', emoji: '🍽️', maxCapacity: 6, maxLevel: 10, baseComfortBonus: 10, baseSpeedBonus: 0.9, baseUpgradeCost: 100 },
  { id: 'sleeper', name: 'Sleeper Car', description: 'Eternal rest for weary spirits on long journeys', emoji: '🛏️', maxCapacity: 8, maxLevel: 10, baseComfortBonus: 15, baseSpeedBonus: 0.85, baseUpgradeCost: 110 },
  { id: 'lounge', name: 'Spirit Lounge', description: 'A haunted parlor where ghosts share tales of the living', emoji: '🛋️', maxCapacity: 6, maxLevel: 10, baseComfortBonus: 12, baseSpeedBonus: 0.95, baseUpgradeCost: 105 },
  { id: 'cargo', name: 'Ethereal Cargo', description: 'Carries cursed artifacts and enchanted freight', emoji: '📦', maxCapacity: 4, maxLevel: 10, baseComfortBonus: 3, baseSpeedBonus: 1.05, baseUpgradeCost: 90 },
  { id: 'vip', name: 'VIP Phantom Suite', description: 'Luxury accommodations for distinguished specters', emoji: '💎', maxCapacity: 3, maxLevel: 10, baseComfortBonus: 25, baseSpeedBonus: 0.9, baseUpgradeCost: 200 },
  { id: 'aquarium', name: 'Haunted Aquarium', description: 'Contains ghost fish swimming through spectral waters', emoji: '🐠', maxCapacity: 5, maxLevel: 10, baseComfortBonus: 8, baseSpeedBonus: 0.92, baseUpgradeCost: 130 },
  { id: 'observatory', name: 'Star Observatory', description: 'A glass-domed carriage for stargazing spirits', emoji: '🔭', maxCapacity: 4, maxLevel: 10, baseComfortBonus: 18, baseSpeedBonus: 0.88, baseUpgradeCost: 150 },
];

// ---- 12 Phantom Stations ----

export const GT_STATIONS: StationDef[] = [
  { id: 'graveyard_terminal', name: 'Graveyard Terminal', description: 'The starting station, built atop an ancient cemetery', emoji: '⚰️', maxLevel: 10, baseReputationBonus: 5, baseUpgradeCost: 100, connections: ['phantom_crossing', 'shadow_depot', 'mist_bridge'], requiredLevel: 1, dangerLevel: 1 },
  { id: 'phantom_crossing', name: 'Phantom Crossing', description: 'A junction where ghostly tracks overlap with the living world', emoji: '🔀', maxLevel: 10, baseReputationBonus: 8, baseUpgradeCost: 120, connections: ['graveyard_terminal', 'wraith_stop', 'specter_plaza'], requiredLevel: 1, dangerLevel: 2 },
  { id: 'shadow_depot', name: 'Shadow Depot', description: 'A dark maintenance depot where ghost trains are repaired', emoji: '🏢', maxLevel: 10, baseReputationBonus: 6, baseUpgradeCost: 110, connections: ['graveyard_terminal', 'echo_tunnel', 'fog_junction'], requiredLevel: 2, dangerLevel: 2 },
  { id: 'wraith_stop', name: 'Wraith Stop', description: 'A small platform where wraiths gather on moonless nights', emoji: '👤', maxLevel: 10, baseReputationBonus: 10, baseUpgradeCost: 140, connections: ['phantom_crossing', 'spirit_gate', 'mist_bridge'], requiredLevel: 5, dangerLevel: 4 },
  { id: 'specter_plaza', name: 'Specter Plaza', description: 'A grand station bustling with spectral passengers', emoji: '🏛️', maxLevel: 10, baseReputationBonus: 12, baseUpgradeCost: 160, connections: ['phantom_crossing', 'haunted_market', 'spirit_gate'], requiredLevel: 8, dangerLevel: 3 },
  { id: 'echo_tunnel', name: 'Echo Tunnel Station', description: 'Built inside a tunnel where voices repeat endlessly', emoji: '🕳️', maxLevel: 10, baseReputationBonus: 9, baseUpgradeCost: 130, connections: ['shadow_depot', 'forgotten_crypt', 'fog_junction'], requiredLevel: 6, dangerLevel: 5 },
  { id: 'mist_bridge', name: 'Mist Bridge Terminal', description: 'A station on a bridge perpetually shrouded in fog', emoji: '🌉', maxLevel: 10, baseReputationBonus: 11, baseUpgradeCost: 150, connections: ['graveyard_terminal', 'wraith_stop', 'soul_pier'], requiredLevel: 4, dangerLevel: 3 },
  { id: 'spirit_gate', name: 'Spirit Gate', description: 'A threshold between the living world and the afterlife', emoji: '🚪', maxLevel: 10, baseReputationBonus: 15, baseUpgradeCost: 200, connections: ['wraith_stop', 'specter_plaza', 'banshee_cove', 'soul_pier'], requiredLevel: 12, dangerLevel: 6 },
  { id: 'haunted_market', name: 'Haunted Market Station', description: 'Connected to a bazaar selling cursed curiosities', emoji: '🏪', maxLevel: 10, baseReputationBonus: 13, baseUpgradeCost: 170, connections: ['specter_plaza', 'forgotten_crypt', 'phantom_peak'], requiredLevel: 10, dangerLevel: 4 },
  { id: 'fog_junction', name: 'Fog Junction', description: 'Where three ghostly lines converge in impenetrable mist', emoji: '🌫️', maxLevel: 10, baseReputationBonus: 10, baseUpgradeCost: 145, connections: ['shadow_depot', 'echo_tunnel', 'banshee_cove'], requiredLevel: 7, dangerLevel: 5 },
  { id: 'soul_pier', name: 'Soul Pier', description: 'A waterfront station where departed souls await ferries', emoji: '⚓', maxLevel: 10, baseReputationBonus: 14, baseUpgradeCost: 180, connections: ['mist_bridge', 'spirit_gate', 'phantom_peak'], requiredLevel: 15, dangerLevel: 7 },
  { id: 'phantom_peak', name: 'Phantom Peak', description: 'The final station atop a mountain of crystallized spirit energy', emoji: '⛰️', maxLevel: 10, baseReputationBonus: 20, baseUpgradeCost: 250, connections: ['haunted_market', 'soul_pier'], requiredLevel: 20, dangerLevel: 8 },
];

// ---- 20 Supernatural Artifacts ----

export const GT_ARTIFACTS: ArtifactDef[] = [
  { id: 'ghost_lantern', name: 'Ghost Lantern', rarity: 'common', description: 'Illuminates hidden spectral paths', emoji: '🏮', cost: 10, effect: '+5 spirit energy per journey', requiredLevel: 1 },
  { id: 'spirit_compass', name: 'Spirit Compass', rarity: 'common', description: 'Points toward the nearest ghost hotspot', emoji: '🧭', cost: 12, effect: '+3% encounter chance', requiredLevel: 1 },
  { id: 'phantom_ticket', name: 'Phantom Ticket', rarity: 'common', description: 'A ticket stub from a haunted journey, attracts spirits', emoji: '🎫', cost: 8, effect: '+2 passenger capacity', requiredLevel: 1 },
  { id: 'ectoplasm_vial', name: 'Ectoplasm Vial', rarity: 'common', description: 'A vial of shimmering green ectoplasm', emoji: '🧪', cost: 6, effect: 'Fuel for the Phantom Engine', requiredLevel: 1 },
  { id: 'wraith_chain', name: 'Wraith Chain', rarity: 'uncommon', description: 'A broken chain link that hums with spectral energy', emoji: '⛓️', cost: 25, effect: '+8% fare bonus', requiredLevel: 3 },
  { id: 'spectral_monocle', name: 'Spectral Monocle', rarity: 'uncommon', description: 'Allows you to see ghost auras clearly', emoji: '🧐', cost: 28, effect: '+5% negotiation success', requiredLevel: 4 },
  { id: 'haunted_pocket_watch', name: 'Haunted Pocket Watch', rarity: 'uncommon', description: 'Runs backward at midnight, speeds journeys', emoji: '⌚', cost: 22, effect: '+10% travel speed', requiredLevel: 3 },
  { id: 'soul_crystal', name: 'Soul Crystal', rarity: 'uncommon', description: 'Contains a trapped soul that whispers advice', emoji: '💎', cost: 30, effect: '+5 XP per passenger', requiredLevel: 5 },
  { id: 'phantom_conductor_hat', name: 'Phantom Conductor Hat', rarity: 'rare', description: 'Grants authority over lesser spirits', emoji: '🎩', cost: 55, effect: '+10% haunt power', requiredLevel: 8 },
  { id: 'cursed_rail_spike', name: 'Cursed Rail Spike', rarity: 'rare', description: 'A rail spike from a cursed railway, carries dark power', emoji: '🔩', cost: 50, effect: '+15% encounter rewards', requiredLevel: 9 },
  { id: 'ghost_whistle', name: 'Ghost Whistle', rarity: 'rare', description: 'Summons distant spirits with an otherworldly tone', emoji: '📯', cost: 48, effect: '+8% new ghost discovery', requiredLevel: 10 },
  { id: 'shadow_ticket_punch', name: 'Shadow Ticket Punch', rarity: 'rare', description: 'Punches tickets with spectral ink', emoji: '🎟️', cost: 52, effect: '+12% passenger satisfaction', requiredLevel: 8 },
  { id: 'specter_engine_key', name: 'Specter Engine Key', rarity: 'epic', description: 'Unlocks hidden power in the Phantom Engine', emoji: '🔑', cost: 100, effect: '+20% travel speed', requiredLevel: 18 },
  { id: 'banshee_tear_vial', name: 'Banshee Tear Vial', rarity: 'epic', description: 'Tears of a banshee, incredibly potent spirit fuel', emoji: '💧', cost: 95, effect: '+25 spirit energy per journey', requiredLevel: 20 },
  { id: 'phantom_manifest', name: 'Phantom Manifest', rarity: 'epic', description: 'A ledger of all souls who ever rode the ghost train', emoji: '📋', cost: 110, effect: '+15% reputation gain', requiredLevel: 19 },
  { id: 'wraith_crown_shard', name: 'Wraith Crown Shard', rarity: 'epic', description: 'A fragment of the Wraith Lord\'s crown', emoji: '👁️', cost: 105, effect: '+10% all rewards', requiredLevel: 22 },
  { id: 'doom_bell_fragment', name: 'Doom Bell Fragment', rarity: 'epic', description: 'A piece of the bell that announces the end of all lines', emoji: '🔔', cost: 120, effect: 'Summon legendary ghost encounters', requiredLevel: 21 },
  { id: 'eternal_timetable', name: 'Eternal Timetable', rarity: 'legendary', description: 'Shows every journey past, present, and future', emoji: '📜', cost: 250, effect: '+30% all rewards', requiredLevel: 30 },
  { id: 'ghost_train_blueprint', name: 'Ghost Train Blueprint', rarity: 'legendary', description: 'Original plans for the first haunted locomotive', emoji: '📐', cost: 280, effect: '+50% carriage capacity', requiredLevel: 35 },
  { id: 'soulbound_conductor_badge', name: 'Soulbound Conductor Badge', rarity: 'legendary', description: 'Marks you as the true master of the spectral railway', emoji: '🏅', cost: 350, effect: '+20% reputation gain, +20% XP gain', requiredLevel: 40 },
];

// ---- 8 Conductor Abilities ----

export const GT_ABILITIES: ConductorAbilityDef[] = [
  { id: 'apparition_shift', name: 'Apparition Shift', description: 'Temporarily phase through obstacles on the track', emoji: '👻', maxLevel: 10, bonusType: 'speed', baseBonusValue: 5, baseUpgradeCost: 60, cooldown: 3 },
  { id: 'spectral_boost', name: 'Spectral Boost', description: 'Supercharge the engine with raw spectral energy', emoji: '⚡', maxLevel: 10, bonusType: 'speed', baseBonusValue: 7, baseUpgradeCost: 80, cooldown: 5 },
  { id: 'soul_lantern', name: 'Soul Lantern', description: 'Light the way to attract friendly spirits', emoji: '🏮', maxLevel: 10, bonusType: 'comfort', baseBonusValue: 6, baseUpgradeCost: 70, cooldown: 4 },
  { id: 'haunt_aura', name: 'Haunt Aura', description: 'Surround the train with a terrifying ghostly presence', emoji: '💀', maxLevel: 10, bonusType: 'haunt', baseBonusValue: 8, baseUpgradeCost: 90, cooldown: 6 },
  { id: 'phantom_brakes', name: 'Phantom Brakes', description: 'Stop instantly to avoid supernatural hazards', emoji: '🛑', maxLevel: 10, bonusType: 'comfort', baseBonusValue: 5, baseUpgradeCost: 50, cooldown: 2 },
  { id: 'spirit_cargo_expand', name: 'Spirit Cargo Expand', description: 'Expand carriage capacity with ethereal space', emoji: '📦', maxLevel: 10, bonusType: 'capacity', baseBonusValue: 4, baseUpgradeCost: 65, cooldown: 4 },
  { id: 'wraith_speed', name: 'Wraith Speed', description: 'Channel wraith energy for blistering speed', emoji: '💨', maxLevel: 10, bonusType: 'speed', baseBonusValue: 9, baseUpgradeCost: 100, cooldown: 7 },
  { id: 'comforting_presence', name: 'Comforting Presence', description: 'Calm restless spirits with your soothing aura', emoji: '🌟', maxLevel: 10, bonusType: 'comfort', baseBonusValue: 7, baseUpgradeCost: 75, cooldown: 3 },
];

// ---- 10 Quests ----

export const GT_QUESTS: QuestDef[] = [
  { id: 'quest_first_journey', name: 'First Journey', description: 'Transport 3 passengers to prove your worth as a conductor', type: 'transport', target: 3, rewardCoins: 80, rewardXP: 40, requiredLevel: 1, emoji: '🚂' },
  { id: 'quest_spirit_collector', name: 'Spirit Collector', description: 'Befriend 10 different ghost types', type: 'collect', target: 10, rewardCoins: 150, rewardXP: 75, requiredLevel: 1, emoji: '👻' },
  { id: 'quest_station_hopper', name: 'Station Hopper', description: 'Visit 8 different phantom stations', type: 'explore', target: 8, rewardCoins: 200, rewardXP: 100, requiredLevel: 3, emoji: '🚉' },
  { id: 'quest_negotiator', name: 'Spectral Negotiator', description: 'Successfully negotiate with 15 ghosts', type: 'negotiate', target: 15, rewardCoins: 250, rewardXP: 125, requiredLevel: 5, emoji: '🤝' },
  { id: 'quest_rare_spirit', name: 'Rare Spirit Transport', description: 'Transport 5 rare or higher rarity ghosts', type: 'transport', target: 5, rewardCoins: 300, rewardXP: 150, requiredLevel: 10, emoji: '💎' },
  { id: 'quest_long_haul', name: 'Long Haul Phantom', description: 'Travel a total distance of 500 spectral leagues', type: 'explore', target: 500, rewardCoins: 350, rewardXP: 175, requiredLevel: 12, emoji: '🗺️' },
  { id: 'quest_haunt_master', name: 'Haunt Master', description: 'Board 50 total passengers', type: 'haunt', target: 50, rewardCoins: 400, rewardXP: 200, requiredLevel: 15, emoji: '🦇' },
  { id: 'quest_ectoplasm_baron', name: 'Ectoplasm Baron', description: 'Collect 1000 ectoplasm in total', type: 'collect', target: 1000, rewardCoins: 500, rewardXP: 250, requiredLevel: 20, emoji: '🧪' },
  { id: 'quest_phantom_express', name: 'Phantom Express', description: 'Complete 200 total journeys', type: 'transport', target: 200, rewardCoins: 800, rewardXP: 400, requiredLevel: 30, emoji: '🌟' },
  { id: 'quest_legendary_route', name: 'Legendary Route', description: 'Reach Phantom Peak station', type: 'explore', target: 1, rewardCoins: 1500, rewardXP: 750, requiredLevel: 35, emoji: '⛰️' },
];

// ---- 6 NPCs ----

export const GT_NPCS: NPCDef[] = [
  { id: 'npc_conductor_mortis', name: 'Conductor Mortis', role: 'Ghost Conductor', description: 'The eternal conductor of the first ghost train, your mentor', emoji: '🚂', greeting: 'All aboard the spectral express! The living may depart, but the dead ride forever.' },
  { id: 'npc_stationmaster_ignis', name: 'Ignis the Station Master', role: 'Station Master', description: 'A fiery spirit who manages all phantom stations', emoji: '🔥', greeting: 'The schedule waits for no one — not even the dead. What\'s your destination?' },
  { id: 'npc_merchant_phantasma', name: 'Phantasma', role: 'Artifact Dealer', description: 'A mysterious trader who sells supernatural artifacts', emoji: '🔮', greeting: 'I have relics from a thousand haunted journeys. Care to browse, mortal... or whatever you are?' },
  { id: 'npc_mechanic_gears', name: 'Old Gears', role: 'Spectral Mechanic', description: 'A clockwork ghost who repairs and upgrades carriages', emoji: '⚙️', greeting: '*clank clank* The engine\'s running on fumes and regret. Need an upgrade?' },
  { id: 'npc_banshee_cassandra', name: 'Cassandra', role: 'Banshee Oracle', description: 'A friendly banshee who foresees upcoming encounters', emoji: '😱', greeting: 'I\'ve seen your future journeys in the mist. Some are profitable. Most are terrifying.' },
  { id: 'npc_ticket_collector_eon', name: 'Eon', role: 'Eternal Ticket Collector', description: 'An ancient entity that has collected tickets since time began', emoji: '🎫', greeting: 'Tickets, please. Time is meaningless but schedules are sacred.' },
];

// ---- 15 Achievements ----

export const GT_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach_first_passenger', name: 'First Soul', description: 'Transport your first spectral passenger', conditionKey: 'totalPassengers', targetValue: 1, rewardCoins: 15, rewardXP: 8, emoji: '👻' },
  { id: 'ach_passengers_10', name: 'Busy Conductor', description: 'Transport 10 passengers total', conditionKey: 'totalPassengers', targetValue: 10, rewardCoins: 50, rewardXP: 25, emoji: '🚂' },
  { id: 'ach_passengers_50', name: 'Soul Ferry', description: 'Transport 50 passengers total', conditionKey: 'totalPassengers', targetValue: 50, rewardCoins: 200, rewardXP: 100, emoji: '💀' },
  { id: 'ach_passengers_100', name: 'Spirit Tycoon', description: 'Transport 100 passengers total', conditionKey: 'totalPassengers', targetValue: 100, rewardCoins: 500, rewardXP: 250, emoji: '👑' },
  { id: 'ach_fare_1000', name: 'Thousand Coins', description: 'Earn 1000 coins from fares total', conditionKey: 'totalFareCollected', targetValue: 1000, rewardCoins: 100, rewardXP: 50, emoji: '💰' },
  { id: 'ach_fare_10000', name: 'Ecto-Mogul', description: 'Earn 10000 coins from fares total', conditionKey: 'totalFareCollected', targetValue: 10000, rewardCoins: 1000, rewardXP: 500, emoji: '🤑' },
  { id: 'ach_level_10', name: 'Double Digits', description: 'Reach level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 150, rewardXP: 75, emoji: '🔟' },
  { id: 'ach_level_25', name: 'Seasoned Spirit', description: 'Reach level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 400, rewardXP: 200, emoji: '🌟' },
  { id: 'ach_level_45', name: 'Phantom Engineer', description: 'Reach the maximum level', conditionKey: 'level', targetValue: 45, rewardCoins: 2000, rewardXP: 1000, emoji: '🏅' },
  { id: 'ach_streak_7', name: 'Week of Haunting', description: 'Maintain a 7-day daily streak', conditionKey: 'dailyStreak', targetValue: 7, rewardCoins: 200, rewardXP: 100, emoji: '📅' },
  { id: 'ach_streak_30', name: 'Monthly Phantom', description: 'Maintain a 30-day daily streak', conditionKey: 'dailyStreak', targetValue: 30, rewardCoins: 1000, rewardXP: 500, emoji: '🗓️' },
  { id: 'ach_ghosts_15', name: 'Ghost Encyclopedia', description: 'Befriend 15 different ghost types', conditionKey: 'ghostsBefriended', targetValue: 15, rewardCoins: 300, rewardXP: 150, emoji: '📖' },
  { id: 'ach_ghosts_30', name: 'Complete Codex', description: 'Befriend all 30 ghost types', conditionKey: 'ghostsBefriended', targetValue: 30, rewardCoins: 2000, rewardXP: 1000, emoji: '📚' },
  { id: 'ach_distance_500', name: 'Long Distance', description: 'Travel 500 spectral leagues total', conditionKey: 'totalDistanceTraveled', targetValue: 500, rewardCoins: 250, rewardXP: 125, emoji: '🗺️' },
  { id: 'ach_reputation_max', name: 'Phantom Legend', description: 'Reach maximum reputation rank', conditionKey: 'reputation', targetValue: 1000, rewardCoins: 500, rewardXP: 250, emoji: '🏅' },
];

// ---- Daily Task Pool ----

export const GT_DAILY_TASK_POOL: DailyTaskPoolDef[] = [
  { id: 'daily_transport_3', name: 'Daily Transport', description: 'Transport 3 passengers today', type: 'transport', target: 3, rewardCoins: 30, rewardXP: 15, emoji: '🚂' },
  { id: 'daily_transport_5', name: 'Rush Hour', description: 'Transport 5 passengers today', type: 'transport', target: 5, rewardCoins: 50, rewardXP: 25, emoji: '💨' },
  { id: 'daily_transport_8', name: 'Spectral Rush', description: 'Transport 8 passengers today', type: 'transport', target: 8, rewardCoins: 80, rewardXP: 40, emoji: '👻' },
  { id: 'daily_collect_3', name: 'Artifact Hunt', description: 'Collect 3 artifacts today', type: 'collect', target: 3, rewardCoins: 25, rewardXP: 12, emoji: '🔮' },
  { id: 'daily_explore_2', name: 'Station Tour', description: 'Visit 2 new stations today', type: 'explore', target: 2, rewardCoins: 35, rewardXP: 18, emoji: '🚉' },
  { id: 'daily_negotiate_3', name: 'Spirit Talks', description: 'Negotiate with 3 ghosts today', type: 'negotiate', target: 3, rewardCoins: 40, rewardXP: 20, emoji: '🤝' },
  { id: 'daily_fare_200', name: 'Fare Collector', description: 'Earn 200 coins from fares today', type: 'transport', target: 200, rewardCoins: 45, rewardXP: 22, emoji: '💰' },
  { id: 'daily_negotiate_5', name: 'Diplomat of the Dead', description: 'Negotiate with 5 ghosts today', type: 'negotiate', target: 5, rewardCoins: 60, rewardXP: 30, emoji: '🦴' },
];

// ============================================================
// Initial State Factory
// ============================================================

function createInitialState(seed?: number): GhostTrainState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    level: 1,
    xp: 0,
    coins: GT_STARTING_COINS,
    ectoplasm: GT_STARTING_ECTOPLASM,
    spiritEnergy: 50,
    unlockedGhosts: ['poltergeist', 'shade', 'will_o_wisp', 'whisper', 'mist_walker', 'echo', 'frost_wisp', 'lantern_bearer'],
    currentStation: 'graveyard_terminal',
    currentRoute: null,
    passengers: [],
    artifacts: { ghost_lantern: 1, spirit_compass: 1, ectoplasm_vial: 3 },
    reputation: 0,
    reputationTitle: 'Unknown Spirit',
    totalPassengers: 0,
    totalFareCollected: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalDistanceTraveled: 0,
    stationsVisited: ['graveyard_terminal'],
    ghostsBefriended: 8,
    ghostsNegotiated: 0,
    encountersCompleted: 0,
    dailyStreak: 0,
    lastDaily: null,
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: GT_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    carriages: GT_CARRIAGES.map((c) => ({ id: c.id, level: 1 })),
    stations: GT_STATIONS.map((s) => ({ id: s.id, level: 1 })),
    abilities: GT_ABILITIES.map((a) => ({ id: a.id, level: 1, equipped: a.id === 'apparition_shift' })),
    seed: effectiveSeed,
    ghostCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    artifactCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    carriageUpgradeCount: 0,
    abilityUpgradeCount: 0,
    stationUpgradeCount: 0,
    dailyTask: null,
    hauntedJourneys: 0,
    title: 'Ticket Collector',
  };
}

// ============================================================
// Hook: useGhostTrain
// ============================================================

export default function useGhostTrain(initialSeed?: number) {
  const [state, setState] = useState<GhostTrainState>(() => createInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // ---- Core State ----

  const gtGetState = useCallback((): Readonly<GhostTrainState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const gtResetState = useCallback((newSeed?: number) => {
    const s = createInitialState(newSeed);
    prngRef.current = mulberry32(s.seed);
    setState(s);
  }, []);

  const gtSeed = useCallback((seed: number) => {
    prngRef.current = mulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const gtRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const gtRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const gtRandomChoice = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const gtGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const gtGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const gtGetXPTillNext = useCallback((): number => {
    return xpRequiredForLevel(state.level);
  }, [state.level]);

  const gtGetXPTotal = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const gtAddXP = useCallback((amount: number): GhostTrainState => {
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < GT_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= GT_MAX_LEVEL) xp = 0;
      next = { ...prev, level: clampLevel(level), xp };
      // Update title
      let currentTitle = GT_TITLE_THRESHOLDS[0].name;
      for (const t of GT_TITLE_THRESHOLDS) {
        if (next.level >= t.levelRequired) currentTitle = t.name;
      }
      next = { ...next, title: currentTitle };
      return next;
    });
    return next;
  }, [state]);

  // ---- Title ----

  const gtGetTitle = useCallback((): TitleInfo => {
    let current = GT_TITLE_THRESHOLDS[0];
    for (const t of GT_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const gtGetAllTitles = useCallback((): TitleInfo[] => {
    return [...GT_TITLE_THRESHOLDS];
  }, []);

  const gtGetNextTitle = useCallback((): TitleInfo | null => {
    for (const t of GT_TITLE_THRESHOLDS) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const gtGetProgress = useCallback((): number => {
    const needed = xpRequiredForLevel(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const gtGetOverallProgress = useCallback((): number => {
    return state.level / GT_MAX_LEVEL;
  }, [state.level]);

  // ---- Coins ----

  const gtGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const gtAddCoins = useCallback((amount: number): GhostTrainState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins + amount), totalEarned: prev.totalEarned + Math.max(0, amount) };
      return next;
    });
    return next;
  }, [state]);

  const gtSpendCoins = useCallback((amount: number): { success: boolean; state: GhostTrainState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins - amount), totalSpent: prev.totalSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const gtCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Ectoplasm / Spirit Energy ----

  const gtGetEctoplasm = useCallback((): number => {
    return state.ectoplasm;
  }, [state.ectoplasm]);

  const gtAddEctoplasm = useCallback((amount: number): GhostTrainState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, ectoplasm: prev.ectoplasm + Math.floor(amount) };
      return next;
    });
    return next;
  }, [state]);

  const gtSpendEctoplasm = useCallback((amount: number): { success: boolean; state: GhostTrainState } => {
    if (state.ectoplasm < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, ectoplasm: prev.ectoplasm - Math.floor(amount) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const gtGetSpiritEnergy = useCallback((): number => {
    return state.spiritEnergy;
  }, [state.spiritEnergy]);

  const gtAddSpiritEnergy = useCallback((amount: number): GhostTrainState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, spiritEnergy: Math.min(999, prev.spiritEnergy + Math.floor(amount)) };
      return next;
    });
    return next;
  }, [state]);

  // ---- Ghosts ----

  const gtGetGhosts = useCallback((): GhostTypeDef[] => {
    return [...GT_GHOSTS];
  }, []);

  const gtGetUnlockedGhosts = useCallback((): GhostTypeDef[] => {
    return GT_GHOSTS.filter((g) => state.unlockedGhosts.includes(g.id));
  }, [state.unlockedGhosts]);

  const gtGetLockedGhosts = useCallback((): GhostTypeDef[] => {
    return GT_GHOSTS.filter((g) => !state.unlockedGhosts.includes(g.id));
  }, [state.unlockedGhosts]);

  const gtGetGhostById = useCallback((id: string): GhostTypeDef | null => {
    return GT_GHOSTS.find((g) => g.id === id) ?? null;
  }, []);

  const gtIsGhostUnlocked = useCallback((ghostId: string): boolean => {
    return state.unlockedGhosts.includes(ghostId);
  }, [state.unlockedGhosts]);

  const gtUnlockGhost = useCallback((ghostId: string): { success: boolean; state: GhostTrainState } => {
    const ghost = GT_GHOSTS.find((g) => g.id === ghostId);
    if (!ghost) return { success: false, state };
    if (state.unlockedGhosts.includes(ghostId)) return { success: false, state };
    if (state.level < ghost.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, unlockedGhosts: [...prev.unlockedGhosts, ghostId] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const gtGetGhostsByRarity = useCallback((rarity: GhostRarity): GhostTypeDef[] => {
    return GT_GHOSTS.filter((g) => g.rarity === rarity);
  }, []);

  const gtGetGhostsByCarriage = useCallback((carriageId: string): GhostTypeDef[] => {
    return GT_GHOSTS.filter((g) => g.preferredCarriage === carriageId);
  }, []);

  // ---- Carriages ----

  const gtGetCarriages = useCallback((): CarriageDef[] => {
    return [...GT_CARRIAGES];
  }, []);

  const gtGetCarriageLevels = useCallback((): CarriageState[] => {
    return [...state.carriages];
  }, [state.carriages]);

  const gtGetCarriageLevel = useCallback((carriageId: string): number => {
    const c = state.carriages.find((cs) => cs.id === carriageId);
    return c?.level ?? 1;
  }, [state.carriages]);

  const gtGetCarriageCapacity = useCallback((carriageId: string): number => {
    const def = GT_CARRIAGES.find((c) => c.id === carriageId);
    const cs = state.carriages.find((c) => c.id === carriageId);
    if (!def || !cs) return 0;
    return def.maxCapacity + Math.floor((cs.level - 1) * 0.5);
  }, [state.carriages]);

  const gtGetCarriageComfort = useCallback((carriageId: string): number => {
    const def = GT_CARRIAGES.find((c) => c.id === carriageId);
    const cs = state.carriages.find((c) => c.id === carriageId);
    if (!def || !cs) return 0;
    return def.baseComfortBonus + (cs.level - 1) * 3;
  }, [state.carriages]);

  const gtGetCarriageSpeedBonus = useCallback((carriageId: string): number => {
    const def = GT_CARRIAGES.find((c) => c.id === carriageId);
    const cs = state.carriages.find((c) => c.id === carriageId);
    if (!def || !cs) return 1;
    return def.baseSpeedBonus + (cs.level - 1) * 0.02;
  }, [state.carriages]);

  const gtGetTotalCapacity = useCallback((): number => {
    let total = 0;
    for (const c of state.carriages) {
      const def = GT_CARRIAGES.find((d) => d.id === c.id);
      if (def) total += def.maxCapacity + Math.floor((c.level - 1) * 0.5);
    }
    // Add capacity bonus from equipped abilities
    for (const ab of state.abilities.filter((a) => a.equipped)) {
      const abDef = GT_ABILITIES.find((d) => d.id === ab.id);
      if (abDef && abDef.bonusType === 'capacity') {
        total += Math.floor(abDef.baseBonusValue * (0.5 + ab.level * 0.15));
      }
    }
    return total;
  }, [state.carriages, state.abilities]);

  const gtUpgradeCarriage = useCallback((carriageId: string): { success: boolean; cost: number; state: GhostTrainState } => {
    const def = GT_CARRIAGES.find((c) => c.id === carriageId);
    const cs = state.carriages.find((c) => c.id === carriageId);
    if (!def || !cs) return { success: false, cost: 0, state };
    if (cs.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.6, cs.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const newCarriages = prev.carriages.map((c) =>
        c.id === carriageId ? { ...c, level: c.level + 1 } : c
      );
      next = {
        ...prev,
        carriages: newCarriages,
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        carriageUpgradeCount: prev.carriageUpgradeCount + 1,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Stations ----

  const gtGetStations = useCallback((): StationDef[] => {
    return [...GT_STATIONS];
  }, []);

  const gtGetStationById = useCallback((id: string): StationDef | null => {
    return GT_STATIONS.find((s) => s.id === id) ?? null;
  }, []);

  const gtGetStationLevels = useCallback((): StationState[] => {
    return [...state.stations];
  }, [state.stations]);

  const gtGetCurrentStation = useCallback((): StationDef | null => {
    return GT_STATIONS.find((s) => s.id === state.currentStation) ?? null;
  }, [state.currentStation]);

  const gtGetStationLevel = useCallback((stationId: string): number => {
    const s = state.stations.find((st) => st.id === stationId);
    return s?.level ?? 1;
  }, [state.stations]);

  const gtGetStationReputationBonus = useCallback((stationId: string): number => {
    const def = GT_STATIONS.find((s) => s.id === stationId);
    const st = state.stations.find((s) => s.id === stationId);
    if (!def || !st) return 0;
    return def.baseReputationBonus + (st.level - 1) * 2;
  }, [state.stations]);

  const gtGetConnectedStations = useCallback((stationId: string): StationDef[] => {
    const station = GT_STATIONS.find((s) => s.id === stationId);
    if (!station) return [];
    return GT_STATIONS.filter((s) => station.connections.includes(s.id));
  }, []);

  const gtGetStationsVisited = useCallback((): string[] => {
    return [...state.stationsVisited];
  }, [state.stationsVisited]);

  const gtHasVisitedStation = useCallback((stationId: string): boolean => {
    return state.stationsVisited.includes(stationId);
  }, [state.stationsVisited]);

  const gtUpgradeStation = useCallback((stationId: string): { success: boolean; cost: number; state: GhostTrainState } => {
    const def = GT_STATIONS.find((s) => s.id === stationId);
    const st = state.stations.find((s) => s.id === stationId);
    if (!def || !st) return { success: false, cost: 0, state };
    if (st.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, st.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const newStations = prev.stations.map((s) =>
        s.id === stationId ? { ...s, level: s.level + 1 } : s
      );
      next = {
        ...prev,
        stations: newStations,
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        stationUpgradeCount: prev.stationUpgradeCount + 1,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Artifacts ----

  const gtGetArtifacts = useCallback((): ArtifactDef[] => {
    return [...GT_ARTIFACTS];
  }, []);

  const gtGetArtifactById = useCallback((id: string): ArtifactDef | null => {
    return GT_ARTIFACTS.find((a) => a.id === id) ?? null;
  }, []);

  const gtGetInventory = useCallback((): Record<string, number> => {
    return { ...state.artifacts };
  }, [state.artifacts]);

  const gtGetArtifactCount = useCallback((artifactId: string): number => {
    return state.artifacts[artifactId] ?? 0;
  }, [state.artifacts]);

  const gtBuyArtifact = useCallback((artifactId: string, amount: number = 1): { success: boolean; cost: number; state: GhostTrainState } => {
    const def = GT_ARTIFACTS.find((a) => a.id === artifactId);
    if (!def) return { success: false, cost: 0, state };
    if (state.level < def.requiredLevel) return { success: false, cost: 0, state };
    const totalCost = def.cost * amount;
    if (state.coins < totalCost) return { success: false, cost: totalCost, state };
    let next = state;
    setState((prev) => {
      const newArtifacts = { ...prev.artifacts, [artifactId]: (prev.artifacts[artifactId] ?? 0) + amount };
      const newCountByRarity = { ...prev.artifactCountByRarity, [def.rarity]: prev.artifactCountByRarity[def.rarity] + amount };
      next = {
        ...prev,
        artifacts: newArtifacts,
        coins: clampCoins(prev.coins - totalCost),
        totalSpent: prev.totalSpent + totalCost,
        artifactCountByRarity: newCountByRarity,
      };
      // Quest progress
      next = gtProcessQuestProgress(next, 'collect', amount);
      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = GT_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'collect') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + amount } };
        }
      }
      return next;
    });
    return { success: true, cost: totalCost, state: next };
  }, [state]);

  const gtUseArtifact = useCallback((artifactId: string, amount: number = 1): boolean => {
    const current = state.artifacts[artifactId] ?? 0;
    if (current < amount) return false;
    let success = false;
    setState((prev) => {
      const have = prev.artifacts[artifactId] ?? 0;
      if (have < amount) { success = false; return prev; }
      success = true;
      const newArtifacts = { ...prev.artifacts };
      newArtifacts[artifactId] = have - amount;
      if (newArtifacts[artifactId] <= 0) delete newArtifacts[artifactId];
      return { ...prev, artifacts: newArtifacts };
    });
    return success;
  }, [state]);

  const gtGetArtifactsByRarity = useCallback((rarity: GhostRarity): ArtifactDef[] => {
    return GT_ARTIFACTS.filter((a) => a.rarity === rarity);
  }, []);

  // ---- Conductor Abilities ----

  const gtGetAbilities = useCallback((): ConductorAbilityDef[] => {
    return [...GT_ABILITIES];
  }, []);

  const gtGetAbilityStates = useCallback((): AbilityState[] => {
    return [...state.abilities];
  }, [state.abilities]);

  const gtGetEquippedAbilities = useCallback((): AbilityState[] => {
    return state.abilities.filter((a) => a.equipped);
  }, [state.abilities]);

  const gtGetAbilityLevel = useCallback((abilityId: string): number => {
    const a = state.abilities.find((as) => as.id === abilityId);
    return a?.level ?? 1;
  }, [state.abilities]);

  const gtGetAbilityBonus = useCallback((abilityId: string): number => {
    const as = state.abilities.find((a) => a.id === abilityId);
    const def = GT_ABILITIES.find((a) => a.id === abilityId);
    if (!as || !def) return 0;
    return def.baseBonusValue * (0.5 + as.level * 0.15);
  }, [state.abilities]);

  const gtEquipAbility = useCallback((abilityId: string): { success: boolean; state: GhostTrainState } => {
    const def = GT_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newAbilities = prev.abilities.map((a) => ({
        ...a,
        equipped: a.id === abilityId ? true : (a.equipped && GT_ABILITIES.find((d) => d.id === a.id)?.bonusType === def.bonusType ? false : a.equipped),
      }));
      next = { ...prev, abilities: newAbilities };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const gtUpgradeAbility = useCallback((abilityId: string): { success: boolean; cost: number; state: GhostTrainState } => {
    const def = GT_ABILITIES.find((a) => a.id === abilityId);
    const as = state.abilities.find((a) => a.id === abilityId);
    if (!def || !as) return { success: false, cost: 0, state };
    if (as.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, as.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const newAbilities = prev.abilities.map((a) =>
        a.id === abilityId ? { ...a, level: a.level + 1 } : a
      );
      next = {
        ...prev,
        abilities: newAbilities,
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        abilityUpgradeCount: prev.abilityUpgradeCount + 1,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Passenger Management ----

  const gtGetPassengers = useCallback((): PassengerJob[] => {
    return [...state.passengers];
  }, [state.passengers]);

  const gtGetPassengerCount = useCallback((): number => {
    return state.passengers.length;
  }, [state.passengers]);

  const gtGetPassengersByCarriage = useCallback((carriageId: string): PassengerJob[] => {
    return state.passengers.filter((p) => p.carriageId === carriageId);
  }, [state.passengers]);

  const gtGetAvailableGhostsForStation = useCallback((stationId: string): GhostTypeDef[] => {
    const station = GT_STATIONS.find((s) => s.id === stationId);
    if (!station) return [];
    return GT_GHOSTS.filter((g) =>
      state.unlockedGhosts.includes(g.id) &&
      state.level >= g.requiredLevel &&
      g.fare <= state.coins * 0.5
    );
  }, [state.unlockedGhosts, state.level, state.coins]);

  const gtBoard = useCallback((ghostId: string, destinationId: string, now: number = Date.now()): { success: boolean; passenger: PassengerJob | null; state: GhostTrainState } => {
    const ghost = GT_GHOSTS.find((g) => g.id === ghostId);
    if (!ghost) return { success: false, passenger: null, state };
    if (!state.unlockedGhosts.includes(ghostId)) return { success: false, passenger: null, state };
    if (state.level < ghost.requiredLevel) return { success: false, passenger: null, state };
    if (state.coins < ghost.fare * 0.1) return { success: false, passenger: null, state }; // Need deposit

    const currentStation = GT_STATIONS.find((s) => s.id === state.currentStation);
    if (!currentStation || !currentStation.connections.includes(destinationId) && state.currentStation !== destinationId) {
      return { success: false, passenger: null, state };
    }

    // Check capacity
    const totalCap = (() => {
      let total = 0;
      for (const c of state.carriages) {
        const def = GT_CARRIAGES.find((d) => d.id === c.id);
        if (def) total += def.maxCapacity + Math.floor((c.level - 1) * 0.5);
      }
      for (const ab of state.abilities.filter((a) => a.equipped)) {
        const abDef = GT_ABILITIES.find((d) => d.id === ab.id);
        if (abDef && abDef.bonusType === 'capacity') {
          total += Math.floor(abDef.baseBonusValue * (0.5 + ab.level * 0.15));
        }
      }
      return total;
    })();
    if (state.passengers.length >= totalCap) return { success: false, passenger: null, state };

    const satisfaction = 50 + Math.floor(prngRef.current() * 30);
    const passenger: PassengerJob = {
      id: `pass_${ghostId}_${now}_${prngRef.current().toString(36).slice(2, 6)}`,
      ghostId,
      boardedAt: now,
      destinationId,
      farePaid: ghost.fare,
      satisfaction,
      carriageId: ghost.preferredCarriage,
    };

    let next = state;
    setState((prev) => {
      const deposit = Math.floor(ghost.fare * 0.1);
      next = {
        ...prev,
        passengers: [...prev.passengers, passenger],
        coins: clampCoins(prev.coins - deposit),
        totalSpent: prev.totalSpent + deposit,
        ghostCountByRarity: { ...prev.ghostCountByRarity, [ghost.rarity]: prev.ghostCountByRarity[ghost.rarity] + 1 },
      };
      next = gtProcessQuestProgress(next, 'transport', 1);
      next = gtProcessQuestProgress(next, 'haunt', 1);
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = GT_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'transport') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }
      return next;
    });

    return { success: true, passenger, state: next };
  }, [state]);

  const gtUnboard = useCallback((passengerId: string): { success: boolean; fare: number; xp: number; coins: number; state: GhostTrainState } => {
    const idx = state.passengers.findIndex((p) => p.id === passengerId);
    if (idx === -1) return { success: false, fare: 0, xp: 0, coins: 0, state };

    const passenger = state.passengers[idx];
    const ghost = GT_GHOSTS.find((g) => g.id === passenger.ghostId);
    if (!ghost) return { success: false, fare: 0, xp: 0, coins: 0, state };

    // Can only unboard at destination or current station
    if (passenger.destinationId !== state.currentStation) {
      return { success: false, fare: 0, xp: 0, coins: 0, state };
    }

    const satisfactionMult = passenger.satisfaction / 100;
    const rarityMult = rarityMultiplier(ghost.rarity);
    const deposit = Math.floor(ghost.fare * 0.1);
    const remainingFare = ghost.fare - deposit;
    const fareEarned = Math.floor(remainingFare * satisfactionMult * (0.8 + rarityMult * 0.2));
    const xpEarned = Math.floor(ghost.xpReward * satisfactionMult * rarityMult);

    let next = state;
    setState((prev) => {
      const newPassengers = prev.passengers.filter((p) => p.id !== passengerId);
      next = {
        ...prev,
        passengers: newPassengers,
        coins: clampCoins(prev.coins + fareEarned),
        totalEarned: prev.totalEarned + fareEarned,
        totalFareCollected: prev.totalFareCollected + fareEarned,
        totalPassengers: prev.totalPassengers + 1,
      };

      // XP + level up
      let { level, xp } = next;
      xp += xpEarned;
      while (level < GT_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= GT_MAX_LEVEL) xp = 0;
      next = { ...next, level: clampLevel(level), xp };
      let currentTitle = GT_TITLE_THRESHOLDS[0].name;
      for (const t of GT_TITLE_THRESHOLDS) {
        if (next.level >= t.levelRequired) currentTitle = t.name;
      }
      next = { ...next, title: currentTitle };

      // Reputation
      const repGain = Math.floor(ghost.hauntPower * satisfactionMult * 0.1);
      next = { ...next, reputation: Math.min(1000, next.reputation + repGain) };
      const repTitleIdx = Math.min(GT_REPUTATION_TITLES.length - 1, Math.floor(next.reputation / 200));
      next = { ...next, reputationTitle: GT_REPUTATION_TITLES[repTitleIdx] };

      // Spirit energy from happy passengers
      const energyGain = Math.floor(satisfactionMult * 5 * rarityMult);
      next = { ...next, spiritEnergy: Math.min(999, next.spiritEnergy + energyGain) };

      // Ectoplasm
      const ectoGain = Math.floor(satisfactionMult * 3);
      next = { ...next, ectoplasm: next.ectoplasm + ectoGain };

      return next;
    });

    return { success: true, fare: fareEarned, xp: xpEarned, coins: fareEarned, state: next };
  }, [state]);

  const gtRemovePassenger = useCallback((passengerId: string): { success: boolean; state: GhostTrainState } => {
    const idx = state.passengers.findIndex((p) => p.id === passengerId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, passengers: prev.passengers.filter((p) => p.id !== passengerId) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Route Planning ----

  const gtPlanRoute = useCallback((destinationId: string, now: number = Date.now()): { success: boolean; route: PlannedRoute | null; state: GhostTrainState } => {
    const dest = GT_STATIONS.find((s) => s.id === destinationId);
    if (!dest) return { success: false, route: null, state };
    if (state.level < dest.requiredLevel) return { success: false, route: null, state };
    if (destinationId === state.currentStation) return { success: false, route: null, state };

    // BFS to find shortest path
    const visited = new Set<string>();
    const queue: { stationId: string; path: string[] }[] = [{ stationId: state.currentStation, path: [state.currentStation] }];
    let shortestPath: string[] | null = null;

    while (queue.length > 0) {
      const { stationId, path } = queue.shift()!;
      if (stationId === destinationId) { shortestPath = path; break; }
      if (visited.has(stationId)) continue;
      visited.add(stationId);
      const station = GT_STATIONS.find((s) => s.id === stationId);
      if (!station) continue;
      for (const conn of station.connections) {
        if (!visited.has(conn)) {
          const connStation = GT_STATIONS.find((s) => s.id === conn);
          if (connStation && state.level >= connStation.requiredLevel) {
            queue.push({ stationId: conn, path: [...path, conn] });
          }
        }
      }
    }

    if (!shortestPath) return { success: false, route: null, state };

    // Calculate speed from engine carriage and abilities
    const engineLevel = state.carriages.find((c) => c.id === 'engine')?.level ?? 1;
    const engineDef = GT_CARRIAGES.find((c) => c.id === 'engine');
    let speedMult = engineDef?.baseSpeedBonus ?? 1;
    speedMult += (engineLevel - 1) * 0.05;
    for (const ab of state.abilities.filter((a) => a.equipped)) {
      const abDef = GT_ABILITIES.find((d) => d.id === ab.id);
      if (abDef && abDef.bonusType === 'speed') {
        speedMult += abDef.baseBonusValue * (0.5 + ab.level * 0.15) * 0.01;
      }
    }

    const legs: RouteLeg[] = [];
    let currentTime = now;
    let totalDistance = 0;
    for (let i = 0; i < shortestPath.length - 1; i++) {
      const fromStation = GT_STATIONS.find((s) => s.id === shortestPath[i]);
      const toStation = GT_STATIONS.find((s) => s.id === shortestPath[i + 1]);
      const distance = 10 + Math.abs(gtHashString(`${shortestPath[i]}_${shortestPath[i + 1]}`)) % 40;
      const travelTime = Math.max(5000, Math.floor((distance * 3000) / speedMult));
      totalDistance += distance;
      legs.push({
        stationId: shortestPath[i + 1],
        departAt: currentTime,
        arriveAt: currentTime + travelTime,
      });
      currentTime += travelTime + 2000; // 2s dwell time
    }

    const route: PlannedRoute = {
      id: `route_${now}_${prngRef.current().toString(36).slice(2, 6)}`,
      legs,
      totalDistance,
      totalTime: currentTime - now,
      fare: Math.floor(totalDistance * 0.5),
    };

    let next = state;
    setState((prev) => {
      next = { ...prev, currentRoute: route };
      return next;
    });

    return { success: true, route, state: next };
  }, [state]);

  const gtGetPlannedRoute = useCallback((): PlannedRoute | null => {
    return state.currentRoute;
  }, [state.currentRoute]);

  const gtClearRoute = useCallback((): GhostTrainState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, currentRoute: null };
      return next;
    });
    return next;
  }, [state]);

  const gtTravelTo = useCallback((stationId: string, now: number = Date.now()): { success: boolean; distance: number; state: GhostTrainState } => {
    const dest = GT_STATIONS.find((s) => s.id === stationId);
    if (!dest) return { success: false, distance: 0, state };
    if (state.level < dest.requiredLevel) return { success: false, distance: 0, state };

    const currentStation = GT_STATIONS.find((s) => s.id === state.currentStation);
    if (!currentStation) return { success: false, distance: 0, state };

    // Check if directly connected
    if (!currentStation.connections.includes(stationId)) return { success: false, distance: 0, state };

    const distance = 10 + Math.abs(gtHashString(`${state.currentStation}_${stationId}`)) % 40;

    let next = state;
    setState((prev) => {
      const newStationsVisited = prev.stationsVisited.includes(stationId) ? prev.stationsVisited : [...prev.stationsVisited, stationId];

      // Unboard passengers at this station
      const arrived = prev.passengers.filter((p) => p.destinationId === stationId);
      const remaining = prev.passengers.filter((p) => p.destinationId !== stationId);

      let totalFare = 0;
      let totalXP = 0;
      for (const p of arrived) {
        const ghost = GT_GHOSTS.find((g) => g.id === p.ghostId);
        if (ghost) {
          const satisfactionMult = p.satisfaction / 100;
          const rarityMult = rarityMultiplier(ghost.rarity);
          const deposit = Math.floor(ghost.fare * 0.1);
          const remainingFare = ghost.fare - deposit;
          totalFare += Math.floor(remainingFare * satisfactionMult * (0.8 + rarityMult * 0.2));
          totalXP += Math.floor(ghost.xpReward * satisfactionMult * rarityMult);
        }
      }

      let { level, xp } = prev;
      xp += totalXP;
      while (level < GT_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= GT_MAX_LEVEL) xp = 0;

      let currentTitle = GT_TITLE_THRESHOLDS[0].name;
      for (const t of GT_TITLE_THRESHOLDS) {
        if (level >= t.levelRequired) currentTitle = t.name;
      }

      next = {
        ...prev,
        currentStation: stationId,
        currentRoute: null,
        stationsVisited: newStationsVisited,
        passengers: remaining,
        coins: clampCoins(prev.coins + totalFare),
        totalEarned: prev.totalEarned + totalFare,
        totalFareCollected: prev.totalFareCollected + totalFare,
        totalPassengers: prev.totalPassengers + arrived.length,
        totalDistanceTraveled: prev.totalDistanceTraveled + distance,
        level: clampLevel(level),
        xp,
        title: currentTitle,
      };

      // Reputation
      const stationRep = (() => {
        const st = prev.stations.find((s) => s.id === stationId);
        const def = GT_STATIONS.find((s) => s.id === stationId);
        if (!st || !def) return 0;
        return def.baseReputationBonus + (st.level - 1) * 2;
      })();
      next = { ...next, reputation: Math.min(1000, next.reputation + stationRep + arrived.length * 2) };
      const repTitleIdx = Math.min(GT_REPUTATION_TITLES.length - 1, Math.floor(next.reputation / 200));
      next = { ...next, reputationTitle: GT_REPUTATION_TITLES[repTitleIdx] };

      // Ectoplasm from travel
      const ectoGain = Math.floor(distance * 0.3);
      next = { ...next, ectoplasm: next.ectoplasm + ectoGain };

      // Quest progress
      if (!prev.stationsVisited.includes(stationId)) {
        next = gtProcessQuestProgress(next, 'explore', 1);
      }
      next = gtProcessQuestProgress(next, 'explore', distance);
      next = gtProcessQuestProgress(next, 'transport', arrived.length);

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = GT_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'explore' && !prev.stationsVisited.includes(stationId)) {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });

    return { success: true, distance, state: next };
  }, [state]);

  // ---- Ghost Encounters ----

  const gtEncounter = useCallback((now: number = Date.now()): EncounterResult => {
    // Determine encounter based on level and station danger
    const currentStation = GT_STATIONS.find((s) => s.id === state.currentStation);
    const dangerBonus = currentStation?.dangerLevel ?? 1;

    // Roll for rarity based on level and danger
    const encounterSeed = gtHashString(`encounter_${now}_${state.seed}`);
    const rng = mulberry32(encounterSeed);

    const roll = rng() * 100;
    const levelBonus = state.level * 0.5 + dangerBonus * 3;
    let rarityIdx = 0;
    if (roll < 2 + levelBonus * 0.3) rarityIdx = 4;       // legendary ~5%
    else if (roll < 8 + levelBonus * 0.8) rarityIdx = 3;   // epic ~12%
    else if (roll < 25 + levelBonus * 1.5) rarityIdx = 2;  // rare ~30%
    else if (roll < 55 + levelBonus * 1.2) rarityIdx = 1;  // uncommon ~40%
    else rarityIdx = 0;                                     // common

    const rarityOrder: GhostRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const encounterRarity = rarityOrder[rarityIdx];

    // Pick a ghost of that rarity (or one level higher)
    const candidateRarities = rarityOrder.slice(0, Math.min(rarityOrder.length, rarityIdx + 2));
    const candidates = GT_GHOSTS.filter((g) => candidateRarities.includes(g.rarity) && state.level >= g.requiredLevel);
    if (candidates.length === 0) {
      return { ghostId: '', ghostName: 'No Spirit', rarity: 'common', outcome: 'failed', coinsEarned: 0, xpEarned: 0, spiritEnergy: 0, wasNew: false };
    }

    const encountered = candidates[Math.floor(rng() * candidates.length)];

    // Negotiation: based on level, haunt power of abilities, and artifacts
    const hauntBonus = state.abilities.filter((a) => a.equipped).reduce((acc, as) => {
      const def = GT_ABILITIES.find((d) => d.id === as.id);
      return acc + (def?.bonusType === 'haunt' ? def.baseBonusValue * (0.5 + as.level * 0.15) : 0);
    }, 0);
    const comfortBonus = state.abilities.filter((a) => a.equipped).reduce((acc, as) => {
      const def = GT_ABILITIES.find((d) => d.id === as.id);
      return acc + (def?.bonusType === 'comfort' ? def.baseBonusValue * (0.5 + as.level * 0.15) : 0);
    }, 0);

    const negotiationScore = 30 + state.level * 1.5 + hauntBonus + comfortBonus + rng() * 20;
    const difficulty = 20 + rarityMultiplier(encountered.rarity) * 15 + rng() * 20;

    let outcome: EncounterResult['outcome'];
    if (negotiationScore > difficulty * 1.5) outcome = 'befriended';
    else if (negotiationScore > difficulty) outcome = 'negotiated';
    else if (negotiationScore > difficulty * 0.5) outcome = 'fleed';
    else outcome = 'failed';

    const wasNew = !state.unlockedGhosts.includes(encountered.id) && outcome === 'befriended';
    const mult = outcome === 'befriended' ? 1.5 : outcome === 'negotiated' ? 1 : outcome === 'fleed' ? 0.3 : 0;
    const coinsEarned = Math.floor(encountered.fare * mult * rarityMultiplier(encountered.rarity) * 0.5);
    const xpEarned = Math.floor(encountered.xpReward * mult * rarityMultiplier(encountered.rarity));
    const spiritEnergy = Math.floor(encountered.hauntPower * mult * 0.3);

    let next = state;
    setState((prev) => {
      const newUnlocked = wasNew ? [...prev.unlockedGhosts, encountered.id] : prev.unlockedGhosts;
      next = {
        ...prev,
        unlockedGhosts: newUnlocked,
        coins: clampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
        encountersCompleted: prev.encountersCompleted + 1,
        spiritEnergy: Math.min(999, prev.spiritEnergy + spiritEnergy),
        ectoplasm: prev.ectoplasm + Math.floor(coinsEarned * 0.1),
      };

      if (outcome === 'befriended') {
        next = { ...next, ghostsBefriended: prev.ghostsBefriended + 1 };
      }
      if (outcome === 'negotiated' || outcome === 'befriended') {
        next = { ...next, ghostsNegotiated: prev.ghostsNegotiated + 1 };
      }

      // XP
      let { level, xp } = next;
      xp += xpEarned;
      while (level < GT_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= GT_MAX_LEVEL) xp = 0;
      next = { ...next, level: clampLevel(level), xp };
      let currentTitle = GT_TITLE_THRESHOLDS[0].name;
      for (const t of GT_TITLE_THRESHOLDS) {
        if (next.level >= t.levelRequired) currentTitle = t.name;
      }
      next = { ...next, title: currentTitle };

      // Reputation
      const repGain = outcome === 'befriended' ? 8 : outcome === 'negotiated' ? 3 : 0;
      next = { ...next, reputation: Math.min(1000, next.reputation + repGain) };
      const repTitleIdx = Math.min(GT_REPUTATION_TITLES.length - 1, Math.floor(next.reputation / 200));
      next = { ...next, reputationTitle: GT_REPUTATION_TITLES[repTitleIdx] };

      // Quest progress
      if (outcome === 'befriended' || outcome === 'negotiated') {
        next = gtProcessQuestProgress(next, 'negotiate', 1);
        next = gtProcessQuestProgress(next, 'collect', 1);
      }

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = GT_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'negotiate' && (outcome === 'befriended' || outcome === 'negotiated')) {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }

      return next;
    });

    return { ghostId: encountered.id, ghostName: encountered.name, rarity: encountered.rarity, outcome, coinsEarned, xpEarned, spiritEnergy, wasNew };
  }, [state]);

  const gtGetEncounterChance = useCallback((): number => {
    const station = GT_STATIONS.find((s) => s.id === state.currentStation);
    const dangerBonus = station?.dangerLevel ?? 1;
    return Math.min(95, 20 + state.level * 0.8 + dangerBonus * 5);
  }, [state.currentStation, state.level]);

  // ---- Reputation ----

  const gtGetReputation = useCallback((): number => {
    return state.reputation;
  }, [state.reputation]);

  const gtGetReputationTitle = useCallback((): string => {
    return state.reputationTitle;
  }, [state.reputationTitle]);

  const gtGetReputationRank = useCallback((): number => {
    return Math.min(GT_REPUTATION_TITLES.length - 1, Math.floor(state.reputation / 200));
  }, [state.reputation]);

  const gtGetNextReputationTitle = useCallback((): string | null => {
    const currentIdx = Math.min(GT_REPUTATION_TITLES.length - 1, Math.floor(state.reputation / 200));
    if (currentIdx >= GT_REPUTATION_TITLES.length - 1) return null;
    return GT_REPUTATION_TITLES[currentIdx + 1];
  }, [state.reputation]);

  const gtGetReputationProgress = useCallback((): number => {
    const currentThreshold = Math.floor(state.reputation / 200) * 200;
    return (state.reputation - currentThreshold) / 200;
  }, [state.reputation]);

  const gtAddReputation = useCallback((amount: number): GhostTrainState => {
    let next = state;
    setState((prev) => {
      const newRep = Math.min(1000, prev.reputation + amount);
      const repTitleIdx = Math.min(GT_REPUTATION_TITLES.length - 1, Math.floor(newRep / 200));
      next = { ...prev, reputation: newRep, reputationTitle: GT_REPUTATION_TITLES[repTitleIdx] };
      return next;
    });
    return next;
  }, [state]);

  // ---- Quests ----

  const gtGetQuests = useCallback((): QuestDef[] => {
    return [...GT_QUESTS];
  }, []);

  const gtGetActiveQuests = useCallback((): (QuestDef & QuestState)[] => {
    return state.activeQuests.map((aq) => {
      const def = GT_QUESTS.find((q) => q.id === aq.id);
      if (!def) return { ...aq, name: '', description: '', type: 'transport' as QuestType, target: 0, rewardCoins: 0, rewardXP: 0, requiredLevel: 0, emoji: '' };
      return { ...aq, ...def };
    });
  }, [state.activeQuests]);

  const gtGetAvailableQuests = useCallback((): QuestDef[] => {
    const activeIds = new Set(state.activeQuests.map((q) => q.id));
    const completedIds = new Set(state.completedQuests);
    return GT_QUESTS.filter((q) => !activeIds.has(q.id) && !completedIds.has(q.id) && state.level >= q.requiredLevel);
  }, [state.activeQuests, state.completedQuests, state.level]);

  const gtGetCompletedQuests = useCallback((): string[] => {
    return [...state.completedQuests];
  }, [state.completedQuests]);

  const gtAcceptQuest = useCallback((questId: string): { success: boolean; state: GhostTrainState } => {
    const def = GT_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.activeQuests.some((q) => q.id === questId)) return { success: false, state };
    if (state.completedQuests.includes(questId)) return { success: false, state };
    if (state.activeQuests.length >= GT_MAX_ACTIVE_QUESTS) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, activeQuests: [...prev.activeQuests, { id: questId, accepted: true, completed: false, progress: 0 }] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const gtGetQuestProgress = useCallback((questId: string): number => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    return aq?.progress ?? 0;
  }, [state.activeQuests]);

  const gtCompleteQuest = useCallback((questId: string): { success: boolean; rewardCoins: number; rewardXP: number; state: GhostTrainState } => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    if (!aq || !aq.completed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const def = GT_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    let next = state;
    setState((prev) => {
      const newActive = prev.activeQuests.filter((q) => q.id !== questId);
      let { level, xp } = prev;
      xp += def.rewardXP;
      while (level < GT_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= GT_MAX_LEVEL) xp = 0;
      let currentTitle = GT_TITLE_THRESHOLDS[0].name;
      for (const t of GT_TITLE_THRESHOLDS) {
        if (level >= t.levelRequired) currentTitle = t.name;
      }
      next = {
        ...prev,
        activeQuests: newActive,
        completedQuests: [...prev.completedQuests, questId],
        coins: clampCoins(prev.coins + def.rewardCoins),
        totalEarned: prev.totalEarned + def.rewardCoins,
        level: clampLevel(level),
        xp,
        title: currentTitle,
      };
      return next;
    });
    return { success: true, rewardCoins: def.rewardCoins, rewardXP: def.rewardXP, state: next };
  }, [state]);

  const gtAbandonQuest = useCallback((questId: string): { success: boolean; state: GhostTrainState } => {
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

  const gtGetAchievements = useCallback((): AchievementDef[] => {
    return [...GT_ACHIEVEMENTS];
  }, []);

  const gtGetUnlockedAchievements = useCallback((): AchievementState[] => {
    return state.unlockedAchievements.filter((a) => a.unlocked);
  }, [state.unlockedAchievements]);

  const gtIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const a = state.unlockedAchievements.find((ach) => ach.id === achievementId);
    return a?.unlocked ?? false;
  }, [state.unlockedAchievements]);

  const gtCheckAchievements = useCallback((): AchievementState[] => {
    const now = Date.now();
    let next = state;
    const newlyUnlocked: AchievementState[] = [];

    setState((prev) => {
      let updated = prev;
      for (const ach of GT_ACHIEVEMENTS) {
        const currentState = updated.unlockedAchievements.find((a) => a.id === ach.id);
        if (!currentState || currentState.unlocked) continue;
        let value = 0;
        switch (ach.conditionKey) {
          case 'totalPassengers': value = updated.totalPassengers; break;
          case 'totalFareCollected': value = updated.totalFareCollected; break;
          case 'level': value = updated.level; break;
          case 'dailyStreak': value = updated.dailyStreak; break;
          case 'ghostsBefriended': value = updated.ghostsBefriended; break;
          case 'totalDistanceTraveled': value = updated.totalDistanceTraveled; break;
          case 'reputation': value = updated.reputation; break;
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
          while (level < GT_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
            xp -= xpRequiredForLevel(level);
            level += 1;
          }
          if (level >= GT_MAX_LEVEL) xp = 0;
          updated = { ...updated, level: clampLevel(level), xp };
        }
      }
      next = updated;
      return updated;
    });

    return newlyUnlocked;
  }, [state]);

  const gtUnlockAchievement = useCallback((achievementId: string): { success: boolean; state: GhostTrainState } => {
    const ach = GT_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return { success: false, state };
    const current = state.unlockedAchievements.find((a) => a.id === achievementId);
    if (current?.unlocked) return { success: false, state };
    let next = state;
    const now = Date.now();
    setState((prev) => {
      let { level, xp } = prev;
      xp += ach.rewardXP;
      while (level < GT_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= GT_MAX_LEVEL) xp = 0;
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

  const gtGetDailyTask = useCallback((): DailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const gtRefreshDailyTask = useCallback((now: number = Date.now()): { dailyTask: DailyTaskPoolDef | null; state: GhostTrainState } => {
    const dayKey = generateDayKey(now);
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const pool = GT_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return { dailyTask: pool ?? null, state };
    }
    const daySeed = gtHashString(dayKey) & 0x7fffffff;
    const rng = mulberry32(daySeed);
    const taskIndex = Math.floor(rng() * GT_DAILY_TASK_POOL.length);
    const task = GT_DAILY_TASK_POOL[taskIndex];
    const yesterdayKey = generateDayKey(now - 86400000);
    const newStreak = state.lastDaily === yesterdayKey ? state.dailyStreak + 1 : (state.lastDaily === dayKey ? state.dailyStreak : 1);
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyTask: { poolId: task.id, progress: 0, claimed: false, dayKey },
        dailyStreak: newStreak,
        lastDaily: dayKey,
        hauntedJourneys: prev.hauntedJourneys + 1,
      };
      return next;
    });
    return { dailyTask: task, state: next };
  }, [state]);

  const gtClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: GhostTrainState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = GT_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const streakBonus = 1 + state.dailyStreak * 0.05;
    const rewardCoins = Math.floor(poolDef.rewardCoins * streakBonus);
    const rewardXP = Math.floor(poolDef.rewardXP * streakBonus);
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += rewardXP;
      while (level < GT_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= GT_MAX_LEVEL) xp = 0;
      let currentTitle = GT_TITLE_THRESHOLDS[0].name;
      for (const t of GT_TITLE_THRESHOLDS) {
        if (level >= t.levelRequired) currentTitle = t.name;
      }
      next = {
        ...prev,
        dailyTask: { ...prev.dailyTask!, claimed: true },
        coins: clampCoins(prev.coins + rewardCoins),
        totalEarned: prev.totalEarned + rewardCoins,
        level: clampLevel(level),
        xp,
        title: currentTitle,
      };
      return next;
    });
    return { success: true, rewardCoins, rewardXP, state: next };
  }, [state]);

  const gtGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const gtGetLastDaily = useCallback((): string | null => {
    return state.lastDaily;
  }, [state.lastDaily]);

  // ---- Stats ----

  const gtGetStats = useCallback(() => {
    return {
      totalPassengers: state.totalPassengers,
      totalFareCollected: state.totalFareCollected,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      profit: state.totalEarned - state.totalSpent,
      reputation: state.reputation,
      reputationTitle: state.reputationTitle,
      dailyStreak: state.dailyStreak,
      stationsVisited: state.stationsVisited.length,
      ghostsBefriended: state.ghostsBefriended,
      ghostsNegotiated: state.ghostsNegotiated,
      encountersCompleted: state.encountersCompleted,
      unlockedGhostCount: state.unlockedGhosts.length,
      totalGhostCount: GT_GHOSTS.length,
      questsCompleted: state.completedQuests.length,
      achievementsUnlocked: state.unlockedAchievements.filter((a) => a.unlocked).length,
      carriageUpgradeCount: state.carriageUpgradeCount,
      abilityUpgradeCount: state.abilityUpgradeCount,
      stationUpgradeCount: state.stationUpgradeCount,
      totalDistanceTraveled: state.totalDistanceTraveled,
      ectoplasm: state.ectoplasm,
      spiritEnergy: state.spiritEnergy,
      hauntedJourneys: state.hauntedJourneys,
    };
  }, [state]);

  const gtGetEarnedCoins = useCallback((): number => {
    return state.totalEarned;
  }, [state.totalEarned]);

  const gtGetProfit = useCallback((): number => {
    return state.totalEarned - state.totalSpent;
  }, [state.totalEarned, state.totalSpent]);

  const gtGetTotalSpent = useCallback((): number => {
    return state.totalSpent;
  }, [state.totalSpent]);

  // ---- NPC Interaction ----

  const gtGetNPCs = useCallback((): NPCDef[] => {
    return [...GT_NPCS];
  }, []);

  const gtGetNPCById = useCallback((id: string): NPCDef | null => {
    return GT_NPCS.find((n) => n.id === id) ?? null;
  }, []);

  const gtGetRarityInfo = useCallback((rarity: GhostRarity): RarityInfo | null => {
    return GT_RARITIES.find((r) => r.key === rarity) ?? null;
  }, []);

  const gtGetAllRarities = useCallback((): RarityInfo[] => {
    return [...GT_RARITIES];
  }, []);

  // ---- Utility / Misc ----

  const gtGetGhostsByStation = useCallback((stationId: string): GhostTypeDef[] => {
    const station = GT_STATIONS.find((s) => s.id === stationId);
    if (!station) return [];
    const dangerLevel = station.dangerLevel;
    // Higher danger stations attract rarer ghosts
    const maxRarityIdx = Math.min(GT_RARITIES.length - 1, Math.floor(dangerLevel / 2));
    const rarityOrder: GhostRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const allowedRarities = rarityOrder.slice(0, maxRarityIdx + 1);
    return GT_GHOSTS.filter((g) =>
      allowedRarities.includes(g.rarity) &&
      state.level >= g.requiredLevel
    );
  }, [state.level]);

  const gtGetAvailableCapacity = useCallback((): number => {
    let total = 0;
    for (const c of state.carriages) {
      const def = GT_CARRIAGES.find((d) => d.id === c.id);
      if (def) total += def.maxCapacity + Math.floor((c.level - 1) * 0.5);
    }
    for (const ab of state.abilities.filter((a) => a.equipped)) {
      const abDef = GT_ABILITIES.find((d) => d.id === ab.id);
      if (abDef && abDef.bonusType === 'capacity') {
        total += Math.floor(abDef.baseBonusValue * (0.5 + ab.level * 0.15));
      }
    }
    return total - state.passengers.length;
  }, [state.carriages, state.abilities, state.passengers]);

  const gtGetBoard = useCallback((): PassengerJob[] => {
    return [...state.passengers];
  }, [state.passengers]);

  const gtIsFull = useCallback((): boolean => {
    let total = 0;
    for (const c of state.carriages) {
      const def = GT_CARRIAGES.find((d) => d.id === c.id);
      if (def) total += def.maxCapacity + Math.floor((c.level - 1) * 0.5);
    }
    for (const ab of state.abilities.filter((a) => a.equipped)) {
      const abDef = GT_ABILITIES.find((d) => d.id === ab.id);
      if (abDef && abDef.bonusType === 'capacity') {
        total += Math.floor(abDef.baseBonusValue * (0.5 + ab.level * 0.15));
      }
    }
    return state.passengers.length >= total;
  }, [state.carriages, state.abilities, state.passengers]);

  // ---- Extended Utilities ----

  /** Get a comprehensive summary of the ghost train state. */
  const gtGetTrainSummary = useCallback((): {
    trainName: string;
    level: number;
    title: TitleInfo;
    coins: number;
    xp: number;
    xpTillNext: number;
    progress: number;
    ghostsUnlocked: number;
    ghostsTotal: number;
    carriagesOwned: number;
    abilitiesEquipped: number;
    passengersOnBoard: number;
    totalCapacity: number;
    reputation: number;
    reputationTitle: string;
    dailyStreak: number;
    currentStation: string;
    stationsExplored: number;
    totalDistanceTraveled: number;
    ectoplasm: number;
    spiritEnergy: number;
    netWorth: number;
  } => {
    const title = (() => {
      let current = GT_TITLE_THRESHOLDS[0];
      for (const t of GT_TITLE_THRESHOLDS) {
        if (state.level >= t.levelRequired) current = t;
      }
      return current;
    })();
    let totalCap = 0;
    for (const c of state.carriages) {
      const def = GT_CARRIAGES.find((d) => d.id === c.id);
      if (def) totalCap += def.maxCapacity + Math.floor((c.level - 1) * 0.5);
    }
    for (const ab of state.abilities.filter((a) => a.equipped)) {
      const abDef = GT_ABILITIES.find((d) => d.id === ab.id);
      if (abDef && abDef.bonusType === 'capacity') {
        totalCap += Math.floor(abDef.baseBonusValue * (0.5 + ab.level * 0.15));
      }
    }
    const artifactValue = Object.entries(state.artifacts).reduce((sum, [id, qty]) => {
      const def = GT_ARTIFACTS.find((a) => a.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
    return {
      trainName: 'The Phantom Express',
      level: state.level,
      title,
      coins: state.coins,
      xp: state.xp,
      xpTillNext: xpRequiredForLevel(state.level),
      progress: xpRequiredForLevel(state.level) > 0 ? state.xp / xpRequiredForLevel(state.level) : 1,
      ghostsUnlocked: state.unlockedGhosts.length,
      ghostsTotal: GT_GHOSTS.length,
      carriagesOwned: state.carriages.filter((c) => c.level > 1).length,
      abilitiesEquipped: state.abilities.filter((a) => a.equipped).length,
      passengersOnBoard: state.passengers.length,
      totalCapacity: totalCap,
      reputation: state.reputation,
      reputationTitle: state.reputationTitle,
      dailyStreak: state.dailyStreak,
      currentStation: state.currentStation,
      stationsExplored: state.stationsVisited.length,
      totalDistanceTraveled: state.totalDistanceTraveled,
      ectoplasm: state.ectoplasm,
      spiritEnergy: state.spiritEnergy,
      netWorth: state.coins + Math.floor(artifactValue * 0.5),
    };
  }, [state]);

  /** Get tips/hints for the current ghost train state. */
  const gtGetTrainTips = useCallback((): string[] => {
    const tips: string[] = [];

    const lockedCount = GT_GHOSTS.filter(
      (g) => !state.unlockedGhosts.includes(g.id) && state.level >= g.requiredLevel
    ).length;
    if (lockedCount > 0) {
      tips.push(`You have ${lockedCount} ghost type(s) available to befriend through encounters!`);
    }

    const connectedStations = GT_STATIONS.find((s) => s.id === state.currentStation)?.connections ?? [];
    const unvisitedConnected = connectedStations.filter((id) => !state.stationsVisited.includes(id) && state.level >= (GT_STATIONS.find((s) => s.id === id)?.requiredLevel ?? 99));
    if (unvisitedConnected.length > 0) {
      const names = unvisitedConnected.map((id) => GT_STATIONS.find((s) => s.id === id)?.name ?? id).join(', ');
      tips.push(`Unvisited stations nearby: ${names}. Expand your network for more passengers!`);
    }

    if (state.reputation < 200) {
      tips.push('Keep transporting passengers and completing encounters to build your reputation!');
    }

    const unequippedAbility = state.abilities.find(
      (a) => !a.equipped && GT_ABILITIES.find((d) => d.id === a.id)?.bonusType === 'speed'
    );
    if (unequippedAbility) {
      const def = GT_ABILITIES.find((d) => d.id === unequippedAbility.id);
      if (def) tips.push(`Equip ${def.name} to speed up your spectral journeys!`);
    }

    if (state.dailyStreak > 0 && state.dailyStreak % 7 === 0) {
      tips.push(`Amazing ${state.dailyStreak}-day streak! Daily rewards get a ${Math.floor(state.dailyStreak * 5)}% bonus!`);
    }

    if (state.passengers.length > 0) {
      const arrivedPassengers = state.passengers.filter((p) => p.destinationId === state.currentStation);
      if (arrivedPassengers.length > 0) {
        tips.push(`You have ${arrivedPassengers.length} passenger(s) ready to unboard at this station!`);
      }
    }

    if (state.level < 10) {
      tips.push('Keep transporting spirits to level up! Higher levels unlock rarer ghosts and stations.');
    } else if (state.level < 25) {
      tips.push('Epic ghosts await at higher levels. Explore dangerous stations for better encounters!');
    } else if (state.level >= 35) {
      tips.push('You are approaching the Phantom Engineer title. Legendary ghosts and Phantom Peak await!');
    }

    if (state.ectoplasm < 10) {
      tips.push('Running low on ectoplasm! Transport passengers to earn more spirit fuel.');
    }

    const completableQuests = state.activeQuests.filter((q) => q.completed && !state.completedQuests.includes(q.id));
    if (completableQuests.length > 0) {
      tips.push(`You have ${completableQuests.length} quest(s) ready to claim rewards for!`);
    }

    if (state.encountersCompleted < 5) {
      tips.push('Try encountering more ghosts — you might befriend rare new spectral passengers!');
    }

    if (tips.length === 0) {
      tips.push('Your ghost train runs smoothly! Keep expanding your haunted railway network.');
    }

    return tips;
  }, [state]);

  /** Simulate an encounter without actually triggering one. */
  const gtSimulateEncounter = useCallback((): {
    possibleRarities: GhostRarity[];
    encounterChance: number;
    negotiationPower: number;
    tips: string[];
  } => {
    const station = GT_STATIONS.find((s) => s.id === state.currentStation);
    const dangerBonus = station?.dangerLevel ?? 1;
    const encounterChance = Math.min(95, 20 + state.level * 0.8 + dangerBonus * 5);

    const hauntBonus = state.abilities.filter((a) => a.equipped).reduce((acc, as) => {
      const def = GT_ABILITIES.find((d) => d.id === as.id);
      return acc + (def?.bonusType === 'haunt' ? def.baseBonusValue * (0.5 + as.level * 0.15) : 0);
    }, 0);
    const comfortBonus = state.abilities.filter((a) => a.equipped).reduce((acc, as) => {
      const def = GT_ABILITIES.find((d) => d.id === as.id);
      return acc + (def?.bonusType === 'comfort' ? def.baseBonusValue * (0.5 + as.level * 0.15) : 0);
    }, 0);
    const negotiationPower = Math.floor(30 + state.level * 1.5 + hauntBonus + comfortBonus);

    const levelBonus = state.level * 0.5 + dangerBonus * 3;
    const possibleRarities: GhostRarity[] = ['common'];
    if (state.level >= 3 || dangerBonus >= 3) possibleRarities.push('uncommon');
    if (state.level >= 8 || dangerBonus >= 5) possibleRarities.push('rare');
    if (state.level >= 18 || dangerBonus >= 7) possibleRarities.push('epic');
    if (state.level >= 30 || dangerBonus >= 9) possibleRarities.push('legendary');

    const tips: string[] = [];
    if (dangerBonus >= 5) tips.push('High danger station — expect rarer encounters but tougher negotiations.');
    if (comfortBonus < 10) tips.push('Equip comfort abilities to improve negotiation success.');
    if (state.spiritEnergy < 20) tips.push('Low spirit energy may reduce encounter quality.');

    return { possibleRarities, encounterChance, negotiationPower, tips };
  }, [state]);

  /** Get recommended upgrades based on current state and budget. */
  const gtGetRecommendedUpgrades = useCallback(
    (budget: number): { type: 'carriage' | 'ability' | 'station'; id: string; name: string; cost: number; priority: number }[] => {
      const recommendations: { type: 'carriage' | 'ability' | 'station'; id: string; name: string; cost: number; priority: number }[] = [];

      for (const cs of state.carriages) {
        const def = GT_CARRIAGES.find((c) => c.id === cs.id);
        if (!def || cs.level >= def.maxLevel) continue;
        const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.6, cs.level - 1));
        if (cost > budget) continue;
        const priority = (def.id === 'engine' ? 15 : 8) + (def.maxLevel - cs.level) * 2 + def.baseComfortBonus;
        recommendations.push({ type: 'carriage', id: cs.id, name: def.name, cost, priority });
      }

      for (const ab of state.abilities) {
        const def = GT_ABILITIES.find((a) => a.id === ab.id);
        if (!def || ab.level >= def.maxLevel) continue;
        const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, ab.level - 1));
        if (cost > budget) continue;
        const isEquipped = ab.equipped;
        const typeBonus = def.bonusType === 'speed' ? 10 : def.bonusType === 'comfort' ? 8 : def.bonusType === 'haunt' ? 7 : 5;
        const priority = (isEquipped ? 12 : 3) + typeBonus + (def.maxLevel - ab.level);
        recommendations.push({ type: 'ability', id: ab.id, name: def.name, cost, priority });
      }

      for (const st of state.stations) {
        const def = GT_STATIONS.find((s) => s.id === st.id);
        if (!def || st.level >= def.maxLevel) continue;
        const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, st.level - 1));
        if (cost > budget) continue;
        const priority = (def.id === state.currentStation ? 12 : 4) + def.baseReputationBonus + (def.maxLevel - st.level);
        recommendations.push({ type: 'station', id: st.id, name: def.name, cost, priority });
      }

      recommendations.sort((a, b) => b.priority - a.priority);
      return recommendations;
    },
    [state.carriages, state.abilities, state.stations, state.currentStation]
  );

  /** Get ghost rarity distribution of befriended ghosts. */
  const gtGetGhostRarityDistribution = useCallback((): Record<GhostRarity, { total: number; unlocked: number }> => {
    const result: Record<GhostRarity, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      uncommon: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
    };
    for (const ghost of GT_GHOSTS) {
      result[ghost.rarity].total += 1;
      if (state.unlockedGhosts.includes(ghost.id)) {
        result[ghost.rarity].unlocked += 1;
      }
    }
    return result;
  }, [state.unlockedGhosts]);

  /** Get net worth: coins + artifact value. */
  const gtGetNetWorth = useCallback((): number => {
    const artifactValue = Object.entries(state.artifacts).reduce((sum, [id, qty]) => {
      const def = GT_ARTIFACTS.find((a) => a.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
    return state.coins + Math.floor(artifactValue * 0.5);
  }, [state.coins, state.artifacts]);

  /** Get the total coin value of all artifacts in inventory. */
  const gtGetInventoryValue = useCallback((): number => {
    return Object.entries(state.artifacts).reduce((sum, [id, qty]) => {
      const def = GT_ARTIFACTS.find((a) => a.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
  }, [state.artifacts]);

  /** Get distance between two connected stations. */
  const gtGetDistanceBetween = useCallback((fromId: string, toId: string): number => {
    const fromStation = GT_STATIONS.find((s) => s.id === fromId);
    if (!fromStation || !fromStation.connections.includes(toId)) return -1;
    return 10 + Math.abs(gtHashString(`${fromId}_${toId}`)) % 40;
  }, []);

  /** Get the danger level of a station. */
  const gtGetStationDanger = useCallback((stationId: string): number => {
    const station = GT_STATIONS.find((s) => s.id === stationId);
    return station?.dangerLevel ?? 0;
  }, []);

  /** Get count of ghosts at each carriage. */
  const gtGetCarriageOccupancy = useCallback((): Record<string, number> => {
    const occupancy: Record<string, number> = {};
    for (const c of GT_CARRIAGES) {
      occupancy[c.id] = 0;
    }
    for (const p of state.passengers) {
      occupancy[p.carriageId] = (occupancy[p.carriageId] ?? 0) + 1;
    }
    return occupancy;
  }, [state.passengers]);

  /** Find the most profitable ghost to transport given current conditions. */
  const gtGetMostProfitableGhost = useCallback((): GhostTypeDef | null => {
    const available = GT_GHOSTS.filter((g) =>
      state.unlockedGhosts.includes(g.id) &&
      state.level >= g.requiredLevel
    );
    if (available.length === 0) return null;
    return available.reduce((best, ghost) => (ghost.fare * rarityMultiplier(ghost.rarity) > best.fare * rarityMultiplier(best.rarity) ? ghost : best));
  }, [state.unlockedGhosts, state.level]);

  /** Get the total speed multiplier from engine and abilities. */
  const gtGetTotalSpeedMultiplier = useCallback((): number => {
    const engineLevel = state.carriages.find((c) => c.id === 'engine')?.level ?? 1;
    const engineDef = GT_CARRIAGES.find((c) => c.id === 'engine');
    let speedMult = engineDef?.baseSpeedBonus ?? 1;
    speedMult += (engineLevel - 1) * 0.05;
    for (const ab of state.abilities.filter((a) => a.equipped)) {
      const abDef = GT_ABILITIES.find((d) => d.id === ab.id);
      if (abDef && abDef.bonusType === 'speed') {
        speedMult += abDef.baseBonusValue * (0.5 + ab.level * 0.15) * 0.01;
      }
    }
    return speedMult;
  }, [state.carriages, state.abilities]);

  /** Get the total comfort bonus from carriages and abilities. */
  const gtGetTotalComfortBonus = useCallback((): number => {
    let comfort = 0;
    for (const c of state.carriages) {
      const def = GT_CARRIAGES.find((d) => d.id === c.id);
      if (def) comfort += def.baseComfortBonus + (c.level - 1) * 3;
    }
    for (const ab of state.abilities.filter((a) => a.equipped)) {
      const abDef = GT_ABILITIES.find((d) => d.id === ab.id);
      if (abDef && abDef.bonusType === 'comfort') {
        comfort += abDef.baseBonusValue * (0.5 + ab.level * 0.15);
      }
    }
    return comfort;
  }, [state.carriages, state.abilities]);

  // ============================================================
  // Return all functions
  // ============================================================

  return {
    gtGetState,
    gtResetState,
    gtSeed,
    gtRandom,
    gtRandomInt,
    gtRandomChoice,
    gtGetLevel,
    gtGetXP,
    gtGetXPTillNext,
    gtGetXPTotal,
    gtAddXP,
    gtGetTitle,
    gtGetAllTitles,
    gtGetNextTitle,
    gtGetProgress,
    gtGetOverallProgress,
    gtGetCoins,
    gtAddCoins,
    gtSpendCoins,
    gtCanAfford,
    gtGetEctoplasm,
    gtAddEctoplasm,
    gtSpendEctoplasm,
    gtGetSpiritEnergy,
    gtAddSpiritEnergy,
    gtGetGhosts,
    gtGetUnlockedGhosts,
    gtGetLockedGhosts,
    gtGetGhostById,
    gtIsGhostUnlocked,
    gtUnlockGhost,
    gtGetGhostsByRarity,
    gtGetGhostsByCarriage,
    gtGetCarriages,
    gtGetCarriageLevels,
    gtGetCarriageLevel,
    gtGetCarriageCapacity,
    gtGetCarriageComfort,
    gtGetCarriageSpeedBonus,
    gtGetTotalCapacity,
    gtUpgradeCarriage,
    gtGetStations,
    gtGetStationById,
    gtGetStationLevels,
    gtGetCurrentStation,
    gtGetStationLevel,
    gtGetStationReputationBonus,
    gtGetConnectedStations,
    gtGetStationsVisited,
    gtHasVisitedStation,
    gtUpgradeStation,
    gtGetArtifacts,
    gtGetArtifactById,
    gtGetInventory,
    gtGetArtifactCount,
    gtBuyArtifact,
    gtUseArtifact,
    gtGetArtifactsByRarity,
    gtGetAbilities,
    gtGetAbilityStates,
    gtGetEquippedAbilities,
    gtGetAbilityLevel,
    gtGetAbilityBonus,
    gtEquipAbility,
    gtUpgradeAbility,
    gtGetPassengers,
    gtGetPassengerCount,
    gtGetPassengersByCarriage,
    gtGetAvailableGhostsForStation,
    gtBoard,
    gtUnboard,
    gtRemovePassenger,
    gtPlanRoute,
    gtGetPlannedRoute,
    gtClearRoute,
    gtTravelTo,
    gtEncounter,
    gtGetEncounterChance,
    gtGetReputation,
    gtGetReputationTitle,
    gtGetReputationRank,
    gtGetNextReputationTitle,
    gtGetReputationProgress,
    gtAddReputation,
    gtGetQuests,
    gtGetActiveQuests,
    gtGetAvailableQuests,
    gtGetCompletedQuests,
    gtAcceptQuest,
    gtGetQuestProgress,
    gtCompleteQuest,
    gtAbandonQuest,
    gtGetAchievements,
    gtGetUnlockedAchievements,
    gtIsAchievementUnlocked,
    gtCheckAchievements,
    gtUnlockAchievement,
    gtGetDailyTask,
    gtRefreshDailyTask,
    gtClaimDailyReward,
    gtGetDailyStreak,
    gtGetLastDaily,
    gtGetStats,
    gtGetNPCs,
    gtGetNPCById,
    gtGetRarityInfo,
    gtGetAllRarities,
    gtGetGhostsByStation,
    gtGetAvailableCapacity,
    gtGetBoard,
    gtIsFull,
    // -- Extended utilities --
    gtGetTrainSummary,
    gtGetTrainTips,
    gtSimulateEncounter,
    gtGetRecommendedUpgrades,
    gtGetGhostRarityDistribution,
    gtGetNetWorth,
    gtGetInventoryValue,
    gtGetDistanceBetween,
    gtGetStationDanger,
    gtGetCarriageOccupancy,
    gtGetMostProfitableGhost,
    gtGetTotalSpeedMultiplier,
    gtGetTotalComfortBonus,
  };
}

// ============================================================
// Internal Quest Progress Helper (not exported)
// ============================================================

function gtProcessQuestProgress(
  state: GhostTrainState,
  type: QuestType,
  amount: number
): GhostTrainState {
  let updated = state;
  for (const aq of updated.activeQuests) {
    if (aq.completed) continue;
    const def = GT_QUESTS.find((q) => q.id === aq.id);
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
}
