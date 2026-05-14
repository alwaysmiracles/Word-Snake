import { useState, useCallback, useRef } from 'react';

// ============================================================
// Mermaid Lagoon — Underwater Ocean Kingdom Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type StructureBonus = 'depth' | 'charm' | 'yield' | 'luck';
export type QuestType = 'dive' | 'discover' | 'earn' | 'collect' | 'upgrade';
export type DailyType = 'dive' | 'discover' | 'earn' | 'craft';

export interface CoralDef {
  id: string;
  name: string;
  rarity: Rarity;
  cost: number;
  description: string;
  emoji: string;
}

export interface CreatureDef {
  id: string;
  name: string;
  rarity: Rarity;
  corals: { coralId: string; amount: number }[];
  diveTime: number;
  discoverValue: number;
  xpReward: number;
  zoneId: string;
  description: string;
  emoji: string;
  requiredLevel: number;
}

export interface ZoneDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  baseDepthBonus: number;
  baseCharmBonus: number;
  baseUpgradeCost: number;
}

export interface TreasureDef {
  id: string;
  name: string;
  kind: string;
  patience: number;
  valueMultiplier: number;
  favoriteZones: string[];
  description: string;
  emoji: string;
}

export interface StructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  bonusType: StructureBonus;
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
  key: Rarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface DiveJob {
  id: string;
  creatureId: string;
  startedAt: number;
  endsAt: number;
  quality: number;
  zoneId: string;
}

export interface StructureState {
  id: string;
  level: number;
  equipped: boolean;
}

export interface ZoneState {
  id: string;
  level: number;
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

export interface ActiveEncounter {
  id: string;
  encounteredAt: number;
  treasureId: string | null;
  tamed: boolean;
  befriended: boolean;
}

export interface MermaidLagoonState {
  level: number;
  xp: number;
  coins: number;
  unlockedCreatures: string[];
  activeZone: string;
  corals: Record<string, number>;
  activeEncounters: ActiveEncounter[];
  reefHealth: number;
  completedDives: number;
  discoveredCreatures: number;
  totalEarned: number;
  totalSpent: number;
  divingQueue: DiveJob[];
  dailyStreak: number;
  lastDaily: string | null;
  activeQuests: QuestState[];
  completedQuests: string[];
  unlockedAchievements: AchievementState[];
  expeditionEntries: number;
  expeditionWins: number;
  expeditionLastRank: number | null;
  dailyTask: DailyTaskState | null;
  zones: ZoneState[];
  structures: StructureState[];
  seed: number;
  diveCountByRarity: Record<Rarity, number>;
  coralCountByRarity: Record<Rarity, number>;
  zoneUpgradeCount: number;
  structureUpgradeCount: number;
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

function mlHashString(str: string): number {
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
  if (level >= ML_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function clampLevel(lvl: number): number {
  return Math.max(1, Math.min(ML_MAX_LEVEL, lvl));
}

function clampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function generateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function rarityMultiplier(r: Rarity): number {
  const map: Record<Rarity, number> = {
    common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5, mythic: 8,
  };
  return map[r] ?? 1;
}

// ============================================================
// Constants
// ============================================================

export const ML_MAX_LEVEL = 50;

export const ML_RARITIES: RarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
  { key: 'mythic', label: 'Mythic', color: '#F472B6', xpMultiplier: 8 },
];

export const ML_TITLE_THRESHOLDS: TitleInfo[] = [
  { name: 'Landwalker', levelRequired: 1, description: 'A newcomer from the surface, just learning to breathe underwater' },
  { name: 'Tide Pool Explorer', levelRequired: 5, description: 'Comfortable in the shallows, discovering your first sea friends' },
  { name: 'Reef Keeper', levelRequired: 10, description: 'Guardian of the coral gardens, tending to the vibrant reef life' },
  { name: 'Deep Diver', levelRequired: 18, description: 'Bold enough to explore the mysterious ocean depths below' },
  { name: 'Ocean Guardian', levelRequired: 25, description: 'Protector of all sea creatures, respected by merfolk and beasts alike' },
  { name: 'Sea Master', levelRequired: 33, description: 'Master of currents and tides, commanding the ocean\'s hidden powers' },
  { name: 'Abyssal Lord', levelRequired: 42, description: 'Ruler of the deepest trenches where ancient leviathans dwell' },
  { name: 'Ocean Sovereign', levelRequired: 50, description: 'The supreme ruler of the underwater kingdom — all seas bow to you' },
];

export const ML_CORALS: CoralDef[] = [
  { id: 'brain_coral', name: 'Brain Coral', rarity: 'common', cost: 5, description: 'Rounded coral with grooves resembling a human brain, very sturdy', emoji: '🧠' },
  { id: 'fan_coral', name: 'Fan Coral', rarity: 'common', cost: 5, description: 'Delicate fan-shaped coral that sways gracefully in currents', emoji: '🪭' },
  { id: 'staghorn', name: 'Staghorn Coral', rarity: 'common', cost: 5, description: 'Branching coral resembling antlers, grows quickly in warm waters', emoji: '🦌' },
  { id: 'pillar_coral', rarity: 'common', cost: 6, description: 'Tall cylindrical coral pillars that grow upward toward the light', emoji: '🏛️', name: 'Pillar Coral' },
  { id: 'table_coral', name: 'Table Coral', rarity: 'common', cost: 5, description: 'Flat-topped coral providing shelter for small reef fish', emoji: '🍽️' },
  { id: 'moon_coral', name: 'Moon Coral', rarity: 'common', cost: 4, description: 'Pale luminous coral that glows softly under moonlight', emoji: '🌙' },
  { id: 'fire_coral', name: 'Fire Coral', rarity: 'uncommon', cost: 12, description: 'Red-orange coral with a sting that deters predators', emoji: '🔥' },
  { id: 'blue_coral', name: 'Blue Coral', rarity: 'uncommon', cost: 10, description: 'Striking cerulean coral, rare and prized for jewelry', emoji: '💙' },
  { id: 'organ_pipe', name: 'Organ Pipe Coral', rarity: 'uncommon', cost: 14, description: 'Tubular coral formations that hum in deep currents', emoji: '🎵' },
  { id: 'sun_coral', name: 'Sun Coral', rarity: 'uncommon', cost: 11, description: 'Bright yellow coral that blooms like a flower at dusk', emoji: '☀️' },
  { id: 'elkhorn', name: 'Elkhorn Coral', rarity: 'uncommon', cost: 13, description: 'Large branching coral that creates reef frameworks', emoji: '🌿' },
  { id: 'bubble_coral', name: 'Bubble Coral', rarity: 'uncommon', cost: 12, description: 'Translucent bubble-like polyps that sparkle in sunlight', emoji: '🫧' },
  { id: 'crystal_coral', name: 'Crystal Coral', rarity: 'rare', cost: 25, description: 'Translucent crystalline coral that refracts light into rainbows', emoji: '💎' },
  { id: 'black_coral', name: 'Black Coral', rarity: 'rare', cost: 28, description: 'Deep-sea coral as dark as the abyss, used in powerful charms', emoji: '🖤' },
  { id: 'golden_coral', name: 'Golden Coral', rarity: 'rare', cost: 30, description: 'Radiant golden coral rumored to attract treasure', emoji: '✨' },
  { id: 'ghost_coral', name: 'Ghost Coral', rarity: 'rare', cost: 24, description: 'Nearly invisible coral that only reveals itself at midnight', emoji: '👻' },
  { id: 'dragon_coral', name: 'Dragon Coral', rarity: 'epic', cost: 45, description: 'Scales-like coral formation imbued with ancient dragon energy', emoji: '🐉' },
  { id: 'abyssal_coral', name: 'Abyssal Coral', rarity: 'epic', cost: 40, description: 'Coral from the deepest trenches, pulsing with dark power', emoji: '🕳️' },
  { id: 'ancient_coral', name: 'Ancient Coral', rarity: 'legendary', cost: 65, description: 'Living fossil coral millions of years old, holds deep ocean wisdom', emoji: '🏺' },
  { id: 'void_coral', name: 'Void Coral', rarity: 'mythic', cost: 120, description: 'Coral that exists between dimensions — touching it reveals hidden truths', emoji: '🌀' },
];

export const ML_ZONES: ZoneDef[] = [
  { id: 'coral_reef', name: 'Coral Reef', description: 'A vibrant shallow reef teeming with colorful fish and swaying corals', emoji: '🐠', maxLevel: 10, baseDepthBonus: 1.0, baseCharmBonus: 0, baseUpgradeCost: 100 },
  { id: 'kelp_forest', name: 'Kelp Forest', description: 'Towering kelp that sways in underwater currents, home to gentle giants', emoji: '🌿', maxLevel: 10, baseDepthBonus: 1.0, baseCharmBonus: 5, baseUpgradeCost: 120 },
  { id: 'sunken_ship', name: 'Sunken Ship', description: 'An ancient vessel resting on the seafloor, full of hidden treasures', emoji: '🚢', maxLevel: 10, baseDepthBonus: 1.2, baseCharmBonus: 3, baseUpgradeCost: 150 },
  { id: 'iceberg_bay', name: 'Iceberg Bay', description: 'Crystal-clear freezing waters beneath towering ice formations', emoji: '🧊', maxLevel: 10, baseDepthBonus: 0.9, baseCharmBonus: 10, baseUpgradeCost: 200 },
  { id: 'volcanic_vent', name: 'Volcanic Vent', description: 'Superheated waters near underwater volcanoes, harboring exotic life', emoji: '🌋', maxLevel: 10, baseDepthBonus: 1.0, baseCharmBonus: 8, baseUpgradeCost: 180 },
  { id: 'deep_trench', name: 'Deep Trench', description: 'An abyssal trench plunging into total darkness, where legends dwell', emoji: '🕳️', maxLevel: 10, baseDepthBonus: 0.8, baseCharmBonus: 15, baseUpgradeCost: 250 },
  { id: 'bioluminescent_cavern', name: 'Bioluminescent Cavern', description: 'A magical cavern where every surface glows with living light', emoji: '✨', maxLevel: 10, baseDepthBonus: 1.1, baseCharmBonus: 6, baseUpgradeCost: 160 },
  { id: 'abyssal_plain', name: 'Abyssal Plain', description: 'The vast featureless depths of the ocean floor, ancient and mysterious', emoji: '🌑', maxLevel: 10, baseDepthBonus: 1.5, baseCharmBonus: 12, baseUpgradeCost: 300 },
];

export const ML_CREATURES: CreatureDef[] = [
  // Common (8)
  { id: 'clownfish', name: 'Clownfish', rarity: 'common', corals: [{ coralId: 'brain_coral', amount: 2 }, { coralId: 'fan_coral', amount: 1 }], diveTime: 15, discoverValue: 22, xpReward: 10, zoneId: 'coral_reef', description: 'A cheerful orange fish that lives among anemone tentacles', emoji: '🐠', requiredLevel: 1 },
  { id: 'blue_tang', name: 'Blue Tang', rarity: 'common', corals: [{ coralId: 'blue_coral', amount: 1 }, { coralId: 'moon_coral', amount: 2 }], diveTime: 15, discoverValue: 20, xpReward: 9, zoneId: 'coral_reef', description: 'A brilliant blue surgeonfish with a bold yellow tail', emoji: '🐟', requiredLevel: 1 },
  { id: 'sea_urchin', name: 'Sea Urchin', rarity: 'common', corals: [{ coralId: 'pillar_coral', amount: 2 }, { coralId: 'staghorn', amount: 1 }], diveTime: 10, discoverValue: 15, xpReward: 7, zoneId: 'coral_reef', description: 'A spiky echinoderm slowly grazing on algae-covered rocks', emoji: '🦔', requiredLevel: 1 },
  { id: 'starfish', name: 'Starfish', rarity: 'common', corals: [{ coralId: 'moon_coral', amount: 2 }, { coralId: 'table_coral', amount: 1 }], diveTime: 10, discoverValue: 15, xpReward: 6, zoneId: 'coral_reef', description: 'A five-armed sea star that can regenerate lost limbs', emoji: '⭐', requiredLevel: 1 },
  { id: 'hermit_crab', name: 'Hermit Crab', rarity: 'common', corals: [{ coralId: 'brain_coral', amount: 1 }, { coralId: 'moon_coral', amount: 1 }, { coralId: 'staghorn', amount: 1 }], diveTime: 12, discoverValue: 18, xpReward: 8, zoneId: 'coral_reef', description: 'A resourceful crab always searching for a bigger shell', emoji: '🦀', requiredLevel: 1 },
  { id: 'sea_snail', name: 'Sea Snail', rarity: 'common', corals: [{ coralId: 'table_coral', amount: 2 }, { coralId: 'moon_coral', amount: 1 }], diveTime: 8, discoverValue: 12, xpReward: 5, zoneId: 'coral_reef', description: 'A colorful nudibranch with iridescent skin patterns', emoji: '🐌', requiredLevel: 1 },
  { id: 'sardine', name: 'Sardine', rarity: 'common', corals: [{ coralId: 'fan_coral', amount: 2 }, { coralId: 'moon_coral', amount: 1 }], diveTime: 8, discoverValue: 12, xpReward: 5, zoneId: 'kelp_forest', description: 'A small silver fish that travels in enormous shimmering schools', emoji: '🐟', requiredLevel: 1 },
  { id: 'pufferfish', name: 'Pufferfish', rarity: 'common', corals: [{ coralId: 'brain_coral', amount: 2 }, { coralId: 'bubble_coral', amount: 1 }], diveTime: 18, discoverValue: 22, xpReward: 10, zoneId: 'coral_reef', description: 'An adorable fish that inflates into a spiky ball when threatened', emoji: '🐡', requiredLevel: 1 },
  // Uncommon (8)
  { id: 'sea_turtle', name: 'Sea Turtle', rarity: 'uncommon', corals: [{ coralId: 'staghorn', amount: 2 }, { coralId: 'elkhorn', amount: 1 }, { coralId: 'brain_coral', amount: 1 }], diveTime: 25, discoverValue: 45, xpReward: 22, zoneId: 'coral_reef', description: 'An ancient mariner that has navigated the oceans for centuries', emoji: '🐢', requiredLevel: 2 },
  { id: 'seahorse', name: 'Seahorse', rarity: 'uncommon', corals: [{ coralId: 'bubble_coral', amount: 2 }, { coralId: 'fan_coral', amount: 1 }], diveTime: 20, discoverValue: 35, xpReward: 18, zoneId: 'kelp_forest', description: 'A delicate creature that anchors itself to kelp with its curled tail', emoji: '🐴', requiredLevel: 2 },
  { id: 'moray_eel', name: 'Moray Eel', rarity: 'uncommon', corals: [{ coralId: 'fire_coral', amount: 2 }, { coralId: 'pillar_coral', amount: 1 }, { coralId: 'brain_coral', amount: 1 }], diveTime: 28, discoverValue: 48, xpReward: 24, zoneId: 'sunken_ship', description: 'A fearsome eel lurking in the crevices of sunken vessels', emoji: '🐍', requiredLevel: 3 },
  { id: 'octopus', name: 'Octopus', rarity: 'uncommon', corals: [{ coralId: 'crystal_coral', amount: 1 }, { coralId: 'organ_pipe', amount: 1 }, { coralId: 'moon_coral', amount: 1 }], diveTime: 22, discoverValue: 40, xpReward: 20, zoneId: 'kelp_forest', description: 'A highly intelligent cephalopod with eight problem-solving arms', emoji: '🐙', requiredLevel: 3 },
  { id: 'lobster', name: 'Lobster', rarity: 'uncommon', corals: [{ coralId: 'fire_coral', amount: 2 }, { coralId: 'pillar_coral', amount: 2 }], diveTime: 30, discoverValue: 50, xpReward: 25, zoneId: 'sunken_ship', description: 'A proud crustacean with powerful claws and a regal bearing', emoji: '🦞', requiredLevel: 4 },
  { id: 'stingray', name: 'Stingray', rarity: 'uncommon', corals: [{ coralId: 'blue_coral', amount: 2 }, { coralId: 'sun_coral', amount: 1 }], diveTime: 24, discoverValue: 42, xpReward: 21, zoneId: 'coral_reef', description: 'An elegant ray that glides through the water like an underwater bird', emoji: '🦈', requiredLevel: 3 },
  { id: 'squid', name: 'Squid', rarity: 'uncommon', corals: [{ coralId: 'organ_pipe', amount: 2 }, { coralId: 'bubble_coral', amount: 1 }], diveTime: 20, discoverValue: 38, xpReward: 19, zoneId: 'kelp_forest', description: 'A swift jet-propelled hunter with ten grasping tentacles', emoji: '🦑', requiredLevel: 3 },
  { id: 'angelfish', name: 'Angelfish', rarity: 'uncommon', corals: [{ coralId: 'sun_coral', amount: 2 }, { coralId: 'elkhorn', amount: 1 }, { coralId: 'moon_coral', amount: 1 }], diveTime: 22, discoverValue: 40, xpReward: 20, zoneId: 'coral_reef', description: 'A stunning disc-shaped fish with vivid striped patterns', emoji: '🐠', requiredLevel: 2 },
  // Rare (7)
  { id: 'dolphin', name: 'Dolphin', rarity: 'rare', corals: [{ coralId: 'blue_coral', amount: 2 }, { coralId: 'crystal_coral', amount: 1 }, { coralId: 'fan_coral', amount: 2 }], diveTime: 35, discoverValue: 70, xpReward: 35, zoneId: 'coral_reef', description: 'A playful and highly social ocean acrobat beloved by all', emoji: '🐬', requiredLevel: 5 },
  { id: 'manta_ray', name: 'Manta Ray', rarity: 'rare', corals: [{ coralId: 'crystal_coral', amount: 2 }, { coralId: 'blue_coral', amount: 1 }], diveTime: 40, discoverValue: 75, xpReward: 38, zoneId: 'kelp_forest', description: 'A gentle giant with a wingspan wider than a ship, filtering plankton', emoji: '🦈', requiredLevel: 6 },
  { id: 'jellyfish', name: 'Jellyfish', rarity: 'rare', corals: [{ coralId: 'ghost_coral', amount: 2 }, { coralId: 'bubble_coral', amount: 1 }, { coralId: 'moon_coral', amount: 1 }], diveTime: 30, discoverValue: 60, xpReward: 30, zoneId: 'bioluminescent_cavern', description: 'A mesmerizing translucent drifter trailing luminous tentacles', emoji: '🪼', requiredLevel: 5 },
  { id: 'lionfish', name: 'Lionfish', rarity: 'rare', corals: [{ coralId: 'fire_coral', amount: 2 }, { coralId: 'dragon_coral', amount: 1 }], diveTime: 32, discoverValue: 65, xpReward: 32, zoneId: 'volcanic_vent', description: 'A beautiful but venomous predator with elaborate striped fins', emoji: '🦁', requiredLevel: 7 },
  { id: 'leafy_sea_dragon', name: 'Leafy Sea Dragon', rarity: 'rare', corals: [{ coralId: 'elkhorn', amount: 2 }, { coralId: 'sun_coral', amount: 2 }, { coralId: 'fan_coral', amount: 1 }], diveTime: 38, discoverValue: 72, xpReward: 36, zoneId: 'kelp_forest', description: 'A master of camouflage disguised as floating seaweed', emoji: '🐉', requiredLevel: 6 },
  { id: 'narwhal', name: 'Narwhal', rarity: 'rare', corals: [{ coralId: 'crystal_coral', amount: 2 }, { coralId: 'iceberg_bay_coral_placeholder', amount: 0 }], diveTime: 40, discoverValue: 78, xpReward: 39, zoneId: 'iceberg_bay', description: 'The unicorn of the sea with a single spiraling ivory tusk', emoji: '🦄', requiredLevel: 8 },
  { id: 'electric_eel', name: 'Electric Eel', rarity: 'rare', corals: [{ coralId: 'fire_coral', amount: 2 }, { coralId: 'organ_pipe', amount: 1 }, { coralId: 'crystal_coral', amount: 1 }], diveTime: 35, discoverValue: 68, xpReward: 34, zoneId: 'volcanic_vent', description: 'A shocking predator that can discharge 600 volts of electricity', emoji: '⚡', requiredLevel: 7 },
  // Epic (5)
  { id: 'orca', name: 'Orca', rarity: 'epic', corals: [{ coralId: 'black_coral', amount: 2 }, { coralId: 'dragon_coral', amount: 1 }, { coralId: 'blue_coral', amount: 1 }, { coralId: 'crystal_coral', amount: 1 }], diveTime: 55, discoverValue: 120, xpReward: 60, zoneId: 'abyssal_plain', description: 'The apex predator of the sea — intelligent, powerful, and majestic', emoji: '🐋', requiredLevel: 12 },
  { id: 'whale_shark', name: 'Whale Shark', rarity: 'epic', corals: [{ coralId: 'golden_coral', amount: 1 }, { coralId: 'crystal_coral', amount: 2 }, { coralId: 'elkhorn', amount: 2 }], diveTime: 50, discoverValue: 110, xpReward: 55, zoneId: 'coral_reef', description: 'The largest fish in the sea, a gentle filter-feeding giant', emoji: '🦈', requiredLevel: 10 },
  { id: 'giant_octopus', name: 'Giant Octopus', rarity: 'epic', corals: [{ coralId: 'abyssal_coral', amount: 2 }, { coralId: 'ghost_coral', amount: 2 }, { coralId: 'organ_pipe', amount: 1 }], diveTime: 50, discoverValue: 105, xpReward: 52, zoneId: 'deep_trench', description: 'A colossal cephalopod with enough strength to crush a submarine', emoji: '🐙', requiredLevel: 11 },
  { id: 'manatee', name: 'Manatee', rarity: 'epic', corals: [{ coralId: 'sun_coral', amount: 2 }, { coralId: 'elkhorn', amount: 2 }, { coralId: 'brain_coral', amount: 1 }], diveTime: 45, discoverValue: 95, xpReward: 48, zoneId: 'kelp_forest', description: 'A gentle sea cow that grazes peacefully on underwater meadows', emoji: '🐄', requiredLevel: 9 },
  { id: 'beluga_whale', name: 'Beluga Whale', rarity: 'epic', corals: [{ coralId: 'crystal_coral', amount: 2 }, { coralId: 'ghost_coral', amount: 1 }, { coralId: 'blue_coral', amount: 2 }], diveTime: 48, discoverValue: 100, xpReward: 50, zoneId: 'iceberg_bay', description: 'The canary of the sea — a white whale with an enchanting song', emoji: '🎵', requiredLevel: 10 },
  // Legendary (4)
  { id: 'leviathan', name: 'Leviathan', rarity: 'legendary', corals: [{ coralId: 'ancient_coral', amount: 1 }, { coralId: 'dragon_coral', amount: 2 }, { coralId: 'black_coral', amount: 2 }, { coralId: 'abyssal_coral', amount: 1 }], diveTime: 80, discoverValue: 250, xpReward: 125, zoneId: 'deep_trench', description: 'An ancient sea serpent of immense power, guardian of the abyss', emoji: '🐍', requiredLevel: 20 },
  { id: 'kraken_jr', name: 'Kraken Jr', rarity: 'legendary', corals: [{ coralId: 'ancient_coral', amount: 1 }, { coralId: 'abyssal_coral', amount: 2 }, { coralId: 'ghost_coral', amount: 2 }, { coralId: 'black_coral', amount: 1 }], diveTime: 75, discoverValue: 240, xpReward: 120, zoneId: 'deep_trench', description: 'A young kraken already capable of crushing ships with its tentacles', emoji: '🦑', requiredLevel: 18 },
  { id: 'ancient_sea_turtle', name: 'Ancient Sea Turtle', rarity: 'legendary', corals: [{ coralId: 'ancient_coral', amount: 2 }, { coralId: 'golden_coral', amount: 1 }, { coralId: 'elkhorn', amount: 2 }, { coralId: 'crystal_coral', amount: 1 }], diveTime: 70, discoverValue: 220, xpReward: 110, zoneId: 'coral_reef', description: 'A thousand-year-old turtle whose shell holds the map to Atlantis', emoji: '🐢', requiredLevel: 22 },
  { id: 'siren_whale', name: 'Siren Whale', rarity: 'legendary', corals: [{ coralId: 'golden_coral', amount: 2 }, { coralId: 'ancient_coral', amount: 1 }, { coralId: 'crystal_coral', amount: 2 }, { coralId: 'sun_coral', amount: 1 }], diveTime: 70, discoverValue: 230, xpReward: 115, zoneId: 'bioluminescent_cavern', description: 'A mystical whale whose song can calm the fiercest ocean storms', emoji: '🐋', requiredLevel: 25 },
  // Mythic (3)
  { id: 'ocean_dragon', name: 'Ocean Dragon', rarity: 'mythic', corals: [{ coralId: 'void_coral', amount: 1 }, { coralId: 'ancient_coral', amount: 2 }, { coralId: 'dragon_coral', amount: 2 }, { coralId: 'black_coral', amount: 1 }, { coralId: 'golden_coral', amount: 1 }], diveTime: 100, discoverValue: 600, xpReward: 300, zoneId: 'abyssal_plain', description: 'A primordial dragon of the deep — master of currents and storms', emoji: '🐲', requiredLevel: 35 },
  { id: 'abyssal_horror', name: 'Abyssal Horror', rarity: 'mythic', corals: [{ coralId: 'void_coral', amount: 2 }, { coralId: 'abyssal_coral', amount: 2 }, { coralId: 'ancient_coral', amount: 1 }, { coralId: 'ghost_coral', amount: 2 }], diveTime: 95, discoverValue: 550, xpReward: 275, zoneId: 'deep_trench', description: 'An unspeakable entity from the deepest trench — to see it is to know fear', emoji: '👾', requiredLevel: 38 },
  { id: 'poseidons_steed', name: "Poseidon's Steed", rarity: 'mythic', corals: [{ coralId: 'void_coral', amount: 1 }, { coralId: 'golden_coral', amount: 2 }, { coralId: 'ancient_coral', amount: 2 }, { coralId: 'crystal_coral', amount: 1 }, { coralId: 'dragon_coral', amount: 1 }], diveTime: 110, discoverValue: 700, xpReward: 350, zoneId: 'bioluminescent_cavern', description: 'The divine hippocampus that once pulled Poseidon\'s chariot across the seas', emoji: '🐴', requiredLevel: 42 },
];

export const ML_TREASURES: TreasureDef[] = [
  { id: 'gold_coins', name: 'Gold Coins', kind: 'Currency', patience: 60, valueMultiplier: 1.0, favoriteZones: ['sunken_ship'], description: 'Doubloons from a sunken Spanish galleon, still gleaming', emoji: '🪙' },
  { id: 'silver_chalice', name: 'Silver Chalice', kind: 'Artifact', patience: 90, valueMultiplier: 1.1, favoriteZones: ['sunken_ship'], description: 'An ornate silver goblet encrusted with barnacles', emoji: '🏆' },
  { id: 'pearl', name: 'Pearl', kind: 'Gem', patience: 80, valueMultiplier: 1.3, favoriteZones: ['coral_reef', 'kelp_forest'], description: 'A perfectly round lustrous pearl from a giant oyster', emoji: '🫧' },
  { id: 'sea_glass', name: 'Sea Glass', kind: 'Material', patience: 45, valueMultiplier: 1.0, favoriteZones: ['coral_reef', 'iceberg_bay'], description: 'Smooth frost-colored glass tumbled by centuries of ocean currents', emoji: '🪟' },
  { id: 'emerald_ring', name: 'Emerald Ring', kind: 'Jewelry', patience: 50, valueMultiplier: 1.5, favoriteZones: ['sunken_ship', 'volcanic_vent'], description: 'A mermaid-crafted ring with a deep green gemstone', emoji: '💚' },
  { id: 'sapphire_crown', name: 'Sapphire Crown', kind: 'Artifact', patience: 55, valueMultiplier: 1.6, favoriteZones: ['deep_trench'], description: 'The crown of an undersea king, studded with blue sapphires', emoji: '👑' },
  { id: 'trident_shard', name: 'Trident Shard', kind: 'Relic', patience: 70, valueMultiplier: 1.8, favoriteZones: ['abyssal_plain', 'volcanic_vent'], description: 'A fragment of a legendary trident, still crackling with power', emoji: '🔱' },
  { id: 'golden_compass', name: 'Golden Compass', kind: 'Tool', patience: 65, valueMultiplier: 1.7, favoriteZones: ['sunken_ship', 'bioluminescent_cavern'], description: 'A compass that always points to the nearest treasure', emoji: '🧭' },
  { id: 'neptune_statue', name: 'Neptune Statue', kind: 'Artifact', patience: 100, valueMultiplier: 2.0, favoriteZones: ['deep_trench', 'abyssal_plain'], description: 'A marble statue of Neptune himself, radiating authority', emoji: '🗿' },
  { id: 'mermaid_tear', name: "Mermaid's Tear", kind: 'Relic', patience: 75, valueMultiplier: 2.2, favoriteZones: ['bioluminescent_cavern', 'coral_reef'], description: 'A crystallized teardrop with the power to calm any storm', emoji: '💧' },
  { id: 'poseidon_pearl', name: "Poseidon's Pearl", kind: 'Relic', patience: 80, valueMultiplier: 2.5, favoriteZones: ['abyssal_plain', 'deep_trench'], description: 'The legendary pearl from the forehead of a sea god', emoji: '🔮' },
  { id: 'atlantis_crystal', name: 'Atlantis Crystal', kind: 'Relic', patience: 120, valueMultiplier: 3.0, favoriteZones: ['abyssal_plain'], description: 'A crystal core from the lost city of Atlantis, pulsing with ancient energy', emoji: '💎' },
];

export const ML_STRUCTURES: StructureDef[] = [
  { id: 'coral_garden', name: 'Coral Garden', description: 'A dedicated reef-building plot that accelerates coral growth', emoji: '🌺', maxLevel: 10, bonusType: 'depth', baseBonusValue: 5, baseUpgradeCost: 50 },
  { id: 'pearl_nursery', name: 'Pearl Nursery', description: 'A safe haven for oysters to cultivate perfect pearls', emoji: '🫧', maxLevel: 10, bonusType: 'charm', baseBonusValue: 3, baseUpgradeCost: 60 },
  { id: 'sea_chart_table', name: 'Sea Chart Table', description: 'An enchanted navigation table that reveals hidden dive routes', emoji: '🗺️', maxLevel: 10, bonusType: 'charm', baseBonusValue: 4, baseUpgradeCost: 45 },
  { id: 'enchantment_shell', name: 'Enchantment Shell', description: 'A giant conch shell that amplifies creature-taming abilities', emoji: '🐚', maxLevel: 10, bonusType: 'depth', baseBonusValue: 4, baseUpgradeCost: 55 },
  { id: 'treasure_vault', name: 'Treasure Vault', description: 'An underwater vault that multiplies the value of found treasures', emoji: '🏦', maxLevel: 10, bonusType: 'yield', baseBonusValue: 3, baseUpgradeCost: 70 },
  { id: 'potion_kelp', name: 'Potion Kelp', description: 'Magical kelp that brews potions enhancing diving luck', emoji: '🧪', maxLevel: 10, bonusType: 'luck', baseBonusValue: 5, baseUpgradeCost: 80 },
  { id: 'deep_sonar', name: 'Deep Sonar', description: 'A sonic device that locates rare creatures in the deep', emoji: '📡', maxLevel: 10, bonusType: 'charm', baseBonusValue: 5, baseUpgradeCost: 90 },
  { id: 'palace_shard', name: 'Palace Shard', description: 'A fragment of the Mermaid Palace that radiates royal power', emoji: '🏰', maxLevel: 10, bonusType: 'luck', baseBonusValue: 6, baseUpgradeCost: 100 },
];

export const ML_QUESTS: QuestDef[] = [
  { id: 'quest_first_dive', name: 'First Dive', description: 'Complete 3 dives to prove your aquatic courage', type: 'dive', target: 3, rewardCoins: 100, rewardXP: 50, requiredLevel: 1, emoji: '🤿' },
  { id: 'quest_reef_explorer', name: 'Reef Explorer', description: 'Discover 5 common sea creatures in the coral reef', type: 'dive', target: 5, rewardCoins: 150, rewardXP: 75, requiredLevel: 1, emoji: '🐠' },
  { id: 'quest_first_tame', name: 'First Friend', description: 'Successfully befriend 3 sea creatures', type: 'discover', target: 3, rewardCoins: 80, rewardXP: 40, requiredLevel: 1, emoji: '🤝' },
  { id: 'quest_earn_500', name: 'Sunken Wealth', description: 'Earn a total of 500 coins from diving', type: 'earn', target: 500, rewardCoins: 200, rewardXP: 100, requiredLevel: 2, emoji: '💰' },
  { id: 'quest_collect_coral', name: 'Coral Collector', description: 'Gather 20 coral specimens of any rarity', type: 'collect', target: 20, rewardCoins: 300, rewardXP: 150, requiredLevel: 5, emoji: '🪸' },
  { id: 'quest_upgrade_zone', name: 'Zone Master', description: 'Upgrade any ocean zone to level 5', type: 'upgrade', target: 5, rewardCoins: 250, rewardXP: 125, requiredLevel: 6, emoji: '🔧' },
  { id: 'quest_rare_catch', name: 'Rare Catch', description: 'Discover 3 rare-rarity or higher creatures', type: 'dive', target: 3, rewardCoins: 400, rewardXP: 200, requiredLevel: 8, emoji: '💎' },
  { id: 'quest_befriend_20', name: 'Sea Ambassador', description: 'Befriend 20 sea creatures total', type: 'discover', target: 20, rewardCoins: 500, rewardXP: 250, requiredLevel: 10, emoji: '🐬' },
  { id: 'quest_earn_2000', name: 'Treasure Hunter', description: 'Earn a total of 2000 coins', type: 'earn', target: 2000, rewardCoins: 600, rewardXP: 300, requiredLevel: 12, emoji: '👑' },
  { id: 'quest_legendary_diver', name: 'Legend of the Deep', description: 'Discover 5 legendary or mythic sea creatures', type: 'dive', target: 5, rewardCoins: 800, rewardXP: 400, requiredLevel: 18, emoji: '🌟' },
];

export const ML_NPCS: NPCDef[] = [
  { id: 'npc_mermaid_queen', name: 'Queen Marisella', role: 'Mermaid Queen', description: 'The radiant ruler of the Mermaid Lagoon who guides new explorers', emoji: '👸', greeting: 'Welcome, surface dweller. The ocean has chosen you — will you answer its call?' },
  { id: 'npc_sea_merchant', name: 'Captain Kelpbeard', role: 'Sea Merchant', description: 'A grizzled old merman who trades rare corals and treasures', emoji: '🧓', greeting: 'Arrr! I have corals from every depth — for the right price, anything can be yours.' },
  { id: 'npc_coral_gardener', name: 'Thalassa', role: 'Coral Gardener', description: 'An ancient sea nymph who tends the coral gardens of the lagoon', emoji: '🧝‍♀️', greeting: 'Every reef begins with a single polyp. Let me teach you the ways of the coral.' },
  { id: 'npc_navigator', name: 'Old Finn the Depthreader', role: 'Navigator', description: 'A blind seer who senses ocean currents and hidden zones', emoji: '🧙', greeting: 'The currents whisper of great treasures below... if you dare to listen.' },
  { id: 'npc_sea_witch', name: 'Morgana the Tidal', role: 'Sea Witch', description: 'A mysterious enchantress who brews potions from deep-sea ingredients', emoji: '🧙‍♀️', greeting: 'My cauldron bubbles with the essence of the abyss. What wisdom do you seek?' },
  { id: 'npc_pearl_diver', name: 'Naiya Shellheart', role: 'Pearl Diver', description: 'The champion pearl diver whose record has never been broken', emoji: '🤿', greeting: 'The best pearls hide in the deepest waters. Let me show you where to look.' },
];

export const ML_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach_first_dive', name: 'First Splash', description: 'Complete your first dive', conditionKey: 'completedDives', targetValue: 1, rewardCoins: 10, rewardXP: 5, emoji: '💧' },
  { id: 'ach_dive_10', name: 'Getting Wet', description: 'Complete 10 dives', conditionKey: 'completedDives', targetValue: 10, rewardCoins: 50, rewardXP: 25, emoji: '🌊' },
  { id: 'ach_dive_50', name: 'Deep Sea Diver', description: 'Complete 50 dives', conditionKey: 'completedDives', targetValue: 50, rewardCoins: 200, rewardXP: 100, emoji: '🤿' },
  { id: 'ach_dive_100', name: 'Abyssal Pioneer', description: 'Complete 100 dives', conditionKey: 'completedDives', targetValue: 100, rewardCoins: 500, rewardXP: 250, emoji: '💯' },
  { id: 'ach_discover_5', name: 'First Friends', description: 'Befriend 5 sea creatures', conditionKey: 'discoveredCreatures', targetValue: 5, rewardCoins: 30, rewardXP: 15, emoji: '🐠' },
  { id: 'ach_discover_20', name: 'Ocean Ambassador', description: 'Befriend 20 sea creatures', conditionKey: 'discoveredCreatures', targetValue: 20, rewardCoins: 300, rewardXP: 150, emoji: '🐬' },
  { id: 'ach_earn_1000', name: 'Thousand Tides', description: 'Earn 1000 coins total', conditionKey: 'totalEarned', targetValue: 1000, rewardCoins: 100, rewardXP: 50, emoji: '💰' },
  { id: 'ach_earn_10000', name: 'Ocean Tycoon', description: 'Earn 10000 coins total', conditionKey: 'totalEarned', targetValue: 10000, rewardCoins: 1000, rewardXP: 500, emoji: '🤑' },
  { id: 'ach_level_10', name: 'Double Digits', description: 'Reach level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 150, rewardXP: 75, emoji: '🔟' },
  { id: 'ach_level_25', name: 'Ocean Guardian', description: 'Reach level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 400, rewardXP: 200, emoji: '🌟' },
  { id: 'ach_level_50', name: 'Ocean Sovereign', description: 'Reach the maximum level', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXP: 1000, emoji: '👑' },
  { id: 'ach_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day daily streak', conditionKey: 'dailyStreak', targetValue: 7, rewardCoins: 200, rewardXP: 100, emoji: '📅' },
  { id: 'ach_streak_30', name: 'Monthly Devotee', description: 'Maintain a 30-day daily streak', conditionKey: 'dailyStreak', targetValue: 30, rewardCoins: 1000, rewardXP: 500, emoji: '🗓️' },
  { id: 'ach_expedition_win', name: 'Expedition Champion', description: 'Win a deep sea expedition', conditionKey: 'expeditionWins', targetValue: 1, rewardCoins: 500, rewardXP: 250, emoji: '🏆' },
  { id: 'ach_all_common_creatures', name: 'Common Collection', description: 'Discover all common sea creatures', conditionKey: 'unlockedCommonCreatures', targetValue: 8, rewardCoins: 100, rewardXP: 50, emoji: '📖' },
];

export const ML_DAILY_TASK_POOL: DailyTaskPoolDef[] = [
  { id: 'daily_dive_3', name: 'Daily Dive', description: 'Complete 3 dives today', type: 'dive', target: 3, rewardCoins: 30, rewardXP: 15, emoji: '🤿' },
  { id: 'daily_dive_5', name: 'Dive Frenzy', description: 'Complete 5 dives today', type: 'dive', target: 5, rewardCoins: 50, rewardXP: 25, emoji: '🌊' },
  { id: 'daily_dive_10', name: 'Dive Marathon', description: 'Complete 10 dives today', type: 'dive', target: 10, rewardCoins: 100, rewardXP: 50, emoji: '⚡' },
  { id: 'daily_discover_2', name: 'Daily Discovery', description: 'Befriend 2 sea creatures today', type: 'discover', target: 2, rewardCoins: 25, rewardXP: 12, emoji: '🐬' },
  { id: 'daily_discover_5', name: 'Busy Day', description: 'Befriend 5 sea creatures today', type: 'discover', target: 5, rewardCoins: 60, rewardXP: 30, emoji: '🎉' },
  { id: 'daily_earn_200', name: 'Daily Income', description: 'Earn 200 coins today', type: 'earn', target: 200, rewardCoins: 40, rewardXP: 20, emoji: '💰' },
  { id: 'daily_earn_500', name: 'Big Haul', description: 'Earn 500 coins today', type: 'earn', target: 500, rewardCoins: 80, rewardXP: 40, emoji: '💎' },
  { id: 'daily_craft_5', name: 'Coral Gathering', description: 'Buy 5 corals today', type: 'craft', target: 5, rewardCoins: 20, rewardXP: 10, emoji: '🪸' },
];

// ============================================================
// Initial State Factory
// ============================================================

function createInitialState(seed?: number): MermaidLagoonState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    level: 1,
    xp: 0,
    coins: 100,
    unlockedCreatures: ['clownfish', 'blue_tang', 'sea_urchin', 'starfish', 'hermit_crab', 'sea_snail', 'sardine', 'pufferfish'],
    activeZone: 'coral_reef',
    corals: { brain_coral: 10, fan_coral: 5, moon_coral: 5, staghorn: 3, table_coral: 3 },
    activeEncounters: [],
    reefHealth: 100,
    completedDives: 0,
    discoveredCreatures: 0,
    totalEarned: 0,
    totalSpent: 0,
    divingQueue: [],
    dailyStreak: 0,
    lastDaily: null,
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: ML_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    expeditionEntries: 0,
    expeditionWins: 0,
    expeditionLastRank: null,
    dailyTask: null,
    zones: ML_ZONES.map((z) => ({ id: z.id, level: 1 })),
    structures: ML_STRUCTURES.map((s) => ({ id: s.id, level: 1, equipped: s.id === 'coral_garden' })),
    seed: effectiveSeed,
    diveCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    coralCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    zoneUpgradeCount: 0,
    structureUpgradeCount: 0,
  };
}

// ============================================================
// Hook: useMermaidLagoon
// ============================================================

export function useMermaidLagoon(initialSeed?: number) {
  const [state, setState] = useState<MermaidLagoonState>(() => createInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // ---- Core State ----

  const mlGetState = useCallback((): Readonly<MermaidLagoonState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const mlResetState = useCallback((newSeed?: number) => {
    const s = createInitialState(newSeed);
    prngRef.current = mulberry32(s.seed);
    setState(s);
  }, []);

  const mlSeed = useCallback((seed: number) => {
    prngRef.current = mulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const mlRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const mlRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const mlRandomChoice = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const mlGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const mlGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const mlGetXPTillNext = useCallback((): number => {
    return xpRequiredForLevel(state.level);
  }, [state.level]);

  const mlGetXPTotal = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const mlAddXP = useCallback((amount: number): MermaidLagoonState => {
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += Math.floor(amount);
      while (level < ML_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= ML_MAX_LEVEL) xp = 0;
      next = { ...prev, level: clampLevel(level), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Title ----

  const mlGetTitle = useCallback((): TitleInfo => {
    let current = ML_TITLE_THRESHOLDS[0];
    for (const t of ML_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const mlGetAllTitles = useCallback((): TitleInfo[] => {
    return [...ML_TITLE_THRESHOLDS];
  }, []);

  const mlGetNextTitle = useCallback((): TitleInfo | null => {
    for (const t of ML_TITLE_THRESHOLDS) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const mlGetProgress = useCallback((): number => {
    const needed = xpRequiredForLevel(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const mlGetOverallProgress = useCallback((): number => {
    return state.level / ML_MAX_LEVEL;
  }, [state.level]);

  // ---- Coins ----

  const mlGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const mlAddCoins = useCallback((amount: number): MermaidLagoonState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins + amount), totalEarned: prev.totalEarned + Math.max(0, amount) };
      return next;
    });
    return next;
  }, [state]);

  const mlSpendCoins = useCallback((amount: number): { success: boolean; state: MermaidLagoonState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: clampCoins(prev.coins - amount), totalSpent: prev.totalSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const mlCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Creatures ----

  const mlGetCreatures = useCallback((): CreatureDef[] => {
    return [...ML_CREATURES];
  }, []);

  const mlGetUnlockedCreatures = useCallback((): CreatureDef[] => {
    return ML_CREATURES.filter((c) => state.unlockedCreatures.includes(c.id));
  }, [state.unlockedCreatures]);

  const mlGetLockedCreatures = useCallback((): CreatureDef[] => {
    return ML_CREATURES.filter((c) => !state.unlockedCreatures.includes(c.id));
  }, [state.unlockedCreatures]);

  const mlGetCreatureById = useCallback((id: string): CreatureDef | null => {
    return ML_CREATURES.find((c) => c.id === id) ?? null;
  }, []);

  const mlIsCreatureUnlocked = useCallback((creatureId: string): boolean => {
    return state.unlockedCreatures.includes(creatureId);
  }, [state.unlockedCreatures]);

  const mlUnlockCreature = useCallback((creatureId: string): { success: boolean; state: MermaidLagoonState } => {
    const creature = ML_CREATURES.find((c) => c.id === creatureId);
    if (!creature) return { success: false, state };
    if (state.unlockedCreatures.includes(creatureId)) return { success: false, state };
    if (state.level < creature.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      if (prev.unlockedCreatures.includes(creatureId)) return prev;
      next = { ...prev, unlockedCreatures: [...prev.unlockedCreatures, creatureId] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Zones ----

  const mlGetZones = useCallback((): ZoneDef[] => {
    return [...ML_ZONES];
  }, []);

  const mlGetZoneLevels = useCallback((): ZoneState[] => {
    return [...state.zones];
  }, [state.zones]);

  const mlGetActiveZone = useCallback((): ZoneDef | null => {
    return ML_ZONES.find((z) => z.id === state.activeZone) ?? null;
  }, [state.activeZone]);

  const mlSetActiveZone = useCallback((zoneId: string): { success: boolean; state: MermaidLagoonState } => {
    const exists = ML_ZONES.find((z) => z.id === zoneId);
    if (!exists) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, activeZone: zoneId };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const mlGetZoneLevel = useCallback((zoneId: string): number => {
    const z = state.zones.find((zs) => zs.id === zoneId);
    return z?.level ?? 1;
  }, [state.zones]);

  const mlGetZoneDepthBonus = useCallback((zoneId: string): number => {
    const def = ML_ZONES.find((z) => z.id === zoneId);
    const z = state.zones.find((zs) => zs.id === zoneId);
    if (!def || !z) return 1;
    return def.baseDepthBonus * (1 + (z.level - 1) * 0.1);
  }, [state.zones]);

  const mlGetZoneCharmBonus = useCallback((zoneId: string): number => {
    const def = ML_ZONES.find((z) => z.id === zoneId);
    const z = state.zones.find((zs) => zs.id === zoneId);
    if (!def || !z) return 0;
    return def.baseCharmBonus + (z.level - 1) * 2;
  }, [state.zones]);

  const mlUpgradeZone = useCallback((zoneId: string): { success: boolean; cost: number; state: MermaidLagoonState } => {
    const def = ML_ZONES.find((z) => z.id === zoneId);
    const z = state.zones.find((zs) => zs.id === zoneId);
    if (!def || !z) return { success: false, cost: 0, state };
    if (z.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.6, z.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const newZones = prev.zones.map((z) =>
        z.id === zoneId ? { ...z, level: z.level + 1 } : z
      );
      next = {
        ...prev,
        zones: newZones,
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        zoneUpgradeCount: prev.zoneUpgradeCount + 1,
      };
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Corals ----

  const mlGetCorals = useCallback((): CoralDef[] => {
    return [...ML_CORALS];
  }, []);

  const mlGetCoralById = useCallback((id: string): CoralDef | null => {
    return ML_CORALS.find((c) => c.id === id) ?? null;
  }, []);

  const mlGetInventory = useCallback((): Record<string, number> => {
    return { ...state.corals };
  }, [state.corals]);

  const mlGetCoralCount = useCallback((coralId: string): number => {
    return state.corals[coralId] ?? 0;
  }, [state.corals]);

  const mlGetCoralCost = useCallback((coralId: string): number => {
    const def = ML_CORALS.find((c) => c.id === coralId);
    return def?.cost ?? 0;
  }, []);

  const mlBuyCoral = useCallback((coralId: string, amount: number = 1): { success: boolean; cost: number; state: MermaidLagoonState } => {
    const def = ML_CORALS.find((c) => c.id === coralId);
    if (!def) return { success: false, cost: 0, state };
    const totalCost = def.cost * amount;
    if (state.coins < totalCost) return { success: false, cost: totalCost, state };
    let next = state;
    setState((prev) => {
      const newCorals = { ...prev.corals, [coralId]: (prev.corals[coralId] ?? 0) + amount };
      const newCountByRarity = { ...prev.coralCountByRarity, [def.rarity]: prev.coralCountByRarity[def.rarity] + amount };
      next = {
        ...prev,
        corals: newCorals,
        coins: clampCoins(prev.coins - totalCost),
        totalSpent: prev.totalSpent + totalCost,
        coralCountByRarity: newCountByRarity,
      };
      // Update daily task if it's craft type
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = ML_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'craft') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + amount },
          };
        }
      }
      return next;
    });
    return { success: true, cost: totalCost, state: next };
  }, [state]);

  const mlUseCoral = useCallback((coralId: string, amount: number = 1): boolean => {
    const current = state.corals[coralId] ?? 0;
    if (current < amount) return false;
    let success = false;
    setState((prev) => {
      const have = prev.corals[coralId] ?? 0;
      if (have < amount) { success = false; return prev; }
      success = true;
      const newCorals = { ...prev.corals };
      newCorals[coralId] = have - amount;
      if (newCorals[coralId] <= 0) delete newCorals[coralId];
      return { ...prev, corals: newCorals };
    });
    return success;
  }, [state]);

  const mlHasCorals = useCallback((creatureId: string): boolean => {
    const creature = ML_CREATURES.find((c) => c.id === creatureId);
    if (!creature) return false;
    return creature.corals.every((c) => (state.corals[c.coralId] ?? 0) >= c.amount);
  }, [state.corals]);

  const mlGetMissingCorals = useCallback((creatureId: string): { coralId: string; name: string; have: number; need: number }[] => {
    const creature = ML_CREATURES.find((c) => c.id === creatureId);
    if (!creature) return [];
    return creature.corals
      .map((c) => {
        const def = ML_CORALS.find((co) => co.id === c.coralId);
        const have = state.corals[c.coralId] ?? 0;
        return { coralId: c.coralId, name: def?.name ?? c.coralId, have, need: c.amount };
      })
      .filter((m) => m.have < m.need);
  }, [state.corals]);

  // ---- Diving ----

  const mlDive = useCallback((creatureId: string, now: number = Date.now()): { success: boolean; diveJob: DiveJob | null; state: MermaidLagoonState } => {
    const creature = ML_CREATURES.find((c) => c.id === creatureId);
    if (!creature) return { success: false, diveJob: null, state };
    if (!state.unlockedCreatures.includes(creatureId)) return { success: false, diveJob: null, state };

    // Check corals
    const hasAll = creature.corals.every((c) => (state.corals[c.coralId] ?? 0) >= c.amount);
    if (!hasAll) return { success: false, diveJob: null, state };

    // Check zone
    if (state.activeZone !== creature.zoneId) return { success: false, diveJob: null, state };

    // Check not already diving (max 3 slots)
    if (state.divingQueue.length >= 3) return { success: false, diveJob: null, state };

    // Calculate depth bonus from zone and structures
    const depthMult = mlGetZoneDepthBonus(creature.zoneId);
    const equippedStructures = state.structures.filter((s) => s.equipped);
    let structureDepthBonus = 0;
    for (const ss of equippedStructures) {
      const def = ML_STRUCTURES.find((sd) => sd.id === ss.id);
      if (def && def.bonusType === 'depth') {
        structureDepthBonus += def.baseBonusValue * (0.5 + ss.level * 0.15);
      }
    }
    const effectiveDepth = depthMult + structureDepthBonus * 0.01;

    const adjustedTime = Math.max(5, Math.floor(creature.diveTime / effectiveDepth));
    const charmBase = mlGetZoneCharmBonus(creature.zoneId);
    let structureCharmBonus = 0;
    for (const ss of equippedStructures) {
      const def = ML_STRUCTURES.find((sd) => sd.id === ss.id);
      if (def && def.bonusType === 'charm') {
        structureCharmBonus += def.baseBonusValue * (0.5 + ss.level * 0.15);
      }
    }
    const quality = Math.min(100, 50 + charmBase + structureCharmBonus + Math.floor(prngRef.current() * 10));

    const diveJob: DiveJob = {
      id: `dive_${creatureId}_${now}`,
      creatureId,
      startedAt: now,
      endsAt: now + adjustedTime * 1000,
      quality,
      zoneId: creature.zoneId,
    };

    let next = state;
    setState((prev) => {
      const newCorals = { ...prev.corals };
      for (const c of creature.corals) {
        const have = newCorals[c.coralId] ?? 0;
        newCorals[c.coralId] = have - c.amount;
        if (newCorals[c.coralId] <= 0) delete newCorals[c.coralId];
      }

      // Yield bonus from structures
      let extraYield = 0;
      for (const ss of prev.structures.filter((s) => s.equipped)) {
        const def = ML_STRUCTURES.find((sd) => sd.id === ss.id);
        if (def && def.bonusType === 'yield') {
          extraYield += def.baseBonusValue * (0.5 + ss.level * 0.15);
        }
      }
      const bonusYield = prngRef.current() * 100 < extraYield ? 1 : 0;

      next = {
        ...prev,
        corals: newCorals,
        divingQueue: [...prev.divingQueue, diveJob],
      };

      // Quest progress
      next = mlProcessQuestProgress(next, 'dive', 1 + bonusYield);

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = ML_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'dive') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + (1 + bonusYield) },
          };
        }
      }

      return next;
    });

    return { success: true, diveJob, state: next };
  }, [state, mlGetZoneDepthBonus, mlGetZoneCharmBonus]);

  const mlGetDivingQueue = useCallback((): DiveJob[] => {
    return [...state.divingQueue];
  }, [state.divingQueue]);

  const mlCancelDive = useCallback((diveJobId: string): { success: boolean; state: MermaidLagoonState } => {
    const idx = state.divingQueue.findIndex((d) => d.id === diveJobId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const creature = ML_CREATURES.find((c) => c.id === prev.divingQueue[idx].creatureId);
      let newCorals = { ...prev.corals };
      if (creature) {
        for (const c of creature.corals) {
          newCorals[c.coralId] = (newCorals[c.coralId] ?? 0) + c.amount;
        }
      }
      const newQueue = [...prev.divingQueue];
      newQueue.splice(idx, 1);
      next = { ...prev, corals: newCorals, divingQueue: newQueue };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const mlCollectDive = useCallback((diveJobId: string, now: number = Date.now()): { success: boolean; creature: CreatureDef | null; quality: number; coinsEarned: number; xpEarned: number; state: MermaidLagoonState } => {
    const job = state.divingQueue.find((d) => d.id === diveJobId);
    if (!job) return { success: false, creature: null, quality: 0, coinsEarned: 0, xpEarned: 0, state };
    if (now < job.endsAt) return { success: false, creature: null, quality: 0, coinsEarned: 0, xpEarned: 0, state };

    const creature = ML_CREATURES.find((c) => c.id === job.creatureId);
    if (!creature) return { success: false, creature: null, quality: 0, coinsEarned: 0, xpEarned: 0, state };

    const qualityMult = job.quality / 100;
    const rarityMult = rarityMultiplier(creature.rarity);
    const coinsEarned = Math.floor(creature.discoverValue * qualityMult * (0.8 + rarityMult * 0.2));
    const xpEarned = Math.floor(creature.xpReward * qualityMult * rarityMult);

    let next = state;
    setState((prev) => {
      const newQueue = prev.divingQueue.filter((d) => d.id !== diveJobId);
      const newDiveCountByRarity = { ...prev.diveCountByRarity, [creature.rarity]: prev.diveCountByRarity[creature.rarity] + 1 };

      next = {
        ...prev,
        divingQueue: newQueue,
        coins: clampCoins(prev.coins + coinsEarned),
        totalEarned: prev.totalEarned + coinsEarned,
        completedDives: prev.completedDives + 1,
        diveCountByRarity: newDiveCountByRarity,
      };

      // Add XP and handle level up
      let { level, xp } = next;
      xp += xpEarned;
      while (level < ML_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= ML_MAX_LEVEL) xp = 0;
      next = { ...next, level: clampLevel(level), xp };

      // Quest progress for earn
      next = mlProcessQuestProgress(next, 'earn', coinsEarned);

      return next;
    });

    return { success: true, creature, quality: job.quality, coinsEarned, xpEarned, state: next };
  }, [state]);

  const mlGetDiveTimeRemaining = useCallback((diveJobId: string, now: number = Date.now()): number => {
    const job = state.divingQueue.find((d) => d.id === diveJobId);
    if (!job) return 0;
    return Math.max(0, job.endsAt - now);
  }, [state.divingQueue]);

  const mlGetCreatureProfit = useCallback((creatureId: string): number => {
    const creature = ML_CREATURES.find((c) => c.id === creatureId);
    if (!creature) return 0;
    let coralCost = 0;
    for (const c of creature.corals) {
      const def = ML_CORALS.find((co) => co.id === c.coralId);
      if (def) coralCost += def.cost * c.amount;
    }
    return creature.discoverValue - coralCost;
  }, []);

  // ---- Treasure Encounters ----

  const mlGetTreasures = useCallback((): TreasureDef[] => {
    return [...ML_TREASURES];
  }, []);

  const mlGetActiveEncounters = useCallback((): ActiveEncounter[] => {
    return [...state.activeEncounters];
  }, [state]);

  const mlSpawnEncounter = useCallback((now: number = Date.now()): { success: boolean; treasure: TreasureDef | null; state: MermaidLagoonState } => {
    if (state.activeEncounters.length >= 5) return { success: false, treasure: null, state };
    // Pick a random treasure not already active
    const activeIds = new Set(state.activeEncounters.map((e) => e.id));
    const available = ML_TREASURES.filter((t) => !activeIds.has(t.id));
    if (available.length === 0) return { success: false, treasure: null, state };

    const treasure = available[Math.floor(prngRef.current() * available.length)];
    const encounter: ActiveEncounter = {
      id: treasure.id,
      encounteredAt: now,
      treasureId: treasure.id,
      tamed: false,
      befriended: false,
    };

    let next = state;
    setState((prev) => {
      next = { ...prev, activeEncounters: [...prev.activeEncounters, encounter] };
      return next;
    });

    return { success: true, treasure, state: next };
  }, [state]);

  const mlTameEncounter = useCallback((encounterId: string, now: number = Date.now()): { success: boolean; reward: number; reefHealth: number; state: MermaidLagoonState } => {
    const active = state.activeEncounters.find((e) => e.id === encounterId);
    if (!active || active.tamed) return { success: false, reward: 0, reefHealth: state.reefHealth, state };

    const treasureDef = ML_TREASURES.find((t) => t.id === encounterId);
    if (!treasureDef) return { success: false, reward: 0, reefHealth: state.reefHealth, state };

    const isFavorite = treasureDef.favoriteZones.includes(state.activeZone);
    const elapsed = (now - active.encounteredAt) / 1000;
    const patienceRatio = Math.max(0, 1 - elapsed / treasureDef.patience);

    let healthGain = isFavorite ? 15 : 5;
    healthGain = Math.floor(healthGain * (0.5 + patienceRatio * 0.5));

    const baseReward = isFavorite ? 20 : 5;
    const reward = Math.floor(baseReward * treasureDef.valueMultiplier * (0.5 + patienceRatio * 0.5));

    let next = state;
    setState((prev) => {
      const newActive = prev.activeEncounters.map((e) =>
        e.id === encounterId ? { ...e, tamed: true, befriended: patienceRatio > 0.3 } : e
      );
      const newReefHealth = Math.min(100, prev.reefHealth + healthGain);

      next = {
        ...prev,
        activeEncounters: newActive,
        reefHealth: newReefHealth,
        coins: clampCoins(prev.coins + reward),
        totalEarned: prev.totalEarned + reward,
        discoveredCreatures: prev.discoveredCreatures + 1,
      };

      // Quest progress
      next = mlProcessQuestProgress(next, 'discover', 1);

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const poolDef = ML_DAILY_TASK_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (poolDef && poolDef.type === 'discover') {
          next = {
            ...next,
            dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 },
          };
        }
      }

      // Earn quest progress
      next = mlProcessQuestProgress(next, 'earn', reward);

      return next;
    });

    return { success: true, reward, reefHealth: Math.min(100, state.reefHealth + healthGain), state: next };
  }, [state]);

  const mlDismissEncounter = useCallback((encounterId: string): { success: boolean; state: MermaidLagoonState } => {
    const idx = state.activeEncounters.findIndex((e) => e.id === encounterId);
    if (idx === -1) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newActive = [...prev.activeEncounters];
      newActive.splice(idx, 1);
      const wasBefriended = prev.activeEncounters[idx].befriended;
      next = {
        ...prev,
        activeEncounters: newActive,
        reefHealth: Math.max(0, prev.reefHealth - (wasBefriended ? 0 : 10)),
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const mlGetReefHealth = useCallback((): number => {
    return state.reefHealth;
  }, [state.reefHealth]);

  const mlGetEncounterTreasure = useCallback((encounterId: string): string | null => {
    const active = state.activeEncounters.find((e) => e.id === encounterId);
    return active?.treasureId ?? null;
  }, [state]);

  const mlAutoSpawnEncounters = useCallback((now: number = Date.now()): MermaidLagoonState => {
    const maxEncounters = Math.min(5, 1 + Math.floor(state.level / 5));
    const rng = mulberry32(now + state.seed);
    while (state.activeEncounters.length < maxEncounters) {
      const available = ML_TREASURES.filter((t) => !state.activeEncounters.some((ae) => ae.id === t.id));
      if (available.length === 0) break;
      if (rng() > 0.3) break;
      break;
    }
    return state;
  }, [state]);

  // ---- Structures ----

  const mlGetStructures = useCallback((): StructureDef[] => {
    return [...ML_STRUCTURES];
  }, []);

  const mlGetStructureStates = useCallback((): StructureState[] => {
    return [...state.structures];
  }, [state.structures]);

  const mlGetEquippedStructures = useCallback((): StructureState[] => {
    return state.structures.filter((s) => s.equipped);
  }, [state.structures]);

  const mlGetStructureLevel = useCallback((structureId: string): number => {
    const s = state.structures.find((ss) => ss.id === structureId);
    return s?.level ?? 1;
  }, [state.structures]);

  const mlGetStructureBonus = useCallback((structureId: string): number => {
    const ss = state.structures.find((s) => s.id === structureId);
    const def = ML_STRUCTURES.find((s) => s.id === structureId);
    if (!ss || !def) return 0;
    return def.baseBonusValue * (0.5 + ss.level * 0.15);
  }, [state.structures]);

  const mlEquipStructure = useCallback((structureId: string): { success: boolean; state: MermaidLagoonState } => {
    const def = ML_STRUCTURES.find((s) => s.id === structureId);
    if (!def) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newStructures = prev.structures.map((s) => ({
        ...s,
        equipped: s.id === structureId ? true : (s.equipped && ML_STRUCTURES.find((d) => d.id === s.id)?.bonusType === def.bonusType ? false : s.equipped),
      }));
      next = { ...prev, structures: newStructures };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const mlUpgradeStructure = useCallback((structureId: string): { success: boolean; cost: number; state: MermaidLagoonState } => {
    const def = ML_STRUCTURES.find((s) => s.id === structureId);
    const ss = state.structures.find((s) => s.id === structureId);
    if (!def || !ss) return { success: false, cost: 0, state };
    if (ss.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, ss.level - 1));
    if (state.coins < cost) return { success: false, cost, state };
    let next = state;
    setState((prev) => {
      const newStructures = prev.structures.map((s) =>
        s.id === structureId ? { ...s, level: s.level + 1 } : s
      );
      next = {
        ...prev,
        structures: newStructures,
        coins: clampCoins(prev.coins - cost),
        totalSpent: prev.totalSpent + cost,
        structureUpgradeCount: prev.structureUpgradeCount + 1,
      };
      // Quest progress for upgrade
      const maxZoneLevel = Math.max(...prev.zones.map((z) => z.level));
      const maxStructureLevel = Math.max(...newStructures.map((s) => s.level));
      next = mlProcessQuestProgress(next, 'upgrade', Math.max(maxZoneLevel, maxStructureLevel));
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Quests ----

  const mlGetQuests = useCallback((): QuestDef[] => {
    return [...ML_QUESTS];
  }, []);

  const mlGetActiveQuests = useCallback((): (QuestDef & QuestState)[] => {
    return state.activeQuests.map((aq) => {
      const def = ML_QUESTS.find((q) => q.id === aq.id);
      if (!def) return { ...aq, name: '', description: '', type: 'dive' as QuestType, target: 0, rewardCoins: 0, rewardXP: 0, requiredLevel: 0, emoji: '' };
      return { ...aq, ...def };
    });
  }, [state.activeQuests]);

  const mlGetAvailableQuests = useCallback((): QuestDef[] => {
    const activeIds = new Set(state.activeQuests.map((q) => q.id));
    const completedIds = new Set(state.completedQuests);
    return ML_QUESTS.filter((q) => !activeIds.has(q.id) && !completedIds.has(q.id) && state.level >= q.requiredLevel);
  }, [state.activeQuests, state.completedQuests, state.level]);

  const mlGetCompletedQuests = useCallback((): string[] => {
    return [...state.completedQuests];
  }, [state.completedQuests]);

  const mlAcceptQuest = useCallback((questId: string): { success: boolean; state: MermaidLagoonState } => {
    const def = ML_QUESTS.find((q) => q.id === questId);
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

  const mlGetQuestProgress = useCallback((questId: string): number => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    return aq?.progress ?? 0;
  }, [state.activeQuests]);

  const mlCompleteQuest = useCallback((questId: string): { success: boolean; rewardCoins: number; rewardXP: number; state: MermaidLagoonState } => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    if (!aq || !aq.completed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const def = ML_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    let next = state;
    setState((prev) => {
      const newActive = prev.activeQuests.filter((q) => q.id !== questId);
      let { level, xp } = prev;
      xp += def.rewardXP;
      while (level < ML_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= ML_MAX_LEVEL) xp = 0;

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

  const mlAbandonQuest = useCallback((questId: string): { success: boolean; state: MermaidLagoonState } => {
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

  const mlGetAchievements = useCallback((): AchievementDef[] => {
    return [...ML_ACHIEVEMENTS];
  }, []);

  const mlGetUnlockedAchievements = useCallback((): AchievementState[] => {
    return state.unlockedAchievements.filter((a) => a.unlocked);
  }, [state.unlockedAchievements]);

  const mlIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    const a = state.unlockedAchievements.find((ach) => ach.id === achievementId);
    return a?.unlocked ?? false;
  }, [state.unlockedAchievements]);

  const mlCheckAchievements = useCallback((): AchievementState[] => {
    const now = Date.now();
    let next = state;
    const newlyUnlocked: AchievementState[] = [];

    setState((prev) => {
      let updated = prev;
      const commonCreatureCount = ML_CREATURES.filter((c) => c.rarity === 'common' && prev.unlockedCreatures.includes(c.id)).length;

      for (const ach of ML_ACHIEVEMENTS) {
        const currentState = updated.unlockedAchievements.find((a) => a.id === ach.id);
        if (!currentState || currentState.unlocked) continue;

        let value = 0;
        switch (ach.conditionKey) {
          case 'completedDives': value = updated.completedDives; break;
          case 'discoveredCreatures': value = updated.discoveredCreatures; break;
          case 'totalEarned': value = updated.totalEarned; break;
          case 'level': value = updated.level; break;
          case 'dailyStreak': value = updated.dailyStreak; break;
          case 'expeditionWins': value = updated.expeditionWins; break;
          case 'unlockedCommonCreatures': value = commonCreatureCount; break;
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
          // Apply XP
          let { level, xp } = updated;
          xp += ach.rewardXP;
          while (level < ML_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
            xp -= xpRequiredForLevel(level);
            level += 1;
          }
          if (level >= ML_MAX_LEVEL) xp = 0;
          updated = { ...updated, level: clampLevel(level), xp };
        }
      }
      next = updated;
      return updated;
    });

    return newlyUnlocked;
  }, [state]);

  const mlUnlockAchievement = useCallback((achievementId: string): { success: boolean; state: MermaidLagoonState } => {
    const ach = ML_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return { success: false, state };
    const current = state.unlockedAchievements.find((a) => a.id === achievementId);
    if (current?.unlocked) return { success: false, state };

    let next = state;
    const now = Date.now();
    setState((prev) => {
      let { level, xp } = prev;
      xp += ach.rewardXP;
      while (level < ML_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= ML_MAX_LEVEL) xp = 0;

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

  const mlGetDailyTask = useCallback((): DailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const mlRefreshDailyTask = useCallback((now: number = Date.now()): { dailyTask: DailyTaskPoolDef | null; state: MermaidLagoonState } => {
    const dayKey = generateDayKey(now);

    // Check if we need a new daily task
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const pool = ML_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return { dailyTask: pool ?? null, state };
    }

    // Generate new daily task based on day seed
    const daySeed = mlHashString(dayKey) & 0x7fffffff;
    const rng = mulberry32(daySeed);
    const taskIndex = Math.floor(rng() * ML_DAILY_TASK_POOL.length);
    const task = ML_DAILY_TASK_POOL[taskIndex];

    // Update streak
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

  const mlClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: MermaidLagoonState } => {
    const dailyTask = state.dailyTask;
    if (!dailyTask || dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = ML_DAILY_TASK_POOL.find((d) => d.id === dailyTask.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    // Streak bonus
    const streakBonus = 1 + state.dailyStreak * 0.05;
    const rewardCoins = Math.floor(poolDef.rewardCoins * streakBonus);
    const rewardXP = Math.floor(poolDef.rewardXP * streakBonus);

    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += rewardXP;
      while (level < ML_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= ML_MAX_LEVEL) xp = 0;

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

  const mlGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const mlGetLastDaily = useCallback((): string | null => {
    return state.lastDaily;
  }, [state.lastDaily]);

  // ---- Expedition (like Bake-Off) ----

  const mlEnterExpedition = useCallback((creatureId: string, now: number = Date.now()): { success: boolean; rank: number; prize: number; state: MermaidLagoonState } => {
    const creature = ML_CREATURES.find((c) => c.id === creatureId);
    if (!creature || !state.unlockedCreatures.includes(creatureId)) {
      return { success: false, rank: 0, prize: 0, state };
    }

    // Simulate expedition using PRNG
    const contestSeed = mlHashString(`expedition_${now}_${state.seed}`);
    const rng = mulberry32(contestSeed);
    const zoneLevel = state.zones.find((z) => z.id === creature.zoneId)?.level ?? 1;
    const structureCharm = state.structures.filter((s) => s.equipped).reduce((acc, ss) => {
      const def = ML_STRUCTURES.find((d) => d.id === ss.id);
      return acc + (def?.bonusType === 'charm' ? def.baseBonusValue * (0.5 + ss.level * 0.15) : 0);
    }, 0);

    const baseScore = 40 + zoneLevel * 3 + structureCharm + rarityMultiplier(creature.rarity) * 10;
    const luckBonus = state.structures.filter((s) => s.equipped).reduce((acc, ss) => {
      const def = ML_STRUCTURES.find((d) => d.id === ss.id);
      return acc + (def?.bonusType === 'luck' ? def.baseBonusValue * (0.5 + ss.level * 0.15) : 0);
    }, 0);
    const myScore = baseScore + rng() * 20 + luckBonus * 2;

    // Generate 9 NPC scores
    const npcScores: number[] = [];
    for (let i = 0; i < 9; i++) {
      npcScores.push(30 + rng() * 70);
    }
    const allScores = [...npcScores, myScore];
    allScores.sort((a, b) => b - a);
    const rank = allScores.indexOf(myScore) + 1;

    const prizes = [0, 500, 300, 150, 75, 30, 10, 0, 0, 0];
    const prize = prizes[rank - 1] ?? 0;
    const isWin = rank === 1;

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        expeditionEntries: prev.expeditionEntries + 1,
        expeditionWins: prev.expeditionWins + (isWin ? 1 : 0),
        expeditionLastRank: rank,
        coins: clampCoins(prev.coins + prize),
        totalEarned: prev.totalEarned + prize,
      };

      // XP for participation
      const participationXP = Math.floor(creature.xpReward * 0.5);
      let { level, xp } = next;
      xp += participationXP;
      while (level < ML_MAX_LEVEL && xp >= xpRequiredForLevel(level)) {
        xp -= xpRequiredForLevel(level);
        level += 1;
      }
      if (level >= ML_MAX_LEVEL) xp = 0;
      next = { ...next, level: clampLevel(level), xp };
      return next;
    });

    return { success: true, rank, prize, state: next };
  }, [state]);

  const mlGetExpeditionRank = useCallback((): number | null => {
    return state.expeditionLastRank;
  }, [state.expeditionLastRank]);

  const mlGetExpeditionStats = useCallback((): { entries: number; wins: number; winRate: number; lastRank: number | null } => {
    return {
      entries: state.expeditionEntries,
      wins: state.expeditionWins,
      winRate: state.expeditionEntries > 0 ? state.expeditionWins / state.expeditionEntries : 0,
      lastRank: state.expeditionLastRank,
    };
  }, [state]);

  // ---- Stats ----

  const mlGetStats = useCallback(() => {
    return {
      completedDives: state.completedDives,
      discoveredCreatures: state.discoveredCreatures,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      profit: state.totalEarned - state.totalSpent,
      reefHealth: state.reefHealth,
      dailyStreak: state.dailyStreak,
      expeditionEntries: state.expeditionEntries,
      expeditionWins: state.expeditionWins,
      unlockedCreatureCount: state.unlockedCreatures.length,
      totalCreatureCount: ML_CREATURES.length,
      questsCompleted: state.completedQuests.length,
      achievementsUnlocked: state.unlockedAchievements.filter((a) => a.unlocked).length,
      zoneUpgradeCount: state.zoneUpgradeCount,
      structureUpgradeCount: state.structureUpgradeCount,
    };
  }, [state]);

  const mlGetDiveCount = useCallback((): number => {
    return state.completedDives;
  }, [state.completedDives]);

  const mlGetEarnedCoins = useCallback((): number => {
    return state.totalEarned;
  }, [state.totalEarned]);

  const mlGetProfit = useCallback((): number => {
    return state.totalEarned - state.totalSpent;
  }, [state.totalEarned, state.totalSpent]);

  const mlGetTotalSpent = useCallback((): number => {
    return state.totalSpent;
  }, [state.totalSpent]);

  // ---- NPC Interaction ----

  const mlGetNPCs = useCallback((): NPCDef[] => {
    return [...ML_NPCS];
  }, []);

  const mlGetNPCById = useCallback((id: string): NPCDef | null => {
    return ML_NPCS.find((n) => n.id === id) ?? null;
  }, []);

  const mlGetRarityInfo = useCallback((rarity: Rarity): RarityInfo | null => {
    return ML_RARITIES.find((r) => r.key === rarity) ?? null;
  }, []);

  const mlGetAllRarities = useCallback((): RarityInfo[] => {
    return [...ML_RARITIES];
  }, []);

  // ---- Utility / Misc ----

  const mlGetCreaturesByZone = useCallback((zoneId: string): CreatureDef[] => {
    return ML_CREATURES.filter((c) => c.zoneId === zoneId);
  }, []);

  const mlGetCreaturesByRarity = useCallback((rarity: Rarity): CreatureDef[] => {
    return ML_CREATURES.filter((c) => c.rarity === rarity);
  }, []);

  const mlGetCoralsByRarity = useCallback((rarity: Rarity): CoralDef[] => {
    return ML_CORALS.filter((c) => c.rarity === rarity);
  }, []);

  const mlIsDiving = useCallback((): boolean => {
    return state.divingQueue.length > 0;
  }, [state.divingQueue]);

  const mlGetMaxDiveSlots = useCallback((): number => {
    return Math.min(3, 1 + Math.floor(state.level / 15));
  }, [state.level]);

  const mlGetAvailableDiveSlots = useCallback((): number => {
    return mlGetMaxDiveSlots() - state.divingQueue.length;
  }, [state.divingQueue, mlGetMaxDiveSlots]);

  // ============================================================
  // Extended Utilities
  // ============================================================

  /** Buy multiple corals in one call, returns per-coral results. */
  const mlBatchBuyCorals = useCallback(
    (items: { coralId: string; amount: number }[]): { totalSpent: number; results: { coralId: string; success: boolean; cost: number }[]; state: MermaidLagoonState } => {
      // Pre-validate total cost
      let totalCost = 0;
      const validated: { coralId: string; amount: number; cost: number }[] = [];
      for (const item of items) {
        const def = ML_CORALS.find((c) => c.id === item.coralId);
        if (!def) continue;
        const cost = def.cost * item.amount;
        totalCost += cost;
        validated.push({ ...item, cost });
      }
      if (state.coins < totalCost) {
        return {
          totalSpent: 0,
          results: items.map((item) => ({ coralId: item.coralId, success: false, cost: 0 })),
          state,
        };
      }

      let next = state;
      const results: { coralId: string; success: boolean; cost: number }[] = [];
      setState((prev) => {
        let newCoins = prev.coins;
        const newCorals = { ...prev.corals };
        const newCountByRarity = { ...prev.coralCountByRarity };
        let spent = 0;

        for (const item of validated) {
          newCoins -= item.cost;
          spent += item.cost;
          newCorals[item.coralId] = (newCorals[item.coralId] ?? 0) + item.amount;
          const def = ML_CORALS.find((c) => c.id === item.coralId);
          if (def) newCountByRarity[def.rarity] = newCountByRarity[def.rarity] + item.amount;
          results.push({ coralId: item.coralId, success: true, cost: item.cost });
        }

        next = {
          ...prev,
          corals: newCorals,
          coins: clampCoins(newCoins),
          totalSpent: prev.totalSpent + spent,
          coralCountByRarity: newCountByRarity,
        };
        return next;
      });

      return { totalSpent: totalCost, results, state: next };
    },
    [state]
  );

  /** Find the best creature for a given zone based on profit/minute. */
  const mlGetBestCreatureForZone = useCallback(
    (zoneId: string): CreatureDef | null => {
      const creatures = ML_CREATURES.filter(
        (c) => c.zoneId === zoneId && state.unlockedCreatures.includes(c.id) && state.level >= c.requiredLevel
      );
      if (creatures.length === 0) return null;
      const depthMult = mlGetZoneDepthBonus(zoneId);
      return creatures.reduce((best, creature) => {
        const adjustedTime = Math.max(5, creature.diveTime / depthMult);
        const profitPerMin = creature.discoverValue / (adjustedTime / 60);
        const bestTime = Math.max(5, best.diveTime / depthMult);
        const bestProfit = best.discoverValue / (bestTime / 60);
        return profitPerMin > bestProfit ? creature : best;
      });
    },
    [state.unlockedCreatures, state.level, mlGetZoneDepthBonus]
  );

  /** Find the most profitable creature among all unlocked creatures. */
  const mlGetMostProfitableCreature = useCallback((): CreatureDef | null => {
    const unlocked = ML_CREATURES.filter((c) => state.unlockedCreatures.includes(c.id) && state.level >= c.requiredLevel);
    if (unlocked.length === 0) return null;
    return unlocked.reduce((best, creature) => (creature.discoverValue > best.discoverValue ? creature : best));
  }, [state.unlockedCreatures, state.level]);

  /** Get all creatures the player can afford the corals for. */
  const mlGetAffordableCreatures = useCallback((): CreatureDef[] => {
    return ML_CREATURES.filter((creature) => {
      if (!state.unlockedCreatures.includes(creature.id)) return false;
      if (state.level < creature.requiredLevel) return false;
      let cost = 0;
      for (const c of creature.corals) {
        const def = ML_CORALS.find((co) => co.id === c.coralId);
        if (def) cost += def.cost * Math.max(0, c.amount - (state.corals[c.coralId] ?? 0));
      }
      return state.coins >= cost;
    });
  }, [state.unlockedCreatures, state.level, state.coins, state.corals]);

  /** Get all creatures the player has all corals for and zone matches. */
  const mlGetDiveableCreatures = useCallback((): CreatureDef[] => {
    return ML_CREATURES.filter((creature) => {
      if (!state.unlockedCreatures.includes(creature.id)) return false;
      if (state.level < creature.requiredLevel) return false;
      if (state.activeZone !== creature.zoneId) return false;
      return creature.corals.every((c) => (state.corals[c.coralId] ?? 0) >= c.amount);
    });
  }, [state.unlockedCreatures, state.level, state.activeZone, state.corals]);

  /** Get a comprehensive summary of the lagoon state. */
  const mlGetLagoonSummary = useCallback((): {
    lagoonName: string;
    level: number;
    title: TitleInfo;
    coins: number;
    xp: number;
    xpTillNext: number;
    progress: number;
    creaturesUnlocked: number;
    creaturesTotal: number;
    zonesExplored: number;
    structuresEquipped: number;
    creaturesDiscovered: number;
    reefHealth: number;
    dailyStreak: number;
    totalDives: number;
    expeditionWins: number;
    netWorth: number;
  } => {
    const title = (() => {
      let current = ML_TITLE_THRESHOLDS[0];
      for (const t of ML_TITLE_THRESHOLDS) {
        if (state.level >= t.levelRequired) current = t;
      }
      return current;
    })();
    const inventoryValue = Object.entries(state.corals).reduce((sum, [id, qty]) => {
      const def = ML_CORALS.find((c) => c.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
    return {
      lagoonName: 'Mermaid Lagoon',
      level: state.level,
      title,
      coins: state.coins,
      xp: state.xp,
      xpTillNext: xpRequiredForLevel(state.level),
      progress: xpRequiredForLevel(state.level) > 0 ? state.xp / xpRequiredForLevel(state.level) : 1,
      creaturesUnlocked: state.unlockedCreatures.length,
      creaturesTotal: ML_CREATURES.length,
      zonesExplored: state.zones.filter((z) => z.level > 1).length,
      structuresEquipped: state.structures.filter((s) => s.equipped).length,
      creaturesDiscovered: state.discoveredCreatures,
      reefHealth: state.reefHealth,
      dailyStreak: state.dailyStreak,
      totalDives: state.completedDives,
      expeditionWins: state.expeditionWins,
      netWorth: state.coins + inventoryValue,
    };
  }, [state]);

  /** Get tips/hints for the current lagoon state. */
  const mlGetOceanTips = useCallback((): string[] => {
    const tips: string[] = [];

    // Tip about locked creatures
    const lockedCount = ML_CREATURES.filter(
      (c) => !state.unlockedCreatures.includes(c.id) && state.level >= c.requiredLevel
    ).length;
    if (lockedCount > 0) {
      tips.push(`You have ${lockedCount} creature(s) available to unlock at your current level!`);
    }

    // Tip about zone upgrades
    const lowestZone = state.zones.reduce(
      (min, z) => (z.level < min.level ? z : min),
      state.zones[0]
    );
    const lowestDef = ML_ZONES.find((z) => z.id === lowestZone.id);
    if (lowestZone.level < 3 && lowestDef) {
      tips.push(`Consider upgrading ${lowestDef.name} — higher levels improve depth and charm!`);
    }

    // Tip about reef health
    if (state.reefHealth < 50) {
      tips.push('Reef health is low — try taming creatures in their favorite zones for a boost!');
    }

    // Tip about structures
    const unequippedDepth = state.structures.find(
      (s) => !s.equipped && ML_STRUCTURES.find((d) => d.id === s.id)?.bonusType === 'depth'
    );
    if (unequippedDepth) {
      const def = ML_STRUCTURES.find((d) => d.id === unequippedDepth.id);
      if (def) tips.push(`Equip ${def.name} to speed up your diving!`);
    }

    // Tip about daily streak
    if (state.dailyStreak > 0 && state.dailyStreak % 7 === 0) {
      tips.push(`Amazing ${state.dailyStreak}-day streak! Daily rewards get a ${Math.floor(state.dailyStreak * 5)}% bonus!`);
    }

    // Tip about corals running low
    const lowCorals = ML_CORALS.filter(
      (c) => (state.corals[c.id] ?? 0) < 3 && state.unlockedCreatures.some((cr) =>
        ML_CREATURES.find((cu) => cu.id === cr)?.corals.some((co) => co.coralId === c.id)
      )
    );
    if (lowCorals.length > 0) {
      const names = lowCorals.slice(0, 3).map((c) => c.name).join(', ');
      tips.push(`Running low on: ${names}. Stock up before your next diving session!`);
    }

    // Tip about quests
    const completableQuests = state.activeQuests.filter((q) => q.completed && !state.completedQuests.includes(q.id));
    if (completableQuests.length > 0) {
      tips.push(`You have ${completableQuests.length} quest(s) ready to claim rewards for!`);
    }

    // Tip about level
    if (state.level < 10) {
      tips.push('Keep diving to level up! Higher levels unlock rare creatures and deeper zones.');
    } else if (state.level < 25) {
      tips.push('Epic and legendary creatures await at higher levels — keep exploring!');
    } else if (state.level >= 40) {
      tips.push('You are approaching the pinnacle of ocean mastery. Mythic creatures are within reach!');
    }

    // Tip about expeditions
    if (state.expeditionEntries > 0 && state.expeditionWins === 0) {
      tips.push('Try improving your zone charm and structure bonuses to win an expedition!');
    }

    if (tips.length === 0) {
      tips.push('Your lagoon is thriving! Keep diving, discovering, and building your reef.');
    }

    return tips;
  }, [state]);

  /** Calculate the efficiency (coins per XP per second) for a creature dive. */
  const mlCalculateDiveEfficiency = useCallback(
    (creatureId: string): { coinsPerSecond: number; xpPerSecond: number; overallScore: number } => {
      const creature = ML_CREATURES.find((c) => c.id === creatureId);
      if (!creature) return { coinsPerSecond: 0, xpPerSecond: 0, overallScore: 0 };

      const depthMult = mlGetZoneDepthBonus(creature.zoneId);
      const adjustedTime = Math.max(1, creature.diveTime / depthMult);

      const coinsPerSecond = creature.discoverValue / adjustedTime;
      const xpPerSecond = creature.xpReward / adjustedTime;
      const overallScore = coinsPerSecond + xpPerSecond * 2;

      return { coinsPerSecond: Math.round(coinsPerSecond * 100) / 100, xpPerSecond: Math.round(xpPerSecond * 100) / 100, overallScore: Math.round(overallScore * 100) / 100 };
    },
    [mlGetZoneDepthBonus]
  );

  /** Get recommended upgrades based on current state and budget. */
  const mlGetRecommendedUpgrades = useCallback(
    (budget: number): { type: 'zone' | 'structure'; id: string; name: string; cost: number; priority: number }[] => {
      const recommendations: { type: 'zone' | 'structure'; id: string; name: string; cost: number; priority: number }[] = [];

      // Evaluate zone upgrades
      for (const z of state.zones) {
        const def = ML_ZONES.find((zz) => z.id === zz.id);
        if (!def || z.level >= def.maxLevel) continue;
        const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.6, z.level - 1));
        if (cost > budget) continue;
        const isActive = z.id === state.activeZone;
        const priority = (isActive ? 10 : 5) + (def.maxLevel - z.level) * 2 + def.baseCharmBonus;
        recommendations.push({ type: 'zone', id: z.id, name: def.name, cost, priority });
      }

      // Evaluate structure upgrades
      for (const ss of state.structures) {
        const def = ML_STRUCTURES.find((s) => s.id === ss.id);
        if (!def || ss.level >= def.maxLevel) continue;
        const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, ss.level - 1));
        if (cost > budget) continue;
        const isEquipped = ss.equipped;
        const typeBonus = def.bonusType === 'luck' ? 8 : def.bonusType === 'charm' ? 6 : def.bonusType === 'depth' ? 5 : 3;
        const priority = (isEquipped ? 10 : 3) + typeBonus + (def.maxLevel - ss.level);
        recommendations.push({ type: 'structure', id: ss.id, name: def.name, cost, priority });
      }

      recommendations.sort((a, b) => b.priority - a.priority);
      return recommendations;
    },
    [state.zones, state.structures, state.activeZone]
  );

  /** Simulate a dive without actually diving — returns projected results. */
  const mlSimulateDive = useCallback(
    (creatureId: string): {
      creature: CreatureDef | null;
      canDive: boolean;
      estimatedTime: number;
      estimatedQuality: number;
      estimatedCoins: number;
      estimatedXP: number;
      missingCorals: { coralId: string; name: string; have: number; need: number }[];
      reason: string;
    } => {
      const creature = ML_CREATURES.find((c) => c.id === creatureId);
      if (!creature) return { creature: null, canDive: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingCorals: [], reason: 'Creature not found' };
      if (!state.unlockedCreatures.includes(creatureId)) return { creature, canDive: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingCorals: [], reason: 'Creature is locked' };
      if (state.level < creature.requiredLevel) return { creature, canDive: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingCorals: [], reason: `Requires level ${creature.requiredLevel}` };
      if (state.activeZone !== creature.zoneId) {
        const zoneDef = ML_ZONES.find((z) => z.id === creature.zoneId);
        return { creature, canDive: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingCorals: [], reason: `Requires zone: ${zoneDef?.name ?? creature.zoneId}` };
      }

      const missingCorals = creature.corals
        .map((c) => {
          const def = ML_CORALS.find((co) => co.id === c.coralId);
          const have = state.corals[c.coralId] ?? 0;
          return { coralId: c.coralId, name: def?.name ?? c.coralId, have, need: c.amount };
        })
        .filter((m) => m.have < m.need);

      if (missingCorals.length > 0) return { creature, canDive: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingCorals, reason: 'Missing corals' };
      if (state.divingQueue.length >= mlGetMaxDiveSlots()) return { creature, canDive: false, estimatedTime: 0, estimatedQuality: 0, estimatedCoins: 0, estimatedXP: 0, missingCorals: [], reason: 'All dive slots are full' };

      // Calculate estimates
      const depthMult = mlGetZoneDepthBonus(creature.zoneId);
      const estimatedTime = Math.max(5, Math.floor(creature.diveTime / depthMult));
      const charmBase = mlGetZoneCharmBonus(creature.zoneId);
      const estimatedQuality = Math.min(100, 50 + charmBase + 5);
      const qualityMult = estimatedQuality / 100;
      const rarityMult = rarityMultiplier(creature.rarity);
      const estimatedCoins = Math.floor(creature.discoverValue * qualityMult * (0.8 + rarityMult * 0.2));
      const estimatedXP = Math.floor(creature.xpReward * qualityMult * rarityMult);

      return { creature, canDive: true, estimatedTime, estimatedQuality, estimatedCoins, estimatedXP, missingCorals: [], reason: 'Ready to dive' };
    },
    [state.unlockedCreatures, state.level, state.activeZone, state.corals, state.divingQueue, mlGetMaxDiveSlots, mlGetZoneDepthBonus, mlGetZoneCharmBonus]
  );

  /** Get distribution of unlocked creatures by rarity. */
  const mlGetCreatureRarityDistribution = useCallback((): Record<Rarity, { total: number; unlocked: number }> => {
    const result: Record<Rarity, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      uncommon: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
      mythic: { total: 0, unlocked: 0 },
    };
    for (const creature of ML_CREATURES) {
      result[creature.rarity].total += 1;
      if (state.unlockedCreatures.includes(creature.id)) {
        result[creature.rarity].unlocked += 1;
      }
    }
    return result;
  }, [state.unlockedCreatures]);

  /** Get the total coin value of all corals in inventory. */
  const mlGetInventoryValue = useCallback((): number => {
    return Object.entries(state.corals).reduce((sum, [id, qty]) => {
      const def = ML_CORALS.find((c) => c.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
  }, [state.corals]);

  /** Get net worth: coins + inventory value. */
  const mlGetNetWorth = useCallback((): number => {
    const inventoryValue = Object.entries(state.corals).reduce((sum, [id, qty]) => {
      const def = ML_CORALS.find((c) => c.id === id);
      return sum + (def?.cost ?? 0) * qty;
    }, 0);
    return state.coins + inventoryValue;
  }, [state.coins, state.corals]);

  // ============================================================
  // Return all functions
  // ============================================================

  return {
    mlGetState,
    mlResetState,
    mlSeed,
    mlRandom,
    mlRandomInt,
    mlRandomChoice,
    mlGetLevel,
    mlGetXP,
    mlGetXPTillNext,
    mlGetXPTotal,
    mlAddXP,
    mlGetTitle,
    mlGetAllTitles,
    mlGetNextTitle,
    mlGetProgress,
    mlGetOverallProgress,
    mlGetCoins,
    mlAddCoins,
    mlSpendCoins,
    mlCanAfford,
    mlGetCreatures,
    mlGetUnlockedCreatures,
    mlGetLockedCreatures,
    mlGetCreatureById,
    mlIsCreatureUnlocked,
    mlUnlockCreature,
    mlGetZones,
    mlGetZoneLevels,
    mlGetActiveZone,
    mlSetActiveZone,
    mlGetZoneLevel,
    mlGetZoneDepthBonus,
    mlGetZoneCharmBonus,
    mlUpgradeZone,
    mlGetCorals,
    mlGetCoralById,
    mlGetInventory,
    mlGetCoralCount,
    mlGetCoralCost,
    mlBuyCoral,
    mlUseCoral,
    mlHasCorals,
    mlGetMissingCorals,
    mlDive,
    mlGetDivingQueue,
    mlCancelDive,
    mlCollectDive,
    mlGetDiveTimeRemaining,
    mlGetCreatureProfit,
    mlGetTreasures,
    mlGetActiveEncounters,
    mlSpawnEncounter,
    mlTameEncounter,
    mlDismissEncounter,
    mlGetReefHealth,
    mlGetEncounterTreasure,
    mlAutoSpawnEncounters,
    mlGetStructures,
    mlGetStructureStates,
    mlGetEquippedStructures,
    mlGetStructureLevel,
    mlGetStructureBonus,
    mlEquipStructure,
    mlUpgradeStructure,
    mlGetQuests,
    mlGetActiveQuests,
    mlGetAvailableQuests,
    mlGetCompletedQuests,
    mlAcceptQuest,
    mlGetQuestProgress,
    mlCompleteQuest,
    mlAbandonQuest,
    mlGetAchievements,
    mlGetUnlockedAchievements,
    mlIsAchievementUnlocked,
    mlCheckAchievements,
    mlUnlockAchievement,
    mlGetDailyTask,
    mlRefreshDailyTask,
    mlClaimDailyReward,
    mlGetDailyStreak,
    mlGetLastDaily,
    mlEnterExpedition,
    mlGetExpeditionRank,
    mlGetExpeditionStats,
    mlGetStats,
    mlGetDiveCount,
    mlGetEarnedCoins,
    mlGetProfit,
    mlGetTotalSpent,
    mlGetNPCs,
    mlGetNPCById,
    mlGetRarityInfo,
    mlGetAllRarities,
    mlGetCreaturesByZone,
    mlGetCreaturesByRarity,
    mlGetCoralsByRarity,
    mlIsDiving,
    mlGetMaxDiveSlots,
    mlGetAvailableDiveSlots,
    // -- Extended utilities --
    mlBatchBuyCorals,
    mlGetBestCreatureForZone,
    mlGetMostProfitableCreature,
    mlGetAffordableCreatures,
    mlGetDiveableCreatures,
    mlGetLagoonSummary,
    mlGetOceanTips,
    mlCalculateDiveEfficiency,
    mlGetRecommendedUpgrades,
    mlSimulateDive,
    mlGetCreatureRarityDistribution,
    mlGetInventoryValue,
    mlGetNetWorth,
  };
}

// ============================================================
// Internal Quest Progress Helper (not exported)
// ============================================================

function mlProcessQuestProgress(
  state: MermaidLagoonState,
  type: QuestType,
  amount: number
): MermaidLagoonState {
  let updated = state;
  for (const aq of updated.activeQuests) {
    if (aq.completed) continue;
    const def = ML_QUESTS.find((q) => q.id === aq.id);
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

export default useMermaidLagoon;
